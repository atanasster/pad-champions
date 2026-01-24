
import * as admin from 'firebase-admin';

// Initialize the app. 
// If generic functionality is needed, ensure GOOGLE_APPLICATION_CREDENTIALS is set,
// or run this in an environment authorized to access the project.
// If testing locally with emulators, set FIREBASE_AUTH_EMULATOR_HOST / FIRESTORE_EMULATOR_HOST env vars.
// However, based on logs, you might be connecting to real services with ADC.
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const auth = admin.auth();
const db = admin.firestore();

const uid = process.argv[2];

if (!uid) {
  console.error('Usage: npx ts-node scripts/makeAdmin.ts <UID>');
  process.exit(1);
}

async function makeAdmin(targetUid: string) {
  console.log(`Promoting user ${targetUid} to admin...`);
  try {
    // 1. Set Custom Claim (Critical for AuthContext/Rules)
    await auth.setCustomUserClaims(targetUid, { role: 'admin' });
    console.log(`✅ Auth Custom Claim 'role: admin' set.`);

    // 2. Update Firestore (For the Dashboard UI)
    await db.collection('users').doc(targetUid).set({ role: 'admin' }, { merge: true });
    console.log(`✅ Firestore 'users/${targetUid}' role updated.`);

    console.log('SUCCESS: User is now an admin. They may need to sign out and back in to refresh their token.');
  } catch (error) {
    console.error('ERROR making user admin:', error);
    process.exit(1);
  }
}

makeAdmin(uid);
