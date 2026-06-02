# Salita — v1 roadmap (iterations 3–20)

**Date:** 2026-06-02  
**Status:** Approved (sequencing)  
**Parent spec:** `docs/salita-design-spec.md` (full v1)  
**Completed:** iterations 1–2 (see below)

This document is the **backlog and handoff guide** for remaining v1 work. Each
iteration should get its own branch and a focused design doc (same pattern as
iterations 1–2) before implementation. Pick the **lowest-numbered iteration
whose status is `pending`** and work only that scope.

---

## How to pick up the next task (for humans and AI)

1. Read `docs/salita-design-spec.md` for full product behavior.
2. Read `docs/domain-vocabulary.md` for code naming (Project, Task, HillTrackable, ChartMarker).
3. Read this file — find the first iteration with status **pending**.
4. Read the completed iteration specs for context:
   - `docs/superpowers/specs/2026-05-27-salita-iteration-1-scaffold-hill-mechanic-design.md`
   - `docs/superpowers/specs/2026-05-29-salita-iteration-2-project-view-tasks-design.md`
5. Create a **new branch** (e.g. `iteration-3-persist-state`).
6. Write a short iteration design doc:
   `docs/superpowers/specs/YYYY-MM-DD-salita-iteration-N-<slug>-design.md`
7. Implement **only** that iteration’s deliverables; do not pull forward later
   iterations.
8. Verify: `npm run build` (and unit tests where the iteration adds them).
9. Do **not** open a PR unless the user asks; commits authored as Roman only (no
   Co-Authored-By / Claude mentions), per prior iteration delivery notes.

**Current codebase snapshot (after iteration 2):**

- Live: `/projects` overview, `/projects/:id` project view, draggable dots,
  `↑/↓` badges, double-click overview → drill-in.
- Store: `setPosition` only; state re-seeds from `sample.ts` each load (no
  persist plugin).
- No side panel, header controls, import/export, snapshots, staleness, done
  stack, or force editing UI.

---

## Progress tracker

| Iter | Slug | Status | Milestone |
|------|------|--------|-----------|
| 1 | scaffold-hill-mechanic | **done** | — |
| 2 | project-view-tasks | **done** | — |
| 3 | persist-state | **done** | M1 |
| 4 | overview-chrome | **done** | M1 |
| 5 | side-panel-readonly | **done** | M2 |
| 6 | store-force-mutations | **pending** | M2 |
| 7 | panel-force-ux | **pending** | M3 |
| 8 | panel-dot-edits | **pending** | M3 |
| 9 | overview-click-drill | **pending** | M3 |
| 10 | add-project | **pending** | M4 |
| 11 | add-task | **pending** | M4 |
| 12 | import | **pending** | M4 |
| 13 | export-clean | **pending** | M4 |
| 14 | end-daily | **pending** | M5 |
| 15 | trail-on-chart | **pending** | M5 |
| 16 | peak-crossing | **pending** | M6 |
| 17 | staleness | **pending** | M6 |
| 18 | done-stack | **pending** | M6 |
| 19 | panel-sparkline-delete | **pending** | M6 |
| 20 | landing-page | **pending** | M6 |

Update the **Status** column to `done` when an iteration ships (and link its
design doc in a new “Completed iteration docs” subsection at the bottom).

---

## Milestones (team-testing readiness)

| Milestone | You can… | After iteration |
|-----------|----------|-----------------|
| **M1 — Trust the app** | Refresh without losing work; overview looks like a product | 4 |
| **M2 — Inspect a dot** | Click → see name, position, forces (read-only) | 6 |
| **M3 — Run the conversation** | Add/resolve forces; rename; slider position; overview panel + drill | 9 |
| **M4 — Own your data** | Create projects/tasks; import JSON; export/clean round-trip | 13 |
| **M5 — Close the daily** | End daily → snapshots; ghost trail on chart | 15 |
| **M6 — Full v1 polish** | Peak rule, staleness, done stack, sparkline, delete, landing | 20 |

**First team dry-run target:** end of **M5** (iteration 15). Iterations 16–20
improve the pilot but are not blocking for a first standup.

**Optional deferrals** (can slip past M5): 17 staleness, 18 done stack, 20
landing page fullness, label leader-lines (already deferred in parent spec).

---

## Sequencing approach

**Vertical slices** (recommended and locked in): each iteration ships one thin,
user-visible (or infrastructure-critical) capability. Avoid horizontal “build
all store actions first” unless an iteration explicitly says store-only.

**Rationale for order:** persist before team use → panel read-only before force
editing → forces before import-heavy workflows → I/O before end-daily trail →
visual rules and landing last.

---

## Iteration details

### Iteration 3 — Persist state

**Goal:** State survives browser refresh.

**Deliverables:**

- Add `pinia-plugin-persistedstate`; persist full store under key
  `hill-chart-state` (per parent spec §7).
- On first visit (empty storage), seed from `sample.ts` once; thereafter hydrate
  from `localStorage`.
- Confirm dragging still updates persisted state.

**Out of scope:** Import/export; changing schema shape.

**Likely touch:** `main.ts`, `stores/hillChart.ts`, `package.json`.

**Tests:** Optional store hydration test; `npm run build` required.

---

### Iteration 4 — Overview chrome

**Goal:** `/projects` has the header bar from the design spec; controls are
visible but not yet functional.

**Deliverables:**

- Shared header component (or app shell) on overview (and align project view
  header styling where it already has back + name).
- **Working:** app name links to `/`.
- **Stubbed:** Import, Export, Clean, + Project, End daily — rendered as pill
  buttons, disabled or no-op (no store actions).

**Out of scope:** Wiring any button to real behavior.

**Why separate:** Layout-only PR; later iterations attach handlers without
restructuring the page.

**Likely touch:** `App.vue`, `views/OverviewView.vue`, maybe
`views/ProjectView.vue`, new `components/AppHeader.vue`.

---

### Iteration 5 — Side panel (read-only)

**Goal:** Click a dot on the **project view** → right-hand panel shows dot
details; no editing yet.

**Deliverables:**

- `SidePanel.vue` (read-only sections): header (name, type badge, source link if
  present), position display, active up/down forces lists, past sections
  (collapsible), no forms.
- `selectedTrackableId` in app shell — panel is component state, not in the URL
  (parent spec §4.4).
- `HillChart` / `ChartMarker`: emit **click** (distinct from drag and from
  `dblclick` drill on overview) for project view only in this iteration.

**Out of scope:** Overview click-to-panel; force add/resolve; slider; delete.

**Likely touch:** `App.vue`, `components/SidePanel.vue`, `ChartMarker.vue`,
`HillChart.vue`, `views/ProjectView.vue`.

---

### Iteration 6 — Store: force mutations

**Goal:** Pinia actions for force lifecycle; panel can stay read-only or show
disabled controls — prefer keeping panel read-only and testing actions via unit
tests only if that keeps the PR small.

**Deliverables:**

- Actions: `addForce(trackableId, direction, label, owner?)`, `updateForce`,
  `resolveForce`, `unresolveForce` (names flexible; behavior per parent spec §3).
- Preserve `isPrimary` assignee rules (cannot resolve primary).
- Vitest coverage on pure helpers or store actions.

**Out of scope:** Panel forms (iteration 7).

**Likely touch:** `stores/hillChart.ts`, `stores/hillChart.test.ts`.

---

### Iteration 7 — Panel: force UX

**Goal:** Manager can manage forces during the daily from the side panel.

**Deliverables:**

- `ForceChip.vue`, `ForceAddForm.vue` (inline label/owner; Enter save, Esc cancel).
- Wire to iteration 6 actions; resolve ✓ on chips; unresolve from past sections.
- **UI rule:** no `+ Down force` when dot `position > 50` (downhill); primary
  force has no resolve button.

**Out of scope:** Peak **auto-resolve on drag** (iteration 16); name/position
edit (iteration 8).

---

### Iteration 8 — Panel: dot edits

**Goal:** Edit dot metadata without opening a separate modal.

**Deliverables:**

- Inline editable name in panel header.
- Position slider 0–100 → calls existing `setPosition`.
- Display/edit external `source` link when present (parent spec §4.4 header).

**Out of scope:** Delete dot (iteration 19); trail sparkline (iteration 19).

---

### Iteration 9 — Overview click + drill

**Goal:** Consistent interaction on overview and project view.

**Deliverables:**

- Overview: **single-click** dot → side panel for that project.
- Panel: **“Open project →”** navigates to `/projects/:id`.
- Decide and document in iteration doc: keep **double-click** drill on overview
  as shortcut, or remove in favor of panel-only drill (parent spec §5.2 default:
  panel button; double-click was iteration 2 convenience).
- Project view: click still opens panel (iteration 5 behavior retained).

**Out of scope:** New store features.

---

### Iteration 10 — + Project

**Goal:** Manually add a project from the overview.

**Deliverables:**

- Modal: name, optional external URL (infer `source.system` / `source.id` from
  known URL patterns where possible).
- `addProject`: round-robin color, `position: 0`, primary up force Owner
  (empty owner).
- Wire overview header **+ Project** (iteration 4 stub).

**Out of scope:** + Task (iteration 11).

---

### Iteration 11 — + Task

**Goal:** Manually add a task from the project view.

**Deliverables:**

- Modal (same shape as project).
- `addTask(projectId, …)` on store.
- **+ Task** in project view header (parent spec §4.3).

---

### Iteration 12 — Import

**Goal:** Load tracker-exported JSON into an empty store.

**Deliverables:**

- `schema/validate.ts` — validate against types / schema; surface errors.
- Import UI: file picker and/or drag-drop; only when store is empty (parent
  spec §5.4).
- Overview empty state CTAs: Import + link to landing (parent spec §4.2).
- Wire header Import (replace stub).

**Out of scope:** Export, Clean (iteration 13).

---

### Iteration 13 — Export & Clean

**Goal:** Round-trip workflow Export → skill edit → Clean → Import.

**Deliverables:**

- Export: download `hill-chart-<timestamp>.json`.
- Clean: confirm dialog; wipe store; re-enable Import.
- Wire header Export and Clean.

---

### Iteration 14 — End daily

**Goal:** Explicit snapshot commit for today’s standup.

**Deliverables:**

- `endDaily()`: for every project and task dot, set snapshot for **today’s
  calendar date** (replace if exists); parent spec §5.3.
- Wire header **End daily**; no confirmation modal in v1.

**Out of scope:** Rendering trail on chart (iteration 15).

---

### Iteration 15 — Trail on chart

**Goal:** Visual history behind each dot during the daily.

**Deliverables:**

- Render last **10** snapshots as ghost dots (opacity ramp oldest ~10% → newest
  ~70%; current dot 100%); parent spec §5.7.
- No connecting line between ghosts (parent spec open question #4).

**Out of scope:** Side panel sparkline (iteration 19).

---

### Iteration 16 — Peak crossing

**Goal:** Business rule when dragging across the peak.

**Deliverables:**

- In `setPosition`, when position crosses **50** going right: auto-resolve all
  active forces with `resolutionReason: "reached peak"` (parent spec §2, §5.1
  implication).
- After on downhill: enforce no new down forces (should already be in panel UI
  from iteration 7; verify on drag path).

---

### Iteration 17 — Staleness reddening

**Goal:** Dots that haven’t moved in days visually age.

**Deliverables:**

- `composables/useStaleness.ts` (or inline in `chartMarkers`): `staleness =
  min(daysSinceLastMove / 5, 1)`; lerp project color → `#C04A2D` (parent spec
  §5.8).
- Apply to marker fill in `ChartMarker.vue` / `ChartMarker`.

---

### Iteration 18 — Done stack

**Goal:** Keep x=100 readable when many dots are done.

**Deliverables:**

- `DoneStack.vue`: collapsed column bottom-right, “+ N more”, expand to list
  (parent spec §2, open question #3 default: stack when ≥1 done).
- Done dots remain draggable back from 100.

---

### Iteration 19 — Panel sparkline + delete

**Goal:** Full side panel completeness.

**Deliverables:**

- Position trail sparkline (full snapshot history) in panel §4.4 #7.
- Danger zone: delete with confirm; store `removeProject` / `removeTask` (by
  `trackableId` / kind).

---

### Iteration 20 — Landing page

**Goal:** Cold visitors understand the app (parent spec §4.1).

**Deliverables:**

- Expand `LandingView.vue`: hero, hill explainer, forces explainer, daily ritual
  steps, primary CTA, secondary Import link, **privacy note** (localStorage only,
  no shared backend — parent spec §8.7).

**Out of scope:** Tracker import skill (separate package per parent spec §9).

---

## Not in this roadmap (parent spec §10 / §9)

- Multi-user, auth, sync, backend
- Mobile / responsive
- Direct tracker API from the app
- Tracker import **skill** (separate repo: `hill-chart-skill/`)
- Keyboard shortcuts, undo/redo
- Cloudflare deploy automation (only `_redirects` exists today)
- Label leader-lines / overlap resolution

---

## Completed iteration docs

| Iter | Design doc |
|------|------------|
| 1 | `docs/superpowers/specs/2026-05-27-salita-iteration-1-scaffold-hill-mechanic-design.md` |
| 2 | `docs/superpowers/specs/2026-05-29-salita-iteration-2-project-view-tasks-design.md` |
| 3 | `docs/superpowers/specs/2026-06-02-salita-iteration-3-persist-state-design.md` |

*(Add rows here as iterations 4+ complete.)*

---

## Spec self-review (2026-06-02)

- No TBD placeholders in iteration scopes.
- Order matches brainstorm: vertical slices, M1–M6 gates, team dry-run at M5.
- Iteration 4 “stub header” matches user clarification (chrome only).
- Click semantics: iteration 5 project-only click; iteration 9 unifies overview
  with panel drill — consistent with parent spec default.
