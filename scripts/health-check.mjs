#!/usr/bin/env node

/**
 * Health Check Script
 * Validates the application and data integrity
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

class HealthChecker {
  constructor() {
    this.checks = [];
    this.warnings = [];
    this.errors = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '✅',
      warn: '⚠️',
      error: '❌'
    }[type];
    
    console.log(`${prefix} [${timestamp}] ${message}`);
    
    if (type === 'warn') this.warnings.push(message);
    if (type === 'error') this.errors.push(message);
  }

  async checkFileExists(filePath, required = true) {
    try {
      if (fs.existsSync(filePath)) {
        this.log(`File exists: ${filePath}`);
        return true;
      } else {
        this.log(`File missing: ${filePath}`, required ? 'error' : 'warn');
        return false;
      }
    } catch (error) {
      this.log(`Error checking file ${filePath}: ${error.message}`, 'error');
      return false;
    }
  }

  async checkDataIntegrity() {
    this.log('Checking data integrity...');
    
    // Check processed data file
    const dataPath = path.join(process.cwd(), 'public', 'processed-data.json');
    if (!await this.checkFileExists(dataPath)) return false;

    try {
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      
      if (!data.songs || !Array.isArray(data.songs)) {
        this.log('Invalid songs data structure', 'error');
        return false;
      }
      
      if (!data.shows || !Array.isArray(data.shows)) {
        this.log('Invalid shows data structure', 'error');
        return false;
      }

      this.log(`Data integrity check passed: ${data.songs.length} songs, ${data.shows.length} shows`);
      
      // Check for recent data
      const now = new Date();
      const lastModified = fs.statSync(dataPath).mtime;
      const daysSinceUpdate = (now - lastModified) / (1000 * 60 * 60 * 24);
      
      if (daysSinceUpdate > 7) {
        this.log(`Data is ${Math.round(daysSinceUpdate)} days old. Consider refreshing.`, 'warn');
      }
      
      return true;
    } catch (error) {
      this.log(`Error parsing data file: ${error.message}`, 'error');
      return false;
    }
  }

  async checkDependencies() {
    this.log('Checking dependencies...');
    
    try {
      // Check if package.json exists
      if (!await this.checkFileExists('package.json')) return false;
      
      // Check if node_modules exists
      if (!await this.checkFileExists('node_modules', false)) {
        this.log('node_modules not found. Run: npm install', 'warn');
      }
      
      // Check for security vulnerabilities
      try {
        execSync('npm audit --audit-level=high', { stdio: 'pipe' });
        this.log('No high-severity security vulnerabilities found');
      } catch {
        this.log('Security vulnerabilities detected. Run: npm audit fix', 'warn');
      }
      
      return true;
    } catch (error) {
      this.log(`Error checking dependencies: ${error.message}`, 'error');
      return false;
    }
  }

  async checkEnvironment() {
    this.log('Checking environment...');
    
    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion < 18) {
      this.log(`Node.js version ${nodeVersion} is outdated. Upgrade to v18+`, 'warn');
    } else {
      this.log(`Node.js version ${nodeVersion} is supported`);
    }
    
    // Check environment files
    await this.checkFileExists('.env.local', false);
    
    // Check build files
    const buildPath = path.join(process.cwd(), '.next');
    if (fs.existsSync(buildPath)) {
      this.log('Build artifacts found');
    } else {
      this.log('No build artifacts. Run: npm run build', 'warn');
    }
    
    return true;
  }

  async checkPythonEnvironment() {
    this.log('Checking Python environment...');
    
    try {
      // Check if virtual environment exists
      if (!await this.checkFileExists('.venv', false)) {
        this.log('Python virtual environment not found', 'warn');
        return false;
      }
      
      // Check requirements
      if (await this.checkFileExists('requirements.txt', false)) {
        this.log('Python requirements file found');
      }
      
      return true;
    } catch (error) {
      this.log(`Error checking Python environment: ${error.message}`, 'error');
      return false;
    }
  }

  async runAllChecks() {
    this.log('Starting health check...');
    
    const checks = [
      this.checkFileExists('README.md', false),
      this.checkFileExists('next.config.js', false),
      this.checkFileExists('tailwind.config.js', false),
      this.checkDataIntegrity(),
      this.checkDependencies(),
      this.checkEnvironment(),
      this.checkPythonEnvironment()
    ];
    
    await Promise.all(checks);
    
    // Summary
    this.log('\n--- Health Check Summary ---');
    this.log(`Warnings: ${this.warnings.length}`);
    this.log(`Errors: ${this.errors.length}`);
    
    if (this.errors.length === 0) {
      this.log('✅ All critical checks passed!');
      process.exit(0);
    } else {
      this.log('❌ Critical issues found. Please address them before deployment.');
      process.exit(1);
    }
  }
}

// Run health check if script is called directly
const healthChecker = new HealthChecker();
healthChecker.runAllChecks().catch(error => {
  console.error('Health check failed:', error);
  process.exit(1);
});

export default HealthChecker;
