import { useEffect, type ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"

import { Configurator } from "@/components/configurator/Configurator"
import { Gallery } from "@/components/site/Gallery"
import { SiteHeader } from "@/components/site/SiteHeader"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { configFromParams } from "@/data/catalog"
import { usePhysicalKeyboard } from "@/hooks/usePhysicalKeyboard"
import { useConfigurator } from "@/store/configurator"

export default function App() {
  usePhysicalKeyboard()
  const view = useConfigurator((s) => s.view)

  // un link compartido abre el mismo teclado, ya armado
  useEffect(() => {
    const shared = configFromParams(window.location.search)
    if (shared) {
      useConfigurator.getState().loadConfig(shared)
      useConfigurator.getState().setView("configurador")
    }
  }, [])

  return (
    <TooltipProvider>
      <div className="flex h-dvh flex-col overflow-hidden">
        <SiteHeader />
        <main className="relative min-h-0 flex-1">
          <ViewLayer active={view === "configurador"} label="Configurador">
            <Configurator visible={view === "configurador"} />
          </ViewLayer>
          <ViewLayer active={view === "galeria"} label="Galería">
            <Gallery />
          </ViewLayer>
        </main>
      </div>
      <Toaster position="bottom-center" />
    </TooltipProvider>
  )
}

/**
 * Las dos vistas quedan montadas (el 3D no se reconstruye al volver) y se
 * cruzan con un fundido corto; la que no está activa queda inerte.
 */
function ViewLayer({ active, label, children }: { active: boolean; label: string; children: ReactNode }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      aria-label={label}
      aria-hidden={!active}
      inert={!active}
      initial={false}
      animate={active ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: reduce ? 0 : 8, scale: reduce ? 1 : 0.99 }}
      transition={{ duration: reduce ? 0 : 0.32, ease: [0.16, 1, 0.3, 1] }}
      className="absolute inset-0"
      style={{ pointerEvents: active ? "auto" : "none", zIndex: active ? 1 : 0 }}
    >
      {children}
    </motion.div>
  )
}
