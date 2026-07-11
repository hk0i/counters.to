# Engineering Design Document (EDD)

## Project: Counters.to Web Frontend (V1)

**Status:** Draft
**Architecture:** Static SvelteKit site (`adapter-static`, fully prerendered), consuming the flat-file-compiled REST API from `counters-data-core`

## 1. Objective & Scope

This specification defines the frontend that consumes the static JSON API produced by `packages/counters-data-core` (see `docs/counters.to backend EDD.md`). It covers stack choice, directory layout, data-fetching and offline strategy, routing/page map, state management, local dev environment, build/deploy to GitHub Pages, and testing. Visual/brand design is covered at a process level only for V1 — see section 10.

This package is licensed **GPLv3**, separately from `counters-data-core` (MIT). See section 11.

## 2. Stack

- **SvelteKit** (Svelte 5, runes), **TypeScript**, **Vite** (SvelteKit is Vite-based)
- **`@sveltejs/adapter-static`** — prerenders every route to plain HTML/CSS/JS at build time, no server at runtime
- **`@vite-pwa/sveltekit`** for service worker + manifest generation (same Workbox foundation, same author/ecosystem as the Vue-targeted `vite-plugin-pwa`)
- No separate router library — file-based routing is built into SvelteKit
- No external state library — Svelte 5 runes (`$state`, `$derived`) in plain `.svelte.ts` modules cover this app's small shared-state needs (team-builder slots, online status)

### Why SvelteKit over plain Svelte + a router

Real Svelte apps overwhelmingly use SvelteKit rather than hand-rolled Vite+Svelte+router setups — it's the maintained, idiomatic path, with file-based routing and `load` functions as first-class concepts rather than something bolted on.

### Why SvelteKit over Nuxt

This is the fairer comparison than "Nuxt vs. plain Vue SPA" was. Nuxt's `generate` mode can also produce a fully static, prerendered site, so the SEO benefit isn't unique to SvelteKit. Two things still tip it: a preference for Svelte's compiled-away runtime (smaller bundles matter for an offline-first PWA — less to download and precache), and SvelteKit's static-adapter mode is a cleaner "this will never have a server" story — Nuxt's hybrid-rendering machinery (server routes, multiple rendering modes) exists whether or not `generate` mode uses it, which is unused complexity for a project that will never run a Node server.

### Why not Pinia-equivalent state management

Svelte 5 runes are built into the compiler, not a library choice — `$state`/`$derived` in a `.svelte.ts` module *is* the idiomatic shared-state pattern here, not a stepping-stone to something heavier.

## 3. Directory Structure Blueprint

```
packages/counters-web/
├── static/                        # SvelteKit's equivalent of Vue's public/ — copied to build output as-is
│   ├── api/v1/                    # compiled output from counters-data-core — NOTE: path changes, see section 9
│   └── CNAME                      # "counters.to" — see section 9
├── src/
│   ├── app.html
│   ├── routes/
│   │   ├── +layout.svelte         # global layout, mounts OfflineBanner
│   │   ├── +page.svelte           # "/" — home hero grid
│   │   ├── +page.ts               # load function: heroes/index.json
│   │   ├── heroes/
│   │   │   └── [id]/
│   │   │       ├── +page.svelte
│   │   │       └── +page.ts       # load fn + `entries()` export enumerating all 51 hero ids for prerendering
│   │   ├── team-builder/
│   │   │   └── +page.svelte
│   │   └── about/
│   │       └── +page.svelte
│   ├── lib/
│   │   ├── components/
│   │   │   ├── HeroCard.svelte
│   │   │   ├── RoleFilterBar.svelte
│   │   │   ├── TeamSlotPicker.svelte
│   │   │   ├── CounterSuggestionsPanel.svelte
│   │   │   ├── MatchupBadge.svelte
│   │   │   └── OfflineBanner.svelte
│   │   ├── state/
│   │   │   ├── teamComp.svelte.ts     # shared enemy-team-slot state (runes)
│   │   │   └── onlineStatus.svelte.ts
│   │   └── types/
│   │       └── api.ts                 # mirrors counters-data-core's compiled JSON shapes
├── Dockerfile                         # local dev / offline testing, see section 8
├── vite.config.ts
├── svelte.config.js                   # adapter-static config
└── package.json

docker-compose.yml                     # repo root — see section 8
.env.example                           # repo root — see section 8
```

## 4. Data Layer

### 4.1 New backend dependency: `matchups/index.json`

The team-builder view (section 6) needs pairwise matchup data for up to 5 heroes at once. Fetching 5 separate `heroes/:id/index.json` deep resources per lookup works but is wasteful. This spec assumes `counters-data-core` adds one more static endpoint:

```
GET /api/v1/matchups
Physical path: static/api/v1/matchups/index.json (path per section 9)
```

A flat structure covering every ordered pair where a relationship exists (both directions checked independently, per the backend's non-reciprocal design — see `CLAUDE.md`):

```json
{
  "data": [
    { "heroId": "sigma", "threatFrom": "zarya", "matchedTraits": ["beam"] },
    { "heroId": "sigma", "advantageOver": "dva", "matchedTraits": ["projectile"] }
  ]
}
```

~2,600 entries at 51 heroes, comfortably one small fetch. **This endpoint doesn't exist yet** — it's a dependency on the data-core package, not something this frontend spec can build alone. Flag it back as a small follow-up task there before starting `TeamBuilderView`.

### 4.2 Fetching & caching contract

- `src/routes/+page.ts` `load()` fetches `/api/v1/heroes/index.json` — since this route is fully prerendered (section 9), the fetch actually happens once at build time, not per-visitor.
- `src/routes/heroes/[id]/+page.ts` `load()` fetches `/api/v1/heroes/:id/index.json` for that hero; `entries()` in the same file enumerates all 51 ids (reading the local compiled `heroes/index.json` at build time) so every hero page is prerendered too.
- `useMatchups`-equivalent (`src/lib/state/matchups.svelte.ts`) fetches `/api/v1/matchups/index.json` once client-side on first visit to `/team-builder`, since that page's interactivity (not its shell) is what needs it — no reason to bloat every prerendered page's build-time fetch with data only the team-builder needs.
- All fetches are plain `fetch()` — no data-fetching library needed at this scale (no retries, no pagination, no mutations against a read-only static API).

### 4.3 Offline strategy (`@vite-pwa/sveltekit`)

- **Precache** (install-time, via Workbox `globPatterns`): the prerendered app shell — since every route is static HTML at build time (section 9), this effectively precaches the whole site, including hero detail pages, not just a JS shell.
- **Runtime cache** (`StaleWhileRevalidate`): `/api/v1/**` still gets this treatment for the team-builder's client-side `matchups` fetch and any post-deploy data changes — serves instantly from cache, refreshes in the background. Appropriate because this data only changes on redeploy (hero balance patches), not in real time.
- `OfflineBanner.svelte` reads `src/lib/state/onlineStatus.svelte.ts` (wraps `navigator.onLine` + `online`/`offline` events) and shows a small persistent notice when offline — data is still fully usable, just not guaranteed fresh.

## 5. Routing / Page Map

| Route (file) | Purpose |
|---|---|
| `src/routes/+page.svelte` (`/`) | Hero grid, filterable by role, searchable by name |
| `src/routes/heroes/[id]/+page.svelte` | Playbook, tactical caveats, threats list, advantages list |
| `src/routes/team-builder/+page.svelte` | Pick an enemy team (role-locked, up to 1 tank / 2 damage / 2 support), get ranked counter suggestions computed client-side from the matchups fetch |
| `src/routes/about/+page.svelte` | Project description, license summary, Blizzard IP attribution (section 11) |

Since every route is known and prerendered at build time (all 51 hero ids via `entries()`, plus the 3 static routes), GitHub Pages doesn't need the usual SPA-on-static-hosting `404.html`-redirects-to-`index.html` workaround — every real URL has a real prerendered HTML file already. A genuine `src/routes/+error.svelte` still handles truly nonexistent hero ids (a real 404, not a routing hack).

## 6. Team-Builder Aggregation Logic

Client-side, no backend involvement beyond the `matchups` fetch:

1. User fills up to 5 enemy team slots (role-locked to mirror the 1-2-2 structure).
2. For each candidate hero not on the enemy team, sum matched-trait counts where the candidate's `advantageOver` hits an enemy slot, minus counts where the candidate would be threatened by an enemy slot.
3. Sort candidates by that score, descending, grouped by role for the suggestion panel.

This is intentionally simple (a weighted sum, not a real matchmaking algorithm) — good enough for V1 and easy to reason about. Note in `about/+page.svelte` or nearby copy that suggestions are heuristic, not a guarantee.

## 7. Component Responsibilities (high level)

- **HeroCard.svelte** — role icon, name, click-through to detail. No fetching, pure props.
- **RoleFilterBar.svelte** — emits a role filter; the home route owns the filtered list.
- **TeamSlotPicker.svelte** — 5 role-locked slots, hero picker per slot (reuses `HeroCard` in a compact mode).
- **CounterSuggestionsPanel.svelte** — renders the ranked output of section 6's aggregation.
- **MatchupBadge.svelte** — small "threat" / "advantage" chip with matched-trait tooltip, reused on the hero-detail route and `CounterSuggestionsPanel`.
- **OfflineBanner.svelte** — global, mounted once in `+layout.svelte`.

Prop-level contracts and full component specs are deferred to implementation — this list exists so the route/component boundary is agreed before code exists, not to fully replace normal PR review.

## 8. Local Development Environment

Goal: serve the built site locally over a real hostname (not `localhost:5173`) so PWA/offline behavior can be tested against something that behaves like the eventual `counters.to` production domain — service worker scope, cache behavior, and manifest start-url all depend on origin, so testing against a real-ish origin catches issues `vite dev` won't.

### Why `to.counters.localhost`

RFC 6761 reserves the entire `.localhost` TLD to always resolve to loopback (`127.0.0.1`) — modern OS resolvers and browsers honor this for *any* subdomain, not just literal `localhost`, so `to.counters.localhost` resolves without touching `/etc/hosts`. Chromium and Firefox also both treat `*.localhost` origins as secure contexts over plain HTTP, which matters here specifically because **service workers require a secure context to register** — this is what makes the whole offline-testing setup work without needing real TLS certs locally. Worth a quick manual check in devtools (Application → Service Workers) the first time this is wired up, since secure-context handling for `.localhost` subdomains is a browser implementation detail, not a formal guarantee.

### Why the network is external and not committed

`jwilder/nginx-proxy` is meant to be a single, host-wide reverse proxy — it watches the Docker socket for any container with a `VIRTUAL_HOST` env var and routes to it by hostname. Only one process can bind host port 80, so it should run once, independent of any single project, with other projects' containers joining its network rather than each project starting its own copy. That's why this repo's `docker-compose.yml` only defines the `counters-web` service and references the proxy's network as `external: true` — it assumes nginx-proxy is already running from a separate, personal, one-time setup (not part of this repo, since it isn't project-specific).

**One-time host setup (not part of this repo):**

```bash
docker network create switchnet   # skip if it already exists
docker run -d --name nginx-proxy --restart unless-stopped \
  -p 80:80 \
  --network switchnet \
  -v /var/run/docker.sock:/tmp/docker.sock:ro \
  jwilder/nginx-proxy
```

### This repo's `docker-compose.yml`

```yaml
services:
  web:
    build:
      context: ./packages/counters-web
    environment:
      VIRTUAL_HOST: to.counters.localhost
    networks:
      - proxy
    restart: unless-stopped

networks:
  proxy:
    external: true
    name: ${DOCKER_NETWORK_NAME:-switchnet}
```

`DOCKER_NETWORK_NAME` is read from a gitignored `.env` (add `.env` to `.gitignore`, commit `.env.example` with `DOCKER_NETWORK_NAME=switchnet` as documented default) — anyone whose shared proxy network is named differently overrides it locally without touching the committed compose file. `switchnet` is baked in as the fallback default, matching the network name already in use for local development.

### `packages/counters-web/Dockerfile`

Builds the real `adapter-static` output and serves it as plain static files — deliberately not `vite preview` or the dev server, so local offline testing exercises the same static-file-serving model GitHub Pages will actually use in production, not a Node dev process:

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
```

nginx-proxy auto-detects the single `EXPOSE 80` — no `VIRTUAL_PORT` needed unless more ports get added later.

## 9. Build & Deploy (GitHub Pages)

### ⚠ Follow-up needed in `counters-data-core`

`compile.ts` currently writes to `packages/counters-web/public/api/v1/...` (Vue/Vite convention). SvelteKit's static-copy directory is `static/`, not `public/`. Before this spec can actually be implemented, `compile.ts`'s `OUT_ROOT` needs to change from `counters-web/public/api/v1` to `counters-web/static/api/v1`. This is a one-line change in a committed file — small atomic commit of its own, don't bundle it into unrelated frontend work.

### Custom domain assumption

The `counters.to` domain is already registered, so this spec assumes a **custom domain** deploy (`static/CNAME` containing `counters.to`), not a `username.github.io/counters.to/` project-pages subpath. `svelte.config.js`'s adapter-static `paths.base` should stay empty (root-relative), not a repo-name subpath. **Confirm this before first deploy** — if a subpath deploy is used instead, `base` needs to change and every `/api/v1/...` fetch call needs to go through SvelteKit's `base`-aware `resolve()`/`$app/paths` helper instead of a hardcoded absolute path.

### CI pipeline (GitHub Actions)

This closes the "no CI/deploy trigger" gap flagged in the backend EDD review. On push to `main`:

1. Checkout, setup Node, `npm ci` (workspace root).
2. `npm run compile --workspace=counters-data-core` — regenerate `static/api/v1/**` from the current hero `.md` source, so the deployed site always reflects the latest committed hero data rather than a possibly-stale committed JSON snapshot.
3. `npm run build --workspace=counters-web` — SvelteKit build via `adapter-static`; this both copies `static/` into the output and prerenders every route (all 51 hero pages plus the 3 static routes) to real HTML.
4. Upload the adapter-static output directory as a Pages artifact, deploy via `actions/deploy-pages`.

Whether the compiled `static/api/v1/**` JSON stays committed to git after CI does this for every deploy is a separate question worth revisiting — it's currently committed so the repo is inspectable/diffable without running the pipeline, but CI regenerating it on every deploy makes the committed copy closer to a convenience snapshot than a build artifact.

## 10. Visual / Design System

A Figma design system exists (as of this revision) — not yet reviewed. Once shared, this section should be filled in with: color/type tokens, component-to-`src/lib/components` mapping, and any deviations this spec's component list (section 7) needs as a result. Until then, treat section 7's components as structurally right but visually unstyled placeholders.

## 11. Licensing & Attribution

- `packages/counters-web` → **GPLv3** (per-package `LICENSE` file + `package.json` `license` field — not yet scaffolded, tracked in `CLAUDE.md`).
- Depends on `counters-data-core` (MIT) for types/data shape reference only — no code-sharing concern there since MIT can be freely consumed by a GPL package (just not the reverse).
- The `about` route should carry the Blizzard Entertainment IP disclaimer (unofficial fan project, not affiliated with or endorsed by Blizzard) in addition to the root `NOTICE.md` — the in-app footer/about page is the more visible surface for end users who'll never see the repo.

## 12. Testing Strategy

Absent from the backend EDD's review, worth not repeating here:

- **Vitest** + **`@testing-library/svelte`** for component/state-module tests — particularly `teamComp.svelte.ts` and the section 6 aggregation logic, since that's the one piece of real client-side logic in an otherwise mostly-presentational app.
- **Playwright**, scoped narrowly: one smoke test that the app loads and shows heroes, one that offline mode (service worker cache) actually serves the home view with the network disabled. Full e2e coverage isn't proportionate to this project's size — expand only if the app's surface area grows.

## 13. Open Items

- **`compile.ts`'s output path needs to change** (`public/api/v1` → `static/api/v1`) before this spec is buildable — see section 9. Small, separate commit in `counters-data-core`.
- `matchups/index.json` doesn't exist yet — coordinate with `counters-data-core` before starting section 6.
- Custom domain vs. subpath deploy needs confirming before the first CI run (section 9).
- Figma design system referenced but not yet reviewed (section 10) — placeholder styling only until that changes.
- Secure-context behavior for `*.localhost` (section 8) is a browser implementation detail worth a one-time manual confirmation, not a documented guarantee.
