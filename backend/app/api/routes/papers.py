"""
Paper details endpoint
"""

from fastapi import APIRouter, HTTPException
from app.models.schemas import Paper
from app.services.vector_db import VectorDBService

router = APIRouter()
vector_db = VectorDBService()


@router.get("/papers/{pmid}", response_model=Paper)
async def get_paper(pmid: str):
    """
    Get details of a specific paper by PMID
    
    Args:
        pmid: PubMed ID
        
    Returns:
        Paper details
    """
    try:
        paper = await vector_db.get_paper_by_id(pmid)
        
        if not paper:
            raise HTTPException(status_code=404, detail="Paper not found")
        
        return Paper(
            pmid=paper.get("pmid"),
            title=paper.get("title"),
            abstract=paper.get("abstract"),
            authors=paper.get("authors", []),
            year=paper.get("year"),
            journal=paper.get("journal")
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching paper: {str(e)}")

