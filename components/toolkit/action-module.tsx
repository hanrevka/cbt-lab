'use client'

import { ArrowDown, Check, Pause, Play, RotateCcw } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { useCompletions } from '@/hooks/use-completions'
import { tactile } from '@/lib/tactile'
import { autoGrow } from '@/lib/textarea'
import { cn } from '@/lib/utils'
import { BracketButton, ModuleHeader, MonoLabel, fieldClass } from './primitives'

const THREE_MINUTES_MS = 3 * 60 * 1000

type TimerState = 'idle' | 'running' | 'paused' | 'done'

function formatTime(ms: number) {
  const totalSeconds = Math.ceil(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function ActionModule() {
  const { log } = useCompletions()
  const ticId = useId()
  const tocId = useId()

  const [tic, setTic] = useState('')
  const [toc, setToc] = useState('')
  const [timerState, setTimerState] = useState<TimerState>('idle')
  const [remainingMs, setRemainingMs] = useState(THREE_MINUTES_MS)

  const endTimestampRef = useRef(0)

  useEffect(() => {
    if (timerState !== 'running') return

    const intervalId = window.setInterval(() => {
      const remaining = Math.max(0, endTimestampRef.current - Date.now())
      setRemainingMs(remaining)

      if (remaining === 0) {
        setTimerState('done')
        tactile('seal')
        log('action')
      }
    }, 150)

    return () => window.clearInterval(intervalId)
  }, [timerState, log])

  const handleStart = () => {
    tactile('tick')
    endTimestampRef.current = Date.now() + remainingMs
    setTimerState('running')
  }

  const handlePause = () => {
    tactile('tick')
    setTimerState('paused')
  }

  const handleReset = () => {
    tactile('flip')
    setRemainingMs(THREE_MINUTES_MS)
    setTimerState('idle')
  }

  const progress = 1 - remainingMs / THREE_MINUTES_MS

  return (
    <div>
      <ModuleHeader
        index="03"
        title="Action"
        subtitle="TIC-TOC: isolate the task-interfering cognition, replace it with a task-oriented micro-action, then commit to a 3-minute physical ignition."
      />

      {/* Two Stacked Textareas */}
      <div className="flex flex-col gap-2">
        {/* TIC Box */}
        <div className="rounded-[20px] border border-[#111111]/15 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em]">
            <MonoLabel htmlFor={ticId} className="text-black/55">
              TIC &mdash; The excuse / fear
            </MonoLabel>
            <span className="text-black/35">Interfering</span>
          </div>
          <textarea
            id={ticId}
            rows={2}
            value={tic}
            onChange={(e) => {
              setTic(e.target.value)
              autoGrow(e.currentTarget)
            }}
            placeholder="I must finish the entire presentation flawlessly, so I will start tomorrow."
            className={cn(
              fieldClass,
              'mt-3 min-h-[56px] border-0 bg-transparent p-0 text-[16px] leading-snug focus:border-0',
            )}
          />
        </div>

        {/* Transition Indicator */}
        <div aria-hidden="true" className="flex justify-center py-0.5">
          <span className="flex size-7 items-center justify-center rounded-full bg-[#111111] text-white">
            <ArrowDown className="size-3.5" />
          </span>
        </div>

        {/* TOC Box */}
        <div className="rounded-[20px] border-2 border-[#111111] bg-white p-5 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em]">
            <MonoLabel htmlFor={tocId} className="text-[#111111]">
              TOC &mdash; 3-Minute microscopic action
            </MonoLabel>
            <span className="font-semibold text-[#111111]">Oriented</span>
          </div>
          <textarea
            id={tocId}
            rows={2}
            value={toc}
            onChange={(e) => {
              setToc(e.target.value)
              autoGrow(e.currentTarget)
            }}
            placeholder="Open slide deck and create title for slide one."
            className={cn(
              fieldClass,
              'mt-3 min-h-[56px] border-0 bg-transparent p-0 text-[16px] font-semibold leading-snug text-[#111111] focus:border-0',
            )}
          />
        </div>
      </div>

      {/* Brutalist 3-Minute Countdown Timer */}
      <section
        aria-label="Ignition countdown timer"
        className="mt-6 overflow-hidden rounded-[20px] bg-[#111111] p-6 text-white shadow-[0_30px_60px_-20px_rgba(0,0,0,0.45)]"
      >
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-white/50">
          <span>Ignition Timer</span>
          <span className="tabular-nums">
            {timerState === 'done'
              ? 'Ignited'
              : timerState === 'running'
                ? 'Burning'
                : timerState === 'paused'
                  ? 'Paused'
                  : 'Ready'}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-0.5 w-full bg-white/15">
          <div
            className="h-full bg-white transition-[width] duration-200 ease-linear"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        {/* Brutalist Clock Display */}
        <p
          role="timer"
          aria-live="off"
          className="py-8 text-center font-mono text-[84px] font-semibold leading-none tracking-tighter tabular-nums text-white"
        >
          {formatTime(remainingMs)}
        </p>

        {toc.trim() && (
          <p className="-mt-2 mb-6 text-center font-mono text-xs uppercase tracking-[0.1em] text-white/70 text-balance">
            Target: &ldquo;{toc.trim()}&rdquo;
          </p>
        )}

        {/* Controls */}
        <div className="flex items-center gap-2">
          {timerState === 'running' ? (
            <BracketButton
              variant="light"
              onClick={handlePause}
              className="flex-1 gap-2 text-[11px]"
            >
              <Pause className="size-3.5" aria-hidden="true" />
              [ PAUSE ]
            </BracketButton>
          ) : timerState === 'done' ? (
            <div className="flex flex-1 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 py-3.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
              <Check className="size-4" aria-hidden="true" />
              [ IGNITION COMPLETE ]
            </div>
          ) : (
            <BracketButton
              variant="light"
              onClick={handleStart}
              className="flex-1 gap-2 text-[11px]"
            >
              <Play className="size-3.5" aria-hidden="true" />
              [ {timerState === 'paused' ? 'RESUME IGNITION' : 'START IGNITION'} ]
            </BracketButton>
          )}

          <button
            type="button"
            onClick={handleReset}
            aria-label="Reset timer"
            className="flex size-12 shrink-0 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:border-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
          </button>
        </div>
      </section>
    </div>
  )
}