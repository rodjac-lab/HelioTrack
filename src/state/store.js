// Minimal global store (pub/sub) — prêt pour PR2+
export function createStore(initial = {}) {
  const state = { ...initial };
  const listeners = new Set();

  function notify(change) {
    const snapshot = { ...state };
    listeners.forEach((fn) => fn(change, snapshot));
  }

  return {
    get: (k) => state[k],
    getAll: () => ({ ...state }),
    set: (k, v) => {
      if (Object.is(state[k], v)) return;
      state[k] = v;
      notify({ key: k, value: v });
    },
    setMany: (patch) => {
      const entries = Object.entries(patch || {});
      if (!entries.length) return;

      const changed = [];
      for (const [key, value] of entries) {
        if (Object.is(state[key], value)) continue;
        state[key] = value;
        changed.push([key, value]);
      }

      if (!changed.length) return;

      const [lastKey, lastValue] = changed[changed.length - 1];
      notify({
        key: lastKey,
        value: lastValue,
        keys: changed.map(([key]) => key),
        values: Object.fromEntries(changed),
      });
    },
    subscribe: (fn) => (listeners.add(fn), () => listeners.delete(fn)),
  };
}

export const store = createStore();
