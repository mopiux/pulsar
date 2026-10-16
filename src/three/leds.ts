import * as THREE from "three"

import type { RgbMode } from "@/data/catalog"

import { U } from "./constants"
import type { AnimatedKey } from "./layoutAnimator"

/*
  Color e intensidad del LED de cada tecla. Lo usan el halo bajo la tecla,
  el punto de luz y las leyendas shine-through, así todo late igual.

  Ola: el frente avanza columna por columna (con un leve corrimiento por
  fila, en diagonal). Cada tecla se prende entera cuando el frente pasa por
  su columna y se apaga de a poco: la onda se lee tecla por tecla.
*/

/** columnas por segundo que recorre el frente de la ola */
const WAVE_SPEED = 7
/** columnas de recorrido antes de volver a empezar */
const WAVE_SPAN = 30

const hsl = { h: 0, s: 0, l: 0 }

export function ledColor(out: THREE.Color, key: AnimatedKey, mode: RgbMode, base: THREE.Color, time: number): THREE.Color {
  if (mode === "apagada" || key.s < 0.01) return out.setRGB(0, 0, 0)

  // la tecla presionada se aviva
  const press = 1 + key.p * 0.9

  if (mode === "fija") return out.copy(base).multiplyScalar(press)

  const col = Math.round(key.x / U)
  const row = Math.round(key.z / U)
  const position = col + row * 0.5 + WAVE_SPAN / 2
  const front = (time * WAVE_SPEED) % WAVE_SPAN
  // distancia al frente, solo hacia atrás: adelante del frente la tecla está apagada
  let d = front - position
  if (d < 0) d += WAVE_SPAN
  const glow = 0.12 + Math.exp(-d * 0.55)
  base.getHSL(hsl)
  out.setHSL((hsl.h + Math.min(d, 6) * 0.012 + 1) % 1, hsl.s, hsl.l)
  return out.multiplyScalar(glow * press)
}

/** Textura del halo: luz concentrada al centro que se desvanece hacia afuera. */
export function createGlowTexture(): THREE.CanvasTexture {
  const size = 128
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, "rgba(255,255,255,1)")
  g.addColorStop(0.35, "rgba(255,255,255,0.55)")
  g.addColorStop(0.7, "rgba(255,255,255,0.12)")
  g.addColorStop(1, "rgba(255,255,255,0)")
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}
