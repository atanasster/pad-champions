import * as admin from 'firebase-admin';

// Initialize the app.
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const auth = admin.auth();
const db = admin.firestore();

const uid = process.argv[2];
const role = process.argv[3];

if (!uid || !role) {
  console.error('Usage: npx ts-node scripts/setUserRole.ts <UID> <ROLE>');
  console.error('Example: npx ts-node scripts/setUserRole.ts user123 admin');
  process.exit(1);
}

async function setUserRole(targetUid: string, targetRole: string) {
  console.log(`Setting role '${targetRole}' for user ${targetUid}...`);
  try {
    // 1. Set Custom Claim (Critical for AuthContext/Rules)
    await auth.setCustomUserClaims(targetUid, { role: targetRole });
    console.log(`✅ Auth Custom Claim 'role: ${targetRole}' set.`);

    // 2. Update Firestore (For the Dashboard UI)
    await db.collection('users').doc(targetUid).set({ role: targetRole }, { merge: true });
    console.log(`✅ Firestore 'users/${targetUid}' role updated.`);

    console.log(
      'SUCCESS: User role updated. They may need to sign out and back in to refresh their token.',
    );
  } catch (err: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const error = err as any;
    console.error('ERROR setting user role:', error);
    if (error.code === 'auth/internal-error' && (error.message.includes('quota project') || error.message.includes('ADC'))) {
      console.error('\n⚠️  It looks like your Application Default Credentials need a refresh or a quota project.');
      console.error('Please run the following command in your terminal:');
      console.error('  gcloud auth application-default login');
      console.error('Then try running this script again.\n');
    }
    process.exit(1);
  }
}

setUserRole(uid, role);
