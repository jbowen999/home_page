// Practice Set 1, Problem 4: find the lightest and heaviest of n coins in at
// most ceil(3n/2) - 2 comparisons. Variant (a) halves recursively for n = 2^r;
// variant (b) processes coins in pairs for any n.
import {
  tex,
  pre,
  randInt,
  pick,
  sampleDistinct,
  checkLength,
  checkDistinct,
  firstError,
  arrayRow,
  tag,
} from "../lib.js";

const CODE_A = [
  "ExtremesPowerOfTwo(A):",
  "  n = length(A)",
  "  if n == 1: return (A[1], A[1])",
  "  if n == 2:",
  "    if A[1] < A[2]: return (A[1], A[2])",
  "    return (A[2], A[1])",
  "  m = n / 2",
  "  (low1, high1) = ExtremesPowerOfTwo(A[1..m])",
  "  (low2, high2) = ExtremesPowerOfTwo(A[m+1..n])",
  "  return (min(low1, low2), max(high1, high2))",
];

const CODE_B = [
  "Extremes(A):",
  "  n = length(A)                // n >= 1",
  "  if n is odd:",
  "    low = A[1]; high = A[1]; i = 2",
  "  else:",
  "    (low, high) = ExtremesPowerOfTwo(A[1..2]); i = 3",
  "  while i < n:",
  "    (small, large) = ExtremesPowerOfTwo(A[i..i+1])",
  "    low = min(low, small); high = max(high, large)",
  "    i = i + 2",
  "  return (low, high)",
];

const coin = (A, i) => `coin ${i + 1} (${A[i]})`;
const range = (l, r) => `A[${l + 1}..${r + 1}]`;

// (a) Recursive halving ------------------------------------------------------

function traceHalving({ A }) {
  const n = A.length;
  const steps = [];
  const nodes = [];
  let comps = 0;
  let active = null;
  let compare = null;

  const snap = (line, caption) =>
    steps.push({
      line,
      caption,
      nodes: nodes.map((node) => ({ ...node })),
      active,
      compare,
      stats: [
        ["Comparisons", comps],
        ["3n/2 − 2", n === 1 ? 0 : (3 * n) / 2 - 2],
        ["n", n],
      ],
      invariant:
        "Every finished box holds the lightest and heaviest coin of its range.",
    });

  function solve(l, r, depth) {
    const node = { l, r, depth, low: null, high: null, done: false };
    const id = nodes.push(node) - 1;
    const size = r - l + 1;
    active = id;
    compare = null;
    snap(1, `Call ExtremesPowerOfTwo(${range(l, r)}), n = ${size}.`);

    if (size === 1) {
      node.low = node.high = l;
      node.done = true;
      snap(3, "One coin is both the lightest and the heaviest: 0 comparisons.");
      return node;
    }

    if (size === 2) {
      comps += 1;
      compare = [l, r];
      const lighterFirst = A[l] < A[r];
      [node.low, node.high] = lighterFirst ? [l, r] : [r, l];
      node.done = true;
      snap(
        lighterFirst ? 5 : 6,
        `Weigh ${A[l]} against ${A[r]}: return (low, high) = (${A[node.low]}, ${A[node.high]}).`
      );
      return node;
    }

    const m = l + size / 2 - 1;
    snap(
      7,
      `m = ${size / 2}: split into ${range(l, m)} and ${range(m + 1, r)}.`
    );

    const left = solve(l, m, depth + 1);
    active = id;
    compare = null;
    snap(
      8,
      `Left half returned (low1, high1) = (${A[left.low]}, ${A[left.high]}).`
    );

    const right = solve(m + 1, r, depth + 1);
    active = id;
    compare = null;
    snap(
      9,
      `Right half returned (low2, high2) = (${A[right.low]}, ${A[right.high]}).`
    );

    comps += 1;
    compare = [left.low, right.low];
    node.low = A[left.low] < A[right.low] ? left.low : right.low;
    snap(
      10,
      `min(${A[left.low]}, ${A[right.low]}) = ${A[node.low]}: one comparison.`
    );

    comps += 1;
    compare = [left.high, right.high];
    node.high = A[left.high] > A[right.high] ? left.high : right.high;
    node.done = true;
    snap(
      10,
      `max(${A[left.high]}, ${A[right.high]}) = ${A[node.high]}. ${range(l, r)} returns (${A[node.low]}, ${A[node.high]}).`
    );
    return node;
  }

  const root = solve(0, n - 1, 0);
  active = null;
  compare = null;
  snap(
    null,
    `Done: lightest ${coin(A, root.low)}, heaviest ${coin(A, root.high)}, using ${comps} comparisons.`
  );
  return steps;
}

function renderHalving(stage, step, { A }) {
  const node = step.active === null ? null : step.nodes[step.active];
  const compare = step.compare ?? [];
  const root = step.nodes[0];

  const cells = arrayRow(A, {
    shape: "coin",
    cellClass: (i) =>
      [
        node && (i < node.l || i > node.r) ? "is-dim" : "",
        compare.includes(i) ? "is-compare" : "",
      ].join(" "),
    above: (i) =>
      root?.done
        ? [
            i === root.low ? tag("low", "low") : "",
            i === root.high ? tag("high", "high") : "",
          ]
        : [],
  });

  const boxes = step.nodes
    .map((nd, id) => {
      const state =
        id === step.active ? "is-active" : nd.done ? "is-done" : "is-waiting";
      const result = nd.done ? `(${A[nd.low]}, ${A[nd.high]})` : "…";
      return `
        <div class="viz-node ${state}" style="grid-column: ${nd.l + 1} / ${nd.r + 2}; grid-row: ${nd.depth + 1}">
          <span class="viz-node__label">${range(nd.l, nd.r)}</span>
          <span class="viz-node__value">${result}</span>
        </div>`;
    })
    .join("");

  stage.innerHTML = `
    <p class="viz-label">Coins (weights hidden from the algorithm; it only sees comparisons)</p>
    ${cells}
    <p class="viz-label">Recursion tree: (low, high) per call</p>
    <div class="viz-tree" style="grid-template-columns: repeat(${A.length}, minmax(0, 1fr))">${boxes}</div>`;
}

// (b) Pairs ------------------------------------------------------------------

function tracePairs({ A }) {
  const n = A.length;
  const steps = [];
  const bound = Math.max(0, Math.ceil((3 * n) / 2) - 2);
  let low = null;
  let high = null;
  let seen = 0; // coins 1..seen have been absorbed into (low, high)
  let comps = 0;

  const snap = (line, caption, extra = {}) =>
    steps.push({
      line,
      caption,
      low,
      high,
      seen,
      pair: null,
      compare: null,
      small: null,
      large: null,
      ...extra,
      stats: [
        ["Comparisons", comps],
        ["Bound ⌈3n/2⌉ − 2", bound],
        ["n", n],
      ],
      invariant: seen
        ? `low and high are the lightest and heaviest of ${seen === 1 ? "coin 1" : `coins 1..${seen}`}.`
        : "No coins processed yet.",
    });

  snap(2, `n = ${n}.`);

  if (n % 2 === 1) {
    snap(3, `n = ${n} is odd.`);
    low = high = 0;
    seen = 1;
    snap(
      4,
      `${coin(A, 0)} starts as both low and high, with no weighing. i = 2.`
    );
  } else {
    snap(5, `n = ${n} is even.`);
    comps += 1;
    [low, high] = A[0] < A[1] ? [0, 1] : [1, 0];
    seen = 2;
    snap(
      6,
      `Weigh coin 1 against coin 2: low = ${A[low]}, high = ${A[high]}. i = 3.`,
      {
        compare: [0, 1],
      }
    );
  }

  for (let i = seen; i + 1 < n; i += 2) {
    const pair = [i, i + 1];
    snap(
      7,
      `i = ${i + 1} < n = ${n}: next pair is coins ${i + 1} and ${i + 2}.`,
      {
        pair,
      }
    );

    comps += 1;
    const [small, large] = A[i] < A[i + 1] ? [i, i + 1] : [i + 1, i];
    snap(8, `Weigh the pair: small = ${A[small]}, large = ${A[large]}.`, {
      pair,
      compare: pair,
      small,
      large,
    });

    comps += 1;
    const oldLow = low;
    if (A[small] < A[low]) low = small;
    snap(
      9,
      `Weigh small ${A[small]} against low ${A[oldLow]}: low = ${A[low]}. The large coin can't be the lightest, so it's skipped.`,
      { pair, compare: [small, oldLow], small, large }
    );

    comps += 1;
    const oldHigh = high;
    if (A[large] > A[high]) high = large;
    seen = i + 2;
    snap(
      9,
      `Weigh large ${A[large]} against high ${A[oldHigh]}: high = ${A[high]}. That's 3 comparisons for this pair.`,
      { pair, compare: [large, oldHigh], small, large }
    );
  }

  snap(7, `i = ${seen + 1} ≥ n = ${n}: the loop ends.`);
  snap(
    11,
    `Return (low, high) = (${A[low]}, ${A[high]}) after ${comps} comparisons (bound ${bound}).`
  );
  return steps;
}

function renderPairs(stage, step, { A }) {
  const pair = step.pair ?? [];
  const compare = step.compare ?? [];

  const cells = arrayRow(A, {
    shape: "coin",
    cellClass: (i) =>
      [
        i >= step.seen && !pair.includes(i) ? "is-dim" : "",
        pair.includes(i) ? "is-active" : "",
        compare.includes(i) ? "is-compare" : "",
      ].join(" "),
    above: (i) => [
      i === step.low ? tag("low", "low") : "",
      i === step.high ? tag("high", "high") : "",
    ],
    below: (i) => [
      i === step.small ? tag("small", "active") : "",
      i === step.large ? tag("large", "active") : "",
    ],
  });

  stage.innerHTML = `
    <p class="viz-label">Coins (weights hidden from the algorithm; it only sees comparisons)</p>
    ${cells}
    <p class="viz-legend">
      <span class="viz-legend__item viz-legend__item--compare">on the balance</span>
      <span class="viz-legend__item viz-legend__item--active">current pair</span>
      <span class="viz-legend__item viz-legend__item--dim">not yet seen</span>
    </p>`;
}

// Module ---------------------------------------------------------------------

function randomPowerOfTwo() {
  const n = pick([2, 4, 8, 8, 16]);
  return { A: sampleDistinct(n, 1, 40) };
}

export default {
  id: "p1-4",
  set: "Practice Set 1",
  number: "4",
  title: "The lightest and heaviest coins",

  description: tex`
    <p>Alice and Bob have $n \ge 1$ coins with distinct weights. Alice wants the lightest coin, and Bob wants the heaviest. They have a balance, like the one in Lecture 1, that compares two coins at a time.</p>
    <p>Design an algorithm that finds both coins using at most</p>
    $$\left\lceil \frac{3n}{2} \right\rceil - 2$$
    <p>comparisons. Include clear pseudocode, a convincing correctness argument, and an exact count of the comparisons your algorithm uses.</p>
    <ol type="a">
      <li>First solve the problem when $n = 2^r$ for an integer $r \ge 0$.</li>
      <li>Generalize your solution to every integer $n \ge 1$.</li>
    </ol>`,

  pseudocode: tex`
    <h3>(a) Powers of two</h3>
    <p>Here $<$ compares coin weights, and each <code>min</code> or <code>max</code> of two coins uses one comparison.</p>
    ${pre(CODE_A)}
    <h3>(b) Arbitrary $n$</h3>
    <p>Process coins in pairs, using the two-coin case of <code>ExtremesPowerOfTwo</code> from part (a).</p>
    ${pre(CODE_B)}`,

  proof: tex`
    <h3>(a) Powers of two</h3>
    <h4>Correctness</h4>
    <div class="viz-claim">
      <span class="viz-claim__label">Claim</span>
      <p>For every $r \ge 0$, <code>ExtremesPowerOfTwo</code> on $n = 2^r$ coins returns the lightest and the heaviest coin.</p>
    </div>
    <dl class="viz-steps">
      <dt>Base cases</dt>
      <dd><p>The one- and two-coin cases return both extremes.</p></dd>
      <dt>Inductive step</dt>
      <dd><p>Assuming the recursive calls find each half's extremes, the lighter of the two minima is the global minimum, and the heavier of the two maxima is the global maximum.</p></dd>
      <dt>Conclusion</dt>
      <dd><p>Induction on $r$ proves correctness for $n = 2^r$. <span class="viz-qed">∎</span></p></dd>
    </dl>

    <h4>Exact comparison count</h4>
    <div class="viz-claim">
      <span class="viz-claim__label">Claim</span>
      <p>$C(n) = 3n/2 - 2$ for powers of two $n \ge 2$, and $C(1) = 0$.</p>
    </div>
    <dl class="viz-steps">
      <dt>Recurrence</dt>
      <dd>$$C(n) = \begin{cases} 0, & n = 1,\\ 1, & n = 2,\\ 2C(n/2) + 2, & n \ge 4 \text{ a power of two.} \end{cases}$$</dd>
      <dt>Base case</dt>
      <dd><p>The formula holds at $n = 2$: $3 \cdot 2/2 - 2 = 1 = C(2)$.</p></dd>
      <dt>Inductive step</dt>
      <dd>$$\begin{aligned}
          C(n) &= 2\,C(n/2) + 2 && \text{(two halves, one min, one max)}\\
          &= 2\left(\frac{3(n/2)}{2} - 2\right) + 2 && \text{(hypothesis)}\\
          &= \frac{3n}{2} - 2.
        \end{aligned}$$</dd>
      <dt>Conclusion</dt>
      <dd><p>Thus $C(n) = 3n/2 - 2$ for powers of two $n \ge 2$; at $n = 1$, the required count is 0. <span class="viz-qed">∎</span></p></dd>
    </dl>

    <h3>(b) Arbitrary $n$</h3>
    <h4>Correctness</h4>
    <div class="viz-claim">
      <span class="viz-claim__label">Invariant</span>
      <p><code>low</code> and <code>high</code> are the processed coins' extremes.</p>
    </div>
    <dl class="viz-steps">
      <dt>Initialization</dt>
      <dd><p>Initially, <code>low</code> and <code>high</code> are the processed coins' extremes: coin 1 alone for odd $n$, or the ordered pair of coins 1 and 2 for even $n$.</p></dd>
      <dt>Maintenance</dt>
      <dd><p>In each new pair, only the lighter coin can become the minimum and only the heavier can become the maximum; the updates preserve this property.</p></dd>
      <dt>Termination</dt>
      <dd><p>Initialization leaves an even number of coins, so the loop processes all remaining coins in pairs and returns the global extremes. <span class="viz-qed">∎</span></p></dd>
    </dl>

    <h4>Exact comparison count</h4>
    <dl class="viz-steps">
      <dt>Initialization</dt>
      <dd><p>One comparison for even $n$ and none for odd $n$.</p></dd>
      <dt>Each pair</dt>
      <dd><p>Three comparisons: one to identify its lighter and heavier coins, one to update the minimum, and one to update the maximum.</p></dd>
      <dt>Total</dt>
      <dd>
        $$C(n) = \begin{cases} 1 + 3(n/2 - 1) = 3n/2 - 2, & n \text{ even},\\ 3(n-1)/2 = \lceil 3n/2 \rceil - 2, & n \text{ odd}. \end{cases}$$
        <p>Both cases meet the bound $\lceil 3n/2 \rceil - 2$ exactly. <span class="viz-qed">∎</span></p>
      </dd>
    </dl>

    <aside class="viz-note">
      <p><strong>Supplementary explanation.</strong> Suppose the coin weights, unknown to the algorithm, are $[8, 3, 5, 1, 6]$. The algorithm begins with the weight-8 coin as both extremes.</p>
      <table class="viz-table">
        <thead><tr><th>Next pair</th><th>Minimum afterward</th><th>Maximum afterward</th><th>Comparisons so far</th></tr></thead>
        <tbody>
          <tr><td>$(3, 5)$</td><td>3</td><td>8</td><td>3</td></tr>
          <tr><td>$(1, 6)$</td><td>1</td><td>8</td><td>6</td></tr>
        </tbody>
      </table>
      <p>Each pair costs one comparison to identify its lighter and heavier coins, one to update the minimum, and one to update the maximum.</p>
      <p><strong>Review if needed:</strong> Lecture 2, finding a minimum and counting key comparisons.</p>
    </aside>`,

  variants: [
    {
      id: "a",
      label: "(a) Halving, n = 2^r",
      code: CODE_A,
      fields: [
        {
          name: "A",
          label: "Weights",
          kind: "list",
          placeholder: "8, 3, 5, 1",
        },
      ],
      presets: [
        { label: "[8, 3, 5, 1]: n = 4", input: { A: [8, 3, 5, 1] } },
        {
          label: "[7, 2, 9, 4, 6, 1, 8, 3]: n = 8",
          input: { A: [7, 2, 9, 4, 6, 1, 8, 3] },
        },
        {
          label: "16 coins: a deeper tree",
          input: {
            A: [12, 5, 19, 3, 8, 14, 1, 10, 16, 7, 2, 11, 20, 6, 9, 15],
          },
        },
      ],
      random: randomPowerOfTwo,
      validate: ({ A }) =>
        firstError(
          [1, 2, 4, 8, 16].includes(A.length)
            ? ""
            : `Part (a) needs n to be a power of two: 1, 2, 4, 8, or 16 (got ${A.length}).`,
          checkDistinct(A, "The weights")
        ),
      trace: traceHalving,
      render: renderHalving,
    },
    {
      id: "b",
      label: "(b) Pairs, any n",
      code: CODE_B,
      fields: [
        {
          name: "A",
          label: "Weights",
          kind: "list",
          placeholder: "8, 3, 5, 1, 6",
        },
      ],
      presets: [
        {
          label: "[8, 3, 5, 1, 6]: the solutions' example (odd n)",
          input: { A: [8, 3, 5, 1, 6] },
        },
        {
          label: "[4, 9, 2, 7, 1, 8]: even n",
          input: { A: [4, 9, 2, 7, 1, 8] },
        },
        {
          label: "[9, 8, 7, 6, 5, 4, 3]: descending, low changes every pair",
          input: { A: [9, 8, 7, 6, 5, 4, 3] },
        },
      ],
      random: () => ({ A: sampleDistinct(randInt(5, 11), 1, 40) }),
      validate: ({ A }) =>
        firstError(
          checkLength(A, 1, 16, "The weights"),
          checkDistinct(A, "The weights")
        ),
      trace: tracePairs,
      render: renderPairs,
    },
  ],
};
