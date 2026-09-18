**Confirmed bugs**

1. **Best score never persists** (main script): `readBest()` reads `sow:best:<mode>`, but nothing ever writes it — no `storage.set('best:'+mode, …)` and `best` is never recomputed from `state.score`. Overlay/HUD always show the stale/zero best. Fix: on transition to `over`/`won`, `if(state.score>best){best=state.score;storage.set('best:'+mode,best);}` before `sync()`.

2. **Swipe input dead / pointer capture leak** (main script): `canvas` `pointerdown` stores `pointer` and calls `setPointerCapture`, but there are no `pointermove`/`pointerup`/`pointercancel` handlers, so no direction is ever queued and capture is never released (canvas keeps swallowing subsequent pointer events). Fix: add `pointerup`/`pointercancel` handlers that compute the dominant axis delta, call `queueDirection`, `releasePointerCapture(event.pointerId)`, and reset `pointer=null`.

3. **No loop/renderer supplied**: `last`, `accumulator`, `needsDraw`, `lastPeak`, `particles` are written but never consumed; no `requestAnimationFrame` or draw code, so `tick()` never runs. Fix: supply the fixed-timestep loop that calls `tick`, `tone`, `announce`, and canvas drawing.