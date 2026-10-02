import { useCallback } from "react"
import { toast } from "sonner"

import { shareUrl } from "@/data/catalog"
import { useConfigurator } from "@/store/configurator"

/** Guarda la configuración en la URL y copia el link. */
export function useShareConfig() {
  return useCallback(async () => {
    const url = shareUrl(useConfigurator.getState().config)
    window.history.replaceState(null, "", url)
    try {
      await navigator.clipboard.writeText(url)
      toast.success("Link copiado", {
        description: "Quien lo abra ve este mismo teclado, armado y listo para editar.",
      })
    } catch {
      toast.info("El link ya está en la barra de direcciones", {
        description: "Tu navegador no nos dejó copiarlo. Copialo desde ahí y compartilo.",
      })
    }
  }, [])
}
