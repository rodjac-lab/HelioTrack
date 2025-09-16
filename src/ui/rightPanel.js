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

export function initRightPanel({ mount, store, onOpenChange }) {
  mount.setAttribute("role", "complementary");
  mount.setAttribute("aria-label", "Panneau de données solaires");

  const resultsView = createResultsView();
  const eventsView = createSunEventsView();
  const inputsSection = createInputsSection();
  const infoSection = createInfoSection();

  const container = document.createElement("div");
  container.className = "right-panel";

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

  container.appendChild(nav);
  container.appendChild(contentHost);
  mount.appendChild(container);

  const backdrop = document.createElement("div");
  backdrop.className = "panel-right-backdrop";
  document.body.appendChild(backdrop);

  const drawerMedia = window.matchMedia?.("(max-width: 1200px)");
  let drawerOpen = false;

  function updateAria() {
    mount.setAttribute("aria-expanded", drawerOpen ? "true" : "false");
    if (drawerMedia?.matches) {
      mount.setAttribute("aria-hidden", drawerOpen ? "false" : "true");
    } else {
      mount.removeAttribute("aria-hidden");
    }
  }

  function notifyOpenChange(nextOpen) {
    if (drawerOpen === nextOpen) {
      updateAria();
      return;
    }
    drawerOpen = nextOpen;
    updateAria();
    onOpenChange?.(drawerOpen);
  }

  function openDrawer({ focusFirst = false } = {}) {
    if (!drawerMedia?.matches) return;
    if (drawerOpen) return;
    mount.classList.add("open");
    backdrop.classList.add("active");
    notifyOpenChange(true);
    if (focusFirst) {
      const firstTab = nav.querySelector(".tab-btn");
      firstTab?.focus({ preventScroll: true });
    }
  }

  function closeDrawer({ silent = false } = {}) {
    mount.classList.remove("open");
    backdrop.classList.remove("active");
    if (!drawerOpen) {
      updateAria();
      return;
    }
    if (silent) {
      drawerOpen = false;
      updateAria();
    } else {
      notifyOpenChange(false);
    }
  }

  function toggleDrawer() {
    if (!drawerMedia?.matches) return;
    if (drawerOpen) closeDrawer();
    else openDrawer({ focusFirst: true });
  }

  function handleMediaChange(event) {
    const matches = event?.matches ?? drawerMedia?.matches;
    if (!matches) {
      mount.classList.remove("open");
      backdrop.classList.remove("active");
      if (drawerOpen) {
        notifyOpenChange(false);
      } else {
        updateAria();
      }
    } else {
      updateAria();
    }
  }

  handleMediaChange();
  if (drawerMedia?.addEventListener) {
    drawerMedia.addEventListener("change", handleMediaChange);
  } else if (drawerMedia?.addListener) {
    drawerMedia.addListener(handleMediaChange);
  }

  const onBackdropClick = () => closeDrawer();
  backdrop.addEventListener("click", onBackdropClick);

  function handleKeydown(event) {
    if (event.key === "Escape" && drawerMedia?.matches && drawerOpen) {
      event.preventDefault();
      closeDrawer();
    }
  }

  mount.addEventListener("keydown", handleKeydown);

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
    open: () => openDrawer({ focusFirst: true }),
    close: () => closeDrawer(),
    toggle: () => toggleDrawer(),
    isOpen: () => drawerOpen,
    destroy() {
      unsubscribe();
      backdrop.removeEventListener("click", onBackdropClick);
      mount.removeEventListener("keydown", handleKeydown);
      if (drawerMedia?.removeEventListener) {
        drawerMedia.removeEventListener("change", handleMediaChange);
      } else if (drawerMedia?.removeListener) {
        drawerMedia.removeListener(handleMediaChange);
      }
      backdrop.remove();
      mount.removeChild(container);
    },
  };
}
