'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { DISTORTION_BY_ID, type ResolvedEntry } from '@/lib/distortions'
import { tactile } from '@/lib/tactile'
import { cn } from '@/lib/utils'

const dateFormat = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: '2-digit',
})

type ResolvedDeckProps = {
  entries: ResolvedEntry[]
  onRemove: (id: string) => void
}

export function ResolvedDeck({ entries, onRemove }: ResolvedDeckProps) {
  const [openId, setOpenId] = useState<string | null>(null)
  const count = entries.length

  return (
    <section id="archive-deck" aria-labelledby="deck-heading" className="mt-10">
      <div aria-hidden="true" className="mx-auto flex flex-col items-center gap-[3px]">
        {[0.35, 0.22, 0.12].map((opacity, i) => (
          <motion.div
            key={i}
            className="h-1.5 rounded-b-md bg-[#111111]"
            initial={false}
            animate={{ opacity: count > i ? opacity * 2 : 0.08, width: `${92 - i * 6}%` }}
          />
        ))}
      </div>

      <header className="mt-5 flex items-end justify-between border-b border-[#111111] pb-3">
        <h2 id="deck-heading" className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#111111]">
          Shattered Thoughts
        </h2>
        <motion.span
          key={count}
          initial={{ y: -6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="font-mono text-3xl font-semibold leading-none tracking-tight tabular-nums text-[#111111]"
          aria-live="polite"
        >
          {String(count).padStart(3, '0')}
        </motion.span>
      </header>

      {count === 0 ? (
        <p className="py-8 text-sm leading-relaxed text-black/45">
          The deck is empty. Shatter a thought and seal its rational fact to file your first card here.
        </p>
      ) : (
        <ul className="flex flex-col">
          <AnimatePresence initial={false}>
            {entries.map((entry, index) => {
              const open = openId === entry.id
              const panelId = `entry-${entry.id}`
              return (
                <motion.li
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, y: -12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
                  className="overflow-hidden border-b border-black/10"
                >
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => {
                      tactile('tick')
                      setOpenId(open ? null : entry.id)
                    }}
                    className="flex w-full items-center gap-4 py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111]"
                  >
                    <span className="w-9 shrink-0 font-mono text-[11px] tabular-nums text-black/40">
                      {String(count - index).padStart(3, '0')}
                    </span>
                    <span
                      className={cn(
                        'min-w-0 flex-1 text-[15px] leading-snug text-black/50 line-through decoration-black/50',
                        !open && 'truncate',
                      )}
                    >
                      {entry.thought}
                    </span>
                    <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-black/40">
                      {dateFormat.format(entry.createdAt)}
                    </span>
                    <Plus
                      aria-hidden="true"
                      className={cn('size-4 shrink-0 text-[#111111] transition-transform duration-200', open && 'rotate-45')}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        id={panelId}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: 'spring', duration: 0.35, bounce: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mb-4 grid grid-cols-1 overflow-hidden rounded-xl">
                          <div className="bg-[#111111] p-4 text-white">
                            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/50">
                              Automatic Thought
                            </p>
                            <p className="mt-2 whitespace-pre-wrap break-words text-base leading-snug text-white/50 line-through decoration-white/80">
                              {entry.thought}
                            </p>
                            <ul className="mt-3 flex flex-wrap gap-1" aria-label="Distortions">
                              {entry.distortions.map((id) => (
                                <li
                                  key={id}
                                  className="rounded-full border border-white/25 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.06em] text-white/70"
                                >
                                  {DISTORTION_BY_ID[id]?.label ?? id}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="bg-white p-4 text-[#111111]">
                            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-black/45">
                              Rational Fact
                            </p>
                            <p className="mt-2 whitespace-pre-wrap break-words text-base font-medium leading-snug">
                              {entry.rational}
                            </p>
                            <div className="mt-4 flex justify-end">
                              <button
                                type="button"
                                onClick={() => {
                                  tactile('tick')
                                  setOpenId(null)
                                  onRemove(entry.id)
                                }}
                                className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-black/40 transition-colors hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                              >
                                <Trash2 className="size-3" aria-hidden="true" />
                                Discard
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ul>
      )}
    </section>
  )
}
