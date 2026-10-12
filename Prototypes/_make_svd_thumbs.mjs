// Generate downscaled thumbnails for the Saved grid + collection covers.
// 320x400 (4:5) for .svd-tile, 160x160 square for .svd-col thumbs.
// Canvas 'high' smoothing beats Chromium's CSS downscale on detailed photos.
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const DIR = dirname(fileURLToPath(import.meta.url));
const OUT = join(DIR, "fo-flow", "assets", "thumbs");
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("http://127.0.0.1:4173/fo-flow/index.html");
await page.waitForFunction(() => typeof POSTS !== "undefined" && POSTS.length);

const jobs = await page.evaluate(async () => {
  const load = src => new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = rej;
    im.src = src;
  });
  const cover = (im, w, h) => {
    const cv = document.createElement("canvas");
    cv.width = w; cv.height = h;
    const cx = cv.getContext("2d");
    cx.imageSmoothingEnabled = true;
    cx.imageSmoothingQuality = "high";
    const s = Math.max(w / im.naturalWidth, h / im.naturalHeight);
    const sw = w / s, sh = h / s;
    cx.drawImage(im, (im.naturalWidth - sw) / 2, (im.naturalHeight - sh) / 2, sw, sh, 0, 0, w, h);
    return cv.toDataURL("image/jpeg", .86);
  };
  const out = [];
  for (const p of POSTS) {
    const im = await load(p.photos[0]);
    out.push({ id: p.id, p: cover(im, 320, 400), s: cover(im, 160, 160) });
  }
  return out;
});

for (const j of jobs) {
  writeFileSync(join(OUT, `${j.id}-p.jpg`), Buffer.from(j.p.split(",")[1], "base64"));
  writeFileSync(join(OUT, `${j.id}-s.jpg`), Buffer.from(j.s.split(",")[1], "base64"));
}
console.log(`wrote ${jobs.length * 2} thumbs -> ${OUT}`);
await browser.close();
