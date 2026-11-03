# BO-TEST-COVERAGE-AUDIT — Coverage Matrix spec↔automated tests

> **Task**: BO-QA-COVERAGE-AUDIT · **Date**: 2026-11-03 · **Type**: Audit-only (ไม่มีเคสใหม่)
> **ทิศทางผู้ใช้**: BO = web application → ใช้ **automated test เท่านั้น** (ไม่ทำ manual testcase suite แบบ FO-TEST-001) แต่ coverage ต้องครบทุกเคส happy/blocked/edge/notification/display/responsive ทุก flow
> **Baseline**: `Prototypes/bo-prototype.html` (post e4/FO-BO-001 remediation) · `tests/*.spec.js` 52 files · `AGENTS.md` protected screens

## 1. ภาพรวม

- Playwright suite ปัจจุบัน: **52 spec files ≈ 1,760 test** ครอบทุก protected module หลัก
- สถานะล่าสุด (2026-11-03): qa-bo-001 + qa-bo-005 ถูก sync กับ e4 + remediation data drift แล้ว เขียว 100% ทุก viewport
- Gap หลักที่พบ: **Roles & Permissions ยังไม่มี spec เลย**, Delivery Logs ครอบบางส่วนผ่านไฟล์อื่น, module list/detail ส่วนใหญ่ครอบ happy path + filter/sort/reset + row menu + detail + responsive แล้ว แต่ขาด **negative/blocked/edge + cross-module navigation + mock boundary** เป็นราย module

## 2. Coverage Matrix — module/screen ↔ spec

| BO surface (protected) | Spec file(s) | เคสโดยประมาณ | Covered flows | Gap ที่ยังขาด |
|---|---|---:|---|---|
| Login + Dashboard | qa-bo-001 (57) | 57 | theme/layout/form/login/logout/KPI cards/work queue/activity/panels/responsive | blocked login error variants, session-expired redirect จากทุกจอ |
| User Mgmt — User List + User Detail + Reported Users + Report Detail | qa-bo-002 (73) | 73 | list/search/filter/sort/reset/pagination/detail/actions/lock/modals/responsive | action modal reason selectors, edge (self-action guard), cross-module jump จาก Reported Users |
| Asset Mgmt — Asset List/Detail + Reported Assets + Report Detail | qa-bo-003 (87) | 87 | list/detail/status actions/modals/report queue | post-only report entity (GAP-08 seed), moderation reason/impact notes, email preview |
| Asset Mgmt — Reported Comments + Comment Report Detail | qa-bo-004 (74) | 74 | queue/detail/modals (Hide/Restore/Remove/Close no violation)/reason/impact/email preview/View Asset & all-comments modals | filter persistence, mobile card เฉพาะจุด |
| Content Mgmt — Articles + Categories (e4: Reported Articles removed) | qa-bo-005 (83) | 83 | list/search/filter/sort/reset/row menu/detail/editor/preview/mobile/viewport/footer-range/empty | **ไม่มี** Reported Articles (removed — ปิดแล้ว); publish flow action modals, editor validation, block builder CRUD |
| Market Data | qa-bo-006 (122) | 122 | list/sync log/detail/filters/brand-model-ref/inactive handling | sync error/retry scenarios, inactive dependency warning surfaces ข้าม module |
| Option Master | qa-bo-008 (133) | 133 | group list/detail/option add-edit/deactivate/reorder/group modals/audit log view/suggestion queue | suggestion queue flows (promote/alias/ignore), type-to-confirm delete |
| Market Demand — Demand Overview / Search Insights / Watch Alert List + Detail | qa-bo-009 (129) | 129 | KPI tiles/charts/lists/detail sections/filters/pagination/mobile | WA detail matched-assets pagination, inactive market data warning, delivery status badges |
| Settings — Policy & Versioning | qa-bo-010 (127) | 127 | list/detail/editor/publish modal/version history/view/restore/preview/lang tabs | validation states, publish confirmation variants, restore flow |
| Settings — Support Center | qa-bo-011 (117) | 117 | edit form/channel toggles/validation/preview modal TH-EN/empty state | preview live-update interactions, error UI per channel |
| Settings — Admin Accounts | qa-bo-013a–m (169) | ~169 | nav/list/filter/detail/action modals/change role/invite/permission gating/responsive/invitation lifecycle | — ครอบละเอียดมากแล้ว |
| Settings — Roles & Permissions | — | **0** | **ไม่มี spec เลย** | **GAP-BO-TEST-01: ต้องสร้าง qa-bo-026-roles-permissions.spec.js — role list (search/type/status/sort/pagination/mobile), role detail (metadata/permission groups/impact/audit), create/edit custom role (key lock/dependency/ceiling/diff/reason/confirm), deactivate/reactivate, system role immutability, permission gating roles.view/manage** |
| Settings — Audit Log | qa-bo-014a–e (65) + al-003/004/005 (27) | ~92 | nav/list/filter/date range/detail drawer/jump links/responsive/cross-module | empty state, Note tooltip, module/risk filter combos |
| Admin Identity Lifecycle — My Account / sessions / forgot-reset / lockout | qa-bo-015/016/017/019a–e/020–024 (259) | ~259 | invite/activate/login/logout-all/session-expired/change-pw/forgot/reset/lockout/self-service | — ครอบมากแล้ว; เหลือ rate-limit edge + cooldown copy |
| Account Deletion | del-pto-003 (18) + del-pto-004 (19) | 37 | restore/reject modals + audit + responsive | **GAP-BO-TEST-02 (partial)**: deletion request list filter/search/sort/pagination, request detail sections (timeline/dependency tiles/deletion plan/history & actions), countdown states, no-send rules, lifecycle email delivery-log jump |
| Settings — Delivery Logs | (บางส่วนผ่าน 013m/019e/jump tests) | — | channel pills/jump links เท่านั้น | **GAP-BO-TEST-03: delivery log list (filter bar/search/status/channel/sort/pagination/mobile/empty) + read-only detail modal — ยังไม่มี spec ตรง** |
| Cross-module consistency | qa-bo-012 (83) | 83 | shared patterns ข้ามหลาย module | เติมตาม gap ข้างบนเมื่อมี spec ใหม่ |
| Scoped smoke | qa-bo-018 (12), qa-bo-025 (17) | 29 | mission smoke | — |
| Reports & Analytics (spec 15) | — | — | Phase 2 / contract-only | **N/A** — ยังไม่ implement ใน V1 (ตาม audit R32) |
| Directory (spec 07) | — | — | ไม่มีจอใน prototype | **N/A** — ไม่มี surface ให้เทส |

## 3. Gap Register — เคสที่ต้องเติม (เรียง priority)

| ID | Severity | ช่องว่าง | งานที่เสนอ |
|---|---|---|---|
| GAP-BO-TEST-01 | **Major** | Roles & Permissions = 0 test ทั้งที่เป็น protected screen (locked 2026-09-19) | สร้าง `qa-bo-026-roles-permissions.spec.js` ~80-100 เคส: nav/submenu, list (search/type/status/sort/reset/pagination/mobile card), Role Detail (metadata/permission groups/account impact/Role Audit History/back), create/edit custom role (Role Key lock, permission levels, dependency/ceiling validation, change diff, reason, confirmation, stale/no-op safeguards), deactivate/reactivate (impact + assigned-account safeguards), system role immutability, permission gating `roles.view`/`roles.manage`, responsive 4 viewports |
| GAP-BO-TEST-02 | **Major** | Account Deletion ครอบเฉพาะ 2 modals + audit (37 เคส) | สร้าง `qa-bo-027-account-deletion.spec.js` ~70-90 เคส: deletion request list (7 cols, row menu, filter bar search/status/grace-state/sort/persistence/pagination/mobile/empty), Request Detail (head chips + serious flag, user context masked, timeline + countdown, dependency tiles cross-module drill-in, deletion plan table, history & actions + delivery log jump), restore/reject modals variants (context note, reason selector, impact, email preview live), grace countdown states, no-send rules |
| GAP-BO-TEST-03 | Major | Delivery Logs ไม่มี spec ตรง | สร้าง `qa-bo-028-delivery-logs.spec.js` ~50-60 เคส: list (7 cols, status/channel pills, row click read-only modal, filter bar toggle + search + status/channel filters + sort + persistence + pagination + mobile + empty), detail modal rows (Source/Recipient/Channel/Status/Priority/Detail/Tags/Admin note), delivery ID patterns, jump links จาก Deletion/User Mgmt/Dashboard |
| GAP-BO-TEST-04 | Minor | Action modal coverage แบบเจาะลึกยังบางในหลาย module (reason selector, impact note, email preview, confirmation, completed state, toast) | เติม describe "action modals deep" ต่อ module: 002 (suspend/ban/unsuspend/reset-password), 003 (force hide/restore/remove), 004 มีอยู่แล้วบางส่วน — ประเมินซ้ำหลัง gap 01-03 |
| GAP-BO-TEST-05 | Minor | Negative/blocked/edge per-module ยังไม่เป็นระบบ (เช่น invalid inputs, disabled states, permission-blocked actions ไม่แสดงใน DOM, empty states, self-action/last-admin protection) | sweep เติมเคส NEGATIVE/EDGE ลง spec เดิมหรือไฟล์ `-edge.spec.js` ต่อ module — โดยเฉพาะ Admin Accounts protection (มีบางส่วนใน 013h แล้ว) และ Option Master safeguards |
| GAP-BO-TEST-06 | Minor | Notification/delivery surface — delivery status badges ใน WA detail, lifecycle email logs, delivery-log jump destinations | เพิ่มเคส badge/log presence + jump ไป Delivery Logs (ผูกกับ GAP-03) |
| GAP-BO-TEST-07 | Minor | Responsive coverage ไม่สม่ำเสมอ — บาง spec ครอบแค่ mobile card/filter toggle, ยังไม่ครบทุกจอ (390/768/1280/1440) | เพิ่ม viewport sweep block ใน spec ที่ยังขาด (002/003/004/006/008/009/010/011) — pattern เดียวกับ 005/013i/014e |
| GAP-BO-TEST-08 | Minor | Error/loading states (ตาราง error state, empty filtered result, failed action scenario `setActionScenario`) | ใช้ scenario hooks ที่มีอยู่ (`data-*-scenario`) เติมเคส failed/partial outcomes + toast + audit failed entries |
| GAP-BO-TEST-09 | Note | tests/_bor*.cjs helper scripts ยังอ้าง Reported Articles/boardReport (stale หลัง e4) — ไม่ถูกรันโดย playwright (ไม่ใช่ *.spec.js) | ลบหรือ archive one-off scripts ตาม commit debfa9b ที่เคยทำกับ Prototypes/_*.mjs |

## 4. ข้อเสนอแผนงานต่อ

1. **ตอบโจทย์ "automated test ครบทุก flow"** → เริ่มจาก GAP-01 (Roles & Permissions) เพราะเป็น module ที่ศูนย์เคส → ตามด้วย GAP-02 (Account Deletion list+detail) และ GAP-03 (Delivery Logs) — 3 ไฟล์ใหม่รวม ~200-250 เคส
2. จากนั้น sweep GAP-04/05/06/07/08 เติมเคสลง spec เดิมเป็นชุดย่อยต่อ module (แนะนำทีละ module ไม่เกิน ~2 ชม./ชุด)
3. GAP-09 = cleanup เล็ก (ลบ stale _bor*.cjs)
4. หลังเติมครบ → รัน full suite ทุก viewport เป็น baseline regression ใหม่ (ปัจจุบัน qa-bo-001/005 เขียว 100% ทุก viewport แล้ว)

## 5. หมายเหตุ

- suite นี้เป็น **prototype regression** — expected อ้าง prototype เป็นหลักแสดงผล + spec docs เป็นหลักพฤติกรรม; เมื่อ spec/prototype เปลี่ยน (เช่น decision ใหม่) ต้อง sync spec ทันทีเหมือนงาน e4 tail วันนี้
- ไม่พบ module ใน prototype ที่ไม่มี spec เลยนอกจาก Roles & Permissions — ทุก module อื่นมี spec อย่างน้อยระดับ happy path + list operations
