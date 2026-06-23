const fs = require('fs');
const path = require('path');

function search(dir, depth = 0) {
  if (depth > 6) return;
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      let stat;
      try {
        stat = fs.statSync(fullPath);
      } catch (e) {
        continue;
      }
      if (stat.isDirectory()) {
        search(fullPath, depth + 1);
      } else if (file.endsWith('.tgz') || file.includes('drizzle') || file.includes('next-auth')) {
        console.log(fullPath);
      }
    }
  } catch (e) {}
}

console.log('Searching /Users/priya/.npm...');
search('/Users/priya/.npm');
console.log('Search complete.');
