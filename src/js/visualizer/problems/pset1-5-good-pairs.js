// Practice Set 1, Problem 5: count pairs x < y with x + y <= k in O(n log n),
// by sorting once and binary searching for each element's last partner.
import {
  tex,
  pre,
  randInt,
  sampleDistinct,
  checkLength,
  checkDistinct,
  checkRange,
  firstError,
  arrayRow,
  tag,
} from "../lib.js";

const MAIN = [
  "CountGoodPairs(A, k):",
  "  n = length(A)",
  "  if n < 2: return 0",
  "  A = MergeSort(A)",
  "  count = 0",
  "  for i from 1 to n:",
  "    j = LastAtMost(A, k - A[i])",
  "    count = count + max(0, j - i)",
  "  return count",
];

const SEARCH = [
  "LastAtMost(A, t):",
  "  left = 1; right = length(A); answer = 0",
  "  while left <= right:",
  "    mid = floor((left + right) / 2)",
  "    if A[mid] <= t:",
  "      answer = mid",
  "      left = mid + 1",
  "    else:",
  "      right = mid - 1",
  "  return answer",
];

// The mini listing shows both functions; SEARCH lines start at line 11.
const CODE = [...MAIN, "", ...SEARCH];
const S = MAIN.length + 2; // listing line of "LastAtMost(A, t):"

function trace({ A, k }) {
  const n = A.length;
  const sorted = [...A].sort((x, y) => x - y);
  const steps = [];
  const pairs = [];
  const probeBound = n * (Math.floor(Math.log2(Math.max(n, 1))) + 1);
  let view = A;
  let isSorted = false;
  let i = null;
  let t = null;
  let search = null; // { left, right, mid, answer } while LastAtMost runs
  let partners = null; // [from, to] indices that pair with A[i]
  let count = 0;
  let probes = 0;
  let done = 0; // A[1..done] have had their partners counted

  const snap = (line, caption) =>
    steps.push({
      line,
      caption,
      values: view,
      isSorted,
      i,
      t,
      search: search && { ...search },
      partners,
      pairs: [...pairs],
      stats: [
        ["count", count],
        ["t = k − A[i]", t ?? "—"],
        ["Search probes", probes],
        ["Probe bound n(⌊log₂n⌋+1)", probeBound],
      ],
      invariant: search
        ? `Entries at or before answer = ${search.answer + 1} are ≤ t; entries after right = ${search.right + 1} are > t.`
        : done
          ? `count = the number of good pairs whose smaller member is among A[1..${done}].`
          : "count = 0 good pairs counted so far.",
    });

  snap(2, `n = ${n}, k = ${k}.`);
  if (n < 2) {
    snap(3, "Fewer than two numbers, so there are no pairs: return 0.");
    return steps;
  }

  view = sorted;
  isSorted = true;
  snap(4, `MergeSort (black box): A = [${sorted.join(", ")}].`);
  snap(5, "count = 0.");

  for (i = 0; i < n; i++) {
    t = k - sorted[i];
    partners = null;
    snap(
      6,
      `i = ${i + 1}, A[i] = ${sorted[i]}. A partner y needs y > ${sorted[i]} and y ≤ k − A[i] = ${t}.`
    );

    search = { left: 0, right: n - 1, mid: null, answer: -1 };
    snap(S + 1, `LastAtMost(A, ${t}): left = 1, right = ${n}, answer = 0.`);
    while (search.left <= search.right) {
      const mid = Math.floor((search.left + search.right) / 2);
      search.mid = mid;
      snap(
        S + 3,
        `mid = ⌊(${search.left + 1} + ${search.right + 1}) / 2⌋ = ${mid + 1}.`
      );

      probes += 1;
      if (sorted[mid] <= t) {
        search.answer = mid;
        search.left = mid + 1;
        snap(
          S + 6,
          `A[${mid + 1}] = ${sorted[mid]} ≤ ${t}: answer = ${mid + 1}, and anything better is to the right (left = ${mid + 2}).`
        );
      } else {
        search.right = mid - 1;
        snap(
          S + 8,
          `A[${mid + 1}] = ${sorted[mid]} > ${t}: it and everything to its right are too big (right = ${mid}).`
        );
      }
    }
    search.mid = null;
    snap(S + 9, `left > right, so return answer = ${search.answer + 1}.`);

    const j = search.answer;
    search = null;
    snap(
      7,
      j >= 0
        ? `j = ${j + 1}: A[1..${j + 1}] are exactly the entries ≤ ${t}.`
        : `j = 0: no entry is ≤ ${t}.`
    );

    const added = Math.max(0, j - i);
    count += added;
    done = i + 1;
    if (added) {
      partners = [i + 1, j];
      for (let p = i + 1; p <= j; p++) pairs.push([sorted[i], sorted[p]]);
    }
    snap(
      8,
      added
        ? `count += max(0, ${j + 1} − ${i + 1}) = ${added}: A[${i + 2}..${j + 1}] each pair with ${sorted[i]}. count = ${count}.`
        : `count += max(0, ${j + 1} − ${i + 1}) = 0: no larger entry fits with ${sorted[i]}.`
    );
  }

  i = null;
  t = null;
  partners = null;
  snap(9, `Return count = ${count}.`);
  return steps;
}

function render(stage, step, { k }) {
  const { search, partners } = step;
  const inPartners = (x) => partners && x >= partners[0] && x <= partners[1];

  const cells = arrayRow(step.values, {
    cellClass: (x) =>
      [
        search && (x < search.left || x > search.right) ? "is-dim" : "",
        search && x === search.mid ? "is-compare" : "",
        x === step.i ? "is-active" : "",
        inPartners(x) ? "is-good" : "",
      ].join(" "),
    above: (x) => [
      x === step.i ? tag("i", "active") : "",
      search && x === search.answer ? tag("answer", "good") : "",
    ],
    below: (x) =>
      search
        ? [
            x === search.left ? tag("left", "low") : "",
            x === search.mid ? tag("mid", "active") : "",
            x === search.right ? tag("right", "high") : "",
          ]
        : [],
  });

  const found = step.pairs.length
    ? step.pairs.map(([x, y]) => `<li>(${x}, ${y})</li>`).join("")
    : "<li>none yet</li>";

  stage.innerHTML = `
    <p class="viz-label">A (${step.isSorted ? "sorted" : "input order"}), k = ${k}${step.t === null ? "" : `, t = k − A[i] = ${step.t}`}</p>
    ${cells}
    <p class="viz-label">Good pairs found (${step.pairs.length})</p>
    <ul class="viz-chips">${found}</ul>`;
}

function random() {
  const n = randInt(5, 9);
  const A = sampleDistinct(n, 1, 25);
  const s = [...A].sort((x, y) => x - y);
  // Pick k between the smallest and largest pair sums so the answer is
  // usually neither 0 nor every pair.
  return { A, k: randInt(s[0] + s[1], s[n - 2] + s[n - 1]) };
}

export default {
  id: "p1-5",
  set: "Practice Set 1",
  number: "5",
  title: "Counting good pairs",

  description: tex`
    <p>The input is an array $A$ of $n$ distinct numbers, not necessarily sorted, and a number $k$. A pair $(x, y)$ is <em>good</em> if $x, y \in A$, $x < y$, and $x + y \le k$.</p>
    <p>Describe an $O(n \log n)$-time algorithm that returns the number of good pairs. Give pseudocode, explain why it counts the good pairs correctly, and justify its running time. You may use merge sort and binary search as black boxes.</p>
    <aside class="viz-note">
      <p><strong>Facts you may use.</strong> Merge sort sorts $n$ numbers in $O(n \log n)$ time. Binary search finds a target in a sorted array, or the position where it would be inserted, in $O(\log n)$ time. It can also find the last entry at most a given target within that bound. Here $O(f(n))$ means an upper bound of a constant times $f(n)$ for all sufficiently large $n$.</p>
    </aside>
    <p>For example, if $A = [8, 3, 4, 1]$ and $k = 5$, the good pairs are $(1, 3)$ and $(1, 4)$, so the output is 2.</p>`,

  pseudocode: tex`
    <p>Use the permitted binary-search black box <code>LastAtMost(A,t)</code> to return the largest index $j$ with $A[j] \le t$, or 0 if no such entry exists, in $O(\log n)$ time.</p>
    ${pre(MAIN)}
    <p>For the given example, sorting gives $A = [1, 3, 4, 8]$ and $k = 5$:</p>
    <table class="viz-table">
      <thead><tr><th>$i$</th><th>$A[i]$</th><th>$k - A[i]$</th><th>$j$</th><th>Pairs added</th></tr></thead>
      <tbody>
        <tr><td>1</td><td>1</td><td>4</td><td>3</td><td>2</td></tr>
        <tr><td>2</td><td>3</td><td>2</td><td>1</td><td>0</td></tr>
        <tr><td>3</td><td>4</td><td>1</td><td>1</td><td>0</td></tr>
        <tr><td>4</td><td>8</td><td>$-3$</td><td>0</td><td>0</td></tr>
      </tbody>
    </table>
    <h3>Implementing the boundary search</h3>
    <p>The question permits binary search as a black box. This implementation is provided only for review.</p>
    ${pre(SEARCH)}`,

  proof: tex`
    <h3>Why the count is correct</h3>
    <div class="viz-claim">
      <span class="viz-claim__label">Claim</span>
      <p><code>CountGoodPairs(A, k)</code> returns the number of good pairs.</p>
    </div>
    <dl class="viz-steps">
      <dt>Order</dt>
      <dd><p>For fixed $i$, strict sorted order makes $x < y$ equivalent to the partner index being greater than $i$.</p></dd>
      <dt>Sum</dt>
      <dd><p>The sum condition is $A[\text{partner}] \le k - A[i]$, which holds exactly through index $j = \texttt{LastAtMost}(A, k - A[i])$.</p></dd>
      <dt>Count for $i$</dt>
      <dd><p>Thus $\max(0, j - i)$ counts precisely the valid partners (indices $i+1, \dots, j$), excluding $A[i]$ itself.</p></dd>
      <dt>No repeats</dt>
      <dd><p>Every good pair has a unique smaller member, so it is counted in exactly one iteration. <span class="viz-qed">∎</span></p></dd>
    </dl>

    <h3>Running time</h3>
    $$\begin{aligned}
      T(n) &= O(n \log n) && \text{(merge sort)}\\
      &\quad + n \cdot O(\log n) && \text{(one search per } i\text{)}\\
      &\quad + n \cdot O(1) && \text{(constant work per iteration)}\\
      &= O(n \log n) && \text{for } n \ge 2.
    \end{aligned}$$
    <p>Smaller inputs take constant time.</p>

    <h3>Why <code>LastAtMost</code> works</h3>
    <dl class="viz-steps">
      <dt>$A[\text{mid}] \le t$</dt>
      <dd><p>It is a candidate, and any better answer lies to its right.</p></dd>
      <dt>$A[\text{mid}] > t$</dt>
      <dd><p>That entry and everything to its right are too large.</p></dd>
      <dt>Time</dt>
      <dd><p>The search interval shrinks by at least half at each step, giving $O(\log n)$ time. <span class="viz-qed">∎</span></p></dd>
    </dl>`,

  variants: [
    {
      id: "count",
      label: "Count",
      code: CODE,
      fields: [
        { name: "A", label: "A", kind: "list", placeholder: "8, 3, 4, 1" },
        { name: "k", label: "k", kind: "int", placeholder: "5" },
      ],
      presets: [
        {
          label: "A = [8, 3, 4, 1], k = 5: the problem's example",
          input: { A: [8, 3, 4, 1], k: 5 },
        },
        {
          label: "A = [2, 9, 5, 1, 7, 4, 6], k = 10: several partners each",
          input: { A: [2, 9, 5, 1, 7, 4, 6], k: 10 },
        },
        {
          label: "A = [10, 20, 30, 40], k = 25: no good pairs",
          input: { A: [10, 20, 30, 40], k: 25 },
        },
      ],
      random,
      validate: ({ A, k }) =>
        firstError(
          checkLength(A, 1, 12, "A"),
          checkDistinct(A, "A"),
          checkRange(k, -999, 999, "k")
        ),
      trace,
      render,
    },
  ],
};
