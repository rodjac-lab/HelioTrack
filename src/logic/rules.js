// src/logic/rules.js
// Règles "métier": point d'entrée de calculs, SANS accès direct au DOM.

import { DEG2RAD, RAD2DEG, toCartesian, solarAltAz, airMassKY } from "./sunMath.js";

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

  // 1) Altitude/Azimuth (remplacera le stub par tes formules lors de l’extraction)
  const { altitudeDeg, azimuthDeg } = solarAltAz({
    latDeg, lonDeg, dayOfYear, localTimeHours, buildingOrientationDeg
  });

  // 2) Coordonnées 3D utiles pour la scène
  const xyz = toCartesian({
    r: radius,
    thetaRad: azimuthDeg * DEG2RAD,
    phiRad: altitudeDeg * DEG2RAD
  });

  // 3) Quelques indicateurs (ex: masse d’air)
  const airMass = airMassKY(altitudeDeg);

  return {
    altitudeDeg,
    azimuthDeg,
    xyz,        // {x,y,z}
    airMass
  };
}

/**
 * Ex: calculer quelques "événements clés" (lever/zenith/coucher) pour la journée donnée.
 * Placeholder: on remplira avec tes vraies méthodes au moment de la migration.
 */
export function computeSunEvents({ dayOfYear, latDeg, lonDeg, buildingOrientationDeg = 0 }) {
  return [
    { label: "Sunrise",   localTimeHours: 6.5  },
    { label: "Noon",      localTimeHours: 12.0 },
    { label: "Sunset",    localTimeHours: 19.5 }
  ].map(e => ({
    ...e,
    ...calculateSolarPosition({ dayOfYear, latDeg, lonDeg, buildingOrientationDeg, localTimeHours: e.localTimeHours })
  }));
}
