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
  if (object.geometry) {
    object.geometry.dispose?.();
  }
  if (object.material) {
    if (Array.isArray(object.material)) {
      object.material.forEach((mat) => mat?.dispose?.());
    } else {
      object.material.dispose?.();
    }
  }
}
