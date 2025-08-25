# SkillBridge-Pro

Full-stack freelance marketplace (backend + frontend). This README explains how to run the project locally and with Docker.

## Overview
- Backend: Node.js + TypeScript + Express + Prisma (Postgres)
- Frontend: React + TypeScript (Vite)
- DB: PostgreSQL
- Cache: Redis

This repository contains two main folders:
- `backend/` — server code, Prisma schema is under `backend/prisma`.
- `skillbridge-pro-86/` — frontend (Vite) app.

## Prerequisites
- Node.js 18+
- npm
- Docker & docker-compose (optional, recommended for quick setup)

## Local development (recommended)
### Backend
1. Open a terminal and cd into `backend`:

```powershell
cd backend
```

2. Install and generate the Prisma client:

```powershell
npm install
npx prisma generate
npx prisma db push
```

3. Start the backend in dev mode:

```powershell
npm run dev
```

The backend listens on port 3000 by default (see `backend/.env`).

### Frontend
1. Open a terminal and cd into the frontend folder:

```powershell
cd skillbridge-pro-86
npm install
npm run dev
```

The Vite dev server typically runs on port 5173 (the project may map it to 5000 in .env or configuration).

## Docker (quick start)
A `docker-compose.yml` is provided at the repository root. It spins up Postgres, Redis, the backend (mounted) and the frontend (mounted). By default it maps host port 5433 -> container Postgres 5432 so it matches some local `.env` examples.

Run:

```powershell
# from repo root
docker-compose up --build
```

Notes:
- The `backend` service runs `npm install` and `npm run dev` inside the container and expects the code to be mounted from the host. If you want a production image, add a Dockerfile under `backend/` and update the compose file.
- The `frontend` service runs the Vite dev server and is available on the mapped host port (see `docker-compose.yml`).

## Environment configuration
- Backend reads `DATABASE_URL` from environment. The Compose file sets a `DATABASE_URL` pointing to the `db` service.
- If you run services locally, update `backend/.env` and `skillbridge-pro-86/.env` as needed (API base URL, ports, JWT secrets).

## Useful commands
From `backend/`:

```powershell
# generate prisma client
npx prisma generate
# push schema (dev)
npx prisma db push
# run tests
npm test
```

From `skillbridge-pro-86/`:

```powershell
npm run dev
npm run build
```

## Troubleshooting
- If Prisma generate fails on Windows with a file rename EPERM, close editors/terminals that might lock files and retry.
- If port conflicts occur (EADDRINUSE), either stop the conflicting process or change PORT in `.env`.

## Next steps
- Add production Dockerfiles for backend and frontend if you want non-mounted containers.
- Add a seeding script and a `.env.example` copied to `.env` for both apps.

---

If you want, I can:
- Add a Dockerfile for the backend and frontend and convert `docker-compose.yml` to use built images.
- Add a short `CONTRIBUTING.md` and `DEVELOPMENT.md` for onboarding.

