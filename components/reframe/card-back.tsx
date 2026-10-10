'use client'

import { motion } from 'framer-motion'
import { RotateCcw } from 'lucide-react'
import { useId, type RefObject } from 'react'
import { DISTORTION_BY_ID, type DistortionId } from '@/lib/distortions'
import { autoGrow, isSubmitShortcut } from '@/lib/textarea'
import { cn } from '@/lib/utils'

type CardBackProps = {
  cardNumber: string
  thought: string
  distortions: DistortionId[]
  rational: string
  onRationalChange: (value: string) => void
  inputRef: RefObject<HTMLTextAreaElement | null>
  canSeal: boolean
  onSeal: () => void
  onReturn: () => void
  hidden: boolean
  flat?: boolean
}

export function CardBack({
  cardNumber,
  thought,
  distortions,
  rational,
  onRationalChange,
  inputRef,
  canSeal,
  onSeal,
  onReturn,
  hidden,
  flat = false,
}: CardBackProps) {
  const inputId = useId()

  return (
    <section
      aria-label="Rational fact"
      inert={hidden}
      style={{ transform: flat ? 'none' : 'rotateY(180deg)' }}
      className="flex min-h-[560px] flex-col rounded-[20px] bg-white p-6 text-[#111111] shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_30px_60px_-20px_rgba(0,0,0,0.3)] [grid-area:1/1] [backface-visibility:hidden] [-webkit-backface-visibility:hidden]"
    >
      <header className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-black/45">
        <label htmlFor={inputId} className="text-xs font-semibold tracking-[0.2em] text-[#111111]">
          Rational Rebuttal
        </label>
        <span className="tabular-nums">
          No.{cardNumber} &middot; 02/02
        </span>
      </header>
      <div className="mt-4 h-px w-full bg-black/10" />

      <div className="mt-5 border-l-2 border-black/80 pl-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-black/40">
          Replacing
        </p>
        <p className="mt-1 line-clamp-3 break-words text-sm leading-snug text-black/45 line-through decoration-black/60 decoration-2">
          {thought}
        </p>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.06em] text-black/50">
          {distortions.map((id) => DISTORTION_BY_ID[id].label).join(' / ')}
        </p>
      </div>

      <div className="mt-8 flex-1">
        <textarea
          id={inputId}
          ref={inputRef}
          value={rational}
          rows={3}
          onChange={(e) => {
            onRationalChange(e.target.value)
            autoGrow(e.currentTarget)
          }}
          onKeyDown={(e) => {
            if (isSubmitShortcut(e)) {
              e.preventDefault()
              onSeal()
            }
          }}
          placeholder="What is the objective reality based on evidence?"
          className="block w-full resize-none overflow-hidden bg-transparent text-[26px] font-medium leading-[1.15] tracking-tight text-[#111111] caret-[#111111] outline-none placeholder:text-black/20"
        />
      </div>

      <div className="mt-6 flex items-stretch gap-2">
        <button
          type="button"
          onClick={onReturn}
          aria-label="Return to automatic thought"
          className="flex w-14 shrink-0 items-center justify-center border border-black/15 text-black/50 transition-colors hover:border-black hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
        </button>
        <motion.button
          type="button"
          disabled={!canSeal}
          onClick={onSeal}
          whileTap={canSeal ? { scale: 0.98, y: 1 } : undefined}
          transition={{ type: 'spring', duration: 0.18, bounce: 0.3 }}
          className={cn(
            'flex-1 border py-4 font-mono text-xs font-semibold uppercase tracking-[0.2em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black',
            canSeal
              ? 'border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white'
              : 'cursor-not-allowed border-black/10 text-black/25',
          )}
        >
          [ Seal &amp; Archive ]
        </motion.button>
      </div>
    </section>
  )
}
