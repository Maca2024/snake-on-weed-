**Peak Bloom (one twist).** Fruit is always the hot-pink target. A bloom phase `t∈[0,1)` runs each spawn. Inner window `t∈[0.35,0.65]` is Peak: eat it to add +1 trip (cap 5) and score `10*(1+trip)`. Eat outside the window: base 10, trip → 0. Missed eats never spawn extras. Waiting for Peak is the greed: the snake never stops, so Classic walls and Drift wrap-seams become the cost of holding for the stamp.

**Short runs.** Tick rate starts slow and adds a small step per trip only (hard cap). Typical death is 8–12 fruits; the whole arc is trip 0→5, not length. Game over / pause / restart are instant; best score is per mode (`classic` | `drift`) in `localStorage`.

**Replay.** Same rules, two geometries: Classic = wall death; Drift = wrap, no edge death. Peak fruit in Classic biases toward edges as trip rises; in Drift it biases onto wrap seams. That is the only spawn bias. Modes, HUD, help stay on the right (touch D-pad under the arena on mobile).

**Juice (no creep).** Chartreuse head squash on turn (1-frame inset). Peak eat = ink-stamp pop + trip-meter click. Optional two-note synth on Peak vs miss. `prefers-reduced-motion`: freeze bloom as a static ring, skip pulse/squash, keep the window and score math identical. No decoys, powerups, or extra entities.

**Engine contract.** Pure `tick(state, input) → state`; renderer only reads. Bloom and trip live on state, not in draw.

**Acceptance test.** Fixture: grid 20×15, Classic, snake `[(5,7)]`, dir `(1,0)`, food `(6,7)`, `bloom=0.5`, `trip=2`, `score=0`. One tick with no input → `trip===3`, `score===40`, food not on the snake. Same fixture with `bloom=0.1` → `trip===0`, `score===10`. Drift fixture: head at x=`width-1` stepping +x wraps to `0` and `gameOver===false`; Classic equivalent sets `gameOver===true` and does not move the snake.