const PRESETS = [
  { label: "Rome", lat: 41.9028, lon: 12.4964 },
  { label: "Lyon", lat: 45.7640, lon: 4.8357 },
  { label: "Amsterdam", lat: 52.3740, lon: 4.8952 },
  { label: "Oslo", lat: 59.9133, lon: 10.7390 },
];

export function formatDayOfYear(day) {
  const value = Number.isFinite(day) ? Math.min(Math.max(1, Math.round(day)), 365) : 1;
  const base = new Date(Date.UTC(2021, 0, 1));
  base.setUTCDate(value);
  return base.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function formatTime(hours) {
  if (!Number.isFinite(hours)) return "--:--";
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function initLeftPanel({ mount, store, onManualChange }) {
  const container = document.createElement("div");
  container.className = "left-panel";
  container.innerHTML = `
    <section class="panel panel-compact">
      <div class="quick-card" data-card="presets">
        <div class="quick-card-header">
          <span class="quick-card-icon" aria-hidden="true">📍</span>
          <div>
            <h3>Paramètres rapides</h3>
            <p class="quick-card-copy">Sélectionnez un préréglage pour charger immédiatement les coordonnées d'une ville.</p>
          </div>
        </div>
        <div class="preset-grid" data-role="presets"></div>
      </div>
    </section>
    <section class="panel panel-compact">
      <div class="quick-card" data-card="day">
        <div class="quick-card-header">
          <span class="quick-card-icon" aria-hidden="true">🗓️</span>
          <div>
            <h3>Jour de l'année</h3>
            <p class="quick-card-copy">Ajustez le calendrier pour explorer les variations saisonnières.</p>
          </div>
        </div>
        <label class="slider-label-legend">Jour sélectionné : <span data-label="date">21 mar</span></label>
        <div class="slider-track" data-slider="day">
          <span class="value-pill" data-value-pill="day">21 mar</span>
          <input type="range" min="1" max="365" step="1" data-input="day" />
        </div>
        <div class="slider-label"><span>1 Jan</span><span>31 Déc</span></div>
      </div>
    </section>
    <section class="panel panel-compact">
      <div class="quick-card" data-card="time">
        <div class="quick-card-header">
          <span class="quick-card-icon" aria-hidden="true">⏱️</span>
          <div>
            <h3>Heure solaire</h3>
            <p class="quick-card-copy">Régler l'heure permet de visualiser l'évolution de la lumière sur la journée.</p>
          </div>
        </div>
        <label class="slider-label-legend">Heure sélectionnée : <span data-label="time">12:00</span></label>
        <div class="slider-track" data-slider="time">
          <span class="value-pill" data-value-pill="time">12:00</span>
          <input type="range" min="0" max="23.5" step="0.5" data-input="time" />
        </div>
        <div class="slider-label"><span>00:00</span><span>23:30</span></div>
      </div>
    </section>
  `;
  mount.appendChild(container);

  const presetHost = container.querySelector('[data-role="presets"]');
  const presetButtons = new Map();
  PRESETS.forEach((preset) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "preset-chip";
    btn.textContent = preset.label;
    btn.dataset.preset = preset.label;
    btn.addEventListener("click", () => {
      store.setMany({ latDeg: preset.lat, lonDeg: preset.lon });
      onManualChange?.("preset");
      setActivePreset(preset.label);
    });
    presetHost.appendChild(btn);
    presetButtons.set(preset.label, { btn, preset });
  });

  const daySlider = container.querySelector('[data-input="day"]');
  const timeSlider = container.querySelector('[data-input="time"]');
  const dateLabel = container.querySelector('[data-label="date"]');
  const timeLabel = container.querySelector('[data-label="time"]');
  const dayValuePill = container.querySelector('[data-value-pill="day"]');
  const timeValuePill = container.querySelector('[data-value-pill="time"]');

  function setActivePreset(label) {
    container.dataset.activePreset = label || "";
    presetButtons.forEach(({ btn }, name) => {
      if (name === label) {
        btn.classList.add("is-active");
        btn.setAttribute("aria-pressed", "true");
      } else {
        btn.classList.remove("is-active");
        btn.setAttribute("aria-pressed", "false");
      }
    });
  }

  function positionValuePill(slider, pill) {
    if (!slider || !pill) return;
    const min = Number(slider.min);
    const max = Number(slider.max);
    const value = Number(slider.value);
    const percent = max - min === 0 ? 0 : (value - min) / (max - min);
    const clamped = Math.min(Math.max(percent * 100, 0), 100);
    pill.style.setProperty("--value-progress", `${clamped}%`);
    const track = slider.closest(".slider-track");
    if (track) {
      track.style.setProperty("--value-progress", `${clamped}%`);
      track.dataset.value = slider.value;
    }
  }

  function updateFromState(snapshot) {
    if (snapshot.dayOfYear !== undefined) {
      const dayValue = Number(snapshot.dayOfYear);
      if (Number(daySlider.value) !== dayValue) {
        daySlider.value = String(dayValue);
      }
      dateLabel.textContent = formatDayOfYear(dayValue);
      if (dayValuePill) {
        dayValuePill.textContent = formatDayOfYear(dayValue);
        positionValuePill(daySlider, dayValuePill);
      }
    }
    if (snapshot.localTimeHours !== undefined) {
      const timeValue = Number(snapshot.localTimeHours);
      if (Number(timeSlider.value) !== timeValue) {
        timeSlider.value = String(timeValue);
      }
      timeLabel.textContent = formatTime(timeValue);
      if (timeValuePill) {
        timeValuePill.textContent = formatTime(timeValue);
        positionValuePill(timeSlider, timeValuePill);
      }
    }

    if (snapshot.latDeg !== undefined && snapshot.lonDeg !== undefined) {
      const { latDeg, lonDeg } = snapshot;
      const active = PRESETS.find(
        (preset) =>
          Math.abs(preset.lat - Number(latDeg)) < 1e-3 &&
          Math.abs(preset.lon - Number(lonDeg)) < 1e-3
      );
      setActivePreset(active?.label || "");
    }
  }

  daySlider.addEventListener("input", () => {
    store.set("dayOfYear", Number(daySlider.value));
    onManualChange?.("day");
    if (dayValuePill) {
      dayValuePill.textContent = formatDayOfYear(Number(daySlider.value));
      positionValuePill(daySlider, dayValuePill);
    }
  });
  timeSlider.addEventListener("input", () => {
    store.set("localTimeHours", Number(timeSlider.value));
    onManualChange?.("time");
    if (timeValuePill) {
      timeValuePill.textContent = formatTime(Number(timeSlider.value));
      positionValuePill(timeSlider, timeValuePill);
    }
  });

  const unsubscribe = store.subscribe((_, snapshot) => {
    updateFromState(snapshot);
  });

  updateFromState(store.getAll());

  const handleResize = () => {
    positionValuePill(daySlider, dayValuePill);
    positionValuePill(timeSlider, timeValuePill);
  };
  window.addEventListener("resize", handleResize);

  return {
    destroy() {
      unsubscribe();
      mount.removeChild(container);
      window.removeEventListener("resize", handleResize);
    },
  };
}
