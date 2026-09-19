const fs = require('fs');
const ts = require('typescript');
const code = fs.readFileSync('src/components/PersonDetailModal.tsx', 'utf8');
const sf = ts.createSourceFile('PersonDetailModal.tsx', code, ts.ScriptTarget.Latest, true);

// print errors
sf.parseDiagnostics.forEach(d => {
  const pos = sf.getLineAndCharacterOfPosition(d.start);
  console.log(`Line ${pos.line + 1}, Col ${pos.character + 1}: ${d.messageText}`);
});
if (sf.parseDiagnostics.length === 0) console.log("No syntax errors found by quick parse.");
