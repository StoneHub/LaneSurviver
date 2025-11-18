const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '../dist');
const SUBDIR = 'LaneSurviver';
const TARGET_DIR = path.join(DIST_DIR, SUBDIR);

// Ensure clean dist directory
if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
}
fs.mkdirSync(TARGET_DIR, { recursive: true });

// Files and directories to copy
const itemsToCopy = [
    'index.html',
    'src',
    'styles',
    'assets' // Copy assets if they exist
];

itemsToCopy.forEach(item => {
    const srcPath = path.join(__dirname, '..', item);
    const destPath = path.join(TARGET_DIR, item);

    if (fs.existsSync(srcPath)) {
        console.log(`Copying ${item}...`);
        fs.cpSync(srcPath, destPath, { recursive: true });
    } else {
        console.warn(`Warning: ${item} not found, skipping.`);
    }
});

console.log(`Build complete! Files are ready in dist/${SUBDIR}`);
