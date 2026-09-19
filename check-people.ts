import { storage } from './server/storage.js';
async function run() {
  const people = await storage.getPeople({});
  console.log('People count:', people.items.length);
  process.exit(0);
}
run();
