# Salita — Iteration 17: Staleness reddening (design)

**Date:** 2026-06-07  
**Status:** Approved  
**Parent spec:** `docs/salita-design-spec.md` (§5.8 staleness reddening)  
**Roadmap:** `docs/superpowers/specs/2026-06-02-salita-v1-roadmap-design.md` (iteration 17)  
**Builds on:** iteration 15 (ghost trails), iteration 16 (`lastMovedAt` only bumps on real moves)

Dots that have not moved in several days visually age: live marker fill lerps from the
project palette color toward `#C04A2D`. Ghost trails keep the raw project color.

---

## 1. Goal

After this iteration:

- **Live dot fill** — each project (overview) and project/task dot (project view) uses
  `staleFillColor(projectColor, lastMovedAt)` instead of raw palette hex.
- **Staleness formula** — `daysSinceLastMove` in **local calendar days**;
  `staleness = min(daysSinceLastMove / 5, 1)`; fill = lerp(projectColor, `#C04A2D`,
  staleness). At 5+ days, fully stale red.
- **Ghost trails** — `MarkerTrail` continues to use **project palette color** (not
  staleness-adjusted); only the current dot reddens.
- **Recompute trigger** — when marker models rebuild (store change, navigation, page
  load). **No midnight timer** (same as iteration 14 End daily decision).
- **Vitest** — unit tests on calendar-day math, ratio cap, and hex lerp.

**Out of scope:** Side-panel “last moved” copy; staleness on ghost dots; midnight
auto-refresh; changing when `lastMovedAt` is written (store behavior unchanged).

---

## 2. Decisions (brainstorm lock-in)

| Topic | Decision |
|-------|----------|
| Architecture | **Pure domain helpers** (approach A) — pre-compute fill in `chartMarkers.ts` |
| Ghost trail color | **Project palette only** — staleness applies to live dot only |
| Staleness refresh | **On marker rebuild** — no timer; overnight aging visible after refresh or any store update |
| Calendar days | **Local timezone** — reuse `localDateString` from `src/lib/localDate.ts` |
| Same calendar day as move | **0 days** — full project color (staleness 0) |
| Per-dot `lastMovedAt` | **Each trackable independently** — tasks can redden while project dot stays fresh |
| Trail vs live color split | **`baseColor` + `color` on `ChartMarker`** — trail reads `baseColor`, marker reads `color` |
| Stale target color | **`#C04A2D`** — matches `--color-stale-red` / parent spec `stale-red` token |
| sRGB lerp | **Channel-wise sRGB lerp** — sufficient for v1 visual; no gamma correction |

---

## 3. Domain: `src/domain/staleness.ts`

### 3.1 Constants

```ts
export const STALE_RED = '#C04A2D'
export const STALENESS_FULL_DAYS = 5
```

### 3.2 Calendar-day difference

```ts
/** Local calendar days from lastMovedAt's day through today (inclusive of today as 0). */
export function daysSinceLastMove(lastMovedAt: string, today = new Date()): number
```

Algorithm:

1. `moveDay = localDateString(new Date(lastMovedAt))`
2. `todayStr = localDateString(today)`
3. Parse both `YYYY-MM-DD` strings as local midnight `Date` objects.
4. `days = round((todayMidnight - moveMidnight) / 86400000)`
5. Return `max(0, days)`.

Examples (local timezone):

| lastMovedAt (local day) | today (local) | days |
|-------------------------|---------------|------|
| today, any time | today | 0 |
| yesterday | today | 1 |
| 5 days ago | today | 5 |
| 10 days ago | today | 10 (ratio still caps at 1) |

Uses existing `localDateString` — consistent with End daily and trail snapshot dates.

### 3.3 Staleness ratio

```ts
export function stalenessRatio(daysSinceLastMove: number): number {
  return Math.min(Math.max(0, daysSinceLastMove) / STALENESS_FULL_DAYS, 1)
}
```

### 3.4 Color lerp

```ts
/** sRGB lerp between two #RRGGBB hex colors; t clamped to [0, 1]. */
export function lerpHexColor(from: string, to: string, t: number): string

export function staleFillColor(
  projectColorHex: string,
  lastMovedAt: string,
  today = new Date(),
): string
```

`staleFillColor`: if `stalenessRatio === 0`, return `projectColorHex` unchanged; else
`lerpHexColor(projectColorHex, STALE_RED, ratio)`.

---

## 4. Marker models: `src/composables/chartMarkers.ts`

Extend `ChartMarker`:

```ts
export interface ChartMarker {
  id: string
  position: number
  baseColor: string   // palette hex — for ghost trails
  color: string       // stale-adjusted fill — for live dot
  radius: number
  name: string
  up: number
  down: number
  ghosts: TrailGhost[]
}
```

In `overviewMarkers` and `markersForProject`:

```ts
const baseColor = PALETTE[p.color] // or project.color in project view
color: staleFillColor(baseColor, trackable.lastMovedAt),
baseColor,
```

Tasks inherit the project's palette `baseColor` but compute `color` from **task**
`lastMovedAt` (may differ from project dot).

---

## 5. Rendering: `src/components/HillChart.vue`

Split trail vs live dot colors:

```vue
<MarkerTrail :color="m.baseColor" ... />
<MarkerChart :color="m.color" ... />
```

`MarkerChart.vue` and `MarkerTrail.vue` unchanged — they already accept a resolved hex
`color` string.

---

## 6. Data flow

1. Store holds `lastMovedAt` on each trackable (updated only on real position changes).
2. View passes projects / project into `overviewMarkers` / `markersForProject`.
3. Each marker gets `baseColor` (palette) and `color` (stale-adjusted).
4. User drags dot → `setPosition` → `lastMovedAt` now → markers rebuild → dot returns
   to fresh project color.
5. User leaves tab open overnight → colors unchanged until refresh or store mutation.
6. Selected dot's ghost trail renders with `baseColor` at trail opacities — visually
   distinct from stale live dot when both are shown.

---

## 7. Tests

### 7.1 `src/domain/staleness.test.ts` (new)

Use injectable `today` for deterministic cases.

| Case | lastMovedAt | today | Expect |
|------|-------------|-------|--------|
| Moved today | same local day | fixed | days **0**, ratio **0**, color **unchanged** |
| One day | previous local day | fixed | days **1**, ratio **0.2** |
| Five days | 5 days before | fixed | ratio **1**, color **STALE_RED** |
| Ten days | 10 days before | fixed | ratio **1** (capped) |
| Lerp midpoint | 2.5 days equivalent | — | color between project and stale |
| Future lastMovedAt | tomorrow | fixed today | days **0** (clamped) |

Include at least one case with terracotta `#C56B4A` → verify output is valid `#RRGGBB`.

### 7.2 `src/composables/chartMarkers.test.ts` (update)

- Set fixture `lastMovedAt` to **today's** ISO string (or pass a date that yields
  staleness 0) so existing color assertions still expect `#C56B4A`.
- Add one test: old `lastMovedAt` (5+ local days before a fixed `today` injected via
  domain helper in isolation, or by setting a known-old date and asserting `color !==
  baseColor` when days ≥ 5 — prefer testing staleness in domain tests; chartMarkers
  test only verifies `baseColor` is raw palette and `color` calls through).

### 7.3 Manual verification

- [ ] Sample data with varied `lastMovedAt` dates shows gradient of reddening on chart.
- [ ] Drag a stale dot → immediately returns to project color.
- [ ] Select dot with trail → ghosts stay project color; live dot may be red.
- [ ] Task stale, project fresh (or vice versa) on same project view chart.
- [ ] `npm run lint && npm run test && npm run build`

---

## 8. Files touched

| File | Change |
|------|--------|
| `src/domain/staleness.ts` | **New** — day math, ratio, lerp, `staleFillColor` |
| `src/domain/staleness.test.ts` | **New** — domain unit tests |
| `src/composables/chartMarkers.ts` | `baseColor` + stale `color` on markers |
| `src/composables/chartMarkers.test.ts` | Fixture dates; optional baseColor assertion |
| `src/components/HillChart.vue` | Trail uses `m.baseColor`, marker uses `m.color` |
| `docs/superpowers/specs/2026-06-02-salita-v1-roadmap-design.md` | Mark iteration 17 **done** + link this doc when implementation ships |

**No changes:** store, schema, `MarkerChart.vue`, `MarkerTrail.vue`, side panel.

---

## 9. Spec self-review

- [x] No TBD placeholders.
- [x] Ghost trail decision (A) documented — `baseColor` split prevents accidental trail reddening.
- [x] Calendar-day math aligned with `localDateString` used elsewhere.
- [x] No timer — consistent with brainstorm lock-in and iteration 14 pattern.
- [x] `lastMovedAt` semantics unchanged from iteration 16 (no bump on failed peak drag).
- [x] Scope fits a single implementation plan; no iteration 18+ pull-forward.
