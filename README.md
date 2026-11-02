# gustavocaiano.github.io

Personal website: an alpine valley with a few tiny things to find.

- **Log cabin** – about me, experience, education & how I can help · **Signpost** – one arrow per project
- **Bald eagle** – contact form (EmailJS)

## Structure
- `index.html`, `home.css`, `home.js` – the homepage. The cabin and signpost are part of `img/valley.jpg`; `home.js` adds their hit areas, the smoke and the eagle; EN/PT copy lives at the top of that file.
- `tools/render-valley.mjs` – regenerates `img/valley.jpg` from an eroded procedural terrain (`build`, then `render`; takes a few minutes). `tools/render-name-mask.mjs` (needs Playwright) rasterises the name for `render-valley.mjs name`, which writes `img/name-cloud.png`. Not needed at runtime.
- `snapper/` – Snapper landing page. It still uses the legacy `styles.css`, `script.js`, `translations.js` and `wave-background.js`.

## Local development
No build step: `python3 -m http.server` and open http://localhost:8000. Pushing to `main` deploys via GitHub Pages.
