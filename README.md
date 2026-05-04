# Scroller

**v0.3.0** — The dumb teleprompter you never knew you wanted.

A small, fast, no-build teleprompter for the web. Paste a script on the left, scroll it on the right. Vanilla HTML/CSS/JS — no framework, no bundler, no dependencies beyond Google Fonts.

## Run it

```
python3 -m http.server 5174
```

Open <http://localhost:5174/>. Or just double-click `index.html`.

## Files

```
index.html   markup only
styles.css   Studio theme — warm shell, recessed dark screen, amber accent
app.js       state, scrolling engine, editor↔prompter sync, shortcuts
```

## Features

- **Live editor → prompter sync.** Click in the script and the prompter cues that line just below the reading band, ready to scroll up into it.
- **Click-to-seek on the prompter.** Click any line to jump to it.
- **Speed (1–10) and size (36–96px)** with a live WPM readout in the rail.
- **Mirror / flip** for beam-splitter rigs.
- **Fullscreen** mode hides chrome.
- **Collapsible script panel** for a wider stage.
- **Autosave** to `localStorage` — your script survives reloads.
- **Share / save via bookmarks.** Your script lives in the URL hash (gzip + base64url). Bookmark the page (Cmd/Ctrl+D) to save a script; click the bookmark to load it. Click the **Link** button to copy a shareable URL. Practical limit ~2000 words per link.

## Keyboard

| Key       | Action                  |
|-----------|-------------------------|
| Space     | Play / Pause            |
| ↑ / ↓     | Nudge up / down         |
| R         | Restart from top        |
| F         | Toggle fullscreen       |
| ?         | Show shortcuts          |
| Esc       | Close help / exit FS    |

## Customizing

Most knobs live as CSS variables at the top of `styles.css` (`--paper`, `--ink`, `--amber`, etc.). Speed curve, reading-line position, and default text live near the top of `app.js`.

## Deploy

Hosted on Railway as a static site. Local equivalent:

```
npm start    # runs `npx serve` on $PORT (default 5197 locally)
```

Railway picks up `railway.json` + `package.json` automatically — no build step.

## Browser

Modern Chrome/Firefox/Safari/Edge. Uses `requestAnimationFrame`, `ResizeObserver`, and CSS variables.
