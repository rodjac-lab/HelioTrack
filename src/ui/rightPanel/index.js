import { createResultsView, createSunEventsView } from "../results.js";
import { createInputsSection, createInfoSection } from "./sections.js";
import { createRightPanelLayout } from "./layout.js";
import { createDrawerController } from "./drawer.js";
import { createInputsBinder } from "./inputsBinder.js";

export function initRightPanel({ mount, store }) {
  const resultsView = createResultsView();
  const eventsView = createSunEventsView();
  const inputsSection = createInputsSection();
  const infoSection = createInfoSection();

  const layout = createRightPanelLayout({
    resultsView,
    eventsView,
    inputsSection,
    infoSection,
  });

  mount.appendChild(layout.container);

  const drawer = createDrawerController({
    mount,
    closeButton: layout.closeButton,
  });
  const binder = createInputsBinder({ section: inputsSection, store });

  const unsubscribe = store.subscribe((_, snapshot) => {
    binder.update(snapshot);
  });

  binder.update(store.getAll());

  return {
    updateResults: resultsView.update,
    updateSunEvents: eventsView.update,
    destroy() {
      unsubscribe();
      binder.destroy();
      drawer.destroy();
      layout.destroy();
    },
  };
}
