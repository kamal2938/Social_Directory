
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
    try { await deleteTransaction(id); loadData(); } catch (e) {}
  };

  const totalLent = txns.filter(t => t.type === 'Lent').reduce((acc, t) => acc + (Number(t.amount || 0) - Number(t.paidAmount || 0)), 0);
  const totalBorrowed = txns.filter(t => t.type === 'Borrowed').reduce((acc, t) => acc + (Number(t.amount || 0) - Number(t.paidAmount || 0)), 0);

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
