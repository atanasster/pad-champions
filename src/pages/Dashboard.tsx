import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </div>
  );
};

export default Dashboard;
