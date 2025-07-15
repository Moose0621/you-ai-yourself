#!/usr/bin/env node

/**
 * Data Backup Script
 * Creates backups of critical data files
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

class DataBackup {
  constructor() {
    this.backupDir = path.join(process.cwd(), 'backups');
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  }

  log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`);
  }

  ensureBackupDirectory() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      this.log(`Created backup directory: ${this.backupDir}`);
    }
  }

  async backupFile(sourcePath, backupName) {
    try {
      if (!fs.existsSync(sourcePath)) {
        this.log(`⚠️  Source file not found: ${sourcePath}`);
        return false;
      }

      const backupPath = path.join(this.backupDir, `${backupName}-${this.timestamp}.json`);
      fs.copyFileSync(sourcePath, backupPath);
      
      const stats = fs.statSync(backupPath);
      this.log(`✅ Backed up ${sourcePath} to ${backupPath} (${stats.size} bytes)`);
      return true;
    } catch (error) {
      this.log(`❌ Failed to backup ${sourcePath}: ${error.message}`);
      return false;
    }
  }

  async compressBackups() {
    try {
      const backupArchive = path.join(this.backupDir, `backup-${this.timestamp}.tar.gz`);
      const backupFiles = fs.readdirSync(this.backupDir)
        .filter(file => file.endsWith(`-${this.timestamp}.json`))
        .join(' ');

      if (backupFiles) {
        execSync(`cd ${this.backupDir} && tar -czf backup-${this.timestamp}.tar.gz ${backupFiles}`);
        this.log(`✅ Created compressed backup: ${backupArchive}`);
        
        // Clean up individual files
        backupFiles.split(' ').forEach(file => {
          fs.unlinkSync(path.join(this.backupDir, file));
        });
      }
    } catch (error) {
      this.log(`⚠️  Failed to compress backups: ${error.message}`);
    }
  }

  async cleanOldBackups(retentionDays = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const files = fs.readdirSync(this.backupDir);
      let deletedCount = 0;

      files.forEach(file => {
        const filePath = path.join(this.backupDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      });

      if (deletedCount > 0) {
        this.log(`🗑️  Cleaned up ${deletedCount} old backup files`);
      }
    } catch (error) {
      this.log(`⚠️  Failed to clean old backups: ${error.message}`);
    }
  }

  async createBackup() {
    this.log('Starting data backup...');
    this.ensureBackupDirectory();

    const backupTasks = [
      this.backupFile('public/processed-data.json', 'processed-data'),
      this.backupFile('data/shows.json', 'raw-shows'),
      this.backupFile('data/processed-data.json', 'processed-data-cache'),
      this.backupFile('package.json', 'package'),
      this.backupFile('.env.local', 'environment')
    ];

    const results = await Promise.all(backupTasks);
    const successCount = results.filter(Boolean).length;

    this.log(`📦 Backup completed: ${successCount}/${results.length} files backed up`);

    // Compress backups
    await this.compressBackups();
    
    // Clean old backups
    await this.cleanOldBackups();

    return successCount > 0;
  }
}

// Run backup if script is called directly
const backup = new DataBackup();
backup.createBackup().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Backup failed:', error);
  process.exit(1);
});

export default DataBackup;
