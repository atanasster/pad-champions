import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { db, auth } from './init';

// Helper to check if requester is admin
const assertAdmin = (request: any) => {
  if (request.auth?.token?.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Only admins can perform this action');
  }
};

// Explicitly allow the frontend origin
export const listUsers = onCall({ cors: ["http://localhost:3001"] }, async (request) => {
  assertAdmin(request);

  try {
    // In a real app with many users, implement pagination
    const snapshot = await db.collection('users').orderBy('createdAt', 'desc').limit(100).get();

    const users = snapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
    }));

    return { users };
  } catch (error) {
    logger.error('Error listing users', error);
    throw new HttpsError('internal', 'Unable to list users');
  }
});

export const setUserRole = onCall({ cors: ["http://localhost:3001"] }, async (request) => {
  assertAdmin(request);

  const { targetUid, newRole } = request.data;

  if (!targetUid || !['admin', 'moderator', 'volunteer'].includes(newRole)) {
    throw new HttpsError('invalid-argument', 'Invalid targetUid or newRole');
  }

  try {
    // 1. Update Firestore
    await db.collection('users').doc(targetUid).update({ role: newRole });

    // 2. Update Auth Claims
    await auth.setCustomUserClaims(targetUid, { role: newRole });

    logger.info(`Role updated for ${targetUid} to ${newRole} by ${request.auth?.uid}`);
    return { success: true };
  } catch (error) {
    logger.error(`Error setting role for ${targetUid}`, error);
    throw new HttpsError('internal', 'Unable to set user role');
  }
});
