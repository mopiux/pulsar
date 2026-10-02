import * as THREE from "three"

import { ENGRAVING_MAX } from "@/data/catalog"
import { ALL_KEY_IDS, ARROW_ANGLE } from "@/data/layouts"

/*
  Todas las leyendas viven en una sola textura: una celda de 128 px por
  tecla y una franja ancha abajo para el grabado de la barra espaciadora.
  Así las leyendas se dibujan con un único InstancedMesh (un draw call).
*/

const SIZE = 2048
const CELL = 128
const COLS = SIZE / CELL
/** alto de la franja de grabado, en píxeles (dos filas de celdas) */
const ENGRAVE_H = CELL * 2

export const LEGEND_FONT = '"Geist Variable", ui-sans-serif, system-ui, sans-serif'

export interface LegendEntry {
  label: string
  color: string
}

export function cellIndex(id: string) {
  return ALL_KEY_IDS.indexOf(id)
}

/** offset y escala de UV (x, y, w, h) de la celda de una tecla */
export function cellUv(index: number): [number, number, number, number] {
  const col = index % COLS
  const row = Math.floor(index / COLS)
  const s = CELL / SIZE
  return [col * s, 1 - (row + 1) * s, s, s]
}

export function engravingUv(): [number, number, number, number] {
  return [0, 0, 1, ENGRAVE_H / SIZE]
}

/** relación ancho/alto de la franja de grabado */
export const ENGRAVING_ASPECT = SIZE / ENGRAVE_H

export class LegendAtlas {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  texture: THREE.CanvasTexture

  constructor() {
    this.canvas = document.createElement("canvas")
    this.canvas.width = SIZE
    this.canvas.height = SIZE
    this.ctx = this.canvas.getContext("2d")!
    this.texture = new THREE.CanvasTexture(this.canvas)
    this.texture.colorSpace = THREE.SRGBColorSpace
    this.texture.anisotropy = 8
  }

  drawKeys(entries: Map<string, LegendEntry>) {
    const { ctx } = this
    ctx.clearRect(0, 0, SIZE, SIZE - ENGRAVE_H)
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    for (const [id, entry] of entries) {
      const index = cellIndex(id)
      if (index < 0) continue
      const x = (index % COLS) * CELL + CELL / 2
      const y = Math.floor(index / COLS) * CELL + CELL / 2
      ctx.fillStyle = entry.color
      if (id in ARROW_ANGLE) {
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(-ARROW_ANGLE[id])
        ctx.beginPath()
        ctx.moveTo(0, -20)
        ctx.lineTo(17, 12)
        ctx.lineTo(-17, 12)
        ctx.closePath()
        ctx.fill()
        ctx.restore()
        continue
      }
      if (!entry.label) continue
      const len = entry.label.length
      const px = len <= 1 ? 60 : len <= 3 ? 42 : 31
      ctx.font = `560 ${px}px ${LEGEND_FONT}`
      ctx.fillText(entry.label, x, y + 2, CELL - 12)
    }
    this.texture.needsUpdate = true
  }

  drawEngraving(text: string, color: string) {
    const { ctx } = this
    ctx.clearRect(0, SIZE - ENGRAVE_H, SIZE, ENGRAVE_H)
    const value = text.slice(0, ENGRAVING_MAX).toUpperCase()
    if (value) {
      ctx.fillStyle = color
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.font = `600 120px ${LEGEND_FONT}`
      ctx.letterSpacing = "10px"
      ctx.fillText(value, SIZE / 2, SIZE - ENGRAVE_H / 2 + 4, SIZE - 120)
      ctx.letterSpacing = "0px"
    }
    this.texture.needsUpdate = true
  }

  dispose() {
    this.texture.dispose()
  }
}

/** Espera la fuente antes de dibujar, para no rasterizar con la de reserva. */
export async function legendFontReady() {
  if (typeof document === "undefined" || !document.fonts) return
  try {
    await Promise.all([document.fonts.load(`560 60px ${LEGEND_FONT}`), document.fonts.load(`600 120px ${LEGEND_FONT}`)])
  } catch {
    // si falla la carga se dibuja con la fuente del sistema
  }
}
