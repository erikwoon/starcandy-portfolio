# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

This is an early-stage personal portfolio site. The root `index.html` is a placeholder. The primary planned project is an **Options Trading Tracker** — a React app backed by Supabase (auth + DB) and Resend (email), deployed on a Cloudflare-managed domain. No build tooling or package manager has been set up yet.

## Design Handoff: Options Trading Tracker

`design_handoff_options_tracker/` contains the design reference for the first major feature:

- `Dashboard.dc.html` — full prototype of all 3 screens (Dashboard, Trades, Journal) and both dialogs. Uses a proprietary component runtime (`{{ }}` template holes, `sc-for`/`sc-if` directives) — **treat as readable spec only, not importable code**.
- `styles.css` — the Nocturne design system: CSS custom properties for tokens (colors, type, spacing, radius, shadows) and component classes (`.btn`, `.card`, `.tag`, `.table`, `.field`, `.seg`, `.dialog`, etc.). Import directly or port variables into the chosen styling solution.
- `image-slot.js` — prototype-only drag/drop widget for the screenshot field. Replace with Supabase Storage upload in production.

The full design spec is in `design_handoff_options_tracker/README.md` — it covers screen layouts, component states, interaction behavior, state shape, and design tokens in detail. Read it before building any part of the React app.

## Architecture Intent (React app to build)

- **Three routes**: `/` (Dashboard), `/trades`, `/journal` — sharing a nav layout.
- **Auth + DB**: Supabase (per-user data scoped by `user_id`).
- **State shape**: `trades[]` and `journalEntries[]` fetched from Supabase; derived values (P&L totals, win rate, strategy mix) computed in React, not stored.
- **Design fidelity**: pixel-close to the prototype. Colors, type, spacing tokens are final — see `styles.css` for all custom properties.
- **Icons**: Phosphor Icons going forward; inline SVGs for the brand mark and button icons.
- No animations beyond simple opacity/scale on dialog open.
