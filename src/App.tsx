import { useEffect, type ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"

import { Configurator } from "@/components/configurator/Configurator"
import { CartSheet } from "@/components/shop/CartSheet"
import { AboutPage } from "@/components/site/AboutPage"
import { Gallery } from "@/components/site/Gallery"
import { HelpPage } from "@/components/site/HelpPage"
import { SiteHeader } from "@/components/site/SiteHeader"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { configFromParams } from "@/data/catalog"
import { RENDER_CONFIGS } from "@/data/content"
import { usePhysicalKeyboard } from "@/hooks/usePhysicalKeyboard"
import { LAYER_COUNT, useConfigurator, type View } from "@/store/configurator"

export default function App() {
  usePhysicalKeyboard()
  const view = useConfigurator((s) => s.view)
  const showcase = useConfigurator((s) => s.showcase)

  // un link compartido abre el mismo teclado, ya armado
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const store = useConfigurator.getState()
    // en vitrina, ?render=nombre carga una de las configuraciones de los renders
    const named = store.showcase ? RENDER_CONFIGS[params.get("render") ?? ""] : undefined
    const shared = named ?? configFromParams(window.location.search)
    if (shared) {
      store.loadConfig(shared)
      if (!store.showcase) store.setView("configurador")
    }
    // en vitrina se puede pedir cuántas capas mostrar (?capas=1..5)
    const layers = Number(params.get("capas"))
    if (store.showcase && layers >= 1 && layers < LAYER_COUNT) store.setPlaced(layers)
  }, [])

  if (showcase) {
    return (
      <div className="h-dvh">
        <Configurator visible />
      </div>
    )
  }

  const pages: { id: View; label: string; node: ReactNode }[] = [
    { id: "configurador", label: "Configurador", node: <Configurator visible={view === "configurador"} /> },
    { id: "galeria", label: "Galería", node: <Gallery /> },
    { id: "nosotros", label: "Nosotros", node: <AboutPage /> },
    { id: "ayuda", label: "Ayuda", node: <HelpPage /> },
  ]

  return (
    <TooltipProvider>
      <div className="flex h-dvh flex-col overflow-hidden">
        <SiteHeader />
        <main className="relative min-h-0 flex-1">
          {pages.map((page) => (
            <ViewLayer key={page.id} active={view === page.id} label={page.label}>
              {page.node}
            </ViewLayer>
          ))}
        </main>
      </div>
      <CartSheet />
      <Toaster position="bottom-center" />
    </TooltipProvider>
  )
}

/**
 * Las vistas quedan montadas (el 3D no se reconstruye al volver) y se cruzan
 * con un fundido corto; las que no están activas quedan inertes.
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
