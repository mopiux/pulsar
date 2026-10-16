import { useEffect, useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Select } from "@react-three/postprocessing"
import * as THREE from "three"

import type { Config } from "@/data/catalog"
import { ALL_KEY_IDS } from "@/data/layouts"

import { PLATE_THICKNESS, PLATE_Y, PRESS_DEPTH, STEM_H, SWITCH_BASE, SWITCH_HOUSING_H, U } from "./constants"
import type { LayoutAnimator } from "./layoutAnimator"
import { createGlowTexture, ledColor } from "./leds"
import { useSwitchMaterials } from "./materials"

const SWITCH_COUNT = ALL_KEY_IDS.length
/** capa de render que la sombra de contacto no ve (luces, cable, leyendas) */
export const NO_SHADOW_LAYER = 1

/**
 * Switches instanciados y su LED: un punto de luz sobre la placa y un halo
 * debajo de cada tecla que asoma por los bordes y se desvanece. La placa en
 * sí no se ilumina.
 */
export function SwitchLayer({ config, animator }: { config: Config; animator: LayoutAnimator }) {
  const [housingMat, stemMat] = useSwitchMaterials(config)
  const housingRef = useRef<THREE.InstancedMesh>(null)
  const stemARef = useRef<THREE.InstancedMesh>(null)
  const stemBRef = useRef<THREE.InstancedMesh>(null)
  const glowRef = useRef<THREE.InstancedMesh>(null)
  const dotRef = useRef<THREE.InstancedMesh>(null)

  const geos = useMemo(() => {
    const housing = new THREE.BoxGeometry(0.14, SWITCH_HOUSING_H, 0.14)
    housing.translate(0, SWITCH_HOUSING_H / 2, 0)
    const stemA = new THREE.BoxGeometry(0.045, STEM_H, 0.012)
    stemA.translate(0, STEM_H / 2, 0)
    const stemB = new THREE.BoxGeometry(0.012, STEM_H, 0.045)
    stemB.translate(0, STEM_H / 2, 0)
    const glow = new THREE.PlaneGeometry(1, 1)
    glow.rotateX(-Math.PI / 2)
    const dot = new THREE.BoxGeometry(0.04, 0.012, 0.026)
    return { housing, stemA, stemB, glow, dot }
  }, [])

  const { glowMat, dotMat, glowTex } = useMemo(() => {
    const tex = createGlowTexture()
    return {
      glowTex: tex,
      glowMat: new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
      dotMat: new THREE.MeshBasicMaterial({ toneMapped: false }),
    }
  }, [])

  useEffect(
    () => () => {
      Object.values(geos).forEach((g) => g.dispose())
      glowMat.dispose()
      dotMat.dispose()
      glowTex.dispose()
    },
    [geos, glowMat, dotMat, glowTex]
  )

  // luces, sin sombra de contacto
  useEffect(() => {
    glowRef.current?.layers.set(NO_SHADOW_LAYER)
    dotRef.current?.layers.set(NO_SHADOW_LAYER)
  }, [])

  const m = useMemo(() => new THREE.Matrix4(), [])
  const q = useMemo(() => new THREE.Quaternion(), [])
  const pos = useMemo(() => new THREE.Vector3(), [])
  const scl = useMemo(() => new THREE.Vector3(), [])
  const col = useMemo(() => new THREE.Color(), [])
  const base = useMemo(() => new THREE.Color(), [])
  const halo = useMemo(() => new THREE.Color(), [])

  useFrame((state) => {
    // la ola es movimiento continuo: mientras esté prendida se piden cuadros
    if (config.rgbMode === "ola") state.invalidate()
    const housing = housingRef.current
    const stemA = stemARef.current
    const stemB = stemBRef.current
    const glow = glowRef.current
    const dot = dotRef.current
    if (!housing || !stemA || !stemB || !glow || !dot) return
    const time = state.clock.elapsedTime
    const on = config.rgbMode !== "apagada"
    glow.visible = on
    dot.visible = on
    base.set(config.rgbColor)

    let i = 0
    for (const key of animator.keys.values()) {
      const s = key.s
      pos.set(key.x, SWITCH_BASE, key.z)
      scl.set(s, s, s)
      m.compose(pos, q, scl)
      housing.setMatrixAt(i, m)

      pos.set(key.x, SWITCH_BASE + SWITCH_HOUSING_H - key.p * PRESS_DEPTH * 0.8, key.z)
      m.compose(pos, q, scl)
      stemA.setMatrixAt(i, m)
      stemB.setMatrixAt(i, m)

      if (on) {
        ledColor(col, key, config.rgbMode, base, time)

        // halo: más ancho que la tecla para que la luz se escape por los bordes
        pos.set(key.x, PLATE_Y + PLATE_THICKNESS / 2 + 0.004, key.z)
        scl.set(Math.max(1e-4, (key.w * U + 0.16) * s), 1, Math.max(1e-4, (U + 0.16) * s))
        m.compose(pos, q, scl)
        glow.setMatrixAt(i, m)
        glow.setColorAt(i, halo.copy(col).multiplyScalar(1.6))

        // punto de luz al pie del switch, del lado de atrás
        pos.set(key.x, PLATE_Y + PLATE_THICKNESS / 2 + 0.006, key.z - 0.055)
        scl.set(s, s, s)
        m.compose(pos, q, scl)
        dot.setMatrixAt(i, m)
        dot.setColorAt(i, col.multiplyScalar(4))
      }
      i++
    }
    housing.instanceMatrix.needsUpdate = true
    stemA.instanceMatrix.needsUpdate = true
    stemB.instanceMatrix.needsUpdate = true
    if (on) {
      glow.instanceMatrix.needsUpdate = true
      dot.instanceMatrix.needsUpdate = true
      if (glow.instanceColor) glow.instanceColor.needsUpdate = true
      if (dot.instanceColor) dot.instanceColor.needsUpdate = true
    }
  })

  return (
    <group>
      <instancedMesh ref={housingRef} args={[geos.housing, housingMat, SWITCH_COUNT]} castShadow frustumCulled={false} />
      <instancedMesh ref={stemARef} args={[geos.stemA, stemMat, SWITCH_COUNT]} frustumCulled={false} />
      <instancedMesh ref={stemBRef} args={[geos.stemB, stemMat, SWITCH_COUNT]} frustumCulled={false} />
      {/* solo los LEDs entran al bloom */}
      <Select enabled={config.rgbMode !== "apagada"}>
        <instancedMesh ref={glowRef} args={[geos.glow, glowMat, SWITCH_COUNT]} frustumCulled={false} renderOrder={1} />
        <instancedMesh ref={dotRef} args={[geos.dot, dotMat, SWITCH_COUNT]} frustumCulled={false} />
      </Select>
    </group>
  )
}
