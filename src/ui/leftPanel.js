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
      <h3>Paramètres rapides</h3>
      <div class="preset-buttons" data-role="presets"></div>
    </section>
    <section class="panel panel-compact">
      <h3>Jour de l'année</h3>
      <label class="slider-label-legend">Jour sélectionné : <span data-label="date">21 mar</span></label>
      <input type="range" min="1" max="365" step="1" data-input="day" />
      <div class="slider-label"><span>1 Jan</span><span>31 Déc</span></div>
    </section>
    <section class="panel panel-compact">
      <h3>Heure solaire</h3>
      <label class="slider-label-legend">Heure sélectionnée : <span data-label="time">12:00</span></label>
      <input type="range" min="0" max="23.5" step="0.5" data-input="time" />
      <div class="slider-label"><span>00:00</span><span>23:30</span></div>
    </section>
  `;
  mount.appendChild(container);

  const presetHost = container.querySelector('[data-role="presets"]');
  PRESETS.forEach((preset) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "preset-btn";
    btn.textContent = preset.label;
    btn.addEventListener("click", () => {
      store.setMany({ latDeg: preset.lat, lonDeg: preset.lon });
      onManualChange?.("preset");
    });
    presetHost.appendChild(btn);
  });

  const daySlider = container.querySelector('[data-input="day"]');
  const timeSlider = container.querySelector('[data-input="time"]');
  const dateLabel = container.querySelector('[data-label="date"]');
  const timeLabel = container.querySelector('[data-label="time"]');

  function updateFromState(snapshot) {
    if (snapshot.dayOfYear !== undefined) {
      const dayValue = Number(snapshot.dayOfYear);
      if (Number(daySlider.value) !== dayValue) {
        daySlider.value = String(dayValue);
      }
      dateLabel.textContent = formatDayOfYear(dayValue);
    }
    if (snapshot.localTimeHours !== undefined) {
      const timeValue = Number(snapshot.localTimeHours);
      if (Number(timeSlider.value) !== timeValue) {
        timeSlider.value = String(timeValue);
      }
      timeLabel.textContent = formatTime(timeValue);
    }
  }

  daySlider.addEventListener("input", () => {
    store.set("dayOfYear", Number(daySlider.value));
    onManualChange?.("day");
  });
  timeSlider.addEventListener("input", () => {
    store.set("localTimeHours", Number(timeSlider.value));
    onManualChange?.("time");
  });

  const unsubscribe = store.subscribe((_, snapshot) => {
    updateFromState(snapshot);
  });

  updateFromState(store.getAll());

  return {
    destroy() {
      unsubscribe();
      mount.removeChild(container);
    },
  };
}
