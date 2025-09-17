function getThree() {
  const THREE = window.THREE;
  if (!THREE) {
    throw new Error("Three.js est requis pour les contrôles orbitaux");
  }
  return THREE;
}

export function attachOrbitControls({ camera, domElement, onChange }) {
  const THREE = getThree();
  const spherical = new THREE.Spherical();
  spherical.setFromVector3(camera.position);

  const state = {
    dragging: false,
    previous: { x: 0, y: 0 },
  };

  function syncCamera() {
    camera.position.setFromSpherical(spherical);
    camera.lookAt(0, 0, 0);
    if (onChange) onChange();
  }

  function handlePointerDown(event) {
    if (event.button !== 0 && event.button !== 2) return;
    state.dragging = true;
    state.previous.x = event.clientX;
    state.previous.y = event.clientY;
    event.preventDefault();
  }

  function handlePointerMove(event) {
    if (!state.dragging) return;
    const deltaX = event.clientX - state.previous.x;
    const deltaY = event.clientY - state.previous.y;
    state.previous.x = event.clientX;
    state.previous.y = event.clientY;

    spherical.theta -= deltaX * 0.01;
    spherical.phi += deltaY * 0.01;
    const epsilon = 0.1;
    spherical.phi = Math.max(epsilon, Math.min(Math.PI - epsilon, spherical.phi));
    syncCamera();
  }

  function handlePointerUp() {
    state.dragging = false;
  }

  function handleWheel(event) {
    event.preventDefault();
    spherical.radius += event.deltaY * 0.01;
    spherical.radius = Math.max(5, Math.min(50, spherical.radius));
    syncCamera();
  }

  function preventContextMenu(event) {
    event.preventDefault();
  }

  domElement.addEventListener("mousedown", handlePointerDown);
  domElement.addEventListener("mousemove", handlePointerMove);
  domElement.addEventListener("mouseup", handlePointerUp);
  domElement.addEventListener("mouseleave", handlePointerUp);
  domElement.addEventListener("wheel", handleWheel, { passive: false });
  domElement.addEventListener("contextmenu", preventContextMenu);

  return {
    dispose() {
      domElement.removeEventListener("mousedown", handlePointerDown);
      domElement.removeEventListener("mousemove", handlePointerMove);
      domElement.removeEventListener("mouseup", handlePointerUp);
      domElement.removeEventListener("mouseleave", handlePointerUp);
      domElement.removeEventListener("wheel", handleWheel);
      domElement.removeEventListener("contextmenu", preventContextMenu);
    },
    sync() {
      spherical.setFromVector3(camera.position);
    },
  };
}

export function setViewPreset({ camera, preset }) {
  const distance = 25;
  switch (preset) {
    case "top":
      camera.position.set(0, distance, 0);
      break;
    case "side":
      camera.position.set(distance, 8, 0);
      break;
    case "iso":
      camera.position.set(distance * 0.6, distance * 0.6, distance * 0.6);
      break;
    case "free":
    default:
      camera.position.set(18, 18, 18);
      break;
  }
  camera.lookAt(0, 0, 0);
}

