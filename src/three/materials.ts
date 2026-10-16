import { useEffect, useMemo } from "react"
import * as THREE from "three"

import {
  getCable,
  getCase,
  getKeycapSet,
  getPlate,
  getSwitch,
  knobColor,
  type Config,
} from "@/data/catalog"

import { useQuality } from "./quality"

function useDisposable<T extends THREE.Material | THREE.Material[]>(factory: () => T, deps: unknown[]): T {
  const value = useMemo(factory, deps)
  useEffect(
    () => () => {
      const list = Array.isArray(value) ? value : [value]
      list.forEach((m) => m.dispose())
    },
    [value]
  )
  return value
}

/**
 * Plástico translúcido: con calidad alta usa transmisión real; con calidad
 * baja (mobile o FPS bajos) se resuelve con opacidad, que es mucho más barato.
 */
function translucent(color: string, high: boolean, opts: { roughness: number; thickness: number; ior: number; attenuation: string; distance: number }) {
  if (high) {
    return new THREE.MeshPhysicalMaterial({
      color,
      metalness: 0,
      roughness: opts.roughness,
      transmission: 0.9,
      thickness: opts.thickness,
      ior: opts.ior,
      attenuationColor: new THREE.Color(opts.attenuation),
      attenuationDistance: opts.distance,
      clearcoat: 0.6,
      clearcoatRoughness: 0.2,
      transparent: true,
    })
  }
  return new THREE.MeshPhysicalMaterial({
    color,
    metalness: 0,
    roughness: opts.roughness,
    transparent: true,
    opacity: 0.72,
    clearcoat: 0.5,
    clearcoatRoughness: 0.25,
    depthWrite: false,
  })
}

/** Aluminio anodizado (satinado) o policarbonato translúcido. */
export function useCaseMaterial(config: Config) {
  const option = getCase(config.case)
  const high = useQuality() === "high"
  return useDisposable(() => {
    if (option.material === "policarbonato") {
      return translucent(option.color, high, { roughness: 0.18, thickness: 0.35, ior: 1.58, attenuation: "#cfdde6", distance: 1.4 })
    }
    // anodizado: metal satinado con una capa fina que levanta reflejos limpios
    return new THREE.MeshPhysicalMaterial({
      color: option.color,
      metalness: 0.86,
      roughness: 0.3,
      clearcoat: 0.35,
      clearcoatRoughness: 0.22,
      envMapIntensity: 1.25,
    })
  }, [option.id, high])
}

export function usePlateMaterial(config: Config) {
  const plate = getPlate(config.plate)
  const high = useQuality() === "high"
  return useDisposable(() => {
    if (plate.translucent) {
      return high
        ? new THREE.MeshPhysicalMaterial({
            color: plate.color,
            roughness: plate.roughness,
            metalness: 0,
            transmission: 0.55,
            thickness: 0.05,
            ior: 1.58,
            transparent: true,
          })
        : new THREE.MeshStandardMaterial({ color: plate.color, roughness: plate.roughness, transparent: true, opacity: 0.6 })
    }
    // la placa queda en penumbra entre la carcasa y las teclas: reflejos bajos
    return new THREE.MeshStandardMaterial({
      color: plate.color,
      metalness: plate.metalness,
      roughness: plate.roughness,
      envMapIntensity: 0.45,
    })
  }, [plate.id, high])
}

export interface KeycapMaterials {
  /** PBT mate en blanco: el color de cada tecla llega por instancia */
  pbt: THREE.Material
  /** resina translúcida de las teclas de acento (solo en algunos juegos) */
  resin: THREE.Material
  colors: { alpha: string; mod: string; accent: string }
  legend: { alpha: string; mod: string; accent: string }
  resinAccent: boolean
  shineThrough: boolean
}

export function useKeycapMaterials(config: Config): KeycapMaterials {
  const set = getKeycapSet(config.keycaps)
  const high = useQuality() === "high"
  const [pbt, resin] = useDisposable(() => {
    const base = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.82, metalness: 0, envMapIntensity: 0.7 })
    // resina: casi transparente en la superficie, el color lo da el espesor
    // (atenuación), con dispersión y barniz para que tenga profundidad
    const accent = high
      ? new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(set.accent).lerp(new THREE.Color("#ffffff"), 0.55),
          roughness: 0.05,
          metalness: 0,
          transmission: 1,
          thickness: 0.9,
          ior: 1.52,
          dispersion: 0.35,
          attenuationColor: new THREE.Color(set.accent),
          attenuationDistance: 0.16,
          specularIntensity: 1,
          clearcoat: 1,
          clearcoatRoughness: 0.03,
          envMapIntensity: 1.4,
        })
      : new THREE.MeshPhysicalMaterial({
          color: set.accent,
          emissive: new THREE.Color(set.accent).multiplyScalar(0.18),
          roughness: 0.06,
          metalness: 0,
          clearcoat: 1,
          clearcoatRoughness: 0.04,
          specularIntensity: 1,
          envMapIntensity: 1.4,
          transparent: true,
          opacity: 0.8,
        })
    return [base, accent]
  }, [set.id, high])

  return {
    pbt,
    resin,
    colors: { alpha: set.alpha, mod: set.mod, accent: set.accent },
    legend: { alpha: set.alphaLegend, mod: set.modLegend, accent: set.accentLegend },
    resinAccent: set.resinAccent,
    shineThrough: set.shineThrough,
  }
}

export function useSwitchMaterials(config: Config) {
  const sw = getSwitch(config.switches)
  return useDisposable(
    () => [
      new THREE.MeshStandardMaterial({ color: sw.housing, roughness: 0.55, metalness: 0 }),
      new THREE.MeshStandardMaterial({ color: sw.stem, roughness: 0.4, metalness: 0 }),
    ],
    [sw.id]
  )
}

export function useKnobMaterial(config: Config) {
  const color = knobColor(config) ?? "#888888"
  return useDisposable(
    () =>
      new THREE.MeshPhysicalMaterial({
        color,
        metalness: 0.92,
        roughness: 0.28,
        clearcoat: 0.2,
      }),
    [color]
  )
}

export function useCableMaterial(config: Config) {
  const cable = getCable(config.cable)
  return useDisposable(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: cable.color,
        roughness: 0.72,
        metalness: 0,
        sheen: 0.8,
        sheenRoughness: 0.6,
        sheenColor: new THREE.Color(cable.color).lerp(new THREE.Color("#ffffff"), 0.35),
      }),
    [cable.id]
  )
}
