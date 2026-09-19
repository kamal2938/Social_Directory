import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp({
  projectId: config.projectId,
  apiKey: config.apiKey,
  databaseURL: `https://${config.projectId}.firebaseio.com`
});
const db = getFirestore(app, config.firestoreDatabaseId);

getDocs(collection(db, 'users')).then(snap => {
  console.log("Success! Docs:", snap.size);
}).catch(console.error);
