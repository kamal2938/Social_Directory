
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
        <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/40 flex flex-col items-center">
          <span className="text-emerald-700 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider">To Receive (Lent)</span>
          <span className="text-2xl font-bold text-emerald-800 dark:text-emerald-200 mt-1">৳{totalLent}</span>
        </div>
        <div className="bg-rose-50 dark:bg-rose-950/30 p-4 rounded-xl border border-rose-100 dark:border-rose-900/40 flex flex-col items-center">
          <span className="text-rose-700 dark:text-rose-300 text-xs font-semibold uppercase tracking-wider">To Pay (Borrowed)</span>
          <span className="text-2xl font-bold text-rose-800 dark:text-rose-200 mt-1">৳{totalBorrowed}</span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary-500" /> Transactions
          </h3>
          <button 
            onClick={() => setNewTxn({ type: 'Lent', currency: 'BDT' })} 
            className="text-xs sm:text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4"/> Add Transaction
          </button>
        </div>

        {newTxn && (
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 mb-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Transaction Type</label>
              <select 
                value={newTxn.type} 
                onChange={e => setNewTxn({...newTxn, type: e.target.value as any})} 
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              >
                <option value="Lent" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">I Lent Money</option>
                <option value="Borrowed" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">I Borrowed Money</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Amount (BDT)</label>
              <input 
                type="number" 
                placeholder="Amount in ৳" 
                value={newTxn.amount || ''} 
                onChange={e => setNewTxn({...newTxn, amount: Number(e.target.value)})} 
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
              <input 
                type="text" 
                placeholder="Purpose or description..." 
                value={newTxn.description || ''} 
                onChange={e => setNewTxn({...newTxn, description: e.target.value})} 
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date</label>
              <input 
                type="date" 
                value={newTxn.date || ''} 
                onChange={e => setNewTxn({...newTxn, date: e.target.value})} 
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" 
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button 
                onClick={() => setNewTxn(null)} 
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                className="px-4 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-semibold hover:bg-primary-700 transition-colors cursor-pointer shadow-xs"
              >
                Save
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {txns.map(t => (
            <div key={t.id} className="p-4 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 rounded-xl flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {t.type === 'Lent' ? <ArrowUpRight className="text-emerald-500 w-5 h-5"/> : <ArrowDownLeft className="text-rose-500 w-5 h-5"/>}
                  <span className="font-bold text-slate-900 dark:text-white text-base">৳{t.amount} {t.type}</span>
                </div>
                <button 
                  onClick={() => handleDelete(t.id)} 
                  className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 p-1.5 rounded-lg transition-colors cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4"/>
                </button>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">{t.description} • {t.date}</p>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-full">
                  Paid: ৳{t.paidAmount} / ৳{t.amount}
                </span>
                {t.paidAmount < t.amount ? (
                  paymentTxn === t.id ? (
                    <div className="flex gap-1.5 items-center">
                      <input 
                        type="number" 
                        placeholder="Amt" 
                        className="w-24 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-2.5 py-1 text-xs focus:ring-2 focus:ring-emerald-500 outline-none" 
                        value={paymentAmount} 
                        onChange={e => setPaymentAmount(e.target.value)}
                      />
                      <button onClick={() => handlePayment(t.id)} className="bg-emerald-600 text-white p-1.5 rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"><CheckCircle className="w-4 h-4"/></button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setPaymentTxn(t.id)} 
                      className="text-xs bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-900/50 px-2.5 py-1 rounded-lg font-medium hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors cursor-pointer"
                    >
                      Add Payment
                    </button>
                  )
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Settled
                  </span>
                )}
              </div>
            </div>
          ))}
          {txns.length === 0 && !newTxn && (
            <p className="text-xs text-slate-500 dark:text-slate-400 italic text-center py-5">
              No financial records yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
