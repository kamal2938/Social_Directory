export interface AppSettings {
  id: string;
  logoUrl?: string;
  appName?: string;
  aboutMeText?: string;
}

export type RelationshipType =
  | 'Friend'
  | 'Classmate'
  | 'Colleague'
  | 'Professional Contact'
  | 'Client'
  | 'Teacher'
  | 'Online Contact'
  | 'Family Contact'
  | 'Mentor'
  | 'Other';

export interface SocialLink {
  id: string;
  platform: 'facebook' | 'linkedin' | 'github' | 'twitter' | 'instagram' | 'youtube' | 'website' | 'other';
  url: string;
  label?: string;
}

export interface Person {
  id: string;
  userId: string;
  name: string;
  nickname?: string;
  photo?: string;
  coverPhoto?: string;
  gender?: string;
  dateOfBirth?: string;
  location?: string;
  bio?: string;

  // Professional
  occupation?: string;
  organization?: string;
  department?: string;
  jobTitle?: string;
  skills: string[];
  education?: string;

  // Contact
  email?: string;
  phone?: string;
  website?: string;

  // Social
  socialLinks: SocialLink[];

  // Categorization
  relationshipType: RelationshipType | string;
  tags: string[];
  circles?: string[];
  isFavorite: boolean;
  isArchived: boolean;

  // Reminders & Cadence & Custom Attributes
  followUpCadenceDays?: number; // Touchpoint target frequency in days (e.g. 14, 30, 60, 90)
  customFields?: Record<string, string>; // Dynamic attributes (e.g. Blood Group, Hobby, Referred By)

  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastInteractionAt?: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  description?: string;
  count?: number;
  createdAt: string;
}

export interface OutreachTemplate {
  id: string;
  title: string;
  category: 'catchup' | 'followup' | 'birthday' | 'collaboration' | 'bangla' | 'greeting';
  subject?: string;
  body: string;
}

export interface Note {
  id: string;
  personId: string;
  personName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export type InteractionType =
  | 'Meeting'
  | 'Phone Call'
  | 'Message'
  | 'Email'
  | 'Online Meeting'
  | 'Event'
  | 'Other';

export interface Interaction {
  id: string;
  personId: string;
  personName: string;
  type: InteractionType;
  date: string;
  description: string;
  notes?: string;
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  date: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  entityType: 'person' | 'note' | 'interaction' | 'tag' | 'system' | 'user';
  entityId?: string;
  entityName?: string;
  details?: string;
  timestamp: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role?: "admin" | "viewer";
  fullName: string;
  avatar?: string;
  phone?: string;
  occupation?: string;
  organization?: string;
  location?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalPeople: number;
  archivedPeople: number;
  favorites: number;
  totalTags: number;
  totalOrganizations: number;
  recentContacts: Person[];
  recentInteractions: Interaction[];
  relationshipCounts: Record<string, number>;
  recentActivity: ActivityLog[];
  upcomingBirthdays?: Person[];
  overdueFollowUps?: Person[];
  allCircles?: string[];
}

export type DirectoryStats = DashboardStats;

export interface FilterState {
  query: string;
  tag: string;
  circle?: string;
  relationship: string;
  organization: string;
  location: string;
  favoriteOnly: boolean;
  archivedOnly: boolean;
  needsFollowUp?: boolean;
  upcomingBirthday?: boolean;
  sortBy: 'name' | 'recent' | 'lastInteraction' | 'updated' | 'health';
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
}

export type ActiveView =
  | 'home'
  | 'dashboard'
  | 'profile'
  | 'people'
  | 'reminders'
  | 'favorites'
  | 'circles'
  | 'tags'
  | 'interactions'
  | 'notes'
  | 'archive'
  | 'archived'
  | 'activity'
  | 'settings';

export type TabType = ActiveView;

// --- Phase 1: Health & Emergency ---
export type PrivacySetting = 'Only Me' | 'Selected Family Members' | 'Private Group' | 'Custom Access';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Unknown / Not Specified';
export type EmergencyPriority = 'Primary' | 'Secondary' | 'Other';

export interface HealthProfile {
  id: string;
  personId: string;
  bloodGroup: BloodGroup;
  medicalConditions?: string;
  visibility: PrivacySetting;
  createdAt: string;
  updatedAt: string;
}

export interface Medicine {
  id: string;
  personId: string;
  name: string;
  dosage: string;
  frequency: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Allergy {
  id: string;
  personId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyContact {
  id: string;
  personId: string;
  name: string;
  relationship: string;
  phoneNumber: string;
  alternativePhoneNumber?: string;
  priority: EmergencyPriority;
  createdAt: string;
  updatedAt: string;
}

// --- Phase 2-5 ---
export interface FinancialTransaction {
  id: string; personId: string; type: 'Lent' | 'Borrowed'; amount: number;
  currency: string; date: string; dueDate?: string; description?: string;
  status: 'Active' | 'Partially Settled' | 'Settled' | 'Overdue' | 'Cancelled';
  paidAmount: number; createdAt: string; updatedAt: string;
}
export interface TransactionPayment {
  id: string; transactionId: string; amount: number; date: string; note?: string;
  createdAt: string;
}
export interface PersonalDocument {
  id: string; personId: string; title: string; category: string;
  fileData: string; // Base64 for MVP
  issueDate?: string; expiryDate?: string; notes?: string;
  visibility: PrivacySetting; createdAt: string; updatedAt: string;
}
export interface PersonalEvent {
  id: string; personId: string; title: string; type: string; date: string;
  repeatFrequency: 'One Time' | 'Yearly' | 'Monthly' | 'Custom'; createdAt: string; updatedAt: string;
}
export interface GiftHistory {
  id: string; personId: string; name: string; category: string;
  dateGiven: string; occasion: string; price?: number; note?: string; createdAt: string; updatedAt: string;
}
export interface PersonalPreference {
  id: string; personId: string; category: string; value: string; createdAt: string; updatedAt: string;
}
