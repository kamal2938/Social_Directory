const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

// Replace all `<PersonDetailModal ... />`
app = app.replace(
  /<PersonDetailModal\s+personId=\{selectedPersonId\}[\s\S]*?\/>/,
  `<PersonDetailModal
          personId={selectedPersonId}
          onClose={() => setSelectedPersonId(null)}
          onEdit={(person) => setEditingPerson(person)}
          onDelete={handleDeletePerson}
          onToggleFavorite={handleToggleFavorite}
          onToggleArchive={handleToggleArchive}
          onDataUpdated={() => {
            fetchStatsAndTags();
            fetchPeople();
            fetchAllPeopleList();
          }}
          onOpenQRCode={(p) => setQrModalPerson(p)}
          onOpenOutreach={(p, topic) => setOutreachModalState({ isOpen: true, person: p, defaultTopic: topic })}
          isAdmin={currentUser?.role === 'admin'}
          currentUserId={currentUser?.id}
        />`
);

// Replace in `<PeopleView>`
app = app.replace(/isAdmin=\{currentUser\.role === 'admin'\}/g, "isAdmin={currentUser.role === 'admin'} currentUserId={currentUser?.id}");

// Fix the restrictive returns onEditPerson, etc. where it did `if (currentUser.role !== 'admin') return;`
// We need to allow them if person.userId === currentUser.id, but App.tsx doesn't have the person parameter in some cases?
// Wait, `onEditPerson={(p) => { if (currentUser.role !== 'admin') return; ...`
// Let's fix that globally in App.tsx
app = app.replace(
  /onEditPerson=\{\(p\) => \{\s*if \(currentUser\.role !== 'admin'\) return;\s*setEditingPerson\(p\);\s*\}\}/g,
  "onEditPerson={(p) => { if (currentUser.role !== 'admin' && p.userId !== currentUser.id) return; setEditingPerson(p); }}"
);
app = app.replace(
  /onOpenAddInteraction=\{\(personId\) => \{\s*if \(currentUser\.role !== 'admin'\) return;\s*setQuickLogModal\(\{ isOpen: true, mode: 'interaction', personId \}\);\s*\}\}/g,
  "onOpenAddInteraction={(personId) => { setQuickLogModal({ isOpen: true, mode: 'interaction', personId }); }}"
);
app = app.replace(
  /onOpenAddNote=\{\(personId\) => \{\s*if \(currentUser\.role !== 'admin'\) return;\s*setQuickLogModal\(\{ isOpen: true, mode: 'note', personId \}\);\s*\}\}/g,
  "onOpenAddNote={(personId) => { setQuickLogModal({ isOpen: true, mode: 'note', personId }); }}"
);

fs.writeFileSync('src/App.tsx', app);
console.log('App currentUserId patched');
