import React, { createContext, useContext, useState } from 'react';

type AuthContextType = {
  userEmail: string | null;
  signIn: (email: string) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  function signIn(email: string) {
    setUserEmail(email);
  }

  function signOut() {
    setUserEmail(null);
  }

  return (
    <AuthContext.Provider value={{ userEmail, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
