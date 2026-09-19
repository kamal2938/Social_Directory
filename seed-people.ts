import { storage } from './server/storage.js';
import { generateSeedData } from './server/storage.local.js';

async function run() {
  console.log('Seeding missing data...');
  const seed = generateSeedData();
  
  let admin = await storage.findUserByUsername('admin');
  if (!admin) {
    admin = await storage.createUser(seed.users[0].username, seed.users[0].email, 'directory123', seed.users[0].fullName);
  }
  
  const people = await storage.getPeople({});
  if (people.items.length === 0) {
    for (const p of seed.people) {
      p.userId = admin.id;
      await storage.createPerson(admin.id, p);
    }
    console.log(`Created ${seed.people.length} people`);
  }
  
  const tags = await storage.getTags();
  if (tags.length === 0) {
    for (const t of seed.tags) {
      await storage.createTag(t.name, t.color, t.description);
    }
    console.log(`Created ${seed.tags.length} tags`);
  }
  
  console.log('Done!');
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
