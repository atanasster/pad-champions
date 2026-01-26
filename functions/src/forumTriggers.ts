import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';

const db = admin.firestore();

export const onReplyCreated = onDocumentCreated(
  'posts/{postId}/comments/{commentId}',
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      return;
    }

    const { postId, commentId } = event.params;
    const replyData = snapshot.data();
    const authorId = replyData.authorId;
    const authorName = replyData.authorName || 'Someone';
    const parentId = replyData.parentId;

    try {
      const postRef = db.collection('posts').doc(postId);
      const postSnap = await postRef.get();

      if (!postSnap.exists) return;

      const postData = postSnap.data();
      if (!postData) return;

      const postAuthorId = postData.authorId;
      const postTitle = postData.title;

      const batch = db.batch();

      // 1. Notify Post Author (if not the one replying)
      if (postAuthorId !== authorId) {
        const notifRef = db.collection('users').doc(postAuthorId).collection('notifications').doc();
        batch.set(notifRef, {
          type: 'reply',
          message: `${authorName} replied to your topic: "${postTitle}"`,
          link: `/forum/post/${postId}`,
          relatedId: postId,
          read: false,
          createdAt: FieldValue.serverTimestamp(),
        });
      }

      // 2. Notify Parent Comment Author (if threaded and different user)
      if (parentId) {
        const parentCommentRef = postRef.collection('comments').doc(parentId);
        const parentSnap = await parentCommentRef.get();

        if (parentSnap.exists) {
          const parentData = parentSnap.data();
          // Avoid double notification if parent author IS post author (already handled above)
          if (
            parentData &&
            parentData.authorId !== authorId &&
            parentData.authorId !== postAuthorId
          ) {
            const notifRef = db
              .collection('users')
              .doc(parentData.authorId)
              .collection('notifications')
              .doc();
            batch.set(notifRef, {
              type: 'reply',
              message: `${authorName} replied to your comment in "${postTitle}"`,
              link: `/forum/post/${postId}`,
              relatedId: postId,
              read: false,
              createdAt: FieldValue.serverTimestamp(),
            });
          }
        }
      }

      await batch.commit();
      logger.info(`Notifications sent for reply ${commentId} on post ${postId}`);
    } catch (error) {
      logger.error('Error sending reply notifications', error);
    }
  },
);
