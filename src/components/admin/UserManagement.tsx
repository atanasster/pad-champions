import React, { useEffect, useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../lib/firebase';
import { UserData, UserRole } from '../../types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { Search } from 'lucide-react';
import { ConfirmationModal } from '../ui/confirmation-modal';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [updatingAdvisory, setUpdatingAdvisory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [alertState, setAlertState] = useState<{ isOpen: boolean; title: string; message: string }>({
    isOpen: false,
    title: '',
    message: '',
  });

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
      setAlertState({
        isOpen: true,
        title: 'Error',
        message: 'Failed to update user role',
      });
    } finally {
      setUpdating(null);
    }
  };

  const handleAdvisoryToggle = async (userId: string, currentStatus: boolean) => {
    setUpdatingAdvisory(userId);
    try {
      const setAdvisoryBoardStatusFunction = httpsCallable<
        { targetUid: string; status: boolean },
        { success: boolean }
      >(functions, 'setAdvisoryBoardStatus');
      await setAdvisoryBoardStatusFunction({ targetUid: userId, status: !currentStatus });

      // Optimistic update
      setUsers(
        users.map((u) => (u.uid === userId ? { ...u, isAdvisoryBoardMember: !currentStatus } : u))
      );
    } catch (err) {
      console.error('Error updating advisory board status:', err);
      setAlertState({
        isOpen: true,
        title: 'Error',
        message: 'Failed to update advisory board status',
      });
    } finally {
      setUpdatingAdvisory(null);
    }
  };


  const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase();
    const name = user.displayName?.toLowerCase() || '';
    const email = user.email?.toLowerCase() || '';
    return name.includes(term) || email.includes(term);
  });

  if (loading) return <div className="p-8 text-center">Loading users...</div>;

  return (
    <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-slate-200">
      <div className="flex justify-between items-center p-6 border-b border-slate-200">
        <h2 className="text-xl font-semibold text-slate-800">User Management</h2>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-[250px]"
            />
          </div>
          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
          >
            Refresh Users
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 m-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 uppercase text-xs tracking-wider">
              <th className="p-4 font-semibold">User</th>
              <th className="p-4 font-semibold">Email</th>
              <th className="p-4 font-semibold">Role</th>
              <th className="p-4 font-semibold">Advisory Board</th>
              <th className="p-4 font-semibold">Joined</th>
              <th className="p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.map((user) => (
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
                          : user.role === 'institutional-lead'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Checkbox
                      checked={user.isAdvisoryBoardMember || false}
                      onCheckedChange={() =>
                        handleAdvisoryToggle(user.uid, user.isAdvisoryBoardMember || false)
                      }
                      disabled={updatingAdvisory === user.uid}
                    />
                    {updatingAdvisory === user.uid && (
                      <span className="text-xs text-indigo-500 animate-pulse">...</span>
                    )}
                  </div>
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
                        <SelectItem value="learner">Learner</SelectItem>
                        <SelectItem value="institutional-lead">Institutional Lead</SelectItem>
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
        {filteredUsers.length === 0 && !loading && (
          <div className="p-8 text-center text-slate-500">
            {searchTerm ? 'No users found matching your search.' : 'No users found.'}
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={alertState.isOpen}
        onClose={() => setAlertState({ ...alertState, isOpen: false })}
        title={alertState.title}
        message={alertState.message}
      />
    </div>
  );
};

export default UserManagement;
