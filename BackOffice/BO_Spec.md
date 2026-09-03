# BO Specification — ตึกแดง Back Office System
**เวอร์ชัน:** 1.1  
**วันที่:** พฤษภาคม 2568  
**ผู้ใช้งาน:** Admin ของระบบตึกแดง
**อัปเดตจาก:** v1.0 → สอดคล้องกับ FO ล่าสุด (Admin access ผู้ใช้, Asset Status, Auth SSO, Profile Tabs)

---

## 1. ภาพรวม Back Office

Back Office ของตึกแดงเป็น Web Application สำหรับทีมงาน Admin ในการจัดการทุกด้านของแพลตฟอร์ม ครอบคลุม:
- จัดการผู้ใช้ (ไม่มีการแบ่ง FO user เป็น Buyer/Seller — ทุก User เป็น account type เดียวกัน)
- จัดการและ Moderate สินทรัพย์ทุกสถานะ (Sale / Show / Hide / Sold)
- จัดการ Content บทความที่แสดงบนหน้า Board ใน FO
- จัดการ Watch Brands, Models และ Price Index
- Directory ร้านค้า/บริการเป็น future/postponed scope; ไม่รวม Phase 1 เพราะ FO menu ยังเป็น placeholder
- ดูรายงานและ Analytics
- จัดการ Push Notification Broadcast
- ตรวจสอบ Audit Log ทุก Action ของ Admin

---

## 2. โครงสร้างเมนู Back Office

```
BO Dashboard
├── Dashboard (ภาพรวมระบบ)
├── User Management (จัดการผู้ใช้)
├── Asset Management (จัดการสินทรัพย์)
├── Offer Management (การดำเนินงาน / Offer Management — read-only ใน V1)
├── Content Management (จัดการเนื้อหา)
│   ├── Articles (บทความ Board)
│   ├── Categories (หมวดหมู่บทความ)
│   └── Reported Articles (รายงานบทความที่ถูกแจ้ง)
├── Market Data (ข้อมูลตลาด)
│   ├── Dashboard
│   ├── Brands & Models
│   └── Sync History
├── Option Master (จัดการ option master สำหรับ FO)
├── Directory (future/postponed; not Phase 1)
│   ├── Watch Shops
│   ├── Accessories Shops
│   ├── Repair Shops
│   ├── Auction Centers
│   ├── Consignment Centers
│   └── Authentication Centers
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

---

## 3. รายละเอียดแต่ละ Module

---

### 3.1 Dashboard

**ข้อมูลที่แสดง:**
- จำนวนผู้ใช้ใหม่วันนี้ / สัปดาห์นี้ / เดือนนี้ (พร้อม % เทียบช่วงก่อน)
- จำนวน Active Users Today
- จำนวนสินทรัพย์ที่เพิ่มใหม่วันนี้ แยกตามสถานะ (Sale / Show / Hide)
- จำนวน Transactions (Offer Accepted) วันนี้
- จำนวน Pending Reports (สินทรัพย์ที่ถูก Flag รอ Review)
- บทความที่เผยแพร่ล่าสุด 3 รายการ
- Watch Alerts ที่ Active ทั้งหมด
- กราฟแนวโน้ม User Growth (30 วัน)
- Top 10 Brand ที่ค้นหามากที่สุด
- Activity Feed ล่าสุด (User Registered, Asset Added, Offer Accepted, User Suspended)

---

### 3.2 User Management

> **สำคัญ:** ผู้ใช้ใน FO ทุกคนเป็น account type เดียวกัน (`User`) ไม่มี Buyer / Seller / Collector แยกกัน  
> Admin ใน BO เท่านั้นที่มี admin access แตกต่างกัน

**ฟีเจอร์:**
| ฟีเจอร์ | คำอธิบาย |
|---|---|
| ดูรายชื่อผู้ใช้ | ตาราง + Search + Filter ตาม Status, Auth Method, Date Joined |
| ดูโปรไฟล์ผู้ใช้ | ข้อมูลทั้งหมด, สินทรัพย์ทุกสถานะ (Sale/Show/Hide/Sold), ประวัติ Activity |
| Suspend User | ระงับบัญชีชั่วคราว + บังคับระบุเหตุผล |
| Ban User | ระงับบัญชีถาวร + บังคับระบุเหตุผล |
| Unsuspend / Unban | คืนสถานะปกติ |
| Delete User | ลบบัญชี Soft Delete (ข้อมูลยังอยู่ใน DB) |
| Reset Password | ส่งลิงก์ Reset ให้ผู้ใช้ทาง Email — ใช้ได้เฉพาะบัญชี Email/Password เท่านั้น (ไม่ใช้กับ Apple/Google SSO) |
| ดู Login History | ประวัติการเข้าสู่ระบบ (Auth Method, Device, IP, Timestamp) |
| ดู Auth Method | ระบุว่าบัญชีนี้สมัครด้วยวิธีใด: Email/Password, Apple Sign In, Google Sign In |
| Export | Requires permission check, scope control, expiry/background job where needed, and audit export event. |

**Columns ตารางผู้ใช้:**
| Column | คำอธิบาย |
|---|---|
| User ID | รหัสผู้ใช้ |
| Username | ชื่อผู้ใช้ |
| Email | อีเมล (หากใช้ Apple Private Relay จะแสดง Relay Email) |
| Auth Method | Email / Apple / Google |
| Phone | เบอร์โทร |
| Date Joined | วันที่สมัคร |
| Last Active | ครั้งล่าสุดที่ใช้งาน |
| Total Assets | จำนวนสินทรัพย์ทั้งหมด (ทุกสถานะ) |
| Status | Active / Suspended / Banned |

---

### 3.3 Asset Management

**ภาพรวม Asset Status ใน FO ที่ BO ต้องรองรับ:**
| สถานะ | ใครเห็นใน FO | คำอธิบาย |
|---|---|---|
| **Sale** | เจ้าของ + ผู้ใช้ทั่วไป | แสดงใน Feed / Marketplace ให้ซื้อได้ |
| **Show** | เจ้าของ + ผู้ใช้ทั่วไป | แสดงในโปรไฟล์เจ้าของ ไม่ขาย |
| **Hide** | เจ้าของเท่านั้น | Owner ตั้งซ่อนเองจาก FO; ไม่ใช่การซ่อนชั่วคราวจาก report/moderation |
| **Sold** | เจ้าของเท่านั้น | ขายไปแล้ว ไม่สามารถ Edit ได้ |

**ฟีเจอร์ Admin:**
| ฟีเจอร์ | คำอธิบาย |
|---|---|
| ดูรายการสินทรัพย์ทั้งหมด | Filter ตาม Status (Sale/Show/Hide/Sold/Flagged), Brand, ราคา, Owner |
| ดูรายละเอียดสินทรัพย์ | ข้อมูลครบทุกฟิลด์ รวม Provenance, Consignment Info, Sale History |
| Force Hide / Restore Visibility | ซ่อน asset ชั่วคราวเพื่อ moderation เมื่อเข้าเงื่อนไข report/review และคืนสถานะหลังตรวจแล้วไม่ผิด |
| Remove Asset | ลบสินทรัพย์ที่ละเมิด Policy (Soft Delete) |
| Edit Asset Info | ไม่ใช่ V1 Admin action สำหรับ user-owned asset; Admin ดูข้อมูลแบบ read-only และแก้ได้เฉพาะ operational/moderation state ที่มี reason + audit |
| Flag / Unflag Asset | ทำ Flag เพื่อ Review หรือยกเลิก Flag โดยไม่แก้ข้อมูลประกาศของผู้ใช้ |
| ดู User Reports | ดูรายงานที่ถูก Report โดยผู้ใช้ FO พร้อมเหตุผล |
| ดู Provenance | ดูข้อมูล Provenance และ Proof of Payment (เฉพาะ Admin) |
| ดู Sale History | ดูประวัติการขายของสินทรัพย์ที่มีสถานะ Sold |

**Columns ตารางสินทรัพย์:**
| Column | คำอธิบาย |
|---|---|
| Asset ID | รหัสสินทรัพย์ |
| Brand | ยี่ห้อ |
| Model | รุ่น |
| Reference No. | รหัสอ้างอิง |
| Owner | ชื่อผู้ใช้เจ้าของ |
| Price | ราคา (THB) |
| Status | Sale / Show / Hide / Sold |
| Condition | สภาพ |
| Date Added | วันที่เพิ่ม |
| Flagged | Flag / — |

---

### 3.4 Content Management — Articles

นี่คือ Module หลักสำหรับสร้าง Content ที่แสดงบนหน้า **Board** ใน FO  
ผู้ใช้ FO อ่านได้อย่างเดียว; Admin ที่มีสิทธิ์ตาม policy เป็นผู้สร้างและจัดการบทความใน BO

**Phase 1 Board Display Source of Truth**

Board Main uses Articles only. `Content Management > Banners` and manual `Featured Article` selection are not required for the current Board flow.

Hero selection is automatic: Board Main `Main Hero` uses the latest eligible Published Article across all active Board categories, while each category page hero uses the latest eligible Published Article within that selected active category.

FO selection rules:

| FO Area | Data source | Selection rule | Duplication rule |
|---|---|---|---|
| Main Hero | Published Articles | Newest eligible article by `publishDateTime DESC`, then `updatedAt DESC`, then `articleId DESC` | Do not repeat on Board Main |
| Trending Now | Published Articles excluding Main Hero | Use trending score if available; otherwise use newest remaining articles | Do not repeat Main Hero or duplicate items within Trending Now |
| Journal Board preview on Board Main | Published Articles excluding Main Hero and Trending Now items already shown | Use newest remaining article as the large preview card, then remaining articles if layout needs more | Do not repeat articles already shown on Board Main |
| Journal Board View All | All eligible Published Articles | Sort by `publishDateTime DESC`, then `updatedAt DESC`, then `articleId DESC` | No cross-page dedupe; articles shown in Hero/Trending can appear here |
| Category page hero | Published Articles in selected active category | Newest eligible article in that category | Avoid repeating in same page preview/list |

Eligible article conditions: `Status = Published`, `Publish Date <= now` in `Asia/Bangkok`, active category, required FO card fields present, and not archived/unpublished/deleted/policy-hidden.

#### 3.4.1 Article List
**ฟีเจอร์:**
- ดูรายการบทความทั้งหมด
- Filter: Status (Published / Draft / Scheduled / Archived), Category, Author, Date Range
- Search ด้วย Title
- Sort: Date, Views, Likes
- ปุ่ม "Create New Article"

**Columns:**
| Column | คำอธิบาย |
|---|---|
| ID | รหัสบทความ |
| Title | ชื่อบทความ |
| Category | หมวดหมู่ |
| Author | ผู้เขียน (ชื่อ Admin) |
| Publish Date | วันที่เผยแพร่ |
| Status | Published / Draft / Scheduled / Archived |
| Views | ยอดเข้าชม |
| Likes | ยอด Like |

#### 3.4.2 Create / Edit Article
**ฟิลด์:**
| ฟิลด์ | ประเภท | บังคับ | หมายเหตุ |
|---|---|---|---|
| Title | Text | ✓ | รองรับภาษาไทยและอังกฤษ |
| Slug | Auto-generate จาก Title | ✓ | แก้ไขได้ด้วยตนเอง |
| Cover Image | Image Upload | ✓ | แสดงเป็น Feature Image บน FO |
| Category | Dropdown | ✓ | Watch Brands, Watch 101, Watch Apparel, Watch Events, Watch Market, Journal Board |
| Tags | Multi-select | - | ใช้สำหรับ Search ภายใน Board |
| Author | Dropdown | ✓ | เลือกจากรายชื่อ Admin ทั้งหมด |
| Featured Article | Toggle | - | Future scope only; Phase 1 Board Main chooses Main Hero automatically from newest eligible Published Article |
| Content | Rich Text Editor (WYSIWYG) | ✓ | |
| Read Time (นาที) | Auto-calculate | - | คำนวณจากจำนวนคำ |
| SEO Title | Text | - | |
| SEO Description | Textarea | - | |
| Publish Date | Date-Time Picker | - | บังคับหาก Status = Scheduled |
| Status | Draft / Scheduled / Published / Archived | ✓ | |

**Rich Text Editor รองรับ:**
- Bold, Italic, Underline, Strikethrough
- Heading 1–3
- Bullet List, Numbered List
- Quote Block — แสดงเป็น Pull Quote เด่นบน FO
- Image Insert + Caption
- Hyperlink
- Video Embed (YouTube)
- Divider

#### 3.4.3 Preview
- Preview โหมด Mobile (375px) ก่อน Publish เพื่อดูว่าแสดงผลใน FO ถูกต้อง

#### 3.4.4 Article Categories Management
จัดการ Category ที่ใช้กรองบทความบน FO:
| Category | แสดงใน FO ที่ |
|---|---|
| Watch Brands | เมนู Board > Watch Brands |
| Watch 101 | เมนู Board > Watch 101 |
| Watch Apparel | เมนู Board > Watch Apparel |
| Watch Events | เมนู Board > Watch Events |
| Watch Market | หมวด Market ใน Board |
| Journal Board | หมวด Journal Board ใน Board |
| Trending Now | Section "Trending Now" บนหน้าหลัก Board |

---

### 3.5 Content Management — Banners

**Phase 1 status:** Future scope. Do not implement this menu for current Board Main display. Board Main Hero, Trending Now, and Journal Board preview are rendered from `Articles` using the deterministic rules in section 3.4.

**ฟีเจอร์:**
- จัดการ Banner ที่แสดงบน Feed และ Board ใน FO
- กำหนด Position: Top Banner / Mid Banner
- กำหนด Target Link (Deep Link ไปยัง Screen ใน FO หรือ External URL)
- กำหนด Start Date / End Date
- Preview Banner ก่อน Activate

---

### 3.6 Market Data — Watch Brands

**ฟีเจอร์:**
- ดู Brand นาฬิกาที่ดึงจาก API/backend sync แบบ read-only ใน Phase 1
- แสดง provider source, sync status, data quality และ downstream usage
- ข้อมูล Brand ถูกใช้ใน Autocomplete ขณะ Add Asset ใน FO และใน Filter ของ Search

**ข้อมูล Brand:**
| ฟิลด์ | ประเภท | บังคับ |
|---|---|---|
| Brand Name (EN) | Text | ✓ |
| Brand Name (TH) | Text | - |
| Logo | Image Upload | - |
| Country of Origin | Dropdown | - |
| Founded Year | Number | - |
| Official Website URL | URL | - |
| Status | Active / Inactive | ✓ |

---

### 3.7 Market Data — Watch Models

**ฟีเจอร์:**
- ดู Model ในแต่ละ Brand ที่ดึงจาก API/backend sync แบบ read-only ใน Phase 1
- แสดง reference/detail/source metadata และ quality status
- ข้อมูล Model ถูกใช้ใน Autocomplete และ Filter ใน FO

**ข้อมูล Model:**
| ฟิลด์ | ประเภท | บังคับ |
|---|---|---|
| Brand | Dropdown (FK) | ✓ |
| Model Name | Text | ✓ |
| Reference Numbers | Multi-text (list) | - |
| Case Size Range (mm) | Number Range | - |
| Movement Type | Dropdown | - |
| Release Year Range | Number Range | - |
| Status | Active / Inactive | ✓ |

---

### 3.8 Market Data — Price Index

**ฟีเจอร์:**
- ดู Market Price Index ของแต่ละ Model / Reference จาก API/backend sync แบบ read-only ใน Phase 1
- แสดงแหล่งที่มา, provider updated date, synced date และ USD -> THB conversion metadata
- ไม่ให้ Admin เพิ่ม แก้ไข import หรือ override price index เองใน Phase 1
- บันทึก Historical Price (ดู % Change 30d / 90d / 1y ได้)
- ข้อมูลนี้แสดงใน FO ที่เมนู Watch Price Index และในหน้า Asset Value Dashboard ของ Owner

**ข้อมูล Price Index:**
| ฟิลด์ | ประเภท | บังคับ |
|---|---|---|
| Brand | Dropdown (FK) | ✓ |
| Model | Dropdown (FK) | ✓ |
| Reference No. | Text | - |
| Market Price Min (THB) | Number | ✓ |
| Market Price Max (THB) | Number | ✓ |
| Date Updated | Date | ✓ |
| Source URL | URL | - |

---

### 3.9 Directory Management

**Phase 1 status:** Postponed / future scope only. FO directory hamburger entries are placeholder-only and do not have approved detail routes, so BO must not expose Directory navigation, CRUD, publication controls, map/contact fields, or FO sync in Phase 1.

สำหรับจัดการข้อมูลที่แสดงในเมนู Hamburger ของ FO ได้แก่:  
Watch Shops, Accessories Shops, Repair Shops, Auction Centers, Consignment Centers, Authentication Centers, Community

**ฟิลด์มาตรฐานแต่ละ Directory Item:**
| ฟิลด์ | ประเภท | บังคับ |
|---|---|---|
| Name (TH) | Text | ✓ |
| Name (EN) | Text | - |
| Category | Dropdown (Watch Shops / Accessories / Repair / Auction / Consignment / Authentication / Community) | ✓ |
| Address | Textarea | - |
| Province | Dropdown | - |
| Phone | Text | - |
| Line ID | Text | - |
| Website | URL | - |
| Facebook | URL | - |
| Instagram | URL | - |
| Logo / Profile Image | Image Upload | - |
| Cover Photos | Multi-Image Upload (สูงสุด 5 รูป) | - |
| Description | Rich Text | - |
| Opening Hours | Time Range (จันทร์–อาทิตย์) | - |
| Map Location | Map Picker (Lat/Lng) | - |
| Tags | Multi-select | - |
| Status | Active / Inactive | ✓ |

---

### 3.10 Reports & Analytics

**Reports ที่มี:**
| Report | ข้อมูลที่แสดง |
|---|---|
| User Report | User Growth (รายวัน/สัปดาห์/เดือน), Active Users (DAU/MAU), Auth Method Breakdown (Email/Apple/Google), Retention Rate |
| Asset Report | Assets by Status (Sale/Show/Hide/Sold), Assets by Brand, Avg Price, New Assets per Day |
| Transaction Report | Offers Made, Offers Accepted, Offers Rejected, Acceptance Rate, Avg Deal Value |
| Content Report | Article Views, Top 10 Articles, Category Performance, Avg Read Time |
| Chat Report | Active Chat Rooms, Messages Sent, Attachments Sent, Reported Chats |
| Asset Reported Comments Report | Total Comments, Reported Comments, Hidden Comments, Top Commented Assets |
| Search Report | Top Search Keywords, Top Filter Combinations, Watch Alert Volume by Brand |
| Watch Alert Report | Total Active Alerts, Trigger Rate (Alert → Click), Top Alert Brands |
| Notification Report | Sent, Delivered, Opened, Failed, Retry Count by Notification Type |
| Account Deletion Report | Requests, Blocked, Archived, Avg Processing Time |

**Export:** CSV และ Excel สำหรับทุก Report  
**Date Range Filter:** ทุก Report มี Date Range Picker (วันนี้ / 7 วัน / 30 วัน / Custom)

---

### 3.11 Push Notification Management

**ฟีเจอร์:**
- สร้าง Broadcast Notification ส่งหาผู้ใช้ทั้งหมดหรือกลุ่มเป้าหมาย
- ดู History การส่งทั้งหมด
- ดู Delivery Stats: Sent / Delivered / Opened / CTR

**กลุ่มเป้าหมาย (Target Audience):**
| กลุ่ม | คำอธิบาย |
|---|---|
| All Users | ผู้ใช้ทั้งหมด |
| Users with Watch Alert (Brand) | ผู้ใช้ที่มี Watch Alert เฉพาะ Brand |
| Users Active in last N days | ผู้ใช้ที่ใช้งานใน N วันล่าสุด |
| Users with For Sale Assets | ผู้ใช้ที่มีสินทรัพย์สถานะ Sale อยู่ |
| Users with Show | ผู้ใช้ที่มีสินทรัพย์สถานะ Show |

**ฟิลด์:**
| ฟิลด์ | ประเภท | บังคับ |
|---|---|---|
| Title | Text (สูงสุด 50 ตัวอักษร) | ✓ |
| Body | Text (สูงสุด 150 ตัวอักษร) | ✓ |
| Deep Link | URL / FO Screen Path | - |
| Image | Image URL | - |
| Target Audience | Multi-select | ✓ |
| Schedule | Send Immediately / Scheduled | ✓ |
| Schedule Date-Time | DateTime Picker | บังคับหาก Schedule = Scheduled |

---

### 3.12 Admin Access & Permissions

BO uses exactly one admin account type: `Admin`. There are no BO sub-types. The former multi-column policy catalog is replaced by module/action policy.

| Module | Admin access rule |
|---|---|
| Dashboard | Admin can view operational overview according to data sensitivity policy. |
| User Management | Admin can view/manage users with confirmation, reason, sensitive-data masking, and audit for high-risk actions. |
| Asset Management | Admin can review and change assets with FO-impact, sensitive-data, confirmation, reason, and audit controls. |
| Articles / Categories | Admin can create, edit, preview, publish, schedule, archive, manage categories, and audit content actions. Banners are future scope for non-article campaigns/promotions only. |
| Market Data / Directory | Admin can manage watch data with source, inactive/restore, and audit controls; Directory entries are future/postponed from Phase 1. |
| Reports / Notifications / Audit / Settings | Admin can operate these modules according to export, approval, sensitive-data, and high-risk setting policies. |
## 4. BO Authentication

- Login ด้วย Email/Password เท่านั้น (ไม่รองรับ Apple หรือ Google SSO — เฉพาะ Internal Use)
- **Email OTP verification บังคับ** สำหรับ Admin หลังผ่าน email/password
- ไม่ใช้แอปยืนยันตัวตนภายนอกสำหรับ BO V1
- Session หมดอายุใน **8 ชั่วโมง** (Idle) หรือ **24 ชั่วโมง** (Max)
- IP Whitelist: ตัวเลือกสำหรับ Production Environment
- Failed Login เกิน 5 ครั้ง → Lock Account 15 นาที
- บันทึก Audit Log ทุก Login / Logout / Failed Login

---

## 5. BO Technical Requirements

- **Framework:** React / Next.js
- **Responsive:** รองรับ desktop, tablet และ mobile-width browser โดย optimize workflow หลักสำหรับหน้าจอใหญ่
- **Authentication:** JWT + Refresh Token + Email OTP verification
- **API:** REST API ชุดเดียวกับ FO แต่ใช้ Admin-only Endpoints (Bearer Token + Admin Access Check)
- **Rich Text Editor:** TipTap หรือ Quill
- **File Upload:** รองรับ Drag & Drop, Preview ก่อน Upload
- **Data Table:** Sortable, Paginated, Searchable, Export
- **Map:** Future only for Directory Location Picker if Directory scope is reopened

---

## 6. Audit Log

ทุก Action ของ Admin ทุกคนถูกบันทึกใน Audit Log โดยอัตโนมัติ:

| ฟิลด์ | คำอธิบาย |
|---|---|
| Admin ID | รหัส Admin ที่ทำ Action |
| Admin Access | Admin access ของ Admin ขณะนั้น |
| Action Type | Create / Update / Delete / Approve / Reject / Suspend / Ban / Flag / Send Notification / etc. |
| Target Entity Type | User / Asset / Article / Brand / Model / Price / Directory / Notification / SpecOption / SpecOptionGroup |
| Target Entity ID | ID ของ Entity ที่ถูกกระทำ |
| Before Value | ค่าก่อนแก้ไข (JSON) — สำหรับ Update |
| After Value | ค่าหลังแก้ไข (JSON) — สำหรับ Update |
| IP Address | IP ของ Admin |
| Timestamp | วันเวลาที่ทำ Action (UTC+7) |

**การเข้าถึง Audit Log:** Admin access policy, sensitive-payload policy และ export policy เป็นตัวกำหนด
**Retention:** เก็บ Audit Log อย่างน้อย 1 ปี

---

## 7. ความสัมพันธ์ระหว่าง BO และ FO

| Action ใน BO | ผลที่เกิดบน FO |
|---|---|
| Publish Article | บทความปรากฏบนหน้า Board ทันที |
| Schedule Article | บทความปรากฏตาม Publish Date ที่กำหนด |
| Unpublish / Archive Article | บทความหายจาก Board ทันที |
| Publish newer eligible Article | Board Main recalculates automatically: newest eligible article becomes Main Hero; remaining eligible articles feed Trending Now and Journal Board preview by deterministic rules |
| Update Price Index | ราคาใน Watch Price Index และ Asset Value Dashboard ของ User อัปเดต |
| Add Watch Brand / Model | ข้อมูลปรากฏใน Autocomplete ขณะ Add Asset และ Filter ใน Search |
| Add Directory Item (Active) | Future/postponed; ร้านค้า/บริการปรากฏในเมนู FO เฉพาะเมื่อ Directory scope ถูกเปิดใช้งาน |
| Suspend User | User Login ไม่ได้, เห็น Error Message |
| Remove Asset | สินทรัพย์หายจาก Feed / Profile ของเจ้าของ |
| Force Status → Hide | สินทรัพย์หายจาก Feed แต่เจ้าของยังเห็นใน Profile ตัวเอง |
| Status → Sold | ไม่ใช่ Admin quick action; ต้องมาจาก Owner หรือ transaction/offer flow แล้วสินทรัพย์ย้ายไปแท็บ Sold ในโปรไฟล์เจ้าของ, ปุ่ม Edit หายไป เหลือแค่ Sale History |
