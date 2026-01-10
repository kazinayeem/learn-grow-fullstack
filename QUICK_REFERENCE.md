# Quick Reference - Frontend Components & Pages

## 📁 File Structure

```
Frontend Implementation Files:
├── Components (8 new)
│   ├── admin/
│   │   ├── ComboManagement.tsx                [✨ Admin: Create/Edit/Delete combos]
│   │   ├── AccessDurationManager.tsx          [✨ Admin: Manage student access]
│   │   └── AdminComboPanel.tsx                [✨ Admin: Dashboard with tabs]
│   ├── checkout/
│   │   └── ComboCheckoutSummary.tsx           [✨ Checkout: Combo order summary]
│   ├── combo/
│   │   ├── ComboListing.tsx                   [✨ Student: Browse combos]
│   │   └── ComboDetails.tsx                   [✨ Student: View combo details]
│   ├── course/
│   │   └── AccessStatusDisplay.tsx            [✨ Student: Course access status]
│   └── dashboard/
│       └── StudentCourseDashboard.tsx         [✨ Student: Dashboard with access]
├── Pages (5 new)
│   ├── app/student/
│   │   ├── combos/page.tsx                    [✨ GET /student/combos]
│   │   ├── combo/[comboId]/page.tsx           [✨ GET /student/combo/:id]
│   │   └── courses/page.tsx                   [✨ GET /student/courses]
│   └── app/admin/
│       ├── combos/page.tsx                    [✨ GET /admin/combos]
│       └── access-duration/page.tsx           [✨ GET /admin/access-duration]
├── Redux API (2 slices)
│   └── redux/api/
│       ├── comboApi.ts                        [Enhanced with getAllCombos]
│       └── accessManagementApi.ts             [4 admin endpoints]
├── Utilities
│   └── lib/access-control.ts                  [9 utility functions]
├── Types
│   └── types/combo.types.ts                   [5 TypeScript interfaces]
└── Documentation (3 guides)
    ├── FRONTEND_IMPLEMENTATION_GUIDE.md       [Complete API reference]
    ├── FRONTEND_SETUP_GUIDE.md                [Setup & testing guide]
    └── FRONTEND_COMPLETION_SUMMARY.md         [This summary]
```

---

## 🎯 Quick Navigation

### For Students
| Task | Page | Component |
|------|------|-----------|
| Browse combos | `/student/combos` | ComboListing |
| View combo details | `/student/combo/[id]` | ComboDetails |
| See my courses | `/student/courses` | StudentCourseDashboard |
| Check course access | Any course page | AccessStatusDisplay |

### For Admins
| Task | Page | Component |
|------|------|-----------|
| Manage combos | `/admin/combos` | ComboManagement |
| Manage access | `/admin/access-duration` | AccessDurationManager |
| Admin dashboard | `/admin/combos` | AdminComboPanel |

---

## 🔌 Redux Hooks Quick Reference

### Combo API Hooks
```typescript
import {
  useGetActiveCombosQuery,      // Get active combos (students)
  useGetAllCombosQuery,          // Get all combos (admin)
  useGetComboByIdQuery,          // Get single combo details
  useCreateComboMutation,        // Create combo (admin)
  useUpdateComboMutation,        // Update combo (admin)
  useDisableComboMutation,       // Disable combo (admin)
  useGetUserComboPurchasesQuery, // Get user's combo purchases
  useEnrollInComboMutation,      // Enroll in combo
  useExtendComboAccessMutation,  // Extend combo access (admin)
} from "@/redux/api/comboApi";

// Usage Example:
const { data, isLoading, error } = useGetActiveCombosQuery({ page: 1, limit: 10 });
const [createCombo] = useCreateComboMutation();
```

### Access Management API Hooks
```typescript
import {
  useSetAccessDurationMutation,   // Set course duration (admin)
  useExtendAccessMutation,        // Extend access (admin)
  useReduceAccessMutation,        // Reduce access (admin)
  useGetUserCourseAccessQuery,    // Get user's access (admin)
} from "@/redux/api/accessManagementApi";

// Usage Example:
const { data: accesses } = useGetUserCourseAccessQuery({ userId });
const [setDuration] = useSetAccessDurationMutation();
```

---

## 🛠️ Utility Functions

```typescript
import {
  hasValidAccess,           // (access) => boolean
  getRemainingDays,         // (endDate) => number
  formatRemainingAccess,    // (endDate) => string
  isExpiringSoon,           // (endDate) => boolean
  isExpired,                // (endDate) => boolean
  getAccessStatus,          // (access) => string
  getAccessStatusColor,     // (access) => string
  formatDate,               // (date) => string
  getDurationLabel,         // (duration) => string
} from "@/lib/access-control";

// Usage Examples:
const isValid = hasValidAccess(enrollment);
const days = getRemainingDays(enrollment.accessEndDate);
const status = getAccessStatus(enrollment);
```

---

## 📊 Component Props Reference

### ComboListing
```typescript
<ComboListing />
// Props: None - uses hooks internally
```

### ComboDetails
```typescript
<ComboDetails comboId={string} />
// Required: comboId
```

### AccessStatusDisplay
```typescript
<AccessStatusDisplay
  access={IEnrollmentAccess}
  courseTitle?={string}
  showExtendButton?={boolean}
  onExtend?={() => void}
/>
```

### StudentCourseDashboard
```typescript
<StudentCourseDashboard />
// Props: None - uses hooks internally
```

### ComboManagement
```typescript
<ComboManagement />
// Props: None - uses hooks internally
```

### AccessDurationManager
```typescript
<AccessDurationManager />
// Props: None - uses hooks internally
```

### AdminComboPanel
```typescript
<AdminComboPanel />
// Props: None - uses hooks internally
```

---

## 🔑 Key Data Types

### Combo
```typescript
interface ICombo {
  _id: string;
  name: string;
  description?: string;
  courses: any[];           // 1-3 courses
  price: number;
  discountPrice?: number;
  duration: "1-month" | "2-months" | "3-months" | "lifetime";
  thumbnail?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Enrollment Access
```typescript
interface IEnrollmentAccess {
  _id: string;
  course: any;
  accessStartDate: Date;
  accessEndDate?: Date;           // null = lifetime
  accessDuration: "1-month" | "2-months" | "3-months" | "lifetime";
  purchaseType: "single" | "combo";
  comboId?: string;
}
```

---

## 🚀 Usage Examples

### Example 1: Display Combo Listing
```tsx
import ComboListing from "@/components/combo/ComboListing";

export default function CombosPage() {
  return (
    <div className="container mx-auto py-12">
      <h1>Explore Course Combos</h1>
      <ComboListing />
    </div>
  );
}
```

### Example 2: Show Student Courses
```tsx
import StudentCourseDashboard from "@/components/dashboard/StudentCourseDashboard";

export default function MyCoursesPage() {
  return <StudentCourseDashboard />;
}
```

### Example 3: Admin Combo Management
```tsx
import ComboManagement from "@/components/admin/ComboManagement";

export default function AdminCombosPage() {
  return (
    <div className="container mx-auto py-8">
      <ComboManagement />
    </div>
  );
}
```

### Example 4: Check Course Access
```tsx
import { useGetUserCourseAccessQuery } from "@/redux/api/accessManagementApi";
import AccessStatusDisplay from "@/components/course/AccessStatusDisplay";

export default function CourseDetail({ courseId }: { courseId: string }) {
  const { data } = useGetUserCourseAccessQuery({});
  const access = data?.data?.find(a => a.course._id === courseId);

  return access ? (
    <AccessStatusDisplay access={access} courseTitle="Course Title" />
  ) : (
    <p>No access to this course</p>
  );
}
```

---

## 🔄 API Endpoints Summary

### Public Endpoints
| Method | Path | Hook |
|--------|------|------|
| GET | `/combo/list` | useGetActiveCombosQuery |
| GET | `/combo/:comboId` | useGetComboByIdQuery |

### User Endpoints
| Method | Path | Hook |
|--------|------|------|
| POST | `/combo/enroll` | useEnrollInComboMutation |
| GET | `/combo/my/purchases` | useGetUserComboPurchasesQuery |

### Admin Endpoints
| Method | Path | Hook |
|--------|------|------|
| GET | `/combo` | useGetAllCombosQuery |
| POST | `/combo/create` | useCreateComboMutation |
| PATCH | `/combo/:comboId` | useUpdateComboMutation |
| DELETE | `/combo/:comboId` | useDisableComboMutation |
| POST | `/combo/extend-access` | useExtendComboAccessMutation |
| GET | `/orders/admin/user-course-access/:userId` | useGetUserCourseAccessQuery |
| POST | `/orders/admin/set-access-duration` | useSetAccessDurationMutation |
| POST | `/orders/admin/extend-access` | useExtendAccessMutation |
| POST | `/orders/admin/reduce-access` | useReduceAccessMutation |

---

## ⚡ Common Tasks

### Task 1: Display All Active Combos
```tsx
const { data, isLoading } = useGetActiveCombosQuery({ page: 1, limit: 10 });
if (isLoading) return <Spinner />;
return data?.data?.map(combo => <ComboCard key={combo._id} combo={combo} />);
```

### Task 2: Create New Combo (Admin)
```tsx
const [createCombo] = useCreateComboMutation();
const handleCreate = async (comboData) => {
  try {
    await createCombo(comboData).unwrap();
    toast.success("Combo created!");
  } catch (error) {
    toast.error("Failed to create combo");
  }
};
```

### Task 3: Check User's Access Status
```tsx
const { data: accesses } = useGetUserCourseAccessQuery({});
const isExpiringSoon = accesses?.data?.some(a =>
  getRemainingDays(a.accessEndDate) <= 7 && getRemainingDays(a.accessEndDate) > 0
);
```

### Task 4: Extend Student's Access
```tsx
const [extendAccess] = useExtendAccessMutation();
const handleExtend = async (userId, courseId, days) => {
  try {
    await extendAccess({ userId, courseId, days }).unwrap();
    toast.success(`Extended by ${days} days!`);
  } catch (error) {
    toast.error("Failed to extend access");
  }
};
```

### Task 5: Check if Course Accessible
```tsx
import { hasValidAccess } from "@/lib/access-control";

const { data } = useGetUserCourseAccessQuery({});
const courseAccess = data?.data?.find(a => a.course._id === courseId);
const canAccess = courseAccess && hasValidAccess(courseAccess);
```

---

## 🐛 Troubleshooting Tips

| Problem | Solution |
|---------|----------|
| Combos not loading | Check backend running at `http://localhost:5000/api` |
| 401 errors | Ensure localStorage has valid token |
| Components not rendering | Check NextUI is installed and configured |
| API calls failing | Verify `NEXT_PUBLIC_API_URL` in environment |
| Redux state empty | Check Redux store includes both API slices |
| Styles not applying | Check TailwindCSS configuration in tailwind.config.js |

---

## 📝 Environment Setup

```bash
# .env.local (required)
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Then start frontend
cd learn-grow
npm install
npm run dev

# Frontend will be at http://localhost:3000
```

---

## 🎓 Next Steps

1. **Integrate Components** - Add to your existing pages
2. **Test Thoroughly** - Use FRONTEND_SETUP_GUIDE.md test cases
3. **Add Navigation** - Link new pages in your nav menu
4. **Deploy** - Follow Next.js deployment guide
5. **Monitor** - Check admin dashboard for combos/access

---

## 📚 Related Documentation

- `FRONTEND_IMPLEMENTATION_GUIDE.md` - Complete API reference
- `FRONTEND_SETUP_GUIDE.md` - Setup and testing procedures
- `FRONTEND_COMPLETION_SUMMARY.md` - Full implementation summary
- Backend docs: `grow-backend/LMS_REQUIREMENTS_UPDATED.md`

---

**Version:** 1.0.0
**Last Updated:** January 11, 2025
**Status:** ✅ Production Ready
