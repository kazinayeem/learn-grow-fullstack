# 🌱 500 Live Classes Seeding - Quick Guide

## ⚡ Quick Start (3 Steps)

### Step 1: Start MongoDB
```bash
mongod
```
Wait for "waiting for connections on port 27017"

### Step 2: Go to Backend Folder
```bash
cd c:\Users\NAYEEM\OneDrive\Desktop\learn-grow-fullstack\grow-backend
```

### Step 3: Run Seeding
```bash
npm run db:seed-live-classes
```

---

## 📊 What Gets Created

✅ **500 Live Classes** with:
- Instructor: `6952577980ee5a7cebb59a74`
- Course: `6952bcab6b638e58891980ab`
- Mix of dates (past & future)
- Status: Scheduled, Completed, Cancelled
- 70% approved by default
- 60% of completed classes have recordings

---

## 📈 Expected Output

```
🔗 Connecting to MongoDB...
✅ Connected to MongoDB

📊 Existing live classes: 0

🌱 Seeding 500 live classes...
   Instructor ID: 6952577980ee5a7cebb59a74
   Course ID: 6952bcab6b638e58891980ab

  📝 Generated 50 classes...
  📝 Generated 100 classes...
  ...
  📝 Generated 500 classes...

💾 Inserting 500 classes into database...
✅ Successfully inserted 500 classes!

📊 Database Statistics:
   Total Classes: 500
   Scheduled: ~330-350
   Completed: ~100-120
   Cancelled: ~20-30
   Approved: ~350
   Pending Approval: ~150
   With Recordings: ~40-60

✅ Seeding complete!
```

---

## ✅ Verify in Application

After seeding completes:

1. **Open Browser:** `http://localhost:3000/instructor/live-classes/`
2. **You should see:**
   - 500 classes in pagination (10 per page)
   - All statuses, filters working
   - "Mark as Done" button works
   - "Add Recording Link" section for completed classes

3. **For Students:** `http://localhost:3000/student/all-live-classes/`
   - 100 classes per page
   - Green "📹 Recording Available" badges
   - Clickable "Watch Recording" links

---

## 🐛 Troubleshooting

| Error | Solution |
|-------|----------|
| `connect ECONNREFUSED` | MongoDB not running. Run `mongod` first |
| `Database already has X classes` | Type `y` to continue or delete classes first |
| `Instructor/Course ID not found` | IDs are correct in the script |
| Port 27017 already in use | Kill the process or use different port |

---

## 🔧 If You Need Different IDs

Edit the file: `grow-backend/seed-500-classes.js`

Change these lines:
```javascript
const INSTRUCTOR_ID = '6952577980ee5a7cebb59a74';
const COURSE_ID = '6952bcab6b638e58891980ab';
```

Then run again:
```bash
npm run db:seed-live-classes
```

---

## 📝 Notes

- ✅ Uses your actual Instructor and Course IDs
- ✅ Creates realistic data with dates ±30 days
- ✅ Includes recordings for some completed classes
- ✅ All approvals handled automatically
- ✅ Takes about 30-60 seconds to complete

---

**That's it! Seeding will create 500 classes in your database.** 🚀
