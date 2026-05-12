# AiDevOpps

AiDevOpps — Vercel-only Node.js version of Concierge.

This project is a fresh Next.js 15 App Router rewrite of the Concierge dashboard experience. It is intentionally separated from the existing Python/Docker `concierge` application and does not modify any of the original files.

## Features

- Clean dashboard with a `Welcome back` hero section
- Four quick-action cards: Achieve Your Goals, Automate Your Work, Plan Your Strategy, Manage Your Workspace
- Right-side AI chat panel that opens when a prompt is clicked
- Simple server-side API routes in Next.js under `/api/concierge/*`
- IndexedDB conversation history on the frontend + lightweight server cache
- Prepared for deployment on Vercel

## Run locally

```bash
cd "e:/2024 RESET/AiDevOpps"
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Deploy

```bash
vercel deploy
```

## How it differs from the original Concierge

- `AiDevOpps` is a pure Node.js / Next.js project built for Vercel
- No Docker, no Celery, no Python backend
- Uses Next.js Route Handlers for the API rather than FastAPI
- Stores frontend history in IndexedDB and uses a lightweight server cache
- Designed to coexist alongside the existing `concierge` project without modifying it
