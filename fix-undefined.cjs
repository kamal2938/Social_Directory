const fs = require('fs');
let code = fs.readFileSync('server/storage.ts', 'utf8');

const helper = `
function removeUndefined(obj: any) {
  const newObj = { ...obj };
  Object.keys(newObj).forEach(key => newObj[key] === undefined && delete newObj[key]);
  return newObj;
}
`;

code = code.replace(/export class StorageService \{/, helper + '\nexport class StorageService {');

code = code.replace(/if \(db\) await setDoc\(doc\(db, '([a-zA-Z]+)', [^\)]+\), ([a-zA-Z]+)\);/g, (match, collection, variable) => {
  return match.replace(`, ${variable})`, `, removeUndefined(${variable}))`);
});

// For update methods that might not use the same exact pattern:
code = code.replace(/await setDoc\(doc\(db, '([^']+)', ([^\)]+)\), ([^\)]+)\);/g, "await setDoc(doc(db, '$1', $2), removeUndefined($3));");
code = code.replace(/batch\.set\(([^,]+),\s*([^)]+)\)/g, "batch.set($1, removeUndefined($2))");

fs.writeFileSync('server/storage.ts', code);
