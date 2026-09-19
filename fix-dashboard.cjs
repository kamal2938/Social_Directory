const fs = require('fs');

let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

code = code.replace(/\{stats\.recentInteractions\.length === 0 \? \(/g, '{(!stats.recentInteractions || stats.recentInteractions.length === 0) ? (');

fs.writeFileSync('src/components/DashboardView.tsx', code);
