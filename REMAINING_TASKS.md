# 📝 Remaining Tasks & Guardian System

## 🔴 Critical Remaining Tasks

### 1. **Email Notifications System** ⏳
**Status**: Placeholder code ready, implementation pending

#### Email Types Needed:
1. **Order Confirmation**
   - When: Student submits order
   - To: Student email
   - Content: Order ID, plan, price, approval notice

2. **Payment Approved**
   - When: Admin approves order
   - To: Student email
   - Content: Access granted, start/end dates, course links, "Start Learning" button

3. **Payment Rejected**
   - When: Admin rejects order
   - To: Student email
   - Content: Rejection reason, retry instructions, payment details

4. **Subscription Expiry Reminder**
   - When: 7 days before expiration
   - To: Student email
   - Content: Days remaining, renewal link, subscription benefits

5. **Guardian Credentials** (Part of guardian system)
   - When: Student registers
   - To: Student email
   - Content: Guardian username, temporary password, login link

#### Implementation Location:
- **File to update**: `grow-backend/src/modules/order/controller/order.controller.ts`
- **Search for**: `// TODO: Send approval email notification`
- **Use existing**: Nodemailer setup (already fixed: `import * as nodemailer`)

#### Code Template:
```typescript
// In approveOrder function
import * as nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail", // or your email provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const mailOptions = {
  from: process.env.EMAIL_USER,
  to: order.userId.email,
  subject: "Payment Approved - Course Access Granted",
  html: `
    <h2>Your Payment Has Been Approved!</h2>
    <p>Dear ${order.userId.name},</p>
    <p>Your order for ${PLAN_NAMES[order.planType]} has been approved.</p>
    <p><strong>Access Period:</strong> ${order.startDate} to ${order.endDate}</p>
    <a href="${process.env.FRONTEND_URL}/courses">Start Learning</a>
  `,
};

await transporter.sendMail(mailOptions);
```

---

### 2. **Guardian Auto-Creation System** ⏳
**Status**: Design complete, code needs implementation

#### Guardian Account Structure:
```javascript
Guardian Schema (New Collection):
{
  _id: ObjectId,
  studentId: ObjectId → User,
  username: String, // Format: "firstname_lastname_guardian"
  email: String, // Same as student
  password: String, // Hashed random strong password
  phone: String,
  role: "guardian",
  permissions: [
    "view_child_progress",
    "receive_reports",
    "view_subscriptions",
    "manage_communications"
  ],
  createdAt: Date,
  updatedAt: Date
}
```

#### When to Trigger:
1. **New Student Registration**
   - Check if student account is creating
   - Auto-generate guardian if first time
   - Send guardian credentials email

#### Implementation Steps:

**Step 1: Create Guardian Model**
```typescript
// File: grow-backend/src/modules/guardian/model/guardian.model.ts

import mongoose, { Schema, Document } from "mongoose";

export interface IGuardian extends Document {
  studentId: mongoose.Types.ObjectId;
  username: string;
  email: string;
  password: string;
  phone?: string;
  role: "guardian";
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const guardianSchema = new Schema<IGuardian>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: String,
    role: {
      type: String,
      enum: ["guardian"],
      default: "guardian",
    },
    permissions: [String],
  },
  { timestamps: true }
);

export const Guardian = mongoose.model<IGuardian>("Guardian", guardianSchema);
```

**Step 2: Update User Registration**
```typescript
// File: grow-backend/src/modules/user/service/user.service.ts

import { Guardian } from "@/modules/guardian/model/guardian.model";
import * as crypto from "crypto";
import * as bcrypt from "bcrypt";

export const createStudentWithGuardian = async (userData: any) => {
  // Create student
  const user = await User.create({
    name: userData.name,
    email: userData.email,
    password: bcrypt.hashSync(userData.password, 10),
    role: "student",
    phone: userData.phone,
  });

  // Generate guardian credentials
  const guardianUsername = `${userData.name.split(" ")[0]}_${userData.name.split(" ")[1]}_guardian`.toLowerCase();
  const temporaryPassword = crypto.randomBytes(12).toString("hex").substring(0, 12);
  const hashedPassword = bcrypt.hashSync(temporaryPassword, 10);

  // Create guardian account
  const guardian = await Guardian.create({
    studentId: user._id,
    username: guardianUsername,
    email: user.email,
    password: hashedPassword,
    phone: userData.phone,
    role: "guardian",
    permissions: ["view_child_progress", "receive_reports"],
  });

  // Send guardian credentials email
  await sendGuardianCredentialsEmail({
    studentName: user.name,
    studentEmail: user.email,
    guardianUsername: guardianUsername,
    guardianPassword: temporaryPassword,
  });

  return { user, guardian };
};

async function sendGuardianCredentialsEmail(data: any) {
  const transporter = nodemailer.createTransport({
    // ... config
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: data.studentEmail,
    subject: "Guardian Account Created - Login Credentials",
    html: `
      <h2>Guardian Account Created!</h2>
      <p>Dear ${data.studentName},</p>
      <p>A guardian account has been created for your parent/guardian.</p>
      <p><strong>Guardian Login Credentials:</strong></p>
      <ul>
        <li>Username: ${data.guardianUsername}</li>
        <li>Password: ${data.guardianPassword}</li>
      </ul>
      <p>Please share these credentials with your guardian.</p>
      <p><strong>Note:</strong> Guardian should change password after first login.</p>
      <a href="${process.env.FRONTEND_URL}/login">Login here</a>
    `,
  });
}
```

**Step 3: Update Registration Route**
```typescript
// In user.controller.ts register method
// Replace:
// const user = await User.create(userData);
// With:
// const { user, guardian } = await createStudentWithGuardian(userData);
```

---

### 3. **Remove Instructor Registration & Login** ⏳
**Status**: Identified, ready for implementation

#### Files to Update:

**1. Registration Page** (`learn-grow/app/register/page.tsx`)
```typescript
// Find: Role selection (Student/Instructor)
// Remove: Instructor option
// Keep: Student only

// Before:
<SelectItem key="student">Student</SelectItem>
<SelectItem key="instructor">Instructor</SelectItem>

// After:
<SelectItem key="student">Student</SelectItem>
// (Remove instructor)
```

**2. Select Role Page** (`learn-grow/app/select-role/page.tsx`)
```typescript
// If this page exists, either:
// - Remove it completely
// - Keep but show only student option
// OR
// - Remove entire page and redirect /select-role to /student/dashboard
```

**3. Navbar/Header**
```typescript
// Remove: "Instructor Login" button
// Keep: "Login", "Register", "Profile" for students
```

**4. Auth Routes** (`grow-backend/src/modules/user/routes/user.routes.ts`)
```typescript
// Keep: POST /register for students only
// Remove: POST /register-instructor if exists
// Keep: POST /login (works for all roles)
```

**5. Registration Validation**
```typescript
// In registration controller
// Add validation:
if (role !== "student") {
  return res.status(400).json({
    message: "Only student registration is available. Contact admin for instructor access.",
  });
}
```

#### Files to Check:
- [ ] `learn-grow/app/register/page.tsx`
- [ ] `learn-grow/app/select-role/page.tsx`
- [ ] `learn-grow/app/instructor/page.tsx` (Delete if exists)
- [ ] `learn-grow/app/instructor/register/page.tsx` (Delete if exists)
- [ ] `learn-grow/components/navbar.tsx`
- [ ] `grow-backend/src/modules/user/controller/user.controller.ts`

---

## 🟡 Optional Enhancements

### 1. **Payment Gateway Integration**
- [ ] bKash API integration
- [ ] Nagad API integration
- [ ] Rocket API integration
- [ ] Auto-verify payments instead of manual

### 2. **Discount & Coupon System**
- [ ] Create Coupon model
- [ ] Apply discount in checkout
- [ ] Track coupon usage

### 3. **Refund System**
- [ ] Refund management page
- [ ] Partial refunds
- [ ] Refund status tracking

### 4. **Invoice System**
- [ ] Generate PDF invoices
- [ ] Email invoices to students
- [ ] Download invoice from order page

### 5. **Subscription Analytics**
- [ ] Revenue by plan
- [ ] Renewal rate
- [ ] Churn rate
- [ ] Monthly recurring revenue (MRR)

---

## 📋 Implementation Checklist

### High Priority (Do First)
- [ ] Test complete order flow end-to-end
- [ ] Verify admin approval workflow
- [ ] Check subscription expiry logic
- [ ] Add payment methods to database
- [ ] Test course access control

### Medium Priority (Do Next)
- [ ] Implement email notifications
- [ ] Add guardian auto-creation
- [ ] Remove instructor registration
- [ ] Update navbar to remove instructor options

### Low Priority (Nice to Have)
- [ ] Payment gateway integration
- [ ] Discount code system
- [ ] Refund management
- [ ] Analytics dashboard

---

## 🚀 Deployment Checklist

### Before Going Live
- [ ] All tests passing
- [ ] Email notifications working
- [ ] Payment methods configured
- [ ] Admin accounts created
- [ ] Terms of service updated
- [ ] Privacy policy updated
- [ ] Refund policy created
- [ ] Student help documentation
- [ ] Admin documentation
- [ ] Backup strategy in place

### Database Migrations
- [ ] Order collection created with indexes
- [ ] Guardian collection created (when ready)
- [ ] Payment methods seeded
- [ ] User roles verified

### Environment Setup
- [ ] `.env` file configured
- [ ] Email credentials set
- [ ] MongoDB connection tested
- [ ] API URLs correct
- [ ] Frontend URLs correct

---

## 📧 Email Templates

Ready to use for notification system:

### Order Confirmation Template
```html
<h2>Order Received</h2>
<p>Your order has been received and is under review.</p>
<p><strong>Order ID:</strong> {ORDER_ID}</p>
<p><strong>Plan:</strong> {PLAN_NAME}</p>
<p><strong>Price:</strong> {PRICE}</p>
<p>We'll notify you once your payment is verified.</p>
```

### Approval Notification Template
```html
<h2>Payment Approved!</h2>
<p>Congratulations! Your subscription is now active.</p>
<p><strong>Access Period:</strong> {START_DATE} to {END_DATE}</p>
<p><strong>Days Remaining:</strong> {DAYS}</p>
<a href="{COURSE_LINK}">Start Learning Now</a>
```

### Expiry Reminder Template
```html
<h2>Subscription Expiring Soon</h2>
<p>Your subscription expires in 7 days.</p>
<p><strong>Expiry Date:</strong> {END_DATE}</p>
<p>Don't lose access! Renew your subscription.</p>
<a href="{RENEWAL_LINK}">Renew Now</a>
```

---

## 🎯 Timeline Estimate

| Task | Effort | Days |
|------|--------|------|
| Email notifications | 3-4 hrs | 1 day |
| Guardian system | 4-6 hrs | 2 days |
| Remove instructor | 2-3 hrs | 1 day |
| Testing & fixes | 4-6 hrs | 2 days |
| Deployment prep | 2-3 hrs | 1 day |
| **Total** | **15-22 hrs** | **~7 days** |

---

## 💬 Questions to Answer

Before implementing remaining tasks, clarify:

1. **Email Service**: Gmail, SendGrid, or other?
2. **Guardian Access**: Full dashboard or limited view?
3. **Instructor Status**: Hide completely or allow admin approval?
4. **Refund Policy**: What's the timeline/terms?
5. **Payment Gateways**: Which to integrate first?
6. **Analytics**: What metrics are most important?

---

## ✅ Summary

**What's Complete:**
- ✅ Pricing system (4 plans)
- ✅ Checkout flow
- ✅ Order management (admin)
- ✅ Subscription logic & expiry
- ✅ Course access control
- ✅ Student order tracking
- ✅ Admin dashboard

**What's Ready (Code Placeholders):**
- 🟡 Email notifications (framework in place)
- 🟡 Guardian system (design documented)
- 🟡 Instructor removal (identified files)

**What's Optional:**
- 🔵 Payment gateways
- 🔵 Discount codes
- 🔵 Refunds
- 🔵 Analytics

---

**Next Action**: Pick one task from "High Priority" and start implementation!

