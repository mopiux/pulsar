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
  /** fondo del póster, de la paleta medida en la mitad "VOTE" de ref-2 */
  poster: string
  ink: "light" | "dark"
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
    poster: "#db2224",
    ink: "light",
    config: {
      format: "tkl",
      case: "grafito",
      plate: "aluminio",
      switches: "clicky",
      keycaps: "medianoche",
      knob: "ninguna",
      cable: "mostaza",
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
    poster: "#8f1626",
    ink: "light",
    config: {
      format: "75",
      case: "ciruela",
      plate: "laton",
      switches: "tactil",
      keycaps: "malbec",
      knob: "laton",
      cable: "ciruela",
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
    poster: "#e4e1dc",
    ink: "dark",
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
    poster: "#067f7c",
    ink: "light",
    config: {
      format: "75",
      case: "hielo",
      plate: "policarbonato",
      switches: "lineal",
      keycaps: "rio",
      knob: "aluminio",
      cable: "turquesa",
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
    poster: "#834d3a",
    ink: "light",
    config: {
      format: "tkl",
      case: "mostaza",
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
    poster: "#1d1817",
    ink: "light",
    config: {
      format: "60",
      case: "turquesa",
      plate: "aluminio",
      switches: "clicky",
      keycaps: "yerba",
      knob: "ninguna",
      cable: "turquesa",
      rgbMode: "ola",
      rgbColor: "#19c2bf",
      engraving: "",
    },
  },
]

export type GalleryFilter = "recientes" | "tendencia" | "votados"

export const GALLERY_FILTERS: { id: GalleryFilter; label: string; color: string; ink: string }[] = [
  { id: "recientes", label: "Recientes", color: "#d6a020", ink: "#410b29" },
  { id: "tendencia", label: "Tendencia", color: "#07a7a4", ink: "#1d1817" },
  { id: "votados", label: "Más votados", color: "#db2224", ink: "#f1f1f1" },
]
