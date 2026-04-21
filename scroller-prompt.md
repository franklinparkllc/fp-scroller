You are an expert web developer with a keen sense of design and spacing. When you write code you are excellent about anticipating failure modes and debugging various app states.

I have tasked you with building a polished, modern, engaging, single-file teleprompter web app called **Scroller** in one `index.html` — vanilla HTML / CSS / JS only. No build steps, no frameworks. Use Google Fonts: **Instrument Sans** for the prompter and UI, **JetBrains Mono** for the editor textarea and numeric readouts.

---

## 1. Layout Architecture

- **App Header (44px):** Dark bar with a subtle vertical gradient (`linear-gradient(180deg, #17171c, #121215)`) and a faint inset top highlight (`inset 0 1px 0 rgba(255,255,255,0.03)`), `flex-shrink: 0`. Leading 10×10 gradient logo mark (`linear-gradient(135deg, --accent-hi, --accent-lo)`, 2px radius, subtle glow). Small uppercase title `SCROLLER` (letter-spacing `0.12em`) followed by a `/` separator and tagline. Bordered bottom with a subtle white-alpha line.
- **Workspace:** `flex: 1; display: flex; min-height: 0;`.
- **Editor Panel:** Width 34% (min 260px, max 480px). Background `#fbfbfa` (warm off-white), with `box-shadow: inset -1px 0 0 rgba(0,0,0,0.04), 1px 0 0 rgba(0,0,0,0.2)` for an elegant edge against the dark stage. Small uppercase `SCRIPT` label, full-height textarea (JetBrains Mono, 13.5px, line-height 1.7), and a thin footer (`justify-content: space-between`) containing a `v1.2.0` version string on the left and a live `N words · M chars` stats readout on the right (both JetBrains Mono, muted).
- **Collapse Mechanism:** Indigo 16×64 tab on the right edge of the editor panel (`.collapse-btn`). Clicking it toggles a `.collapsed` class that sets the panel's `width` and `min-width` to `0` via a 0.3s cubic-bezier transition. The tab stays visible when collapsed so the user can re-expand.
- **Prompter Panel:** `flex: 1; display: flex; flex-direction: column; position: relative; overflow: hidden;` with background `--bg-deep`.
- **Controls Bar (Overlay):** `position: absolute; top: 0; left: 0; right: 0; z-index: 10;` inside the prompter panel. Semi-transparent dark gradient + `backdrop-filter: blur(16px)` so prompter text is visible faintly behind it. Padded `12px 22px` with `gap: 14px`. Finished with `box-shadow: inset 0 1px 0 rgba(255,255,255,0.04), 0 1px 0 rgba(0,0,0,0.4)` for a subtle bevel.
- **Prompter Viewport:** `flex: 1; overflow: hidden; position: relative; cursor: pointer; padding: 112px max(8%, 48px) 0;` — the top padding keeps text from sliding under the controls bar.
- **Top & Bottom Fades:** `.prompter-panel::before` (top, 140px, starting at `top: 58px`) and `.prompter-panel::after` (bottom, 160px) paint smooth multi-stop linear gradients from `--bg-deep` to transparent, so text softly emerges and dissolves at the edges of the stage.

---

## 2. The Scrolling Engine

- **State:** a single `state` object tracking `isPlaying`, `scrollY`, `speed` (1–10, default 5), `fontSize` (40–96, default 48), `text`, `rafId`, `lastTimestamp`, `atEnd`.
- **Speed mapping:** `speedToPxPerSecond(v) = round(3.51 * v^1.5)`.
- **Reading line:** computed as `viewH * 0.38`. This is where the "current" line visually sits.
- **Scroll application:** `prompterText.style.transform = translateY(${state.scrollY}px)` (scrollY is negative while scrolling down).
- **maxScroll:** `-(textHeight - readingLinePx)`; clamp `scrollY` into `[maxScroll, 0]`.
- **rAF loop:** standard `requestAnimationFrame` tick using delta-time; when `scrollY <= maxScroll`, set `atEnd = true`, pause, and stop.
- **Restart from end:** if the user presses Play while `atEnd`, reset `scrollY = 0` first.
- **Init (critical):** on load, run `loadScript()`, sync the textarea, re-render, then call `updateWpm()` inside a `requestAnimationFrame` so layout is measured.
- **Reflow:** call a shared `renderPrompterText()` on every text/font-size/resize change; it preserves scroll *ratio* across reflows so the user's position doesn't jump.

---

## 3. Precision Caret Syncing

Sync the editor cursor to the prompter without using percentages.

- Create a hidden `textMirror` div offscreen (`top: -9999px`) with exactly the same `font-family`, `font-size`, `line-height`, `white-space`, `word-break`, and `padding` as the textarea.
- On `click` or arrow-key `keyup` in the editor, read `scriptInput.selectionStart`, set the mirror's text to the substring before the caret, measure its `offsetHeight`, and compute a ratio against the mirror's full-text height.
- Multiply that ratio by `prompterText.offsetHeight` and subtract from `viewH * 0.5` to land the clicked line near vertical center; clamp to `[maxScroll, 0]` and apply.
- Re-measure the mirror width via a `ResizeObserver` on the textarea so collapse animations don't break alignment.

---

## 4. Controls Bar

All controls sit in a single horizontal flex row. Every interactive element is **34px tall** for visual consistency.

Left group (playback):
1. **Play / Pause pill** — 92×34 indigo pill rendered with a three-stop vertical gradient (`linear-gradient(180deg, --accent-hi, --accent, --accent-lo)`), inset top highlight + inset bottom shadow, and a soft outer drop-shadow. Hover brightens via `filter: brightness(1.08)` and expands the accent glow; active press adds `translateY(1px)`. Toggles `.playing` class which swaps the gradient to the red palette (`--red-hi/--red/--red-lo`) with `⏸ Pause` label.
2. **Restart icon button** (`↺`) — 34×34 dark icon button. Jumps `scrollY` back to 0 and clears `atEnd` without un-pausing.
3. **Vertical divider** — 1×24 subtle rule with 6px margin on each side.

Center groups (settings chips — dark rounded pills with a thin border and an `inset 0 1px 0 rgba(255,255,255,0.035)` bevel):
4. **Speed chip:** uppercase `SPEED` label, `−` button, range slider (1–10, width 96px), `+` button, numeric value, then a vertical rule and a **WPM readout** (`162 wpm`) computed live from word count ÷ (textHeight / speed-in-px/s).
5. **Size chip:** uppercase `SIZE` label, `−` button, range slider (40–96, `step="2"`, width 88px), `+` button, numeric value (no "px" suffix). The `−/+` buttons step by 4px.

Range sliders render a **filled progress track**: the track background is a four-stop gradient keyed off a CSS custom property `--fill` (percentage), so the accent color fills from the left up to the thumb. Update `--fill` on every `input` event (and on load) via `el.style.setProperty('--fill', pct + '%')`. Thumbs are 14×14 white-gradient circles with a 2px accent ring and a soft drop-shadow; hover expands to a 6px accent-soft halo and scales `1.1`.

Spacer (`flex: 1`).

Right group (modes):
6. **Flip icon-btn-group:** `⇄` (horizontal, for beam-splitter rigs) and `⇅` (vertical). Both toggle an `.active` class and apply a corresponding `.flip-x` / `.flip-y` class to the `.prompter-viewport` (`transform: scaleX(-1)` / `scaleY(-1)`). Applied to the *viewport*, not the text, so the scroll transform on `.prompter-text` still works.
7. **Vertical divider.**
8. **Fullscreen / Help icon-btn-group:** `⛶` toggles `body.fullscreen` (hides header + editor panel via CSS); `?` toggles a help overlay.

All icon buttons share a single `.icon-btn` style: 34×34, subtle white-alpha background, subtle border, light-gray glyph that brightens on hover/active. `:active` applies `transform: scale(0.94)` for tactile feedback. Active-state toggled buttons use `--accent-soft` background + indigo border.

---

## 5. Stage Features

- **Reading line indicator:** an absolutely-positioned 1px `.reading-line` div inside the viewport at `top: 38%`, drawn as a horizontal gradient that fades in at both ends (`linear-gradient(to right, transparent, rgba(124,126,245,0.5) 50%, transparent)`) with a soft outer glow (`box-shadow: 0 0 8px var(--accent-glow)`) and small indigo triangle markers (`::before` / `::after`, 4px borders, `drop-shadow` glow) at its left and right edges. Pointer-events none.
- **Click-to-seek on the stage:** clicking inside the viewport computes the click's Y relative to the text, then repositions `scrollY` so the clicked line lands at the 50% vertical center, clamps, applies, and pauses playback.
- **localStorage persistence:** on every `input` event, save `state.text` under key `scroller:script`. On init, read it back and pre-fill the textarea + state before the first render. Wrap `localStorage` access in try/catch so private-mode failures are silent.
- **Fullscreen mode:** `body.fullscreen` rule hides `header` and `.editor-panel`. Toggled by the fullscreen button or the `F` key. After toggling, schedule an `updateMirrorWidth() / renderPrompterText() / updateWpm()` so layout settles.
- **Help overlay:** full-viewport fixed element (`.help-overlay`) with a dark translucent background + blur, centering a `.help-card`. The card shows a `<dl>` of shortcuts (Space, ↑↓, R, F, ?, Esc) with monospace indigo `<dt>` chips. Toggled by `?` / help button; dismissed by click-outside or `Escape`.

---

## 6. Keyboard Shortcuts

Gate all shortcuts so they don't fire while the editor textarea is focused (except Escape, which always works).

| Key       | Action                              |
|-----------|-------------------------------------|
| `Space`   | Play / Pause                        |
| `↑` / `↓` | Nudge scroll ±80px                  |
| `R`       | Restart from top                    |
| `F`       | Toggle fullscreen                   |
| `?`       | Toggle help overlay                 |
| `Esc`     | Close help / exit fullscreen        |

---

## 7. Design Tokens

```
--bg-deep:      #0a0a0b   /* stage background */
--bg-surface:   #131316   /* header / panel */
--bg-elevated:  #1a1a1f   /* help card */
--bg-hover:     #222228
--border-subtle: rgba(255,255,255,0.06)
--border-medium: rgba(255,255,255,0.10)
--text-primary:  #e8e8ec
--text-secondary:#8a8a96
--text-muted:    #55555f
--accent:        #5b5ef0   /* warm electric indigo: primary action */
--accent-hi:     #7c7ef5
--accent-lo:     #4a4de0
--accent-soft:   rgba(91,94,240,0.15)
--accent-glow:   rgba(91,94,240,0.40)
--red:           #f43f5e   /* playing state */
--red-hi:        #f75c77
--red-lo:        #dc2a48
--editor-bg:     #fbfbfa
--editor-text:   #2c2c30
--editor-border: #e8e8e6
--radius-sm: 6px
--radius-md: 10px
--radius-lg: 14px
--radius-pill: 100px
--transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1)
```

- **Prompter text:** Instrument Sans, weight 500, letter-spacing `-0.015em`, line-height 1.5, default 48px, `text-wrap: pretty`, `max-width: 1100px; margin: 0 auto` so long lines don't sprawl on wide screens.
- **Editor textarea:** JetBrains Mono, 13.5px, line-height 1.7, indigo caret.
- **UI labels & buttons:** Instrument Sans; numeric readouts (`5`, `48`, `162 wpm`, version) in JetBrains Mono.

---

## 8. Delivery Requirements

- Single `index.html`, no build step, no bundler, no external JS libraries.
- Initialize with a standard onboarding / lorem-ipsum script so the app is usable on first load.
- `renderPrompterText()` must preserve the user's scroll ratio across text and font-size changes.
- `updateWpm()` must be called on speed change, font-size change, text input, fullscreen toggle, and initial load.
- Textarea width changes (from the collapse animation) must trigger `updateMirrorWidth()` via a `ResizeObserver`.
- All `localStorage` access wrapped in try/catch.
- The prompter's `.prompter-text` should have `user-select: none` so selection doesn't interfere with click-to-seek.
- Ensure the reading-line indicator, flip modes, restart, fullscreen, help overlay, and WPM readout are all functional and accessible via both mouse and keyboard.
- Version the app as `v1.2.0` in the editor footer, alongside a live `N words · M chars` stats readout kept in sync with every `input` event and on initial load.
- Update each range slider's `--fill` custom property on every input change and on initial load so the filled-track gradient stays aligned with the thumb.
