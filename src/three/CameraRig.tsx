import { useEffect, useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { CameraControls, CameraControlsImpl } from "@react-three/drei"
import * as THREE from "three"

import type { FormatId } from "@/data/catalog"
import { LAYOUTS, type Layout } from "@/data/layouts"
import { activeStepIndex, LAYER_COUNT, STEPS, useConfigurator, type Phase, type SubId } from "@/store/configurator"

import {
  ACTIVE_FORWARD,
  CASE_WALL_TOP,
  KEYCAP_BASE,
  LAYER_FOCUS_Y,
  SWITCH_BASE,
  TILT,
  U,
  layerOffsetY,
} from "./constants"
import { caseDims, keyWorldX, keyWorldZ } from "./layoutAnimator"

export interface Cover {
  top: number
  bottom: number
  left: number
  right: number
}

const FOV = 32

interface View {
  target: THREE.Vector3
  /** dirección desde el objetivo hacia la cámara */
  offset: THREE.Vector3
  /** null: primer plano a distancia fija; si no, caja a encuadrar */
  fit: { width: number; height: number; depth: number } | null
}

/** Aplica la inclinación de escritura (pivote en el borde delantero). */
function tilted(layout: Layout, x: number, y: number, z: number) {
  const dims = caseDims(layout)
  const front = dims.caseZ + dims.caseD / 2
  const rz = z - front
  return new THREE.Vector3(
    x,
    y * Math.cos(TILT) - rz * Math.sin(TILT),
    y * Math.sin(TILT) + rz * Math.cos(TILT) + front
  )
}

function keyById(layout: Layout, id: string) {
  return layout.keys.find((k) => k.id === id) ?? layout.keys[0]
}

export function viewFor(format: FormatId, placed: number, phase: Phase, sub: SubId): View {
  const layout = LAYOUTS[format]
  const dims = caseDims(layout)
  const box = (height: number) => ({ width: dims.caseW + 0.2, height, depth: dims.caseD + ACTIVE_FORWARD })

  if (phase !== "building") {
    return { target: new THREE.Vector3(0, 0.3, 0.05), offset: new THREE.Vector3(2.3, 2.6, 5.3), fit: box(0.75) }
  }

  const topY = layerOffsetY(LAYER_COUNT - 1, placed) + LAYER_FOCUS_Y[LAYER_COUNT - 1] + 0.12
  const overview = new THREE.Vector3(0, topY / 2, 0.15)
  const stack = box(topY)

  switch (sub) {
    case "formato":
      return { target: overview, offset: new THREE.Vector3(0, 2.5, 5.6), fit: stack }
    case "color":
      return { target: overview, offset: new THREE.Vector3(2.9, 2.3, 4.9), fit: stack }
    case "placa":
      return { target: overview, offset: new THREE.Vector3(0.4, 4.2, 3.6), fit: stack }
    case "switches": {
      const key = keyById(layout, "g")
      const y = layerOffsetY(2, placed) + SWITCH_BASE + 0.06
      const target = tilted(layout, keyWorldX(key, layout), y, keyWorldZ(key, layout) + ACTIVE_FORWARD)
      target.y += 0.12
      return { target, offset: new THREE.Vector3(1.0, 1.25, 2.4), fit: null }
    }
    case "teclas":
      return { target: overview, offset: new THREE.Vector3(-2.5, 2.6, 4.6), fit: stack }
    case "perilla": {
      const inSlot = format === "75"
      const y = layerOffsetY(4, placed) + (inSlot ? SWITCH_BASE : CASE_WALL_TOP) + 0.1
      const target = tilted(
        layout,
        (layout.knob.x - layout.width / 2) * U,
        y,
        (layout.knob.y - layout.depth / 2) * U + ACTIVE_FORWARD
      )
      return { target, offset: new THREE.Vector3(1.5, 1.7, 2.6), fit: null }
    }
    case "cable": {
      const y = layerOffsetY(4, placed) + 0.1
      const target = tilted(layout, -dims.caseW / 2 + 0.6, y, dims.caseZ - dims.caseD / 2 - 0.5 + ACTIVE_FORWARD)
      return { target, offset: new THREE.Vector3(-2.2, 1.8, -2.4), fit: null }
    }
    case "luces":
      return { target: new THREE.Vector3(0, 0.5, 0.1), offset: new THREE.Vector3(0.3, 2.2, 4.2), fit: box(1.2) }
    case "grabado": {
      const key = keyById(layout, "space")
      const y = layerOffsetY(3, placed) + KEYCAP_BASE + 0.16
      const target = tilted(layout, keyWorldX(key, layout), y, keyWorldZ(key, layout))
      return { target, offset: new THREE.Vector3(0, 1.9, 2.9), fit: null }
    }
    default:
      return { target: overview, offset: new THREE.Vector3(0, 2.5, 5.6), fit: stack }
  }
}

/** Distancia para que la caja entre en la zona que la interfaz deja libre. */
function fitDistance(view: View, width: number, height: number, cover: Cover) {
  const fit = view.fit!
  const t = Math.tan(THREE.MathUtils.degToRad(FOV / 2))
  const dir = view.offset.clone().normalize()
  const elevation = Math.asin(THREE.MathUtils.clamp(dir.y, -1, 1))
  const extentY = fit.height * Math.cos(elevation) + fit.depth * Math.sin(elevation)
  const azimuth = Math.abs(Math.atan2(dir.x, dir.z))
  const extentX = fit.width * Math.cos(azimuth) + fit.depth * Math.sin(azimuth)
  const freeH = Math.max(140, height - cover.top - cover.bottom) / height
  const freeW = Math.max(180, width - cover.left - cover.right) / width
  const aspect = width / height
  const byHeight = extentY / (0.88 * freeH * 2 * t)
  const byWidth = extentX / (0.86 * freeW * 2 * t * aspect)
  return Math.max(byHeight, byWidth)
}

interface CameraRigProps {
  reduced: boolean
  cover: Cover
}

export function CameraRig({ reduced, cover }: CameraRigProps) {
  const controls = useRef<CameraControls>(null)
  const lastInteraction = useRef(0)
  const size = useThree((s) => s.size)
  const format = useConfigurator((s) => s.config.format)
  const placed = useConfigurator((s) => s.placed)
  const phase = useConfigurator((s) => s.phase)
  const sub = useConfigurator((s) => s.sub[STEPS[activeStepIndex(s.placed)].id])

  useEffect(() => {
    const c = controls.current
    if (!c) return
    const { ACTION } = CameraControlsImpl
    // sin paneo: el teclado no se pierde de vista
    c.mouseButtons.right = ACTION.NONE
    c.mouseButtons.middle = ACTION.NONE
    c.touches.two = ACTION.TOUCH_DOLLY
    c.touches.three = ACTION.NONE
    const onStart = () => (lastInteraction.current = performance.now())
    c.addEventListener("controlstart", onStart)
    return () => c.removeEventListener("controlstart", onStart)
  }, [])

  const { top, bottom, left, right } = cover

  useEffect(() => {
    const c = controls.current
    if (!c) return
    const view = viewFor(format, placed, phase, sub)
    let distance: number
    if (view.fit) {
      distance = fitDistance(view, size.width, size.height, { top, bottom, left, right })
    } else {
      const aspect = size.width / Math.max(1, size.height)
      distance = view.offset.length() * (aspect < 0.8 ? 1.45 : aspect < 1.2 ? 1.2 : 1)
    }
    distance = THREE.MathUtils.clamp(distance, 1.2, 14)
    // el límite de zoom se ajusta al encuadre; se fija acá y no como prop
    // porque cada render volvería a pisarlo
    c.maxDistance = Math.max(10, distance * 1.4)
    const position = view.target.clone().add(view.offset.clone().normalize().multiplyScalar(distance))
    lastInteraction.current = performance.now()
    void c.setLookAt(position.x, position.y, position.z, view.target.x, view.target.y, view.target.z, !reduced)
  }, [format, placed, phase, sub, size.width, size.height, top, bottom, left, right, reduced])

  useFrame((_, delta) => {
    const c = controls.current
    if (!c || reduced || phase === "spinning") return
    const idle = performance.now() - lastInteraction.current > 5000
    if (idle && !c.active) c.azimuthAngle += delta * 0.07
  })

  return (
    <CameraControls
      ref={controls}
      makeDefault
      minDistance={1.1}
      minPolarAngle={0.2}
      maxPolarAngle={1.42}
      smoothTime={reduced ? 0 : 0.55}
      draggingSmoothTime={0.12}
      dollySpeed={0.6}
    />
  )
}
