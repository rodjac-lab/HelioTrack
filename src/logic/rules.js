// src/logic/rules.js
// Règles "métier": point d'entrée de calculs, SANS accès direct au DOM.

import {
  DEG2RAD,
  toCartesian,
  solarAltAz,
  airMassKY,
  earthSunDistanceAu,
  SOLAR_CONSTANT,
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
    dayOfYear, // 1..365
    localTimeHours, // ex: 13.5 pour 13h30
    latDeg,
    lonDeg, // latitude/longitude
    buildingOrientationDeg = 0, // orientation maison
    radius = 10, // rayon "scène" pour placement
  } = params;

  const geometry = solarAltAz({
    latDeg,
    lonDeg,
    dayOfYear,
    localTimeHours,
    buildingOrientationDeg,
  });

  const {
    altitudeDeg,
    azimuthDeg,
    azimuthFromOrientationDeg,
    declinationDeg,
    equationOfTimeMinutes,
    localSolarTimeHours,
    hourAngleDeg,
  } = geometry;

  const xyz = toCartesian({
    r: radius,
    thetaRad: azimuthDeg * DEG2RAD,
    phiRad: altitudeDeg * DEG2RAD,
  });

  const airMass = airMassKY(altitudeDeg);
  const earthSunDistance = earthSunDistanceAu(dayOfYear);
  const incidenceAngleDeg = minimalAzimuthDifference(azimuthFromOrientationDeg);

  let directIrradiance = 0;
  if (altitudeDeg > 0 && incidenceAngleDeg < 90) {
    const effectiveAirMass = Math.min(airMass, 38);
    const atmosphericAttenuation = Math.pow(
      0.7,
      Math.pow(effectiveAirMass, 0.678),
    );
    const cosIncidence = Math.cos(incidenceAngleDeg * DEG2RAD);
    directIrradiance =
      (SOLAR_CONSTANT * atmosphericAttenuation * cosIncidence) /
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
    xyz,
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
  stepHours = 0.25,
}) {
  const coarseStep = Math.max(stepHours, 0.5);
  const cache = new Map();
  let maxAltitude = -Infinity;
  let coarseNoon = NaN;

  function sample(time) {
    const clamped = Math.min(Math.max(time, 0), 24);
    const key = clamped.toFixed(6);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const pos = calculateSolarPosition({
      dayOfYear,
      latDeg,
      lonDeg,
      buildingOrientationDeg,
      localTimeHours: clamped,
    });
    const altitude = pos.altitudeDeg;
    cache.set(key, altitude);
    if (altitude > maxAltitude) {
      maxAltitude = altitude;
      coarseNoon = clamped;
    }
    return altitude;
  }

  function refineCrossing(lower, upper) {
    let a = lower;
    let b = upper;
    let fa = sample(a);
    let fb = sample(b);
    if (Number.isNaN(fa) || Number.isNaN(fb)) return NaN;
    for (let i = 0; i < 10; i += 1) {
      const mid = (a + b) / 2;
      const fm = sample(mid);
      if (Math.sign(fm) === Math.sign(fa)) {
        a = mid;
        fa = fm;
      } else {
        b = mid;
        fb = fm;
      }
    }
    return (a + b) / 2;
  }

  function refineMaximum(center) {
    if (!Number.isFinite(center)) {
      return { time: NaN, altitude: maxAltitude };
    }
    let left = Math.max(0, center - Math.max(coarseStep, 1));
    let right = Math.min(24, center + Math.max(coarseStep, 1));
    for (let i = 0; i < 6; i += 1) {
      const t1 = left + (right - left) / 3;
      const t2 = right - (right - left) / 3;
      const f1 = sample(t1);
      const f2 = sample(t2);
      if (f1 < f2) {
        left = t1;
      } else {
        right = t2;
      }
    }
    const time = (left + right) / 2;
    return { time, altitude: sample(time) };
  }

  let sunrise = NaN;
  let sunset = NaN;
  let prevTime = 0;
  let prevElevation = sample(0);

  for (let t = coarseStep; t <= 24 + 1e-9; t += coarseStep) {
    const currentTime = Math.min(t, 24);
    const elevation = sample(currentTime);
    const crossing =
      (prevElevation <= 0 && elevation > 0) ||
      (prevElevation >= 0 && elevation < 0);
    if (crossing) {
      const refined = refineCrossing(prevTime, currentTime);
      if (elevation > prevElevation && Number.isNaN(sunrise)) {
        sunrise = refined;
      } else if (elevation < prevElevation) {
        sunset = refined;
      }
    }
    prevTime = currentTime;
    prevElevation = elevation;
  }

  const { time: solarNoon, altitude } = refineMaximum(coarseNoon);

  return { sunrise, sunset, solarNoon, maxAltitude: altitude };
}
