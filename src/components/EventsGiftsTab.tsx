
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
