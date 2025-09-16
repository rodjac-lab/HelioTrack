export function initSmoke({ mount }) {
  const indicator = document.createElement("div");
  indicator.className = "smoke-test";
  indicator.style.display = "none";
  mount.appendChild(indicator);

  function show(ok, message) {
    indicator.textContent = message;
    indicator.className = ok ? "smoke-test" : "smoke-test error";
    indicator.style.display = "block";
    setTimeout(() => {
      indicator.style.display = "none";
    }, 2000);
  }

  function run(name, fn) {
    try {
      const result = fn();
      if (result) {
        show(true, `✓ ${name}: OK`);
        return true;
      }
      show(false, `✗ ${name}: ERREUR`);
      console.error(`Smoke test ${name} failed`);
      return false;
    } catch (error) {
      show(false, `✗ ${name}: ERREUR`);
      console.error(`Smoke test ${name} failed`, error);
      return false;
    }
  }

  return { run, show };
}
