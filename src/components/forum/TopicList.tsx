import React from 'react';
import { ForumPost } from '../../types';
import { MessageSquare, Heart, Clock, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TopicListProps {
  posts: ForumPost[];
  onSelectPost: (post: ForumPost) => void;
  isLoading: boolean;
}

export const TopicList: React.FC<TopicListProps> = ({ posts, onSelectPost, isLoading }) => {
  if (isLoading) {
    return <div className="text-center py-8">Loading topics...</div>;
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No topics yet</h3>
        <p className="mt-2 text-sm text-gray-500">Be the first to start a conversation!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div
          key={post.id}
          onClick={() => onSelectPost(post)}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-[#c2002f] transition-colors cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#c2002f] mb-2">
                {post.title}
              </h3>
              <p className="text-gray-600 line-clamp-2 mb-4 text-sm">{post.content}</p>

              <div className="flex items-center text-xs text-gray-500 space-x-4">
                <div className="flex items-center">
                  <User className="w-3 h-3 mr-1" />
                  {post.authorName}
                </div>
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {post.createdAt?.toDate
                    ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true })
                    : 'Just now'}
                </div>
                {post.lastCommentAt && (
                  <div className="hidden sm:flex items-center text-gray-400">
                    <span className="mx-2">•</span>
                    Last activity{' '}
                    {post.lastCommentAt?.toDate
                      ? formatDistanceToNow(post.lastCommentAt.toDate(), { addSuffix: true })
                      : ''}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end space-y-2 ml-4">
              <div className="flex items-center text-gray-500 bg-gray-50 px-3 py-1 rounded-full text-xs font-medium">
                <MessageSquare className="w-3 h-3 mr-1.5" />
                {post.commentCount}
              </div>
              <div className="flex items-center text-gray-500 bg-gray-50 px-3 py-1 rounded-full text-xs font-medium">
                <Heart className="w-3 h-3 mr-1.5" />
                {post.likeCount}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
