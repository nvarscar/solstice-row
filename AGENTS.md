# Agent Guidelines — Solstice Row

## Environment

**There is no local Node.js.** All tooling runs inside Docker. Never run `npm`, `npx`, or `node` directly on the host.

## Development

Start the dev stack (hot-reload, port 3000):

```bash
docker compose -f docker-compose.dev.yml up --build
```

Run one-off npm commands (install, add a package, etc.):

```bash
docker compose -f docker-compose.dev.yml run --rm web npm <command>
```

## Verify a Build

Always run a production build to confirm no TypeScript or compilation errors before finishing a task:

```bash
docker run --rm -v "$(pwd)":/app -w /app node:lts-alpine sh -c "apk add --no-cache python3 make g++ && npm install && npm run build"
```

> `better-sqlite3` is a native module — build tools are required even for the type-check build.

> Note: `rm -rf .next` will fail if `.next` was built by Docker (root-owned). Omit it — Next.js will overwrite it.

A passing build prints `✓ Compiled successfully` with no `Type error:` lines.

## Production

```bash
docker compose up --build -d
```

Runs `next start` (compiled build). Rebuild the image after any code change — source is **not** volume-mounted in production.

## Key Conventions

- **`proxy.ts`** (repo root) — Next.js 16 auth proxy (replaces `middleware.ts`). Export the function as `proxy`, not `middleware`.
- **`params` in route handlers** — always `Promise<{ ... }>`, must be `await`ed (Next.js 15+ breaking change).
- **`cookies()`** — always `await cookies()` in server components and route handlers.
- **Tailwind** — v4; config in `tailwind.config.ts` referenced via `@config` in `app/globals.css`. PostCSS plugin is `@tailwindcss/postcss`, not `tailwindcss`.
- **Content files** — `content/*.json` are runtime data for event, schedule, and sponsors. Edit via admin panel at `/admin` or directly in the files.
- **Teams persistence** — team registrations are stored in **SQLite** (`teams.db`) in the `solstice_data` Docker volume at `/data/teams.db`. The DB is created and seeded from `content/teams.json` automatically on first access via `lib/db.ts` (`getDb()`). Rebuilding the image never destroys registration data. All team reads/writes go through `lib/db.ts` — never use `lib/teams-file.ts` for teams. Per-team updates use `PATCH /api/content/teams/:id`; deletions use `DELETE /api/content/teams/:id`.
- **`better-sqlite3`** — native addon; the Dockerfile adds `python3 make g++` in all `npm ci` stages. `serverExternalPackages: ["better-sqlite3"]` in `next.config.mjs` prevents webpack from bundling it.
- **Colours** — never hardcode hex values; use theme tokens from `tailwind.config.ts` (e.g. `forest-900`, `solstice-gold`).
- **`next dev` hostname** — the dev script already passes `-H 0.0.0.0`; do not remove this or the server won't be reachable from the host.
