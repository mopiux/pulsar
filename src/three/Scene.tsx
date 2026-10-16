import { useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { ContactShadows, Environment, Lightformer, PerformanceMonitor } from "@react-three/drei"
import { EffectComposer, Selection, SelectiveBloom, ToneMapping } from "@react-three/postprocessing"
import { ToneMappingMode } from "postprocessing"
import * as THREE from "three"

import { useMediaQuery } from "@/hooks/useMediaQuery"
import { LAYER_COUNT, activeStepIndex, useConfigurator } from "@/store/configurator"

import { bindInvalidate, wake } from "./activity"
import { CameraRig, type Cover } from "./CameraRig"
import { ACTIVE_FORWARD, LAYER_FOCUS_Y, layerOffsetY } from "./constants"
import { Keyboard } from "./Keyboard"
import { NO_SHADOW_LAYER } from "./SwitchLayer"
import { LayoutAnimator } from "./layoutAnimator"
import { QualityContext, type QualityTier } from "./quality"

export interface SceneProps {
  reduced: boolean
  /** la vista del configurador está en pantalla */
  visible: boolean
  /** píxeles tapados por la interfaz en cada borde del lienzo */
  cover: Cover
  onReady: () => void
  fallback: React.ReactNode
}

export default function Scene({ reduced, visible, cover, onReady, fallback }: SceneProps) {
  const [animator] = useState(() => new LayoutAnimator(useConfigurator.getState().config.format))
  const pointer = useRef(new THREE.Vector2())
  const rgbOn = useConfigurator((s) => s.config.rgbMode !== "apagada")
  const showcase = useConfigurator((s) => s.showcase)
  const mobile = useMediaQuery("(max-width: 1023px), (pointer: coarse)")
  const dark = useMediaQuery("(prefers-color-scheme: dark)")

  // calidad adaptativa: mobile arranca en baja; si caen los FPS se baja el
  // pixel ratio y, si no alcanza, se pasa a calidad baja
  const maxDpr = Math.min(typeof window === "undefined" ? 1 : window.devicePixelRatio, mobile ? 1.5 : 2)
  const [dpr, setDpr] = useState(() => Math.min(maxDpr, mobile ? 1.25 : 1.75))
  const [tier, setTier] = useState<QualityTier>(mobile ? "low" : "high")
  const keyLight = useRef<THREE.DirectionalLight>(null)

  useEffect(() => {
    if (!visible) return
    const onMove = (event: PointerEvent) => {
      pointer.current.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1)
      wake()
    }
    window.addEventListener("pointermove", onMove, { passive: true })
    wake()
    return () => window.removeEventListener("pointermove", onMove)
  }, [visible])

  return (
    <Canvas
      frameloop={visible ? "demand" : "never"}
      dpr={dpr}
      gl={{ antialias: !mobile, alpha: true, powerPreference: "high-performance" }}
      camera={{ fov: 32, position: [0, 3, 7], near: 0.1, far: 60 }}
      fallback={fallback}
      onCreated={({ gl, camera }) => {
        // la transmisión de resina y policarbonato se calcula a menor resolución
        gl.transmissionResolutionScale = mobile ? 0.5 : 0.75
        // la cámara ve también la capa que la sombra de contacto ignora
        camera.layers.enable(NO_SHADOW_LAYER)
      }}
      aria-label="Modelo 3D del teclado. Arrastrá para rotar y usá la rueda para acercarte."
      role="img"
      style={{ touchAction: "none" }}
    >
      <PerformanceMonitor
        flipflops={3}
        onIncline={() => setDpr((d) => Math.min(maxDpr, d + 0.25))}
        onDecline={() => setDpr((d) => Math.max(1, d - 0.25))}
        onFallback={() => {
          setDpr(1)
          setTier("low")
        }}
      />
      <QualityContext.Provider value={tier}>
        <ActivityBridge />
        <ViewShift x={(cover.right - cover.left) / 2} y={(cover.bottom - cover.top) / 2} />
        <StudioLights keyLight={keyLight} />
        <ActiveLayerLight reduced={reduced} />

        {/* softboxes en tira: dejan reflejos largos y limpios en el aluminio */}
        <Environment resolution={tier === "high" ? 256 : 128} frames={1}>
          <color attach="background" args={["#6f6c69"]} />
          <Lightformer intensity={1.8} rotation-x={Math.PI / 2} position={[0, 5, 0]} scale={[7, 1.4, 1]} />
          <Lightformer intensity={2.2} rotation-y={Math.PI / 2} position={[-5, 1.8, 1]} scale={[7, 1.1, 1]} />
          <Lightformer intensity={1.2} rotation-y={-Math.PI / 2} position={[5, 1.4, 1]} scale={[7, 0.8, 1]} />
          <Lightformer intensity={3} position={[0, 2.2, -6]} scale={[11, 1.2, 1]} />
          <Lightformer form="ring" intensity={1.4} position={[2.5, 3, 5]} scale={1.6} />
          <Lightformer intensity={0.5} position={[0, -2, 6]} scale={[10, 2, 1]} />
        </Environment>

        <Selection>
          <Keyboard animator={animator} reduced={reduced} pointer={pointer} />
          {rgbOn ? (
            <EffectComposer multisampling={tier === "high" ? 4 : 0}>
              {/* bloom solo sobre lo marcado con <Select>: LEDs y leyendas que brillan */}
              <SelectiveBloom
                lights={[keyLight]}
                mipmapBlur
                luminanceThreshold={0.1}
                luminanceSmoothing={0.3}
                intensity={1.6}
                radius={0.6}
              />
              <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
            </EffectComposer>
          ) : null}
        </Selection>
        <Ready onReady={onReady} />

        {/* el compositor de Bloom no respeta el degradé de alfa del piso:
            con las luces prendidas queda solo la sombra de contacto */}
        {rgbOn || showcase ? null : <Floor dark={dark} />}
        <ContactShadows
          position={[0, 0.004, 0.1]}
          opacity={dark ? 0.7 : 0.42}
          scale={9}
          blur={tier === "high" ? 2.6 : 2}
          far={3.6}
          resolution={tier === "high" ? 1024 : 512}
          color="#1e1a16"
        />

        <CameraRig reduced={reduced} cover={cover} />

      </QualityContext.Provider>
    </Canvas>
  )
}

/**
 * Esquema de estudio de tres luces: principal suave desde arriba a la
 * izquierda, relleno tenue del otro lado y contorno desde atrás para
 * recortar la carcasa y las teclas contra el fondo.
 */
function StudioLights({ keyLight }: { keyLight: React.RefObject<THREE.DirectionalLight | null> }) {
  return (
    <>
      <ambientLight intensity={0.16} />
      <directionalLight ref={keyLight} position={[-3.5, 5.5, 4]} intensity={2.1} color="#fff6ec" />
      <directionalLight position={[4.5, 2.2, 3]} intensity={0.55} color="#eef3ff" />
      <directionalLight position={[0.5, 3.4, -5.5]} intensity={2.8} color="#ffffff" />
    </>
  )
}

/** Conecta la escena con las fuentes de actividad (store, mouse, teclado). */
function ActivityBridge() {
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    bindInvalidate(invalidate)
    const unsubscribe = useConfigurator.subscribe(() => wake())
    wake()
    return () => {
      unsubscribe()
      bindInvalidate(null)
    }
  }, [invalidate])
  return null
}

function Ready({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    onReady()
  }, [onReady])
  return null
}

/** Corre el encuadre para que el modelo quede en la zona libre de UI. */
function ViewShift({ x, y }: { x: number; y: number }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const size = useThree((s) => s.size)
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    if (Math.abs(x) < 1 && Math.abs(y) < 1) {
      camera.clearViewOffset()
    } else {
      camera.setViewOffset(size.width, size.height, x, y, size.width, size.height)
    }
    camera.updateProjectionMatrix()
    invalidate()
  }, [camera, x, y, size.width, size.height, invalidate])
  return null
}

/** Spot que ilumina la capa activa mientras flota al frente. */
function ActiveLayerLight({ reduced }: { reduced: boolean }) {
  const light = useRef<THREE.SpotLight>(null)
  const target = useMemo(() => new THREE.Object3D(), [])
  const placed = useConfigurator((s) => s.placed)
  const phase = useConfigurator((s) => s.phase)

  useFrame((state, delta) => {
    const l = light.current
    if (!l) return
    const active = activeStepIndex(placed)
    const y = layerOffsetY(active, placed) + LAYER_FOCUS_Y[active]
    const on = phase === "building" && placed < LAYER_COUNT
    target.position.set(0, y, ACTIVE_FORWARD)
    l.position.set(0.6, y + 3.2, ACTIVE_FORWARD + 2.4)
    const goal = on ? 22 : 0
    l.intensity = reduced ? goal : THREE.MathUtils.damp(l.intensity, goal, 4, Math.min(delta, 1 / 30))
    if (Math.abs(l.intensity - goal) > 0.01) state.invalidate()
    else l.intensity = goal
  })

  return (
    <>
      <primitive object={target} />
      <spotLight ref={light} target={target} angle={0.42} penumbra={0.85} distance={9} decay={1.6} color="#ffffff" intensity={0} />
    </>
  )
}

/** Superficie mate de estudio bajo el teclado, fundida con el fondo. */
function Floor({ dark }: { dark: boolean }) {
  const fade = useMemo(() => {
    const size = 256
    const canvas = document.createElement("canvas")
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext("2d")!
    const grad = ctx.createRadialGradient(size / 2, size * 0.5, size * 0.08, size / 2, size * 0.5, size * 0.5)
    grad.addColorStop(0, "#ffffff")
    grad.addColorStop(0.55, "#9a9a9a")
    grad.addColorStop(1, "#000000")
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, size, size)
    return new THREE.CanvasTexture(canvas)
  }, [])
  useEffect(() => () => fade.dispose(), [fade])

  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -0.002, 0.2]}>
      <planeGeometry args={[12, 8]} />
      <meshStandardMaterial
        color={dark ? "#2a2826" : "#e2ded8"}
        alphaMap={fade}
        transparent
        roughness={1}
        metalness={0}
        depthWrite={false}
        envMapIntensity={0.25}
      />
    </mesh>
  )
}
