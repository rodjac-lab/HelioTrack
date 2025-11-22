import { THREE, disposeObject } from "./threeUtils.js";
import {
  createGround,
  createBuilding,
  createSolarPanels,
  createSun,
  createSunLight,
  createCompassRose,
  createSunController,
} from "./components.js";
import { createSeasonalPathManager } from "./seasonalPaths.js";
import { createViewerOverlays } from "./viewerOverlays.js";
import {
  createRenderer,
  createResizeController,
  createRenderLoop,
} from "./viewerRuntime.js";

export function createViewer({
  container,
  initialLatitude,
  initialOrientationDeg = 0,
}) {
  try {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);

    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(15, 15, 15);
    camera.lookAt(0, 0, 0);

    const renderer = createRenderer({ THREE, container, camera });
  const resizeController = createResizeController({
    container,
    camera,
    renderer,
  });
  const renderLoop = createRenderLoop({ renderer, scene, camera });

  const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
  scene.add(ambientLight);

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
      const altitudeDeg =
        solarPosition.altitudeDeg ?? solarPosition.elevation ?? 0;
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
    toggleSolarPanels() {
      // Check if panels already exist
      const existing = scene.children.find(obj => obj.userData?.isSolarPanels);
      if (existing) {
        scene.remove(existing);
        disposeObject(existing);
        return false; // panels removed
      }

      const panels = createSolarPanels(THREE);
      panels.userData.isSolarPanels = true;
      scene.add(panels);
      return true; // panels installed
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
  } catch (error) {
    console.error("Failed to create 3D viewer:", error);
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 20px; text-align: center; color: var(--ui-text);">
        <h2 style="margin-bottom: 16px;">Erreur d'initialisation 3D</h2>
        <p style="margin-bottom: 8px;">Impossible d'initialiser le rendu 3D.</p>
        <p style="font-size: 14px; color: var(--ui-text-muted);">Votre navigateur ne supporte peut-être pas WebGL.</p>
      </div>
    `;
    return null;
  }
}
