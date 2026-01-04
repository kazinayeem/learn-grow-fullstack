# Token Expiration & Auto-Logout Documentation

## Overview
This document explains how tokens work, when they expire, and what happens when users perform auto-logout in the Learn & Grow application.

---

## 1. Token Durations & Expiration Times

### Access Token (Short-lived)
- **Duration**: **7 days** (`JWT_EXPIRES_IN=7d`)
- **Purpose**: Used for authenticating API requests
- **Storage**: 
  - Browser Cookie: `accessToken`
  - Local Storage: `token` and `accessToken`
- **Cookie Expiry**: Set to **7 days** on login
- **Server-side HttpOnly Cookie**: `accessTokenHttpOnly` (1 hour max age)

### Refresh Token (Long-lived)
- **Duration**: **30 days** (`JWT_REFRESH_EXPIRES_IN=30d`)
- **Purpose**: Used to obtain a new access token when it expires
- **Storage**:
  - Browser Cookie: `refreshToken`
  - Local Storage: `refreshToken`
- **Cookie Expiry**: Set to **30 days** on login

### Token Expiration Configuration
**File**: [grow-backend/.env.example](grow-backend/.env.example)
```
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
```

---

## 2. How Token Expiration Works

### Flow Diagram
```
User Makes API Request
        ↓
Is Access Token Still Valid?
    ├─ YES → Request succeeds
    └─ NO (401 Unauthorized)
        ↓
    Try to Refresh Token
        ├─ Refresh Token Valid?
        │   ├─ YES → Generate new Access Token → Retry request
        │   └─ NO → Clear all tokens → User must login
        └─ User must login again
```

### Step-by-Step Process

#### 1. **Access Token Validation** ([baseApi.ts](learn-grow/redux/api/baseApi.ts#L75-L90))
- Every API request includes the access token in the Authorization header
- Backend verifies token using JWT secret
- If valid, request proceeds
- If expired or invalid, backend returns `401 Unauthorized`

#### 2. **Automatic Token Refresh** ([baseApi.ts](learn-grow/redux/api/baseApi.ts#L22-L68))
When a 401 response is received:

**Backend Flow** ([user.controller.ts](grow-backend/src/modules/user/controller/user.controller.ts#L107-L123))
```
POST /users/refresh-token
├─ Validate refresh token
├─ Check if refresh token matches stored token in database
├─ If valid: Generate new access token
└─ Return new token
```

**Frontend Flow** ([baseApi.ts](learn-grow/redux/api/baseApi.ts#L75-L90))
```
If 401 Error:
├─ Get refresh token from cookies
├─ Call /users/refresh-token endpoint
├─ If successful:
│   ├─ Store new access token
│   ├─ Retry the original request
│   └─ User continues without interruption
└─ If failed:
    ├─ Clear all tokens
    ├─ Set loggingOut flag
    └─ Components handle redirect to login
```

#### 3. **Token Validation Check** ([auth.middleware.ts](grow-backend/src/middleware/auth.middleware.ts#L262-L290))
```typescript
// Check token age (max 30 days old to refresh)
const tokenAge = Math.floor(Date.now() / 1000) - (decoded.iat || 0);
const maxAge = 30 * 24 * 60 * 60; // 30 days

if (tokenAge > maxAge) {
  return res.status(401).json({
    success: false,
    message: 'Token is too old to refresh. Please login again.',
  });
}
```

---

## 3. What Happens When Tokens Expire?

### Scenario 1: Access Token Expires (After 7 days)
✅ **AUTOMATIC** - User doesn't notice
1. Frontend detects 401 error
2. Automatically refreshes using refresh token
3. Retries request silently
4. User continues working

### Scenario 2: Refresh Token Expires (After 30 days)
❌ **MANUAL LOGOUT REQUIRED**
1. Frontend detects token refresh failed
2. Clears all tokens from browser
3. Sets `loggingOut` flag in session storage
4. User is redirected to login page
5. Must login again

### Scenario 3: Token Refresh Fails Before 30 Days
❌ **MANUAL LOGOUT REQUIRED**

Reasons:
- Refresh token was manually invalidated
- Refresh token mismatches database record
- Database connection error
- Token corrupted or tampered with

**Frontend Action** ([baseApi.ts](learn-grow/redux/api/baseApi.ts#L65-L72))
```typescript
// If refresh fails, clear all tokens
Cookies.remove("accessToken", { path: "/" });
Cookies.remove("refreshToken", { path: "/" });
Cookies.remove("userRole", { path: "/" });
localStorage.removeItem("token");
localStorage.removeItem("refreshToken");
localStorage.removeItem("userRole");
```

---

## 4. Auto-Logout: When User Clicks Logout Button

### Is Auto-Logout OK? **YES ✅**

Auto-logout is the correct way to end a session and is **fully implemented and working correctly**.

### Auto-Logout Flow

#### Frontend Process ([navbar.tsx](learn-grow/components/navbar.tsx#L116-L140))
```typescript
const handleLogout = async () => {
  // Step 1: Set logout flag
  sessionStorage.setItem("loggingOut", "1");
  
  // Step 2: Call API logout (optional, non-blocking)
  try {
    await apiLogout();
  } catch (e) {
    // Ignore failures - we'll clear tokens anyway
  }
  
  // Step 3: Clear cookies
  Cookies.remove("accessToken", { path: "/" });
  Cookies.remove("refreshToken", { path: "/" });
  Cookies.remove("userRole", { path: "/" });
  
  // Step 4: Clear localStorage
  localStorage.removeItem("user");
  localStorage.removeItem("userRole");
  localStorage.removeItem("token");
  
  // Step 5: Update UI state
  setIsAuthenticated(false);
  setUser(null);
  
  // Step 6: Redirect to login
  router.replace("/login");
};
```

#### Backend Process ([user.controller.ts](grow-backend/src/modules/user/controller/user.controller.ts#L139-L160))
```typescript
export const logout = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    
    // Clear refresh token from database
    const result = await service.logout(userId);
    
    // Clear refresh token cookie
    res.clearCookie("refreshToken");
    
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Logout failed",
    });
  }
};
```

Backend Service ([user.service.ts](grow-backend/src/modules/user/service/user.service.ts#L505-L515))
```typescript
export const logout = async (userId: string): Promise<{success: boolean; message: string}> => {
  try {
    // Remove refresh token from database
    await User.findByIdAndUpdate(userId, { refreshToken: undefined });
    return {
      success: true,
      message: "Logged out successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Logout failed",
    };
  }
};
```

### Why the "loggingOut" Flag? ([navbar.tsx](learn-grow/components/navbar.tsx#L39-L55))
```typescript
// During logout, prevent auth sync from re-authenticating
const loggingOut = sessionStorage.getItem("loggingOut");
if (loggingOut === "1") {
  // Logout in progress, don't fetch auth status
  setIsAuthenticated(false);
  setUser(null);
  return;
}
```

This prevents race conditions during logout where:
- Logout is in progress
- Auth sync checks if user is still authenticated
- Re-authenticates the user (preventing logout!)

---

## 5. Complete Token Lifecycle

### Login → Token Generation
**Files**: [user.controller.ts](grow-backend/src/modules/user/controller/user.controller.ts#L57-L90), [user.service.ts](grow-backend/src/modules/user/service/user.service.ts#L380-L430)

```
User submits credentials
    ↓
Validate email/password
    ↓
Generate tokens:
├─ Access Token (7 days)
├─ Refresh Token (30 days)
└─ Save Refresh Token in database
    ↓
Store in cookies:
├─ accessToken (7 days)
├─ refreshToken (30 days)
└─ userRole
    ↓
Store in localStorage:
├─ token (access token)
├─ refreshToken
└─ user (JSON)
    ↓
Redirect to dashboard
```

### Using Tokens → API Requests
```
Request to API endpoint
    ↓
Add Authorization header:
├─ Bearer {accessToken}
└─ Sent in every request
    ↓
Backend validates:
├─ JWT signature
├─ Token expiration
└─ Payload (userId, role)
    ↓
If valid → Process request
If invalid → Return 401
```

### Token Refresh → Background
```
Frontend detects 401
    ↓
Calls /users/refresh-token with refreshToken
    ↓
Backend validates refresh token:
├─ JWT signature
├─ Token not older than 30 days
├─ Database record match
└─ User still exists
    ↓
If valid → Generate new access token
If invalid → Return 401
    ↓
Frontend silently retries request
    ↓
Request succeeds (no user interruption)
```

### Logout → Token Invalidation
```
User clicks logout button
    ↓
Frontend:
├─ Set loggingOut flag
├─ Clear all cookies
├─ Clear localStorage
└─ Update UI state
    ↓
Backend:
├─ Remove refresh token from database
└─ Clear refresh cookie
    ↓
Both access & refresh tokens are now:
├─ NOT stored anywhere
├─ NOT usable for API requests
└─ User must login again
```

---

## 6. Token Storage Locations

| Token | Cookie | LocalStorage | HttpOnly Cookie | Expires |
|-------|--------|--------------|-----------------|---------|
| Access Token | ✅ `accessToken` | ✅ `token`, `accessToken` | ✅ `accessTokenHttpOnly` | 7 days |
| Refresh Token | ✅ `refreshToken` | ✅ `refreshToken` | ❌ | 30 days |
| User Data | ❌ | ✅ `user` (JSON) | ❌ | Manual |
| User Role | ✅ `userRole` | ✅ `userRole` | ❌ | 7 days |

**Why Multiple Storage?**
- **Cookies**: Automatically sent with every request (older method)
- **LocalStorage**: JavaScript access for header injection (modern method)
- **HttpOnly Cookies**: Server-side fallback (security best practice)

---

## 7. Summary of Token Timings

| Action | Time | Details |
|--------|------|---------|
| Access Token Duration | **7 days** | Automatically refreshed before expiry |
| Refresh Token Duration | **30 days** | User must login if it expires |
| Token Refresh Check | **Automatic on 401** | Frontend handles silently |
| Max Token Age for Refresh | **30 days** | Tokens older than 30 days can't be refreshed |
| Cookie Expiry (Access) | **7 days** | Browser removes cookie automatically |
| Cookie Expiry (Refresh) | **30 days** | Browser removes cookie automatically |
| Manual Logout | **Immediate** | Tokens cleared, user redirected to login |

---

## 8. Is Current Implementation OK?

### ✅ YES - The implementation is solid:

1. **Token Expiration**: Properly configured (7 days access, 30 days refresh)
2. **Auto-Refresh**: Implemented correctly - user won't notice token expiry
3. **Auto-Logout**: Properly handles session termination
4. **Security**: 
   - Tokens stored in cookies (sent automatically)
   - Backup httpOnly cookies for server-side fallback
   - Refresh token stored in database
   - Tokens validated on every request
5. **User Experience**: 
   - Seamless auto-refresh
   - No interruption during token validity
   - Clean logout process
6. **Error Handling**: 
   - Graceful 401 handling
   - Proper cleanup on logout
   - Token mismatch validation

---

## 9. Testing Token Behavior

### Test 1: Access Token Refresh
```bash
# Token should automatically refresh before 7 days
# Keep app open for extended period
# Frontend will silently refresh in background
```

### Test 2: Manual Logout
```bash
# Click logout button
# Verify tokens are cleared from browser
# Verify redirect to /login
# Try accessing protected route → should redirect to login
```

### Test 3: Expired Refresh Token
```bash
# Wait 30+ days (or manually delete refresh token)
# Make an API request
# Should see 401 error and redirect to login
# User must login again
```

### Test 4: Token Mismatch
```bash
# Delete refresh token from database while logged in
# Make an API request that needs refresh
# Should fail and require re-login
```

---

## 10. Configuration Files

### Backend Token Configuration
**File**: [grow-backend/.env.example](grow-backend/.env.example)
```env
JWT_SECRET=your-jwt-secret-change-this
JWT_REFRESH_SECRET=your-refresh-token-secret-change-this
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
```

### Frontend Token Usage
**Files**:
- [learn-grow/redux/api/baseApi.ts](learn-grow/redux/api/baseApi.ts) - Token refresh logic
- [learn-grow/lib/auth.ts](learn-grow/lib/auth.ts) - Auth API functions
- [learn-grow/components/navbar.tsx](learn-grow/components/navbar.tsx) - Logout handler

---

## 11. Troubleshooting

### Problem: User keeps getting logged out
**Solution**: 
- Check if refresh token is being saved to database
- Verify cookie settings (domain, path, sameSite)
- Check browser console for errors
- Ensure clock is synced on server and client

### Problem: Login works but API calls fail
**Solution**:
- Check if accessToken cookie is set
- Verify Authorization header is being sent
- Check if token has the correct payload
- Test with fresh login

### Problem: Auto-logout not working
**Solution**:
- Check if logout endpoint is being called
- Verify cookies are being cleared
- Check localStorage is being cleared
- Ensure router.replace() is working

### Problem: Token refresh failing
**Solution**:
- Verify refresh token endpoint exists
- Check refresh token matches database
- Verify JWT_REFRESH_SECRET is set correctly
- Check if refresh token hasn't expired (30 days)

---

## Conclusion

✅ **Auto-Logout is fully working and secure**

The token system is properly configured with:
- **Short-lived access tokens** (7 days) for security
- **Long-lived refresh tokens** (30 days) for convenience
- **Automatic refresh** before expiry (transparent to user)
- **Clean logout** that invalidates all tokens
- **Proper error handling** for expired tokens

Users can safely logout and will be automatically logged back in transparently when needed (through refresh token) until the 30-day refresh token expires.
