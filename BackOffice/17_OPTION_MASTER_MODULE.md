# 17 BO Option Master Module

**Version:** `BO-17-v0.15`  
**Date:** 2026-10-05  
**Status:** สเปกปัจจุบัน — Suggestion Queue UI implemented ใน prototype (§23.5, task `3d2b6f50`)  
**Platform:** Responsive Web Back Office

## UI Standards And Prototype Reference

เอกสารนี้ต้องใช้ร่วมกับ `00_GLOBAL_RULES_MODULE.md` และยึดรูปแบบหน้าจอ/พฤติกรรมที่ยืนยันแล้วใน `../Prototypes/bo-prototype.html` เป็นมาตรฐานหลัก

ห้ามออกแบบ pattern แยกเองสำหรับ list toolbar, breakpoint, table/card layout, pagination, reset, drill-down, drawer, modal หรือ detail layout ยกเว้นเอกสารนี้ระบุไว้ชัดเจนว่าเป็น override ที่อนุมัติแล้ว

หมายเหตุ prototype: หน้าจอ Option Master ถูกสร้างและยืนยันใน `../Prototypes/bo-prototype.html` แล้ว เอกสารนี้ได้รับการอัปเดตให้ตรงกับ prototype สุดท้าย รวมถึง Add Group, Reorder Groups และ Group Audit Log view

## Document Information

| Field | Detail |
| --- | --- |
| Module Name | BO Option Master |
| Platform | Responsive Web Back Office |
| Version | `BO-17-v0.13` |
| Status | สเปกปัจจุบัน |
| Owner | Product / UX / Engineering / Operations |
| Document Type | Functional PRD |

## 1. Objective

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

## 2. Scope

### In Scope

- Option Group List
- Option Detail (รายการ option ภายใน group)
- Add option
- Edit option label (TH/EN) และ description
- Deactivate option
- Reactivate option
- Delete option (เฉพาะ option ที่ไม่มี asset ใช้ — destructive, type-to-confirm)
- Reorder option (sort_order)
- Add group
- Edit group (display_name_th/en, description, allows_multi_select)
- Deactivate group
- Reactivate group
- Delete group (destructive)
- Reorder groups
- Group Audit Log view
- Audit log สำหรับทุก action
- Responsive layout ตาม `00_GLOBAL_RULES_MODULE.md`

### Out Of Scope

- Delete option ที่เคยถูกใช้ใน asset แล้ว (ใช้ deactivate แทน เพื่อคง history); Delete option ใน Phase 1 อนุญาตเฉพาะ option ที่ยังไม่มี asset ใช้ ตาม section 11.1
- Bulk import option
- Bulk export option
- Override provider data จาก The Watch API (เป็นหน้าที่ของ Market Data module)
- แก้ไข `group` identifier ของ group ที่มีอยู่
- แก้ไข `key` ของ option หลังสร้าง
- เชื่อม Option Master กับ provider sync

## 3. Menu Structure

เมนูหลัก: `Option Master`

Option Master เป็นเมนูหลักระดับเดียว ไม่มี submenu เพราะเข้าผ่าน Option Group List แล้ว drill-down ไป Option Detail ของ group นั้น

พฤติกรรมการนำทาง:

- เมื่อเข้า `Option Master` ให้เปิด `Option Group List` เป็นหน้าแรก
- เมนู `Option Master` ต้องแสดง active state ถูกต้อง
- จาก `Option Group List` คลิก group row หรือปุ่ม `View` เพื่อเปิด Option Detail ของ group นั้น
- ปุ่มกลับจาก Option Detail ต้องกลับ `Option Group List`
- Option Master เป็นโมดูลใหม่ที่ยังไม่ได้ล็อกใน navigation จึงเพิ่มต่อท้าย navigation ที่ล็อกไว้ใน `00_GLOBAL_RULES_MODULE.md` ได้ โดยห้ามเปลี่ยนลำดับ ชื่อ หรือ active state ของเมนูที่ล็อกไว้

## 4. Admin Access And Permissions

Admin ที่มีสิทธิ์เข้าถึง Option Master สามารถดู list/detail และทำ write action ได้ตามสิทธิ์ module access

กฎทั่วไป:

- View Option Group List และ Option Detail ใช้สิทธิ์ module access ปกติ
- Write action (Add, Edit, Deactivate, Reactivate, Reorder) ต้องมี module access ที่อนุญาต write และต้องผ่าน confirmation + audit
- API permission ต้อง enforce ที่ route, API และ service layer ไม่พึ่งเฉพาะการซ่อนปุ่มใน UI
- System option (`is_system=true`) สามารถแก้ label และ sort_order ได้ แต่การ deactivate อยู่ภายใต้ System Option Deactivate Policy ตาม section 10.1 — อนุญาตพร้อม reason และ safeguard ทุกกลุ่ม
- การเปลี่ยนแปลง option master มีผลต่อ FO form/filter/Watch Alert จึงต้อง audit ทุกครั้ง

| Action | Rule |
| --- | --- |
| View Option Group List | Allowed by module access |
| View Option Detail | Allowed by module access |
| Add option | Allowed by write permission; confirmation + audit |
| Edit option label/description | Allowed by write permission; confirmation + audit |
| Edit option key | Not allowed หลังสร้าง — key เป็น stable identifier ที่ FO/seed/migration อ้างอิงตั้งแต่ option active |
| Deactivate option | Allowed by write permission; confirmation + reason + audit; ต้องผ่าน System Option Deactivate Policy ตาม section 10.1 |
| Reactivate option | Allowed by write permission; confirmation + audit |
| Reorder option | Allowed by write permission; audit |
| Delete option | Allowed by write permission; **destructive — type-to-confirm**; เฉพาะ option ที่ไม่มี asset ใช้ (safeguard); confirmation + audit `OPTION_DELETE` — รายละเอียด section 11.1 |
| **Edit group** | Allowed by write permission; confirmation + audit; แก้ได้เฉพาะ `display_name_th`, `display_name_en`, `description`, `allows_multi_select`; ห้ามแก้ `group` identifier และ `group_id` — รายละเอียด section 6.1 |
| **Deactivate group** | Allowed by write permission; confirmation + reason (required) + audit; safeguard: ห้าม deactivate ถ้ามี asset ใช้ option ใน group นั้นอยู่ — รายละเอียด section 6.1 |
| **Reactivate group** | Allowed by write permission; confirmation + audit — รายละเอียด section 6.1 |
| **Delete group** | Allowed by write permission; **destructive — confirm 2 ครั้ง**; เงื่อนไข: (1) group เป็น Inactive แล้ว + (2) ไม่มี asset ใช้ option ใน group นั้น; audit; ไม่สามารถย้อนกลับได้ — รายละเอียด section 6.1 |
| **Add group** | Allowed by write permission; confirmation + audit `GROUP_CREATE`; ต้องมี Group Key unique (lowercase snake_case); รายละเอียด section 6.1.6 |
| **Reorder groups** | Allowed by write permission; audit `GROUP_REORDER` ครั้งเดียวต่อการ save เมื่อลำดับเปลี่ยน; เฉพาะ active groups ≥2; รายละเอียด section 6.1.7 |
| **View group audit log** | Allowed by module access; เปิดจาก action menu ของ group row; รายละเอียด section 6.1.8 |
| Bulk import/export | Not available ใน Phase 1 |

## 5. Responsive Layout

| Breakpoint | ความกว้าง | ข้อกำหนดของ Option Master |
| --- | --- | --- |
| Mobile | `<= 760px` | รายการแสดงเป็น card-like rows, column สำคัญต้องเปลี่ยนเป็น label/value, search เต็มความกว้าง, pagination ใช้งานได้, modal ต้องไม่ล้นจอ |
| Tablet | `761px - 1365px` | ตารางยังคงอ่านได้โดยคง column สำคัญ, modal ต้องไม่ทับเนื้อหาสำคัญ |
| Desktop | `> 1365px` | แสดง table เต็ม, list toolbar ตาม prototype pattern |

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
- Page action หลัก (เฉพาะ admin ที่มี write permission):
  - ปุ่ม `จัดเรียง` (Reorder Groups) — แสดงเฉพาะเมื่อมี active group ≥2; เปิด Reorder Groups Modal ตาม section 6.1.7
  - ปุ่ม `เพิ่ม Group` (Add Group) — เปิด Add Group Modal ตาม section 6.1.6
  - บน mobile ซ่อน label ของทั้งสองปุ่ม เหลือ icon + aria-label เหมือน pattern ของหน้าอื่นใน prototype

Filter:

- มี search field เดียว
- Placeholder: `Search option group`
- ค้นหาได้จาก Group Key และ label
- มี status filter: `ทั้งหมด`, `Active`, `Inactive` เพื่อรองรับ group-level Deactivate/Reactivate ตาม section 6.1

> หมายเหตุ: Option Master ไม่แสดง summary cards และ side panel ทั้งใน Option Group List และ Option Detail เพื่อลดความซ้ำซ้อนของข้อมูลที่แสดงในตารางอยู่แล้ว การตัดสินใจนี้อนุมัติแล้วใน BO-17-v0.7

ตาราง Option Group List:

| Column | ข้อกำหนด |
| --- | --- |
| Group ID | group identifier เช่น `OG-001` |
| Group Key | group key เช่น `condition`, `case_material` |
| Label (TH) | label ภาษาไทยของ group ถ้ามี |
| Label (EN) | label ภาษาอังกฤษของ group ถ้ามี |
| Active Options | แสดงเป็น `active/total` เช่น `5/8` |
| Multi-select | แสดง `Yes` หรือ `No` ตาม `allows_multi_select` |
| System | แสดง `System` หรือ `Custom` ตาม `is_system` |
| Status | แสดง `Active` หรือ `Inactive` เป็น badge ตาม `spec_option_groups.is_active` |
| Updated | วันที่/เวลาที่ group ถูกอัปเดตล่าสุด |
| Action | action menu: `View`, `Edit`, `Deactivate`/`Reactivate` (ตามสถานะ), `Delete` (เฉพาะ Inactive + ไม่มี asset ใช้), `ดู Audit Log` (เปิด Group Audit Log ตาม section 6.1.8) — รายละเอียด section 6.1 |

กฎการแสดงผล:

- Row ทั้ง row และเมนู `View` ต้องเปิด Option Detail เดียวกัน
- Action menu ใช้ pattern เดียวกับ row menu ใน BO prototype (เช่น `...` menu ที่คอลัมน์ Action)
- ปุ่ม `Deactivate` แสดงเฉพาะ group ที่ Active; ปุ่ม `Reactivate` แสดงเฉพาะ group ที่ Inactive
- ปุ่ม `Delete` แสดงเฉพาะ group ที่ Inactive และไม่มี asset ใช้ option ใน group นั้น (safeguard) — ถ้าไม่ผ่านเงื่อนไขให้ disabled พร้อม tooltip
- ปุ่ม `Edit` แสดงเฉพาะ admin ที่มี write permission
- Mobile ต้องแสดง metadata เช่น Options, Active, Multi-select, Status ใน card row
- Empty state: `ไม่พบข้อมูล`
- Pagination ตามมาตรฐาน `00_GLOBAL_RULES_MODULE.md` (10 rows per page)

### 6.1 Group-level Actions

ส่วนนี้นิยาม group-level actions บน Option Group List เพื่อให้ Admin จัดการ group ที่ไม่ใช้แล้วได้โดยไม่ต้อง hard delete ทันที

เหตุผล: spec เดิมไม่มี group-level actions ทำให้ group ที่ไม่ใช้แล้วไม่มีทางปิดหรือลบ แม้ data model มี field `is_active` สำหรับ group แล้ว (section 17.1) การเพิ่ม group-level actions ทำให้ group ที่ไม่ใช้แล้วไม่ปรากฏใน FO form/filter ใหม่ได้

#### 6.1.1 Edit Group

เปิดจาก action menu `Edit` ใน Option Group List (เฉพาะ admin ที่มี write permission)

ใช้ modal ตาม prototype pattern

ฟอร์ม Edit Group:

| Field | Editable | Validation |
| --- | --- | --- |
| `group` identifier (Group Key) | **Not editable** | แสดงเป็น read-only พร้อม note ว่า Group Key ล็อกห้าม rename หลังใช้งาน |
| `group_id` | **Not editable** | ไม่แสดงในฟอร์ม (internal) |
| `display_name_th` | Editable | trim whitespace; ห้ามว่าง; ไม่เกินความยาวที่ระบบกำหนด |
| `display_name_en` | Editable | trim whitespace; ห้ามว่าง; ไม่เกินความยาวที่ระบบกำหนด |
| `description` | Editable | trim whitespace; ไม่เกินความยาวที่ระบบกำหนด |
| `allows_multi_select` | Editable | toggle `Yes`/`No`; คำเตือนถ้าเปลี่ยนจาก `true` → `false` เมื่อมี asset ใช้หลาย option ใน group นั้น |

กฎ:

- ห้ามแก้ `group` identifier / Group Key (เช่น `condition`) หลัง group ถูกใช้งานแล้ว เพราะเป็น stable identifier ที่ FO/seed/migration อ้างอิง
- ห้ามแก้ `group_id`
- การแก้ `display_name_th`/`display_name_en` ต้องไม่กระทบค่าที่เก็บใน existing assets เพราะ asset เก็บ relation id และ snapshot text แยก
- ถ้าเปลี่ยน `allows_multi_select` จาก `true` → `false` ขณะมี asset ใช้หลาย option ใน group นั้น ต้องแสดง warning ใน confirmation modal และต้องไม่บังคับตัดค่าที่เก็บใน existing assets (คง history) — แต่ FO form ใหม่จะใช้โหมด single-select ตามค่าใหม่
- ต้องมี confirmation modal ก่อน save จริง พร้อมแสดง before/after value
- บันทึก audit `GROUP_EDIT`

#### 6.1.2 Deactivate Group

เปิดจาก action menu `Deactivate` ใน Option Group List (แสดงเฉพาะ group ที่ Active; เฉพาะ admin ที่มี write permission)

ใช้ confirmation modal ตาม prototype pattern

Confirmation modal ต้องแสดง:

- ชื่อ group ที่จะ deactivate (Group Key + display name)
- ผลกระทบ: group นี้และ option ทั้งหมดใน group จะไม่แสดงใน FO Add/Edit Asset form ใหม่, FO Search Filter ใหม่ และ FO Watch Alert criteria ใหม่
- ข้อความชี้แจงว่า existing assets ที่ใช้ option ใน group นี้ยังแสดงค่าเดิมตามปกติ
- Reason field (Required): เหตุผลในการ deactivate group
- ปุ่ม `Cancel` และ `Confirm Deactivate`

กฎ:

- **Safeguard: ห้าม deactivate group ถ้ามี asset ใดใช้ option ใน group นั้นอยู่** (เช่นเดียวกับ option-level safeguard แต่ตรวจที่ระดับ group ทุก option ใน group)
  - Error message: `ไม่สามารถ deactivate group ได้ เนื่องจากยังมี asset ใช้ option ใน group <group> อยู่`
  - Service layer ต้อง enforce safeguard นี้ด้วย ไม่พึ่งเฉพาะ UI
- หลัง deactivate สถานะ group เปลี่ยนเป็น `Inactive` (`is_active=false`)
- เมื่อ group Inactive: option ทั้งหมดใน group จะไม่แสดงใน FO form/filter/Watch Alert ใหม่ โดยอัตโนมัติ (FO กรองด้วย group `is_active=true`)
- ปุ่ม action เปลี่ยนจาก `Deactivate` เป็น `Reactivate`
- บันทึก audit `GROUP_DEACTIVATE` พร้อม reason

#### 6.1.3 Reactivate Group

เปิดจาก action menu `Reactivate` ใน Option Group List (แสดงเฉพาะ group ที่ Inactive; เฉพาะ admin ที่มี write permission)

ใช้ confirmation modal ตาม prototype pattern

Confirmation modal ต้องแสดง:

- ชื่อ group ที่จะ reactivate (Group Key + display name)
- ผลกระทบ: group นี้และ option ที่ยัง active ใน group จะกลับมาแสดงใน FO Add/Edit Asset form, FO Search Filter และ FO Watch Alert criteria
- ปุ่ม `Cancel` และ `Confirm Reactivate`

กฎ:

- หลัง reactivate สถานะ group เปลี่ยนเป็น `Active` (`is_active=true`)
- option ที่เป็น `Inactive` อยู่ใน group ยังคง Inactive ตามสถานะเดิม — reactivate group ไม่ได้ reactivate option ทั้งหมดใน group อัตโนมัติ
- ปุ่ม action เปลี่ยนจาก `Reactivate` เป็น `Deactivate`
- บันทึก audit `GROUP_REACTIVATE`

#### 6.1.4 Delete Group (Destructive)

เปิดจาก action menu `Delete` ใน Option Group List (แสดงเฉพาะ group ที่ Inactive และไม่มี asset ใช้ option ใน group นั้น; เฉพาะ admin ที่มี write permission)

เป็น **destructive action ที่ไม่สามารถย้อนกลับได้** ต้อง confirm 2 ครั้ง

เงื่อนไข (ต้องครบทั้งสองข้อ):

1. group เป็น `Inactive` แล้ว (ต้อง deactivate ก่อน)
2. ไม่มี asset ใดใช้ option ใน group นั้น (safeguard)

Confirmation modal ครั้งที่ 1:

- ชื่อ group ที่จะ delete (Group Key + display name)
- คำเตือน: `การลบ group เป็นการกระทำที่ไม่สามารถย้อนกลับได้ ข้อมูล group และ option ทั้งหมดใน group จะถูกลบออกจากระบบอย่างถาวร`
- แสดงจำนวน option ใน group ที่จะถูกลบด้วย
- ปุ่ม `Cancel` และ `Confirm Delete`

Confirmation modal ครั้งที่ 2 (re-confirm):

- ต้องพิมพ์ Group Key ซ้ำเพื่อยืนยัน (type-to-confirm pattern)
- ข้อความ: `พิมพ์ <group> เพื่อยืนยันการลบ`
- ปุ่ม `Cancel` และ `Delete Permanently` (disabled จนกว่าจะพิมพ์ถูก)

กฎ:

- **Safeguard: ห้าม delete group ถ้ามี asset ใดใช้ option ใน group นั้นอยู่** แม้ group จะ Inactive แล้ว
  - Error message: `ไม่สามารถ delete group ได้ เนื่องจากยังมี asset ใช้ option ใน group <group> อยู่`
  - Service layer ต้อง enforce safeguard นี้ด้วย ไม่พึ่งเฉพาะ UI
- หลัง delete: ลบ record ใน `spec_option_groups` และ `spec_options` ของ group นั้น (hard delete) พร้อม audit record ใน `spec_option_audit`
- ไม่สามารถย้อนกลับได้ — ไม่มี undo
- บันทึก audit `GROUP_DELETE` ก่อนทำ hard delete (เพื่อคง trail ว่าเคยมี group นี้อยู่)
- ปุ่ม `Delete` ต้อง disabled หรือ hidden ถ้าไม่ผ่านเงื่อนไข (1) หรือ (2) พร้อม tooltip อธิบายเหตุผล

#### 6.1.5 Safeguard Rules For Group-level Actions

สรุป safeguard ที่ service layer ต้อง enforce (ไม่พึ่งเฉพาะ UI):

| Action | Safeguard | Error |
| --- | --- | --- |
| Deactivate group | ไม่มี asset ใช้ option ใน group นั้นอยู่ | `GROUP_DEACTIVATE_BLOCKED_BY_ASSET_USAGE` |
| Delete group | (1) group Inactive + (2) ไม่มี asset ใช้ option ใน group นั้น | `GROUP_DELETE_BLOCKED_BY_ASSET_USAGE` / `GROUP_DELETE_REQUIRES_INACTIVE_FIRST` |
| Edit group | ไม่มี safeguard พิเศษ (แก้เฉพาะ label/description/multi-select) | — |
| Reactivate group | ไม่มี safeguard พิเศษ | — |

กฎการตรวจสอบ asset usage:

- ตรวจว่ามี `watch_assets` ใดที่ `condition_id`/`case_material_id`/`movement_id`/`dial_color_id`/`strap_bracelet_type_id` อ้างถึง option ใน group นั้น หรือ `asset_delivery_items.option_id` อ้างถึง option ใน group `delivery`
- ตรวจที่ service layer ทุกครั้งก่อน execute action ไม่พึ่งเฉพาะการซ่อนปุ่มใน UI
- ถ้ามี asset ใช้ ต้อง reject พร้อม error code ข้างต้น

#### 6.1.6 Add Group

เปิดจากปุ่ม `เพิ่ม Group` ใน page actions ของ Option Group List (เฉพาะ admin ที่มี write permission)

ใช้ modal ตาม prototype pattern (เดียวกับ Edit Group modal แต่เป็น mode add)

ฟอร์ม Add Group:

| Field | Editable | Validation |
| --- | --- | --- |
| `group_id` | **Not editable** | แสดงเป็น read-only; ค่าถัดไปจาก sequence (เช่น `OG-007`) สร้างอัตโนมัติ |
| `group` identifier (Group Key) | Editable (required) | lowercase snake_case เท่านั้น (`^[a-z0-9_]+$`); ห้ามว่าง; ไม่เกิน 64 ตัวอักษร; ต้อง unique ในระบบ; ห้ามเปลี่ยนหลังสร้าง |
| `display_name_en` | Editable (required) | trim whitespace; ห้ามว่าง; ไม่เกิน 128 ตัวอักษร; ต้องเป็นภาษาอังกฤษเท่านั้น (ห้ามอักขระที่ไม่ใช่ ASCII); ต้อง unique ในระบบ |
| `display_name_th` | Editable (required) | trim whitespace; ห้ามว่าง; ไม่เกิน 128 ตัวอักษร; ต้อง unique ในระบบ |
| `description` | Editable (optional) | trim whitespace; ไม่เกิน 512 ตัวอักษร |
| `allows_multi_select` | Editable | toggle `Yes`/`No`; default `No` |
| `is_active` | Editable | toggle Active/Inactive; default `Active` |
| `sort_order` | **Not shown in form** | ระบบกำหนดอัตโนมัติเป็นค่าถัดไปจาก sort_order สูงสุดใน active groups + 10 |

กฎ:

- Group Key ต้อง unique ทั้งระบบ ถ้าซ้ำต้องแสดง error ใกล้ field
- Label (EN) และ Label (TH) ต้อง unique ทั้งระบบด้วย เพื่อป้องกันสับสนใน BO list และ FO form
- หลัง save สำเร็จ group ใหม่ปรากฏในตาราง Option Group List ตาม sort_order
- group ใหม่เป็น group ว่าง (ไม่มี option) Admin สามารถเข้าไปเพิ่ม option ภายหลังได้ผ่าน Option Detail
- ต้องมี confirmation modal (Confirm Create Group) ก่อน save จริง พร้อมแสดง summary ของค่าทั้งหมด + ผลกระทบต่อ FO (group ใหม่จะปรากฏใน FO Add/Edit Asset form, Search Filter และ Watch Alert criteria ทันทีเมื่อ FO อ่าน option master ล่าสุด — ถ้าตั้งเป็น Inactive จะไม่แสดงจนกว่าจะเปิดใช้งาน)
- บันทึก audit `GROUP_CREATE`

#### 6.1.7 Reorder Groups

เปิดจากปุ่ม `จัดเรียง` ใน page actions ของ Option Group List (เฉพาะ admin ที่มี write permission; แสดงเฉพาะเมื่อมี active group ≥2)

ใช้ modal ตาม prototype pattern เดียวกับ Reorder Modal ของ option (section 12.1) และ Category Display Order ใน `bo-prototype.html`

โครงสร้าง Reorder Groups Modal:

- Header: `Reorder Option Groups` พร้อมคำอธิบาย `ลากเพื่อปรับลำดับการแสดงผลใน FO form/filter`
- List ของ active group เรียงตาม sort_order ปัจจุบัน
- แต่ละ row แสดง: drag handle, group display_name_en + Group Key, display_name_th + sort_order ปัจจุบัน, index (#1, #2, ...)
- Desktop: ใช้ HTML5 drag-and-drop
- Touch device: แสดง up/down arrow buttons ที่แต่ละ row เป็น fallback
- ปุ่ม `ยกเลิก` และ `บันทึกลำดับ`

กฎการทำงาน:

- แสดงเฉพาะ active group เท่านั้น (inactive group ไม่เข้าร่วม reorder)
- ลำดับใหม่มีผลต่อ FO form/filter ทันทีเมื่อ FO อ่าน option master ล่าสุด
- หลัง save ระบบคำนวณ sort_order ใหม่แบบ sequential (10, 20, 30, ...) ตามลำดับใน modal ให้ active groups เท่านั้น inactive groups คง sort_order เดิม
- บันทึก audit `GROUP_REORDER` ครั้งเดียวต่อการ save พร้อม before/after sort_order ของทุก group ที่เปลี่ยนลำดับ — บันทึกเฉพาะเมื่อลำดับเปลี่ยนจริง
- ถ้า admin ไม่ได้เปลี่ยนลำดับเลยและกด save ไม่ต้องบันทึก audit และแสดง toast แจ้งว่าไม่มีการเปลี่ยนลำดับ

#### 6.1.8 Group Audit Log View

เปิดจาก action menu `ดู Audit Log` ใน Option Group List (เฉพาะ admin ที่มี module access)

ใช้ modal ตาม prototype pattern เดียวกับ Option Audit Log view (section 16) แต่แสดงเฉพาะ group-level actions

โครงสร้าง Group Audit Log Modal:

- Header: `Audit Log` พร้อม subtitle แสดง group_id, Group Key และ display_name_en
- Summary section: แสดง Group ID, Group Key, Label (EN), Status (Active/Inactive pill)
- Audit list: เรียงจากใหม่ไปเก่า แต่ละ entry แสดง:
  - Action type (badge พร้อมสีตามประเภท: add, edit, deactivate, reactivate, reorder)
  - Timestamp
  - Actor (admin name + access context)
  - Reason (ถ้ามี — สำหรับ GROUP_DEACTIVATE)
  - Before/after diff (เช่น sort_order เดิม/ใหม่ สำหรับ GROUP_REORDER หรือ field ที่เปลี่ยนสำหรับ GROUP_EDIT)
- Empty state: `ยังไม่มีประวัติ audit สำหรับ group นี้`

Action types ที่แสดงใน Group Audit Log (6 ตัว):

| Action Type | Label | สี badge |
| --- | --- | --- |
| `GROUP_CREATE` | Group Create | add (เขียว) |
| `GROUP_EDIT` | Group Edit | edit (น้ำเงิน) |
| `GROUP_DEACTIVATE` | Group Deactivate | deactivate (แดง/เทา) |
| `GROUP_REACTIVATE` | Group Reactivate | reactivate (เขียว) |
| `GROUP_DELETE` | Group Delete | deactivate (แดง/เทา) |
| `GROUP_REORDER` | Group Reorder | reorder (ม่วง/น้ำเงิน) |

กฎ:

- อ่านจาก `spec_option_audit` ที่กรองด้วย `group_id` ของ group นั้น และ `action_type` ในกลุ่ม GROUP_* (ไม่แสดง OPTION_* ระดับ option)
- เป็น read-only view ไม่มี action ใด ๆ
- ใช้ rendering เดียวกับ Option Audit Log สำหรับ before/after diff

## 7. Option Detail

เปิดจาก group row ใน Option Group List

Header:

- Breadcrumb: `การดำเนินงาน / Option Master / <group>`
- Page title: `<group>` เช่น `condition`
- Back button: `Back to Option Groups`
- Panel title: `Options (<total>)`
- Page action หลัก: ปุ่ม `Add Option` และปุ่ม `Reorder` (เฉพาะ admin ที่มี write permission; ปุ่ม `Reorder` แสดงเฉพาะเมื่อมี active option ≥2 ในกลุ่ม)

> หมายเหตุ: ไม่แสดง group summary section แยกต่างหาก เพราะข้อมูล Group Key, multi-select และ option count แสดงใน panel title/subtitle และในตารางอยู่แล้ว การตัดสินใจนี้อนุมัติแล้วใน BO-17-v0.7

Filter:

- มี search field เดียว
- Placeholder: `Search option in <group>`
- ค้นหาได้จาก key, label_en, label_th
- มี status filter: `ทั้งหมด`, `Active`, `Inactive`

ตาราง Option list:

| Column | ข้อกำหนด |
| --- | --- |
| Option ID | option identifier เช่น `OPT-012` |
| Option Key | option key เช่น `new_unworn`, `stainless_steel` |
| Label (EN) | label ภาษาอังกฤษ |
| Label (TH) | label ภาษาไทย |
| Sort Order | ค่า sort_order |
| System | แสดง `System` หรือ `Custom` ตาม `is_system` |
| Status | `Active` หรือ `Inactive` แสดงเป็น badge |
| Updated | วันที่/เวลาที่ option ถูกอัปเดตล่าสุด |
| Action | action menu: `ดูรายละเอียด`, `Edit`, `Deactivate`/`Reactivate` (ตามสถานะ), `ลบ` (Delete — เฉพาะ option ที่ไม่มี asset ใช้), `ดู Audit Log` ตามสิทธิ์ — รายละเอียด section 11.1 |

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
| Option Key | Required | ต้องไม่ซ้ำใน group เดียวกัน; เป็น lowercase snake_case; ห้าม whitespace; ไม่เกินความยาวที่ระบบกำหนด |
| Label (EN) | Required | trim whitespace; ห้ามว่าง; ไม่เกินความยาวที่ระบบกำหนด |
| Label (TH) | Required | trim whitespace; ห้ามว่าง; ไม่เกินความยาวที่ระบบกำหนด |
| Description (EN) | Optional | trim whitespace; ไม่เกินความยาวที่ระบบกำหนด |
| Sort Order | Required | ตัวเลขจำนวนเต็ม; default เป็นค่าถัดไปจาก sort_order สูงสุดใน group |
| Is Active | Required | default `true` |

กฎ:

- Option Key ต้อง unique ภายใน group ถ้าซ้ำต้องแสดง error ใกล้ field
- หลัง save สำเร็จ option ใหม่ต้องปรากฏในตาราง Option list ตาม sort_order
- ต้องมี confirmation modal ก่อน save จริง เพื่อสรุปค่าที่จะบันทึก
- บันทึก audit `OPTION_ADD`

## 9. Edit Option

เปิดจากปุ่ม `Edit` ใน Option Detail

ใช้ modal ตาม prototype pattern

ฟอร์ม Edit Option:

| Field | Editable | Validation |
| --- | --- | --- |
| Option Key | Not editable หลังสร้าง | แสดงเป็น read-only พร้อม note ว่า Option Key ล็อกหลังสร้างเพราะเป็น stable identifier ที่ FO/seed/migration อ้างอิง |
| Label (EN) | Editable | trim whitespace; ห้ามว่าง; ไม่เกินความยาวที่ระบบกำหนด |
| Label (TH) | Editable | trim whitespace; ห้ามว่าง; ไม่เกินความยาวที่ระบบกำหนด |
| Description (EN) | Editable | trim whitespace; ไม่เกินความยาวที่ระบบกำหนด |
| Sort Order | Editable | ตัวเลขจำนวนเต็ม; สำหรับการปรับลำดับรายตัว — การ reorder แบบกลุ่มใช้ Reorder Modal ตาม section 12.1 |
| Is Active | Editable | toggle ระหว่าง Active/Inactive |

กฎ:

- Option Key แก้ไม่ได้หลังสร้าง เพราะเป็น stable identifier ที่ FO/seed/migration อ้างอิงตั้งแต่ option active ไม่ใช่รอจนมี asset ใช้
- ถ้า admin พิมพ์ผิดตอนสร้าง ให้ deactivate option นั้น + add option ใหม่ (deactivate ได้ตามปกติตาม section 10)
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

ส่วนนี้กำหนด policy การ deactivate system option (`is_system=true`) และ custom option (`is_system=false`) ทุกกลุ่ม

เหตุผลของ policy: system option เป็น baseline option ที่ seed มาจาก seed file และเป็น source of truth ของ dropdown/filter ใน FO การ deactivate อาจทำให้ FO form สูญเสียตัวเลือก จึงต้องควบคุมด้วย reason + safeguard ทุกกลุ่ม

#### System Option Group Classification

| กลุ่ม | ระดับควบคุม | เหตุผล |
| --- | --- | --- |
| `condition` | **Controlled** — อนุญาตพร้อม reason + safeguard | Required field เมื่อ asset status = `Sale` ใน FO Add/Edit Asset (ตาม section 22.2); safeguard ≥1 active option ป้องกัน dropdown ว่าง |
| `delivery` | **Controlled** — อนุญาตพร้อม reason + safeguard | Optional multi-select; การ deactivate ไม่บล็อก FO form แต่ลดทอนตัวเลือกของ Owner |
| `case_material` | **Controlled** — อนุญาตพร้อม reason + safeguard | Optional spec field; การ deactivate ไม่บล็อก FO form |
| `movement` | **Controlled** — อนุญาตพร้อม reason + safeguard | Optional spec field; การ deactivate ไม่บล็อก FO form |
| `dial_color` | **Controlled** — อนุญาตพร้อม reason + safeguard | Optional spec field; การ deactivate ไม่บล็อก FO form |
| `strap_bracelet_type` | **Controlled** — อนุญาตพร้อม reason + safeguard | Optional spec field; การ deactivate ไม่บล็อก FO form |

#### Rules For Controlled Groups (System Option, All Groups)

- อนุญาตให้ deactivate system option ได้ทุกกลุ่ม พร้อม reason (required) และ confirmation modal ตาม section 10
- **Safeguard: ห้าม deactivate ถ้าจะทำให้เหลือ active option น้อยกว่า 1 ในกลุ่ม** — เพื่อป้องกัน dropdown/filter ว่างใน FO form
  - Error message: `ไม่สามารถ deactivate ได้ เนื่องจากต้องมีอย่างน้อย 1 active option เหลือในกลุ่ม <group>`
  - Service layer ต้อง enforce safeguard นี้ด้วย ไม่พึ่งเฉพาะ UI
- หลัง deactivate สถานะ option เปลี่ยนเป็น `Inactive` และบันทึก audit `OPTION_DEACTIVATE` พร้อม reason ตามปกติ

#### Rules For Custom Option (`is_system=false`) All Groups

- Admin สามารถ deactivate custom option ได้ทุกกลุ่ม รวมถึงกลุ่ม `condition` พร้อม reason + confirmation
- มี safeguard เดียวกัน: ห้าม deactivate ถ้าจะทำให้เหลือ active option น้อยกว่า 1 ในกลุ่ม
- บันทึก audit `OPTION_DEACTIVATE` พร้อม reason

#### Policy Summary Table

| ประเภท option | กลุ่ม | Deactivate ผ่าน BO UI | เงื่อนไข |
| --- | --- | --- | --- |
| System (`is_system=true`) | ทุกกลุ่ม (`condition`, `delivery`, `case_material`, `movement`, `dial_color`, `strap_bracelet_type`) | ✅ ได้ | Reason + confirmation + safeguard (≥1 active option เหลือในกลุ่ม) |
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

### 11.1 Delete Option

เปิดจากปุ่ม `ลบ` (Delete) ใน action menu ของ Option Detail (เฉพาะ admin ที่มี write permission; แสดงเฉพาะ option ที่ไม่มี asset ใช้ — `used_in_assets=false`)

ใช้ confirmation modal ตาม prototype pattern (`openOptionDeleteConfirmModal` ใน `bo-prototype.html`)

เงื่อนไขก่อนเปิด modal:

- ปุ่ม `ลบ` แสดงเฉพาะ option ที่ `used_in_assets=false` เท่านั้น ถ้า option ถูกใช้ใน asset แล้ว ปุ่มจะถูกซ่อน (เป็น destructive action ที่ห้ามกระทบ existing assets)
- ปุ่ม `ลบ` แสดงทั้ง option active และ inactive ตรงตาม prototype
- Service layer ต้อง re-check `used_in_assets` อีกครั้งก่อน execute delete ไม่พึ่งเฉพาะการซ่อนปุ่มใน UI

Confirmation modal ต้องแสดง:

- หัวข้อ: `Delete Option`
- ชื่อ option ที่จะ delete (Option ID + Option Key + group ที่อยู่)
- คำเตือน: `การกระทำนี้ไม่สามารถย้อนกลับได้` — Option นี้จะถูกลบออกจากระบบอย่างถาวร หากต้องการเพิ่มกลับมา ต้องสร้างใหม่อีกครั้ง
- Option summary: Option ID, Option Key, Label (EN), Label (TH), Status (Active/Inactive)
- Type-to-confirm: ต้องพิมพ์ Option Key ซ้ำเพื่อยืนยัน — ข้อความ: `พิมพ์ <option_key> เพื่อยืนยันการลบ`
- ปุ่ม `ยกเลิก` และ `ลบ Option` (disabled จนกว่าจะพิมพ์ Option Key ถูกต้อง)

กฎ:

- **Safeguard: ห้าม delete option ถ้ามี asset ใดใช้ option นั้นอยู่** (`used_in_assets=true`)
  - Error message: `ไม่สามารถ delete option ได้ เนื่องจากยังมี asset ใช้ option นี้อยู่` — ใช้ deactivate แทนเพื่อคง history
  - Service layer ต้อง enforce safeguard นี้ด้วย ไม่พึ่งเฉพาะ UI
- **Destructive — ไม่สามารถย้อนกลับได้** — ลบ record ใน `spec_options` อย่างถาวร (hard delete); ไม่มี undo
- บันทึก audit `OPTION_DELETE` ก่อนทำ hard delete (เก็บ snapshot ของ option ที่จะถูกลบใน `before_value`) เพื่อคง trail ว่าเคยมี option นี้อยู่
- หลัง delete: option หายไปจากตาราง Option list และไม่ปรากฏใน FO form/filter/Watch Alert อีก (เพราะไม่มี asset ใช้อยู่แล้วจึงไม่มี existing reference ที่จะได้รับผลกระทบ)
- กรณีพิมพ์ผิดตอนสร้าง option: ใช้ Delete (ถ้ายังไม่มี asset ใช้) หรือ deactivate + add option ใหม่ (ถ้ามี asset ใช้แล้ว) ตาม BO-OPT-009
- การ delete option ไม่กระทบ seed file — seed file เป็น source of truth ของ system option การ delete ผ่าน BO UI เป็น database-level delete เท่านั้น ถ้า seed file ยังมี option นั้นอยู่ migration ครั้งถัดไปจะ insert กลับเป็น system option ใหม่ (ดู section 17.7) — Admin ควร deactivate ใน seed file ด้วยถ้าต้องการให้ option นั้นไม่กลับมา

#### 11.1.1 Safeguard Rules For Delete Option

| Action | Safeguard | Error |
| --- | --- | --- |
| Delete option | ไม่มี asset ใช้ option นั้นอยู่ (`used_in_assets=false`) | `OPTION_DELETE_BLOCKED_BY_ASSET_USAGE` |

กฎการตรวจสอบ asset usage:

- ตรวจว่ามี `watch_assets` ใดที่ `condition_id`/`case_material_id`/`movement_id`/`dial_color_id`/`strap_bracelet_type_id` อ้างถึง option นั้น หรือ `asset_delivery_items.option_id` อ้างถึง option ใน group `delivery`
- ตรวจที่ service layer ทุกครั้งก่อน execute delete ไม่พึ่งเฉพาะการซ่อนปุ่มใน UI
- ถ้ามี asset ใช้ ต้อง reject พร้อม error code ข้างต้น

## 12. Reorder Option

Reorder ทำได้ 2 วิธี:

1. **Reorder Modal (หลัก)** — เปิดจากปุ่ม `Reorder` ใน Option Detail ใช้ drag-and-drop บน desktop และ up/down arrow buttons บน touch device
2. **Edit Option Modal (รอง)** — แก้ sort_order ของ option เดียวผ่าน Edit Option modal ตาม section 9

### 12.1 Reorder Modal (Drag-and-drop)

เปิดจากปุ่ม `Reorder` ใน Option Detail (แสดงเฉพาะ admin ที่มี write permission)

ใช้ modal ตาม prototype pattern ของ Category Display Order ใน `bo-prototype.html` (Content Management) เพื่อรักษาความสอดคล้องของ BO prototype

โครงสร้าง Reorder Modal:

- Header: `จัดเรียง Option ใน <group>` พร้อมคำอธิบาย `ลากเพื่อปรับลำดับการแสดงผลใน FO form/filter`
- List ของ active option ใน group เรียงตาม sort_order ปัจจุบัน
- แต่ละ row แสดง: drag handle, option key + label, index (#1, #2, ...)
- Desktop: ใช้ HTML5 drag-and-drop (เหมือน Category Order pattern)
- Touch device: แสดง up/down arrow buttons ที่แต่ละ row เป็น fallback เพราะ HTML5 drag-and-drop ไม่รองรับ touch
- ปุ่ม `Cancel` และ `บันทึกลำดับ`

กฎการทำงาน:

- แสดงเฉพาะ active option เท่านั้น (inactive option ไม่เข้าร่วม reorder)
- ลำดับใหม่มีผลต่อ FO form/filter ทันทีเมื่อ FO อ่าน option master ล่าสุด
- หลัง save ระบบคำนวณ sort_order ใหม่แบบ sequential (10, 20, 30, ...) ตามลำดับใน modal
- บันทึก audit `OPTION_REORDER` ครั้งเดียวต่อการ save พร้อม before/after sort_order ของทุก option ที่เปลี่ยนลำดับ
- ถ้า admin ไม่ได้เปลี่ยนลำดับเลยและกด save ไม่ต้องบันทึก audit

### 12.2 Edit Option Modal (Secondary)

- Admin สามารถแก้ sort_order ของ option เดียวผ่าน Edit Option modal ตาม section 9
- เหมาะสำหรับการปรับลำดับแบบ precise หรือกรณีแก้ option เดียวพร้อม label
- บันทึก audit `OPTION_EDIT` (ไม่ใช่ `OPTION_REORDER` เพราะเป็นการแก้ field เดียวใน Edit modal)

### 12.3 General Rules

- sort_order เป็นตัวเลขจำนวนเต็มที่กำหนดลำดับการแสดงผลใน FO form/filter
- ค่าน้อยกว่าแสดงก่อน
- ถ้าสอง option มี sort_order เท่ากัน ระบบต้อง tie-break ด้วย key ตามตัวอักษร
- FO ต้องอ่าน sort_order ล่าสุดเมื่อ render form/filter
- การ reorder ไม่กระทบ existing assets เพราะ asset เก็บ relation id ไม่ใช่ sort_order

## 13. Action Rules Summary

| Action | Pre-condition | Confirmation | Reason | Audit | FO Impact |
| --- | --- | --- | --- | --- | --- |
| Add option | Option Key ไม่ซ้ำใน group | Yes | No | `OPTION_ADD` | แสดงใน FO form/filter ใหม่ |
| Edit label/description | Option มีอยู่ | Yes | No | `OPTION_EDIT` | แสดง label ใหม่ใน FO form/filter; existing assets ยังเก็บ snapshot เดิม |
| Reorder (drag-and-drop) | มี active option ≥2 ในกลุ่ม | Yes (save ใน Reorder Modal) | No | `OPTION_REORDER` | ลำดับ FO form/filter เปลี่ยน |
| Edit sort_order (via Edit Option) | Option มีอยู่ | Yes | No | `OPTION_EDIT` | ลำดับ FO form/filter เปลี่ยน |
| Deactivate option | Option active; ผ่าน System Option Deactivate Policy (section 10.1) — ต้องมี ≥1 active option เหลือในกลุ่ม | Yes | Yes | `OPTION_DEACTIVATE` | ไม่แสดงใน FO form/filter/Watch Alert ใหม่; existing assets ยังแสดงค่าเดิม |
| Reactivate option | Option inactive | Yes | No | `OPTION_REACTIVATE` | กลับมาแสดงใน FO form/filter/Watch Alert |
| Delete option | **ไม่มี asset ใช้ option นั้น** (`used_in_assets=false`) (safeguard) | **Yes (type-to-confirm ด้วย Option Key)** | No | `OPTION_DELETE` | **Destructive — ลบ option อย่างถาวร**; ไม่มี existing asset ที่ได้รับผลกระทบเพราะเงื่อนไขบังคับให้ไม่มี asset ใช้; บันทึก audit ก่อน hard delete |
| **Edit group** | Group มีอยู่; write permission | Yes | No | `GROUP_EDIT` | แสดง label ใหม่ใน FO form/filter; existing assets ยังเก็บ snapshot เดิม; ถ้าเปลี่ยน `allows_multi_select` FO form ใหม่ใช้โหมดใหม่ |
| **Deactivate group** | Group active; **ไม่มี asset ใช้ option ใน group นั้น** (safeguard) | Yes | Yes | `GROUP_DEACTIVATE` | group และ option ทั้งหมดใน group ไม่แสดงใน FO form/filter/Watch Alert ใหม่; existing assets ยังแสดงค่าเดิม |
| **Reactivate group** | Group inactive | Yes | No | `GROUP_REACTIVATE` | group และ option ที่ยัง active กลับมาแสดงใน FO form/filter/Watch Alert; option ที่ inactive ยังคง inactive |
| **Delete group** | (1) Group inactive + (2) **ไม่มี asset ใช้ option ใน group นั้น** (safeguard) | **Yes (2 ครั้ง — type-to-confirm)** | No | `GROUP_DELETE` | **Destructive — ไม่สามารถย้อนกลับได้**; ลบ group และ option ทั้งหมดใน group อย่างถาวร |
| **Add group** | Write permission; Group Key unique | Yes | No | `GROUP_CREATE` | group ใหม่ปรากฏใน FO form/filter/Watch Alert ทันทีเมื่อ active; สร้างเป็น group ว่าง (ไม่มี option) |
| **Reorder groups** | มี active group ≥2 | Yes (save ใน Reorder Groups Modal) | No | `GROUP_REORDER` | ลำดับ FO form/filter เปลี่ยน; บันทึก audit เฉพาะเมื่อลำดับเปลี่ยนจริง |
| **View group audit log** | Module access | No (read-only) | No | — | ไม่มีผลต่อ FO |

## 14. System Impact

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
| **Group-level Deactivate** | เมื่อ group ถูก deactivate ทั้ง group และ option ทั้งหมดใน group ไม่แสดงใน FO form/filter/Watch Alert ใหม่ (FO กรองด้วย group `is_active=true`); existing assets ยังแสดงค่าเดิมเพราะ lookup ไม่กรอง `is_active` |
| **Group-level Delete** | Destructive — ลบ group และ option ทั้งหมดใน group อย่างถาวร; อนุญาตเฉพาะเมื่อ group Inactive และไม่มี asset ใช้ option ใน group นั้น; บันทึก audit `GROUP_DELETE` ก่อน hard delete |
| **Option-level Delete** | Destructive — ลบ option อย่างถาวร; อนุญาตเฉพาะเมื่อไม่มี asset ใช้ option นั้น (`used_in_assets=false`); บันทึก audit `OPTION_DELETE` ก่อน hard delete; ไม่กระทบ FO form/filter/Watch Alert ใหม่เพราะ option ที่ถูก delete ไม่มี asset ใช้อยู่แล้ว; seed file ไม่ถูกลบ — migration ครั้งถัดไปอาจ insert กลับถ้า seed file ยังมี option นั้น |
| **Group-level Create** | group ใหม่ปรากฏใน FO form/filter/Watch Alert ทันทีเมื่อ active; สร้างเป็น group ว่าง (ไม่มี option) Admin ต้องเพิ่ม option ภายหลังก่อนใช้งานจริงใน FO |
| **Group-level Reorder** | ลำดับ group ใน BO list และ FO form/filter เปลี่ยนตาม sort_order ใหม่; ไม่กระทบ existing assets เพราะ asset เก็บ relation id ไม่ใช่ sort_order |

กฎการ sync:

- การเปลี่ยนแปลง option master ควรสะท้อนผลใกล้เคียงทันทีที่สุดเท่าที่ทำได้
- Cached FO form/filter option ต้อง validate active status ก่อนแสดงหรือเมื่อ refresh
- รายละเอียด cache invalidation/API timing ให้สรุปอีกครั้งตอนออกแบบ backend

## 15. Module Integration

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
| `OPTION_EDIT` | แก้ label, description, is_active ผ่าน Edit modal | Before/After: field ที่เปลี่ยน |
| `OPTION_DEACTIVATE` | Deactivate option | Before: active; After: inactive + reason |
| `OPTION_REACTIVATE` | Reactivate option | Before: inactive; After: active |
| `OPTION_DELETE` | Delete option อย่างถาวร (destructive) | Before: option ทั้งหมด (snapshot); After: (deleted) |
| `OPTION_REORDER` | เปลี่ยน sort_order ผ่าน Reorder Modal (drag-and-drop หรือ up/down) | Before/After: sort_order เดิม/ใหม่ ของทุก option ที่เปลี่ยนลำดับในการ save ครั้งนั้น |
| `GROUP_EDIT` | แก้ `display_name_th`, `display_name_en`, `description`, `allows_multi_select` ของ group ผ่าน Edit Group modal | Before/After: field ที่เปลี่ยน |
| `GROUP_DEACTIVATE` | Deactivate group (ทั้ง group) | Before: active; After: inactive + reason |
| `GROUP_REACTIVATE` | Reactivate group (ทั้ง group) | Before: inactive; After: active |
| `GROUP_DELETE` | Delete group อย่างถาวร (destructive) | Before: group + option ทั้งหมดใน group; After: (deleted) |
| `GROUP_CREATE` | สร้าง group ใหม่ | After: group ใหม่ทั้งหมด (group_id, Group Key, label, description, multi-select, status) |
| `GROUP_REORDER` | เปลี่ยน sort_order ของ group ผ่าน Reorder Groups Modal (drag-and-drop หรือ up/down) | Before/After: sort_order เดิม/ใหม่ ของทุก group ที่เปลี่ยนลำดับในการ save ครั้งนั้น; บันทึกเฉพาะเมื่อลำดับเปลี่ยนจริง |
| `OPTION_SUGGESTION_PROMOTE` | Promote suggestion เป็น option จริงผ่าน Suggestion queue | After: option ใหม่ทั้งหมด + suggestion status (`promoted`) + backfill summary (จำนวน asset ที่ผูก relation id) |
| `OPTION_SUGGESTION_MAP_ALIAS` | Map suggestion เป็น alias ของ option เดิม | Before/After: alias list ของ option เป้าหมาย + suggestion status (`mapped`) + backfill summary (จำนวน asset ที่ผูก relation id) |
| `OPTION_SUGGESTION_IGNORE` | Ignore suggestion ใน queue | Before: `pending`; After: `ignored` + resolution note |

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
- Option delete (destructive)
- Option reorder
- Group create
- Group edit (display_name/description/allows_multi_select)
- Group reorder
- Group deactivate
- Group reactivate
- Group delete (destructive)
- Suggestion promote (สร้าง option จริงจาก suggestion + backfill)
- Suggestion map alias (ผูก suggestion เป็น alias ของ option เดิม + backfill)
- Suggestion ignore (ปิด suggestion โดยไม่สร้าง option)

หมายเหตุ policy สำหรับ group-level actions: การพยายาม deactivate/delete group ที่มี asset ใช้ option อยู่ จะถูก service layer reject โดยไม่บันทึก `GROUP_DEACTIVATE`/`GROUP_DELETE` audit เพราะ action ไม่สำเร็จ — ควรบันทึกเป็น security event ใน audit log กลางแทน ถ้ามีความพยายาม bypass safeguard ผ่าน API

Target entity type เพิ่ม: `SpecOption` และ `SpecOptionGroup` ใน `08_AUDIT_LOG_MODULE.md` section 5

## 17. Data Model And Seed Data Strategy

ส่วนนี้กำหนด data model เชิงกายภาพ ความสัมพันธ์กับตารางอื่น และกลยุทธ์ seed/migration/versioning ของ Option Master

อ้างอิง:
- `../FrontOffice/04_ASSET_MANAGEMENT_MODULE.md` section 10 (Recommended backend split)
- `../SeedData/asset-spec-options.json` (schema version `asset-spec-options-v1`)
- `../SeedData/asset-spec-options.csv`
- `../SeedData/README.md`

### 17.1 Table `spec_option_groups`

เก็บข้อมูลกลุ่ม option ทั้งหมด ใน Phase 1 group เกิดจาก seed/development หรือจากการ Add Group ผ่าน BO UI Admin สามารถ add/edit/deactivate/reactivate/delete/reorder group ได้ตาม section 6.1

```sql
CREATE TABLE spec_option_groups (
  group_id BIGSERIAL PRIMARY KEY,
  group TEXT NOT NULL UNIQUE,
  display_name_en TEXT NOT NULL,
  display_name_th TEXT NOT NULL,
  description TEXT NULL,
  allows_multi_select BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

| Column | Type | Rule |
| --- | --- | --- |
| `group_id` | BIGSERIAL | PK |
| `group` | TEXT | Unique stable identifier เช่น `condition`, `delivery`; ห้าม rename หลังใช้งาน; ต้องเป็น lowercase snake_case; unique ทั้งระบบ |
| `display_name_en` | TEXT | ชื่อกลุ่มภาษาอังกฤษ; unique ทั้งระบบ; ต้องเป็น ASCII เท่านั้น |
| `display_name_th` | TEXT | ชื่อกลุ่มภาษาไทย; unique ทั้งระบบ |
| `description` | TEXT | คำอธิบายกลุ่ม (optional) |
| `allows_multi_select` | BOOLEAN | `true` สำหรับ `delivery`; `false` สำหรับกลุ่มอื่น; เปลี่ยนแปลงได้ผ่าน Edit Group |
| `is_active` | BOOLEAN | default `true`; **ใช้งานได้ใน Phase 1** — รองรับ group-level Deactivate/Reactivate ตาม section 6.1; seed group เริ่มต้นเป็น `true` ทั้งหมด แต่ Admin สามารถ deactivate ได้ผ่าน BO UI เมื่อไม่มี asset ใช้ option ใน group นั้น |
| `sort_order` | INTEGER | ลำดับการแสดงผลของ group ใน BO list และ FO form/filter; ค่าน้อยกว่าแสดงก่อน; default 10; ปรับผ่าน Reorder Groups Modal (section 6.1.7) แบบ sequential (10, 20, 30, ...); tie-break ด้วย `group_id` |
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

### 17.2 Table `spec_options`

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
| `option_key` | TEXT | Stable identifier ห้าม rename หลังสร้าง; lowercase snake_case; unique ภายใน group |
| `label_en` | TEXT | English label แก้ไขได้ |
| `label_th` | TEXT | Thai label แก้ไขได้ |
| `description_en` | TEXT | Internal description (optional) |
| `sort_order` | INTEGER | ลำดับการแสดงผลใน FO; ค่าน้อยกว่าแสดงก่อน; tie-break ด้วย `option_key` |
| `is_active` | BOOLEAN | `false` = ไม่แสดงใน FO form/filter/Watch Alert ใหม่ แต่คง relation กับ existing assets |
| `is_system` | BOOLEAN | `true` = seeded baseline option; การ deactivate อยู่ภายใต้ System Option Deactivate Policy ตาม section 10.1 — อนุญาตพร้อม reason + safeguard ทุกกลุ่ม |
| `created_at` | TIMESTAMPTZ | auto |
| `updated_at` | TIMESTAMPTZ | auto |
| `deactivated_at` | TIMESTAMPTZ | เวลาที่ deactivate; `NULL` ถ้า active |
| `created_by_admin_id` | BIGINT | Admin ที่สร้าง option (NULL สำหรับ system seed) |
| `updated_by_admin_id` | BIGINT | Admin ที่แก้ไขล่าสุด |

Unique constraint: `UNIQUE (group_id, option_key)` ป้องกัน key ซ้ำใน group เดียวกัน

### 17.3 Table `spec_option_audit`

เก็บ audit trail เฉพาะ Option Master แยกจาก audit log กลาง เพื่อให้ query ประวัติการเปลี่ยนแปลง option ได้โดยตรง ข้อมูลเดียวกันต้อง sync ไป audit log กลาง (`08_AUDIT_LOG_MODULE.md`) ด้วย

```sql
CREATE TABLE spec_option_audit (
  id BIGSERIAL PRIMARY KEY,
  action_type TEXT NOT NULL,
  option_id BIGINT NULL REFERENCES spec_options(id),
  group_id BIGINT NOT NULL REFERENCES spec_option_groups(group_id),
  suggestion_id BIGINT NULL REFERENCES spec_option_suggestions(id),
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
| `action_type` | TEXT | enum: `OPTION_ADD`, `OPTION_EDIT`, `OPTION_DEACTIVATE`, `OPTION_REACTIVATE`, `OPTION_DELETE`, `OPTION_REORDER`, `GROUP_CREATE`, `GROUP_EDIT`, `GROUP_DEACTIVATE`, `GROUP_REACTIVATE`, `GROUP_DELETE`, `GROUP_REORDER`, `OPTION_SUGGESTION_PROMOTE`, `OPTION_SUGGESTION_MAP_ALIAS`, `OPTION_SUGGESTION_IGNORE` |
| `option_id` | BIGINT | FK → `spec_options.id`; **nullable** — `NULL` สำหรับ group-level actions (`GROUP_CREATE`, `GROUP_EDIT`, `GROUP_DEACTIVATE`, `GROUP_REACTIVATE`, `GROUP_DELETE`, `GROUP_REORDER`) ที่ไม่มี option เฉพาะ |
| `group_id` | BIGINT | FK → `spec_option_groups.group_id` (denormalized สำหรับ query สะดวก); required ทุก action เพราะทุก action เกี่ยวข้องกับ group |
| `suggestion_id` | BIGINT | FK → `spec_option_suggestions.id` (section 23); **nullable** — ใส่เฉพาะ action ประเภท `OPTION_SUGGESTION_*` เพื่อ trace กลับ suggestion ต้นทาง |
| `actor_admin_id` | BIGINT | Admin ที่ทำ action |
| `before_value` | JSONB | ค่าก่อนเปลี่ยน (JSON ของ field ที่เปลี่ยน); `NULL` สำหรับ `GROUP_CREATE` (สร้างใหม่); สำหรับ `GROUP_DELETE` เก็บ snapshot ของ group + option ทั้งหมดที่จะถูกลบ; สำหรับ `OPTION_DELETE` เก็บ snapshot ของ option ที่จะถูกลบ; สำหรับ `GROUP_REORDER` เก็บ sort_order เดิมของทุก group ที่เปลี่ยนลำดับ |
| `after_value` | JSONB | ค่าหลังเปลี่ยน; `NULL` สำหรับ `GROUP_DELETE` และ `OPTION_DELETE` (deleted); สำหรับ `GROUP_CREATE` เก็บ group ใหม่ทั้งหมด; สำหรับ `GROUP_REORDER` เก็บ sort_order ใหม่ของทุก group ที่เปลี่ยนลำดับ |
| `reason` | TEXT | เหตุผล (required สำหรับ `OPTION_DEACTIVATE` และ `GROUP_DEACTIVATE`); optional สำหรับ `OPTION_DELETE`/`GROUP_DELETE` (destructive action ใช้ type-to-confirm แทน reason) |
| `ip_address` | TEXT | ถ้ามี |
| `session_context` | TEXT | ถ้ามี |
| `created_at` | TIMESTAMPTZ | auto |

Audit record ต้องไม่ถูกแก้ไขหรือลบผ่าน BO UI ตาม `08_AUDIT_LOG_MODULE.md` section 7

### 17.4 Relationship With Other Tables

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
spec_options 1───∞ spec_option_aliases
spec_option_groups 1───∞ spec_option_suggestions
spec_option_suggestions 0..1───1 spec_options (resolved_option_id)
```

ตาราง `spec_option_aliases` และ `spec_option_suggestions` รองรับ flow `ระบุเอง` free-text → suggestion pool → BO curation ดูรายละเอียดใน section 23

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

### 17.5 Indexes And Constraints

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

### 17.8 Migration Strategy

| Scenario | Seed File | Migration Script | Database | Audit |
| --- | --- | --- | --- | --- |
| เพิ่ม option ใหม่ | เพิ่มใน `groups[].options[]` | upsert ลง `spec_options` | insert ใหม่ | `OPTION_ADD` (actor = system migration) |
| แก้ label | update `label_en`/`label_th` ใน seed file | update ใน `spec_options` | update label | `OPTION_EDIT` |
| แก้ sort_order | update `sort_order` ใน seed file | update ใน `spec_options` | update sort_order | `OPTION_REORDER` |
| Deactivate option | update `is_active=false` ใน seed file | update `is_active=false`, `deactivated_at=now()` ใน `spec_options` | update | `OPTION_DEACTIVATE` (reason = "seed file update") |
| Reactivate option | update `is_active=true` ใน seed file | update `is_active=true`, `deactivated_at=null` | update | `OPTION_REACTIVATE` |
| Delete option | ห้ามลบผ่าน migration | ไม่รองรับ (migration ไม่ลบ option) | ไม่ลบโดย migration | — | (BO UI delete เป็น database-level delete เท่านั้น ตาม section 11.1; migration ไม่ลบ option แม้ seed file จะลด option เพราะอาจเป็น system option ที่ Admin เคยใช้) |

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

### 17.10 Impact On Existing Assets When Option Is Deactivated

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

- ห้าม hard delete option ที่ถูกใช้ใน asset แล้ว — ใช้ deactivate เท่านั้น; Delete option (section 11.1) อนุญาตเฉพาะ option ที่ `used_in_assets=false`
- ห้าม cascade delete หรือ set null FK ใน `watch_assets` และ `asset_delivery_items` เมื่อ deactivate
- FO/BO ต้อง lookup label จาก `spec_options` โดยไม่กรอง `is_active` เมื่อแสดงข้อมูล asset เดิม
- FO form/filter/Watch Alert ใหม่ ต้องกรอง `is_active=true` เท่านั้น

## 18. Empty, Loading, Error States

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

## 19. Copy And Visual Rules

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
- [ ] Action Rules ครอบคลุม Add, Edit, Deactivate, Reactivate, Delete, Reorder
- [ ] Impact ต่อ FO และ existing assets ระบุชัด
- [ ] Audit requirements ครบทุก action type
- [ ] Acceptance Criteria ทดสอบได้
- [ ] Confirmation modal ระบุผลกระทบต่อ FO ชัดเจน
- [ ] Key lock rule หลังสร้าง ระบุชัด (key ล็อกตั้งแต่สร้าง ไม่ใช่หลังถูกใช้ใน asset)
- [ ] System option policy ระบุชัด
- [ ] System Option Deactivate Policy (section 10.1) ระบุชัด: อนุญาตพร้อม reason + safeguard ทุกกลุ่ม (≥1 active option เหลือในกลุ่ม)
- [ ] Reorder UX ระบุชัด: Reorder Modal (drag-and-drop + up/down fallback) เป็นวิธีหลัก, Edit Option modal เป็นวิธีรอง
- [ ] Reorder Modal ใช้ pattern เดียวกับ Category Display Order ใน prototype
- [ ] Touch device มี up/down arrow buttons เป็น fallback สำหรับ drag-and-drop
- [ ] Integration กับ module อื่น ระบุชัด
- [ ] Empty/Loading/Error states ครบ
- [ ] Responsive layout ตาม `00_GLOBAL_RULES_MODULE.md`
- [ ] ตาราง `spec_option_groups`, `spec_options` และ `spec_option_audit` มี field ครบ
- [ ] ความสัมพันธ์กับ `watch_assets` และ `asset_delivery_items` ระบุชัด พร้อม nullable rule
- [ ] Audit table มี action_type ครบ 15 ตัว (6 option-level: ADD/EDIT/DEACTIVATE/REACTIVATE/DELETE/REORDER + 6 group-level: CREATE/EDIT/DEACTIVATE/REACTIVATE/DELETE/REORDER + 3 suggestion-level: OPTION_SUGGESTION_PROMOTE/MAP_ALIAS/IGNORE)
- [ ] **Delete option (section 11.1) ระบุชัด: destructive, type-to-confirm ด้วย Option Key, safeguard ห้าม delete ถ้ามี asset ใช้ (`used_in_assets=false`), audit `OPTION_DELETE` ก่อน hard delete, ไม่สามารถย้อนกลับได้**
- [ ] **Audit action ใหม่ `OPTION_DELETE` ระบุใน section 13, 16, 17.3**
- [ ] Seed file schema ตรงกับ data model
- [ ] Migration strategy ครอบคลุม add/edit/deactivate/reactivate
- [ ] Versioning strategy ชัดเจน (bump version ทุก migration)
- [ ] Impact ต่อ existing assets เมื่อ deactivate ระบุชัด (คง relation, คง snapshot, ห้าม cascade delete)
- [ ] Sync strategy ระหว่าง seed file และ database ชัดเจน (system vs custom option)
- [ ] **Group-level actions (section 6.1) ระบุชัด: Edit, Deactivate, Reactivate, Delete group พร้อมเงื่อนไข การ confirm และ audit**
- [ ] **Edit group แก้ได้เฉพาะ `display_name_th`, `display_name_en`, `description`, `allows_multi_select`; ห้ามแก้ `group` identifier (Group Key) และ `group_id`**
- [ ] **Deactivate group มี safeguard: ห้าม deactivate ถ้ามี asset ใช้ option ใน group นั้น; service layer enforce safeguard**
- [ ] **Delete group เป็น destructive action: ต้อง confirm 2 ครั้ง (type-to-confirm); เงื่อนไข group Inactive + ไม่มี asset ใช้; ไม่สามารถย้อนกลับได้**
- [ ] **Option Group List มี Status column (Active/Inactive badge) และ status filter (ทั้งหมด/Active/Inactive)**
- [ ] **Option Group List มี action menu: View, Edit, Deactivate/Reactivate (ตามสถานะ), Delete (เฉพาะ Inactive + ไม่มี asset ใช้)**
- [ ] **Audit actions ใหม่ 4 ตัว: `GROUP_EDIT`, `GROUP_DEACTIVATE`, `GROUP_REACTIVATE`, `GROUP_DELETE` ระบุใน section 16**
- [ ] **`spec_option_audit.option_id` เป็น nullable เพื่อรองรับ group-level actions ที่ไม่มี option เฉพาะ**
- [ ] **`is_active` ของ group ใช้งานได้ใน Phase 1 (ไม่ใช่ default true เท่านั้น) — รองรับ group-level Deactivate/Reactivate**
- [ ] **Add Group (section 6.1.6) ระบุชัด: ฟอร์ม fields, validation (Group Key lowercase snake_case unique ≤64, label EN/TH unique ≤128, description ≤512), confirmation modal, audit `GROUP_CREATE`**
- [ ] **Add Group สร้าง group ว่าง (ไม่มี option) และ group ใหม่ปรากฏใน FO form/filter ทันทีเมื่อ active**
- [ ] **Reorder Groups (section 6.1.7) ระบุชัด: drag-and-drop + up/down fallback, เฉพาะ active groups ≥2, sort_order sequential (10, 20, 30, ...), audit `GROUP_REORDER` ครั้งเดียวต่อ save เมื่อลำดับเปลี่ยน**
- [ ] **Group Audit Log view (section 6.1.8) ระบุชัด: action types 6 ตัว (GROUP_CREATE/EDIT/DEACTIVATE/REACTIVATE/DELETE/REORDER), fields ที่แสดง (action, timestamp, actor, reason, before/after diff), read-only**
- [ ] **Option Group List มีปุ่ม `เพิ่ม Group` และ `จัดเรียง` (Reorder Groups) ใน page actions; ปุ่ม `จัดเรียง` แสดงเฉพาะ active group ≥2**
- [ ] **Option Group List action menu มี `ดู Audit Log` สำหรับเปิด Group Audit Log view**
- [ ] **`spec_option_groups` มี field `sort_order` สำหรับรองรับ Reorder Groups**
- [ ] **Audit actions ใหม่ 2 ตัว: `GROUP_CREATE`, `GROUP_REORDER` ระบุใน section 13 และ section 16**

## 21. Open Decisions

| ID | Decision Needed | Current Recommendation |
| --- | --- | --- |
| BO-OPT-001 ✅ | Option Master phase | **ยืนยัน Phase 1** — เป็น foundational operational data ที่ FO ต้องใช้ตั้งแต่ launch (Add/Edit Asset, Search Filter, Watch Alert); มี seed data พร้อม 6 groups; scope จำกัดเหมาะ Phase 1 (ไม่มี bulk import/export, ไม่สร้าง group ใหม่, ไม่เชื่อม provider sync); baseline/index ระบุ Phase 1 อยู่แล้วและสอดคล้องกับผลตัดสินใจ |
| BO-OPT-002 ✅ | Prototype screen | **Prototype สร้างและยืนยันแล้ว** — prototype Option Master ครบทุก screen/modal รวม Add Group, Edit Group, Deactivate/Reactivate/Delete Group, Reorder Groups และ Group Audit Log view; responsive 3 breakpoints ผ่าน QA; ไม่กระทบ protected screens; เอกสาร spec อัปเดตให้ตรง prototype แล้ว |
| BO-OPT-003 ✅ | System option deactivate policy | **ตัดสินใจ: Controlled Deactivation** — system option (`is_system=true`) ทุกกลุ่ม (รวม `condition`) อนุญาตพร้อม reason + safeguard (≥1 active option เหลือในกลุ่ม); custom option ทุกกลุ่ม deactivate ได้ปกติพร้อม reason + safeguard; รายละเอียดใน section 10.1 |
| BO-OPT-004 ✅ | Reorder UI | **ตัดสินใจ: Drag-and-drop in Reorder Modal + Up/Down Fallback** — ใช้ Reorder Modal เป็นวิธีหลัก (drag-and-drop บน desktop + up/down arrow buttons บน touch device) ตาม pattern ของ Category Display Order ใน prototype เพื่อความสอดคล้อง; Edit Option modal ยังคงเป็นวิธีรองสำหรับแก้ sort_order รายตัว; บันทึก audit `OPTION_REORDER` ครั้งเดียวต่อการ save ใน Reorder Modal; รายละเอียดใน section 12 |
| BO-OPT-005 ✅ | Group-level actions policy | **ตัดสินใจ: เพิ่ม group-level actions 4 ตัวบน Option Group List** — (1) **Edit group**: แก้ `display_name_th`/`display_name_en`/`description`/`allows_multi_select` พร้อม confirmation + audit `GROUP_EDIT`; ห้ามแก้ `group` identifier (Group Key) และ `group_id`; (2) **Deactivate group**: confirmation + reason (required) + audit `GROUP_DEACTIVATE`; safeguard ห้าม deactivate ถ้ามี asset ใช้ option ใน group นั้น; (3) **Reactivate group**: confirmation + audit `GROUP_REACTIVATE`; (4) **Delete group**: destructive — confirm 2 ครั้ง (type-to-confirm) + audit `GROUP_DELETE`; เงื่อนไข group Inactive + ไม่มี asset ใช้; ไม่สามารถย้อนกลับได้; เพิ่ม Status column + status filter + action menu ใน Option Group List; service layer enforce safeguard ทั้งสอดข้อ; รายละเอียดใน section 6.1; `is_active` ของ group ใช้งานได้ใน Phase 1 |
| BO-OPT-009 ✅ | Option key lock policy | **ตัดสินใจ: ล็อก `key` หลังสร้างเลย** — เปลี่ยน policy เดิม (ล็อกเฉพาะหลัง option ถูกใช้ใน asset) เป็นล็อกตั้งแต่สร้าง เพื่อให้สอดคล้องกับ Group Key ที่ล็อกหลังสร้างอยู่แล้ว; เหตุผล: FO อ้างอิง option key ตั้งแต่ option active ไม่ใช่รอจนมี asset ใช้ ดังนั้นช่วงที่ active แต่ยังไม่มี asset ใช้ FO cache/reference อ้างอิง key อยู่แล้ว การอนุญาตให้แก้ key ในช่วงนั้นทำให้ reference พังได้; กรณีพิมพ์ผิด: deactivate option + add option ใหม่; อัปเดต section 2, 4, 9, 13, 16, 17.3, 20 |
| BO-OPT-010 ✅ | Delete option policy | **ตัดสินใจ: รองรับ Delete option ใน Phase 1** — อัปเดต spec ให้ตรง prototype ที่มีปุ่ม `ลบ` (Delete) ใน action menu ของ Option Detail; เงื่อนไข: (1) เฉพาะ option ที่ `used_in_assets=false` (safeguard ห้าม delete ถ้ามี asset ใช้ — ใช้ deactivate แทน), (2) destructive — type-to-confirm ด้วย Option Key, (3) บันทึก audit `OPTION_DELETE` ก่อน hard delete, (4) ไม่สามารถย้อนกลับได้; เหตุผล: prototype ล็อกแล้วมี Delete option flow ครบ (ปุ่ม, modal, type-to-confirm, function) การเลือกทางเลือก 2 (อัปเดต spec ให้รองรับ) ไม่กระทบ prototype และสอดคล้องกับ pattern ของ Delete group ที่มีอยู่แล้ว; migration ไม่ลบ option (เฉพาะ BO UI delete เท่านั้น); รายละเอียดใน section 11.1 |

## 22. FO Integration Guidelines

ส่วนนี้กำหนดแนวทางการ integrate Option Master กับ Front Office อย่างละเอียด ครอบคลุม Add/Edit Asset, Search Filter, Watch Alert, caching, fallback behavior, API contract และ interaction กับ Market Data

อ้างอิง:
- `../FrontOffice/04_ASSET_MANAGEMENT_MODULE.md` section 10 (Market Data Mapping And User-entered Specification Rule), Required Field Matrix, Add / Edit Field Validation Matrix
- `../FrontOffice/03_SEARCH_FILTER_MODULE.md` Filter Fields, Filter Visibility Rule, Filter Dependency Rule
- `../FrontOffice/10_WATCH_ALERT_MODULE.md` Filter Logic Rule, Match Rule, Validation Rules
- `06_MARKET_DATA_MODULE.md` section 15 (FO Usage Rules)

### 22.1 General Principles

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
| `case_material` | Single select + `ระบุเอง` | Optional | แสดงเฉพาะ active option; เรียงตาม `sort_order`; มีตัวเลือก `ระบุเอง` free-text เมื่อค่าที่ต้องการไม่มีในตัวเลือก |
| `movement` | Single select + `ระบุเอง` | Optional | แสดงเฉพาะ active option; เรียงตาม `sort_order`; มีตัวเลือก `ระบุเอง` free-text เมื่อค่าที่ต้องการไม่มีในตัวเลือก |
| `dial_color` | Single select + `ระบุเอง` | Optional | แสดงเฉพาะ active option; เรียงตาม `sort_order`; มีตัวเลือก `ระบุเอง` free-text เมื่อค่าที่ต้องการไม่มีในตัวเลือก |
| `strap_bracelet_type` | Single select + `ระบุเอง` | Optional | แสดงเฉพาะ active option; เรียงตาม `sort_order`; มีตัวเลือก `ระบุเอง` free-text เมื่อค่าที่ต้องการไม่มีในตัวเลือก |

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

Interaction pattern ของ `ระบุเอง` ใน FO form: entry เสริม `อื่น ๆ / เพิ่ม<ชื่อ field>` พร้อมปุ่ม `+` ท้าย option list → เปิด bottom sheet ให้พิมพ์ค่า + กด Confirm (ตาม `../FrontOffice/04_ASSET_MANAGEMENT_MODULE.md` Spec Option Free-Text Rule)

กฎการบันทึกสำหรับ `ระบุเอง` (เฉพาะ 4 กลุ่ม `case_material`, `movement`, `dial_color`, `strap_bracelet_type` — `condition` และ `delivery` ไม่รองรับ `ระบุเอง` ต้องเป็น option ใน master เสมอ):

- เมื่อ Owner เลือก `ระบุเอง` และพิมพ์ค่า ระบบต้อง normalize ก่อนประมวลผล (trim, collapse whitespace, case-insensitive compare)
- ถ้าค่าที่ normalize แล้วตรงกับ option label หรือ alias ใน group เดียวกัน ต้องผูก relation id ของ option นั้นทันที ห้ามเก็บเป็น free-text ซ้ำ และไม่เขียน suggestion pool
- ถ้าไม่ตรง option/alias ใด ให้บันทึก relation id เป็น `null` + snapshot text ของค่าที่พิมพ์ และ upsert ลง `spec_option_suggestions` (`usage_count` +1 ถ้ามี `normalized_text` เดียวกันใน group อยู่แล้ว) ตาม section 23
- ค่า free-text ต้องไม่กลายเป็น option อัตโนมัติ — ต้องผ่าน Back Office curation (promote / map alias / ignore) ตาม section 23 เสมอ เพื่อคุมคุณภาพ vocabulary

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

- แสดงทุก option ที่ `is_active=true` พร้อมจำนวน Asset Sale ปัจจุบันที่ User มีสิทธิ์เห็นข้างชื่อ เช่น `New (380)`, `Fair (0)`
- ใช้ Filter Visibility Rule ของ `03_SEARCH_FILTER_MODULE.md`: แสดงทุก active option แม้จำนวน Asset Sale เป็น `0` (no current listing) เพื่อรองรับ Watch Alert use case ที่ผู้ซื้อหานาฬิกาตรงเงื่อนไขที่ต้องการ ไม่ว่าจะยังไม่มีรุ่นนั้นลงขาย หรือเคยมีลงขายแต่ไม่ตรงเงื่อนไข — entity/option ที่ `is_active=false` เท่านั้นที่ไม่แสดงเป็นตัวเลือกใหม่
- ใช้ Filter Dependency Rule: Brand → Model เป็น dependent filter; option filter ไม่ dependent กับ Brand/Model แต่ทำงานร่วมกันแบบ AND Logic ตาม Multiple Filter Rule
- รองรับ multi-select filter สำหรับ group ที่ `allows_multi_select=true` และสามารถขยายเป็น multi-select สำหรับ group อื่นถ้า implementation กำหนด
- เรียงตาม `sort_order` เช่นเดียวกับ Add/Edit Asset form
- Filter option ต้องอ่านจาก internal option master เดียวกับ Add/Edit Asset ตาม `03_SEARCH_FILTER_MODULE.md` Filter data source rule

กฎการ match:

- Search/Filter ต้องอิงค่าที่ถูก save กับ Asset จริง (relation id และ snapshot text) ไม่ใช่ option master active status
- Asset ที่มี inactive option ยังปรากฏในผลลัพธ์ถ้าตรงเงื่อนไขอื่น แต่ inactive option ไม่แสดงเป็นตัวเลือก filter ใหม่
- Option filter match ด้วย relation id เท่านั้น — Asset ที่เก็บ spec เป็น free-text (relation `null`) จะไม่ถูก option filter จับ จนกว่า Back Office promote/map alias แล้ว backfill relation id ตาม section 23
- ค่า free-text spec และค่าใน suggestion pool ที่ยังไม่ promote ต้องไม่แสดงเป็น filter option หรือ autocomplete — "ตัวเลือกครบ" หมายถึงครบเฉพาะ active option ใน master เท่านั้น (ตาม `03_SEARCH_FILTER_MODULE.md` Filter Visibility Rule แถว free-text / suggested spec value)
- ถ้า asset ใช้ free-text spec ที่ไม่มี relation id ต้องยังค้นหา keyword จาก snapshot text ได้ ตาม `03_SEARCH_FILTER_MODULE.md` Search Keyword Rule ที่ครอบ spec snapshot text

### 22.4 FO Watch Alert Criteria

วิธีดึง option ไปใช้ใน FO Watch Alert criteria:

- Watch Alert criteria ใช้ schema เดียวกับ Search Filter ตาม `11_WATCH_ALERT_MODULE.md` Filter Logic Rule และ Validation Rules
- แสดงทุก option ที่ `is_active=true` เป็น criteria ใหม่ พร้อมจำนวน Asset Sale ปัจจุบันข้างชื่อ — รวม option ที่มีจำนวน `0` (no current listing) เพื่อรองรับ use case ที่ผู้ซื้อหานาฬิกาตรงเงื่อนไขที่ต้องการ ไม่ว่าจะยังไม่มีรุ่นนั้นลงขาย หรือเคยมีลงขายแต่ไม่ตรงเงื่อนไข
- Watch Alert ใช้ filter logic เดียวกับ Search Module รวม dependent filter และ AND Logic
- Watch Alert match เฉพาะ Asset สถานะ `Sale` ตาม Match Rule; option criteria ทำงานร่วมกับเงื่อนไขอื่นใน criteria
- Watch Alert criteria ที่อ้าง option ที่มี no current listing (จำนวน = 0 ตอนสร้าง) ถือเป็น unmet demand ปกติ ไม่ใช่ inactive option — ดู `../FrontOffice/10_WATCH_ALERT_MODULE.md` No Current Listing vs Inactive Market Data Rule

กฎสำหรับ Watch Alert เดิมที่อ้างถึง option ที่ถูก deactivate ภายหลัง:

- ต้องเก็บ criteria history ได้ ไม่ลบ criteria ที่อ้างถึง inactive option
- ต้องแสดง warning ใน Watch Alert List / Edit Watch Alert ว่า criteria อ้างถึง option ที่ inactive แล้ว
- ไม่ควร trigger match ใหม่ถ้า criteria อ้าง option ที่ inactive ตาม policy ใน `06_MARKET_DATA_MODULE.md` section 15 (Inactive หรือ unmapped market data)
- Watch Alert เดิมที่อ้าง inactive option ต้องไม่ถูกลบโดยอัตโนมัติ เพราะ User อาจต้องการแก้ไข criteria หรือลบด้วยตัวเอง

กฎสำหรับ spec option criteria และ free-text (ตาม `../FrontOffice/10_WATCH_ALERT_MODULE.md` Spec Option And Free-Text Criteria Rule):

- Option-based criteria match ด้วย relation id เท่านั้น — Asset ที่เก็บ spec เป็น free-text (relation `null`) ต้องไม่ match option criteria จนกว่า Back Office promote/map alias แล้ว backfill relation id
- Keyword criteria เป็นช่องทางครอบคลุม free-text spec — keyword ต้อง match บน snapshot text รวมค่าที่ Owner กรอกผ่าน `ระบุเอง`
- ค่า suggestion pool ที่ยังไม่ promote ต้องไม่มีให้เลือกเป็น criteria — criteria อ้างได้เฉพาะ entity/option `is_active=true` เท่านั้น
- เมื่อ Back Office promote suggestion เป็น option จริงหรือ map alias แล้ว backfill relation id ให้ Asset เดิม ระบบต้อง re-run match evaluation ของ alert ที่เกี่ยวข้อง และแจ้งเตือน match ใหม่ที่เกิดจาก backfill โดย dedup ด้วย (`alert_id`, `asset_id`) — ตาม section 23.4 และ `11_WATCH_ALERT_MODULE.md`

### 22.5 Caching Strategy For FO

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
- Listing counts (จำนวน Asset Sale ต่อ option) เปลี่ยนแปลงบ่อยกว่า option master status — ไม่ควร cache ด้วย TTL 24 ชม. เหมือน option list ให้แยก cache สั้นกว่า (เช่น 5-15 นาที) หรือดึง on-demand ตอน user เปิด dropdown/autocomplete เพื่อให้ตัวเลขใกล้เคียงสถานะปัจจุบัน

### 22.6 Fallback Behavior When Option Is Deactivated

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
| **Group-level Deactivate** | เมื่อ group ถูก deactivate ทั้ง group และ option ทั้งหมดใน group ไม่แสดงใน FO form/filter/Watch Alert ใหม่; existing assets ยังแสดงค่าเดิมเพราะ lookup จาก `spec_options` โดยไม่กรอง `is_active` หรืออ่านจาก snapshot text; เงื่อนไขเดียวกับ option-level deactivate แต่กระทบทุก option ใน group พร้อมกัน |
| **Group-level Delete** | Destructive — อนุญาตเฉพาะเมื่อไม่มี asset ใช้ option ใน group นั้น จึงไม่มี existing asset ที่ได้รับผลกระทบ; บันทึก audit `GROUP_DELETE` ก่อน hard delete เพื่อคง trail |
| **Option-level Delete** | Destructive — อนุญาตเฉพาะเมื่อ `used_in_assets=false` จึงไม่มี existing asset ที่ได้รับผลกระทบ; บันทึก audit `OPTION_DELETE` ก่อน hard delete; FO form/filter/Watch Alert ใหม่ไม่แสดง option นั้นอีก (option หายไปจากระบบ); cache invalidation ตาม section 22.5 |

กฎสำคัญ:

- ห้าม cascade delete หรือ set null FK ใน `watch_assets` และ `asset_delivery_items` เมื่อ deactivate ตาม section 17.10
- FO/BO ต้อง lookup label จาก `spec_options` โดยไม่กรอง `is_active` เมื่อแสดงข้อมูล asset เดิม
- FO form/filter/Watch Alert ใหม่ ต้องกรอง `is_active=true` เท่านั้น
- Asset snapshot text ไม่กระทบเพราะ asset เก็บ snapshot text คู่กับ relation id แยกต่างหาก

### 22.7 API Contract For FO Option List Retrieval

FO ดึง option list จาก backend ผ่าน API ต่อไปนี้:

#### Endpoint: `GET /api/spec-options`

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `group` | string | Optional | กรองตาม Group Key เช่น `condition`, `delivery`; ถ้าไม่ส่งให้คืนทุก group |
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
          "is_system": true,
          "listing_count": 380
        }
      ]
    }
  ]
}
```

`listing_count` คือจำนวน Asset สถานะ `Sale` ที่ User ปัจจุบันมีสิทธิ์เห็นและใช้ option นี้ — ค่านี้เปลี่ยนแปลงบ่อย ต้อง cache แยกจาก option master ตาม section 22.5 หรือดึง on-demand ตอนเปิด dropdown

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

### 22.8 Prefill Behavior From Market Data Reference Selection

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
- ถ้า provider text ไม่ match กับ option/alias ใน option master ให้เว้นว่างเท่านั้น — ห้าม auto-save provider text เป็น free-text และห้ามเขียนลง suggestion pool เพราะ provider vocabulary ไม่ใช่ demand signal ของ Owner (free-text มีเฉพาะจากที่ Owner เลือก `ระบุเอง` พิมพ์เองตาม section 22.2)
- Prefill ต้องไม่บันทึกอัตโนมัติ ต้องรอ Owner กด Save ใน Add/Edit Asset form
- Prefill ทำเฉพาะตอนเลือก Reference ครั้งแรกใน Add Asset; ใน Edit Asset ถ้า Owner เปลี่ยน Reference ใหม่ ระบบอาจเสนอ prefill ใหม่ แต่ต้องไม่ overwrite ค่าที่ Owner แก้ไว้แล้วโดยไม่ได้รับการยืนยัน

### 22.9 Interaction Between Market Data And Option Master

Market Data และ Option Master เป็นสองระบบแยกกัน แต่ต้องมี interaction ที่ชัดเจน:

| ด้าน | Rule |
| --- | --- |
| ขอบเขต | Market Data เป็น provider catalog (brand, model, reference, price index); Option Master เป็น internal option master (condition, delivery, case_material, movement, dial_color, strap_bracelet_type) |
| ข้อมูล provider | `watch_references.case_material` และ `watch_references.movement` เป็น text จาก provider ไม่ใช่ option master |
| Mapping | ระบบต้อง map provider text กับ `spec_options` ได้ (ถ้า match) สำหรับ prefill ใน FO Add/Edit Asset |
| ไม่ match | ถ้า provider text ไม่ match กับ option master ใด ให้เว้นว่างตาม section 22.8 — ไม่ auto-save เป็น free-text; ค่า free-text มีเฉพาะจากที่ Owner เลือก `ระบุเอง` พิมพ์เองเท่านั้น |
| ปลายทางเก็บข้อมูล | Spec relation id + snapshot text (รวม free-text ที่ relation `null`) เก็บบน `watch_assets` ตาม section 17.4 เป็น canonical model — `asset_specifications` ใน `../FrontOffice/04_ASSET_MANAGEMENT_MODULE.md` เป็น recommended backend split เท่านั้น; ถ้า implementation ใช้ตารางแยก ต้องคง contract เดียวกัน (relation id nullable + snapshot text + free-text = relation `null` + snapshot) |
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
- [ ] FO Search Filter ระบุชัด รวม Filter Visibility Rule (แสดงทุก active option พร้อมจำนวน listing แม้เป็น 0) และ Filter Dependency Rule
- [ ] FO Watch Alert criteria ระบุชัด รวม schema เดียวกับ Search Filter, รองรับ no current listing criteria และ warning สำหรับ inactive option
- [ ] Caching strategy มี storage, cache key, TTL, refresh trigger และ fallback
- [ ] Fallback behavior สำหรับ deactivate option ครบทุก surface (FO form, FO Edit asset เดิม, FO Asset Detail, FO Search Filter, FO Watch Alert, BO Asset Detail, BO Asset List filter)
- [ ] API contract มี endpoint, parameter, response format, error response และ caching header
- [ ] Prefill behavior จาก Market Data reference ระบุชัด รวม Owner แก้ไขได้และไม่ถูก provider sync overwrite
- [ ] Interaction ระหว่าง Market Data และ Option Master ระบุชัด รวม mapping rule และไม่ match handling
- [ ] FO Integration ครอบคลุม Add/Edit Asset, Search Filter และ Watch Alert ครบทั้งสาม surface
- [ ] `ระบุเอง` save rule ระบุชัด: normalize → dedup กับ option label/alias → match ผูก relation id / ไม่ match เก็บ relation `null` + snapshot text
- [ ] Suggestion pool write path ระบุชัด: upsert `spec_option_suggestions`, dedup ด้วย `(group_id, normalized_text)`, `usage_count` + timestamps และห้าม auto-promote
- [ ] Curation queue actions ระบุชัด: promote / map alias / ignore พร้อมผล backfill relation id, alert re-evaluation และ audit event `OPTION_SUGGESTION_*` ของแต่ละ action
- [ ] Free-text spec ไม่แสดงใน filter option, autocomplete หรือ Watch Alert criteria จนกว่า promote แต่ search keyword ต้องเจอจาก snapshot text
- [ ] Provider text ที่ไม่ match option ต้องเว้นว่างเท่านั้น ห้าม auto-save เป็น free-text หรือเขียนลง suggestion pool

## 23. Spec Option Suggestion Pool And Curation Queue

ส่วนนี้กำหนด data model และกฎของ suggestion pool — ค่า free-text ที่ Owner กรอกผ่าน `ระบุเอง` ใน FO Add/Edit Asset (ตาม section 22.2) ซึ่งต้องผ่าน Back Office curation ก่อนกลายเป็น option จริง

หมายเหตุ scope: ส่วนนี้กำหนด data model, queue behavior และ audit contract เท่านั้น — Suggestion queue UI บน BO Option Master screen เป็น scope expansion แยก (prototype ปัจจุบันล็อกแล้ว ไม่มี queue UI) ต้องขยาย prototype เพิ่มก่อน implement ส่วน interface

### 23.1 Table `spec_option_suggestions`

เก็บค่า free-text ที่ Owner ส่งผ่าน `ระบุเอง` โดย dedup ด้วย `normalized_text` ภายใน group เดียวกัน

```sql
CREATE TABLE spec_option_suggestions (
  id BIGSERIAL PRIMARY KEY,
  group_id BIGINT NOT NULL REFERENCES spec_option_groups(group_id),
  submitted_text TEXT NOT NULL,
  normalized_text TEXT NOT NULL,
  usage_count INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending',
  resolved_option_id BIGINT NULL REFERENCES spec_options(id),
  resolved_by_admin_id BIGINT NULL,
  resolved_at TIMESTAMPTZ NULL,
  resolution_note TEXT NULL,
  first_submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (group_id, normalized_text)
);
```

| Column | Type | Rule |
| --- | --- | --- |
| `id` | BIGSERIAL | PK |
| `group_id` | BIGINT | FK → `spec_option_groups.group_id` — เฉพาะ 4 กลุ่มที่รองรับ `ระบุเอง` (`case_material`, `movement`, `dial_color`, `strap_bracelet_type`) |
| `submitted_text` | TEXT | ข้อความดิบที่ Owner พิมพ์ล่าสุด (เก็บเพื่อ display ใน queue) |
| `normalized_text` | TEXT | ค่าหลัง normalize (trim, collapse whitespace, lowercase) ใช้ dedup; unique ภายใน group |
| `usage_count` | INTEGER | จำนวนครั้งที่ค่า normalized เดียวกันถูกส่ง — เพิ่มทุกครั้งที่มี save ใหม่ด้วยค่าเดิม (ไม่สร้าง row ซ้ำ) |
| `status` | TEXT | enum: `pending` (รอ curate), `promoted` (สร้าง option จริงแล้ว), `mapped` (ผูกเป็น alias ของ option เดิม), `ignored` (ปิดโดยไม่สร้าง option) |
| `resolved_option_id` | BIGINT | FK → `spec_options.id`; option ที่เกิดจาก promote หรือ option เป้าหมายของ map alias; `NULL` สำหรับ `pending`/`ignored` |
| `resolved_by_admin_id` | BIGINT | Admin ที่ resolve; `NULL` สำหรับ `pending` |
| `resolved_at` | TIMESTAMPTZ | เวลาที่ resolve; `NULL` สำหรับ `pending` |
| `resolution_note` | TEXT | บันทึกของ Admin (optional; แนะนำใส่เหตุผลตอน ignore) |
| `first_submitted_at` / `last_submitted_at` | TIMESTAMPTZ | เวลาที่ค่านี้ถูกส่งครั้งแรก/ล่าสุด — `last_submitted_at` อัปเดตทุกครั้งที่ `usage_count` เพิ่ม |

### 23.2 Table `spec_option_aliases`

เก็บ alias ของ option — ใช้โดย `ระบุเอง` dedup (section 22.2) และ provider prefill mapping (section 22.8/22.9) เพื่อให้ข้อความที่เขียนต่างกัน link กลับ option เดียวกันได้

```sql
CREATE TABLE spec_option_aliases (
  id BIGSERIAL PRIMARY KEY,
  option_id BIGINT NOT NULL REFERENCES spec_options(id),
  alias_text TEXT NOT NULL,
  normalized_alias TEXT NOT NULL,
  source TEXT NOT NULL,
  created_by_admin_id BIGINT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (option_id, normalized_alias)
);
```

| Column | Type | Rule |
| --- | --- | --- |
| `id` | BIGSERIAL | PK |
| `option_id` | BIGINT | FK → `spec_options.id` — option ที่ alias ชี้ไป |
| `alias_text` | TEXT | ข้อความ alias สำหรับ display |
| `normalized_alias` | TEXT | ค่าหลัง normalize — ต้อง unique ภายใน group เดียวกัน (enforce ที่ service layer เพราะ unique ข้าม table join ไม่ได้ด้วย constraint เดียว); ห้ามชนกับ `normalized_text` ของ option label หรือ alias อื่นใน group |
| `source` | TEXT | ที่มาของ alias เช่น `suggestion_map` (เกิดจาก queue action), `admin` (Admin เพิ่มเอง), `seed` (ถ้ามีใน seed file) |
| `created_by_admin_id` | BIGINT | Admin ที่สร้าง alias; `NULL` ถ้ามาจาก system/seed |
| `created_at` | TIMESTAMPTZ | auto |

กฎ alias:

- Alias ไม่ใช่ option แยก — ไม่มี listing count ของตัวเอง ไม่แสดงใน FO dropdown/filter/criteria
- เมื่อ `ระบุเอง` normalize แล้วตรง `normalized_alias` ต้องผูก relation id ของ option เจ้าของ alias ทันที (auto-link) ตาม section 22.2
- การลบ alias ที่เคยถูก auto-link แล้วไม่แก้ asset เดิม — asset เก็บ relation id + snapshot ไว้แล้ว

### 23.3 Write Path (FO `ระบุเอง` → Pool)

เมื่อ Owner save spec field ด้วย `ระบุเอง`:

1. Normalize ค่า (trim, collapse whitespace, case-insensitive compare)
2. เช็คซ้ำกับ option label และ `spec_option_aliases.normalized_alias` ใน group เดียวกัน
   - match → ผูก relation id ของ option นั้น ไม่เขียน suggestion pool
3. ไม่ match → save asset ด้วย relation id `null` + snapshot text แล้ว upsert `spec_option_suggestions`:
   - มี `normalized_text` เดียวกันใน group อยู่แล้ว → `usage_count` +1, อัปเดต `last_submitted_at` และ `submitted_text` ล่าสุด
   - ไม่มี → insert row ใหม่ `status='pending'`, `usage_count=1`
4. ค่าที่อยู่ใน `spec_option_suggestions` ต้องไม่แสดงใน FO dropdown, filter, autocomplete หรือ Watch Alert criteria ทุกกรณีจนกว่า status = `promoted`

### 23.4 Curation Queue Actions

Admin review suggestion ใน queue (ordered by `usage_count`/`last_submitted_at`) แล้วเลือก action หนึ่งในสาม:

| Action | ผลลัพธ์ | Backfill | Audit |
| --- | --- | --- | --- |
| Promote | สร้าง option จริงใหม่ใน group (Admin กรอก `option_key`, `label_en`, `label_th`, `sort_order`) → suggestion status `promoted`, `resolved_option_id` = option ใหม่ | Backfill relation id ให้ทุก asset ที่เก็บ snapshot ตรง `normalized_text` ใน group นั้น | `OPTION_SUGGESTION_PROMOTE` (+ `OPTION_ADD` ของ option ใหม่ตามปกติ) |
| Map alias | เลือก option เดิมใน group → สร้าง `spec_option_aliases` row ชี้ option นั้น → suggestion status `mapped`, `resolved_option_id` = option เดิม | Backfill relation id เหมือน promote + save ถัดไปด้วยข้อความเดิม auto-link ผ่าน alias ทันที | `OPTION_SUGGESTION_MAP_ALIAS` |
| Ignore | suggestion status `ignored` + `resolution_note` — asset คงเป็น free-text search ได้ตามเดิม ไม่ auto-link | ไม่มี | `OPTION_SUGGESTION_IGNORE` |

กฎ queue:

- **ห้าม auto-promote** — `usage_count` สูงไม่ทำให้ค่ากลายเป็น option อัตโนมัติ ต้องผ่าน Admin action เสมอ เพื่อคุมคุณภาพ vocabulary
- Backfill อัปเดตเฉพาะ relation id — snapshot text ของ asset คงเดิมตาม section 17.4 (Owner's text ไม่ถูกแก้)
- หลัง backfill ต้อง re-run Watch Alert match evaluation ของ alert ที่เกี่ยวข้อง และแจ้งเตือน match ใหม่ที่เกิดจาก backfill โดย dedup ด้วย (`alert_id`, `asset_id`) ตาม section 22.4 และ `11_WATCH_ALERT_MODULE.md`
- Suggestion ที่ `ignored` แล้วถ้ามีการส่งค่าเดิมเพิ่ม `usage_count` ยังนับต่อได้และ Admin เปิด resolve ใหม่ได้ — ignore ไม่ใช่การ block ถาวร
- Suggestion ที่ resolved (`promoted`/`mapped`) ต้องไม่กลับเป็น `pending`
- Queue action ต้องมี permission เทียบเท่าการจัดการ option (`OPTION_ADD`/`OPTION_EDIT` ระดับเดียวกัน) ตาม section 4

### 23.5 Curation Queue UI (Prototype — scope expansion task `3d2b6f50`)

Suggestion Queue เป็น screen ภายใต้ Option Master เดิม — **ไม่เพิ่ม navigation submenu** (Option Master คง nav item เดี่ยวตาม locked structure)

**Entry point**

- Page action `Suggestion Queue` บน Option Group List พร้อม badge จำนวน pending รวมทุก group (`option-queue-count`)
- Pending badge `N pending` (`option-suggestion-pill`) ใน Status cell ของ group row ที่รองรับ `ระบุเอง` — เปิด queue พร้อม group filter ตั้งค่าเป็นกลุ่มนั้น
- ไม่เปลี่ยน column/พฤติกรรมเดิมของ Option Group List และ Option Detail

**Queue screen**

- Breadcrumb `การดำเนินงาน / Option Master / Suggestion Queue` — back button กลับ Option Group List และคง queue filter state
- Combined queue รวม suggestion ของทุก supported group (`case_material`, `movement`, `dial_color`, `strap_bracelet_type`) ในตารางเดียว ตาม ordering contract `usage_count`/`last_submitted_at`
- Columns: Suggestion ID, Suggested Value, Group, Usage, First Seen, Last Seen, Status (Pending/Promoted/Mapped/Ignored badge), Resolution, Action
- Filter bar ตาม list pattern เดิม: เปิด/ปิดตัวกรอง toggle (mobile), search (Suggestion ID, suggested value, group), group filter, status filter, sort (`Usage สูงสุด` default / `ล่าสุดก่อน` / `เก่าสุดก่อน`), reset ทั้งหมด, pagination 10/page, filter state persistence เมื่อกลับมาจากหน้าอื่นใน module เดียวกัน, empty state
- Row click เปิด Suggestion Detail modal (read-only summary + audit history + audit-ref jump ไป Audit Log); row action menu มี ดูรายละเอียด + Promote/Map/Ignore (เฉพาะ `pending`) + ดู Audit Log (กระโดด Audit Log กรองด้วย `SUG-xxx` — แสดงเฉพาะเมื่อ suggestion มี audit event แล้ว เช่นหลัง resolve)

**Queue actions บน prototype**

- **Promote** — reuse Add Option modal พร้อม suggestion context (Suggestion ID, submitted text, usage count) และ prefill `label_en`/`option_key` จาก submitted text; confirm modal เดิมแสดงแถว `From Suggestion`; เมื่อยืนยัน: สร้าง option ใน group ของ suggestion + audit `OPTION_ADD` บน option, `OPTION_SUGGESTION_PROMOTE` บน suggestion และ global Audit Log event (`reference` = `SUG-xxx`, risk Medium); ถ้า label สุดท้ายต่างจาก submitted text จะสร้าง `spec_option_aliases` row (`source=suggestion_promote`) ให้ค่าเดิม resolve เข้า option ใหม่ได้
- **Map alias** — modal เลือก option เดิมใน group เดียวกัน (required) + note ไม่บังคับ; เมื่อยืนยัน: สร้าง `spec_option_aliases` row (`source=suggestion_map`) + status `mapped` + audit `OPTION_SUGGESTION_MAP_ALIAS` (risk Low)
- **Ignore** — modal บังคับ note (แสดง field error เมื่อว่าง) + status `ignored` + audit `OPTION_SUGGESTION_IGNORE` (risk Low)
- ทุก action เมื่อ resolve แล้ว refresh queue + success toast และ pending badge/queue count ใน Option Group List อัปเดตอัตโนมัติ

**Responsive และ scope**

- Desktop: table layout ตาม `option-suggestion-table`; <1181px: card rows (ซ่อน header row), filter toggle เปิด/ปิด advanced filters, row action menu แบบเดียวกับ Option Detail
- `option-suggestion-mode` ใช้เฉพาะหน้า queue และถูกถอดเมื่อกลับ Option Group List / Option Detail หรือเปลี่ยน module — ไม่ leak ไป screen อื่น
- Prototype ใช้ mock `optionSuggestions`/`optionSuggestionAliases` in-memory — backfill relation id และ Watch Alert re-evaluation เป็น production contract ตาม §23.4 ไม่ implement จริงใน prototype
