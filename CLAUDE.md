# CLAUDE.md

Static personal site (vanilla HTML/CSS/ES modules, no build step) for CS5610.
Served from `./src`. Run `npm run check` (Prettier + ESLint) before finishing.

## Problem Set Visualizer

The recurring task: the user drops a new CS5800 solutions PDF in `docs/` and
asks for a specific problem. Follow **docs/visualizer.md**: add one module
under `src/js/visualizer/problems/` (copy `_template.js`), register it in
`problems/index.js`, copy text verbatim from the PDF, choose 2–3 instructive
presets plus a random generator, and verify the trace against brute force.

Gotcha: problem text uses the `tex` template tag. Never tag it `html`,
because Prettier then strips LaTeX backslashes.
