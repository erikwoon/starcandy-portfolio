# Handoff: Options Trading Tracker

## Overview
A personal options-trading journal: a dashboard summarizing P&L/win-rate, a full trades list with search/filter, and a journal for per-position notes. Backend target (per user): Supabase (DB + auth) and Resend (email), deployed behind a Cloudflare-managed domain. Frontend to be rebuilt in React.

## About the Design Files
The files in this bundle (`Dashboard.dc.html`, `styles.css`, `image-slot.js`) are **design references** — a single-file HTML/JS prototype built to show layout, states, and interactions. They are not production code to import as-is. The task is to **recreate this design as a React app** using standard React patterns (hooks, component files, a router) and wire it to Supabase for real data/auth, choosing whatever supporting libraries (charting, forms, routing) fit the target repo's conventions. `Dashboard.dc.html` runs in a proprietary component runtime (custom `{{ }}` template holes, `sc-for`/`sc-if`) — treat it as a readable reference for structure/behavior only, not a library to install.

## Fidelity
**High-fidelity.** Colors, type, spacing, and component states below are final — recreate pixel-close using the design tokens in `styles.css` (a plain CSS custom-property sheet, framework-agnostic — import it directly or port the variables into your styling solution of choice, e.g. Tailwind config, CSS modules, styled-components theme).

## Screens / Views
All three screens/tabs live in one page today (`Dashboard.dc.html`), switched by local state (`view: 'dashboard' | 'trades' | 'journal'`). In React this should likely be three routes (e.g. `/`, `/trades`, `/journal`) sharing a layout (nav + dialogs).

### Shared layout
- **Nav bar** (`.nav`): fixed height row, `padding: var(--space-3) var(--space-4)` plus extra `padding-inline: var(--space-8)` on this page, bottom border `1px solid var(--color-divider)`.
  - Brand mark: 24×24 inline SVG icon (simple check/candle glyph, stroke `var(--color-accent)`, stroke-width 1.5) + wordmark "Options Tracker" in `--font-heading` at default weight.
  - 3 nav links: Dashboard / Trades / Journal — plain text links, `color: inherit`, turn `var(--color-accent)` when active (active = current view/route).
  - Right side: primary button "+ Log trade" (icon + label, `white-space: nowrap`), then a 36×36 circular avatar (initials "EW", background `var(--color-accent-800)`, text `var(--color-accent-100)`).

### 1. Dashboard
**Purpose:** at-a-glance health of the trading book.
**Layout:** `max-width: 1240px`, `padding: var(--space-8)`.
- Header block: kicker "Welcome back" (`--color-accent-700`), `<h1>Your trading journey</h1>`, muted subtitle paragraph.
- Stat row: CSS grid, `repeat(auto-fit, minmax(200px, 1fr))`, gap `var(--space-4)`. 4 cards (`.card.elev-sm`): Total P&L (colored by sign), Win rate, Open positions, Premium collected. Each card: kicker label, big number (26px, `--font-heading`), small muted meta line.
- Middle row: grid `repeat(auto-fit, minmax(340px,1fr))`. Left card "P&L by trade": flex-bottom-aligned bar chart, one bar per recent trade (max 8), bar height % of the largest |P&L|, bar color accent (gain) or neutral (loss), ticker label under each bar. Right card "Strategy mix": one row per top-4 strategy — label + count, then a 6px-tall rounded progress track (`--color-neutral-800` background, `--color-accent-500` fill) sized to that strategy's share.
- Bottom row: grid `repeat(auto-fit, minmax(340px,1fr))`. Left: "Recent trades" — a `.table` (see Trades screen columns) limited to the 6 most recent. Right: "Journal notes" — 3 most recent journal entries, each: ticker + date header row, note text below, bottom border divider between entries.

### 2. Trades
**Purpose:** full trade log with search + status filtering.
**Layout:** `max-width: 1240px`, `padding: var(--space-8)`.
- Header row: kicker "All positions", `<h1>Trades</h1>`, right-aligned "+ Log trade" button.
- Filter row: text input (placeholder "Search ticker or strategy", max-width 260px) + a 3-way segmented control (`.seg`) for All / Open / Closed.
- Table card (`.card.elev-sm`) containing a `.table` with columns: **Ticker** (ticker text + `.tag.tag-outline` showing Call/Put), **Strategy**, **Strike / Exp** (muted, formatted `$<strike> · <expiry>`), **Qty**, **Premium** (formatted currency, contracts × 100 multiplier), **Status** (`.tag.tag-accent` for Open, `.tag.tag-neutral` for Closed), **P&L** (bold, colored).
- Empty state: centered muted "No trades match." when the filtered set is empty.

### 3. Journal
**Purpose:** freeform rationale/reflection notes tied to a trade.
**Layout:** `max-width: 840px`, `padding: var(--space-8)`.
- Header row: kicker "Rationale & reflections", `<h1>Journal</h1>`, right-aligned "+ Add note" button.
- List: one `.card.elev-sm` per entry, newest first. Each card: top row with ticker (bold) + `.tag.tag-outline` strategy label on the left, muted date on the right; note text below at 14px.

### Dialogs (shared across screens)
Both use `.dialog-backdrop` (fixed, centered, dark scrim) + `.dialog` (rounded surface, `--shadow-lg`), closed by clicking the backdrop, an explicit Cancel button, or after Save.

**Log a trade** (opened from the nav or the Trades header):
- 2-column form grid (`gap: var(--space-3)`): Ticker (text), Type (2-way segmented Call/Put), Strategy (native `<select>`: Covered Call, Cash-Secured Put, Credit Spread, Debit Spread, Iron Condor, Long Call, Long Put, Straddle), Contracts (number), Strike (text), Expiry (date), Premium per contract (text/number), Status (2-way segmented Open/Closed).
- Full-width Notes/rationale textarea.
- Full-width optional "Chart screenshot" image drop zone (120px tall placeholder in the prototype — a real upload-to-storage control in production, e.g. Supabase Storage).
- Footer: Cancel (secondary button) / Save trade (primary button).

**Add a journal note** (opened from the Journal header):
- Trade select (`<select>` of existing tickers).
- Note textarea.
- Footer: Cancel / Save note.

## Interactions & Behavior
- Nav links and the two dialog triggers just flip local state — no real navigation transition/animation.
- Radios/segmented controls are native `<input type="radio">` under styled labels — no custom JS toggle needed beyond the two-way binding.
- Saving a trade prepends it to the trades array and closes the dialog (no validation beyond requiring a ticker in the prototype — production should validate required fields and numeric ranges).
- Saving a journal note looks up the selected trade's strategy to tag the entry, stamps today's date, prepends to the journal list, and closes the dialog.
- Trades search/filter is client-side substring match on ticker/strategy + exact status match; combine with `AND`.
- No loading/error states are modeled in the prototype — production needs them for all Supabase reads/writes (fetch trades, insert trade, insert journal entry, auth session).
- No animations/transitions are used anywhere in this design — keep motion minimal (simple opacity/scale on dialog open at most) if you add any.

## State Management
Suggested shape (per user, likely one row per trade/journal entry in Supabase, scoped by `user_id`):
- `trades: { id, ticker, type: 'Call'|'Put', strategy, strike, expiry, qty, premium, status: 'Open'|'Closed', pnl, notes, screenshotUrl, createdAt }[]`
- `journalEntries: { id, tradeId (or ticker), note, createdAt }[]`
- `view` / route for the 3 screens.
- Trades-screen local UI state: `search`, `statusFilter`.
- Dialog open/closed state + the two form objects (trade form, journal-note form) — reset on open.
- Derived (compute in React, not stored): total P&L, win rate, open count, total/open premium, chart bar heights, strategy-mix percentages, filtered trades list.

## Design Tokens
All in `styles.css` as CSS custom properties (Nocturne design system) — import the file or port these into your styling system:

**Color**
- `--color-bg: #161826` (page ground) · `--color-text: #e9e9ed` · `--color-surface: #232532` (card/input fill)
- `--color-accent: #9184d9` (single accent — mono-accent scheme; `--color-accent-2-*` is a derived duplicate, treat as the same role)
- `--color-divider: color-mix(in srgb, #e9e9ed 16%, transparent)`
- Neutral ramp 100→900: `#f3f5fe, #e4e7f5, #cfd3e5, #b2b6ca, #9397ab, #75798c, #595d6c, #3f424d, #292b31`
- Accent ramp 100→900: `#f5f4ff, #e7e5fe, #d2cefd, #b5abfc, #968ae0, #796cbf, #5d5294, #423a6a, #2b2741`
- Usage: positive P&L → `--color-accent-300`; negative P&L → `--color-neutral-500` (this system uses tone/weight, not a second hue, to distinguish gain/loss).

**Type**
- `--font-heading` / `--font-body`: both "Inter" (weight 500 for headings, 400 body). Scale: h1 42px, h2 32px, h3 25px, h4 20px, h5 16px, h6 13px (uppercase, letter-spacing 0.08em). Body 15px / line-height 1.55.

**Spacing** (density 0.7×): `--space-1: 2.8px, --space-2: 5.6px, --space-3: 8.4px, --space-4: 11.2px, --space-6: 16.8px, --space-8: 22.4px`

**Radius**: `--radius-sm: 4px, --radius-md: 8px, --radius-lg: 14px`

**Shadow**: `--shadow-sm: 0 0 0 1px #3f424d`; `--shadow-md: 0 0 0 1px #595d6c, 0 6px 18px rgba(0,0,0,.55)`; `--shadow-lg: 0 0 0 1px #9397ab, 0 16px 40px rgba(0,0,0,.65)`

**Components reference** (see `styles.css` for full class definitions): `.btn` / `.btn-primary` (outlined, not filled) / `.btn-secondary` / `.btn-ghost`, `.card`, `.tag` (+ `.tag-accent`, `.tag-neutral`, `.tag-outline`), `.table`, `.field`/`.input`/`.seg`/`.seg-opt`/`.radio`, `.dialog-backdrop`/`.dialog`.

## Assets
- Inline SVG icons only (brand mark, plus-icon on buttons) — simple stroke paths, no external icon library file to copy. Design system calls for Phosphor icons (phosphoricons.com) going forward.
- `image-slot.js` is a prototype-only drag/drop placeholder for the trade screenshot field — replace with real file upload to Supabase Storage in production.

## Files
- `Dashboard.dc.html` — the full prototype (all 3 screens + both dialogs, structure and state logic).
- `styles.css` — the Nocturne design-system token sheet + component classes.
- `image-slot.js` — prototype-only image drop-zone widget (reference for the screenshot field's intent, not for reuse).
