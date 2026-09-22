
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
    const text = encodeURIComponent(`Dear ${person.name}, wishing you a very happy ${e.title}!`);
    const phone = person.phone?.replace(/[^0-9+]/g, '') || '';
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-500" /> Special Events
          </h3>
          <button 
            onClick={() => setNewEvent({})} 
            className="text-xs sm:text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4"/> Add Event
          </button>
        </div>

        {newEvent && (
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700 rounded-xl mb-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Event Title</label>
              <input 
                type="text" 
                placeholder="Title (e.g. Birthday, Anniversary)" 
                onChange={e => setNewEvent({...newEvent, title: e.target.value})} 
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Event Date</label>
              <input 
                type="date" 
                onChange={e => setNewEvent({...newEvent, date: e.target.value})} 
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button 
                onClick={() => setNewEvent(null)} 
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={async () => { await addEvent(person.id, newEvent); setNewEvent(null); loadData(); }} 
                className="px-4 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 transition-colors cursor-pointer shadow-xs"
              >
                Save Event
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2.5">
          {events.map(e => (
            <div key={e.id} className="p-3.5 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 rounded-xl flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{e.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{new Date(e.date).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleSendGreeting(e)} 
                  className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5"/> Wish
                </button>
                <button 
                  onClick={async () => { await deleteEvent(e.id); loadData(); }} 
                  className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 p-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4"/>
                </button>
              </div>
            </div>
          ))}
          {events.length === 0 && !newEvent && (
            <p className="text-xs text-slate-500 dark:text-slate-400 italic text-center py-4">No special events recorded.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Gift className="w-5 h-5 text-rose-500" /> Gifts
            </h3>
            <button 
              onClick={() => setNewGift({})} 
              className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Plus className="w-4 h-4"/>
            </button>
          </div>
          {newGift && (
            <div className="mb-4 space-y-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <input 
                type="text" 
                placeholder="Gift Name" 
                onChange={e => setNewGift({...newGift, name: e.target.value})} 
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-2 text-xs focus:ring-2 focus:ring-rose-500 outline-none"
              />
              <div className="flex justify-end gap-1.5 pt-1">
                <button onClick={() => setNewGift(null)} className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-400">Cancel</button>
                <button 
                  onClick={async () => { await addGift(person.id, newGift); setNewGift(null); loadData(); }} 
                  className="bg-rose-600 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-rose-700 transition-colors"
                >
                  Save Gift
                </button>
              </div>
            </div>
          )}
          <div className="space-y-2">
            {gifts.map(g => (
              <div key={g.id} className="text-xs p-2.5 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 rounded-lg flex justify-between items-center text-slate-900 dark:text-slate-100">
                <span>{g.name}</span>
                <button onClick={async () => { await deleteGift(g.id); loadData(); }} className="text-rose-500 hover:text-rose-600 p-1">
                  <Trash2 className="w-3.5 h-3.5"/>
                </button>
              </div>
            ))}
            {gifts.length === 0 && !newGift && (
              <p className="text-xs text-slate-400 italic text-center py-2">No gifts added.</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" /> Preferences
            </h3>
            <button 
              onClick={() => setNewPref({})} 
              className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Plus className="w-4 h-4"/>
            </button>
          </div>
          {newPref && (
            <div className="mb-4 space-y-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex gap-1.5">
                <input 
                  type="text" 
                  placeholder="Category (e.g. Food)" 
                  onChange={e => setNewPref({...newPref, category: e.target.value})} 
                  className="w-1/3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-2 text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                />
                <input 
                  type="text" 
                  placeholder="Value / Like" 
                  onChange={e => setNewPref({...newPref, value: e.target.value})} 
                  className="w-2/3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-2 text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>
              <div className="flex justify-end gap-1.5 pt-1">
                <button onClick={() => setNewPref(null)} className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-400">Cancel</button>
                <button 
                  onClick={async () => { await addPreference(person.id, newPref); setNewPref(null); loadData(); }} 
                  className="bg-rose-600 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-rose-700 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          )}
          <div className="space-y-2">
            {prefs.map(p => (
              <div key={p.id} className="text-xs p-2.5 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 rounded-lg flex justify-between items-center text-slate-900 dark:text-slate-100">
                <span><strong className="text-slate-700 dark:text-slate-300">{p.category}:</strong> {p.value}</span>
                <button onClick={async () => { await deletePreference(p.id); loadData(); }} className="text-rose-500 hover:text-rose-600 p-1">
                  <Trash2 className="w-3.5 h-3.5"/>
                </button>
              </div>
            ))}
            {prefs.length === 0 && !newPref && (
              <p className="text-xs text-slate-400 italic text-center py-2">No preferences added.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
