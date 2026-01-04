import { Request, Response } from 'express';
import { Course } from '../course/model/course.model.js';
import { Order } from '../order/model/order.model.js';
import { User } from '../user/model/user.model.js';
import { Enrollment } from '../enrollment/model/enrollment.model.js';
import { Quiz } from '../quiz/model/quiz.model.js';
import { LiveClass } from '../liveClass/model/liveClass.model.js';

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    // Get current date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 🚀 OPTIMIZATION: Run all database queries in parallel using Promise.all()
    const [
      totalUsers,
      totalStudents,
      totalInstructors,
      totalCourses,
      publishedCourses,
      totalOrders,
      approvedOrders,
      totalEnrollments,
      newUsersThisMonth,
      newUsersLastMonth,
      activeUsers,
      revenueData,
      revenueThisMonth,
      revenueLastMonth,
      completionStats,
      enrollmentTrend,
      revenueTrend,
      topCourses,
      categoryDistribution,
      orderStatusDistribution,
      planTypeDistribution,
      recentOrders,
      recentEnrollments
    ] = await Promise.all([
      // User counts (4 queries)
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'instructor' }),
      User.countDocuments({ lastLoginAt: { $gte: last7Days } }),
      
      // Course counts (2 queries)
      Course.countDocuments(),
      Course.countDocuments({ isPublished: true, isAdminApproved: true }),
      
      // Order counts (2 queries)
      Order.countDocuments(),
      Order.countDocuments({ paymentStatus: 'approved' }),
      
      // Enrollment count (1 query)
      Enrollment.countDocuments(),
      
      // New users this month and last month (2 queries)
      User.countDocuments({ createdAt: { $gte: startOfMonth } }),
      User.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      
      // Active users (1 query)
      User.countDocuments({ lastLoginAt: { $gte: last7Days } }),
      
      // Revenue aggregations (3 queries)
      Order.aggregate([
        { $match: { paymentStatus: 'approved' } },
        { $group: { _id: null, totalRevenue: { $sum: '$price' }, averageOrderValue: { $avg: '$price' } } }
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'approved', createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$price' } } }
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'approved', createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
        { $group: { _id: null, total: { $sum: '$price' } } }
      ]),
      
      // Completion stats (1 query)
      Enrollment.aggregate([
        { $group: { _id: null, totalEnrollments: { $sum: 1 }, completedEnrollments: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } } } }
      ]),
      
      // Trends and distributions (5 queries)
      Enrollment.aggregate([
        { $match: { createdAt: { $gte: last30Days } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'approved', createdAt: { $gte: last30Days } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$price' }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Course.aggregate([
        { $match: { isPublished: true, isAdminApproved: true } },
        { $lookup: { from: 'enrollments', localField: '_id', foreignField: 'courseId', as: 'enrollments' } },
        { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'categoryInfo' } },
        { $addFields: { enrollmentCount: { $size: '$enrollments' }, categoryId: { $arrayElemAt: ['$categoryInfo', 0] } } },
        { $sort: { enrollmentCount: -1 } },
        { $limit: 10 },
        { $project: { title: 1, enrollmentCount: 1, rating: 1, studentsEnrolled: 1, price: 1, category: 1, categoryId: { _id: 1, name: 1 } } }
      ]),
      Course.aggregate([
        { $match: { isPublished: true, isAdminApproved: true } },
        { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'categoryInfo' } },
        { $group: { _id: '$category', count: { $sum: 1 }, categoryName: { $first: { $arrayElemAt: ['$categoryInfo.name', 0] } } } },
        { $sort: { count: -1 } }
      ]),
      Order.aggregate([{ $group: { _id: '$paymentStatus', count: { $sum: 1 } } }]),
      Order.aggregate([
        { $match: { paymentStatus: 'approved' } },
        { $group: { _id: '$planType', count: { $sum: 1 }, revenue: { $sum: '$price' } } }
      ]),
      
      // Recent activities (2 queries)
      Order.find().sort({ createdAt: -1 }).limit(10).populate('userId', 'name email').populate('courseId', 'title').lean(),
      Enrollment.find().sort({ createdAt: -1 }).limit(10).populate('studentId', 'name email').populate('courseId', 'title').lean()
    ]);

    // Extract values from aggregation results
    const totalRevenue = revenueData[0]?.totalRevenue || 0;
    const averageOrderValue = revenueData[0]?.averageOrderValue || 0;
    const currentMonthRevenue = revenueThisMonth[0]?.total || 0;
    const lastMonthRevenue = revenueLastMonth[0]?.total || 0;
    const completionRate = completionStats[0]
      ? (completionStats[0].completedEnrollments / completionStats[0].totalEnrollments) * 100
      : 0;

    // Prepare response
    const analytics = {
      overview: {
        totalUsers,
        totalStudents,
        totalInstructors,
        totalCourses,
        publishedCourses,
        totalOrders,
        approvedOrders,
        totalEnrollments,
        activeUsers,
        completionRate: completionRate.toFixed(2)
      },
      revenue: {
        total: totalRevenue,
        currentMonth: currentMonthRevenue,
        lastMonth: lastMonthRevenue,
        averageOrderValue,
        growth: lastMonthRevenue > 0
          ? (((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(2)
          : 0
      },
      growth: {
        newUsersThisMonth,
        newUsersLastMonth,
        userGrowth: newUsersLastMonth > 0
          ? (((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100).toFixed(2)
          : 0
      },
      trends: {
        enrollments: enrollmentTrend,
        revenue: revenueTrend
      },
      topCourses,
      distributions: {
        categories: categoryDistribution,
        orderStatus: orderStatusDistribution,
        planTypes: planTypeDistribution
      },
      recentActivity: {
        orders: recentOrders,
        enrollments: recentEnrollments
      }
    };

    res.status(200).json({
      success: true,
      message: 'Analytics retrieved successfully',
      data: analytics
    });
  } catch (error: any) {
    console.error('Error getting analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve analytics',
      error: error.message
    });
  }
};
