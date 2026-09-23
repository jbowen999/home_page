# home_page

Personal homepage built for CS5610 Web Development.

- **Author:** Julian E Bowen
- **Class link:** TODO: link to the CS5610 course page
- **Live site:** TODO: https://jbowen999.github.io/home_page/
- **Design document:** [docs/DESIGN.md](docs/DESIGN.md)
- **Demo video:** TODO: public link to the narrated video

## Project Objective

TODO: a short paragraph on what this site is for and who it's for.

## Screenshot

TODO: add a screenshot to `docs/` and embed it here.

<!-- ![Homepage screenshot](docs/screenshot.png) -->

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
  css/styles.css
  js/main.js        entry point (ES module)
  js/feature.js     the original component's logic
  js/visualizer/    the visualizer's modules, one file per problem
  images/
docs/DESIGN.md      design document
```

## Original Component

TODO: describe the component that differentiates this homepage, and where its
code lives.

## Use of GenAI Tools

TODO: fill this in as you go. For each tool, record:

| Tool        | Model & version | What it was used for                                                                                                                                                                                                                                                | Prompt(s)                                                                                                                                                                                                                                                      |
| ----------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Claude Code | Opus 5          | Scaffolded the project skeleton: folder layout, `package.json`, ESLint/Prettier config, HTML page shells, CSS token file, GitHub Pages workflow, and this README's outline. No page content was AI-written.                                                         | "i want you to scaffold this project for me according to this [pasted assignment rubric]" then "when i say scaffold, i actually just want a skeleton ... the admin stuff"                                                                                      |
| Claude Code | Opus 5.5        | Generated the AI page: a CS5800 problem set visualizer (`problem-set-visualizer.html`, `css/visualizer.css`, `js/visualizer/`) with step-through animations for Pset 1 #1, #4, #5, pseudocode/proof views copied from the course solutions, and docs/visualizer.md. | "an algorithm visualizer that i can use throughout the semester ... dropdown1 is for selecting which problem ... dropdown two is change the top pane from problem description to pseudocode to correctness proof ..." plus answers to its clarifying questions |

If you did not use a tool for some part of the project, say so explicitly — the
rubric asks for the description either way.

## Checklist

Tracking the assignment rubric.

- [ ] Design document (description, personas, user stories, mockups)
- [ ] Meaningful homepage content
- [x] ES6 modules (`type: "module"` in package.json, `type="module"` on scripts)
- [ ] Deployed to a public page
- [ ] Original differentiating component
- [x] CSS / JS / images in separate folders
- [x] Meta information: author, description, icon
- [ ] Original JS functionality, >5 lines, no libraries
- [x] Formatted with Prettier
- [ ] W3C compliant — https://validator.w3.org/
- [ ] Class ESLint config, no errors
- [ ] All images have `alt`
- [x] 2 HTML pages + a third AI-generated page
- [x] Classes used to identify elements
- [x] Standard tags only (no `div` buttons)
- [x] Organized CSS, no `!important`
- [x] Grid / flexbox layout
- [ ] README: author, class link, objective, screenshot, build instructions
- [x] `package.json` listing dependencies
- [x] MIT license
- [ ] Short public narrated video
- [ ] Google Form submission correct
- [ ] GenAI usage described
- [ ] Code review completed

## License

[MIT](LICENSE)
