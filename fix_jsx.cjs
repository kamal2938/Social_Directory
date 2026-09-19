const fs = require('fs');
let code = fs.readFileSync('src/components/PersonDetailModal.tsx', 'utf8');

const modalInnerMatch = code.match(/const modalInner = \([\s\S]*?\n\s*\);/);
if (modalInnerMatch) {
  const inner = modalInnerMatch[0];
  const divs = (inner.match(/<div/g) || []).length;
  const cdivs = (inner.match(/<\/div>/g) || []).length;
  console.log(`Open divs: ${divs}, Closed divs: ${cdivs}`);
  
  if (divs > cdivs) {
     const missing = divs - cdivs;
     console.log(`Missing ${missing} closing divs. Will add them before the closing parenthesis.`);
     const newInner = inner.replace(/\n\s*\);$/, "\n" + "</div>\n".repeat(missing) + "  );");
     code = code.replace(inner, newInner);
     fs.writeFileSync('src/components/PersonDetailModal.tsx', code);
     console.log('Fixed');
  } else if (cdivs > divs) {
     console.log(`Too many closed divs (${cdivs} > ${divs})`);
  } else {
     console.log('Divs are balanced.');
  }
} else {
  console.log('Could not find modalInner');
}
