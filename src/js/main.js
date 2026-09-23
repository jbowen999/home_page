// Entry point. Loaded from every page with <script type="module">.
// Keep this file thin: it wires modules to the DOM, the modules hold the logic.
import { initFeature } from "./feature.js";

async function main() {
  const feature = document.querySelector(".feature");
  const visualizer = document.querySelector(".visualizer");

  if (feature) {
    initFeature(feature);
  }

  // Only the visualizer page pays for the visualizer's modules.
  if (visualizer) {
    const { initVisualizer } = await import("./visualizer/app.js");
    initVisualizer(visualizer);
  }
}

main();
