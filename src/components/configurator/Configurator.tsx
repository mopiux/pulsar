import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { Keyboard as KeyboardIcon } from "@phosphor-icons/react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { KeyboardPreview } from "@/components/previews/KeyboardPreview"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { LAYER_COUNT, useConfigurator } from "@/store/configurator"

import { ConfiguratorPanel } from "./ConfiguratorPanel"
import { StepIndicator } from "./StepIndicator"
import { SummaryPanel } from "./SummaryPanel"

// three.js y la escena van en un chunk aparte que se pide recién al montar
const Scene = lazy(() => import("@/three/Scene"))

const SUMMARY_WIDTH = 340

function useAssembleAll() {
  const reduce = useReducedMotion()
  const timers = useRef<number[]>([])
  const [assembling, setAssembling] = useState(false)

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), [])

  const assemble = useCallback(() => {
    const { placed, setPlaced } = useConfigurator.getState()
    if (placed >= LAYER_COUNT) return
    if (reduce) {
      setPlaced(LAYER_COUNT)
      return
    }
    setAssembling(true)
    const steps = LAYER_COUNT - placed
    for (let i = 1; i <= steps; i++) {
      timers.current.push(
        window.setTimeout(() => {
          useConfigurator.getState().setPlaced(placed + i)
          if (i === steps) setAssembling(false)
        }, (i - 1) * 280)
      )
    }
  }, [reduce])

  return { assemble, assembling }
}

/** Mide el alto de un elemento y lo actualiza al cambiar de tamaño. */
function useHeight<T extends HTMLElement>(deps: unknown[]) {
  const ref = useRef<T>(null)
  const [height, setHeight] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) {
      setHeight(0)
      return
    }
    const ro = new ResizeObserver(() => setHeight(el.getBoundingClientRect().height))
    ro.observe(el)
    setHeight(el.getBoundingClientRect().height)
    return () => ro.disconnect()
  }, deps)
  return [ref, height] as const
}

export function Configurator({ visible }: { visible: boolean }) {
  const reduce = useReducedMotion() ?? false
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const phase = useConfigurator((s) => s.phase)
  const { assemble, assembling } = useAssembleAll()

  const [ready, setReady] = useState(false)
  const onReady = useCallback(() => setReady(true), [])

  const [topRef, topH] = useHeight<HTMLDivElement>([isDesktop])
  const [bottomRef, bottomH] = useHeight<HTMLDivElement>([isDesktop, phase])
  const rootRef = useRef<HTMLElement>(null)

  // la rueda nunca desplaza la página dentro del configurador: solo la usa
  // la cámara (zoom) o una lista que tenga su propio scroll
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const onWheel = (event: WheelEvent) => {
      const scroller = (event.target as Element).closest<HTMLElement>("[data-scroll]")
      if (scroller && scroller.scrollHeight > scroller.clientHeight) return
      event.preventDefault()
    }
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [])

  const showSummary = phase === "complete"
  const cover = useMemo(
    () =>
      isDesktop
        ? {
            top: topH + 12,
            bottom: phase === "building" ? bottomH + 16 : 0,
            left: 0,
            right: showSummary ? SUMMARY_WIDTH + 20 : 0,
          }
        : { top: topH + 8, bottom: 0, left: 0, right: 0 },
    [isDesktop, topH, bottomH, phase, showSummary]
  )

  const stage = (
    <div className="absolute inset-0">
      <Suspense fallback={null}>
        <Scene reduced={reduce} visible={visible} cover={cover} onReady={onReady} fallback={<NoWebGL onShow={onReady} />} />
      </Suspense>
      <AnimatePresence>{!ready ? <Loading key="cargando" /> : null}</AnimatePresence>
      <div ref={topRef} className="pointer-events-none absolute inset-x-0 top-3 z-(--z-overlay) flex justify-center px-3">
        <StepIndicator className="pointer-events-auto" />
      </div>
    </div>
  )

  if (!isDesktop) {
    return (
      <section ref={rootRef} aria-label="Configurador de teclado" className="flex h-full flex-col overflow-hidden">
        {/* el modelo ocupa al menos el 55% de la pantalla; el panel, el resto */}
        <div className="relative min-h-[55dvh] flex-1">{stage}</div>
        <div
          data-scroll
          className="min-h-0 shrink overflow-y-auto overscroll-contain rounded-t-2xl border-t bg-card pt-3 pb-[max(12px,env(safe-area-inset-bottom))] shadow-[0_-12px_32px_-20px_rgb(var(--shadow-rgb)/0.35)]"
        >
          {phase === "building" ? (
            <ConfiguratorPanel variant="mobile" onAssemble={assemble} assembling={assembling} />
          ) : showSummary ? (
            <SummaryPanel compact />
          ) : (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">Cerrando la carcasa y dándole una vuelta.</p>
          )}
        </div>
      </section>
    )
  }

  return (
    <section ref={rootRef} aria-label="Configurador de teclado" className="relative h-full overflow-hidden">
      {stage}
      <TypingHint />
      <div ref={bottomRef} className="absolute inset-x-0 bottom-4 z-(--z-panel) flex justify-center px-6">
        {phase === "building" ? (
          <ConfiguratorPanel variant="desktop" onAssemble={assemble} assembling={assembling} className="max-w-[1120px]" />
        ) : null}
      </div>
      <AnimatePresence>
        {showSummary ? (
          <SummaryPanel
            key="resumen"
            style={{ width: SUMMARY_WIDTH }}
            className="absolute top-4 right-5 bottom-5 z-(--z-panel)"
          />
        ) : null}
      </AnimatePresence>
    </section>
  )
}

function Loading() {
  const config = useConfigurator((s) => s.config)
  return (
    <motion.div
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
      className="pointer-events-none absolute inset-0 z-(--z-overlay) grid place-items-center"
      role="status"
    >
      <div className="flex w-[min(460px,76vw)] flex-col items-center gap-5">
        <div className="relative w-full overflow-hidden rounded-lg">
          <KeyboardPreview config={config} skeleton />
          <div className="shimmer absolute inset-0" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-medium text-muted-foreground">Preparando el estudio</p>
          <div className="h-0.5 w-32 overflow-hidden rounded-full bg-border">
            <div className="shimmer h-full w-full bg-muted-foreground/30" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function TypingHint() {
  const finePointer = useMediaQuery("(pointer: fine)")
  if (!finePointer) return null
  return (
    <p className="absolute top-4 left-5 z-(--z-overlay) flex items-center gap-2 text-[13px] text-muted-foreground">
      <KeyboardIcon weight="regular" className="size-4" />
      Tipeá en tu teclado para probarlo
    </p>
  )
}

function NoWebGL({ onShow }: { onShow: () => void }) {
  const config = useConfigurator((s) => s.config)
  useEffect(() => onShow(), [onShow])
  return (
    <div className="grid h-full place-items-center px-6">
      <div className="flex w-[min(520px,88vw)] flex-col items-center gap-4 text-center">
        <KeyboardPreview config={config} title="Vista plana de tu teclado" />
        <p className="max-w-[46ch] text-sm text-muted-foreground">
          Tu navegador no pudo iniciar la vista 3D. Igual podés armar el teclado y ver los cambios en esta vista plana.
        </p>
      </div>
    </div>
  )
}
