import { easing } from "maath"

import { ALL_KEY_IDS, ANY_KEY_DEF, LAYOUTS, type KeyDef, type Layout } from "@/data/layouts"
import type { FormatId } from "@/data/catalog"
import { isPressed } from "@/store/keyPresses"

import { U } from "./constants"

export interface AnimatedKey {
  x: number
  z: number
  w: number
  s: number
  tx: number
  tz: number
  tw: number
  ts: number
  /** 0 arriba, 1 hundida */
  p: number
  def: KeyDef
}

export interface AnimatedFrame {
  /** ancho y profundidad del área de teclas (mundo) */
  keysW: number
  keysD: number
  caseW: number
  caseD: number
  caseZ: number
  t: { keysW: number; keysD: number; caseW: number; caseD: number; caseZ: number }
}

export function keyWorldX(def: KeyDef, layout: Layout) {
  return (def.x + def.w / 2 - layout.width / 2) * U
}

export function keyWorldZ(def: KeyDef, layout: Layout) {
  return (def.y + 0.5 - layout.depth / 2) * U
}

export function caseDims(layout: Layout) {
  const { width, depth, bezel } = layout
  const caseW = (width + bezel.side * 2) * U
  const caseD = (depth + bezel.top + bezel.bottom) * U
  const caseZ = ((bezel.bottom - bezel.top) / 2) * U
  return { caseW, caseD, caseZ, keysW: width * U, keysD: depth * U }
}

/**
 * Lleva el estado animado de cada tecla y de la carcasa entre formatos. Las
 * teclas que siguen existiendo viajan a su nueva posición; las que salen se
 * achican hasta desaparecer y las nuevas crecen desde cero.
 */
export class LayoutAnimator {
  keys = new Map<string, AnimatedKey>()
  frame: AnimatedFrame
  format: FormatId

  constructor(format: FormatId) {
    this.format = format
    const layout = LAYOUTS[format]
    const present = new Map(layout.keys.map((k) => [k.id, k]))
    for (const id of ALL_KEY_IDS) {
      const def = present.get(id) ?? ANY_KEY_DEF[id]
      const inLayout = present.has(id)
      const x = inLayout ? keyWorldX(def, layout) : 0
      const z = inLayout ? keyWorldZ(def, layout) : 0
      this.keys.set(id, { x, z, w: def.w, s: inLayout ? 1 : 0, tx: x, tz: z, tw: def.w, ts: inLayout ? 1 : 0, p: 0, def })
    }
    const dims = caseDims(layout)
    this.frame = { ...dims, t: { ...dims } }
  }

  setFormat(format: FormatId) {
    if (format === this.format) return
    this.format = format
    const layout = LAYOUTS[format]
    const present = new Map(layout.keys.map((k) => [k.id, k]))
    for (const [id, state] of this.keys) {
      const def = present.get(id)
      if (def) {
        state.def = def
        state.tx = keyWorldX(def, layout)
        state.tz = keyWorldZ(def, layout)
        state.tw = def.w
        state.ts = 1
        // una tecla que aparece nace en su lugar, no viaja desde el centro
        if (state.s < 0.02) {
          state.x = state.tx
          state.z = state.tz
          state.w = state.tw
        }
      } else {
        state.ts = 0
      }
    }
    const dims = caseDims(layout)
    this.frame.t = dims
  }

  update(delta: number, instant: boolean) {
    const dt = Math.min(delta, 1 / 20)
    const smooth = instant ? 0.0001 : 0.22
    let index = 0
    for (const [id, state] of this.keys) {
      const down = isPressed(id)
      // baja rápido y vuelve un poco más lento, como un resorte real
      easing.damp(state, "p", down ? 1 : 0, down ? 0.012 : 0.045, dt)
      // escalonado leve por tecla para que el reacomodo se lea como ola
      const stagger = instant ? smooth : smooth + (index % 17) * 0.004
      easing.damp(state, "x", state.tx, stagger, dt)
      easing.damp(state, "z", state.tz, stagger, dt)
      easing.damp(state, "w", state.tw, stagger, dt)
      easing.damp(state, "s", state.ts, instant ? smooth : 0.14, dt)
      index++
    }
    const f = this.frame
    easing.damp(f, "keysW", f.t.keysW, smooth, dt)
    easing.damp(f, "keysD", f.t.keysD, smooth, dt)
    easing.damp(f, "caseW", f.t.caseW, smooth, dt)
    easing.damp(f, "caseD", f.t.caseD, smooth, dt)
    easing.damp(f, "caseZ", f.t.caseZ, smooth, dt)
  }
}
