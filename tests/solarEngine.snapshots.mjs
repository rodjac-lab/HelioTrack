import assert from "node:assert/strict";
import { calculateSolarPosition, computeSunEvents } from "../src/logic/rules.js";

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;
const SOLAR_CONSTANT = 1361;

function normalizeAngle(angle) {
  const normalized = angle % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

function legacySolarDeclination(dayOfYear) {
  return 23.45 * Math.sin(DEG2RAD * (360 * (284 + dayOfYear) / 365));
}

function legacyEquationOfTime(dayOfYear) {
  const B = DEG2RAD * (360 * (dayOfYear - 1) / 365);
  return 4 * (
    0.000075 +
    0.001868 * Math.cos(B) -
    0.032077 * Math.sin(B) -
    0.014615 * Math.cos(2 * B) -
    0.04089  * Math.sin(2 * B)
  );
}

function legacyAirMassKY(elevationDeg) {
  if (elevationDeg <= 0) return Infinity;
  const h = elevationDeg;
  return 1 / (
    Math.sin(h * DEG2RAD) +
    0.50572 * Math.pow(h + 6.07995, -1.6364)
  );
}

function legacyEarthSunDistance(dayOfYear) {
  return 1 - 0.0167 * Math.cos(DEG2RAD * (360 * (dayOfYear - 4) / 365));
}

function legacyCalculateSolarPosition({ dayOfYear, hour, latitude, longitude, buildingOrientationDeg = 0 }) {
  const declination = legacySolarDeclination(dayOfYear);
  const equationOfTime = legacyEquationOfTime(dayOfYear);
  const solarTime = hour + longitude / 15 + equationOfTime / 60;
  const hourAngle = 15 * (solarTime - 12);

  const latRad = latitude * DEG2RAD;
  const decRad = declination * DEG2RAD;
  const hourAngleRad = hourAngle * DEG2RAD;

  const elevationRad = Math.asin(
    Math.sin(latRad) * Math.sin(decRad) +
    Math.cos(latRad) * Math.cos(decRad) * Math.cos(hourAngleRad)
  );
  const elevation = elevationRad * RAD2DEG;

  const azimuthRad = Math.atan2(
    Math.sin(hourAngleRad),
    Math.cos(hourAngleRad) * Math.sin(latRad) - Math.tan(decRad) * Math.cos(latRad)
  );
  let azimuth = azimuthRad * RAD2DEG + 180;
  azimuth = normalizeAngle(azimuth);

  const earthSunDistance = legacyEarthSunDistance(dayOfYear);
  const azimuthRelative = normalizeAngle(azimuth - buildingOrientationDeg);
  const incidenceAngle = azimuthRelative > 180 ? 360 - azimuthRelative : azimuthRelative;

  const airMass = legacyAirMassKY(elevation);

  let directIrradiance = 0;
  if (elevation > 0 && incidenceAngle < 90) {
    const effectiveAirMass = Math.min(airMass, 38);
    const atmosphericAttenuation = Math.pow(0.7, Math.pow(effectiveAirMass, 0.678));
    const cosIncidence = Math.cos(incidenceAngle * DEG2RAD);
    directIrradiance = (SOLAR_CONSTANT * atmosphericAttenuation * cosIncidence) /
      (earthSunDistance * earthSunDistance);
  }

  return {
    azimuth,
    elevation,
    declination,
    hourAngle,
    equationOfTimeMinutes: equationOfTime,
    localSolarTimeHours: solarTime,
    earthSunDistance,
    directIrradiance,
    incidenceAngle,
    azimuthFromOrientationDeg: azimuthRelative,
    airMass
  };
}

function legacyComputeSunEvents({ dayOfYear, latitude, longitude, stepHours = 0.25 }) {
  let prevElev = null;
  let prevT = null;
  let sunrise = NaN;
  let sunset = NaN;
  let maxAlt = -Infinity;
  let tMax = NaN;

  for (let t = 0; t <= 24 + 1e-9; t += stepHours) {
    const pos = legacyCalculateSolarPosition({ dayOfYear, hour: t, latitude, longitude });
    const elev = pos.elevation;

    if (elev > maxAlt) {
      maxAlt = elev;
      tMax = t;
    }

    if (prevElev !== null) {
      const crossed = (prevElev <= 0 && elev > 0) || (prevElev >= 0 && elev < 0);
      if (crossed) {
        const frac = prevElev === elev ? 0 : (0 - prevElev) / (elev - prevElev);
        const tcross = prevT + frac * (t - prevT);
        if (elev > prevElev && Number.isNaN(sunrise)) sunrise = tcross;
        else if (elev < prevElev) sunset = tcross;
      }
    }

    prevElev = elev;
    prevT = t;
  }

  return { sunrise, sunset, solarNoon: tMax, maxAltitude: maxAlt };
}

function assertAlmostEqual(actual, expected, tolerance, message) {
  if (Number.isNaN(expected) && Number.isNaN(actual)) return;
  if (!Number.isFinite(expected) && !Number.isFinite(actual)) return;
  assert.ok(Math.abs(actual - expected) <= tolerance,
    `${message} (expected ${expected}, got ${actual})`);
}

const daySamples = [20, 172, 355];
const hourSamples = [6, 12, 18];
const latLonSamples = [
  { label: "Paris", latDeg: 48.8566, lonDeg: 2.3522 },
  { label: "Sydney", latDeg: -33.8688, lonDeg: 151.2093 }
];
const orientations = [0, 45];

const snapshotTable = [];

for (const location of latLonSamples) {
  for (const dayOfYear of daySamples) {
    for (const localTimeHours of hourSamples) {
      for (const orientation of orientations) {
        const modern = calculateSolarPosition({
          dayOfYear,
          localTimeHours,
          latDeg: location.latDeg,
          lonDeg: location.lonDeg,
          buildingOrientationDeg: orientation,
          radius: 10
        });

        const legacy = legacyCalculateSolarPosition({
          dayOfYear,
          hour: localTimeHours,
          latitude: location.latDeg,
          longitude: location.lonDeg,
          buildingOrientationDeg: orientation
        });

        const context = `${location.label} D${dayOfYear} T${localTimeHours}h Ori${orientation}`;

        assertAlmostEqual(modern.altitudeDeg, legacy.elevation, 1e-6, `${context} altitude`);
        assertAlmostEqual(modern.azimuthDeg, legacy.azimuth, 1e-6, `${context} azimuth`);
        assertAlmostEqual(modern.declinationDeg, legacy.declination, 1e-6, `${context} declination`);
        assertAlmostEqual(modern.hourAngleDeg, legacy.hourAngle, 1e-6, `${context} hourAngle`);
        assertAlmostEqual(modern.equationOfTimeMinutes, legacy.equationOfTimeMinutes, 1e-6, `${context} equationOfTime`);
        assertAlmostEqual(modern.localSolarTimeHours, legacy.localSolarTimeHours, 1e-6, `${context} localSolarTime`);
        assertAlmostEqual(modern.earthSunDistance, legacy.earthSunDistance, 1e-8, `${context} earthSunDistance`);
        assertAlmostEqual(modern.airMass, legacy.airMass, 1e-6, `${context} airMass`);
        assertAlmostEqual(modern.azimuthFromOrientationDeg, legacy.azimuthFromOrientationDeg, 1e-6, `${context} relativeAz`);
        assertAlmostEqual(modern.incidenceAngleDeg, legacy.incidenceAngle, 1e-6, `${context} incidenceAngle`);
        assertAlmostEqual(modern.directIrradiance, legacy.directIrradiance, 1e-3, `${context} directIrradiance`);

        snapshotTable.push({
          location: location.label,
          day: dayOfYear,
          time: localTimeHours,
          orientation,
          altitude: Number(modern.altitudeDeg.toFixed(2)),
          azimuth: Number(modern.azimuthDeg.toFixed(2)),
          irradiance: Number(modern.directIrradiance.toFixed(1))
        });
      }
    }
  }
}

const eventsTable = [];
for (const location of latLonSamples) {
  for (const dayOfYear of daySamples) {
    const modern = computeSunEvents({
      dayOfYear,
      latDeg: location.latDeg,
      lonDeg: location.lonDeg
    });
    const legacy = legacyComputeSunEvents({
      dayOfYear,
      latitude: location.latDeg,
      longitude: location.lonDeg
    });

    const context = `${location.label} D${dayOfYear}`;
    assertAlmostEqual(modern.sunrise, legacy.sunrise, 1e-4, `${context} sunrise`);
    assertAlmostEqual(modern.sunset, legacy.sunset, 1e-4, `${context} sunset`);
    assertAlmostEqual(modern.solarNoon, legacy.solarNoon, 1e-4, `${context} solarNoon`);
    assertAlmostEqual(modern.maxAltitude, legacy.maxAltitude, 1e-4, `${context} maxAltitude`);

    eventsTable.push({
      location: location.label,
      day: dayOfYear,
      sunrise: Number.isFinite(modern.sunrise) ? modern.sunrise.toFixed(2) : "—",
      solarNoon: Number.isFinite(modern.solarNoon) ? modern.solarNoon.toFixed(2) : "—",
      sunset: Number.isFinite(modern.sunset) ? modern.sunset.toFixed(2) : "—",
      maxAltitude: Number.isFinite(modern.maxAltitude) ? modern.maxAltitude.toFixed(1) : "—"
    });
  }
}

console.log(`Validated ${snapshotTable.length} solar position snapshots.`);
console.table(snapshotTable);
console.log("\nValidated sun event computations:");
console.table(eventsTable);
