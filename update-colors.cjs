const fs = require('fs');
const path = require('path');

function replaceColors(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      replaceColors(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      const regex = /(text|bg|border|ring|fill|from|to|via)-blue-([0-9]+)(\/[0-9]+)?/g;
      const replaced = content.replace(regex, (match, type, weight, alpha) => {
        return `${type}-primary-${weight}${alpha || ''}`;
      });

      if (replaced !== content) {
        fs.writeFileSync(fullPath, replaced);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

replaceColors('src');
