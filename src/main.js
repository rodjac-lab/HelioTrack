import { store } from "./state/store.js";
import { calculateSolarPosition, computeSunEvents } from "./logic/rules.js";
import { createViewer } from "./view3d/viewer.js";
import { attachOrbitControls, setViewPreset } from "./view3d/controls3d.js";
import { initLeftPanel } from "./ui/leftPanel.js";
import { initRightPanel } from "./ui/rightPanel/index.js";
import { initToolbar } from "./ui/toolbar.js";
import { initSmoke } from "./ui/smoke.js";

const initialState = {
  latDeg: 48.8566,
  lonDeg: 2.3522,
  dayOfYear: 80,
  localTimeHours: 12,
  buildingOrientationDeg: 180,
  timezoneOffsetHours: 0,
  useCivilTime: false,
};
Object.entries(initialState).forEach(([key, value]) => store.set(key, value));

const leftMount = document.getElementById("left");
const rightMount = document.getElementById("right");
const center = document.getElementById("center");
const toolbarMount = document.getElementById("toolbar");

const viewerHost = document.createElement("div");
viewerHost.className = "viewer-host";
center.appendChild(viewerHost);

const smoke = initSmoke({ mount: viewerHost });

const viewer = createViewer({
  container: viewerHost,
  initialLatitude: store.get("latDeg"),
  initialOrientationDeg: store.get("buildingOrientationDeg"),
});

smoke.run("Initialisation conteneur", () => !!viewerHost);
smoke.run("Three.js prêt", () => !!viewer?.renderer?.domElement);

const controls = attachOrbitControls({
  camera: viewer.camera,
  domElement: viewer.renderer.domElement,
});

function handlePresetChange(preset) {
  setViewPreset({ camera: viewer.camera, preset });
  controls.sync();
}

function createAnimationRunner() {
  const getNow = () =>
    typeof performance !== "undefined" && typeof performance.now === "function"
      ? performance.now()
      : Date.now();
  let frameId = null;
  let current = null;

  function stop() {
    if (frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
    current = null;
  }

  function start({ key, durationMs, onProgress, onComplete }) {
    stop();
    const startTime = getNow();
    current = {
      key,
      durationMs: Math.max(0, durationMs),
      onProgress,
      onComplete,
      startTime,
    };

    if (onProgress) {
      onProgress(0);
    }

    const step = (timestamp) => {
      if (!current || current.key !== key) return;
      const now = typeof timestamp === "number" ? timestamp : getNow();
      const elapsed = now - current.startTime;
      const progress =
        current.durationMs === 0
          ? 1
          : Math.min(1, elapsed / current.durationMs);
      if (current.onProgress) {
        current.onProgress(progress);
      }
      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        frameId = null;
        current.onComplete?.();
        current = null;
      }
    };

    frameId = requestAnimationFrame(step);
  }

  function is(key) {
    return current?.key === key;
  }

  return { start, stop, is };
}

const animationRunner = createAnimationRunner();
let activeAnimation = "idle";

function stopAnimation() {
  activeAnimation = "idle";
  animationRunner.stop();
}

function startDayAnimation() {
  stopAnimation();
  activeAnimation = "day";
  animationRunner.start({
    key: "day",
    durationMs: 6000,
    onProgress: (progress) => {
      if (!animationRunner.is("day")) return;
      const hour = 6 + (18 - 6) * progress;
      store.set("localTimeHours", Math.round(hour * 10) / 10);
    },
    onComplete: () => {
      stopAnimation();
      store.set("localTimeHours", 18);
    },
  });
}

function startYearAnimation() {
  stopAnimation();
  activeAnimation = "year";
  animationRunner.start({
    key: "year",
    durationMs: 9000,
    onProgress: (progress) => {
      if (!animationRunner.is("year")) return;
      const day = 1 + (365 - 1) * progress;
      store.set("dayOfYear", Math.round(day));
    },
    onComplete: () => {
      stopAnimation();
      store.set("dayOfYear", 365);
    },
  });
}

function handleAnimationCommand(command) {
  if (command === "day") {
    startDayAnimation();
  } else if (command === "year") {
    startYearAnimation();
  } else {
    stopAnimation();
  }
}

initToolbar({
  mount: toolbarMount,
  onPresetChange: handlePresetChange,
  onAnimationCommand: handleAnimationCommand,
});

initLeftPanel({
  mount: leftMount,
  store,
  onManualChange: () => stopAnimation(),
});

const rightPanel = initRightPanel({ mount: rightMount, store });

window.addEventListener("resize", () => viewer.resize());

let lastLatitude = store.get("latDeg");
let lastSunEventsInput = null;
let lastSunEventsResult = null;

function hasSameEventInputs(a, b) {
  return (
    a?.dayOfYear === b?.dayOfYear &&
    a?.latDeg === b?.latDeg &&
    a?.lonDeg === b?.lonDeg &&
    a?.buildingOrientationDeg === b?.buildingOrientationDeg
  );
}

function applyState(snapshot) {
  const requiredKeys = [
    "dayOfYear",
    "localTimeHours",
    "latDeg",
    "lonDeg",
    "buildingOrientationDeg",
  ];
  const missing = requiredKeys.some((key) => snapshot[key] === undefined);
  if (missing) return;

  const solar = calculateSolarPosition({
    dayOfYear: snapshot.dayOfYear,
    localTimeHours: snapshot.localTimeHours,
    latDeg: snapshot.latDeg,
    lonDeg: snapshot.lonDeg,
    buildingOrientationDeg: snapshot.buildingOrientationDeg,
  });

  viewer.updateSunPosition(solar);
  viewer.updateBuildingOrientation(snapshot.buildingOrientationDeg);
  rightPanel.updateResults(solar);

  if (snapshot.latDeg !== lastLatitude) {
    viewer.updateSeasonalPaths(snapshot.latDeg);
    lastLatitude = snapshot.latDeg;
  }

  const eventsInput = {
    dayOfYear: snapshot.dayOfYear,
    latDeg: snapshot.latDeg,
    lonDeg: snapshot.lonDeg,
    buildingOrientationDeg: snapshot.buildingOrientationDeg,
  };

  if (!hasSameEventInputs(eventsInput, lastSunEventsInput)) {
    lastSunEventsResult = computeSunEvents(eventsInput);
    lastSunEventsInput = { ...eventsInput };
  }

  const events = lastSunEventsResult;
  rightPanel.updateSunEvents(events, {
    useCivilTime: snapshot.useCivilTime,
    timezoneOffsetHours: snapshot.timezoneOffsetHours,
    longitudeDeg: snapshot.lonDeg,
  });
}

applyState(store.getAll());
store.subscribe((change, snapshot) => {
  if (change?.key === "dayOfYear" || change?.key === "localTimeHours") {
    if (activeAnimation !== "idle") {
      // animation is driving the state updates
    }
  }
  applyState(snapshot);
});
