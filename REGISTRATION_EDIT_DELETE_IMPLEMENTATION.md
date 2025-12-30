# Event Registration Edit & Delete Feature Implementation

## Overview
Added complete edit and delete functionality to the admin event registrations page at `/admin/events/[eventId]/registrations/`. The delete action includes a SweetAlert confirmation popup, and users can edit registration details through a modal.

---

## Changes Made

### 1. Backend Implementation

#### A. Service Layer (`grow-backend/src/modules/event/service/event.service.ts`)
- **Added** `updateRegistration()` method to handle registration updates
  - Accepts: `id`, and optional fields: `fullName`, `email`, `phoneNumber`
  - Returns updated registration document

#### B. Controller Layer (`grow-backend/src/modules/event/controller/event.controller.ts`)
- **Added** `updateRegistration()` controller handler
  - Validates that at least one field is provided for update
  - Returns 404 if registration not found
  - Returns 400 if no fields provided
  - Returns updated registration on success

#### C. Routes (`grow-backend/src/modules/event/routes/event.route.ts`)
- **Added** PATCH route: `/events/registrations/:id`
  - Protected with admin authentication
  - Calls `updateRegistration` controller

### 2. Frontend API Layer

#### A. Redux API (`learn-grow/redux/api/eventApi.ts`)
- **Added** `updateRegistration` mutation
  - Endpoint: `PATCH /events/registrations/:id`
  - Invalidates tags: `["EventRegistration", "Event"]`
- **Added** `useUpdateRegistrationMutation` to exports
  - Can be used in components as: `const [updateRegistration] = useUpdateRegistrationMutation()`

### 3. Frontend UI Implementation

#### A. Dependencies (`learn-grow/package.json`)
- **Added** `sweetalert2: ^11.15.10` for confirmation dialogs

#### B. Registrations Page (`learn-grow/app/admin/events/[id]/registrations/page.tsx`)

##### Imports Added:
```tsx
import { FaEdit, FaTrash } from "react-icons/fa";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";
import { useDeleteRegistrationMutation, useUpdateRegistrationMutation } from "@/redux/api/eventApi";
import Swal from "sweetalert2";
```

##### New State Variables:
```tsx
const [editingId, setEditingId] = useState<string | null>(null);
const [editFormData, setEditFormData] = useState({ fullName: "", email: "", phoneNumber: "" });
const { isOpen, onOpen, onClose } = useDisclosure();
```

##### New Handler Functions:

1. **`handleDelete(registrationId)`**
   - Shows SweetAlert confirmation with:
     - Title: "Are you sure?"
     - Warning icon
     - Confirmation color: Red (#ef4444)
     - Cancel color: Gray (#6b7280)
   - On confirmation: Deletes registration via API
   - Shows toast notification on success/error

2. **`handleEditClick(registration)`**
   - Loads registration data into edit form
   - Opens modal for editing

3. **`handleSaveEdit()`**
   - Validates all fields are filled
   - Calls `updateRegistration` mutation
   - Closes modal on success
   - Shows appropriate toast notifications

##### Table Modifications:

1. **Added "ACTIONS" column** to table header
2. **Added action buttons** for each registration:
   - **Edit Button** (Blue pencil icon)
     - Opens modal with registration data
     - Allows editing: Full Name, Email, Phone Number
   - **Delete Button** (Red trash icon)
     - Triggers SweetAlert confirmation
     - Deletes on confirmation

##### New Edit Modal:
- **Modal Features:**
  - Title: "Edit Registration"
  - Input fields for: Full Name, Email, Phone Number
  - Cancel button (closes without saving)
  - Save Changes button (saves with loading state)
- **Form Validation:**
  - All fields required before saving
  - Shows error toast if validation fails

---

## Features

### Delete Confirmation (SweetAlert)
```
┌─────────────────────────────────────┐
│  Are you sure?                      │
│  You will not be able to recover    │
│  this registration!                 │
│                                     │
│  [Cancel]          [Yes, delete it!]│
└─────────────────────────────────────┘
```

### Edit Modal
- Fields: Full Name, Email, Phone Number
- All fields are required
- Real-time validation
- Loading state on save button
- Toast notifications for feedback

---

## Usage

### For Admin Users:

1. **Edit a Registration:**
   - Click the blue Edit button (pencil icon) for any registration
   - Modal opens with current registration details
   - Update any fields
   - Click "Save Changes"
   - Toast confirms success or shows error

2. **Delete a Registration:**
   - Click the red Delete button (trash icon) for any registration
   - SweetAlert confirmation popup appears
   - Choose "Yes, delete it!" to confirm or "Cancel" to abort
   - Toast confirms successful deletion or shows error

---

## API Endpoints

### Update Registration (NEW)
```
PATCH /events/registrations/:id
Content-Type: application/json
Authorization: Bearer <admin-token>

Request Body:
{
  "fullName": "New Name",
  "email": "new@example.com",
  "phoneNumber": "+880XXXXXXXXX"
}

Response:
{
  "success": true,
  "message": "Registration updated successfully",
  "data": {
    "_id": "...",
    "fullName": "New Name",
    "email": "new@example.com",
    "phoneNumber": "+880XXXXXXXXX",
    ...
  }
}
```

### Delete Registration (Already Existed - Enhanced)
```
DELETE /events/registrations/:id
Authorization: Bearer <admin-token>

Response:
{
  "success": true,
  "message": "Registration deleted successfully"
}
```

---

## Testing Checklist

- [ ] Install new packages: `npm install` in `/learn-grow` folder
- [ ] Admin can see Edit and Delete buttons on registrations page
- [ ] Clicking Edit opens modal with registration details
- [ ] Modal validation prevents saving empty fields
- [ ] Saving updates registration in database
- [ ] Clicking Delete shows SweetAlert confirmation
- [ ] Confirming delete removes registration from database
- [ ] Toast notifications show for all actions
- [ ] Table refreshes after edit/delete without page reload
- [ ] All form fields (Full Name, Email, Phone) are editable

---

## Files Modified

1. ✅ `grow-backend/src/modules/event/service/event.service.ts`
2. ✅ `grow-backend/src/modules/event/controller/event.controller.ts`
3. ✅ `grow-backend/src/modules/event/routes/event.route.ts`
4. ✅ `learn-grow/redux/api/eventApi.ts`
5. ✅ `learn-grow/package.json`
6. ✅ `learn-grow/app/admin/events/[id]/registrations/page.tsx`

---

## Notes

- All changes are backward compatible
- Admin authentication is required for both edit and delete operations
- Deleting a registration automatically decrements the event's registered count
- Edit modal closes automatically on successful save
- All errors are properly handled with user-friendly toast messages
- SweetAlert uses consistent styling with danger colors for delete operations
