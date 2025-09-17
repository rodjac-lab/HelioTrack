export function createViewerOverlays({ container }) {
  const hint = document.createElement("div");
  hint.className = "hint-pan";
  hint.textContent = "🖱️ Clic gauche = orbite • Clic droit = pan";
  container.appendChild(hint);

  const legend = document.createElement("div");
  legend.className = "seasonal-legend";
  legend.innerHTML = `
    <div class="legend-item"><div class="legend-color" style="background:#ff4444"></div><span>Solstice été (21 juin)</span></div>
    <div class="legend-item"><div class="legend-color" style="background:#4444ff"></div><span>Solstice hiver (21 déc)</span></div>
    <div class="legend-item"><div class="legend-color" style="background:#44ff44"></div><span>Équinoxes (21 mar/sep)</span></div>
  `;
  container.appendChild(legend);

  return {
    hint,
    legend,
    dispose() {
      legend.remove();
      hint.remove();
    },
  };
}
