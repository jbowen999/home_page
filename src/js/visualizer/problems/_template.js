// Starting point for a new problem. Copy to psetN-M-short-name.js, fill in
// every TODO, then import it in index.js. Not imported anywhere as-is.
// The full contract and conventions are in docs/visualizer.md.
import {
  tex,
  pre,
  randInt,
  sampleDistinct,
  checkLength,
  firstError,
  arrayRow,
  tag,
} from "../lib.js";

// Pseudocode, copied from the solutions. The same lines feed the text pane's
// Pseudocode view and the mini listing next to the visualization, where
// step.line (1-based) picks the highlighted line.
const CODE = ["TODO(A):", "  for i from 1 to length(A):", "    visit A[i]"];

// Run the algorithm once and record a snapshot for every step. Snapshots must
// be self-contained copies: the player jumps backward and forward freely.
function trace({ A }) {
  const steps = [];
  let i = null;

  const snap = (line, caption) =>
    steps.push({
      line, // 1-based line in CODE, or null for none
      caption, // one sentence: what just happened and why
      i, // plus whatever render() needs
      stats: [["i", i === null ? "—" : i + 1]],
      invariant: "TODO: the loop invariant, may use $math$.",
    });

  for (i = 0; i < A.length; i++) snap(3, `Visit A[${i + 1}] = ${A[i]}.`);
  i = null;
  snap(null, "Done.");
  return steps;
}

// Draw one snapshot into the stage element. Called on every step.
function render(stage, step, { A }) {
  stage.innerHTML = arrayRow(A, {
    cellClass: (x) => (x === step.i ? "is-active" : ""),
    above: (x) => [x === step.i ? tag("i", "active") : ""],
  });
}

export default {
  id: "pN-M", // URL hash key: keep stable once published
  set: "Practice Set N", // dropdown group
  number: "M",
  title: "TODO: title from the PDF",

  // Three views for the text pane. HTML with $inline$ and $$display$$ math.
  description: tex`<p>TODO: problem statement.</p>`,
  pseudocode: tex`${pre(CODE)}`,
  // Proof layout: claim box, labeled steps, aligned derivations, ∎.
  proof: tex`
    <div class="viz-claim">
      <span class="viz-claim__label">Claim</span>
      <p>TODO: what the algorithm returns.</p>
    </div>
    <dl class="viz-steps">
      <dt>Base case</dt>
      <dd><p>TODO</p></dd>
      <dt>Inductive step</dt>
      <dd>$$\begin{aligned} x &= y && \text{(reason)} \end{aligned}$$</dd>
      <dt>Conclusion</dt>
      <dd><p>TODO <span class="viz-qed">∎</span></p></dd>
    </dl>`,

  // One entry per algorithm. Two or more shows a toggle in the viz pane.
  variants: [
    {
      id: "main",
      label: "Main",
      code: CODE,
      // kinds: "int", "list" (add more in FIELD_KINDS in app.js)
      fields: [{ name: "A", label: "A", kind: "list", placeholder: "3, 1, 2" }],
      presets: [
        { label: "[3, 1, 2]: TODO why this one", input: { A: [3, 1, 2] } },
      ],
      random: () => ({ A: sampleDistinct(randInt(4, 8), 1, 20) }),
      validate: ({ A }) => firstError(checkLength(A, 1, 12, "A")),
      trace,
      render,
    },
  ],
};
