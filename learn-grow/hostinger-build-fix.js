const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'out');
const newAssetsDirName = 'assets';
const oldAssetsDirName = '_next';

// 1. Rename _next to assets (if not already done)
const oldPath = path.join(outDir, oldAssetsDirName);
const newPath = path.join(outDir, newAssetsDirName);

if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
}

// 2. Recursively find all files and replace /_next/ with /assets/
function walkDir(dir, callback) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

const fileExtensionsToProcess = ['.html', '.js', '.css', '.json', '.txt'];

walkDir(outDir, function (filePath) {
    const ext = path.extname(filePath);
    if (fileExtensionsToProcess.includes(ext)) {
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            // Regex to match /_next/ but be careful about context
            // We want to replace "/_next/" url paths
            // escaping forward slashes for regex
            const regex = /\/_next\//g;

            if (regex.test(content)) {
                // Determine if we need to write back
                const newContent = content.replace(regex, `/${newAssetsDirName}/`);
                fs.writeFileSync(filePath, newContent, 'utf8');
            }
        } catch (e) {
            // Error processing file
        }
    }
});
