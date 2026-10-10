'use client'

import { useState } from 'react'
import { ModuleHeader } from '@/components/toolkit/primitives'
import { useResolvedDeck } from '@/hooks/use-resolved-deck'
import { useVault } from '@/hooks/use-vault'
import { DISTORTION_BY_ID, type ResolvedEntry } from '@/lib/distortions'
import { ResolvedDeck } from './resolved-deck'
import { ThoughtCard } from './thought-card'

export function ReframeModule() {
  const { entries, add, remove } = useResolvedDeck()
  const { saveLog } = useVault()
  const [cardKey, setCardKey] = useState(0)

  const handleResolve = (entry: ResolvedEntry) => {
    add(entry)

    // Save full receipt into Vault
    saveLog('reframe', {
      automaticThought: entry.thought,
      distortions: entry.distortions.map((id) => DISTORTION_BY_ID[id]?.label ?? id),
      rationalRebuttal: entry.rational,
    })

    setCardKey((k) => k + 1)
  }

  return (
    <div>
      <ModuleHeader
        index="01"
        title="Reframe"
        subtitle="Triple-Column: catch the automatic thought, name its distortions, then shatter it with evidence."
      />

      <ThoughtCard
        key={cardKey}
        cardNumber={String(entries.length + 1).padStart(3, '0')}
        onResolve={handleResolve}
      />

      <ResolvedDeck entries={entries} onRemove={remove} />
    </div>
  )
}
