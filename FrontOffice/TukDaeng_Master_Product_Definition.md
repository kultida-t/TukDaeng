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
- ซ่อนถาวรโดยผู้ดูแล แบบ read-only

Asset ที่ลบโดยเจ้าของไม่แสดงใน owner list ปกติ แต่ backend/BO ควรเก็บ record ตาม retention policy เพื่อ audit, report history, dispute หรือ compliance

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

Full Back Office PRD ยังไม่เริ่มระหว่าง FO cleanup รอบนี้ ให้ใช้ `18_ADMIN_SCOPE_NOTE.md` เป็น boundary ก่อน และเริ่ม Full Back Office PRD หลัง FO baseline, Figma cleanup, Dev checklist, QA checklist และ FO sign-off ครบ/นิ่งแล้วเท่านั้น

## 4. Canonical Terminology

| Canonical Term | Meaning |
| --- | --- |
| Asset | นาฬิกาแต่ละเรือนในระบบ |
| Sale | Asset ที่เปิดขายและ Public |
| Show | Asset ที่แสดงเป็นคอลเลกชัน Public แต่ไม่ได้ขึ้น Marketplace |
| Hide | Asset ที่ซ่อน เห็นเฉพาะ Owner |
| Sold | Asset ที่ขายแล้ว เห็นเฉพาะ Owner |
| ลบโดยเจ้าของ | Asset ที่เจ้าของเป็นผู้ลบจาก Front Office; ไม่แสดงใน owner list ปกติหรือ public surfaces แต่ backend/BO เก็บ record ตาม retention policy |
| ซ่อนถาวร | Moderation state จาก Back Office สำหรับ asset ที่ไม่ควรแสดงต่อสาธารณะ; owner ยังเห็นแบบ read-only แต่แก้ไขหรือ delete เองไม่ได้ |
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
- Show ไม่แสดงใน Feed, Search และ Watch Alert แต่สามารถเปิด Asset Detail แบบ Public ได้
- Show สามารถ Make Offer, Contact Seller และ Chat ได้จาก Asset Detail หรือ Public Profile detail entry
- Hide เห็นเฉพาะเจ้าของใน Owner Profile เท่านั้น
- Sold เห็นเฉพาะเจ้าของใน Owner Profile เท่านั้น
- Hide และ Sold ไม่ Public, ไม่ขึ้น Feed, ไม่ขึ้น Search และไม่เข้า Watch Alert
- Sold Asset ไม่สามารถ Edit ข้อมูลหลักได้
- Sold Asset เก็บไว้เพื่อ Sales History, Portfolio และ Admin Review
- Asset ที่ลบโดยเจ้าของหายจาก owner list ปกติและ public surfaces แต่ backend/BO เก็บ record ตาม retention policy
- Asset ที่ถูก Back Office ซ่อนถาวรหายจาก public surfaces ทั้งหมด แต่ owner ยังเห็นแบบ read-only พร้อมสถานะถูกซ่อนถาวร
- Asset ที่ถูก Back Office ซ่อนถาวร owner ไม่สามารถ Edit, Change Status, Publish ใหม่, Mark as Sold, Boost หรือ Delete เองได้

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
- Watch Alert criteria ไม่มี Required Field แต่ Alert Name ต้องไม่ว่างตอนบันทึก
- เมื่อสร้าง Watch Alert ระบบต้องเติมชื่อเริ่มต้นจาก Filter หรือ default name ให้ user แก้ไขได้ก่อนบันทึก
- หาก user ลบชื่อจนว่างแล้วกดบันทึก ระบบต้องแจ้งให้กรอกชื่อและไม่สร้าง Watch Alert
- Watch Alert Notification เปิดไปที่ Result List ไม่เปิด Asset ตรง

### Public Profile

- Public Profile เห็นเฉพาะ Sale และ Show
- Public Profile ไม่เห็น Hide และ Sold
- Public Profile / Visitor view แสดงปุ่ม `...` บน asset card สำหรับ Asset สถานะ `Sale` และ `Show` เท่านั้น
- Public Profile / Visitor quick actions:
  - Sale: Share asset, Report asset
  - Show: Share asset, Report asset

### Owner Profile

- Owner Profile เห็น Asset ของตัวเองทุกสถานะ
- Owner Profile มีแท็บสำหรับ All, Sale, Show, Hide, Sold และ Asset Value
- Owner Profile asset card แสดงปุ่ม `...` เพื่อเปิด quick actions
- Tap asset card เปิด Asset Detail; tap `...` เปิด quick action menu และต้องไม่เปิด Asset Detail
- Owner quick actions:
  - Sale: Share asset, Edit asset, Edit provenance, Mark as sold, Change status, Delete asset
  - Show: Share asset, Edit asset, Edit purchase history, Change status, Delete asset
  - Hide: Edit asset, Edit purchase history, Change status, Delete asset
  - Sold: View sale history, View provenance แบบ read-only
  - ซ่อนถาวร: View detail แบบ read-only เท่านั้น

Asset ที่ลบโดยเจ้าของไม่แสดงใน owner list ปกติ ส่วน asset ที่ถูก Back Office ซ่อนถาวรยังแสดงให้ owner เห็นแบบ read-only เพื่อรับรู้สถานะและประวัติ แต่ไม่รวมใน Portfolio / Asset Value

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
- ทุกช่องทางต้องยอมรับ Terms of Use และ Privacy Policy ก่อนสมัคร

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
- เมนูสามจุดสำหรับ Asset ของผู้อื่น:
  - Hide this asset / ไม่ต้องการเห็นรายการนี้
  - Report Asset / รายงานรายการนี้
  - Block User / บล็อกผู้ใช้งาน
- เมนูสามจุดสำหรับ Asset ของ Owner:
  - Edit asset
  - Edit provenance
  - Mark as sold
  - Change status
  - Delete asset

Hide Feed Item:

- เป็น user-level preference ของ viewer เท่านั้น
- ไม่ใช่ asset status `Hide`
- ไม่กระทบ Owner, ผู้ใช้อื่น, Public Profile, Offer หรือ Chat
- หลัง Hide ต้องซ่อน Asset นั้นจาก Feed ของผู้กด
- ต้องมี undo ชั่วคราวหลัง hide สำเร็จ
- หากไม่ undo ระบบต้องไม่แสดง Asset นั้นใน Feed ของผู้กดเมื่อ refresh/reload
- ไม่สร้าง Notification Center item

Feed ไม่รองรับ:

- Comment จาก Feed โดยตรง

Comment ต้องทำผ่าน Asset Detail เท่านั้น ส่วน Share สามารถทำได้จาก Feed, Asset Detail และ Profile grid (ดู Share V1 ด้านล่าง)

Share V1:

- Share เป็น public share action สำหรับ public Asset และ public Article
- Share Asset entry point: Feed Card, Asset Detail และ Profile asset grid
- Share Profile entry point: Owner Profile และ Public Profile
- Guest สามารถ Share public content ได้โดยไม่ต้อง Login
- Primary channel คือ system share sheet เมื่อ platform รองรับ
- Fallback คือ copy public deep link
- Share ไม่สร้าง Notification Center item
- Public deep link ต้อง validate status, deleted state, permission และ block state เมื่อเปิด

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

Asset Detail Action Rules:

- Asset สถานะ Sale สามารถ Make Offer, Contact Seller และ Chat ได้
- Asset สถานะ Show สามารถ Make Offer, Contact Seller และ Chat ได้
- Asset สถานะ Show ต้องไม่ขึ้น Feed, Search หรือ Watch Alert
- Asset สถานะ Hide และ Sold ไม่สามารถ Make Offer หรือ Contact Seller ใน public viewer context ได้

Asset Detail Price Analytics:

- Market Comparison แสดงได้เมื่อมี Asking Price และ Watch Price API Market Price
- Market Comparison ใช้ Asking Price เทียบกับ Watch Price API Market Price เท่านั้น
- Market Comparison ไม่ใช้ Purchase Price fallback เพื่อแสดง Above/At/Below
- Expected Profit แสดงเฉพาะ Owner view เพราะใช้ Purchase Price
- Expected Profit ต้องไม่แสดงใน Viewer/Public mode

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

Market Data และ Asset Specification ต้องแยกขอบเขตดังนี้:

- Brand / Model / Reference ใช้ Market Data สำหรับ autocomplete, structured selection และ prefill ค่า spec เมื่อมีข้อมูล
- Asset ต้องเก็บ relation id ไปยัง Market Data เมื่อ match ได้ พร้อม snapshot text ของ Brand / Model / Reference ทุกครั้ง
- ถ้า Owner กรอกค่า Brand / Model / Reference ที่ไม่มีใน Market Data ให้เก็บเป็น free-text snapshot และ relation id เป็น `null`
- Year, Condition, Scope of Delivery, Case Size, Thickness, Case Material, Movement, Dial Color และ Strap / Bracelet Type เป็นข้อมูลของ Asset เรือนนั้น ต้องเก็บใน Asset Specification ไม่ใช่เขียนกลับไป Market Data
- Provider/API sync ห้าม overwrite user-entered Asset Specification
- Internal option master สำหรับ Condition, Delivery, Case Material, Movement, Dial Color และ Strap / Bracelet Type ต้องใช้ร่วมกันระหว่าง Add/Edit Asset, Asset Detail, Search Filter และ Watch Alert criteria
- Scope of Delivery ใน FO ใช้ได้เฉพาะ Original box และ Original papers เท่านั้น เป็น optional field; ถ้า Owner ไม่เลือกทั้งสองค่า ให้บันทึกเป็นไม่มีค่า delivery และไม่แสดง Scope of Delivery ใน Asset Detail / FO display surfaces

Required Field Matrix:

| Field | Sale | Show | Hide |
| --- | --- | --- | --- |
| Photos | Required, minimum 1 and maximum 10 | Required, minimum 1 and maximum 10 | Required, minimum 1 and maximum 10 |
| Brand Name | Required | Required | Required |
| Model / Series | Required | Required | Optional |
| Condition | Required | Optional | Optional |
| Asking Price (THB) | Optional; if empty FO shows `Price on request` | Optional; hidden from public FO surfaces | Optional; hidden from public FO surfaces |
| Description | Required | Optional | Optional |
| Status | Required: Sale | Required: Show | Required: Hide |

Sale is the only marketplace listing status and uses `Asking Price (THB)` when provided; if empty, buyer-facing surfaces show `Price on request`. Show is a public collection status and must not expose listing price publicly. Hide is a private collection status and must not expose listing price publicly.

Add Asset flow:

- Step 1: กรอก Asset Detail และเลือก Status: Sale / Show / Hide
- Step 2: กรอก Provenance ก่อน final Save / Upload Asset
- หาก Status = Sale ให้เลือก Provenance Type ได้เป็น `Owner (Asset)` หรือ `Consignment`
- หาก Status = Show หรือ Hide ต้องใช้ `Owner (Asset)` เท่านั้น และต้องไม่แสดง `Consignment`
- ก่อนสร้าง asset จริงต้องแสดง confirmation `Add this asset?` พร้อม primary action `Add asset`
- หลังสร้างสำเร็จให้แสดง `Asset added.` และ default ไป Owner Asset Detail ของ asset ที่เพิ่งสร้าง

Provenance required / optional fields:

| Provenance Type | Available Status | Required Fields | Optional Fields That Must Validate When Filled |
| --- | --- | --- | --- |
| Owner (Asset) | Sale, Show, Hide | Purchase Price (THB), must be greater than 0 | Purchase Date, Purchase From, All Equipment & Accessories, Proof of Payment, Note |
| Consignment | Sale only | Full Name, Phone Number, Asking Price (THB), must be greater than 0 | Line / IG / Facebook, Email, Payout Method, Consignment Date, Consignment Duration, Commission (%), Minimum Acceptable Price, All Equipment & Accessories, Proof of Payment / Documentation, Note |

Provenance display and edit rules:

- Provenance, Purchase Information, Consignment Information, Proof of Payment และ Consignment Terms เป็น private เห็นเฉพาะ Owner หรือ Admin
- Optional fields ที่ไม่ได้กรอกต้องไม่แสดง label หรือ placeholder ใน Viewer/Public mode
- Optional fields ที่ user กรอกหรืออัปโหลดต้อง validate ก่อน Save: date ต้องเป็นวันที่จริงและไม่เป็นอนาคตเมื่อเป็น purchase/consignment date, phone/email ต้อง format ถูกต้อง, numeric fields ต้องอยู่ในช่วงที่กำหนด, text ต้องไม่เป็น whitespace-only/เกินความยาว, และ uploads ต้องผ่าน type/size/count limits
- `Payout Method`, `Consignment Date`, `Consignment Duration` และ `Commission (%)` ไม่ required ใน FO Add Provenance V1 เพราะเป็นเงื่อนไขที่ทีมงานอาจ confirm ภายหลัง แต่ถ้า user กรอกต้อง validate ครบ
- Consignment Asking Price ต้องใช้ source เดียวกับ Commerce / listing Asking Price
- หาก Asset ที่เป็น Consignment ถูกเปลี่ยนจาก Sale เป็น Show หรือ Hide ต้องเปลี่ยน provenance type เป็น Owner (Asset) หรือปิด consignment data ก่อนบันทึก
- Sold Asset ต้องแสดง Provenance / Consignment เป็น read-only และไม่ให้แก้ผ่าน Edit Asset ปกติ

Owner สามารถแก้ไข Status ระหว่าง:

- Sale
- Show
- Hide

Change Status:

- ใช้ bottom sheet / modal sheet ชื่อ `Change status`
- ตัวเลือกมีเฉพาะ Sale, Show, Hide
- ไม่มี Sold option
- Success toast ใช้ข้อความกลาง `Asset status updated.`
- Error toast ใช้ `Unable to update asset status. Please try again.`
- หากเปลี่ยน status จาก Feed แล้วสถานะใหม่ไม่ใช่ Sale card ต้องหายจาก Feed ทันที
- หาก Consignment เปลี่ยนจาก Sale เป็น Show หรือ Hide ต้อง confirm และแปลง active provenance เป็น `Owner (Asset)` โดย require Purchase Price

Sold Asset:

- ไม่สามารถ Edit ข้อมูลหลัก
- เปิดดู Sale History ได้
- ไม่สามารถ Delete จาก Owner quick actions ปกติ

ลบ Asset โดยเจ้าของ:

- Owner ลบ Asset ที่ไม่ใช่ Sold และไม่ถูก Back Office ซ่อนถาวรได้ตาม policy ของ V1
- หลังลบแล้ว Asset หายจาก owner list ปกติและ public surfaces ทั้งหมด
- Chat ที่เกี่ยวข้องยังอยู่ แต่ Reference Asset ต้องแสดง unavailable/deleted state
- Offer ที่เกี่ยวข้องต้องเป็น Cancelled
- Backend/BO ควรเก็บ record ตาม retention policy เพื่อ audit, report history, dispute หรือ compliance
- การลบนี้ไม่ใช่ hard delete ทันที เว้นแต่นโยบายระบบระบุไว้ต่างหาก

Back Office ซ่อนถาวร:

- ใช้แทน action เดิมที่เรียก “ลบ/เก็บถาวร” ใน moderation flow ปกติ
- หายจาก Feed, Search, Watch Alert, Public Profile และ public deep link
- Owner ยังเห็นได้แบบ read-only พร้อมสถานะ `ถูกซ่อนถาวรโดยผู้ดูแล`
- Owner ไม่สามารถ Edit, Change Status, Publish ใหม่, Mark as Sold, Boost หรือ Delete เองได้
- ไม่ถูกนำไปรวมใน Portfolio / Asset Value
- Restore ใน moderation flow ปกติรองรับเฉพาะซ่อนชั่วคราว ไม่รองรับซ่อนถาวร
- การลบข้อมูลจริงถือเป็นกรณีพิเศษตามนโยบายระบบ ไม่ใช่ action ปกติใน Asset Management

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
- หลัง Block แล้ว Chat history เดิมยังอ่านได้แบบ read-only
- หลัง Block แล้วไม่สามารถส่งข้อความใหม่ระหว่างคู่ที่ Block กัน
- หลัง Block แล้วไม่สามารถสร้าง Chat หรือ Offer ใหม่ระหว่างคู่ที่ Block กัน

Chat Room รองรับ:

- Text
- Image
- File
- Asset Card
- Offer Card
- Delete Chat พร้อม Confirmation

Delete Chat V1:

- Delete Chat ต้องซ่อนห้องแชทจาก Chat List เฉพาะฝั่งผู้กด
- Delete Chat ไม่ลบ message/archive ฝั่ง server
- Delete Chat ไม่กระทบคู่สนทนา
- Delete Chat ไม่ลบหลักฐาน offer/chat history
- ไม่มี restore UI ใน V1

### Offer

Rules:

- Make Offer ทำผ่าน Asset Detail เท่านั้น
- Make Offer รองรับ Asset สถานะ Sale และ Show
- Asset สถานะ Show สร้าง Offer ได้จาก Asset Detail หรือ Public Profile detail entry เท่านั้น
- Asset สถานะ Show ยังไม่ขึ้น Feed, Search หรือ Watch Alert
- Asset สถานะ Hide, Sold และ Deleted ไม่สามารถสร้าง Offer ใหม่ได้
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
- ปุ่มหัวใจด้านบน Asset Detail เป็น Like / Unlike action
- Heart icon ใน metadata row ใต้ชื่อ Asset / Reference No. เป็น like count และเปิด `Liked by` list เท่านั้น
- Like สำเร็จต้อง Update Like Count ทันที
- Like สำเร็จต้องเพิ่ม Asset เข้า Favorites
- Unlike สำเร็จต้อง Update Like Count ทันที
- Unlike สำเร็จต้องลบ Asset ออกจาก Favorites
- หาก like count หรือ comment count = 0 สามารถแสดง icon อย่างเดียวโดยไม่แสดงเลข 0 ได้

Comment:

- รองรับ IG-style one-level replies ใต้ comment หลัก
- ไม่รองรับ multi-level nested thread หรือ reply ซ้อนเกิน 1 ชั้น
- ไม่มี Edit Comment ใน V1
- รองรับ Delete Comment
- Comment ต้องทำใน Asset Detail
- หากยังไม่มี comment ให้แสดง `No comments yet.` และ `Be the first to comment.` พร้อม input placeholder `Write a comment...`

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

Notification ไม่รองรับใน Front Office V1:

- Chat / New Message ไม่เป็น Notification Center type และแจ้งเตือนเฉพาะในเมนู Chat ด้วย unread badge/count
- Moderation / Account Action
- Market Update
- Price / Valuation
- Sale Success

Destination:

| Notification | Destination |
| --- | --- |
| Watch Alert | Watch Alert Result List |
| Like | Asset Detail |
| Comment | Asset Detail และ Focus Comment |
| New Offer | Chat Room และ Focus Offer Card |
| Offer Accepted | Chat Room |
| Offer Rejected | Asset Detail |
| Offer Cancelled | Chat Room และ Focus Offer Card |

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
- ลบโดยเจ้าของ
- ซ่อนถาวรจาก Back Office

Portfolio valuation baseline:

- Total Asset Value = ผลรวม Current Value ของ Asset สถานะ Sale, Show, Hide ที่ยังใช้งานได้ และไม่ใช่รายการลบโดยเจ้าของหรือซ่อนถาวร
- Current Value ใช้ลำดับแหล่งข้อมูล: Watch Price API market price -> Purchase Price fallback -> No Valuation
- หากใช้ Purchase Price fallback ต้องแสดง label ว่าใช้ราคาซื้อเป็นค่าประมาณ เพราะไม่มีราคาตลาด
- หากไม่มี market price หรือ purchase price ให้แสดง `ไม่มีราคาตลาด` / `No market price` และไม่รวม Asset นั้นใน Total Asset Value
- Unrealized Gain/Loss คำนวณเฉพาะ Asset ที่มี Current Value จาก Watch Price API และมี Purchase Price
- Unrealized Gain/Loss = Current Value - Purchase Price
- Unrealized Gain/Loss % = Unrealized Gain/Loss / Purchase Price * 100
- Expected Profit คำนวณเฉพาะ Owner view เมื่อมี Asking Price และ Purchase Price
- Expected Profit = Asking Price - Purchase Price
- Expected Profit % = Expected Profit / Purchase Price * 100
- Market Comparison ใช้ Asking Price เทียบกับ Watch Price API Market Price เท่านั้น
- Market Comparison % = (Asking Price - Market Price) / Market Price * 100
- Above Market เมื่อ Market Comparison % > 1%
- At Market เมื่อ Market Comparison % อยู่ระหว่าง -1% ถึง +1%
- Below Market เมื่อ Market Comparison % < -1%
- หากไม่มี Market Price ให้แสดง `ไม่มีราคาตลาด` / `No market price` และไม่แสดง Above/At/Below
- Holding Period สำหรับ Asset ที่ยังไม่ขาย = Today - Purchase Date
- Holding Period สำหรับ Sold Asset = Sale Date - Purchase Date
- Top Brand Holdings = Top 3 brand จากจำนวน Asset สถานะ Sale, Show, Hide ที่ยังใช้งานได้ โดยเรียง count มากไปน้อย
- YTD Performance V1 ใช้วิธี A: (Portfolio Value Today - Portfolio Value Start Of Year) / Portfolio Value Start Of Year * 100
- YTD Performance V1 ไม่รวม Realized Gain จาก Sold Asset ในสูตรหลัก แต่แสดง Realized Gain แยกใน Sold History
- Sold ไม่รวม Total Asset Value และ Unrealized Gain/Loss แต่แสดงใน Sold History

Sold History เก็บ:

- Sale Date (required)
- Sale Price (required)
- Payment Method (required)
- Buyer (optional)
- Contact (optional)
- Attachment (optional)
- Note (optional)

Sold History calculation:

- Realized Gain/Loss = Sale Price - Purchase Price
- Realized Gain % = Realized Gain/Loss / Purchase Price * 100
- หากไม่มี Sale Price หรือ Purchase Price ให้แสดง Realized Gain/Loss เป็น `—`

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
- Guest อ่านและ Share บทความได้โดยไม่ต้อง Login เพราะ Article Share เป็น public share action
- Article Share entry point คือ Article Detail เท่านั้น
- Primary share channel คือ system share sheet เมื่อ platform รองรับ; Fallback คือ copy public Article deep link
- Article Share ไม่สร้าง Notification Center item
- Public Article deep link ต้อง validate publish state, deletion state และ availability เมื่อเปิด
- Article Like ต้อง Login ตาม Global Login Required baseline
- Article Comment ไม่อยู่ใน FO V1 baseline
- Article Detail รองรับ report action ด้วย UI label `Report article`
- `Report article` ต้องส่งเข้า Trust & Safety ด้วย report type `Board Content` และ target type `Article`
- Report Board Content ไม่ทำให้บทความหายทันทีจนกว่า Admin moderation
- Report article success ใช้ `Report submitted` และแจ้งว่า article ยัง visible จน moderation complete

### Chat Room Actions

Chat Room overflow menu ต้องมี:

- `View profile`
- `Mute notifications` / `Unmute notifications`
- `Delete chat`
- `Report user`
- `Block user`

Chat room action rules:

- `Mute notifications` auto-save และแสดง `Notifications muted`; unmute แสดง `Notifications unmuted`
- `Delete chat` ซ่อนห้องจาก inbox/list เฉพาะฝั่งผู้กด ไม่ลบ message/archive ฝั่ง server และไม่กระทบคู่สนทนา
- Delete chat confirmation ใช้ title `Delete chat?` และ actions `Cancel`, `Delete chat`

### Settings

Settings รองรับ:

- Edit Profile
- Username
- Phone
- Line
- Email Display
- Language: English / Thai
- Theme Mode: Dark Mode / Light Mode
- Notification Settings สำหรับ Notification Center type ที่อยู่ใน V1 baseline
- Change Password เป็น Auth-linked entry สำหรับบัญชี Email / Password เท่านั้น
- Help
- About app
- About your account
- Privacy Policy
- Terms of Use
- Sign Out
- Delete Account

Settings Home ต้องเรียง section เป็น Account, Your app and media, Notifications, More info and support และ bottom Sign out

About app ต้องแสดงข้อมูลแอปและบริษัท ได้แก่ `TUK DAENG`, tagline, version, `Mister Fox Co., Ltd.`, `Est. 2026`, Privacy Policy, Terms of Use และ Contact support

Help ต้องแสดงช่องทางติดต่อ support ได้แก่ LINE `@mrfoxthailand`, Phone `(+66) 80-008-8088`, Email `service@mrfox.com` และเวลาทำการ `09:00 - 22:00 (GMT+7)`

Delete Account V1:

- Delete Account ต้องอยู่ใน About your account ไม่ใช่ Settings Home direct action
- Delete Account ต้องเป็น soft delete หลัง user confirm
- หลัง Delete Account สำเร็จต้อง deactivate account, revoke session และ clear local token
- หลัง Delete Account สำเร็จต้องแสดง `Account deletion started` แล้วให้ user กด `Back to sign in`
- `Back to sign in` ต้องพาไปหน้า Sign In / pre-auth ที่มีอยู่แล้ว
- หลัง session ถูก revoke แล้ว user ต้องกด back กลับเข้า account/profile/settings ไม่ได้
- ถ้า Delete Account API fail ต้องไม่ sign out, ไม่ clear session และต้องแสดง error/retry จาก context เดิม
- ใช้ grace period 30 วันก่อน hard delete/anonymization ตาม policy
- ระหว่าง grace period user login ไม่ได้ หรือเห็น account-deleted support state
- Transaction, offer, chat, report และ audit record ที่จำเป็นยังเก็บตาม legal/safety policy

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
- Article Like

Feature ที่ Guest ใช้ได้โดยไม่ต้อง Login:

- Read Feed / Search / Public Asset Detail / Public Profile / Board Article
- Share public Asset deep link
- Share public Profile deep link
- Share public Article deep link

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
- Chat history เดิมระหว่างคู่ที่ Block กันยังอ่านได้แบบ read-only
- ผู้ใช้ที่ Block กันไม่สามารถส่งข้อความใหม่หากันได้
- ผู้ใช้ที่ Block กันไม่สามารถสร้าง Chat หรือ Offer ใหม่ระหว่างกันได้

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
- Terms of Use
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
- Watch Shops
- Accessories Shop
- Repair Shop
- Auction Center
- Consignment Center
- Authentication Center
- Multi-level Nested Comment เกิน 1 reply level
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

