// Uploads the resized photos from public/photos/ (built by
// build-gallery.mjs) to the R2 bucket configured in wrangler.jsonc.
// Run after build-gallery.mjs, and after `wrangler login` +
// `wrangler r2 bucket create <name>`:
//
//   node scripts/build-gallery.mjs
//   node scripts/upload-gallery.mjs
//
// public/photos/ is gitignored — it's a local staging directory for this
// upload step, not something the deployed static-assets bundle ships.
// The Worker (worker/index.ts) serves these objects at request time.

import { readdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const PHOTOS_DIR = path.join(ROOT, 'public', 'photos');
const BUCKET_NAME = 'starcandy-photos'; // must match wrangler.jsonc
// npx resolves to npx.cmd on Windows — spawnSync (which execFileSync uses)
// won't find it without a shell, and `.cmd` needs the exe named explicitly
// rather than shell:true (which skips arg-escaping).
const NPX = process.platform === 'win32' ? 'npx.cmd' : 'npx';

async function main() {
  const subdirs = ['thumb', 'full'];

  for (const sub of subdirs) {
    const dir = path.join(PHOTOS_DIR, sub);
    const files = await readdir(dir).catch(() => []);

    for (const file of files) {
      const localPath = path.join(dir, file);
      const key = `photos/${sub}/${file}`;

      console.log(`uploading ${key}...`);
      execFileSync(
        NPX,
        [
          'wrangler',
          'r2',
          'object',
          'put',
          `${BUCKET_NAME}/${key}`,
          '--file',
          localPath,
          '--content-type',
          'image/webp',
          '--remote',
        ],
        { cwd: ROOT, stdio: 'inherit' },
      );
    }
  }

  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
