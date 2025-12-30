# Email History & Tracking Feature Implementation

## Overview
Added comprehensive email history tracking to the admin event registrations email page. Admins can now see which emails have been sent, when they were sent, and track the email sending activity for each registrant.

---

## Changes Made

### 1. Backend - Database Model

#### Updated EventRegistration Schema (`grow-backend/src/modules/event/model/event-registration.model.ts`)
- **Added** `emailHistory` array field to store email send records:
  ```typescript
  emailHistory: [
    {
      subject: string,
      content: string,
      sentAt: Date
    }
  ]
  ```

### 2. Backend - Email Service

#### Updated Send Email Service (`grow-backend/src/modules/event/service/event-notification.service.ts`)
- **Modified** `sendCustomEmailToRegistrations()` to populate email history:
  - After sending emails, updates all registrations with:
    - Email subject
    - Email content
    - Sent timestamp
  - Sets `notificationSent: true` for all recipients

### 3. Backend - Email History Service

#### Added Service Method (`grow-backend/src/modules/event/service/event.service.ts`)
- **Added** `getEmailHistory()` function:
  - Retrieves registrations with email history
  - Supports pagination
  - Supports search by name/email
  - Returns only registrations that have received emails
  - Sorted by latest email sent

### 4. Backend - Email History Controller

#### Added Controller Handler (`grow-backend/src/modules/event/controller/event.controller.ts`)
- **Added** `getEmailHistory()` controller:
  - Validates parameters (page, limit, search)
  - Returns paginated email history
  - Includes pagination metadata

### 5. Backend - Routes

#### Updated Routes (`grow-backend/src/modules/event/routes/event.route.ts`)
- **Added** GET route: `/events/:id/registrations/email-history`
  - Protected with admin authentication
  - Supports query parameters: `page`, `limit`, `search`

### 6. Frontend - API Layer

#### Updated Redux API (`learn-grow/redux/api/eventApi.ts`)
- **Added** `getEmailHistory` query:
  - Endpoint: `GET /events/:eventId/registrations/email-history`
  - Supports pagination and search
  - Provides tags for cache invalidation
- **Added** `useGetEmailHistoryQuery` hook to exports

### 7. Frontend - UI Implementation

#### Updated Email Sending Page (`learn-grow/app/admin/events/[id]/registrations/email/page.tsx`)

##### New Features:
1. **Two-Tab Interface:**
   - **Tab 1: Send Emails** - Original email sending functionality
   - **Tab 2: Email History** - New history tracking feature

2. **Email History Table Shows:**
   - Recipient's Full Name
   - Email Address
   - Last Email Sent (Date & Time)
   - Total Number of Emails Sent to That Registrant

3. **Search Functionality:**
   - Filter email history by registrant name or email address
   - Real-time search

4. **Pagination:**
   - Navigate through email history (10 items per page)
   - Shows total pages and current page

---

## Features

### Send Emails Tab
- Original functionality preserved
- Send bulk emails to all registrants
- Pre-built email templates
- Rich text editor for custom messages
- Real-time sending status

### Email History Tab
- **View all sent emails** with comprehensive details
- **Search registrants** by name or email
- **Track email activity** for each registrant:
  - When they received emails
  - How many emails they've received
  - Latest email timestamp
- **Pagination support** for large email histories
- **Empty state** message if no emails sent yet

---

## Database Structure

### EventRegistration Email History
```javascript
{
  _id: ObjectId,
  event: ObjectId,
  fullName: String,
  email: String,
  phoneNumber: String,
  registeredAt: Date,
  notificationSent: Boolean,
  emailHistory: [
    {
      subject: String,
      content: String,
      sentAt: Date
    },
    // More email records...
  ],
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Endpoints

### Get Email History
```
GET /events/:eventId/registrations/email-history
Authorization: Bearer <admin-token>

Query Parameters:
- page: number (default: 1)
- limit: number (default: 10, max: 100)
- search: string (optional, searches by fullName or email)

Response:
{
  "success": true,
  "message": "Email history retrieved successfully",
  "data": [
    {
      "_id": "...",
      "fullName": "John Doe",
      "email": "john@example.com",
      "emailHistory": [
        {
          "subject": "Event Details",
          "content": "<p>Event content...</p>",
          "sentAt": "2025-12-30T10:30:00Z"
        },
        ...
      ]
    },
    ...
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

### Send Emails (Updated)
- Now automatically populates email history when emails are sent
- Updates all registrations with email details and timestamp

---

## User Interface

### Email Management Page Layout
```
┌─────────────────────────────────────────────────┐
│ Email Management                                 │
├──────────────┬──────────────────────────────────┤
│ Send Emails  │ Email History   [SELECTED]       │
├─────────────────────────────────────────────────┤
│                                                  │
│ Event: Event Title                               │
│                                                  │
│ ┌─ Search ──────────────────────────────────┐  │
│ │ Search by name or email...                │  │
│ └───────────────────────────────────────────┘  │
│                                                  │
│ ┌─────────────────────────────────────────────┐ │
│ │ NAME          │ EMAIL      │ LAST SENT    │ │ │
│ ├─────────────────────────────────────────────┤ │
│ │ John Doe      │ john@...   │ 12/30/2025   │ │ │
│ │               │            │ 10:30 AM     │ │ │
│ ├─────────────────────────────────────────────┤ │
│ │ Jane Smith    │ jane@...   │ 12/30/2025   │ │ │
│ │               │            │ 09:15 AM     │ │ │
│ └─────────────────────────────────────────────┘ │
│                                                  │
│ Page 1 of 5  [< 1 2 3 4 5 >]                   │
└─────────────────────────────────────────────────┘
```

---

## How It Works

### Step 1: Sending Emails
1. Admin goes to "Email Management" page
2. Clicks "Send Emails" tab
3. Composes or selects template
4. Clicks "Send to All"
5. System sends emails to all registrants

### Step 2: Automatic Tracking
- When emails are sent, the system automatically records:
  - Email subject
  - Email content (HTML)
  - Exact timestamp of send
  - Updates `notificationSent` flag to `true`

### Step 3: Viewing History
1. Admin clicks "Email History" tab
2. System loads all registrations that received emails
3. Shows each registrant with their last email sent time
4. Admin can search by name or email
5. Admin can navigate through pages

---

## Benefits

✅ **Complete Audit Trail** - Know exactly which emails were sent and when  
✅ **Registrant Tracking** - See email activity for each registrant  
✅ **Search & Filter** - Quickly find specific registrants' email history  
✅ **Pagination** - Handle large email histories efficiently  
✅ **Timestamp Precision** - Know exact date and time emails were sent  
✅ **Non-Intrusive** - History tracking is automatic, no manual entry needed  
✅ **Content Preservation** - Store actual email content for reference  

---

## Testing Checklist

- [ ] Send email to registrants
- [ ] Check email history appears in history tab
- [ ] Verify email details (subject, timestamp) are correct
- [ ] Search for registrant in history works
- [ ] Pagination works correctly
- [ ] Multiple emails to same registrant accumulate in history
- [ ] History persists after page refresh
- [ ] Registrants with no emails are hidden
- [ ] Empty state message shows when no emails sent

---

## Files Modified

1. ✅ `grow-backend/src/modules/event/model/event-registration.model.ts`
2. ✅ `grow-backend/src/modules/event/service/event-notification.service.ts`
3. ✅ `grow-backend/src/modules/event/service/event.service.ts`
4. ✅ `grow-backend/src/modules/event/controller/event.controller.ts`
5. ✅ `grow-backend/src/modules/event/routes/event.route.ts`
6. ✅ `learn-grow/redux/api/eventApi.ts`
7. ✅ `learn-grow/app/admin/events/[id]/registrations/email/page.tsx`

---

## Migration Notes

If you have existing registrations in the database, they will automatically support the new `emailHistory` field even if it's empty initially. No data migration is required.

---

## Performance Considerations

- Email history is only retrieved for registrations that have received emails (filtered by non-empty emailHistory)
- Pagination default is 10 records per page to avoid loading too much data
- Search uses database-level filtering for efficiency
- Consider adding indexes on `emailHistory.sentAt` for very large datasets

