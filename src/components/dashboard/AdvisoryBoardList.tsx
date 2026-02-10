import React, { useEffect, useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserData } from '@/types';
import { Loader2, Users } from 'lucide-react';

export const AdvisoryBoardList: React.FC = () => {
  const [members, setMembers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const getAdvisoryBoardMembers = httpsCallable<void, { members: UserData[] }>(
          functions,
          'getAdvisoryBoardMembers'
        );
        const result = await getAdvisoryBoardMembers();
        setMembers(result.data.members);
      } catch (err) {
        console.error('Error fetching advisory board members:', err);
        setError('Failed to load advisory board members.');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Advisory Board
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
         <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Advisory Board
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500 text-sm">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Advisory Board
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto max-h-[500px] pr-2">
        {members.length === 0 ? (
          <p className="text-muted-foreground text-sm">No advisory board members found.</p>
        ) : (
          <div className="space-y-4">
            {members.map((member) => (
              <div key={member.uid} className="flex items-start gap-4">
                <Avatar className="h-10 w-10 border border-gray-200">
                  <AvatarImage src={member.photoURL} alt={member.displayName || 'Member'} />
                  <AvatarFallback>{member.displayName?.charAt(0) || '?'}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="font-medium leading-none">{member.displayName || 'Unnamed Member'}</p>
                  <a href={`mailto:${member.email}`} className="text-xs text-muted-foreground hover:underline hover:text-primary transition-colors">
                    {member.email}
                  </a>
                   {member.title && (
                      <p className="text-xs text-slate-500 font-medium">{member.title}</p>
                  )}
                  {member.institution && (
                      <p className="text-xs text-slate-400 italic">{member.institution}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
