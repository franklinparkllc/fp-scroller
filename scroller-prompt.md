You are an expert web developer with a keen sense of design and spacing. When you write code you are excellent about anticipating failure modes and debugging various app states.

I have tasked you with building a polished, modern, engaging, single-file teleprompter web app called Scroller in one index.html — vanilla HTML/CSS/JS only. No build steps, no frameworks. Use Google Fonts: Instrument Sans for prompter and for UI/Editor.

1. Layout Architecture

App Header (44px): Dark bar, flex-shrink: 0. Small uppercase title "SCROLLER" and version/tagline.

Workspace: flex: 1; display: flex; overflow: hidden;.

Editor Panel: Width 34% (min 260px, max 480px). Background #fafaf9. Contains a textarea in Instrument Sans.

Collapse Mechanism: The panel must have a wrapper div for content. When collapsed, set width: 0 and min-width: 0 on the panel, but keep a 24px purple tab (.collapse-tab) visible on the right edge to allow expanding.

Prompter Column: flex: 1; display: flex; flex-direction: column;.

Controls Bar (In-Flow): Background #131316. Sits above the stage as a natural flex child.

Stage: flex: 1; overflow: hidden; position: relative;.

2. The Scrolling Engine

Scroll Model: Use a global state object S tracking scrollY.

Core Formula: translateY = readingLinePx - scrollY.

readingLinePx = 38% of stage height.

translateY is applied to #text-wrap.

Clamping: scrollY must stay between 0 and maxScrollY (where maxScrollY = textHeight - buffer).

Initialization (Critical): On window.onload, you must explicitly call the setSpeed and setSize functions to sync the DOM's initial CSS with the internal state values (e.g., ensure 48px is actually rendered at start).

3. Precision Caret Syncing

The "Mirror" Strategy: To sync the editor cursor with the prompter, do NOT use percentages.

Create a hidden #prompter-mirror div.

This mirror must perfectly replicate the prompter's width, font-size, font-family, line-height, and padding.

On keyup or click in the editor, copy the text up to the cursor into the mirror, append a dummy <span>|</span>, and set S.scrollY = marker.offsetTop.

4. Interaction & Controls

Controls:

Play/Pause toggle (Pill-shaped, changes from Purple to Red .playing state).

Speed Chip (1–10). Size Chip (40–96).

Chips include - / + buttons and a range slider.

Stage Interaction: Clicking the stage calculates the distance between the click and the reading line, nudging scrollY so the clicked text jumps to the reading line.

Keyboard: Space to toggle, Up/Down arrows to nudge ±60px (gate shortcuts so they don't fire while typing in the textarea).

5. Design Tokens

--bg-deep: #0a0a0b (Stage background)

--bg-surface: #131316 (Controls background)

--accent: #6366f1 (Purple buttons/tabs)

--red: #f43f5e (Recording/Playing state)

--editor-bg: #fafaf9

Prompter Text: Instrument Sans, 500 weight, -0.01em letter spacing, 1.55 line-height.

6. Delivery Requirement

Single index.html. Initialize with a standard onboarding script. Ensure updateDimensions() is called on every resize and font-size change to recalculate textH correctly.