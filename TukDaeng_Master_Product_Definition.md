# Tuk Daeng Master Product Definition

**Document Type:** Master Product Definition / PRD Baseline  
**Source Documents:** `PRD.md`, `FO_Functional_PRD.md`  
**Purpose:** ใช้เป็นหลักยึดกลางก่อนแตกเป็น Functional PRD รายโมดูล  
**Status:** Draft for Dev & QA Review

## 1. Product Definition

Tuk Daeng เป็น Mobile Application สำหรับ Marketplace Community ของนักสะสมนาฬิกาหรูในประเทศไทย

ระบบออกแบบมาเพื่อ:

- ให้ผู้ซื้อค้นหาและติดตามนาฬิกาที่สนใจได้ง่าย
- ให้ผู้ขายลงขายและบริหาร Asset ของตัวเองได้
- ให้ผู้ใช้เก็บและแสดงคอลเลกชันนาฬิกาของตัวเองได้
- ให้ผู้ใช้พูดคุย เสนอราคา ติดตามผู้ขาย และตั้ง Watch Alert ได้
- ให้ Admin ตรวจสอบเนื้อหา Report และบริหารระบบผ่าน Back Office

ระบบนี้ไม่ใช่:

- Social Network เต็มรูปแบบ
- E-commerce ที่มีการชำระเงินในแอป
- ระบบประมูลหรือ Live Selling ใน Phase 1
- ระบบยืนยันนาฬิกาในแอปใน Phase 1

## 2. Platforms

| Platform | Scope |
| --- | --- |
| iOS | Front Office Mobile App |
| Android | Front Office Mobile App |
| Web Back Office | Admin ใช้จัดการระบบและตรวจสอบ Report |

## 3. User Model

### User

ผู้ใช้ทั่วไปมี Role เดียวกันทั้งหมดหลังสมัครสมาชิก ไม่แยก Buyer / Seller / Collector เป็นคนละ Role

User เดียวกันสามารถ:

- ซื้อหรือค้นหานาฬิกา
- ลงขาย Asset
- แสดงคอลเลกชัน
- ซ่อนคอลเลกชัน
- เสนอราคา
- แชท
- Follow ผู้ใช้คนอื่น
- Like และ Comment
- ตั้ง Watch Alert

### Owner

Owner คือ User ในฐานะเจ้าของ Asset ชิ้นนั้น ไม่ใช่ Role แยกต่างหาก

Owner สามารถเห็น Asset ของตัวเองทุกสถานะ:

- Sale
- Show
- Hide
- Sold

### Viewer

Viewer คือ User หรือ Guest ที่กำลังดู Asset หรือ Profile ของคนอื่น

Viewer เห็นเฉพาะ Asset ที่เป็น Public:

- Sale
- Show

### Guest

Guest คือผู้ใช้ที่ยังไม่ Login

Guest ดูได้:

- Feed
- Search Result
- Asset Detail ที่เป็น Public
- Public Profile
- Like Count
- Comment Count
- Full Screen Image

Guest ใช้งานไม่ได้:

- Like
- Follow
- Comment
- Chat
- Make Offer
- Favorites
- Following
- Watch Alert
- Add / Edit / Delete Asset

เมื่อ Guest ใช้งาน Feature ที่ต้อง Login ต้องแสดง Global Login Required Dialog

### Admin

Admin ใช้งานผ่าน Back Office เท่านั้น

Admin รับผิดชอบ:

- ตรวจสอบ Report
- Moderation
- จัดการ Board Content
- จัดการ User / Asset ตาม policy
- ดำเนินการภายใน 24 ชั่วโมงสำหรับ Report ที่เข้ามา

## 4. Canonical Terminology

| Canonical Term | Meaning |
| --- | --- |
| Asset | นาฬิกาแต่ละเรือนในระบบ |
| Sale | Asset ที่เปิดขายและ Public |
| Show | Asset ที่แสดงเป็นคอลเลกชัน Public แต่ไม่ได้ขึ้น Marketplace |
| Hide | Asset ที่ซ่อน เห็นเฉพาะ Owner |
| Sold | Asset ที่ขายแล้ว เห็นเฉพาะ Owner |
| Owner Profile | โปรไฟล์ของ User เอง เห็น Asset ตัวเองทุกสถานะ |
| Public Profile | โปรไฟล์ของ User อื่น เห็นเฉพาะ Asset สถานะ Sale และ Show |
| Watch Alert | การตั้งเงื่อนไขแจ้งเตือนเมื่อมี Asset Sale ที่ตรง Criteria |
| Provenance | ประวัติและหลักฐานการได้มาของนาฬิกา |
| Consignment | ข้อมูลการฝากขายนาฬิกา |

### Legacy Term Mapping

| Term จาก PRD เดิม | Canonical Term |
| --- | --- |
| Collection Show | Show |
| Collection Hide | Hide |
| Viewer Profile | Public Profile |

## 5. Asset Status Model

ระบบใช้สถานะ Asset ตามชุดนี้เท่านั้น:

- Sale
- Show
- Hide
- Sold

### Visibility Matrix

| Status | Owner Profile | Public Profile | Feed | Search | Watch Alert |
| --- | --- | --- | --- | --- | --- |
| Sale | แสดง | แสดง | แสดง | แสดง | Match |
| Show | แสดง | แสดง | ไม่แสดง | ไม่แสดง | ไม่ Match |
| Hide | แสดงเฉพาะ Owner | ไม่แสดง | ไม่แสดง | ไม่แสดง | ไม่ Match |
| Sold | แสดงเฉพาะ Owner | ไม่แสดง | ไม่แสดง | ไม่แสดง | ไม่ Match |

### Status Rules

- Sale แสดงใน Owner Profile, Public Profile, Feed, Search และ Watch Alert
- Show แสดงใน Owner Profile และ Public Profile เท่านั้น
- Hide เห็นเฉพาะเจ้าของใน Owner Profile เท่านั้น
- Sold เห็นเฉพาะเจ้าของใน Owner Profile เท่านั้น
- Hide และ Sold ไม่ Public, ไม่ขึ้น Feed, ไม่ขึ้น Search และไม่เข้า Watch Alert
- Sold Asset ไม่สามารถ Edit ข้อมูลหลักได้
- Sold Asset เก็บไว้เพื่อ Sales History, Portfolio และ Admin Review

## 6. Global Visibility Rules

### Feed

- Feed เป็น Marketplace หลัก
- Feed แสดงเฉพาะ Asset สถานะ Sale
- Feed ต้องกรอง Asset ที่ User ไม่มีสิทธิ์มองเห็นออก
- Feed ต้องไม่แสดง Asset ของ User ที่ถูก Block หรือ Block กันอยู่

### Search

- Search แสดงเฉพาะ Asset สถานะ Sale
- Search ต้องไม่แสดง Hide, Show หรือ Sold
- Search ต้องรองรับ Filter หลายมิติและ Sort ตามที่กำหนดใน Search Module

### Watch Alert

- Watch Alert Match เฉพาะ Asset สถานะ Sale
- Watch Alert สร้างจาก Search Filter
- Watch Alert ไม่มี Required Field
- Watch Alert Notification เปิดไปที่ Result List ไม่เปิด Asset ตรง

### Public Profile

- Public Profile เห็นเฉพาะ Sale และ Show
- Public Profile ไม่เห็น Hide และ Sold

### Owner Profile

- Owner Profile เห็น Asset ของตัวเองทุกสถานะ
- Owner Profile มีแท็บสำหรับ All, Sale, Show, Hide, Sold และ Asset Value

## 7. Functional Scope

### Authentication

รองรับ:

- Sign Up
- OTP Verification
- Sign In
- Forgot Password
- Reset Password
- Change Password
- Sign Out
- Sign in / Sign up with Apple
- Sign in / Sign up with Google

Rules:

- Email / Password ต้องยืนยัน OTP
- OTP หมดอายุภายใน 30 นาที
- Password อย่างน้อย 8 ตัวอักษร และต้องมีตัวเลขหรือสัญลักษณ์
- 1 Email สมัครได้ 1 บัญชีเท่านั้น
- SSO Email ไม่ต้องยืนยัน OTP
- Email ไม่สามารถเปลี่ยนได้หลังยืนยันแล้ว
- บัญชี SSO ไม่สามารถ Sign In ด้วย Email / Password ได้ และกลับกัน
- บัญชี Suspended ต้องเห็น error พร้อมเหตุผลและช่องทางติดต่อ Support
- ทุกช่องทางต้องยอมรับ Terms of Service และ Privacy Policy ก่อนสมัคร

### Feed

Feed Tabs:

- All: แสดง Asset Sale ทั้งหมดที่ User มีสิทธิ์มองเห็น
- Following: แสดงเฉพาะ Asset Sale ของ User ที่กำลัง Follow
- Favorites: แสดงเฉพาะ Asset Sale ที่ User กด Like

Feed Card ต้องแสดง:

- Asset Images
- Brand
- Model
- Price
- Posted Time
- Owner Name
- Like Count
- Comment Count

Feed Card ไม่แสดงใน V1:

- Location
- Verified Badge
- Status Badge

Feed Actions:

- Like / Unlike
- Swipe รูป
- เปิด Asset Detail
- เปิด Public Profile
- เปิด Full Screen Image Viewer

Feed ไม่รองรับ:

- Comment จาก Feed โดยตรง
- Share จาก Feed โดยตรง

Comment และ Share ต้องทำผ่าน Asset Detail เท่านั้น

### Search & Filter

Search รองรับ:

- Keyword Search
- Autocomplete
- Brand
- Model
- Price Range
- Year of Production
- Reference Number
- Delivery Contents
- Condition
- Case Size
- Movement
- Dial Color
- Strap / Bracelet
- Result Count
- Apply Filters
- Clear Filters
- Sort By Relevance, Price Low to High, Price High to Low, Newest, Popularity

Search Result แสดงเฉพาะ Asset Sale

### Asset & Asset Detail

Asset Detail สำหรับ Viewer แสดงเฉพาะ Asset ที่เป็น Public:

- Sale
- Show

Asset Detail สำหรับ Owner แสดง Asset ได้ทุกสถานะ:

- Sale
- Show
- Hide
- Sold

Asset Detail ต้องรองรับ:

- Gallery รูปภาพ
- Swipe รูป
- Full Screen Image Viewer
- Brand
- Model
- Reference No.
- Description
- Price
- Owner Information
- Follow / Unfollow
- Technical Specifications
- Comments Section
- Make Offer
- Contact Seller

Owner ไม่เห็นปุ่ม Follow ตัวเอง

### Asset Management

Add / Edit Asset รองรับข้อมูล:

- Gallery สูงสุด 10 รูป
- Brand
- Model / Series
- Reference No.
- Year
- Condition
- Scope of Delivery
- Case Size
- Thickness
- Case Material
- Movement
- Dial Color
- Strap / Bracelet Type
- Price
- Description
- Status: Sale / Show / Hide
- Provenance
- Consignment

Owner สามารถแก้ไข Status ระหว่าง:

- Sale
- Show
- Hide

Sold Asset:

- ไม่สามารถ Edit ข้อมูลหลัก
- เปิดดู Sale History ได้

### Chat

Chat ใช้สำหรับการสนทนาระหว่างผู้ซื้อและผู้ขาย

Rules:

- สร้าง Chat Room เมื่อส่งข้อความแรก
- Same Asset ใช้ห้องเดิม
- Different Asset ใช้ห้องเดิม แต่ Reference Asset เปลี่ยนเป็น Asset ล่าสุด
- Asset Deleted แล้ว Chat ยังอยู่
- Asset Deleted ต้องแสดง Reference Asset ว่า `รายการนี้ไม่พร้อมใช้งานแล้ว`
- Asset Sold แล้ว Chat ยังใช้งานได้
- Search Chat รองรับ
- Block User รองรับ
- Report User รองรับ

Chat Room รองรับ:

- Text
- Image
- File
- Asset Card
- Offer Card
- Delete Chat พร้อม Confirmation

### Offer

Rules:

- Make Offer ทำผ่าน Asset Detail เท่านั้น
- Accepted Offer เปิด Chat Room
- Rejected Offer เปิด Asset Detail
- Asset Deleted ทำให้ Offer เป็น Cancelled
- Asset Sold ต้อง Auto Reject Offer อื่น

Offer Flow:

```text
Asset Detail
→ Make Offer
→ Enter Offer Price
→ Add Message
→ Send Offer
→ Offer Sent Successfully
→ Go to Chat
```

### Social

Like:

- User สามารถ Like Asset ได้
- Owner สามารถ Like Asset ตัวเองได้
- Like สำเร็จต้อง Update Like Count ทันที
- Like สำเร็จต้องเพิ่ม Asset เข้า Favorites
- Unlike สำเร็จต้อง Update Like Count ทันที
- Unlike สำเร็จต้องลบ Asset ออกจาก Favorites

Comment:

- Single Level เท่านั้น
- ไม่มี Nested Comment
- ไม่มี Edit Comment ใน V1
- รองรับ Delete Comment
- Comment ต้องทำใน Asset Detail

Follow:

- User สามารถ Follow / Unfollow User อื่นได้
- Following Feed แสดง Asset Sale ของ User ที่กำลัง Follow

### Watch Alert

Rules:

- สร้างจากหน้า Search Filter
- ไม่มี Required Field
- Match เฉพาะ Asset Sale
- เปิด Notification แล้วไป Watch Alert Result List
- ไม่เปิด Asset Detail โดยตรงจาก Watch Alert Notification

Management:

- แสดงรายการ Watch Alert ทั้งหมด
- แสดงชื่อและ Criteria
- เปิด / ปิด Notification ต่อ Alert
- Rename Alert
- Delete Alert พร้อม Confirmation

### Notification

Notification รองรับ:

- Like
- Comment
- Follow
- Offer
- Watch Alert

Destination:

| Notification | Destination |
| --- | --- |
| Watch Alert | Watch Alert Result List |
| Like | Asset Detail |
| Comment | Asset Detail และ Focus Comment |
| Offer Accepted | Chat Room |
| Offer Rejected | Asset Detail |

### Profile

Owner Profile:

- Profile Image
- Name
- Followers
- Following
- Total Asset Value
- Edit Profile
- Asset Tabs: All, Sale, Show, Hide, Sold
- Total Asset Value เป็น entry point สำหรับกดเข้า Portfolio

Public Profile:

- Profile Image
- Name
- Followers
- Following
- Follow / Unfollow
- Asset Tabs: All, Sale, Show

Public Profile Tab Rules:

- All แสดง Asset สถานะ Sale และ Show รวมกัน
- Sale แสดงเฉพาะ Asset สถานะ Sale
- Show แสดงเฉพาะ Asset สถานะ Show

Public Profile ต้องไม่แสดง:

- Hide
- Sold
- ข้อมูล Provenance
- ข้อมูล Consignment

### Portfolio

Portfolio เป็น Private และเห็นเฉพาะ Owner

Portfolio คำนวณจาก:

- Sale
- Show
- Hide

Portfolio ไม่รวม:

- Sold

Sold History เก็บ:

- Sale Date
- Buyer
- Contact
- Sale Price
- Payment Method
- Attachment

### Board

Board เป็น Community Content / Article Area

รองรับ:

- Feature Article
- Trending Now
- Journal Board
- Watch Brands
- Watch 101
- Watch Apparel
- Watch Events
- Article Detail
- Article Like
- Article Share
- Search Article
- Category Filter
- Infinite Scroll

Rules:

- บทความสร้างและจัดการโดย Admin ผ่าน Back Office
- User ทั่วไปอ่าน, Like และ Share บทความได้ใน Phase 1
- User ทั่วไปไม่สามารถสร้างหรือแก้ไขบทความได้ใน Phase 1

### Settings

Settings รองรับ:

- Edit Profile
- Username
- Phone
- Line
- Email Display
- Language: English / Thai
- Theme Mode: Dark Mode / Light Mode
- Help
- About
- Privacy Policy
- Terms of Service
- Sign Out
- Delete Account

## 8. Global State & Error Rules

### Empty State

ทุกหน้าที่ไม่มีข้อมูลใช้ข้อความเดียวกัน:

| Language | Message |
| --- | --- |
| TH | ไม่พบข้อมูล |
| EN | No data found |

### Login Required

Guest ใช้งาน Feature ที่ต้อง Login ต้องแสดง Global Login Required Dialog

Feature ที่ต้อง Login:

- Like
- Follow
- Comment
- Offer
- Chat
- Favorites
- Following
- Watch Alert
- Add Asset

### Deleted Asset

เมื่อ Asset ถูกลบ:

- Asset ต้องหายจาก Feed, Search, Watch Alert และ Public Profile
- Asset Detail ต้องแสดงว่า `รายการนี้ไม่พร้อมใช้งานแล้ว`
- Chat ยังอยู่
- Offer ที่เกี่ยวข้องต้องเป็น Cancelled

### Feed Error

หากโหลด Feed ไม่สำเร็จ:

- แสดง Error State
- แสดงปุ่ม `ลองใหม่`

### Offline / Cached Data

ระบบต้องรองรับการแสดงข้อมูลล่าสุดที่โหลดไว้เมื่ออินเทอร์เน็ตขาดหาย อย่างน้อยสำหรับ Feed

## 9. Lifecycle Rules

### Sale → Sold

เมื่อ Asset เปลี่ยนจาก Sale เป็น Sold:

- หายจาก Feed ทันที
- หายจาก Following ทันที
- หายจาก Favorites ทันที
- หายจาก Search ทันที
- หายจาก Watch Alert ทันที
- Offer อื่นถูก Auto Reject
- Chat ยังใช้งานได้
- Owner ยังเห็นใน Owner Profile และ Sold History

### Sale → Hide

เมื่อ Asset เปลี่ยนจาก Sale เป็น Hide:

- หายจาก Feed ทันที
- หายจาก Following ทันที
- หายจาก Favorites ทันที
- หายจาก Search ทันที
- หายจาก Watch Alert ทันที
- Owner ยังเห็นใน Owner Profile

### Hide → Sale

เมื่อ Asset เปลี่ยนจาก Hide เป็น Sale:

- กลับเข้า Feed ทันที
- กลับเข้า Following ตามเงื่อนไข Follow
- กลับเข้า Favorites หาก User เคย Like และยังมีสิทธิ์มองเห็น
- กลับเข้า Search ทันที
- สามารถ Match Watch Alert ได้ทันที

### Show → Sale

เมื่อ Asset เปลี่ยนจาก Show เป็น Sale:

- แสดงใน Feed
- แสดงใน Search
- Match Watch Alert
- ยังคงแสดงใน Public Profile

### Sale → Show

เมื่อ Asset เปลี่ยนจาก Sale เป็น Show:

- หายจาก Feed
- หายจาก Search
- ไม่ Match Watch Alert
- ยังแสดงใน Public Profile

## 10. Trust & Safety

### Block User

เมื่อ User Block ผู้ใช้อีกคน:

- Asset ของผู้ถูก Block ต้องหายจาก Feed ทันที
- Asset ของผู้ถูก Block ต้องหายจาก Search ทันที
- Asset ของผู้ถูก Block ต้องหายจาก Watch Alert Result ทันที
- ความสัมพันธ์ Follow ระหว่างกันต้องไม่ถูกใช้ในการแสดง Following Feed

### Report

ระบบต้องรองรับ Report:

- Asset
- User
- Comment
- Board Content

Report ไม่ทำให้ Asset หายจาก Feed ทันที

Asset หรือ Content จะหายเมื่อ Admin ดำเนินการตาม Moderation เท่านั้น

### Apple Compliance

ระบบต้องรองรับ:

- Report
- Block
- Terms of Service
- Privacy Policy
- Moderation Flow

## 11. Data Privacy Rules

ข้อมูลต่อไปนี้เป็น Private และเห็นเฉพาะ Owner หรือ Admin ตามสิทธิ์:

- Provenance
- Purchase Price
- Purchase Date
- Purchase From
- Proof of Payment
- Consignment Owner Contact
- Consignment Terms
- Sold History
- Portfolio Value Detail

ข้อมูล Proof of Payment และเอกสารส่วนตัวต้องไม่ Public

## 12. Non-Functional Requirements

### Performance

- Feed ควรโหลดภายใน 2 วินาที
- รูปภาพต้อง Lazy Load
- Feed ต้องรองรับ Infinite Scroll
- เมื่อ Scroll ถึงรายการสุดท้ายให้แสดง `คุณดูรายการทั้งหมดแล้ว`

### Security

- ทุก API ใช้ HTTPS
- ใช้ Token-based Authentication
- Private Asset Data ต้องตรวจสิทธิ์ทุกครั้ง
- Admin Action ต้องมี Audit Trail ใน Back Office

### Localization

- รองรับภาษาไทยและอังกฤษ
- ราคาแสดงเป็น THB
- Empty State ใช้ข้อความกลางตามที่กำหนด

### Accessibility

- Font size รองรับการปรับตามระบบ
- รองรับ Screen Reader ตามความเหมาะสมของ Mobile Platform

## 13. Integrations

| Integration | Purpose |
| --- | --- |
| Apple Sign In | Sign In / Sign Up ด้วย Apple ID |
| Google OAuth | Sign In / Sign Up ด้วย Google Account |
| Firebase Cloud Messaging | Push Notifications |
| Image Storage / CDN | จัดเก็บและแสดงรูปภาพ |
| Watch Price API | ดึงข้อมูลราคาตลาด |
| Payment Gateway | Phase 2 เท่านั้น |

## 14. Phase 1 Exclusions

ไม่รวมใน Phase 1:

- ระบบชำระเงินออนไลน์ในแอป
- Video Upload
- Live Streaming
- Watch Authentication Service ในแอป
- Nested Comment
- Edit Comment
- Verified Badge
- Status Badge บน Feed Card
- Real-time Feed Refresh สำหรับ Asset ใหม่, Like จากอุปกรณ์อื่น และ Comment จากอุปกรณ์อื่น

## 15. Source Of Truth Rules

หากเอกสารเดิมมีคำหรือเงื่อนไขไม่ตรงกัน ให้ยึดเอกสารนี้เป็นหลักก่อนแตก Functional PRD รายโมดูล

หลักการตัดสินความขัดแย้ง:

- ใช้สถานะ canonical: Sale, Show, Hide, Sold
- ใช้ Owner / Viewer เป็น context ไม่ใช่ Role
- Feed, Search และ Watch Alert ใช้เฉพาะ Sale เท่านั้น
- Public Profile ใช้ Sale และ Show เท่านั้น
- Owner Profile เห็นทุกสถานะ
- Hide และ Sold ต้องไม่ Public
- ไม่มี Payment ภายในแอปใน Phase 1

## 16. Module PRD Checklist

ทุก Functional PRD รายโมดูลต้องมีหัวข้อต่อไปนี้:

- Purpose
- Screen Mapping
- User State
- User Flow
- Business Rules
- Permission Rules
- Validation Rules
- Exception Handling
- Empty State
- Notification Rules
- Analytics Events
- Acceptance Criteria
- Related Modules
- Future Enhancement

Acceptance Criteria ต้องเขียนให้ QA ทดสอบได้โดยไม่ต้องตีความเพิ่ม
