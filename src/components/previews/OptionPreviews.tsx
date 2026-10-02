import { useId } from "react"

import type { CableOption, KeycapSet, KnobOption, PlateOption, SwitchOption } from "@/data/catalog"

/*
  Muestras chicas de cada opción, generadas desde los datos del catálogo:
  colores reales del material, sin ilustraciones decorativas.
*/

export function PlateSwatch({ plate }: { plate: PlateOption }) {
  const uid = useId().replace(/:/g, "")
  const holes: [number, number][] = []
  for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) holes.push([c, r])
  return (
    <svg viewBox="0 0 120 64" className="h-auto w-full" aria-hidden="true">
      <defs>
        <linearGradient id={`p-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity={plate.metalness > 0.5 ? 0.45 : 0.15} />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="#000000" stopOpacity={plate.metalness > 0.5 ? 0.25 : 0.1} />
        </linearGradient>
        <mask id={`m-${uid}`}>
          <rect width="120" height="64" fill="#fff" />
          {holes.map(([c, r]) => (
            <rect key={`${c}-${r}`} x={8 + c * 18} y={8 + r * 17} width="14" height="13" rx="1" fill="#000" />
          ))}
        </mask>
      </defs>
      <g mask={`url(#m-${uid})`}>
        <rect width="120" height="64" rx="3" fill={plate.translucent ? "#d4dde3" : plate.color} fillOpacity={plate.translucent ? 0.85 : 1} />
        <rect width="120" height="64" rx="3" fill={`url(#p-${uid})`} />
      </g>
      <rect
        x="0.5"
        y="0.5"
        width="119"
        height="63"
        rx="3"
        fill="none"
        stroke={plate.translucent ? "#9fb0bc" : "var(--muted-foreground)"}
        strokeOpacity={plate.translucent ? 1 : 0.45}
      />
    </svg>
  )
}

export function SwitchSwatch({ option }: { option: SwitchOption }) {
  const light = option.housing.toLowerCase() === "#e9ecef"
  return (
    <svg viewBox="0 0 120 80" className="h-auto w-full" aria-hidden="true">
      {/* vástago en cruz visto desde arriba, sobre la carcasa del switch */}
      <rect x="30" y="10" width="60" height="60" rx="5" fill={option.housing} stroke={light ? "#b9bcc0" : "none"} />
      <rect x="38" y="18" width="44" height="44" rx="4" fill="#ffffff" fillOpacity={light ? 0.5 : 0.08} />
      <circle cx="60" cy="40" r="15" fill={option.stem} />
      <rect x="56.5" y="29" width="7" height="22" rx="1" fill="#000" fillOpacity="0.28" />
      <rect x="49" y="36.5" width="22" height="7" rx="1" fill="#000" fillOpacity="0.28" />
    </svg>
  )
}

export function KeycapSwatch({ set }: { set: KeycapSet }) {
  const caps = [
    { label: "Esc", fill: set.accent, ink: set.accentLegend, w: 26, resin: set.resinAccent },
    { label: "A", fill: set.alpha, ink: set.alphaLegend, w: 26, resin: false },
    { label: "S", fill: set.alpha, ink: set.alphaLegend, w: 26, resin: false },
    { label: "Fn", fill: set.mod, ink: set.modLegend, w: 26, resin: false },
  ]
  let x = 4
  return (
    <svg viewBox="0 0 124 46" className="h-auto w-full" aria-hidden="true">
      {caps.map((cap) => {
        const cx = x
        x += cap.w + 4
        return (
          <g key={cap.label}>
            <rect x={cx} y={8} width={cap.w} height={34} rx={4} fill="#000" fillOpacity={0.18} />
            <rect x={cx} y={4} width={cap.w} height={34} rx={4} fill={cap.fill} fillOpacity={cap.resin ? 0.82 : 1} />
            <rect x={cx + 3} y={6} width={cap.w - 6} height={26} rx={3} fill="#fff" fillOpacity={cap.resin ? 0.3 : 0.12} />
            <text
              x={cx + cap.w / 2}
              y={23}
              textAnchor="middle"
              dominantBaseline="middle"
              fontFamily="Geist Variable, sans-serif"
              fontWeight={560}
              fontSize={11}
              fill={cap.ink}
            >
              {cap.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export function KnobSwatch({ option, color }: { option: KnobOption; color: string | null }) {
  if (!color) {
    return (
      <svg viewBox="0 0 120 80" className="h-auto w-full" aria-hidden="true">
        <circle cx="60" cy="40" r="24" fill="none" stroke="var(--muted-foreground)" strokeWidth="2" strokeDasharray="5 5" />
        <path d="M44 56 L76 24" stroke="var(--muted-foreground)" strokeWidth="2" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 120 80" className="h-auto w-full" aria-hidden="true">
      <circle cx="60" cy="44" r="25" fill="#000" fillOpacity="0.18" />
      <circle cx="60" cy="40" r="25" fill={color} />
      <circle cx="60" cy="40" r="25" fill="none" stroke="#000" strokeOpacity="0.3" strokeWidth="3" strokeDasharray="2 2.2" />
      <circle cx="60" cy="40" r="17" fill="#fff" fillOpacity={option.id === "laton" ? 0.28 : 0.18} />
      <rect x="58.5" y="22" width="3" height="10" rx="1" fill="#f1f1f1" />
    </svg>
  )
}

export function CableSwatch({ option }: { option: CableOption }) {
  const loops = Array.from({ length: 9 }, (_, i) => 22 + i * 8)
  return (
    <svg viewBox="0 0 120 80" className="h-auto w-full" aria-hidden="true">
      <path d="M4 40 L20 40" stroke={option.color} strokeWidth="5" strokeLinecap="round" />
      {loops.map((x) => (
        <ellipse key={x} cx={x} cy="40" rx="5" ry="13" fill="none" stroke={option.color} strokeWidth="4.5" />
      ))}
      <path d="M90 40 L98 40" stroke={option.color} strokeWidth="5" strokeLinecap="round" />
      <rect x="98" y="33" width="16" height="14" rx="2" fill="#c9ccd0" />
      <rect x="98" y="33" width="5" height="14" rx="1" fill="#1f1f22" />
    </svg>
  )
}
