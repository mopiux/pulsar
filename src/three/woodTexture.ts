import * as THREE from "three"

/** Pseudo-ruido determinístico para que la veta no cambie entre cargas. */
function hash(n: number) {
  const x = Math.sin(n * 127.1) * 43758.5453
  return x - Math.floor(x)
}

function smoothNoise(x: number, seed: number) {
  const i = Math.floor(x)
  const f = x - i
  const a = hash(i + seed * 57)
  const b = hash(i + 1 + seed * 57)
  const t = f * f * (3 - 2 * f)
  return a + (b - a) * t
}

/**
 * Veta de madera dibujada en canvas 2D con los tonos medidos en ref-1
 * (#e1ceab, #b09672, #794f27).
 */
export function createWoodTexture(): THREE.CanvasTexture {
  const size = 1024
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")!

  const grad = ctx.createLinearGradient(0, 0, 0, size)
  grad.addColorStop(0, "#e1ceab")
  grad.addColorStop(0.5, "#d9c39f")
  grad.addColorStop(1, "#e1ceab")
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)

  // franjas anchas de duramen, más oscuras
  for (let band = 0; band < 14; band++) {
    const y = hash(band * 9.7) * size
    const h = 18 + hash(band * 4.1) * 46
    ctx.fillStyle = `rgba(176, 150, 114, ${0.18 + hash(band * 2.3) * 0.22})`
    ctx.beginPath()
    for (let x = 0; x <= size; x += 16) {
      const wave = Math.sin(x * 0.004 + band) * 10 + (smoothNoise(x * 0.008, band + 40) - 0.5) * 12
      if (x === 0) ctx.moveTo(x, y + wave)
      else ctx.lineTo(x, y + wave)
    }
    for (let x = size; x >= 0; x -= 16) {
      const wave = Math.sin(x * 0.004 + band) * 10 + (smoothNoise(x * 0.008, band + 70) - 0.5) * 12
      ctx.lineTo(x, y + h + wave)
    }
    ctx.closePath()
    ctx.fill()
  }

  // vetas: líneas largas horizontales con ondulación suave
  for (let line = 0; line < 230; line++) {
    const baseY = (line / 230) * size + hash(line) * 6
    const dark = hash(line * 3.1)
    const alpha = 0.04 + dark * 0.16
    ctx.strokeStyle = dark > 0.8 ? `rgba(121, 79, 39, ${alpha + 0.1})` : `rgba(176, 150, 114, ${alpha + 0.08})`
    ctx.lineWidth = 0.6 + hash(line * 7.7) * 2.4
    ctx.beginPath()
    for (let x = 0; x <= size; x += 8) {
      const wave =
        Math.sin(x * 0.006 + line * 0.35) * 3 + (smoothNoise(x * 0.01, line) - 0.5) * 7 + Math.sin(x * 0.0021 + line) * 5
      const y = baseY + wave
      if (x === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }

  // nudos
  for (let k = 0; k < 3; k++) {
    const cx = 160 + hash(k * 13.3) * 700
    const cy = 120 + hash(k * 29.1) * 780
    for (let r = 26; r > 2; r -= 3) {
      ctx.strokeStyle = `rgba(121, 79, 39, ${0.05 + (26 - r) * 0.006})`
      ctx.lineWidth = 1.4
      ctx.beginPath()
      ctx.ellipse(cx, cy, r * 2.6, r, 0, 0, Math.PI * 2)
      ctx.stroke()
    }
  }

  // tablones
  ctx.fillStyle = "rgba(121, 79, 39, 0.28)"
  for (let p = 1; p < 4; p++) ctx.fillRect(0, (p * size) / 4 - 1, size, 2)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.anisotropy = 8
  return texture
}

/** Máscara radial para que la mesa se funda con el fondo de la página. */
export function createFadeTexture(): THREE.CanvasTexture {
  const size = 256
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")!
  const grad = ctx.createRadialGradient(size / 2, size * 0.52, size * 0.12, size / 2, size * 0.52, size * 0.5)
  grad.addColorStop(0, "#ffffff")
  grad.addColorStop(0.62, "#ffffff")
  grad.addColorStop(1, "#000000")
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(canvas)
}
