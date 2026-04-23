import React, { createContext, useContext, useState } from 'react';

type AuthContextType = {
  userEmail: string | null;
  profilePicture: string | null;
  signIn: (email: string) => void;
  signOut: () => void;
  updateEmail: (email: string) => boolean;
  updateProfilePicture: (uri: string) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  function signIn(email: string) {
    setUserEmail(email);
  }

  function signOut() {
    setUserEmail(null);
    setProfilePicture(null);
  }

  function updateEmail(email: string): boolean {
    if (!email.endsWith('@sjsu.edu')) return false;
    setUserEmail(email);
    return true;
  }

  function updateProfilePicture(uri: string) {
    setProfilePicture(uri);
  }

  return (
    <AuthContext.Provider value={{ userEmail, profilePicture, signIn, signOut, updateEmail, updateProfilePicture }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
