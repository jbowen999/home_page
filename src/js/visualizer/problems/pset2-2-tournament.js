// Practice Set 2, Problem 2: a round-robin schedule by divide and conquer.
// Variant (a) builds the schedule (within-group rounds copied from the halves,
// cross-group rounds by cyclic shifts); variant (b) sums the recursion tree.
import { tex, pre, pick, grid, figure, tag, arrayRow } from "../lib.js";
import { levelsVariant } from "../levels.js";

const CODE = [
  "Tournament(P):",
  "  n = length(P)",
  "  if n == 2: return [[(P[1], P[2])]]",
  "  m = n / 2",
  "  L = P[1..m]; R = P[m+1..n]",
  "  SL = Tournament(L); SR = Tournament(R)",
  "  S = an array of n-1 rounds, each with m match slots",
  "  for d from 1 to m-1:",
  "    S[d] = concatenate(SL[d], SR[d])",
  "  for t from 0 to m-1:",
  "    for i from 1 to m:",
  "      j = 1 + ((i-1+t) mod m)",
  "      S[m+t][i] = (L[i], R[j])",
  "  return S",
];

const SIZES = [2, 4, 8, 16];
const match = ([x, y]) => `${x}–${y}`;

function trace({ n }) {
  const players = Array.from({ length: n }, (_, k) => k + 1);
  const steps = [];
  const stack = []; // frames: { P, L, R, S, shifts }
  const meet = Array.from({ length: n }, () => Array(n).fill(null));
  let fresh = []; // pairs recorded in the latest step
  let calls = 0;
  let records = 0;

  const snap = (line, caption) => {
    steps.push({
      line,
      caption,
      stack: stack.map((f) => ({
        ...f,
        S: f.S && f.S.map((round) => round && round.map((pair) => [...pair])),
        shifts: f.shifts && f.shifts.map((row) => [...row]),
      })),
      meet: meet.map((row) => [...row]),
      fresh: fresh.map((pair) => [...pair]),
      stats: [
        ["Calls", calls],
        ["Stack depth", stack.length],
        ["Matches recorded", records],
        ["Pairs met / n(n−1)/2", `${countMet()} / ${(n * (n - 1)) / 2}`],
      ],
      invariant:
        "Every returned schedule for $k$ players has $k - 1$ rounds, each player once per round, and every pair exactly once.",
    });
    fresh = [];
  };

  function countMet() {
    let met = 0;
    for (let x = 0; x < n; x++)
      for (let y = x + 1; y < n; y++) if (meet[x][y] !== null) met += 1;
    return met;
  }

  // Record that x and y meet in round `round` (1-based) of the final
  // schedule. Copied rounds keep their index, so the round a pair is assigned
  // at any level is the round it is played at the root.
  function record(x, y, round) {
    meet[x - 1][y - 1] = meet[y - 1][x - 1] = round;
    fresh.push([x, y]);
    records += 1;
  }

  function solve(P) {
    const size = P.length;
    const frame = { P, L: null, R: null, S: null, shifts: null };
    stack.push(frame);
    calls += 1;
    snap(1, `Call Tournament([${P.join(", ")}]), n = ${size}.`);

    if (size === 2) {
      frame.S = [[[P[0], P[1]]]];
      record(P[0], P[1], 1);
      snap(3, `Two players: the single round is ${match(P)}.`);
      stack.pop();
      return frame.S;
    }

    const m = size / 2;
    frame.L = P.slice(0, m);
    frame.R = P.slice(m);
    snap(
      5,
      `m = ${m}: L = [${frame.L.join(", ")}], R = [${frame.R.join(", ")}].`
    );

    const SL = solve(frame.L);
    snap(6, `SL returned ${m - 1} round${m === 2 ? "" : "s"} for L.`);
    const SR = solve(frame.R);
    snap(
      6,
      `SR returned ${m - 1} round${m === 2 ? "" : "s"} for R. L and R share no players, so their rounds can run side by side.`
    );

    frame.S = Array(size - 1).fill(null);
    snap(7, `S gets ${size - 1} rounds of ${m} matches each.`);

    for (let d = 0; d < m - 1; d++) {
      frame.S[d] = [...SL[d], ...SR[d]];
      records += frame.S[d].length;
      fresh = frame.S[d].map((pair) => [...pair]);
      snap(
        9,
        `Round ${d + 1} = SL[${d + 1}] + SR[${d + 1}]: ${frame.S[d].map(match).join(", ")}.`
      );
    }

    frame.shifts = [];
    for (let t = 0; t < m; t++) {
      const round = frame.L.map((x, i) => [x, frame.R[(i + t) % m]]);
      frame.S[m - 1 + t] = round;
      frame.shifts.push(round.map(([, y]) => y));
      round.forEach(([x, y]) => record(x, y, m + t));
      snap(
        13,
        `t = ${t}: L[i] meets R[1 + ((i−1+${t}) mod ${m})]. Round ${m + t} is ${round.map(match).join(", ")}.`
      );
    }

    snap(14, `Return ${size - 1} rounds for players ${P[0]}..${P.at(-1)}.`);
    stack.pop();
    return frame.S;
  }

  const S = solve(players);
  stack.push({ P: players, L: null, R: null, S, shifts: null });
  snap(
    null,
    `Done: ${n - 1} rounds, every player once per round, and all ${(n * (n - 1)) / 2} pairs meet exactly once.`
  );
  return steps;
}

function render(stage, step, { n }) {
  const frame = step.stack.at(-1);
  const { P, L, R, S } = frame;
  const inCall = new Set(P);
  const isFresh = (x, y) =>
    step.fresh.some(([a, b]) => (a === x && b === y) || (a === y && b === x));

  const players = arrayRow(
    Array.from({ length: n }, (_, k) => k + 1),
    {
      shape: "coin",
      cellClass: (k) => (inCall.has(k + 1) ? "" : "is-dim"),
      above: (k) => [
        L?.includes(k + 1) ? tag("L", "low") : "",
        R?.includes(k + 1) ? tag("R", "high") : "",
      ],
    }
  );

  const m = P.length / 2;
  const schedule = S
    ? figure(
        `S for [${P.join(", ")}]`,
        grid(
          S.map((round) => (round ? round.map(match) : Array(m).fill(null))),
          {
            rowLabels: S.map((_, d) => `round ${d + 1}`),
            colLabels: Array.from({ length: m }, (_, i) => `slot ${i + 1}`),
            cellClass: (d, i) =>
              S[d] && isFresh(...S[d][i])
                ? "is-active"
                : S[d] && L && d >= m - 1
                  ? "is-high"
                  : S[d] && L
                    ? "is-low"
                    : "",
          }
        )
      )
    : "";

  const shifts = frame.shifts
    ? figure(
        "Cyclic shifts: opponent of each L[i]",
        grid(frame.shifts, {
          small: true,
          corner: "t",
          rowLabels: frame.shifts.map((_, t) => String(t)),
          colLabels: L.map((x, i) => `L${i + 1} = ${x}`),
          cellClass: (t) => (t === frame.shifts.length - 1 ? "is-active" : ""),
        })
      )
    : "";

  const labels = Array.from({ length: n }, (_, k) => String(k + 1));
  const meet = figure(
    "Who has met whom (cell = round number)",
    grid(
      step.meet.map((row, x) => row.map((r, y) => (x === y ? "·" : r))),
      {
        small: true,
        rowLabels: labels,
        colLabels: labels,
        cellClass: (x, y) =>
          isFresh(x + 1, y + 1)
            ? "is-active"
            : step.meet[x][y] !== null
              ? "is-good"
              : x === y
                ? "is-dim"
                : "",
      }
    )
  );

  stage.innerHTML = `
    <p class="viz-label">Players (dim = outside the current call)</p>
    ${players}
    <div class="viz-figures">${schedule}${shifts}${meet}</div>
    <p class="viz-legend">
      <span class="viz-legend__item viz-legend__item--low">within-group round</span>
      <span class="viz-legend__item viz-legend__item--high">cross-group round</span>
      <span class="viz-legend__item viz-legend__item--active">just recorded</span>
    </p>`;
}

const CODE_B = [
  "T(n) = 2T(n/2) + Θ(n²),  T(2) = Θ(1)",
  "h = log₂ n − 1",
  "depth d < h: 2^d calls on n/2^d players",
  "  level work = 2^d · Θ((n/2^d)²) = Θ(n²/2^d)",
  "depth h: 2^h = n/2 leaves, Θ(1) each",
  "T(n) = Θ(n²)",
];

export default {
  id: "p2-2",
  set: "Practice Set 2",
  number: "2",
  title: "Round-robin tournament",

  description: tex`
    <p>There are $n \ge 2$ players in a round-robin tournament. We want a schedule of $n - 1$ rounds in which each player plays exactly one match per round and every pair of players plays each other exactly once. Output the matches in each round.</p>
    <ol type="a">
      <li>
        <p>Design a divide-and-conquer algorithm for this problem whose running time satisfies</p>
        $$T(n) = 2T(n/2) + \Theta(n^2) \quad (n > 2), \qquad T(2) = \Theta(1).$$
        <p>You may assume that $n$ is a power of two.</p>
        <p>Prove that your algorithm is correct and justify the recurrence.</p>
      </li>
      <li>
        <p>Prove, by analyzing the recursion tree, that</p>
        $$T(n) = \Theta(n^2).$$
      </li>
    </ol>`,

  pseudocode: tex`
    <h3>Solution (a)</h3>
    ${pre(CODE)}
    <p>Part (b) is a recursion-tree argument with no pseudocode; the <em>(b) Recursion tree</em> visualization sums its levels.</p>`,

  proof: tex`
    <h3>Solution (a)</h3>
    <h4>Correctness</h4>
    <div class="viz-claim">
      <span class="viz-claim__label">Claim</span>
      <p><code>Tournament(P)</code> returns a valid schedule. We use induction on $\log_2 n$.</p>
    </div>
    <dl class="viz-steps">
      <dt>Base case</dt>
      <dd><p>For $n = 2$, the single match is a valid schedule.</p></dd>
      <dt>Hypothesis</dt>
      <dd><p>Assume the recursive schedules for the two groups of $m = n/2$ players are correct.</p></dd>
      <dt>Within-group rounds</dt>
      <dd><p>Combining their corresponding rounds gives $m - 1$ rounds in which every player plays once and every pair within a group meets once. The groups are disjoint, so combining their matches creates no conflict.</p></dd>
      <dt>Cross-group rounds</dt>
      <dd><p>In a cross-group round $t$, the opponent index $1 + ((i - 1 + t) \bmod m)$ runs through $1, \dots, m$ as $i$ does. Thus every player in either group plays exactly once in that round. For a fixed player $L_i$, varying $t$ from 0 to $m - 1$ also runs through every opponent in the other group exactly once.</p></dd>
      <dt>Conclusion</dt>
      <dd><p>These cross-group matches cover all remaining pairs and do not repeat any within-group match. The total number of rounds is $(m - 1) + m = n - 1$. <span class="viz-qed">∎</span></p></dd>
    </dl>

    <h4>Efficiency</h4>
    <dl class="viz-steps">
      <dt>Recursive work</dt>
      <dd><p>The two recursive calls each handle $n/2$ players.</p></dd>
      <dt>Other work</dt>
      <dd><p>Outside those calls, the algorithm copies or creates $n - 1$ rounds with $n/2$ matches each. Recording each match takes constant time, so this work is $\Theta(n^2)$.</p></dd>
      <dt>Recurrence</dt>
      <dd><p>Therefore $T(n) = 2T(n/2) + \Theta(n^2)$. For two players, recording the single match gives $T(2) = \Theta(1)$. <span class="viz-qed">∎</span></p></dd>
    </dl>

    <h3>Solution (b)</h3>
    <div class="viz-claim">
      <span class="viz-claim__label">Claim</span>
      <p>$T(n) = \Theta(n^2)$.</p>
    </div>
    <dl class="viz-steps">
      <dt>Levels</dt>
      <dd>
        <p>Let $h = \log_2 n - 1$, the depth at which each call has two players. At depth $d < h$, there are $2^d$ calls on $n/2^d$ players each. Their total nonrecursive work is</p>
        $$2^d \cdot \Theta\left((n/2^d)^2\right) = \Theta\left(n^2/2^d\right).$$
      </dd>
      <dt>Internal levels</dt>
      <dd><p>Summing these costs gives $O(n^2)$ internal work because $\sum_{d=0}^{h-1} 2^{-d} \le 2$.</p></dd>
      <dt>Leaves</dt>
      <dd><p>The $2^h = n/2$ leaves each take constant time, adding $O(n)$ work. This proves the $O(n^2)$ upper bound.</p></dd>
      <dt>Lower bound</dt>
      <dd><p>The root alone does $\Theta(n^2)$ work, giving the matching lower bound and hence $T(n) = \Theta(n^2)$. <span class="viz-qed">∎</span></p></dd>
    </dl>

    <aside class="viz-note">
      <p><strong>Supplementary explanation.</strong></p>
      <p><strong>Reading the cyclic shifts.</strong> For groups of size $m = 4$, the opponents in the four cross-group rounds are:</p>
      <table class="viz-table">
        <thead><tr><th>$t$</th><th>Opponent of $L_1$</th><th>Opponent of $L_2$</th><th>Opponent of $L_3$</th><th>Opponent of $L_4$</th></tr></thead>
        <tbody>
          <tr><td>0</td><td>$R_1$</td><td>$R_2$</td><td>$R_3$</td><td>$R_4$</td></tr>
          <tr><td>1</td><td>$R_2$</td><td>$R_3$</td><td>$R_4$</td><td>$R_1$</td></tr>
          <tr><td>2</td><td>$R_3$</td><td>$R_4$</td><td>$R_1$</td><td>$R_2$</td></tr>
          <tr><td>3</td><td>$R_4$</td><td>$R_1$</td><td>$R_2$</td><td>$R_3$</td></tr>
        </tbody>
      </table>
      <p>Each row is one round and uses every player in $R$ once. Each column shows one player in $L$ meeting every player in $R$.</p>
    </aside>`,

  variants: [
    {
      id: "a",
      label: "(a) Build the schedule",
      code: CODE,
      fields: [
        { name: "n", label: "n players", kind: "int", placeholder: "8" },
      ],
      presets: [
        { label: "n = 4: one level of recursion", input: { n: 4 } },
        {
          label: "n = 8: the solutions' m = 4 cyclic-shift table",
          input: { n: 8 },
        },
        { label: "n = 16: three levels, 120 pairs", input: { n: 16 } },
      ],
      random: () => ({ n: pick(SIZES) }),
      validate: ({ n }) =>
        SIZES.includes(n)
          ? ""
          : `n must be a power of two: 2, 4, 8, or 16 (got ${n}).`,
      trace,
      render,
    },
    levelsVariant({
      id: "b",
      label: "(b) Recursion tree",
      code: CODE_B,
      lines: { setup: 2, level: 4, leaves: 5, total: 6 },
      a: 2,
      leaf: 2,
      work: (size) => size * size,
      bound: (n) => n * n,
      boundLabel: "n²",
      invariant:
        "Level $d$ costs $n^2/2^d$: each level is half the one above, so the root dominates.",
      sizes: [4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096],
      presets: [
        { label: "n = 16: three internal levels", input: { n: 16 } },
        { label: "n = 256: the root dominates", input: { n: 256 } },
        { label: "n = 4096: total ≈ 2n²", input: { n: 4096 } },
      ],
    }),
  ],
};
