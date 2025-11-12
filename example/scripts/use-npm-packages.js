#!/usr/bin/env node

/**
 * Switch to using npm registry packages for production/CI
 * Usage: npm run use:npm
 */

const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Update dependencies to use npm registry versions
packageJson.dependencies['@tyconsa/bizuit-form-sdk'] = '^1.4.2';
packageJson.dependencies['@tyconsa/bizuit-ui-components'] = '^1.5.0';

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

console.log('✅ Switched to NPM REGISTRY packages');
console.log('   - @tyconsa/bizuit-form-sdk: ^1.4.2');
console.log('   - @tyconsa/bizuit-ui-components: ^1.5.0');
console.log('\n📦 Running npm install...\n');
