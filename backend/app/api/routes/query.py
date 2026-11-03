"""
Query endpoint - Main chat interface
"""

from fastapi import APIRouter, HTTPException
from app.models.schemas import QueryRequest, QueryResponse
from app.core.rag import RAGPipeline
from app.services.translation_service import translation_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
rag_pipeline = RAGPipeline()


@router.post("/query", response_model=QueryResponse)
async def process_query(request: QueryRequest):
    """
    Process a research query and return an AI-generated answer with citations

    Supports multi-language queries and answers.

    Args:
        request: QueryRequest with user's question and language preferences

    Returns:
        QueryResponse with answer and citations
    """
    try:
        # Detect language if auto-detect is enabled
        detected_lang = None
        if request.auto_detect_language:
            detected_lang = translation_service.detect_language(request.query)

        # Determine target language
        target_lang = request.language or detected_lang or "en"

        # Translate query to English for PubMed search (PubMed primarily uses English)
        original_query = request.query
        if detected_lang and detected_lang != "en":
            # Translate query to English for better PubMed results
            translated_query = translation_service.translate_query(original_query, target_lang="en")
        else:
            translated_query = original_query

        # Process query with translated query (PubMed works best with English)
        result = await rag_pipeline.process_query(translated_query)

        # Translate answer back to target language if needed
        answer = result["answer"]
        if target_lang != "en":
            answer = translation_service.translate_answer(
                answer, target_lang=target_lang, source_lang="en"
            )

        return QueryResponse(
            answer=answer,
            citations=result["citations"],
            metadata=result["metadata"],
            detected_language=detected_lang,
            target_language=target_lang,
        )
    except Exception as e:
        logger.exception(f"Error processing query: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")
