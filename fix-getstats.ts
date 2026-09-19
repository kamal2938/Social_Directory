import * as fs from 'fs';

let storageContent = fs.readFileSync('server/storage.ts', 'utf8');

const newGetStats = `
  public async getStats() {
    if (!db) return { totalPeople: 0, archivedPeople: 0, favorites: 0, totalTags: 0, totalOrganizations: 0, allCircles: [], upcomingBirthdays: [], overdueFollowUps: [], recentContacts: [], recentInteractions: [], relationshipCounts: {}, recentActivity: [] } as any;
    
    const [pSnap, iSnap, tSnap] = await Promise.all([
      getDocs(collection(db, 'people')),
      getDocs(collection(db, 'interactions')),
      getDocs(collection(db, 'tags'))
    ]);
    
    const people = pSnap.docs.map(d => d.data() as Person);
    const interactions = iSnap.docs.map(d => d.data() as Interaction);
    
    const totalPeople = people.filter((p) => !p.isArchived).length;
    const archivedPeople = people.filter((p) => p.isArchived).length;
    const favorites = people.filter((p) => p.isFavorite && !p.isArchived).length;
    const totalTags = tSnap.size;

    const orgSet = new Set<string>();
    const circlesSet = new Set<string>();
    const now = new Date();

    const activePeople = people.filter((p) => !p.isArchived);

    activePeople.forEach((p) => {
      if (p.organization && p.organization.trim()) {
        orgSet.add(p.organization.trim());
      }
      if (Array.isArray(p.circles)) {
        p.circles.forEach((c) => {
          if (c && c.trim()) circlesSet.add(c.trim());
        });
      }
    });

    const recentContacts = [...activePeople]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);

    const recentInteractions = [...interactions]
      .sort((a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime())
      .slice(0, 6);

    // Distribution by relationship
    const relationshipCounts: Record<string, number> = {};
    activePeople.forEach((p) => {
      const type = p.relationshipType || 'Other';
      relationshipCounts[type] = (relationshipCounts[type] || 0) + 1;
    });

    // Upcoming Birthdays in the next 30 days
    const upcomingBirthdays = activePeople
      .filter((p) => {
        if (!p.dateOfBirth) return false;
        const bday = new Date(p.dateOfBirth);
        if (isNaN(bday.getTime())) return false;
        const currentYear = now.getFullYear();
        let nextBday = new Date(currentYear, bday.getMonth(), bday.getDate());
        if (nextBday < new Date(currentYear, now.getMonth(), now.getDate())) {
          nextBday = new Date(currentYear + 1, bday.getMonth(), bday.getDate());
        }
        const diffDays = Math.ceil((nextBday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 30;
      })
      .sort((a, b) => {
        const getDiff = (dob?: string) => {
          if (!dob) return 999;
          const d = new Date(dob);
          let nb = new Date(now.getFullYear(), d.getMonth(), d.getDate());
          if (nb < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
            nb = new Date(now.getFullYear() + 1, d.getMonth(), d.getDate());
          }
          return nb.getTime() - now.getTime();
        };
        return getDiff(a.dateOfBirth) - getDiff(b.dateOfBirth);
      });

    // Overdue Follow-ups (Stay in Touch)
    const overdueFollowUps = activePeople
      .filter((p) => {
        const cadence = p.followUpCadenceDays || (p.isFavorite ? 14 : 30);
        const lastTouch = p.lastInteractionAt ? new Date(p.lastInteractionAt) : new Date(p.createdAt);
        const daysSince = Math.floor((now.getTime() - lastTouch.getTime()) / (1000 * 60 * 60 * 24));
        return daysSince >= cadence;
      })
      .sort((a, b) => {
        const getOverdueDays = (p: Person) => {
          const cadence = p.followUpCadenceDays || (p.isFavorite ? 14 : 30);
          const lastTouch = p.lastInteractionAt ? new Date(p.lastInteractionAt) : new Date(p.createdAt);
          const daysSince = Math.floor((now.getTime() - lastTouch.getTime()) / (1000 * 60 * 60 * 24));
          return daysSince - cadence;
        };
        return getOverdueDays(b) - getOverdueDays(a);
      });

    const recentActivity = await this.getActivityLogs(8);

    return {
      totalPeople,
      archivedPeople,
      favorites,
      totalTags,
      totalOrganizations: orgSet.size,
      allCircles: Array.from(circlesSet).sort(),
      upcomingBirthdays: upcomingBirthdays.slice(0, 10),
      overdueFollowUps: overdueFollowUps.slice(0, 10),
      recentContacts,
      recentInteractions,
      relationshipCounts,
      recentActivity,
    };
  }
`;

storageContent = storageContent.replace(/public async getStats\(\) \{[\s\S]*?\} as any;\n  \}/, newGetStats.trim());

fs.writeFileSync('server/storage.ts', storageContent);
