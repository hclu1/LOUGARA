'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'visitor' | 'entrepreneur' | 'supplier' | 'moderator' | 'super_admin';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  accountStatus: 'pending' | 'active' | 'suspended' | 'rejected' | 'archived';
}

export const MODERATOR_EMAILS = [
  'asherilla4@gmail.com',
  'champagcrypt@gmail.com',
];

export const SUPER_ADMIN_EMAIL = 'champagcrypt@gmail.com';

interface LoginResult {
  success: boolean;
  error?: string;
  user?: UserProfile;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password?: string, name?: string) => Promise<boolean>;
  loginWithPassword: (
    email: string,
    password: string,
    requireAdmin?: boolean
  ) => Promise<LoginResult>;
  logout: () => void;
  isModerator: boolean;
  isSuperAdmin: boolean;
  isAuthorizedEmail: (email: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'lougara_auth_user_v2';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthorizedEmail = (email: string): boolean => {
    if (!email) return false;
    const cleanEmail = email.trim().toLowerCase();
    return MODERATOR_EMAILS.includes(cleanEmail);
  };

  useEffect(() => {
    let active = true;

    async function loadSession() {
      try {
        // 1. Vérifier la session serveur signée (cookie HttpOnly)
        const res = await fetch('/api/auth/login', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            if (active) {
              setUser(data.user);
              if (typeof window !== 'undefined') {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
              }
            }
            return;
          }
        }

        // 2. Fallback localStorage uniquement pour les sessions non-admin (empêche toute usurpation admin locale)
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            const parsed: UserProfile = JSON.parse(stored);
            const cleanEmail = (parsed.email || '').trim().toLowerCase();
            const isAdminCandidate =
              parsed.role === 'moderator' ||
              parsed.role === 'super_admin' ||
              MODERATOR_EMAILS.includes(cleanEmail);

            if (isAdminCandidate) {
              // Un compte admin doit impérativement avoir un cookie de session serveur valide
              localStorage.removeItem(STORAGE_KEY);
              if (active) setUser(null);
            } else if (active) {
              setUser(parsed);
            }
          }
        }
      } catch (e) {
        console.error('Erreur chargement session auth:', e);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadSession();

    return () => {
      active = false;
    };
  }, []);

  const loginWithPassword = async (
    email: string,
    password: string,
    requireAdmin = false
  ): Promise<LoginResult> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          requireAdmin,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.user) {
        return {
          success: false,
          error: data.error || 'Identifiants invalides.',
        };
      }

      setUser(data.user);
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
        }
      } catch {}

      return {
        success: true,
        user: data.user,
      };
    } catch {
      return {
        success: false,
        error: 'Erreur réseau lors de la vérification des identifiants.',
      };
    }
  };

  const login = async (email: string, password?: string): Promise<boolean> => {
    const result = await loginWithPassword(email, password || '', false);
    return result.success;
  };

  const logout = () => {
    setUser(null);
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {}
    fetch('/api/auth/login', { method: 'DELETE' }).catch(() => {});
  };

  const isModerator = Boolean(
    user &&
      (user.role === 'moderator' || user.role === 'super_admin') &&
      MODERATOR_EMAILS.includes(user.email.toLowerCase())
  );

  const isSuperAdmin = Boolean(
    user &&
      user.role === 'super_admin' &&
      user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        loginWithPassword,
        logout,
        isModerator,
        isSuperAdmin,
        isAuthorizedEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l’intérieur d’un AuthProvider');
  }
  return context;
};
