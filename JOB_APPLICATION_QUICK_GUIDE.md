# Job Application System - Quick Reference Guide

## For Users (Careers Page)

### Applying for a Job
1. Navigate to `http://localhost:3000/careers/`
2. Browse available job listings
3. Click "View Details" on a job posting
4. Click the "Apply Now" button
5. Fill in the application form:
   - Full Name
   - Email Address
   - Phone Number
   - Upload Resume (PDF, DOC, or DOCX, max 5MB)
   - LinkedIn Profile (optional)
   - Additional Information (optional)
6. Click "Submit Application"
7. You'll see a success message confirming your application

## For Admins (Admin Panel)

### Accessing Applications
1. Go to Admin Panel: `http://localhost:3000/admin/jobs/`
2. Click "View Applications" button (secondary button)
3. Or navigate directly to: `http://localhost:3000/admin/jobs/applications/`

### Managing Applications

#### Searching & Filtering
- Use the search box to find applicants by:
  - Full name
  - Email address
  - Job title
- Use the Status dropdown to filter by:
  - All Applications
  - Pending Review
  - Reviewed
  - Shortlisted
  - Rejected
  - Accepted

#### Viewing Application Details
1. Click "View" button on any application row
2. Modal opens showing:
   - Contact information (name, email, phone)
   - Position details
   - LinkedIn profile link (if provided)
   - Resume download option
   - Additional information
   - Current status

#### Updating Application Status
1. In the details modal, use the "Update Status" dropdown
2. Select new status:
   - Pending Review - Initial submission state
   - Reviewed - You've reviewed the application
   - Shortlisted - Moving forward with candidate
   - Rejected - Not a good fit
   - Accepted - Making an offer
3. Status updates automatically

#### Deleting Applications
1. Click "Delete" button on application row, OR
2. Open details modal and use the delete button
3. Application and all associated data will be removed

#### Refreshing Data
- Click "Refresh" button to reload the latest applications

## API Endpoints Reference

### For Frontend Developers

**Apply for Job**
```typescript
const [applyForJob] = useApplyForJobMutation();

await applyForJob({
  jobId: "job-id-here",
  fullName: "John Doe",
  email: "john@example.com",
  phone: "+1-555-0000",
  resumeUrl: "https://...",
  linkedinProfile: "https://linkedin.com/in/johndoe", // optional
  additionalInfo: "Excited about this opportunity..." // optional
});
```

**Get Applications**
```typescript
const { data, isLoading } = useGetApplicationsQuery({
  status: "pending", // optional: pending, reviewed, shortlisted, rejected, accepted
  page: 1,
  limit: 10
});
```

**Update Status**
```typescript
const [updateStatus] = useUpdateApplicationStatusMutation();

await updateStatus({
  id: "application-id",
  status: "shortlisted"
});
```

## Database Schema

### JobApplication Document
```json
{
  "_id": ObjectId,
  "jobId": ObjectId(ref: JobPost),
  "userId": ObjectId(ref: User) | null,
  "email": "applicant@example.com",
  "fullName": "John Doe",
  "phone": "+1-555-0000",
  "resumeUrl": "https://storage.example.com/resume.pdf",
  "linkedinProfile": "https://linkedin.com/in/johndoe" | null,
  "additionalInfo": "Cover letter or additional notes" | null,
  "status": "pending" | "reviewed" | "shortlisted" | "rejected" | "accepted",
  "appliedAt": ISODate("2024-01-15T10:30:00Z"),
  "createdAt": ISODate("2024-01-15T10:30:00Z"),
  "updatedAt": ISODate("2024-01-15T10:30:00Z")
}
```

## Status Flow

Recommended workflow:
```
pending (User applies)
   ↓
reviewed (Admin reviews application)
   ↓
shortlisted (Move to next round) → rejected (Not selected)
   ↓
accepted (Extend offer)
```

## File Structure

### Backend
```
grow-backend/src/modules/job/
├── model/
│   ├── jobPost.model.ts
│   └── jobApplication.model.ts (NEW)
├── schema/
│   ├── job.schema.ts
│   └── jobApplication.schema.ts (NEW)
├── service/
│   ├── job.service.ts
│   └── jobApplication.service.ts (NEW)
├── controller/
│   ├── job.controller.ts
│   └── jobApplication.controller.ts (NEW)
├── routes/
│   └── job.route.ts (UPDATED)
└── index.ts (UPDATED)
```

### Frontend
```
learn-grow/
├── app/
│   ├── careers/
│   │   └── [id]/
│   │       └── page.tsx (UPDATED)
│   └── admin/jobs/
│       ├── page.tsx (UPDATED)
│       └── applications/
│           └── page.tsx (NEW)
├── components/
│   └── JobApplicationForm.tsx (NEW)
└── redux/api/
    └── jobApi.ts (UPDATED)
```

## Common Issues & Solutions

### Issue: Resume file won't upload
- **Solution**: Check file size (max 5MB), file type (PDF/DOC/DOCX only)

### Issue: Duplicate application error
- **Solution**: Each email can only apply once per job. Users need to use a different email or delete the previous application.

### Issue: Admin can't update status
- **Solution**: Ensure you're logged in as admin. Status updates require admin authentication.

### Issue: Resume link broken
- **Solution**: Currently uses placeholder URLs. Implement cloud storage (S3, etc.) for persistent storage.

## Future Improvements

- [ ] Implement actual file storage (AWS S3, Google Cloud Storage)
- [ ] Add email notifications to applicants
- [ ] Send admin alerts for new applications
- [ ] Add bulk status updates
- [ ] Create offer management system
- [ ] Interview scheduling integration
- [ ] Applicant communication history
- [ ] Export applications to CSV/Excel
- [ ] Advanced filtering (date range, salary range, etc.)
- [ ] Resume parsing to auto-fill details

