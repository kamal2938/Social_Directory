const fs = require('fs');
let apiContent = fs.readFileSync('src/lib/api.ts', 'utf8');

apiContent = apiContent.replace(
  /demoLogin: async/,
  `firebaseLogin: async (idToken: string) => {
    const data = await request<{ token: string; user: User }>('/api/auth/firebase-login', {
      method: 'POST',
      body: JSON.stringify({ idToken })
    });
    tokenStorage.set(data.token);
    return data;
  },
  demoLogin: async`
);

fs.writeFileSync('src/lib/api.ts', apiContent);
console.log('api.ts patched');
