# home_page

Personal homepage built for CS5610 Web Development.

- **Author:** Julian E Bowen
- **Class link:** https://johnguerra.co/classes/webDevelopment_online_fall_2026/index.html
- **Live site:** https://jbowen999.github.io/home_page/
- **Design document:** [docs/DESIGN.md](docs/DESIGN.md)
- **Demo video:** https://youtu.be/MPZcyVRa-bg
- **Slides:** https://docs.google.com/presentation/d/17Y70NBq-BvLwlIWv3RJx2Yy7TsVinOnf2HXNZgWrCMk/edit?usp=sharing

## Project Objective

A personal homepage that introduces me, Julian Bowen, a Northeastern student
and US Army veteran, to classmates, instructors, and future employers. The home
page is a quick hello; the About page covers where I've lived, my time as a
12-Bravo combat engineer, my family, and CrossFit. The third page, the Problem
Set Visualizer, is a study tool for CS5800 Algorithms that steps through
problem-set solutions one line at a time.

## Screenshot

![Homepage screenshot](docs/screenshot.png)

## Instructions to Build

This is a static site — no build step. You only need Node for the dev server and
the lint/format tooling.

```bash
npm install     # install dev dependencies
npm start       # serve ./src at http://localhost:8080
```

Before committing:

```bash
npm run format  # Prettier, writes in place
npm run lint    # ESLint
npm run check   # both, read-only — run this before you push
```

## Project Structure

```
src/
  index.html        home
  about.html        second page
  problem-set-visualizer.html   third, AI-generated page (see docs/visualizer.md)
  css/styles.css    shared styles for every page
  css/visualizer.css  visualizer-only styles
  js/main.js        entry point (ES module)
  js/typewriter.js  the original component's logic
  js/visualizer/    the visualizer's modules, one file per problem
  images/
docs/DESIGN.md      design document
docs/visualizer.md  how to add a problem to the visualizer
```

## Original Component

A terminal-style typewriter hero. On load, "Aloha, World!" types itself out
one letter at a time over the hero photo in terminal green, followed by a block
cursor that stays solid while typing and blinks once it's done.

- **Logic:** `src/js/typewriter.js` (no libraries). It saves the heading's text,
  empties it, and adds one character every 100 ms with `setInterval`. The
  untyped remainder stays in the layout as an invisible span, so the heading
  never shifts while it types. Screen readers get the full text immediately
  through `aria-label`.
- **Wiring:** `src/js/main.js` finds `.typewriter` and calls `initTypewriter`.
- **Styles:** `.typewriter__cursor` and the `blink` keyframes in
  `src/css/styles.css`. The blink turns off under `prefers-reduced-motion`.

## Use of GenAI Tools

| Tool        | Model & version | What it was used for                                                                                                                                                                                                                                                                                                                                                                          | Prompt(s)                                                                                                                                                                                                                                                                                                                                                                                           |
| ----------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Claude Code | Opus 5          | Scaffolded the project skeleton: folder layout, `package.json`, ESLint/Prettier config, HTML page shells, CSS token file, GitHub Pages workflow, and this README's outline. No page content was AI-written.                                                                                                                                                                                   | "i want you to scaffold this project for me according to this [pasted assignment rubric]" then "when i say scaffold, i actually just want a skeleton ... the admin stuff"                                                                                                                                                                                                                           |
| Claude Code | Opus 5.5        | Generated the AI page: a CS5800 problem set visualizer (`problem-set-visualizer.html`, `css/visualizer.css`, `js/visualizer/`) with step-through animations for Pset 1 #1, #4, #5, pseudocode/proof views copied from the course solutions, and docs/visualizer.md.                                                                                                                           | "an algorithm visualizer that i can use throughout the semester ... dropdown1 is for selecting which problem ... dropdown two is change the top pane from problem description to pseudocode to correctness proof ..." plus answers to its clarifying questions                                                                                                                                      |
| Claude Code | Opus 5.5        | Styling and cleanup: the blue-gray page gradient, cutting white backgrounds out of the engineer crest, CrossFit logo, and states map (transparent PNGs), the About page's alternating picture/text layout, removing unused scaffold code and images, switching the visualizer from a dark theme to the site's light theme, and filling in this README. The About page text was written by me. | "i want to change the background of the sites to a gradient", "what are ways to get rid of the white corners on crest number 3?", "lets do picture next to header + paragraph. picture on the left.", "go through the whole site, delete any todos and stuff I didn't end up using.", "address the fact that visualizer doesnt match the theme of the rest of the site", "fill in the README TODOs" |

If you did not use a tool for some part of the project, say so explicitly — the
rubric asks for the description either way.

## Checklist

Tracking the assignment rubric.

- [x] Design document (description, personas, user stories, mockups)
- [x] Meaningful homepage content
- [x] ES6 modules (`type: "module"` in package.json, `type="module"` on scripts)
- [x] Deployed to a public page
- [x] Original differentiating component
- [x] CSS / JS / images in separate folders
- [x] Meta information: author, description, icon
- [x] Original JS functionality, >5 lines, no libraries
- [x] Formatted with Prettier
- [x] W3C compliant — https://validator.w3.org/
- [x] Class ESLint config, no errors
- [x] All images have `alt`
- [x] 2 HTML pages + a third AI-generated page
- [x] Classes used to identify elements
- [x] Standard tags only (no `div` buttons)
- [x] Organized CSS, no `!important`
- [x] Grid / flexbox layout
- [x] README: author, class link, objective, screenshot, build instructions
- [x] `package.json` listing dependencies
- [x] MIT license
- [x] Short public narrated video
- [x] GenAI usage described

## License

[MIT](LICENSE)
