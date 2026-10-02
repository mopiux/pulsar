import { createContext, useContext } from "react"

/**
 * high: transmisión real en resina y policarbonato, sombras a 512 px.
 * low: mobile o equipo que no sostiene los FPS; materiales translúcidos sin
 * transmisión y sombras a menor resolución.
 */
export type QualityTier = "high" | "low"

export const QualityContext = createContext<QualityTier>("high")

export function useQuality() {
  return useContext(QualityContext)
}
