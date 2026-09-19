const fs = require('fs');

let storageTs = fs.readFileSync('server/storage.ts', 'utf8');

const imports = `
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import fs from 'fs';
`;

storageTs = storageTs.replace(/import fs from 'fs';\n/, '');
storageTs = imports + storageTs;

const firebaseInit = `
let dbF: any;
try {
  const configRaw = fs.readFileSync('./firebase-applet-config.json', 'utf8');
  const config = JSON.parse(configRaw);
  const app = initializeApp({
    projectId: config.projectId,
    apiKey: config.apiKey,
    databaseURL: \`https://\${config.projectId}.firebaseio.com\`
  });
  dbF = getFirestore(app, config.firestoreDatabaseId);
} catch (e: any) {
  console.warn('Firebase config missing or invalid', e.message);
}

async function backupToFirebase(payload: any) {
  if (!dbF) return;
  try {
    await Promise.all([
      setDoc(doc(dbF, 'backups', 'users'), { data: payload.users || [] }),
      setDoc(doc(dbF, 'backups', 'people'), { data: payload.people || [] }),
      setDoc(doc(dbF, 'backups', 'tags'), { data: payload.tags || [] }),
      setDoc(doc(dbF, 'backups', 'notes'), { data: payload.notes || [] }),
      setDoc(doc(dbF, 'backups', 'interactions'), { data: payload.interactions || [] }),
      setDoc(doc(dbF, 'backups', 'activityLogs'), { data: payload.activityLogs || [] })
    ]);
  } catch (e) {
    console.error('Firebase backup failed:', e);
  }
}
`;

storageTs = storageTs.replace(/const DATA_DIR = /g, firebaseInit + '\nconst DATA_DIR = ');

const hookSave = `
      fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2), 'utf-8');
      backupToFirebase(payload);
`;
storageTs = storageTs.replace(/fs.writeFileSync\(DB_FILE, JSON.stringify\(payload, null, 2\), 'utf-8'\);/g, hookSave);

fs.writeFileSync('server/storage.ts', storageTs);
