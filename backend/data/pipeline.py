import sys
import asyncio
import argparse
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).parent.parent
sys.path.append(str(backend_dir))

from app.services.vector_db import VectorDBService
from data.pubmed_fetcher import PubMedFetcher

async def run_pipeline(query: str, limit: int):
    print(f"Starting pipeline for query: '{query}' (limit: {limit})")
    
    # 1. Fetch papers
    fetcher = PubMedFetcher()
    papers = fetcher.fetch_abstracts(query, max_results=limit)
    
    if not papers:
        print("No papers found. Exiting.")
        return
        
    print(f"Fetched {len(papers)} papers.")
    
    # 2. Upsert to Pinecone
    vector_db = VectorDBService()
    await vector_db.upsert_papers(papers)
    
    print("Pipeline completed successfully.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run data ingestion pipeline")
    parser.add_argument("--query", type=str, default="cancer immunotherapy", help="Search query")
    parser.add_argument("--limit", type=int, default=10, help="Number of papers to fetch")
    
    args = parser.parse_args()
    
    asyncio.run(run_pipeline(args.query, args.limit))
