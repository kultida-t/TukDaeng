// Evidence captures for WAL-001 at desktop (1920x1080, d-) and tablet
// (768x1024, t-) — same states as _verify_wa.mjs m- shots, no assertions.
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync } from "fs";

const BASE = "http://127.0.0.1:4173/fo-flow";
const OUT = import.meta.dirname + "/screenshots/task-WAL-001";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
for (const [pre, vp] of [["d", { width: 1920, height: 1080 }], ["t", { width: 768, height: 1024 }]]) {
  const ctx = await browser.newContext({ viewport: vp });
  const page = await ctx.newPage();
  const shot = n => page.screenshot({ path: `${OUT}/${pre}-wa-${n}.png` });

  await page.goto(`${BASE}/index.html`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);

  // 1. Settings > Watch Alerts — empty state
  await page.locator(".app-header .set-btn").click();
  await page.waitForTimeout(400);
  await page.locator('.page-sub [data-sub="walerts"]').click();
  await page.waitForTimeout(400);
  await shot("1-empty");
  await page.locator(".page-sub .sub-back").first().click();
  await page.waitForTimeout(300);
  await page.locator(".page-sub .sub-back").first().click();
  await page.waitForTimeout(300);

  // 2. Detail bell → centered modal (mode picker only)
  await page.evaluate(() => openPostDetail(document.querySelector(".screen"), POSTS.find(p => p.id === "p1")));
  await page.waitForTimeout(400);
  await page.locator(".page-detail .mf-btn").click();
  await page.waitForTimeout(400);
  await shot("2-create-detail");
  await page.locator('.comment-sheet .wa-mode[data-mode="model"]').click();
  await page.waitForTimeout(300);
  await shot("3-model-mode");
  await page.locator(".comment-sheet .wa-go").click();
  await page.waitForTimeout(350);
  await page.locator(".page-detail .detail-back").first().click();
  await page.waitForTimeout(350);

  // 3. Search entry — keyword + filter → create sheet
  await page.locator(".app-header .search-btn").click();
  await page.waitForTimeout(400);
  await page.locator(".page-sub .sr-fake").click();
  await page.waitForTimeout(300);
  await page.locator(".page-sub input.sr-q").fill("submariner");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(400);
  await page.locator(".page-sub .flt-open").click();
  await page.waitForTimeout(400);
  await page.locator('.flt-chip[data-fk="brand"][data-v="Rolex"]').click();
  await page.waitForTimeout(200);
  await page.locator(".flt-apply").click();
  await page.waitForTimeout(400);
  await page.locator(".page-sub .sr-wa").click();
  await page.waitForTimeout(350);
  await shot("4-create-search");
  await page.locator(".comment-sheet .wa-go").click();
  await page.waitForTimeout(350);
  await page.locator(".page-sub .sub-back").first().click();
  await page.waitForTimeout(300);
  await page.locator(".page-sub .sub-back").first().click();
  await page.waitForTimeout(300);

  // 4. Watch Alerts list
  await page.locator(".app-header .set-btn").click();
  await page.waitForTimeout(350);
  await page.locator('.page-sub [data-sub="walerts"]').click();
  await page.waitForTimeout(2200); // let the create toast fade before the shot
  await shot("5-list");
  await page.locator(".page-sub .sub-back").first().click();
  await page.waitForTimeout(300);
  await page.locator(".page-sub .sub-back").first().click();
  await page.waitForTimeout(300);

  // 5. New matching post → toast (same scrToast the post/share caller fires)
  await page.evaluate(() => {
    insertNewPost({
      photos: ["./assets/asset-uploads/ast-8831-1.png"],
      caption: "fresh submariner just in",
      meta: { brand: "Rolex", model: "Submariner Date", ref: "126610LN", cond: "New", price: "450000" },
    });
    const hits = POSTS[0]._waHits || [];
    if (hits.length) scrToast(document.querySelector(".screen"), `Watch alert matched: ${hits[0]}${hits.length > 1 ? ` +${hits.length - 1} more` : ""}`);
  });
  await page.waitForTimeout(400);
  await shot("6-match");
  await ctx.close();
}
await browser.close();
console.log("done");
