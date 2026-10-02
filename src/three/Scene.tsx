import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { ContactShadows, Environment, Lightformer } from "@react-three/drei"
import { Bloom, EffectComposer, ToneMapping } from "@react-three/postprocessing"
import { ToneMappingMode } from "postprocessing"
import * as THREE from "three"

import { useMediaQuery } from "@/hooks/useMediaQuery"
import { LAYER_COUNT, activeStepIndex, useConfigurator } from "@/store/configurator"

import { ACTIVE_FORWARD, LAYER_FOCUS_Y, layerOffsetY } from "./constants"
import { CameraRig, type Cover } from "./CameraRig"
import { Keyboard } from "./Keyboard"
import { LayoutAnimator } from "./layoutAnimator"
import { createFadeTexture, createWoodTexture } from "./woodTexture"

export interface SceneProps {
  reduced: boolean
  /** píxeles tapados por la interfaz en cada borde del lienzo */
  cover: Cover
  onReady: () => void
  fallback: React.ReactNode
}

export function Scene({ reduced, cover, onReady, fallback }: SceneProps) {
  const [animator] = useState(() => new LayoutAnimator(useConfigurator.getState().config.format))
  const pointer = useRef(new THREE.Vector2())
  const rgbOn = useConfigurator((s) => s.config.rgbMode !== "apagada")

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      pointer.current.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1)
    }
    window.addEventListener("pointermove", onMove, { passive: true })
    return () => window.removeEventListener("pointermove", onMove)
  }, [])

  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ fov: 32, position: [0, 3, 7], near: 0.1, far: 60 }}
      fallback={fallback}
      aria-label="Modelo 3D del teclado. Arrastrá para rotar y usá la rueda para acercarte."
      role="img"
    >
      <ViewShift x={(cover.right - cover.left) / 2} y={(cover.bottom - cover.top) / 2} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 6, 4]} intensity={1.6} color="#fff4e6" />
      <directionalLight position={[-4, 3, -3]} intensity={0.5} color="#e6f0ff" />
      <ActiveLayerLight reduced={reduced} />

      <Environment resolution={256} frames={1}>
        <color attach="background" args={["#8f8a8c"]} />
        <Lightformer intensity={2.4} rotation-x={Math.PI / 2} position={[0, 5, -1]} scale={[10, 5, 1]} />
        <Lightformer intensity={1.3} rotation-y={Math.PI / 2} position={[-6, 1.5, 0]} scale={[9, 3, 1]} color="#fff0dc" />
        <Lightformer intensity={1.1} rotation-y={-Math.PI / 2} position={[6, 1.5, 0]} scale={[9, 3, 1]} color="#e9f3ff" />
        <Lightformer form="ring" intensity={1.6} position={[2.5, 3, 5]} scale={2.2} />
        <Lightformer intensity={0.6} position={[0, -2, 6]} scale={[10, 2, 1]} color="#f5e6cf" />
      </Environment>

      <Suspense fallback={null}>
        <Keyboard animator={animator} reduced={reduced} pointer={pointer} />
        <Ready onReady={onReady} />
      </Suspense>

      <Table />
      <ContactShadows
        position={[0, 0.004, 0.1]}
        opacity={0.5}
        scale={9}
        blur={2.6}
        far={3.6}
        resolution={512}
        color="#410b29"
      />

      <CameraRig reduced={reduced} cover={cover} />

      {rgbOn ? (
        <EffectComposer multisampling={4}>
          <Bloom mipmapBlur luminanceThreshold={1.05} luminanceSmoothing={0.2} intensity={0.9} radius={0.72} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      ) : null}
    </Canvas>
  )
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
  useEffect(() => {
    if (Math.abs(x) < 1 && Math.abs(y) < 1) {
      camera.clearViewOffset()
    } else {
      camera.setViewOffset(size.width, size.height, x, y, size.width, size.height)
    }
    camera.updateProjectionMatrix()
  }, [camera, x, y, size.width, size.height])
  return null
}

/** Spot que ilumina la capa activa mientras flota al frente. */
function ActiveLayerLight({ reduced }: { reduced: boolean }) {
  const light = useRef<THREE.SpotLight>(null)
  const target = useMemo(() => new THREE.Object3D(), [])
  const placed = useConfigurator((s) => s.placed)
  const phase = useConfigurator((s) => s.phase)

  useFrame((_, delta) => {
    const l = light.current
    if (!l) return
    const active = activeStepIndex(placed)
    const y = layerOffsetY(active, placed) + LAYER_FOCUS_Y[active]
    const on = phase === "building" && placed < LAYER_COUNT
    target.position.set(0, y, ACTIVE_FORWARD)
    l.position.set(0.6, y + 3.2, ACTIVE_FORWARD + 2.4)
    const goal = on ? 26 : 0
    l.intensity = reduced ? goal : THREE.MathUtils.damp(l.intensity, goal, 4, Math.min(delta, 1 / 30))
  })

  return (
    <>
      <primitive object={target} />
      <spotLight
        ref={light}
        target={target}
        angle={0.42}
        penumbra={0.85}
        distance={9}
        decay={1.6}
        color="#fff6ea"
        intensity={0}
      />
    </>
  )
}

/** Mesa de madera bajo el teclado, fundida con el fondo en los bordes. */
function Table() {
  // en modo oscuro la madera se apaga para no leerse como un foco
  const dark = useMediaQuery("(prefers-color-scheme: dark)")
  const { wood, fade } = useMemo(() => {
    const w = createWoodTexture()
    w.repeat.set(2.2, 1.4)
    return { wood: w, fade: createFadeTexture() }
  }, [])
  useEffect(
    () => () => {
      wood.dispose()
      fade.dispose()
    },
    [wood, fade]
  )
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -0.002, 0.3]}>
      <planeGeometry args={[13, 8]} />
      <meshStandardMaterial
        color={dark ? "#7d6c5f" : "#ffe9c4"}
        map={wood}
        alphaMap={fade}
        transparent
        roughness={0.68}
        metalness={0}
        depthWrite={false}
        envMapIntensity={0.6}
      />
    </mesh>
  )
}
