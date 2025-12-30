# Email Notification History Feature

## Overview
Added an interactive email history view to the registrations page. Admins can now click on the notification status (Sent/Pending) to see detailed email history for each registrant.

---

## Features

### 1. Clickable Notification Status
- The **Notification column** on the registrations table is now clickable
- Green "Sent" chip = Emails have been sent
- Yellow "Pending" chip = No emails sent yet
- Hovering shows the chip is clickable (opacity change)

### 2. Email History Modal
When you click on a notification status, a modal opens showing:

**Header:**
- Registrant's full name
- Email address

**Email History Section:**
- Shows each email sent with:
  - ✅ Status indicator (green checkmark for sent)
  - Email number (Email 1, Email 2, etc.)
  - **Subject**: The email subject line
  - **Sent At**: Exact date & time email was sent
  - **View Content**: Expandable section to view the actual email content sent

**Status Summary:**
- Shows "Emails Sent" or "Pending" status
- Shows total count of emails sent to that registrant

**Empty State:**
- If no emails sent: Shows "No emails sent to this registrant yet" message

---

## How to Use

### For Admins:

1. **Go to Registrations Page:**
   - Navigate to: `http://localhost:3000/admin/events/[eventId]/registrations/`

2. **View Notification Status:**
   - Look at the "NOTIFICATION" column
   - See "Sent" (green) or "Pending" (yellow) status

3. **Click on Notification Status:**
   - Click any chip in the NOTIFICATION column
   - Modal opens showing email history for that registrant

4. **View Email Details:**
   - See all emails sent to that person
   - View subject lines
   - See exact sent timestamps
   - Click "View Content" to see the actual email HTML

5. **Close Modal:**
   - Click the "Close" button to dismiss
   - Click outside to close (if applicable)

---

## Example Email History Modal

```
┌─────────────────────────────────────────────┐
│ Email History - John Doe                    │
├─────────────────────────────────────────────┤
│                                              │
│ Email Address: john@example.com             │
│                                              │
│ ═══════════════════════════════════════════│
│ Email History                               │
│                                              │
│ ✅ Email 1 - Sent                          │
│    Subject: Event Invitation                │
│    Sent At: 12/30/2025, 10:30:15 AM       │
│    ▶ View Content                          │
│                                              │
│ ✅ Email 2 - Sent                          │
│    Subject: Meeting Link Update             │
│    Sent At: 12/30/2025, 2:45:22 PM        │
│    ▶ View Content                          │
│                                              │
│ ═══════════════════════════════════════════│
│ ● Status: Emails Sent                       │
│   Total emails sent: 2                      │
│                                              │
│                            [Close]          │
└─────────────────────────────────────────────┘
```

---

## UI Components Used

- **Modal** - Displays email history details
- **Chip** - Shows status (Sent/Pending), clickable
- **Icons** - FaCheckCircle (✅), FaClock (⏰), FaEnvelope (✉️)
- **Details Tag** - Expandable "View Content" section
- **Colors:**
  - Green (#10B981) for "Sent"
  - Yellow (#F59E0B) for "Pending"

---

## Data Structure

Email history is stored in the database as:
```javascript
{
  _id: ObjectId,
  fullName: "John Doe",
  email: "john@example.com",
  notificationSent: true,
  emailHistory: [
    {
      subject: "Event Invitation",
      content: "<p>HTML email content...</p>",
      sentAt: "2025-12-30T10:30:15.000Z"
    },
    {
      subject: "Meeting Link Update",
      content: "<p>HTML email content...</p>",
      sentAt: "2025-12-30T14:45:22.000Z"
    }
  ]
}
```

---

## What Changed

### Files Modified:
1. `learn-grow/app/admin/events/[id]/registrations/page.tsx`

### New State:
- `selectedEmailHistory` - Stores the registration selected for history view
- `historyIsOpen` - Controls email history modal visibility
- `historyOnOpen` / `historyOnClose` - Modal open/close handlers

### New Function:
- `handleViewEmailHistory()` - Opens modal with selected registrant's email history

### New Modal:
- Email History Modal showing complete history with expandable content

### Updated UI:
- Notification column is now clickable (wrapped in button)
- Added hover effect to show it's clickable
- New modal displays with detailed email information

---

## Features at a Glance

✅ **Click notification status to see history**  
✅ **Shows all emails sent to each registrant**  
✅ **View email subject & exact timestamp**  
✅ **Expandable email content preview**  
✅ **Shows total email count per registrant**  
✅ **Status indicator (Sent/Pending)**  
✅ **Clean, organized modal design**  
✅ **Scrollable for long histories**  
✅ **Empty state for no emails**  

---

## Status Meanings

- **Sent (Green)** = At least one email has been sent to this registrant
- **Pending (Yellow)** = No emails have been sent to this registrant yet

---

## Notes

- Email history is automatically populated when bulk emails are sent
- Each email record includes the full HTML content that was sent
- Timestamps are precise (including milliseconds)
- Modal supports scrolling for long email histories
- Email content is displayed as-is (HTML rendered)

