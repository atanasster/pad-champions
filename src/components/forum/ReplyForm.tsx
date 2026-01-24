import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { cn } from '../../lib/utils'; 

const replySchema = z.object({
  content: z.string().min(2, 'Reply must be at least 2 characters'),
});

type ReplyFormValues = z.infer<typeof replySchema>;

interface ReplyFormProps {
  postId: string;
  parentId?: string | null;
  onSuccess: () => void;
  onCancel?: () => void;
  placeholder?: string;
}

export const ReplyForm: React.FC<ReplyFormProps> = ({ postId, parentId = null, onSuccess, onCancel, placeholder }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const functions = getFunctions();
  const createReplyFn = httpsCallable(functions, 'createReply');

  const form = useForm<ReplyFormValues>({
    resolver: zodResolver(replySchema),
  });

  const onSubmit = async (data: ReplyFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await createReplyFn({
        postId,
        parentId,
        content: data.content,
      });
      form.reset();
      onSuccess();
    } catch (err: unknown) {
      console.error('Failed to post reply:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to post reply. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-4">
       {error && (
        <div className="bg-red-50 text-red-700 p-2 rounded-md text-sm mb-2">
          {error}
        </div>
      )}
      <form onSubmit={form.handleSubmit(onSubmit)} className="gap-2">
        <textarea
          {...form.register('content')}
           className={cn(
               "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#c2002f] focus:border-transparent text-sm min-h-[80px]",
               form.formState.errors.content ? "border-red-500" : "border-gray-300"
            )}
            placeholder={placeholder || "Write your reply..."}
        />
        {form.formState.errors.content && (
           <p className="mt-1 text-xs text-red-500">{form.formState.errors.content.message}</p>
        )}
        
        <div className="flex justify-end space-x-2 mt-2">
           {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 bg-transparent"
              disabled={isSubmitting}
            >
              Cancel
            </button>
           )}
          <button
            type="submit"
            disabled={isSubmitting}
             className="inline-flex items-center px-4 py-1.5 text-xs font-medium text-white bg-[#c2002f] border border-transparent rounded-md hover:bg-[#a00027] disabled:opacity-50"
          >
             {isSubmitting && <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />}
            Reply
          </button>
        </div>
      </form>
    </div>
  );
};
