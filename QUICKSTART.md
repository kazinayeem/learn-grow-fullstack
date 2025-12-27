# Quick Start Guide

## 🚀 Fastest Way to Get Started

### Windows Users

1. **Double-click** `start.cmd` in the project root
   - This will automatically install all dependencies
   - Start both backend and frontend servers

### macOS / Linux Users

1. Make the script executable:
   ```bash
   chmod +x start.sh
   ```

2. **Run** the script:
   ```bash
   ./start.sh
   ```

### Manual Setup (If Scripts Don't Work)

```bash
# Navigate to project root
cd learn-grow-fullstack

# Install root dependencies
npm install

# Install backend dependencies
cd grow-backend
npm install
cd ..

# Install frontend dependencies
cd learn-grow
npm install
cd ..

# Start development servers
npm run dev
```

## ⚙️ Environment Setup

### 1. Backend Configuration (.env)

Create `grow-backend/.env`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/grow
JWT_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret
FRONTEND_URL=http://localhost:3000
```

### 2. Frontend Configuration (.env.local)

Create `learn-grow/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

## 🌐 Accessing the Application

After starting the servers:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health**: http://localhost:5000/health

## 🧪 Testing the Authentication

### 1. Create Account
- Go to: http://localhost:3000/register
- Choose your role (Student/Instructor/Guardian)
- Enter email or phone
- OTP will be shown in backend console
- Complete registration

### 2. Login
- Go to: http://localhost:3000/login
- Use your credentials
- You'll be redirected to your role's dashboard

### 3. Google Login
- Click "Login with Google" button
- Complete Google authentication
- Automatically redirected to dashboard

## 📦 What's Included

### Backend
- ✅ JWT Authentication (Access + Refresh Tokens)
- ✅ OTP Verification (Email + SMS ready)
- ✅ User Registration & Login
- ✅ Password Management
- ✅ Google OAuth 2.0
- ✅ Role-Based Access Control
- ✅ MongoDB Integration
- ✅ TypeScript
- ✅ Express.js

### Frontend
- ✅ Responsive UI (NextUI Components)
- ✅ Registration with Role Selection
- ✅ Login (Email/Phone)
- ✅ Google Login Integration
- ✅ Token Management (Cookies)
- ✅ Automatic Token Refresh
- ✅ Role-Based Routing
- ✅ Toast Notifications
- ✅ Next.js 16
- ✅ React

## 🔑 Key Credentials to Set Up

### Google OAuth
1. Go to: https://console.cloud.google.com
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web Application)
5. Add redirect URI: `http://localhost:5000/api/auth/google/callback`
6. Copy Client ID and Secret to .env files

### Email Service (Gmail)
1. Enable 2-factor authentication on Gmail
2. Generate "App Password": https://myaccount.google.com/apppasswords
3. Use App Password in EMAIL_PASSWORD

### MongoDB
1. **Local**: Ensure MongoDB is running (`mongod`)
2. **Cloud**: Use MongoDB Atlas connection string

## 🆘 Common Issues

### "Cannot find module 'concurrently'"
```bash
npm install concurrently --save-dev
```

### Ports Already in Use
- Change PORT in `grow-backend/.env`
- Change port in `learn-grow/package.json` dev script

### Google Login Not Working
- Verify credentials in Google Cloud Console
- Check redirect URI matches exactly
- Clear browser cookies and cache

### Email Not Sending
- Use Gmail App Password (not regular password)
- Enable "Less Secure Apps" (if not using App Password)
- Check SMTP settings in .env

## 📚 API Examples

### Send OTP
```bash
curl -X POST http://localhost:5000/api/users/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

### Register
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"John Doe",
    "email":"john@example.com",
    "password":"password123",
    "role":"student"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

## 📝 Next Steps

1. ✅ Run the application
2. ✅ Create test accounts with different roles
3. ✅ Test OTP flow
4. ✅ Test Google OAuth
5. ✅ Explore role-based dashboards
6. ✅ Check token refresh mechanism
7. ✅ Customize UI and flows as needed

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [JWT.io](https://jwt.io/)
- [NextUI Components](https://nextui.org/)

## 📞 Support

If you encounter issues:

1. Check browser console (F12)
2. Check terminal/server logs
3. Verify all .env variables are set
4. Ensure ports are not in use
5. Check MongoDB connection

---

**You're all set!** 🎉 Start building amazing features!
