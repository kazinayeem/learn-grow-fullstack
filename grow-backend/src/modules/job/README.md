# Job Post Module

## Overview
The Job Post module handles all job posting operations including creating, updating, publishing, and managing job listings. This module provides comprehensive job management functionality with advanced filtering and search capabilities.

## Features
- ✅ Full CRUD operations for job posts
- ✅ Job publishing/unpublishing
- ✅ Advanced filtering (by department, job type, remote status)
- ✅ Pagination support
- ✅ Salary range management (optional)
- ✅ Remote position indicator
- ✅ Requirements tracking
- ✅ Job expiration dates

## Data Model

### Job Post Schema
```typescript
{
  title: string,                    // Job title (required, 3-200 chars)
  jobType: string,                  // Full-time | Part-time | Contract | Internship | Temporary
  department: string,               // Department name (required)
  location: string,                 // Job location (required)
  salaryRange: {                    // Optional salary information
    min: number,                    // Minimum salary
    max: number,                    // Maximum salary
    currency: string                // Currency code (default: USD)
  },
  description: string,              // Detailed job description (min 20 chars)
  requirements: string[],           // Array of job requirements (min 1 item)
  isPublished: boolean,             // Publication status (default: false)
  isRemote: boolean,                // Remote position flag (default: false)
  postedAt: Date,                   // Post creation date (auto-generated)
  expiresAt: Date,                  // Optional expiration date
  createdAt: Date,                  // Auto-generated
  updatedAt: Date                   // Auto-generated
}
```

## API Endpoints

### Base URL
All endpoints are prefixed with `/api/job`

### Endpoints

#### 1. Get All Job Posts
```
GET /get-all-jobs
```
**Query Parameters:**
- `department` (optional): Filter by department
- `jobType` (optional): Filter by job type
- `isRemote` (optional): Filter by remote status (true/false)
- `isPublished` (optional): Filter by publication status (true/false)
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "message": "Job posts retrieved successfully",
  "data": [...],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

#### 2. Get Published Job Posts
```
GET /get-published-jobs
```
Returns all published job posts sorted by posting date.

#### 3. Get Remote Job Posts
```
GET /get-remote-jobs
```
Returns all published remote job posts.

#### 4. Get Job Posts by Department
```
GET /get-jobs-by-department/:department
```
Returns all published job posts for a specific department.

#### 5. Get Single Job Post
```
GET /get-single-job/:id
```
**Parameters:**
- `id`: Job post MongoDB ObjectId (24 characters)

**Response:**
```json
{
  "success": true,
  "message": "Job post retrieved successfully",
  "data": {
    "_id": "...",
    "title": "Senior Full Stack Developer",
    "jobType": "Full-time",
    "department": "Engineering",
    "location": "New York, NY",
    "salaryRange": {
      "min": 120000,
      "max": 180000,
      "currency": "USD"
    },
    "description": "We are looking for...",
    "requirements": [
      "5+ years experience",
      "React & Node.js expertise"
    ],
    "isPublished": true,
    "isRemote": true,
    "postedAt": "2025-12-27T00:00:00.000Z"
  }
}
```

#### 6. Create Job Post
```
POST /create-job
```
**Request Body:**
```json
{
  "title": "Senior Full Stack Developer",
  "jobType": "Full-time",
  "department": "Engineering",
  "location": "New York, NY",
  "salaryRange": {
    "min": 120000,
    "max": 180000,
    "currency": "USD"
  },
  "description": "We are looking for an experienced full stack developer...",
  "requirements": [
    "5+ years of experience in web development",
    "Strong knowledge of React and Node.js",
    "Experience with MongoDB and TypeScript"
  ],
  "isPublished": false,
  "isRemote": true,
  "expiresAt": "2026-03-27T00:00:00.000Z"
}
```

**Validation Rules:**
- `title`: 3-200 characters, required
- `jobType`: Must be one of: Full-time, Part-time, Contract, Internship, Temporary
- `department`: 2-100 characters, required
- `location`: 2-200 characters, required
- `salaryRange`: Optional, min must be ≤ max if both provided
- `description`: Minimum 20 characters, required
- `requirements`: At least 1 requirement, required
- `isPublished`: Boolean, optional (default: false)
- `isRemote`: Boolean, optional (default: false)

#### 7. Update Job Post
```
PATCH /update-job/:id
```
**Parameters:**
- `id`: Job post MongoDB ObjectId

**Request Body:** (all fields optional)
```json
{
  "title": "Updated Title",
  "jobType": "Part-time",
  "isPublished": true
}
```

#### 8. Publish Job Post
```
PATCH /publish-job/:id
```
Sets `isPublished` to `true` for the specified job post.

#### 9. Unpublish Job Post
```
PATCH /unpublish-job/:id
```
Sets `isPublished` to `false` for the specified job post.

#### 10. Delete Job Post
```
DELETE /delete-job/:id
```
Permanently deletes a job post.

## Usage Examples

### Example 1: Create a Full-time Remote Job
```javascript
const response = await fetch('/api/job/create-job', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Backend Developer',
    jobType: 'Full-time',
    department: 'Engineering',
    location: 'Remote',
    salaryRange: {
      min: 80000,
      max: 120000,
      currency: 'USD'
    },
    description: 'We are seeking a talented backend developer...',
    requirements: [
      '3+ years Node.js experience',
      'MongoDB expertise',
      'RESTful API design'
    ],
    isRemote: true,
    isPublished: true
  })
});
```

### Example 2: Filter Remote Jobs
```javascript
const response = await fetch('/api/job/get-all-jobs?isRemote=true&isPublished=true&page=1&limit=20');
```

### Example 3: Get Engineering Department Jobs
```javascript
const response = await fetch('/api/job/get-jobs-by-department/Engineering');
```

## Project Structure
```
job/
├── controller/
│   └── job.controller.ts       # Request handlers
├── model/
│   └── jobPost.model.ts        # Mongoose schema and interface (moved from root)
├── routes/
│   └── job.route.ts            # Route definitions
├── schema/
│   └── job.schema.ts           # Zod validation schemas
├── service/
│   └── job.service.ts          # Business logic
├── index.ts                    # Module exports
└── README.md                   # This file
```

## Migration Notes
The original `jobPost.model.ts` has been enhanced with:
- Additional job types (Contract, Internship, Temporary)
- Department field
- Salary range with currency support
- Requirements array
- Remote position flag
- Publication status (replaces `isActive`)
- Expiration dates
- Timestamps
- Database indexes for performance

## Validation

All requests are validated using Zod schemas:
- **createJobPostSchema**: Validates job creation
- **updateJobPostSchema**: Validates job updates
- **jobPostIdSchema**: Validates MongoDB ObjectId
- **getJobPostsQuerySchema**: Validates query parameters

## Error Handling

All endpoints return standardized error responses:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

**Common Status Codes:**
- `200`: Success
- `201`: Created
- `404`: Not found
- `500`: Server error

## Database Indexes

The following indexes are created for optimal query performance:
- `{ isPublished: 1, postedAt: -1 }` - For published job listings
- `{ department: 1 }` - For department filtering
- `{ jobType: 1 }` - For job type filtering

## Future Enhancements
- [ ] Application tracking
- [ ] Email notifications for new postings
- [ ] Job post analytics
- [ ] Bookmark/favorite functionality
- [ ] Advanced search with full-text indexing
- [ ] Interview scheduling integration
- [ ] Applicant management system

## Best Practices

1. **Always validate input**: Use the provided Zod schemas
2. **Unpublished by default**: New jobs should be reviewed before publishing
3. **Set expiration dates**: Automatically close old postings
4. **Consistent requirements**: Use clear, actionable requirement statements
5. **Salary transparency**: Include salary ranges when possible

## Contributing
When adding new features:
1. Update the model if new fields are needed
2. Add corresponding Zod validation
3. Create service methods for business logic
4. Add controller handlers
5. Define routes with proper validation
6. Update this README

## License
Part of the Grow Backend project.
