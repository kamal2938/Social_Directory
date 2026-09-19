const fs = require('fs');

let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');
code = code.replace(/stats\.upcomingBirthdays\.slice/g, '(stats.upcomingBirthdays || []).slice');
code = code.replace(/stats\.overdueFollowUps\.slice/g, '(stats.overdueFollowUps || []).slice');
code = code.replace(/Object\.entries\(stats\.relationshipCounts\)\.map/g, 'Object.entries(stats.relationshipCounts || {}).map');

fs.writeFileSync('src/components/DashboardView.tsx', code);

let code2 = fs.readFileSync('src/components/PeopleView.tsx', 'utf8');
code2 = code2.replace(/person\.skills\.slice/g, '(person.skills || []).slice');
code2 = code2.replace(/person\.tags\.slice/g, '(person.tags || []).slice');
fs.writeFileSync('src/components/PeopleView.tsx', code2);

