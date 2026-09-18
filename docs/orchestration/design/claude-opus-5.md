## File layout (static, no bundler)

```
index.html            # header + .layout (arena | sidebar), <canvas id="arena">, D-pad
styles/app.css        # tokens, clamp() typography, grid → 1col @max-width:880px
src/main.js           # boot: wires DOM ⇄ engine ⇄ renderer ⇄ audio
src/engine.js         # pure logic, no DOM
src/renderer.js       # Canvas2D only, no logic
src/input.js          # keyboard + pointer/swipe + D-pad → intent events
src/audio.js          # lazy WebAudio synth
src/storage.js        # localStorage best-per-mode, try/catch fallback
src/loop.js           # fixed-step accumulator
tests/engine.test.js  # deterministic, run via tests/index.html (no runner dep)
game.py + game.py.bak # untouched
```

## Engine contract (the only thing tests touch)

```js
createGame({mode:'classic'|'drift', cols:29, rows:21, seed:1}) → state
step(state, intent|null) → newState     // pure, one tick
```
`state = {cols,rows,snake:[{x,y}],dir,pendingDir,fruit,score,combo,trip,
alive,ticksSinceFruit,rng,events:[]}`. `events` is the integration bus: `{type:'eat'|'die'|'combo'|'wrap'|'best'}` — renderer spawns particles from it, audio plays from it, HUD reads it. Nothing else crosses layers.

Determinism: replace `Math.random` with mulberry32 on `state.rng`; fruit spawn picks the *n*-th free cell from a shuffled free-list so the same seed + same inputs = identical run.

## State machine (single `phase` in main.js)

`menu → running ⇄ paused → gameover → running`
Transitions only: `start(mode)`, `togglePause` (P/Esc/blur/visibilitychange → paused), `die` (engine `alive:false`), `restart` (R/Space/tap). Mode switch is only legal from `menu|gameover|paused`, and always calls `createGame` fresh — never mutates a live run.

## Loop

```js
acc += dt; while (acc >= tickMs) { state = step(state, input.take()); acc -= tickMs; }
render(state, acc / tickMs); // alpha lerps head/tail for 60fps smoothness at 8–14 ticks/s
```
`tickMs = 1000 / (7 + Math.min(5, score/60))`. Reduced motion (`matchMedia('(prefers-reduced-motion: reduce)')`) sets `renderer.fx = false`: no trails, no interpolation, no screen shake — logic unchanged.

## One code-level detail

Buffer **two** turns, not one, and validate against the *last committed* direction:

```js
if (queue.length < 2 && !isOpposite(dir, next, queue)) queue.push(next);
```
Fixes the classic U-turn death when a player taps ↑ then ← inside one tick.

## Acceptance test

`tests/engine.test.js`: `createGame({mode:'drift',seed:7})`, apply the fixed intent script `['R','R','D','D','L','U', …]` for 400 ticks; assert final `{score, snake[0].x, snake[0].y, snake.length}` equal hardcoded values, and that a second identical run deep-equals the first. Plus: in `classic`, head at `x===cols-1` moving right → next state `alive===false`; in `drift`, same input → `head.x===0` and one `{type:'wrap'}` event.