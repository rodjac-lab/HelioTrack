export function initToolbar({ mount, onPresetChange, onAnimationCommand }) {
  const container = document.createElement("div");
  container.className = "toolbar";
  container.innerHTML = `
    <div class="toolbar-group">
      <span class="toolbar-title">Vues</span>
      <button type="button" class="toolbar-btn" data-view="top" aria-label="Vue de dessus">🔍 Dessus</button>
      <button type="button" class="toolbar-btn" data-view="side" aria-label="Vue de profil">👁️ Profil</button>
      <button type="button" class="toolbar-btn" data-view="iso" aria-label="Vue isométrique">🔍 Iso</button>
      <button type="button" class="toolbar-btn" data-view="free" aria-label="Vue libre">🎮 Libre</button>
    </div>
    <div class="toolbar-group">
      <span class="toolbar-title">Animations</span>
      <button type="button" class="toolbar-btn" data-anim="day" aria-label="Animer une journée">▶️ Journée</button>
      <button type="button" class="toolbar-btn" data-anim="year" aria-label="Animer une année">🗓️ Année</button>
      <button type="button" class="toolbar-btn" data-anim="stop" aria-label="Arrêter l'animation">⏹️ Stop</button>
    </div>
    <div class="toolbar-group">
      <span class="toolbar-title">Action</span>
      <button type="button" class="toolbar-btn" id="btn-install-panels" aria-label="Installer ou retirer les panneaux solaires">Installer Panneaux</button>
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

  const btnInstall = container.querySelector("#btn-install-panels");
  let panelsInstalled = false;

  if (btnInstall) {
    btnInstall.addEventListener("click", () => {
      container.dispatchEvent(
        new CustomEvent("install-panels", { bubbles: true }),
      );

      // Toggle button text
      panelsInstalled = !panelsInstalled;
      btnInstall.textContent = panelsInstalled ? "Retirer Panneaux" : "Installer Panneaux";
    });
  }
}
