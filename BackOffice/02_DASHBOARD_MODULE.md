# 02 BO Dashboard Module

**Version:** `BO-02-v1.0`  
**Date:** 2026-07-31  
**Status:** สเปกปัจจุบัน  
**Platform:** Responsive Web Back Office

## UI Standards And Prototype Reference

เอกสารนี้ต้องใช้ร่วมกับ `00_GLOBAL_RULES_MODULE.md` และยึดรูปแบบหน้าจอ/พฤติกรรมที่ยืนยันแล้วใน `../Prototypes/bo-prototype.html` เป็นมาตรฐานหลัก

ห้ามออกแบบ pattern แยกเองสำหรับ list toolbar, breakpoint, table/card layout, pagination, reset, action menu, detail layout หรือ confirmation modal ยกเว้นเอกสารนี้ระบุไว้ชัดเจนว่าเป็น override ที่อนุมัติแล้ว

## 1. Document Information

| Field | Detail |
| --- | --- |
| Module Name | BO Dashboard |
| Platform | Responsive Web Back Office |
| Version | `BO-02-v1.0` |
| Status | สเปกปัจจุบัน |
| Owner | Product / UX / Engineering / Operations |
| Document Type | Functional PRD |

## 2. Objective

Dashboard เป็นหน้าแรกของ Back Office สำหรับให้ Admin เห็นภาพรวมสถานะระบบ งานที่ต้องจัดการ และเหตุการณ์ล่าสุดที่ควรติดตามต่อ

หน้าจอนี้ต้องช่วยให้ Admin:

- เห็น KPI สำคัญของระบบอย่างรวดเร็ว
- เห็นคิวงานที่ต้องจัดลำดับความสำคัญ
- เปิดไปยัง module/submodule ที่เกี่ยวข้องได้โดยตรง
- เห็นความสดใหม่ของข้อมูลผ่าน `Last updated`
- ใช้งานได้ครบทั้ง desktop, tablet และ mobile-width browser

## 3. Scope

### In Scope

- Dashboard header
- KPI summary cards
- Work Queue
- Recent Activity feed และ category filter
- Dashboard status panels
- Direct navigation จาก card, chip, queue row, activity row และ panel row
- Empty, loading, partial error, full error และ stale data states
- Responsive layout สำหรับ desktop, tablet และ mobile

### Out Of Scope

- Full analytics report detail
- Custom dashboard builder
- Date range control บน Dashboard
- Manual refresh button บน Dashboard
- Export จาก Dashboard
- Notification popup บน header
- Global search บน header
- Admin view switcher
- Chart-heavy BI dashboard
- Predictive analytics

## 4. Menu Structure

เมนูหลัก: `Dashboard`

Dashboard ไม่มี submenu

พฤติกรรมการนำทาง:

- หลัง login สำเร็จ ให้เปิด `Dashboard` เป็นหน้าแรก
- เมนู `Dashboard` ต้องแสดง active state เมื่ออยู่บนหน้าจอนี้
- Dashboard ต้องไม่มี pagination
- Dashboard ต้องไม่มี list toolbar แบบหน้ารายการ
- การคลิกแต่ละส่วนต้องเปิด module/submodule ปลายทางที่เกี่ยวข้องโดยตรง

## 5. Admin Access And Permissions

ระบบใช้ Admin access เดียว โดยตรวจสิทธิ์ตาม module/action ที่ปลายทาง

กฎทั่วไป:

- Admin ที่เข้า Dashboard ได้สามารถดู KPI, queue, activity และ panels ที่อยู่ในสิทธิ์ของตน
- ถ้าไม่มีสิทธิ์ดูข้อมูลบาง section ให้ซ่อน section หรือซ่อนข้อมูลส่วนนั้น ไม่แสดง error ที่ทำให้ผู้ใช้สับสน
- Link ที่ออกจาก Dashboard ต้องตรวจสิทธิ์ซ้ำที่ route, API และ service layer ของ module ปลายทาง
- ข้อมูล sensitive ต้องแสดงเท่าที่จำเป็นต่อการตัดสินใจบน Dashboard
- Dashboard ห้ามแสดงข้อมูล guest/public analytics เพราะไม่มี User Management drill-in ที่ถูกต้อง

## 6. Responsive Layout

| Breakpoint | ความกว้าง | ข้อกำหนดของ Dashboard |
| --- | --- | --- |
| Mobile | `<= 760px` | แสดงเป็น 1 column ตามลำดับ Header -> KPI Summary -> Work Queue -> Recent Activity -> Dashboard Panels |
| Tablet | `761px - 1365px` | KPI Summary แสดง 2 columns เมื่อพื้นที่พอ และ section หลัก stack เป็น 1 column เมื่อพื้นที่จำกัด |
| Desktop | `> 1365px` | KPI Summary แสดง 4 columns, Work Queue และ Recent Activity อยู่ในแถวเดียวกัน, Dashboard Panels แสดงเป็น grid ด้านล่าง |

ข้อกำหนดเพิ่มเติม:

- ลำดับ section ต้องคงเดิมทุกขนาดหน้าจอ
- Work Queue ต้องอยู่ถัดจาก KPI Summary เสมอ
- Recent Activity ต้องอยู่ถัดจาก Work Queue เสมอ
- Dashboard Panels ต้องอยู่หลัง Recent Activity
- ข้อความ, ตัวเลข, chip, button และ row ต้องไม่ล้นหรือซ้อนกัน
- Card และ row ที่คลิกได้ต้องมี hit area ชัดเจนทั้ง mobile และ desktop

## 7. Header

Dashboard header ต้องแสดง:

- Breadcrumb: `การดำเนินงาน / Dashboard`
- Page title: `Dashboard`
- Data freshness text: `Last updated: <วัน เวลา GMT+7>`

Dashboard header ต้องไม่แสดง:

- Date Range
- Refresh
- Export
- Global search
- Notification popup
- Admin profile
- Admin access switcher
- Summary tags

รูปแบบเวลา:

- แสดง timezone เป็น `GMT+7`
- ใช้เวลาตาม Asia/Bangkok
- ตัวอย่าง: `Last updated: 01 Aug 2026, 14:35 GMT+7`

## 8. KPI Summary Cards

KPI Summary ต้องแสดง 8 cards ตามลำดับนี้:

| Card | Value ตัวอย่าง | Trend / คำอธิบาย | Detail chips | Navigation |
| --- | --- | --- | --- | --- |
| New Users | `128` | `วันนี้เพิ่มขึ้น 8.2% เทียบกับเมื่อวาน` | `Today 128`, `This Week 642`, `This Month 2,840` | เปิด User Management / User Accounts |
| Active Users Today | `8.4K` | `ผู้ใช้งานรายวันเฉลี่ย 7 วันเพิ่มขึ้น 4.1% เทียบกับ 7 วันก่อน` | `Today 8,420`, `This Week 24,700`, `This Month 38,900` | เปิด User Management / User Accounts |
| New Assets | `94` | `สร้างวันนี้ 94 รายการ เทียบกับเมื่อวาน 340 รายการ` | `Sale 64`, `Show 17`, `Hide 9`, `Sold 4` | เปิด Asset Management / Asset List |
| Reported Items | `33` | `มี 9 รายงานใกล้ครบกำหนดตรวจ` | `Assets 22`, `Users 5`, `Articles 3`, `Comments 3` | Chip เปิด queue รายงานตามประเภท |
| Offer Activity | `12` | `อ้างอิงจาก Offer Management mock-up และสถานะ offer ล่าสุด` | `Pending 3`, `Paused 1`, `Accepted 3`, `Rejected 2`, `Cancelled 2`, `Invalidated 1` | เปิด Offer / Offer Queue |
| Articles | `12` | `มี 4 บทความรอเผยแพร่` | `Published 8`, `Scheduled 4` | เปิด Content Management / Articles |
| Watch Alert | `298` | `มีการจับคู่รายการขาย 18 ครั้งวันนี้` | `Active 298`, `Triggered 18` | เปิด Watch Alert / Alert Criteria |
| Policies | `2` | `Privacy Policy มี Draft v2.1-draft รอเผยแพร่` | `Published 2`, `Draft 1` | เปิด Settings / Policy & Versioning |

กฎการแสดง KPI:

- Card ต้องมี label, value, icon, trend text และ detail chips
- Trend text ต้องเป็นข้อความที่อ่านรู้เรื่อง ไม่ใช้เครื่องหมายหรือตัวย่อโดด ๆ เช่น `+8.2%`
- `New Users` และ `Active Users Today` ต้องนับเฉพาะ registered users
- ห้ามนับ guest/public views, public shares หรือ anonymous traffic รวมใน user KPI
- `Reported Items` ใช้ chip ย่อยเป็น navigation หลัก เพราะปลายทางแยกตามประเภท report
- ถ้า card ไม่มีข้อมูล ให้แสดง empty value ที่อ่านเข้าใจ เช่น `0` และคำอธิบายที่เหมาะสม

## 9. Work Queue

Work Queue เป็นรายการงานที่ Admin ควรจัดการก่อน ไม่ใช่ metric card

Header:

- Title: `Work Queue`
- Subtitle: `งานที่ต้องจัดการก่อน โดยเรียงจากกำหนดงานและผลกระทบผู้ใช้`

Work Queue ต้องแสดงเป็น action list โดยแต่ละ row มี:

- Priority color bar ด้านซ้าย
- Queue title
- Detail text ภาษาไทยแบบกระชับ
- Chips แสดงสถานะหรือจำนวนย่อยที่เกี่ยวข้องกับ queue นั้น
- Count ด้านขวา
- Chevron แสดงว่าเปิดต่อได้

รายการ Work Queue ต้องแสดงตามลำดับนี้:

| ลำดับ | Queue title | Count ตัวอย่าง | Priority | Detail text | Chips | Navigation |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | รายงานสินทรัพย์ | `22` | High | `รายการเก่าสุดรอตรวจ 22 ชม. / เหตุผลหลัก: รูปซ้ำและข้อมูลประกาศซ้ำ / ควรตรวจวันนี้` | `ใกล้ครบกำหนด 6`, `ผู้ใช้กระทบสูง` | Asset Management / Reported Assets |
| 2 | รายงานผู้ใช้ | `5` | High | `มีรายงานโปรไฟล์ซ้ำและพฤติกรรมขายซ้ำ / ควรตรวจบัญชีที่ถูก report หลายครั้งก่อน` | `ใกล้ครบกำหนด 3`, `ตรวจประวัติ login` | User Management / Reported Users |
| 3 | รายงานบทความ | `3` | High | `มีรายงานบทความจาก FO Board รอตรวจ / ตรวจเหตุผลและสถานะบทความก่อนปิดรายงานหรือ archive` | `Articles 3`, `รอตรวจ` | Content Management / Reported Articles |
| 4 | คำขอลบบัญชี | `8` | Medium | `มี 2 คำขอที่ยังลบไม่ได้ เพราะมีข้อเสนอซื้อค้างอยู่` | `Blocked 2`, `Grace period 4` | Account Deletion / Requests |
| 5 | บทความรอเผยแพร่ | `4` | Normal | `บทความ Board ตั้งเวลาเผยแพร่แล้ว / ตรวจ preview และรูป cover ก่อนถึงเวลา` | `เผยแพร่วันนี้ 2`, `ต้อง preview` | Content Management / Articles |
| 6 | ข้อมูลตลาดรอตรวจ | `6` | Normal | `brand, model และ price index จาก sync มีข้อมูลซ้ำ / ควรตรวจ Sync History ก่อนใช้กับ Search และ Watch Alert` | `Sync issue 6`, `Price index` | Market Data / Sync History |
| 7 | แจ้งเตือนส่งไม่สำเร็จ | `92` | Normal | `มี token หมดอายุและงานส่งซ้ำได้ / ตรวจ retry queue และ cleanup invalid token` | `Retryable 81`, `Cleanup 11` | Notifications / Delivery Logs |

กฎการจัดลำดับ:

- งานที่ใกล้ครบกำหนดหรือกระทบผู้ใช้สูงต้องอยู่ก่อน
- Priority high ใช้สีแดง
- Priority medium ใช้สี amber
- Priority normal ใช้สี blue หรือ neutral accent
- ห้ามใช้คำ technical `SLA` ใน UI ให้ใช้คำว่า `ใกล้ครบกำหนด`, `ครบกำหนดตอบ`, `กำหนดตอบครั้งแรก` หรือข้อความที่ผู้ใช้เข้าใจได้

## 10. Recent Activity

Recent Activity แสดงเหตุการณ์ล่าสุดที่ Admin ควรรู้หรือต้องติดตามต่อ

Header:

- Title: `Recent Activity`
- Filter buttons: `ทั้งหมด`, `Report`, `Offer`, `Content`, `System`

Activity row ต้องมี:

- Event title ภาษาไทย
- Summary หนึ่งประโยค
- Relative timestamp ภาษาไทย
- Chevron แสดงว่าเปิดต่อได้
- Direct navigation ไป module/submodule ที่เกี่ยวข้อง

รายการตัวอย่างที่ต้องรองรับ:

| Category | Event title | Summary | Time | Navigation |
| --- | --- | --- | --- | --- |
| Report | มีรายงานสินทรัพย์ใหม่ | `Rolex Submariner 16610 ถูกรายงานเรื่องรูปซ้ำและราคาเบี่ยงจากข้อมูลตลาด` | `15 นาทีที่แล้ว` | Asset Management / Reported Assets |
| Offer | ข้อเสนอซื้อถูกปฏิเสธ | `ข้อเสนอซื้อ Omega Speedmaster ถูกปฏิเสธและยังมี chat ที่ผู้ใช้ถามต่อ` | `32 นาทีที่แล้ว` | Offer / Offer Queue |
| Content | ตั้งเวลาเผยแพร่บทความแล้ว | `บทความ Vintage Watch Buying Guide ตั้งเวลาเผยแพร่วันนี้ 19:00` | `1 ชม.ที่แล้ว` | Content Management / Articles |
| System | ข้อมูลตลาดอัปเดตแล้ว | `Sync History พบ duplicate price points ของ Omega Speedmaster Reduced 3 แถว` | `2 ชม.ที่แล้ว` | Market Data / Sync History |
| System | แจ้งเตือนบางรายการส่งไม่สำเร็จ | `ระบบพบ invalid token ใน delivery batch ล่าสุดและแยกงาน retry แล้ว` | `3 ชม.ที่แล้ว` | Notifications / Delivery Logs |

กฎการทำงาน:

- Filter `ทั้งหมด` แสดงทุก category
- Filter `Report` แสดง report-related events
- Filter `Offer` แสดง offer-related events
- Filter `Content` แสดง content publishing events
- Filter `System` แสดง market data, notification, watch alert และ audit/system events
- Activity row ต้องไม่เปิด modal กลางบน Dashboard
- Activity row ต้องไม่แสดง audit ID แบบสุ่ม
- Activity row ต้องไม่แสดง badge เช่น `linked` หรือ `ติดตามต่อ`
- ถ้าไม่มี activity ใน filter ที่เลือก ให้แสดง empty state

## 11. Dashboard Panels

Dashboard Panels อยู่ด้านล่าง Recent Activity และต้องใช้งานได้ทุก row

Panel ที่ต้องมี:

| Panel | Header meta | Row content | Navigation |
| --- | --- | --- | --- |
| Asset Status | `จาก Asset List ทั้งหมด` | Status label, description, count | เปิด Asset Management ตาม status/context |
| Offer Status | `จาก Offer Management ทั้งหมด` | Offer status label, description, count | เปิด Offer / Offer Queue |
| Latest Articles | `จาก Articles ล่าสุด` | Article title, publish status, detail | เปิด Content Management / Articles |
| Top Searched Brands | `จาก Search Report สัปดาห์นี้` | Brand, search count, trend, share bar | เปิด Reports / Search |

### 11.1 Asset Status

Rows:

| Label | Value ตัวอย่าง | Detail | Navigation |
| --- | --- | --- | --- |
| Sale | `2,816` | `ยอดทั้งหมดที่แสดงใน Feed และ Search` | Asset Management / Asset List |
| Show | `428` | `ยอดทั้งหมดที่แสดงใน collection และ profile` | Asset Management / Asset List |
| Hide | `76` | `ยอดทั้งหมดที่ owner/Admin เห็นตามสิทธิ์` | Asset Management / Asset List พร้อม context Hide |
| Sold | `214` | `ยอดทั้งหมดที่คงประวัติและปิดรับ offer` | Asset Management / Asset List |

### 11.2 Offer Status

Rows:

| Label | Value ตัวอย่าง | Detail | Navigation |
| --- | --- | --- | --- |
| Pending | `3` | `รอ owner ตอบตามรายการใน Offer Management` | Offer / Offer Queue |
| Paused | `1` | `offer ถูกพักระหว่าง asset รอตรวจสอบ` | Offer / Offer Queue |
| Accepted | `3` | `owner รับ offer แล้วแต่ยังเป็น read-only history` | Offer / Offer Queue |
| Rejected | `2` | `owner ปฏิเสธและเก็บไว้ใน Offer History` | Offer / Offer Queue |
| Cancelled | `2` | `asset ถูกลบหรือซ่อนโดย owner ระหว่าง offer` | Offer / Offer Queue |
| Invalidated | `1` | `asset ถูกซ่อนถาวรและ offer ใช้งานไม่ได้` | Offer / Offer Queue |

### 11.3 Latest Articles

Rows:

| Label | Value ตัวอย่าง | Detail | Navigation |
| --- | --- | --- | --- |
| Vintage Watch Buying Guide | `Scheduled` | `ตั้งเวลาเผยแพร่ 10 Jul 2026 19:00` | Content Management / Articles |
| How to Check Provenance | `Published` | `เผยแพร่แล้วและแสดงบน Board` | Content Management / Articles |
| Market Notes July | `Draft` | `ยังไม่แสดงบน FO / รอรูป cover` | Content Management / Articles |

### 11.4 Top Searched Brands

Rows:

| Brand | Searches | Share | Trend | Navigation |
| --- | --- | --- | --- | --- |
| Rolex | `12.4K` | `32%` | `+6%` | Reports / Search |
| Omega | `8.7K` | `22%` | `+3%` | Reports / Search |
| Seiko | `6.1K` | `16%` | `+9%` | Reports / Search |
| Cartier | `4.2K` | `11%` | `+14%` | Reports / Search |
| Tudor | `3.6K` | `9%` | `+5%` | Reports / Search |

กฎการแสดง Panels:

- Panel title ใช้ภาษาอังกฤษตามชื่อ panel
- Row detail ใช้ภาษาไทยเพื่ออธิบายความหมายเชิงงาน
- Row ที่คลิกได้ต้องมี hover/focus state
- ห้ามแสดง panel `Admin Overview`
- ห้ามแสดง copy ที่เป็น placeholder เช่น `Back Office demo`, `Sample data` หรือ `Next action`
- ถ้าไม่มีข้อมูลใน panel ให้แสดง empty state เฉพาะ panel นั้น

## 12. Direct Navigation

ทุกจุดที่เปิดต่อได้ต้องไปปลายทางที่สัมพันธ์กับเนื้อหานั้นโดยตรง

| Source | Destination |
| --- | --- |
| New Users card | User Management / User Accounts |
| Active Users Today card | User Management / User Accounts |
| New Assets card | Asset Management / Asset List |
| Reported Items / Assets chip | Asset Management / Reported Assets |
| Reported Items / Users chip | User Management / Reported Users |
| Reported Items / Articles chip | Content Management / Reported Articles |
| Reported Items / Comments chip | Asset Management / Reported Comments |
| Offer Activity card | Offer / Offer Queue |
| Articles card | Content Management / Articles |
| Watch Alert card | Watch Alert / Alert Criteria |
| Policies card | Settings / Policy & Versioning |
| Work Queue row | Module/submodule ตาม queue นั้น |
| Recent Activity row | Module/submodule ตาม event นั้น |
| Dashboard Panel row | Module/submodule ตาม row นั้น |

กฎเพิ่มเติม:

- การคลิกต้องไม่ทำให้ context หายโดยไม่จำเป็น
- ถ้าปลายทางรองรับ filter/context ให้ส่ง context ไปพร้อม navigation
- ถ้าปลายทางยังไม่พร้อมใช้งาน ให้แสดง disabled state หรือ empty destination ที่อธิบายได้ชัดเจน ห้ามคลิกแล้วไม่เกิดผล

## 13. Empty / Loading / Error States

| State | ข้อกำหนด |
| --- | --- |
| Loading | แสดง skeleton หรือ loading placeholder สำหรับ KPI, Work Queue, Recent Activity และ Panels |
| Partial Load Error | ถ้าบาง section โหลดไม่ได้ ให้ section อื่นยังใช้งานได้ และแสดง retry เฉพาะ section ที่ผิดพลาด |
| Full Load Error | แสดง error state ทั้งหน้า พร้อมปุ่ม retry dashboard |
| Empty KPI | แสดงค่า `0` หรือข้อความ empty ที่อ่านเข้าใจ ไม่ปล่อยช่องว่าง |
| Empty Queue | แสดงข้อความว่าไม่มีงานค้างใน queue นั้น หรือซ่อน row ที่ไม่มีงานตาม business rule |
| Empty Activity | แสดงข้อความว่าไม่มีเหตุการณ์ใน filter ที่เลือก |
| Empty Panel | แสดง empty state ภายใน panel นั้น |
| Unauthorized Section | ซ่อน section หรือข้อมูลนั้น ไม่แสดง technical error |
| Stale Data | แสดง `Last updated` และ warning ว่าข้อมูลอาจไม่ล่าสุด |

## 14. Data Freshness

Dashboard ต้องแสดง `Last updated` ชัดเจนบน header

| Data Type | Freshness Expectation |
| --- | --- |
| KPI Summary | ใช้ snapshot ล่าสุดของระบบ |
| Work Queue | ควรใกล้ real-time หรืออัปเดตตามรอบ backend |
| Recent Activity | แสดงเหตุการณ์ล่าสุดที่ระบบมี |
| Dashboard Panels | ใช้ snapshot/report summary ล่าสุดของแต่ละแหล่งข้อมูล |

Dashboard ไม่มี manual refresh control ในสเปกปัจจุบัน

## 15. Copy And Visual Rules

Copy rules:

- ใช้ข้อความไทยที่ช่วยตัดสินใจปฏิบัติงาน
- ห้ามใช้ raw backend label เป็นข้อความหลัก เช่น `Oldest 22h`, `blocked by pending offer`, `Security event`
- ห้ามใช้คำ technical `SLA` บน UI
- หลีกเลี่ยงตัวย่อที่ไม่มีคำอธิบาย
- Trend และ queue detail ต้องอ่านรู้เรื่องเมื่ออยู่เดี่ยว ๆ

Visual rules:

- Layout เป็น operational control center ไม่ใช่ analytics report page
- KPI cards ใช้ left accent, icon tile, label, value, trend และ chips
- Work Queue และ Recent Activity ใช้ compact action-list row
- Dashboard Panels ใช้ panel header แยกจาก body และ row ที่กดได้
- Accent color ใช้เพื่อจัดกลุ่มหรือบอก priority เท่านั้น ไม่ใช้แทนข้อความสถานะจริง
- Card shadow และ border ต้องเบา
- UI ต้องไม่ใช้ card ซ้อน card
- ข้อความต้องไม่ล้น container ทั้ง mobile และ desktop

Typography:

- Primary body/UI font: `IBM Plex Sans Thai`
- Heading font: `Bebas Neue`
- Fallback font stack: `IBM Plex Sans Thai`, `Segoe UI`, `Tahoma`, `Arial`, `sans-serif`

## 16. Performance

- Dashboard initial load หลัง auth ควรไม่เกิน 3 วินาทีสำหรับข้อมูลหลัก
- KPI Summary และ Work Queue ต้องโหลดก่อน chart/visual เสริม
- ถ้า section หนักโหลดช้า ต้อง lazy load โดยไม่ block queue สำคัญ
- Responsive render ต้องไม่ทำให้ลำดับ section เปลี่ยน
- Interaction filter ของ Recent Activity ต้องตอบสนองทันทีบนข้อมูลที่โหลดแล้ว

## 17. Acceptance Criteria

| ID | Criteria |
| --- | --- |
| AC-BO-DASH-001 | หลัง login สำเร็จ ระบบเปิด Dashboard เป็นหน้าแรก และเมนู Dashboard แสดง active state |
| AC-BO-DASH-002 | Header แสดง breadcrumb, title และ `Last updated` โดยไม่มี Date Range, Refresh, Export, global search, notification popup หรือ admin switcher |
| AC-BO-DASH-003 | Dashboard แสดง KPI Summary ครบ 8 cards ตามลำดับที่กำหนด |
| AC-BO-DASH-004 | `Reported Items` แสดง chips แยก `Assets`, `Users`, `Board`, `Comments` และแต่ละ chip ไป queue ที่ถูกต้อง |
| AC-BO-DASH-005 | Work Queue แสดงครบ 7 rows ตามลำดับและ priority ที่กำหนด |
| AC-BO-DASH-006 | Work Queue row ทุก row คลิกไป module/submodule ที่เกี่ยวข้องได้ |
| AC-BO-DASH-007 | Recent Activity แสดง filter `ทั้งหมด`, `Report`, `Offer`, `Content`, `System` และ filter ทำงานจริง |
| AC-BO-DASH-008 | Recent Activity row คลิกไป module/submodule ที่เกี่ยวข้องโดยตรง และไม่เปิด modal กลางบน Dashboard |
| AC-BO-DASH-009 | Dashboard Panels แสดงครบ `Asset Status`, `Offer Status`, `Latest Articles`, `Top Searched Brands` |
| AC-BO-DASH-010 | Panel row ทุก row คลิกไป module/submodule ที่เกี่ยวข้องได้ |
| AC-BO-DASH-011 | Dashboard responsive ถูกต้องที่ 375px, 760px, 1024px, 1366px และ 1440px |
| AC-BO-DASH-012 | Mobile แสดงลำดับ Header -> KPI Summary -> Work Queue -> Recent Activity -> Dashboard Panels |
| AC-BO-DASH-013 | Dashboard ไม่แสดง guest/public analytics ใน KPI, queue, activity หรือ panel |
| AC-BO-DASH-014 | Partial load error ไม่ทำให้ทั้ง Dashboard ใช้งานไม่ได้ |
| AC-BO-DASH-015 | Unauthorized section ถูกซ่อนหรือ mask อย่างเหมาะสม |
| AC-BO-DASH-016 | ข้อความ, chip, button, row และ panel ไม่ล้นหรือซ้อนกันในทุก breakpoint |
