import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser, UserProfile } from '../types';
import { STORAGE_KEYS } from '../constants';

/**
 * LocalAccount interface for mock development storage.
 * IMPORTANT: Storing plaintext passwords in localStorage is explicitly for local development/mock
 * testing only. This MUST be replaced with secure token/hash-based auth prior to production.
 */
export interface LocalAccount {
  uid: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

export interface AuthContextType {
  currentUser: AuthUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  setUserProfile: (profile: UserProfile | null) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore authenticated session and profile on application start
  useEffect(() => {
    try {
      const rawSession = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (rawSession) {
        const user: AuthUser = JSON.parse(rawSession);
        setCurrentUser(user);

        const rawProfiles = localStorage.getItem(STORAGE_KEYS.USER_PROFILES);
        const profiles: Record<string, UserProfile> = rawProfiles ? JSON.parse(rawProfiles) : {};
        if (profiles && profiles[user.uid]) {
          setUserProfile(profiles[user.uid]);
        } else {
          setUserProfile(null);
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Failed to load local auth session:', error);
      setCurrentUser(null);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = async (name: string, email: string, password: string): Promise<void> => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      throw new Error('Please enter your name.');
    }
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      throw new Error('Please enter a valid email address.');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    const rawUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    const users: LocalAccount[] = rawUsers ? JSON.parse(rawUsers) : [];

    const existingUser = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existingUser) {
      throw new Error('An account with this email already exists.');
    }

    const uid = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    const now = new Date().toISOString();

    const newAccount: LocalAccount = {
      uid,
      name: cleanName,
      email: cleanEmail,
      password,
      createdAt: now,
    };

    users.push(newAccount);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    const sessionUser: AuthUser = {
      uid,
      name: cleanName,
      displayName: cleanName,
      email: cleanEmail,
      createdAt: now,
    };

    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(sessionUser));
    setCurrentUser(sessionUser);
    setUserProfile(null);
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      throw new Error('Please enter your email.');
    }
    if (!password) {
      throw new Error('Please enter your password.');
    }

    const rawUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    const users: LocalAccount[] = rawUsers ? JSON.parse(rawUsers) : [];

    const matchedAccount = users.find(
      u => u.email.toLowerCase() === cleanEmail && u.password === password
    );

    if (!matchedAccount) {
      throw new Error('Invalid email or password.');
    }

    const sessionUser: AuthUser = {
      uid: matchedAccount.uid,
      name: matchedAccount.name,
      displayName: matchedAccount.name,
      email: matchedAccount.email,
      createdAt: matchedAccount.createdAt,
    };

    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(sessionUser));
    setCurrentUser(sessionUser);

    const rawProfiles = localStorage.getItem(STORAGE_KEYS.USER_PROFILES);
    const profiles: Record<string, UserProfile> = rawProfiles ? JSON.parse(rawProfiles) : {};
    const existingProfile = profiles[matchedAccount.uid] || null;

    setUserProfile(existingProfile);
    return !!existingProfile;
  };

  const signOut = async (): Promise<void> => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    setCurrentUser(null);
    setUserProfile(null);
  };

  const updateUserProfile = async (profileData: Partial<UserProfile>): Promise<void> => {
    if (!currentUser) {
      throw new Error('No authenticated user found.');
    }

    const rawProfiles = localStorage.getItem(STORAGE_KEYS.USER_PROFILES);
    const profiles: Record<string, UserProfile> = rawProfiles ? JSON.parse(rawProfiles) : {};
    const existing: Partial<UserProfile> = profiles[currentUser.uid] || {};

    const updatedProfile: UserProfile = {
      ...existing,
      ...profileData,
      uid: currentUser.uid,
      email: currentUser.email,
      fullName: profileData.fullName || existing.fullName || currentUser.name || currentUser.displayName || 'Candidate',
      experienceLevel: profileData.experienceLevel || existing.experienceLevel || 'Fresher',
      domain: profileData.domain || existing.domain || 'Web Development',
      targetRole: profileData.targetRole || existing.targetRole || 'Software Engineer',
      skills: profileData.skills || existing.skills || [],
      preferredDifficulty: profileData.preferredDifficulty || existing.preferredDifficulty || 'Medium',
      updatedAt: new Date().toISOString(),
      createdAt: existing.createdAt || new Date().toISOString(),
    };

    profiles[currentUser.uid] = updatedProfile;
    localStorage.setItem(STORAGE_KEYS.USER_PROFILES, JSON.stringify(profiles));
    setUserProfile(updatedProfile);
  };

  const refreshProfile = async (): Promise<void> => {
    if (currentUser) {
      const rawProfiles = localStorage.getItem(STORAGE_KEYS.USER_PROFILES);
      const profiles: Record<string, UserProfile> = rawProfiles ? JSON.parse(rawProfiles) : {};
      setUserProfile(profiles[currentUser.uid] || null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        signUp,
        signIn,
        signOut,
        updateUserProfile,
        setUserProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

