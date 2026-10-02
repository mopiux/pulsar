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
    return new THREE.MeshPhysicalMaterial({
      color: option.color,
      metalness: 0.78,
      roughness: 0.36,
      clearcoat: 0.25,
      clearcoatRoughness: 0.45,
      envMapIntensity: 1.1,
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
            transmission: 0.75,
            thickness: 0.05,
            ior: 1.58,
            transparent: true,
          })
        : new THREE.MeshStandardMaterial({ color: plate.color, roughness: plate.roughness, transparent: true, opacity: 0.8 })
    }
    return new THREE.MeshStandardMaterial({
      color: plate.color,
      metalness: plate.metalness,
      roughness: plate.roughness,
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
}

export function useKeycapMaterials(config: Config): KeycapMaterials {
  const set = getKeycapSet(config.keycaps)
  const high = useQuality() === "high"
  const [pbt, resin] = useDisposable(() => {
    const base = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.82, metalness: 0, envMapIntensity: 0.7 })
    const accent = high
      ? new THREE.MeshPhysicalMaterial({
          color: set.accent,
          roughness: 0.12,
          metalness: 0,
          transmission: 0.82,
          thickness: 0.18,
          ior: 1.5,
          attenuationColor: new THREE.Color(set.accent),
          attenuationDistance: 0.25,
          clearcoat: 1,
          clearcoatRoughness: 0.08,
          transparent: true,
        })
      : new THREE.MeshPhysicalMaterial({
          color: set.accent,
          roughness: 0.15,
          metalness: 0,
          clearcoat: 1,
          clearcoatRoughness: 0.1,
          transparent: true,
          opacity: 0.86,
        })
    return [base, accent]
  }, [set.id, high])

  return {
    pbt,
    resin,
    colors: { alpha: set.alpha, mod: set.mod, accent: set.accent },
    legend: { alpha: set.alphaLegend, mod: set.modLegend, accent: set.accentLegend },
    resinAccent: set.resinAccent,
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
