import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

let auth: any = null;

export const getFirebaseAuth = async () => {
  if (auth) return auth;
  try {
    const res = await fetch('/api/firebase-config');
    const config = await res.json();
    const app = initializeApp(config);
    auth = getAuth(app);
    return auth;
  } catch (err) {
    console.error('Failed to initialize Firebase Auth', err);
    throw err;
  }
};
