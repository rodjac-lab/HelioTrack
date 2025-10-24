import { sphericalToCartesian } from "./threeUtils.js";

export const SCENE_SIZE = 20;
export const SUN_DISTANCE = 15;

export function createGround(THREE) {
  const group = new THREE.Group();

  const baseMaterial = new THREE.MeshStandardMaterial({
    color: 0xe8edf6,
    roughness: 0.92,
    metalness: 0.05,
  });
  const base = new THREE.Mesh(new THREE.CircleGeometry(SCENE_SIZE * 1.1, 72), baseMaterial);
  base.rotation.x = -Math.PI / 2;
  base.receiveShadow = true;
  group.add(base);

  const baseShadowMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.12,
  });
  baseShadowMaterial.depthWrite = false;
  const baseShadow = new THREE.Mesh(new THREE.CircleGeometry(5.6, 48), baseShadowMaterial);
  baseShadow.rotation.x = -Math.PI / 2;
  baseShadow.position.y = 0.001;
  baseShadow.renderOrder = 0;
  group.add(baseShadow);

  const plazaMaterial = new THREE.MeshStandardMaterial({
    color: 0xfafbff,
    roughness: 0.35,
    metalness: 0.18,
  });
  const plaza = new THREE.Mesh(new THREE.CircleGeometry(5.8, 64), plazaMaterial);
  plaza.rotation.x = -Math.PI / 2;
  plaza.position.y = 0.02;
  plaza.receiveShadow = true;
  group.add(plaza);

  const terraceMaterial = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.5,
    metalness: 0.1,
  });
  const terrace = new THREE.Mesh(new THREE.RingGeometry(5.8, 7.6, 96), terraceMaterial);
  terrace.rotation.x = -Math.PI / 2;
  terrace.position.y = 0.018;
  terrace.receiveShadow = true;
  group.add(terrace);

  const lawnMaterial = new THREE.MeshStandardMaterial({
    color: 0xd9f99d,
    roughness: 0.85,
    metalness: 0.05,
  });
  const lawn = new THREE.Mesh(new THREE.RingGeometry(7.6, 10.4, 96), lawnMaterial);
  lawn.rotation.x = -Math.PI / 2;
  lawn.position.y = 0.015;
  lawn.receiveShadow = true;
  group.add(lawn);

  const accentMaterial = new THREE.MeshBasicMaterial({
    color: 0x60a5fa,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
  });
  accentMaterial.depthWrite = false;
  for (let i = 0; i < 4; i += 1) {
    const arc = new THREE.Mesh(
      new THREE.RingGeometry(7.2, 7.8, 64, 1, Math.PI / 8 + i * (Math.PI / 2), Math.PI / 6),
      accentMaterial,
    );
    arc.rotation.x = -Math.PI / 2;
    arc.position.y = 0.03;
    arc.renderOrder = 2;
    group.add(arc);
  }

  const treeTrunkMaterial = new THREE.MeshStandardMaterial({
    color: 0x8d6e63,
    roughness: 0.8,
  });
  const treeFoliageMaterial = new THREE.MeshStandardMaterial({
    color: 0x059669,
    roughness: 0.5,
    metalness: 0.08,
  });
  const treeRadius = 8.6;
  for (let i = 0; i < 6; i += 1) {
    const angle = i * (Math.PI / 3);
    const x = Math.cos(angle) * treeRadius;
    const z = Math.sin(angle) * treeRadius;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 1.5, 16), treeTrunkMaterial);
    trunk.position.set(x, 0.75, z);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    group.add(trunk);

    const foliage = new THREE.Mesh(new THREE.SphereGeometry(0.95, 24, 24), treeFoliageMaterial);
    foliage.position.set(x, 1.72, z);
    foliage.castShadow = true;
    group.add(foliage);
  }

  const pathLightMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x60a5fa,
    emissiveIntensity: 0.45,
    metalness: 0.65,
    roughness: 0.25,
  });
  const pathLightGeometry = new THREE.CylinderGeometry(0.12, 0.18, 0.9, 16);
  const lightRadius = 5.2;
  for (let i = 0; i < 4; i += 1) {
    const angle = Math.PI / 4 + i * (Math.PI / 2);
    const x = Math.cos(angle) * lightRadius;
    const z = Math.sin(angle) * lightRadius;
    const light = new THREE.Mesh(pathLightGeometry, pathLightMaterial);
    light.position.set(x, 0.45, z);
    light.castShadow = true;
    group.add(light);
  }

  return group;
}

export function createBuilding(THREE) {
  const group = new THREE.Group();

  const podiumMaterial = new THREE.MeshStandardMaterial({
    color: 0xe5e7eb,
    roughness: 0.6,
    metalness: 0.1,
  });
  const podium = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.6, 8.2), podiumMaterial);
  podium.position.y = 0.3;
  podium.receiveShadow = true;
  group.add(podium);

  const primaryFacadeMaterial = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.35,
    metalness: 0.18,
  });
  const volumeLower = new THREE.Mesh(new THREE.BoxGeometry(7.2, 3.8, 5.8), primaryFacadeMaterial);
  volumeLower.position.y = 2.1;
  volumeLower.castShadow = true;
  volumeLower.receiveShadow = true;
  group.add(volumeLower);

  const ribbonMaterial = new THREE.MeshStandardMaterial({
    color: 0x2563eb,
    roughness: 0.25,
    metalness: 0.55,
  });
  const ribbon = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.3, 6.2), ribbonMaterial);
  ribbon.position.y = 3.5;
  ribbon.castShadow = true;
  group.add(ribbon);

  const upperVolumeMaterial = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.28,
    metalness: 0.22,
  });
  const volumeUpper = new THREE.Mesh(new THREE.BoxGeometry(5.4, 2.4, 4.2), upperVolumeMaterial);
  volumeUpper.position.set(-0.6, 4.7, -0.4);
  volumeUpper.castShadow = true;
  volumeUpper.receiveShadow = true;
  group.add(volumeUpper);

  const canopy = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.25, 2.6), ribbonMaterial);
  canopy.position.set(0.2, 3.7, 3.1);
  canopy.castShadow = true;
  group.add(canopy);

  const stairMaterial = new THREE.MeshStandardMaterial({
    color: 0xd1d5db,
    roughness: 0.65,
  });
  const stair = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.4, 1.6), stairMaterial);
  stair.position.set(0.2, 0.2, 3.6);
  stair.receiveShadow = true;
  group.add(stair);

  const glassMaterial = new THREE.MeshStandardMaterial({
    color: 0xa5d8ff,
    roughness: 0.08,
    metalness: 0.2,
    transparent: true,
    opacity: 0.68,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.18,
    side: THREE.DoubleSide,
  });
  const windowGeometry = new THREE.PlaneGeometry(1.7, 1.9);
  const windowOffsets = [-2.6, 0, 2.6];
  windowOffsets.forEach((offsetX) => {
    const windowMesh = new THREE.Mesh(windowGeometry, glassMaterial);
    windowMesh.position.set(offsetX, 2.2, 2.95);
    group.add(windowMesh);
  });

  const upperWindowGeometry = new THREE.PlaneGeometry(1.4, 1.6);
  const upperOffsets = [-1.6, 0.2, 2];
  upperOffsets.forEach((offsetX) => {
    const windowMesh = new THREE.Mesh(upperWindowGeometry, glassMaterial);
    windowMesh.position.set(offsetX - 0.4, 4.8, -2.1);
    windowMesh.rotation.y = Math.PI;
    group.add(windowMesh);
  });

  const finMaterial = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.4,
    metalness: 0.18,
  });
  const finGeometry = new THREE.BoxGeometry(0.2, 3.6, 5.8);
  [-3.8, 4.2].forEach((offsetX) => {
    const fin = new THREE.Mesh(finGeometry, finMaterial);
    fin.position.set(offsetX, 2.1, 0);
    fin.castShadow = true;
    group.add(fin);
  });

  const doorMaterial = new THREE.MeshStandardMaterial({
    color: 0x1f2937,
    roughness: 0.4,
    metalness: 0.6,
  });
  const door = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 2.6), doorMaterial);
  door.position.set(0.2, 1.7, 3.02);
  group.add(door);

  const handrailMaterial = new THREE.MeshStandardMaterial({
    color: 0xcbd5f5,
    roughness: 0.2,
    metalness: 0.7,
  });
  const handrailGeometry = new THREE.CylinderGeometry(0.06, 0.06, 3.6, 12);
  const handrail = new THREE.Mesh(handrailGeometry, handrailMaterial);
  handrail.position.set(0.2, 2.65, 3.3);
  handrail.rotation.z = Math.PI / 2;
  handrail.castShadow = true;
  group.add(handrail);

  return group;
}

export function createSun(THREE) {
  const sunGroup = new THREE.Group();

  const coreMaterial = new THREE.MeshStandardMaterial({
    color: 0xfff6b7,
    emissive: 0xffc857,
    emissiveIntensity: 0.6,
    roughness: 0.1,
  });
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.55, 32, 32), coreMaterial);
  core.castShadow = false;
  sunGroup.add(core);

  const haloMaterial = new THREE.MeshBasicMaterial({
    color: 0xfff1a6,
    transparent: true,
    opacity: 0.32,
  });
  const halo = new THREE.Mesh(new THREE.SphereGeometry(0.85, 32, 32), haloMaterial);
  sunGroup.add(halo);

  const glowMaterial = new THREE.SpriteMaterial({
    color: 0xffdd75,
    transparent: true,
    opacity: 0.35,
  });
  const glow = new THREE.Sprite(glowMaterial);
  glow.scale.set(2.6, 2.6, 1);
  sunGroup.add(glow);

  return sunGroup;
}

export function createSunLight(THREE) {
  const sunLight = new THREE.DirectionalLight(0xfff2cc, 1.1);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 50;
  sunLight.shadow.camera.left = -20;
  sunLight.shadow.camera.right = 20;
  sunLight.shadow.camera.top = 20;
  sunLight.shadow.camera.bottom = -20;
  sunLight.shadow.bias = -0.0015;
  sunLight.shadow.radius = 2;
  return sunLight;
}

export function createCompassRose(THREE) {
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
  ctx.strokeStyle = "#94A3B8";
  ctx.fillStyle = "#0F172A";

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
    const angle = (dir.angle * Math.PI) / 180;
    const isMain = index % 4 === 0;
    const isSecondary = index % 2 === 0;
    const rayLength = isMain ? radius : isSecondary ? radius * 0.7 : radius * 0.5;
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.lineWidth = isMain ? 3 : isSecondary ? 2 : 1;
    ctx.lineTo(center + Math.sin(angle) * rayLength, center - Math.cos(angle) * rayLength);
    ctx.stroke();
  });

  ctx.font = "600 32px 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  directions.forEach((dir) => {
    const angle = (dir.angle * Math.PI) / 180;
    let labelDistance = radius + 35;
    if (dir.label === "N") {
      labelDistance = radius + 50;
      ctx.font = "700 40px 'Segoe UI', sans-serif";
      ctx.fillStyle = "#2563EB";
    }
    const x = center + Math.sin(angle) * labelDistance;
    const y = center - Math.cos(angle) * labelDistance;
    ctx.fillText(dir.label, x, y);
    if (dir.label === "N") {
      ctx.font = "600 32px 'Segoe UI', sans-serif";
      ctx.fillStyle = "#0F172A";
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

export function createSunController({ sun, sunLight }) {
  return {
    updatePosition({ altitudeDeg = 0, azimuthDeg = 0 }) {
      if (altitudeDeg > 0) {
        const coords = sphericalToCartesian(azimuthDeg, altitudeDeg, SUN_DISTANCE);
        sun.visible = true;
        sun.position.set(coords.x, coords.y, coords.z);
        sunLight.position.copy(sun.position);
        sunLight.target.position.set(0, 0, 0);
        sunLight.intensity = Math.max(0.3, altitudeDeg / 90);
      } else {
        sun.visible = false;
        sunLight.intensity = 0;
      }
    },
  };
}
