'use client'

import { useCallback, useSyncExternalStore } from 'react'

export type VaultEntry = {
  id: string
  timestamp: number
  module: 'reframe' | 'gap' | 'action' | 'probe' | 'judo'
  payload: Record<string, any>
}

const VAULT_KEY = 'coglab.vault.v1'

// 核心修复：增加内存缓存，打破 React 的无限死循环
let memoryCache: VaultEntry[] | null = null;

function getEntries(): VaultEntry[] {
  if (memoryCache) return memoryCache;
  if (typeof window === 'undefined') return [];
  try {
    const stored = window.localStorage.getItem(VAULT_KEY);
    memoryCache = stored ? JSON.parse(stored) : [];
    return memoryCache;
  } catch (e) {
    console.error('Failed to parse vault entries', e);
    memoryCache = [];
    return memoryCache;
  }
}

function setEntries(entries: VaultEntry[]) {
  memoryCache = entries;
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(VAULT_KEY, JSON.stringify(entries));
  window.dispatchEvent(new Event('vault-updated'));
}

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('vault-updated', callback);
  return () => window.removeEventListener('vault-updated', callback);
}

export function useVault() {
  const entries = useSyncExternalStore(subscribe, getEntries, () => []);

  const saveLog = useCallback((module: VaultEntry['module'], payload: Record<string, any>) => {
    const newEntry: VaultEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      module,
      payload
    };
    const current = getEntries();
    setEntries([newEntry, ...current]);
  }, []);

  const exportBackup = useCallback(() => {
    const current = getEntries();
    const blob = new Blob([JSON.stringify(current, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cog-lab-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const importBackup = useCallback((file: File): Promise<{ count: number }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target?.result as string) as VaultEntry[];
          if (!Array.isArray(parsed)) throw new Error('Invalid format');
          
          const current = getEntries();
          const existingIds = new Set(current.map(entry => entry.id));
          const newEntries = parsed.filter(entry => entry.id && !existingIds.has(entry.id));
          
          const merged = [...newEntries, ...current].sort((a, b) => b.timestamp - a.timestamp);
          setEntries(merged);
          resolve({ count: newEntries.length });
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }, []);

  return { entries, saveLog, exportBackup, importBackup };
}
