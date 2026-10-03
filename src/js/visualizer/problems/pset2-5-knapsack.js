// Practice Set 2, Problem 5: 0/1 knapsack in O(nB). F[i, b] reads only row
// i - 1, which is what keeps each item to at most one copy.
import {
  tex,
  pre,
  randInt,
  checkLength,
  checkRange,
  firstError,
  grid,
  figure,
} from "../lib.js";

const CODE = [
  "Knapsack(w, v, B):",
  "  n = length(w)",
  "  F = a table indexed by 0..n and 0..B",
  "  for b from 0 to B:",
  "    F[0,b] = 0",
  "  for i from 1 to n:",
  "    for b from 0 to B:",
  "      F[i,b] = F[i-1,b]",
  "      if w[i] <= b:",
  "        F[i,b] = max(F[i,b], v[i] + F[i-1,b-w[i]])",
  "  chosen = an empty list",
  "  b = B",
  "  for i from n down to 1:",
  "    if F[i,b] > F[i-1,b]:",
  "      append i to chosen",
  "      b = b-w[i]",
  "  return (F[n,B], chosen)",
];

// Items are 1-based here, matching the pseudocode: w[i - 1] is item i.
function trace({ w, v, B }) {
  const n = w.length;
  const steps = [];
  const F = Array.from({ length: n + 1 }, () => Array(B + 1).fill(null));
  const path = []; // [i, b] cells visited by the traceback
  const chosen = [];
  let cell = null;
  let omit = null;
  let take = null;
  let filled = 0;

  const snap = (line, caption) =>
    steps.push({
      line,
      caption,
      F: F.map((row) => [...row]),
      cell,
      omit,
      take,
      path: path.map((p) => [...p]),
      chosen: [...chosen],
      stats: [
        ["(i, b)", cell ? `(${cell[0]}, ${cell[1]})` : "—"],
        ["Entries filled / (n+1)(B+1)", `${filled} / ${(n + 1) * (B + 1)}`],
        ["chosen", chosen.length ? chosen.join(", ") : "—"],
        ["F[n, B]", F[n][B] ?? "—"],
      ],
      invariant:
        "Each filled $F[i, b]$ is the maximum value using items $1, \\dots, i$ with total weight at most $b$.",
    });

  for (let b = 0; b <= B; b++) F[0][b] = 0;
  filled = B + 1;
  snap(5, `Row 0 is all zeros: with no items, nothing can be retained.`);

  for (let i = 1; i <= n; i++) {
    const wi = w[i - 1];
    const vi = v[i - 1];
    for (let b = 0; b <= B; b++) {
      cell = [i, b];
      omit = [i - 1, b];
      F[i][b] = F[i - 1][b];
      filled += 1;
      if (wi <= b) {
        take = [i - 1, b - wi];
        const withItem = vi + F[i - 1][b - wi];
        F[i][b] = Math.max(F[i][b], withItem);
        snap(
          10,
          `F[${i},${b}] = max(omit ${F[i - 1][b]}, take ${vi} + F[${i - 1},${b - wi}] = ${withItem}) = ${F[i][b]}.`
        );
      } else {
        take = null;
        snap(
          8,
          `Item ${i} (weight ${wi}) doesn't fit in budget ${b}: F[${i},${b}] = F[${i - 1},${b}] = ${F[i][b]}.`
        );
      }
    }
  }

  cell = omit = take = null;
  let b = B;
  path.push([n, b]);
  snap(
    12,
    `Table done: F[${n},${B}] = ${F[n][B]}. Trace back from (${n}, ${B}).`
  );
  for (let i = n; i >= 1; i--) {
    cell = [i, b];
    omit = [i - 1, b];
    if (F[i][b] > F[i - 1][b]) {
      chosen.push(i);
      b -= w[i - 1];
      path.push([i - 1, b]);
      snap(
        16,
        `F[${i},${cell[1]}] = ${F[i][cell[1]]} > F[${i - 1},${cell[1]}] = ${F[i - 1][cell[1]]}: item ${i} is needed. Take it; b = ${b}.`
      );
    } else {
      path.push([i - 1, b]);
      snap(
        14,
        `F[${i},${b}] = F[${i - 1},${b}] = ${F[i][b]}: item ${i} isn't needed. Skip it.`
      );
    }
  }
  cell = omit = null;
  const weight = chosen.reduce((sum, i) => sum + w[i - 1], 0);
  snap(
    17,
    `Return (${F[n][B]}, [${chosen.join(", ")}]): total weight ${weight} ≤ B = ${B}.`
  );
  return steps;
}

const same = (p, r, c) => p && p[0] === r && p[1] === c;

function render(stage, step, { w, v, B }) {
  const n = w.length;
  const items = grid([w, v], {
    rowLabels: ["w", "v"],
    colLabels: w.map((_, k) => `item ${k + 1}`),
    cellClass: (_, k) =>
      step.chosen.includes(k + 1)
        ? "is-good"
        : step.cell && step.cell[0] === k + 1
          ? "is-active"
          : "",
  });

  const table = grid(step.F, {
    corner: "i \\ b",
    rowLabels: Array.from({ length: n + 1 }, (_, i) => String(i)),
    colLabels: Array.from({ length: B + 1 }, (_, b) => String(b)),
    cellClass: (r, c) => {
      if (same(step.cell, r, c)) return "is-active";
      if (same(step.omit, r, c)) return "is-low";
      if (same(step.take, r, c)) return "is-high";
      if (step.path.some((p) => same(p, r, c))) return "is-good";
      return "";
    },
  });

  stage.innerHTML = `
    <div class="viz-figures">${figure(`Items, budget B = ${B}`, items)}</div>
    <div class="viz-figures">${figure("F[i, b] = best value from items 1..i within budget b", table)}</div>
    <p class="viz-legend">
      <span class="viz-legend__item viz-legend__item--active">F[i, b]</span>
      <span class="viz-legend__item viz-legend__item--low">omit: F[i−1, b]</span>
      <span class="viz-legend__item viz-legend__item--high">take: F[i−1, b−w[i]]</span>
      <span class="viz-legend__item viz-legend__item--good">traceback / chosen</span>
    </p>`;
}

function random() {
  const n = randInt(3, 5);
  const w = Array.from({ length: n }, () => randInt(1, 6));
  const v = Array.from({ length: n }, () => randInt(0, 10));
  // A budget below the total weight, so some item has to be left out.
  const total = w.reduce((s, x) => s + x, 0);
  return {
    w,
    v,
    B: randInt(Math.max(1, Math.ceil(total / 3)), Math.min(12, total - 1)),
  };
}

export default {
  id: "p2-5",
  set: "Practice Set 2",
  number: "5",
  title: "0/1 knapsack",

  description: tex`
    <p>A program will need $n \ge 1$ intermediate results again. Retaining result $i$ costs $w_i$ units of memory and saves $v_i$ units of recomputation. The weights $w_i$ are positive integers, the values $v_i$ are nonnegative integers, and the memory budget is an integer $B \ge 1$. Assume memory costs and recomputation savings are additive across the retained results. Each result must be retained in full or discarded.</p>
    <p>Choose a subset $S \subseteq \{1, \dots, n\}$ maximizing</p>
    $$\sum_{i \in S} v_i \qquad \text{subject to} \qquad \sum_{i \in S} w_i \le B.$$
    <p>Design an $O(nB)$-time algorithm that returns the maximum total value and a subset $S$ attaining it. Justify the correctness of any non-obvious key steps, such as the optimal-substructure property for a dynamic-programming algorithm.</p>`,

  pseudocode: tex`
    <h3>Solution</h3>
    <p>Let $F[i, b]$ be the maximum value using items $1, \dots, i$ with total weight at most $b$.</p>
    ${pre(CODE)}`,

  proof: tex`
    <h4>Correctness</h4>
    <div class="viz-claim">
      <span class="viz-claim__label">Optimal substructure</span>
      <p>Let $S$ be an optimal subset of items $1, \dots, i$ for budget $b$.</p>
    </div>
    <dl class="viz-steps">
      <dt>$i \notin S$</dt>
      <dd><p>Then $S$ must be optimal for $(i - 1, b)$: a better subset for that subproblem would also be feasible for $(i, b)$, contradicting optimality.</p></dd>
      <dt>$i \in S$</dt>
      <dd><p>Then $w_i \le b$, and $S \setminus \{i\}$ has weight at most $b - w_i$. This remainder must be optimal for $(i - 1, b - w_i)$. Otherwise, replacing it by a better subset of items $1, \dots, i - 1$ and adding $i$ gives total weight at most $(b - w_i) + w_i = b$ and strictly greater value, again a contradiction. <span class="viz-qed">∎</span></p></dd>
    </dl>

    <aside class="viz-note">
      <p><strong>Supplementary explanation.</strong></p>
      <p><strong>Filling the table.</strong> To compute $F[i, b]$, compare two choices:</p>
      <ul>
        <li><em>Omit item $i$.</em> The available items are $1, \dots, i - 1$, and the budget stays $b$. The best value for this choice is $F[i - 1, b]$.</li>
        <li><em>Take item $i$.</em> This is possible only if $w_i \le b$. After reserving $w_i$ units of budget for item $i$, choose the other items from $1, \dots, i - 1$ with budget $b - w_i$. Their best value is $F[i - 1, b - w_i]$, to which item $i$ adds $v_i$.</li>
      </ul>
      <p>Both choices respect the budget. The optimal-substructure argument shows that one of them attains the optimum, so the algorithm keeps the larger value. If item $i$ does not fit, only the first choice is available.</p>
      <p>Row 0 contains zeros because there are no items to choose from. The algorithm fills rows in increasing order of $i$, and each update reads only the preceding row. Thus, once row $i - 1$ is correct, the comparison above computes row $i$ correctly as well.</p>
      <p><strong>Recovering the subset.</strong> Start at $(n, B)$ and work backward. At state $(i, b)$, the value still needed is $F[i, b]$. Compare it with $F[i - 1, b]$, the best value attainable without item $i$:</p>
      <ul>
        <li>If $F[i, b] = F[i - 1, b]$, omitting $i$ still allows the same value. Skip it and continue at $(i - 1, b)$.</li>
        <li>If $F[i, b] > F[i - 1, b]$, omitting $i$ cannot attain the required value. Select $i$ and continue at $(i - 1, b - w_i)$. The table update guarantees that the value still needed is exactly $F[i - 1, b - w_i]$.</li>
      </ul>
      <p>Each step leaves enough budget to attain the remaining target value. The item index decreases, so no item is selected twice. At row 0 the remaining target is zero; the selected items therefore respect the original budget and have total value $F[n, B]$.</p>
      <p><strong>Why the update uses the previous row.</strong> The entry $F[i - 1, b - w_i]$ uses only items before $i$. Using $F[i, b - w_i]$ instead could select item $i$ there and then add it again, violating the requirement that each item be used at most once.</p>
      <p><strong>Efficiency.</strong> The table has $O(nB)$ entries, each computed in constant time. Traceback takes $O(n)$ additional time, so the total time is $O(nB)$. The table and the chosen subset use $O(nB)$ space.</p>
      <p>Computing the maximum value needs only the current and previous rows, so that task alone can use $O(B)$ space. However, the traceback above reads earlier rows to decide which items to select. The algorithm keeps the full table so those entries are still available.</p>
    </aside>`,

  variants: [
    {
      id: "main",
      label: "Table + traceback",
      code: CODE,
      fields: [
        {
          name: "w",
          label: "w (weights)",
          kind: "list",
          placeholder: "1, 3, 4, 5",
        },
        {
          name: "v",
          label: "v (values)",
          kind: "list",
          placeholder: "1, 4, 5, 7",
        },
        { name: "B", label: "B", kind: "int", placeholder: "7" },
      ],
      presets: [
        {
          label: "w = (1, 3, 4, 5), v = (1, 4, 5, 7), B = 7",
          input: { w: [1, 3, 4, 5], v: [1, 4, 5, 7], B: 7 },
        },
        {
          label: "Best value per unit first fails: take items 2 and 3, not 1",
          input: { w: [6, 5, 5], v: [7, 5, 5], B: 10 },
        },
        {
          label:
            "w = (2, 5), v = (3, 4), B = 6: reading row i would reuse item 1",
          input: { w: [2, 5], v: [3, 4], B: 6 },
        },
      ],
      random,
      validate: ({ w, v, B }) =>
        firstError(
          checkLength(w, 1, 6, "w"),
          w.length === v.length
            ? ""
            : "w and v need the same number of entries.",
          w.every((x) => x >= 1) ? "" : "Weights must be positive.",
          v.every((x) => x >= 0) ? "" : "Values must be nonnegative.",
          checkRange(B, 1, 15, "B")
        ),
      trace,
      render,
    },
  ],
};
