import React, { useState, useEffect } from 'react';
import { ForumPost, ForumComment } from '../../types';
import { ReplyForm } from './ReplyForm';
import { ArrowLeft, Clock, User, MessageSquare, Trash2, AlertCircle } from 'lucide-react';
import { ConfirmationModal } from '../ui/confirmation-modal';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { formatDistanceToNow } from 'date-fns';
import { getFirestore, collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { cn } from '../../lib/utils';

const db = getFirestore();

interface TopicDetailProps {
  post: ForumPost;
  onBack: () => void;
}

// Recursive Comment Component
const CommentItem: React.FC<{
  comment: ForumComment;
  postId: string;
  depth?: number;
}> = ({ comment, postId, depth = 0 }) => {
  const [isReplying, setIsReplying] = useState(false);
  const { currentUser: user, userRole } = useAuth();
  const functions = getFunctions();
  const deleteForumItemFn = httpsCallable(functions, 'deleteForumItem');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Limit nesting depth visual offset, but allow logical nesting
  // const maxDepth = 5; 
  // const currentDepth = depth > maxDepth ? maxDepth : depth;

  const handleReplySuccess = () => {
    setIsReplying(false);
  };

  const handleDeleteClick = () => {
      setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
      setIsDeleting(true);
      setError(null);
      try {
          await deleteForumItemFn({ id: comment.id, type: 'reply', postId });
      } catch (err) {
          console.error("Failed to delete reply", err);
          setError("Failed to delete reply. Please try again.");
      } finally {
          setIsDeleting(false);
          setDeleteModalOpen(false);
      }
  };

  const canDelete = user && (user.uid === comment.authorId || userRole === 'admin' || userRole === 'moderator');

  return (
    <div className={cn("mt-4", depth > 0 && "ml-4 pl-4 border-l-2 border-gray-100")}>
      <div className="bg-gray-50 rounded-lg p-4">
        {error && (
            <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        <div className="flex justify-between items-start">
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                <span className="font-medium text-gray-900">{comment.authorName}</span>
                <span>•</span>
                 <span>
                    {comment.createdAt?.toDate ? formatDistanceToNow(comment.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                 </span>
            </div>
             {canDelete && (
                <button 
                    onClick={handleDeleteClick} 
                    disabled={isDeleting}
                    className="text-gray-400 hover:text-red-600 transition-colors p-1"
                >
                    <Trash2 className="w-3 h-3" />
                </button>
            )}
        </div>
        
        <div className="text-gray-800 text-sm whitespace-pre-wrap">{comment.content}</div>

        <div className="mt-3">
          <button
            onClick={() => setIsReplying(!isReplying)}
            className="text-xs font-semibold text-gray-500 hover:text-[#c2002f] flex items-center"
          >
            <MessageSquare className="w-3 h-3 mr-1" />
            Reply
          </button>
        </div>

        {isReplying && (
          <div className="mt-3 pl-2 border-l-2 border-[#c2002f]">
             <ReplyForm 
                postId={postId} 
                parentId={comment.id} 
                onSuccess={handleReplySuccess} 
                onCancel={() => setIsReplying(false)}
             />
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Reply"
        message="Are you sure you want to delete this reply? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
      />

      {/* Recursive rendering of children */}
      {comment.children && comment.children.length > 0 && (
        <div className="space-y-2">
          {comment.children.map(child => (
            <CommentItem key={child.id} comment={child} postId={postId} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const TopicDetail: React.FC<TopicDetailProps> = ({ post, onBack }) => {
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser: user, userRole } = useAuth();
  const functions = getFunctions();
  const deleteForumItemFn = httpsCallable(functions, 'deleteForumItem');
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    // Subscribe to comments subcollection
    const q = query(
        collection(db, 'posts', post.id, 'comments'),
        orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allComments: ForumComment[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ForumComment[];

      // Organize into tree
      const commentMap: Record<string, ForumComment> = {};
      const roots: ForumComment[] = [];

      // First pass: map everything
      allComments.forEach(c => {
        c.children = [];
        commentMap[c.id] = c;
      });

      // Second pass: attach to parents
      allComments.forEach(c => {
        if (c.parentId && commentMap[c.parentId]) {
          commentMap[c.parentId].children?.push(c);
        } else {
          roots.push(c);
        }
      });

      setComments(roots);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [post.id]);

   const handleDeleteClick = () => {
      setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
      setIsDeletingPost(true);
      setError(null);
      try {
          await deleteForumItemFn({ id: post.id, type: 'post' });
          onBack(); // Go back to list immediately (it will disappear from there too via snapshot)
      } catch (err) {
          console.error("Failed to delete post", err);
          setError("Failed to delete topic. Please try again.");
      } finally {
          setIsDeletingPost(false);
          setDeleteModalOpen(false);
      }
  };

  const canDeletePost = user && (user.uid === post.authorId || userRole === 'admin' || userRole === 'moderator');


  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[600px] flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <button 
            onClick={onBack}
            className="flex items-center text-sm text-gray-500 hover:text-[#c2002f] mb-4 transition-colors"
        >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Topics
        </button>

        {error && (
            <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        <div className="flex justify-between items-start">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{post.title}</h1>
             {canDeletePost && (
                <button 
                    onClick={handleDeleteClick} 
                    disabled={isDeletingPost}
                    title="Delete Topic"
                    className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            )}
        </div>
        
        <div className="flex items-center text-sm text-gray-500 space-x-4 mb-6">
            <div className="flex items-center">
                <User className="w-4 h-4 mr-1.5" />
                {post.authorName}
            </div>
            <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1.5" />
                {post.createdAt?.toDate ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
            </div>
        </div>

        <div className="prose max-w-none text-gray-800 mb-8 whitespace-pre-wrap">
            {post.content}
        </div>

        <div className="border-t border-gray-100 pt-6">
             <h3 className="text-lg font-semibold mb-4 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Discussion
             </h3>
             
             {/* Main Reply Form */}
             <div className="mb-8">
                 <ReplyForm 
                    postId={post.id} 
                    onSuccess={() => {}} 
                    placeholder="Leave a comment..."
                 />
             </div>

             {/* Comments List */}
             {loading ? (
                <div className="text-center py-8 text-gray-500">Loading discussion...</div>
             ) : comments.length > 0 ? (
                <div className="space-y-6">
                    {comments.map(comment => (
                        <CommentItem key={comment.id} comment={comment} postId={post.id} />
                    ))}
                </div>
             ) : (
                 <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    No comments yet. Be the first to join the conversation!
                 </div>
             )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Topic"
        message="Are you sure you want to delete this entire topic? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeletingPost}
      />
    </div>
  );
};
