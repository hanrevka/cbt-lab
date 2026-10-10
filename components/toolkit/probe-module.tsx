'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDown, Check, CornerDownRight, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { useCompletions } from '@/hooks/use-completions'
import { tactile } from '@/lib/tactile'
import { autoGrow } from '@/lib/textarea'
import { cn } from '@/lib/utils'
import { BracketButton, ModuleHeader, MonoLabel } from './primitives'

const PROMPT_TEXT = 'If this were true, what would it mean to you?'
const MAX_DEPTH = 6

const SILENT_ASSUMPTIONS = [
  { id: 'perfectionism', label: 'Perfectionism', desc: 'I must never fail or make mistakes.' },
  { id: 'approval', label: 'Approval Addiction', desc: 'Everyone must like and approve of me.' },
  { id: 'love', label: 'Love Addiction', desc: 'I cannot be happy or whole without love.' },
  { id: 'entitlement', label: 'Entitlement', desc: 'Things should always go my way.' },
  { id: 'omnipotence', label: 'Omnipotence', desc: 'I am responsible for everyone else’s feelings.' },
] as const

type AssumptionId = (typeof SILENT_ASSUMPTIONS)[number]['id']

export function ProbeModule() {
  const { log } = useCompletions()
  const [levels, setLevels] = useState<string[]>([''])
  const [isBedrock, setIsBedrock] = useState(false)
  const [selectedAssumption, setSelectedAssumption] = useState<AssumptionId | null>(null)
  const [isConfirmed, setIsConfirmed] = useState(false)

  const currentLevelIndex = levels.length - 1
  const currentLevelText = levels[currentLevelIndex].trim()
  const canDigDeeper = currentLevelText.length > 0 && levels.length < MAX_DEPTH && !isBedrock
  const canHitBedrock = levels.length >= 2 && currentLevelText.length > 0 && !isBedrock

  const handleLevelChange = (index: number, val: string) => {
    setLevels((prev) => prev.map((v, i) => (i === index ? val : v)))
  }

  const handleDigDeeper = () => {
    if (!canDigDeeper) return
    tactile('flip')
    setLevels((prev) => [...prev, ''])
  }

  const handleHitBedrock = () => {
    if (!canHitBedrock) return
    tactile('flip')
    setIsBedrock(true)
  }

  const handleConfirmAssumption = () => {
    if (!selectedAssumption || isConfirmed) return
    tactile('seal')
    setIsConfirmed(true)
    log('probe')
  }

  const handleReset = () => {
    tactile('tick')
    setLevels([''])
    setIsBedrock(false)
    setSelectedAssumption(null)
    setIsConfirmed(false)
  }

  return (
    <div>
      <ModuleHeader
        index="04"
        title="Probe"
        subtitle="Vertical Arrow: assume the negative thought is true and descend downward layer by layer to uncover the silent assumption beneath."
      />

      <div className="relative flex flex-col">
        <AnimatePresence initial={false}>
          {levels.map((value, idx) => {
            const isRoot = idx === 0
            const isLatest = idx === levels.length - 1
            const isReadOnly = idx < levels.length - 1 || isBedrock

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
                className="relative flex flex-col"
                style={{ marginLeft: `${idx * 10}px` }}
              >
                {!isRoot && (
                  <div className="my-2.5 flex items-center gap-2 pl-4">
                    <span className="flex size-5 items-center justify-center rounded-full bg-[#111111] text-white">
                      <ArrowDown className="size-3" aria-hidden="true" />
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/50">
                      {PROMPT_TEXT}
                    </span>
                  </div>
                )}

                <div
                  className={cn(
                    'group relative rounded-[20px] p-5 transition-all',
                    isRoot
                      ? 'border border-[#111111] bg-[#111111] text-white shadow-[0_4px_24px_-4px_rgba(0,0,0,0.15)]'
                      : 'border bg-white text-[#111111] shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)]',
                    isLatest && !isBedrock
                      ? 'border-[#111111] ring-1 ring-[#111111]'
                      : 'border-[#111111]/20',
                  )}
                >
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em]">
                    <label
                      htmlFor={`probe-input-${idx}`}
                      className={isRoot ? 'text-white/60' : 'text-black/55'}
                    >
                      {isRoot ? 'Negative Automatic Thought' : `Subconscious Layer 0${idx}`}
                    </label>
                    <span
                      className={cn(
                        'tabular-nums',
                        isRoot ? 'text-white/40' : 'text-black/40',
                      )}
                    >
                      L{idx + 1}
                    </span>
                  </div>

                  <textarea
                    id={`probe-input-${idx}`}
                    rows={1}
                    value={value}
                    readOnly={isReadOnly}
                    autoFocus={!isRoot && isLatest && !isBedrock}
                    placeholder={
                      isRoot
                        ? 'What is the negative thought?'
                        : 'Then it would mean that...'
                    }
                    ref={(el) => {
                      if (el) autoGrow(el)
                    }}
                    onChange={(e) => {
                      handleLevelChange(idx, e.target.value)
                      autoGrow(e.currentTarget)
                    }}
                    className={cn(
                      'mt-3 w-full resize-none overflow-hidden bg-transparent text-[16px] font-medium leading-snug tracking-tight outline-none',
                      isRoot
                        ? 'text-white placeholder:text-white/30'
                        : 'text-[#111111] placeholder:text-black/30',
                      isReadOnly && 'cursor-default select-text',
                    )}
                  />
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Exploration Controls */}
      {!isBedrock && (
        <div className="mt-6 flex flex-col gap-2">
          <div className="flex gap-2">
            <BracketButton
              onClick={handleDigDeeper}
              disabled={!canDigDeeper}
              className="flex-1 text-[11px]"
            >
              [ DIG DEEPER ]
            </BracketButton>
            <BracketButton
              variant="ghost"
              onClick={handleHitBedrock}
              disabled={!canHitBedrock}
              className="flex-1 text-[11px]"
            >
              [ HIT BEDROCK ]
            </BracketButton>
          </div>
          {levels.length < 2 && (
            <p className="text-center font-mono text-[10px] uppercase tracking-[0.12em] text-black/40">
              Answer the initial thought to unlock deeper layers
            </p>
          )}
        </div>
      )}

      {/* Bedrock Section: Silent Assumption Classification */}
      <AnimatePresence>
        {isBedrock && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', duration: 0.45, bounce: 0.15 }}
            aria-label="Bedrock Silent Assumption"
            className="mt-8 rounded-[20px] border-2 border-[#111111] bg-white p-6 shadow-[0_8px_30px_-6px_rgba(0,0,0,0.1)]"
          >
            <div className="flex items-center justify-between border-b border-black/10 pb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-black/50">
              <span>Bedrock Reached</span>
              <span className="font-semibold text-[#111111]">Core Schema</span>
            </div>

            <div className="mt-4 border-l-2 border-[#111111] pl-3.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/45">
                Underlying Belief
              </span>
              <p className="mt-1 text-[18px] font-semibold leading-snug text-[#111111]">
                &ldquo;{levels[levels.length - 1].trim()}&rdquo;
              </p>
            </div>

            <div className="mt-6">
              <MonoLabel className="text-[#111111]">
                Classify Silent Assumption
              </MonoLabel>
              <div className="mt-3 flex flex-col gap-1.5">
                {SILENT_ASSUMPTIONS.map((item) => {
                  const selected = selectedAssumption === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      disabled={isConfirmed}
                      onClick={() => {
                        tactile('tick')
                        setSelectedAssumption(item.id)
                      }}
                      className={cn(
                        'flex items-center justify-between rounded-xl border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-black',
                        selected
                          ? 'border-[#111111] bg-[#111111] text-white'
                          : 'border-black/15 bg-transparent text-black/75 hover:border-black/40',
                        isConfirmed && !selected && 'opacity-40',
                      )}
                    >
                      <div className="pr-2">
                        <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em]">
                          {item.label}
                        </div>
                        <div
                          className={cn(
                            'mt-0.5 text-xs',
                            selected ? 'text-white/70' : 'text-black/50',
                          )}
                        >
                          {item.desc}
                        </div>
                      </div>
                      {selected && (
                        <Check className="size-4 shrink-0 text-white" aria-hidden="true" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {!isConfirmed ? (
              <BracketButton
                onClick={handleConfirmAssumption}
                disabled={!selectedAssumption}
                className="mt-6 w-full text-[11px]"
              >
                [ CONFIRM &amp; ARCHIVE BEDROCK ]
              </BracketButton>
            ) : (
              <div className="mt-6 flex flex-col items-center gap-3">
                <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[#111111]">
                  <Check className="size-4" aria-hidden="true" />
                  Assumption Identified &amp; Logged
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-black/50 transition-colors hover:text-[#111111] focus-visible:outline-2 focus-visible:outline-black"
                >
                  <RotateCcw className="size-3.5" aria-hidden="true" />
                  Start New Descent
                </button>
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  )
}