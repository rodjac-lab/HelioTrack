export function createRightPanelLayout({
  resultsView,
  eventsView,
  inputsSection,
  infoSection,
}) {
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
  closeButton.dataset.role = "right-panel-close";
  closeButton.setAttribute("aria-label", "Fermer le panneau latéral");
  closeButton.textContent = "✕ Fermer";

  mobileHeader.appendChild(mobileTitle);
  mobileHeader.appendChild(closeButton);

  const tabs = [
    {
      id: "results",
      label: "Résultats",
      element: resultsView.element,
      isDefault: true,
    },
    {
      id: "sun-events",
      label: "Événements",
      element: eventsView.element,
      isDefault: false,
    },
    {
      id: "inputs",
      label: "Paramètres",
      element: inputsSection,
      isDefault: false,
    },
    { id: "info", label: "Aide 3D", element: infoSection, isDefault: false },
  ];

  const nav = document.createElement("div");
  nav.className = "tabs-nav";
  const contentHost = document.createElement("div");
  contentHost.className = "tabs-content";

  function activate(tabId) {
    nav.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === tabId);
    });
    contentHost.querySelectorAll(".tab-panel").forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.tab === tabId);
    });
  }

  tabs.forEach((tab, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tab-btn";
    button.textContent = tab.label;
    button.dataset.tab = tab.id;
    if (tab.isDefault || index === 0) button.classList.add("active");
    button.addEventListener("click", () => activate(tab.id));
    nav.appendChild(button);

    const wrapper = document.createElement("div");
    wrapper.className = "tab-panel";
    if (tab.isDefault || index === 0) wrapper.classList.add("active");
    wrapper.dataset.tab = tab.id;
    wrapper.appendChild(tab.element);
    contentHost.appendChild(wrapper);
  });

  container.appendChild(mobileHeader);
  container.appendChild(nav);
  container.appendChild(contentHost);

  return {
    container,
    closeButton,
    destroy() {
      container.remove();
    },
  };
}
