import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile, RegisteredAccount } from '../lib/types';
import { 
  getUserProfile, 
  saveUserProfile, 
  getActiveUserId, 
  setActiveUserId,
  findRegisteredAccount,
  saveRegisteredAccount,
  hashPassword
} from '../lib/storage';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoMode: boolean;
  login: (identifier: string, pass: string) => Promise<{ error?: string }>;
  signup: (identifier: string, pass: string, fullName: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(!isSupabaseConfigured());

  // Helper to normalize phone / email for Supabase background sync
  const getAuthEmail = (identifier: string): string => {
    const trimmed = identifier.trim().toLowerCase();
    if (trimmed.includes('@')) return trimmed;
    const cleanPhone = trimmed.replace(/[^\d]/g, '');
    return `${cleanPhone || 'user'}@bankprep.app`;
  };

  useEffect(() => {
    const currentId = getActiveUserId();
    
    // If user explicitly logged out or fresh session
    if (currentId === 'usr_logged_out' || !currentId) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    // Load user profile for active user ID
    const profile = getUserProfile();
    setUser(profile);
    setIsLoading(false);

    // If Supabase is connected, maintain session in background
    if (isSupabaseConfigured()) {
      setIsDemoMode(false);
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user && (!profile.email || !profile.email.includes('@'))) {
          profile.email = session.user.email || profile.email;
          setUser({ ...profile });
        }
      });
    }
  }, []);

  const login = async (identifier: string, pass: string): Promise<{ error?: string }> => {
    const trimmedId = identifier.trim();
    if (!trimmedId || !pass) {
      return { error: 'Please enter your email or phone number and password.' };
    }

    // Quick demo login bypass
    if (trimmedId.toLowerCase() === 'aspirant@bankprep.internal' || trimmedId.toLowerCase() === 'demo') {
      setActiveUserId('usr_default');
      const profile = getUserProfile();
      setUser(profile);
      return {};
    }

    // 1. Check local registered accounts
    const account = findRegisteredAccount(trimmedId);
    if (account) {
      const inputHash = await hashPassword(pass);
      if (account.passwordHash === inputHash) {
        // Switch to this user's isolated data store
        setActiveUserId(account.id);
        const profile = getUserProfile();
        profile.fullName = account.fullName || profile.fullName;
        if (account.email) profile.email = account.email;
        if (account.phone) profile.phone = account.phone;
        saveUserProfile(profile);
        setUser(profile);
        return {};
      } else {
        return { error: 'Incorrect password. Please verify and try again.' };
      }
    }

    // 2. If Supabase is configured, attempt remote login
    if (isSupabaseConfigured()) {
      const authEmail = getAuthEmail(trimmedId);
      const { error: sbError, data } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: pass
      });

      if (!sbError && data?.user) {
        // Successful remote login -> switch context and cache account locally
        const userId = data.user.id;
        setActiveUserId(userId);

        const newAcc: RegisteredAccount = {
          id: userId,
          identifier: trimmedId,
          email: trimmedId.includes('@') ? trimmedId : undefined,
          phone: !trimmedId.includes('@') ? trimmedId : undefined,
          passwordHash: await hashPassword(pass),
          fullName: data.user.user_metadata?.full_name || trimmedId.split('@')[0],
          createdAt: new Date().toISOString()
        };
        saveRegisteredAccount(newAcc);

        const profile = getUserProfile();
        profile.id = userId;
        profile.fullName = newAcc.fullName;
        if (newAcc.email) profile.email = newAcc.email;
        if (newAcc.phone) profile.phone = newAcc.phone;
        saveUserProfile(profile);
        setUser(profile);
        return {};
      }
    }

    return { 
      error: 'No account found with this email or phone number. Click "Register" below to create your account in seconds!' 
    };
  };

  const signup = async (identifier: string, pass: string, fullName: string): Promise<{ error?: string }> => {
    const trimmedId = identifier.trim();
    const trimmedName = fullName.trim();

    if (!trimmedId) return { error: 'Please enter an email address or phone number.' };
    if (!trimmedName) return { error: 'Please enter your full name.' };
    if (!pass || pass.length < 6) return { error: 'Password must be at least 6 characters long.' };

    // Check if account already exists
    const existing = findRegisteredAccount(trimmedId);
    if (existing) {
      return { error: 'An account with this email or phone number already exists. Please log in directly.' };
    }

    // Determine type
    const isEmail = trimmedId.includes('@');
    const cleanPhone = trimmedId.replace(/[^\d]/g, '');

    if (!isEmail && cleanPhone.length < 10) {
      return { error: 'Please enter a valid 10-digit phone number or email address.' };
    }

    // Generate unique user ID
    const userId = isEmail 
      ? `usr_${trimmedId.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
      : `usr_phone_${cleanPhone}`;

    const pwdHash = await hashPassword(pass);

    // Save registered account locally (guarantees instant zero-OTP login)
    const newAccount: RegisteredAccount = {
      id: userId,
      identifier: trimmedId,
      email: isEmail ? trimmedId.toLowerCase() : undefined,
      phone: !isEmail ? trimmedId : undefined,
      passwordHash: pwdHash,
      fullName: trimmedName,
      createdAt: new Date().toISOString()
    };
    saveRegisteredAccount(newAccount);

    // Switch active user to this new user's namespace
    setActiveUserId(userId);

    // Create fresh isolated user profile
    const freshProfile: UserProfile = {
      id: userId,
      fullName: trimmedName,
      email: isEmail ? trimmedId.toLowerCase() : '',
      phone: !isEmail ? trimmedId : '',
      targetExam: 'SBI PO & IBPS PO',
      targetYear: 2026,
      preparationStartDate: new Date().toISOString().split('T')[0],
      durationDays: 120,
      dailyStudyHoursTarget: 6,
      dailyQuestionsTarget: 50,
      dailyVideosTarget: 3
    };
    saveUserProfile(freshProfile);
    setUser(freshProfile);

    // If Supabase is configured, create account in Supabase background without blocking the student
    if (isSupabaseConfigured()) {
      const authEmail = getAuthEmail(trimmedId);
      supabase.auth.signUp({
        email: authEmail,
        password: pass,
        options: { data: { full_name: trimmedName, phone_or_email: trimmedId } }
      }).catch(err => {
        console.warn('Supabase background signup notice:', err);
      });
    }

    return {};
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (e) {}
    }
    setActiveUserId('usr_logged_out');
    setUser(null);
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
