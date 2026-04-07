import React, { createContext, useContext, useState } from 'react';

type WishlistContextType = {
  savedIds: Set<string>;
  isSaved: (listingId: string) => boolean;
  toggleSave: (listingId: string) => void;
};

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  function isSaved(listingId: string): boolean {
    return savedIds.has(listingId);
  }

  function toggleSave(listingId: string) {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(listingId)) {
        next.delete(listingId);
      } else {
        next.add(listingId);
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
