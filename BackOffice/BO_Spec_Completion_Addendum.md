# BO Specification Addendum - Tuk Daeng Back Office Coverage for FO

**Version:** 1.4 Addendum  
**Purpose:** เติมรายละเอียด Back Office ให้รองรับ Front Office flows จาก PRD และ Use Cases ครบถ้วนขึ้น  
**Reference:** BO_Spec v1.2, PRD v1.0, Use_Cases v1.0

---

## 1. Summary

BO_Spec v1.2 รองรับ flow หลักของ FO แล้วในส่วน User, Asset, Content, Market Data, Reports, Push Notification, Help & Support, Account Deletion และ Audit Log; Directory ถูกเลื่อนเป็น future/postponed scope เพราะ FO directory menu ยังเป็น placeholder แต่ยังขาดรายละเอียดสำหรับ flow ที่เกิดจากการใช้งานจริงของผู้ใช้ใน FO ได้แก่ Offer/Chat, Comment, Like/Favorite, Follow, Watch Alert ราย user และ System Notification Trigger

Addendum นี้เสนอให้เพิ่ม module และ business rules ต่อไปนี้:

1. Offer Management (read-only ใน V1)
2. Market Demand (Watch Alert)
3. Account Deletion & Data Archive
4. Help & Support (Policy & Versioning + Support Center)
5. System Notification Trigger Management
6. Content / Board Management Completion
7. Asset Detail Field Completion
8. Expanded Reports & Analytics
9. Expanded BO/FO Action Mapping
10. Additional Audit Log Events

---

## 2. Updated Back Office Menu

```text
BO Dashboard
├── Dashboard
├── User Management
├── Asset Management
├── Offer Management (read-only ใน V1; หน้าเดียว ไม่มี submenu)
├── Content Management
│   ├── Articles
│   ├── Categories
│   └── Reported Articles
├── Market Data
│   ├── Dashboard
│   ├── Brands & Models
│   └── Sync History
├── Option Master
├── Directory (future/postponed; not Phase 1)
├── Market Demand
│   ├── Demand Overview
│   ├── Search Insights
│   └── Watch Alert List
├── Help & Support
│   ├── Policy & Versioning
│   └── Support Center
├── Account Deletion
│   ├── Requests
│   ├── Grace Period
│   └── Anonymization
├── Reports
│   ├── User
│   ├── Asset
│   ├── Offer
│   ├── Search
│   └── Export Jobs
├── Notifications
│   ├── Broadcast
│   ├── System Templates
│   └── Delivery Logs
└── Settings
    ├── Admin Accounts
    ├── Roles & Permissions
    ├── Security
    ├── Retention
    ├── Policy & Versioning
    ├── Support Center
    └── Audit Log
```

Admin Settings updated submenu baseline includes `Admin Accounts`, `Roles & Permissions`, `Security`, `Retention`, `Policy & Versioning`, `Support Center`, and Audit Log handoff. `Roles & Permissions` manages role templates and module/action policy for the single BO account type `Admin`; it does not introduce separate BO admin account types.

---

## 3. Offer Management (read-only ใน V1)

### 3.1 Purpose

ใช้สำหรับตรวจสอบและดูแล flow ซื้อขายจาก FO ได้แก่ Make Offer, Accept Offer, Decline Offer, Incoming Offers, Chat Message, File/Image in Chat และ Delete Chat

### 3.2 Offer Status

| Status | Description | FO Impact |
|---|---|---|
| Pending | ผู้ซื้อส่ง offer แล้ว รอเจ้าของตอบ | แสดงใน Chat และ Incoming Offers |
| Accepted | เจ้าของรับ offer | แจ้งเตือนผู้ซื้อ, แสดง Offer Accepted |
| Rejected | เจ้าของปฏิเสธ offer | แจ้งเตือนผู้ซื้อ, ย้ายออกจาก Incoming Offers |
| Cancelled | ผู้เสนอราคายกเลิกก่อนเจ้าของตอบ | ไม่แสดงเป็น pending |
| Expired | offer หมดอายุอัตโนมัติ | ไม่สามารถ accept/decline ได้ |
| Invalidated | asset ถูกลบ/ซ่อน/sold ทำให้ offer ใช้ไม่ได้ | แสดงสถานะ unavailable |

### 3.3 Offer List

**Features**
- ดูรายการ offer ทั้งหมด
- Search ด้วย Offer ID, Asset ID, Buyer, Owner
- Filter ด้วย Status, Brand, Price Range, Date Range
- ดู offer ที่ยัง Pending เพื่อใช้ตรวจเงื่อนไข Delete Account
- Export CSV / Excel

**Columns**

| Column | Description |
|---|---|
| Offer ID | รหัส offer |
| Asset ID | รหัสสินทรัพย์ |
| Asset Name | Brand + Model + Reference No. |
| Buyer | ผู้เสนอราคา |
| Owner | เจ้าของสินทรัพย์ |
| Offer Price | ราคาที่เสนอ |
| Asset Asking Price | ราคาประกาศขาย หรือ Price on Request |
| Status | Pending / Accepted / Rejected / Cancelled / Expired / Invalidated |
| Created At | วันที่ส่ง offer |
| Updated At | วันที่เปลี่ยนสถานะล่าสุด |

### 3.4 Offer Detail

**Data**
- Current prototype baseline: Offered Asset summary
- Current prototype baseline: Buyer/Owner summary เฉพาะ User ID และ display name
- Current prototype baseline: Offer History ของ asset เดียวกัน
- Not rendered in current prototype: Chat room context, full Buyer/Owner profile signals, Status timeline, Notification delivery status และ Audit events

**Admin Actions**

| Action | Permission | Rule |
|---|---|---|
| View Offer | Admin | Read-only detail view ตาม prototype ปัจจุบัน |
| Open Asset Detail | Admin | Prototype ให้คลิกลิงก์ `Asset ID` ใน Offered Asset section เพื่อ drill-in ตาม permission |

Current prototype Offer Detail ไม่มี Force Expire Offer, Mark Invalidated, Export Offer History, related chat action หรือ notification delivery action. ถ้าเพิ่มภายหลังต้องมี Product approval, permission check, confirmation/reason เมื่อกระทบ FO/user และ audit log.

### 3.5 Chat Rooms

**Phase 1 status:** Chat Rooms submenu ไม่ได้แสดงใน prototype V1 Offer Management เป็น read-only หน้าเดียว ส่วน Chat Rooms list/columns/moderation ด้านล่างเป็น future scope สำหรับเมื่อ Product เปิดใช้งาน chat moderation workflow

**Features (future scope)**
- ดูรายการ chat rooms
- Search ด้วย user, asset, keyword
- Filter ด้วย asset, unread report, file attached, date range
- ดูเฉพาะ chat ที่ถูก report
- Export conversation เฉพาะ Admin

**Columns (future scope)**

| Column | Description |
|---|---|
| Chat Room ID | รหัสห้องแชท |
| Participants | Buyer / Owner |
| Related Asset | Asset ที่เกี่ยวข้อง |
| Last Message | ข้อความล่าสุดแบบ masked หากเป็นข้อมูลส่วนตัว |
| Has Offer | มี offer card หรือไม่ |
| Has Attachment | มีรูป/ไฟล์หรือไม่ |
| Reported | ถูก report หรือไม่ |
| Last Active | เวลาล่าสุด |

### 3.6 Chat Moderation Rules

**Phase 1 status:** Chat moderation workflow เป็น future scope ตามที่ prototype Offer Management เป็น read-only หน้าเดียว กฎด้านล่างเป็น baseline สำหรับเมื่อ Product เปิดใช้งาน chat moderation workflow

- Admin ไม่ควรแก้ไขข้อความผู้ใช้โดยตรง
- การลบ chat ของผู้ใช้ใน FO เป็น user-level deletion ไม่ใช่ hard delete จากระบบ
- Admin สามารถ export conversation เพื่อ audit/dispute ได้ (future scope)
- Admin สามารถ hide/remove ข้อความที่ผิด policy ได้ (future scope)
- ไฟล์แนบต้องมี virus/malware scan status
- Chat ที่เกี่ยวข้องกับ accepted offer ต้องถูกเก็บตาม retention policy

---

## 4. Market Demand (Watch Alert)

### 4.1 Purpose

BO_Spec v1.2 มี Watch Alert report แล้ว แต่ FO ต้องมีการ create, rename, delete, toggle notification และ trigger alert จาก search criteria จึงควรมี management view ราย alert พร้อม Demand Overview และ Search Insights ระดับระบบ

### 4.2 Features

- ดู Demand Overview: KPI tiles, Top Brands (drill-down), Price Range, Trigger Trend, Frequently Triggered Alerts
- ดู Search Insights: Popular Keywords/Filters/Combinations, No-result Searches, Search Funnel (aggregate only)
- ดู Watch Alert List ทั้งหมด (filter: Status, Notification, Trigger history, Match status, Last Triggered date range — ไม่มี search)
- ดู Watch Alert Detail: Alert Summary, Owner, Criteria, Matched Assets, Trigger & Notification History, User Action History
- ดู criteria ที่ผู้ใช้ save จาก Search
- ดู trigger history และ delivery status
- Market Demand BO เป็น read-only — Admin ไม่ disable/enable/export/bulk alert ของ user ใด ๆ

### 4.3 Fields

| Field | Type | Required |
|---|---|---|
| Alert ID | ID | Yes |
| User | FK User | Yes |
| Alert Name | Text | Yes |
| Brand | FK Brand | Optional |
| Model | FK Model | Optional |
| Reference No. | Text | Optional |
| Price Min | Number | Optional |
| Price Max | Number | Optional |
| Condition | Multi-select | Optional |
| Case Size | Multi-select | Optional |
| Dial Color | Multi-select | Optional |
| Notification Enabled | Boolean | Yes |
| Status | Active / User Disabled / Deleted (soft delete) | Yes |
| Match Count | Number | Yes |
| Trigger Count | Number | Yes |
| Last Triggered At | DateTime | Optional |
| Created At | DateTime | Yes |
| Updated At | DateTime | Yes |

### 4.4 Trigger Rules

- เมื่อมี asset ใหม่สถานะ Sale ที่ตรง criteria ให้สร้าง notification ประเภท Watch Alert
- Alert ที่ Notification Enabled = Off ยังถูกเก็บไว้ แต่ไม่ส่ง push
- Market Demand BO เป็น read-only — ไม่มี admin disable/enable alert ของ user (User Disabled เป็น action ของ user เท่านั้น)
- ถ้า brand/model ถูก inactive ใน Market Data ต้องไม่ trigger alert ใหม่จากข้อมูลนั้น
- Notification destination ต้องเป็น `Watch Alert Result List` ห้ามเปิด Asset Detail โดยตรง

---

## 5. Account Deletion & Data Archive

### 5.1 Purpose

รองรับ UC-SETTING-004: ผู้ใช้ลบบัญชีจาก FO — ระบบระงับบัญชี ซ่อน public surfaces ยกเลิก offer ที่ Pending และปิดรายงานอัตโนมัติ (ไม่มี block) แล้วคำขอเข้าคิวตรวจสอบใน BO (รายละเอียดเต็ม: `13_ACCOUNT_DELETION_MODULE.md`)

### 5.2 Request Status

| Status | Description |
|---|---|
| รอดำเนินการ | ผู้ใช้ confirm Delete Account สำเร็จ ระบบระงับ+ซ่อน+ยกเลิก offer+ปิดรายงานอัตโนมัติ และคำขอเข้าคิว BO |
| คืนบัญชีแล้ว | แอดมินกู้คืนบัญชีให้ผู้ใช้ในช่วง grace period 30 วัน ตาม policy (มีเหตุผล + audit) |
| ปฏิเสธคืนบัญชี | แอดมินปฏิเสธคำขอคืนบัญชี รอครบ 30 วันแล้วระบบลบบัญชีอัตโนมัติ (ไม่เริ่มนับใหม่) |
| ลบตัวตนแล้ว | ครบ grace period 30 วัน ระบบลบบัญชีอัตโนมัติ — เก็บถาวร + ลบตัวตน ในขั้นเดียว |

### 5.3 Validation Rules

- ยกเลิก offer ที่ยัง Pending (incoming/outgoing) อัตโนมัติ พร้อมบันทึก audit — ไม่มี block ที่ต้องรอ Admin ตรวจสอบ
- ปิดรายงานที่ยังเปิดอยู่อัตโนมัติตาม policy พร้อมบันทึก audit
- Asset ของผู้ใช้ถูกซ่อนจาก FO ทันทีเมื่อ delete request สำเร็จ (ไม่รอครบ 30 วัน)
- Accepted offer เก็บตาม retention policy และ mask personal fields ตาม policy
- Chat history เก็บตาม retention policy แต่ต้อง mask personal profile fields ตาม privacy policy
- Username/email/phone/line ถูกแทนที่ด้วย anonymous value เมื่อครบ grace period 30 วัน ระบบลบบัญชีอัตโนมัติ (เก็บถาวร + ลบตัวตน ในขั้นเดียว ตาม DEL-DEC-006)

### 5.4 Admin View

**Columns**

| Column | Description |
|---|---|
| Request ID | รหัสคำขอ |
| User | ผู้ขอลบบัญชี |
| Assets | จำนวน asset |
| Request Status | รอดำเนินการ / คืนบัญชีแล้ว / ปฏิเสธคืนบัญชี / ลบตัวตนแล้ว |
| Account Status | Active / Deactivated / Anonymized |
| Grace Period | Countdown ช่วงรอลบบัญชี (เหลือ X วัน / ครบแล้ว) |
| Requested At | วันที่ขอ |
| Processed By | Admin/System ที่ดำเนินการ |

**Actions**

| Action | Permission |
|---|---|
| View Request | Admin |
| Restore Account (คืนบัญชี) | Admin — เฉพาะช่วง grace period 30 วัน |
| Reject Restore (ปฏิเสธคืนบัญชี) | Admin — เฉพาะช่วง grace period 30 วัน |
| Export Archive Report | Admin — future scope (ไม่แสดงใน prototype Phase 1) |

---

## 6. Help & Support

### 6.1 Purpose

รองรับ Settings > Help ใน FO โดยให้ Admin จัดการเนื้อหา policy และช่องทางติดต่อ Support Center รายละเอียดเต็มอยู่ใน `12_HELP_SUPPORT_MODULE.md`

### 6.2 Phase 1 Scope

Phase 1 ครอบคลุม 2 sub-module:

| Sub-module | Description |
|---|---|
| Policy & Versioning | Terms of Use, Privacy Policy — Draft/Published/Archived, bilingual TH/EN, version history, restore, preview, publish confirmation |
| Support Center | Channels 5 ประเภท (LINE, Phone, Email, Facebook, Website), business hours, availability TH/EN, preview |

### 6.3 Out Of Scope (Phase 1)

Ticket queue, ticket detail, ticket assignment, priority, SLA tracking, reply history, internal notes และ manual ticket creation จาก LINE/Phone/Email ไม่อยู่ใน Phase 1

### 6.4 Audit Actions

- `POLICY_DRAFT_CREATE`
- `POLICY_DRAFT_SAVE`
- `POLICY_PUBLISH`
- `POLICY_ARCHIVE`
- `POLICY_RESTORE`
- `SUPPORT_CENTER_UPDATE`

---

## 7. System Notification Trigger Management

### 7.1 Purpose

แยกจาก Push Notification Broadcast เพื่อรองรับ notification ที่เกิดจาก action ในระบบ FO

### 7.2 Notification Types

Phase 1 system triggers (ตาม `14_NOTIFICATIONS_MODULE.md`):

| Type | Trigger | Recipient | Deep Link |
|---|---|---|---|
| New Offer | Buyer sends offer | Asset Owner | Chat Room / Offer |
| Offer Accepted | Owner accepts offer | Buyer | Chat Room |
| Offer Rejected | Owner declines offer | Buyer | Chat Room |
| Offer Cancelled | Buyer/owner cancels offer | Counterparty | Chat Room / Offer |
| Like | User likes content | Owner | Asset / Valuation |
| Comment | User comments on asset | Asset Owner | Asset Detail |
| Follow | User follows another user | Followed User | Follower Profile |
| Watch Alert | Asset matches alert criteria | Alert Owner | Watch Alert Result List |

Future scope (ยังไม่เปิดใน Phase 1): Group Follow, Like Valuation, Market Update, Sale Success

### 7.3 Admin Features

- เปิด/ปิด notification type
- แก้ไข template title/body
- กำหนด deep link path
- ดู delivery logs
- ดู failed notifications
- Retry เฉพาะ failed system notification

### 7.4 Template Fields

| Field | Type | Required |
|---|---|---|
| Notification Type | Dropdown | Yes |
| Title Template | Text | Yes |
| Body Template | Text | Yes |
| Variables | Multi-select | Optional |
| Deep Link Pattern | Text | Yes |
| Enabled | Boolean | Yes |
| Updated By | Admin | Yes |

---

## 8. Content / Board Management Completion

### 8.1 Purpose

ใช้สำหรับจัดการบทความและข้อมูล editorial ที่แสดงในเมนู Board ของ FO โดย Admin เป็นผู้สร้างและจัดการข้อมูลทั้งหมดจาก BO ส่วนผู้ใช้ FO สามารถอ่าน, ค้นหา, กรองหมวดหมู่, Like และ Share ได้ตาม Use Cases

### 8.2 Board Display Areas in FO

Phase 1 Board display is article-driven. `Content Management > Banners`, `Featured`, and `Featured Order` must not drive Board Main placement unless Product re-opens future campaign/promotion banner scope.

Hero selection is automatic: Board Main `Main Hero` uses the latest eligible Published Article across all active Board categories, while each category page hero uses the latest eligible Published Article within that selected active category.

| FO Area | Data Source in BO | Rule |
|---|---|---|
| Main Hero | Published Articles | Newest eligible article by `Publish Date-Time DESC`, then `Updated At DESC`, then `Article ID DESC` |
| Trending Now | Published Articles excluding Main Hero | If trending score exists, sort by trending score within the configured recent window, then publish date. If not, use newest remaining articles. |
| Journal Board preview on Board Main | Published Articles excluding Main Hero and Trending Now items already shown | Show the newest remaining article as the large preview card, then remaining articles if the layout needs more. |
| Journal Board View All | All eligible Published Articles | Show all eligible articles by newest publish date; no cross-page dedupe, so Hero/Trending articles can appear here. |
| Category page hero | Published Articles in selected active category | Newest eligible article in that active category. |
| Category Sidebar | Article Categories | แสดง category ที่ Active เท่านั้น |
| Article Detail | Article content | เปิดอ่านได้ทั้ง guest และ logged-in user |
| Board Search | Article title, excerpt, tags, content index | แสดงเฉพาะ Published |

Eligible article conditions:

- `Status = Published`
- `Publish Date-Time <= now` in `Asia/Bangkok`
- category is Active
- title, slug, cover image, cover image alt text, category, excerpt or generated excerpt, and read time are available
- article is not archived, unpublished, deleted, or policy-hidden

Board Main deduplication order:

1. Select Main Hero first and reserve its `Article ID`.
2. Select Trending Now from the remaining eligible articles.
3. Select Journal Board preview from the remaining eligible articles after Main Hero and Trending Now.
4. Do not duplicate an article within the same Board Main page.
5. `Journal Board View All` is a full listing and may include articles that appeared on Board Main.

### 8.3 Article Fields

| Field | Type | Required | FO Usage |
|---|---|---|---|
| Article ID | ID | Yes | ใช้อ้างอิงบทความ |
| Title | Text | Yes | แสดงบน Board list/detail |
| Slug | Text, unique | Yes | URL/deep link ของบทความ |
| Excerpt | Textarea | Optional | สรุปใน card/list |
| Cover Image | Image Upload | Yes | รูปปกบน Board และ Detail |
| Cover Image Alt Text | Text | Recommended | Accessibility / SEO |
| Category | FK Category | Yes | Filter และ Sidebar |
| Tags | Multi-select | Optional | Search และ Related Articles |
| Author Name | Text / FK Admin Profile | Yes | แสดงใน Article Detail |
| Author Avatar | Image Upload | Optional | แสดงใน Article Detail |
| Read Time | Number / Auto calculate | Optional | แสดงเวลาอ่าน |
| Quote Highlight | Text | Optional | แสดง quote section ใน Article Detail |
| Body Content | Rich Text | Yes | เนื้อหาหลักของบทความ |
| Related Articles | Multi-select Article | Optional | แสดงบทความแนะนำ |
| Status | Draft / Published / Scheduled / Archived | Yes | ควบคุมการแสดงบน FO |
| Featured | Boolean | No | Future scope only; not used for Phase 1 Board Main placement |
| Featured Order | Number | Optional | Future scope only; Phase 1 uses automatic article ordering |
| Publish Date-Time | DateTime | Required when Published/Scheduled | เงื่อนไขแสดงบน FO |
| Unpublish Date-Time | DateTime | Optional | ซ่อนอัตโนมัติเมื่อครบเวลา |
| SEO Title | Text | Optional | Metadata |
| SEO Description | Textarea | Optional | Metadata |
| View Count | Number, system generated | No | Analytics |
| Like Count | Number, system generated | No | แสดงยอด Like |
| Share Count | Number, system generated | No | Analytics |
| Created By | Admin ID | System | Audit |
| Updated By | Admin ID | System | Audit |
| Created At | DateTime | System | Audit |
| Updated At | DateTime | System | Audit |

### 8.4 Article Status Rules

| Status | BO Meaning | FO Impact |
|---|---|---|
| Draft | ยังไม่เผยแพร่ | ไม่แสดงใน FO |
| Scheduled | ตั้งเวลาเผยแพร่ | แสดงเมื่อ Publish Date-Time <= current time |
| Published | เผยแพร่แล้ว | แสดงใน Board, Search, Category และ Detail |
| Archived | เก็บเข้าคลัง | ไม่แสดงใน list/search แต่ direct link ควรแสดง unavailable หรือ redirect ตาม UX policy |

**Rules**
- FO Board ดึงเฉพาะบทความที่ `Status = Published` และ `Publish Date-Time <= current time`
- บทความ Scheduled ต้องเปลี่ยนเป็น Published อัตโนมัติเมื่อถึงเวลา หรือให้ query layer ตีความว่าแสดงได้เมื่อถึงเวลา
- บทความ Archived/Unpublished ต้องหายจาก Board ทันที
- ถ้าผู้ใช้เปิดบทความที่ถูก Unpublish/Archive แล้ว ให้แสดง "This article is no longer available"
- Slug ต้อง unique และไม่ควรเปลี่ยนหลัง Published หากเปลี่ยนต้องมี redirect rule

### 8.5 Create / Edit Article Workflow

1. Admin เข้า BO > Content Management > Articles
2. กด Create Article
3. กรอก Title, Slug, Excerpt, Category, Cover Image, Body Content
4. ใส่ Tags, Quote Highlight, Related Articles, SEO fields ตามต้องการ
5. เลือก Status:
   - Save as Draft
   - Publish Now
   - Schedule Publish
6. Admin กด Preview as FO เพื่อตรวจหน้าตาบทความก่อนเผยแพร่
7. เมื่อ Publish แล้ว FO Board ดึงข้อมูลไปแสดงตาม display rules

### 8.6 Preview as FO

**Purpose:** ให้ Admin เห็นบทความใน layout ใกล้เคียง FO ก่อนเผยแพร่

**Preview must show**
- Board card preview
- Article detail preview
- Mobile preview
- Cover image crop
- Title, excerpt, author, publish date, read time
- Quote highlight
- Body content formatting
- Related articles

**Rules**
- Preview ไม่เพิ่ม view count
- Preview ไม่ต้องเป็น Published
- Preview URL ต้องเข้าถึงได้เฉพาะ Admin ที่มีสิทธิ์

### 8.7 Category Management

| Field | Type | Required |
|---|---|---|
| Category ID | ID | Yes |
| Category Name | Text | Yes |
| Slug | Text, unique | Yes |
| Description | Textarea | Optional |
| Display Order | Number | Optional |
| Status | Active / Inactive | Yes |

**Rules**
- FO แสดงเฉพาะ Category ที่ Active
- ถ้า Category ถูก Inactive บทความในหมวดนั้นยังอยู่ในระบบ แต่ไม่ควรแสดงใน category sidebar
- Admin ต้องไม่ลบ Category ที่มี Article ใช้งานอยู่ ยกเว้นย้าย Article ไป Category อื่นก่อน

### 8.8 Banner Management for Board

**Phase 1 status:** Future scope only. Do not implement or expose `Content Management > Banners` for the current Board Main. Board Main Hero, Trending Now, Journal Board preview, Journal Board View All, and category hero/list are article-driven using section 9.2 rules.

| Field | Type | Required |
|---|---|---|
| Banner ID | ID | Yes |
| Title | Text | Yes |
| Image | Image Upload | Yes |
| Alt Text | Text | Recommended |
| Target URL / Deep Link | URL / FO Path | Optional |
| Position | Top Banner / Mid Banner / Board Detail | Yes |
| Start Date-Time | DateTime | Optional |
| End Date-Time | DateTime | Optional |
| Status | Active / Inactive | Yes |
| Display Order | Number | Optional |

**Rules**
- FO แสดงเฉพาะ Banner ที่ Active และอยู่ในช่วงเวลาแสดงผล
- Banner ต้องมี Preview ก่อน Activate
- Banner click ต้องเก็บ analytics ได้

### 8.9 Content Permissions

Content permissions use the single BO account type `Admin`. There are no BO sub-types. Role templates may grant focused content access, such as `Content Editor` for draft authoring and `Content Publisher` for publish/schedule/archive actions.

| Action | Admin access rule |
|---|---|
| View Articles | Allowed when Content / Board module access is granted. |
| Create / Edit Draft | Allowed; must write audit for saved changes. |
| Publish / Schedule / Archive Article | Requires confirmation when public visibility changes and must write audit. |
| Delete Article | Not a default action; use archive unless policy explicitly allows delete with reason and audit. |
| Manage Categories | Allowed with before/after audit and FO-impact awareness. Banner management is future scope for non-article campaigns/promotions only. |
| Preview as FO | Allowed and must respect canonical FO display rules. |

Content role split baseline:

| Role template | Content scope |
|---|---|
| Content Editor | View Content Management, create/edit draft articles, edit metadata/categories, and preview as FO. Cannot publish/schedule/archive. |
| Content Publisher | Publish, schedule, archive, manage categories, and resolve reported Board content with confirmation/reason/audit where public visibility changes. Banner management is future scope. |

### 8.10 Board Analytics

| Metric | Description |
|---|---|
| Article Views | จำนวนครั้งที่เปิดอ่าน |
| Unique Readers | จำนวน user/device ที่อ่าน |
| Likes | จำนวน Like |
| Shares | จำนวน Share |
| Avg Read Time | เวลาอ่านเฉลี่ย |
| Completion Rate | อ่านถึงท้ายบทความกี่เปอร์เซ็นต์ |
| Category Performance | performance แยกตาม category |
| Search Keywords | keyword ที่นำไปสู่ article |
| Banner CTR | Future scope for campaign/promotion banners only; not required for Phase 1 Board Main |

### 8.11 BO/FO Mapping for Board

| BO Action | FO Result |
|---|---|
| Create Draft | ยังไม่แสดงใน FO |
| Publish Article | บทความปรากฏบน Board ทันที |
| Schedule Article | บทความปรากฏเมื่อถึง Publish Date-Time |
| Archive Article | บทความหายจาก Board/Search/Category |
| Publish newer eligible Article | Board Main recalculates automatically: newest eligible article becomes Main Hero; remaining eligible articles feed Trending Now and Journal Board preview by deterministic rules |
| Update Cover Image | รูปปกใน Board และ Article Detail เปลี่ยน |
| Update Category | บทความย้ายไป category ใหม่ |
| Inactive Category | Category หายจาก sidebar |
| Activate Banner | Future scope only; not used for Phase 1 Board Main |
| Deactivate Banner | Future scope only; not used for Phase 1 Board Main |

---

## 9. Asset Detail Field Completion

เพื่อให้ BO รองรับข้อมูลที่ FO ต้องแสดงใน Feed, Search, Detail, Profile และ Asset Value Dashboard ให้ระบุ field ของ asset ให้ชัดเจนดังนี้

### 9.1 Asset Core Fields

| Field | Type | Required |
|---|---|---|
| Asset ID | ID | Yes |
| Owner | FK User | Yes |
| Brand | FK Brand | Yes |
| Model | FK Model | Yes |
| Reference No. | Text | Optional |
| Price | Number | Optional |
| Price on Request | Boolean | Yes |
| Status | Sale / Show / Hide / Sold | Yes |
| Condition | Dropdown | Yes |
| Description | Textarea | Optional |
| Technical Specs | Structured JSON | Optional |
| Box Included | Boolean | Optional |
| Papers Included | Boolean | Optional |
| Images | Multi-image Upload | Yes |
| Created At | DateTime | Yes |
| Updated At | DateTime | Yes |

### 9.2 Provenance Fields

| Field | Type | Required |
|---|---|---|
| Purchase Date | Date | Optional |
| Purchase Source | Text | Optional |
| Purchase Price | Number | Optional |
| Proof of Payment | Image Upload, max 3 | Optional |
| Notes | Textarea | Optional |

**Privacy Rule:** Provenance และ Proof of Payment เป็นข้อมูลส่วนตัว เห็นเฉพาะ Owner ใน FO และ Admin ใน BO

### 9.3 Consignment Fields

| Field | Type | Required |
|---|---|---|
| Consignment Center | Text / FK Directory | Optional |
| Consignment Date | Date | Optional |
| Consignment Price | Number | Optional |
| Contact Person | Text | Optional |
| Notes | Textarea | Optional |

### 9.4 Sale History Fields

| Field | Type | Required |
|---|---|---|
| Sold Date | Date | Yes |
| Buyer Name | Text | Optional |
| Buyer User ID | FK User | Optional |
| Sale Price | Number | Yes |
| Payment Method | Bank Transfer / Cash / PromptPay / Other | Yes |
| Proof of Payment | Image Upload | Optional |
| Notes | Textarea | Optional |

**Rules**
- Asset สถานะ Sold แก้ไขจาก FO ไม่ได้
- Owner เห็น Sale History ได้
- Viewer ไม่เห็น Sale History และ API ต้อง return 403
- Admin เห็น Sale History ได้ใน BO

---

## 10. Expanded Reports & Analytics

เพิ่ม report ต่อไปนี้จาก BO_Spec v1.2

| Report | Data |
|---|---|
| Board Report | Article Views, Unique Readers, Likes, Shares, Avg Read Time, Completion Rate |
| Offer Report | Offers Made, Pending, Accepted, Rejected, Expired, Avg Offer Price, Avg Response Time |
| Chat Report | Active Chat Rooms, Messages Sent, Attachments Sent, Reported Chats |
| Asset Reported Comments Report | Total Comments, Reported Comments, Hidden Comments, Top Commented Assets |
| Account Deletion Report | Requests, Restored, Restore Rejected, Auto-Deleted (Archive + Anonymize), Avg Processing Time |
| System Notification Report | Sent, Delivered, Opened, Failed, Retry Count by Notification Type |

---

## 11. Expanded BO/FO Action Mapping

Phase 1 actions (ตรง prototype ที่ล็อกแล้ว):

| Action in BO | Result in FO |
|---|---|
| Hide Comment | Comment หายจาก Asset Detail |
| Unhide Comment | Comment กลับมาแสดงใน Asset Detail |
| Remove comment (ซ่อนถาวร) | Comment ถูกซ่อนถาวรจาก public surfaces ตามผล moderation (comment status → `Removed`) |
| Approve Account Archive | User login ไม่ได้, profile/assets ถูกซ่อนหรือ anonymized |
| Publish Policy | FO แสดงเนื้อหา Terms of Use / Privacy Policy เวอร์ชันใหม่ทันที |
| Update Support Center | FO Help screen แสดงช่องทางติดต่อและเวลาทำการล่าสุด |
| Disable System Notification Type | FO จะไม่ได้รับ notification ประเภทนั้น |
| Update Notification Template | ข้อความ notification ใหม่ใช้ template ล่าสุด |

Future scope (ยังไม่เปิดใน V1 Offer Management ที่เป็น read-only):

| Action in BO | Result in FO |
|---|---|
| Force Expire Offer | Offer ใช้งานไม่ได้และหายจาก Incoming Offers |
| Mark Offer Invalidated | Chat/Offer แสดงว่า asset unavailable |
| Remove Chat Message | ข้อความหายจาก chat หรือแสดงเป็น removed |

---

## 12. Expanded Audit Log Events

เพิ่ม Target Entity Type ใน Audit Log:

- Article
- ArticleCategory
- BoardBanner
- Offer
- ChatRoom
- ChatMessage
- Comment
- Like
- Follow
- WatchAlert
- Policy
- PolicyVersion
- SupportCenter
- AccountDeletionRequest
- NotificationTemplate
- NotificationDelivery

เพิ่ม Action Type:

- `ARTICLE_PREVIEW`
- `ARTICLE_PUBLISH`
- `ARTICLE_SCHEDULE`
- `ARTICLE_ARCHIVE`
- `ARTICLE_SET_FEATURED`
- `BANNER_ACTIVATE`
- `BANNER_DEACTIVATE`
- `OFFER_FORCE_EXPIRE`
- `OFFER_INVALIDATE`
- `COMMENT_HIDE`
- `COMMENT_UNHIDE`
- `COMMENT_REMOVE`
- `CHAT_MESSAGE_REMOVE`
- `ACCOUNT_DELETION_REQUEST_CREATE`
- `ACCOUNT_DELETION_SESSION_REVOKE`
- `ACCOUNT_DELETION_OFFER_CANCEL_AUTO`
- `ACCOUNT_DELETION_REPORT_CLOSE_AUTO`
- `ACCOUNT_DELETION_DEPENDENCY_CHECK_AUTO`
- `ACCOUNT_DELETION_RESTORE`
- `ACCOUNT_DELETION_RESTORE_REJECT`
- `ACCOUNT_DELETION_AUTO_DELETE`
- `ACCOUNT_DELETION_EXPORT`
- `ACCOUNT_DELETION_SENSITIVE_REVEAL`
- `POLICY_DRAFT_CREATE`
- `POLICY_DRAFT_SAVE`
- `POLICY_PUBLISH`
- `POLICY_ARCHIVE`
- `POLICY_RESTORE`
- `SUPPORT_CENTER_UPDATE`
- `NOTIFICATION_TEMPLATE_UPDATE`
- `NOTIFICATION_DELIVERY_RETRY`

---

## 13. Updated Admin Access & Permissions

BO uses a single `Admin` account type. Module behavior is controlled by role templates and module/action policy instead of separate BO admin account types.

Baseline role templates include `Super Admin`, `Content Editor`, `Content Publisher`, `Moderator`, and `Support Agent`. These are permission presets only; production must enforce explicit permission keys at route, UI, API, and service layers.

| Module | Admin access rule |
|---|---|
| Offer Management | Admin can view/review by policy with privacy masking and audit. Chat moderation เป็น future scope |
| Asset Management (Reported Comments) | Admin can view aggregate data and moderate reported comments by policy. |
| Market Demand (Watch Alert) | Admin can view by policy (read-only — no disable/enable/export/bulk action on user alerts). Audit covers sensitive reveal and trigger job run only. |
| Help & Support | Admin can manage Policy & Versioning (draft/publish/restore) and Support Center (channels, business hours, availability) by policy. Ticket queue/SLA/internal notes เป็น future scope. |
| Account Deletion Requests | Admin can view requests and restore/reject restore within the 30-day grace period by policy with confirmation, reason, and audit; auto-delete (archive + anonymize) is a system job, not an admin action. |
| Notifications (Broadcast & System Templates) | Admin can manage templates and broadcasts with approval, preview, and audit policy. |
## 14. Recommended Acceptance Criteria

BO จะถือว่ารองรับ FO ครบถ้วนเมื่อผ่านเงื่อนไขต่อไปนี้:

1. Admin สามารถ trace offer จาก Asset Detail, Chat และ Notification ได้ครบ lifecycle
2. Pending offer ถูกยกเลิกอัตโนมัติเมื่อ FO confirm delete account สำเร็จ (system auto action — ไม่มี block รอ Admin ตาม `13_ACCOUNT_DELETION_MODULE.md` DEL-DEC-006)
3. Comment ที่ถูก hide/remove ใน BO หายจาก FO ทันที
4. Watch Alert ที่ผู้ใช้สร้างจาก Search สามารถดู criteria และ trigger history ใน BO ได้
5. System notification ทุกประเภทใน PRD มี template, trigger log และ delivery status
6. Provenance, Consignment และ Proof of Payment ถูกจำกัดสิทธิ์ตาม privacy rule
7. Admin สามารถจัดการ Policy & Versioning และ Support Center ได้
8. Audit Log บันทึกทุก action สำคัญของ admin ครบ target entity และ before/after value
9. Admin สามารถสร้างบทความพร้อมรูปปก เนื้อหา หมวดหมู่ และ publish/schedule จาก BO ได้
10. FO Board แสดงเฉพาะบทความ Published ที่ถึงเวลาเผยแพร่แล้ว
11. Preview as FO แสดงบทความได้โดยไม่เพิ่ม view count และเข้าได้เฉพาะ Admin
