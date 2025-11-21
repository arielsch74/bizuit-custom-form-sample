#!/usr/bin/env node

/**
 * prepare-deployment.js
 *
 * This script replaces the __RUNTIME_BASEPATH__ placeholder in Next.js build output
 * with the actual basePath value from environment variable.
 *
 * Usage:
 *   RUNTIME_BASEPATH=/myapp node scripts/prepare-deployment.js
 *
 * The script will:
 * 1. Read RUNTIME_BASEPATH from environment (default: empty string for root)
 * 2. Find all .js and .html files in .next/standalone/.next/
 * 3. Replace __RUNTIME_BASEPATH__ with the actual value
 * 4. Log the changes made
 */

const fs = require('fs');
const path = require('path');

// Configuration
const PLACEHOLDER = '/__RUNTIME_BASEPATH__';
const RUNTIME_BASEPATH = process.env.RUNTIME_BASEPATH || '';
const BUILD_DIR = path.join(__dirname, '..', '.next', 'standalone', '.next');
const FALLBACK_BUILD_DIR = path.join(__dirname, '..', '.next');

// Determine which build directory exists
const targetDir = fs.existsSync(BUILD_DIR) ? BUILD_DIR : FALLBACK_BUILD_DIR;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

let filesProcessed = 0;
let filesModified = 0;
let totalReplacements = 0;

/**
 * Recursively find all files matching the extensions
 */
function findFiles(dir, extensions) {
  const files = [];

  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dir, item.name);

      if (item.isDirectory()) {
        // Skip node_modules and cache directories
        if (item.name === 'node_modules' || item.name === 'cache') {
          continue;
        }
        files.push(...findFiles(fullPath, extensions));
      } else if (item.isFile()) {
        const ext = path.extname(item.name).toLowerCase();
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`${colors.red}Error reading directory ${dir}: ${error.message}${colors.reset}`);
  }

  return files;
}

/**
 * Replace placeholder in a single file
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Count occurrences
    const matches = content.match(new RegExp(PLACEHOLDER, 'g'));
    const count = matches ? matches.length : 0;

    if (count > 0) {
      // Replace all occurrences
      const newContent = content.replace(new RegExp(PLACEHOLDER, 'g'), RUNTIME_BASEPATH);
      fs.writeFileSync(filePath, newContent, 'utf8');

      filesModified++;
      totalReplacements += count;

      const relativePath = path.relative(process.cwd(), filePath);
      console.log(`  ${colors.green}✓${colors.reset} ${relativePath} (${count} replacement${count > 1 ? 's' : ''})`);
    }

    filesProcessed++;
  } catch (error) {
    console.error(`${colors.red}Error processing file ${filePath}: ${error.message}${colors.reset}`);
  }
}

/**
 * Main execution
 */
function main() {
  console.log(`${colors.bright}${colors.blue}=== Next.js Runtime basePath Configuration ===${colors.reset}`);
  console.log();

  // Check if build directory exists
  if (!fs.existsSync(targetDir)) {
    console.error(`${colors.red}Error: Build directory not found at ${targetDir}${colors.reset}`);
    console.error(`${colors.yellow}Please run 'npm run build' first.${colors.reset}`);
    process.exit(1);
  }

  console.log(`${colors.bright}Configuration:${colors.reset}`);
  console.log(`  Placeholder: ${colors.yellow}${PLACEHOLDER}${colors.reset}`);
  console.log(`  Runtime basePath: ${colors.green}${RUNTIME_BASEPATH || '(root)'}${colors.reset}`);
  console.log(`  Build directory: ${colors.blue}${path.relative(process.cwd(), targetDir)}${colors.reset}`);
  console.log();

  // Find all JS and HTML files
  console.log(`${colors.bright}Searching for files...${colors.reset}`);
  const files = findFiles(targetDir, ['.js', '.html']);
  console.log(`  Found ${colors.yellow}${files.length}${colors.reset} files to process`);
  console.log();

  // Process each file
  console.log(`${colors.bright}Processing files:${colors.reset}`);
  for (const file of files) {
    processFile(file);
  }

  // Summary
  console.log();
  console.log(`${colors.bright}${colors.green}=== Summary ===${colors.reset}`);
  console.log(`  Files processed: ${colors.yellow}${filesProcessed}${colors.reset}`);
  console.log(`  Files modified: ${colors.green}${filesModified}${colors.reset}`);
  console.log(`  Total replacements: ${colors.green}${totalReplacements}${colors.reset}`);

  if (filesModified === 0) {
    console.log();
    console.log(`${colors.yellow}⚠ Warning: No files were modified.${colors.reset}`);
    console.log(`${colors.yellow}  The placeholder '${PLACEHOLDER}' was not found in any files.${colors.reset}`);
    console.log(`${colors.yellow}  This might indicate the build was not done with NODE_ENV=production.${colors.reset}`);
  } else {
    console.log();
    console.log(`${colors.green}✓ basePath configuration completed successfully!${colors.reset}`);
  }
}

// Run the script
try {
  main();
} catch (error) {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
}