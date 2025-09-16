import { createResultsView, createSunEventsView } from "./results.js";

function createInputsSection() {
  const section = document.createElement("section");
  section.className = "panel";
  section.innerHTML = `
    <h3>Entrées</h3>
    <div class="form-field">
      <label for="input-lat">Latitude (°)</label>
      <input id="input-lat" type="number" min="-90" max="90" step="0.0001" />
    </div>
    <div class="form-field">
      <label for="input-lon">Longitude (°)</label>
      <input id="input-lon" type="number" min="-180" max="180" step="0.0001" />
    </div>
    <div class="form-field">
      <label for="input-orientation">Azimut façade principale (°)</label>
      <input id="input-orientation" type="number" min="0" max="360" step="1" />
      <small>0°=Nord • 90°=Est • 180°=Sud • 270°=Ouest</small>
    </div>
    <div class="form-field-inline">
      <label for="input-tz">Décalage fuseau (h)</label>
      <input id="input-tz" type="number" step="0.25" min="-12" max="12" />
    </div>
    <div class="form-field-checkbox">
      <input id="input-use-civil" type="checkbox" />
      <label for="input-use-civil">Afficher les heures en temps civil approx.</label>
    </div>
  `;
  return section;
}

function createInfoSection() {
  const section = document.createElement("section");
  section.className = "panel";
  section.innerHTML = `
    <h3>Contrôles 3D</h3>
    <p><strong>Souris :</strong> rotation de la vue</p>
    <p><strong>Molette :</strong> zoom avant/arrière</p>
    <p><strong>Clic droit :</strong> panoramique</p>
    <p><strong>Boutons :</strong> vues prédéfinies (dessus, profil, iso, libre)</p>
  `;
  return section;
}

export function initRightPanel({ mount, store }) {
  const resultsView = createResultsView();
  const eventsView = createSunEventsView();
  const inputsSection = createInputsSection();
  const infoSection = createInfoSection();

  const container = document.createElement("div");
  container.className = "right-panel";

  const mobileHeader = document.createElement("div");
  mobileHeader.className = "right-panel-mobile-header";
  const mobileTitle = document.createElement("span");
  mobileTitle.className = "right-panel-mobile-title";
  mobileTitle.textContent = "Résultats et paramètres";
  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "panel-right-close";
  closeButton.setAttribute("data-role", "right-panel-close");
  closeButton.setAttribute("aria-label", "Fermer le panneau latéral");
  closeButton.textContent = "✕ Fermer";
  mobileHeader.appendChild(mobileTitle);
  mobileHeader.appendChild(closeButton);

  const tabs = [
    { id: "results", label: "Results", element: resultsView.element },
    { id: "sun-events", label: "Sun events", element: eventsView.element },
    { id: "inputs", label: "Inputs", element: inputsSection },
    { id: "info", label: "Info", element: infoSection },
  ];

  const nav = document.createElement("div");
  nav.className = "tabs-nav";
  const contentHost = document.createElement("div");
  contentHost.className = "tabs-content";

  tabs.forEach((tab, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tab-btn";
    button.textContent = tab.label;
    button.dataset.tab = tab.id;
    if (index === 0) button.classList.add("active");
    button.addEventListener("click", () => activate(tab.id));
    nav.appendChild(button);

    const wrapper = document.createElement("div");
    wrapper.className = "tab-panel";
    if (index === 0) wrapper.classList.add("active");
    wrapper.dataset.tab = tab.id;
    wrapper.appendChild(tab.element);
    contentHost.appendChild(wrapper);
  });

  function activate(tabId) {
    nav.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === tabId);
    });
    contentHost.querySelectorAll(".tab-panel").forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.tab === tabId);
    });
  }

  container.appendChild(mobileHeader);
  container.appendChild(nav);
  container.appendChild(contentHost);
  mount.appendChild(container);

  const toggleButton = document.querySelector('[data-role="right-panel-toggle"]');
  const backdrop = document.getElementById("right-panel-backdrop");
  const mediaQuery = window.matchMedia("(max-width: 1200px)");

  let isDrawerOpen = false;

  function updateToggleLabel(isOpen) {
    if (!toggleButton) return;
    const openLabel = toggleButton.dataset.openLabel || toggleButton.textContent.trim();
    const closeLabel = toggleButton.dataset.closeLabel || openLabel;
    const icon = isOpen ? "✖" : "📊";
    const label = isOpen ? closeLabel : openLabel;
    toggleButton.textContent = `${icon} ${label}`;
  }

  function isDrawerMode() {
    return mediaQuery.matches;
  }

  function updateDrawerState(nextOpen) {
    isDrawerOpen = nextOpen;
    const drawerMode = isDrawerMode();
    const shouldDisplay = drawerMode && nextOpen;

    mount.classList.toggle("is-open", shouldDisplay);
    if (toggleButton) {
      toggleButton.setAttribute("aria-expanded", shouldDisplay ? "true" : "false");
    }
    updateToggleLabel(shouldDisplay);

    if (backdrop) {
      backdrop.classList.toggle("is-active", shouldDisplay);
      backdrop.setAttribute("aria-hidden", shouldDisplay ? "false" : "true");
    }
    document.body.classList.toggle("right-panel-open", shouldDisplay);

    if (drawerMode) {
      mount.setAttribute("aria-hidden", shouldDisplay ? "false" : "true");
    } else {
      mount.removeAttribute("aria-hidden");
    }
  }

  function closeDrawer() {
    updateDrawerState(false);
  }

  function toggleDrawer() {
    if (!isDrawerMode()) return;
    updateDrawerState(!isDrawerOpen);
  }

  toggleButton?.addEventListener("click", toggleDrawer);
  closeButton.addEventListener("click", closeDrawer);
  backdrop?.addEventListener("click", closeDrawer);

  function handleKeydown(event) {
    if (!isDrawerMode()) return;
    if (event.key === "Escape" && isDrawerOpen) {
      closeDrawer();
    }
  }

  function handleMediaChange() {
    if (!isDrawerMode()) {
      mount.classList.remove("is-open");
      if (backdrop) {
        backdrop.classList.remove("is-active");
        backdrop.setAttribute("aria-hidden", "true");
      }
      document.body.classList.remove("right-panel-open");
      mount.removeAttribute("aria-hidden");
      if (toggleButton) {
        toggleButton.setAttribute("aria-expanded", "false");
      }
      updateToggleLabel(false);
      return;
    }

    updateDrawerState(isDrawerOpen);
  }

  window.addEventListener("keydown", handleKeydown);
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener("change", handleMediaChange);
  } else if (mediaQuery.addListener) {
    mediaQuery.addListener(handleMediaChange);
  }

  updateDrawerState(false);
  handleMediaChange();

  const latInput = inputsSection.querySelector("#input-lat");
  const lonInput = inputsSection.querySelector("#input-lon");
  const orientationInput = inputsSection.querySelector("#input-orientation");
  const tzInput = inputsSection.querySelector("#input-tz");
  const civilCheckbox = inputsSection.querySelector("#input-use-civil");

  latInput.addEventListener("change", () => {
    const value = parseFloat(latInput.value);
    if (!Number.isNaN(value)) store.set("latDeg", value);
  });
  lonInput.addEventListener("change", () => {
    const value = parseFloat(lonInput.value);
    if (!Number.isNaN(value)) store.set("lonDeg", value);
  });
  orientationInput.addEventListener("change", () => {
    const value = parseFloat(orientationInput.value);
    if (!Number.isNaN(value)) store.set("buildingOrientationDeg", value);
  });
  tzInput.addEventListener("change", () => {
    const value = parseFloat(tzInput.value);
    if (!Number.isNaN(value)) store.set("timezoneOffsetHours", value);
  });
  civilCheckbox.addEventListener("change", () => {
    store.set("useCivilTime", civilCheckbox.checked);
  });

  function updateInputs(snapshot) {
    if (snapshot.latDeg !== undefined && latInput.value !== String(snapshot.latDeg)) {
      latInput.value = String(snapshot.latDeg);
    }
    if (snapshot.lonDeg !== undefined && lonInput.value !== String(snapshot.lonDeg)) {
      lonInput.value = String(snapshot.lonDeg);
    }
    if (snapshot.buildingOrientationDeg !== undefined && orientationInput.value !== String(snapshot.buildingOrientationDeg)) {
      orientationInput.value = String(snapshot.buildingOrientationDeg);
    }
    if (snapshot.timezoneOffsetHours !== undefined && tzInput.value !== String(snapshot.timezoneOffsetHours)) {
      tzInput.value = String(snapshot.timezoneOffsetHours);
    }
    if (snapshot.useCivilTime !== undefined) {
      civilCheckbox.checked = Boolean(snapshot.useCivilTime);
    }
  }

  updateInputs(store.getAll());
  const unsubscribe = store.subscribe((_, snapshot) => {
    updateInputs(snapshot);
  });

  return {
    updateResults: resultsView.update,
    updateSunEvents: eventsView.update,
    destroy() {
      unsubscribe();
      mount.removeChild(container);
      toggleButton?.removeEventListener("click", toggleDrawer);
      closeButton.removeEventListener("click", closeDrawer);
      backdrop?.removeEventListener("click", closeDrawer);
      window.removeEventListener("keydown", handleKeydown);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleMediaChange);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handleMediaChange);
      }
      if (backdrop) {
        backdrop.classList.remove("is-active");
        backdrop.setAttribute("aria-hidden", "true");
      }
      document.body.classList.remove("right-panel-open");
      mount.removeAttribute("aria-hidden");
      if (toggleButton) {
        toggleButton.setAttribute("aria-expanded", "false");
        updateToggleLabel(false);
      }
    },
  };
}
