# 04 BO Asset Management Module

**Version:** `BO-04-v1.2`  
**Date:** 2026-09-04  
**Status:** สเปกปัจจุบัน  
**Platform:** Responsive Web Back Office

## UI Standards And Prototype Reference

เอกสารนี้ต้องใช้ร่วมกับ `00_GLOBAL_RULES_MODULE.md` และยึดรูปแบบหน้าจอ/พฤติกรรมที่ยืนยันแล้วใน `../Prototypes/bo-prototype.html` เป็นมาตรฐานหลัก

ห้ามออกแบบ pattern แยกเองสำหรับ list toolbar, breakpoint, table/card layout, pagination, reset, action menu, detail layout หรือ confirmation modal ยกเว้นเอกสารนี้ระบุไว้ชัดเจนว่าเป็น override ที่อนุมัติแล้ว

## 1. Document Information

| Field | Detail |
| --- | --- |
| Module Name | BO Asset Management |
| Platform | Responsive Web Back Office |
| Version | `BO-04-v1.2` |
| Status | สเปกปัจจุบัน |
| Owner | Product / UX / Engineering / Operations |
| Document Type | Functional PRD |

## 2. Objective

Asset Management คือเมนูสำหรับ Admin ใช้ตรวจสอบรายการ asset, รายละเอียด asset, รายงาน asset, รายงานความคิดเห็นบน asset และดำเนินการ moderation ที่มีผลต่อการมองเห็นของ asset หรือความคิดเห็นในระบบ

เมนูนี้ต้องทำงานได้ครบตามขอบเขตต่อไปนี้:

- ดูรายการ asset ทั้งหมด
- ค้นหา กรอง เรียงลำดับ และแบ่งหน้ารายการ asset
- เปิดดูรายละเอียด asset แบบ read-only
- ดูข้อมูล sensitive context ในรูปแบบ read-only/masked/summarized
- ดูรายงาน asset ที่ user ส่งเข้ามา
- ตรวจสอบรายงานและดำเนินการ moderation ตามสถานะที่อนุญาต
- ซ่อน asset ชั่วคราวจาก public surfaces
- ยกเลิกการซ่อนชั่วคราวเมื่อ review แล้วไม่พบปัญหา
- ซ่อน asset ถาวรตามเงื่อนไข moderation
- ปิด report case พร้อมบันทึกผลการตรวจสอบ
- ดูรายงานความคิดเห็น (comment) บน asset ที่ user ส่งเข้ามา
- ตรวจสอบรายงานความคิดเห็นและดำเนินการ moderation ตามสถานะที่อนุญาต
- ซ่อนความคิดเห็นชั่วคราว, ยกเลิกการซ่อนชั่วคราว, ซ่อนความคิดเห็นถาวร หรือปิดรายงานความคิดเห็น
- บันทึก audit log สำหรับทุก action ที่เปลี่ยน state หรือ visibility

## 3. Scope

### In Scope

- Asset List
- Asset Detail
- Reported Assets queue
- Asset Report Detail
- Reported Comments queue
- Comment Report Detail
- Search, filter, sort, pagination และ reset filter
- Owner-controlled asset status: `Sale`, `Show`, `Hide`, `Sold`
- System/retention state: `ลบโดยเจ้าของ`
- Moderation state: `ซ่อนชั่วคราว`, `ซ่อนถาวร`
- Comment status: `Visible`, `Reported`, `Hidden`, `Removed`, `User Deleted`
- Action สำหรับการตรวจสอบและจัดการ asset: ซ่อนชั่วคราว, ยกเลิกซ่อนชั่วคราว, ซ่อนถาวร, ปิดรายงาน
- Action สำหรับการตรวจสอบและจัดการความคิดเห็น: ซ่อนความคิดเห็นชั่วคราว, ยกเลิกการซ่อนชั่วคราว, ซ่อนความคิดเห็นถาวร, ปิดรายงานไม่พบการละเมิด
- Confirmation, reason และ audit สำหรับ action ที่กระทบ visibility หรือ report outcome
- Responsive layout สำหรับ desktop, tablet และ mobile-width browser

### Out Of Scope

- การสร้าง asset แทน user
- การแก้ไข business data ของ asset แทน owner
- การเปลี่ยน owner-controlled status โดยตรงจาก Back Office เช่น `Sale`, `Show`, `Hide`, `Sold`
- การแก้ไขหรือลบความคิดเห็นแทน author
- Payment operation, escrow, offer negotiation และ chat dispute workflow
- AI moderation
- Bulk action
- Export
- Flag/unflag asset
- Reveal sensitive data แบบเต็ม
- Restore จากสถานะซ่อนถาวร
- Restore ความคิดเห็นจากสถานะ `Removed`
- ลบข้อมูล asset จริงจาก Back Office
- ลบข้อมูลความคิดเห็นจริงจาก Back Office

## 4. Menu Structure

เมนูหลัก: `Asset Management`

Submenu ภายใต้ Asset Management:

| เมนู | หน้าที่ |
| --- | --- |
| `Asset List` | แสดงรายการ asset ทั้งหมด, ค้นหา/filter/sort, เปิดรายละเอียด asset และทำ moderation action ที่อนุญาต |
| `Reported Assets` | แสดงคิวรายงาน asset จาก FO, ค้นหา/filter/sort, เปิดรายละเอียดรายงาน และปิดรายงานหรือจัดการ visibility เมื่อจำเป็น |
| `Reported Comments` | แสดงคิวรายงานความคิดเห็นบน asset จาก FO, ค้นหา/filter/sort, เปิดรายละเอียดรายงาน และดำเนินการ moderation ความคิดเห็นหรือปิดรายงานเมื่อจำเป็น |

พฤติกรรมการนำทาง:

- เมื่อเข้า `Asset Management` ให้เปิด `Asset List` เป็นหน้าหลัก
- เมนูที่ถูกเลือกต้องแสดง active state ที่ submenu นั้น
- `Asset Detail` เปิดจาก `Asset List` หรือจากปุ่ม `View Asset` ใน `Asset Report Detail` หรือ `Comment Report Detail`
- `Asset Report Detail` เปิดจากรายการใน `Reported Assets`
- `Comment Report Detail` เปิดจากรายการใน `Reported Comments`
- ปุ่มย้อนกลับจาก `Asset Detail` ต้องกลับไป context เดิมที่เปิดมา
- ปุ่มย้อนกลับจาก `Asset Report Detail` ต้องกลับไป `Reported Assets` พร้อมคง search/filter/sort/page เดิม
- ปุ่มย้อนกลับจาก `Comment Report Detail` ต้องกลับไป `Reported Comments` พร้อมคง search/filter/sort/page เดิม

## 5. Admin Access And Permissions

ระบบใช้ Admin access เดียว โดยตรวจสิทธิ์ตามเมนูและ action ที่ทำ ไม่แยกประเภทบัญชี Admin ในสเปกนี้

| Area | Rule |
| --- | --- |
| Module access | Admin ที่มีสิทธิ์เข้าเมนูสามารถดู list, detail, search, filter, sort และ pagination ได้ |
| Write action | Action ที่เปลี่ยน visibility หรือ report outcome ต้องตรวจ permission, แสดง confirmation, บังคับกรอก reason และบันทึก audit |
| Sensitive data | แสดงเฉพาะรูปแบบ read-only/masked/summarized |
| Direct URL/API | ต้องตรวจสิทธิ์ที่ route, API และ service layer เสมอ |

## 6. Responsive Layout

Asset Management ต้องใช้กฎ responsive กลางจาก `00_GLOBAL_RULES_MODULE.md` และยึดพฤติกรรมที่ยืนยันแล้วใน `../Prototypes/bo-prototype.html`

| Breakpoint | ความกว้าง | ข้อกำหนดของ Asset Management |
| --- | --- | --- |
| Mobile | `<= 760px` | Asset List and Reported Assets render as stacked cards with asset/report identity, status/context pills, key metadata, and compact action menu. Advanced filters collapse inline behind the filter toggle. Asset Detail and Asset Report Detail render as vertical sections with reachable actions. |
| Tablet | `761px - 1365px` | Uses the same page shell and panels as the prototype. Filter toolbar compacts into a grid. Dense tables may scroll inside the list container only when required. |
| Desktop | `> 1365px` | Shows page header, Asset List summary cards, filter toolbar, dense table/grid, pagination footer, and compact row action menu. |

ข้อกำหนดเพิ่มเติม:

- Asset List แสดง summary cards ตาม prototype ส่วน Reported Assets ไม่แสดง summary cards
- ข้อความ, thumbnail, status pill, button, เนื้อหา table/card และ modal ต้องไม่ล้นหรือซ้อนกัน
- Action สำคัญด้าน moderation/report ต้องเข้าถึงได้บน mobile และ desktop
- Filter บน mobile ต้องเปิด/ปิดแบบ inline ในพื้นที่ list และห้ามใช้ drawer หรือ bottom sheet แยก

## 7. Asset List

Asset List ใช้สำหรับ scan asset ทั้งหมดและเปิดรายละเอียดหรือ action ที่ทำได้ตาม state

### Required Fields

- Asset ID
- Asset name
- Brand
- Owner
- Asset Status
- Moderation/Context pill เมื่อมี เช่น `Consignment`, `ซ่อนชั่วคราว`, `ซ่อนถาวร`, `ลบโดยเจ้าของ`
- Row action menu

### Row Actions

Action ในแต่ละ row ต้องแสดงเฉพาะรายการที่ทำได้ตาม current state และ permission

- View Detail
- ซ่อนชั่วคราว
- ยกเลิกซ่อนชั่วคราว
- ซ่อนถาวร

ห้ามมี action สำหรับเปลี่ยน asset status เป็น `Sale`, `Show`, `Hide` หรือ `Sold` โดยตรง

### Search

Asset List ต้องค้นหาได้จาก:

- Asset ID
- Asset name
- Brand
- Owner name
- Description keyword
- Status หรือ context keyword ที่แสดงในรายการ

### Filters

Asset List ต้องมี filter ขั้นต่ำ:

- Status: `Sale`, `Sale + Consignment`, `Show`, `Hide`, `Sold`, `ซ่อนชั่วคราว`, `ซ่อนถาวร`, `ลบโดยเจ้าของ`
- Brand
- Sort: newest first, oldest first
- Reset filter

`Sale + Consignment` เป็นตัวเลือกย่อยใน Status filter สำหรับกรอง asset ประเภท consignment ที่เป็น `Sale`

### Pagination

Asset List ต้องมี pagination ตามเงื่อนไข:

- Page size: 10 assets per page
- มี Previous button
- มี Next button
- มี numbered page buttons
- ต้องคงค่า search/filter/sort ระหว่างเปลี่ยนหน้า
- เมื่อไม่พบข้อมูลให้แสดง empty state `ไม่พบข้อมูล`

### Summary Cards

Asset List แสดง summary cards 2 ใบในแถวเดียวกันบนทุก viewport โดยใช้ grid `minmax(0, 1fr) minmax(0, 2fr)` — Asset Status กว้าง 1/3 และ Top Asset Brands กว้าง 2/3 ของแถว

ที่ breakpoint `<= 760px` summary grid กลับเป็น 1 column (การ์ดเรียงเป็นแถวเดียว)

#### Asset Status Card

- หัวการ์ดแสดงเฉพาะชื่อการ์ด `ASSET STATUS` ไม่มีจำนวนรวมที่หัวการ์ด เพราะมีจำนวนแยกตามสถานะอยู่แล้วใน body
- Body แสดง 4 status rows แยกสีตามสถานะ มีกรอบ แถบสีด้านซ้าย สีพื้นหลังอ่อน และจำนวนด้านขวา
- สีตามสถานะ: Sale เขียว, Show น้ำเงิน, Hide ม่วง, Sold อำพัน
- แต่ละ row แสดง label, detail อธิบายสถานะ และจำนวน asset ของสถานะนั้น
- การ์ดนี้เป็น source of truth ของโครงสร้าง Asset Status card — Dashboard Asset Status card อ้างอิงการ์ดนี้ (ดู `02_DASHBOARD_MODULE.md` section 11.1)

#### Top Asset Brands Card

- หัวการ์ดแสดงเฉพาะชื่อการ์ด `TOP ASSET BRANDS`
- Body แสดง 8 แบรนด์สูงสุดเรียงตามจำนวน asset มากไปน้อย ใน 2 column × 4 row
- ใช้ wa-stat-bar-list pattern เหมือน Popular Keywords ใน Search Insights: แต่ละ row มี dot + ชื่อแบรนด์ + (จำนวน) ชิดซ้าย, % ชิดขวา, และ bar เต็มความกว้างด้านล่าง
- ใช้สีเดียวทั้งการ์ด `#2b6cb0` (น้ำเงิน informational) สำหรับ dot, % และ bar fill เพื่อสื่อ composition/ranking ไม่ใช่ alert
- % และ bar width คำนวณจาก total assets ในหน้า
- ที่ breakpoint `<= 760px` wa-stat-bar-list กลับเป็น 1 column เพื่อให้ bar ยาวพออ่านได้

## 8. Asset Detail

Asset Detail ใช้สำหรับตรวจสอบข้อมูล Asset แบบ read-only และแสดง action สำหรับการตรวจสอบและจัดการตามสถานะปัจจุบันของ Asset

### Core Fields

- Gallery images สูงสุด 10 รูป
- Asset ID
- Asset name
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
- Description
- Owner (Display Name)
- Owner ID
- Owner Account Status
- Comment Count
- Favorite Count
- Asset Status
- Moderation State
- Created timestamp
- Updated timestamp

### Core Field Display Rules

- ข้อมูลรายละเอียด asset/specifications ให้แสดงเฉพาะ field ที่มีข้อมูลจากผู้ใช้หรือจากระบบ
- ถ้า field ใดไม่มีข้อมูล ไม่ต้องแสดง field นั้นบน Asset Detail
- ห้ามสร้าง placeholder เช่น `N/A` สำหรับ field ที่ไม่มีข้อมูล
- ข้อยกเว้นคือ field ที่มี rule แยกเฉพาะ เช่น `Price` ซึ่งต้องแสดงตาม Price Display Rules

### Commerce Fields

- Price
- Offer summary ถ้ามี
- Sold status ถ้ามี
- Sold history ถ้ามี

### Price Display Rules

- Asset Detail ต้องแสดง field `Price` เสมอ
- Asset Report Detail ต้องเข้าถึง field `Price` ผ่าน View Asset modal/reference ได้เสมอ
- ถ้ามีราคาให้แสดงราคาตามข้อมูล asset
- ถ้าไม่มีราคาให้แสดง `-`
- ห้ามสร้าง placeholder เช่น `N/A`
- ราคาเป็นข้อมูล read-only ใน Back Office

### Related Sensitive Data

ข้อมูลต่อไปนี้ต้องแสดงแบบ read-only/masked/summarized เท่านั้น:

- Provenance type
- Purchase Price
- Purchase Date
- Purchase From
- Proof of Payment
- Consignment owner contact
- Consignment terms
- Consignment asking price
- Sold history

Sensitive context ต้องเปิดผ่าน modal หรือ section ที่แยกจากข้อมูลหลัก และต้องไม่แสดงข้อมูลเต็มแบบเปิดโล่ง

### History Section

Asset Detail ต้องแสดง Asset Status History เมื่อมีข้อมูล โดยรวมการเปลี่ยนสถานะ asset, การดำเนินการ moderation, การอ้างอิงรายงาน และ admin action ไว้ในตารางเดียว

คอลัมน์ใน Asset Status History:

- Date / Time
- Actor
- Action
- Status (แสดง owner-controlled status และ moderation state หลังการเปลี่ยนแปลง)
- Reference (อ้างอิง Report ID เมื่อเกี่ยวข้อง)
- Reason / Note

## 9. Asset Status Model

ระบบต้องแยก owner-controlled status ออกจาก moderation state

### Owner-Controlled Status

| Status | Meaning |
| --- | --- |
| `Sale` | Asset เปิดขายและแสดงใน public marketplace |
| `Show` | Asset แสดงใน public profile/detail แต่ไม่อยู่ใน marketplace feed/search |
| `Hide` | Asset เห็นเฉพาะ owner |
| `Sold` | Asset ถูกขายแล้ว ใช้สำหรับ owner history และ admin review |

Admin ห้ามเปลี่ยน owner-controlled status โดยตรงจาก Back Office

### System / Retention State

| State | Meaning |
| --- | --- |
| `ลบโดยเจ้าของ` | Owner ลบ asset จากฝั่งผู้ใช้งานแล้ว ไม่แสดงใน owner list ปกติหรือ public surfaces แต่ Back Office ยังเก็บ record ตาม retention rule ของระบบ |

### Moderation State

| State | Meaning |
| --- | --- |
| None | ไม่มี moderation overlay |
| `ซ่อนชั่วคราว` | Asset ถูกซ่อนจาก public surfaces ระหว่างรอหรือตามผล review |
| `ซ่อนถาวร` | Asset ถูกซ่อนจาก public surfaces ถาวรตาม moderation outcome |

Moderation state เป็น overlay บน owner-controlled status และไม่เปลี่ยนค่า owner-controlled status เดิม

## 10. Visibility Matrix

| State | Public Marketplace | Public Profile/Detail | Owner View | Offer Availability |
| --- | --- | --- | --- | --- |
| `Sale` | แสดง | แสดง | แสดง | ใช้งานได้ |
| `Show` | ไม่แสดง | แสดง | แสดง | ใช้ได้เฉพาะกรณีที่ระบบอนุญาตจาก detail/profile |
| `Hide` | ไม่แสดง | ไม่แสดง | แสดง | ใช้งานไม่ได้ |
| `Sold` | ไม่แสดง | ไม่แสดง | แสดงใน sold history | ใช้งานไม่ได้ |
| `ซ่อนชั่วคราว` | ไม่แสดง | ไม่แสดง | แสดงพร้อมสถานะถูกซ่อนชั่วคราว | Pending offer ต้องถูก pause และห้ามสร้าง offer ใหม่ |
| `ซ่อนถาวร` | ไม่แสดง | ไม่แสดง | แสดงแบบ read-only พร้อมสถานะถูกซ่อนถาวร | Pending offer ต้องถูกตั้งเป็น `Invalidated` และห้ามสร้าง offer ใหม่ |
| `ลบโดยเจ้าของ` | ไม่แสดง | ไม่แสดง | ไม่แสดงใน owner list ปกติ | Pending offer ต้องถูกตั้งเป็น `Cancelled` และห้ามสร้าง offer ใหม่ |

Asset ที่มี state `ซ่อนถาวร` หรือ `ลบโดยเจ้าของ` ต้องไม่ถูกนับใน portfolio value หรือ asset value summary

Offer impact เพิ่มเติมสำหรับ owner-controlled status:

- ถ้า owner เปลี่ยน asset จาก `Sale` หรือ `Show` เป็น `Hide` ระหว่างมี pending offer ให้ตั้ง related offers เป็น `Cancelled`
- ถ้า owner mark asset เป็น `Sold` ให้ตั้ง pending offers อื่นเป็น `Rejected`
- ถ้า asset ถูกซ่อนชั่วคราวหรือ auto hidden จาก report ให้ตั้ง pending offers เป็น `Paused`; เมื่อ review ผ่านและ asset กลับเป็น `Sale`/`Show` ให้กลับเป็น `Pending`

Asset ที่เป็น `Consignment` ต้องไม่ถูกนับใน portfolio value หรือ asset value summary เพราะเป็นของฝากขาย ไม่ใช่ทรัพย์สินที่ owner ถือครองเอง

## 11. Asset Action Rules

### General Requirements

ทุก action สำหรับการตรวจสอบและจัดการต้องมี:

- Permission check
- Confirmation modal
- Required reason
- Before state
- After state
- Actor
- Timestamp
- Audit log
- ผลลัพธ์ที่อัปเดตไปยัง public surfaces ที่เกี่ยวข้อง

### Hide Temporarily

ใช้เพื่อซ่อน asset จาก public surfaces ชั่วคราว

เงื่อนไข:

- ทำได้กับ asset ที่ current owner-controlled status เป็น `Sale` หรือ `Show`
- ทำไม่ได้กับ `Hide`, `Sold`, `ซ่อนถาวร` หรือ `ลบโดยเจ้าของ`
- ต้องคง owner-controlled status เดิมไว้
- ต้องตั้ง moderation state เป็น `ซ่อนชั่วคราว`
- Pending offer ที่เกี่ยวข้องต้องถูกตั้งเป็น `Paused`

### Restore Visibility

ใช้เพื่อยกเลิกการซ่อนชั่วคราวเมื่อ review แล้วไม่พบปัญหา

เงื่อนไข:

- ทำได้เฉพาะ asset ที่อยู่ใน moderation state `ซ่อนชั่วคราว`
- ต้อง restore visibility กลับตาม owner-controlled status เดิม
- ทำไม่ได้กับ `ซ่อนถาวร`
- ต้องบันทึก reason และ audit
- Offer ที่ถูก `Paused` จากการซ่อนชั่วคราวต้องกลับเป็น `Pending` เมื่อ asset กลับเป็น `Sale` หรือ `Show`

### Hide Permanently

ใช้เพื่อซ่อน asset จาก public surfaces ถาวรตาม moderation outcome

เงื่อนไข:

- ทำได้กับ asset ที่ current owner-controlled status เป็น `Sale` หรือ `Show` รวมถึง asset ที่อยู่ใน moderation state `ซ่อนชั่วคราว` อยู่แล้ว
- ทำไม่ได้กับ `Hide`, `Sold`, `ลบโดยเจ้าของ` หรือ asset ที่เป็น `ซ่อนถาวร` อยู่แล้ว
- ต้องใช้ confirmation และ reason
- ต้องตั้ง moderation state เป็น `ซ่อนถาวร`
- Owner ยังเห็น asset แบบ read-only พร้อมสถานะถูกซ่อนถาวร
- Owner แก้ไข publish ใหม่ ยกเลิกซ่อน boost mark sold หรือลบเองไม่ได้
- Asset ไม่ถูกนับใน portfolio value หรือ asset value summary
- Pending offer ที่เกี่ยวข้องต้องถูกตั้งเป็น `Invalidated`

### Asset Deleted By Owner

เมื่อ owner ลบ asset จากฝั่งผู้ใช้งาน:

- Asset ต้องหายจาก public surfaces
- Asset ต้องหายจาก owner list ปกติ
- Back Office ยังต้องเก็บ record ตาม retention rule ของระบบ
- ต้องมี history/audit row ระบุ actor เป็น owner, action เป็น `Asset Deleted By Owner`, before state, after state `ลบโดยเจ้าของ` และ timestamp
- Pending offer ที่เกี่ยวข้องต้องถูกตั้งเป็น `Cancelled`

## 12. Reported Assets

Reported Assets เป็น queue แยกจาก Asset List สำหรับจัดการ report case

### Required Fields

- Report ID
- Asset
- Asset Status
- Moderation/Context pill เมื่อมี
- Report Status
- Reported timestamp
- Report Reason
- Reporters หรือ unique reporter count
- Priority
- Row action menu

Asset ID และ Owner ไม่จำเป็นต้องเป็น column หลักในตาราง Reported Assets แต่ต้องค้นหาได้ และต้องแสดงใน Asset Report Detail หรือ reported asset reference context

### Report Search

Reported Assets ต้องค้นหาได้จาก:

- Report ID
- Asset ID
- Asset name
- Owner name
- Report reason

### Report Filters

Reported Assets ต้องมี filter ขั้นต่ำ:

- Report Status: `Pending`, `Closed`
- Priority
- Sort: newest first, oldest first, reporter count
- Reset filter

### Report Pagination

Reported Assets ต้องมี pagination ตามเงื่อนไข:

- Page size: 10 reports per page
- มี Previous button
- มี Next button
- มี numbered page buttons
- ต้องคงค่า search/filter/sort ระหว่างเปลี่ยนหน้า
- เมื่อไม่พบข้อมูลให้แสดง empty state `ไม่พบข้อมูล`

### Report Status

| Status | Meaning |
| --- | --- |
| `Pending` | Report ยังรอ review หรือยังมี action ที่ต้องตรวจ |
| `Closed` | ปิด report แล้วพร้อม outcome เช่น ตรวจแล้วไม่พบปัญหา หรือดำเนินการ moderation แล้ว |

Report ที่ `Closed` เป็น final state และไม่มี reopen action ในเมนูนี้

## 13. Asset Report Detail

Asset Report Detail ใช้สำหรับตรวจสอบ report case และ action ที่เกี่ยวข้อง

### Required Sections

- Reported Asset reference
- Reporter History
- Admin Action History

ข้อมูลสรุปของ report case แสดงผ่าน header, status pill, moderation/context pill และข้อมูลใน Reported Asset reference

### Reported Asset Reference

- Report ID
- Asset ID
- Asset name
- Owner ID
- Owner name
- Current asset status และ moderation/context state แสดงรวมกันใน Asset Status
- View Asset action

View Asset action ต้องเปิดรายละเอียด asset แบบ read-only และต้องแสดงข้อมูล asset ที่เกี่ยวข้องกับ report context เช่น Price, description, specifications, provenance summary, image gallery และ asset context อื่นที่จำเป็นต่อการตรวจสอบ

### Reporter History

Reporter History ต้องแสดง:

- Report timestamp
- Reporter
- Report status
- Report reason
- Additional details

### Admin Action History

Admin Action History ต้องแสดง:

- วันที่ / เวลา
- ผู้ดำเนินการ
- Action
- สถานะสินทรัพย์ (แสดง owner-controlled status และ moderation state หลังการเปลี่ยนแปลง)
- ส่งอีเมล (สถานะการส่งอีเมลแจ้งผู้ใช้ ถ้ามี)
- รายละเอียด

### Detail Page Actions

Action buttons ต้องแสดงเฉพาะที่ทำได้ตาม current asset state, report status และ permission:

- ปิดรายงาน
- ซ่อนชั่วคราว
- ยกเลิกซ่อนชั่วคราว
- ซ่อนถาวร

## 14. Report Handling Rules

เมื่อ user report asset:

- ต้องสร้างหรืออัปเดต report case
- ต้องเข้า Reported Assets queue
- ต้องนับ reporter แบบ unique reporter
- Report ซ้ำจาก user เดิมต้องไม่เพิ่ม unique reporter count
- Report case ต้องผูกกับ asset current state ล่าสุดเสมอ

### Rules By Reporter Count

| Condition | Required Behavior |
| --- | --- |
| 1 unique reporter | สร้าง report case เป็น `Pending`; asset ยังแสดงตาม status เดิม |
| 3 unique reporters | ยกระดับ priority เป็น review priority; asset ยังแสดงตาม status เดิม |
| 5 unique reporters และ asset ยังเป็น `Sale` หรือ `Show` | ระบบซ่อนชั่วคราวได้ โดยคง owner-controlled status เดิมและตั้ง moderation state เป็น `ซ่อนชั่วคราว`; ต้องมี audit |
| 5 unique reporters แต่ asset เป็น `Hide` หรือ `Sold` แล้ว | ไม่ซ่อนอัตโนมัติ, ห้ามซ่อนชั่วคราว, เก็บ report ใน queue/history และให้ Admin ปิดรายงานได้ |

การซ่อนชั่วคราวจาก report ใช้ได้เฉพาะ asset ที่ current owner-controlled status เป็น `Sale` หรือ `Show`

ถ้า asset ถูก report ตอนเป็น `Sale` หรือ `Show` แล้ว owner เปลี่ยนเป็น `Hide` หรือ asset เปลี่ยนเป็น `Sold` ก่อน Admin action:

- Report ต้องยังอยู่ใน queue/history ตาม report status
- UI ต้องแสดง current asset status ล่าสุด
- ต้องห้ามซ่อนชั่วคราว
- Restore visibility ต้องถูก block ถ้า asset ไม่ได้อยู่ใน moderation state `ซ่อนชั่วคราว`
- Admin ทำได้เฉพาะปิดรายงานหรือซ่อนถาวร เมื่อ current state และ permission อนุญาต

## 15. Report Data Model

Reported Assets queue ต้องใช้ report case เป็น source of truth และ join กับ asset เพื่อแสดง current asset state ล่าสุด

ขั้นต่ำต้องแยกข้อมูลดังนี้:

- Asset Status: `Sale`, `Show`, `Hide`, `Sold`
- Moderation State: None, `ซ่อนชั่วคราว`, `ซ่อนถาวร`
- Report Status: `Pending`, `Closed`
- Report Case: reportId, assetId, reportStatus, uniqueReporterCount, reporter history, reason summary, priority, created timestamp, closed timestamp, audit references

ห้าม infer รายการใน Reported Assets queue จาก asset status, moderation pill หรือข้อความใน asset row เพียงอย่างเดียว

## 16. Reported Comments

Reported Comments เป็น queue แยกจาก Asset List และ Reported Assets สำหรับจัดการ report case ของความคิดเห็น (comment และ reply) บน asset

### Required Fields

- Report ID
- Comment excerpt
- Asset ID และ Asset name
- Report Status (`Pending`, `Closed`)
- Comment Status (`Visible`, `Hidden`, `Removed`, `User Deleted`)
- Report Reason
- Reporters หรือ unique reporter count
- Priority
- Row action menu

Comment ID และ Comment Type แสดงใน Comment Report Detail ไม่ใช่ column หลักใน list

### Comment Report Search

Reported Comments ต้องค้นหาได้จาก:

- Report ID
- Comment ID
- Asset ID
- Asset name
- Author
- Report reason

### Comment Report Filters

Reported Comments ต้องมี filter ขั้นต่ำ:

- Report Status: `Pending`, `Closed`
- Priority
- Sort: newest first, oldest first, reporter count
- Reset filter

### Comment Report Pagination

Reported Comments ต้องมี pagination ตามเงื่อนไข:

- Page size: 10 reports per page
- มี Previous button
- มี Next button
- มี numbered page buttons
- ต้องคงค่า search/filter/sort ระหว่างเปลี่ยนหน้า
- เมื่อไม่พบข้อมูลให้แสดง empty state `ไม่พบข้อมูล`

### Report Status

| Status | Meaning |
| --- | --- |
| `Pending` | Report ยังรอ review หรือยังมี action ที่ต้องตรวจ |
| `Closed` | ปิด report แล้วพร้อม outcome เช่น ตรวจแล้วไม่พบปัญหา หรือดำเนินการ moderation แล้ว |

Report ที่ `Closed` เป็น final state และไม่มี reopen action ในเมนูนี้

## 17. Comment Report Detail

Comment Report Detail ใช้สำหรับตรวจสอบ report case ของความคิดเห็นและ action ที่เกี่ยวข้อง

### Required Sections

- Reported Comment reference
- Comment Detail
- Reporter History
- Admin Action History

ข้อมูลสรุปของ report case แสดงผ่าน header, Report Status pill, Comment Status pill และข้อมูลใน Reported Comment reference

### Reported Comment Reference

- Report ID
- Comment ID
- Asset ID
- Asset Name
- Asset Status รวม owner-controlled status และ moderation/context state
- Created At
- View Asset action

View Asset action ต้องเปิดรายละเอียด asset แบบ read-only ผ่าน modal และต้องแสดงข้อมูล asset ที่เกี่ยวข้องกับ report context เช่น Price, description, specifications, provenance summary, image gallery และ asset context อื่นที่จำเป็นต่อการตรวจสอบ

### Comment Detail

Comment Detail ต้องแสดง:

- Comment Type (`Root comment` หรือ `Reply`)
- Author
- Comment Text (full)
- View all comments action

View all comments action ต้องเปิด modal แสดงความคิดเห็นทั้งหมดของ asset ที่เกี่ยวข้อง เพื่อให้ Admin เห็น context รอบด้านของความคิดเห็นที่ถูกรายงาน

### Reporter History

Reporter History ต้องแสดง:

- วันที่ / เวลา
- Reporter
- Status (เช่น `เปิดเคส`, `รวมเคส`)
- Report Reason
- Additional Details

### Admin Action History

Admin Action History ต้องแสดง:

- วันที่ / เวลา
- ผู้ดำเนินการ
- Action
- ส่งอีเมล (สถานะการส่งอีเมลแจ้งผู้ใช้)
- รายละเอียด

### Detail Page Actions

Action buttons ต้องแสดงเฉพาะที่ทำได้ตาม current comment status, report status และ permission:

- ปิดรายงาน (Close no violation)
- ซ่อนความคิดเห็นชั่วคราว (Hide comment)
- ยกเลิกการซ่อนชั่วคราว (Restore comment)
- ซ่อนความคิดเห็นถาวร (Remove comment)

## 18. Comment Status Contract

ระบบต้องแยก comment status ออกจาก report status และ moderation action

| Status | Meaning | แสดงใน FO |
| --- | --- | --- |
| `Visible` | แสดงปกติ ไม่มี moderation overlay | แสดงปกติ |
| `Reported` | มี report รอ review แต่ยังแสดงอยู่ | แสดงปกติ |
| `Hidden` | Admin ซ่อนชั่วคราวระหว่างตรวจสอบ | ไม่แสดง หรือแสดง hidden state |
| `Removed` | Admin ซ่อนถาวรหลังตรวจสอบ | ไม่แสดง หรือแสดง removed state |
| `User Deleted` | User ลบ comment เอง | ไม่แสดง หรือแสดงตาม retention rule |

Comment status เป็น overlay บน comment record และไม่เปลี่ยนแปลงเนื้อหาต้นฉบับ

## 19. Comment Moderation Action Rules

### General Requirements

ทุก action สำหรับ comment moderation ต้องมี:

- Permission check
- Confirmation modal
- Required reason
- Before state (comment status และ report status)
- After state (comment status และ report status)
- Actor
- Timestamp
- Audit log
- ผลลัพธ์ที่อัปเดตไปยัง FO comment section ที่เกี่ยวข้อง
- การส่งอีเมลแจ้ง author ผ่าน registered email (ยกเว้น `Close no violation`)

### Hide Comment

ใช้เพื่อซ่อนความคิดเห็นจาก public comment section ชั่วคราวระหว่างตรวจสอบ

เงื่อนไข:

- ทำได้กับ comment ที่ current comment status เป็น `Visible` หรือ `Reported`
- ทำไม่ได้กับ `Hidden`, `Removed` หรือ `User Deleted`
- ต้องตั้ง comment status เป็น `Hidden`
- Report status ยังคงเป็น `Pending` (ไม่ปิดรายงานอัตโนมัติ)
- ต้องมี confirmation, reason และ audit
- ต้องส่งอีเมลแจ้ง author ผ่าน registered email

### Restore Comment

ใช้เพื่อยกเลิกการซ่อนชั่วคราวเมื่อ review แล้วไม่พบปัญหา

เงื่อนไข:

- ทำได้เฉพาะ comment ที่อยู่ใน comment status `Hidden`
- ทำไม่ได้กับ `Visible`, `Reported`, `Removed` หรือ `User Deleted`
- ต้อง restore comment status กลับเป็น `Visible`
- ต้องตั้ง report status เป็น `Closed` (ปิดรายงานอัตโนมัติ)
- ต้องมี confirmation, reason และ audit
- ต้องส่งอีเมลแจ้ง author ผ่าน registered email

### Remove Comment

ใช้เพื่อซ่อนความคิดเห็นจาก public comment section ถาวรหลังตรวจสอบ

เงื่อนไข:

- ทำได้กับ comment ที่ current comment status เป็น `Visible`, `Reported` หรือ `Hidden`
- ทำไม่ได้กับ `Removed` หรือ `User Deleted`
- ต้องตั้ง comment status เป็น `Removed`
- ต้องตั้ง report status เป็น `Closed` (ปิดรายงานอัตโนมัติ)
- ไม่สามารถกู้คืนได้ (ไม่มี restore action จาก `Removed`)
- ต้องมี confirmation, reason และ audit
- ต้องส่งอีเมลแจ้ง author ผ่าน registered email

### Close No Violation

ใช้เพื่อปิดรายงานหลังตรวจสอบแล้วไม่พบการละเมิด

เงื่อนไข:

- ทำได้เฉพาะ report ที่อยู่ใน report status `Pending`
- ทำไม่ได้กับ report ที่ `Closed`
- ต้องตั้ง report status เป็น `Closed`
- ต้องไม่เปลี่ยน comment status ใน FO (comment ยังแสดงตาม status เดิม)
- ต้องมี confirmation และ reason
- ไม่ต้องส่งอีเมลแจ้ง author

## 20. Comment Report Handling Rules

เมื่อ user report comment:

- ต้องสร้างหรืออัปเดต report case
- ต้องเข้า Reported Comments queue
- ต้องนับ reporter แบบ unique reporter
- Report ซ้ำจาก user เดิมต้องไม่เพิ่ม unique reporter count
- Report ต้องเข้า queue โดยไม่ทำให้ comment หายจาก FO ทันที (comment ยังแสดงตาม status เดิม)
- Report case ต้องผูกกับ comment current state ล่าสุดเสมอ
- SLA baseline 24 ชั่วโมงสำหรับ comment report ตาม Trust & Safety baseline

## 21. FO Sync Rules For Comment Moderation

| Action | FO Comment Section | Comment Count |
| --- | --- | --- |
| Hide comment | comment หายจาก comment section หรือแสดง hidden state | ต้องสะท้อนจำนวนที่ user มีสิทธิ์เห็น |
| Restore comment | comment กลับมาแสดงใน comment section ตามปกติ | ต้องสะท้อนจำนวนที่ user มีสิทธิ์เห็น |
| Remove comment | comment หายจาก comment section หรือแสดง removed state | ต้องสะท้อนจำนวนที่ user มีสิทธิ์เห็น |
| Close no violation | FO content ไม่เปลี่ยนแปลง | ไม่เปลี่ยนแปลง |

Comment count ที่แสดงใน FO ต้องสะท้อนจำนวนความคิดเห็นที่ user มีสิทธิ์เห็นเท่านั้น ไม่นับ comment ที่ถูก `Hidden`, `Removed` หรือ `User Deleted` ในจำนวนที่แสดง

## 22. Sensitive Data Rules

| Data | Default Behavior |
| --- | --- |
| Purchase Price | Masked |
| Purchase Date | Masked หรือ partial |
| Purchase From | Masked หรือ partial |
| Proof of Payment | Hidden หรือ preview blocked |
| Consignment Owner Contact | Masked |
| Consignment Terms | Masked หรือ summarized |
| Sold History | Limited summary |

Sensitive data ต้องเป็น read-only เสมอในเมนูนี้

## 23. Error, Empty, Loading States

ต้องรองรับ state ต่อไปนี้:

- Loading asset list
- Loading asset detail
- Loading reported asset queue
- Loading report detail
- Loading reported comment queue
- Loading comment report detail
- Empty asset list เมื่อไม่มีข้อมูลตาม filter
- Empty reported asset queue
- Empty reported comment queue
- Empty search result
- Permission denied
- Asset unavailable ระหว่างเปิด detail
- Report unavailable ระหว่างเปิด detail
- Comment report unavailable ระหว่างเปิด detail
- Stale state เมื่อข้อมูลถูกเปลี่ยนก่อนยืนยัน action
- Action error ใน confirmation modal (เช่น สถานะรายงานไม่ตรงเงื่อนไข, ข้อมูลเปลี่ยนระหว่างดำเนินการ, ยังไม่ผ่านเงื่อนไขที่ระบบกำหนด, บันทึกผลไม่สำเร็จ, บันทึก Audit Log ไม่สำเร็จ, เซสชันหมดอายุ)
- Validation error เมื่อไม่กรอก reason

เมื่อ action ล้มเหลว ห้ามเปลี่ยน UI เป็น success state และต้องให้ Admin retry หรือปิด modal ได้

## 24. Audit Requirements

ทุก write action ต้องบันทึก:

- Actor ID
- Actor role/access
- Action type
- Target asset ID
- Target comment ID ถ้ามี
- Related report ID ถ้ามี
- Before state
- After state
- Reason/note
- IP address หรือ session context ถ้ามี
- Timestamp เป็น `Asia/Bangkok`

### Action Types To Audit

Action ของ asset:

- `ASSET_AUTO_HIDE` (ระบบซ่อนชั่วคราวอัตโนมัติเมื่อครบเกณฑ์ reporter)
- `ASSET_TEMP_HIDE`
- `ASSET_TEMP_UNHIDE`
- `ASSET_PERMANENT_HIDE`
- `ASSET_OWNER_DELETE`
- `REPORT_CLOSE`
- `REPORT_REOPEN`

Action ของ comment moderation:

- `COMMENT_HIDE`
- `COMMENT_UNHIDE`
- `COMMENT_REMOVE`
- `COMMENT_REPORT_RESOLVE`

ทุก event ของ comment moderation ต้องมี actor, action, target comment ID, target asset ID, before/after state (comment status และ report status), reason และ timestamp

Audit history ต้องแสดงใน Asset Detail, Asset Report Detail หรือ Comment Report Detail ตาม context ที่เกี่ยวข้อง

## Module-Specific Exceptions

ไม่มี

Asset Management ต้องใช้ app shell, navigation, breakpoint, list toolbar, desktop table/grid, mobile card, pagination, reset, detail, action menu และ confirmation modal ตาม `00_GLOBAL_RULES_MODULE.md` และ `../Prototypes/bo-prototype.html` โดยไม่มี UI/layout override เฉพาะโมดูล

## 25. Acceptance Criteria

| ID | Criteria |
| --- | --- |
| AC-BO-ASSET-001 | Admin ที่มีสิทธิ์เห็น Asset List พร้อม search, filter, sort, pagination และ reset filter |
| AC-BO-ASSET-002 | Asset List แสดง field หลักและ row action ตาม current state ได้ถูกต้อง |
| AC-BO-ASSET-003 | Asset Detail แสดง core fields, commerce fields, sensitive context แบบ masked/summarized และ history ที่เกี่ยวข้อง |
| AC-BO-ASSET-004 | Admin ไม่สามารถเปลี่ยน owner-controlled status `Sale`, `Show`, `Hide`, `Sold` จาก Back Office ได้โดยตรง |
| AC-BO-ASSET-005 | ซ่อนชั่วคราวได้เฉพาะ asset ที่เป็น `Sale` หรือ `Show` และต้องคง owner-controlled status เดิมไว้ |
| AC-BO-ASSET-006 | ยกเลิกซ่อนชั่วคราวได้เฉพาะ asset ที่อยู่ใน moderation state `ซ่อนชั่วคราว` |
| AC-BO-ASSET-007 | ซ่อนถาวรทำให้ asset ถูกซ่อนจาก public surfaces ถาวร และ owner เห็นได้เฉพาะ read-only |
| AC-BO-ASSET-008 | Asset ที่ `ซ่อนถาวร`, `ลบโดยเจ้าของ` หรือเป็น `Consignment` ไม่ถูกนับใน portfolio value หรือ asset value summary |
| AC-BO-ASSET-009 | Asset ที่ลบโดยเจ้าของต้องมี history/audit row พร้อม actor, before state, after state และ timestamp |
| AC-BO-ASSET-010 | Reported Assets queue แสดง report case จาก report source of truth ไม่ infer จาก asset row |
| AC-BO-ASSET-011 | Report threshold 1/3/5 unique reporters ทำงานตาม rule ที่กำหนด |
| AC-BO-ASSET-012 | ถ้า asset เปลี่ยนเป็น `Hide` หรือ `Sold` ก่อน Admin ดำเนินการ ต้องห้ามซ่อนชั่วคราวและแสดง current asset status ล่าสุด |
| AC-BO-ASSET-013 | Close report ต้องมี confirmation, reason เมื่อจำเป็น และ audit |
| AC-BO-ASSET-014 | Report ที่ `Closed` เป็น final state และไม่มี reopen action ในเมนูนี้ |
| AC-BO-ASSET-015 | ทุก action ที่กระทบ visibility หรือ report outcome ต้องมี permission check, confirmation, reason, before/after state และ audit |
| AC-BO-ASSET-016 | Responsive layout ใช้งานได้ครบที่ mobile-width, tablet และ desktop |
| AC-BO-ASSET-017 | Asset Management ต้องทำตาม `00_GLOBAL_RULES_MODULE.md` และ `../Prototypes/bo-prototype.html` สำหรับ list toolbar, responsive table/card behavior, pagination, reset, row/detail actions และ confirmation modal pattern |
| AC-BO-ASSET-018 | Reported Comments queue แสดง report case ของความคิดเห็น พร้อม search, filter, sort, pagination และ reset filter |
| AC-BO-ASSET-019 | Reported Comments List แสดง field หลัก (Report ID, Comment ID, Asset, Comment excerpt, Comment Type, Comment Status, Report Status, Report Reason, Reporters, Priority) และ row action ตาม current state ได้ถูกต้อง |
| AC-BO-ASSET-020 | Comment Report Detail แสดง 4 ส่วนครบ: Reported Comment reference, Comment Detail, Reporter History และ Admin Action History |
| AC-BO-ASSET-021 | Comment Status Contract มี 5 สถานะครบ: `Visible`, `Reported`, `Hidden`, `Removed`, `User Deleted` |
| AC-BO-ASSET-022 | Hide comment ได้เฉพาะ comment ที่เป็น `Visible` หรือ `Reported` และต้องตั้ง comment status เป็น `Hidden` โดยไม่ปิดรายงานอัตโนมัติ |
| AC-BO-ASSET-023 | Restore comment ได้เฉพาะ comment ที่เป็น `Hidden` และต้องตั้ง comment status กลับเป็น `Visible` พร้อมปิดรายงานอัตโนมัติ |
| AC-BO-ASSET-024 | Remove comment ได้กับ comment ที่เป็น `Visible`, `Reported` หรือ `Hidden` และต้องตั้ง comment status เป็น `Removed` พร้อมปิดรายงานอัตโนมัติ ไม่สามารถกู้คืนได้ |
| AC-BO-ASSET-025 | Close no violation ได้เฉพาะ report ที่เป็น `Pending` และต้องไม่เปลี่ยน comment status ใน FO |
| AC-BO-ASSET-026 | Report comment ต้องเข้า queue โดยไม่ทำให้ comment หายจาก FO ทันที และนับ reporter แบบ unique |
| AC-BO-ASSET-027 | FO Sync Rules ครอบคลุมทุก comment moderation action: Hide, Restore, Remove และ Close no violation |
| AC-BO-ASSET-028 | Comment count ใน FO ต้องสะท้อนจำนวนความคิดเห็นที่ user มีสิทธิ์เห็น ไม่นับ `Hidden`, `Removed` หรือ `User Deleted` |
| AC-BO-ASSET-029 | ทุก comment moderation action ต้องบันทึก audit พร้อม actor, action, target comment ID, target asset ID, before/after state, reason และ timestamp |
| AC-BO-ASSET-030 | Comment moderation action (ยกเว้น Close no violation) ต้องส่งอีเมลแจ้ง author ผ่าน registered email |

