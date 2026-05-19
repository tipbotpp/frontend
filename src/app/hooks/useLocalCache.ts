import { useCallback, useEffect, useRef } from 'react';
import { createStore } from 'tinybase';

const store = createStore();

store.setTable('users', {});
store.setTable('streamers', {});
store.setTable('balance', {});
store.setTable('donations', {});

store.setValue('lastSync', 0);
store.setValue('isOnline', navigator.onLine);

window.addEventListener('online', () => store.setValue('isOnline', true));
window.addEventListener('offline', () => store.setValue('isOnline', false));

export function useLocalCache() {
  // 🔥 Исправление: useRef с начальным значением
  const listenerIdRef = useRef<string | undefined>(undefined);

  const cacheData = useCallback((table: string, id: string, data: any) => {
    store.setRow(table, String(id), data);
    store.setValue('lastSync', Date.now());
  }, []);

  const getCached = useCallback(<T = any>(table: string, id: string): T | null => {
    return store.getRow(table, String(id)) as T | null;
  }, []);

  const isCacheFresh = useCallback((maxAge: number = 60000): boolean => {
    const lastSync = store.getValue('lastSync') as number;
    return Date.now() - lastSync < maxAge;
  }, []);

  const onCacheChange = useCallback((table: string, callback: () => void) => {
    // 🔥 Исправление: addRowListener возвращает string (listenerId)
    const listenerId = store.addRowListener(table, null, callback);
    listenerIdRef.current = listenerId;
    return () => store.delListener(listenerId);
  }, []);

  useEffect(() => {
    return () => {
      if (listenerIdRef.current) {
        store.delListener(listenerIdRef.current);
      }
    };
  }, []);

  const isOnline = store.getValue('isOnline') as boolean;

  return {
    cacheData,
    getCached,
    isCacheFresh,
    onCacheChange,
    store,
    isOnline,
  };
}