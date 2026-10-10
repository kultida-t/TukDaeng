// Create Post review sheets: generate sheet HTML files + PNG renders
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { writeFileSync, mkdirSync } from "fs";

const BASE_DIR = "C:/Users/Admin/Desktop/TukDaeng/deliverables/create-post-review";
const SEC = `file:///${BASE_DIR}/sections`;
const OUT = `${BASE_DIR}/sheets`;
mkdirSync(OUT, { recursive: true });

const CSS = `
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:"Segoe UI","IBM Plex Sans Thai",Arial,sans-serif;background:#f5f4f0;color:#1b1b1e;padding:34px 40px;width:max-content}
  .head{display:flex;align-items:center;gap:14px;border-bottom:2px solid #1b1b1e;padding-bottom:14px;margin-bottom:16px}
  .chip{background:#c8212b;color:#fff;font-weight:700;font-size:13px;padding:6px 14px;border-radius:6px;letter-spacing:.04em;white-space:nowrap}
  .ttl{font-size:26px;font-weight:800;letter-spacing:.02em}
  .sub{font-size:13px;color:#666;font-weight:600}
  .brand{margin-left:auto;color:#c8212b;font-weight:800;font-size:20px;letter-spacing:.06em}
  .note{background:#ecebe6;border-radius:10px;padding:12px 16px;font-size:13px;line-height:1.7;margin-bottom:20px}
  .note b{color:#c8212b}
  .row{display:flex;gap:26px;align-items:flex-start}
  .opt{flex:0 0 auto}
  .opt-tag{display:inline-block;background:#1b1b1e;color:#fff;font-size:12.5px;font-weight:700;padding:4px 12px;border-radius:6px;margin-bottom:6px}
  .opt-tag.pick{background:#c8212b}
  .opt-desc{font-size:12.5px;color:#555;margin-bottom:10px;line-height:1.5;min-height:56px}
  .opt-imgs{display:flex;gap:14px}
  .fig{text-align:center}
  .fig img{display:block;border-radius:16px;border:1px solid #d8d6cf;box-shadow:0 6px 18px rgba(0,0,0,.12)}
  .fig .cap{font-size:11px;color:#888;margin-top:7px;letter-spacing:.06em;text-transform:uppercase}
  .rowcap{font-size:11px;font-weight:700;color:#1b1b1e;letter-spacing:.04em;margin:4px 0 8px}
  .legend{margin-top:22px;display:flex;gap:26px;flex-wrap:wrap}
  .lg{display:flex;gap:8px;align-items:center;font-size:12.5px;line-height:1.5;white-space:nowrap}
  .lg i{background:#c8212b;color:#fff;font-style:normal;font-weight:700;width:20px;height:20px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0}
  .foot{margin-top:18px;border-top:1px solid #d8d6cf;padding-top:10px;font-size:11px;color:#999;display:flex;justify-content:space-between}
`;

function fig(name, w, cap = null) {
  const c = cap || (name.endsWith("-dark") ? "Dark" : "Light");
  return `<div class="fig"><img src="${SEC}/${name}.png" width="${w}"><div class="cap">${c}</div></div>`;
}
const pair = (name, w) => `<div class="opt-imgs">${fig(name + "-dark", w)}${fig(name + "-light", w)}</div>`;
const opt = (tag, desc, imgs, pick, w) =>
  `<div class="opt" style="width:${w}px"><span class="opt-tag${pick ? " pick" : ""}">${tag}</span><div class="opt-desc">${desc}</div>${imgs}</div>`;
const lg = (n, t) => `<div class="lg"><i>${n}</i><span>${t}</span></div>`;
const sheet = (chip, title, sub, note, row, legend) => `<!doctype html><meta charset="utf-8"><style>${CSS}</style>
  <div class="head"><span class="chip">${chip}</span>
    <div><div class="ttl">${title}</div><div class="sub">${sub}</div></div>
    <span class="brand">TUK DAENG</span>
  </div>
  <div class="note">${note}</div>
  <div class="row">${row}</div>
  <div class="legend">${legend}</div>
  <div class="foot"><span>TukDaeng — Create Post Review (FEED-002)</span><span>for internal review only</span></div>`;

const SUB = "Create Post — หน้าอัปโหลดที่เปิดจากปุ่ม (+) บน Feed · flow แบบ IG · ไม่มีขั้นตอนเลือกประเภท";

const sheets = [
  ["cp-1-flow.png", sheet("SHEET CP-1", "IG two-step flow — picker → caption", SUB,
    `สรุป decision: ปุ่ม (+) บน Feed เปิด <b>"New post"</b> แบบ IG จริง — เลือกรูปจาก Recents → กด <b>Next</b> → หน้า caption + option rows → <b>Post</b> · UI ภาษาอังกฤษ · ไม่บังคับเลือก ขาย/โชว์ สเปก/ราคาเป็น optional เสมอ · หน้าโปรไฟล์ยังใช้ <b>"เพิ่มสินทรัพย์ใหม่"</b> แยกกัน · รองรับ <b>เลือกหลายรูป</b>: กด Select เปิดโหมดหลายรูปบนหน้าเดิม + วงกลมเลขลำดับ`,
    opt("Step 1 · Picker", "hero รูปที่เลือก + Recents grid 4 คอลัมน์ + ปุ่ม Select + tab bar Post/Clip — เหมือน IG picker",
      pair("f2-picker", 186), true, 386) +
    opt("Multi-select", "กด Select: วงกลมโผล่บนทุก cell แตะเลือกหลายรูปตามลำดับ — หน้าจอเดิม Next ไปต่อได้เลย",
      pair("f2-selmode", 186), true, 386) +
    opt("Step 2 · Caption", "แถวรูปที่เลือกเลื่อนข้างได้ + \"Add a caption…\" + option rows + ปุ่ม Post ล่าง — เหมือน IG share page",
      pair("f2-caption", 186), true, 386) +
    opt("Empty", "ตอนเพิ่งกด (+) ยังไม่เลือกรูป — Next ยังจาง",
      pair("f2-picker-empty", 186), false, 386),
    lg(1, "interactive ได้ใน prototype — เลือก/ยกเลิกรูป กด Next สไลด์ไปหน้า caption จริง") +
    lg(2, "option rows: Add price / Watch details / Condition — optional ทั้งหมด") +
    lg(3, "toggle \"Also save to My Assets\" = สะพานไปฟอร์มเต็มในโปรไฟล์")
  )],
];

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 2 });
for (const [file, html] of sheets) {
  const htmlpath = `${OUT}/${file.replace(".png", ".html")}`;
  writeFileSync(htmlpath, html);
  await page.goto(`file:///${htmlpath}`);
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: `${OUT}/${file}`, fullPage: true });
  console.log(file);
}
await browser.close();
console.log("done");
