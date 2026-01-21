# 🚀 Quick Start Guide - Fixing "ModuleNotFoundError: No module named 'app'"

## The Problem

When you run `uvicorn app.main:app`, you get:
```
ModuleNotFoundError: No module named 'app'
```

This happens because Python can't find the `app` module.

## The Solution

**You MUST run the command from the `backend` directory!**

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Activate Virtual Environment

**Windows:**
```bash
venv\Scripts\activate
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

### Step 3: Run the Server

**Option 1: Using uvicorn directly (must be in backend directory)**
```bash
uvicorn app.main:app --reload
```

**Option 2: Using the helper script (works from any directory)**
```bash
python run_server.py
```

**Option 3: Windows batch file**
```bash
run_server.bat
```

**Option 4: Mac/Linux shell script**
```bash
chmod +x run_server.sh
./run_server.sh
```

## Verify It's Working

1. Open your browser and go to: `http://localhost:8000/docs`
2. You should see the FastAPI documentation page
3. Test the health endpoint: `http://localhost:8000/health`

## Common Issues

### Issue 1: Still getting "ModuleNotFoundError"
- **Solution:** Make sure you're in the `backend` directory
- Check: Run `pwd` (Mac/Linux) or `cd` (Windows) to see current directory
- The `app` folder should be visible in the current directory

### Issue 2: "uvicorn: command not found"
- **Solution:** Activate your virtual environment first
- Make sure you installed dependencies: `pip install -r requirements.txt`

### Issue 3: Port 8000 already in use
- **Solution:** Use a different port:
  ```bash
  uvicorn app.main:app --reload --port 8001
  ```

## Quick Test

Run this to verify everything is set up correctly:

```bash
cd backend
python -c "from app.main import app; print('✓ Success!')"
```

If this works, you're ready to run the server!





