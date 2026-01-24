import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';
// import { useAuth } from '../../contexts/AuthContext'; // Assuming AuthContext exists
import { cn } from '../../lib/utils'; // Assuming shadcn utils

const topicSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title matches limit'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
});

type TopicFormValues = z.infer<typeof topicSchema>;

interface CreateTopicFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

export const CreateTopicForm: React.FC<CreateTopicFormProps> = ({ onCancel, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const { user } = useAuth(); // If needed for local checks, but server validates
  const functions = getFunctions();
  const createPostFn = httpsCallable(functions, 'createPost');

  const form = useForm<TopicFormValues>({
    resolver: zodResolver(topicSchema),
  });

  const onSubmit = async (data: TopicFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await createPostFn(data);
      onSuccess();
    } catch (err: unknown) {
      console.error('Failed to create post:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create topic. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-xl font-semibold mb-6">Start a New Discussion</h3>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm mb-4">
          {error}
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            {...form.register('title')}
            id="title"
            type="text"
            className={cn(
              "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#c2002f] focus:border-transparent",
              form.formState.errors.title ? "border-red-500" : "border-gray-300"
            )}
            placeholder="What's on your mind?"
          />
          {form.formState.errors.title && (
            <p className="mt-1 text-xs text-red-500">{form.formState.errors.title.message}</p>
          )}
        </div>

        <div>
           <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Content
          </label>
          <textarea
            {...form.register('content')}
            id="content"
            rows={5}
            className={cn(
               "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#c2002f] focus:border-transparent",
               form.formState.errors.content ? "border-red-500" : "border-gray-300"
            )}
            placeholder="Share your thoughts details..."
          />
           {form.formState.errors.content && (
            <p className="mt-1 text-xs text-red-500">{form.formState.errors.content.message}</p>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#c2002f]"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#c2002f] border border-transparent rounded-md hover:bg-[#a00027] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#c2002f] disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Post Topic
          </button>
        </div>
      </form>
    </div>
  );
};
