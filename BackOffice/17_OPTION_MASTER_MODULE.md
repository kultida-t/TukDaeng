# 17 BO Option Master Module

**เวอร์ชัน:** `BO-17-v0.5`
**วันที่:** 2026-08-19
**สถานะ:** สเปกปัจจุบัน
**แพลตฟอร์ม:** Responsive Web Back Office

## มาตรฐาน UI และ Prototype อ้างอิง

เอกสารนี้ต้องใช้ร่วมกับ `00_GLOBAL_RULES_MODULE.md` และยึดรูปแบบหน้าจอ/พฤติกรรมที่ยืนยันแล้วใน `../Prototypes/bo-prototype.html` เป็นมาตรฐานหลัก

ห้ามออกแบบ pattern แยกเองสำหรับ list toolbar, breakpoint, table/card layout, pagination, reset, drill-down, drawer, modal หรือ detail layout ยกเว้นเอกสารนี้ระบุไว้ชัดเจนว่าเป็น override ที่อนุมัติแล้ว

หมายเหตุ prototype: หน้าจอ Option Master ยังไม่ถูกสร้างใน `../Prototypes/bo-prototype.html` ณ วันที่เอกสารนี้เขียน จึงใช้ shared pattern ของ BO prototype (list toolbar, table/card, pagination, detail page, confirmation modal) เป็น baseline ไปก่อน เมื่อ prototype ของ Option Master ถูกสร้างและยืนยันแล้ว ต้องเทียบและอัปเดทเอกสารนี้ให้ตรง prototype ตามกระบวนการ Prototype Handoff Notes ใน `README_MODULE_INDEX.md`

## 1. วัตถุประสงค์

Option Master เป็นเมนูสำหรับให้ Admin จัดการ internal option master ที่ระบบ TukDaeng ใช้เอง ไม่ใช่ provider catalog จาก The Watch API ข้อมูลเหล่านี้ถูกใช้ใน FO Add/Edit Asset, FO Search Filter และ FO Watch Alert criteria

ตัวอย่าง option group ที่ Option Master จัดการ:

- `condition` สภาพนาฬิกา
- `delivery` อุปกรณ์ที่มากับเรือน (Original box, Original papers)
- `case_material` วัสดุตัวเรือน
- `movement` กลไก
- `dial_color` สีหน้าปัด
- `strap_bracelet_type` ประเภทสาย

หน้าจอนี้ต้องช่วยให้ Admin:

- เห็น option group ทั้งหมดที่ระบบใช้ พร้อมจำนวน option และสถานะ
- เปิดดูรายการ option ภายใน group และแก้ไข label ได้
- เพิ่ม option ใหม่เมื่อต้องการขยายตัวเลือก
- ปิดใช้งาน option ที่ไม่ต้องการให้ FO form/filter ใหม่แสดง โดยไม่กระทบ existing assets
- เรียงลำดับ option ใหม่ให้ตรงลำดับการแสดงผลที่ต้องการ
- ตรวจสอบ audit trail ของทุกการเปลี่ยนแปลง

## 2. ขอบเขต

อยู่ในขอบเขต:

- Option Group List
- Option Detail (รายการ option ภายใน group)
- Add option
- Edit option label (TH/EN) และ description
- Deactivate option
- Reactivate option
- Reorder option (sort_order)
- Audit log สำหรับทุก action
- Responsive layout ตาม `00_GLOBAL_RULES_MODULE.md`

อยู่นอกขอบเขต:

- Delete option ที่เคยถูกใช้ใน asset แล้ว (ใช้ deactivate แทน เพื่อคง history)
- Bulk import option
- Bulk export option
- Override provider data จาก The Watch API (เป็นหน้าที่ของ Market Data module)
- สร้าง option group ใหม่จาก BO (group เกิดจาก seed/development เท่านั้นใน Phase 1)
- แก้ไข `group` identifier ของ group ที่มีอยู่
- แก้ไข `key` ของ option ที่เคยถูกใช้แล้ว
- เชื่อม Option Master กับ provider sync

## 3. โครงสร้างเมนู

เมนูหลัก: `Option Master`

Option Master เป็นเมนูหลักระดับเดียว ไม่มี submenu เพราะเข้าผ่าน Option Group List แล้ว drill-down ไป Option Detail ของ group นั้น

พฤติกรรมการนำทาง:

- เมื่อเข้า `Option Master` ให้เปิด `Option Group List` เป็นหน้าแรก
- เมนู `Option Master` ต้องแสดง active state ถูกต้อง
- จาก `Option Group List` คลิก group row หรือปุ่ม `View` เพื่อเปิด Option Detail ของ group นั้น
- ปุ่มกลับจาก Option Detail ต้องกลับ `Option Group List`
- Option Master เป็นโมดูลใหม่ที่ยังไม่ได้ล็อกใน navigation จึงเพิ่มต่อท้าย navigation ที่ล็อกไว้ใน `00_GLOBAL_RULES_MODULE.md` ได้ โดยห้ามเปลี่ยนลำดับ ชื่อ หรือ active state ของเมนูที่ล็อกไว้

## 4. สิทธิ์และกฎการเข้าถึง

Admin ที่มีสิทธิ์เข้าถึง Option Master สามารถดู list/detail และทำ write action ได้ตามสิทธิ์ module access

กฎทั่วไป:

- View Option Group List และ Option Detail ใช้สิทธิ์ module access ปกติ
- Write action (Add, Edit, Deactivate, Reactivate, Reorder) ต้องมี module access ที่อนุญาต write และต้องผ่าน confirmation + audit
- API permission ต้อง enforce ที่ route, API และ service layer ไม่พึ่งเฉพาะการซ่อนปุ่มใน UI
- System option (`is_system=true`) สามารถแก้ label และ sort_order ได้ แต่การ deactivate อยู่ภายใต้ System Option Deactivate Policy ตาม section 10.1 — แบ่งเป็นกลุ่มที่ล็อกไม่ให้ deactivate (กลุ่ม `condition`) และกลุ่มที่อนุญาตพร้อม reason และ safeguard (กลุ่ม optional อื่น)
- การเปลี่ยนแปลง option master มีผลต่อ FO form/filter/Watch Alert จึงต้อง audit ทุกครั้ง

| Action | Rule |
| --- | --- |
| View Option Group List | Allowed by module access |
| View Option Detail | Allowed by module access |
| Add option | Allowed by write permission; confirmation + audit |
| Edit option label/description | Allowed by write permission; confirmation + audit |
| Edit option key | Not allowed หลัง option ถูกใช้ใน asset แล้ว |
| Deactivate option | Allowed by write permission; confirmation + reason + audit; ต้องผ่าน System Option Deactivate Policy ตาม section 10.1 |
| Reactivate option | Allowed by write permission; confirmation + audit |
| Reorder option | Allowed by write permission; audit |
| Delete option | Not available ใน Phase 1 |
| Create new option group | Not available ใน Phase 1 (group มาจาก seed/development) |
| Bulk import/export | Not available ใน Phase 1 |

## 5. รูปแบบ Responsive

| Breakpoint | ความกว้าง | ข้อกำหนดของ Option Master |
| --- | --- | --- |
| Mobile | `<= 760px` | รายการแสดงเป็น card-like rows, column สำคัญต้องเปลี่ยนเป็น label/value, search เต็มความกว้าง, pagination ใช้งานได้, modal ต้องไม่ล้นจอ |
| Tablet | `761px - 1365px` | ตารางยังคงอ่านได้โดยคง column สำคัญ, modal ต้องไม่ทับเนื้อหาสำคัญ |
| Desktop | `> 1365px` | แสดง table เต็ม, summary cards ตามที่ module กำหนด, list toolbar ตาม prototype pattern |

ข้อกำหนดเพิ่มเติม:

- ข้อความ, chip, button, row และตัวเลขต้องไม่ล้น container
- ตารางที่มี option จำนวนมากต้องใช้ pagination ไม่โหลดทุก record เข้า browser พร้อมกัน
- Row ที่คลิกได้ต้องมี hit area ชัดเจนทั้ง mobile และ desktop
- Confirmation modal ต้อง scroll ได้เมื่อเนื้อหายาว

## 6. Option Group List

Header:

- Breadcrumb: `การดำเนินงาน / Option Master`
- Page title: `Option Master`
- Panel title: `Option Groups`
- Page action หลักว่าง (ไม่มีการสร้าง group ใหม่ใน Phase 1)

Filter:

- มี search field เดียว
- Placeholder: `Search option group`
- ค้นหาได้จาก group identifier และ label
- ไม่มี status filter เพราะ group ทั้งหมด active ใน Phase 1

Summary cards ต้องแสดง 4 cards:

| Card | ตัวอย่างค่า | คำอธิบาย |
| --- | --- | --- |
| Total Groups | `6` | จำนวน option group ทั้งหมด |
| Total Options | `58` | จำนวน option ทั้งหมดรวมทุก group |
| Active Options | `58` | จำนวน option ที่ active |
| Inactive Options | `0` | จำนวน option ที่ deactivate แล้ว |

ตาราง Option Group List:

| Column | ข้อกำหนด |
| --- | --- |
| Group | group identifier เช่น `condition`, `case_material` |
| Label (TH/EN) | label ภาษาไทยและอังกฤษของ group ถ้ามี |
| Options | จำนวน option ทั้งหมดใน group |
| Active | จำนวน option ที่ active |
| Multi-select | แสดง `Yes` หรือ `No` ตาม `allows_multi_select` |
| Action | ปุ่ม `View` เพื่อเปิด Option Detail |

กฎการแสดงผล:

- Row ทั้ง row และปุ่ม `View` ต้องเปิด Option Detail เดียวกัน
- Mobile ต้องแสดง metadata เช่น Options, Active, Multi-select ใน card row
- Empty state: `ไม่พบข้อมูล`
- Pagination ตามมาตรฐาน `00_GLOBAL_RULES_MODULE.md` (10 rows per page)

## 7. Option Detail

เปิดจาก group row ใน Option Group List

Header:

- Breadcrumb: `การดำเนินงาน / Option Master / <group>`
- Page title: `<group>` เช่น `condition`
- Back button: `Back to Option Groups`
- Panel title: `<group> -- Options (<option count>)`
- Page action หลัก: ปุ่ม `Add Option` (เฉพาะ admin ที่มี write permission)

Group summary section:

- แสดง group identifier, allows_multi_select, จำนวน option ทั้งหมด, จำนวน active, จำนวน inactive

Filter:

- มี search field เดียว
- Placeholder: `Search option in <group>`
- ค้นหาได้จาก key, label_en, label_th
- มี status filter: `ทั้งหมด`, `Active`, `Inactive`

ตาราง Option list:

| Column | ข้อกำหนด |
| --- | --- |
| Key | option key เช่น `new_unworn`, `stainless_steel` |
| Label (EN) | label ภาษาอังกฤษ |
| Label (TH) | label ภาษาไทย |
| Sort Order | ค่า sort_order |
| Status | `Active` หรือ `Inactive` แสดงเป็น badge |
| System | แสดง `Yes` หรือ `No` ตาม `is_system` |
| Action | ปุ่ม `Edit`, `Deactivate` หรือ `Reactivate` ตามสถานะและสิทธิ์ |

กฎการแสดงผล:

- คลิก row ไม่เปิดหน้าใหม่ เพราะ option ทั้งหมดของ group อยู่ในตารางนี้แล้ว
- ปุ่ม action อยู่ที่คอลัมน์ Action ตามสถานะปัจจุบัน
- Mobile ต้องแสดง metadata เช่น Sort Order, Status, System ใน card row
- Empty state: `ไม่พบข้อมูล`
- Pagination ตามมาตรฐาน (10 options per page)

## 8. Add Option

เปิดจากปุ่ม `Add Option` ใน Option Detail

ใช้ modal ตาม prototype pattern เพราะเป็นฟอร์มสั้นไม่ใช่ editor ยาว

ฟอร์ม Add Option:

| Field | Required | Validation |
| --- | --- | --- |
| Key | Required | ต้องไม่ซ้ำใน group เดียวกัน; เป็น lowercase snake_case; ห้าม whitespace; ไม่เกินความยาวที่ระบบกำหนด |
| Label (EN) | Required | trim whitespace; ห้ามว่าง; ไม่เกินความยาวที่ระบบกำหนด |
| Label (TH) | Required | trim whitespace; ห้ามว่าง; ไม่เกินความยาวที่ระบบกำหนด |
| Description (EN) | Optional | trim whitespace; ไม่เกินความยาวที่ระบบกำหนด |
| Sort Order | Required | ตัวเลขจำนวนเต็ม; default เป็นค่าถัดไปจาก sort_order สูงสุดใน group |
| Is Active | Required | default `true` |

กฎ:

- Key ต้อง unique ภายใน group ถ้าซ้ำต้องแสดง error ใกล้ field
- หลัง save สำเร็จ option ใหม่ต้องปรากฏในตาราง Option list ตาม sort_order
- ต้องมี confirmation modal ก่อน save จริง เพื่อสรุปค่าที่จะบันทึก
- บันทึก audit `OPTION_ADD`

## 9. Edit Option

เปิดจากปุ่ม `Edit` ใน Option Detail

ใช้ modal ตาม prototype pattern

ฟอร์ม Edit Option:

| Field | Editable | Validation |
| --- | --- | --- |
| Key | Not editable หลัง option ถูกใช้ใน asset | แสดงเป็น read-only พร้อม note ว่า key ล็อกเพราะถูกใช้แล้ว |
| Label (EN) | Editable | trim whitespace; ห้ามว่าง; ไม่เกินความยาวที่ระบบกำหนด |
| Label (TH) | Editable | trim whitespace; ห้ามว่าง; ไม่เกินความยาวที่ระบบกำหนด |
| Description (EN) | Editable | trim whitespace; ไม่เกินความยาวที่ระบบกำหนด |
| Sort Order | Editable | ตัวเลขจำนวนเต็ม |
| Is Active | Editable | toggle ระหว่าง Active/Inactive |

กฎ:

- Key แก้ไม่ได้หลัง option ถูกใช้ใน asset ใด asset หนึ่งแล้ว เพื่อคง referential integrity
- ถ้า option ยังไม่เคยถูกใช้ใน asset เลย Admin สามารถแก้ key ได้ แต่ต้องมี confirmation เพราะ key เป็น stable identifier
- การแก้ label ต้องไม่กระทบค่าที่เก็บใน existing assets เพราะ asset เก็บ relation id และ snapshot text แยก
- ต้องมี confirmation modal ก่อน save จริง พร้อมแสดง before/after value
- บันทึก audit `OPTION_EDIT`

## 10. Deactivate Option

เปิดจากปุ่ม `Deactivate` ใน Option Detail (แสดงเฉพาะ option ที่ active)

ใช้ confirmation modal ตาม prototype pattern

Confirmation modal ต้องแสดง:

- ชื่อ option ที่จะ deactivate (key + label)
- ผลกระทบ: option นี้จะไม่แสดงใน FO Add/Edit Asset form ใหม่, FO Search Filter ใหม่ และ FO Watch Alert criteria ใหม่
- ข้อความชี้แจงว่า existing assets ที่ใช้ option นี้ยังแสดงค่าเดิมตามปกติ
- Reason field (Required): เหตุผลในการ deactivate
- ปุ่ม `Cancel` และ `Confirm Deactivate`

กฎ:

- หลัง deactivate สถานะ option เปลี่ยนเป็น `Inactive`
- ปุ่ม action เปลี่ยนจาก `Deactivate` เป็น `Reactivate`
- บันทึก audit `OPTION_DEACTIVATE` พร้อม reason

### 10.1 System Option Deactivate Policy

ส่วนนี้กำหนด policy การ deactivate system option (`is_system=true`) แยกตามความสำคัญของกลุ่มต่อ FO form หลัก

เหตุผลของ policy: system option เป็น baseline option ที่ seed มาจาก seed file และเป็น source of truth ของ dropdown/filter ใน FO การ deactivate อาจทำให้ FO form สูญเสียตัวเลือกที่จำเป็น จึงต้องแบ่งระดับการควบคุมตามความสำคัญ

#### การจัดประเภทกลุ่ม system option

| กลุ่ม | ระดับควบคุม | เหตุผล |
| --- | --- | --- |
| `condition` | **Locked** — ห้าม deactivate system option ผ่าน BO UI | `condition` เป็น required field เมื่อ asset status = `Sale` ใน FO Add/Edit Asset (ตาม section 22.2); การ deactivate อาจทำให้ Owner ไม่สามารถลิสต์นาฬิกาขายได้ ถ้า option ที่เหลือไม่ครบหรือไม่ตรงกับสภาพจริง |
| `delivery` | **Controlled** — อนุญาตพร้อม reason + safeguard | Optional multi-select; การ deactivate ไม่บล็อก FO form แต่ลดทอนตัวเลือกของ Owner |
| `case_material` | **Controlled** — อนุญาตพร้อม reason + safeguard | Optional spec field; การ deactivate ไม่บล็อก FO form |
| `movement` | **Controlled** — อนุญาตพร้อม reason + safeguard | Optional spec field; การ deactivate ไม่บล็อก FO form |
| `dial_color` | **Controlled** — อนุญาตพร้อม reason + safeguard | Optional spec field; การ deactivate ไม่บล็อก FO form |
| `strap_bracelet_type` | **Controlled** — อนุญาตพร้อม reason + safeguard | Optional spec field; การ deactivate ไม่บล็อก FO form |

#### กฎสำหรับกลุ่ม Locked (`condition`)

- ห้าม deactivate system option ในกลุ่ม `condition` ผ่าน BO UI และ API
- ปุ่ม `Deactivate` ต้อง disabled หรือ hidden สำหรับ system option ในกลุ่ม `condition` พร้อม tooltip อธิบายว่า "กลุ่มนี้เป็น required field สำหรับ Sale status จึงไม่สามารถ deactivate ผ่าน BO ได้ ต้องแก้ไขผ่าน seed file และ migration"
- ถ้ามีการเรียก API พยายาม deactivate system option ในกลุ่ม `condition` โดยตรง service layer ต้อง reject พร้อม error `OPTION_LOCKED_FOR_DEACTIVATION`
- การ deactivate system option ในกลุ่ม `condition` ต้องทำผ่าน seed file update + migration script เท่านั้น (เป็น dev operation ไม่ใช่ BO UI action)
- Custom option (`is_system=false`) ในกลุ่ม `condition` ถ้ามีเพิ่มในอนาคต ยังสามารถ deactivate ได้ปกติ เพราะ Admin เป็นคนสร้างและรับผิดชอบเอง

#### กฎสำหรับกลุ่ม Controlled

- อนุญาตให้ deactivate system option ได้ พร้อม reason (required) และ confirmation modal ตาม section 10
- **Safeguard: ห้าม deactivate ถ้าจะทำให้เหลือ active option น้อยกว่า 1 ในกลุ่ม** — เพื่อป้องกัน dropdown/filter ว่างใน FO form
  - Error message: `ไม่สามารถ deactivate ได้ เนื่องจากต้องมีอย่างน้อย 1 active option เหลือในกลุ่ม <group>`
  - Service layer ต้อง enforce safeguard นี้ด้วย ไม่พึ่งเฉพาะ UI
- หลัง deactivate สถานะ option เปลี่ยนเป็น `Inactive` และบันทึก audit `OPTION_DEACTIVATE` พร้อม reason ตามปกติ

#### กฎสำหรับ Custom option (`is_system=false`) ทุกกลุ่ม

- Admin สามารถ deactivate custom option ได้ทุกกลุ่ม รวมถึงกลุ่ม `condition` พร้อม reason + confirmation
- มี safeguard เดียวกัน: ห้าม deactivate ถ้าจะทำให้เหลือ active option น้อยกว่า 1 ในกลุ่ม
- บันทึก audit `OPTION_DEACTIVATE` พร้อม reason

#### สรุป policy ในตาราง

| ประเภท option | กลุ่ม | Deactivate ผ่าน BO UI | เงื่อนไข |
| --- | --- | --- | --- |
| System (`is_system=true`) | `condition` | ❌ ไม่ได้ | Locked — ต้องแก้ seed file + migration |
| System (`is_system=true`) | `delivery`, `case_material`, `movement`, `dial_color`, `strap_bracelet_type` | ✅ ได้ | Reason + confirmation + safeguard (≥1 active option เหลือในกลุ่ม) |
| Custom (`is_system=false`) | ทุกกลุ่ม | ✅ ได้ | Reason + confirmation + safeguard (≥1 active option เหลือในกลุ่ม) |

## 11. Reactivate Option

เปิดจากปุ่ม `Reactivate` ใน Option Detail (แสดงเฉพาะ option ที่ inactive)

ใช้ confirmation modal ตาม prototype pattern

Confirmation modal ต้องแสดง:

- ชื่อ option ที่จะ reactivate (key + label)
- ผลกระทบ: option นี้จะกลับมาแสดงใน FO Add/Edit Asset form, FO Search Filter และ FO Watch Alert criteria
- ปุ่ม `Cancel` และ `Confirm Reactivate`

กฎ:

- หลัง reactivate สถานะ option เปลี่ยนเป็น `Active`
- ปุ่ม action เปลี่ยนจาก `Reactivate` เป็น `Deactivate`
- บันทึก audit `OPTION_REACTIVATE`

## 12. Reorder Option

Reorder ทำผ่านการแก้ sort_order ใน Edit Option หรือผ่าน controls เฉพาะถ้า prototype รองรับ

กฎ:

- sort_order เป็นตัวเลขจำนวนเต็มที่กำหนดลำดับการแสดงผลใน FO form/filter
- ค่าน้อยกว่าแสดงก่อน
- ถ้าสอง option มี sort_order เท่ากัน ระบบต้อง tie-break ด้วย key ตามตัวอักษร
- การเปลี่ยน sort_order ต้องบันทึก audit `OPTION_REORDER` (หรือ `OPTION_EDIT` ถ้าทาง Edit Option modal)
- FO ต้องอ่าน sort_order ล่าสุดเมื่อ render form/filter

## 13. Action Rules Summary

| Action | Pre-condition | Confirmation | Reason | Audit | FO Impact |
| --- | --- | --- | --- | --- | --- |
| Add option | Key ไม่ซ้ำใน group | Yes | No | `OPTION_ADD` | แสดงใน FO form/filter ใหม่ |
| Edit label/description | Option มีอยู่ | Yes | No | `OPTION_EDIT` | แสดง label ใหม่ใน FO form/filter; existing assets ยังเก็บ snapshot เดิม |
| Edit key | Option ยังไม่ถูกใช้ใน asset | Yes | No | `OPTION_EDIT` | ไม่มีผลต่อ existing assets |
| Edit sort_order | Option มีอยู่ | Yes | No | `OPTION_REORDER` | ลำดับ FO form/filter เปลี่ยน |
| Deactivate option | Option active; ผ่าน System Option Deactivate Policy (section 10.1) — system option ในกลุ่ม `condition` ล็อก, กลุ่มอื่นต้องมี ≥1 active option เหลือ | Yes | Yes | `OPTION_DEACTIVATE` | ไม่แสดงใน FO form/filter/Watch Alert ใหม่; existing assets ยังแสดงค่าเดิม |
| Reactivate option | Option inactive | Yes | No | `OPTION_REACTIVATE` | กลับมาแสดงใน FO form/filter/Watch Alert |
| Delete option | Not available | - | - | - | ไม่รองรับใน Phase 1 |

## 14. Impact ต่อระบบ

ผลกระทบของการเปลี่ยนแปลง option master ต่อระบบอื่น:

| ระบบ | ผลกระทบ |
| --- | --- |
| FO Add/Edit Asset | แสดงเฉพาะ option ที่ active ตาม sort_order; label ใหม่มีผลทันทีเมื่อ FO อ่าน option master ล่าสุด |
| FO Search Filter | แสดงเฉพาะ active option; inactive option ไม่เป็นตัวเลือก filter ใหม่ |
| FO Watch Alert | แสดงเฉพาะ active option เป็น criteria; Watch Alert เดิมที่อ้าง inactive option ต้องเก็บ history ได้ แต่ไม่ควร trigger match ใหม่ถ้า criteria อ้าง option ที่ inactive ตาม policy |
| Existing assets | ยังเก็บค่าเดิมแม้ option ถูก deactivate; asset เก็บ relation id และ snapshot text แยกต่างหาก |
| BO Asset Detail | ยังแสดงค่าเดิมของ asset แม้ option ถูก deactivate เพราะอ่านจาก asset snapshot/relation ไม่ใช่ option master active status |
| BO Asset List filter | แสดงเฉพาะ active option เป็นตัวเลือก filter ใหม่; แต่ asset ที่มี inactive option ยังปรากฏในผลลัพธ์ถ้าตรงเงื่อนไขอื่น |
| Market Data | ไม่มีผลโดยตรง เพราะ Option Master เป็น internal option ไม่ใช่ provider catalog |
| Audit Log | ทุก action บันทึก audit ตาม section 16 |

กฎการ sync:

- การเปลี่ยนแปลง option master ควรสะท้อนผลใกล้เคียงทันทีที่สุดเท่าที่ทำได้
- Cached FO form/filter option ต้อง validate active status ก่อนแสดงหรือเมื่อ refresh
- รายละเอียด cache invalidation/API timing ให้สรุปอีกครั้งตอนออกแบบ backend

## 15. Integration กับ Module อื่น

| Module | Integration |
| --- | --- |
| Market Data (`06_MARKET_DATA_MODULE.md`) | Option Master ไม่ใช่ provider catalog แยกจาก Market Data ชัดเจน; Market Data เป็น brand/model/reference จาก The Watch API, Option Master เป็น internal dropdown/filter option |
| Asset Management (`04_ASSET_MANAGEMENT_MODULE.md`) | Option ที่ deactivate ไม่แสดงใน Asset List filter ใหม่ แต่ asset เดิมยังแสดงค่าเดิม; BO Asset Detail อ่านจาก asset snapshot ไม่ใช่ option active status |
| Audit Log (`08_AUDIT_LOG_MODULE.md`) | ทุก Option Master action ต้องบันทึก audit ตาม action types ใน section 16 |
| FO Asset Management (`../FrontOffice/04_ASSET_MANAGEMENT_MODULE.md`) | Option Master เป็นแหล่งข้อมูลของ `spec_options` domain ที่ FO ใช้ใน Add/Edit Asset, Search Filter และ Watch Alert criteria; seed data อ้างอิง `../SeedData/asset-spec-options.json` |
| Watch Alert (`11_WATCH_ALERT_MODULE.md`) | Watch Alert criteria ใช้ active option เท่านั้น; inactive option ไม่เป็น criteria ใหม่ได้ |

## 16. Audit Requirements

ทุก Option Master action ต้องบันทึก audit ตาม `00_GLOBAL_RULES_MODULE.md` section 13 และ `08_AUDIT_LOG_MODULE.md`

Audit action types:

| Action Type | Trigger | Before/After |
| --- | --- | --- |
| `OPTION_ADD` | เพิ่ม option ใหม่ใน group | After: option ใหม่ทั้งหมด |
| `OPTION_EDIT` | แก้ label, description, key (ถ้ายังไม่ถูกใช้), is_active ผ่าน Edit modal | Before/After: field ที่เปลี่ยน |
| `OPTION_DEACTIVATE` | Deactivate option | Before: active; After: inactive + reason |
| `OPTION_REACTIVATE` | Reactivate option | Before: inactive; After: active |
| `OPTION_REORDER` | เปลี่ยน sort_order | Before/After: sort_order เดิม/ใหม่ |

Minimum audit fields ตาม `00_GLOBAL_RULES_MODULE.md`:

- Admin ID
- Admin Access
- Action type
- Target entity type (`SpecOption`)
- Target entity ID
- Before value
- After value
- Reason/note เมื่อจำเป็น (deactivate ต้องมี reason)
- IP address หรือ session context ถ้ามี
- Timestamp

Audit action group: เพิ่ม `Option Master` เป็น action group ใหม่ใน `08_AUDIT_LOG_MODULE.md` section 6 ที่มี action ดังนี้:

- Option add
- Option edit (label/description/key/sort_order)
- Option deactivate
- Option reactivate

หมายเหตุ policy: การพยายาม deactivate system option ในกลุ่ม `condition` (locked) จะถูก service layer reject โดยไม่บันทึก `OPTION_DEACTIVATE` audit เพราะ action ไม่สำเร็จ — ควรบันทึกเป็น security event ใน audit log กลางแทน ถ้ามีความพยายาม bypass policy ผ่าน API

Target entity type เพิ่ม: `SpecOption` ใน `08_AUDIT_LOG_MODULE.md` section 5

## 17. Data Model และ Seed Data Strategy

ส่วนนี้กำหนด data model เชิงกายภาพ ความสัมพันธ์กับตารางอื่น และกลยุทธ์ seed/migration/versioning ของ Option Master

อ้างอิง:
- `../FrontOffice/04_ASSET_MANAGEMENT_MODULE.md` section 10 (Recommended backend split)
- `../SeedData/asset-spec-options.json` (schema version `asset-spec-options-v1`)
- `../SeedData/asset-spec-options.csv`
- `../SeedData/README.md`

### 17.1 ตาราง `spec_option_groups`

เก็บข้อมูลกลุ่ม option ทั้งหมด ใน Phase 1 group เกิดจาก seed/development เท่านั้น ไม่มีการสร้าง group ใหม่จาก BO

```sql
CREATE TABLE spec_option_groups (
  group_id BIGSERIAL PRIMARY KEY,
  group TEXT NOT NULL UNIQUE,
  display_name_en TEXT NOT NULL,
  display_name_th TEXT NOT NULL,
  description TEXT NULL,
  allows_multi_select BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

| Column | Type | Rule |
| --- | --- | --- |
| `group_id` | BIGSERIAL | PK |
| `group` | TEXT | Unique stable identifier เช่น `condition`, `delivery`; ห้าม rename หลังใช้งาน |
| `display_name_en` | TEXT | ชื่อกลุ่มภาษาอังกฤษ |
| `display_name_th` | TEXT | ชื่อกลุ่มภาษาไทย |
| `description` | TEXT | คำอธิบายกลุ่ม (optional) |
| `allows_multi_select` | BOOLEAN | `true` สำหรับ `delivery`; `false` สำหรับกลุ่มอื่น |
| `is_active` | BOOLEAN | default `true`; ใน Phase 1 ทุก group active |
| `created_at` | TIMESTAMPTZ | auto |
| `updated_at` | TIMESTAMPTZ | auto |

Seed groups (6 กลุ่ม):

| group | allows_multi_select | display_name_en | display_name_th |
| --- | --- | --- | --- |
| `condition` | false | Condition | สภาพ |
| `delivery` | true | Scope of Delivery | อุปกรณ์ที่มาด้วย |
| `case_material` | false | Case Material | วัสดุตัวเรือน |
| `movement` | false | Movement | กลไก |
| `dial_color` | false | Dial Color | สีหน้าปัด |
| `strap_bracelet_type` | false | Strap / Bracelet Type | ประเภทสาย |

### 17.2 ตาราง `spec_options`

เก็บรายการ option ภายในแต่ละกลุ่ม เป็นตารางหลักที่ FO อ่านเพื่อ render dropdown/filter/Watch Alert criteria

```sql
CREATE TABLE spec_options (
  id BIGSERIAL PRIMARY KEY,
  group_id BIGINT NOT NULL REFERENCES spec_option_groups(group_id),
  option_key TEXT NOT NULL,
  label_en TEXT NOT NULL,
  label_th TEXT NOT NULL,
  description_en TEXT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_system BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deactivated_at TIMESTAMPTZ NULL,
  created_by_admin_id BIGINT NULL,
  updated_by_admin_id BIGINT NULL,
  UNIQUE (group_id, option_key)
);
```

| Column | Type | Rule |
| --- | --- | --- |
| `id` | BIGSERIAL | PK; เป็น FK target จาก `watch_assets` และ `asset_delivery_items` |
| `group_id` | BIGINT | FK → `spec_option_groups.group_id` |
| `option_key` | TEXT | Stable identifier ห้าม rename หลัง option ถูกใช้ใน asset; lowercase snake_case; unique ภายใน group |
| `label_en` | TEXT | English label แก้ไขได้ |
| `label_th` | TEXT | Thai label แก้ไขได้ |
| `description_en` | TEXT | Internal description (optional) |
| `sort_order` | INTEGER | ลำดับการแสดงผลใน FO; ค่าน้อยกว่าแสดงก่อน; tie-break ด้วย `option_key` |
| `is_active` | BOOLEAN | `false` = ไม่แสดงใน FO form/filter/Watch Alert ใหม่ แต่คง relation กับ existing assets |
| `is_system` | BOOLEAN | `true` = seeded baseline option; การ deactivate อยู่ภายใต้ System Option Deactivate Policy ตาม section 10.1 — กลุ่ม `condition` ล็อก, กลุ่มอื่นอนุญาตพร้อม reason + safeguard |
| `created_at` | TIMESTAMPTZ | auto |
| `updated_at` | TIMESTAMPTZ | auto |
| `deactivated_at` | TIMESTAMPTZ | เวลาที่ deactivate; `NULL` ถ้า active |
| `created_by_admin_id` | BIGINT | Admin ที่สร้าง option (NULL สำหรับ system seed) |
| `updated_by_admin_id` | BIGINT | Admin ที่แก้ไขล่าสุด |

Unique constraint: `UNIQUE (group_id, option_key)` ป้องกัน key ซ้ำใน group เดียวกัน

### 17.3 ตาราง `spec_option_audit`

เก็บ audit trail เฉพาะ Option Master แยกจาก audit log กลาง เพื่อให้ query ประวัติการเปลี่ยนแปลง option ได้โดยตรง ข้อมูลเดียวกันต้อง sync ไป audit log กลาง (`08_AUDIT_LOG_MODULE.md`) ด้วย

```sql
CREATE TABLE spec_option_audit (
  id BIGSERIAL PRIMARY KEY,
  action_type TEXT NOT NULL,
  option_id BIGINT NOT NULL REFERENCES spec_options(id),
  group_id BIGINT NOT NULL REFERENCES spec_option_groups(group_id),
  actor_admin_id BIGINT NOT NULL,
  before_value JSONB NULL,
  after_value JSONB NULL,
  reason TEXT NULL,
  ip_address TEXT NULL,
  session_context TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

| Column | Type | Rule |
| --- | --- | --- |
| `id` | BIGSERIAL | PK |
| `action_type` | TEXT | enum: `OPTION_ADD`, `OPTION_EDIT`, `OPTION_DEACTIVATE`, `OPTION_REACTIVATE`, `OPTION_REORDER` |
| `option_id` | BIGINT | FK → `spec_options.id` |
| `group_id` | BIGINT | FK → `spec_option_groups.group_id` (denormalized สำหรับ query สะดวก) |
| `actor_admin_id` | BIGINT | Admin ที่ทำ action |
| `before_value` | JSONB | ค่าก่อนเปลี่ยน (JSON ของ field ที่เปลี่ยน) |
| `after_value` | JSONB | ค่าหลังเปลี่ยน |
| `reason` | TEXT | เหตุผล (required สำหรับ `OPTION_DEACTIVATE`) |
| `ip_address` | TEXT | ถ้ามี |
| `session_context` | TEXT | ถ้ามี |
| `created_at` | TIMESTAMPTZ | auto |

Audit record ต้องไม่ถูกแก้ไขหรือลบผ่าน BO UI ตาม `08_AUDIT_LOG_MODULE.md` section 7

### 17.4 ความสัมพันธ์กับตารางอื่น

Option Master เป็นแหล่งข้อมูลอ้างอิง (lookup) ของ asset specifications ที่ Owner กรอกใน FO Add/Edit Asset ความสัมพันธ์เป็น nullable เพราะ asset สามารถไม่มี option ได้ (optional fields)

```text
spec_option_groups 1───∞ spec_options
spec_options 1───∞ watch_assets (condition_id)
spec_options 1───∞ watch_assets (case_material_id)
spec_options 1───∞ watch_assets (movement_id)
spec_options 1───∞ watch_assets (dial_color_id)
spec_options 1───∞ watch_assets (strap_bracelet_type_id)
spec_options 1───∞ asset_delivery_items (option_id)
spec_options 1───∞ spec_option_audit
```

FK columns ใน `watch_assets`:

| Column | FK → | Nullable | Rule |
| --- | --- | --- | --- |
| `condition_id` | `spec_options.id` | Yes (optional for Show/Hide) | Required for `Sale` status |
| `case_material_id` | `spec_options.id` | Yes | Optional asset specification |
| `movement_id` | `spec_options.id` | Yes | Optional asset specification |
| `dial_color_id` | `spec_options.id` | Yes | Optional asset specification |
| `strap_bracelet_type_id` | `spec_options.id` | Yes | Optional asset specification |

FK columns ใน `asset_delivery_items`:

| Column | FK → | Nullable | Rule |
| --- | --- | --- | --- |
| `option_id` | `spec_options.id` | No (required when row exists) | ต้องเป็น option ใน group `delivery` เท่านั้น |
| `asset_id` | `watch_assets.id` | No | Asset ที่มี delivery item นี้ |

กฎ referential integrity:

- FK ทั้งหมดเป็น nullable ยกเว้น `asset_delivery_items.option_id` และ `asset_delivery_items.asset_id`
- เมื่อ option ถูก deactivate (`is_active=false`) ห้าม cascade delete หรือ set null FK ใน `watch_assets` — ต้องคง relation id เดิมไว้
- `asset_delivery_items` อ้างอิงเฉพาะ option ใน group `delivery` (enforce ที่ application/service layer)
- Asset ต้องเก็บ snapshot text (`condition_snapshot`, `case_material_snapshot`, ฯลฯ) คู่กับ relation id เพื่อคง display history แม้ option label เปลี่ยนหรือ deactivate

### 17.5 Indexes และ Constraints

```sql
-- ค้นหา option ตาม group และ active status (FO form/filter ใช้บ่อย)
CREATE INDEX idx_spec_options_group_active ON spec_options (group_id, is_active, sort_order);

-- ค้นหา audit ตาม option
CREATE INDEX idx_spec_option_audit_option ON spec_option_audit (option_id, created_at DESC);

-- ค้นหา audit ตาม action type
CREATE INDEX idx_spec_option_audit_action ON spec_option_audit (action_type, created_at DESC);

-- ตรวจสอบ delivery items อ้างเฉพาะ group delivery
ALTER TABLE asset_delivery_items ADD CONSTRAINT chk_delivery_group
  CHECK (option_id IN (SELECT id FROM spec_options WHERE group_id = (SELECT group_id FROM spec_option_groups WHERE group = 'delivery')));
```

### 17.6 Seed Data Source

Seed file หลัก: `../SeedData/asset-spec-options.json` (schema version `asset-spec-options-v1`)

Seed file สำรอง (flat format): `../SeedData/asset-spec-options.csv`

เอกสารกำกับ: `../SeedData/README.md`

โครงสร้าง JSON seed file:

```json
{
  "version": "asset-spec-options-v1",
  "updated_at": "2026-08-11",
  "description": "...",
  "schema": { ... },
  "groups": [
    {
      "group": "condition",
      "allows_multi_select": false,
      "options": [
        {
          "key": "new_unworn",
          "label_en": "New / Unworn",
          "label_th": "ใหม่ / ยังไม่ผ่านการใช้งาน",
          "description_en": "Never worn or no visible usage",
          "sort_order": 10,
          "is_active": true,
          "is_system": true
        }
      ]
    }
  ]
}
```

Seed file ครอบคลุม 6 groups ครบ:
- `condition` — 6 options
- `delivery` — 2 options (multi-select)
- `case_material` — 13 options
- `movement` — 7 options
- `dial_color` — 18 options
- `strap_bracelet_type` — 12 options
- รวม 58 options ทั้งหมด

### 17.7 Sync Strategy (Seed File ↔ Database)

| ประเภท option | Source of truth | Sync ทิศทาง |
| --- | --- | --- |
| System option (`is_system=true`) | Seed file | Seed file → Database (ผ่าน migration script) |
| Custom option (`is_system=false`) | Database | Database เท่านั้น (ไม่เขียนกลับ seed file) |

กฎ sync:

- Migration script อ่าน seed file และ upsert ลง `spec_option_groups` และ `spec_options`
- System option ที่มีใน seed file แต่ไม่มีใน database → insert
- System option ที่มีใน database แต่ไม่มีใน seed file → ไม่ลบ (อาจถูก deactivate ไปแล้ว) แต่ log warning
- Custom option ที่ Admin เพิ่มจาก BO → เก็บใน database เท่านั้น ไม่เขียนกลับ seed file
- ถ้า seed file เปลี่ยน label ของ system option → migration script update label ใน database (แต่ไม่กระทบ snapshot text ใน existing assets)
- ถ้า seed file เปลี่ยน `is_active` ของ system option → migration script update `is_active` ใน database และบันทึก audit `OPTION_DEACTIVATE`/`OPTION_REACTIVATE` อัตโนมัติ
- กลุ่ม `condition` ที่ล็อกใน BO UI ตาม section 10.1 สามารถ deactivate ผ่าน seed file update + migration ได้ เพราะเป็น dev operation ที่ผ่าน code review ไม่ใช่ BO UI action ธรรมดา

### 17.8 Migration Strategy

| Scenario | Seed File | Migration Script | Database | Audit |
| --- | --- | --- | --- | --- |
| เพิ่ม option ใหม่ | เพิ่มใน `groups[].options[]` | upsert ลง `spec_options` | insert ใหม่ | `OPTION_ADD` (actor = system migration) |
| แก้ label | update `label_en`/`label_th` ใน seed file | update ใน `spec_options` | update label | `OPTION_EDIT` |
| แก้ sort_order | update `sort_order` ใน seed file | update ใน `spec_options` | update sort_order | `OPTION_REORDER` |
| Deactivate option | update `is_active=false` ใน seed file | update `is_active=false`, `deactivated_at=now()` ใน `spec_options` | update | `OPTION_DEACTIVATE` (reason = "seed file update") |
| Reactivate option | update `is_active=true` ใน seed file | update `is_active=true`, `deactivated_at=null` | update | `OPTION_REACTIVATE` |
| Delete option | ห้าม | ไม่รองรับ | ไม่ลบ | — |

กฎ migration:

- ทุก migration ต้อง bump version ใน seed file (`asset-spec-options-v1` → `asset-spec-options-v2`)
- Migration script ต้อง idempotent (รันซ้ำได้โดยไม่ทำให้ข้อมูลเสีย)
- Migration script ต้องบันทึก audit ทุกครั้งที่มีการเปลี่ยนแปลง
- Migration script ต้องไม่ลบ option ที่ถูกใช้ใน asset แล้ว
- ถ้า migration พบว่า seed file ลด option ที่ถูกใช้ใน asset แล้ว → ไม่ลบ แต่ log warning และเก็บ option ไว้ใน database

### 17.9 Versioning Strategy

```text
asset-spec-options-v1  (initial seed, 2026-08-11)
asset-spec-options-v2  (next change)
asset-spec-options-v3  (next change)
...
```

กฎ versioning:

- Seed file มี `version` field สำหรับ track การเปลี่ยนแปลง
- ทุก migration ต้อง bump version
- เก็บ migration history ในตาราง `schema_migrations` หรือเทียบเท่า พร้อม `version`, `applied_at`, `description`
- Database ต้องเก็บ seed version ล่าสุดที่ sync แล้ว เพื่อตรวจสอบว่า migration ทำครบหรือไม่
- ถ้า database seed version ต่ำกว่า seed file version → รัน migration script ใหม่

### 17.10 Impact ต่อ Existing Assets เมื่อ Option ถูก Deactivate

เมื่อ option ถูก deactivate (`is_active=false`):

| ระบบ | พฤติกรรม |
| --- | --- |
| `watch_assets` relation | คง `condition_id`/`case_material_id`/ฯลฯ เดิม ไม่ set null ไม่ cascade delete |
| `asset_delivery_items` relation | คง `option_id` เดิม ไม่ set null ไม่ cascade delete |
| FO Asset Detail display | ยังแสดง label เดิมได้ เพราะ lookup จาก `spec_options` โดยไม่กรอง `is_active` |
| BO Asset Detail display | ยังแสดง label เดิมได้ เช่นเดียวกับ FO |
| FO Add/Edit Asset form | ไม่แสดง option ที่ deactivate ใน dropdown |
| FO Search Filter | ไม่แสดง option ที่ deactivate ในตัวกรอง |
| FO Watch Alert criteria | ไม่แสดง option ที่ deactivate เป็น criteria ใหม่; Watch Alert เดิมที่อ้าง inactive option ต้องแสดง warning ว่า criteria อ้าง option ที่ inactive แล้ว |
| Asset snapshot text | ไม่กระทบ เพราะ asset เก็บ snapshot text คู่กับ relation id แยกต่างหาก |

กฎสำคัญ:

- ห้าม hard delete option ที่ถูกใช้ใน asset แล้ว — deactivate เท่านั้น
- ห้าม cascade delete หรือ set null FK ใน `watch_assets` และ `asset_delivery_items` เมื่อ deactivate
- FO/BO ต้อง lookup label จาก `spec_options` โดยไม่กรอง `is_active` เมื่อแสดงข้อมูล asset เดิม
- FO form/filter/Watch Alert ใหม่ ต้องกรอง `is_active=true` เท่านั้น

## 18. Empty / Loading / Error States

| State | ข้อกำหนด |
| --- | --- |
| Loading Option Group List | แสดง skeleton/placeholder สำหรับ summary cards และ table |
| Loading Option Detail | แสดง loading state ใน table โดยไม่ทำให้ layout กระโดด |
| Empty Option Group List | แสดง `ไม่พบข้อมูล` |
| Empty Option Search | แสดง `ไม่พบข้อมูล` และคง reset ให้ใช้ได้ |
| Empty Option Detail (group ไม่มี option) | แสดง `ไม่พบข้อมูล` พร้อมปุ่ม `Add Option` ถ้ามีสิทธิ์ |
| Duplicate Key Error | แสดง error ใกล้ field Key ว่า key ซ้ำใน group |
| Action Error | คง confirmation/action modal เปิดอยู่ แสดง error/result state และไม่อัปเดท UI เป็น success |
| Permission Denied | แสดง access denied ตาม global BO rule |
| Session Expired | กลับไป login พร้อม message ชัดเจน |

## 19. Copy และ Visual Rules

Copy rules:

- ใช้ชื่อเมนูและหัวข้อภาษาอังกฤษ: `Option Master`, `Option Groups`, `Options`
- ใช้คำอธิบายภาษาไทยเพื่ออธิบายผลกระทบเชิงงาน
- ห้ามใช้ข้อความ placeholder เช่น `Sample data` เป็นข้อความหลัก
- Status badge ต้องอ่านรู้เรื่อง: `Active`, `Inactive`
- Confirmation modal ต้องระบุผลกระทบต่อ FO ชัดเจน

Visual rules:

- Layout ต้องเป็น operational control view ไม่ใช่ analytics report page
- Summary card ต้องเป็น pattern เดียวกับ BO prototype
- Table row ต้อง compact และอ่านง่าย
- Mobile row ต้องใช้ label/value ตาม prototype
- Badge สถานะต้องไม่ใช้สีเป็นข้อมูลเดียว ต้องมี text label ชัดเจน

## 20. Acceptance Criteria

- [ ] เอกสารมี scope ชัดเจน แยกจาก Market Data module
- [ ] มีหน้าจอ Option Group List และ Option Detail ครบ
- [ ] Action Rules ครอบคลุม Add, Edit, Deactivate, Reactivate, Reorder
- [ ] Impact ต่อ FO และ existing assets ระบุชัด
- [ ] Audit requirements ครบทุก action type
- [ ] Acceptance Criteria ทดสอบได้
- [ ] Confirmation modal ระบุผลกระทบต่อ FO ชัดเจน
- [ ] Key lock rule หลัง option ถูกใช้ใน asset ระบุชัด
- [ ] System option policy ระบุชัด
- [ ] System Option Deactivate Policy (section 10.1) ระบุชัด: กลุ่ม `condition` ล็อก, กลุ่มอื่นอนุญาตพร้อม reason + safeguard (≥1 active option เหลือในกลุ่ม)
- [ ] ปุ่ม Deactivate ในกลุ่ม `condition` (system option) disabled พร้อม tooltip อธิบายเหตุผล
- [ ] Integration กับ module อื่น ระบุชัด
- [ ] Empty/Loading/Error states ครบ
- [ ] Responsive layout ตาม `00_GLOBAL_RULES_MODULE.md`
- [ ] ตาราง `spec_option_groups`, `spec_options` และ `spec_option_audit` มี field ครบ
- [ ] ความสัมพันธ์กับ `watch_assets` และ `asset_delivery_items` ระบุชัด พร้อม nullable rule
- [ ] Audit table มี action_type ครบ 5 ตัว
- [ ] Seed file schema ตรงกับ data model
- [ ] Migration strategy ครอบคลุม add/edit/deactivate/reactivate
- [ ] Versioning strategy ชัดเจน (bump version ทุก migration)
- [ ] Impact ต่อ existing assets เมื่อ deactivate ระบุชัด (คง relation, คง snapshot, ห้าม cascade delete)
- [ ] Sync strategy ระหว่าง seed file และ database ชัดเจน (system vs custom option)

## 21. Open Decisions

| ID | Decision Needed | Current Recommendation |
| --- | --- | --- |
| BO-OPT-001 ✅ | Option Master phase | **ยืนยัน Phase 1** (Product confirmed 2026-08-19) — เป็น foundational operational data ที่ FO ต้องใช้ตั้งแต่ launch (Add/Edit Asset, Search Filter, Watch Alert); มี seed data พร้อม 6 groups; scope จำกัดเหมาะ Phase 1 (ไม่มี bulk import/export, ไม่สร้าง group ใหม่, ไม่เชื่อม provider sync); baseline/index ระบุ Phase 1 อยู่แล้วและสอดคล้องกับผลตัดสินใจ |
| BO-OPT-002 | Prototype screen | ยังไม่มี prototype สำหรับ Option Master; ควรสร้าง prototype และเทียบกับเอกสารนี้ก่อน implementation handoff |
| BO-OPT-003 ✅ | System option deactivate policy | **ตัดสินใจ: Tiered Deactivation Control** (2026-08-19) — กลุ่ม `condition` (required field สำหรับ Sale status) ล็อกไม่ให้ deactivate system option ผ่าน BO UI ต้องแก้ seed file + migration; กลุ่ม optional อื่น (`delivery`, `case_material`, `movement`, `dial_color`, `strap_bracelet_type`) อนุญาตพร้อม reason + safeguard (≥1 active option เหลือในกลุ่ม); custom option ทุกกลุ่ม deactivate ได้ปกติพร้อม reason + safeguard; รายละเอียดใน section 10.1 |
| BO-OPT-004 | Reorder UI | ปัจจุบัน reorder ทาง Edit Option modal; อาจเพิ่ม drag-and-drop ใน prototype ถ้าต้องการ UX ที่สะดวกกว่า |

## 22. FO Integration Guidelines

ส่วนนี้กำหนดแนวทางการ integrate Option Master กับ Front Office อย่างละเอียด ครอบคลุม Add/Edit Asset, Search Filter, Watch Alert, caching, fallback behavior, API contract และ interaction กับ Market Data

อ้างอิง:
- `../FrontOffice/04_ASSET_MANAGEMENT_MODULE.md` section 10 (Market Data Mapping And User-entered Specification Rule), Required Field Matrix, Add / Edit Field Validation Matrix
- `../FrontOffice/03_SEARCH_FILTER_MODULE.md` Filter Fields, Filter Visibility Rule, Filter Dependency Rule
- `../FrontOffice/10_WATCH_ALERT_MODULE.md` Filter Logic Rule, Match Rule, Validation Rules
- `06_MARKET_DATA_MODULE.md` section 15 (FO Usage Rules)

### 22.1 หลักการทั่วไป

- Option Master เป็น single source of truth ของ `spec_options` domain ที่ FO ใช้ในทุก surface ที่เกี่ยวข้องกับ option ของ condition, delivery, case_material, movement, dial_color และ strap_bracelet_type
- FO ต้องอ่าน option จาก API ที่อ้างอิง `spec_options` ใน database ไม่ hardcode option list ใน FO client
- การเปลี่ยนแปลง option master ใน BO ต้องสะท้อนผลใกล้เคียงทันทีเท่าที่ทำได้ โดยคำนึงถึง caching strategy ใน section 22.5
- Option ที่ deactivate ต้องไม่กระทบ existing assets และต้องคง referential integrity ตาม section 17.4 และ section 17.10

### 22.2 FO Add/Edit Asset Form

วิธีดึง option ไปใช้ใน FO Add/Edit Asset form:

| Group | Control | Required | Rule |
| --- | --- | --- | --- |
| `condition` | Single select | Required เมื่อ status = `Sale`; Optional เมื่อ status = `Show`/`Hide` | แสดงเฉพาะ active option; เรียงตาม `sort_order` |
| `delivery` | Multi-select | Optional | แสดงเฉพาะ active option ใน group `delivery`; เลือกได้หลายค่า; ถ้าไม่เลือกเลยต้องไม่บันทึก `asset_delivery_items` row |
| `case_material` | Single select | Optional | แสดงเฉพาะ active option; เรียงตาม `sort_order` |
| `movement` | Single select | Optional | แสดงเฉพาะ active option; เรียงตาม `sort_order` |
| `dial_color` | Single select | Optional | แสดงเฉพาะ active option; เรียงตาม `sort_order` |
| `strap_bracelet_type` | Single select | Optional | แสดงเฉพาะ active option; เรียงตาม `sort_order` |

กฎการแสดงผล:

- แสดงเฉพาะ option ที่ `is_active=true` เท่านั้น
- แสดง label ตามภาษาที่ FO ใช้ (`label_th` หรือ `label_en` ตาม FO language mode)
- เรียงลำดับตาม `sort_order` จากน้อยไปมาก; tie-break ด้วย `option_key` ตามตัวอักษร
- Optional field สามารถเว้นว่างได้ (ไม่เลือก) และต้องบันทึกเป็น `null` ตาม Add / Edit Field Validation Matrix
- Required field (เช่น `condition` เมื่อ status = `Sale`) ต้องเลือกค่าหนึ่ง และต้อง validate ก่อน save
- `delivery` เป็น multi-select ตาม `allows_multi_select=true` ของ group; FO ต้องบันทึกเป็นหลาย `asset_delivery_items` row โดยแต่ละ row อ้างอิง `option_id` ใน group `delivery` เท่านั้น

กฎการบันทึก:

- FO บันทึก relation id (`condition_id`, `case_material_id`, `movement_id`, `dial_color_id`, `strap_bracelet_type_id`) ลง `watch_assets`
- FO บันทึก snapshot text (`condition_snapshot`, `case_material_snapshot`, ฯลฯ) คู่กับ relation id เพื่อคง display history ตาม section 17.4
- ถ้า Owner เว้นว่าง field ที่ optional ให้บันทึก relation id เป็น `null` และ snapshot text เป็น `null`/empty
- ค่าที่ Owner save ต้องไม่ถูก provider sync overwrite ตาม `06_MARKET_DATA_MODULE.md` section 15

### 22.3 FO Search Filter

วิธีดึง option ไปใช้ใน FO Search Filter:

| Group | Filter Control | Rule |
| --- | --- | --- |
| `condition` | Single-select filter | แสดงเฉพาะ active option ที่มี asset ใช้จริง |
| `delivery` | Multi-select filter | แสดงเฉพาะ active option ที่มี asset ใช้จริง |
| `case_material` | Single-select หรือ multi-select filter | แสดงเฉพาะ active option ที่มี asset ใช้จริง |
| `movement` | Single-select หรือ multi-select filter | แสดงเฉพาะ active option ที่มี asset ใช้จริง |
| `dial_color` | Single-select หรือ multi-select filter | แสดงเฉพาะ active option ที่มี asset ใช้จริง |
| `strap_bracelet_type` | Single-select หรือ multi-select filter | แสดงเฉพาะ active option ที่มี asset ใช้จริง |

กฎการแสดงผล:

- แสดงเฉพาะ option ที่ `is_active=true`
- ใช้ Filter Visibility Rule ของ `03_SEARCH_FILTER_MODULE.md`: แสดงเฉพาะ option ที่มี asset อยู่จริงในระบบตาม visibility ของ Search (ไม่แสดง option ที่ทำให้เกิดผลลัพธ์ว่าง)
- ใช้ Filter Dependency Rule: Brand → Model เป็น dependent filter; option filter ไม่ dependent กับ Brand/Model แต่ทำงานร่วมกันแบบ AND Logic ตาม Multiple Filter Rule
- รองรับ multi-select filter สำหรับ group ที่ `allows_multi_select=true` และสามารถขยายเป็น multi-select สำหรับ group อื่นถ้า implementation กำหนด
- เรียงตาม `sort_order` เช่นเดียวกับ Add/Edit Asset form
- Filter option ต้องอ่านจาก internal option master เดียวกับ Add/Edit Asset ตาม `03_SEARCH_FILTER_MODULE.md` Filter data source rule

กฎการ match:

- Search/Filter ต้องอิงค่าที่ถูก save กับ Asset จริง (relation id และ snapshot text) ไม่ใช่ option master active status
- Asset ที่มี inactive option ยังปรากฏในผลลัพธ์ถ้าตรงเงื่อนไขอื่น แต่ inactive option ไม่แสดงเป็นตัวเลือก filter ใหม่
- ถ้า asset ใช้ free-text spec ที่ไม่มี relation id ต้องยังค้นหา keyword จาก snapshot text ได้

### 22.4 FO Watch Alert Criteria

วิธีดึง option ไปใช้ใน FO Watch Alert criteria:

- Watch Alert criteria ใช้ schema เดียวกับ Search Filter ตาม `10_WATCH_ALERT_MODULE.md` Filter Logic Rule และ Validation Rules
- แสดงเฉพาะ option ที่ `is_active=true` เป็น criteria ใหม่
- Watch Alert ใช้ filter logic เดียวกับ Search Module รวม dependent filter และ AND Logic
- Watch Alert match เฉพาะ Asset สถานะ `Sale` ตาม Match Rule; option criteria ทำงานร่วมกับเงื่อนไขอื่นใน criteria

กฎสำหรับ Watch Alert เดิมที่อ้างถึง option ที่ถูก deactivate ภายหลัง:

- ต้องเก็บ criteria history ได้ ไม่ลบ criteria ที่อ้างถึง inactive option
- ต้องแสดง warning ใน Watch Alert List / Edit Watch Alert ว่า criteria อ้างถึง option ที่ inactive แล้ว
- ไม่ควร trigger match ใหม่ถ้า criteria อ้าง option ที่ inactive ตาม policy ใน `06_MARKET_DATA_MODULE.md` section 15 (Inactive หรือ unmapped market data)
- Watch Alert เดิมที่อ้าง inactive option ต้องไม่ถูกลบโดยอัตโนมัติ เพราะ User อาจต้องการแก้ไข criteria หรือลบด้วยตัวเอง

### 22.5 Caching Strategy สำหรับ FO

FO client ต้อง cache option list เพื่อลด API call และรองรับ offline/fallback scenario:

| ด้าน | กฎ |
| --- | --- |
| Cache storage | FO client cache option list ใน memory และ/หรือ local storage |
| Cache key | `option_master_version` (seed version เช่น `asset-spec-options-v1`) หรือ `last_updated` timestamp ของ option master |
| Cache TTL | ค่าเริ่มต้น 24 ชม. หรือตาม policy ที่ Product กำหนด; สามารถ override ได้ตอน implementation handoff |
| Refresh trigger | เมื่อ cache expire, เมื่อ FO app เปิดใหม่, หรือเมื่อ FO รับ push notification สำหรับ option master invalidation (ถ้ามี) |
| Fallback | ถ้า API ไม่พร้อม ใช้ cache เดิมที่มีอยู่ และแสดง indicator ว่ากำลังใช้ข้อมูล cache ถ้าจำเป็น |
| Validation | FO ต้อง validate active status ของ option ใน cache ก่อนแสดงใน form/filter ใหม่ เพราะ cache อาจเก่ากว่า database |

กฎเพิ่มเติม:

- Cache invalidation สามารถทำได้สองระดับ: (1) TTL-based แบบ passive และ (2) push-based แบบ active ถ้าระบบมี push notification infrastructure
- ถ้าใช้ push-based invalidation, BO action ที่เปลี่ยน option master ต้อง trigger event ไปยัง FO client เพื่อ refresh cache
- รายละเอียด cache invalidation/API timing ให้สรุปอีกครั้งตอนออกแบบ backend ตาม section 14 กฎการ sync
- Cache version ต้องตรงกับ seed version ใน `asset-spec-options.json` เพื่อให้ trace ได้ว่า FO ใช้ option master version ใด

### 22.6 Fallback Behavior เมื่อ Option ถูก Deactivate

| FO/BO Surface | พฤติกรรมเมื่อ option ถูก deactivate |
| --- | --- |
| FO Add Asset form | ไม่แสดง option ที่ deactivate ใน dropdown |
| FO Edit Asset form (asset เดิมที่ใช้ option ที่ deactivate) | ยังแสดง label เดิมได้ เพราะ lookup จาก `spec_options` โดยไม่กรอง `is_active`; Owner สามารถเปลี่ยนเป็น option active อื่นได้ แต่ถ้าเลือกใหม่ต้องเป็น active option เท่านั้น |
| FO Asset Detail display | ยังแสดง label เดิมได้ เพราะ lookup จาก `spec_options` โดยไม่กรอง `is_active` หรืออ่านจาก snapshot text |
| FO Search Filter | ไม่แสดง option ที่ deactivate เป็นตัวเลือก filter ใหม่; asset เดิมที่ใช้ inactive option ยังปรากฏในผลลัพธ์ถ้าตรงเงื่อนไขอื่น |
| FO Watch Alert criteria (ใหม่) | ไม่แสดง option ที่ deactivate เป็น criteria ใหม่ |
| FO Watch Alert criteria (เดิมที่อ้าง inactive option) | แสดง warning ว่า criteria อ้าง option ที่ inactive แล้ว; ไม่ลบ criteria; ไม่ trigger match ใหม่ถ้า criteria อ้าง inactive option ตาม policy |
| BO Asset Detail | ยังแสดง label เดิมของ asset แม้ option ถูก deactivate เพราะอ่านจาก asset snapshot/relation ไม่ใช่ option master active status |
| BO Asset List filter | แสดงเฉพาะ active option เป็นตัวเลือก filter ใหม่; asset ที่มี inactive option ยังปรากฏในผลลัพธ์ถ้าตรงเงื่อนไขอื่น |

กฎสำคัญ:

- ห้าม cascade delete หรือ set null FK ใน `watch_assets` และ `asset_delivery_items` เมื่อ deactivate ตาม section 17.10
- FO/BO ต้อง lookup label จาก `spec_options` โดยไม่กรอง `is_active` เมื่อแสดงข้อมูล asset เดิม
- FO form/filter/Watch Alert ใหม่ ต้องกรอง `is_active=true` เท่านั้น
- Asset snapshot text ไม่กระทบเพราะ asset เก็บ snapshot text คู่กับ relation id แยกต่างหาก

### 22.7 API Contract สำหรับ FO ดึง Option List

FO ดึง option list จาก backend ผ่าน API ต่อไปนี้:

#### Endpoint: `GET /api/spec-options`

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `group` | string | Optional | กรองตาม group identifier เช่น `condition`, `delivery`; ถ้าไม่ส่งให้คืนทุก group |
| `active` | boolean | Optional | ค่าเริ่มต้น `true`; ส่ง `false` เพื่อรวม inactive option (ใช้สำหรับ lookup asset เดิม) |
| `lang` | string | Optional | `th` หรือ `en`; ค่าเริ่มต้นตาม FO language mode |

#### Response 200 OK

```json
{
  "version": "asset-spec-options-v1",
  "last_updated": "2026-08-19T08:00:00+07:00",
  "groups": [
    {
      "group": "condition",
      "display_name_en": "Condition",
      "display_name_th": "สภาพ",
      "allows_multi_select": false,
      "options": [
        {
          "id": 1,
          "option_key": "new_unworn",
          "label_en": "New / Unworn",
          "label_th": "ใหม่ / ยังไม่ผ่านการใช้งาน",
          "description_en": "Never worn or no visible usage",
          "sort_order": 10,
          "is_active": true,
          "is_system": true
        }
      ]
    }
  ]
}
```

#### Response 404 Not Found

```json
{
  "error": "GROUP_NOT_FOUND",
  "message": "Option group not found."
}
```

#### Response 500 Internal Server Error

```json
{
  "error": "INTERNAL_ERROR",
  "message": "Unable to load option master."
}
```

กฎ API:

- Option ไม่น่าเยอะ (58 options ใน Phase 1) จึงไม่ต้อง pagination; คืนทั้งหมดใน response เดียว
- Response ต้องมี `version` และ `last_updated` เพื่อให้ FO client ใช้เป็น cache key
- `active=true` (default) กรองเฉพาะ option ที่ `is_active=true`; `active=false` รวม inactive option ด้วย เพื่อให้ FO lookup label ของ asset เดิมได้
- API permission: FO user ทุก role (Guest, Member) สามารถดึง active option ได้ เพราะเป็นข้อมูลสำหรับ form/filter; ไม่จำกัดเฉพาะ Member
- API ต้องรองรับ caching header (`Cache-Control`, `ETag`) เพื่อให้ FO client หรือ CDN cache ได้
- ถ้า FO ต้องการ lookup label ของ option id เฉพาะ สามารถใช้ `GET /api/spec-options/{id}` หรือ lookup จาก cache ที่โหลดทั้งหมดแล้ว

### 22.8 Prefill Behavior จาก Market Data Reference Selection

เมื่อ Owner เลือก Reference จาก Market Data ใน FO Add/Edit Asset form ระบบสามารถ prefill spec ได้:

| Spec Field | Prefill Source | Rule |
| --- | --- | --- |
| `case_material` | `watch_references.case_material` (provider text) | Map provider text กับ `spec_options` ใน group `case_material`; ถ้า match ให้เลือก option นั้น; ถ้าไม่ match ให้เว้นว่าง |
| `case_size_mm` | `watch_references.case_size` | Prefill เป็น free-text/decimal; ไม่ใช่ option master |
| `movement` | `watch_references.movement` (provider text) | Map provider text กับ `spec_options` ใน group `movement`; ถ้า match ให้เลือก option นั้น; ถ้าไม่ match ให้เว้นว่าง |

กฎ prefill:

- Prefill ใช้ข้อมูลจาก `watch_references` ที่เชื่อมกับ Market Data catalog
- Owner ต้องแก้ไขค่าที่ prefill ได้ เพราะเรือนจริงอาจเปลี่ยนสาย มีอุปกรณ์ไม่ครบ หรือข้อมูล provider ไม่ครบ
- ค่าที่ Owner save ต้องไม่ถูก provider sync overwrite ตาม `06_MARKET_DATA_MODULE.md` section 15
- ถ้า reference ไม่มีข้อมูล spec บาง field ให้เว้นว่าง และไม่บังคับให้เลือก
- Prefill ต้องไม่บันทึกอัตโนมัติ ต้องรอ Owner กด Save ใน Add/Edit Asset form
- Prefill ทำเฉพาะตอนเลือก Reference ครั้งแรกใน Add Asset; ใน Edit Asset ถ้า Owner เปลี่ยน Reference ใหม่ ระบบอาจเสนอ prefill ใหม่ แต่ต้องไม่ overwrite ค่าที่ Owner แก้ไว้แล้วโดยไม่ได้รับการยืนยัน

### 22.9 Interaction ระหว่าง Market Data และ Option Master

Market Data และ Option Master เป็นสองระบบแยกกัน แต่ต้องมี interaction ที่ชัดเจน:

| ด้าน | Rule |
| --- | --- |
| ขอบเขต | Market Data เป็น provider catalog (brand, model, reference, price index); Option Master เป็น internal option master (condition, delivery, case_material, movement, dial_color, strap_bracelet_type) |
| ข้อมูล provider | `watch_references.case_material` และ `watch_references.movement` เป็น text จาก provider ไม่ใช่ option master |
| Mapping | ระบบต้อง map provider text กับ `spec_options` ได้ (ถ้า match) สำหรับ prefill ใน FO Add/Edit Asset |
| ไม่ match | ถ้า provider text ไม่ match กับ option master ใด ให้เก็บเป็น free-text ใน `asset_specifications` และปล่อย relation id เป็น `null` |
| ไม่ overwrite | Provider sync ต้องไม่ overwrite option master; option master จัดการโดย Admin ผ่าน BO เท่านั้น |
| ไม่ sync | Option Master ไม่เชื่อมกับ provider sync ตาม section 2 (อยู่นอกขอบเขต) |
| BO Market Data | `06_MARKET_DATA_MODULE.md` ไม่จัดการ option master; section 15 ระบุชัดว่า internal option master เป็น option สำหรับ Asset form/search filter ไม่ใช่ provider catalog ที่ BO Market Data แก้ไขได้ใน Phase 1 |

กฎ mapping สำหรับ implementation:

- Mapping rule เก็บใน backend service layer ไม่ใช่ database hardcode
- ถ้า provider text ใกล้เคียงแต่ไม่ตรงทุกตัวอักษร สามารถใช้ fuzzy match หรือ alias table ถ้า implementation กำหนด
- Mapping ไม่สำเร็จต้องไม่ block Add/Edit Asset; ให้เว้นว่างและให้ Owner กรอกเอง
- Mapping result ต้องไม่บันทึกกลับไปยัง `watch_references` หรือ `spec_options`; เป็น read-only mapping สำหรับ prefill เท่านั้น

### 22.10 FO Integration Acceptance Criteria

เพิ่มเติมจาก section 20:

- [ ] วิธีดึง option ไปใช้ใน FO Add/Edit Asset form ระบุชัดสำหรับแต่ละ group (control type, required rule, sort order)
- [ ] FO Search Filter ระบุชัด รวม Filter Visibility Rule และ Filter Dependency Rule
- [ ] FO Watch Alert criteria ระบุชัด รวม schema เดียวกับ Search Filter และ warning สำหรับ inactive option
- [ ] Caching strategy มี storage, cache key, TTL, refresh trigger และ fallback
- [ ] Fallback behavior สำหรับ deactivate option ครบทุก surface (FO form, FO Edit asset เดิม, FO Asset Detail, FO Search Filter, FO Watch Alert, BO Asset Detail, BO Asset List filter)
- [ ] API contract มี endpoint, parameter, response format, error response และ caching header
- [ ] Prefill behavior จาก Market Data reference ระบุชัด รวม Owner แก้ไขได้และไม่ถูก provider sync overwrite
- [ ] Interaction ระหว่าง Market Data และ Option Master ระบุชัด รวม mapping rule และไม่ match handling
- [ ] FO Integration ครอบคลุม Add/Edit Asset, Search Filter และ Watch Alert ครบทั้งสาม surface
