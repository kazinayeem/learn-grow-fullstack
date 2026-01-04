# ⚡ Ticket System - Quick Start Guide

## 🚀 Getting Started in 3 Minutes

### Step 1: Start Servers

**Terminal 1 - Backend:**
```bash
cd grow-backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd learn-grow
npm run dev
```

### Step 2: Access Admin Dashboard

Open browser: `http://localhost:3000/admin`

### Step 3: Navigate to Tickets

Click "Tickets" in the sidebar (or visit `http://localhost:3000/admin/tickets`)

---

## 🎫 Creating Your First Ticket

1. Click the **"Create Ticket"** button (top right)
2. Fill in the form:
   - **Title**: "Test ticket system"
   - **Description**: Use the rich text editor to write "Testing the new ticket system"
   - **Priority**: Select "Medium"
   - **Category**: Select "Technical"
3. Click **"Create Ticket"**

✅ Your first ticket is created!

---

## 📝 Adding a Reply

1. Click on your ticket from the list
2. Scroll to the **"Add Reply"** section at the bottom
3. Type your reply in the rich text editor
4. Click **"Send Reply"**

✅ Reply added!

---

## 🔄 Changing Ticket Status

**Note**: Only admins and managers can change status

1. Open any ticket
2. Find the **"Update Status"** dropdown
3. Select new status:
   - Open → In Progress
   - In Progress → Solved
   - Solved → Closed
4. Status changes automatically

✅ Status updated!

---

## 🖼️ Adding Images/Videos

### Images:
1. In ticket description or reply, type your text
2. In **"Image URL"** field, paste: `https://via.placeholder.com/600x400`
3. Submit - image will appear in the ticket

### Videos (YouTube):
1. Copy YouTube URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
2. Paste in **"Video URL"** field
3. Submit - video embeds automatically

---

## 🎨 Navigation Tips

### Sidebar Links:
- **Dashboard** - Overview stats
- **Tickets** (🔴 8) - Support tickets with badge counter
- **Students** - Manage students
- **Instructors** - Approve instructors
- **Managers** - Manage support managers
- **Courses** - Course management
- **Live Classes** - Live session management
- **Analytics** - Platform analytics
- **Settings** - Configuration

### Ticket Filters:
- **All Tickets** - Show everything
- **Open** - New tickets
- **In Progress** - Being worked on
- **Solved** - Resolved
- **Closed** - Completed

---

## 🎯 Quick Actions

### From Dashboard:
1. Click **"Support Tickets"** quick action card
2. See badge showing open ticket count
3. Access any management section with one click

### From Tickets Page:
- Filter by status (tabs at top)
- Create new ticket (button top right)
- View statistics (4 cards showing counts)
- Click any ticket card to open details

---

## 🔐 Permission Quick Reference

| Action | Admin | Manager | Instructor | Student |
|--------|-------|---------|------------|---------|
| Create ticket | ✅ | ✅ | ✅ | ✅ |
| View own tickets | ✅ | ✅ | ✅ | ✅ |
| View all tickets | ✅ | ❌ | ❌ | ❌ |
| View assigned tickets | ✅ | ✅ | ❌ | ❌ |
| Add replies | ✅ | ✅ | ✅ | ✅ |
| Change status | ✅ | ✅ | ❌ | ❌ |
| Assign to manager | ✅ | ❌ | ❌ | ❌ |
| Delete ticket | ✅ | ❌ | ❌ | ❌ |

---

## 🎨 Understanding Color Codes

### Status Colors:
- 🔵 **Blue** = Open (new ticket)
- 🟠 **Orange** = In Progress (being handled)
- 🟢 **Green** = Solved (resolved)
- ⚫ **Gray** = Closed (completed)

### Priority Colors:
- ⚫ **Gray** = Low priority
- 🔵 **Blue** = Medium priority
- 🟠 **Orange** = High priority
- 🔴 **Red** = Urgent priority

---

## ⚡ Pro Tips

### 1. Rich Text Editor
- Use **headings** to organize long descriptions
- Use **bold** for important points
- Use **code blocks** for error messages
- Use **lists** for step-by-step issues

### 2. Priority Selection
- **Low**: Minor issues, cosmetic bugs
- **Medium**: Regular support questions
- **High**: Important functionality issues
- **Urgent**: System down, critical bugs

### 3. Category Selection
- **Technical**: Bugs, errors, technical problems
- **Billing**: Payment, subscription issues
- **Course**: Course content problems
- **Account**: Login, profile issues
- **Other**: Everything else

### 4. Efficient Management
- Use **status filters** to focus on active tickets
- Reply quickly to keep conversations moving
- Change status when work starts (Open → In Progress)
- Close tickets only when completely resolved

---

## 🐛 Troubleshooting

### "Tickets API returns 404"
**Solution**: Restart backend server
```bash
cd grow-backend
npm run dev
```

### "Can't see create ticket button"
**Solution**: Make sure you're logged in as admin, manager, instructor, or student

### "Rich text editor not showing"
**Solution**: Refresh the page, editor loads dynamically

### "Can't change ticket status"
**Solution**: Only admins and managers can change status

---

## 📚 Learn More

- **Full Documentation**: See `TICKET_SYSTEM_GUIDE.md`
- **Implementation Details**: See `TICKET_SYSTEM_SUMMARY.md`
- **API Reference**: Check backend controller comments

---

## ✅ Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Logged in as admin
- [ ] Navigated to /admin/tickets
- [ ] Created first test ticket
- [ ] Added a reply
- [ ] Changed ticket status
- [ ] Tested image URL
- [ ] Tested video URL
- [ ] Filtered tickets by status

---

## 🎉 You're Ready!

You now have a fully functional ticket management system. Start creating tickets and managing support efficiently!

**Questions?** Check the full guide: `TICKET_SYSTEM_GUIDE.md`

---

**Built with ❤️ for Learn & Grow Platform**
