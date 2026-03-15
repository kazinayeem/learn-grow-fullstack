import { Request, Response } from "express";
import { exec } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";
import mongoose from "mongoose";

const execAsync = promisify(exec);

export const backupDatabase = async (req: Request, res: Response) => {
  const backupDir = path.join(process.cwd(), "backups");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").split("T")[0];
  const dataDir = path.join(backupDir, `mongodb-backup-${timestamp}`);
  const tarGzPath = path.join(backupDir, `learn-grow-backup-${timestamp}.tar.gz`);

  try {
    // Ensure backups directory exists
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Clean up old backups (keep only last 7 days)
    cleanOldBackups(backupDir);

    // Create data directory
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Get all collection names from mongoose
    const collections = mongoose.connection.collections;

    let totalDocuments = 0;
    const backupData: Record<string, any[]> = {};

    // Export each collection as JSON using mongoose
    for (const [collectionName, collection] of Object.entries(collections)) {
      try {
        const documents = await collection.find({}).toArray();
        backupData[collectionName] = documents;
        totalDocuments += documents.length;
      } catch (err) {
      }
    }

    // Write backup manifest
    const manifest = {
      timestamp: new Date().toISOString(),
      database: mongoose.connection.name,
      collections: Object.keys(backupData).length,
      totalDocuments,
      version: "1.0",
    };

    fs.writeFileSync(
      path.join(dataDir, "manifest.json"),
      JSON.stringify(manifest, null, 2)
    );

    // Write each collection to separate JSON file
    for (const [collectionName, documents] of Object.entries(backupData)) {
      const filePath = path.join(dataDir, `${collectionName}.json`);
      fs.writeFileSync(filePath, JSON.stringify(documents, null, 2));
    }

    // Create tar.gz archive using system tar command
    const tarCommand = `cd "${backupDir}" && tar -czf "${tarGzPath}" "${path.basename(dataDir)}" && rm -rf "${dataDir}"`;

    try {
      await execAsync(tarCommand, {
        maxBuffer: 100 * 1024 * 1024,
        timeout: 5 * 60 * 1000,
      });
    } catch (tarError: any) {
      if (fs.existsSync(dataDir)) {
        removeDirectoryRecursively(dataDir);
      }
      throw new Error("Failed to compress backup file: " + tarError.message);
    }

    // Get file size
    const stats = fs.statSync(tarGzPath);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

    // Send file to client
    res.download(tarGzPath, `learn-grow-backup-${timestamp}.tar.gz`, (err) => {
      if (err) {
      }

      // Delete tar.gz file after sending (after a small delay to ensure download starts)
      setTimeout(() => {
        fs.unlink(tarGzPath, (unlinkErr) => {
          if (unlinkErr) console.error("Error deleting tar.gz file:", unlinkErr);
          else console.log(`✓ Backup file deleted: ${tarGzPath}`);
        });
      }, 1000);
    });
  } catch (error: any) {

    // Clean up on error
    if (fs.existsSync(dataDir)) {
      removeDirectoryRecursively(dataDir);
    }
    if (fs.existsSync(tarGzPath)) {
      try {
        fs.unlinkSync(tarGzPath);
      } catch (e) {
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
  }
}

/**
 * Clean up old backup files (keep only backups from last 7 days)
 */
function cleanOldBackups(backupDir: string) {
  try {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    if (!fs.existsSync(backupDir)) return;

    const files = fs.readdirSync(backupDir);
    files.forEach((file) => {
      const filePath = path.join(backupDir, file);
      try {
        const stat = fs.statSync(filePath);

        if (stat.mtimeMs < sevenDaysAgo) {
          if (stat.isDirectory()) {
            removeDirectoryRecursively(filePath);
          } else {
            fs.unlinkSync(filePath);
          }
        }
      } catch (err) {
      }
    });
  } catch (err) {
  }
}
