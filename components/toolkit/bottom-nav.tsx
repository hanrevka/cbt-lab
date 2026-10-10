'use client'

import { motion } from 'framer-motion'
import { ArrowDown, RefreshCcw, Scale, Shield, Timer, type LucideIcon } from 'lucide-react'
import { tactile } from '@/lib/tactile'
import { cn } from '@/lib/utils'

export type TabId = 'reframe' | 'gap' | 'action' | 'probe' | 'judo'

export const TABS: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: 'reframe', label: 'Reframe', icon: RefreshCcw },
  { id: 'gap', label: 'Gap Test', icon: Scale },
  { id: 'action', label: 'Action', icon: Timer },
  { id: 'probe', label: 'Probe', icon: ArrowDown },
  { id: 'judo', label: 'Judo', icon: Shield },
]

export function BottomNav({ active, onSelect }: { active: TabId; onSelect: (id: TabId) => void }) {
  return (
    <nav
      aria-label="Techniques"
      className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <div
        role="tablist"
        className="mx-auto grid max-w-md grid-cols-5 gap-1 rounded-[22px] border border-white/10 bg-[#111111]/95 p-1.5 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.5)] backdrop-blur-md"
      >
        {TABS.map(({ id, label, icon: Icon }) => {
          const selected = id === active
          return (
            <button
              key={id}
              id={`tab-${id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`panel-${id}`}
              onClick={() => {
                tactile('tick')
                onSelect(id)
              }}
              className={cn(
                'relative flex h-14 flex-col items-center justify-center gap-1 rounded-2xl transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
                selected ? 'text-[#111111]' : 'text-white/50 hover:text-white',
              )}
            >
              {selected && (
                <motion.span
                  layoutId="nav-active-pill"
                  className="absolute inset-0 rounded-2xl bg-white"
                  transition={{ type: 'spring', duration: 0.45, bounce: 0.2 }}
                />
              )}
              <Icon className="relative size-4" aria-hidden="true" />
              <span className="relative whitespace-nowrap font-mono text-[9px] font-semibold uppercase tracking-[0.1em]">
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
