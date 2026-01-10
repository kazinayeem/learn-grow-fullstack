# File Structure - Admin Sidebar Enhancement

## New Files Created

```
learn-grow/
├── app/
│   └── instructor/
│       └── combos/                          [NEW DIRECTORY]
│           ├── page.tsx                     [NEW] - List all combos
│           ├── create/
│           │   └── page.tsx                 [NEW] - Create combo form
│           └── [comboId]/
│               ├── page.tsx                 [NEW] - View combo details
│               └── edit/
│                   └── page.tsx             [NEW] - Edit combo form
│
└── components/
    └── instructor/
        └── InstructorSidebar.tsx            [MODIFIED] - Added quick action buttons & menu item
```

## Modified Files

### 1. `/components/instructor/InstructorSidebar.tsx`
**Changes:**
- Added `FaPlus` import from react-icons
- Added "Course Combos" navigation item to `navItems` array
- Added quick action buttons section with "New Course" and "New Combo" buttons
- Quick buttons hidden on collapsed mobile sidebar

**Lines Changed:**
- Import section: Added `FaPlus`
- Lines ~50-65: Updated `navItems` array with new combo item
- Lines ~155-177: Added quick action buttons div

## New Components (Page Components)

### 1. `/instructor/combos/page.tsx`
**Purpose:** Display list of all instructor's combos
**Size:** ~300 lines
**Key Features:**
- Table display with sorting
- Search functionality
- Pagination (10 items per page)
- Edit, view, delete actions
- Create new combo button
- Loading and error states

**Dependencies:**
- `useGetInstructorCombosQuery`
- `useDeleteComboMutation`
- NextUI components (Table, Button, Chip, etc.)

### 2. `/instructor/combos/create/page.tsx`
**Purpose:** Create new course combo
**Size:** ~280 lines
**Key Features:**
- Form with name, description, discount, active toggle
- Visual grid course selection
- Real-time form validation
- Selected courses preview
- Loading states

**Dependencies:**
- `useCreateComboMutation`
- `useGetInstructorCoursesQuery`
- NextUI components (Input, Select, Card, etc.)

### 3. `/instructor/combos/[comboId]/page.tsx`
**Purpose:** Display combo details and pricing
**Size:** ~200 lines
**Key Features:**
- Combo information display
- Stat cards (courses, discount, status)
- Pricing summary with calculations
- Table of courses in combo
- Edit button

**Dependencies:**
- `useGetComboByIdQuery`
- NextUI components

### 4. `/instructor/combos/[comboId]/edit/page.tsx`
**Purpose:** Edit existing combo
**Size:** ~280 lines
**Key Features:**
- Pre-populated form from combo data
- Same form structure as create page
- Updated course selection
- Update button instead of create

**Dependencies:**
- `useGetComboByIdQuery`
- `useUpdateComboMutation`
- `useGetInstructorCoursesQuery`

## Component Hierarchy

```
InstructorLayout (existing)
├── InstructorSidebar (MODIFIED)
│   ├── Quick Action Buttons
│   │   ├── New Course Button
│   │   └── New Combo Button
│   └── Navigation Menu
│       └── Course Combos (NEW)
│
└── Route Components
    ├── courses/create/page.tsx (existing)
    ├── combos/page.tsx (NEW)
    ├── combos/create/page.tsx (NEW)
    ├── combos/[comboId]/page.tsx (NEW)
    └── combos/[comboId]/edit/page.tsx (NEW)
```

## API Integration Points

### Redux Hooks Used

```typescript
// From @/redux/api/comboApi
useCreateComboMutation()        // POST /api/combos
useGetInstructorCombosQuery()   // GET /api/combos/instructor
useGetComboByIdQuery(id)        // GET /api/combos/{id}
useUpdateComboMutation()        // PUT /api/combos/{id}
useDeleteComboMutation()        // DELETE /api/combos/{id}

// From @/redux/api/courseApi
useGetInstructorCoursesQuery()  // GET /api/courses/instructor
```

## Route Paths

```
Instructor Dashboard
├── /instructor                           - Dashboard (existing)
├── /instructor/courses                   - Course list (existing)
├── /instructor/courses/create            - Create course (existing)
├── /instructor/combos                    - Combo list (NEW)
├── /instructor/combos/create             - Create combo (NEW)
├── /instructor/combos/[comboId]          - Combo details (NEW)
├── /instructor/combos/[comboId]/edit     - Edit combo (NEW)
├── /instructor/assessments               - Assessments (existing)
├── /instructor/quizzes                   - Quizzes (existing)
├── /instructor/live-classes              - Live classes (existing)
├── /instructor/analytics                 - Analytics (existing)
├── /instructor/blogs                     - Blogs (existing)
└── /instructor/tickets                   - Support tickets (existing)
```

## File Sizes (Approximate)

| File | Lines | Size |
|------|-------|------|
| InstructorSidebar.tsx (modified) | 271 | ~9 KB |
| combos/page.tsx | 300 | ~10 KB |
| combos/create/page.tsx | 280 | ~9 KB |
| combos/[comboId]/page.tsx | 200 | ~7 KB |
| combos/[comboId]/edit/page.tsx | 280 | ~9 KB |
| **Total New Code** | **~1,360** | **~44 KB** |

## Dependencies

### Existing (No New Packages Needed)
- ✅ React 18+
- ✅ Next.js 14+
- ✅ NextUI v2
- ✅ Redux Toolkit Query
- ✅ React Icons
- ✅ TailwindCSS
- ✅ js-cookie

All dependencies already present in project.json

## UI Components Used

From NextUI:
- `Button`
- `Card` & `CardBody`
- `Input`
- `Select` & `SelectItem`
- `Switch`
- `Textarea`
- `Checkbox`
- `Chip`
- `Badge`
- `Spinner`
- `Table`, `TableHeader`, `TableColumn`, `TableBody`, `TableRow`, `TableCell`
- `Tooltip`
- `Pagination`
- `Divider`

From React Icons:
- `FaPlus` - Plus icon (new action buttons)
- `FaEdit` - Edit icon
- `FaTrash` - Delete icon
- `FaEye` - View icon
- `FaSearch` - Search icon
- `FaBook` - Book icon
- `FaTags` - Tags icon
- `FaPercent` - Percent icon
- `FaArrowLeft` - Back arrow

## TypeScript Interfaces

```typescript
interface Combo {
  _id: string;
  name: string;
  description: string;
  courses: Course[];
  discountPercentage: number;
  isActive: boolean;
  instructorId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Course {
  _id: string;
  title: string;
  category: Category;
  price: number;
  level: string;
  type: "live" | "recorded";
  // ... other fields
}
```

## Styling System

### Color Scheme
- **Primary**: Blue (`from-blue-500 to-cyan-600`)
- **Success**: Green (`from-green-500 to-emerald-600`)
- **Warning**: Yellow
- **Danger**: Red
- **Neutral**: Gray

### Responsive Breakpoints
- **Mobile**: < 1024px (hamburger menu)
- **Tablet**: 1024px - 1536px (collapsed sidebar)
- **Desktop**: > 1536px (full sidebar)

### Spacing & Layout
- Container max-width: 4xl (56rem) for forms
- Container max-width: 7xl (80rem) for lists
- Grid gaps: 3-4 units
- Padding: 4-6 units

## State Management

### Component State
- `isOpen` - Mobile sidebar toggle
- `isCollapsed` - Desktop sidebar collapse
- `page` - Pagination current page
- `searchTerm` - Search input value
- `form` - Combo form data
- `selectedCourses` - Selected course IDs array
- `errors` - Form validation errors

### Redux State
- Combos list cached
- Individual combo data cached
- Courses list cached
- Mutations for CRUD operations

## Error Handling

All pages include:
- Try-catch blocks for API calls
- Field-level validation errors
- General error messages
- Loading state indicators
- Error state UI components

## Documentation Files Created

1. **ADMIN_SIDEBAR_ENHANCEMENT.md** - Comprehensive documentation
2. **COMBO_QUICK_START.md** - User quick reference guide
3. **FILE_STRUCTURE.md** - This file

## Testing Checklist

- [ ] Sidebar displays with quick action buttons
- [ ] "New Course" button navigates to `/instructor/courses/create`
- [ ] "New Combo" button navigates to `/instructor/combos/create`
- [ ] Combo list loads and displays combos
- [ ] Search filters combos by name/description
- [ ] Pagination works correctly
- [ ] Create combo form validates all fields
- [ ] Course selection works with visual feedback
- [ ] Combo details show correct pricing calculations
- [ ] Edit combo pre-populates form correctly
- [ ] Delete combo removes it from list
- [ ] Mobile sidebar shows quick buttons correctly
- [ ] Sidebar collapses on desktop properly
