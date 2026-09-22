// AIL-009: capture หน้าจอ safe recovery states สำหรับ User Acceptance
// usage: node scripts/capture-ail-009.js  (ต้อง start http server ที่ Prototypes ก่อน)
const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const BASE = "http://localhost:8080/bo-prototype.html";
const TOKEN = "sim-token-kq8f2x7m4d9e1b6a";
const OUT = path.join(__dirname, "..", "screenshots", "ail-009");

const cases = [
  ["01-invalid", null],
  ["02-expired", "expired"],
  ["03-cancelled", "cancelled"],
  ["04-superseded", "superseded"],
  ["05-used", "used"],
  ["06-account-ineligible", "account"],
  ["07-role-ineligible", "role"],
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  for (const [name, scenario] of cases) {
    await page.goto(BASE);
    await page.waitForLoadState("networkidle");
    await page.evaluate(({ scenario, token }) => {
      const acc = adminAccountData.accounts.find(a => a.id === "ADM-008");
      const role = roleListData.roles.find(r => r.id === "ROL-002");
      if (acc) acc.status = "Invited";
      if (role) role.status = "Active";
      if (scenario === "account" && acc) {
        applyAdminInvitationScenario("ADM-008", "pending");
        acc.status = "Suspended";
      } else if (scenario === "role" && role) {
        applyAdminInvitationScenario("ADM-008", "pending");
        role.status = "Inactive";
      } else if (scenario) {
        applyAdminInvitationScenario("ADM-008", scenario);
      }
      enterInviteMode(scenario === null ? "sim-token-invalid" : token);
    }, { scenario, token: TOKEN });
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(OUT, `${name}-desktop.png`), fullPage: true });
    console.log("saved", name);
  }

  // transient recovery (commit-time stale)
  await page.goto(BASE);
  await page.waitForLoadState("networkidle");
  await page.evaluate(token => {
    const acc = adminAccountData.accounts.find(a => a.id === "ADM-008");
    const role = roleListData.roles.find(r => r.id === "ROL-002");
    if (acc) acc.status = "Invited";
    if (role) role.status = "Active";
    applyAdminInvitationScenario("ADM-008", "pending");
    enterInviteMode(token);
    adminAccountData.accounts.find(a => a.id === "ADM-008").revision = 99;
    document.querySelector("#invite-password").value = "Tukdaeng#2026xy";
    document.querySelector("#invite-password-confirm").value = "Tukdaeng#2026xy";
    document.querySelector("#invite-submit").click();
  }, TOKEN);
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, "08-transient-desktop.png"), fullPage: true });
  console.log("saved 08-transient");

  // mobile สำหรับ 2 state ตัวแทน + transient (เช็ค reason-box wrapping)
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE);
  await page.waitForLoadState("networkidle");
  await page.evaluate(token => {
    const acc = adminAccountData.accounts.find(a => a.id === "ADM-008");
    if (acc) acc.status = "Invited";
    applyAdminInvitationScenario("ADM-008", "pending");
    enterInviteMode(token);
    adminAccountData.accounts.find(a => a.id === "ADM-008").revision = 99;
    document.querySelector("#invite-password").value = "Tukdaeng#2026xy";
    document.querySelector("#invite-password-confirm").value = "Tukdaeng#2026xy";
    document.querySelector("#invite-submit").click();
  }, TOKEN);
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, "08-transient-mobile.png"), fullPage: true });
  console.log("saved 08-transient mobile");

  for (const [name, scenario] of [["02-expired", "expired"], ["06-account-ineligible", "account"]]) {
    await page.goto(BASE);
    await page.waitForLoadState("networkidle");
    await page.evaluate(({ scenario, token }) => {
      const acc = adminAccountData.accounts.find(a => a.id === "ADM-008");
      if (acc) acc.status = "Invited";
      if (scenario === "account") {
        applyAdminInvitationScenario("ADM-008", "pending");
        acc.status = "Suspended";
      } else {
        applyAdminInvitationScenario("ADM-008", scenario);
      }
      enterInviteMode(token);
    }, { scenario, token: TOKEN });
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(OUT, `${name}-mobile.png`), fullPage: true });
    console.log("saved", name, "mobile");
  }

  await browser.close();
})();
