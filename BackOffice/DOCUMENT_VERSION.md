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
| `BO-09-v0.1` | 2026-07-06 | เพิ่ม BO Offer / Chat module ครอบคลุม offer lifecycle, status `Rejected`, reported chat, attachment scan, notification delivery, account deletion dependency, force expire, invalidation, export และ audit |
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
