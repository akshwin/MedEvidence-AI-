"""
RAG (Retrieval-Augmented Generation) Pipeline
"""

import re
from datetime import datetime
from typing import List, Dict
from app.services.llm import LLMService
from app.services.citation import CitationService
import logging

logger = logging.getLogger(__name__)


class RAGPipeline:
    """Main RAG pipeline for query processing"""

    def __init__(self):
        # Lazily initialize LLM so the API can start even if GROQ_API_KEY is not set.
        # The query endpoint will return a helpful error until the key is configured.
        self.llm = None
        self.citation_service = CitationService()

    async def process_query(self, query: str) -> Dict:
        """
        Process a user query through the RAG pipeline
        ALWAYS uses PubMed papers - never relies on LLM general knowledge

        Args:
            query: User's question

        Returns:
            Dict with answer, citations, and metadata
        """
        relevant_papers = []
        source = "none"

        # ALWAYS search PubMed directly (skip vector DB)
        # This ensures we always have real medical papers, not just LLM knowledge
        logger.info("Searching PubMed for medical literature...")
        try:
            from data.pubmed_fetcher import PubMedFetcher

            fetcher = PubMedFetcher()
            # "latest/recent/new..." questions get a 3-year window
            year_from = None
            if re.search(
                r"\b(latest|recent|new|newest|emerging|current|novel)\b", query, re.IGNORECASE
            ):
                year_from = datetime.now().year - 3
            # Let the LLM write a proper PubMed query (MeSH + synonyms); fall back to the raw question
            pubmed_query = None
            try:
                if self.llm is None:
                    self.llm = LLMService()
                pubmed_query = await self.llm.build_pubmed_query(query)
                logger.info(f"PubMed query: {pubmed_query}")
            except Exception as e:
                logger.warning(f"Query rewrite failed, using keyword search: {e}")

            # Prefer clinical evidence; fall back to all article types if too few hits
            pubmed_papers = []
            if pubmed_query:
                # Wide candidate pool in PubMed Best Match order; the LLM picks the final 8 below
                pubmed_papers = fetcher.fetch_abstracts(
                    pubmed_query,
                    max_results=30,
                    year_from=year_from,
                    evidence_only=True,
                    keyword_rerank=False,
                )
                if len(pubmed_papers) < 3:
                    pubmed_papers = fetcher.fetch_abstracts(
                        pubmed_query, max_results=30, year_from=year_from, keyword_rerank=False
                    )
            if len(pubmed_papers) < 3:
                pubmed_query = None
                pubmed_papers = fetcher.fetch_abstracts(
                    query, max_results=8, year_from=year_from, evidence_only=True
                )
                if len(pubmed_papers) < 3:
                    pubmed_papers = fetcher.fetch_abstracts(
                        query, max_results=8, year_from=year_from
                    )

            # Re-rank candidates by meaning, not keyword counts
            if pubmed_query and len(pubmed_papers) > 8:
                try:
                    reranked = await self.llm.rerank_papers(query, pubmed_papers, top_n=8)
                    pubmed_papers = reranked or pubmed_papers[:8]
                except Exception as e:
                    logger.warning(f"Re-rank failed, using PubMed order: {e}")
                    pubmed_papers = pubmed_papers[:8]
            if pubmed_papers:
                relevant_papers = pubmed_papers
                source = "pubmed_direct"
                logger.info(f"Found {len(relevant_papers)} papers from PubMed")
            else:
                logger.warning("No papers found in PubMed")
                source = "none"
        except Exception as e:
            logger.exception(f"Error fetching from PubMed: {e}")
            source = "error"

        # 3. If no papers found at all, return error (don't use LLM general knowledge)
        if not relevant_papers:
            return {
                "answer": "I apologize, but I couldn't find any relevant medical literature for your query. Please try rephrasing your question or check if the topic exists in PubMed.",
                "citations": [],
                "metadata": {
                    "papers_retrieved": 0,
                    "query": query,
                    "source": source,
                    "warning": "No papers found - answer not generated from medical literature",
                },
            }

        # 4. Build context from papers
        context = self._build_context(relevant_papers)
        logger.info(f"Built context from {len(relevant_papers)} papers")

        # 5. Generate answer using LLM WITH STRICT INSTRUCTIONS to use only provided papers
        try:
            if self.llm is None:
                self.llm = LLMService()
            answer = await self.llm.generate_answer(query, context)
        except Exception as e:
            # Return a helpful message instead of crashing the API if the LLM isn't configured.
            return {
                "answer": f"LLM is not configured or failed to run. Please set GROQ_API_KEY on the backend. Details: {str(e)}",
                "citations": self.citation_service.extract_citations(relevant_papers),
                "metadata": {
                    "papers_retrieved": len(relevant_papers),
                    "query": query,
                    "source": source,
                    "evidence_based": True,
                    "warning": "LLM not configured; returned citations only",
                },
            }

        # 6. Extract citations
        citations = self.citation_service.extract_citations(relevant_papers)

        return {
            "answer": answer,
            "citations": citations,
            "metadata": {
                "papers_retrieved": len(relevant_papers),
                "query": query,
                "source": source,
                "evidence_based": True,
            },
        }

    def _build_context(self, papers: List[Dict]) -> str:
        """Build context string from retrieved papers with proper citation format"""
        context_parts = []

        for i, paper in enumerate(papers, 1):
            title = paper.get("title", "N/A")
            authors = paper.get("authors", [])
            year = paper.get("year", "N/A")
            journal = paper.get("journal", "N/A")
            pmid = paper.get("pmid", "N/A")
            # ponytail: char cap keeps 8 papers under Groq free-tier 8k TPM; raise if on a paid tier
            abstract = paper.get("abstract", "N/A")[:1500]

            # Format authors (first author et al. if multiple)
            if authors:
                if len(authors) == 1:
                    author_str = authors[0]
                elif len(authors) == 2:
                    author_str = f"{authors[0]} and {authors[1]}"
                else:
                    author_str = f"{authors[0]} et al."
            else:
                author_str = "Unknown authors"

            # Build proper citation format for LLM to use
            # Format: Author et al. (Year) - Title
            citation_short = f"{author_str} ({year})"
            citation_full = f"{author_str} ({year}). {title}. {journal}."

            context_parts.append(
                f"Reference {i}: {citation_short}\n"
                f"Full Citation: {citation_full}\n"
                f"Title: {title}\n"
                f"Authors: {author_str}\n"
                f"Year: {year}\n"
                f"Journal: {journal}\n"
                f"PMID: {pmid}\n"
                f"Abstract: {abstract}\n"
            )

        return "\n\n".join(context_parts)
