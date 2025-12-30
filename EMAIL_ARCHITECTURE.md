# Email System Architecture

## Component Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN PANEL (Frontend)                   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │     Applications Page (/admin/jobs/applications)     │   │
│  │                                                       │   │
│  │  [Application 1] [View] [Email] [Delete]            │   │
│  │  [Application 2] [View] [Email] [Delete]            │   │
│  │  [Application 3] [View] [Email] [Delete]            │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓ (Click Email)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           SendEmailModal Component                    │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │ To: applicant@example.com                      │  │   │
│  │  │ Name: John Doe                                 │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │ Subject: Interview Scheduled                   │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │ RichTextEditor                                 │  │   │
│  │  │ [B] [I] [U] [H] [L] [Link]                     │  │   │
│  │  │ ──────────────────────────────────────────────  │  │   │
│  │  │ Hello John, we are pleased to invite you...   │  │   │
│  │  │                                                │  │   │
│  │  │                                                │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │  [Cancel]                           [Send Email]     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          ↓
        useSendApplicationEmailMutation()
        (Redux Query Mutation)
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Express.js)                     │
│                                                               │
│  POST /api/job/send-email                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │        emailController.sendEmail()                   │   │
│  │                                                       │   │
│  │  1. Validate request (applicationId, email, etc)    │   │
│  │  2. Call emailService.sendApplicationEmail()        │   │
│  │  3. Return response with status                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │        emailService.sendApplicationEmail()           │   │
│  │                                                       │   │
│  │  1. Create EmailLog record (pending)                │   │
│  │  2. Initialize nodemailer transporter               │   │
│  │  3. Format HTML email template                      │   │
│  │  4. Send email via SMTP                             │   │
│  │  5. Update EmailLog to "sent"                       │   │
│  │  6. Return success response                         │   │
│  │                                                       │   │
│  │  On Error:                                          │   │
│  │  - Update EmailLog to "failed"                      │   │
│  │  - Log error message                                │   │
│  │  - Throw error to controller                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              SMTP Server (Email Provider)                   │
│                                                               │
│  Configuration Options:                                      │
│  ├── Gmail (smtp.gmail.com:587)                            │
│  ├── SendGrid (smtp.sendgrid.net:587)                      │
│  ├── Mailgun (smtp.mailgun.org:587)                        │
│  └── AWS SES (email-smtp.region.amazonaws.com:587)         │
│                                                               │
│  Send email to: applicant@example.com                       │
│  From: your-email@gmail.com                                │
│  Subject: Interview Scheduled                               │
│  Body: (HTML formatted)                                     │
│    ┌──────────────────────────────┐                        │
│    │ Hello John,                  │                        │
│    │                              │                        │
│    │ We are pleased to invite     │                        │
│    │ you for an interview...      │                        │
│    │                              │                        │
│    │ Learn & Grow Team            │                        │
│    └──────────────────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              Applicant's Email Inbox                         │
│                                                               │
│  From: your-email@gmail.com                                │
│  Subject: Interview Scheduled                               │
│                                                               │
│  ┌──────────────────────────────────────┐                  │
│  │ Hello John,                          │                  │
│  │                                      │                  │
│  │ We are pleased to invite you for an │                  │
│  │ interview...                         │                  │
│  │                                      │                  │
│  │ Learn & Grow Team                    │                  │
│  └──────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              MongoDB - Email Logs                           │
│                                                               │
│  Collection: emaillogs                                      │
│                                                               │
│  {                                                           │
│    _id: ObjectId("..."),                                   │
│    applicationId: ObjectId("..."),                         │
│    recipientEmail: "applicant@example.com",               │
│    recipientName: "John Doe",                             │
│    subject: "Interview Scheduled",                        │
│    message: "<h2>Hello John,</h2>...",                    │
│    status: "sent",                                        │
│    sentAt: ISODate("2024-01-15T10:30:00Z"),             │
│    createdAt: ISODate("2024-01-15T10:30:00Z"),          │
│    updatedAt: ISODate("2024-01-15T10:30:00Z")           │
│  }                                                         │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌─────────────────┐
│  Admin Clicks   │
│   "Email"       │
└────────┬────────┘
         │
         ↓
┌─────────────────────────────────────┐
│  Modal Opens                         │
│  - Show applicant email/name         │
│  - Show rich text editor             │
│  - Show subject input                │
└────────┬────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│  Admin Composes Email                │
│  - Enter subject                     │
│  - Write message with formatting     │
│  - Add links, lists, etc             │
└────────┬────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│  Admin Clicks "Send Email"           │
│  - Validate subject (required)       │
│  - Validate message (required)       │
│  - Show loading state                │
└────────┬────────────────────────────┘
         │
         ↓
    [Redux Mutation]
    useSendApplicationEmailMutation()
         │
         ↓ POST /api/job/send-email
┌─────────────────────────────────────┐
│  Backend Process                     │
│  1. Validate input                   │
│  2. Create EmailLog (pending)        │
│  3. Setup nodemailer                 │
│  4. Format HTML template             │
│  5. Send via SMTP                    │
│  6. Update EmailLog (sent)           │
│  7. Return success                   │
└────────┬────────────────────────────┘
         │
         ├─→ On Success:
         │   - Show success message
         │   - Close modal
         │   - Refetch applications
         │
         └─→ On Error:
             - Show error message
             - Keep modal open
             - Log error in MongoDB
```

## API Request/Response

### Request
```javascript
POST /api/job/send-email
Content-Type: application/json

{
  "applicationId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "recipientEmail": "applicant@example.com",
  "recipientName": "John Doe",
  "subject": "Interview Scheduled",
  "message": "<h2>Hello John,</h2><p>We are pleased to invite you...</p>"
}
```

### Response (Success)
```javascript
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "message": "Email sent successfully",
  "data": {
    "emailLogId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "messageId": "<unique-smtp-message-id@smtp.gmail.com>"
  }
}
```

### Response (Error)
```javascript
HTTP/1.1 500 Internal Server Error
Content-Type: application/json

{
  "success": false,
  "message": "Failed to send email: SMTP connection refused"
}
```

## Database Schema Relationships

```
┌──────────────────────┐
│  JobApplication      │
├──────────────────────┤
│ _id                  │
│ jobId                │ ◄─────────┐
│ email                │           │
│ fullName             │           │ Referenced by
│ phone                │           │
│ resumeUrl            │           │
│ status               │           │
│ appliedAt            │           │
└──────────────────────┘           │
                                   │
                    ┌──────────────────────────┐
                    │  EmailLog                │
                    ├──────────────────────────┤
                    │ _id                      │
                    │ applicationId ───────────┘
                    │ recipientEmail           │
                    │ recipientName            │
                    │ subject                  │
                    │ message                  │
                    │ status (sent/failed)     │
                    │ sentAt                   │
                    │ error                    │
                    │ createdAt                │
                    │ updatedAt                │
                    └──────────────────────────┘
```

## State Management Flow

```
Redux Store
│
├── jobApi.reducer
│   ├── JobApplication (cached)
│   └── EmailLog (cached)
│
└── jobApi.mutations
    ├── useSendApplicationEmailMutation
    │   └── POST /api/job/send-email
    │
    ├── useGetEmailHistoryQuery
    │   └── GET /api/job/email-history/:id
    │
    └── useGetLatestEmailQuery
        └── GET /api/job/email-latest/:id
```

## Component Hierarchy

```
Admin Page
│
├── JobApplicationsTable
│   ├── ApplicationRow
│   │   ├── [View Button] → ApplicationDetailsModal
│   │   ├── [Email Button] → SendEmailModal
│   │   └── [Delete Button] → Delete Mutation
│   │
│   └── Search/Filter Controls
│
└── SendEmailModal
    ├── Modal (NextUI)
    ├── Input (Subject)
    ├── RichTextEditor (Message)
    ├── RecipientInfo (Display)
    ├── ErrorCard (Error display)
    ├── Buttons
    │   ├── Cancel
    │   └── Send Email (useSendApplicationEmailMutation)
    │
    └── State:
        ├── subject: string
        ├── message: string
        ├── error: string
        └── isSending: boolean
```

## Email Template Structure

```
┌─────────────────────────────────────────┐
│         Email Header                    │
│  From: your-email@gmail.com            │
│  To: applicant@example.com             │
│  Subject: Interview Scheduled           │
│  Date: Mon, 15 Jan 2024 10:30:00       │
└─────────────────────────────────────────┘
│
├─────────────────────────────────────────┐
│  HTML Email Body                        │
│  ┌─────────────────────────────────────┐│
│  │ Hello John Doe,                     ││
│  │                                     ││
│  │ [Message Content]                   ││
│  │ (formatted HTML)                    ││
│  │                                     ││
│  ├─────────────────────────────────────┤│
│  │ Learn & Grow Team                   ││
│  │ This is an automated message         ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

## Error Handling Flow

```
┌──────────────────┐
│  Send Email      │
└────────┬─────────┘
         │
    Error? ──Yes──→ ┌─────────────────────┐
    │               │ Create EmailLog     │
    │               │ status: "failed"    │
    │               │ error: message      │
    No              └─────────────────────┘
    │                       │
    ↓                       │
    │                       ↓
    │               ┌─────────────────────┐
    │               │ Return to Frontend  │
    │               │ success: false      │
    │               │ message: error text │
    │               └─────────────────────┘
    │                       │
    ↓                       │
    │                       ↓
    ↓                   Show Error UI
    │
    ↓
Create EmailLog
status: "sent"
sentAt: now
    │
    ↓
Return Success
success: true
emailLogId: "..."
    │
    ↓
Show Success UI
```

---

This architecture provides:
✅ Clean separation of concerns
✅ Scalable design for future enhancements
✅ Comprehensive error handling
✅ Real-time status tracking
✅ Professional email formatting

