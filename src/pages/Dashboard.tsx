import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { Forums } from '../components/forum/Forums';
import { Notifications } from '../components/forum/Notifications';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Welcome!</CardTitle>
              <CardDescription>Good to see you, {currentUser?.displayName}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This is your protected dashboard. You can access exclusive content here.</p>
            </CardContent>
          </Card>
          {/* Add more widgets or content here */}
        </div>

        <div className="md:col-span-1 lg:col-span-2">
          <Notifications />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-8">
        <Forums />
      </div>
    </div>
  );
};

export default Dashboard;
