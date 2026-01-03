# Guardian-Student Bug Fix - Endpoint Audit Checklist

This checklist helps identify and fix any other endpoints that might be vulnerable to the same guardian-student data mismatch issue.

## ✅ Endpoints Already Fixed

### Order Module
- [x] `GET /api/orders/student-data` - Fixed to use GuardianProfile
- [x] `GET /api/orders/guardian/children` - Fixed to use GuardianProfile
- [x] Added `validateGuardianStudentAccess` middleware

### User Module
- [x] `GET /api/user/profile` - Updated to use GuardianProfile
- [x] Registration flow - Already correctly creates GuardianProfile

## 🔍 Other Endpoints to Audit

### Enrollment Module
- [ ] Check if any enrollment endpoints fetch data by guardianId instead of studentId
- [ ] Verify `/enrollment` endpoints validate guardian-student relationship
- [ ] Review enrollment creation/update to ensure proper validation

### Course Module
- [ ] Audit any endpoints that allow guardians to view course progress
- [ ] Check if course progress filters by studentId correctly
- [ ] Verify module/lesson progress queries validate relationships

### Quiz Module
- [ ] Verify quiz results queries filter by studentId
- [ ] Check if guardians can only view their student's quiz results
- [ ] Validate quiz submission endpoints

### Assignment Module
- [ ] Verify assignment submissions are filtered by studentId
- [ ] Check if guardians can only view their student's assignments
- [ ] Validate assignment grades/feedback access

### Payment Module
- [ ] Verify payment/subscription queries use studentId correctly
- [ ] Check if guardians can only view their student's payments
- [ ] Validate refund request authorization

### Dashboard/Analytics Module
- [ ] Audit any dashboard endpoints for guardians
- [ ] Verify analytics queries use GuardianProfile to identify students
- [ ] Check student progress dashboards

### Attendance/Live Class Module
- [ ] Verify live class attendance is filtered by studentId
- [ ] Check if guardians can only view their student's attendance

## 📋 Audit Steps for Each Endpoint

For each endpoint you find, follow these steps:

### Step 1: Identify the Issue
```
Ask: "Does this endpoint return student-specific data?"
If YES → Continue to Step 2
If NO → No action needed
```

### Step 2: Check Data Source
```
Ask: "How does it identify which student's data to return?"
- Uses guardianId? ❌ WRONG
- Uses User.children[]? ❌ WRONG
- Uses GuardianProfile.studentId? ✅ CORRECT
- Uses studentId from request? ✅ CORRECT (with validation)
```

### Step 3: Check for Validation
```
Ask: "Does it validate the guardian-student relationship?"
If NO → Add validation middleware
If YES → Check if using GuardianProfile
```

### Step 4: Apply Fix
```
Option 1 (Simple):
- Add validateGuardianStudentAccess middleware
- Use req.validatedStudentId from middleware

Option 2 (Complex):
- Query GuardianProfile to get valid studentId
- Use utility function validateGuardianCanAccessStudent
- Filter results by validated studentId
```

## 🔧 Common Vulnerable Patterns

### Pattern 1: Using guardianId to fetch student data
```typescript
// ❌ WRONG
const data = await Model.find({ guardianId: req.userId });

// ✅ CORRECT
const { GuardianProfile } = await import('...');
const guardianProfiles = await GuardianProfile.find({ userId: req.userId });
const studentIds = guardianProfiles.map(gp => gp.studentId);
const data = await Model.find({ studentId: { $in: studentIds } });
```

### Pattern 2: Using User.children[] for queries
```typescript
// ❌ WRONG
const user = await User.findById(req.userId).populate('children');
const childIds = user.children.map(c => c._id);
const data = await Model.find({ studentId: { $in: childIds } });

// ✅ CORRECT
const { GuardianProfile } = await import('...');
const guardianProfiles = await GuardianProfile.find({ userId: req.userId });
const studentIds = guardianProfiles.map(gp => gp.studentId);
const data = await Model.find({ studentId: { $in: studentIds } });
```

### Pattern 3: No validation middleware
```typescript
// ❌ WRONG - guardian can pass any studentId
router.get("/data", requireAuth, controller);

// ✅ CORRECT - validation middleware ensures guardians can only access their students
router.get("/data", requireAuth, validateGuardianStudentAccess, controller);
```

### Pattern 4: Weak authorization checks
```typescript
// ❌ WRONG - only checks if user is guardian, not if they own the student
if (req.userRole === "guardian") {
  const data = await Model.find({ studentId: req.query.studentId });
}

// ✅ CORRECT - validates the relationship
if (req.userRole === "guardian") {
  const isAuthorized = await validateGuardianCanAccessStudent(
    req.userId,
    req.query.studentId
  );
  if (!isAuthorized.authorized) {
    return res.status(403).json({ error: isAuthorized.reason });
  }
  const data = await Model.find({ studentId: req.query.studentId });
}
```

## 📊 Endpoint Audit Template

Use this template for each endpoint:

```
Endpoint: GET /api/module/endpoint
Module: module_name

1. Returns student-specific data? YES/NO
2. Current data source: [describe current logic]
3. Currently vulnerable? YES/NO
4. Fix required: YES/NO

If YES, apply fix:
- [ ] Use GuardianProfile as source of truth
- [ ] Add validateGuardianStudentAccess middleware
- [ ] Update query filters
- [ ] Test with multiple guardians/students
- [ ] Update error messages
- [ ] Document changes

Tests added:
- [ ] Guardian can access own student's data
- [ ] Guardian cannot access other student's data
- [ ] Student can access own data
- [ ] Admin can access all data
```

## 🚀 Priority Order

### Priority 1: High Risk (Data Privacy)
- [x] Orders/Payments
- [ ] Enrollments
- [ ] Quiz Results
- [ ] Assignment Submissions
- [ ] Attendance Records

### Priority 2: Medium Risk (Sensitive Data)
- [ ] Live Class Recordings
- [ ] Learning Progress
- [ ] Performance Analytics
- [ ] Student Profile Data

### Priority 3: Low Risk (Non-sensitive)
- [ ] Course Catalog (public anyway)
- [ ] General Announcements
- [ ] FAQ/Help Content

## ✨ Best Practices Going Forward

1. **Always ask: Who should see this data?**
   - Guardian: Only their linked student's data
   - Student: Only their own data
   - Instructor: Only their students' data
   - Admin: All data

2. **Always use GuardianProfile as source of truth**
   - Not User.children[]
   - Not cached values
   - Always query the authoritative model

3. **Always add validation middleware**
   - On endpoints that return student-specific data
   - Use validateGuardianStudentAccess
   - Or implement similar validation

4. **Always test with multiple scenarios**
   - Guardian accessing own student ✅
   - Guardian accessing other student ❌
   - Student accessing own data ✅
   - Student accessing other student ❌

5. **Always document the data flow**
   - Add comments explaining authorization
   - Document the validation logic
   - Include examples in docstrings

## 📝 Endpoints Audit Log

Track your progress here:

| Endpoint | Module | Status | Audit Date | Fixed By |
|----------|--------|--------|------------|----------|
| GET /orders/student-data | order | ✅ Fixed | 2026-01-03 | Auto-fix |
| GET /orders/guardian/children | order | ✅ Fixed | 2026-01-03 | Auto-fix |
| GET /user/profile | user | ✅ Fixed | 2026-01-03 | Auto-fix |
| | | 🔍 Pending | | |
| | | ✅ Fixed | | |
| | | ❌ Vulnerable | | |

## 🆘 Questions?

If you find an endpoint that doesn't fit these patterns:

1. Check the endpoint's data model
2. Trace how it identifies the student
3. Compare with the fixed patterns above
4. If still unsure, apply the most restrictive fix:
   - Add validation middleware
   - Query GuardianProfile for studentId
   - Filter by that studentId

## 🎯 Goal

After completing this audit, every student-specific endpoint should:

1. ✅ Use GuardianProfile as source of truth for guardian queries
2. ✅ Have validation middleware that enforces guardian-student relationships
3. ✅ Filter results by validated studentId
4. ✅ Return 403 for unauthorized access attempts
5. ✅ Have tests confirming data isolation
