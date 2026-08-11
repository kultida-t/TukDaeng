# 09 BO Offer Management Module

**Version:** `BO-09-v0.1`  
**Date:** 2026-07-06  
**Status:** Draft baseline  
**Platform:** Responsive Web Back Office  
**Primary FO Sources:** `../FrontOffice/08_OFFER_MODULE.md`, `../FrontOffice/07_CHAT_MODULE.md`, `../FrontOffice/09_NOTIFICATION_MODULE.md`, `../FrontOffice/04_ASSET_MANAGEMENT_MODULE.md`, `../FrontOffice/13_SETTINGS_MODULE.md`, `../FrontOffice/15_TRUST_SAFETY_MODULE.md`  
**Integration Map:** `../ProjectAdmin/FO_BO_INTEGRATION_MAP.md`

## 1. วัตถุประสงค์

BO Offer Management Module คือหน้าจอสำหรับทีม Admin ใช้ดูรายการ offer แบบ read-only เพื่อเห็นความสนใจต่อ asset, buyer/seller, ราคา offer, สถานะ offer และ related chat context ที่เกิดจาก FO

โมดูลนี้ไม่ได้ทำหน้าที่แทนผู้ซื้อหรือผู้ขายใน FO และไม่ใช่ moderation queue สำหรับ chat/report. ใน V1 Admin ใช้ดูข้อมูลและ drill-in เท่านั้น; การเปลี่ยนสถานะ offer ต้องเกิดจาก FO user action หรือ system rule ของ Asset/Account workflow ตาม policy

## 2. Scope

### In Scope

- Offer list พร้อม search, filter, sort, pagination และ export/report ตาม permission
- Offer detail พร้อม asset summary, buyer/owner summary, status timeline, related chat และ notification delivery
- Offer lifecycle status review: `Pending`, `Accepted`, `Rejected`, `Cancelled`
- Related chat context link แบบ read-only ตาม permission และ privacy policy
- User report จาก chat ต้อง route ไป `User Management > Reported Users` โดยมี source/context เป็น `Chat`
- User-level delete chat visibility เทียบกับ server retention
- Audit log สำหรับ offer export, sensitive reveal และการเปิดดูข้อมูลที่ต้อง audit
- Responsive layout สำหรับ desktop, tablet และ mobile-width browser

### Out Of Scope

- Payment, escrow, payment settlement หรือ in-app transaction
- Counter offer, offer withdrawal และ offer auto-expiration ใน FO V1 เว้นแต่ Product เปิด scope เพิ่ม
- Admin แก้ราคา offer หรือแก้ข้อความ user โดยตรง
- Admin ส่งข้อความแทน user ใน chat
- Admin accept/decline/cancel/force-expire offer จากเมนูนี้
- Chat moderation queue, reported chat queue, dispute queue หรือ message/attachment moderation
- การลบ chat/message แบบ hard delete โดยไม่มี retention/audit policy

## 3. Canonical Terms

ให้ยึดคำจาก FO เป็นหลัก:

| Canonical Term | Legacy Term | Rule |
| --- | --- | --- |
| `Rejected` | `Declined` | ใช้ `Rejected` ใน BO implementation, API, filter และรายงานใหม่ทั้งหมด; ถ้าเจอข้อมูลเก่า `Declined` ให้ normalize เป็น `Rejected` |
| `Show` | `Collection Show` | ใช้ `Show` ตาม FO |
| `Hide` | `Collection Hide` | ใช้ `Hide` ตาม FO |

Offer action/copy ต้องแยกจาก status:

- `Decline` คือ FO user action หรือปุ่มที่ Seller กดบนหน้าจอ
- `Rejected` คือ status หลังจาก Seller กด `Decline` แล้ว
- BO list/filter/report/API/DB enum ใช้ `Rejected` หรือ `REJECTED`
- ห้ามเปลี่ยน FO button copy จาก `Decline` เป็น `Reject` เพียงเพราะ status ใช้ `Rejected`

เอกสาร legacy ที่ยังมีคำเก่าให้ถือเป็น historical source เท่านั้น ห้ามสร้าง enum ใหม่ซ้ำกับ canonical term

## 4. Admin Access And Permissions

BO uses a single Admin account type only. Admin access is controlled by module access, action policy, sensitive-data policy, confirmation, reason, and audit requirements instead of separate BO admin account types.


| Access Area | Rule |
| --- | --- |
| Module access | Admin can use list/detail/search/filter when module access is granted. |
| Write action | Offer Management V1 is read-only. Any future write action requires Product approval, permission check, confirmation, reason when FO/user impact exists, and audit log. |
| Sensitive data | Mask by default; reveal only with business reason, policy approval, and audit log. |
| Export | Requires permission check, scope control, expiry/background job where needed, and audit export event. |
| Direct URL/API | Enforce access at route, API, and service layers; never rely only on hidden UI. |
## 5. Responsive Layout

| Width | Layout Requirement |
| --- | --- |
| Mobile-width browser | Offer table ต้องเปลี่ยนเป็น stacked cards, filter อยู่ใน drawer/bottom sheet, action สำคัญต้องไม่ล้นจอ |
| Tablet | แสดง list + detail panel แบบย่อได้, column รองเปิดผ่าน detail drawer |
| Desktop | ใช้ full table, side filters และ split detail panel ได้ |

Related chat context ต้องเปิดแบบ read-only เฉพาะเมื่อ Admin มี permission และต้อง mask sensitive content ตาม policy

## 6. Offer List

Offer list ต้องแสดงข้อมูลขั้นต่ำ:

- Offer ID
- Asset ID / Asset name
- Asset status ปัจจุบัน
- Buyer
- Owner
- Offer price
- Asset asking price หรือ `Price on Request`
- Offer status
- Created date
- Updated date
- Last action/source
- Related chat room

### Search

ค้นหาได้จาก:

- Offer ID
- Asset ID
- Asset name
- Buyer name / username / user ID
- Owner name / username / user ID
- Brand / model / reference number

### Filters

Filter ขั้นต่ำ:

- Status: `Pending`, `Accepted`, `Rejected`, `Cancelled`
- Brand / model
- Price range
- Created date range
- Updated date range
- Asset status
- Has related chat
- Has notification failure

### Saved Views

- All Offers
- Pending Offers
- Accepted Offers
- Rejected Offers
- Cancelled Offers
- Offers With Notification Failure

## 7. Offer Status Contract

| Status | Meaning | FO Required Behavior |
| --- | --- | --- |
| `Pending` | รอ owner ตอบรับหรือปฏิเสธ | แสดงเป็น active pending offer ใน incoming/chat surfaces |
| `Accepted` | Owner accepted offer | Buyer ได้ notification และเปิดไป Chat Room; ไม่ถือว่า payment complete |
| `Rejected` | Owner กด `Decline` แล้ว offer ถูกปฏิเสธ | ออกจาก incoming pending state; notification/deep link ตาม FO rule เปิด Asset Detail |
| `Cancelled` | Offer ถูกยกเลิกตาม user/system flow ที่ไม่ใช่ owner reject | ไม่เป็น active pending; history ยังอยู่ |

หมายเหตุ:

- `Decline` เป็น action/copy ของ FO; `Rejected` เป็น status ของระบบ
- `Declined` จาก legacy source ต้อง map เป็น `Rejected`
- `Accepted` เป็นการตกลง offer เท่านั้น ไม่ใช่ payment completion, sale completion หรือ escrow confirmation

## 8. Offer Lifecycle Rules

FO สร้าง offer ได้จาก Asset Detail เท่านั้น ไม่สร้าง offer โดยตรงจาก Feed, Search, Profile list หรือ Chat list

| Event | BO Requirement | FO Impact |
| --- | --- | --- |
| User creates offer | สร้าง offer record, status `Pending`, ผูก asset/buyer/owner/chat context | แสดง pending offer และ offer card ใน chat ตาม FO rule |
| Owner accepts offer | บันทึก status `Accepted`, timeline, notification delivery | Buyer ได้ notification เปิด Chat Room |
| Owner declines offer | บันทึก status `Rejected`, timeline, notification delivery | Buyer ได้ notification เปิด Asset Detail; incoming pending หาย |
| Asset ถูกลบโดยเจ้าของ while pending | เปลี่ยน related offers เป็น `Cancelled` ตาม FO Offer policy | FO แสดง unavailable asset reference และ offer ออกจาก active pending flow |
| Asset sold while pending | เปลี่ยน other pending offers เป็น `Rejected` อัตโนมัติตาม FO Offer policy | FO เอา offer ออกจาก Incoming Offers และแจ้งผลตาม Notification rule |
| User/account state blocks transaction | ปิดการสร้าง offer/chat ใหม่ระหว่างคู่ที่ block กันตาม Trust & Safety policy | FO ต้องไม่เปิด action ที่ทำไม่ได้ |

Asset status rule:

- `Sale` รองรับ offer ตาม marketplace flow
- `Show` รองรับ offer/contact จาก Asset Detail หรือ public profile detail เฉพาะตาม FO rule แต่ไม่ขึ้น Feed/Search/Watch Alert
- `Hide`, `Sold`, `ซ่อนถาวร`, `ลบโดยเจ้าของ` ไม่รับ offer ใหม่
- Existing chat room ยังดูได้หลัง asset sold/deleted แต่ asset card ต้องแสดง unavailable หรือ sold state ตาม FO rule

## 9. Offer Detail

Offer detail ต้องแสดง:

- Offer summary: ID, status, price, created/updated time, source surface
- Asset summary: thumbnail, brand, model, reference, current status, asking price
- Buyer summary: user ID, display name, account status, report/suspension signals
- Owner summary: user ID, display name, account status, report/suspension signals
- Status timeline: created, accepted/rejected/cancelled, actor/source, timestamp, reason
- Related chat room link
- Offer history ของ asset เดียวกัน
- Notification delivery status
- Audit events ที่เกี่ยวข้อง

Admin ห้ามแก้ offer price, buyer, owner หรือ message content โดยตรง ถ้าต้องแก้ข้อมูลผิดพลาดให้ใช้ correction workflow ที่มี audit และ Product approval แยกต่างหาก

## 10. Admin Actions

| Action | Allowed Roles | Requirement |
| --- | --- | --- |
| View offer | Admin | Module permission required |
| View related chat context | Admin | Read-only, ต้อง respect privacy/sensitive masking |
| Open asset detail | Admin | Route to Asset Management detail ตาม permission |
| Open buyer/owner detail | Admin | Route to User Management detail ตาม permission |
| Export offer history | Admin | Read-only export, audit export event และ controlled access |
| View notification delivery | Admin | Read-only; retry อยู่ใน Notification module |

Bulk action สำหรับ offer ไม่เปิดใน V1 เพราะเมนูนี้เป็น read-only overview

## 11. Chat Context And Report Routing

FO Chat V1 ไม่มี action `Report chat` หรือ `Report offer` โดยตรง มีเฉพาะ `Report user` จาก chat overflow menu ดังนั้น BO ต้องถือว่า report target คือ user และ chat/offer เป็น context ประกอบการตรวจสอบเท่านั้น

- Report ต้องเข้า `User Management > Reported Users`
- Reported Users ต้องแสดง source/context เช่น `Chat`, related asset, related offer และ related chat room เมื่อมี permission
- Offer Management แสดง link ไป related chat เพื่อดูบริบทแบบ read-only เท่านั้น
- Chat/message ไม่ควรถูกลบทันที เว้นแต่มี policy/system rule ชัดเจน

## 12. Notification Delivery

Offer/chat events ที่ต้อง trace delivery:

- Offer created notification ไป owner ถ้า FO เปิดใช้
- Offer accepted notification ไป buyer
- Offer rejected notification ไป buyer

BO Offer Management ดู delivery status ได้ แต่การจัดการ template, retry, broadcast หรือ trigger configuration ต้องอยู่ใน Notification module

## 13. Account Deletion Dependency

FO account deletion ต้อง block ถ้ามี pending offer ตาม FO rule

BO ต้องรองรับ:

- Query pending offer ของ user เพื่อให้ Account Deletion module ตรวจได้
- Link จาก user/account deletion request กลับมาดู offer context
- ห้าม archive/anonymize user จนกว่า pending offer dependency ถูก resolve ตาม policy
- Audit ทุกครั้งที่ pending offer ถูกใช้เป็นเหตุผล block deletion

## 14. Audit Requirements

Audit action ขั้นต่ำ:

- `OFFER_EXPORT`
- `OFFER_SENSITIVE_REVEAL`
- `OFFER_RELATED_CHAT_VIEW`

ทุก event ต้องมี:

- Admin ID
- Admin Access
- Action type
- Target entity type และ ID
- Before value
- After value
- Reason/note เมื่อจำเป็น
- Related offer/chat/report/asset/user ID
- IP address หรือ session context ถ้ามี
- Timestamp เป็น `Asia/Bangkok`

## 15. Error, Empty, Loading States

ต้องรองรับ:

- Empty offer list ตาม filter
- Offer หรือ chat ถูก update ระหว่าง admin เปิดหน้า
- Asset ถูก removed/sold ระหว่าง review
- Permission denied สำหรับ transcript, attachment, export หรือ sensitive reveal
- Notification delivery section load fail โดยไม่ทำให้ offer detail ทั้งหน้าล่ม

## 16. Integration With Other BO Modules

| Module | Integration |
| --- | --- |
| Dashboard | Offer metrics, offer status summary, notification failure count |
| User Management | Buyer/owner profile, account status, suspension/ban impact |
| Asset Management | Asset sold/delete impact ต่อ offer status; asset card state in chat |
| Audit Log | Offer export/sensitive-view actions ต้อง searchable |
| Notification | Delivery logs, templates, retry policy |
| Account Deletion | Pending offer validation ก่อน archive/anonymize |
| Help & Support | Chat/offer context สำหรับ ticket/dispute |
| Reports & Analytics | Offer/chat aggregate และ export ตาม permission |

## 17. Acceptance Criteria

| ID | Criteria |
| --- | --- |
| AC-BO-OFFER-001 | Offer list แสดง search/filter/status ครบและใช้ `Rejected` ไม่ใช้ `Declined` ใน UI ใหม่ |
| AC-BO-OFFER-002 | Offer detail แสดง asset, buyer, owner, timeline, related chat context และ notification delivery ครบ |
| AC-BO-OFFER-003 | Offer Management V1 เป็น read-only และไม่มีปุ่ม accept/decline/cancel/force-expire/invalidate |
| AC-BO-OFFER-004 | Asset deleted/sold impact ต้องสะท้อน status `Cancelled` หรือ `Rejected` ตาม FO Offer policy |
| AC-BO-OFFER-005 | User report ที่มาจาก chat ต้องอยู่ใน `User Management > Reported Users` และแสดง chat/offer เป็น context โดยไม่สื่อว่า FO มี `Report chat` แยกต่างหาก |
| AC-BO-OFFER-006 | Admin ไม่สามารถ edit user message หรือ offer price โดยตรง |
| AC-BO-OFFER-007 | FO Delete Chat เป็น user-level visibility เท่านั้น BO ยัง retain record ตาม retention policy |
| AC-BO-OFFER-008 | Pending offer dependency ใช้ block account deletion ได้ |
| AC-BO-OFFER-009 | Export offer history จำกัด permission และ audit export event |
| AC-BO-OFFER-010 | Responsive layout ใช้งานได้ที่ mobile-width, tablet และ desktop |

## 18. Open Decisions

| ID | Decision Needed | Current Recommendation |
| --- | --- | --- |
| BO-OFFER-DEC-001 | Chat/offer retention period | ต้องสรุปร่วมกับ legal/compliance ก่อน build Phase 2 |
| BO-OFFER-DEC-002 | จะเปิด write action ใดใน Offer Management หลัง V1 หรือไม่ | V1 read-only; future write action ต้อง Product approval |
| BO-OFFER-DEC-003 | Keyword search ใน related chat context เปิดให้ admin access ใด | เริ่มจาก permission-gated read-only context เฉพาะ report/support/deletion case |

