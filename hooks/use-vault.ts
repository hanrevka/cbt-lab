{\rtf1\ansi\ansicpg1252\cocoartf2709
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx566\tx1133\tx1700\tx2267\tx2834\tx3401\tx3968\tx4535\tx5102\tx5669\tx6236\tx6803\pardirnatural\partightenfactor0

\f0\fs24 \cf0 'use client'\
\
import \{ useCallback, useSyncExternalStore \} from 'react'\
\
export type VaultModuleId = 'reframe' | 'gap' | 'action' | 'probe' | 'judo'\
\
export type VaultEntry = \{\
  id: string\
  timestamp: number\
  module: VaultModuleId\
  payload: Record<string, unknown>\
\}\
\
const STORAGE_KEY = 'coglab.vault.v1'\
const EMPTY_VAULT: VaultEntry[] = []\
\
const listeners = new Set<() => void>()\
let memoryCache: VaultEntry[] | null = null\
\
function notifyListeners() \{\
  listeners.forEach((listener) => listener())\
\}\
\
function readVault(): VaultEntry[] \{\
  if (memoryCache) return memoryCache\
\
  if (typeof window === 'undefined') return EMPTY_VAULT\
\
  try \{\
    const raw = window.localStorage.getItem(STORAGE_KEY)\
    if (!raw) \{\
      memoryCache = EMPTY_VAULT\
      return memoryCache\
    \}\
    const parsed: unknown = JSON.parse(raw)\
    if (Array.isArray(parsed)) \{\
      // Validate basic shape and ensure sorting by timestamp descending\
      const validEntries = (parsed as VaultEntry[]).filter(\
        (item) => item && typeof item.id === 'string' && typeof item.timestamp === 'number',\
      )\
      memoryCache = validEntries.sort((a, b) => b.timestamp - a.timestamp)\
    \} else \{\
      memoryCache = EMPTY_VAULT\
    \}\
  \} catch \{\
    memoryCache = EMPTY_VAULT\
  \}\
\
  return memoryCache\
\}\
\
function writeVault(next: VaultEntry[]) \{\
  // Sort newest first\
  const sorted = [...next].sort((a, b) => b.timestamp - a.timestamp)\
  memoryCache = sorted\
\
  if (typeof window !== 'undefined') \{\
    try \{\
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted))\
    \} catch \{\}\
  \}\
\
  notifyListeners()\
\}\
\
function subscribe(listener: () => void) \{\
  listeners.add(listener)\
\
  const handleStorageEvent = (event: StorageEvent) => \{\
    if (event.key !== STORAGE_KEY) return\
    memoryCache = null\
    listener()\
  \}\
\
  if (typeof window !== 'undefined') \{\
    window.addEventListener('storage', handleStorageEvent)\
  \}\
\
  return () => \{\
    listeners.delete(listener)\
    if (typeof window !== 'undefined') \{\
      window.removeEventListener('storage', handleStorageEvent)\
    \}\
  \}\
\}\
\
export function useVault() \{\
  const entries = useSyncExternalStore(subscribe, readVault, () => EMPTY_VAULT)\
\
  const saveLog = useCallback((module: VaultModuleId, payload: Record<string, unknown>) => \{\
    const newEntry: VaultEntry = \{\
      id: crypto.randomUUID(),\
      timestamp: Date.now(),\
      module,\
      payload,\
    \}\
    const current = readVault()\
    writeVault([newEntry, ...current])\
    return newEntry\
  \}, [])\
\
  const exportBackup = useCallback(() => \{\
    const current = readVault()\
    const jsonString = JSON.stringify(current, null, 2)\
    const blob = new Blob([jsonString], \{ type: 'application/json' \})\
    const url = URL.createObjectURL(blob)\
\
    const anchor = document.createElement('a')\
    anchor.href = url\
    anchor.download = 'cog-lab-backup.json'\
    document.body.appendChild(anchor)\
    anchor.click()\
    document.body.removeChild(anchor)\
\
    URL.revokeObjectURL(url)\
  \}, [])\
\
  const importBackup = useCallback((file: File): Promise<\{ count: number \}> => \{\
    return new Promise((resolve, reject) => \{\
      const reader = new FileReader()\
\
      reader.onload = (e) => \{\
        try \{\
          const content = e.target?.result\
          if (typeof content !== 'string') \{\
            throw new Error('Invalid file format.')\
          \}\
\
          const parsed: unknown = JSON.parse(content)\
          if (!Array.isArray(parsed)) \{\
            throw new Error('Imported JSON is not an array of entries.')\
          \}\
\
          const importedEntries = (parsed as VaultEntry[]).filter(\
            (item) =>\
              item &&\
              typeof item.id === 'string' &&\
              typeof item.timestamp === 'number' &&\
              typeof item.module === 'string' &&\
              item.payload &&\
              typeof item.payload === 'object',\
          )\
\
          const current = readVault()\
          const existingIds = new Set(current.map((item) => item.id))\
\
          // Filter duplicates by id\
          const newUniqueEntries = importedEntries.filter((item) => !existingIds.has(item.id))\
          const merged = [...newUniqueEntries, ...current]\
\
          writeVault(merged)\
          resolve(\{ count: newUniqueEntries.length \})\
        \} catch (err) \{\
          reject(err)\
        \}\
      \}\
\
      reader.onerror = () => \{\
        reject(new Error('Failed to read file.'))\
      \}\
\
      reader.readAsText(file)\
    \})\
  \}, [])\
\
  return \{\
    entries,\
    saveLog,\
    exportBackup,\
    importBackup,\
  \}\
\}}