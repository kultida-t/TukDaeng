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
- Date range filter
- Role-based dashboard view
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

| Role | Dashboard Focus |
| --- | --- |
| Super Admin | System overview, pending reports, user/asset activity, audit/security signal, all queues |
| Content Admin | Article status, scheduled/published content, Board analytics, banner status |
| Moderator | Pending reports, flagged assets/comments/chats, SLA risk |
| Support Admin | Open tickets, waiting user, account issues, deletion requests |
| Market Admin | Brand/model/price index changes, directory status, watch alert/search signal |

# 5. Responsive Layout

| Breakpoint | Layout |
| --- | --- |
| Mobile `< 768px` | Metric cards 1 column, queue summary เป็น stacked cards, activity feed อยู่ท้ายหน้า, filter ใช้ drawer หรือ compact controls |
| Tablet `768px - 1199px` | Metric cards 2 columns, queue cards 2 columns, activity feed full width |
| Desktop `>= 1200px` | Metric cards 4 columns, queue/activity แบ่ง 2-3 columns ตาม priority |
| Wide Desktop `>= 1440px` | รองรับ expanded overview, side-by-side queue และ activity feed |

ข้อกำหนด:

- Critical queue ต้องเห็นใน first viewport บน desktop
- บน mobile ต้องเห็น top priority queue ก่อน metric รอง
- Card/action ต้องไม่ overlap และต้อง tap/click ได้ชัดเจน
- Dashboard ต้องใช้งานได้แม้ chart library load fail โดย fallback เป็นตัวเลข/table summary

# 6. Global Controls

| Control | Requirement |
| --- | --- |
| Date Range | Today, 7 days, 30 days, Custom |
| Refresh | Manual refresh พร้อม last updated timestamp |
| Role View | แสดงเฉพาะ metric/queue ที่ role มีสิทธิ์ |
| Drill-in | Metric/queue card ต้องคลิกไป module ที่เกี่ยวข้องพร้อม filter ที่เหมาะสม |
| Export | Dashboard overview export เฉพาะ role ที่มีสิทธิ์ และต้อง audit-log เมื่อ export sensitive data |

Default date range: `Today` สำหรับ operational queue และ `7 days` สำหรับ trend metric ที่ต้องเห็นแนวโน้ม

# 7. Metric Cards

| Metric | Description | Drill-in | Role Visibility | Phase |
| --- | --- | --- | --- | --- |
| New Users | จำนวน user ใหม่ตาม date range | User Management filtered by joined date | Super Admin, Support Admin | 1 |
| DAU / MAU | Active users daily/monthly | Reports / User Report | Super Admin | 2 |
| New Assets | จำนวน asset ใหม่แยก Sale / Show / Hide / Sold | Asset Management filtered by created date/status | Super Admin, Moderator | 1 |
| Pending Reports | จำนวน report ที่ยังรอ review | Moderation queue / Asset/User/Comment report filters | Super Admin, Moderator | 1/2 |
| Flagged Assets | Asset ที่ถูก flag หรือรอ moderation | Asset Management filtered flagged | Super Admin, Moderator | 1 |
| Published Articles | Article published/scheduled/archived ตาม date range | Content / Board Management | Super Admin, Content Admin | 1 |
| Active Watch Alerts | จำนวน watch alert active | Watch Alert Management | Super Admin, Market Admin | 2 |
| Open Support Tickets | Ticket ที่ยัง open/in progress/waiting user | Help & Support | Super Admin, Support Admin | 2 |
| Offer Activity | Offer made/accepted/rejected/expired | `09_OFFER_CHAT_MODULE.md` | Super Admin, Moderator | 2 |
| Notification Delivery | Sent/delivered/opened/failed | Notifications | Super Admin | 2 |

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
- Admin login/security event เฉพาะ Super Admin
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

# 10. Role-Based Dashboard Rules

| Role | Visible Sections |
| --- | --- |
| Super Admin | ทุก metric/queue/activity รวม security/audit signal |
| Content Admin | Content/Board metrics, scheduled articles, article activity, banner status |
| Moderator | Pending reports, flagged assets, reported comments/chats, moderation activity |
| Support Admin | Open tickets, user support signals, account deletion requests, user login history shortcut |
| Market Admin | Brand/model/price index activity, directory status, watch alert aggregate/search signal |

กฎ:

- Metric ที่ role ไม่มีสิทธิ์ต้องไม่แสดง
- Drill-in ต้องไม่พาไปหน้า unauthorized
- ถ้า role ไม่มี queue ใด ๆ ให้แสดง empty state ที่เหมาะสม ไม่ใช่หน้าโล่ง

# 11. Dashboard Data Freshness

| Data Type | Freshness Expectation |
| --- | --- |
| Pending queues | ใกล้ real-time หรือ refresh ทุก 1-5 นาทีตาม backend capability |
| Dashboard metrics | Refresh เมื่อเปลี่ยน date range หรือ manual refresh |
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

# 15. Acceptance Criteria

| ID | Criteria |
| --- | --- |
| AC-BO-DASH-001 | Dashboard แสดง overview metric และ pending queue ตาม role permission |
| AC-BO-DASH-002 | Dashboard responsive ใช้งานได้ที่ 375px, 768px, 1280px และ 1440px |
| AC-BO-DASH-003 | Metric/queue card ที่คลิกได้ต้องพาไป module ที่เกี่ยวข้องพร้อม filter ที่เหมาะสม |
| AC-BO-DASH-004 | Pending report queue ต้องรองรับ SLA 24 ชั่วโมง |
| AC-BO-DASH-005 | Support ticket queue ต้องรองรับ first response target 8 ชั่วโมงเมื่อ Phase 2 เปิดใช้ |
| AC-BO-DASH-006 | Role ที่ไม่มีสิทธิ์ต้องไม่เห็น metric หรือ queue ของ module นั้น |
| AC-BO-DASH-007 | Dashboard แสดง last updated timestamp |
| AC-BO-DASH-008 | Partial data failure ต้องไม่ทำให้ทั้ง dashboard ใช้งานไม่ได้ |
| AC-BO-DASH-009 | Activity feed แสดง event สำคัญและ link ไป detail/audit ตาม permission |
| AC-BO-DASH-010 | Dashboard ไม่แสดง sensitive data ให้ role ที่ไม่มีสิทธิ์ |

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
