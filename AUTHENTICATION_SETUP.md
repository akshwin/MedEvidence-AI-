# 🔐 Authentication System Setup Guide

## ✅ What's Been Implemented

### Backend Features:
1. ✅ User registration with email verification
2. ✅ User login with JWT tokens
3. ✅ Email verification system
4. ✅ Password reset functionality
5. ✅ Password change (authenticated users)
6. ✅ User profile management
7. ✅ Session management with JWT
8. ✅ Protected routes

### Frontend Features:
1. ✅ Login page (`/login`)
2. ✅ Signup page (`/signup`)
3. ✅ Email verification page (`/verify-email`)
4. ✅ Forgot password page (`/forgot-password`)
5. ✅ Reset password page (`/reset-password`)
6. ✅ User profile page (`/profile`)
7. ✅ Auth context provider
8. ✅ Protected route handling

---

## 🚀 Setup Instructions

### 1. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

New dependencies added:
- `python-jose[cryptography]` - JWT token handling
- `passlib[bcrypt]` - Password hashing
- `email-validator` - Email validation

### 2. Initialize Database

```bash
cd backend
python init_db.py
```

This will create the database tables:
- `users` - User accounts
- `user_preferences` - User preferences

### 3. Configure Environment Variables

Add to `backend/.env`:

```env
# JWT Secret Key (CHANGE THIS IN PRODUCTION!)
SECRET_KEY=your-super-secret-key-change-this-in-production

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000

# Email Settings (for verification and password reset)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

**Important:** 
- Generate a secure `SECRET_KEY` for production (use `openssl rand -hex 32`)
- For Gmail, use an App Password (not your regular password)
- See `backend/EMAIL_SETUP.md` for email configuration details

### 4. Start Backend Server

```bash
cd backend
uvicorn app.main:app --reload
```

### 5. Start Frontend

```bash
cd frontend
npm install  # If you haven't already
npm run dev
```

---

## 📝 API Endpoints

### Authentication Endpoints

#### `POST /api/auth/register`
Register a new user
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "full_name": "John Doe" // optional
}
```

#### `POST /api/auth/login`
Login user (OAuth2 form data)
```
username: user@example.com
password: securepassword123
```

Returns:
```json
{
  "access_token": "jwt-token-here",
  "token_type": "bearer",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "full_name": "John Doe",
    "is_verified": false,
    "is_active": true
  }
}
```

#### `GET /api/auth/me`
Get current user info (requires authentication)
Headers: `Authorization: Bearer <token>`

#### `POST /api/auth/verify-email`
Verify email with token
```json
{
  "token": "verification-token"
}
```

#### `POST /api/auth/resend-verification`
Resend verification email
```json
{
  "email": "user@example.com"
}
```

#### `POST /api/auth/forgot-password`
Request password reset
```json
{
  "email": "user@example.com"
}
```

#### `POST /api/auth/reset-password`
Reset password with token
```json
{
  "token": "reset-token",
  "new_password": "newpassword123"
}
```

#### `POST /api/auth/change-password`
Change password (requires authentication)
```json
{
  "old_password": "oldpassword",
  "new_password": "newpassword123"
}
```

---

## 🎯 Usage Examples

### Frontend Usage

```typescript
import { useAuth } from '@/lib/auth-context'

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth()

  // Login
  await login('user@example.com', 'password123')

  // Check if authenticated
  if (isAuthenticated) {
    console.log('User:', user)
  }

  // Logout
  logout()
}
```

### Protected Routes

The auth context automatically handles:
- Token storage in localStorage
- Token validation
- User state management
- Automatic logout on token expiration

---

## 🔒 Security Features

1. **Password Hashing**: Uses bcrypt for secure password storage
2. **JWT Tokens**: Secure token-based authentication
3. **Email Verification**: Prevents fake accounts
4. **Token Expiration**: Tokens expire after 30 days
5. **Password Reset**: Secure token-based password reset
6. **Rate Limiting**: Can be added for production

---

## 📧 Email Configuration

### Gmail Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use the app password in `SMTP_PASSWORD`

### Email Templates

The system sends:
- **Verification Email**: When user registers
- **Password Reset Email**: When user requests password reset

Email links point to:
- Verification: `{FRONTEND_URL}/verify-email?token={token}`
- Password Reset: `{FRONTEND_URL}/reset-password?token={token}`

---

## 🧪 Testing

### Test User Registration

1. Go to `http://localhost:3000/signup`
2. Fill in email, password, and name
3. Check email for verification link
4. Click verification link
5. Login at `http://localhost:3000/login`

### Test Password Reset

1. Go to `http://localhost:3000/forgot-password`
2. Enter your email
3. Check email for reset link
4. Click reset link and set new password

---

## 🐛 Troubleshooting

### Database Issues
- Make sure `init_db.py` ran successfully
- Check database file exists: `backend/researchgpt.db`
- Delete database file and re-run `init_db.py` to reset

### Email Not Sending
- Check SMTP credentials in `.env`
- Verify Gmail App Password is correct
- Check backend logs for email errors
- Email service will print to console if SMTP not configured

### Token Issues
- Check `SECRET_KEY` is set in `.env`
- Tokens expire after 30 days
- Clear localStorage if having issues: `localStorage.clear()`

### CORS Issues
- Make sure frontend URL is in CORS origins in `backend/app/main.py`
- Check API URL in frontend `.env`: `NEXT_PUBLIC_API_URL`

---

## 📚 Next Steps

1. ✅ Authentication system is complete
2. ⬜ Add user preferences management
3. ⬜ Add user dashboard with saved queries
4. ⬜ Add chat history persistence
5. ⬜ Add user roles and permissions (for enterprise features)

---

## 🎉 Success!

Your authentication system is now fully functional! Users can:
- ✅ Register accounts
- ✅ Login and logout
- ✅ Verify their email
- ✅ Reset forgotten passwords
- ✅ Change passwords
- ✅ View their profile

All authentication is handled securely with JWT tokens and password hashing.




