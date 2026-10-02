import { useEffect, useRef, type ComponentPropsWithoutRef } from "react"
import { useMotionValue, useReducedMotion, useSpring } from "motion/react"

import { cn } from "@/lib/utils"

/*
  Adaptado de Magic UI (NumberTicker). Cambios: anima desde el valor anterior
  a cada cambio de opción (no solo al entrar en pantalla), formatea en pesos
  con es-AR y respeta prefers-reduced-motion.
*/

const formatter = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 })

interface NumberTickerProps extends ComponentPropsWithoutRef<"span"> {
  value: number
  prefix?: string
}

export function NumberTicker({ value, prefix = "$ ", className, ...props }: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduce = useReducedMotion()
  const motionValue = useMotionValue(value)
  const spring = useSpring(motionValue, { damping: 30, stiffness: 140 })

  useEffect(() => {
    if (reduce) {
      spring.jump(value)
      motionValue.jump(value)
    } else {
      motionValue.set(value)
    }
  }, [value, reduce, motionValue, spring])

  useEffect(
    () =>
      spring.on("change", (latest) => {
        if (ref.current) ref.current.textContent = `${prefix}${formatter.format(Math.round(latest))}`
      }),
    [spring, prefix]
  )

  return (
    <span ref={ref} className={cn("inline-block tabular-nums", className)} {...props}>
      {`${prefix}${formatter.format(value)}`}
    </span>
  )
}
