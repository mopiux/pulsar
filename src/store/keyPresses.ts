import { wake } from "@/three/activity"

/**
 * Estado transitorio de teclas hundidas. Vive fuera de React: lo escriben los
 * eventos del teclado físico y lo leen los useFrame del modelo, sin re-render.
 * Cada cambio despierta la escena, que dibuja solo cuando hace falta.
 */
const pressed = new Set<string>()

export function pressKey(id: string) {
  pressed.add(id)
  wake()
}

export function releaseKey(id: string) {
  pressed.delete(id)
  wake()
}

export function isPressed(id: string) {
  return pressed.has(id)
}

export function releaseAll() {
  pressed.clear()
  wake()
}
