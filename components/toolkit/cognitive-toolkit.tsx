'use client'

import { useState } from 'react'
import { ReframeModule } from '@/components/reframe/reframe-app'
import { useCompletions } from '@/hooks/use-completions'
import { useResolvedDeck } from '@/hooks/use-resolved-deck'
import { ActionModule } from './action-module'
import { BottomNav, TABS, type TabId } from './bottom-nav'
import { GapTestModule } from './gap-test-module'
import { JudoModule } from './judo-module'
import { ProbeModule } from './probe-module'
import { TopBar } from './top-bar'
import { VaultModule } from './vault-module'

const MODULES: Record<TabId, () => React.ReactNode> = {
  reframe: () => <ReframeModule />,
  gap: () => <GapTestModule />,
  action: () => <ActionModule />,
  probe: () => <ProbeModule />,
  judo: () => <JudoModule />,
  vault: () => <VaultModule />,
}

export function CognitiveToolkit() {
  const [active, setActive] = useState<TabId>('reframe')
  const [direction, setDirection] = useState<1 | -1>(1)
  const { entries } = useResolvedDeck()
  const { total } = useCompletions()

  const select = (next: TabId) => {
    if (next === active) return
    const from = TABS.findIndex((t) => t.id === active)
    const to = TABS.findIndex((t) => t.id === next)
    setDirection(to > from ? 1 : -1)
    setActive(next)
    window.scrollTo({ top: 0 })
  }

  return (
    <div className="min-h-dvh">
      <TopBar resolved={entries.length + total} />
      <main className="mx-auto w-full max-w-md px-4 pb-36 pt-6">
        {TABS.map(({ id }) => (
          <div key={id} className={id === active ? 'block' : 'hidden'}>
            <section
              id={`panel-${id}`}
              role="tabpanel"
              aria-labelledby={`tab-${id}`}
              className={
                direction === 1
                  ? 'animate-in fade-in slide-in-from-right-4 duration-300 ease-out'
                  : 'animate-in fade-in slide-in-from-left-4 duration-300 ease-out'
              }
            >
              {MODULES[id]()}
            </section>
          </div>
        ))}
      </main>
      <BottomNav active={active} onSelect={select} />
    </div>
  )
}
