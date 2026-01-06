# 🚀 Deployment Instructions

## Quick Start (5 Minutes)

1. **Deploy Backend** → [Render.com](https://render.com)
2. **Deploy Frontend** → [Vercel.com](https://vercel.com)
3. **Done!** Your app is live 🎉

See `DEPLOYMENT_QUICKSTART.md` for step-by-step instructions.

## 🔒 Keep Your Code Private

**GitHub offers FREE private repositories!** When creating your repo, simply select "Private" instead of "Public". Your code stays completely private, and both Vercel and Render work perfectly with private repositories.

See `PRIVATE_DEPLOYMENT.md` for detailed privacy options.

## Detailed Guide

See `DEPLOYMENT_GUIDE.md` for comprehensive deployment instructions.

## Files Created for Deployment

- `backend/Procfile` - Tells Render how to run your app
- `backend/runtime.txt` - Specifies Python version
- `backend/render.yaml` - Render configuration (optional)
- `.gitignore` - Prevents committing sensitive files

## Important Notes

1. **Free Tier Limitations**:
   - Render free tier spins down after 15 min inactivity (first request may be slow)
   - Vercel free tier is generous and suitable for production

2. **Environment Variables**:
   - Set `NEXT_PUBLIC_API_URL` in Vercel (frontend)
   - Set `DATABASE_URL`, `SECRET_KEY`, etc. in Render (backend)

3. **Database**:
   - Use SQLite for simple deployments
   - Use PostgreSQL (Render free tier) for production

4. **CORS**:
   - Backend automatically allows your frontend URL
   - Update `FRONTEND_URL` environment variable

## Need Help?

Check the deployment guides or common issues in `DEPLOYMENT_GUIDE.md`.

