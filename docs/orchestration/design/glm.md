## Accessibility & Performance Review — ACID ARCADE build

### Reduced motion (primary requirement)
- Read `matchMedia('(prefers-reduced-motion: reduce)')` once at boot; expose `motionScale` (1 or 0) on the renderer, plus a manual "Calm mode" toggle persisted next to best score (some players want reduced effects without an OS setting).
- Gate **all** cosmetic animation: segment pulse (`sin(time)`), glow inflation, rainbow background fill, trail fade, screen shake, particle emission. Keep grid-step movement — it's gameplay, not decoration.
- Code-level detail — apply in one place, not per-effect:

```js
// renderer.js
const pulse = this.motion * Math.sin(t * 0.1) * 2; // 0 when reduced
const radius = BASE + pulse * sizeMod;
```

With `motion = 0`, pulse collapses and geometry becomes static; no branching, no missed cases.

### Contrast
- Chartreuse snake (#7FFF00-ish) and ivory type on dark botanical arena: verify shape/body fills ≥ 3:1 (non-text UI) against the arena color; they will pass.
- **Hot pink #FF1493 on dark fails 4.5:1 for text.** Keep neon pink for the fruit fill; use a tinted variant (e.g., #FF8AC4) for any pink *text* in HUD/overlays.
- All HUD text sits on solid ivory or solid dark chips — never directly over the animated canvas without a backing plate.

### Focus & keyboard
- Mode switch, pause, restart, sound toggle = real `<button>`s with `:focus-visible { outline: 3px solid chartreuse; outline-offset: 2px; }`.
- `e.preventDefault()` on arrow keys only when game is active, so page scroll isn't hijacked on menus.
- Auto-pause on `visibilitychange`/window blur; announce "Paused" via live region.

### Canvas text alternatives
- Canvas gets `role="img"` + `aria-label="Snake game arena"`, marked `aria-hidden` for decorative layers.
- Score, best, combo meter, and trip meter live in **DOM**, mirrored to a single `aria-live="polite"` status (`"Score 30, combo ×3"`), throttled to once per food pickup, not per tick.

### Sound
- Off by default; `AudioContext` created lazily on first toggle click (user gesture); suspend on `visibilitychange`; master `GainNode` so mute is instant.

### Performance budgets
- **Particles: hard cap 64** in a preallocated pool; spawn requests beyond cap drop silently.
- Fixed-timestep engine (e.g., 110 ms/tick) driven by one rAF accumulator; no per-frame allocations in the hot path.
- Cap `devicePixelRatio` at 2; pre-render glow cells to an offscreen sprite sheet instead of per-frame `shadowBlur` (the biggest Canvas2D cost — the Python `glow_rect` port must not become per-frame blur).

### Exact acceptance test
`engine.test.js`: seeded RNG (`seed=42`), Classic mode, scripted inputs `["up"], tick, ["right"], tick ×2, …` for 10 ticks; assert `score === 10`, `snake.length === 4`, `gameOver === false`, byte-identical to golden snapshot. Repeat with `prefers-reduced-motion: reduce`: assert identical game state (motion must never affect simulation).