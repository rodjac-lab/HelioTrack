import assert from "node:assert/strict";

const { formatDayOfYear } = await import("../src/ui/leftPanel.js");

assert.equal(formatDayOfYear(1), "1 janv.");
assert.equal(formatDayOfYear(60), "1 mars");
assert.equal(formatDayOfYear(172), "21 juin");
assert.equal(formatDayOfYear(0), "1 janv.");

const { createStore } = await import("../src/state/store.js");

const store = createStore();
let notifications = 0;
store.subscribe(() => {
  notifications += 1;
});

store.set("foo", 42);
store.set("foo", 42);
store.set("foo", 43);

assert.equal(notifications, 2, "store.set should ignore unchanged values");

const batchedStore = createStore();
const received = [];
batchedStore.subscribe((change) => {
  received.push(change);
});

batchedStore.setMany({ latDeg: 10, lonDeg: 20 });
batchedStore.setMany({ latDeg: 10 });

assert.equal(received.length, 1, "setMany should notify once for changes");
assert.deepEqual(received[0].keys, ["latDeg", "lonDeg"]);
assert.equal(batchedStore.get("latDeg"), 10);
assert.equal(batchedStore.get("lonDeg"), 20);

const { computeSunEvents } = await import("../src/logic/rules.js");

function approxEqual(actual, expected, tolerance, message) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${message} — expected ${expected}, got ${actual}`,
  );
}

const parisSolstice = computeSunEvents({
  dayOfYear: 172,
  latDeg: 48.8566,
  lonDeg: 2.3522,
});
approxEqual(parisSolstice.sunrise, 3.86, 0.05, "Paris sunrise should be close to 03:52 UTC");
approxEqual(parisSolstice.sunset, 19.83, 0.05, "Paris sunset should be close to 19:49 UTC");
approxEqual(parisSolstice.maxAltitude, 64.6, 0.3, "Paris max altitude should be around 64.6°");

const tromsoMidnightSun = computeSunEvents({
  dayOfYear: 172,
  latDeg: 69.6492,
  lonDeg: 18.9553,
});
assert.ok(
  Number.isNaN(tromsoMidnightSun.sunrise) && Number.isNaN(tromsoMidnightSun.sunset),
  "Midnight sun locations should not report sunrise/sunset",
);

class FakeVector3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  set(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  setFromSpherical(spherical) {
    this.x = spherical.radius;
    this.y = spherical.radius;
    this.z = spherical.radius;
    return this;
  }
}

class FakeSpherical {
  constructor() {
    this.radius = 1;
    this.theta = 0;
    this.phi = Math.PI / 2;
  }

  setFromVector3(vec) {
    this.radius = Math.max(Math.sqrt(vec.x ** 2 + vec.y ** 2 + vec.z ** 2), 1);
    this.theta = 0;
    this.phi = Math.PI / 2;
  }
}

const stubThree = {
  Spherical: FakeSpherical,
};

global.window = { PointerEvent: function PointerEvent() {} };

const { attachOrbitControls } = await import("../src/view3d/controls3d.js");

const domElement = {
  style: {},
  eventListeners: {},
  addEventListener(type, handler) {
    this.eventListeners[type] = handler;
  },
  removeEventListener(type, handler) {
    if (this.eventListeners[type] === handler) {
      delete this.eventListeners[type];
    }
  },
  setPointerCapture() {},
  releasePointerCapture() {},
};

const camera = {
  position: new FakeVector3(18, 18, 18),
  lookAt() {},
};

const controls = attachOrbitControls({ camera, domElement, three: stubThree });

assert.equal(domElement.style.touchAction, "none");
assert.equal(typeof domElement.eventListeners.pointerdown, "function");
assert.equal(typeof domElement.eventListeners.pointermove, "function");
assert.equal(typeof domElement.eventListeners.pointerup, "function");

domElement.eventListeners.pointerdown({
  pointerType: "touch",
  pointerId: 1,
  clientX: 0,
  clientY: 0,
  preventDefault() {},
});
domElement.eventListeners.pointermove({
  pointerType: "touch",
  pointerId: 1,
  clientX: 10,
  clientY: 5,
  preventDefault() {},
});
domElement.eventListeners.pointerup({
  pointerType: "touch",
  pointerId: 1,
  clientX: 10,
  clientY: 5,
});

controls.dispose();

assert.ok(!domElement.eventListeners.pointerdown, "Pointer handlers should be removed on dispose");

delete global.window;


console.log("All unit checks passed");
