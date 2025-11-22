import {
  formatTime,
  formatDegrees,
  formatIrradiance,
} from "../utils/formatters.js";

export function createResultsView() {
  const section = document.createElement("section");
  section.className = "panel";
  section.id = "results-panel";
  section.innerHTML = `
    <h3>Résultats</h3>
    <div class="results-grid" aria-live="polite">
      <div class="res-item"><div class="res-label">Altitude</div><div class="res-value" data-res="alt">—</div></div>
      <div class="res-item"><div class="res-label">Azimut</div><div class="res-value" data-res="az">—</div></div>
      <div class="res-item"><div class="res-label">Irradiance</div><div class="res-value" data-res="irr">—</div></div>
      <div class="res-item"><div class="res-label">Incidence</div><div class="res-value" data-res="inc">—</div></div>
      <div class="res-item"><div class="res-label">Efficacité</div><div class="res-value" data-res="eff">—</div></div>
    </div>
  `;

  const fields = {
    alt: section.querySelector('[data-res="alt"]'),
    az: section.querySelector('[data-res="az"]'),
    irr: section.querySelector('[data-res="irr"]'),
    inc: section.querySelector('[data-res="inc"]'),
    eff: section.querySelector('[data-res="eff"]'),
  };

  function update(solarPosition) {
    if (!solarPosition) {
      fields.alt.textContent = "—";
      fields.az.textContent = "—";
      fields.irr.textContent = "0 W/m²";
      fields.inc.textContent = "—";
      return;
    }
    const altitude = solarPosition.altitudeDeg ?? solarPosition.elevation;
    const azimuth = solarPosition.azimuthDeg ?? solarPosition.azimuth;
    const irradiance = solarPosition.directIrradiance;
    const incidence =
      solarPosition.incidenceAngleDeg ?? solarPosition.incidenceAngle;

    fields.alt.textContent = formatDegrees(altitude);
    fields.az.textContent = formatDegrees(azimuth);
    fields.irr.textContent = formatIrradiance(irradiance);
    fields.inc.textContent = formatDegrees(incidence);
    fields.eff.textContent =
      solarPosition.panelEfficiency != null
        ? `${Math.round(solarPosition.panelEfficiency)}%`
        : "—";
  }

  return { element: section, update };
}

export function createSunEventsView() {
  const section = document.createElement("section");
  section.className = "panel";
  section.id = "sun-events-panel";
  section.innerHTML = `
    <h3>Moments clés du soleil</h3>
    <div class="results-grid">
      <div class="res-item"><div class="res-label">Lever</div><div class="res-value" data-event="sunrise">—</div></div>
      <div class="res-item"><div class="res-label">Midi solaire</div><div class="res-value" data-event="solarnoon">—</div></div>
      <div class="res-item"><div class="res-label">Coucher</div><div class="res-value" data-event="sunset">—</div></div>
      <div class="res-item"><div class="res-label">Altitude max</div><div class="res-value" data-event="maxalt">—</div></div>
    </div>
  `;

  const fields = {
    sunrise: section.querySelector('[data-event="sunrise"]'),
    solarnoon: section.querySelector('[data-event="solarnoon"]'),
    sunset: section.querySelector('[data-event="sunset"]'),
    maxalt: section.querySelector('[data-event="maxalt"]'),
  };

  function formatEventTime(
    value,
    { useCivilTime, timezoneOffsetHours, longitudeDeg },
  ) {
    if (!Number.isFinite(value)) return "—";
    if (useCivilTime) {
      const civil = value - timezoneOffsetHours + longitudeDeg / 15;
      return `${formatTime(civil)} (civil≈)`;
    }
    return `${formatTime(value)} (solaire)`;
  }

  function update(events, options) {
    const opts = {
      useCivilTime: false,
      timezoneOffsetHours: 0,
      longitudeDeg: 0,
      ...(options || {}),
    };
    fields.sunrise.textContent = formatEventTime(events?.sunrise, opts);
    fields.solarnoon.textContent = formatEventTime(events?.solarNoon, opts);
    fields.sunset.textContent = formatEventTime(events?.sunset, opts);
    const maxAlt = events?.maxAltitude;
    fields.maxalt.textContent = Number.isFinite(maxAlt)
      ? `${maxAlt.toFixed(1)}°`
      : "—";
  }

  return { element: section, update };
}
