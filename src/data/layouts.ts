import type { FormatId } from "./catalog"

/** Fila de perfil escalonado (OEM): R1 es la más alta y queda atrás. */
export type ProfileRow = 1 | 2 | 3 | 4
export type KeyKind = "alpha" | "mod" | "accent" | "space"

export interface KeyDef {
  id: string
  label: string
  code: string
  /** posición y tamaño en unidades de tecla (1u = 19,05 mm) */
  x: number
  y: number
  w: number
  row: ProfileRow
  kind: KeyKind
}

export interface Layout {
  format: FormatId
  width: number
  depth: number
  keys: KeyDef[]
  /** centro de la perilla en unidades de tecla */
  knob: { x: number; y: number }
  /** margen de la carcasa alrededor de las teclas, en unidades */
  bezel: { top: number; side: number; bottom: number }
}

type Item = [id: string, label: string, code: string, w?: number, kind?: KeyKind] | number

function row(y: number, profile: ProfileRow, items: Item[]): KeyDef[] {
  const keys: KeyDef[] = []
  let x = 0
  for (const item of items) {
    if (typeof item === "number") {
      x += item
      continue
    }
    const [id, label, code, w = 1, kind = "alpha"] = item
    keys.push({ id, label, code, x, y, w, row: profile, kind })
    x += w
  }
  return keys
}

const digits: Item[] = [
  ["1", "1", "Digit1"],
  ["2", "2", "Digit2"],
  ["3", "3", "Digit3"],
  ["4", "4", "Digit4"],
  ["5", "5", "Digit5"],
  ["6", "6", "Digit6"],
  ["7", "7", "Digit7"],
  ["8", "8", "Digit8"],
  ["9", "9", "Digit9"],
  ["0", "0", "Digit0"],
  ["minus", "-", "Minus"],
  ["equal", "=", "Equal"],
  ["bksp", "Borrar", "Backspace", 2, "mod"],
]

const qwerty: Item[] = [
  ["tab", "Tab", "Tab", 1.5, "mod"],
  ["q", "Q", "KeyQ"],
  ["w", "W", "KeyW"],
  ["e", "E", "KeyE"],
  ["r", "R", "KeyR"],
  ["t", "T", "KeyT"],
  ["y", "Y", "KeyY"],
  ["u", "U", "KeyU"],
  ["i", "I", "KeyI"],
  ["o", "O", "KeyO"],
  ["p", "P", "KeyP"],
  ["lbracket", "[", "BracketLeft"],
  ["rbracket", "]", "BracketRight"],
  ["backslash", "\\", "Backslash", 1.5],
]

const home: Item[] = [
  ["caps", "Mayús", "CapsLock", 1.75, "mod"],
  ["a", "A", "KeyA"],
  ["s", "S", "KeyS"],
  ["d", "D", "KeyD"],
  ["f", "F", "KeyF"],
  ["g", "G", "KeyG"],
  ["h", "H", "KeyH"],
  ["j", "J", "KeyJ"],
  ["k", "K", "KeyK"],
  ["l", "L", "KeyL"],
  ["semicolon", ";", "Semicolon"],
  ["quote", "'", "Quote"],
  ["enter", "Enter", "Enter", 2.25, "accent"],
]

const bottomAlphas: Item[] = [
  ["z", "Z", "KeyZ"],
  ["x", "X", "KeyX"],
  ["c", "C", "KeyC"],
  ["v", "V", "KeyV"],
  ["b", "B", "KeyB"],
  ["n", "N", "KeyN"],
  ["m", "M", "KeyM"],
  ["comma", ",", "Comma"],
  ["period", ".", "Period"],
  ["slash", "/", "Slash"],
]

const fKeys = (from: number, to: number): Item[] => {
  const items: Item[] = []
  for (let n = from; n <= to; n++) items.push([`f${n}`, `F${n}`, `F${n}`, 1, "mod"])
  return items
}

const esc: Item = ["esc", "Esc", "Escape", 1, "accent"]
const grave: Item = ["grave", "`", "Backquote"]
const lshift: Item = ["lshift", "Shift", "ShiftLeft", 2.25, "mod"]
const space: Item = ["space", "", "Space", 6.25, "space"]
const arrowUp: Item = ["up", "", "ArrowUp", 1, "mod"]
const arrowLeft: Item = ["left", "", "ArrowLeft", 1, "mod"]
const arrowDown: Item = ["down", "", "ArrowDown", 1, "mod"]
const arrowRight: Item = ["right", "", "ArrowRight", 1, "mod"]

const LAYOUT_60: Layout = {
  format: "60",
  width: 15,
  depth: 5,
  knob: { x: 14.35, y: -0.78 },
  bezel: { top: 1.45, side: 0.55, bottom: 0.65 },
  keys: [
    ...row(0, 1, [esc, ...digits]),
    ...row(1, 2, qwerty),
    ...row(2, 3, home),
    ...row(3, 4, [lshift, ...bottomAlphas, ["rshift", "Shift", "ShiftRight", 2.75, "mod"]]),
    ...row(4, 4, [
      ["lctrl", "Ctrl", "ControlLeft", 1.25, "mod"],
      ["lwin", "Win", "MetaLeft", 1.25, "mod"],
      ["lalt", "Alt", "AltLeft", 1.25, "mod"],
      space,
      ["ralt", "AltGr", "AltRight", 1.25, "mod"],
      ["fn", "Fn", "", 1.25, "mod"],
      ["menu", "Menú", "ContextMenu", 1.25, "mod"],
      ["rctrl", "Ctrl", "ControlRight", 1.25, "mod"],
    ]),
  ],
}

const LAYOUT_75: Layout = {
  format: "75",
  width: 16,
  depth: 6.25,
  knob: { x: 15.5, y: 0.5 },
  bezel: { top: 0.55, side: 0.55, bottom: 0.65 },
  keys: [
    ...row(0, 1, [esc, 0.25, ...fKeys(1, 4), 0.25, ...fKeys(5, 8), 0.25, ...fKeys(9, 12), 0.25, ["del", "Supr", "Delete", 1, "mod"]]),
    ...row(1.25, 1, [grave, ...digits, ["home", "Inicio", "Home", 1, "mod"]]),
    ...row(2.25, 2, [...qwerty, ["pgup", "RePág", "PageUp", 1, "mod"]]),
    ...row(3.25, 3, [...home, ["pgdn", "AvPág", "PageDown", 1, "mod"]]),
    ...row(4.25, 4, [lshift, ...bottomAlphas, ["rshift", "Shift", "ShiftRight", 1.75, "mod"], arrowUp, ["end", "Fin", "End", 1, "mod"]]),
    ...row(5.25, 4, [
      ["lctrl", "Ctrl", "ControlLeft", 1.25, "mod"],
      ["lwin", "Win", "MetaLeft", 1.25, "mod"],
      ["lalt", "Alt", "AltLeft", 1.25, "mod"],
      space,
      ["ralt", "AltGr", "AltRight", 1, "mod"],
      ["fn", "Fn", "", 1, "mod"],
      ["rctrl", "Ctrl", "ControlRight", 1, "mod"],
      arrowLeft,
      arrowDown,
      arrowRight,
    ]),
  ],
}

const LAYOUT_TKL: Layout = {
  format: "tkl",
  width: 18.25,
  depth: 6.5,
  knob: { x: 17.6, y: -0.78 },
  bezel: { top: 1.45, side: 0.55, bottom: 0.65 },
  keys: [
    ...row(0, 1, [
      esc,
      1,
      ...fKeys(1, 4),
      0.5,
      ...fKeys(5, 8),
      0.5,
      ...fKeys(9, 12),
      0.25,
      ["prtsc", "ImpPt", "PrintScreen", 1, "mod"],
      ["scrlk", "BlqDs", "ScrollLock", 1, "mod"],
      ["pause", "Pausa", "Pause", 1, "mod"],
    ]),
    ...row(1.5, 1, [
      grave,
      ...digits,
      0.25,
      ["ins", "Insert", "Insert", 1, "mod"],
      ["home", "Inicio", "Home", 1, "mod"],
      ["pgup", "RePág", "PageUp", 1, "mod"],
    ]),
    ...row(2.5, 2, [
      ...qwerty,
      0.25,
      ["del", "Supr", "Delete", 1, "mod"],
      ["end", "Fin", "End", 1, "mod"],
      ["pgdn", "AvPág", "PageDown", 1, "mod"],
    ]),
    ...row(3.5, 3, home),
    ...row(4.5, 4, [lshift, ...bottomAlphas, ["rshift", "Shift", "ShiftRight", 2.75, "mod"], 1.25, arrowUp]),
    ...row(5.5, 4, [
      ["lctrl", "Ctrl", "ControlLeft", 1.25, "mod"],
      ["lwin", "Win", "MetaLeft", 1.25, "mod"],
      ["lalt", "Alt", "AltLeft", 1.25, "mod"],
      space,
      ["ralt", "AltGr", "AltRight", 1.25, "mod"],
      ["rwin", "Win", "MetaRight", 1.25, "mod"],
      ["menu", "Menú", "ContextMenu", 1.25, "mod"],
      ["rctrl", "Ctrl", "ControlRight", 1.25, "mod"],
      0.25,
      arrowLeft,
      arrowDown,
      arrowRight,
    ]),
  ],
}

export const LAYOUTS: Record<FormatId, Layout> = {
  "60": LAYOUT_60,
  "75": LAYOUT_75,
  tkl: LAYOUT_TKL,
}

/** Todas las teclas que existen en algún formato, para animar altas y bajas. */
export const ALL_KEY_IDS: string[] = Array.from(
  new Set(Object.values(LAYOUTS).flatMap((layout) => layout.keys.map((key) => key.id)))
)

/** Última definición conocida de cada tecla (para las que salen del layout). */
export const ANY_KEY_DEF: Record<string, KeyDef> = Object.fromEntries(
  Object.values(LAYOUTS).flatMap((layout) => layout.keys.map((key) => [key.id, key]))
)

/** Las flechas se dibujan como triángulos: la fuente no trae esos glifos. */
export const ARROW_ANGLE: Record<string, number> = {
  up: 0,
  left: Math.PI / 2,
  down: Math.PI,
  right: -Math.PI / 2,
}

export const DEMO_KEY_ID = "g"

export function keyIdForCode(code: string): string | null {
  if (!code) return null
  for (const layout of Object.values(LAYOUTS)) {
    const key = layout.keys.find((k) => k.code === code)
    if (key) return key.id
  }
  return null
}
