**Confirmed bugs**

1. **Best score never persists** (main script): `readBest()` reads `sow:best:<mode>`, but no code writes updated scores. Fix: when entering `over`/`won`, compare `state.score` with `best`, update `best`, and call `storage.set('best:'+mode, best)` before `sync()`.

2. **Swipe input is nonfunctional** (main script): `pointerdown` stores the pointer and captures it, but no `pointermove`, `pointerup`, or `pointercancel` handlers compute a swipe or release capture. Fix: on `pointerup`, queue the dominant-axis direction; on completion/cancel, release capture and clear `pointer`.

3. **Game loop and rendering are absent** (main script): `tick()` is never scheduled, and `last`, `accumulator`, `needsDraw`, `lastPeak`, and `particles` are never consumed. Fix: add a `requestAnimationFrame` fixed-timestep loop that calls `tick()` and redraws the canvas, including pending sound/announcement effects.