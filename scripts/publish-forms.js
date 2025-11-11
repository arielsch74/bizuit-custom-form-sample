#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '..', 'dist');
const API_URL = process.env.BIZUIT_API_URL || 'https://your-api-domain.com';
const API_TOKEN = process.env.BIZUIT_API_TOKEN;

if (!API_TOKEN) {
  console.error('❌ ERROR: BIZUIT_API_TOKEN environment variable is required');
  console.log('Please set it in GitHub Secrets or your environment');
  process.exit(1);
}

async function publishForm(formName, compiledCode) {
  const version = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '-' + Date.now();

  console.log(`Publishing ${formName} (version: ${version})...`);

  try {
    const response = await fetch(`${API_URL}/api/custom-forms/versions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify({
        formName,
        version,
        compiledCode,
        publishedBy: process.env.GITHUB_ACTOR || 'system',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    const result = await response.json();
    console.log(`✅ Successfully published ${formName}`);
    return { success: true, formName, version, result };
  } catch (error) {
    console.error(`❌ Failed to publish ${formName}:`, error.message);
    return { success: false, formName, error: error.message };
  }
}

async function publishAllForms() {
  console.log('🚀 Starting form publication...\n');
  console.log(`API URL: ${API_URL}\n`);

  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ No dist/ directory found. Run "npm run build" first.');
    process.exit(1);
  }

  // Get all compiled .js files from dist directory
  const compiledFiles = fs
    .readdirSync(DIST_DIR)
    .filter((file) => file.endsWith('.js'));

  if (compiledFiles.length === 0) {
    console.log('⚠️  No compiled forms found in dist/ directory');
    return;
  }

  const results = [];

  for (const file of compiledFiles) {
    const formName = path.basename(file, '.js');
    const filePath = path.join(DIST_DIR, file);
    const compiledCode = fs.readFileSync(filePath, 'utf-8');

    const result = await publishForm(formName, compiledCode);
    results.push(result);
  }

  console.log('\n📊 Publication Summary:');
  console.log(`Total forms: ${results.length}`);
  console.log(`Successful: ${results.filter((r) => r.success).length}`);
  console.log(`Failed: ${results.filter((r) => !r.success).length}`);

  if (results.some((r) => !r.success)) {
    process.exit(1);
  }
}

publishAllForms().catch((error) => {
  console.error('❌ Publication failed:', error);
  process.exit(1);
});
