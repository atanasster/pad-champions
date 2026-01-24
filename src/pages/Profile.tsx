import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

const Profile: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={currentUser?.photoURL || ''}
              alt={currentUser?.displayName || 'User'}
            />
            <AvatarFallback>
              {currentUser?.displayName ? currentUser.displayName[0] : 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">{currentUser?.displayName}</CardTitle>
            <p className="text-slate-500">{currentUser?.email}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-1">Account Details</h3>
            <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
              <span className="text-slate-500">User ID:</span>
              <span className="font-mono">{currentUser?.uid}</span>
              <span className="text-slate-500">Last Login:</span>
              <span>{currentUser?.metadata.lastSignInTime}</span>
              <span className="text-slate-500">Created:</span>
              <span>{currentUser?.metadata.creationTime}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
