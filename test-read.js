import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
const app = initializeApp({ projectId: 'social-directory-b460f' });
getFirestore(app, 'ai-studio-socialdirectory-b5de10fc-a4b6-4692-b3cf-7f0757c6a36f').collection('users').get().then(console.log).catch(console.error);
