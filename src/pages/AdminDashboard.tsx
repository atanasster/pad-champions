import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
      </div>

      {/* Custom Tab Navigation */}
      <div className="mb-6 border-b border-slate-200">
        <div className="flex gap-4">
          <NavLink
            to="users"
            className={({ isActive }) =>
              `pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`
            }
          >
            User Management
          </NavLink>
          <NavLink
            to="events"
            className={({ isActive }) =>
              `pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`
            }
          >
            Events Management
          </NavLink>
        </div>
      </div>

      <Outlet />
    </div>
  );
};

export default AdminDashboard;
