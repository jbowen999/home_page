// Practice Set 2, Problem 3: bottom-up matrix-chain DP. The table fills by
// interval length, so both halves of every split are ready when needed.
import {
  tex,
  pre,
  randInt,
  checkLength,
  firstError,
  grid,
  figure,
} from "../lib.js";

const CODE = [
  "MatrixChain(p):",
  "  r = length(p)-1",
  "  M = an r-by-r table",
  "  for i from 1 to r:",
  "    M[i,i] = 0",
  "  for length from 2 to r:",
  "    for i from 1 to r-length+1:",
  "      j = i+length-1",
  "      M[i,j] = infinity",
  "      for k from i to j-1:",
  "        q = M[i,k] + M[k+1,j] + p[i-1]*p[k]*p[j]",
  "        M[i,j] = min(M[i,j], q)",
  "  return M[1,r]",
];

const show = (x) => (x === Infinity ? "∞" : x);

// Optimal parenthesization from the recorded best splits (display only; the
// problem asks for the cost).
function parens(split, i, j) {
  if (i === j) return `A${i + 1}`;
  const k = split[i][j];
  return `(${parens(split, i, k)}${parens(split, k + 1, j)})`;
}

function trace({ p }) {
  const r = p.length - 1;
  const steps = [];
  const M = Array.from({ length: r }, () => Array(r).fill(null));
  const split = Array.from({ length: r }, () => Array(r).fill(null));
  let len = null;
  let cell = null; // [i, j]
  let k = null;
  let q = null;
  let tried = 0;
  let ready = 0; // every interval of length <= ready has its final cost

  const snap = (line, caption) =>
    steps.push({
      line,
      caption,
      M: M.map((row) => [...row]),
      cell: cell && [...cell],
      k,
      len,
      stats: [
        ["length", len ?? "—"],
        ["(i, j)", cell ? `(${cell[0] + 1}, ${cell[1] + 1})` : "—"],
        ["q", q ?? "—"],
        ["Splits tried / bound r³", `${tried} / ${r ** 3}`],
      ],
      invariant: ready
        ? `Every $M[i', j']$ with $j' - i' + 1 \\le ${ready}$ is the minimum cost of $A_{i'} \\cdots A_{j'}$.`
        : "No entries yet.",
    });

  snap(
    3,
    `r = ${r} matrices: ${p
      .slice(1)
      .map((_, i) => `A${i + 1} is ${p[i]}×${p[i + 1]}`)
      .join(", ")}.`
  );
  for (let i = 0; i < r; i++) M[i][i] = 0;
  ready = 1;
  snap(5, "M[i,i] = 0 for every i: a single matrix costs nothing.");

  for (len = 2; len <= r; len++) {
    ready = len - 1;
    for (let i = 0; i + len - 1 < r; i++) {
      const j = i + len - 1;
      cell = [i, j];
      k = null;
      q = null;
      M[i][j] = Infinity;
      snap(
        9,
        `length ${len}, i = ${i + 1}, j = ${j + 1}: M[${i + 1},${j + 1}] = ∞.`
      );

      for (k = i; k < j; k++) {
        tried += 1;
        const mult = p[i] * p[k + 1] * p[j + 1];
        q = M[i][k] + M[k + 1][j] + mult;
        snap(
          11,
          `k = ${k + 1}: q = M[${i + 1},${k + 1}] + M[${k + 2},${j + 1}] + ${p[i]}·${p[k + 1]}·${p[j + 1]} = ${M[i][k]} + ${M[k + 1][j]} + ${mult} = ${q}.`
        );
        const old = M[i][j];
        if (q < old) {
          M[i][j] = q;
          split[i][j] = k;
        }
        snap(
          12,
          q < old
            ? `${q} < ${show(old)}: M[${i + 1},${j + 1}] = ${q}, the best split so far.`
            : `${q} ≥ ${old}: keep M[${i + 1},${j + 1}] = ${old}.`
        );
      }
    }
  }

  cell = null;
  k = null;
  q = null;
  len = null;
  ready = r;
  snap(
    13,
    r === 1
      ? "Return M[1,1] = 0: one matrix needs no multiplication."
      : `Return M[1,${r}] = ${M[0][r - 1]}, achieved by ${parens(split, 0, r - 1)}.`
  );
  return steps;
}

function render(stage, step, { p }) {
  const r = p.length - 1;
  const [ci, cj] = step.cell ?? [];
  const k = step.k;
  const side = (x) => {
    if (step.cell === null) return "";
    if (x < ci || x > cj) return "is-dim";
    if (k === null) return "is-active";
    return x <= k ? "is-low" : "is-high";
  };

  const chain = grid([p.slice(1).map((_, x) => `${p[x]}×${p[x + 1]}`)], {
    colLabels: p.slice(1).map((_, x) => `A${x + 1}`),
    cellClass: (_, x) => side(x),
  });

  const labels = Array.from({ length: r }, (_, x) => String(x + 1));
  const table = grid(
    step.M.map((row, i) =>
      row.map((v, j) => (j < i || v === null ? null : show(v)))
    ),
    {
      corner: "i \\ j",
      rowLabels: labels,
      colLabels: labels,
      cellClass: (i, j) => {
        if (j < i) return "is-dim";
        if (step.cell === null) return i === 0 && j === r - 1 ? "is-good" : "";
        if (i === ci && j === cj) return "is-active";
        if (k !== null && i === ci && j === k) return "is-low";
        if (k !== null && i === k + 1 && j === cj) return "is-high";
        return "";
      },
    }
  );

  stage.innerHTML = `
    <div class="viz-figures">
      ${figure(`The chain, p = (${p.join(", ")})`, chain)}
    </div>
    <div class="viz-figures">
      ${figure("M[i, j] = minimum cost of A_i ⋯ A_j", table)}
    </div>
    <p class="viz-legend">
      <span class="viz-legend__item viz-legend__item--active">M[i, j] being filled</span>
      <span class="viz-legend__item viz-legend__item--low">left part, M[i, k]</span>
      <span class="viz-legend__item viz-legend__item--high">right part, M[k+1, j]</span>
    </p>`;
}

export default {
  id: "p2-3",
  set: "Practice Set 2",
  number: "3",
  title: "Matrix chains, bottom-up",

  description: tex`
    <p>Recall the matrix-chain multiplication problem from Lecture 4. The input is a dimension vector $(p_0, p_1, \dots, p_r)$ of positive integers, with $r \ge 1$. Matrix $A_i$ has dimensions $p_{i-1} \times p_i$. We want the minimum total multiplication cost over all parenthesizations of $A_1 A_2 \cdots A_r$. Throughout this problem, multiplying an $a \times b$ matrix by a $b \times c$ matrix costs $abc$ operations, using the classical algorithm rather than Problem 1.</p>
    <p>Let $M(i, j)$ be the minimum cost for $A_i \cdots A_j$. You may use the recurrence and optimal-subplans lemma proved in class:</p>
    $$\begin{aligned}
      M(i, i) &= 0,\\
      M(i, j) &= \min_{i \le k < j} \left\{ M(i, k) + M(k + 1, j) + p_{i-1} p_k p_j \right\} \qquad (i < j).
    \end{aligned}$$
    <p>Write an algorithm that evaluates this recurrence without using recursion and returns the minimum cost. It should take $O(r^3)$ time and $O(r^2)$ extra space.</p>
    <p>In your correctness argument, explain why every subproblem answer is available when your algorithm needs it. You need not re-prove the optimal-subplans lemma.</p>`,

  pseudocode: tex`
    <h3>Solution</h3>
    ${pre(CODE)}`,

  proof: tex`
    <h4>Correctness</h4>
    <div class="viz-claim">
      <span class="viz-claim__label">Claim</span>
      <p><code>MatrixChain(p)</code> returns the required minimum cost $M[1, r]$.</p>
    </div>
    <dl class="viz-steps">
      <dt>Availability</dt>
      <dd><p>The algorithm processes intervals in order of increasing length. For any split $i \le k < j$, both $[i, k]$ and $[k + 1, j]$ are strictly shorter than $[i, j]$, so their entries are already available.</p></dd>
      <dt>Base case</dt>
      <dd><p>We prove correctness by induction on interval length, starting with the correct zero costs for single matrices.</p></dd>
      <dt>Inductive step</dt>
      <dd><p>When computing $M[i, j]$, the earlier entries have the correct minimum costs by induction. The inner loop tries every allowed split and takes the minimum in the supplied recurrence.</p></dd>
      <dt>Conclusion</dt>
      <dd><p>Thus $M[i, j]$ is correct, and the algorithm returns the required minimum cost $M[1, r]$. <span class="viz-qed">∎</span></p></dd>
    </dl>

    <aside class="viz-note">
      <p><strong>Supplementary explanation.</strong></p>
      <p><strong>Efficiency.</strong> There are $O(r^2)$ intervals $[i, j]$. For each one, the algorithm considers at most $r - 1$ split positions, doing constant work per split. The total running time is therefore $O(r^3)$. The $r$-by-$r$ table uses $O(r^2)$ extra space.</p>
    </aside>`,

  variants: [
    {
      id: "main",
      label: "Bottom-up",
      code: CODE,
      fields: [
        {
          name: "p",
          label: "p (dimensions)",
          kind: "list",
          placeholder: "10, 20, 5, 30",
        },
      ],
      presets: [
        {
          label: "p = (10, 20, 5, 30): order matters, 2,500 vs 9,000",
          input: { p: [10, 20, 5, 30] },
        },
        {
          label: "p = (30, 35, 15, 5, 10, 20, 25): six matrices",
          input: { p: [30, 35, 15, 5, 10, 20, 25] },
        },
        {
          label: "p = (5, 8): r = 1, nothing to multiply",
          input: { p: [5, 8] },
        },
      ],
      random: () => ({
        p: Array.from({ length: randInt(4, 7) }, () => randInt(2, 30)),
      }),
      validate: ({ p }) =>
        firstError(
          checkLength(p, 2, 9, "p"),
          p.every((x) => x >= 1 && x <= 999)
            ? ""
            : "Dimensions must be positive integers up to 999."
        ),
      trace,
      render,
    },
  ],
};
