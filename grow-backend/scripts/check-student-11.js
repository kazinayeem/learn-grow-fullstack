const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

// Models
const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model("User", userSchema);

const orderSchema = new mongoose.Schema({}, { strict: false });
const Order = mongoose.model("Order", orderSchema);

const enrollmentSchema = new mongoose.Schema({}, { strict: false });
const Enrollment = mongoose.model("Enrollment", enrollmentSchema);

const courseSchema = new mongoose.Schema({}, { strict: false });
const Course = mongoose.model("Course", courseSchema);

async function checkDatabase() {
  try {
    console.log("🔍 Connecting to database...");
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/learn-grow");
    console.log("✅ Connected to database\n");

    // Get all students
    console.log("📋 Checking all students and their orders...\n");
    
    const allStudents = await User.find({ role: "student" }).limit(20);
    
    if (allStudents.length === 0) {
      console.log("❌ No students found in database");
    } else {
      console.log(`Found ${allStudents.length} students\n`);
      
      for (const student of allStudents) {
        console.log(`\n👤 Student: ${student.name} (${student.email})`);
        console.log(`   ID: ${student._id}`);
        
        // Check orders
        const orders = await Order.find({ userId: student._id });
        console.log(`   Orders: ${orders.length}`);
        
        if (orders.length > 0) {
          for (const order of orders) {
            console.log(`\n   📦 Order ${order._id.toString().substring(0, 8)}...`);
            console.log(`      - Plan: ${order.planType}`);
            console.log(`      - Payment: ${order.paymentStatus}`);
            console.log(`      - Active: ${order.isActive}`);
            
            if (order.courseId) {
              const course = await Course.findById(order.courseId);
              console.log(`      - Course: ${course?.title || "Not found"}`);
              
              // Check enrollment
              const enrollment = await Enrollment.findOne({
                studentId: student._id,
                courseId: order.courseId,
              });
              
              if (enrollment) {
                console.log(`      ✅ Enrollment exists`);
              } else {
                console.log(`      ❌ MISSING ENROLLMENT - NEEDS FIX`);
              }
            }
          }
        }
        
        // Check enrollments
        const enrollments = await Enrollment.find({ studentId: student._id });
        if (enrollments.length > 0) {
          console.log(`   📚 Enrollments: ${enrollments.length}`);
        }
      }
    }

    // Also check for any orders without enrollments
    console.log("\n\n🔍 Checking for orders without enrollments...\n");
    const allOrders = await Order.find({ 
      planType: "single", 
      paymentStatus: "approved",
      isActive: true 
    }).limit(50);
    
    let fixedCount = 0;
    for (const order of allOrders) {
      if (order.courseId) {
        const enrollment = await Enrollment.findOne({
          studentId: order.userId,
          courseId: order.courseId,
        });
        
        if (!enrollment) {
          console.log(`\n⚠️  Found order without enrollment:`);
          console.log(`    Order ID: ${order._id}`);
          console.log(`    Student ID: ${order.userId}`);
          console.log(`    Course ID: ${order.courseId}`);
          
          // Create missing enrollment
          const newEnrollment = await Enrollment.create({
            studentId: order.userId,
            courseId: order.courseId,
            progress: 0,
            isCompleted: false,
            completedLessons: [],
            completedModules: [],
            completedAssignments: [],
            completedQuizzes: [],
            completedProjects: [],
          });
          
          console.log(`    ✅ Created enrollment: ${newEnrollment._id}`);
          fixedCount++;
        }
      }
    }
    
    if (fixedCount > 0) {
      console.log(`\n✅ Fixed ${fixedCount} missing enrollments`);
    } else {
      console.log("\n✅ All orders have enrollments");
    }

    await mongoose.disconnect();
    console.log("\n✅ Database check and fix complete\n");
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

checkDatabase();
