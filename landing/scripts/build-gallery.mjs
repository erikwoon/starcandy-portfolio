// Resizes photos from gallery_src/ into public/photos/{thumb,full}/*.webp
// and writes src/data/photos.json with real EXIF (camera, lens, exposure)
// pulled from the originals. Run with: node scripts/build-gallery.mjs
//
// gallery_src/ holds the full-res originals (not shipped — see .gitignore)
// so this script is the only thing that needs to touch them.

import { readdir, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import exifr from 'exifr';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC_DIR = path.join(ROOT, 'gallery_src');
const THUMB_DIR = path.join(ROOT, 'public', 'photos', 'thumb');
const FULL_DIR = path.join(ROOT, 'public', 'photos', 'full');
const MANIFEST_PATH = path.join(ROOT, 'src', 'data', 'photos.json');

const THUMB_WIDTH = 700;
const FULL_LONG_EDGE = 2000;

function toFraction(seconds) {
  if (!seconds) return null;
  if (seconds >= 1) return `${seconds.toFixed(seconds % 1 === 0 ? 0 : 1)}s`;
  return `1/${Math.round(1 / seconds)}s`;
}

function slugify(filename) {
  return path
    .basename(filename, path.extname(filename))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
}

async function main() {
  await mkdir(THUMB_DIR, { recursive: true });
  await mkdir(FULL_DIR, { recursive: true });

  const files = (await readdir(SRC_DIR)).filter((f) =>
    /\.(jpe?g|png)$/i.test(f),
  );

  if (files.length === 0) {
    console.log(`No images found in ${SRC_DIR}`);
    return;
  }

  const manifest = [];

  for (const file of files) {
    const srcPath = path.join(SRC_DIR, file);
    const id = slugify(file);

    const exif = await exifr
      .parse(srcPath, [
        'Make',
        'Model',
        'LensModel',
        'FNumber',
        'ExposureTime',
        'ISO',
        'FocalLength',
        'DateTimeOriginal',
      ])
      .catch(() => null);

    const image = sharp(srcPath).rotate(); // auto-orient from EXIF, then strip
    const rawMeta = await image.metadata();
    // sharp's metadata() reports raw sensor dimensions, not the
    // post-rotation ones — an EXIF orientation of 5-8 means a 90°/270°
    // rotation, so width/height are swapped from what actually renders.
    const swapped =
      rawMeta.orientation != null &&
      rawMeta.orientation >= 5 &&
      rawMeta.orientation <= 8;
    const width = swapped ? rawMeta.height : rawMeta.width;
    const height = swapped ? rawMeta.width : rawMeta.height;

    await image
      .clone()
      .resize({ width: THUMB_WIDTH })
      .webp({ quality: 78 })
      .toFile(path.join(THUMB_DIR, `${id}.webp`));

    await image
      .clone()
      .resize({
        width: width >= height ? FULL_LONG_EDGE : undefined,
        height: height > width ? FULL_LONG_EDGE : undefined,
      })
      .webp({ quality: 82 })
      .toFile(path.join(FULL_DIR, `${id}.webp`));

    manifest.push({
      id,
      thumb: `/photos/thumb/${id}.webp`,
      full: `/photos/full/${id}.webp`,
      width,
      height,
      exif: exif
        ? {
            camera: exif.Model || null,
            lens: exif.LensModel || null,
            aperture: exif.FNumber ? `f/${exif.FNumber}` : null,
            shutter: toFraction(exif.ExposureTime),
            iso: exif.ISO ? `ISO ${exif.ISO}` : null,
            focalLength: exif.FocalLength
              ? `${Math.round(exif.FocalLength)}mm`
              : null,
            date: exif.DateTimeOriginal
              ? exif.DateTimeOriginal.toISOString().slice(0, 10)
              : null,
          }
        : null,
    });

    console.log(`✓ ${file} -> ${id}.webp`);
  }

  // Newest first.
  manifest.sort((a, b) =>
    (b.exif?.date || '').localeCompare(a.exif?.date || ''),
  );

  await mkdir(path.dirname(MANIFEST_PATH), { recursive: true });
  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');

  console.log(`\nWrote ${manifest.length} photos to ${MANIFEST_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
