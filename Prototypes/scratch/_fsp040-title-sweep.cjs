/* FSP-040 — localize remaining EN-only title= attributes (user-facing spots) */
const fs = require("fs");
const P = "Prototypes/fo-flow/index.html";
let t = fs.readFileSync(P, "utf8");
const TH = s => '${state.lang === "th" ? "' + s + '" : "';
const pairs = [
  ['title="${p.modelFollowing ? "Following this model" : "Follow this model"}"',
   'title="${p.modelFollowing ? (state.lang === "th" ? "ติดตามรุ่นนี้แล้ว" : "Following this model") : (state.lang === "th" ? "ติดตามรุ่นนี้" : "Follow this model")}"'],
  ['title="Wish List"><span class="wl-ic wl-o">', 'title="${state.lang === "th" ? "รายการอยากได้" : "Wish List"}"><span class="wl-ic wl-o">'],
  ['title="Chat with ${esc(p.seller)}"', 'title="${state.lang === "th" ? "แชทกับ " : "Chat with "}${esc(p.seller)}"'],
  ['class="pf-qr-x" title="Close"', 'class="pf-qr-x" title="${state.lang === "th" ? "ปิด" : "Close"}"'],
  ['class="pf-qr-scan" title="Scan QR"', 'class="pf-qr-scan" title="${state.lang === "th" ? "สแกน QR" : "Scan QR"}"'],
  ['class="pf-cam-x" title="Close"', 'class="pf-cam-x" title="${state.lang === "th" ? "ปิด" : "Close"}"'],
  ['<div class="pf-cam-hint">Point your camera at a QR code</div>',
   '<div class="pf-cam-hint">${state.lang === "th" ? "ชี้กล้องไปที่คิวอาร์โค้ด" : "Point your camera at a QR code"}</div>'],
  ['class="sr-chip ico" data-sub="sfilter" title="Filters"', 'class="sr-chip ico" data-sub="sfilter" title="${state.lang === "th" ? "ตัวกรอง" : "Filters"}"'],
  ['data-sub="sfilter" title="Filters">${I.sliders(20)}', 'data-sub="sfilter" title="${state.lang === "th" ? "ตัวกรอง" : "Filters"}">${I.sliders(20)}'],
  ['title="Create watch alert"', 'title="${state.lang === "th" ? "สร้างการแจ้งเตือน" : "Create watch alert"}"'],
  ['data-bdmenu title="Categories"', 'data-bdmenu title="${state.lang === "th" ? "หมวดหู่" : "Categories"}"'],
  ['data-bdsearch title="Search"', 'data-bdsearch title="${state.lang === "th" ? "ค้นหา" : "Search"}"'],
  ['title="Back" aria-label="Back"', 'title="${state.lang === "th" ? "กลับ" : "Back"}" aria-label="${state.lang === "th" ? "กลับ" : "Back"}"'],
  ['title="Like" aria-label="Like"', 'title="${state.lang === "th" ? "ถูกใจ" : "Like"}" aria-label="${state.lang === "th" ? "ถูกใจ" : "Like"}"'],
  ['title="Share" aria-label="Share"', 'title="${state.lang === "th" ? "แชร์" : "Share"}" aria-label="${state.lang === "th" ? "แชร์" : "Share"}"'],
  ['data-chgo="attach" title="Attach"', 'data-chgo="attach" title="${state.lang === "th" ? "แนบไฟล์" : "Attach"}"'],
  ['class="ch-send"${(t.draft || "").trim() ? "" : " disabled"} title="Send"',
   'class="ch-send"${(t.draft || "").trim() ? "" : " disabled"} title="${state.lang === "th" ? "ส่ง" : "Send"}"'],
  ['class="icon-btn ch-attach-close" title="Close"', 'class="icon-btn ch-attach-close" title="${state.lang === "th" ? "ปิด" : "Close"}"'],
  ['title="Send photo"', 'title="${state.lang === "th" ? "ส่งรูป" : "Send photo"}"'],
  ['class="icon-btn ch-media-viewer-close" title="Close"', 'class="icon-btn ch-media-viewer-close" title="${state.lang === "th" ? "ปิด" : "Close"}"'],
];
let miss = 0;
for (const [o, n] of pairs) {
  if (!t.includes(o)) { console.log("MISS:", o.slice(0, 70)); miss++; continue; }
  t = t.replace(o, n);
  console.log("OK:", o.slice(0, 55));
}
fs.writeFileSync(P, t);
console.log(miss ? miss + " misses" : "all applied");
