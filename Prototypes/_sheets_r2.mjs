// Round-2 review sheets: generate sheet HTML files + PNG renders
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { writeFileSync, mkdirSync } from "fs";

const BASE_DIR = "C:/Users/Admin/Desktop/TukDaeng/deliverables/feed-redesign-review/round2";
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
  .opt-desc{font-size:12.5px;color:#555;margin-bottom:10px;line-height:1.5;min-height:38px}
  .opt-imgs{display:flex;gap:14px}
  .fig{text-align:center}
  .fig img{display:block;border-radius:16px;border:1px solid #d8d6cf;box-shadow:0 6px 18px rgba(0,0,0,.12)}
  .fig .cap{font-size:11px;color:#888;margin-top:7px;letter-spacing:.06em;text-transform:uppercase}
  .rowcap{font-size:11px;font-weight:700;color:#1b1b1e;letter-spacing:.04em;margin:4px 0 8px}
  .rowcap + .rowcap, .opt-imgs + .rowcap.r2 {margin-top:16px}
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
const twoRows = (n1, n2, w, cap1, cap2) =>
  `<div class="rowcap">${cap1}</div>${pair(n1, w)}<div class="rowcap" style="margin-top:16px">${cap2}</div>${pair(n2, w)}`;
const threeRows = (n1, n2, n3, w, cap1, cap2, cap3) =>
  `<div class="rowcap">${cap1}</div>${pair(n1, w)}<div class="rowcap" style="margin-top:16px">${cap2}</div>${pair(n2, w)}<div class="rowcap" style="margin-top:16px">${cap3}</div>${pair(n3, w)}`;
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
  <div class="foot"><span>TukDaeng — Feed Redesign Review (Round 2)</span><span>for internal review only</span></div>`;

const SUB = "Feed Redesign — IG-style social feed for watch collectors (Round 2)";

const sheets = [
  ["r2-1-selection.png", sheet("SHEET R2-1", "Round 1 Selection — ที่พี่คิงเลือกไว้", SUB,
    `ชุดเลือกที่พี่คิงรีวิวและตัดสินใจไว้จากรอบ 1 — ใช้เป็น <b>default ปัจจุบัน</b> ของ prototype: <b>A1 · T3 · D2 · K1 · F2c · N1</b> (ปุ่มสลับ variant ทุกกลุ่มยังคงไว้ใน prototype กลับไปเทียบได้เสมอ)`,
    opt("A1 + F2c + K1 — Feed", "Flat IG layout · ซ่อนราคา/สเปกใน expander · chips tab กึ่งกลาง · Ask outline pill", pair("combo-feed", 220), true, 454) +
    opt("T3 + D2 — Details expander", "hairline trigger \"Tap for details\" · list rows label ซ้าย / ค่า ขวา", pair("combo-details", 220), true, 454) +
    opt("N1 + Detail page", "bottom nav มี label · หน้า Detail: hero + counter + FOR SALE + seller + ราคา", pair("combo-detail", 220), true, 454),
    lg(1, "A1 — Flat / hidden price") + lg(2, "T3 — Hairline text trigger") + lg(3, "D2 — List rows") + lg(4, "K1 — Outline pill") +
    lg(5, "F2c — Chips centered (tab แรกเปลี่ยนเป็น \"All Posts\")") + lg(6, "N1 — With labels (รอบ 2 ปรับเป็น floating pill — Sheet R2-2)")
  )],
  ["r2-2-changes.png", sheet("SHEET R2-2", "Round 2 Changes — แก้ตาม feedback พี่คิง", SUB,
    `สิ่งที่ปรับในรอบ 2 ตาม feedback: โครงหลักคงเดิม เปลี่ยน nav / label / ลำดับ section หน้า Detail / ข้อมูล spec ให้สมบูรณ์ และเก็บ UI ที่ซ้ำซ้อนออก`,
    opt("N1 — Floating pill nav", "bottom nav เป็น pill โปร่งลอยเหนือ content (backdrop blur) + tab \"All\" → \"All Posts\"", pair("nav-floating", 220), false, 454) +
    opt("Detail — engagement + header", "ย้าย like/comment/view/share ขึ้นใต้ photo dots ก่อน FOR SALE · เอาปุ่มไลค์ซ้ำบน header ออก", pair("combo-detail", 220), false, 454) +
    opt("Spec groups — 3 กลุ่ม", "Watch Specifications 20 ฟิลด์ / Item Details 4 / Price &amp; Data Source 4 — แสดงทั้ง feed expander และ Detail", pair("ds-full", 220), false, 454),
    lg(1, "N1 เปลี่ยนจากแถบติดขอบล่าง → pill โปร่งลอย (iOS-style) — content เลื่อนทะลุใต้ nav ได้") +
    lg(2, "ปุ่มไลค์บน detail header ซ้ำกับปุ่มใต้รูป — เอาออก เหลือ back + ⋯") +
    lg(3, "ปรับ spacing / ขนาดฟอนต์ / สี active tab ให้จืดลงตามที่รีวิว")
  )],
  ["r2-3-detail-specs.png", sheet("SHEET R2-3", "Detail Specs — DS1–DS5 วิธีแสดงกลุ่ม spec", SUB,
    `ข้อมูล 3 กลุ่ม (Watch Specifications / Item Details / Price &amp; Data Source) เหมือนกันทุกแบบ — เลือกแค่ <b>วิธีจัดกลุ่มแสดงผล</b> ใช้ renderer เดียวกันทั้ง feed expander และหน้า Detail`,
    opt("DS1 — Full list", "หัวกลุ่มตัวเล็กเทา + rows ต่อเนื่อง — ตรงไปตรงมา เห็นทุกอย่างเลื่อนเดียว", twoRows("ds-full", "ds-full-2", 150, "Top — Watch Specs", "Scrolled — Item Details + Pricing"), true, 314) +
    opt("DS2 — Accordion", "กลุ่มละ collapsible — ประหยัดพื้นที่ กลุ่มที่ไม่สนใจพับเก็บ", twoRows("ds-acc", "ds-acc-closed", 150, "First group open", "All collapsed"), false, 314) +
    opt("DS3 — Grouped cards", "การ์ด surface ละกลุ่ม — แยกส่วนชัดเจน อ่านทีละใบ", twoRows("ds-cards", "ds-cards-2", 150, "Card 1 — Watch Specs", "Scrolled — Item Details + Pricing"), false, 314) +
    opt("DS4 — Tab switcher", "pill tabs 3 กลุ่ม เห็นทีละกลุ่ม — กระชับ แต่เทียบข้ามกลุ่มไม่ได้", twoRows("ds-tabs", "ds-tabs-pricing", 150, "Tab: Watch Specs", "Tab: Pricing"), false, 314) +
    opt("DS5 — Segmented bar", "เหมือน DS4 แต่มุมเหลี่ยมกว่า เติมเต็มแถบ — สลับกลุ่มเร็ว", twoRows("ds-seg", "ds-seg-pricing", 150, "Tab: Watch Specs", "Tab: Pricing"), false, 314),
    lg(1, "DS1 เป็น default ปัจจุบัน (เลือกไว้ชั่วคราว รอตัดสินใจ)") +
    lg(2, "DS4/DS5 แสดงทีละกลุ่ม — tab ที่เห็นคือ Watch Specs / Item Details / Pricing")
  )],
  ["r2-4-feed-specs.png", sheet("SHEET R2-4", "Feed Expander — DS1–DS5 spec บน expander ของ Feed", SUB,
    `renderer ชุดเดียวกับ Sheet R2-3 แต่แสดงใน <b>details expander ของ post บน Feed</b> (T3 hairline trigger \"Tap for details\") — spec อยู่ใต้ caption/เวลาโพสต์ พื้นหลัง surface เดียวกับ card ของ expander`,
    opt("DS1 — Full list", "หัวกลุ่มตัวเล็กเทา + rows ใน expander — อ่านต่อเนื่องได้เลยไม่ต้องแตะเพิ่ม", twoRows("ds-full-feed", "ds-full-pricing-feed", 150, "Top — Watch Specs", "Scrolled — Item Details + Pricing"), true, 314) +
    opt("DS2 — Accordion", "กลุ่มละ collapsible ใน expander — พับกลุ่มยาวๆ เก็บได้ เห็นภาพรวมก่อน", twoRows("ds-acc-feed", "ds-acc-closed-feed", 150, "First group open", "All collapsed"), false, 314) +
    opt("DS3 — Grouped cards", "การ์ดย่อยละกลุ่มซ้อนใน expander card — เลเยอร์ซ้อนเลเยอร์", twoRows("ds-cards-feed", "ds-cards-pricing-feed", 150, "Card 1 — Watch Specs", "Scrolled — Item Details + Pricing"), false, 314) +
    opt("DS4 — Tab switcher", "pill tabs เห็นทีละกลุ่มใน expander — กระชับ แต่เพิ่มการแตะ", twoRows("ds-tabs-feed", "ds-tabs-pricing-feed", 150, "Tab: Watch Specs", "Tab: Pricing"), false, 314) +
    opt("DS5 — Segmented bar", "segmented bar ใน expander — เหมือน DS4 มุมเหลี่ยมกว่า เติมเต็มแถบ", twoRows("ds-seg-feed", "ds-seg-pricing-feed", 150, "Tab: Watch Specs", "Tab: Pricing"), false, 314),
    lg(1, "DS1 เป็น default ปัจจุบัน (เลือกไว้ชั่วคราว รอตัดสินใจ)") +
    lg(2, "expander มีขนาดเล็กกว่าหน้า Detail — header กลุ่ม/ตัวอักษรย่อลงตาม context")
  )],
  ["r2-5-detail-price.png", sheet("SHEET R2-5", "Detail Price — PR1–PR4 ตำแหน่งการวางราคา", SUB,
    `เทียบตำแหน่งวางราคาบนหน้า Detail — ทุกแบบยังมีกลุ่ม <b>Price &amp; Data Source</b> (asking / est. market / update / source) ใน spec ด้านล่างเหมือนเดิม`,
    opt("PR1 — Hero below seller", "ราคาตัวใหญ่ 26px ใต้ seller row — เด่นสุด เหมือน marketplace ทั่วไป (default ปัจจุบัน)", pair("pr-pr1", 168), true, 350) +
    opt("PR2 — Tag line (right)", "ราคาขวามือ บรรทัดเดียวกับ tag FOR SALE — ตัวเล็ก 15px จืด ไม่แย่งชื่อเรือน", pair("pr-pr2", 168), false, 350) +
    opt("PR3 — Price tag pill", "pill ราคาข้างป้าย FOR SALE anatomy เดียวกับ tag — เหมือนป้ายติดราคา", pair("pr-pr3", 168), false, 350) +
    opt("PR4 — Hidden (specs only)", "ไม่มีราคาเด่นเลย — ผู้ใช้เลื่อนลงดูในกลุ่ม Price &amp; Data Source", `<div class="opt-imgs">${fig("pr-pr4-dark", 168, "Top — no price")}${fig("pr-pr4-specs-dark", 168, "Spec group")}</div>`, false, 350),
    lg(1, "PR3/PR4 ทำให้พื้นที่บนสะอาด แต่ผู้ใช้ต้องเลื่อนหาราคาเอง") +
    lg(2, "สลับได้ทุกแบบใน prototype — ไม่กระทบตำแหน่งราคาใน feed")
  )],
  ["r2-6-detail-header.png", sheet("SHEET R2-6", "Detail Header — DH1–DH5 รูปแบบ header", SUB,
    `เทียบรูปแบบ header หน้า Detail — ทุกแบบมี back + เมนู ⋯ ครบ (เอาปุ่มไลค์ซ้ำออกแล้วจากทุกแบบ)`,
    opt("DH1 — Back + title", "back + \"Detail\" ชิดซ้าย + ⋯ — แบบเดิม (default ปัจจุบัน)", pair("dh-dh1", 150), true, 314) +
    opt("DH2 — No title", "back + ⋯ เท่านั้น — minimal แบบ IG post detail", pair("dh-dh2", 150), false, 314) +
    opt("DH3 — Title centered", "\"Detail\" กึ่งกลางแถบ — app bar มาตรฐาน สมมาตร", pair("dh-dh3", 150), false, 314) +
    opt("DH4 — Floating on photo", "ไม่มีแถบ header — ปุ่มวงกลมจาง blur ลอยบนรูป รูปเต็มจอ immersive", pair("dh-dh4", 150), false, 314) +
    opt("DH5 — Seller name", "back + avatar + ชื่อผู้ขาย + ⋯ — มี context ว่ากำลังดูของใคร (แบบ IG)", pair("dh-dh5", 150), false, 314),
    lg(1, "DH4: photo counter เลื่อนลงไม่ชนปุ่มลอย — back ทำงานได้ทุกแบบ") +
    lg(2, "DH5 เหมาะถ้าอยากให้ context ผู้ขายติดตาแม้เลื่อนไม่ได้ — แต่ซ้ำกับ seller row ด้านล่าง")
  )],
  ["r2-7-missing-data.png", sheet("SHEET R2-7", "Edge Case — ข้อมูล spec ไม่ครบ แสดง N/A", SUB,
    `กรณีโพสต์ที่ spec ไม่ครบ — ฟิลด์ที่ไม่มีข้อมูลแสดง <b>N/A</b> แต่<b>จำนวนแถวเท่าเดิม</b> (ไม่ตัดแถวทิ้ง) ตัวอย่าง: Post 2 Tudor Black Bay 41 — Thickness / Lug-to-Lug / Dial Pattern / Est. Market Price เป็น N/A`,
    opt("Post 1 — ข้อมูลครบ", "Rolex Submariner — ทุกฟิลด์มีค่า (อ้างอิงเทียบ)", twoRows("na-detail-p1", "ds-full-2", 220, "Watch Specs", "Item Details + Price"), false, 454) +
    opt("Post 2 — Detail: N/A", "Tudor Black Bay — ฟิลด์ว่างแสดง N/A แถวยังอยู่ครบเรียงเหมือนเดิม", twoRows("na-detail", "na-detail-2", 220, "Watch Specs — N/A rows", "Item Details + Price (Est. Market = N/A)"), false, 454) +
    opt("Post 2 — Feed expander", "ข้อมูลชุดเดียวกันแสดงใน expander ของ feed — N/A เหมือนกัน", twoRows("na-feed", "na-feed-2", 220, "Watch Specs — N/A rows", "Item Details + Price (Est. Market = N/A)"), false, 454),
    lg(1, "ลิสต์ spec ยัง 20+4+4 แถวเท่าเดิมทุกโพสต์ — ขาดข้อมูลแสดง N/A ไม่ซ่อนแถว") +
    lg(2, "N/A ทำงานได้ทุก DS/PR/DH variant — โครง row เดียวกันแค่ค่าว่าง")
  )],
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1900, height: 1200 }, deviceScaleFactor: 3 });
for (const [png, html] of sheets) {
  const htmlPath = `${OUT}/${png.replace(".png", ".html")}`;
  writeFileSync(htmlPath, html, "utf8");
  await page.goto(`file:///${htmlPath}`);
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(400);
  await page.locator("body").screenshot({ path: `${OUT}/${png}` });
  console.log(png);
}
await browser.close();
console.log("done");
