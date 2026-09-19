import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

// Initialize with default environment credentials
const app = initializeApp();
const db = getFirestore(app, config.firestoreDatabaseId);

db.collection('users').get().then(snap => {
  console.log("Success admin default app!", snap.size);
}).catch(console.error);
