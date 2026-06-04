# Salita — Iteration 8: Panel dot edits (design)

**Date:** 2026-06-04  
**Status:** Approved  
**Parent spec:** `docs/salita-design-spec.md` (§4.4 #1–2, §5.1, §5.6)  
**Roadmap:** `docs/superpowers/specs/2026-06-02-salita-v1-roadmap-design.md` (iteration 8)  
**Builds on:** iteration 5 (side panel), iteration 7 (force edit UX patterns)

Edit dot metadata from the project-view side panel: inline name + external link
(click-to-edit, URL hidden in display), position slider, and shared URL parsing
with system icons.

---

## 1. Goal

After this iteration, on the **project view** side panel a manager can:

- **Rename** the selected dot inline (click name → edit).
- **Set or fix** the external tracker link in the same edit flow (name + link
  fields, like force label + owner) — URL is never shown as plain text in display
  mode.
- **Open** the tracker item via a **system icon** beside the name (new tab) when
  a link exists.
- **Move** the dot with a 0–100 position slider (same `setPosition` as chart drag).

**Out of scope:** Overview side panel (iteration 9); peak drag clamp and panel
hint (iteration 16); delete and trail sparkline (iteration 19); `+ Project` /
`+ Task` modals (iterations 10–11) — but `parseSourceUrl` is shared with those
flows.

---

## 2. Decisions (brainstorm lock-in)

| Topic | Decision |
|-------|----------|
| URL in display | Hidden — no URL string in the panel chrome |
| External navigation | `SourceSystemIcon` beside name, linked when `source.url` exists |
| URL editing | Always available in **edit mode** (name click); empty on save clears `source` |
| Edit UX | Click name → name + link inputs; Enter/blur save, Esc cancel (align with `ForceChip`) |
| URL on save | `parseSourceUrl()` infers `system`, `id`, normalized `url`; persist all applicable fields |
| Unknown host | Valid URL → store `{ url }` only; generic link icon |
| Invalid URL | Inline error on link field; stay in edit; do not clear existing `source` until user fixes or clears link |
| Systems parsed (v8) | Jira, Linear, GitHub Issues, **GitLab**, Asana, ClickUp, Monday, Trello |
| Parser | Host/path regex heuristics only — no network, no favicon fetch |
| Name empty | Reject save; stay in edit (same as forces) |
| Position | `<input type="range">` → `setPosition`; no peak clamp until iteration 16 |
| Concurrent edit | Header edit vs force chip/add: one at a time; starting one cancels the other (discard draft) |
| Store API | New `updateTrackable(trackableId, patch)` for name and `source` |

---

## 3. Architecture

### 3.1 `src/domain/parseSourceUrl.ts`

Pure function:

```ts
parseSourceUrl(raw: string): Source | null
```

- Trim input; empty → `null` (caller clears `source`).
- Require parseable absolute URL (`new URL()` with `http:` / `https:`); reject
  invalid with `null` or a typed result the UI maps to an error message.
- Normalize stored `url` to the parsed href (canonical https where applicable).
- Match host/path against heuristics (first match wins):

| `system` | Heuristic (v1 — illustrative) |
|----------|--------------------------------|
| `jira` | `*.atlassian.net/browse/{KEY}` |
| `linear` | `linear.app` issue paths (e.g. `/issue/{id}`) |
| `github` | `github.com/{owner}/{repo}/issues/{n}` |
| `gitlab` | `gitlab.com` or self-hosted GitLab: `/-/issues/{iid}` (issue URLs only in v8) |
| `asana` | `app.asana.com` task URLs |
| `clickup` | `app.clickup.com` task paths |
| `monday` | `*.monday.com` item/board URL patterns |
| `trello` | `trello.com/c/{cardId}` |

- Extract human-readable `id` where the pattern exposes it (issue key, number,
  card id, etc.).
- Unmatched valid URL → `{ url }` only.

**Vitest:** table-driven cases per system, unknown host, malformed input, trim,
GitLab self-hosted host variant if supported by regex.

**Reuse:** iteration 10 `+ Project` / `+ Task` modals call the same module.

### 3.2 Store — `updateTrackable`

Add to `hillChart.ts`:

```ts
updateTrackable(
  trackableId: string,
  patch: { name?: string; source?: Source | null },
): void
```

- Resolve trackable via existing `findTrackableById`; no-op if missing.
- `name`: trim; if empty string, no-op (UI blocks before call).
- `source: null` or clear signal → `delete trackable.source` (internal-only dot).
- `source` object → assign `trackable.source = patch.source` (already parsed).

No change to `setPosition` in v8.

### 3.3 `SourceSystemIcon.vue`

- Props: `system?: string`, optional `size` (default 16).
- Inline SVG per known `system` value (warm palette, simple marks — not official
  trademark assets; recognizable silhouettes/colors).
- Fallback: generic external-link icon when `system` missing or unknown.
- Decorative when inside a link (`aria-hidden`); parent `<a>` gets
  `aria-label` e.g. `Open in Jira` / `Open external link`.

### 3.4 `SidePanel.vue` header

**Display mode**

```
[Icon↗]  Name (click to edit)          [type badge]  [✕]
```

- Icon: only when `trackable.source?.url` — `<a href>` new tab. Icon reflects
  `source.system` after parse.
- Name: `h2` styling, `cursor-text`, hover affordance consistent with v7 forces.
- No URL text visible.

**Edit mode** (click name)

- Stack: name input (required), link input (optional).
- Placeholder on link: `Paste tracker URL…`
- Enter on link field or blur on last focused field → save pipeline.
- Esc → cancel; restore drafts from store.
- Save: validate name → `parseSourceUrl(link)` → `updateTrackable({ name, source })`.
- Clear `editingHeader` and cancel force edit/add when `trackableId` changes or
  panel closes.

**State:** `editingHeader: boolean` (or equivalent); mutually exclusive with
`editingForceId` / `addingDirection`.

### 3.5 Position section

Replace read-only number with:

- Range input `min="0" max="100" step="1"` bound to `trackable.position`.
- On input → `setPosition(trackableId, value)`.
- Show numeric value beside slider.
- Keep `At the peak` copy when `position === 50`.

Chart markers update via existing store reactivity (same as drag).

---

## 4. Data flow

### 4.1 Save name + link

1. User clicks name → `editingHeader = true`; force edit/add cancelled.
2. Drafts initialized from `trackable.name` and `trackable.source?.url ?? ''`.
3. User edits; Enter or blur on link field → trim name (reject if empty).
4. Trim link: if empty → `updateTrackable(id, { name, source: null })`.
5. If non-empty link → `parsed = parseSourceUrl(link)`; if invalid → show error,
   stay in edit; else `updateTrackable(id, { name, source: parsed })`.
6. Clear `editingHeader`.

### 4.2 Open external item

Display only: user clicks system icon → browser opens `source.url` (no edit mode).

### 4.3 Slider

1. User moves slider → `setPosition(trackableId, n)`.
2. `lastMovedAt` updates in store; chart + panel readout sync.

Peak blocking at 50 with active downs is **not** implemented until iteration 16.

---

## 5. Error handling & accessibility

- Store no-ops for unknown `trackableId`: silent.
- Invalid URL in edit: `aria-invalid` on link input; short inline message.
- Icon link: descriptive `aria-label` including system name when known.
- Name in edit: `aria-label` / associated `<label>` for screen readers.
- Slider: `aria-valuemin/max/now` via native range or labelled output.

---

## 6. Testing

**Required gate:** `npm run lint && npm run format:check && npm run test && npm run build`.

| Area | Coverage |
|------|----------|
| `parseSourceUrl.test.ts` | Required — all eight systems + unknown + invalid + empty |
| `hillChart.test.ts` | `updateTrackable` — rename, set source, clear source, no-op unknown id |
| Components | Optional |

**Manual test plan**

- [ ] Click name → edit name + link; Esc cancels.
- [ ] Save with Jira/Linear/GitHub/GitLab URLs → correct icon + opens correct tab.
- [ ] Unknown domain URL → saves, generic icon, opens URL.
- [ ] Clear link on save → no icon; dot internal-only.
- [ ] Fix wrong URL in edit → re-parse updates icon/system.
- [ ] Slider moves dot on chart; persists after refresh.
- [ ] Only one of header edit / force edit / add form at a time.
- [ ] Primary forces and position snap-back (iter 6) still work after panel edits.

---

## 7. Files

| File | Action |
|------|--------|
| `src/domain/parseSourceUrl.ts` | Create |
| `src/domain/parseSourceUrl.test.ts` | Create |
| `src/components/SourceSystemIcon.vue` | Create |
| `src/components/SidePanel.vue` | Update |
| `src/stores/hillChart.ts` | Add `updateTrackable` |
| `src/stores/hillChart.test.ts` | Extend |
| `docs/superpowers/specs/2026-06-04-salita-iteration-8-panel-dot-edits-design.md` | This doc |

**Branch (implementation):** `feature/iteration-8-panel-dot-edits` off `main`.

**Branch (this doc only):** `docs/iteration-8-panel-dot-edits` acceptable per roadmap.

---

## 8. Spec self-review (2026-06-04)

- [x] No TBD placeholders.
- [x] URL hidden in display; icon + click-to-edit name/link per brainstorm.
- [x] GitLab included in parser list.
- [x] No iteration 9/10/16/19 pull-forward except shared parser for 10.
- [x] Peak clamp explicitly deferred to iteration 16.
- [x] Scope limited to project-view `SidePanel`.
