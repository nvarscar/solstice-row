# Solstice Row — VCRC

Website for the **Elk Lake Summer Solstice Row** hosted by Victoria City Rowing Club. Built with Next.js 14, TailwindCSS, and a custom password-protected admin panel for live event-day updates.

## Stack

- **Next.js 14** (App Router) + TypeScript + TailwindCSS
- **Forest green + gold** colour scheme (`tailwind.config.ts`)
- **Custom admin panel** at `/admin` — password auth, no third-party CMS
- **Docker** — single-command start, persistent storage volume, no local Node.js required

---

## Running the Site

### Prerequisites

- Docker Desktop (or Docker Engine + Compose plugin)

### Start

```bash
docker compose up -d
```

On **first start** the container generates a random admin password and prints it to the logs:

```bash
docker compose logs web
```

Look for the box:

```
╔══════════════════════════════════════════════╗
║      SOLSTICE ROW — ADMIN CREDENTIALS        ║
╠══════════════════════════════════════════════╣
║  Username : admin                            ║
║  Password : <generated-password>             ║
╚══════════════════════════════════════════════╝
```

The password is stored in the `solstice_data` Docker volume and **survives restarts**. You only see it once — save it somewhere safe, or change it via the admin panel.

### Access

| URL | Description |
|-----|-------------|
| `http://localhost:3000` | Public website |
| `http://localhost:3000/admin` | Admin panel (login required) |

### Stop

```bash
docker compose down
```

> **Data safety:** `docker compose down` stops the container but keeps the `solstice_data` volume (credentials + content edits). Use `docker compose down -v` only if you want to wipe all data and regenerate the password.

---

## Content Management

All site content is stored as JSON files in `content/`. The admin panel provides a browser UI to edit them; you can also edit the files directly.

### Via the Admin Panel

1. Go to `http://localhost:3000/admin`
2. Log in with username `admin` and the password from the logs
3. Use the **Team Leaderboard** tab to add/edit teams and update kilometre totals live during the event
4. Use the **Change Password** tab to set a memorable password after first login

### Content Files

| File | What it controls |
|------|-----------------|
| `content/event.json` | Event name, date, venue, registration URL, donation URL, contact email, cause description, event format |
| `content/schedule.json` | Day-of schedule items (time, title, description, category) |
| `content/teams.json` | Team entries — name, captain, club, members, boat km, erg km, pledge per km |
| `content/sponsors.json` | Sponsor tiers (Gold / Silver / Bronze) with name, URL, and optional logo path |

#### Updating the Team Leaderboard (event day)

Open the admin panel and edit each team's `boatKm` and `ergKm` fields as teams submit their logs. The public leaderboard at `/#results` refreshes automatically (30-second polling).

#### Adding a Sponsor

Edit `content/sponsors.json` directly or via the API:

```json
{
  "tiers": [
    {
      "name": "Gold",
      "sponsors": [
        { "name": "ACME Co.", "url": "https://acme.example.com", "logo": "" }
      ]
    }
  ]
}
```

Place sponsor logo images in `public/sponsors/` and set `"logo": "/sponsors/acme.png"`.

#### Changing the Event Date or Details

Edit `content/event.json`. Key fields:

```json
{
  "date": "July 21, 2026",
  "sunriseTime": "5:17 AM",
  "sunsetTime": "9:23 PM",
  "venue": "Victoria City Rowing Club",
  "location": "Elk Lake, Victoria, BC",
  "registrationUrl": "https://vcrc.bc.ca/solstice-row-register",
  "donationUrl": "https://vcrc.bc.ca/donate",
  "contactEmail": "clubadmin@vcrc.bc.ca"
}
```

---

## Project Structure

```
.
├── app/
│   ├── admin/
│   │   ├── login/page.tsx      # Login page
│   │   ├── dashboard/page.tsx  # Admin dashboard (team editor)
│   │   └── page.tsx            # Redirects → /admin/dashboard
│   ├── api/
│   │   ├── auth/               # login / logout / change-password
│   │   └── content/[type]/     # GET + PUT for content JSON files
│   ├── globals.css             # CSS variables + utility classes (no hardcoded colours)
│   ├── layout.tsx
│   └── page.tsx                # Public home page
├── components/
│   ├── Nav.tsx
│   ├── Hero.tsx
│   ├── About.tsx
│   ├── Schedule.tsx
│   ├── Results.tsx             # Team km leaderboard (live-polling)
│   ├── Sponsors.tsx
│   ├── Contact.tsx
│   └── Footer.tsx
├── content/                    # JSON content files (served + edited at runtime)
│   ├── event.json
│   ├── schedule.json
│   ├── teams.json
│   └── sponsors.json
├── lib/
│   └── auth.ts                 # Password hashing, token creation, credential I/O
├── middleware.ts               # Auth guard for /admin/* and /api/content/*
├── scripts/
│   └── init.sh                 # First-run password generation
├── tailwind.config.ts          # Colour theme (forest green + gold)
├── docker-compose.yml
└── Dockerfile
```

---

## Customisation

### Colours

All colours are defined in `tailwind.config.ts` and mirrored as CSS custom properties in `app/globals.css`. Never hardcode hex values in components — use Tailwind theme tokens:

| Token | Usage |
|-------|-------|
| `forest-{950…100}` | Backgrounds, text, borders |
| `solstice-gold` / `solstice-gold-light` | Accents, CTAs |
| `water-light` / `water-mid` | Dividers, row category badges |
| `solstice-orange` / `solstice-amber` | Milestone / social category badges |

To change a colour, update the value in `tailwind.config.ts` **and** the matching `--variable` in `app/globals.css` `:root`.

### Schedule Categories

The schedule supports these category tokens:

| Token | Colour | Used for |
|-------|--------|----------|
| `row` | water-light (green) | Rowing sessions |
| `milestone` | solstice-orange | Sunrise / sunset / key moments |
| `logistics` | forest-400 | Check-in, safety briefings |
| `social` | solstice-amber | Raffle, BBQ, celebrations |

---

## Deployment

### Docker (Raspberry Pi / LAN server) — default

```bash
docker compose up -d
```

The site runs as a Next.js dev server on port 3000. Content edits and credentials persist in the `solstice_data` volume.

### Netlify Static Export

For a read-only public version (no admin editing):

```bash
BUILD_STATIC=true npm run build
```

Deploy the `out/` directory to Netlify. Set `BUILD_STATIC=true` in the Netlify build environment. The admin panel is **not available** in static mode.

---

## Admin Password Reset

If you lose the admin password, delete the credentials file and restart:

```bash
docker compose exec web rm /data/auth/credentials.json
docker compose restart web
docker compose logs web   # new password printed here
```

---

© 2026 Victoria City Rowing Club. All rights reserved.
