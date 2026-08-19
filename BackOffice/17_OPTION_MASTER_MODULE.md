# 17 BO Option Master Module

**เวอร์ชัน:** `BO-17-v0.1`
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
- System option (`is_system=true`) สามารถแก้ label และ sort_order ได้ แต่ deactivate ได้เฉพาะกรณีจำเป็นและต้องมี reason ชัดเจน เพราะเป็น baseline option ที่ seed มาตั้งแต่ต้น
- การเปลี่ยนแปลง option master มีผลต่อ FO form/filter/Watch Alert จึงต้อง audit ทุกครั้ง

| Action | Rule |
| --- | --- |
| View Option Group List | Allowed by module access |
| View Option Detail | Allowed by module access |
| Add option | Allowed by write permission; confirmation + audit |
| Edit option label/description | Allowed by write permission; confirmation + audit |
| Edit option key | Not allowed หลัง option ถูกใช้ใน asset แล้ว |
| Deactivate option | Allowed by write permission; confirmation + reason + audit |
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
| Deactivate option | Option active | Yes | Yes | `OPTION_DEACTIVATE` | ไม่แสดงใน FO form/filter/Watch Alert ใหม่; existing assets ยังแสดงค่าเดิม |
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

Target entity type เพิ่ม: `SpecOption` ใน `08_AUDIT_LOG_MODULE.md` section 5

## 17. Data Domain

### 17.1 Option Group

ขั้นต่ำต้องมี:

- Group ID
- Group identifier (`group`) เช่น `condition`, `case_material`
- Label TH/EN ถ้ามี
- `allows_multi_select` (boolean)
- จำนวน option ทั้งหมด
- จำนวน active option
- Created/updated timestamp

### 17.2 Option

ขั้นต่ำต้องมี:

- Option ID
- Group relation
- Key (`key`) stable identifier
- Label EN (`label_en`)
- Label TH (`label_th`)
- Description EN (`description_en`) optional
- Sort order (`sort_order`)
- Is active (`is_active`)
- Is system (`is_system`) baseline seed option
- Created/updated timestamp
- Created/updated by admin ID

Seed data source: `../SeedData/asset-spec-options.json` (schema version `asset-spec-options-v1`)

กฎข้อมูล:

- `key` ต้อง stable ห้าม rename หลังใช้งาน ถ้าต้องการเปลี่ยนให้สร้าง option ใหม่และ deactivate option เดิม
- `is_system=true` สำหรับ option ที่ seed มาตั้งแต่ต้น สามารถแก้ label และ sort_order ได้ แต่ deactivate ต้องมี reason ชัดเจน
- `is_active=false` ต้องไม่แสดงใน FO form/filter/Watch Alert ใหม่ แต่ต้องคง relation กับ existing assets

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
- [ ] Integration กับ module อื่น ระบุชัด
- [ ] Empty/Loading/Error states ครบ
- [ ] Responsive layout ตาม `00_GLOBAL_RULES_MODULE.md`

## 21. Open Decisions

| ID | Decision Needed | Current Recommendation |
| --- | --- | --- |
| BO-OPT-001 | Option Master phase | Phase 1 เพราะเป็น foundational operational data ที่ FO ต้องใช้ตั้งแต่ launch; แต่ต้องยืนยันกับ Product เพราะเป็น module ใหม่นอก baseline เดิม |
| BO-OPT-002 | Prototype screen | ยังไม่มี prototype สำหรับ Option Master; ควรสร้าง prototype และเทียบกับเอกสารนี้ก่อน implementation handoff |
| BO-OPT-003 | System option deactivate policy | ปัจจุบันอนุญาตให้ deactivate system option ได้ถ้ามี reason ชัดเจน; อาจต้องกำหนดให้ system option บางประเภท lock ไม่ให้ deactivate เลย ถ้ากระทบ FO form หลัก |
| BO-OPT-004 | Reorder UI | ปัจจุบัน reorder ทาง Edit Option modal; อาจเพิ่ม drag-and-drop ใน prototype ถ้าต้องการ UX ที่สะดวกกว่า |
