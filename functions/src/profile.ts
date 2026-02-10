import { onCall, HttpsError, CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { db, storage } from './init';

// Define the input data interface
interface UploadProfilePhotoData {
  photo: string; // Base64 encoded image string
  mimeType: string;
}

// Config with specific CORS settings
const callOpts = {
  cors: true, // Allow all origins or specify your app's domain
};

export const uploadProfilePhoto = onCall(callOpts, async (request: CallableRequest<UploadProfilePhotoData>) => {
  // 1. Authentication Check
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be logged in to upload a photo.');
  }

  const { photo, mimeType } = request.data;
  const uid = request.auth.uid;

  if (!photo || !mimeType) {
    throw new HttpsError('invalid-argument', 'Missing photo data or mimeType.');
  }

  // Basic validation for mimeType
  if (!mimeType.startsWith('image/')) {
    throw new HttpsError('invalid-argument', 'Only image files are allowed.');
  }

  try {
    // 2. Decode Base64
    const buffer = Buffer.from(photo, 'base64');

    // 3. Define Storage Path
    // Using a consistent path pattern: profile_photos/{uid}/profile_photo
    // This overwrites previous photos, saving space.
    // We can add a timestamp if we want to keep history, but for profile photos, overwrite is usually desired.
    // Adding file extension based on mimeType is good practice.
    const extension = mimeType.split('/')[1] || 'jpg';
    const filePath = `profile_photos/${uid}/profile_photo.${extension}`;
    const bucket = storage.bucket();
    const file = bucket.file(filePath);

    // 4. Upload to Firebase Storage
    await file.save(buffer, {
      metadata: {
        contentType: mimeType,
      },
    });

    // 5. Get Public Download URL
    // We need to make the file public or use a signed URL. 
    // For profile photos, usually making them public or using the persistent download token (traditional Firebase way) is common.
    // The "getDownloadURL" in client SDK generates a token-based URL.
    // In Admin SDK, `getSignedUrl` is common, strictly 'makePublic' is another.
    // Let's use getSignedUrl with a very long expiration for efficiency, or just make it public.
    // To mimic client SDK behavior (token based) is harder in Admin SDK without setting metadata.
    // Let's go with makePublic for a public profile photo.
    await file.makePublic();
    const photoURL = file.publicUrl();

    // 6. Update Firestore User Profile
    await db.collection('users').doc(uid).update({
      photoURL: photoURL,
    });

    // 7. Update Auth Profile (optional but good for consistency)
    // We can't easily update Auth profile photo from Admin SDK without `updateUser`.
    // Let's do that too so `currentUser.photoURL` works on next refresh.
    const { getAuth } = await import('firebase-admin/auth');
    await getAuth().updateUser(uid, {
      photoURL: photoURL,
    });

    logger.info(`Profile photo uploaded for user ${uid}`);

    return { photoURL };

  } catch (error) {
    logger.error('Error uploading profile photo:', error);
    throw new HttpsError('internal', 'Failed to upload profile photo.');
  }
});
