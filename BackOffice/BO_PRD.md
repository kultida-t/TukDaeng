# PRD - Tuk Daeng Back Office System

**Version:** 1.0  
**Product:** Tuk Daeng Back Office (BO)  
**Audience:** Admin  
**Related Documents:** BO_Spec v1.2, BO_Spec_Completion_Addendum v1.3, FO PRD v1.0, Use Cases v1.0

---

## 1. Product Overview

### 1.1 Objective

ระบบ Back Office ของตึกแดงเป็นเว็บแอปสำหรับทีมภายใน ใช้จัดการข้อมูลและควบคุมการทำงานของแพลตฟอร์มฝั่ง Front Office (FO) ได้แก่ ผู้ใช้ สินทรัพย์ ข้อเสนอ แชท บทความ กระดานข่าว ข้อมูลตลาด ไดเรกทอรี การแจ้งเตือน รายงาน และ audit log

BO ต้องช่วยให้ทีม Admin สามารถ:

- ตรวจสอบและจัดการข้อมูลที่ผู้ใช้สร้างจาก FO
- Moderate สินทรัพย์ คอมเมนต์ แชท และข้อเสนอที่ผิด policy
- จัดการบทความและเนื้อหาที่แสดงในเมนู Board ของ FO
- จัดการ master data เช่น Watch Brand, Model และ Price Index; Directory เป็น future/postponed scope ไม่รวม Phase 1
- จัดการเนื้อหา policy (Terms of Use, Privacy Policy) และช่องทางติดต่อ Support Center
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
| Support Efficiency | ให้ Admin จัดการเนื้อหา policy และข้อมูล Support Center ที่ FO แสดงได้ |
| Market Data Quality | ให้ทีม Market จัดการ Brand, Model และ Price Index; Directory เป็น future/postponed scope |
| Traceability | ทุก action สำคัญต้องมี audit log และตรวจสอบย้อนหลังได้ |

---

## 2. Users & Admin Access

### 2.1 BO Users

BO has exactly one admin account type: `Admin`. There are no BO sub-types for content, support, market, moderation, or highest-privilege responsibilities. Access is controlled by module/action policy, sensitive-data policy, export policy, confirmation, reason, and audit requirements.

| Admin Account Type | Primary Responsibility |
|---|---|
| Admin | Manage all BO operational areas allowed by product scope and policy: users, assets, content, market data, offers, chat, asset reported comments, watch alerts, support, account deletion, notifications, audit, and settings. Directory is future/postponed from Phase 1. Reports & Analytics is deferred to Phase 2/future scope. |

### 2.2 FO Users

FO users have a single account type: `User`. BO must support activity from the same user account across selling, buying, offers, public collection, and private collection states.
## 3. Scope

### 3.1 In Scope

- BO Authentication และ Admin Access Permission
- Dashboard
- User Management
- Asset Management
- Offer Management (read-only ใน V1)
- Content / Board Management
- Market Data Management
- Option Master Management
- Market Demand (Watch Alert)
- Directory Management (future/postponed; not Phase 1)
- Help & Support (Policy & Versioning + Support Center)
- Notifications
- Reports & Analytics (Phase 2 / future scope)
- Audit Log
- Admin Settings

### 3.2 Out of Scope for Phase 1

Directory Management is out of scope for Phase 1. FO directory menu entries are placeholder-only until detail routes and taxonomy are approved, so BO must not expose Directory navigation, CRUD, publication controls, map/contact fields, or FO sync in Phase 1.

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
- Admin must pass mandatory Email OTP verification after email/password
- BO V1 does not use an external verification app for Admin login
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
- `New Users` และ `Active Users Today` ต้องนับเฉพาะ registered account/member activity ไม่รวม Guest public view/share traffic
- Dashboard ไม่ต้องแสดง guest/public analytics ใน prototype; metric ชุดนี้อยู่ใน Reports & Analytics เท่านั้น (Reports & Analytics เป็น Phase 2/future scope — ถ้ายังไม่ทำ Reports ก็ไม่ต้องแสดง metric ชุดนี้ใน Phase 1)

---

## 4.3 User Management

### Requirements

Admin ต้องสามารถ:

- ดูรายชื่อผู้ใช้ทั้งหมด
- Search/filter ตาม status และ auth method พร้อม sort ตาม last active, date joined, report count และ asset count ตาม Prototype
- ดู user profile
- ดู login history
- ดู auth method: Email, Apple, Google
- Suspend / Ban / Unsuspend / Unban
- Route งาน deletion ไป Account Deletion workflow; User List ไม่ archive/delete โดยตรง
- Reset password เฉพาะบัญชี Email/Password
- ไม่มีปุ่ม Export CSV โดยตรงใน User List; export user data ต้องผ่าน system-level export ตาม permission (ก่อนหน้านี้ระบุให้ผ่าน Reports/export แต่ Reports ถูกเลื่อนเป็น Phase 2/future scope แล้ว ใน Phase 1 จึงไม่มี export path สำหรับ user data)
- ไม่ต้องแสดง Guest/Unauthenticated visitor ใน User List, User Detail, status filter หรือ account action flow

### Business Rules

- `Guest / Unauthenticated` เป็น FO access state ไม่ใช่ BO user status และไม่สร้าง account record ใน User Management
- ถ้าผู้ใช้สมัคร Email/Password แล้วระบบสร้าง record เพื่อรอ OTP ให้แสดงเป็น `Pending Verification`; กรณีนี้ไม่ใช่ Guest แต่ยังไม่ถือเป็น authenticated member
- บัญชี Apple/Google reset password จาก BO ไม่ได้
- Suspended user ต้องถูก revoke/block active session และ login FO ไม่ได้จนกว่า restore
- Banned user ต้องถูก revoke/block active session และถูก block ถาวรจนกว่า Admin จะปลด
- V1 ไม่มี `Restricted` หรือ feature-level restriction เป็น account status; ถ้าต้องจำกัดบัญชีให้ใช้ `Suspended` หรือ `Banned` ตาม policy
- Suspend/ban ต้องส่ง email เป็น primary user notification channel และ trace delivery/audit ได้
- Delete/archive user ต้องจัดการผ่าน Account Deletion workflow และต้องเก็บ audit
- User reports 1-2 ครั้งต้องเข้าคิว review ก่อน ไม่ควรเปลี่ยนสถานะบัญชีอัตโนมัติ
- User reports ตั้งแต่ 3 ครั้งขึ้นไปภายในช่วงเวลาสั้น หรือมีหลาย reporter ต้องถูกยกระดับเป็น high-risk review เท่านั้น ไม่ suspend อัตโนมัติจากจำนวน report เพียงอย่างเดียว
- User reports ตั้งแต่ 5 ครั้งขึ้นไป หรือมี evidence เสี่ยงสูง เช่น scam, impersonation, spam offer, duplicate fraud pattern สามารถเข้าสู่ `Suspended` ชั่วคราวตาม policy เพื่อรอ Admin review
- `Banned` ต้องเกิดหลัง Admin review แล้วพบว่าผิดจริงหรือมีความเสี่ยงสูง พร้อม reason และ audit
- Account deletion ต้องมี lifecycle รวมขั้นเดียว `Deletion Requested` -> `Deactivated` -> ครบ grace period 30 วัน ระบบลบบัญชีอัตโนมัติ = เก็บถาวร + ลบตัวตน ในขั้นเดียว (`Anonymized`) หรือ `คืนบัญชีแล้ว` ถ้าแอดมินคืนในช่วง grace period (ตาม `13_ACCOUNT_DELETION_MODULE.md` DEL-DEC-006)
- Prototype ปัจจุบันแสดง `Deletion Requested` (รอลบบัญชี) และ `Deleted` (ลบแล้ว) ใน User List/filter เพื่อ review historical summary ตาม permission; production ต้อง mask/anonymize personal data, จำกัด action และยังต้องดูย้อนหลังได้ใน Account Deletion / Audit ตาม retention policy (ก่อนหน้านี้ระบุให้ดูใน Account Deletion / Reports / Audit แต่ Reports ถูกเลื่อนเป็น Phase 2/future scope แล้ว ใน Phase 1 จึงดูย้อนหลังได้ใน Account Deletion / Audit เท่านั้น)
- Restore หลัง deletion ทำได้เฉพาะใน grace period 30 วัน โดยแอดมิน พร้อม reason และ audit; หลังระบบลบบัญชีอัตโนมัติแล้ว restore ไม่ได้

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

## 4.5 Offer Management

### Requirements

Admin ต้องสามารถ:

- ดูรายการ offer ทั้งหมด
- Filter ตาม status: Pending, Accepted, Rejected, Cancelled, Expired, Invalidated
- ดู offer detail

Offer Management V1 เป็น read-only ไม่มี accept/decline/cancel/force-expire/invalidate/remove-chat-message action ถ้าเพิ่มภายหลังต้องมี Product approval, permission check, confirmation/reason เมื่อกระทบ FO/user และ audit log

Future scope (ยังไม่ render ใน prototype V1): chat room context ที่เกี่ยวข้องกับ offer, notification delivery ของ offer, force expire offer, remove/hide chat message

### Business Rules

- Pending offer ใช้เป็นเงื่อนไข block account deletion
- Offer ที่ asset ถูก sold/remove ต้อง invalidated
- Admin ไม่ควรแก้ไขข้อความผู้ใช้โดยตรง
- Chat deletion ใน FO เป็น user-level deletion ไม่ใช่ hard delete จากระบบ

---

## 4.6 Content / Board Management

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
- Main Hero ต้องเลือกจาก eligible Published Article ล่าสุดอัตโนมัติ ไม่ใช้ Featured toggle ใน Phase 1

---

## 4.7 Market Data

### Requirements

Admin ต้องสามารถ:

- ดู Watch Brand, Model, Reference, Detail และ Price Index ที่ดึงจาก API/backend sync
- ค้นหา กรอง และ drill-down ข้อมูล market catalog
- ดู source metadata, provider updated date, synced date และ data quality status
- ดู historical price จาก provider/backend cache
- ดู provider sync log, warning, failure และ rate/usage status
- เรียก manual API sync ได้เฉพาะ operations permission และต้อง audit

Phase 1 ไม่ให้ Admin เพิ่ม แก้ไข ลบ ปิดใช้งาน import หรือ override market data เองจาก BO เพราะข้อมูลเป็น master/reference data ที่ควรมาจาก API source เดียวก่อน

### FO Impact

- Brand/Model ใช้ใน Add Asset autocomplete และ Search Filter
- Price Index ใช้ในเมนู Watch Price Index และ Asset Value Dashboard

---

## 4.8 Market Demand (Watch Alert)

### Requirements

Admin ต้องสามารถ:

- ดู Demand Overview: KPI tiles (Active Alerts, Alerts with Matches, Unmet Demand, Notification Success Rate), Top Brands (drill-down ไป Model/Reference), Price Range histogram, Trigger Trend 12 เดือน, Frequently Triggered Alerts
- ดู Search Insights: Popular Keywords, Popular Filters by Dimension, Popular Filter Combinations, No-result Searches, Search/Filter Trend, Search Funnel
- ดู Watch Alert List: filter (Status/Notification/Trigger history/Match status/Last Triggered date range), sort, pagination, row click → Alert Detail
- ดู Watch Alert Detail: Alert Summary, Owner Summary, Criteria (structured chips), Matched Assets, Trigger & Notification History, User Action History
- ดู criteria: brand, model, reference, price range, condition, case size, dial color
- ดู notification on/off
- ดู trigger history
- ดู Watch Alert analytics

### Business Rules

- Market Demand BO เป็น read-only ทั้ง List และ Detail — Admin ไม่ disable/enable/export/bulk alert ของ user ใด ๆ
- Alert ที่ notification off ยังเก็บไว้แต่ไม่ส่ง push
- Brand/model inactive ต้องไม่ trigger alert ใหม่
- Watch Alert matching เฉพาะ asset status `Sale`
- Notification destination ต้องเป็น `Watch Alert Result List` ห้ามเปิด Asset Detail โดยตรง
- Search Insights เป็น aggregate only ไม่มี user-identifying data

---

## 4.9 Directory Management

**Phase 1 status:** Postponed / future scope only. Keep this section as reference for a later Directory phase; do not implement or expose it in the Phase 1 BO prototype/build.

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

## 4.10 Help & Support

### Requirements

Admin ต้องสามารถ:

- จัดการเนื้อหา Terms of Use และ Privacy Policy แบบ versioned (Draft/Published/Archived) 2 ภาษา
- สร้าง Draft, preview, publish และ restore เวอร์ชันเก่าได้
- จัดการช่องทางติดต่อ Support Center (LINE, Phone, Email, Facebook, Website), เวลาทำการ และความพร้อมให้บริการ 2 ภาษา
- Preview Support Center ก่อนบันทึก

### Acceptance Criteria

- Policy ต้องมีได้ไม่เกิน 1 Published และ 1 Draft ต่อ policy type
- การ publish ต้อง archive เวอร์ชัน Published เดิมอัตโนมัติ
- Support Center ต้อง validate ค่า channel ที่ Active และ format ตาม channel type
- ทุก action สำคัญต้องบันทึก audit log

### Out Of Scope (Phase 1)

Ticket queue, assignment, SLA, reply history, internal notes และ manual ticket creation จาก LINE/Phone/Email ไม่อยู่ใน Phase 1 — รายละเอียดเต็มอยู่ใน `12_HELP_SUPPORT_MODULE.md`

---

## 4.11 Notifications

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

## 4.12 Reports & Analytics (Phase 2 / Future scope)

> **สถานะ:** เลื่อนเป็น Phase 2/future scope — prototype ตัดเมนู Reports ออกชั่วคราวเพราะเป็นระบบตั้งต้นที่ยังไม่จำเป็น ซ้ำซ้อนกับ list/filter ในแต่ละ module + Dashboard; อาจกลับมาเพิ่มในอนาคตถ้ามี requirement จริง เช่น ต้องส่งรายงานให้ Management/auditor
> รายละเอียด spec เดิมเก็บไว้ใน `15_REPORTS_ANALYTICS_MODULE.md` เพื่ออ้างอิงเมื่อกลับมาทำ

Reports ที่ต้องมี (เมื่อกลับมาทำใน Phase 2):

- User Report
- Asset Report
- Offer Report
- Chat Report
- Content / Board Report
- Asset Reported Comments Report
- Search Report
- Watch Alert Report
- Notification Report
- Account Deletion Report

ทุก report ต้องรองรับ:

- Date range
- CSV export
- Excel export
- policy-based visibility
- User Report ต้องแยก Guest public view/share analytics ออกจาก registered-user metrics เช่น new users, DAU/MAU, auth method และ account status
- User Report ต้องรองรับ metric ชุด guest/public analytics เมื่อ tracking เปิดใช้ ได้แก่ Guest Visitors, Public Asset Views, Public Article Views, Public Profile Views, Public Shares และ Guest-to-Signup Conversion

---

## 4.13 Audit Log

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
- Policy
- PolicyVersion
- SupportCenter
- Notification
- AdminAccount
- SpecOption
- SpecOptionGroup

---

## 5. Non-Functional Requirements

### 5.1 Performance

- Dashboard load ภายใน 3 วินาที
- Table รองรับ pagination, search, filter
- Export ข้อมูลขนาดใหญ่ต้องใช้ background job

### 5.2 Security

- HTTPS ทุก endpoint
- JWT + Refresh Token
- Email OTP verification สำหรับ BO Admin login
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
- Offer Management (read-only ใน V1)
- Content / Board Management
- Market Data
- Option Master
- Market Demand (Watch Alert)
- Help & Support (Policy & Versioning + Support Center)
- Account Deletion Requests
- Notifications
- Reports & Analytics (Phase 2 / future scope)
- Audit Log
- Admin Settings

### Phase 2

- Directory (รอ FO directory detail routes และ taxonomy approval)
- Chat moderation workflow (remove/hide chat message, reported chat queue)
- Offer write actions (force expire, invalidate, accept/decline จาก BO)
- Help & Support ticket queue, assignment, SLA, reply/internal note (ย้ายจาก Phase 1 ไป Phase 2 — รายละเอียดอยู่ใน `12_HELP_SUPPORT_MODULE.md` section 3 Out Of Scope)

### Phase 3

- Advanced moderation workflow
- SLA dashboard
- External integrations
- Automated compliance tools
- External CRM integration
- Full workflow automation สำหรับ legal/compliance

---

## 8. Open Questions

1. ต้องการให้ BO มีภาษาอังกฤษเป็น option หรือใช้ไทยอย่างเดียว
2. Retention policy ของ chat และ offer ต้องเก็บกี่ปี
3. Account deletion ต้อง anonymize ทันทีหรือหลัง retention period
4. Board article ต้องมี SEO public web หรือใช้เฉพาะใน mobile app
5. Admin สามารถ remove asset ได้ทันทีหรือควรต้อง approval จาก Admin
