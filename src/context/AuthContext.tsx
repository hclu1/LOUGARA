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

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, role?: UserRole, name?: string) => Promise<boolean>;
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
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: UserProfile = JSON.parse(stored);
          // Recalculate role to enforce emails rule
          const cleanEmail = parsed.email.trim().toLowerCase();
          if (cleanEmail === SUPER_ADMIN_EMAIL.toLowerCase()) {
            parsed.role = 'super_admin';
          } else if (cleanEmail === 'asherilla4@gmail.com'.toLowerCase()) {
            parsed.role = 'moderator';
          }
          setUser(parsed);
        }
      }
    } catch (e) {
      console.error('Erreur chargement session auth:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, customRole?: UserRole, name?: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    let assignedRole: UserRole = customRole || 'visitor';

    // Règle stricte d'attribution automatique des rôles pour les adresses modérateurs
    if (cleanEmail === SUPER_ADMIN_EMAIL.toLowerCase()) {
      assignedRole = 'super_admin';
    } else if (cleanEmail === 'asherilla4@gmail.com'.toLowerCase()) {
      assignedRole = 'moderator';
    }

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      email: cleanEmail,
      role: assignedRole,
      firstName: name || (cleanEmail.includes('asherilla') ? 'Asherilla' : cleanEmail.includes('champag') ? 'ChampagCrypt' : 'Utilisateur'),
      lastName: assignedRole.includes('admin') || assignedRole === 'moderator' ? 'Modérateur' : 'B2B',
      accountStatus: 'active',
    };

    setUser(newUser);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      }
    } catch (e) {}
    return true;
  };

  const logout = () => {
    setUser(null);
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {}
  };

  const isModerator = Boolean(
    user &&
      (user.role === 'moderator' ||
        user.role === 'super_admin' ||
        MODERATOR_EMAILS.includes(user.email.toLowerCase()))
  );

  const isSuperAdmin = Boolean(
    user && (user.role === 'super_admin' || user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase())
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
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
