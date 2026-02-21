// Script for changing the font size of the app with the buttons
(() => {
  // Constants for localStorage key, font size limits, step, and default value
  const KEY = "appBaseFontSize";
  const MIN = 12;
  const MAX = 20;
  const STEP = 8;
  const DEFAULT = 16;

  // Apply the font size from localStorage if it exists, otherwise use default
  function applySize(px) {
    document.documentElement.style.setProperty("--base-font-size", px + "px");
  }

  // Change the font size by a given delta, ensuring it stays within limits
  function change(delta) {
    // Get the current font size from CSS variable, or use default if not set
    const curr =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--base-font-size",
        ),
      ) || DEFAULT;
    // Calculate the next font size, clamping it between MIN and MAX
    const next = Math.min(MAX, Math.max(MIN, curr + delta));
    applySize(next);
    // Store the new font size in localStorage for persistence
    localStorage.setItem(KEY, String(next));
  }

  // On DOMContentLoaded, apply the stored font size or default, and set up event listeners for the buttons
  document.addEventListener("DOMContentLoaded", () => {
    applySize(DEFAULT);

    const inc = document.getElementById("increase-font");
    const dec = document.getElementById("decrease-font");
    const reset = document.getElementById("reset-font");

    if (inc) inc.addEventListener("click", () => change(STEP));
    if (dec) dec.addEventListener("click", () => change(-STEP));
    if (reset)
      reset.addEventListener("click", () => {
        applySize(DEFAULT);
        localStorage.setItem(KEY, String(DEFAULT));
      });
  });
})();
