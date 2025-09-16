// src/logic/rules.js
// Règles "métier": point d'entrée de calculs, SANS accès direct au DOM.

import {
  DEG2RAD,
  toCartesian,
  solarAltAz,
  airMassKY,
  earthSunDistanceAu,
  SOLAR_CONSTANT
} from "./sunMath.js";

function minimalAzimuthDifference(angleDeg) {
  const wrapped = ((angleDeg % 360) + 360) % 360;
  return wrapped > 180 ? 360 - wrapped : wrapped;
}

/**
 * Calcule la position/infos solaires pour une configuration donnée.
 * NE LIT PAS le DOM : tout est passé en paramètres.
 */
export function calculateSolarPosition(params) {
  const {
    dayOfYear,          // 1..365
    localTimeHours,     // ex: 13.5 pour 13h30
    latDeg, lonDeg,     // latitude/longitude
    buildingOrientationDeg = 0, // orientation maison
    radius = 10         // rayon "scène" pour placement
  } = params;

  const geometry = solarAltAz({
    latDeg,
    lonDeg,
    dayOfYear,
    localTimeHours,
    buildingOrientationDeg
  });

  const {
    altitudeDeg,
    azimuthDeg,
    azimuthFromOrientationDeg,
    declinationDeg,
    equationOfTimeMinutes,
    localSolarTimeHours,
    hourAngleDeg
  } = geometry;

  const xyz = toCartesian({
    r: radius,
    thetaRad: azimuthDeg * DEG2RAD,
    phiRad: altitudeDeg * DEG2RAD
  });

  const airMass = airMassKY(altitudeDeg);
  const earthSunDistance = earthSunDistanceAu(dayOfYear);
  const incidenceAngleDeg = minimalAzimuthDifference(azimuthFromOrientationDeg);

  let directIrradiance = 0;
  if (altitudeDeg > 0 && incidenceAngleDeg < 90) {
    const effectiveAirMass = Math.min(airMass, 38);
    const atmosphericAttenuation = Math.pow(0.7, Math.pow(effectiveAirMass, 0.678));
    const cosIncidence = Math.cos(incidenceAngleDeg * DEG2RAD);
    directIrradiance = (SOLAR_CONSTANT * atmosphericAttenuation * cosIncidence) /
      (earthSunDistance * earthSunDistance);
  }

  return {
    altitudeDeg,
    elevation: altitudeDeg,
    azimuthDeg,
    azimuth: azimuthDeg,
    azimuthFromOrientationDeg,
    declinationDeg,
    declination: declinationDeg,
    equationOfTimeMinutes,
    localSolarTimeHours,
    hourAngleDeg,
    hourAngle: hourAngleDeg,
    earthSunDistance,
    airMass,
    directIrradiance,
    incidenceAngleDeg,
    incidenceAngle: incidenceAngleDeg,
    isAboveHorizon: altitudeDeg > 0,
    xyz
  };
}

/**
 * Calcul de quelques événements solaires (lever, midi solaire, coucher).
 */
export function computeSunEvents({
  dayOfYear,
  latDeg,
  lonDeg,
  buildingOrientationDeg = 0,
  stepHours = 0.25
}) {
  let prevElevation = null;
  let prevTime = null;
  let sunrise = NaN;
  let sunset = NaN;
  let maxAltitude = -Infinity;
  let solarNoon = NaN;

  for (let t = 0; t <= 24 + 1e-9; t += stepHours) {
    const pos = calculateSolarPosition({
      dayOfYear,
      latDeg,
      lonDeg,
      buildingOrientationDeg,
      localTimeHours: t
    });

    const elev = pos.altitudeDeg;
    if (elev > maxAltitude) {
      maxAltitude = elev;
      solarNoon = t;
    }

    if (prevElevation !== null) {
      const crossing = (prevElevation <= 0 && elev > 0) || (prevElevation >= 0 && elev < 0);
      if (crossing) {
        const frac = prevElevation === elev ? 0 : (0 - prevElevation) / (elev - prevElevation);
        const timeCross = prevTime + frac * (t - prevTime);
        if (elev > prevElevation && Number.isNaN(sunrise)) {
          sunrise = timeCross;
        } else if (elev < prevElevation) {
          sunset = timeCross;
        }
      }
    }

    prevElevation = elev;
    prevTime = t;
  }

  return { sunrise, sunset, solarNoon, maxAltitude };
}
