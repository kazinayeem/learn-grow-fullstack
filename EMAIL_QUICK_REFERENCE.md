# Professional Email Templates - Quick Reference Guide

## 🎯 Quick Start

### Import Templates in Your Code
```typescript
import {
  getOrderConfirmationEmail,
  getAdminOrderApprovalEmail,
  getOrderApprovedEmail,
  getOrderRejectedEmail
} from "@/utils/emailTemplates";
```

### Prepare Order Data
```typescript
const orderDetails = {
  orderId: "order_123abc",
  studentName: "Ahmed Khan",
  studentEmail: "ahmed@example.com",
  planType: "single", // or "quarterly", "kit", "premium"
  courseTitle: "Advanced Robotics", // optional
  price: 3500,
  transactionId: "TRX123456789",
  paymentMethod: "bKash", // optional
  paymentAccount: "0191234567", // optional
  deliveryAddress: { // optional, shows for KIT orders only
    name: "Ahmed Khan",
    phone: "+8801912345678",
    fullAddress: "123 Main Street",
    city: "Dhaka",
    postalCode: "1205"
  },
  bankDetails: { // optional, shows for PREMIUM orders only
    bankName: "Dhaka Bank",
    accountHolder: "Learn & Grow Ltd",
    accountNumber: "123456789",
    routingNumber: "987654321" // optional
  },
  createdAt: "2026-01-07T10:30:00Z"
};
```

---

## 📧 Template Functions

### 1. Order Confirmation (To Student)
```typescript
const html = getOrderConfirmationEmail(orderDetails);
await transporter.sendMail({
  from: ENV.EMAIL_USER,
  to: orderDetails.studentEmail,
  subject: `Order Confirmation - ${orderDetails.planType.toUpperCase()} | Learn & Grow`,
  html: html
});
```

**When to use:** After student creates an order
**Shows:** ✅ Confirmation, Next steps, Contact info

---

### 2. Admin Approval Request (To Admin)
```typescript
const html = getAdminOrderApprovalEmail(
  orderDetails,
  "https://backend.com/api/orders/email-action/approve-token",
  "https://backend.com/api/orders/email-action/reject-token"
);

await transporter.sendMail({
  from: ENV.EMAIL_USER,
  to: ENV.EMAIL_USER, // or admin email
  subject: `🔔 New Order Pending Review - ${orderDetails.studentName} | Learn & Grow`,
  html: html
});
```

**When to use:** Immediately after order is created
**Shows:** 🔔 Pending status, Action buttons (Approve/Reject)

---

### 3. Order Approved (To Student)
```typescript
const html = getOrderApprovedEmail(orderDetails);
await transporter.sendMail({
  from: ENV.EMAIL_USER,
  to: orderDetails.studentEmail,
  subject: `🎉 Your Order Has Been Approved | Learn & Grow`,
  html: html
});
```

**When to use:** After admin approves the order
**Shows:** 🎉 Success, Getting started guide, Order summary

---

### 4. Order Rejected (To Student)
```typescript
const html = getOrderRejectedEmail(
  orderDetails,
  "Payment verification failed" // optional reason
);

await transporter.sendMail({
  from: ENV.EMAIL_USER,
  to: orderDetails.studentEmail,
  subject: `Order Status Update | Learn & Grow`,
  html: html
});
```

**When to use:** After admin rejects the order
**Shows:** ⚠️ Rejection notice, What to do next, Support info

---

## 🎨 Branding Elements

### Colors Used
- **Primary**: #0ea5e9 (Sky Blue) - Headers, borders
- **Success**: #10b981 (Green) - Approvals, confirmations
- **Danger**: #ef4444 (Red) - Warnings, rejections
- **Premium**: #8b5cf6 (Purple) - Premium plan highlight

### Logo
- Source: `/public/logo.png`
- Height: 50px
- Margin: 15px bottom
- Included in every email header

### Company Info
- Name: Learn & Grow Academy
- Tagline: "Empowering the Next Generation"
- Email: info@learnandgrow.io
- Phone: +880 1706-276447
- Website: learnandgrow.io
- Social: Facebook, Instagram, LinkedIn

---

## 🚀 Current Implementation

### Order Service (`order.service.ts`)
```typescript
const sendOrderEmail = async (order: any) => {
  // Uses getOrderConfirmationEmail() - to student
  // Uses getAdminOrderApprovalEmail() - to admin with approve/reject links
};
```

### Order Controller (`order.controller.ts`)
```typescript
export const emailOrderAction = async (req: Request, res: Response) => {
  // Uses getOrderApprovedEmail() - when approved
  // Uses getOrderRejectedEmail() - when rejected
};
```

---

## 📋 Conditional Sections

### Delivery Address
- **Shows when:** `planType === "kit"`
- **Shows:** Name, Phone, Full Address, City, Postal Code
- **Example:** Kit orders that need shipping

### Bank Details
- **Shows when:** `planType === "premium" || planType === "quarterly"`
- **Shows:** Bank name, Account holder, Account number, Routing number
- **Style:** Yellow warning box (looks official)
- **Example:** For bank transfer payments

### Course Title
- **Shows when:** `courseTitle` is provided
- **Example:** Single course enrollment orders

### Payment Method
- **Shows when:** `paymentMethod` is provided
- **Shows:** Payment method name and optional account number
- **Example:** bKash, Nagad, Bank Transfer

---

## ✅ Testing Checklist

### Test Cases
- [ ] Single course order (no delivery, no bank details)
- [ ] Kit order (WITH delivery address, no bank details)
- [ ] Quarterly plan (no delivery, WITH bank details)
- [ ] Premium order (WITH both delivery AND bank details)
- [ ] Order with missing optional fields (should still render)
- [ ] Email renders correctly in Gmail
- [ ] Email renders correctly in Outlook
- [ ] Email renders correctly on mobile
- [ ] Approve button works (signed link valid 48h)
- [ ] Reject button works (signed link valid 48h)

---

## 🔒 Security Features

### Signed Tokens
- JWT signed with `ENV.JWT_SECRET`
- Expire in 48 hours (`expiresIn: "2d"`)
- Prevents tampering with order data
- One-time action per link (checked by controller)

### Link Format
```
https://backend.com/api/orders/email-action/{JWT_TOKEN}
```

---

## 🌐 Internationalization

All text is in English but can be easily translated:
```typescript
// Add language parameter to templates
export const getOrderConfirmationEmail = (
  orderDetails: OrderDetails,
  language: "en" | "bn" = "en"
) => {
  const messages = {
    en: { title: "Order Confirmed!", ... },
    bn: { title: "অর্ডার নিশ্চিত!", ... }
  };
  // Use messages[language] in template
};
```

---

## 📞 Support & Help Links

Included in footer:
- Help center link
- Support email
- Phone number
- Social media links
- Website link

---

## 🐛 Debugging

### If email not sending:
1. Check `ENV.EMAIL_USER` is set
2. Verify SMTP transporter is initialized
3. Check email logs: `console.error("Order email send failed:", error)`
4. Validate email addresses

### If template not rendering:
1. Check `orderDetails` object has all required fields
2. Verify `logo.png` URL is accessible
3. Test in different email clients
4. Check console for import errors

### If buttons not clickable:
1. Verify signed tokens are generated correctly
2. Check token expiry not exceeded
3. Verify backend URL (no double `/api`)
4. Test link directly in browser first

---

## 📝 TypeScript Interface

```typescript
interface OrderDetails {
  orderId: string;
  studentName: string;
  studentEmail: string;
  planType: "single" | "quarterly" | "kit" | "premium";
  courseTitle?: string;
  price: number;
  transactionId: string;
  paymentMethod?: string;
  paymentAccount?: string;
  deliveryAddress?: {
    name: string;
    phone: string;
    fullAddress: string;
    city: string;
    postalCode: string;
  };
  bankDetails?: {
    bankName: string;
    accountHolder: string;
    accountNumber: string;
    routingNumber?: string;
  };
  createdAt: string;
}
```

---

## 📊 Email Statistics

### Files Modified: 3
1. `/utils/emailTemplates.ts` (NEW - 440 lines)
2. `/modules/order/service/order.service.ts` (UPDATED)
3. `/modules/order/controller/order.controller.ts` (UPDATED)

### Template Functions: 4
1. `getOrderConfirmationEmail()`
2. `getAdminOrderApprovalEmail()`
3. `getOrderApprovedEmail()`
4. `getOrderRejectedEmail()`

### Email Sections: 8
- Header with logo
- Greeting/status
- Main content (order details, etc.)
- Conditional sections (delivery, bank)
- Call-to-action buttons
- Next steps/guidance
- Help/support section
- Footer with branding

---

## 🎓 Best Practices

1. **Always validate data** before passing to templates
2. **Test all variations** (with/without optional fields)
3. **Use proper subject lines** with emojis for quick identification
4. **Include contact info** in every email
5. **Make links clickable** but show full URL in plain text fallback
6. **Test in real email clients** not just browser preview
7. **Keep template files centralized** for easy updates
8. **Use env variables** for configuration

---

## 📅 Maintenance

### To update templates:
1. Edit `/utils/emailTemplates.ts`
2. Update colors in constants at top of file
3. Retest in all email clients
4. Deploy changes

### To add new email type:
1. Create new function in `emailTemplates.ts`
2. Follow same structure as existing templates
3. Import and use in controller/service
4. Add to documentation

---

## 🎁 Bonus Features Included

✅ Professional gradient header
✅ Responsive design (mobile, tablet, desktop)
✅ Brand logo and colors
✅ Contact information
✅ Social media links
✅ Next steps guidance
✅ Error/success messaging
✅ Conditional sections
✅ Accessible HTML
✅ Web-safe fonts
✅ Proper formatting
✅ Security tokens
✅ Multi-language ready

---

## 📞 Questions?

Refer to:
- `EMAIL_TEMPLATES_IMPLEMENTATION.md` - Full documentation
- `EMAIL_VISUAL_GUIDE.md` - Visual previews
- `emailTemplates.ts` - Source code comments
