import { calculateSolarPosition } from "../logic/rules.js";
import { SUN_DISTANCE } from "./components.js";
import { sphericalToCartesian, disposeObject } from "./threeUtils.js";

const SEASONS = [
  { day: 172, color: 0xff4444, label: "Solstice été" },
  { day: 355, color: 0x4444ff, label: "Solstice hiver" },
  { day: 80, color: 0x44ff44, label: "Équinoxe printemps" },
  { day: 266, color: 0x44ff44, label: "Équinoxe automne" },
];

export function createSeasonalPathManager({ THREE, scene }) {
  let meshes = [];

  function clear() {
    meshes.forEach((mesh) => {
      scene.remove(mesh);
      disposeObject(mesh);
    });
    meshes = [];
  }

  function buildPath({ day, color }, latDeg) {
    const points = [];
    for (let hour = 6; hour <= 18; hour += 0.5) {
      const pos = calculateSolarPosition({
        dayOfYear: day,
        localTimeHours: hour,
        latDeg,
        lonDeg: 0,
        buildingOrientationDeg: 0,
      });
      const altitude = pos.altitudeDeg ?? pos.elevation ?? 0;
      if (altitude > 0) {
        const azimuth = pos.azimuthDeg ?? pos.azimuth ?? 0;
        const coords = sphericalToCartesian(azimuth, altitude, SUN_DISTANCE);
        points.push(new THREE.Vector3(coords.x, coords.y, coords.z));
      }
    }

    if (points.length > 1) {
      const curve = new THREE.CatmullRomCurve3(points);
      const geometry = new THREE.TubeGeometry(curve, 100, 0.05, 8, false);
      const material = new THREE.MeshBasicMaterial({ color });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      meshes.push(mesh);
    }
  }

  return {
    update(latDeg) {
      clear();
      if (!Number.isFinite(latDeg)) return;
      SEASONS.forEach((season) => buildPath(season, latDeg));
    },
    dispose: clear,
  };
}
