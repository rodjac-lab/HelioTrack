export function initToolbar({ mount, onPresetChange, onAnimationCommand, onToggleRightPanel }) {
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
    <div class="toolbar-group toolbar-mobile-only">
      <button
        type="button"
        class="toolbar-btn"
        data-role="toggle-right"
        aria-expanded="false"
        aria-label="Afficher les onglets de résultats"
      >
        📊 Onglets
      </button>
    </div>
    <div class="toolbar-group toolbar-info">
      <span class="toolbar-title">Caméra</span>
      <span class="orbit-info" data-role="orbit-info">—</span>
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

  const orbitInfoEl = container.querySelector('[data-role="orbit-info"]');
  const toggleRightBtn = container.querySelector('[data-role="toggle-right"]');

  if (toggleRightBtn) {
    toggleRightBtn.addEventListener("click", () => {
      onToggleRightPanel?.();
    });
  }

  return {
    setOrbitInfo(text) {
      orbitInfoEl.textContent = text;
    },
    setRightPanelOpen(isOpen) {
      if (!toggleRightBtn) return;
      toggleRightBtn.classList.toggle("is-active", Boolean(isOpen));
      toggleRightBtn.setAttribute("aria-expanded", String(Boolean(isOpen)));
      toggleRightBtn.setAttribute(
        "aria-label",
        Boolean(isOpen) ? "Masquer les onglets de résultats" : "Afficher les onglets de résultats"
      );
    },
  };
}
