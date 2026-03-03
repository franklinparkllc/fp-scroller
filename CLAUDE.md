# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Scroller** is a lightweight web-based teleprompter application built with vanilla HTML, CSS, and JavaScript. It's a single-file application (`index.html`) with no build process or external dependencies.

### Key Characteristics

- **Single-file application**: All HTML, CSS, and JavaScript in one file
- **No build tools**: Direct browser execution, no npm/build scripts needed
- **No dependencies**: Vanilla JavaScript only (uses Google Fonts via CDN)
- **Responsive design**: Two-panel layout (script editor + prompter display)

## Architecture

### Layout & Structure

The application uses a three-section layout:

1. **Header** (48px fixed): App title with visual accent
2. **Workspace** (flex, main content):
   - **Editor Panel** (38% width, collapsible): Script input textarea on light background
   - **Prompter Panel** (remaining width): Dark teleprompter display with controls

### Core State Management

All app state lives in a single `state` object (lines 384-393):
- `isPlaying`: Boolean for animation loop status
- `scrollY`: Scroll offset in pixels (negative = scrolled down)
- `speed`: Speed slider value (1-10)
- `fontSize`: Font size in pixels (40-96)
- `text`: Current script content
- `atEnd`: Flag for when scrolling reaches the end

### Key Interaction Patterns

**Scrolling Engine** (lines 436-457):
- Uses `requestAnimationFrame` for smooth animation
- Speed is mapped to pixels-per-millisecond via `speedToPxPerSecond()` (line 417-420)
- Stops when scroll reaches `maxScroll()` limit (line 427-433)

**Editor-to-Prompter Sync** (lines 529-565):
- Click/arrow in editor → prompter jumps to that caret position
- Uses a hidden mirror div to measure text height without rendering
- Maps textarea caret position to visual scroll position

**Prompter Click-to-Seek** (lines 511-527):
- Click on prompter text → scrolls to center that text on screen
- Pauses scrolling on click

**Panel Collapse** (lines 617-626):
- Editor panel collapses horizontally with animation
- Collapse button stays visible for re-expansion

### Custom Elements & Styling Patterns

- **Sliders**: Custom styled with buttons for increment/decrement (lines 214-272)
- **Play/Pause button**: Color change based on state (`playing` class, line 187)
- **Fade effect**: Gradient overlay at bottom of prompter (line 274-283)
- **Reading line**: Visual position at 38% from top (configurable, line 431)

## Development Guidelines

### Modifying the Application

Since this is a single-file app, keep changes contained and testable:

- **State changes**: Update the `state` object and relevant event listeners
- **UI changes**: Modify inline styles or add CSS rules in the `<style>` block
- **Feature additions**: Add event listeners at the end of the script section
- **Default text**: Edit `state.text` initialization (line 391)

### Testing Approach

No automated test suite. Manual testing checklist:

- [ ] Script input updates prompter display in real-time
- [ ] Play/Pause button controls scrolling
- [ ] Speed slider (1-10) produces expected scroll speeds
- [ ] Font size slider (40-96px) resizes text and updates layout
- [ ] Keyboard shortcuts (Space, Arrow Up/Down) work outside editor
- [ ] Click in editor jumps prompter to that position
- [ ] Click on prompter text centers it on screen
- [ ] Panel collapse/expand works smoothly
- [ ] Scroll stops at bottom and "atEnd" flag triggers
- [ ] Restart from top after reaching end
- [ ] Responsiveness on different viewport sizes

### Customization

Common modifications (reference README.md for feature list):

- **Colors**: Edit hex values in CSS (dark theme: `#1a1a2e`, `#080808`, etc.)
- **Font family**: Change `font-family` in CSS or Google Fonts import
- **Speed range**: Adjust `speedToPxPerSecond()` formula or slider min/max
- **Font size range**: Adjust `min/max` on `#font-size-slider` (line 354) and `sizeDecrease/sizeIncrease` clamps
- **Reading line position**: Change `readingY = viewH * 0.38` (line 431) to different ratio
- **Default text**: Modify `state.text` initialization (line 391)

## Browser Compatibility

Works on modern browsers supporting:
- CSS Grid and Flexbox
- CSS Transforms
- ResizeObserver API
- ES6+ JavaScript

Tested on: Chrome, Firefox, Safari, Edge

## Performance Considerations

- **Animation loop**: Uses `requestAnimationFrame` for 60fps scrolling
- **ResizeObserver**: Watches editor textarea width changes (line 613-615)
- **Hidden mirror div**: Efficient text measurement without rendering cost
- **No external state management**: All state in-memory object

