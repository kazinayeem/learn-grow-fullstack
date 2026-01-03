import { Request, Response } from "express";
import { Order } from "../model/order.model";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import { Course } from "../../course/model/course.model";
import {
  createOrderService,
  getUserOrdersService,
  getAllOrdersService,
  approveOrderService,
  rejectOrderService,
  getStudentEnrollmentService,
  checkCourseAccessService,
  getEnrolledStudentsService,
} from "../service/order.service";

// Create new order
export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized - Please login" });
    }

    // Validate required fields
    const { planType, paymentMethodId, transactionId, senderNumber, price } = req.body;
    
    if (!planType || !paymentMethodId || !transactionId || !senderNumber) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields: planType, paymentMethodId, transactionId, senderNumber" 
      });
    }

    // Validate courseId for single course purchases
    if (planType === "single" && !req.body.courseId) {
      return res.status(400).json({ 
        success: false, 
        message: "courseId is required for single course purchases" 
      });
    }

    // Validate delivery address for quarterly and kit
    if ((planType === "quarterly" || planType === "kit") && !req.body.deliveryAddress) {
      return res.status(400).json({ 
        success: false, 
        message: "Delivery address is required for quarterly and kit plans" 
      });
    }

    console.log("Creating order for user:", userId, "with data:", req.body);

    const result = await createOrderService(userId, req.body);

    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        message: result.message 
      });
    }

    console.log("Order created successfully:", result.data?._id);

    return res.status(201).json({
      success: true,
      message: "অর্ডার সফলভাবে তৈরি হয়েছে! প্রশাসকের অনুমোদনের অপেক্ষায়। | Order created successfully! Waiting for admin approval.",
      data: result.data,
    });
  } catch (error: any) {
    console.error("Create order error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create order", 
      error: error.message 
    });
  }
};

// Get all orders (Admin only)
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const { status, planType, page = 1, limit = 10 } = req.query;

    const result = await getAllOrdersService({
      status: status as string,
      planType: planType as string,
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string) || 10,
    });

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }

    return res.json({
      success: true,
      orders: result.data,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error("Get all orders error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch orders", error: error.message });
  }
};

// Get order by ID
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(id)
      .populate("userId", "name email role phone")
      .populate("courseId", "title thumbnail instructor")
      .populate("paymentMethodId", "name accountNumber paymentNote");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ order });
  } catch (error: any) {
    console.error("Get order by ID error:", error);
    res.status(500).json({ message: "Failed to fetch order", error: error.message });
  }
};

// Get user's own orders
export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const result = await getUserOrdersService(userId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json({ success: true, orders: result.data, data: result.data });
  } catch (error: any) {
    console.error("Get user orders error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch orders", error: error.message });
  }
};

// Approve order (Admin only)
export const approveOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    const result = await approveOrderService(id);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json({ success: true, message: result.message, order: result.data, data: result.data });
  } catch (error: any) {
    console.error("Approve order error:", error);
    res.status(500).json({ success: false, message: "Failed to approve order", error: error.message });
  }
};

// Reject order (Admin only)
export const rejectOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.paymentStatus === "rejected") {
      return res.status(400).json({ message: "Order already rejected" });
    }

    order.paymentStatus = "rejected";
    order.isActive = false;
    if (reason) {
      order.paymentNote = `${order.paymentNote || ""}\n[Admin Rejection Reason: ${reason}]`;
    }

    await order.save();

    await order.populate([
      { path: "userId", select: "name email" },
      { path: "courseId", select: "title" },
    ]);

    // TODO: Send rejection email notification

    res.json({
      success: true,
      message: "Order rejected",
      order,
      data: order,
    });
  } catch (error: any) {
    console.error("Reject order error:", error);
    res.status(500).json({ success: false, message: "Failed to reject order", error: error.message });
  }
};

// Check active subscription for user
export const checkActiveSubscription = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const now = new Date();

    // Find active quarterly subscription
    const subscription = await Order.findOne({
      userId,
      planType: "quarterly",
      paymentStatus: "approved",
      isActive: true,
      endDate: { $gte: now },
    }).sort({ endDate: -1 });

    if (subscription) {
      return res.json({
        hasActiveSubscription: true,
        subscription: {
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          daysRemaining: Math.ceil((subscription.endDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
        },
      });
    }

    // Check if subscription expired
    const expiredSubscription = await Order.findOne({
      userId,
      planType: "quarterly",
      paymentStatus: "approved",
      endDate: { $lt: now },
    }).sort({ endDate: -1 });

    if (expiredSubscription) {
      // Auto-deactivate expired subscription
      expiredSubscription.isActive = false;
      await expiredSubscription.save();

      return res.json({
        hasActiveSubscription: false,
        expired: true,
        lastExpiredDate: expiredSubscription.endDate,
      });
    }

    res.json({
      hasActiveSubscription: false,
      expired: false,
    });
  } catch (error: any) {
    console.error("Check subscription error:", error);
    res.status(500).json({ message: "Failed to check subscription", error: error.message });
  }
};

// Get user's purchased courses (for single course plan)
export const getUserPurchasedCourses = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = 9;
    const skip = (page - 1) * limit;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const now = new Date();

    const singleCourses = await Order.find({
      userId,
      planType: "single",
      paymentStatus: "approved",
      isActive: true,
      endDate: { $gte: now },
    })
      .populate("courseId", "title thumbnail instructor duration")
      .select("courseId startDate endDate planType");

    const quarterlyOrder = await Order.findOne({
      userId,
      planType: "quarterly",
      paymentStatus: "approved",
      isActive: true,
      endDate: { $gte: now },
    });

    let allCourses: any[] = [];
    let totalCourses = 0;

    if (quarterlyOrder) {
      totalCourses = await Course.countDocuments({
        isPublished: true,
        isAdminApproved: true,
      });

      const allPublishedCourses = await Course.find({
        isPublished: true,
        isAdminApproved: true,
      })
        .populate("instructorId", "name email")
        .select("_id title thumbnail instructorId duration")
        .limit(limit)
        .skip(skip)
        .lean();

      allCourses = allPublishedCourses.map((course: any) => ({
        course: {
          _id: course._id,
          title: course.title,
          thumbnail: course.thumbnail,
          instructor: course.instructorId,
          duration: course.duration,
        },
        accessUntil: quarterlyOrder.endDate,
        accessType: "quarterly",
      }));
    } else {
      totalCourses = singleCourses.length;
      const paginatedCourses = singleCourses.slice(skip, skip + limit);
      allCourses = paginatedCourses.map(order => ({
        course: order.courseId,
        accessUntil: order.endDate,
        accessType: "single",
      }));
    }

    res.json({
      courses: allCourses,
      pagination: {
        total: totalCourses,
        page,
        limit,
        totalPages: Math.ceil(totalCourses / limit),
      },
      hasQuarterlyAccess: !!quarterlyOrder,
    });
  } catch (error: any) {
    console.error("Get purchased courses error:", error);
    res.status(500).json({ message: "Failed to fetch purchased courses", error: error.message });
  }
};

// Get enrolled students for a course (Instructor only)
export const getEnrolledStudents = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { courseId } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: "Invalid course ID" });
    }

    const result = await getEnrolledStudentsService(courseId, userId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error: any) {
    console.error("Get enrolled students error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch enrolled students", 
      error: error.message 
    });
  }
};

// Send order email (approval/rejection with invoice)
export const sendOrderEmail = async (req: Request, res: Response) => {
  try {
    const { to, subject, type, orderDetails } = req.body;

    if (!to || !subject || !type || !orderDetails) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: to, subject, type, orderDetails"
      });
    }

    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    let htmlContent = "";

    if (type === "approval") {
      const { userName, orderId, courseTitle, price, approvalDate, planType, transactionId } = orderDetails;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
          <div style="background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px;">
              <h1 style="color: #3b82f6; margin: 0; font-size: 28px;">✅ Order Approved!</h1>
              <p style="color: #666; margin: 5px 0 0 0;">Learn Grow Academy</p>
            </div>
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Hello <strong>${userName}</strong>,</p>
            <p style="font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 20px;">
              We're excited to inform you that your payment has been <strong style="color: #10b981;">verified and approved</strong>! Your account is now activated.
            </p>
            <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <h2 style="color: #3b82f6; margin-top: 0; font-size: 18px;">📋 Invoice Details</h2>
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 10px 0; color: #666;"><strong>Order ID:</strong></td>
                  <td style="padding: 10px 0; color: #333; text-align: right;"><code style="background: white; padding: 4px 8px; border-radius: 3px;">${orderId.slice(-8)}</code></td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 10px 0; color: #666;"><strong>Plan Type:</strong></td>
                  <td style="padding: 10px 0; color: #333; text-align: right;">${planType}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 10px 0; color: #666;"><strong>Course/Plan:</strong></td>
                  <td style="padding: 10px 0; color: #333; text-align: right;">${courseTitle}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 10px 0; color: #666;"><strong>Amount:</strong></td>
                  <td style="padding: 10px 0; color: #333; text-align: right; font-weight: bold; font-size: 14px;">৳${price.toLocaleString('bn-BD')}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 10px 0; color: #666;"><strong>Transaction ID:</strong></td>
                  <td style="padding: 10px 0; color: #333; text-align: right; font-size: 12px;">${transactionId.slice(-10)}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #666;"><strong>Approval Date:</strong></td>
                  <td style="padding: 10px 0; color: #333; text-align: right;">${approvalDate}</td>
                </tr>
              </table>
            </div>
            <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <h3 style="color: #10b981; margin-top: 0; font-size: 16px;">🎓 Next Steps</h3>
              <ul style="color: #666; font-size: 13px; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>Your access will be activated within 24 hours</li>
                <li>You'll receive another email with your login credentials</li>
                <li>Check your dashboard at https://learngrow.com</li>
                <li>Start learning with unlimited course access</li>
              </ul>
            </div>
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #999;">
              <p style="margin: 5px 0;">Learn Grow Academy | Making Education Accessible</p>
              <p style="margin: 5px 0;">© 2025 Learn Grow. All rights reserved.</p>
            </div>
          </div>
        </div>
      `;
    } else if (type === "rejection") {
      const { userName, orderId, transactionId, price } = orderDetails;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
          <div style="background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #ef4444; padding-bottom: 20px;">
              <h1 style="color: #ef4444; margin: 0; font-size: 28px;">❌ Order Rejected</h1>
              <p style="color: #666; margin: 5px 0 0 0;">Learn Grow Academy</p>
            </div>
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Hello <strong>${userName}</strong>,</p>
            <p style="font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 20px;">
              Unfortunately, your order payment could not be verified and has been <strong style="color: #ef4444;">rejected</strong>.
            </p>
            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <h3 style="color: #ef4444; margin-top: 0; font-size: 16px;">Rejection Details</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr style="border-bottom: 1px solid #fee2e2;">
                  <td style="padding: 10px 0; color: #666;"><strong>Order ID:</strong></td>
                  <td style="padding: 10px 0; color: #333; text-align: right;"><code style="background: white; padding: 4px 8px; border-radius: 3px;">${orderId.slice(-8)}</code></td>
                </tr>
                <tr style="border-bottom: 1px solid #fee2e2;">
                  <td style="padding: 10px 0; color: #666;"><strong>Amount:</strong></td>
                  <td style="padding: 10px 0; color: #333; text-align: right; font-weight: bold;">৳${price.toLocaleString('bn-BD')}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #666;"><strong>Transaction ID:</strong></td>
                  <td style="padding: 10px 0; color: #333; text-align: right; font-size: 12px;">${transactionId.slice(-10)}</td>
                </tr>
              </table>
            </div>
            <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <h3 style="color: #3b82f6; margin-top: 0; font-size: 16px;">💡 What Now?</h3>
              <ul style="color: #666; font-size: 13px; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>Verify the transaction details provided</li>
                <li>Contact our support team for more information</li>
                <li>You can retry with corrected payment information</li>
                <li>Our team will assist you within 24 hours</li>
              </ul>
            </div>
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #999;">
              <p style="margin: 5px 0;">Learn Grow Academy | Making Education Accessible</p>
              <p style="margin: 5px 0;">© 2025 Learn Grow. All rights reserved.</p>
            </div>
          </div>
        </div>
      `;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "Email sent successfully"
    });
  } catch (error: any) {
    console.error("Send order email error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send email",
      error: error.message
    });
  }
};

// Get student's orders for guardian or student viewing own data
export const getStudentOrdersForGuardian = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;
    const { studentId: queryStudentId } = req.query;

    console.log(`[GuardianAPI] ========== REQUEST START ==========`);
    console.log(`[GuardianAPI] userId from token: ${userId}, userRole: ${userRole}`);
    console.log(`[GuardianAPI] queryStudentId from params: ${queryStudentId}`);
    console.log(`[GuardianAPI] Full query params:`, req.query);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { User } = await import("../../user/model/user.model");
    const { Enrollment } = await import("../../enrollment/model/enrollment.model");
    const { Lesson } = await import("../../course/model/lesson.model");

    let studentIdToFetch = userId;

    console.log(`[GuardianAPI] userId: ${userId}, userRole: ${userRole}, queryStudentId: ${queryStudentId}`);

    // If guardian, get their linked child (student) from GuardianProfile
    if (userRole === "guardian") {
      const { GuardianProfile } = await import("../../user/model/guardianProfile.model");
      
      // Query GuardianProfile to get the authoritative student link
      const guardianProfiles = await GuardianProfile.find({ userId }).select("studentId");
      
      console.log(`[GuardianAPI] guardianId: ${userId}`);
      console.log(`[GuardianAPI] Found ${guardianProfiles.length} guardian profile(s)`);
      console.log(`[GuardianAPI] Guardian profile studentIds:`, guardianProfiles.map((gp: any) => gp.studentId?.toString()));

      if (!guardianProfiles || guardianProfiles.length === 0) {
        return res.json({ 
          success: true, 
          data: { 
            orders: [], 
            enrollments: [],
            message: "No linked student found"
          } 
        });
      }

      // If studentId is provided as query param, verify it belongs to this guardian
      if (queryStudentId && typeof queryStudentId === 'string') {
        const linkedStudentIds = guardianProfiles.map((gp: any) => 
          gp.studentId?.toString()
        );
        
        console.log(`[GuardianAPI] Verifying if ${queryStudentId} is linked to guardian ${userId}`);
        console.log(`[GuardianAPI] Guardian's linked students:`, linkedStudentIds);
        
        if (linkedStudentIds.includes(queryStudentId)) {
          studentIdToFetch = queryStudentId;
          console.log(`[GuardianAPI] Guardian ${userId} verified access to student: ${studentIdToFetch}`);
        } else {
          return res.status(403).json({ 
            success: false, 
            message: "You do not have permission to view this student's data. This student is not linked to your account." 
          });
        }
      } else {
        // Otherwise, get their first linked student from GuardianProfile
        const firstProfile = guardianProfiles[0];
        studentIdToFetch = firstProfile.studentId?.toString() || (firstProfile.studentId ? firstProfile.studentId.toString() : '');
        console.log(`[GuardianAPI] Guardian ${userId} accessing default linked student: ${studentIdToFetch}`);
      }
    }
    // If student, verify they're trying to access their own data
    else if (userRole === "student") {
      // Student can only view their own data
      studentIdToFetch = userId;
      console.log(`[GuardianAPI] Student accessing own data: ${studentIdToFetch}`);
    } else {
      // Other roles not allowed
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    // Get student's orders
    const orders = await Order.find({ userId: studentIdToFetch })
      .populate("courseId", "title thumbnail price")
      .populate("paymentMethodId", "name accountNumber")
      .sort({ createdAt: -1 })
      .lean();
    
    console.log(`[GuardianAPI] Found ${orders.length} orders for student ${studentIdToFetch}`);
    console.log(`[GuardianAPI] Order course IDs:`, orders.map((o: any) => o.courseId?._id || o.courseId));

    // Get student's enrollments
    const enrollments = await Enrollment.find({ studentId: studentIdToFetch })
      .populate("courseId", "title thumbnail price level")
      .sort({ createdAt: -1 })
      .lean();
    
    console.log(`[GuardianAPI] Query filter: studentId = ${studentIdToFetch}`);
    console.log(`[GuardianAPI] Found ${enrollments.length} enrollments for student ${studentIdToFetch}`);
    
    if (enrollments.length > 0) {
      console.log(`[GuardianAPI] Enrollment details:`, enrollments.map((e: any) => ({
        _id: e._id,
        studentId: e.studentId,
        courseTitle: e.courseId?.title,
        courseId: e.courseId?._id,
        progress: e.progress,
        createdAt: e.createdAt
      })));
    }

    // Check for quarterly (all-access) subscription
    const now = new Date();
    const quarterlyOrder = await Order.findOne({
      userId: studentIdToFetch,
      planType: "quarterly",
      paymentStatus: "approved",
      isActive: true,
      endDate: { $gte: now },
    }).lean();

    let allCourseEnrollments: any[] = [...enrollments];
    let hasQuarterlyAccess = false;

    // If student has quarterly subscription, fetch all published courses
    if (quarterlyOrder) {
      hasQuarterlyAccess = true;
      console.log(`[GuardianAPI] Student has quarterly subscription, fetching all courses`);
      
      const allPublishedCourses = await Course.find({
        isPublished: true,
        isAdminApproved: true,
      })
        .select("_id title thumbnail price level")
        .lean();

      // Filter out courses already in enrollments
      const enrolledCourseIds = enrollments.map((e: any) => e.courseId._id.toString());
      const additionalCourses = allPublishedCourses.filter(
        (c: any) => !enrolledCourseIds.includes(c._id.toString())
      );

      // Add courses without enrollment records (quarterly access)
      const quarterlyEnrollments = additionalCourses.map((course: any) => ({
        _id: `quarterly-${course._id}`,
        studentId: studentIdToFetch,
        courseId: course,
        progress: 0,
        completionPercentage: 0,
        isCompleted: false,
        completedLessons: [],
        completedModules: [],
        completedAssignments: [],
        completedQuizzes: [],
        completedProjects: [],
        createdAt: quarterlyOrder.createdAt,
        updatedAt: quarterlyOrder.updatedAt,
        accessType: "quarterly",
      }));

      allCourseEnrollments = [...enrollments, ...quarterlyEnrollments];
      console.log(`[GuardianAPI] Total courses with quarterly access: ${allCourseEnrollments.length}`);
    }

    // Fetch module data for each course to calculate progress
    const { Module } = await import("../../course/model/module.model");
    
    const enrichedEnrollments = await Promise.all(
      allCourseEnrollments.map(async (enrollment: any) => {
        try {
          const modules = await Module.find({ courseId: enrollment.courseId._id }).lean();
          
          // For each module, get lesson count
          const modulesWithLessons = await Promise.all(
            modules.map(async (module: any) => {
              const lessons = await Lesson.find({ moduleId: module._id }).lean();
              return {
                _id: module._id,
                title: module.title,
                orderIndex: module.orderIndex,
                lessons: lessons
              };
            })
          );
          
          return {
            _id: enrollment._id,
            studentId: enrollment.studentId,
            courseId: {
              _id: enrollment.courseId._id,
              title: enrollment.courseId.title,
              thumbnail: enrollment.courseId.thumbnail,
              price: enrollment.courseId.price,
              level: enrollment.courseId.level,
              modules: modulesWithLessons
            },
            progress: enrollment.progress || 0,
            completionPercentage: enrollment.completionPercentage || 0,
            isCompleted: enrollment.isCompleted || false,
            completedLessons: enrollment.completedLessons || [],
            createdAt: enrollment.createdAt,
            updatedAt: enrollment.updatedAt,
            accessType: enrollment.accessType || "enrollment",
          };
        } catch (enrollmentError) {
          console.error("Error processing enrollment:", enrollmentError);
          return null;
        }
      })
    );

    // Filter out any null enrollments (errors)
    const validEnrollments = enrichedEnrollments.filter(e => e !== null);

    return res.json({
      success: true,
      data: {
        orders,
        enrollments: validEnrollments,
        hasQuarterlyAccess,
        student: {
          _id: studentIdToFetch,
        },
        _debug: {
          guardianId: userId,
          linkedStudentId: studentIdToFetch,
          enrollmentCount: validEnrollments.length,
          orderCount: orders.length
        }
      }
    });
  } catch (error: any) {
    console.error("Get student orders error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch student data", 
      error: error.message 
    });
  }
};
