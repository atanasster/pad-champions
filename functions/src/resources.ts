import { onCall, HttpsError, CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { db, storage } from './init';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

// Interfaces based on src/types.ts
interface ResourceItem {
    id?: string;
    name: string;
    type: 'folder' | 'file';
    mimeType?: string;
    url?: string;
    path?: string;
    parentId: string | null;
    size?: number;
    uploadedBy?: string;
    createdBy?: string;
    createdAt?: Timestamp | FieldValue;
    updatedAt?: Timestamp | FieldValue;
    accessLevel: 'public' | 'learner' | 'lead' | 'admin';
    storagePath?: string;
}

// Helper to check permissions
const checkManagePermission = (role: string | undefined) => {
    return ['admin', 'moderator', 'institutional-lead'].includes(role || '');
};

const checkViewPermission = (role: string | undefined, accessLevel: string) => {
    if (accessLevel === 'public') return true;
    if (role === 'admin' || role === 'moderator') return true;
    if (accessLevel === 'learner' && ['learner', 'institutional-lead'].includes(role || '')) return true;
    if (accessLevel === 'lead' && role === 'institutional-lead') return true;
    return false;
};

// 1. Get Resources
export const getResources = onCall({ cors: true }, async (request: CallableRequest<{ parentId: string | null }>) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'User must be logged in.');
    }

    const { parentId } = request.data;
    const role = request.auth.token.role;

    try {
        const query = db.collection('resources').where('parentId', '==', parentId);
        
        // Order by type and name for consistent sorting
        // Note: Doing this in-memory to avoid complex composite index requirements during development
        // query = query.orderBy('type', 'desc').orderBy('name', 'asc');

        const snapshot = await query.get();
        const resources: ResourceItem[] = [];

        snapshot.forEach(doc => {
            const data = doc.data() as ResourceItem;
            // Filter in memory for now based on access level to simplify index needs and handle complex "OR" logic
            // Firestore "OR" queries with multiple fields often require specific indexes.
            if (checkViewPermission(role, data.accessLevel)) {
                resources.push({ id: doc.id, ...data });
            }
        });

        // Sort: folders first, then files. Alphabetical within type.
        resources.sort((a, b) => {
            if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
            return a.name.localeCompare(b.name);
        });

        return { resources };
    } catch (error) {
        logger.error("Error fetching resources:", error);
        throw new HttpsError('internal', 'Failed to fetch resources');
    }
});

// 2. Create Folder
export const createResourceFolder = onCall({ cors: true }, async (request: CallableRequest<{ name: string; parentId: string | null }>) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'User must be logged in.');
    }

    const role = request.auth.token.role;
    if (!checkManagePermission(role)) {
        throw new HttpsError('permission-denied', 'Only authorized users can create folders.');
    }

    const { name, parentId } = request.data;
    if (!name) throw new HttpsError('invalid-argument', 'Folder name is required');

    try {
        const newFolder: ResourceItem = {
            name,
            type: 'folder',
            parentId,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
            accessLevel: 'public', // Default to public, can be changed later if we add that feature
            createdBy: request.auth.uid
        };

        const docRef = await db.collection('resources').add(newFolder);
        return { id: docRef.id, ...newFolder };
    } catch (error) {
        logger.error("Error creating folder:", error);
        throw new HttpsError('internal', 'Failed to create folder');
    }
});

// 3. Rename Resource
export const renameResource = onCall({ cors: true }, async (request: CallableRequest<{ resourceId: string; newName: string }>) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'User must be logged in.');
    }

    const { resourceId, newName } = request.data;
    if (!resourceId || !newName) throw new HttpsError('invalid-argument', 'Resource ID and new name are required');

    try {
        const docRef = db.collection('resources').doc(resourceId);
        const docSnap = await docRef.get();

        if (!docSnap.exists) throw new HttpsError('not-found', 'Resource not found');

        const data = docSnap.data() as ResourceItem;
        const role = request.auth.token.role;
        
        // Ownership check: Admin/Mod can rename anything. Lead can rename their own.
        const canEdit = ['admin', 'moderator'].includes(role) || 
                        (role === 'institutional-lead' && (data.createdBy === request.auth.uid || data.uploadedBy === request.auth.uid));

        if (!canEdit) {
            throw new HttpsError('permission-denied', 'You do not have permission to rename this resource.');
        }

        await docRef.update({
            name: newName,
            updatedAt: FieldValue.serverTimestamp()
        });

        return { success: true };
    } catch (error) {
        logger.error("Error renaming resource:", error);
        throw new HttpsError('internal', 'Failed to rename resource');
    }
});

// 4. Delete Resource
export const deleteResource = onCall({ cors: true }, async (request: CallableRequest<{ resourceId: string }>) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'User must be logged in.');
    }

    const { resourceId } = request.data;
    if (!resourceId) throw new HttpsError('invalid-argument', 'Resource ID is required');

    try {
        const docRef = db.collection('resources').doc(resourceId);
        const docSnap = await docRef.get();

        if (!docSnap.exists) throw new HttpsError('not-found', 'Resource not found');

        const data = docSnap.data() as ResourceItem;
        const role = request.auth.token.role;

        // Permission check
        const canDelete = ['admin', 'moderator'].includes(role) || 
                          (role === 'institutional-lead' && (data.createdBy === request.auth.uid || data.uploadedBy === request.auth.uid));

        if (!canDelete) {
            throw new HttpsError('permission-denied', 'You do not have permission to delete this resource.');
        }

        // 1. If it's a file, delete from Storage
        if (data.type === 'file' && data.storagePath) {
            try {
                await storage.bucket().file(data.storagePath).delete();
            } catch (storageError: unknown) {
                logger.warn(`Failed to delete storage file ${data.storagePath}:`, storageError);
                // Proceed to delete document even if storage delete fails (might be already gone)
            }
        }

        // 2. If it's a folder, check for children (prevent orphan creation)
        if (data.type === 'folder') {
            const childrenSnapshot = await db.collection('resources').where('parentId', '==', resourceId).limit(1).get();
            if (!childrenSnapshot.empty) {
                throw new HttpsError('failed-precondition', 'Folder is not empty. Please delete contents first.');
            }
        }

        // 3. Delete Firestore document
        await docRef.delete();

        return { success: true };
    } catch (error) {
        logger.error("Error deleting resource:", error);
        if (error instanceof HttpsError) throw error;
        throw new HttpsError('internal', 'Failed to delete resource');
    }
});

// 5. Upload Resource File (Base64)
export const uploadResourceFile = onCall({ cors: true }, async (request: CallableRequest<{ 
    fileData: string; 
    fileName: string; 
    mimeType: string; 
    parentId: string | null;
    accessLevel?: 'learner' | 'public';
}>) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'User must be logged in.');
    }

    const role = request.auth.token.role;
    if (!checkManagePermission(role)) {
        throw new HttpsError('permission-denied', 'Only authorized users can upload files.');
    }

    const { fileData, fileName, mimeType, parentId, accessLevel = 'learner' } = request.data;
    
    if (!fileData || !fileName || !mimeType) {
        throw new HttpsError('invalid-argument', 'Missing file data.');
    }

    try {
        const uid = request.auth.uid;
        const timestamp = Date.now();
        // Construct storage path
        const storagePath = `resources/${uid}/${timestamp}_${fileName}`;
        const bucket = storage.bucket();
        const file = bucket.file(storagePath);
        const buffer = Buffer.from(fileData, 'base64');

        // 1. Upload to Storage
        await file.save(buffer, {
            metadata: { contentType: mimeType }
        });

        // 2. Make Public (or use signed URL, but public is easier for direct access)
        await file.makePublic();
        const publicUrl = file.publicUrl();

        // 3. Create Firestore Document
        const newResource: ResourceItem = {
            name: fileName,
            type: 'file',
            mimeType,
            url: publicUrl,
            storagePath,
            parentId,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
            accessLevel,
            size: buffer.length,
            uploadedBy: uid,
            createdBy: uid // keeping consistent
        };

        const docRef = await db.collection('resources').add(newResource);
        
        return { id: docRef.id, ...newResource };

    } catch (error) {
        logger.error("Error uploading file:", error);
        throw new HttpsError('internal', 'Failed to upload file');
    }
});
