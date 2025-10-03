#!/usr/bin/env node
/**
 * Switch deployment mode to R2 (for Cloudflare Pages)
 * Modifies MyWonderland-app.js to load .bin files from R2
 */

const fs = require('fs');
const path = require('path');

const APP_FILE = 'MyWonderland-app.js';
const R2_BASE_URL = 'https://pub-c6ac418601d24ff1b2b716ad48afc9ce.r2.dev/';

console.log('🔄 Switching to R2 mode for deployment...\n');

// Read the app.js file
let content = fs.readFileSync(APP_FILE, 'utf8');

// Replace local .bin path with R2 URL
const originalLine = `await engine.loadMainScene(\`\${Constants.ProjectName}.bin\`);`;
const r2Line = `await engine.loadMainScene(\`${R2_BASE_URL}\${Constants.ProjectName}.bin\`);`;

if (content.includes(originalLine)) {
  content = content.replace(originalLine, r2Line);
  fs.writeFileSync(APP_FILE, content);
  console.log('✅ Updated MyWonderland-app.js');
  console.log(`   Old: \${Constants.ProjectName}.bin`);
  console.log(`   New: ${R2_BASE_URL}\${Constants.ProjectName}.bin`);
} else if (content.includes(r2Line)) {
  console.log('ℹ️  Already in R2 mode - no changes needed');
} else {
  console.log('❌ Could not find the loadMainScene line to replace!');
  console.log('   You may need to manually update the file.');
  process.exit(1);
}

console.log('\n📦 Files ready for Cloudflare Pages deployment');
console.log('   - .bin files will load from R2');
console.log('   - Videos already use R2 URLs');
console.log('\n⚠️  Remember to run switch-to-local.js before testing locally!');
