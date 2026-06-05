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
docker run --rm -v "$(pwd)":/app -w /app node:lts-alpine sh -c "rm -rf .next && npm install && npm run build"
```

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
- **Content files** — `content/*.json` are runtime data. Edit via admin panel at `/admin` or directly in the files.
- **Colours** — never hardcode hex values; use theme tokens from `tailwind.config.ts` (e.g. `forest-900`, `solstice-gold`).
- **`next dev` hostname** — the dev script already passes `-H 0.0.0.0`; do not remove this or the server won't be reachable from the host.
