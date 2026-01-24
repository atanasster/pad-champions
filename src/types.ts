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

export type UserRole = 'admin' | 'moderator' | 'volunteer';

export interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: UserRole;
  createdAt: string;
}

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

export interface ForumNotification {
  id: string;
  type: 'reply' | 'system';
  message: string;
  link: string;
  read: boolean;
  createdAt: Timestamp;
}
