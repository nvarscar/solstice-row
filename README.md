# Solstice Row

A modern static website for the Solstice Row rowing event, built with Next.js, TailwindCSS, and Decap CMS for easy content management.

## Features

- **Modern Stack**: Next.js 14 + React 18 + TypeScript + TailwindCSS
- **Easy Content Editing**: Decap CMS admin panel at `/admin`
- **Static Export**: Fully static site, deployable anywhere
- **Responsive Design**: Mobile-first, beautiful UI
- **Docker Development**: No local Node.js installation required

## Quick Start with Docker

### Prerequisites
- Docker
- Docker Compose

### Development

1. **Start the development server:**
   ```bash
   docker-compose up
   ```

2. **Access the site:**
   - Website: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin

3. **Stop the server:**
   ```bash
   docker-compose down
   ```

### Build for Production

```bash
docker-compose run --rm web npm run build
```

The static site will be exported to the `out/` directory.

## Local Development (without Docker)

If you prefer to run locally:

```bash
npm install
npm run dev
```

## Content Management

### Using Decap CMS

1. Navigate to `/admin` in your browser
2. Configure Git Gateway or use local backend
3. Edit content through the visual interface:
   - Event details (date, location, registration)
   - Schedule items
   - Race results
   - Sponsors
   - Contact information

### Manual Content Editing

Content files are stored in the `content/` directory as JSON:
- `content/event.json` - Event information
- `content/schedule.json` - Day-of schedule
- `content/results.json` - Race results by year
- `content/sponsors.json` - Sponsor tiers and logos

## Project Structure

```
.
├── app/                  # Next.js app directory
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── components/          # React components
│   ├── Nav.tsx
│   ├── Hero.tsx
│   ├── About.tsx
│   ├── Schedule.tsx
│   ├── Results.tsx
│   ├── Sponsors.tsx
│   ├── Contact.tsx
│   └── Footer.tsx
├── content/             # Content data (JSON)
├── public/              # Static assets
│   └── admin/          # Decap CMS config
├── docker-compose.yml   # Docker setup
└── Dockerfile
```

## Deployment

This site exports as static HTML and can be deployed to:
- Netlify (recommended for Decap CMS Git Gateway)
- Vercel
- GitHub Pages
- Any static hosting service

### Netlify Deployment

1. Connect your Git repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `out`
4. Enable Netlify Identity for CMS authentication

## Customization

### Colors & Branding

Edit `tailwind.config.ts` to customize the color palette:
- Navy tones for backgrounds
- Solstice gold for accents
- Water blues for highlights

### Content Structure

Modify the Decap CMS configuration at `public/admin/config.yml` to add/remove fields.

## License

© 2025 Solstice Row. All rights reserved.
