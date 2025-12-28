# Blog Seeding Guide

## Overview

This script seeds your database with 50+ blog posts across 10 different categories with rich HTML content, proper metadata, and the image from `https://picsum.photos/1080/720`.

## Features

✅ **50+ Blog Posts** - Comprehensive blog articles covering various tech topics
✅ **10 Categories** - Web Development, Mobile, Data Science, Cloud, DevOps, Cybersecurity, AI, JavaScript, Databases, System Design
✅ **Rich HTML Content** - Properly formatted content with headings, lists, paragraphs
✅ **Beautiful Images** - Uses picsum.photos for consistent, high-quality images
✅ **Metadata** - Includes meta tags, read time, view counts, and dates
✅ **All Approved** - Blogs are published and approved for display

## Running the Seed

### Option 1: Using npm script with Author ID (Recommended)

From the `grow-backend` directory:

```bash
npm run db:seed-blogs 694ff0f8881c228c04c30a26
```

Or with your own user ID:
```bash
npm run db:seed-blogs YOUR_USER_ID_HERE
```

### Option 2: Using tsx directly

```bash
tsx src/scripts/seedBlogs.ts 694ff0f8881c228c04c30a26
```

### Option 3: Using default author (if no ID provided)

```bash
npm run db:seed-blogs
```

This will use the default author ID: `694ff0f8881c228c04c30a26`

## What Gets Created

### Categories (10 total)
1. Web Development
2. Mobile Development
3. Data Science
4. Cloud Computing
5. DevOps
6. Cybersecurity
7. Artificial Intelligence
8. JavaScript
9. Database Design
10. System Design

### Blog Posts (50+ articles)

Each blog post includes:
- **Unique Title** - Descriptive and SEO-friendly
- **Rich Content** - HTML formatted with sections, lists, and paragraphs
- **Excerpt** - Short summary for preview
- **Category** - Assigned to relevant category
- **Image** - High-quality image from picsum.photos (1080x720)
- **Meta Tags** - For better searchability
- **Read Time** - Estimated reading duration
- **View Count** - Simulated engagement metric
- **Publication Status** - Published and approved

## Sample Blog Topics

- Getting Started with Web Development
- Advanced CSS Techniques for Modern Web Design
- JavaScript ES6+ Features You Should Know
- Building Responsive Websites
- RESTful API Design Best Practices
- Introduction to React and Component Architecture
- Mobile App Development Fundamentals
- Machine Learning Algorithms
- Cloud Computing Fundamentals
- Docker and Containerization
- DevOps Practices and Tools
- Cybersecurity Fundamentals
- Artificial Intelligence Overview
- Data Science Workflow and Tools
- System Design Interviews
- ...and 35+ more!

## Customization

You can modify the seed script to:

### Change Categories
Edit the `categories` array in `seedBlogs.ts`:
```typescript
const categories = [
  "Your Category 1",
  "Your Category 2",
  // ...
];
```

### Change Blog Topics
Edit the `blogTitles` array to include different topics

### Modify Rich Content
Update the `generateRichContent()` function to customize HTML structure and content

### Change Image Source
Replace `"https://picsum.photos/1080/720"` with your own image URL:
```typescript
image: "https://your-image-url.com/image.jpg"
```

## Database Requirements

Make sure you have:
- MongoDB running and accessible
- `MONGODB_URI` environment variable set in `.env`
- **Important**: Your MongoDB connection must be authenticated (include credentials in the connection string)
- The author user ID must exist in your User collection

Example MONGODB_URI with authentication:
```
mongodb+srv://username:password@cluster.mongodb.net/learn-grow
```

Or local with auth:
```
mongodb://username:password@localhost:27017/learn-grow
```

## Verification

After running the seed, you can verify:

1. Check MongoDB directly:
```bash
db.blogs.countDocuments()  // Should show 50+
db.blogcategories.countDocuments()  // Should show 10
```

2. Visit your frontend blog page:
```
http://localhost:3000/blog
```

You should see all 50+ blog posts with proper formatting, images, and categories!

## Troubleshooting

### Connection Error
- Make sure MongoDB is running
- Check your `MONGODB_URI` environment variable
- Verify the connection string is correct

### Module Not Found
- Make sure you're in the `grow-backend` directory
- Run `npm install` if dependencies are missing
- Check that TypeScript compilation paths are correct

### Permission Denied
- Run with appropriate permissions
- Check file permissions on the scripts directory

## Notes

- The seed automatically creates a seed user if one doesn't exist
- Existing blogs and categories are cleared before seeding
- Each blog gets a unique slug generated from the title
- View counts and dates are randomized for realistic data
- All blogs are marked as published and approved by default

## Next Steps

After seeding:
1. Visit `/blog` page to see all blogs
2. Click on any blog to view the full rich content
3. Try filtering by category
4. Search for specific topics
5. Test pagination with 9 blogs per page

Enjoy your seeded blog content! 🚀
