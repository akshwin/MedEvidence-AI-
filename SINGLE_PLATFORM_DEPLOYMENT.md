# 🚀 Single Platform Deployment - MedEvidence AI

**Deploy your entire application (frontend + backend) on ONE platform**

---

## 📋 Overview

Instead of using separate platforms (Vercel + Render), you can deploy everything together on a single platform. This simplifies management and configuration.

---

## 🎯 Best Single-Platform Options

### **Option 1: Render (Recommended - Easiest)**
- ✅ **Free tier available**
- ✅ **Easy to set up**
- ✅ **Includes database**
- ✅ **Auto-deploys from GitHub**
- ⚠️ Spins down after 15 minutes of inactivity (free tier)

### **Option 2: Railway**
- ✅ **$5 free credit/month**
- ✅ **Very developer-friendly**
- ✅ **Great performance**
- ⚠️ Requires credit card (but free tier available)

### **Option 3: Fly.io**
- ✅ **Free tier available**
- ✅ **Global edge deployment**
- ✅ **Great performance**
- ⚠️ More complex configuration

### **Option 4: DigitalOcean App Platform**
- ✅ **Simple deployment**
- ✅ **Good documentation**
- ⚠️ Costs $5/month (no free tier)

### **Option 5: Heroku**
- ✅ **Easy to use**
- ⚠️ No longer has free tier ($7/month minimum)

---

## 🏆 Recommended: Deploy Everything on Render

This is the **easiest and FREE** option for deploying your entire application.

---

## 📝 Step-by-Step: Full Deployment on Render

### **Prerequisites**
- [ ] GitHub account
- [ ] Render account ([render.com](https://render.com))
- [ ] Groq API key
- [ ] Pinecone API key

---

### **STEP 1: Prepare Your Code**

#### 1.1 Create a Unified Structure

We need to modify your project slightly to serve the frontend from the backend.

**Option A: Serve Next.js from FastAPI (Recommended)**

Create a new file `backend/serve_frontend.py`:

```python
from fastapi.staticfiles import StaticFiles
from pathlib import Path

# Add this to your main.py after creating the app
frontend_build = Path(__file__).parent.parent / "frontend" / ".next"
if frontend_build.exists():
    app.mount("/_next", StaticFiles(directory=str(frontend_build)), name="next-static")
    app.mount("/", StaticFiles(directory=str(Path(__file__).parent.parent / "frontend" / "out"), html=True), name="frontend")
```

**Option B: Use Render's Multiple Services (Simpler)**

Keep frontend and backend separate but manage them in one place.

---

### **STEP 2: Push to GitHub**

```bash
cd c:\Users\akshw\Desktop\MedEvidence-AI-

git init
git add .
git commit -m "Initial commit for Render deployment"
git remote add origin https://github.com/YOUR_USERNAME/medevidence-ai.git
git branch -M main
git push -u origin main
```

---

### **STEP 3: Deploy Backend on Render**

#### 3.1 Create Backend Service

1. Go to [render.com](https://render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `medevidence-backend` |
| **Root Directory** | `backend` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| **Plan** | **Free** |

#### 3.2 Add Environment Variables

```env
GROQ_API_KEY=your_groq_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=us-east-1
SECRET_KEY=your_random_secret_key
FRONTEND_URL=https://medevidence-frontend.onrender.com
DATABASE_URL=sqlite:///./researchgpt.db
DEBUG=False
```

5. Click **"Create Web Service"**
6. Copy your backend URL: `https://medevidence-backend.onrender.com`

---

### **STEP 4: Deploy Frontend on Render**

#### 4.1 Create Static Site Service

1. In Render dashboard, click **"New +"** → **"Static Site"**
2. Connect the same GitHub repository
3. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `medevidence-frontend` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `.next` |

#### 4.2 Add Environment Variable

```env
NEXT_PUBLIC_API_URL=https://medevidence-backend.onrender.com
```

4. Click **"Create Static Site"**
5. Your frontend URL: `https://medevidence-frontend.onrender.com`

---

### **STEP 5: Set Up Database (Optional - PostgreSQL)**

1. Click **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name**: `medevidence-db`
   - **Plan**: **Free**
3. Copy the **Internal Database URL**
4. Update backend environment variable:
   ```
   DATABASE_URL=postgresql://user:password@host:5432/dbname
   ```

---

### **STEP 6: Initialize Database**

1. Go to backend service → **"Shell"**
2. Run:
   ```bash
   python init_db.py
   ```

---

## 🎉 Done! Everything is on Render

- **Frontend**: `https://medevidence-frontend.onrender.com`
- **Backend**: `https://medevidence-backend.onrender.com`
- **Database**: Managed on Render
- **All in one dashboard!**

---

## 🚂 Alternative: Deploy Everything on Railway

Railway is another excellent single-platform option with great developer experience.

### **Quick Railway Deployment**

#### 1. Install Railway CLI

```bash
npm install -g @railway/cli
```

#### 2. Login to Railway

```bash
railway login
```

#### 3. Initialize Project

```bash
cd c:\Users\akshw\Desktop\MedEvidence-AI-
railway init
```

#### 4. Deploy Backend

```bash
cd backend
railway up
```

#### 5. Deploy Frontend

```bash
cd ../frontend
railway up
```

#### 6. Add Environment Variables

```bash
# Backend
railway variables set GROQ_API_KEY=your_key
railway variables set SECRET_KEY=your_secret

# Frontend
railway variables set NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

---

## ✈️ Alternative: Deploy on Fly.io

### **Quick Fly.io Deployment**

#### 1. Install Fly CLI

```bash
# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex
```

#### 2. Login

```bash
fly auth login
```

#### 3. Create fly.toml for Backend

Create `backend/fly.toml`:

```toml
app = "medevidence-backend"

[build]
  builder = "paketobuildpacks/builder:base"

[env]
  PORT = "8000"

[[services]]
  http_checks = []
  internal_port = 8000
  processes = ["app"]
  protocol = "tcp"

  [[services.ports]]
    force_https = true
    handlers = ["http"]
    port = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443
```

#### 4. Deploy Backend

```bash
cd backend
fly launch
fly deploy
```

#### 5. Deploy Frontend

```bash
cd ../frontend
fly launch
fly deploy
```

---

## 📊 Comparison Table

| Platform | Free Tier | Ease of Use | Performance | Database Included |
|----------|-----------|-------------|-------------|-------------------|
| **Render** | ✅ Yes | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ✅ Yes (PostgreSQL) |
| **Railway** | ⚠️ $5 credit | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ Yes (PostgreSQL) |
| **Fly.io** | ✅ Yes | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ Yes (PostgreSQL) |
| **Vercel + Render** | ✅ Yes | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⚠️ Separate |

---

## 🎯 Which Option Should You Choose?

### **Choose Render if:**
- ✅ You want the simplest setup
- ✅ You want everything FREE
- ✅ You don't mind 15-minute spin-down (free tier)
- ✅ You want built-in database

### **Choose Railway if:**
- ✅ You want best developer experience
- ✅ You're okay with $5/month credit requirement
- ✅ You want better performance
- ✅ You want faster deployments

### **Choose Fly.io if:**
- ✅ You need global edge deployment
- ✅ You want best performance
- ✅ You're comfortable with more technical setup
- ✅ You need low latency worldwide

### **Choose Vercel + Render if:**
- ✅ You want best Next.js performance (Vercel is built for Next.js)
- ✅ You want FREE tier
- ✅ You don't mind managing two platforms
- ✅ You want automatic frontend deployments

---

## 💡 My Recommendation

**For your use case (MedEvidence AI), I recommend:**

### **Option 1: Render (Both Services)** - Best for simplicity
- Deploy both frontend and backend on Render
- Everything in one dashboard
- Completely FREE
- Easy to manage

### **Option 2: Vercel + Render** - Best for performance
- Frontend on Vercel (optimized for Next.js)
- Backend on Render
- Both FREE
- Better frontend performance

**Start with Render for everything, then migrate frontend to Vercel later if you need better performance.**

---

## 🔄 Migration Path

If you start with one platform and want to switch:

1. **Export environment variables**
2. **Deploy to new platform**
3. **Update DNS/URLs**
4. **Test thoroughly**
5. **Delete old deployment**

---

## ✅ Quick Start Checklist (Render - Single Platform)

- [ ] Create GitHub repository
- [ ] Push code to GitHub
- [ ] Create Render account
- [ ] Deploy backend service
- [ ] Deploy frontend static site
- [ ] (Optional) Create PostgreSQL database
- [ ] Add environment variables
- [ ] Initialize database
- [ ] Test deployment
- [ ] Application is live! 🎉

---

## 🆘 Need Help?

**Common Issues:**

1. **Build fails**: Check build logs in Render dashboard
2. **Environment variables**: Make sure all required vars are set
3. **Database connection**: Verify DATABASE_URL is correct
4. **CORS errors**: Update FRONTEND_URL in backend

---

**Ready to deploy? Follow the steps above and your app will be live in 30 minutes! 🚀**
