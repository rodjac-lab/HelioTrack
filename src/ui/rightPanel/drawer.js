function createToggleButton({ mount, centerHost, toolbarHost }) {
  if (!centerHost) return { button: null, wrapper: null };

  const wrapper = document.createElement("div");
  wrapper.className = "panel-right-toggle-wrapper";

  const button = document.createElement("button");
  button.type = "button";
  button.className = "panel-right-toggle";
  button.dataset.role = "right-panel-toggle";
  button.dataset.openLabel = "Afficher les résultats";
  button.dataset.closeLabel = "Masquer les résultats";
  button.setAttribute("aria-controls", mount.id || "right");
  button.setAttribute("aria-expanded", "false");
  button.textContent = "📊 Afficher les résultats";

  wrapper.appendChild(button);

  const referenceNode =
    toolbarHost && toolbarHost.parentElement === centerHost ? toolbarHost : centerHost.firstChild;
  centerHost.insertBefore(wrapper, referenceNode || null);

  return { button, wrapper };
}

function updateToggleLabel(button, isOpen) {
  if (!button) return;
  const openLabel = button.dataset.openLabel || button.textContent.trim();
  const closeLabel = button.dataset.closeLabel || openLabel;
  const icon = isOpen ? "✖" : "📊";
  const label = isOpen ? closeLabel : openLabel;
  button.textContent = `${icon} ${label}`;
}

export function createDrawerController({ mount, closeButton }) {
  const centerHost = document.getElementById("center");
  const toolbarHost = document.getElementById("toolbar");
  const backdrop = document.getElementById("right-panel-backdrop");
  const mediaQuery = window.matchMedia("(max-width: 1200px)");

  const { button: toggleButton, wrapper: toggleWrapper } = createToggleButton({
    mount,
    centerHost,
    toolbarHost,
  });

  let isDrawerOpen = false;

  function isDrawerMode() {
    return mediaQuery.matches;
  }

  function applyState(shouldOpen) {
    isDrawerOpen = shouldOpen;
    const drawerMode = isDrawerMode();
    const visible = drawerMode && shouldOpen;

    mount.classList.toggle("is-open", visible);
    if (toggleButton) {
      toggleButton.setAttribute("aria-expanded", visible ? "true" : "false");
    }
    updateToggleLabel(toggleButton, visible);

    if (backdrop) {
      backdrop.classList.toggle("is-active", visible);
      backdrop.setAttribute("aria-hidden", visible ? "false" : "true");
    }

    document.body.classList.toggle("right-panel-open", visible);

    if (drawerMode) {
      mount.setAttribute("aria-hidden", visible ? "false" : "true");
    } else {
      mount.removeAttribute("aria-hidden");
    }
  }

  function closeDrawer() {
    applyState(false);
  }

  function toggleDrawer() {
    if (!isDrawerMode()) return;
    applyState(!isDrawerOpen);
  }

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
      updateToggleLabel(toggleButton, false);
      return;
    }

    applyState(isDrawerOpen);
  }

  toggleButton?.addEventListener("click", toggleDrawer);
  closeButton.addEventListener("click", closeDrawer);
  backdrop?.addEventListener("click", closeDrawer);
  window.addEventListener("keydown", handleKeydown);
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener("change", handleMediaChange);
  } else if (mediaQuery.addListener) {
    mediaQuery.addListener(handleMediaChange);
  }

  applyState(false);
  handleMediaChange();

  return {
    close: closeDrawer,
    destroy() {
      toggleButton?.removeEventListener("click", toggleDrawer);
      closeButton.removeEventListener("click", closeDrawer);
      backdrop?.removeEventListener("click", closeDrawer);
      window.removeEventListener("keydown", handleKeydown);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleMediaChange);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handleMediaChange);
      }
      applyState(false);
      if (backdrop) {
        backdrop.classList.remove("is-active");
        backdrop.setAttribute("aria-hidden", "true");
      }
      document.body.classList.remove("right-panel-open");
      mount.removeAttribute("aria-hidden");
      if (toggleWrapper && toggleWrapper.parentElement) {
        toggleWrapper.parentElement.removeChild(toggleWrapper);
      }
    },
  };
}
