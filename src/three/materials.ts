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

/** Aluminio anodizado (satinado) o policarbonato translúcido. */
export function useCaseMaterial(config: Config) {
  const option = getCase(config.case)
  return useDisposable(() => {
    if (option.material === "policarbonato") {
      return new THREE.MeshPhysicalMaterial({
        color: option.color,
        metalness: 0,
        roughness: 0.18,
        transmission: 0.9,
        thickness: 0.35,
        ior: 1.58,
        attenuationColor: new THREE.Color("#cfdde6"),
        attenuationDistance: 1.4,
        clearcoat: 0.6,
        clearcoatRoughness: 0.2,
        transparent: true,
      })
    }
    return new THREE.MeshPhysicalMaterial({
      color: option.color,
      metalness: 0.78,
      roughness: 0.36,
      clearcoat: 0.25,
      clearcoatRoughness: 0.45,
      envMapIntensity: 1.1,
    })
  }, [option.id])
}

export function usePlateMaterial(config: Config) {
  const plate = getPlate(config.plate)
  return useDisposable(() => {
    if (plate.translucent) {
      return new THREE.MeshPhysicalMaterial({
        color: plate.color,
        roughness: plate.roughness,
        metalness: 0,
        transmission: 0.75,
        thickness: 0.05,
        ior: 1.58,
        transparent: true,
      })
    }
    return new THREE.MeshStandardMaterial({
      color: plate.color,
      metalness: plate.metalness,
      roughness: plate.roughness,
    })
  }, [plate.id])
}

export interface KeycapMaterials {
  alpha: THREE.Material
  mod: THREE.Material
  accent: THREE.Material
  legend: { alpha: string; mod: string; accent: string }
}

/** PBT mate para alfas y modificadores; resina translúcida en los acentos. */
export function useKeycapMaterials(config: Config): KeycapMaterials {
  const set = getKeycapSet(config.keycaps)
  const materials = useDisposable(() => {
    const pbt = (color: string) =>
      new THREE.MeshStandardMaterial({ color, roughness: 0.82, metalness: 0, envMapIntensity: 0.7 })
    const accent = set.resinAccent
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
      : pbt(set.accent)
    return [pbt(set.alpha), pbt(set.mod), accent]
  }, [set.id])

  return {
    alpha: materials[0],
    mod: materials[1],
    accent: materials[2],
    legend: { alpha: set.alphaLegend, mod: set.modLegend, accent: set.accentLegend },
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
