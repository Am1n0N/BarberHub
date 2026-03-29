'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface ShopInfo {
  id: string;
  name: string;
  slug: string;
}

export function useShop() {
  const [shop, setShop] = useState<ShopInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      setLoading(false);
      return;
    }

    api.getMe()
      .then((user) => {
        if (user.shop) {
          setShop(user.shop);
        }
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load shop');
      })
      .finally(() => setLoading(false));
  }, []);

  return { shop, loading, error };
}
