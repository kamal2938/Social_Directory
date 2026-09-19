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
      <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-red-500" />
            Health Profile
          </h3>
          <button onClick={() => setEditProfile(!editProfile)} className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
            {editProfile ? <X className="w-4 h-4"/> : <Edit2 className="w-4 h-4"/>}
            {editProfile ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {editProfile ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
              <select 
                value={profileData.bloodGroup} 
                onChange={e => setProfileData({...profileData, bloodGroup: e.target.value as BloodGroup})}
                className="w-full rounded-lg border-gray-300 p-2 border focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown / Not Specified'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Medical Conditions</label>
              <textarea 
                value={profileData.medicalConditions || ''} 
                onChange={e => setProfileData({...profileData, medicalConditions: e.target.value})}
                className="w-full rounded-lg border-gray-300 p-2 border focus:ring-2 focus:ring-blue-500 outline-none"
                rows={3}
                placeholder="Diabetes, Asthma, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Privacy</label>
              <select 
                value={profileData.visibility} 
                onChange={e => setProfileData({...profileData, visibility: e.target.value as PrivacySetting})}
                className="w-full rounded-lg border-gray-300 p-2 border focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {['Only Me', 'Selected Family Members', 'Private Group', 'Custom Access'].map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
            <button onClick={handleSaveProfile} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Save className="w-4 h-4"/> Save Profile
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-red-50 rounded-lg p-3 flex flex-col items-center justify-center border border-red-100">
              <span className="text-sm text-red-600 font-medium mb-1">Blood Group</span>
              <span className="text-2xl font-bold text-red-700">{profile?.bloodGroup || 'Unknown'}</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <span className="text-sm text-gray-500 font-medium mb-1 block">Privacy & Visibility</span>
              <span className="text-gray-900 font-medium flex items-center gap-2">
                {profile?.visibility === 'Only Me' ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-green-500" />}
                {profile?.visibility || 'Only Me'}
              </span>
            </div>
            {profile?.medicalConditions && (
              <div className="md:col-span-2 bg-gray-50 rounded-lg p-3 border border-gray-100 mt-2">
                <span className="text-sm text-gray-500 font-medium mb-1 block">Medical Conditions</span>
                <p className="text-gray-900 text-sm whitespace-pre-wrap">{profile.medicalConditions}</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 2. Emergency Contacts */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-green-500" />
            Emergency Contacts
          </h3>
          <button onClick={() => setNewContact({ priority: 'Primary' })} className="text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 flex items-center gap-1">
            <Plus className="w-4 h-4"/> Add
          </button>
        </div>

        {newContact && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4 space-y-3">
            <input type="text" placeholder="Name" value={newContact.name || ''} onChange={e => setNewContact({...newContact, name: e.target.value})} className="w-full p-2 border rounded" />
            <input type="text" placeholder="Relationship (e.g., Brother)" value={newContact.relationship || ''} onChange={e => setNewContact({...newContact, relationship: e.target.value})} className="w-full p-2 border rounded" />
            <input type="text" placeholder="Phone Number" value={newContact.phoneNumber || ''} onChange={e => setNewContact({...newContact, phoneNumber: e.target.value})} className="w-full p-2 border rounded" />
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => setNewContact(null)} className="px-3 py-1 text-gray-500 hover:bg-gray-100 rounded">Cancel</button>
              <button onClick={handleSaveContact} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">Save</button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {contacts.map(c => (
            <div key={c.id} className="flex justify-between items-center p-3 border border-gray-100 bg-gray-50 rounded-lg">
              <div>
                <p className="font-bold text-gray-900">{c.name} <span className="text-xs font-normal text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full ml-2">{c.relationship}</span></p>
                <p className="text-sm text-gray-600">{c.phoneNumber}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setNewContact(c)} className="text-blue-500 hover:bg-blue-50 p-1 rounded"><Edit2 className="w-4 h-4"/></button>
                <button onClick={() => handleDeleteContact(c.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 className="w-4 h-4"/></button>
              </div>
            </div>
          ))}
          {contacts.length === 0 && !newContact && <p className="text-sm text-gray-500 italic text-center py-4">No emergency contacts added yet.</p>}
        </div>
      </section>

      {/* 3. Medicines */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Pill className="w-5 h-5 text-purple-500" />
            Regular Medicines
          </h3>
          <button onClick={() => setNewMed({})} className="text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 flex items-center gap-1">
            <Plus className="w-4 h-4"/> Add
          </button>
        </div>

        {newMed && (
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 mb-4 space-y-3">
            <input type="text" placeholder="Medicine Name" value={newMed.name || ''} onChange={e => setNewMed({...newMed, name: e.target.value})} className="w-full p-2 border rounded" />
            <input type="text" placeholder="Dosage (e.g., 500mg)" value={newMed.dosage || ''} onChange={e => setNewMed({...newMed, dosage: e.target.value})} className="w-full p-2 border rounded" />
            <input type="text" placeholder="Frequency (e.g., Twice a day)" value={newMed.frequency || ''} onChange={e => setNewMed({...newMed, frequency: e.target.value})} className="w-full p-2 border rounded" />
            <textarea placeholder="Notes (Optional)" value={newMed.notes || ''} onChange={e => setNewMed({...newMed, notes: e.target.value})} className="w-full p-2 border rounded" rows={2} />
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => setNewMed(null)} className="px-3 py-1 text-gray-500 hover:bg-gray-100 rounded">Cancel</button>
              <button onClick={handleSaveMed} className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700">Save</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3">
          {medicines.map(m => (
            <div key={m.id} className="p-3 border border-gray-100 bg-white shadow-sm rounded-lg flex justify-between items-start">
              <div>
                <p className="font-bold text-gray-900">{m.name} <span className="text-sm font-normal text-gray-600 ml-1">{m.dosage}</span></p>
                <p className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full inline-block mt-1">{m.frequency}</p>
                {m.notes && <p className="text-sm text-gray-500 mt-2">{m.notes}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setNewMed(m)} className="text-blue-500 hover:bg-blue-50 p-1 rounded"><Edit2 className="w-4 h-4"/></button>
                <button onClick={() => handleDeleteMed(m.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 className="w-4 h-4"/></button>
              </div>
            </div>
          ))}
          {medicines.length === 0 && !newMed && <p className="text-sm text-gray-500 italic text-center py-4">No medicines added.</p>}
        </div>
      </section>

      {/* 4. Allergies */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-orange-500" />
            Allergies
          </h3>
          <button onClick={() => setNewAllergy({})} className="text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 flex items-center gap-1">
            <Plus className="w-4 h-4"/> Add
          </button>
        </div>

        {newAllergy && (
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 mb-4 space-y-3">
            <input type="text" placeholder="Allergy Name (e.g., Peanuts, Penicillin)" value={newAllergy.name || ''} onChange={e => setNewAllergy({...newAllergy, name: e.target.value})} className="w-full p-2 border rounded" />
            <textarea placeholder="Description / Reaction (Optional)" value={newAllergy.description || ''} onChange={e => setNewAllergy({...newAllergy, description: e.target.value})} className="w-full p-2 border rounded" rows={2} />
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => setNewAllergy(null)} className="px-3 py-1 text-gray-500 hover:bg-gray-100 rounded">Cancel</button>
              <button onClick={handleSaveAllergy} className="px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700">Save</button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {allergies.map(a => (
            <div key={a.id} className="p-3 border border-orange-200 bg-orange-50 rounded-lg flex gap-3 items-center w-full md:w-auto flex-1 min-w-[250px]">
              <div className="flex-1">
                <p className="font-bold text-orange-900">{a.name}</p>
                {a.description && <p className="text-xs text-orange-700 mt-1">{a.description}</p>}
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={() => setNewAllergy(a)} className="text-orange-600 hover:bg-orange-100 p-1 rounded"><Edit2 className="w-3 h-3"/></button>
                <button onClick={() => handleDeleteAllergy(a.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 className="w-3 h-3"/></button>
              </div>
            </div>
          ))}
          {allergies.length === 0 && !newAllergy && <p className="text-sm text-gray-500 italic text-center py-4 w-full">No allergies recorded.</p>}
        </div>
      </section>

    </div>
  );
}
