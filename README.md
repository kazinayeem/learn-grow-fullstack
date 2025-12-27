# Learn & Grow - Full Stack Learning Platform

A complete learning platform with JWT-based authentication, OTP verification, role-based access (Student/Instructor/Guardian), and Google OAuth integration.

## 🚀 Features

- **Complete Authentication System**
  - Email & Phone-based registration
  - OTP (One-Time Password) verification
  - JWT tokens with refresh mechanism
  - Google OAuth 2.0 integration
  - Password management

- **Role-Based Access Control**
  - Student - Learn from courses
  - Instructor - Create and manage courses
  - Guardian - Monitor student progress
  - Admin - System management

- **Full-Stack Architecture**
  - Backend: Express.js + TypeScript + MongoDB
  - Frontend: Next.js 16 + React + NextUI
  - Real-time notifications with React Toastify

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB (local or cloud)
- Google OAuth Credentials

## 🔧 Setup Instructions

### 1. Clone or Navigate to Project

```bash
cd learn-grow-fullstack
```

### 2. Install All Dependencies

```bash
npm run install-all
```

Or manually:

```bash
npm install
cd grow-backend && npm install && cd ..
cd learn-grow && npm install && cd ..
```

### 3. Configure Environment Variables

#### Backend Configuration (grow-backend/.env)

Create a `.env` file based on `.env.example`:

```env
# Backend Environment Variables
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://127.0.0.1:27017/grow

# JWT
JWT_SECRET=your_jwt_secret_key_change_in_production_min_32_chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret_key_change_in_production_min_32_chars
JWT_REFRESH_EXPIRES_IN=30d

# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# SMS Configuration (Optional - Twilio)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

#### Frontend Configuration (learn-grow/.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
NODE_ENV=development
```

### 4. Start Development Server

#### Option A: Run Both Backend & Frontend Together

```bash
npm run dev
```

This will run:
- Backend on: `http://localhost:5000`
- Frontend on: `http://localhost:3000`

#### Option B: Run Separately

**Backend Only:**
```bash
npm run backend:dev
```

**Frontend Only:**
```bash
npm run frontend:dev
```

## 📚 API Endpoints

### Authentication Endpoints

#### Send OTP
```http
POST /api/users/send-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "phone": "+1234567890"
}
```

#### Verify OTP
```http
POST /api/users/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

#### Register User
```http
POST /api/users/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "student"
}
```

#### Login User
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful as student",
  "data": {
    "user": {
      "id": "userId",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "isVerified": true
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

#### Refresh Token
```http
POST /api/users/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}
```

#### Get Profile
```http
GET /api/users/profile
Authorization: Bearer {accessToken}
```

#### Logout
```http
POST /api/users/logout
Authorization: Bearer {accessToken}
```

#### Change Password
```http
POST /api/users/change-password
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "oldPassword": "oldPassword123",
  "newPassword": "newPassword123"
}
```

### Google OAuth
```http
GET /api/auth/google
```

Redirects to Google login, then back to `/auth-callback`

## 🔐 Authentication Flow

### 1. Email/Phone Registration with OTP

```
User -> Send OTP -> Backend (generates OTP, sends via email/SMS)
User -> Verify OTP -> Backend (validates OTP)
User -> Register -> Backend (creates account, returns tokens)
```

### 2. Password Login

```
User -> Login (email/phone + password) -> Backend
Backend -> Validates credentials -> Returns access + refresh tokens
Frontend -> Stores tokens in cookies -> Redirects to dashboard
```

### 3. Google OAuth

```
User -> Click "Login with Google" -> Google OAuth
Google -> Redirects with code -> /api/auth/google/callback
Backend -> Exchanges code for profile -> Creates/Links user
Backend -> Redirects to /auth-callback with tokens
Frontend -> Stores tokens -> Redirects to dashboard
```

## 🛡️ Token Management

- **Access Token**: Short-lived (7 days), used for API requests
- **Refresh Token**: Long-lived (30 days), used to get new access tokens
- **Automatic Refresh**: API interceptor automatically refreshes expired tokens
- **Cookie Storage**: Tokens stored in secure, httpOnly cookies

## 📁 Project Structure

```
learn-grow-fullstack/
├── grow-backend/
│   ├── src/
│   │   ├── app.ts
│   │   ├── server.ts
│   │   ├── config/
│   │   │   ├── env.ts
│   │   │   ├── index.ts
│   │   │   └── passport.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   └── validate.ts
│   │   ├── modules/
│   │   │   ├── user/
│   │   │   │   ├── controller/
│   │   │   │   ├── service/
│   │   │   │   ├── model/
│   │   │   │   ├── schema/
│   │   │   │   └── routes/
│   │   │   └── ...
│   │   ├── types/
│   │   └── utils/
│   │       ├── jwt.ts
│   │       └── otp.ts
│   ├── package.json
│   └── tsconfig.json
├── learn-grow/
│   ├── app/
│   │   ├── login/
│   │   ├── register/
│   │   ├── auth-callback/
│   │   └── ...
│   ├── components/
│   │   └── Auth/
│   │       ├── LoginForm.tsx
│   │       ├── RegistrationForm.tsx
│   │       └── ...
│   ├── lib/
│   │   ├── auth.ts
│   │   └── ...
│   ├── package.json
│   └── tsconfig.json
├── package.json
└── README.md
```

## 🔍 Testing

### Test Registration

1. Visit: `http://localhost:3000/register`
2. Select role (Student/Instructor/Guardian)
3. Enter email or phone
4. Verify OTP (check console in dev mode)
5. Complete registration

### Test Login

1. Visit: `http://localhost:3000/login`
2. Enter credentials (email/phone + password)
3. Login successfully
4. Get redirected to dashboard based on role

### Test Google OAuth

1. Ensure Google credentials are configured
2. Click "Login with Google"
3. Complete Google authentication
4. Get redirected to dashboard

## 🐛 Troubleshooting

### Port Already in Use

If port 5000 or 3000 is in use, change in:
- Backend: `grow-backend/.env` (PORT variable)
- Frontend: `learn-grow/.next` or environment

### MongoDB Connection Error

Ensure MongoDB is running:
```bash
# For local MongoDB
mongod

# For cloud (MongoDB Atlas), verify connection string
```

### Email Not Sending

1. Enable "Less Secure App Access" for Gmail
2. Generate "App Password" for Gmail
3. Use App Password in `.env`

### Google OAuth Not Working

1. Verify credentials in Google Cloud Console
2. Add redirect URI: `http://localhost:5000/api/auth/google/callback`
3. Update `.env` files with correct credentials

## 🚀 Deployment

### Backend Deployment (Heroku/Railway/Vercel)

1. Build: `npm run backend:build`
2. Environment variables on platform
3. Start command: `npm start`

### Frontend Deployment (Vercel/Netlify)

1. Build: `npm run frontend:build`
2. Environment variables on platform
3. Deploy the `.next` directory

## 📞 Support

For issues and questions:
1. Check console errors (F12 in browser)
2. Check server logs (terminal)
3. Verify all environment variables are set
4. Ensure MongoDB is running

## 📄 License

MIT License - See LICENSE file for details

## 👥 Team

Learn & Grow Development Team

---

**Start learning today!** 🎓
