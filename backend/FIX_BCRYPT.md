# 🔧 Fixing bcrypt Compatibility Issue

## Problem

You're getting this error:
```
AttributeError: module 'bcrypt' has no attribute '__about__'
```

This happens because `passlib` 1.7.4 is not compatible with `bcrypt` 4.0.0+.

## Solution

### Option 1: Use Virtual Environment (Recommended)

1. **Activate your virtual environment:**
   ```bash
   cd backend
   
   # Windows:
   venv\Scripts\activate
   
   # Mac/Linux:
   source venv/bin/activate
   ```

2. **Reinstall bcrypt with compatible version:**
   ```bash
   pip uninstall -y bcrypt
   pip install "bcrypt<4.0.0"
   ```

3. **Verify it works:**
   ```bash
   python -c "from passlib.context import CryptContext; ctx = CryptContext(schemes=['bcrypt']); print('✓ Success!')"
   ```

### Option 2: Update requirements.txt and reinstall

The `requirements.txt` has been updated to pin bcrypt to a compatible version:

```bash
cd backend
pip install -r requirements.txt --force-reinstall
```

## Verification

Test that everything works:

```bash
cd backend
python -c "from app.core.security import pwd_context; print('✓ Security module works!')"
```

## Note

If you see a warning about `chromadb` requiring `bcrypt>=4.0.1`, you can ignore it - we're not using chromadb in this project.

## Alternative: Use bcrypt directly (if issues persist)

If you continue having problems, we can modify `backend/app/core/security.py` to use bcrypt directly instead of passlib. Let me know if you need this alternative solution.





