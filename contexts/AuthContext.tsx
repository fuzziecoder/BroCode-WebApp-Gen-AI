import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
// FIX: Import User from local types.ts instead of @supabase/supabase-js
import { UserProfile, User } from '../types';
import { mockApi } from '../services/mockApi';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const AUTH_STORAGE_KEY = 'brocode-auth-userid';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const handleAuthStateChange = useCallback(async (userId: string | null) => {
    setLoading(true);
    if (userId) {
      const userProfile = await mockApi.getProfile(userId);
      if (userProfile) {
        const mockUser: User = {
          id: userProfile.id,
          email: userProfile.email,
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        };
        setUser(mockUser);
        setProfile(userProfile);
      } else {
        // User ID in storage is invalid
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setUser(null);
        setProfile(null);
      }
    } else {
      setUser(null);
      setProfile(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const storedUserId = localStorage.getItem(AUTH_STORAGE_KEY);
    handleAuthStateChange(storedUserId);
  }, [handleAuthStateChange]);

  const login = async (email: string, password: string) => {
    const { user: loggedInUser, profile: userProfile } = await mockApi.login(email, password);
    localStorage.setItem(AUTH_STORAGE_KEY, loggedInUser.id);
    setUser(loggedInUser);
    setProfile(userProfile);
  };

  const logout = async () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error("No user is logged in");
    
    const updatedProfile = await mockApi.updateProfile(user.id, updates);
    setProfile(updatedProfile);
  };

  const value = {
    user,
    profile,
    login,
    logout,
    updateProfile,
    loading,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
