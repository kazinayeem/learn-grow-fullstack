# Database Migration & Setup Guide

## 📦 What to Do Before Running

### 1. Create Order Model (Already Done ✅)
- File: `grow-backend/src/modules/order/model/order.model.ts`
- Model: `Order`
- Collection: `orders`
- Status: **READY**

### 2. Update Routes (Already Done ✅)
- File: `grow-backend/src/app.ts`
- Added: `import orderRoutes from "@/modules/order/routes/order.route";`
- Added: `app.use("/api/orders", orderRoutes);`
- Status: **READY**

### 3. Add Payment Methods to Database

Before users can checkout, you need to have payment methods in the database:

#### Using MongoDB Compass or Mongo Shell:
```javascript
db.paymentmethods.insertMany([
  {
    name: "bKash",
    accountNumber: "01234567890",
    paymentNote: "Send Money to this bKash account",
    isActive: true,
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Nagad",
    accountNumber: "01234567890",
    paymentNote: "Send Money via Nagad",
    isActive: true,
    order: 2,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Rocket",
    accountNumber: "01234567890",
    paymentNote: "Send Money via Rocket",
    isActive: true,
    order: 3,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Bank Transfer",
    accountNumber: "1234567890123",
    paymentNote: "Bank Transfer (NPSB - National Payment Switch Bangladesh)",
    isActive: true,
    order: 4,
    createdAt: new Date(),
    updatedAt: new Date()
  }
])
```

#### Using Node.js Script:
```javascript
// scripts/seed-payment-methods.js
const mongoose = require('mongoose');

const paymentMethods = [
  {
    name: "bKash",
    accountNumber: "01234567890",
    paymentNote: "Send Money to this bKash account",
    isActive: true,
    order: 1
  },
  {
    name: "Nagad",
    accountNumber: "01234567890",
    paymentNote: "Send Money via Nagad",
    isActive: true,
    order: 2
  },
  {
    name: "Rocket",
    accountNumber: "01234567890",
    paymentNote: "Send Money via Rocket",
    isActive: true,
    order: 3
  },
  {
    name: "Bank Transfer",
    accountNumber: "1234567890123",
    paymentNote: "Bank Transfer (NPSB - National Payment Switch Bangladesh)",
    isActive: true,
    order: 4
  }
];

mongoose.connect('mongodb://localhost:27017/modular_db').then(() => {
  db.collection('paymentmethods').insertMany(paymentMethods, (err, result) => {
    if (err) console.error(err);
    else console.log(`${result.insertedCount} payment methods added`);
    mongoose.disconnect();
  });
});
```

---

## 🗄️ Database Collections

### orders Collection
```
{
  _id: ObjectId
  userId: ObjectId
  planType: String ("single" | "quarterly" | "kit" | "school")
  courseId: ObjectId (optional, required for planType="single")
  paymentMethodId: ObjectId
  transactionId: String
  senderNumber: String
  paymentNote: String
  paymentStatus: String ("pending" | "approved" | "rejected")
  deliveryAddress: {
    name: String
    phone: String
    fullAddress: String
    city: String
    postalCode: String
  }
  startDate: Date
  endDate: Date
  isActive: Boolean
  price: Number
  createdAt: Date
  updatedAt: Date
}

Indexes:
- userId, planType, isActive (for subscription checks)
- paymentStatus, createdAt (for admin list)
```

### paymentmethods Collection (Already Exists)
```
{
  _id: ObjectId
  name: String (flexible - can be "bKash", "Nagad", "Rocket", "Bank Transfer", or custom names)
  accountNumber: String
  paymentNote: String
  isActive: Boolean
  order: Number (for ordering in UI)
  createdAt: Date
  updatedAt: Date
}
```

---

## 🔍 Verify Setup

### 1. Check Order Model Imports
```bash
# Backend
grep -r "Order" grow-backend/src/modules/order/
```
Should show: model, controller, routes files exist

### 2. Check Routes Registration
```bash
# Open grow-backend/src/app.ts
# Look for: import orderRoutes and app.use("/api/orders", orderRoutes)
```

### 3. Verify Collections
```javascript
// MongoDB Shell
use modular_db
db.orders.count()           // Should be 0 initially
db.paymentmethods.find()    // Should show 4 methods
```

### 4. Test API Endpoints
```bash
# Test order creation (requires auth token)
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "planType": "quarterly",
    "paymentMethodId": "PAYMENT_METHOD_ID",
    "transactionId": "TXN123456",
    "senderNumber": "01700000000",
    "price": 9999,
    "deliveryAddress": {
      "name": "John Doe",
      "phone": "01700000000",
      "fullAddress": "123 Main St",
      "city": "Dhaka",
      "postalCode": "1200"
    }
  }'
```

---

## 🚀 Launch Steps

### Step 1: Backend Setup
```bash
cd grow-backend

# Install dependencies (if needed)
npm install

# Start MongoDB
# Make sure MongoDB is running on localhost:27017

# Seed payment methods
npm run seed:payment-methods  # If script exists, or manually add via MongoDB Compass

# Start server
npm run dev
# Should show: listening on port 5000
```

### Step 2: Frontend Setup
```bash
cd learn-grow

# Install dependencies (if needed)
npm install

# Start dev server
npm run dev
# Should show: ready on http://localhost:3000
```

### Step 3: Verify API Connection
- Open http://localhost:3000/pricing
- Should load without errors
- Click a plan → Should navigate to checkout or courses

### Step 4: Test Order Flow
1. **Create account** (student role)
2. **Login**
3. **Go to /pricing**
4. **Select Quarterly Plan**
5. **Fill checkout form with:**
   - Course selection (if single plan)
   - Payment method from dropdown
   - Sender number: 01700000000
   - Transaction ID: TEST123456
   - Delivery address (name, phone, address, city, postal)
6. **Submit**
7. **Check /student/orders** → Order should be visible as "pending"
8. **Login as admin**
9. **Go to /admin/orders**
10. **Find order and click Approve**
11. **Order status changes to "approved"**
12. **Start date + End date shown**

---

## ⚙️ Environment Variables

Ensure `.env` files have:

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/modular_db
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

---

## 🔧 Troubleshooting

### Issue: Order creation fails
**Solution**: Check if:
- ✅ User is logged in (token in request)
- ✅ Payment method exists in database
- ✅ courseId provided for single plan
- ✅ deliveryAddress provided for quarterly/kit plans
- ✅ All required fields filled

### Issue: Payment methods not showing in dropdown
**Solution**: Check if:
- ✅ Payment methods exist in database
- ✅ isActive = true for at least one
- ✅ API returns data: http://localhost:5000/api/payment-methods

### Issue: "Unauthorized" when submitting order
**Solution**: Check if:
- ✅ User is logged in
- ✅ Token is valid
- ✅ Auth middleware recognizes user

### Issue: Admin can't approve order
**Solution**: Check if:
- ✅ Logged in as admin user (role = "admin")
- ✅ Order exists and is pending
- ✅ PATCH request succeeds

---

## 📊 Sample Test Data

### Student Order (For Testing)
```javascript
// Insert manually if needed
db.orders.insertOne({
  userId: ObjectId("user_id_here"),
  planType: "quarterly",
  paymentMethodId: ObjectId("payment_method_id_here"),
  transactionId: "TEST123456",
  senderNumber: "01700000000",
  paymentNote: "Test order",
  paymentStatus: "pending",
  deliveryAddress: {
    name: "Test User",
    phone: "01700000000",
    fullAddress: "123 Test Street",
    city: "Dhaka",
    postalCode: "1200"
  },
  isActive: false,
  price: 9999,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

---

## ✅ Checklist

- [ ] Order model created in database
- [ ] Order routes registered in app.ts
- [ ] Payment methods added to database
- [ ] MongoDB is running
- [ ] Backend server is running (port 5000)
- [ ] Frontend server is running (port 3000)
- [ ] User can load pricing page
- [ ] User can select plan and checkout
- [ ] Admin can see orders
- [ ] Admin can approve orders
- [ ] Dates set correctly after approval
- [ ] Student can see orders
- [ ] Subscription widget shows status

---

## 🔄 Useful Commands

```bash
# Check MongoDB connection
mongosh mongodb://localhost:27017

# View all orders
db.orders.find()

# View payment methods
db.paymentmethods.find()

# Count pending orders
db.orders.countDocuments({ paymentStatus: "pending" })

# View specific user's orders
db.orders.find({ userId: ObjectId("user_id") })

# Update order manually
db.orders.updateOne(
  { _id: ObjectId("order_id") },
  { 
    $set: { 
      paymentStatus: "approved",
      startDate: new Date(),
      endDate: new Date(Date.now() + 90*24*60*60*1000),
      isActive: true
    }
  }
)
```

---

## 📝 Next Steps After Setup

1. **Test Complete Flow**: Create order → Admin approve → Check access
2. **Verify Expiry**: Test subscription expiration logic
3. **Check Middleware**: Test course access control
4. **Email Setup**: When ready, implement email notifications
5. **Guardian System**: Implement auto-guardian account creation
6. **Remove Instructor**: Remove instructor registration/login flow

