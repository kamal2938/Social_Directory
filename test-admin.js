import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
initializeApp();
const db = getFirestore();
console.log("Firestore initialized:", !!db);
