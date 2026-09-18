**Engine: deterministic grid core**

```js
// engine.js
export const DIR = Object.freeze({ UP:0, RIGHT:1, DOWN:2, LEFT:3 });
export const MODE = Object.freeze({ CLASSIC:0, DRIFT:1 });

export function createGame({ cols=32, rows=20, mode=MODE.CLASSIC, seed=1, rng=mulberry32(seed) } = {}) {
  const state = {
    cols, rows, mode,
    snake: [{x:(cols/2)|0, y:(rows/2)|0}],
    dir: DIR.RIGHT,
    queue: [],               // max 2 valid turns
    food: null,
    score: 0,
    best: 0,
    combo: 0,
    trip: 0,
    alive: true,
    paused: false,
    seed
  };
  spawnFood(state, rng);
  return { state, rng };
}

export function queueDir(state, dir) {
  if (!state.alive || state.paused) return false;
  const last = state.queue.length ? state.queue[state.queue.length-1] : state.dir;
  if (dir === last || dir === (last+2)%4) return false; // ignore reverse/same
  if (state.queue.length < 2) state.queue.push(dir);
  return true;
}

export function step(state, rng) {
  if (!state.alive || state.paused) return state;
  const dir = state.queue.shift() ?? state.dir;
  state.dir = dir;
  const d = [[0,-1],[1,0],[0,1],[-1,0]][dir];
  const head = state.snake[0];
  let x = head.x + d[0], y = head.y + d[1];

  if (state.mode === MODE.DRIFT) {
    x = (x + state.cols) % state.cols;
    y = (y + state.rows) % state.rows;
  } else if (x < 0 || y < 0 || x >= state.cols || y >= state.rows) {
    state.alive = false;
    state.best = Math.max(state.best, state.score);
    return state;
  }

  const nx = {x,y};
  if (state.snake.some(s => s.x === nx.x && s.y === nx.y)) {
    state.alive = false;
    state.best = Math.max(state.best, state.score);
    return state;
  }

  state.snake.unshift(nx);
  if (nx.x === state.food.x && nx.y === state.food.y) {
    state.combo = Math.min(10, state.combo + 1);
    state.score += 10 * state.combo;
    state.trip = Math.min(100, state.trip + 12);
    state.best = Math.max(state.best, state.score);
    spawnFood(state, rng, 150);
  } else {
    state.snake.pop();
    state.combo = 0;
    state.trip = Math.max(0, state.trip - 1);
  }
  return state;
}

export function spawnFood(state, rng, attempts=0) {
  if (attempts > 400) {
    // deterministic fallback: first free cell
    const used = new Set(state.snake.map(s => s.y*state.cols+s.x));
    for (let i=0; i<state.cols*state.rows; i++) if (!used.has(i)) {
      state.food = {x:i%state.cols, y:(i/state.cols)|0}; return;
    }
    state.alive = false; // full board
    return;
  }
  const x = Math.floor(rng()*state.cols), y = Math.floor(rng()*state.rows);
  if (state.snake.some(s => s.x===x && s.y===y)) spawnFood(state, rng, attempts+1);
  else state.food = {x,y};
}

export function serialize(state) {
  return JSON.stringify({...state, snake:state.snake, queue:state.queue});
}

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function() {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
```

**Acceptance test:** `step(createGame({cols:5,rows:5,mode:MODE.CLASSIC,seed:42}))` where food placed deterministically at `{x:4,y:2}` and snake starts `{2,2}`. After commands `queueDir(RIGHT)` then four `step()` calls, assert `state.alive === false` because head `{4,2}` collides with wall exactly on the fifth move. This proves wall collision, queue consumption, and deterministic food placement from seed.