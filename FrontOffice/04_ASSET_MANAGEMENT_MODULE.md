# 04 Asset Management Module

อ้างอิงหลักจาก [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md)

---

# 1. Document Information

| Item | Detail |
|---|---|
| Module Name | Asset Management |
| Platform | Mobile Application |
| Version | V1 |
| Owner | Product / UX / Engineering |
| Status | Draft |
| Document Type | Functional PRD |

---

# 2. Objective

Asset Management Module ใช้สำหรับให้ Member จัดการ Asset นาฬิกาของตัวเอง ตั้งแต่เพิ่มรายการ แก้ไขข้อมูล เปลี่ยนสถานะ ลบรายการ และบันทึกการขายตาม status model ของ master

โมดูลนี้ต้องคุม ownership, visibility, lifecycle และข้อมูล private ให้ชัด เพื่อไม่ให้ Asset ที่ไม่ควร public หลุดไปยัง Feed, Search, Watch Alert หรือ Public Profile

---

# 3. Prototype Reference

- `Add new asset.png`
- `Edit asset.png`
- `Detail asset owner.png`
- `Main Owner Profile.png`

---

# 4. Master Alignment Summary

Asset Management Module ต้องยึด master baseline ต่อไปนี้เป็นหลัก:

- ใช้ canonical status ชุดเดียว: `Sale`, `Show`, `Hide`, `Sold`
- Add / Edit Asset ให้ Owner เลือกสถานะระหว่าง `Sale`, `Show`, `Hide`
- `Sold` เป็น terminal state สำหรับบันทึกการขาย ไม่ใช่ status ที่แก้ข้อมูลหลักได้เหมือนสถานะทั่วไป
- Sold Asset ไม่สามารถ Edit ข้อมูลหลักได้
- Sold Asset เก็บไว้เพื่อ Sales History, Portfolio และ Admin Review
- Gallery รองรับสูงสุด 10 รูป
- Asset Management ต้องรองรับ Provenance และ Consignment
- Provenance, Purchase Price, Purchase Date, Purchase From, Proof of Payment, Consignment Owner Contact, Consignment Terms, Sold History และ Portfolio Value Detail เป็น private data
- Sale แสดงใน Owner Profile, Public Profile, Feed, Search และ Watch Alert
- Show แสดงใน Owner Profile และ Public Profile เท่านั้น
- Hide เห็นเฉพาะ Owner
- Sold เห็นเฉพาะ Owner
- Hide และ Sold ต้องไม่ Public, ไม่ขึ้น Feed, ไม่ขึ้น Search และไม่เข้า Watch Alert
- ไม่มี Payment ภายในแอปใน Phase 1

---

# 5. Figma Gap Checklist For Asset Management Module

รายการนี้ใช้เป็น checklist สำหรับปรับ Figma เฉพาะ Asset Management Module ให้ตรงกับ master ก่อนส่งต่อ Dev/QA

| Priority | Gap | Master Baseline | Figma Action |
|---|---|---|---|
| Must Fix | Edit Asset ใช้ status 2 ชั้น เช่น `Status` และ `Sale Status` | Canonical status มีชุดเดียว: `Sale / Show / Hide / Sold` | ปรับ Figma ให้เหลือ status model เดียว |
| Must Fix | Add/Edit อาจเปิดให้เลือก `Sold` เหมือน status ปกติ | Owner แก้ status ได้ระหว่าง `Sale / Show / Hide`; `Sold` ต้องผ่าน Mark as Sold / Sale Record | แยก Mark as Sold flow ออกจาก Edit Asset |
| Must Fix | จำนวนรูปยังเป็น 3 รูป | Master รองรับ Gallery สูงสุด 10 รูป | ปรับ upload/gallery limit เป็น 10 รูป |
| High | ยังไม่เห็น Sold Asset read-only state ชัดเจน | Sold Asset ไม่สามารถ Edit ข้อมูลหลักได้ | เพิ่ม owner detail/edit state ที่ lock main fields ของ Sold Asset |
| High | ยังไม่เห็น Sale Record / Sold History ครบตาม master | Sold History ต้องเก็บ Sale Date, Buyer, Contact, Sale Price, Payment Method, Attachment | เพิ่ม Sale Record Form และ Sold History display |
| High | ยังไม่เห็น privacy treatment ของ Provenance / Consignment / purchase data | ข้อมูลเหล่านี้เป็น private เห็นเฉพาะ Owner หรือ Admin | ระบุ private section/state และห้ามแสดงใน Public Profile |
| High | ยังไม่เห็น lifecycle impact หลังเปลี่ยน status | Sale/Hide/Show/Sold ต้องส่งผลต่อ Feed, Search, Watch Alert, Public Profile ตาม visibility matrix | เพิ่ม state notes หรือ flow annotation ใน Figma |
| Medium | ยังไม่เห็น Delete confirmation และผลกระทบต่อ Chat/Offer | Deleted Asset หายจาก public surfaces, Chat ยังอยู่, Offer ที่เกี่ยวข้องเป็น Cancelled | เพิ่ม delete confirmation และ deleted impact state |
| Medium | อาจมี field `Location` ใน Add/Edit | Master Asset Management ไม่ได้กำหนด Location เป็น field หลัก และ Feed/Search ไม่แสดง Location | ตัด Location ออกจาก V1 หรือย้ายเป็น future/optional หลัง master decision |

---

# 6. Scope

Asset Management Module ใน V1 ครอบคลุม:

- Add Asset
- Edit Asset
- Delete Asset
- Change Status ระหว่าง `Sale`, `Show`, `Hide`
- Mark as Sold
- Sale Record Form
- Sold History
- Asset Ownership
- Provenance
- Consignment

ไม่รวมใน V1:

- Bulk Upload
- Asset Import
- Asset Archive
- QR Asset Verification
- Video Upload
- Payment ภายในแอป
- Watch Authentication Service ในแอป

---

# 7. Screen Mapping

หน้าจอที่เกี่ยวข้องในโมดูลนี้:

1. Add Asset
2. Edit Asset
3. Owner Asset Detail
4. Asset Status Management
5. Delete Asset Confirmation
6. Mark as Sold Confirmation
7. Sale Record Form
8. Sold History
9. Permission Denied State
10. Asset Not Found State

---

# 8. User States

## Guest

ไม่สามารถเข้าถึง Asset Management Module

เมื่อ Guest พยายาม Add Asset หรือใช้ feature ที่ต้อง Login ต้องแสดง Global Login Required Dialog

## Member / Owner

สามารถจัดการ Asset ของตัวเองได้:

- Add Asset
- Edit Asset
- Delete Asset เฉพาะสถานะที่ลบได้
- Change Status ระหว่าง `Sale`, `Show`, `Hide`
- Mark as Sold
- View Sold History

## Non Owner

ไม่สามารถ:

- Edit Asset
- Delete Asset
- Change Status
- Mark as Sold
- View private asset data

## Admin

Admin จัดการผ่าน Back Office เท่านั้น ไม่ใช่ผ่าน Front Office Asset Management Module

---

# 9. User Flow

## Add Asset

```text
Owner Profile / Add Asset Entry
→ Add Asset
→ Upload Images
→ Enter Asset Information
→ Select Status: Sale / Show / Hide
→ Next
→ Select Provenance Type based on Status
→ Enter required provenance or consignment fields
→ Save
→ Uploading / Saving State
→ Asset Created
```

## Edit Asset

```text
Owner Asset Detail
→ Edit
→ Update Information
→ Save
→ Uploading / Saving State
→ Asset Updated
```

## Change Status

```text
Owner Asset Detail / Edit Asset
→ Change Status
→ Select Sale / Show / Hide
→ Save
→ Visibility Updated
```

## Mark as Sold

```text
Owner Asset Detail / Owner Feed Card
→ Mark as Sold
→ Sale Record Form
→ Enter Sale Record
→ Confirm
→ Asset Status = Sold
→ Other Offers Auto Rejected
```

Mark as Sold สามารถเริ่มจาก Owner Asset Detail หรือ Owner Feed more menu ได้ โดยทั้งสอง entry point ต้องเปิด Sale Record Form โดยตรง ไม่ต้องผ่าน Edit Asset

## Delete Asset

```text
Owner Asset Detail / Owner Feed Card
→ Delete
→ Confirmation
→ Asset Deleted
→ Asset Removed From Public Surfaces
```

Delete Asset สามารถเริ่มจาก Owner Asset Detail หรือ Owner Feed more menu ได้ แต่ต้องใช้ confirmation เดียวกัน และไม่มี Undo

## Non Owner Attempts Edit

```text
Asset Detail
→ Edit URL / Action Attempt
→ Permission Denied
```

---

# 10. Business Rules

## Asset Ownership Rule

- User จัดการได้เฉพาะ Asset ของตัวเอง
- Non Owner ไม่มีสิทธิ์ Edit, Delete, Change Status หรือ Mark as Sold
- Private Asset Data ต้องตรวจสิทธิ์ทุกครั้ง

## Add / Edit Supported Fields

Add / Edit Asset ต้องรองรับข้อมูลต่อไปนี้:

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
- Status: `Sale / Show / Hide`
- Provenance
- Consignment

## Required Field Matrix

ฟอร์ม Add / Edit Asset ต้อง validate required fields ตาม status ที่ Owner เลือก:

| Field | Sale | Show | Hide |
|---|---|---|---|
| Photos | Required, minimum 1 and maximum 10 | Required, minimum 1 and maximum 10 | Required, minimum 1 and maximum 10 |
| Brand Name | Required | Required | Required |
| Model / Series | Required | Required | Optional |
| Condition | Required | Optional | Optional |
| Asking Price (THB) | Optional; if empty FO shows `Price on request` | Optional; hidden from public FO surfaces | Optional; hidden from public FO surfaces |
| Owner Estimated Value (Private) | Optional private valuation | Optional private valuation | Optional private valuation |
| Description | Required | Optional | Optional |
| Status | Required: `Sale` | Required: `Show` | Required: `Hide` |

หลักการของ V1:

- `Sale` เป็น marketplace listing; Owner สามารถกรอก Asking Price หรือเว้นว่างได้ ถ้าเว้นว่าง FO buyer-facing surface ต้องแสดง `Price on request`
- `Show` เป็น public collection / public vault ไม่ใช่ marketplace listing; Owner สามารถกรอก Asking Price เพื่อเก็บข้อมูลส่วนตัวได้ แต่ public FO surface ต้องไม่แสดงราคา
- `Hide` เป็น private collection; Owner สามารถกรอก Asking Price เพื่อเก็บข้อมูลส่วนตัวได้ แต่ public FO surface ต้องไม่แสดงราคา
- `Sold` ไม่ใช่ status ใน Add/Edit แต่ Sold detail / Sold History ต้องเก็บและแสดงราคาที่เคยกรอกได้; ใน FO owner-facing sold view หากมีราคาให้แสดงเป็นราคาขีดฆ่าเพื่อสื่อว่าขายแล้ว
- BO/Admin view ต้องแสดง field `Price` เสมอ: ถ้ามีราคาที่ Owner กรอกให้แสดงราคา ถ้าไม่มีให้แสดง `-`
- Reference No., Year, Original Box, Original Paper, Specifications, Purchase Date, Purchase From, Documentation และ Note optional ตาม policy ของ MVP
- Add Asset flow ต้องมี provenance step ก่อน final save โดยให้เลือก `Owner (Asset)` หรือ `Consignment`
- หากเลือก `Owner (Asset)` ต้องกรอก Purchase Price
- หากเลือก `Consignment` ต้องกรอก Full Name, Phone Number และ Asking Price
- Consignment Asking Price ต้องใช้ source เดียวกับ Commerce / listing Asking Price ของ Asset เพื่อไม่ให้ราคา public listing กับ consignment terms ขัดกัน
- `Consignment` เลือกได้เฉพาะเมื่อ Asset status = `Sale`
- หาก Asset status = `Show` หรือ `Hide` provenance step ต้องเป็น `Owner (Asset)` เท่านั้น และไม่แสดงตัวเลือก / tab `Consignment`

### Provenance Type Availability

| Asset Status | Available Provenance Type | UI Behavior |
| --- | --- | --- |
| Sale | `Owner (Asset)` หรือ `Consignment` | แสดง segmented control / tab ให้เลือกสองแบบ |
| Show | `Owner (Asset)` เท่านั้น | ข้ามตัวเลือกประเภทหรือแสดงเฉพาะ Owner (Asset) form |
| Hide | `Owner (Asset)` เท่านั้น | ข้ามตัวเลือกประเภทหรือแสดงเฉพาะ Owner (Asset) form |

## Add Asset Validation Messages

ฟอร์ม Add Asset ต้องแสดง validation ใกล้ field ที่ผิดพลาด และต้องไม่ไปขั้นตอนถัดไปหรือ Save จนกว่า required fields ครบ

| Field / Case | Message |
| --- | --- |
| Photos ว่าง | `กรุณาเพิ่มรูปอย่างน้อย 1 รูป` |
| Photos เกิน 10 รูป | `อัปโหลดรูปได้สูงสุด 10 รูป` |
| Brand Name ว่าง | `กรุณากรอกชื่อแบรนด์` |
| Model / Series ว่างเมื่อ required | `กรุณากรอกรุ่น / ซีรีส์` |
| Condition ว่างเมื่อ required | `กรุณาเลือกสภาพสินค้า` |
| Asking Price ว่าง | ไม่ต้องแสดง error; หาก Status = `Sale` ให้ FO buyer-facing surface แสดง `Price on request` |
| Asking Price <= 0 | `ราคาเสนอขายต้องมากกว่า 0` |
| Description ว่างเมื่อ required | `กรุณากรอกรายละเอียดสินค้า` |
| Status ว่าง | `กรุณาเลือกสถานะ` |
| Year เป็นปีในอนาคต | `ปีต้องไม่เป็นปีในอนาคต` |
| Owner Estimated Value <= 0 | `มูลค่าประมาณต้องมากกว่า 0` |

Provenance validation messages:

| Field / Case | Message |
| --- | --- |
| Owner (Asset) Purchase Price ว่าง | `กรุณากรอกราคาซื้อ` |
| Owner (Asset) Purchase Price <= 0 | `ราคาซื้อต้องมากกว่า 0` |
| Purchase Date เป็นวันที่ในอนาคต | `วันที่ซื้อต้องไม่เป็นวันที่ในอนาคต` |
| Consignment Full Name ว่าง | `กรุณากรอกชื่อผู้ฝากขาย` |
| Consignment Phone Number ว่าง | `กรุณากรอกเบอร์โทรผู้ฝากขาย` |
| Consignment Asking Price ว่าง | `กรุณากรอกราคาเสนอขาย` |
| Consignment Asking Price <= 0 | `ราคาเสนอขายต้องมากกว่า 0` |
| Consignment Email รูปแบบไม่ถูกต้อง | `กรุณากรอกอีเมลให้ถูกต้อง` |
| Consignment Date เป็นวันที่ในอนาคต | `วันที่ฝากขายต้องไม่เป็นวันที่ในอนาคต` |
| Commission ไม่อยู่ในช่วง 0-100 | `ค่าคอมมิชชันต้องอยู่ระหว่าง 0-100%` |
| Minimum Acceptable Price <= 0 | `ราคาขั้นต่ำต้องมากกว่า 0` |
| Minimum Acceptable Price > Asking Price | `ราคาขั้นต่ำต้องไม่มากกว่าราคาเสนอขาย` |

## Provenance / Consignment Field Matrix

Provenance ต้องแยกข้อมูลการเป็นเจ้าของ Asset กับข้อมูลฝากขายให้ชัดเจน:

- `Owner (Asset)` ใช้เมื่อ Owner เป็นเจ้าของ Asset เอง และต้องการบันทึกประวัติการซื้อ/เอกสารส่วนตัว
- `Consignment` ใช้เมื่อ Owner รับฝากขาย Asset ของผู้อื่น และต้องการบันทึกข้อมูลผู้ฝากขาย เงื่อนไขราคา และเอกสารประกอบ
- ข้อมูลทั้งสองกลุ่มเป็น private เห็นเฉพาะ Owner หรือ Admin ตามสิทธิ์ และห้ามแสดงใน Viewer/Public mode
- ใน Add Asset flow ผู้ใช้ต้องเลือก provenance type ก่อน final Save / Upload Asset
- `Consignment` ใช้ได้เฉพาะ Asset status = `Sale` เพราะเป็นรายการฝากขายบน marketplace

### Owner (Asset) Provenance

| Field | Requirement | Validation / Note |
| --- | --- | --- |
| Purchase Price (THB) | Required when saving Owner (Asset) provenance record | ต้องมากกว่า 0; ใช้เป็น asset cost basis, portfolio fallback และ expected profit |
| Purchase Date | Optional | หากกรอกต้องไม่เป็นวันที่ในอนาคต |
| Purchase From | Optional | ชื่อร้าน บุคคล แหล่งซื้อ หรือช่องทางที่ซื้อ |
| All Equipment & Accessories | Optional | Upload รูปกล่อง tag คู่มือ หรืออุปกรณ์ประกอบ |
| Proof of Payment | Optional | Upload ใบเสร็จ invoice certificate หรือเอกสารส่วนตัว |
| Note | Optional | ข้อความส่วนตัวของ Owner |

### Consignment Provenance

| Field | Requirement | Validation / Note |
| --- | --- | --- |
| Full Name | Required when saving Consignment provenance record | ชื่อผู้ฝากขาย ใช้ใน owner/admin private view เท่านั้น |
| Phone Number | Required when saving Consignment provenance record | เบอร์ผู้ฝากขาย ใช้ใน owner/admin private view เท่านั้น |
| Line / IG / Facebook | Optional | ช่องทางติดต่อเสริม |
| Email | Optional | หากกรอกควร validate รูปแบบ email |
| Payout Method | Optional | วิธีจ่ายเงินคืนผู้ฝากขาย |
| Consignment Date | Optional | หากกรอกต้องไม่เป็นวันที่ในอนาคต |
| Consignment Duration | Optional | ระยะเวลาฝากขาย |
| Asking Price (THB) | Required when saving Consignment provenance record | ราคาเสนอขายของ consignment item; ต้องมากกว่า 0 |
| Commission (%) | Optional | หากกรอกต้องอยู่ในช่วง 0-100 |
| Minimum Acceptable Price | Optional | หากกรอกต้องมากกว่า 0 และไม่ควรมากกว่า Asking Price |
| All Equipment & Accessories | Optional | Upload รูปกล่อง tag คู่มือ หรืออุปกรณ์ประกอบ |
| Proof of Payment | Optional | Upload เอกสารรับฝาก ใบเสร็จ หรือ certificate |
| Note | Optional | ข้อความส่วนตัวของ Owner |

Provenance save rules:

- Add Asset ต้องเลือก provenance type ก่อน final Save / Upload Asset
- ถ้า status = `Sale` ต้องให้เลือก `Owner (Asset)` หรือ `Consignment`
- ถ้า status = `Show` หรือ `Hide` ต้องใช้ `Owner (Asset)` เท่านั้น และต้องไม่ให้เลือก `Consignment`
- ถ้าเลือก `Owner (Asset)` ต้อง validate Purchase Price ก่อน Save
- ถ้าเลือก `Consignment` ต้อง validate Full Name, Phone Number และ Asking Price ก่อน Save
- Consignment Asking Price ต้อง prefill จาก Commerce / listing Asking Price ที่กรอกใน Asset detail step และหากแก้ใน Consignment step ต้อง sync กลับเป็น listing Asking Price เดียวกัน
- หากผู้ใช้ย้อนกลับจาก provenance step ไป asset detail ได้ ข้อมูลที่กรอกไว้ต้องคงอยู่
- Optional field ที่เว้นว่างต้องบันทึกเป็น empty/null และต้องไม่สร้าง placeholder text เช่น `N/A` ในข้อมูลจริง
- ถ้า Owner สลับจาก `Owner (Asset)` เป็น `Consignment` ต้องไม่ merge field กัน ให้เก็บเป็นคนละ section หรือให้ user confirm ก่อนแทนที่ข้อมูล provenance type เดิม

## Empty Optional Field Display Rule

หลังบันทึกข้อมูลแล้ว ฟิลด์ optional ที่ไม่ได้กรอกต้องไม่แสดงในหน้าบ้านและ public surfaces:

- Viewer/Public Asset Detail, Feed, Search และ Public Profile ต้องไม่เห็น field name ของ private/optional fields ที่ว่าง
- Owner Asset Detail สามารถซ่อน field ที่ว่างใน private section ได้เช่นกัน เพื่อไม่ให้หน้าเต็มด้วย label เปล่า
- ถ้า section ทั้ง section ไม่มีข้อมูล เช่นไม่มี Purchase Information หรือไม่มี Documentation ให้ซ่อน section นั้น หรือแสดง owner-only empty prompt แบบ action-oriented เช่น `Add provenance` เฉพาะ Owner
- ห้ามแสดง label เปล่าเช่น `Purchase From: -`, `Proof of Payment: -` ใน Viewer/Public mode
- ค่า `—` ใช้ได้เฉพาะ owner-only analytic field ที่ระบบต้องคงตำแหน่งไว้ เช่น Expected Profit หรือ Valuation ไม่ใช่ optional descriptive field ทั่วไป

## Provenance Edit Rule

Owner สามารถแก้ไข Provenance / Consignment ได้เมื่อ Asset ยังไม่ใช่ `Sold`:

- Asset สถานะ `Sale`: Owner แก้ไข `Owner (Asset)` หรือ `Consignment` provenance ได้ตาม type ที่เลือก
- Asset สถานะ `Show`, `Hide`: Owner แก้ไขได้เฉพาะ `Owner (Asset)` provenance เท่านั้น
- หาก Asset ที่เคยเป็น `Consignment` ถูกเปลี่ยนจาก `Sale` เป็น `Show` หรือ `Hide` ระบบต้อง require ให้เปลี่ยน provenance type เป็น `Owner (Asset)` หรือยืนยันยกเลิก/ปิด consignment data ก่อนบันทึก status ใหม่
- Asset สถานะ `Sold`: ห้ามแก้ข้อมูลหลักของ Asset และ Provenance เดิมแบบทับประวัติ แต่ Owner เปิดดูได้แบบ read-only
- หากต้องแก้ข้อมูลส่วนตัวหลังขาย เช่น note หรือเอกสารหลังการขาย ควรใช้ Sold History / Sale Record correction flow ที่มี audit trail ไม่ใช่ Edit Asset ปกติ
- การแก้ Provenance / Consignment ควร update `last updated` และเก็บ audit log ฝั่ง backend/admin สำหรับข้อมูลส่วนตัวที่มีผลต่อ portfolio, consignment settlement หรือ realized gain/loss

## Private Data Rule

ข้อมูลต่อไปนี้เป็น private และเห็นเฉพาะ Owner หรือ Admin ตามสิทธิ์:

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

## Image Rule

- Gallery รองรับสูงสุด 10 รูป
- รูปภาพต้องถูกใช้ใน Asset Detail, Feed/Search card ตาม visibility ของ Asset
- หากลบรูปทั้งหมดไม่ได้ตาม validation ของ product ให้ต้องแจ้ง error ก่อน save

## Status Model Rule

ระบบใช้ status ชุดเดียวเท่านั้น:

- Sale
- Show
- Hide
- Sold

Owner สามารถแก้ไข status ผ่าน Add/Edit ระหว่าง:

- Sale
- Show
- Hide

`Sold` ต้องเกิดจาก Mark as Sold flow พร้อม Sale Record Form

Mark as Sold จาก Feed หรือ Asset Detail เป็น shortcut ไป Sale Record Form โดยตรง ไม่ใช่การเลือก `Sold` จาก Edit Asset

## Visibility Matrix

| Status | Owner Profile | Public Profile | Feed | Search | Watch Alert |
|---|---|---|---|---|---|
| Sale | แสดง | แสดง | แสดง | แสดง | Match |
| Show | แสดง | แสดง | ไม่แสดง | ไม่แสดง | ไม่ Match |
| Hide | แสดงเฉพาะ Owner | ไม่แสดง | ไม่แสดง | ไม่แสดง | ไม่ Match |
| Sold | แสดงเฉพาะ Owner | ไม่แสดง | ไม่แสดง | ไม่แสดง | ไม่ Match |

## Status Change Impact

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

## Sold Asset Rule

- Sold Asset ไม่สามารถ Edit ข้อมูลหลักได้
- Sold Asset เปิดดู Sale History ได้
- Sold Asset เห็นเฉพาะ Owner ใน Owner Profile
- Sold Asset ไม่ Public
- Sold Asset ไม่ขึ้น Feed, Search, Watch Alert

## Sale Record Form

ก่อนเปลี่ยนเป็น Sold ต้องกรอก Sale Record Form

Sale Record Form ต้องถูกเปิดก่อนเสมอเมื่อ Owner เลือก Mark as Sold ไม่ว่าจะเริ่มจาก Owner Asset Detail หรือ Owner Feed more menu

Sale Record Form เก็บ:

- Sale Date
- Buyer
- Contact
- Sale Price
- Payment Method
- Attachment

## Delete Asset Rule

Owner สามารถ Delete ได้สำหรับ Asset ที่ไม่ใช่ Sold ตาม policy ของ V1

Delete Asset ต้องมี Confirmation

Delete Asset จาก Owner Feed more menu ต้องใช้ rule เดียวกับ Delete Asset ใน Asset Management: ต้องมี Confirmation, ไม่มี Undo และ Sold Asset ไม่ควรลบผ่าน V1

เมื่อ Asset ถูกลบ:

- Asset หายจาก Feed
- Asset หายจาก Search
- Asset หายจาก Watch Alert
- Asset หายจาก Public Profile
- Asset Detail ต้องแสดง Deleted Asset state หากเปิดจาก link เก่า
- Chat ยังอยู่
- Offer ที่เกี่ยวข้องต้องเป็น Cancelled

## Offer Impact Rule

เมื่อ Asset เปลี่ยนเป็น Sold:

- Offer อื่นต้อง Auto Reject
- ต้องส่ง Notification ไปยังผู้เสนอราคาที่เกี่ยวข้องตาม Notification / Offer Module

## Payment Rule

Phase 1 ไม่มี Payment ภายในแอป

Payment Method ใน Sale Record เป็นข้อมูลบันทึกการขายเท่านั้น ไม่ใช่ transaction ในแอป

---

# 11. Permission Rules

## Guest

ไม่สามารถ:

- Add Asset
- Edit Asset
- Delete Asset
- Change Status
- Mark as Sold

## Owner

สามารถ:

- Add Asset
- Edit Asset ของตัวเอง
- Delete Asset ของตัวเองตาม policy
- Change Status ระหว่าง Sale / Show / Hide
- Mark as Sold
- View Sold History
- View private asset data ของตัวเอง

## Non Owner

ไม่สามารถ:

- Edit Asset
- Delete Asset
- Change Status
- Mark as Sold
- View private asset data

---

# 12. Validation Rules

## Add / Edit Asset

Gallery:

- Required อย่างน้อย 1 รูป
- Maximum 10 Images

Brand:

- Required

Model / Series:

- Required เมื่อ Status = Sale หรือ Show
- Optional เมื่อ Status = Hide

Condition:

- Required เมื่อ Status = Sale
- Optional เมื่อ Status = Show หรือ Hide

Price:

- Label ใน marketplace listing ต้องใช้ `Asking Price (THB)`
- Optional เมื่อ Status = Sale, Show หรือ Hide
- ต้องมากกว่า 0 เมื่อกรอก
- Status = Sale: ถ้ากรอกราคา FO buyer-facing surface แสดงราคานั้น; ถ้าไม่กรอกให้แสดง `Price on request`
- Status = Show หรือ Hide: แม้กรอกราคา public FO surface ต้องไม่แสดงราคา; เห็นได้เฉพาะ Owner ในหน้าแก้ไข / owner-private view
- Status = Sold: หากมีราคาที่บันทึกไว้ ให้ FO owner-facing sold view แสดงราคาแบบขีดฆ่า; BO แสดงราคาปกติ

Owner Estimated Value:

- Optional เมื่อ Status = Sale, Show หรือ Hide
- ต้องมากกว่า 0 เมื่อกรอก
- ต้องใช้ label `Owner Estimated Value (Private)`
- เป็น private owner value สำหรับ Portfolio / owner valuation เท่านั้น
- ห้ามแสดงใน Public Profile, Feed, Search, Watch Alert หรือ Viewer Asset Detail

Description:

- Required เมื่อ Status = Sale
- Optional เมื่อ Status = Show หรือ Hide

Status:

- Required
- ต้องเป็น `Sale`, `Show`, `Hide` สำหรับ Add/Edit

Year:

- ต้องไม่เป็นปีในอนาคต เมื่อกรอก

Status / Provenance:

- Add Asset ต้องผ่าน provenance step ก่อน final Save / Upload
- Status = Sale ต้องให้เลือก `Owner (Asset)` หรือ `Consignment`
- Status = Show หรือ Hide ต้องใช้ `Owner (Asset)` เท่านั้น และห้ามเลือก `Consignment`

Owner (Asset) Provenance:

- Purchase Price Required
- Purchase Price ต้องมากกว่า 0
- Purchase Date ต้องไม่เป็นวันที่ในอนาคต เมื่อกรอก

Consignment Provenance:

- ใช้ได้เฉพาะ Status = Sale
- Full Name Required
- Phone Number Required
- Asking Price Required และต้องมากกว่า 0
- Email ต้องเป็นรูปแบบ email เมื่อกรอก
- Consignment Date ต้องไม่เป็นวันที่ในอนาคต เมื่อกรอก
- Commission ต้องอยู่ระหว่าง 0-100 เมื่อกรอก
- Minimum Acceptable Price ต้องมากกว่า 0 เมื่อกรอก
- Minimum Acceptable Price ต้องไม่มากกว่า Asking Price เมื่อกรอกทั้งสองค่า
- Consignment Asking Price ต้อง sync กับ Commerce / listing Asking Price

Purchase Date:

- ต้องไม่เป็นวันที่ในอนาคต เมื่อกรอก

Purchase Price:

- ต้องมากกว่า 0 เมื่อกรอก

## Mark as Sold

Sale Date:

- Required
- ต้องไม่เป็นวันที่ในอนาคต

Buyer:

- Required ตาม policy ของ Sale Record

Sale Price:

- Required
- ต้องมากกว่า 0

Payment Method:

- Required

## Add Asset Confirmation

หลัง Owner กรอก Asset Detail และ Provenance ครบตาม required fields แล้วกด final action เพื่อสร้าง Asset ระบบต้องแสดง confirmation ก่อนเริ่ม save/upload

Confirmation copy:

| Language | Title | Body | Secondary | Primary |
|---|---|---|---|---|
| TH | เพิ่มรายการนี้? | ระบบจะบันทึกรายการนี้ลงในคอลเลกชันของคุณตามสถานะที่เลือก | ยกเลิก | เพิ่มรายการ |
| EN | Add this asset? | This will save this asset to your collection based on the selected status. | Cancel | Add asset |

Confirmation behavior:

- ใช้กับ Add Asset final step หลัง Provenance ไม่ใช่ Edit Asset
- กด `Cancel` ต้องปิด popup และคงข้อมูลที่กรอกไว้ทั้งหมด
- กด `Add asset` แล้วต้อง disable action เพื่อกัน duplicate submit
- ระหว่างบันทึกให้ใช้ button loading `Adding...`
- หากมีรูปหรือไฟล์เอกสารที่ต้อง upload ให้แสดง loading message `Uploading files...`
- หากไม่มีไฟล์ upload หรือ upload เสร็จแล้ว ให้แสดง loading message `Adding asset...`
- หากสำเร็จให้แสดง toast/snackbar `Asset added.` และ default ไป Owner Asset Detail ของ asset ที่เพิ่งสร้าง
- หากล้มเหลวต้องคงข้อมูลทั้งหมดใน form, ไม่สร้าง asset ซ้ำ และแสดง `Unable to add asset. Please try again.`

## Change Status Sheet

Owner สามารถเปลี่ยนสถานะ Asset ที่ยังไม่ใช่ `Sold` จาก quick action หรือ Edit Asset ได้ โดย Change Status ควรเป็น bottom sheet / modal sheet สั้น ๆ ไม่ต้องพาเข้า Edit Asset เต็ม

Sheet copy:

- Title: `Change status`
- Subtitle: `Choose where this asset should appear.`
- Secondary action: `Cancel`
- Primary action: `Save`
- Primary loading: `Saving...`
- Success toast: `Asset status updated.`
- Error toast: `Unable to update asset status. Please try again.`

Status options:

| Option | Description | Available From |
|---|---|---|
| Sale | `List on Marketplace Feed for buyers` | Show, Hide |
| Show | `Display in your public profile vault` | Sale, Hide |
| Hide | `Keep hidden in private collection` | Sale, Show |

Rules:

- สถานะปัจจุบันต้องแสดงเป็น selected
- หากเลือกสถานะเดิม ปุ่ม `Save` ต้อง disabled
- `Sold` ต้องไม่อยู่ใน Change Status
- Asset สถานะ `Sold` ต้องไม่เห็นเมนู `Change status`
- `Sale -> Sold` ต้องทำผ่าน `Mark as sold` และ Sale Record Form เท่านั้น
- หลัง save สำเร็จให้ปิด sheet และอัปเดต UI ใน context เดิมทันที
- หากทำจาก Feed แล้วเปลี่ยน `Sale -> Show` หรือ `Sale -> Hide` card ต้องหายจาก Feed ทันที
- หากทำจาก Owner Profile และสถานะใหม่ไม่อยู่ใน tab ปัจจุบัน card ต้องหายจาก tab นั้น และ tab count ต้อง update
- หาก save ล้มเหลวต้องคง selection ใน sheet และไม่เปลี่ยนสถานะจริง

Consignment status conversion:

- หาก Asset เป็น `Consignment` และ Owner เปลี่ยนจาก `Sale` เป็น `Show` หรือ `Hide` ต้องแสดง warning ก่อน เพราะ `Consignment` ใช้ได้เฉพาะ `Sale`
- Warning title: `Change to owner asset?`
- Warning body: `Consignment details are only available for assets listed for sale. To change this status, this asset must use owner purchase history instead.`
- Warning actions: `Cancel` / `Continue`
- หลัง `Continue` ต้องพาไป Provenance และบังคับใช้ `Owner (Asset)` โดย require `Purchase Price`
- Consignment data เดิมต้องไม่ถูก merge กับ Owner purchase history; ให้เก็บเป็น historical/private หรือปิด active consignment ตาม backend policy

## Sale Record Confirmation

หลัง Owner กรอก Sale Record / Sale History และกด `Save` ระบบต้องแสดง confirmation ก่อนเปลี่ยน Asset เป็น `Sold`

Confirmation copy:

| Language | Title | Body | Secondary | Primary |
|---|---|---|---|---|
| TH | บันทึกการขาย? | เมื่อยืนยัน ระบบจะบันทึกประวัติการขาย เปลี่ยนสถานะรายการเป็นขายแล้ว และนำรายการนี้ออกจากฟีด ค้นหา และ Watch Alert | ยกเลิก | บันทึกการขาย |
| EN | Save sale history? | This will save the sale history, mark this asset as sold, and remove it from Feed, Search, and Watch Alert results. | Cancel | Save sale |

Confirmation behavior:

- ห้ามใช้ copy `Confirm sold out?` เพราะ `sold out` เหมาะกับสินค้าหลายชิ้น ไม่ใช่ Asset รายการเดียว
- กด `Cancel` ต้องปิด popup และคงข้อมูลใน Sale Record Form ไว้
- กด `Save sale` / `บันทึกการขาย` แล้วจึงเปลี่ยน Asset status เป็น `Sold`
- หลัง confirm สำเร็จ Offer อื่นต้องถูก Auto Reject ตาม Offer Impact Rule
- หาก save ล้มเหลว ต้องคง Asset status เดิม, คงข้อมูลใน form และแสดง retry/error state

## Edit Asset Confirmation

หลัง Owner แก้ไขข้อมูล Asset และกด `Save` ใน Edit Asset ระบบควรแสดง confirmation ก่อนบันทึกการแก้ไข

Confirmation copy:

| Language | Title | Body | Secondary | Primary |
|---|---|---|---|---|
| TH | บันทึกการแก้ไข? | ระบบจะบันทึกข้อมูลที่แก้ไขและอัปเดตรายการนี้ตามสถานะปัจจุบัน | ยกเลิก | บันทึก |
| EN | Save changes? | This will save your changes and update this asset based on its current status. | Cancel | Save |

Confirmation behavior:

- ห้ามใช้ copy `Save edit asset?` เพราะเป็นภาษาอังกฤษที่ไม่เป็นธรรมชาติ
- กด `Cancel` ต้องปิด popup และคงข้อมูลที่แก้ไว้ใน Edit Asset Form
- กด `Save` แล้วจึงเริ่ม saving / uploading state
- หากมีรูปหรือไฟล์ใหม่ต้องใช้ uploading/saving state ตาม rule เดียวกับ Add Asset
- หาก save สำเร็จ ให้กลับ Owner Asset Detail หรือ state ที่เหมาะสม และแสดงข้อมูลล่าสุด
- หาก save ล้มเหลว ต้องคงข้อมูลที่แก้ไว้ใน form, ไม่เปลี่ยนข้อมูลเดิมของ Asset และแสดง retry/error state
- หากการแก้ไขเปลี่ยน status แล้วกระทบ visibility เช่น Sale -> Show / Hide ต้อง apply lifecycle rule หลัง save สำเร็จเท่านั้น

## Edit Provenance Confirmation

หลัง Owner แก้ไข Provenance / Purchase History หรือ Consignment details และกด `Save` ระบบควรแสดง confirmation ก่อนบันทึก private record

Confirmation copy:

| Context | Language | Title | Body | Secondary | Primary |
|---|---|---|---|---|---|
| Owner (Asset) purchase history | TH | บันทึกประวัติการซื้อ? | ระบบจะบันทึกการแก้ไขประวัติการซื้อของรายการนี้ | ยกเลิก | บันทึก |
| Owner (Asset) purchase history | EN | Save purchase history? | This will save your changes to this asset's purchase history. | Cancel | Save |
| Consignment details | TH | บันทึกข้อมูลฝากขาย? | ระบบจะบันทึกการแก้ไขข้อมูลฝากขายของรายการนี้ | ยกเลิก | บันทึก |
| Consignment details | EN | Save consignment details? | This will save your changes to this asset's consignment details. | Cancel | Save |

Confirmation behavior:

- ห้ามใช้ body ของ Edit Asset เช่น `This will save your changes and update this asset based on its current status.` สำหรับ Provenance เพราะการแก้ประวัติการซื้อเป็น private data และไม่ควรกระทบ public visibility
- กด `Cancel` ต้องปิด popup และคงข้อมูลที่แก้ไว้ใน Provenance form
- กด `Save` แล้วจึงเริ่ม saving / uploading state
- หากมีการแก้รูปเอกสารหรือแนบไฟล์ใหม่ ต้องใช้ uploading/saving state ตาม file upload rule
- หาก save สำเร็จ ให้กลับ Owner Asset Detail / Provenance detail และแสดง private data ล่าสุด
- หาก save ล้มเหลว ต้องคงข้อมูลที่แก้ไว้ใน form, ไม่ overwrite provenance เดิม และแสดง retry/error state
- Sold Asset ต้องไม่ให้แก้ Provenance ผ่าน Edit Provenance ปกติ; ต้องใช้ correction/audit flow ตาม Sold Asset rule

---

# 13. Exception Handling

## Asset Not Found

| Language | Message |
|---|---|
| TH | ไม่พบรายการ |
| EN | Asset not found |

## Permission Denied

| Language | Message |
|---|---|
| TH | คุณไม่มีสิทธิ์ดำเนินการ |
| EN | Permission denied |

## Sold Asset Cannot Edit

| Language | Message |
|---|---|
| TH | รายการที่ขายแล้วไม่สามารถแก้ไขข้อมูลหลักได้ |
| EN | Sold items cannot be edited. |

## Delete Confirmation

ต้องแสดง confirmation ก่อนลบ Asset

Confirmation copy ต้องแจ้งชัดว่า delete ไม่มี Undo:

- Title: `Delete this asset?`
- Body: `This action cannot be undone. This asset will be removed from Feed, Search, Watch Alert results, and your public profile. Related chats will remain, but related offers will be cancelled.`
- Secondary action: `Cancel`
- Destructive action: `Delete`

## Save Error

| Language | Message |
|---|---|
| TH | เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง |
| EN | Something went wrong. Please try again. |

## Uploading / Saving State

เมื่อ Owner กรอกข้อมูลครบและกด `Save` ใน Add / Edit Asset ระบบต้องแสดงสถานะกำลังอัปโหลด/กำลังบันทึกทันที หากมีรูปหรือไฟล์ที่ต้อง upload ให้ใช้ข้อความ `กำลังอัปโหลด...` / `Uploading...`

ระหว่างสถานะนี้:

- ต้อง disable ปุ่ม `Save` เพื่อป้องกันการ submit ซ้ำ
- ต้องป้องกันการแก้ไขข้อมูลที่อาจทำให้ payload เปลี่ยนระหว่าง upload
- ถ้า upload/save สำเร็จ ให้แสดง success state และไปยัง Asset Created / Asset Updated flow
- ถ้า upload/save ล้มเหลว ให้แสดง error พร้อม action สำหรับ retry หรือกลับไปแก้ไขรูป/ข้อมูล

---

# 14. Empty State

Asset Management Module ไม่มี Empty State เฉพาะใน Add/Edit form

Owner Profile และ Sold History ใช้ Global Empty State:

| Language | Message |
|---|---|
| TH | ไม่พบข้อมูล |
| EN | No data found |

---

# 15. Notification Rules

- Asset Management ไม่สร้าง Notification เมื่อ Add/Edit/Delete ตามปกติ
- เมื่อ Asset เปลี่ยนเป็น Sold ระบบต้อง Auto Reject Offer อื่น
- Notification จากการ Auto Reject / Offer status ให้จัดการโดย Offer และ Notification Module

---

# 16. Analytics Events

- Add Asset Open
- Add Asset Success
- Edit Asset Open
- Edit Asset Success
- Delete Asset Success
- Change Asset Status
- Mark As Sold Open
- Mark As Sold Success
- Sale Record Save
- Permission Denied Viewed

---

# 17. Acceptance Criteria

## Ownership & Permission

| AC ID | Criteria |
|---|---|
| AC-ASSET-MGMT-001 | Guest ต้องไม่สามารถเข้า Asset Management Module ได้ |
| AC-ASSET-MGMT-002 | Owner ต้องสามารถ Add Asset ได้ |
| AC-ASSET-MGMT-003 | Owner ต้องสามารถ Edit Asset ของตัวเองได้เมื่อ Asset ไม่ใช่ Sold |
| AC-ASSET-MGMT-004 | Non Owner ต้องไม่สามารถ Edit, Delete, Change Status หรือ Mark as Sold ได้ |
| AC-ASSET-MGMT-005 | Private Asset Data ต้องแสดงเฉพาะ Owner หรือ Admin ตามสิทธิ์ |

## Add / Edit Asset

| AC ID | Criteria |
|---|---|
| AC-ASSET-MGMT-006 | Add / Edit Asset ต้องรองรับ Gallery สูงสุด 10 รูป |
| AC-ASSET-MGMT-006A | Add / Edit Asset ต้อง require อย่างน้อย 1 รูปสำหรับ Sale, Show และ Hide |
| AC-ASSET-MGMT-006B | หลังกรอกข้อมูลครบและกด Save ต้องแสดง uploading/saving state พร้อมข้อความ `กำลังอัปโหลด...` / `Uploading...` เมื่อมีไฟล์ upload และต้อง disable ปุ่ม Save เพื่อป้องกัน duplicate submit |
| AC-ASSET-MGMT-006C | หลัง Owner กด Save ใน Edit Asset ต้องแสดง confirmation copy `Save changes?` / `บันทึกการแก้ไข?` และห้ามใช้คำว่า `Save edit asset?` |
| AC-ASSET-MGMT-006D | หลัง Owner กด final action ใน Add Asset Provenance step ต้องแสดง confirmation `Add this asset?` และ primary action `Add asset` ก่อนสร้าง asset จริง |
| AC-ASSET-MGMT-006E | ระหว่าง Add Asset save/upload ต้อง disable action, แสดง `Adding...` และหากสำเร็จต้องแสดง `Asset added.` ก่อนพาไป Owner Asset Detail ของ asset ที่เพิ่งสร้าง |
| AC-ASSET-MGMT-007 | Add / Edit Asset ต้องรองรับ Brand, Model / Series, Reference No., Year, Condition, Scope of Delivery, Case Size, Thickness, Case Material, Movement, Dial Color, Strap / Bracelet Type, Price และ Description |
| AC-ASSET-MGMT-007A | Status = Sale ต้อง require Photos, Brand Name, Model / Series, Condition และ Description; Price เป็น optional |
| AC-ASSET-MGMT-007B | Status = Sale ถ้ามี Price ต้องแสดงราคาที่ FO buyer-facing surface; ถ้าไม่มี Price ต้องแสดง `Price on request` |
| AC-ASSET-MGMT-007C | Status = Show ต้อง require Photos, Brand Name และ Model / Series; Price เป็น optional และห้ามแสดงใน public FO surface |
| AC-ASSET-MGMT-007D | Status = Hide ต้อง require Photos และ Brand Name เท่านั้น ส่วน Model / Series, Condition, Price และ Description เป็น optional; Price ห้ามแสดงใน public FO surface |
| AC-ASSET-MGMT-007E | BO/Admin view ต้องแสดง field `Price` เสมอ: มีราคาให้แสดงราคา ไม่มีราคาให้แสดง `-` |
| AC-ASSET-MGMT-007F | Sold owner-facing view หากมี Price ต้องแสดงเป็นราคาขีดฆ่า; BO/Admin view แสดงราคาปกติ |
| AC-ASSET-MGMT-008 | Add Asset ต้องมี provenance step ก่อน final Save / Upload โดยให้เลือก `Owner (Asset)` หรือ `Consignment` และข้อมูลทั้งสองแบบต้องเป็น private |
| AC-ASSET-MGMT-008A | Provenance ต้องแยก `Owner (Asset)` purchase information ออกจาก `Consignment` consignor/terms information |
| AC-ASSET-MGMT-008B | หากเลือก `Owner (Asset)` ต้อง require Purchase Price ก่อน Save และ optional field ที่ว่างต้องบันทึกเป็น empty/null โดยไม่สร้าง `N/A` |
| AC-ASSET-MGMT-008C | Optional private fields ที่ว่างต้องไม่แสดงใน Viewer/Public surfaces และ Owner private section ควรซ่อน field ว่างหรือแสดง owner-only prompt เฉพาะ section ที่ไม่มีข้อมูล |
| AC-ASSET-MGMT-008D | Asset สถานะ Sale ต้องให้ Owner แก้ `Owner (Asset)` หรือ `Consignment` provenance ได้ตาม type ที่เลือก; Status = Show หรือ Hide แก้ได้เฉพาะ `Owner (Asset)` provenance; Sold Asset ต้องเป็น read-only |
| AC-ASSET-MGMT-008E | หากเลือก `Consignment` ต้อง require Full Name, Phone Number และ Asking Price ก่อน Save |
| AC-ASSET-MGMT-008F | Consignment Asking Price ต้องใช้ source เดียวกับ Commerce / listing Asking Price และต้อง sync กันหาก user แก้ใน step ใด step หนึ่ง |
| AC-ASSET-MGMT-008G | `Consignment` ต้องเลือกได้เฉพาะ Asset status = Sale เท่านั้น; Status = Show หรือ Hide ต้องแสดงเฉพาะ `Owner (Asset)` provenance form |
| AC-ASSET-MGMT-008H | หาก Asset ที่มี `Consignment` ถูกเปลี่ยนจาก Sale เป็น Show หรือ Hide ต้องบังคับเปลี่ยน provenance type เป็น `Owner (Asset)` หรือปิด consignment data ก่อนบันทึก |
| AC-ASSET-MGMT-008I | หลัง Owner กด Save ใน Edit Provenance ต้องแสดง confirmation เฉพาะ context: `Save purchase history?` สำหรับ Owner (Asset) หรือ `Save consignment details?` สำหรับ Consignment และห้ามใช้ Edit Asset body ที่อ้างถึง current status |
| AC-ASSET-MGMT-009 | Add / Edit Asset ต้องให้เลือก status ได้เฉพาะ Sale, Show และ Hide |
| AC-ASSET-MGMT-010 | Add / Edit Asset ต้องไม่ให้เลือก Sold เป็น status ปกติ |
| AC-ASSET-MGMT-010A | Change Status sheet ต้องให้เลือกเฉพาะ Sale, Show และ Hide โดยไม่มี Sold option และต้อง disable Save เมื่อเลือกสถานะเดิม |
| AC-ASSET-MGMT-010B | Change Status สำเร็จต้องแสดง toast `Asset status updated.` และอัปเดต card/detail/feed ตาม visibility ของสถานะใหม่ทันที |
| AC-ASSET-MGMT-010C | Change Status ล้มเหลวต้องแสดง `Unable to update asset status. Please try again.` และต้องไม่เปลี่ยนสถานะจริง |
| AC-ASSET-MGMT-010D | Asset ที่เป็น Consignment หากเปลี่ยนจาก Sale เป็น Show หรือ Hide ต้องแสดง warning `Change to owner asset?` และบังคับแปลงเป็น `Owner (Asset)` provenance โดย require Purchase Price ก่อนบันทึก |

## Status & Visibility

| AC ID | Criteria |
|---|---|
| AC-ASSET-MGMT-011 | Asset สถานะ Sale ต้องแสดงใน Owner Profile, Public Profile, Feed, Search และ Watch Alert |
| AC-ASSET-MGMT-012 | Asset สถานะ Show ต้องแสดงใน Owner Profile และ Public Profile เท่านั้น |
| AC-ASSET-MGMT-013 | Asset สถานะ Hide ต้องเห็นเฉพาะ Owner |
| AC-ASSET-MGMT-014 | Asset สถานะ Sold ต้องเห็นเฉพาะ Owner |
| AC-ASSET-MGMT-015 | Hide และ Sold ต้องไม่ Public, ไม่ขึ้น Feed, ไม่ขึ้น Search และไม่เข้า Watch Alert |

## Mark as Sold

| AC ID | Criteria |
|---|---|
| AC-ASSET-MGMT-016 | Mark as Sold ต้องเปิด Sale Record Form ก่อนเปลี่ยนสถานะเป็น Sold |
| AC-ASSET-MGMT-016A | Mark as Sold จาก Owner Feed more menu ต้องเปิด Sale Record Form โดยตรง และไม่ต้องผ่าน Edit Asset |
| AC-ASSET-MGMT-016B | หลังกรอก Sale Record และกด Save ต้องแสดง confirmation copy `Save sale history?` / `บันทึกการขาย?` และห้ามใช้คำว่า `Confirm sold out?` |
| AC-ASSET-MGMT-017 | Sale Record Form ต้องเก็บ Sale Date, Buyer, Contact, Sale Price, Payment Method และ Attachment |
| AC-ASSET-MGMT-018 | เมื่อ Mark as Sold สำเร็จ Asset ต้องหายจาก Feed, Following, Favorites, Search และ Watch Alert ทันที |
| AC-ASSET-MGMT-019 | เมื่อ Mark as Sold สำเร็จ Offer อื่นต้องถูก Auto Reject |
| AC-ASSET-MGMT-020 | Sold Asset ต้องไม่สามารถ Edit ข้อมูลหลักได้ |
| AC-ASSET-MGMT-021 | Sold Asset ต้องเปิดดู Sold History ได้ |

## Delete Asset

| AC ID | Criteria |
|---|---|
| AC-ASSET-MGMT-022 | Delete Asset ต้องมี Confirmation และ copy ต้องระบุ `This action cannot be undone.` |
| AC-ASSET-MGMT-022A | Delete Asset จาก Owner Feed more menu ต้องใช้ Confirmation เดียวกับ Asset Management และไม่มี Undo |
| AC-ASSET-MGMT-023 | Owner ต้องสามารถ Delete Asset ที่ไม่ใช่ Sold ตาม policy ของ V1 ได้ |
| AC-ASSET-MGMT-024 | Sold Asset ต้องไม่สามารถ Delete ผ่าน Asset Management ได้ |
| AC-ASSET-MGMT-025 | เมื่อ Delete Asset สำเร็จ Asset ต้องหายจาก Feed, Search, Watch Alert และ Public Profile |
| AC-ASSET-MGMT-026 | เมื่อ Delete Asset สำเร็จ Chat ที่เกี่ยวข้องต้องยังอยู่ แต่ Reference Asset ต้องใช้ deleted asset state |
| AC-ASSET-MGMT-027 | เมื่อ Delete Asset สำเร็จ Offer ที่เกี่ยวข้องต้องเป็น Cancelled |

## Lifecycle

| AC ID | Criteria |
|---|---|
| AC-ASSET-MGMT-028 | เมื่อเปลี่ยน Sale → Hide Asset ต้องหายจาก Feed, Following, Favorites, Search และ Watch Alert |
| AC-ASSET-MGMT-029 | เมื่อเปลี่ยน Hide → Sale Asset ต้องกลับเข้า Feed, Search และ Watch Alert หากตรงเงื่อนไข |
| AC-ASSET-MGMT-030 | เมื่อเปลี่ยน Show → Sale Asset ต้องแสดงใน Feed, Search และ Match Watch Alert |
| AC-ASSET-MGMT-031 | เมื่อเปลี่ยน Sale → Show Asset ต้องหายจาก Feed, Search และไม่ Match Watch Alert แต่ยังอยู่ใน Public Profile |

---

# 18. Related Modules

- Profile Module
- Feed Module
- Search & Filter Module
- Watch Alert Module
- Asset Detail Module
- Chat Module
- Offer Module
- Portfolio Module
- Notification Module
- Trust & Safety Module

---

# 19. Future Enhancement

- Bulk Upload
- Asset Import
- Asset Archive
- QR Asset Verification
- Video Upload
- Watch Authentication Service
