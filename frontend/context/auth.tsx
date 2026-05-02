import { User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

type AuthContextType = {
  user: User | null;
  userEmail: string | null;
  userId: string | null;
  profilePicture: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  updateEmail: (email: string) => Promise<boolean>;
  updateProfilePicture: (uri: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const email = session.user.email ?? '';
        const provider = session.user.app_metadata?.provider;
        if (provider === 'google' && !email.endsWith('@sjsu.edu')) {
          await supabase.auth.signOut();
          return;
        }
      }
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle deep links — email verification and OAuth callbacks
  // Password reset URLs are handled by the reset-password screen itself
  useEffect(() => {
    async function handleUrl(url: string) {
      if (!url || url.includes('reset-password')) return;
      try {
        await supabase.auth.exchangeCodeForSession(url);
      } catch {}
    }

    Linking.getInitialURL().then(url => { if (url) handleUrl(url); });
    const sub = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    return () => sub.remove();
  }, []);

  // Load avatar whenever the user changes
  useEffect(() => {
    if (!user) { setProfilePicture(null); return; }
    supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single()
      .then(({ data }) => { if (data?.avatar_url) setProfilePicture(data.avatar_url); });
  }, [user?.id]);

  async function signIn(email: string, password: string): Promise<string | null> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  }

  async function signUp(email: string, password: string): Promise<string | null> {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return error.message;
    if (data.user?.identities?.length === 0) return 'An account with this email already exists.';
    return null;
  }

  async function signOut() {
    await supabase.auth.signOut();
    setProfilePicture(null);
  }

  async function updateEmail(email: string): Promise<boolean> {
    if (!email.endsWith('@sjsu.edu')) return false;
    const { error } = await supabase.auth.updateUser({ email });
    return !error;
  }

  async function updateProfilePicture(uri: string): Promise<void> {
    if (!user) return;
    const response = await fetch(uri);
    const blob = await response.blob();
    const filePath = `${user.id}/avatar.jpg`;

    const { error } = await supabase.storage
      .from('avatars')
      .upload(filePath, blob, { contentType: 'image/jpeg', upsert: true });
    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

    await supabase.from('profiles').upsert({ id: user.id, avatar_url: publicUrl });
    setProfilePicture(publicUrl);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userEmail: user?.email ?? null,
        userId: user?.id ?? null,
        profilePicture,
        loading,
        signIn,
        signUp,
        signOut,
        updateEmail,
        updateProfilePicture,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
