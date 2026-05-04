# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

**Scroller** (v0.2.1) — a vanilla HTML/CSS/JS teleprompter. No build step, no dependencies beyond Google Fonts via CDN. Open `index.html` directly or serve with `python3 -m http.server`.

## Files

- `index.html` — semantic markup only. Two regions: `.editor` (textarea) and `.stage` (prompter screen), plus a top `.rail` and bottom `.desk` of controls.
- `styles.css` — Studio theme. Warm cream shell, recessed dark prompter screen, amber accent, tactile chunky controls. CSS variables at the top for theming.
- `app.js` — IIFE. Owns `state`, the rAF scroll loop, editor↔prompter caret sync, keyboard shortcuts, autosave.

## Architecture notes

**State** lives in a single object in `app.js`: `isPlaying`, `scrollY`, `speed`, `fontSize`, `text`, `atEnd`, plus rAF bookkeeping.

**Scrolling** uses `requestAnimationFrame` and `translateY` on `#prompter-text`. Speed maps via `speedToPxPerSec(v) = round(3.6 * v^1.5)` (px/sec).

**Reading line alignment** is a coupled pair you must keep in sync:
- `.band` `top:` in `styles.css` (visual)
- `READING_RATIO` in `app.js` (math)
- `.viewport` `padding-top:` in `styles.css` (must match the band top so `scrollY=0` cues the first line at the band, not above it)

**Editor → prompter sync** uses a hidden mirror div with the same font/padding/width as the textarea to measure caret-position-as-height-ratio, then maps that to the prompter's text height. The mapping puts the synced line's *top* at the band — so when you click before "Hello," "Hello" sits at the band, not bisected by it.

**Collapse** animates `width → 0` on `.editor` and slides `.collapse-btn` from `right:-13px` to `-26px` so the toggle stays visible past the seam. After the 320ms transition we re-run `updateMirrorWidth()` and `render()`.

## Sharing / save

Scripts can be saved by **bookmarking the page** — the script lives in `location.hash` as `#s=<gzip+base64url>`.

- On load: if `#s=` is present, decode and load (overrides `localStorage`).
- On edit: debounced (~600ms) `history.replaceState` keeps the URL current so Cmd+D bookmarks the latest. No new history entries are created.
- Share button (`#share-btn`): copies the URL to clipboard with a "Copied" flash.
- Encoding helpers: `encodeScript` / `decodeScript` in `app.js` use `CompressionStream('gzip')`. Practical link size limit ~2000 words.

## Deploy

Railway (not GitHub Pages). `package.json` `start` script runs `npx serve` on `$PORT`; `railway.json` declares the start command. No build step.

## Conventions

- Keep it dependency-free. No npm, no bundler.
- Theme via CSS variables — don't hard-code colors in component rules.
- New interactions: add the handler in `app.js`, wire the element by `id`, prefer `requestAnimationFrame` for anything layout-sensitive.

## Manual test checklist

- Type in editor → prompter updates live, autosave fires
- Click in editor at position 0 → first line sits at the band, not above it
- Click on prompter line → that line jumps to the band, scrolling pauses
- Space / ↑↓ / R / F / ? / Esc shortcuts work outside the textarea
- Speed and size sliders update WPM readout and re-layout
- Mirror / flip toggle visual transforms with active state
- Fullscreen hides rail/editor/desk; Esc exits
- Collapse hides editor, button stays visible, expand restores layout
- Reload preserves script (`localStorage` key `scroller:script:v2`)
