# LMS Course Purchase & Access Control System - Updated Requirements

## Overview

This document describes the new business logic and access control system for the Online Learning Management System (LMS). The system now supports flexible course access durations and introduces a new Course Combo feature.

---

## ✅ 1. Updated Single Course Purchase

### Features
- **No default time limit on purchase** - Courses are purchased once with configurable access duration
- **Admin/Instructor control over access duration** - After purchase approval, admin or instructor can set how long the student has access
- **Duration options:**
  - 1 Month
  - 2 Months
  - 3 Months
  - Lifetime (default if not set)

### Access Control
- Users can access ONLY the purchased course (not all courses)
- Access is validated through the `Enrollment` model with `accessEndDate` field
- Users with expired access cannot view course content

### Admin Management
- Admin can extend access duration anytime
- Admin can reduce access duration (with restrictions)
- Admin can view all users' access status and expiry dates

### Database Schema Changes

#### Enrollment Model
```javascript
{
  studentId: ObjectId,
  courseId: ObjectId,
  
  // New fields for access control
  accessDuration: "1-month" | "2-months" | "3-months" | "lifetime",
  accessStartDate: Date,
  accessEndDate: Date | null,  // null = lifetime
  purchaseType: "single" | "combo",
  comboId: ObjectId, // if purchased as part of combo
  
  // Progress tracking
  progress: Number,
  completionPercentage: Number,
  isCompleted: Boolean,
  completedLessons: [ObjectId],
  completedModules: [ObjectId],
  completedAssignments: [ObjectId],
  completedQuizzes: [ObjectId],
  completedProjects: [ObjectId],
  
  createdAt: Date,
  updatedAt: Date
}
```

#### Order Model Changes
```javascript
{
  userId: ObjectId,
  planType: "single" | "quarterly" | "combo" | "kit" | "school",
  
  // For single course
  courseId: ObjectId,  // required for single
  
  // For combo
  comboId: ObjectId,   // required for combo
  
  // Access dates
  startDate: Date,
  endDate: Date | null,  // null = lifetime/no expiration
  
  // Status
  paymentStatus: "pending" | "approved" | "rejected",
  isActive: Boolean,
  
  // Pricing & payment info
  price: Number,
  paymentMethodId: ObjectId,
  transactionId: String,
  
  createdAt: Date,
  updatedAt: Date
}
```

---

## ❌ 2. Removed "All Courses Subscription"

### Changes
- **Quarterly subscription with all-access is being phased out**
- The system still supports existing quarterly subscriptions for backward compatibility
- New users can ONLY purchase:
  - Individual courses
  - Course combos
  - Kit/School packages

### Access Control
- Legacy quarterly subscriptions will continue to work but won't be offered to new users
- All new access is controlled via Enrollment model with expiry dates
- API will check both Order and Enrollment models for access validation

---

## ✅ 3. New Course Combo System

### What is a Combo?
A Course Combo is a bundle of 2-3 related courses sold as a package with a single price and access duration.

### Combo Features

#### Admin Creates Combos
- **Combo Details:**
  - Combo name (e.g., "Web Development Bundle")
  - Description
  - List of included courses (minimum 1, maximum 3)
  - Price
  - Discount price (optional)
  - Thumbnail image (optional)
  - Default access duration
  - Active/Inactive status

#### Combo Pricing & Duration
- **Fixed price for the combo** (not sum of individual courses)
- **Single duration for all courses:**
  - 1 Month - User gets all 3 courses for 1 month
  - 2 Months - User gets all 3 courses for 2 months
  - 3 Months - User gets all 3 courses for 3 months
  - Lifetime - User keeps access forever

#### User Purchase Flow
1. User sees combo on marketplace
2. User clicks "Buy Combo"
3. Payment is processed
4. Admin approves order
5. System creates enrollments for ALL courses in the combo
6. User gets access to all combo courses with the same expiry date
7. Each course shows the same access duration

### Admin Management

#### Combo Operations
- Create new combo
- Edit combo (name, courses, price, duration, status)
- Change combo duration
- Disable/Enable combo
- Delete combo

#### User Access Management
- View which users have purchased a specific combo
- Extend combo access for specific user
- Reduce combo access for specific user

### Database Schema

#### Combo Model
```javascript
{
  name: String,                           // Combo name (required)
  description: String,                    // Optional description
  courses: [ObjectId],                    // Array of course IDs (1-3 max)
  price: Number,                          // Combo price (required)
  discountPrice: Number,                  // Optional discount price
  duration: "1-month" | "2-months" | "3-months" | "lifetime", // Default duration
  isActive: Boolean,                      // Can disable/enable combos
  createdBy: ObjectId,                    // Admin who created it
  thumbnail: String,                      // Optional combo image
  createdAt: Date,
  updatedAt: Date
}
```

---

## 📊 Access Control Logic

### Who Can Access What?

#### User Access Validation
```
User can access a course if:
  1. User is admin (full access)
  2. User is instructor of the course (full access)
  3. User is enrolled in the course AND:
     - Has valid Enrollment record
     - accessEndDate is null (lifetime) OR accessEndDate > now
  4. User bought the course as single purchase AND:
     - Order.planType === "single"
     - Order.paymentStatus === "approved"
     - Order.isActive === true
     - Order.endDate is null OR Order.endDate > now
  5. User bought a combo that includes this course AND:
     - Order.planType === "combo"
     - Order.paymentStatus === "approved"
     - Order.isActive === true
     - Combo includes this courseId
     - Order.endDate is null OR Order.endDate > now
  7. (Legacy) User has active quarterly subscription AND:
     - Order.planType === "quarterly"
     - Order.paymentStatus === "approved"
     - Order.isActive === true
     - Order.endDate > now
```

### Access Control Middleware

#### Updated checkCourseAccess Middleware
- Checks Order model for legacy quarterly subscriptions
- Checks Order model for single course purchases
- Checks Enrollment model for access duration
- Checks Enrollment for combo purchases
- Returns 403 if no valid access found

---

## 🛠️ API Endpoints

### Single Course Access Management (Admin)

#### Set Course Access Duration
```http
POST /api/orders/admin/set-access-duration
Authorization: Bearer {token}
Content-Type: application/json

{
  "enrollmentId": "65d1a2b3c4d5e6f7g8h9i0j1",
  "duration": "3-months"  // 1-month, 2-months, 3-months, lifetime
}

Response:
{
  "success": true,
  "message": "Course access duration set successfully",
  "data": { enrollment object }
}
```

#### Extend User's Course Access
```http
POST /api/orders/admin/extend-access
Authorization: Bearer {token}
Content-Type: application/json

{
  "enrollmentId": "65d1a2b3c4d5e6f7g8h9i0j1",
  "newDuration": "lifetime"
}

Response:
{
  "success": true,
  "message": "Course access extended successfully",
  "data": { enrollment object }
}
```

#### Reduce User's Course Access
```http
POST /api/orders/admin/reduce-access
Authorization: Bearer {token}
Content-Type: application/json

{
  "enrollmentId": "65d1a2b3c4d5e6f7g8h9i0j1",
  "newDuration": "1-month"
}

Response:
{
  "success": true,
  "message": "Course access reduced successfully",
  "data": { enrollment object }
}
```

#### Get User's Course Access Info
```http
GET /api/orders/admin/user-course-access/{userId}
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "activeAccess": [
      {
        "_id": "enrollment_id",
        "courseId": { course object },
        "accessDuration": "3-months",
        "accessStartDate": "2024-01-10T00:00:00Z",
        "accessEndDate": "2024-04-10T00:00:00Z"
      }
    ],
    "expiredAccess": [
      {
        "_id": "enrollment_id",
        "courseId": { course object },
        "accessDuration": "1-month",
        "accessEndDate": "2023-12-10T00:00:00Z"
      }
    ],
    "total": 5
  }
}
```

### Course Combo Management (Admin)

#### Create Combo
```http
POST /api/combo/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Web Development Mastery Bundle",
  "description": "Learn React, Node.js, and MongoDB",
  "courses": ["65d1a2b3c4d5e6f7g8h9i0j1", "65d1a2b3c4d5e6f7g8h9i0j2", "65d1a2b3c4d5e6f7g8h9i0j3"],
  "price": 4999,
  "discountPrice": 3999,
  "duration": "3-months",
  "thumbnail": "https://..."
}

Response:
{
  "success": true,
  "message": "Combo created successfully",
  "data": { combo object }
}
```

#### Get All Active Combos
```http
GET /api/combo/list?page=1&limit=10

Response:
{
  "success": true,
  "data": [
    {
      "_id": "combo_id",
      "name": "Web Development Bundle",
      "courses": [ course objects ],
      "price": 4999,
      "duration": "3-months",
      "isActive": true,
      "createdAt": "2024-01-10T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  }
}
```

#### Get Combo by ID
```http
GET /api/combo/{comboId}

Response:
{
  "success": true,
  "data": { combo object with populated courses }
}
```

#### Update Combo (Admin)
```http
PATCH /api/combo/{comboId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Web Development Mastery Bundle",
  "price": 4499,
  "duration": "lifetime",
  "isActive": true
}

Response:
{
  "success": true,
  "message": "Combo updated successfully",
  "data": { updated combo object }
}
```

#### Disable Combo (Admin)
```http
DELETE /api/combo/{comboId}
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Combo disabled successfully",
  "data": { combo object with isActive: false }
}
```

#### Extend User's Combo Access (Admin)
```http
POST /api/combo/extend-access
Authorization: Bearer {token}
Content-Type: application/json

{
  "userId": "65d1a2b3c4d5e6f7g8h9i0j1",
  "comboId": "65d1a2b3c4d5e6f7g8h9i0j4",
  "newDuration": "lifetime"
}

Response:
{
  "success": true,
  "message": "Access extended successfully",
  "data": {
    "userId": "...",
    "comboId": "...",
    "newDuration": "lifetime",
    "accessEndDate": null
  }
}
```

#### Get User's Combo Purchases
```http
GET /api/combo/my/purchases
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    {
      "_id": "order_id",
      "comboId": { combo object with courses },
      "paymentStatus": "approved",
      "isActive": true,
      "startDate": "2024-01-10T00:00:00Z",
      "endDate": "2024-04-10T00:00:00Z",
      "price": 3999
    }
  ]
}
```

---

## 🔒 Access Validation Examples

### Example 1: Single Course Purchase
```
1. Student buys "React Mastery" course
2. Order created: planType="single", courseId="course_123", endDate=null
3. Admin approves order
4. Enrollment created with:
   - accessDuration="lifetime"
   - accessEndDate=null
   - purchaseType="single"
5. Student can access course indefinitely
6. Admin extends access to "3-months"
7. Enrollment updated: accessEndDate="2024-04-10"
8. After 2024-04-10, student loses access
```

### Example 2: Combo Purchase
```
1. Student buys "Web Dev Bundle" (3 courses: React, Node, MongoDB)
2. Order created: planType="combo", comboId="combo_456", duration="3-months"
3. Admin approves order
4. System creates 3 Enrollments:
   - React enrollment: accessEndDate="2024-04-10"
   - Node enrollment: accessEndDate="2024-04-10"
   - MongoDB enrollment: accessEndDate="2024-04-10"
   - All with purchaseType="combo", comboId="combo_456"
5. Student can access all 3 courses until "2024-04-10"
6. After expiry, student loses access to all 3 courses
7. Admin extends by 3 more months
8. All 3 enrollments updated: accessEndDate="2024-07-10"
```

---

## 🚀 Utility Functions

### calculateAccessEndDate(duration, startDate)
Calculates the end date based on duration
```javascript
// Returns Date or null
calculateAccessEndDate("3-months", new Date("2024-01-10"))
// Returns: 2024-04-10

calculateAccessEndDate("lifetime")
// Returns: null
```

### hasValidAccess(accessEndDate)
Checks if access is still valid
```javascript
hasValidAccess(new Date("2024-04-10"))  // true if today < 2024-04-10
hasValidAccess(null)  // true (lifetime)
```

### getRemainingDays(accessEndDate)
Gets remaining days of access
```javascript
getRemainingDays(new Date("2024-04-10"))  // 87 (days)
getRemainingDays(null)  // null (lifetime)
```

---

## 📋 Migration Notes

### Existing Data
- Existing quarterly subscriptions will continue to work
- All existing enrollments without access dates are considered lifetime
- Legacy system checks Order model for access
- New system checks both Order and Enrollment models

### Backward Compatibility
- Old single course purchases with `endDate` in Order model still work
- Access validation checks both Order and Enrollment
- Quarterly subscriptions are still functional but deprecated

---

## 📝 Summary of Changes

| Feature | Old System | New System |
|---------|-----------|-----------|
| Single Course Access | 3 months fixed | Flexible, set by admin |
| Default Duration | 3 months | Lifetime (unless admin sets) |
| All-Access Subscription | Yes (quarterly) | Removed for new users |
| Course Combo | Not available | Available (1-3 courses) |
| Combo Duration | N/A | Single duration for all |
| Access Management | Order model only | Enrollment + Order models |
| Admin Control | Limited | Full control over durations |

---

## 🧪 Testing Checklist

- [ ] Admin can create course combos with 1-3 courses
- [ ] Admin can set combo duration (1-month, 2-months, 3-months, lifetime)
- [ ] User purchases single course, gets lifetime access by default
- [ ] Admin can set single course access to specific duration
- [ ] Admin can extend course access
- [ ] Admin can reduce course access
- [ ] User purchases combo, gets all courses with same expiry
- [ ] Combo access expires on endDate
- [ ] User cannot access course after expiry
- [ ] Enrollment model tracks access duration correctly
- [ ] Legacy quarterly subscriptions still work
- [ ] Access validation middleware works with all access types
