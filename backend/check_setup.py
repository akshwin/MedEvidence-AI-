import sys
import os
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).parent
sys.path.append(str(backend_dir))

print(f"Python executable: {sys.executable}")

try:
    from app.core.config import settings
    print(f"Config loaded.")
    print(f"Pinecone Env: {settings.pinecone_environment}")
    print(f"Anthropic Key Present: {bool(settings.anthropic_api_key)}")
    print(f"Pinecone Key Present: {bool(settings.pinecone_api_key)}")
except Exception as e:
    print(f"Failed to load config: {e}")
    # Don't exit, try verification blocks anyway if possible
    
print("-" * 20)

# Check Pinecone
try:
    from pinecone import Pinecone
    print("Pinecone v3+ imported successfully.")
    try:
        pc = Pinecone(api_key=settings.pinecone_api_key)
        indexes = pc.list_indexes()
        print(f"Pinecone Connection Successful. Indexes: {[i.name for i in indexes]}")
    except Exception as e:
        print(f"Pinecone Connection Failed (v3): {e}")

    try:
        print("Testing Pinecone Inference Embedding...")
        # Verify inference
        # Note: This requires the 'pinecone-plugin-inference' or similar functionality if not built-in, 
        # but modern pinecone client v3 has .inference
        embedding = pc.inference.embed(
            model=settings.embedding_model,
            inputs=["Hello world"],
            parameters={"input_type": "query"}
        )
        print(f"Embedding generated successfully. Shape: {len(embedding[0]['values'])}")
    except Exception as e:
        print(f"Embedding Generation Failed: {e}")

except ImportError:
    print("Pinecone v3 import failed. Checking for v2...")
    try:
        import pinecone
        pinecone.init(api_key=settings.pinecone_api_key, environment=settings.pinecone_environment)
        print(f"Pinecone v2 Connection Successful. Indexes: {pinecone.list_indexes()}")
    except Exception as e:
        print(f"Pinecone v2 Connection Failed: {e}")
    except ImportError:
        print("Pinecone library not found.")

print("-" * 20)

# Check Anthropic
try:
    from anthropic import Anthropic
    client = Anthropic(api_key=settings.anthropic_api_key)
    print("Anthropic Client initialized.")
except Exception as e:
    print(f"Anthropic initialization failed: {e}")
