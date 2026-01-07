# Email Action Endpoint - Complete Flow Guide

## Overview
The email action endpoint is used when users click "Verify" or "Activate Order" links in emails. The flow handles the activation of pending orders.

## URL Example
```
http://localhost:5000/api/orders/email-action/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmRlcklkIjoiNjk1ZTI5NGE5NjA2MWVkYThjNDkxY2ZiIiwiYWN0aW9uIjoiYXBwcm92ZSIsImlhdCI6MTc2Nzc3ODYzOCwiZXhwIjoxNzY3OTUxNDM4fQ.TFuvkW7aaaSTzuvlCCwln-KOPknKz6QhqrbCP9_Chp8
```

## Request Flow

### 1. User Clicks Email Link
```
Email contains: https://learnandgrow.io/api/order/email-action/{TOKEN}
```

### 2. Request Through Production Stack
```
User Browser
    ↓
HTTPS (443)
    ↓
Nginx (Port 80/443)
    ↓ (Routes to Next.js port 3000)
Next.js App
    ↓ (Calls Next.js API route)
GET /api/order/email-action/{token}
    ↓ (/app/api/order/email-action/[token]/route.ts)
Fetches from Backend API
    ↓ (http://localhost:5000)
GET /api/orders/email-action/{token}
    ↓
Backend (Node.js/Express)
    ↓ (Validates JWT token)
    ↓ (Updates order status in MongoDB)
Returns Response
    ↓
Redirect to Dashboard
```

### 3. Local Development Flow
```
Browser: http://localhost:3000/api/order/email-action/{token}
    ↓
Next.js Port 3000
    ↓
/app/api/order/email-action/[token]/route.ts
    ↓
Fetches: http://localhost:5000/api/orders/email-action/{token}
    ↓
Backend Port 5000
    ↓
Processes Order
    ↓
Returns to Next.js
    ↓
Redirect to /dashboard
```

## Environment Variables

### Production (.env.production)
```dotenv
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Frontend (.env)
```dotenv
NEXT_PUBLIC_API_URL=https://learnandgrow.io/api
```

## API Response Handling

### Success (200)
```json
{
  "message": "Order verified successfully"
}
→ Redirects to /dashboard
```

### Already Processed (400)
```
"Order already processed"
→ Redirects to /dashboard?status=already-processed
```

### Token Expired (401)
```json
{
  "error": "Token expired"
}
→ Returns error page
```

### Invalid Token (400)
```json
{
  "error": "Invalid token"
}
→ Returns error page
```

## Next.js Route Implementation

**File**: `/app/api/order/email-action/[token]/route.ts`

```typescript
export async function GET(request, { params: { token } }) {
  // 1. Validate token exists
  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  // 2. Get backend URL from environment
  let backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  
  // 3. Handle both /api suffix formats
  if (backendUrl.endsWith("/api")) {
    backendUrl = backendUrl.slice(0, -4);
  }

  // 4. Fetch from backend
  const response = await fetch(`${backendUrl}/api/orders/email-action/${token}`);

  // 5. If successful, redirect to dashboard
  if (response.ok) {
    return NextResponse.redirect(new URL("/dashboard", request.url), { status: 303 });
  }

  // 6. Handle "already processed" case
  if (response.status === 400 && data.includes("already processed")) {
    return NextResponse.redirect(new URL("/dashboard?status=already-processed", request.url), { status: 303 });
  }

  // 7. Return error for other cases
  return NextResponse.json(jsonData, { status: response.status });
}
```

## Nginx Routing

### Configuration
```nginx
# Email action links route to backend
location ~ ^/api/(v1/|orders/email-action/) {
    proxy_pass http://backend_api;  # Port 5000
    proxy_buffering off;
}

# Other /api/* routes go to frontend
location ~ ^/api/(?!v1/|orders/email-action/) {
    proxy_pass http://frontend_app;  # Port 3000
}
```

### Why This Setup?
- Direct backend routing for email action: Faster, no Next.js processing needed
- However, for better logging/monitoring, you can route through Next.js first

## Testing

### Direct Backend Test
```bash
curl "http://localhost:5000/api/orders/email-action/{TOKEN}"
```

### Through Next.js
```bash
curl "http://localhost:3000/api/order/email-action/{TOKEN}"
```

### With Verbose Output
```bash
curl -v "http://localhost:3000/api/order/email-action/{TOKEN}" 2>&1 | grep -E "^< |^> "
```

## Logging

The route includes detailed logging:

```
📧 Email action request for token: eyJhbGciOiJI...
📧 Calling backend: http://localhost:5000/api/orders/email-action/{token}
📧 Backend response status: 200
✅ Order activated successfully, redirecting to dashboard
```

Check logs in:
- **Development**: Browser console & Node.js server logs
- **Production**: `/var/log/pm2/` or Docker logs

## Troubleshooting

### Issue: "Token is required"
- **Cause**: URL parameters not parsed correctly
- **Fix**: Verify URL format: `/api/order/email-action/{TOKEN}` (note: no colon before token)

### Issue: "Order already processed"
- **Cause**: Token was already used
- **Fix**: This is expected for duplicate clicks. User is redirected to dashboard.

### Issue: 500 Internal Server Error
- **Cause**: Backend not responding or network error
- **Fix**: 
  1. Check if backend is running: `curl http://localhost:5000/health`
  2. Check `NEXT_PUBLIC_API_URL` environment variable
  3. Verify backend token validation logic

### Issue: 404 Not Found
- **Cause**: Nginx routing misconfigured
- **Fix**: 
  1. Verify nginx config with: `sudo nginx -t`
  2. Reload: `sudo systemctl reload nginx`
  3. Check routing matches your URL pattern

### Issue: Email Link Not Working (Production)
- **Cause**: Likely HTTPS/domain issue
- **Fix**:
  1. Verify email contains correct domain (learnandgrow.io)
  2. Check SSL certificates: `openssl s_client -connect learnandgrow.io:443`
  3. Test manually: Open link in browser and check Network tab

## Email Template

When sending order verification emails, use:

```html
<a href="https://learnandgrow.io/api/order/email-action/{TOKEN}">
  Verify Your Order
</a>
```

**Note**: In production, this should be:
- Full domain: `https://learnandgrow.io/`
- Not localhost
- HTTPS not HTTP
- Includes the full JWT token

## Security Considerations

1. **Token Expiration**: Set token expiry in backend (currently: ~1 day)
2. **Rate Limiting**: Nginx has rate limits to prevent token brute-force
3. **HTTPS Only**: Production links must use HTTPS
4. **Token Validation**: Backend validates JWT signature and expiration

## Future Improvements

- [ ] Add email verification with OTP as secondary method
- [ ] Send new token link if original expires
- [ ] Add UI notification when order is auto-approved
- [ ] Track order activation metrics
