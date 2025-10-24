export function createRenderer({ THREE, container, camera }) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.setSize(Math.max(container.clientWidth, 1), Math.max(container.clientHeight, 1));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.physicallyCorrectLights = true;
  if ("outputColorSpace" in renderer && THREE.SRGBColorSpace) {
    renderer.outputColorSpace = THREE.SRGBColorSpace;
  }
  if ("toneMapping" in renderer && THREE.ACESFilmicToneMapping) {
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
  }
  container.appendChild(renderer.domElement);
  return renderer;
}

export function createResizeController({ container, camera, renderer }) {
  let resizeObserver = null;
  let resizeRafId = 0;
  let lastWidth = Math.max(container.clientWidth, 1);
  let lastHeight = Math.max(container.clientHeight, 1);

  function resize() {
    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);
    if (width === lastWidth && height === lastHeight) {
      return;
    }
    lastWidth = width;
    lastHeight = height;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

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
    const monitor = () => {
      attemptResize();
      resizeRafId = requestAnimationFrame(monitor);
    };
    resizeRafId = requestAnimationFrame(monitor);
  }

  attemptResize();

  return {
    resize,
    dispose() {
      resizeObserver?.disconnect();
      resizeObserver = null;
      if (resizeRafId) {
        cancelAnimationFrame(resizeRafId);
        resizeRafId = 0;
      }
    },
  };
}

export function createRenderLoop({ renderer, scene, camera }) {
  let rafId = 0;

  function frame() {
    rafId = requestAnimationFrame(frame);
    renderer.render(scene, camera);
  }

  rafId = requestAnimationFrame(frame);

  return {
    stop() {
      cancelAnimationFrame(rafId);
    },
  };
}
