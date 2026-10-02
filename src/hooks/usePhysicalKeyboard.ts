import { useEffect } from "react"

import { playKeyDown, playKeyUp } from "@/audio/sounds"
import { keyIdForCode } from "@/data/layouts"
import { useConfigurator } from "@/store/configurator"
import { pressKey, releaseAll, releaseKey } from "@/store/keyPresses"

const SCROLL_KEYS = new Set(["Space", "ArrowUp", "ArrowDown", "PageUp", "PageDown"])

function configuratorInView() {
  return useConfigurator.getState().view === "configurador"
}

/** Mientras se completa el pedido, el teclado del modelo no reacciona. */
function inDialog(event: KeyboardEvent) {
  return event.target instanceof Element && event.target.closest("[role='dialog']") !== null
}

/**
 * Al presionar teclas del teclado físico, la tecla equivalente del modelo se
 * hunde y suena con el switch elegido.
 */
export function usePhysicalKeyboard() {
  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.metaKey || inDialog(event) || !configuratorInView()) return
      const id = keyIdForCode(event.code)
      if (!id) return
      // espacio y flechas no deben desplazar la página mientras se prueba el teclado
      if (SCROLL_KEYS.has(event.code) && event.target === document.body && configuratorInView()) {
        event.preventDefault()
      }
      if (event.repeat) return
      pressKey(id)
      playKeyDown(useConfigurator.getState().config.switches)
    }
    const up = (event: KeyboardEvent) => {
      if (inDialog(event)) return
      const id = keyIdForCode(event.code)
      if (!id) return
      releaseKey(id)
      playKeyUp(useConfigurator.getState().config.switches)
    }
    const blur = () => releaseAll()
    window.addEventListener("keydown", down)
    window.addEventListener("keyup", up)
    window.addEventListener("blur", blur)
    return () => {
      window.removeEventListener("keydown", down)
      window.removeEventListener("keyup", up)
      window.removeEventListener("blur", blur)
    }
  }, [])
}
