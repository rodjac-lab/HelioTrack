import { store } from "./state/store.js";
import { calculateSolarPosition, computeSunEvents } from "./logic/rules.js";
import { createViewer } from "./view3d/viewer.js";
import { attachOrbitControls, setViewPreset } from "./view3d/controls3d.js";
import { initLeftPanel } from "./ui/leftPanel.js";
import { initRightPanel } from "./ui/rightPanel.js";
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

let animationMode = "idle";
let animationTimer = null;

function clearAnimationTimer() {
  if (animationTimer !== null) {
    clearTimeout(animationTimer);
    animationTimer = null;
  }
}

function stopAnimation() {
  animationMode = "idle";
  clearAnimationTimer();
}

function startDayAnimation() {
  stopAnimation();
  animationMode = "day";
  let hour = 6;
  const step = () => {
    if (animationMode !== "day") return;
    store.set("localTimeHours", Math.round(hour * 10) / 10);
    hour += 0.2;
    if (hour <= 18.0001) {
      animationTimer = setTimeout(() => requestAnimationFrame(step), 100);
    } else {
      stopAnimation();
    }
  };
  step();
}

function startYearAnimation() {
  stopAnimation();
  animationMode = "year";
  let day = 1;
  const step = () => {
    if (animationMode !== "year") return;
    store.set("dayOfYear", Math.round(day));
    day += 2;
    if (day <= 365.5) {
      animationTimer = setTimeout(() => requestAnimationFrame(step), 50);
    } else {
      stopAnimation();
    }
  };
  step();
}

function handleAnimationCommand(command) {
  if (command === "day") startDayAnimation();
  else if (command === "year") startYearAnimation();
  else stopAnimation();
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

function applyState(snapshot) {
  const requiredKeys = ["dayOfYear", "localTimeHours", "latDeg", "lonDeg", "buildingOrientationDeg"];
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

  const events = computeSunEvents({
    dayOfYear: snapshot.dayOfYear,
    latDeg: snapshot.latDeg,
    lonDeg: snapshot.lonDeg,
    buildingOrientationDeg: snapshot.buildingOrientationDeg,
  });
  rightPanel.updateSunEvents(events, {
    useCivilTime: snapshot.useCivilTime,
    timezoneOffsetHours: snapshot.timezoneOffsetHours,
    longitudeDeg: snapshot.lonDeg,
  });
}

applyState(store.getAll());
store.subscribe((change, snapshot) => {
  if (change?.key === "dayOfYear" || change?.key === "localTimeHours") {
    if (animationMode !== "idle") {
      // keep animation running but nothing special
    }
  }
  applyState(snapshot);
});
