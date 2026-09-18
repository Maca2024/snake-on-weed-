import test from "node:test";
import assert from "node:assert/strict";
import {
  createGame,
  isPeak,
  queueDirection,
  tick,
  togglePause,
} from "../src/engine.js";

function running(options) {
  const state = createGame(options);
  state.status = "running";
  return state;
}

test("creates a centered, deterministic game without placing food on the snake", () => {
  const a = createGame({ seed: 42 });
  const b = createGame({ seed: 42 });
  assert.deepEqual(a.food, b.food);
  assert.equal(a.status, "ready");
  assert.equal(a.snake.length, 4);
  assert.equal(
    a.snake.some((part) => part.x === a.food.x && part.y === a.food.y),
    false,
  );
});

test("rejects reversals and handles two fast queued turns relative to the last input", () => {
  const state = running();
  assert.equal(queueDirection(state, "left"), false);
  assert.equal(queueDirection(state, "up"), true);
  assert.equal(queueDirection(state, "left"), true);
  assert.equal(queueDirection(state, "down"), false);
  assert.equal(queueDirection(state, "right"), false);
  tick(state);
  assert.equal(state.dir, "up");
  tick(state);
  assert.equal(state.dir, "left");
});

test("allows moving into the departing tail but detects an occupied body cell", () => {
  const safe = running({ cols: 6, rows: 4 });
  safe.snake = [
    { x: 2, y: 1 },
    { x: 2, y: 2 },
    { x: 1, y: 2 },
    { x: 1, y: 1 },
  ];
  safe.dir = "left";
  safe.food = { x: 5, y: 3 };
  assert.equal(tick(safe), "move");
  assert.deepEqual(safe.snake[0], { x: 1, y: 1 });

  const crash = running({ cols: 6, rows: 4 });
  crash.snake = [
    { x: 2, y: 1 },
    { x: 1, y: 1 },
    { x: 1, y: 2 },
    { x: 2, y: 2 },
  ];
  crash.dir = "left";
  crash.food = { x: 5, y: 3 };
  assert.equal(tick(crash), "over");
});

test("winning a full board terminates directly without recursive food spawning", () => {
  const state = running({ cols: 4, rows: 1 });
  state.snake = [
    { x: 2, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 0 },
  ];
  state.dir = "right";
  state.food = { x: 3, y: 0 };
  assert.equal(tick(state), "won");
  assert.equal(state.status, "won");
  assert.equal(state.food, null);
  assert.equal(state.snake.length, 4);
});

test("pause clears input and paused ticks do not advance state", () => {
  const state = running();
  queueDirection(state, "up");
  assert.equal(togglePause(state), "paused");
  const before = structuredClone(state);
  assert.equal(queueDirection(state, "down"), false);
  assert.equal(tick(state), null);
  assert.deepEqual(state, before);
  assert.equal(togglePause(state), "running");
});

test("peak window drives combo scoring while ordinary food resets it", () => {
  const state = running({ cols: 8, rows: 3 });
  state.foodAge = 14;
  state.food = { x: state.snake[0].x + 1, y: state.snake[0].y };
  assert.equal(isPeak(state), true);
  assert.equal(tick(state), "peak");
  assert.equal(state.score, 20);
  assert.equal(state.combo, 1);
  assert.equal(state.foodAge, 0);

  state.foodAge = 13;
  state.food = { x: state.snake[0].x + 1, y: state.snake[0].y };
  assert.equal(tick(state), "eat");
  assert.equal(state.score, 30);
  assert.equal(state.combo, 0);
});

test("drift wraps and classic mode dies at a wall", () => {
  const drift = running({ cols: 6, rows: 3, mode: "drift" });
  drift.snake = [
    { x: 5, y: 0 },
    { x: 4, y: 0 },
    { x: 3, y: 0 },
    { x: 2, y: 0 },
  ];
  drift.food = { x: 1, y: 2 };
  assert.equal(tick(drift), "move");
  assert.deepEqual(drift.snake[0], { x: 0, y: 0 });

  const classic = running({ cols: 6, rows: 3, mode: "classic" });
  classic.snake = structuredClone(drift.snake);
  classic.snake[0] = { x: 5, y: 0 };
  classic.dir = "right";
  assert.equal(tick(classic), "over");
  assert.equal(classic.ticks, 0);
});

test("rejects inherited object properties as directions", () => {
  const state = running();
  for (const input of ["toString", "constructor", "__proto__", "invalid"])
    assert.equal(queueDirection(state, input), false);
  assert.equal(tick(state), "move");
});

test("an initially full board is already won", () => {
  const state = createGame({ cols: 4, rows: 1 });
  assert.equal(state.status, "won");
  assert.equal(state.food, null);
  assert.equal(tick(state), null);
});

test("peak boundaries repeat and bonus is capped at six times base score", () => {
  const state = running();
  for (const [age, expected] of [
    [13, false],
    [14, true],
    [25, true],
    [26, false],
    [54, true],
  ]) {
    state.foodAge = age;
    assert.equal(isPeak(state), expected);
  }
  state.combo = 5;
  state.foodAge = 14;
  state.food = { x: state.snake[0].x + 1, y: state.snake[0].y };
  assert.equal(tick(state), "peak");
  assert.equal(state.combo, 5);
  assert.equal(state.score, 60);
});
