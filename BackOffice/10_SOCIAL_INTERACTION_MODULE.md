# 10 BO Social Interaction Module

**Version:** `BO-10-v0.1`  
**Date:** 2026-07-06  
**Status:** Draft baseline  
**Platform:** Responsive Web Back Office  
**Primary FO Sources:** `../FrontOffice/11_SOCIAL_MODULE.md`, `../FrontOffice/05_ASSET_DETAIL_MODULE.md`, `../FrontOffice/15_TRUST_SAFETY_MODULE.md`, `../FrontOffice/06_PROFILE_MODULE.md`, `../FrontOffice/02_FEED_MODULE.md`, `../FrontOffice/09_NOTIFICATION_MODULE.md`  
**Integration Map:** `../ProjectAdmin/FO_BO_INTEGRATION_MAP.md`

## 1. วัตถุประสงค์

BO Social Interaction Module คือหน้าจอสำหรับ Admin ใช้ดูแลและตรวจสอบ interaction ที่เกิดจาก FO ได้แก่ comment, reply, reported comment, like/favorite และ follow/unfollow

โมดูลนี้เน้น moderation, analytics และ traceability ไม่ใช่เครื่องมือให้ Admin สร้าง engagement แทน user

## 2. Scope

### In Scope

- Comment/reply list พร้อม search, filter, sort, pagination
- Comment detail พร้อม asset context, author, parent/reply relation, report history และ moderation history
- Reported comment queue พร้อม SLA 24 ชั่วโมงตาม Trust & Safety
- Hide/unhide/remove comment ตาม permission และ policy
- Like/Favorite analytics และ aggregate view
- Follow/Unfollow analytics และ relationship view
- Block impact visibility สำหรับ following feed และ discovery surfaces
- Export social data ตาม permission
- Audit log สำหรับ moderation, export และ sensitive reveal
- Responsive layout สำหรับ desktop, tablet และ mobile-width browser

### Out Of Scope

- Admin edit comment content โดยตรง
- Admin create comment/reply/like/follow แทน user
- Multi-level nested comment เกิน 1 reply level
- Comment attachment, mention, reaction, repost, story
- Automated moderation หรือ AI moderation
- Individual like/follow mutation โดย Admin ทั่วไป ยกเว้น Super Admin มี policy/incident workflow ชัดเจน

## 3. FO Social Rules ที่ BO ต้องยึด

| Area | FO Rule | BO Requirement |
| --- | --- | --- |
| Comment entry | Comment ทำจาก Asset Detail เท่านั้น | BO ต้องแสดง source เป็น Asset Detail และผูก asset context |
| Reply structure | รองรับ reply ใต้ root comment 1 ชั้น | BO ต้องไม่สร้าง/แสดง nested thread เกิน 1 level เป็น normal state |
| Edit comment | FO V1 ไม่มี Edit Comment | BO ห้าม edit text โดยตรง |
| Delete own comment | User ลบ comment/reply ตัวเองได้ | BO ต้องเห็น deleted state และ audit/source เป็น user action |
| Report comment | Report แล้ว comment ไม่หายทันที | BO ต้องรับ report queue โดยไม่ auto-hide เว้นแต่ policy/system rule ชัดเจน |
| Like/Favorite | Like asset ต้อง sync Favorites; Unlike ต้อง remove Favorites | BO analytics ต้องถือ like/favorite เป็น linked behavior |
| Follow | Following Feed ใช้เฉพาะ Sale asset ของ user ที่ follow | BO ต้องไม่สรุปว่า Show/Hide/Sold เข้า Following Feed |
| Block | Block ทำให้ content ของอีกฝ่ายถูก filter จาก Feed/Search/Watch Alert และ relation ไม่ใช้ใน Following Feed | BO ต้องแสดง block context เมื่อ review social relation |

## 4. Roles And Permissions

| Role | Permission |
| --- | --- |
| Super Admin | ดู social interaction ครบ, hide/unhide/remove comment, export, reveal sensitive context, override moderation result |
| Moderator | ดู reported comment queue, hide/remove policy-violating comment, resolve report |
| Support Admin | ดู social context ที่เกี่ยวกับ ticket/user case แบบ read-only เป็นหลัก |
| Content Admin | ดู Board/social aggregate เฉพาะเมื่อเกี่ยวกับ content report ที่ได้รับ permission |
| Market Admin | ไม่มี permission หลัก ยกเว้น read-only aggregate ที่เกี่ยวกับ asset/brand analytics |

ทุก write action ต้องตรวจ permission ที่ UI, route/API และ service layer

## 5. Responsive Layout

| Width | Layout Requirement |
| --- | --- |
| Mobile-width browser | Table เปลี่ยนเป็น stacked cards, filter อยู่ใน drawer/bottom sheet, moderation action ต้องเข้าถึงได้โดยไม่ล้นจอ |
| Tablet | List + detail drawer, แสดง column สำคัญและซ่อน secondary fields |
| Desktop | Full table, side filters, split detail panel และ report timeline |

Comment text ต้อง wrap ได้ อ่านง่าย และไม่ทำให้ action column ถูกบีบจนใช้งานไม่ได้

## 6. Comment / Reply List

ข้อมูลขั้นต่ำ:

- Comment ID
- Asset ID / Asset name
- Author
- Parent comment ID ถ้าเป็น reply
- Comment excerpt
- Status
- Report count
- Like count ถ้ามีใน data model
- Created date
- Updated/moderated date
- Last moderation action

### Search

ค้นหาได้จาก:

- Comment ID
- Asset ID / asset name
- Author user ID / username / display name
- Keyword ใน comment เฉพาะ role ที่มี permission และตาม privacy policy

### Filters

- Status: `Visible`, `Reported`, `Hidden`, `Removed`, `User Deleted`
- Asset
- Author account status
- Has report
- Report reason
- Created date range
- Moderated date range
- Root comment / reply

## 7. Comment Status Contract

| Status | Meaning | FO Required Behavior |
| --- | --- | --- |
| `Visible` | แสดงปกติ | แสดงใน Asset Detail ตาม visibility/block rule |
| `Reported` | มี report รอ review | ยังแสดงอยู่จนกว่า Admin moderation จะดำเนินการ |
| `Hidden` | Admin ซ่อนจาก FO ชั่วคราวหรือตาม policy | หายจาก Asset Detail หรือแสดง hidden state ตาม FO UX policy |
| `Removed` | Admin remove จาก FO view แต่ retain record ตาม retention | หายหรือแสดง removed/deleted state ตาม FO UX policy |
| `User Deleted` | User ลบ comment ของตัวเอง | หายจาก FO และลด count ตาม FO rule |

BO ต้องแยก `User Deleted` ออกจาก `Removed` เพราะ actor/source ต่างกัน และ audit/report interpretation ต่างกัน

## 8. Reported Comment Queue

เมื่อ FO user report comment:

- Report ต้องเข้า BO queue
- Comment ต้องไม่หายจาก FO ทันทีเพราะ report เพียงอย่างเดียว
- SLA baseline คือ review ภายใน 24 ชั่วโมง
- Moderator ต้องเห็น context รอบ comment เพียงพอ เช่น asset, author, reporter, parent/replies, previous reports

ข้อมูล report ขั้นต่ำ:

- Report ID
- Report type = `Comment`
- Comment ID
- Reporter
- Reported author
- Reason
- Additional detail ถ้ามี
- Submitted timestamp
- SLA due time
- Current report status

## 9. Comment Detail

Comment detail ต้องแสดง:

- Full comment text
- Author summary และ account status
- Asset summary และ current visibility
- Parent/root comment relation
- Replies ใต้ root comment เฉพาะ 1 level
- Report history
- Moderation timeline
- Linked notification/event ถ้ามี
- Audit events ที่เกี่ยวข้อง

Admin ห้ามแก้ comment text โดยตรง ถ้าต้องแก้ข้อมูลผิดพลาดให้ใช้ correction workflow แยกพร้อม audit และ approval

## 10. Admin Moderation Actions

| Action | Allowed Roles | Requirement |
| --- | --- | --- |
| View comment | Super Admin, Moderator, Support Admin | Module permission required |
| Hide comment | Super Admin, Moderator | Confirmation, reason, audit, FO sync |
| Unhide comment | Super Admin, Moderator | Reason, audit, FO sync |
| Remove comment | Super Admin, Moderator ตาม policy | Confirmation, reason, audit, FO sync |
| Resolve report / no action | Super Admin, Moderator | Reason/note, report status update |
| Export comments/reports | Super Admin | Audit export event และ controlled access |

Bulk moderation ต้องจำกัดเฉพาะ queue ที่มี policy ชัดเจน และต้องมี confirmation + reason เสมอ

## 11. Like / Favorite Analytics

BO ใช้ like/favorite เป็น analytics และ support context เป็นหลัก

Rules:

- Like asset ใน FO ต้องเพิ่ม asset เข้า Favorites
- Unlike ต้องลบ asset ออกจาก Favorites
- 1 user มีได้ 1 like ต่อ 1 asset
- Owner สามารถ like asset ตัวเองได้ตาม FO rule
- BO ไม่ควรแก้ individual like/favorite record โดย Admin ทั่วไป

Analytics ขั้นต่ำ:

- Total likes
- Total favorites
- Like/favorite by asset
- Top liked/favorited assets
- Like/favorite trend by date range
- Like/favorite by brand/model ถ้า asset data พร้อม

## 12. Follow / Unfollow Analytics

BO ใช้ follow relation สำหรับ analytics และ support context เป็นหลัก

Rules:

- User follow ตัวเองไม่ได้
- Follow/Unfollow update follower/following count
- Following Feed แสดงเฉพาะ `Sale` asset ของ user ที่ follow
- Block relation ต้องทำให้ follow relation ไม่ถูกใช้ในการแสดง Following Feed

ข้อมูลขั้นต่ำ:

- Follower user
- Following user
- Status: active/inactive/blocked-impact
- Created date
- Updated date
- Last source/action

Analytics ขั้นต่ำ:

- Total follows
- Total unfollows
- Net follows
- Top followed users
- Follow trend by date range
- Block-impact relation count

## 13. FO Sync Rules

| BO Action | FO Result |
| --- | --- |
| Hide comment | Comment หายจาก Asset Detail หรือแสดง hidden state ตาม UX policy |
| Unhide comment | Comment กลับมาแสดงเมื่อ asset/user visibility ยังอนุญาต |
| Remove comment | Comment หายหรือแสดง removed/deleted state ตาม FO UX policy |
| Resolve report / no action | FO content ไม่เปลี่ยน เว้นแต่มี action อื่นร่วม |
| User ban/suspend related author | FO behavior ต้องตาม User Management account state |

Comment count ต้องสะท้อนจำนวน comment ที่ user มีสิทธิ์เห็น ไม่ควรนับ hidden/removed เป็น visible count เว้นแต่ FO UX กำหนด placeholder ที่นับแยก

## 14. Notifications

BO Social Interaction ดู notification context ได้เฉพาะเพื่อ trace:

- Asset liked notification
- Asset commented notification
- User followed notification

การจัดการ template, trigger, retry หรือ broadcast อยู่ใน Notification module ไม่ใช่ Social Interaction module

## 15. Audit Requirements

Audit action ขั้นต่ำ:

- `COMMENT_HIDE`
- `COMMENT_UNHIDE`
- `COMMENT_REMOVE`
- `COMMENT_REPORT_RESOLVE`
- `COMMENT_EXPORT`
- `SOCIAL_SENSITIVE_REVEAL`
- `SOCIAL_RELATION_EXPORT`

ทุก event ต้องมี:

- Admin ID
- Admin role
- Action type
- Target entity type และ ID
- Before value
- After value
- Reason/note เมื่อจำเป็น
- Related asset/comment/report/user ID
- IP address หรือ session context ถ้ามี
- Timestamp เป็น `Asia/Bangkok`

## 16. Error, Empty, Loading States

ต้องรองรับ:

- Empty comment list ตาม filter
- Empty reported comment queue
- Comment ถูกลบ/ซ่อนระหว่าง admin เปิดหน้า
- Asset หรือ author ถูก removed/suspended ระหว่าง review
- Permission denied สำหรับ full text, export หรือ sensitive reveal
- Partial load error ของ report history โดยไม่ทำให้ detail ทั้งหน้าล่ม
- Stale count warning เมื่อ aggregate ยัง sync ไม่เสร็จ

## 17. Integration With Other BO Modules

| Module | Integration |
| --- | --- |
| Dashboard | Pending reported comments, social activity trend, SLA risk |
| User Management | Author/reporter account status, suspend/ban impact |
| Asset Management | Asset visibility, removed asset impact ต่อ comment surfaces |
| Offer / Chat | Reported chat/social user context เมื่อต้องดู dispute ต่อเนื่อง |
| Audit Log | Moderation/export/reveal action ต้อง searchable |
| Notification | Like/comment/follow delivery trace |
| Reports & Analytics | Comment, like/favorite, follow aggregate |

## 18. Acceptance Criteria

| ID | Criteria |
| --- | --- |
| AC-BO-SOCIAL-001 | Comment list แสดง search/filter/status ครบ และรองรับ root/reply relation 1 level |
| AC-BO-SOCIAL-002 | Reported comment เข้า BO queue โดยไม่ทำให้ comment หายจาก FO ทันที |
| AC-BO-SOCIAL-003 | Moderator/Super Admin hide/remove/unhide comment ได้ตาม permission พร้อม reason และ audit |
| AC-BO-SOCIAL-004 | BO ห้าม edit user comment text โดยตรง |
| AC-BO-SOCIAL-005 | Comment count และ FO visibility ต้อง sync หลัง hide/remove/unhide |
| AC-BO-SOCIAL-006 | Like/Favorite analytics ต้องสะท้อน rule ที่ Like sync Favorites และ Unlike remove Favorites |
| AC-BO-SOCIAL-007 | Follow analytics ต้องสะท้อน Following Feed rule: Sale asset เท่านั้น และ block relation ห้ามใช้แสดง feed |
| AC-BO-SOCIAL-008 | Export social data จำกัด permission และ audit export event |
| AC-BO-SOCIAL-009 | Reported comment SLA baseline 24 ชั่วโมงต้องแสดงใน queue |
| AC-BO-SOCIAL-010 | Responsive layout ใช้งานได้ที่ mobile-width, tablet และ desktop |

## 19. Open Decisions

| ID | Decision Needed | Current Recommendation |
| --- | --- | --- |
| BO-SOCIAL-DEC-001 | FO จะแสดง placeholder สำหรับ hidden/removed comment หรือซ่อนทั้งหมด | ให้ BO ส่ง state ชัดเจน และให้ FO UX ตัดสิน copy/placeholder |
| BO-SOCIAL-DEC-002 | เปิด keyword search ใน comment text ให้ role ใด | เริ่มจาก Super Admin/Moderator เฉพาะ moderation context |
| BO-SOCIAL-DEC-003 | Super Admin จะสามารถ remove individual like/follow relation ได้หรือไม่ | ยังไม่เปิดเป็น default; ถ้าต้องเปิดให้ใช้ incident workflow พร้อม audit |
