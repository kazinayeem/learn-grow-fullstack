# Guardian-Student Relationship Implementation

## Overview
This document summarizes the implementation of a bidirectional guardian-student relationship system in the Learn & Grow platform, with proper role restrictions and real-time backend integration.

## Key Features Implemented

### 1. **Login Role Restriction** ✅
- **Only students, guardians, and admins can login**
- Instructors receive error message: "Only students/guardians can login. Please contact admin if you need instructor access."
- Login flow updated to use real backend `/users/login` endpoint
- Error messages displayed in UI when role is not authorized

**Files Modified:**
- [learn-grow/components/Auth/Login.tsx](learn-grow/components/Auth/Login.tsx)

**Changes:**
- Migrated from mock auth to real API (`lib/auth.login()`)
- Added role-based error message handling
- Improved quick-login buttons with proper error feedback

---

### 2. **Guardian-Student Linkage** ✅

#### Backend Data Model
Added bidirectional relationship tracking:

**User Model Changes:**
- Added `guardians?: Types.ObjectId[]` field to track guardians of a student
- Existing `children?: Types.ObjectId[]` field tracks students of a guardian

**Files Modified:**
- [grow-backend/src/modules/user/model/user.model.ts](grow-backend/src/modules/user/model/user.model.ts)

#### Guardian Creation Flows

**Registration Flow:**
When a student registers:
1. Student account created with `role: "student"`
2. Guardian account auto-created with unique email: `email+guardian_SUFFIX@domain.com`
3. Random password generated and emailed to student's parent email
4. **Bidirectional linking:**
   - `guardian.children` array includes student ID
   - `student.guardians` array includes guardian ID
5. StudentProfile guardianId field updated (optional)

**Google OAuth Signup Flow:**
When a student signs up via Google:
1. Student account created from Google profile (role: "student")
2. Guardian account auto-created with same logic
3. Guardian credentials email sent
4. Welcome email sent to student
5. Same bidirectional linking applied

**Files Modified:**
- [grow-backend/src/modules/user/service/user.service.ts](grow-backend/src/modules/user/service/user.service.ts) - Register method
- [grow-backend/src/config/passport.ts](grow-backend/src/config/passport.ts) - Google OAuth strategy

**Changes:**
- Updated guardian creation to use `student.guardians` array instead of `user.children`
- Added StudentProfile upsert for optional legacy support
- Imported StudentProfile model

#### Guardian-Student Connection Endpoint

New endpoint allows guardians to manually connect to existing students:

**POST `/api/users/guardian/connect-child`** (Guardian Only)
```typescript
Request Body:
{
  studentEmail?: string;
  studentPhone?: string;
}

Response (Success):
{
  success: true,
  message: "Student connected successfully",
  data: {
    student: {
      id: "...",
      name: "...",
      email: "...",
      phone: "..."
    }
  }
}

Response (Error):
{
  success: false,
  message: "Student not found" | "Already connected" | "User is not a student"
}
```

**Validation:**
- User must be authenticated as guardian
- Student must exist and have role "student"
- Prevents duplicate connections

**Files Modified:**
- [grow-backend/src/modules/user/service/user.service.ts](grow-backend/src/modules/user/service/user.service.ts) - `guardianConnectChild()` method
- [grow-backend/src/modules/user/controller/user.controller.ts](grow-backend/src/modules/user/controller/user.controller.ts) - Controller handler
- [grow-backend/src/modules/user/routes/user.routes.ts](grow-backend/src/modules/user/routes/user.routes.ts) - Route definition

---

### 3. **Profile Relations Endpoint** ✅

**GET `/api/users/profile`** (Protected)
Returns user profile with related data:

```typescript
Response:
{
  success: true,
  message: "Profile retrieved successfully",
  data: {
    user: { /* full user object */ },
    relations: {
      children: [
        // For guardians: list of connected students
        {
          _id: "...",
          name: "Student Name",
          email: "student@example.com",
          phone: "+1...",
          role: "student",
          isVerified: true,
          createdAt: "..."
        }
      ],
      guardians: [
        // For students: list of connected guardians
        {
          _id: "...",
          name: "Guardian Name",
          email: "guardian@example.com",
          phone: "+1...",
          role: "guardian",
          isVerified: true,
          createdAt: "..."
        }
      ]
    }
  }
}
```

**Behavior:**
- For **guardians**: Returns `relations.children` (list of connected students)
- For **students**: Returns `relations.guardians` (list of connected guardians)
- Supports both direct linkage (`student.guardians` array) and legacy fallback

---

### 4. **Guardian Dashboard** ✅

Updated guardian dashboard to use real backend data:

**Features:**
- Loads children list from `/api/users/profile`
- Displays connected students with real data (name, email, phone)
- "Connect Child" modal allows guardians to search by email or phone
- Calls `/api/users/guardian/connect-child` endpoint with proper error handling
- Real-time loading states and toast notifications
- Falls back to demo data if no children connected

**Files Modified:**
- [learn-grow/app/guardian/page.tsx](learn-grow/app/guardian/page.tsx)

**Changes:**
- Added `useEffect` to load guardian profile on mount
- Integrated `getProfile()` from `lib/auth`
- Map profile relations to children list
- Connect student modal now calls backend endpoint
- Added loading states, error handling, and toast feedback

---

## Data Flow Diagram

### Registration to Guardian Connection
```
Student Registration
  ├─ Create Student User (role: "student")
  ├─ Create Guardian User (role: "guardian")
  │  └─ Generate credentials email
  ├─ Link bidirectionally:
  │  ├─ guardian.children = [student._id]
  │  └─ student.guardians = [guardian._id]
  └─ Send emails
     ├─ Guardian credentials to parent email
     └─ Welcome email to student

Google OAuth Signup
  ├─ Create Student User from Google profile
  ├─ Auto-create Guardian (same as above)
  └─ Send welcome + guardian credentials emails

Manual Guardian Connection
  ├─ Guardian searches by email/phone
  ├─ Backend validates student exists
  ├─ Link bidirectionally
  └─ Return success with student data
```

## Database Schema Changes

### User Model
```typescript
interface IUser {
  // ... existing fields
  children?: Types.ObjectId[];      // Students if role="guardian"
  guardians?: Types.ObjectId[];     // Guardians if role="student" (NEW)
}
```

### Mongoose Schema
```typescript
children: [{ type: Schema.Types.ObjectId, ref: "User" }],
guardians: [{ type: Schema.Types.ObjectId, ref: "User" }],  // NEW
```

---

## Authentication & Authorization

### Login Rules
- ✅ **Students**: Can login
- ✅ **Guardians**: Can login
- ✅ **Admins**: Can login
- ❌ **Instructors**: Cannot login (get error message)

### Route Protection
- `POST /api/users/guardian/connect-child`: Requires `["guardian"]` role
- `POST /api/users/student/accept-guardian`: Requires `["student"]` role
- `GET /api/users/profile`: Requires authentication

---

## Frontend API Integration

### Login Flow
```typescript
import { login } from "@/lib/auth";

const result = await login({ phone, password });
// Returns: { success: boolean, message: string, data?: { user, accessToken, refreshToken } }
```

### Profile & Relations
```typescript
import { getProfile } from "@/lib/auth";

const result = await getProfile();
// Returns: { success: true, data: { user, relations: { children, guardians } } }
```

### Connect Child
```typescript
const response = await fetch("/api/users/guardian/connect-child", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  },
  body: JSON.stringify({
    studentEmail: "...",    // OR
    studentPhone: "..."
  })
});
```

---

## Email Features

### Guardian Credentials Email
Sent to parent email when student registers:
- Guardian account email address
- Temporary password (randomly generated)
- Instructions to log in and change password

### Welcome Email
Sent to student on:
- Manual registration
- Google OAuth signup

---

## Testing Scenarios

### Scenario 1: Student Registration
1. Student registers with email/phone
2. Backend auto-creates guardian account
3. Parent receives guardian credentials email
4. Student redirected to `/student` dashboard
5. Guardian can login with credentials sent

### Scenario 2: Guardian Dashboard
1. Guardian logs in → redirected to `/guardian`
2. Dashboard loads profile data via `/api/users/profile`
3. Shows list of connected children
4. Guardian clicks "Connect Child"
5. Enters student email/phone
6. Backend validates and links
7. Child appears in children list

### Scenario 3: Role Restriction
1. Admin tries to login as instructor credentials
2. Backend rejects with: "Only students/guardians can login..."
3. Error displayed in red box on login form
4. No redirect occurs

---

## Future Enhancements

- [ ] Guardian payment management (view invoices, make payments)
- [ ] Student progress reports (downloadable PDF)
- [ ] Push notifications for important events
- [ ] Guardian approval workflow for new connections
- [ ] Multiple guardians per student
- [ ] Guardian settings and preferences
- [ ] Parent-teacher communication portal

---

## Summary

✅ **Completed:**
- Bidirectional guardian-student relationship in database
- Auto-creation of guardian accounts on student signup
- Guardian auto-creation in Google OAuth flow
- Guardian-student manual connection endpoint
- Profile API with relations data
- Login role restrictions (instructor lockout)
- Guardian dashboard integration with real data
- Proper error handling and UX feedback

📦 **All changes compile without errors**
🎯 **Ready for testing and deployment**
