#!/usr/bin/env node

/**
 * DEPLOYMENT VERIFICATION CHECKLIST
 * Course Statistics Implementation
 * 
 * Run this to verify all changes are in place
 */

const fs = require('fs');
const path = require('path');

const checks = [
  {
    name: 'Backend Service Function',
    file: 'grow-backend/src/modules/course/service/course.service.ts',
    pattern: 'export const getCourseStats = async',
    type: 'contains',
  },
  {
    name: 'Backend Controller Function',
    file: 'grow-backend/src/modules/course/controller/course.controller.ts',
    pattern: 'export const getCourseStats = async',
    type: 'contains',
  },
  {
    name: 'Backend Route',
    file: 'grow-backend/src/modules/course/routes/course.route.ts',
    pattern: '/get-course-stats/:id',
    type: 'contains',
  },
  {
    name: 'RTK Query Hook Import',
    file: 'learn-grow/redux/api/courseApi.ts',
    pattern: 'useGetCourseStatsQuery',
    type: 'contains',
  },
  {
    name: 'Frontend Hook Import',
    file: 'learn-grow/app/instructor/courses/[courseId]/ClientPage.tsx',
    pattern: 'useGetCourseStatsQuery',
    type: 'contains',
  },
  {
    name: 'Frontend Hook Usage',
    file: 'learn-grow/app/instructor/courses/[courseId]/ClientPage.tsx',
    pattern: 'const { data: statsResponse, isLoading: statsLoading } = useGetCourseStatsQuery(courseId);',
    type: 'contains',
  },
  {
    name: 'Frontend Stats Display - Engagement',
    file: 'learn-grow/app/instructor/courses/[courseId]/ClientPage.tsx',
    pattern: 'courseStats?.engagementRate',
    type: 'contains',
  },
  {
    name: 'Frontend Stats Display - Completion',
    file: 'learn-grow/app/instructor/courses/[courseId]/ClientPage.tsx',
    pattern: 'courseStats?.completionRate',
    type: 'contains',
  },
  {
    name: 'Frontend Stats Display - Revenue',
    file: 'learn-grow/app/instructor/courses/[courseId]/ClientPage.tsx',
    pattern: 'courseStats?.revenue',
    type: 'contains',
  },
  {
    name: 'Skeleton Loading',
    file: 'learn-grow/app/instructor/courses/[courseId]/ClientPage.tsx',
    pattern: 'statsLoading',
    type: 'contains',
  },
];

const baseDir = process.cwd();
let passed = 0;
let failed = 0;

console.log('='.repeat(80));
console.log('DEPLOYMENT VERIFICATION CHECKLIST - Course Statistics Implementation');
console.log('='.repeat(80));
console.log();

checks.forEach((check) => {
  const filePath = path.join(baseDir, check.file);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`❌ ${check.name}`);
      console.log(`   File not found: ${check.file}`);
      failed++;
      return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    if (check.type === 'contains') {
      if (content.includes(check.pattern)) {
        console.log(`✅ ${check.name}`);
        passed++;
      } else {
        console.log(`❌ ${check.name}`);
        console.log(`   Pattern not found: "${check.pattern}"`);
        console.log(`   File: ${check.file}`);
        failed++;
      }
    }
  } catch (error) {
    console.log(`❌ ${check.name}`);
    console.log(`   Error: ${error.message}`);
    failed++;
  }
});

console.log();
console.log('='.repeat(80));
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('='.repeat(80));

if (failed === 0) {
  console.log('\n✅ ALL CHECKS PASSED - Ready for deployment!\n');
  process.exit(0);
} else {
  console.log('\n❌ SOME CHECKS FAILED - Review the errors above\n');
  process.exit(1);
}
