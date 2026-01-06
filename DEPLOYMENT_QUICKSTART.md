# 🚀 Quick Deployment Guide - 5 Minutes

## Step 1: Prepare Your Code

### Frontend
1. Make sure `frontend/lib/api.ts` uses `process.env.NEXT_PUBLIC_API_URL`
2. Commit and push to GitHub (**use a PRIVATE repository**)

### Backend  
1. Make sure `backend/Procfile` exists
2. Make sure `backend/requirements.txt` is up to date
3. Commit and push to GitHub (**use a PRIVATE repository**)

> **🔒 Privacy**: GitHub offers **FREE private repositories**! When creating your repo, select "Private" instead of "Public". Your code stays completely private.

## Step 2: Deploy Backend (Render)

1. Go to [render.com](https://render.com) → Sign up
2. Click "New +" → "Web Service"
3. Connect GitHub → Select your **private** repo (Render can access private repos)
4. Settings:
   - **Name**: `medevidence-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free
5. Add Environment Variables:
   ```
   # Required
   GROQ_API_KEY=your-groq-key
   SECRET_KEY=your-random-secret-key-here
   FRONTEND_URL=https://your-frontend.vercel.app
   DEBUG=False

   # Database (recommended: Postgres on Render)
   # DATABASE_URL=postgresql://...
   DATABASE_URL=sqlite:///./researchgpt.db
   ```
6. Click "Create Web Service"
7. Wait for deployment (5-10 minutes)
8. Copy your backend URL: `https://medevidence-backend.onrender.com`

## Step 3: Deploy Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) → Sign up
2. Click "Add New Project"
3. Import GitHub repo (Vercel can access **private** repos - your code stays private!)
4. Settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Environment Variable**:
     - `NEXT_PUBLIC_API_URL` = `https://medevidence-backend.onrender.com`
5. Click "Deploy"
6. Your site is live! 🎉

## Step 4: Initialize Database

After backend deploys:
1. Go to Render dashboard → Your backend service → Shell
2. Run: `python init_db.py`
3. Or visit: `https://your-backend.onrender.com/api/docs` to test

## Step 5: Update CORS

Update `backend/app/main.py` CORS origins with your Vercel URL.

## Done! ✅

Your app is live at: `https://your-project.vercel.app`

---

**Need help?** Check `DEPLOYMENT_GUIDE.md` for detailed instructions.

