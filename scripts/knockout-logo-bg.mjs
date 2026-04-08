/**
 * Logo PNG: opaque black / neutral dark background → transparent.
 * Green icon + medium gray text preserve (saturation / luminance checks).
 */
import sharp from "sharp";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const target = join(root, "public", "karobaar-logo.png");
const temp = join(root, "public", "karobaar-logo.processing.png");

const { data, info } = await sharp(target)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
const buf = Buffer.from(data);
const n = width * height;

for (let i = 0; i < n; i++) {
  const o = i * channels;
  const r = buf[o];
  const g = buf[o + 1];
  const b = buf[o + 2];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max === 0 ? 0 : (max - min) / max;
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;

  // Black / charcoal flat background only (Markaz-style: real transparency)
  const knockOut =
    (luma < 42 && sat < 0.28) ||
    (max < 22 && min < 22);

  if (knockOut) buf[o + 3] = 0;
}

await sharp(buf, { raw: { width, height, channels: 4 } })
  .png({ compressionLevel: 9 })
  .toFile(temp);

const { renameSync } = await import("fs");
renameSync(temp, target);

console.log("OK: public/karobaar-logo.png — transparent background.");
