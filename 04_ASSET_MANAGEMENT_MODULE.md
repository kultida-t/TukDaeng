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
→ Enter Optional Private Information
→ Select Status: Sale / Show / Hide
→ Save
→ Asset Created
```

## Edit Asset

```text
Owner Asset Detail
→ Edit
→ Update Information
→ Save
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
| Price (THB) | Required, must be greater than 0 | Not required for public collection display | Optional private/owner value only |
| Description | Required | Optional | Optional |
| Status | Required: `Sale` | Required: `Show` | Required: `Hide` |

หลักการของ V1:

- `Sale` เป็น marketplace listing จึงต้องมีข้อมูลขั้นต่ำให้ buyer ประเมินและเสนอซื้อได้
- `Show` เป็น public collection / public vault ไม่ใช่ marketplace listing จึงไม่บังคับ Price
- `Hide` เป็น private collection จึงต้องการข้อมูลขั้นต่ำที่สุดสำหรับ owner cataloging
- Reference No., Year, Original Box, Original Paper, Specifications, Provenance, Purchase Information, Documentation และ Consignment optional ตาม policy ของ MVP
- หาก asset เป็น consignment item ให้ Full Name, Phone Number และ Asking Price เป็น recommended required fields ของ consignment workflow แยกจาก Add/Edit asset baseline

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

- Required เมื่อ Status = Sale
- ต้องมากกว่า 0 เมื่อกรอก
- ไม่บังคับสำหรับ Status = Show เพราะ Show ไม่ใช่ marketplace listing
- Optional และต้องเป็น private/owner value เมื่อ Status = Hide

Description:

- Required เมื่อ Status = Sale
- Optional เมื่อ Status = Show หรือ Hide

Status:

- Required
- ต้องเป็น `Sale`, `Show`, `Hide` สำหรับ Add/Edit

Year:

- ต้องไม่เป็นปีในอนาคต เมื่อกรอก

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

## Save Error

| Language | Message |
|---|---|
| TH | เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง |
| EN | Something went wrong. Please try again. |

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
| AC-ASSET-MGMT-007 | Add / Edit Asset ต้องรองรับ Brand, Model / Series, Reference No., Year, Condition, Scope of Delivery, Case Size, Thickness, Case Material, Movement, Dial Color, Strap / Bracelet Type, Price และ Description |
| AC-ASSET-MGMT-007A | Status = Sale ต้อง require Photos, Brand Name, Model / Series, Condition, Price และ Description |
| AC-ASSET-MGMT-007B | Status = Show ต้อง require Photos, Brand Name และ Model / Series โดยไม่บังคับ Price |
| AC-ASSET-MGMT-007C | Status = Hide ต้อง require Photos และ Brand Name เท่านั้น ส่วน Model / Series, Condition, Price และ Description เป็น optional |
| AC-ASSET-MGMT-008 | Add / Edit Asset ต้องรองรับ Provenance และ Consignment เป็นข้อมูล private |
| AC-ASSET-MGMT-009 | Add / Edit Asset ต้องให้เลือก status ได้เฉพาะ Sale, Show และ Hide |
| AC-ASSET-MGMT-010 | Add / Edit Asset ต้องไม่ให้เลือก Sold เป็น status ปกติ |

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
| AC-ASSET-MGMT-017 | Sale Record Form ต้องเก็บ Sale Date, Buyer, Contact, Sale Price, Payment Method และ Attachment |
| AC-ASSET-MGMT-018 | เมื่อ Mark as Sold สำเร็จ Asset ต้องหายจาก Feed, Following, Favorites, Search และ Watch Alert ทันที |
| AC-ASSET-MGMT-019 | เมื่อ Mark as Sold สำเร็จ Offer อื่นต้องถูก Auto Reject |
| AC-ASSET-MGMT-020 | Sold Asset ต้องไม่สามารถ Edit ข้อมูลหลักได้ |
| AC-ASSET-MGMT-021 | Sold Asset ต้องเปิดดู Sold History ได้ |

## Delete Asset

| AC ID | Criteria |
|---|---|
| AC-ASSET-MGMT-022 | Delete Asset ต้องมี Confirmation |
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
