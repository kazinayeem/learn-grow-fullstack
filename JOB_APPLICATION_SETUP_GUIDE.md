# Job Application System - Setup & Usage Guide

## Quick Start

### 1. Seed 20+ Jobs

Run the following command in the backend directory to populate the database with 20+ job listings:

```bash
cd grow-backend
npm run db:seed-jobs
```

**Expected Output:**
```
🌱 Starting job posts seeding...
🗑️  Deleted X existing job posts
✅ Successfully seeded 24 job posts

📊 Job Posts Summary:
  - Total: 24
  - Published: 23
  - Unpublished: 1
  - Remote: 13
  - On-site: 11

📂 Jobs by Department:
  - Engineering: 10
  - Marketing: 2
  - Design: 1
  - Analytics: 1
  - Product: 1
  - Customer Success: 1
  - AI/ML: 1
  - Infrastructure: 1
  - Security: 1
  - Business Operations: 1
  - Project Management: 1
  - Sales: 1
  - HR: 1

✨ Seeding completed successfully!
```

### 2. Test the Application

After seeding, you can test the job application system:

#### **For Users (No Login Required)**

1. **Open Careers Page:**
   - Navigate to: `http://localhost:3000/careers/`
   
2. **Browse Jobs:**
   - See all published jobs listed
   - Click "View Details" on any job
   
3. **Apply Without Login:**
   - Click "Apply Now" button
   - You'll see a confirmation screen explaining what's needed
   - Click "Continue to Form"
   - Fill in your information:
     - Full Name (required)
     - Email (required)
     - Phone (required)
     - LinkedIn Profile (optional)
     - Resume Upload (required - PDF/DOC/DOCX, max 5MB)
     - Additional Information (optional)
   - Click "Submit Application"
   - See success message!

#### **For Admins (View Applications)**

1. **Open Admin Panel:**
   - Navigate to: `http://localhost:3000/admin/jobs/`
   
2. **View Applications:**
   - Click "View Applications" button
   - Or go directly to: `http://localhost:3000/admin/jobs/applications/`
   
3. **Search & Filter:**
   - Use search box to find applicants by name, email, or job title
   - Use status dropdown to filter applications
   
4. **Manage Applications:**
   - Click "View" to see full application details
   - Click "Delete" to remove an application
   - Update application status in the details modal

## Available Jobs (24 Total)

### Engineering (10 jobs)
- Senior Full Stack Developer (Remote, Full-time) - $120k-$180k
- Frontend Developer (San Francisco, Full-time) - $90k-$140k
- Backend Engineer (Austin, Full-time) - $100k-$150k
- DevOps Engineer (Seattle, Full-time) - $110k-$160k
- Mobile App Developer iOS (San Francisco, Full-time) - $100k-$160k
- Android Developer (Austin, Full-time) - $95k-$150k
- QA Engineer (Boston, Full-time) - $70k-$105k
- Cloud Engineer (Seattle, Full-time) - $105k-$155k
- Database Administrator (Chicago, Full-time) - $85k-$130k
- Junior Software Developer (Denver, Internship) - $50k-$65k

### Marketing & Sales (3 jobs)
- Marketing Manager (Los Angeles, Full-time) - $80k-$120k
- Content Writer (Remote, Part-time) - $40k-$60k
- Sales Executive (Los Angeles, Full-time) - $60k-$120k

### Design (1 job)
- UX/UI Designer (Remote, Contract) - $70k-$110k

### Data & Analytics (2 jobs)
- Data Analyst (Chicago, Full-time) - $75k-$105k
- Machine Learning Engineer (San Francisco, Full-time) - $130k-$190k

### Product & Management (3 jobs)
- Product Manager (Boston, Full-time) - $95k-$140k
- Solutions Architect (New York, Full-time) - $130k-$180k
- Project Manager (Denver, Full-time) - $80k-$120k

### Operations & Support (2 jobs)
- Customer Success Manager (Miami, Part-time) - $55k-$75k
- Business Analyst (Chicago, Full-time) - $75k-$115k

### Specialized (2 jobs)
- Security Engineer (Boston, Full-time) - $115k-$165k
- Technical Recruiter (New York, Full-time) - $60k-$95k

## File Structure Changes

### Backend Files
```
grow-backend/
├── src/modules/job/
│   ├── model/
│   │   ├── jobPost.model.ts
│   │   └── jobApplication.model.ts ✅
│   ├── schema/
│   │   ├── job.schema.ts
│   │   └── jobApplication.schema.ts ✅
│   ├── service/
│   │   ├── job.service.ts
│   │   └── jobApplication.service.ts ✅
│   ├── controller/
│   │   ├── job.controller.ts
│   │   └── jobApplication.controller.ts ✅
│   ├── routes/
│   │   └── job.route.ts ✅ (Updated)
│   ├── seed/
│   │   └── seedJobs.ts ✅ (Updated with 20+ jobs)
│   └── index.ts ✅ (Updated)
└── package.json ✅ (Added db:seed-jobs script)
```

### Frontend Files
```
learn-grow/
├── app/
│   ├── careers/
│   │   └── [id]/
│   │       └── page.tsx ✅ (Updated)
│   └── admin/jobs/
│       ├── page.tsx ✅ (Updated)
│       └── applications/
│           └── page.tsx ✅ (New)
├── components/
│   └── JobApplicationForm.tsx ✅ (Updated - 2-step form)
└── redux/api/
    └── jobApi.ts ✅ (Updated)
```

## How It Works

### Application Flow (No Login Required)

```
User visits /careers/ 
    ↓
Selects a job and clicks "View Details"
    ↓
Clicks "Apply Now" button
    ↓
Sees confirmation screen (Step 1)
    ↓
Clicks "Continue to Form" button
    ↓
Fills in application form (Step 2):
  - Full Name
  - Email
  - Phone
  - LinkedIn (optional)
  - Resume (file upload)
  - Additional Info (optional)
    ↓
Clicks "Submit Application"
    ↓
Application sent to backend without login
    ↓
User sees success message
```

### Admin Review Flow

```
Admin visits /admin/jobs/
    ↓
Clicks "View Applications" button
    ↓
Sees all applications in a table
    ↓
Can:
  - Search by name, email, or job title
  - Filter by status (pending, reviewed, etc.)
  - Click "View" to see full details
  - Update status in modal
  - Delete applications
  - Download resume
```

## API Endpoints (All Public - No Auth Required)

### Job Applications
```
POST   /api/job/apply                          - Submit application
GET    /api/job/applications                   - Get applications
GET    /api/job/applications/:id               - Get application details
PATCH  /api/job/applications/:id/status        - Update status
DELETE /api/job/applications/:id               - Delete application
```

## Testing the System

### Manual Testing Checklist

- [ ] Run `npm run db:seed-jobs` in backend
- [ ] Visit `/careers/` - see 23 published jobs
- [ ] Click "View Details" on a job
- [ ] Click "Apply Now" without logging in
- [ ] Go through both form steps
- [ ] Submit application with valid data
- [ ] See success message
- [ ] Try with invalid resume (too large, wrong format)
- [ ] Try submitting twice with same email (should fail)
- [ ] Go to `/admin/jobs/applications/`
- [ ] See the application you just submitted
- [ ] Search for your application
- [ ] Filter by "pending" status
- [ ] Click "View" and see all your details
- [ ] Change status to "reviewed"
- [ ] Delete the application

### Sample Test Data

**Applicant 1:**
- Name: John Doe
- Email: john.doe@example.com
- Phone: +1-555-123-4567
- LinkedIn: https://linkedin.com/in/johndoe
- Resume: (any PDF/DOC file)
- Additional: "Very interested in this role"

**Applicant 2:**
- Name: Jane Smith
- Email: jane.smith@example.com
- Phone: +1-555-987-6543
- LinkedIn: (leave blank)
- Resume: (any PDF file)
- Additional: (leave blank)

## Troubleshooting

### Seed Command Fails

**Issue:** "Command not found" when running `npm run db:seed-jobs`

**Solution:**
1. Make sure you're in the `grow-backend` directory
2. Run `npm install` first
3. Check that Node.js 18+ is installed: `node --version`

### Resume Upload Issues

**Issue:** "Only PDF and DOC files are allowed"

**Solution:** 
- Make sure file is actually PDF or DOCX
- Check file extension (.pdf, .doc, .docx)

**Issue:** "File size must be less than 5MB"

**Solution:**
- Compress the PDF/document file
- Use online tools to reduce file size

### Application Already Submitted

**Issue:** "You have already applied for this job"

**Solution:**
- This is intentional - prevents duplicate applications from same email
- Use a different email address to test again
- Or delete the previous application from admin panel

### Job Not Appearing

**Issue:** Job doesn't show on careers page after seeding

**Solution:**
- Make sure the job has `isPublished: true`
- All 23 seeded jobs are published (only 1 is unpublished for testing)
- Refresh the page (browser cache)

## Performance Metrics

- **Jobs Seeded:** 24 (23 published, 1 unpublished)
- **Departments:** 13
- **Remote Jobs:** 13 (54%)
- **On-site Jobs:** 11 (46%)
- **Job Types:** Full-time, Part-time, Contract, Internship
- **Salary Range:** $40k-$190k USD

## Next Steps (Optional Features)

1. **File Storage**: Integrate AWS S3 or similar for real resume uploads
2. **Email Notifications**: Send confirmations to applicants and admins
3. **Bulk Seeding**: Add more diverse jobs (healthcare, finance, etc.)
4. **Export**: Add CSV export for applications
5. **Interview Scheduling**: Calendar integration
6. **Interview Questions**: Add standard questions per position
7. **Scoring System**: Auto-score applications based on keywords
8. **Email Verification**: Verify applicant email before accepting

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the API documentation
3. Check console logs for error messages
4. Ensure MongoDB is running and connected
5. Clear browser cache and cookies
