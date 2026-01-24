import * as functions from 'firebase-functions/v1';
import * as logger from 'firebase-functions/logger';
import { db, auth } from './init';
import { UserRecord } from 'firebase-admin/auth';

export const onUserCreated = functions.auth.user().onCreate(async (user: UserRecord) => {
  if (!user) {
    return;
  }

  const { uid, email, displayName, photoURL } = user;
  const role = 'volunteer'; // Default role

  try {
    // 1. Create Firestore document for easier querying
    await db.collection('users').doc(uid).set({
      uid,
      email,
      displayName,
      photoURL,
      role,
      createdAt: new Date().toISOString(),
    });

    // 2. Set Custom Claims so security rules & frontend can check role easily
    await auth.setCustomUserClaims(uid, { role });

    logger.info(`User ${uid} created as ${role}`);
  } catch (error) {
    logger.error(`Error processing new user ${uid}`, error);
  }
});
