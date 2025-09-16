// Minimal global store (pub/sub) — prêt pour PR2+
const state = {};
const listeners = new Set();

export const store = {
  get: (k) => state[k],
  getAll: () => ({ ...state }),
  set: (k, v) => { state[k] = v; listeners.forEach(fn => fn({ key: k, value: v }, { ...state })); },
  subscribe: (fn) => (listeners.add(fn), () => listeners.delete(fn)),
};
