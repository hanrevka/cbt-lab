'use client'

import { motion } from 'framer-motion'
import { useId, useState } from 'react'
import { DISTORTIONS, DISTORTION_BY_ID, type DistortionId } from '@/lib/distortions'
import { autoGrow, isSubmitShortcut } from '@/lib/textarea'
import { cn } from '@/lib/utils'

type CardFrontProps = {
  cardNumber: string
  thought: string
  onThoughtChange: (value: string) => void
  selected: DistortionId[]
  onToggle: (id: DistortionId) => void
  struck: boolean
  canShatter: boolean
  onShatter: () => void
  hidden: boolean
  collapsed?: boolean
}

export function CardFront({
  cardNumber,
  thought,
  onThoughtChange,
  selected,
  onToggle,
  struck,
  canShatter,
  onShatter,
  hidden,
  collapsed = false,
}: CardFrontProps) {
  const inputId = useId()
  const [lastToggled, setLastToggled] = useState<DistortionId | null>(null)
  const inspectedId =
    lastToggled && selected.includes(lastToggled) ? lastToggled : selected[selected.length - 1]
  const inspected = inspectedId ? DISTORTION_BY_ID[inspectedId] : null

  return (
    <section
      aria-label="Automatic thought"
      inert={hidden}
      style={collapsed ? { visibility: 'hidden' } : undefined}
      className="flex min-h-[560px] flex-col rounded-[20px] bg-[#111111] p-6 text-white shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_30px_60px_-20px_rgba(0,0,0,0.45)] [grid-area:1/1] [backface-visibility:hidden] [-webkit-backface-visibility:hidden]"
    >
      <header className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-white/50">
        <label htmlFor={inputId} className="text-white/70">
          Automatic Thought
        </label>
        <span className="tabular-nums">
          No.{cardNumber} &middot; 01/02
        </span>
      </header>
      <div className="mt-4 h-px w-full bg-white/15" />

      <div className="mt-6 flex-1">
        {struck ? (
          <p className="whitespace-pre-wrap break-words text-[26px] font-medium leading-[1.15] tracking-tight text-white/45 line-through decoration-white decoration-[4px]">
            {thought}
          </p>
        ) : (
          <textarea
            id={inputId}
            ref={(el) => {
              if (el) autoGrow(el)
            }}
            value={thought}
            rows={3}
            onChange={(e) => {
              onThoughtChange(e.target.value)
              autoGrow(e.currentTarget)
            }}
            onKeyDown={(e) => {
              if (isSubmitShortcut(e)) {
                e.preventDefault()
                onShatter()
              }
            }}
            placeholder="Write the thought exactly as it sounds in your head."
            className="block w-full resize-none overflow-hidden bg-transparent text-[26px] font-medium leading-[1.15] tracking-tight text-white caret-white outline-none placeholder:text-white/25"
          />
        )}
      </div>

      <fieldset className="mt-8">
        <div className="mb-3 flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-white/50">
          <legend className="float-left">Distortions</legend>
          <span className="tabular-nums" aria-live="polite">
            {String(selected.length).padStart(2, '0')}/10
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {DISTORTIONS.map((d) => {
            const active = selected.includes(d.id)
            return (
              <motion.button
                key={d.id}
                type="button"
                aria-pressed={active}
                title={d.hint}
                whileTap={{ scale: 0.94 }}
                transition={{ type: 'spring', duration: 0.2, bounce: 0.4 }}
                onClick={() => {
                  setLastToggled(d.id)
                  onToggle(d.id)
                }}
                className={cn(
                  'rounded-full border px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.06em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
                  active
                    ? 'border-white bg-white text-[#111111]'
                    : 'border-white/20 text-white/70 hover:border-white/50 hover:text-white',
                )}
              >
                {d.label}
              </motion.button>
            )
          })}
        </div>
      </fieldset>

      <div
        aria-live="polite"
        className="mt-5 h-[104px] overflow-hidden border border-white/20 bg-white/[0.04] p-3.5"
      >
        {inspected ? (
          <motion.div
            key={inspected.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm font-bold uppercase tracking-[0.04em] text-white">{inspected.label}</p>
              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/40">Inspect</span>
            </div>
            <p className="mt-1 text-xs leading-snug text-white/70">{inspected.hint}</p>
            <p className="mt-1.5 text-xs italic leading-snug text-white/50">
              {'Ex: \u201C'}
              {inspected.example}
              {'\u201D'}
            </p>
          </motion.div>
        ) : (
          <p className="flex h-full items-center font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">
            Select a distortion to inspect it.
          </p>
        )}
      </div>

      <motion.button
        type="button"
        disabled={!canShatter}
        onClick={onShatter}
        whileTap={canShatter ? { scale: 0.98, y: 2 } : undefined}
        transition={{ type: 'spring', duration: 0.18, bounce: 0.3 }}
        className={cn(
          'mt-3 w-full border-2 py-5 font-mono text-sm font-semibold uppercase tracking-[0.2em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white',
          canShatter
            ? 'border-white bg-white text-[#111111] shadow-[0_4px_0_0_rgba(255,255,255,0.25)] active:shadow-none'
            : 'cursor-not-allowed border-white/15 text-white/25',
        )}
      >
        [ Shatter Thought ]
      </motion.button>
    </section>
  )
}
