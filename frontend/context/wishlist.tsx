import React, { createContext, useContext, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';
import { useAuth } from './auth';

type WishlistContextType = {
  savedIds: Set<string>;
  isSaved: (listingId: string) => boolean;
  toggleSave: (listingId: string) => void;
};

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { userId } = useAuth();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!userId) {
      setSavedIds(new Set());
      return;
    }
    supabase
      .from('saved_listings')
      .select('listing_id')
      .eq('user_id', userId)
      .then(({ data }) => {
        if (data) {
          setSavedIds(new Set(data.map((r: { listing_id: string }) => r.listing_id)));
        }
      });
  }, [userId]);

  function isSaved(listingId: string): boolean {
    return savedIds.has(listingId);
  }

  function toggleSave(listingId: string) {
    if (!userId) return;

    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(listingId)) {
        next.delete(listingId);
        supabase.from('saved_listings').delete().eq('user_id', userId).eq('listing_id', listingId);
      } else {
        next.add(listingId);
        supabase.from('saved_listings').insert({ user_id: userId, listing_id: listingId });
      }
      return next;
    });
  }

  return (
    <WishlistContext.Provider value={{ savedIds, isSaved, toggleSave }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
