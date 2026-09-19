const fs = require('fs');
const content = fs.readFileSync('server/storage.ts', 'utf8');
const insertionPoint = "export const storage = new StorageService();";

const methods = `
  // --- Phase 1: Health & Emergency ---

  public async getHealthProfile(personId: string, userId: string): Promise<HealthProfile | null> {
    const d = await getDoc(doc(db, 'health_profiles', personId));
    if (!d.exists()) return null;
    return ({ id: d.id, ...d.data() } as HealthProfile);
  }

  public async updateHealthProfile(personId: string, userId: string, data: Partial<HealthProfile>): Promise<HealthProfile> {
    const ref = doc(db, 'health_profiles', personId);
    const d = await getDoc(ref);
    let updated: HealthProfile;
    if (d.exists()) {
      updated = { ...(d.data() as HealthProfile), ...data, updatedAt: new Date().toISOString() };
    } else {
      updated = {
        id: personId,
        personId,
        bloodGroup: 'Unknown / Not Specified',
        visibility: 'Only Me',
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as HealthProfile;
    }
    await setDoc(ref, removeUndefined(updated));
    return updated;
  }

  public async getMedicines(personId: string, userId: string): Promise<Medicine[]> {
    const q = query(collection(db, 'medicines'), where('personId', '==', personId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Medicine));
  }

  public async addMedicine(personId: string, userId: string, data: Omit<Medicine, 'id' | 'personId' | 'createdAt' | 'updatedAt'>): Promise<Medicine> {
    const id = 'med-' + crypto.randomUUID();
    const med: Medicine = {
      id, personId, ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'medicines', id), removeUndefined(med));
    return med;
  }
  
  public async updateMedicine(id: string, userId: string, data: Partial<Medicine>): Promise<Medicine | null> {
    const ref = doc(db, 'medicines', id);
    const d = await getDoc(ref);
    if (!d.exists()) return null;
    const updated = { ...(d.data() as Medicine), ...data, updatedAt: new Date().toISOString() };
    await setDoc(ref, removeUndefined(updated));
    return updated;
  }

  public async deleteMedicine(id: string, userId: string): Promise<boolean> {
    await deleteDoc(doc(db, 'medicines', id));
    return true;
  }

  public async getAllergies(personId: string, userId: string): Promise<Allergy[]> {
    const q = query(collection(db, 'allergies'), where('personId', '==', personId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Allergy));
  }

  public async addAllergy(personId: string, userId: string, data: Omit<Allergy, 'id' | 'personId' | 'createdAt' | 'updatedAt'>): Promise<Allergy> {
    const id = 'allergy-' + crypto.randomUUID();
    const allergy: Allergy = {
      id, personId, ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'allergies', id), removeUndefined(allergy));
    return allergy;
  }

  public async updateAllergy(id: string, userId: string, data: Partial<Allergy>): Promise<Allergy | null> {
    const ref = doc(db, 'allergies', id);
    const d = await getDoc(ref);
    if (!d.exists()) return null;
    const updated = { ...(d.data() as Allergy), ...data, updatedAt: new Date().toISOString() };
    await setDoc(ref, removeUndefined(updated));
    return updated;
  }

  public async deleteAllergy(id: string, userId: string): Promise<boolean> {
    await deleteDoc(doc(db, 'allergies', id));
    return true;
  }

  public async getEmergencyContacts(personId: string, userId: string): Promise<EmergencyContact[]> {
    const q = query(collection(db, 'emergency_contacts'), where('personId', '==', personId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as EmergencyContact));
  }

  public async addEmergencyContact(personId: string, userId: string, data: Omit<EmergencyContact, 'id' | 'personId' | 'createdAt' | 'updatedAt'>): Promise<EmergencyContact> {
    const id = 'emc-' + crypto.randomUUID();
    const contact: EmergencyContact = {
      id, personId, ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'emergency_contacts', id), removeUndefined(contact));
    return contact;
  }

  public async updateEmergencyContact(id: string, userId: string, data: Partial<EmergencyContact>): Promise<EmergencyContact | null> {
    const ref = doc(db, 'emergency_contacts', id);
    const d = await getDoc(ref);
    if (!d.exists()) return null;
    const updated = { ...(d.data() as EmergencyContact), ...data, updatedAt: new Date().toISOString() };
    await setDoc(ref, removeUndefined(updated));
    return updated;
  }

  public async deleteEmergencyContact(id: string, userId: string): Promise<boolean> {
    await deleteDoc(doc(db, 'emergency_contacts', id));
    return true;
  }
}
`;

const newContent = content.replace("}\nexport const storage = new StorageService();", methods + "\nexport const storage = new StorageService();");
fs.writeFileSync('server/storage.ts', newContent);
console.log('patched');
