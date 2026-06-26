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
- Watch Alert ไม่มี Required Field
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

ไม่รวมใน V1:

- Saved Search
- Recent Search
- Trending Search
- AI Search Suggestion
- Search History Sync
- Natural Language Search

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

Autocomplete ต้องไม่แสดงตัวเลือกที่ไม่มี Asset สถานะ `Sale` ให้ค้นหาได้จริง

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

## Filter Visibility Rule

Filter option ควรแสดงเฉพาะข้อมูลที่มี Asset อยู่จริงในระบบตาม visibility ของ Search

ตัวอย่าง:

- หากไม่มี Asset Sale ของ `Rolex Daytona` ที่ User มีสิทธิ์เห็น ต้องไม่แสดง `Daytona` เป็น option ที่ทำให้เกิดผลลัพธ์หลอก

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
- Watch Alert ไม่มี Required Field
- Watch Alert Notification ต้องเปิดไปที่ Watch Alert Result List
- Watch Alert Notification ต้องไม่เปิด Asset Detail โดยตรง

## Watch Alert Name Rule

หาก User ไม่กรอกชื่อ Alert ระบบสร้างชื่ออัตโนมัติจาก Filter ที่ใช้อยู่

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
| AC-SEARCH-029 | Watch Alert ต้องไม่มี Required Field |
| AC-SEARCH-030 | Watch Alert ต้อง Match เฉพาะ Asset สถานะ Sale |
| AC-SEARCH-031 | หาก User ไม่กรอกชื่อ Watch Alert ระบบต้องสร้างชื่ออัตโนมัติจาก Filter |
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
