# Quick Start Guide - Using the New LMS System

## 🎯 Admin Quick Start

### 1. Create a Course Combo

```bash
curl -X POST http://localhost:5000/api/combo/create \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Web Development Mastery",
    "description": "Learn React, Node.js, and MongoDB",
    "courses": ["65d1a2b3c4d5e6f7g8h9i0j1", "65d1a2b3c4d5e6f7g8h9i0j2", "65d1a2b3c4d5e6f7g8h9i0j3"],
    "price": 4999,
    "discountPrice": 3999,
    "duration": "3-months",
    "thumbnail": "https://..."
  }'
```

### 2. Set Single Course Access Duration

After a student purchases a course and order is approved:

```bash
curl -X POST http://localhost:5000/api/orders/admin/set-access-duration \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "enrollmentId": "65d1a2b3c4d5e6f7g8h9i0j1",
    "duration": "2-months"
  }'
```

### 3. Extend User's Access

```bash
curl -X POST http://localhost:5000/api/orders/admin/extend-access \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "enrollmentId": "65d1a2b3c4d5e6f7g8h9i0j1",
    "newDuration": "lifetime"
  }'
```

### 4. View User's Course Access Status

```bash
curl http://localhost:5000/api/orders/admin/user-course-access/65d1a2b3c4d5e6f7g8h9i0j1 \
  -H "Authorization: Bearer {admin_token}"
```

Response:
```json
{
  "success": true,
  "data": {
    "activeAccess": [
      {
        "_id": "enrollment_id",
        "courseId": {
          "_id": "course_id",
          "title": "React Advanced Patterns",
          "price": 2999
        },
        "accessDuration": "3-months",
        "accessStartDate": "2024-01-10T00:00:00Z",
        "accessEndDate": "2024-04-10T23:59:59Z"
      }
    ],
    "expiredAccess": [
      {
        "_id": "enrollment_id",
        "courseId": {
          "title": "JavaScript Basics"
        },
        "accessEndDate": "2023-12-10T00:00:00Z"
      }
    ],
    "total": 5
  }
}
```

---

## 👨‍🎓 Student Flow

### 1. Browse and Purchase Single Course

**Frontend Action:**
1. Student sees course details
2. Clicks "Buy Now" button
3. Selects payment method
4. Completes payment

**Backend Process:**
1. Order created with `planType: "single"`, `courseId: ...`
2. Order status: `pending`
3. Admin/Instructor reviews and approves
4. `approveOrderService()` called:
   - Creates Enrollment with:
     - `accessDuration: "lifetime"` (default)
     - `accessEndDate: null` (lifetime)
     - `purchaseType: "single"`
   - Sets Order `paymentStatus: "approved"`
5. Student gets instant access (unless admin reduces)

### 2. Browse and Purchase Combo

**Frontend Action:**
1. Student sees combo bundle
2. Clicks "Buy Combo"
3. Sees all included courses
4. Completes payment

**Backend Process:**
1. Order created with `planType: "combo"`, `comboId: ...`
2. Admin approves order
3. `approveOrderService()` called:
   - Fetches combo details (duration, courses)
   - Creates Enrollment for EACH course:
     - `accessDuration: "3-months"` (from combo)
     - `accessEndDate: "2024-04-10"` (calculated)
     - `purchaseType: "combo"`
     - `comboId: ...`
   - Sets Order `paymentStatus: "approved"`, `endDate: "2024-04-10"`
4. Student gets access to all 3 courses

### 3. Access a Course

When student tries to access a course:

**Access Control Validation:**
```javascript
// Middleware checks in order:

1. Is user admin? → Allow
2. Is user instructor of course? → Allow
3. Is user enrolled with valid access?
   - Check Enrollment.accessEndDate
   - If null (lifetime) or > now → Allow
   - Else → Deny
4. Does user have valid single purchase?
   - Check Order where planType="single"
   - Check endDate (null=lifetime or > now)
   - If valid → Allow
5. Does user have combo that includes this?
   - Check Order where planType="combo"
   - Check if course in combo.courses
   - Check Order.endDate (null or > now)
   - If valid → Allow
6. Does user have legacy quarterly subscription?
   - Check Order where planType="quarterly"
   - Check endDate > now
   - If valid → Allow
7. All checks fail → 403 Forbidden
```

---

## 🛠️ JavaScript/TypeScript Usage Examples

### Using Combo Service

```typescript
import { enrollUserInComboService } from '@/modules/course/service/combo.service';

// Enroll user in combo after payment approval
const result = await enrollUserInComboService(
  userId,
  comboId
);

if (result.success) {
  console.log('User enrolled in combo:', result.data);
  // {
  //   comboId: "...",
  //   courses: ["course1", "course2", "course3"],
  //   enrollments: [enrollment1, enrollment2, enrollment3],
  //   accessDuration: "3-months",
  //   accessEndDate: Date
  // }
} else {
  console.error('Failed to enroll:', result.message);
}
```

### Using Access Control Utilities

```typescript
import { 
  hasValidAccess, 
  getRemainingDays, 
  formatRemainingAccess,
  getAccessStatus
} from '@/utils/access-control';

// Check if user still has access
const enrollment = await Enrollment.findById(enrollmentId);
const hasAccess = hasValidAccess(enrollment.accessEndDate);

// Get remaining days
const days = getRemainingDays(enrollment.accessEndDate);
// Returns: 87 (days) or null (lifetime)

// Format for display
const message = formatRemainingAccess(enrollment.accessEndDate);
// Returns: "87 days left" or "3 months left" or "Lifetime access"

// Get comprehensive status
const status = getAccessStatus(enrollment.accessEndDate);
// Returns: {
//   hasAccess: true,
//   remainingDays: 87,
//   isExpiringSoon: false,
//   isExpired: false,
//   isLifetime: false,
//   formattedAccess: "87 days left"
// }
```

### Manual Order Approval with Combo

```typescript
import { approveOrderService } from '@/modules/order/service/order.service';

// When admin approves a combo order
const order = await Order.findById(orderId)
  .populate('comboId');

const result = await approveOrderService(orderId);

// System automatically:
// 1. Fetches combo and all courses
// 2. Calculates access end date from combo.duration
// 3. Creates enrollments for each course
// 4. Sets same accessEndDate for all courses
// 5. Marks order as approved and active
```

### Getting User's Access Info in Frontend

```typescript
// Fetch from Redux/API
const { data: accessInfo } = useGetUserCourseAccessQuery(userId);

// In component
{accessInfo?.data.activeAccess.map(enrollment => (
  <div key={enrollment._id}>
    <h3>{enrollment.courseId.title}</h3>
    <p>Access: {formatRemainingAccess(enrollment.accessEndDate)}</p>
    {isExpiringSoon(enrollment.accessEndDate) && (
      <Alert color="warning">
        Your access expires soon!
      </Alert>
    )}
  </div>
))}

{accessInfo?.data.expiredAccess.length > 0 && (
  <div>
    <h3>Expired Courses</h3>
    <p>Renew or extend access to continue learning</p>
  </div>
)}
```

---

## 🧪 Testing the Implementation

### Test 1: Create Combo
```javascript
// Step 1: Create 3 courses (if not exists)
const course1 = await Course.create({ title: "React", price: 2999 });
const course2 = await Course.create({ title: "Node.js", price: 2999 });
const course3 = await Course.create({ title: "MongoDB", price: 2999 });

// Step 2: Create combo
const combo = await Combo.create({
  name: "Web Dev Bundle",
  courses: [course1._id, course2._id, course3._id],
  price: 4999,
  duration: "3-months",
  createdBy: adminId,
  isActive: true
});

console.log('✅ Combo created:', combo._id);
```

### Test 2: Single Course Purchase with Access Duration
```javascript
// Step 1: Create order
const order = await Order.create({
  userId: studentId,
  courseId: courseId,
  planType: "single",
  paymentStatus: "pending",
  isActive: true,
  paymentMethodId: paymentMethodId,
  transactionId: "TXN123",
  senderNumber: "01700000000",
  price: 3500
});

// Step 2: Admin approves
const result = await approveOrderService(order._id);
// Auto creates enrollment with lifetime access

// Step 3: Admin sets 3-month duration
const enrollment = await Enrollment.findOne({
  studentId,
  courseId
});

await setCourseAccessDurationService(enrollment._id, "3-months");

// Verify
const updated = await Enrollment.findById(enrollment._id);
console.log('Access ends:', updated.accessEndDate);
// 2024-04-10 (3 months from now)
```

### Test 3: Combo Purchase and Enrollment
```javascript
// Step 1: Create combo order
const order = await Order.create({
  userId: studentId,
  comboId: comboId,
  planType: "combo",
  paymentStatus: "pending",
  isActive: true,
  paymentMethodId: paymentMethodId,
  transactionId: "TXN456",
  senderNumber: "01700000000",
  price: 4999
});

// Step 2: Admin approves
const result = await approveOrderService(order._id);
// Auto creates 3 enrollments with same duration

// Step 3: Verify all courses have same access
const enrollments = await Enrollment.find({
  studentId,
  comboId
});

enrollments.forEach(e => {
  console.log(`Course: ${e.courseId}, Expires: ${e.accessEndDate}`);
  // All should have same expiry date
});
```

### Test 4: Access Expiration
```javascript
// Simulate time passing
const enrollment = await Enrollment.findById(enrollmentId);
enrollment.accessEndDate = new Date(Date.now() - 1000); // 1 second ago
await enrollment.save();

// Try to access course
const hasAccess = hasValidAccess(enrollment.accessEndDate);
console.log(hasAccess); // false

// Try via middleware
const res = await checkCourseAccess(req, res, next);
// Should return 403 Forbidden
```

---

## 📊 Data Migration (If Needed)

### Add Access Dates to Existing Enrollments

```javascript
// Make all existing enrollments lifetime by default
await Enrollment.updateMany(
  { accessEndDate: { $exists: false } },
  {
    $set: {
      accessDuration: "lifetime",
      accessStartDate: new Date(),
      accessEndDate: null,
      purchaseType: "single"
    }
  }
);

console.log('✅ All existing enrollments updated with lifetime access');
```

### Update Existing Single Course Orders

```javascript
// Make all single course orders have no expiry (lifetime)
const now = new Date();
await Order.updateMany(
  {
    planType: "single",
    paymentStatus: "approved",
    isActive: true,
    endDate: { $exists: false }
  },
  {
    $set: {
      endDate: null  // null = lifetime
    }
  }
);

console.log('✅ Single course orders updated');
```

---

## 🔍 Debugging Tips

### Check User's Enrollment Status
```javascript
const enrollments = await Enrollment.find({ studentId })
  .populate('courseId', 'title');

enrollments.forEach(e => {
  const hasAccess = hasValidAccess(e.accessEndDate);
  const remaining = getRemainingDays(e.accessEndDate);
  
  console.log(`${e.courseId.title}:
    - Access: ${hasAccess ? 'Valid' : 'Expired'}
    - Remaining: ${remaining} days
    - Expires: ${e.accessEndDate}
    - Type: ${e.purchaseType}
  `);
});
```

### Check User's Orders
```javascript
const orders = await Order.find({ userId })
  .populate('courseId', 'title')
  .populate('comboId', 'name');

orders.forEach(o => {
  console.log(`Order ${o._id}:
    - Type: ${o.planType}
    - Status: ${o.paymentStatus}
    - Active: ${o.isActive}
    - Course: ${o.courseId?.title}
    - Combo: ${o.comboId?.name}
    - Expires: ${o.endDate}
  `);
});
```

### Trigger Manual Expiration Check
```javascript
import { expireOldSubscriptions } from '@/middleware/course-access';

const result = await expireOldSubscriptions();
console.log(`
  Orders expired: ${result.ordersExpired}
  Enrollments expired: ${result.enrollmentsExpired}
`);
```

---

## ✨ Key Takeaways

1. **Single courses** = Flexible duration (set by admin)
2. **Combos** = 1-3 courses with unified duration
3. **Default** = Lifetime (if not set)
4. **Admin control** = Can extend/reduce anytime
5. **Backward compatible** = Old quarterly subscriptions still work
6. **Access tracking** = Enrollment model + Order model

---

For full documentation, see `LMS_REQUIREMENTS_UPDATED.md`
