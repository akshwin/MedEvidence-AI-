"""
Citation Service - Handles citation extraction and formatting
"""

from typing import List, Dict
from app.models.schemas import Citation


class CitationService:
    """Service for citation handling"""

    def extract_citations(self, papers: List[Dict]) -> List[Citation]:
        """
        Extract citations from retrieved papers

        Args:
            papers: List of paper dictionaries

        Returns:
            List of Citation models
        """
        citations = []

        for i, paper in enumerate(papers, 1):
            # Use relevance_score from paper if available (from PubMed fetcher scoring)
            relevance_score = paper.get("relevance_score")
            if relevance_score is None:
                # Fallback to "score" if relevance_score not available
                relevance_score = paper.get("score")
            if relevance_score is None:
                # Default relevance based on position (first papers are more relevant)
                relevance_score = max(0.9 - (i * 0.1), 0.5)

            citation = Citation(
                pmid=paper.get("pmid", ""),
                title=paper.get("title", ""),
                authors=paper.get("authors", []),
                year=paper.get("year"),
                journal=paper.get("journal", ""),
                relevance_score=relevance_score,
            )
            citations.append(citation)

        return citations
