# 🔧 Fixing Dashboard "Something Went Wrong" Error

## The Problem

When you click the dashboard option, you get an error. This is likely because:

1. **Database tables not created** - The dashboard tables need to be initialized
2. **Backend not running** - The API server needs to be running
3. **Database connection issue** - SQLite database might not be accessible

## Solution

### Step 1: Initialize Database Tables

Run this command to create all dashboard tables:

```bash
cd backend

# Activate virtual environment (if not already activated)
# Windows:
venv\Scripts\activate

# Mac/Linux:
source venv/bin/activate

# Initialize database (creates all tables including dashboard tables)
python init_db.py
```

You should see:
```
Database tables created successfully!
```

### Step 2: Verify Backend is Running

Make sure your backend server is running:

```bash
cd backend
uvicorn app.main:app --reload
```

The server should be running on `http://localhost:8000`

### Step 3: Test Dashboard API

Open your browser and test the dashboard stats endpoint:

```
http://localhost:8000/api/dashboard/stats
```

**Note:** You'll need to be logged in (have a valid auth token) to access this endpoint.

### Step 4: Check Browser Console

Open your browser's developer console (F12) and check for any errors when clicking the dashboard. Common errors:

- **401 Unauthorized** - You're not logged in
- **404 Not Found** - Backend not running or wrong URL
- **500 Internal Server Error** - Database tables missing or backend error

## Quick Fix Script

I've created a script to check and create tables:

```bash
cd backend
python check_dashboard_tables.py
```

This will:
- Check if dashboard tables exist
- Create missing tables if needed
- Show all tables in the database

## Common Issues

### Issue 1: "Failed to load dashboard data"
- **Solution:** Run `python init_db.py` to create tables
- **Verify:** Check that `researchgpt.db` file exists in backend directory

### Issue 2: "401 Unauthorized"
- **Solution:** Make sure you're logged in
- **Check:** Open browser DevTools → Network tab → Check if auth token is being sent

### Issue 3: "Network Error" or "CORS Error"
- **Solution:** Make sure backend is running on port 8000
- **Check:** Visit `http://localhost:8000/docs` to verify backend is running

### Issue 4: Database locked
- **Solution:** Close any other processes using the database
- **Check:** Make sure only one backend instance is running

## Verify Everything Works

1. **Backend running:** `http://localhost:8000/docs` shows API documentation
2. **Database initialized:** `python init_db.py` runs without errors
3. **Frontend running:** `http://localhost:3000` loads correctly
4. **Logged in:** You can see your profile/user info in the header
5. **Dashboard loads:** Click dashboard and it should load without errors

## Still Having Issues?

Check the browser console (F12) and backend logs for specific error messages. The error will tell us exactly what's wrong!



