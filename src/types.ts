import { Timestamp } from 'firebase/firestore';

export interface ScreeningEvent {
  id: string;
  name: string;
  date: string;
  time: string;
  venueName: string;
  address: string;
  zip: string;
  type: 'Barbershop' | 'Community Center' | 'Church' | 'Pharmacy';
  coordinates: { lat: number; lng: number };
}

export interface QuizQuestion {
  id: number;
  text: string;
  weight: number; // Higher weight means higher risk
}

export interface NavItem {
  label: string;
  path: string;
}

export type UserRole = 'admin' | 'moderator' | 'volunteer' | 'learner' | 'institutional-lead';

export interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: UserRole;
  createdAt: string;
  isAdvisoryBoardMember?: boolean;
  // Extended Profile Fields
  institution?: string;
  title?: string; // for leads
  bio?: string;
  yearInSchool?: string; // for learners
  workAddress?: string; // for leads
  cellPhone?: string; // for leads
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
}

export type ForumType = 'general' | 'learner' | 'institutional-lead';

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  likeCount: number;
  commentCount: number;
  lastCommentAt: Timestamp | null;
}

export interface ForumComment {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: Timestamp;
  parentId: string | null;
  children?: ForumComment[]; // For UI threading
}

export interface ResourceItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  mimeType?: string; // for files
  url?: string; // for files
  path: string; // virtual path e.g. /training-docs/module-1
  parentId: string | null; // for hierarchy
  size?: number;
  uploadedBy?: string;
  createdBy?: string; // for folders
  createdAt: Timestamp;
  updatedAt: Timestamp;
  accessLevel: 'public' | 'learner' | 'lead' | 'admin'; 
  storagePath?: string; // Path in Firebase Storage
}

export interface ForumNotification {
  id: string;
  type: 'reply' | 'system';
  message: string;
  link: string;
  read: boolean;
  createdAt: Timestamp;
}
