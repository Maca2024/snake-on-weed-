const VECTORS = {
  up: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
};

const OPPOSITE = { up: "down", right: "left", down: "up", left: "right" };

function random(state) {
  let value = state._rng >>> 0;
  value ^= value << 13;
  value ^= value >>> 17;
  value ^= value << 5;
  state._rng = value >>> 0;
  return state._rng / 0x100000000;
}

function placeFood(state) {
  const occupied = new Set(state.snake.map(({ x, y }) => `${x},${y}`));
  const free = [];
  for (let y = 0; y < state.rows; y += 1) {
    for (let x = 0; x < state.cols; x += 1) {
      if (!occupied.has(`${x},${y}`)) free.push({ x, y });
    }
  }
  if (free.length === 0) {
    state.food = null;
    return false;
  }
  state.food = free[Math.floor(random(state) * free.length)];
  return true;
}

export function createGame({
  cols = 28,
  rows = 22,
  mode = "drift",
  seed = 1,
} = {}) {
  if (
    !Number.isInteger(cols) ||
    cols < 4 ||
    !Number.isInteger(rows) ||
    rows < 1
  ) {
    throw new RangeError("The board must have at least 4 columns and 1 row");
  }
  if (mode !== "drift" && mode !== "classic") {
    throw new RangeError('mode must be "drift" or "classic"');
  }
  const headX = Math.max(3, Math.floor(cols / 2));
  const headY = Math.floor(rows / 2);
  const state = {
    cols,
    rows,
    mode,
    dir: "right",
    queue: [],
    snake: Array.from({ length: 4 }, (_, index) => ({
      x: headX - index,
      y: headY,
    })),
    food: null,
    score: 0,
    combo: 0,
    status: "ready",
    ticks: 0,
    foodAge: 0,
    foods: 0,
    _rng: Number(seed) >>> 0 || 1,
  };
  if (!placeFood(state)) state.status = "won";
  return state;
}

export function queueDirection(state, dir) {
  if (
    state.status !== "running" ||
    !Object.hasOwn(VECTORS, dir) ||
    state.queue.length >= 2
  )
    return false;
  const previous = state.queue.at(-1) ?? state.dir;
  if (dir === previous || dir === OPPOSITE[previous]) return false;
  state.queue.push(dir);
  return true;
}

export function isPeak(state) {
  const phase = state.foodAge % 40;
  return phase >= 14 && phase <= 25;
}

export function tick(state) {
  if (state.status !== "running") return null;

  if (state.queue.length) state.dir = state.queue.shift();
  const vector = VECTORS[state.dir];
  let x = state.snake[0].x + vector.x;
  let y = state.snake[0].y + vector.y;

  if (state.mode === "drift") {
    x = (x + state.cols) % state.cols;
    y = (y + state.rows) % state.rows;
  } else if (x < 0 || x >= state.cols || y < 0 || y >= state.rows) {
    state.status = "over";
    state.queue.length = 0;
    return "over";
  }

  const eating =
    state.food !== null && x === state.food.x && y === state.food.y;
  const collisionLength = state.snake.length - (eating ? 0 : 1);
  if (
    state.snake
      .slice(0, collisionLength)
      .some((part) => part.x === x && part.y === y)
  ) {
    state.status = "over";
    state.queue.length = 0;
    return "over";
  }

  const peak = isPeak(state);
  state.snake.unshift({ x, y });
  if (!eating) state.snake.pop();
  state.ticks += 1;

  if (eating) {
    state.foods += 1;
    if (peak) {
      state.combo = Math.min(5, state.combo + 1);
      state.score += 10 * (1 + state.combo);
    } else {
      state.combo = 0;
      state.score += 10;
    }
    state.foodAge = 0;
    if (!placeFood(state)) {
      state.status = "won";
      state.queue.length = 0;
      return "won";
    }
    return peak ? "peak" : "eat";
  }

  state.foodAge += 1;
  return "move";
}

export function togglePause(state) {
  if (state.status === "running") {
    state.status = "paused";
    state.queue.length = 0;
  } else if (state.status === "paused") {
    state.status = "running";
  }
  return state.status;
}
