import { useEffect, useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { CameraControls, CameraControlsImpl } from "@react-three/drei"
import * as THREE from "three"

import type { FormatId } from "@/data/catalog"
import { LAYOUTS, type Layout } from "@/data/layouts"
import { activeStepIndex, LAYER_COUNT, STEPS, useConfigurator, type Phase, type SubId } from "@/store/configurator"

import { playComplete } from "@/audio/sounds"

import { idleFor, isAwake, wake } from "./activity"
import { ACTIVE_FORWARD, CASE_WALL_TOP, KEYCAP_BASE, LAYER_FOCUS_Y, SWITCH_BASE, TILT, U, layerOffsetY } from "./constants"
import { caseDims, keyWorldX, keyWorldZ } from "./layoutAnimator"

export interface Cover {
  top: number
  bottom: number
  left: number
  right: number
}

const FOV = 32
/** rango de zoom con la rueda, relativo a la distancia de cada encuadre */
const ZOOM_IN = 0.8
const ZOOM_OUT = 1.2

interface View {
  /** punto que mira la cámara */
  target: THREE.Vector3
  /** dirección desde el objetivo hacia la cámara */
  direction: THREE.Vector3
  /** caja que tiene que entrar completa en el encuadre */
  box: { width: number; height: number; depth: number }
  /** cuánto se corrió el objetivo del centro de la caja (se suma al encuadre) */
  shift: number
}

/** Aplica la inclinación de escritura (pivote en el borde delantero). */
function tilted(layout: Layout, x: number, y: number, z: number) {
  const dims = caseDims(layout)
  const front = dims.caseZ + dims.caseD / 2
  const rz = z - front
  return new THREE.Vector3(x, y * Math.cos(TILT) - rz * Math.sin(TILT), y * Math.sin(TILT) + rz * Math.cos(TILT) + front)
}

function keyById(layout: Layout, id: string) {
  return layout.keys.find((k) => k.id === id) ?? layout.keys[0]
}

/**
 * Cada categoría elige un ángulo que muestra su parte, pero siempre con el
 * teclado completo en cuadro: el objetivo se corre hacia el detalle y el
 * encuadre se agranda lo justo para no cortar nada.
 */
export function viewFor(format: FormatId, placed: number, phase: Phase, sub: SubId): View {
  const layout = LAYOUTS[format]
  const dims = caseDims(layout)
  const box = (height: number) => ({ width: dims.caseW + 0.15, height, depth: dims.caseD + ACTIVE_FORWARD })

  if (phase !== "building") {
    return { target: new THREE.Vector3(0, 0.3, 0.05), direction: new THREE.Vector3(2.3, 2.6, 5.3), box: box(0.72), shift: 0 }
  }

  const topY = layerOffsetY(LAYER_COUNT - 1, placed) + LAYER_FOCUS_Y[LAYER_COUNT - 1] + 0.12
  const center = new THREE.Vector3(0, topY / 2, 0.15)
  const stack = box(topY)
  const toward = (point: THREE.Vector3, amount: number): Pick<View, "target" | "shift"> => {
    const target = center.clone().lerp(point, amount)
    return { target, shift: target.distanceTo(center) }
  }

  switch (sub) {
    case "formato":
      return { target: center, direction: new THREE.Vector3(0, 2.5, 5.6), box: stack, shift: 0 }
    case "color":
      return { target: center, direction: new THREE.Vector3(2.9, 2.3, 4.9), box: stack, shift: 0 }
    case "placa":
      return { target: center, direction: new THREE.Vector3(0.4, 4.4, 3.4), box: stack, shift: 0 }
    case "switches": {
      const key = keyById(layout, "g")
      const y = layerOffsetY(2, placed) + SWITCH_BASE + 0.06
      const point = tilted(layout, keyWorldX(key, layout), y, keyWorldZ(key, layout) + ACTIVE_FORWARD)
      return { ...toward(point, 0.35), direction: new THREE.Vector3(1.2, 1.5, 3.4), box: stack }
    }
    case "teclas":
      return { target: center, direction: new THREE.Vector3(-2.5, 2.6, 4.7), box: stack, shift: 0 }
    case "perilla": {
      const inSlot = format === "75"
      const y = layerOffsetY(4, placed) + (inSlot ? SWITCH_BASE : CASE_WALL_TOP) + 0.1
      const point = tilted(layout, (layout.knob.x - layout.width / 2) * U, y, (layout.knob.y - layout.depth / 2) * U + ACTIVE_FORWARD)
      return { ...toward(point, 0.35), direction: new THREE.Vector3(2.4, 2.4, 3.6), box: stack }
    }
    case "cable": {
      const y = layerOffsetY(4, placed) + 0.1
      const point = tilted(layout, -dims.caseW / 2 + 0.6, y, dims.caseZ - dims.caseD / 2 - 0.5 + ACTIVE_FORWARD)
      return { ...toward(point, 0.3), direction: new THREE.Vector3(-2.6, 2.4, -3.2), box: { ...stack, depth: stack.depth + 0.8 } }
    }
    case "luces":
      return { target: new THREE.Vector3(0, 0.5, 0.1), direction: new THREE.Vector3(0.3, 2.2, 4.2), box: box(1.2), shift: 0 }
    case "grabado": {
      const key = keyById(layout, "space")
      const y = layerOffsetY(3, placed) + KEYCAP_BASE + 0.16
      const point = tilted(layout, keyWorldX(key, layout), y, keyWorldZ(key, layout))
      return { ...toward(point, 0.4), direction: new THREE.Vector3(0, 2.6, 4.2), box: stack }
    }
    default:
      return { target: center, direction: new THREE.Vector3(0, 2.5, 5.6), box: stack, shift: 0 }
  }
}

/** Distancia para que la caja entre completa en la zona que deja la interfaz. */
function fitDistance(view: View, width: number, height: number, cover: Cover) {
  const t = Math.tan(THREE.MathUtils.degToRad(FOV / 2))
  const dir = view.direction.clone().normalize()
  const elevation = Math.asin(THREE.MathUtils.clamp(dir.y, -1, 1))
  const azimuth = Math.abs(Math.atan2(dir.x, dir.z))
  const { box } = view
  const extentY = box.height * Math.cos(elevation) + box.depth * Math.sin(elevation) + view.shift * 2
  const extentX = box.width * Math.cos(azimuth) + box.depth * Math.sin(azimuth) + view.shift * 2
  const freeH = Math.max(140, height - cover.top - cover.bottom) / height
  const freeW = Math.max(180, width - cover.left - cover.right) / width
  const aspect = width / height
  // el borde más cercano a la cámara se ve más grande por la perspectiva:
  // se encuadra a esa profundidad y no al centro de la caja
  const near = 0.5 * (box.depth * Math.cos(elevation) * Math.abs(Math.cos(azimuth)) + box.width * Math.sin(azimuth) * 0.5 + box.height * Math.sin(elevation))
  const byHeight = extentY / (0.94 * freeH * 2 * t) + near
  const byWidth = extentX / (0.94 * freeW * 2 * t * aspect) + near
  return Math.max(byHeight, byWidth)
}

interface CameraRigProps {
  reduced: boolean
  cover: Cover
}

export function CameraRig({ reduced, cover }: CameraRigProps) {
  const controls = useRef<CameraControls>(null)
  const size = useThree((s) => s.size)
  const format = useConfigurator((s) => s.config.format)
  const placed = useConfigurator((s) => s.placed)
  const phase = useConfigurator((s) => s.phase)
  const sub = useConfigurator((s) => s.sub[STEPS[activeStepIndex(s.placed)].id])
  const { top, bottom, left, right } = cover
  const finishSpin = useConfigurator((s) => s.finishSpin)
  const spin = useRef({ active: false, t: 0, start: 0 })

  // giro de 360° al completar: orbita la cámara y el teclado queda quieto,
  // así la sombra de contacto no se recalcula con el modelo girando
  useEffect(() => {
    if (phase !== "spinning") return
    if (reduced) {
      playComplete()
      finishSpin()
      return
    }
    const timer = window.setTimeout(() => {
      spin.current = { active: true, t: 0, start: controls.current?.azimuthAngle ?? 0 }
      playComplete()
      wake()
    }, 650)
    return () => window.clearTimeout(timer)
  }, [phase, reduced, finishSpin])

  useEffect(() => {
    const c = controls.current
    if (!c) return
    const { ACTION } = CameraControlsImpl
    // sin paneo: el teclado no se pierde de vista
    c.mouseButtons.right = ACTION.NONE
    c.mouseButtons.middle = ACTION.NONE
    c.touches.two = ACTION.TOUCH_DOLLY
    c.touches.three = ACTION.NONE
  }, [])

  useEffect(() => {
    const c = controls.current
    if (!c) return
    const view = viewFor(format, placed, phase, sub)
    const distance = THREE.MathUtils.clamp(fitDistance(view, size.width, size.height, { top, bottom, left, right }), 2, 30)
    // la rueda solo acerca o aleja un poco alrededor de cada encuadre
    c.minDistance = distance * ZOOM_IN
    c.maxDistance = distance * ZOOM_OUT
    const position = view.target.clone().add(view.direction.clone().normalize().multiplyScalar(distance))
    void c.setLookAt(position.x, position.y, position.z, view.target.x, view.target.y, view.target.z, !reduced)
  }, [format, placed, phase, sub, size.width, size.height, top, bottom, left, right, reduced])

  // rotación automática lenta cuando no se toca, hasta que la escena se duerme
  useFrame((state, delta) => {
    const c = controls.current
    if (!c) return
    if (spin.current.active) {
      const sp = spin.current
      sp.t = Math.min(1, sp.t + Math.min(delta, 0.1) / 2.4)
      const eased = sp.t < 0.5 ? 4 * sp.t ** 3 : 1 - Math.pow(-2 * sp.t + 2, 3) / 2
      c.azimuthAngle = sp.start + eased * Math.PI * 2
      if (sp.t >= 1) {
        sp.active = false
        // misma posición, ángulo normalizado para que la próxima transición no desande la vuelta
        c.azimuthAngle = sp.start
        finishSpin()
      }
      state.invalidate()
      return
    }
    if (reduced || phase === "spinning" || c.active) return
    if (idleFor() > 5000 && isAwake()) {
      c.azimuthAngle += Math.min(delta, 0.05) * 0.07
      state.invalidate()
    }
  })

  return (
    <CameraControls
      ref={controls}
      makeDefault
      minPolarAngle={0.2}
      maxPolarAngle={1.42}
      smoothTime={reduced ? 0 : 0.55}
      draggingSmoothTime={0.12}
      dollySpeed={0.5}
    />
  )
}
