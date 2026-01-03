#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const { Course } = require('./dist/modules/course/model/course.model');
const { Enrollment } = require('./dist/modules/enrollment/model/enrollment.model');
const { Order } = require('./dist/modules/order/model/order.model');

const testCourseId = '6958a103cb4d1db94f9f4d64';

async function testStats() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/grow');
        console.log('✅ Connected to MongoDB');

        // Check if course exists
        const course = await Course.findById(testCourseId);
        if (!course) {
            console.log('❌ Course not found:', testCourseId);
            process.exit(1);
        }
        console.log('✅ Course found:', course.title);

        // Check enrollments
        const enrollments = await Enrollment.aggregate([
            { $match: { courseId: new mongoose.Types.ObjectId(testCourseId) } },
            {
                $facet: {
                    totalEnrolled: [{ $count: "count" }],
                    completedStudents: [
                        { $match: { isCompleted: true } },
                        { $count: "count" }
                    ],
                    engagedStudents: [
                        {
                            $match: {
                                $or: [
                                    { progress: { $gt: 0 } },
                                    { completionPercentage: { $gt: 0 } },
                                    { completedLessons: { $exists: true, $ne: [] } }
                                ]
                            }
                        },
                        { $count: "count" }
                    ]
                }
            }
        ]);

        const totalEnrolled = enrollments[0]?.totalEnrolled[0]?.count || 0;
        const completedCount = enrollments[0]?.completedStudents[0]?.count || 0;
        const engagedCount = enrollments[0]?.engagedStudents[0]?.count || 0;

        console.log('📊 Enrollments:', { totalEnrolled, completedCount, engagedCount });

        // Check revenue
        const revenueResult = await Order.aggregate([
            {
                $match: {
                    courseId: new mongoose.Types.ObjectId(testCourseId),
                    paymentStatus: "approved"
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$price" }
                }
            }
        ]);

        const totalRevenue = revenueResult[0]?.totalRevenue || 0;
        console.log('💰 Revenue:', totalRevenue, 'BDT');

        // Calculate rates
        const completionRate = totalEnrolled > 0 ? Math.round((completedCount / totalEnrolled) * 100) : 0;
        const engagementRate = totalEnrolled > 0 ? Math.round((engagedCount / totalEnrolled) * 100) : 0;

        console.log('\n✅ FINAL STATS:');
        console.log({
            enrolledStudents: totalEnrolled,
            completionRate,
            engagementRate,
            revenue: totalRevenue,
            completedStudents: completedCount,
            engagedStudents: engagedCount
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

testStats();
