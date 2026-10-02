import { useEffect } from "react"

import { Configurator } from "@/components/configurator/Configurator"
import { Gallery } from "@/components/site/Gallery"
import { SiteFooter } from "@/components/site/SiteFooter"
import { SiteHeader } from "@/components/site/SiteHeader"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { configFromParams } from "@/data/catalog"
import { usePhysicalKeyboard } from "@/hooks/usePhysicalKeyboard"
import { useConfigurator } from "@/store/configurator"

export default function App() {
  usePhysicalKeyboard()

  // un link compartido abre el mismo teclado, ya armado
  useEffect(() => {
    const shared = configFromParams(window.location.search)
    if (shared) useConfigurator.getState().loadConfig(shared)
  }, [])

  return (
    <TooltipProvider>
      <SiteHeader />
      <main>
        <Configurator />
        <Gallery />
      </main>
      <SiteFooter />
      <Toaster position="bottom-center" />
    </TooltipProvider>
  )
}
