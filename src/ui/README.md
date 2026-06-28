# Justneed UI Kit

A small, production-grade component library for the Justneed app. It sits on top
of the existing design tokens (`src/constants/*`) and the responsive helpers
(`src/utils/responsive.ts`) and turns the patterns that screens were hand-rolling
— cards, status pills, empty/loading/error states — into reusable, accessible,
typed components.

```ts
import { Screen, JobCard, EmptyState, Button, StatusBadge } from '../ui';
```

---

## 1. Architecture

```
src/
├─ constants/        design tokens — colors, spacing, typography, shadows  (source of truth)
├─ utils/responsive  scaling + tablet breakpoints
└─ ui/               ← this kit
   ├─ Text           typography primitive (every string renders through this)
   ├─ Button         5 variants × 3 sizes, loading/disabled/icon
   ├─ Card           elevated / outlined / flat surface, optionally pressable
   ├─ Badge          tone × variant pill   →  StatusBadge (domain wrapper)
   ├─ Avatar         image with initials fallback (handles 404s)
   ├─ Spinner        inline + full-area loading
   ├─ Skeleton       shimmer placeholders   (+ SkeletonText)
   ├─ EmptyState     icon + title + copy + actions
   ├─ ErrorState     EmptyState specialization with retry
   ├─ Screen         safe-area + padding + tablet max-width wrapper
   ├─ JobCard        composite view-model card (+ JobCardSkeleton, toJobCardModel)
   └─ index.ts       public surface — import from here, not deep paths
```

**Layering rules**

1. **Tokens, never literals.** Components read from `constants/*`. No raw hex,
   no magic numbers for spacing/type. Change a token → the whole app moves.
2. **Primitives compose into domain components.** `Badge` knows nothing about
   applications; `StatusBadge` maps a status → `Badge`. `JobCard` composes
   `Card + Avatar + Badge + Text`. Domain knowledge lives in the thin wrapper,
   never in the primitive.
3. **Presentational, not connected.** Components take data via props. Data
   fetching, navigation and storage stay in screens/services. `JobCard` takes a
   normalized `JobCardModel`; the `toJobCardModel(row)` selector maps the API row
   so column names never leak into the UI.
4. **One import surface.** Everything ships through `ui/index.ts`. Screens never
   import `ui/Button` directly — only `from '../ui'`. Keeps refactors cheap.

---

## 2. Props / API design principles

- **Two orthogonal axes beat one fused enum.** `Badge` has `tone` (meaning:
  success/danger) **and** `variant` (emphasis: soft/solid/outline). 7 tones × 3
  variants = 21 looks from two small props, instead of 21 named variants.
- **Semantic tokens with a raw-string escape hatch.** `Text`'s `color` accepts
  `'secondary'` (token) *or* `'#FF0000'` (one-off) — common path is safe, rare
  path isn't blocked.
- **Required pairing is encoded.** An icon-only `Button` / a pressable `Card`
  requires `accessibilityLabel`. The prop names nudge you toward accessible code.
- **Loading is a first-class prop, not a swapped component.** `Button loading`
  keeps width, blocks presses, sets `busy`. No "spinner OR button" branching.
- **Graceful degradation by construction.** Every optional field in `JobCard`
  collapses cleanly when absent; `Avatar` never renders an empty box.

---

## 3. Components & key props

### `<Button>`
| prop | type | notes |
|---|---|---|
| `title` | `string` | optional when `iconOnly` |
| `variant` | `primary \| secondary \| outline \| ghost \| danger` | default `primary` |
| `size` | `sm \| md \| lg` | `md`/`lg` ≥ 48pt; `sm` gets hitSlop to clear 44pt |
| `loading` | `boolean` | preserves width, blocks press, announces busy |
| `leftIcon`/`rightIcon`/`iconOnly` | Ionicons name | `iconOnly` needs `accessibilityLabel` |
| `fullWidth` | `boolean` | stretch to container |

### `<Card>`
`variant` (`elevated`/`outlined`/`flat`) · `padding` (token or number) · `onPress`
(makes it a `button` role with press state + ripple) · `accessibilityLabel`.

### `<Badge>` / `<StatusBadge>`
`Badge`: `label` · `tone` · `variant` · `size` · `icon`.
`StatusBadge`: `status` — maps `Applied / Under Review / Interview / Accepted /
Rejected` (and legacy lowercase) to tone + icon in one place.

### `<Avatar>`
`uri` · `name` (→ initials + a11y label) · `size` (`xs…xl` or number) · `shape`.
Falls back to initials on missing **or broken** images.

### `<EmptyState>` / `<ErrorState>`
`icon` · `title` · `description` · `action` · `secondaryAction`.
`ErrorState` adds `onRetry`/`retrying`.

### `<Skeleton>` / `<SkeletonText>`
`width` · `height` · `radius` · `circle`. Respects Reduce Motion. Mirror the real
content's shape.

### `<Screen>`
`scroll` (false for FlatList screens) · `padded` · `refreshControl` · `edges`.
Centers + caps content width on tablets automatically.

### `<JobCard>`
`job: JobCardModel` · `onPress(id)` · `onBookmark(id)` · `isBookmarked` ·
`showBookmark`. Use `toJobCardModel(apiRow)` to build the model and
`<JobCardSkeleton/>` for the loading state.

---

## 4. Usage examples

### A screen with the full loading → error → empty → data lifecycle
```tsx
import { Screen, JobCard, JobCardSkeleton, EmptyState, ErrorState, toJobCardModel } from '../ui';

export default function SwipeFeed({ navigation }) {
  const { data, loading, error, refetch, refreshing } = useJobs();

  if (loading) {
    return (
      <Screen scroll={false}>
        {Array.from({ length: 5 }).map((_, i) => <JobCardSkeleton key={i} />)}
      </Screen>
    );
  }

  if (error) {
    return <Screen scroll={false}><ErrorState onRetry={refetch} retrying={refreshing} /></Screen>;
  }

  return (
    <Screen scroll={false} padded={false}>
      <FlatList
        data={data}
        keyExtractor={(j) => String(j.id)}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        ListEmptyComponent={
          <EmptyState
            icon="briefcase-outline"
            title="No jobs match your filters"
            description="Try widening your location or clearing some skills."
            action={{ label: 'Reset filters', onPress: clearFilters }}
          />
        }
        renderItem={({ item }) => (
          <JobCard
            job={toJobCardModel(item)}
            isBookmarked={item.is_saved}
            onPress={(id) => navigation.navigate('JobDetails', { jobId: id })}
            onBookmark={toggleSave}
          />
        )}
      />
    </Screen>
  );
}
```

### Button states
```tsx
<Button title="Apply now" onPress={apply} loading={submitting} fullWidth />
<Button title="Save" variant="outline" leftIcon="bookmark-outline" onPress={save} />
<Button iconOnly="close" variant="ghost" accessibilityLabel="Dismiss" onPress={close} />
```

### Status pill
```tsx
<StatusBadge status={application.status} />   // 'Interview' → warning + calendar icon
```

---

## 5. Best practices

**Do**
- Render every screen inside `<Screen>` and every string inside `<Text>`.
- Always handle four states for async data: **loading (skeleton) → error
  (ErrorState+retry) → empty (EmptyState) → data**. The kit has a component for
  each; there's no excuse to skip one.
- Match skeleton shape to real content so the layout doesn't jump.
- Give every pressable an `accessibilityLabel` and keep touch targets ≥ 44pt
  (the kit enforces this, don't fight it with tiny custom hitboxes).
- Map API rows to view-models (`toJobCardModel`) at the boundary.

**Don't**
- Hard-code colors, font sizes, or spacing in screens — reach for a token.
- Re-implement a status switch / empty view / card inline — it already exists.
- Put data fetching or navigation inside `ui/` components.
- Disable `allowFontScaling` globally; the kit caps multipliers where layout is
  fragile (Avatar initials, badges) and lets body text scale.

**Accessibility checklist baked in**
- Roles: `button`, `image`, `progressbar`, `summary` set correctly.
- States: `disabled` / `busy` / `selected` reflected for screen readers.
- Motion: Skeleton honors **Reduce Motion**.
- Contrast: `solid` badges/buttons pick ink-vs-white text per tone.

---

## 6. Adoption status

- ✅ Kit built and exported via `ui/index.ts`.
- ✅ `ApplicationsScreen` refactored onto it as the reference implementation.
- ⏭️ Remaining screens (Swipe, Pinned, Profile, JobDetails) can migrate
  incrementally — the kit is additive and the old `components/*` keep working.

> **Backend note:** the connected Supabase project is currently empty; the live
> data is served by the Express + Postgres backend (`backend/`, schema in
> `justneed-postgresql.sql`). `toJobCardModel` is written against that API row
> shape. If/when the app moves to Supabase, only the selector changes — not the
> components.
