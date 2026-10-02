/*
  La escena usa frameloop="demand": solo se dibuja cuando algo cambia.
  Cualquier interacción (mouse, teclado, cambio de opción) "despierta" la
  escena; mientras está despierta pueden correr el balanceo y la
  autorrotación, y cuando pasa IDLE_MS sin actividad todo se asienta y se
  dejan de pedir cuadros.
*/

export const IDLE_MS = 30_000

let lastActivity = typeof performance !== "undefined" ? performance.now() : 0
let invalidate: (() => void) | null = null

export function bindInvalidate(fn: (() => void) | null) {
  invalidate = fn
}

export function wake() {
  lastActivity = performance.now()
  invalidate?.()
}

/** Milisegundos desde la última interacción. */
export function idleFor() {
  return performance.now() - lastActivity
}

export function isAwake() {
  return idleFor() < IDLE_MS
}
