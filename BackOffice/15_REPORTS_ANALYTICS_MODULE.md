# 15 BO Reports & Analytics Module

**Version:** `BO-15-v0.1`  
**Date:** 2026-07-06  
**Status:** Draft baseline  
**Platform:** Responsive Web Back Office  
**Primary FO Sources:** `../FrontOffice/02_FEED_MODULE.md`, `../FrontOffice/03_SEARCH_FILTER_MODULE.md`, `../FrontOffice/04_ASSET_MANAGEMENT_MODULE.md`, `../FrontOffice/07_CHAT_MODULE.md`, `../FrontOffice/08_OFFER_MODULE.md`, `../FrontOffice/09_NOTIFICATION_MODULE.md`, `../FrontOffice/10_WATCH_ALERT_MODULE.md`, `../FrontOffice/11_SOCIAL_MODULE.md`, `../FrontOffice/12_BOARD_MODULE.md`, `../FrontOffice/13_SETTINGS_MODULE.md`, `../FrontOffice/15_TRUST_SAFETY_MODULE.md`

## UI Standards And Prototype Reference

เอกสารนี้ต้องใช้ร่วมกับ `00_GLOBAL_RULES_MODULE.md` และยึดรูปแบบหน้าจอ/พฤติกรรมที่ยืนยันแล้วใน `../Prototypes/bo-prototype.html` เป็นมาตรฐานหลัก

ห้ามออกแบบ pattern แยกเองสำหรับ list toolbar, breakpoint, table/card layout, pagination, reset, drill-down, drawer, modal หรือ detail layout ยกเว้นเอกสารนี้ระบุไว้ชัดเจนว่าเป็น override ที่อนุมัติแล้ว

## 1. Document Information

| Field | Detail |
| --- | --- |
| Module Name | BO Reports & Analytics |
| Platform | Responsive Web Back Office |
| Version | `BO-15-v0.1` |
| Status | Draft baseline |
| Owner | Product / UX / Engineering / Operations |
| Document Type | Functional PRD |

## 2. Objective

Reports & Analytics Module ใช้เป็นศูนย์กลางสำหรับดูข้อมูลสรุป, trend, performance, operational report และ export ข้อมูลจาก BO/FO workflows หลัก

Dashboard ใช้สำหรับภาพรวมและ queue ที่ต้องทำทันที ส่วน Reports & Analytics ใช้สำหรับวิเคราะห์เชิงลึก, export, ตรวจย้อนหลัง และส่งต่อข้อมูลให้ Product / Operation / Management / QA

## 3. Scope

### In Scope

- Report catalog ตาม module หลัก
- Date range, filter, sort และ drill-down
- CSV / Excel export ตาม permission
- Background export job สำหรับข้อมูลขนาดใหญ่
- policy-based visibility
- Sensitive data masking
- SLA reports สำหรับ moderation (Trust & Safety baseline)
- Delivery / trigger / operation metrics
- Audit log สำหรับ export และ sensitive report access
- Responsive layout สำหรับ desktop, tablet และ mobile

### Out Of Scope

- External BI/data warehouse integration
- Predictive analytics / AI analytics
- Revenue/payment analytics ที่ไม่มี payment scope
- Public dashboard สำหรับ FO users
- Real-time streaming analytics แบบเต็ม
- Editing source data จาก report screen
- Help / Support Report — module 12 เป็น Policy & Versioning + Support Center ไม่มี ticket/SLA metric รายละเอียดอยู่ใน `12_HELP_SUPPORT_MODULE.md` section 3 Out Of Scope และ section 15 Cross-Module Integration

## 4. Relationship With Dashboard

| Area | Dashboard | Reports & Analytics |
| --- | --- | --- |
| Purpose | เห็นสถานะเร็วและกดไปจัดการงาน | วิเคราะห์เชิงลึกและ export |
| Time sensitivity | Near real-time / operational | อาจ delay ได้แต่ต้องระบุ last updated |
| UI | Metric cards, queues, activity feed | Report list, tables, charts, export |
| Data scope | Summary เฉพาะที่ admin access เห็น | Detailed filtered dataset ตาม permission |
| Action | Drill-in ไป module | Export, save view, drill-down |

Reports summary อาจมี delay ได้ แต่ต้องแสดง `Last updated` ชัดเจน

## 5. Admin Access And Permissions

BO uses a single Admin account type only. Admin access is controlled by module access, action policy, sensitive-data policy, confirmation, reason, and audit requirements instead of separate BO admin account types.


| Access Area | Rule |
| --- | --- |
| Module access | Admin can use list/detail/search/filter when module access is granted. |
| Write action | Create, update, status change, remove, restore, publish, archive, retry, and similar actions require permission check, confirmation for high-risk actions, reason when FO/user impact exists, and audit log. |
| Sensitive data | Mask by default; reveal only with business reason, policy approval, and audit log. |
| Export | Requires permission check, scope control, expiry/background job where needed, and audit export event. |
| Direct URL/API | Enforce access at route, API, and service layers; never rely only on hidden UI. |
## 6. Responsive Layout

| Breakpoint | Layout |
| --- | --- |
| Mobile <= 767px | Report catalog เป็น card list, filter ใช้ collapsible panel, table เป็น stacked rows หรือ horizontal scroll เฉพาะจำเป็น |
| Tablet 768px - 1199px | Report catalog 2 columns, chart/table สลับเป็น single column |
| Desktop >= 1200px | Sidebar report catalog + filter bar + chart/table area |
| Wide Desktop >= 1440px | รองรับ chart + table + insight panel พร้อมกัน |

ทุก report ต้องมี fallback เป็น table summary ถ้า chart load fail

## 7. Global Controls

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

## 8. Report Catalog

Reports หลักที่ต้องมี (10 report):

1. User Report
2. Asset Report
3. Offer Report
4. Chat Report
5. Content / Board Report
6. Asset Reported Comments Report
7. Search Report
8. Watch Alert Report
9. Notification Report
10. Account Deletion Report

นอกจากนี้ต้องมี:

11. Export Job / Report Access History

## 9. User Report

| Metric / Data | Requirement |
| --- | --- |
| New users | Today / week / month / custom range |
| DAU / MAU | Active users daily/monthly |
| Guest visitors | Anonymous public viewers/share users must be tracked separately from registered users when tracking exists |
| Public asset views | Guest and logged-in public views on public asset detail/list surfaces, separated by user state when tracking exists |
| Public article views | Guest and logged-in public views on published Board article surfaces, separated by user state when tracking exists |
| Public profile views | Guest and logged-in public views on public profile/collection surfaces, separated by user state when tracking exists |
| Public shares | Share/copy public link events across asset, article, and profile public surfaces, separated by surface and user state when tracking exists |
| Guest public share | Public share events from unauthenticated users must be separated from logged-in share/member activity when tracking exists |
| Guest-to-signup conversion | Percentage/count of guest visitors or public viewers who complete registration within the attribution window when tracking exists |
| Auth method | Email, Apple, Google |
| Account status | Active, Suspended, Banned, Deactivated, Archived |
| Retention / activity | Last active, active users by period |
| Account issues | Deletion state, archived/anonymized |
| Moderation signal | Reported users, ban/suspend trend |

Guest/public analytics metrics:

| Metric | Requirement |
| --- | --- |
| Guest Visitors | Count unique unauthenticated visitors by date range; must be separate from registered users |
| Public Asset Views | Count public asset views by asset status/surface and user state; removed/hidden assets must not count as successful public views after visibility changes |
| Public Article Views | Count published article public views by category/article and user state |
| Public Profile Views | Count public profile or public collection views by profile owner and user state when tracking exists |
| Public Shares | Count share sheet/copy public link events by surface: asset, article, profile; split Guest vs logged-in user |
| Guest-to-Signup Conversion | Count/rate guest visitors who become registered users within the agreed attribution window |

User Report rules:

- `Guest / Unauthenticated` is not a user account status and must not appear in account status filters or registered-user breakdowns.
- `New users`, `DAU`, `MAU`, auth method breakdown, account status breakdown, retention, and deletion signals count registered account records only.
- Guest public view/share analytics can appear as separate metrics only when tracking exists, and must be labeled separately from registered-user activity.
- Guest public view/share events do not create User Management records and do not create BO account actions.
- Public view/share metrics must include `surface_type`, `entity_id`, `user_state`, `timestamp`, and attribution fields needed for guest-to-signup conversion when tracking is enabled.

Filters:

- Date joined
- Account status
- Auth method
- Last active range
- Has report
- Account deletion state
- User state: Guest / logged-in user for public analytics only
- Public surface type: asset, article, profile
- Conversion state: converted / not converted when tracking exists

Export sensitive fields เช่น email/phone ต้องจำกัดเฉพาะ Admin หรือ policy ที่อนุญาต

## 10. Asset Report

| Metric / Data | Requirement |
| --- | --- |
| New assets | Count by Sale, Show, Hide, Sold |
| Visible assets | Assets visible in Feed/Search/Profile |
| Flagged/reported assets | Count, reason, status, SLA |
| Asset status transition | Sale -> Sold, Show/Hide, ซ่อนชั่วคราว, ซ่อนถาวร, ลบโดยเจ้าของ |
| Brand/model breakdown | Aggregate by brand/model/reference |
| Price range | THB min/max/average by brand/model |
| Market data dependency | Inactive brand/model/reference impact |

Filters:

- Status: Sale, Show, Hide, Sold, ซ่อนชั่วคราว, ซ่อนถาวร, ลบโดยเจ้าของ
- Brand/model/reference
- Owner
- Price range
- Created date
- Reported/flagged

Asset report ต้องใช้คำ `Show` / `Hide` ตาม FO เป็นหลัก ไม่ใช้ legacy `Collection Show` / `Collection Hide`

## 11. Offer Report

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

## 12. Chat Report

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

## 13. Content / Board Report

| Metric / Data | Requirement |
| --- | --- |
| Article count | Draft, Scheduled, Published, Archived |
| Published performance | Views/clicks if tracking exists |
| Scheduled publish | Upcoming and failed schedule |
| Category performance | Article count and engagement by category |
| Banner performance | Active/expired banner status and clicks if tracking exists |
| Reported Article content | Count, reason, moderation status |

Filters:

- Article status
- Category
- Author
- Featured
- Publish date
- Reported status

Preview as FO ต้องไม่เพิ่ม view count

## 14. Asset Reported Comments Report

| Metric / Data | Requirement |
| --- | --- |
| Comments/replies | Count by period |
| Reported comments | Count, reason, status, SLA |
| Hidden/removed comments | Count by actor/reason |

Filters:

- Content type
- Report status
- Comment status
- Asset/owner
- Date range

## 15. Search Report

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

## 16. Watch Alert Report

| Metric / Data | Requirement |
| --- | --- |
| Active alerts | Count by period |
| Created/deleted alerts | Count and reason |
| User-disabled alerts | Count (user ปิด notification เอง) |
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

## 22. Error, Empty, Loading States

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
| AC-BO-REPORT-001 | Reports & Analytics มี report catalog ครบ 10 report หลักและ export history (User, Asset, Offer, Chat, Content/Board, Asset Reported Comments, Search, Watch Alert, Notification, Account Deletion) — ไม่มี Support Report ใน Phase 1 เพราะ module 12 เป็น Policy & Versioning + Support Center |
| AC-BO-REPORT-002 | ทุก report รองรับ date range, filter, access visibility และ last updated |
| AC-BO-REPORT-003 | ทุก report ที่ export ได้ต้องรองรับ CSV และ Excel ตาม permission |
| AC-BO-REPORT-004 | Large export ต้องใช้ background job และมี status tracking |
| AC-BO-REPORT-005 | Sensitive report view/export ต้อง mask เป็น default และ audit-log |
| AC-BO-REPORT-006 | User Report แสดง new users, DAU/MAU, auth method และ account status ได้ |
| AC-BO-REPORT-006A | User Report ต้องแยก Guest public view/share analytics ออกจาก registered-user metrics และไม่ใช้ Guest เป็น account status |
| AC-BO-REPORT-006B | User Report ต้องรองรับ Guest Visitors, Public Asset Views, Public Article Views, Public Profile Views, Public Shares และ Guest-to-Signup Conversion เมื่อ tracking เปิดใช้ |
| AC-BO-REPORT-007 | Asset Report ใช้ status `Show` / `Hide` ตาม FO และไม่ใช้ legacy collection wording |
| AC-BO-REPORT-008 | Offer Report ใช้ status `Rejected` ไม่ใช้ `Declined` |
| AC-BO-REPORT-009 | Watch Alert Report ต้องยืนยัน Sale-only match และ destination `Watch Alert Result List` |
| AC-BO-REPORT-010 | Support Report ไม่อยู่ใน Phase 1 เพราะ module 12 เป็น Policy & Versioning + Support Center ไม่มี ticket/SLA metric |
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

