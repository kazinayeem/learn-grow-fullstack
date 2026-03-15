import { Request, Response } from "express";
import { exec } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";

const execAsync = promisify(exec);

export const backupDatabase = async (req: Request, res: Response) => {
  const backupDir = path.join(process.cwd(), "backups");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").split("T")[0];
  const dumpDir = path.join(backupDir, `mongodb-dump-${timestamp}`);
  const tarGzPath = path.join(backupDir, `learn-grow-backup-${timestamp}.tar.gz`);

  try {
    // Ensure backups directory exists
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Clean up old backups (keep only last 7 days)
    cleanOldBackups(backupDir);

    // Get MongoDB connection string from environment
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/learn-grow";
    const dbName = mongoUri.split("/").pop()?.split("?")[0] || "learn-grow";

    console.log(`Starting MongoDB backup for database: ${dbName}`);
    console.log(`Dump directory: ${dumpDir}`);

    // Run mongodump command
    const dumpCommand = `mongodump --uri="${mongoUri}" --out="${dumpDir}"`;
    
    try {
      await execAsync(dumpCommand, {
        maxBuffer: 100 * 1024 * 1024, // 100MB buffer
        timeout: 5 * 60 * 1000, // 5 minutes timeout
      });
    } catch (dumpError: any) {
      console.error("Mongodump error:", dumpError.message);
      if (dumpError.message.includes("not found") || dumpError.message.includes("command not found")) {
        throw new Error(
          "mongodump command not found. Please ensure MongoDB tools are installed on your server. Install via:\n" +
          "- macOS: brew install mongodb-database-tools\n" +
          "- Linux: apt-get install mongodb-database-tools\n" +
          "- Others: Download from https://www.mongodb.com/try/download/database-tools"
        );
      }
      throw dumpError;
    }

    console.log("Mongodump completed successfully");

    // Create tar.gz archive using system tar command
    const tarCommand = `cd "${backupDir}" && tar -czf "${tarGzPath}" "${path.basename(dumpDir)}" && rm -rf "${dumpDir}"`;
    
    try {
      await execAsync(tarCommand, {
        maxBuffer: 100 * 1024 * 1024,
        timeout: 5 * 60 * 1000,
      });
    } catch (tarError: any) {
      console.error("Tar error:", tarError.message);
      if (fs.existsSync(dumpDir)) {
        removeDirectoryRecursively(dumpDir);
      }
      throw new Error("Failed to compress backup file: " + tarError.message);
    }

    console.log(`Backup tar.gz created: ${tarGzPath}`);

    // Get file size
    const stats = fs.statSync(tarGzPath);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`Backup file size: ${sizeInMB} MB`);

    // Send file to client
    res.download(tarGzPath, `learn-grow-backup-${timestamp}.tar.gz`, (err) => {
      if (err) {
        console.error("Error sending backup file:", err);
      }
      
      // Delete tar.gz file after sending (after a small delay to ensure download starts)
      setTimeout(() => {
        fs.unlink(tarGzPath, (unlinkErr) => {
          if (unlinkErr) console.error("Error deleting tar.gz file:", unlinkErr);
          else console.log(`Backup file deleted: ${tarGzPath}`);
        });
      }, 1000);
    });
  } catch (error: any) {
    console.error("Backup error:", error);

    // Clean up on error
    if (fs.existsSync(dumpDir)) {
      removeDirectoryRecursively(dumpDir);
    }
    if (fs.existsSync(tarGzPath)) {
      try {
        fs.unlinkSync(tarGzPath);
      } catch (e) {
        console.error("Error deleting partial backup:", e);
      }
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create database backup",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Remove directory recursively
 */
function removeDirectoryRecursively(dirPath: string) {
  try {
    if (fs.existsSync(dirPath)) {
      fs.readdirSync(dirPath).forEach((file) => {
        const filePath = path.join(dirPath, file);
        if (fs.lstatSync(filePath).isDirectory()) {
          removeDirectoryRecursively(filePath);
        } else {
          fs.unlinkSync(filePath);
        }
      });
      fs.rmdirSync(dirPath);
    }
  } catch (err) {
    console.error("Error removing directory:", dirPath, err);
  }
}

/**
 * Clean up old backup files (keep only backups from last 7 days)
 */
function cleanOldBackups(backuperDir: string) {
  try {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    
    if (!fs.existsSync(backuperDir)) return;

    const files = fs.readdirSync(backuperDir);
    files.forEach((file) => {
      const filePath = path.join(backuperDir, file);
      try {
        const stat = fs.statSync(filePath);
        
        if (stat.mtimeMs < sevenDaysAgo) {
          if (stat.isDirectory()) {
            removeDirectoryRecursively(filePath);
          } else {
            fs.unlinkSync(filePath);
          }
          console.log(`Cleaned up old backup: ${file}`);
        }
      } catch (err) {
        console.error("Error checking file:", filePath, err);
      }
    });
  } catch (err) {
    console.error("Error cleaning old backups:", err);
  }
}
