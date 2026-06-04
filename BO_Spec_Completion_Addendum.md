# BO Specification Addendum - Tuk Daeng Back Office Coverage for FO

**Version:** 1.2 Addendum  
**Purpose:** เติมรายละเอียด Back Office ให้รองรับ Front Office flows จาก PRD และ Use Cases ครบถ้วนขึ้น  
**Reference:** BO_Spec v1.1, PRD v1.0, Use_Cases v1.0

---

## 1. Summary

BO_Spec v1.1 รองรับ flow หลักของ FO แล้วในส่วน User, Asset, Content, Market Data, Directory, Reports, Push Notification และ Audit Log แต่ยังขาดรายละเอียดสำหรับ flow ที่เกิดจากการใช้งานจริงของผู้ใช้ใน FO ได้แก่ Offer/Chat, Comment, Like/Favorite, Follow, Watch Alert ราย user, Help/Support, Delete Account และ System Notification Trigger

Addendum นี้เสนอให้เพิ่ม module และ business rules ต่อไปนี้:

1. Offer & Chat Management
2. Social Interaction Management
3. Watch Alert Management
4. Account Deletion & Data Archive
5. Help & Support Ticket Management
6. System Notification Trigger Management
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
├── Offer & Chat Management
│   ├── Offers
│   ├── Chat Rooms
│   └── Chat Reports
├── Social Interaction Management
│   ├── Comments
│   ├── Likes / Favorites
│   └── Follows
├── Content Management
│   ├── Articles
│   ├── Categories
│   └── Banners
├── Market Data
│   ├── Watch Brands
│   ├── Watch Models
│   └── Price Index
├── Watch Alert Management
├── Directory
├── Help & Support
├── Account Deletion Requests
├── Reports & Analytics
├── Push Notifications
├── System Notification Triggers
├── Audit Log
└── Admin Settings
```

---

## 3. Offer & Chat Management

### 3.1 Purpose

ใช้สำหรับตรวจสอบและดูแล flow ซื้อขายจาก FO ได้แก่ Make Offer, Accept Offer, Decline Offer, Incoming Offers, Chat Message, File/Image in Chat และ Delete Chat

### 3.2 Offer Status

| Status | Description | FO Impact |
|---|---|---|
| Pending | ผู้ซื้อส่ง offer แล้ว รอเจ้าของตอบ | แสดงใน Chat และ Incoming Offers |
| Accepted | เจ้าของรับ offer | แจ้งเตือนผู้ซื้อ, แสดง Offer Accepted |
| Declined | เจ้าของปฏิเสธ offer | แจ้งเตือนผู้ซื้อ, ย้ายออกจาก Incoming Offers |
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
| Status | Pending / Accepted / Declined / Cancelled / Expired / Invalidated |
| Created At | วันที่ส่ง offer |
| Updated At | วันที่เปลี่ยนสถานะล่าสุด |

### 3.4 Offer Detail

**Data**
- ข้อมูลสินทรัพย์แบบย่อ
- ประวัติ offer ของ asset เดียวกัน
- Chat room ที่เกี่ยวข้อง
- Buyer/Owner profile summary
- Status timeline
- Notification delivery status

**Admin Actions**

| Action | Permission | Rule |
|---|---|---|
| View Offer | Super Admin, Moderator, Support Admin | ดูข้อมูลเพื่อ support และตรวจสอบ |
| Force Expire Offer | Super Admin | ใช้กรณีผิด policy หรือ asset unavailable |
| Mark Invalidated | System / Super Admin | ใช้เมื่อ asset ถูก remove หรือ sold |
| Export Offer History | Super Admin | สำหรับ audit/dispute |

### 3.5 Chat Rooms

**Features**
- ดูรายการ chat rooms
- Search ด้วย user, asset, keyword
- Filter ด้วย asset, unread report, file attached, date range
- ดูเฉพาะ chat ที่ถูก report
- Export conversation เฉพาะ Super Admin

**Columns**

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

- Admin ไม่ควรแก้ไขข้อความผู้ใช้โดยตรง
- การลบ chat ของผู้ใช้ใน FO เป็น user-level deletion ไม่ใช่ hard delete จากระบบ
- Super Admin สามารถ export conversation เพื่อ audit/dispute ได้
- Moderator สามารถ hide/remove ข้อความที่ผิด policy ได้
- ไฟล์แนบต้องมี virus/malware scan status
- Chat ที่เกี่ยวข้องกับ accepted offer ต้องถูกเก็บตาม retention policy

---

## 4. Social Interaction Management

### 4.1 Purpose

รองรับ FO flows: Like/Unlike Asset, Favorites, Follow/Unfollow Seller, Comment Asset, Reply Comment และ Like Comment

### 4.2 Comments

**Features**
- ดู comment/reply ทั้งหมด
- Search ด้วย keyword, commenter, asset
- Filter ด้วย status, reported, date range
- Hide / Unhide comment
- Delete comment แบบ soft delete
- ดู report reason จากผู้ใช้

**Comment Status**

| Status | Description | FO Impact |
|---|---|---|
| Visible | แสดงปกติ | ผู้ใช้เห็น comment |
| Hidden | ซ่อนโดย admin | FO ไม่แสดง comment |
| Deleted | ลบแบบ soft delete | FO แสดงเป็น deleted หรือไม่แสดงตาม policy |
| Reported | ถูกผู้ใช้ report | รอ moderator review |

**Columns**

| Column | Description |
|---|---|
| Comment ID | รหัส comment |
| Asset ID | asset ที่ถูก comment |
| User | ผู้ comment |
| Parent Comment | กรณีเป็น reply |
| Content Preview | ตัวอย่างข้อความ |
| Likes | จำนวน like comment |
| Status | Visible / Hidden / Deleted / Reported |
| Reports | จำนวน report |
| Created At | วันที่สร้าง |

### 4.3 Likes / Favorites

**Rules**
- Like asset ใน FO ทำให้ asset ปรากฏใน Favorites tab
- Unlike ต้องนำ asset ออกจาก Favorites tab
- BO ควรดู aggregate ได้ แต่ไม่จำเป็นต้องแก้ไขราย record ยกเว้น Super Admin

**Data**

| Field | Description |
|---|---|
| User ID | ผู้กด like |
| Asset ID | สินทรัพย์ที่ถูก like |
| Created At | วันที่กด like |
| Active | true/false สำหรับ unlike history |

### 4.4 Follows

**Rules**
- ผู้ใช้ follow ตัวเองไม่ได้
- Following tab ใน Feed แสดง asset สถานะ Sale จากผู้ที่ follow
- Viewer profile แสดงปุ่ม Follow/Following ตาม relation

**Data**

| Field | Description |
|---|---|
| Follower ID | ผู้ติดตาม |
| Following User ID | ผู้ถูกติดตาม |
| Created At | วันที่ follow |
| Status | Active / Unfollowed |

---

## 5. Watch Alert Management

### 5.1 Purpose

BO_Spec v1.1 มี Watch Alert report แล้ว แต่ FO ต้องมีการ create, rename, delete, toggle notification และ trigger alert จาก search criteria จึงควรมี management view ราย alert

### 5.2 Features

- ดู Watch Alert ทั้งหมด
- Search ด้วย User, Alert Name, Brand, Model, Reference No.
- Filter ด้วย Active, Notification On/Off, Triggered, Date Range
- ดู criteria ที่ผู้ใช้ save จาก Search
- ดู trigger history และ click-through history
- Disable alert โดย admin กรณี abuse

### 5.3 Fields

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
| Notification Enabled | Boolean | Yes |
| Status | Active / Disabled / Deleted | Yes |
| Last Triggered At | DateTime | Optional |
| Created At | DateTime | Yes |

### 5.4 Trigger Rules

- เมื่อมี asset ใหม่สถานะ Sale ที่ตรง criteria ให้สร้าง notification ประเภท Watch Alert
- Alert ที่ Notification Enabled = Off ยังถูกเก็บไว้ แต่ไม่ส่ง push
- Alert ที่ Disabled โดย admin จะไม่ trigger และผู้ใช้ควรเห็นสถานะ unavailable หรือถูกซ่อนตาม UX policy
- ถ้า brand/model ถูก inactive ใน Market Data ต้องไม่ trigger alert ใหม่จากข้อมูลนั้น

---

## 6. Account Deletion & Data Archive

### 6.1 Purpose

รองรับ UC-SETTING-004: ผู้ใช้ลบบัญชีจาก FO โดยต้อง archive data และต้องไม่มี pending offer

### 6.2 Request Status

| Status | Description |
|---|---|
| Requested | ผู้ใช้กด delete account แล้ว |
| Blocked | มี pending offer หรือเงื่อนไขอื่นที่ยังปิดไม่ได้ |
| Approved | ผ่านเงื่อนไข archive แล้ว |
| Archived | archive data สำเร็จ |
| Cancelled | ผู้ใช้ยกเลิกหรือ admin reject |

### 6.3 Validation Rules

- ถ้ามี pending incoming offer หรือ outgoing offer ให้ block deletion
- ถ้ามี accepted offer ที่ยังอยู่ใน retention window ให้ archive แทน hard delete
- Asset ของผู้ใช้ต้องถูกซ่อนจาก FO หลัง account archived
- Chat history เก็บตาม retention policy แต่ต้อง mask personal profile fields ตาม privacy policy
- Username/email/phone/line ต้องถูก anonymize เมื่อพ้น retention policy

### 6.4 Admin View

**Columns**

| Column | Description |
|---|---|
| Request ID | รหัสคำขอ |
| User | ผู้ขอลบบัญชี |
| Pending Offers | จำนวน offer ที่ยัง pending |
| Assets | จำนวน asset |
| Chats | จำนวน chat rooms |
| Status | Requested / Blocked / Approved / Archived / Cancelled |
| Requested At | วันที่ขอ |
| Processed By | Admin/System ที่ดำเนินการ |

**Actions**

| Action | Permission |
|---|---|
| View Request | Super Admin, Support Admin |
| Recheck Blocking Conditions | Super Admin, Support Admin |
| Approve Archive | Super Admin |
| Cancel Request | Super Admin |
| Export Archive Report | Super Admin |

---

## 7. Help & Support Ticket Management

### 7.1 Purpose

BO_Spec v1.1 ระบุว่า Support Admin ตอบ Help ได้ แต่ยังไม่มี module รายละเอียด จึงเพิ่ม Help & Support เพื่อรองรับ Settings > Help ใน FO

### 7.2 Ticket Types

| Type | Description |
|---|---|
| Account | ปัญหา login, reset password, suspended account |
| Asset | ปัญหาเพิ่ม/แก้ไขสินทรัพย์ |
| Offer | ปัญหา offer หรือ transaction |
| Chat | ปัญหา chat/file |
| Report | รายงานผู้ใช้หรือ asset |
| General | เรื่องทั่วไป |

### 7.3 Ticket Status

| Status | Description |
|---|---|
| Open | รอ admin รับเรื่อง |
| In Progress | กำลังดำเนินการ |
| Waiting User | รอข้อมูลจากผู้ใช้ |
| Resolved | แก้ไขแล้ว |
| Closed | ปิดเรื่อง |

### 7.4 Fields

| Field | Type | Required |
|---|---|---|
| Ticket ID | ID | Yes |
| User | FK User | Yes |
| Type | Dropdown | Yes |
| Subject | Text | Yes |
| Message | Textarea | Yes |
| Attachment | File Upload | Optional |
| Related Entity | User / Asset / Offer / Chat | Optional |
| Priority | Low / Medium / High / Critical | Yes |
| Status | Ticket Status | Yes |
| Assigned Admin | FK Admin | Optional |
| Created At | DateTime | Yes |
| Updated At | DateTime | Yes |

---

## 8. System Notification Trigger Management

### 8.1 Purpose

แยกจาก Push Notification Broadcast เพื่อรองรับ notification ที่เกิดจาก action ในระบบ FO

### 8.2 Notification Types

| Type | Trigger | Recipient | Deep Link |
|---|---|---|---|
| New Offer | Buyer sends offer | Asset Owner | Chat Room / Offer |
| Offer Accepted | Owner accepts offer | Buyer | Chat Room |
| Offer Declined | Owner declines offer | Buyer | Chat Room |
| Comment | User comments on asset | Asset Owner | Asset Detail |
| New Follower | User follows another user | Followed User | Follower Profile |
| Group Follow | Multiple follows in short window | Followed User | Followers List |
| Like Valuation | User likes valuation/content | Owner | Asset/Valuation |
| Market Update | Price Index changed | Interested Users | Price Index / Asset Value |
| Sale Success | Asset marked Sold | Owner / Buyer | Sale History |
| Watch Alert | Asset matches alert criteria | Alert Owner | Asset Detail |

### 8.3 Admin Features

- เปิด/ปิด notification type
- แก้ไข template title/body
- กำหนด deep link path
- ดู delivery logs
- ดู failed notifications
- Retry เฉพาะ failed system notification

### 8.4 Template Fields

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
| Status | Sale / Collection Show / Collection Hide / Sold | Yes |
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

**Privacy Rule:** Provenance และ Proof of Payment เป็นข้อมูลส่วนตัว เห็นเฉพาะ Owner ใน FO และ Super Admin ใน BO

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
- Super Admin เห็น Sale History ได้ใน BO

---

## 10. Expanded Reports & Analytics

เพิ่ม report ต่อไปนี้จาก BO_Spec v1.1

| Report | Data |
|---|---|
| Offer Report | Offers Made, Pending, Accepted, Declined, Expired, Avg Offer Price, Avg Response Time |
| Chat Report | Active Chat Rooms, Messages Sent, Attachments Sent, Reported Chats |
| Comment Report | Total Comments, Reported Comments, Hidden Comments, Top Commented Assets |
| Social Report | Likes, Favorites, Follows, Unfollows, Top Favorited Assets |
| Account Deletion Report | Requests, Blocked, Archived, Avg Processing Time |
| Support Report | Open Tickets, SLA, Resolution Time, Ticket Types |
| System Notification Report | Sent, Delivered, Opened, Failed, Retry Count by Notification Type |

---

## 11. Expanded BO/FO Action Mapping

| Action in BO | Result in FO |
|---|---|
| Hide Comment | Comment หายจาก Asset Detail |
| Unhide Comment | Comment กลับมาแสดงใน Asset Detail |
| Soft Delete Comment | Comment ไม่แสดง หรือแสดงเป็น deleted ตาม UX policy |
| Disable Watch Alert | Alert ไม่ trigger notification ใหม่ |
| Enable Watch Alert | Alert กลับมา trigger ตาม criteria |
| Force Expire Offer | Offer ใช้งานไม่ได้และหายจาก Incoming Offers |
| Mark Offer Invalidated | Chat/Offer แสดงว่า asset unavailable |
| Remove Chat Message | ข้อความหายจาก chat หรือแสดงเป็น removed |
| Approve Account Archive | User login ไม่ได้, profile/assets ถูกซ่อนหรือ anonymized |
| Resolve Support Ticket | ผู้ใช้เห็น ticket status เป็น Resolved/Closed |
| Disable System Notification Type | FO จะไม่ได้รับ notification ประเภทนั้น |
| Update Notification Template | ข้อความ notification ใหม่ใช้ template ล่าสุด |

---

## 12. Expanded Audit Log Events

เพิ่ม Target Entity Type ใน Audit Log:

- Offer
- ChatRoom
- ChatMessage
- Comment
- Like
- Follow
- WatchAlert
- SupportTicket
- AccountDeletionRequest
- NotificationTemplate
- NotificationDelivery

เพิ่ม Action Type:

- ForceExpireOffer
- InvalidateOffer
- HideComment
- UnhideComment
- RemoveChatMessage
- DisableWatchAlert
- EnableWatchAlert
- ApproveAccountArchive
- CancelAccountDeletion
- AssignTicket
- ResolveTicket
- UpdateNotificationTemplate
- RetryNotification

---

## 13. Updated Admin Role & Permissions

| Module | Super Admin | Content Admin | Moderator | Support Admin | Market Admin |
|---|---|---|---|---|---|
| Offer & Chat Management | Full | - | View / Moderate Reported | View Related to Ticket | - |
| Social Interaction Management | Full | - | Moderate | View Related to Ticket | - |
| Watch Alert Management | Full | - | View | View User Alerts | View Aggregate |
| Help & Support | Full | - | View Reported Cases | Full | - |
| Account Deletion Requests | Full | - | - | View / Recheck | - |
| System Notification Triggers | Full | - | - | - | - |
| Notification Templates | Full | - | - | - | - |

---

## 14. Recommended Acceptance Criteria

BO จะถือว่ารองรับ FO ครบถ้วนเมื่อผ่านเงื่อนไขต่อไปนี้:

1. Admin สามารถ trace offer จาก Asset Detail, Chat และ Notification ได้ครบ lifecycle
2. Pending offer ถูกนำไปใช้ block account deletion ได้จริง
3. Comment ที่ถูก hide/remove ใน BO หายจาก FO ทันที
4. Watch Alert ที่ผู้ใช้สร้างจาก Search สามารถดู criteria และ trigger history ใน BO ได้
5. System notification ทุกประเภทใน PRD มี template, trigger log และ delivery status
6. Provenance, Consignment และ Proof of Payment ถูกจำกัดสิทธิ์ตาม privacy rule
7. Support Admin สามารถรับ ticket จาก Help และตอบกลับผู้ใช้ได้
8. Audit Log บันทึกทุก action สำคัญของ admin ครบ target entity และ before/after value

