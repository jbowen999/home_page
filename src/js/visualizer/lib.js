// Helpers shared by problem modules: markup, randomness, validation, and the
// row-of-cells drawing that most array algorithms need.

/**
 * Tag for problem text. Keeps backslashes, so LaTeX like \frac survives:
 * tex`<p>$\frac{n}{2}$</p>`. Math between $...$ or $$...$$ is typeset.
 * Don't rename it to `html`: Prettier reformats html`` templates as markup
 * and strips the backslashes.
 */
export const tex = String.raw;

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;" };

export function escapeHtml(text) {
  return String(text).replace(/[&<>]/g, (ch) => ESCAPES[ch]);
}

/** A pseudocode block for the text pane. Pass lines or one string. */
export function pre(source) {
  const text = Array.isArray(source) ? source.join("\n") : source;
  return `<pre class="viz-pre"><code>${escapeHtml(text)}</code></pre>`;
}

// Randomness -----------------------------------------------------------------

export function randInt(lo, hi) {
  return lo + Math.floor(Math.random() * (hi - lo + 1));
}

export function pick(items) {
  return items[randInt(0, items.length - 1)];
}

/** `count` distinct integers from [lo, hi], in random order. */
export function sampleDistinct(count, lo, hi) {
  const pool = [];
  for (let v = lo; v <= hi; v++) pool.push(v);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

// Validation -----------------------------------------------------------------
// Each returns an error message, or "" when the value is fine.

export function checkLength(values, min, max, name = "The array") {
  if (values.length < min || values.length > max) {
    return `${name} needs between ${min} and ${max} entries (got ${values.length}).`;
  }
  return "";
}

export function checkDistinct(values, name = "The array") {
  return new Set(values).size === values.length
    ? ""
    : `${name} must have distinct values.`;
}

export function checkRange(value, min, max, name) {
  return value >= min && value <= max
    ? ""
    : `${name} must be between ${min} and ${max}.`;
}

/** First non-empty message, or "". */
export function firstError(...messages) {
  return messages.find(Boolean) ?? "";
}

// Drawing --------------------------------------------------------------------

/**
 * A small label attached to a cell, e.g. tag("low", "low").
 * Tones: low, high, active, good, muted (see .viz-tag--* in visualizer.css).
 */
export function tag(text, tone = "muted") {
  return `<span class="viz-tag viz-tag--${tone}">${escapeHtml(text)}</span>`;
}

/**
 * Draw an array as a row of cells with 1-based index labels.
 *
 * @param {Array<number|string>} values
 * @param {object} [opts]
 * @param {(i: number) => string} [opts.cellClass] Extra classes for cell i
 *   (0-based): is-dim, is-active, is-compare, is-good, is-low, is-high.
 * @param {(i: number) => string[]} [opts.above] Tags shown above cell i.
 * @param {(i: number) => string[]} [opts.below] Tags shown below cell i.
 * @param {string} [opts.shape] "box" (default) or "coin".
 */
export function arrayRow(values, opts = {}) {
  const {
    cellClass = () => "",
    above = () => [],
    below = () => [],
    shape = "box",
  } = opts;

  const slots = values
    .map(
      (value, i) => `
        <div class="viz-array__slot">
          <div class="viz-array__tags">${above(i).join("")}</div>
          <div class="viz-cell viz-cell--${shape} ${cellClass(i)}">${escapeHtml(value)}</div>
          <div class="viz-array__index">${i + 1}</div>
          <div class="viz-array__tags">${below(i).join("")}</div>
        </div>`
    )
    .join("");

  return `<div class="viz-array">${slots}</div>`;
}

/**
 * Draw a 2D table of cells with row and column headers: a matrix, a DP
 * table, a schedule. A cell that is null or undefined is drawn blank, and a
 * cell given as { html } is inserted unescaped (e.g. a bar).
 *
 * @param {Array<Array<number|string|null|{html: string}>>} rows
 * @param {object} [opts]
 * @param {string[]} [opts.rowLabels] Header for each row.
 * @param {string[]} [opts.colLabels] Header for each column.
 * @param {string} [opts.corner] Top-left header cell, when both are given.
 * @param {(r: number, c: number) => string} [opts.cellClass] Extra classes
 *   for cell (r, c), 0-based: is-dim, is-active, is-compare, is-good, is-low,
 *   is-high.
 * @param {number} [opts.block] Leave a gap after every `block` rows and
 *   columns, e.g. to show the quadrants of a matrix.
 * @param {boolean} [opts.small] Compact cells for little side tables.
 */
export function grid(rows, opts = {}) {
  const {
    rowLabels,
    colLabels,
    corner = "",
    cellClass = () => "",
    block = 0,
    small = false,
  } = opts;
  const cols = rows[0]?.length ?? 0;
  const gapAfter = (k, count) =>
    block > 0 && k < count - 1 && (k + 1) % block === 0;
  const gapCell = '<td class="viz-grid__gap" aria-hidden="true"></td>';
  const gapHead = '<th class="viz-grid__gap" aria-hidden="true"></th>';

  const head = colLabels
    ? `<thead><tr>${rowLabels ? `<th>${escapeHtml(corner)}</th>` : ""}${colLabels
        .map(
          (label, c) =>
            `<th scope="col">${escapeHtml(label)}</th>${gapAfter(c, cols) ? gapHead : ""}`
        )
        .join("")}</tr></thead>`
    : "";

  const width = cols + (block > 0 ? Math.floor((cols - 1) / block) : 0);
  const gapRow = `<tr class="viz-grid__gap-row" aria-hidden="true"><td colspan="${width + (rowLabels ? 1 : 0)}"></td></tr>`;

  const body = rows
    .map((row, r) => {
      const cells = row
        .map((value, c) => {
          const blank = value === null || value === undefined;
          const content = blank
            ? ""
            : typeof value === "object"
              ? value.html
              : escapeHtml(value);
          const classes = `${blank ? "is-blank " : ""}${cellClass(r, c)}`;
          return `<td class="${classes.trim()}">${content}</td>${gapAfter(c, cols) ? gapCell : ""}`;
        })
        .join("");
      const label = rowLabels
        ? `<th scope="row">${escapeHtml(rowLabels[r])}</th>`
        : "";
      return `<tr>${label}${cells}</tr>${gapAfter(r, rows.length) ? gapRow : ""}`;
    })
    .join("");

  return `<table class="viz-grid${small ? " viz-grid--small" : ""}">${head}<tbody>${body}</tbody></table>`;
}

/** A labeled figure for side-by-side drawings inside `.viz-figures`. */
export function figure(label, inner) {
  return `<div class="viz-figure"><p class="viz-label">${label}</p>${inner}</div>`;
}
