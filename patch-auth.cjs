const fs = require('fs');
let authContent = fs.readFileSync('src/components/AuthView.tsx', 'utf8');

// Replace role selection with empty
authContent = authContent.replace(/<div className="input-box">\s*<select[\s\S]*?<\/select>\s*<\/div>/, '');
// Force 'viewer' role on submit
authContent = authContent.replace(/role:\s*regRole,/, "role: 'viewer',");

fs.writeFileSync('src/components/AuthView.tsx', authContent);
console.log('AuthView patched');
