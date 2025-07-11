import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User } from '../types';
import bcrypt from 'bcryptjs';

// Fallback auth functions for localStorage
const hashPasswordSync = (password: string): string => {
  return btoa(password + 'salt');
};

const verifyPasswordSync = (password: string, hash: string): boolean => {
  return hashPasswordSync(password) === hash;
};

export const authService = {
  async login(username: string, password: string): Promise<User | null> {
    if (isSupabaseConfigured() && supabase) {
      try {
        // Query users table directly since we're not using Supabase Auth
        const { data: users, error } = await supabase
          .from('users')
          .select('*')
          .eq('username', username);

        if (error) {
          console.error('Supabase login error:', error);
          return null;
        }

        if (users && users.length > 0) {
          const user = users[0];
          // For demo purposes, we'll use simple password comparison
          // In production, you'd use proper password hashing
          const isValidPassword = await bcrypt.compare(password, user.password);
          
          if (isValidPassword) {
            // Update last login
            await supabase
              .from('users')
              .update({ last_login: new Date().toISOString() })
              .eq('id', user.id);

            return {
              id: user.id,
              username: user.username,
              password: user.password,
              role: user.role as 'admin' | 'teacher',
              class: user.class,
              division: user.division,
              createdAt: new Date(user.created_at),
              lastLogin: user.last_login ? new Date(user.last_login) : undefined,
            };
          }
        }
        return null;
      } catch (error) {
        console.error('Login error:', error);
        return null;
      }
    } else {
      // Fallback to localStorage
      const users: User[] = JSON.parse(localStorage.getItem('school_users') || '[]');
      const foundUser = users.find(u => u.username === username);

      if (foundUser && verifyPasswordSync(password, foundUser.password)) {
        const updatedUser = { ...foundUser, lastLogin: new Date() };
        
        const updatedUsers = users.map(u => u.id === foundUser.id ? updatedUser : u);
        localStorage.setItem('school_users', JSON.stringify(updatedUsers));
        
        return updatedUser;
      }
      return null;
    }
  },

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: users, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId);

        if (error || !users || users.length === 0) {
          return false;
        }

        const user = users[0];
        const isValidOldPassword = await bcrypt.compare(oldPassword, user.password);
        
        if (isValidOldPassword) {
          const hashedNewPassword = await bcrypt.hash(newPassword, 10);
          
          const { error: updateError } = await supabase
            .from('users')
            .update({ password: hashedNewPassword })
            .eq('id', userId);

          return !updateError;
        }
        return false;
      } catch (error) {
        console.error('Change password error:', error);
        return false;
      }
    } else {
      // Fallback to localStorage
      const users: User[] = JSON.parse(localStorage.getItem('school_users') || '[]');
      const foundUser = users.find(u => u.id === userId);

      if (foundUser && verifyPasswordSync(oldPassword, foundUser.password)) {
        const hashedNewPassword = hashPasswordSync(newPassword);
        const updatedUser = { ...foundUser, password: hashedNewPassword };
        
        const updatedUsers = users.map(u => u.id === userId ? updatedUser : u);
        localStorage.setItem('school_users', JSON.stringify(updatedUsers));
        return true;
      }
      return false;
    }
  }
};