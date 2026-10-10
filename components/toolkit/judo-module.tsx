'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Check, Dices, RotateCcw } from 'lucide-react'
import { useId, useState } from 'react'
import { useCompletions } from '@/hooks/use-completions'
import { tactile } from '@/lib/tactile'
import { autoGrow } from '@/lib/textarea'
import { cn } from '@/lib/utils'
import { BracketButton, ModuleHeader, MonoLabel, fieldClass } from './primitives'

const HOSTILE_SCENARIOS = [
  'You are completely incompetent and have ruined this entire project.',
  'You are so selfish! Everything always has to be on your terms.',
  'You never listen to anyone. Having a conversation with you is impossible.',
  'You obviously do not care about this team or the quality of our work.',
  'You always make promises you fail to deliver on.',
] as const

const STEPS = [
  {
    step: '01',
    title: 'Empathy',
    rule: 'Clarify Without Defending',
    prompt: 'Ask a specific question to clarify their grievance without being defensive.',
    placeholder: 'What specific part of the project did you feel fell short of expectations?',
  },
  {
    step: '02',
    title: 'Disarm',
    rule: 'Find 1% Truth & Agree',
    prompt: 'Find at least 1% truth in their criticism and agree calmly and sincerely.',
    placeholder: 'You are right that the final report was delivered behind schedule and that caused frustration.',
  },
  {
    step: '03',
    title: 'Negotiate',
    rule: 'State Your Reality & Boundary',
    prompt: 'State your perspective or boundary tactfully and propose a practical path forward.',
    placeholder: 'I take responsibility for the timeline, though I do care deeply about this work. Let us review the milestones together.',
  },
] as const

export function JudoModule() {
  const { log } = useCompletions()

  const [scenarioIndex, setScenarioIndex] = useState(0)
  const [responses, setResponses] = useState<[string, string, string]>(['', '', ''])
  const [isResolved, setIsResolved] = useState(false)

  const step1Id = useId()
  const step2Id = useId()
  const step3Id = useId()
  const stepIds = [step1Id, step2Id, step3Id]

  const currentScenario = HOSTILE_SCENARIOS[scenarioIndex]
  const canResolve = responses.every((r) => r.trim().length > 0) && !isResolved

  const drawScenario = () => {
    tactile('flip')
    let nextIndex = Math.floor(Math.random() * HOSTILE_SCENARIOS.length)
    if (nextIndex === scenarioIndex) {
      nextIndex = (scenarioIndex + 1) % HOSTILE_SCENARIOS.length
    }
    setScenarioIndex(nextIndex)
    setResponses(['', '', ''])
    setIsResolved(false)
  }

  const handleInputChange = (index: number, value: string) => {
    setResponses((prev) => {
      const copy: [string, string, string] = [...prev]
      copy[index] = value
      return copy
    })
  }

  const handleResolve = () => {
    if (!canResolve) return
    tactile('seal')
    setIsResolved(true)
    log('judo')
  }

  const handleResetDrill = () => {
    tactile('tick')
    setResponses(['', '', ''])
    setIsResolved(false)
  }

  return (
    <div>
      <ModuleHeader
        index="05"
        title="Judo"
        subtitle="Verbal Defense Trainer: absorb incoming hostility instead of resisting. Defuse attacks through Empathy, Disarming, and Negotiation."
      />

      {/* Hostile Attack Card */}
      <section
        aria-label="Hostile attack card"
        className="rounded-[20px] bg-[#111111] p-6 text-white shadow-[0_30px_60px_-20px_rgba(0,0,0,0.45)]"
      >
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-white/50">
          <span>Hostile Incoming Attack</span>
          <span className="tabular-nums">
            Case {String(scenarioIndex + 1).padStart(2, '0')}/{String(HOSTILE_SCENARIOS.length).padStart(2, '0')}
          </span>
        </div>

        <div className="mt-4 h-px w-full bg-white/15" />

        <AnimatePresence mode="wait" initial={false}>
          <motion.blockquote
            key={scenarioIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mt-6 text-[22px] font-semibold leading-[1.25] tracking-tight text-white text-balance"
          >
            &ldquo;{currentScenario}&rdquo;
          </motion.blockquote>
        </AnimatePresence>

        <div className="mt-6 pt-2">
          <BracketButton
            variant="light"
            onClick={drawScenario}
            className="w-full gap-2 text-[11px]"
          >
            <Dices className="size-3.5" aria-hidden="true" />
            [ DRAW HOSTILE SCENARIO ]
          </BracketButton>
        </div>
      </section>

      {/* 3-Step Response Form */}
      <section aria-label="Judo response form" className="mt-6 flex flex-col gap-4">
        {STEPS.map((stepMeta, index) => {
          const isFilled = responses[index].trim().length > 0
          const inputId = stepIds[index]

          return (
            <div
              key={stepMeta.step}
              className={cn(
                'rounded-[20px] border bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] transition-all',
                isFilled ? 'border-[#111111]' : 'border-[#111111]/15',
              )}
            >
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em]">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-[#111111]">
                    Step {stepMeta.step}
                  </span>
                  <span className="text-black/35">&middot;</span>
                  <span className="text-black/60">{stepMeta.title}</span>
                </div>
                <span className="text-black/40">{stepMeta.rule}</span>
              </div>

              <MonoLabel htmlFor={inputId} className="mt-3 block text-black/55 text-pretty">
                {stepMeta.prompt}
              </MonoLabel>

              <textarea
                id={inputId}
                rows={2}
                value={responses[index]}
                readOnly={isResolved}
                onChange={(e) => {
                  handleInputChange(index, e.target.value)
                  autoGrow(e.currentTarget)
                }}
                placeholder={stepMeta.placeholder}
                className={cn(
                  fieldClass,
                  'mt-3 min-h-[56px] text-[15px] leading-snug',
                  isResolved && 'cursor-default select-text bg-black/[0.02]',
                )}
              />
            </div>
          )
        })}
      </section>

      {/* Completion & Action Bar */}
      <div className="mt-6">
        {!isResolved ? (
          <BracketButton
            onClick={handleResolve}
            disabled={!canResolve}
            className="w-full text-[11px]"
          >
            [ RESOLVE CONFLICT ]
          </BracketButton>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[20px] border-2 border-[#111111] bg-white p-6 shadow-[0_8px_30px_-6px_rgba(0,0,0,0.1)]"
          >
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-[#111111]">
              <span className="flex items-center gap-1.5 font-semibold">
                <Check className="size-3.5" aria-hidden="true" />
                Disarmed &amp; Resolved
              </span>
              <span className="text-black/40">Mastery</span>
            </div>

            <div className="mt-4 border-l-2 border-[#111111] pl-3.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/40">
                Full Integrated Defense
              </span>
              <p className="mt-2 text-[15px] leading-relaxed text-[#111111]">
                {responses.map((r) => r.trim()).join(' ')}
              </p>
            </div>

            <div className="mt-6 flex gap-2">
              <BracketButton
                variant="ghost"
                onClick={handleResetDrill}
                className="flex-1 text-[11px]"
              >
                [ EDIT RESPONSES ]
              </BracketButton>
              <BracketButton
                onClick={drawScenario}
                className="flex-1 text-[11px]"
              >
                [ NEXT DRILL ]
              </BracketButton>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}