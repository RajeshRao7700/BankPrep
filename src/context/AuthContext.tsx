import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile } from '../lib/types';
import { getUserProfile, saveUserProfile } from '../lib/storage';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoMode: boolean;
  login: (email: string, pass: string) => Promise<{ error?: string }>;
  signup: (email: string, pass: string, fullName: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => getUserProfile());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(!isSupabaseConfigured());

  useEffect(() => {
    // Check if Supabase session is active
    if (isSupabaseConfigured()) {
      setIsDemoMode(false);
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const profile = getUserProfile();
          profile.email = session.user.email || profile.email;
          profile.id = session.user.id;
          setUser(profile);
        }
        setIsLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const profile = getUserProfile();
          profile.email = session.user.email || profile.email;
          profile.id = session.user.id;
          setUser(profile);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      // Local persistent mode
      setIsDemoMode(true);
      setUser(getUserProfile());
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    if (isSupabaseConfigured()) {
      const { error, data } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) return { error: error.message };
      if (data.user) {
        const p = saveUserProfile({ email: data.user.email, id: data.user.id });
        setUser(p);
      }
      return {};
    } else {
      // Offline / Local demo login
      const p = saveUserProfile({ email, fullName: email.split('@')[0] });
      setUser(p);
      return {};
    }
  };

  const signup = async (email: string, pass: string, fullName: string) => {
    if (isSupabaseConfigured()) {
      const { error, data } = await supabase.auth.signUp({
        email,
        password: pass,
        options: { data: { full_name: fullName } }
      });
      if (error) return { error: error.message };
      if (data.user) {
        const p = saveUserProfile({ email: data.user.email, fullName, id: data.user.id });
        setUser(p);
      }
      return {};
    } else {
      const p = saveUserProfile({ email, fullName });
      setUser(p);
      return {};
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    // In local mode, keep profile or reset if needed
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    const updated = saveUserProfile(updates);
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      isDemoMode,
      login,
      signup,
      logout,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

