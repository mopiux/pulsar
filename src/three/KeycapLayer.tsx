import { useEffect, useMemo, useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

import type { Config } from "@/data/catalog"
import { ALL_KEY_IDS, ANY_KEY_DEF, type KeyDef, type Layout } from "@/data/layouts"

import { KEYCAP_BASE, PRESS_DEPTH, PROFILE, U } from "./constants"
import { keycapGeometry, keycapTop } from "./geometry"
import type { LayoutAnimator } from "./layoutAnimator"
import { cellIndex, cellUv, ENGRAVING_ASPECT, engravingUv, LegendAtlas, legendFontReady, type LegendEntry } from "./legendAtlas"
import { useKeycapMaterials, type KeycapMaterials } from "./materials"

/*
  Teclas instanciadas: un InstancedMesh por combinación de ancho, fila del
  perfil y material (PBT o resina). El color de cada tecla va por instancia.
  Las leyendas son otro InstancedMesh de planos que leen su celda del atlas.
*/

type Kind = "alpha" | "mod" | "accent"

interface Member {
  id: string
  def: KeyDef
  kind: Kind
}

interface Group {
  key: string
  w: number
  row: KeyDef["row"]
  resin: boolean
  members: Member[]
}

const kindOf = (def: KeyDef): Kind => (def.kind === "space" ? "alpha" : def.kind)

export function KeycapLayer({ config, animator, layout }: { config: Config; animator: LayoutAnimator; layout: Layout }) {
  const materials = useKeycapMaterials(config)

  const groups = useMemo(() => {
    const present = new Map(layout.keys.map((k) => [k.id, k]))
    const map = new Map<string, Group>()
    for (const id of ALL_KEY_IDS) {
      const def = present.get(id) ?? ANY_KEY_DEF[id]
      const kind = kindOf(def)
      const resin = kind === "accent" && materials.resinAccent
      const key = `${def.w}|${def.row}|${resin ? "r" : "p"}`
      let group = map.get(key)
      if (!group) {
        group = { key, w: def.w, row: def.row, resin, members: [] }
        map.set(key, group)
      }
      group.members.push({ id, def, kind })
    }
    return [...map.values()]
  }, [layout, materials.resinAccent])

  return (
    <group>
      {groups.map((group) => (
        <KeycapGroup key={group.key} group={group} materials={materials} animator={animator} />
      ))}
      <Legends config={config} layout={layout} materials={materials} animator={animator} />
    </group>
  )
}

function KeycapGroup({ group, materials, animator }: { group: Group; materials: KeycapMaterials; animator: LayoutAnimator }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const geometry = keycapGeometry(group.w, group.row)
  const material = group.resin ? materials.resin : materials.pbt

  useEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    const color = new THREE.Color()
    group.members.forEach((member, i) => {
      if (group.resin) color.set("#ffffff")
      else color.set(materials.colors[member.kind])
      mesh.setColorAt(i, color)
    })
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [group, materials])

  const m = useMemo(() => new THREE.Matrix4(), [])
  const q = useMemo(() => new THREE.Quaternion(), [])
  const p = useMemo(() => new THREE.Vector3(), [])
  const s = useMemo(() => new THREE.Vector3(), [])

  useFrame(() => {
    const mesh = ref.current
    if (!mesh) return
    group.members.forEach((member, i) => {
      const state = animator.keys.get(member.id)!
      p.set(state.x, KEYCAP_BASE - state.p * PRESS_DEPTH, state.z)
      s.set(Math.max(1e-4, (state.w / member.def.w) * state.s), Math.max(1e-4, state.s), Math.max(1e-4, state.s))
      m.compose(p, q, s)
      mesh.setMatrixAt(i, m)
    })
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={ref}
      args={[geometry, material, group.members.length]}
      castShadow
      receiveShadow
      frustumCulled={false}
    />
  )
}

// ---------- leyendas ----------

const LEGEND_SIZE = U * 0.78
const LEGEND_COUNT = ALL_KEY_IDS.length + 1 // + franja de grabado

function legendMaterial(map: THREE.Texture) {
  const material = new THREE.MeshStandardMaterial({
    map,
    transparent: true,
    depthWrite: false,
    roughness: 0.75,
    metalness: 0,
    polygonOffset: true,
    polygonOffsetFactor: -2,
  })
  // cada instancia lee su propia celda del atlas
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nattribute vec4 aCell;")
      .replace("#include <uv_vertex>", "#include <uv_vertex>\n#ifdef USE_MAP\n  vMapUv = vMapUv * aCell.zw + aCell.xy;\n#endif")
  }
  return material
}

function Legends({
  config,
  layout,
  materials,
  animator,
}: {
  config: Config
  layout: Layout
  materials: KeycapMaterials
  animator: LayoutAnimator
}) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const atlas = useMemo(() => new LegendAtlas(), [])
  const [fontReady, setFontReady] = useState(false)

  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(1, 1)
    const cells = new Float32Array(LEGEND_COUNT * 4)
    ALL_KEY_IDS.forEach((id, i) => cells.set(cellUv(cellIndex(id)), i * 4))
    cells.set(engravingUv(), ALL_KEY_IDS.length * 4)
    g.setAttribute("aCell", new THREE.InstancedBufferAttribute(cells, 4))
    return g
  }, [])
  const material = useMemo(() => legendMaterial(atlas.texture), [atlas])

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
      atlas.dispose()
    },
    [geometry, material, atlas]
  )

  useEffect(() => {
    let alive = true
    void legendFontReady().then(() => alive && setFontReady(true))
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    const present = new Map(layout.keys.map((k) => [k.id, k]))
    const entries = new Map<string, LegendEntry>()
    for (const id of ALL_KEY_IDS) {
      const def = present.get(id) ?? ANY_KEY_DEF[id]
      entries.set(id, { label: def.label, color: materials.legend[kindOf(def)] })
    }
    atlas.drawKeys(entries)
  }, [atlas, layout, materials.legend, fontReady])

  useEffect(() => {
    atlas.drawEngraving(config.engraving, materials.legend.alpha)
  }, [atlas, config.engraving, materials.legend.alpha, fontReady])

  const rotations = useMemo(() => {
    const out = new Map<number, THREE.Quaternion>()
    for (const row of [1, 2, 3, 4] as const) {
      out.set(row, new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2 + PROFILE[row].angle, 0, 0)))
    }
    return out
  }, [])

  const m = useMemo(() => new THREE.Matrix4(), [])
  const p = useMemo(() => new THREE.Vector3(), [])
  const s = useMemo(() => new THREE.Vector3(), [])

  useFrame(() => {
    const mesh = ref.current
    if (!mesh) return
    ALL_KEY_IDS.forEach((id, i) => {
      const state = animator.keys.get(id)!
      const def = state.def
      const size = LEGEND_SIZE * Math.max(1e-4, state.s)
      p.set(state.x, KEYCAP_BASE - state.p * PRESS_DEPTH + keycapTop(def.row) + 0.0015, state.z)
      s.set(size, size, 1)
      m.compose(p, rotations.get(def.row)!, s)
      mesh.setMatrixAt(i, m)
      if (id === "space") {
        const width = def.w * U * 0.84 * Math.max(1e-4, state.s)
        s.set(width, width / ENGRAVING_ASPECT, 1)
        m.compose(p, rotations.get(def.row)!, s)
        mesh.setMatrixAt(ALL_KEY_IDS.length, m)
      }
    })
    mesh.instanceMatrix.needsUpdate = true
  })

  return <instancedMesh ref={ref} args={[geometry, material, LEGEND_COUNT]} frustumCulled={false} renderOrder={2} />
}
