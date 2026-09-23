// Entry point. Loaded from every page with <script type="module">.
// Keep this file thin: it wires modules to the DOM, the modules hold the logic.
import { initFeature } from "./feature.js";

function main() {
  const feature = document.querySelector(".feature");

  if (feature) {
    initFeature(feature);
  }
}

main();
