# 📁 Project Structure

```
researchgpt/
├── README.md
├── .gitignore
├── docker-compose.yml (optional, for local dev)
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py        # Configuration
│   │   │   └── rag.py            # RAG pipeline
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── dependencies.py
│   │   │   └── routes/
│   │   │       ├── __init__.py
│   │   │       ├── query.py     # Query endpoint
│   │   │       ├── search.py    # Search endpoint
│   │   │       └── papers.py    # Paper details
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── schemas.py       # Pydantic models
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── llm.py           # LLM service
│   │       ├── vector_db.py     # Vector DB service
│   │       └── citation.py      # Citation extraction
│   ├── data/
│   │   ├── __init__.py
│   │   ├── pipeline.py          # Data ingestion
│   │   ├── pubmed_fetcher.py    # PubMed API
│   │   └── embedder.py          # Embedding generation
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile (optional)
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Main chat page
│   │   ├── search/
│   │   │   └── page.tsx         # Search page
│   │   └── api/                 # Next.js API routes (if needed)
│   ├── components/
│   │   ├── Chat.tsx
│   │   ├── Message.tsx
│   │   ├── Citation.tsx
│   │   └── SearchBar.tsx
│   ├── lib/
│   │   ├── api.ts                # API client
│   │   └── utils.ts
│   ├── styles/
│   │   └── globals.css
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── next.config.js
│   └── .env.example
│
├── data/                         # Data files (optional)
│   └── samples/                  # Sample papers for testing
│
└── docs/                         # Documentation
    ├── API.md
    ├── SETUP.md
    └── CONTRIBUTING.md
```
