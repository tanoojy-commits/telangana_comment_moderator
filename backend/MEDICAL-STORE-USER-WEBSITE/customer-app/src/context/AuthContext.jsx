import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to Firebase or Mock auth state updates
    const unsubscribe = authService.onAuthStateChange((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const register = async (email, password, name, phone) => {
    setLoading(true);
    try {
      const user = await authService.signUp(email, password, name, phone);
      setCurrentUser(user);
      return user;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, rememberMe = false) => {
    setLoading(true);
    try {
      const user = await authService.signIn(email, password, rememberMe);
      setCurrentUser(user);
      if (rememberMe) {
        localStorage.setItem('medstore_remembered_email', email);
      } else {
        localStorage.removeItem('medstore_remembered_email');
      }
      return user;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    return await authService.resetPassword(email);
  };

  const updateProfile = async (name, phone) => {
    if (!currentUser) throw new Error('Not authenticated');
    const updatedFields = await authService.updateProfile(currentUser.uid, name, phone);
    setCurrentUser(prev => ({ ...prev, ...updatedFields }));
    return updatedFields;
  };

  const changePassword = async (newPassword) => {
    return await authService.changePassword(newPassword);
  };

  const value = {
    currentUser,
    loading,
    register,
    login,
    logout,
    resetPassword,
    updateProfile,
    changePassword,
    isMockMode: !import.meta.env.VITE_FIREBASE_API_KEY
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
export default AuthContext;
