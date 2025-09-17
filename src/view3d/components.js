import { sphericalToCartesian } from "./threeUtils.js";

export const SCENE_SIZE = 20;
export const SUN_DISTANCE = 15;

export function createGround(THREE) {
  const geometry = new THREE.PlaneGeometry(SCENE_SIZE * 2, SCENE_SIZE * 2);
  const material = new THREE.MeshLambertMaterial({ color: 0xf5deb3 });
  const ground = new THREE.Mesh(geometry, material);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  return ground;
}

export function createBuilding(THREE) {
  const group = new THREE.Group();

  const bodyGeometry = new THREE.BoxGeometry(8, 6, 6);
  const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 3;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const roofGeometry = new THREE.ConeGeometry(5, 3, 4);
  const roofMaterial = new THREE.MeshLambertMaterial({ color: 0xb22222 });
  const roof = new THREE.Mesh(roofGeometry, roofMaterial);
  roof.position.y = 7.5;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  group.add(roof);

  const windowGeometry = new THREE.PlaneGeometry(1.6, 2.4);
  const windowMaterial = new THREE.MeshLambertMaterial({ color: 0x87ceeb });
  for (let i = 0; i < 3; i += 1) {
    const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
    windowMesh.position.set(-3 + i * 3, 3, 3.01);
    group.add(windowMesh);
  }

  const doorGeometry = new THREE.PlaneGeometry(1.6, 4);
  const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x4b0082 });
  const door = new THREE.Mesh(doorGeometry, doorMaterial);
  door.position.set(0, 2, 3.01);
  group.add(door);

  return group;
}

export function createSun(THREE) {
  const sunGroup = new THREE.Group();

  const sunGeometry = new THREE.SphereGeometry(0.5, 16, 16);
  const sunMaterial = new THREE.MeshLambertMaterial({
    color: 0xfdb813,
    emissive: 0xfdb813,
    emissiveIntensity: 0.3,
  });
  sunGroup.add(new THREE.Mesh(sunGeometry, sunMaterial));

  const haloGeometry = new THREE.SphereGeometry(0.8, 16, 16);
  const haloMaterial = new THREE.MeshBasicMaterial({
    color: 0xffd700,
    transparent: true,
    opacity: 0.2,
  });
  sunGroup.add(new THREE.Mesh(haloGeometry, haloMaterial));

  for (let i = 0; i < 8; i += 1) {
    const rayGeometry = new THREE.CylinderGeometry(0.02, 0.02, 2);
    const rayMaterial = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    const ray = new THREE.Mesh(rayGeometry, rayMaterial);
    const angle = (i / 8) * Math.PI * 2;
    ray.position.set(Math.cos(angle) * 1.2, 0, Math.sin(angle) * 1.2);
    ray.rotation.z = angle;
    sunGroup.add(ray);
  }

  return sunGroup;
}

export function createSunLight(THREE) {
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

  ctx.font = "bold 32px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  directions.forEach((dir) => {
    const angle = (dir.angle * Math.PI) / 180;
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
