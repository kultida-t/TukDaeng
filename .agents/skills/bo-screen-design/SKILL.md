---
name: bo-screen-design
description: มาตรฐานการออกแบบ/ปรับแก้หน้าจอ Back Office (BO) module ของ TukDaeng ครอบคลุม page structure, header/breadcrumb, KPI cards, search/filter/sort/reset toolbar, list table + mobile card, status badge/chips, detail page, modal, forms/editors, navigation/context, loading/empty/error states และ responsive standard. Use เมื่อออกแบบ/สร้าง/ปรับ module ใหม่ของ BO ที่ต้องสอดคล้องกับ prototype ที่ล็อกแล้ว ไม่ใช่สำหรับ React/Next.js ทั่วไป (ใช้ senior-frontend) หรือ UI เพื่อการตลาด/creative (ใช้ frontend-design)
---

# BO Screen Design

> ## ⚠️ Machine Guard — ตรวจสอบเครื่องก่อนทำงาน skill นี้ (จำเป็น)
>
> Skill นี้ผูกกับเครื่องเฉพาะ เพราะอ้างอิง path/workspace ของ TukDaeng บนเครื่องนี้เท่านั้น
>
> **เครื่องที่อนุญาต:**
> - Platform: Windows
> - User: `Admin`
> - Home path: `C:\Users\Admin`
> - Workspace path ที่ต้องมีอยู่จริง: `C:\Users\Admin\Desktop\TukDaeng\`
>
> **วิธีตรวจสอบก่อนเริ่ม skill:**
> 1. ตรวจ user ปัจจุบัน (เช่น `whoami`) — ต้องเป็น `Admin`
> 2. ตรวจว่า path `C:\Users\Admin\Desktop\TukDaeng\` มีอยู่จริง
>
> **ถ้าไม่ใช่เครื่องนี้:** หยุดทำงาน skill นี้ทันที แจ้งผู้ใช้ว่า skill นี้ใช้ได้เฉพาะเครื่องของ Admin เท่านั้น

Skill นี้เป็น **มาตรฐานกลางสำหรับออกแบบ/ปรับแก้หน้าจอ Back Office (BO) module ของ TukDaeng** โดยถอด pattern จาก prototype ที่คอนเฟิร์มและล็อกแล้ว ใช้เพื่อให้ module ใหม่ที่จะขึ้น reuse สไตล์/interaction เดียวกันได้ทันที โดยไม่ต้องปรับแก้หน้าจอ ตาราง responsive modal ฯลฯ ซ้ำ

## เมื่อไรใช้ skill นี้

ใช้เมื่อ:

- ออกแบบ/สร้าง BO module ใหม่ (เช่น Notifications, Reports & Analytics, Admin Settings, Directory, Audit Log, Watch Alert, Help & Support, Account Deletion)
- ปรับแก้หน้าจอ BO module ที่มีอยู่ (เฉพาะที่ไม่ใช่ protected screen หรือได้รับ approval แล้ว)
- รีวิว/audit ความสอดคล้อง UI/UX ของหน้าจอ BO ข้าม module
- ตอบคำถามเกี่ยวกับ pattern มาตรฐานของ BO (เช่น "module ใหม่ควรมี KPI cards ไหม", "ใช้ side panel ไหม", "confirmation modal เขียนยังไง")

**ห้ามใช้ skill นี้แทน:**

- `senior-frontend` — สำหรับ React/Next.js/TypeScript/Tailwind ทั่วไป (scaffolding, performance, accessibility)
- `frontend-design` — สำหรับ creative/distinctive UI (landing page, marketing, poster)
- `mission-planning` — สำหรับวางแผน Mission รายวัน
- `work-summary` — สำหรับสรุปงาน/จับเวลา task

## Source Of Truth (อ่านก่อนเสมอ)

ก่อนออกแบบ/ปรับแก้ ต้องอ่าน source of truth ต่อไปนี้ตามลำดับ:

1. **`PROTECTED_SCREENS.md`** — นโยบายหน้าจอล็อก ห้ามแก้ protected screens โดยไม่ได้รับ approval
2. **`Prototypes/bo-prototype.html`** — visual + interaction source of truth ของหน้าจอ BO ที่ล็อกแล้ว (Dashboard, User Management, Asset Management, Offer Management, Content Management, Market Data, Option Master)
3. **`BackOffice/BO_UI_UX_STANDARD.md`** — มาตรฐานกลางที่ถอด pattern จาก prototype (เอกสารหลักที่ skill นี้สรุป)
4. **`docs/responsive-table-standard.md`** — มาตรฐาน table-to-card responsive (breakpoint 760px, class ที่ใช้, โครงสร้าง HTML)
5. **`AGENTS.md`** — กฎ protected screens + language conventions (UI copy เป็นไทย, คอมเมนต์ตามภาษาเดิมในไฟล์)
6. **`BackOffice/00_GLOBAL_RULES_MODULE.md`** — กฎกลางทุก module (status, audit, permission, FO sync)

ถ้าข้อกำหนดใน module spec เฉพาะขัดกับ prototype ที่ยืนยันแล้ว ให้ **หยุดและถาม Product/UX ก่อนเปลี่ยน pattern** อย่าเปลี่ยนเอง

## Protected Screen Boundary

หน้าจอที่ล็อกแล้ว (ดู `PROTECTED_SCREENS.md` และ `AGENTS.md`):

- Login
- Dashboard
- User Management (User List, Reported Users, Report Detail)
- Asset Management (Asset List, Asset Detail, Reported Assets, Asset Report Detail, Reported Comments, Comment Report Detail)
- Content Management (Articles, Categories, Reported Board, Board Report Detail)
- Market Data
- Offer Management
- Option Master

**กฎเหล็ก:**

- ห้ามแก้ layout, copy, state, route, menu, mock data, modal, filter, detail, action flow ของ protected screens
- ห้ามแก้ shared CSS/helper/route ที่กระทบ protected screens โดยไม่ได้รับ approval
- ห้ามแก้ `Prototypes/bo-prototype.html` เพื่อ "ทำมาตรฐาน" โดยไม่ได้รับ approval
- reuse pattern ใน module ใหม่ได้ แต่อ่าน prototype เป็น reference เท่านั้น
- ถ้าต้องแก้ shared component ที่กระทบ protected screen → หยุดและขอ approval ก่อน

## Module Application Workflow

เมื่อออกแบบ/สร้าง module ใหม่ ให้ทำตามลำดับนี้:

1. **อ่าน source of truth** ตามลิสต์ด้านบน
2. **ระบุประเภท module** — list-only, list+detail, report queue, editor, dashboard-like หรือ master data management
3. **เลือก source pattern** จาก completed module ที่ใกล้ที่สุด (ดูตารางด้านล่าง)
4. **ทำ Module Application Checklist** (ดูท้าย skill)
5. **ออกแบบตาม pattern ใน skill นี้** โดยใช้ section ที่เกี่ยวข้อง
6. **ตรวจ QA Checklist** ก่อนส่งมอบ
7. **ตรวจ protected-screen impact** ก่อนแก้ shared code

### ตารางเลือก source pattern

| ประเภท module | Source pattern ที่ใช้อ้างอิง |
| --- | --- |
| Dashboard-like / ภาพรวมระบบ | Dashboard |
| List + detail (drill-in) | User Management, Asset Management |
| Report queue + detail + action | Reported Users, Reported Assets, Reported Comments |
| Master data + reorder + audit | Option Master |
| Editor + preview + publish | Content Management (Articles) |
| Category/tree + reorder | Content Management (Categories) |
| Read-only detail + history | Offer Management |
| Data sync/import + audit | Market Data |
| Notification list | (ยังไม่มี pattern ที่ล็อก — ใช้ list-only pattern กลาง) |
| Reports/analytics | (ยังไม่มี pattern ที่ล็อก — ใช้ dashboard-like + filter) |
| Settings/config | (ยังไม่มี pattern ที่ล็อก — ใช้ form pattern กลาง) |

---

## Page Structure

หน้าจอ BO module มาตรฐานเรียงโครงสร้างดังนี้:

1. **Sidebar/module navigation** ตาม grouping ที่ยืนยันแล้ว
2. **Top page header** พร้อม breadcrumb, page title, optional page meta และ optional page action
3. **Main panel** สำหรับ list/table/card หรือ detail content
4. **Filter/search toolbar** ภายใน panel สำหรับหน้ารายการ
5. **Pagination footer** สำหรับ list ที่แบ่งหน้า
6. **Detail page, drawer-like modal, preview modal หรือ confirmation modal** ตาม flow ของ module

**ส่วนประกอบที่เป็น optional (ไม่ใช่ default):**

- **Summary/KPI cards** เหนือ main panel — เฉพาะหน้าที่มีข้อมูลภาพรวมจริง (ดู section KPI And Summary Cards)
- **Side panel / list-detail split** — เฉพาะหน้าที่ต้องแสดง detail ควบคู่กับ list จริง (ดู section Side Panel And List/Detail Split)

**มาตรฐาน visual density:**

- Page title ใหญ่เฉพาะ header หลัก
- Panel title ใช้ขนาดเล็กและกระชับกว่า page title
- Card และ panel ใช้ radius ประมาณ 7-8px
- ใช้ border, shadow และ spacing แบบ operational dashboard ไม่ใช่ landing page
- ห้ามซ้อน card ภายใน card หากไม่ใช่ item ซ้ำ, modal หรือ framed tool ที่จำเป็นจริง

---

## Header And Breadcrumb

ทุกหน้า module ต้องมี **breadcrumb** ที่บอกตำแหน่งในระบบ เช่น `การดำเนินงาน / User Management / User List`

**Page header ต้องมี:**

- Page title สั้นและตรงกับเมนู/flow ปัจจุบัน
- Page meta เฉพาะเมื่อมีข้อมูล freshness/context ที่ช่วยตัดสินใจ เช่น `Last updated`
- Page action ด้านขวาเฉพาะ action ที่เป็น primary entry point ของหน้านั้น

**Detail page ต้องมี back action** ที่รักษา context เดิม เช่น กลับจาก detail ไป list พร้อม filter/search ที่ยังอยู่เท่าที่ flow รองรับ

---

## KPI And Summary Cards

KPI/summary cards เป็น **optional ไม่ใช่ default** ของทุกหน้า

### When To Use KPI Cards

ใช้เมื่อตอบ "ใช่" ได้อย่างน้อย 1 ข้อ:

- หน้านั้นมี operational workload ที่ admin ต้องกำกับ (เช่น จำนวน report ที่รอตรวจ)
- มีสถานะหลายประเภทที่ต้องแยกดูพร้อมกันเพื่อตัดสินใจ (เช่น offer lifecycle 6 สถานะ)
- เป็น dashboard ที่หน้าที่หลักคือภาพรวม ไม่ใช่ list
- ข้อมูลใน card นำไปสู่ action ได้ (เช่น คลิก card เปิด list ที่กรองตามสถานะนั้น)

### When NOT To Use KPI Cards

ตัดออกเมื่อตอบ "ใช่" ได้อย่างน้อย 1 ข้อ:

- ข้อมูลที่จะสรุปใน card แสดงในตารางอยู่แล้ว (เช่น จำนวน option ใน group)
- หน้านั้นเป็น list-only ที่ admin แค่ดู/จัดการรายการ ไม่มีภาพรวมที่ต้องกำกับ
- เป็น master data management ที่จำนวนทั้งหมดไม่ได้บอก workload/urgency
- card จะเป็น vanity metric (เช่น "จำนวนทั้งหมด X รายการ" ที่คลิกต่อไม่ได้)

> **ตัวอย่าง module ที่ไม่มี KPI cards:** Option Master (ข้อมูลซ้ำซ้อนกับตาราง — อนุมัติแล้วใน `BO-17-v0.7`)

### Card Standards (เมื่อตัดสินใจว่ามี KPI cards)

- แสดงเป็น grid เหนือ main panel
- Desktop ใช้ 4 cards ต่อแถวเป็น baseline
- Offer Management ใช้ status summary แบบ 6 cards ได้ตาม prototype
- Card ต้องมี label, value, optional icon/accent, trend/detail text และ optional chips
- Accent สีต้องช่วยแยกสถานะ ไม่ทำให้ทั้งหน้าเป็น palette สีเดียว
- Empty KPI ให้แสดง `0` หรือข้อความ empty ที่อ่านเข้าใจ ไม่ปล่อยช่องว่าง

---

## Side Panel And List/Detail Split

Side panel และ list/detail split เป็น **optional ไม่ใช่ default**

### When To Use Side Panel / List-Detail Split

ใช้เมื่อตอบ "ใช่" ได้อย่างน้อย 1 ข้อ:

- เป็น dashboard ที่หน้าที่หลักคือภาพรวม และมี activity/detail panel ที่ช่วย admin กำกับงานแบบ real-time
- admin ต้องเปรียบเทียบ/สลับดู detail หลายรายการจาก list โดยไม่ต้องกลับเข้าออก detail page ทีละรายการ
- เป็น report queue ที่ต้องเห็นรายการและรายละเอียดพร้อมกันเพื่อตัดสินใจทำ action

### When NOT To Use Side Panel / List-Detail Split

ตัดออกและใช้ full-width panel เมื่อตอบ "ใช่" ได้อย่างน้อย 1 ข้อ:

- หน้า list ที่ admin คลิก row เพื่อเปิด detail page เต็มหน้า (drill-in pattern)
- หน้า detail ที่เข้าจาก list แล้ว back กลับ list ได้
- ข้อมูล detail ซ้ำซ้อนกับข้อมูลในตาราง
- เป็น master data management ที่ detail แสดงในตารางอยู่แล้ว

> **ตัวอย่าง module ที่ไม่มี side panel:** User Management, Asset Management, Offer Management, Content Management, Market Data, Option Master — ทั้งหมดใช้ full-width panel ตาม prototype ที่ล็อกแล้ว มีเฉพาะ Dashboard ที่ใช้ side panel (แสดง activity)

### Layout Standards (เมื่อตัดสินใจว่ามี side panel)

- Desktop: list ฝั่งซ้าย, detail panel ฝั่งขวา ใช้ grid `minmax(0, 1fr) minmax(430px, 46%)`
- Detail panel ต้อง sticky ตาม scroll ของ list
- Mobile/Tablet: ซ่อน side panel ใช้ drill-in pattern แทน (คลิก row เปิด detail page)
- Detail panel ต้องมี empty state เมื่อยังไม่ได้เลือก row เช่น `เลือกรายการจากตารางเพื่อดูรายละเอียด`

---

## Search Filter Sort Reset

หน้ารายการทุกหน้าใช้ toolbar pattern เดียวกัน:

- **Search** เป็น control แรกเสมอ
- **Filter และ sort** อยู่ใน inline filter bar เดียวกัน
- **Reset** อยู่ท้าย toolbar เป็น icon button หรือ icon+hidden accessible label ตามพื้นที่
- **Advanced filters** บน mobile ต้อง collapse inline ภายใน list area ไม่ใช้ drawer หรือ bottom sheet
- Search/filter/sort เปลี่ยนแล้วต้องกลับไป page 1
- เปลี่ยน page ต้องคง search/filter/sort เดิม
- Reset ต้องล้าง search, filter, sort และกลับไป page 1

**ขนาด control:**

- Search และ custom select ใน filter bar สูง 48px
- Radius ประมาณ 7px
- Select label ต้อง ellipsis ได้ ไม่ดัน layout
- Reset icon button ใช้ขนาดประมาณ 42x48px เมื่ออยู่ใน filter grid

**Copy กลาง:**

| Use | Copy |
| --- | --- |
| Reset | `รีเซ็ตค่าทั้งหมด` |
| All status | `ทุกสถานะ` |
| All priority | `ทุก Priority` |
| All auth | `ทุกวิธีเข้าสู่ระบบ` |
| All brands | `ทุกแบรนด์` |
| All categories | `ทุกหมวดหมู่` |
| All sources | `ทุกแหล่งข้อมูล` |
| Latest first | `ล่าสุดก่อน` |
| Oldest first | `เก่าสุดก่อน` |

**Option ordering ที่เป็นมาตรฐาน:**

- Report status: ทุกสถานะ, Pending, Closed
- Priority: ทุก Priority, High, Medium, Low
- Auth method: ทุกวิธีเข้าสู่ระบบ, Email, Google, Apple
- Asset status: ทุกสถานะ, Sale, Sale + Consignment, Show, Hide, Sold, ซ่อนชั่วคราว, ซ่อนถาวร, ลบโดยเจ้าของ
- Article status: ทุกสถานะ, Draft, Scheduled, Published, Archived
- Category status: ทุกสถานะ, Active, Inactive
- Market sync status: ทุกสถานะ, กำลังทำงาน, ล้มเหลว, สำเร็จบางส่วน, สำเร็จ
- Offer status: ทุกสถานะ แล้วเรียงตาม lifecycle ของ offer ใน prototype/module spec

---

## List Table And Mobile Cards

> มาตรฐานเต็มอยู่ใน `docs/responsive-table-standard.md` — section นี้สรุปประเด็นหลัก

### Desktop list

- ใช้ dense table/grid
- Header row ต้องแสดงชัด
- Primary identity อยู่ฝั่งซ้าย
- Status/context badge อยู่คอลัมน์ status หรือ metadata area
- Actions อยู่คอลัมน์ขวาสุด
- Row click หรือ View action เปิด detail ที่เกี่ยวข้อง
- Horizontal scroll ทำได้เฉพาะใน table container เมื่อคอลัมน์บีบไม่ได้จริง

### Mobile list (≤ 760px — แปลงตารางเป็น card)

- แสดงเป็น stacked cards
- ซ่อน table header
- ทุก metadata สำคัญต้องมี label หรือ visual hierarchy ที่เข้าใจได้โดยไม่มี header
- Status/context badge ต้องยังเห็นชัด
- Action ที่ desktop ทำได้ต้องเข้าถึงได้บน mobile ตาม permission
- Text ต้อง wrap/ellipsis อย่างปลอดภัยและไม่ซ้อนกับปุ่ม
- ค่าทุกฟิลด์ใน card ตัดด้วย `text-overflow: ellipsis` ที่ความกว้างไม่เกิน 50% ของ card

### โครงสร้าง HTML มาตรฐาน (สรุป)

```html
<div class="asset-table asset-list-table">
  <div class="asset-row head"><!-- หัวตาราง (ซ่อนบน mobile) --></div>
  <div class="asset-row" data-asset-card="AST-0001">
    <div class="asset-cell-primary" data-label="Asset"><!-- หัวข้อ card บน mobile --></div>
    <div class="asset-card-tags"><!-- tags + meta บน mobile --></div>
    <div data-label="Brand"><!-- คอลัมน์ที่ซ่อนบน mobile --></div>
    <div class="user-row-actions"><!-- action menu --></div>
  </div>
  <div class="footer-range"><!-- pagination --></div>
</div>
```

**Class หลัก:** `.asset-table`, `.asset-list-table`, `.asset-row`, `.asset-row.head`, `.asset-cell-primary`, `.asset-card-tags`, `.user-card-meta`, `.user-row-actions`, `.footer-range`

> Module ใหม่ควร reuse class pattern นี้ ถ้าต้องใช้ class เฉพาะ module ให้ตั้งชื่อ `<module>-list-table` และ scope ภายใต้ class นั้น ห้าม override class ของ protected screens

### Empty result

- แสดง empty state ในพื้นที่ list เดิม
- Reset ต้องยังเข้าถึงได้เมื่อ empty เกิดจาก search/filter
- อย่าใช้ modal เพื่อบอกว่าไม่พบข้อมูลใน list

---

## Status Badge And Chips

ใช้ pill/chip สำหรับ status, priority, auth method, tag และ context metadata

**มาตรฐาน:**

- Pill เป็น rounded capsule พร้อม border อ่อน
- ความสูงประมาณ 25px
- Font 12px หนา 700
- สีต้องสื่อความหมายสม่ำเสมอ

**Color semantics:**

| Color | Use |
| --- | --- |
| Red | High priority, destructive/risk, banned, failed |
| Amber | Medium priority, waiting, warning, partial |
| Green | Active, completed, published, success |
| Blue | Informational, normal operational state |
| Purple | Review, pending, moderated context, System tag |
| Teal | Custom tag, custom-defined entity |
| Gray/Slate | Inactive, archived, read-only, neutral state |
| Charcoal | Invalidated, permanently unavailable state |

**ห้ามสร้างสีใหม่** สำหรับ status เดิมถ้ามี semantic ที่ใช้อยู่แล้วใน prototype

---

## Detail Page

Detail page มาตรฐานต้องมี:

- Header ของ entity พร้อม ID/name, status/context badges และ back action
- Section แยกตามงานจริง ไม่รวมทุกอย่างเป็น card เดียว
- Detail tiles สำหรับ key/value สำคัญ
- Grid 2 columns หรือ 4 columns เฉพาะเมื่อข้อมูลสั้นและอ่านเร็ว
- History/audit ใช้ table layout เดียวกัน
- Warning/impact note อยู่ใกล้ action ที่เกี่ยวข้อง
- Sensitive data ต้อง masked หรือ read-only ตาม module policy

**Detail section ที่ควรมีตามชนิด module:**

- User: account summary, auth/login context, asset/social summary, status history, action area
- Asset: asset summary, FO preview, listing/owner context, description/spec, purchase/sale/history, moderation/comments
- Report: report summary, reporter history, evidence/context, linked entity, audit/result history, status action area
- Offer: offered asset, buyer/owner summary, offer history, related context, read-only note
- Content: article metadata, rendered content, preview, publish state, editor entry/action
- Market: brand/model/reference detail, sync/source metadata, affected FO surfaces, audit/history

> **Offer Management V1 เป็น read-only** ห้ามเพิ่ม write actions (accept, decline, cancel, force-expire, invalidate, edit price, edit message) เว้นแต่มี approval แยก

### Drill-in From Group List (Option Master pattern)

ถ้า detail เป็น list ของ child entity ทั้งหมด ให้แสดงในตารางเดียว ไม่ต้องเปิด detail รายตัว:

- Breadcrumb: `การดำเนินงาน / <module> / <parent>`
- Page title: `<parent>`
- Back button: `Back to <parent list>`
- Panel title: `<child> (<count>)` — ไม่รวม parent name เพราะอยู่ใน page title/breadcrumb แล้ว
- Page action: `Add <child>` และ `Reorder` (เฉพาะ active entity ≥2)
- ไม่แสดง parent summary section แยกต่างหาก ถ้าข้อมูลแสดงใน panel title/subtitle และตารางแล้ว
- คลิก row ไม่เปิดหน้าใหม่ เพราะ child ทั้งหมดอยู่ในตารางนี้แล้ว — action ทำผ่านปุ่มในคอลัมน์ Action

---

## Modal Popup

ใช้ modal สำหรับ:

- Confirmation ก่อน action ที่กระทบ user/public/status
- Reason input ของ action
- Preview
- Compact detail reference จาก report context
- Action result, blocked state หรือ failure state
- Market sync/import status ที่ต้องคุม state ภายใน flow

**มาตรฐาน modal:**

- Backdrop ปิดทั้ง viewport
- Modal width baseline ประมาณ 560px
- Action modal width baseline ประมาณ 720px
- Max height ต้องไม่เกิน viewport และ body scroll ภายในได้
- Header มี title, optional subtitle/context และ close button 38x38px
- Footer/action area ชิดขวา และใช้ปุ่ม primary/secondary ที่ชัด
- Long editor ไม่ควรอยู่ใน modal หากมี full page editor pattern แล้ว

### Confirmation modal

- Title ต้องบอก action ให้ชัด เช่น `ยืนยันการปิดรายงาน`
- Summary ต้องบอก target และ impact
- Reason/selector ต้องอยู่ก่อนปุ่ม confirm ถ้า action ต้อง audit
- ปุ่มยกเลิกต้องอยู่คู่กับปุ่ม confirm
- Confirm button ใช้ primary style หรือ warning style ตาม risk
- เมื่อ success/error ให้แสดง result feedback ภายใน modal หรือ close แล้ว refresh detail ตาม flow ที่ prototype ใช้

### Add/Edit Modal (Short Form — Option Master pattern)

สำหรับฟอร์มสั้น (5-7 fields) ใช้ modal ตาม prototype pattern (ไม่ใช่ full page):

- Field label ชัด, validation อยู่ใกล้ field
- Stable identifier แสดง read-only ใน mode Edit (พร้อม note อธิบายว่าล็อกหลังสร้าง)
- Auto-generated ID แสดง read-only ใน mode Add (ถ้าต้องแสดง)
- ต้องมี confirmation modal ก่อน save จริง พร้อมสรุปค่าที่จะบันทึก
- ใน mode Edit ต้องแสดง before/after value ใน confirmation modal
- หลัง save สำเร็จ refresh list/detail state แล้วปิด modal
- บันทึก audit ทุกครั้ง

### Deactivate/Reactivate Modal

**Deactivate modal:**

- แสดงชื่อ entity ที่จะ deactivate
- แสดงผลกระทบต่อระบบอื่น (เช่น FO form/filter/Watch Alert)
- ชี้แจงว่า existing data ยังแสดงค่าเดิมตามปกติ
- Reason field (Required) — เหตุผลในการ deactivate
- ปุ่ม `Cancel` และ `Confirm Deactivate` (warning style)
- บันทึก audit พร้อม reason

**Reactivate modal:**

- แสดงชื่อ entity ที่จะ reactivate
- แสดงผลกระทบ (กลับมาแสดงในระบบอื่น)
- ปุ่ม `Cancel` และ `Confirm Reactivate` (primary style)
- บันทึก audit

### Safeguard And Policy-Gated Action

มาตรฐานสำหรับ module ที่มี safeguard/policy:

- Safeguard ต้อง enforce ที่ service layer ด้วย ไม่พึ่งเฉพาะการซ่อนปุ่มใน UI
- ใน action menu ให้ซ่อนปุ่มที่ไม่ผ่าน safeguard ตามมติ BO-OPT-006a; ใน modal ให้ disabled ปุ่ม confirm และแสดง error message อธิบายเหตุผล (ไม่ใช่ tooltip)
- Error message ต้องบอกเหตุผลและ next step ที่ชัดเจน
- Policy ที่ล็อก action ทั้ง UI และ API ต้องระบุใน module spec ว่าเป็น dev operation (seed + migration) ไม่ใช่ BO UI action
- การพยายาม bypass policy ผ่าน API ให้บันทึกเป็น security event ใน audit log กลาง

### Destructive Action With Type-to-confirm

ใช้ type-to-confirm เฉพาะ action ที่ hard delete และไม่ย้อนกลับได้

**เงื่อนไขก่อนเปิดให้ delete ได้:**

1. entity เป็น Inactive แล้ว (ต้อง deactivate ก่อน)
2. ผ่าน safeguard (ไม่มีข้อมูลอ้างอิงอยู่)

**Confirmation modal 1 modal พร้อม type-to-confirm:**

- ชื่อ entity ที่จะ delete
- คำเตือนว่าเป็นการกระทำที่ไม่สามารถย้อนกลับได้
- แสดงจำนวนรายการที่จะถูกลบด้วย
- ต้องพิมพ์ identifier ซ้ำเพื่อยืนยัน (type-to-confirm) — ข้อความ: `พิมพ์ <identifier> เพื่อยืนยันการลบ`
- ปุ่ม `Cancel` และ `Delete Permanently` (disabled จนกว่าจะพิมพ์ identifier ถูก)

**มาตรฐาน:**

- ใช้ type-to-confirm เฉพาะ action ที่ hard delete และไม่ย้อนกลับได้
- ต้องมีเงื่อนไขก่อน (Inactive + ผ่าน safeguard)
- บันทึก audit ก่อนทำ hard delete (เพื่อคง trail)
- ปุ่ม delete ใน action menu ต้องซ่อน (hidden) ถ้าไม่ผ่านเงื่อนไข ตามมติ BO-OPT-006a

### Reorder Modal (Drag-and-drop + Up/down Fallback)

Reuse pattern ของ Category Display Order ใน `bo-prototype.html`

**โครงสร้าง:**

- Header พร้อมคำอธิบาย `ลากเพื่อปรับลำดับการแสดงผล`
- List ของ active entity เรียงตาม sort_order ปัจจุบัน
- แต่ละ row แสดง: drag handle, identifier + label, index (#1, #2, ...)
- Desktop: HTML5 drag-and-drop
- Touch device: up/down arrow buttons ที่แต่ละ row เป็น fallback
- ปุ่ม `Cancel` และ `บันทึกลำดับ`

**กฎการทำงาน:**

- แสดงเฉพาะ active entity เท่านั้น (inactive ไม่เข้าร่วม reorder)
- แสดงปุ่ม Reorder เฉพาะเมื่อมี active entity ≥2
- หลัง save ระบบคำนวณ sort_order ใหม่แบบ sequential (10, 20, 30, ...)
- บันทึก audit ครั้งเดียวต่อการ save พร้อม before/after sort_order — เฉพาะเมื่อลำดับเปลี่ยนจริง
- ถ้าไม่ได้เปลี่ยนลำดับและกด save ไม่ต้องบันทึก audit และแสดง toast แจ้งว่าไม่มีการเปลี่ยนลำดับ
- การ reorder ไม่กระทบ existing data เพราะเก็บ relation id ไม่ใช่ sort_order

### Audit Log View (Read-only Modal)

เปิดจาก action menu `ดู Audit Log`

**โครงสร้าง:**

- Header: `Audit Log` พร้อม subtitle แสดง entity ID, identifier และ label
- Summary section: แสดง entity ID, identifier, label, status (pill)
- Audit list: เรียงจากใหม่ไปเก่า แต่ละ entry แสดง:
  - Action type (badge พร้อมสีตามประเภท: add เขียว, edit น้ำเงิน, deactivate แดง, reactivate น้ำเงิน, reorder เหลืองอำพัน (amber), delete แดง)
  - Timestamp
  - Actor (admin name + access context)
  - Reason (ถ้ามี — สำหรับ deactivate)
  - Before/after diff (เช่น sort_order เดิม/ใหม่ สำหรับ reorder หรือ field ที่เปลี่ยนสำหรับ edit)
- Empty state: `ยังไม่มีประวัติ audit สำหรับ <entity> นี้`

**กฎ:**

- เป็น read-only view ไม่มี action ใด ๆ
- กรองเฉพาะ action ของ entity ระดับนั้น (เช่น group audit log แสดงเฉพาะ GROUP_* ไม่แสดง OPTION_*)
- ใช้ rendering เดียวกันสำหรับ before/after diff ทุกประเภท action

### Action Menu With Conditional Actions (Option Master pattern)

Action menu (`...` menu ที่คอลัมน์ Action) ที่เปลี่ยนรายการตามสถานะและ permission:

- `View` — แสดงเสมอ เปิด detail
- `Edit` — เฉพาะ admin ที่มี write permission
- `Deactivate` — เฉพาะ entity ที่ Active
- `Reactivate` — เฉพาะ entity ที่ Inactive
- `Delete` — เฉพาะ entity ที่ Inactive + ผ่าน safeguard (ถ้าไม่ผ่านให้ซ่อน)
- `ดู Audit Log` — เปิด audit log view ของ entity นั้น

**มาตรฐานสำหรับ module ใหม่:**

- Action menu ใช้ pattern `...` menu เดียวกับ row menu ใน BO prototype
- รายการใน menu เปลี่ยนตามสถานะปัจจุบันของ entity (Active/Inactive)
- Action ที่ไม่ผ่านเงื่อนไขให้ซ่อน (hidden) โดยไม่ต้องแสดง tooltip ตามมติผู้ใช้ BO-OPT-006a
- Action ที่ต้อง write permission ต้องซ่อนถ้าไม่มีสิทธิ์
- Row click และเมนู `View` ต้องเปิด detail เดียวกัน

### Stable Identifier Lock (Option Master pattern)

สำหรับ module ที่มี stable identifier:

- ในหน้า Add ให้กรอก identifier ได้ (editable, required) พร้อม validation format + uniqueness
- ในหน้า Edit แสดง identifier เป็น read-only พร้อม note อธิบายว่าล็อกหลังสร้างเพราะเป็น stable identifier ที่ระบบอื่นอ้างอิง
- ถ้า admin พิมพ์ผิดตอนสร้าง ให้ deactivate + สร้างใหม่ แทนการแก้ identifier
- Auto-generated ID (เช่น `group_id`, sequence ID) ไม่ต้องแสดงในฟอร์ม หรือแสดงเป็น read-only

---

## Forms And Editors

ใช้ Content Management article/category เป็น baseline สำหรับ form/editor:

- Field label ชัด
- Required/validation อยู่ใกล้ field
- Long content editor ใช้ full page หรือ dedicated editor layout
- Preview ใช้ modal เฉพาะ preview surface
- Submit/cancel ต้องมี confirmation เมื่อมี public impact หรือ unsaved changes
- Save/create/update ต้อง refresh detail/list state อย่างชัดเจน

> **สำหรับ module ใหม่** ห้ามใช้ modal เป็น full editor ยาวถ้า form มีหลาย section, upload, block builder หรือ preview หลาย surface — ใช้ full page editor แทน

---

## Navigation And Context

ทุกจุดที่คลิกได้ต้องไป destination ที่สัมพันธ์กับข้อมูลโดยตรง:

- Dashboard card/chip/queue/activity ต้องเปิด module/submodule ที่เกี่ยวข้อง
- List row เปิด detail ของ entity นั้น
- Report detail link เปิด linked user/asset/content ด้วย back context ที่กลับมารายงานเดิมได้
- Market drilldown ต้องรักษา brand/model/reference context
- Offer detail `View Asset` ต้องเปิด asset context แบบ read-only/drill-in ตาม prototype

**ห้ามคลิกแล้วไม่เกิดผล** โดยไม่มี disabled state หรือ unavailable explanation ที่ชัดเจน

---

## Loading Empty Error States

ทุก module ต้องมี state เหล่านี้:

| State | Required behavior |
| --- | --- |
| Loading | แสดง skeleton/loading ในพื้นที่ที่จะมี content |
| Empty no data | แสดง empty state ใน panel/list/detail area |
| Empty after search/filter | แสดง empty state และคง reset ให้ใช้ได้ |
| Partial error | เฉพาะ section ที่ error ต้องมี message/retry โดย section อื่นยังใช้ได้ |
| Full error | แสดง error ทั้งหน้าเมื่อโหลดข้อมูลหลักไม่ได้ |
| Unauthorized | ซ่อน section หรือแสดง state ตาม permission policy โดยไม่เปิด sensitive detail |
| Stale data | แสดง freshness/warning เมื่อข้อมูลอาจไม่ล่าสุด |
| Blocked action | แสดงเหตุผลและ next step ไม่ให้ confirm ต่อแบบเงียบ ๆ |

---

## Responsive Standard

ต้องตรวจอย่างน้อย 4 viewport:

- Mobile: 390px
- Tablet: 768px
- Laptop: 1280px
- Desktop: 1440px

**Breakpoint behavior:**

- Mobile: 1 column, stacked cards, inline collapsed filters, vertical detail sections
- Tablet: 1 column shell เป็นหลัก, filter grid compact, table scroll เฉพาะจำเป็น
- Desktop: ใช้ summary grid (เฉพาะหน้าที่มี KPI cards), list/detail split เฉพาะหน้าที่ตัดสินใจมี side panel ตามเกณฑ์, otherwise full-width panel

> **Breakpoint หลักของ table-to-card:** `max-width: 760px` (ดู `docs/responsive-table-standard.md`)

**ทุก viewport ต้องตรวจ:**

- Text ไม่ทับกัน
- Button label ไม่ล้น
- Select label ellipsis ได้
- KPI card ไม่ดันความสูงผิดจังหวะ
- Modal สูงไม่เกิน viewport
- Detail/history table scroll เฉพาะ container
- Header/back/action ไม่ซ้อนกับ title

---

## Language Conventions

- UI copy (button labels, headings, tooltips, toast/error messages, empty states) เป็น **ไทย** ตาม prototype ที่ล็อกแล้ว
- คำที่เป็น technical term / product name / status / command / code identifier คงเป็น English ถ้าเป็น convention ในไฟล์ (เช่น `Active`, `Inactive`, `Pending`, `Closed`)
- คอมเมนต์ในโค้ดใช้ภาษาเดียวกับคอมเมนต์ข้างเคียงในไฟล์ ถ้าไฟล์ยังไม่มีคอมเมนต์ ใช้ไทยสำหรับ intent ที่ user-facing และ English สำหรับ technical note
- Match tone/register ของ copy ข้างเคียง ไม่ใช้ภาษาเด่นโดดเด่น

---

## Module Application Checklist

ใช้ checklist นี้ก่อนเริ่มปรับ module ใหม่:

- [ ] ระบุว่า module เป็น list-only, list+detail, report queue, editor หรือ dashboard-like
- [ ] เลือก source pattern จาก completed module ที่ใกล้ที่สุด (ดูตารางใน section Module Application Workflow)
- [ ] กำหนด search field หลัก
- [ ] กำหนด filter options และเรียงตามมาตรฐานกลาง
- [ ] กำหนด sort options และ default sort
- [ ] ตัดสินใจว่าจะมี KPI/summary cards หรือไม่ ตามเกณฑ์ "When To Use" / "When NOT To Use" — ถ้าไม่มี operational workload หรือข้อมูลซ้ำซ้อนกับตาราง ให้ตัดออก
- [ ] ตัดสินใจว่าจะมี side panel / list-detail split หรือไม่ ตามเกณฑ์ "When To Use" / "When NOT To Use" — ถ้าหน้า list/detail ทั่วไปที่ใช้ drill-in pattern ให้ใช้ full-width panel อย่างเดียว
- [ ] กำหนด list desktop columns และ mobile card metadata
- [ ] กำหนด detail sections และ action placement
- [ ] กำหนด modal/confirm/result states
- [ ] กำหนด empty/loading/error/unauthorized states
- [ ] ตรวจ permission และ audit requirement ของทุก action
- [ ] ตรวจ FO sync impact ถ้า action เปลี่ยน visibility/status/content/public data
- [ ] ตรวจ protected-screen impact ก่อนแก้ shared code

---

## QA Checklist

Manual QA สำหรับ module ที่นำมาตรฐานนี้ไปใช้:

- [ ] Search ทำงานและกลับ page 1
- [ ] Filter ทำงานครบทุก option
- [ ] Sort ทำงานหลัง search/filter
- [ ] Reset ล้าง search/filter/sort และกลับ page 1
- [ ] Empty state แสดงถูกเมื่อไม่มีข้อมูลและเมื่อ filter ไม่พบข้อมูล
- [ ] KPI/summary cards แสดงจำนวนและ empty value ถูก (ถ้ามี)
- [ ] Row/card เปิด detail ถูก entity
- [ ] Breadcrumb/back navigation กลับ context เดิม
- [ ] Detail sections ไม่ซ้อน ไม่ตัดข้อมูลสำคัญ
- [ ] Modal เปิด/ปิด/focus/scroll ได้
- [ ] Confirm modal มี target, impact, reason และ result state ที่ถูกต้อง
- [ ] Permission-disabled action ไม่เปิด mutation flow
- [ ] History/audit table อ่านได้บน desktop และ scroll ได้บน mobile
- [ ] ตรวจ 390px, 768px, 1280px, 1440px
- [ ] ตรวจว่า protected screens ไม่ถูกเปลี่ยนโดยไม่ได้รับอนุมัติ

---

## Scope Boundaries

มาตรฐานนี้ใช้สำหรับสร้าง/ปรับ module อื่นในอนาคต **ไม่ใช่คำสั่งให้ refactor prototype ที่ล็อกแล้ว**

**ห้ามทำในงานที่อ้าง skill นี้:**

- เปลี่ยน Dashboard/User/Asset/Offer/Content/Market/Option Master behavior โดยไม่มี explicit approval
- เปลี่ยน navigation/menu/route/shared shell ที่กระทบ protected screens
- เพิ่ม write action ใน Offer Management V1
- เปลี่ยน status/filter copy ที่ยืนยันแล้วโดยไม่มี requirement ใหม่
- ใช้ pattern แบบ marketing/landing page กับ BO operational screens
- สร้าง palette สีเฉพาะ module ที่ไม่เข้ากับ semantic กลาง
- แก้ skill ที่มีอยู่ (mission-planning, work-summary, senior-frontend, frontend-design)

---

## ตัวอย่างการเรียกใช้สำหรับ module ใหม่

### ตัวอย่าง 1: สร้าง module ใหม่ "Notifications" (list-only)

> User: "ช่วยออกแบบหน้าจอ Notifications module ใหม่ ตามมาตรฐาน BO"

**ผู้ใช้ควร invoke skill นี้ แล้ว AI ทำตามลำดับ:**

1. อ่าน source of truth (PROTECTED_SCREENS.md, BO_UI_UX_STANDARD.md, responsive-table-standard.md, 00_GLOBAL_RULES_MODULE.md)
2. ระบุประเภท: **list-only** (admin ดู/จัดการ notification log)
3. เลือก source pattern: ใกล้ที่สุดคือ User List (list-only + filter + status badge)
4. ทำ Module Application Checklist:
   - Search field หลัก: ค้นตาม title/recipient
   - Filter: ทุกสถานะ (Sent, Failed, Pending), ทุกประเภท (System, Marketing, Transactional)
   - Sort: ล่าสุดก่อน / เก่าสุดก่อน
   - KPI cards: **ไม่มี** เพราะเป็น list-only ที่ข้อมูลซ้ำซ้อนกับตาราง (ตามเกณฑ์ "When NOT To Use")
   - Side panel: **ไม่มี** เพราะใช้ drill-in pattern (ตามเกณฑ์ "When NOT To Use")
   - Detail: drill-in pattern — คลิก row เปิด Notification Detail page พร้อม back
   - Modal: confirmation modal สำหรับ resend/retry notification ที่ failed
   - States: loading skeleton, empty state, partial/full error, unauthorized
   - Permission: admin ที่มี notification.write ส่ง/resend ได้ นอกนั้น read-only
   - Audit: บันทึกทุก send/resend
5. ออกแบบ page structure ตาม section Page Structure
6. ออกแบบ list table + mobile card ตาม section List Table And Mobile Cards และ `docs/responsive-table-standard.md`
7. ออกแบบ status badge ตาม section Status Badge And Chips (Sent=เขียว, Failed=แดง, Pending=ม่วง)
8. ตรวจ QA Checklist ก่อนส่งมอบ
9. ตรวจ protected-screen impact — ถ้าต้องแก้ shared CSS ให้หยุดและขอ approval ก่อน

### ตัวอย่าง 2: สร้าง module ใหม่ "Admin Settings > Roles" (master data + reorder + audit)

> User: "สร้างหน้าจอจัดการ Roles ใหม่ คล้าย Option Master"

**ผู้ใช้ควร invoke skill นี้ แล้ว AI ทำตามลำดับ:**

1. อ่าน source of truth (เน้น `17_OPTION_MASTER_MODULE.md` เป็น pattern source)
2. ระบุประเภท: **master data management + reorder + audit**
3. เลือก source pattern: **Option Master** (เหมือนกันเกือบทุก pattern)
4. ทำ Module Application Checklist:
   - KPI cards: **ไม่มี** (ตามเกณฑ์ master data ที่ข้อมูลซ้ำซ้อนกับตาราง)
   - Side panel: **ไม่มี** (drill-in pattern)
   - Stable identifier: `role_key` (lowercase snake_case, ล็อกหลังสร้าง)
   - Action menu: View, Edit, Deactivate, Reactivate, Delete (type-to-confirm), ดู Audit Log
   - Add/Edit modal: short form (5-7 fields) พร้อม confirmation modal + before/after
   - Deactivate/Reactivate modal: พร้อม reason + safeguard (ห้าม deactivate ถ้ามี user ใช้ role อยู่)
   - Reorder modal: drag-and-drop + up/down fallback, active entity เท่านั้น, ≥2 ถึงแสดงปุ่ม
   - Audit log view: read-only modal พร้อม action type badge + before/after diff
   - Safeguard: enforce ที่ service layer ด้วย ไม่พึ่งเฉพาะ UI
5. ออกแบบตาม section Option Master pattern ทั้งหมด (Action Menu, Stable Identifier Lock, Add/Edit Modal, Deactivate/Reactivate Modal, Safeguard, Destructive Action, Reorder Modal, Audit Log View, Drill-in From Group List)
6. ตรวจ QA Checklist ก่อนส่งมอบ
7. ตรวจ protected-screen impact

### ตัวอย่าง 3: รีวิว/audit ความสอดคล้อง UI/UX ข้าม module

> User: "รีวิวหน้าจอ Reports & Analytics ว่าสอดคล้องมาตรฐาน BO ไหม"

**ผู้ใช้ควร invoke skill นี้ แล้ว AI ทำตามลำดับ:**

1. อ่าน source of truth
2. เปิด prototype และ/หรือ implementation ของ Reports & Analytics
3. ตรวจทีละ section ของ skill นี้ว่า implementation ตรง pattern ไหม:
   - Page Structure ✓/✗
   - Header And Breadcrumb ✓/✗
   - KPI And Summary Cards ✓/✗ (ถ้ามี KPI ต้องตอบ "ใช่" อย่างน้อย 1 ข้อใน "When To Use")
   - Side Panel ✓/✗ (ถ้ามี side panel ต้องตอบ "ใช่" อย่างน้อย 1 ข้อใน "When To Use")
   - Search Filter Sort Reset ✓/✗
   - List Table And Mobile Cards ✓/✗ (ตรวจ breakpoint 760px ด้วย)
   - Status Badge And Chips ✓/✗
   - Detail Page ✓/✗
   - Modal Popup ✓/✗
   - Forms And Editors ✓/✗
   - Navigation And Context ✓/✗
   - Loading Empty Error States ✓/✗
   - Responsive Standard ✓/✗ (ตรวจ 390/768/1280/1440)
   - Language Conventions ✓/✗
4. สรุปเป็นรายการ findings: จุดที่ผิด + pattern ที่ถูกต้อง + แนะนำวิธีแก้
5. ตรวจ protected-screen impact ก่อนแนะนำการแก้

---

## เครื่องมือที่ใช้คู่กับ skill นี้

- `code_search` / `grep` / `find_file_by_name` — ค้นหา pattern ใน prototype และ module spec
- `read` — อ่าน source of truth (BO_UI_UX_STANDARD.md, responsive-table-standard.md, prototype, module spec)
- `browser_preview` — เปิด prototype เพื่อดู visual จริง (ถ้า server รันอยู่)
- `kanban-tukdaeng` MCP — ดู task/mission context ถ้างานเป็นส่วนหนึ่งของ mission
