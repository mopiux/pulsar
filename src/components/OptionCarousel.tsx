import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react"
import { CaretLeft, CaretRight } from "@phosphor-icons/react"
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
  type PanInfo,
} from "motion/react"

import { cn } from "@/lib/utils"

/*
  Adaptado de React Bits (Carousel): pista arrastrable con umbral de
  velocidad, resorte al soltar y giro en Y según la distancia al centro.
  Cambios: la opción centrada es la elegida, la inercia proyecta varios
  pasos según la velocidad, flechas laterales, clic para centrar y estilo
  de la banda de ingredientes de ref-1 (sin tarjetas, nombre debajo).
*/

export interface CarouselOption {
  id: string
  name: string
  detail: string
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

  const itemWidth = width < 560 ? 132 : 184
  const gap = width < 560 ? 12 : 28
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
    const next = Math.round((width / 2 - itemWidth / 2 - projected) / step)
    select(next)
    window.setTimeout(() => (dragging.current = false), 0)
  }

  return (
    <div className="relative">
      <div
        ref={viewport}
        role="radiogroup"
        aria-label={label}
        className="relative overflow-hidden py-3 select-none"
        style={{ perspective: 1000, touchAction: "pan-y" }}
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

      <button
        type="button"
        onClick={() => select(index - 1)}
        disabled={index === 0}
        className="absolute top-1/2 left-1 hidden size-10 -translate-y-1/2 place-items-center bg-card text-primary shadow-medium transition-[opacity,transform] outline-none hover:-translate-x-0.5 focus-visible:ring-[3px] focus-visible:ring-ring/60 disabled:pointer-events-none disabled:opacity-0 sm:left-4 sm:grid"
        aria-label="Opción anterior"
      >
        <CaretLeft weight="bold" className="size-5" />
      </button>
      <button
        type="button"
        onClick={() => select(index + 1)}
        disabled={index === options.length - 1}
        className="absolute top-1/2 right-1 hidden size-10 -translate-y-1/2 place-items-center bg-card text-primary shadow-medium transition-[opacity,transform] outline-none hover:translate-x-0.5 focus-visible:ring-[3px] focus-visible:ring-ring/60 disabled:pointer-events-none disabled:opacity-0 sm:right-4 sm:grid"
        aria-label="Opción siguiente"
      >
        <CaretRight weight="bold" className="size-5" />
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
  const rotateY = useTransform(x, range, [38, 22, 0, -22, -38])
  const scale = useTransform(x, range, [0.78, 0.88, 1, 0.88, 0.78])
  const opacity = useTransform(x, range, [0.35, 0.7, 1, 0.7, 0.35])

  return (
    <motion.button
      type="button"
      role="radio"
      aria-checked={selected}
      tabIndex={selected ? 0 : -1}
      onClick={onSelect}
      style={{ width: itemWidth, rotateY, scale, opacity }}
      className="group flex shrink-0 flex-col items-center gap-2 px-1 pt-1 text-center outline-none focus-visible:ring-[3px] focus-visible:ring-ring/60"
    >
      <span
        className={cn(
          "flex h-[76px] w-full items-center justify-center transition-transform duration-300 ease-(--ease-encastre) sm:h-[92px]",
          selected ? "-translate-y-1" : "group-hover:-translate-y-0.5"
        )}
        draggable={false}
      >
        {option.preview}
      </span>
      <span
        className={cn(
          "font-display text-[15px] leading-tight font-semibold tracking-wide uppercase sm:text-base",
          selected ? "text-heading" : "text-muted-foreground"
        )}
      >
        {option.name}
      </span>
      <span className="text-xs leading-tight text-muted-foreground">
        {option.detail}
        <span className={cn("mt-0.5 block font-medium", selected ? "text-foreground" : "text-muted-foreground")}>
          {option.price}
        </span>
      </span>
    </motion.button>
  )
}
