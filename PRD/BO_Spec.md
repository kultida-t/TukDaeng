# BO Specification — ตึกแดง Back Office System
**เวอร์ชัน:** 1.1  
**วันที่:** พฤษภาคม 2568  
**ผู้ใช้งาน:** Admin และ Super Admin ของระบบตึกแดง  
**อัปเดตจาก:** v1.0 → สอดคล้องกับ FO ล่าสุด (Role ผู้ใช้, Asset Status, Auth SSO, Profile Tabs)

---

## 1. ภาพรวม Back Office

Back Office ของตึกแดงเป็น Web Application สำหรับทีมงาน Admin ในการจัดการทุกด้านของแพลตฟอร์ม ครอบคลุม:
- จัดการผู้ใช้ (ไม่มีการแบ่ง Role ระหว่าง Buyer/Seller — ทุก User มี Role เดียวกัน)
- จัดการและ Moderate สินทรัพย์ทุกสถานะ (Sale / Collection Show / Collection Hide / Sold)
- จัดการ Content บทความที่แสดงบนหน้า Board ใน FO
- จัดการ Watch Brands, Models และ Price Index
- จัดการ Directory ร้านค้า/บริการ ที่แสดงในเมนู FO
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
├── Content Management (จัดการเนื้อหา)
│   ├── Articles (บทความ Board)
│   ├── Categories (หมวดหมู่บทความ)
│   └── Banners
├── Market Data (ข้อมูลตลาด)
│   ├── Watch Brands
│   ├── Watch Models
│   └── Price Index
├── Directory (เมนูเชื่อมโยง FO)
│   ├── Watch Shops
│   ├── Accessories Shops
│   ├── Repair Shops
│   ├── Auction Centers
│   ├── Consignment Centers
│   └── Authentication Centers
├── Reports & Analytics
├── Push Notifications
├── Audit Log
└── Admin Settings
```

---

## 3. รายละเอียดแต่ละ Module

---

### 3.1 Dashboard

**ข้อมูลที่แสดง:**
- จำนวนผู้ใช้ใหม่วันนี้ / สัปดาห์นี้ / เดือนนี้ (พร้อม % เทียบช่วงก่อน)
- จำนวน Active Users (DAU / MAU)
- จำนวนสินทรัพย์ที่เพิ่มใหม่วันนี้ แยกตามสถานะ (Sale / Collection Show / Collection Hide)
- จำนวน Transactions (Offer Accepted) วันนี้
- จำนวน Pending Reports (สินทรัพย์ที่ถูก Flag รอ Review)
- บทความที่เผยแพร่ล่าสุด 3 รายการ
- Watch Alerts ที่ Active ทั้งหมด
- กราฟแนวโน้ม User Growth (30 วัน)
- Top 10 Brand ที่ค้นหามากที่สุด
- Activity Feed ล่าสุด (User Registered, Asset Added, Offer Accepted, User Suspended)

---

### 3.2 User Management

> **สำคัญ:** ผู้ใช้ใน FO ทุกคนมี Role เดียวกัน (User) ไม่มี Buyer / Seller / Collector แยกกัน  
> Admin ใน BO เท่านั้นที่มี Role แตกต่างกัน

**ฟีเจอร์:**
| ฟีเจอร์ | คำอธิบาย |
|---|---|
| ดูรายชื่อผู้ใช้ | ตาราง + Search + Filter ตาม Status, Auth Method, Date Joined |
| ดูโปรไฟล์ผู้ใช้ | ข้อมูลทั้งหมด, สินทรัพย์ทุกสถานะ (Sale/Collection Show/Collection Hide/Sold), ประวัติ Activity |
| Suspend User | ระงับบัญชีชั่วคราว + บังคับระบุเหตุผล |
| Ban User | ระงับบัญชีถาวร + บังคับระบุเหตุผล |
| Unsuspend / Unban | คืนสถานะปกติ |
| Delete User | ลบบัญชี Soft Delete (ข้อมูลยังอยู่ใน DB) |
| Reset Password | ส่งลิงก์ Reset ให้ผู้ใช้ทาง Email — ใช้ได้เฉพาะบัญชี Email/Password เท่านั้น (ไม่ใช้กับ Apple/Google SSO) |
| ดู Login History | ประวัติการเข้าสู่ระบบ (Auth Method, Device, IP, Timestamp) |
| ดู Auth Method | ระบุว่าบัญชีนี้สมัครด้วยวิธีใด: Email/Password, Apple Sign In, Google Sign In |
| Export | Export รายชื่อผู้ใช้เป็น CSV |

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
| **Collection Show** | เจ้าของ + ผู้ใช้ทั่วไป | แสดงในโปรไฟล์เจ้าของ ไม่ขาย |
| **Collection Hide** | เจ้าของเท่านั้น | ซ่อนจากสาธารณะ |
| **Sold** | เจ้าของเท่านั้น | ขายไปแล้ว ไม่สามารถ Edit ได้ |

**ฟีเจอร์ Admin:**
| ฟีเจอร์ | คำอธิบาย |
|---|---|
| ดูรายการสินทรัพย์ทั้งหมด | Filter ตาม Status (Sale/Collection Show/Collection Hide/Sold/Flagged), Brand, ราคา, Owner |
| ดูรายละเอียดสินทรัพย์ | ข้อมูลครบทุกฟิลด์ รวม Provenance, Consignment Info, Sale History |
| Force Change Status | เปลี่ยนสถานะสินทรัพย์ได้ทุกสถานะ (เฉพาะ Super Admin / Moderator) |
| Remove Asset | ลบสินทรัพย์ที่ละเมิด Policy (Soft Delete) |
| Edit Asset Info | แก้ไขข้อมูลสินทรัพย์ได้ (เฉพาะ Super Admin) รวมถึงสถานะ Sold |
| Flag / Unflag Asset | ทำ Flag เพื่อ Review หรือยกเลิก Flag |
| ดู User Reports | ดูรายงานที่ถูก Report โดยผู้ใช้ FO พร้อมเหตุผล |
| ดู Provenance | ดูข้อมูล Provenance และ Proof of Payment (เฉพาะ Super Admin) |
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
| Status | Sale / Collection Show / Collection Hide / Sold |
| Condition | สภาพ |
| Date Added | วันที่เพิ่ม |
| Flagged | Flag / — |

---

### 3.4 Content Management — Articles

นี่คือ Module หลักสำหรับสร้าง Content ที่แสดงบนหน้า **Board** ใน FO  
ผู้ใช้ FO อ่านได้อย่างเดียว — Admin เท่านั้นที่สร้างและจัดการบทความได้

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
| Featured Article | Toggle | - | แสดงเป็น Feature Article ขนาดใหญ่บนหน้า Board |
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

**ฟีเจอร์:**
- จัดการ Banner ที่แสดงบน Feed และ Board ใน FO
- กำหนด Position: Top Banner / Mid Banner
- กำหนด Target Link (Deep Link ไปยัง Screen ใน FO หรือ External URL)
- กำหนด Start Date / End Date
- Preview Banner ก่อน Activate

---

### 3.6 Market Data — Watch Brands

**ฟีเจอร์:**
- เพิ่ม / แก้ไข / ลบ Brand นาฬิกา
- อัปโหลด Logo Brand
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
- เพิ่ม / แก้ไข / ลบ Model ในแต่ละ Brand
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
- อัปเดต Market Price Index ของแต่ละ Model / Reference
- ระบุแหล่งที่มา (Source URL)
- กำหนดช่วงราคา (Min / Max THB)
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
| Asset Report | Assets by Status (Sale/Collection Show/Collection Hide/Sold), Assets by Brand, Avg Price, New Assets per Day |
| Transaction Report | Offers Made, Offers Accepted, Offers Declined, Acceptance Rate, Avg Deal Value |
| Content Report | Article Views, Top 10 Articles, Category Performance, Avg Read Time |
| Search Report | Top Search Keywords, Top Filter Combinations, Watch Alert Volume by Brand |
| Watch Alert Report | Total Active Alerts, Trigger Rate (Alert → Click), Top Alert Brands |

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
| Users with Collection Show | ผู้ใช้ที่มีสินทรัพย์สถานะ Collection Show |

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

### 3.12 Admin Role & Permissions

> **หมายเหตุ:** Role ใน BO ไม่เกี่ยวข้องกับ Role ใน FO  
> ผู้ใช้ FO ทุกคนมี Role เดียวกัน (User) — Role ที่ระบุด้านล่างนี้ใช้เฉพาะ Admin ใน BO เท่านั้น

| Role | สิทธิ์ที่มี |
|---|---|
| **Super Admin** | ทุกสิทธิ์ รวมถึงลบ User, Edit/Delete Asset ทุกสถานะ (รวม Sold), ดู Provenance, จัดการ Admin Accounts |
| **Content Admin** | จัดการ Articles, Categories, Banners |
| **Moderator** | ดู / Flag / Unflag / Remove Assets, ดู User Reports, ดู Reports |
| **Support Admin** | ดู User Profiles, ดู Login History, Reset Password (เฉพาะ Email/Password Account), ตอบ Help |
| **Market Admin** | จัดการ Watch Brands, Watch Models, Price Index, Directory |

**ตารางสรุปสิทธิ์:**
| Module | Super Admin | Content Admin | Moderator | Support Admin | Market Admin |
|---|---|---|---|---|---|
| Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ |
| User Management | Full | View Only | View Only | Partial* | — |
| Asset Management | Full | — | Moderate** | — | — |
| Articles | Full | Full | — | — | — |
| Banners | Full | Full | — | — | — |
| Market Data | Full | — | — | — | Full |
| Directory | Full | — | — | — | Full |
| Reports | Full | Content Only | Asset/User | — | Market Only |
| Notifications | Full | — | — | — | — |
| Admin Settings | Full | — | — | — | — |
| Audit Log | Full | — | — | — | — |

*Support Admin: ดูได้, Reset Password (Email เท่านั้น), ไม่ Suspend/Ban  
**Moderator: Flag/Unflag/Remove เท่านั้น ไม่ Edit

---

## 4. BO Authentication

- Login ด้วย Email/Password เท่านั้น (ไม่รองรับ Apple หรือ Google SSO — เฉพาะ Internal Use)
- **Two-Factor Authentication (2FA) บังคับ** สำหรับ Super Admin และ Content Admin
- 2FA แนะนำสำหรับ Role อื่น (ไม่บังคับ)
- Session หมดอายุใน **8 ชั่วโมง** (Idle) หรือ **24 ชั่วโมง** (Max)
- IP Whitelist: ตัวเลือกสำหรับ Production Environment
- Failed Login เกิน 5 ครั้ง → Lock Account 15 นาที
- บันทึก Audit Log ทุก Login / Logout / Failed Login

---

## 5. BO Technical Requirements

- **Framework:** React / Next.js
- **Responsive:** รองรับหน้าจอ 1280px ขึ้นไป (Desktop-first)
- **Authentication:** JWT + Refresh Token + 2FA (TOTP)
- **API:** REST API ชุดเดียวกับ FO แต่ใช้ Admin-only Endpoints (Bearer Token + Role Check)
- **Rich Text Editor:** TipTap หรือ Quill
- **File Upload:** รองรับ Drag & Drop, Preview ก่อน Upload
- **Data Table:** Sortable, Paginated, Searchable, Export
- **Map:** Google Maps API (สำหรับ Directory Location Picker)

---

## 6. Audit Log

ทุก Action ของ Admin ทุกคนถูกบันทึกใน Audit Log โดยอัตโนมัติ:

| ฟิลด์ | คำอธิบาย |
|---|---|
| Admin ID | รหัส Admin ที่ทำ Action |
| Admin Role | Role ของ Admin ขณะนั้น |
| Action Type | Create / Update / Delete / Approve / Reject / Suspend / Ban / Flag / Send Notification / etc. |
| Target Entity Type | User / Asset / Article / Brand / Model / Price / Directory / Notification |
| Target Entity ID | ID ของ Entity ที่ถูกกระทำ |
| Before Value | ค่าก่อนแก้ไข (JSON) — สำหรับ Update |
| After Value | ค่าหลังแก้ไข (JSON) — สำหรับ Update |
| IP Address | IP ของ Admin |
| Timestamp | วันเวลาที่ทำ Action (UTC+7) |

**การเข้าถึง Audit Log:** Super Admin เท่านั้น  
**Retention:** เก็บ Audit Log อย่างน้อย 1 ปี

---

## 7. ความสัมพันธ์ระหว่าง BO และ FO

| Action ใน BO | ผลที่เกิดบน FO |
|---|---|
| Publish Article | บทความปรากฏบนหน้า Board ทันที |
| Schedule Article | บทความปรากฏตาม Publish Date ที่กำหนด |
| Unpublish / Archive Article | บทความหายจาก Board ทันที |
| Set Featured Article = ON | บทความแสดงเป็น Feature Article ขนาดใหญ่ด้านบน Board |
| Update Price Index | ราคาใน Watch Price Index และ Asset Value Dashboard ของ User อัปเดต |
| Add Watch Brand / Model | ข้อมูลปรากฏใน Autocomplete ขณะ Add Asset และ Filter ใน Search |
| Add Directory Item (Active) | ร้านค้า/บริการปรากฏในเมนู FO |
| Suspend User | User Login ไม่ได้, เห็น Error Message |
| Remove Asset | สินทรัพย์หายจาก Feed / Profile ของเจ้าของ |
| Force Status → Collection Hide | สินทรัพย์หายจาก Feed แต่เจ้าของยังเห็นใน Profile ตัวเอง |
| Force Status → Sold | สินทรัพย์ย้ายไปแท็บ Sold ในโปรไฟล์เจ้าของ, ปุ่ม Edit หายไป เหลือแค่ Sale History |

