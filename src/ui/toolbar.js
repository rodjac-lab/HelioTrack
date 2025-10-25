export function initToolbar({ mount, onPresetChange, onAnimationCommand }) {
  const container = document.createElement("div");
  container.className = "toolbar";
  container.innerHTML = `
    <div class="toolbar-group">
      <span class="toolbar-title">Vues</span>
      <button type="button" class="toolbar-btn" data-view="top">🔍 Dessus</button>
      <button type="button" class="toolbar-btn" data-view="side">👁️ Profil</button>
      <button type="button" class="toolbar-btn" data-view="iso">🔍 Iso</button>
      <button type="button" class="toolbar-btn" data-view="free">🎮 Libre</button>
    </div>
    <div class="toolbar-group">
      <span class="toolbar-title">Animations</span>
      <button type="button" class="toolbar-btn" data-anim="day">▶️ Journée</button>
      <button type="button" class="toolbar-btn" data-anim="year">🗓️ Année</button>
      <button type="button" class="toolbar-btn" data-anim="stop">⏹️ Stop</button>
    </div>
  `;
  mount.appendChild(container);

  container.querySelectorAll("[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => {
      onPresetChange?.(btn.dataset.view);
    });
  });

  container.querySelectorAll("[data-anim]").forEach((btn) => {
    btn.addEventListener("click", () => {
      onAnimationCommand?.(btn.dataset.anim);
    });
  });
}
