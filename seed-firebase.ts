import { storage } from './server/storage.js';
import * as fs from 'fs';
import { generateSeedData } from './server/storage.local.js';

async function run() {
  const users = await storage.getUsers();
  if (users.length > 0) {
    console.log('Database already has users, skipping seed.');
    process.exit(0);
  }

  console.log('Seeding database to Firebase...');
  const seed = generateSeedData();
  
  // Seed Users
  for (const u of seed.users) {
    // Need to use the create user or just set the raw data
    // The storage class expects plain password for createUser, but we just insert the hash from seed
    await storage.createUser(u.username, u.email, 'directory123', u.fullName);
    console.log('Created user:', u.username);
  }
  
  const admin = await storage.findUserByUsername('admin');
  if (!admin) throw new Error('Admin not found after creation');
  
  // Seed People
  for (const p of seed.people) {
    p.userId = admin.id; // Assign to admin
    await storage.createPerson(admin.id, p);
  }
  console.log(`Created ${seed.people.length} people`);
  
  // Seed Tags
  for (const t of seed.tags) {
    await storage.createTag(t.name, t.color, t.description);
  }
  console.log(`Created ${seed.tags.length} tags`);
  
  // Interactions and notes
  // (Ignoring for simplicity as they need person IDs)
  
  console.log('Seed completed successfully.');
  process.exit(0);
}

run().catch(e => {
  console.error('Seed failed', e);
  process.exit(1);
});
