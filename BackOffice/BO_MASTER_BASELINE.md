# TukDaeng Back Office Master Baseline

**Version:** `BO-PRD-v0.1`  
**Date:** 2026-07-06  
**Status:** Draft baseline started  
**Platform:** Responsive Web Back Office  
**Audience:** Admin  

## 1. Objective

Back Office คือ responsive internal web system สำหรับทีมภายใน ใช้ดูแลและปฏิบัติการระบบ TukDaeng หลังจากผู้ใช้ FO สร้างข้อมูลหรือกิจกรรมต่าง ๆ เช่น marketplace, social, support, content และ notification

BO ต้องช่วยให้ทีม Admin จัดการ moderation, user support, content publishing, market master data, reports และ auditability ได้ครบถ้วน

BO ต้องแยกจาก FO mobile app ชัดเจน Admin ไม่ใช่ admin access ใน FO mobile app

รายละเอียด trigger ข้ามระบบและผลลัพธ์ที่เกิดบน FO อยู่ในเอกสาร module ของ BO และ FO ที่เกี่ยวข้อง

## 2. Product Goals

| Goal | Requirement |
| --- | --- |
| Operational control | Admin จัดการ users, assets, content, market data, support, notifications และ reports ได้; Directory ถูกเลื่อนออกจาก Phase 1 จนกว่า FO directory detail routes จะเปิด |
| Trust & safety | Admin review reports, moderate content, suspend/ban users และตรวจสอบ action ได้ |
| Responsive operation | BO รองรับ desktop, tablet และ mobile-width browser โดย optimize workflow หนาแน่นสำหรับหน้าจอใหญ่ |
| FO continuity | BO action ต้อง sync ผลกลับไป FO surfaces เช่น Feed, Asset Detail, Board, Search, Profile, Watch Alert และ Notification |
| Traceability | Sensitive action ต้องมี audit trail พร้อม before/after value, admin identity, admin access, timestamp และ reason เมื่อเกี่ยวข้อง |
| Team efficiency | Workflow ต้องรองรับ filtering, safe bulk review, exports, assignment และ SLA tracking |

## 3. Admin Access Model

BO has exactly one admin account type: `Admin`. There are no BO sub-types. Responsibilities such as content, support, market data, moderation, audit, export, and settings are controlled by module/action policy under the same Admin account type.

| Admin Account Type | Responsibility |
| --- | --- |
| Admin | Operates BO modules according to module/action policy, sensitive-data policy, confirmation, reason, and audit rules. |
## 4. Phase 1 Scope

Phase 1 คือ BO foundation ที่ล็อกใน prototype แล้ว ครอบคลุม modules ที่จำเป็นสำหรับรองรับ FO launch และการควบคุม content/data หลัก

| Module | Phase 1 Scope |
| --- | --- |
| Global BO Rules | Responsive layout, admin access control, shared patterns, status, audit, privacy, FO sync |
| Auth / Admin Accounts | Email/password login, mandatory Email OTP for Admin, session timeout, failed login lockout |
| Admin Permission | Module visibility และ action-level permission enforcement |
| Dashboard | Key metrics, pending queues, recent activity, last updated snapshot |
| User Management | User list, search/filter/sort, profile/detail view, login history, suspend/ban/restore, reset password, Account Deletion handoff, no direct User List export |
| Asset Management | `04_ASSET_MANAGEMENT_MODULE.md` - Asset list/detail, status visibility, reports, flag/unflag, temporary hide/unhide, permanent hide, ลบโดยเจ้าของ retained record, force status change, sensitive-field control |
| Offer Management | `09_OFFER_CHAT_MODULE.md` - Read-only offer list/detail, buyer/seller and asset interest overview, pending-offer dependency |
| Content / Board | `05_CONTENT_BOARD_MODULE.md` - Article/category CRUD, preview as FO, draft/publish/schedule/archive, automatic Board Main placement from Published Articles; banner/featured ordering is future scope |
| Market Data | `06_MARKET_DATA_MODULE.md` - Brand/model/reference/price index management และ active/inactive status |
| Option Master | `17_OPTION_MASTER_MODULE.md` - Internal option master management สำหรับ FO Add/Edit Asset, Search Filter, Watch Alert criteria; option group list/detail, option add/edit/deactivate/reactivate/reorder, group add/edit/deactivate/reactivate/delete/reorder, group audit log, audit |
| Watch Alert | `11_WATCH_ALERT_MODULE.md` - Alert criteria view, trigger history, notification on/off, disable abuse alerts |
| Help & Support | `12_HELP_SUPPORT_MODULE.md` - Ticket queue, manual ticket จาก LINE/Phone/Email, assignment, reply history, status, priority, SLA, related entity |
| Account Deletion | `13_ACCOUNT_DELETION_MODULE.md` - Request queue, pending-offer validation, 30-day grace period, archive/anonymization tracking |
| Notifications | `14_NOTIFICATIONS_MODULE.md` - Broadcast notifications, system trigger templates, delivery logs, retry failed notifications, FO-supported type constraints |
| Reports | `15_REPORTS_ANALYTICS_MODULE.md` - User, asset, offer, chat, board, asset reported comments, search, watch alert, support, notification, account deletion reports, export jobs |
| Audit Log | `08_AUDIT_LOG_MODULE.md` - Immutable event capture, search/filter, export, Admin visibility |
| Admin Settings | `16_ADMIN_SETTINGS_MODULE.md` - Admin own settings, admin account lifecycle, Admin Access Matrix, security/system defaults, retention/export policy, feature flags, integration metadata |

Directory is postponed from Phase 1. Keep `07_DIRECTORY_MODULE.md` as a future reference only; do not expose the BO Directory menu, route, CRUD, publication controls, map/contact fields, or FO sync behavior in Phase 1 unless Product explicitly reopens the scope.

## 5. Phase 2 Scope

Phase 2 คือ modules และ flows ที่ยังไม่ล็อกใน prototype ต้องทำ prototype ส่วนนั้นเสร็จก่อน แล้วจึงปรับข้อมูลเป็น Phase 1

| Module | Phase 2 Scope |
| --- | --- |
| Directory | `07_DIRECTORY_MODULE.md` - รอ FO directory detail routes และ taxonomy approval |
| Chat moderation workflow | Remove/hide chat message, reported chat queue (prototype Offer Management เป็น read-only ไม่มี chat moderation) |
| Offer write actions | Force expire, invalidate, accept/decline จาก BO (prototype Offer Management เป็น read-only) |

## 6. Phase 3 Scope

Phase 3 คือ advanced workflow และ external integration ที่ยังไม่อยู่ใน prototype

| Module | Phase 3 Scope |
| --- | --- |
| Advanced moderation workflow | Automated compliance tools, AI moderation, advanced dispute workflow |
| SLA dashboard | Dedicated SLA monitoring dashboard |
| External integrations | CRM integration, external compliance tools |

## 7. Core BO/FO Action Mapping

ส่วนนี้เป็น summary ระดับสูง รายละเอียดเต็มให้ดูในเอกสาร module ของ BO และ FO ที่เกี่ยวข้อง

| BO Action | FO Result |
| --- | --- |
| Suspend user | User login ไม่ได้ session ควรถูก revoke หรือ block ใน auth check ถัดไป |
| Ban user | User ถูก block จนกว่า Admin จะ unban |
| Remove asset | Asset หายจาก Feed, Search, public Profile และ Watch Alert matches |
| Force asset status to Hide | Asset หายจาก public surfaces และเหลือ owner-only |
| Force asset status to Sold | Asset ย้ายไป owner Sold tab และแก้จาก FO ไม่ได้ |
| Publish article | Article แสดงใน Board, category, search และ detail เมื่อถึง publish time |
| Archive article | Article หายจาก Board/search/category และ direct link แสดง unavailable behavior |
| Hide comment | Comment หายจาก Asset Detail |
| Disable watch alert | Alert ไม่ trigger notification ใหม่ |
| View offer status | Admin ดู offer list/detail แบบ read-only; offer status เปลี่ยนจาก FO user action หรือ system rule ของ Asset/Account workflow |
| Resolve support ticket | User เห็น ticket status update ถ้า FO expose ticket history |

## 8. Global Rules

- Shared BO rules อยู่ใน `00_GLOBAL_RULES_MODULE.md`
- Timezone: แสดงเวลาใน BO เป็น `Asia/Bangkok`
- Currency: แสดงราคาเป็น THB
- Data tables: ต้องรองรับ pagination, search, filter, sort และ export ตามสิทธิ์
- Destructive actions: ต้องมี confirmation และ reason เมื่อ policy/audit ต้องการ
- Sensitive data: mask เป็น default เว้นแต่ admin access มีสิทธิ์ชัดเจน
- Audit log: required สำหรับ create, update, delete, publish, archive, suspend, ban, flag, remove, export, template update, permission update และ login events
- Exports: export ขนาดใหญ่ใช้ background job

## 9. Non-Functional Baseline

| Area | Baseline |
| --- | --- |
| Platform | Responsive web app รองรับ desktop, tablet และ mobile-width browsers |
| Language | ภาษาไทยเป็นหลัก ใช้ English technical term ได้เมื่อจำเป็น |
| Auth | JWT + refresh token หรือ secure session model ที่เทียบเท่า; mandatory Email OTP สำหรับ BO Admin login |
| Security | HTTPS, admin access control, IP whitelist option สำหรับ production, audit log retention อย่างน้อย 1 ปี |
| Performance | Dashboard target load ภายใน 3 วินาทีหลัง auth; table ขนาดใหญ่ต้อง server-side paginate |
| Accessibility | Label ชัดเจน keyboard reachable controls และ visible focus states |

## 10. Open Decisions

| ID | Decision Needed | Current Recommendation |
| --- | --- | --- |
| BO-DEC-001 | BO language mode | Thai primary สำหรับ V1; English optional ภายหลัง |
| BO-DEC-002 | Chat and offer retention period | ต้องสรุปร่วมกับ legal/compliance ก่อน Phase 2 build |
| BO-DEC-003 | Account deletion anonymization timing | ใช้ 30-day grace period ตาม FO decision เว้นแต่ legal เปลี่ยน |
| BO-DEC-004 | Admin remove asset permission | ให้ remove ได้พร้อม required reason และ audit; high-value dispute อาจต้อง Admin approval |
| BO-DEC-005 | Board public SEO web requirement | ถือเป็น mobile Board content ก่อน จนกว่าจะเพิ่ม web SEO scope ชัดเจน |
| BO-DEC-006 | รูปแบบ integration map ระหว่าง FO และ BO หลังตัดไฟล์เดิม | กระจายข้อมูล trigger/result ไปไว้ในเอกสาร module ของ BO และ FO ที่เกี่ยวข้อง จนกว่าจะตัดสินใจว่าจะสร้าง integration map กลางขึ้นใหม่หรือไม่ |

