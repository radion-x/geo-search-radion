## AI Coding Agent Instructions

Purpose: React + Vite single-page tool focusing on a location geocode + Google localized search workflow, styled with Tailwind (v4), Radix UI primitives, Spark plugin utilities, and small internal UI layer. Keep changes lean, preserve patterns below.

### Architecture Overview
- Entry: `src/main.tsx` mounts `<App />` inside an `ErrorBoundary` with custom `ErrorFallback` (`src/ErrorFallback.tsx`). In dev, errors rethrow for native overlay; in prod they render the fallback.
- Root UI: `src/App.tsx` renders `LocationSearchTool` + global `Toaster` (sonner notifications).
- Feature Focus: `src/components/LocationSearchTool.tsx` encapsulates all current business logic (geocoding, autocomplete, Google search URL construction). No global state manager; all state is local React state/hooks.
- UI System: `src/components/ui/*` contains headless-ish wrappers around Radix primitives & styling utilities. Shared class merge helper at `src/lib/utils.ts` (`cn`). Variants defined with `class-variance-authority` (see `button.tsx`). Follow same pattern for new components.
- Styling: Tailwind with design tokens from `theme.json` injected into Tailwind via `tailwind.config.js`. Colors referenced through CSS custom properties (e.g. `bg-background`, etc. coming from Spark + theme variables). Prefer utility classes + existing semantic tokens over hard-coded hex.
- Build Tooling: Vite (`vite.config.ts`) with plugins: React SWC, Tailwind, Spark plugin, Phosphor icon import proxy. Alias `@` -> `src` (see `tsconfig.json` + Vite resolve). TypeScript strict-ish (not full strict; `strictNullChecks` true, `skipLibCheck` true).

### Key Runtime Behaviors
- Geocoding & Autocomplete: Uses OpenStreetMap Nominatim directly via `fetch`. Adds `User-Agent` header. Debounced with manual `setTimeout` (300ms) + `timeoutRef`. Suggestions limited to 3.
- Google Search Localization: Builds multiple candidate URLs; primary uses `q`, `sll`, `gl`, `hl`, `location`, `ludocid=0`. Country code mapping is a local dictionary fallback -> `US`.
- Notifications: `sonner` toasts for validation errors, success states, network failures.
- Error Handling: Network errors logged to console + toast feedback; no retry/backoff abstraction yet.

### Conventions & Patterns
- State colocated inside component; prefer hooks only when logic becomes reusable (none yet except `use-mobile.ts`). If extracting, place hook under `src/hooks/`.
- Keep side-effects (API calls, timers) inside `useCallback` or event handlers; always clear timers (`timeoutRef`).
- Validation: simple trim checks + toast messages—mirror style when adding new inputs.
- Country Codes: Extend `getCountryCode` mapping rather than scattering new logic elsewhere.
- Component Styling: Use existing utility + variant pattern (`cva`) for interactive elements; avoid inline style objects unless dynamic calculation required.
- Error Boundary: If adding async boundaries or suspense, ensure they nest inside existing root boundary.
- Aliases: Always import internal modules with `@/` prefix (enables path remapping consistency).

### Adding Features (Examples)
- New Reusable UI Component: Place in `src/components/ui/` following existing pattern: export function + variant system if variants. Import `cn` for class merges.
- New Feature Section/Page: Create component under `src/components/`; wire into `App.tsx` (or future router if added). Keep business logic isolated to that component first.
- Extend Geocoding: Wrap fetch logic in a small helper (e.g. `src/lib/geocoding.ts`) if logic exceeds ~40 lines or multiple components need it.
- Persist Favorites/Search History: Add lightweight localStorage helper in `src/lib/` and hydrate inside `LocationSearchTool` with an effect. Keep serialization simple JSON; gate access behind `typeof window !== 'undefined'` check.

### Testing & Verification (Current Gaps)
- No automated tests present. If adding tests, prefer Vitest (integrates seamlessly with Vite). Place under `src/__tests__/` or co-locate with `.test.ts(x)` files.
- Manual Verification Flow: 1) Run `npm run dev` 2) Enter partial location (>=3 chars) -> see suggestions 3) Select + Geocode -> success toast 4) Enter search query -> opens localized Google tab.

### Build & Scripts
- Dev: `npm run dev` (Vite on port 5000). `npm run kill` forcibly frees port (Linux-centric; macOS users may adjust). 
- Build: `npm run build` (TypeScript build for type checking via `tsc -b --noCheck` then Vite bundle). `--noCheck` skips type check, so rely on editor / explicit `tsc --noEmit` if needed.
- Lint: `npm run lint` (ESLint config inferred via `@eslint/js` + plugins). Add rules in root config file if introduced (not yet present—ESLint auto config likely ephemeral).

### Performance & UX Notes
- Autocomplete debouncing is manual; maintain 300ms cadence to avoid rate limiting. If centralizing, ensure not to exceed Nominatim usage policy (1 req/sec/person recommended).
- Prefer minimal additional network dependencies—project intentionally lean (see minimal README).
- Keep bundle additions scrutinized; React 19 + SWC compile already optimize base.

### When Modifying Config
- Add new path aliases in both `tsconfig.json` and `vite.config.ts`.
- Tailwind tokens: Update `theme.json` (consumed at build) rather than editing compiled CSS. Keep variable naming consistent (`--color-*`).
- Adding icons: Import from existing libraries (`@phosphor-icons/react`, `lucide-react`)—Spark icon proxy may optimize; no need to add new icon pipeline.

### Anti-Patterns to Avoid
- Direct DOM manipulation (prefer React refs/state).
- Introducing global mutable singletons for simple state; keep it local or use context only if truly shared.
- Hard-coded style values bypassing design tokens (except for truly unique layout constants).
- Mixing fetch logic across multiple components without abstraction once duplicated.

### Quick Reference
- Root component: `src/components/LocationSearchTool.tsx`
- Utility merge: `src/lib/utils.ts` (`cn`)
- Error boundary fallback: `src/ErrorFallback.tsx`
- Tailwind config & theme tokens: `tailwind.config.js`, `theme.json`
- Country code mapping: inside `LocationSearchTool.getCountryCode`

### Agent Mindset
Optimize for clarity & small PRs: isolate concerns, preserve existing naming, and expand dictionaries/mappings instead of forking logic. Provide UX feedback with toasts consistently.

---
If unclear about a pattern, inspect analogous file in `src/components/ui/` before creating a new approach.
