# Email Configuration Cleanup - Database-Only SMTP Setup

## Overview
All email-related environment variables have been removed. SMTP configuration is now **exclusively stored in the database** using the SMTPConfig model. This prevents hardcoding sensitive credentials in environment files.

## Changes Made

### 1. **Removed Environment Variables**
   - ❌ `EMAIL_HOST` 
   - ❌ `EMAIL_PORT`
   - ❌ `EMAIL_USER`
   - ❌ `EMAIL_PASSWORD`

**Files Modified:**
- `src/config/env.ts` - Removed EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD variables
- `src/config/env.config.ts` - Removed email object configuration; added note that email config is database-managed

### 2. **Updated SMTP Service**
**File:** `src/modules/settings/service/smtp.service.ts`

Changes:
- Removed import of `ENV`
- Updated `getSMTPConfig()` to throw error if no database config found (no env fallback)
- Updated `testSMTPConnection()` to require database config only
- Updated `getSMTPTransporter()` to require database config only
- All fallbacks to env variables completely removed

**Error Handling:**
If SMTP config not found in database:
```
"SMTP configuration not found in database. Please configure SMTP settings in admin panel."
```

### 3. **Updated Email Services**

#### OTP Service (`src/utils/otp.ts`)
- Added helper function `getFromEmailConfig()` to fetch from email from database
- Updated functions:
  - `sendCourseApprovalEmail()`
  - `sendOTPEmail()`
  - `sendWelcomeEmail()`
  - `sendGuardianCredentialsEmail()`
  - `sendInstructorApprovalEmail()`
- All now use database config for `fromEmail` and `fromName`
- Removed dependency on `ENV.EMAIL_USER` and `ENV.FRONTEND_URL`

#### Job Email Service (`src/modules/job/service/emailService.ts`)
- Added import of `SMTPConfig` model
- Removed `ENV` dependency
- Updated `sendApplicationEmail()` to fetch from email from database

#### Order Service (`src/modules/order/service/order.service.ts`)
- Added import of `SMTPConfig` model
- Updated `sendOrderEmail()` private function:
  - Fetches SMTP config from database
  - Uses `fromEmail` from config
  - Uses admin email from SMTP config instead of ENV.EMAIL_USER

#### Order Controller (`src/modules/order/controller/order.controller.ts`)
- Updated `emailActionHandler()` route:
  - Fetches SMTP config for from email
  - Uses database config for admin email
- Updated `sendOrderEmail()` endpoint:
  - Fetches SMTP config from database
  - Removes `process.env.EMAIL_USER` dependency

### 4. **Database Configuration Flow**

All email sending now follows this pattern:

```
Email Function Called
    ↓
getSMTPTransporter() [from settings/smtp.service.ts]
    ↓
Query SMTPConfig.findOne({ isActive: true })
    ↓
Throw error if NOT found (no env fallback)
    ↓
Use config.host, config.port, config.user, config.password
    ↓
Send email with config.fromEmail and config.fromName
```

## Configuration Steps for Admins

1. **Access Settings Panel** → Admin Dashboard → Email Settings
2. **Configure SMTP:**
   - Host: (e.g., smtp.gmail.com)
   - Port: (e.g., 587 for TLS, 465 for SSL)
   - Username: (your email)
   - Password: (app-specific password)
   - From Email: (reply-to email address)
   - From Name: (display name like "Learn & Grow")

3. **Test Connection** → Click "Test SMTP" button
4. **Save Configuration** → System stores in database

## Security Benefits

✅ **No hardcoded credentials** in .env files
✅ **Centralized management** - admins can update without code changes
✅ **Runtime configuration** - change settings without redeployment
✅ **Audit trail** - database logs when config was changed
✅ **Separate credentials** - SMTP password never exposed in code or logs

## Error Handling

If SMTP configuration is missing:
- All email functions will throw: `"SMTP configuration not found in database. Please configure SMTP settings in admin panel."`
- This prevents silent failures
- Admins will see the error and know to configure SMTP

## Files Modified Summary

| File | Changes |
|------|---------|
| `src/config/env.ts` | Removed 4 EMAIL_* variables |
| `src/config/env.config.ts` | Removed email object |
| `src/modules/settings/service/smtp.service.ts` | Removed ENV import, removed all env fallbacks |
| `src/utils/otp.ts` | Added getFromEmailConfig(), updated 5 functions |
| `src/modules/job/service/emailService.ts` | Updated sendApplicationEmail() |
| `src/modules/order/service/order.service.ts` | Updated sendOrderEmail() private function |
| `src/modules/order/controller/order.controller.ts` | Updated 2 endpoints for email sending |

## Testing Checklist

- [x] Backend builds successfully
- [ ] Admin can configure SMTP settings via settings page
- [ ] Test email function works
- [ ] Order confirmation emails send correctly
- [ ] OTP emails send correctly
- [ ] Course approval emails send correctly
- [ ] Welcome emails send correctly
- [ ] Guardian credential emails send correctly
- [ ] Instructor approval emails send correctly

## Deployment Notes

1. Before deploying, ensure admin has configured SMTP in database
2. If deploying to new environment, SMTP config must be set up first
3. No environment variables needed for email - purely database-driven
4. Monitor logs for "SMTP configuration not found" errors during testing
