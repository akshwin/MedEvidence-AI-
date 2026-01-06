# 🏥 MedEvidence AI

**Evidence-backed medical answers from PubMed**

**AI-powered clinical evidence, instantly**

MedEvidence AI combines PubMed's 39 million citations with your institution's protocols, guidelines, and research to provide instant, evidence-based answers customized to your clinical practice.

## 🎯 What is MedEvidence AI?

MedEvidence AI is an evidence-based medical research platform that:
- ✅ Answers medical research questions using real literature
- ✅ Provides citations for every answer
- ✅ Searches millions of medical papers
- ✅ Explains complex medical concepts
- ✅ Helps researchers save hours of reading

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Anthropic API key (for Claude)
- Pinecone API key (for vector DB)

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API keys
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## 📁 Project Structure

```
researchgpt/
├── backend/          # FastAPI backend
├── frontend/         # Next.js frontend
├── data/             # Data pipeline
└── docs/             # Documentation
```

## 🛠️ Tech Stack

- **Backend:** FastAPI, Python
- **Frontend:** Next.js, React, TypeScript
- **LLM:** Claude 3.5 Sonnet (Anthropic)
- **Vector DB:** Pinecone
- **RAG:** LangChain

## 📚 Documentation

- [Product Specification](MEDICAL_RESEARCH_LLM_SPEC.md)
- [Technical Architecture](TECHNICAL_ARCHITECTURE.md)
- [MVP Roadmap](MVP_ROADMAP.md)

## 🎯 Current Status

**Phase:** MVP Development (Week 1-2)

- ✅ Project structure set up
- ✅ Backend API skeleton
- ✅ Frontend UI complete
- ✅ Frontend-Backend integration
- ⬜ Data pipeline (in progress)
- ⬜ Vector DB setup (in progress)

## 🤝 Contributing

This is an open-source project. Contributions welcome!

## 📄 License

MIT License

---

**Built with ❤️ for medical researchers**
