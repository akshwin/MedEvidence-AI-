# 🏗️ Medical Research LLM Platform - Technical Architecture

## System Overview

```
┌─────────────┐
│   User      │
│  (Browser)  │
└──────┬──────┘
       │
       │ HTTP/WebSocket
       ▼
┌─────────────────────────────────┐
│      Frontend (Next.js)          │
│  - Chat Interface                 │
│  - Search UI                     │
│  - Citation Display              │
└──────┬───────────────────────────┘
       │
       │ REST API
       ▼
┌─────────────────────────────────┐
│    Backend API (FastAPI)         │
│  - Query Processing              │
│  - RAG Pipeline                  │
│  - LLM Integration               │
│  - Citation Extraction           │
└──────┬───────────────────────────┘
       │
       ├─────────────────┬─────────────────┐
       ▼                 ▼                 ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ Vector DB   │  │    LLM      │  │  Database   │
│ (Pinecone)  │  │  (Claude)   │  │ (PostgreSQL)│
│             │  │             │  │             │
│ PubMed      │  │ API Call    │  │ User Data   │
│ Embeddings  │  │             │  │ History     │
└─────────────┘  └─────────────┘  └─────────────┘
```

---

## Component Details

### 1. Frontend (Next.js)

**Tech Stack:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Shadcn/ui (components)
- React Query (data fetching)
- Zustand (state management)

**Features:**
- Chat interface (message history)
- Search bar
- Citation display (expandable)
- Export options (copy, download)
- User authentication (optional for MVP)

**File Structure:**
```
frontend/
├── app/
│   ├── page.tsx (main chat)
│   ├── search/
│   └── api/ (API routes)
├── components/
│   ├── Chat.tsx
│   ├── Message.tsx
│   ├── Citation.tsx
│   └── SearchBar.tsx
├── lib/
│   ├── api.ts (API client)
│   └── utils.ts
└── styles/
```

---

### 2. Backend API (FastAPI)

**Tech Stack:**
- Python 3.11+
- FastAPI
- LangChain (RAG pipeline)
- OpenAI/Anthropic SDK
- Pinecone client
- PostgreSQL (SQLAlchemy)

**Endpoints:**
```
POST /api/query          # Main query endpoint
POST /api/search         # Paper search
GET  /api/papers/{id}    # Get paper details
GET  /api/health         # Health check
```

**File Structure:**
```
backend/
├── app/
│   ├── main.py (FastAPI app)
│   ├── api/
│   │   ├── routes/
│   │   │   ├── query.py
│   │   │   ├── search.py
│   │   │   └── papers.py
│   │   └── dependencies.py
│   ├── core/
│   │   ├── config.py
│   │   └── rag.py (RAG pipeline)
│   ├── models/
│   │   └── schemas.py (Pydantic models)
│   └── services/
│       ├── llm.py
│       ├── vector_db.py
│       └── citation.py
├── data/
│   └── pipeline.py (data ingestion)
└── requirements.txt
```

---

### 3. RAG Pipeline

**Flow:**
1. User query → Embedding
2. Vector search → Top K papers
3. Retrieve abstracts → Context
4. LLM prompt → Generate answer
5. Extract citations → Return response

**Implementation:**
```python
# Simplified RAG flow
query_embedding = embed(query)
similar_papers = vector_db.search(query_embedding, top_k=5)
context = "\n".join([paper.abstract for paper in similar_papers])
prompt = f"Context: {context}\n\nQuestion: {query}\n\nAnswer:"
answer = llm.generate(prompt)
citations = extract_citations(similar_papers)
return {"answer": answer, "citations": citations}
```

**Components:**
- Embedding model: `text-embedding-3-small` (OpenAI) or `sentence-transformers`
- Vector DB: Pinecone (managed) or Weaviate (self-hosted)
- Retrieval: Semantic search (cosine similarity)
- Reranking: Optional (improve relevance)

---

### 4. Data Pipeline

**PubMed Data Ingestion:**
1. Fetch abstracts via PubMed API
2. Clean and preprocess text
3. Generate embeddings
4. Store in vector DB
5. Update periodically (new papers)

**Script:**
```python
# data/pipeline.py
def ingest_pubmed():
    # Fetch recent papers (last 5 years)
    papers = fetch_pubmed_abstracts(years=5)
    
    # Generate embeddings
    embeddings = embed_batch(papers)
    
    # Store in vector DB
    vector_db.upsert(embeddings, papers)
```

**Update Strategy:**
- Initial: Ingest 5 years of papers (~5M abstracts)
- Updates: Weekly/monthly (new papers)
- Incremental: Only process new papers

---

### 5. LLM Integration

**Options:**

**Option 1: Claude 3.5 Sonnet (Recommended for MVP)**
- Better for long context (medical papers are long)
- Good medical reasoning
- API-based (easy to start)
- Cost: ~$0.003 per 1K tokens

**Option 2: Llama 3 (Future)**
- Open source (your skills!)
- Can fine-tune on medical data
- Self-hosted (privacy, cost control)
- Requires GPU infrastructure

**Prompt Template:**
```
You are a medical research assistant. Answer the following question based on the provided research context.

Context (from medical literature):
{context}

Question: {query}

Provide a clear, evidence-based answer. Include citations from the context.

Answer:
```

---

### 6. Vector Database

**Option 1: Pinecone (Recommended for MVP)**
- Managed service (easy setup)
- Free tier: 100K vectors
- Good performance
- Easy to scale

**Option 2: Weaviate (Future)**
- Open source
- Self-hosted
- More control
- Lower cost at scale

**Schema:**
```python
{
    "id": "pmid_12345678",
    "vector": [0.1, 0.2, ...],  # 1536-dim embedding
    "metadata": {
        "title": "Paper title",
        "abstract": "Paper abstract",
        "authors": ["Author 1", "Author 2"],
        "year": 2024,
        "journal": "Journal name",
        "pmid": "12345678"
    }
}
```

---

### 7. Database (PostgreSQL)

**Schema:**
```sql
-- Users (optional for MVP)
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP
);

-- Query History
CREATE TABLE queries (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    query TEXT,
    answer TEXT,
    created_at TIMESTAMP
);

-- Citations
CREATE TABLE citations (
    id UUID PRIMARY KEY,
    query_id UUID REFERENCES queries(id),
    paper_id VARCHAR(50),  -- PubMed ID
    relevance_score FLOAT
);
```

---

## Data Flow

### Query Flow:
1. User submits query → Frontend
2. Frontend → Backend API (`/api/query`)
3. Backend embeds query → Vector search
4. Retrieve top K papers → Build context
5. LLM generates answer → Extract citations
6. Return response → Frontend displays

### Search Flow:
1. User searches → Frontend
2. Frontend → Backend API (`/api/search`)
3. Backend searches vector DB → Return papers
4. Frontend displays results

---

## Deployment Architecture

### MVP (Simple):
```
Frontend: Vercel (free tier)
Backend: Railway/Render (free tier)
Vector DB: Pinecone (free tier)
Database: Supabase (free tier)
LLM: Anthropic API
```

### Production:
```
Frontend: Vercel Pro
Backend: AWS/GCP (containers)
Vector DB: Pinecone paid or self-hosted Weaviate
Database: Managed PostgreSQL (AWS RDS)
LLM: Fine-tuned Llama 3 (self-hosted on GPU)
```

---

## Security & Privacy

**MVP:**
- No PHI (using public PubMed data)
- API rate limiting
- Basic authentication (optional)

**Production:**
- User authentication (JWT)
- Data encryption (at rest, in transit)
- API keys management
- Rate limiting per user
- Audit logs

---

## Performance Targets

- **Response Time:** <3 seconds (query → answer)
- **Throughput:** 100+ queries/minute
- **Accuracy:** 80%+ user satisfaction
- **Uptime:** 99%+ availability

---

## Cost Estimates

### MVP (100 users):
- Vector DB (Pinecone free): $0
- LLM API (Claude): ~$50/month
- Hosting (Vercel + Railway): $0-20/month
- Database (Supabase free): $0
- **Total: ~$50-70/month**

### Scale (1000 users):
- Vector DB: $70/month
- LLM API: $500/month
- Hosting: $100/month
- Database: $25/month
- **Total: ~$700/month**

### Scale (10K users, self-hosted LLM):
- Vector DB: $200/month
- LLM (self-hosted GPU): $500/month
- Hosting: $500/month
- Database: $100/month
- **Total: ~$1300/month**

---

## Next Steps

1. **Set up project structure**
2. **Build data pipeline** (PubMed ingestion)
3. **Set up vector DB** (Pinecone)
4. **Build RAG pipeline** (LangChain)
5. **Integrate LLM** (Claude API)
6. **Build backend API** (FastAPI)
7. **Build frontend** (Next.js)
8. **Test end-to-end**
9. **Deploy**

---

**Ready to start building?** 🚀

