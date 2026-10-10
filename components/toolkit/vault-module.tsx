'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Download, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { useVault, type VaultEntry } from '@/hooks/use-vault'
import { tactile } from '@/lib/tactile'
import { BracketButton, ModuleHeader, MonoLabel } from './primitives'

const DATE_FORMAT = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

const MODULE_TITLES: Record<string, string> = {
  reframe: '01 / REFRAME',
  gap: '02 / GAP TEST',
  action: '03 / ACTION',
  probe: '04 / PROBE',
  judo: '05 / JUDO',
}

export function VaultModule() {
  const { entries, exportBackup, importBackup } = useVault()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const handleExport = () => {
    tactile('seal')
    exportBackup()
    setStatusMessage('Backup exported successfully.')
    setTimeout(() => setStatusMessage(null), 3500)
  }

  const handleImportClick = () => {
    tactile('tick')
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const res = await importBackup(file)
      tactile('seal')
      setStatusMessage(`Imported ${res.count} new entry/entries.`)
    } catch {
      setStatusMessage('Error: Failed to parse backup file.')
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      setTimeout(() => setStatusMessage(null), 3500)
    }
  }

  return (
    <div>
      <ModuleHeader
        index="06"
        title="Vault // Archive"
        subtitle="Local-first chronological log of all reframed thoughts, behavioral tests, ignitions, vertical probes, and verbal judo drills."
      />

      {/* Backup Controls */}
      <div className="rounded-[20px] border border-[#111111]/15 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between border-b border-black/10 pb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-black/55">
          <span>Data Management</span>
          <span className="tabular-nums">
            {String(entries.length).padStart(3, '0')} Records
          </span>
        </div>

        <div className="mt-4 flex gap-2">
          <BracketButton
            variant="dark"
            onClick={handleExport}
            className="flex-1 gap-1.5 text-[10px]"
          >
            <Download className="size-3.5" aria-hidden="true" />
            [ EXPORT BACKUP ]
          </BracketButton>

          <BracketButton
            variant="ghost"
            onClick={handleImportClick}
            className="flex-1 gap-1.5 text-[10px]"
          >
            <Upload className="size-3.5" aria-hidden="true" />
            [ IMPORT BACKUP ]
          </BracketButton>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Upload JSON backup file"
        />

        {statusMessage && (
          <p
            role="status"
            className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-black/60"
          >
            {statusMessage}
          </p>
        )}
      </div>

      {/* Receipts Timeline */}
      <section aria-labelledby="vault-history-heading" className="mt-8">
        <div className="flex items-end justify-between border-b border-[#111111] pb-3">
          <h3
            id="vault-history-heading"
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#111111]"
          >
            Chronological Receipts
          </h3>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/45">
            Local Ledger
          </span>
        </div>

        {entries.length === 0 ? (
          <div className="py-14 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-black/40">
            NO RECORDS FOUND.
          </div>
        ) : (
          <ul className="flex flex-col">
            <AnimatePresence initial={false}>
              {entries.map((entry) => (
                <motion.li
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-b border-[#111111]/15 py-5"
                >
                  <ReceiptCard entry={entry} />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </section>
    </div>
  )
}

function ReceiptCard({ entry }: { entry: VaultEntry }) {
  const formattedDate = DATE_FORMAT.format(new Date(entry.timestamp))
  const moduleLabel = MODULE_TITLES[entry.module] ?? entry.module.toUpperCase()
  const payloadEntries = Object.entries(entry.payload)

  return (
    <article className="rounded-xl border border-black/10 bg-white p-4 font-mono shadow-[0_2px_10px_-2px_rgba(0,0,0,0.03)]">
      <header className="flex items-center justify-between border-b border-dashed border-black/20 pb-2.5 text-[10px] uppercase tracking-[0.14em]">
        <span className="font-semibold text-[#111111]">{moduleLabel}</span>
        <span className="text-black/50 tabular-nums">{formattedDate}</span>
      </header>

      <div className="mt-3 flex flex-col gap-2 font-sans text-xs">
        {payloadEntries.map(([key, value]) => {
          const displayKey = key
            .replace(/([A-Z])/g, ' $1')
            .replace(/_/g, ' ')
            .toUpperCase()

          return (
            <div key={key} className="border-l-2 border-black/20 pl-2.5">
              <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-black/45">
                {displayKey}
              </span>
              <p className="mt-0.5 whitespace-pre-wrap break-words font-medium leading-relaxed text-[#111111]">
                {typeof value === 'object' && value !== null
                  ? Array.isArray(value)
                    ? value.join(' / ')
                    : JSON.stringify(value)
                  : String(value)}
              </p>
            </div>
          )
        })}
      </div>

      <footer className="mt-3 flex items-center justify-between border-t border-dashed border-black/20 pt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-black/35">
        <span>REC #{entry.id.slice(0, 8)}</span>
        <span>VERIFIED LOG</span>
      </footer>
    </article>
  )
}
export default VaultModule;
