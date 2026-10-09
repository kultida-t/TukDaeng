// Capture feed-redesign prototype flows per variant combo.
// Usage: node scripts/capture-feed-redesign.js [variant] [trigger] [content] [nav]
//   variant: a1 a2 a3 b1 b2 b3 c1 c2 c3 mixed   (default a1)
//   trigger: t1 t2 t3                           (default t1)
//   content: d1 d2 d3                           (default d1)
//   nav:     labeled icons                      (default labeled)
// Output: deliverables/feed-redesign-review/<combo>/dark|light-NN-state.png

const { chromium } = require("playwright");
const { mkdirSync } = require("fs");
const { join } = require("path");

const [v = "a1", t = "t1", d = "d1", n = "labeled"] = process.argv.slice(2);
const combo = `${v}-${t}-${d}-${n === "icons" ? "n2" : "n1"}`;
const outDir = join(__dirname, "..", "deliverables", "feed-redesign-review", combo);
mkdirSync(outDir, { recursive: true });

const FILE = "file:///C:/Users/Admin/Desktop/TukDaeng/Prototypes/feed-social-redesign.html";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1500, height: 1200 } });
  await page.goto(FILE);
  await page.waitForTimeout(600);

  await page.click(`[data-v="${v}"]`);
  await page.click(`[data-t="${t}"]`);
  await page.click(`[data-d="${d}"]`);
  await page.click(`[data-n="${n}"]`);
  await page.waitForTimeout(400);

  const phones = await page.$$(".phone");
  const names = ["dark", "light"];

  for (let i = 0; i < phones.length; i++) {
    const ph = phones[i];
    const shot = async (name) => {
      await page.waitForTimeout(250);
      await ph.screenshot({ path: join(outDir, `${names[i]}-${name}.png`) });
    };

    await shot("01-feed-collapsed");

    await (await ph.$(".feed-scroll")).evaluate(e => e.scrollTop = 560);
    await shot("02-feed-scrolled");

    await (await ph.$(".details-toggle")).click();
    await shot("03-details-expanded");

    await (await ph.$(".details-inner")).click();
    await shot("04-detail-top");

    await (await ph.$(".detail-scroll")).evaluate(e => e.scrollTop = 620);
    await shot("05-detail-specs");

    await (await ph.$(".page-detail .comment-btn")).click();
    await shot("06-comments");
  }

  await browser.close();
  console.log("done ->", outDir);
})().catch(e => { console.error(e); process.exit(1); });
