// Recursion-tree level sums for divide-and-conquer recurrences
// T(n) = a·T(n/2) + f(n), shared by the "prove it by analyzing the recursion
// tree" parts of problems. Each level's nonrecursive work is drawn as a bar so
// geometric growth (Strassen) or decay (round-robin) is visible at a glance.
// Θ-constants are taken to be 1: a call on size s does f(s) work, a leaf 1.
import { grid } from "./lib.js";

const fmt = (x) =>
  Number.isInteger(x)
    ? x.toLocaleString("en-US")
    : x.toLocaleString("en-US", { maximumFractionDigits: 2 });

/**
 * Build a variant that steps through the recursion tree level by level.
 *
 * @param {object} spec
 * @param {string} spec.id
 * @param {string} spec.label
 * @param {string[]} spec.code Mini listing (the recurrence and level sums).
 * @param {{ setup: number, level: number, leaves: number, total: number }}
 *   spec.lines 1-based lines of `code` to highlight in each phase.
 * @param {number} spec.a Recursive calls per internal call.
 * @param {number} spec.leaf Problem size at the leaves.
 * @param {(size: number) => number} spec.work Nonrecursive work of one call.
 * @param {(n: number) => number} spec.bound The claimed Θ bound, e.g. n².
 * @param {string} spec.boundLabel e.g. "n²".
 * @param {string} spec.invariant
 * @param {number[]} spec.sizes Allowed n (powers of two), for validation.
 * @param {Array<{ label: string, input: { n: number } }>} spec.presets
 */
export function levelsVariant(spec) {
  const { a, leaf, work, bound, boundLabel, lines } = spec;

  function trace({ n }) {
    const h = Math.log2(n / leaf);
    const rows = [];
    const steps = [];
    let total = 0;
    let current = null;

    const snap = (line, caption, extra = []) =>
      steps.push({
        line,
        caption,
        rows: rows.map((row) => ({ ...row })),
        current,
        stats: [
          ["n", fmt(n)],
          ["Leaf depth h", h],
          ["Work so far", fmt(total)],
          [boundLabel, fmt(bound(n))],
          ...extra,
        ],
        invariant: spec.invariant,
      });

    snap(
      lines.setup,
      `n = ${fmt(n)}: calls reach size ${leaf} at depth h = log₂(n/${leaf}) = ${h}.`
    );

    for (let d = 0; d < h; d++) {
      const calls = a ** d;
      const size = n / 2 ** d;
      const perCall = work(size);
      const level = calls * perCall;
      total += level;
      rows.push({ depth: d, calls, size, perCall, level, leaves: false });
      current = d;
      const growth = d
        ? ` That is ${fmt(level / rows[d - 1].level)}× the level above.`
        : "";
      snap(
        lines.level,
        `Depth ${d}: ${fmt(calls)} call${calls === 1 ? "" : "s"} on size ${fmt(size)}, ${fmt(perCall)} work each, ${fmt(level)} in all.${growth}`
      );
    }

    const leaves = a ** h;
    total += leaves;
    rows.push({
      depth: h,
      calls: leaves,
      size: leaf,
      perCall: 1,
      level: leaves,
      leaves: true,
    });
    current = h;
    snap(
      lines.leaves,
      `Depth ${h}: ${fmt(leaves)} leaves, constant work each, ${fmt(leaves)} in all.`
    );

    current = null;
    const ratio = total / bound(n);
    snap(
      lines.total,
      `Total ${fmt(total)} = ${fmt(ratio)} × ${boundLabel}. Try a larger n: the ratio settles toward a constant.`,
      [["Total ÷ " + boundLabel, fmt(ratio)]]
    );
    return steps;
  }

  function render(stage, step, { n }) {
    const h = Math.log2(n / leaf);
    const max = Math.max(...step.rows.map((row) => row.level), 1);
    const table = [];
    for (let d = 0; d <= h; d++) {
      const row = step.rows[d];
      table.push(
        row
          ? [
              fmt(row.calls),
              fmt(row.size),
              fmt(row.perCall),
              fmt(row.level),
              {
                html: `<span class="viz-bar${row.leaves ? " viz-bar--leaves" : ""}" style="width: ${(100 * row.level) / max}%"></span>`,
              },
            ]
          : [null, null, null, null, { html: "" }]
      );
    }

    stage.innerHTML = `
      <p class="viz-label">Recursion tree, one row per depth (bars scaled to the largest level so far)</p>
      ${grid(table, {
        corner: "depth",
        rowLabels: table.map((_, d) => (d === h ? `${d} (leaves)` : String(d))),
        colLabels: ["calls", "size", "work / call", "level total", ""],
        cellClass: (r, c) =>
          [c === 4 ? "is-bar" : "", r === step.current ? "is-active" : ""].join(
            " "
          ),
      })}
      <p class="viz-legend">
        <span class="viz-legend__item viz-legend__item--low">internal level</span>
        <span class="viz-legend__item viz-legend__item--good">leaves</span>
      </p>`;
  }

  return {
    id: spec.id,
    label: spec.label,
    code: spec.code,
    fields: [{ name: "n", label: "n", kind: "int", placeholder: "64" }],
    presets: spec.presets,
    random: () => ({
      n: spec.sizes[Math.floor(Math.random() * spec.sizes.length)],
    }),
    validate: ({ n }) =>
      spec.sizes.includes(n)
        ? ""
        : `n must be a power of two from ${spec.sizes[0]} to ${fmt(spec.sizes.at(-1))}.`,
    trace,
    render,
  };
}
