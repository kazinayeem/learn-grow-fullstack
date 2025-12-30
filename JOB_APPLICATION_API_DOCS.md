# Job Application API Documentation

## Base URL
```
http://localhost:5000/api
```

## Job Application Endpoints

### 1. Submit Job Application
**Endpoint:** `POST /job/apply`

**Request Body:**
```json
{
  "jobId": "507f1f77bcf86cd799439011",
  "email": "applicant@example.com",
  "fullName": "John Doe",
  "phone": "+1-555-123-4567",
  "resumeUrl": "https://storage.example.com/resume.pdf",
  "linkedinProfile": "https://linkedin.com/in/johndoe",
  "additionalInfo": "I'm very interested in this position..."
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "jobId": "507f1f77bcf86cd799439011",
    "email": "applicant@example.com",
    "fullName": "John Doe",
    "phone": "+1-555-123-4567",
    "status": "pending",
    "appliedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Cases:**
- 400: User already applied for this job
- 404: Job not found
- 500: Server error

---

### 2. Get All Applications
**Endpoint:** `GET /job/applications`

**Query Parameters:**
```
?jobId=507f1f77bcf86cd799439011  // optional
&status=pending                  // optional: pending, reviewed, shortlisted, rejected, accepted
&page=1                          // optional (default: 1)
&limit=10                        // optional (default: 10)
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Applications retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "jobId": {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Senior Developer",
        "department": "Engineering",
        "jobType": "Full-time",
        "location": "Remote"
      },
      "email": "applicant@example.com",
      "fullName": "John Doe",
      "phone": "+1-555-123-4567",
      "status": "pending",
      "appliedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

---

### 3. Get Application by ID
**Endpoint:** `GET /job/applications/:id`

**URL Parameters:**
```
:id - Application MongoDB ObjectId
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Application retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "jobId": {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Senior Developer",
      "description": "We're looking for...",
      "requirements": ["Node.js", "React", "MongoDB"]
    },
    "email": "applicant@example.com",
    "fullName": "John Doe",
    "phone": "+1-555-123-4567",
    "resumeUrl": "https://storage.example.com/resume.pdf",
    "linkedinProfile": "https://linkedin.com/in/johndoe",
    "additionalInfo": "Cover letter text...",
    "status": "pending",
    "appliedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 4. Get Applications by Job ID
**Endpoint:** `GET /job/applications/by-job/:jobId`

**URL Parameters:**
```
:jobId - Job posting MongoDB ObjectId
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Applications retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "jobId": {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Senior Developer"
      },
      "email": "applicant1@example.com",
      "fullName": "John Doe",
      "status": "pending",
      "appliedAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "jobId": {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Senior Developer"
      },
      "email": "applicant2@example.com",
      "fullName": "Jane Smith",
      "status": "reviewed",
      "appliedAt": "2024-01-14T15:20:00.000Z"
    }
  ]
}
```

---

### 5. Update Application Status
**Endpoint:** `PATCH /job/applications/:id/status`

**URL Parameters:**
```
:id - Application MongoDB ObjectId
```

**Request Body:**
```json
{
  "status": "shortlisted"
}
```

**Valid Status Values:**
- `pending` - Initial submission
- `reviewed` - Admin has reviewed
- `shortlisted` - Moving forward with candidate
- `rejected` - Declined
- `accepted` - Offer extended

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Application status updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "jobId": "507f1f77bcf86cd799439011",
    "email": "applicant@example.com",
    "fullName": "John Doe",
    "status": "shortlisted",
    "appliedAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T14:45:00.000Z"
  }
}
```

---

### 6. Delete Application
**Endpoint:** `DELETE /job/applications/:id`

**URL Parameters:**
```
:id - Application MongoDB ObjectId
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Application deleted successfully"
}
```

**Error Cases:**
- 404: Application not found
- 500: Server error

---

### 7. Get Application Statistics
**Endpoint:** `GET /job/applications/stats/overview`

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Application stats retrieved successfully",
  "data": [
    {
      "_id": "pending",
      "count": 12
    },
    {
      "_id": "reviewed",
      "count": 8
    },
    {
      "_id": "shortlisted",
      "count": 5
    },
    {
      "_id": "rejected",
      "count": 3
    },
    {
      "_id": "accepted",
      "count": 2
    }
  ]
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "You have already applied for this job"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Application not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to submit application",
  "error": "Error details here"
}
```

---

## Request/Response Headers

**Required Headers:**
```
Content-Type: application/json
```

**For Protected Routes:**
```
Authorization: Bearer <jwt-token>
```

---

## Data Validation Rules

### Job Application Submission

| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| jobId | String | Yes | Must be valid MongoDB ObjectId (24 chars) |
| email | String | Yes | Must be valid email format |
| fullName | String | Yes | Min 2, Max 100 characters |
| phone | String | Yes | Min 7, Max 20 characters |
| resumeUrl | String | Yes | Must be valid URL |
| linkedinProfile | String | No | Must be valid URL if provided |
| additionalInfo | String | No | Max 2000 characters |

---

## Example cURL Requests

### Submit Application
```bash
curl -X POST http://localhost:5000/api/job/apply \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "507f1f77bcf86cd799439011",
    "email": "john@example.com",
    "fullName": "John Doe",
    "phone": "+1-555-123-4567",
    "resumeUrl": "https://example.com/resume.pdf"
  }'
```

### Get All Applications
```bash
curl -X GET "http://localhost:5000/api/job/applications?status=pending&page=1&limit=10"
```

### Update Status
```bash
curl -X PATCH http://localhost:5000/api/job/applications/507f1f77bcf86cd799439012/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "shortlisted"
  }'
```

### Delete Application
```bash
curl -X DELETE http://localhost:5000/api/job/applications/507f1f77bcf86cd799439012
```

---

## Rate Limiting
Currently not implemented. Consider adding for production use.

## Authentication
Currently endpoints are public. Consider adding authentication middleware for admin operations.

## Pagination
- Default page: 1
- Default limit: 10
- Max limit: 100
