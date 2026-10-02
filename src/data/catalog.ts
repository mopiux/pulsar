export type FormatId = "60" | "75" | "tkl"
export type CaseId = "grafito" | "plata" | "ciruela" | "mostaza" | "turquesa" | "hielo"
export type PlateId = "aluminio" | "laton" | "policarbonato" | "fr4"
export type SwitchId = "lineal" | "tactil" | "clicky"
export type KeycapSetId = "malbec" | "rio" | "yerba" | "medianoche"
export type KnobId = "ninguna" | "aluminio" | "laton"
export type CableId = "grafito" | "ciruela" | "mostaza" | "turquesa"
export type RgbMode = "apagada" | "fija" | "ola"

export interface Config {
  format: FormatId
  case: CaseId
  plate: PlateId
  switches: SwitchId
  keycaps: KeycapSetId
  knob: KnobId
  cable: CableId
  rgbMode: RgbMode
  rgbColor: string
  engraving: string
}

export const ENGRAVING_MAX = 18

export interface FormatOption {
  id: FormatId
  name: string
  detail: string
  price: number
}

export interface CaseOption {
  id: CaseId
  name: string
  detail: string
  price: number
  color: string
  material: "aluminio" | "policarbonato"
}

export interface PlateOption {
  id: PlateId
  name: string
  detail: string
  price: number
  color: string
  metalness: number
  roughness: number
  translucent: boolean
}

export interface SwitchOption {
  id: SwitchId
  name: string
  detail: string
  price: number
  stem: string
  housing: string
}

export interface KeycapSet {
  id: KeycapSetId
  name: string
  detail: string
  price: number
  alpha: string
  alphaLegend: string
  mod: string
  modLegend: string
  accent: string
  accentLegend: string
  /** las teclas de acento son de resina translúcida */
  resinAccent: boolean
}

export interface KnobOption {
  id: KnobId
  name: string
  detail: string
  price: number
  color: string | null
}

export interface CableOption {
  id: CableId
  name: string
  detail: string
  price: number
  color: string
}

export interface RgbOption {
  id: RgbMode
  name: string
  detail: string
  price: number
}

export const FORMATS: FormatOption[] = [
  { id: "60", name: "60%", detail: "61 teclas, lo justo", price: 145000 },
  { id: "75", name: "75%", detail: "82 teclas con fila F y perilla", price: 172000 },
  { id: "tkl", name: "TKL", detail: "87 teclas, sin numérico", price: 189000 },
]

export const CASES: CaseOption[] = [
  { id: "grafito", name: "Grafito", detail: "Aluminio anodizado", price: 0, color: "#3a3a3f", material: "aluminio" },
  { id: "plata", name: "Plata", detail: "Aluminio anodizado", price: 0, color: "#c4c7cb", material: "aluminio" },
  { id: "ciruela", name: "Ciruela", detail: "Aluminio anodizado", price: 14000, color: "#5b2346", material: "aluminio" },
  { id: "mostaza", name: "Mostaza", detail: "Aluminio anodizado", price: 14000, color: "#c98d17", material: "aluminio" },
  { id: "turquesa", name: "Turquesa", detail: "Aluminio anodizado", price: 14000, color: "#0a8f8c", material: "aluminio" },
  { id: "hielo", name: "Hielo", detail: "Policarbonato translúcido", price: 6000, color: "#e8eef2", material: "policarbonato" },
]

export const PLATES: PlateOption[] = [
  { id: "aluminio", name: "Aluminio", detail: "Firme y parejo", price: 0, color: "#b9bdc2", metalness: 0.9, roughness: 0.38, translucent: false },
  { id: "laton", name: "Latón", detail: "Pesado, sonido grave", price: 21000, color: "#c9a14a", metalness: 1, roughness: 0.3, translucent: false },
  { id: "policarbonato", name: "Policarbonato", detail: "Flexible, deja pasar la luz", price: 8000, color: "#f4f6f8", metalness: 0, roughness: 0.45, translucent: true },
  { id: "fr4", name: "FR4", detail: "Fibra de vidrio, punto medio", price: 6000, color: "#27292b", metalness: 0.1, roughness: 0.72, translucent: false },
]

export const SWITCHES: SwitchOption[] = [
  { id: "lineal", name: "Lineal", detail: "Recorrido suave, sin escalón", price: 38000, stem: "#d22a2a", housing: "#2a2a2d" },
  { id: "tactil", name: "Táctil", detail: "Un escalón que se siente", price: 42000, stem: "#8a5a2b", housing: "#2a2a2d" },
  { id: "clicky", name: "Clicky", detail: "Escalón y click audible", price: 36000, stem: "#2f6fd6", housing: "#e9ecef" },
]

export const KEYCAP_SETS: KeycapSet[] = [
  {
    id: "malbec",
    name: "Malbec",
    detail: "PBT doble inyección",
    price: 54000,
    alpha: "#efe6dc",
    alphaLegend: "#5a1b2e",
    mod: "#6b1e34",
    modLegend: "#efe6dc",
    accent: "#a62d45",
    accentLegend: "#f6ece4",
    resinAccent: false,
  },
  {
    id: "rio",
    name: "Río de la Plata",
    detail: "PBT con acentos de resina",
    price: 61000,
    alpha: "#f4f5f2",
    alphaLegend: "#3b6f9e",
    mod: "#8fb9de",
    modLegend: "#ffffff",
    accent: "#f2b51c",
    accentLegend: "#4a3205",
    resinAccent: true,
  },
  {
    id: "yerba",
    name: "Yerba",
    detail: "PBT tinta sublimada",
    price: 54000,
    alpha: "#dfe0c9",
    alphaLegend: "#3e4a22",
    mod: "#5d6d33",
    modLegend: "#eef0dc",
    accent: "#a8752c",
    accentLegend: "#fbf3e3",
    resinAccent: false,
  },
  {
    id: "medianoche",
    name: "Medianoche",
    detail: "PBT con acentos de resina",
    price: 58000,
    alpha: "#23263a",
    alphaLegend: "#d7dbea",
    mod: "#3a3f58",
    modLegend: "#d7dbea",
    accent: "#e5432d",
    accentLegend: "#ffffff",
    resinAccent: true,
  },
]

export const KNOBS: KnobOption[] = [
  { id: "ninguna", name: "Sin perilla", detail: "Esquina limpia", price: 0, color: null },
  { id: "aluminio", name: "Aluminio", detail: "Moleteada, del color de la carcasa", price: 9500, color: null },
  { id: "laton", name: "Latón", detail: "Moleteada, maciza", price: 14000, color: "#c9a14a" },
]

export const CABLES: CableOption[] = [
  { id: "grafito", name: "Grafito", detail: "Espiral con conector aviador", price: 16000, color: "#2e2e33" },
  { id: "ciruela", name: "Ciruela", detail: "Espiral con conector aviador", price: 18000, color: "#6a2752" },
  { id: "mostaza", name: "Mostaza", detail: "Espiral con conector aviador", price: 18000, color: "#d6a020" },
  { id: "turquesa", name: "Turquesa", detail: "Espiral con conector aviador", price: 18000, color: "#07a7a4" },
]

export const RGB_MODES: RgbOption[] = [
  { id: "apagada", name: "Apagada", detail: "Sin retroiluminación", price: 0 },
  { id: "fija", name: "Fija", detail: "Un color parejo", price: 9000 },
  { id: "ola", name: "Ola", detail: "El color recorre el teclado", price: 12000 },
]

export const RGB_PRESETS: { name: string; hex: string }[] = [
  { name: "Ámbar", hex: "#ff9a2e" },
  { name: "Rojo", hex: "#ff3b30" },
  { name: "Blanco cálido", hex: "#ffe2b8" },
  { name: "Turquesa", hex: "#19c2bf" },
  { name: "Rosa", hex: "#ff5fa8" },
]

export const ENGRAVING_PRICE = 6500

export const DEFAULT_CONFIG: Config = {
  format: "75",
  case: "grafito",
  plate: "aluminio",
  switches: "tactil",
  keycaps: "malbec",
  knob: "aluminio",
  cable: "ciruela",
  rgbMode: "apagada",
  rgbColor: "#ff9a2e",
  engraving: "",
}

const byId = <T extends { id: string }>(list: T[], id: string): T =>
  list.find((item) => item.id === id) ?? list[0]

export const getFormat = (id: FormatId) => byId(FORMATS, id)
export const getCase = (id: CaseId) => byId(CASES, id)
export const getPlate = (id: PlateId) => byId(PLATES, id)
export const getSwitch = (id: SwitchId) => byId(SWITCHES, id)
export const getKeycapSet = (id: KeycapSetId) => byId(KEYCAP_SETS, id)
export const getKnob = (id: KnobId) => byId(KNOBS, id)
export const getCable = (id: CableId) => byId(CABLES, id)
export const getRgb = (id: RgbMode) => byId(RGB_MODES, id)

export function knobColor(config: Config): string | null {
  const knob = getKnob(config.knob)
  if (knob.id === "ninguna") return null
  return knob.color ?? getCase(config.case).color
}

export interface PriceLine {
  label: string
  value: string
  price: number
}

export function priceLines(config: Config): PriceLine[] {
  const format = getFormat(config.format)
  const caseOpt = getCase(config.case)
  const plate = getPlate(config.plate)
  const sw = getSwitch(config.switches)
  const caps = getKeycapSet(config.keycaps)
  const knob = getKnob(config.knob)
  const cable = getCable(config.cable)
  const rgb = getRgb(config.rgbMode)
  const engraving = config.engraving.trim()

  return [
    { label: "Formato", value: format.name, price: format.price },
    { label: "Carcasa", value: `${caseOpt.name}, ${caseOpt.detail.toLowerCase()}`, price: caseOpt.price },
    { label: "Placa", value: plate.name, price: plate.price },
    { label: "Switches", value: sw.name, price: sw.price },
    { label: "Teclas", value: caps.name, price: caps.price },
    { label: "Perilla", value: knob.name, price: knob.price },
    { label: "Cable", value: cable.name, price: cable.price },
    { label: "Luces", value: rgb.name, price: rgb.price },
    {
      label: "Grabado",
      value: engraving ? `“${engraving}”` : "Sin grabado",
      price: engraving ? ENGRAVING_PRICE : 0,
    },
  ]
}

export function totalPrice(config: Config): number {
  return priceLines(config).reduce((sum, line) => sum + line.price, 0)
}

const ars = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 })

export function formatPrice(value: number): string {
  return `$ ${ars.format(Math.round(value))}`
}

export function formatDelta(value: number): string {
  if (value === 0) return "Incluido"
  return `+ ${formatPrice(value)}`
}

// ---------- configuración en la URL ----------

const PARAMS: Record<keyof Config, string> = {
  format: "f",
  case: "c",
  plate: "p",
  switches: "s",
  keycaps: "k",
  knob: "pe",
  cable: "ca",
  rgbMode: "l",
  rgbColor: "lc",
  engraving: "g",
}

const VALID: Partial<Record<keyof Config, readonly string[]>> = {
  format: FORMATS.map((o) => o.id),
  case: CASES.map((o) => o.id),
  plate: PLATES.map((o) => o.id),
  switches: SWITCHES.map((o) => o.id),
  keycaps: KEYCAP_SETS.map((o) => o.id),
  knob: KNOBS.map((o) => o.id),
  cable: CABLES.map((o) => o.id),
  rgbMode: RGB_MODES.map((o) => o.id),
}

export function configToParams(config: Config): URLSearchParams {
  const params = new URLSearchParams()
  for (const key of Object.keys(PARAMS) as (keyof Config)[]) {
    const value = config[key]
    if (key === "rgbColor") {
      params.set(PARAMS[key], value.replace("#", ""))
    } else if (key === "engraving") {
      if (value.trim()) params.set(PARAMS[key], value.trim())
    } else {
      params.set(PARAMS[key], value)
    }
  }
  return params
}

export function configFromParams(search: string): Config | null {
  const params = new URLSearchParams(search)
  if (!params.has(PARAMS.format)) return null
  const next: Config = { ...DEFAULT_CONFIG }
  for (const key of Object.keys(PARAMS) as (keyof Config)[]) {
    const raw = params.get(PARAMS[key])
    if (raw === null) continue
    if (key === "rgbColor") {
      if (/^[0-9a-f]{6}$/i.test(raw)) next.rgbColor = `#${raw.toLowerCase()}`
    } else if (key === "engraving") {
      next.engraving = raw.slice(0, ENGRAVING_MAX)
    } else if (VALID[key]?.includes(raw)) {
      ;(next as unknown as Record<string, string>)[key] = raw
    }
  }
  return next
}

export function shareUrl(config: Config): string {
  const url = new URL(window.location.href)
  url.search = configToParams(config).toString()
  url.hash = "configurador"
  return url.toString()
}
