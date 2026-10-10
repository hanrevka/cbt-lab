'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { User, Users, X } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import { useCompletions } from '@/hooks/use-completions'
import { tactile } from '@/lib/tactile'
import { autoGrow } from '@/lib/textarea'
import { cn } from '@/lib/utils'
import { BracketButton, ModuleHeader, MonoLabel, fieldClass } from './primitives'

type Mode = 'pleasure' | 'procrastination'
type Companion = 'alone' | 'others'

type Experiment = {
  id: string
  mode: Mode
  activity: string
  companion?: Companion
  predicted: number
  actual: number
}

const MODE_META: Record<
  Mode,
  {
    title: string
    tab: string
    metric: string
    hint: string
    placeholder: string
  }
> = {
  pleasure: {
    title: 'Pleasure Prediction',
    tab: 'Pleasure Prediction',
    metric: 'Satisfaction',
    hint: 'Predict your satisfaction before doing an activity alone or with others, then record the real outcome.',
    placeholder: 'e.g. Walk around the block and listen to music',
  },
  procrastination: {
    title: 'Anti-Procrastination',
    tab: 'Anti-Procrastination',
    metric: 'Difficulty',
    hint: 'Dreaded tasks feel monumental beforehand. Predict the difficulty, begin, and record the reality.',
    placeholder: 'e.g. Open the tax folder and reconcile receipts',
  },
}

const SEED_EXPERIMENTS: Experiment[] = [
  {
    id: 'seed-1',
    mode: 'pleasure',
    activity: 'Read chapter in coffee shop',
    companion: 'alone',
    predicted: 25,
    actual: 75,
  },
  {
    id: 'seed-2',
    mode: 'procrastination',
    activity: 'Draft response to contentious email',
    predicted: 85,
    actual: 30,
  },
]

export function GapTestModule() {
  const { log } = useCompletions()
  const [mode, setMode] = useState<Mode>('pleasure')
  const [experiments, setExperiments] = useState<Experiment[]>(SEED_EXPERIMENTS)

  // Input area state
  const [activity, setActivity] = useState('')
  const [companion, setCompanion] = useState<Companion>('alone')
  const [predicted, setPredicted] = useState(50)
  const activityInputRef = useRef<HTMLTextAreaElement>(null)

  const inputActivityId = useId()
  const meta = MODE_META[mode]
  const activeList = experiments.filter((e) => e.mode === mode)

  const handleModeSwitch = (nextMode: Mode) => {
    if (nextMode === mode) return
    tactile('tick')
    setMode(nextMode)
    setActivity('')
    setPredicted(50)
    setCompanion('alone')
    if (activityInputRef.current) {
      activityInputRef.current.style.height = 'auto'
    }
  }

  const handleStartExperiment = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = activity.trim()
    if (!trimmed) return

    tactile('tick')
    const newExperiment: Experiment = {
      id: crypto.randomUUID(),
      mode,
      activity: trimmed,
      companion: mode === 'pleasure' ? companion : undefined,
      predicted,
      actual: predicted,
    }

    setExperiments((prev) => [newExperiment, ...prev])
    setActivity('')
    setPredicted(50)
    if (activityInputRef.current) {
      activityInputRef.current.style.height = 'auto'
    }
  }

  const handleActualChange = (id: string, actual: number) => {
    setExperiments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, actual } : item)),
    )
  }

  const handleRemove = (id: string) => {
    tactile('tick')
    setExperiments((prev) => prev.filter((item) => item.id !== id))
  }

  const handleResolveAndLog = (id: string) => {
    tactile('seal')
    log('gap')
    setExperiments((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <div>
      <ModuleHeader index="02" title="Gap Test" subtitle={meta.hint} />

      {/* Top Mode Toggle */}
      <div
        role="tablist"
        aria-label="Experiment Mode"
        className="relative grid grid-cols-2 rounded-full bg-[#111111] p-1 shadow-sm"
      >
        {(Object.keys(MODE_META) as Mode[]).map((m) => {
          const isSelected = m === mode
          return (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => handleModeSwitch(m)}
              className={cn(
                'relative h-10 rounded-full font-mono text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
                isSelected ? 'text-[#111111]' : 'text-white/60 hover:text-white',
              )}
            >
              {isSelected && (
                <motion.span
                  layoutId="gap-mode-pill"
                  className="absolute inset-0 rounded-full bg-white shadow-sm"
                  transition={{ type: 'spring', duration: 0.4, bounce: 0.18 }}
                />
              )}
              <span className="relative z-10">[ {MODE_META[m].tab} ]</span>
            </button>
          )
        })}
      </div>

      {/* Input Area (New Experiment) */}
      <section
        aria-label="New experiment creation"
        className="mt-6 rounded-[20px] border border-[#111111]/15 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)]"
      >
        <form onSubmit={handleStartExperiment} className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <MonoLabel htmlFor={inputActivityId} className="text-black/55">
              Task / Activity
            </MonoLabel>
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-black/35">
              New Probe
            </span>
          </div>

          <textarea
            id={inputActivityId}
            ref={activityInputRef}
            rows={1}
            value={activity}
            onChange={(e) => {
              setActivity(e.target.value)
              autoGrow(e.currentTarget)
            }}
            placeholder={meta.placeholder}
            className={cn(fieldClass, 'min-h-[46px] resize-none text-[16px] leading-snug')}
          />

          {/* With Whom Toggle (Pleasure Mode Only) */}
          {mode === 'pleasure' && (
            <div>
              <MonoLabel className="text-black/55">With Whom</MonoLabel>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  aria-pressed={companion === 'alone'}
                  onClick={() => {
                    tactile('tick')
                    setCompanion('alone')
                  }}
                  className={cn(
                    'flex h-10 items-center justify-center gap-2 rounded-xl border font-mono text-[11px] font-medium uppercase tracking-[0.1em] transition-colors focus-visible:outline-2 focus-visible:outline-black',
                    companion === 'alone'
                      ? 'border-[#111111] bg-[#111111] text-white'
                      : 'border-black/15 bg-transparent text-black/60 hover:border-black/40',
                  )}
                >
                  <User className="size-3.5" aria-hidden="true" />
                  Alone
                </button>
                <button
                  type="button"
                  aria-pressed={companion === 'others'}
                  onClick={() => {
                    tactile('tick')
                    setCompanion('others')
                  }}
                  className={cn(
                    'flex h-10 items-center justify-center gap-2 rounded-xl border font-mono text-[11px] font-medium uppercase tracking-[0.1em] transition-colors focus-visible:outline-2 focus-visible:outline-black',
                    companion === 'others'
                      ? 'border-[#111111] bg-[#111111] text-white'
                      : 'border-black/15 bg-transparent text-black/60 hover:border-black/40',
                  )}
                >
                  <Users className="size-3.5" aria-hidden="true" />
                  With others
                </button>
              </div>
            </div>
          )}

          {/* Predicted Slider */}
          <div className="mt-1">
            <div className="mb-2 flex items-center justify-between">
              <MonoLabel className="text-black/55">
                Predicted {meta.metric} <span className="text-black/35">(0-100%)</span>
              </MonoLabel>
              <span className="font-mono text-sm font-semibold tabular-nums text-[#111111]">
                {predicted}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={predicted}
              onChange={(e) => setPredicted(Number(e.target.value))}
              className="mono-range"
              style={{ '--fill': `${predicted}%` } as React.CSSProperties}
            />
          </div>

          <BracketButton
            type="submit"
            disabled={!activity.trim()}
            className="mt-2 w-full text-[11px]"
          >
            [ START EXPERIMENT ]
          </BracketButton>
        </form>
      </section>

      {/* Active Experiments Section */}
      <section aria-labelledby="active-experiments-heading" className="mt-8">
        <div className="flex items-end justify-between border-b border-[#111111] pb-3">
          <h3
            id="active-experiments-heading"
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#111111]"
          >
            Active Experiments
          </h3>
          <span className="font-mono text-xs font-semibold tabular-nums text-black/45">
            {String(activeList.length).padStart(2, '0')}
          </span>
        </div>

        <ul className="flex flex-col">
          <AnimatePresence initial={false}>
            {activeList.map((exp) => {
              const gap = exp.actual - exp.predicted
              return (
                <motion.li
                  key={exp.id}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
                  className="overflow-hidden border-b border-[#111111]/10"
                >
                  <div className="py-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[17px] font-medium leading-snug tracking-tight text-[#111111]">
                            {exp.activity}
                          </p>
                          {exp.companion && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-black/15 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-black/60">
                              {exp.companion === 'alone' ? (
                                <User className="size-2.5" aria-hidden="true" />
                              ) : (
                                <Users className="size-2.5" aria-hidden="true" />
                              )}
                              {exp.companion === 'alone' ? 'Alone' : 'With others'}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.1em] text-black/45">
                          Predicted {meta.metric}:{' '}
                          <span className="font-semibold text-[#111111]">{exp.predicted}%</span>
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemove(exp.id)}
                        aria-label={`Remove experiment ${exp.activity}`}
                        className="-mr-1.5 -mt-1 flex size-8 shrink-0 items-center justify-center rounded-full text-black/40 transition-colors hover:text-[#111111]"
                      >
                        <X className="size-4" aria-hidden="true" />
                      </button>
                    </div>

                    {/* Actual Slider */}
                    <div className="mt-4">
                      <div className="mb-2 flex items-center justify-between">
                        <MonoLabel className="text-black/60">
                          Actual {meta.metric} <span className="text-black/35">(0-100%)</span>
                        </MonoLabel>
                        <span className="font-mono text-sm font-semibold tabular-nums text-[#111111]">
                          {exp.actual}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={5}
                        value={exp.actual}
                        onChange={(e) => handleActualChange(exp.id, Number(e.target.value))}
                        className="mono-range mono-range-solid"
                        style={{ '--fill': `${exp.actual}%` } as React.CSSProperties}
                      />
                    </div>

                    {/* Gap metric & Resolve button */}
                    <div className="mt-4 flex items-center justify-between pt-1">
                      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-black/55">
                        Gap{' '}
                        <span
                          className={cn(
                            'text-sm font-bold tabular-nums tracking-normal',
                            gap === 0
                              ? 'text-black/70'
                              : gap > 0
                                ? 'text-[#111111]'
                                : 'text-black/60',
                          )}
                        >
                          {gap > 0 ? `+${gap}%` : `${gap}%`}
                        </span>
                      </p>

                      <BracketButton
                        onClick={() => handleResolveAndLog(exp.id)}
                        className="h-9 px-4 text-[10px]"
                      >
                        [ RESOLVE &amp; LOG ]
                      </BracketButton>
                    </div>
                  </div>
                </motion.li>
              )
            })}
          </AnimatePresence>

          {activeList.length === 0 && (
            <li className="py-12 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-black/40">
              No active experiments &mdash; start one above
            </li>
          )}
        </ul>
      </section>
    </div>
  )
}