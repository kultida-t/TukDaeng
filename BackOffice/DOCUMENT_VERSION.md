# TukDaeng Back Office Document Version

## Current Baseline

| Field | Detail |
| --- | --- |
| Baseline Version | `BO-PRD-v0.1` |
| Baseline Date | 2026-07-06 |
| Status | Draft baseline started |
| Owner | Product / UX / Engineering / Operations |
| Primary Source | `BO_PRD.md`, `BO_Spec.md`, `BO_Spec_Completion_Addendum.md`, FO `18_ADMIN_SCOPE_NOTE.md` |

## Version History

| Version | Date | Change Summary |
| --- | --- | --- |
| `BO-17-v0.3` | 2026-08-19 | เพิ่ม section 22 FO Integration Guidelines ใน `BackOffice/17_OPTION_MASTER_MODULE.md` ครอบคลุม Add/Edit Asset form (control type, required rule, sort order ตาม group), Search Filter (Filter Visibility Rule, Filter Dependency Rule, multi-select), Watch Alert criteria (schema เดียวกับ Search Filter, warning สำหรับ inactive option), caching strategy (storage, cache key, TTL, refresh, fallback), fallback behavior เมื่อ option ถูก deactivate (ครบทุก surface), API contract (`GET /api/spec-options` พร้อม parameter, response, error, caching header), prefill behavior จาก Market Data reference (Owner แก้ไขได้, ไม่ถูก provider sync overwrite), interaction ระหว่าง Market Data และ Option Master (mapping rule, ไม่ match handling); อัปเดท `06_MARKET_DATA_MODULE.md` section 15 อ้างอิง Option Master section 22; เพิ่ม FO Integration acceptance criteria 9 ข้อ |
| `BO-17-v0.2` | 2026-08-19 | ขยาย section 17 ของ `BackOffice/17_OPTION_MASTER_MODULE.md` เป็น Data Model และ Seed Data Strategy ครบ 10 subsection: ตาราง `spec_option_groups`, `spec_options`, `spec_option_audit` พร้อม SQL schema; ความสัมพันธ์กับ `watch_assets` และ `asset_delivery_items` (nullable FK, ห้าม cascade delete); indexes และ constraints; seed data source (6 groups, 58 options); sync strategy (system vs custom option); migration strategy (add/edit/deactivate/reactivate); versioning strategy (bump version ทุก migration); impact ต่อ existing assets เมื่อ deactivate (คง relation, คง snapshot, lookup ไม่กรอง is_active); เพิ่ม data model checklist 8 ข้อใน Acceptance Criteria |
| `BO-17-v0.1` | 2026-08-19 | เพิ่ม `BackOffice/17_OPTION_MASTER_MODULE.md` โมดูลใหม่สำหรับจัดการ internal option master ที่ FO ใช้ใน Add/Edit Asset, Search Filter และ Watch Alert criteria ครอบคลุม option group list/detail, add/edit/deactivate/reactivate/reorder, key lock rule หลัง option ถูกใช้ใน asset, system option policy, impact ต่อ FO และ existing assets, integration กับ Market Data/Asset Management/Audit Log/Watch Alert, audit action types (`OPTION_ADD`, `OPTION_EDIT`, `OPTION_DEACTIVATE`, `OPTION_REACTIVATE`, `OPTION_REORDER`) และ acceptance criteria; อัปเดท `README_MODULE_INDEX.md` และ `BO_MASTER_BASELINE.md` เพิ่ม module 17 ใน Phase 1 scope |
| `BO-04-v1.1` | 2026-08-19 | ตรวจและอัปเดท `BackOffice/04_ASSET_MANAGEMENT_MODULE.md` ทั้ง module ให้ตรง prototype ปัจจุบัน: ปรับ Asset List Status filter ให้รวม `ซ่อนชั่วคราว` และเปลี่ยน `Sale - Consignment` preset เป็นตัวเลือก `Sale + Consignment` ใน Status filter; เพิ่ม Comment Count, Favorite Count, Owner ID, Owner Account Status ใน Asset Detail fields; ปรับ Asset Status History ให้เป็นตารางเดียวรวม moderation/report/admin action พร้อมคอลัมน์ Reference; ระบุเงื่อนไข ซ่อนถาวร ให้ครอบคลุม asset ที่ซ่อนชั่วคราวอยู่แล้ว; เพิ่ม Admin Action History field list ใน Asset Report Detail พร้อมคอลัมน์ สถานะสินทรัพย์ และ ส่งอีเมล; ปรับ Reported Comments list fields ให้ตรง prototype (Comment ID และ Comment Type ย้ายไป Comment Report Detail); เพิ่ม `ASSET_AUTO_HIDE` และเปลี่ยน `REPORT_CLEAR` เป็น `REPORT_REOPEN` ใน Audit action types |
| `BO-10-REMOVED-v0.1` | 2026-08-19 | ลบ `BackOffice/10_SOCIAL_INTERACTION_MODULE.md` ออกเนื่องจากโมดูล Social Interaction ถูกยุบรวมเข้า Asset Management เหลือเฉพาะ Reported Comments เป็น submenu ที่ 3 ของ Asset Management ตาม prototype; Like/Favorite และ Follow analytics ไม่มีใน prototype จึงถูกลบออก ปรับ cross-reference ในเอกสาร BO/PRD ที่เกี่ยวข้องทั้งหมดให้ชี้ Reported Comments ไป `04_ASSET_MANAGEMENT_MODULE.md` |
| `BO-DIR-POSTPONE-v0.1` | 2026-08-11 | Remove Directory from Phase 1 BO prototype/scope because FO directory menu entries are placeholders without approved detail pages; keep `07_DIRECTORY_MODULE.md` as future reference only. |
| `BO-06-v0.2` | 2026-08-05 | ปรับ Market Data Phase 1 เป็น read-only API/backend-synced master/reference data: ไม่มี BO add/edit/delete/import/export/override/manual status action, เหลือ list/detail/search/filter/source metadata/sync log/manual sync ตาม operations permission และ FO cache usage |
| `BO-PROTO-HANDOFF-v0.2` | 2026-08-01 | Add prototype handoff notes for current non-protected BO prototype shell modules: Market Data, Directory, Audit Log, Offer Management, Watch Alert, Help & Support, Account Deletion, Notifications, Reports & Analytics, and Admin Settings. Clarify which prototype areas are aligned at shell/navigation level and which implementation gaps remain against module specs. |
| `BO-04-v0.2` | 2026-07-20 | Lock Asset Management prototype handoff notes after prototype completion. Align responsive layout, permission/privacy, route/filter behavior, Asset List/Detail, Reported Assets/Asset Report Detail actions, and FO sync impact with `BackOffice/04_ASSET_MANAGEMENT_MODULE.md`. |
| `BO-03-v0.3` | 2026-07-16 | Clarify account suspension policy: V1 has no `Restricted` account state, `>= 3 reports` is priority review only, `>= 5 reports/reporters` or high-risk evidence may suspend, suspend/ban must revoke FO session, email is the primary user notification channel, and delivery/audit must be traceable. |
| `BO-03-v0.2` | 2026-07-13 | Lock User List prototype as display/interaction source of truth. Align responsive layout, route/filter behavior, Account Deletion handoff, no direct User List export, `Deleted / Archived` historical review visibility, and Prototype Handoff Notes. |
| `BO-PRD-v0.1` | 2026-07-06 | เริ่มชุดเอกสาร Back Office baseline หลัง FO cleanup เพิ่ม reading order, source-of-truth rules, module map, sprint plan และ dev checklist |
| `INT-MAP-v0.1` | 2026-07-06 | เพิ่ม shared FO/BO integration map ที่ `ProjectAdmin/FO_BO_INTEGRATION_MAP.md` เพื่อให้ FO/BO แยกเอกสารแต่ trace งานข้ามระบบได้ |
| `BO-00-v0.1` | 2026-07-06 | เพิ่ม Back Office Global Rules module ครอบคลุม responsive web, admin access control, shared patterns, canonical statuses, FO sync, audit, privacy, exports และ responsive QA |
| `BO-01-v0.1` | 2026-07-06 | เพิ่ม BO Authentication and Admin Accounts module ครอบคลุม login, Email OTP, session, lockout, admin lifecycle, permission enforcement, security audit และ responsive auth screens |
| `BO-02-v0.1` | 2026-07-06 | เพิ่ม BO Dashboard module ครอบคลุม responsive dashboard, metric cards, pending queues, SLA signals, activity feed, policy-based views และ drill-in ไป module ที่เกี่ยวข้อง |
| `BO-03-v0.1` | 2026-07-06 | เพิ่ม BO User Management module ครอบคลุม user list/detail, auth method, login history, reported user context, reset password, suspend/ban, soft delete/archive, FO impact และ audit |
| `BO-04-v0.1` | 2026-07-06 | เพิ่ม BO Asset Management module ครอบคลุม asset list/detail, status visibility, reported assets, moderation actions, sensitive fields, FO sync และ audit |
| `BO-05-v0.1` | 2026-07-06 | เพิ่ม BO Content / Board module ครอบคลุม article editor, publish/schedule/archive, preview as FO, category, banner, reported Board Content, analytics และ audit |
| `BO-06-v0.1` | 2026-07-06 | เพิ่ม BO Market Data module ครอบคลุม brand, model, reference, price index, The Watch API provider sync/cache, internal database ownership, BO CRUD/manual override, active/inactive, import/export, data quality, FO autocomplete/search/Watch Alert/Portfolio sync และ audit |
| `BO-07-v0.1` | 2026-07-06 | เพิ่ม BO Directory module ครอบคลุม directory items, categories, contact/map/images, active/inactive/archive, import/export, FO publication control, placeholder/route decision และ audit |
| `BO-08-v0.1` | 2026-07-06 | เพิ่ม BO Audit Log module ครอบคลุม immutable audit schema, action groups, search/filter, export, retention, sensitive/destructive/provider-sync trace และ policy-based visibility |
| `BO-09-v0.1` | 2026-07-06 | เพิ่ม BO Offer Management module ครอบคลุม read-only offer list/detail, status `Rejected`, related chat context, notification delivery, account deletion dependency, export และ audit |
| `BO-10-v0.1` | 2026-07-06 | เพิ่ม BO Social Interaction module ครอบคลุม comment/reply moderation, reported comment queue, like/favorite analytics, follow analytics, FO sync, responsive layout และ audit |
| `BO-11-v0.1` | 2026-07-06 | เพิ่ม BO Watch Alert module ครอบคลุม alert criteria, trigger history, notification delivery, Sale-only match, admin disable/enable, market data dependency, FO result list destination และ audit |
| `BO-12-v0.1` | 2026-07-06 | เพิ่ม BO Help / Support module ครอบคลุม ticket queue, manual ticket จาก LINE/Phone/Email, assignment, reply/internal note, status/priority/SLA, related entity, FO contact-only/future ticket history mode และ audit |
| `BO-13-v0.1` | 2026-07-06 | เพิ่ม BO Account Deletion Requests module ครอบคลุม deletion request queue, pending offer validation, 30-day grace period, archive/anonymization tracking, support escalation, FO visibility impact และ audit |
| `BO-14-v0.1` | 2026-07-06 | เพิ่ม BO Notifications module ครอบคลุม broadcast draft/approval/schedule/send, system trigger templates, FO-supported types, delivery logs, retry rules, Broadcast FO scope decision และ audit |
| `BO-15-v0.1` | 2026-07-06 | เพิ่ม BO Reports & Analytics module ครอบคลุม report catalog, user/asset/offer/chat/content/social/search/watch alert/support/notification/account deletion reports, CSV/Excel export, background export job, admin access control, sensitive masking และ audit |
| `BO-16-v0.1` | 2026-07-06 | เพิ่ม BO Admin Settings module ครอบคลุม admin own settings, admin account lifecycle, Admin Access Matrix, security/system defaults, retention/export policy, feature flags, integration metadata และ audit |

| `BO-HANDOFF-v0.1` | 2026-07-06 | เพิ่ม BO Final Review And Dev Handoff สรุป module completeness, implementation order, locked decisions, priority open decisions, QA focus และ dev handoff notes |

## Source Of Truth Order

Exception: for completed prototype screens, `Prototypes/bo-prototype.html` is the source of truth for visual layout, responsive behavior, route/filter interaction, and on-screen state. Older PRD/spec wording must be aligned to the prototype before implementation handoff.

หากเอกสาร BO ขัดกัน ให้ตัดสินตามลำดับนี้:

1. `BackOffice/BO_MASTER_BASELINE.md`
2. `BackOffice/00_GLOBAL_RULES_MODULE.md`
3. `BackOffice/README_MODULE_INDEX.md`
4. `BackOffice/BO_FINAL_REVIEW_AND_HANDOFF.md`
5. Existing Back Office source docs: `BO_PRD.md`, `BO_Spec.md`, `BO_Spec_Completion_Addendum.md`
6. Front Office source docs ที่เกี่ยวข้อง โดยเฉพาะ `FrontOffice/18_ADMIN_SCOPE_NOTE.md`, `15_TRUST_SAFETY_MODULE.md`, `12_BOARD_MODULE.md`, `08_OFFER_MODULE.md`, `07_CHAT_MODULE.md`, `09_NOTIFICATION_MODULE.md`, `10_WATCH_ALERT_MODULE.md`, `13_SETTINGS_MODULE.md`
7. Shared cross-system traceability: `ProjectAdmin/FO_BO_INTEGRATION_MAP.md`
8. Prototype files และ legacy notes

## Baseline Rules

- Back Office เป็น web application สำหรับ internal admins เท่านั้น
- Back Office ต้องเป็น responsive web app รองรับ desktop, tablet และ mobile-width browsers
- Admin ไม่ใช่ admin access ใน FO mobile app
- BO ต้องควบคุม moderation, audit trail, content publishing, user support, market data และ operational visibility สำหรับข้อมูลที่เกิดจาก FO
- ทุก admin action ที่เปลี่ยนข้อมูลต้อง admin access check และ audit-log
- BO docs ต้องแยกจาก FO mobile PRD แต่ BO/FO behavior mapping ต้องชัดเจน
