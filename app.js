(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);

  // ── DOM ──
  const scriptInput   = $('script-input');
  const prompterText  = $('prompter-text');
  const viewport      = $('prompter-viewport');
  const playBtn       = $('play-pause-btn');
  const playLabel     = playBtn.querySelector('.lbl');
  const speedSlider   = $('speed-slider');
  const speedValue    = $('speed-value');
  const fontSlider    = $('font-size-slider');
  const fontValue     = $('font-size-value');
  const wpmReadout    = $('wpm-readout');
  const restartBtn    = $('restart-btn');
  const flipXBtn      = $('flip-x-btn');
  const flipYBtn      = $('flip-y-btn');
  const fullscreenBtn = $('fullscreen-btn');
  const helpBtn       = $('help-btn');
  const helpOverlay   = $('help-overlay');
  const editorPanel   = $('editor-panel');
  const collapseBtn   = $('collapse-btn');
  const editorStats   = $('editor-stats');
  const shareBtn      = $('share-btn');

  const STORAGE_KEY = 'scroller:script:v2';
  const READING_RATIO = parseFloat(viewport.dataset.readingPos || '0.38');

  const DEFAULT_TEXT =
    "When the lights come up, breathe. Find the lens. The first sentence is a handshake — slow, deliberate, warm.\n\n" +
    "The rest of the script will run at whatever pace you set. Use the speed knob on the right. The amber band is your anchor; keep your eyes there and let the words come to you.\n\n" +
    "Press Space to start. Press it again to stop. That is the whole interface.";

  const state = {
    isPlaying: false,
    scrollY: 0,
    speed: parseInt(speedSlider.value, 10) || 5,
    fontSize: parseInt(fontSlider.value, 10) || 56,
    rafId: null,
    lastTs: null,
    text: DEFAULT_TEXT,
    atEnd: false,
  };

  // ── Hash-link encode/decode (gzip + base64url) ──
  async function encodeScript(text) {
    const stream = new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'));
    const buf = await new Response(stream).arrayBuffer();
    let bin = '';
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  }
  async function decodeScript(s) {
    const bin = atob(s.replace(/-/g,'+').replace(/_/g,'/'));
    const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    return new Response(stream).text();
  }

  // ── Persistence ──
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) state.text = saved;
  } catch (e) {}
  scriptInput.value = state.text;

  // If URL has #s=..., load that script (overrides localStorage).
  if (location.hash.startsWith('#s=')) {
    decodeScript(location.hash.slice(3))
      .then((text) => {
        state.text = text;
        scriptInput.value = text;
        try { localStorage.setItem(STORAGE_KEY, text); } catch(e) {}
        render();
        updateStats();
        requestAnimationFrame(updateWpm);
      })
      .catch(() => {});
  }

  // ── Helpers ──
  function speedToPxPerSec(v) { return Math.round(3.6 * Math.pow(v, 1.5)); }

  function setSliderFill(el) {
    const min = parseFloat(el.min) || 0;
    const max = parseFloat(el.max) || 100;
    const pct = ((parseFloat(el.value) - min) / (max - min)) * 100;
    el.style.setProperty('--fill', pct + '%');
  }

  function applyFontSize() {
    prompterText.style.fontSize = state.fontSize + 'px';
    prompterText.style.lineHeight = (state.fontSize * 1.45) + 'px';
  }

  function applyScroll() {
    prompterText.style.transform = `translateY(${state.scrollY}px)`;
  }

  function maxScroll() {
    const textH = prompterText.offsetHeight;
    const viewH = viewport.offsetHeight;
    return -(textH - viewH * READING_RATIO);
  }

  function clampScroll() {
    state.scrollY = Math.min(state.scrollY, 0);
    state.scrollY = Math.max(state.scrollY, maxScroll());
  }

  // ── Render ──
  function render() {
    const before = prompterText.offsetHeight || 1;
    const ratio = Math.abs(state.scrollY) / before;
    const isEmpty = state.text.trim() === '';
    if (isEmpty) {
      prompterText.textContent = 'Paste your script on the left…';
      prompterText.classList.add('is-empty');
    } else {
      prompterText.textContent = state.text;
      prompterText.classList.remove('is-empty');
    }
    requestAnimationFrame(() => {
      const after = prompterText.offsetHeight;
      state.scrollY = -(ratio * after);
      clampScroll();
      applyScroll();
    });
  }

  function updateStats() {
    const words = (state.text.match(/\S+/g) || []).length;
    editorStats.textContent =
      words.toLocaleString() + ' words · ' + state.text.length.toLocaleString() + ' chars';
  }

  function updateWpm() {
    const words = (state.text.match(/\S+/g) || []).length;
    const h = prompterText.offsetHeight;
    if (!words || !h) { wpmReadout.textContent = '— wpm'; return; }
    const sec = h / speedToPxPerSec(state.speed);
    wpmReadout.textContent = Math.round(words / (sec / 60)) + ' wpm';
  }

  // ── Animation loop ──
  function tick(ts) {
    if (!state.isPlaying) return;
    if (state.lastTs !== null) {
      const delta = ts - state.lastTs;
      const pxMs = speedToPxPerSec(state.speed) / 1000;
      state.scrollY -= delta * pxMs;
      const limit = maxScroll();
      if (state.scrollY <= limit) {
        state.scrollY = limit;
        applyScroll();
        pause();
        state.atEnd = true;
        return;
      }
    }
    state.lastTs = ts;
    applyScroll();
    state.rafId = requestAnimationFrame(tick);
  }

  function play() {
    if (state.atEnd) {
      state.scrollY = 0;
      state.atEnd = false;
      applyScroll();
    }
    state.isPlaying = true;
    state.lastTs = null;
    playBtn.classList.add('is-playing');
    playLabel.textContent = 'Stop';
    state.rafId = requestAnimationFrame(tick);
  }

  function pause() {
    state.isPlaying = false;
    if (state.rafId) cancelAnimationFrame(state.rafId);
    state.rafId = null;
    playBtn.classList.remove('is-playing');
    playLabel.textContent = 'Play';
  }

  function toggle() { state.isPlaying ? pause() : play(); }

  function restart() {
    state.scrollY = 0;
    state.atEnd = false;
    applyScroll();
    if (state.isPlaying) state.lastTs = null;
  }

  // ── Editor → prompter caret sync ──
  const mirror = document.createElement('div');
  Object.assign(mirror.style, {
    position: 'absolute', visibility: 'hidden', pointerEvents: 'none',
    top: '-9999px', left: '0',
    fontFamily: "'Geist', system-ui, sans-serif",
    fontSize: '15px', lineHeight: '1.7',
    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
    padding: '18px 22px',
  });
  document.body.appendChild(mirror);

  function updateMirrorWidth() { mirror.style.width = scriptInput.offsetWidth + 'px'; }

  function syncFromCaret() {
    if (state.text.trim() === '') return;
    const caret = scriptInput.selectionStart;
    updateMirrorWidth();
    mirror.textContent = state.text.substring(0, caret) || ' ';
    const hBefore = mirror.offsetHeight;
    mirror.textContent = state.text || ' ';
    const hFull = mirror.offsetHeight;
    if (hFull === 0) return;
    const ratio = hBefore / hFull;
    const targetY = ratio * prompterText.offsetHeight;
    state.scrollY = viewport.offsetHeight * READING_RATIO - targetY;
    clampScroll();
    applyScroll();
  }

  // ── Debounced URL hash update so Cmd+D bookmarks the latest script ──
  let hashTimer = null;
  function scheduleHashUpdate() {
    clearTimeout(hashTimer);
    hashTimer = setTimeout(async () => {
      try {
        if (state.text.trim() === '') {
          if (location.hash) history.replaceState(null, '', location.pathname + location.search);
          return;
        }
        const enc = await encodeScript(state.text);
        history.replaceState(null, '', '#s=' + enc);
      } catch (e) {}
    }, 600);
  }

  // ── Events ──
  scriptInput.addEventListener('input', () => {
    state.text = scriptInput.value;
    state.atEnd = false;
    render();
    updateStats();
    requestAnimationFrame(updateWpm);
    try { localStorage.setItem(STORAGE_KEY, state.text); } catch (e) {}
    scheduleHashUpdate();
  });
  scriptInput.addEventListener('click', syncFromCaret);
  scriptInput.addEventListener('keyup', (e) => {
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Home','End','PageUp','PageDown'].includes(e.key)) {
      syncFromCaret();
    }
  });

  speedSlider.addEventListener('input', () => {
    state.speed = parseInt(speedSlider.value, 10);
    speedValue.textContent = state.speed;
    setSliderFill(speedSlider);
    updateWpm();
  });

  fontSlider.addEventListener('input', () => {
    state.fontSize = parseInt(fontSlider.value, 10);
    fontValue.textContent = state.fontSize;
    setSliderFill(fontSlider);
    applyFontSize();
    render();
    updateWpm();
  });

  playBtn.addEventListener('click', toggle);
  restartBtn.addEventListener('click', restart);

  flipXBtn.addEventListener('click', () => {
    viewport.classList.toggle('flip-x');
    flipXBtn.classList.toggle('is-active', viewport.classList.contains('flip-x'));
  });
  flipYBtn.addEventListener('click', () => {
    viewport.classList.toggle('flip-y');
    flipYBtn.classList.toggle('is-active', viewport.classList.contains('flip-y'));
  });

  function toggleFullscreen() {
    const on = document.body.classList.toggle('is-fullscreen');
    fullscreenBtn.classList.toggle('is-active', on);
    setTimeout(() => { updateMirrorWidth(); render(); updateWpm(); }, 30);
  }
  fullscreenBtn.addEventListener('click', toggleFullscreen);

  // ── Share / copy link ──
  shareBtn.addEventListener('click', async () => {
    if (state.text.trim() === '') return;
    try {
      const enc = await encodeScript(state.text);
      const url = location.origin + location.pathname + '#s=' + enc;
      history.replaceState(null, '', '#s=' + enc);
      await navigator.clipboard.writeText(url);
      const orig = shareBtn.textContent;
      shareBtn.classList.add('is-active');
      shareBtn.textContent = 'Copied';
      setTimeout(() => {
        shareBtn.classList.remove('is-active');
        shareBtn.textContent = orig;
      }, 1200);
    } catch (e) {}
  });

  // ── Collapse ──
  function setCollapsed(collapsed) {
    editorPanel.classList.toggle('is-collapsed', collapsed);
    collapseBtn.setAttribute('aria-expanded', String(!collapsed));
    collapseBtn.title = collapsed ? 'Show script' : 'Hide script';
    setTimeout(() => { updateMirrorWidth(); render(); }, 320);
  }
  collapseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    setCollapsed(!editorPanel.classList.contains('is-collapsed'));
  });

  // ── Help ──
  function showHelp(){ helpOverlay.classList.add('is-visible'); }
  function hideHelp(){ helpOverlay.classList.remove('is-visible'); }
  function toggleHelp(){ helpOverlay.classList.toggle('is-visible'); }
  helpBtn.addEventListener('click', toggleHelp);
  helpOverlay.addEventListener('click', (e) => {
    if (e.target === helpOverlay) hideHelp();
  });

  // ── Viewport click → seek + pause ──
  viewport.addEventListener('click', (e) => {
    const tRect = prompterText.getBoundingClientRect();
    const textY = e.clientY - tRect.top;
    state.scrollY = viewport.offsetHeight * READING_RATIO - textY;
    clampScroll();
    applyScroll();
    pause();
    state.atEnd = false;
  });

  // ── Keyboard shortcuts ──
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (helpOverlay.classList.contains('is-visible')) { hideHelp(); return; }
      if (document.body.classList.contains('is-fullscreen')) { toggleFullscreen(); return; }
    }
    if (document.activeElement === scriptInput) return;
    if (e.code === 'Space') { e.preventDefault(); toggle(); return; }
    if (e.code === 'ArrowUp') {
      e.preventDefault();
      state.scrollY = Math.min(0, state.scrollY + 80);
      applyScroll();
      return;
    }
    if (e.code === 'ArrowDown') {
      e.preventDefault();
      state.scrollY = Math.max(maxScroll(), state.scrollY - 80);
      applyScroll();
      return;
    }
    if (e.key === 'r' || e.key === 'R') { restart(); return; }
    if (e.key === 'f' || e.key === 'F') { toggleFullscreen(); return; }
    if (e.key === '?' || (e.shiftKey && e.key === '/')) { toggleHelp(); return; }
  });

  // ── Resize ──
  if (window.ResizeObserver) {
    new ResizeObserver(() => {
      updateMirrorWidth();
      render();
      updateWpm();
    }).observe(viewport);
  }
  window.addEventListener('resize', () => {
    updateMirrorWidth(); render(); updateWpm();
  });

  // ── Init ──
  applyFontSize();
  setSliderFill(speedSlider);
  setSliderFill(fontSlider);
  speedValue.textContent = state.speed;
  fontValue.textContent = state.fontSize;
  updateStats();
  render();
  requestAnimationFrame(() => { updateMirrorWidth(); render(); updateWpm(); });
})();
