import { onCall, HttpsError, CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { db, auth } from './init';

// Helper to check if requester is admin
const assertAdmin = (request: CallableRequest) => {
  if (request.auth?.token?.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Only admins can perform this action');
  }
};

import { defaultCallOpts } from './config';

// Explicitly allow the frontend origin
export const listUsers = onCall(defaultCallOpts, async (request) => {
  assertAdmin(request);

  try {
    // In a real app with many users, implement pagination
    const snapshot = await db.collection('users').orderBy('createdAt', 'desc').limit(100).get();

    const users = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const userData = doc.data();
        const uid = doc.id;

        try {
          const authUser = await auth.getUser(uid);

          // Prepare updates if Auth has fresh data
          const updates: Record<string, string> = {};
          if (userData.email !== authUser.email && authUser.email) updates.email = authUser.email;
          if (userData.displayName !== authUser.displayName && authUser.displayName)
            updates.displayName = authUser.displayName;
          if (userData.photoURL !== authUser.photoURL && authUser.photoURL)
            updates.photoURL = authUser.photoURL;

          // Sync creation time if available
          if (authUser.metadata.creationTime) {
            const authCreation = new Date(authUser.metadata.creationTime).toISOString();
            if (userData.createdAt !== authCreation) {
              updates.createdAt = authCreation;
            }
          }

          if (Object.keys(updates).length > 0) {
            logger.info(`Syncing user profile for ${uid}`, updates);
            // Fire and forget update
            db.collection('users')
              .doc(uid)
              .update(updates)
              .catch((err) => logger.error(`Failed to sync user updates for ${uid}`, err));

            return {
              uid,
              ...userData,
              ...updates,
            };
          }
        } catch (authError) {
          logger.warn(`Failed to fetch Auth record for user ${uid}`, authError);
        }

        return {
          uid,
          ...userData,
        };
      }),
    );

    return { users };
  } catch (error) {
    logger.error('Error listing users', error);
    throw new HttpsError('internal', 'Unable to list users');
  }
});

export const setUserRole = onCall(defaultCallOpts, async (request) => {
  assertAdmin(request);

  const { targetUid, newRole } = request.data;

  if (!targetUid || !['admin', 'moderator', 'volunteer', 'learner', 'institutional-lead'].includes(newRole)) {
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

export const setAdvisoryBoardStatus = onCall(defaultCallOpts, async (request) => {
  assertAdmin(request);

  const { targetUid, status } = request.data;

  if (!targetUid || typeof status !== 'boolean') {
    throw new HttpsError('invalid-argument', 'Invalid targetUid or status');
  }

  try {
    await db.collection('users').doc(targetUid).update({ isAdvisoryBoardMember: status });
    logger.info(`Advisory Board status updated for ${targetUid} to ${status} by ${request.auth?.uid}`);
    return { success: true };
  } catch (error) {
    logger.error(`Error setting advisory board status for ${targetUid}`, error);
    throw new HttpsError('internal', 'Unable to set advisory board status');
  }
});

export const getAdvisoryBoardMembers = onCall(defaultCallOpts, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const snapshot = await db.collection('users').where('isAdvisoryBoardMember', '==', true).get();
    
    const members = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        uid: doc.id,
        displayName: data.displayName,
        email: data.email,
        photoURL: data.photoURL,
        bio: data.bio,
        institution: data.institution,
        title: data.title
      };
    });

    return { members };
  } catch (error) {
    logger.error('Error fetching advisory board members', error);
    throw new HttpsError('internal', 'Unable to fetch advisory board members');
  }
});
