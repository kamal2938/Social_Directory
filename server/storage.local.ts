import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  DirectoryDatabase,
  User,
  Person,
  Tag,
  Note,
  Interaction,
  ActivityLog,
} from './types.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'directory-db.json');

// Password hashing utilities using Node.js crypto
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, originalHash] = storedHash.split(':');
    if (!salt || !originalHash) return false;
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(originalHash));
  } catch {
    return false;
  }
}

// Initial default tags
const DEFAULT_TAGS: Tag[] = [
  { id: 'tag-1', name: 'ISP', color: '#0284c7', description: 'Internet Service Provider domain', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'tag-2', name: 'Networking', color: '#059669', description: 'Core routing and switching', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'tag-3', name: 'MikroTik', color: '#ea580c', description: 'RouterOS & MikroTik hardware', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'tag-4', name: 'Developer', color: '#7c3aed', description: 'Software and web engineers', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'tag-5', name: 'Friend', color: '#db2777', description: 'Personal close friends', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'tag-6', name: 'Client', color: '#ca8a04', description: 'Business customers & clients', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'tag-7', name: 'Business', color: '#4b5563', description: 'Business & commercial contacts', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'tag-8', name: 'Important', color: '#dc2626', description: 'High-priority VIP contacts', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'tag-9', name: 'Mentor', color: '#0891b2', description: 'Advisors and mentors', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'tag-10', name: 'FinTech', color: '#16a34a', description: 'Financial technology industry', createdAt: '2026-01-01T00:00:00.000Z' },
];

export function generateSeedData(): DirectoryDatabase {
  const adminUser: User = {
    id: 'user-admin-1',
    username: 'admin',
    email: 'mdsahakamal016@gmail.com',
    passwordHash: hashPassword('directory123'),
    fullName: 'Saha Kamal',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-20T06:00:00.000Z',
  };

  const seedPeople: Person[] = [
    {
      id: 'person-1',
      userId: adminUser.id,
      name: 'Rahim Ahmed',
      nickname: 'Rahim Bhai',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80',
      gender: 'Male',
      dateOfBirth: '1990-04-12',
      location: 'Dhaka, Bangladesh',
      bio: 'Senior Network Architect specializing in carrier-grade BGP routing, MPLS backbones, and MikroTik CCR deployments across metropolitan fiber networks.',
      occupation: 'Network Engineer',
      organization: 'ABC ISP Ltd.',
      department: 'Core Infrastructure',
      jobTitle: 'Lead Routing Engineer',
      skills: ['MikroTik', 'BGP', 'Cisco', 'OSPF', 'Fiber Optics', 'IXP Peering'],
      education: 'B.Sc in Computer Science & Engineering, BUET',
      email: 'rahim.ahmed@example.com',
      phone: '+880 1712-345678',
      website: 'https://rahimahmed.net',
      socialLinks: [
        { id: 'sl-1', platform: 'linkedin', url: 'https://linkedin.com/in/rahimahmed-net' },
        { id: 'sl-2', platform: 'github', url: 'https://github.com/rahim-networks' },
        { id: 'sl-3', platform: 'facebook', url: 'https://facebook.com/rahim.ahmed.isp' },
      ],
      relationshipType: 'Colleague',
      tags: ['ISP', 'Networking', 'MikroTik', 'Important'],
      circles: ['Core Engineering', 'BUET Alumni', 'ISP Leaders'],
      followUpCadenceDays: 14,
      customFields: {
        'Blood Group': 'O+',
        'Hobby': 'Network Hardware Modding & Coffee',
        'Referred By': 'Direct Colleague',
        'Preferred Channel': 'WhatsApp & In-person',
      },
      isFavorite: true,
      isArchived: false,
      createdAt: '2026-02-10T10:00:00.000Z',
      updatedAt: '2026-08-18T14:30:00.000Z',
      lastInteractionAt: '2026-08-18T14:30:00.000Z',
    },
    {
      id: 'person-2',
      userId: adminUser.id,
      name: 'Sarah Jenkins',
      nickname: 'Sarah',
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=250&auto=format&fit=crop&q=80',
      gender: 'Female',
      dateOfBirth: '1993-08-25',
      location: 'San Francisco, California',
      bio: 'Principal UX Consultant and design system architect. Creator of accessible enterprise design tokens and user flow optimization frameworks.',
      occupation: 'Senior UX Designer',
      organization: 'Aura Design Studio',
      department: 'Product Experience',
      jobTitle: 'Principal Design Lead',
      skills: ['Design Systems', 'Figma', 'User Research', 'Accessibility (WCAG)', 'Prototyping'],
      education: 'M.S. in Human-Computer Interaction, Stanford',
      email: 'sarah.jenkins@auradesign.io',
      phone: '+1 (415) 892-4412',
      website: 'https://sarahjenkins.design',
      socialLinks: [
        { id: 'sl-4', platform: 'linkedin', url: 'https://linkedin.com/in/sarahjenkins-ux' },
        { id: 'sl-5', platform: 'twitter', url: 'https://twitter.com/sarah_designs' },
        { id: 'sl-6', platform: 'website', url: 'https://sarahjenkins.design' },
      ],
      relationshipType: 'Client',
      tags: ['Client', 'Important', 'Developer'],
      circles: ['Design Advisors', 'VIP Clients'],
      followUpCadenceDays: 30,
      customFields: {
        'Blood Group': 'A+',
        'Timezone': 'PST (UTC-7)',
        'Favorite Beverage': 'Matcha Latte',
        'Current Project': 'Global Design Token Architecture',
      },
      isFavorite: true,
      isArchived: false,
      createdAt: '2026-03-01T11:00:00.000Z',
      updatedAt: '2026-08-10T16:00:00.000Z',
      lastInteractionAt: '2026-08-10T16:00:00.000Z',
    },
    {
      id: 'person-3',
      userId: adminUser.id,
      name: 'Dr. Tanvir Hossain',
      nickname: 'Tanvir Sir',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&auto=format&fit=crop&q=80',
      gender: 'Male',
      dateOfBirth: '1975-08-28',
      location: 'Dhaka, Bangladesh',
      bio: 'Academic researcher and veteran professor in digital telecommunications, optical network transport layers, and wireless spectrum policy.',
      occupation: 'Associate Professor',
      organization: 'University of Dhaka',
      department: 'Dept. of Electrical & Electronic Engineering',
      jobTitle: 'Associate Professor & Research Chair',
      skills: ['Wireless Comms', 'Signal Processing', 'Research', 'Optical Networks'],
      education: 'Ph.D. in Telecommunications, NUS Singapore',
      email: 'tanvir.hossain@du.ac.bd',
      phone: '+880 1819-998877',
      website: 'https://du.ac.bd/faculty/tanvir-hossain',
      socialLinks: [
        { id: 'sl-7', platform: 'linkedin', url: 'https://linkedin.com/in/drtanvirhossain' },
      ],
      relationshipType: 'Teacher',
      tags: ['Mentor', 'Important'],
      circles: ['Mentors & Advisors', 'Academic Council'],
      followUpCadenceDays: 21,
      customFields: {
        'Blood Group': 'B+',
        'Hobby': 'Vintage Radio Tech & Bengali Literature',
        'Academic Dept': 'EEE, Dhaka University',
        'Office Hours': 'Tuesday & Thursday 3 PM',
      },
      isFavorite: true,
      isArchived: false,
      createdAt: '2026-01-15T09:00:00.000Z',
      updatedAt: '2026-07-22T11:00:00.000Z',
      lastInteractionAt: '2026-07-22T11:00:00.000Z',
    },
    {
      id: 'person-4',
      userId: adminUser.id,
      name: 'Nusrat Jahan',
      nickname: 'Nusrat',
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=250&auto=format&fit=crop&q=80',
      gender: 'Female',
      dateOfBirth: '1992-09-02',
      location: 'Dhaka, Bangladesh',
      bio: 'Product strategist leading high-throughput digital wallet architecture and open banking payment integrations.',
      occupation: 'Product Manager',
      organization: 'FinTech Pulse',
      department: 'Digital Payments & Checkout',
      jobTitle: 'Senior Product Manager',
      skills: ['Product Strategy', 'Payment Gateways', 'Agile Scrum', 'Data Analysis', 'API Design'],
      education: 'BBA in Management Information Systems, IBA DU',
      email: 'nusrat.jahan@fintechpulse.com',
      phone: '+880 1911-223344',
      socialLinks: [
        { id: 'sl-8', platform: 'linkedin', url: 'https://linkedin.com/in/nusrat-jahan-pm' },
        { id: 'sl-9', platform: 'facebook', url: 'https://facebook.com/nusrat.pulse' },
      ],
      relationshipType: 'Professional Contact',
      tags: ['FinTech', 'Business', 'Important'],
      circles: ['FinTech Leaders', 'IBA Alumni'],
      followUpCadenceDays: 30,
      customFields: {
        'Blood Group': 'AB+',
        'Hobby': 'Public Speaking & Squash',
        'Specialty': 'Open Banking & QR Interoperability',
      },
      isFavorite: false,
      isArchived: false,
      createdAt: '2026-04-10T14:00:00.000Z',
      updatedAt: '2026-08-05T17:00:00.000Z',
      lastInteractionAt: '2026-08-05T17:00:00.000Z',
    },
    {
      id: 'person-5',
      userId: adminUser.id,
      name: 'Alex Rivera',
      nickname: 'Lex',
      photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=250&auto=format&fit=crop&q=80',
      gender: 'Male',
      dateOfBirth: '1994-01-30',
      location: 'Berlin, Germany',
      bio: 'Open-source software engineer, systems developer, and distributed databases enthusiast. Maintainer of several popular npm utility modules.',
      occupation: 'Full Stack Engineer',
      organization: 'CloudNova Technologies',
      department: 'Platform Core',
      jobTitle: 'Senior Software Engineer',
      skills: ['TypeScript', 'React', 'PostgreSQL', 'Go', 'Docker', 'GraphQL'],
      education: 'B.Sc in Computer Science, TU Munich',
      email: 'alex@riveracodes.dev',
      phone: '+49 152 9018234',
      website: 'https://riveracodes.dev',
      socialLinks: [
        { id: 'sl-10', platform: 'github', url: 'https://github.com/alexrivera-dev' },
        { id: 'sl-11', platform: 'twitter', url: 'https://twitter.com/lex_codes' },
      ],
      relationshipType: 'Friend',
      tags: ['Developer', 'Friend'],
      circles: ['Open Source Collaborators', 'Tech Founders'],
      followUpCadenceDays: 45,
      customFields: {
        'Blood Group': 'O-',
        'Timezone': 'CET (Berlin)',
        'Key OSS Projects': 'Fast-KV, TypeDrizzle-Gen',
      },
      isFavorite: false,
      isArchived: false,
      createdAt: '2026-05-12T08:30:00.000Z',
      updatedAt: '2026-08-15T19:20:00.000Z',
      lastInteractionAt: '2026-08-15T19:20:00.000Z',
    },
    {
      id: 'person-6',
      userId: adminUser.id,
      name: 'Tariqul Islam',
      nickname: 'Tariq',
      photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=250&auto=format&fit=crop&q=80',
      gender: 'Male',
      dateOfBirth: '1988-08-20',
      location: 'Chattogram, Bangladesh',
      bio: 'Operations Director with 12+ years in nationwide broadband backbone deployment, submarine cable landing stations, and enterprise NOC monitoring.',
      occupation: 'ISP Operations Director',
      organization: 'Bay Broadband Network',
      department: 'Network Operations',
      jobTitle: 'Head of Operations',
      skills: ['NOC Management', 'Submarine Cable', 'MikroTik', 'BGP', 'Disaster Recovery'],
      education: 'B.Sc in EEE, CUET',
      email: 'tariqul@baybroadband.com.bd',
      phone: '+880 1817-112233',
      socialLinks: [
        { id: 'sl-12', platform: 'linkedin', url: 'https://linkedin.com/in/tariqul-islam-noc' },
      ],
      relationshipType: 'Professional Contact',
      tags: ['ISP', 'Networking', 'MikroTik', 'Business'],
      circles: ['ISP Leaders', 'CUET Alumni'],
      followUpCadenceDays: 14,
      customFields: {
        'Blood Group': 'B+',
        'Specialty': 'SMW4 & SMW5 Submarine Landing Stations',
        'Emergency NOC Phone': '+880 1817-990011',
      },
      isFavorite: true,
      isArchived: false,
      createdAt: '2026-03-20T10:15:00.000Z',
      updatedAt: '2026-08-12T11:45:00.000Z',
      lastInteractionAt: '2026-08-12T11:45:00.000Z',
    },
    {
      id: 'person-7',
      userId: adminUser.id,
      name: 'Marcus Vance',
      nickname: 'Marc',
      photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=250&auto=format&fit=crop&q=80',
      gender: 'Male',
      dateOfBirth: '1985-03-14',
      location: 'Austin, Texas',
      bio: 'Independent infrastructure consultant advising startups on cloud migration, Kubernetes clusters, and automated Terraform CI/CD pipelines.',
      occupation: 'DevOps Consultant',
      organization: 'Vance Cloud Advisory',
      department: 'Consulting',
      jobTitle: 'Principal Cloud Architect',
      skills: ['Kubernetes', 'Terraform', 'AWS', 'CI/CD', 'Security Auditing'],
      education: 'B.S. in Software Engineering, UT Austin',
      email: 'marcus@vancecloud.com',
      phone: '+1 (512) 555-0199',
      socialLinks: [
        { id: 'sl-13', platform: 'linkedin', url: 'https://linkedin.com/in/marcusvance' },
        { id: 'sl-14', platform: 'github', url: 'https://github.com/mvance-cloud' },
      ],
      relationshipType: 'Colleague',
      tags: ['Developer', 'Business'],
      isFavorite: false,
      isArchived: true,
      createdAt: '2026-01-20T15:00:00.000Z',
      updatedAt: '2026-04-12T18:00:00.000Z',
      lastInteractionAt: '2026-04-12T18:00:00.000Z',
    },
  ];

  const seedNotes: Note[] = [
    {
      id: 'note-1',
      personId: 'person-1',
      personName: 'Rahim Ahmed',
      content: 'Interested in MikroTik CCR2004 series for the new 10G uplink aggregations. Highly knowledgeable in BGP path prepending and AS prepending tricks.',
      createdAt: '2026-08-18T14:35:00.000Z',
      updatedAt: '2026-08-18T14:35:00.000Z',
    },
    {
      id: 'note-2',
      personId: 'person-1',
      personName: 'Rahim Ahmed',
      content: 'Works with core ISP networking and IXP peering in Dhaka. Discussed routing project collaboration for upcoming National Data Center interconnection.',
      createdAt: '2026-08-10T11:20:00.000Z',
      updatedAt: '2026-08-10T11:20:00.000Z',
    },
    {
      id: 'note-3',
      personId: 'person-2',
      personName: 'Sarah Jenkins',
      content: 'Prefers communicating via async Figma comments and weekly summaries. Highly focused on WCAG AA compliance for color contrast and font scaling.',
      createdAt: '2026-08-10T16:05:00.000Z',
      updatedAt: '2026-08-10T16:05:00.000Z',
    },
    {
      id: 'note-4',
      personId: 'person-3',
      personName: 'Dr. Tanvir Hossain',
      content: 'Advised during final year graduation thesis. Always happy to offer insights on telecommunication policy and academic paper reviews.',
      createdAt: '2026-07-22T11:05:00.000Z',
      updatedAt: '2026-07-22T11:05:00.000Z',
    },
    {
      id: 'note-5',
      personId: 'person-6',
      personName: 'Tariqul Islam',
      content: 'Has direct contacts with submarine cable operators in Chattogram. Great resource for reliable nationwide IP transit quotes.',
      createdAt: '2026-08-12T11:50:00.000Z',
      updatedAt: '2026-08-12T11:50:00.000Z',
    },
  ];

  const seedInteractions: Interaction[] = [
    {
      id: 'inter-1',
      personId: 'person-1',
      personName: 'Rahim Ahmed',
      type: 'Meeting',
      date: '2026-08-18',
      description: 'Discussed ISP core network upgrade and BGP peering table expansion.',
      notes: 'Reviewed MikroTik CCR router configurations and agreed to review peering SLA next Tuesday.',
      createdAt: '2026-08-18T14:30:00.000Z',
    },
    {
      id: 'inter-2',
      personId: 'person-5',
      personName: 'Alex Rivera',
      type: 'Message',
      date: '2026-08-15',
      description: 'Discussed modern TypeScript 5.8 patterns and shared open source database utilities.',
      notes: 'Shared repository link and exchanged tips on caching layer design.',
      createdAt: '2026-08-15T19:20:00.000Z',
    },
    {
      id: 'inter-3',
      personId: 'person-6',
      personName: 'Tariqul Islam',
      type: 'Phone Call',
      date: '2026-08-12',
      description: 'Follow-up on fiber optic ring redundancy test results in Chattogram region.',
      notes: 'Test completed with 0% packet loss during simulated fiber cut switchover.',
      createdAt: '2026-08-12T11:45:00.000Z',
    },
    {
      id: 'inter-4',
      personId: 'person-2',
      personName: 'Sarah Jenkins',
      type: 'Online Meeting',
      date: '2026-08-10',
      description: 'Quarterly design system review and feedback session via Google Meet.',
      notes: 'Approved the new typography hierarchy and dark mode color palette.',
      createdAt: '2026-08-10T16:00:00.000Z',
    },
    {
      id: 'inter-5',
      personId: 'person-4',
      personName: 'Nusrat Jahan',
      type: 'Meeting',
      date: '2026-08-05',
      description: 'Coffee catch-up at Gulshan 2 to discuss digital banking API trends in South Asia.',
      notes: 'Discussed upcoming Bangladesh Bank interoperable QR code payment initiatives.',
      createdAt: '2026-08-05T17:00:00.000Z',
    },
    {
      id: 'inter-6',
      personId: 'person-3',
      personName: 'Dr. Tanvir Hossain',
      type: 'Phone Call',
      date: '2026-07-22',
      description: 'Wished on Eid festival and discussed recent academic paper on 5G wireless spectrum.',
      notes: 'Exchanged warm regards and agreed to meet during next university reunion.',
      createdAt: '2026-07-22T11:00:00.000Z',
    },
  ];

  const seedActivityLogs: ActivityLog[] = [
    {
      id: 'act-1',
      userId: adminUser.id,
      action: 'INTERACTION_ADDED',
      entityType: 'interaction',
      entityId: 'inter-1',
      entityName: 'Rahim Ahmed',
      details: 'Logged a Meeting interaction regarding ISP core routing',
      timestamp: '2026-08-18T14:30:00.000Z',
    },
    {
      id: 'act-2',
      userId: adminUser.id,
      action: 'NOTE_ADDED',
      entityType: 'note',
      entityId: 'note-1',
      entityName: 'Rahim Ahmed',
      details: 'Added note about MikroTik CCR2004 routers',
      timestamp: '2026-08-18T14:35:00.000Z',
    },
    {
      id: 'act-3',
      userId: adminUser.id,
      action: 'INTERACTION_ADDED',
      entityType: 'interaction',
      entityId: 'inter-2',
      entityName: 'Alex Rivera',
      details: 'Logged a Message interaction regarding TypeScript updates',
      timestamp: '2026-08-15T19:20:00.000Z',
    },
    {
      id: 'act-4',
      userId: adminUser.id,
      action: 'PERSON_ADDED',
      entityType: 'person',
      entityId: 'person-6',
      entityName: 'Tariqul Islam',
      details: 'Added new contact Tariqul Islam (Bay Broadband Network)',
      timestamp: '2026-08-12T11:40:00.000Z',
    },
    {
      id: 'act-5',
      userId: adminUser.id,
      action: 'FAVORITE_TOGGLED',
      entityType: 'person',
      entityId: 'person-1',
      entityName: 'Rahim Ahmed',
      details: 'Marked Rahim Ahmed as Favorite',
      timestamp: '2026-08-10T10:00:00.000Z',
    },
  ];

  return {
    users: [adminUser],
    people: seedPeople,
    tags: DEFAULT_TAGS,
    notes: seedNotes,
    interactions: seedInteractions,
    activityLogs: seedActivityLogs,
  };
}

export class StorageService {
  private db: DirectoryDatabase;

  constructor() {
    this.ensureDataDir();
    this.db = this.loadDatabase();
  }

  private ensureDataDir(): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadDatabase(): DirectoryDatabase {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.users && parsed.people && parsed.tags) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Error reading database file, initializing seed data:', err);
    }

    const seed = generateSeedData();
    this.saveDatabase(seed);
    return seed;
  }

  private saveDatabase(data?: DirectoryDatabase): void {
    try {
      this.ensureDataDir();
      const payload = data || this.db;
      fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing to database file:', err);
    }
  }

  // --- Reset to seed ---
  public resetToSeed(): DirectoryDatabase {
    const seed = generateSeedData();
    this.db = seed;
    this.saveDatabase();
    this.logActivity('user-admin-1', 'DATABASE_RESET', 'system', undefined, 'System Database', 'Reset database to default seed records');
    return this.db;
  }

  // --- Activity Logging ---
  public logActivity(
    userId: string,
    action: ActivityLog['action'],
    entityType: ActivityLog['entityType'],
    entityId?: string,
    entityName?: string,
    details?: string
  ): ActivityLog {
    const log: ActivityLog = {
      id: 'act-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      userId,
      action,
      entityType,
      entityId,
      entityName,
      details,
      timestamp: new Date().toISOString(),
    };
    this.db.activityLogs.unshift(log);
    // Keep max 500 logs
    if (this.db.activityLogs.length > 500) {
      this.db.activityLogs = this.db.activityLogs.slice(0, 500);
    }
    this.saveDatabase();
    return log;
  }

  public getActivityLogs(limit = 50): ActivityLog[] {
    return this.db.activityLogs.slice(0, limit);
  }

  // --- Auth & Users ---
  public getUsers(): User[] {
    return this.db.users;
  }

  public getPrimaryUser(): User | undefined {
    return this.db.users[0];
  }

  public findUserByUsername(username: string): User | undefined {
    return this.db.users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === username.toLowerCase()
    );
  }

  public findUserById(id: string): User | undefined {
    return this.db.users.find((u) => u.id === id);
  }

  public createUser(username: string, email: string, passwordPlain: string, fullName: string): User {
    const newUser: User = {
      id: 'user-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      username: username.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: hashPassword(passwordPlain),
      fullName: fullName.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.db.users.push(newUser);
    this.saveDatabase();
    this.logActivity(newUser.id, 'PROFILE_UPDATED', 'user', newUser.id, newUser.fullName, 'User registered new account');
    return newUser;
  }

  public updateUserProfile(userId: string, updates: { fullName?: string; email?: string; avatar?: string }): User | null {
    const user = this.findUserById(userId);
    if (!user) return null;
    if (updates.fullName) user.fullName = updates.fullName.trim();
    if (updates.email) user.email = updates.email.trim().toLowerCase();
    if (updates.avatar !== undefined) user.avatar = updates.avatar;
    user.updatedAt = new Date().toISOString();
    this.saveDatabase();
    this.logActivity(userId, 'PROFILE_UPDATED', 'user', userId, user.fullName, 'Updated personal profile details');
    return user;
  }

  public updateUserPassword(userId: string, oldPasswordPlain: string, newPasswordPlain: string): boolean {
    const user = this.findUserById(userId);
    if (!user) return false;
    if (!verifyPassword(oldPasswordPlain, user.passwordHash)) {
      return false;
    }
    user.passwordHash = hashPassword(newPasswordPlain);
    user.updatedAt = new Date().toISOString();
    this.saveDatabase();
    this.logActivity(userId, 'PASSWORD_CHANGED', 'user', userId, user.fullName, 'Changed account login password');
    return true;
  }

  // --- Stats ---
  public getStats() {
    const totalPeople = this.db.people.filter((p) => !p.isArchived).length;
    const archivedPeople = this.db.people.filter((p) => p.isArchived).length;
    const favorites = this.db.people.filter((p) => p.isFavorite && !p.isArchived).length;
    const totalTags = this.db.tags.length;

    const orgSet = new Set<string>();
    const circlesSet = new Set<string>();
    const now = new Date();

    const activePeople = this.db.people.filter((p) => !p.isArchived);

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

    const recentInteractions = [...this.db.interactions]
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
      recentActivity: this.getActivityLogs(8),
    };
  }

  // --- People Management ---
  public getPeople(params: {
    query?: string;
    tag?: string;
    circle?: string;
    relationship?: string;
    organization?: string;
    location?: string;
    favoriteOnly?: boolean;
    archivedOnly?: boolean;
    needsFollowUp?: boolean;
    upcomingBirthday?: boolean;
    sortBy?: 'name' | 'recent' | 'lastInteraction' | 'updated' | 'health';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    let list = [...this.db.people];
    const now = new Date();

    // Filter archive state
    if (params.archivedOnly) {
      list = list.filter((p) => p.isArchived);
    } else {
      list = list.filter((p) => !p.isArchived);
    }

    // Filter favorite
    if (params.favoriteOnly) {
      list = list.filter((p) => p.isFavorite);
    }

    // Filter relationship
    if (params.relationship && params.relationship !== 'all') {
      list = list.filter((p) => p.relationshipType.toLowerCase() === params.relationship?.toLowerCase());
    }

    // Filter circle
    if (params.circle && params.circle !== 'all') {
      list = list.filter((p) => Array.isArray(p.circles) && p.circles.some((c) => c.toLowerCase() === params.circle?.toLowerCase()));
    }

    // Filter organization
    if (params.organization && params.organization !== 'all') {
      list = list.filter((p) => (p.organization || '').toLowerCase().includes(params.organization!.toLowerCase()));
    }

    // Filter location
    if (params.location && params.location !== 'all') {
      list = list.filter((p) => (p.location || '').toLowerCase().includes(params.location!.toLowerCase()));
    }

    // Filter tag
    if (params.tag && params.tag !== 'all') {
      list = list.filter((p) => p.tags.some((t) => t.toLowerCase() === params.tag?.toLowerCase()));
    }

    // Filter needs follow-up
    if (params.needsFollowUp) {
      list = list.filter((p) => {
        const cadence = p.followUpCadenceDays || (p.isFavorite ? 14 : 30);
        const lastTouch = p.lastInteractionAt ? new Date(p.lastInteractionAt) : new Date(p.createdAt);
        const daysSince = Math.floor((now.getTime() - lastTouch.getTime()) / (1000 * 60 * 60 * 24));
        return daysSince >= cadence;
      });
    }

    // Filter upcoming birthday
    if (params.upcomingBirthday) {
      list = list.filter((p) => {
        if (!p.dateOfBirth) return false;
        const bday = new Date(p.dateOfBirth);
        if (isNaN(bday.getTime())) return false;
        let nextBday = new Date(now.getFullYear(), bday.getMonth(), bday.getDate());
        if (nextBday < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
          nextBday = new Date(now.getFullYear() + 1, bday.getMonth(), bday.getDate());
        }
        const diffDays = Math.ceil((nextBday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 30;
      });
    }

    // Full text search query
    if (params.query && params.query.trim()) {
      const q = params.query.trim().toLowerCase();
      // Also match in notes of the person
      const personIdsWithMatchingNotes = new Set(
        this.db.notes
          .filter((n) => n.content.toLowerCase().includes(q))
          .map((n) => n.personId)
      );

      list = list.filter((p) => {
        const nameMatch = p.name.toLowerCase().includes(q);
        const nickMatch = (p.nickname || '').toLowerCase().includes(q);
        const occMatch = (p.occupation || '').toLowerCase().includes(q);
        const orgMatch = (p.organization || '').toLowerCase().includes(q);
        const locMatch = (p.location || '').toLowerCase().includes(q);
        const emailMatch = (p.email || '').toLowerCase().includes(q);
        const phoneMatch = (p.phone || '').toLowerCase().includes(q);
        const bioMatch = (p.bio || '').toLowerCase().includes(q);
        const relMatch = (p.relationshipType || '').toLowerCase().includes(q);
        const skillMatch = p.skills.some((s) => s.toLowerCase().includes(q));
        const tagMatch = p.tags.some((t) => t.toLowerCase().includes(q));
        const circleMatch = Array.isArray(p.circles) && p.circles.some((c) => c.toLowerCase().includes(q));
        const customMatch = p.customFields && Object.entries(p.customFields).some(([k, v]) => k.toLowerCase().includes(q) || v.toLowerCase().includes(q));
        const noteMatch = personIdsWithMatchingNotes.has(p.id);

        return (
          nameMatch ||
          nickMatch ||
          occMatch ||
          orgMatch ||
          locMatch ||
          emailMatch ||
          phoneMatch ||
          bioMatch ||
          relMatch ||
          skillMatch ||
          tagMatch ||
          circleMatch ||
          customMatch ||
          noteMatch
        );
      });
    }

    // Sorting
    const sortBy = params.sortBy || 'name';
    const sortOrder = params.sortOrder || 'asc';
    const multiplier = sortOrder === 'desc' ? -1 : 1;

    list.sort((a, b) => {
      if (sortBy === 'name') {
        return multiplier * a.name.localeCompare(b.name);
      } else if (sortBy === 'recent') {
        return multiplier * (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else if (sortBy === 'updated') {
        return multiplier * (new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      } else if (sortBy === 'lastInteraction') {
        const timeA = a.lastInteractionAt ? new Date(a.lastInteractionAt).getTime() : 0;
        const timeB = b.lastInteractionAt ? new Date(b.lastInteractionAt).getTime() : 0;
        return multiplier * (timeB - timeA);
      } else if (sortBy === 'health') {
        const getOverdueScore = (p: Person) => {
          const cadence = p.followUpCadenceDays || (p.isFavorite ? 14 : 30);
          const lastTouch = p.lastInteractionAt ? new Date(p.lastInteractionAt) : new Date(p.createdAt);
          const daysSince = Math.floor((now.getTime() - lastTouch.getTime()) / (1000 * 60 * 60 * 24));
          return daysSince - cadence;
        };
        return multiplier * (getOverdueScore(b) - getOverdueScore(a));
      }
      return 0;
    });

    const total = list.length;
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 20));
    const startIndex = (page - 1) * limit;
    const paginatedItems = list.slice(startIndex, startIndex + limit);

    return {
      items: paginatedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  public getPersonById(id: string): {
    person: Person;
    notes: Note[];
    interactions: Interaction[];
    timeline: { id: string; type: string; title: string; description: string; date: string }[];
  } | null {
    const person = this.db.people.find((p) => p.id === id);
    if (!person) return null;

    const notes = this.db.notes
      .filter((n) => n.personId === id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const interactions = this.db.interactions
      .filter((i) => i.personId === id)
      .sort((a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime());

    // Generate aggregated timeline
    const timeline: { id: string; type: string; title: string; description: string; date: string }[] = [];

    // 1. Person added
    timeline.push({
      id: 'tl-created-' + person.id,
      type: 'CREATED',
      title: 'Contact Profile Created',
      description: `Added ${person.name} as a ${person.relationshipType}`,
      date: person.createdAt,
    });

    // 2. Profile updated if different
    if (person.updatedAt && person.updatedAt !== person.createdAt) {
      timeline.push({
        id: 'tl-updated-' + person.id,
        type: 'UPDATED',
        title: 'Profile Updated',
        description: 'Details and professional information updated',
        date: person.updatedAt,
      });
    }

    // 3. Notes
    notes.forEach((note) => {
      timeline.push({
        id: 'tl-note-' + note.id,
        type: 'NOTE',
        title: 'Note Added',
        description: note.content.length > 100 ? note.content.substring(0, 100) + '...' : note.content,
        date: note.createdAt,
      });
    });

    // 4. Interactions
    interactions.forEach((inter) => {
      timeline.push({
        id: 'tl-inter-' + inter.id,
        type: 'INTERACTION',
        title: `${inter.type} Logged`,
        description: inter.description,
        date: inter.date || inter.createdAt,
      });
    });

    // Sort timeline descending
    timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      person,
      notes,
      interactions,
      timeline,
    };
  }

  public createPerson(userId: string, data: Partial<Person>): Person {
    const now = new Date().toISOString();
    const newPerson: Person = {
      id: 'person-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      userId,
      name: (data.name || 'Untitled Contact').trim(),
      nickname: data.nickname?.trim(),
      photo: data.photo,
      gender: data.gender,
      dateOfBirth: data.dateOfBirth,
      location: data.location?.trim(),
      bio: data.bio?.trim(),
      occupation: data.occupation?.trim(),
      organization: data.organization?.trim(),
      department: data.department?.trim(),
      jobTitle: data.jobTitle?.trim(),
      skills: Array.isArray(data.skills) ? data.skills.map((s) => s.trim()).filter(Boolean) : [],
      education: data.education?.trim(),
      email: data.email?.trim(),
      phone: data.phone?.trim(),
      website: data.website?.trim(),
      socialLinks: Array.isArray(data.socialLinks) ? data.socialLinks : [],
      relationshipType: data.relationshipType || 'Professional Contact',
      tags: Array.isArray(data.tags) ? data.tags.map((t) => t.trim()).filter(Boolean) : [],
      circles: Array.isArray(data.circles) ? data.circles.map((c) => c.trim()).filter(Boolean) : [],
      followUpCadenceDays: typeof data.followUpCadenceDays === 'number' ? data.followUpCadenceDays : (data.followUpCadenceDays ? parseInt(String(data.followUpCadenceDays)) : undefined),
      customFields: data.customFields && typeof data.customFields === 'object' ? data.customFields : {},
      isFavorite: !!data.isFavorite,
      isArchived: !!data.isArchived,
      createdAt: now,
      updatedAt: now,
    };

    // Ensure new tags are recorded in DB
    this.ensureTagsExist(newPerson.tags);

    this.db.people.unshift(newPerson);
    this.saveDatabase();
    this.logActivity(userId, 'PERSON_ADDED', 'person', newPerson.id, newPerson.name, `Added ${newPerson.name} (${newPerson.relationshipType})`);
    return newPerson;
  }

  public updatePerson(userId: string, id: string, data: Partial<Person>): Person | null {
    const person = this.db.people.find((p) => p.id === id);
    if (!person) return null;

    if (data.name !== undefined) person.name = data.name.trim();
    if (data.nickname !== undefined) person.nickname = data.nickname?.trim();
    if (data.photo !== undefined) person.photo = data.photo;
    if (data.gender !== undefined) person.gender = data.gender;
    if (data.dateOfBirth !== undefined) person.dateOfBirth = data.dateOfBirth;
    if (data.location !== undefined) person.location = data.location?.trim();
    if (data.bio !== undefined) person.bio = data.bio?.trim();
    if (data.occupation !== undefined) person.occupation = data.occupation?.trim();
    if (data.organization !== undefined) person.organization = data.organization?.trim();
    if (data.department !== undefined) person.department = data.department?.trim();
    if (data.jobTitle !== undefined) person.jobTitle = data.jobTitle?.trim();
    if (data.skills !== undefined) {
      person.skills = Array.isArray(data.skills) ? data.skills.map((s) => s.trim()).filter(Boolean) : [];
    }
    if (data.education !== undefined) person.education = data.education?.trim();
    if (data.email !== undefined) person.email = data.email?.trim();
    if (data.phone !== undefined) person.phone = data.phone?.trim();
    if (data.website !== undefined) person.website = data.website?.trim();
    if (data.socialLinks !== undefined) person.socialLinks = data.socialLinks;
    if (data.relationshipType !== undefined) person.relationshipType = data.relationshipType;
    if (data.tags !== undefined) {
      person.tags = Array.isArray(data.tags) ? data.tags.map((t) => t.trim()).filter(Boolean) : [];
      this.ensureTagsExist(person.tags);
    }
    if (data.circles !== undefined) {
      person.circles = Array.isArray(data.circles) ? data.circles.map((c) => c.trim()).filter(Boolean) : [];
    }
    if (data.followUpCadenceDays !== undefined) {
      person.followUpCadenceDays = typeof data.followUpCadenceDays === 'number' ? data.followUpCadenceDays : (data.followUpCadenceDays ? parseInt(String(data.followUpCadenceDays)) : undefined);
    }
    if (data.customFields !== undefined) {
      person.customFields = data.customFields && typeof data.customFields === 'object' ? data.customFields : {};
    }
    if (data.isFavorite !== undefined) person.isFavorite = data.isFavorite;
    if (data.isArchived !== undefined) person.isArchived = data.isArchived;

    person.updatedAt = new Date().toISOString();

    // Also update denormalized personName in notes & interactions if name changed
    this.db.notes.forEach((n) => {
      if (n.personId === id) n.personName = person.name;
    });
    this.db.interactions.forEach((i) => {
      if (i.personId === id) i.personName = person.name;
    });

    this.saveDatabase();
    this.logActivity(userId, 'PERSON_UPDATED', 'person', person.id, person.name, `Updated profile details for ${person.name}`);
    return person;
  }

  public toggleFavorite(userId: string, id: string): boolean | null {
    const person = this.db.people.find((p) => p.id === id);
    if (!person) return null;
    person.isFavorite = !person.isFavorite;
    person.updatedAt = new Date().toISOString();
    this.saveDatabase();
    this.logActivity(
      userId,
      'FAVORITE_TOGGLED',
      'person',
      person.id,
      person.name,
      person.isFavorite ? `Marked ${person.name} as Favorite` : `Removed ${person.name} from Favorites`
    );
    return person.isFavorite;
  }

  public toggleArchive(userId: string, id: string): boolean | null {
    const person = this.db.people.find((p) => p.id === id);
    if (!person) return null;
    person.isArchived = !person.isArchived;
    person.updatedAt = new Date().toISOString();
    this.saveDatabase();
    this.logActivity(
      userId,
      person.isArchived ? 'PERSON_ARCHIVED' : 'PERSON_RESTORED',
      'person',
      person.id,
      person.name,
      person.isArchived ? `Archived contact ${person.name}` : `Restored ${person.name} to active directory`
    );
    return person.isArchived;
  }

  public deletePerson(userId: string, id: string): boolean {
    const index = this.db.people.findIndex((p) => p.id === id);
    if (index === -1) return false;
    const personName = this.db.people[index].name;

    // Delete person, notes, interactions
    this.db.people.splice(index, 1);
    this.db.notes = this.db.notes.filter((n) => n.personId !== id);
    this.db.interactions = this.db.interactions.filter((i) => i.personId !== id);

    this.saveDatabase();
    this.logActivity(userId, 'PERSON_DELETED', 'person', id, personName, `Deleted contact ${personName} and related history`);
    return true;
  }

  // --- Tags System ---
  public getTags(): (Tag & { count: number })[] {
    return this.db.tags.map((tag) => {
      const count = this.db.people.filter(
        (p) => !p.isArchived && p.tags.some((t) => t.toLowerCase() === tag.name.toLowerCase())
      ).length;
      return { ...tag, count };
    });
  }

  public createTag(name: string, color?: string, description?: string): Tag {
    const trimmed = name.trim();
    const existing = this.db.tags.find((t) => t.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) return existing;

    const colors = ['#0284c7', '#059669', '#ea580c', '#7c3aed', '#db2777', '#ca8a04', '#0891b2', '#16a34a'];
    const assignedColor = color || colors[this.db.tags.length % colors.length];

    const newTag: Tag = {
      id: 'tag-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      name: trimmed,
      color: assignedColor,
      description: description?.trim(),
      createdAt: new Date().toISOString(),
    };
    this.db.tags.push(newTag);
    this.saveDatabase();
    this.logActivity('user-admin-1', 'TAG_CREATED', 'tag', newTag.id, newTag.name, `Created tag "${newTag.name}"`);
    return newTag;
  }

  public updateTag(id: string, name: string, color?: string, description?: string): Tag | null {
    const tag = this.db.tags.find((t) => t.id === id);
    if (!tag) return null;
    const oldName = tag.name;
    const trimmed = name.trim();
    tag.name = trimmed;
    if (color) tag.color = color;
    if (description !== undefined) tag.description = description.trim();

    // Update tags in people if name changed
    if (oldName.toLowerCase() !== trimmed.toLowerCase()) {
      this.db.people.forEach((p) => {
        p.tags = p.tags.map((t) => (t.toLowerCase() === oldName.toLowerCase() ? trimmed : t));
      });
    }

    this.saveDatabase();
    this.logActivity('user-admin-1', 'TAG_UPDATED', 'tag', tag.id, tag.name, `Updated tag "${tag.name}"`);
    return tag;
  }

  public deleteTag(id: string): boolean {
    const index = this.db.tags.findIndex((t) => t.id === id);
    if (index === -1) return false;
    const tagName = this.db.tags[index].name;

    this.db.tags.splice(index, 1);
    // Remove tag from people
    this.db.people.forEach((p) => {
      p.tags = p.tags.filter((t) => t.toLowerCase() !== tagName.toLowerCase());
    });

    this.saveDatabase();
    this.logActivity('user-admin-1', 'TAG_DELETED', 'tag', id, tagName, `Deleted tag "${tagName}"`);
    return true;
  }

  private ensureTagsExist(tagNames: string[]) {
    tagNames.forEach((name) => {
      if (name && !this.db.tags.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
        this.createTag(name);
      }
    });
  }

  // --- Notes System ---
  public getNotes(query?: string, limit = 50): Note[] {
    let list = [...this.db.notes];
    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((n) => n.content.toLowerCase().includes(q) || n.personName.toLowerCase().includes(q));
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit);
  }

  public addNote(userId: string, personId: string, content: string): Note | null {
    const person = this.db.people.find((p) => p.id === personId);
    if (!person) return null;

    const now = new Date().toISOString();
    const newNote: Note = {
      id: 'note-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      personId,
      personName: person.name,
      content: content.trim(),
      createdAt: now,
      updatedAt: now,
    };

    this.db.notes.unshift(newNote);
    person.updatedAt = now;
    this.saveDatabase();
    this.logActivity(userId, 'NOTE_ADDED', 'note', newNote.id, person.name, `Added personal note for ${person.name}`);
    return newNote;
  }

  public updateNote(userId: string, noteId: string, content: string): Note | null {
    const note = this.db.notes.find((n) => n.id === noteId);
    if (!note) return null;

    note.content = content.trim();
    note.updatedAt = new Date().toISOString();
    this.saveDatabase();
    return note;
  }

  public deleteNote(userId: string, noteId: string): boolean {
    const index = this.db.notes.findIndex((n) => n.id === noteId);
    if (index === -1) return false;
    const personName = this.db.notes[index].personName;

    this.db.notes.splice(index, 1);
    this.saveDatabase();
    this.logActivity(userId, 'NOTE_DELETED', 'note', noteId, personName, `Deleted note for ${personName}`);
    return true;
  }

  // --- Interactions System ---
  public getInteractions(query?: string, limit = 50): Interaction[] {
    let list = [...this.db.interactions];
    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (i) =>
          i.description.toLowerCase().includes(q) ||
          i.personName.toLowerCase().includes(q) ||
          (i.notes || '').toLowerCase().includes(q) ||
          i.type.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime()).slice(0, limit);
  }

  public addInteraction(
    userId: string,
    personId: string,
    type: Interaction['type'],
    date: string,
    description: string,
    notes?: string
  ): Interaction | null {
    const person = this.db.people.find((p) => p.id === personId);
    if (!person) return null;

    const now = new Date().toISOString();
    const newInter: Interaction = {
      id: 'inter-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      personId,
      personName: person.name,
      type: type || 'Meeting',
      date: date || now.split('T')[0],
      description: description.trim(),
      notes: notes?.trim(),
      createdAt: now,
    };

    this.db.interactions.unshift(newInter);
    person.lastInteractionAt = newInter.date;
    person.updatedAt = now;
    this.saveDatabase();
    this.logActivity(
      userId,
      'INTERACTION_ADDED',
      'interaction',
      newInter.id,
      person.name,
      `Logged a ${newInter.type} interaction with ${person.name}`
    );
    return newInter;
  }

  public deleteInteraction(userId: string, interactionId: string): boolean {
    const index = this.db.interactions.findIndex((i) => i.id === interactionId);
    if (index === -1) return false;
    const personId = this.db.interactions[index].personId;
    const personName = this.db.interactions[index].personName;

    this.db.interactions.splice(index, 1);

    // Update lastInteractionAt
    const person = this.db.people.find((p) => p.id === personId);
    if (person) {
      const remaining = this.db.interactions.filter((i) => i.personId === personId);
      if (remaining.length > 0) {
        remaining.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        person.lastInteractionAt = remaining[0].date;
      } else {
        person.lastInteractionAt = undefined;
      }
    }

    this.saveDatabase();
    this.logActivity(userId, 'INTERACTION_DELETED', 'interaction', interactionId, personName, `Deleted interaction with ${personName}`);
    return true;
  }

  // --- Export / Import ---
  public exportFullJson(): DirectoryDatabase {
    // Return copy without password hashes
    const sanitized = JSON.parse(JSON.stringify(this.db)) as DirectoryDatabase;
    sanitized.users = sanitized.users.map((u) => ({
      ...u,
      passwordHash: '***PROTECTED***',
    }));
    return sanitized;
  }

  public exportPeopleCsv(): string {
    const headers = [
      'Name',
      'Nickname',
      'Relationship',
      'Occupation',
      'Organization',
      'Department',
      'Job Title',
      'Location',
      'Email',
      'Phone',
      'Website',
      'Skills',
      'Tags',
      'Favorite',
      'Archived',
      'Bio',
      'Created At',
      'Last Interaction',
    ];

    const escapeCsv = (val: string | undefined | boolean | string[]): string => {
      if (val === undefined || val === null) return '""';
      let str = '';
      if (Array.isArray(val)) {
        str = val.join('; ');
      } else {
        str = String(val);
      }
      return `"${str.replace(/"/g, '""')}"`;
    };

    const rows = this.db.people.map((p) => [
      escapeCsv(p.name),
      escapeCsv(p.nickname),
      escapeCsv(p.relationshipType),
      escapeCsv(p.occupation),
      escapeCsv(p.organization),
      escapeCsv(p.department),
      escapeCsv(p.jobTitle),
      escapeCsv(p.location),
      escapeCsv(p.email),
      escapeCsv(p.phone),
      escapeCsv(p.website),
      escapeCsv(p.skills),
      escapeCsv(p.tags),
      escapeCsv(p.isFavorite),
      escapeCsv(p.isArchived),
      escapeCsv(p.bio),
      escapeCsv(p.createdAt),
      escapeCsv(p.lastInteractionAt),
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  public importJson(userId: string, importedData: Partial<DirectoryDatabase>): {
    importedCount: number;
    importedPeople: number;
    importedNotes: number;
    importedInteractions: number;
    importedTags: number;
  } {
    let count = 0;
    if (Array.isArray(importedData.people)) {
      importedData.people.forEach((p) => {
        if (p.name) {
          this.createPerson(userId, p);
          count++;
        }
      });
    }

    let tagCount = 0;
    if (Array.isArray(importedData.tags)) {
      importedData.tags.forEach((t) => {
        if (t.name) {
          this.createTag(t.name, t.color, t.description);
          tagCount++;
        }
      });
    }

    let noteCount = 0;
    if (Array.isArray(importedData.notes)) {
      importedData.notes.forEach((n) => {
        if (n.personId && n.content) {
          this.addNote(userId, n.personId, n.content);
          noteCount++;
        }
      });
    }

    let interCount = 0;
    if (Array.isArray(importedData.interactions)) {
      importedData.interactions.forEach((i) => {
        if (i.personId && i.description) {
          this.addInteraction(userId, i.personId, i.type, i.date, i.description, i.notes);
          interCount++;
        }
      });
    }

    this.logActivity(userId, 'IMPORT_COMPLETED', 'system', undefined, 'JSON Data Import', `Imported ${count} contacts from backup`);
    return {
      importedCount: count,
      importedPeople: count,
      importedNotes: noteCount,
      importedInteractions: interCount,
      importedTags: tagCount,
    };
  }

  public importCsv(userId: string, csvText: string): {
    importedCount: number;
    created: number;
    updated: number;
    errors: string[];
  } {
    const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length <= 1) return { importedCount: 0, created: 0, updated: 0, errors: [] };

    const parseCsvRow = (row: string): string[] => {
      const result: string[] = [];
      let current = '';
      let insideQuotes = false;
      for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"' && (i === 0 || row[i - 1] !== '\\')) {
          if (insideQuotes && row[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            insideQuotes = !insideQuotes;
          }
        } else if (char === ',' && !insideQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const header = parseCsvRow(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
    let importedCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCsvRow(lines[i]);
      if (cols.length < 1) continue;

      const getCol = (names: string[]): string => {
        for (const name of names) {
          const idx = header.indexOf(name);
          if (idx !== -1 && cols[idx] !== undefined) {
            return cols[idx];
          }
        }
        return '';
      };

      const name = getCol(['name', 'fullname', 'contactname']);
      if (!name) continue;

      const newPerson: Partial<Person> = {
        name,
        nickname: getCol(['nickname', 'alias']),
        relationshipType: getCol(['relationship', 'relationshiptype', 'category']) || 'Professional Contact',
        occupation: getCol(['occupation', 'profession', 'role']),
        organization: getCol(['organization', 'company', 'org']),
        department: getCol(['department', 'dept']),
        jobTitle: getCol(['jobtitle', 'title']),
        location: getCol(['location', 'city', 'country']),
        email: getCol(['email', 'emailaddress']),
        phone: getCol(['phone', 'mobile', 'telephone']),
        website: getCol(['website', 'url']),
        skills: getCol(['skills', 'skillset']).split(/[;,]/).map((s) => s.trim()).filter(Boolean),
        tags: getCol(['tags', 'tag']).split(/[;,]/).map((t) => t.trim()).filter(Boolean),
        bio: getCol(['bio', 'notes', 'about']),
        isFavorite: ['true', '1', 'yes'].includes(getCol(['favorite', 'isfavorite']).toLowerCase()),
        isArchived: ['true', '1', 'yes'].includes(getCol(['archived', 'isarchived']).toLowerCase()),
      };

      this.createPerson(userId, newPerson);
      importedCount++;
    }

    this.logActivity(userId, 'IMPORT_COMPLETED', 'system', undefined, 'CSV Contact Import', `Imported ${importedCount} contacts from CSV`);
    return {
      importedCount,
      created: importedCount,
      updated: 0,
      errors: [],
    };
  }
}

export const storage = new StorageService();
