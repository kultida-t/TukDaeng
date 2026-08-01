# 04 BO Asset Management Module

**Version:** `BO-04-v1.0`  
**Date:** 2026-07-31  
**Status:** Current functional specification  
**Platform:** Responsive Web Back Office

## 1. Objective

Asset Management คือเมนูสำหรับ Admin ใช้ตรวจสอบรายการ asset, รายละเอียด asset, รายงาน asset และดำเนินการ moderation ที่มีผลต่อการมองเห็นของ asset ในระบบ

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
- บันทึก audit log สำหรับทุก action ที่เปลี่ยน state หรือ visibility

## 2. Scope

### In Scope

- Asset List
- Asset Detail
- Reported Assets queue
- Asset Report Detail
- Search, filter, sort, pagination และ reset filter
- Owner-controlled asset status: `Sale`, `Show`, `Hide`, `Sold`
- System/retention state: `ลบโดยเจ้าของ`
- Moderation state: `ซ่อนชั่วคราว`, `ซ่อนถาวร`
- Action สำหรับการตรวจสอบและจัดการ: ซ่อนชั่วคราว, ยกเลิกซ่อนชั่วคราว, ซ่อนถาวร, ปิดรายงาน
- Confirmation, reason และ audit สำหรับ action ที่กระทบ visibility หรือ report outcome
- Responsive layout สำหรับ desktop, tablet และ mobile-width browser

### Out Of Scope

- การสร้าง asset แทน user
- การแก้ไข business data ของ asset แทน owner
- การเปลี่ยน owner-controlled status โดยตรงจาก Back Office เช่น `Sale`, `Show`, `Hide`, `Sold`
- Payment operation, escrow, offer negotiation และ chat dispute workflow
- AI moderation
- Bulk action
- Export
- Flag/unflag asset
- Reveal sensitive data แบบเต็ม
- Restore จากสถานะซ่อนถาวร
- ลบข้อมูล asset จริงจาก Back Office

## 3. Menu Structure

เมนู Asset Management ต้องมี submenu ต่อไปนี้:

- `Asset List`
- `Reported Assets`

เมื่อเปิด asset จาก `Asset List` ต้องเข้าสู่ `Asset Detail`

เมื่อเปิด report จาก `Reported Assets` ต้องเข้าสู่ `Asset Report Detail`

ทุกหน้าต้องมี breadcrumb หรือ back navigation ที่พากลับไปยังหน้ารายการต้นทางได้ถูกต้อง

## 4. Access And Permission Rules

ระบบใช้ Admin access เดียว โดยตรวจสิทธิ์ตามเมนูและ action ที่ทำ ไม่แยกประเภทบัญชี Admin ในสเปกนี้

| Area | Rule |
| --- | --- |
| Module access | Admin ที่มีสิทธิ์เข้าเมนูสามารถดู list, detail, search, filter, sort และ pagination ได้ |
| Write action | Action ที่เปลี่ยน visibility หรือ report outcome ต้องตรวจ permission, แสดง confirmation, บังคับกรอก reason และบันทึก audit |
| Sensitive data | แสดงเฉพาะรูปแบบ read-only/masked/summarized |
| Direct URL/API | ต้องตรวจสิทธิ์ที่ route, API และ service layer เสมอ |

## 5. Responsive Layout

เมนู Asset Management ต้องใช้งานได้ครบทุกขนาดหน้าจอ

| Width | Layout Requirement |
| --- | --- |
| Mobile-width browser | ตารางเปลี่ยนเป็น stacked cards, filter อยู่ใน drawer หรือ bottom sheet, action หลักยังเข้าถึงได้ |
| Tablet | แสดง column สำคัญในตาราง และเปิดข้อมูลรองผ่าน detail view |
| Desktop | แสดง full table, filter, pagination และ detail/action flow ได้ครบ |

ห้ามมี horizontal overflow ที่ทำให้ action หลักใช้งานไม่ได้ ยกเว้นพื้นที่ตารางที่ตั้งใจให้ scroll ภายใน container

## 6. Asset List

Asset List ใช้สำหรับ scan asset ทั้งหมดและเปิดรายละเอียดหรือ action ที่ทำได้ตาม state

### Required Display Fields

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

- Status: `Sale`, `Show`, `Hide`, `Sold`, `ซ่อนถาวร`, `ลบโดยเจ้าของ`
- Preset: `Sale - Consignment`
- Brand
- Sort: newest first, oldest first
- Reset filter

### Pagination

Asset List ต้องมี pagination ตามเงื่อนไข:

- Page size: 10 assets per page
- มี Previous button
- มี Next button
- มี numbered page buttons
- ต้องคงค่า search/filter/sort ระหว่างเปลี่ยนหน้า
- เมื่อไม่พบข้อมูลให้แสดง empty state `ไม่พบข้อมูล`

## 7. Asset Detail

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
- Owner
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
- Owner Estimated Value
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

### Sensitive Context

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

### History Sections

Asset Detail ต้องแสดง history ที่เกี่ยวข้องเมื่อมีข้อมูล:

- Asset Status History
- Moderation History
- Report History
- Admin Action History

## 8. Asset Status Model

ระบบต้องแยก owner-controlled status ออกจาก moderation state

### Owner-Controlled Status

| Status | Meaning |
| --- | --- |
| `Sale` | Asset เปิดขายและแสดงใน public marketplace |
| `Show` | Asset แสดงใน public profile/detail แต่ไม่อยู่ใน marketplace feed/search |
| `Hide` | Asset เห็นเฉพาะ owner |
| `Sold` | Asset ถูกขายแล้ว ใช้สำหรับ owner history และ admin review |

Admin ห้ามเปลี่ยน owner-controlled status โดยตรงจาก Back Office

### System/Retention State

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

## 9. Visibility Matrix

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

Asset ที่เป็น `Consignment` ต้องไม่ถูกนับใน portfolio value หรือ asset value summary เพราะเป็นของฝากขาย ไม่ใช่ทรัพย์สินที่ owner ถือครองเอง

## 10. Asset Action Rules

### ข้อกำหนดทั่วไป

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

### ซ่อนชั่วคราว

ใช้เพื่อซ่อน asset จาก public surfaces ชั่วคราว

เงื่อนไข:

- ทำได้กับ asset ที่ current owner-controlled status เป็น `Sale` หรือ `Show`
- ทำไม่ได้กับ `Hide`, `Sold`, `ซ่อนถาวร` หรือ `ลบโดยเจ้าของ`
- ต้องคง owner-controlled status เดิมไว้
- ต้องตั้ง moderation state เป็น `ซ่อนชั่วคราว`

### ยกเลิกซ่อนชั่วคราว

ใช้เพื่อยกเลิกการซ่อนชั่วคราวเมื่อ review แล้วไม่พบปัญหา

เงื่อนไข:

- ทำได้เฉพาะ asset ที่อยู่ใน moderation state `ซ่อนชั่วคราว`
- ต้อง restore visibility กลับตาม owner-controlled status เดิม
- ทำไม่ได้กับ `ซ่อนถาวร`
- ต้องบันทึก reason และ audit

### ซ่อนถาวร

ใช้เพื่อซ่อน asset จาก public surfaces ถาวรตาม moderation outcome

เงื่อนไข:

- ต้องใช้ confirmation และ reason
- ต้องตั้ง moderation state เป็น `ซ่อนถาวร`
- Owner ยังเห็น asset แบบ read-only พร้อมสถานะถูกซ่อนถาวร
- Owner แก้ไข publish ใหม่ ยกเลิกซ่อน boost mark sold หรือลบเองไม่ได้
- Asset ไม่ถูกนับใน portfolio value หรือ asset value summary
- Pending offer ที่เกี่ยวข้องต้องถูกตั้งเป็น `Invalidated`

### ลบโดยเจ้าของ

เมื่อ owner ลบ asset จากฝั่งผู้ใช้งาน:

- Asset ต้องหายจาก public surfaces
- Asset ต้องหายจาก owner list ปกติ
- Back Office ยังต้องเก็บ record ตาม retention rule ของระบบ
- ต้องมี history/audit row ระบุ actor เป็น owner, action เป็น `Asset Deleted By Owner`, before state, after state `ลบโดยเจ้าของ` และ timestamp
- Pending offer ที่เกี่ยวข้องต้องถูกตั้งเป็น `Cancelled`

## 11. Reported Assets

Reported Assets เป็น queue แยกจาก Asset List สำหรับจัดการ report case

### Required Display Fields

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

## 12. Asset Report Detail

Asset Report Detail ใช้สำหรับตรวจสอบ report case และ action ที่เกี่ยวข้อง

### Required Sections

- Reported Asset reference
- Reporter History
- Admin Action History

ข้อมูลสรุปของ report case แสดงผ่าน header, status pill, moderation/context pill และข้อมูลใน Reported Asset reference

### Required Reported Asset Reference

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

### Detail Actions

Action buttons ต้องแสดงเฉพาะที่ทำได้ตาม current asset state, report status และ permission:

- ปิดรายงาน
- ซ่อนชั่วคราว
- ยกเลิกซ่อนชั่วคราว
- ซ่อนถาวร

## 13. Report Handling Rules

เมื่อ user report asset:

- ต้องสร้างหรืออัปเดต report case
- ต้องเข้า Reported Assets queue
- ต้องนับ reporter แบบ unique reporter
- Report ซ้ำจาก user เดิมต้องไม่เพิ่ม unique reporter count
- Report case ต้องผูกกับ asset current state ล่าสุดเสมอ

### Threshold Rules

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

## 14. Report Data Model

Reported Assets queue ต้องใช้ report case เป็น source of truth และ join กับ asset เพื่อแสดง current asset state ล่าสุด

ขั้นต่ำต้องแยกข้อมูลดังนี้:

- Asset Status: `Sale`, `Show`, `Hide`, `Sold`
- Moderation State: None, `ซ่อนชั่วคราว`, `ซ่อนถาวร`
- Report Status: `Pending`, `Closed`
- Report Case: reportId, assetId, reportStatus, uniqueReporterCount, reporter history, reason summary, priority, created timestamp, closed timestamp, audit references

ห้าม infer รายการใน Reported Assets queue จาก asset status, moderation pill หรือข้อความใน asset row เพียงอย่างเดียว

## 15. Sensitive Data Rules

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

## 16. Error, Empty And Loading States

ต้องรองรับ state ต่อไปนี้:

- Loading asset list
- Loading asset detail
- Loading reported asset queue
- Loading report detail
- Empty asset list เมื่อไม่มีข้อมูลตาม filter
- Empty reported asset queue
- Empty search result
- Permission denied
- Asset unavailable ระหว่างเปิด detail
- Report unavailable ระหว่างเปิด detail
- Stale state เมื่อข้อมูลถูกเปลี่ยนก่อนยืนยัน action
- Action error ใน confirmation modal
- Validation error เมื่อไม่กรอก reason

เมื่อ action ล้มเหลว ห้ามเปลี่ยน UI เป็น success state และต้องให้ Admin retry หรือปิด modal ได้

## 17. Audit Requirements

ทุก write action ต้องบันทึก:

- Actor ID
- Actor role/access
- Action type
- Target asset ID
- Related report ID ถ้ามี
- Before state
- After state
- Reason/note
- IP address หรือ session context ถ้ามี
- Timestamp เป็น `Asia/Bangkok`

### Required Action Types

- `ASSET_TEMP_HIDE`
- `ASSET_TEMP_UNHIDE`
- `ASSET_PERMANENT_HIDE`
- `ASSET_OWNER_DELETE`
- `REPORT_CLOSE`
- `REPORT_CLEAR`

Audit history ต้องแสดงใน Asset Detail หรือ Asset Report Detail ตาม context ที่เกี่ยวข้อง

## 18. Acceptance Criteria

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
