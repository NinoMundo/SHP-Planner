# AGENTS.md

## Project context
SHP Planner is a Node.js web app that helps digital nomads and expats plan their Paraguay residency process through Sweet Home Paraguay.

## Repository structure
- `server.js`: Express server, API endpoints, and plan generation logic.
- `public/`: Frontend UI assets.
- `data/`: Reference data used to build plans.
- `PLAN.md`: Implementation plan for Supabase, rules, PDF, and email.

## Local development
- Install dependencies: `npm install`
- Run the dev server: `npm run dev`
- Health check: `GET /health`

## Conventions
- Keep secrets in `.env` (never commit).
- Prefer JSON for reference data and seed files unless otherwise specified.
- Update `PLAN.md` when scope or integration choices change.

## Notes
- Supabase integration, SES email delivery, and PDF generation are planned but not yet implemented.
