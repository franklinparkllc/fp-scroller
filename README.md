# Scroller – A Web Teleprompter

A lightweight, interactive teleprompter application built with vanilla HTML, CSS, and JavaScript. Perfect for content creators, presenters, and anyone needing a smooth scrolling teleprompter.

## Features

- **Live Script Editing**: Edit your script on the left panel and see it instantly in the prompter
- **Smooth Scrolling**: Adjustable speed control for natural pacing
- **Font Size Control**: Scale text from 18px to 72px for better visibility
- **Smart Syncing**: Click in the script editor to jump the prompter to that position
- **Click-to-Seek**: Click anywhere on the prompter text to jump to that line
- **Reading Line Indicator**: Visual guide (cyan line) shows your current reading position
- **Fade Effects**: Gradient overlays at top and bottom for a polished appearance
- **Responsive Layout**: Collapsible editor panel to maximize prompter space
- **Keyboard Shortcuts**:
  - `Space`: Play/Pause
  - `Arrow Up/Down`: Manual scroll (10px increments)

## How to Use

1. **Open the file** in any modern web browser
2. **Paste your script** into the left panel
3. **Adjust settings**:
   - **Speed**: 1 (slow) to 10 (fast)
   - **Size**: 18px to 72px
4. **Click Play** or press `Space` to start scrolling
5. **Click on the prompter text** to seek to a specific line
6. **Collapse the editor** using the `‹` button for full-screen viewing

## Layout

- **Left Panel**: Script editor with live input
- **Right Panel**: Teleprompter display with controls
- **Header**: App title and status
- **Controls**: Play/Pause button, Speed slider, Font size slider

## Technologies

- **HTML5**: Semantic structure
- **CSS3**: Modern styling with gradients and transitions
- **Vanilla JavaScript**: No dependencies, pure DOM manipulation

## Browser Support

Works on all modern browsers (Chrome, Firefox, Safari, Edge) that support:
- CSS Grid and Flexbox
- CSS Transforms
- ResizeObserver API
- ES6+ JavaScript

## Keyboard Controls

| Key | Action |
|-----|--------|
| `Space` | Play/Pause scrolling |
| `Arrow Up` | Scroll up (10px) |
| `Arrow Down` | Scroll down (10px) |

## Customization

Feel free to modify:
- Colors in the CSS (dark theme by default)
- Font family and sizes
- Speed/font size slider ranges
- Reading line position (currently 38% from top)

## Future Ideas

- Export scripts as files
- Multiple script library
- Dark/Light theme toggle
- Teleprompter mirror mode (reverse for physical glass)
- Text highlighting during playback
