import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

const app = initializeApp();

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
