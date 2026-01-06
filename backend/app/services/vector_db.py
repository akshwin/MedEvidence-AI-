"""
Vector Database Service - Handles vector search
"""

from typing import List, Dict, Optional
from pinecone import Pinecone, ServerlessSpec
from app.core.config import settings
import os


class VectorDBService:
    """Service for vector database operations"""
    
    def __init__(self):
        # Handle optional Pinecone API key
        pinecone_key = settings.pinecone_api_key or os.environ.get("PINECONE_API_KEY")
        if not pinecone_key:
            # For now, create a mock service if Pinecone is not configured
            self.pc = None
            self.index_name = settings.vector_db_index_name
            self.index = None
            return
        
        self.pc = Pinecone(api_key=pinecone_key)
        self.index_name = settings.vector_db_index_name
        self.index = None
        self._initialize_index()
    
    def _initialize_index(self):
        """Initialize or connect to Pinecone index"""
        if not self.pc:
            return  # Skip if Pinecone not configured
        
        try:
            # Check if index exists
            existing_indexes = [idx.name for idx in self.pc.list_indexes()]
            
            if self.index_name not in existing_indexes:
                # Create index if it doesn't exist
                self.pc.create_index(
                    name=self.index_name,
                    dimension=settings.embedding_dimension,
                    metric="cosine",
                    spec=ServerlessSpec(
                        cloud="aws",
                        region=settings.pinecone_environment
                    )
                )
            
            self.index = self.pc.Index(self.index_name)
        except Exception as e:
            print(f"Warning: Could not initialize Pinecone index: {e}")
            self.index = None
    
    async def search(self, query: str, top_k: int = 5) -> List[Dict]:
        """
        Search for similar papers
        
        Args:
            query: Search query
            top_k: Number of results
            
        Returns:
            List of paper dictionaries
        """
        # Return empty list if Pinecone not configured
        if not self.pc or not self.index:
            return []
        
        # Generate embedding for query
        query_embedding = await self._embed_query(query)
        
        # Search index
        results = self.index.query(
            vector=query_embedding,
            top_k=top_k,
            include_metadata=True
        )
        
        return [
            {
                "id": match.id,
                "score": match.score,
                **(match.metadata or {})
            } 
            for match in results.matches
        ]
    
    async def get_paper_by_id(self, pmid: str) -> Optional[Dict]:
        """Get paper by PMID"""
        # TODO: Implement
        return None
    
    async def _embed_query(self, query: str) -> List[float]:
        """
        Generate embedding for query using Pinecone Inference
        """
        if not self.pc:
            # Return zero vector if Pinecone not configured
            return [0.0] * settings.embedding_dimension
        
        try:
            # Using Pinecone Inference API
            embedding = self.pc.inference.embed(
                model=settings.embedding_model,
                inputs=[query],
                parameters={"input_type": "query"}
            )
            return embedding[0]['values']
        except Exception as e:
            print(f"Error generating embedding: {e}")
            # Return zero vector as fallback or re-raise
            return [0.0] * settings.embedding_dimension

    async def upsert_papers(self, papers: List[Dict]):
        """
        Upsert papers to Pinecone
        """
        if not papers:
            return
            
        print(f"Upserting {len(papers)} papers...")
        
        # Batch process
        batch_size = 100
        for i in range(0, len(papers), batch_size):
            batch = papers[i:i + batch_size]
            
            # Generate embeddings
            texts = [p["text"] for p in batch]
            try:
                embeddings = self.pc.inference.embed(
                    model=settings.embedding_model,
                    inputs=texts,
                    parameters={"input_type": "passage"}
                )
                
                # Prepare vectors
                vectors = []
                for j, paper in enumerate(batch):
                    vector_id = paper.get("pmid") or f"paper_{i+j}"
                    values = embeddings[j]['values']
                    
                    metadata = {
                        "title": paper.get("title", ""),
                        "abstract": paper.get("abstract", ""),
                        "year": paper.get("year", ""),
                        "authors": paper.get("authors", []),
                        "pmid": paper.get("pmid", "")
                    }
                    
                    vectors.append({
                        "id": vector_id,
                        "values": values,
                        "metadata": metadata
                    })
                
                # Upsert to Pinecone
                self.index.upsert(vectors=vectors)
                print(f"Upserted batch {i} - {i+len(batch)}")
                
            except Exception as e:
                print(f"Error upserting batch: {e}")
                continue

