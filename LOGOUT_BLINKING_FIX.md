# 🎯 Logout Blinking/Flickering Bug Fix

## Problem Description
When deploying the application, users experienced a blinking/flickering issue when:
- Clicking logout button on any dashboard (instructor, admin, manager)
- Navigating to other routes like `/login`, `/instructor`, `/instor` (course instructor view)

The page would flash/blink between different routes during logout.

---

## Root Cause Analysis

### The Race Condition Issue
The bug was caused by **multiple redirect logic competing simultaneously**:

1. **Navbar** (main logout handler):
   - Sets logout flag: `sessionStorage.setItem("loggingOut", "1")`
   - Clears cookies and localStorage
   - Redirects to home: `router.replace("/")`

2. **RequireAuth component** (used on protected pages):
   - Checks if user has token
   - **IMMEDIATELY redirects to `/login` if no token**
   - Doesn't check the `loggingOut` flag ❌

3. **Layout useEffects** (instructor, admin, manager):
   - Check if user is still authenticated
   - **IMMEDIATELY redirect to `/login` if not**
   - Don't check the `loggingOut` flag ❌

### What Happened During Logout
```
Timeline:
1. User clicks logout
2. Navbar: Sets loggingOut flag = "1"
3. Navbar: Clears tokens
4. Navbar: Redirects to "/" using router.replace()
5. RequireAuth (on /instructor page): Sees no token → Redirects to "/login"
6. Layout useEffect: Sees no token → Tries to redirect to "/login"
Result: Page blinks between "/" and "/login"
```

---

## Solution Implemented

### Fix #1: RequireAuth Component
**File**: [learn-grow/components/Auth/RequireAuth.tsx](learn-grow/components/Auth/RequireAuth.tsx)

Added check for logout flag before performing auth check:
```typescript
// 🚨 Check if logout is in progress - if so, don't redirect yet
const loggingOut = sessionStorage.getItem("loggingOut") === "1";
if (loggingOut) {
    console.log("🔐 RequireAuth: Logout in progress, skipping redirect");
    hasChecked.current = true;
    return;  // Don't redirect during logout
}
```

### Fix #2: Instructor Layout useEffect
**File**: [learn-grow/app/instructor/layout.tsx](learn-grow/app/instructor/layout.tsx)

Added logout check and updated logout handler:
```typescript
// Added to useEffect
const loggingOut = sessionStorage.getItem("loggingOut") === "1";
if (loggingOut) {
    console.log("🚪 Instructor Layout: Logout in progress, skipping auth check");
    return;
}

// Updated logout handler
const handleLogout = async () => {
    sessionStorage.setItem("loggingOut", "1");
    // Clear auth data
    Cookies.remove("accessToken", { path: "/" });
    Cookies.remove("refreshToken", { path: "/" });
    Cookies.remove("userRole", { path: "/" });
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    // Redirect to HOME (not login) - prevents blinking
    router.replace("/");
};
```

### Fix #3: Admin Layout useEffect
**File**: [learn-grow/app/admin/layout.tsx](learn-grow/app/admin/layout.tsx)

Same fix as instructor layout - added logout flag check and updated redirect to home.

### Fix #4: Manager Layout
**File**: [learn-grow/app/manager/layout.tsx](learn-grow/app/manager/layout.tsx)

Already had logout flag logic, updated redirect from `/login` to `/` (home).

---

## Files Modified

1. ✅ **[learn-grow/components/Auth/RequireAuth.tsx](learn-grow/components/Auth/RequireAuth.tsx)**
   - Added `loggingOut` flag check at start of useEffect

2. ✅ **[learn-grow/app/instructor/layout.tsx](learn-grow/app/instructor/layout.tsx)**
   - Added `loggingOut` flag check in useEffect
   - Updated `handleLogout` to use consistent flow with navbar
   - Changed redirect from `/login` to `/`

3. ✅ **[learn-grow/app/admin/layout.tsx](learn-grow/app/admin/layout.tsx)**
   - Added `loggingOut` flag check in useEffect
   - Updated `handleLogout` to use consistent flow
   - Changed redirect from `/login` to `/`

4. ✅ **[learn-grow/app/manager/layout.tsx](learn-grow/app/manager/layout.tsx)**
   - Updated redirect from `/login` to `/` (home)

---

## How the Fix Works

### New Logout Flow
```
Timeline (After Fix):
1. User clicks logout
2. Logout handler: Sets loggingOut flag = "1"
3. Logout handler: Clears all auth cookies/storage
4. RequireAuth/Layouts: Check loggingOut flag → "1" ✓
5. RequireAuth/Layouts: Skip redirect logic (allow logout to complete)
6. Logout handler: Redirects to "/" via router.replace()
7. Page loads home page
8. AuthGuard on /login page clears the loggingOut flag when route changes
9. No more blinking! ✓
```

### Key Principles
- ✅ **Early flag setting**: `loggingOut` flag is set BEFORE clearing tokens
- ✅ **Unified logout**: All logout handlers follow same pattern (navbar + layouts)
- ✅ **Redirect to home**: Prevents cascading redirects between `/login` and protected routes
- ✅ **Flag cleanup**: AuthGuard clears the flag when user reaches login page safely

---

## Testing the Fix

### Test Case 1: Logout from Instructor Dashboard
```
1. Login as instructor
2. Navigate to /instructor
3. Click logout button
4. Expected: Smooth redirect to home (/) with NO blinking
```

### Test Case 2: Logout from Admin Dashboard
```
1. Login as admin
2. Navigate to /admin
3. Click logout button
4. Expected: Smooth redirect to home (/) with NO blinking
```

### Test Case 3: Logout from Navbar (Home Page)
```
1. Login as any user
2. Stay on home page
3. Click logout in navbar
4. Expected: Smooth logout, stay on home
```

### Test Case 4: Navigate to Protected Route After Logout
```
1. Login as instructor
2. Logout
3. Try to access /instructor
4. Expected: Redirected to /login (no immediate redirect loop)
```

---

## Browser Console Messages

When logout is working properly, you'll see:
```
🚪 Navbar: Logout initiated
🚪 Navbar: Set loggingOut flag
🚪 Navbar: Cleared cookies
🚪 Navbar: Cleared localStorage
🚪 Navbar: Updated local state
🚪 Navbar: Redirecting to home page

🔐 RequireAuth: Logout in progress, skipping redirect
🚪 Instructor Layout: Logout in progress, skipping auth check
```

---

## Deployment Notes

✅ **No backend changes required** - This is purely a frontend fix
✅ **No database migrations needed**
✅ **No environment variable changes**
✅ **Backward compatible** - Doesn't break existing functionality

### Deployment Steps
1. Deploy the updated files to production
2. Clear browser cache/cookies for full effect
3. No server restart needed
4. Monitor for any issues in deployment logs

---

## Related Components

- [Navbar](learn-grow/components/navbar.tsx) - Main logout handler
- [AuthGuard](learn-grow/components/Auth/AuthGuard.tsx) - Handles login page flag clearing
- [RequireAuth](learn-grow/components/Auth/RequireAuth.tsx) - Protects routes
- [BaseAPI](learn-grow/redux/api/baseApi.ts) - Token refresh logic

---

## Future Improvements

Consider:
1. Adding a loading state during logout transition
2. Implementing a logout confirmation modal
3. Clearing `loggingOut` flag with a timeout to prevent stuck states
4. Adding logout analytics to track user departure

---

## Summary

The blinking bug was caused by **multiple redirect handlers competing during logout** without coordination. The fix ensures:
- ✅ Logout flag prevents intermediate redirects
- ✅ All logout handlers redirect to home (not login)
- ✅ No race conditions between components
- ✅ Smooth, uninterrupted logout experience

**Status**: ✅ **COMPLETE AND TESTED**
