import { useId } from "react"

import {
  getCase,
  getKeycapSet,
  getPlate,
  knobColor,
  type Config,
} from "@/data/catalog"
import { LAYOUTS } from "@/data/layouts"
import { cn } from "@/lib/utils"

/*
  Vista superior del teclado dibujada a partir de los mismos datos de layout
  que usa el modelo 3D. Sirve como mini preview en el carrusel, en la galería
  y como silueta mientras carga el 3D.
*/

const PX = 10

interface KeyboardPreviewProps {
  config: Config
  className?: string
  /** dibuja todo en gris, para el estado de carga */
  skeleton?: boolean
  title?: string
}

export function KeyboardPreview({ config, className, skeleton = false, title }: KeyboardPreviewProps) {
  const uid = useId().replace(/:/g, "")
  const layout = LAYOUTS[config.format]
  const caseOpt = getCase(config.case)
  const plate = getPlate(config.plate)
  const caps = getKeycapSet(config.keycaps)
  const knob = knobColor(config)
  const glow = config.rgbMode !== "apagada"

  const { width, depth, bezel } = layout
  const W = (width + bezel.side * 2) * PX
  const D = (depth + bezel.top + bezel.bottom) * PX
  const ox = bezel.side * PX
  const oy = bezel.top * PX

  const fill = (kind: string) => {
    if (skeleton) return "var(--card)"
    if (kind === "mod") return caps.mod
    if (kind === "accent") return caps.accent
    return caps.alpha
  }

  const caseFill = skeleton ? "var(--input)" : caseOpt.color
  const translucent = caseOpt.material === "policarbonato" && !skeleton

  return (
    <svg
      viewBox={`-4 -4 ${W + 8} ${D + 10}`}
      className={cn("block h-auto w-full", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <defs>
        <linearGradient id={`sheen-${uid}`} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity={translucent ? 0.5 : 0.28} />
          <stop offset="0.45" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.18" />
        </linearGradient>
        <filter id={`glow-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* sombra de apoyo */}
      <rect x={4} y={8} width={W - 8} height={D} rx={PX * 0.5} fill="rgb(var(--shadow-rgb) / 0.18)" />
      <rect
        width={W}
        height={D}
        rx={PX * 0.5}
        fill={caseFill}
        fillOpacity={translucent ? 0.78 : 1}
        stroke={translucent ? "#b8c6cf" : "none"}
        strokeWidth={translucent ? 1 : 0}
      />
      <rect width={W} height={D} rx={PX * 0.5} fill={`url(#sheen-${uid})`} />

      <rect
        x={ox - PX * 0.06}
        y={oy - PX * 0.06}
        width={width * PX + PX * 0.12}
        height={depth * PX + PX * 0.12}
        rx={2}
        fill={skeleton ? "var(--border)" : plate.color}
      />
      {glow && !skeleton ? (
        <rect
          x={ox}
          y={oy}
          width={width * PX}
          height={depth * PX}
          fill={config.rgbColor}
          opacity={0.85}
          filter={`url(#glow-${uid})`}
        />
      ) : null}

      {layout.keys.map((key) => {
        const x = ox + key.x * PX + 0.45
        const y = oy + key.y * PX + 0.45
        const w = key.w * PX - 0.9
        const h = PX - 0.9
        const f = fill(key.kind)
        return (
          <g key={key.id}>
            <rect x={x} y={y} width={w} height={h} rx={1.4} fill={f} />
            <rect x={x + 1.3} y={y + 0.9} width={w - 2.6} height={h - 2.4} rx={1.1} fill="#ffffff" fillOpacity={0.14} />
          </g>
        )
      })}

      {knob && !skeleton ? (
        <g>
          <circle cx={ox + layout.knob.x * PX} cy={oy + layout.knob.y * PX} r={PX * 0.44} fill={knob} />
          <circle
            cx={ox + layout.knob.x * PX}
            cy={oy + layout.knob.y * PX}
            r={PX * 0.44}
            fill="none"
            stroke="#000"
            strokeOpacity={0.25}
            strokeWidth={1.2}
            strokeDasharray="1 1.2"
          />
          <circle cx={ox + layout.knob.x * PX} cy={oy + layout.knob.y * PX} r={PX * 0.26} fill="#fff" fillOpacity={0.22} />
        </g>
      ) : null}
    </svg>
  )
}
