import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { Keyboard as KeyboardIcon } from "@phosphor-icons/react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { DiamondPattern } from "@/components/effects/DiamondPattern"
import { TextEffect } from "@/components/effects/TextEffect"
import { KeyboardPreview } from "@/components/previews/KeyboardPreview"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { activeStepIndex, LAYER_COUNT, STEPS, useConfigurator } from "@/store/configurator"

// three.js y la escena van en un chunk aparte: la interfaz pinta antes
const Scene = lazy(() => import("@/three/Scene").then((m) => ({ default: m.Scene })))

import { PriceTag } from "./CtaRow"
import { LayerBand } from "./LayerBand"
import { MobileSheet } from "./MobileSheet"
import { StepIndicator } from "./StepIndicator"
import { SummaryPanel } from "./SummaryPanel"

const COMPLETE_TITLE = "Listo, es tuyo"
const COMPLETE_HINT = "Revisalo, compartilo o encargalo. Para cambiar una capa, despiezalo."
const SPIN_HINT = "Cerrando la carcasa y dándole una vuelta."

const SUMMARY_WIDTH = 380

/** Celdas resaltadas del patrón de rombos, repartidas a mano como en ref-1. */
const PATTERN_CELLS: Array<[number, number]> = [
  [1, 0],
  [4, 1],
  [8, 0],
  [10, 2],
  [2, 3],
  [12, 1],
  [6, 3],
]

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

export function Configurator() {
  const reduce = useReducedMotion() ?? false
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const placed = useConfigurator((s) => s.placed)
  const phase = useConfigurator((s) => s.phase)
  const config = useConfigurator((s) => s.config)
  const step = STEPS[activeStepIndex(placed)]
  const { assemble, assembling } = useAssembleAll()

  const [ready, setReady] = useState(false)
  const onReady = useCallback(() => setReady(true), [])

  const topRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [topH, setTopH] = useState(0)
  const [bottomH, setBottomH] = useState(0)
  const [sheetH, setSheetH] = useState(0)

  useLayoutEffect(() => {
    const observe = (el: HTMLElement | null, set: (n: number) => void) => {
      if (!el) return () => undefined
      const ro = new ResizeObserver(() => set(el.getBoundingClientRect().height))
      ro.observe(el)
      set(el.getBoundingClientRect().height)
      return () => ro.disconnect()
    }
    const a = observe(topRef.current, setTopH)
    const b = observe(bottomRef.current, setBottomH)
    return () => {
      a()
      b()
    }
  }, [isDesktop, phase])

  const title = phase === "building" ? step.title : COMPLETE_TITLE
  const hint = phase === "building" ? step.hint : phase === "spinning" ? SPIN_HINT : COMPLETE_HINT
  const showSummary = phase === "complete"

  const cover = useMemo(
    () => ({
      top: topH,
      bottom: isDesktop ? (phase === "building" ? bottomH : 24) : sheetH,
      left: 0,
      right: isDesktop && showSummary ? SUMMARY_WIDTH + 24 : 0,
    }),
    [topH, bottomH, sheetH, isDesktop, phase, showSummary]
  )

  return (
    <section
      id="configurador"
      aria-label="Configurador de teclado"
      className="relative isolate h-[calc(100dvh-3.5rem)] min-h-[620px] scroll-mt-14 overflow-hidden bg-background lg:min-h-[700px]"
    >
      <DiamondPattern cells={PATTERN_CELLS} className="-z-10" />

      <div className="absolute inset-0">
        <Suspense fallback={null}>
          <Scene reduced={reduce} cover={cover} onReady={onReady} fallback={<NoWebGL onShow={onReady} />} />
        </Suspense>
      </div>

      <AnimatePresence>
        {!ready ? (
          <motion.div
            key="cargando"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="pointer-events-none absolute inset-0 grid place-items-center"
          >
            <div className="flex w-[min(520px,80vw)] animate-pulse flex-col items-center gap-4 opacity-70">
              <KeyboardPreview config={config} skeleton />
              <p className="font-display text-lg font-semibold tracking-wide text-muted-foreground uppercase">
                Preparando el banco de trabajo
              </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* arriba: pasos e instrucción */}
      <div
        ref={topRef}
        className="pointer-events-none absolute inset-x-0 top-0 z-(--z-overlay) flex flex-col items-center gap-2 px-4 pt-6 text-center lg:pt-8"
      >
        <StepIndicator className="pointer-events-auto" />
        {isDesktop ? (
          <div className="flex flex-col items-center">
            <TextEffect
              as="h2"
              id={`${phase}-${step.id}`}
              className="halo font-display text-3xl leading-tight font-bold text-heading"
            >
              {title}
            </TextEffect>
            <p className="halo max-w-[60ch] text-base text-muted-foreground">{hint}</p>
          </div>
        ) : null}
      </div>

      {isDesktop ? (
        <>
          <div ref={bottomRef} className="absolute inset-x-0 bottom-0 z-(--z-overlay)">
            {phase === "building" ? (
              <>
                <LayerBand variant="desktop" onAssemble={assemble} assembling={assembling} />
                <div aria-hidden="true" className="wood h-14 shadow-[inset_0_10px_14px_-10px_rgba(65,11,41,0.35)]" />
              </>
            ) : null}
          </div>
          <AnimatePresence>
            {showSummary ? (
              <SummaryPanel
                key="resumen"
                style={{ top: Math.max(96, topH + 8) }}
                className="absolute right-6 bottom-6 z-(--z-overlay) max-h-[700px] w-[380px]"
              />
            ) : null}
          </AnimatePresence>
          <TypingHint />
        </>
      ) : (
        <MobileSheet
          onVisibleHeight={setSheetH}
          header={
            <div className="flex items-end justify-between gap-3 px-4 pb-3">
              <div className="min-w-0">
                <TextEffect
                  as="h2"
                  id={`${phase}-${step.id}`}
                  className="font-display text-2xl leading-tight font-bold text-heading"
                >
                  {title}
                </TextEffect>
                <p className="text-sm text-muted-foreground">{hint}</p>
              </div>
              {phase === "building" ? <PriceTag align="right" className="shrink-0" /> : null}
            </div>
          }
        >
          {phase === "building" ? (
            <LayerBand variant="mobile" onAssemble={assemble} assembling={assembling} className="pb-5" />
          ) : showSummary ? (
            <SummaryPanel compact className="shadow-none" />
          ) : (
            <div className="h-24" />
          )}
        </MobileSheet>
      )}
    </section>
  )
}

function TypingHint() {
  const finePointer = useMediaQuery("(pointer: fine)")
  if (!finePointer) return null
  return (
    <p className="absolute top-6 right-6 z-(--z-overlay) flex items-center gap-2 bg-card/90 px-3 py-2 font-display text-sm font-semibold tracking-wide text-muted-foreground uppercase shadow-low">
      <KeyboardIcon weight="bold" className="size-5 text-turquesa-profundo" />
      Tipeá en tu teclado para probarlo
    </p>
  )
}

function NoWebGL({ onShow }: { onShow: () => void }) {
  const config = useConfigurator((s) => s.config)
  useEffect(() => onShow(), [onShow])
  return (
    <div className="grid h-full place-items-center px-6">
      <div className="flex w-[min(560px,90vw)] flex-col items-center gap-4 text-center">
        <KeyboardPreview config={config} title="Vista plana de tu teclado" />
        <p className="max-w-[48ch] text-base text-foreground">
          Tu navegador no pudo iniciar la vista 3D. Igual podés armar el teclado: los cambios se ven en esta vista plana.
          Para verlo en 3D, probá con Chrome, Firefox o Safari actualizados.
        </p>
      </div>
    </div>
  )
}
