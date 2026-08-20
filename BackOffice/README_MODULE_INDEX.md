# TukDaeng Back Office Module Index

Current baseline: `BO-PRD-v0.1`

Version registry: `DOCUMENT_VERSION.md`

## Purpose

ไฟล์นี้เป็น index สำหรับชุดเอกสาร Back Office ของ TukDaeng ใช้ให้ Product, UX, Dev, QA และ Operations เห็นลำดับการอ่าน ขอบเขต module และ phase ของงาน BO อย่างชัดเจน

BO docs แยกจาก FO docs แต่เชื่อมโยงการทำงานข้ามระบบผ่าน `../ProjectAdmin/FO_BO_INTEGRATION_MAP.md`

## Recommended Reading Path

| Step | File | Use For |
| --- | --- | --- |
| 1 | `DOCUMENT_VERSION.md` | Current BO baseline และ source-of-truth rules |
| 2 | `BO_MASTER_BASELINE.md` | Scope รวม, admin accesss, modules, phase plan และ open decisions |
| 3 | `00_GLOBAL_RULES_MODULE.md` | Responsive layout, admin access control, status, audit, privacy, FO sync และ pattern กลาง |
| 4 | `../ProjectAdmin/FO_BO_INTEGRATION_MAP.md` | แผนที่ trigger/result ระหว่าง FO และ BO |
| 5 | `BO_DEV_IMPLEMENTATION_CHECKLIST.md` | Checklist สำหรับแตก ticket dev และเก็บ Prototype Handoff Notes ระหว่าง BA/UX ทำ prototype |
| 6 | `BO_PRD.md` | Existing product requirement source |
| 7 | `BO_Spec.md` | Existing screen/module specification source |
| 8 | `BO_Spec_Completion_Addendum.md` | Coverage เพิ่มเติมเรื่อง offer/chat, watch alert, support, deletion, notifications |
| 9 | `../FrontOffice/18_ADMIN_SCOPE_NOTE.md` | Boundary ว่า Admin อยู่ฝั่ง Web Back Office เท่านั้น |

## Prototype Handoff Notes Workflow

ระหว่าง BA/UX ทำ BO prototype ให้ครบทุก module ยังไม่ต้องทำ Dev Handoff Sheet เต็มทีละหน้า ให้เก็บ note สั้น ๆ ไว้ใน `BO_DEV_IMPLEMENTATION_CHECKLIST.md` ก่อน

เมื่อ prototype ของ module ใดเสร็จ ให้ใช้คำสั่งกับ Codex รูปแบบนี้:

```text
หน้า [ชื่อโมดูล] prototype เสร็จแล้ว
ช่วยเทียบกับ BackOffice/[ไฟล์โมดูล].md
แล้วอัปเดต Prototype Handoff Notes ให้ด้วย
```

ตัวอย่าง:

```text
หน้า User Management prototype เสร็จแล้ว
ช่วยเทียบกับ BackOffice/03_USER_MANAGEMENT_MODULE.md
แล้วอัปเดต Prototype Handoff Notes ให้ด้วย
เน้น responsive, permission, route/filter, FO sync impact
```

Codex ต้องทำ 3 อย่าง:

1. เทียบ prototype กับ spec/module checklist
2. สรุป gap หรือประเด็นที่ยังต้องตัดสินใจ
3. เพิ่ม `### [Module] Prototype Handoff Notes` ลงใน `BO_DEV_IMPLEMENTATION_CHECKLIST.md`

มาตรฐานการทำงาน: prototype เสร็จหนึ่ง module -> ตรวจ spec gap -> อัปเดต handoff notes ของ module นั้น -> รวบรวมเป็น Dev Handoff Sheet จริงเมื่อ prototype ทุก module นิ่งแล้ว

## Module Map

| No. | Module | Primary Purpose | Phase |
| --- | --- | --- | --- |
| 00 | `00_GLOBAL_RULES_MODULE.md` | Responsive layout, admin access, audit, status, privacy, timezone, FO sync และ destructive-action rules | 1 |
| 01 | `01_AUTHENTICATION_MODULE.md` | Email/password login, Email OTP, sessions, admin account lifecycle | 1 |
| 02 | `02_DASHBOARD_MODULE.md` | Dashboard metrics, pending queues, SLA signals, activity feed และ policy-based overview | 1 |
| 03 | `03_USER_MANAGEMENT_MODULE.md` | User list/detail, auth method, login history, report context, suspend/ban, reset password, FO impact | 1 |
| 04 | `04_ASSET_MANAGEMENT_MODULE.md` | Asset list/detail, status visibility, reported assets, moderation, sensitive fields, FO sync | 1 |
| 05 | `05_CONTENT_BOARD_MODULE.md` | Board articles, editor, publish/schedule/archive, categories, banners, reported Board Content, FO sync | 1 |
| 06 | `06_MARKET_DATA_MODULE.md` | Read-only API/backend-synced watch brand, model, reference, detail, price index, sync logs, FO autocomplete/search/alert/portfolio sync | 1 |
| 07 | `07_DIRECTORY_MODULE.md` | Future/postponed Directory reference only; not exposed in Phase 1 BO prototype or Phase 1 build scope until FO directory detail routes are approved | Future |
| 08 | `08_AUDIT_LOG_MODULE.md` | Immutable audit events, schema, search/filter, export, retention, sensitive/destructive/provider-sync trace | 1 |
| 09 | `09_OFFER_CHAT_MODULE.md` | Read-only offer list/detail, buyer/seller and asset interest overview, related chat context, notification delivery | 2 |
| 11 | `11_WATCH_ALERT_MODULE.md` | Watch Alert criteria, trigger history, Sale-only match, notification delivery, admin disable | 2 |
| 12 | `12_HELP_SUPPORT_MODULE.md` | Help/support ticket queue, manual contact-channel tickets, assignment, reply history, SLA tracking | 2 |
| 13 | `13_ACCOUNT_DELETION_MODULE.md` | Delete-account request queue, pending offer validation, 30-day grace period, archive/anonymization workflow | 2 |
| 14 | `14_NOTIFICATIONS_MODULE.md` | Broadcast notification และ system trigger templates/logs | 2 |
| 15 | `15_REPORTS_ANALYTICS_MODULE.md` | Exportable reports across user, asset, offer, chat, content, asset reported comments, search, watch alert, support, notifications, account deletion | 2 |
| 16 | `16_ADMIN_SETTINGS_MODULE.md` | Admin own settings, admin account lifecycle, Admin Permission config, security/system settings, retention/export policy | 3 |
| 17 | `17_OPTION_MASTER_MODULE.md` | Internal option master management for FO Add/Edit Asset, Search Filter, Watch Alert criteria; option group list/detail, add/edit/deactivate/reactivate/reorder, audit | 1 |

## Final Handoff

| File | Purpose |
| --- | --- |
| `BO_FINAL_REVIEW_AND_HANDOFF.md` | สรุปความครบของ BO, implementation order, locked decisions, priority open decisions, QA focus และ dev handoff notes |

## Phase 1 Baseline

Phase 1 ต้องส่งมอบ BO foundation ที่ใช้งานได้จริง:

- Global BO Rules
- BO auth และ Admin Permission
- Dashboard shell พร้อม metrics contract หรือ mocked API contract
- User Management
- Asset Management
- Content / Board Management
- Market Data
- Option Master
- Audit Log

Phase 1 ยังไม่รวม real-time admin-user chat, AI moderation, external CRM integration หรือ payment operations

## BO/FO Boundary

- FO users เป็นคน report, block, create assets, make offers, chat, follow, comment, save watch alerts, read Board content และ request account deletion
- BO admins เป็นคน review, moderate, publish, support, configure, export และ audit records เหล่านั้น
- BO action results ต้อง sync กลับไปยัง FO public surfaces แบบทันทีหรือผ่าน async state ที่ระบุชัดเจน
- Cross-system trigger/result ownership อยู่ใน `../ProjectAdmin/FO_BO_INTEGRATION_MAP.md`
