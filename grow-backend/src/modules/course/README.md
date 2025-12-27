# Course Module

## Overview
The Course module is a complete Learning Management System (LMS) that handles courses, modules, and lessons. It provides comprehensive course management functionality with support for different lesson types, pricing, and access control.

## Features
- ✅ Full CRUD operations for courses, modules, and lessons
- ✅ Course levels (Beginner, Intermediate, Advanced)
- ✅ Flexible pricing with discount support
- ✅ Featured courses functionality
- ✅ Multiple lesson types (video, PDF, quiz, assignment)
- ✅ Free/preview lessons support
- ✅ Course organization with modules and lessons
- ✅ Instructor management
- ✅ Advanced filtering and search
- ✅ Learning outcomes and prerequisites
- ✅ Student enrollment tracking

## Data Models

### Course Schema
```typescript
{
  title: string,                    // Course title (required, 5-200 chars)
  description: string,              // Course description (required, min 20 chars)
  category: string,                 // Course category (required)
  price: number,                    // Course price (required, min 0)
  discountPrice: number,            // Optional discount price
  thumbnail: string,                // Course thumbnail URL
  level: string,                    // Beginner | Intermediate | Advanced
  language: string,                 // Default: English
  duration: number,                 // Duration in hours (required)
  rating: number,                   // 0-5 rating (default 0)
  ratingsCount: number,             // Number of ratings (default 0)
  studentsEnrolled: number,         // Enrollment count (default 0)
  instructorId: ObjectId,           // Reference to User (instructor)
  isPublished: boolean,             // Publication status (default false)
  isFeatured: boolean,              // Featured course flag (default false)
  tags: string[],                   // Array of tags
  learningOutcomes: string[],       // What students will learn
  prerequisites: string[],          // Required prerequisites
  createdAt: Date,                  // Auto-generated
  updatedAt: Date                   // Auto-generated
}
```

### Module Schema
```typescript
{
  courseId: ObjectId,               // Reference to Course (required)
  title: string,                    // Module title (required, 3+ chars)
  description: string,              // Module description
  orderIndex: number,               // Order in course (required, min 0)
  createdAt: Date,                  // Auto-generated
  updatedAt: Date                   // Auto-generated
}
```

### Lesson Schema
```typescript
{
  moduleId: ObjectId,               // Reference to Module (required)
  title: string,                    // Lesson title (required, 3+ chars)
  description: string,              // Lesson description
  type: string,                     // video | pdf | quiz | assignment
  contentUrl: string,               // URL to lesson content
  duration: number,                 // Duration in minutes
  orderIndex: number,               // Order in module (required, min 0)
  isPreview: boolean,               // Preview lesson flag
  isFree: boolean,                  // Free lesson flag
  createdAt: Date,                  // Auto-generated
  updatedAt: Date                   // Auto-generated
}
```

## Project Structure
```
course/
├── controller/
│   └── course.controller.ts       # Request handlers
├── model/
│   ├── course.model.ts            # Course schema
│   ├── module.model.ts            # Module schema
│   └── lesson.model.ts            # Lesson schema
├── routes/
│   └── course.route.ts            # Route definitions
├── schema/
│   └── course.schema.ts           # Zod validation schemas
├── service/
│   └── course.service.ts          # Business logic
├── index.ts                       # Module exports
├── README.md                      # This file
└── API_GUIDE.md                   # Frontend API guide
```

## Database Indexes

The following indexes are created for optimal query performance:
- `{ instructorId: 1 }` - For instructor courses
- `{ category: 1 }` - For category filtering
- `{ isPublished: 1, isFeatured: -1 }` - For featured courses
- `{ courseId: 1, orderIndex: 1 }` - For module ordering
- `{ moduleId: 1, orderIndex: 1 }` - For lesson ordering

## Validation Rules

### Course Validation
- `title`: 5-200 characters, required
- `description`: Minimum 20 characters, required
- `category`: 2-100 characters, required
- `price`: Minimum 0, required
- `duration`: Minimum 0, required
- `instructorId`: Valid 24-character MongoDB ObjectId, required
- `level`: One of: Beginner, Intermediate, Advanced

### Module Validation
- `courseId`: Valid 24-character MongoDB ObjectId, required
- `title`: 3+ characters, required
- `orderIndex`: Minimum 0, required

### Lesson Validation
- `moduleId`: Valid 24-character MongoDB ObjectId, required
- `title`: 3+ characters, required
- `type`: One of: video, pdf, quiz, assignment
- `orderIndex`: Minimum 0, required

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
- `400`: Validation error
- `404`: Not found
- `500`: Server error

## Future Enhancements
- [ ] Progress tracking for students
- [ ] Quiz grading system
- [ ] Assignment submission and review
- [ ] Discussion forums
- [ ] Certificates upon completion
- [ ] Reviews and ratings system
- [ ] Video streaming optimization
- [ ] Course analytics and reports
- [ ] Bulk imports
- [ ] Course templates

## Best Practices

1. **Course Organization**: Always group related lessons into modules
2. **Ordering**: Set appropriate orderIndex values for consistent display
3. **Preview Content**: Mark key lessons as previews for marketing
4. **Free Content**: Provide some free lessons to encourage enrollment
5. **Descriptions**: Write clear, detailed descriptions for each level
6. **Instructor Reference**: Ensure instructorId is a valid user ID
7. **Pricing Strategy**: Use discountPrice for promotions
8. **Tags**: Use meaningful tags for better discoverability

## Contributing
When adding new features:
1. Update the relevant model if new fields are needed
2. Add corresponding Zod validation
3. Create service methods for business logic
4. Add controller handlers
5. Define routes with proper validation
6. Update documentation

## License
Part of the Grow Backend project.
