# Website homepage

Personal portfolio site: intro, experience, projects and contact links,
built as a single-page React app.

## Stack

- React 19 + TypeScript + Vite
- Plain CSS (`src/App.css`) - no Tailwind or component library
- Fonts: Google Sans (display/body), IBM Plex Mono (labels/dates)
- Deployed to Cloudflare Workers as static assets (see `wrangler.jsonc`)

## Structure

- `src/App.tsx` - the whole page: intro, tab-switched Experience /
  Projects / Contact sections
- `src/App.css` - design tokens (color, type) and component styles
- `public/` - static assets served as-is (profile photo, research
  paper PDF, favicon)

## Commands

```
npm run dev       # vite dev server
npm run build     # tsc -b && vite build
npm run preview   # preview production build
npm run lint      # eslint .
```

## Deploy

```
npm run build
npx wrangler deploy
```
