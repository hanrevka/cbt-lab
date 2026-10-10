'use client'

import { motion } from 'framer-motion'
import { Volume2, VolumeX } from 'lucide-react'
import { useState } from 'react'
import { setTactileMuted, tactile } from '@/lib/tactile'

export function TopBar({ resolved }: { resolved: number }) {
  const [soundOn, setSoundOn] = useState(true)

  const toggleSound = () => {
    const next = !soundOn
    setSoundOn(next)
    setTactileMuted(!next)
    if (next) tactile('tick')
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[#111111]/10 bg-[#E6E6E4]/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-md items-center justify-between gap-3 px-5">
        <h1 className="truncate font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#111111]">
          COG.LAB <span className="text-black/35">{'//'}</span> Burns Techniques
        </h1>
        <div className="flex shrink-0 items-center gap-2">
          <p
            aria-live="polite"
            className="flex items-center gap-1.5 rounded-full border border-[#111111] px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#111111]"
          >
            <motion.span
              key={resolved}
              initial={{ y: -6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="tabular-nums"
            >
              {String(resolved).padStart(2, '0')}
            </motion.span>
            Resolved
          </p>
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={soundOn}
            aria-label={soundOn ? 'Mute sounds' : 'Enable sounds'}
            className="flex size-8 items-center justify-center rounded-full text-[#111111] transition-colors hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-[#111111]"
          >
            {soundOn ? <Volume2 className="size-4" aria-hidden="true" /> : <VolumeX className="size-4" aria-hidden="true" />}
          </button>
        </div>
      </div>
    </header>
  )
}
