# Solstice Row — VCRC

Website for the **Elk Lake Summer Solstice Row** hosted by Victoria City Rowing Club. Built with Next.js 16, TailwindCSS, and a custom password-protected admin panel for live event-day updates.

## Stack

- **Next.js 16** (App Router) + TypeScript + TailwindCSS
- **Forest green + gold** colour scheme (`tailwind.config.ts`)
- **Custom admin panel** at `/admin` — password auth, no third-party CMS
- **Docker** — single-command start, persistent storage volume, no local Node.js required

---

## Running the Site

### Prerequisites

- Docker Desktop (or Docker Engine + Compose plugin)

### Development (local)

```bash
docker compose -f docker-compose.dev.yml up --build
```

Hot-reload is enabled. The site is available at `http://localhost:3000`.

### Production

```bash
docker compose up --build -d
```

Runs a compiled `next start` build behind nginx. Rebuild the image after any code change.

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
| `http://localhost:3000` | Public website (direct, dev only) |
| `http://localhost:3000/admin` | Admin panel (direct, dev only) |

### Stop

```bash
docker compose down
```

> **Data safety:** `docker compose down` stops the container but keeps the `solstice_data` volume (credentials + team registrations). Use `docker compose down -v` **only if you want to wipe all data** — this destroys all registrations and regenerates the admin password.

---

## Content Management

Event details, schedule, and sponsor data are stored as JSON files in `content/`. Team registrations are stored separately in the persistent `solstice_data` Docker volume at `/data/teams.json` (see [Data Persistence](#data-persistence) below). The admin panel provides a browser UI to edit all of these.

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
| `content/teams.json` | Seed data only — copied into `/data/teams.json` on first run; live data lives in the Docker volume |
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
│   │   ├── content/[type]/     # GET + PUT for content JSON files
│   │   └── registrations/      # POST — public team registration endpoint
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
│   ├── auth.ts                 # Password hashing, token creation, credential I/O
│   └── teams-file.ts           # Resolves teams.json path (volume in prod, content/ fallback)
├── proxy.ts                    # Auth guard for /admin/* and /api/content/* (Next.js 16 proxy convention)
├── nginx/
│   ├── docker-entrypoint.sh    # Detects certs, selects http-only or https config
│   ├── http-only.conf          # nginx config — HTTP proxy to web:3000
│   └── https.conf              # nginx config — TLS termination + HTTP→HTTPS redirect
├── scripts/
│   ├── init.sh                 # First-run: seeds /data/teams.json + generates admin password
│   ├── issue-solsticerow.sh    # Let's Encrypt cert issuance (run from ~/certbot)
│   └── renew-solsticerow.sh    # Let's Encrypt cert renewal  (run from ~/certbot)
├── tailwind.config.ts          # Colour theme (forest green + gold)
├── docker-compose.yml          # Production
├── docker-compose.dev.yml      # Development (hot-reload)
└── Dockerfile                  # Multi-stage: dev / deps / builder / runner
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

### Linux / ARM Server Deployment

The project uses multi-arch Docker images (`node:lts-alpine`, `nginx:alpine`) that support both AMD64 and ARM64 (including Raspberry Pi 4/5, AWS Graviton, etc.) out of the box. No special configuration needed for ARM servers.

#### First-Time Setup on Linux

1. **SSH into your server** (or work directly on it):
   ```bash
   ssh user@your-server-ip
   ```

2. **Install Docker & Docker Compose** (if not already installed):
   ```bash
   # Update system (Debian/Ubuntu/Raspberry Pi OS)
   sudo apt update && sudo apt upgrade -y
   
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   
   # Add your user to docker group (log out and back in after this)
   sudo usermod -aG docker $USER
   
   # Docker Compose is included with Docker Desktop/Engine 24.0+
   docker compose version  # verify installation
   ```

3. **Clone the repository** (or copy files via SCP/rsync):
   ```bash
   git clone <your-repo-url> ~/solstice-row
   cd ~/solstice-row
   ```

4. **Configure environment variables** (optional but recommended):

   Create a `.env` file in the project root:
   ```bash
   # For CAPTCHA protection (get free keys at https://cloudflare.com/turnstile)
   NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAA...
   TURNSTILE_SECRET_KEY=0x4AAAA...
   
   # For custom domain TLS certificates (if using Let's Encrypt)
   LETSENCRYPT_DIR=/home/user/certbot/conf
   ```
   
   Docker Compose automatically reads `.env` on startup. No `export` needed.

5. **Build and start the services**:
   ```bash
   docker compose up --build -d
   ```

6. **Get the admin password** from logs:
   ```bash
   docker compose logs web | grep -A 5 "ADMIN CREDENTIALS"
   ```

7. **Access the site**:
   - LAN access: `http://your-server-ip:3000` (direct) or `http://your-server-ip` (via nginx)
   - From the server itself: `http://localhost:3000`

#### Updating the Site (New Code Deploy)

When you have new code to deploy:

```bash
cd ~/solstice-row

# Pull latest changes (if using git)
git pull

# Or copy new files via SCP from your dev machine:
# scp -r ./ user@your-server-ip:~/solstice-row/

# Rebuild and restart
docker compose up --build -d

# View logs to confirm admin password (only changes if you wiped the volume)
docker compose logs web | tail -20
```

> **Data persists**: Team registrations and admin password survive rebuilds because they live in the `solstice_data` Docker volume, not in the image.

#### Troubleshooting

| Issue | Solution |
|-------|----------|
| Slow builds (ARM/RPi) | First build takes 5-10 min on Raspberry Pi 4 (compiling Node modules). Subsequent builds use Docker layer cache. AMD64 servers are faster. |
| Build fails with memory error (RPi) | Add swap: `sudo dphys-swapfile swapoff && sudo nano /etc/dphys-swapfile` → set `CONF_SWAPSIZE=2048` → `sudo dphys-swapfile setup && sudo dphys-swapfile swapon` |
| Port 80/443 already in use | Stop other web servers: `sudo systemctl stop apache2` or `sudo systemctl stop nginx` |
| DNS not working in container | Add to `/etc/docker/daemon.json`: `"dns": ["8.8.8.8", "1.1.1.1"]` then `sudo systemctl restart docker` |

#### Auto-Start on Boot

Docker Compose services already have `restart: unless-stopped`, but to ensure Docker starts on boot:

```bash
sudo systemctl enable docker
```

### TLS

The nginx service auto-detects Let's Encrypt certificates at startup:

- **Certs present** → nginx serves HTTPS on 443 and redirects port 80 → 443.
- **Certs absent** → nginx serves plain HTTP on port 80.

Certificates are expected at:

```
/etc/letsencrypt/live/solsticerow.foo.bar/fullchain.pem
/etc/letsencrypt/live/solsticerow.foo.bar/privkey.pem
```

If your certbot stores certs elsewhere, set `LETSENCRYPT_DIR` before bringing the stack up:

```bash
export LETSENCRYPT_DIR=/home/user/certbot/conf
docker compose up -d
```

#### Initial cert issuance

Run from the `~/certbot` directory on the server (requires a certbot Docker Compose service already configured there):

```bash
bash /path/to/repo/scripts/issue-solsticerow.sh
```

This performs a manual DNS challenge for `solsticerow.foo.bar`. After completing the DNS TXT record prompt, the certificate is saved and nginx will pick it up on the next `docker compose up` (or `docker compose restart nginx`).

#### Renewal

```bash
bash /path/to/repo/scripts/renew-solsticerow.sh
docker compose restart nginx
```

### Netlify Static Export

For a read-only public version (no admin editing):

```bash
BUILD_STATIC=true npm run build
```

Deploy the `out/` directory to Netlify. Set `BUILD_STATIC=true` in the Netlify build environment. The admin panel is **not available** in static mode.

---

## Data Persistence

All mutable runtime data lives in the `solstice_data` named Docker volume, mounted at `/data` inside the container. The source code image is stateless — rebuilding it never destroys live data.

| Path in volume | Contents |
|---|---|
| `/data/teams.json` | All team registrations (live data) |
| `/data/auth/credentials.json` | Admin username + hashed password |

**On first container start**, `init.sh` copies `content/teams.json` from the image into the volume as seed data (only if `/data/teams.json` doesn't already exist).

### Backup

```bash
docker compose exec web cat /data/teams.json > teams-backup-$(date +%Y%m%d).json
```

### Restore

```bash
docker cp teams-backup-20260721.json $(docker compose ps -q web):/data/teams.json
```

---

## CAPTCHA (Bot Protection)

The registration page includes **Cloudflare Turnstile** CAPTCHA to prevent bot submissions.

### Development

The site uses test keys that always pass verification (no Cloudflare account needed):
- Site key: `1x00000000000000000000AA` (visible CAPTCHA)
- Secret key: `1x0000000000000000000000000000000AA`

### Production Setup

1. Create a free account at [cloudflare.com/turnstile](https://www.cloudflare.com/turnstile/)
2. Add your domain (e.g., `solsticerow.foo.bar`)
3. Copy the **Site Key** and **Secret Key** from the Turnstile dashboard
4. Set environment variables in `docker-compose.yml`:

```yaml
services:
  web:
    environment:
      - NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-actual-site-key
      - TURNSTILE_SECRET_KEY=your-actual-secret-key
```

Or pass them at runtime:

```bash
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAA... TURNSTILE_SECRET_KEY=0x4AAAA... docker compose up -d
```

> **Note:** `NEXT_PUBLIC_` prefix is required for the site key to be available in the browser. The secret key stays server-side only.

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
