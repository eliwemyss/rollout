# Rollout - Project Context

Group cycling app for organizing rides, built with React + Supabase + Vercel.

## Tech Stack
- **Frontend:** React 18, TypeScript, Vite
- **Backend:** Supabase (PostgreSQL, Auth, RLS)
- **Hosting:** Vercel (auto-deploys from `main`)
- **Payments:** Stripe (tip jar)
- **Fonts:** JetBrains Mono (headings/labels), DM Sans (body)

## Supabase

- **Project ref:** `hkffusvwupnwciivzvox`
- **Migrations live in:** `supabase/migrations/`
- **IMPORTANT:** Always deploy migrations via the Supabase CLI. The user runs `npx supabase db push` from the project root. If the project isn't linked yet, walk them through `npx supabase init` + `npx supabase link --project-ref hkffusvwupnwciivzvox` first. Never use placeholder passwords — just tell the user to run the commands and enter their DB password when prompted. Always provide the exact terminal commands to copy-paste.

## Deploy
- Push to `main` and Vercel auto-deploys
- `npm run build` = `tsc && vite build`

## Key Patterns
- Inline styles using `COLORS` from `src/lib/colors.ts` (dark theme)
- Ride tags defined in `src/lib/rideTags.ts`
- Row-Level Security on all tables; admin checks via `profiles.is_admin`
- Recurring rides use `ride_series` table + `generate_next_series_ride()` PL/pgSQL function
- One-off rides are private (link-shared); series rides are public on homepage

## Admin
- Initial admin: eliwemyss@gmail.com
- Admin page at `/admin` with tabs: Overview, Users, Rides, Feedback
