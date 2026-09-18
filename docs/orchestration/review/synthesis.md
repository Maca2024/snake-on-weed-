**Defects**
- **`src/main.js` — direction buttons are keyboard-inaccessible:** `[data-dir]` responds only to `pointerdown`, so Enter/Space and assistive-technology-generated clicks do nothing. Handle `click` instead, or add keyboard activation while preventing duplicate pointer input.
- **`src/main.js` — global shortcuts intercept unrelated controls:** WASD and `P` trigger gameplay even when other controls have focus. Scope single-character shortcuts to the focused canvas or provide a disable/remap mechanism; retain normal keyboard behavior on buttons.
- **`src/engine.js` — inherited property names accepted as directions:** `dir in VECTORS` accepts values such as `"toString"`, producing invalid movement coordinates and corrupting state. Use `Object.hasOwn(VECTORS, dir)` or an explicit valid-direction set.
- **`src/main.js` — continuous unnecessary rendering:** Every animation frame redraws the board and rewrites the bloom label, including unchanged calm-mode screens. Mark scenes dirty and render only after state/animation changes; update label DOM only when peak status changes.

**Rules:** Logic matches the stated board size, wrapping/wall behavior, Peak Bloom scoring and combo cap, and normal-food scoring/reset.

**Uncertainty:** Browser targets are unspecified. `roundRect`, `ResizeObserver`, and modern media-query listeners need fallbacks only if older browsers are supported.