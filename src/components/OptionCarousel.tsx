import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react"
import { CaretLeft, CaretRight } from "@phosphor-icons/react"
import { animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue, type PanInfo } from "motion/react"

import { cn } from "@/lib/utils"

/*
  Adaptado de React Bits (Carousel): pista arrastrable con umbral de
  velocidad, resorte al soltar y giro leve en Y según la distancia al centro.
  Cambios: la opción centrada es la elegida, la inercia proyecta varios
  pasos según la velocidad, flechas laterales y clic para centrar. Estética
  de catálogo: muestras en superficies neutras, sin tarjetas pesadas.
*/

export interface CarouselOption {
  id: string
  name: string
  price: string
  preview: ReactNode
}

interface OptionCarouselProps {
  options: CarouselOption[]
  value: string
  onChange: (id: string) => void
  label: string
}

const SPRING = { type: "spring" as const, stiffness: 320, damping: 34 }

export function OptionCarousel({ options, value, onChange, label }: OptionCarouselProps) {
  const reduce = useReducedMotion()
  const viewport = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const x = useMotionValue(0)
  const dragging = useRef(false)

  const itemWidth = width < 520 ? 112 : 128
  const gap = width < 520 ? 8 : 12
  const step = itemWidth + gap
  const index = Math.max(0, options.findIndex((o) => o.id === value))
  const targetX = width / 2 - itemWidth / 2 - index * step

  useLayoutEffect(() => {
    const el = viewport.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    ro.observe(el)
    setWidth(el.getBoundingClientRect().width)
    return () => ro.disconnect()
  }, [])

  const first = useRef(true)
  useEffect(() => {
    if (!width) return
    if (first.current || reduce) {
      x.set(targetX)
      first.current = false
      return
    }
    const controls = animate(x, targetX, SPRING)
    return () => controls.stop()
  }, [targetX, width, reduce, x])

  const select = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(options.length - 1, next))
      if (clamped !== index) onChange(options[clamped].id)
      else animate(x, targetX, SPRING)
    },
    [index, onChange, options, targetX, x]
  )

  const onDragEnd = (_: unknown, info: PanInfo) => {
    // inercia: proyecta la posición según la velocidad del gesto
    const projected = x.get() + info.velocity.x * (reduce ? 0 : 0.22)
    select(Math.round((width / 2 - itemWidth / 2 - projected) / step))
    window.setTimeout(() => (dragging.current = false), 0)
  }

  const arrow =
    "absolute top-[38px] z-10 hidden size-8 -translate-y-1/2 place-items-center rounded-full border bg-card text-foreground shadow-soft transition-opacity outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/45 disabled:pointer-events-none disabled:opacity-0 sm:grid"

  return (
    <div className="relative">
      <div
        ref={viewport}
        role="radiogroup"
        aria-label={label}
        className="relative overflow-hidden py-1 select-none [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]"
        style={{ perspective: 900, touchAction: "pan-y" }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault()
            select(index + 1)
          } else if (event.key === "ArrowLeft") {
            event.preventDefault()
            select(index - 1)
          }
        }}
      >
        <motion.div
          className="flex w-max cursor-grab items-start active:cursor-grabbing"
          style={{ x, gap }}
          drag="x"
          dragElastic={0.12}
          dragMomentum={false}
          onDragStart={() => (dragging.current = true)}
          onDragEnd={onDragEnd}
        >
          {options.map((option, i) => (
            <CarouselItem
              key={option.id}
              option={option}
              index={i}
              selected={i === index}
              x={x}
              itemWidth={itemWidth}
              step={step}
              viewportWidth={width}
              onSelect={() => {
                if (!dragging.current) select(i)
              }}
            />
          ))}
        </motion.div>
      </div>

      <button type="button" onClick={() => select(index - 1)} disabled={index === 0} className={cn(arrow, "left-1")} aria-label="Opción anterior">
        <CaretLeft weight="bold" className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => select(index + 1)}
        disabled={index === options.length - 1}
        className={cn(arrow, "right-1")}
        aria-label="Opción siguiente"
      >
        <CaretRight weight="bold" className="size-4" />
      </button>
    </div>
  )
}

interface CarouselItemProps {
  option: CarouselOption
  index: number
  selected: boolean
  x: MotionValue<number>
  itemWidth: number
  step: number
  viewportWidth: number
  onSelect: () => void
}

function CarouselItem({ option, index, selected, x, itemWidth, step, viewportWidth, onSelect }: CarouselItemProps) {
  const center = viewportWidth / 2 - itemWidth / 2 - index * step
  const range = [center - step * 2, center - step, center, center + step, center + step * 2]
  const rotateY = useTransform(x, range, [18, 10, 0, -10, -18])
  const opacity = useTransform(x, range, [0.4, 0.75, 1, 0.75, 0.4])

  return (
    <motion.button
      type="button"
      role="radio"
      aria-checked={selected}
      tabIndex={selected ? 0 : -1}
      onClick={onSelect}
      style={{ width: itemWidth, rotateY, opacity }}
      className="group flex shrink-0 flex-col items-stretch gap-1.5 text-center outline-none"
    >
      <span
        className={cn(
          "flex h-[76px] items-center justify-center rounded-xl px-2.5 py-2 transition-[background-color,box-shadow] duration-200",
          selected
            ? "bg-background shadow-[inset_0_0_0_2px_var(--foreground)]"
            : "bg-background/60 group-hover:bg-background group-focus-visible:shadow-[inset_0_0_0_2px_var(--ring)]"
        )}
        draggable={false}
      >
        {option.preview}
      </span>
      <span className="flex flex-col leading-tight">
        <span className={cn("truncate text-[13px] font-medium", selected ? "text-foreground" : "text-muted-foreground")}>
          {option.name}
        </span>
        <span className="text-[11px] text-muted-foreground tabular-nums">{option.price}</span>
      </span>
    </motion.button>
  )
}
