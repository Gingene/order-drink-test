import { useState, useEffect } from 'react';
import type { StoreMenu, StoreIndex, StoreInfo } from '../types';
import { fetchStoreIndex, fetchMenu } from '../utils/menuStorage';

export function useStoreIndex() {
  const [stores, setStores] = useState<StoreInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStoreIndex()
      .then((data: StoreIndex) => setStores(data.stores))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { stores, loading, error, setStores };
}

export function useMenu(storeId: string | null, menuFile: string | null) {
  const [menu, setMenu] = useState<StoreMenu | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storeId || !menuFile) {
      setMenu(null);
      return;
    }

    setLoading(true);
    setError(null);

    fetchMenu(storeId, menuFile)
      .then(setMenu)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [storeId, menuFile]);

  return { menu, loading, error, setMenu };
}
