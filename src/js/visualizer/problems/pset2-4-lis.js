// Practice Set 2, Problem 4: longest strictly increasing subsequence in
// O(n^2) with L[i] = best length ending at i, then a prev-pointer traceback.
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
  "LIS(a):",
  "  n = length(a)",
  "  if n == 0: return (0, [])",
  "  L, prev = arrays of length n",
  "  best = 1",
  "  for i from 1 to n:",
  "    L[i] = 1; prev[i] = 0",
  "    for j from 1 to i-1:",
  "      if a[j] < a[i] and L[j]+1 > L[i]:",
  "        L[i] = L[j]+1",
  "        prev[i] = j",
  "    if L[i] > L[best]: best = i",
  "  sequence = an empty list",
  "  i = best",
  "  while i != 0:",
  "    append a[i] to sequence",
  "    i = prev[i]",
  "  reverse sequence",
  "  return (L[best], sequence)",
];

function trace({ a }) {
  const n = a.length;
  const steps = [];
  const L = Array(n).fill(null);
  const prev = Array(n).fill(null); // 0-based index, -1 for "0" (none)
  const picked = [];
  let best = 0;
  let i = null;
  let j = null;
  let tests = 0;
  let sequence = [];

  const snap = (line, caption) =>
    steps.push({
      line,
      caption,
      L: [...L],
      prev: [...prev],
      best,
      i,
      j,
      picked: [...picked],
      sequence: [...sequence],
      stats: [
        ["i", i === null ? "—" : i + 1],
        ["j", j === null ? "—" : j + 1],
        ["best (L[best])", `${best + 1} (${L[best] ?? "—"})`],
        ["Pairs tested / n(n−1)/2", `${tests} / ${(n * (n - 1)) / 2}`],
      ],
      invariant:
        i === null && L[0] === null
          ? "No entries yet."
          : "Each finished $L[i]$ is the length of a longest strictly increasing subsequence ending at index $i$.",
    });

  snap(5, `n = ${n}: L and prev are empty, best = 1.`);

  for (i = 0; i < n; i++) {
    L[i] = 1;
    prev[i] = -1;
    j = null;
    snap(
      7,
      `i = ${i + 1}, a[i] = ${a[i]}: start with the singleton, L[${i + 1}] = 1, prev[${i + 1}] = 0.`
    );
    for (j = 0; j < i; j++) {
      tests += 1;
      if (a[j] < a[i] && L[j] + 1 > L[i]) {
        L[i] = L[j] + 1;
        prev[i] = j;
        snap(
          11,
          `a[${j + 1}] = ${a[j]} < ${a[i]} and L[${j + 1}] + 1 = ${L[i]} beats the old value: L[${i + 1}] = ${L[i]}, prev[${i + 1}] = ${j + 1}.`
        );
      } else {
        snap(
          9,
          a[j] >= a[i]
            ? `a[${j + 1}] = ${a[j]} ≥ ${a[i]}: can't come before ${a[i]} in a strictly increasing subsequence.`
            : `a[${j + 1}] = ${a[j]} < ${a[i]}, but L[${j + 1}] + 1 = ${L[j] + 1} doesn't beat L[${i + 1}] = ${L[i]}.`
        );
      }
    }
    j = null;
    const improved = L[i] > L[best];
    if (improved) best = i;
    snap(
      12,
      improved
        ? `L[${i + 1}] = ${L[i]} is the longest so far: best = ${i + 1}.`
        : `L[${i + 1}] = ${L[i]} doesn't beat L[best] = ${L[best]}; best stays ${best + 1}.`
    );
  }

  i = null;
  snap(13, `Table done. Trace back from best = ${best + 1}.`);
  let at = best;
  while (at !== -1) {
    picked.push(at);
    sequence.push(a[at]);
    i = at;
    snap(
      16,
      `Append a[${at + 1}] = ${a[at]}; prev[${at + 1}] = ${prev[at] + 1}.`
    );
    at = prev[at];
  }
  i = null;
  sequence = [...sequence].reverse();
  snap(18, `Reverse: [${sequence.join(", ")}].`);
  snap(19, `Return (${L[best]}, [${sequence.join(", ")}]).`);
  return steps;
}

function render(stage, step, { a }) {
  const n = a.length;
  const show = (x, f) => (x === null ? null : f(x));
  const rows = [
    a,
    step.L.map((x) => show(x, String)),
    step.prev.map((x) => show(x, (p) => String(p + 1))),
  ];
  const table = grid(rows, {
    corner: "index",
    rowLabels: ["a", "L", "prev"],
    colLabels: Array.from({ length: n }, (_, x) => String(x + 1)),
    cellClass: (r, x) => {
      if (step.picked.includes(x)) return "is-good";
      if (x === step.i) return "is-active";
      if (x === step.j) return "is-compare";
      if (r === 1 && x === step.best && step.L[x] !== null) return "is-low";
      return "";
    },
  });

  const seq = step.sequence.length
    ? step.sequence.map((v) => `<li>${v}</li>`).join("")
    : "<li>empty</li>";

  stage.innerHTML = `
    <div class="viz-figures">${figure("a, with L[i] and prev[i] below each entry", table)}</div>
    <p class="viz-label">sequence</p>
    <ul class="viz-chips">${seq}</ul>
    <p class="viz-legend">
      <span class="viz-legend__item viz-legend__item--active">i</span>
      <span class="viz-legend__item viz-legend__item--compare">j being tested</span>
      <span class="viz-legend__item viz-legend__item--low">L[best]</span>
      <span class="viz-legend__item viz-legend__item--good">traced back</span>
    </p>`;
}

export default {
  id: "p2-4",
  set: "Practice Set 2",
  number: "4",
  title: "Longest increasing subsequence",

  description: tex`
    <p>Suppose we match lines that occur once in each of two versions of a file. List their new line numbers in old-file order. A longest increasing subsequence identifies the largest set of matches whose relative order is unchanged.</p>
    <p>The input is a sequence of numbers $a_1, a_2, \dots, a_n$, which may include equal values. A strictly increasing subsequence consists of indices</p>
    $$i_1 < i_2 < \cdots < i_k \qquad \text{such that} \qquad a_{i_1} < a_{i_2} < \cdots < a_{i_k}.$$
    <p>The selected entries need not be adjacent, but their original order must be preserved.</p>
    <p>Design an $O(n^2)$-time algorithm that returns the length of a longest strictly increasing subsequence and one subsequence attaining that length. Use $O(n)$ extra space. Justify the correctness of any non-obvious key steps, such as the optimal-substructure property for a dynamic-programming algorithm.</p>
    <p><strong>Hint.</strong> First consider the best increasing subsequence that ends at a specified index.</p>`,

  pseudocode: tex`
    <h3>Solution</h3>
    <p>Let $L[i]$ be the longest strictly increasing subsequence length ending at index $i$.</p>
    ${pre(CODE)}`,

  proof: tex`
    <h4>Correctness</h4>
    <div class="viz-claim">
      <span class="viz-claim__label">Optimal substructure</span>
      <p>Consider a longest increasing subsequence ending at index $i$. It is either the singleton $a_i$, or its next-to-last index is some $j < i$ with $a_j < a_i$. In the second case, removing $a_i$ leaves a longest increasing subsequence ending at $j$.</p>
    </div>
    <dl class="viz-steps">
      <dt>Suppose not</dt>
      <dd><p>To see why that prefix must be longest, suppose a longer increasing subsequence ended at $j$.</p></dd>
      <dt>Exchange</dt>
      <dd><p>We could replace the prefix by that subsequence and still append $a_i$: all its indices are at most $j < i$, and its last value is still $a_j < a_i$.</p></dd>
      <dt>Contradiction</dt>
      <dd><p>This would give a longer increasing subsequence ending at $i$, contradicting our choice of the original subsequence. <span class="viz-qed">∎</span></p></dd>
    </dl>

    <aside class="viz-note">
      <p><strong>Supplementary explanation.</strong></p>
      <p><strong>Why the endpoint matters.</strong> For $[1, 4, 2, 3]$, both $[1, 4]$ and $[1, 2]$ have length 2, but only $[1, 2]$ can be extended by the final 3. Knowing the length alone does not tell us which later entries can be appended. Fixing the endpoint $j$ also fixes the last value $a_j$, so every subsequence in that subproblem can be extended to exactly the same later entries.</p>
      <p><strong>Filling the table.</strong> The initial value $L[i] = 1$ accounts for the singleton $a_i$. The inner loop checks every earlier endpoint $j$ with $a_j < a_i$ and keeps the best extension. Since $j < i$, its answer $L[j]$ has already been computed. The optimal-substructure argument therefore proves the table correct by induction on $i$. Every nonempty subsequence has a final index, so choosing an index <code>best</code> with maximum $L[\mathit{best}]$ gives the overall optimum.</p>
      <p><strong>Recovering a subsequence.</strong> Whenever an extension improves $L[i]$, the algorithm records its endpoint $j$ in $\mathit{prev}[i]$. That pointer leads to a smaller index, a smaller value, and a stored length one less than $L[i]$. Starting at <code>best</code> and following the pointers therefore collects exactly $L[\mathit{best}]$ entries, ending at a singleton whose predecessor is zero. They are collected in reverse order; reversing the list gives an increasing subsequence of the required length.</p>
      <p><strong>Efficiency.</strong> There are $O(n^2)$ pairs $j < i$, and each test and update takes constant time. Traceback and reversal take $O(n)$ time, so the total time is $O(n^2)$. The two arrays and the output list each use $O(n)$ space.</p>
    </aside>`,

  variants: [
    {
      id: "main",
      label: "O(n²) DP",
      code: CODE,
      fields: [
        { name: "a", label: "a", kind: "list", placeholder: "1, 4, 2, 3" },
      ],
      presets: [
        {
          label: "[1, 4, 2, 3]: the endpoint matters",
          input: { a: [1, 4, 2, 3] },
        },
        {
          label:
            "[2, 5, 3, 7, 11, 8, 10, 13, 6]: new line numbers in old-file order",
          input: { a: [2, 5, 3, 7, 11, 8, 10, 13, 6] },
        },
        {
          label:
            "[3, 3, 1, 2, 2, 5, 4]: equal values don't count as increasing",
          input: { a: [3, 3, 1, 2, 2, 5, 4] },
        },
      ],
      random: () => ({
        a: Array.from({ length: randInt(6, 10) }, () => randInt(1, 12)),
      }),
      validate: ({ a }) => firstError(checkLength(a, 1, 12, "a")),
      trace,
      render,
    },
  ],
};
