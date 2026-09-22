import React, { useState, useEffect } from 'react';
import { Person, HealthProfile, Medicine, Allergy, EmergencyContact, BloodGroup, PrivacySetting, EmergencyPriority } from '../types';
import { getHealthData, updateHealthProfile, addMedicine, updateMedicine, deleteMedicine, addAllergy, updateAllergy, deleteAllergy, addEmergencyContact, updateEmergencyContact, deleteEmergencyContact } from '../lib/api';
import { HeartPulse, Pill, ShieldAlert, PhoneCall, Plus, Edit2, Trash2, Save, X, Eye, EyeOff } from 'lucide-react';

interface Props {
  person: Person;
}

export function HealthTab({ person }: Props) {
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit states
  const [editProfile, setEditProfile] = useState(false);
  const [profileData, setProfileData] = useState<Partial<HealthProfile>>({});

  const [newMed, setNewMed] = useState<Partial<Medicine> | null>(null);
  const [newAllergy, setNewAllergy] = useState<Partial<Allergy> | null>(null);
  const [newContact, setNewContact] = useState<Partial<EmergencyContact> | null>(null);

  useEffect(() => {
    loadData();
  }, [person.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data: any = await getHealthData(person.id);
      setProfile(data.profile);
      setProfileData(data.profile || { bloodGroup: 'Unknown / Not Specified', visibility: 'Only Me' });
      setMedicines(data.medicines || []);
      setAllergies(data.allergies || []);
      setContacts(data.emergencyContacts || []);
    } catch (err: any) {
      setError('Failed to load health data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const updated = await updateHealthProfile(person.id, profileData);
      setProfile(updated as HealthProfile);
      setEditProfile(false);
    } catch (err) {
      alert('Error saving profile');
    }
  };

  const handleSaveMed = async () => {
    if (!newMed?.name) return;
    try {
      if (newMed.id) {
        await updateMedicine(newMed.id, newMed);
      } else {
        await addMedicine(person.id, newMed);
      }
      setNewMed(null);
      loadData();
    } catch (err) {
      alert('Error saving medicine');
    }
  };

  const handleSaveAllergy = async () => {
    if (!newAllergy?.name) return;
    try {
      if (newAllergy.id) {
        await updateAllergy(newAllergy.id, newAllergy);
      } else {
        await addAllergy(person.id, newAllergy);
      }
      setNewAllergy(null);
      loadData();
    } catch (err) {
      alert('Error saving allergy');
    }
  };

  const handleSaveContact = async () => {
    if (!newContact?.name || !newContact?.phoneNumber) return;
    try {
      if (newContact.id) {
        await updateEmergencyContact(newContact.id, newContact);
      } else {
        await addEmergencyContact(person.id, newContact);
      }
      setNewContact(null);
      loadData();
    } catch (err) {
      alert('Error saving emergency contact');
    }
  };

  const handleDeleteMed = async (id: string) => {
    try {
      await deleteMedicine(id);
      loadData();
    } catch(e) {}
  };
  const handleDeleteAllergy = async (id: string) => {
    try {
      await deleteAllergy(id);
      loadData();
    } catch(e) {}
  };
  const handleDeleteContact = async (id: string) => {
    try {
      await deleteEmergencyContact(id);
      loadData();
    } catch(e) {}
  };

  if (loading) return <div className="p-4 text-center text-gray-500">Loading...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      {/* 1. Health Profile Summary */}
      <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-rose-500" />
            Health Profile
          </h3>
          <button 
            onClick={() => setEditProfile(!editProfile)} 
            className="text-xs sm:text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {editProfile ? <X className="w-4 h-4"/> : <Edit2 className="w-4 h-4"/>}
            {editProfile ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {editProfile ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Blood Group</label>
              <select 
                value={profileData.bloodGroup} 
                onChange={e => setProfileData({...profileData, bloodGroup: e.target.value as BloodGroup})}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown / Not Specified'].map(bg => (
                  <option key={bg} value={bg} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">{bg}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Medical Conditions</label>
              <textarea 
                value={profileData.medicalConditions || ''} 
                onChange={e => setProfileData({...profileData, medicalConditions: e.target.value})}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                rows={3}
                placeholder="e.g. Diabetes, Asthma, High Blood Pressure, etc."
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Privacy & Access</label>
              <select 
                value={profileData.visibility} 
                onChange={e => setProfileData({...profileData, visibility: e.target.value as PrivacySetting})}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              >
                {['Only Me', 'Selected Family Members', 'Private Group', 'Custom Access'].map(v => (
                  <option key={v} value={v} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">{v}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={handleSaveProfile} 
              className="bg-primary-600 text-white px-4 py-2.5 rounded-xl hover:bg-primary-700 text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4"/> Save Profile
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-rose-50 dark:bg-rose-950/30 rounded-xl p-4 flex flex-col items-center justify-center border border-rose-100 dark:border-rose-900/40">
              <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold mb-1 uppercase tracking-wider">Blood Group</span>
              <span className="text-2xl font-black text-rose-700 dark:text-rose-300">{profile?.bloodGroup || 'Unknown'}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1 block uppercase tracking-wider">Privacy & Visibility</span>
              <span className="text-slate-900 dark:text-slate-100 font-semibold text-sm flex items-center gap-2 mt-1">
                {profile?.visibility === 'Only Me' ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-emerald-500" />}
                {profile?.visibility || 'Only Me'}
              </span>
            </div>
            {profile?.medicalConditions && (
              <div className="md:col-span-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 mt-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1 block uppercase tracking-wider">Medical Conditions</span>
                <p className="text-slate-800 dark:text-slate-200 text-sm whitespace-pre-wrap">{profile.medicalConditions}</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 2. Emergency Contacts */}
      <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-emerald-500" />
            Emergency Contacts
          </h3>
          <button 
            onClick={() => setNewContact({ priority: 'Primary' })} 
            className="text-xs sm:text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4"/> Add Contact
          </button>
        </div>

        {newContact && (
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 mb-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Name</label>
              <input 
                type="text" 
                placeholder="Full Name (e.g. John Doe)" 
                value={newContact.name || ''} 
                onChange={e => setNewContact({...newContact, name: e.target.value})} 
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Relationship</label>
              <input 
                type="text" 
                placeholder="Relationship (e.g., Brother, Spouse, Doctor)" 
                value={newContact.relationship || ''} 
                onChange={e => setNewContact({...newContact, relationship: e.target.value})} 
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
              <input 
                type="text" 
                placeholder="Phone Number (e.g., +8801700000000)" 
                value={newContact.phoneNumber || ''} 
                onChange={e => setNewContact({...newContact, phoneNumber: e.target.value})} 
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" 
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button 
                onClick={() => setNewContact(null)} 
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveContact} 
                className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors cursor-pointer shadow-xs"
              >
                Save Contact
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {contacts.map(c => (
            <div key={c.id} className="flex justify-between items-center p-3.5 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  {c.name} 
                  <span className="text-[11px] font-normal text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 px-2.5 py-0.5 rounded-full">
                    {c.relationship}
                  </span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{c.phoneNumber}</p>
              </div>
              <div className="flex gap-1.5">
                <button 
                  onClick={() => setNewContact(c)} 
                  className="text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/50 p-1.5 rounded-lg transition-colors cursor-pointer"
                  title="Edit contact"
                >
                  <Edit2 className="w-4 h-4"/>
                </button>
                <button 
                  onClick={() => handleDeleteContact(c.id)} 
                  className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 p-1.5 rounded-lg transition-colors cursor-pointer"
                  title="Delete contact"
                >
                  <Trash2 className="w-4 h-4"/>
                </button>
              </div>
            </div>
          ))}
          {contacts.length === 0 && !newContact && (
            <p className="text-xs text-slate-500 dark:text-slate-400 italic text-center py-5">
              No emergency contacts added yet.
            </p>
          )}
        </div>
      </section>

      {/* 3. Medicines */}
      <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Pill className="w-5 h-5 text-purple-500" />
            Regular Medicines
          </h3>
          <button 
            onClick={() => setNewMed({})} 
            className="text-xs sm:text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4"/> Add Medicine
          </button>
        </div>

        {newMed && (
          <div className="bg-purple-50/50 dark:bg-purple-950/20 p-4 rounded-xl border border-purple-100 dark:border-purple-900/40 mb-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Medicine Name</label>
              <input 
                type="text" 
                placeholder="Medicine Name (e.g. Paracetamol, Metformin)" 
                value={newMed.name || ''} 
                onChange={e => setNewMed({...newMed, name: e.target.value})} 
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Dosage</label>
              <input 
                type="text" 
                placeholder="Dosage (e.g., 500mg, 1 tablet)" 
                value={newMed.dosage || ''} 
                onChange={e => setNewMed({...newMed, dosage: e.target.value})} 
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Frequency</label>
              <input 
                type="text" 
                placeholder="Frequency (e.g., Twice a day, After meals)" 
                value={newMed.frequency || ''} 
                onChange={e => setNewMed({...newMed, frequency: e.target.value})} 
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes (Optional)</label>
              <textarea 
                placeholder="Notes or special instructions..." 
                value={newMed.notes || ''} 
                onChange={e => setNewMed({...newMed, notes: e.target.value})} 
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all" 
                rows={2} 
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button 
                onClick={() => setNewMed(null)} 
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveMed} 
                className="px-4 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 transition-colors cursor-pointer shadow-xs"
              >
                Save Medicine
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3">
          {medicines.map(m => (
            <div key={m.id} className="p-3.5 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 rounded-xl flex justify-between items-start">
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">
                  {m.name} <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1">({m.dosage})</span>
                </p>
                <p className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-0.5 rounded-full inline-block mt-1 border border-purple-200 dark:border-purple-900/50">
                  {m.frequency}
                </p>
                {m.notes && <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">{m.notes}</p>}
              </div>
              <div className="flex gap-1.5">
                <button 
                  onClick={() => setNewMed(m)} 
                  className="text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/50 p-1.5 rounded-lg transition-colors cursor-pointer"
                  title="Edit medicine"
                >
                  <Edit2 className="w-4 h-4"/>
                </button>
                <button 
                  onClick={() => handleDeleteMed(m.id)} 
                  className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 p-1.5 rounded-lg transition-colors cursor-pointer"
                  title="Delete medicine"
                >
                  <Trash2 className="w-4 h-4"/>
                </button>
              </div>
            </div>
          ))}
          {medicines.length === 0 && !newMed && (
            <p className="text-xs text-slate-500 dark:text-slate-400 italic text-center py-5">
              No regular medicines recorded.
            </p>
          )}
        </div>
      </section>

      {/* 4. Allergies */}
      <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            Allergies
          </h3>
          <button 
            onClick={() => setNewAllergy({})} 
            className="text-xs sm:text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4"/> Add Allergy
          </button>
        </div>

        {newAllergy && (
          <div className="bg-amber-50/50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-100 dark:border-amber-900/40 mb-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Allergy Name</label>
              <input 
                type="text" 
                placeholder="Allergy Name (e.g., Peanuts, Penicillin, Dust, Sulfa)" 
                value={newAllergy.name || ''} 
                onChange={e => setNewAllergy({...newAllergy, name: e.target.value})} 
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Reaction / Description (Optional)</label>
              <textarea 
                placeholder="Reaction description (e.g., Skin rash, Breathing difficulty)" 
                value={newAllergy.description || ''} 
                onChange={e => setNewAllergy({...newAllergy, description: e.target.value})} 
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all" 
                rows={2} 
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button 
                onClick={() => setNewAllergy(null)} 
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveAllergy} 
                className="px-4 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 transition-colors cursor-pointer shadow-xs"
              >
                Save Allergy
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2.5">
          {allergies.map(a => (
            <div key={a.id} className="p-3.5 border border-amber-200 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/30 rounded-xl flex gap-3 items-center w-full md:w-auto flex-1 min-w-[250px]">
              <div className="flex-1">
                <p className="font-bold text-amber-900 dark:text-amber-200 text-sm">{a.name}</p>
                {a.description && <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">{a.description}</p>}
              </div>
              <div className="flex flex-col gap-1">
                <button 
                  onClick={() => setNewAllergy(a)} 
                  className="text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 p-1.5 rounded-lg transition-colors cursor-pointer"
                  title="Edit allergy"
                >
                  <Edit2 className="w-3.5 h-3.5"/>
                </button>
                <button 
                  onClick={() => handleDeleteAllergy(a.id)} 
                  className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 p-1.5 rounded-lg transition-colors cursor-pointer"
                  title="Delete allergy"
                >
                  <Trash2 className="w-3.5 h-3.5"/>
                </button>
              </div>
            </div>
          ))}
          {allergies.length === 0 && !newAllergy && (
            <p className="text-xs text-slate-500 dark:text-slate-400 italic text-center py-5 w-full">
              No allergies recorded.
            </p>
          )}
        </div>
      </section>

    </div>
  );
}
