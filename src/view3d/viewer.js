import { calculateSolarPosition } from "../logic/rules.js";
import { DEG2RAD } from "../logic/sunMath.js";

const SCENE_SIZE = 20;
const SUN_DISTANCE = 15;

function getThree() {
  const THREE = window.THREE;
  if (!THREE) {
    throw new Error("Three.js n'est pas chargé. Ajoutez <script src=...three.min.js></script> avant main.js");
  }
  return THREE;
}

function sphericalToCartesian(azimuthDeg, altitudeDeg, distance) {
  const azimuthRad = (azimuthDeg - 90) * DEG2RAD;
  const altitudeRad = altitudeDeg * DEG2RAD;
  const x = distance * Math.cos(altitudeRad) * Math.cos(azimuthRad);
  const z = distance * Math.cos(altitudeRad) * Math.sin(azimuthRad);
  const y = distance * Math.sin(altitudeRad);
  return { x, y, z };
}

function createGround(THREE) {
  const geometry = new THREE.PlaneGeometry(SCENE_SIZE * 2, SCENE_SIZE * 2);
  const material = new THREE.MeshLambertMaterial({ color: 0xF5DEB3 });
  const ground = new THREE.Mesh(geometry, material);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  return ground;
}

function createBuilding(THREE) {
  const group = new THREE.Group();

  const bodyGeometry = new THREE.BoxGeometry(8, 6, 6);
  const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 3;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const roofGeometry = new THREE.ConeGeometry(5, 3, 4);
  const roofMaterial = new THREE.MeshLambertMaterial({ color: 0xB22222 });
  const roof = new THREE.Mesh(roofGeometry, roofMaterial);
  roof.position.y = 7.5;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  group.add(roof);

  const windowGeometry = new THREE.PlaneGeometry(1.6, 2.4);
  const windowMaterial = new THREE.MeshLambertMaterial({ color: 0x87CEEB });
  for (let i = 0; i < 3; i += 1) {
    const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
    windowMesh.position.set(-3 + i * 3, 3, 3.01);
    group.add(windowMesh);
  }

  const doorGeometry = new THREE.PlaneGeometry(1.6, 4);
  const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x4B0082 });
  const door = new THREE.Mesh(doorGeometry, doorMaterial);
  door.position.set(0, 2, 3.01);
  group.add(door);

  return group;
}

function createSun(THREE) {
  const sunGroup = new THREE.Group();

  const sunGeometry = new THREE.SphereGeometry(0.5, 16, 16);
  const sunMaterial = new THREE.MeshLambertMaterial({
    color: 0xFDB813,
    emissive: 0xFDB813,
    emissiveIntensity: 0.3,
  });
  sunGroup.add(new THREE.Mesh(sunGeometry, sunMaterial));

  const haloGeometry = new THREE.SphereGeometry(0.8, 16, 16);
  const haloMaterial = new THREE.MeshBasicMaterial({
    color: 0xFFD700,
    transparent: true,
    opacity: 0.2,
  });
  sunGroup.add(new THREE.Mesh(haloGeometry, haloMaterial));

  for (let i = 0; i < 8; i += 1) {
    const rayGeometry = new THREE.CylinderGeometry(0.02, 0.02, 2);
    const rayMaterial = new THREE.MeshBasicMaterial({ color: 0xFFD700 });
    const ray = new THREE.Mesh(rayGeometry, rayMaterial);
    const angle = (i / 8) * Math.PI * 2;
    ray.position.set(Math.cos(angle) * 1.2, 0, Math.sin(angle) * 1.2);
    ray.rotation.z = angle;
    sunGroup.add(ray);
  }

  return sunGroup;
}

function createCompassRose(THREE) {
  const canvas = document.createElement("canvas");
  const size = 512;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D context indisponible pour la rosace des vents");
  }

  ctx.clearRect(0, 0, size, size);
  const center = size / 2;
  const radius = size / 2 - 20;
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#2F4F4F";
  ctx.fillStyle = "#2F4F4F";

  const directions = [
    { label: "N", angle: 0 },
    { label: "NNE", angle: 22.5 },
    { label: "NE", angle: 45 },
    { label: "ENE", angle: 67.5 },
    { label: "E", angle: 90 },
    { label: "ESE", angle: 112.5 },
    { label: "SE", angle: 135 },
    { label: "SSE", angle: 157.5 },
    { label: "S", angle: 180 },
    { label: "SSO", angle: 202.5 },
    { label: "SO", angle: 225 },
    { label: "OSO", angle: 247.5 },
    { label: "O", angle: 270 },
    { label: "ONO", angle: 292.5 },
    { label: "NO", angle: 315 },
    { label: "NNO", angle: 337.5 },
  ];

  directions.forEach((dir, index) => {
    const angle = dir.angle * DEG2RAD;
    const isMain = index % 4 === 0;
    const isSecondary = index % 2 === 0;
    const rayLength = isMain ? radius : isSecondary ? radius * 0.7 : radius * 0.5;
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.lineWidth = isMain ? 3 : isSecondary ? 2 : 1;
    ctx.lineTo(center + Math.sin(angle) * rayLength, center - Math.cos(angle) * rayLength);
    ctx.stroke();
  });

  ctx.font = "bold 32px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  directions.forEach((dir) => {
    const angle = dir.angle * DEG2RAD;
    let labelDistance = radius + 35;
    if (dir.label === "N") {
      labelDistance = radius + 50;
      ctx.font = "bold 40px Arial";
      ctx.fillStyle = "#FF0000";
    }
    const x = center + Math.sin(angle) * labelDistance;
    const y = center - Math.cos(angle) * labelDistance;
    ctx.fillText(dir.label, x, y);
    if (dir.label === "N") {
      ctx.font = "bold 32px Arial";
      ctx.fillStyle = "#2F4F4F";
    }
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  const geometry = new THREE.PlaneGeometry(20, 20);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.01;
  mesh.userData.isCompassRose = true;
  return mesh;
}

function disposeObject(object) {
  if (!object) return;
  if (Array.isArray(object)) {
    object.forEach(disposeObject);
    return;
  }
  if (object.geometry) {
    object.geometry.dispose();
  }
  if (object.material) {
    if (Array.isArray(object.material)) {
      object.material.forEach((mat) => mat.dispose && mat.dispose());
    } else if (object.material.dispose) {
      object.material.dispose();
    }
  }
}

function buildLegend(container) {
  const legend = document.createElement("div");
  legend.className = "seasonal-legend";
  legend.innerHTML = `
    <div class="legend-item"><div class="legend-color" style="background:#ff4444"></div><span>Solstice été (21 juin)</span></div>
    <div class="legend-item"><div class="legend-color" style="background:#4444ff"></div><span>Solstice hiver (21 déc)</span></div>
    <div class="legend-item"><div class="legend-color" style="background:#44ff44"></div><span>Équinoxes (21 mar/sep)</span></div>
  `;
  container.appendChild(legend);
  return legend;
}

export function createViewer({ container, initialLatitude, initialOrientationDeg = 0 }) {
  const THREE = getThree();
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB);

  const width = Math.max(container.clientWidth, 1);
  const height = Math.max(container.clientHeight, 1);
  let lastMeasuredWidth = width;
  let lastMeasuredHeight = height;

  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.set(15, 15, 15);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.setSize(width, height);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  let resizeObserver = null;
  let resizeRafId = 0;

  function attemptResize() {
    if (container.clientWidth > 0 && container.clientHeight > 0) {
      resize();
      return true;
    }
    return false;
  }

  if (typeof window !== "undefined" && "ResizeObserver" in window) {
    resizeObserver = new ResizeObserver(() => {
      attemptResize();
    });
    resizeObserver.observe(container);
  } else {
    const monitorResize = () => {
      attemptResize();
      resizeRafId = requestAnimationFrame(monitorResize);
    };
    resizeRafId = requestAnimationFrame(monitorResize);
  }

  attemptResize();

  const hintPan = document.createElement("div");
  hintPan.className = "hint-pan";
  hintPan.textContent = "🖱️ Clic gauche = orbite • Clic droit = pan";
  container.appendChild(hintPan);

  const legend = buildLegend(container);

  const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xffffff, 1);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 50;
  sunLight.shadow.camera.left = -20;
  sunLight.shadow.camera.right = 20;
  sunLight.shadow.camera.top = 20;
  sunLight.shadow.camera.bottom = -20;
  scene.add(sunLight);
  scene.add(sunLight.target);

  const ground = createGround(THREE);
  scene.add(ground);

  const compassRose = createCompassRose(THREE);
  scene.add(compassRose);

  const building = createBuilding(THREE);
  building.rotation.y = initialOrientationDeg * DEG2RAD;
  scene.add(building);

  const sun = createSun(THREE);
  scene.add(sun);

  let seasonalPaths = [];

  function clearSeasonalPaths() {
    seasonalPaths.forEach((path) => {
      scene.remove(path);
      disposeObject(path);
    });
    seasonalPaths = [];
  }

  function updateSeasonalPaths(latDeg) {
    clearSeasonalPaths();
    if (!Number.isFinite(latDeg)) return;

    const seasons = [
      { day: 172, color: 0xff4444 },
      { day: 355, color: 0x4444ff },
      { day: 80, color: 0x44ff44 },
      { day: 266, color: 0x44ff44 },
    ];

    seasons.forEach((season) => {
      const points = [];
      for (let hour = 6; hour <= 18; hour += 0.5) {
        const pos = calculateSolarPosition({
          dayOfYear: season.day,
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
        const material = new THREE.MeshBasicMaterial({ color: season.color });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        seasonalPaths.push(mesh);
      }
    });
  }

  function updateSunPosition(solarPosition) {
    if (!solarPosition) return;
    const altitude = solarPosition.altitudeDeg ?? solarPosition.elevation ?? 0;
    const azimuth = solarPosition.azimuthDeg ?? solarPosition.azimuth ?? 0;

    if (altitude > 0) {
      const coords = sphericalToCartesian(azimuth, altitude, SUN_DISTANCE);
      sun.visible = true;
      sun.position.set(coords.x, coords.y, coords.z);
      sunLight.position.copy(sun.position);
      sunLight.target.position.set(0, 0, 0);
      sunLight.intensity = Math.max(0.3, altitude / 90);
    } else {
      sun.visible = false;
      sunLight.intensity = 0;
    }
  }

  function updateBuildingOrientation(deg) {
    if (!Number.isFinite(deg)) return;
    building.rotation.y = deg * DEG2RAD;
  }

  function resize() {
    const w = Math.max(container.clientWidth, 1);
    const h = Math.max(container.clientHeight, 1);
    if (w === lastMeasuredWidth && h === lastMeasuredHeight) {
      return;
    }
    lastMeasuredWidth = w;
    lastMeasuredHeight = h;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  let rafId = 0;
  function renderLoop() {
    rafId = requestAnimationFrame(renderLoop);
    renderer.render(scene, camera);
  }
  renderLoop();

  function dispose() {
    cancelAnimationFrame(rafId);
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
    if (resizeRafId) {
      cancelAnimationFrame(resizeRafId);
      resizeRafId = 0;
    }
    clearSeasonalPaths();
    disposeObject(ground);
    disposeObject(compassRose);
    disposeObject(building);
    disposeObject(sun);
    renderer.dispose();
    legend.remove();
    hintPan.remove();
  }

  updateSeasonalPaths(initialLatitude);

  return {
    scene,
    camera,
    renderer,
    updateSunPosition,
    updateBuildingOrientation,
    updateSeasonalPaths,
    resize,
    dispose,
  };
}
