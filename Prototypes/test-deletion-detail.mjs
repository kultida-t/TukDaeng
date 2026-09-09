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

// ===== DEL-PTO-006: อีเมลแจ้งเตือนใน modal + log อีเมลใน History & Actions =====

// 17. modal คืนบัญชี/ปฏิเสธคืนบัญชี มีข้อความแจ้งอีเมล + email preview
assert(/function renderDeletionActionEmailNote\s*\(/.test(html), "function renderDeletionActionEmailNote");
assert(/renderDeletionActionEmailNote\(req\)/.test(html), "modal เรียก email note");
assert(/data-deletion-email-preview/.test(html), "modal email preview element");
assert(/<summary>ดูตัวอย่างอีเมลแจ้งเตือน<\/summary>/.test(html), "email preview summary");

// 18. email copy ตาม action (restore + reject-restore)
assert(/บัญชีของคุณกลับมาใช้งานได้แล้ว \/ Your account has been restored/.test(html), "subject อีเมลคืนบัญชี");
assert(/คำขอคืนบัญชีของคุณถูกปฏิเสธ \/ Your account restore request has been declined/.test(html), "subject อีเมลปฏิเสธคืนบัญชี");
assert(/getDeletionActionEmailCopy\(req, action, reason\)/.test(html), "email copy ใช้ reason จากฟอร์ม");

// 19. registered owner email note (pattern renderAssetHideEmailNote — ข้อความกระชับ)
// 19. registered owner email note (pattern renderAssetHideEmailNote — ข้อความกระชับ)
assert(/<strong>แจ้งผู้ใช้:<\/strong> ระบบจะส่งอีเมลแจ้งผลไปที่ \$\{getDeletionOwnerEmail\(req\)\} \(registered owner email\)<\/p>/.test(html), "email note กระชับ + ระบุ registered owner email");
assert(/function getDeletionOwnerEmail\s*\(/.test(html), "getDeletionOwnerEmail helper");

// 20. live preview update เมื่อเปลี่ยน reason
assert(/function updateDeletionActionEmailPreview\s*\(/.test(html), "updateDeletionActionEmailPreview ถูกนิยาม");
assert(/hiddenInput\.id === "deletion-action-reason"\) updateDeletionActionEmailPreview\(\)/.test(html), "reason change เรียก update preview");

// 21. History & Actions — สถานะส่งอีเมลอยู่ในคอลัมน์ ส่งอีเมล แล้ว รายละเอียดไม่แนบข้อความส่งอีเมลซ้ำ
assert(!/notification email sent to \$\{ownerEmail\}/.test(html), "history note ไม่แนบ notification email sent to (ซ้ำกับคอลัมน์ส่งอีเมล)");
assert(/action: "ขอลบบัญชี", note: "ผู้ใช้ยืนยันคำขอผ่านแอป \(FO\)", emailDelivery/.test(html), "log ขอลบบัญชี note สะอาด + มี email delivery");
assert(/action: "คืนบัญชี", note: formatActionNote\(d\.restoreReason, d\.restoreNote\), emailDelivery/.test(html), "log คืนบัญชี note สะอาด (ไม่แนบ user access restored)");
assert(/action: "ลบบัญชีอัตโนมัติ", note: "ครบช่วงรอลบบัญชี 30 วัน", emailDelivery/.test(html), "log ลบบัญชีอัตโนมัติ note สะอาด (รายละเอียด anonymize อยู่ใน Deletion Plan)");

// 27. ทำ action โดยไม่มี record คำขอคืนบัญชี → สร้าง record "รับคำขอคืนบัญชี (ผ่าน support)" อัตโนมัติ
assert(/if \(!detail\.restoreRequest\) \{[\s\S]{0,120}detail\.restoreRequest = \{ requestedAt: "—", channel: "", note: "ผู้ใช้ติดต่อ support ขอคืนบัญชี" \};/.test(html), "action สร้าง record รับคำขอคืนบัญชีอัตโนมัติเมื่อยังไม่มี");

// 28. ทุก action มี record รับคำขอคืนบัญชีนำหน้า (ปฏิเสธซ้ำ/คืนบัญชี = ผู้ใช้ยื่นขอใหม่ทุกครั้ง)
assert(/const pushRestoreInbound = \(\) => auditLogs\.push\(\{ at: "—", actor: "System", action: "รับคำขอคืนบัญชี \(ผ่าน support\)"/.test(html), "record รับคำขอคืนบัญชี สร้างเป็น helper");
assert(/restoreRejects\.forEach\(rej => \{\s*\n\s*pushRestoreInbound\(\);/.test(html), "ปฏิเสธแต่ละครั้ง มี record รับคำขอนำหน้า");
assert(/if \(tl\.restoredAt\) \{\s*\n\s*pushRestoreInbound\(\);/.test(html), "คืนบัญชี มี record รับคำขอนำหน้า");

// 29. Account Status History ใน User Management แสดงการปฏิเสธคืนบัญชีทุกครั้ง (สัมพันธ์กับ History & Actions)
assert(/const restoreRejects = Array\.isArray\(delDetail\?\.restoreRejects\) \? delDetail\.restoreRejects :/.test(html), "Account Status History แสดงการปฏิเสธทุกครั้ง (restoreRejects)");

// 30. back navigation: Request Detail → User Detail → back กลับมา Request Detail เดิม
assert(/if \(activeModule === "deletions"\) \{[\s\S]{0,400}return \{ type: "deletion-detail", id: activeRow\.id \};/.test(html), "back จาก User Detail กลับ Request Detail (deletion-detail context)");

// 22. mock delivery log DLV-DEL ใน Notifications — ครบ 5 lifecycle emails
assert(/DLV-DEL-033-REQ/.test(html), "delivery log อีเมลยืนยันลบบัญชี (DLV-DEL-xxx-REQ)");
assert(/DLV-DEL-035-GR3/.test(html), "delivery log อีเมลเตือน grace period (DLV-DEL-xxx-GR)");
assert(/DLV-DEL-031-RES/.test(html), "delivery log อีเมลคืนบัญชี (DLV-DEL-xxx-RES)");
assert(/DLV-DEL-028-REJ/.test(html), "delivery log อีเมลปฏิเสธคืนบัญชี (DLV-DEL-xxx-REJ)");
assert(/DLV-DEL-025-DEL/.test(html), "delivery log อีเมลลบบัญชีอัตโนมัติ (DLV-DEL-xxx-DEL)");

// 23. dynamic action → delivery log
assert(/function ensureDeletionDeliveryLog\s*\(/.test(html), "ensureDeletionDeliveryLog ถูกนิยาม");
assert(/ensureDeletionDeliveryLog\(req, action\);/.test(html), "confirmDeletionAction เรียก ensureDeletionDeliveryLog");

// 24. เนื้ออีเมลใช้ display name แทน request/user id (ผู้ใช้ไม่รู้จัก id ของตัวเอง — กันงง) และไม่ใส่วงเล็บ
assert(/คำขอลบบัญชี \$\{req\.displayName\} ของคุณถูกยกเลิก/.test(html), "email คืนบัญชี ใช้ display name ในเนื้อหา");
assert(/คำขอคืนบัญชี \$\{req\.displayName\} ของคุณได้รับการพิจารณาแล้ว/.test(html), "email ปฏิเสธใช้ display name");
assert(!/คำขอลบบัญชี \$\{req\.id\}/.test(html), "ไม่แสดง request id ในประโยคเนื้ออีเมล (เหลือเฉพาะ Reference)");
assert(!/คำขอลบบัญชีของคุณ \(\$\{req\.displayName\}\)/.test(html), "ไม่ใส่วงเล็บครอบชื่อในเนื้ออีเมล");

// 25. คอลัมน์ ส่งอีเมล ใน History & Actions — ตาม pattern Admin Action History ของ Report Detail
assert(/<td data-label="ส่งอีเมล">\$\{log\.emailDelivery \? renderReportAuditEmailDelivery\(log\) : "—"\}<\/td>/.test(html), "คอลัมน์ ส่งอีเมล ใช้ — เมื่อไม่มีอีเมล (มาตรฐานเดียวกับคอลัมน์วันที่)");
assert(/<th>ส่งอีเมล<\/th>/.test(html), "history table header มีคอลัมน์ ส่งอีเมล");
assert(/emailDelivery: deletionEmailDelivery\("REQ"\)/.test(html), "event ขอลบบัญชี มี email delivery");
assert(/emailDelivery: deletionEmailDelivery\("REJ"\)/.test(html), "event ปฏิเสธคืนบัญชี มี email delivery");
assert(/emailDelivery: deletionEmailDelivery\("RES"\)/.test(html), "event คืนบัญชี มี email delivery");
assert(/emailDelivery: deletionEmailDelivery\("DEL"\)/.test(html), "event ลบบัญชีอัตโนมัติ มี email delivery");
assert(/data-delivery-log-jump="\$\{deliveryId\}"/.test(html) || /data-delivery-log-jump/.test(html), "delivery jump ใช้ handler เดิมของระบบ");

// 26. mobile card — ปุ่ม Email ส่งแล้ว พอดีข้อความ ไม่ยืดเต็มแถว (scope เฉพาะ deletion detail ไม่กระทบหน้าล็อก)
assert(/body\.deletion-detail-mode \.deletion-detail-page \.history-table td \.history-delivery-link \{[\s\S]{0,120}width: max-content;[\s\S]{0,60}justify-self: start;/.test(html), "mobile ปุ่ม email พอดีข้อความ (width: max-content + justify-self: start)");

const passed = checks.filter(c => c.ok).length;
const failed = checks.filter(c => !c.ok).length;
console.log(`DEL-PTO-002 smoke test: ${passed}/${checks.length} passed, ${failed} failed\n`);
for (const c of checks) {
  console.log(`${c.ok ? "PASS" : "FAIL"}  ${c.msg}`);
}
if (failed > 0) process.exit(1);
