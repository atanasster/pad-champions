import React from 'react';
import { Forums } from '../components/forum/Forums';
import { Notifications } from '../components/forum/Notifications';
import { ResourceManager } from '../components/resources/ResourceManager';
import { AdvisoryBoardList } from '../components/dashboard/AdvisoryBoardList';

const Dashboard: React.FC = () => {

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        {/* Resources Manager and Advisory Board Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
                 <ResourceManager className="bg-white p-6 rounded-lg shadow border border-gray-100 h-full" />
            </div>
            <div className="lg:col-span-1">
                <AdvisoryBoardList />
            </div>
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
