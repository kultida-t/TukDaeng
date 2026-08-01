# 02 BO Dashboard Module

**เวอร์ชัน:** `BO-02-v1.0`  
**วันที่:** 2026-07-31  
**สถานะ:** สเปกปัจจุบัน  
**แพลตฟอร์ม:** Responsive Web Back Office


## มาตรฐาน UI และ Prototype อ้างอิง

เอกสารนี้ต้องใช้ร่วมกับ `00_GLOBAL_RULES_MODULE.md` และยึดรูปแบบหน้าจอ/พฤติกรรมที่ยืนยันแล้วใน `../Prototypes/bo-prototype.html` เป็นมาตรฐานหลัก

ห้ามออกแบบ pattern แยกเองสำหรับ list toolbar, breakpoint, table/card layout, pagination, reset, action menu, detail layout หรือ confirmation modal ยกเว้นเอกสารนี้ระบุไว้ชัดเจนว่าเป็น override ที่อนุมัติแล้ว

## 1. วัตถุประสงค์

Dashboard เป็นหน้าแรกของ BO ที่สรุปสถานะระบบและงานที่ Admin ต้องดำเนินการจากข้อมูลที่เกิดบน FO เช่น user ใหม่, asset ใหม่, pending reports, offer activity, watch alert, support ticket, article publishing และ admin activity

Dashboard ต้องช่วยให้ Admin เห็นภาพรวมเร็ว ตัดสินใจได้ว่า queue ไหนต้องจัดการก่อน และกดไปยัง module ที่เกี่ยวข้องได้ทันที

## 2. ขอบเขต

### อยู่ในขอบเขต

- Dashboard overview metrics
- Pending queue summary
- Operational alerts
- Recent activity feed
- policy-based dashboard view
- Responsive dashboard layout
- Drill-in links ไป module ที่เกี่ยวข้อง
- Empty/loading/error states

### นอกขอบเขต

- Full analytics report detail
- Custom dashboard builder
- Real-time BI dashboard ขั้นสูง
- Predictive analytics
- External data warehouse integration

## 3. ผู้ใช้งาน Dashboard

Dashboard ใช้กับบัญชี BO ชนิดเดียวคือ `Admin` และต้องไม่แสดง admin access switcher หรือแยก admin view หลายแบบ

| Admin Account Type | Dashboard Focus |
| --- | --- |
| Admin | System overview, pending queues, activity, support, content, market, notification, report, audit, and security signals according to module/action policy. |
## 4. รูปแบบ Responsive

Dashboard ต้องใช้กฎ responsive กลางจาก `00_GLOBAL_RULES_MODULE.md` และยึดพฤติกรรมที่ยืนยันแล้วใน `../Prototypes/bo-prototype.html`

| Breakpoint | ความกว้าง | ข้อกำหนดของ Dashboard |
| --- | --- | --- |
| Mobile | `<= 760px` | Uses the prototype order: Header -> KPI Summary 1 column -> Work Queue -> Recent Activity -> Dashboard Panels. Work Queue renders as a stacked action list. |
| Tablet | `761px - 1365px` | Uses the prototype responsive shell. KPI Summary renders as 2 columns where space allows, then Work Queue, Recent Activity, and Dashboard Panels. Layout stacks to 1 column when space is limited. |
| Desktop | `> 1365px` | Shows the confirmed dashboard overview with KPI cards, Work Queue and Recent Activity in the prototype desktop arrangement, then Dashboard Panels below. |

ข้อกำหนด:

- Dashboard uses the prototype overview-first sequence across breakpoints so generated implementations do not reorder the experience page by page.
- Work Queue stays immediately after KPI Summary and high-priority items stay at the top of Work Queue.
- Dashboard Panels use the prototype card/panel visual style and responsive grid behavior.
- Card และ action ต้องไม่ซ้อนกัน และต้องกด/คลิกได้ชัดเจน
- Dashboard ต้องยังใช้งานได้ถ้า chart library โหลดไม่สำเร็จ โดย fallback เป็นตัวเลขหรือ table summary

## 5. Header และ Control ของ Dashboard

| Control | ข้อกำหนด |
| --- | --- |
| Header | Dashboard header stays focused on breadcrumb, page title, and `Last updated`; it does not show Date Range, Refresh, Export, global search, notification popup, or summary tags. |
| Data Freshness | `Last updated` is the visible freshness indicator for the current prototype. Manual refresh is not required on the Dashboard screen. |
| ขอบเขตวันที่ | Dashboard ใช้ข้อมูล snapshot ตาม prototype ปัจจุบัน ไม่ต้องมี Date Range บน Dashboard; การวิเคราะห์ตามช่วงวันที่ให้อยู่ใน Reports เมื่อจำเป็น |
| Admin View | Product capability สำหรับ policy-based visibility; current prototype ใช้ admin access เดียว `Admin` และไม่แสดง admin access switcher |
| Drill-in | Metric/queue card ต้องคลิกไป module ที่เกี่ยวข้องพร้อม filter ที่เหมาะสม |
| Export | Dashboard does not expose a direct Export control in the current prototype. Exportable analytics and jobs remain in the Reports module. |

Dashboard ห้ามเพิ่ม control บน header เว้นแต่ prototype ในอนาคตระบุ workflow และตำแหน่งไว้อย่างชัดเจน

## 6. การ์ดตัวชี้วัด

| Metric | Description | Drill-in | access visibility | Phase |
| --- | --- | --- | --- | --- |
| New Users | จำนวน user ใหม่ตาม snapshot/card chips ที่แสดงใน Dashboard | User Management filtered by joined date | Admin | 1 |
| Active Users Today | ผู้ใช้งาน active วันนี้ พร้อม weekly/monthly chips และ trend copy | User Management / User Report | Admin | 1 |
| New Assets | จำนวน asset ใหม่แยก Sale / Show / Hide / Sold | Asset Management filtered by created date/status | Admin | 1 |
| Pending Reports | จำนวน report ที่ยังรอ review | Moderation queue / Asset/User/Comment report filters | Admin | 1/2 |
| Flagged Assets | Asset ที่ถูก flag หรือรอ moderation | Asset Management filtered flagged | Admin | 1 |
| Published Articles | Article published/scheduled/archived ตาม Dashboard snapshot | Content / Board Management | Admin | 1 |
| Active Watch Alerts | จำนวน watch alert active | Watch Alert Management | Admin | 2 |
| Open Support Tickets | Ticket ที่ยัง open/in progress/waiting user | Help & Support | Admin | 2 |
| Offer Activity | Offer made/accepted/rejected/expired | `09_OFFER_CHAT_MODULE.md` | Admin | 2 |
| Notification Delivery | Sent/delivered/opened/failed | Notifications | Admin | 2 |

Dashboard user metric rules:

- `New Users` and `Active Users Today` count registered account records/member activity only.
- Traffic จาก guest/public view/share ห้ามนับรวมใน `New Users` หรือ metric แบบ DAU/MAU ของ registered user
- Dashboard baseline และ prototype ห้ามแสดง KPI, card, panel, chart หรือ drill-in ของ guest/public analytics
- Guest/public analytics belongs only in Reports & Analytics, because Guest is not an account status and has no User Management drill-in.

## 7. สรุปคิวที่รอดำเนินการ

Dashboard ต้องมี queue summary ที่ชี้งานต้องทำ ไม่ใช่แค่ metric

| Queue | Trigger Source | Required Fields | Primary Action | Phase |
| --- | --- | --- | --- | --- |
| Reported Assets | FO Report Asset | Count, oldest age, SLA risk, top reasons | Go to Asset report queue | 1 |
| Reported Users | FO Report User/Profile | Count, oldest age, SLA risk | Go to User report queue | 1 |
| Flagged Assets | BO/System/Report | Count by status, owner, created date | Go to flagged asset list | 1 |
| Scheduled Articles | BO Content | Next publish time, failed publish count | Go to Articles | 1 |
| Market Data Pending Review | BO Market updates | Pending brand/model/price changes if workflow exists | Go to Market Data | 1 |
| Reported Comments | FO Report Comment | Count, oldest age, top reported assets | Go to Social moderation | 2 |
| Reported Chats | FO Report Chat | Count, attachment risk, oldest age | Go to Chat reports | 2 |
| Open Tickets | FO Help | Count by priority/status, SLA risk | Go to Help & Support | 2 |
| Deletion Requests | FO Delete Account | Requested/blocked/ready archive count | Go to Account Deletion | 2 |
| Failed Notifications | System/Broadcast notification | Failed count, retryable count | Go to Notifications | 2 |

SLA baseline:

- Report handling target: ภายใน 24 ชั่วโมง
- Support first response target: ภายใน 8 ชั่วโมง
- Queue card ต้อง highlight เมื่อมี item ใกล้ SLA breach หรือ breached

## 8. กิจกรรมล่าสุด

Activity feed แสดงเหตุการณ์ล่าสุดของระบบและ admin action

รายการขั้นต่ำ:

- User registered
- Asset added
- Asset status changed
- Asset removed/hidden
- Report submitted
- Report resolved
- Article published/scheduled/archived
- Brand/model/price index updated
- Directory item activated/inactivated
- Admin login/security event เฉพาะ Admin
- Admin action ที่เป็น public-impact

Fields:

| Field | ข้อกำหนด |
| --- | --- |
| Timestamp | แสดงเป็น Asia/Bangkok |
| Event Type | เช่น User, Asset, Report, Article, Market Data, Audit |
| Actor | User/System/Admin ตามสิทธิ์ที่เห็นได้ |
| Target | Entity name/ID |
| Summary | ข้อความสั้น อธิบาย event |
| Link | ไป detail หรือ audit record ตาม permission |

## 9. กฎสิทธิ์การเข้าถึง Dashboard

Dashboard visibility is policy-based, not Admin access-based. The current BO baseline has one `Admin` account type and no View-as control.

Rules:

- Show dashboard cards by module/action policy and data sensitivity.
- Hide or mask sensitive values when policy does not allow full detail.
- Link แบบ drill-in ต้องตรวจสิทธิ์ซ้ำที่ module/API ปลายทาง
- If no queue is available for a policy scope, show a useful empty state rather than a blank panel.
## 10. ความสดใหม่ของข้อมูล Dashboard

| Data Type | Freshness Expectation |
| --- | --- |
| Pending queues | ใกล้ real-time หรือ refresh ทุก 1-5 นาทีตาม backend capability |
| Dashboard metrics | แสดง snapshot ล่าสุดของระบบพร้อม `Last updated`; Dashboard ไม่ต้องมี Date Range หรือ Manual Refresh control ใน prototype ปัจจุบัน |
| Activity feed | แสดงล่าสุดเท่าที่ระบบมี พร้อม last updated |
| Reports summary | อาจมี delay ได้ แต่ต้องระบุ last updated |

Dashboard ต้องแสดง `Last updated` ชัดเจน

## 11. ผลกระทบต่อการเชื่อม BO/FO

Dashboard ต้อง reflect integration map หลัก:

| Integration | Dashboard Signal |
| --- | --- |
| `INT-001` Report Asset | Pending reports / reported asset queue |
| `INT-002` Report User | Reported user queue / user risk signal |
| `INT-004` Report Board Content | Content moderation queue |
| `INT-005` New Sale Asset | New assets metric |
| `INT-010` Board Articles | Published/scheduled articles |
| `INT-012` Brand/Model | Market data activity |
| `INT-013` Price Index | Market data / price update activity |
| `INT-015` Offer | Offer activity metric |
| `INT-021` Watch Alert | Active watch alerts / trigger volume |
| `INT-022` Help Request | Open support tickets |
| `INT-023` Account Deletion | Deletion request queue |
| `INT-024` System Notification | Notification delivery status |
| `INT-026` Sensitive Admin Action | Recent admin activity / audit signal |

## 12. สถานะ Error / Empty / Loading

| State | ข้อกำหนด |
| --- | --- |
| Loading | แสดง skeleton สำหรับ metric cards และ queue cards |
| Partial Load Error | ถ้า metric บางชุด load ไม่ได้ ให้ส่วนอื่นยังแสดงได้ พร้อม retry เฉพาะ card/section |
| Full Load Error | แสดง error state พร้อม retry dashboard |
| Empty Queue | แสดงข้อความว่าไม่มีงานค้างใน queue นั้น |
| Unauthorized Section | ไม่แสดง section นั้น แทนการแสดง error |
| Stale Data | แสดง last updated และ warning เมื่อ data เก่าเกิน threshold |

## 13. ข้อกำหนด Performance

- Dashboard initial load หลัง auth ควรไม่เกิน 3 วินาทีสำหรับข้อมูลหลัก
- Section ที่หนัก เช่น trend/report summary สามารถ lazy load ได้
- Mobile ต้องโหลดข้อมูลสำคัญก่อน chart/visual เสริม
- Query dashboard ต้องไม่ block งาน operational queue สำคัญ
- การ render แบบ responsive ต้องคงลำดับตาม prototype: Header -> KPI Summary -> Work Queue -> Recent Activity -> Dashboard Panels

## ข้อยกเว้นเฉพาะโมดูล

Dashboard ไม่มี override สำหรับ app shell, navigation, breakpoint, card visual style หรือ responsive behavior ที่กำหนดไว้ใน `00_GLOBAL_RULES_MODULE.md` และ `../Prototypes/bo-prototype.html`

การใช้มาตรฐานกลางเฉพาะกับ Dashboard:

- Dashboard เป็นหน้า overview ไม่ใช่หน้า list แบบแบ่งหน้า ดังนั้น list toolbar และ pagination pattern กลางไม่ใช้กับหน้า Dashboard หลัก
- Dashboard ต้องคงลำดับ section ที่ยืนยันแล้ว: Header -> KPI Summary -> Work Queue -> Recent Activity -> Dashboard Panels
- Dashboard ห้ามเพิ่ม Date Range, Refresh, Export, global search, notification popup หรือ admin access switcher เว้นแต่ prototype ที่อนุมัติในอนาคตเพิ่มไว้ชัดเจน

## 14. เกณฑ์การยอมรับ

| ID | Criteria |
| --- | --- |
| AC-BO-DASH-001 | Dashboard แสดง overview metric และ pending queue ตาม Admin Permission |
| AC-BO-DASH-002 | Dashboard responsive ใช้งานได้ที่ prototype QA widths 375px, 760px, 1024px, 1366px และ 1440px |
| AC-BO-DASH-003 | Metric/queue card ที่คลิกได้ต้องพาไป module ที่เกี่ยวข้องพร้อม filter ที่เหมาะสม |
| AC-BO-DASH-004 | Pending report queue ต้องรองรับ SLA 24 ชั่วโมง |
| AC-BO-DASH-005 | Support ticket queue ต้องรองรับ first response target 8 ชั่วโมงเมื่อ Phase 2 เปิดใช้ |
| AC-BO-DASH-006 | Admin access ที่ไม่มีสิทธิ์ต้องไม่เห็น metric หรือ queue ของ module นั้น |
| AC-BO-DASH-007 | Dashboard แสดง last updated timestamp |
| AC-BO-DASH-008 | Partial data failure ต้องไม่ทำให้ทั้ง dashboard ใช้งานไม่ได้ |
| AC-BO-DASH-009 | Activity feed แสดง event สำคัญและ link ไป detail/audit ตาม permission |
| AC-BO-DASH-010 | Dashboard ไม่แสดง sensitive data ให้ admin access ที่ไม่มีสิทธิ์ |
| AC-BO-DASH-011 | Dashboard user metrics ต้องไม่ปน Guest public traffic กับ registered-user metrics |
| AC-BO-DASH-012 | Dashboard ต้องไม่แสดง guest/public analytics; metric ชุดนี้อยู่ใน Reports & Analytics เท่านั้น |
| AC-BO-DASH-013 | Dashboard ต้องทำตาม `00_GLOBAL_RULES_MODULE.md` และ `../Prototypes/bo-prototype.html` สำหรับ app shell, navigation, breakpoint, card/panel style, responsive sequence และ interaction behavior โดยไม่มี UI pattern แยกเอง |

## 15. โมดูลและเอกสารอ้างอิงที่เกี่ยวข้อง

- `00_GLOBAL_RULES_MODULE.md`
- `01_AUTHENTICATION_MODULE.md`
- `03_USER_MANAGEMENT_MODULE.md`
- `04_ASSET_MANAGEMENT_MODULE.md`
- `05_CONTENT_BOARD_MODULE.md`
- `06_MARKET_DATA_MODULE.md`
- `07_DIRECTORY_MODULE.md`
- `08_AUDIT_LOG_MODULE.md`
- `09_OFFER_CHAT_MODULE.md`
- `12_HELP_SUPPORT_MODULE.md`
- `14_NOTIFICATIONS_MODULE.md`
- `15_REPORTS_ANALYTICS_MODULE.md`
- `BO_MASTER_BASELINE.md`
- `../ProjectAdmin/FO_BO_INTEGRATION_MAP.md`
- `BO_PRD.md`
- `BO_Spec.md`

## 16. บันทึกการปรับให้ตรงกับ Prototype

บันทึกส่วนนี้เก็บ UX decision ที่ยืนยันแล้วจากการ review BO prototype และต้อง sync กับ `Prototypes/bo-prototype.html` เสมอ

### 16.1 การทำสิทธิ์ Admin ให้เรียบง่าย

- Current prototype uses a single `Admin` admin access for the main Back Office flow.
- The previous admin access selector / View as control is removed from the header to keep the screen clean.
- policy-based visibility remains documented as a product capability, but the current prototype does not expose separate Admin Views.

### 16.2 การ์ด KPI ของ Dashboard

Current primary Dashboard KPI cards are:

| Card | Purpose | Drill-in |
| --- | --- | --- |
| New Users | New user registrations shown as Dashboard snapshot with Today / This Week / This Month chips | User Management |
| Active Users Today | Daily active usage health signal with Today / This Week / This Month chips and trend copy | User Management / Reports |
| New Assets | New or updated assets by Sale / Show / Hide / Sold | Asset Management |
| Pending Reports | User reports waiting for admin/moderation review, including deadline risk | Asset / report queue |
| Offer Activity | Offer movement by accepted / rejected / pending or expired status | Offer / Chat |
| Articles | Published or scheduled Board content | Content Management |
| Watch Alert | Active watch alert volume and matching signal | Watch Alert / Market signal |
| Support Cases | Open support cases and first-response deadline risk | Help & Support |

รายละเอียดในการ์ดควรแสดงเป็น chip/label สั้น ๆ ไม่ใช่ประโยคยาว ตัวอย่าง:

| รายการ | จำนวนรายการ | การเปลี่ยนแปลง | รายละเอียด |
| --- | --- | --- | --- |
| New Users | 128 | เพิ่มขึ้น 8.2% จากช่วงก่อนหน้า | Email 68 ราย / Google 37 ราย / Apple 23 ราย |
| Active Users Today | 8.4K | ผู้ใช้งานรายวันเฉลี่ย 7 วันเพิ่มขึ้น 4.1% เทียบกับ 7 วันก่อน | Today 8,420 / This Week 24,700 / This Month 38,900 |

Reports remains the place for deeper user growth, retention, DAU/MAU trend, cohort, and export analysis. The Dashboard keeps `Active Users Today` as a primary health signal only.

`New Users` และ `Active Users Today` หมายถึงกิจกรรมของบัญชี/สมาชิกที่ลงทะเบียนแล้ว ถ้ามี analytics ของ guest public view/share ต้องแสดงแยกใน Reports และห้ามสร้าง drill-in row ใน User Management

Guest/public analytics ต้องไม่อยู่ใน Dashboard prototype ให้ใช้ Reports & Analytics สำหรับ `Guest Visitors`, `Public Asset Views`, `Public Article Views`, `Public Shares` และ `Guest-to-Signup Conversion`

ข้อความ trend ใน KPI card ต้องเป็นวลีที่อ่านรู้เรื่อง ห้ามใช้คำย่อที่ทำให้ผู้ใช้ต้องเดาความหมายเอง

| Avoid | Use |
| --- | --- |
| `+8.2%` | `เพิ่มขึ้น 8.2% จากช่วงก่อนหน้า` |
| `+340` | `เพิ่มขึ้น 340 รายการจากช่วงก่อนหน้า` |
| `9 ใกล้ครบกำหนด` | `มี 9 รายงานใกล้ครบกำหนด` |
| `+4 รอเผยแพร่` | `มี 4 บทความรอเผยแพร่` |

UI copy rule:

- ห้ามแสดงคำ technical `SLA` ใน Dashboard card, queue label, notification popup copy หรือหัวข้อ export section
- Use user-friendly wording instead:
  - `ใกล้ครบกำหนด`
  - `ครบกำหนดตอบ`
  - `กำหนดตอบครั้งแรก`
  - `ติดตามกำหนดงาน`
- The technical term `SLA` can remain in internal requirement notes, implementation comments, and backend/report field naming where needed.

### 16.3 ตำแหน่งของ Notification Delivery

- `Notification Delivery` is not shown as a primary KPI card in the current prototype.
- It is not duplicated as an `Admin Overview` row on Dashboard.
- Notification health remains available via the Notifications module, Recent Activity when there is a meaningful event, and export/report contexts where relevant.

### 16.3.1 Panel สถานะบน Dashboard

Panel ด้านล่างของ Dashboard ต้องใช้งานและคลิกได้:

| Panel | Purpose | Interaction |
| --- | --- | --- |
| Asset Status | Show asset status distribution for the selected range with clear status meaning | Each row opens Asset Management |
| Offer Status | Show offer status distribution for the selected range with clear status meaning | Each row opens Offer / Chat |

Copy rules:

- ห้ามแสดง `Admin Overview` บน Dashboard เพราะซ้ำกับข้อมูลที่มีอยู่แล้วใน KPI cards, Work Queue, Recent Activity และ `Last updated`
- ห้ามใช้ copy ที่เป็นของ prototype เท่านั้น เช่น `Back Office prototype` หรือ `Next action`
- Keep panel titles in English to match Dashboard section titles.
- Use Thai descriptions for operational meaning and next action.
- Avoid unexplained abbreviations and raw backend labels.

### 16.4 Header ของ Dashboard และตำแหน่ง Export

- Current Dashboard prototype does not show Date Range, Refresh, or Export controls in the header.
- The header shows only breadcrumb, page title, and `Last updated` to keep the operational view focused.
- Prototype ปัจจุบันไม่ต้องมี export บน Dashboard; analytics ที่ export ได้และไฟล์ที่ generate ควรอยู่ใน Reports module หรือ report/export job workflow เมื่อจำเป็น

### 16.5 ข้อความและการแสดงผลของ Work Queue

ข้อความในการ์ด Work Queue ควรเขียนให้ช่วยตัดสินใจปฏิบัติงาน ไม่ใช่ใช้ raw system label

Current prototype queue labels:

| Queue Card | Meaning |
| --- | --- |
| รายงานสินทรัพย์ | Asset reports submitted from FO and waiting for review |
| รายงานผู้ใช้ | User/profile reports submitted from FO and waiting for review |
| สินทรัพย์ที่ต้องตรวจเพิ่ม | Assets marked by system/admin/report and waiting for additional review |
| บทความรอเผยแพร่ | Scheduled Board content that needs final monitoring |
| ข้อมูลตลาดรอตรวจ | Brand/model/price/directory data waiting for admin review |
| งานช่วยเหลือที่เปิดอยู่ | Support cases that are open/in progress/waiting user |
| คำขอลบบัญชี | Account deletion requests, including blocked requests |
| แจ้งเตือนส่งไม่สำเร็จ | Failed notification jobs that may need retry or cleanup |

Queue copy rule:

- ห้ามใช้ raw label เช่น `Reported Assets`, `Open Tickets`, `Oldest 22h` หรือ `blocked by pending offer` ใน UI
- ห้ามใช้ `flag` เป็น label หลักใน UI ให้ใช้ `ต้องตรวจเพิ่ม` หรือ label ที่บอกเหตุผลชัดเจนกว่าแทน
- รายละเอียดแต่ละ queue ควรอธิบาย:
  - what the queue is,
  - why it needs attention,
  - whether anything is close to the response deadline,
  - สิ่งที่ admin ควรจัดลำดับความสำคัญก่อน
- รายละเอียด queue ควรแสดงเป็น chip/label สั้น ๆ คล้าย KPI card
- Current prototype displays Work Queue as an Action Center style list, not grid cards:
  - left priority color bar,
  - queue title,
  - concise Thai detail,
  - count on the right,
  - chevron to indicate click-through.
- ลำดับ queue ต้องตรงกับ copy บน UI:
  1. Items close to deadline first.
  2. Within the same urgency level, sort by user impact / operational priority.
  3. Current priority order: รายงานสินทรัพย์, รายงานผู้ใช้, งานช่วยเหลือที่เปิดอยู่, คำขอลบบัญชี, สินทรัพย์ที่ต้องตรวจเพิ่ม, บทความรอเผยแพร่, ข้อมูลตลาดรอตรวจ, แจ้งเตือนส่งไม่สำเร็จ.
- On mobile, Work Queue remains after the KPI Summary instead of being moved above the metrics. This matches the current overview-first Dashboard prototype.

Examples:

| Avoid | Use |
| --- | --- |
| `Oldest 22h · fake photo, duplicate listing` | `รายการเก่าสุดรอตรวจ 22 ชม. / เหตุผลหลัก: รูปซ้ำ/ข้อมูลประกาศซ้ำ / ควรตรวจวันนี้` |
| `3 near 8h first response` | `มี 3 เคสใกล้ครบกำหนดตอบครั้งแรก 8 ชม. / ควรตอบเคสเร่งด่วนก่อน` |
| `2 blocked by pending offer` | `มี 2 คำขอที่ยังลบไม่ได้ เพราะมีข้อเสนอซื้อค้างอยู่` |

### 16.6 Typography

- Current BO prototype uses bundled local fonts from `Prototypes/assets/fonts/google`.
- Primary body/UI font: `IBM Plex Sans Thai Local`.
- Heading font: `Bebas Neue Local` for page titles, section titles, and KPI labels.
- Bundled IBM Plex Sans Thai weights: Regular 400, Medium 500, SemiBold 600, Bold 700.
- Bundled Bebas Neue weight: Regular 400.
- Fallback stack remains `IBM Plex Sans Thai`, `Segoe UI`, `Tahoma`, `Arial`, `sans-serif` if bundled files cannot be loaded.
- Exported Excel-readable `.xls` files, when generated from Reports/export workflows, use IBM Plex Sans Thai family naming; final rendering can still depend on the spreadsheet app's font support.
- Font source: Google Fonts packages for IBM Plex Sans Thai and Bebas Neue.

### 16.7 ข้อความและพฤติกรรมของ Recent Activity

Recent Activity Feed in the prototype is displayed as `Recent Activity` to match other English dashboard section titles.

Purpose:

- แสดง event ล่าสุดที่ admin ควรรู้หรือต้องติดตามต่อ
- ห้ามแสดงตัวเลขซ้ำกับ KPI card เว้นแต่ event นั้นเป็นการเปลี่ยนแปลงหรือ action ที่มีความหมาย
- Keep security/audit events visible only when relevant, and do not let them dominate operational events.
- Header ของ card ต้องสะอาด ไม่ใส่ helper copy เช่น `รายการเหตุการณ์สำคัญที่เพิ่งเกิดขึ้น พร้อมลิงก์ไปจัดการต่อ` หรือ badge แบบ prototype เช่น `เปิดรายละเอียดได้`

Activity แต่ละรายการต้องมี:

| Field | Prototype Display |
| --- | --- |
| Event type | Clear Thai label, for example `มีรายงานสินทรัพย์ใหม่` |
| Summary | One-sentence explanation of what happened and which entity is affected |
| Timestamp | Relative time in Thai, for example `15 นาทีที่แล้ว` |
| Linked module | The Back Office screen/submodule that opens when the activity row is clicked |

Copy rules:

- ห้ามใช้ raw event label เช่น `Report submitted`, `Offer status changed`, `Security event` หรือ `Delivery health` ใน UI
- ห้ามแสดง audit ID แบบสุ่มใน prototype ถ้าต้องเชื่อมกับ audit ให้แสดง module/action ที่เกี่ยวข้องแทน
- Use explicit words: `ข้อเสนอซื้อถูกปฏิเสธ`, `ตั้งเวลาเผยแพร่บทความแล้ว`, `ข้อมูลตลาดอัปเดตแล้ว`.
- Avoid unexplained abbreviations in the activity card. If an operational term is required, explain it in the summary or next action.

Interaction rules:

- The activity card uses a compact table-like list, not oversized timeline cards. Each row shows left accent, event title, one-line summary, relative time, and a chevron.
- Filter ของ Activity ต้องกดได้และทำงานจริง: `ทั้งหมด`, `Report`, `Offer`, `Content`, `System`
- Filter categories are based on linked modules. Asset/user report events map to `Report`; offer events map to `Offer`; content publishing maps to `Content`; watch alert, market data, notification, and audit/system events map to `System`.
- เมื่อคลิก activity ให้ไปยัง module/submodule ที่เกี่ยวข้องโดยตรง ห้ามเปิด modal กลางใน Dashboard prototype ปัจจุบัน
- เนื้อหาใน row ต้องพอให้ Admin ตัดสินใจได้ว่าจะกดต่อหรือไม่: มี title ชัดเจน, summary สั้น, relative timestamp, category filter context และ chevron
- Activity navigation ต้องไปปลายทางจริงที่เกี่ยวข้อง ไม่ใช่หน้า report กลางแบบตายตัว ตัวอย่าง: Report -> `Reported Assets`, Offer -> `Offer Queue`, Content -> `Articles`, System notification -> `Delivery Logs`
- Activity `action` text in mock data may remain as implementation metadata or future enhancement input, but it is not required to render in a Dashboard modal.
- ห้ามแสดง badge แบบ prototype/status เช่น `linked`, `ติดตามต่อ` หรือ audit ID แบบสุ่มใน activity row

### 16.8 Visual Style ของการ์ด Dashboard

Dashboard ใช้ layout แบบ control-center ที่อ้างอิงจาก Prakan Go dashboard แต่ยังคงสีและข้อกำหนดของ Tuk Daeng BO

- Shell layout uses a dark navy sidebar, white topbar, light blue-gray workspace background, and Tuk Daeng red for active/accent states.
- Sidebar uses the referenced menu pattern: compact logo block, section labels, line icons, and chevrons only on expandable menu groups.
- Admin profile belongs in the sidebar footer under the icon-based logout row, not in the header, to avoid duplicate identity display.
- Topbar includes breadcrumb only in the current Dashboard prototype to keep the page focused.
- Current Dashboard topbar does not show Date Range, Refresh, Export, global search, or notification popup because Dashboard focuses on overview, queue, activity, and data freshness via `Last updated`. Add extra header controls only when cross-module behavior is defined.
- Notifications remain available from the sidebar `Notifications` module instead of a header popup.
- Page title uses a left vertical accent bar and a thin horizontal divider instead of a heavy framed header card.
- Header ของ Dashboard ไม่ควรแสดง summary tag สำหรับ reports/offers/urgent work เพราะข้อมูลเดียวกันแสดงอยู่แล้วใน KPI cards และ queue details
- KPI cards use a left accent border, compact icon tile, clear label, large value, trend phrase, and detail chips.
- Dashboard panels use a separated header row and padded body, similar to table/action-center cards.
- มุม card และ shadow ควรเบา ไม่ใหญ่หรือแต่งเกินจำเป็น
- Accent color ใช้เพื่อจัดกลุ่มและบอก priority เท่านั้น ห้ามใช้แทนข้อความ status จริง
- Visual style ต้องไม่ตัดข้อมูล Dashboard, link, queue priority หรือ direct navigation จาก Recent Activity ที่จำเป็นออก
