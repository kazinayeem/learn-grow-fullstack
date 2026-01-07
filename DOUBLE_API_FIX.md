# Double /api/api Fix - Complete Guide

## Problem
When using production domain `https://learnandgrow.io/api`, email links were being generated with double API prefix:
```
❌ https://learnandgrow.io/api/api/orders/email-action/{token}
✅ https://learnandgrow.io/api/orders/email-action/{token}
```

## Root Cause
The backend environment variable `BACKEND_URL` was being set with `/api` suffix, then the code was appending `/api/orders/email-action/` again, creating the double prefix.

## Solution Implemented

### 1. Fixed Backend Order Service
**File**: `grow-backend/src/modules/order/service/order.service.ts`

**Change**: Strip `/api` suffix from `BACKEND_URL` before constructing email links
```typescript
let baseUrl = ENV.BACKEND_URL || "http://localhost:5000";

// Remove trailing /api if present to avoid double /api
if (baseUrl.endsWith("/api")) {
  baseUrl = baseUrl.slice(0, -4);
}

const approveUrl = `${baseUrl}/api/orders/email-action/${approveToken}`;
const rejectUrl = `${baseUrl}/api/orders/email-action/${rejectToken}`;
```

### 2. Updated Backend .env
**File**: `grow-backend/.env`

```dotenv
# Backend URL - should NOT include /api suffix
# Local: http://localhost:5000
# Production: https://learnandgrow.io
BACKEND_URL=http://localhost:5000
```

### 3. Updated Frontend .env.local
**File**: `learn-grow/.env.local`

```dotenv
# For local development, use localhost:5000
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# For production (HTTPS required for Vercel deployment):
# NEXT_PUBLIC_API_URL=https://learnandgrow.io
```

### 4. Updated Frontend .env.production
**File**: `learn-grow/.env.production`

```dotenv
# Production API URL - WITHOUT /api suffix
# Nginx will handle routing based on the path
NEXT_PUBLIC_API_URL=https://learnandgrow.io

# For Docker local use HTTP:
# NEXT_PUBLIC_API_URL=http://localhost:5000

# For remote deployment with SSL:
# NEXT_PUBLIC_API_URL=https://174.129.111.162
```

### 5. Updated Frontend axios.ts
**File**: `learn-grow/lib/axios.ts`

**Change**: Added helper function to ensure `/api` suffix is present
```typescript
const getApiBaseUrl = () => {
    let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    
    // If URL doesn't end with /api, add it
    if (!apiUrl.endsWith('/api')) {
        apiUrl = `${apiUrl}/api`;
    }
    
    return apiUrl;
};

const api = axios.create({
    baseURL: getApiBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
});
```

### 6. Updated Frontend auth.ts
**File**: `learn-grow/lib/auth.ts`

**Change**: Added same helper function for auth API
```typescript
const getApiBaseUrl = () => {
  let apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  
  // If URL doesn't end with /api, add it
  if (!apiUrl.endsWith("/api")) {
    apiUrl = `${apiUrl}/api`;
  }
  
  return apiUrl;
};

const API_URL = getApiBaseUrl();
```

## Environment Variable Format

### Correct Formats

**Local Development** ✅
```
Frontend:  NEXT_PUBLIC_API_URL=http://localhost:5000/api
Backend:   BACKEND_URL=http://localhost:5000
```

**Production** ✅
```
Frontend:  NEXT_PUBLIC_API_URL=https://learnandgrow.io
Backend:   BACKEND_URL=https://learnandgrow.io
```

### Incorrect Formats ❌

```
Frontend:  NEXT_PUBLIC_API_URL=https://learnandgrow.io/api  ← WRONG (creates double /api)
Backend:   BACKEND_URL=https://learnandgrow.io/api           ← WRONG (creates double /api)
```

## How It Works Now

### Backend Email Link Generation
```
BACKEND_URL = "https://learnandgrow.io/api"
  ↓
Strip /api suffix: "https://learnandgrow.io"
  ↓
Add /api/orders/email-action/{token}: "https://learnandgrow.io/api/orders/email-action/{token}"
✅ Correct!
```

### Frontend API Calls
```
NEXT_PUBLIC_API_URL = "https://learnandgrow.io"
  ↓
Add /api suffix: "https://learnandgrow.io/api"
  ↓
Append endpoint path: "https://learnandgrow.io/api/users/profile"
✅ Correct!
```

## Deployment Checklist

- [ ] Set backend env: `BACKEND_URL=https://learnandgrow.io`
- [ ] Set frontend env: `NEXT_PUBLIC_API_URL=https://learnandgrow.io`
- [ ] Rebuild backend: `npm run build`
- [ ] Rebuild frontend: `npm run build`
- [ ] Restart backend services
- [ ] Clear browser cache
- [ ] Test email order link (click approve/reject)
- [ ] Verify email link format in logs: `/api/orders/email-action/{token}` (single /api)

## Testing

### Check Backend Email Generation
Monitor backend logs during order creation:
```
Backend logs should show:
📧 Email URL: https://learnandgrow.io/api/orders/email-action/{token}
```

### Check Frontend API Calls
Open browser DevTools → Network tab:
```
Requests should go to:
https://learnandgrow.io/api/users/profile
https://learnandgrow.io/api/courses
```

### Check Nginx Routing
```bash
# Should route /api/orders/email-action to backend
curl https://learnandgrow.io/api/orders/email-action/{token}

# Should route /api/certificate to frontend
curl https://learnandgrow.io/api/certificate/generate
```

## Common Issues

### Email links still have double /api
**Solution**: 
1. Verify backend `BACKEND_URL` doesn't end with `/api`
2. Restart backend service
3. Create new order to test

### Frontend API calls to wrong URL
**Solution**:
1. Verify frontend `NEXT_PUBLIC_API_URL` in browser DevTools
2. Check .env files are loaded correctly
3. Clear browser cache and rebuild frontend

### 404 on email link
**Solution**:
1. Check nginx logs for routing
2. Verify backend is running
3. Test direct backend URL: `http://localhost:5000/api/orders/email-action/{token}`

## Summary

The fix ensures:
✅ Environment variables don't include `/api` when they shouldn't  
✅ Frontend code adds `/api` when constructing URLs  
✅ Backend code strips `/api` from base URLs before adding specific endpoints  
✅ Email links are generated with correct single `/api` prefix  
✅ Consistent API routing across all services  
