export const DISTORTIONS = [
  {
    id: 'all-or-nothing',
    label: 'All-or-Nothing',
    hint: 'Seeing things in black-and-white categories.',
    example: 'If it isn\u2019t perfect, it\u2019s a total failure.',
  },
  {
    id: 'overgeneralization',
    label: 'Overgeneralization',
    hint: 'One negative event becomes a never-ending pattern.',
    example: 'I got rejected again. This always happens to me.',
  },
  {
    id: 'mental-filter',
    label: 'Mental Filter',
    hint: 'Dwelling on a single negative detail and ignoring the rest.',
    example: 'One person frowned, so the whole talk went badly.',
  },
  {
    id: 'disqualifying-positive',
    label: 'Disqualifying Positive',
    hint: 'Rejecting positive experiences as if they don\u2019t count.',
    example: 'They only complimented me because they had to.',
  },
  {
    id: 'mind-reading',
    label: 'Mind Reading',
    hint: 'Assuming others think negatively of you without evidence.',
    example: 'She didn\u2019t reply, so she must think I\u2019m annoying.',
  },
  {
    id: 'fortune-telling',
    label: 'Fortune Telling',
    hint: 'Predicting things will turn out badly as if it were fact.',
    example: 'I\u2019m going to bomb this interview.',
  },
  {
    id: 'magnification',
    label: 'Magnification',
    hint: 'Blowing problems out of proportion while shrinking strengths.',
    example: 'This typo means my career is over.',
  },
  {
    id: 'emotional-reasoning',
    label: 'Emotional Reasoning',
    hint: 'Treating a feeling as proof of the facts.',
    example: 'I feel like an idiot, therefore I am one.',
  },
  {
    id: 'shoulds',
    label: 'Shoulds',
    hint: 'Rigid rules about how you or others must behave.',
    example: 'I should never make mistakes.',
  },
  {
    id: 'labeling',
    label: 'Labeling',
    hint: 'Attaching a global label instead of describing an event.',
    example: 'I forgot the meeting. I\u2019m a loser.',
  },
] as const

export type DistortionId = (typeof DISTORTIONS)[number]['id']

export const DISTORTION_BY_ID = Object.fromEntries(
  DISTORTIONS.map((d) => [d.id, d]),
) as Record<DistortionId, (typeof DISTORTIONS)[number]>

export type ResolvedEntry = {
  id: string
  thought: string
  distortions: DistortionId[]
  rational: string
  createdAt: number
}
