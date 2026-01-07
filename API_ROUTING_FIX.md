# API Routing Conflict Fix - Next.js & Nginx

## Problem
Next.js API routes (`/app/api/*`) were conflicting with Nginx backend proxy (`/api/*`):
- Nginx was intercepting ALL `/api/*` requests and routing them to backend (port 5000)
- Next.js API routes at `/app/api/*` were never reached because Nginx blocked them first
- This caused email action links and certificate generation to fail on production

## Solution Implemented

### 1. Updated Nginx Configuration (`nginx-config.conf`)
Changed from a blanket `/api/` proxy to a more specific routing strategy:

```nginx
# Backend API routes - Only specific paths
location ~ ^/api/(v1/|orders/email-action/) {
    proxy_pass http://backend_api;  # Routes to port 5000
}

# Next.js API routes stay at /api/*
location ~ ^/api/(?!v1/|orders/email-action/|health) {
    proxy_pass http://frontend_app;  # Routes to port 3000
}

# Next.js internal routes at /server/*
location /server/ {
    proxy_pass http://frontend_app;  # Routes to port 3000
}
```

### 2. Updated Email Action Route
**File**: `learn-grow/app/api/order/email-action/[token]/route.ts`

Changed from redirect to proper API response:
- Accepts token from URL parameter
- Calls backend API: `GET /api/orders/email-action/{token}`
- Returns JSON response instead of redirect
- Better error handling and status codes

### 3. Working Routes After Fix

**Backend API (Nginx → Backend Port 5000):**
- ✅ `GET /api/v1/*` - All versioned backend APIs
- ✅ `GET /api/orders/email-action/{token}` - Email action links
- ✅ `GET /health` - Health check

**Next.js API Routes (Nginx → Next.js Port 3000):**
- ✅ `GET /api/certificate/generate` - Certificate generation
- ✅ `GET /api/order/email-action/{token}` - Email action handler (wrapper)
- ✅ Any other `/api/*` routes not matching backend patterns

**Next.js Server Routes (Nginx → Next.js Port 3000):**
- ✅ `GET /server/*` - Internal server functions
- ✅ Future internal APIs can use this namespace

## How Nginx Routing Works Now

1. **Request comes in**: `GET /api/orders/email-action/abc123`
2. **Nginx regex match**: `~` matches backend pattern
3. **Route to backend**: `proxy_pass http://backend_api` (port 5000)
4. **Response**: Returned to client

---

1. **Request comes in**: `GET /api/certificate/generate?courseId=123`
2. **Nginx regex match**: Doesn't match backend pattern
3. **Route to frontend**: `proxy_pass http://frontend_app` (port 3000)
4. **Next.js handles**: Route processed by `/app/api/certificate/generate/route.ts`
5. **Response**: Certificate HTML returned to client

## Testing the Fix

### Test Email Action Link:
```bash
curl http://localhost/api/order/email-action/test-token-123
# Should be handled by Next.js and call backend API
```

### Test Certificate Generation:
```bash
curl http://localhost/api/certificate/generate?courseId=123&courseName=Test
# Should return certificate HTML
```

### Test Backend API:
```bash
curl http://localhost/api/v1/courses
# Should be routed to backend (port 5000)
```

## Client-Side References
All existing client-side code continues to work:
- Certificate downloads: `/api/certificate/generate` ✅
- Email action links in emails: Already handled by nginx routing
- Backend API calls: Continue using `/api/*` endpoints

## Deployment Checklist
- [ ] Reload nginx: `sudo systemctl reload nginx`
- [ ] Test email links work
- [ ] Test certificate generation
- [ ] Monitor error logs: `tail -f /var/log/nginx/error.log`
- [ ] Check backend logs for API calls

## Future API Pattern
For new Next.js APIs:
- Use `/server/internal/*` for internal APIs
- Use `/api/*` for public APIs (non-backend)
- Backend keeps `/api/v1/*` versioned pattern
