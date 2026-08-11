# 07 BO Directory Module

**Version:** `BO-07-v0.1`  
**Date:** 2026-07-06  
**Status:** Postponed / future reference only
**Platform:** Responsive Web Back Office  
**Primary FO Sources:** `../FrontOffice/00_NAVIGATION_AND_CROSS_MODULE_FLOW.md`, `../FrontOffice/README_MODULE_INDEX.md`, `../FrontOffice/Figma_Gap_Checklist_Against_Master.md`  
**Integration Map:** `../ProjectAdmin/FO_BO_INTEGRATION_MAP.md`

**Phase 1 status:** Postponed. Do not expose the BO Directory menu, route, CRUD, publication controls, map/contact/image fields, import/export, or FO sync in Phase 1 because FO directory menu entries are placeholders and detail routes are not approved.

## 1. วัตถุประสงค์

BO Directory Module คือเครื่องมือสำหรับ Admin ใช้จัดการรายชื่อร้านค้าและบริการที่เกี่ยวข้องกับนาฬิกา เช่น ร้านนาฬิกา ร้านซ่อม ศูนย์รับฝากขาย ศูนย์ตรวจแท้ และบริการอื่นที่อาจแสดงใน FO Directory หรือเมนูที่เกี่ยวข้อง

ข้อควรระวัง: FO documents ปัจจุบันยังจัด Directory menu หลายรายการเป็น future/placeholder สำหรับ production V1 ดังนั้น BO ต้องรองรับข้อมูลและ publication control ไว้ก่อน แต่การเปิด FO route จริงต้องอิง Product decision

## 2. Scope

### In Scope

- Directory item list
- Create / edit directory item
- Category management
- Active/Inactive publication status
- Contact, social, map, image และ opening hours fields
- Preview FO display metadata
- Import/export ตาม permission
- Audit log ทุก mutation
- Responsive web layout

### Out Of Scope

- User review/rating ของร้าน
- Booking/appointment
- Payment หรือ commission settlement
- Claim business profile โดย external business owner
- Public SEO web listing เว้นแต่มี decision เพิ่ม
- เปิด FO Directory route อัตโนมัติ โดยไม่มี Product decision

## 3. Admin Access And Permissions

BO uses a single Admin account type only. Admin access is controlled by module access, action policy, sensitive-data policy, confirmation, reason, and audit requirements instead of separate BO admin account types.


| Access Area | Rule |
| --- | --- |
| Module access | Admin can use list/detail/search/filter when module access is granted. |
| Write action | Create, update, status change, remove, restore, publish, archive, retry, and similar actions require permission check, confirmation for high-risk actions, reason when FO/user impact exists, and audit log. |
| Sensitive data | Mask by default; reveal only with business reason, policy approval, and audit log. |
| Export | Requires permission check, scope control, expiry/background job where needed, and audit export event. |
| Direct URL/API | Enforce access at route, API, and service layers; never rely only on hidden UI. |
## 4. Responsive Layout

| Width | Requirement |
| --- | --- |
| Mobile-width browser | Directory list เป็น stacked cards, filter อยู่ใน drawer, edit form แยก section ชัดเจน |
| Tablet | Table พร้อม detail panel หรือ drawer |
| Desktop | Full table, side filter, map/contact preview, bulk import/export controls |

Form ต้องป้องกันรูปภาพ/map/contact fields ล้นหน้าจอ และ action หลักต้องเข้าถึงได้บนทุก breakpoint

## 5. Directory Categories

Baseline categories:

- Watch Shops
- Accessories Shops
- Repair Shops
- Auction Centers
- Consignment Centers
- Authentication Centers
- Community

Category fields:

- Category ID
- Name TH
- Name EN
- Slug
- Description
- Active/Inactive
- Display order

ถ้า `Community` หมายถึง Board/Social scope ต้อง map ให้ชัดเจนก่อนเปิดใน FO เพื่อไม่ให้ซ้ำกับ Board module

## 6. Directory Item Fields

### Required Fields

| Field | Rule |
| --- | --- |
| Name TH | Required |
| Category | Required |
| Status | Required: Draft, Active, Inactive, Archived |

### Optional Fields

- Name EN
- Address
- Province
- District
- Postal code
- Phone
- Line ID
- Email
- Website
- Facebook
- Instagram
- Logo / profile image
- Cover photos สูงสุด 5 รูป
- Description
- Opening hours
- Map latitude/longitude
- Tags
- Display order
- Internal note

## 7. Status Rules

| Status | BO Meaning | FO Result |
| --- | --- | --- |
| Draft | ยังไม่พร้อมเผยแพร่ | ไม่แสดงใน FO |
| Active | พร้อมเผยแพร่ | แสดงใน FO Directory surfaces ถ้า FO route เปิดใช้งาน |
| Inactive | ปิดใช้งานชั่วคราว | หายจาก FO surfaces แต่เก็บ record ไว้ |
| Archived | ไม่ใช้งานแล้ว | ไม่แสดงใน FO และใช้เป็น historical record |

ห้าม hard delete record ที่เคยถูกใช้เป็น FK, consignment center, report, audit หรือ analytics แล้ว ให้ใช้ Inactive/Archived เป็นหลัก

## 8. FO Publication Rules

| BO Action | FO Result |
| --- | --- |
| Activate item | Item แสดงใน FO Directory surfaces เมื่อ FO route/scope เปิดใช้งาน |
| Inactivate item | Item หายจาก FO Directory surfaces |
| Archive item | Item หายจาก FO และคงไว้เป็น historical/admin record |
| Update active item | FO แสดงข้อมูลล่าสุดหลัง sync/cache invalidation |
| Activate category | Category แสดงใน FO filter/menu เมื่อ FO route เปิดใช้งาน |
| Inactivate category | Category หายจาก FO filter/menu; item ภายใต้ category ต้องมี fallback rule |

ถ้า FO Directory ยังเป็น placeholder, BO ต้องไม่ถือว่า Active item แปลว่า FO production route เปิดแล้ว ให้ตรวจ `INT-DEC-005` ก่อน implementation

## 9. Map And Contact Rules

- Map location ต้องเก็บ latitude/longitude แบบ structured field
- Address text และ map pin ต้องแก้ไขแยกกันได้
- Phone ต้องรองรับรูปแบบไทยและ international format เท่าที่จำเป็น
- Website/social URL ต้อง validate format
- Line ID ไม่ควรถูกบังคับเป็น URL
- Email ต้อง validate เมื่อกรอก

Google Maps หรือ map provider เป็น implementation detail แต่ต้องไม่ทำให้ BO form ใช้งานไม่ได้ถ้า map provider error

## 10. Image Rules

- Logo/profile image เป็น optional
- Cover photos สูงสุด 5 รูป
- ต้อง validate file type และขนาดไฟล์
- ต้องมี alt text หรือ fallback label ถ้านำไปแสดงใน FO
- ถ้ารูปถูกลบ ต้องไม่ทำให้ item หายทั้ง record

## 11. Import / Export

Future scope should support:

- CSV/XLSX import สำหรับ directory item
- Dry-run validation ก่อน import จริง
- Duplicate detection ตาม name + phone + province หรือ rule ที่ Product/Operations กำหนด
- Error report รายแถว
- Export ตาม permission

Import ต้องไม่ activate item อัตโนมัติถ้ายังขาด field สำคัญต่อ FO display

## 12. Validation And Data Quality

ต้องตรวจ:

- Missing required fields
- Duplicate item
- Invalid URL
- Invalid email
- Invalid map coordinates
- Inactive category with active item
- Cover photos เกิน limit
- Active item ที่ไม่มี contact หรือ location เลย ควร warning

Warning บางรายการไม่จำเป็นต้อง block save แต่ต้องเห็นชัดก่อน activate

## 13. Error, Empty, Loading States

ต้องรองรับ:

- Empty directory list
- Empty category list
- No search result
- Save failed
- Import failed
- Permission denied
- Map provider unavailable
- Image upload failed
- Concurrent update warning

## 14. Audit Requirements

ต้อง audit:

- Directory item create/update/activate/inactivate/archive
- Category create/update/activate/inactivate
- Import/export
- Image upload/delete
- Bulk update

Audit event ต้องมี admin ID, admin access, target type, target ID, before/after value, reason ถ้ามี, timestamp และ session/IP context ถ้ามี

## 15. Integration With Other Modules

| Module | Integration |
| --- | --- |
| Asset Management | Consignment center อาจใช้ FK ไป Directory item ในอนาคต |
| Market Data | Admin ownership และ shared data quality patterns |
| Dashboard | Directory activated/inactivated activity และ data quality warnings |
| Audit Log | ทุก mutation ต้อง searchable |
| Reports | Export directory list และ status summary |
| FO Navigation | เปิด/ซ่อน Directory surfaces ตาม Product decision |

## 16. Acceptance Criteria

| ID | Criteria |
| --- | --- |
| AC-BO-DIR-001 | Admin สร้าง แก้ไข activate/inactivate/archive directory item ได้ตาม permission |
| AC-BO-DIR-002 | Directory item รองรับ category, contact, social, image, map, opening hours และ tags |
| AC-BO-DIR-003 | Active item แสดงใน FO เฉพาะเมื่อ FO Directory route/scope เปิดใช้งาน |
| AC-BO-DIR-004 | Inactive/Archived item ต้องไม่แสดงใน FO surfaces |
| AC-BO-DIR-005 | Category active/inactive ส่งผลต่อ FO filter/menu เมื่อเปิดใช้งาน |
| AC-BO-DIR-006 | Record ที่มี historical relation ต้องไม่ hard delete |
| AC-BO-DIR-007 | Import ต้องมี dry-run validation และ duplicate detection |
| AC-BO-DIR-008 | Map provider unavailable ต้องไม่ทำให้ edit form ใช้งานไม่ได้ |
| AC-BO-DIR-009 | Directory mutations และ export ต้อง audit-log |
| AC-BO-DIR-010 | UI responsive ใช้งานได้ที่ mobile-width, tablet และ desktop |

## 17. Open Decisions

| ID | Decision Needed | Current Recommendation |
| --- | --- | --- |
| BO-DIR-DEC-001 | FO Directory จะเปิดเป็น production V1 หรือ placeholder-only | ใช้ placeholder-only จนกว่า Product ยืนยัน |
| BO-DIR-DEC-002 | Community category หมายถึง Board, Social หรือ Directory item จริง | ต้อง map taxonomy ก่อนเปิด FO |
| BO-DIR-DEC-003 | Consignment Centers จะผูกกับ asset consignment workflow ใน Phase 1 หรือไม่ | เก็บ FK-ready field แต่ยังไม่บังคับ |
| BO-DIR-DEC-004 | Map provider ที่ใช้ production | ต้องเลือก provider และ quota ก่อน implementation |
