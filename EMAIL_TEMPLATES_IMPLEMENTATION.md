# Professional Email Templates - Learn & Grow

## Overview
All order-related emails now use professional, branded templates with Learn & Grow branding, logo, and corporate styling.

## Features Implemented

### 1. **Brand Integration**
- ✅ Learn & Grow logo in header (from `/public/logo.png`)
- ✅ Professional gradient header with brand colors
- ✅ Consistent footer with contact info & social links
- ✅ Brand color scheme: Sky Blue (#0ea5e9) for primary, Green (#10b981) for success, Red (#ef4444) for errors
- ✅ Professional typography and spacing

### 2. **Email Templates Created**

#### A. **Order Confirmation Email** (Student receives after order)
- Recipient: Student
- Status: ✅ Confirmation with approval notice
- Features:
  - Professional header with logo
  - Green success badge
  - Order details table (ID, Plan, Course, Amount, Transaction ID)
  - Conditional delivery address (only shows for KIT orders)
  - Conditional bank details (only shows for PREMIUM/QUARTERLY orders)
  - Next steps guidance
  - Help contact information
  - Professional footer

#### B. **Admin Order Approval Request Email** (Admin receives to approve/reject)
- Recipient: Admin
- Status: 🔔 Pending review with action buttons
- Features:
  - Professional header with logo
  - Red "Pending" badge
  - Student information section
  - Complete order information table
  - Payment method details (if available)
  - Delivery address (if applicable)
  - Approve/Reject buttons (clickable links)
  - Note about link expiration (48 hours)
  - Professional footer

#### C. **Order Approved Email** (Student receives after admin approval)
- Recipient: Student
- Status: 🎉 Order approved with instant access
- Features:
  - Professional header with logo
  - Green success badge
  - "Access is Now Active" announcement
  - Getting started guide
  - Order summary
  - Help & support contact
  - Professional footer

#### D. **Order Rejected Email** (Student receives if rejected)
- Recipient: Student
- Status: ⚠️ Rejection notice with support options
- Features:
  - Professional header with logo
  - Red warning badge
  - Rejection notice with optional reason
  - Order details
  - What you can do section
  - Support contact information
  - Professional footer

### 3. **Smart Conditional Logic**

#### Delivery Address
- **ONLY shows for**: KIT orders (`planType === "kit"`)
- **Hidden for**: Single course, Quarterly plans
- Includes: Name, Phone, Full Address, City, Postal Code

#### Bank Details
- **Shows for**: PREMIUM and QUARTERLY orders
- **Includes**: Bank name, Account holder, Account number, Routing number (if available)
- **Style**: Yellow warning box (looks official for bank info)

#### Payment Method Info
- **Shows for**: Orders with payment method attached
- **Includes**: Method name and account number (masked if applicable)

### 4. **Files Modified**

1. **Created**: `grow-backend/src/utils/emailTemplates.ts`
   - All template functions exported for reuse
   - Centralized branding and styling
   - Helper functions for conditional sections

2. **Updated**: `grow-backend/src/modules/order/service/order.service.ts`
   - Imported professional templates
   - Uses `getOrderConfirmationEmail()` for student confirmation
   - Uses `getAdminOrderApprovalEmail()` for admin approval requests
   - Passes structured order data to templates

3. **Updated**: `grow-backend/src/modules/order/controller/order.controller.ts`
   - Uses `getOrderApprovedEmail()` when order is approved
   - Uses `getOrderRejectedEmail()` when order is rejected
   - Populates all related data (user, course, payment method)
   - Professional subject lines with emojis

### 5. **Email Styling**
- **Responsive Design**: Works on mobile, tablet, desktop
- **Font**: Segoe UI, Tahoma, Geneva, Verdana (web-safe)
- **Colors**:
  - Primary (Blue): #0ea5e9
  - Success (Green): #10b981
  - Danger (Red): #ef4444
  - Secondary (Purple): #8b5cf6 (for Premium plans)
  - Dark Text: #1f2937
  - Light Text: #6b7280
  - Light Background: #f9fafb

### 6. **Subject Lines**
- **Confirmation**: `Order Confirmation - [PLAN_TYPE] | Learn & Grow`
- **Admin Review**: `🔔 New Order Pending Review - [STUDENT_NAME] | Learn & Grow`
- **Approved**: `🎉 Your Order Has Been Approved | Learn & Grow`
- **Rejected**: `Order Status Update | Learn & Grow`

### 7. **Contact Information Included**
- Email: info@learnandgrow.io
- Phone: +880 1706-276447
- Website: learnandgrow.io
- Social: Facebook, Instagram links

### 8. **Data Structure**
Each template accepts an `OrderDetails` interface:
```typescript
{
  orderId: string;
  studentName: string;
  studentEmail: string;
  planType: "single" | "quarterly" | "kit" | "premium";
  courseTitle?: string;
  price: number;
  transactionId: string;
  paymentMethod?: string;
  paymentAccount?: string;
  deliveryAddress?: {...};
  bankDetails?: {...};
  createdAt: string;
}
```

## Testing Recommendations

1. **Test Single Course Order**
   - Should NOT show delivery address
   - Should NOT show bank details
   - Only basic order info

2. **Test Kit Order**
   - SHOULD show delivery address
   - Should NOT show bank details (unless premium)
   - Full delivery section visible

3. **Test Premium/Quarterly Order**
   - SHOULD show bank details
   - May show delivery address if kit included
   - Premium badge styling applied

4. **Test Email Rendering**
   - Gmail
   - Outlook
   - Apple Mail
   - Mobile clients

## Benefits

✅ **Professional**: Corporate-grade email templates
✅ **Branded**: Learn & Grow logo and colors throughout
✅ **Smart**: Conditional sections based on order type
✅ **Accessible**: Responsive design works everywhere
✅ **Informative**: Clear next steps and support info
✅ **Secure**: Signed token-based approval links (48hr expiry)
✅ **Centralized**: All templates in one file for easy updates
✅ **Multilingual Ready**: Can add Bangla translations easily

## Future Enhancements

- Add Bangla language versions
- Add course preview images
- Add student progress tracking email
- Add course materials download link
- Add discussion forum access confirmation
- Add certificate template when course completed
