import { storage } from './server/storage.local.js';
import { storage as firestoreStorage } from './server/storage.js';

async function seed() {
  const data = storage.resetToSeed();
  for (const u of data.users) await firestoreStorage.createUser(u.username, u.email, 'directory123', u.fullName);
  for (const p of data.people) await firestoreStorage.createPerson(p.userId, p);
  for (const t of data.tags) await firestoreStorage.createTag(t.name, t.color, t.description);
  // notes, interactions omitted for simplicity, they will be created as needed
  console.log('Seed completed');
}
seed();
