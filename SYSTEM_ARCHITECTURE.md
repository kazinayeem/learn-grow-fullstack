# System Architecture & Data Flow Diagrams

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        LEARN & GROW PLATFORM                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────┐         ┌──────────────────────┐   │
│  │   FRONTEND (Next.js)     │         │   BACKEND (Express)  │   │
│  ├──────────────────────────┤         ├──────────────────────┤   │
│  │                          │         │                      │   │
│  │ Student Pages:           │         │ Order Module:        │   │
│  │ • /pricing               │◄────────►• Model               │   │
│  │ • /checkout              │  API    │• Controller          │   │
│  │ • /student/orders        │         │• Routes              │   │
│  │                          │         │                      │   │
│  │ Admin Pages:             │         │ Other Modules:       │   │
│  │ • /admin/orders          │         │• User                │   │
│  │                          │         │• Course              │   │
│  │ Components:              │         │• Payment Methods     │   │
│  │ • SubscriptionWidget     │         │• Event               │   │
│  │                          │         │                      │   │
│  │ Redux/RTK Query:         │         │ Middleware:          │   │
│  │ • orderApi               │         │• course-access       │   │
│  │ • paymentApi             │         │• auth                │   │
│  │ • baseApi                │         │• role                │   │
│  │                          │         │                      │   │
│  └──────────────────────────┘         └──────────────────────┘   │
│           ▲                                       ▲                │
│           │                                       │                │
│           └───────────────────┬───────────────────┘                │
│                               │                                    │
│                      localhost:5000 (API)                          │
│                                                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                   ┌──────────────────────┐
                   │   MONGODB DATABASE   │
                   ├──────────────────────┤
                   │ Collections:         │
                   │ • orders             │
                   │ • users              │
                   │ • courses            │
                   │ • paymentmethods     │
                   │ • events             │
                   │ • guardians          │
                   └──────────────────────┘
```

---

## 🔄 Order Creation Flow

```
┌──────────┐
│  Student │
│ (Logged  │
│  In)     │
└────┬─────┘
     │
     ▼ Click "Select Plan"
┌──────────────────┐
│  Pricing Page    │
│  /pricing        │
└────┬─────────────┘
     │
     ├─ Single Course?
     │   └─► Course selector dropdown
     │
     ├─ Quarterly/Kit?
     │   └─► Delivery address form
     │
     └─► Payment Method selector
         └─► Payment method loaded from:
             GET /api/payment-methods (public)
     │
     ▼ Fill form & click "Place Order"
┌──────────────────┐
│ Checkout Page    │
│ /checkout        │
└────┬─────────────┘
     │
     ▼ Submit order
┌──────────────────────────┐
│ POST /api/orders         │
│ (with auth token)        │
└────┬─────────────────────┘
     │
     ▼ Backend Validation
┌──────────────────────┐
│ • Required fields?   │
│ • Valid payment method?
│ • Valid course ID?   │
│ • Delivery address?  │
└────┬─────────────────┘
     │
     ├─ ❌ Validation failed?
     │   └─► Error response → User sees toast message
     │
     └─ ✅ Validation passed
        │
        ▼ Create Order in Database
     ┌─────────────────────────────────┐
     │ db.orders.insertOne({           │
     │   userId: "...",                │
     │   planType: "quarterly",        │
     │   paymentStatus: "pending", ◄─── DEFAULT
     │   isActive: false,              │
     │   ...                           │
     │ })                              │
     └────┬────────────────────────────┘
          │
          ▼ Success
     ┌──────────────────────────────┐
     │ Redirect to /student/orders  │
     │ Toast: "Order submitted"     │
     │ Status: 🟡 PENDING           │
     └────┬─────────────────────────┘
          │
          ▼ (Student waits)
     ┌──────────────────────────┐
     │ Admin Reviews in:        │
     │ /admin/orders            │
     └────┬─────────────────────┘
          │
          ├─ ✅ Approve
          │   │
          │   ▼ PATCH /api/orders/:id/approve
          │   ┌─────────────────────────────────────┐
          │   │ Set:                                │
          │   │ • startDate = today                 │
          │   │ • endDate = today + 3 months        │
          │   │ • paymentStatus = "approved"        │
          │   │ • isActive = true                   │
          │   └─────────────────────────────────────┘
          │   │
          │   ▼ Database Updated
          │   │
          │   ▼ Student sees: 🟢 APPROVED
          │       "Start Learning" button appears
          │
          └─ ❌ Reject
              │
              ▼ PATCH /api/orders/:id/reject
              ┌─────────────────────────┐
              │ Set:                    │
              │ • paymentStatus: "rejected"
              │ • isActive = false      │
              │ • Save rejection reason │
              └─────────────────────────┘
              │
              ▼ Student sees: ❌ REJECTED
                  "Retry with correct payment"
```

---

## 📊 Subscription Lifecycle

```
Timeline: 3 Months (90 Days)

Day 0 (Approval)
│
├─ Admin clicks "Approve"
│  └─ startDate = Jan 10, 2026
│  └─ endDate = Apr 10, 2026
│  └─ isActive = true
│  └─ status: 🟢 APPROVED
│
├─ Days 1-30: Active ✅
│  └─ User can access courses
│  └─ Dashboard: "60 days remaining"
│  └─ Progress bar: 33% used
│
├─ Days 31-60: Active ✅
│  └─ User can access courses
│  └─ Dashboard: "30 days remaining"
│  └─ Progress bar: 66% used
│
├─ Days 61-83: Active ✅
│  └─ User can access courses
│  └─ Dashboard: "7 days remaining" ⚠️
│  └─ Warning: "Renew soon"
│  └─ Renewal button appears
│
├─ Days 84-90: Active ✅ (Last week)
│  └─ User can still access
│  └─ Dashboard: "3 days remaining" ⚠️⚠️
│  └─ Strong renewal nudge
│
└─ Day 90+ (Expired)
   │
   ├─ System auto-checks:
   │  IF current_date > endDate
   │    └─ Set: isActive = false
   │
   ├─ Status changes: ❌ EXPIRED
   │
   └─ User gets:
      ├─ No course access
      ├─ "Subscription Expired" message
      ├─ "Renew Subscription" button
      │
      └─ User clicks Renew
         │
         ▼ New Order Created
         startDate = Apr 10, 2026
         endDate = Jul 10, 2026
         isActive = true (pending admin approval)
         │
         (Cycle repeats)
```

---

## 🔐 Access Control Flow

```
User Requests Course Content
│
▼
┌─────────────────────────────┐
│ Middleware: checkCourseAccess│
│ (applied to course routes)   │
└──────┬──────────────────────┘
       │
       ▼ Get user ID & course ID
       │
       ├─ Check 1: Active Quarterly Subscription
       │  │
       │  ├─ Query: Order where:
       │  │  • userId = current user
       │  │  • planType = "quarterly"
       │  │  • paymentStatus = "approved"
       │  │  • isActive = true
       │  │  • endDate >= today
       │  │
       │  ├─ ✅ Found?
       │  │  └─ User has ALL courses access
       │  │     Return: next()
       │  │
       │  └─ ❌ Not found?
       │     └─ Check 2
       │
       ├─ Check 2: Single Course Purchase
       │  │
       │  ├─ Query: Order where:
       │  │  • userId = current user
       │  │  • courseId = requested course
       │  │  • planType = "single"
       │  │  • paymentStatus = "approved"
       │  │  • isActive = true
       │  │  • endDate >= today
       │  │
       │  ├─ ✅ Found?
       │  │  └─ User owns this specific course
       │  │     Return: next() → Access granted
       │  │
       │  └─ ❌ Not found?
       │     │
       │     ▼ No valid access found
       │
       └─ ❌ Access Denied
          │
          ├─ Return: 403 Forbidden
          ├─ Message: "Subscribe to access this course"
          │
          └─ Frontend shows:
             "Subscription required"
             Button: "Go to Pricing"
```

---

## 👤 User Roles & Permissions

```
┌─────────────────────────────────────────────────────────────┐
│                    USER ROLES                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ STUDENT                   ADMIN                             │
│ ═══════════════          ════════════════                   │
│ Can:                      Can:                              │
│ • View pricing            • View all orders                │
│ • Create orders           • Filter/search orders           │
│ • View own orders         • View order details             │
│ • Access purchased        • Approve pending orders         │
│   courses                 • Reject orders                  │
│ • Check subscription      • See all payment methods        │
│   status                  • Manage payment methods         │
│ • Renew subscription      • View student activity          │
│                                                             │
│ Cannot:                   Cannot:                          │
│ • View other orders       • Create orders                  │
│ • Approve payments        • Access student courses         │
│ • Delete orders           • Make payments                  │
│ • Manage payments                                          │
│ • Access admin panel                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Middleware Protection:
┌──────────────────────────────────┐
│ public routes (no auth needed)    │
│ • GET /api/payment-methods       │
│ • GET /api/courses (list only)   │
│                                   │
├──────────────────────────────────┤
│ student routes (auth required)    │
│ • POST /api/orders               │
│ • GET /api/orders/my             │
│ • GET /api/orders/subscription/check
│                                   │
├──────────────────────────────────┤
│ admin routes (auth + role)        │
│ • GET /api/orders                │
│ • PATCH /api/orders/:id/approve  │
│ • PATCH /api/orders/:id/reject   │
│                                   │
└──────────────────────────────────┘
```

---

## 📦 Data Model Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                   DATABASE SCHEMA                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  User Collection               Order Collection             │
│  ════════════════              ════════════════              │
│  _id                           _id                          │
│  name                          userId ────────────┐         │
│  email                         planType           │         │
│  password                      courseId ──────────┼──┐      │
│  role: student|admin|...       paymentMethodId    │  │      │
│  phone                         transactionId  ┌───┼──┼──┐   │
│                                senderNumber   │   │  │  │   │
│                                paymentStatus  │   │  │  │   │
│                                deliveryAddress│   │  │  │   │
│                                startDate      │   │  │  │   │
│                                endDate        │   │  │  │   │
│                                isActive       │   │  │  │   │
│                                price          │   │  │  │   │
│  ◄─────────────────────────────────────────────┘   │  │  │   │
│                                                  │  │  │   │
│  Course Collection        PaymentMethod Collection │  │   │
│  ═════════════════        ═════════════════════════  │   │
│  _id ◄──────────────────────────────────────────────┘   │
│  title                        _id ◄──────────────────────┘
│  description                  name
│  instructor                   accountNumber
│  duration                     paymentNote
│  thumbnail                    isActive
│  modules[]                    order
│                               
│                               Guardian Collection (Future)
│                               ═════════════════════════════
│                               _id
│                               studentId ──────────┐
│                               username             │
│                               password             │
│                               email                │
│                               phone                │
│                               createdAt            │
│                                                    │
│                   ┌────────────────────────────────┘
│                   ▼
│  Student Collection ◄─────── References created guardian
│  ═══════════════════
│  _id (User)
│  guardianId (optional, when auto-created)
│  enrollments[]
│
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Admin Approval Workflow

```
New Order Submitted
        │
        ▼
    Pending Queue
    (Admin sees in /admin/orders)
        │
        ├─ View order details (modal)
        │  ├─ User info
        │  ├─ Plan details
        │  ├─ Payment info
        │  ├─ Transaction ID
        │  ├─ Delivery address (if applicable)
        │  │
        │  ├─ Admin Actions:
        │  │  ├─ Verify transaction in payment app
        │  │  │  (Check if sender number & amount correct)
        │  │  │
        │  │  ├─ ✅ Valid Transaction
        │  │  │  └─ Click "Approve Order" button
        │  │  │
        │  │  └─ ❌ Invalid/Suspicious
        │  │     └─ Click "Reject Order" button
        │  │        └─ Enter rejection reason
        │  │
        │  └─ System processes immediately
        │
        ├─ Approved Path
        │  │
        │  ├─ Database Update:
        │  │  • paymentStatus = "approved"
        │  │  • isActive = true
        │  │  • startDate = today
        │  │  • endDate = today + 3 months
        │  │
        │  ├─ Student Notification:
        │  │  • Dashboard shows: ✅ APPROVED
        │  │  • Access dates visible
        │  │  • "Start Learning" button active
        │  │  • (Future) Email sent
        │  │
        │  └─ Access Granted Immediately
        │
        └─ Rejected Path
           │
           ├─ Database Update:
           │  • paymentStatus = "rejected"
           │  • isActive = false
           │  • rejection reason stored
           │
           ├─ Student Notification:
           │  • Dashboard shows: ❌ REJECTED
           │  • Reason displayed
           │  • "Retry with correct payment" message
           │  • (Future) Email sent
           │
           └─ Access Denied
              │
              └─ Student can create new order with corrected info
```

---

## 📱 Frontend Component Tree

```
App
├─ Layout (with navbar, footer)
│
├─ Public Pages
│  ├─ /pricing
│  │  └─ PricingPage
│  │     ├─ PlanCard × 4
│  │     ├─ Plan: Single Course
│  │     ├─ Plan: Quarterly Subscription ⭐
│  │     ├─ Plan: Robotics Kit
│  │     └─ Plan: School Partnership
│  │
│  └─ /contact (School Partnership)
│
├─ Auth Pages
│  ├─ /login
│  ├─ /register
│  └─ /forgot-password
│
├─ Student Pages (Protected: requireAuth + student role)
│  ├─ /checkout
│  │  └─ CheckoutPage
│  │     ├─ OrderSummary
│  │     └─ CheckoutForm
│  │        ├─ CourseSelector (if single plan)
│  │        ├─ DeliveryAddressForm (if quarterly/kit)
│  │        ├─ PaymentMethodSelector
│  │        ├─ TransactionForm
│  │        └─ SubmitButton
│  │
│  ├─ /student/orders
│  │  └─ StudentOrdersPage
│  │     ├─ EmptyState (if no orders)
│  │     └─ OrderCard × N
│  │        ├─ OrderHeader (plan, price, status)
│  │        ├─ PaymentDetails
│  │        ├─ DeliveryAddress (if applicable)
│  │        ├─ AccessPeriod
│  │        └─ StatusMessage + CTA Button
│  │
│  └─ /student/dashboard
│     └─ Dashboard
│        ├─ SubscriptionWidget ◄─── New component
│        │  ├─ ActiveSubscription
│        │  │  ├─ Progress bar
│        │  │  ├─ Days remaining
│        │  │  └─ Renewal button (if < 25% left)
│        │  │
│        │  ├─ ExpiredSubscription
│        │  │  └─ Renewal button
│        │  │
│        │  └─ NoSubscription
│        │     └─ Link to /pricing
│        │
│        ├─ CoursesList
│        ├─ RecentActivity
│        └─ ProfileInfo
│
├─ Admin Pages (Protected: requireAuth + admin role)
│  ├─ /admin
│  │  └─ AdminDashboard
│  │     ├─ OrderStats
│  │     ├─ RecentOrders
│  │     ├─ SystemStatus
│  │     └─ QuickLinks
│  │
│  └─ /admin/orders
│     └─ AdminOrdersPage
│        ├─ SearchBar
│        ├─ FilterPanel
│        │  ├─ StatusFilter
│        │  ├─ PlanTypeFilter
│        │  └─ PaginationSelector
│        │
│        ├─ OrdersTable
│        │  ├─ TableRow × N
│        │  │  ├─ OrderID
│        │  │  ├─ User
│        │  │  ├─ Plan
│        │  │  ├─ Price
│        │  │  ├─ Payment
│        │  │  ├─ Status
│        │  │  ├─ Date
│        │  │  └─ Actions (View/Approve/Reject)
│        │  │
│        │  └─ Pagination
│        │
│        └─ OrderDetailsModal
│           ├─ UserInfo
│           ├─ PlanInfo
│           ├─ PaymentInfo
│           ├─ DeliveryAddress
│           ├─ AccessPeriod
│           ├─ RejectionReasonInput
│           └─ ActionButtons (Approve/Reject)
│
└─ Shared Components
   ├─ Navbar
   │  ├─ Logo
   │  ├─ NavLinks
   │  └─ UserMenu (Login/Logout/Account)
   │
   └─ Footer
      ├─ Links
      └─ Copyright
```

---

## 🔄 Redux State Management

```
store/
├─ rootReducer
│  ├─ user: userSlice
│  │  ├─ isLoading
│  │  ├─ user: { _id, name, email, role, ... }
│  │  └─ error
│  │
│  ├─ api: baseApi
│  │  └─ endpoints
│  │     ├─ paymentApi
│  │     │  ├─ getPaymentMethods (cache: "PaymentMethod")
│  │     │  └─ ...
│  │     │
│  │     └─ orderApi (NEW)
│  │        ├─ createOrder (mutation)
│  │        ├─ getMyOrders (query)
│  │        ├─ getAllOrders (query, admin)
│  │        ├─ getOrderById (query)
│  │        ├─ approveOrder (mutation)
│  │        ├─ rejectOrder (mutation)
│  │        ├─ checkActiveSubscription (query)
│  │        └─ getUserPurchasedCourses (query)
│  │
│  └─ other reducers
│     ├─ course
│     ├─ category
│     └─ ...
│
└─ hooks
   ├─ useAppSelector
   ├─ useAppDispatch
   └─ ...

Cache Tags:
├─ "Order" (invalidated on order changes)
├─ "PaymentMethod" (invalidated on payment method changes)
└─ others
```

---

**Diagram Version**: 1.0
**Last Updated**: December 28, 2025
**System Status**: Core architecture complete ✅

