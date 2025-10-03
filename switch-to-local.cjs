#!/usr/bin/env node
/**
 * Switch deployment mode to LOCAL (for development/testing)
 * Modifies MyWonderland-app.js to load .bin files locally
 */

const fs = require('fs');
const path = require('path');

const APP_FILE = 'MyWonderland-app.js';
const R2_BASE_URL = 'https://pub-c6ac418601d24ff1b2b716ad48afc9ce.r2.dev/';

console.log('🔄 Switching to LOCAL mode for development...\n');

// Read the app.js file
let content = fs.readFileSync(APP_FILE, 'utf8');

// Replace R2 URL with local path
const r2Line = `await engine.loadMainScene(\`${R2_BASE_URL}\${Constants.ProjectName}.bin\`);`;
const localLine = `await engine.loadMainScene(\`\${Constants.ProjectName}.bin\`);`;

if (content.includes(r2Line)) {
  content = content.replace(r2Line, localLine);
  fs.writeFileSync(APP_FILE, content);
  console.log('✅ Updated MyWonderland-app.js');
  console.log(`   Old: ${R2_BASE_URL}\${Constants.ProjectName}.bin`);
  console.log(`   New: \${Constants.ProjectName}.bin`);
} else if (content.includes(localLine)) {
  console.log('ℹ️  Already in LOCAL mode - no changes needed');
} else {
  console.log('❌ Could not find the loadMainScene line to replace!');
  console.log('   You may need to manually update the file.');
  process.exit(1);
}

console.log('\n📦 Files ready for local development');
console.log('   - .bin files will load from local directory');
console.log('   - Videos still use R2 URLs (requires internet)');
console.log('\n⚠️  Remember to run switch-to-r2.js before deploying!');
