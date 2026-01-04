# API Contract Documentation

## Instructor Students Endpoint

### Endpoint Details
```
GET /api/users/instructor/students
```

### Authentication
- **Required:** Yes (JWT Bearer Token)
- **Role:** instructor
- **Header:** `Authorization: Bearer {accessToken}`

### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | number | No | 1 | Page number (1-indexed) |
| limit | number | No | 20 | Items per page |
| search | string | No | "" | Search by name or email |

### Request Examples

**Get first page of instructor's students:**
```bash
GET /api/users/instructor/students?page=1&limit=20
Authorization: Bearer {token}
```

**Search for specific student:**
```bash
GET /api/users/instructor/students?page=1&limit=20&search=john
Authorization: Bearer {token}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "role": "student",
      "profileImage": "https://...",
      "institution": "XYZ University",
      "isVerified": true,
      "isApproved": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T12:30:00Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "phone": "+1234567891",
      "role": "student",
      "profileImage": "https://...",
      "institution": "ABC College",
      "isVerified": true,
      "isApproved": true,
      "createdAt": "2024-01-05T00:00:00Z",
      "updatedAt": "2024-01-14T09:15:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### Error Responses

**401 Unauthorized (Not authenticated)**
```json
{
  "success": false,
  "message": "User not authenticated"
}
```

**403 Forbidden (Not instructor)**
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

**400 Bad Request**
```json
{
  "success": false,
  "message": "Failed to get students"
}
```

---

## User By ID Endpoint (Admin/Instructor)

### Endpoint Details
```
GET /api/users/admin/:id
```

### Authentication
- **Required:** Yes (JWT Bearer Token)
- **Role:** admin or manager
- **Header:** `Authorization: Bearer {accessToken}`

### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | User ID (ObjectId) |

### Request Example
```bash
GET /api/users/admin/6958a7ef8301f06366a6ec59
Authorization: Bearer {token}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "User retrieved",
  "data": {
    "_id": "6958a7ef8301f06366a6ec59",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "student",
    "profileImage": "https://...",
    "bio": "I love learning",
    "expertise": ["JavaScript", "React"],
    "qualification": "B.Tech",
    "institution": "MIT",
    "yearsOfExperience": 2,
    "isVerified": true,
    "isApproved": true,
    "googleId": "google_123456",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T12:30:00Z"
  }
}
```

### Error Responses

**404 Not Found**
```json
{
  "success": false,
  "message": "User not found"
}
```

**401 Unauthorized**
```json
{
  "success": false,
  "message": "User not authenticated"
}
```

**403 Forbidden**
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

---

## Frontend Integration

### Redux RTK Query Hooks

#### For Instructor Students
```typescript
import { useGetInstructorStudentsQuery } from "@/redux/api/userApi";

// Usage
const { data, isLoading, error } = useGetInstructorStudentsQuery({
  page: 1,
  limit: 20,
  search: "john"
});

const students = data?.data || [];
const pagination = data?.pagination || {};
```

#### For Student Details
```typescript
import { useGetUserByIdQuery } from "@/redux/api/userApi";

// Usage
const { data, isLoading, error } = useGetUserByIdQuery(studentId);
const student = data?.data;
```

---

## Data Field Reference

### User Data Structure
```typescript
interface IUser {
  _id: string;                    // MongoDB ObjectId
  name: string;                   // Full name
  phone: string;                  // Phone number
  email: string;                  // Email address
  password?: string;              // Not returned in API
  role: string;                   // "student" | "instructor" | "admin" | "manager"
  profileImage?: string;          // Profile picture URL
  bio?: string;                   // User biography
  expertise?: string[];           // List of expertise areas
  qualification?: string;         // Educational qualification
  institution?: string;           // School/University name
  yearsOfExperience?: number;     // Years of experience
  isVerified?: boolean;           // Email verified status
  isApproved?: boolean;           // Account approved status
  googleId?: string;              // Google OAuth ID
  createdAt?: Date;               // Account creation date
  updatedAt?: Date;               // Last update date
}
```

### Pagination Data Structure
```typescript
interface Pagination {
  page: number;                   // Current page (1-indexed)
  limit: number;                  // Items per page
  total: number;                  // Total items available
  totalPages: number;             // Total pages
}
```

---

## Implementation Notes

### Filtering Logic (Instructor Students)
- Backend finds all courses where `instructorId` matches the logged-in user
- Gets all enrollments for those courses
- Returns unique students from those enrollments with pagination

### Sorting
- Students are sorted by `createdAt` in descending order (newest first)
- Search is case-insensitive on name and email fields

### Sensitive Fields Excluded
The following fields are **never** returned by API endpoints:
- `password`
- `otp`
- `otpExpiresAt`
- `refreshToken`
- `verificationToken`

These are removed server-side using `.select("-password -otp ...")` in Mongoose queries.

---

## Rate Limiting

No specific rate limiting implemented. If needed in production, add:
- Request throttling per IP
- Rate limiting per authenticated user
- Maximum page size enforcement

---

## Caching Strategy

Redux RTK Query provides automatic caching:
- Data is cached and reused across components
- Use `invalidatesTags` on mutations to refresh stale data
- Default cache time: based on RTK Query configuration

---

## Future Enhancements

1. **Bulk Operations**
   - GET students in bulk with array of IDs
   - Filter by enrollment status

2. **Advanced Filtering**
   - Filter by enrollment date range
   - Filter by completion percentage
   - Filter by course

3. **Sorting Options**
   - Sort by name (A-Z or Z-A)
   - Sort by join date
   - Sort by completion percentage

4. **Export Functionality**
   - Export students list to CSV/PDF
   - Export student progress reports
