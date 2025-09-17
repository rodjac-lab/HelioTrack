function parseNumber(value) {
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export function createInputsBinder({ section, store }) {
  const latInput = section.querySelector("#input-lat");
  const lonInput = section.querySelector("#input-lon");
  const orientationInput = section.querySelector("#input-orientation");
  const tzInput = section.querySelector("#input-tz");
  const civilCheckbox = section.querySelector("#input-use-civil");

  function handleNumberChange(input, key) {
    const value = parseNumber(input.value);
    if (value === null) return;
    store.set(key, value);
  }

  function handleCheckboxChange() {
    store.set("useCivilTime", civilCheckbox.checked);
  }

  const listeners = [
    [latInput, "change", () => handleNumberChange(latInput, "latDeg")],
    [lonInput, "change", () => handleNumberChange(lonInput, "lonDeg")],
    [orientationInput, "change", () => handleNumberChange(orientationInput, "buildingOrientationDeg")],
    [tzInput, "change", () => handleNumberChange(tzInput, "timezoneOffsetHours")],
    [civilCheckbox, "change", handleCheckboxChange],
  ];

  listeners.forEach(([element, event, handler]) => {
    element?.addEventListener(event, handler);
  });

  function syncValue(input, next) {
    if (next === undefined) return;
    if (input.value !== String(next)) {
      input.value = String(next);
    }
  }

  function update(snapshot) {
    syncValue(latInput, snapshot.latDeg);
    syncValue(lonInput, snapshot.lonDeg);
    syncValue(orientationInput, snapshot.buildingOrientationDeg);
    syncValue(tzInput, snapshot.timezoneOffsetHours);
    if (snapshot.useCivilTime !== undefined) {
      civilCheckbox.checked = Boolean(snapshot.useCivilTime);
    }
  }

  return {
    update,
    destroy() {
      listeners.forEach(([element, event, handler]) => {
        element?.removeEventListener(event, handler);
      });
    },
  };
}
