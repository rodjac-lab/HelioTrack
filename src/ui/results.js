function formatDeg(value) {
  return Number.isFinite(value) ? `${value.toFixed(1)}°` : "—";
}

function formatIrradiance(value) {
  if (!Number.isFinite(value) || value <= 0) return "0 W/m²";
  return `${Math.round(value)} W/m²`;
}

function toHM(hours) {
  if (!Number.isFinite(hours)) return "—";
  let h = Math.floor(hours);
  let m = Math.round((hours - h) * 60);
  if (m === 60) {
    h += 1;
    m = 0;
  }
  h = ((h % 24) + 24) % 24;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

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
    </div>
  `;

  const fields = {
    alt: section.querySelector('[data-res="alt"]'),
    az: section.querySelector('[data-res="az"]'),
    irr: section.querySelector('[data-res="irr"]'),
    inc: section.querySelector('[data-res="inc"]'),
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

    fields.alt.textContent = formatDeg(altitude);
    fields.az.textContent = formatDeg(azimuth);
    fields.irr.textContent = formatIrradiance(irradiance);
    fields.inc.textContent = formatDeg(incidence);
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

  function formatTime(
    value,
    { useCivilTime, timezoneOffsetHours, longitudeDeg },
  ) {
    if (!Number.isFinite(value)) return "—";
    if (useCivilTime) {
      const civil = value - timezoneOffsetHours + longitudeDeg / 15;
      return `${toHM(civil)} (civil≈)`;
    }
    return `${toHM(value)} (solaire)`;
  }

  function update(events, options) {
    const opts = {
      useCivilTime: false,
      timezoneOffsetHours: 0,
      longitudeDeg: 0,
      ...(options || {}),
    };
    fields.sunrise.textContent = formatTime(events?.sunrise, opts);
    fields.solarnoon.textContent = formatTime(events?.solarNoon, opts);
    fields.sunset.textContent = formatTime(events?.sunset, opts);
    const maxAlt = events?.maxAltitude;
    fields.maxalt.textContent = Number.isFinite(maxAlt)
      ? `${maxAlt.toFixed(1)}°`
      : "—";
  }

  return { element: section, update };
}
