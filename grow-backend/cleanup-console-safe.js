const fs = require('fs');
const path = require('path');

function removeConsoleFromFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // 1. Remove .catch with inline console.error on same/next line
    // Pattern: .catch((err) => \n              console.error(...))
    content = content.replace(/\.catch\s*\(\s*\w+\s*\)\s*=>\s*\n\s*console\.(error|log|warn)\([^;]*\);?/gm, '');
    
    // 2. Remove standalone console lines
    content = content.replace(/^\s*console\.(log|error|warn|info|debug|trace)\([^;]*;?\n/gm, '');
    
    // 3. Remove redis.on with console handlers
    content = content.replace(/redis\.on\(\s*['"][^'"]*['"],\s*\([^)]*\)\s*=>\s*console\.(log|error)\([^;]*\)\);?/gm, '');
    
    // 4. Remove catch((err) => { console.error(...) })
    content = content.replace(/\.catch\s*\(\s*\([^)]*\)\s*=>\s*\{\s*console\.(error|log|warn)\([^;]*\);\s*\}\s*\)/gm, '');
    
    // 5. Remove .catch(console.error)
    content = content.replace(/\.catch\s*\(\s*console\.(error|log)\s*\)/gm, '');
    
    // 6. Clean up dangling arrow functions: .catch((err) =>
    content = content.replace(/\.catch\s*\(\s*\([^)]*\)\s*=>\s*\n\s*\)/gm, '');
    
    // 7. Remove any orphaned console.error statements in catch error handlers
    content = content.replace(/\)\s*\.catch\s*\(\s*err\s*=>\s*console\.(error|log|warn)\([^;]*\)\);?/gm, ')');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
  } catch (err) {
    console.error(`Error processing ${filePath}: ${err.message}`);
  }
  return false;
}

function processDirectory(dir) {
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        processDirectory(filePath);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      removeConsoleFromFile(filePath);
    }
  });
}

console.log('🔍 Removing console statements safely...');
processDirectory('./src');
console.log('✅ Done!');

