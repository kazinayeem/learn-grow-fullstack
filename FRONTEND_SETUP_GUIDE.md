# Frontend Setup & Integration Guide

## Quick Start

### 1. Install Dependencies

The frontend already has all required dependencies. If needed, run:

```bash
cd learn-grow
npm install
```

### 2. Verify Backend is Running

Ensure the backend server is running:

```bash
cd grow-backend
npm run dev
# or
npm start
```

Backend should be accessible at: `http://localhost:5000/api`

### 3. Configure API URL

Check `learn-grow/config/apiConfig.ts` or `.env.local`:

```typescript
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Start Frontend Development Server

```bash
cd learn-grow
npm run dev
```

Frontend will be available at: `http://localhost:3000`

## File Locations Reference

### New Components Created

```
learn-grow/
├── components/
│   ├── admin/
│   │   ├── ComboManagement.tsx              [NEW]
│   │   └── AccessDurationManager.tsx        [NEW]
│   ├── checkout/
│   │   └── ComboCheckoutSummary.tsx         [NEW]
│   ├── combo/
│   │   ├── ComboListing.tsx                 [EXISTING]
│   │   └── ComboDetails.tsx                 [NEW]
│   ├── course/
│   │   └── AccessStatusDisplay.tsx          [NEW]
│   └── dashboard/
│       └── StudentCourseDashboard.tsx       [NEW]
├── app/
│   ├── admin/
│   │   ├── combos/page.tsx                  [NEW]
│   │   └── access-duration/page.tsx         [NEW]
│   └── student/
│       ├── combos/page.tsx                  [NEW]
│       ├── combo/[comboId]/page.tsx         [NEW]
│       └── courses/page.tsx                 [NEW]
├── redux/
│   └── api/
│       ├── comboApi.ts                      [MODIFIED - added getAllCombos]
│       └── accessManagementApi.ts           [EXISTING]
├── lib/
│   └── access-control.ts                    [EXISTING]
└── types/
    └── combo.types.ts                       [EXISTING]
```

## Integration Steps

### Step 1: Verify Backend Routes

Confirm these routes exist in `grow-backend/src/modules/course/routes/combo.route.ts`:

```typescript
// Public routes
router.get('/list', getActiveCombos);
router.get('/:comboId', getComboById);

// User routes
router.post('/enroll', checkAuth, enrollInCombo);
router.get('/my/purchases', checkAuth, getUserComboPurchases);

// Admin routes
router.post('/create', checkAuth, checkAdmin, createCombo);
router.patch('/:comboId', checkAuth, checkAdmin, updateCombo);
router.delete('/:comboId', checkAuth, checkAdmin, disableCombo);
router.post('/extend-access', checkAuth, checkAdmin, extendComboAccess);
```

### Step 2: Update Navigation Menu

Add links to new pages in your navigation component:

**For Students:**
```tsx
<Link href="/student/combos">Browse Combos</Link>
<Link href="/student/courses">My Courses</Link>
```

**For Admins:**
```tsx
<Link href="/admin/combos">Manage Combos</Link>
<Link href="/admin/access-duration">Access Management</Link>
```

### Step 3: Update Checkout Flow

Modify checkout to handle combo purchases:

```tsx
const planType = searchParams.get("plan"); // "combo", "single", etc.
const comboId = searchParams.get("comboId"); // For combo purchases

if (planType === "combo" && comboId) {
  // Show combo checkout summary
  // Create order with planType: "combo" and comboId
}
```

### Step 4: Update Student Dashboard

Replace or enhance existing dashboard with:

```tsx
import StudentCourseDashboard from "@/components/dashboard/StudentCourseDashboard";

export default function DashboardPage() {
  return <StudentCourseDashboard />;
}
```

### Step 5: Configure Redux Store

Ensure Redux store includes both API slices in `redux/store.ts`:

```typescript
import { comboApi } from "./api/comboApi";
import { accessManagementApi } from "./api/accessManagementApi";

export const store = configureStore({
  reducer: {
    [comboApi.reducerPath]: comboApi.reducer,
    [accessManagementApi.reducerPath]: accessManagementApi.reducer,
    // ... other reducers
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(comboApi.middleware)
      .concat(accessManagementApi.middleware),
});
```

## Testing the Implementation

### Test 1: View Combos (Student)

1. Go to `http://localhost:3000/student/combos`
2. Should see list of active combos in grid layout
3. Click "View Details" to see combo details
4. Verify pagination works

**Expected:**
- ✅ Combos load from `/api/combo/list`
- ✅ Grid displays correctly
- ✅ Pagination works (9 combos per page)
- ✅ Click "Buy Now" redirects to checkout with combo params

### Test 2: View Combo Details (Student)

1. Go to `http://localhost:3000/student/combo/[comboId]`
2. See full combo details with all courses
3. Click "Purchase Now" to go to checkout

**Expected:**
- ✅ Combo loads from `/api/combo/[comboId]`
- ✅ All course details display
- ✅ Price breakdown shows correctly
- ✅ Purchase button redirects to checkout

### Test 3: Manage Combos (Admin)

1. Go to `http://localhost:3000/admin/combos`
2. See all combos in table format
3. Click "Create Combo" to open modal
4. Fill form and create combo
5. Try editing and disabling combos

**Expected:**
- ✅ Requires admin authentication
- ✅ Combos list loads from `/api/combo`
- ✅ Create mutation works
- ✅ Update mutation works
- ✅ Disable mutation works

### Test 4: Manage Access Duration (Admin)

1. Go to `http://localhost:3000/admin/access-duration`
2. Enter a student user ID
3. See their course access status
4. Set access duration for a course
5. Extend or reduce access

**Expected:**
- ✅ Requires admin authentication
- ✅ User's courses load from `/api/orders/admin/user-course-access/:userId`
- ✅ Set duration works
- ✅ Extend access works
- ✅ Reduce access works

### Test 5: View Course Access (Student)

1. Login as a student with purchased courses
2. Go to `http://localhost:3000/student/courses`
3. See all courses with access status
4. Check remaining days display
5. Test expiring soon warning (for courses expiring in 7 days)

**Expected:**
- ✅ Enrollments load from `/api/orders/admin/user-course-access/:userId`
- ✅ Access status displays correctly
- ✅ Progress bar shows time remaining
- ✅ Expiring soon warning appears for courses with < 7 days
- ✅ Expired courses show renewal option

### Test 6: Purchase Combo

1. Go to combo details page
2. Click "Purchase Now"
3. Complete checkout process
4. After payment approval, user should be enrolled

**Expected:**
- ✅ Order created with `planType: "combo"` and `comboId`
- ✅ User enrolled in all combo courses
- ✅ Access duration set correctly
- ✅ User can see combo courses in dashboard

## Troubleshooting

### Issue: "Combos not loading"

**Check:**
1. Backend is running: `http://localhost:5000/api/combo/list`
2. API URL configured correctly in `config/apiConfig.ts`
3. Network tab shows requests are being sent
4. Redux DevTools shows API request/response

**Fix:**
```bash
# Restart backend
cd grow-backend
npm run dev

# Clear frontend cache and restart
cd learn-grow
npm run dev
```

### Issue: "Authentication errors"

**Check:**
1. Token is saved in localStorage: `localStorage.getItem("token")`
2. Token is being sent in Authorization header
3. Token is not expired
4. Backend validates token correctly

**Fix:**
```typescript
// Check in browser console:
console.log(localStorage.getItem("token"));

// Re-login and check token renewal
```

### Issue: "Components not displaying"

**Check:**
1. NextUI components are imported correctly
2. Tailwind CSS is configured
3. Build errors in console

**Fix:**
```bash
# Clear cache and rebuild
cd learn-grow
rm -rf .next
npm run build
npm run dev
```

### Issue: "Access denied for admin pages"

**Check:**
1. User role is "admin" or "instructor" in database
2. Auth middleware properly checks role
3. User is logged in

**Fix:**
```typescript
// Verify user role in Redux state or API response
const user = useSelector(state => state.auth.user);
console.log(user?.role);
```

## Browser DevTools Tips

### Redux DevTools
```javascript
// Open Redux DevTools in browser console
// Check:
// 1. comboApi cache (Combo queries)
// 2. accessManagementApi cache (Access queries)
// 3. Mutations and their status
```

### Network Tab
```javascript
// Monitor API requests:
// GET /api/combo/list
// GET /api/combo/:comboId
// POST /api/combo/create (admin)
// PATCH /api/combo/:comboId (admin)
// GET /api/orders/admin/user-course-access/:userId (admin)
// POST /api/orders/admin/set-access-duration (admin)
```

### Local Storage
```javascript
// Check stored data:
localStorage.getItem("token")          // Auth token
sessionStorage.getItem("selectedCombo") // Combo for checkout
```

## Next Steps

After verifying all tests pass:

1. **Add Email Notifications** - Notify users when access is expiring
2. **Create Admin Dashboard** - Aggregate combo management with other admin tasks
3. **Add Analytics** - Track combo popularity and user access patterns
4. **Implement Auto-Expiry** - Cron jobs to automatically expire access
5. **Add Combo Recommendations** - Suggest combos to users
6. **Create Reports** - Access and enrollment reports for admins

## Support

For issues or questions:
- Check Backend docs: `grow-backend/LMS_REQUIREMENTS_UPDATED.md`
- Check Frontend docs: `FRONTEND_IMPLEMENTATION_GUIDE.md`
- Review component source code for usage examples
- Check Redux API slice documentation

---

**Last Updated:** January 11, 2025
**Frontend Version:** 1.0.0
**Backend Version:** 1.0.0
