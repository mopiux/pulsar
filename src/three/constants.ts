/** Tamaño de 1u (una tecla) en unidades del mundo. */
export const U = 0.2

/** Inclinación de escritura de la carcasa (radianes). */
export const TILT = 0.075

// Alturas en el teclado armado (coordenadas locales del teclado)
export const CASE_SLAB_TOP = 0.1
export const CASE_WALL_BOTTOM = 0.06
export const CASE_WALL_TOP = 0.4
export const PLATE_THICKNESS = 0.025
export const PLATE_Y = 0.29
export const SWITCH_BASE = PLATE_Y + PLATE_THICKNESS / 2
export const SWITCH_HOUSING_H = 0.09
export const STEM_H = 0.05
export const KEYCAP_BASE = SWITCH_BASE + SWITCH_HOUSING_H + 0.02
export const KEY_GAP = 0.018
export const PRESS_DEPTH = 0.05

/** Alturas y ángulos del perfil escalonado OEM por fila. */
export const PROFILE: Record<1 | 2 | 3 | 4, { height: number; angle: number }> = {
  1: { height: 0.2, angle: -0.16 },
  2: { height: 0.175, angle: -0.08 },
  3: { height: 0.16, angle: 0.0 },
  4: { height: 0.168, angle: 0.11 },
}

/** Separación vertical entre capas despiezadas. */
export const EXPLODE_FIRST = 0.5
export const EXPLODE_GAP = 0.4
/** Cuánto se adelanta la capa activa hacia la cámara. */
export const ACTIVE_FORWARD = 0.36

/** Altura de referencia de cada capa armada, para encuadrar la cámara. */
export const LAYER_FOCUS_Y = [0.22, PLATE_Y, SWITCH_BASE + 0.06, KEYCAP_BASE + 0.1, KEYCAP_BASE + 0.2]

export function layerOffsetY(index: number, placed: number): number {
  if (index < placed) return 0
  return EXPLODE_FIRST + (index - placed) * EXPLODE_GAP
}
