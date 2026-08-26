# Options Trading Tracker — Design Spec

**Date:** 2026-08-26
**Scope:** Phase 1 — Vite scaffold, all 4 screens, Supabase auth + DB + Storage, Resend magic-link transport. Cloudflare Pages deployment and additional email features are Phase 2.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Scaffold | Vite + TypeScript |
| UI | React 18 |
| Routing | React Router v6 |
| Async state | TanStack Query v5 |
| Auth + DB | Supabase JS client (`@supabase/supabase-js`) |
| File storage | Supabase Storage (trade screenshots) |
| Email transport | Resend (Supabase SMTP config only — no SDK in app code) |
| Charts | TradingView Lightweight Charts (`lightweight-charts`) |
| Design system | Nocturne — import `design_handoff_options_tracker/styles.css` directly |
| Font | Inter via Google Fonts (already in styles.css) |

No CSS framework. No additional component library. Component styles use the Nocturne class names (`.btn`, `.card`, `.tag`, `.table`, etc.) as defined in `styles.css`.

---

## Project Structure

```
index.html              # Vite entry point (already at repo root)
src/
  main.tsx              # App entry: QueryClientProvider + RouterProvider
  router.tsx            # Route definitions + auth guard
  supabase.ts           # Supabase client singleton
  hooks/
    useAuth.ts          # Session, signIn (magic link + Google), signOut
    useTrades.ts        # TanStack Query: fetchTrades, addTrade, updateTrade
    useJournal.ts       # TanStack Query: fetchJournal, addNote
    useChart.ts         # Stubbed OHLCV hook (returns fake candle data)
  components/
    Layout.tsx          # Nav bar + <Outlet>
    Nav.tsx             # Brand, 4 links, "+ Log trade" button, avatar/sign-out
    TradeDialog.tsx     # "Log a trade" modal (used from Nav + Trades header)
    JournalDialog.tsx   # "Add a note" modal
  pages/
    Login.tsx           # Magic link form + Google OAuth button
    Dashboard.tsx       # Stats, P&L bar chart, strategy mix, recent tables
    Trades.tsx          # Full trade table with search/filter + chart link column
    Journal.tsx         # Journal entry list + add note
    Chart.tsx           # TradingView chart, ticker input, trade annotation
  lib/
    format.ts           # formatCurrency, formatDate, formatPnl, deriveStats
```

`styles.css` is imported once in `main.tsx`. All Nocturne tokens are available globally as CSS custom properties.

---

## Routing

```
/login      → Login.tsx          (no Layout — renders standalone)
/           → Layout > Dashboard.tsx
/trades     → Layout > Trades.tsx
/journal    → Layout > Journal.tsx
/chart      → Layout > Chart.tsx
```

**Auth guard:** `router.tsx` wraps the four main routes in a loader that checks `supabase.auth.getSession()`. If no session, redirect to `/login`. After sign-in, Supabase redirects back to `/` (configured in the Supabase dashboard as the redirect URL).

---

## Auth Flow

**Magic link + Google OAuth, handled entirely by Supabase Auth.**

- `Login.tsx`: email input + "Send magic link" (`supabase.auth.signInWithOtp`) and "Continue with Google" (`supabase.auth.signInWithOAuth({ provider: 'google' })`).
- `useAuth.ts`: wraps `getSession()` + `onAuthStateChange()`. Exposes `{ user, loading, signOut }`.
- Avatar in Nav shows user initials (derived from email). Clicking it calls `signOut()`.

**Resend setup (no code required in app):** In the Supabase dashboard → Auth → SMTP Settings, configure Resend as the custom SMTP provider (`smtp.resend.com:465`, API key as password, `noreply@yourdomain.com` as sender). Supabase routes all auth emails (magic links, password resets) through Resend automatically.

---

## Supabase Data Model

### `trades`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | `gen_random_uuid()` |
| `user_id` | `uuid` FK | `auth.users.id` |
| `ticker` | `text` | |
| `type` | `text` | `'Call'` \| `'Put'` |
| `strategy` | `text` | one of 8 values (see Trade Dialog) |
| `strike` | `text` | stored as text to allow decimals |
| `expiry` | `date` | |
| `qty` | `integer` | number of contracts |
| `premium` | `numeric` | per contract |
| `status` | `text` | `'Open'` \| `'Closed'` |
| `pnl` | `numeric` | nullable; filled when closed |
| `notes` | `text` | nullable |
| `screenshot_url` | `text` | nullable; Supabase Storage public URL |
| `created_at` | `timestamptz` | `now()` |

### `journal_entries`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `user_id` | `uuid` FK | `auth.users.id` |
| `trade_id` | `uuid` FK | `trades.id` |
| `note` | `text` | |
| `created_at` | `timestamptz` | `now()` |

**RLS:** Both tables enable RLS with a single policy per operation: `user_id = auth.uid()` for SELECT, INSERT, UPDATE, DELETE.

### Supabase Storage

Bucket: `trade-screenshots` (public read, authenticated write).
Upload path: `{user_id}/{trade_id}/{filename}`.
The returned public URL is saved to `trades.screenshot_url`.

---

## Derived State (computed in React, not stored)

All computed in `lib/format.ts` from the raw `trades` array:

- **Total P&L** — sum of `pnl` on closed trades
- **Win rate** — closed trades where `pnl > 0` / total closed trades
- **Open positions count** — trades where `status === 'Open'`
- **Total premium collected** — sum of `qty * premium * 100` across all trades
- **P&L bar chart data** — last 8 closed trades sorted by `created_at`, bar heights as % of max `|pnl|`
- **Strategy mix** — top 4 strategies by trade count, percentages relative to total

---

## Screens

### Shared: Layout + Nav

`Layout.tsx` renders the Nav bar (fixed top, `border-bottom: 1px solid var(--color-divider)`) and `<Outlet>` below. Contains `TradeDialog` and `JournalDialog` (portal-rendered, toggled by boolean state lifted here). Nav has: brand mark (inline SVG + "Options Tracker"), links (Dashboard / Trades / Journal / Chart), "+ Log trade" button (opens TradeDialog), 36px avatar (initials from email, click → signOut).

### Dashboard (`/`)

- Header: kicker "Welcome back", `<h1>Your trading journey</h1>`, muted subtitle.
- Stat row: 4 cards (Total P&L, Win rate, Open positions, Premium collected). P&L colored by sign: positive → `--color-accent-300`, negative → `--color-neutral-500`.
- Middle row: "P&L by trade" bar chart (CSS flex, no chart library) + "Strategy mix" progress bars.
- Bottom row: "Recent trades" table (last 6, same columns as Trades screen) + "Journal notes" (last 3 entries).

### Trades (`/trades`)

- Header: kicker, `<h1>Trades</h1>`, right-aligned "+ Log trade" button.
- Filter row: text search input (substring match on ticker + strategy) + 3-way segmented control (All / Open / Closed). Filters combine with AND.
- Table columns: Ticker + Call/Put tag, Strategy, Strike/Exp (muted), Qty, Premium (qty × premium × 100), Status tag, P&L (bold, colored), chart icon → links to `/chart?ticker=X&strike=Y&expiry=Z`.
- Empty state: centered muted "No trades match." when filtered set is empty.

### Journal (`/journal`)

- Header: kicker "Rationale & reflections", `<h1>Journal</h1>`, right-aligned "+ Add note" button.
- List of cards, newest first. Each: top row with ticker (bold) + strategy tag on left, date on right; note text at 14px.

### Chart (`/chart`)

- Reads `?ticker`, `?strike`, `?expiry` from URL search params (populated when navigating from a trade row). All params optional — screen is also usable standalone.
- Toolbar: ticker text input (editable, updates chart on change/Enter), timeframe segmented control (1D / 1W / 1M / 3M).
- "Your positions" pill row: shows all trades for the current ticker as clickable chips; clicking a chip updates the strike/expiry annotations on the chart.
- **Chart:** TradingView Lightweight Charts (`createChart`) in a `useEffect`, fills a `ref` div. Renders a candlestick series. Strike annotated as a dashed price line (`createPriceLine`). Expiry annotated as a vertical marker at the corresponding time index.
- **OHLCV data:** `useChart(ticker, timeframe)` hook returns stubbed candle data in Phase 1. The hook's interface is `{ data: CandleData[], isLoading, error }` so a real API can be dropped in later without changing Chart.tsx.
- No screenshot-capture button on this screen — screenshots are uploaded manually via the Trade dialog.

### Login (`/login`)

- Centered card on the page background. Brand mark at top.
- Email input + "Send magic link" button. On submit: calls `signInWithOtp`, replaces form with "Check your email" confirmation.
- Divider + "Continue with Google" button → `signInWithOAuth`.

---

## Dialogs

Both are `<dialog>`-based (or a `<div>` with `.dialog-backdrop` + `.dialog` classes from Nocturne), portal-rendered via `ReactDOM.createPortal` into `document.body`. Close on backdrop click, Cancel button, or after successful save.

### TradeDialog

Form fields (2-column grid): Ticker, Type (segmented Call/Put), Strategy (native `<select>`: Covered Call, Cash-Secured Put, Credit Spread, Debit Spread, Iron Condor, Long Call, Long Put, Straddle), Contracts, Strike, Expiry, Premium per contract, Status (segmented Open/Closed). Full-width Notes textarea. Full-width screenshot upload drop zone (accepts image files; on drop/select, uploads to `trade-screenshots` Supabase Storage bucket, stores returned URL in form state). Footer: Cancel / Save trade.

On save: `useTrades` mutation → `supabase.from('trades').insert(...)` → `queryClient.invalidateQueries(['trades'])` → dialog closes.

### JournalDialog

Fields: Trade select (`<select>` of existing trade tickers, ordered by `created_at` desc), Note textarea. Footer: Cancel / Save note.

On save: `useJournal` mutation → `supabase.from('journal_entries').insert(...)` → invalidate `['journal']` → close.

---

## Data Fetching Pattern

All server state lives in TanStack Query. Each hook follows this shape:

```ts
// useTrades.ts
export function useTrades() {
  return useQuery({
    queryKey: ['trades'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useAddTrade() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (trade: NewTrade) => {
      const { error } = await supabase.from('trades').insert(trade)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trades'] }),
  })
}
```

Loading and error states are handled at the component level using `isLoading` and `error` from the hook return value. No global loading UI — each section shows its own skeleton or error message inline.

---

## Environment Variables

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Both are public/safe to expose in client-side code (Supabase RLS enforces data access). No other secrets in the app. Resend API key lives only in the Supabase dashboard SMTP config.

---

## Out of Scope (Phase 2)

- Cloudflare Pages deployment and `wrangler.toml` config
- Real OHLCV price data source for the Chart screen
- Weekly P&L summary emails or expiry reminder emails via Resend
- Supabase Storage screenshot viewing/lightbox on trade detail
