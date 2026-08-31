# 03 Search & Filter Module

อ้างอิงหลักจาก [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md)

---

# 1. Document Information

| Item | Detail |
|---|---|
| Module Name | Search & Filter |
| Platform | Mobile Application |
| Version | V1 |
| Owner | Product / UX / Engineering |
| Status | Draft |
| Document Type | Functional PRD |

---

# 2. Objective

Search & Filter Module ใช้สำหรับค้นหาและกรองรายการนาฬิกาที่เปิดขายในระบบ โดยเป็น entry point สำคัญของ Search Result และ Watch Alert Creation

เป้าหมายหลักคือช่วยให้ผู้ซื้อค้นหา Asset สถานะ `Sale` ที่ต้องการได้รวดเร็ว แม่นยำ และสอดคล้องกับ visibility rule ของ master

---

# 3. Prototype Reference

- `Search & Filter.png`
- `Menu Feed.png`
- `Watch Alert.png`

---

# 4. Master Alignment Summary

Search & Filter Module ต้องยึด master baseline ต่อไปนี้เป็นหลัก:

- Search Result แสดงเฉพาะ Asset สถานะ `Sale`
- Search ต้องไม่แสดง Asset สถานะ `Show`, `Hide`, `Sold`
- Search ต้องกรอง Asset ที่ User ไม่มีสิทธิ์มองเห็น
- Search ต้องไม่แสดง Asset ของ User ที่ถูก Block หรือ Block กันอยู่
- Search ต้องรองรับ Filter หลายมิติ
- Watch Alert ต้องสร้างจาก Search Filter
- Watch Alert criteria ไม่มี Required Field แต่ Alert Name ต้องไม่ว่างตอนบันทึก
- Watch Alert Match เฉพาะ Asset สถานะ `Sale`
- Watch Alert Notification ต้องเปิดไปที่ Watch Alert Result List ไม่เปิด Asset Detail ตรง
- Guest ใช้ Search / Filter / View Result ได้ แต่ Create Watch Alert ไม่ได้

---

# 5. Figma Gap Checklist For Search & Filter Module

รายการนี้ใช้เป็น checklist สำหรับปรับ Figma เฉพาะ Search & Filter Module ให้ตรงกับ master ก่อนส่งต่อ Dev/QA

| Priority | Gap | Master Baseline | Figma Action |
|---|---|---|---|
| High | ยังไม่เห็น Watch Alert Result List | Watch Alert Notification ต้องเปิดไปที่ Result List ไม่เปิด Asset Detail ตรง | เพิ่ม Watch Alert Result List screen |
| High | ต้องยืนยันว่า Search Result แสดงเฉพาะ Sale | Search Result แสดงเฉพาะ Asset สถานะ Sale | ตรวจ state/filter ไม่ให้มี Show, Hide, Sold ใน Search Result |
| High | ยังไม่เห็น Guest restriction สำหรับ Create Watch Alert ชัดเจน | Guest Create Watch Alert ไม่ได้ และต้องเห็น Global Login Required Dialog | เพิ่ม guest dialog/state เมื่อกด Create Watch Alert |
| Medium | Search Result ใช้ layout เดียวกับ Feed แต่ต้องไม่แสดง Location | Feed/Search card V1 ห้ามแสดง Location | ตรวจ card ใน Search Result ให้เหลือเฉพาะ Posted Time |
| Medium | ยังไม่เห็น state ของ no result / error / retry ครบ | Empty State ใช้ `ไม่พบข้อมูล` / `No data found`; error ต้องมี retry | เพิ่ม no result และ error state พร้อมปุ่ม retry |
| Medium | ยังไม่เห็น clear filter / result count ชัดเจน | Search รองรับ Result Count, Apply Filters, Clear Filters | เพิ่ม result count และ clear filter control |
| Medium | ยังไม่เห็น sort options ครบ | Search รองรับ Relevance, Price Low to High, Price High to Low, Newest, Popularity | เพิ่ม sort option set ให้ครบตาม master |
| Medium | Filter dropdown ยังไม่แสดงจำนวน listing ข้างชื่อ option | Filter Visibility Rule กำหนดให้แสดงจำนวน Asset Sale ปัจจุบันข้างชื่อทุก entity/option แม้จำนวนเป็น 0 | เพิ่ม count label ข้างชื่อใน autocomplete และ filter dropdown เช่น `Rolex (212)`, `Daytona (0)` |

---

# 6. Scope

Search & Filter Module ใน V1 ครอบคลุม:

- Keyword Search
- Autocomplete
- Filter
- Search Result
- Result Count
- Sort
- Apply Filters
- Clear Filters
- Open Asset Detail
- Open Public Profile
- Create Watch Alert from Search Filter
- Popular Filter / Popular Selection tags สำหรับช่วยเลือก Brand, Model, Reference และ filter option ที่ถูกเลือกบ่อยแบบ aggregate
- Quick selection จาก Popular Filter tags ในหน้า Search และหน้า Filter

ไม่รวมใน V1:

- Saved Search เป็น feature แยก
- Recent Search หรือประวัติการค้นหาส่วนตัวของ user
- Trending Search แบบหน้าแยกหรือประสบการณ์ค้นหาเต็มรูปแบบ
- AI Search Suggestion
- Search History Sync
- Natural Language Search

Popular Filter ที่อยู่ใน V1 ไม่ถือเป็น Saved Search, Recent Search หรือ Search History ส่วนตัว แต่เป็นข้อมูล aggregate ของการเลือก keyword/filter เพื่อช่วยให้ user เลือกเงื่อนไขที่นิยมได้เร็วขึ้น

---

# 7. Screen Mapping

หน้าจอที่เกี่ยวข้องในโมดูลนี้:

1. Search
2. Search Autocomplete
3. Filter
4. Search Result
5. Empty Search Result
6. Search Error State
7. Create Watch Alert
8. Watch Alert Result List
9. Global Login Required Dialog

---

# 8. User States

## Guest

สามารถ:

- Search
- Filter
- View Search Result
- Open Asset Detail ที่เป็น Public
- Open Public Profile

ไม่สามารถ:

- Create Watch Alert
- Like
- Follow
- Comment
- Chat
- Make Offer

เมื่อ Guest กด Create Watch Alert หรือ feature ที่ต้อง Login ต้องแสดง Global Login Required Dialog

## Member

สามารถใช้งาน Search & Filter ได้ทั้งหมดตามสิทธิ์ของ User

## Blocked Relationship

เมื่อ User Block กัน:

- Search Result ต้องไม่แสดง Asset ของผู้ที่ถูก Block
- Watch Alert Result List ต้องไม่แสดง Asset ของผู้ที่ถูก Block
- ความสัมพันธ์ Follow ระหว่างกันต้องไม่ถูกใช้ในการแสดงผลที่เกี่ยวข้อง

---

# 9. User Flow

## Search Asset

```text
Search
→ Enter Keyword
→ View Autocomplete
→ Submit Search
→ Search Result
→ Asset Detail
```

## Filter Asset

```text
Search
→ Open Filter
→ Select Conditions
→ Apply Filter
→ Search Result
```

## Clear Filter

```text
Search Result
→ Open Filter
→ Clear Filters
→ Apply
→ Search Result with cleared conditions
```

## Sort Result

```text
Search Result
→ Open Sort
→ Select Sort Option
→ Search Result Reordered
```

## Create Watch Alert

```text
Search Result
→ Create Watch Alert
→ Confirm / Save Alert
→ Watch Alert Created
```

## Guest Create Watch Alert

```text
Search Result
→ Create Watch Alert
→ Global Login Required Dialog
```

## Open Watch Alert Notification

```text
Notification
→ Watch Alert Result List
→ Asset Detail
```

---

# 10. Business Rules

## Search Visibility Rule

Search แสดงเฉพาะ:

- Asset สถานะ `Sale`
- Asset ที่ User มีสิทธิ์มองเห็น
- Asset ของ User ที่ไม่ได้ถูก Block และไม่ได้ Block กันอยู่

Search ต้องไม่แสดง:

- `Show`
- `Hide`
- `Sold`
- Deleted Asset
- Asset ของ User ที่ถูก Block หรือ Block กันอยู่

## Search Keyword Rule

Keyword Search ต้องรองรับ:

- Brand
- Model
- Reference Number

Keyword ต้องรองรับ:

- ภาษาไทย
- ภาษาอังกฤษ
- ตัวเลข

## Autocomplete Rule

Autocomplete ใช้เพื่อช่วยเลือก keyword หรือ entity ที่มีอยู่ในระบบ

Autocomplete ต้องแสดงทุก entity ที่ `is_active=true` จาก Market Data (Brand, Model, Reference Number) และทุก active option จาก internal option master (Condition, Delivery Contents, Case Material, Movement, Dial Color, Strap / Bracelet) — พร้อมแสดงจำนวน Asset Sale ปัจจุบันที่ User มีสิทธิ์เห็นข้างชื่อ entity/option เช่น `Rolex (212)`, `Daytona (0)`, `New (380)`, `Fair (0)`

จำนวน listing เป็นข้อมูลอ้างอิงเท่านั้น ไม่ใช่เกณฑ์ตัด entity/option ออกจากรายการ — entity/option ที่มีจำนวน `0` (no current listing) ยังเลือกได้ เพื่อรองรับ Watch Alert use case ที่ผู้ซื้อหานาฬิกาตรงเงื่อนไขที่ต้องการ ไม่ว่าจะยังไม่มีรุ่นนั้นลงขาย หรือเคยมีลงขายแต่ไม่ตรงเงื่อนไข (เช่น ราคา/สภาพ/สี)

Entity/option ที่ `is_active=false` (inactive market data หรือ deactivated option) ต้องไม่แสดงเป็นตัวเลือกใหม่ใน autocomplete

## Popular Filter / Popular Selection Rule

หน้า Search และหน้า Filter ต้องรองรับการแสดง Popular Filter tags เพื่อช่วยให้ user เลือกเงื่อนไขที่นิยมได้รวดเร็วขึ้น โดยระบบคำนวณจากข้อมูล aggregate ของพฤติกรรมการใช้งาน เช่น:

- Keyword ที่ถูก submit บ่อย
- Brand, Model และ Reference ที่ถูกเลือกบ่อย
- Filter option ที่ถูกเลือกบ่อยในแต่ละหมวด
- Filter combination ที่ถูกใช้บ่อย หากระบบรองรับการจัดอันดับแบบหลายเงื่อนไข

กฎการแสดงผล:

- หน้า Search แสดง quick-selection tags ที่เกี่ยวข้องกับการค้นหาหรือหมวดที่ระบบกำหนด โดยจำกัดจำนวนตามพื้นที่ของหน้าจอ (prototype ปัจจุบันแสดงประมาณ 10 รายการ)
- หน้า Filter แสดง Popular Filter tags แยกตามหมวด เช่น Brand, Model หรือ option master ก่อนรายการเต็ม
- User เลือกจาก tag ได้โดยตรง หรือเลือกจากรายการเต็มและค้นหาด้วยช่อง Search ได้เหมือนเดิม
- Popular Filter ต้องไม่ตัดตัวเลือกอื่นออกจากรายการเต็ม และต้องไม่เปลี่ยนผลลัพธ์ของ Search/Filter logic
- การจัดอันดับต้องใช้ข้อมูล aggregate และไม่แสดงข้อมูลที่ระบุตัว user รายบุคคล
- ตัวเลือกที่ไม่มี Asset Sale ปัจจุบันยังเลือกได้ตาม Filter Visibility Rule หากเป็น active market data/option; จำนวน `(0)` ยังคงแสดงตามเดิม
- หากยังไม่มีข้อมูลเพียงพอ ให้แสดงรายการเริ่มต้นตาม implementation หรือไม่แสดง Popular Filter โดยไม่ทำให้การเลือกจากรายการเต็มใช้งานไม่ได้

Popular Filter เป็น convenience layer สำหรับ Search & Filter ไม่ใช่ Saved Search, Recent Search, Search History หรือ AI Search Suggestion

## Filter Fields

Search & Filter ต้องรองรับ filter ต่อไปนี้:

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

Filter data source rule:

- Brand, Model และ Reference Number ใช้ Market Data relation/snapshot ของ Asset เพื่อค้นหาและ filter
- Year of Production, Delivery Contents, Condition, Case Size, Movement, Dial Color และ Strap / Bracelet ใช้ข้อมูลที่ Owner save ไว้ใน Asset Specification
- Condition, Delivery Contents, Case Material, Movement, Dial Color และ Strap / Bracelet option ต้องอ่านจาก internal option master เดียวกับ Add/Edit Asset
- Provider/API specification ใช้ช่วย prefill ตอน Add/Edit Asset ได้ แต่ Search/Filter ต้องอิงค่าที่ถูก save กับ Asset จริง
- ถ้า Asset ใช้ free-text Brand/Model/Reference ที่ไม่มี relation id ต้องยังค้นหา keyword จาก snapshot text ได้
- จำนวน listing ที่แสดงข้างชื่อ entity/option ใน autocomplete/filter dropdown คำนวณจาก Asset สถานะ `Sale` ที่ User มีสิทธิ์เห็นและไม่ได้ถูก Block เท่านั้น (ไม่รวม Show, Hide, Sold, Deleted)

## Filter Visibility Rule

Filter option ต้องแสดงทุก entity/option ที่ `is_active=true` จาก Market Data และ internal option master พร้อมจำนวน Asset Sale ปัจจุบันที่ User มีสิทธิ์เห็นข้างชื่อ — เพื่อให้ User เห็นก่อนกด Search ว่าตัวเลือกนี้มี listing หรือไม่ และให้ตั้ง Watch Alert สำหรับนาฬิกาที่ตรงเงื่อนไขที่ต้องการ ไม่ว่าจะยังไม่มีรุ่นนั้นลงขาย หรือเคยมีลงขายแต่ไม่ตรงเงื่อนไข (เช่น ราคา/สภาพ/สี)

ตัวอย่าง:

- หากไม่มี Asset Sale ของ `Rolex Daytona` ที่ User มีสิทธิ์เห็น ต้องแสดง `Daytona (0)` ใน dropdown ให้เลือกได้ (ไม่ใช่ผลลัพธ์หลอก เพราะ User อาจตั้ง Watch Alert รอนาฬิกาที่ตรงเงื่อนไขที่ต้องการ ทั้งกรณีที่ยังไม่มีรุ่นนี้ลงขาย หรือเคยมีลงขายแต่ไม่ตรงเงื่อนไขที่ต้องการ เช่น ราคา/สภาพ/สี)
- หาก `Rolex Daytona` ถูก deactivate ใน Market Data แล้ว ต้องไม่แสดงเป็นตัวเลือกใหม่ใน filter (เป็น inactive market data ไม่ใช่ no current listing)

การแยกความหมาย:

| สถานะ | ความหมาย | การแสดงใน filter |
| --- | --- | --- |
| no current listing | มีใน Market Data/Option Master (`is_active=true`) แต่ไม่มี Asset Sale ตอนนั้น | แสดง พร้อมจำนวน `(0)` ยังเลือกได้ |
| inactive market data | Brand/Model/Reference ถูก deactivate ใน Market Data (`is_active=false`) | ไม่แสดงเป็นตัวเลือกใหม่ |
| deactivated option | Option master ถูก deactivate (`is_active=false`) | ไม่แสดงเป็นตัวเลือกใหม่ |

## Filter Dependency Rule

Filter ทำงานแบบ dependent

ตัวอย่าง:

```text
Brand = Rolex
→ Model แสดงเฉพาะ Model ของ Rolex
```

## Multiple Filter Rule

Search รองรับหลายเงื่อนไขพร้อมกัน และ Result ต้องตรงทุกเงื่อนไขแบบ AND Logic

## Apply / Clear Filter Rule

- Apply Filters ต้องใช้เงื่อนไขที่ User เลือกกับ Search Result
- Clear Filters ต้องล้างเงื่อนไขทั้งหมด
- หลัง Clear Filters แล้ว Result ต้องกลับไปตาม keyword / default visibility ที่เหลืออยู่

## Result Count Rule

Search Result ต้องแสดงจำนวนผลลัพธ์ที่ตรงเงื่อนไข

## Search Result Display

Search Result ใช้ card layout เดียวกับ Feed โดยแสดง:

- Asset Images
- Brand
- Model
- Price
- Posted Time
- Owner Name
- Like Count
- Comment Count

ไม่แสดงใน V1:

- Location
- Verified Badge
- Status Badge

## Search Result Sorting

รองรับ Sort:

- Relevance
- Price Low to High
- Price High to Low
- Newest
- Popularity

Default Sorting:

- Created Date DESC / Newest

## Asset Lifecycle Rule

### Sale → Sold

Asset ต้องหายจาก:

- Search Result
- Watch Alert Result List

### Sale → Hide

Asset ต้องหายจาก:

- Search Result
- Watch Alert Result List

### Hide → Sale

Asset ต้องกลับเข้า:

- Search Result
- Watch Alert Result List หากตรง Watch Alert criteria

### Show → Sale

Asset ต้องกลับเข้า:

- Search Result
- Watch Alert Result List หากตรง Watch Alert criteria

### Sale → Show

Asset ต้องหายจาก:

- Search Result
- Watch Alert Result List

## Delete Asset Rule

เมื่อ Asset ถูกลบ:

- Asset ต้องหายจาก Search Result
- Asset ต้องหายจาก Watch Alert Result List
- หากเปิด Asset Detail จากผลลัพธ์เก่าต้องเห็น Deleted Asset state จาก Asset Detail Module

## Block User Rule

เมื่อ User Block ผู้ใช้อีกคน:

- Asset ของผู้ถูก Block ต้องหายจาก Search Result ทันที
- Asset ของผู้ถูก Block ต้องหายจาก Watch Alert Result List ทันที

## Report Asset Rule

Report Asset ไม่ทำให้ Asset หายจาก Search Result ทันที

Asset จะหายเมื่อ Admin ดำเนินการตาม Moderation เท่านั้น

## Watch Alert Entry Point

Create Watch Alert ต้องสร้างจาก Search Filter เท่านั้น

## Watch Alert Rule

- Watch Alert Match เฉพาะ Asset สถานะ `Sale`
- Watch Alert criteria ไม่มี Required Field
- Alert Name ต้องไม่ว่างตอนกด Save this search
- Watch Alert Notification ต้องเปิดไปที่ Watch Alert Result List
- Watch Alert Notification ต้องไม่เปิด Asset Detail โดยตรง
- Watch Alert criteria สามารถอ้าง Brand/Model/Reference หรือ option master ที่มี no current listing (จำนวน listing = 0 ตอนสร้าง) ได้ — เพราะ Watch Alert ใช้หานาฬิกาที่ผู้ซื้อต้องการ ไม่ว่าจะยังไม่มีรุ่นที่ต้องการลงขาย หรือเคยมีลงขายแต่ไม่ตรงเงื่อนไขที่ต้องการ (เช่น ราคา/สภาพ/สี)
- Alert ที่ criteria อ้าง entity/option ที่มี no current listing ถือเป็น unmet demand ปกติ ไม่ใช่ inactive market data (ดู Filter Visibility Rule สำหรับความแตกต่าง)

## Watch Alert Name Rule

- เมื่อเปิด Save to Watch Alert modal ระบบต้องสร้างชื่อเริ่มต้นจาก Filter ที่ใช้อยู่และเติมลงในช่อง Alert Name ให้ก่อน เช่น brand, model, reference หรือช่วงราคาที่เลือก
- User สามารถแก้ไขชื่อที่ระบบสร้างให้ได้ก่อนบันทึก
- ตอนกด `Save this search` ระบบต้อง trim ค่า Alert Name ก่อนตรวจสอบ
- หาก Alert Name หลัง trim แล้วว่าง ต้องไม่สร้าง Watch Alert และต้องแสดง validation message ให้ user กรอกชื่อ
- หาก Filter ว่างหรือไม่มี criteria ที่ใช้ตั้งชื่อได้ ระบบต้องเติมชื่อ default เช่น `Watch Alert`

## Search Refresh And Pagination Behavior

Search Result ต้องรองรับ:

- Pull To Refresh
- Infinite Scroll
- Reload Result

เมื่อ Scroll ถึงรายการสุดท้าย ต้องแสดงข้อความ:

```text
คุณดูรายการทั้งหมดแล้ว
```

หากโหลด Search Result ไม่สำเร็จ ต้องแสดง Error State พร้อมปุ่ม:

- ลองใหม่

---

# 11. Permission Rules

## Guest

สามารถ:

- Search
- Filter
- View Search Result
- Open Asset Detail
- Open Public Profile

ไม่สามารถ:

- Create Watch Alert
- Like
- Follow
- Comment
- Chat
- Make Offer

## Member

สามารถใช้งาน Search & Filter ได้ทั้งหมดตามสิทธิ์ของ User

---

# 12. Validation Rules

## Search Keyword

- รองรับภาษาไทย
- รองรับภาษาอังกฤษ
- รองรับตัวเลข
- ไม่ required

## Filter

- ไม่มี Required Field
- สามารถค้นหาโดยไม่เลือก Filter ได้
- Price Range ต้องไม่ให้ค่าต่ำสุดมากกว่าค่าสูงสุด
- Year Range ต้องไม่ให้ค่าต่ำสุดมากกว่าค่าสูงสุด

## Price Range Manual Input

- การกรอก Minimum price และ Maximum price เป็น optional ทั้งคู่
- หากไม่กรอกทั้งสองช่อง ให้ถือว่าไม่ใช้เงื่อนไข Price Range
- หากกรอกเฉพาะ Minimum price ให้ค้นหาราคาที่มากกว่าหรือเท่ากับค่านั้น
- หากกรอกเฉพาะ Maximum price ให้ค้นหาราคาที่น้อยกว่าหรือเท่ากับค่านั้น
- รับเฉพาะตัวเลขจำนวนเต็มบวกและ `0`
- ระบบต้อง auto-format comma คั่นหลักพันระหว่าง user กรอก เช่น user พิมพ์ `2000000` แล้ว field แสดง `2,000,000`
- ระบบต้องเก็บค่า internal เป็นตัวเลขล้วนและ normalize ก่อนค้นหา เช่น display `2,000,000` เป็น value `2000000`
- หาก user paste ค่าที่มี comma เช่น `2,000,000` ระบบต้อง strip comma, validate ค่าเลขล้วน และ format ใหม่ตาม pattern ของระบบ
- หาก user paste comma ผิดหลัก เช่น `20,00,000` ระบบต้อง strip comma แล้ว format ใหม่เป็น `2,000,000` หากค่าตัวเลขถูกต้อง
- ห้ามกรอกตัวอักษร, currency symbol หรืออักขระพิเศษอื่น
- ห้ามกรอกค่าติดลบ
- ห้ามกรอกทศนิยม
- Minimum price ต้องไม่มากกว่า Maximum price
- Maximum price ต้องไม่เกิน price range สูงสุดที่ระบบกำหนดสำหรับ filter นั้น; prototype ปัจจุบันใช้ `2,000,000`
- Minimum price ต้องไม่น้อยกว่า price range ต่ำสุดที่ระบบกำหนดสำหรับ filter นั้น; prototype ปัจจุบันใช้ `0`
- หาก Minimum price เท่ากับ Maximum price ให้ค้นหาราคาที่เท่ากับค่านั้นได้
- เมื่อ input ถูกต้อง ต้อง sync ค่า typed input กับ slider/range control
- เมื่อ input ไม่ถูกต้อง ต้องไม่ Apply filter และต้องแสดง inline validation ใต้ field ที่ผิดหรือใต้ Price Range control

| Case | TH validation message |
|---|---|
| กรอกตัวอักษร/อักขระไม่รองรับ | กรุณากรอกราคาเป็นตัวเลข |
| กรอกค่าติดลบ | ราคาต้องไม่ต่ำกว่า 0 |
| กรอกทศนิยม | กรุณากรอกราคาเป็นจำนวนเต็ม |
| Minimum price > Maximum price | ราคาต่ำสุดต้องไม่มากกว่าราคาสูงสุด |
| Maximum price เกินเพดาน filter | ราคาสูงสุดต้องไม่เกิน 2,000,000 |

## Watch Alert

- ไม่มี Required Field
- หากไม่กรอกชื่อ ให้ระบบสร้างชื่ออัตโนมัติ

---

# 13. Exception Handling

## Result Not Found

| Language | Message |
|---|---|
| TH | ไม่พบข้อมูล |
| EN | No data found |

## Search Error

| Language | Message |
|---|---|
| TH | เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง |
| EN | Something went wrong. Please try again. |

ปุ่ม:

- ลองใหม่

## Asset Deleted

หาก User เปิด Asset Detail จาก Search Result เก่าที่ Asset ถูกลบแล้ว ให้ใช้ Deleted Asset state ของ Asset Detail Module:

| Language | Message |
|---|---|
| TH | รายการนี้ไม่พร้อมใช้งานแล้ว |
| EN | This item is no longer available. |

---

# 14. Empty State

ใช้ข้อความมาตรฐานเดียวกับระบบ:

| Language | Message |
|---|---|
| TH | ไม่พบข้อมูล |
| EN | No data found |

ใช้กับ:

- Search Result
- Watch Alert Result List

---

# 15. Notification Rules

- Search Module ไม่สร้าง Notification โดยตรง
- Watch Alert Notification ถูกจัดการโดย Watch Alert / Notification Module
- เมื่อเปิด Watch Alert Notification ต้องไปที่ Watch Alert Result List
- ต้องไม่เปิด Asset Detail โดยตรงจาก Watch Alert Notification

---

# 16. Analytics Events

- Search Open
- Search Keyword Submit
- Search Autocomplete Select
- Popular Filter Tag Impression
- Popular Filter Tag Select
- Apply Filter
- Clear Filter
- Sort Search Result
- Search Result Click
- Open Asset Detail From Search
- Open Public Profile From Search
- Create Watch Alert
- Watch Alert Result Open

---

# 17. Acceptance Criteria

## Search Visibility

| AC ID | Criteria |
|---|---|
| AC-SEARCH-001 | Search Result ต้องแสดงเฉพาะ Asset สถานะ Sale ที่ User มีสิทธิ์มองเห็น |
| AC-SEARCH-002 | Search Result ต้องไม่แสดง Asset สถานะ Show, Hide และ Sold |
| AC-SEARCH-003 | Search Result ต้องไม่แสดง Asset ของ User ที่ถูก Block หรือ Block กันอยู่ |
| AC-SEARCH-004 | Search Result ต้องเรียง default ตาม Created Date DESC / Newest |

## Guest User

| AC ID | Criteria |
|---|---|
| AC-SEARCH-005 | Guest ต้องสามารถ Search, Filter, View Search Result, Open Asset Detail และ Open Public Profile ได้ |
| AC-SEARCH-006 | Guest ต้องไม่สามารถ Create Watch Alert ได้ |
| AC-SEARCH-007 | เมื่อ Guest กด Create Watch Alert ต้องแสดง Global Login Required Dialog |

## Search & Filter

| AC ID | Criteria |
|---|---|
| AC-SEARCH-008 | Search Keyword ต้องค้นหาจาก Brand, Model และ Reference Number ได้ |
| AC-SEARCH-009 | Filter ต้องรองรับ Brand, Model, Price Range, Year of Production, Reference Number, Delivery Contents, Condition, Case Size, Movement, Dial Color และ Strap / Bracelet |
| AC-SEARCH-009A | Filter option (Brand, Model, Reference, option master) ต้องแสดงทุก entity/option ที่ `is_active=true` พร้อมจำนวน Asset Sale ปัจจุบันข้างชื่อ แม้จำนวนเป็น `0` (no current listing) |
| AC-SEARCH-009B | Entity/option ที่ `is_active=false` (inactive market data หรือ deactivated option) ต้องไม่แสดงเป็นตัวเลือกใหม่ใน filter |
| AC-SEARCH-009C | หน้า Search และหน้า Filter ต้องแสดง Popular Filter/Popular Selection tags จากข้อมูล aggregate ตามหมวดที่เกี่ยวข้อง โดย user ยังเลือกจากรายการเต็มได้ |
| AC-SEARCH-009D | Popular Filter ต้องไม่ตัดตัวเลือกอื่นออก ไม่เปลี่ยน Search/Filter logic และไม่เปิดเผยข้อมูลที่ระบุตัว user รายบุคคล |
| AC-SEARCH-010 | Brand → Model ต้องเป็น Dependent Filter |
| AC-SEARCH-011 | Multiple Filter ต้องใช้ AND Logic |
| AC-SEARCH-012 | Apply Filters ต้องอัปเดต Search Result ตามเงื่อนไขที่เลือก |
| AC-SEARCH-013 | Clear Filters ต้องล้างเงื่อนไขทั้งหมดและอัปเดต Search Result |
| AC-SEARCH-014 | Search Result ต้องแสดง Result Count |
| AC-SEARCH-015 | Sort ต้องรองรับ Relevance, Price Low to High, Price High to Low, Newest และ Popularity |

## Search Result Card

| AC ID | Criteria |
|---|---|
| AC-SEARCH-016 | Search Result Card ต้องแสดง Asset Images, Brand, Model, Price, Posted Time, Owner Name, Like Count และ Comment Count |
| AC-SEARCH-017 | Search Result Card ต้องไม่แสดง Location, Verified Badge และ Status Badge ใน V1 |
| AC-SEARCH-018 | User ต้องสามารถเปิด Asset Detail จาก Search Result ได้ |
| AC-SEARCH-019 | User ต้องสามารถเปิด Public Profile จาก Search Result ได้ |

## Asset Lifecycle

| AC ID | Criteria |
|---|---|
| AC-SEARCH-020 | เมื่อ Asset เปลี่ยนสถานะ Sale → Sold ต้องหายจาก Search Result และ Watch Alert Result List ทันที |
| AC-SEARCH-021 | เมื่อ Asset เปลี่ยนสถานะ Sale → Hide ต้องหายจาก Search Result และ Watch Alert Result List ทันที |
| AC-SEARCH-022 | เมื่อ Asset เปลี่ยนสถานะ Hide → Sale ต้องกลับเข้า Search Result และ Watch Alert Result List หากตรง criteria |
| AC-SEARCH-023 | เมื่อ Asset เปลี่ยนสถานะ Show → Sale ต้องกลับเข้า Search Result และ Watch Alert Result List หากตรง criteria |
| AC-SEARCH-024 | เมื่อ Asset เปลี่ยนสถานะ Sale → Show ต้องหายจาก Search Result และ Watch Alert Result List |
| AC-SEARCH-025 | เมื่อ Asset ถูกลบ ต้องหายจาก Search Result และ Watch Alert Result List |

## Block & Report

| AC ID | Criteria |
|---|---|
| AC-SEARCH-026 | เมื่อ User Block ผู้ใช้อีกคน Asset ของผู้ถูก Block ต้องหายจาก Search Result ทันที |
| AC-SEARCH-027 | การ Report Asset ต้องไม่ทำให้ Asset หายจาก Search Result จนกว่า Admin จะดำเนินการ |

## Watch Alert

| AC ID | Criteria |
|---|---|
| AC-SEARCH-028 | Create Watch Alert ต้องสร้างจาก Search Filter ได้ |
| AC-SEARCH-029 | Watch Alert criteria ต้องไม่มี Required Field แต่ Alert Name ต้องไม่ว่างตอนบันทึก |
| AC-SEARCH-029A | Watch Alert criteria สามารถอ้าง Brand/Model/Reference หรือ option master ที่มี no current listing (จำนวน listing = 0 ตอนสร้าง) ได้ และถือเป็น unmet demand ปกติ ไม่ใช่ inactive market data |
| AC-SEARCH-030 | Watch Alert ต้อง Match เฉพาะ Asset สถานะ Sale |
| AC-SEARCH-031 | เมื่อเปิด Save to Watch Alert ระบบต้องเติมชื่อเริ่มต้นจาก Filter หรือ default name ให้ user แก้ไขได้ |
| AC-SEARCH-031A | หาก User ลบ Alert Name จนว่างแล้วกด Save this search ระบบต้องแจ้งเตือนให้กรอกชื่อและไม่สร้าง Watch Alert |
| AC-SEARCH-032 | Watch Alert Notification ต้องเปิดไปที่ Watch Alert Result List |
| AC-SEARCH-033 | Watch Alert Notification ต้องไม่เปิด Asset Detail โดยตรง |

## Refresh & State

| AC ID | Criteria |
|---|---|
| AC-SEARCH-034 | Search Result ต้องรองรับ Pull To Refresh |
| AC-SEARCH-035 | Search Result ต้องรองรับ Infinite Scroll |
| AC-SEARCH-036 | เมื่อ Scroll ถึงรายการสุดท้าย ต้องแสดงข้อความ `คุณดูรายการทั้งหมดแล้ว` |
| AC-SEARCH-037 | เมื่อไม่พบผลลัพธ์ ต้องแสดง Empty State `ไม่พบข้อมูล` / `No data found` |
| AC-SEARCH-038 | เมื่อโหลด Search Result ไม่สำเร็จ ต้องแสดง Error State พร้อมปุ่ม `ลองใหม่` |

---

# 18. Related Modules

- Feed Module
- Asset Module
- Asset Detail Module
- Profile Module
- Watch Alert Module
- Notification Module
- Trust & Safety Module

---

# 19. Future Enhancement

- Saved Search
- Recent Search
- Trending Search
- AI Search Suggestion
- Search History Sync
- Natural Language Search
