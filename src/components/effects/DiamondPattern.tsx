import { useId } from "react"

import { cn } from "@/lib/utils"

/*
  Adaptado de Magic UI (GridPattern). En vez de una grilla de cuadrados dibuja
  el arlequín de rombos de ref-1: rombos alargados apenas más oscuros que el
  fondo y algunas celdas resaltadas, sin trazos.
*/

interface DiamondPatternProps {
  width?: number
  height?: number
  /** celdas resaltadas [columna, fila] */
  cells?: Array<[number, number]>
  className?: string
}

export function DiamondPattern({ width = 132, height = 176, cells = [], className }: DiamondPatternProps) {
  const id = useId()
  const w = width
  const h = height
  const diamond = `M${w / 2} 0 L${w} ${h / 2} L${w / 2} ${h} L0 ${h / 2} Z`

  return (
    <svg aria-hidden="true" className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}>
      <defs>
        <pattern id={id} width={w} height={h} patternUnits="userSpaceOnUse">
          <rect width={w} height={h} fill="var(--pattern-base)" />
          <path d={diamond} fill="var(--pattern-diamond)" />
          {/* media luz en la mitad izquierda de cada rombo, como en ref-1 */}
          <path d={`M${w / 2} 0 L${w / 2} ${h} L0 ${h / 2} Z`} fill="var(--pattern-cell)" opacity="0.45" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
      {cells.map(([cx, cy]) => (
        <path
          key={`${cx}-${cy}`}
          transform={`translate(${cx * w} ${cy * h})`}
          d={diamond}
          fill="var(--pattern-cell)"
        />
      ))}
    </svg>
  )
}
