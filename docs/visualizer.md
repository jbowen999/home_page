# Problem Set Visualizer

`src/problem-set-visualizer.html`: step-through visualizations of CS5800
problems. Dropdown 1 picks the problem, dropdown 2 switches the text pane
between **description / pseudocode / correctness proof**, and the bottom pane
plays the algorithm with its own controls.

## Adding a problem (the semester workflow)

1. The new solutions PDF goes in `docs/` (named `CS5800-Fall-2026-PsetN-solutions.pdf`).
2. Copy `src/js/visualizer/problems/_template.js` to
   `psetN-M-short-name.js` and fill it in. Keep the text **verbatim** from the
   PDF: statement → `description`, pseudocode (+ worked table) → `pseudocode`,
   correctness / running time / supplementary notes → `proof`.
3. Import it in `src/js/visualizer/problems/index.js` (array order = dropdown order).
4. Pick 2–3 presets that each teach something different (the PDF's own
   example, an edge case, a "worst case"), and write a `random()` generator
   that produces _interesting_ inputs, not just valid ones.
5. Check: `npm run check`, then open `#<id>/description/<variant>` and step
   through every preset.

Nothing outside the problem module and `index.js` should need to change. If it
does (e.g. a new input kind), extend the shared code rather than special-casing.

## Module contract

```js
export default {
  id: "p1-4",               // URL hash key, stable once published
  set: "Practice Set 1",    // <optgroup> in dropdown 1
  number: "4",
  title: "The lightest and heaviest coins",
  description, pseudocode, proof,   // HTML strings built with tex`...`
  variants: [{
    id, label,              // 2+ variants → a toggle in the viz pane
    code: [...lines],       // mini listing; step.line (1-based) highlights
    fields: [{ name, label, kind: "int" | "list", placeholder }],
    presets: [{ label, input }],
    random: () => input,
    validate: (input) => "" | "error message",
    trace: (input) => steps,          // precompute everything
    render: (stageEl, step, input) => void,
  }],
};
```

A **step** is a plain snapshot:
`{ line, caption, stats: [[label, value]], invariant, ...whatever render needs }`.
Traces precompute every step, so back/scrub/reset are free. Snapshots must
be copies, not live references.

## Conventions

- **Math:** `$inline$` and `$$display$$`, typeset by KaTeX (CDN). Captions and
  invariants are typeset too.
- **Use the `tex` tag, never `html`.** Prettier reformats `html`-tagged
  templates as markup and silently strips LaTeX backslashes.
- **Proof layout.** Proofs are structured, not pasted as paragraphs. Keep
  the PDF's wording, but split it into:
  - a boxed claim or invariant: `<div class="viz-claim"><span class="viz-claim__label">Claim</span><p>…</p></div>`
  - labeled steps: `<dl class="viz-steps"><dt>Base case</dt><dd><p>…</p></dd>…</dl>`.
    Use Base case / Hypothesis / Inductive step / Conclusion for induction, and
    Initialization / Maintenance / Termination for loop invariants.
  - multi-line derivations as `$$\begin{aligned} … &= … && \text{(reason)} \end{aligned}$$`,
    one reason per line
  - `<span class="viz-qed">∎</span>` at the end of the last step
  - worked-example tables from the PDF as `<table class="viz-table">`, not prose

  Use `<h4>` for sub-parts like "Correctness" and "Exact comparison count".
  See `pset1-4-extremes.js` for the full pattern.

- **Indices:** the PDFs are 1-based. Traces use 0-based arrays internally and
  display `i + 1` everywhere.
- **Colors carry meaning** across all problems (`visualizer.css` §1): yellow =
  active/being compared, blue = low/left, orange = high/right, green =
  good/finished, dim = out of scope.
- **Shared drawing:** `arrayRow()` and `tag()` in `lib.js` cover arrays. Add a
  new primitive to `lib.js` + `visualizer.css` §6 when a problem needs one
  (graphs, matrices, DP tables) so later problems can reuse it.
- **Verify traces** against brute force for many random inputs before trusting
  the animation (e.g. the pair count, the comparison bound).

## Files

```
src/problem-set-visualizer.html   page shell (static markup, data-viz hooks)
src/css/visualizer.css            dark theme + all viz styles
src/js/visualizer/app.js          dropdowns, text pane, player UI, hash, keys
src/js/visualizer/player.js       generic step player (play/pause/speed/seek)
src/js/visualizer/lib.js          tex, pre, random, validation, arrayRow, tag
src/js/visualizer/problems/       one module per problem + index.js registry
```

URL hash format: `#<problem>/<view>/<variant>`, e.g. `#p1-5/proof/count`.
