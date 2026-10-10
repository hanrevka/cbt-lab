type Cue = 'tick' | 'shatter' | 'seal' | 'flip'

let ctx: AudioContext | null = null
let muted = false

export function setTactileMuted(value: boolean) {
  muted = value
}

function getContext() {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function blip(
  ac: AudioContext,
  start: number,
  freq: number,
  length: number,
  type: OscillatorType,
  gain: number,
) {
  const osc = ac.createOscillator()
  const amp = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  amp.gain.setValueAtTime(gain, start)
  amp.gain.exponentialRampToValueAtTime(0.0001, start + length)
  osc.connect(amp).connect(ac.destination)
  osc.start(start)
  osc.stop(start + length + 0.01)
}

function noise(ac: AudioContext, start: number, length: number, gain: number) {
  const buffer = ac.createBuffer(1, Math.ceil(ac.sampleRate * length), ac.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 2
  }
  const src = ac.createBufferSource()
  const filter = ac.createBiquadFilter()
  const amp = ac.createGain()
  src.buffer = buffer
  filter.type = 'highpass'
  filter.frequency.value = 1800
  amp.gain.value = gain
  src.connect(filter).connect(amp).connect(ac.destination)
  src.start(start)
}

const VIBRATION: Record<Cue, number | number[]> = {
  tick: 6,
  flip: 10,
  shatter: [12, 30, 18],
  seal: [8, 40, 8],
}

export function tactile(cue: Cue) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(VIBRATION[cue])
    } catch {}
  }
  if (muted) return
  const ac = getContext()
  if (!ac) return
  const t = ac.currentTime

  switch (cue) {
    case 'tick':
      blip(ac, t, 2600, 0.018, 'square', 0.025)
      break
    case 'flip':
      noise(ac, t, 0.05, 0.08)
      break
    case 'shatter':
      noise(ac, t, 0.09, 0.16)
      blip(ac, t, 180, 0.07, 'square', 0.04)
      break
    case 'seal':
      blip(ac, t, 1320, 0.04, 'sine', 0.08)
      blip(ac, t + 0.07, 1980, 0.08, 'sine', 0.06)
      break
  }
}
