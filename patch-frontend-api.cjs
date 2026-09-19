const fs = require('fs');

let apiContent = fs.readFileSync('src/lib/api.ts', 'utf8');
const apiMethods = `
// --- Phase 2-5 API ---

export async function getTransactions(personId: string) { return request<any>('/api/people/' + personId + '/transactions'); }
export async function addTransaction(personId: string, data: any) { return request<any>('/api/people/' + personId + '/transactions', { method: 'POST', body: JSON.stringify(data) }); }
export async function updateTransaction(id: string, data: any) { return request<any>('/api/transactions/' + id, { method: 'PUT', body: JSON.stringify(data) }); }
export async function deleteTransaction(id: string) { return request<any>('/api/transactions/' + id, { method: 'DELETE' }); }
export async function addPayment(txnId: string, data: any) { return request<any>('/api/transactions/' + txnId + '/payments', { method: 'POST', body: JSON.stringify(data) }); }

export async function getDocuments(personId: string) { return request<any>('/api/people/' + personId + '/documents'); }
export async function addDocument(personId: string, data: any) { return request<any>('/api/people/' + personId + '/documents', { method: 'POST', body: JSON.stringify(data) }); }
export async function deleteDocument(id: string) { return request<any>('/api/documents/' + id, { method: 'DELETE' }); }

export async function getEvents(personId: string) { return request<any>('/api/people/' + personId + '/events'); }
export async function addEvent(personId: string, data: any) { return request<any>('/api/people/' + personId + '/events', { method: 'POST', body: JSON.stringify(data) }); }
export async function deleteEvent(id: string) { return request<any>('/api/events/' + id, { method: 'DELETE' }); }

export async function getGifts(personId: string) { return request<any>('/api/people/' + personId + '/gifts'); }
export async function addGift(personId: string, data: any) { return request<any>('/api/people/' + personId + '/gifts', { method: 'POST', body: JSON.stringify(data) }); }
export async function deleteGift(id: string) { return request<any>('/api/gifts/' + id, { method: 'DELETE' }); }

export async function getPreferences(personId: string) { return request<any>('/api/people/' + personId + '/preferences'); }
export async function addPreference(personId: string, data: any) { return request<any>('/api/people/' + personId + '/preferences', { method: 'POST', body: JSON.stringify(data) }); }
export async function deletePreference(id: string) { return request<any>('/api/preferences/' + id, { method: 'DELETE' }); }

`;
fs.appendFileSync('src/lib/api.ts', apiMethods);
console.log('Frontend API patched.');
