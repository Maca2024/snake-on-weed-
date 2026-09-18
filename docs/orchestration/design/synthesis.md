## One-session implementation spec

**Preservation**
- Add the browser edition without modifying, renaming, or deleting the existing Python game or its backup. No Python-to-JS coupling.
- Static entry point: `index.html`; deploy directly from repository files with no backend, bundler, framework, or external dependency.

**Files**
- `styles/app.css`
- `src/main.js` — lifecycle and HUD wiring
- `src/engine.js` — pure deterministic rules
- `src/loop.js` — fixed-step accumulator
- `src/renderer.js` — Canvas2D only
- `src/input.js` — keyboard, swipe, D-pad
- `src/audio.js` — opt-in Web Audio
- `src/storage.js` — guarded localStorage
- `tests/index.html`, `tests/engine.test.js` — dependency-free browser tests

**Resolved gameplay contract**
- Board: fixed 29×21 cells; resizing changes presentation only.
- Modes: **Classic** kills at walls; **Drift** wraps before self-collision.
- Start at 8 ticks/second; +1 per five fruits, capped at 12.
- Fruit scores `10 × combo`. First fruit is ×1; another within 40 simulation ticks increments combo, capped at ×4; otherwise reset to ×1. “Trip” displays remaining combo time only—no power-up.
- Entering a vacating tail cell is legal when not growing. Filling the board produces `won`, clears fruit, and stops simulation.
- Phases: `ready/running/paused/lost/won`. Blur, hidden document, or frame gap over 250 ms pauses; resume is explicit.
- Persist validated, versioned best scores separately per mode. Storage failure falls back to memory.
- Exclude Peak Bloom, biased spawning, extra entities, and gameplay-changing visual effects to limit scope.

**Engine API**
```js
createGame({ mode, cols, rows, seed })
enqueueTurn(state, direction)
step(state)
```
Use seeded RNG and uniformly select from an explicit free-cell list. Buffer two turns, consume one per tick, and reject duplicate/reverse directions against the last queued direction.

**Presentation**
- Warm-ivory oversized compressed header; dark botanical radar arena; chartreuse snake; hot-pink fruit; editorial two-column desktop layout.
- At ≤880 px: arena first, HUD below, four large pointer-event D-pad buttons.
- DOM HUD/buttons with visible focus; Canvas capped at DPR 2. Sound defaults off. Reduced motion disables interpolation, trails, pulses, particles, and shake without changing rules.

Useful foundations: Claude’s module/event separation, Astra’s collision and pacing rules, Kimi’s input handling, and GLM’s accessibility/performance constraints.

## Acceptance checklist

- [ ] Existing Python source and backup remain byte-unchanged.
- [ ] Same seed and input script produce deeply equal states at simulated 60 Hz and 120 Hz.
- [ ] Rightward snake queued Up then Left moves Up, then Left.
- [ ] Classic edge crossing loses; identical Drift fixture wraps to coordinate `0`.
- [ ] Entering a non-growing vacating tail survives.
- [ ] Pause for 60 seconds leaves position, score, queue, and combo ticks unchanged.
- [ ] At 375×667, arena appears first; D-pad turns once without scrolling or duplicate input.
- [ ] Reduced-motion run has engine state identical to normal-motion run.
