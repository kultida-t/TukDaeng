# BO UI/UX Standard

เอกสารนี้เป็นมาตรฐานกลางสำหรับออกแบบและปรับแก้หน้าจอ Back Office module ถัดไป โดยถอด pattern จากหน้าที่ทำเสร็จและล็อกแล้วใน `../Prototypes/bo-prototype.html`:

- Dashboard
- User Management
- Asset Management
- Offer Management
- Content Management
- Market Data

## Source Of Truth

ให้ใช้ prototype ที่ล็อกแล้วเป็น visual และ interaction source of truth สำหรับงาน UI/UX ของ BO ทุก module ที่จะทำต่อ หากข้อกำหนดในเอกสาร module เฉพาะขัดกับ prototype ที่ยืนยันแล้ว ให้ถาม Product/UX ก่อนเปลี่ยน pattern

เอกสารอ้างอิงหลัก:

- `../PROTECTED_SCREENS.md`
- `../Prototypes/bo-prototype.html`
- `00_GLOBAL_RULES_MODULE.md`
- `02_DASHBOARD_MODULE.md`
- `03_USER_MANAGEMENT_MODULE.md`
- `04_ASSET_MANAGEMENT_MODULE.md`
- `05_CONTENT_BOARD_MODULE.md`
- `06_MARKET_DATA_MODULE.md`
- `09_OFFER_CHAT_MODULE.md`

## Protected Screen Boundary

หน้าที่ใช้เป็นต้นแบบด้านบนเป็น protected screens ห้ามแก้ layout, copy, state, route, menu, mock data, modal, filter, detail, action flow หรือ shared helper/style ที่กระทบหน้าพวกนี้ เว้นแต่ผู้ใช้อนุมัติชื่อหน้าจอและ scope ที่จะแก้อย่างชัดเจน

เมื่อนำมาตรฐานนี้ไปใช้กับ module อื่น:

- อ่าน prototype เป็น reference ได้
- reuse pattern ใน module ใหม่ได้
- ห้ามแก้ `Prototypes/bo-prototype.html` เพื่อ "ทำมาตรฐาน" โดยไม่ได้รับอนุมัติ
- ถ้าต้องแก้ shared CSS/helper/route ที่ใช้ร่วมกับ protected screens ให้หยุดและขอ approval ก่อน

## Page Structure

หน้าจอ BO module มาตรฐานต้องเรียงโครงสร้างดังนี้:

1. Sidebar/module navigation ตาม grouping ที่ยืนยันแล้ว
2. Top page header พร้อม breadcrumb, page title, optional page meta และ optional page action
3. Summary/KPI cards เฉพาะหน้าที่มีข้อมูลภาพรวมจริง
4. Main panel สำหรับ list/table/card หรือ detail content
5. Filter/search toolbar ภายใน panel สำหรับหน้ารายการ
6. Pagination footer สำหรับ list ที่แบ่งหน้า
7. Detail page, drawer-like modal, preview modal หรือ confirmation modal ตาม flow ของ module

มาตรฐาน visual density:

- Page title ใหญ่เฉพาะ header หลัก
- Panel title ใช้ขนาดเล็กและกระชับกว่า page title
- Card และ panel ใช้ radius ประมาณ 7-8px
- ใช้ border, shadow และ spacing แบบ operational dashboard ไม่ใช่ landing page
- ห้ามซ้อน card ภายใน card หากไม่ใช่ item ซ้ำ, modal หรือ framed tool ที่จำเป็นจริง

## Header And Breadcrumb

ทุกหน้า module ต้องมี breadcrumb ที่บอกตำแหน่งในระบบ เช่น `การดำเนินงาน / User Management / User List`

Page header ต้องมี:

- Page title สั้นและตรงกับเมนูหรือ flow ปัจจุบัน
- Page meta เฉพาะเมื่อมีข้อมูล freshness/context ที่ช่วยตัดสินใจ เช่น `Last updated`
- Page action ด้านขวาเฉพาะ action ที่เป็น primary entry point ของหน้านั้น

Detail page ต้องมี back action ที่รักษา context เดิม เช่น กลับจาก detail ไป list พร้อม filter/search ที่ยังอยู่เท่าที่ flow รองรับ

## KPI And Summary Cards

ใช้ KPI/summary cards เมื่อต้องสรุปสถานะระดับ module หรือ operational workload เท่านั้น

มาตรฐาน card:

- แสดงเป็น grid เหนือ main panel
- Desktop ใช้ 4 cards ต่อแถวเป็น baseline
- Offer Management ใช้ status summary แบบ 6 cards ได้ตาม prototype
- Card ต้องมี label, value, optional icon/accent, trend/detail text และ optional chips
- Accent สีต้องช่วยแยกสถานะ ไม่ทำให้ทั้งหน้าเป็น palette สีเดียว
- Empty KPI ให้แสดง `0` หรือข้อความ empty ที่อ่านเข้าใจ ไม่ปล่อยช่องว่าง

การใช้งาน:

- Dashboard ใช้ KPI เป็นภาพรวมระบบและ queue summary
- User/Asset/Content/Market ใช้ summary cards เพื่อบอกจำนวนตาม status หรือ workload
- Offer ใช้ status cards เพื่อแยก lifecycle เช่น Pending/Paused/Accepted/Rejected/Cancelled/Invalidated
- ห้ามใส่ KPI ที่เป็น vanity metric หรือข้อมูลที่คลิกต่อไม่ได้ถ้าไม่ได้ช่วยงาน admin

## Search Filter Sort Reset

หน้ารายการทุกหน้าต้องใช้ toolbar pattern เดียวกัน:

- Search เป็น control แรกเสมอ
- Filter และ sort อยู่ใน inline filter bar เดียวกัน
- Reset อยู่ท้าย toolbar เป็น icon button หรือ icon+hidden accessible label ตามพื้นที่
- Advanced filters บน mobile ต้อง collapse inline ภายใน list area ไม่ใช้ drawer หรือ bottom sheet
- Search/filter/sort เปลี่ยนแล้วต้องกลับไป page 1
- เปลี่ยน page ต้องคง search/filter/sort เดิม
- Reset ต้องล้าง search, filter, sort และกลับไป page 1

ขนาด control:

- Search และ custom select ใน filter bar สูง 48px
- Radius ประมาณ 7px
- Select label ต้อง ellipsis ได้ ไม่ดัน layout
- Reset icon button ใช้ขนาดประมาณ 42x48px เมื่ออยู่ใน filter grid

Copy กลาง:

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

Option ordering ที่เป็นมาตรฐาน:

- Report status: ทุกสถานะ, Pending, Closed
- Priority: ทุก Priority, High, Medium, Low
- Auth method: ทุกวิธีเข้าสู่ระบบ, Email, Google, Apple
- Asset status: ทุกสถานะ, Sale, Sale + Consignment, Show, Hide, Sold, ซ่อนชั่วคราว, ซ่อนถาวร, ลบโดยเจ้าของ
- Article status: ทุกสถานะ, Draft, Scheduled, Published, Archived
- Category status: ทุกสถานะ, Active, Inactive
- Market sync status: ทุกสถานะ, กำลังทำงาน, ล้มเหลว, สำเร็จบางส่วน, สำเร็จ
- Offer status: ทุกสถานะ แล้วเรียงตาม lifecycle ของ offer ใน prototype/module spec

## List Table And Mobile Cards

Desktop list:

- ใช้ dense table/grid
- Header row ต้องแสดงชัด
- Primary identity อยู่ฝั่งซ้าย
- Status/context badge อยู่คอลัมน์ status หรือ metadata area
- Actions อยู่คอลัมน์ขวาสุด
- Row click หรือ View action เปิด detail ที่เกี่ยวข้อง
- Horizontal scroll ทำได้เฉพาะใน table container เมื่อคอลัมน์บีบไม่ได้จริง

Mobile list:

- แสดงเป็น stacked cards
- ซ่อน table header
- ทุก metadata สำคัญต้องมี label หรือ visual hierarchy ที่เข้าใจได้โดยไม่มี header
- Status/context badge ต้องยังเห็นชัด
- Action ที่ desktop ทำได้ต้องเข้าถึงได้บน mobile ตาม permission
- Text ต้อง wrap/ellipsis อย่างปลอดภัยและไม่ซ้อนกับปุ่ม

Empty result:

- แสดง empty state ในพื้นที่ list เดิม
- Reset ต้องยังเข้าถึงได้เมื่อ empty เกิดจาก search/filter
- อย่าใช้ modal เพื่อบอกว่าไม่พบข้อมูลใน list

## Status Badge And Chips

ใช้ pill/chip สำหรับ status, priority, auth method, tag และ context metadata

มาตรฐาน:

- Pill เป็น rounded capsule พร้อม border อ่อน
- ความสูงประมาณ 25px
- Font 12px หนา 700
- สีต้องสื่อความหมายสม่ำเสมอ

Color semantics:

| Color | Use |
| --- | --- |
| Red | High priority, destructive/risk, banned, failed |
| Amber | Medium priority, waiting, warning, partial |
| Green | Active, completed, published, success |
| Blue | Informational, normal operational state |
| Purple | Review, pending, moderated context |
| Gray/Slate | Inactive, archived, read-only, neutral state |

ห้ามสร้างสีใหม่สำหรับ status เดิมถ้ามี semantic ที่ใช้อยู่แล้วใน prototype

## Detail Page

Detail page มาตรฐานต้องมี:

- Header ของ entity พร้อม ID/name, status/context badges และ back action
- Section แยกตามงานจริง ไม่รวมทุกอย่างเป็น card เดียว
- Detail tiles สำหรับ key/value สำคัญ
- Grid 2 columns หรือ 4 columns เฉพาะเมื่อข้อมูลสั้นและอ่านเร็ว
- History/audit ใช้ table layout เดียวกัน
- Warning/impact note อยู่ใกล้ action ที่เกี่ยวข้อง
- Sensitive data ต้อง masked หรือ read-only ตาม module policy

Detail section ที่ควรมีตามชนิด module:

- User: account summary, auth/login context, asset/social summary, status history, action area
- Asset: asset summary, FO preview, listing/owner context, description/spec, purchase/sale/history, moderation/comments
- Report: report summary, reporter history, evidence/context, linked entity, audit/result history, status action area
- Offer: offered asset, buyer/owner summary, offer history, related context, read-only note
- Content: article metadata, rendered content, preview, publish state, editor entry/action
- Market: brand/model/reference detail, sync/source metadata, affected FO surfaces, audit/history

Offer Management V1 เป็น read-only ห้ามเพิ่ม write actions เช่น accept, decline, cancel, force-expire, invalidate, edit price หรือ edit message เว้นแต่มี approval แยก

## Modal Popup

ใช้ modal สำหรับ:

- Confirmation ก่อน action ที่กระทบ user/public/status
- Reason input ของ action
- Preview
- Compact detail reference จาก report context
- Action result, blocked state หรือ failure state
- Market sync/import status ที่ต้องคุม state ภายใน flow

มาตรฐาน modal:

- Backdrop ปิดทั้ง viewport
- Modal width baseline ประมาณ 560px
- Action modal width baseline ประมาณ 720px
- Max height ต้องไม่เกิน viewport และ body scroll ภายในได้
- Header มี title, optional subtitle/context และ close button 38x38px
- Footer/action area ชิดขวา และใช้ปุ่ม primary/secondary ที่ชัด
- Long editor ไม่ควรอยู่ใน modal หากมี full page editor pattern แล้ว

Confirmation modal:

- Title ต้องบอก action ให้ชัด เช่น `ยืนยันการปิดรายงาน`
- Summary ต้องบอก target และ impact
- Reason/selector ต้องอยู่ก่อนปุ่ม confirm ถ้า action ต้อง audit
- ปุ่มยกเลิกต้องอยู่คู่กับปุ่ม confirm
- Confirm button ใช้ primary style หรือ warning style ตาม risk
- เมื่อ success/error ให้แสดง result feedback ภายใน modal หรือ close แล้ว refresh detail ตาม flow ที่ prototype ใช้

## Forms And Editors

ใช้ Content Management article/category เป็น baseline สำหรับ form/editor:

- Field label ชัด
- Required/validation อยู่ใกล้ field
- Long content editor ใช้ full page หรือ dedicated editor layout
- Preview ใช้ modal เฉพาะ preview surface
- Submit/cancel ต้องมี confirmation เมื่อมี public impact หรือ unsaved changes
- Save/create/update ต้อง refresh detail/list state อย่างชัดเจน

สำหรับ module ใหม่ ห้ามใช้ modal เป็น full editor ยาวถ้า form มีหลาย section, upload, block builder หรือ preview หลาย surface

## Navigation And Context

ทุกจุดที่คลิกได้ต้องไป destination ที่สัมพันธ์กับข้อมูลโดยตรง:

- Dashboard card/chip/queue/activity ต้องเปิด module/submodule ที่เกี่ยวข้อง
- List row เปิด detail ของ entity นั้น
- Report detail link เปิด linked user/asset/content ด้วย back context ที่กลับมารายงานเดิมได้
- Market drilldown ต้องรักษา brand/model/reference context
- Offer detail `View Asset` ต้องเปิด asset context แบบ read-only/drill-in ตาม prototype

ห้ามคลิกแล้วไม่เกิดผลโดยไม่มี disabled state หรือ unavailable explanation ที่ชัดเจน

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
| Blocked action | แสดงเหตุผลและ next step ไม่ให้ confirm ต่อแบบเงียบๆ |

## Responsive Standard

ต้องตรวจอย่างน้อย:

- Mobile: 390px
- Tablet: 768px
- Laptop: 1280px
- Desktop: 1440px

Breakpoint behavior:

- Mobile: 1 column, stacked cards, inline collapsed filters, vertical detail sections
- Tablet: 1 column shell เป็นหลัก, filter grid compact, table scroll เฉพาะจำเป็น
- Desktop: ใช้ summary grid, list/detail split เฉพาะหน้าที่ต้องมี side detail, otherwise full-width panel

ทุก viewport ต้องตรวจ:

- Text ไม่ทับกัน
- Button label ไม่ล้น
- Select label ellipsis ได้
- KPI card ไม่ดันความสูงผิดจังหวะ
- Modal สูงไม่เกิน viewport
- Detail/history table scroll เฉพาะ container
- Header/back/action ไม่ซ้อนกับ title

## Module Application Checklist

ใช้ checklist นี้ก่อนเริ่มปรับ module ใหม่:

- ระบุว่า module เป็น list-only, list+detail, report queue, editor หรือ dashboard-like
- เลือก source pattern จาก completed module ที่ใกล้ที่สุด
- กำหนด search field หลัก
- กำหนด filter options และเรียงตามมาตรฐานกลาง
- กำหนด sort options และ default sort
- กำหนด KPI/summary cards เฉพาะที่มีประโยชน์ต่อ admin
- กำหนด list desktop columns และ mobile card metadata
- กำหนด detail sections และ action placement
- กำหนด modal/confirm/result states
- กำหนด empty/loading/error/unauthorized states
- ตรวจ permission และ audit requirement ของทุก action
- ตรวจ FO sync impact ถ้า action เปลี่ยน visibility/status/content/public data
- ตรวจ protected-screen impact ก่อนแก้ shared code

## QA Checklist

Manual QA สำหรับ module ที่นำมาตรฐานนี้ไปใช้:

- Search ทำงานและกลับ page 1
- Filter ทำงานครบทุก option
- Sort ทำงานหลัง search/filter
- Reset ล้าง search/filter/sort และกลับ page 1
- Empty state แสดงถูกเมื่อไม่มีข้อมูลและเมื่อ filter ไม่พบข้อมูล
- KPI/summary cards แสดงจำนวนและ empty value ถูก
- Row/card เปิด detail ถูก entity
- Breadcrumb/back navigation กลับ context เดิม
- Detail sections ไม่ซ้อน ไม่ตัดข้อมูลสำคัญ
- Modal เปิด/ปิด/focus/scroll ได้
- Confirm modal มี target, impact, reason และ result state ที่ถูกต้อง
- Permission-disabled action ไม่เปิด mutation flow
- History/audit table อ่านได้บน desktop และ scroll ได้บน mobile
- ตรวจ 390px, 768px, 1280px, 1440px
- ตรวจว่า protected screens ไม่ถูกเปลี่ยนโดยไม่ได้รับอนุมัติ

## Scope Boundaries

มาตรฐานนี้ใช้สำหรับสร้างหรือปรับ module อื่นในอนาคต ไม่ใช่คำสั่งให้ refactor prototype ที่ล็อกแล้ว

ห้ามทำในงานที่อ้างเอกสารนี้:

- เปลี่ยน Dashboard/User/Asset/Offer/Content/Market behavior โดยไม่มี explicit approval
- เปลี่ยน navigation/menu/route/shared shell ที่กระทบ protected screens
- เพิ่ม write action ใน Offer Management V1
- เปลี่ยน status/filter copy ที่ยืนยันแล้วโดยไม่มี requirement ใหม่
- ใช้ pattern แบบ marketing/landing page กับ BO operational screens
- สร้าง palette สีเฉพาะ module ที่ไม่เข้ากับ semantic กลาง
