import { ensureThree, disposeObject } from "./threeUtils.js";
import {
  createGround,
  createBuilding,
  createSun,
  createSunLight,
  createCompassRose,
  createSunController,
} from "./components.js";
import { createSeasonalPathManager } from "./seasonalPaths.js";
import { createViewerOverlays } from "./viewerOverlays.js";
import { createRenderer, createResizeController, createRenderLoop } from "./viewerRuntime.js";

export function createViewer({ container, initialLatitude, initialOrientationDeg = 0 }) {
  const THREE = ensureThree();
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xeef3fb);
  scene.fog = new THREE.Fog(0xeef3fb, 45, 120);

  const width = Math.max(container.clientWidth, 1);
  const height = Math.max(container.clientHeight, 1);
  const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
  camera.position.set(12, 11, 16);
  camera.lookAt(0, 0, 0);

  const renderer = createRenderer({ THREE, container, camera });
  const resizeController = createResizeController({ container, camera, renderer });
  const renderLoop = createRenderLoop({ renderer, scene, camera });

  const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.35);
  scene.add(ambientLight);

  const hemisphereLight = new THREE.HemisphereLight(0xeaf2ff, 0xe8ddc5, 0.8);
  scene.add(hemisphereLight);

  const fillLight = new THREE.DirectionalLight(0xffffff, 0.25);
  fillLight.position.set(-14, 18, -8);
  scene.add(fillLight);

  const sunLight = createSunLight(THREE);
  scene.add(sunLight);
  scene.add(sunLight.target);

  const ground = createGround(THREE);
  scene.add(ground);

  const compassRose = createCompassRose(THREE);
  scene.add(compassRose);

  const building = createBuilding(THREE);
  building.rotation.y = THREE.MathUtils.degToRad(initialOrientationDeg);
  scene.add(building);

  const sun = createSun(THREE);
  scene.add(sun);
  const sunController = createSunController({ sun, sunLight });

  const overlays = createViewerOverlays({ container });
  const seasonalPaths = createSeasonalPathManager({ THREE, scene });
  seasonalPaths.update(initialLatitude);

  return {
    scene,
    camera,
    renderer,
    updateSunPosition(solarPosition) {
      if (!solarPosition) return;
      const altitudeDeg = solarPosition.altitudeDeg ?? solarPosition.elevation ?? 0;
      const azimuthDeg = solarPosition.azimuthDeg ?? solarPosition.azimuth ?? 0;
      sunController.updatePosition({ altitudeDeg, azimuthDeg });
    },
    updateBuildingOrientation(deg) {
      if (!Number.isFinite(deg)) return;
      building.rotation.y = THREE.MathUtils.degToRad(deg);
    },
    updateSeasonalPaths(latDeg) {
      seasonalPaths.update(latDeg);
    },
    resize() {
      resizeController.resize();
    },
    dispose() {
      renderLoop.stop();
      resizeController.dispose();
      seasonalPaths.dispose();
      overlays.dispose();
      disposeObject([ground, compassRose, building, sun]);
      renderer.dispose();
    },
  };
}
