# 14 BO Notifications Module

**Version:** `BO-14-v0.2`  
**Date:** 2026-09-09  
**Status:** Draft baseline — Account Deletion lifecycle emails added  
**Platform:** Responsive Web Back Office  
**Primary FO Sources:** `../FrontOffice/09_NOTIFICATION_MODULE.md`, `../FrontOffice/00_NAVIGATION_AND_CROSS_MODULE_FLOW.md`, `../FrontOffice/08_OFFER_MODULE.md`, `../FrontOffice/10_WATCH_ALERT_MODULE.md`, `../FrontOffice/11_SOCIAL_MODULE.md`

## UI Standards And Prototype Reference

เอกสารนี้ต้องใช้ร่วมกับ `00_GLOBAL_RULES_MODULE.md` และยึดรูปแบบหน้าจอ/พฤติกรรมที่ยืนยันแล้วใน `../Prototypes/bo-prototype.html` เป็นมาตรฐานหลัก

ห้ามออกแบบ pattern แยกเองสำหรับ list toolbar, breakpoint, table/card layout, pagination, reset, drill-down, drawer, modal หรือ detail layout ยกเว้นเอกสารนี้ระบุไว้ชัดเจนว่าเป็น override ที่อนุมัติแล้ว

## 1. Document Information

| Field | Detail |
| --- | --- |
| Module Name | BO Notifications |
| Platform | Responsive Web Back Office |
| Version | `BO-14-v0.2` |
| Status | Draft baseline — Account Deletion lifecycle emails added |
| Owner | Product / UX / Engineering / Operations |
| Document Type | Functional PRD |

## 2. Objective

Notifications Module ใช้ให้ BO จัดการ notification ที่เกี่ยวข้องกับ FO ทั้ง 2 กลุ่ม:

1. Broadcast Notification: ข้อความที่ Admin สร้างและส่งเอง เช่น announcement หรือ campaign
2. System Notification Trigger: notification ที่เกิดจาก event ของระบบ เช่น Like, Comment, Follow, Offer และ Watch Alert

เอกสารนี้ยึด FO Notification V1 เป็นหลัก: FO Notification Center รองรับเฉพาะ `Like`, `Comment`, `Follow`, `Offer`, `Watch Alert` เท่านั้น จึงห้ามเพิ่ม type ใหม่เข้า FO list โดยไม่มี master decision

## 3. Scope

### In Scope

- Broadcast notification create / draft / schedule / send
- Target audience selection
- Deep link validation ตาม destination ที่ FO รองรับ
- System notification type enable/disable
- Template title/body สำหรับ system trigger
- Delivery log และ failed delivery review
- Retry failed system notification ตาม rule
- Notification report metrics
- Audit log สำหรับ template, broadcast, retry และ export
- Responsive layout สำหรับ desktop, tablet และ mobile

### Out Of Scope

- FO Notification Center UI
- Push provider implementation เช่น Firebase Cloud Messaging setup
- Native OS permission prompt
- Chat / New Message ใน Notification Center
- Notification preference center
- Retention policy ฉบับสมบูรณ์
- Marketing automation/CDP integration

## 4. FO Notification Contract

FO V1 รองรับ Notification Center types:

| FO Type | Destination |
| --- | --- |
| `Like` | Asset Detail |
| `Comment` | Asset Detail + Focus Comment |
| `Follow` | Public Profile |
| `Offer` | Chat Room / Offer context หรือ Asset Detail ตาม subtype |
| `Watch Alert` | Watch Alert Result List |

FO V1 ไม่รองรับ type ต่อไปนี้ใน Notification Center จนกว่า master จะเพิ่ม scope:

- Like Valuation
- Market Update
- Sale Success
- Moderation Action
- Account Action
- Chat / New Message
- Generic Broadcast ใน in-app list

New Message ใช้เป็น unread badge/count ในเมนู Chat ได้ แต่ไม่ใช่ Notification Center type

Account suspension/ban messaging is handled as account-status communication, not as a FO Notification Center type:

- `Suspended` และ `Banned` ต้องส่ง email เป็น primary channel จาก account action ใน User Management
- In-app notification สำหรับ account action เป็น optional/secondary เท่านั้น และห้ามใช้เป็นช่องทางเดียว เพราะผู้ใช้อาจถูก revoke session หรือ login ไม่ได้แล้ว
- Delivery log ของ email/account-status message ต้อง trace กลับไปยัง User Management action และ audit event ได้
- ห้ามเพิ่ม `Account Action` เข้า FO Notification Center V1 โดยไม่มี master decision ใหม่

Account Deletion lifecycle messaging ใช้แนวทางเดียวกับ account-status communication ข้างต้น — ส่งเป็นอีเมลเป็นช่องทางหลัก ไม่ใช่ FO Notification Center type:

- Account Deletion lifecycle มีอีเมลแจ้งเตือน 5 จุดตาม `13_ACCOUNT_DELETION_MODULE.md` — ยืนยันลบบัญชี / เตือนใกล้ครบ grace period / คืนบัญชีแล้ว / ปฏิเสธคืนบัญชี / ลบตัวตนแล้ว (รายละเอียดใน section 9.3)
- อีเมลทั้ง 5 จุดส่งไปยัง registered email ของเจ้าของบัญชี ไม่เข้า FO Notification Center
- Delivery log ของอีเมล lifecycle ใช้รหัส `DLV-DEL-<request-id>-<event>` ตาม pattern `DLV-ACCT-xxx` และต้อง trace กลับไปยัง History & Actions ของ Account Deletion Request Detail ได้
- ห้ามเพิ่ม `Account Deletion` เข้า FO Notification Center V1 โดยไม่มี master decision ใหม่

## 5. Broadcast vs System Trigger

| Area | Broadcast Notification | System Notification Trigger |
| --- | --- | --- |
| Source | Admin สร้างใน BO | Event จาก FO/system |
| Example | Announcement, campaign, policy notice | Like, Comment, Follow, Offer, Watch Alert |
| Template | Admin เขียนต่อรายการ | Template กลางต่อ notification type |
| Audience | Target audience ที่ Admin เลือก | Recipient ตาม event |
| Schedule | Send now / schedule | Trigger ตาม event |
| Retry | ตาม delivery job policy | Retry failed system notification ได้ |
| FO V1 Constraint | In-app list ต้องรอ decision ถ้าใช้ type `Broadcast` | ต้อง map เป็น supported FO type เท่านั้น |

## 6. Admin Access And Permissions

BO uses a single Admin account type only. Admin access is controlled by module access, action policy, sensitive-data policy, confirmation, reason, and audit requirements instead of separate BO admin account types.


| Access Area | Rule |
| --- | --- |
| Module access | Admin can use list/detail/search/filter when module access is granted. |
| Write action | Create, update, status change, remove, restore, publish, archive, retry, and similar actions require permission check, confirmation for high-risk actions, reason when FO/user impact exists, and audit log. |
| Sensitive data | Mask by default; reveal only with business reason, policy approval, and audit log. |
| Export | Requires permission check, scope control, expiry/background job where needed, and audit export event. |
| Direct URL/API | Enforce access at route, API, and service layers; never rely only on hidden UI. |
## 7. Responsive Layout

| Breakpoint | Layout |
| --- | --- |
| Mobile <= 767px | List เป็น card stack, filters เป็น collapsible panel, detail/editor เปิด full screen |
| Tablet 768px - 1199px | List/detail แบบ single column หรือ split view |
| Desktop >= 1200px | Dashboard cards + table + right detail panel/editor |

Editor ต้องมี preview และ validation ที่ใช้งานได้บน mobile โดย action สำคัญเช่น Send Now ต้องมี confirmation

## 8. Broadcast Notification

### 8.1 Broadcast List Fields

| Field | Requirement |
| --- | --- |
| Broadcast ID | รหัสรายการ |
| Title | หัวข้อ |
| Body | ข้อความ |
| Status | Draft, Pending Approval, Scheduled, Sending, Sent, Cancelled, Failed |
| Channel | Push, In-app, Push + In-app ตาม decision |
| Target Audience | กลุ่มผู้รับ |
| Deep Link | Destination ที่ validate แล้ว |
| Scheduled At | เวลาส่งถ้ามี |
| Created By | Admin ผู้สร้าง |
| Approved By | Admin ผู้อนุมัติ |
| Delivery Stats | Sent, delivered, opened, failed |
| Created At / Updated At | วันที่สร้างและแก้ไขล่าสุด |

### 8.2 Broadcast Status

| Status | Meaning |
| --- | --- |
| `Draft` | ยังแก้ไขได้ ยังไม่พร้อมส่ง |
| `Pending Approval` | รอ Admin อนุมัติ |
| `Scheduled` | อนุมัติแล้วและรอเวลาส่ง |
| `Sending` | job กำลังส่ง |
| `Sent` | ส่งเสร็จแล้ว |
| `Cancelled` | ยกเลิกก่อนส่ง |
| `Failed` | job ส่งไม่สำเร็จ |

### 8.3 Broadcast Form

Broadcast form ต้องมี:

- Title
- Body
- Optional image
- Channel
- Target audience
- Deep link / destination
- Send now หรือ schedule date-time
- Preview
- Test send เฉพาะ admin/test device ถ้า implementation รองรับ
- Approval note

### 8.4 Target Audience

Target audience baseline:

| Audience | Rule |
| --- | --- |
| All active members | เฉพาะ account ที่ active และรับ notification ได้ |
| Segment by activity | เช่น active in last N days |
| Segment by asset ownership | เช่น user ที่มี Sale asset |
| Segment by Watch Alert | เช่น user ที่มี active Watch Alert |
| Manual user IDs | จำกัดเฉพาะ Admin |

ห้ามส่งไปยัง account ที่ `Banned`, `Deleted` (ลบแล้ว), `Anonymized` หรืออยู่ใน deletion state (`Deletion Requested` — บัญชีถูกระงับระหว่าง grace period ตาม Account Deletion module)

### 8.5 Broadcast FO Constraint

ถ้า Broadcast ต้องแสดงใน FO Notification Center ต้องมี master decision เพิ่ม type `Broadcast` หรือ mapping ที่ชัดเจนก่อน Dev implement

จนกว่าจะมี decision:

- BO สามารถเก็บ broadcast draft/schedule/delivery log ได้
- Push-only broadcast ทำได้ถ้า Product อนุมัติ channel และ payload
- In-app Notification Center ห้ามแสดง generic broadcast เป็น V1 supported type ปลอม

## 9. System Notification Trigger

### 9.1 Supported Trigger Types

System trigger ที่ BO จัดการได้สำหรับ FO V1:

| Trigger Type | Event | Recipient | FO Type | Destination |
| --- | --- | --- | --- | --- |
| Like | User likes Asset | Asset owner | Like | Asset Detail |
| Comment | User comments on Asset | Asset owner / related user | Comment | Asset Detail + Focus Comment |
| Follow | User follows another user | Followed user | Follow | Public Profile |
| New Offer | Buyer sends offer | Asset owner | Offer | Chat Room + Focus Offer Card |
| Offer Accepted | Owner accepts offer | Buyer | Offer | Chat Room |
| Offer Rejected | Owner declines offer | Buyer | Offer | Asset Detail |
| Offer Cancelled | System/user cancels offer | Related buyer/owner | Offer | Chat Room + Focus Offer Card |
| Watch Alert | Sale asset matches alert criteria | Alert owner | Watch Alert | Watch Alert Result List |

### 9.2 Explicitly Disabled / Future Types

| Type | BO Rule |
| --- | --- |
| Chat / New Message | ไม่ส่งเข้า Notification Center; ใช้ Chat badge/count เท่านั้น |
| Market Update | Future; ห้ามส่ง FO V1 จนกว่า master เพิ่ม scope |
| Sale Success | Future; ห้ามส่ง FO V1 จนกว่า master เพิ่ม scope |
| Like Valuation | Future; ห้ามส่ง FO V1 จนกว่า master เพิ่ม scope |
| Moderation Action | Future; ถ้าต้องแจ้ง user ให้เปิด decision แยก |
| Account Action | Future for FO Notification Center; account suspension/ban uses email as primary channel and Auth account-status state when user opens app/signs in |

### 9.3 Account Deletion Lifecycle Emails

Account Deletion lifecycle มีอีเมลแจ้งเตือน 5 จุด ส่งไปยัง registered email ของเจ้าของบัญชีเป็นช่องทางหลัก ตาม pattern Account Status Email (`TPL-ACCT-009`) ของ Suspend/Ban — ไม่เข้า FO Notification Center รายละเอียด lifecycle และ no-send rules อ้างอิง `13_ACCOUNT_DELETION_MODULE.md`

| # | Email | Trigger | Recipient | Audit Event | Delivery ID Pattern |
| --- | --- | --- | --- | --- | --- |
| 1 | ยืนยันลบบัญชี (Account deletion confirmation) | FO confirm Delete Account สำเร็จ — ส่งครั้งเดียวหลังคำขอเข้าคิว | registered email | `ACCOUNT_DELETION_REQUEST_CREATE` | `DLV-DEL-<req>-REQ` |
| 2 | เตือนใกล้ครบ grace period (Account deletion reminder) | เหลือ 7 วัน และ 3 วันก่อนครบ grace period — ส่งอัตโนมัติโดย system job | registered email | system job (reminder) | `DLV-DEL-<req>-GR7` / `DLV-DEL-<req>-GR3` |
| 3 | คืนบัญชีแล้ว (Account restore) | Admin confirm restore action ในช่วง grace period | registered email | `ACCOUNT_DELETION_RESTORE` | `DLV-DEL-<req>-RES` |
| 4 | ปฏิเสธคืนบัญชี (Account restore rejection) | Admin confirm reject restore action ในช่วง grace period | registered email | `ACCOUNT_DELETION_RESTORE_REJECT` | `DLV-DEL-<req>-REJ` |
| 5 | ลบตัวตนแล้ว (Account auto-deletion) | ครบ grace period 30 วัน — system job ลบบัญชีอัตโนมัติ (เก็บถาวร + ลบตัวตนในขั้นเดียว) — ส่งก่อน anonymize personal fields | registered email | `ACCOUNT_DELETION_AUTO_DELETE` | `DLV-DEL-<req>-DEL` |

กฎห้ามส่ง (No-Send Rules):

| Email | ห้ามส่งเมื่อ |
| --- | --- |
| ยืนยันลบบัญชี | ส่งครั้งเดียวหลัง FO confirm สำเร็จเท่านั้น — ห้ามส่งซ้ำ |
| เตือนใกล้ครบ grace period | คำขอที่จบแล้ว (`คืนบัญชีแล้ว` / `ลบตัวตนแล้ว`) หรือบัญชีที่ `Anonymized` แล้ว |
| คืนบัญชีแล้ว | บัญชีที่ `Anonymized` แล้ว (หลังลบตัวตน ไม่สามารถคืนบัญชีได้) |
| ปฏิเสธคืนบัญชี | บัญชีที่ `Anonymized` แล้ว หรือคำขอที่ `คืนบัญชีแล้ว` |
| ลบตัวตนแล้ว | คำขอที่ `คืนบัญชีแล้ว` — ส่งเฉพาะคำขอที่ครบ grace period และระบบลบบัญชีอัตโนมัติ; ต้องส่งก่อน anonymize personal fields ตามกฎห้ามส่ง broadcast ใน section 8.4 |

Delivery log และ audit linkage:

- Delivery log ใช้รหัส `DLV-DEL-<request-id>-<event>` ตาม pattern `DLV-ACCT-xxx` ของ Account Status Email
- ทุก delivery log ต้อง reference กลับไปยัง Account Deletion Request ID และ audit event ที่เกี่ยวข้อง
- History & Actions ของ Request Detail ต้องแสดงคอลัมน์ ส่งอีเมล พร้อมสถานะการส่งและลิงก์ไปยัง delivery log ใน Notifications (ตาม pattern Admin Action History ของ Report Detail)
- อีเมลคืนบัญชีและปฏิเสธคืนบัญชีต้องมี email preview ใน modal ของ action (ตาม pattern email-preview ของ asset actions) พร้อมข้อความแจ้งช่องทางหลักเป็นอีเมล
- ถ้าอีเมล lifecycle ส่งไม่สำเร็จ ต้อง mark failed ใน delivery log และ expose retry/admin-visible failure state ตามกฎ retry ใน section 13 — ไม่ block account status mutation ยกเว้น product policy กำหนดเป็นอย่างอื่น

## 10. Template Management

System template fields:

| Field | Requirement |
| --- | --- |
| Notification Type | Like, Comment, Follow, Offer subtype, Watch Alert |
| Title Template | Required |
| Body Template | Required |
| Variables | Allowlist ต่อ type |
| Destination Pattern | Required และต้อง validate ได้ |
| Enabled | Boolean |
| Updated By | Admin |
| Updated At | Timestamp |

Template variables ต้องใช้ allowlist เท่านั้น เช่น:

| Type | Allowed Variables |
| --- | --- |
| Like | actor_display_name, asset_title |
| Comment | actor_display_name, asset_title, comment_excerpt |
| Follow | actor_display_name |
| Offer | actor_display_name, asset_title, offer_price, offer_status |
| Watch Alert | alert_name, matched_count, brand, model |
| Account Suspension Email | account_status, public_reason, suspension_end_at, support_contact |
| Account Ban Email | account_status, public_reason, support_contact |
| Account Deletion Confirmation Email | display_name, request_id, grace_end_at, support_contact |
| Account Deletion Reminder Email | display_name, request_id, days_remaining, grace_end_at, support_contact |
| Account Restore Email | display_name, request_id, action_reason, support_contact |
| Account Restore Rejection Email | display_name, request_id, action_reason, grace_end_at, support_contact |
| Account Auto-Deletion Email | display_name, request_id, support_contact |

ห้ามใส่ sensitive data เช่น phone, email, LINE, full chat content หรือ internal admin note ลง notification template

## 11. Deep Link / Destination Rules

| Destination | Validation |
| --- | --- |
| Asset Detail | Asset ต้องยังเปิด destination ได้ หรือ fallback เป็น unavailable state |
| Asset Detail + Focus Comment | Asset/comment ต้อง validate permission และ fallback ได้ |
| Public Profile | ต้องเคารพ block/deleted user rules |
| Chat Room + Offer Card | User ต้องเป็น participant และ offer context ต้องมีอยู่ |
| Watch Alert Result List | ต้องเปิด result list ไม่เปิด Asset Detail โดยตรง |

ถ้า destination ถูกลบหรือไม่มีสิทธิ์ FO ต้องแสดง safe unavailable state ตาม FO module

## 12. Delivery Log

Delivery log ต้องเก็บ:

| Field | Requirement |
| --- | --- |
| Delivery ID | รหัส delivery event |
| Notification ID | อ้างถึง broadcast/system notification |
| Notification Type | Broadcast หรือ system trigger type |
| Recipient User ID | ผู้รับ |
| Channel | Push, In-app, Email, Push + In-app |
| Provider | เช่น FCM หรือ email provider ถ้ามี |
| Status | Queued, Sent, Delivered, Opened, Failed, Skipped |
| Failure Reason | Required ถ้า failed/skipped |
| Destination | Deep link / route |
| Created At | เวลาสร้าง |
| Sent At / Delivered At / Opened At | เวลาตาม event |

Delivery tracking target ตาม BO PRD: มากกว่า 95% ของ notification ต้องมี delivery status

## 13. Retry Rules

| Case | Rule |
| --- | --- |
| Temporary provider failure | Retry ได้ตาม exponential/backoff policy |
| Invalid token/device | Mark failed/skipped และไม่ retry จนกว่า token refresh |
| Disabled notification type | ห้าม retry notification ใหม่สำหรับ type นั้น |
| Destination invalid | ห้าม retry จนกว่าข้อมูล destination ถูกแก้ |
| Broadcast already sent | Retry เฉพาะ failed recipients ถ้า policy อนุญาต |
| System notification duplicate | ต้องมี idempotency key ป้องกันส่งซ้ำ |
| Account suspension email failed | Mark failed, expose retry/admin-visible failure state, and keep account status mutation intact unless product policy requires blocking mutation on delivery failure |
| Account Deletion lifecycle email failed | Mark failed, expose retry/admin-visible failure state, and keep deletion action mutation intact; อีเมลลบตัวตนแล้วต้องส่งก่อน anonymize — ถ้าส่งไม่สำเร็จต้อง retry ก่อน anonymize personal fields หรือตาม product policy |

Retry action ต้องมี audit log และต้องไม่สร้าง notification ซ้ำใน FO list โดยไม่มี idempotency guard

## 14. Admin Actions

| Action | Requirement | Audit |
| --- | --- | --- |
| Create broadcast draft | Title/body/audience/channel required | Required |
| Submit broadcast approval | ต้อง validate audience/destination | Required |
| Approve broadcast | Admin access required | Required |
| Send now | Confirmation required | Required |
| Schedule broadcast | Date-time required | Required |
| Cancel scheduled broadcast | Reason required | Required |
| Edit system template | Before/after value required | Required |
| Enable/disable system type | Reason required | Required |
| Retry failed notification | Scope and reason required | Required |
| Export delivery log | Scope and reason required | Required |
| Retry account-status email | Scope, reason, target account action reference required | Required |
| Retry Account Deletion lifecycle email | Scope, reason, target deletion request reference required | Required |

## 15. Cross-Module Integration

| Module | Integration |
| --- | --- |
| Dashboard | Failed notifications, delivery rate, scheduled broadcasts |
| User Management | Target audience, account status exclusion |
| Asset Management | Asset detail destination and unavailable fallback |
| Offer Management | Offer trigger, chat room destination, rejected/accepted/cancelled events |
| Asset Management (Reported Comments) | Comment, like, follow triggers |
| Watch Alert | Match trigger, result list destination, notification enabled/off |
| Help / Support | ไม่มี ticket ใน Phase 1 — module 12 เป็น Policy & Versioning + Support Center; notification integration เป็น future scope |
| Account Deletion | Exclude deletion/archived users from broadcast; lifecycle email 5 จุด (section 9.3) ส่งไปยัง registered email พร้อม delivery log `DLV-DEL-xxx` ที่ trace กลับไปยัง History & Actions ของ Request Detail; อีเมลลบตัวตนต้องส่งก่อน anonymize personal fields |
| Audit Log | Template, broadcast, retry, export audit events |
| Reports & Analytics | Notification report metrics |

## 16. Audit Requirements

Audit log ต้องบันทึกอย่างน้อย:

- `NOTIFICATION_BROADCAST_CREATE`
- `NOTIFICATION_BROADCAST_UPDATE`
- `NOTIFICATION_BROADCAST_SUBMIT_APPROVAL`
- `NOTIFICATION_BROADCAST_APPROVE`
- `NOTIFICATION_BROADCAST_SEND_NOW`
- `NOTIFICATION_BROADCAST_SCHEDULE`
- `NOTIFICATION_BROADCAST_CANCEL`
- `NOTIFICATION_TEMPLATE_UPDATE`
- `NOTIFICATION_TYPE_ENABLE`
- `NOTIFICATION_TYPE_DISABLE`
- `NOTIFICATION_DELIVERY_RETRY`
- `NOTIFICATION_DELIVERY_EXPORT`
- `NOTIFICATION_DELETION_EMAIL_DELIVERY` — การส่งอีเมล lifecycle ของ Account Deletion (reference ไปยัง `ACCOUNT_DELETION_*` audit event ของ `13_ACCOUNT_DELETION_MODULE.md`)

Audit payload ต้องมี:

- `notification_id`
- `broadcast_id` หรือ `template_id`
- `admin_id`
- `old_value` / `new_value`
- `target_audience_snapshot`
- `delivery_scope`
- `reason`
- `ip_address`
- `user_agent`
- `created_at`

## 17. Error, Empty, Loading States

| State | Requirement |
| --- | --- |
| Empty broadcast list | แสดง empty state พร้อม create draft ถ้ามี permission |
| Empty delivery log | แสดงว่าไม่มี delivery ตาม filter |
| Loading | Skeleton สำหรับ list/detail/editor |
| Permission denied | ไม่แสดง action ที่ไม่มีสิทธิ์ |
| Invalid destination | Block send/schedule และแสดง error |
| Audience empty | Block send/schedule |
| Provider failed | แสดง failed state และ retry option ตาม permission |
| Template validation failed | แสดง field-level error |

## 18. Acceptance Criteria

| ID | Criteria |
| --- | --- |
| AC-BO-NOTI-001 | BO แสดง notification dashboard, broadcast list, system trigger templates และ delivery logs ได้ |
| AC-BO-NOTI-002 | Broadcast รองรับ draft, approval, schedule, send now, cancel และ delivery stats |
| AC-BO-NOTI-003 | Broadcast in-app list ต้องไม่เพิ่ม generic `Broadcast` type เข้า FO V1 จนกว่า master decision เปิด scope |
| AC-BO-NOTI-004 | System trigger ต้องรองรับ Like, Comment, Follow, Offer subtypes และ Watch Alert ตาม FO destination rules |
| AC-BO-NOTI-005 | Watch Alert notification ต้องเปิด Watch Alert Result List เท่านั้น ห้ามเปิด Asset Detail โดยตรง |
| AC-BO-NOTI-006 | Chat / New Message ต้องไม่เข้า Notification Center และใช้ Chat badge/count เท่านั้น |
| AC-BO-NOTI-007 | Disabled notification type ต้องไม่ส่ง notification ใหม่ |
| AC-BO-NOTI-008 | Delivery log ต้องเก็บ queued/sent/delivered/opened/failed/skipped และ failure reason |
| AC-BO-NOTI-009 | Retry failed notification ต้องมี idempotency guard และ audit log |
| AC-BO-NOTI-010 | Template update, broadcast approval/send/cancel และ export ต้องมี audit log |
| AC-BO-NOTI-011 | Notifications UI ต้อง responsive ที่ 375px, 768px, 1280px และ 1440px |
| AC-BO-NOTI-012 | Account Deletion lifecycle email 5 จุด (section 9.3) ต้องส่งไปยัง registered email พร้อม delivery log `DLV-DEL-xxx` ที่ trace กลับไปยัง History & Actions ของ Request Detail และ audit event ได้ |
| AC-BO-NOTI-013 | อีเมล Account Deletion lifecycle ต้องเคารพกฎห้ามส่งใน section 9.3 — ไม่ส่งซ้ำ ไม่ส่งเมื่อคำขอจบแล้ว และอีเมลลบตัวตนต้องส่งก่อน anonymize personal fields |
| AC-BO-NOTI-014 | อีเมลคืนบัญชีและปฏิเสธคืนบัญชีต้องมี email preview ใน modal ของ action พร้อมข้อความแจ้งช่องทางหลักเป็นอีเมล ตาม pattern โมดูลอื่น |

## 19. Open Decisions

| ID | Decision Needed | Impact |
| --- | --- | --- |
| NOTI-DEC-001 | Broadcast จะแสดงใน FO Notification Center หรือเป็น push-only | กระทบ FO type list และ in-app notification UI |
| NOTI-DEC-002 | ต้องมี broadcast approval workflow กี่ขั้น | กระทบ permission และ operation process |
| NOTI-DEC-003 | Notification retention period ต้องเก็บกี่วัน/ปี | กระทบ delivery log และ report |
| NOTI-DEC-004 | Provider payload contract ของ FCM/APNs กำหนด schema ใด | กระทบ backend implementation |
| NOTI-DEC-005 | Market Update / Sale Success / Account Action จะเข้า FO phase ใด | กระทบ supported types และ template list |
