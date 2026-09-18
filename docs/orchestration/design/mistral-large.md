**ACID ARCADE – Snake on Weed**
*Warm ivory canvas, chartreuse snake, hot-pink fruit, dark botanical radar*

---

### **UI Copy & UX**

**Header**
`SNAKE ON WEED` (huge compressed ivory caps, 12vw desktop, 20vw mobile)

**Arena**
*Dark botanical radar grid* – subtle leaf veins pulse on fruit collect.

**HUD (Right Column – Desktop / Below – Mobile)**
- **Score** `TRIP: 0` (ivory)
- **Best** `PEAK: 0` (chartreuse)
- **Combo** `🌿 x1` (hot-pink, increments on consecutive collects)
- **Trip Meter** `▁▁▁▁▁▁▁▁▁▁` (ivory → chartreuse fill)

**Modes**
- **Classic** – walls kill (ivory toggle)
- **Drift** – wrap edges (chartreuse toggle)

**Controls**
- **Desktop** `Arrow keys` / `P` pause / `R` restart
- **Mobile** `D-pad` (bottom-left, 4 large ivory arrows)

**Onboarding**
`Eat the fruit. Grow the trip. Don’t crash.` (ivory, fades after 3s)

**Pause**
`PAUSED` (ivory, 8vw, centered) + `Press P to resume` (chartreuse)

**Game Over**
`TRIP ENDED` (ivory, 10vw) + `PEAK: 0` (chartreuse) + `Press R to restart` (hot-pink)

**Sound Toggle**
`🔊` (ivory, top-right) – simple synth blips on collect/crash.

**Reduced Motion**
`🐢` (ivory, top-right) – disables trail/pulse effects.

---

### **Visual Identity**
- **Typography**: Compressed sans-serif (e.g., *Bauhaus 93* or *Impact* at 80% letter-spacing).
- **Colors**:
  - **Ivory**: `#F5F5DC` (canvas, text)
  - **Chartreuse**: `#7FFF00` (snake, active UI)
  - **Hot-pink**: `#FF69B4` (fruit, highlights)
  - **Dark botanical**: `#1A1A1A` (grid, radar veins)
- **Grid**: 20px cells with 2px ivory borders; veins drawn as low-opacity `rgba(245, 245, 220, 0.1)` lines.

---

### **Code-Level Detail**
**Acceptance Test**: *Deterministic combo meter*.
- **Test**: Collect 3 fruits consecutively → combo meter increments to `🌿 x3` and resets on crash/miss.
- **Implementation**: Add `combo` counter in `move_snake()`:
  ```js
  if (newHead === this.food) {
    this.combo = (this.combo || 0) + 1;
    this.tripMeter = Math.min(10, this.tripMeter + 1);
  } else {
    this.combo = 0;
  }
  ```

---

### **Static Files**
- `index.html` – Layout (header + 2-column desktop / stacked mobile).
- `style.css` – Compressed typography, botanical grid, D-pad.
- `game.js` – ES module (engine + Canvas2D renderer).
- `synth.js` – Optional Web Audio blips (toggleable).