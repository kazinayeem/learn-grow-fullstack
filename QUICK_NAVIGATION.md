# 📍 Quick Navigation Guide - Subscription System

## 🎯 Where to Start Based on Your Needs

```
START HERE
    │
    ├─── NEW TO THIS SYSTEM?
    │    └─► READ: README_SUBSCRIPTION_SYSTEM.md
    │
    ├─── WANT COMPLETE OVERVIEW?
    │    └─► READ: SUBSCRIPTION_DOCS_INDEX.md
    │
    ├─── NEED TO SET UP DATABASE?
    │    └─► FOLLOW: DATABASE_SETUP.md
    │
    ├─── WANT TO TEST IT?
    │    └─► FOLLOW: SUBSCRIPTION_QUICKSTART.md → Test Scenarios
    │
    ├─── NEED TO UNDERSTAND ARCHITECTURE?
    │    └─► READ: SYSTEM_ARCHITECTURE.md
    │
    ├─── WANT IMPLEMENTATION DETAILS?
    │    └─► READ: SUBSCRIPTION_SYSTEM_SUMMARY.md
    │
    └─── NEED TO ADD FEATURES?
         └─► READ: REMAINING_TASKS.md
```

---

## 📂 File Organization

```
learn-grow-fullstack/
│
├─ SUBSCRIPTION_DOCS_INDEX.md ⭐ START HERE
├─ README_SUBSCRIPTION_SYSTEM.md (Final summary)
├─ IMPLEMENTATION_COMPLETE.md (Quick recap)
├─ SUBSCRIPTION_SYSTEM_SUMMARY.md (Detailed breakdown)
├─ SUBSCRIPTION_QUICKSTART.md (User/Admin guides)
├─ DATABASE_SETUP.md (Setup & deployment)
├─ SYSTEM_ARCHITECTURE.md (Diagrams & flows)
├─ REMAINING_TASKS.md (What's left to do)
│
├─ grow-backend/src/
│  ├─ modules/order/ ✅ COMPLETE
│  │  ├─ model/order.model.ts
│  │  ├─ controller/order.controller.ts
│  │  └─ routes/order.route.ts
│  │
│  ├─ middleware/
│  │  └─ course-access.ts ✅ COMPLETE
│  │
│  ├─ app.ts ✅ UPDATED
│  └─ types/express.d.ts ✅ UPDATED
│
└─ learn-grow/
   ├─ app/
   │  ├─ pricing/page.tsx ✅ COMPLETE
   │  ├─ checkout/page.tsx ✅ COMPLETE
   │  ├─ student/orders/page.tsx ✅ COMPLETE
   │  └─ admin/orders/page.tsx ✅ COMPLETE
   │
   ├─ components/
   │  └─ SubscriptionWidget.tsx ✅ COMPLETE
   │
   └─ redux/api/
      ├─ orderApi.ts ✅ COMPLETE
      └─ baseApi.ts ✅ UPDATED
```

---

## 🗺️ User Journey Map

### Student Path
```
Start
  │
  ▼ Login/Register
Authentication Page
  │
  ▼ Not logged in? → Redirects to /login
/pricing (View Plans)
  │
  ├─ Click "Single Course" → Select course → /checkout
  ├─ Click "Quarterly" → /checkout?plan=quarterly
  ├─ Click "Kit" → /checkout?plan=kit
  └─ Click "School" → /contact
  │
  ▼ /checkout (Fill Payment Form)
  ├─ Select payment method (from database)
  ├─ Enter sender number & transaction ID
  ├─ (Quarterly/Kit only) Enter delivery address
  └─ Submit
  │
  ▼ Order Created (Status: 🟡 Pending)
  │ Toast message: "Order placed, waiting for approval"
  │
  ▼ /student/orders (View My Orders)
  ├─ See order in "Pending" status
  ├─ Wait for admin approval
  └─ (Can submit multiple orders)
  │
  ▼ Admin Approves
  │
  ▼ Order Status Changes (Status: 🟢 Approved)
  ├─ Start date visible
  ├─ End date visible
  ├─ "Start Learning" button appears
  └─ Access granted immediately
  │
  ▼ Click "Start Learning" → /courses
  ├─ Access to course(s) granted
  └─ Can access for 3 months
  │
  ▼ Subscription Active (3 months countdown)
  ├─ Dashboard shows progress
  ├─ Alerts when < 7 days
  └─ Can access all course materials
  │
  ▼ Subscription Expires (After 3 months)
  ├─ Status changes to ❌ Expired
  ├─ Course access blocked automatically
  ├─ "Renew Subscription" button appears
  └─ Email reminder (when implemented)
  │
  ▼ Click "Renew Subscription"
  └─ Back to /pricing → Repeat flow
```

### Admin Path
```
Start
  │
  ▼ Login as Admin (role: "admin")
/admin/orders (Order Management)
  │
  ▼ View All Orders
  ├─ See list of all student orders
  ├─ Filter by: status, plan type
  ├─ Search by: name, email, transaction ID
  ├─ Pagination: 10/20/50/100 per page
  └─ Sort by: date, status
  │
  ├─ For PENDING orders:
  │  │
  │  ▼ Option 1: Quick Approve from Table
  │  └─ Click "Approve" button
  │     │
  │     ▼ Order Approved Immediately
  │     ├─ Sets: startDate, endDate (3 months)
  │     ├─ Sets: isActive = true
  │     ├─ Student notified (email when implemented)
  │     └─ Student gets access
  │
  │  ▼ Option 2: View Details First
  │  ├─ Click "View" button
  │  │
  │  ▼ Modal Opens (Order Details)
  │  ├─ User info
  │  ├─ Plan info
  │  ├─ Payment details (method, sender #, TXN ID)
  │  ├─ Delivery address
  │  └─ Approve/Reject buttons
  │  │
  │  ├─ Click "Approve Order"
  │  │  └─ Order approved (same as above)
  │  │
  │  └─ Click "Reject Order"
  │     ├─ (Optional) Enter rejection reason
  │     │
  │     ▼ Order Rejected
  │     ├─ Sets: paymentStatus = "rejected"
  │     ├─ Student sees: ❌ Rejected
  │     ├─ Reason shown to student
  │     └─ Student can retry with correct info
  │
  └─ For APPROVED orders:
     ├─ View button only (no action needed)
     └─ Details show: access period, user, status
```

---

## 🔑 Key Paths Quick Reference

### Pages & Routes
```
Student Routes (Login required):
  /pricing                    → View all plans
  /checkout?plan=...          → Buy subscription
  /student/orders             → My order history
  /student/dashboard          → See subscription status (with widget)
  /courses                    → Access purchased courses

Admin Routes (Login required + admin role):
  /admin/orders               → Order management dashboard
  /admin/payment-methods      → Manage payment methods
  /admin/events               → Manage events
```

### API Endpoints
```
Student Endpoints (Auth required):
  POST   /api/orders
  GET    /api/orders/my
  GET    /api/orders/subscription/check
  GET    /api/orders/purchased-courses

Admin Endpoints (Auth + Admin role required):
  GET    /api/orders
  GET    /api/orders/:id
  PATCH  /api/orders/:id/approve
  PATCH  /api/orders/:id/reject

Public Endpoints:
  GET    /api/payment-methods
  GET    /api/courses
```

---

## 💻 Component Usage

### Add Subscription Widget to Dashboard
```typescript
// In learn-grow/app/student/dashboard/page.tsx

import { SubscriptionWidget } from "@/components/SubscriptionWidget";

export default function Dashboard() {
  return (
    <div>
      <h1>My Dashboard</h1>
      
      {/* Add this component */}
      <SubscriptionWidget />
      
      {/* ... other components */}
    </div>
  );
}
```

### Use Order Hooks
```typescript
// Create order
import { useCreateOrderMutation } from "@/redux/api/orderApi";

const [createOrder, { isLoading }] = useCreateOrderMutation();
await createOrder({ ...orderData }).unwrap();

// Get my orders
import { useGetMyOrdersQuery } from "@/redux/api/orderApi";

const { data, isLoading } = useGetMyOrdersQuery();

// Check subscription
import { useCheckActiveSubscriptionQuery } from "@/redux/api/orderApi";

const { data } = useCheckActiveSubscriptionQuery();
if (data?.hasActiveSubscription) {
  // User has active subscription
}
```

---

## 🎯 Common Tasks

### "I need to customize pricing"
1. Edit: `learn-grow/app/pricing/page.tsx`
2. Update: `PLAN_PRICES` object in `learn-grow/app/checkout/page.tsx`
3. Update: `PLAN_NAMES` objects in both files

### "I need to add a new plan"
1. Add to `PLAN_PRICES` & `PLAN_NAMES` in pricing & checkout
2. Update backend: `PLAN_TYPES` in order.model.ts
3. Update checkout form: Add new route option
4. Test complete flow

### "I need to change subscription duration from 3 months to something else"
1. Find: `setMonth(endDate.getMonth() + 3)` in order.controller.ts
2. Replace with: `setMonth(endDate.getMonth() + X)` where X = duration in months
3. Update: Docs to reflect new duration

### "I need to add email notifications"
1. Follow: REMAINING_TASKS.md → Email Notifications section
2. Copy email templates
3. Implement in order.controller.ts where marked with `// TODO`
4. Test with test email account

### "I need to remove instructor registration"
1. Follow: REMAINING_TASKS.md → Remove Instructor section
2. Check files listed there
3. Remove instructor option from role selector
4. Remove instructor routes
5. Update navbar

### "I need to add guardian auto-creation"
1. Follow: REMAINING_TASKS.md → Guardian Auto-Creation section
2. Create Guardian model
3. Update user registration
4. Send guardian email
5. Test complete flow

---

## 🧪 Testing Checklist (5 minutes)

```
✓ Start servers (backend on 5000, frontend on 3000)
✓ Navigate to http://localhost:3000/pricing
✓ Click "Quarterly Subscription" (⭐)
✓ Login (or register as student)
✓ Fill checkout form:
  - Payment method: Select from dropdown
  - Sender number: 01700000000
  - Transaction ID: TEST123456
  - Delivery: Name, Phone, Address, City, Postal
✓ Submit order
✓ Check /student/orders → Status: 🟡 Pending
✓ Switch to admin account (if exists, or create one with role="admin")
✓ Navigate to /admin/orders
✓ Find order, click "Approve"
✓ Student order now shows: 🟢 Approved
✓ See "Start Learning" button
✓ Click it → Access to courses granted!
✓ Subscription widget shows active status
✓ Congratulations! System works! 🎉
```

---

## 🆘 Troubleshooting Quick Links

| Issue | Check This |
|-------|-----------|
| "Payment method not loading" | DATABASE_SETUP.md → Payment Methods section |
| "Order not submitting" | SUBSCRIPTION_QUICKSTART.md → Troubleshooting |
| "API 404 error" | grow-backend/src/app.ts → Check routes registered |
| "Access denied to course" | grow-backend/src/middleware/course-access.ts → Check logic |
| "Subscription dates wrong" | order.controller.ts → Check date calculation |
| "Widget not showing" | Check component imported in dashboard |

---

## 📚 Reading Order (Recommended)

**For Quick Setup (10 minutes)**:
1. This file (you are here)
2. DATABASE_SETUP.md (Setup section)
3. Launch & test

**For Complete Understanding (1 hour)**:
1. README_SUBSCRIPTION_SYSTEM.md
2. SUBSCRIPTION_DOCS_INDEX.md
3. SUBSCRIPTION_QUICKSTART.md
4. SYSTEM_ARCHITECTURE.md

**For Implementation Details (2 hours)**:
1. SUBSCRIPTION_SYSTEM_SUMMARY.md
2. Review backend files: order model, controller, routes
3. Review frontend files: pricing, checkout, orders pages

**For Extending System (Varies)**:
1. REMAINING_TASKS.md
2. Specific section for feature you want to add
3. Implementation code templates provided

---

## 🚀 One-Command Setup

```bash
# From root of learn-grow-fullstack:

# 1. Add payment methods to MongoDB (via MongoDB Compass UI or Mongo Shell)
# (See DATABASE_SETUP.md for details)

# 2. Terminal 1 - Start Backend
cd grow-backend && npm run dev

# 3. Terminal 2 - Start Frontend
cd learn-grow && npm run dev

# 4. Browser - Test
open http://localhost:3000/pricing

# 5. Complete the test flow in 5 minutes
# (See Testing Checklist above)
```

---

## ✅ You're All Set!

Everything is:
- ✅ Complete
- ✅ Documented
- ✅ Ready to use
- ✅ Ready to extend

**Pick your next action:**

- 🟢 **Just want to test?** → Go to SUBSCRIPTION_QUICKSTART.md
- 🟡 **Need to set up?** → Go to DATABASE_SETUP.md
- 🔵 **Want full details?** → Go to SUBSCRIPTION_DOCS_INDEX.md
- 🔴 **Ready to extend?** → Go to REMAINING_TASKS.md

---

**Happy coding!** 🚀

