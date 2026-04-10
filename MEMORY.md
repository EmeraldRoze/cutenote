# Cute Note — Working Memory
Last updated: 2026-04-09
Current phase: Phase 0 — Discovery & Setup
Current task: Phase Discovery Interview with project owner

## Stack
Frontend:      React (web app, mobile-friendly — App Store eventually)
Backend:       Node.js + TypeScript (Express.js)
Database:      PostgreSQL on DigitalOcean Managed DB
File storage:  DigitalOcean Spaces (S3-compatible, for card images/photos)
Hosting:       DigitalOcean App Platform
Domain:        Cloudflare (DNS + domain)
Auth:          Custom JWT auth (built in-house, stored in DO Postgres)
Print service: Lob (address verification + postcard printing/mailing)
Payment:       Stripe ($7.95/month for 2 notes, $2/note overage)
AI assist:     Claude API (Anthropic)
Email:         SendGrid

## Project Directory
~/Documents/CUTENOTEDEV

## How to run things
Start everything:    npm run dev          (from project root)
API only:            npm run dev -w apps/api   (port 4000)
Web only:            npm run dev -w apps/web   (port 3000)
DB migrations:       npm run db:migrate -w apps/api
DB visual browser:   npm run db:studio -w apps/api
Typecheck API:       cd apps/api && npx tsc --noEmit
Typecheck web:       cd apps/web && npx tsc --noEmit

## What has been done (append-only)
2026-04-09 — Read CLAUDE_CODE_FRAMEWORK.md and pitch deck
2026-04-09 — Created CLAUDE.md, MEMORY.md, prd.json in CUTENOTEDEV
2026-04-09 — Saved project memory files to Claude Code memory system
2026-04-09 — Started Phase 0 discovery interview
2026-04-09 — Completed Phase 0: discovery, stack decisions, prd.json populated with 8 phases
2026-04-09 — Completed Phase 1: monorepo setup, Prisma schema, Express API auth, React frontend with sign up/login/home pages, JWT auth, route protection, Tailwind — typechecks clean

## What I am working on right now
Phase 1 complete. Ready for Phase 2: the 6-step note creation wizard. — asking project owner questions one at a time
to define the exact product, phases, and acceptance criteria before writing
any code.

## Next 3 things to do
1. Add DATABASE_URL and JWT_SECRET to .env, then run db:migrate to create tables
2. Build Phase 2: the 6-step note creation wizard
3. Build Phase 3: Stripe subscription and payments

## Things I learned the hard way
(Nothing yet — populated as we go)

## Files I changed this session
- CLAUDE.md (created)
- MEMORY.md (created)
- prd.json (created)
