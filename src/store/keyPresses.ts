/**
 * Estado transitorio de teclas hundidas. Vive fuera de React: lo escriben los
 * eventos del teclado físico y lo leen los useFrame del modelo, sin re-render.
 */
const pressed = new Set<string>()

export function pressKey(id: string) {
  pressed.add(id)
}

export function releaseKey(id: string) {
  pressed.delete(id)
}

export function isPressed(id: string) {
  return pressed.has(id)
}

export function releaseAll() {
  pressed.clear()
}
