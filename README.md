# Scroller – A Web Teleprompter

A lightweight, distraction-free teleprompter application built with vanilla HTML, CSS, and JavaScript. Perfect for content creators, presenters, and anyone needing smooth scrolling with precise control.

## Features

- **Live Script Editing**: Edit your script on the left and see it instantly in the prompter display
- **Smooth Scrolling**: Configurable speed control (1–10) with exponential scaling
- **Font Size Control**: Adjust text size from 40px to 96px for visibility
- **Editor-to-Prompter Sync**: Click or navigate in the editor to jump the prompter to that position
- **Click-to-Seek**: Click anywhere on the prompter text to center and pause at that location
- **Gradient Overlays**: Polished fade effects at top and bottom of the display
- **Collapsible Editor Panel**: Hide the left panel for full-screen prompter viewing
- **Keyboard Shortcuts**:
  - `Space`: Play/Pause scrolling
  - `Arrow Up`: Scroll up (80px)
  - `Arrow Down`: Scroll down (80px)
- **Auto-Restart**: Scrolling automatically resets to the top after reaching the end
- **Modern UI**: Dark theme with frosted glass controls and polished interactions

## How to Use

1. **Open** `index.html` in any modern web browser
2. **Paste or type** your script into the left panel
3. **Adjust settings** using the top controls:
   - **Speed**: 1 (slow) to 10 (fast) — use `+`/`−` buttons or drag the slider
   - **Size**: 40px to 96px — use `+`/`−` buttons or drag the slider
4. **Click Play** or press `Space` to start scrolling
5. **Click in the prompter** to jump to that text and pause
6. **Click the `‹` button** on the editor panel to collapse it for full-screen viewing

## Layout

- **Header**: App title and tagline
- **Left Panel**: Script input textarea with version footer (collapsible)
- **Right Panel**: Teleprompter display with frosted glass control bar
- **Controls**: Play/Pause button, Speed slider, Font size slider

## Technologies

- **HTML5**: Semantic structure
- **CSS3**: Modern styling with CSS Grid, Flexbox, gradients, and backdrop blur
- **Vanilla JavaScript**: No dependencies — pure DOM manipulation and `requestAnimationFrame` for animation

## Browser Support

Works on all modern browsers that support:
- CSS Grid and Flexbox
- CSS Transforms and backdrop-filter
- ResizeObserver API
- ES6+ JavaScript

Tested on: Chrome, Firefox, Safari, Edge

## Keyboard Controls

| Key | Action |
|-----|--------|
| `Space` | Play/Pause scrolling |
| `Arrow Up` | Manual scroll up (80px) |
| `Arrow Down` | Manual scroll down (80px) |

## Customization

All styling is inline in the `<style>` block. Common modifications:

- **Colors**: Edit CSS variables (`:root` section) for dark theme
- **Font Family**: Change `--font-family` or update Google Fonts import
- **Speed Range**: Modify slider min/max or adjust `speedToPxPerSecond()` formula
- **Font Size Range**: Adjust `#font-size-slider` min/max attributes and clamping in button handlers
- **Reading Line Position**: Change `readingY = viewH * 0.38` in the `maxScroll()` function
- **Default Text**: Modify `state.text` initialization

## Technical Details

- **Scrolling**: Uses exponential speed formula (`3.51 * v^1.5`) for natural pacing across 1–10 range
- **Text Measurement**: Hidden mirror div measures textarea caret position for accurate editor-to-prompter sync
- **Performance**: `requestAnimationFrame` for 60fps smooth scrolling, `ResizeObserver` for responsive mirror width
- **Reading Position**: Set at 38% from viewport top (configurable in `maxScroll()` function)
