# 13 BO Account Deletion Requests Module

**Version:** `BO-13-v0.1`  
**Date:** 2026-07-06  
**Status:** Draft baseline  
**Platform:** Responsive Web Back Office  
**Primary FO Sources:** `../FrontOffice/13_SETTINGS_MODULE.md`, `../FrontOffice/08_OFFER_MODULE.md`, `../FrontOffice/07_CHAT_MODULE.md`, `../FrontOffice/04_ASSET_MANAGEMENT_MODULE.md`, `../FrontOffice/06_PROFILE_MODULE.md`  
**Integration Map:** `../ProjectAdmin/FO_BO_INTEGRATION_MAP.md`

## 1. วัตถุประสงค์

Account Deletion Requests Module ใช้ให้ BO ตรวจสอบและติดตามคำขอลบบัญชีที่เริ่มจาก FO Settings > About your account > Delete account

FO ทำหน้าที่รับ confirmation, soft delete/deactivate account, revoke session และพาผู้ใช้กลับ Sign In ส่วน BO ทำหน้าที่เป็น operational queue สำหรับ validation, blocked condition, archive, anonymization, retention และ audit trail

## 2. ขอบเขต

### 2.1 In Scope

- Account deletion request queue
- Request detail พร้อม user, offer, asset, chat และ retention context
- Validation pending offer ก่อน archive/anonymize
- Recheck blocking conditions
- Approve archive โดย Admin
- Track 30-day grace period
- Archive/anonymization status tracking
- Cancel request ตาม policy
- Export archive report ตาม permission
- Audit log สำหรับทุก action สำคัญ
- Responsive layout สำหรับ desktop, tablet และ mobile

### 2.2 Out of Scope

- FO Delete Account UI
- Legal policy drafting
- Payment/transaction settlement workflow
- Fully automated hard delete โดยไม่มี policy approval
- User self-service restore ถ้า Product ยังไม่เปิด scope
- External compliance tool integration

## 3. FO Deletion Contract

FO Settings module กำหนด behavior หลักดังนี้:

- Delete Account ต้องอยู่ใน `About your account`
- Delete Account ต้องไม่อยู่บน Settings Home โดยตรง
- ต้องมี confirmation title `Delete account?`
- เมื่อ confirm สำเร็จ ระบบต้อง soft delete/deactivate account
- ต้อง revoke session และ clear local token ทันที
- ต้องแสดง `Account deletion started` success modal
- ปุ่ม `Back to sign in` พาไปหน้า Sign In / pre-auth
- ใช้ grace period 30 วันก่อน hard delete/anonymization ตาม policy
- ระหว่าง grace period user login ไม่ได้ หรือเห็น account-deleted support state
- ถ้า API fail ต้องไม่ revoke session, ไม่ sign out และแสดง retry/error state

BO ต้องไม่เปลี่ยน copy หรือ flow ของ FO แต่ต้องรับข้อมูลคำขอและประมวลผลต่อหลัง FO ส่ง request สำเร็จ

## 4. Admin Access & Permissions

BO uses a single Admin account type only. Admin access is controlled by module access, action policy, sensitive-data policy, confirmation, reason, and audit requirements instead of separate BO admin account types.


| Access Area | Rule |
| --- | --- |
| Module access | Admin can use list/detail/search/filter when module access is granted. |
| Write action | Create, update, status change, remove, restore, publish, archive, retry, and similar actions require permission check, confirmation for high-risk actions, reason when FO/user impact exists, and audit log. |
| Sensitive data | Mask by default; reveal only with business reason, policy approval, and audit log. |
| Export | Requires permission check, scope control, expiry/background job where needed, and audit export event. |
| Direct URL/API | Enforce access at route, API, and service layers; never rely only on hidden UI. |
## 5. Responsive Layout

| Breakpoint | Layout |
| --- | --- |
| Mobile <= 767px | Request list เป็น card stack, filter ใช้ collapsible panel, detail เปิด full screen |
| Tablet 768px - 1199px | List/detail แบบ single column หรือ split view ตามพื้นที่ |
| Desktop >= 1200px | Queue table + detail panel หรือ full detail page พร้อม validation sidebar |

Action ที่มีผล irreversible ต้องมี confirmation และต้องไม่อยู่ใน hover-only control

## 6. Request List

Request list ต้องแสดงข้อมูลขั้นต่ำ:

| Field | Requirement |
| --- | --- |
| Request ID | รหัสคำขอลบบัญชี |
| User | User ID, display name, username/email masked ตาม permission |
| Account Status | Active, Deletion Requested, Deactivated, Archived, Anonymized |
| Request Status | Requested, Blocked, Approved, Archived, Cancelled |
| Pending Offers | จำนวน incoming/outgoing pending offer |
| Assets | จำนวน asset ที่ต้อง hide/archive |
| Chat Rooms | จำนวน chat room ที่ต้อง retain/mask |
| Grace Period Ends | วันที่ครบ 30 วัน |
| Requested At | วันที่ผู้ใช้กด Delete account |
| Processed By | Admin/System ที่ดำเนินการล่าสุด |
| Updated At | วันที่แก้ไขล่าสุด |

## 7. Search & Filters

ต้องค้นหาและกรองได้อย่างน้อย:

- Request ID
- User ID / username / email / phone
- Request status
- Account status
- Has pending offer
- Has accepted offer in retention window
- Grace period state: Active, Ending soon, Expired
- Requested date
- Processed by

## 8. Request Status Contract

ใช้ status กลางต่อไปนี้:

| Status | Meaning | FO Impact |
| --- | --- | --- |
| `Requested` | ผู้ใช้ confirm Delete Account สำเร็จและ request ถูกสร้าง | FO revoke session แล้วและ user กลับ Sign In |
| `Blocked` | มี pending offer หรือเงื่อนไขอื่นที่ยัง archive/anonymize ไม่ได้ | User ยัง login ไม่ได้; ต้องเห็น account-deleted support state ถ้าพยายาม login |
| `Approved` | ผ่าน validation และพร้อมเข้าสู่ archive/anonymization ตาม policy | ไม่มี FO access |
| `Archived` | Archive data สำเร็จและ public surfaces ถูกซ่อน/anonymized ตาม policy | Profile/assets ต้องไม่แสดง public |
| `Cancelled` | Request ถูกยกเลิกตาม policy หรือเกิดจาก support/escalation ที่อนุมัติแล้ว | ถ้า restore account ได้ ต้อง sync account status กลับ Active ตาม policy |

หมายเหตุ:

- FO V1 ระบุ soft delete/deactivate หลัง confirm สำเร็จ ดังนั้น `Requested` ไม่ได้แปลว่ายังใช้งานบัญชีได้
- `Cancelled` ไม่ใช่ action ปกติสำหรับผู้ใช้เอง เว้นแต่ Product/Policy เปิด restore flow หรือ Admin ยกเลิกตามเคสผิดพลาด

## 9. Account Status Contract

BO ต้องแยก request status ออกจาก account status:

| Account Status | Meaning |
| --- | --- |
| `Active` | ใช้งาน FO ได้ตามปกติ |
| `Deletion Requested` | มี deletion request แล้ว แต่ยังไม่ deactivate สำเร็จหรืออยู่ระหว่าง sync |
| `Deactivated` | Login/session ถูก block แล้วตาม FO contract |
| `Archived` | ข้อมูลถูกย้าย/จัดเก็บตาม retention policy |
| `Anonymized` | Personal fields ถูก anonymize ตาม policy |

ใน flow ปกติหลัง FO confirm สำเร็จ account ควรเข้าสู่ `Deactivated` ทันที

## 9.1 Deleted / Restore / Retention Policy

ตาม pattern ทั่วไปของเว็บที่ต้องรองรับ audit, dispute และ compliance ไม่ควร hard delete ทุก record ทันทีหลังผู้ใช้กดลบบัญชี

Recommended lifecycle:

| Account State | When It Happens | Data Handling | Can Restore? |
| --- | --- | --- | --- |
| `Deletion Requested` | User confirm delete account จาก FO และ request ถูกสร้าง | เก็บข้อมูลเดิมไว้เพื่อ validation และ dependency check | ยกเลิกได้ตาม policy ถ้ายังไม่ archive/anonymize |
| `Deactivated` | session ถูก revoke และ login ถูก block ระหว่าง grace period | ซ่อน public profile/assets; retain data สำหรับ dependency, support และ audit | กู้คืนได้ภายใน grace period ถ้า Admin/Support policy อนุญาต |
| `Deleted` | ใช้เป็น user-facing BO label เมื่อ deletion สำเร็จแล้ว | ไม่แสดง public surfaces; record ถูก archive และ personal fields เริ่มถูก mask ตาม policy | โดยปกติไม่กู้คืนเป็นบัญชีเดิม |
| `Archived` | Internal storage state หลังจัดเก็บ record เพื่อ audit/retention | เก็บเฉพาะข้อมูลที่จำเป็น เช่น transaction, offer, chat, report, audit reference | ไม่ควร restore ตรงเป็นบัญชีใช้งาน |
| `Anonymized` | หลัง retention/anonymization job ทำงานครบ | ลบหรือแทนที่ personal fields เช่น email, phone, display name, profile image ด้วย anonymous value | กู้คืนไม่ได้ |

UI / Reporting rules:

- ใน Account Deletion module สามารถแสดง `Deleted` เป็น label ที่อ่านง่ายสำหรับ deletion สำเร็จ
- ใน backend/audit ควรเก็บสถานะละเอียดเป็น `Archived` และ `Anonymized` เพื่อรู้ว่าข้อมูลถูกจัดการถึงขั้นไหนแล้ว
- Prototype ปัจจุบันแสดง `Deleted / Archived` ได้ใน User List/filter เพื่อ historical review ตาม permission; production ต้อง mask/anonymize personal data, จำกัด action และยังต้องค้นย้อนหลังได้ใน Account Deletion, Reports และ Audit ตาม permission
- ข้อมูลย้อนหลังที่เรียกดูได้ต้องเป็นข้อมูลที่จำเป็น เช่น user ID, deletion request ID, dates, processed by, blocking reason, retained offer/chat/report references และ audit event
- Personal data หลัง deletion ต้องถูก mask/anonymize ตาม retention policy และ Admin Permission
- Restore ควรเปิดได้เฉพาะก่อน anonymization และควรอยู่ในช่วง grace period เช่น 30 วัน พร้อม reason และ audit
- หลัง anonymization แล้วไม่ควร restore เพราะข้อมูลส่วนตัวที่ใช้สร้าง account กลับมาอย่างถูกต้องไม่ควรมีอยู่แล้ว

## 10. Validation Rules

ก่อน approve archive/anonymization BO ต้องตรวจ:

| Rule | Requirement |
| --- | --- |
| Pending incoming offer | ถ้ามี offer ที่ยัง `Pending` ต้อง block deletion |
| Pending outgoing offer | ถ้ามี offer ที่ยัง `Pending` ต้อง block deletion |
| Accepted offer retention | ถ้ามี accepted offer ใน retention window ต้อง retain offer/chat record และ mask personal fields ตาม policy |
| Active Sale asset | Asset ของผู้ใช้ต้องถูกซ่อนจาก Feed/Search/Watch Alert/Public Profile หลัง account deactivated/archive |
| Show/Hide/Sold asset | ต้องไม่เปิด public surface ที่ขัดกับ account deletion state |
| Chat history | เก็บตาม retention policy แต่ต้อง mask personal profile fields เมื่อถึงขั้น anonymization |
| Reports/safety records | เก็บตาม legal/safety/audit policy |
| Support tickets | Link ไว้เพื่อให้ Admin ตอบ account-deleted support state ได้ |

Pending offer dependency ต้องใช้ source เดียวกับ `BackOffice/09_OFFER_CHAT_MODULE.md` และต้อง audit ทุกครั้งที่ใช้เป็นเหตุผล block

Pending user report หรือ offer/support dispute ต้อง block deletion เช่นเดียวกันจนกว่า Admin จะตรวจ source report และ dependency ให้จบก่อน การลบบัญชีไม่ควร cancel offer หรือปิด dispute อัตโนมัติ; ต้องให้ module ต้นทาง เช่น Offer Management, Asset Management หรือ Help & Support เป็นตัวบันทึกผลการตรวจ แล้ว Account Deletion จึงค่อย approve, keep blocked, หรือ cancel request ตาม policy

## 11. Request Detail

Request detail ต้องมีส่วนข้อมูล:

### 11.1 User Context

- User ID
- Display name / username
- Email / phone / LINE แบบ masked ตาม permission
- Auth method
- Joined date
- Last active
- Current account status
- Current request status
- Support tickets ที่เกี่ยวข้อง

### 11.2 Deletion Timeline

- Requested at
- Session revoked at
- Deactivated at
- Grace period start
- Grace period end
- Last validation run
- Approved at
- Archived at
- Anonymized at
- Cancelled at ถ้ามี

### 11.3 Dependency Summary

- Pending incoming offers
- Pending outgoing offers
- Accepted offers in retention
- Assets by status: Sale, Show, Hide, Sold, Removed/Hidden
- Chat rooms
- Reports/safety cases
- Support tickets

### 11.4 Archive / Anonymization Plan

ต้องแสดงว่า field หรือ entity ใดจะถูก hide, retain, archive หรือ anonymize:

| Data | Action |
| --- | --- |
| Public profile | Hide from public surfaces |
| Profile image | Hide or replace placeholder ตาม policy |
| Username / display name | Mask/anonymize เมื่อถึงขั้น policy |
| Email / phone / LINE | Retain masked แล้ว anonymize เมื่อพ้น retention |
| Assets | Hide from Feed/Search/Public Profile/Watch Alert results |
| Offers | Retain status/timeline ตาม audit/dispute policy |
| Chats | Retain content ตาม retention แต่ mask profile identity ตาม policy |
| Reports | Retain ตาม safety/legal/audit policy |
| Audit logs | Retain immutable |

## 12. Admin Actions

| Action | Permission | Requirement | Audit |
| --- | --- | --- | --- |
| View Request | Admin | Sensitive fields masked ตาม Admin access | Required for sensitive reveal |
| Recheck Blocking Conditions | Admin | Query pending offers/assets/chat/report dependencies ใหม่ | Required |
| Approve Archive | Admin | ต้องไม่มี blocking condition และต้อง confirm | Required |
| Mark Blocked | System, Admin | ต้องมี reason และ linked dependency | Required |
| Cancel Request | Admin | ต้องมี reason และ policy basis | Required |
| Trigger Archive Job | Admin, System | ต้องผ่าน approval หรือ scheduled job policy | Required |
| Trigger Anonymization Job | Admin, System | ต้องถึง grace period/retention condition | Required |
| Export Archive Report | Admin | ต้องมี reason และ export scope | Required |

## 13. Grace Period Rules

- Grace period baseline: 30 วัน
- Start: เมื่อ Delete Account API สำเร็จและ account ถูก deactivated
- End: `deactivated_at + 30 days`
- ระหว่าง grace period user login ไม่ได้
- Public profile/assets ต้องถูกซ่อนทันที ไม่ต้องรอครบ 30 วัน
- เมื่อครบ grace period ระบบต้องพร้อม archive/anonymize ตาม validation และ retention policy
- ถ้ามี blocking condition เช่น pending offer ให้ request เป็น `Blocked` และแสดง reason

## 14. FO Visibility Impact

| BO / System State | FO Expected Behavior |
| --- | --- |
| Deletion request succeeded | User ถูก sign out และกลับ Sign In |
| Account in grace period | Login ไม่ได้หรือเห็น `Account scheduled for deletion` support state |
| Public profile hidden | Public Profile ต้องไม่แสดงข้อมูลผู้ใช้ปกติ |
| Assets hidden | Asset ไม่ขึ้น Feed, Search, Watch Alert results, Public Profile |
| Pending offer blocks archive | User ยัง login ไม่ได้ แต่ BO ยังไม่ archive/anonymize ขั้นสุดท้าย |
| Request cancelled/restored by policy | Account status ต้อง sync กลับตาม policy ก่อนอนุญาต login |

## 15. Cross-Module Integration

| Module | Integration |
| --- | --- |
| User Management | Account status, profile/contact masking, login block |
| Offer Management | Pending offer validation, accepted offer retention, related chat retention |
| Asset Management | Hide assets from FO surfaces and Watch Alert matching |
| Help / Support | Account-deleted support state, mistake/escalation ticket |
| Notification | Optional system notification/log for account deletion events ถ้า Product เปิด scope |
| Audit Log | Deletion request, validation, archive, anonymization, export |
| Reports & Analytics | Account deletion report, blocked count, archive completion |

## 16. Audit Requirements

Audit log ต้องบันทึกอย่างน้อย:

- `ACCOUNT_DELETION_REQUEST_CREATE`
- `ACCOUNT_DELETION_SESSION_REVOKE`
- `ACCOUNT_DELETION_RECHECK`
- `ACCOUNT_DELETION_BLOCKED`
- `ACCOUNT_DELETION_APPROVE_ARCHIVE`
- `ACCOUNT_DELETION_ARCHIVE_START`
- `ACCOUNT_DELETION_ARCHIVE_COMPLETE`
- `ACCOUNT_DELETION_ANONYMIZE_START`
- `ACCOUNT_DELETION_ANONYMIZE_COMPLETE`
- `ACCOUNT_DELETION_CANCEL`
- `ACCOUNT_DELETION_EXPORT`
- `ACCOUNT_DELETION_SENSITIVE_REVEAL`

Audit payload ต้องมี:

- `request_id`
- `target_user_id`
- `admin_id` หรือ `system_job_id`
- `old_status`
- `new_status`
- `blocking_reason`
- `dependency_snapshot`
- `retention_policy_version`
- `reason`
- `ip_address`
- `user_agent`
- `created_at`

## 17. Error / Empty / Loading States

| State | Requirement |
| --- | --- |
| Empty queue | แสดงว่าไม่มี deletion request ที่ตรง filter และมีปุ่ม clear filter |
| Loading | Skeleton สำหรับ queue/detail/validation summary |
| Permission denied | ไม่โหลด sensitive archive data |
| Request not found | แสดง not found และกลับ queue ได้ |
| Recheck failed | แสดง error พร้อม retry โดยไม่เปลี่ยน status |
| Archive job failed | คง status เดิมหรือ mark failed ตาม job policy และต้อง audit |
| Export failed | แสดง error และ audit attempt ถ้าเริ่ม export แล้ว |

## 18. Acceptance Criteria

| ID | Criteria |
| --- | --- |
| AC-BO-DEL-001 | BO แสดง deletion request queue พร้อม search/filter/status/grace period/dependency summary ครบ |
| AC-BO-DEL-002 | Request detail แสดง user context, timeline, pending offers, assets, chats, reports และ support tickets ได้ |
| AC-BO-DEL-003 | Pending incoming/outgoing offer ต้อง block archive/anonymization ได้จริง |
| AC-BO-DEL-004 | Recheck blocking conditions ต้อง query dependency ล่าสุดและบันทึก audit |
| AC-BO-DEL-005 | Approve archive, cancel request, trigger anonymization, and export archive report require Admin access policy, confirmation, reason, and audit |
| AC-BO-DEL-006 | หลัง FO delete สำเร็จ account ต้อง login ไม่ได้และ public profile/assets ต้องถูกซ่อนตาม contract |
| AC-BO-DEL-007 | Grace period 30 วันต้องแสดงใน queue/detail และมี state active/ending soon/expired |
| AC-BO-DEL-008 | Sensitive reveal, status change, archive/anonymization และ export ต้องมี audit log |
| AC-BO-DEL-009 | Account Deletion UI ต้อง responsive ที่ 375px, 768px, 1280px และ 1440px |

## 19. Open Decisions

| ID | Decision Needed | Impact |
| --- | --- | --- |
| DEL-DEC-001 | Account restore/cancel request เปิดให้ผู้ใช้ขอผ่าน support ได้หรือไม่ | กระทบ `Cancelled` behavior และ Help / Support workflow |
| DEL-DEC-002 | Retention period ของ chat, offer, report และ audit log ต้องเก็บกี่ปี | กระทบ archive/anonymization job |
| DEL-DEC-003 | Anonymization ทำทันทีหลัง 30 วันหรือรอตาม retention policy ของแต่ละ entity | กระทบ data model และ compliance |
| DEL-DEC-004 | Admin เห็นข้อมูล unmasked ระดับใดเมื่อช่วย account-deleted user | กระทบ privacy permission |
