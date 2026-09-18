# Development context

## Objective

Turn the existing Python Snake repository into a polished playable arcade and exercise all eight Kathedraal LiteLLM models under orchestration. Preserve the original Python work. Keep gameplay independent of model availability and token costs.

## Implementation decisions

- Add a static browser edition; no framework or backend is needed.
- A 28 × 22 deterministic board separates rules from presentation. Renderer timing cannot change food placement or scoring.
- Two buffered turns are checked against the previous queued direction. The departing tail is excluded from collision checks only when not growing.
- Enumerate free cells when spawning food, so full-board completion terminates without recursive retry loops.
- Choose Grok's Peak Bloom timing mechanic over the integrator's alternative collection-time combo. Keep spawning uniform, omit edge bias, and keep decorative effects independent of scoring.
- Persist per-mode best scores, mode, and calm setting defensively; denied storage never blocks play.
- Start sound only after explicit interaction. Pause when focus is lost, the tab is hidden, or the frame gap exceeds 500 ms. Resume explicitly.
- Local fonts, bounded particles (64), device pixel ratio capped at 2, no game network calls, reduced-motion support.

## Collaboration boundaries

The eight providers supplied design and review. Codex synthesized advice; the implementation coordinator assessed it and a Sol agent implemented the deterministic engine/tests. Model outputs were treated as untrusted suggestions. In particular, DeepSeek's first design snippet still collided with a departing tail and reset its combo each movement tick; those suggestions were rejected.

The initial Gemini design response ended with `finish_reason: length`: most of the 2,000-token completion budget went to reasoning. Preserve that failed attempt in the evidence and use a targeted recovery rather than silently crediting it as a completed answer. Reports include actual provider usage; missing pricing or usage fields must not be invented.

## Verification

Engine tests cover deterministic spawning, input buffering, tail/body collision, full-board completion, pause, peak/normal scoring, wrapping/walls, invalid inherited direction names, and bonus boundaries/cap. Browser checks cover desktop/mobile gameplay, pause/resume, restart, mode persistence, sound/calm settings, focus loss, real food pickup, best-score persistence, denied storage, narrow layouts, and JavaScript errors.

Run `npm test` and `python scripts/test_browser.py` after changes. Test results are evidence for the executed revision only; provider review is not a substitute. GitHub Actions records its own results.

## Scope retained

Original Python files and tracked virtual environment are unchanged. The browser game does not fix historical Python behavior. No production LiteLLM configuration is modified by the game project. Publish only `index.html`, `src/`, and `assets/`; exclude the virtual environment and orchestration tooling.

## Delivered verification (18 September 2026)

- Public game: https://maca2024.github.io/snake-on-weed-/
- Game commit `03a5df1`: 10 engine tests and 19 browser checks passed, locally and on GitHub Actions. The published site passed the same browser suite.
- All eight completed design contributions; six completed code-review responses. DeepSeek and Kimi review attempts remained truncated despite bounded targeted recoveries. Do not describe these as eight passing reviewers.
- Full audit, accepted/rejected findings, and reported token totals: `docs/orchestration/README.md` and `summary.json`.
- Later audit-only commits do not change the game assets; the live verification identifies the tested game commit explicitly.
