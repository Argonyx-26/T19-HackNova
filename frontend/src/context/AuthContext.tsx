import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserRole, UserProfile } from '../types';

export const PRESET_USERS: Record<UserRole, UserProfile> = {
  jury: {
    id: 'usr_jury_99',
    name: 'Jury Evaluator',
    email: 'jury.judge@argonyx.edu',
    role: 'jury',
    roleTitle: 'Hackathon Judge / Jury Evaluator',
    clearance: 'Jury Evaluator Mode',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    department: 'Hackathon Evaluation Board',
    loginTime: new Date().toLocaleTimeString()
  },
  admin: {
    id: 'usr_admin_01',
    name: 'Alex Mercer',
    email: 'a.mercer@sentinelx.sec',
    role: 'admin',
    roleTitle: 'Chief Security Officer & Admin',
    clearance: 'Tier-1 Alpha Clearance',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    department: 'Global Security Operations',
    loginTime: new Date().toLocaleTimeString()
  },
  analyst: {
    id: 'usr_analyst_04',
    name: 'Elena Rostova',
    email: 'e.rostova@sentinelx.sec',
    role: 'analyst',
    roleTitle: 'Senior Threat Intelligence Analyst',
    clearance: 'Tier-2 Bravo Clearance',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    department: 'Cyber Physical Intelligence',
    loginTime: new Date().toLocaleTimeString()
  }
};

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (role: UserRole, customName?: string, customEmail?: string) => void;
  logout: () => void;
  switchUserRole: (role: UserRole) => void;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('sentinel_user_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved session', e);
      }
    }
    // Default to Jury Evaluator for instant zero-friction demoing
    return PRESET_USERS.jury;
  });

  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('sentinel_user_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('sentinel_user_session');
    }
  }, [user]);

  const login = (role: UserRole, customName?: string, customEmail?: string) => {
    const baseUser = PRESET_USERS[role] || PRESET_USERS.jury;
    const updatedUser: UserProfile = {
      ...baseUser,
      name: customName || baseUser.name,
      email: customEmail || baseUser.email,
      loginTime: new Date().toLocaleTimeString()
    };
    setUser(updatedUser);
    setShowLoginModal(false);
  };

  const logout = () => {
    setUser(null);
    setShowLoginModal(true);
  };

  const switchUserRole = (role: UserRole) => {
    login(role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        switchUserRole,
        showLoginModal,
        setShowLoginModal
      }}
    >
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
