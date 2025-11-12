#!/usr/bin/env node

/**
 * Switch to using npm registry packages for production/CI
 * Usage: npm run use:npm
 */

const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Update dependencies to use npm registry versions (latest)
packageJson.dependencies['@tyconsa/bizuit-form-sdk'] = 'latest';
packageJson.dependencies['@tyconsa/bizuit-ui-components'] = 'latest';

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

console.log('✅ Switched to NPM REGISTRY packages (latest versions)');
console.log('   - @tyconsa/bizuit-form-sdk: latest');
console.log('   - @tyconsa/bizuit-ui-components: latest');
console.log('\n📦 Running npm install to get latest versions...\n');
