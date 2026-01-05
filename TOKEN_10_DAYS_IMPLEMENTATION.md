# Token 10-Day Implementation Guide

## Current Configuration Overview

### 🔴 Current Settings
- **Access Token Duration**: 7 days
- **Refresh Token Duration**: 30 days
- **Behavior**: User can stay logged in for 30 days with automatic refresh

### 🟢 Target Settings
- **Access Token Duration**: 10 days
- **Refresh Token Duration**: 10 days
- **Behavior**: User needs to login again after 10 days of inactivity or at token expiry

---

## Files That Need to be Changed

### Backend Changes

#### 1. **Environment Configuration** - `grow-backend/.env`
```bash
# Current:
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Change to:
JWT_EXPIRES_IN=10d
JWT_REFRESH_EXPIRES_IN=10d
```

#### 2. **Backend Config File** - `grow-backend/src/config/env.ts`
```typescript
// Lines 10-11 - Current:
JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "30d",

// Change to:
JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "10d",
JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "10d",
```

#### 3. **JWT Utility** - `grow-backend/src/utils/jwt.ts`
No changes needed - it reads from `ENV.JWT_EXPIRES_IN` and `ENV.JWT_REFRESH_EXPIRES_IN`

#### 4. **Alternative Config** - `grow-backend/src/config/env.config.ts`
```typescript
// Lines 9-12 - This should automatically update based on env.ts
// If it doesn't, update:
jwt: {
    secret: ENV.JWT_SECRET,
    expiresIn: ENV.JWT_EXPIRES_IN,        // Will be "10d"
    refreshSecret: ENV.JWT_REFRESH_SECRET,
    refreshExpiresIn: ENV.JWT_REFRESH_EXPIRES_IN,  // Will be "10d"
  },
```

### Frontend Changes

#### 5. **Frontend Auth Library** - `learn-grow/lib/auth.ts`
```typescript
// Line 216 - Current:
Cookies.set("accessToken", accessToken, {
  expires: 7,  // ← Change this
  secure: false,
  sameSite: "lax",
  path: "/",
});

// Line 221 - Current:
Cookies.set("refreshToken", refreshToken, {
  expires: 30,  // ← Change this
  secure: false,
  sameSite: "lax",
  path: "/",
});

// Change to:
Cookies.set("accessToken", accessToken, {
  expires: 10,  // ← 10 days
  secure: false,
  sameSite: "lax",
  path: "/",
});

Cookies.set("refreshToken", refreshToken, {
  expires: 10,  // ← 10 days
  secure: false,
  sameSite: "lax",
  path: "/",
});
```

#### 6. **Register Function** - `learn-grow/lib/auth.ts`
Find the register function and update cookie expires:
```typescript
// Similar changes for register() function around lines 160-170
Cookies.set("accessToken", accessToken, {
  expires: 10,  // Change from 7
  secure: false,
  sameSite: "lax",
  path: "/",
});
Cookies.set("refreshToken", refreshToken, {
  expires: 10,  // Change from 30
  secure: false,
  sameSite: "lax",
  path: "/",
});
```

#### 7. **OAuth Callback Handler** - `learn-grow/lib/auth.ts`
```typescript
// In handleOAuthCallback() function, update:
Cookies.set("accessToken", accessToken, {
  expires: 10,  // Change from 7
  secure: false,
  sameSite: "lax",
  path: "/",
});
Cookies.set("refreshToken", refreshToken, {
  expires: 10,  // Change from 30
  secure: false,
  sameSite: "lax",
  path: "/",
});
```

---

## Summary of Changes

### Backend
| File | Change | Current → New |
|------|--------|---------------|
| `grow-backend/.env` | JWT_EXPIRES_IN | `7d` → `10d` |
| `grow-backend/.env` | JWT_REFRESH_EXPIRES_IN | `30d` → `10d` |
| `grow-backend/src/config/env.ts` | Line 10 | `"7d"` → `"10d"` |
| `grow-backend/src/config/env.ts` | Line 11 | `"30d"` → `"10d"` |

### Frontend
| File | Change | Current → New |
|------|--------|---------------|
| `learn-grow/lib/auth.ts` | login() - accessToken cookie | `expires: 7` → `expires: 10` |
| `learn-grow/lib/auth.ts` | login() - refreshToken cookie | `expires: 30` → `expires: 10` |
| `learn-grow/lib/auth.ts` | register() - accessToken cookie | `expires: 7` → `expires: 10` |
| `learn-grow/lib/auth.ts` | register() - refreshToken cookie | `expires: 30` → `expires: 10` |
| `learn-grow/lib/auth.ts` | handleOAuthCallback() - accessToken | `expires: 7` → `expires: 10` |
| `learn-grow/lib/auth.ts` | handleOAuthCallback() - refreshToken | `expires: 30` → `expires: 10` |

---

## User Experience After Changes

### Before (7 + 30 days):
- ✅ User logs in
- ✅ Access token valid for 7 days
- ✅ If access token expires, refresh token (valid 30 days) automatically gets new access token
- ✅ User can stay logged in for 30 days even with no activity
- ❌ After 30 days, user is forced to login again

### After (10 + 10 days):
- ✅ User logs in
- ✅ Access token valid for 10 days
- ✅ Refresh token valid for 10 days
- ✅ If access token expires within 10 days, refresh token automatically gets new access token
- ❌ After 10 days, refresh token expires and user is forced to login again
- ⚠️ If user is inactive for 10 days, they'll need to login again

---

## Testing the Changes

### 1. **Quick Test** (Verify token is being set)
```bash
# After login, open browser DevTools → Application → Cookies
# Check that:
# - accessToken: expires in ~10 days
# - refreshToken: expires in ~10 days
# - Check Network tab to see JWT payload has "exp" field
```

### 2. **Verify Token Duration**
```javascript
// In browser console, decode the JWT to see expiration:
const token = localStorage.getItem('token');
const parts = token.split('.');
const payload = JSON.parse(atob(parts[1]));
console.log('Token expires at:', new Date(payload.exp * 1000));
console.log('Days until expiry:', (payload.exp * 1000 - Date.now()) / (1000 * 60 * 60 * 24));
```

### 3. **Test Token Refresh**
```bash
# After 7+ days (access token expires):
# - Make an API call
# - Should automatically refresh
# - User should not be logged out

# After 10 days (refresh token expires):
# - User should be logged out
# - Redirected to login page
# - Must login again
```

---

## Environment Variables to Update

### Backend `.env` File
```bash
# JWT Configuration
JWT_SECRET=your-jwt-secret-key-change-this
JWT_REFRESH_SECRET=your-refresh-token-secret-change-this
JWT_EXPIRES_IN=10d           # ← Change from 7d
JWT_REFRESH_EXPIRES_IN=10d   # ← Change from 30d
```

### Frontend `.env.local` (if applicable)
No changes needed - token expiration is handled by backend and frontend auth library.

---

## Files to Modify (Complete List)

1. ✅ `grow-backend/.env` - Update JWT timings
2. ✅ `grow-backend/src/config/env.ts` - Update default values
3. ✅ `learn-grow/lib/auth.ts` - Update cookie expires in 3 functions:
   - `login()`
   - `register()`
   - `handleOAuthCallback()`

---

## Rollback Plan

If you need to revert changes:

1. **Backend**: Reset `.env` and `env.ts` to original values
2. **Frontend**: Reset cookie expires from 10 back to 7/30
3. **No database migration needed** - tokens are stateless

---

## Additional Considerations

### Security Impact:
- ✅ **Positive**: Shorter token lifespan = less damage if token is stolen
- ✅ **Positive**: Users forced to re-authenticate every 10 days
- ⚠️ **Negative**: More frequent logins required
- ⚠️ **Negative**: Potentially annoying for users who use app daily

### Performance Impact:
- ✅ **Positive**: No negative impact
- ✅ **Positive**: Token refresh happens automatically (user doesn't notice)

### Database Impact:
- ✅ **None**: Tokens are stateless JWT tokens
- ✅ **No migrations needed**
- ✅ **Refresh token stored in user collection** - automatically expires after 10 days

---

## Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| Backend JWT Config | ⚙️ Ready to implement | `env.ts` line 10-11 |
| Backend .env | ⚙️ Ready to implement | Update if .env exists |
| Frontend Auth Library | ⚙️ Ready to implement | `auth.ts` login, register, OAuth |
| Frontend Cookies | ⚙️ Ready to implement | 3 places to update expires |
| Testing | ⚙️ Ready | Use console decoder |
| Deployment | ⚙️ Ready | No database changes |

---

## Questions?

If you need to:
- ✅ **Only allow login for 10 days** - Use these changes
- ✅ **Check current token expiration** - Use console decoder
- ✅ **Extend to 60 days** - Change "10d" to "60d" everywhere
- ✅ **Make access and refresh tokens same duration** - They are now both 10d

---

## Need These Changes Applied?

Just say YES and I'll implement all changes across:
1. Backend configuration
2. Frontend auth library
3. Cookie settings
4. All three functions (login, register, OAuth)

Would verify with npm build to ensure no errors.
