import type { SwitchId } from "@/data/catalog"
import { useConfigurator } from "@/store/configurator"

/*
  Sonidos generados con Web Audio API, sin archivos. Cada switch combina:
  - un golpe grave de fondo (la tecla toca la placa),
  - ruido filtrado como textura del plástico,
  - y para táctil/clicky, un evento previo (el escalón o el click).
*/

let context: AudioContext | null = null
let master: GainNode | null = null
let noiseBuffer: AudioBuffer | null = null

function audio(): { ctx: AudioContext; out: GainNode } | null {
  if (!useConfigurator.getState().soundOn) return null
  if (typeof window === "undefined" || !("AudioContext" in window)) return null
  // el navegador no deja sonar nada antes de la primera interacción
  if (!context && navigator.userActivation && !navigator.userActivation.hasBeenActive) return null
  if (!context) {
    context = new AudioContext()
    master = context.createGain()
    master.gain.value = 0.7
    const comp = context.createDynamicsCompressor()
    comp.threshold.value = -14
    comp.ratio.value = 4
    master.connect(comp)
    comp.connect(context.destination)
  }
  if (context.state === "suspended") void context.resume()
  return { ctx: context, out: master! }
}

function noise(ctx: AudioContext): AudioBuffer {
  if (noiseBuffer) return noiseBuffer
  const length = Math.floor(ctx.sampleRate * 0.5)
  noiseBuffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = noiseBuffer.getChannelData(0)
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1
  return noiseBuffer
}

interface BurstOptions {
  at: number
  filter: BiquadFilterType
  frequency: number
  q?: number
  gain: number
  decay: number
}

function burst(ctx: AudioContext, out: AudioNode, o: BurstOptions) {
  const src = ctx.createBufferSource()
  src.buffer = noise(ctx)
  const filter = ctx.createBiquadFilter()
  filter.type = o.filter
  filter.frequency.value = o.frequency
  filter.Q.value = o.q ?? 0.8
  const env = ctx.createGain()
  env.gain.setValueAtTime(0, o.at)
  env.gain.linearRampToValueAtTime(o.gain, o.at + 0.002)
  env.gain.exponentialRampToValueAtTime(0.0001, o.at + o.decay)
  src.connect(filter)
  filter.connect(env)
  env.connect(out)
  src.start(o.at, Math.random() * 0.3)
  src.stop(o.at + o.decay + 0.02)
}

interface ToneOptions {
  at: number
  type: OscillatorType
  from: number
  to: number
  gain: number
  decay: number
}

function tone(ctx: AudioContext, out: AudioNode, o: ToneOptions) {
  const osc = ctx.createOscillator()
  osc.type = o.type
  osc.frequency.setValueAtTime(o.from, o.at)
  osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.to), o.at + o.decay)
  const env = ctx.createGain()
  env.gain.setValueAtTime(0, o.at)
  env.gain.linearRampToValueAtTime(o.gain, o.at + 0.003)
  env.gain.exponentialRampToValueAtTime(0.0001, o.at + o.decay)
  osc.connect(env)
  env.connect(out)
  osc.start(o.at)
  osc.stop(o.at + o.decay + 0.02)
}

const jitter = (value: number, amount = 0.08) => value * (1 + (Math.random() * 2 - 1) * amount)

/** Bajada de una tecla con el switch elegido. */
export function playKeyDown(type: SwitchId) {
  const a = audio()
  if (!a) return
  const { ctx, out } = a
  const t = ctx.currentTime + 0.005

  if (type === "lineal") {
    // golpe redondo y grave, sin eventos previos
    burst(ctx, out, { at: t, filter: "lowpass", frequency: jitter(1100), gain: 0.55, decay: 0.07 })
    tone(ctx, out, { at: t, type: "sine", from: jitter(190), to: 90, gain: 0.45, decay: 0.06 })
    burst(ctx, out, { at: t + 0.004, filter: "bandpass", frequency: jitter(2600), q: 1.4, gain: 0.12, decay: 0.03 })
  } else if (type === "tactil") {
    // el escalón: un roce corto y apagado antes del fondo
    burst(ctx, out, { at: t, filter: "bandpass", frequency: jitter(1700), q: 2, gain: 0.22, decay: 0.022 })
    const bottom = t + 0.028
    burst(ctx, out, { at: bottom, filter: "lowpass", frequency: jitter(1500), gain: 0.5, decay: 0.065 })
    tone(ctx, out, { at: bottom, type: "sine", from: jitter(230), to: 110, gain: 0.35, decay: 0.05 })
  } else {
    // clicky: click metálico agudo y luego el fondo
    burst(ctx, out, { at: t, filter: "highpass", frequency: jitter(3800), gain: 0.65, decay: 0.018 })
    tone(ctx, out, { at: t, type: "square", from: jitter(4200, 0.04), to: 3600, gain: 0.08, decay: 0.012 })
    const bottom = t + 0.022
    burst(ctx, out, { at: bottom, filter: "lowpass", frequency: jitter(2200), gain: 0.38, decay: 0.05 })
    tone(ctx, out, { at: bottom, type: "triangle", from: jitter(320), to: 160, gain: 0.18, decay: 0.04 })
  }
}

/** Subida de la tecla: más suave; el clicky vuelve a hacer click. */
export function playKeyUp(type: SwitchId) {
  const a = audio()
  if (!a) return
  const { ctx, out } = a
  const t = ctx.currentTime + 0.005
  if (type === "clicky") {
    burst(ctx, out, { at: t, filter: "highpass", frequency: jitter(3300), gain: 0.32, decay: 0.014 })
  } else {
    burst(ctx, out, { at: t, filter: "bandpass", frequency: jitter(1900), q: 1.2, gain: 0.16, decay: 0.03 })
  }
}

/** Demostración completa de un switch: baja y sube. */
export function playSwitchDemo(type: SwitchId) {
  playKeyDown(type)
  window.setTimeout(() => playKeyUp(type), 150)
}

/** Encastre de una capa: golpe seco con algo de cuerpo, más grave abajo. */
export function playSnap(layerIndex: number) {
  const a = audio()
  if (!a) return
  const { ctx, out } = a
  const t = ctx.currentTime + 0.005
  const base = 150 + layerIndex * 35
  burst(ctx, out, { at: t, filter: "lowpass", frequency: 2400, gain: 0.6, decay: 0.09 })
  tone(ctx, out, { at: t, type: "sine", from: base * 1.6, to: base * 0.6, gain: 0.55, decay: 0.12 })
  burst(ctx, out, { at: t + 0.06, filter: "bandpass", frequency: 3200, q: 2, gain: 0.08, decay: 0.04 })
}

/** Separación de una capa: un aire que sube. */
export function playLift() {
  const a = audio()
  if (!a) return
  const { ctx, out } = a
  const t = ctx.currentTime + 0.005
  tone(ctx, out, { at: t, type: "sine", from: 260, to: 520, gain: 0.12, decay: 0.12 })
  burst(ctx, out, { at: t, filter: "bandpass", frequency: 1400, q: 0.7, gain: 0.08, decay: 0.1 })
}

/** Tic del carrusel. */
export function playTick() {
  const a = audio()
  if (!a) return
  const { ctx, out } = a
  const t = ctx.currentTime + 0.003
  tone(ctx, out, { at: t, type: "sine", from: 1800, to: 1400, gain: 0.06, decay: 0.025 })
}

/** Giro final: barrido corto ascendente. */
export function playComplete() {
  const a = audio()
  if (!a) return
  const { ctx, out } = a
  const t = ctx.currentTime + 0.005
  ;[523.25, 659.25, 783.99].forEach((f, i) => {
    tone(ctx, out, { at: t + i * 0.09, type: "triangle", from: f, to: f, gain: 0.12, decay: 0.28 })
  })
}
