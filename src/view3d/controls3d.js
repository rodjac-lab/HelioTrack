import { THREE } from "./threeUtils.js";

function clampPhi(phi) {
  const epsilon = 0.1;
  return Math.max(epsilon, Math.min(Math.PI - epsilon, phi));
}

function normalizeRadius(radius) {
  return Math.max(5, Math.min(50, radius));
}

export function attachOrbitControls({ camera, domElement, onChange }) {
  const spherical = new THREE.Spherical();
  spherical.setFromVector3(camera.position);

  const state = {
    dragging: false,
    pointerId: null,
    previous: { x: 0, y: 0 },
  };

  function syncCamera() {
    camera.position.setFromSpherical(spherical);
    camera.lookAt(0, 0, 0);
    onChange?.();
  }

  function startDrag({ clientX, clientY, pointerId = null }) {
    state.dragging = true;
    state.pointerId = pointerId;
    state.previous.x = clientX;
    state.previous.y = clientY;
  }

  function updateDrag({ clientX, clientY }) {
    if (!state.dragging) return;
    const deltaX = clientX - state.previous.x;
    const deltaY = clientY - state.previous.y;
    state.previous.x = clientX;
    state.previous.y = clientY;

    spherical.theta -= deltaX * 0.01;
    spherical.phi = clampPhi(spherical.phi + deltaY * 0.01);
    syncCamera();
  }

  function endDrag() {
    state.dragging = false;
    state.pointerId = null;
  }

  function handleWheel(event) {
    event.preventDefault();
    spherical.radius = normalizeRadius(spherical.radius + event.deltaY * 0.01);
    syncCamera();
  }

  function preventContextMenu(event) {
    event.preventDefault();
  }

  const supportsPointer =
    typeof window !== "undefined" && "PointerEvent" in window;
  const disposers = [];

  if (supportsPointer) {
    domElement.style.touchAction = "none";

    const handlePointerDown = (event) => {
      if (
        event.pointerType === "mouse" &&
        event.button !== 0 &&
        event.button !== 2
      )
        return;
      startDrag(event);
      domElement.setPointerCapture?.(event.pointerId);
      event.preventDefault();
    };

    const handlePointerMove = (event) => {
      if (
        !state.dragging ||
        (state.pointerId !== null && event.pointerId !== state.pointerId)
      ) {
        return;
      }
      updateDrag(event);
      event.preventDefault();
    };

    const handlePointerUp = (event) => {
      if (state.pointerId !== null && event.pointerId !== state.pointerId) {
        return;
      }
      domElement.releasePointerCapture?.(event.pointerId);
      endDrag();
    };

    domElement.addEventListener("pointerdown", handlePointerDown);
    domElement.addEventListener("pointermove", handlePointerMove);
    domElement.addEventListener("pointerup", handlePointerUp);
    domElement.addEventListener("pointercancel", handlePointerUp);
    domElement.addEventListener("pointerleave", handlePointerUp);

    disposers.push(() => {
      domElement.removeEventListener("pointerdown", handlePointerDown);
      domElement.removeEventListener("pointermove", handlePointerMove);
      domElement.removeEventListener("pointerup", handlePointerUp);
      domElement.removeEventListener("pointercancel", handlePointerUp);
      domElement.removeEventListener("pointerleave", handlePointerUp);
    });
  } else {
    const handleMouseDown = (event) => {
      if (event.button !== 0 && event.button !== 2) return;
      startDrag(event);
      event.preventDefault();
    };

    const handleMouseMove = (event) => {
      if (!state.dragging) return;
      updateDrag(event);
    };

    const handleMouseUp = () => {
      endDrag();
    };

    domElement.addEventListener("mousedown", handleMouseDown);
    domElement.addEventListener("mousemove", handleMouseMove);
    domElement.addEventListener("mouseup", handleMouseUp);
    domElement.addEventListener("mouseleave", handleMouseUp);

    disposers.push(() => {
      domElement.removeEventListener("mousedown", handleMouseDown);
      domElement.removeEventListener("mousemove", handleMouseMove);
      domElement.removeEventListener("mouseup", handleMouseUp);
      domElement.removeEventListener("mouseleave", handleMouseUp);
    });
  }

  domElement.addEventListener("wheel", handleWheel, { passive: false });
  domElement.addEventListener("contextmenu", preventContextMenu);

  disposers.push(() => {
    domElement.removeEventListener("wheel", handleWheel);
    domElement.removeEventListener("contextmenu", preventContextMenu);
  });

  return {
    dispose() {
      disposers.forEach((dispose) => dispose());
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
