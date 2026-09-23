// Practice Set 1, Problem 1: trace the recursive mystery function F(a, n).
import {
  tex,
  pre,
  randInt,
  pick,
  checkRange,
  firstError,
  escapeHtml,
} from "../lib.js";

const CODE = [
  "F(a, n):",
  "  if n == 0: return (1, 0)",
  "  b = 1",
  "  for i from 1 to n:",
  "    b = b * a",
  "  (u, v) = F(a, n - 1)",
  "  return (u * b, v + 2 * n * a)",
];

// Values are tracked symbolically (u = a^exp, v = coef * a) so the display can
// show both the pattern and the number, like the table in the solutions.
const SUPERSCRIPTS = "⁰¹²³⁴⁵⁶⁷⁸⁹";
const sup = (k) => [...String(k)].map((d) => SUPERSCRIPTS[d]).join("");
const power = (exp) => (exp === 0 ? "1" : exp === 1 ? "a" : `a${sup(exp)}`);
const multiple = (coef) => (coef === 0 ? "0" : coef === 1 ? "a" : `${coef}a`);
const powValue = (a, exp) => String(BigInt(a) ** BigInt(exp));

function pair(a, exp, coef) {
  return `(${power(exp)}, ${multiple(coef)}) = (${powValue(a, exp)}, ${coef * a})`;
}

function trace({ a, n }) {
  const steps = [];
  const stack = [];
  const returned = [];
  let calls = 0;
  let maxDepth = 0;

  const snap = (line, caption) =>
    steps.push({
      line,
      caption,
      stack: stack.map((frame) => ({ ...frame })),
      returned: returned.map((row) => ({ ...row })),
      stats: [
        ["Calls", calls],
        ["Stack depth", stack.length],
        ["Max depth", maxDepth],
        ["Formula", `(${power((n * (n + 1)) / 2)}, ${multiple(n * (n + 1))})`],
      ],
      invariant:
        "Every call $F(a, t)$ that has returned gave $(a^{t(t+1)/2}, t(t+1)a)$, or $(1, 0)$ when $t = 0$.",
    });

  function call(m) {
    const frame = {
      n: m,
      bExp: null,
      i: null,
      u: null,
      ret: null,
      status: "active",
    };
    if (stack.length) stack[stack.length - 1].status = "waiting";
    stack.push(frame);
    calls += 1;
    maxDepth = Math.max(maxDepth, stack.length);
    snap(1, `Call F(${a}, ${m}).`);

    if (m === 0) {
      frame.ret = { exp: 0, coef: 0 };
      snap(2, "n = 0, the base case: return (1, 0).");
    } else {
      frame.bExp = 0;
      snap(3, `n = ${m} ≠ 0, so set b = 1.`);
      for (let i = 1; i <= m; i++) {
        frame.i = i;
        frame.bExp = i;
        snap(5, `i = ${i}: b = b · a = ${power(i)} = ${powValue(a, i)}.`);
      }

      const child = call(m - 1);
      frame.status = "active";
      frame.u = child;
      snap(
        6,
        `F(a, ${m - 1}) returned (u, v) = ${pair(a, child.exp, child.coef)}.`
      );

      frame.ret = { exp: child.exp + m, coef: child.coef + 2 * m };
      snap(
        7,
        `Return (u · b, v + 2·${m}·a) = ${pair(a, frame.ret.exp, frame.ret.coef)}.`
      );
    }

    returned.push({ n: m, bExp: frame.bExp, ...frame.ret });
    stack.pop();
    return frame.ret;
  }

  const result = call(n);
  snap(
    null,
    `Done: F(${a}, ${n}) = ${pair(a, result.exp, result.coef)}, matching the formula.`
  );
  return steps;
}

function render(stage, step, { a }) {
  const frames = [...step.stack]
    .reverse()
    .map((f) => {
      const rows = [
        [
          "b",
          f.bExp === null ? "—" : `${power(f.bExp)} = ${powValue(a, f.bExp)}`,
        ],
        ["i", f.i ?? "—"],
        ["(u, v)", f.u ? pair(a, f.u.exp, f.u.coef) : "…"],
        ["return", f.ret ? pair(a, f.ret.exp, f.ret.coef) : "…"],
      ];
      return `
        <div class="viz-frame viz-frame--${f.status}">
          <div class="viz-frame__head">F(${a}, ${f.n})${f.status === "waiting" ? " <small>waiting on F(a, " + (f.n - 1) + ")</small>" : ""}</div>
          <dl class="viz-frame__vars">
            ${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${escapeHtml(v)}</dd></div>`).join("")}
          </dl>
        </div>`;
    })
    .join("");

  const rows = step.returned
    .map(
      (r) => `
        <tr>
          <td>${r.n}</td>
          <td>${r.bExp === null ? "—" : power(r.bExp)}</td>
          <td>${escapeHtml(pair(a, r.exp, r.coef))}</td>
        </tr>`
    )
    .join("");

  stage.innerHTML = `
    <div class="viz-split">
      <div>
        <p class="viz-label">Call stack (running call on top), a = ${a}</p>
        <div class="viz-stack">${frames || '<p class="viz-empty">Stack is empty.</p>'}</div>
      </div>
      <div>
        <p class="viz-label">Returned so far</p>
        <table class="viz-table">
          <thead><tr><th>n</th><th>b after loop</th><th>F(a, n)</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="3">—</td></tr>'}</tbody>
        </table>
      </div>
    </div>`;
}

export default {
  id: "p1-1",
  set: "Practice Set 1",
  number: "1",
  title: "A mystery function",

  description: tex`
    <p>Consider the following code, where $n$ is an integer with $n \ge 0$. The loop includes both endpoints.</p>
    ${pre(CODE)}
    <ol type="a">
      <li>What are $F(a, 2)$, $F(a, 3)$, and $F(a, 4)$?</li>
      <li>What does the function return for an arbitrary integer $n \ge 0$? Prove your answer by induction on $n$.</li>
    </ol>`,

  pseudocode: tex`
    ${pre(CODE)}
    <p><strong>(a)</strong> $F(a,2) = (a^3, 6a)$, $F(a,3) = (a^6, 12a)$, and $F(a,4) = (a^{10}, 20a)$.</p>
    <p>For $n \ge 1$, each call multiplies the first returned component by $a^n$ and adds $2na$ to the second.</p>
    <table class="viz-table">
      <thead><tr><th>$n$</th><th>$b$ after the loop</th><th>$F(a,n)$</th></tr></thead>
      <tbody>
        <tr><td>0</td><td>—</td><td>$(1, 0)$</td></tr>
        <tr><td>1</td><td>$a$</td><td>$(a, 2a)$</td></tr>
        <tr><td>2</td><td>$a^2$</td><td>$(a^3, 6a)$</td></tr>
        <tr><td>3</td><td>$a^3$</td><td>$(a^6, 12a)$</td></tr>
        <tr><td>4</td><td>$a^4$</td><td>$(a^{10}, 20a)$</td></tr>
      </tbody>
    </table>`,

  proof: tex`
    <h3>(b) Closed form</h3>
    <div class="viz-claim">
      <span class="viz-claim__label">Claim</span>
      <p>The base call returns $F(a, 0) = (1, 0)$. For every $n \ge 1$,</p>
      $$F(a, n) = \left(a^{n(n+1)/2},\; n(n+1)a\right).$$
    </div>
    <p>We prove this formula by induction on $n$.</p>
    <dl class="viz-steps">
      <dt>Base case</dt>
      <dd><p>At $n = 1$, the code returns $(a, 2a)$, which agrees with the formula.</p></dd>
      <dt>Hypothesis</dt>
      <dd><p>Fix $t \ge 1$ and assume $F(a, t) = \left(a^{t(t+1)/2},\; t(t+1)a\right)$.</p></dd>
      <dt>Inductive step</dt>
      <dd>
        <p>In the call $F(a, t+1)$, the loop sets $b = a^{t+1}$ and the induction hypothesis supplies the recursive return value $(u, v)$. Thus the caller returns</p>
        $$\begin{aligned}
          F(a, t+1) &= \left(u \cdot b,\; v + 2(t+1)a\right) && \text{(line 7)}\\
          &= \left(a^{t(t+1)/2}\,a^{t+1},\; t(t+1)a + 2(t+1)a\right) && \text{(hypothesis, loop)}\\
          &= \left(a^{(t+1)(t+2)/2},\; (t+1)(t+2)a\right). && \text{(factor out } t+1\text{)}
        \end{aligned}$$
        <p>This is the formula for $t + 1$.</p>
      </dd>
      <dt>Conclusion</dt>
      <dd><p>Induction proves the formula for every $n \ge 1$; the separate base call covers $n = 0$. <span class="viz-qed">∎</span></p></dd>
    </dl>
    <aside class="viz-note">
      <p><strong>Supplementary explanation.</strong> The first component accumulates exponents $1 + \cdots + n = n(n+1)/2$; the second accumulates $2a(1 + \cdots + n) = n(n+1)a$. These observations suggest the formula; the induction proves it. The case $n = 0$ is stated separately to avoid writing $0^0$ when $a = 0$.</p>
      <p><strong>Review if needed:</strong> Lecture 1, mathematical induction; Pset 0, Problems 2 and 7.</p>
    </aside>`,

  variants: [
    {
      id: "trace",
      label: "Trace",
      code: CODE,
      fields: [
        { name: "a", label: "a", kind: "int", placeholder: "2" },
        { name: "n", label: "n", kind: "int", placeholder: "3" },
      ],
      presets: [
        { label: "a = 2, n = 3: short trace", input: { a: 2, n: 3 } },
        { label: "a = 3, n = 4: part (a)'s last row", input: { a: 3, n: 4 } },
        { label: "a = 7, n = 0: base case only", input: { a: 7, n: 0 } },
      ],
      random: () => ({ a: pick([-2, -1, 2, 3, 4, 5]), n: randInt(1, 5) }),
      validate: ({ a, n }) =>
        firstError(checkRange(n, 0, 8, "n"), checkRange(a, -9, 9, "a")),
      trace,
      render,
    },
  ],
};
