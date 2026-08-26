# BO Final Review And Dev Handoff

**Version:** `BO-HANDOFF-v0.1`  
**Date:** 2026-07-06  
**Status:** Draft handoff  
**Scope:** Back Office documentation baseline `00` - `16`

## 1. สถานะโดยรวม

เอกสาร Back Office baseline ครบตาม module index แล้ว ตั้งแต่ `00_GLOBAL_RULES_MODULE.md` ถึง `16_ADMIN_SETTINGS_MODULE.md`

| Area | Status |
| --- | --- |
| Module coverage | Complete for current BO index |
| FO/BO separation | Complete; FO และ BO อยู่คนละ folder และเชื่อมผ่าน integration map |
| Thai-primary documentation | Complete; ใช้ภาษาไทยเป็นหลักและใช้ English technical term เมื่อจำเป็น |
| Responsive web requirement | Covered in every BO module |
| admin access control / Admin Permission | Covered in Global Rules, Auth, module specs, Admin Settings |
| Audit requirement | Covered in Global Rules, Audit Log และทุก module ที่มี mutation/export/sensitive access |
| Phase 1 scope | Covered |
| Phase 2 scope | Covered |
| Phase 3 baseline | Covered |

## 2. Source Of Truth Reading Order

ให้ทีม dev อ่านตามลำดับนี้:

1. `BackOffice/DOCUMENT_VERSION.md`
2. `BackOffice/README_MODULE_INDEX.md`
3. `BackOffice/BO_MASTER_BASELINE.md`
4. `BackOffice/00_GLOBAL_RULES_MODULE.md`
5. Module spec ตามงานที่จะ implement
6. `BackOffice/BO_DEV_IMPLEMENTATION_CHECKLIST.md`

ถ้าเอกสาร BO ขัดกัน ให้ยึด source-of-truth order ใน `BackOffice/DOCUMENT_VERSION.md`

## 3. Module Completion Checklist

| # | Module | Phase | Status |
| --- | --- | --- | --- |
| 00 | Global Rules | Foundation | Complete |
| 01 | Authentication / Admin Accounts | 1 | Complete |
| 02 | Dashboard | 1 | Complete |
| 03 | User Management | 1 | Complete |
| 04 | Asset Management | 1 | Complete |
| 05 | Content / Board | 1 | Complete |
| 06 | Market Data | 1 | Complete |
| 07 | Directory | Future | Postponed from Phase 1 |
| 08 | Audit Log | 1 | Complete |
| 09 | Offer / Chat | 2 | Complete |
| 11 | Watch Alert | 2 | Complete |
| 12 | Help / Support | 2 | Complete |
| 13 | Account Deletion Requests | 2 | Complete |
| 14 | Notifications | 2 | Complete |
| 15 | Reports & Analytics | 2 | Complete |
| 16 | Admin Settings | 3 | Complete |

## 4. Recommended Implementation Order

### 4.1 Foundation Sprint

1. Auth / Admin Accounts
2. Global layout shell, navigation, admin access control guard
3. Shared table/filter/export components
4. Shared confirmation modal with reason input
5. Audit helper / audit event contract
6. Dashboard skeleton with policy-based cards

### 4.2 Phase 1 Build

1. User Management
2. Asset Management
3. Content / Board
4. Market Data
5. Audit Log
6. Dashboard drill-in and queue summary

### 4.3 Phase 2 Build

1. Offer / Chat
2. Watch Alert
3. Help / Support
4. Account Deletion Requests
5. Notifications
6. Reports & Analytics

### 4.4 Phase 3 Build

1. Admin Settings
2. Fine-grained permission changes only if Product approves
3. Retention/export policy controls after legal/compliance decision

## 5. Critical Contract Decisions Already Locked

| Topic | Locked Decision |
| --- | --- |
| Asset collection wording | ใช้ `Show` / `Hide` ตาม FO เป็นหลัก; legacy `Collection Show` / `Collection Hide` ต้อง normalize |
| Offer decline/reject wording | FO action/button ใช้ `Decline`; system/BO/API status ใช้ `Rejected`; legacy `Declined` normalize เป็น `Rejected` |
| Watch Alert destination | Notification ต้องเปิด `Watch Alert Result List` ห้ามเปิด Asset Detail โดยตรง |
| Watch Alert matching | Match เฉพาะ asset status `Sale` |
| Chat / New Message | ไม่เข้า FO Notification Center; ใช้ Chat badge/count เท่านั้น |
| FO notification types | V1 รองรับ `Like`, `Comment`, `Follow`, `Offer`, `Watch Alert` |
| Help / Support V1 | FO Help เป็น contact-only: LINE / Phone / Email; BO รองรับ manual/support ticket และ future in-app ticket history |
| Account Deletion | FO soft delete/deactivate, revoke session, 30-day grace period; BO track request, validation, archive/anonymization |
| The Watch API | Backend sync/cache เท่านั้น, เก็บลง TukDaeng database ก่อน BO/FO ใช้งาน, BO CRUD/manual override ได้ตาม permission |
| Audit | Mutation/export/sensitive reveal/destructive/public-impact actions ต้อง audit |

## 6. Highest Priority Open Decisions

| Priority | Decision | Source | Why It Matters |
| --- | --- | --- | --- |
| P0 | Chat / offer retention period | `INT-DEC-003`, `BO-OFFER-DEC-001`, `DEL-DEC-002` | กระทบ chat export, dispute, account deletion, anonymization |
| P0 | Account deletion anonymization timing หลัง 30-day grace period | `BO-DEC-003`, `DEL-DEC-003` | กระทบ data model, archive job, privacy/compliance |
| P0 | The Watch API production plan/quota และ FX source USD -> THB | `BO-MARKET-DEC-005`, `BO-MARKET-DEC-006` | กระทบ market data sync, price index, fallback |
| P0 | Sync timing จาก BO moderation ไป FO surfaces | `INT-DEC-001` | กระทบ cache invalidation และ user-visible behavior |
| P1 | Directory future activation level | `INT-DEC-005`, `BO-DIR-DEC-001` | Directory is postponed from Phase 1 while FO menu entries remain placeholder-only without detail routes |
| P1 | FO support ticket history หรือ contact-only | `INT-DEC-004`, `SUP-DEC-001` | กระทบ Help / Support API, BO reply sync, FO UX |
| P1 | Broadcast แสดงใน FO Notification Center หรือ push-only | `NOTI-DEC-001` | กระทบ FO notification type list และ payload |
| P1 | Sensitive export ต้องมี approval เพิ่มหรือไม่ | `REP-DEC-004`, `SET-DEC-004` | กระทบ Admin Settings, Reports, Audit |
| P2 | Board public SEO web requirement | `BO-DEC-005`, `BO-CONTENT-DEC-001` | กระทบ Board content delivery และ routing |
| P2 | Fine-grained permission editor หรือ fixed admin access matrix | `SET-DEC-001` | กระทบ Admin Settings data model และ QA scope |

## 7. QA Focus Areas

| Area | QA Focus |
| --- | --- |
| Responsive | ทดสอบ 375px, 768px, 1280px, 1440px ทุก module |
| admin access control | ตรวจ route guard, action/API guard, field masking, menu visibility |
| Audit | ตรวจ before/after, reason, actor, target, IP/user agent, correlation ID |
| FO sync | ตรวจ BO action ที่กระทบ FO visibility/login/notification/destination |
| Export | Requires permission check, scope control, expiry/background job where needed, and audit export event. |
| Status contracts | ตรวจ canonical statuses เช่น Show/Hide, Rejected, Watch Alert enabled/disabled, account deletion status |
| Error states | Loading, empty, permission denied, not found, partial load, retry |
| Sensitive data | Mask by default; reveal only with business reason, policy approval, and audit log. |

## 8. Dev Handoff Notes

- เริ่ม implement จาก shared foundation ก่อน module หนัก เพื่อไม่สร้าง admin access control/audit/export ซ้ำหลายแบบ
- ทุก list ที่ใหญ่ต้องใช้ server-side pagination/filter/sort
- ทุก export ใหญ่ต้องเป็น background job
- ทุก module ต้องใช้ timezone `Asia/Bangkok`
- ราคาแสดงเป็น THB
- Admin UI ใช้ภาษาไทยเป็นหลัก
- BO Admin Access ไม่สร้าง admin access แยกให้ FO users
- FO user login เข้า BO ไม่ได้ และ BO admin ไม่ใช้ Apple/Google SSO ใน V1
- Permission ใน API/action level เป็นตัวตัดสินสุดท้าย ไม่ใช่แค่ซ่อน UI

## 9. Next Recommended Work

1. Product review open decisions P0/P1
2. Dev break down tickets จาก `BO_DEV_IMPLEMENTATION_CHECKLIST.md`
3. QA สร้าง test cases ตาม module และ focus areas ใน section 7
4. UX ตรวจ responsive wireframe/prototype สำหรับ BO modules ที่เป็น operation-heavy
5. Engineering define API contracts สำหรับ FO/BO sync จากเอกสาร module ของ BO และ FO ที่เกี่ยวข้อง
