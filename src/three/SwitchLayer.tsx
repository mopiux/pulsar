import { useEffect, useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

import type { Config } from "@/data/catalog"
import { ALL_KEY_IDS } from "@/data/layouts"

import { KEY_GAP, PLATE_THICKNESS, PLATE_Y, PRESS_DEPTH, STEM_H, SWITCH_BASE, SWITCH_HOUSING_H, U } from "./constants"
import type { LayoutAnimator } from "./layoutAnimator"
import { useSwitchMaterials } from "./materials"

// ---------- capa 3: switches y LEDs ----------

const SWITCH_COUNT = ALL_KEY_IDS.length

export function SwitchLayer({ config, animator }: { config: Config; animator: LayoutAnimator }) {
  const [housingMat, stemMat] = useSwitchMaterials(config)
  const housingRef = useRef<THREE.InstancedMesh>(null)
  const stemARef = useRef<THREE.InstancedMesh>(null)
  const stemBRef = useRef<THREE.InstancedMesh>(null)
  const ledRef = useRef<THREE.InstancedMesh>(null)

  const housingGeo = useMemo(() => {
    const g = new THREE.BoxGeometry(0.14, SWITCH_HOUSING_H, 0.14)
    g.translate(0, SWITCH_HOUSING_H / 2, 0)
    return g
  }, [])
  const stemAGeo = useMemo(() => {
    const g = new THREE.BoxGeometry(0.045, STEM_H, 0.012)
    g.translate(0, STEM_H / 2, 0)
    return g
  }, [])
  const stemBGeo = useMemo(() => {
    const g = new THREE.BoxGeometry(0.012, STEM_H, 0.045)
    g.translate(0, STEM_H / 2, 0)
    return g
  }, [])
  const ledGeo = useMemo(() => {
    const g = new THREE.PlaneGeometry(1, 1)
    g.rotateX(-Math.PI / 2)
    return g
  }, [])
  const ledMat = useMemo(() => new THREE.MeshBasicMaterial({ toneMapped: false, color: "#ffffff" }), [])

  useEffect(
    () => () => {
      housingGeo.dispose()
      stemAGeo.dispose()
      stemBGeo.dispose()
      ledGeo.dispose()
      ledMat.dispose()
    },
    [housingGeo, stemAGeo, stemBGeo, ledGeo, ledMat]
  )

  const m = useMemo(() => new THREE.Matrix4(), [])
  const q = useMemo(() => new THREE.Quaternion(), [])
  const pos = useMemo(() => new THREE.Vector3(), [])
  const scl = useMemo(() => new THREE.Vector3(), [])
  const col = useMemo(() => new THREE.Color(), [])
  const base = useMemo(() => new THREE.Color(), [])
  const hsl = useMemo(() => ({ h: 0, s: 0, l: 0 }), [])

  useFrame((state) => {
    // la ola de luz es movimiento continuo: mientras esté prendida se piden cuadros
    if (config.rgbMode === "ola") state.invalidate()
    const housing = housingRef.current
    const stemA = stemARef.current
    const stemB = stemBRef.current
    const led = ledRef.current
    if (!housing || !stemA || !stemB || !led) return
    const time = state.clock.elapsedTime
    const mode = config.rgbMode
    led.visible = mode !== "apagada"
    base.set(config.rgbColor)
    base.getHSL(hsl)

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

      pos.set(key.x, PLATE_Y + PLATE_THICKNESS / 2 + 0.003, key.z)
      scl.set(Math.max(0.0001, (key.w * U - KEY_GAP * 0.5) * s), 1, Math.max(0.0001, (U - KEY_GAP * 0.5) * s))
      m.compose(pos, q, scl)
      led.setMatrixAt(i, m)

      if (mode === "fija") {
        col.copy(base).multiplyScalar(2.6)
      } else if (mode === "ola") {
        const wave = Math.sin(key.x * 3.2 - time * 2.6 + key.z * 1.4)
        col.setHSL((hsl.h + wave * 0.07 + 1) % 1, Math.min(1, hsl.s + 0.05), hsl.l)
        col.multiplyScalar(1.7 + (wave + 1) * 1.1)
      } else {
        col.setRGB(0, 0, 0)
      }
      // si una tecla se presiona, su LED se aviva
      col.multiplyScalar(1 + key.p * 0.8)
      led.setColorAt(i, col)
      i++
    }
    housing.instanceMatrix.needsUpdate = true
    stemA.instanceMatrix.needsUpdate = true
    stemB.instanceMatrix.needsUpdate = true
    led.instanceMatrix.needsUpdate = true
    if (led.instanceColor) led.instanceColor.needsUpdate = true
  })

  return (
    <group>
      <instancedMesh ref={housingRef} args={[housingGeo, housingMat, SWITCH_COUNT]} castShadow frustumCulled={false} />
      <instancedMesh ref={stemARef} args={[stemAGeo, stemMat, SWITCH_COUNT]} frustumCulled={false} />
      <instancedMesh ref={stemBRef} args={[stemBGeo, stemMat, SWITCH_COUNT]} frustumCulled={false} />
      <instancedMesh ref={ledRef} args={[ledGeo, ledMat, SWITCH_COUNT]} frustumCulled={false} />
    </group>
  )
}
