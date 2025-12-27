# Course Module - Frontend Integration Guide

## Base URL
All API endpoints are prefixed with `/api/course`

### Example Full URLs
```
http://localhost:5000/api/course/get-all-courses
http://localhost:5000/api/course/get-course/60d5ec49c1234567890abcd1
```

---

## COURSE ENDPOINTS

### 1. Create Course
```http
POST /api/course/create-course
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Complete React Masterclass",
  "description": "Learn React from basics to advanced concepts with real-world projects and best practices.",
  "category": "Web Development",
  "price": 99.99,
  "discountPrice": 49.99,
  "thumbnail": "https://example.com/thumbnail.jpg",
  "level": "Intermediate",
  "language": "English",
  "duration": 40,
  "instructorId": "60d5ec49c1234567890abcd1",
  "tags": ["react", "javascript", "frontend"],
  "learningOutcomes": [
    "Build modern React applications",
    "Master hooks and state management",
    "Deploy React apps to production"
  ],
  "prerequisites": [
    "Basic JavaScript knowledge",
    "HTML and CSS fundamentals"
  ],
  "isPublished": false,
  "isFeatured": false
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Course created successfully",
  "data": {
    "_id": "60d5ec49c1234567890abcd1",
    "title": "Complete React Masterclass",
    "description": "Learn React from basics to advanced concepts...",
    "category": "Web Development",
    "price": 99.99,
    "discountPrice": 49.99,
    "level": "Intermediate",
    "language": "English",
    "duration": 40,
    "instructorId": "60d5ec49c1234567890abcd1",
    "rating": 0,
    "ratingsCount": 0,
    "studentsEnrolled": 0,
    "isPublished": false,
    "isFeatured": false,
    "createdAt": "2025-12-27T00:00:00.000Z",
    "updatedAt": "2025-12-27T00:00:00.000Z"
  }
}
```

---

### 2. Get All Courses (with Filtering & Pagination)
```http
GET /api/course/get-all-courses?category=Web%20Development&level=Intermediate&page=1&limit=10
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | string | Filter by course category |
| `level` | string | Filter by level (Beginner/Intermediate/Advanced) |
| `isPublished` | boolean | Filter by publication status (true/false) |
| `isFeatured` | boolean | Filter by featured status (true/false) |
| `instructorId` | string | Filter by instructor ID |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10, max: 100) |

**Example Requests:**
```javascript
// Get all published courses
fetch('/api/course/get-all-courses?isPublished=true')

// Get intermediate web development courses
fetch('/api/course/get-all-courses?category=Web%20Development&level=Intermediate')

// Get courses with pagination
fetch('/api/course/get-all-courses?page=2&limit=20')

// Get instructor's published courses
fetch('/api/course/get-all-courses?instructorId=60d5ec49c1234567890abcd1&isPublished=true')
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Courses retrieved successfully",
  "data": [
    {
      "_id": "60d5ec49c1234567890abcd1",
      "title": "Complete React Masterclass",
      "category": "Web Development",
      "level": "Intermediate",
      "price": 99.99,
      "duration": 40,
      "rating": 4.8,
      "ratingsCount": 245,
      "studentsEnrolled": 1200,
      "isPublished": true,
      "isFeatured": true
    }
    // ... more courses
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "totalPages": 15
  }
}
```

---

### 3. Get Published Courses
```http
GET /api/course/get-published-courses
```

Returns only published courses sorted by newest first.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Published courses retrieved successfully",
  "data": [...]
}
```

---

### 4. Get Featured Courses
```http
GET /api/course/get-featured-courses
```

Returns featured courses for homepage display.

---

### 5. Get Single Course
```http
GET /api/course/get-course/:id
```

**URL Parameters:**
- `id`: Course MongoDB ObjectId (24 characters)

**Example:**
```javascript
fetch('/api/course/get-course/60d5ec49c1234567890abcd1')
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Course retrieved successfully",
  "data": {
    "_id": "60d5ec49c1234567890abcd1",
    "title": "Complete React Masterclass",
    "description": "Learn React from basics to advanced concepts with real-world projects and best practices.",
    "category": "Web Development",
    "price": 99.99,
    "discountPrice": 49.99,
    "thumbnail": "https://example.com/thumbnail.jpg",
    "level": "Intermediate",
    "language": "English",
    "duration": 40,
    "rating": 4.8,
    "ratingsCount": 245,
    "studentsEnrolled": 1200,
    "instructorId": {
      "_id": "60d5ec49c1234567890abcd1",
      "name": "John Doe",
      "email": "john@example.com",
      "profileImage": "https://example.com/profile.jpg"
    },
    "isPublished": true,
    "isFeatured": true,
    "tags": ["react", "javascript", "frontend"],
    "learningOutcomes": [
      "Build modern React applications",
      "Master hooks and state management",
      "Deploy React apps to production"
    ],
    "prerequisites": [
      "Basic JavaScript knowledge",
      "HTML and CSS fundamentals"
    ],
    "createdAt": "2025-12-27T00:00:00.000Z",
    "updatedAt": "2025-12-27T00:00:00.000Z"
  }
}
```

---

### 6. Update Course
```http
PATCH /api/course/update-course/:id
Content-Type: application/json
```

**Request Body** (all fields optional):
```json
{
  "title": "Advanced React Masterclass",
  "price": 79.99,
  "isPublished": true,
  "isFeatured": true
}
```

---

### 7. Delete Course
```http
DELETE /api/course/delete-course/:id
```

---

### 8. Get Instructor's Courses
```http
GET /api/course/get-instructor-courses/:instructorId
```

**Example:**
```javascript
fetch('/api/course/get-instructor-courses/60d5ec49c1234567890abcd1')
```

---

### 9. Get Courses by Category
```http
GET /api/course/get-category-courses/:category
```

**Example:**
```javascript
fetch('/api/course/get-category-courses/Web%20Development')
```

---

## MODULE ENDPOINTS

### 1. Create Module
```http
POST /api/course/create-module
Content-Type: application/json
```

**Request Body:**
```json
{
  "courseId": "60d5ec49c1234567890abcd1",
  "title": "Getting Started with React",
  "description": "Introduction to React concepts and setup",
  "orderIndex": 0
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Module created successfully",
  "data": {
    "_id": "60d5ec49c1234567890abcd2",
    "courseId": "60d5ec49c1234567890abcd1",
    "title": "Getting Started with React",
    "description": "Introduction to React concepts and setup",
    "orderIndex": 0,
    "createdAt": "2025-12-27T00:00:00.000Z",
    "updatedAt": "2025-12-27T00:00:00.000Z"
  }
}
```

---

### 2. Get Course Modules
```http
GET /api/course/get-modules/:courseId
```

Returns all modules for a course, ordered by orderIndex.

**Example:**
```javascript
fetch('/api/course/get-modules/60d5ec49c1234567890abcd1')
```

---

### 3. Get Single Module
```http
GET /api/course/get-module/:id
```

---

### 4. Update Module
```http
PATCH /api/course/update-module/:id
Content-Type: application/json
```

**Request Body** (all optional):
```json
{
  "title": "React Fundamentals",
  "orderIndex": 1
}
```

---

### 5. Delete Module
```http
DELETE /api/course/delete-module/:id
```

---

## LESSON ENDPOINTS

### 1. Create Lesson
```http
POST /api/course/create-lesson
Content-Type: application/json
```

**Request Body:**
```json
{
  "moduleId": "60d5ec49c1234567890abcd2",
  "title": "Introduction to React",
  "description": "Learn what React is and why we use it",
  "type": "video",
  "contentUrl": "https://example.com/videos/intro-react.mp4",
  "duration": 15,
  "orderIndex": 0,
  "isPreview": true,
  "isFree": true
}
```

**Lesson Types:**
- `video` - Video content
- `pdf` - PDF document
- `quiz` - Quiz/test
- `assignment` - Assignment/project

**Success Response (201):**
```json
{
  "success": true,
  "message": "Lesson created successfully",
  "data": {
    "_id": "60d5ec49c1234567890abcd3",
    "moduleId": "60d5ec49c1234567890abcd2",
    "title": "Introduction to React",
    "description": "Learn what React is and why we use it",
    "type": "video",
    "contentUrl": "https://example.com/videos/intro-react.mp4",
    "duration": 15,
    "orderIndex": 0,
    "isPreview": true,
    "isFree": true,
    "createdAt": "2025-12-27T00:00:00.000Z",
    "updatedAt": "2025-12-27T00:00:00.000Z"
  }
}
```

---

### 2. Get Module Lessons
```http
GET /api/course/get-lessons/:moduleId
```

Returns all lessons for a module, ordered by orderIndex.

**Example:**
```javascript
fetch('/api/course/get-lessons/60d5ec49c1234567890abcd2')
```

---

### 3. Get Single Lesson
```http
GET /api/course/get-lesson/:id
```

---

### 4. Update Lesson
```http
PATCH /api/course/update-lesson/:id
Content-Type: application/json
```

**Request Body** (all optional):
```json
{
  "title": "Advanced React Concepts",
  "duration": 45,
  "isFree": false
}
```

---

### 5. Delete Lesson
```http
DELETE /api/course/delete-lesson/:id
```

---

### 6. Get Free Lessons
```http
GET /api/course/get-free-lessons
```

Returns all free lessons (great for showcasing content).

---

## Frontend Implementation Examples

### React Hook for Getting Courses
```javascript
import { useEffect, useState } from 'react';

function useCourses(filters = {}) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const params = new URLSearchParams(filters);
        const response = await fetch(`/api/course/get-all-courses?${params}`);
        const data = await response.json();
        
        if (data.success) {
          setCourses(data.data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [filters]);

  return { courses, loading, error };
}

// Usage
const { courses, loading, error } = useCourses({ 
  category: 'Web Development',
  isPublished: true 
});
```

### Create Course Form
```javascript
async function createCourse(formData) {
  const response = await fetch('/api/course/create-course', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });

  const data = await response.json();
  
  if (data.success) {
    console.log('Course created:', data.data);
    return data.data;
  } else {
    console.error('Error:', data.error);
  }
}
```

### Get Course with Modules and Lessons
```javascript
async function getCourseContent(courseId) {
  // Get course details
  const courseRes = await fetch(`/api/course/get-course/${courseId}`);
  const courseData = await courseRes.json();
  const course = courseData.data;

  // Get modules
  const modulesRes = await fetch(`/api/course/get-modules/${courseId}`);
  const modulesData = await modulesRes.json();
  const modules = modulesData.data;

  // Get lessons for each module
  const lessonsPromises = modules.map(module =>
    fetch(`/api/course/get-lessons/${module._id}`)
      .then(res => res.json())
      .then(data => ({ moduleId: module._id, lessons: data.data }))
  );

  const lessons = await Promise.all(lessonsPromises);

  return {
    course,
    modules,
    lessons
  };
}
```

---

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "body.title",
      "message": "String must contain at least 5 character(s)"
    },
    {
      "field": "body.instructorId",
      "message": "String must be exactly 24 character(s)"
    }
  ]
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Course not found"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Failed to create course",
  "error": "Database connection error"
}
```

---

## Best Practices for Frontend

1. **Always validate form input** before sending to API
2. **Handle loading and error states** in your UI
3. **Use pagination** for course listings
4. **Cache course data** to reduce API calls
5. **Show preview lessons** to encourage enrollment
6. **Display instructor information** prominently
7. **Use featured courses** on homepage
8. **Implement search and filters** for better UX
9. **Handle expired sessions** gracefully
10. **Display validation errors** to users clearly

---

## Testing with cURL

```bash
# Create a course
curl -X POST http://localhost:5000/api/course/create-course \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Course",
    "description": "This is a test course description for testing purposes",
    "category": "Web Development",
    "price": 99.99,
    "level": "Beginner",
    "duration": 10,
    "instructorId": "60d5ec49c1234567890abcd1"
  }'

# Get all courses
curl http://localhost:5000/api/course/get-all-courses

# Get published courses
curl http://localhost:5000/api/course/get-published-courses

# Get single course
curl http://localhost:5000/api/course/get-course/60d5ec49c1234567890abcd1
```

---

## Rate Limiting
Currently no rate limiting is implemented. Contact backend team if needed.

---

## Support
For issues or questions, contact the backend development team.
