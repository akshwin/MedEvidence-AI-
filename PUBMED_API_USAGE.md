# 📚 PubMed API Usage in MedEvidence AI

## Overview
The PubMed API is the core data source for MedEvidence AI, providing access to **30+ million medical research papers**. This document explains how we use it and leverage it for our two main functionalities.

---

## 🔍 Files Using PubMed API

### 1. **`backend/data/pubmed_fetcher.py`** (Core PubMed Integration)
   - **Purpose**: Main class that interacts with PubMed API
   - **Class**: `PubMedFetcher`
   - **Key Method**: `fetch_abstracts(query, max_results)`

### 2. **`backend/app/core/rag.py`** (RAG Pipeline)
   - **Purpose**: Uses PubMed fetcher for AI-powered chat/query functionality
   - **Class**: `RAGPipeline`
   - **Key Method**: `process_query(query)`

### 3. **`backend/app/api/routes/query.py`** (Chat/Query Endpoint)
   - **Purpose**: API endpoint for chat functionality
   - **Route**: `POST /api/query`
   - **Uses**: `RAGPipeline` → `PubMedFetcher`

### 4. **`backend/app/api/routes/search.py`** (Search Endpoint)
   - **Purpose**: API endpoint for direct paper search
   - **Route**: `POST /api/search`
   - **Uses**: `PubMedFetcher` directly

---

## 🔧 How PubMed API Works

### PubMed API Endpoints Used

1. **ESearch API** (`esearch.fcgi`)
   - **Purpose**: Search PubMed database and get paper IDs
   - **URL**: `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi`
   - **Returns**: List of PubMed IDs (PMIDs) matching the query

2. **EFetch API** (`efetch.fcgi`)
   - **Purpose**: Fetch detailed information for specific paper IDs
   - **URL**: `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi`
   - **Returns**: XML data with paper details (title, abstract, authors, journal, year, etc.)

### Implementation Flow

```
User Query
    ↓
PubMedFetcher.fetch_abstracts()
    ↓
Step 1: ESearch API → Get PMIDs (paper IDs)
    ↓
Step 2: EFetch API → Get paper details (title, abstract, authors, etc.)
    ↓
Step 3: Score & Rank papers by relevance
    ↓
Return List of Papers
```

---

## 🎯 Two Main Functionalities

### 1. **Chat/Query - AI-Powered Answers** (`/api/query`)

**Purpose**: Generate evidence-based answers from medical literature

**Flow**:
```
User asks: "What are the latest treatments for type 2 diabetes?"
    ↓
RAGPipeline.process_query()
    ↓
PubMedFetcher.fetch_abstracts(query, max_results=8)
    ↓
PubMed API searches 30M+ papers → Returns top 8 relevant papers
    ↓
RAGPipeline builds context from papers
    ↓
LLM generates answer using ONLY the retrieved papers
    ↓
CitationService extracts citations
    ↓
Returns: Answer + Citations + Metadata
```

**Key Features**:
- ✅ **Always uses PubMed papers** - Never relies on LLM general knowledge
- ✅ **Evidence-based** - Every answer is backed by actual research papers
- ✅ **Citations included** - Users can verify every claim
- ✅ **Relevance scoring** - Papers are ranked by relevance to query
- ✅ **Smart query processing** - Handles age filters, year filters, medical terms

**Code Location**: `backend/app/core/rag.py` → `process_query()`

**Example Request**:
```json
POST /api/query
{
  "query": "What are the latest treatments for type 2 diabetes?"
}
```

**Example Response**:
```json
{
  "answer": "Based on recent medical literature, the latest treatments for type 2 diabetes include...",
  "citations": [
    {
      "pmid": "12345678",
      "title": "Novel Treatments for Type 2 Diabetes...",
      "authors": ["Smith J", "Doe A"],
      "year": 2024,
      "journal": "Diabetes Research"
    }
  ],
  "metadata": {
    "papers_retrieved": 8,
    "source": "pubmed_direct",
    "evidence_based": true
  }
}
```

---

### 2. **Search - Direct Paper Search** (`/api/search`)

**Purpose**: Search and browse medical papers directly

**Flow**:
```
User searches: "diabetes treatment 2024"
    ↓
Search endpoint receives query
    ↓
PubMedFetcher.fetch_abstracts(query, max_results=10)
    ↓
PubMed API searches 30M+ papers → Returns top 10 relevant papers
    ↓
Papers are scored and ranked by relevance
    ↓
Returns: List of papers with details
```

**Key Features**:
- ✅ **Direct paper search** - Browse papers without AI synthesis
- ✅ **Relevance ranking** - Most relevant papers appear first
- ✅ **Rich metadata** - Title, abstract, authors, journal, year, PMID
- ✅ **Configurable limit** - Can request 1-200+ papers
- ✅ **Smart filtering** - Handles year filters, age filters, medical terms

**Code Location**: `backend/app/api/routes/search.py` → `search_papers()`

**Example Request**:
```json
POST /api/search
{
  "query": "diabetes treatment 2024",
  "limit": 10
}
```

**Example Response**:
```json
{
  "papers": [
    {
      "pmid": "12345678",
      "title": "Novel Treatments for Type 2 Diabetes...",
      "abstract": "This study examines...",
      "authors": ["Smith J", "Doe A"],
      "year": 2024,
      "journal": "Diabetes Research"
    }
  ],
  "total": 10
}
```

---

## 🚀 Advanced Features

### 1. **Smart Query Processing** (`pubmed_fetcher.py`)

**Year Filtering**:
- Detects years in query (e.g., "diabetes 2024")
- Converts to PubMed date filter: `diabetes AND (2024[Publication Date])`
- Removes year from search terms to avoid duplication

**Age Filtering**:
- Detects age-related terms (elderly, older, senior, aged, 50+, etc.)
- Adds MeSH terms for better matching: `(elderly[Title/Abstract] OR aged[Title/Abstract])`
- Improves relevance for age-specific queries

**Query Enhancement**:
```python
# Original: "diabetes treatment elderly 2024"
# Processed: "diabetes treatment AND (elderly[Title/Abstract] OR aged[Title/Abstract]) AND (2024[Publication Date])"
```

### 2. **Relevance Scoring** (`pubmed_fetcher.py` → `_score_and_rank_papers()`)

**Scoring Algorithm**:
- **Title matches**: 3x weight (very important)
- **Abstract matches**: 1x weight
- **Age keyword matches**: +2.0 bonus
- **Phrase matches**: +2.0 bonus
- **Normalized score**: 0.0 - 1.0 range

**Ranking**:
- Papers sorted by relevance score (highest first)
- Low-relevance papers (< 0.1) filtered out if enough results
- Ensures most relevant papers appear first

### 3. **Batch Processing**

**Why**: PubMed API has URL length limits

**How**:
- Fetches papers in batches of 200
- Prevents 414 (URI Too Long) errors
- Handles large result sets efficiently

**Code**:
```python
batch_size = 200
for i in range(0, len(id_list), batch_size):
    batch_ids = id_list[i:i + batch_size]
    # Fetch batch...
```

### 4. **Error Handling**

**Robust Error Handling**:
- Handles API failures gracefully
- Returns empty results if no papers found
- Logs errors for debugging
- Never crashes the application

**Fallback Behavior**:
- If PubMed API fails → Returns error message
- If no papers found → Returns empty list
- If parsing fails → Skips problematic papers

---

## 📊 Data Flow Diagram

```
┌─────────────────┐
│   User Query    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│  PubMedFetcher.fetch_abstracts()│
│  - Query processing             │
│  - Year/age filtering           │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│   ESearch API                   │
│   - Search 30M+ papers          │
│   - Return PMIDs                │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│   EFetch API (batched)          │
│   - Fetch paper details         │
│   - Parse XML                   │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│   Score & Rank Papers           │
│   - Relevance scoring           │
│   - Sort by score               │
└────────┬────────────────────────┘
         │
         ├─────────────────┬─────────────────┐
         ▼                 ▼                 ▼
    ┌─────────┐      ┌──────────┐      ┌──────────┐
    │  Chat   │      │  Search  │      │  Other   │
    │ (RAG)   │      │ (Direct) │      │  Uses    │
    └─────────┘      └──────────┘      └──────────┘
```

---

## 🔑 Key Advantages

### 1. **Access to 30M+ Papers**
- Can search entire PubMed database
- No need to maintain local database
- Always up-to-date with latest research

### 2. **Smart Search**
- Relevance scoring ensures best papers first
- Query processing improves results
- Handles complex medical queries

### 3. **Evidence-Based**
- Every answer backed by real papers
- Citations included for verification
- No reliance on LLM general knowledge

### 4. **Efficient**
- Batch processing handles large results
- Caching possible (future enhancement)
- Fast response times

---

## 📝 Configuration

**Email Required**:
- PubMed API requires an email (for rate limiting)
- Set in `backend/app/core/config.py`:
  ```python
  pubmed_email: Optional[str] = "user@example.com"
  ```
- Or via environment variable: `PUBMED_EMAIL`

**Rate Limits**:
- PubMed API: 3 requests/second (with email)
- Our implementation: Batches requests to stay within limits

---

## 🎯 Summary

**PubMed API is used in**:
1. ✅ **Chat/Query** (`/api/query`) - AI-powered answers with citations
2. ✅ **Search** (`/api/search`) - Direct paper browsing

**How it works**:
1. User submits query
2. `PubMedFetcher` processes query (filters, enhancements)
3. ESearch API finds relevant papers (from 30M+)
4. EFetch API gets paper details
5. Papers scored and ranked by relevance
6. Results used for chat (with LLM) or search (direct)

**Key Files**:
- `backend/data/pubmed_fetcher.py` - Core PubMed integration
- `backend/app/core/rag.py` - RAG pipeline for chat
- `backend/app/api/routes/query.py` - Chat endpoint
- `backend/app/api/routes/search.py` - Search endpoint

---

## 🔮 Future Enhancements

- [ ] Caching frequently searched queries
- [ ] Vector embeddings for semantic search
- [ ] Advanced filtering (journal, author, date range)
- [ ] Full-text access integration
- [ ] Citation network analysis
- [ ] Paper recommendations based on reading history





