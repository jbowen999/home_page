// Practice Set 2, Problem 1: Strassen's matrix multiplication. Variant (a)
// steps through the seven recursive products and the combine; variant (b)
// sums the recursion tree level by level.
import { tex, pre, randInt, pick, firstError, grid, figure } from "../lib.js";
import { levelsVariant } from "../levels.js";

const CODE = [
  "Strassen(A, B):",
  "  n = rows(A)",
  "  if n == 1: return [[A[1,1] * B[1,1]]]",
  "  m = n / 2",
  "  // Split into blocks.",
  "  A11 = A[1..m, 1..m];     A12 = A[1..m, m+1..n]",
  "  A21 = A[m+1..n, 1..m];   A22 = A[m+1..n, m+1..n]",
  "  B11 = B[1..m, 1..m];     B12 = B[1..m, m+1..n]",
  "  B21 = B[m+1..n, 1..m];   B22 = B[m+1..n, m+1..n]",
  "  // Seven recursive products.",
  "  P1 = Strassen(A11 + A22, B11 + B22)",
  "  P2 = Strassen(A21 + A22, B11)",
  "  P3 = Strassen(A11, B12 - B22)",
  "  P4 = Strassen(A22, B21 - B11)",
  "  P5 = Strassen(A11 + A12, B22)",
  "  P6 = Strassen(A21 - A11, B11 + B12)",
  "  P7 = Strassen(A12 - A22, B21 + B22)",
  "  // Combine using the identity.",
  "  C = new matrix[n, n]",
  "  C[1..m, 1..m]     = P1 + P4 - P5 + P7",
  "  C[1..m, m+1..n]   = P3 + P5",
  "  C[m+1..n, 1..m]   = P2 + P4",
  "  C[m+1..n, m+1..n] = P1 - P2 + P3 + P6",
  "  return C",
];
const LINE_P1 = 11;
const LINE_C11 = 20;

// Blocks are named by [row, col] in {0, 1}; each term is [sign, block].
const B11 = [0, 0];
const B12 = [0, 1];
const B21 = [1, 0];
const B22 = [1, 1];
const NAMES = ["11", "12", "21", "22"];
const blockName = ([r, c]) => NAMES[2 * r + c];

const PRODUCTS = [
  {
    a: [
      [1, B11],
      [1, B22],
    ],
    b: [
      [1, B11],
      [1, B22],
    ],
  },
  {
    a: [
      [1, B21],
      [1, B22],
    ],
    b: [[1, B11]],
  },
  {
    a: [[1, B11]],
    b: [
      [1, B12],
      [-1, B22],
    ],
  },
  {
    a: [[1, B22]],
    b: [
      [1, B21],
      [-1, B11],
    ],
  },
  {
    a: [
      [1, B11],
      [1, B12],
    ],
    b: [[1, B22]],
  },
  {
    a: [
      [1, B21],
      [-1, B11],
    ],
    b: [
      [1, B11],
      [1, B12],
    ],
  },
  {
    a: [
      [1, B12],
      [-1, B22],
    ],
    b: [
      [1, B21],
      [1, B22],
    ],
  },
];

// Quadrant of C -> signed list of products (0-based P index).
const COMBINE = [
  {
    block: B11,
    terms: [
      [1, 0],
      [1, 3],
      [-1, 4],
      [1, 6],
    ],
  },
  {
    block: B12,
    terms: [
      [1, 2],
      [1, 4],
    ],
  },
  {
    block: B21,
    terms: [
      [1, 1],
      [1, 3],
    ],
  },
  {
    block: B22,
    terms: [
      [1, 0],
      [-1, 1],
      [1, 2],
      [1, 5],
    ],
  },
];

const termText = (letter, terms) =>
  terms
    .map(
      ([sign, blk], k) =>
        `${k ? (sign > 0 ? " + " : " − ") : sign > 0 ? "" : "−"}${letter}${blockName(blk)}`
    )
    .join("");

const productText = (p) => {
  const wrap = (t) => (t.length > 1 ? `(${termText(...t)})` : termText(...t));
  return `${wrap(["A", PRODUCTS[p].a])}·${wrap(["B", PRODUCTS[p].b])}`;
};

const combineText = (terms) =>
  terms
    .map(([sign, p], k) => `${k ? (sign > 0 ? " + " : " − ") : ""}P${p + 1}`)
    .join("");

// Matrix helpers ------------------------------------------------------------

const zeros = (n) => Array.from({ length: n }, () => Array(n).fill(0));
const copy = (M) => M.map((row) => [...row]);

function block(M, [r, c]) {
  const m = M.length / 2;
  return M.slice(r * m, r * m + m).map((row) => row.slice(c * m, c * m + m));
}

function combine(M, terms) {
  const out = zeros(block(M, B11).length);
  for (const [sign, blk] of terms) {
    const X = block(M, blk);
    out.forEach((row, i) => row.forEach((_, j) => (row[j] += sign * X[i][j])));
  }
  return out;
}

function sumOf(mats, terms) {
  const out = zeros(mats[0].length);
  for (const [sign, p] of terms) {
    out.forEach((row, i) =>
      row.forEach((_, j) => (row[j] += sign * mats[p][i][j]))
    );
  }
  return out;
}

function classicalProduct(A, B) {
  const n = A.length;
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) =>
      A[i].reduce((sum, _, k) => sum + A[i][k] * B[k][j], 0)
    )
  );
}

// (a) Trace -------------------------------------------------------------------

function trace({ A, B }) {
  const N = A.length;
  const steps = [];
  const stack = []; // frames: { label, A, B, P, C, focus }
  let mults = 0;
  let calls = 0;

  const snap = (line, caption) =>
    steps.push({
      line,
      caption,
      stack: stack.map((f) => ({
        label: f.label,
        A: f.A,
        B: f.B,
        P: f.P.map((p) => p && copy(p)),
        C: f.C && copy(f.C),
        X: f.X,
        Y: f.Y,
        focus: f.focus && { ...f.focus },
      })),
      stats: [
        ["Scalar multiplications", mults],
        [`7^log₂n = 7^${Math.log2(N)}`, 7 ** Math.log2(N)],
        ["Classical n³", N ** 3],
        ["Calls so far", calls],
      ],
      invariant:
        "Each finished $P_i$ equals the block product it names, by induction on $\\log_2 n$.",
    });

  function strassen(X, Y, label) {
    const n = X.length;
    const frame = { label, A: X, B: Y, P: Array(7).fill(null), C: null };
    stack.push(frame);
    calls += 1;
    snap(1, `Call Strassen on ${n}×${n} matrices: ${label}.`);

    if (n === 1) {
      mults += 1;
      const C = [[X[0][0] * Y[0][0]]];
      frame.C = C;
      snap(3, `n = 1: return [[${X[0][0]} · ${Y[0][0]}]] = [[${C[0][0]}]].`);
      stack.pop();
      return C;
    }

    const m = n / 2;
    snap(6, `m = ${m}: split A and B into four ${m}×${m} blocks each.`);

    for (let p = 0; p < 7; p++) {
      const X2 = combine(X, PRODUCTS[p].a);
      const Y2 = combine(Y, PRODUCTS[p].b);
      frame.focus = { p };
      frame.X = X2;
      frame.Y = Y2;

      if (m === 1) {
        // A 1×1 call is the base case; show it in one step instead of two.
        mults += 1;
        calls += 1;
        frame.P[p] = [[X2[0][0] * Y2[0][0]]];
        snap(
          LINE_P1 + p,
          `P${p + 1} = ${productText(p)} = ${X2[0][0]} · ${Y2[0][0]} = ${frame.P[p][0][0]}: a 1×1 call, one scalar multiplication.`
        );
        continue;
      }

      snap(
        LINE_P1 + p,
        `P${p + 1} = Strassen of ${productText(p)}: form the two ${m}×${m} operands, then recurse.`
      );
      const P = strassen(X2, Y2, `P${p + 1} = ${productText(p)}`);
      frame.P[p] = P;
      snap(LINE_P1 + p, `P${p + 1} returned. ${7 - p - 1} products to go.`);
    }

    frame.focus = null;
    frame.X = frame.Y = null;
    frame.C = Array.from({ length: n }, () => Array(n).fill(null));
    snap(19, `All seven products are done. Allocate the ${n}×${n} result C.`);

    COMBINE.forEach(({ block: blk, terms }, q) => {
      const Q = sumOf(frame.P, terms);
      const [r, c] = blk;
      Q.forEach((row, i) =>
        row.forEach((v, j) => (frame.C[r * m + i][c * m + j] = v))
      );
      frame.focus = { quadrant: q };
      snap(
        LINE_C11 + q,
        `C${blockName(blk)} = ${combineText(terms)}: additions only, no multiplications.`
      );
    });

    frame.focus = null;
    const C = frame.C;
    snap(24, `Return C, the ${n}×${n} product.`);
    stack.pop();
    return C;
  }

  const C = strassen(A, B, "Strassen(A, B)");
  const ok = JSON.stringify(C) === JSON.stringify(classicalProduct(A, B));
  stack.push({ label: "done", A, B, P: Array(7).fill(null), C, focus: null });
  snap(
    null,
    `Done: ${mults} scalar multiplications instead of ${N ** 3}. ${ok ? "C matches the classical product AB." : "C does NOT match AB."}`
  );
  return steps;
}

// Rendering -----------------------------------------------------------------

function inBlocks(n, blocks) {
  const m = n / 2;
  return (r, c) =>
    blocks.some(
      ([br, bc]) => Math.floor(r / m) === br && Math.floor(c / m) === bc
    );
}

function render(stage, step) {
  const frame = step.stack.at(-1);
  const n = frame.A.length;
  const block = n > 1 ? n / 2 : 0;
  const focus = frame.focus ?? {};
  const p = focus.p;
  const usedA =
    p === undefined
      ? () => false
      : inBlocks(
          n,
          PRODUCTS[p].a.map((t) => t[1])
        );
  const usedB =
    p === undefined
      ? () => false
      : inBlocks(
          n,
          PRODUCTS[p].b.map((t) => t[1])
        );
  const quad = focus.quadrant;
  const inQuad =
    quad === undefined ? () => false : inBlocks(n, [COMBINE[quad].block]);
  const quadTerms =
    quad === undefined ? [] : COMBINE[quad].terms.map((t) => t[1]);
  const done = step.line === null;

  const path = step.stack
    .filter((f) => f.label !== "done")
    .map((f, d) => (d ? f.label.split(" = ")[0] : "root"))
    .join(" › ");

  const inputs = [
    figure(
      `A (${n}×${n})`,
      grid(frame.A, {
        block,
        cellClass: (r, c) => (usedA(r, c) ? "is-compare" : ""),
      })
    ),
    figure(
      `B (${n}×${n})`,
      grid(frame.B, {
        block,
        cellClass: (r, c) => (usedB(r, c) ? "is-compare" : ""),
      })
    ),
  ];
  if (frame.X) {
    inputs.push(
      figure(
        "left operand",
        grid(frame.X, { small: true, cellClass: () => "is-active" })
      ),
      figure(
        "right operand",
        grid(frame.Y, { small: true, cellClass: () => "is-active" })
      )
    );
  }

  const products =
    n > 1 && !done
      ? `<p class="viz-label">Products P1–P7 (${n / 2}×${n / 2} each)</p>
        <div class="viz-figures">${frame.P.map((P, k) =>
          figure(
            `P${k + 1}`,
            P
              ? grid(P, {
                  small: true,
                  cellClass: () =>
                    k === p
                      ? "is-active"
                      : quadTerms.includes(k)
                        ? "is-compare"
                        : "is-good",
                })
              : grid(
                  Array.from({ length: n / 2 }, () => Array(n / 2).fill(null)),
                  { small: true, cellClass: () => (k === p ? "is-active" : "") }
                )
          )
        ).join("")}</div>`
      : "";

  const result = frame.C
    ? figure(
        done ? "C = AB" : "C",
        grid(frame.C, {
          block,
          cellClass: (r, c) =>
            inQuad(r, c)
              ? "is-active"
              : frame.C[r][c] === null
                ? ""
                : "is-good",
        })
      )
    : "";

  stage.innerHTML = `
    <p class="viz-label">Call stack: ${path || "root"}</p>
    <div class="viz-figures">${inputs.join("")}${result}</div>
    ${products}
    <p class="viz-legend">
      <span class="viz-legend__item viz-legend__item--compare">blocks in use</span>
      <span class="viz-legend__item viz-legend__item--active">being computed</span>
      <span class="viz-legend__item viz-legend__item--good">finished</span>
    </p>`;
}

// Module --------------------------------------------------------------------

const randomMatrix = (n) =>
  Array.from({ length: n }, () =>
    Array.from({ length: n }, () => randInt(-3, 5))
  );

function validateSquare(M, name) {
  const n = M.length;
  if (M.some((row) => row.length !== n)) return `${name} must be square.`;
  if (![1, 2, 4].includes(n)) {
    return `${name} must be 1×1, 2×2, or 4×4 here (got ${n}×${n}). Other sizes would be padded with zeros to the next power of two.`;
  }
  return "";
}

const I4 = [
  [1, 0, 0, 0],
  [0, 1, 0, 0],
  [0, 0, 1, 0],
  [0, 0, 0, 1],
];

const CODE_B = [
  "T(n) = 7T(n/2) + Θ(n²),  T(1) = Θ(1)",
  "h = log₂ n",
  "depth d < h: 7^d calls on size n/2^d",
  "  level work = 7^d · Θ((n/2^d)²) = Θ(n² (7/4)^d)",
  "depth h: 7^h leaves, Θ(1) each",
  "T(n) = Θ(7^h) = Θ(n^log₂7)",
];

export default {
  id: "p2-1",
  set: "Practice Set 2",
  number: "1",
  title: "Strassen’s matrix multiplication",

  description: tex`
    <p>Let $A$ and $B$ be $n \times n$ matrices. When $n$ is even, partition them into four $(n/2) \times (n/2)$ blocks:</p>
    $$A = \begin{pmatrix} A_{11} & A_{12} \\ A_{21} & A_{22} \end{pmatrix}, \qquad B = \begin{pmatrix} B_{11} & B_{12} \\ B_{21} & B_{22} \end{pmatrix}.$$
    <p>The key insight in Strassen’s algorithm is discovering the following identity. Define</p>
    $$\begin{aligned}
      P_1 &= (A_{11} + A_{22})(B_{11} + B_{22}), & P_2 &= (A_{21} + A_{22})B_{11},\\
      P_3 &= A_{11}(B_{12} - B_{22}), & P_4 &= A_{22}(B_{21} - B_{11}),\\
      P_5 &= (A_{11} + A_{12})B_{22}, & P_6 &= (A_{21} - A_{11})(B_{11} + B_{12}),\\
      P_7 &= (A_{12} - A_{22})(B_{21} + B_{22}).
    \end{aligned}$$
    <p>Then</p>
    $$AB = \begin{pmatrix} P_1 + P_4 - P_5 + P_7 & P_3 + P_5 \\ P_2 + P_4 & P_1 - P_2 + P_3 + P_6 \end{pmatrix}.$$
    <ol type="a">
      <li>
        <p>Using this identity, design a matrix-multiplication algorithm whose running time satisfies</p>
        $$T(n) = 7T(n/2) + \Theta(n^2) \quad (n > 1), \qquad T(1) = \Theta(1).$$
        <p>You may assume that $n$ is a power of two. (Otherwise, pad both matrices with zero rows and columns to the next power of two, then discard the extra rows and columns of the product. This does not change the asymptotic running time.)</p>
        <p>Prove that your algorithm is correct and justify the recurrence.</p>
      </li>
      <li>
        <p>Prove, by analyzing the recursion tree, that</p>
        $$T(n) = \Theta\left(7^{\log_2 n}\right) = \Theta\left(n^{\log_2 7}\right).$$
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
      <p><code>Strassen(A, B)</code> returns $AB$. We use induction on $\log_2 n$.</p>
    </div>
    <dl class="viz-steps">
      <dt>Base case</dt>
      <dd><p>For $n = 1$, the algorithm returns the product of the two scalar entries.</p></dd>
      <dt>Hypothesis</dt>
      <dd><p>For $n > 1$, assume the recursive calls correctly multiply matrices of size $n/2$.</p></dd>
      <dt>Inductive step</dt>
      <dd><p>Then each $P_i$ equals the block product specified in the question. The supplied identity shows that combining these seven products as in the pseudocode gives exactly the four blocks of $AB$. <span class="viz-qed">∎</span></p></dd>
    </dl>

    <h4>Efficiency</h4>
    <dl class="viz-steps">
      <dt>Recursive work</dt>
      <dd><p>There are seven recursive multiplications of size $n/2$.</p></dd>
      <dt>Other work</dt>
      <dd><p>The remaining work consists of a fixed number of block additions, subtractions, and copies, each involving $\Theta(n^2)$ entries.</p></dd>
      <dt>Recurrence</dt>
      <dd><p>Thus $T(n) = 7T(n/2) + \Theta(n^2)$ for $n > 1$.</p></dd>
      <dt>Base case</dt>
      <dd><p>The scalar multiplication takes constant time, giving $T(1) = \Theta(1)$. <span class="viz-qed">∎</span></p></dd>
    </dl>

    <h3>Solution (b)</h3>
    <div class="viz-claim">
      <span class="viz-claim__label">Claim</span>
      <p>$T(n) = \Theta\left(7^{\log_2 n}\right) = \Theta\left(n^{\log_2 7}\right)$.</p>
    </div>
    <dl class="viz-steps">
      <dt>Levels</dt>
      <dd>
        <p>For $n > 1$, let $h = \log_2 n$. At depth $d < h$, there are $7^d$ calls, each on matrices of size $n/2^d$. Their total nonrecursive work is</p>
        $$7^d \cdot \Theta\left((n/2^d)^2\right) = \Theta\left(n^2 (7/4)^d\right).$$
      </dd>
      <dt>Internal levels</dt>
      <dd><p>These level costs grow geometrically by a factor of $7/4$, so their sum is within a constant factor of the last internal level’s cost. The total internal work is therefore $\Theta(n^2 (7/4)^h) = \Theta(7^h)$, using $n^2 = 4^h$.</p></dd>
      <dt>Leaves</dt>
      <dd><p>The $7^h$ leaves each take constant time and add $\Theta(7^h)$ work.</p></dd>
      <dt>Conclusion</dt>
      <dd><p>Hence $T(n) = \Theta(7^h) = \Theta(n^{\log_2 7})$. <span class="viz-qed">∎</span></p></dd>
    </dl>

    <aside class="viz-note">
      <p><strong>Supplementary explanation.</strong></p>
      <p><strong>Summing the internal levels.</strong> After factoring out $n^2$, the geometric sum is</p>
      $$\sum_{d=0}^{h-1} (7/4)^d = \frac{(7/4)^h - 1}{7/4 - 1} = \Theta\left((7/4)^h\right).$$
      <p>Multiplying by $n^2 = 4^h$ gives $\Theta(7^h)$. The exponent $h$ instead of $h - 1$ changes the bound only by the constant factor $7/4$.</p>
    </aside>`,

  variants: [
    {
      id: "a",
      label: "(a) Strassen",
      code: CODE,
      fields: [
        {
          name: "A",
          label: "A (rows split by ;)",
          kind: "matrix",
          placeholder: "1, 2; 3, 4",
        },
        {
          name: "B",
          label: "B (rows split by ;)",
          kind: "matrix",
          placeholder: "5, 6; 7, 8",
        },
      ],
      presets: [
        {
          label: "2×2: seven scalar products instead of eight",
          input: {
            A: [
              [1, 2],
              [3, 4],
            ],
            B: [
              [5, 6],
              [7, 8],
            ],
          },
        },
        {
          label: "4×4: one level of recursion, 49 multiplications",
          input: {
            A: [
              [1, 2, 0, 1],
              [3, -1, 2, 0],
              [0, 1, 4, 2],
              [2, 0, 1, 3],
            ],
            B: [
              [2, 0, 1, 1],
              [1, 3, 0, 2],
              [0, 1, 2, 1],
              [4, 0, 1, 0],
            ],
          },
        },
        {
          label: "4×4 identity · B: C = B, yet still 49 multiplications",
          input: {
            A: I4,
            B: [
              [5, 1, 0, 2],
              [3, 7, 4, 1],
              [0, 2, 6, 3],
              [1, 0, 2, 8],
            ],
          },
        },
      ],
      random: () => {
        const n = pick([2, 4, 4]);
        return { A: randomMatrix(n), B: randomMatrix(n) };
      },
      validate: ({ A, B }) =>
        firstError(
          validateSquare(A, "A"),
          validateSquare(B, "B"),
          A.length === B.length ? "" : "A and B must be the same size."
        ),
      trace,
      render,
    },
    levelsVariant({
      id: "b",
      label: "(b) Recursion tree",
      code: CODE_B,
      lines: { setup: 2, level: 4, leaves: 5, total: 6 },
      a: 7,
      leaf: 1,
      work: (size) => size * size,
      bound: (n) => 7 ** Math.log2(n),
      boundLabel: "7^log₂n",
      invariant:
        "Level $d$ costs $n^2 (7/4)^d$: each level is $7/4$ times the one above, so the bottom levels dominate.",
      sizes: [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096],
      presets: [
        { label: "n = 8: three internal levels", input: { n: 8 } },
        { label: "n = 64: the leaves dominate", input: { n: 64 } },
        { label: "n = 4096: total ≈ (7/3) · 7^h", input: { n: 4096 } },
      ],
    }),
  ],
};
