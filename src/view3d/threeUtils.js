import { DEG2RAD } from "../logic/sunMath.js";

export function ensureThree() {
  if (typeof window === "undefined" || !window.THREE) {
    throw new Error(
      "Three.js n'est pas chargé. Ajoutez <script src=...three.min.js></script> avant main.js",
    );
  }
  return window.THREE;
}

export function sphericalToCartesian(azimuthDeg, altitudeDeg, distance) {
  const azimuthRad = (azimuthDeg - 90) * DEG2RAD;
  const altitudeRad = altitudeDeg * DEG2RAD;
  const x = distance * Math.cos(altitudeRad) * Math.cos(azimuthRad);
  const z = distance * Math.cos(altitudeRad) * Math.sin(azimuthRad);
  const y = distance * Math.sin(altitudeRad);
  return { x, y, z };
}

export function disposeObject(object) {
  if (!object) return;
  if (Array.isArray(object)) {
    object.forEach(disposeObject);
    return;
  }
  const geometries = new Set();
  const materials = new Set();

  const recordDisposable = (item) => {
    if (!item) return;
    if (item.geometry) {
      geometries.add(item.geometry);
    }
    const { material } = item;
    if (material) {
      if (Array.isArray(material)) {
        material.forEach((mat) => mat && materials.add(mat));
      } else {
        materials.add(material);
      }
    }
  };

  if (typeof object.traverse === "function") {
    object.traverse((child) => {
      recordDisposable(child);
    });
  } else {
    recordDisposable(object);
  }

  geometries.forEach((geometry) => geometry?.dispose?.());
  materials.forEach((material) => material?.dispose?.());
}
