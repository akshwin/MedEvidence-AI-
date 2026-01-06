import os
from pinecone import Pinecone
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("PINECONE_API_KEY")
print(f"API Key present: {bool(api_key)}")

try:
    pc = Pinecone(api_key=api_key)
    print("Pinecone initialized.")
    
    try:
        # Check if inference attribute exists
        print(f"Has inference: {hasattr(pc, 'inference')}")
        
        # Test embed
        print("Testing embed...")
        embedding = pc.inference.embed(
            model="llama-text-embed-v2",
            inputs=["test"],
            parameters={"input_type": "query"}
        )
        print("Embed success!")
        print(len(embedding[0]['values']))
        
    except Exception as e:
        print(f"Inference failed: {e}")
        import traceback
        traceback.print_exc()
        
except Exception as e:
    print(f"Pinecone init failed: {e}")
