#!/usr/bin/env node

/**
 * Switch to using local packages for development
 * Usage: npm run use:local
 */

const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Update dependencies to use local packages
packageJson.dependencies['@tyconsa/bizuit-form-sdk'] = 'file:../packages/bizuit-form-sdk';
packageJson.dependencies['@tyconsa/bizuit-ui-components'] = 'file:../packages/bizuit-ui-components';

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

console.log('✅ Switched to LOCAL packages');
console.log('   - @tyconsa/bizuit-form-sdk: file:../packages/bizuit-form-sdk');
console.log('   - @tyconsa/bizuit-ui-components: file:../packages/bizuit-ui-components');
console.log('\n📦 Running npm install...\n');
