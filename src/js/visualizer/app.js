// The visualizer page: two dropdowns, a text pane, and a step-through player.
// Everything problem-specific lives in ./problems/. This file only wires the
// shared UI to whichever problem module is selected.
// The module contract is documented in docs/visualizer.md.
import { problems } from "./problems/index.js";
import { Player } from "./player.js";
import { escapeHtml } from "./lib.js";

const VIEWS = [
  { id: "description", label: "Problem description" },
  { id: "pseudocode", label: "Pseudocode" },
  { id: "proof", label: "Correctness proof" },
];

const SPEEDS = [0.25, 0.5, 1, 1.5, 2, 4];
const CUSTOM = "custom";

const MATH_OPTIONS = {
  delimiters: [
    { left: "$$", right: "$$", display: true },
    { left: "$", right: "$", display: false },
  ],
  throwOnError: false,
};

/** Typeset $...$ math inside el, if KaTeX loaded (it's a CDN script). */
function typeset(el) {
  if (typeof window.renderMathInElement === "function") {
    window.renderMathInElement(el, MATH_OPTIONS);
  }
}

// Field kinds for the custom-input form. Add a kind here if a new problem
// needs one (e.g. a graph edge list).
const FIELD_KINDS = {
  int: {
    parse(raw, label) {
      if (!/^\s*-?\d+\s*$/.test(raw))
        throw new Error(`${label}: enter an integer.`);
      return Number(raw);
    },
    format: (value) => String(value),
  },
  list: {
    parse(raw, label) {
      const parts = raw.split(/[\s,]+/).filter(Boolean);
      if (!parts.length || parts.some((p) => !/^-?\d+$/.test(p))) {
        throw new Error(`${label}: enter integers separated by commas.`);
      }
      return parts.map(Number);
    },
    format: (value) => value.join(", "),
  },
};

export function initVisualizer(root) {
  const el = (name) => root.querySelector(`[data-viz="${name}"]`);
  const ui = {
    problem: el("problem"),
    view: el("view"),
    text: el("text"),
    variants: el("variants"),
    preset: el("preset"),
    random: el("random"),
    form: el("form"),
    fields: el("fields"),
    error: el("error"),
    stage: el("stage"),
    code: el("code"),
    stats: el("stats"),
    invariant: el("invariant"),
    caption: el("caption"),
    reset: el("reset"),
    back: el("back"),
    play: el("play"),
    forward: el("forward"),
    scrub: el("scrub"),
    counter: el("counter"),
    speed: el("speed"),
    speedOut: el("speed-out"),
  };

  const state = {
    problem: null,
    variant: null,
    view: "description",
    input: null,
  };
  const player = new Player(renderStep);

  // Selection ----------------------------------------------------------------

  function selectProblem(problemId, viewId, variantId) {
    const problem = problems.find((p) => p.id === problemId) ?? problems[0];
    state.problem = problem;
    state.view = VIEWS.some((v) => v.id === viewId) ? viewId : "description";
    ui.problem.value = problem.id;
    ui.view.value = state.view;
    renderText();

    ui.variants.hidden = problem.variants.length < 2;
    ui.variants.innerHTML = problem.variants
      .map(
        (v) =>
          `<button class="viz-button viz-toggle" type="button" data-variant="${v.id}">${escapeHtml(v.label)}</button>`
      )
      .join("");

    const variant =
      problem.variants.find((v) => v.id === variantId) ?? problem.variants[0];
    selectVariant(variant);
  }

  function selectVariant(variant) {
    state.variant = variant;
    for (const button of ui.variants.children) {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.variant === variant.id)
      );
    }

    ui.code.innerHTML = variant.code
      .map((line) => `<li><code>${escapeHtml(line) || " "}</code></li>`)
      .join("");

    ui.preset.innerHTML =
      variant.presets
        .map((p, i) => `<option value="${i}">${escapeHtml(p.label)}</option>`)
        .join("") + `<option value="${CUSTOM}">Custom / random</option>`;

    ui.fields.innerHTML = variant.fields
      .map(
        (f) => `
          <label class="viz-field">
            <span class="viz-field__label">${escapeHtml(f.label)}</span>
            <input class="viz-input viz-input--${f.kind}" name="${f.name}"
              type="text" autocomplete="off" spellcheck="false"
              placeholder="${escapeHtml(f.placeholder ?? "")}" />
          </label>`
      )
      .join("");

    run(variant.presets[0].input, "0");
    writeHash();
  }

  /** Validate and load an input. `presetValue` is the preset <option> value. */
  function run(input, presetValue) {
    const error = state.variant.validate(input);
    ui.error.textContent = error;
    if (error) return;

    state.input = input;
    ui.preset.value = presetValue;
    for (const f of state.variant.fields) {
      ui.form.elements[f.name].value = FIELD_KINDS[f.kind].format(
        input[f.name]
      );
    }
    player.load(state.variant.trace(input));
  }

  function readForm() {
    const input = {};
    for (const f of state.variant.fields) {
      input[f.name] = FIELD_KINDS[f.kind].parse(
        ui.form.elements[f.name].value,
        f.label
      );
    }
    return input;
  }

  // Rendering ----------------------------------------------------------------

  function renderText() {
    const { problem, view } = state;
    ui.text.innerHTML = `
      <p class="viz-text__eyebrow">${escapeHtml(problem.set)} &middot; Problem ${escapeHtml(problem.number)}</p>
      <h2 class="viz-text__title">${escapeHtml(problem.title)}</h2>
      ${problem[view]}`;
    typeset(ui.text);
  }

  function renderStep({ step, index, total, playing }) {
    if (!step) return;
    state.variant.render(ui.stage, step, state.input);

    [...ui.code.children].forEach((li, i) => {
      li.classList.toggle("is-current", step.line === i + 1);
    });

    ui.stats.innerHTML = (step.stats ?? [])
      .map(
        ([label, value]) =>
          `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`
      )
      .join("");

    ui.invariant.textContent = step.invariant ?? "";
    ui.caption.textContent = step.caption ?? "";
    typeset(ui.invariant);
    typeset(ui.caption);

    ui.counter.textContent = `Step ${index + 1} / ${total}`;
    ui.scrub.max = String(total - 1);
    ui.scrub.value = String(index);
    ui.back.disabled = index === 0;
    ui.forward.disabled = index === total - 1;
    ui.play.textContent = playing
      ? "Pause"
      : index === total - 1
        ? "Replay"
        : "Play";
  }

  // URL hash: #<problem>/<view>/<variant> --------------------------------------

  function writeHash() {
    const hash = `#${state.problem.id}/${state.view}/${state.variant.id}`;
    if (location.hash !== hash) history.replaceState(null, "", hash);
  }

  function readHash() {
    const [problemId, viewId, variantId] = location.hash.slice(1).split("/");
    selectProblem(problemId, viewId, variantId);
  }

  // Wiring -------------------------------------------------------------------

  ui.problem.innerHTML = [...new Set(problems.map((p) => p.set))]
    .map((set) => {
      const options = problems
        .filter((p) => p.set === set)
        .map(
          (p) =>
            `<option value="${p.id}">#${escapeHtml(p.number)} ${escapeHtml(p.title)}</option>`
        )
        .join("");
      return `<optgroup label="${escapeHtml(set)}">${options}</optgroup>`;
    })
    .join("");

  ui.view.innerHTML = VIEWS.map(
    (v) => `<option value="${v.id}">${escapeHtml(v.label)}</option>`
  ).join("");

  ui.problem.addEventListener("change", () =>
    selectProblem(ui.problem.value, state.view)
  );

  ui.view.addEventListener("change", () => {
    state.view = ui.view.value;
    renderText();
    writeHash();
  });

  ui.variants.addEventListener("click", (event) => {
    const button = event.target.closest("[data-variant]");
    const variant = state.problem.variants.find(
      (v) => v.id === button?.dataset.variant
    );
    if (variant && variant !== state.variant) selectVariant(variant);
  });

  ui.preset.addEventListener("change", () => {
    const preset = state.variant.presets[Number(ui.preset.value)];
    if (preset) run(preset.input, ui.preset.value);
    else ui.form.elements[state.variant.fields[0].name].focus();
  });

  ui.random.addEventListener("click", () =>
    run(state.variant.random(), CUSTOM)
  );

  ui.form.addEventListener("submit", (event) => {
    event.preventDefault();
    try {
      run(readForm(), CUSTOM);
    } catch (error) {
      ui.error.textContent = error.message;
    }
  });

  ui.reset.addEventListener("click", () => player.reset());
  ui.back.addEventListener("click", () => player.back());
  ui.forward.addEventListener("click", () => player.forward());
  ui.play.addEventListener("click", () => player.toggle());
  ui.scrub.addEventListener("input", () => player.seek(Number(ui.scrub.value)));

  ui.speed.addEventListener("input", () => {
    const speed = SPEEDS[Number(ui.speed.value)];
    ui.speedOut.textContent = `${speed}×`;
    player.setSpeed(speed);
  });

  document.addEventListener("keydown", (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest("input, select, textarea")) return;
    // A focused button already handles Space itself.
    if (event.key === " " && target?.closest("button")) return;

    const actions = {
      ArrowLeft: () => player.back(),
      ArrowRight: () => player.forward(),
      " ": () => player.toggle(),
      r: () => player.reset(),
      R: () => player.reset(),
    };
    if (actions[event.key]) {
      event.preventDefault();
      actions[event.key]();
    }
  });

  window.addEventListener("hashchange", readHash);
  readHash();
}
