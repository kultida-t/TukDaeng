// MKD-003 quick verification: console errors + rendered label checks
const { chromium } = require("@playwright/test");
const BASE = "http://localhost:4173/bo-prototype.html";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("pageerror", e => errors.push("pageerror: " + e.message));
  page.on("console", m => { if (m.type() === "error") errors.push("console: " + m.text()); });

  await page.goto(BASE);
  await page.waitForLoadState("networkidle");
  if (await page.locator("#login-screen").isVisible({ timeout: 1000 }).catch(() => false)) {
    await page.locator('#login-form button[type="submit"]').click();
    await page.waitForFunction(() => !document.body.classList.contains("logged-out"), { timeout: 5000 });
  }

  const check = async (name, fn) => {
    try { const r = await fn(); console.log(`PASS ${name}: ${r}`); }
    catch (e) { console.log(`FAIL ${name}: ${e.message.split("\n")[0]}`); }
  };

  // sync modal states
  await check("sync confirm labels", async () => {
    await page.evaluate(() => renderMarketSyncModal("confirm"));
    const t = await page.locator("#user-action-modal-body").innerText();
    if (!t.includes("ยกเลิก") || !t.includes("เริ่ม Sync")) throw Error(t.slice(-200));
    return "ยกเลิก + เริ่ม Sync";
  });
  await check("sync running label", async () => {
    await page.evaluate(() => renderMarketSyncModal("running"));
    const t = await page.locator("#user-action-modal-body").innerText();
    if (!t.includes("กำลัง Sync...")) throw Error("missing");
    return "กำลัง Sync...";
  });
  await check("sync success labels", async () => {
    await page.evaluate(() => renderMarketSyncModal("success"));
    const t = await page.locator("#user-action-modal-body").innerText();
    if (!t.includes("ปิด") || !t.includes("ดู Sync History")) throw Error("missing");
    return "ปิด + ดู Sync History";
  });
  await check("sync error labels", async () => {
    await page.evaluate(() => renderMarketSyncModal("error"));
    const t = await page.locator("#user-action-modal-body").innerText();
    if (!t.includes("ลองใหม่เฉพาะชุดที่ล้มเหลว")) throw Error("missing");
    return "ลองใหม่เฉพาะชุดที่ล้มเหลว";
  });
  await page.locator("[data-user-action-modal-close]").first().click().catch(() => {});

  // brands list
  await check("brands row action", async () => {
    await page.evaluate(() => jumpToModule("market", "Brands & Models"));
    await page.waitForTimeout(400);
    const b = await page.locator(".market-catalog-table .market-arrow-action").first();
    const txt = await b.innerText();
    const aria = await b.getAttribute("aria-label");
    if (txt !== "ดูรายละเอียด") throw Error(txt);
    return `${txt} / aria=${aria}`;
  });
  await check("brands empty", async () => {
    await page.locator("#market-search").fill("zzz");
    await page.waitForTimeout(300);
    const t = await page.locator("#table").innerText();
    if (!t.includes("ไม่พบข้อมูล")) throw Error("missing");
    return "ไม่พบข้อมูล";
  });
  await check("brand detail search + back aria", async () => {
    await page.locator("#market-search").fill("");
    await page.waitForTimeout(200);
    await page.locator("[data-market-brand]").first().locator(".main-text").first().click();
    await page.waitForTimeout(400);
    const ph = await page.locator("#market-model-search").getAttribute("placeholder");
    const aria = await page.locator(".page-back-btn").getAttribute("aria-label");
    if (!ph.startsWith("ค้นหา Model ของ")) throw Error(ph);
    if (!aria.startsWith("กลับไป")) throw Error(aria);
    return `ph=${ph} / back aria=${aria}`;
  });
  await check("model row action", async () => {
    const b = await page.locator(".market-model-table .market-arrow-action").first();
    const txt = await b.innerText();
    if (txt !== "ดูรายละเอียด") throw Error(txt);
    return txt;
  });
  await check("model detail search + empty", async () => {
    await page.locator("[data-market-model]").first().locator(".main-text").first().click();
    await page.waitForTimeout(400);
    const ph = await page.locator("#market-reference-search").getAttribute("placeholder");
    if (!ph.startsWith("ค้นหา Reference ของ")) throw Error(ph);
    await page.locator("#market-reference-search").fill("zzz");
    await page.waitForTimeout(300);
    const t = await page.locator("#table").innerText();
    if (!t.includes("ไม่พบข้อมูล")) throw Error("missing");
    return `ph=${ph} / ไม่พบข้อมูล`;
  });
  await check("audit modal labels", async () => {
    await page.evaluate(() => openMarketManagementModal("audit", "brand", "rolex"));
    await page.waitForTimeout(300);
    const t = await page.locator("#user-action-modal-body").innerText();
    if (!t.includes("Audit Trail")) throw Error("missing title");
    await page.evaluate(() => {
      marketCatalogData.auditLog.length = 0;
      openMarketManagementModal("audit", "brand", "rolex");
    });
    await page.waitForTimeout(300);
    const t2 = await page.locator("#user-action-modal-body").innerText();
    if (!t2.includes("ยังไม่มีประวัติ Audit สำหรับรายการนี้")) throw Error("missing empty");
    await page.locator("[data-user-action-modal-close]").first().click().catch(() => {});
    return "Audit Trail + empty state";
  });
  await check("sync history row action", async () => {
    await page.evaluate(() => jumpToModule("market", "Sync History"));
    await page.waitForTimeout(400);
    const b = await page.locator(".market-record-table .market-arrow-action").first();
    const txt = await b.innerText();
    const aria = await b.getAttribute("aria-label");
    if (txt !== "ดูรายละเอียด") throw Error(txt);
    return `${txt} / aria=${aria}`;
  });
  await check("sync history empty + detail back", async () => {
    await page.locator("#market-search").fill("zzz");
    await page.waitForTimeout(300);
    const t = await page.locator("#table").innerText();
    if (!t.includes("ไม่พบข้อมูล")) throw Error("missing");
    await page.locator("#market-search").fill("");
    await page.waitForTimeout(200);
    await page.locator("[data-market-record]").first().locator(".main-text").first().click();
    await page.waitForTimeout(400);
    const aria = await page.locator(".page-back-btn").getAttribute("aria-label");
    if (!aria.startsWith("กลับไป")) throw Error(aria);
    return `empty ok / back aria=${aria}`;
  });

  console.log("\n=== JS errors:", errors.length ? errors.join(" | ") : "none");
  await browser.close();
})();
