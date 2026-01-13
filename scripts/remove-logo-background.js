/**
 * Remove a solid background from a PNG by making pixels near the corner color transparent.
 * This is intended for logos exported with a flat background.
 *
 * Usage:
 *   node scripts/remove-logo-background.js
 *
 * Output:
 * - Preserves original as images/logo-original.png (if not already present)
 * - Writes transparent version to images/logo.png
 */
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const IMAGES_DIR = path.join(PROJECT_ROOT, 'images');
const INPUT_LOGO_PATH = path.join(IMAGES_DIR, 'logo.png');
const BACKUP_LOGO_PATH = path.join(IMAGES_DIR, 'logo-original.png');

const COLOR_DISTANCE_THRESHOLD = 18; // 0-255 per channel distance; tune if needed
const ALPHA_SOFT_EDGE_THRESHOLD = 35; // slightly higher to soften edges

/**
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
function absDiff(a, b) {
  return Math.abs(a - b);
}

/**
 * Simple per-channel distance (max of RGB diffs).
 * @param {{r:number,g:number,b:number}} c1
 * @param {{r:number,g:number,b:number}} c2
 * @returns {number}
 */
function colorDistance(c1, c2) {
  return Math.max(absDiff(c1.r, c2.r), absDiff(c1.g, c2.g), absDiff(c1.b, c2.b));
}

/**
 * @param {PNG} png
 * @param {number} x
 * @param {number} y
 * @returns {{r:number,g:number,b:number,a:number}}
 */
function getPixel(png, x, y) {
  const idx = (png.width * y + x) << 2;
  return {
    r: png.data[idx],
    g: png.data[idx + 1],
    b: png.data[idx + 2],
    a: png.data[idx + 3],
  };
}

/**
 * @param {PNG} png
 * @param {number} x
 * @param {number} y
 * @param {number} a
 * @returns {void}
 */
function setAlpha(png, x, y, a) {
  const idx = (png.width * y + x) << 2;
  png.data[idx + 3] = a;
}

/**
 * Sample background color from 4 corners and pick the most common (rounded) value.
 * @param {PNG} png
 * @returns {{r:number,g:number,b:number}}
 */
function detectBackgroundColor(png) {
  const samples = [
    getPixel(png, 0, 0),
    getPixel(png, png.width - 1, 0),
    getPixel(png, 0, png.height - 1),
    getPixel(png, png.width - 1, png.height - 1),
  ];

  /** @type {Map<string, {r:number,g:number,b:number,count:number}>} */
  const buckets = new Map();

  for (const s of samples) {
    const r = Math.round(s.r / 4) * 4;
    const g = Math.round(s.g / 4) * 4;
    const b = Math.round(s.b / 4) * 4;
    const key = `${r},${g},${b}`;
    const existing = buckets.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      buckets.set(key, { r, g, b, count: 1 });
    }
  }

  let best = null;
  for (const v of buckets.values()) {
    if (!best || v.count > best.count) best = v;
  }

  if (!best) return { r: 0, g: 0, b: 0 };
  return { r: best.r, g: best.g, b: best.b };
}

/**
 * @returns {void}
 */
function main() {
  if (!fs.existsSync(INPUT_LOGO_PATH)) {
    throw new Error(`Input logo not found at: ${INPUT_LOGO_PATH}`);
  }

  if (!fs.existsSync(BACKUP_LOGO_PATH)) {
    fs.copyFileSync(INPUT_LOGO_PATH, BACKUP_LOGO_PATH);
  }

  const inputBuffer = fs.readFileSync(INPUT_LOGO_PATH);
  const png = PNG.sync.read(inputBuffer);

  const background = detectBackgroundColor(png);

  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const pixel = getPixel(png, x, y);
      const d = colorDistance(pixel, background);

      if (d <= COLOR_DISTANCE_THRESHOLD) {
        setAlpha(png, x, y, 0);
        continue;
      }

      if (d <= ALPHA_SOFT_EDGE_THRESHOLD) {
        // Soft edge: map distance to alpha in [0,255]
        const t =
          (d - COLOR_DISTANCE_THRESHOLD) /
          (ALPHA_SOFT_EDGE_THRESHOLD - COLOR_DISTANCE_THRESHOLD);
        const alpha = Math.max(0, Math.min(255, Math.round(255 * t)));
        setAlpha(png, x, y, alpha);
      }
    }
  }

  const out = PNG.sync.write(png);
  fs.writeFileSync(INPUT_LOGO_PATH, out);

  // eslint-disable-next-line no-console
  console.log(
    `Done. Background removed using bg rgb(${background.r},${background.g},${background.b}). Wrote ${INPUT_LOGO_PATH} (backup at ${BACKUP_LOGO_PATH}).`,
  );
}

main();


