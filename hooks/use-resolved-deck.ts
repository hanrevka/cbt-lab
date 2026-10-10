'use client'

import { useCallback, useSyncExternalStore } from 'react'
import type { ResolvedEntry } from '@/lib/distortions'

const STORAGE_KEY = 'reframe.deck.v1'
const EMPTY: ResolvedEntry[] = []
const listeners = new Set<() => void>()
let cache: ResolvedEntry[] | null = null

function read(): ResolvedEntry[] {
  if (cache) return cache
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    cache = Array.isArray(parsed) ? (parsed as ResolvedEntry[]) : []
  } catch {
    cache = []
  }
  return cache
}

function write(next: ResolvedEntry[]) {
  cache = next
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {}
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return
    cache = null
    listener()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

export function useResolvedDeck() {
  const entries = useSyncExternalStore(subscribe, read, () => EMPTY)

  const add = useCallback((entry: ResolvedEntry) => {
    write([entry, ...read()])
  }, [])

  const remove = useCallback((id: string) => {
    write(read().filter((entry) => entry.id !== id))
  }, [])

  return { entries, add, remove }
}
