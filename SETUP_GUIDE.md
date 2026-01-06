# 🚀 MedEvidence - Complete Setup Guide

## Prerequisites

Before you begin, make sure you have:

- **Python 3.11+** installed
- **Node.js 18+** installed
- **Anthropic API key** ([Get one here](https://console.anthropic.com/))
- **Pinecone API key** ([Get one here](https://www.pinecone.io/))
- **PubMed email** (any email, required for PubMed API)

---

## Step 1: Backend Setup

### 1.1 Navigate to Backend Directory

```bash
cd backend
```

### 1.2 Create Virtual Environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Mac/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 1.3 Install Dependencies

```bash
pip install -r requirements.txt
```

### 1.4 Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
# Copy example file
cp .env.example .env
```

Edit `.env` with your API keys:

```env
# API Keys
ANTHROPIC_API_KEY=your_anthropic_api_key_here
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_ENVIRONMENT=us-east-1

# Database (SQLite for MVP)
DATABASE_URL=sqlite:///./researchgpt.db

# Server
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True

# Vector DB
VECTOR_DB_INDEX_NAME=medical-research
EMBEDDING_MODEL=text-embedding-3-small

# PubMed
PUBMED_EMAIL=your_email@example.com
```

### 1.5 Start Backend Server

**IMPORTANT:** Make sure you're in the `backend` directory when running this command!

```bash
# Make sure you're in the backend directory
cd backend

# Activate virtual environment (if not already activated)
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

# Run the server (choose one method):
# Method 1: Using uvicorn directly
uvicorn app.main:app --reload

# Method 2: Using the helper script (works from any directory)
python run_server.py
```

The backend will be available at `http://localhost:8000`

**Troubleshooting:**
- If you get `ModuleNotFoundError: No module named 'app'`, make sure you're in the `backend` directory
- You can also use `python run_server.py` which handles the path automatically

**Verify it's working:**
- Visit `http://localhost:8000/docs` - Should see FastAPI docs
- Visit `http://localhost:8000/health` - Should return `{"status": "healthy"}`

---

## Step 2: Frontend Setup

### 2.1 Navigate to Frontend Directory

Open a **new terminal** (keep backend running):

```bash
cd frontend
```

### 2.2 Install Dependencies

```bash
npm install
```

### 2.3 Configure Environment Variables

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 2.4 Start Frontend Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

---

## Step 3: Verify Everything Works

### 3.1 Check Backend

1. Open `http://localhost:8000/docs` in your browser
2. You should see the FastAPI documentation
3. Try the `/health` endpoint - should return `{"status": "healthy"}`

### 3.2 Check Frontend

1. Open `http://localhost:3000` in your browser
2. You should see the ResearchGPT interface
3. Try typing a question in the chat (note: will need data pipeline set up first)

### 3.3 Test Connection

The frontend should be able to connect to the backend. If you see CORS errors:

1. Make sure backend is running
2. Check that `NEXT_PUBLIC_API_URL` in frontend `.env.local` matches backend URL
3. Backend CORS is already configured for `http://localhost:3000`

---

## Step 4: Next Steps (Data Pipeline)

Once backend and frontend are running, you need to:

1. **Set up Vector DB:**
   - Create Pinecone index
   - Configure vector DB service

2. **Implement Data Pipeline:**
   - Complete PubMed fetcher
   - Generate embeddings
   - Store in vector DB

3. **Complete RAG Pipeline:**
   - Connect all components
   - Test end-to-end flow

See `MVP_ROADMAP.md` for detailed steps.

---

## 🐛 Troubleshooting

### Backend Issues

**Import Errors:**
```bash
# Make sure you're in the backend directory
# And virtual environment is activated
pip install -r requirements.txt
```

**Port Already in Use:**
```bash
# Change port in .env or use different port
uvicorn app.main:app --reload --port 8001
```

**Module Not Found:**
```bash
# Make sure you're running from backend directory
# Or use: python -m uvicorn app.main:app --reload
```

### Frontend Issues

**npm install fails:**
```bash
# Clear cache and try again
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**CORS Errors:**
- Check backend is running
- Verify `NEXT_PUBLIC_API_URL` in frontend `.env.local`
- Check browser console for exact error

**Port 3000 in use:**
```bash
# Use different port
npm run dev -- -p 3001
```

### Connection Issues

**Frontend can't reach backend:**
1. Verify backend is running: `curl http://localhost:8000/health`
2. Check `NEXT_PUBLIC_API_URL` in frontend `.env.local`
3. Make sure no firewall is blocking the connection

---

## 📝 Development Workflow

### Running Both Servers

**Terminal 1 (Backend):**
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn app.main:app --reload
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

### Making Changes

- **Backend changes:** Server auto-reloads (thanks to `--reload`)
- **Frontend changes:** Next.js hot-reloads automatically
- **API changes:** Restart backend if needed

---

## ✅ Checklist

Before you start coding:

- [ ] Python 3.11+ installed
- [ ] Node.js 18+ installed
- [ ] Backend virtual environment created
- [ ] Backend dependencies installed
- [ ] Backend `.env` file configured
- [ ] Backend server running on port 8000
- [ ] Frontend dependencies installed
- [ ] Frontend `.env.local` file configured
- [ ] Frontend server running on port 3000
- [ ] Both servers can communicate

---

## 🎯 You're Ready!

Once both servers are running, you can:

1. **View the frontend:** `http://localhost:3000`
2. **View API docs:** `http://localhost:8000/docs`
3. **Start building:** Follow `MVP_ROADMAP.md` for next steps

**Happy coding!** 🚀

