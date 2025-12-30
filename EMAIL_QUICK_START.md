# Email Feature - Quick Start Guide

## 🚀 30 Second Setup

### Step 1: Configure Email Provider (2 minutes)

#### For Gmail (Recommended for Development):
1. Go to [Google Account](https://myaccount.google.com)
2. Enable 2-Factor Authentication
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Select Mail → Windows (or your OS)
5. Copy the 16-character password (ignore spaces)
6. Add to `.env`:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-password-without-spaces
```

#### For SendGrid (Production):
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=SG_xxxxxxxxxxxxxxxxxxxxx
```

### Step 2: Restart Backend
```bash
cd grow-backend
npm run dev
```

### Step 3: Test Configuration
```bash
curl http://localhost:5000/api/job/email/test
```

Expected response:
```json
{
  "success": true,
  "message": "Email service is configured correctly"
}
```

## ✉️ Using Email Feature

### From Admin Panel
1. Go to http://localhost:3000/admin/jobs/applications
2. Click **Email** button on any application row
3. Fill in:
   - **Subject**: Email title
   - **Message**: Your message (use formatting tools)
4. Click **Send Email**
5. ✅ Success! Email sent and logged

### From API
```bash
curl -X POST http://localhost:5000/api/job/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "applicationId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "recipientEmail": "applicant@example.com",
    "recipientName": "John Doe",
    "subject": "Interview Scheduled",
    "message": "<h2>Hello,</h2><p>You are invited for an interview...</p>"
  }'
```

## 📊 Checking Email Status

### In MongoDB
```javascript
// View sent emails
db.emaillogs.find({ status: "sent" })

// View emails for specific applicant
db.emaillogs.find({ 
  applicationId: ObjectId("65a1b2c3d4e5f6g7h8i9j0k1") 
})

// View failed emails
db.emaillogs.find({ status: "failed" })
```

### Via API
```bash
# Get all emails sent to an applicant
curl http://localhost:5000/api/job/email-history/65a1b2c3d4e5f6g7h8i9j0k1

# Get latest email
curl http://localhost:5000/api/job/email-latest/65a1b2c3d4e5f6g7h8i9j0k1
```

## ❌ Troubleshooting

### Email Not Sending?

**Check 1: Environment Variables**
```bash
# Verify .env is set
cat .env | grep EMAIL
```

**Check 2: SMTP Connection**
```bash
# Test email service
curl http://localhost:5000/api/job/email/test
```

**Check 3: Backend Logs**
```bash
# Watch backend output for errors
npm run dev
```

**Check 4: MongoDB Logs**
```javascript
// View error logs
db.emaillogs.find({ status: "failed" })
```

### Common Errors

| Error | Solution |
|-------|----------|
| "ECONNREFUSED" | Check EMAIL_HOST and EMAIL_PORT |
| "Invalid login" | Verify EMAIL_USER and EMAIL_PASSWORD |
| "Authentication failed" | For Gmail: Use 16-char App Password (not regular password) |
| "Email not in inbox" | Check spam folder, verify "From" address |

## 📚 More Help

- **Full Setup Guide**: [EMAIL_SETUP.md](grow-backend/EMAIL_SETUP.md)
- **Complete Documentation**: [EMAIL_IMPLEMENTATION.md](EMAIL_IMPLEMENTATION.md)
- **Provider Examples**: [.env.example](grow-backend/.env.example)

## ✅ Features

- ✅ Rich text email editor
- ✅ Multiple email providers supported
- ✅ Email tracking and history
- ✅ Professional HTML formatting
- ✅ Error logging
- ✅ Admin panel integration

## 🎯 Next Steps

1. Configure email provider (5 min)
2. Test email configuration (1 min)
3. Send test email from admin panel (2 min)
4. Verify email received (check inbox)

**Total Time: ~10 minutes**

---

Questions? Check the troubleshooting section or full documentation.

