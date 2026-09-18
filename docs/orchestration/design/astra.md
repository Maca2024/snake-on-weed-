### Gameplay contract

- **Simulation:** Pure ES-module engine exposing `step(state)` and `enqueueTurn(state, direction)`; inject seeded randomness. Rendering, sound, storage and browser events stay outside the engine. Use fixed simulation ticks, independent of display refresh.
- **Fair turns:** Buffer at most two turns; consume at most one per tick. Validate against the last queued direction, otherwise the current heading. Reject duplicates and reversals, including for length-one snakes. Ignore keyboard auto-repeat; overflow drops the newest input. Keyboard and touch use the same queue.
- **Collision:** Classic crosses an edge → loss. Drift wraps coordinates **before** checking self-collision. Entering the current tail cell is legal when not growing, because that tail vacates simultaneously. Other occupied cells are fatal.
- **Atomic movement:** Determine destination and whether it contains fruit, then validate collision before committing movement, growth or score.
- **Full-board victory:** After eating, if length equals board capacity, transition immediately to `won`, clear fruit and stop ticking. Otherwise choose uniformly from an explicit list of empty cells; never use an unbounded random retry loop.

### Scoring and pacing

Start at 8 ticks/second; increase by 1 every five fruits, capped at 12. Keep speed predictable and independent of visual effects.

Fruit awards `10 × multiplier`. First collection uses ×1; subsequent collections within 40 simulation ticks increase the multiplier, capped at ×4. Later collections reset to ×1. The trip meter displays remaining combo ticks; it grants no invulnerability or hidden collision changes. Preserve fruit/head readability during effects.

Persist separate Classic/Drift bests with versioned keys. Catch storage failures and continue in memory; accept only finite, nonnegative safe integers. Local bests are convenience records, not cheat-proof rankings.

### Pause and exploit prevention

Use explicit `ready/running/paused/lost/won` states. Pause automatically on document hiding or window blur; require explicit resume. Clear queued turns on pause, ignore paused directional input, and reset the frame accumulator on resume. Freeze combo time, movement and scoring.

If a visible frame gap exceeds 250 ms, pause rather than fast-forward. Mode changes start a fresh run; restart clears every transient timer and input. Resizing changes presentation, never board dimensions. Reduced motion changes effects only.

### Exact acceptance tests

1. Heading right, enqueue up then left: successive ticks move up, then left—not immediately backward.
2. Snake `[(1,1),(1,2),(0,2),(0,1)]`, heading up, fruit `(2,2)`: turning left enters the vacating tail and survives.
3. Fill the last empty cell: exactly one score award, `won`, no fruit-spawn attempt.
4. Pause for 60 seconds: position, score and combo ticks remain identical.
5. Replay identical seeded inputs at 60/120 Hz: identical engine state; verify touch generates no duplicate turns.