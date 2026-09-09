# Website homepage

Personal portfolio site: intro, experience, projects and contact links,
built as a single-page React app.

## Stack

- React 19 + TypeScript + Vite
- Plain CSS (`src/App.css`) - no Tailwind or component library
- Fonts: Google Sans (display/body), IBM Plex Mono (labels/dates)
- Deployed to Cloudflare Workers as static assets (see `wrangler.jsonc`),
  plus a small Worker (`worker/index.ts`) that serves the photo gallery
  from R2 — see "Photo gallery" below

## Structure

- `src/App.tsx` - the whole page: intro, tab-switched Experience /
  Projects / Photos / Contact sections
- `src/App.css` - design tokens (color, type) and component styles
- `src/data/photos.json` - gallery manifest (paths + real EXIF), built
  by `scripts/build-gallery.mjs`
- `public/` - static assets served as-is (profile photo, research
  paper PDF, favicon). `public/photos/` is gitignored — it's local
  staging output for the upload step, not shipped in the deploy
- `worker/index.ts` - Worker script; only handles `/photos/*` requests
  (routed here via `run_worker_first` in `wrangler.jsonc`), reading the
  image bytes from R2. Everything else is served directly by the
  static-assets layer without invoking the Worker

## Commands

```
npm run dev       # vite dev server
npm run build     # tsc -b && vite build
npm run preview   # preview production build
npm run lint      # eslint .
```

## Photo gallery (R2)

Originals live in `gallery_src/` (gitignored, not shipped). To add or
change photos:

```
npm run gallery:build    # resize to public/photos/, extract EXIF, write src/data/photos.json
npm run gallery:upload   # push public/photos/ to the R2 bucket
```

One-time setup, if the bucket doesn't exist yet:

```
npx wrangler login
npx wrangler r2 bucket create starcandy-photos
```

`src/data/photos.json` is committed (small, no binaries) so the site
still knows what photos exist and their captions; the actual image
bytes are fetched from R2 at request time by `worker/index.ts`.

## Deploy

Pushes to `main` that touch `landing/**` deploy automatically via
`.github/workflows/deploy-landing.yml` (lint, build, `wrangler deploy`).

To deploy manually instead:

```
npm run deploy
```
