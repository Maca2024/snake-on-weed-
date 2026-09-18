### Canvas Snake design

- Use one dependency-free ES module with a small state object: snake cells, direction, queued direction, food, score, best, combo, mode, status, sound, and reduced-motion preference.
- Model the board as **28×22 logical cells**. Scale the canvas responsively while preserving aspect ratio; account for `devicePixelRatio` for crisp rendering. Keep simulation on a fixed tick independent of rendering.
- In **Drift**, wrap coordinates with modulo arithmetic. In **Classic**, moving beyond any edge ends the game. Reject immediate 180-degree turns.
- Food scoring:
  - Normal fruit: **+10**, then `combo = 0`.
  - Peak Bloom: increment combo to a maximum of 5, then award `[20, 30, 40, 50, 60][combo - 1]`.
  - Keep food placement on unoccupied cells. Treat Peak Bloom selection/timing as a separate rule so scoring remains deterministic.
- Persist only the best score with `localStorage`; safely fall back to session-only state if storage is unavailable.

### Presentation

Use a near-black forest background (`hsl(160 15% 10%)`) with subtle darker botanical leaves or vines. Render ivory text (`hsl(30 100% 95%)`), a chartreuse snake (`hsl(90 100% 50%)`), and pink fruit (`hsl(330 80% 65%)`). Distinguish Peak Bloom with a brighter pink ring or glow. Clip every particle, glow, and score pop-up to the canvas and cap particle counts and lifetimes.

### Input and accessibility

Support Arrow keys/WASD, P or Space for pause, and R for restart. Add canvas swipes plus focusable, labeled directional, Pause/Resume, Restart, mode, and Sound buttons. Expose score, best score, combo, mode, and status as nearby text with an `aria-live="polite"` status region. Provide visible focus indicators and canvas fallback text.

Create sound lazily after user interaction and retain a mute setting. Honor `prefers-reduced-motion`; replace pulses and moving pop-ups with immediate solid color changes.

### One test

Start Drift mode, travel left across the board edge, and verify the head reappears in the corresponding rightmost cell without changing score, length, direction, or game status.