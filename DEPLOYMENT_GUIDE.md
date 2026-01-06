# 🚀 Free Deployment Guide - MedEvidence AI

This guide will help you deploy your MedEvidence AI application for free on the internet.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
4. [Backend Deployment (Render)](#backend-deployment-render)
5. [Database Setup](#database-setup)
6. [Environment Variables](#environment-variables)
7. [Post-Deployment Steps](#post-deployment-steps)
8. [Alternative Hosting Options](#alternative-hosting-options)

---

## Overview

We'll deploy:
- **Frontend (Next.js)**: Vercel (free, perfect for Next.js)
- **Backend (FastAPI)**: Render (free tier available)
- **Database**: PostgreSQL on Render (free tier) or SQLite for small apps

**Estimated Cost**: $0/month

---

## Prerequisites

1. **GitHub account (free)** - Private repositories are FREE! Your code stays private.
2. Vercel account (free)
3. Render account (free)
4. Basic understanding of environment variables

> **🔒 Privacy Note**: GitHub offers **FREE private repositories**! Your code will NOT be public. When you create a repository, simply select "Private" instead of "Public". Both Vercel and Render work perfectly with private repositories.

---

## Frontend Deployment (Vercel)

### Step 1: Prepare Frontend for Production

1. **Create a `.env.local` file** in the `frontend` directory:
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
```

2. **Update `frontend/lib/api.ts`** to use environment variable:
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
```

### Step 2: Push to GitHub (PRIVATE Repository)

1. Initialize git (if not already done):
```bash
cd frontend
git init
git add .
git commit -m "Initial commit"
```

2. **Create a PRIVATE GitHub repository**:
   - Go to [github.com](https://github.com)
   - Click "New" repository
   - **IMPORTANT**: Select **"Private"** (not Public)
   - Name it: `medevidence-frontend` (or any name you prefer)
   - Click "Create repository"

3. Push your code:
```bash
git remote add origin https://github.com/yourusername/medevidence-frontend.git
git branch -M main
git push -u origin main
```

> **🔒 Your code is now private!** Only you (and people you explicitly invite) can see it.

### Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend` (if repo contains both frontend/backend)
   - **Environment Variables**:
     - `NEXT_PUBLIC_API_URL` = `https://your-backend-url.onrender.com`
5. Click "Deploy"
6. Your site will be live at `https://your-project.vercel.app`

---

## Backend Deployment (Render)

### Step 1: Prepare Backend for Production

1. **Create `backend/requirements.txt`** (if not exists):
```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
SQLAlchemy==2.0.23
python-multipart==0.0.6
pydantic-settings==2.1.0
```

2. **Create `backend/Procfile`**:
```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

3. **Create `backend/runtime.txt`**:
```
python-3.11.0
```

4. **Update `backend/app/main.py`** to handle CORS properly:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Step 2: Push Backend to GitHub (PRIVATE Repository)

1. **Create a PRIVATE GitHub repository**:
   - Go to [github.com](https://github.com)
   - Click "New" repository
   - **IMPORTANT**: Select **"Private"** (not Public)
   - Name it: `medevidence-backend` (or any name you prefer)
   - Click "Create repository"

2. Push your code:
```bash
cd backend
git init
git add .
git commit -m "Backend for deployment"
git remote add origin https://github.com/yourusername/medevidence-backend.git
git branch -M main
git push -u origin main
```

> **🔒 Your backend code is now private!** Only you can see it.

### Step 3: Deploy to Render

1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `medevidence-backend`
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free
5. Add Environment Variables (see Environment Variables section below)
6. Click "Create Web Service"
7. Your API will be live at `https://medevidence-backend.onrender.com`

---

## Database Setup

### Option 1: PostgreSQL on Render (Recommended for Production)

1. In Render dashboard, click "New +" → "PostgreSQL"
2. Configure:
   - **Name**: `medevidence-db`
   - **Plan**: Free
   - **Database**: `medevidence`
   - **User**: (auto-generated)
3. Copy the **Internal Database URL** (for backend)
4. Copy the **External Database URL** (for local access if needed)

### Option 2: SQLite (Simple, but limited)

SQLite works for small apps but has limitations:
- File-based (not ideal for multiple instances)
- No concurrent writes
- Good for development/testing

**For production, use PostgreSQL.**

---

## Environment Variables

### Backend Environment Variables (Render)

Add these in Render dashboard → Your Service → Environment:

```env
# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/medevidence

# Or for SQLite (development only)
DATABASE_URL=sqlite:///./researchgpt.db

# API Keys
GROQ_API_KEY=your-groq-api-key
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_ENVIRONMENT=us-east-1

# JWT Secret (generate a strong random string)
SECRET_KEY=your-super-secret-key-change-this-in-production

# Frontend URL (your Vercel URL)
FRONTEND_URL=https://your-project.vercel.app

# Email Settings (optional)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Server Settings
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=False
```

### Frontend Environment Variables (Vercel)

Add these in Vercel dashboard → Your Project → Settings → Environment Variables:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
```

---

## Post-Deployment Steps

### 1. Initialize Database

After backend is deployed, initialize the database:

1. SSH into Render or use Render Shell:
```bash
# In Render dashboard → Your Service → Shell
cd /opt/render/project/src
python init_db.py
```

Or create an initialization endpoint in your backend.

### 2. Update CORS Settings

Update `backend/app/main.py` to allow your frontend domain:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-project.vercel.app",
        "http://localhost:3000"  # For local development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 3. Test Your Deployment

1. Visit your frontend URL: `https://your-project.vercel.app`
2. Test registration/login
3. Test API endpoints
4. Check backend logs in Render dashboard

---

## Alternative Hosting Options

### Frontend Alternatives

1. **Netlify** (free)
   - Similar to Vercel
   - Good for static sites and Next.js
   - [netlify.com](https://netlify.com)

2. **GitHub Pages** (free)
   - Limited (static sites only)
   - Not ideal for Next.js with SSR

### Backend Alternatives

1. **Railway** (free tier with $5 credit/month)
   - Easy deployment
   - Good for Python apps
   - [railway.app](https://railway.app)

2. **Fly.io** (free tier)
   - Global edge deployment
   - Good performance
   - [fly.io](https://fly.io)

3. **PythonAnywhere** (free tier)
   - Python-focused
   - Limited free tier
   - [pythonanywhere.com](https://pythonanywhere.com)

### Database Alternatives

1. **Supabase** (free tier)
   - PostgreSQL database
   - Additional features (auth, storage)
   - [supabase.com](https://supabase.com)

2. **Neon** (free tier)
   - Serverless PostgreSQL
   - Good for serverless backends
   - [neon.tech](https://neon.tech)

---

## Quick Start Checklist

- [ ] Push frontend code to GitHub
- [ ] Push backend code to GitHub
- [ ] Deploy frontend to Vercel
- [ ] Deploy backend to Render
- [ ] Set up PostgreSQL database on Render
- [ ] Configure environment variables
- [ ] Initialize database
- [ ] Update CORS settings
- [ ] Test all functionality
- [ ] Update frontend API URL
- [ ] Test email verification (if configured)

---

## Troubleshooting

### Backend not starting
- Check Render logs
- Verify `requirements.txt` is correct
- Check `Procfile` format
- Verify environment variables

### Frontend can't connect to backend
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify CORS settings in backend
- Check backend is running (Render dashboard)

### Database errors
- Verify `DATABASE_URL` is correct
- Check database is running (Render dashboard)
- Run `init_db.py` to create tables

### Email not working
- Email service requires SMTP configuration
- For development, check console logs for verification URLs
- Configure SMTP settings in environment variables

---

## Cost Breakdown

| Service | Plan | Cost |
|---------|------|------|
| Vercel | Hobby | $0/month |
| Render (Backend) | Free | $0/month |
| Render (PostgreSQL) | Free | $0/month |
| **Total** | | **$0/month** |

**Note**: Free tiers have limitations:
- Render free tier: Spins down after 15 minutes of inactivity
- Vercel: Generous free tier, suitable for most projects
- Database: Free tier has size/connection limits

---

## Next Steps

1. Set up custom domain (optional, costs ~$10-15/year)
2. Configure email service (Gmail App Password)
3. Set up monitoring (optional)
4. Configure backups for database
5. Set up CI/CD for automatic deployments

---

## Support

For issues:
1. Check Render logs: Dashboard → Your Service → Logs
2. Check Vercel logs: Dashboard → Your Project → Deployments → View Function Logs
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly

---

**Happy Deploying! 🚀**

