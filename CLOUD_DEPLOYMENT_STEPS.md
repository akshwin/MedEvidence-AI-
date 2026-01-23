# 🚀 Cloud Deployment Steps - MedEvidence AI

**Complete guide to deploy your MedEvidence AI application to the cloud for FREE**

---

## 📋 Overview

This guide will walk you through deploying your application using:
- **Frontend**: Vercel (Free tier - Perfect for Next.js)
- **Backend**: Render (Free tier - Python/FastAPI)
- **Database**: Render PostgreSQL (Free tier) or SQLite

**Total Cost**: $0/month

**Deployment Time**: ~30-45 minutes

---

## ✅ Prerequisites Checklist

Before you start, make sure you have:

- [ ] GitHub account (sign up at [github.com](https://github.com))
- [ ] Vercel account (sign up at [vercel.com](https://vercel.com))
- [ ] Render account (sign up at [render.com](https://render.com))
- [ ] Groq API key (get from [console.groq.com](https://console.groq.com))
- [ ] Pinecone API key (get from [pinecone.io](https://pinecone.io))
- [ ] Git installed on your computer

---

## 🎯 Step-by-Step Deployment

### **STEP 1: Prepare Your GitHub Repository**

#### 1.1 Create a GitHub Account (if you don't have one)
1. Go to [github.com](https://github.com)
2. Click "Sign up"
3. Follow the registration process

#### 1.2 Create a New Repository
1. Click the "+" icon in the top-right corner
2. Select "New repository"
3. Configure:
   - **Repository name**: `medevidence-ai` (or any name you prefer)
   - **Visibility**: Select **"Private"** (your code stays private - FREE!)
   - **DO NOT** initialize with README (we'll push existing code)
4. Click "Create repository"

#### 1.3 Push Your Code to GitHub

Open your terminal/command prompt and navigate to your project:

```bash
# Navigate to your project directory
cd c:\Users\akshw\Desktop\MedEvidence-AI-

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit your code
git commit -m "Initial commit - MedEvidence AI"

# Add your GitHub repository as remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/medevidence-ai.git

# Push to GitHub
git branch -M main
git push -u origin main
```

> **Note**: Replace `YOUR_USERNAME` with your actual GitHub username

✅ **Checkpoint**: Your code is now on GitHub! Verify by visiting your repository URL.

---

### **STEP 2: Deploy Backend to Render**

#### 2.1 Create Render Account
1. Go to [render.com](https://render.com)
2. Click "Get Started"
3. Sign up with GitHub (recommended - easier integration)

#### 2.2 Create a New Web Service
1. In Render dashboard, click **"New +"** button
2. Select **"Web Service"**
3. Click **"Connect account"** to link your GitHub
4. Find and select your `medevidence-ai` repository
5. Click **"Connect"**

#### 2.3 Configure Web Service Settings

Fill in the following settings:

| Setting | Value |
|---------|-------|
| **Name** | `medevidence-backend` |
| **Region** | Choose closest to you (e.g., Oregon, Frankfurt) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| **Instance Type** | **Free** |

#### 2.4 Add Environment Variables

Click **"Advanced"** and add these environment variables:

```env
# Required - LLM API Key
GROQ_API_KEY=your_actual_groq_api_key_here

# Required - Vector Database
PINECONE_API_KEY=your_actual_pinecone_api_key_here
PINECONE_ENVIRONMENT=us-east-1

# Required - Security (generate a random string)
SECRET_KEY=your_super_secret_random_key_change_this_now

# Required - Frontend URL (we'll update this after deploying frontend)
FRONTEND_URL=https://temporary-placeholder.vercel.app

# Database - Start with SQLite for simplicity
DATABASE_URL=sqlite:///./researchgpt.db

# Production settings
DEBUG=False
API_HOST=0.0.0.0
API_PORT=8000
```

> **Important**: 
> - Replace `your_actual_groq_api_key_here` with your real Groq API key
> - Replace `your_actual_pinecone_api_key_here` with your real Pinecone API key
> - For `SECRET_KEY`, generate a random string (e.g., use a password generator)

#### 2.5 Deploy Backend
1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Watch the logs - you should see "Build successful" and "Deploy live"

#### 2.6 Get Your Backend URL
1. Once deployed, you'll see your service URL at the top
2. It will look like: `https://medevidence-backend.onrender.com`
3. **Copy this URL** - you'll need it for the frontend!

✅ **Checkpoint**: Test your backend by visiting `https://your-backend-url.onrender.com/docs` - you should see the API documentation.

---

### **STEP 3: Deploy Frontend to Vercel**

#### 3.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Sign up with GitHub (recommended)

#### 3.2 Import Your Project
1. Click **"Add New..."** → **"Project"**
2. Click **"Import Git Repository"**
3. Find and select your `medevidence-ai` repository
4. Click **"Import"**

#### 3.3 Configure Project Settings

| Setting | Value |
|---------|-------|
| **Framework Preset** | Next.js |
| **Root Directory** | `frontend` (click "Edit" to change) |
| **Build Command** | `npm run build` (auto-detected) |
| **Output Directory** | `.next` (auto-detected) |
| **Install Command** | `npm install` (auto-detected) |

#### 3.4 Add Environment Variables

Click **"Environment Variables"** and add:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
```

> **Important**: Replace `https://your-backend-url.onrender.com` with your actual Render backend URL from Step 2.6

#### 3.5 Deploy Frontend
1. Click **"Deploy"**
2. Wait for deployment (3-5 minutes)
3. You'll see "Congratulations!" when done

#### 3.6 Get Your Frontend URL
1. Your site will be live at: `https://your-project-name.vercel.app`
2. **Copy this URL**

✅ **Checkpoint**: Visit your frontend URL - you should see your MedEvidence AI homepage!

---

### **STEP 4: Update Backend CORS Settings**

Now we need to update the backend to allow requests from your frontend.

#### 4.1 Update Environment Variables in Render
1. Go back to Render dashboard
2. Click on your `medevidence-backend` service
3. Click **"Environment"** in the left sidebar
4. Find `FRONTEND_URL` and update it to your Vercel URL:
   ```
   FRONTEND_URL=https://your-project-name.vercel.app
   ```
5. Click **"Save Changes"**
6. Render will automatically redeploy (takes 2-3 minutes)

✅ **Checkpoint**: Your frontend and backend are now connected!

---

### **STEP 5: Initialize Database**

#### 5.1 Initialize Database Tables
1. In Render dashboard, go to your backend service
2. Click **"Shell"** in the left sidebar
3. Run the following command:
   ```bash
   python init_db.py
   ```
4. You should see "Database initialized successfully!"

#### 5.2 (Optional) Initialize Analytics Tables
If you want analytics tracking:
```bash
python init_dashboard_tables.py
```

✅ **Checkpoint**: Database is ready!

---

### **STEP 6: Test Your Deployment**

#### 6.1 Test Backend
1. Visit: `https://your-backend-url.onrender.com/docs`
2. You should see the FastAPI documentation
3. Try the `/health` endpoint - should return `{"status": "healthy"}`

#### 6.2 Test Frontend
1. Visit: `https://your-project-name.vercel.app`
2. You should see the MedEvidence AI homepage
3. Try navigating to different pages

#### 6.3 Test Full Integration
1. Go to the Research page
2. Try asking a medical question
3. Check if you get a response

✅ **Checkpoint**: Everything is working!

---

## 🎉 Deployment Complete!

Your MedEvidence AI application is now live on the internet!

- **Frontend**: `https://your-project-name.vercel.app`
- **Backend**: `https://your-backend-url.onrender.com`

---

## 🔧 Post-Deployment Configuration

### Optional: Set Up Custom Domain

#### For Vercel (Frontend)
1. Go to Vercel dashboard → Your project
2. Click **"Settings"** → **"Domains"**
3. Add your custom domain
4. Follow DNS configuration instructions

#### For Render (Backend)
1. Go to Render dashboard → Your service
2. Click **"Settings"** → **"Custom Domain"**
3. Add your custom domain
4. Follow DNS configuration instructions

### Optional: Upgrade Database to PostgreSQL

For better performance and reliability:

1. In Render dashboard, click **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name**: `medevidence-db`
   - **Plan**: Free
3. Copy the **Internal Database URL**
4. Update your backend environment variable:
   ```
   DATABASE_URL=postgresql://user:password@host:5432/dbname
   ```
5. Redeploy and run `python init_db.py` again

---

## 🐛 Troubleshooting

### Backend Not Starting
**Problem**: Backend shows "Deploy failed" or crashes

**Solutions**:
1. Check Render logs: Dashboard → Your Service → Logs
2. Verify all environment variables are set correctly
3. Make sure `requirements.txt` has all dependencies
4. Check `Procfile` is correct

### Frontend Can't Connect to Backend
**Problem**: Frontend shows connection errors

**Solutions**:
1. Verify `NEXT_PUBLIC_API_URL` in Vercel is correct
2. Check backend CORS settings allow your frontend URL
3. Make sure backend is running (check Render dashboard)
4. Check browser console for specific errors

### Database Errors
**Problem**: "Database not found" or connection errors

**Solutions**:
1. Run `python init_db.py` in Render Shell
2. Verify `DATABASE_URL` is correct
3. For PostgreSQL, make sure database is running

### API Key Errors
**Problem**: "Invalid API key" or authentication errors

**Solutions**:
1. Verify `GROQ_API_KEY` is correct in Render
2. Check Pinecone API key is valid
3. Make sure you have credits/quota in your API accounts

### Render Free Tier Sleeping
**Problem**: Backend is slow or times out

**Solution**: Render free tier spins down after 15 minutes of inactivity. First request after sleep takes 30-60 seconds. This is normal for free tier.

---

## 📊 Monitoring Your Deployment

### Check Backend Logs
1. Render Dashboard → Your Service → Logs
2. Monitor for errors or warnings

### Check Frontend Logs
1. Vercel Dashboard → Your Project → Deployments
2. Click on latest deployment → View Function Logs

### Monitor Usage
- **Render**: Dashboard shows CPU, memory usage
- **Vercel**: Dashboard shows bandwidth, function invocations

---

## 🔄 Updating Your Deployment

### Update Frontend
1. Make changes to your code locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update frontend"
   git push
   ```
3. Vercel automatically deploys new changes!

### Update Backend
1. Make changes to your code locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update backend"
   git push
   ```
3. Render automatically deploys new changes!

---

## 💰 Cost Breakdown

| Service | Plan | Cost | Limitations |
|---------|------|------|-------------|
| **Vercel** | Hobby | $0/month | 100GB bandwidth, unlimited sites |
| **Render** | Free | $0/month | 750 hours/month, spins down after 15min |
| **Render PostgreSQL** | Free | $0/month | 1GB storage, 97 connection limit |
| **GitHub** | Free | $0/month | Unlimited private repos |
| **Total** | | **$0/month** | |

---

## 🚀 Next Steps

1. **Set up monitoring**: Add error tracking (Sentry)
2. **Configure email**: Set up SMTP for contact form
3. **Add analytics**: Track user behavior
4. **Custom domain**: Add your own domain name
5. **Upgrade if needed**: Consider paid tiers for production use

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

## 🆘 Need Help?

If you encounter issues:

1. **Check the logs** (Render and Vercel dashboards)
2. **Review environment variables** (most common issue)
3. **Test locally first** (make sure it works on your computer)
4. **Check API quotas** (Groq, Pinecone limits)

---

## ✅ Deployment Checklist

Use this checklist to track your progress:

- [ ] Created GitHub account
- [ ] Created private GitHub repository
- [ ] Pushed code to GitHub
- [ ] Created Render account
- [ ] Deployed backend to Render
- [ ] Added all backend environment variables
- [ ] Got backend URL
- [ ] Created Vercel account
- [ ] Deployed frontend to Vercel
- [ ] Added frontend environment variable
- [ ] Got frontend URL
- [ ] Updated backend CORS settings
- [ ] Initialized database
- [ ] Tested backend API
- [ ] Tested frontend website
- [ ] Tested full integration
- [ ] Application is live! 🎉

---

**Congratulations! Your MedEvidence AI application is now live on the cloud! 🚀**

Share your deployment URL and start helping medical researchers worldwide!
