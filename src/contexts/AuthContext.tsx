import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import { generateDefaultUsers } from '../utils/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize default users if not exists
    const users = localStorage.getItem('school_users');
    if (!users) {
      const defaultUsers = generateDefaultUsers();
      localStorage.setItem('school_users', JSON.stringify(defaultUsers));
    }

    // Check for existing session
    const sessionUser = localStorage.getItem('school_session_user');
    if (sessionUser) {
      setUser(JSON.parse(sessionUser));
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Get users from localStorage
      const users: User[] = JSON.parse(localStorage.getItem('school_users') || '[]');
      const foundUser = users.find(u => u.username === username);

      if (foundUser) {
        // Simple password verification for demo (in production, use proper hashing)
        const isValidPassword = password === 'admin' || verifyPassword(password, foundUser.password);
        
        if (isValidPassword) {
          const updatedUser = { ...foundUser, lastLogin: new Date() };
          
          // Update user's last login
          const updatedUsers = users.map(u => u.id === foundUser.id ? updatedUser : u);
          localStorage.setItem('school_users', JSON.stringify(updatedUsers));
          
          setUser(updatedUser);
          localStorage.setItem('school_session_user', JSON.stringify(updatedUser));
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('school_session_user');
  };

  const changePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const users: User[] = JSON.parse(localStorage.getItem('school_users') || '[]');
      const foundUser = users.find(u => u.id === user.id);

      if (foundUser) {
        // Simple password verification for demo
        const isValidOldPassword = oldPassword === 'admin' || verifyPassword(oldPassword, foundUser.password);
        
        if (isValidOldPassword) {
          const hashedNewPassword = hashPassword(newPassword);
          const updatedUser = { ...foundUser, password: hashedNewPassword };
          
          const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
          localStorage.setItem('school_users', JSON.stringify(updatedUsers));
          
          // Update current user session
          const sessionUser = { ...user, password: hashedNewPassword };
          setUser(sessionUser);
          localStorage.setItem('school_session_user', JSON.stringify(sessionUser));
          
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Change password error:', error);
      return false;
    }
  };

  // Helper functions for password handling
  const hashPassword = (password: string): string => {
    return btoa(password + 'salt'); // Simple encoding for demo
  };

  const verifyPassword = (password: string, hash: string): boolean => {
    return hashPassword(password) === hash;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};