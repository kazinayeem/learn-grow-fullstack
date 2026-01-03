# Query Optimization Patterns

## 1. Use Lean Queries (No Mongoose Documents)

❌ Bad:
```typescript
const users = await User.find({ role: 'student' });
```

✅ Good:
```typescript
const users = await User.find({ role: 'student' }).lean();
```

**Performance Gain:** 5-10x faster

## 2. Select Only Needed Fields

❌ Bad:
```typescript
const user = await User.findOne({ email });
```

✅ Good:
```typescript
const user = await User.findOne({ email }).select('name email role').lean();
```

**Performance Gain:** 2-3x faster

## 3. Use Projections in Aggregations

❌ Bad:
```typescript
const results = await Course.aggregate([
  { $match: { status: 'active' } },
  { $lookup: { from: 'users', localField: 'instructorId', foreignField: '_id', as: 'instructor' } }
]);
```

✅ Good:
```typescript
const results = await Course.aggregate([
  { $match: { status: 'active' } },
  { $project: { title: 1, price: 1, instructorId: 1 } }, // Project early
  { $lookup: { from: 'users', localField: 'instructorId', foreignField: '_id', as: 'instructor' } },
  { $project: { title: 1, price: 1, 'instructor.name': 1 } } // Project after lookup
]);
```

## 4. Avoid N+1 Queries

❌ Bad:
```typescript
const courses = await Course.find();
for (const course of courses) {
  course.instructor = await User.findById(course.instructorId);
}
```

✅ Good:
```typescript
const courses = await Course.aggregate([
  { $lookup: { from: 'users', localField: 'instructorId', foreignField: '_id', as: 'instructor' } },
  { $unwind: '$instructor' }
]);
```

## 5. Use Cursor for Large Datasets

❌ Bad:
```typescript
const allCourses = await Course.find(); // Loads all in memory
```

✅ Good:
```typescript
const cursor = Course.find().cursor();
for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
  // Process doc
}
```

## 6. Limit and Skip Optimization

❌ Bad (for pagination):
```typescript
const page = 1000;
const limit = 10;
const results = await Course.find().skip(page * limit).limit(limit);
```

✅ Good (cursor-based pagination):
```typescript
const lastId = req.query.lastId;
const results = await Course.find({ _id: { $gt: lastId } }).limit(10).lean();
```

## 7. Add Indexes for Frequent Queries

```typescript
// In model or via script
courseSchema.index({ categoryId: 1, status: 1 });
courseSchema.index({ instructorId: 1, createdAt: -1 });
```

## 8. Use Aggregation Pipeline Efficiently

Always:
1. `$match` as early as possible
2. `$project` to reduce data size
3. `$limit` when possible
4. Use indexes for `$match` and `$sort`

## 9. Avoid Loading Unnecessary Relations

❌ Bad:
```typescript
const course = await Course.findById(id)
  .populate('instructorId')
  .populate('categoryId')
  .populate('enrollments'); // Large relation
```

✅ Good:
```typescript
const course = await Course.findById(id)
  .populate('instructorId', 'name email')
  .populate('categoryId', 'name')
  .select('title description price')
  .lean();
```

## 10. Cache Frequently Accessed Data

```typescript
import { CacheService } from '../utils/cache.js';

// Get with cache
const cacheKey = `courses:active`;
let courses = await CacheService.get(cacheKey);

if (!courses) {
  courses = await Course.find({ status: 'active' }).lean();
  await CacheService.set(cacheKey, courses, 300); // 5 minutes
}
```
