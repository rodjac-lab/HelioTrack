import { store } from "./state/store.js";
import { calculateSolarPosition } from "./logic/rules.js";

store.subscribe((_chg, snapshot) => {
  // Bientôt: applyRules(snapshot), update3D(snapshot), updateCharts(snapshot)
});

console.log("[HelioTrack] PR2 prep ready. Example call:", 
  calculateSolarPosition({ dayOfYear: 172, localTimeHours: 12, latDeg: 45.76, lonDeg: 4.83, buildingOrientationDeg: 0 })
);
