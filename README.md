# Amazon Clone (Scaler Assignment)

A small e-commerce demo application with a Node.js + Express backend and a Vite + React frontend. The backend serves a PostgreSQL database and product APIs; the frontend is a Vite React app that consumes the API and integrates with Stripe for payments.

## Tech stack
- Backend: Node.js (ESM), Express, pg (node-postgres), dotenv, cors
- Frontend: React, Vite, Axios
- Database: PostgreSQL (works with Neon / hosted Postgres)
- Optional services: Stripe (payments)
- Tools: nodemon (dev), Vite (frontend dev & build)

## Prerequisites
- Node.js >= 18 and npm (or pnpm/yarn)
- PostgreSQL or Neon connection string
- (Optional) Stripe account and keys for payment flows

## Quick setup

1. Clone repo and open workspace
2. Install dependencies

Backend:
```bash
cd backend
npm install
```

Frontend:
```bash
cd amazon-clone-frontend
npm install
```

3. Copy environment templates and edit values
```bash
# Backend
cd backend
cp .env.example .env
# Frontend
cd ../amazon-clone-frontend
cp .env.example .env
```

## Environment variables

Backend (set in `backend/.env` on Render/host):
- `DATABASE_URL` — PostgreSQL connection string (Neon recommended)
- `PORT` — optional, default used by app (e.g., 3001)
- `CORS_ORIGINS` or `CORS_ORIGIN` — comma-separated allowed frontend origins (e.g., https://your-frontend.vercel.app)
- `STRIPE_SECRET_KEY` — (optional) Stripe secret key
- `STRIPE_WEBHOOK_SECRET` — (optional) Stripe webhook secret
- `NODE_ENV` — `development` or `production`

Frontend (set in Vercel or `.env` for local dev):
- `VITE_API_URL` — required; full base API URL (e.g., `https://api.example.com/api`)
- `VITE_STRIPE_PUBLIC_KEY` — (optional) Stripe publishable key for client

Notes:
- Frontend intentionally fails fast if `VITE_API_URL` is missing to avoid using localhost in production.
- Backend will accept CORS origins from `CORS_ORIGINS` or fall back to dev localhost patterns.

## Database & seeding

- To create or seed the local DB (if using a local Postgres or a connected Neon DB):
```bash
cd backend
node db/seed.js
```
- If you use a hosted DB (Neon), set `DATABASE_URL` and run the seed script from the same directory.

## Image enrichment (products)

A utility script fetches images from multiple public sources and updates product thumbnails:

Run locally:
```bash
cd backend
# npm script available: images:refresh
npm run images:refresh
# or directly
node db/refresh_product_images.js
```

This script uses multiple providers (Wikimedia, Openverse, Flickr, fallbacks) and ensures unique, non-placeholder thumbnails.

## Run (development)

Backend:
```bash
cd backend
npm run dev   # starts nodemon/dev server; use PORT env to override
```

Frontend:
```bash
cd amazon-clone-frontend
npm run dev   # starts Vite dev server
```

Open the frontend dev server address printed by Vite. Ensure backend `PORT` is reachable and `VITE_API_URL` points to the backend API when testing cross-origin requests.

## Build & deploy

Frontend (Vercel recommended):
- Set `VITE_API_URL` in project environment variables on Vercel.
- Build using `npm run build` (Vercel will do this automatically).
- Deploy the `dist` created by Vite (default Vercel behavior).

Backend (Render / any node host):
- Set `DATABASE_URL`, `CORS_ORIGINS`, and other secrets in Render.
- Use `npm start` (or configure the start command) and ensure `PORT` is read from env.
- Ensure `ssl` handling for Neon is configured; the backend strips unsupported `sslmode` query params and uses `ssl.rejectUnauthorized=false` to accept Neon TLS.

Database (Neon):
- Provide the full `DATABASE_URL` from Neon to `DATABASE_URL`.
- If using a managed DB behind SSL, no local certs are required; the code uses `ssl.rejectUnauthorized=false` for compatibility.

## Troubleshooting

- EADDRINUSE / port in use: specify `PORT` or kill the process using that port.
- Missing `VITE_API_URL`: frontend will throw to avoid accidentally calling localhost in production — set it in your Vercel environment.
- DB SSL warnings: ensure your Neon `DATABASE_URL` is correctly set; the app removes unsupported `sslmode` query params.

## Assumptions made
- Node 18+ is available locally and in your deploy environment.
- Frontend is deployed to a Vercel-like host and backend to a Render-like host; update `CORS_ORIGINS` accordingly.
- You will set production env vars in the host consoles (Render/Vercel).
- The seed data and image refresh scripts operate against the configured `DATABASE_URL`.
- No CI is required here; you can add pipeline steps to run tests or seed if desired.

## Useful commands summary
```bash
# Backend
cd backend
npm install
cp .env.example .env
npm run dev
npm start
node db/seed.js
npm run images:refresh

# Frontend
cd amazon-clone-frontend
npm install
cp .env.example .env
npm run dev
npm run build
```

## Next steps / suggestions
- Add a `backend/.gitignore` (if missing) to ensure `.env` and `node_modules` remain out of VCS.
- Add a `README` per service (`backend/README.md`, `amazon-clone-frontend/README.md`) if you want service-specific docs.
- Add simple health-check endpoint and a readiness probe for production deployments.
