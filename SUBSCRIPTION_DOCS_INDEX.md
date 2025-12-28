# 📚 Subscription & Pricing System - Complete Documentation Index

## 📖 Overview Files

### [SUBSCRIPTION_SYSTEM_SUMMARY.md](SUBSCRIPTION_SYSTEM_SUMMARY.md)
**What to read**: Complete system overview with all components
- All backend models, controllers, routes
- All frontend pages and components
- Admin dashboard features
- Access control implementation
- API integration details
- Pricing plans breakdown
- Subscription logic & renewal
- Email notification placeholders
- Security notes
- UI/UX highlights

### [SUBSCRIPTION_QUICKSTART.md](SUBSCRIPTION_QUICKSTART.md)
**What to read**: Step-by-step user & admin guides
- User journey (5 steps to buy & access)
- Admin workflow (approve/reject orders)
- Database structure overview
- API endpoints reference
- Subscription status flow diagram
- Subscription timeline examples
- Key business rules
- Test scenarios (4 detailed flows)
- Troubleshooting guide

### [DATABASE_SETUP.md](DATABASE_SETUP.md)
**What to read**: Database initialization & deployment
- Model creation status
- Routes registration status
- Payment methods seed data
- Database collections schema
- Verification steps
- Launch steps (backend → frontend)
- Environment variables
- Troubleshooting
- Sample test data
- Useful MongoDB commands

---

## 🗂️ Backend Files Created

### Order Model
- **File**: `grow-backend/src/modules/order/model/order.model.ts`
- **Contains**: Order schema with all fields, indexes, methods
- **What it does**: Defines order structure in MongoDB
- **Uses**: Mongoose

### Order Controller
- **File**: `grow-backend/src/modules/order/controller/order.controller.ts`
- **Contains**: 7 controller methods
- **Methods**:
  - `createOrder` → POST /api/orders
  - `getAllOrders` → GET /api/orders (admin)
  - `getOrderById` → GET /api/orders/:id (admin)
  - `getUserOrders` → GET /api/orders/my (student)
  - `approveOrder` → PATCH /api/orders/:id/approve (admin)
  - `rejectOrder` → PATCH /api/orders/:id/reject (admin)
  - `checkActiveSubscription` → GET /api/orders/subscription/check
  - `getUserPurchasedCourses` → GET /api/orders/purchased-courses

### Order Routes
- **File**: `grow-backend/src/modules/order/routes/order.route.ts`
- **Contains**: All order endpoints with proper middleware
- **Protected**: Student routes (requireAuth), Admin routes (requireRoles)

### Course Access Middleware
- **File**: `grow-backend/src/middleware/course-access.ts`
- **Contains**: 3 middleware functions
- **Functions**:
  - `checkCourseAccess` → Verify quarterly subscription OR single course purchase
  - `requireActiveSubscription` → Block non-subscribers
  - `expireOldSubscriptions()` → Auto-expire subscriptions (callable)

### Updated Files
- **File**: `grow-backend/src/app.ts`
  - Added order routes import & registration
- **File**: `grow-backend/src/types/express.d.ts`
  - Added `subscription` property to Express Request

---

## 🎨 Frontend Files Created

### Pricing Page
- **File**: `learn-grow/app/pricing/page.tsx`
- **Route**: `/pricing`
- **Component**: 4 pricing plan cards
- **Features**:
  - Responsive grid (1-4 columns)
  - Icons for each plan
  - ⭐ Popular badge for Quarterly
  - Price display with duration
  - Feature lists
  - Smart button routing

### Checkout Page
- **File**: `learn-grow/app/checkout/page.tsx`
- **Route**: `/checkout?plan=single|quarterly|kit|school`
- **Features**:
  - Dynamic form based on plan type
  - Course selector (single plan)
  - Delivery address form (quarterly/kit)
  - Payment method dropdown (from DB)
  - Transaction form
  - Order summary sidebar
  - Real-time validation
  - Success redirect to `/student/orders`

### Student Orders Page
- **File**: `learn-grow/app/student/orders/page.tsx`
- **Route**: `/student/orders`
- **Features**:
  - Order list with all details
  - Status badges (pending/approved/rejected)
  - Status-specific messaging
  - Delivery address display
  - "Start Learning" button for active
  - "Renew Subscription" for expired
  - Empty state with CTA
  - Order timeline display

### Admin Orders Page
- **File**: `learn-grow/app/admin/orders/page.tsx`
- **Route**: `/admin/orders`
- **Features**:
  - Searchable order list
  - Filters (status, plan type, items/page)
  - Pagination (10/20/50/100)
  - Table with all order info
  - Approve/Reject buttons (pending only)
  - Detailed order modal
  - Rejection reason input
  - One-click actions

### Subscription Widget Component
- **File**: `learn-grow/components/SubscriptionWidget.tsx`
- **Component**: `<SubscriptionWidget />`
- **Features**:
  - Active subscription: Progress bar, days remaining
  - Expired subscription: Renewal button
  - No subscription: CTA to pricing
  - Smart renewal button (at 25%)
  - Expiry warning (< 7 days)
  - Usage: Add to student dashboard

### Redux API
- **File**: `learn-grow/redux/api/orderApi.ts`
- **Hooks** (8 total):
  - `useCreateOrderMutation` → POST order
  - `useGetMyOrdersQuery` → Fetch my orders
  - `useGetAllOrdersQuery` → Fetch all (admin)
  - `useGetOrderByIdQuery` → Single order
  - `useApproveOrderMutation` → Approve
  - `useRejectOrderMutation` → Reject
  - `useCheckActiveSubscriptionQuery` → Check status
  - `useGetUserPurchasedCoursesQuery` → Bought courses
- **Updated**: `learn-grow/redux/api/baseApi.ts` (added "Order" tag)

---

## 🔌 API Endpoints Summary

### Student Endpoints
```
POST   /api/orders
GET    /api/orders/my
GET    /api/orders/subscription/check
GET    /api/orders/purchased-courses
```

### Admin Endpoints
```
GET    /api/orders
GET    /api/orders/:id
PATCH  /api/orders/:id/approve
PATCH  /api/orders/:id/reject
```

---

## 💳 Pricing Plans

| Plan | Price | Duration | Access | Delivery |
|------|-------|----------|--------|----------|
| Single Course | ৳3,500 | Per course, 3mo | 1 course | No |
| Quarterly ⭐ | ৳9,999 | 3 months | All courses | Yes |
| Robotics Kit | ৳4,500 | One-time | None (hardware only) | Yes |
| School | Custom | Custom | Custom | Contact |

---

## 🎯 Key Features

✅ **4 Pricing Plans** with different access levels
✅ **Login Required** for purchases (students only)
✅ **Manual Payment Approval** by admin
✅ **Automatic Subscription Expiry** after 3 months
✅ **Renewal System** for expired subscriptions
✅ **Course Access Control** (subscription or single purchase)
✅ **Delivery Address Handling** for physical products
✅ **Admin Dashboard** for order management
✅ **Student Order History** with status tracking
✅ **Real-time Subscription Status** widget
✅ **Responsive Design** (mobile, tablet, desktop)
✅ **Form Validation** on all fields

---

## ⏱️ Subscription Timeline Logic

```
1. Order Approved
   startDate = approval_date (today)
   endDate = startDate + 3 months
   isActive = true
   
2. Automatic Expiry
   IF current_date > endDate AND isActive = true
     → isActive = false (auto-set)
     
3. Access Blocked
   IF NOT (hasActiveSubscription OR ownsCourse AND withinAccessPeriod)
     → Block course access
     
4. User Renewal
   New startDate = today
   New endDate = today + 3 months
   Old subscription marked as inactive
```

---

## 🚀 Getting Started

### Quick Setup (5 minutes)
1. Read [DATABASE_SETUP.md](DATABASE_SETUP.md) - Setup section
2. Create payment methods in MongoDB
3. Start backend: `npm run dev` (grow-backend)
4. Start frontend: `npm run dev` (learn-grow)
5. Visit http://localhost:3000/pricing

### Complete Understanding (30 minutes)
1. Read [SUBSCRIPTION_SYSTEM_SUMMARY.md](SUBSCRIPTION_SYSTEM_SUMMARY.md)
2. Read [SUBSCRIPTION_QUICKSTART.md](SUBSCRIPTION_QUICKSTART.md)
3. Review backend files in `grow-backend/src/modules/order/`
4. Review frontend files in `learn-grow/app/pricing`, `learn-grow/app/checkout`, etc.

### Testing (20 minutes)
1. Follow [SUBSCRIPTION_QUICKSTART.md](SUBSCRIPTION_QUICKSTART.md) - Test Scenarios section
2. Create test account
3. Walk through order flow
4. Approve as admin
5. Verify access granted

---

## 📋 Implementation Checklist

- [x] Order model created
- [x] Order controller built
- [x] Order routes registered
- [x] Pricing page created
- [x] Checkout form built
- [x] Admin orders page created
- [x] Student orders page created
- [x] Subscription widget component
- [x] Redux API setup
- [x] Access control middleware
- [x] Date calculations (3 months)
- [x] Auto-expiry logic
- [ ] Email notifications (TODO)
- [ ] Guardian auto-creation (TODO)
- [ ] Remove instructor flow (TODO)

---

## 🆘 Common Questions

**Q: Where do students buy?**
A: `/pricing` → Select plan → `/checkout` → Fill form → Submit

**Q: Where do admins manage?**
A: `/admin/orders` → Search/filter → View/Approve/Reject

**Q: How long is access?**
A: 3 months from approval date (automatic)

**Q: What if subscription expires?**
A: Student sees "Expired" status, can click "Renew Subscription" button

**Q: Can users buy without login?**
A: No, system redirects to login page

**Q: What payment methods are supported?**
A: Whatever is in database (bKash, Nagad, Rocket, Bank Transfer, custom)

**Q: How does admin know payment is valid?**
A: Manual review - admin checks transaction ID in payment system, then approves/rejects in admin panel

**Q: Can user access course before approval?**
A: No, access only granted after admin approves

**Q: Can user buy multiple subscriptions?**
A: Yes, but only 1 can be active at a time (auto-manages)

---

## 🔗 Cross-References

### If You Want to:
- **Add a new pricing plan** → Update prices in checkout & pricing pages
- **Change payment methods** → Modify paymentMethodRoutes & database
- **Extend subscription length** → Change `setMonth(endDate.getMonth() + 3)` to different value
- **Add email notifications** → Implement in order.controller.ts (marked with TODO)
- **Create guardian accounts** → Add logic to user registration service
- **Remove instructor option** → Update auth routes and select-role page

---

## 📞 Support Resources

- **Backend Issues**: Check logs in terminal
- **Frontend Issues**: Check browser console (F12)
- **Database Issues**: Use MongoDB Compass to inspect
- **API Issues**: Test with curl or Postman
- **Middleware Issues**: Check express.d.ts types

---

## ✨ Future Enhancements

Priority 1 (Core):
- [ ] Email notifications (confirmation, approval, rejection)
- [ ] Guardian auto-creation system
- [ ] Remove instructor registration

Priority 2 (Business):
- [ ] Payment gateway integration (bKash API, Nagad API)
- [ ] Discount codes / Coupon system
- [ ] Invoice generation & PDF download
- [ ] Subscription history analytics

Priority 3 (Nice to Have):
- [ ] SMS notifications
- [ ] Auto-renewal with saved payment
- [ ] Refund management
- [ ] Bulk student imports (for schools)

---

## 📊 Metrics to Track

- Total orders created
- Approval rate (approved / total)
- Rejection rate (rejected / total)
- Revenue per plan
- Active subscriptions count
- Renewal rate (renewals / expiring)
- Course access frequency

---

**Last Updated**: December 28, 2025
**System Status**: ✅ Core system complete, ready for testing
**Next Phase**: Email notifications & Guardian system

