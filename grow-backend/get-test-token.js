#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');
const { Course } = require('./dist/modules/course/model/course.model');
const { User } = require('./dist/modules/user/model/user.model');

const courseId = '6958a103cb4d1db94f9f4d64';

async function getInstructor() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/grow');
        const course = await Course.findById(courseId).populate('instructorId');
        if (!course) {
            console.log('❌ Course not found');
            process.exit(1);
        }
        const instructorId = course.instructorId?._id;
        console.log('✅ Instructor ID:', instructorId.toString());
        
        // Generate token for this instructor
        const jwt = require('jsonwebtoken');
        const secret = 'your_jwt_secret_key_change_in_production';
        const token = jwt.sign(
            { id: instructorId.toString(), role: 'instructor' },
            secret,
            { expiresIn: '24h' }
        );
        console.log('✅ Test Token:', token);
        console.log('\n✅ Now test with:');
        console.log(`curl -s "http://localhost:5000/api/course/get-course-stats/${courseId}" \\`);
        console.log(`  -H "Authorization: Bearer ${token}"`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

getInstructor();
