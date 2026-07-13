# 02 BO Dashboard Module

อ้างอิง:

- `00_GLOBAL_RULES_MODULE.md`
- `BO_MASTER_BASELINE.md`
- `../ProjectAdmin/FO_BO_INTEGRATION_MAP.md`
- `BO_PRD.md`
- `BO_Spec.md`

---

# 1. ข้อมูลเอกสาร

| Field | Detail |
| --- | --- |
| Module Name | BO Dashboard |
| Platform | Responsive Web Back Office |
| Version | `BO-PRD-v0.1` |
| Status | Draft |
| Owner | Product / UX / Engineering / Operations |
| Document Type | Functional PRD |

# 2. วัตถุประสงค์

Dashboard เป็นหน้าแรกของ BO ที่สรุปสถานะระบบและงานที่ Admin ต้องดำเนินการจากข้อมูลที่เกิดบน FO เช่น user ใหม่, asset ใหม่, pending reports, offer activity, watch alert, support ticket, article publishing และ admin activity

Dashboard ต้องช่วยให้ Admin เห็นภาพรวมเร็ว ตัดสินใจได้ว่า queue ไหนต้องจัดการก่อน และกดไปยัง module ที่เกี่ยวข้องได้ทันที

# 3. ขอบเขต

## In Scope

- Dashboard overview metrics
- Pending queue summary
- Operational alerts
- Recent activity feed
- policy-based dashboard view
- Responsive dashboard layout
- Drill-in links ไป module ที่เกี่ยวข้อง
- Empty/loading/error states

## Out Of Scope

- Full analytics report detail
- Custom dashboard builder
- Real-time BI dashboard ขั้นสูง
- Predictive analytics
- External data warehouse integration

# 4. Dashboard Users

Dashboard is used by the single BO account type `Admin`. The dashboard must not expose a admin access switcher or separate admin views.

| Admin Account Type | Dashboard Focus |
| --- | --- |
| Admin | System overview, pending queues, activity, support, content, market, notification, report, audit, and security signals according to module/action policy. |
# 5. Responsive Layout

| Breakpoint | Layout |
| --- | --- |
| Mobile `< 768px` | ใช้ลำดับเดียวกับ prototype: Header -> KPI Summary 1 column -> Work Queue -> Recent Activity -> Dashboard Panels; Work Queue เป็น stacked action list |
| Tablet `768px - 1199px` | Header -> KPI Summary 2 columns -> Work Queue -> Recent Activity -> Dashboard Panels; layout stack เป็น 1 column เมื่อพื้นที่ไม่พอ |
| Desktop `>= 1200px` | Header -> KPI Summary 4 columns -> Work Queue และ Recent Activity แบบ side-by-side -> Dashboard Panels |
| Wide Desktop `>= 1440px` | รองรับ expanded overview, side-by-side Work Queue / Recent Activity และ Dashboard Panels ด้านล่าง |

ข้อกำหนด:

- Dashboard ใช้ overview-first sequence ให้เหมือนกันทุก breakpoint เพื่อให้ prototype อ่านง่ายและไม่ต้อง reorder DOM ระหว่าง desktop/mobile
- Work Queue ต้องอยู่ถัดจาก KPI Summary ทันที และรายการ priority สูงต้องอยู่บนสุดใน Work Queue
- Dashboard Panels ด้านล่างใช้ 4 columns บน desktop เพื่อให้ 4 panels สมดุล, 2x2 บน tablet/จอแคบ และ 1 column บน mobile
- Card/action ต้องไม่ overlap และต้อง tap/click ได้ชัดเจน
- Dashboard ต้องใช้งานได้แม้ chart library load fail โดย fallback เป็นตัวเลข/table summary

# 6. Dashboard Header And Controls

| Control | Requirement |
| --- | --- |
| Header | Dashboard header stays focused on breadcrumb, page title, and `Last updated`; it does not show Date Range, Refresh, Export, global search, notification popup, or summary tags. |
| Data Freshness | `Last updated` is the visible freshness indicator for the current prototype. Manual refresh is not required on the Dashboard screen. |
| Date Scope | Dashboard uses fixed operational snapshot data in the prototype. Date Range controls are not required on Dashboard; date-range analysis belongs in Reports where needed. |
| Admin View | Product capability สำหรับ policy-based visibility; current prototype ใช้ admin access เดียว `Admin` และไม่แสดง admin access switcher |
| Drill-in | Metric/queue card ต้องคลิกไป module ที่เกี่ยวข้องพร้อม filter ที่เหมาะสม |
| Export | Dashboard does not expose a direct Export control in the current prototype. Exportable analytics and jobs remain in the Reports module. |

Dashboard must not add header controls unless a future prototype explicitly defines the workflow and placement.

# 7. Metric Cards

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
- Guest public view/share traffic must not be included in `New Users` or registered-user DAU/MAU style metrics.
- If guest traffic is shown in the future, it must be a separate Dashboard/Reports signal such as `Guest visitors` or `Public shares`, and it must drill into Reports rather than User Management.

# 8. Pending Queue Summary

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

# 9. Recent Activity Feed

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

| Field | Requirement |
| --- | --- |
| Timestamp | แสดงเป็น Asia/Bangkok |
| Event Type | เช่น User, Asset, Report, Article, Market Data, Audit |
| Actor | User/System/Admin ตามสิทธิ์ที่เห็นได้ |
| Target | Entity name/ID |
| Summary | ข้อความสั้น อธิบาย event |
| Link | ไป detail หรือ audit record ตาม permission |

# 10. Admin Dashboard Access Rules

Dashboard visibility is policy-based, not Admin access-based. The current BO baseline has one `Admin` account type and no View-as control.

Rules:

- Show dashboard cards by module/action policy and data sensitivity.
- Hide or mask sensitive values when policy does not allow full detail.
- Direct drill-in links must enforce access again at the destination module/API.
- If no queue is available for a policy scope, show a useful empty state rather than a blank panel.
# 11. Dashboard Data Freshness

| Data Type | Freshness Expectation |
| --- | --- |
| Pending queues | ใกล้ real-time หรือ refresh ทุก 1-5 นาทีตาม backend capability |
| Dashboard metrics | แสดง snapshot ล่าสุดของระบบพร้อม `Last updated`; Dashboard ไม่ต้องมี Date Range หรือ Manual Refresh control ใน prototype ปัจจุบัน |
| Activity feed | แสดงล่าสุดเท่าที่ระบบมี พร้อม last updated |
| Reports summary | อาจมี delay ได้ แต่ต้องระบุ last updated |

Dashboard ต้องแสดง `Last updated` ชัดเจน

# 12. BO/FO Integration Impact

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

# 13. Error / Empty / Loading States

| State | Requirement |
| --- | --- |
| Loading | แสดง skeleton สำหรับ metric cards และ queue cards |
| Partial Load Error | ถ้า metric บางชุด load ไม่ได้ ให้ส่วนอื่นยังแสดงได้ พร้อม retry เฉพาะ card/section |
| Full Load Error | แสดง error state พร้อม retry dashboard |
| Empty Queue | แสดงข้อความว่าไม่มีงานค้างใน queue นั้น |
| Unauthorized Section | ไม่แสดง section นั้น แทนการแสดง error |
| Stale Data | แสดง last updated และ warning เมื่อ data เก่าเกิน threshold |

# 14. Performance Requirements

- Dashboard initial load หลัง auth ควรไม่เกิน 3 วินาทีสำหรับข้อมูลหลัก
- Section ที่หนัก เช่น trend/report summary สามารถ lazy load ได้
- Mobile ต้องโหลดข้อมูลสำคัญก่อน chart/visual เสริม
- Query dashboard ต้องไม่ block งาน operational queue สำคัญ
- Responsive rendering must preserve the prototype sequence: Header -> KPI Summary -> Work Queue -> Recent Activity -> Dashboard Panels.

# 15. Acceptance Criteria

| ID | Criteria |
| --- | --- |
| AC-BO-DASH-001 | Dashboard แสดง overview metric และ pending queue ตาม Admin Permission |
| AC-BO-DASH-002 | Dashboard responsive ใช้งานได้ที่ 375px, 768px, 1280px และ 1440px |
| AC-BO-DASH-003 | Metric/queue card ที่คลิกได้ต้องพาไป module ที่เกี่ยวข้องพร้อม filter ที่เหมาะสม |
| AC-BO-DASH-004 | Pending report queue ต้องรองรับ SLA 24 ชั่วโมง |
| AC-BO-DASH-005 | Support ticket queue ต้องรองรับ first response target 8 ชั่วโมงเมื่อ Phase 2 เปิดใช้ |
| AC-BO-DASH-006 | Admin access ที่ไม่มีสิทธิ์ต้องไม่เห็น metric หรือ queue ของ module นั้น |
| AC-BO-DASH-007 | Dashboard แสดง last updated timestamp |
| AC-BO-DASH-008 | Partial data failure ต้องไม่ทำให้ทั้ง dashboard ใช้งานไม่ได้ |
| AC-BO-DASH-009 | Activity feed แสดง event สำคัญและ link ไป detail/audit ตาม permission |
| AC-BO-DASH-010 | Dashboard ไม่แสดง sensitive data ให้ admin access ที่ไม่มีสิทธิ์ |
| AC-BO-DASH-011 | Dashboard user metrics ต้องไม่ปน Guest public traffic กับ registered-user metrics |

# 16. Related Modules

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

# 17. Prototype Alignment Notes

These notes capture confirmed UX decisions from the BO prototype review and must be kept in sync with `Prototypes/bo-prototype.html`.

## 17.1 Admin Access Simplification

- Current prototype uses a single `Admin` admin access for the main Back Office flow.
- The previous admin access selector / View as control is removed from the header to keep the screen clean.
- policy-based visibility remains documented as a product capability, but the current prototype does not expose separate Admin Views.

## 17.2 Dashboard KPI Cards

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

Card detail text should be shown as short chips/labels, not as one long sentence. Example:

| รายการ | จำนวนรายการ | การเปลี่ยนแปลง | รายละเอียด |
| --- | --- | --- | --- |
| New Users | 128 | เพิ่มขึ้น 8.2% จากช่วงก่อนหน้า | Email 68 ราย / Google 37 ราย / Apple 23 ราย |
| Active Users Today | 8.4K | ผู้ใช้งานรายวันเฉลี่ย 7 วันเพิ่มขึ้น 4.1% เทียบกับ 7 วันก่อน | Today 8,420 / This Week 24,700 / This Month 38,900 |

Reports remains the place for deeper user growth, retention, DAU/MAU trend, cohort, and export analysis. The Dashboard keeps `Active Users Today` as a primary health signal only.

`New Users` and `Active Users Today` represent registered account/member activity. Guest public view/share analytics, if enabled, must be shown separately in Reports and must not create drill-in rows in User Management.

KPI card trend copy must be a complete phrase. Do not show shorthand values that force the user to infer the meaning.

| Avoid | Use |
| --- | --- |
| `+8.2%` | `เพิ่มขึ้น 8.2% จากช่วงก่อนหน้า` |
| `+340` | `เพิ่มขึ้น 340 รายการจากช่วงก่อนหน้า` |
| `9 ใกล้ครบกำหนด` | `มี 9 รายงานใกล้ครบกำหนด` |
| `+4 รอเผยแพร่` | `มี 4 บทความรอเผยแพร่` |

UI copy rule:

- Do not show the technical term `SLA` in Dashboard cards, queue labels, notification popup copy, or export section titles.
- Use user-friendly wording instead:
  - `ใกล้ครบกำหนด`
  - `ครบกำหนดตอบ`
  - `กำหนดตอบครั้งแรก`
  - `ติดตามกำหนดงาน`
- The technical term `SLA` can remain in internal requirement notes, implementation comments, and backend/report field naming where needed.

## 17.3 Notification Delivery Placement

- `Notification Delivery` is not shown as a primary KPI card in the current prototype.
- It is not duplicated as an `Admin Overview` row on Dashboard.
- Notification health remains available via the Notifications module, Recent Activity when there is a meaningful event, and export/report contexts where relevant.

## 17.3.1 Dashboard Status Panels

Bottom Dashboard panels must remain operational and clickable:

| Panel | Purpose | Interaction |
| --- | --- | --- |
| Asset Status | Show asset status distribution for the selected range with clear status meaning | Each row opens Asset Management |
| Offer Status | Show offer status distribution for the selected range with clear status meaning | Each row opens Offer / Chat |

Copy rules:

- Do not show `Admin Overview` on Dashboard because it duplicates information already covered by KPI cards, Work Queue, Recent Activity, and `Last updated`.
- Do not use prototype-only copy such as `Back Office prototype` or `Next action`.
- Keep panel titles in English to match Dashboard section titles.
- Use Thai descriptions for operational meaning and next action.
- Avoid unexplained abbreviations and raw backend labels.

## 17.4 Dashboard Header And Export Placement

- Current Dashboard prototype does not show Date Range, Refresh, or Export controls in the header.
- The header shows only breadcrumb, page title, and `Last updated` to keep the operational view focused.
- Dashboard export is not required in the current prototype. Exportable analytics and generated files should live in the Reports module or report/export job workflows when needed.

## 17.5 Work Queue Copy And Display

Work Queue cards should be written for operational action, not as raw system labels.

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

- Do not use raw labels like `Reported Assets`, `Open Tickets`, `Oldest 22h`, or `blocked by pending offer` in the UI.
- Do not use `flag` as the primary UI label. Use `ต้องตรวจเพิ่ม` or a clearer reason-based label instead.
- Each queue detail should explain:
  - what the queue is,
  - why it needs attention,
  - whether anything is close to the response deadline,
  - what admin should prioritize.
- Queue detail should be displayed as short chips/labels, similar to KPI cards.
- Current prototype displays Work Queue as an Action Center style list, not grid cards:
  - left priority color bar,
  - queue title,
  - concise Thai detail,
  - count on the right,
  - chevron to indicate click-through.
- Queue ordering must match the UI copy:
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

## 17.6 Typography

- Current BO prototype uses bundled local fonts from `Prototypes/assets/fonts/google`.
- Primary body/UI font: `IBM Plex Sans Thai Local`.
- Heading font: `Bebas Neue Local` for page titles, section titles, and KPI labels.
- Bundled IBM Plex Sans Thai weights: Regular 400, Medium 500, SemiBold 600, Bold 700.
- Bundled Bebas Neue weight: Regular 400.
- Fallback stack remains `IBM Plex Sans Thai`, `Segoe UI`, `Tahoma`, `Arial`, `sans-serif` if bundled files cannot be loaded.
- Exported Excel-readable `.xls` files, when generated from Reports/export workflows, use IBM Plex Sans Thai family naming; final rendering can still depend on the spreadsheet app's font support.
- Font source: Google Fonts packages for IBM Plex Sans Thai and Bebas Neue.

## 17.7 Recent Activity Feed Copy And Behavior

Recent Activity Feed in the prototype is displayed as `Recent Activity` to match other English dashboard section titles.

Purpose:

- Show the latest operational events that may require admin awareness or follow-up.
- Do not duplicate KPI card counts unless the event represents a meaningful change or action.
- Keep security/audit events visible only when relevant, and do not let them dominate operational events.
- The card header should stay clean. Do not show helper copy such as `รายการเหตุการณ์สำคัญที่เพิ่งเกิดขึ้น พร้อมลิงก์ไปจัดการต่อ` or prototype badges such as `เปิดรายละเอียดได้`.

Each activity item must include:

| Field | Prototype Display |
| --- | --- |
| Event type | Clear Thai label, for example `มีรายงานสินทรัพย์ใหม่` |
| Summary | One-sentence explanation of what happened and which entity is affected |
| Timestamp | Relative time in Thai, for example `15 นาทีที่แล้ว` |
| Linked module | The Back Office screen/submodule that opens when the activity row is clicked |

Copy rules:

- Do not use raw event labels such as `Report submitted`, `Offer status changed`, `Security event`, or `Delivery health` in the UI.
- Do not show random audit IDs in the prototype. If audit linkage is needed, show the linked module/action instead.
- Use explicit words: `ข้อเสนอซื้อถูกปฏิเสธ`, `ตั้งเวลาเผยแพร่บทความแล้ว`, `ข้อมูลตลาดอัปเดตแล้ว`.
- Avoid unexplained abbreviations in the activity card. If an operational term is required, explain it in the summary or next action.

Interaction rules:

- The activity card uses a compact table-like list, not oversized timeline cards. Each row shows left accent, event title, one-line summary, relative time, and a chevron.
- Activity filters must be clickable and functional: `ทั้งหมด`, `Report`, `Offer`, `Content`, `System`.
- Filter categories are based on linked modules. Asset/user report events map to `Report`; offer events map to `Offer`; content publishing maps to `Content`; watch alert, market data, notification, and audit/system events map to `System`.
- Clicking an activity navigates directly to the related module/submodule. Do not open an intermediate modal in the current Dashboard prototype.
- The row content must be sufficient for the Admin to decide whether to follow the link: clear event title, concise summary, relative timestamp, category filter context, and chevron.
- Activity navigation must target the real related destination, not a fixed generic report page. Examples: Report -> `Reported Assets`, Offer -> `Offer Queue`, Content -> `Articles`, System notification -> `Delivery Logs`.
- Activity `action` text in mock data may remain as implementation metadata or future enhancement input, but it is not required to render in a Dashboard modal.
- Do not show prototype/status badges such as `linked`, `ติดตามต่อ`, or random audit IDs in the activity row.

## 17.8 Dashboard Card Visual Style

Dashboard follows a control-center layout inspired by the referenced Prakan Go dashboard, while keeping Tuk Daeng colors and BO requirements.

- Shell layout uses a dark navy sidebar, white topbar, light blue-gray workspace background, and Tuk Daeng red for active/accent states.
- Sidebar uses the referenced menu pattern: compact logo block, section labels, line icons, and chevrons only on expandable menu groups.
- Admin profile belongs in the sidebar footer under the icon-based logout row, not in the header, to avoid duplicate identity display.
- Topbar includes breadcrumb only in the current Dashboard prototype to keep the page focused.
- Current Dashboard topbar does not show Date Range, Refresh, Export, global search, or notification popup because Dashboard focuses on overview, queue, activity, and data freshness via `Last updated`. Add extra header controls only when cross-module behavior is defined.
- Notifications remain available from the sidebar `Notifications` module instead of a header popup.
- Page title uses a left vertical accent bar and a thin horizontal divider instead of a heavy framed header card.
- Dashboard header should not show summary tags for reports/offers/urgent work because the same information is already represented in KPI cards and queue details.
- KPI cards use a left accent border, compact icon tile, clear label, large value, trend phrase, and detail chips.
- Dashboard panels use a separated header row and padded body, similar to table/action-center cards.
- Card corners and shadows should be light, not oversized or decorative.
- Accent colors are used for grouping and priority only; they must not replace real status text.
- The visual style must not remove required Dashboard data, links, queue priority, or direct Recent Activity navigation.
