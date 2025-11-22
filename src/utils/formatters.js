// Shared formatting utilities

export function formatTime(hours) {
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

export function formatDegrees(value) {
  return Number.isFinite(value) ? `${value.toFixed(1)}°` : "—";
}

export function formatIrradiance(value) {
  if (!Number.isFinite(value) || value <= 0) return "0 W/m²";
  return `${Math.round(value)} W/m²`;
}
