# 15 BO Reports & Analytics Module

**Version:** `BO-15-v0.1`  
**Date:** 2026-07-06  
**Status:** Draft baseline  
**Platform:** Responsive Web Back Office  
**Primary FO Sources:** `../FrontOffice/02_FEED_MODULE.md`, `../FrontOffice/03_SEARCH_FILTER_MODULE.md`, `../FrontOffice/04_ASSET_MANAGEMENT_MODULE.md`, `../FrontOffice/07_CHAT_MODULE.md`, `../FrontOffice/08_OFFER_MODULE.md`, `../FrontOffice/09_NOTIFICATION_MODULE.md`, `../FrontOffice/10_WATCH_ALERT_MODULE.md`, `../FrontOffice/11_SOCIAL_MODULE.md`, `../FrontOffice/12_BOARD_MODULE.md`, `../FrontOffice/13_SETTINGS_MODULE.md`, `../FrontOffice/15_TRUST_SAFETY_MODULE.md`  
**Integration Map:** `../ProjectAdmin/FO_BO_INTEGRATION_MAP.md`

## 1. วัตถุประสงค์

Reports & Analytics Module ใช้เป็นศูนย์กลางสำหรับดูข้อมูลสรุป, trend, performance, SLA, operational report และ export ข้อมูลจาก BO/FO workflows หลัก

Dashboard ใช้สำหรับภาพรวมและ queue ที่ต้องทำทันที ส่วน Reports & Analytics ใช้สำหรับวิเคราะห์เชิงลึก, export, ตรวจย้อนหลัง และส่งต่อข้อมูลให้ Product / Operation / Management / QA

## 2. ขอบเขต

### 2.1 In Scope

- Report catalog ตาม module หลัก
- Date range, filter, sort และ drill-down
- CSV / Excel export ตาม permission
- Background export job สำหรับข้อมูลขนาดใหญ่
- policy-based visibility
- Sensitive data masking
- SLA reports สำหรับ moderation และ support
- Delivery / trigger / operation metrics
- Audit log สำหรับ export และ sensitive report access
- Responsive layout สำหรับ desktop, tablet และ mobile

### 2.2 Out of Scope

- External BI/data warehouse integration
- Predictive analytics / AI analytics
- Revenue/payment analytics ที่ไม่มี payment scope
- Public dashboard สำหรับ FO users
- Real-time streaming analytics แบบเต็ม
- Editing source data จาก report screen

## 3. Relationship With Dashboard

| Area | Dashboard | Reports & Analytics |
| --- | --- | --- |
| Purpose | เห็นสถานะเร็วและกดไปจัดการงาน | วิเคราะห์เชิงลึกและ export |
| Time sensitivity | Near real-time / operational | อาจ delay ได้แต่ต้องระบุ last updated |
| UI | Metric cards, queues, activity feed | Report list, tables, charts, export |
| Data scope | Summary เฉพาะที่ admin access เห็น | Detailed filtered dataset ตาม permission |
| Action | Drill-in ไป module | Export, save view, drill-down |

Reports summary อาจมี delay ได้ แต่ต้องแสดง `Last updated` ชัดเจน

## 4. Admin Access & Permissions

BO uses a single Admin account type only. Admin access is controlled by module access, action policy, sensitive-data policy, confirmation, reason, and audit requirements instead of separate BO admin account types.


| Access Area | Rule |
| --- | --- |
| Module access | Admin can use list/detail/search/filter when module access is granted. |
| Write action | Create, update, status change, remove, restore, publish, archive, retry, and similar actions require permission check, confirmation for high-risk actions, reason when FO/user impact exists, and audit log. |
| Sensitive data | Mask by default; reveal only with business reason, policy approval, and audit log. |
| Export | Requires permission check, scope control, expiry/background job where needed, and audit export event. |
| Direct URL/API | Enforce access at route, API, and service layers; never rely only on hidden UI. |
## 5. Responsive Layout

| Breakpoint | Layout |
| --- | --- |
| Mobile <= 767px | Report catalog เป็น card list, filter ใช้ collapsible panel, table เป็น stacked rows หรือ horizontal scroll เฉพาะจำเป็น |
| Tablet 768px - 1199px | Report catalog 2 columns, chart/table สลับเป็น single column |
| Desktop >= 1200px | Sidebar report catalog + filter bar + chart/table area |
| Wide Desktop >= 1440px | รองรับ chart + table + insight panel พร้อมกัน |

ทุก report ต้องมี fallback เป็น table summary ถ้า chart load fail

## 6. Global Controls

| Control | Requirement |
| --- | --- |
| Date Range | Today, 7 days, 30 days, Custom |
| Compare | Optional: previous period เทียบกับ date range เดิม |
| Search | ค้นหาตาม field ที่เกี่ยวข้องกับ report |
| Filters | Module-specific filters |
| Sort | Table columns ที่เหมาะสม |
| Columns | Column visibility ถ้า report มี field จำนวนมาก |
| Refresh | Manual refresh พร้อม last updated |
| Export | Requires permission check, scope control, expiry/background job where needed, and audit export event. |
| Drill-down | เปิด module ต้นทางพร้อม filter |

Timezone ต้องแสดงเป็น `Asia/Bangkok` และราคาแสดงเป็น THB

## 7. Report Catalog

Reports ที่ต้องมี:

1. User Report
2. Asset Report
3. Offer Report
4. Chat Report
5. Content / Board Report
6. Social Report
7. Search Report
8. Watch Alert Report
9. Support Report
10. Notification Report
11. Account Deletion Report
12. Export Job / Report Access History

## 8. User Report

| Metric / Data | Requirement |
| --- | --- |
| New users | Today / week / month / custom range |
| DAU / MAU | Active users daily/monthly |
| Guest visitors | Anonymous public viewers/share users must be tracked separately from registered users when tracking exists |
| Guest public share | Public share events from unauthenticated users must be separated from logged-in share/member activity when tracking exists |
| Auth method | Email, Apple, Google |
| Account status | Active, Suspended, Banned, Deactivated, Archived |
| Retention / activity | Last active, active users by period |
| Support/account issues | Open tickets, deletion state |
| Moderation signal | Reported users, ban/suspend trend |

User Report rules:

- `Guest / Unauthenticated` is not a user account status and must not appear in account status filters or registered-user breakdowns.
- `New users`, `DAU`, `MAU`, auth method breakdown, account status breakdown, retention, and support/deletion signals count registered account records only.
- Guest public view/share analytics can appear as separate metrics only when tracking exists, and must be labeled separately from registered-user activity.
- Guest public view/share events do not create User Management records and do not create BO account actions.

Filters:

- Date joined
- Account status
- Auth method
- Last active range
- Has report
- Has support ticket

Export sensitive fields เช่น email/phone ต้องจำกัดเฉพาะ Admin หรือ policy ที่อนุญาต

## 9. Asset Report

| Metric / Data | Requirement |
| --- | --- |
| New assets | Count by Sale, Show, Hide, Sold |
| Visible assets | Assets visible in Feed/Search/Profile |
| Flagged/reported assets | Count, reason, status, SLA |
| Asset status transition | Sale -> Sold, Show/Hide, Removed/Hidden |
| Brand/model breakdown | Aggregate by brand/model/reference |
| Price range | THB min/max/average by brand/model |
| Market data dependency | Inactive brand/model/reference impact |

Filters:

- Status: Sale, Show, Hide, Sold, Removed/Hidden
- Brand/model/reference
- Owner
- Price range
- Created date
- Reported/flagged

Asset report ต้องใช้คำ `Show` / `Hide` ตาม FO เป็นหลัก ไม่ใช้ legacy `Collection Show` / `Collection Hide`

## 10. Offer Report

| Metric / Data | Requirement |
| --- | --- |
| Offer made | Count by period |
| Offer accepted | Count and conversion |
| Offer rejected | Count using status `Rejected` |
| Offer cancelled/expired/invalidated | Count and reason |
| Pending offers | Count and aging |
| Offer value | THB amount summary |
| Asset dependency | Offers impacted by removed/sold assets |

Filters:

- Offer status: Pending, Accepted, Rejected, Cancelled, Expired, Invalidated
- Brand/model
- Buyer/owner
- Asset status
- Date range

Report UI ต้องใช้ `Rejected` เป็น status กลาง ส่วน FO action copy `Decline` เป็น action ที่เปลี่ยน status เป็น `Rejected`

## 11. Chat Report

| Metric / Data | Requirement |
| --- | --- |
| Chat rooms | Created/active count |
| Reported chats | Count, reason, status, SLA |
| Attachment scan | Pending Scan, Clean, Unsafe, Scan Failed, Blocked |
| Offer-linked chats | Chat rooms with offer card |
| Removed/hidden messages | Count by reason |
| Exported conversations | Export history and actor |

Filters:

- Participant
- Related asset
- Has offer
- Has attachment
- Attachment scan status
- Reported status
- Date range

Chat transcript export ต้องจำกัด permission และ audit ทุกครั้ง

## 12. Content / Board Report

| Metric / Data | Requirement |
| --- | --- |
| Article count | Draft, Scheduled, Published, Archived |
| Published performance | Views/clicks if tracking exists |
| Scheduled publish | Upcoming and failed schedule |
| Category performance | Article count and engagement by category |
| Banner performance | Active/expired banner status and clicks if tracking exists |
| Reported Board content | Count, reason, moderation status |

Filters:

- Article status
- Category
- Author
- Featured
- Publish date
- Reported status

Preview as FO ต้องไม่เพิ่ม view count

## 13. Social Report

| Metric / Data | Requirement |
| --- | --- |
| Comments/replies | Count by period |
| Reported comments | Count, reason, status, SLA |
| Hidden/removed comments | Count by actor/reason |
| Likes/favorites | Aggregate trend and top assets |
| Follow/unfollow | Trend and top followed users |
| Block impact | Excluded follow/feed relationships where relevant |

Filters:

- Content type
- Report status
- Comment status
- Asset/owner
- Date range

BO ไม่ควรใช้ report screen แก้ individual like/favorite/follow record โดยตรง

## 14. Search Report

| Metric / Data | Requirement |
| --- | --- |
| Top searched keywords | Keyword/ref/brand/model |
| Top searched brands/models | Aggregate ranking |
| Search with no result | Query, filters, count |
| Filter usage | Brand, model, price, condition, year, location if supported |
| Search to asset open | Conversion if tracking exists |
| Search to Watch Alert | Save-as-alert conversion |

Filters:

- Keyword
- Brand/model/reference
- Has result / no result
- Date range
- User segment where allowed

Search report ต้องช่วย Admin ตรวจ gap ของ brand/model/reference/price index ได้

## 15. Watch Alert Report

| Metric / Data | Requirement |
| --- | --- |
| Active alerts | Count by period |
| Created/deleted/disabled alerts | Count and reason |
| Trigger volume | Match count by brand/model/reference |
| Notification delivery | Sent/delivered/opened/failed |
| Criteria breakdown | Price range, brand/model/reference, condition |
| Exclusion reason | Not Sale, blocked relation, inactive market data |

Filters:

- Alert status
- Notification enabled/off
- Brand/model/reference
- Triggered/not triggered
- Date range

Watch Alert match ต้องใช้เฉพาะ asset status `Sale` และ notification destination ต้องเป็น `Watch Alert Result List`

## 16. Support Report

| Metric / Data | Requirement |
| --- | --- |
| Open tickets | New, Open, In Progress, Waiting User |
| Resolved/closed tickets | Count and resolution time |
| First response SLA | Target 8 hours |
| Ticket type breakdown | Account/Login, Asset, Offer/Chat, Report/Safety, Watch Alert, Market Data, Technical, Other |
| Priority breakdown | Urgent, High, Medium, Low |
| Assigned admin workload | Ticket count by admin |

Filters:

- Ticket status
- Type
- Priority
- Assigned admin
- SLA state
- Contact channel
- Date range

Internal notes ต้องไม่ export ใน report ทั่วไป เว้นแต่ Admin export แบบ sensitive พร้อม audit

## 17. Notification Report

| Metric / Data | Requirement |
| --- | --- |
| Delivery status | Queued, Sent, Delivered, Opened, Failed, Skipped |
| Delivery rate | Target tracking coverage > 95% |
| Failed notifications | Failure reason and retryable count |
| Broadcast performance | Audience, sent, delivered, opened, failed |
| System trigger performance | Like, Comment, Follow, Offer, Watch Alert |
| Disabled type impact | Count of skipped events due disabled type |

Filters:

- Notification type
- Broadcast/system
- Channel
- Status
- Failure reason
- Date range

Generic Broadcast in FO in-app list ต้องยังถือเป็น open decision ตาม Notifications module

## 18. Account Deletion Report

| Metric / Data | Requirement |
| --- | --- |
| Requests | Requested count by period |
| Blocked requests | Count and blocking reason |
| Pending offer dependency | Incoming/outgoing pending offer count |
| Grace period | Active, ending soon, expired |
| Archived/anonymized | Completed count and processing time |
| Cancelled requests | Count and reason |

Filters:

- Request status
- Account status
- Blocking reason
- Grace period state
- Date range

Sensitive personal data ต้อง mask และ export จำกัดเฉพาะ Admin

## 19. Export Requirements

| Requirement | Rule |
| --- | --- |
| File types | CSV และ Excel |
| Large export | ใช้ background job |
| Export permission | ตรวจตาม admin access และ report scope |
| Sensitive export | ต้อง confirm, reason, audit และอาจต้อง mask/omit fields |
| Export history | Admin ดู export ของตนเอง; Admin ดูทั้งหมด |
| Expiry | Export file ควรมี expiry ตาม policy |
| Re-run | Re-run ต้องสร้าง job ใหม่และ audit ใหม่ |

Export job status:

- `Queued`
- `Processing`
- `Completed`
- `Failed`
- `Expired`
- `Cancelled`

## 20. Report Access & Audit

ต้อง audit อย่างน้อย:

- `REPORT_VIEW_SENSITIVE`
- `REPORT_EXPORT_REQUEST`
- `REPORT_EXPORT_COMPLETE`
- `REPORT_EXPORT_FAILED`
- `REPORT_EXPORT_DOWNLOAD`
- `REPORT_FILTER_SAVED`
- `REPORT_SCHEDULE_CREATE` ถ้า future เปิด scheduled report

Audit payload:

- `report_type`
- `admin_id`
- `Admin access`
- `filters`
- `date_range`
- `export_format`
- `row_count`
- `sensitive_fields_included`
- `reason`
- `ip_address`
- `user_agent`
- `created_at`

## 21. Data Freshness

| Data | Freshness Expectation |
| --- | --- |
| Operational queue metrics | ใกล้ real-time หรือ refresh ทุก 1-5 นาทีตาม backend capability |
| Aggregated reports | อาจ delay ได้ แต่ต้องแสดง last updated |
| Export datasets | Snapshot ตามเวลาที่สร้าง export job |
| Delivery logs | ตาม provider/system callback ที่มี |
| SLA reports | ควรใกล้ real-time สำหรับ breach risk |

ทุก report ต้องแสดง `Last updated`

## 22. Error / Empty / Loading States

| State | Requirement |
| --- | --- |
| Empty report | แสดงว่าไม่มีข้อมูลตาม filter และมีปุ่ม clear filter |
| Loading | Skeleton สำหรับ chart/table |
| Partial load error | Chart/table บางส่วน fail แล้วส่วนอื่นยังใช้งานได้ |
| Export queued | แสดง status และให้กลับมาดาวน์โหลดภายหลัง |
| Export failed | แสดง failure reason และ retry ถ้ามีสิทธิ์ |
| Permission denied | ไม่แสดง report หรือ field ที่ไม่มีสิทธิ์ |
| Stale data | แสดง warning เมื่อ last updated เก่าเกิน threshold |

## 23. Acceptance Criteria

| ID | Criteria |
| --- | --- |
| AC-BO-REPORT-001 | Reports & Analytics มี report catalog ครบ 11 report หลักและ export history |
| AC-BO-REPORT-002 | ทุก report รองรับ date range, filter, access visibility และ last updated |
| AC-BO-REPORT-003 | ทุก report ที่ export ได้ต้องรองรับ CSV และ Excel ตาม permission |
| AC-BO-REPORT-004 | Large export ต้องใช้ background job และมี status tracking |
| AC-BO-REPORT-005 | Sensitive report view/export ต้อง mask เป็น default และ audit-log |
| AC-BO-REPORT-006 | User Report แสดง new users, DAU/MAU, auth method และ account status ได้ |
| AC-BO-REPORT-006A | User Report ต้องแยก Guest public view/share analytics ออกจาก registered-user metrics และไม่ใช้ Guest เป็น account status |
| AC-BO-REPORT-007 | Asset Report ใช้ status `Show` / `Hide` ตาม FO และไม่ใช้ legacy collection wording |
| AC-BO-REPORT-008 | Offer Report ใช้ status `Rejected` ไม่ใช้ `Declined` |
| AC-BO-REPORT-009 | Watch Alert Report ต้องยืนยัน Sale-only match และ destination `Watch Alert Result List` |
| AC-BO-REPORT-010 | Support Report ต้องวัด first response SLA 8 ชั่วโมง |
| AC-BO-REPORT-011 | Notification Report ต้องแสดง delivery status และ failure reason |
| AC-BO-REPORT-012 | Account Deletion Report ต้องแสดง blocked reason, grace period และ archive/anonymization status |
| AC-BO-REPORT-013 | Reports UI ต้อง responsive ที่ 375px, 768px, 1280px และ 1440px |

## 24. Open Decisions

| ID | Decision Needed | Impact |
| --- | --- | --- |
| REP-DEC-001 | Retention period ของ report/export files ต้องเก็บกี่วัน | กระทบ storage และ compliance |
| REP-DEC-002 | Scheduled report email/export ต้องเปิดใน Phase ใด | กระทบ background jobs และ notification/email integration |
| REP-DEC-003 | Report aggregation ใช้ live query หรือ snapshot table | กระทบ performance และ data freshness |
| REP-DEC-004 | Sensitive export ต้อง require approval เพิ่มหรือไม่ | กระทบ permission และ operation workflow |
