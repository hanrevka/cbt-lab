'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useRef, useState } from 'react'
import type { DistortionId, ResolvedEntry } from '@/lib/distortions'
import { tactile } from '@/lib/tactile'
import { CardBack } from './card-back'
import { CardFront } from './card-front'

type Phase = 'front' | 'back' | 'sealing'

type ThoughtCardProps = {
  cardNumber: string
  onResolve: (entry: ResolvedEntry) => void
}

const FLIP_SPRING = { type: 'spring', duration: 0.5, bounce: 0.22 } as const

export function ThoughtCard({ cardNumber, onResolve }: ThoughtCardProps) {
  const [thought, setThought] = useState('')
  const [selected, setSelected] = useState<DistortionId[]>([])
  const [rational, setRational] = useState('')
  const [phase, setPhase] = useState<Phase>('front')
  const [archiveOffset, setArchiveOffset] = useState(360)
  const cardRef = useRef<HTMLDivElement>(null)
  const backInputRef = useRef<HTMLTextAreaElement>(null)
  const resolvedRef = useRef(false)
  const reduceMotion = useReducedMotion()

  const flipped = phase !== 'front'
  // Resetting parent and back face from 180° + 180° to 0° + 0° is visually identical, so the
  // seal slide can run on a flat layer instead of compositing a 3D context while it scales.
  const sealing = phase === 'sealing'
  const canShatter = thought.trim().length > 0 && selected.length > 0
  const canSeal = rational.trim().length > 0 && phase === 'back'

  const toggle = (id: DistortionId) => {
    tactile('tick')
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const shatter = () => {
    if (!canShatter || phase !== 'front') return
    tactile('shatter')
    setPhase('back')
  }

  const unshatter = () => {
    tactile('flip')
    setPhase('front')
  }

  const seal = () => {
    if (!canSeal) return
    const card = cardRef.current?.getBoundingClientRect()
    const deck = document.getElementById('archive-deck')?.getBoundingClientRect()
    if (card && deck) setArchiveOffset(Math.max(160, deck.top - card.top))
    tactile('seal')
    setPhase('sealing')
  }

  const finishSeal = () => {
    if (phase !== 'sealing' || resolvedRef.current) return
    resolvedRef.current = true
    onResolve({
      id: crypto.randomUUID(),
      thought: thought.trim(),
      distortions: selected,
      rational: rational.trim(),
      createdAt: Date.now(),
    })
  }

  return (
    <motion.div
      ref={cardRef}
      initial={reduceMotion ? false : { opacity: 0, scale: 0.94, y: -20 }}
      animate={
        phase === 'sealing'
          ? { opacity: 0, scale: 0.28, y: archiveOffset }
          : { opacity: 1, scale: 1, y: 0 }
      }
      transition={
        phase === 'sealing'
          ? { duration: reduceMotion ? 0 : 0.6, ease: [0.55, 0, 0.75, 0.2], opacity: { delay: reduceMotion ? 0 : 0.45, duration: reduceMotion ? 0 : 0.15, ease: 'linear' } }
          : { type: 'spring', duration: 0.5, bounce: 0.2 }
      }
      onAnimationComplete={finishSeal}
      className="relative z-10 origin-top"
    >
      <div className="[perspective:1000px]">
        <motion.div
          className={sealing ? 'relative grid' : 'relative grid [transform-style:preserve-3d]'}
          initial={false}
          animate={{ rotateY: sealing ? 0 : flipped ? 180 : 0 }}
          transition={reduceMotion || sealing ? { duration: 0 } : FLIP_SPRING}
          onAnimationComplete={() => {
            if (phase === 'back') backInputRef.current?.focus({ preventScroll: true })
          }}
        >
          <CardFront
            cardNumber={cardNumber}
            thought={thought}
            onThoughtChange={setThought}
            selected={selected}
            onToggle={toggle}
            struck={flipped}
            canShatter={canShatter}
            onShatter={shatter}
            hidden={flipped}
            collapsed={sealing}
          />
          <CardBack
            cardNumber={cardNumber}
            thought={thought}
            distortions={selected}
            rational={rational}
            onRationalChange={setRational}
            inputRef={backInputRef}
            canSeal={canSeal}
            onSeal={seal}
            onReturn={unshatter}
            hidden={!flipped}
            flat={sealing}
          />
        </motion.div>
      </div>
    </motion.div>
  )
}
