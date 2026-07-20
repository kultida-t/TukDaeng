# 09 BO Offer / Chat Module

**Version:** `BO-09-v0.1`  
**Date:** 2026-07-06  
**Status:** Draft baseline  
**Platform:** Responsive Web Back Office  
**Primary FO Sources:** `../FrontOffice/08_OFFER_MODULE.md`, `../FrontOffice/07_CHAT_MODULE.md`, `../FrontOffice/09_NOTIFICATION_MODULE.md`, `../FrontOffice/04_ASSET_MANAGEMENT_MODULE.md`, `../FrontOffice/13_SETTINGS_MODULE.md`, `../FrontOffice/15_TRUST_SAFETY_MODULE.md`  
**Integration Map:** `../ProjectAdmin/FO_BO_INTEGRATION_MAP.md`

## 1. วัตถุประสงค์

BO Offer / Chat Module คือหน้าจอสำหรับทีม Admin ใช้ตรวจสอบ lifecycle ของ offer, chat room, reported chat, attachment scan, notification delivery และข้อมูลประกอบ dispute/support ที่เกิดจาก FO

โมดูลนี้ไม่ได้ทำหน้าที่แทนผู้ซื้อหรือผู้ขายใน FO แต่ต้องทำให้ทีม internal เห็นเหตุการณ์ครบ ตรวจสอบได้ ส่งผลต่อ FO อย่างถูกต้อง และ audit ได้ทุก action ที่เปลี่ยนสถานะหรือแตะข้อมูล sensitive

## 2. Scope

### In Scope

- Offer list พร้อม search, filter, sort, pagination และ export ตาม permission
- Offer detail พร้อม asset summary, buyer/owner summary, status timeline, related chat และ notification delivery
- Offer lifecycle status review: `Pending`, `Accepted`, `Rejected`, `Cancelled`, `Expired`, `Invalidated`
- Force expire offer สำหรับ Admin
- Mark invalidated สำหรับ system/Admin เมื่อ asset หรือ user state ทำให้ offer ใช้งานต่อไม่ได้
- Chat room list และ chat detail สำหรับ review/report/support
- Reported chat handling และ message moderation ตาม policy
- Attachment/file scan status และ unsafe attachment handling
- User-level delete chat visibility เทียบกับ server retention
- Audit log สำหรับ force expire, invalidate, hide/remove message, export และ sensitive reveal
- Responsive layout สำหรับ desktop, tablet และ mobile-width browser

### Out Of Scope

- Payment, escrow, payment settlement หรือ in-app transaction
- Counter offer, offer withdrawal และ offer auto-expiration ใน FO V1 เว้นแต่ Product เปิด scope เพิ่ม
- Admin แก้ราคา offer หรือแก้ข้อความ user โดยตรง
- Admin ส่งข้อความแทน user ใน chat
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
| Write action | Create, update, status change, remove, restore, publish, archive, retry, and similar actions require permission check, confirmation for high-risk actions, reason when FO/user impact exists, and audit log. |
| Sensitive data | Mask by default; reveal only with business reason, policy approval, and audit log. |
| Export | Requires permission check, scope control, expiry/background job where needed, and audit export event. |
| Direct URL/API | Enforce access at route, API, and service layers; never rely only on hidden UI. |
## 5. Responsive Layout

| Width | Layout Requirement |
| --- | --- |
| Mobile-width browser | Offer/chat table ต้องเปลี่ยนเป็น stacked cards, filter อยู่ใน drawer/bottom sheet, action สำคัญต้องไม่ล้นจอ |
| Tablet | แสดง list + detail panel แบบย่อได้, column รองเปิดผ่าน detail drawer |
| Desktop | ใช้ full table, side filters, split detail panel และ conversation review panel ได้ |

Chat transcript ต้องอ่านต่อเนื่องได้โดยไม่บีบข้อความจนอ่านยาก และ attachment preview ต้องมี fallback เมื่อจอเล็ก

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

- Status: `Pending`, `Accepted`, `Rejected`, `Cancelled`, `Expired`, `Invalidated`
- Brand / model
- Price range
- Created date range
- Updated date range
- Asset status
- Has related chat
- Has report
- Has notification failure

### Saved Views

- All Offers
- Pending Offers
- Accepted Offers
- Rejected Offers
- Expired / Invalidated
- Offers With Reported Chat
- Offers With Notification Failure

## 7. Offer Status Contract

| Status | Meaning | FO Required Behavior |
| --- | --- | --- |
| `Pending` | รอ owner ตอบรับหรือปฏิเสธ | แสดงเป็น active pending offer ใน incoming/chat surfaces |
| `Accepted` | Owner accepted offer | Buyer ได้ notification และเปิดไป Chat Room; ไม่ถือว่า payment complete |
| `Rejected` | Owner กด `Decline` แล้ว offer ถูกปฏิเสธ | ออกจาก incoming pending state; notification/deep link ตาม FO rule เปิด Asset Detail |
| `Cancelled` | Offer ถูกยกเลิกตาม user/system flow ที่ไม่ใช่ owner reject | ไม่เป็น active pending; history ยังอยู่ |
| `Expired` | Offer หมดอายุหรือถูก force expired โดย BO | accept/decline ไม่ได้ และออกจาก pending flow |
| `Invalidated` | Asset/user/system state ทำให้ offer ใช้งานต่อไม่ได้ | FO แสดง unavailable/invalidated state และเอาออกจาก active pending flow |

หมายเหตุ:

- `Decline` เป็น action/copy ของ FO; `Rejected` เป็น status ของระบบ
- `Declined` จาก legacy source ต้อง map เป็น `Rejected`
- `Expired` และ `Invalidated` เป็น admin/system state สำหรับ BO Phase 2; FO V1 อาจไม่มี user action สำหรับสองสถานะนี้
- `Accepted` เป็นการตกลง offer เท่านั้น ไม่ใช่ payment completion, sale completion หรือ escrow confirmation

## 8. Offer Lifecycle Rules

FO สร้าง offer ได้จาก Asset Detail เท่านั้น ไม่สร้าง offer โดยตรงจาก Feed, Search, Profile list หรือ Chat list

| Event | BO Requirement | FO Impact |
| --- | --- | --- |
| User creates offer | สร้าง offer record, status `Pending`, ผูก asset/buyer/owner/chat context | แสดง pending offer และ offer card ใน chat ตาม FO rule |
| Owner accepts offer | บันทึก status `Accepted`, timeline, notification delivery | Buyer ได้ notification เปิด Chat Room |
| Owner declines offer | บันทึก status `Rejected`, timeline, notification delivery | Buyer ได้ notification เปิด Asset Detail; incoming pending หาย |
| Admin force expires offer | เปลี่ยนเป็น `Expired`, reason required, audit | Offer accept/decline ไม่ได้และออกจาก active pending flow |
| Asset ซ่อนถาวร/Owner Deleted/sold while pending | เปลี่ยน impacted offers เป็น `Invalidated` ตาม system policy | FO แสดง unavailable/invalidated และไม่ให้ action ต่อ |
| User/account state blocks transaction | เปลี่ยนหรือ block offer ตาม policy พร้อม reason | FO ต้องไม่เปิด action ที่ทำไม่ได้ |

Asset status rule:

- `Sale` รองรับ offer ตาม marketplace flow
- `Show` รองรับ offer/contact จาก Asset Detail หรือ public profile detail เฉพาะตาม FO rule แต่ไม่ขึ้น Feed/Search/Watch Alert
- `Hide`, `Sold`, `ซ่อนถาวร`, `Owner Deleted` ไม่รับ offer ใหม่
- Existing chat room ยังดูได้หลัง asset sold/deleted แต่ asset card ต้องแสดง unavailable หรือ sold state ตาม FO rule

## 9. Offer Detail

Offer detail ต้องแสดง:

- Offer summary: ID, status, price, created/updated time, source surface
- Asset summary: thumbnail, brand, model, reference, current status, asking price
- Buyer summary: user ID, display name, account status, report/suspension signals
- Owner summary: user ID, display name, account status, report/suspension signals
- Status timeline: created, accepted/rejected/cancelled/expired/invalidated, actor/source, timestamp, reason
- Related chat room link
- Offer history ของ asset เดียวกัน
- Notification delivery status
- Audit events ที่เกี่ยวข้อง

Admin ห้ามแก้ offer price, buyer, owner หรือ message content โดยตรง ถ้าต้องแก้ข้อมูลผิดพลาดให้ใช้ correction workflow ที่มี audit และ Product approval แยกต่างหาก

## 10. Admin Actions

| Action | Allowed Roles | Requirement |
| --- | --- | --- |
| View offer | Admin | Module permission required |
| View related chat | Admin | ต้อง respect privacy/sensitive masking |
| Force expire offer | Admin | Confirmation, reason, status timeline, audit |
| Mark invalidated | System, Admin | Reason, impacted asset/user reference, audit |
| Export offer history | Admin | Audit export event และ controlled access |
| View notification delivery | Admin | Read-only; retry อยู่ใน Notification module |

Bulk action สำหรับ offer ต้องจำกัดมาก เพราะอาจกระทบ FO pending flow หลายรายการพร้อมกัน ค่าเริ่มต้นให้ไม่เปิด bulk force expire/invalidate จนกว่าจะมี approval flow ชัดเจน

## 11. Chat Room List

Chat room list ต้องแสดงข้อมูลขั้นต่ำ:

- Chat Room ID
- Participants
- Related asset
- Last message preview แบบ masked เมื่อเป็น private/sensitive
- Has offer
- Has attachment
- Reported flag
- Unread/report count สำหรับ admin queue
- Last active

### Search And Filters

ค้นหาได้จาก:

- Chat Room ID
- User ID / username / display name
- Asset ID / asset name
- Keyword เฉพาะ admin access ที่มี permission และตาม privacy policy

Filter ขั้นต่ำ:

- Related asset
- Has offer
- Has attachment
- Reported
- Attachment scan status
- Date range
- User/account status

## 12. Chat Detail / Review

Chat detail ต้องแสดง:

- Participants และ account status
- Related asset card พร้อม current availability
- Offer card/history ที่เกี่ยวข้อง
- Conversation transcript
- Attachment/file list พร้อม scan status
- User-level delete/mute/block context เมื่อเกี่ยวข้อง
- Report history และ moderation action history

FO chat rules ที่ BO ต้องเคารพ:

- Chat room ถูกสร้างเมื่อส่งข้อความแรก ไม่ใช่แค่กดปุ่ม Chat
- Same user + same asset ใช้ room เดิม
- Same user + different asset ใช้ room เดิมได้ แต่ reference asset update เป็น asset ล่าสุดตาม FO rule
- FO Delete Chat เป็น user-level hide/delete จาก inbox ของคนนั้น ไม่ใช่ server hard delete
- Block user ทำให้ส่งข้อความใหม่ไม่ได้ แต่ history เดิมยังอ่านได้แบบ read-only ตาม FO rule

## 13. Reported Chat Handling

เมื่อ user report chat/user จาก FO:

- Report ต้องเข้า BO moderation queue
- Chat/message ไม่ควรถูกลบทันที เว้นแต่มี policy/system rule ชัดเจน
- Admin ต้องเห็น context เพียงพอ: reporter, reported user, related asset, messages around report, attachments, previous reports
- ผลการ review ต้องมี status, reason, admin actor และ audit

ผลลัพธ์ที่เป็นไปได้:

- Resolve / no action
- Hide/remove policy-violating message
- Restrict attachment access
- Escalate to Support/Admin
- Suspend/ban user ผ่าน User Management เมื่อเข้าเกณฑ์

## 14. Message And Attachment Moderation

Admin ไม่ควร edit user message โดยตรง

Action ที่อนุญาตตาม permission:

- Hide message from FO
- Remove message from FO view แต่ retain server record ตาม retention policy
- Mark attachment unsafe / blocked
- Export conversation for dispute/audit

Attachment ต้องมี scan status อย่างน้อย:

- `Pending Scan`
- `Clean`
- `Unsafe`
- `Scan Failed`
- `Blocked`

ถ้า scan failed หรือ unsafe ต้องไม่เปิด preview/download ให้ FO จนกว่าจะผ่าน policy

## 15. Notification Delivery

Offer/chat events ที่ต้อง trace delivery:

- Offer created notification ไป owner ถ้า FO เปิดใช้
- Offer accepted notification ไป buyer
- Offer rejected notification ไป buyer
- System invalidated/expired notification ถ้า Product เปิด scope

BO Offer / Chat ดู delivery status ได้ แต่การจัดการ template, retry, broadcast หรือ trigger configuration ต้องอยู่ใน Notification module

## 16. Account Deletion Dependency

FO account deletion ต้อง block ถ้ามี pending offer ตาม FO rule

BO ต้องรองรับ:

- Query pending offer ของ user เพื่อให้ Account Deletion module ตรวจได้
- Link จาก user/account deletion request กลับมาดู offer context
- ห้าม archive/anonymize user จนกว่า pending offer dependency ถูก resolve ตาม policy
- Audit ทุกครั้งที่ pending offer ถูกใช้เป็นเหตุผล block deletion

## 17. Audit Requirements

Audit action ขั้นต่ำ:

- `OFFER_FORCE_EXPIRE`
- `OFFER_MARK_INVALIDATED`
- `OFFER_EXPORT`
- `CHAT_MESSAGE_HIDE`
- `CHAT_MESSAGE_REMOVE`
- `CHAT_ATTACHMENT_BLOCK`
- `CHAT_EXPORT`
- `REPORTED_CHAT_RESOLVE`
- `CHAT_SENSITIVE_REVEAL`

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

## 18. Error, Empty, Loading States

ต้องรองรับ:

- Empty offer list ตาม filter
- Empty chat list ตาม filter
- Offer หรือ chat ถูก update ระหว่าง admin เปิดหน้า
- Asset ถูก removed/sold ระหว่าง review
- Permission denied สำหรับ transcript, attachment, export หรือ sensitive reveal
- Notification delivery section load fail โดยไม่ทำให้ offer detail ทั้งหน้าล่ม
- Attachment preview unavailable

## 19. Integration With Other BO Modules

| Module | Integration |
| --- | --- |
| Dashboard | Offer metrics, reported chat count, notification failure count |
| User Management | Buyer/owner profile, account status, suspension/ban impact |
| Asset Management | Asset status change invalidates/blocks offer; asset card state in chat |
| Audit Log | Offer/chat sensitive actions ต้อง searchable |
| Notification | Delivery logs, templates, retry policy |
| Account Deletion | Pending offer validation ก่อน archive/anonymize |
| Help & Support | Chat/offer context สำหรับ ticket/dispute |
| Reports & Analytics | Offer/chat aggregate และ export ตาม permission |

## 20. Acceptance Criteria

| ID | Criteria |
| --- | --- |
| AC-BO-OFFER-001 | Offer list แสดง search/filter/status ครบและใช้ `Rejected` ไม่ใช้ `Declined` ใน UI ใหม่ |
| AC-BO-OFFER-002 | Offer detail แสดง asset, buyer, owner, timeline, related chat และ notification delivery ครบ |
| AC-BO-OFFER-003 | Admin force expire ได้โดยมี confirmation, reason และ audit |
| AC-BO-OFFER-004 | Asset removed/sold ขณะมี pending offer ต้อง map เป็น `Invalidated` หรือ policy state ที่ระบุชัด และ FO active pending flow ต้องหยุด |
| AC-BO-OFFER-005 | Chat list/detail รองรับ reported chat, attachment scan status และ related offer/asset context |
| AC-BO-OFFER-006 | Admin ไม่สามารถ edit user message หรือ offer price โดยตรง |
| AC-BO-OFFER-007 | FO Delete Chat เป็น user-level visibility เท่านั้น BO ยัง retain record ตาม retention policy |
| AC-BO-OFFER-008 | Pending offer dependency ใช้ block account deletion ได้ |
| AC-BO-OFFER-009 | Export conversation/offer history จำกัด permission และ audit export event |
| AC-BO-OFFER-010 | Responsive layout ใช้งานได้ที่ mobile-width, tablet และ desktop |

## 21. Open Decisions

| ID | Decision Needed | Current Recommendation |
| --- | --- | --- |
| BO-OFFER-DEC-001 | Chat/offer retention period | ต้องสรุปร่วมกับ legal/compliance ก่อน build Phase 2 |
| BO-OFFER-DEC-002 | Pending offer เมื่อ asset sold โดย owner ใช้ `Rejected` auto หรือ `Invalidated` | ใช้ `Invalidated` สำหรับ system-caused state; ถ้า owner reject เองใช้ `Rejected` |
| BO-OFFER-DEC-003 | จะเปิด FO-visible notification สำหรับ `Expired`/`Invalidated` หรือไม่ | ให้ Notification module กำหนด template/destination เพิ่มก่อนเปิด |
| BO-OFFER-DEC-004 | Keyword search ใน chat transcript เปิดให้ admin access ใด | เริ่มจาก Admin เฉพาะ reported/dispute context |
