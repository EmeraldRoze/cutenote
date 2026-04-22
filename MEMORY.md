# Cute Note — Working Memory
Last updated: 2026-04-16
Current phase: Phase 5 — Social (next)
Current task: Phase 4 complete. Phase 5 is next.

## Stack
Frontend:      React + Vite + Tailwind CSS (web app, mobile-friendly)
Backend:       Node.js + TypeScript + Express
Database:      PostgreSQL on DigitalOcean Managed DB (migrated, live)
Hosting:       DigitalOcean App Platform (auto-deploys from GitHub main)
Domain:        cutenote.club (Cloudflare DNS + SSL)
Auth:          Custom JWT (30-day tokens, localStorage as 'cn_token')
Print service: Lob (wired into POST /notes, Phase 4 adds admin dashboard)
Payment:       Stripe — $7.95/month for 2 notes, $2/extra (Phase 3 complete)
AI assist:     Claude API (Anthropic) — key not yet in DO env vars
Email:         SendGrid (Phase 7)

## Project Directory
~/Documents/CUTENOTEDEV

## GitHub
https://github.com/EmeraldRoze/cutenote
Branch: main (auto-deploys to DO on push)

## Live App
https://cutenote.club
https://cutenote-74rm3.ondigitalocean.app (DO default URL)
DO App ID: d424b3b9-46a9-42df-af3c-993f4b2fb532

## How to run things locally
Start everything:    npm run dev              (from project root)
API only:            npm run dev -w apps/api  (port 4000)
Web only:            npm run dev -w apps/web  (port 3000)
DB migrations:       npm run db:migrate -w apps/api
DB visual browser:   npm run db:studio -w apps/api
Typecheck API:       cd apps/api && npx tsc --noEmit
Typecheck web:       cd apps/web && npx tsc --noEmit

## What has been done (append-only)
2026-04-09 — Phase 0: discovery, stack decisions, prd.json with 8 phases
2026-04-09 — Phase 1: monorepo, Prisma schema, Express auth API, React frontend (sign up / login / home)
2026-04-10 — Phase 2: 6-step send flow (StepRecipient, StepOccasion, StepCard, StepWrite, StepFont, StepReview)
2026-04-10 — Phase 2: POST /notes and POST /ai/madlibs API routes added
2026-04-10 — Phase 2: "Send a Cute Note" button wired up on HomePage
2026-04-10 — GitHub repo created (github.com/EmeraldRoze/cutenote)
2026-04-10 — Deployed to DigitalOcean App Platform (~$5/month)
2026-04-10 — Cloudflare DNS configured — cutenote.club is live
2026-04-10 — Stripe checkout, webhook, portal routes added
2026-04-10 — Lob postcard integration wired into POST /notes
2026-04-10 — Address entry API and page built
2026-04-10 — Design system applied, connections route and seed data added
2026-04-16 — Phase 3: subscription gate, allowance deduction, $2 overage, Pass It Forward API, notes counter on home
2026-04-16 — Phase 4: Lob address verification, admin dashboard, admin note status updates, sender notification on ship

2026-04-20 — Rebranded CuteNote → QuteNote across all code and config files
2026-04-20 — New landing page (warm editorial design) added at / for visitors
2026-04-20 — Pricing updated: $7.95/month, $3.00 per extra card
2026-04-20 — Removed Ralph loop (scripts/ralph/) — working directly with project owner from now on
2026-04-20 — Fixed multiple deploy failures: missing Phase 5 files, unused TypeScript variables
2026-04-22 — PDF download feature on admin dashboard — generates printable 6x4 postcard (front: card design, back: note text + address)

## What I am working on right now
Landing page and rebrand complete. Phase 5 (Social — Profiles, connections, activity feed) is next.

## Next 3 things to do
1. Phase 5: Build user profile page showing notes sent/received, CN Score, badges
2. Phase 5: User can search for and follow other users
3. Phase 5: Activity feed showing recent notes from followed users

## Things I learned the hard way
- DO App Platform must build from the REPO ROOT (not apps/api source_dir). Packages are hoisted to /workspace/node_modules — if you build from apps/api only, dotenv and other deps can't be found at runtime.
- Prisma generate MUST run before tsc or the client won't initialize at runtime.
- TypeScript strict mode requires `import type { Foo }` for type-only imports.
- DO prunes devDependencies at runtime. Always compile to JS (tsc → dist/) and run `node dist/index.js`, never tsx in production.
- tsx watch is for local dev only. Never used in production.
- Kill existing processes before starting locally: `lsof -ti:4000 | xargs kill -9`
- Auth endpoints (register/login/me) each have their own `select` — update all three when adding user fields
- Stripe Invoice type doesn't expose .charge — cast via `any` with fallback

## Files changed in most recent session (2026-04-20)
- apps/web/src/pages/LandingPage.tsx (new — full landing page)
- apps/web/src/pages/HomePage.tsx (extra card price $2→$3)
- apps/web/src/App.tsx (added LandingPage import + route)
- apps/api/src/index.ts (CuteNote → QuteNote)
- apps/api/package.json (@cutenote → @qutenote)
- package.json (cutenote → qutenote)
- prd.json (CuteNote → QuteNote)
- prd.json (phase-4 passes: true)
