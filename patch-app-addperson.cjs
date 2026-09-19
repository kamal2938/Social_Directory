const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace(
  /\{currentUser\.role === 'admin' && \(isAddPersonOpen \|\| editingPerson\) && \(/,
  `{(isAddPersonOpen || editingPerson) && (`
);

fs.writeFileSync('src/App.tsx', app);
console.log('App AddPerson patched');
