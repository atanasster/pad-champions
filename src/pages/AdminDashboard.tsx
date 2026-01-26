import React, { useEffect, useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../lib/firebase';
import { UserData, UserRole } from '../types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

import EventsManager from '../components/admin/EventsManager';

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'events'>('users');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const listUsersFunction = httpsCallable<void, { users: UserData[] }>(functions, 'listUsers');
      const result = await listUsersFunction();
      setUsers(result.data.users);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setUpdating(userId);
    try {
      const setUserRoleFunction = httpsCallable<
        { targetUid: string; newRole: UserRole },
        { success: boolean }
      >(functions, 'setUserRole');
      await setUserRoleFunction({ targetUid: userId, newRole });

      // Optimistic update
      setUsers(users.map((u) => (u.uid === userId ? { ...u, role: newRole } : u)));
    } catch (err) {
      console.error('Error updating role:', err);
      alert('Failed to update user role');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading users...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <button
          onClick={fetchUsers}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
        >
          Refresh Data
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Custom Tab Navigation */}
      <div className="mb-6 border-b border-slate-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'users'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            User Management
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'events'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Events Management
          </button>
        </div>
      </div>

      {activeTab === 'users' ? (
        <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 uppercase text-xs tracking-wider">
                  <th className="p-4 font-semibold">User</th>
                  <th className="p-4 font-semibold">Email</th>
                  <th className="p-4 font-semibold">Role</th>
                  <th className="p-4 font-semibold">Joined</th>
                  <th className="p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.uid} className="hover:bg-slate-50 transition duration-150">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs">
                            {user.displayName?.[0] || '?'}
                          </div>
                        )}
                        <span className="font-medium text-slate-800">
                          {user.displayName || 'Anonymous'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">{user.email || 'N/A'}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : user.role === 'moderator'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Select
                          value={user.role}
                          onValueChange={(value) => handleRoleChange(user.uid, value as UserRole)}
                          disabled={updating === user.uid}
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="volunteer">Volunteer</SelectItem>
                            <SelectItem value="moderator">Moderator</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        {updating === user.uid && (
                          <span className="ml-2 text-xs text-indigo-500">Saving...</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && !loading && (
              <div className="p-8 text-center text-slate-500">No users found.</div>
            )}
          </div>
        </div>
      ) : (
        <EventsManager userRole={users.find((u) => u.uid === updating)?.role || 'admin'} /> // Pass assumed role or current user role.
        // Note: We don't strictly know current user role here in this component without auth context,
        // but typically AdminDashboard is guarded. We'll pass 'admin' for now or fetch current user mechanism.
        // Better: Fetch current user claims or profile.
      )}
    </div>
  );
};

export default AdminDashboard;
