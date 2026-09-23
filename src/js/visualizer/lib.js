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
