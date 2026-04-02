const fs = require("fs");
const path = require("path");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    throw new Error(`Source path does not exist: ${src}`);
  }
  ensureDir(path.dirname(dest));
  fs.cpSync(src, dest, { recursive: true, force: true });
}

function main() {
  const projectRoot = process.cwd();
  const standaloneRoot = path.join(projectRoot, ".next", "standalone");
  const standaloneNextDir = path.join(standaloneRoot, ".next");

  const staticSrc = path.join(projectRoot, ".next", "static");
  const staticDest = path.join(standaloneNextDir, "static");

  const publicSrc = path.join(projectRoot, "public");
  const publicDest = path.join(standaloneRoot, "public");

  if (!fs.existsSync(standaloneRoot)) {
    throw new Error("Standalone output not found. Run 'next build' first.");
  }

  ensureDir(standaloneNextDir);
  copyRecursive(staticSrc, staticDest);

  if (fs.existsSync(publicSrc)) {
    copyRecursive(publicSrc, publicDest);
  }

  console.log("Standalone assets prepared successfully.");
  console.log(`- Copied: ${staticSrc} -> ${staticDest}`);
  if (fs.existsSync(publicSrc)) {
    console.log(`- Copied: ${publicSrc} -> ${publicDest}`);
  }
}

main();
