import sys
import asyncio
import os
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).parent
sys.path.append(str(backend_dir))

# Mock environment loading if needed, or rely on .env
from dotenv import load_dotenv
load_dotenv()

async def reproduce():
    print("Initializing RAG Pipeline...")
    try:
        from app.core.rag import RAGPipeline
        rag = RAGPipeline()
        
        query = "cancer immunotherapy"
        print(f"Processing query: '{query}'")
        
        result = await rag.process_query(query)
        print("Success!")
        print(result)
        
    except Exception as e:
        print("CAUGHT EXCEPTION:")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(reproduce())
