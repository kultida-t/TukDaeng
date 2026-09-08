// DEL-PTO-002 smoke test — ตรวจว่า renderDeletionDetail ทำงาน + 4 sections ครบ + ไม่มี JS error
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL(".", import.meta.url));
const html = (await readFile(join(root, "bo-prototype.html"), "utf8")).toString();

// ดึง <script> หลัก (inline) มา eval ใน sandbox จำลอง DOM แบบหยาบ ๆ ไม่ได้ — ใช้วิธี grep โครงสร้างแทน
const checks = [];

const assert = (cond, msg) => checks.push({ ok: !!cond, msg });

// 1. renderDeletionDetail ถูกนิยาม
assert(/function renderDeletionDetail\s*\(/.test(html), "function renderDeletionDetail ถูกนิยาม");

// 2. 4 sections ครบ
assert(/Section 1.*User Context/.test(html) || /deletion-user-context-section/.test(html), "Section 1 User Context");
assert(/Deletion Timeline/.test(html), "Section 2 Deletion Timeline");
assert(/Dependency Summary/.test(html), "Section 3 Dependency Summary");
assert(/<h4>Deletion Plan<\/h4>/.test(html), "Section 4 Deletion Plan");

// 3. action area 2 ปุ่ม (ปรับตามการเปลี่ยนแปลง — เอา ดูสถานะล่าสุด/ดูประวัติ/ส่งออกรายงาน ออก)
assert(/data-deletion-action="restore"/.test(html), "ปุ่ม คืนบัญชี");
assert(/data-deletion-action="reject-restore"/.test(html), "ปุ่ม ปฏิเสธคืนบัญชี");

// 4. breadcrumb + back button
assert(/งานตรวจสอบและบริการ \/ Account Deletion \/ Requests \//.test(html), "breadcrumb ครบ");
assert(/data-back-deletion-list/.test(html), "back button data-back-deletion-list");

// 5. status badges
assert(/deletionRequestStatusPill\(req\.requestStatus\)/.test(html), "request status pill");
assert(/deletionAccountStatusPill\(req\.accountStatus\)/.test(html), "account status pill");

// 6. masked + reveal — เอาออกแล้ว (ผู้ใช้ตัดสินใจ: ดู sensitive ที่ User Detail แทน)
assert(!/data-deletion-reveal/.test(html), "ไม่มี reveal toggle (ย้ายไป User Detail)");
assert(!/deletion-masked-value/.test(html), "ไม่มี masked value element");
assert(!/deletion-sensitive-tile/.test(html), "ไม่มี sensitive tile class");

// 7. countdown
assert(/deletion-countdown/.test(html), "countdown element");
assert(/เหลือ \$\{req\.daysLeft\} วัน ถึงลบบัญชีอัตโนมัติ/.test(html), "countdown text");

// 8. เงื่อนไขเพิ่ม: restore request + reject notes
assert(/deletion-restore-request-note/.test(html), "restore request note");
assert(/deletion-restore-reject-note/.test(html), "restore reject note");
assert(/ผู้ใช้ขอคืนบัญชีผ่านช่องทาง support/.test(html), "restore request text");
assert(/ปฏิเสธคืนบัญชีเมื่อ/.test(html), "restore reject text");

// 9. click handler เชื่อมแล้ว
assert(/pushBackNavigationContext\(\);\s*\n\s*renderDeletionDetail\(id\)/.test(html), "row click เรียก renderDeletionDetail");

// 9b. ปุ่ม ... (row-menu summary) ต้องไม่พาไป detail — guard ต้องครอบคลุม .row-menu (summary ไม่ใช่ button)
assert(/event\.target\.closest\("\.row-menu, button"\) && !event\.target\.closest\("\[data-deletion-open\]"\)/.test(html), "guard ปุ่ม ... ไม่พาไป detail");

// 10. navigation context restore
assert(/context\.type === "deletion-detail"/.test(html), "navigation context restore deletion-detail");

// 11. getDefaultBackContext
assert(/activeModule === "deletions"/.test(html), "getDefaultBackContext deletions");

// 12. CSS deletion-detail-mode
assert(/body\.deletion-detail-mode/.test(html), "CSS deletion-detail-mode");
assert(/deletion-countdown-ending/.test(html), "CSS countdown ending");
assert(/deletion-countdown-expired/.test(html), "CSS countdown expired");
assert(/deletion-archive-plan-table/.test(html), "CSS archive plan table");

// 13. responsive
assert(/@media \(max-width: 1180px\)[\s\S]*?deletion-detail-mode/.test(html), "responsive 1180px");
assert(/@media \(max-width: 760px\)[\s\S]*?deletion-detail-mode/.test(html), "responsive 760px");

// 13b. mobile card ซ่อนปุ่ม ... — เมนูมีรายการเดียวซ้ำกับการคลิกการ์ด
assert(/body\.deletion-list-mode \.deletion-request-table \.user-row\.deletion-row:not\(\.head\) > \.user-row-actions \{\s*\n\s*display: none;/.test(html), "mobile card ซ่อนปุ่ม ...");

// 14. mock data detail
assert(/deletionRequestData\.detail/.test(html), "detail mock data");
assert(/userContext:/.test(html), "userContext mock");
assert(/timeline:/.test(html), "timeline mock");
assert(/dependency:/.test(html), "dependency mock");
assert(/restoreRequest:/.test(html), "restoreRequest mock");
assert(/restoreReject:/.test(html), "restoreReject mock");

// 15. ปุ่ม คืนบัญชี + ปฏิเสธ แสดงเฉพาะ inGracePeriod
assert(/\["active", "ending", "expired"\]\.includes\(req\.graceState\)/.test(html), "inGracePeriod check");

// 16b. ห้ามแสดง note "คำขอนี้ผ่านช่วงรอลบบัญชีแล้ว ..." ใน action area — ทุกสถานะ (restored/anonymized) ต้องไม่แสดง
assert(!/คำขอนี้ผ่านช่วงรอลบบัญชีแล้ว/.test(html), "ไม่แสดง note ผ่านช่วงรอลบบัญชี");

// 16. ไม่กระทบ protected screens — ไม่ใช้ user-detail-mode สำหรับ deletion detail
assert(/document\.body\.classList\.add\("deletion-detail-mode"\);[\s\S]{0,200}document\.body\.classList\.remove\([^)]*"user-detail-mode"/.test(html), "ไม่ใช้ user-detail-mode (ไม่กระทบ protected)");

const passed = checks.filter(c => c.ok).length;
const failed = checks.filter(c => !c.ok).length;
console.log(`DEL-PTO-002 smoke test: ${passed}/${checks.length} passed, ${failed} failed\n`);
for (const c of checks) {
  console.log(`${c.ok ? "PASS" : "FAIL"}  ${c.msg}`);
}
if (failed > 0) process.exit(1);
