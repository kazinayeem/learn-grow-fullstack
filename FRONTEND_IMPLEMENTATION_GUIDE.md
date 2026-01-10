# Frontend Implementation Guide - Course Combo System

## Overview

This document outlines the complete frontend implementation for the new course combo system integrated with the updated LMS backend.

## Project Structure

```
learn-grow/
├── app/
│   ├── admin/
│   │   ├── combos/page.tsx              # Admin combo management page
│   │   └── access-duration/page.tsx     # Admin access duration manager page
│   └── student/
│       ├── combos/page.tsx              # Student combo listing page
│       ├── combo/[comboId]/page.tsx     # Combo detail page
│       └── courses/page.tsx             # Student dashboard with course access
├── components/
│   ├── admin/
│   │   ├── ComboManagement.tsx          # Admin combo CRUD interface
│   │   └── AccessDurationManager.tsx    # Admin access management interface
│   ├── checkout/
│   │   └── ComboCheckoutSummary.tsx     # Combo purchase summary
│   ├── combo/
│   │   ├── ComboListing.tsx             # Student combo listing with pagination
│   │   └── ComboDetails.tsx             # Detailed combo view
│   ├── course/
│   │   └── AccessStatusDisplay.tsx      # Course access status display
│   └── dashboard/
│       └── StudentCourseDashboard.tsx   # Student dashboard with access info
├── redux/
│   └── api/
│       ├── comboApi.ts                  # Redux API slice for combos
│       └── accessManagementApi.ts       # Redux API slice for access management
├── lib/
│   └── access-control.ts                # Utility functions for access validation
└── types/
    └── combo.types.ts                   # TypeScript interfaces for combo system
```

## Key Components

### 1. ComboListing.tsx
**Location:** `components/combo/ComboListing.tsx`

Displays active course combos in a grid layout with pagination.

**Features:**
- Grid layout (responsive)
- Course count badges
- Duration badges with color coding
- Pricing display (original & discounted)
- Pagination (9 combos per page)
- Loading & error states
- "View Details" and "Buy Now" buttons

**Usage:**
```tsx
import ComboListing from "@/components/combo/ComboListing";

export default function CombosPage() {
  return <ComboListing />;
}
```

### 2. ComboDetails.tsx
**Location:** `components/combo/ComboDetails.tsx`

Shows detailed information about a single combo with purchase options.

**Features:**
- Combo thumbnail image
- Full course list with details
- Pricing breakdown
- Access duration info
- Purchase/Continue learning buttons
- Purchase status indicator

**Props:**
```tsx
interface ComboDetailsProps {
  comboId: string;
}
```

### 3. ComboManagement.tsx
**Location:** `components/admin/ComboManagement.tsx`

Admin interface for managing course combos.

**Features:**
- View all combos in table format
- Create new combos
- Edit existing combos
- Disable combos
- Pagination support
- Modal forms for create/edit

**Usage:**
```tsx
import ComboManagement from "@/components/admin/ComboManagement";

export default function AdminPage() {
  return <ComboManagement />;
}
```

### 4. AccessDurationManager.tsx
**Location:** `components/admin/AccessDurationManager.tsx`

Admin tool for managing student course access durations.

**Features:**
- User search by ID
- View user's course access status
- Set access duration (1-month, 2-months, 3-months, lifetime)
- Extend user access
- Reduce user access
- Access status table with remaining days

**Usage:**
```tsx
import AccessDurationManager from "@/components/admin/AccessDurationManager";

export default function AdminPage() {
  return <AccessDurationManager />;
}
```

### 5. AccessStatusDisplay.tsx
**Location:** `components/course/AccessStatusDisplay.tsx`

Displays course access status with remaining time and expiry information.

**Features:**
- Access status badge (Active/Expired/Expiring Soon)
- Progress bar showing time remaining
- Start and expiry dates
- Warning for expiring soon (7 days)
- Extend access button
- Continue learning button

**Props:**
```tsx
interface AccessStatusDisplayProps {
  access: IEnrollmentAccess;
  courseTitle?: string;
  showExtendButton?: boolean;
  onExtend?: () => void;
}
```

### 6. StudentCourseDashboard.tsx
**Location:** `components/dashboard/StudentCourseDashboard.tsx`

Comprehensive dashboard showing student's course access status.

**Features:**
- Stats cards (total, active, expiring, expired)
- Tabbed interface:
  - All Active Courses
  - Combo Courses
  - Single Courses
  - Expired Courses
- Access status for each course
- Renewal recommendations
- Combo upsell section

### 7. ComboCheckoutSummary.tsx
**Location:** `components/checkout/ComboCheckoutSummary.tsx`

Order summary for combo purchases before payment.

**Features:**
- Combo details display
- Included courses list
- Access duration info
- Pricing breakdown
- Total amount calculation
- Terms & conditions notice

## Redux API Slices

### comboApi.ts
Endpoints:
- `getActiveCombos` - Get active combos with pagination (public)
- `getAllCombos` - Get all combos (admin)
- `getComboById` - Get single combo details
- `createCombo` - Create new combo (admin)
- `updateCombo` - Update combo (admin)
- `disableCombo` - Disable combo (admin)
- `getUserComboPurchases` - Get user's purchased combos
- `enrollInCombo` - Enroll user in combo (after payment)
- `extendComboAccess` - Extend user's combo access (admin)

### accessManagementApi.ts
Endpoints:
- `setAccessDuration` - Set course access duration (admin)
- `extendAccess` - Extend user's course access (admin)
- `reduceAccess` - Reduce user's course access (admin)
- `getUserCourseAccess` - Get user's course access status (admin)

## Pages

### Student Pages

#### `/student/combos` (ComboListing)
Browsable list of all active combos with search and filtering.

#### `/student/combo/[comboId]` (ComboDetails)
Detailed view of a specific combo with purchase option.

#### `/student/courses` (StudentCourseDashboard)
Dashboard showing user's active courses, access status, and expiry information.

### Admin Pages

#### `/admin/combos` (ComboManagement)
Interface for creating, editing, and managing course combos.

#### `/admin/access-duration` (AccessDurationManager)
Tool for managing student course access durations and permissions.

## Utility Functions

**Location:** `lib/access-control.ts`

```typescript
// Check if user has valid access to course
hasValidAccess(access: IEnrollmentAccess): boolean

// Get remaining days until access expires
getRemainingDays(endDate: Date | null): number

// Format remaining access time (e.g., "15 days left")
formatRemainingAccess(endDate: Date | null): string

// Check if access expires within 7 days
isExpiringSoon(endDate: Date | null): boolean

// Check if access has expired
isExpired(endDate: Date | null): boolean

// Get access status string
getAccessStatus(access: IEnrollmentAccess): string

// Get color for access status
getAccessStatusColor(access: IEnrollmentAccess): string

// Format date for display
formatDate(date: Date): string

// Get duration label
getDurationLabel(duration: string): string
```

## Type Definitions

**Location:** `types/combo.types.ts`

```typescript
interface ICombo {
  _id: string;
  name: string;
  description?: string;
  courses: any[];
  price: number;
  discountPrice?: number;
  duration: "1-month" | "2-months" | "3-months" | "lifetime";
  thumbnail?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IComboOrder {
  _id: string;
  userId: string;
  comboId: ICombo;
  price: number;
  purchaseDate: Date;
  accessEndDate?: Date;
}

interface IEnrollmentAccess {
  _id: string;
  course: any;
  accessStartDate: Date;
  accessEndDate?: Date;
  accessDuration: "1-month" | "2-months" | "3-months" | "lifetime";
  purchaseType: "single" | "combo";
  comboId?: string;
}

interface IUserAccessStatus {
  userId: string;
  enrollments: IEnrollmentAccess[];
  totalCourses: number;
  activeCourses: number;
  expiredCourses: number;
}

interface IAccessStatus {
  status: "active" | "expiring-soon" | "expired";
  remainingDays: number;
  expiryDate?: Date;
}
```

## Integration Points

### With Checkout System

When purchasing a combo, the checkout flow should:

1. Get combo ID from URL params: `?plan=combo&comboId=COMBO_ID`
2. Fetch combo details via `useGetComboByIdQuery`
3. Display `ComboCheckoutSummary`
4. Create order with `planType: "combo"` and `comboId`
5. After approval, user gets enrolled in combo via `enrollInCombo` mutation

### With Course Pages

Individual course pages should:

1. Check user's access status via `useGetUserCourseAccessQuery`
2. Display `AccessStatusDisplay` component
3. Show access duration and expiry date
4. Provide "Extend Access" button if expiring soon

### With Dashboard

Student dashboard should:

1. Fetch all enrollments via `useGetUserCourseAccessQuery`
2. Use `StudentCourseDashboard` component
3. Group courses by purchase type (combo/single)
4. Highlight expiring courses
5. Offer renewal/upgrade options

## API Endpoints Reference

### Public Endpoints

```
GET /api/combo/list?page=1&limit=10        # Get active combos
GET /api/combo/:comboId                    # Get combo details
```

### User Endpoints

```
POST /api/combo/enroll                     # Enroll in combo (after payment)
GET /api/combo/my/purchases                # Get user's purchased combos
```

### Admin Endpoints

```
GET /api/combo?page=1&limit=10             # Get all combos
POST /api/combo/create                     # Create combo
PATCH /api/combo/:comboId                  # Update combo
DELETE /api/combo/:comboId                 # Disable combo
POST /api/combo/extend-access              # Extend user's combo access
POST /api/orders/admin/set-access-duration # Set course access duration
POST /api/orders/admin/extend-access       # Extend course access
POST /api/orders/admin/reduce-access       # Reduce course access
GET /api/orders/admin/user-course-access/:userId  # Get user's access
```

## Styling

All components use:
- **NextUI v2** for UI components
- **TailwindCSS** for custom styling
- **Responsive design** (mobile-first approach)
- **Consistent color scheme** with primary/success/warning/danger colors

## Authentication

All API requests include:
- Bearer token in Authorization header
- Automatic token retrieval from localStorage
- 401 handling redirects to login

## Error Handling

Components handle:
- Loading states with Spinner
- Error states with Alert
- Network errors with toast notifications
- Validation errors with form feedback

## Best Practices

1. **Always use Redux hooks** for data fetching (not direct axios)
2. **Validate user permissions** before showing admin features
3. **Handle expired tokens** gracefully
4. **Show loading states** for all async operations
5. **Provide clear error messages** to users
6. **Use optimistic updates** where applicable
7. **Invalidate tags** after mutations to refresh data
8. **Format dates consistently** using `formatDate()` utility

## Testing Checklist

- [ ] ComboListing displays combos correctly
- [ ] Pagination works on ComboListing
- [ ] ComboDetails loads combo info
- [ ] ComboManagement CRUD operations work
- [ ] AccessDurationManager finds users
- [ ] Access status displays correct info
- [ ] StudentCourseDashboard shows all courses
- [ ] Expired courses can be renewed
- [ ] Access extending notifications work
- [ ] Expiring soon warnings display (7 days)

## Future Enhancements

1. **Email Notifications** - Send notifications when access is expiring soon
2. **Auto-expiry Jobs** - Cron jobs to handle automatic expiry
3. **Access Analytics** - Track combo popularity and access patterns
4. **Bulk Operations** - Admin bulk actions for access management
5. **Combo Recommendations** - AI-based combo recommendations
6. **Access History** - Track user's access changes
7. **Reporting** - Admin reports on combos and access
8. **API Caching** - Optimize data fetching with better caching strategies

## Support & Documentation

For backend API details, see: `grow-backend/LMS_REQUIREMENTS_UPDATED.md`
For quick start guide: `grow-backend/QUICK_START_GUIDE.md`
