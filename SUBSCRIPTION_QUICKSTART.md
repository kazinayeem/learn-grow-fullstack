# Subscription & Pricing System - Quick Start Guide

## 🚀 For Users (Students)

### Step 1: View Pricing
1. Navigate to `/pricing`
2. See 4 plans:
   - **Single Course** (৳3,500): Buy access to 1 course for 3 months
   - **Quarterly Subscription** (৳9,999): ⭐ All courses + benefits for 3 months
   - **Robotics Kit** (৳4,500): Hardware delivery only
   - **School Partnership**: Contact for custom pricing

### Step 2: Select Plan & Checkout
- Click on desired plan button
- **Single Course**: You'll see all courses, select one, then checkout
- **Quarterly/Kit**: Go directly to checkout with delivery form
- **School**: Redirect to contact page

### Step 3: Fill Payment Form
1. Select payment method (from database: bKash, Nagad, Rocket, Bank Transfer, Custom)
2. Enter your phone/account number
3. Enter transaction ID from payment
4. (Optional) Add payment note
5. **For Quarterly/Kit**: Enter delivery address:
   - Full name
   - Phone number
   - Full address
   - City
   - Postal code

### Step 4: Submit & Wait
- Order created with status "pending"
- You'll see it in `/student/orders`
- Status shows: 🟡 Pending (Admin reviewing)

### Step 5: Access After Approval
- Once admin approves: 🟢 Approved
- Shows access period (e.g., Jan 10 - Apr 10)
- "Start Learning" button appears
- Click to access course(s)

### Step 6: Subscription Expires
- Automatically expires after 3 months
- Shows: ❌ Subscription Expired
- Click "Renew Subscription" to buy again
- New subscription: Today + 3 months

---

## 👨‍💼 For Admins

### Step 1: Access Admin Dashboard
- Navigate to `/admin/orders`
- See all orders from all students

### Step 2: Filter & Search
- **Search by**: Student name, email, or transaction ID
- **Filter by Status**: Pending, Approved, Rejected
- **Filter by Plan**: Single Course, Quarterly, Kit, School
- **Sort by**: Date, pagination (10/20/50/100 per page)

### Step 3: Review Order Details
- Click "View" button on any order
- See complete details in modal:
  - Student info (name, email)
  - Payment details (method, transaction ID, sender number)
  - Delivery address (if applicable)
  - Plan information
  - Selected course (if single plan)

### Step 4: Approve Order
**For Pending Orders:**
1. Click "Approve" button directly from table, OR
2. Click "View" → Modal opens → Click "Approve Order"
3. System automatically sets:
   - Start Date: Today
   - End Date: Today + 3 months
   - Status: Approved
   - Active: True

**Approved Orders Show:**
- ✅ Green "Approved" status
- Student gets course access immediately
- Access period visible in their dashboard

### Step 5: Reject Order
**For Pending Orders:**
1. Click "Reject" button or "View" → Modal
2. (Optional) Enter rejection reason
3. Click "Reject Order"
4. System sets:
   - Status: Rejected
   - Active: False
   - Reason stored in payment note

**Rejected Orders Show:**
- ❌ Red "Rejected" status
- Student can retry with correct payment
- Reason shown to student

### Step 6: Monitor Subscription Status
- **Active**: Green chip, access within date range
- **Expired**: Gray chip, automatically marked after end date
- **Kit Only**: Shows delivery status (hardware-only, no course access)

---

## 💾 Database Structure

### Order Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId → User,
  planType: "single" | "quarterly" | "kit" | "school",
  courseId: ObjectId → Course (required if planType="single"),
  paymentMethodId: ObjectId → PaymentMethod,
  transactionId: "TXN123456",
  senderNumber: "01XXXXXXXXX",
  paymentNote: "Optional notes",
  paymentStatus: "pending" | "approved" | "rejected",
  deliveryAddress: {
    name: "John Doe",
    phone: "01XXXXXXXXX",
    fullAddress: "123 Main St",
    city: "Dhaka",
    postalCode: "1200"
  },
  startDate: Date,      // Set when approved
  endDate: Date,        // startDate + 3 months
  isActive: Boolean,    // Auto-set to false when expired
  price: 9999,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔗 API Endpoints

### Student Endpoints (Require Login)
```
POST   /api/orders                          Create order
GET    /api/orders/my                       Get my orders
GET    /api/orders/subscription/check       Check active subscription
GET    /api/orders/purchased-courses        Get courses I bought
```

### Admin Endpoints (Require Admin Role)
```
GET    /api/orders                          Get all orders (with filters)
GET    /api/orders/:id                      Get order details
PATCH  /api/orders/:id/approve              Approve order
PATCH  /api/orders/:id/reject               Reject order
```

---

## 📊 Subscription Status Flow

```
USER SUBMITS ORDER
        ↓
STATUS = "pending"
        ↓
ADMIN REVIEWS PAYMENT
        ↓
    ┌───┴───┐
    ↓       ↓
APPROVE   REJECT
    ↓       ↓
 ✅ Set   ❌ No
 dates,   access
 grant
 access
```

---

## ⏰ Subscription Timeline Example

**Order Approved**: Jan 10, 2026, 2:00 PM
- Start Date: Jan 10, 2026
- End Date: Apr 10, 2026
- Days: 90
- Status: Active ✅

**Progress Tracking**:
- Jan 10 - Feb 10 (30 days used, 60 remaining)
- Feb 10 - Mar 10 (60 days used, 30 remaining)
- Mar 10 - Mar 31 (80 days used, 10 remaining) ⚠️ Warning at 7 days
- Apr 10: Expires, Status: Inactive ❌

**Renewal**:
- User clicks "Renew Subscription"
- New Order created
- New Start: Apr 10, 2026
- New End: Jul 10, 2026

---

## 🎯 Key Rules

✅ **User can't buy without login** → Redirects to login
✅ **Only students can buy** → Instructor role blocked
✅ **Single course needs course selection** → Error if missing
✅ **Delivery address required for Quarterly/Kit** → Form validation
✅ **All fields required** → Form validation prevents submission
✅ **Automatic expiry after 3 months** → No manual intervention needed
✅ **Can't access expired courses** → Automatic blocking
✅ **Old subscription preserved in history** → For audit trail
✅ **No overlapping active subscriptions** → One active at a time (can renew before expiry)

---

## 🧪 Test Scenarios

### Scenario 1: Student Buys Single Course
1. Login as student
2. Go to /pricing
3. Click "Single Course" card
4. Select a course from dropdown
5. Select payment method (e.g., bKash)
6. Fill sender number and transaction ID
7. Submit
8. Status: Pending ⏳
9. Admin approves
10. Student sees "Start Learning" button
11. Click to access course
12. After 3 months: Automatically expired

### Scenario 2: Student Buys Quarterly Subscription
1. Login as student
2. Go to /pricing
3. Click "Quarterly Subscription" card (⭐ most popular)
4. Checkout form shows plan + delivery address
5. Select payment method
6. Fill payment details + delivery address
7. Submit
8. Admin reviews & approves
9. Student gets access to ALL courses
10. Dashboard widget shows subscription status
11. 7 days before expiry: Renewal reminder
12. Click "Renew Now" to buy another 3 months

### Scenario 3: Admin Rejects Order
1. New order submitted
2. Admin reviews, detects issue
3. Clicks "Reject" button
4. Enters reason: "Incorrect transaction ID"
5. Student sees rejection + reason
6. Student retries with correct details

### Scenario 4: Subscription Auto-Expires
1. Subscription end date: Jan 31, 2026
2. On Feb 1, system auto-marks as inactive
3. Student can't access courses
4. Dashboard shows "Subscription Expired"
5. Click "Renew Subscription" button
6. Goes back to pricing page
7. Process repeats

---

## 🚨 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "Must login to order" | Not authenticated | Go to /login, create account |
| Checkout form errors | Missing required fields | Fill all fields, especially delivery address for Quarterly/Kit |
| Order stuck "pending" | Admin hasn't reviewed | Check email or contact support |
| Can't access course | Subscription not approved | Wait for admin approval |
| Access blocked after 3 months | Subscription expired | Go to /pricing, click "Renew Subscription" |
| Can't see payment methods | Database connection issue | Check if PaymentMethod collection has data |
| Delivery address not saving | Form validation error | Verify all address fields are filled |

---

## 📞 Support

- **Student Orders**: `/student/orders` → See all orders & status
- **Admin Panel**: `/admin/orders` → Manage all orders
- **Pricing**: `/pricing` → View all available plans
- **Contact**: `/contact` → Reach out for help

---

## ✨ Future Enhancements

- [ ] Email notifications (order confirmation, approval, rejection, reminder)
- [ ] Guardian auto-creation for new students
- [ ] Guardian credentials email
- [ ] Payment gateway integration (bKash, Nagad, Rocket)
- [ ] Discount codes / Coupon system
- [ ] Refund system
- [ ] Invoice generation & download
- [ ] SMS notifications
- [ ] Subscription history analytics
- [ ] Auto-renewal with saved payment method

