import re

with open('server/storage.ts', 'r') as f:
    content = f.read()

target = """  public async getHealthProfile(personId: string, userId: string) {
    const d = await getDoc(doc(db, 'health_profiles', personId));
    if (!d.exists()) return null;
    return ({ id: d.id, ...d.data() as any });
  }"""

new_target = """  public async getHealthProfile(personId: string, userId: string) {
    const d = await getDoc(doc(db, 'health_profiles', personId));
    if (!d.exists()) {
      return { 
        id: personId, 
        personId: personId, 
        bloodGroup: '', 
        bloodGroupPrivacy: 'private',
        notes: '',
        userId: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
    return ({ id: d.id, ...d.data() as any });
  }"""

if target in content:
    content = content.replace(target, new_target)
    with open('server/storage.ts', 'w') as f:
        f.write(content)
    print("Patched getHealthProfile")
else:
    print("Could not find target in server/storage.ts")
