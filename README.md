# Counters.to

Overwatch counter-picking data pipeline: flat-file hero profiles compiled
into a static REST API. See `docs/counters.to backend EDD.md` for the full
design.

## Licensing

This is a monorepo with a per-package license split, not one blanket
license for the whole repo:

| Package                | License | Why                                                                 |
| ----------------------- | ------- | -------------------------------------------------------------------- |
| `counters-data-core`   | MIT     | Shared data/schema/compiler, meant to be depended on by any client, including a future MIT-licensed mobile app. |
| `counters-web`         | GPLv3   | The hosted web app/API.                                              |
| `counters-mobile` (future) | MIT | Depends on `counters-data-core`; needs a permissive license to stay MIT-compatible. |
| `docs/` (EDDs)         | CC BY-SA 4.0 | Design docs, not code — copyleft-for-content counterpart to the GPL code above. |

Each package carries its own `LICENSE` file in its directory — check there
for the exact terms that apply to that package's code. Docs in `docs/`
carry their own license header instead (CC BY-SA 4.0), noted at the top of
each file.

See [`NOTICE.md`](NOTICE.md) for third-party trademark attribution.
