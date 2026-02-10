import React from 'react';
import { Forums } from '../components/forum/Forums';
import { Notifications } from '../components/forum/Notifications';
import { ResourceManager } from '../components/resources/ResourceManager';

const Dashboard: React.FC = () => {

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        {/* Resources Manager Section */}
        <div className="mb-8">
             <ResourceManager className="bg-white p-6 rounded-lg shadow border border-gray-100" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <Notifications />
            </div>
             {/* Can add more side widgets here if needed */}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-8">
        <Forums />
      </div>
    </div>
  );
};

export default Dashboard;
