const fs = require('fs');
let code = fs.readFileSync('src/components/PersonDetailModal.tsx', 'utf8');

// A quick and dirty tag counter to find missing closing divs inside modalInner
const modalInnerMatch = code.match(/const modalInner = \([\s\S]*?\n\s*\);/);
if (modalInnerMatch) {
  const inner = modalInnerMatch[0];
  const divs = (inner.match(/<div/g) || []).length;
  const cdivs = (inner.match(/<\/div>/g) || []).length;
  console.log(`Open divs: ${divs}, Closed divs: ${cdivs}`);
}
