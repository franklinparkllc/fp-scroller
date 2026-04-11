# Scroller — Reproduction Prompt

Build a single-file teleprompter web app called **Scroller** in one `index.html` — vanilla HTML/CSS/JS only, no build step, no frameworks, no dependencies except Google Fonts (Instrument Sans + JetBrains Mono).

## Layout

- Full-viewport, no page scroll. Three vertical sections: 44px header, then a flex workspace.
- Header: dark bar, small uppercase title "SCROLLER" + muted tagline "the dumb teleprompter you never knew you wanted".
- Workspace is split into two panels:
  - **Left — Editor panel** (34% width, min 260px, max 480px): light cream background (`#fafaf9`), "SCRIPT" uppercase label on top, full-height `<textarea>` in JetBrains Mono 13px / 1.65 line-height, and a small footer showing a version string (`v1.0.0`).
  - **Right — Prompter panel** (flex-1): near-black background (`#0a0a0b`), large Instrument Sans text, top-to-bottom scrolling teleprompter.
- A narrow vertical collapse button tab sits on the right edge of the editor panel (accent purple, rounded right side) that collapses the editor to width 0 with a smooth transition, and toggles its chevron (‹ / ›).

## Prompter Controls

Floating bar pinned to the top of the right panel, with a translucent dark gradient + backdrop blur.

- Pill-shaped Play/Pause button (88px wide). Accent purple (`#6366f1`) when paused, red (`#f43f5e`) when playing. Shows ▶ Play / ⏸ Pause.
- A thin vertical divider.
- Two "control group" chips (rounded, subtle white border) each containing: uppercase micro-label, a `−` button, a native range slider (custom-styled thumb with purple glow ring), a `+` button, and a mono value readout.
  - **Speed**: range 1–10, default 5.
  - **Size**: range 40–96, step 8, default 48, readout like `48px`.

## Prompter Viewport

- Large text (default 48px, Instrument Sans, weight 500, line-height 1.55, letter-spacing -0.01em), padded 10% horizontally and 72px top.
- Bottom fade: `::after` pseudo-element with a vertical gradient from the background to transparent (~120px tall).
- Top fade: `::before` pseudo-element with a similar gradient just under the controls bar.
- Text container uses `transform: translateY(...)` for scrolling (**not** `scrollTop`). `will-change: transform`. `padding-bottom: 60vh` so the last line can reach the reading line.
- Empty state: muted italic "Paste your script on the left…"

## Scrolling Engine

- Single `state` object holding `isPlaying`, `scrollY`, `speed`, `fontSize`, `rafId`, `lastTimestamp`, `text`, `atEnd`.
- `requestAnimationFrame` loop. Speed curve: `pxPerSecond = round(3.51 * speed^1.5)` — non-linear so the slider feels good at both ends.
- Reading line at 38% down the viewport. `maxScroll = -(textHeight - viewportHeight * 0.38)`. Stop + flag `atEnd` when reached; next Play resets to top.

## Interactions

- Typing in the editor updates the prompter live and preserves the current scroll **ratio** across re-renders (measure height before/after, rescale `scrollY`).
- Clicking anywhere in the prompter viewport seeks so the clicked line centers on screen, and pauses playback.
- Clicking or arrow-keying in the editor textarea syncs the prompter to the caret: use a hidden absolutely-positioned mirror `<div>` (same font / size / line-height / padding / width as the textarea) to measure the pixel height of the text before the caret, convert that to a ratio, and map it onto the prompter text height. A `ResizeObserver` on the textarea keeps the mirror width in sync.
- Keyboard shortcuts (only when the textarea isn't focused): **Space** toggles play/pause, **↑ / ↓** nudge scroll by 80px, clamped.
- `−` / `+` buttons on each slider step by 1 (speed) or 8 (size), clamped. Font size changes also update `line-height: fontSize * 1.55`.

## Design Tokens

CSS custom properties on `:root`:

- **Dark surfaces**: `--bg-deep #0a0a0b`, `--bg-surface #131316`, `--bg-elevated #1a1a1f`
- **Text**: `--text-primary #f0f0f2`, `--text-secondary #8a8a96`, `--text-muted #55555f`
- **Accent**: `--accent #6366f1` with soft/glow variants
- **Red**: `#f43f5e`
- **Editor light theme**: `--editor-bg #fafaf9`, `--editor-text #2c2c30`, `--editor-border #e8e8e6`
- **Radii**: 6 / 10 / 14 / pill
- **Transition**: `0.2s cubic-bezier(0.4, 0, 0.2, 1)`

## Delivery

Ship it as a single `index.html` with `<style>` and `<script>` inline. Initialize `state.text` with a couple of paragraphs of Lorem ipsum so the app is usable on first load. No comments cluttering the CSS, but light section-divider comments (`/* ── Header ── */`) are welcome in both CSS and JS.

## Non-Negotiables

- Use `transform: translateY` for scrolling (never `scrollTop`).
- Play/Pause button toggles a `.playing` class for the red state — don't inline-style the color.
- Guard the keyboard shortcuts with `document.activeElement === scriptInput` so typing in the editor doesn't hijack Space.
