// src/logic/sunMath.js
// Utilitaires numériques et solaires — version consolidée depuis le legacy

export const DEG2RAD = Math.PI / 180;
export const RAD2DEG = 180 / Math.PI;
export const SOLAR_CONSTANT = 1361; // W/m²

export function clamp(x, min, max) {
  return Math.min(max, Math.max(min, x));
}

export function normalizeAngleDeg(angle) {
  const normalized = angle % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

// ---- Conversions géométriques de base ----
export function toCartesian({ r, thetaRad, phiRad }) {
  // theta: azimuth (0=N, est=90°), phi: altitude
  const x = r * Math.cos(phiRad) * Math.sin(thetaRad);
  const y = r * Math.sin(phiRad);
  const z = r * Math.cos(phiRad) * Math.cos(thetaRad);
  return { x, y, z };
}

// ---- Astronomie solaire (extrait du legacy) ----
export function solarDeclination(dayOfYear) {
  // 23.45° * sin(360° * (284 + N) / 365)
  return 23.45 * Math.sin(DEG2RAD * ((360 * (284 + dayOfYear)) / 365));
}

export function equationOfTime(dayOfYear) {
  const B = DEG2RAD * ((360 * (dayOfYear - 1)) / 365);
  return (
    4 *
    (0.000075 +
      0.001868 * Math.cos(B) -
      0.032077 * Math.sin(B) -
      0.014615 * Math.cos(2 * B) -
      0.04089 * Math.sin(2 * B))
  );
}

export function hourAngle(localSolarTimeHours) {
  // 15° par heure; 12h => 0°
  return (localSolarTimeHours - 12) * 15;
}

export function earthSunDistanceAu(dayOfYear) {
  return 1 - 0.0167 * Math.cos(DEG2RAD * ((360 * (dayOfYear - 4)) / 365));
}

export function solarAltAz({
  latDeg,
  lonDeg,
  dayOfYear,
  localTimeHours,
  buildingOrientationDeg = 0,
}) {
  const declinationDeg = solarDeclination(dayOfYear);
  const equationOfTimeMinutes = equationOfTime(dayOfYear);
  const localSolarTimeHours =
    localTimeHours + lonDeg / 15 + equationOfTimeMinutes / 60;
  const hourAngleDegValue = hourAngle(localSolarTimeHours);

  const latRad = latDeg * DEG2RAD;
  const decRad = declinationDeg * DEG2RAD;
  const hourAngleRad = hourAngleDegValue * DEG2RAD;

  const sinElevation =
    Math.sin(latRad) * Math.sin(decRad) +
    Math.cos(latRad) * Math.cos(decRad) * Math.cos(hourAngleRad);
  const elevationRad = Math.asin(clamp(sinElevation, -1, 1));
  const altitudeDeg = elevationRad * RAD2DEG;

  const azimuthRad = Math.atan2(
    Math.sin(hourAngleRad),
    Math.cos(hourAngleRad) * Math.sin(latRad) -
      Math.tan(decRad) * Math.cos(latRad),
  );
  let azimuthDeg = azimuthRad * RAD2DEG + 180;
  azimuthDeg = normalizeAngleDeg(azimuthDeg);

  const azimuthFromOrientationDeg = normalizeAngleDeg(
    azimuthDeg - buildingOrientationDeg,
  );

  return {
    altitudeDeg,
    azimuthDeg,
    azimuthFromOrientationDeg,
    declinationDeg,
    equationOfTimeMinutes,
    localSolarTimeHours,
    hourAngleDeg: hourAngleDegValue,
  };
}

// Kasten & Young 1989 — masse d'air apparente
export function airMassKY(altitudeDeg) {
  if (altitudeDeg <= 0) return Infinity;
  const h = altitudeDeg;
  return 1 / (Math.sin(h * DEG2RAD) + 0.50572 * Math.pow(h + 6.07995, -1.6364));
}
