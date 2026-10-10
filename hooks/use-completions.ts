'use client'

import { useCallback, useSyncExternalStore } from 'react'

export type ModuleId = 'gap' | 'action' | 'probe' | 'judo'
type Completions = Record<ModuleId, number>

const STORAGE_KEY = 'coglab.completions.v1'
const EMPTY: Completions = { gap: 0, action: 0, probe: 0, judo: 0 }
const listeners = new Set<() => void>()
let cache: Completions | null = null

function read(): Completions {
  if (cache) return cache
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    cache = raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<Completions>) } : EMPTY
  } catch {
    cache = EMPTY
  }
  return cache
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useCompletions() {
  const completions = useSyncExternalStore(subscribe, read, () => EMPTY)

  const log = useCallback((module: ModuleId) => {
    const current = read()
    cache = { ...current, [module]: current[module] + 1 }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache))
    } catch {}
    listeners.forEach((listener) => listener())
  }, [])

  const total = completions.gap + completions.action + completions.probe + completions.judo

  return { completions, total, log }
}
