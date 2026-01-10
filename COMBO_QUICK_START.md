# Instructor Sidebar & Combo Management - Quick Reference

## 🎯 What's New

### Sidebar Enhancement
The instructor sidebar now includes two prominent quick-action buttons at the top:
1. **New Course** - Creates a new course
2. **New Combo** - Creates a new course combo/bundle

### New Menu Item
- **Course Combos** - Navigate to combo management area

## 📍 Routes & Pages

### Combo Management Routes
| Route | Page | Purpose |
|-------|------|---------|
| `/instructor/combos` | Combo List | View all instructor combos |
| `/instructor/combos/create` | Create Combo | Create new combo |
| `/instructor/combos/[comboId]` | Combo Details | View combo details & pricing |
| `/instructor/combos/[comboId]/edit` | Edit Combo | Edit existing combo |

## 🚀 Usage Guide

### Creating a Course Combo

1. **From Sidebar:**
   - Click "New Combo" blue button in sidebar (top section)
   - Or click "Course Combos" menu item → Click "New Combo" button

2. **Fill the Form:**
   - **Combo Name**: Give your bundle a name (e.g., "Web Development Bundle")
   - **Discount Percentage**: Set discount for students (0-100%)
   - **Description**: Describe the combo benefits
   - **Select Courses**: Check the courses to include (visual grid selection)
   - **Active Toggle**: Activate/deactivate the combo

3. **Review:**
   - Selected courses shown in chips below
   - Can see course details: level, category, price

4. **Submit:**
   - Click "Create Combo"
   - Redirected to combo list on success

### Managing Combos

**From Combo List** (`/instructor/combos`):
- **View**: Click eye icon to see details & pricing breakdown
- **Edit**: Click pencil icon to modify combo
- **Delete**: Click trash icon to remove combo
- **Search**: Use search bar to filter by name/description
- **Pagination**: Navigate pages at bottom

**From Combo Details** (`/instructor/combos/[comboId]`):
- View full pricing summary with discount amount
- See all courses in the combo with their original prices
- Edit or go back to list

**From Combo Edit** (`/instructor/combos/[comboId]/edit`):
- Modify combo name, description, discount, courses
- Same form as create page
- Changes saved to database

## 📊 Pricing Example

If you create a combo with:
- **Course A**: ৳5,000
- **Course B**: ৳3,000
- **Course C**: ৳2,000
- **Discount**: 20%

**Calculation:**
```
Original Total: ৳10,000
Discount (20%): -৳2,000
Combo Price:    ৳8,000
```

Students save ৳2,000 by buying the combo!

## 🎨 Design Details

### Quick Action Buttons
- **New Course** (Green): `from-green-500 to-emerald-600`
- **New Combo** (Blue): `from-blue-500 to-cyan-600`
- Hidden on mobile when sidebar is collapsed
- Visible when sidebar is expanded

### Navigation Menu
- **Course Combos** appears after "My Courses"
- Uses people icon (FaUsers)
- Highlights when on combo routes

### Table Styling
- Clean white background
- Hover effects on rows
- Color-coded chips for status
- Icons for quick actions

## ✨ Features

✅ **One-Click Creation** - Quick buttons in sidebar
✅ **Course Selection** - Visual grid with checkboxes
✅ **Instant Validation** - Required field checks
✅ **Pricing Preview** - See exact discount amounts
✅ **Full CRUD** - Create, view, edit, delete combos
✅ **Search & Filter** - Find combos quickly
✅ **Pagination** - Handle many combos smoothly
✅ **Responsive** - Works on mobile & desktop
✅ **Loading States** - Visual feedback while loading
✅ **Error Handling** - Clear error messages

## 🔧 Technical Stack

- **Frontend**: React 18+, Next.js 14+
- **UI Framework**: NextUI v2
- **State Management**: Redux Toolkit Query
- **Styling**: TailwindCSS
- **Icons**: React Icons (FontAwesome)
- **Backend**: Node.js/Express (already implemented)
- **Database**: MongoDB

## 📝 Form Validation Rules

### Combo Name
- Minimum 3 characters
- Required field

### Description
- Minimum 20 characters
- Required field
- Can include any text

### Discount Percentage
- Minimum: 0%
- Maximum: 100%
- Whole number only
- Required field

### Courses
- Minimum: 1 course
- Maximum: Unlimited
- Required: At least one must be selected

## 🔗 API Integration

Uses these Redux API hooks:
- `useCreateComboMutation()` - POST /api/combos
- `useGetInstructorCombosQuery()` - GET /api/combos/instructor
- `useGetComboByIdQuery(id)` - GET /api/combos/{id}
- `useUpdateComboMutation()` - PUT /api/combos/{id}
- `useDeleteComboMutation()` - DELETE /api/combos/{id}

## 💡 Tips & Tricks

1. **Search Combos**: Use search to quickly find older combos
2. **Bulk Selection**: Click on course cards to toggle, or use checkboxes
3. **Mobile**: Use hamburger menu on mobile to access sidebar
4. **Collapse Sidebar**: Click toggle button to save screen space
5. **Pricing Math**: Discount is applied to total of all courses

## ❓ FAQ

**Q: Can I create a combo with just one course?**
A: No, minimum 1 course (single-course combos don't make sense)

**Q: Can I edit a combo after creating it?**
A: Yes, click the edit icon from combo list or details page

**Q: What happens if I delete a combo?**
A: Combo is removed, but courses remain in system

**Q: Can students see the discount?**
A: Yes, on course listing and checkout

**Q: Can I have 0% discount?**
A: Yes, but it's not recommended (no incentive for students)

**Q: What if a course in combo is deleted?**
A: Course reference is removed from combo; combo remains

## 🚨 Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Min 3 characters" | Combo name too short | Add more characters to name |
| "Min 20 characters" | Description too short | Write longer description |
| "Must be between 0-100" | Invalid discount % | Enter 0-100 |
| "Select at least one course" | No courses selected | Check at least one course |
| "Failed to create combo" | Server error | Check form and try again |
| "Combo not found" | Invalid combo ID | Go back and try again |

## 📞 Support

For issues with:
- **Course Creation**: Check course page
- **Combo Creation**: Fill all required fields
- **API Errors**: Check network connection
- **UI Issues**: Refresh page or clear cache
