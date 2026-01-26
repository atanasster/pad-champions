import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import * as admin from 'firebase-admin';

// Ensure Firebase Admin is initialized (it might be initialized in index.ts or init.ts,
// but we need the instance here. Usually admin.initializeApp() is called once globally).
// We'll assume generic usage:
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Types matching frontend implementation
interface ScreeningEvent {
  id?: string;
  name: string;
  date: string;
  time: string;
  venueName: string;
  address: string;
  zip: string;
  type: string;
  coordinates: { lat: number; lng: number };
}

interface ManageEventRequest {
  action: 'create' | 'update' | 'delete';
  eventPayload?: Partial<ScreeningEvent>;
  eventId?: string;
}

import { defaultCallOpts } from './config';

// Public function to get events
export const getEvents = onCall(defaultCallOpts, async (_request) => {
  try {
    const snapshot = await db.collection('events').orderBy('date', 'desc').get();
    const events = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return { events };
  } catch (error) {
    logger.error('Error fetching events:', error);
    throw new HttpsError('internal', 'Unable to fetch events.');
  }
});

// Admin/Moderator function to manage events
export const manageEvent = onCall(defaultCallOpts, async (request) => {
  // 1. Auth Check
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be logged in.');
  }

  // 2. Role Check (Admin or Moderator)
  // We need to fetch the user's role. Using custom claims is best, but reading from Firestore
  // is consistent with current UserManagement if claims aren't set up.
  // Assuming claims for separate role management or reading /users/{uid}.
  // Let's try reading the user doc to be safe and consistent with AdminDashboard logic unless claims are verified.
  // Ideally, request.auth.token.role would be populated.
  // For now, we'll fast-path if claims exist, otherwise check DB.

  const uid = request.auth.uid;
  let role = request.auth.token.role;

  if (!role) {
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data();
    role = userData?.role;
  }

  if (role !== 'admin' && role !== 'moderator') {
    throw new HttpsError('permission-denied', 'User does not have permission to manage events.');
  }

  const { action, eventPayload, eventId } = request.data as ManageEventRequest;

  try {
    if (action === 'create') {
      if (!eventPayload) throw new HttpsError('invalid-argument', 'Missing event payload');
      // Create a new doc ref to get ID, or let add() do it
      const res = await db.collection('events').add(eventPayload);
      return { success: true, id: res.id, message: 'Event created successfully' };
    } else if (action === 'update') {
      if (!eventId || !eventPayload)
        throw new HttpsError('invalid-argument', 'Missing ID or payload');
      await db.collection('events').doc(eventId).update(eventPayload);
      return { success: true, message: 'Event updated successfully' };
    } else if (action === 'delete') {
      if (!eventId) throw new HttpsError('invalid-argument', 'Missing event ID');
      await db.collection('events').doc(eventId).delete();
      return { success: true, message: 'Event deleted successfully' };
    }

    throw new HttpsError('invalid-argument', 'Invalid action');
  } catch (error) {
    logger.error(`Error performing ${action} on event:`, error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError('internal', `Failed to ${action} event.`);
  }
});

// Admin only: Seed events
export const seedEvents = onCall(defaultCallOpts, async (request) => {
  // Auth & Admin Check
  if (!request.auth) throw new HttpsError('unauthenticated', 'Authentication required.');

  const uid = request.auth.uid;
  let role = request.auth.token.role;
  if (!role) {
    const userDoc = await db.collection('users').doc(uid).get();
    role = userDoc.data()?.role;
  }

  if (role !== 'admin') {
    throw new HttpsError('permission-denied', 'Only admins can seed data.');
  }

  const { events } = request.data as { events: ScreeningEvent[] };
  if (!events || !Array.isArray(events)) {
    throw new HttpsError('invalid-argument', 'Invalid events data.');
  }

  const batch = db.batch();

  // We will blindly overwrite or add.
  // To avoid duplicates if seeding multiple times, strict control is needed.
  // For now, we'll just add them.
  // Optionally, we could delete collection first, but that's dangerous.

  events.forEach((event) => {
    // If event has an ID, use it, otherwise auto-id
    const docRef = event.id ? db.collection('events').doc(event.id) : db.collection('events').doc();

    // sanitize id out of data if it's there
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, ...data } = event;
    batch.set(docRef, data, { merge: true });
  });

  try {
    await batch.commit();
    return { success: true, count: events.length, message: 'Events seeded successfully.' };
  } catch (error) {
    logger.error('Error seeding events:', error);
    throw new HttpsError('internal', 'Failed to seed events.');
  }
});
