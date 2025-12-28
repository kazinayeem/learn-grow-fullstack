# Subscription & Pricing System - Implementation Summary

## 🎯 What's Built

### 1. **Backend Order/Subscription System**

#### Model: `Order` (MongoDB)
- **File**: `grow-backend/src/modules/order/model/order.model.ts`
- **Schema Fields**:
  - `userId`: Reference to User
  - `planType`: single | quarterly | kit | school
  - `courseId`: Reference to Course (required for single plan)
  - `paymentMethodId`: Reference to PaymentMethod
  - `transactionId`: User's payment transaction ID
  - `senderNumber`: User's mobile/account number
  - `paymentNote`: Optional note
  - `paymentStatus`: pending | approved | rejected
  - `deliveryAddress`: Object with name, phone, address, city, postal code
  - `startDate`, `endDate`: For subscription validity
  - `isActive`: Boolean for subscription status
  - `price`: Order amount

#### Controller: Order CRUD + Approval
- **File**: `grow-backend/src/modules/order/controller/order.controller.ts`
- **Methods**:
  - `createOrder`: Students submit order with payment details
  - `getAllOrders`: Admin view all orders with filters
  - `getOrderById`: Admin/Student view order details
  - `approveOrder`: Admin approves, sets startDate/endDate (3 months)
  - `rejectOrder`: Admin rejects with optional reason
  - `getUserOrders`: Student's own orders
  - `checkActiveSubscription`: Check if user has valid subscription
  - `getUserPurchasedCourses`: Get courses user bought

#### Routes: Protected Endpoints
- **File**: `grow-backend/src/modules/order/routes/order.route.ts`
- **Student Routes**:
  - `POST /api/orders` - Create order
  - `GET /api/orders/my` - Get my orders
  - `GET /api/orders/subscription/check` - Check active subscription
  - `GET /api/orders/purchased-courses` - Get purchased courses
- **Admin Routes**:
  - `GET /api/orders` - Get all orders (with filters)
  - `GET /api/orders/:id` - Order details
  - `PATCH /api/orders/:id/approve` - Approve order
  - `PATCH /api/orders/:id/reject` - Reject order

---

### 2. **Frontend - User Facing**

#### Pricing Page: `/pricing`
- **File**: `learn-grow/app/pricing/page.tsx`
- **Features**:
  - 4 plan cards with pricing
  - ⭐ Popular badge for Quarterly Subscription
  - "Most Popular" styling
  - Click handlers redirect to checkout or contact
  - Responsive grid layout (1 col mobile, 4 col desktop)

#### Checkout Page: `/checkout`
- **File**: `learn-grow/app/checkout/page.tsx`
- **Dynamic Form Based on Plan**:
  - **Single Course**: Course selector dropdown
  - **Quarterly/Kit**: Delivery address form (name, phone, address, city, postal)
  - **Payment Details**: 
    - Select from database payment methods
    - Enter sender number
    - Enter transaction ID
    - Optional payment note
  - **Order Summary**: Shows plan, price, total
  - **Validation**: All required fields enforced
  - **Success**: Redirects to `/student/orders` after submission

#### Student Orders Page: `/student/orders`
- **File**: `learn-grow/app/student/orders/page.tsx`
- **Features**:
  - List all user's orders
  - Status badges (pending/approved/rejected)
  - Order details: plan, price, payment method, dates
  - Delivery address display (if applicable)
  - Status-specific messaging:
    - 🟡 Pending: "Waiting for admin approval"
    - 🟢 Approved & Active: "Start Learning" button
    - 🔴 Expired: "Renew Subscription" button
    - ❌ Rejected: "Contact support" message
  - Kit-specific: Delivery status message
  - Empty state: "Buy New Plan" button

---

### 3. **Frontend - Admin Panel**

#### Admin Orders Page: `/admin/orders`
- **File**: `learn-grow/app/admin/orders/page.tsx`
- **Features**:
  - **Search**: By name, email, transaction ID
  - **Filters**: Status (pending/approved/rejected), Plan type
  - **Pagination**: 10/20/50/100 items per page
  - **Table Columns**: Order ID, User, Plan, Price, Payment, Status, Date, Actions
  - **Action Buttons**:
    - Pending orders: Approve/Reject buttons
    - All orders: View Details button
  - **Details Modal**: 
    - User info (name, email)
    - Plan info (plan type, course if applicable)
    - Payment info (method, account, sender number, transaction ID)
    - Delivery address (if applicable)
    - Access period (start/end dates)
    - Rejection reason input (for pending orders)
  - **One-click Approval/Rejection**: Directly from table or modal

---

### 4. **Dashboard Component**

#### Subscription Status Widget
- **File**: `learn-grow/components/SubscriptionWidget.tsx`
- **States**:
  - **Active**: Shows progress bar, days remaining, expiry date, renewal option
  - **Expired**: Shows renewal button and expired date
  - **None**: Shows call-to-action for pricing page
- **Features**:
  - Progress bar showing days used
  - Expiry warning when < 7 days left
  - Automatic renewal button at 25% remaining

---

### 5. **Access Control**

#### Course Access Middleware
- **File**: `grow-backend/src/middleware/course-access.ts`
- **Middlewares**:
  - `checkCourseAccess`: 
    - Checks if user has active quarterly subscription (all courses)
    - OR owns specific course (single plan) and it's still valid
    - Auto-deactivates expired subscriptions
    - Returns 403 if no access
  - `requireActiveSubscription`:
    - Checks for valid quarterly subscription only
    - Attaches subscription to request
  - `expireOldSubscriptions()`:
    - Auto-marks expired orders as inactive
    - Can be called periodically

---

### 6. **API Integration**

#### Redux/RTK Query
- **File**: `learn-grow/redux/api/orderApi.ts`
- **Hooks**:
  - `useCreateOrderMutation`: Submit order
  - `useGetMyOrdersQuery`: Fetch user's orders
  - `useGetAllOrdersQuery`: Admin fetch all orders
  - `useGetOrderByIdQuery`: Fetch single order
  - `useApproveOrderMutation`: Admin approve
  - `useRejectOrderMutation`: Admin reject
  - `useCheckActiveSubscriptionQuery`: Check if user has active subscription
  - `useGetUserPurchasedCoursesQuery`: Get user's purchased courses

#### API Base
- Added "Order" tag to Redux base API for caching

---

## 💳 Pricing Plans (Hardcoded)

| Plan | Price | Duration | Features | Redirect |
|------|-------|----------|----------|----------|
| Single Course | ৳3,500 | Per course, 3 months | 1 course, 3 months access | `/courses` |
| Quarterly Subscription | ৳9,999 | 3 months | All courses, live classes, priority support, certificates, community, robotics kit | `/checkout?plan=quarterly` |
| Robotics Kit | ৳4,500 | One-time | Hardware delivery only, no course access | `/checkout?plan=kit` |
| School Partnership | Custom | Custom | Contact only | `/contact` |

---

## 🔄 Subscription Logic

### When Admin Approves Order:
```
startDate = approval_date (today)
endDate = startDate + 3 months (90 days)
isActive = true
paymentStatus = "approved"
```

### Access Validation:
```
IF current_date <= endDate AND isActive = true
  → ALLOW access
ELSE
  → Block access
  → Mark isActive = false (auto-expire)
```

### Renewal:
```
When user clicks "Renew":
  → Creates new Order with planType="quarterly"
  → New start_date = today
  → New end_date = today + 3 months
  → Old subscription stays in history (isActive = false if expired)
```

---

## 📧 Email Notifications (TODO)

- ✅ Placeholder code added
- ⏳ Need to implement:
  1. Order submitted → Confirmation email
  2. Payment approved → Access granted email with start/end dates
  3. Payment rejected → Rejection email with reason
  4. Guardian creation → Guardian credentials email
  5. Subscription expiry → 7-day reminder email

---

## 🚀 Key Features Implemented

✅ 4 pricing plans with different features
✅ Login required for purchase
✅ Payment method selection from database
✅ Delivery address handling (for subscription/kit)
✅ Manual approval workflow (pending → approved/rejected)
✅ Automatic subscription expiry (3 months)
✅ Subscription renewal system
✅ Course access control (subscription or single purchase)
✅ Admin order management dashboard
✅ Student order history with status tracking
✅ Real-time subscription status widget
✅ Responsive design (mobile, tablet, desktop)

---

## 📋 Still TODO

1. **Guardian Auto-Creation**: 
   - When student registers, auto-create guardian account
   - Send guardian credentials via email
   - Username format: `studentname_guardian`

2. **Email Notifications**:
   - Order confirmation
   - Payment approval
   - Payment rejection
   - Guardian credentials
   - Expiry reminders

3. **Remove Instructor Flow**:
   - Remove instructor registration/login completely
   - Update UI to only show student options
   - Update auth routes

4. **Advanced Features** (Optional):
   - Refund system
   - Discount codes
   - Payment gateway integration (bKash, Nagad, Rocket)
   - SMS notifications
   - Subscription history analytics
   - Auto-renewal with payment gateway

---

## 🧪 Testing Checklist

- [ ] Pricing page loads correctly
- [ ] Checkout form validates all fields
- [ ] Order submits successfully (creates pending order)
- [ ] Admin can see orders in management page
- [ ] Admin can approve order (sets dates correctly)
- [ ] Admin can reject order
- [ ] Student can see their orders
- [ ] Subscription widget shows correct status
- [ ] Expired subscription auto-blocks course access
- [ ] Single course purchase works independently
- [ ] Delivery address validation works

---

## 📁 File Structure

```
grow-backend/
  src/
    modules/order/
      model/order.model.ts ✅
      controller/order.controller.ts ✅
      routes/order.route.ts ✅
    middleware/
      course-access.ts ✅
    types/
      express.d.ts ✅ (updated)
    app.ts ✅ (updated)

learn-grow/
  app/
    pricing/page.tsx ✅
    checkout/page.tsx ✅
    admin/orders/page.tsx ✅
    student/orders/page.tsx ✅
  components/
    SubscriptionWidget.tsx ✅
  redux/
    api/
      orderApi.ts ✅
      baseApi.ts ✅ (updated)
```

---

## 🔐 Security Notes

- All order routes protected with `requireAuth` middleware
- Admin routes require `requireRoles("admin")` middleware
- Course access verified on every request
- Subscription dates auto-expire (no manual cleanup needed)
- Payment details stored but not processed (manual approval)
- User can only see their own orders (except admins)

---

## 🎨 UI/UX Highlights

- **Color Coding**: 
  - Yellow (⏳) for pending
  - Green (✅) for approved
  - Red (❌) for rejected
- **Progress Bars**: Show subscription days remaining
- **Smart Messages**: Status-specific guidance for users
- **Responsive Tables**: Mobile-friendly admin dashboard
- **Empty States**: Clear CTAs when no orders exist
- **Modal Details**: Comprehensive order information in detailed view

