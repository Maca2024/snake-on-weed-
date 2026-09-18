import {
  createGame,
  queueDirection,
  tick,
  togglePause,
  isPeak,
} from "./engine.js";

const $ = (id) => document.getElementById(id);
const canvas = $("game"),
  ctx = canvas.getContext("2d");
const storage = {
  get(key, fallback) {
    try {
      return localStorage.getItem("sow:" + key) ?? fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem("sow:" + key, String(value));
    } catch {
      /* Storage is optional. */
    }
  },
};
let mode = storage.get("mode", "drift");
if (!["drift", "classic"].includes(mode)) mode = "drift";
let state = createGame({ mode, seed: Date.now() }),
  best = readBest(),
  last = 0,
  accumulator = 0,
  particles = [],
  sound = false,
  audio = null;
const media = matchMedia("(prefers-reduced-motion: reduce)");
let needsDraw = true,
  lastPeak = null;
let calm = storage.get("calm", String(media.matches)) === "true";
function readBest() {
  const value = Number(storage.get("best:" + mode, "0"));
  return Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
}
function announce(text) {
  $("announcement").textContent = text;
}
function tone(peak = false) {
  if (!sound || !audio) return;
  const time = audio.currentTime;
  for (let i = 0; i < 2; i++) {
    const oscillator = audio.createOscillator(),
      gain = audio.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = (peak ? 660 : 330) * (i ? 1.5 : 1);
    gain.gain.setValueAtTime(0, time + i * 0.06);
    gain.gain.linearRampToValueAtTime(0.06, time + i * 0.06 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, time + i * 0.06 + 0.18);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start(time + i * 0.06);
    oscillator.stop(time + i * 0.06 + 0.2);
  }
}
function sync() {
  needsDraw = true;
  $("score").textContent = String(state.score).padStart(4, "0");
  $("best").textContent = String(best).padStart(4, "0");
  $("multiplier").textContent = "×" + (state.combo + 1);
  $("meter").setAttribute("aria-valuenow", state.combo);
  [...$("meter").children].forEach((el, i) =>
    el.classList.toggle("active", i < state.combo),
  );
  $("arena-mode").textContent =
    mode === "drift" ? "DRIFT FIELD" : "CLASSIC FIELD";
  $("mode-copy").innerHTML =
    mode === "drift"
      ? "No borders. Wrap around the edges. <br>Your only enemy is yourself."
      : "Stay inside the garden. <br>The walls are part of the challenge.";
  document.querySelectorAll("[data-mode]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.mode === mode));
    button.disabled = state.status === "running" || state.status === "paused";
  });
  $("run-status").textContent = {
    ready: "READY WHEN YOU ARE",
    running: "DEEP IN THE GARDEN",
    paused: "TAKE A BREATHER",
    over: "BACK TO THE ROOTS",
    won: "GARDEN COMPLETE",
  }[state.status];
  $("pause").disabled = !["running", "paused"].includes(state.status);
  $("pause").innerHTML =
    state.status === "paused" ? "Resume <kbd>P</kbd>" : "Pause <kbd>P</kbd>";
  $("end-run").hidden = state.status !== "paused";
  const visible = state.status !== "running";
  $("overlay").hidden = !visible;
  const copy = {
    ready: [
      "A SMALL GAME. A BIG TRIP.",
      "LET IT<br><i>GROW.</i>",
      "One snake. Endless wrong turns.",
      "Enter the garden",
    ],
    paused: [
      "A LITTLE ROOM TO BREATHE.",
      "STAY<br><i>ROOTED.</i>",
      "Your garden will be here.",
      "Keep growing",
    ],
    over: [
      "EVERY END IS A NEW BEGINNING.",
      "GOOD<br><i>TRIP.</i>",
      `Harvest: ${state.score} · Best: ${best}. One more seed?`,
      "Grow again",
    ],
    won: [
      "EVERY CORNER. EVERY BLOOM.",
      "FULL<br><i>BLOOM.</i>",
      `An entire garden. ${state.score} points.`,
      "Plant another",
    ],
  };
  if (visible) {
    const c = copy[state.status];
    $("overlay-tag").textContent = c[0];
    $("overlay-title").innerHTML = c[1];
    $("overlay-copy").textContent = c[2];
    $("start").innerHTML = c[3] + ' <span aria-hidden="true">↗</span>';
  }
  $("motion").setAttribute("aria-pressed", String(calm));
  $("sound").setAttribute("aria-pressed", String(sound));
  $("sound").innerHTML =
    (sound ? "Sound on" : "Sound off") + ' <span aria-hidden="true">↗</span>';
}
function start() {
  if (state.status === "paused") {
    togglePause(state);
  } else {
    state = createGame({ mode, seed: Date.now() });
    state.status = "running";
    particles = [];
  }
  accumulator = 0;
  last = performance.now();
  sync();
  canvas.focus({ preventScroll: true });
  announce("Game running. " + mode + " mode.");
}
function pause() {
  if (!["running", "paused"].includes(state.status)) return;
  togglePause(state);
  accumulator = 0;
  sync();
  announce(state.status === "paused" ? "Game paused." : "Game resumed.");
  if (state.status === "running") canvas.focus({ preventScroll: true });
  else $("start").focus({ preventScroll: true });
}
$("end-run").addEventListener("click", () => {
  if (state.status !== "paused") return;
  state.status = "over";
  sync();
  $("start").focus({ preventScroll: true });
  announce("Run ended. Choose a habitat or grow again.");
});
$("start").addEventListener("click", start);
$("pause").addEventListener("click", pause);
document.querySelectorAll("[data-mode]").forEach((button) =>
  button.addEventListener("click", () => {
    if (["running", "paused"].includes(state.status)) return;
    mode = button.dataset.mode;
    storage.set("mode", mode);
    state = createGame({ mode, seed: Date.now() });
    best = readBest();
    sync();
    announce(mode + " mode selected.");
  }),
);
$("motion").addEventListener("click", () => {
  calm = !calm;
  storage.set("calm", calm);
  particles = [];
  sync();
});
media.addEventListener("change", (event) => {
  if (event.matches) {
    calm = true;
    particles = [];
    sync();
  }
});
$("sound").addEventListener("click", async () => {
  try {
    if (!audio) {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) throw Error("unsupported");
      audio = new Audio();
    }
    sound = !sound;
    if (sound) {
      await audio.resume();
      tone(true);
    } else await audio.suspend();
    sync();
  } catch {
    sound = false;
    sync();
    announce("Sound is unavailable in this browser.");
  }
});
const keys = {
  ArrowUp: "up",
  ArrowRight: "right",
  ArrowDown: "down",
  ArrowLeft: "left",
  w: "up",
  d: "right",
  s: "down",
  a: "left",
};
document.addEventListener("keydown", (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  const direction = keys[key];
  const inGame =
    event.target instanceof Element &&
    Boolean(event.target.closest(".play-column"));
  if (direction && inGame && state.status === "running") {
    event.preventDefault();
    if (!event.repeat) queueDirection(state, direction);
  } else if (
    ((key === "p" && inGame) || key === "Escape") &&
    ["running", "paused"].includes(state.status)
  ) {
    event.preventDefault();
    if (!event.repeat) pause();
  } else if (key === " " && event.target === canvas) {
    event.preventDefault();
    if (!event.repeat) {
      if (state.status === "running") pause();
      else start();
    }
  }
});
document.querySelectorAll("[data-dir]").forEach((button) => {
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    queueDirection(state, button.dataset.dir);
  });
  button.addEventListener("click", (event) => {
    if (event.detail === 0) queueDirection(state, button.dataset.dir);
  });
});
let pointer = null;
canvas.addEventListener("pointerdown", (event) => {
  if (state.status !== "running") return;
  pointer = { x: event.clientX, y: event.clientY, id: event.pointerId };
  canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener("pointermove", (event) => {
  if (!pointer || pointer.id !== event.pointerId) return;
  const dx = event.clientX - pointer.x,
    dy = event.clientY - pointer.y;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
  queueDirection(
    state,
    Math.abs(dx) > Math.abs(dy)
      ? dx > 0
        ? "right"
        : "left"
      : dy > 0
        ? "down"
        : "up",
  );
  pointer.x = event.clientX;
  pointer.y = event.clientY;
});
for (const event of ["pointerup", "pointercancel", "lostpointercapture"])
  canvas.addEventListener(event, () => (pointer = null));
function backgroundPause() {
  if (state.status === "running") {
    togglePause(state);
    accumulator = 0;
    sync();
    announce("Game paused while you were away.");
  }
  if (audio && sound) audio.suspend();
}
window.addEventListener("blur", backgroundPause);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) backgroundPause();
});
window.addEventListener("focus", () => {
  if (audio && sound) audio.resume().catch(() => {});
});
function resize() {
  needsDraw = true;
  const rect = canvas.getBoundingClientRect(),
    dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
new ResizeObserver(resize).observe(canvas);
function rounded(x, y, w, h, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}
function draw(time, dt) {
  const w = canvas.clientWidth,
    h = canvas.clientHeight,
    cw = w / state.cols,
    ch = h / state.rows;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#111910";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "#24301e";
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  for (let x = 0; x <= state.cols; x++) {
    ctx.moveTo(x * cw, 0);
    ctx.lineTo(x * cw, h);
  }
  for (let y = 0; y <= state.rows; y++) {
    ctx.moveTo(0, y * ch);
    ctx.lineTo(w, y * ch);
  }
  ctx.stroke();
  ctx.strokeStyle = "#334226";
  ctx.lineWidth = 0.65;
  for (let radius = 2.5; radius < 18; radius += 3) {
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.5, radius * cw, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = "#71875a";
  for (const [x, y] of [
    [3, 3],
    [24, 3],
    [3, 18],
    [24, 18],
  ]) {
    ctx.fillRect(x * cw - 4, y * ch, 9, 1);
    ctx.fillRect(x * cw, y * ch - 4, 1, 9);
  }
  const idle = state.status === "ready";
  const snake = idle
    ? [
        { x: 19, y: 9 },
        { x: 18, y: 9 },
        { x: 17, y: 9 },
        { x: 16, y: 9 },
        { x: 16, y: 10 },
        { x: 16, y: 11 },
        { x: 16, y: 12 },
        { x: 17, y: 12 },
        { x: 18, y: 12 },
        { x: 19, y: 12 },
        { x: 20, y: 12 },
        { x: 20, y: 13 },
        { x: 20, y: 14 },
        { x: 20, y: 15 },
        { x: 19, y: 15 },
        { x: 18, y: 15 },
        { x: 17, y: 15 },
        { x: 16, y: 15 },
        { x: 15, y: 15 },
        { x: 14, y: 15 },
        { x: 13, y: 15 },
        { x: 12, y: 15 },
        { x: 11, y: 15 },
        { x: 10, y: 15 },
        { x: 9, y: 15 },
        { x: 8, y: 15 },
        { x: 8, y: 14 },
        { x: 8, y: 13 },
        { x: 8, y: 12 },
      ]
    : state.snake;
  for (let i = snake.length - 1; i >= 0; i--) {
    const s = snake[i],
      pad = cw * 0.1;
    rounded(
      s.x * cw + pad,
      s.y * ch + pad,
      cw - pad * 2,
      ch - pad * 2,
      cw * 0.27,
      i === 0 ? "#d7ff83" : i % 3 === 0 ? "#a4ce48" : "#bbeb56",
    );
    if (i > 0) {
      const prev = snake[i - 1];
      if (Math.abs(prev.x - s.x) + Math.abs(prev.y - s.y) === 1) {
        ctx.fillStyle = "#bbeb56";
        if (prev.x !== s.x)
          ctx.fillRect(
            Math.min(prev.x, s.x) * cw + cw * 0.5,
            s.y * ch + pad,
            cw,
            ch - pad * 2,
          );
        else
          ctx.fillRect(
            s.x * cw + pad,
            Math.min(prev.y, s.y) * ch + ch * 0.5,
            cw - pad * 2,
            ch,
          );
      }
    }
  }
  const head = snake[0],
    direction = idle ? "right" : state.dir;
  const vectors = {
      right: [0.68, 0.28, 0.68, 0.72],
      left: [0.32, 0.28, 0.32, 0.72],
      up: [0.28, 0.32, 0.72, 0.32],
      down: [0.28, 0.68, 0.72, 0.68],
    },
    eyes = vectors[direction];
  ctx.fillStyle = "#233215";
  for (let i = 0; i < 4; i += 2) {
    ctx.beginPath();
    ctx.arc(
      (head.x + eyes[i]) * cw,
      (head.y + eyes[i + 1]) * ch,
      cw * 0.073,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  const food = idle ? { x: 6, y: 6 } : state.food;
  if (food) {
    const fx = (food.x + 0.5) * cw,
      fy = (food.y + 0.5) * ch,
      peak = !idle && isPeak(state),
      pulse = calm ? 0 : Math.sin(time * 0.003) * 0.06;
    ctx.strokeStyle = peak ? "#ffc5e0" : "#954067";
    ctx.lineWidth = peak ? 2 : 1;
    ctx.beginPath();
    ctx.arc(fx, fy, cw * (peak ? 0.76 : 0.62) + cw * pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#ff81bd";
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
      ctx.beginPath();
      ctx.ellipse(
        fx + Math.cos(angle) * cw * 0.19,
        fy + Math.sin(angle) * ch * 0.19,
        cw * 0.18,
        ch * 0.18,
        angle,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.fillStyle = "#fff0d7";
    ctx.beginPath();
    ctx.arc(fx, fy, cw * 0.095, 0, Math.PI * 2);
    ctx.fill();
  }
  if (!calm) {
    particles = particles.filter((p) => p.life > 0);
    for (const p of particles) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      ctx.globalAlpha = Math.max(0, p.life / 0.55);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x * w, p.y * h, 3, 3);
    }
    ctx.globalAlpha = 1;
  }
  const peak = state.status === "running" && isPeak(state);
  if (peak !== lastPeak) {
    lastPeak = peak;
    $("bloom-label").textContent = peak
      ? "✳ PEAK BLOOM — MAKE IT COUNT"
      : "◎ BLOOM WINDOW — WATCH THE RING";
    $("bloom-label").style.color = peak ? "#ffb3d6" : "";
  }
}
function frame(now) {
  if (last && now - last > 500 && state.status === "running") backgroundPause();
  const elapsed = Math.min(now - (last || now), 200);
  last = now;
  if (state.status === "running") {
    accumulator += elapsed;
    let count = 0;
    const interval = Math.max(78, 145 - state.foods * 2);
    while (
      accumulator >= interval &&
      count++ < 3 &&
      state.status === "running"
    ) {
      accumulator -= interval;
      const food = state.food ? { ...state.food } : null;
      const event = tick(state);
      needsDraw = true;
      if (["eat", "peak", "won"].includes(event)) {
        tone(event === "peak");
        if (!calm && food)
          for (let i = 0; i < 12 && particles.length < 64; i++)
            particles.push({
              x: (food.x + 0.5) / state.cols,
              y: (food.y + 0.5) / state.rows,
              vx: (Math.random() - 0.5) * 0.13,
              vy: (Math.random() - 0.5) * 0.13,
              life: 0.55,
              color: i % 2 ? "#c5f45a" : "#ff81bd",
            });
        if (state.score > best) {
          best = state.score;
          storage.set("best:" + mode, best);
        }
        announce(`Score ${state.score}. Multiplier ${state.combo + 1}.`);
        sync();
      }
      if (event === "over" || event === "won") {
        accumulator = 0;
        sync();
        announce(
          event === "won"
            ? `Garden complete! Score ${state.score}.`
            : `Game over. Score ${state.score}.`,
        );
        $("start").focus({ preventScroll: true });
      }
    }
  } else accumulator = 0;
  if (needsDraw || (!calm && ["ready", "running"].includes(state.status))) {
    draw(now, elapsed / 1000);
    needsDraw = false;
  }
  requestAnimationFrame(frame);
}
sync();
resize();
requestAnimationFrame(frame);
