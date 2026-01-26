import React, { useState, useEffect } from 'react';
import { TopicList } from './TopicList';
import { TopicDetail } from './TopicDetail';
import { CreateTopicForm } from './CreateTopicForm';
import { ForumPost } from '../../types';
import { getFirestore, collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { Plus } from 'lucide-react';

const db = getFirestore();

type ViewState = 'list' | 'detail' | 'create';

export const Forums: React.FC = () => {
  const [view, setView] = useState<ViewState>('list');
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Determine sort order - sticking to "Latest Activity" essentially (newest posts first,
    // ideally we'd sort by lastCommentAt but we might need a composite index for that)
    // For now, sorting by createdAt desc.
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ForumPost[];
      setPosts(fetchedPosts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCreateSuccess = () => {
    setView('list');
  };

  const handlePostRead = (post: ForumPost) => {
    setSelectedPost(post);
    setView('detail');
  };

  if (view === 'create') {
    return <CreateTopicForm onCancel={() => setView('list')} onSuccess={handleCreateSuccess} />;
  }

  if (view === 'detail' && selectedPost) {
    return (
      <TopicDetail
        post={selectedPost}
        onBack={() => {
          setSelectedPost(null);
          setView('list');
        }}
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
          onClick={() => setView('create')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#c2002f] hover:bg-[#a00027] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#c2002f]"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Topic
        </button>
      </div>

      <TopicList posts={posts} isLoading={loading} onSelectPost={handlePostRead} />
    </div>
  );
};
