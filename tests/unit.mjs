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

console.log("All unit checks passed");
