"""
LLM Service - Handles LLM interactions using Groq
"""

import os
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from app.core.config import settings


class LLMService:
    """Service for LLM interactions using Groq"""
    
    def __init__(self):
        # Set Groq API key from environment or config (never hardcode secrets)
        groq_api_key = os.environ.get("GROQ_API_KEY") or settings.groq_api_key
        if not groq_api_key:
            raise RuntimeError("GROQ_API_KEY is not configured. Set it as an environment variable to enable LLM answers.")
        
        # Set environment variable for Groq (in case it's needed)
        os.environ["GROQ_API_KEY"] = groq_api_key
        
        self.llm = ChatGroq(
            model_name=settings.llm_model,
            temperature=settings.temperature,
            max_tokens=settings.max_tokens,
            groq_api_key=groq_api_key
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
            SystemMessage(content="You are a medical research assistant. Provide evidence-based answers based on medical literature."),
            HumanMessage(content=prompt)
        ]
        
        response = await self.llm.ainvoke(messages)
        return response.content
    
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

