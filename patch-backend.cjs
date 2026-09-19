const fs = require('fs');

// 1. PATCH TYPES
const types = `
// --- Phase 2-5 ---
export interface FinancialTransaction {
  id: string; personId: string; type: 'Lent' | 'Borrowed'; amount: number;
  currency: string; date: string; dueDate?: string; description?: string;
  status: 'Active' | 'Partially Settled' | 'Settled' | 'Overdue' | 'Cancelled';
  paidAmount: number; createdAt: string; updatedAt: string;
}
export interface TransactionPayment {
  id: string; transactionId: string; amount: number; date: string; note?: string;
  createdAt: string;
}
export interface PersonalDocument {
  id: string; personId: string; title: string; category: string;
  fileData: string; // Base64 for MVP
  issueDate?: string; expiryDate?: string; notes?: string;
  visibility: PrivacySetting; createdAt: string; updatedAt: string;
}
export interface PersonalEvent {
  id: string; personId: string; title: string; type: string; date: string;
  repeatFrequency: 'One Time' | 'Yearly' | 'Monthly' | 'Custom'; createdAt: string; updatedAt: string;
}
export interface GiftHistory {
  id: string; personId: string; name: string; category: string;
  dateGiven: string; occasion: string; price?: number; note?: string; createdAt: string; updatedAt: string;
}
export interface PersonalPreference {
  id: string; personId: string; category: string; value: string; createdAt: string; updatedAt: string;
}
`;
fs.appendFileSync('server/types.ts', types);
fs.appendFileSync('src/types.ts', types);

// 2. PATCH STORAGE
let storageContent = fs.readFileSync('server/storage.ts', 'utf8');
const storageMethods = `
  // --- Phase 2-5 CRUD ---
  // Finance
  public async getTransactions(personId: string) {
    const snap = await getDocs(query(collection(db, 'finance_transactions'), where('personId', '==', personId)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
  public async addTransaction(personId: string, data: any) {
    const id = 'txn-' + crypto.randomUUID();
    const docData = { id, personId, ...data, paidAmount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await setDoc(doc(db, 'finance_transactions', id), removeUndefined(docData));
    return docData;
  }
  public async updateTransaction(id: string, data: any) {
    const ref = doc(db, 'finance_transactions', id);
    const d = await getDoc(ref);
    if (!d.exists()) return null;
    const updated = { ...d.data(), ...data, updatedAt: new Date().toISOString() };
    await setDoc(ref, removeUndefined(updated));
    return updated;
  }
  public async deleteTransaction(id: string) {
    await deleteDoc(doc(db, 'finance_transactions', id));
    return true;
  }
  public async addPayment(transactionId: string, data: any) {
    const id = 'pay-' + crypto.randomUUID();
    const docData = { id, transactionId, ...data, createdAt: new Date().toISOString() };
    await setDoc(doc(db, 'transaction_payments', id), removeUndefined(docData));
    
    // Update transaction paidAmount
    const tRef = doc(db, 'finance_transactions', transactionId);
    const tDoc = await getDoc(tRef);
    if (tDoc.exists()) {
      const t = tDoc.data();
      const newPaid = (t.paidAmount || 0) + Number(data.amount || 0);
      let status = t.status;
      if (newPaid >= t.amount) status = 'Settled';
      else if (newPaid > 0) status = 'Partially Settled';
      await setDoc(tRef, removeUndefined({ ...t, paidAmount: newPaid, status, updatedAt: new Date().toISOString() }));
    }
    return docData;
  }

  // Vault
  public async getDocuments(personId: string) {
    const snap = await getDocs(query(collection(db, 'personal_documents'), where('personId', '==', personId)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
  public async addDocument(personId: string, data: any) {
    const id = 'doc-' + crypto.randomUUID();
    const docData = { id, personId, ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await setDoc(doc(db, 'personal_documents', id), removeUndefined(docData));
    return docData;
  }
  public async deleteDocument(id: string) {
    await deleteDoc(doc(db, 'personal_documents', id));
    return true;
  }

  // Events
  public async getEvents(personId: string) {
    const snap = await getDocs(query(collection(db, 'personal_events'), where('personId', '==', personId)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
  public async addEvent(personId: string, data: any) {
    const id = 'evt-' + crypto.randomUUID();
    const docData = { id, personId, ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await setDoc(doc(db, 'personal_events', id), removeUndefined(docData));
    return docData;
  }
  public async deleteEvent(id: string) {
    await deleteDoc(doc(db, 'personal_events', id));
    return true;
  }

  // Gifts
  public async getGifts(personId: string) {
    const snap = await getDocs(query(collection(db, 'gift_history'), where('personId', '==', personId)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
  public async addGift(personId: string, data: any) {
    const id = 'gft-' + crypto.randomUUID();
    const docData = { id, personId, ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await setDoc(doc(db, 'gift_history', id), removeUndefined(docData));
    return docData;
  }
  public async deleteGift(id: string) {
    await deleteDoc(doc(db, 'gift_history', id));
    return true;
  }

  // Preferences
  public async getPreferences(personId: string) {
    const snap = await getDocs(query(collection(db, 'personal_preferences'), where('personId', '==', personId)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
  public async addPreference(personId: string, data: any) {
    const id = 'pref-' + crypto.randomUUID();
    const docData = { id, personId, ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await setDoc(doc(db, 'personal_preferences', id), removeUndefined(docData));
    return docData;
  }
  public async deletePreference(id: string) {
    await deleteDoc(doc(db, 'personal_preferences', id));
    return true;
  }
`;

storageContent = storageContent.replace(/}\s*export const storage = new StorageService\(\);\s*$/, storageMethods + "\n}\nexport const storage = new StorageService();");
fs.writeFileSync('server/storage.ts', storageContent);

// 3. PATCH SERVER
let serverContent = fs.readFileSync('server.ts', 'utf8');
const serverRoutes = `
// --- Phase 2-5 Routes ---

// Finance
app.get('/api/people/:id/transactions', authenticate, async (req, res) => {
  try { res.json(await storage.getTransactions(req.params.id)); } catch (e: any) { res.status(500).json({error: e.message}); }
});
app.post('/api/people/:id/transactions', authenticate, async (req, res) => {
  try { res.json(await storage.addTransaction(req.params.id, req.body)); } catch (e: any) { res.status(500).json({error: e.message}); }
});
app.put('/api/transactions/:id', authenticate, async (req, res) => {
  try { res.json(await storage.updateTransaction(req.params.id, req.body)); } catch (e: any) { res.status(500).json({error: e.message}); }
});
app.delete('/api/transactions/:id', authenticate, async (req, res) => {
  try { await storage.deleteTransaction(req.params.id); res.json({success: true}); } catch (e: any) { res.status(500).json({error: e.message}); }
});
app.post('/api/transactions/:id/payments', authenticate, async (req, res) => {
  try { res.json(await storage.addPayment(req.params.id, req.body)); } catch (e: any) { res.status(500).json({error: e.message}); }
});

// Vault
app.get('/api/people/:id/documents', authenticate, async (req, res) => {
  try { res.json(await storage.getDocuments(req.params.id)); } catch (e: any) { res.status(500).json({error: e.message}); }
});
app.post('/api/people/:id/documents', authenticate, async (req, res) => {
  try { res.json(await storage.addDocument(req.params.id, req.body)); } catch (e: any) { res.status(500).json({error: e.message}); }
});
app.delete('/api/documents/:id', authenticate, async (req, res) => {
  try { await storage.deleteDocument(req.params.id); res.json({success: true}); } catch (e: any) { res.status(500).json({error: e.message}); }
});

// Events
app.get('/api/people/:id/events', authenticate, async (req, res) => {
  try { res.json(await storage.getEvents(req.params.id)); } catch (e: any) { res.status(500).json({error: e.message}); }
});
app.post('/api/people/:id/events', authenticate, async (req, res) => {
  try { res.json(await storage.addEvent(req.params.id, req.body)); } catch (e: any) { res.status(500).json({error: e.message}); }
});
app.delete('/api/events/:id', authenticate, async (req, res) => {
  try { await storage.deleteEvent(req.params.id); res.json({success: true}); } catch (e: any) { res.status(500).json({error: e.message}); }
});

// Gifts
app.get('/api/people/:id/gifts', authenticate, async (req, res) => {
  try { res.json(await storage.getGifts(req.params.id)); } catch (e: any) { res.status(500).json({error: e.message}); }
});
app.post('/api/people/:id/gifts', authenticate, async (req, res) => {
  try { res.json(await storage.addGift(req.params.id, req.body)); } catch (e: any) { res.status(500).json({error: e.message}); }
});
app.delete('/api/gifts/:id', authenticate, async (req, res) => {
  try { await storage.deleteGift(req.params.id); res.json({success: true}); } catch (e: any) { res.status(500).json({error: e.message}); }
});

// Preferences
app.get('/api/people/:id/preferences', authenticate, async (req, res) => {
  try { res.json(await storage.getPreferences(req.params.id)); } catch (e: any) { res.status(500).json({error: e.message}); }
});
app.post('/api/people/:id/preferences', authenticate, async (req, res) => {
  try { res.json(await storage.addPreference(req.params.id, req.body)); } catch (e: any) { res.status(500).json({error: e.message}); }
});
app.delete('/api/preferences/:id', authenticate, async (req, res) => {
  try { await storage.deletePreference(req.params.id); res.json({success: true}); } catch (e: any) { res.status(500).json({error: e.message}); }
});

`;
serverContent = serverContent.replace("// -- END Phase 1 --", "// -- END Phase 1 --\n" + serverRoutes);
fs.writeFileSync('server.ts', serverContent);

console.log('Backend patched.');
