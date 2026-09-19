const fs = require('fs');
let content = fs.readFileSync('src/components/PersonDetailModal.tsx', 'utf8');

content = content.replace(
  /isAdmin\?: boolean;/,
  `isAdmin?: boolean;
  currentUserId?: string;`
);

content = content.replace(
  /isAdmin = true,/,
  `isAdmin = true,
  currentUserId,`
);

content = content.replace(
  /const \[timeline, setTimeline\] = useState<TimelineEvent\[\]>\(\[\]\);/,
  `const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const isOwner = person?.userId === currentUserId;
  const canEdit = isAdmin || isOwner;`
);

content = content.replace(/\{isAdmin && \(/g, '{canEdit && (');

fs.writeFileSync('src/components/PersonDetailModal.tsx', content);
console.log('PersonDetailModal patched');
