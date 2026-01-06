"""
Search endpoint - Find papers from PubMed
"""

from fastapi import APIRouter, HTTPException, Query, Depends
from starlette.requests import Request
from typing import List, Optional
from app.models.schemas import Paper, SearchRequest, SearchResponse
from app.api.routes.auth import get_current_user, get_current_user_optional
from app.models.user import User
from app.database import get_db
from sqlalchemy.orm import Session
from app.services.translation_service import translation_service

router = APIRouter()


@router.get("/papers/{paper_id}", response_model=Paper)
async def get_paper_by_id(paper_id: str):
    """Get a single paper by its PMID"""
    try:
        from data.pubmed_fetcher import PubMedFetcher
        fetcher = PubMedFetcher()
        
        papers = fetcher.fetch_abstracts(f"{paper_id}[PMID]", max_results=1)
        
        if not papers or len(papers) == 0:
            raise HTTPException(status_code=404, detail="Paper not found")
        
        paper = papers[0]
        year = paper.get("year")
        year_int = None
        if year and year != "N/A":
            try:
                year_str = str(year).split("-")[0].strip()
                if year_str.isdigit():
                    year_int = int(year_str)
                    from datetime import datetime
                    current_year = datetime.now().year
                    if year_int < 1900 or year_int > current_year + 1:
                        year_int = None
            except (ValueError, AttributeError):
                year_int = None
        
        return Paper(
            pmid=paper.get("pmid", ""),
            title=paper.get("title", ""),
            abstract=paper.get("abstract", ""),
            authors=paper.get("authors", []),
            year=year_int,
            journal=paper.get("journal", "")
        )
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error fetching paper: {str(e)}")


@router.post("", response_model=SearchResponse)
@router.post("/", response_model=SearchResponse)
async def search_papers(request: SearchRequest):
    """
    Search for papers from PubMed with advanced filters
    
    Supports multi-language queries and can include non-English papers.
    
    Args:
        request: SearchRequest with search query, limit, filters, and language preferences
        
    Returns:
        SearchResponse with list of papers
    """
    try:
        # Detect language if auto-detect is enabled
        detected_lang = None
        if request.auto_detect_language:
            detected_lang = translation_service.detect_language(request.query)
        
        # Determine target language
        target_lang = request.language or detected_lang or 'en'
        
        # Translate query to English for PubMed search (PubMed primarily uses English)
        original_query = request.query
        if detected_lang and detected_lang != 'en':
            # Translate query to English for better PubMed results
            translated_query = translation_service.translate_query(original_query, target_lang='en')
        else:
            translated_query = original_query
        
        # Use PubMed directly (same as query endpoint)
        from data.pubmed_fetcher import PubMedFetcher
        fetcher = PubMedFetcher()
        
        # Fetch papers from PubMed with filters
        limit = request.limit or 10
        pubmed_papers = fetcher.fetch_abstracts(
            query=translated_query,
            max_results=limit,
            year_from=request.year_from,
            year_to=request.year_to,
            journal=request.journal,
            study_type=request.study_type,
            author=request.author,
            mesh_terms=request.mesh_terms,
            search_fields=request.search_fields,
            boolean_operator=request.boolean_operator or "AND",
            sort_by=request.sort_by or "relevance",
            language=target_lang if request.include_non_english else 'en'
        )
        
        if not pubmed_papers:
            return SearchResponse(
                papers=[],
                total=0
            )
        
        # Convert to Paper models
        paper_models = []
        for paper in pubmed_papers:
            # Convert year to int if possible
            year = paper.get("year")
            year_int = None
            if year and year != "N/A":
                try:
                    # Extract year from string (e.g., "2024" or "2024-01-01")
                    year_str = str(year).split("-")[0].strip()
                    if year_str.isdigit():
                        year_int = int(year_str)
                        # Validate year is reasonable (not in future, not too old)
                        from datetime import datetime
                        current_year = datetime.now().year
                        if year_int < 1900 or year_int > current_year + 1:
                            year_int = None  # Invalid year, set to None
                except (ValueError, AttributeError):
                    year_int = None
            
            paper_models.append(
                Paper(
                    pmid=paper.get("pmid", ""),
                    title=paper.get("title", ""),
                    abstract=paper.get("abstract", ""),
                    authors=paper.get("authors", []),
                    year=year_int,
                    journal=paper.get("journal", "")
                )
            )
        
        return SearchResponse(
            papers=paper_models,
            total=len(paper_models)
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error searching papers: {str(e)}")


@router.get("/papers/{paper_id}/related", response_model=SearchResponse)
async def get_related_papers(
    paper_id: str,
    request: Request,
    limit: int = Query(2, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """
    Get related papers based on a paper ID
    Uses PubMed's related articles feature
    """
    current_user = await get_current_user_optional(request, db)
    try:
        from data.pubmed_fetcher import PubMedFetcher
        fetcher = PubMedFetcher()
        
        # Use keyword-based search directly (faster than elink)
        related_papers = fetcher.fetch_related_papers(paper_id, max_results=limit, skip_paper_fetch=False)
        
        if not related_papers:
            return SearchResponse(papers=[], total=0)
        
        paper_models = []
        for paper in related_papers:
            year = paper.get("year")
            year_int = None
            if year and year != "N/A":
                try:
                    year_str = str(year).split("-")[0].strip()
                    if year_str.isdigit():
                        year_int = int(year_str)
                        from datetime import datetime
                        current_year = datetime.now().year
                        if year_int < 1900 or year_int > current_year + 1:
                            year_int = None
                except (ValueError, AttributeError):
                    year_int = None
            
            paper_models.append(
                Paper(
                    pmid=paper.get("pmid", ""),
                    title=paper.get("title", ""),
                    abstract=paper.get("abstract", ""),
                    authors=paper.get("authors", []),
                    year=year_int,
                    journal=paper.get("journal", "")
                )
            )
        
        return SearchResponse(papers=paper_models, total=len(paper_models))
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error fetching related papers: {str(e)}")


@router.get("/papers/{paper_id}/cited-by", response_model=SearchResponse)
async def get_cited_by(
    paper_id: str,
    limit: int = Query(2, ge=1, le=50)
):
    """
    Get papers that cite this paper
    Note: PubMed doesn't directly provide citation data, so we use a workaround
    by searching for papers that mention this paper's title or authors
    """
    try:
        from data.pubmed_fetcher import PubMedFetcher
        fetcher = PubMedFetcher()
        
        # Get title from cache or fetch once
        title = None
        if paper_id in fetcher._paper_title_cache:
            title = fetcher._paper_title_cache[paper_id]
        else:
            papers = fetcher.fetch_abstracts(f"{paper_id}[PMID]", max_results=1)
            if papers:
                title = papers[0].get("title", "")
                fetcher._paper_title_cache[paper_id] = title
        
        if not title:
            return SearchResponse(papers=[], total=0)
        
        # Extract key terms from title (first 3-4 words) for citation search
        title_words = title.split()[:4]
        search_query = " ".join(title_words)
        
        # Search for papers that might cite this one
        # Note: This is approximate - PubMed doesn't provide direct citation data
        cited_papers = fetcher.fetch_abstracts(search_query, max_results=limit + 1)
        
        # Filter out the original paper
        cited_papers = [p for p in cited_papers if p.get("pmid") != paper_id]
        
        if not cited_papers:
            return SearchResponse(papers=[], total=0)
        
        paper_models = []
        for p in cited_papers:
            year = p.get("year")
            year_int = None
            if year and year != "N/A":
                try:
                    year_str = str(year).split("-")[0].strip()
                    if year_str.isdigit():
                        year_int = int(year_str)
                        from datetime import datetime
                        current_year = datetime.now().year
                        if year_int < 1900 or year_int > current_year + 1:
                            year_int = None
                except (ValueError, AttributeError):
                    year_int = None
            
            paper_models.append(
                Paper(
                    pmid=p.get("pmid", ""),
                    title=p.get("title", ""),
                    abstract=p.get("abstract", ""),
                    authors=p.get("authors", []),
                    year=year_int,
                    journal=p.get("journal", "")
                )
            )
        
        return SearchResponse(papers=paper_models, total=len(paper_models))
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error fetching cited-by papers: {str(e)}")


@router.get("/papers/{paper_id}/recommendations", response_model=SearchResponse)
async def get_paper_recommendations(
    paper_id: str,
    request: Request,
    limit: int = Query(2, ge=1, le=50),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user_optional(request, db)
    """
    Get AI-powered paper recommendations based on a paper
    Uses a combination of related papers, similar topics, and user preferences
    """
    try:
        from data.pubmed_fetcher import PubMedFetcher
        fetcher = PubMedFetcher()
        
        # Use keyword-based search directly (faster)
        recommended_papers = fetcher.fetch_related_papers(paper_id, max_results=limit, skip_paper_fetch=False)
        
        # If we have user preferences, we could filter/sort here
        # For now, return the related papers
        if not recommended_papers:
            return SearchResponse(papers=[], total=0)
        
        # Limit results
        recommended_papers = recommended_papers[:limit]
        
        paper_models = []
        for paper in recommended_papers:
            year = paper.get("year")
            year_int = None
            if year and year != "N/A":
                try:
                    year_str = str(year).split("-")[0].strip()
                    if year_str.isdigit():
                        year_int = int(year_str)
                        from datetime import datetime
                        current_year = datetime.now().year
                        if year_int < 1900 or year_int > current_year + 1:
                            year_int = None
                except (ValueError, AttributeError):
                    year_int = None
            
            paper_models.append(
                Paper(
                    pmid=paper.get("pmid", ""),
                    title=paper.get("title", ""),
                    abstract=paper.get("abstract", ""),
                    authors=paper.get("authors", []),
                    year=year_int,
                    journal=paper.get("journal", "")
                )
            )
        
        return SearchResponse(papers=paper_models, total=len(paper_models))
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error fetching recommendations: {str(e)}")

