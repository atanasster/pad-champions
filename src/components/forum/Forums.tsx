import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { TopicList } from './TopicList';
import { TopicDetail } from './TopicDetail';
import { CreateTopicForm } from './CreateTopicForm';
import { ForumPost, ForumType } from '../../types';
import { getFirestore, collection, query, orderBy, onSnapshot, limit, where } from 'firebase/firestore';
import { Plus, Users, GraduationCap, Building2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

const db = getFirestore();

export const Forums: React.FC = () => {
  const { userRole } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  
  const activeBoard = (searchParams.get('forumTab') as ForumType) || 'general';
  const topicId = searchParams.get('topicId');
  const action = searchParams.get('action'); // 'create'

  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Determine sort order - sticking to "Latest Activity" essentially (newest posts first,
    // ideally we'd sort by lastCommentAt but we might need a composite index for that)
    // For now, sorting by createdAt desc.
    // Filter by activeBoard
    const q = query(
      collection(db, 'posts'),
      where('forumType', '==', activeBoard),
      orderBy('createdAt', 'desc'),
      limit(50),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ForumPost[];
      setPosts(fetchedPosts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeBoard, location.search]); // Re-run when board changes

  const handleCreateSuccess = () => {
    setSearchParams(curr => {
        const next = new URLSearchParams(curr);
        next.delete('action');
        return next;
    });
  };

  const handlePostRead = (post: ForumPost) => {
    setSearchParams(curr => {
        const next = new URLSearchParams(curr);
        next.set('topicId', post.id);
        next.delete('action');
        return next;
    }, { preventScrollReset: true });
  };

  const clearView = () => {
      setSearchParams(curr => {
          const next = new URLSearchParams(curr);
          next.delete('topicId');
          next.delete('action');
          return next;
      });
  };

  const changeTab = (tab: ForumType) => {
      setSearchParams(curr => {
          const next = new URLSearchParams(curr);
          next.set('forumTab', tab);
          next.delete('topicId');
          next.delete('action');
          return next;
      }, { preventScrollReset: true });
  };

  if (action === 'create') {
    return (
      <CreateTopicForm
        onCancel={clearView}
        onSuccess={handleCreateSuccess}
        initialForumType={activeBoard}
        userRole={userRole || 'volunteer'}
      />
    );
  }

  if (topicId) {
    return (
      <TopicDetail
        postId={topicId}
        onBack={clearView}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Community Forum</h2>
          <p className="text-gray-600">Connect with other volunteers and organizers.</p>
        </div>
        <button
          onClick={() => setSearchParams(curr => { const next = new URLSearchParams(curr); next.set('action', 'create'); return next; }, { preventScrollReset: true })}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#c2002f] hover:bg-[#a00027] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#c2002f]"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Topic
        </button>
      </div>

      {/* Board Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6 w-fit">
        <button
          onClick={() => changeTab('general')}
          className={cn(
            'flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors',
            activeBoard === 'general'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-900',
          )}
        >
          <Users className="w-4 h-4 mr-2" />
          General
        </button>

        {['learner', 'institutional-lead', 'admin', 'moderator'].includes(userRole || '') && (
          <button
            onClick={() => changeTab('learner')}
            className={cn(
              'flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors',
              activeBoard === 'learner'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900',
            )}
          >
            <GraduationCap className="w-4 h-4 mr-2" />
            Learners
          </button>
        )}

        {['institutional-lead', 'admin', 'moderator'].includes(userRole || '') && (
          <button
            onClick={() => changeTab('institutional-lead')}
            className={cn(
              'flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors',
              activeBoard === 'institutional-lead'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900',
            )}
          >
            <Building2 className="w-4 h-4 mr-2" />
            Institutional Leads
          </button>
        )}
      </div>

      <TopicList posts={posts} isLoading={loading} onSelectPost={handlePostRead} />
    </div>
  );
};
