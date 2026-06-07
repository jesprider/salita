# Salita — domain vocabulary

Canonical naming for humans and AI contributors. Product copy may still say **dot**;
code and implementation docs use the terms below.

**Related:** `docs/salita-design-spec.md` (behavior), `docs/superpowers/specs/2026-06-02-salita-v1-roadmap-design.md` (delivery order).

---

## Ubiquitous language (product & ritual)

| Term | Meaning |
|------|---------|
| **Hill** | The uncertainty curve; x = 0–100, peak at 50. |
| **Project** | Top-level work stream on the chart; has a color and tasks. |
| **Task** | Child work item inside a project; only on the project view chart. |
| **Dot** | Informal name for a project or task **as shown on the hill** (conversation, UI). Not a TypeScript type. |
| **Project dot** | The project’s chart marker (larger). |
| **Task dot** | A task’s chart marker (smaller). |
| **Force** | Up (assignee, helpers) or down (blockers) context on a project or task. |
| **Resolve (force)** | Mark a force resolved; moves to past section. |
| **Daily / End daily** | Standup ritual; snapshot positions for today. |
| **Snapshot / trail** | Historical positions for staleness and ghost markers. |

---

## Code vocabulary (implementation)

| Term | Layer | Meaning |
|------|-------|---------|
| `Project` | Domain (`schema/types.ts`) | Aggregate root; persisted. |
| `Task` | Domain | Entity inside `Project.tasks`. |
| `HillTrackable` | Domain | Shared shape: id, name, position, forces, snapshots, optional `source`. Implemented by `Project` and `Task`. |
| `HillChartState` | Domain | Root store document: `projects[]`. |
| `ChartMarker` | Presentation | Read model for one SVG marker (position, color, radius, force counts). |
| `overviewMarkers` / `markersForProject` | Presentation | Build `ChartMarker[]` for a view. |
| `MarkerChart.vue` | UI | Renders one marker on the hill. |
| `MarkerTrail.vue` | UI | Renders snapshot ghost trail for the selected marker. |
| `lookupInProject` | Application | Given a `Project` + id → `InProjectLookup` or null. |
| `InProjectLookup` | Application | `{ kind: TrackableKind, trackable: HillTrackable }`. |
| `TrackableKind` | Application | `'project' \| 'task'`. |
| `findTrackableById` | Store module (private) | Helper inside `hillChart.ts`; finds `Project` or `Task` by id. Not a Pinia action. |
| `selectedTrackableId` | UI state | Which trackable the side panel shows (project view). |
| `resolveForce` / `unresolveForce` | Store (planned) | Force lifecycle only. |

---

## Mapping: say this → type this

| Docs / UI | Domain type | On chart |
|-----------|-------------|----------|
| Project dot | `Project` | `ChartMarker` (large radius) |
| Task dot | `Task` | `ChartMarker` (small radius) |
| Click a dot | Select by `id` | `lookupInProject` + side panel |
| Drag a dot | `setPosition(trackableId, …)` | Updates `Project` or `Task` |
| Resolve a blocker | `resolveForce` | — |

---

## Reserved words

- **`resolve*`** — force lifecycle only (`resolveForce`, `unresolveForce`). Do not use for ID lookup.
- **`lookup*` / `find*`** — locating entities (`lookupInProject`, `findTrackableById`).
- **`Dot` / `dot`** — avoid in `src/` except user-visible strings (aria-label, copy). Prefer `trackable`, `ChartMarker`, `marker`.

---

## File conventions

| Area | Path pattern |
|------|----------------|
| Domain types | `src/schema/types.ts` |
| Chart projections | `src/composables/chartMarkers.ts` |
| Panel lookup | `src/composables/trackableLookup.ts` |
| Marker component | `src/components/MarkerChart.vue` |
| Store | `src/stores/hillChart.ts` |
