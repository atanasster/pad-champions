import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import { z } from "zod";

// Initialize Firebase Admin if not already initialized
if (admin.apps.length === 0) {
    admin.initializeApp();
}

const db = admin.firestore();

// Validation Schemas
const CreatePostSchema = z.object({
    title: z.string().min(5, "Title too short").max(200, "Title too long"),
    content: z.string().min(10, "Content too short"),
});

const CreateReplySchema = z.object({
    postId: z.string(),
    content: z.string().min(2, "Content too short"),
    parentId: z.string().nullable().optional(),
});

const DeleteSchema = z.object({
    id: z.string(),
    type: z.enum(['post', 'reply']),
    postId: z.string().optional(), // Required if type is reply
});

// Create Post Callable Function
export const createPost = onCall({ cors: true }, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'User must be logged in');
    }

    const { data } = request;
    const validation = CreatePostSchema.safeParse(data);

    if (!validation.success) {
        throw new HttpsError('invalid-argument', validation.error.message);
    }

    const { title, content } = validation.data;
    const authorId = request.auth.uid;
    const authorName = request.auth.token.name || request.auth.token.email || 'Anonymous';

    try {
        const postRef = await db.collection('posts').add({
            title,
            content,
            authorId,
            authorName,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
            likeCount: 0,
            commentCount: 0,
            lastCommentAt: null,
        });

        logger.info(`Post created: ${postRef.id} by ${authorId}`);
        return { success: true, postId: postRef.id };
    } catch (error) {
        logger.error("Error creating post", error);
        throw new HttpsError('internal', 'Failed to create post');
    }
});

// Create Reply Callable Function
export const createReply = onCall({ cors: true }, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'User must be logged in');
    }

    const { data } = request;
    const validation = CreateReplySchema.safeParse(data);

    if (!validation.success) {
        throw new HttpsError('invalid-argument', validation.error.message);
    }

    const { postId, content, parentId } = validation.data;
    const authorId = request.auth.uid;
    const authorName = request.auth.token.name || request.auth.token.email || 'Anonymous';

    try {
        const postRef = db.collection('posts').doc(postId);
        const postSnap = await postRef.get();

        if (!postSnap.exists) {
            throw new HttpsError('not-found', 'Post not found');
        }

        const replyRef = await postRef.collection('comments').add({
            postId,
            content,
            authorId,
            authorName,
            createdAt: FieldValue.serverTimestamp(),
            parentId: parentId || null,
        });

        // Update post stats
        await postRef.update({
            commentCount: FieldValue.increment(1),
            lastCommentAt: FieldValue.serverTimestamp(),
        });

        logger.info(`Reply created: ${replyRef.id} on post ${postId} by ${authorId}`);
        return { success: true, replyId: replyRef.id };
    } catch (error) {
        logger.error("Error creating reply", error);
        throw new HttpsError('internal', 'Failed to create reply');
    }
});

// Delete Post/Reply Function
export const deleteForumItem = onCall({ cors: true }, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'User must be logged in');
    }

    const { data } = request;
    const validation = DeleteSchema.safeParse(data);

    if (!validation.success) {
        throw new HttpsError('invalid-argument', validation.error.message);
    }

    const { id, type, postId } = validation.data;
    const uid = request.auth.uid;
    const userRole = request.auth.token.role || 'volunteer'; // Default to volunteer if no role
    const isAdminOrMod = userRole === 'admin' || userRole === 'moderator';

    try {
        if (type === 'post') {
            const postRef = db.collection('posts').doc(id);
            const postSnap = await postRef.get();

            if (!postSnap.exists) {
                throw new HttpsError('not-found', 'Post not found');
            }

            const postData = postSnap.data();
            if (postData?.authorId !== uid && !isAdminOrMod) {
                throw new HttpsError('permission-denied', 'Not authorized to delete this post');
            }

            // Note: In a production app, use recursive delete. 
            // For now, we assume standard delete which leaves subcollections orphaned but hidden.
            // Ideally, implement a recursive delete Trigger or use the Firebase CLI tool for this.
            await postRef.delete();
             logger.info(`Post deleted: ${id} by ${uid}`);
        } else {
            if (!postId) throw new HttpsError('invalid-argument', 'Post ID required for deleting reply');
            
            const replyRef = db.collection('posts').doc(postId).collection('comments').doc(id);
            const replySnap = await replyRef.get();

            if (!replySnap.exists) {
                 throw new HttpsError('not-found', 'Reply not found');
            }
            
            const replyData = replySnap.data();
            if (replyData?.authorId !== uid && !isAdminOrMod) {
                throw new HttpsError('permission-denied', 'Not authorized to delete this reply');
            }

            await replyRef.delete();
            
            // Decrement comment count - use caution if already 0
            await db.collection('posts').doc(postId).update({
                commentCount: FieldValue.increment(-1)
            });
             logger.info(`Reply deleted: ${id} by ${uid}`);
        }

        return { success: true };
    } catch (error) {
        logger.error("Error deleting item", error);
         if (error instanceof HttpsError) throw error;
        throw new HttpsError('internal', 'Failed to delete item');
    }
});
