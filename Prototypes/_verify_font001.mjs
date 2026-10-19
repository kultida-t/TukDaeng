// FONT-001 — verify Google Sans Thai applied across fo-flow:
// @font-face loads (normal+italic, wght 400-700), --font-main uses "Google Sans",
// Thai + Latin glyphs render, no console/page errors. Screenshots TH+EN.
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { mkdirSync, writeFileSync } from "fs";
import { pathToFileURL } from "url";
import path from "path";

const OUT = path.join(process.cwd(), "Prototypes/screenshots/task-FONT-001");
const DELIV = path.join(process.cwd(), "Prototypes/deliverables/task-FONT-001");
mkdirSync(OUT, { recursive: true });
mkdirSync(DELIV, { recursive: true });

const fileUrl = (f) => pathToFileURL(path.join(process.cwd(), "Prototypes/fo-flow", f)).href;

let failed = 0;
const results = [];
function check(name, ok, msg = "") {
  const line = `${ok ? "PASS" : "FAIL"}: ${name}${msg ? " — " + msg : ""}`;
  console.log(line);
  results.push(line);
  if (!ok) failed++;
}

const browser = await chromium.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: true
});

async function probeFile(file, { lang = "en", shot = null } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 440, height: 956 }, deviceScaleFactor: 2 });
  if (lang !== "en") await ctx.addInitScript((l) => localStorage.setItem("fo_lang", l), lang);
  const page = await ctx.newPage();
  let pageErrors = 0;
  page.on("pageerror", e => { console.error("PAGE ERR:", e.message); pageErrors++; });
  page.on("console", m => { if (m.type() === "error") { console.error("CONSOLE ERR:", m.text()); pageErrors++; } });

  await page.goto(fileUrl(file), { waitUntil: "networkidle" });
  await page.waitForTimeout(900);

  const fontFamily = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  check(`${file} body font-family starts with "Google Sans"`, /^"Google Sans"/.test(fontFamily), fontFamily);

  const loaded = await page.evaluate(async () => {
    await document.fonts.load('16px "Google Sans"', "TukDaeng ตึกแดง 123");
    await document.fonts.load('700 16px "Google Sans"', "Bold หนา ๆ");
    await document.fonts.load('italic 16px "Google Sans"', "Italic เอียง");
    const faces = [...document.fonts].map(f => `${f.family}/${f.style}/${f.weight}/${f.status}`);
    return {
      faces,
      th: document.fonts.check('16px "Google Sans"', "ภาษาไทย"),
      en: document.fonts.check('16px "Google Sans"', "English"),
      bold: document.fonts.check('700 16px "Google Sans"', "Bold"),
      italic: document.fonts.check('italic 16px "Google Sans"', "Italic")
    };
  });
  console.log(`   faces: ${JSON.stringify(loaded.faces)}`);
  check(`${file} Google Sans loaded for Thai glyphs`, loaded.th);
  check(`${file} Google Sans loaded for Latin glyphs`, loaded.en);
  check(`${file} Google Sans weight 700 available`, loaded.bold);
  check(`${file} Google Sans italic available`, loaded.italic);

  // confirm an actual on-screen element resolves to Google Sans (not fallback)
  const probe = await page.evaluate(() => {
    const el = document.querySelector("h1, .title, .feed-title, body *");
    if (!el) return null;
    return getComputedStyle(el).fontFamily;
  });
  if (probe) check(`${file} on-screen element uses Google Sans stack`, probe.includes("Google Sans"), probe);

  if (shot) {
    await page.screenshot({ path: path.join(OUT, shot) });
    await page.screenshot({ path: path.join(DELIV, shot) });
  }
  check(`${file} no console/page errors`, pageErrors === 0, `errors=${pageErrors}`);
  await ctx.close();
}

try {
  // index.html — Thai UI is the key evidence (glyphs ไทยต้องเป็น Google Sans)
  await probeFile("index.html", { lang: "th", shot: "m-feed-th-google-sans.png" });

  // index.html — English + desktop viewport
  {
    const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.goto(fileUrl("index.html"), { waitUntil: "networkidle" });
    await page.waitForTimeout(900);
    await page.screenshot({ path: path.join(OUT, "d-feed-en-google-sans.png") });
    await page.screenshot({ path: path.join(DELIV, "d-feed-en-google-sans.png") });
    await ctx.close();
    console.log("   captured d-feed-en-google-sans.png");
  }

  // standalone exploration pages share the same font setup
  await probeFile("create-post.html", {});
  await probeFile("feed-create-post.html", {});
  await probeFile("feed-social-redesign.html", {});
} finally {
  await browser.close();
}

console.log("\n==========================================");
console.log(`TOTAL CHECKS: ${results.length} | FAILED: ${failed}`);
console.log("==========================================");

writeFileSync(path.join(DELIV, "FONT-001-test-results.txt"),
  `TEST RESULTS FOR TASK FONT-001:\n${results.join("\n")}\n\nTOTAL: ${results.length} | FAILED: ${failed}\n`, "utf8");

if (failed > 0) process.exit(1);
console.log("DONE");
