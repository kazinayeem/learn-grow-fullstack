#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Patterns to remove
const patterns = [
  /console\s*\.\s*log\s*\([^)]*\)\s*;?\s*\n/g,
  /console\s*\.\s*warn\s*\([^)]*\)\s*;?\s*\n/g,
  /console\s*\.\s*info\s*\([^)]*\)\s*;?\s*\n/g,
  /console\s*\.\s*debug\s*\([^)]*\)\s*;?\s*\n/g,
  // Handle console.error cases - but we want to preserve error handling, just remove the log
  /\s*console\s*\.\s*error\s*\([^)]*\)\s*;?\s*\n/g,
];

const extensions = ['*.ts', '*.tsx', '*.js'];
const ignoreDirs = ['node_modules', 'dist', '.next', '.git', 'build'];

function shouldIgnore(filePath) {
  return ignoreDirs.some(dir => filePath.includes(`\\${dir}\\`) || filePath.includes(`/${dir}/`));
}

function removeConsoleLogs(content) {
  let result = content;
  patterns.forEach(pattern => {
    result = result.replace(pattern, '\n');
  });
  // Clean up multiple consecutive newlines
  result = result.replace(/\n\n\n+/g, '\n\n');
  return result;
}

function processFile(filePath) {
  if (shouldIgnore(filePath)) return;

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const originalLength = content.length;
    const newContent = removeConsoleLogs(content);
    
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      const removed = originalLength - newContent.length;
      console.log(`✓ ${filePath} (removed ${removed} bytes)`);
    }
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
  }
}

// Process learn-grow directory
console.log('Processing learn-grow directory...');
['learn-grow/lib/**/*.ts', 'learn-grow/components/**/*.tsx', 'learn-grow/app/**/*.tsx', 'learn-grow/*.js'].forEach(pattern => {
  glob.sync(pattern).forEach(processFile);
});

// Process grow-backend directory
console.log('\nProcessing grow-backend directory...');
['grow-backend/src/**/*.ts'].forEach(pattern => {
  glob.sync(pattern).forEach(processFile);
});

console.log('\nDone!');
