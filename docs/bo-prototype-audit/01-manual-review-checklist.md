# BO Prototype Audit — Manual Review Checklist (Objective 1)

Mission: BO Prototype Consistency, Coverage & Navigation Audit
Objective 1: System Coverage Audit
Tasks: BOA-001, BOA-002, BOA-003
ผู้ตรวจ: ผู้ใช้ทำตาม checklist บนหน้าจอจริง (bo-prototype.html)
วันที่ตรวจ: 28/09/2026 — ผลบันทึกใน Kanban activity ของแต่ละ task
Viewports: 390, 768, 1280, 1440px
ผลรวม: ผ่านทุกข้อ ยกเว้น 1 confirmed defect (WAL-1440 wrong destination)

## BOA-001 — Screen/Route/Flow Inventory

ขั้นกดต่อรายการ: เปิดเมนู/submenu จาก sidebar หรือ entry point → ตรวจ destination เปิดถูก → ตรวจ active menu state → ตรวจ breadcrumb → ตรวจ back path → resize ทุก viewport

| # | Entry ที่ตรวจ | ผลที่คาด | ผล |
|---|---|---|---|
| 1 | Login / Auth | เปิดได้ อยู่นอก sidebar โดยตั้งใจ | PASS |
| 2 | Dashboard | list/card/queue/activity render ครบ | PASS |
| 3 | User Management > User List + User Detail | destination/active/breadcrumb/back ถูก | PASS |
| 4 | User Management > Reported Users + Report Detail | destination/active/breadcrumb/back ถูก | PASS |
| 5 | Asset Management > Asset List + Asset Detail | destination/active/breadcrumb/back ถูก | PASS |
| 6 | Asset Management > Reported Assets + Report Detail | destination/active/breadcrumb/back ถูก | PASS |
| 7 | Asset Management > Reported Comments + Comment Report Detail | destination/active/breadcrumb/back ถูก | PASS |
| 8 | Offer Management + Offer Detail | destination/active/breadcrumb/back ถูก | PASS |
| 9 | Content Management > Article List/Detail/Add/Edit | destination/active/breadcrumb/back ถูก | PASS |
| 10 | Content Management > Categories | destination/active/breadcrumb/back ถูก | PASS |
| 11 | Content Management > Reported Board + Board Report Detail | destination/active/breadcrumb/back ถูก | PASS |
| 12 | Market Data | destination/active/breadcrumb/back ถูก | PASS |
| 13 | Option Master (group/option detail + modals) | destination/active/breadcrumb/back ถูก | PASS |
| 14 | Market Demand > Demand Overview | destination/active/breadcrumb/back ถูก | PASS |
| 15 | Market Demand > Search Insights | destination/active/breadcrumb/back ถูก | PASS |
| 16 | Market Demand > Watch Alert List + Alert Detail | destination/active/breadcrumb/back ถูก | PASS |
| 17 | Account Deletion > Request List + Request Detail | destination/active/breadcrumb/back ถูก | PASS |
| 18 | Settings > Policy & Versioning | destination/active/breadcrumb/back ถูก | PASS |
| 19 | Settings > Support Center | destination/active/breadcrumb/back ถูก | PASS |
| 20 | Settings > Delivery Logs | destination/active/breadcrumb/back ถูก | PASS |
| 21 | Settings > Admin Accounts + Admin Detail | destination/active/breadcrumb/back ถูก | PASS |
| 22 | Settings > Roles & Permissions + Role Detail | destination/active/breadcrumb/back ถูก | PASS |
| 23 | Settings > Audit Log + Detail drawer | destination/active/breadcrumb/back ถูก | PASS |
| 24 | My Account (Edit Name / Change Password / Active Sessions) | เข้าจาก profile footer นอก sidebar โดยตั้งใจ | PASS |
| 25 | Modal/editor/major states ของทุกพื้นที่ข้างบน | เปิด/ปิด/สถานะครบตาม inventory | PASS |

ตรวจเพิ่มเติม: ไม่พบ page-level horizontal overflow ที่ viewport ใด

## BOA-002 — เทียบ prototype กับ Module Map และ Phase scope

ขั้นกดต่อรายการ: เปิด prototype เทียบกับ README_MODULE_INDEX, BO_MASTER_BASELINE และ module spec → จัด Covered / Intentionally Deferred / Product Decision / Missing

| # | เคสที่ตรวจ | ผลที่คาด | ผล |
|---|---|---|---|
| 1 | Phase 1 entry หลักทุก module | มี entry point ครบตาม baseline | PASS |
| 2 | Directory / Reports & Analytics / Broadcast / System Templates / Chat moderation | ไม่เปิดใน Phase 1 ตามเอกสาร — ไม่ใช่ defect | PASS (Deferred) |
| 3 | Offer write actions | ไม่เปิดใน Phase 1 | PASS (Deferred) |
| 4 | Future module ไม่ถูกเปิดโดยไม่ตั้งใจ | ไม่มี entry หลุด | PASS |
| 5 | Market Data scope (baseline เขียน management vs spec/prototype เป็น read-only) | บันทึกเป็น documentation inconsistency | PASS — ส่ง BOA-014/015 |
| 6 | Admin Settings Phase 1 scope (baseline รวม security/system/retention/export vs spec ระบุ deferred) | บันทึกเป็น documentation inconsistency | PASS — ส่ง BOA-014/015 |
| 7 | Audit Log export (baseline กล่าวถึง vs spec/prototype เป็น Phase 2) | บันทึกเป็น documentation inconsistency | PASS — ส่ง BOA-014/015 |

## BOA-003 — Missing, Dead และ Deferred Entry Points

ขั้นกดต่อรายการ: กด entry point จริง → ยืนยัน destination หรือข้อความ unavailable

| # | Entry ที่กด | ผลที่คาด | ผล |
|---|---|---|---|
| 1 | Sidebar entries ทุกกลุ่ม | เปิด destination ตรงเมนู | PASS |
| 2 | Dashboard cards / queues / activity deep links | พาไปหน้าที่เกี่ยวข้องถูกต้อง | PASS |
| 3 | Cross-module jumps (delivery log jump, audit ref jump, Asset ID links, deletion request → user detail) | เปิด detail ปลายทางตรง reference | PASS |
| 4 | Local download template (CSV) | ไฟล์ template มีจริง เปิดได้ | PASS |
| 5 | Frequently Triggered Alerts แถว WAL-1440 | ต้องเปิด Alert Detail ของ WAL-1440 | FAIL → confirmed defect (handler พาไป Watch Alert List) |
| 6 | Disabled/unavailable entries | มีคำอธิบายหรือถูกซ่อนตาม Phase | PASS |

Defect ที่บันทึก: WAL-1440 wrong destination — Product ยืนยันเป็นพฤติกรรมผิด ส่ง BOA-014 Findings Register และ BOA-015 Remediation Roadmap

## Boundary

- Read-only audit — ไม่มีการแก้ prototype, route, shared CSS/helper, mock data หรือ protected behavior
- Fixture gap บางจุดตรวจ runtime ไม่ได้ — บันทึกเป็นข้อจำกัด ไม่จัดเป็น Missing อัตโนมัติ
