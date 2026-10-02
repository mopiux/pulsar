import { create } from "zustand"

import { DEFAULT_CONFIG, type Config } from "@/data/catalog"

export type StepId = "carcasa" | "placa" | "switches" | "teclas" | "detalles"
export type SubId =
  | "formato"
  | "color"
  | "placa"
  | "switches"
  | "teclas"
  | "perilla"
  | "cable"
  | "luces"
  | "grabado"

export interface StepDef {
  id: StepId
  label: string
  title: string
  hint: string
  subs: { id: SubId; label: string }[]
}

export const STEPS: StepDef[] = [
  {
    id: "carcasa",
    label: "Carcasa",
    title: "Empezá por la carcasa",
    hint: "Elegí formato y color. Es la base que va sobre la mesa.",
    subs: [
      { id: "formato", label: "Formato" },
      { id: "color", label: "Color" },
    ],
  },
  {
    id: "placa",
    label: "Placa",
    title: "Sumá la placa",
    hint: "Sostiene los switches y cambia cómo suena cada tecla.",
    subs: [{ id: "placa", label: "Material" }],
  },
  {
    id: "switches",
    label: "Switches",
    title: "Elegí cómo suena",
    hint: "Tocá una opción para escucharla. También podés tipear.",
    subs: [{ id: "switches", label: "Tipo" }],
  },
  {
    id: "teclas",
    label: "Teclas",
    title: "Vestilo con teclas",
    hint: "Cuatro juegos con perfil escalonado y teclas de acento.",
    subs: [{ id: "teclas", label: "Juego" }],
  },
  {
    id: "detalles",
    label: "Detalles",
    title: "Los detalles lo hacen tuyo",
    hint: "Perilla, cable, luces y un grabado en la barra espaciadora.",
    subs: [
      { id: "perilla", label: "Perilla" },
      { id: "cable", label: "Cable" },
      { id: "luces", label: "Luces" },
      { id: "grabado", label: "Grabado" },
    ],
  },
]

export const LAYER_COUNT = STEPS.length

/**
 * building: las capas se apilan de abajo hacia arriba.
 * spinning: el teclado se cierra completo y gira 360°.
 * complete: teclado armado con el resumen a la vista.
 */
export type Phase = "building" | "spinning" | "complete"

interface ConfiguratorState {
  config: Config
  /** cantidad de capas encastradas, siempre un prefijo desde la carcasa */
  placed: number
  phase: Phase
  sub: Record<StepId, SubId>
  soundOn: boolean
  /** se incrementa para pedir la animación de prueba de una tecla */
  demoPress: number
  setOption: <K extends keyof Config>(key: K, value: Config[K]) => void
  setSub: (step: StepId, sub: SubId) => void
  place: () => void
  remove: () => void
  goToStep: (index: number) => void
  explode: () => void
  finishSpin: () => void
  loadConfig: (config: Config) => void
  setPlaced: (placed: number) => void
  toggleSound: () => void
  triggerDemoPress: () => void
}

export const activeStepIndex = (placed: number) => Math.min(placed, LAYER_COUNT - 1)

export const useConfigurator = create<ConfiguratorState>((set, get) => ({
  config: DEFAULT_CONFIG,
  placed: 0,
  phase: "building",
  sub: {
    carcasa: "formato",
    placa: "placa",
    switches: "switches",
    teclas: "teclas",
    detalles: "perilla",
  },
  soundOn: true,
  demoPress: 0,

  setOption: (key, value) => set((state) => ({ config: { ...state.config, [key]: value } })),

  setSub: (step, sub) => set((state) => ({ sub: { ...state.sub, [step]: sub } })),

  place: () => {
    const { placed } = get()
    if (placed >= LAYER_COUNT) return
    const next = placed + 1
    set({ placed: next, phase: next === LAYER_COUNT ? "spinning" : "building" })
  },

  remove: () => {
    const { placed } = get()
    if (placed <= 0) return
    set({ placed: placed - 1, phase: "building" })
  },

  goToStep: (index) => {
    const { placed } = get()
    if (index > placed || index < 0) return
    set({ placed: index, phase: "building" })
  },

  explode: () => set({ placed: 0, phase: "building" }),

  finishSpin: () => {
    if (get().phase === "spinning") set({ phase: "complete" })
  },

  loadConfig: (config) => set({ config, placed: LAYER_COUNT, phase: "spinning" }),

  setPlaced: (placed) =>
    set({ placed, phase: placed >= LAYER_COUNT ? "spinning" : "building" }),

  toggleSound: () => set((state) => ({ soundOn: !state.soundOn })),

  triggerDemoPress: () => set((state) => ({ demoPress: state.demoPress + 1 })),
}))
