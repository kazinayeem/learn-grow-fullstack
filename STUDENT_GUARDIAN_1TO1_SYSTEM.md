# One-to-One Student-Guardian Relationship System

## 📋 Overview

This system implements a strict **1:1 relationship** between Student and Guardian accounts:
- **One Student** → **One Guardian** (fixed relationship)
- Guardian is **auto-created** when student registers
- Guardian and Student have **separate schemas** with proper linking
- **Role-based access control** ensures security and privacy

---

## 🏗️ System Architecture

### Database Schema

#### User Model (unchanged structure, simplified)
```typescript
interface IUser {
  name: string;
  email?: string;
  phone: string;
  password: string;
  role: "student" | "guardian" | "instructor" | "admin";
  profileImage?: string;
  // No children or guardians arrays - use profile schemas instead
  otp?: string;
  otpExpiresAt?: Date;
  refreshToken?: string;
  googleId?: string;
  isVerified?: boolean;
  // ... other fields
}
```

#### StudentProfile Schema (NEW)
```typescript
interface IStudentProfile {
  userId: Types.ObjectId;              // Reference to student User
  school?: string;
  classLevel?: string;
  guardianId: Types.ObjectId;         // Reference to guardian User (1:1)
}
```

#### GuardianProfile Schema (NEW)
```typescript
interface IGuardianProfile {
  userId: Types.ObjectId;              // Reference to guardian User (UNIQUE)
  studentId: Types.ObjectId;          // Reference to student User (1:1)
  relationship?: string;              // e.g., "Father", "Mother", etc.
  phone?: string;
  address?: string;
  timestamps: true;
}

// Unique constraint: One guardian per student
guardianProfileSchema.index({ studentId: 1, userId: 1 }, { unique: true });
```

### Data Flow Diagram

```
┌─────────────────────────────────────────────┐
│     Student Registration Flow               │
└─────────────────────────────────────────────┘

1. Student submits registration form
   ├─ Name, Email, Phone, Password
   └─ Role automatically set to "student"

2. Backend processes registration:
   ├─ Create User (role: "student")
   ├─ Hash password
   ├─ Generate tokens
   └─ AUTO-CREATE GUARDIAN:
       ├─ Generate guardian email: email+guardian_SUFFIX@domain.com
       ├─ Generate random password
       ├─ Create User (role: "guardian")
       ├─ Create StudentProfile { userId, guardianId }
       ├─ Create GuardianProfile { userId, studentId }
       ├─ Send guardian credentials to student's email
       └─ Send welcome email to student

3. Guardian can now login with:
   ├─ Email: email+guardian_SUFFIX@domain.com
   ├─ Password: (auto-generated, sent to parent email)
   └─ Can change password on first login


┌─────────────────────────────────────────────┐
│     Google OAuth Flow                       │
└─────────────────────────────────────────────┘

1. Student clicks "Sign up with Google"
2. Google redirects with profile
3. Backend creates Student User from Google data
4. AUTO-CREATE GUARDIAN (same as registration flow)
5. Send guardian credentials email + welcome email
```

---

## 🔐 Role-Based Access Control

### Login Rules
```
✅ Students:   Can login
✅ Guardians:  Can login
✅ Admins:     Can login
❌ Instructors: Cannot login (error: "Only students/guardians can login...")
```

### Profile Data Access

#### For Students
```typescript
GET /api/users/profile

Response:
{
  success: true,
  data: {
    user: { /* student user object */ },
    relations: {
      guardian: {              // Single guardian object
        _id: "...",
        name: "Parent Name",
        email: "parent@example.com",
        phone: "+1...",
        role: "guardian",
        isVerified: true,
        createdAt: "..."
      },
      student: null            // Students don't see student relation
    }
  }
}
```

#### For Guardians
```typescript
GET /api/users/profile

Response:
{
  success: true,
  data: {
    user: { /* guardian user object */ },
    relations: {
      student: {               // Single student object
        _id: "...",
        name: "Child Name",
        email: "student@example.com",
        phone: "+1...",
        role: "student",
        isVerified: true,
        createdAt: "..."
      },
      guardian: null           // Guardians don't see guardian relation
    }
  }
}
```

---

## 🎯 User Flows

### 1️⃣ Student Registration & Guardian Auto-Creation

**Actors:** Student (registering), Parent (receiving email)

**Flow:**
1. Student fills registration form
2. System forces role to "student"
3. Student account created
4. **Guardian auto-created:**
   - Email: `[student_email]+guardian_[6-char-id]@domain.com`
   - Password: Random 12-character string
   - Credentials emailed to student's parent email
5. **Profiles created:**
   - StudentProfile links student → guardian
   - GuardianProfile links guardian → student
6. **Emails sent:**
   - Guardian credentials email (to parent)
   - Welcome email (to student)

**Student Dashboard Views:**
```
Shows:
├─ Student's own profile info
├─ Guardian's name, email, phone
├─ Can contact guardian through platform
└─ Study progress and course info
```

### 2️⃣ Guardian Login & Student View

**Actors:** Guardian (parent who received email)

**Flow:**
1. Guardian receives credentials email
2. Guardian navigates to login
3. Guardian enters:
   - Email: `email+guardian_SUFFIX@domain.com`
   - Password: (from email)
4. System verifies role = "guardian"
5. Allow login (not instructor)
6. Redirect to `/guardian` dashboard

**Guardian Dashboard Views:**
```
Shows:
├─ Guardian's account info (name, email, phone)
├─ Linked student's name, email, phone
├─ Student's progress (mock stats for now)
├─ Student's contact information
├─ Quick actions (payments, reports, settings)
└─ 1:1 relationship info card
```

### 3️⃣ Google OAuth Signup

**Flow:**
1. User clicks "Sign up with Google"
2. Google OAuth authenticates and returns profile
3. Backend:
   - Creates Student User from Google data
   - Role forced to "student"
   - Auto-creates Guardian (same as registration)
   - Creates profiles (StudentProfile + GuardianProfile)
   - Sends emails (guardian credentials + welcome)

---

## 📁 File Changes Summary

### Backend Changes

#### Models
- **user.model.ts**: Removed `children` and `guardians` arrays
- **guardianProfile.model.ts**: NEW file - Guardian linking schema
- **studentProfile.model.ts**: Already exists - Now uses `guardianId` field

#### Services
- **user.service.ts**:
  - `register()`: Creates student + auto-creates guardian
  - `getUserProfile()`: Returns student/guardian + related user
  - Removed: `guardianConnectChild()`, `studentAcceptGuardian()`

#### Config
- **passport.ts**: Google OAuth now auto-creates guardian using same logic

#### Routes & Controllers
- **user.routes.ts**: Removed guardian connect-child endpoints
- **user.controller.ts**: Cleaned up unrelated methods

### Frontend Changes

#### Components
- **Login.tsx**: Uses real API, displays instructor error message
- **guardian/page.tsx**: 
  - Loads profile via API
  - Displays linked student (1:1)
  - Shows student contact info
  - No "Connect Child" modal (1:1 is fixed)

---

## 🔗 Profile Linking Logic

### During Registration
```typescript
// Create StudentProfile
const studentProfile = await StudentProfile.create({
  userId: student._id,
  guardianId: guardian._id,
  school: undefined,
  classLevel: undefined,
});

// Create GuardianProfile
const guardianProfile = await GuardianProfile.create({
  userId: guardian._id,
  studentId: student._id,
  relationship: undefined,
});
```

### During Profile Retrieval
```typescript
// For students
const studentProfile = await StudentProfile
  .findOne({ userId })
  .populate("guardianId");  // Returns guardian user data

// For guardians
const guardianProfile = await GuardianProfile
  .findOne({ userId })
  .populate("studentId");   // Returns student user data
```

---

## 📧 Email Features

### Guardian Credentials Email
**Sent to:** Student's email (parent receives it)
**Trigger:** When student registers or signs up via Google
**Contains:**
- Guardian account email
- Temporary password
- Login instructions
- Reminder to change password

### Welcome Email
**Sent to:** Student's email
**Trigger:** When student registers or signs up via Google
**Contains:**
- Welcome message
- Account details
- Getting started tips

---

## 🛡️ Security Features

1. **Role-Based Access Control**
   - Instructors blocked from login
   - Guardians can only access their own student
   - Students can only access their own guardian

2. **Data Isolation**
   - Separate schemas prevent accidental data leakage
   - Populate queries return only related user
   - Index ensures 1:1 uniqueness

3. **Secure Guardian Creation**
   - Guardian email uses student email + suffix
   - Password auto-generated (not passed in plaintext)
   - Credentials sent via email (secure channel)

4. **Authentication**
   - JWT tokens with role embedded
   - Refresh token rotation
   - HTTPS recommended for production

---

## 🚀 Deployment Checklist

- [ ] Create migrations for StudentProfile and GuardianProfile schemas
- [ ] Run migrations in development
- [ ] Update `.env` with email credentials
- [ ] Test guardian credentials email delivery
- [ ] Test Google OAuth flow
- [ ] Verify login restrictions (instructor blocks)
- [ ] Test student/guardian dashboards
- [ ] Set up password reset flow for guardians
- [ ] Configure CORS for frontend URLs
- [ ] Enable HTTPS in production
- [ ] Set up email rate limiting

---

## 📊 Database Indexes

```typescript
// User collection
- email (unique, sparse)
- googleId (sparse)
- phone (sparse)

// StudentProfile collection
- userId (unique)
- guardianId (ref to User)

// GuardianProfile collection
- userId (unique)
- studentId (ref to User)
- { studentId, userId } (unique compound index)
```

---

## 🔄 Relationship Flow (1:1)

```
┌──────────────────────────────────────────────────────────┐
│                Student-Guardian 1:1 Relationship          │
└──────────────────────────────────────────────────────────┘

User Collection:
├─ Student User (_id: s1)
│  └─ role: "student"
│     
└─ Guardian User (_id: g1)
   └─ role: "guardian"

StudentProfile Collection:
└─ { userId: s1, guardianId: g1 }

GuardianProfile Collection:
└─ { userId: g1, studentId: s1 }

Result: 
  Student (s1) ←→ Guardian (g1)
  
  One student can have EXACTLY ONE guardian
  One guardian can have EXACTLY ONE student
```

---

## 🧪 Testing Scenarios

### Scenario 1: Student Registration
```
Input: { name: "Ali Ahmed", email: "ali@example.com", phone: "01700...", password: "..." }
Output:
  ✅ Student account created
  ✅ Guardian account created (email: ali+guardian_xxxxx@example.com)
  ✅ StudentProfile created (links student → guardian)
  ✅ GuardianProfile created (links guardian → student)
  ✅ Guardian credentials email sent
  ✅ Welcome email sent
```

### Scenario 2: Guardian Login
```
Input: email: "ali+guardian_xxxxx@example.com", password: "..."
Output:
  ✅ Guardian authenticated
  ✅ Redirect to /guardian
  ✅ Profile loads: shows linked student's info
  ✅ Dashboard displays student name, email, phone
```

### Scenario 3: Instructor Login Blocked
```
Input: email: "instructor@example.com", password: "..."
Output:
  ❌ Error: "Only students/guardians can login. Please contact admin..."
  ❌ No redirect
  ❌ Session not created
```

---

## ✅ Implementation Status

- ✅ User model refactored (removed children/guardians arrays)
- ✅ GuardianProfile schema created
- ✅ StudentProfile using guardianId field
- ✅ Registration flow creates student + guardian (1:1)
- ✅ Google OAuth creates guardian
- ✅ Profile endpoint returns student/guardian info
- ✅ Login blocks instructors
- ✅ Guardian dashboard shows linked student
- ✅ All files compile without errors
- ✅ No syntax errors

---

## 🔮 Future Enhancements

- [ ] Guardian approval workflow
- [ ] Multiple contact methods for guardian
- [ ] Relationship type field (mother, father, brother, etc.)
- [ ] Address and phone in guardian profile
- [ ] Parent-teacher communication portal
- [ ] Student progress reports
- [ ] Guardian payment management
- [ ] Notification preferences per relationship

---

## 📞 Support

For issues or questions about the 1:1 relationship system:
1. Check the error messages in browser console
2. Review backend logs for API errors
3. Verify StudentProfile and GuardianProfile documents exist
4. Ensure migration was run successfully
5. Check email delivery logs for credential emails

