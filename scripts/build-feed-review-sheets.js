// Build manual-style review sheets for feed redesign options.
// Reads captured PNGs from deliverables/feed-redesign-review/sections/
// and emits composed sheets to deliverables/feed-redesign-review/sheets/
// Usage: node scripts/build-feed-review-sheets.js

const { chromium } = require("playwright");
const { mkdirSync, writeFileSync } = require("fs");
const { join } = require("path");

const SEC = join(__dirname, "..", "deliverables", "feed-redesign-review", "sections");
const OUT = join(__dirname, "..", "deliverables", "feed-redesign-review", "sheets");
mkdirSync(OUT, { recursive: true });

const css = `
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:"Segoe UI","IBM Plex Sans Thai",Arial,sans-serif;background:#f5f4f0;color:#1b1b1e;padding:30px 36px;width:max-content}
  .head{display:flex;align-items:center;gap:14px;border-bottom:2px solid #1b1b1e;padding-bottom:12px;margin-bottom:14px}
  .chip{background:#c8212b;color:#fff;font-weight:700;font-size:13px;padding:6px 14px;border-radius:6px;letter-spacing:.04em;white-space:nowrap}
  .ttl{font-size:25px;font-weight:800;letter-spacing:.02em}
  .sub{font-size:13px;color:#666;font-weight:600}
  .brand{margin-left:auto;color:#c8212b;font-weight:800;font-size:20px;letter-spacing:.06em}
  .note{background:#ecebe6;border-radius:10px;padding:10px 16px;font-size:13px;line-height:1.7;margin-bottom:18px}
  .note b{color:#c8212b}
  .row{display:flex;gap:30px;align-items:flex-start}
  .opt{flex:0 0 auto}
  .opt-tag{display:inline-block;background:#1b1b1e;color:#fff;font-size:12.5px;font-weight:700;padding:4px 12px;border-radius:6px;margin-bottom:6px}
  .opt-desc{font-size:12.5px;color:#555;margin-bottom:10px;width:460px;min-height:38px;line-height:1.5}
  .opt-imgs{display:flex;gap:14px}
  .opt-imgs.sub{margin-top:14px}
  .fig{text-align:center}
  .fig img{display:block;border-radius:14px;border:1px solid #d8d6cf;box-shadow:0 5px 14px rgba(0,0,0,.12)}
  .fig .cap{font-size:11px;color:#888;margin-top:6px;letter-spacing:.06em;text-transform:uppercase}
  .legend{margin-top:20px;border-top:1px solid #d8d6cf;padding-top:12px}
  .lg{display:flex;gap:10px;align-items:center;font-size:12.5px;line-height:1.6;padding:3px 0}
  .lg i{background:#c8212b;color:#fff;font-style:normal;font-weight:700;width:19px;height:19px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0}
  .foot{margin-top:12px;border-top:1px solid #e4e2dc;padding-top:8px;font-size:11px;color:#999;display:flex;justify-content:space-between}
`;

function figImg(src, w, cap) {
  return `<div class="fig"><img src="${src}" width="${w}"><div class="cap">${cap}</div></div>`;
}

function sheetHTML(chip, title, note, options, legend, phoneW = 210) {
  return `<!doctype html><meta charset="utf-8"><style>${css}</style>
  <div class="head"><span class="chip">${chip}</span>
    <div><div class="ttl">${title}</div><div class="sub">Feed Redesign — IG-style social feed for watch collectors</div></div>
    <span class="brand">TUK DAENG</span>
  </div>
  <div class="note">${note}</div>
  <div class="row">${options.map(o => `
    <div class="opt">
      <span class="opt-tag">${o.tag}</span>
      <div class="opt-desc">${o.desc}</div>
      <div class="opt-imgs">${o.imgs.map(i => figImg(i.src, i.w || phoneW, i.cap)).join("")}</div>
      ${o.imgs2 ? `<div class="opt-imgs sub">${o.imgs2.map(i => figImg(i.src, i.w || phoneW, i.cap)).join("")}</div>` : ""}
    </div>`).join("")}</div>
  ${legend ? `<div class="legend">${legend.map((t, i) => `<div class="lg"><i>${i + 1}</i><span>${t}</span></div>`).join("")}</div>` : ""}
  <div class="foot"><span>TukDaeng — Feed Redesign Review</span><span>for internal review only</span></div>`;
}

function pairOpt(tag, desc, base) {
  return {
    tag, desc,
    imgs: [
      { src: `${base}-dark.png`, cap: "Dark" },
      { src: `${base}-light.png`, cap: "Light" },
    ],
  };
}

const SHEETS = [
  {
    file: "s1-feed-flat.png",
    chip: "SHEET 1",
    title: "Feed Layout — Flat (IG style)",
    note: "รูปเต็มขอบจอไม่มีการ์ด เหมือน IG จริง — ต่างกันที่<b>วิธีแสดงราคา</b>: ซ่อนหลัง Tap for details / overlay chip บนรูป / บรรทัดเทาใต้ caption",
    options: [
      pairOpt("ตัวเลือก A1 — Flat · ซ่อนราคา", "ราคาและ spec ซ่อนทั้งหมดหลัง “Tap for details” — สะอาดสุด เหมือน social feed 100%", "layouts/a1"),
      pairOpt("ตัวเลือก A2 — Flat · overlay", "ราคาลอยบนรูปมุมซ้ายล่าง (glass chip) + ปุ่ม Ask Seller แดง — เห็นราคาแต่ยัง social", "layouts/a2"),
      pairOpt("ตัวเลือก A3 — Flat · quiet price", "ราคาเป็นบรรทัดเทาเล็กใต้ caption — เห็นแต่ไม่เด่น", "layouts/a3"),
    ],
    legend: [
      "A1 = ซ่อนราคาสนิท ผู้ใช้ต้องกด Tap for details ถึงเห็น",
      "A2 = ราคา overlay บนรูป + CTA แดง (ยังเก็บ mood โซเชียล)",
      "A3 = ราคาเป็นตัวหนังสือเทา เงียบสุดของกลุ่มที่โชว์ราคา",
    ],
  },
  {
    file: "s2-feed-card.png",
    chip: "SHEET 2",
    title: "Feed Layout — Rounded Card (photo inset)",
    note: "โพสต์อยู่ในการ์ดโค้งมนชัดเจน รูปมีขอบรอบ (inset) — ต่างกันที่<b>วิธีแสดงราคา</b>เหมือนชุด A",
    options: [
      pairOpt("ตัวเลือก B1 — Card · ซ่อนราคา", "การ์ดมน + รูป inset มีขอบ — ราคาซ่อนหลัง Tap for details", "layouts/b1"),
      pairOpt("ตัวเลือก B2 — Card · overlay", "การ์ดมน + รูป inset — ราคา overlay chip บนรูป + Ask Seller แดง", "layouts/b2"),
      pairOpt("ตัวเลือก B3 — Card · footer", "การ์ดมน + รูป inset — แถบราคาอยู่ท้ายการ์ดแยกจากเนื้อ", "layouts/b3"),
    ],
    legend: [
      "การ์ดช่วยแยกโพสต์ชัดเจน แต่รูป inset จะเล็กลงกว่าแบบ flat",
      "B3 มีแถบราคาใต้ caption เหมือน marketplace เล็กน้อยแต่ยังเงียบ",
    ],
  },
  {
    file: "s3-feed-edge.png",
    chip: "SHEET 3",
    title: "Feed Layout — Rounded Card (photo flush)",
    note: "การ์ดโค้งมนแต่<b>รูปชนขอบการ์ด</b> (มุมบนโค้งตามการ์ด) — ได้ทั้งกรอบชัดและรูปใหญ่",
    options: [
      pairOpt("ตัวเลือก C1 — Edge card · ซ่อนราคา", "การ์ดมน + รูปชนขอบ — ราคาซ่อนหลัง Tap for details", "layouts/c1"),
      pairOpt("ตัวเลือก C2 — Edge card · overlay", "การ์ดมน + รูปชนขอบ — ราคา overlay chip + Ask Seller แดง", "layouts/c2"),
      pairOpt("ตัวเลือก C3 — Edge card · footer", "การ์ดมน + รูปชนขอบ — แถบราคาท้ายการ์ด", "layouts/c3"),
    ],
    legend: [
      "รูปใหญ่เกือบเท่า flat แต่ยังมีขอบการ์ดแยกโพสต์",
      "เหมาะถ้าอยากได้ทั้งความชัดของโพสต์และ IG feel",
    ],
  },
  {
    file: "s4-feed-tabs.png",
    chip: "SHEET 4",
    phoneW: 158,
    title: "Feed Tabs — แถบ All / Following / Favorites",
    note: "วิธีแสดงตัวกรองฟีดใต้ header — ตั้งแต่ text tabs แบบ IG/Threads จนถึงไม่มี tab เลย (แถวล่าง = zoom เฉพาะแถบ)",
    options: [
      {
        tag: "F1 — Text · left", desc: "ข้อความ + เส้นแดงใต้ active ชิดซ้าย — convention ของโซเชียล (Threads/X/YouTube)",
        imgs: [{ src: "tabs/text-dark-ctx.png", cap: "Dark" }, { src: "tabs/text-light-ctx.png", cap: "Light" }],
        imgs2: [{ src: "tabs/text-dark.png", w: 160, cap: "Dark · zoom" }, { src: "tabs/text-light.png", w: 160, cap: "Light · zoom" }],
      },
      {
        tag: "F1c — Text · centered", desc: "แบบเดียวกับ F1 แต่จัดกลาง — ดู formal กว่า แนว nav bar เว็บ",
        imgs: [{ src: "tabs/textc-dark-ctx.png", cap: "Dark" }, { src: "tabs/textc-light-ctx.png", cap: "Light" }],
        imgs2: [{ src: "tabs/textc-dark.png", w: 160, cap: "Dark · zoom" }, { src: "tabs/textc-light.png", w: 160, cap: "Light · zoom" }],
      },
      {
        tag: "F2 — Chips · left", desc: "pill chip ชิดซ้าย — convention ของ filter row (YouTube) บอกว่าเลื่อนได้",
        imgs: [{ src: "tabs/chips-dark-ctx.png", cap: "Dark" }, { src: "tabs/chips-light-ctx.png", cap: "Light" }],
        imgs2: [{ src: "tabs/chips-dark.png", w: 160, cap: "Dark · zoom" }, { src: "tabs/chips-light.png", w: 160, cap: "Light · zoom" }],
      },
      {
        tag: "F2c — Chips · centered", desc: "chip จัดกลาง — บาลานซ์สวยเมื่อมีแค่ 3 ตัว แต่ดูไม่ใช่ filter row ทั่วไป",
        imgs: [{ src: "tabs/chipsc-dark-ctx.png", cap: "Dark" }, { src: "tabs/chipsc-light-ctx.png", cap: "Light" }],
        imgs2: [{ src: "tabs/chipsc-dark.png", w: 160, cap: "Dark · zoom" }, { src: "tabs/chipsc-light.png", w: 160, cap: "Light · zoom" }],
      },
      {
        tag: "F3 — Segmented", desc: "กรอบโค้งก้อนเดียว active เป็น pill ลอย — แนว iOS segment (เต็มกว้างอยู่แล้ว)",
        imgs: [{ src: "tabs/segment-dark-ctx.png", cap: "Dark" }, { src: "tabs/segment-light-ctx.png", cap: "Light" }],
        imgs2: [{ src: "tabs/segment-dark.png", w: 160, cap: "Dark · zoom" }, { src: "tabs/segment-light.png", w: 160, cap: "Light · zoom" }],
      },
      {
        tag: "F4 — None (pure IG)", desc: "ไม่แสดง tab — โพสต์ต่อจาก header เลย ตรง IG แท้ / แถวล่าง: กด wordmark ▾ เปิดเมนูเลือก feed",
        imgs: [{ src: "tabs/none-dark-ctx.png", cap: "Dark" }, { src: "tabs/none-light-ctx.png", cap: "Light" }],
        imgs2: [{ src: "tabs/none-dark-menu.png", w: 158, cap: "Dark · menu open" }, { src: "tabs/none-light-menu.png", w: 158, cap: "Light · menu open" }],
      },
    ],
    legend: [
      "F4 ตรง IG ที่สุด — IG ซ่อน Following/Favorites ไว้ใน dropdown ที่โลโก้",
      "Left-aligned = convention ของ social feed ส่วน Centered ดู formal กว่า เหมือน nav bar",
      "F1–F3 ช่วยให้คนพบตัวกรองง่ายกว่า แต่กินพื้นที่แนวตั้ง 1 แถว",
    ],
  },
  {
    file: "s5-ask-button.png",
    chip: "SHEET 5",
    phoneW: 158,
    title: "Ask Button — ปุ่มทักผู้ขายบน action row",
    note: "รูปแบบปุ่ม Ask/Quick Ask บนแถว action — ตั้งแต่ outline เบาๆ จนถึง solid แดงเด่น (แถวล่าง = zoom เฉพาะ action row)",
    options: [
      {
        tag: "K1 — Outline pill", desc: "pill ขอบเทา + ไอคอน chat — soft ไม่ตะโกน กลืนกับ action row",
        imgs: [{ src: "ask/outline-dark-ctx.png", cap: "Dark" }, { src: "ask/outline-light-ctx.png", cap: "Light" }],
        imgs2: [{ src: "ask/outline-dark.png", w: 160, cap: "Dark · zoom" }, { src: "ask/outline-light.png", w: 160, cap: "Light · zoom" }],
      },
      {
        tag: "K2 — Solid red", desc: "pill แดงเต็ม — CTA ชัดสุด เหมาะเน้นขาย แต่กินสายตาจากรูป",
        imgs: [{ src: "ask/solid-dark-ctx.png", cap: "Dark" }, { src: "ask/solid-light-ctx.png", cap: "Light" }],
        imgs2: [{ src: "ask/solid-dark.png", w: 160, cap: "Dark · zoom" }, { src: "ask/solid-light.png", w: 160, cap: "Light · zoom" }],
      },
      {
        tag: "K3 — Text link", desc: "ข้อความ Ask แดงล้วนไม่มีกรอบ — เบาสุด ดูเป็น action เล็กๆ",
        imgs: [{ src: "ask/txt-dark-ctx.png", cap: "Dark" }, { src: "ask/txt-light-ctx.png", cap: "Light" }],
        imgs2: [{ src: "ask/txt-dark.png", w: 160, cap: "Dark · zoom" }, { src: "ask/txt-light.png", w: 160, cap: "Light · zoom" }],
      },
      {
        tag: "K4 — Icon only", desc: "ไอคอน chat ล้วนไม่มีคำ — IG สุด แต่คนอาจไม่รู้ว่าเป็นปุ่มทักขาย",
        imgs: [{ src: "ask/ico-dark-ctx.png", cap: "Dark" }, { src: "ask/ico-light-ctx.png", cap: "Light" }],
        imgs2: [{ src: "ask/ico-dark.png", w: 160, cap: "Dark · zoom" }, { src: "ask/ico-light.png", w: 160, cap: "Light · zoom" }],
      },
    ],
    legend: [
      "ใน prototype เลือก K0 · Auto ได้ — ให้ layout ที่ซ่อนราคาใช้ outline, ที่ overlay ราคาใช้ solid อัตโนมัติ",
      "Solid แดงจะแย่งความเด่นกับรูปนาฬิกา — ถ้าอยากได้ IG feel จริงๆ แนะนำ outline/text",
    ],
  },
  {
    file: "s6-details-trigger.png",
    chip: "SHEET 6",
    phoneW: 330,
    title: "Details Trigger — วิธีกดกาง spec ย่อ",
    note: "สามแบบของปุ่ม “Tap for details” บนฟีด — ทุกแบบกดกาง/หุบได้ในฟีดโดยไม่เปลี่ยนหน้า (แถวล่าง = zoom เฉพาะปุ่ม)",
    options: [
      {
        tag: "T1 — Bar", desc: "แถบปุ่มเต็มกว้าง ชัดเจนสุด เหมาะ discoverability",
        imgs: [{ src: "trigger/t1-dark-ctx.png", cap: "Dark" }, { src: "trigger/t1-light-ctx.png", cap: "Light" }],
        imgs2: [{ src: "trigger/t1-dark.png", cap: "Dark · zoom" }, { src: "trigger/t1-light.png", cap: "Light · zoom" }],
      },
      {
        tag: "T2 — Line + knob", desc: "เส้นขีดสองข้าง + วงกลม chevron กลาง — ตาม sketch ที่วาดไว้",
        imgs: [{ src: "trigger/t2-dark-ctx.png", cap: "Dark" }, { src: "trigger/t2-light-ctx.png", cap: "Light" }],
        imgs2: [{ src: "trigger/t2-dark.png", cap: "Dark · zoom" }, { src: "trigger/t2-light.png", cap: "Light · zoom" }],
      },
      {
        tag: "T3 — Hairline text", desc: "ข้อความคั่นเส้นบาง minimal สุด ดูซอฟต์",
        imgs: [{ src: "trigger/t3-dark-ctx.png", cap: "Dark" }, { src: "trigger/t3-light-ctx.png", cap: "Light" }],
        imgs2: [{ src: "trigger/t3-dark.png", cap: "Dark · zoom" }, { src: "trigger/t3-light.png", cap: "Light · zoom" }],
      },
    ],
    legend: [
      "กางแล้ว chevron หมุนและข้อความเปลี่ยนเป็น Hide details",
      "กดที่กล่อง spec (View full detail ›) เพื่อเข้าหน้า Detail เต็ม",
    ],
  },
  {
    file: "s7-details-content.png",
    chip: "SHEET 7",
    phoneW: 330,
    title: "Details Content — spec ย่อเมื่อกาง",
    note: "รูปแบบเนื้อในกล่อง spec ย่อเมื่อกาง (Layer 2) — แสดง Brand/Model/Ref/Year/Condition/Delivery/Case size + ราคา (แถวล่าง = zoom เฉพาะกล่อง)",
    options: [
      {
        tag: "D1 — Spec tiles", desc: "tile grid 2 คอลัมน์ label บน/ค่าล่าง — เหมือน Technical section ของ asset detail",
        imgs: [{ src: "content/d1-dark-ctx.png", cap: "Dark" }, { src: "content/d1-light-ctx.png", cap: "Light" }],
        imgs2: [{ src: "content/d1-dark.png", cap: "Dark · zoom" }, { src: "content/d1-light.png", cap: "Light · zoom" }],
      },
      {
        tag: "D2 — List rows", desc: "label ซ้าย / ค่า ขวา คั่นเส้นบาง — อ่านเร็วเป็นระเบียบ",
        imgs: [{ src: "content/d2-dark-ctx.png", cap: "Dark" }, { src: "content/d2-light-ctx.png", cap: "Light" }],
        imgs2: [{ src: "content/d2-dark.png", cap: "Dark · zoom" }, { src: "content/d2-light.png", cap: "Light · zoom" }],
      },
      {
        tag: "D3 — Chips", desc: "chip โปรยกะทัดรัด — เบาสุด แต่สแกนข้อมูลเจาะจงช้ากว่า",
        imgs: [{ src: "content/d3-dark-ctx.png", cap: "Dark" }, { src: "content/d3-light-ctx.png", cap: "Light" }],
        imgs2: [{ src: "content/d3-dark.png", cap: "Dark · zoom" }, { src: "content/d3-light.png", cap: "Light · zoom" }],
      },
    ],
    legend: [
      "D1/D2 ตำแหน่ง field คงที่ จำได้ง่ายตามสรุปประชุม",
      "field ที่ไม่มีข้อมูลจะแสดง n/a (ดูตัวอย่าง Tudor → Movement)",
    ],
  },
  {
    file: "s8-bottom-nav.png",
    chip: "SHEET 8",
    phoneW: 200,
    title: "Bottom Nav — เมนูล่าง",
    note: "เปรียบเทียบ bottom nav แบบมี label ใต้ไอคอน vs ไอคอนล้วนแบบ IG (แถวล่าง = zoom เฉพาะ nav)",
    options: [
      {
        tag: "N1 — With labels", desc: "ไอคอน + ชื่อเมนู — เดาเมนูง่าย ปลอดภัยกว่าสำหรับผู้ใช้ทั่วไป",
        imgs: [{ src: "nav/labeled-dark-ctx.png", cap: "Dark" }, { src: "nav/labeled-light-ctx.png", cap: "Light" }],
        imgs2: [{ src: "nav/labeled-dark.png", w: 200, cap: "Dark · zoom" }, { src: "nav/labeled-light.png", w: 200, cap: "Light · zoom" }],
      },
      {
        tag: "N2 — Icons only (IG)", desc: "ไอคอนล้วนแบบ IG — สะอาดกว่า แต่ต้องจำตำแหน่ง",
        imgs: [{ src: "nav/icons-dark-ctx.png", cap: "Dark" }, { src: "nav/icons-light-ctx.png", cap: "Light" }],
        imgs2: [{ src: "nav/icons-dark.png", w: 200, cap: "Dark · zoom" }, { src: "nav/icons-light.png", w: 200, cap: "Light · zoom" }],
      },
    ],
    legend: [
      "badge แจ้งเตือน (Chat 1, Alerts 9) ยังแสดงทั้งสองแบบ",
      "home indicator เส้นล่างคือ system bar ของมือถือ ไม่ใช่ UI แอป",
    ],
  },
  {
    file: "s9-detail.png",
    chip: "SHEET 9",
    phoneW: 200,
    title: "Detail Page — Layer 3 + Comments",
    note: "หน้ารายละเอียดเต็มเมื่อกดจากกล่อง spec ย่อ — hero slider (ไม่มี thumbnail row), Descriptions → Technical (label ซ้าย/ค่า ขวา + n/a), ไม่มี sticky price bar, comments เปิดเป็น bottom sheet",
    options: [
      {
        tag: "Detail · Top", desc: "hero รูปเต็มตา + counter 1/3 + FOR SALE tag + action row + seller + ราคา inline",
        imgs: [{ src: "detail/top-dark.png", cap: "Dark" }, { src: "detail/top-light.png", cap: "Light" }],
      },
      {
        tag: "Detail · Specs", desc: "Descriptions ก่อน แล้ว Technical — field ไม่มีข้อมูลแสดง n/a ตำแหน่งคงที่",
        imgs: [{ src: "detail/specs-dark.png", cap: "Dark" }, { src: "detail/specs-light.png", cap: "Light" }],
      },
      {
        tag: "Comments sheet", desc: "กด 💬 จาก action row — bottom sheet ทับจอ + emoji row + ช่องพิมพ์",
        imgs: [{ src: "detail/comments-dark.png", cap: "Dark" }, { src: "detail/comments-light.png", cap: "Light" }],
      },
    ],
    legend: [
      "เข้า Detail ได้เฉพาะทางกล่อง spec ย่อ (View full detail ›) — แตะรูปเป็นแค่เลื่อน carousel ตาม IG",
      "ไม่มี sticky price bar / ไม่มีแถว thumbnail / ไม่มี Comments section ท้ายหน้า",
    ],
  },
];

const SEC_URL = "file:///" + SEC.replace(/\\/g, "/") + "/";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1700, height: 200 }, deviceScaleFactor: 2 });
  const tmpHtml = join(SEC, "_sheet_tmp.html");
  for (const s of SHEETS) {
    writeFileSync(tmpHtml, sheetHTML(s.chip, s.title, s.note, s.options, s.legend, s.phoneW));
    await page.goto(SEC_URL + "_sheet_tmp.html");
    await page.waitForTimeout(600);
    const box = await page.evaluate(() => {
      const r = document.body.getBoundingClientRect();
      return { width: Math.ceil(r.width), height: Math.ceil(r.height) };
    });
    await page.setViewportSize(box);
    await page.waitForTimeout(300);
    await page.screenshot({ path: join(OUT, s.file) });
    console.log("ok", s.file);
  }
  await browser.close();
  console.log("done ->", OUT);
})().catch(e => { console.error(e); process.exit(1); });
