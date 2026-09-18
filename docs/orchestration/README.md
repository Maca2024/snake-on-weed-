# Orchestration results and review decisions

This was a real Kathedraal LiteLLM exercise, not a simulated multi-agent transcript. The browser game itself uses no models or API keys.

## Results

- All eight specialists completed a design contribution across the initial run and the targeted Gemini recovery.
- Six of eight eventually completed a code-review response. This measures delivery, not correctness or approval.
- DeepSeek and Kimi completed design, but their review, recovery, and microcheck requests exhausted their completion budgets on reasoning. Neither delivered a usable code review. They are not counted as passing reviewers.
- Grok's full-source review timed out; its narrower engine review completed.
- Gemini's first design was truncated; a 4,096-token targeted request completed. Original failed attempts remain in the reports.
- 34 proxy requests report **183,551 total tokens**. One timed-out response supplied no usage, so this is a lower bound, not a complete bill. It includes integrator calls and failed attempts but excludes this coding session's own tokens. No monetary cost is inferred.

See `summary.json` for the aggregation and each directory's `report.json` for raw usage, status, finish reason, and deployment attribution.

## Decisions implemented

| Source | Adopted contribution |
| --- | --- |
| Claude Opus | Separate deterministic game state from browser presentation; explicit lifecycle states |
| Astra | Turn buffering, departing-tail rule, full-board win; review fixes for own-property direction validation, keyboard-activated D-pad, scoped shortcuts, and idle rendering |
| Gemini Flash | Botanical dark field, chartreuse snake, pink fruit, restrained feedback |
| Mistral Large | Concise arcade onboarding and habitat descriptions |
| Grok | Peak Bloom risk/reward timing, with uniform food placement instead of biased spawning |
| DeepSeek | Seeded engine API and testable rules; corrected its proposed collision/combo logic before implementation |
| Kimi | Pointer/swipe input, pause on loss of focus, explicit audio activation |
| GLM | Reduced motion, bounded particles, DPR cap, DOM score announcements and focus styling |
| Codex integrator | Consolidated successful specialist responses; coordinator resolved incompatible mechanics |

## Rejected review claims

Mistral's review alleged biased RNG, duplicate instruction IDs, missing preventScroll, and unbounded particles. Those claims were contradicted by the supplied code. Its suggested different peak window would change the agreed mechanic. `aria-atomic` was accepted as a small clarity improvement, without claiming a proven screen-reader failure.

Claude's narrower review inferred that persistence, swipes, and the rendering loop were absent. They were omitted from its excerpt, not from the game. Full-source inspection and real browser tests demonstrate those features. Partial-context review must not infer missing implementation.

Gemini's broad accessibility praise is not an accessibility certification. The README explicitly describes the visual game's remaining limitations.

## Operational lessons

Raw HTTP 200 is insufficient: require nonempty content and `finish_reason: stop`. Preserve truncation and timeout evidence. Disable fallback and retries when measuring named-model participation. Retry only the failed role with relevant context. A larger budget is not a guarantee: DeepSeek/Kimi still failed these reviews at 6,000 tokens. Final 4,000-token microchecks also failed; no further retries were made.

The runner now uses per-model review budgets and skips integration when no specialists succeeded. Earlier empty-input integrations remain in the historical reports; they are not useful reviews. Budgets bound spending rather than promise successful completion. For routine changes, use the relevant specialist or small subset instead of repeating an eight-model fan-out.

## Verification

Commit `03a5df1` passed 10 engine tests and 19 browser checks locally and in GitHub Actions. The deployed site passed the same 19 browser checks, including actual food pickup, score persistence, mobile input, denied storage, and no off-site network requests. See `../verification/live.json` and the linked GitHub workflow. Original Python sources are unchanged.
