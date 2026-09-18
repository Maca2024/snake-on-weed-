**Interaction-engineering plan**

Keep `snake_on_weed.py` untouched and add a `snake_on_weed.py.bak` in the repo. Build the browser port as static, dependency-free files:

```
index.html
styles.css
src/
  main.js      // bootstrap + loop
  Game.js      // deterministic model (grid, snake, food, score, modes)
  Renderer.js  // Canvas2D "acid arcade" draw calls
  Input.js     // keyboard + touch/swipe + D-pad
  Audio.js     // optional Web Audio synth, gated by user opt-in
  Storage.js   // localStorage best-score (with try/catch + quota fallback)
  UI.js        // mode toggles, pause overlay, reduced-motion flag
```

**Critical interaction details**

- **Keyboard:** arrow keys/WASD move; `Space` restarts after game over; `P` toggles pause; preventDefault on arrow keys so the page never scrolls during play.
- **Touch D-pad (mobile):** render four large buttons under the arena. Use `pointerdown`/`pointerup`, not `touchstart`, to support stylus/mouse fallback. Buttons map to a queued next direction; the model consumes at most one turn per tick and ignores 180° reversals.
- **Swipe:** support secondary swipe gestures on the canvas with a small dead-zone (≥24 px) so scrolling still works outside the arena.
- **Pause on blur & visibility:** listen to `window.blur`, `visibilitychange`, and `pagehide`; freeze the loop and resume only on explicit user action (tap/Space/P) to avoid surprise movement.
- **Audio opt-in:** keep `AudioContext` suspended until the user clicks a sound toggle; never autoplay.
- **Reduced motion:** if `prefers-reduced-motion: reduce` is active, disable pulse/glow/trail interpolation and fall back to static fills.
- **Real browser edge cases:** disable double-tap zoom with `touch-action: manipulation`; guard `localStorage` access inside `try/catch` for Safari private mode; debounce resize to recalculate canvas `devicePixelRatio` without resetting an active run.

**One exact acceptance test**

> Launch the game in Chrome DevTools mobile emulation (375×667). Tap the on-screen Up D-pad while the snake is moving right. Within one game tick, the snake head must turn upward; the snake must not reverse into itself if Up is tapped while moving down.

Implement the model so input is decoupled from rendering: `Input.js` writes a queued direction, `Game.js` validates it each tick, and `Renderer.js` only draws state. This keeps the Python original intact while the browser version becomes the polished, tactile arcade port.