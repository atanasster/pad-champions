import React, { useEffect, useState } from 'react';
import { User, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { AuthContext } from './AuthContext';
import { UserRole } from '../types';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        try {
          // Force refresh to get the latest claims (e.g. after admin promotion)
          const idTokenResult = await user.getIdTokenResult(true);
          const role = (idTokenResult.claims.role as UserRole) || 'volunteer';
          console.log("AuthProvider - User Role:", role); 
          setUserRole(role);
        } catch (error) {
          console.error('Error fetching user role:', error);
          setUserRole('volunteer'); // Fallback
        }
      } else {
        setUserRole(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error signing in with Google', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out', error);
      console.error('Error signing out', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    if (auth.currentUser) {
      const idTokenResult = await auth.currentUser.getIdTokenResult(true);
      setUserRole((idTokenResult.claims.role as UserRole) || 'volunteer');
    }
  };

  const value = {
    currentUser,
    userRole,
    loading,
    signInWithGoogle,
    logout,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
