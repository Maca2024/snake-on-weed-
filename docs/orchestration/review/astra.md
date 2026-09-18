**Defects**
- **`src/main.js` — inaccessible direction buttons:** `[data-dir]` handles only `pointerdown`; Enter/Space and assistive-technology-generated clicks do nothing. Support `click` activation, ensuring pointer input does not enqueue twice.
- **`src/main.js` — global shortcut interception:** WASD and P operate even when unrelated controls have focus. Single-character shortcuts need focus scoping or a disable/remap mechanism. Scope gameplay shortcuts to the focused canvas; preserve ordinary button keyboard behavior.
- **`src/engine.js` — invalid directions accepted:** `dir in VECTORS` accepts inherited names such as `"toString"`. Queuing one makes movement coordinates `NaN`, corrupting play. Validate against own properties, using `Object.hasOwn(VECTORS, dir)` or an explicit direction set.
- **`src/main.js` — unnecessary rendering/DOM churn:** Every animation frame rewrites the bloom label and redraws the entire board, including stationary calm-mode screens. Update label text/style only when peak status changes; skip drawing unchanged scenes when no animation is active.

**Rules:** Supplied logic matches 28×22 defaults, Drift wrapping, Classic wall death, peak awards of 20–60 with combo capped at five, and normal food’s 10 points plus combo reset.

**Uncertainty:** Browser support targets are unspecified. Unconditional `roundRect`, `ResizeObserver`, and modern media-query listeners require compatible browsers; add fallbacks if older browsers are required.