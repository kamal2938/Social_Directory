const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  const replacements = [
    [/person\.circles\.map/g, '(person.circles || []).map'],
    [/person\.skills\.map/g, '(person.skills || []).map'],
    [/person\.tags\.map/g, '(person.tags || []).map'],
    [/person\.socialLinks\.map/g, '(person.socialLinks || []).map'],
    [/Object\.entries\(person\.customFields\)\.map/g, 'Object.entries(person.customFields || {}).map'],
    [/stats\.upcomingBirthdays\.slice/g, '(stats.upcomingBirthdays || []).slice'],
    [/stats\.overdueFollowUps\.slice/g, '(stats.overdueFollowUps || []).slice'],
    [/stats\.recentContacts\.map/g, '(stats.recentContacts || []).map'],
    [/stats\.recentInteractions\.map/g, '(stats.recentInteractions || []).map'],
    [/stats\.recentActivity\.map/g, '(stats.recentActivity || []).map'],
    [/existingTags\.map/g, '(existingTags || []).map'],
    [/people\.map/g, '(people || []).map'],
    [/tags\.map/g, '(tags || []).map'],
    [/notes\.map/g, '(notes || []).map'],
    [/interactions\.map/g, '(interactions || []).map'],
    [/hoveredPerson\.circles\.map/g, '(hoveredPerson.circles || []).map'],
    [/Object\.entries\(stats\.relationshipCounts\)\.map/g, 'Object.entries(stats.relationshipCounts || {}).map'],
  ];

  for (const [regex, replacement] of replacements) {
    if (regex.test(code)) {
      // Need to avoid replacing if already replaced.
      // But a simple script might be okay if we just run it once.
      // Actually, people.map might match filteredPeople.map, which is fine if replaced to (filtered(people || [])).map. Wait, no.
    }
  }

  // A safer approach:
  code = code.replace(/person\.circles(?:\s*\?\.)?\.map/g, '(person.circles || []).map');
  code = code.replace(/person\.skills(?:\s*\?\.)?\.map/g, '(person.skills || []).map');
  code = code.replace(/person\.tags(?:\s*\?\.)?\.map/g, '(person.tags || []).map');
  code = code.replace(/person\.socialLinks(?:\s*\?\.)?\.map/g, '(person.socialLinks || []).map');
  code = code.replace(/Object\.entries\(person\.customFields\)\.map/g, 'Object.entries(person.customFields || {}).map');
  
  code = code.replace(/stats\.recentContacts(?:\s*\?\.)?\.map/g, '(stats.recentContacts || []).map');
  code = code.replace(/stats\.recentInteractions(?:\s*\?\.)?\.map/g, '(stats.recentInteractions || []).map');
  code = code.replace(/stats\.recentActivity(?:\s*\?\.)?\.map/g, '(stats.recentActivity || []).map');
  
  code = code.replace(/existingTags\.map/g, '(existingTags || []).map');
  code = code.replace(/hoveredPerson\.circles(?:\s*\?\.)?\.map/g, '(hoveredPerson.circles || []).map');

  if (code !== fs.readFileSync(filePath, 'utf8')) {
    fs.writeFileSync(filePath, code);
    console.log('Fixed:', filePath);
  }
}

const dir = 'src/components';
fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('.tsx')) {
    replaceInFile(path.join(dir, file));
  }
});

