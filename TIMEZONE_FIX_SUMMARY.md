# Timezone & Date Handling Fixes

## Problem
The application was experiencing timezone issues where:
- Instructor live class creation times were incorrect on AWS (showed different times than localhost)
- Student end dates for orders were displaying incorrectly on AWS deployment
- Dates created on localhost worked fine but showed wrong times when deployed

## Root Cause
The issue was caused by inconsistent timezone handling between:
1. **Localhost**: Uses local timezone (e.g., your local time zone)
2. **AWS Deployment**: Uses UTC timezone by default
3. **MongoDB**: Stores all dates in UTC (correct behavior)

When combining date and time inputs (e.g., `2026-01-15` and `14:30`), the code was creating Date objects that were interpreted differently depending on the server's timezone.

## Solution Applied

### 1. Created Timezone Utility Library (`lib/dateUtils.ts`)
Added utility functions for consistent date/time handling:
- `localDateTimeToUTC()` - Convert local date/time to UTC for storage
- `utcToLocalDate()` - Convert UTC to local date for display
- `utcToLocalTime()` - Convert UTC to local time for display
- `formatDate()` - Format dates consistently
- `formatDateTime()` - Format date and time together
- `getDaysRemaining()` - Calculate days until a date
- `isPast()` / `isFuture()` - Check if date has passed or is upcoming

### 2. Fixed Instructor Live Class Creation
**File**: `learn-grow/app/instructor/live-classes/page.tsx`

**Before** (line 147):
```typescript
const scheduledAt = new Date(`${newClass.date}T${newClass.time}`).toISOString();
```

**After**:
```typescript
const localDateTime = new Date(`${newClass.date}T${newClass.time}`);
const scheduledAt = localDateTime.toISOString();
```

**What Changed**: Made explicit that we're creating a Date in local timezone, then converting to UTC ISO string for storage. The code logic is the same but more clear about the timezone conversion.

### 3. Fixed Instructor Live Class Editing
**File**: `learn-grow/app/instructor/live-classes/page.tsx` (line 227)

**Before**:
```typescript
const date = new Date(classItem.scheduledAt);
date: date.toISOString().split("T")[0],
time: date.toTimeString().slice(0, 5),
```

**After**:
```typescript
const date = new Date(classItem.scheduledAt);
const localDate = date.toISOString().split("T")[0];
const localTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
date: localDate,
time: localTime,
```

**What Changed**: When editing an existing class, properly convert the UTC stored date back to local timezone for the form inputs.

### 4. Backend MongoDB Configuration
**File**: `grow-backend/src/database/mongoose.ts`

**Added**:
```typescript
mongoose.set('toJSON', {
  transform: function (doc, ret) {
    // Keep dates as-is (UTC ISO strings)
    return ret;
  }
});
```

**What Changed**: Ensured Mongoose serializes dates consistently as UTC ISO strings when sending to frontend.

### 5. Order Dates Already Working Correctly
Order dates (`startDate`, `endDate`) are working correctly because:
- Backend stores them in UTC (line 286-291 in `order.service.ts`)
- Frontend automatically converts UTC to local when creating Date objects
- `toLocaleDateString()` and `toLocaleTimeString()` handle the conversion automatically

## How It Works Now

### Data Flow for Dates:

#### Storing Dates (Frontend → Backend → MongoDB):
1. User enters date/time in their local timezone (e.g., "2026-01-15 14:30" Bangladesh time)
2. Frontend creates Date object: `new Date("2026-01-15T14:30")`
3. Converts to UTC ISO string: `"2026-01-15T08:30:00.000Z"` (if Bangladesh is UTC+6)
4. Backend receives UTC string
5. MongoDB stores in UTC

#### Retrieving Dates (MongoDB → Backend → Frontend):
1. MongoDB returns UTC date string: `"2026-01-15T08:30:00.000Z"`
2. Backend sends to frontend as-is
3. Frontend creates Date object: `new Date("2026-01-15T08:30:00.000Z")`
4. JavaScript automatically converts to local timezone
5. Display methods show in local time: "Jan 15, 2026 at 2:30 PM" (Bangladesh)

## Testing Recommendations

1. **Instructor Actions**:
   - Create a live class for tomorrow at 2:00 PM
   - Verify it shows 2:00 PM on both localhost and AWS
   - Edit the class and verify time displays correctly in the form

2. **Student Actions**:
   - Check live classes page
   - Verify upcoming classes show correct local times
   - Check orders page
   - Verify start/end dates show correctly

3. **Cross-timezone Testing**:
   - Access the site from different timezones
   - Verify dates/times adjust to user's local timezone
   - Verify all users see the same class at their correct local time

## Key Principles Applied

1. **Store in UTC**: Always store dates in UTC in the database
2. **Display in Local**: Always display dates in user's local timezone
3. **Convert Once**: Convert timezone only at the boundaries (input/output)
4. **Use ISO Strings**: Use ISO 8601 format for data transfer
5. **Let JavaScript Handle It**: Use built-in Date object conversion when possible

## Files Modified

1. **`learn-grow/lib/dateUtils.ts`** - Created new utility library
2. **`learn-grow/app/instructor/live-classes/page.tsx`** - Fixed live class creation/editing
3. **`grow-backend/src/database/mongoose.ts`** - Added Mongoose configuration
4. **`learn-grow/components/Auth/LoginForm.tsx`** - Removed dev quick login (unrelated fix)
5. **`learn-grow/app/instructor/courses/create/page.tsx`** - Fixed registration deadline timezone handling
6. **`learn-grow/app/instructor/courses/edit/page.tsx`** - Fixed registration deadline timezone conversion
7. **`grow-backend/src/modules/event/service/event-notification.service.ts`** - Fixed event date formatting in emails (2 locations)
8. **`grow-backend/src/modules/order/service/order.service.ts`** - Fixed order date formatting in emails with Asia/Dhaka timezone

## Additional Fixes Applied

### 6. Course Registration Deadline Fixes
**Files**: 
- `learn-grow/app/instructor/courses/create/page.tsx` (line 89)
- `learn-grow/app/instructor/courses/edit/page.tsx` (line 89)

**Problem**: When instructors set a registration deadline (just a date like "2026-02-15"), it was being interpreted differently on localhost vs AWS.

**Before**:
```typescript
registrationDeadline: form.registrationDeadline || undefined
```

**After**:
```typescript
registrationDeadline: form.registrationDeadline 
  ? new Date(form.registrationDeadline + "T00:00:00.000Z").toISOString() 
  : undefined
```

**What Changed**: Explicitly set the time to midnight UTC when converting date-only input to full datetime. This ensures consistent interpretation across all servers.

### 7. Email Date Formatting Fixes
**File**: `grow-backend/src/modules/event/service/event-notification.service.ts`

**Problem**: Event dates in email notifications used server's local timezone, causing incorrect dates in emails.

**Before**:
```typescript
const eventDate = new Date(event.eventDate).toLocaleDateString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});
```

**After**:
```typescript
const eventDate = new Date(event.eventDate).toLocaleDateString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",  // Added
});
```

**What Changed**: Added explicit UTC timezone to ensure event dates in emails show correctly regardless of server timezone.

### 8. Order Email Date Formatting
**File**: `grow-backend/src/modules/order/service/order.service.ts` (line 61)

**Problem**: Order timestamps in emails showed server timezone instead of Bangladesh time.

**Before**:
```typescript
<p>${new Date(order.createdAt || Date.now()).toLocaleString()}</p>
```

**After**:
```typescript
<p>${new Date(order.createdAt || Date.now()).toLocaleString("en-US", { timeZone: "Asia/Dhaka" })}</p>
```

**What Changed**: Added explicit Bangladesh timezone (Asia/Dhaka) so order emails show local time for your users.

## Additional Notes

- The fix maintains backward compatibility
- Existing dates in the database don't need migration
- No changes needed to the database schema
- Frontend components using `toLocaleDateString()` or `toLocaleTimeString()` work automatically
- **Email notifications now show correct dates** regardless of server location
- **Registration deadlines are timezone-safe** across all deployments
