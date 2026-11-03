# MedEvidence AI

Evidence-backed medical answers from PubMed. A question is turned into a PubMed search, the matching abstracts are ranked, and an LLM (via Groq) writes an answer that cites only those papers.

## Project structure

```
backend/                 FastAPI API (deployed on Render)
  app/
    api/routes/          HTTP endpoints (auth, query, search, dashboard, ...)
    core/                config, security, RAG pipeline
    middleware/          usage tracking
    models/              SQLAlchemy models + Pydantic schemas
    services/            LLM, email, citations, translation
    main.py              app entrypoint (creates DB tables on startup)
  data/                  PubMed fetcher
frontend/                Next.js 14 app (App Router, TypeScript, Tailwind)
  app/                   pages
  components/            UI components
  lib/                   API client, contexts, helpers
```

## Local development

Prerequisites: Python 3.11, Node.js 18+, a [Groq API key](https://console.groq.com).

**Backend**

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp env.example .env             # then fill in GROQ_API_KEY and SECRET_KEY
python run_server.py            # http://localhost:8000, docs at /docs
```

**Frontend**

```bash
cd frontend
npm install
cp env.example .env.local       # set NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev                     # http://localhost:3000
```

## Formatting

```bash
cd frontend && npm run format && npm run lint   # Prettier + ESLint
cd backend && pip install black && black .      # Black (config in pyproject.toml)
```

## Configuration

All backend settings live in [backend/app/core/config.py](backend/app/core/config.py) and can be overridden by environment variables of the same name (case-insensitive). See [backend/env.example](backend/env.example).

| Variable | Required | Notes |
|---|---|---|
| `GROQ_API_KEY` | yes | LLM answers |
| `SECRET_KEY` | yes | JWT signing; use a long random string |
| `FRONTEND_URL` | yes | CORS + links in emails |
| `DATABASE_URL` | prod | Postgres URL. Defaults to local SQLite, which is wiped on every Render deploy |
| `DEBUG` | prod | Set `False` in production (restricts CORS) |
| `LLM_MODEL` | no | Groq model id, default `openai/gpt-oss-120b` |
| `SMTP_USERNAME` / `SMTP_PASSWORD` | no | Gmail address + [app password](https://myaccount.google.com/apppasswords) for contact form / verification emails |
| `SENTRY_DSN` | no | Error tracking |

Frontend: `NEXT_PUBLIC_API_URL` = backend base URL.

## Deployment

- **Backend (Render):** root directory `backend`, build `pip install -r requirements.txt`, start `uvicorn app.main:app --host 0.0.0.0 --port $PORT` (see [backend/render.yaml](backend/render.yaml)). Set the env vars above in the Render dashboard.
- **Frontend:** any Next.js host (Vercel, Render). Set `NEXT_PUBLIC_API_URL`.

## License

MIT
