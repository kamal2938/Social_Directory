import { storage } from './server/storage.js';
import { generateSeedData } from './server/storage.local.js';

async function run() {
  const seed = generateSeedData();
  const admin = await storage.findUserByUsername('admin');
  if (!admin) {
    console.error("Admin not found!");
    process.exit(1);
  }
  
  // Create missing people
  const currentPeople = await storage.getPeople({});
  const existingNames = new Set(currentPeople.items.map((p: any) => p.name));
  
  let created = 0;
  for (const p of seed.people) {
    if (!existingNames.has(p.name)) {
      p.userId = admin.id;
      await storage.createPerson(admin.id, p);
      created++;
    }
  }
  
  console.log(`Created ${created} new people.`);
  process.exit(0);
}
run();
