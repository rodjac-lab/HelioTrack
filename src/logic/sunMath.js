// src/logic/sunMath.js
// Utilitaires numériques et solaires (PRÉPARATION — on branchera plus tard)

export const DEG2RAD = Math.PI / 180;
export const RAD2DEG = 180 / Math.PI;

export function clamp(x, min, max) { return Math.min(max, Math.max(min, x)); }

// ---- Conversions géométriques de base ----
export function toCartesian({ r, thetaRad, phiRad }) {
  // theta: azimuth (0=N, est=90°), phi: altitude
  const x = r * Math.cos(phiRad) * Math.sin(thetaRad);
  const y = r * Math.sin(phiRad);
  const z = r * Math.cos(phiRad) * Math.cos(thetaRad);
  return { x, y, z };
}

// ---- Astronomie simplifiée (placeholders à compléter lors de l’extraction) ----
// Ces fonctions seront remplies avec TES formules actuelles (déclinaison, EoT, etc.)
// quand on migrera depuis le gros HTML.
export function solarDeclination(dayOfYear) {
  // TODO: remplacer par ta formule existante
  // ex. approx: 23.44° * sin(2π * (284+N) / 365)
  return 23.44 * Math.sin(((2 * Math.PI) * (284 + dayOfYear)) / 365);
}

export function equationOfTime(dayOfYear) {
  // TODO: remplacer par ta formule existante (minutes)
  return 0; 
}

export function hourAngle(localSolarTimeHours) {
  // 15° par heure; 12h => 0°
  return (localSolarTimeHours - 12) * 15;
}

export function solarAltAz({ latDeg, lonDeg, dayOfYear, localTimeHours, buildingOrientationDeg = 0 }) {
  // TODO: lire EoT, décalage LST, déclinaison, etc. et renvoyer { altitudeDeg, azimuthDeg }
  // Placeholder très simple (sera remplacé par ton calcul réel)
  const alt = clamp(60 - Math.abs(12 - localTimeHours) * 10, 0, 75);
  const az  = (localTimeHours / 24) * 360; // faux pour l’instant, juste un stub
  return { altitudeDeg: alt, azimuthDeg: az + buildingOrientationDeg };
}

// Transmittance atmosphérique type (placeholder)
export function airMassKY(altitudeDeg) {
  // TODO: remplacer par ta version
  const altRad = altitudeDeg * DEG2RAD;
  const m = 1 / Math.max(0.1, Math.sin(altRad));
  return clamp(m, 1, 10);
}
