# TukDaeng Back Office Master Baseline

**Version:** `BO-PRD-v0.1`  
**Date:** 2026-07-06  
**Status:** Draft baseline started  
**Platform:** Responsive Web Back Office  
**Audience:** Super Admin, Content Admin, Moderator, Support Admin, Market Admin  

## 1. วัตถุประสงค์

Back Office คือ responsive internal web system สำหรับทีมภายใน ใช้ดูแลและปฏิบัติการระบบ TukDaeng หลังจากผู้ใช้ FO สร้างข้อมูลหรือกิจกรรมต่าง ๆ เช่น marketplace, social, support, content และ notification

BO ต้องช่วยให้ทีม Admin จัดการ moderation, user support, content publishing, market master data, reports และ auditability ได้ครบถ้วน

BO ต้องแยกจาก FO mobile app ชัดเจน Admin ไม่ใช่ role ใน FO mobile app

รายละเอียด trigger ข้ามระบบและผลลัพธ์ที่เกิดบน FO อยู่ใน `../ProjectAdmin/FO_BO_INTEGRATION_MAP.md`

## 2. Product Goals

| Goal | Requirement |
| --- | --- |
| Operational control | Admin จัดการ users, assets, content, market data, directory, support, notifications และ reports ได้ |
| Trust & safety | Admin review reports, moderate content, suspend/ban users และตรวจสอบ action ได้ |
| Responsive operation | BO รองรับ desktop, tablet และ mobile-width browser โดย optimize workflow หนาแน่นสำหรับหน้าจอใหญ่ |
| FO continuity | BO action ต้อง sync ผลกลับไป FO surfaces เช่น Feed, Asset Detail, Board, Search, Profile, Watch Alert และ Notification |
| Traceability | Sensitive action ต้องมี audit trail พร้อม before/after value, admin identity, role, timestamp และ reason เมื่อเกี่ยวข้อง |
| Team efficiency | Workflow ต้องรองรับ filtering, safe bulk review, exports, assignment และ SLA tracking |

## 3. Roles

| Role | Responsibility |
| --- | --- |
| Super Admin | สิทธิ์สูงสุดทุก module, admin accounts, sensitive fields, destructive operations, audit log, system config |
| Content Admin | Board articles, categories, banners และ content analytics |
| Moderator | Report review, asset/comment/chat moderation, flagged content queues |
| Support Admin | User profile support, login history, reset password เฉพาะ email accounts, ticket handling, deletion recheck |
| Market Admin | Watch brands, models, references, price index, directory entries และ market reports |

## 4. Phase 1 Scope

Phase 1 คือ BO foundation ขั้นต่ำที่จำเป็นสำหรับรองรับ FO launch และการควบคุม content/data หลัก

| Module | Phase 1 Scope |
| --- | --- |
| Global BO Rules | Responsive layout, RBAC, shared patterns, status, audit, privacy, FO sync |
| Auth / Admin Accounts | Email/password login, 2FA สำหรับ Super Admin และ Content Admin, session timeout, failed login lockout |
| Role Permission | Module visibility และ action-level permission enforcement |
| Dashboard | Key metrics, pending queues, recent activity, date range |
| User Management | User list, filters, profile view, login history, suspend/ban, reset password, soft delete, CSV export |
| Asset Management | `04_ASSET_MANAGEMENT_MODULE.md` - Asset list/detail, status visibility, reports, flag/unflag, soft remove, force status change, sensitive-field control |
| Content / Board | `05_CONTENT_BOARD_MODULE.md` - Article/category/banner CRUD, preview as FO, draft/publish/schedule/archive, featured ordering |
| Market Data | `06_MARKET_DATA_MODULE.md` - Brand/model/reference/price index management และ active/inactive status |
| Directory | `07_DIRECTORY_MODULE.md` - Directory item CRUD, publication status, map/contact fields, image fields |
| Audit Log | `08_AUDIT_LOG_MODULE.md` - Immutable event capture, search/filter, export, Super Admin visibility |

## 5. Phase 2 Scope

| Module | Phase 2 Scope |
| --- | --- |
| Offer & Chat | `09_OFFER_CHAT_MODULE.md` - Offer lifecycle review, related chat room, reported chat, force expire, invalidation, export for dispute |
| Social Interaction | `10_SOCIAL_INTERACTION_MODULE.md` - Comment/reply moderation, like/favorite/follow analytics, reported social content |
| Watch Alert | `11_WATCH_ALERT_MODULE.md` - Alert criteria view, trigger history, notification on/off, disable abuse alerts |
| Help & Support | `12_HELP_SUPPORT_MODULE.md` - Ticket queue, manual ticket จาก LINE/Phone/Email, assignment, reply history, status, priority, SLA, related entity |
| Account Deletion | `13_ACCOUNT_DELETION_MODULE.md` - Request queue, pending-offer validation, 30-day grace period, archive/anonymization tracking |
| Notifications | `14_NOTIFICATIONS_MODULE.md` - Broadcast notifications, system trigger templates, delivery logs, retry failed notifications, FO-supported type constraints |
| Reports | `15_REPORTS_ANALYTICS_MODULE.md` - User, asset, offer, chat, board, social, search, watch alert, support, notification, account deletion reports, export jobs |

## 6. Phase 3 Scope

| Module | Phase 3 Scope |
| --- | --- |
| Admin Settings | `16_ADMIN_SETTINGS_MODULE.md` - Admin own settings, admin account lifecycle, role permission matrix, security/system defaults, retention/export policy, feature flags, integration metadata |

## 7. Core BO/FO Action Mapping

ส่วนนี้เป็น summary ระดับสูง รายละเอียดเต็มให้ใช้ `../ProjectAdmin/FO_BO_INTEGRATION_MAP.md` เป็น integration contract

| BO Action | FO Result |
| --- | --- |
| Suspend user | User login ไม่ได้ session ควรถูก revoke หรือ block ใน auth check ถัดไป |
| Ban user | User ถูก block จนกว่า Super Admin จะ unban |
| Remove asset | Asset หายจาก Feed, Search, public Profile และ Watch Alert matches |
| Force asset status to Hide | Asset หายจาก public surfaces และเหลือ owner-only |
| Force asset status to Sold | Asset ย้ายไป owner Sold tab และแก้จาก FO ไม่ได้ |
| Publish article | Article แสดงใน Board, category, search และ detail เมื่อถึง publish time |
| Archive article | Article หายจาก Board/search/category และ direct link แสดง unavailable behavior |
| Hide comment | Comment หายจาก Asset Detail |
| Disable watch alert | Alert ไม่ trigger notification ใหม่ |
| Force expire offer | Offer ไม่สามารถ accept/decline และออกจาก pending flow |
| Resolve support ticket | User เห็น ticket status update ถ้า FO expose ticket history |

## 8. Global Rules

- Shared BO rules อยู่ใน `00_GLOBAL_RULES_MODULE.md`
- Timezone: แสดงเวลาใน BO เป็น `Asia/Bangkok`
- Currency: แสดงราคาเป็น THB
- Data tables: ต้องรองรับ pagination, search, filter, sort และ export ตามสิทธิ์
- Destructive actions: ต้องมี confirmation และ reason เมื่อ policy/audit ต้องการ
- Sensitive data: mask เป็น default เว้นแต่ role มีสิทธิ์ชัดเจน
- Audit log: required สำหรับ create, update, delete, publish, archive, suspend, ban, flag, remove, export, template update, permission update และ login events
- Exports: export ขนาดใหญ่ใช้ background job

## 9. Non-Functional Baseline

| Area | Baseline |
| --- | --- |
| Platform | Responsive web app รองรับ desktop, tablet และ mobile-width browsers |
| Language | ภาษาไทยเป็นหลัก ใช้ English technical term ได้เมื่อจำเป็น |
| Auth | JWT + refresh token หรือ secure session model ที่เทียบเท่า; 2FA via TOTP สำหรับ role สำคัญ |
| Security | HTTPS, RBAC, IP whitelist option สำหรับ production, audit log retention อย่างน้อย 1 ปี |
| Performance | Dashboard target load ภายใน 3 วินาทีหลัง auth; table ขนาดใหญ่ต้อง server-side paginate |
| Accessibility | Label ชัดเจน keyboard reachable controls และ visible focus states |

## 10. Open Decisions

| ID | Decision Needed | Current Recommendation |
| --- | --- | --- |
| BO-DEC-001 | BO language mode | Thai primary สำหรับ V1; English optional ภายหลัง |
| BO-DEC-002 | Chat and offer retention period | ต้องสรุปร่วมกับ legal/compliance ก่อน Phase 2 build |
| BO-DEC-003 | Account deletion anonymization timing | ใช้ 30-day grace period ตาม FO decision เว้นแต่ legal เปลี่ยน |
| BO-DEC-004 | Moderator remove asset permission | ให้ remove ได้พร้อม required reason และ audit; high-value dispute อาจต้อง Super Admin approval |
| BO-DEC-005 | Board public SEO web requirement | ถือเป็น mobile Board content ก่อน จนกว่าจะเพิ่ม web SEO scope ชัดเจน |
