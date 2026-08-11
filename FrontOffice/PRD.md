# PRD — แอปพลิเคชัน ตึกแดง (Tuk Daeng)
**เวอร์ชัน:** 1.0  
**วันที่:** พฤษภาคม 2568  
**เจ้าของเอกสาร:** Business Analyst Team  
**สถานะ:** Draft

---

## 1. ภาพรวมผลิตภัณฑ์

### 1.1 วิสัยทัศน์
ตึกแดง (Tuk Daeng) คือแพลตฟอร์ม Marketplace และ Community สำหรับนักสะสมนาฬิกาหรูในประเทศไทย ที่รวบรวมฟีเจอร์การซื้อขาย, การแสดงคอลเลกชัน, บทความความรู้, การแจ้งเตือนราคาตลาด และระบบแชทในแอปพลิเคชันเดียว

### 1.2 กลุ่มผู้ใช้เป้าหมาย
| กลุ่ม | คำอธิบาย |
|---|---|
| **ผู้ใช้ (User)** | ทุกคนที่สมัครสมาชิกมี Role เดียวกันหมด สามารถทำได้ทุกอย่างในคนเดียว ทั้งลงขาย, ซื้อ, เสนอราคา, แสดงคอลเลกชัน หรือจะซ่อนคอลเลกชันไว้ส่วนตัว โดยไม่ต้องเปลี่ยน Role |
| **แอดมิน (Admin)** | ทีมงานตึกแดงที่จัดการระบบผ่าน Back Office เท่านั้น |

> **หมายเหตุ:** คำว่า "Owner" ในเอกสารนี้หมายถึงผู้ใช้ในฐานะเจ้าของสินทรัพย์ชิ้นนั้น ๆ และคำว่า "Viewer" หมายถึงผู้ใช้คนอื่นที่กำลังดูสินทรัพย์ของผู้อื่น ไม่ได้หมายถึง Role ที่แตกต่างกัน

### 1.3 แพลตฟอร์ม
- iOS และ Android (Mobile Application)
- Back Office: Web Application (สำหรับ Admin)

---

## 2. สถาปัตยกรรมฟีเจอร์หลัก

```
ตึกแดง App
├── Auth (ยืนยันตัวตน)
├── Feed (หน้าหลัก/Marketplace)
├── Chat (ระบบแชท)
├── Board (กระดานข่าว/บทความ)
├── Alerts (การแจ้งเตือน)
└── Profile (โปรไฟล์ผู้ใช้)
    ├── Asset Management (จัดการสินทรัพย์)
    ├── Collection Show
    └── Asset Value Tracker
```

---

## 3. ฟีเจอร์โดยละเอียด

### 3.1 Authentication (ระบบยืนยันตัวตน)

#### 3.1.1 Sign Up (สมัครสมาชิก)
**วิธีการสมัคร 3 ช่องทาง:**

| ช่องทาง | รายละเอียด |
|---|---|
| **Email / Password** | กรอก Email, Password, Confirm Password + ยืนยัน OTP |
| **Sign up with Apple** | ใช้ Apple ID (Sign in with Apple) — รองรับบน iOS |
| **Sign up with Google** | ใช้ Google Account |

**ความต้องการ (กรณี Email / Password):**
- ผู้ใช้ต้องกรอก Email, Password, Confirm Password
- ต้องยืนยัน Email ด้วย OTP 6 หลักที่ส่งไปยัง Email
- OTP หมดอายุภายใน 30 นาที
- Password ต้องมีความยาวอย่างน้อย 8 ตัวอักษร พร้อมตัวเลขหรือสัญลักษณ์
- ผู้ใช้ต้องติ๊ก "I agree to Terms of Use and Privacy Policy" ก่อนสมัคร (ทุกช่องทาง)

**Business Rules:**
- 1 Email สามารถสมัครได้เพียง 1 บัญชีเท่านั้น ไม่ว่าจะมาจากช่องทางใด
- หาก Email ของ Apple / Google ซ้ำกับบัญชี Email/Password ที่มีอยู่แล้ว ระบบแสดง error และแนะนำให้ Sign In แทน
- Apple Sign In อาจส่ง Private Relay Email (ที่ Apple สร้างขึ้น) ซึ่งระบบต้องรองรับ
- Email จาก SSO (Apple / Google) ไม่ต้องผ่านขั้นตอนยืนยัน OTP
- Email ไม่สามารถเปลี่ยนได้หลังยืนยันแล้ว
- หากไม่ได้รับ OTP (กรณี Email/Password) สามารถ Resend ได้

#### 3.1.2 Sign In (เข้าสู่ระบบ)
**วิธีการเข้าสู่ระบบ 3 ช่องทาง:**

| ช่องทาง | รายละเอียด |
|---|---|
| **Email / Password** | กรอก Email และ Password |
| **Sign in with Apple** | ใช้ Apple ID — รองรับบน iOS (Apple Guideline บังคับต้องมีหากแอปมี SSO อื่น) |
| **Sign in with Google** | ใช้ Google Account |

**ความต้องการ (กรณี Email / Password):**
- กรอก Email และ Password
- กรณีลืมรหัสผ่านกดที่ "Forgot password?"
- ปุ่ม Sign In จะ Active เมื่อกรอก Email และ Password แล้วเท่านั้น

**Business Rules:**
- กรณี Email หรือ Password ผิด แสดง error ใต้ช่อง Password ว่า "Incorrect email or password" พร้อม Highlight ขอบ Field สีแดง
- บัญชีที่สมัครด้วย Apple / Google ไม่สามารถ Sign In ด้วย Email/Password ได้ (และในทางกลับกัน) — ระบบแนะนำช่องทางที่ถูกต้อง
- บัญชีที่ถูก Suspend จะเห็น error แจ้งเหตุผลและช่องทางติดต่อ Support

#### 3.1.3 Reset Password (รีเซ็ตรหัสผ่าน)
**ความต้องการ:**
- กรอก Email เพื่อรับลิงก์รีเซ็ต
- ลิงก์รีเซ็ตหมดอายุใน 30 นาที
- กรอก New Password และ Confirm New Password
- Password ใหม่ต้องตรงกันทั้ง 2 ช่อง
- เมื่อสำเร็จแสดงหน้า "Password updated" พร้อมปุ่ม Sign In

---

### 3.2 Feed (หน้าหลัก Marketplace)

**ความต้องการ:**
- แสดงรายการนาฬิกาที่ลงขายจากผู้ขายทั้งหมด
- แบ่ง Tab: All / Following / Favorites
- แต่ละรายการแสดง: รูปนาฬิกา, ยี่ห้อ, รุ่น, Reference No., ราคา (THB), สภาพ, กล่องและเอกสาร, จำนวน Likes และ Comments
- แสดงข้อมูลผู้ขาย: Avatar, ชื่อ, ปุ่ม Follow
- รองรับการ Like รายการ (กดหัวใจ)
- ปุ่ม "Watch Alert" เพื่อตั้งการแจ้งเตือน
- ปุ่ม "+" เพื่อเพิ่มสินทรัพย์ใหม่

**Business Rules:**
- Tab "Following" แสดงเฉพาะสินทรัพย์จากผู้ขายที่ผู้ใช้ติดตาม
- Tab "Favorites" แสดงรายการที่กด Like ไว้
- "Price on Request" แสดงเมื่อผู้ขายไม่ระบุราคา

---

### 3.3 Search & Filter (ค้นหาและกรองข้อมูล)

**ความต้องการ:**
- ช่องค้นหาด้วย Keyword พร้อม Autocomplete (แสดงยี่ห้อ, รุ่น ที่เกี่ยวข้อง)
- ระบบกรองข้อมูลหลายมิติ:
  - Brand Name (เลือกหลายยี่ห้อ)
  - Model (เลือกหลายรุ่น)
  - Price Range (Min-Max Slider)
  - Year of Production
  - Reference Number
  - Delivery Contents (กล่องต้นฉบับ, เอกสาร)
  - Condition (สภาพ)
  - Case Size
  - Movement
  - Dial Color
  - Strap/Bracelet
- แสดงจำนวน results ที่กรองแล้ว
- ปุ่ม "Apply Filters" และ "Clear Filters"
- รองรับ Sort By: Relevance, Price (Low to High), Price (High to Low), Newest, Popularity

**Watch Alert จาก Search:**
- บันทึก Criteria การค้นหาปัจจุบันเป็น Watch Alert ได้
- ตั้งชื่อ Alert และเปิด/ปิด Notification

---

### 3.4 Detail Asset (หน้ารายละเอียดสินทรัพย์)

#### สำหรับผู้ดู (Viewer — ผู้ใช้คนอื่นที่ไม่ใช่เจ้าของ)
**ความต้องการ:**
- Gallery รูปภาพ (Swipe ดูรูปได้)
- สถานะที่มองเห็นได้: **Sale** และ **Collection Show** เท่านั้น (ไม่เห็น Hide และ Sold)
- ชื่อ Brand, Model, Reference No.
- ข้อมูลเจ้าของสินทรัพย์ + ปุ่ม Follow
- คำอธิบาย (Description)
- Technical Specifications:
  - Brand, Model, Reference No., Year of Production
  - Condition, Delivery Contents
  - Case Size, Thickness, Case Material
  - Movement, Dial Color, Dial / Strap Type
- Comments Section: แสดง Comment, Reply, Like Comment
- ราคา THB
- ปุ่ม "Make an Offer" และ "Contact seller"

**Make an Offer:**
- กรอกราคาที่ต้องการเสนอ
- เพิ่ม Message ถึงเจ้าของ
- กด "Send offer" → แสดง popup "Offer Sent Successfully" พร้อมปุ่ม "Go to chat"

#### สำหรับเจ้าของ (Owner — ผู้ใช้ที่เป็นเจ้าของสินทรัพย์ชิ้นนั้น)
**ความต้องการ:**
- มองเห็นสินทรัพย์ได้ **ทุกสถานะ** ไม่ว่าจะเป็น Sale, Collection Show, Collection Hide และ **Sold**
- ไม่แสดงปุ่ม Follow (ไม่ Follow ตัวเอง)
- ข้อมูลทุกส่วนเหมือน Viewer รวมถึง Comments

**ปุ่ม Action ตามสถานะ:**

| สถานะสินทรัพย์ | ปุ่มที่แสดง | หมายเหตุ |
|---|---|---|
| **Sale** | `Edit` | แก้ไขข้อมูลสินทรัพย์ |
| **Collection Show** | `Edit` | แก้ไขข้อมูลสินทรัพย์ |
| **Collection Hide** | `Edit` | แก้ไขข้อมูลสินทรัพย์ |
| **Sold** | `Sale History` | ดูประวัติการขาย ไม่สามารถแก้ไขได้ |

> **Business Rule:** สินทรัพย์ที่มีสถานะ Sold ไม่สามารถ Edit ข้อมูลหลักได้อีก มีเพียงปุ่ม "Sale History" สำหรับดูรายละเอียดการขาย (ผู้ซื้อ, ราคา, วิธีชำระเงิน, วันที่)

---

### 3.5 Asset Management (จัดการสินทรัพย์)

#### 3.5.1 Add New Asset (เพิ่มสินทรัพย์ใหม่)
**ความต้องการ:**
- Gallery: อัปโหลดรูปได้สูงสุด 10 รูป
- Basic Information: Brand, Model & Series, Reference No., Year
- Condition: New / Used (Very Good) / Used (Good) / Used (Fair)
- Scope of Delivery: Original Box ✓, Original Paper ✓
- Specifications: Case Size, Thickness, Case Material, Movement, Dial Color, Strap/Bracelet Type

Market Data / Specification storage rule:

- Brand, Model และ Reference No. ใช้ Market Data สำหรับ autocomplete, structured selection และ prefill
- ระบบต้องเก็บ relation id ไป Market Data เมื่อ match ได้ พร้อม snapshot text ของ Brand / Model / Reference ใน Asset
- Year, Condition, Scope of Delivery, Case Size, Thickness, Case Material, Movement, Dial Color และ Strap/Bracelet Type เป็นข้อมูลจริงของ Asset ที่ Owner กรอก ต้องเก็บกับ Asset Specification
- Provider/API sync ห้าม overwrite specification ที่ Owner save แล้ว
- Condition, Delivery, Case Material, Movement, Dial Color และ Strap/Bracelet Type ต้องใช้ internal option master เดียวกันใน Add/Edit Asset, Asset Detail และ Search/Filter
- Commerce & Curation: ราคา, Description
- Status: Sale / Show / Hide
- Sale Status: Available / Sold
- Add/Edit required field rule by status:
  - Sale: Required = Photos 1-10, Brand, Model & Series, Condition, Description, Status; Asking Price is optional and buyer-facing surfaces must show `Price on request` when empty
  - Show: Required = Photos 1-10, Brand, Model & Series, Status; Asking Price, Condition, Description and specifications are optional and price must not be shown on public surfaces
  - Hide: Required = Photos 1-10, Brand, Status; Model & Series, Asking Price, Condition, Description and specifications are optional and price must not be shown on public surfaces
  - Every optional field that the user fills, selects, or uploads must still pass validation before save
- Provenance (ประวัติสินทรัพย์):
  - Required: Purchase Price (THB), must be greater than 0
  - Optional: Purchase Date, Purchase From, All Equipment & Accessories, Proof of Payment, Note
  - Optional fields ต้อง validate เมื่อ user กรอกหรืออัปโหลด เช่น date ห้ามเป็นอนาคต, text ห้ามเป็นค่าว่างล้วน/เกินความยาว, upload ต้องผ่าน type/size/count limits
- Consignment (ฝากขาย):
  - Required: Full Name, Phone Number, Asking Price (THB), must be greater than 0
  - Optional: Line/IG/Facebook, Email, Payout Method, Consignment Date, Consignment Duration, Commission %, Minimum Acceptable Price, All Equipment & Accessories, Proof of Payment / Documentation, Note
  - Payout Method, Consignment Date, Consignment Duration และ Commission % ไม่ required ใน FO Add Provenance V1 เพราะทีมงานอาจ confirm ภายหลัง
  - Optional fields ต้อง validate เมื่อ user กรอกหรืออัปโหลด เช่น phone/email format, date ห้ามเป็นอนาคต, duration > 0, commission 0-100, minimum acceptable price <= asking price, upload ต้องผ่าน type/size/count limits
- Save: แสดง Confirmation Dialog ก่อน Save

#### 3.5.2 Edit Asset
- แก้ไขข้อมูลสินทรัพย์ทุกฟิลด์
- แก้ไข Status ระหว่าง Sale / Show / Hide
- บันทึก Sale History: Required = Sale Date, Sale Price, Payment Method; Optional = Buyer Name, Buyer Phone, Buyer Contact, Equipment & Accessories, Proof of Payment, Note
- Sale History validation: Sale Price ต้องมากกว่า 0, Sale Date ห้ามเป็นวันที่อนาคตและห้ามก่อน Purchase Date ถ้ามี, Payment Method ต้องเลือกจาก Bank Transfer / Cash / PromptPay / Other, optional text/contact/upload ต้อง validate เมื่อมีการกรอกหรืออัปโหลด

---

### 3.6 Chat (ระบบแชท)

**ความต้องการ:**
- รายการแชทแบ่งเป็น "All" และ "Incoming Offers"
- ค้นหาแชทได้
- Tab "Incoming Offers" แสดงการเสนอราคาที่ยังรอการตอบรับ พร้อมปุ่ม Decline/Accept
- ในห้องแชท:
  - แสดง Asset Card ที่เกี่ยวข้องด้านบน (รูป, ชื่อ, ราคา, ปุ่ม "View detail")
  - Offer Card: แสดงราคาที่เสนอ, ปุ่ม Decline/Accept (สำหรับเจ้าของ) หรือ "Your offer" (สำหรับผู้เสนอ)
  - กรณี Accept → แสดงสถานะ "Offer Accepted" + "The buyer has been notified"
  - กรณี Decline → แสดงสถานะ "Offer Declined" + "The buyer has been notified"
  - ส่ง Text, รูปภาพ, ไฟล์
  - Long Press ข้อความ → ลบแชท (Confirm ก่อนลบ)
- Delete Chat: ยืนยัน dialog ก่อนลบ
- Delete Chat ซ่อนห้องจาก inbox ฝั่งผู้กดเท่านั้น ไม่ลบประวัติฝั่ง server หรือคู่สนทนา
- Chat room menu มี View profile, Mute notifications, Delete chat, Report user, Block user

---

### 3.7 Board (กระดานข่าว/บทความ)

**ความต้องการ:**
- หน้าหลัก Board แสดง:
  - บทความ Feature ขนาดใหญ่ด้านบน (Feature Article)
  - หมวด "Trending Now"
  - หมวด "Journal Board"
  - เมนูแยกตามหมวดหมู่: Watch Brands, Watch 101, Watch Apparel, Watch Events
- หน้าอ่านบทความ:
  - รูปปก + ชื่อบทความ + ผู้เขียน + วันที่ + เวลาอ่าน
  - เนื้อหาบทความ
  - Quote Highlight
  - ปุ่ม Share และ Like
- ค้นหาบทความตาม Keyword
- Filter ตามหมวดหมู่
- Infinite Scroll แสดงบทความเพิ่มเติม

**Business Rules:**
- บทความถูกสร้างและจัดการโดย Admin ผ่าน Back Office
- ผู้ใช้ทั่วไปอ่าน, Share, Like และ Report article ได้ตาม permission
- Article Comment ไม่อยู่ใน FO V1
- Report article ส่งเข้า Trust & Safety เป็น report type `Board Content` และ target type `Article`
- Report article สำเร็จต้องไม่ทำให้บทความหายทันที

---

### 3.8 Alerts & Notifications (การแจ้งเตือน)

#### 3.8.1 Notification Feed
**ประเภทการแจ้งเตือน:**
| ประเภท | คำอธิบาย | Action |
|---|---|---|
| New Offer | มีผู้เสนอราคาสินทรัพย์ | Decline / Review offer |
| Comment | มีคนคอมเมนต์โพสต์ | ดูโพสต์ |
| New Follower | มีคนติดตาม | Follow back |
| Group Follow | หลายคนติดตามพร้อมกัน | - |
| Like Valuation | คนกด Like การประเมินมูลค่า | - |
| Market Update | ราคาตลาดเปลี่ยนแปลง | - |
| Sale Success | ขายสำเร็จ | - |
| Watch Alert | พบสินค้าตรง Watch Alert | - |

#### 3.8.2 Watch Alert Management
**ความต้องการ:**
- แสดงรายการ Watch Alert ทั้งหมด
- แต่ละ Alert แสดง: ชื่อ, Criteria (Brand, Model, ราคา)
- เปิด/ปิด Notification ต่อ Alert ได้
- Rename Alert
- Delete Alert (พร้อม Confirmation)

---

### 3.9 Profile (โปรไฟล์)

#### 3.9.1 Owner Profile (โปรไฟล์ตัวเอง)
**ความต้องการ:**
- รูปโปรไฟล์, ชื่อ, สถิติ (Followers, Following, Asset Value รวม)
- ปุ่ม "Edit Profile"
- แท็บแสดงสินทรัพย์แยกตามสถานะ (**เจ้าของเห็นทุกสถานะ**):

| แท็บ | สินทรัพย์ที่แสดง |
|---|---|
| **All** (# items) | ทุกชิ้น รวมทุกสถานะ |
| **For Sale** (#) | สินทรัพย์สถานะ Sale |
| **Collection Show** (#) | สินทรัพย์สถานะ Collection Show |
| **Collection Hide** (#) | สินทรัพย์สถานะ Collection Hide (ซ่อนจากผู้อื่น เห็นเฉพาะเจ้าของ) |
| **Sold** (#) | สินทรัพย์ที่ขายไปแล้ว |
| **Asset Value** | Dashboard มูลค่าคอลเลกชัน |

- แท็บ "Asset Value" แสดง:
  - มูลค่ารวม (THB)
  - กราฟแนวโน้มมูลค่า
  - Brand Distribution (แผนภูมิแท่ง)
  - รายการสินทรัพย์แต่ละชิ้นพร้อมราคาซื้อ, มูลค่าปัจจุบัน, % change

> **Business Rule:** แท็บ "Collection Hide" และ "Sold" มองเห็นได้เฉพาะเจ้าของเท่านั้น ผู้ใช้คนอื่นที่เข้าดูโปรไฟล์จะไม่เห็นแท็บเหล่านี้

#### 3.9.2 Viewer Profile (ดูโปรไฟล์ผู้ใช้คนอื่น)
**ความต้องการ:**
- รูปโปรไฟล์, ชื่อ, สถิติ (Followers, Following)
- ปุ่ม Follow / Unfollow
- แท็บที่มองเห็นได้ (**เฉพาะสถานะสาธารณะ**):

| แท็บ | สินทรัพย์ที่แสดง |
|---|---|
| **For Sale** (#) | สินทรัพย์สถานะ Sale เท่านั้น |
| **Collection Show** (#) | สินทรัพย์สถานะ Collection Show เท่านั้น |

> **Business Rule:** สินทรัพย์สถานะ Collection Hide และ Sold จะ**ไม่ปรากฏ**ให้ผู้ใช้คนอื่นเห็นเด็ดขาด

---

### 3.10 Menu & Settings

**เมนูด้านข้าง (Hamburger Menu):**
- Watch Brands
- Watch Price Index
- Watch Shops
- Accessories Shop
- Repair Shop
- Auction Center
- Consignment Center
- Authentication Center
- Community

**Settings:**
- Edit Profile (Username, Phone, Line, Email)
- Language (English / ภาษาไทย)
- Help (ช่องทางติดต่อ)
- About app (Version, company info, Privacy Policy, Terms of Use, Contact support)
- About your account (Date joined, Delete Account)
- Sign Out

---

## 4. Non-Functional Requirements

### 4.1 Performance
- หน้า Feed โหลดภายใน 2 วินาที
- รูปภาพ Lazy Load
- รองรับ Offline Mode บางส่วน (แสดงข้อมูล Cache)

### 4.2 Security
- JWT Token Authentication
- HTTPS ทุก API
- รูปภาพ Proof of Payment เข้าถึงได้เฉพาะเจ้าของ
- ข้อมูล Provenance และ Consignment เป็นข้อมูลส่วนตัว

### 4.3 Localization
- รองรับภาษาไทยและอังกฤษ
- ราคาแสดงในรูปแบบ THB (฿)

### 4.4 Accessibility
- Font size ปรับตามระบบ
- รองรับ Screen Reader

---

## 5. Integration Requirements

| ระบบ | วัตถุประสงค์ |
|---|---|
| **Apple Sign In** | Sign In / Sign Up ด้วย Apple ID (บังคับโดย Apple App Store Guideline หากแอปมี SSO อื่น) |
| **Google OAuth** | Sign In / Sign Up ด้วย Google Account |
| Firebase Cloud Messaging | Push Notifications |
| Image Storage (S3/CDN) | จัดเก็บรูปภาพ |
| Payment Gateway | (Phase 2) |
| Watch Price API | ดึงข้อมูลราคาตลาด |

---

## 6. ขอบเขตที่ไม่รวมใน Phase 1

- ระบบชำระเงินออนไลน์ในแอป
- Video upload
- Live streaming
- Watch Authentication Service ในแอป

---

## 7. Glossary

| คำศัพท์ | ความหมาย |
|---|---|
| Asset | นาฬิกาแต่ละเรือน |
| Provenance | ประวัติและหลักฐานการได้มาของนาฬิกา |
| Consignment | การฝากขายนาฬิกา |
| Watch Alert | การตั้งแจ้งเตือนเมื่อมีนาฬิกาตรงตาม Criteria |
| Collection Show | การแสดงนาฬิกาในคอลเลกชันโดยไม่ขาย |
| Reference No. | รหัสอ้างอิงรุ่นนาฬิกาของผู้ผลิต |
