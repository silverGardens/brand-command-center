# Brand Command Center

A React + Vite admin dashboard for managing multiple niche content websites. Frontend-only SPA — all data operations go through n8n webhook URLs.

## Project Overview

- **Stack**: React 18, Vite, Tailwind CSS v3, React Router v6
- **Data layer**: n8n webhooks (no backend)
- **Auth**: Optional password gate via `VITE_ADMIN_KEY`
- **Deploy target**: Netlify

## Setup

```bash
git clone <your-repo>
cd brand-command-center
cp .env.example .env
# Fill in your webhook URLs in .env
npm install
npm run dev
```

## First Run

Before the dashboard will show sites, manually add at least one row to your n8n sites data table, or have your `GET_SITES` webhook return seeded data.

## Webhook Contract

All webhooks receive an `x-admin-key` header matching `VITE_ADMIN_KEY`.

- **GET_SITES**: Returns `{ sites: [...] }`
- **CREATE_SITE**: POST `{ name, slug, niche, tagline, primaryColor, secondaryColor }` → `{ site: { id, ... } }`
- **GET_SITE_DETAIL**: POST `{ site_id }` → `{ site, brand_config, posts, subscriber_count, page_count }`
- **UPDATE_BRAND**: POST `{ site_id, ...brandFields }` → `{ brand_config }`
- **SAVE_POST**: POST `{ site_id, post: { id?, title, slug, content, ... } }` → `{ post: { id, ... } }`
- **GET_SUBSCRIBERS**: POST `{ site_id }` → `{ subscribers: [...] }`
- **TRIGGER_DEPLOY**: POST `{ site_id }` → `{ triggered: true }`

## Deploying to Netlify

1. Push to GitHub.
2. Netlify: Add site → Import from Git → select repo.
3. Build: `npm run build`, publish: `dist`.
4. Add all `VITE_*` env vars in Netlify site settings.
5. Redeploy. The `netlify.toml` handles SPA routing.
