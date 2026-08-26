# 09 BO Offer Management Module

**Version:** `BO-09-v0.1`  
**Date:** 2026-07-06  
**Status:** Draft baseline  
**Platform:** Responsive Web Back Office  
**Primary FO Sources:** `../FrontOffice/08_OFFER_MODULE.md`, `../FrontOffice/07_CHAT_MODULE.md`, `../FrontOffice/09_NOTIFICATION_MODULE.md`, `../FrontOffice/04_ASSET_MANAGEMENT_MODULE.md`, `../FrontOffice/13_SETTINGS_MODULE.md`, `../FrontOffice/15_TRUST_SAFETY_MODULE.md`  

## 1. วัตถุประสงค์

BO Offer Management Module คือหน้าจอสำหรับทีม Admin ใช้ดูรายการ offer แบบ read-only เพื่อเห็นความสนใจต่อ asset, buyer/seller, ราคา offer, สถานะ offer และ related chat context ที่เกิดจาก FO

โมดูลนี้ไม่ได้ทำหน้าที่แทนผู้ซื้อหรือผู้ขายใน FO และไม่ใช่ moderation queue สำหรับ chat/report. ใน V1 Admin ใช้ดูข้อมูลและ drill-in เท่านั้น; การเปลี่ยนสถานะ offer ต้องเกิดจาก FO user action หรือ system rule ของ Asset/Account workflow ตาม policy

## 2. Scope

### In Scope

- Offer list พร้อม search, filter, sort, pagination และ export/report ตาม permission
- Offer detail พร้อม asset summary, buyer/owner summary, status timeline, related chat และ notification delivery
- Offer lifecycle status review: `Pending`, `Paused`, `Accepted`, `Rejected`, `Cancelled`, `Invalidated`
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

- Status: `Pending`, `Paused`, `Accepted`, `Rejected`, `Cancelled`, `Invalidated`
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
- Paused Offers
- Accepted Offers
- Rejected Offers
- Cancelled Offers
- Invalidated Offers
- Offers With Notification Failure

## 7. Offer Status Contract

| Status | Meaning | FO Required Behavior |
| --- | --- | --- |
| `Pending` | รอ owner ตอบรับหรือปฏิเสธ | แสดงเป็น active pending offer ใน incoming/chat surfaces |
| `Paused` | Offer ถูกพักชั่วคราวเพราะ asset ถูก auto hidden/ซ่อนชั่วคราวระหว่าง review | ไม่อยู่ใน active Incoming Offers; Offer Card ยังอยู่ใน Chat แต่ไม่มี Accept/Decline |
| `Accepted` | Owner accepted offer | Buyer ได้ notification และเปิดไป Chat Room; ไม่ถือว่า payment complete |
| `Rejected` | Owner กด `Decline` แล้ว offer ถูกปฏิเสธ | ออกจาก incoming pending state; notification/deep link ตาม FO rule เปิด Asset Detail |
| `Cancelled` | Offer ถูกยกเลิกตาม user/system flow ที่ไม่ใช่ owner reject | ไม่เป็น active pending; history ยังอยู่ |
| `Invalidated` | Offer ใช้งานไม่ได้ถาวรเพราะ asset ถูกซ่อนถาวรหรือไม่ผ่าน moderation | Final unavailable state; ไม่มี Accept/Decline; history ยังอยู่ |

หมายเหตุ:

- `Decline` เป็น action/copy ของ FO; `Rejected` เป็น status ของระบบ
- `Declined` จาก legacy source ต้อง map เป็น `Rejected`
- `Accepted` เป็นการตกลง offer เท่านั้น ไม่ใช่ payment completion, sale completion หรือ escrow confirmation
- `Paused` ไม่ใช่ final state; ถ้า review ผ่านต้องกลับเป็น `Pending`
- `Invalidated` เป็น final state สำหรับ moderation outcome ถาวร ไม่ใช่ owner reject และไม่ใช่ owner delete

## 8. Offer Lifecycle Rules

FO สร้าง offer ได้จาก Asset Detail เท่านั้น ไม่สร้าง offer โดยตรงจาก Feed, Search, Profile list หรือ Chat list

| Event | BO Requirement | FO Impact |
| --- | --- | --- |
| User creates offer | สร้าง offer record, status `Pending`, ผูก asset/buyer/owner/chat context | แสดง pending offer และ offer card ใน chat ตาม FO rule |
| Owner accepts offer | บันทึก status `Accepted`, timeline, notification delivery | Buyer ได้ notification เปิด Chat Room |
| Owner declines offer | บันทึก status `Rejected`, timeline, notification delivery | Buyer ได้ notification เปิด Asset Detail; incoming pending หาย |
| Asset ถูกลบโดยเจ้าของ while pending | เปลี่ยน related offers เป็น `Cancelled` ตาม FO Offer policy | FO แสดง unavailable asset reference และ offer ออกจาก active pending flow |
| Owner เปลี่ยน asset จาก `Sale`/`Show` เป็น `Hide` while pending | เปลี่ยน related offers เป็น `Cancelled` | FO แสดง Offer Cancelled และไม่มี Accept/Decline |
| Asset sold while pending | เปลี่ยน other pending offers เป็น `Rejected` อัตโนมัติตาม FO Offer policy | FO เอา offer ออกจาก Incoming Offers และแจ้งผลตาม Notification rule |
| Asset ถูก report จน auto hidden หรือ Admin ซ่อนชั่วคราว while pending | เปลี่ยน related offers เป็น `Paused` พร้อม reason/source | FO แสดง Offer Paused ใน Chat และไม่มี Accept/Decline จนกว่า review จบ |
| Review ผ่านและ asset กลับเป็น `Sale`/`Show` | เปลี่ยน `Paused` offer กลับเป็น `Pending` | FO แสดง action `Accept`/`Decline` อีกครั้ง |
| Asset ถูกซ่อนถาวรจาก moderation | เปลี่ยน related `Pending`/`Paused` offers เป็น `Invalidated` | FO แสดง Offer Unavailable final state และไม่มี Accept/Decline |
| User/account state blocks transaction | ปิดการสร้าง offer/chat ใหม่ระหว่างคู่ที่ block กันตาม Trust & Safety policy | FO ต้องไม่เปิด action ที่ทำไม่ได้ |

Asset status rule:

- `Sale` รองรับ offer ตาม marketplace flow
- `Show` รองรับ offer/contact จาก Asset Detail หรือ public profile detail เฉพาะตาม FO rule แต่ไม่ขึ้น Feed/Search/Watch Alert
- `Hide`, `Sold`, `ซ่อนถาวร`, `ลบโดยเจ้าของ` ไม่รับ offer ใหม่
- `ซ่อนชั่วคราว` และ auto hidden จาก report ไม่รับ offer ใหม่ และ pending offer เดิมต้องอยู่ใน `Paused`
- Existing chat room ยังดูได้หลัง asset sold/deleted แต่ asset card ต้องแสดง unavailable หรือ sold state ตาม FO rule

## 9. Offer Detail

Prototype baseline ปัจจุบันของ Offer Detail เป็น read-only detail view แบบย่อ โดยยึดหน้าจอ `Prototypes/bo-prototype.html` เป็น source of truth:

- Header แสดง Offer ID, asset reference, offer status และ offer amount
- Offered Asset section แสดง Offer ID, Asset ID, Asset Name, Offer Amount, Asking Price, Asset Status และ Created time
- Offered Asset section มีปุ่ม `View Asset` เพื่อ drill-in ไป Asset Detail ตาม permission
- Buyer / Owner section แสดง Buyer User ID, Buyer name, Owner User ID และ Owner name
- Offer History section แสดง Date / Time, Actor, Action, Status และ Reason / Note

ข้อมูลต่อไปนี้ยังไม่ถูก render บน prototype Offer Detail ปัจจุบัน และไม่ควรถือว่าเป็นหน้าจอที่ implement แล้วจนกว่าจะมี task แยก:

- Full offer summary ที่รวม updated time, source surface และ last action/source
- Asset summary แบบเต็มที่แยก thumbnail, brand, model, reference และ owner summary ครบทุก field
- Buyer/Owner account status, report count, suspension signal และ verification state
- Status timeline แบบแยก created/paused/resumed/accepted/rejected/cancelled/invalidated events
- FO display state
- Related chat room context/link
- Notification delivery status
- Audit events visibility

Admin ห้ามแก้ offer price, buyer, owner หรือ message content โดยตรง ถ้าต้องแก้ข้อมูลผิดพลาดให้ใช้ correction workflow ที่มี audit และ Product approval แยกต่างหาก

## 10. Admin Actions

| Action | Allowed Roles | Requirement |
| --- | --- | --- |
| View offer | Admin | Module permission required |
| Open asset detail | Admin | Prototype exposes `View Asset`; route to Asset Management detail ตาม permission |

Prototype ปัจจุบันยังไม่มี action/control สำหรับ related chat context, buyer/owner detail drill-in, export offer history หรือ notification delivery บน Offer Detail

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
- Offer paused notification ไป buyer/seller เมื่อ asset ถูก auto hidden หรือซ่อนชั่วคราว
- Offer resumed notification ไป seller เมื่อ review ผ่านและ offer กลับเป็น active pending
- Offer cancelled notification ไป buyer/seller เมื่อ asset ถูกลบหรือ owner เปลี่ยนเป็น Hide
- Offer invalidated notification ไป buyer/seller เมื่อ asset ถูกซ่อนถาวร

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
- Asset ถูก removed/sold/hidden/auto hidden ระหว่าง review
- Permission denied สำหรับ transcript, attachment, export หรือ sensitive reveal
- Notification delivery section load fail โดยไม่ทำให้ offer detail ทั้งหน้าล่ม

## 16. Integration With Other BO Modules

| Module | Integration |
| --- | --- |
| Dashboard | Offer metrics, offer status summary, notification failure count |
| User Management | Buyer/owner profile, account status, suspension/ban impact |
| Asset Management | Asset sold/delete/hide/auto-hide/permanent-hide impact ต่อ offer status; asset card state in chat |
| Audit Log | Offer export/sensitive-view actions ต้อง searchable |
| Notification | Delivery logs, templates, retry policy |
| Account Deletion | Pending offer validation ก่อน archive/anonymize |
| Help & Support | Chat/offer context สำหรับ ticket/dispute |
| Reports & Analytics | Offer/chat aggregate และ export ตาม permission |

## 17. Acceptance Criteria

| ID | Criteria |
| --- | --- |
| AC-BO-OFFER-001 | Offer list แสดง search/filter/status ครบและใช้ `Rejected` ไม่ใช้ `Declined` ใน UI ใหม่ |
| AC-BO-OFFER-002 | Prototype Offer Detail แสดง Offered Asset, Buyer/Owner แบบย่อ และ Offer History ตามหน้าจอปัจจุบัน |
| AC-BO-OFFER-003 | Offer Management V1 เป็น read-only และไม่มีปุ่ม accept/decline/cancel/force-expire/invalidate |
| AC-BO-OFFER-004 | Asset lifecycle impact ต้องสะท้อน status ถูกต้อง: deleted/owner-hide -> `Cancelled`, sold -> `Rejected`, auto-hidden/temp-hidden -> `Paused`, permanent hide -> `Invalidated` |
| AC-BO-OFFER-005 | User report ที่มาจาก chat ต้องอยู่ใน `User Management > Reported Users` และแสดง chat/offer เป็น context โดยไม่สื่อว่า FO มี `Report chat` แยกต่างหาก |
| AC-BO-OFFER-006 | Admin ไม่สามารถ edit user message หรือ offer price โดยตรง |
| AC-BO-OFFER-007 | FO Delete Chat เป็น user-level visibility เท่านั้น BO ยัง retain record ตาม retention policy |
| AC-BO-OFFER-008 | Pending offer dependency ใช้ block account deletion ได้ |
| AC-BO-OFFER-009 | Export offer history ยังไม่ปรากฏบน prototype Offer Detail ปัจจุบัน; ถ้าเพิ่มภายหลังต้องจำกัด permission และ audit export event |
| AC-BO-OFFER-010 | Responsive layout ใช้งานได้ที่ mobile-width, tablet และ desktop |

## 18. Open Decisions

| ID | Decision Needed | Current Recommendation |
| --- | --- | --- |
| BO-OFFER-DEC-001 | Chat/offer retention period | ต้องสรุปร่วมกับ legal/compliance ก่อน build Phase 2 |
| BO-OFFER-DEC-002 | จะเปิด write action ใดใน Offer Management หลัง V1 หรือไม่ | V1 read-only; future write action ต้อง Product approval |
| BO-OFFER-DEC-003 | Keyword search ใน related chat context เปิดให้ admin access ใด | เริ่มจาก permission-gated read-only context เฉพาะ report/support/deletion case |

