import { useEffect, useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { RoundedBox } from "@react-three/drei"
import * as THREE from "three"

import { playSnap } from "@/audio/sounds"
import { knobColor, type Config } from "@/data/catalog"
import { DEMO_KEY_ID, LAYOUTS } from "@/data/layouts"
import { LAYER_COUNT, useConfigurator } from "@/store/configurator"
import { pressKey, releaseKey } from "@/store/keyPresses"

import { isAwake } from "./activity"
import { ACTIVE_FORWARD, CASE_WALL_TOP, PLATE_THICKNESS, PLATE_Y, SWITCH_BASE, TILT, U, layerOffsetY } from "./constants"
import { cableCurve, caseGeometry, knobGeometry } from "./geometry"
import { KeycapLayer } from "./KeycapLayer"
import { LEGEND_FONT } from "./legendAtlas"
import { caseDims, type LayoutAnimator } from "./layoutAnimator"
import { useCableMaterial, useCaseMaterial, useKnobMaterial, usePlateMaterial } from "./materials"
import { NO_SHADOW_LAYER, SwitchLayer } from "./SwitchLayer"

interface LayerSpring {
  y: number
  vy: number
  z: number
  vz: number
  s: number
  bob: number
  landing: boolean
}

const SPRING_K = 150
const SPRING_C = 13

function stepSpring(value: number, velocity: number, target: number, dt: number): [number, number] {
  const force = -SPRING_K * (value - target) - SPRING_C * velocity
  const v = velocity + force * dt
  return [value + v * dt, v]
}

export interface KeyboardProps {
  animator: LayoutAnimator
  reduced: boolean
  /** posición del mouse normalizada (-1..1), escrita por la escena */
  pointer: React.RefObject<THREE.Vector2>
}

export function Keyboard({ animator, reduced, pointer }: KeyboardProps) {
  const config = useConfigurator((s) => s.config)
  const placed = useConfigurator((s) => s.placed)
  const phase = useConfigurator((s) => s.phase)
  const showcase = useConfigurator((s) => s.showcase)
  const demoPress = useConfigurator((s) => s.demoPress)

  const rootRef = useRef<THREE.Group>(null)
  const pivotRef = useRef<THREE.Group>(null)
  const innerRef = useRef<THREE.Group>(null)
  const layerRefs = useRef<(THREE.Group | null)[]>([])
  const springs = useRef<LayerSpring[]>(
    Array.from({ length: LAYER_COUNT }, (_, i) => ({
      y: layerOffsetY(i, 0) + 0.6,
      vy: 0,
      z: 0,
      vz: 0,
      s: 1,
      bob: 1,
      landing: false,
    }))
  )
  const prevPlaced = useRef(placed)

  useEffect(() => {
    animator.setFormat(config.format)
  }, [animator, config.format])

  // marcar las capas que acaban de encastrarse para hacerlas sonar al apoyar
  useEffect(() => {
    const before = prevPlaced.current
    if (placed > before) {
      for (let i = before; i < placed; i++) {
        if (reduced) playSnap(i)
        else springs.current[i].landing = true
      }
    }
    prevPlaced.current = placed
  }, [placed, reduced])

  // tecla de prueba al elegir un switch
  useEffect(() => {
    if (demoPress === 0) return
    pressKey(DEMO_KEY_ID)
    const timer = window.setTimeout(() => releaseKey(DEMO_KEY_ID), 170)
    return () => {
      window.clearTimeout(timer)
      releaseKey(DEMO_KEY_ID)
    }
  }, [demoPress])

  useFrame((state, delta) => {
    if (animator.update(delta, reduced)) state.invalidate()
  }, -1)

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30)
    const time = state.clock.elapsedTime
    const f = animator.frame
    const awake = isAwake()
    let moving = false

    // pivote en el borde delantero inferior para la inclinación de escritura
    const front = f.caseZ + f.caseD / 2
    if (pivotRef.current && innerRef.current) {
      pivotRef.current.position.z = front
      innerRef.current.position.z = -front
    }

    // inclinación que sigue al mouse
    if (rootRef.current) {
      const p = pointer.current
      // durante el giro final la cámara orbita; el teclado se queda quieto
      const follow = reduced || phase === "spinning" ? 0 : 1
      const rx = p ? p.y * -0.07 * follow : 0
      const ry = p ? p.x * 0.16 * follow : 0
      const r = rootRef.current.rotation
      r.x = THREE.MathUtils.damp(r.x, rx, 3, dt)
      r.y = THREE.MathUtils.damp(r.y, ry, 3, dt)
      if (Math.abs(r.x - rx) > 1e-4 || Math.abs(r.y - ry) > 1e-4) moving = true
    }

    // capas: resorte con rebote hacia su altura objetivo
    const building = phase === "building"
    for (let i = 0; i < LAYER_COUNT; i++) {
      const group = layerRefs.current[i]
      const sp = springs.current[i]
      if (!group) continue
      const targetY = layerOffsetY(i, placed)
      const isActive = building && i === placed
      const targetZ = isActive ? ACTIVE_FORWARD : 0
      const targetS = isActive ? 1.035 : 1

      if (reduced) {
        sp.y = targetY
        sp.z = targetZ
        sp.vy = 0
        sp.vz = 0
      } else {
        const wasAbove = sp.y > targetY + 0.004
        ;[sp.y, sp.vy] = stepSpring(sp.y, sp.vy, targetY, dt)
        ;[sp.z, sp.vz] = stepSpring(sp.z, sp.vz, targetZ, dt)
        if (sp.landing && wasAbove && sp.y <= targetY + 0.004) {
          sp.landing = false
          playSnap(i)
        }
      }
      sp.s = THREE.MathUtils.damp(sp.s, targetS, 6, dt)
      // el balanceo corre mientras la escena está despierta y después se aquieta
      sp.bob = THREE.MathUtils.damp(sp.bob, i >= placed && !reduced && awake ? 1 : 0, 2, dt)
      if (sp.bob < 1e-3) sp.bob = 0
      if (
        sp.bob > 0 ||
        Math.abs(sp.y - targetY) > 1e-4 ||
        Math.abs(sp.vy) > 1e-4 ||
        Math.abs(sp.z - targetZ) > 1e-4 ||
        Math.abs(sp.vz) > 1e-4 ||
        Math.abs(sp.s - targetS) > 1e-4
      ) {
        moving = true
      }

      const bobY = Math.sin(time * 1.15 + i * 1.4) * 0.03 * sp.bob
      group.position.set(0, sp.y + bobY, sp.z)
      // en vitrina solo se ven las capas ya encastradas
      group.visible = !showcase || i < placed
      group.rotation.z = Math.sin(time * 0.8 + i * 2.1) * 0.012 * sp.bob
      group.rotation.x = Math.cos(time * 0.7 + i * 1.7) * 0.01 * sp.bob
      group.scale.setScalar(sp.s)
    }

    if (moving) state.invalidate()
  })

  const layout = LAYOUTS[config.format]

  return (
    <group ref={rootRef}>
      <group>
        <group ref={pivotRef} rotation={[TILT, 0, 0]}>
          <group ref={innerRef}>
            <group ref={(el) => void (layerRefs.current[0] = el)} name="capa-carcasa">
              <CaseLayer config={config} animator={animator} />
            </group>
            <group ref={(el) => void (layerRefs.current[1] = el)} name="capa-placa">
              <PlateLayer config={config} animator={animator} />
            </group>
            <group ref={(el) => void (layerRefs.current[2] = el)} name="capa-switches">
              <SwitchLayer config={config} animator={animator} />
            </group>
            <group ref={(el) => void (layerRefs.current[3] = el)} name="capa-teclas">
              <KeycapLayer config={config} animator={animator} layout={layout} />
            </group>
            <group ref={(el) => void (layerRefs.current[4] = el)} name="capa-detalles">
              <KnobDetail config={config} reduced={reduced} />
              <CableDetail config={config} animator={animator} />
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}

// ---------- capa 1: carcasa ----------

function CaseLayer({ config, animator }: { config: Config; animator: LayoutAnimator }) {
  const material = useCaseMaterial(config)
  const groupRef = useRef<THREE.Group>(null)
  const target = useMemo(() => caseDims(LAYOUTS[config.format]), [config.format])
  const geos = useMemo(() => {
    const innerW = target.keysW + 0.16 * U
    const innerD = target.keysD + 0.16 * U
    return caseGeometry(target.caseW, target.caseD, innerW, innerD, -target.caseZ)
  }, [target])

  useEffect(
    () => () => {
      geos.walls.dispose()
      geos.slab.dispose()
    },
    [geos]
  )

  useFrame(() => {
    const f = animator.frame
    const g = groupRef.current
    if (!g) return
    g.position.z = f.caseZ
    g.scale.set(f.caseW / target.caseW, 1, f.caseD / target.caseD)
  })

  return (
    <group ref={groupRef}>
      <mesh geometry={geos.walls} material={material} castShadow receiveShadow />
      <mesh geometry={geos.slab} material={material} castShadow receiveShadow />
      <BadgeEngraving config={config} target={target} />
    </group>
  )
}

/** Marca de la casa grabada en el bisel trasero (60% y TKL). */
function BadgeEngraving({ config, target }: { config: Config; target: ReturnType<typeof caseDims> }) {
  const layout = LAYOUTS[config.format]
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 512
    canvas.height = 128
    const ctx = canvas.getContext("2d")!
    ctx.fillStyle = "#ffffff"
    ctx.textBaseline = "middle"
    ctx.font = `600 72px ${LEGEND_FONT}`
    ctx.letterSpacing = "18px"
    ctx.fillText("PULSA", 8, 68)
    const t = new THREE.CanvasTexture(canvas)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])
  useEffect(() => () => texture.dispose(), [texture])
  if (layout.bezel.top < 1) return null
  const z = -target.caseD / 2 + (layout.bezel.top * U) / 2
  const w = 0.42
  return (
    <mesh
      position={[-target.caseW / 2 + layout.bezel.side * U + 0.02 + w / 2, CASE_WALL_TOP + 0.0015, z]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[w, w / 4]} />
      <meshBasicMaterial map={texture} transparent opacity={0.3} depthWrite={false} />
    </mesh>
  )
}

// ---------- capa 2: placa ----------

function PlateLayer({ config, animator }: { config: Config; animator: LayoutAnimator }) {
  const material = usePlateMaterial(config)
  const ref = useRef<THREE.Mesh>(null)
  const target = useMemo(() => caseDims(LAYOUTS[config.format]), [config.format])
  const w = target.keysW + 0.12 * U
  const d = target.keysD + 0.12 * U

  useFrame(() => {
    const f = animator.frame
    if (!ref.current) return
    ref.current.scale.set(f.keysW / target.keysW, 1, f.keysD / target.keysD)
  })

  return (
    <RoundedBox
      ref={ref}
      args={[w, PLATE_THICKNESS, d]}
      radius={0.01}
      smoothness={2}
      position={[0, PLATE_Y, 0]}
      material={material}
      receiveShadow
    />
  )
}

// ---------- capa 5: detalles ----------

function KnobDetail({ config, reduced }: { config: Config; reduced: boolean }) {
  const material = useKnobMaterial(config)
  const ref = useRef<THREE.Group>(null)
  const layout = LAYOUTS[config.format]
  const inSlot = config.format === "75"
  const visible = knobColor(config) !== null
  const height = inSlot ? 0.24 : 0.18
  const radius = 0.085
  const geometry = useMemo(() => knobGeometry(radius, height), [height])
  useEffect(() => () => geometry.dispose(), [geometry])

  const targetX = (layout.knob.x - layout.width / 2) * U
  const targetZ = (layout.knob.y - layout.depth / 2) * U
  const baseY = inSlot ? SWITCH_BASE : CASE_WALL_TOP

  useFrame((state, delta) => {
    const g = ref.current
    if (!g) return
    if (reduced) {
      g.position.set(targetX, baseY, targetZ)
      return
    }
    const dt = Math.min(delta, 1 / 30)
    g.position.x = THREE.MathUtils.damp(g.position.x, targetX, 6, dt)
    g.position.z = THREE.MathUtils.damp(g.position.z, targetZ, 6, dt)
    g.position.y = THREE.MathUtils.damp(g.position.y, baseY, 6, dt)
    if (g.position.distanceToSquared(new THREE.Vector3(targetX, baseY, targetZ)) > 1e-8) state.invalidate()
  })

  return (
    <group ref={ref} position={[targetX, baseY, targetZ]} visible={visible}>
      <mesh geometry={geometry} material={material} castShadow />
      <mesh position={[0, height + 0.0012, -radius * 0.55]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.012, 0.05]} />
        <meshStandardMaterial color="#f1f1f1" roughness={0.4} />
      </mesh>
      {inSlot ? (
        <mesh position={[0, -0.02, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.06, 16]} />
          <meshStandardMaterial color="#555" metalness={0.8} roughness={0.4} />
        </mesh>
      ) : null}
    </group>
  )
}

function CableDetail({ config, animator }: { config: Config; animator: LayoutAnimator }) {
  const material = useCableMaterial(config)
  const ref = useRef<THREE.Group>(null)
  const { geometry, connector } = useMemo(() => {
    const { curve, connectorAt } = cableCurve()
    const geo = new THREE.TubeGeometry(curve, 900, 0.017, 10, false)
    const point = curve.getPointAt(connectorAt)
    const tangent = curve.getTangentAt(connectorAt)
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent.normalize())
    return { geometry: geo, connector: { point, quat } }
  }, [])
  useEffect(() => () => geometry.dispose(), [geometry])

  // el espiral del cable no proyecta sombra en el piso: sus vueltas
  // dibujaban un rayado que giraba con el teclado
  useEffect(() => {
    ref.current?.traverse((o) => o.layers.set(NO_SHADOW_LAYER))
  }, [])

  useFrame(() => {
    const g = ref.current
    if (!g) return
    const f = animator.frame
    g.position.set(-f.caseW / 2 + 0.6, 0, f.caseZ - f.caseD / 2 + 0.03)
  })

  return (
    <group ref={ref}>
      <mesh geometry={geometry} material={material} castShadow />
      <group position={connector.point} quaternion={connector.quat}>
        <mesh>
          <cylinderGeometry args={[0.034, 0.034, 0.1, 24]} />
          <meshStandardMaterial color="#cfd2d6" metalness={1} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.07, 0]}>
          <cylinderGeometry args={[0.03, 0.026, 0.05, 24]} />
          <meshStandardMaterial color="#1f1f22" metalness={0.4} roughness={0.5} />
        </mesh>
      </group>
      <mesh position={[0, 0.22, 0.012]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.028, 0.028, 0.03, 20]} />
        <meshStandardMaterial color="#1f1f22" metalness={0.5} roughness={0.5} />
      </mesh>
    </group>
  )
}
