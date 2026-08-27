# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo Layout

This repo holds two independent Vite apps, each with its own `package.json`/`node_modules` — always `cd` into the relevant one before running commands:

- **`landing/`** — the portfolio landing page (Erik Woon), React 19 + TypeScript + Vite, plain CSS (no Tailwind/component lib). Single-page, no router, no backend.
- **`options_tracker/`** — the Options Trading Tracker app: React 18 + TypeScript + Vite, React Router, TanStack Query, Supabase (auth + Postgres + storage).

The old root `index.html` placeholder has been removed; `landing/` is now the actual portfolio site.

## Commands

Run from inside `landing/` or `options_tracker/` respectively (not the repo root):

```
npm run dev       # vite dev server
npm run build     # tsc -b && vite build
npm run preview   # preview production build
npm run lint       # landing: eslint .   |   options_tracker: tsc --noEmit
```

There is no test suite in either app.

## options_tracker architecture

- **Routing** (`src/router.tsx`): `/login` is public; `/`, `/trades`, `/journal` are nested under a `RequireAuth` guard wrapping the shared `Layout` (nav + dialogs). Unknown paths redirect to `/`.
- **Auth**: `src/hooks/useAuth.ts` wraps Supabase magic-link/OTP auth (`signInWithMagicLink`, `verifyEmailOtp`, `signOut`) and exposes `session`/`user`/`loading` via `onAuthStateChange`. `src/supabase.ts` creates the client from `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` (see `docs/.env.example`); the client warns to console rather than throwing if unset.
- **Data layer**: TanStack Query hooks per domain — `useTrades`, `useJournal`, `useUserSettings` — each wrapping direct `supabase.from(...)` calls, scoped to the current user via RLS (not client-side filtering). Mutations invalidate their query key on success.
- **CSV import** (`src/lib/csvImport.ts` + `useImportTrades` in `useTrades.ts`): broker CSV fills are parsed into `ParsedBrokerFill` rows, upserted into a `trade_fills` ledger table (unique per `user_id, source_key`, so re-imports are idempotent), then `reconcileFills` collapses same-contract fills (matched by ticker/type/strike/expiry) into a single `Trade` — computing net qty, weighted premium, status (Open/Closed), and P&L. Existing imported trades (tagged `notes ILIKE 'Imported from CSV%'`) are updated in place rather than duplicated.
- **Schema** (`supabase/migrations/`, sequential, no down-migrations): `trades`, `journal_entries`, `trade_fills`, `user_settings` — all RLS-scoped to `user_id = auth.uid()` with per-op policies (select/insert/update/delete). A public-read/authenticated-write `trade-screenshots` storage bucket backs the trade screenshot field.
- **Types** (`src/types.ts`): canonical `Trade`/`JournalEntry`/`UserSettings` shapes mirror the DB rows directly (snake_case columns kept as-is in TS); `NewTrade`/`NewJournalEntry`/`UserSettingsPatch` are the insert/patch variants. `STRATEGIES` is the fixed strategy enum used in the trade form `<select>`.
- **Design system**: `styles.css` (root) and `src/styles/nocturne.css` hold the "Nocturne" design tokens (CSS custom properties for color/type/spacing/radius/shadow) and component classes (`.btn`, `.card`, `.tag`, `.table`, `.field`, `.seg`, `.dialog`). Match these tokens exactly for pixel fidelity — see `options_tracker/docs/README.md` for the full per-screen spec (Dashboard/Trades/Journal layouts, dialog contents, state shape, interaction rules) if extending any screen.
- **Icons**: Phosphor Icons for UI icons; inline SVG for the brand mark and button icons — no other icon library.
- Full design/handoff narrative (screen-by-screen breakdown, dialog fields, derived-vs-stored state) lives in `options_tracker/docs/README.md` and `options_tracker/docs/2026-08-26-options-tracker-design.md` — read before touching Dashboard/Trades/Journal layout or the trade/journal dialogs.
