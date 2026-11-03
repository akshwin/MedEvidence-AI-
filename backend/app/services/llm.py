"""
LLM Service - Handles LLM interactions using Groq
"""

import os
import re
import json
from typing import List, Dict, Optional
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from app.core.config import settings


class LLMService:
    """Service for LLM interactions using Groq"""

    def __init__(self):
        # Set Groq API key from environment or config (never hardcode secrets)
        groq_api_key = os.environ.get("GROQ_API_KEY") or settings.groq_api_key
        if not groq_api_key:
            raise RuntimeError(
                "GROQ_API_KEY is not configured. Set it as an environment variable to enable LLM answers."
            )

        # Set environment variable for Groq (in case it's needed)
        os.environ["GROQ_API_KEY"] = groq_api_key

        self.llm = ChatGroq(
            model_name=settings.llm_model,
            temperature=settings.temperature,
            max_tokens=settings.max_tokens,
            groq_api_key=groq_api_key,
        )
        # Separate model (and Groq rate-limit bucket) for the short retrieval helper calls
        self.helper_llm = ChatGroq(
            model_name=settings.llm_helper_model,
            temperature=0,
            max_tokens=3000,
            reasoning_effort="low",  # gpt-oss reasoning otherwise eats the token budget
            groq_api_key=groq_api_key,
        )

    async def generate_answer(self, query: str, context: str) -> str:
        """
        Generate answer using LLM with context

        Args:
            query: User's question
            context: Retrieved paper context

        Returns:
            Generated answer
        """
        prompt = self._build_prompt(query, context)

        # Use LangChain's async invoke for async support
        messages = [
            SystemMessage(
                content="You are a medical research assistant. Provide evidence-based answers based on medical literature."
            ),
            HumanMessage(content=prompt),
        ]

        response = await self.llm.ainvoke(messages)
        return response.content

    async def build_pubmed_query(self, question: str) -> Optional[str]:
        """Turn a natural-language question into a PubMed boolean query (None if unusable)"""
        messages = [
            SystemMessage(
                content="You are an expert medical librarian who writes PubMed search queries."
            ),
            HumanMessage(
                content=f"""Write a PubMed query that finds papers directly answering this question.

Rules:
- Combine concepts with AND; within a concept, OR together the MeSH term ("..."[MeSH Terms]) and free-text synonyms ([tiab]).
- For treatment questions, include therapy synonyms and the major drug classes / interventions for the condition.
- Do NOT add date, language or publication-type filters, and do not add words like "latest", "new" or "recent" (recency is filtered separately).
- Reply with the query only, on one line, no explanation.

Question: {question}"""
            ),
        ]
        response = await self.helper_llm.ainvoke(messages)
        return self.clean_pubmed_query(response.content)

    async def rerank_papers(self, question: str, papers: List[Dict], top_n: int) -> List[Dict]:
        """Keep the papers that actually answer the question, most relevant first"""
        listing = "\n".join(
            f"[{i}] {p.get('title', '')} ({p.get('year', '')}) - {p.get('abstract', '')[:200]}"
            for i, p in enumerate(papers)
        )
        messages = [
            SystemMessage(content="You are a medical research assistant ranking search results."),
            HumanMessage(
                content=f"""Question: {question}

Papers:
{listing}

Return a JSON array of the indices of papers that directly help answer the question, most relevant first, at most {top_n}. Omit papers that are only loosely related (e.g. about risk factors when the question asks about treatments). Reply with the JSON array only."""
            ),
        ]
        response = await self.helper_llm.ainvoke(messages)
        indices = self.parse_indices(response.content, len(papers))
        return [papers[i] for i in indices[:top_n]]

    @staticmethod
    def clean_pubmed_query(text: str) -> Optional[str]:
        """Strip code fences/labels; reject replies that don't look like a query"""
        text = re.sub(r"```\w*", "", text or "").strip()
        text = re.sub(r"^(pubmed )?query:\s*", "", text, flags=re.IGNORECASE)
        text = " ".join(text.split())
        if not text or len(text) > 1500 or text.count("(") != text.count(")"):
            return None
        return text

    @staticmethod
    def parse_indices(text: str, n: int) -> List[int]:
        """Parse a JSON index array from an LLM reply; drop invalid/duplicate entries"""
        match = re.search(r"\[[\d,\s]*\]", text or "")
        if not match:
            return []
        seen = []
        for i in json.loads(match.group(0)):
            if 0 <= i < n and i not in seen:
                seen.append(i)
        return seen

    def _build_prompt(self, query: str, context: str) -> str:
        """Build prompt for LLM with STRICT instructions to use only provided papers"""
        return f"""You are a medical research assistant. You MUST answer the question based ONLY on the provided research papers from PubMed. DO NOT use your general knowledge or training data.

CRITICAL FORMATTING INSTRUCTIONS:
- Structure your answer with clear headings and subheadings using markdown
- Use ## for main topic headings (e.g., "## Treatment Approaches")
- Use ### for paper author names as subheadings (e.g., "### Zhao et al. (2025)")
- Group related findings under main headings
- DO NOT include a "References:" section at the end
- DO NOT include "## Conclusion" or "## Summary" sections
- DO NOT list references separately - integrate citations naturally in the text
- Write content under each paper subheading describing findings from that paper
- End your answer after the last paper's content - no conclusion or references section

CRITICAL CITATION INSTRUCTIONS:
- When citing research, ALWAYS use the author names and year from the references below
- Format citations naturally: "According to [Author et al. (Year)]..." or "([Author et al., Year])"
- Use paper author names as subheadings: ### Author et al. (Year)
- DO NOT use generic terms like "Paper 1", "Paper 2", "Reference 1", etc.
- Always include the author name(s) and year when citing

CRITICAL CONTENT INSTRUCTIONS:
- You MUST base your answer ONLY on the papers provided below
- DO NOT use information from your training data
- DO NOT make up facts or cite papers not in the context
- If the provided papers don't contain enough information, explicitly state: "Based on the available research, [limited answer]. More research may be needed."
- Be precise, evidence-based, and professional
- Write in a natural, flowing style while maintaining scientific accuracy

EXAMPLE FORMAT:
## Main Topic Heading

### Author Name et al. (Year)
[Content from this paper]

### Another Author et al. (Year)
[Content from this paper]

## Another Main Topic Heading

### Author Name et al. (Year)
[Content from this paper]

Research Papers from PubMed:
{context}

Question: {query}

Answer (structured with headings, paper names as subheadings, NO references section at the end):"""
