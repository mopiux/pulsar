import type { Config } from "./catalog"

export interface CommunityBuild {
  id: string
  name: string
  author: string
  /** fecha de publicación ISO */
  publishedAt: string
  votes: number
  /** votos de los últimos 7 días, para "Tendencia" */
  weeklyVotes: number
  config: Config
}

export const COMMUNITY_BUILDS: CommunityBuild[] = [
  {
    id: "bondi-nocturno",
    name: "Bondi nocturno",
    author: "Martina Iturralde",
    publishedAt: "2026-09-29",
    votes: 214,
    weeklyVotes: 61,
    config: {
      format: "tkl",
      case: "grafito",
      plate: "aluminio",
      switches: "clicky",
      keycaps: "medianoche",
      knob: "ninguna",
      cable: "coral",
      rgbMode: "ola",
      rgbColor: "#ff9a2e",
      engraving: "Línea 152",
    },
  },
  {
    id: "malbec-reserva",
    name: "Malbec reserva",
    author: "Facundo Arregui",
    publishedAt: "2026-09-18",
    votes: 388,
    weeklyVotes: 22,
    config: {
      format: "75",
      case: "arena",
      plate: "laton",
      switches: "tactil",
      keycaps: "malbec",
      knob: "laton",
      cable: "hueso",
      rgbMode: "apagada",
      rgbColor: "#ffe2b8",
      engraving: "",
    },
  },
  {
    id: "mate-amargo",
    name: "Mate amargo",
    author: "Lucía Benavídez",
    publishedAt: "2026-09-30",
    votes: 176,
    weeklyVotes: 74,
    config: {
      format: "60",
      case: "plata",
      plate: "fr4",
      switches: "lineal",
      keycaps: "yerba",
      knob: "ninguna",
      cable: "grafito",
      rgbMode: "apagada",
      rgbColor: "#ff9a2e",
      engraving: "Cebame otro",
    },
  },
  {
    id: "costanera",
    name: "Costanera",
    author: "Tomás Quiroga",
    publishedAt: "2026-09-05",
    votes: 452,
    weeklyVotes: 18,
    config: {
      format: "75",
      case: "hielo",
      plate: "policarbonato",
      switches: "lineal",
      keycaps: "rio",
      knob: "aluminio",
      cable: "hueso",
      rgbMode: "fija",
      rgbColor: "#ffe2b8",
      engraving: "Costanera Sur",
    },
  },
  {
    id: "dulce-de-leche",
    name: "Dulce de leche",
    author: "Valentina Sosa Ruiz",
    publishedAt: "2026-09-26",
    votes: 129,
    weeklyVotes: 47,
    config: {
      format: "tkl",
      case: "arena",
      plate: "laton",
      switches: "tactil",
      keycaps: "medianoche",
      knob: "laton",
      cable: "grafito",
      rgbMode: "fija",
      rgbColor: "#ff9a2e",
      engraving: "Che, tipeá",
    },
  },
  {
    id: "riachuelo",
    name: "Riachuelo",
    author: "Ignacio Ferrán",
    publishedAt: "2026-08-30",
    votes: 301,
    weeklyVotes: 12,
    config: {
      format: "60",
      case: "salvia",
      plate: "aluminio",
      switches: "clicky",
      keycaps: "yerba",
      knob: "ninguna",
      cable: "salvia",
      rgbMode: "ola",
      rgbColor: "#19c2bf",
      engraving: "",
    },
  },
]

export type GalleryFilter = "recientes" | "tendencia" | "votados"

export const GALLERY_FILTERS: { id: GalleryFilter; label: string }[] = [
  { id: "recientes", label: "Recientes" },
  { id: "tendencia", label: "Tendencia" },
  { id: "votados", label: "Más votados" },
]
