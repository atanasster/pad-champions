import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminRoute = () => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!currentUser || (userRole !== 'admin' && userRole !== 'moderator')) {
    // Redirect non-admins to home or login
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
