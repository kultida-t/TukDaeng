# PRD - Tuk Daeng Back Office System

**Version:** 1.0  
**Product:** Tuk Daeng Back Office (BO)  
**Audience:** Admin  
**Related Documents:** BO_Spec v1.1, BO_Spec_Completion_Addendum v1.2, FO PRD v1.0, Use Cases v1.0

---

## 1. Product Overview

### 1.1 Objective

ระบบ Back Office ของตึกแดงเป็นเว็บแอปสำหรับทีมภายใน ใช้จัดการข้อมูลและควบคุมการทำงานของแพลตฟอร์มฝั่ง Front Office (FO) ได้แก่ ผู้ใช้ สินทรัพย์ ข้อเสนอ แชท บทความ กระดานข่าว ข้อมูลตลาด ไดเรกทอรี การแจ้งเตือน รายงาน และ audit log

BO ต้องช่วยให้ทีม Admin สามารถ:

- ตรวจสอบและจัดการข้อมูลที่ผู้ใช้สร้างจาก FO
- Moderate สินทรัพย์ คอมเมนต์ แชท และข้อเสนอที่ผิด policy
- จัดการบทความและเนื้อหาที่แสดงในเมนู Board ของ FO
- จัดการ master data เช่น Watch Brand, Model, Price Index และ Directory
- ช่วยเหลือผู้ใช้ผ่าน Support Ticket
- ตรวจสอบรายงานและ performance ของระบบ
- บันทึก audit log ทุก action สำคัญของ Admin

### 1.2 Problem Statement

FO มีหลาย flow ที่สร้างข้อมูลและ interaction จำนวนมาก เช่น asset listing, offer, chat, comment, follow, watch alert, board article และ support request หากไม่มี BO ที่ครบถ้วน ทีมงานจะไม่สามารถตรวจสอบคุณภาพข้อมูล แก้ปัญหาผู้ใช้ หรือควบคุมความปลอดภัยของระบบได้อย่างเป็นระบบ

### 1.3 Product Goals

| Goal | Description |
|---|---|
| Operational Control | ให้ Admin จัดการข้อมูลหลักและข้อมูลที่เกิดจาก FO ได้ครบ |
| Trust & Safety | รองรับ moderation, report handling, suspend/ban, audit |
| Content Publishing | ให้ Admin จัดการบทความ Board และ Banner ได้จาก BO |
| Support Efficiency | ให้ Admin ติดตามและตอบ ticket ได้ |
| Market Data Quality | ให้ทีม Market จัดการ Brand, Model, Price Index และ Directory |
| Traceability | ทุก action สำคัญต้องมี audit log และตรวจสอบย้อนหลังได้ |

---

## 2. Users & Admin Access

### 2.1 BO Users

BO has exactly one admin account type: `Admin`. There are no BO sub-types for content, support, market, moderation, or highest-privilege responsibilities. Access is controlled by module/action policy, sensitive-data policy, export policy, confirmation, reason, and audit requirements.

| Admin Account Type | Primary Responsibility |
|---|---|
| Admin | Manage all BO operational areas allowed by product scope and policy: users, assets, content, market data, directory, offers, chat, social, watch alerts, support, account deletion, notifications, reports, audit, and settings. |

### 2.2 FO Users

FO users have a single account type: `User`. BO must support activity from the same user account across selling, buying, offers, public collection, and private collection states.
## 3. Scope

### 3.1 In Scope

- BO Authentication และ Admin Access Permission
- Dashboard
- User Management
- Asset Management
- Offer & Chat Management
- Social Interaction Management
- Content / Board Management
- Market Data Management
- Watch Alert Management
- Directory Management
- Help & Support Ticket
- Push Notification และ System Notification Trigger
- Reports & Analytics
- Audit Log
- Admin Settings

### 3.2 Out of Scope for Phase 1

- ระบบชำระเงินออนไลน์ใน BO
- Live chat ระหว่าง Admin กับผู้ใช้แบบ real-time
- AI moderation อัตโนมัติ
- External CRM integration
- Full workflow automation สำหรับ legal/compliance

---

## 4. Core Requirements

## 4.1 BO Authentication & Security

### Requirements

- Admin login ด้วย Email/Password เท่านั้น
- Admin must use mandatory 2FA
- admin access อื่นแนะนำให้ใช้ 2FA
- Session หมดอายุเมื่อ idle 8 ชั่วโมง หรือ max 24 ชั่วโมง
- Failed login เกิน 5 ครั้ง lock account 15 นาที
- Production รองรับ IP whitelist
- ทุก login/logout/failed login ต้องบันทึก audit log

### Acceptance Criteria

- Admin ที่ไม่มีสิทธิ์เข้าถึง module ต้องไม่เห็นหรือเข้าหน้านั้นได้
- Reset password ของ BO แยกจาก FO
- ทุก action ที่เปลี่ยนข้อมูลต้องตรวจ Admin Permission ก่อนเสมอ

---

## 4.2 Dashboard

### Requirements

Dashboard ต้องแสดง:

- จำนวนผู้ใช้ใหม่ วันนี้ / สัปดาห์นี้ / เดือนนี้
- Active Users Today
- จำนวน asset ใหม่ แยกตามสถานะ
- Offer made / accepted / rejected
- Pending reports
- Watch alerts ที่ active
- บทความล่าสุด
- Top searched brands
- Activity feed ล่าสุด

### Acceptance Criteria

- Admin เห็นภาพรวมระบบภายในหน้าเดียว
- Metrics แสดง snapshot ล่าสุดพร้อม `Last updated`; Dashboard ไม่ต้องมี Date Range control ใน prototype ปัจจุบัน
- ข้อมูลบน Dashboard ต้องเชื่อมกับ report module ได้

---

## 4.3 User Management

### Requirements

Admin ต้องสามารถ:

- ดูรายชื่อผู้ใช้ทั้งหมด
- Search/filter ตาม status, auth method, date joined
- ดู user profile
- ดู login history
- ดู auth method: Email, Apple, Google
- Suspend / Ban / Unsuspend / Unban
- Soft delete user โดย Admin
- Reset password เฉพาะบัญชี Email/Password
- Export CSV

### Business Rules

- บัญชี Apple/Google reset password จาก BO ไม่ได้
- Suspended user login FO ไม่ได้
- Banned user ต้องถูก block ถาวรจนกว่า Admin จะปลด
- Delete user เป็น soft delete และต้องเก็บ audit
- User reports 1-2 ครั้งต้องเข้าคิว review ก่อน ไม่ควรเปลี่ยนสถานะบัญชีอัตโนมัติ
- User reports ตั้งแต่ 3 ครั้งขึ้นไปภายในช่วงเวลาสั้น หรือมีหลาย reporter ต้องถูกยกระดับเป็น high-risk review
- User reports ตั้งแต่ 5 ครั้งขึ้นไป หรือมี evidence เสี่ยงสูง เช่น scam, impersonation, spam offer, duplicate fraud pattern สามารถเข้าสู่ `Suspended` ชั่วคราวตาม policy เพื่อรอ Admin review
- `Banned` ต้องเกิดหลัง Admin review แล้วพบว่าผิดจริงหรือมีความเสี่ยงสูง พร้อม reason และ audit
- Account deletion ต้องมี lifecycle อย่างน้อย `Deletion Requested` -> `Deactivated` -> `Deleted/Archived` -> `Anonymized`
- Deleted user ต้องไม่แสดงใน default User List แต่ต้องดูย้อนหลังได้ใน Account Deletion / Reports / Audit ตาม permission และต้อง mask/anonymize personal data ตาม retention policy
- Restore หลัง deletion ทำได้เฉพาะก่อน anonymization และควรจำกัดใน grace period เช่น 30 วัน พร้อม reason และ audit

---

## 4.4 Asset Management

### Requirements

Admin ต้องสามารถ:

- ดู asset ทุกสถานะ: Sale, Show, Hide, Sold
- Search/filter ตาม status, brand, owner, price, flagged
- ดู asset detail ครบทุก field
- ดู visibility บน FO ตาม status
- ดู user reports
- Flag / Unflag asset
- Remove asset แบบ soft delete
- Force Hide / Restore Visibility สำหรับ moderation เท่านั้น
- ดู Provenance, Proof of Payment, Consignment และ Sale History ตามสิทธิ์
- ไม่แก้ข้อมูลประกาศของ user-owned asset โดยตรง และไม่เปลี่ยน `Sold` จาก BO quick action

### Asset Status Rules

| Status | FO Visibility |
|---|---|
| Sale | เห็นใน Feed / Marketplace / Owner Profile / Viewer Profile |
| Show | เห็นใน Owner Profile และ Viewer Profile แต่ไม่ขาย |
| Hide | เห็นเฉพาะเจ้าของ และหมายถึง owner ตั้งซ่อนเอง ไม่ใช่ report/moderation hidden |
| Sold | เห็นเฉพาะเจ้าของใน Sold tab และแก้ไขไม่ได้ |

### Acceptance Criteria

- กด View asset ต้องเห็นข้อมูลที่ใช้ตรวจสอบได้ครบ
- Force Hide / Restore Visibility ต้องเปลี่ยนผลการแสดงบน FO ทันที พร้อม reason และ audit
- Report threshold สำหรับ asset: 1 report เข้า queue, 3 unique reports ยกระดับ priority review, 5 unique reports ซ่อนโพสต์ชั่วคราวอัตโนมัติเพื่อรอ Admin review โดยคง `Asset Status` เดิมและใช้ `Moderation State = Auto Hidden`
- Temporary report hiding ใช้ได้เฉพาะ `Sale` และ `Show` เพราะเป็น asset ที่คนอื่นเห็นและ report ได้; `Hide` และ `Sold` ไม่เข้า flow นี้
- ถ้า owner เปลี่ยน asset จาก `Sale`/`Show` เป็น `Hide` หรือ `Sold` ระหว่างที่ report ยังรอ review ระบบต้องเก็บ report ไว้ แต่ห้าม auto-hide หรือ Force Hide เพิ่ม เพราะโพสต์ไม่อยู่ public visibility แล้ว
- High-risk report reason ยังไม่ auto-hide ใน V1 หากไม่มี automated detector/verified signal; ต้องเข้า priority review และให้ Admin กด Force Hide หลังตรวจ evidence
- Sensitive fields ต้องเห็นเฉพาะ Admin
- ทุก action ต้องบันทึก before/after ใน audit log

---

## 4.5 Offer & Chat Management

### Requirements

Admin ต้องสามารถ:

- ดูรายการ offer ทั้งหมด
- Filter ตาม status: Pending, Accepted, Rejected, Cancelled, Expired, Invalidated
- ดู offer detail
- ดู chat room ที่เกี่ยวข้องกับ offer
- ดู notification delivery ของ offer
- Force expire offer เฉพาะ Admin
- ดู reported chat
- Remove/hide chat message ที่ผิด policy

### Business Rules

- Pending offer ใช้เป็นเงื่อนไข block account deletion
- Offer ที่ asset ถูก sold/remove ต้อง invalidated
- Admin ไม่ควรแก้ไขข้อความผู้ใช้โดยตรง
- Chat deletion ใน FO เป็น user-level deletion ไม่ใช่ hard delete จากระบบ

---

## 4.6 Social Interaction Management

### Requirements

รองรับการจัดการ:

- Comments
- Replies
- Like comment
- Asset likes / favorites
- Follow / unfollow
- Reported social content

Admin ต้องสามารถ:

- ดู comment ทั้งหมด
- Hide / Unhide / Soft delete comment
- ดู report reason
- ดู aggregate likes/favorites/follows

### Acceptance Criteria

- Hidden comment ต้องหายจาก FO ทันที
- Reported comment ต้องปรากฏใน moderation queue
- Like/Favorite/Follow ต้องดูเป็น analytics ได้

---

## 4.7 Content / Board Management

### Requirements

Admin ต้องสามารถ:

- สร้าง/แก้ไขบทความ Board
- ใส่ Title, Slug, Excerpt, Cover Image, Alt Text, Body Content
- ใส่ Category, Tags, Author, Read Time, Quote Highlight
- ตั้ง Related Articles
- ตั้ง SEO Title / SEO Description
- Save Draft / Publish Now / Schedule Publish / Archive
- Preview as FO
- จัดการ Categories
- Board Main automatic placement uses Published Articles only; no Featured toggle/order is required in Phase 1
- Board Banners are future scope for campaign/promotion/event/sponsor/external link or non-article deep link only
- ดู Board Analytics

### FO Display Rules

- FO Board แสดงเฉพาะ article ที่ `Status = Published`
- Scheduled article แสดงเมื่อ `Publish Date-Time <= current time`
- Archived article ต้องหายจาก Board/Search/Category
- Main Hero ดึง eligible Published Article ล่าสุดลำดับแรก โดยเรียง `Publish Date-Time DESC`, `Updated At DESC`, `Article ID DESC`
- Trending Now ดึงจาก eligible Published Articles ที่ไม่ซ้ำกับ Main Hero; ถ้ามี trending score ให้ใช้ score ก่อน ถ้าไม่มีให้ใช้บทความล่าสุดลำดับถัดไป
- Journal Board preview บน Board Main ดึงจาก eligible Published Articles ที่ไม่ซ้ำกับ Main Hero และ Trending Now
- Journal Board View All แสดง eligible Published Articles ทั้งหมดตามลำดับล่าสุด และสามารถมีบทความเดียวกับ Main Hero/Trending Now ได้
- Preview as FO ไม่เพิ่ม view count และเข้าได้เฉพาะ Admin

### Acceptance Criteria

- Admin สร้างบทความพร้อมรูปและเนื้อหาได้จาก BO
- บทความ published ต้องปรากฏใน FO Board
- บทความ archived ต้องหายจาก FO
- Featured article ต้องแสดงในพื้นที่ Board hero ตามลำดับ

---

## 4.8 Market Data Management

### Requirements

Admin ต้องสามารถ:

- เพิ่ม/แก้ไข/ปิดใช้งาน Watch Brand
- เพิ่ม/แก้ไข/ปิดใช้งาน Watch Model
- จัดการ Reference Numbers
- จัดการ Price Index ตาม Brand/Model/Reference
- ระบุ price min/max, source URL, updated date
- ดู historical price

### FO Impact

- Brand/Model ใช้ใน Add Asset autocomplete และ Search Filter
- Price Index ใช้ในเมนู Watch Price Index และ Asset Value Dashboard

---

## 4.9 Watch Alert Management

### Requirements

Admin ต้องสามารถ:

- ดู Watch Alert ราย user
- ดู criteria: brand, model, reference, price range, condition
- ดู notification on/off
- ดู trigger history
- Disable alert ที่ผิด policy
- ดู Watch Alert analytics

### Business Rules

- Alert ที่ notification off ยังเก็บไว้แต่ไม่ส่ง push
- Alert disabled โดย Admin ต้องไม่ trigger
- Brand/model inactive ต้องไม่ trigger alert ใหม่

---

## 4.10 Directory Management

### Requirements

Admin ต้องสามารถจัดการ directory ที่แสดงใน FO:

- Watch Shops
- Accessories Shops
- Repair Shops
- Auction Centers
- Consignment Centers
- Authentication Centers
- Community

Fields ที่ต้องรองรับ:

- Name TH/EN
- Category
- Address / Province
- Phone / Line ID
- Website / Facebook / Instagram
- Logo / Cover Photos
- Description
- Opening Hours
- Map Location
- Tags
- Status

---

## 4.11 Help & Support

### Requirements

Admin ต้องสามารถ:

- ดู ticket จาก FO Help
- Filter ตาม status, type, priority
- Assign ticket
- ตอบกลับผู้ใช้
- เปลี่ยนสถานะ Open / In Progress / Waiting User / Resolved / Closed
- เชื่อม ticket กับ user, asset, offer หรือ chat

### Acceptance Criteria

- Ticket ต้องมี owner และ status ชัดเจน
- การตอบกลับต้องบันทึก history
- การ resolve ต้องมี timestamp และ admin ผู้ดำเนินการ

---

## 4.12 Notifications

### Requirements

BO ต้องรองรับ 2 ประเภท:

1. Broadcast Notification
2. System Notification Trigger

Broadcast ต้องรองรับ:

- Title
- Body
- Image
- Deep Link
- Target Audience
- Send Now / Schedule
- Delivery Stats

System Trigger ต้องรองรับ:

- New Offer
- Offer Accepted
- Offer Rejected
- Comment
- New Follower
- Market Update
- Sale Success
- Watch Alert

---

## 4.13 Reports & Analytics

Reports ที่ต้องมี:

- User Report
- Asset Report
- Offer Report
- Chat Report
- Content / Board Report
- Social Report
- Search Report
- Watch Alert Report
- Support Report
- Notification Report
- Account Deletion Report

ทุก report ต้องรองรับ:

- Date range
- CSV export
- Excel export
- policy-based visibility

---

## 4.14 Audit Log

### Requirements

ทุก action สำคัญของ Admin ต้องบันทึก:

- Admin ID
- Admin Access
- Action Type
- Target Entity Type
- Target Entity ID
- Before Value
- After Value
- IP Address
- Timestamp

### Entity Types

- User
- Asset
- Offer
- ChatRoom
- ChatMessage
- Comment
- Article
- Category
- Banner
- Brand
- Model
- PriceIndex
- WatchAlert
- Directory
- SupportTicket
- Notification
- AdminAccount

---

## 5. Non-Functional Requirements

### 5.1 Performance

- Dashboard load ภายใน 3 วินาที
- Table รองรับ pagination, search, filter
- Export ข้อมูลขนาดใหญ่ต้องใช้ background job

### 5.2 Security

- HTTPS ทุก endpoint
- JWT + Refresh Token
- 2FA สำหรับ admin access สำคัญ
- policy-based access control
- Sensitive data masking
- Audit log retention อย่างน้อย 1 ปี

### 5.3 Usability

- Responsive web app รองรับ desktop, tablet และ mobile-width browser โดย optimize workflow หลักสำหรับหน้าจอใหญ่
- UI ภาษาไทยเป็นหลัก
- Label และ action ต้องชัดเจนสำหรับทีมปฏิบัติการ
- ทุก destructive action ต้องมี confirmation

### 5.4 Localization

- BO ใช้ภาษาไทยเป็นหลัก
- ข้อมูลราคาแสดงเป็น THB
- วันที่/เวลาใช้ timezone Asia/Bangkok

---

## 6. Success Metrics

| Metric | Target |
|---|---|
| Pending report response time | < 24 ชั่วโมง |
| Support ticket first response | < 8 ชั่วโมง |
| Article publish success | 100% แสดงบน FO ตาม schedule |
| Asset moderation audit completeness | 100% มี audit log |
| Notification delivery tracking | > 95% มี delivery status |
| Admin Access violation | 0 case |

---

## 7. Phase Plan

### Phase 1

- Auth / Admin Permission
- Dashboard
- User Management
- Asset Management
- Content / Board Management
- Market Data
- Directory
- Audit Log

### Phase 2

- Offer & Chat Management
- Social Moderation
- Watch Alert Management
- Support Ticket
- Notifications
- Expanded Reports

### Phase 3

- Advanced moderation workflow
- SLA dashboard
- External integrations
- Automated compliance tools

---

## 8. Open Questions

1. ต้องการให้ BO มีภาษาอังกฤษเป็น option หรือใช้ไทยอย่างเดียว
2. Retention policy ของ chat และ offer ต้องเก็บกี่ปี
3. Account deletion ต้อง anonymize ทันทีหรือหลัง retention period
4. Board article ต้องมี SEO public web หรือใช้เฉพาะใน mobile app
5. Admin สามารถ remove asset ได้ทันทีหรือควรต้อง approval จาก Admin
