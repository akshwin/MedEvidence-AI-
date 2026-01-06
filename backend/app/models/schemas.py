"""
Pydantic models for API requests/responses
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class Citation(BaseModel):
    """Citation model"""
    pmid: str
    title: str
    authors: List[str]
    year: Optional[int] = None
    journal: Optional[str] = None
    relevance_score: Optional[float] = None


class QueryRequest(BaseModel):
    """Request model for query endpoint"""
    query: str = Field(..., description="User's research question")
    language: Optional[str] = Field("en", description="Target language code (e.g., 'en', 'es', 'fr')")
    auto_detect_language: Optional[bool] = Field(True, description="Auto-detect query language")


class QueryResponse(BaseModel):
    """Response model for query endpoint"""
    answer: str = Field(..., description="AI-generated answer")
    citations: List[Citation] = Field(default_factory=list, description="List of citations")
    metadata: Optional[Dict[str, Any]] = None
    detected_language: Optional[str] = Field(None, description="Detected language of the query")
    target_language: Optional[str] = Field(None, description="Target language for the answer")


class Paper(BaseModel):
    """Paper model"""
    pmid: str
    title: str
    abstract: str
    authors: List[str]
    year: Optional[int] = None
    journal: Optional[str] = None


class SearchRequest(BaseModel):
    """Request model for search endpoint with advanced filters"""
    query: str = Field(..., description="Search query")
    limit: Optional[int] = Field(10, ge=1, le=50, description="Number of results")
    language: Optional[str] = Field("en", description="Target language code (e.g., 'en', 'es', 'fr')")
    auto_detect_language: Optional[bool] = Field(True, description="Auto-detect query language")
    include_non_english: Optional[bool] = Field(False, description="Include non-English papers in results")
    
    # Advanced filters
    year_from: Optional[int] = Field(None, ge=1900, le=2100, description="Filter papers from this year onwards")
    year_to: Optional[int] = Field(None, ge=1900, le=2100, description="Filter papers up to this year")
    journal: Optional[str] = Field(None, description="Filter by journal name")
    study_type: Optional[str] = Field(None, description="Filter by study type (RCT, meta-analysis, systematic review, etc.)")
    author: Optional[str] = Field(None, description="Filter by author name")
    mesh_terms: Optional[List[str]] = Field(None, description="Filter by MeSH terms")
    
    # Search options
    search_fields: Optional[List[str]] = Field(None, description="Fields to search in: title, abstract, author, all")
    boolean_operator: Optional[str] = Field("AND", description="Boolean operator: AND, OR, NOT")
    
    # Sort options
    sort_by: Optional[str] = Field("relevance", description="Sort by: relevance, date, citations")
    sort_order: Optional[str] = Field("desc", description="Sort order: asc, desc")


class SearchResponse(BaseModel):
    """Response model for search endpoint"""
    papers: List[Paper]
    total: int

