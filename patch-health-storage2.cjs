const fs = require('fs');
let content = fs.readFileSync('server/storage.ts', 'utf8');

const methods = `
  // --- Phase 1: Health & Emergency ---

  public async getHealthProfile(personId: string, userId: string) {
    const d = await getDoc(doc(db, 'health_profiles', personId));
    if (!d.exists()) return null;
    return ({ id: d.id, ...d.data() });
  }

  public async updateHealthProfile(personId: string, userId: string, data: any) {
    const ref = doc(db, 'health_profiles', personId);
    const d = await getDoc(ref);
    let updated;
    if (d.exists()) {
      updated = { ...d.data(), ...data, updatedAt: new Date().toISOString() };
    } else {
      updated = {
        id: personId,
        personId,
        bloodGroup: 'Unknown / Not Specified',
        visibility: 'Only Me',
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
    await setDoc(ref, removeUndefined(updated));
    return updated;
  }

  public async getMedicines(personId: string, userId: string) {
    const q = query(collection(db, 'medicines'), where('personId', '==', personId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  public async addMedicine(personId: string, userId: string, data: any) {
    const id = 'med-' + crypto.randomUUID();
    const med = {
      id, personId, ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'medicines', id), removeUndefined(med));
    return med;
  }
  
  public async updateMedicine(id: string, userId: string, data: any) {
    const ref = doc(db, 'medicines', id);
    const d = await getDoc(ref);
    if (!d.exists()) return null;
    const updated = { ...d.data(), ...data, updatedAt: new Date().toISOString() };
    await setDoc(ref, removeUndefined(updated));
    return updated;
  }

  public async deleteMedicine(id: string, userId: string) {
    await deleteDoc(doc(db, 'medicines', id));
    return true;
  }

  public async getAllergies(personId: string, userId: string) {
    const q = query(collection(db, 'allergies'), where('personId', '==', personId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  public async addAllergy(personId: string, userId: string, data: any) {
    const id = 'allergy-' + crypto.randomUUID();
    const allergy = {
      id, personId, ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'allergies', id), removeUndefined(allergy));
    return allergy;
  }

  public async updateAllergy(id: string, userId: string, data: any) {
    const ref = doc(db, 'allergies', id);
    const d = await getDoc(ref);
    if (!d.exists()) return null;
    const updated = { ...d.data(), ...data, updatedAt: new Date().toISOString() };
    await setDoc(ref, removeUndefined(updated));
    return updated;
  }

  public async deleteAllergy(id: string, userId: string) {
    await deleteDoc(doc(db, 'allergies', id));
    return true;
  }

  public async getEmergencyContacts(personId: string, userId: string) {
    const q = query(collection(db, 'emergency_contacts'), where('personId', '==', personId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  public async addEmergencyContact(personId: string, userId: string, data: any) {
    const id = 'emc-' + crypto.randomUUID();
    const contact = {
      id, personId, ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'emergency_contacts', id), removeUndefined(contact));
    return contact;
  }

  public async updateEmergencyContact(id: string, userId: string, data: any) {
    const ref = doc(db, 'emergency_contacts', id);
    const d = await getDoc(ref);
    if (!d.exists()) return null;
    const updated = { ...d.data(), ...data, updatedAt: new Date().toISOString() };
    await setDoc(ref, removeUndefined(updated));
    return updated;
  }

  public async deleteEmergencyContact(id: string, userId: string) {
    await deleteDoc(doc(db, 'emergency_contacts', id));
    return true;
  }
}
export const storage = new StorageService();
`;

content = content.replace("}\nexport const storage = new StorageService();", methods);
// If it failed to replace because of carriage returns or whitespace
if (!content.includes("getHealthProfile")) {
  content = content.replace(/}\s*export const storage = new StorageService\(\);\s*$/, methods);
}

fs.writeFileSync('server/storage.ts', content);
console.log('patched 2');
