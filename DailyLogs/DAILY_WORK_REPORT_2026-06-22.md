# Daily Work Report: Tuk Daeng

**วันที่:** 2026-06-22  
**ผู้ทำงาน:** Codex handoff continuation  
**โปรเจกต์:** Tuk Daeng  
**Environment ที่ focus:** docs / PRD handoff / Dev-QA checklist  
**Branch:** `docs-frontoffice-spec-updates-2026-06-16`  
**สถานะ repo ตอนเริ่มวัน:** มีไฟล์ Word input ใหม่ 2 ไฟล์ที่ยัง untracked

---

## 1. สถานะล่าสุดก่อนเริ่มงานวันนี้

งานก่อนหน้าปิด baseline ฝั่ง Front Office PRD, module PRD, Figma cleanup breakdown, Dev checklist และ QA checklist ไว้แล้ว โดย next step คือไล่เก็บรายละเอียดที่กระทบ Asset Detail, Profile, Watch Alert, Notification และ Settings

วันนี้มีเอกสาร input ใหม่ 2 ไฟล์:

- `Tukdaeng Marketplace - Required Fields for Sale Listing.docx`
- `Tukdaeng Marketplace - Required Fields for Show _ Hide Status.docx`

เอกสารทั้งสองไฟล์ระบุ required fields สำหรับ Asset status `Sale`, `Show` และ `Hide` ชัดเจนขึ้น จึงต้อง sync กลับเข้า master PRD, Asset Management module, Dev checklist, Figma cleanup ticket และ QA checklist

---

## 2. งานเอกสารที่ทำวันนี้

### 2.1 Extract requirement จาก Word input

- อ่าน requirement จากไฟล์ Sale Listing
- อ่าน requirement จากไฟล์ Show / Hide Status
- สรุป Product Decision เป็น matrix:
  - `Sale` require Photos, Brand, Model / Series, Condition, Price, Description
  - `Show` require Photos, Brand, Model / Series
  - `Hide` require Photos, Brand
  - Photos require อย่างน้อย 1 รูป และสูงสุด 10 รูปทุก status
  - Price ของ `Show` ไม่ใช่ required listing field เพราะ `Show` เป็น public collection ไม่ใช่ marketplace listing

### 2.2 Update source-of-truth docs

- เพิ่ม `Required Field Matrix` ใน `TukDaeng_Master_Product_Definition.md`
- เพิ่ม `Required Field Matrix` และ validation detail ใน `04_ASSET_MANAGEMENT_MODULE.md`
- เพิ่ม acceptance criteria ใหม่สำหรับ minimum photo และ required fields แยกตาม `Sale`, `Show`, `Hide`

### 2.3 Update handoff checklist

- เพิ่ม Dev checklist สำหรับ required field validation ของ `Sale`, `Show`, `Hide`
- อัปเดต `UX-MF-006` ใน `FIGMA_UX_CLEANUP_TASK_BREAKDOWN.md` ให้รวม required field state ตาม status matrix
- เพิ่ม QA scenarios:
  - minimum photo required
  - Sale required fields
  - Show required fields without price
  - Hide minimal required fields

### 2.4 Lock Dev baseline handoff

- เพิ่ม `DEV_BASELINE_HANDOFF_2026-06-22.md` สำหรับส่ง Dev โดยตรง
- ระบุว่าเอกสารชุดนี้เป็น baseline ใหม่ทั้งชุด ไม่ใช่ delta เฉพาะวันที่ 2026-06-22
- Product review แล้วและตกลงให้ใช้เป็น baseline สำหรับ Dev review app ที่ทำไปก่อนหน้า

### 2.5 Close status switching QA and Hide valuation label

- เพิ่ม QA scenarios สำหรับ status switching:
  - Sale → Show
  - Show → Sale
  - Sale → Hide
  - Hide → Sale
- ตัดสินใจ label ของ private value สำหรับ `Hide` แล้วว่าไม่ใช้ listing price
- หาก Owner ต้องการเก็บมูลค่าส่วนตัว ให้ใช้ `Owner Estimated Value (Private)` และต้องไม่แสดงใน public/viewer surfaces

### 2.6 Prepare Figma Add/Edit Asset cleanup pack

- เพิ่ม `Next Figma Work Pack: Add / Edit Asset` ใน `FIGMA_UX_CLEANUP_TASK_BREAKDOWN.md`
- แตก checklist สำหรับ screens/components, required Figma changes, status switching prototype notes และ acceptance gate
- อัปเดต `Figma_Gap_Checklist_Against_Master.md` ให้ระบุ required fields แยกตาม `Sale / Show / Hide`
- เพิ่ม gap เรื่อง `Hide` ต้องไม่ใช้ `Price` / `Asking Price` และต้องใช้ `Owner Estimated Value (Private)` สำหรับ private valuation

### 2.7 Add Chat-specific Dev checklist

- เพิ่ม `DEV_CHAT_IMPLEMENTATION_CHECKLIST.md` สำหรับ Dev ที่ทำเฉพาะ Chat
- แยก checklist ตาม room creation, message, asset reference, offer integration, unread/notification, guest permission, block/report, delete chat, routing/deep link และ QA handoff
- อัปเดต `README_MODULE_INDEX.md` ให้มี entry สำหรับ Chat-focused Dev checklist

---

## 3. Dev / QA handoff impact

- Dev ต้อง implement validation แบบ status-aware ไม่ใช่ใช้ required field ชุดเดียวทุกสถานะ
- QA ต้องแยก test case ระหว่าง marketplace listing (`Sale`) กับ collection modes (`Show`, `Hide`)
- UX/Figma ต้องแสดง required indicator/error state เปลี่ยนตาม status ที่เลือกใน Add/Edit Asset
- Product decision ล่าสุดทำให้ `Show` ไม่บังคับ Price และไม่ควรสื่อว่าเป็น marketplace listing

---

## 4. งานที่ยังค้าง

| งาน | เหตุผลที่ค้าง | Next Step | ผู้เกี่ยวข้อง |
| --- | --- | --- | --- |
| Review Figma Add/Edit Asset screen ตาม required field matrix | วันนี้อัปเดตเอกสารก่อน ยังไม่ได้ตรวจ visual/prototype จริง | ตรวจ required indicator, error state และ status switching behavior ใน Figma | UX / Product |
| Review `Owner Estimated Value (Private)` ใน Figma | เอกสาร lock label แล้ว แต่ยังไม่ได้ตรวจ visual จริง | ตรวจว่า Figma ไม่ใช้คำว่า Price/Asking Price กับ `Hide` | Product / UX |
| Review consignment workflow แยกจาก Add/Edit baseline | Word input ระบุ recommended required fields สำหรับ consignment แต่ยังไม่ใช่ full flow | แตก consignment-specific validation เมื่อ scope ถูกยืนยัน | Product / Dev |
| Commit งานรอบ 2026-06-22 | Product review Dev baseline แล้ว | Commit เป็น docs baseline update | Repo owner |

---

## 5. Recommended work sequence ต่อจากนี้

1. Review Add/Edit Asset Figma ตาม work pack ใน `FIGMA_UX_CLEANUP_TASK_BREAKDOWN.md`
2. ตรวจ Asset Detail / Public Profile ว่า `Show` ไม่ถูกสื่อเป็น Sale listing
3. ตรวจ Figma ให้ใช้ `Owner Estimated Value (Private)` สำหรับ private valuation และไม่ใช้ Price/Asking Price กับ `Hide`
4. ส่ง Dev baseline handoff ให้ Dev review app ปัจจุบันเทียบ checklist
5. Commit เอกสารรอบนี้เมื่อ review ผ่าน

---

## 6. สรุปสำหรับส่งบริษัท

วันนี้นำ requirement ใหม่จากเอกสาร Word เรื่อง required fields ของ Sale Listing และ Show/Hide Status เข้ามา sync กับเอกสารหลักของโปรเจกต์แล้ว โดยเพิ่ม matrix แยกตาม Asset status ใน master PRD และ Asset Management module พร้อมอัปเดต Dev checklist, Figma cleanup ticket และ QA scenarios ให้รองรับ validation และ status switching ที่ต่างกันระหว่าง `Sale`, `Show` และ `Hide`

ข้อสรุปสำคัญคือ `Sale` เป็น marketplace listing จึงต้อง require Photos, Brand, Model, Condition, Asking Price และ Description ส่วน `Show` เป็น public collection จึง require แค่ Photos, Brand, Model และไม่บังคับ Asking Price และ `Hide` เป็น private collection จึง require แค่ Photos กับ Brand หากต้องเก็บมูลค่าส่วนตัวให้ใช้ `Owner Estimated Value (Private)` เท่านั้น
