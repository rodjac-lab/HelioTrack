import { store } from "./state/store.js";

// PR1: rien de connecté encore. On prépare juste les hooks.
// Exemple: plus tard, on branchera ici l'UI gauche/droite + 3D + charts.
store.subscribe((_change, snapshot) => {
  // future: applyRules(snapshot); update3D(snapshot); updateCharts(snapshot);
  // pour l’instant on ne touche pas à l’app legacy.
});

console.log("[HelioTrack] Skeleton ready (PR1).");
