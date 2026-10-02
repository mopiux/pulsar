import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react"
import { animate, motion, useDragControls, useMotionValue, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

interface MobileSheetProps {
  header: ReactNode
  children: ReactNode
  /** alto visible de la hoja, para correr el encuadre del 3D */
  onVisibleHeight: (px: number) => void
  className?: string
}

/**
 * Panel inferior deslizable para pantallas chicas: se arrastra desde la
 * manija para bajarlo (deja ver el teclado entero) o subirlo.
 */
export function MobileSheet({ header, children, onVisibleHeight, className }: MobileSheetProps) {
  const reduce = useReducedMotion()
  const sheetRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const [heights, setHeights] = useState({ sheet: 0, peek: 0 })
  const [collapsed, setCollapsed] = useState(false)
  const y = useMotionValue(0)
  const controls = useDragControls()

  useLayoutEffect(() => {
    const sheet = sheetRef.current
    const head = headerRef.current
    if (!sheet || !head) return
    const measure = () =>
      setHeights({ sheet: sheet.getBoundingClientRect().height, peek: head.getBoundingClientRect().height + 20 })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(sheet)
    ro.observe(head)
    return () => ro.disconnect()
  }, [])

  const maxOffset = Math.max(0, heights.sheet - heights.peek)

  useEffect(() => {
    const target = collapsed ? maxOffset : 0
    if (reduce) y.set(target)
    else {
      const anim = animate(y, target, { type: "spring", stiffness: 380, damping: 36 })
      return () => anim.stop()
    }
  }, [collapsed, maxOffset, reduce, y])

  useEffect(() => {
    onVisibleHeight(collapsed ? heights.peek : heights.sheet)
  }, [collapsed, heights, onVisibleHeight])

  return (
    <motion.div
      ref={sheetRef}
      drag="y"
      dragListener={false}
      dragControls={controls}
      dragConstraints={{ top: 0, bottom: maxOffset }}
      dragElastic={0.08}
      dragMomentum={false}
      style={{ y }}
      onDragEnd={(_, info) => {
        const next = info.velocity.y > 280 || (info.velocity.y > -280 && y.get() > maxOffset / 2)
        setCollapsed(next)
        if (next === collapsed) animate(y, next ? maxOffset : 0, { type: "spring", stiffness: 380, damping: 36 })
      }}
      className={cn(
        "absolute inset-x-0 bottom-0 z-(--z-sheet) flex max-h-[74%] flex-col bg-card text-card-foreground shadow-[0_-12px_32px_-12px_rgba(46,22,37,0.35)]",
        className
      )}
    >
      <div
        ref={headerRef}
        className="shrink-0 cursor-grab touch-none active:cursor-grabbing"
        onPointerDown={(event) => controls.start(event)}
      >
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Mostrar opciones" : "Bajar el panel para ver el teclado"}
          className="flex w-full justify-center pt-2.5 pb-1.5 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/60"
        >
          <span className="h-1.5 w-12 bg-input" />
        </button>
        {header}
      </div>
      <div className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain", collapsed && "invisible")}>{children}</div>
    </motion.div>
  )
}
