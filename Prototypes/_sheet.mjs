import { chromium } from "playwright";
import { readdirSync, writeFileSync } from "fs";
import { pathToFileURL } from "url";
const dir = "d:/TukDaeng/Prototypes/screenshots/task-NAV-012/before/sub";
const files = readdirSync(dir).filter(f => f.endsWith(".png"));
const per = 12;
const browser = await chromium.launch();
for (let p = 0; p * per < files.length; p++) {
  const chunk = files.slice(p * per, (p + 1) * per);
  const html = `<body style="margin:0;background:#444;display:grid;grid-template-columns:repeat(6,1fr);gap:6px;width:1500px">${chunk.map(f => `<figure style="margin:0;color:#fff;font:12px sans-serif"><img src="${pathToFileURL(dir + "/" + f).href}" style="width:100%">${f}</figure>`).join("")}</body>`;
  writeFileSync(dir + "/../sheet.html", html);
  const pg = await browser.newPage({ viewport: { width: 1500, height: 900 } });
  await pg.goto(pathToFileURL(dir + "/../sheet.html").href);
  await pg.waitForTimeout(500);
  await pg.screenshot({ path: `${dir}/../sheet${p}.png`, fullPage: true });
  console.log(`sheet${p}:`, chunk.join(","));
}
await browser.close();
