import * as THREE from "three"
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js"

import type { ProfileRow } from "@/data/layouts"

import { CASE_SLAB_TOP, CASE_WALL_BOTTOM, CASE_WALL_TOP, KEY_GAP, PROFILE, TILT, U } from "./constants"

// ---------- teclas esculpidas ----------

const keycapCache = new Map<string, THREE.BufferGeometry>()

/**
 * Tecla con forma real: base más ancha que la cara superior (paredes en
 * talud) y cara superior inclinada según la fila del perfil escalonado.
 * El origen queda en el centro de la base.
 */
export function keycapGeometry(widthU: number, row: ProfileRow): THREE.BufferGeometry {
  const key = `${widthU}-${row}`
  const cached = keycapCache.get(key)
  if (cached) return cached

  const { height, angle } = PROFILE[row]
  const w = widthU * U - KEY_GAP
  const d = U - KEY_GAP
  const geo = new RoundedBoxGeometry(w, height, d, 3, 0.022)
  const pos = geo.attributes.position as THREE.BufferAttribute
  const insetX = 0.024
  const insetFront = 0.022
  const insetBack = 0.034
  const v = new THREE.Vector3()

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    const t = (v.y + height / 2) / height // 0 abajo, 1 arriba
    const sx = (w / 2 - insetX * t) / (w / 2)
    v.x *= sx
    if (v.z >= 0) v.z = v.z * ((d / 2 - insetFront * t) / (d / 2))
    else v.z = v.z * ((d / 2 - insetBack * t) / (d / 2))
    // la cara superior se inclina hacia el usuario según la fila
    v.y += -v.z * Math.tan(angle) * t
    v.y += height / 2
    pos.setXYZ(i, v.x, v.y, v.z)
  }
  geo.computeVertexNormals()
  keycapCache.set(key, geo)
  return geo
}

/** Altura de la cara superior de la tecla en su centro. */
export function keycapTop(row: ProfileRow): number {
  return PROFILE[row].height
}

// ---------- carcasa ----------

function roundedRectShape(w: number, d: number, r: number): THREE.Shape {
  const s = new THREE.Shape()
  const x = -w / 2
  const y = -d / 2
  s.moveTo(x + r, y)
  s.lineTo(x + w - r, y)
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false)
  s.lineTo(x + w, y + d - r)
  s.absarc(x + w - r, y + d - r, r, 0, Math.PI / 2, false)
  s.lineTo(x + r, y + d)
  s.absarc(x + r, y + d - r, r, Math.PI / 2, Math.PI, false)
  s.lineTo(x, y + r)
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false)
  return s
}

function roundedRectPath(w: number, d: number, r: number): THREE.Path {
  const shape = roundedRectShape(w, d, r)
  const path = new THREE.Path()
  path.curves = shape.curves
  return path
}

export interface CaseGeometries {
  walls: THREE.BufferGeometry
  slab: THREE.BufferGeometry
}

/**
 * Carcasa en dos piezas: paredes extruidas con biselado y una base en cuña
 * que compensa la inclinación, para que apoye plana sobre la mesa.
 */
export function caseGeometry(outerW: number, outerD: number, innerW: number, innerD: number, innerOffsetZ: number): CaseGeometries {
  const radius = 0.09
  const wallH = CASE_WALL_TOP - CASE_WALL_BOTTOM
  const bevel = 0.018

  const outer = roundedRectShape(outerW - bevel * 2, outerD - bevel * 2, radius)
  const hole = roundedRectPath(innerW, innerD, 0.03)
  // la forma vive en XY con Y = -Z del mundo
  hole.curves.forEach((curve) => {
    if (curve instanceof THREE.LineCurve) {
      curve.v1.y -= innerOffsetZ
      curve.v2.y -= innerOffsetZ
    } else if (curve instanceof THREE.EllipseCurve) {
      curve.aY -= innerOffsetZ
    }
  })
  outer.holes.push(hole)

  const walls = new THREE.ExtrudeGeometry(outer, {
    depth: wallH - bevel * 2,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments: 10,
  })
  walls.rotateX(-Math.PI / 2)
  walls.translate(0, CASE_WALL_BOTTOM + bevel, 0)
  walls.computeVertexNormals()

  const slabShape = roundedRectShape(outerW - 0.02, outerD - 0.02, radius)
  const slabH = CASE_SLAB_TOP
  const slab = new THREE.ExtrudeGeometry(slabShape, {
    depth: slabH,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    bevelSegments: 2,
    curveSegments: 10,
  })
  slab.rotateX(-Math.PI / 2)
  // cuña: el fondo baja hacia atrás para quedar horizontal al inclinar
  const pos = slab.attributes.position as THREE.BufferAttribute
  const front = outerD / 2
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i)
    const z = pos.getZ(i)
    if (y < slabH * 0.5) {
      pos.setY(i, y - (front - z) * Math.tan(TILT))
    }
  }
  slab.computeVertexNormals()

  return { walls, slab }
}

// ---------- perilla moleteada ----------

export function knobGeometry(radius: number, height: number): THREE.BufferGeometry {
  const radial = 72
  const geo = new THREE.CylinderGeometry(radius, radius * 1.02, height, radial, 6, false)
  const pos = geo.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const z = pos.getZ(i)
    const y = pos.getY(i)
    const r = Math.hypot(x, z)
    // estrías solo en la pared lateral, no en las tapas
    if (Math.abs(r - radius) < radius * 0.08 && Math.abs(y) < height / 2 - 0.004) {
      const a = Math.atan2(z, x)
      const ridge = 1 + 0.035 * Math.sign(Math.sin(a * 36))
      pos.setX(i, x * ridge)
      pos.setZ(i, z * ridge)
    }
  }
  geo.computeVertexNormals()
  geo.translate(0, height / 2, 0)
  return geo
}

// ---------- cable en espiral ----------

/**
 * Recorrido del cable: sale por atrás, baja, hace un tramo en espiral y
 * termina en un conector aviador; el resto se pierde fuera de la mesa.
 */
export function cableCurve(): { curve: THREE.CatmullRomCurve3; connectorAt: number } {
  const points: THREE.Vector3[] = []
  points.push(new THREE.Vector3(0, 0.22, 0.02))
  points.push(new THREE.Vector3(0, 0.2, -0.12))
  points.push(new THREE.Vector3(0, 0.1, -0.28))

  const turns = 9
  const coilStart = -0.36
  const coilLength = 0.92
  const r = 0.055
  const steps = turns * 18
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const a = t * turns * Math.PI * 2
    points.push(new THREE.Vector3(Math.sin(a) * r, 0.075 + Math.cos(a) * r, coilStart - t * coilLength))
  }

  const connectorZ = coilStart - coilLength - 0.2
  points.push(new THREE.Vector3(0.02, 0.05, connectorZ + 0.06))
  points.push(new THREE.Vector3(0.04, 0.04, connectorZ))
  points.push(new THREE.Vector3(0.06, 0.035, connectorZ - 0.12))
  points.push(new THREE.Vector3(0.2, 0.03, connectorZ - 0.32))
  points.push(new THREE.Vector3(0.48, 0.03, connectorZ - 0.44))

  const curve = new THREE.CatmullRomCurve3(points, false, "centripetal")
  // posición aproximada del conector sobre la curva (0..1)
  const connectorAt = (points.length - 4) / (points.length - 1)
  return { curve, connectorAt }
}
