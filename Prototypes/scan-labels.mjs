// PVR-001: Label/Button/Title inventory scanner for bo-prototype.html
// Read-only scan — extracts every user-facing label, groups by action.
// Output: deliverables/label-standard/inventory.json + inventory.md
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FILE = join(ROOT, "Prototypes", "bo-prototype.html");
const OUT_DIR = join(ROOT, "deliverables", "label-standard");

const src = readFileSync(FILE, "utf8");
const lines = src.split("\n");

// ---------- line lookup ----------
const lineStart = new Array(lines.length + 1);
lineStart[0] = 0;
for (let i = 0; i < lines.length; i++) lineStart[i + 1] = lineStart[i] + lines[i].length + 1;
function lineOf(idx) {
  let lo = 0, hi = lines.length;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (lineStart[mid] <= idx) lo = mid; else hi = mid - 1;
  }
  return lo + 1;
}

// ---------- enclosing render function ----------
const fnRe = /^\s*(?:async\s+)?function\s+([A-Za-z0-9_$]+)\s*\(|^\s*(?:const|let|var)\s+([A-Za-z0-9_$]+)\s*=\s*(?:async\s*)?(?:function\s*)?\(/;
const fnStarts = [];
lines.forEach((l, i) => {
  const m = l.match(fnRe);
  if (m) fnStarts.push({ line: i + 1, name: m[1] || m[2] });
});
function contextAt(line) {
  let best = "(top-level)";
  for (const f of fnStarts) {
    if (f.line <= line) best = f.name; else break;
  }
  return best;
}

// ---------- helpers ----------
const stripTags = (s) => s.replace(/<[^>]*>/g, " ");
const normWs = (s) => s.replace(/\s+/g, " ").trim();
// extract literal label variants inside ${...} template expressions only
// (ignores class names / identifiers — keeps strings with Thai, space, or leading uppercase)
function variantsOf(raw) {
  const out = [];
  const noTags = stripTags(raw);
  const exprRe = /\$\{([^}]*)\}/g;
  let m;
  while ((m = exprRe.exec(noTags))) {
    const strRe = /["'`]([^"'`{}<>]{1,80})["'`]/g;
    let s;
    while ((s = strRe.exec(m[1]))) {
      const v = s[1].trim();
      if (v && (/[ก-๙]/.test(v) || /^[A-Z]/.test(v) || /\s/.test(v))) out.push(v);
    }
  }
  return out;
}
function textOf(inner) {
  let t = stripTags(inner);
  // keep ${...} markers visible so dynamic labels are traceable
  t = t.replace(/\$\{[^}]*\}/g, "${…}");
  return normWs(t);
}
const attr = (attrs, name) => {
  const m = attrs.match(new RegExp(`${name}="([^"]*)"`));
  return m ? m[1] : "";
};

const items = [];
function add(kind, label, rawInner, line, extra = {}) {
  const clean = label || textOf(rawInner || "");
  const vars = rawInner ? variantsOf(rawInner) : [];
  items.push({
    kind,
    label: clean || "(no text)",
    dynamic: (rawInner || "").includes("${"),
    variants: vars.filter((v) => v !== clean),
    line,
    fn: contextAt(line),
    ...extra,
  });
}

// ---------- 1. buttons ----------
{
  const re = /<button\b([^>]*)>([\s\S]*?)<\/button>/g;
  let m;
  while ((m = re.exec(src))) {
    const attrs = m[1], inner = m[2], line = lineOf(m.index);
    const cls = attr(attrs, "class"), id = attr(attrs, "id");
    const aria = attr(attrs, "aria-label"), title = attr(attrs, "title");
    let label = textOf(inner);
    if (!label) label = aria || title || "(icon-only)";
    add("button", label, inner, line, { cls, id, aria, title });
  }
}

// ---------- 2. headings (titles) ----------
{
  const re = /<h([1-4])\b([^>]*)>([\s\S]*?)<\/h\1>/g;
  let m;
  while ((m = re.exec(src))) {
    const attrs = m[2], inner = m[3], line = lineOf(m.index);
    const cls = attr(attrs, "class"), id = attr(attrs, "id");
    const kind = /modal/i.test(id + " " + cls) ? "modal-title" : "title";
    add(kind, textOf(inner), inner, line, { tag: "h" + m[1], cls, id });
  }
}

// ---------- 3. action links ----------
{
  const re = /<a\b([^>]*)>([\s\S]*?)<\/a>/g;
  let m;
  while ((m = re.exec(src))) {
    const attrs = m[1], inner = m[2], line = lineOf(m.index);
    const cls = attr(attrs, "class");
    add("link", textOf(inner), inner, line, { cls });
  }
}

// ---------- 4. leaf title/label/crumb elements ----------
{
  const re = /<(div|span|p|th|td)\b([^>]*class="[^"]*(?:-title|title-|modal-title|-label|label-|-head\b|head-text|eyebrow|crumb|subtitle|-heading|heading-)[^"]*"[^>]*)>((?:(?!<)[^<])*?)<\/\1>/g;
  let m;
  while ((m = re.exec(src))) {
    const attrs = m[2], inner = m[3], line = lineOf(m.index);
    const cls = attr(attrs, "class");
    const txt = textOf(inner);
    if (!txt && !inner.includes("${")) continue;
    add("label", txt, inner, line, { cls });
  }
}

// ---------- 5. form labels ----------
{
  const re = /<label\b([^>]*)>([\s\S]*?)<\/label>/g;
  let m;
  while ((m = re.exec(src))) {
    add("field-label", textOf(m[2]), m[2], lineOf(m.index), { cls: attr(m[1], "class") });
  }
}

// ---------- 6. options ----------
{
  const re = /<option\b[^>]*>([\s\S]*?)<\/option>/g;
  let m;
  while ((m = re.exec(src))) add("option", textOf(m[1]), m[1], lineOf(m.index));
}

// ---------- 7. aria-label / title attrs on interactive els ----------
{
  const re = /<(?:button|a)\b[^>]*(?:aria-label|title)="([^"]+)"/g;
  let m;
  while ((m = re.exec(src))) {
    add("a11y-attr", m[1], null, lineOf(m.index));
  }
}

// ---------- 8. JS config label keys ----------
{
  const keyRe = /\b(label|title|text|confirmLabel|cancelLabel|confirmText|cancelText|okLabel|okText|primaryLabel|secondaryLabel|heading|cta|buttonLabel|emptyTitle|emptyText|placeholder)\s*:\s*"([^"\n]{1,120})"/g;
  let m;
  while ((m = keyRe.exec(src))) {
    add("js-label", m[2], null, lineOf(m.index), { key: m[1] });
  }
}

// ---------- 9. navGroups ----------
{
  const navBlock = src.match(/const navGroups = \[([\s\S]*?)\n\s*\];/);
  if (navBlock) {
    const startLine = lineOf(navBlock.index);
    const secRe = /section:\s*"([^"]+)"|id:\s*"([^"]+)",\s*label:\s*"([^"]+)"|subs:\s*\[([^\]]*)\]|label:\s*"([^"]+)"/g;
    let m;
    while ((m = secRe.exec(navBlock[1]))) {
      const line = lineOf(navBlock.index + m.index);
      if (m[1]) add("nav-section", m[1], null, line);
      else if (m[3]) add("nav-module", m[3], null, line, { id: m[2] });
      else if (m[4]) {
        const strRe = /"([^"]+)"/g; let s;
        while ((s = strRe.exec(m[4]))) add("nav-sub", s[1], null, line);
      } else if (m[5]) add("nav-sub", m[5], null, line);
    }
  }
}

// ---------- 10. action classification ----------
// NOTE: \b does not work between Thai chars — order matters, specific multi-word
// patterns must come before generic ones (e.g. ปิดรายงาน before ปิด, ส่งออก before ส่ง)
const RULES = [
  ["back", /กลับ|back\b|←|↩/i],
  ["export-import", /export|import|ส่งออก|นำเข้า|download|ดาวน์โหลด|refresh|รีเฟรช|sync|อัปโหลด|upload/i],
  ["pagination", /\bprev\b|\bnext\b|ก่อนหน้า|หน้าถัดไป|»|«/i],
  ["auth", /เข้าสู่ระบบ|ออกจากระบบ|\blogin\b|\blogout\b|sign in|sign out/i],
  ["confirm-submit", /ยืนยัน|ตกลง|บันทึก|save|confirm|submit|apply|ส่ง|สร้าง|publish|เผยแพร่|activate|assign|อนุมัติ|approve|เริ่ม|ดำเนินการ|ลงทะเบียน|ยอมรับ/i],
  ["delete-remove", /ลบ|delete|remove|ถอด|trash/i],
  ["restrict-moderate", /ระงับ|suspend|deactivate|block|บล็อก|lock|ล็อก|unlock|ปลดล็อก|archive|เก็บถาวร|hide|ซ่อน|restore|กู้|reactivate|เปิดใช้|ปิดใช้|reject|ปฏิเสธ|ปิดรายงาน|ปิดเรื่อง|ปิดเคส|dismiss report|คืนบัญชี/i],
  ["search-filter-sort", /ค้นหา|search|กรอง|filter|ตัวกรอง|sort|เรียง|reset|รีเซ็ต|ล้าง|\bclear\b/i],
  ["cancel-dismiss", /ยกเลิก|cancel|ปิด|close|✕|×|dismiss|ไม่ใช่|ไว้ก่อน|ข้าม|skip/i],
  ["add-create", /เพิ่ม|\badd\b|create|\bnew\b|invite|เชิญ|^\+/i],
  ["edit", /แก้ไข|edit|rename|เปลี่ยน|ปรับ|ตั้งค่า|configure|update|จัดการ|manage/i],
  ["select-choose", /เลือก|select|choose|browse/i],
  ["view-detail", /ดู|view|detail|รายละเอียด|see all|view all|preview|ตัวอย่าง|read more|อ่าน|เพิ่มเติม/i],
  ["utility", /คัดลอก|\bcopy\b|พิมพ์|print|แชร์|share|ติดต่อ|contact|ลองอีกครั้ง|retry|try again|show password|hide password|แสดงรหัส|ซ่อนรหัส|expand|collapse|ขยาย|ย่อ/i],
  ["nav-menu", /dashboard|user management|asset management|offer management|content management|market data|option master|market demand|account deletion|settings|user accounts|reported|articles|categories|market overview|brands|sync history|demand overview|search insights|watch alert|admin accounts|roles|policy|support center|delivery logs|audit log/i],
];
function classify(label, kind) {
  if (/^nav-/.test(kind)) return "nav-menu";
  if (kind === "modal-title" || kind === "title") return "title-heading";
  const t = label.toLowerCase();
  for (const [name, re] of RULES) if (re.test(t)) return name;
  return "other";
}

items.forEach((it) => { it.action = classify(it.label, it.kind); });

// ---------- aggregate ----------
const groups = new Map();
for (const it of items) {
  if (!groups.has(it.action)) groups.set(it.action, new Map());
  const g = groups.get(it.action);
  const key = it.label;
  if (!g.has(key)) g.set(key, { label: key, kinds: new Set(), count: 0, variants: new Set(), locs: [] });
  const e = g.get(key);
  e.kinds.add(it.kind); e.count++;
  it.variants.forEach((v) => e.variants.add(v));
  e.locs.push(`${it.line}:${it.fn}${it.dynamic ? "*" : ""}`);
}

// ---------- write JSON ----------
mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, "inventory.json"), JSON.stringify({ generated: new Date().toISOString(), file: "Prototypes/bo-prototype.html", total: items.length, items }, null, 2), "utf8");

// ---------- write MD ----------
const order = ["confirm-submit","cancel-dismiss","delete-remove","restrict-moderate","add-create","edit","select-choose","view-detail","search-filter-sort","export-import","pagination","back","auth","utility","nav-menu","title-heading","other"];
const out = [];
out.push(`# Label/Button/Title Inventory — bo-prototype.html`);
out.push(`Generated: ${new Date().toISOString()}  |  Total entries: ${items.length}  |  Read-only scan (PVR-001)`);
out.push("");
for (const action of order) {
  const g = groups.get(action);
  if (!g) continue;
  const total = [...g.values()].reduce((s, e) => s + e.count, 0);
  out.push(`## ${action} (${g.size} labels, ${total} uses)`);
  out.push("");
  out.push(`| Label | Kind | Uses | Variants (dynamic literals) | Locations (line:fn, * = dynamic) |`);
  out.push(`|---|---|---|---|---|`);
  for (const e of [...g.values()].sort((a, b) => b.count - a.count)) {
    const locs = e.locs.length > 12 ? e.locs.slice(0, 12).join(", ") + ` … +${e.locs.length - 12}` : e.locs.join(", ");
    out.push(`| ${e.label.replace(/\|/g, "\\|")} | ${[...e.kinds].join("/")} | ${e.count} | ${[...e.variants].join("; ") || "—"} | ${locs} |`);
  }
  out.push("");
}
writeFileSync(join(OUT_DIR, "inventory.md"), out.join("\n"), "utf8");

// ---------- console summary ----------
console.log(`Total extracted: ${items.length}`);
for (const action of order) {
  const g = groups.get(action);
  if (g) console.log(`  ${action}: ${g.size} unique labels, ${[...g.values()].reduce((s, e) => s + e.count, 0)} uses`);
}
console.log(`Wrote ${join(OUT_DIR, "inventory.md")} + inventory.json`);
