const fs = require('fs');
const path = require('path');

// 1. FinanceTab.tsx
const financeTab = `
import React, { useState, useEffect } from 'react';
import { Person, FinancialTransaction } from '../types';
import { getTransactions, addTransaction, deleteTransaction, addPayment } from '../lib/api';
import { DollarSign, Plus, Trash2, ArrowUpRight, ArrowDownLeft, CheckCircle } from 'lucide-react';

export function FinanceTab({ person }: { person: Person }) {
  const [txns, setTxns] = useState<FinancialTransaction[]>([]);
  const [newTxn, setNewTxn] = useState<Partial<FinancialTransaction> | null>(null);
  const [paymentTxn, setPaymentTxn] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  
  useEffect(() => { loadData(); }, [person.id]);
  const loadData = async () => setTxns(await getTransactions(person.id));

  const handleSave = async () => {
    if (!newTxn?.amount) return;
    await addTransaction(person.id, newTxn);
    setNewTxn(null);
    loadData();
  };
  const handlePayment = async (id: string) => {
    if (!paymentAmount) return;
    await addPayment(id, { amount: Number(paymentAmount), date: new Date().toISOString() });
    setPaymentTxn(null); setPaymentAmount('');
    loadData();
  };
  const handleDelete = async (id: string) => {
    if (confirm('Delete transaction?')) { await deleteTransaction(id); loadData(); }
  };

  const totalLent = txns.filter(t => t.type === 'Lent').reduce((acc, t) => acc + (t.amount - t.paidAmount), 0);
  const totalBorrowed = txns.filter(t => t.type === 'Borrowed').reduce((acc, t) => acc + (t.amount - t.paidAmount), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex flex-col items-center">
          <span className="text-green-700 text-sm font-medium">To Receive (Lent)</span>
          <span className="text-2xl font-bold text-green-800">৳{totalLent}</span>
        </div>
        <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex flex-col items-center">
          <span className="text-red-700 text-sm font-medium">To Pay (Borrowed)</span>
          <span className="text-2xl font-bold text-red-800">৳{totalBorrowed}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2"><DollarSign className="w-5 h-5 text-blue-500" /> Transactions</h3>
          <button onClick={() => setNewTxn({ type: 'Lent', currency: 'BDT' })} className="text-sm bg-gray-100 px-3 py-1.5 rounded-lg flex items-center gap-1"><Plus className="w-4 h-4"/> Add</button>
        </div>

        {newTxn && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4 space-y-3">
            <select value={newTxn.type} onChange={e => setNewTxn({...newTxn, type: e.target.value as any})} className="w-full p-2 border rounded">
              <option value="Lent">I Lent Money</option><option value="Borrowed">I Borrowed Money</option>
            </select>
            <input type="number" placeholder="Amount" value={newTxn.amount || ''} onChange={e => setNewTxn({...newTxn, amount: Number(e.target.value)})} className="w-full p-2 border rounded" />
            <input type="text" placeholder="Description" value={newTxn.description || ''} onChange={e => setNewTxn({...newTxn, description: e.target.value})} className="w-full p-2 border rounded" />
            <input type="date" value={newTxn.date || ''} onChange={e => setNewTxn({...newTxn, date: e.target.value})} className="w-full p-2 border rounded" />
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => setNewTxn(null)} className="px-3 py-1">Cancel</button>
              <button onClick={handleSave} className="bg-blue-600 text-white px-3 py-1 rounded">Save</button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {txns.map(t => (
            <div key={t.id} className="p-4 border rounded-lg flex flex-col gap-2">
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  {t.type === 'Lent' ? <ArrowUpRight className="text-green-500 w-5 h-5"/> : <ArrowDownLeft className="text-red-500 w-5 h-5"/>}
                  <span className="font-bold text-lg">৳{t.amount} {t.type}</span>
                </div>
                <button onClick={() => handleDelete(t.id)} className="text-red-500"><Trash2 className="w-4 h-4"/></button>
              </div>
              <p className="text-sm text-gray-600">{t.description} • {t.date}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded">Paid: ৳{t.paidAmount} / ৳{t.amount}</span>
                {t.paidAmount < t.amount ? (
                  paymentTxn === t.id ? (
                    <div className="flex gap-1">
                      <input type="number" placeholder="Amt" className="border w-20 px-2 py-1 rounded text-sm" value={paymentAmount} onChange={e=>setPaymentAmount(e.target.value)}/>
                      <button onClick={()=>handlePayment(t.id)} className="bg-green-500 text-white px-2 rounded"><CheckCircle className="w-4 h-4"/></button>
                    </div>
                  ) : <button onClick={()=>setPaymentTxn(t.id)} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Add Payment</button>
                ) : <span className="text-green-600 font-bold text-sm">Settled</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync('src/components/FinanceTab.tsx', financeTab);

// 2. VaultTab.tsx
const vaultTab = `
import React, { useState, useEffect } from 'react';
import { Person, PersonalDocument } from '../types';
import { getDocuments, addDocument, deleteDocument } from '../lib/api';
import { Shield, Plus, Trash2, FileText, Download } from 'lucide-react';

export function VaultTab({ person }: { person: Person }) {
  const [docs, setDocs] = useState<PersonalDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  
  useEffect(() => { loadData(); }, [person.id]);
  const loadData = async () => setDocs(await getDocuments(person.id));

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 500) return alert('File too large. Max 500KB for this demo.');
    
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        await addDocument(person.id, {
          title: file.name, category: 'General', fileData: reader.result as string, visibility: 'Only Me'
        });
        loadData();
      } catch (err) { alert('Upload failed'); }
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete document?')) { await deleteDocument(id); loadData(); }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2"><Shield className="w-5 h-5 text-indigo-500" /> Document Vault</h3>
          <label className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer">
            <Plus className="w-4 h-4"/> {uploading ? 'Uploading...' : 'Upload'}
            <input type="file" className="hidden" accept=".pdf,.jpg,.png" onChange={handleFileUpload} disabled={uploading}/>
          </label>
        </div>
        <p className="text-xs text-gray-500 mb-4">Secure, private document storage. Files are encrypted in transit.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {docs.map(d => (
            <div key={d.id} className="p-3 border rounded-lg flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-3 overflow-hidden">
                <FileText className="text-indigo-400 w-8 h-8 flex-shrink-0" />
                <div className="truncate">
                  <p className="font-bold text-sm truncate">{d.title}</p>
                  <p className="text-xs text-gray-500">{new Date(d.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <a href={d.fileData} download={d.title} className="text-blue-500 p-1 bg-white rounded shadow-sm hover:bg-blue-50"><Download className="w-4 h-4"/></a>
                <button onClick={() => handleDelete(d.id)} className="text-red-500 p-1 bg-white rounded shadow-sm hover:bg-red-50"><Trash2 className="w-4 h-4"/></button>
              </div>
            </div>
          ))}
          {docs.length === 0 && <p className="text-sm text-gray-500 italic py-4 col-span-2 text-center">No documents uploaded.</p>}
        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync('src/components/VaultTab.tsx', vaultTab);

// 3. EventsGiftsTab.tsx
const eventsTab = `
import React, { useState, useEffect } from 'react';
import { Person, PersonalEvent, GiftHistory, PersonalPreference } from '../types';
import { getEvents, addEvent, deleteEvent, getGifts, addGift, deleteGift, getPreferences, addPreference, deletePreference } from '../lib/api';
import { Calendar, Gift, Heart, Plus, Trash2, Send } from 'lucide-react';

export function EventsGiftsTab({ person }: { person: Person }) {
  const [events, setEvents] = useState<PersonalEvent[]>([]);
  const [gifts, setGifts] = useState<GiftHistory[]>([]);
  const [prefs, setPrefs] = useState<PersonalPreference[]>([]);

  const [newEvent, setNewEvent] = useState<any>(null);
  const [newGift, setNewGift] = useState<any>(null);
  const [newPref, setNewPref] = useState<any>(null);

  useEffect(() => { loadData(); }, [person.id]);
  const loadData = async () => {
    setEvents(await getEvents(person.id));
    setGifts(await getGifts(person.id));
    setPrefs(await getPreferences(person.id));
  };

  const handleSendGreeting = (e: PersonalEvent) => {
    const text = encodeURIComponent(\`Dear \${person.name}, wishing you a very happy \${e.title}!\`);
    const phone = person.phone?.replace(/[^0-9+]/g, '') || '';
    window.open(\`https://wa.me/\${phone}?text=\${text}\`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2"><Calendar className="w-5 h-5 text-orange-500" /> Special Events</h3>
          <button onClick={() => setNewEvent({})} className="text-sm bg-gray-100 px-3 py-1.5 rounded-lg flex items-center gap-1"><Plus className="w-4 h-4"/> Add</button>
        </div>
        {newEvent && (
          <div className="bg-gray-50 p-4 border rounded-lg mb-4 space-y-2">
            <input type="text" placeholder="Title (e.g. Birthday)" onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="w-full p-2 border rounded"/>
            <input type="date" onChange={e => setNewEvent({...newEvent, date: e.target.value})} className="w-full p-2 border rounded"/>
            <button onClick={async () => { await addEvent(person.id, newEvent); setNewEvent(null); loadData(); }} className="bg-orange-600 text-white px-4 py-1 rounded w-full">Save Event</button>
          </div>
        )}
        <div className="space-y-2">
          {events.map(e => (
            <div key={e.id} className="p-3 border rounded-lg flex justify-between items-center">
              <div><p className="font-bold">{e.title}</p><p className="text-sm text-gray-500">{new Date(e.date).toLocaleDateString()}</p></div>
              <div className="flex gap-2">
                <button onClick={() => handleSendGreeting(e)} className="bg-green-100 text-green-700 px-3 py-1 rounded flex items-center gap-1 text-sm"><Send className="w-3 h-3"/> Wish</button>
                <button onClick={async () => { await deleteEvent(e.id); loadData(); }} className="text-red-500"><Trash2 className="w-4 h-4"/></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2"><Gift className="w-5 h-5 text-pink-500" /> Gifts</h3>
            <button onClick={() => setNewGift({})} className="text-sm bg-gray-100 px-2 py-1 rounded-lg"><Plus className="w-4 h-4"/></button>
          </div>
          {newGift && (
            <div className="mb-4 space-y-2">
              <input type="text" placeholder="Gift Name" onChange={e => setNewGift({...newGift, name: e.target.value})} className="w-full p-2 border rounded text-sm"/>
              <button onClick={async () => { await addGift(person.id, newGift); setNewGift(null); loadData(); }} className="bg-pink-600 text-white px-4 py-1 rounded text-sm w-full">Save Gift</button>
            </div>
          )}
          <div className="space-y-2">
            {gifts.map(g => (
              <div key={g.id} className="text-sm p-2 border rounded flex justify-between">
                <span>{g.name}</span><button onClick={async () => { await deleteGift(g.id); loadData(); }} className="text-red-500"><Trash2 className="w-3 h-3"/></button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2"><Heart className="w-5 h-5 text-red-500" /> Preferences</h3>
            <button onClick={() => setNewPref({})} className="text-sm bg-gray-100 px-2 py-1 rounded-lg"><Plus className="w-4 h-4"/></button>
          </div>
          {newPref && (
            <div className="mb-4 space-y-2 flex gap-1">
              <input type="text" placeholder="Cat (e.g. Food)" onChange={e => setNewPref({...newPref, category: e.target.value})} className="w-1/3 p-2 border rounded text-sm"/>
              <input type="text" placeholder="Value" onChange={e => setNewPref({...newPref, value: e.target.value})} className="w-2/3 p-2 border rounded text-sm"/>
              <button onClick={async () => { await addPreference(person.id, newPref); setNewPref(null); loadData(); }} className="bg-red-600 text-white px-2 rounded text-sm">Save</button>
            </div>
          )}
          <div className="space-y-2">
            {prefs.map(p => (
              <div key={p.id} className="text-sm p-2 border rounded flex justify-between bg-gray-50">
                <span><strong>{p.category}:</strong> {p.value}</span><button onClick={async () => { await deletePreference(p.id); loadData(); }} className="text-red-500"><Trash2 className="w-3 h-3"/></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync('src/components/EventsGiftsTab.tsx', eventsTab);

// 4. FamilyTreeTab.tsx
const treeTab = `
import React, { useState, useEffect } from 'react';
import { Person } from '../types';
import { api } from '../lib/api';
import { Network, Users } from 'lucide-react';

export function FamilyTreeTab({ person }: { person: Person }) {
  const [family, setFamily] = useState<Person[]>([]);

  useEffect(() => {
    api.getPeople().then(people => {
      // Very basic approximation for demo: people sharing same circle or relationship type
      const relatives = people.filter(p => 
        p.id !== person.id && 
        (p.relationshipType === 'Family Contact' || p.tags.includes('Family'))
      );
      setFamily(relatives);
    });
  }, [person.id]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm text-center">
        <Network className="w-12 h-12 text-blue-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Relationship Map</h3>
        <p className="text-gray-500 mb-6">Visualizing connections for {person.name}</p>
        
        <div className="relative border-t-2 border-gray-200 mt-8 pt-8 flex justify-center gap-8">
          {/* Main Person */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white px-4">
            <div className="bg-blue-100 border-2 border-blue-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-1">
              {person.photo ? <img src={person.photo} className="w-full h-full rounded-full object-cover"/> : <span className="text-blue-700 font-bold">{person.name.charAt(0)}</span>}
            </div>
            <span className="font-bold text-sm">{person.name}</span>
          </div>

          {/* Relatives */}
          {family.length === 0 ? (
            <p className="text-gray-400 italic">No family members identified in your network yet.</p>
          ) : (
            family.map((f, i) => (
              <div key={f.id} className="relative flex flex-col items-center">
                <div className="w-px h-8 bg-gray-200 absolute -top-8"></div>
                <div className="bg-gray-100 border border-gray-300 rounded-full w-10 h-10 flex items-center justify-center mb-1">
                  {f.photo ? <img src={f.photo} className="w-full h-full rounded-full object-cover"/> : <span className="text-gray-600 font-bold">{f.name.charAt(0)}</span>}
                </div>
                <span className="text-xs font-medium">{f.name}</span>
                <span className="text-[10px] text-gray-500">{f.relationshipType}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync('src/components/FamilyTreeTab.tsx', treeTab);

console.log('Components created.');
