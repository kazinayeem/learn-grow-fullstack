# Email Feature Setup Guide

## Overview

The email functionality allows admins to send personalized emails to job applicants with tracking capabilities. Emails are stored in MongoDB with delivery status and timestamps.

## Setup Instructions

### 1. Configure Email Service

You need to set up an email service provider. Here are the supported options:

#### Gmail Setup (Recommended for Development)

1. Enable 2-Factor Authentication on your Gmail account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Select "Mail" and "Windows (or your device)"
4. Google will generate a 16-character password
5. Copy this password (without spaces) and add to `.env`:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-character-password
```

#### SendGrid Setup (Recommended for Production)

1. Create account at [SendGrid](https://sendgrid.com)
2. Generate an API Key
3. Add to `.env`:

```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=SG_xxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### Mailgun Setup

1. Create account at [Mailgun](https://mailgun.com)
2. Get SMTP credentials from your account
3. Add to `.env`:

```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=postmaster@yourdomain.mailgun.org
EMAIL_PASSWORD=your-mailgun-password
```

#### AWS SES Setup (Recommended for High Volume)

1. Set up AWS SES and verify email address
2. Get SMTP credentials
3. Add to `.env`:

```env
EMAIL_HOST=email-smtp.region.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=your-smtp-username
EMAIL_PASSWORD=your-smtp-password
```

### 2. Database Setup

Run migrations to create the EmailLog collection:

```bash
cd grow-backend
npm run prisma:migrate dev --name "add_email_log_model"
# or if using MongoDB directly
# The EmailLog collection will be created automatically on first use
```

### 3. Test Email Configuration

From the backend, you can test the email configuration:

```bash
# Make a GET request to:
GET http://localhost:5000/api/job/email/test
```

Expected responses:
- ✅ Success: Email service is ready
- ❌ Failed: Check your SMTP credentials and firewall settings

## API Endpoints

### Send Email to Applicant

**POST** `/api/job/send-email`

Request body:
```json
{
  "applicationId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "recipientEmail": "applicant@example.com",
  "recipientName": "John Doe",
  "subject": "Interview Scheduled",
  "message": "<h2>Hello John,</h2><p>We are pleased to invite you for an interview...</p>"
}
```

Response:
```json
{
  "success": true,
  "message": "Email sent successfully",
  "data": {
    "emailLogId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "messageId": "smtp-message-id"
  }
}
```

### Get Email History

**GET** `/api/job/email-history/:applicationId`

Returns an array of all emails sent to an applicant, sorted by latest first.

Response:
```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "applicationId": "65a1b2c3d4e5f6g7h8i9j0k1",
      "recipientEmail": "applicant@example.com",
      "recipientName": "John Doe",
      "subject": "Interview Scheduled",
      "status": "sent",
      "sentAt": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Get Latest Email

**GET** `/api/job/email-latest/:applicationId`

Returns the most recent email sent to an applicant.

## Frontend Implementation

The admin can access email functionality through the Applications page:

1. Navigate to `/admin/jobs/applications`
2. Click "Email" button on any application row
3. Fill in the subject and compose the email using the rich text editor
4. Click "Send Email"

## Email Log Schema

Emails are stored with the following structure:

```typescript
{
  _id: ObjectId,
  applicationId: ObjectId,           // Reference to JobApplication
  recipientEmail: String,            // Applicant's email
  recipientName: String,             // Applicant's name
  subject: String,                   // Email subject
  message: String,                   // Email body (HTML)
  status: "pending" | "sent" | "failed",
  sentAt: Date,                      // When email was sent
  error: String,                     // Error message if failed
  createdAt: Date,                   // When log was created
  updatedAt: Date
}
```

## Features

✅ **Rich Text Editor** - Compose emails with formatting
✅ **Email Tracking** - Know when emails are sent
✅ **Email History** - View all emails sent to each applicant
✅ **Error Handling** - Logs failed emails with error messages
✅ **Professional Templates** - HTML formatted emails
✅ **Indexed Queries** - Fast email lookups by applicationId

## Troubleshooting

### Email Not Sending?

1. **Check SMTP Credentials**
   - Verify EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD in .env
   - Test with: `GET http://localhost:5000/api/job/email/test`

2. **Firewall/Port Issues**
   - Port 587 (TLS) is usually open
   - Port 465 (SSL) may be blocked
   - Check with your ISP/network admin

3. **Gmail App Passwords**
   - Must use App Password, not regular password
   - Must have 2FA enabled
   - Password must not have spaces

4. **Email Not Appearing in Inbox**
   - Check spam folder
   - Verify "From" address matches EMAIL_USER
   - Check email logs in MongoDB

### Common Errors

| Error | Solution |
|-------|----------|
| "ECONNREFUSED" | SMTP server unreachable - check host/port |
| "Invalid login" | Wrong email/password credentials |
| "Authentication failed" | Check email provider requirements |
| "TLS error" | Try port 465 instead of 587 |

## MongoDB Commands

```bash
# View email logs
db.emaillogs.find()

# View emails for specific application
db.emaillogs.find({ applicationId: ObjectId("...") })

# Count sent emails
db.emaillogs.countDocuments({ status: "sent" })

# Find failed emails
db.emaillogs.find({ status: "failed" })
```

## Performance Notes

- Email sending is synchronous - add queue system for high volume
- Consider implementing email rate limiting
- Emails are stored indefinitely - implement cleanup policy
- Use indexed queries for fast email lookups

## Next Steps

1. Update environment variables with email credentials
2. Test email configuration
3. Access admin panel and try sending an email
4. Check MongoDB for email logs
