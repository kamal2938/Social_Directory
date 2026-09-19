const fs = require('fs');

let code = fs.readFileSync('server/storage.ts', 'utf8');

code = code.replace(/return \{ importedPeople \};\n  \}/g, 'return { importedCount: importedPeople, created: importedPeople, updated: 0, errors: [] };\n  }');

fs.writeFileSync('server/storage.ts', code);
