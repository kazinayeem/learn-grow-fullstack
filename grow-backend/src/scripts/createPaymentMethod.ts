import mongoose from "mongoose";
import { PaymentMethod } from "../modules/payment/model/payment-method.model";
import { ENV } from "../config/env";

async function createDefaultPaymentMethods() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(ENV.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Check if payment methods already exist
    const existingCount = await PaymentMethod.countDocuments();
    if (existingCount > 0) {
      console.log(`ℹ️  ${existingCount} payment method(s) already exist`);
      const methods = await PaymentMethod.find();
      console.log("\nExisting payment methods:");
      methods.forEach((method, index) => {
        console.log(`${index + 1}. ${method.name} - ${method.accountNumber} (${method.isActive ? 'Active' : 'Inactive'})`);
      });
      
      const readline = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      readline.question("\nDo you want to add more payment methods? (y/n): ", async (answer: string) => {
        readline.close();
        if (answer.toLowerCase() !== "y") {
          console.log("Exiting...");
          await mongoose.disconnect();
          process.exit(0);
        }
        await addPaymentMethods();
      });
    } else {
      await addPaymentMethods();
    }
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

async function addPaymentMethods() {
  try {
    const paymentMethods = [
      {
        name: "bKash",
        accountNumber: "01712345678",
        paymentNote: `📱 bKash পেমেন্ট করতে:
1. আপনার bKash অ্যাপ খুলুন
2. "Send Money" সিলেক্ট করুন
3. নম্বর: 01712345678
4. পরিমাণ: আপনার কোর্সের মূল্য
5. পেমেন্ট সম্পন্ন করুন
6. Transaction ID সংরক্ষণ করুন

⚠️ গুরুত্বপূর্ণ: Transaction ID অবশ্যই সঠিক হতে হবে`,
        isActive: true,
        order: 1,
      },
      {
        name: "Nagad",
        accountNumber: "01812345678",
        paymentNote: `📱 Nagad পেমেন্ট করতে:
1. আপনার Nagad অ্যাপ খুলুন
2. "Send Money" সিলেক্ট করুন
3. নম্বর: 01812345678
4. পরিমাণ: আপনার কোর্সের মূল্য
5. পেমেন্ট সম্পন্ন করুন
6. Transaction ID সংরক্ষণ করুন

⚠️ গুরুত্বপূর্ণ: Transaction ID অবশ্যই সঠিক হতে হবে`,
        isActive: true,
        order: 2,
      },
      {
        name: "Rocket",
        accountNumber: "01912345678",
        paymentNote: `📱 Rocket পেমেন্ট করতে:
1. আপনার Rocket অ্যাপ খুলুন
2. "Send Money" সিলেক্ট করুন
3. নম্বর: 01912345678
4. পরিমাণ: আপনার কোর্সের মূল্য
5. পেমেন্ট সম্পন্ন করুন
6. Transaction ID সংরক্ষণ করুন

⚠️ গুরুত্বপূর্ণ: Transaction ID অবশ্যই সঠিক হতে হবে`,
        isActive: true,
        order: 3,
      },
    ];

    console.log("\nCreating payment methods...");
    
    for (const method of paymentMethods) {
      const created = await PaymentMethod.create(method);
      console.log(`✅ Created: ${created.name} - ${created.accountNumber}`);
    }

    console.log("\n✅ All payment methods created successfully!");
    
    // Display all payment methods
    const allMethods = await PaymentMethod.find().sort({ order: 1 });
    console.log("\n📋 All Payment Methods:");
    allMethods.forEach((method, index) => {
      console.log(`\n${index + 1}. ${method.name}`);
      console.log(`   Account: ${method.accountNumber}`);
      console.log(`   Status: ${method.isActive ? '✅ Active' : '❌ Inactive'}`);
      console.log(`   Order: ${method.order}`);
    });

    await mongoose.disconnect();
    console.log("\n✅ Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating payment methods:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

createDefaultPaymentMethods();
