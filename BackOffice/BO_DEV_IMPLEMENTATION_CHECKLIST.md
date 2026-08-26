# TukDaeng Back Office Dev Implementation Checklist

**Baseline:** `BO-PRD-v0.1`  
**Date:** 2026-07-06  
**Purpose:** Checklist ตั้งต้นสำหรับแตก ticket implementation ของ BO

## Prototype Handoff Notes Capture

Use this section while BA/UX is completing the BO prototype. Capture only notes that Dev will need later; do not create the full Dev Handoff Sheet until all prototype modules are stable.

Guidelines:

- Keep notes short and implementation-facing.
- Put module-specific notes under the related module section in this checklist.
- After all prototype modules are complete, consolidate these notes into `BO_DEV_HANDOFF.md` or separate module handoff files.
- Each note should cover at least one of: data/API, route/filter, permission, loading/empty/error state, responsive QA, or FO sync impact.

Recommended note format:

| Field | Detail |
| --- | --- |
| Prototype Reference | File, screen, or section in the prototype |
| Spec Reference | Related PRD/spec/checklist source |
| Data Needed | API fields, aggregate fields, or mock-data mapping Dev must replace |
| Route / Drill-in | Target module/route and filter context |
| State Handling | Loading, empty, error, partial error, stale, unauthorized |
| Permission / Privacy | Permission enforcement, masked fields, hidden sections |
| FO Sync Impact | Feed, Search, Profile, Notification, Watch Alert, or other FO impact |
| Open Question | Product/Dev decision still needed |

## 0. Foundation

- [ ] ใช้ `00_GLOBAL_RULES_MODULE.md` เป็น baseline กลางเรื่อง responsive layout, admin access control, audit, status, privacy และ FO sync
- [ ] สร้าง BO web app shell พร้อม authenticated layout, left navigation, top bar และ access-aware menu visibility
- [ ] กำหนด shared status constants สำหรับ users, assets, articles, offers, comments, tickets, alerts, notifications และ audit actions
- [ ] ห้ามเพิ่ม `Guest / Unauthenticated` เป็น user status constant ของ BO; ให้ถือเป็น FO access state และใช้เฉพาะ public access/analytics context
- [ ] ทำ shared table pattern: server pagination, search, filters, sort, column visibility ตามความเหมาะสม และ CSV/Excel export hook
- [ ] ทำ shared confirmation modal สำหรับ destructive actions พร้อม reason input เมื่อจำเป็น
- [ ] ทำ shared audit helper เพื่อกันไม่ให้ write action ข้าม audit logging
- [ ] ตรวจ shared layout ที่ 375px, 768px, 1280px และ 1440px

## 1. Auth And Permission

- [ ] Admin login รองรับ email/password เท่านั้น
- [ ] Admin must pass mandatory Email OTP verification after email/password
- [ ] Failed login ครบ 5 ครั้ง lock account 15 นาที
- [ ] Idle session หมดอายุหลัง 8 ชั่วโมง และ max session หลัง 24 ชั่วโมง
- [ ] BO ใช้ account type เดียวคือ `Admin`; role templates เป็น permission presets เท่านั้น ไม่ใช่ separate BO account types
- [ ] Seed baseline role templates: `Super Admin`, `Content Editor`, `Content Publisher`, `Moderator`, `Support Agent`
- [ ] Permission model ต้องมี explicit permission keys สำหรับ module access, create/edit draft, publish/schedule/archive, moderation action, sensitive reveal, export, settings update และ audit visibility
- [ ] Permission guard มีทั้ง route level และ action/API level
- [ ] UI menu/action hiding เป็น UX เท่านั้น และต้องมี backend/service enforcement ซ้ำทุกครั้ง
- [ ] BO reset password flow แยกจาก FO user reset password
- [ ] Login, logout, failed login, Email OTP sent/verified/failed/resend และ lockout events ต้อง audit-log

## 2. Dashboard

- [ ] แสดง new users วันนี้/สัปดาห์นี้/เดือนนี้
- [ ] แสดง Active Users Today เป็น primary Dashboard KPI
- [ ] แสดง asset count แยกตาม status
- [ ] แสดง offer made/accepted/rejected counts
- [ ] แสดง pending report count
- [ ] แสดง queue summary พร้อม SLA risk สำหรับ pending reports
- [ ] แสดง policy-based dashboard view ตาม permission ของ admin
- [ ] Metric/queue card ต้อง drill-in ไป module ที่เกี่ยวข้องพร้อม filter
- [ ] Dashboard ต้องรองรับ partial load error โดยไม่ล้มทั้งหน้า
- [ ] Dashboard responsive order ตรง prototype: Header -> KPI Summary -> Work Queue -> Recent Activity -> Dashboard Panels
- [ ] แสดง active watch alert count
- [ ] แสดง latest articles
- [ ] แสดง top searched brands
- [ ] แสดง recent activity feed
- [ ] Dashboard header แสดง `Last updated` และไม่ต้องมี Date Range / Refresh / Export controls ตาม prototype ปัจจุบัน
- [ ] Dashboard `New Users` และ `Active Users Today` ต้องนับเฉพาะ registered account/member activity และไม่รวม Guest public traffic
- [ ] Dashboard prototype ต้องไม่เพิ่ม guest/public analytics KPI, card, panel, chart หรือ drill-in; metric ชุดนี้อยู่ใน Reports & Analytics เท่านั้น

### Dashboard Prototype Handoff Notes

| Field | Detail |
| --- | --- |
| Prototype Reference | `Prototypes/bo-prototype.html` > Dashboard default screen |
| Spec Reference | `02_DASHBOARD_MODULE.md`, `BO_PRD.md` section 4.2, `PRD/DASHBOARD_UX_TEST_CASES.md` |
| Data Needed | Dashboard snapshot API should provide `lastUpdated`, KPI metrics, KPI chips, work queues, recent activities, status panels, top searched brands, and drill-in metadata. |
| Route / Drill-in | KPI cards, metric chips, Work Queue rows, Recent Activity rows, and Dashboard Panel rows must navigate to the related BO module/submodule with the equivalent filter context. |
| State Handling | Dev must implement section-level loading, empty, partial error, full error, stale data warning, and unauthorized section hiding. Prototype currently uses mock data only. |
| Permission / Privacy | Dashboard visibility must be policy-based. Hide module metrics/queues/activities if the Admin has no permission, and enforce permission again at destination routes/APIs. |
| Responsive QA | Verify 375px, 768px, 1280px, and 1440px. Mobile/tablet navigation uses hamburger drawer; Dashboard order must remain Header -> KPI Summary -> Work Queue -> Recent Activity -> Dashboard Panels. |
| FO Sync Impact | Dashboard signals come from FO-triggered data: reports, assets, offers, support, watch alerts, content, notifications, market/search activity, and account deletion. |
| Open Question | Final API shape, cache/freshness interval, and exact route/filter parameter names should be confirmed when Dev starts BO implementation. |

## 3. User Management

- [ ] User list รองรับ search, filter ตาม status/auth method และ sort ตาม last active, date joined, report count, asset count ตาม Prototype
- [ ] User profile แสดง account, auth method, profile, assets, activity, login history
- [ ] User detail แสดง reported user context และ linked report history ตาม permission
- [ ] Admin reset password ได้เฉพาะ email/password accounts
- [ ] Apple/Google accounts reset password จาก BO ไม่ได้
- [ ] Suspend, ban, unsuspend, unban และ Account Deletion handoff ต้อง enforce Admin Permission
- [ ] Suspend/ban/status action และ Account Deletion handoff ต้องมี confirmation, reason และ audit before/after ตาม policy
- [ ] User status changes ต้องส่งผลต่อ FO login/session/public behavior โดย `Suspended` และ `Banned` ต้อง revoke/block active session และ block login
- [ ] V1 ไม่มี `Restricted` หรือ feature-level restriction; `>= 3 reports` เป็น priority review เท่านั้น ส่วน `>= 5 reports/reporters` หรือ high-risk evidence จึงเข้า `Suspended` ตาม policy
- [ ] Suspend/ban ต้องส่ง email notification เป็น primary channel, in-app เป็น optional/secondary, และ delivery result ต้อง trace ผ่าน delivery log/audit ได้
- [ ] User List ไม่แสดง Export โดยตรงใน Phase 1; export user data ต้องไปผ่าน Reports/export หรือ system-level export ที่ควบคุม permission
- [ ] User List, User Detail, status filter และ account action flow ต้องไม่แสดง Guest/Unauthenticated visitor
- [ ] Mutation ทุกครั้งต้องเขียน audit log พร้อม before/after state

### User Management Prototype Handoff Notes

| Field | Detail |
| --- | --- |
| Prototype Reference | `Prototypes/bo-prototype.html` > `User Management` > `User List` and `Reported Users` submenu. |
| Spec Reference | `03_USER_MANAGEMENT_MODULE.md` sections 4, 5, 8, 10, 12, 15, 16, 17, and 19; `08_AUDIT_LOG_MODULE.md`; `13_ACCOUNT_DELETION_MODULE.md`. |
| Prototype / Spec Alignment | Prototype aligns with the Phase 1 spec for User List, User Detail, Reported Users, status/auth filters, sort modes, pagination, row action menu, reset-password eligibility, status-action confirmation views, Account Deletion routing, and no direct User List export. Production must add API-backed permission enforcement, masked/unmasked sensitive-field states, audit persistence, reason validation before mutation, and real FO sync/cache invalidation. |
| Data Needed | Replace mock users with server-paginated API data: user id, display name, username, masked email, auth method, verification state, account status, joined date/rank, last active/rank, asset count, report count, support/deletion reference, latest activity, allowed actions, blocked actions, action note, and FO impact copy. Do not include Guest/Unauthenticated visitor rows because they are not account records. |
| Route / Drill-in | Left nav route should support `User Management / User List` and `User Management / Reported Users` as sibling routes. Dashboard `New Users`, `Active Users Today`, and reported-user queue cards drill into the correct route with date/status/report context encoded in query params. User row actions open User Detail view, reset-password action view, status-action view, resend-verification context, or Account Deletion route when status is `Deletion Requested`; User List must not archive/delete directly. |
| Route / Filter | User List filters must map to query params/API fields for search, account status, auth method, sort mode, and page. Search covers display name, username, masked email, auth, verification state, account status, support/latest context, and internal user id/reference; phone/location are not primary searchable columns. Status filter is limited to `Pending Verification`, `Active`, `Suspended`, `Banned`, `Deletion Requested`, and `Deleted / Archived`; it must not include Guest/Unauthenticated. Report context is represented by report count/detail and the `Reported Users` submenu, not a separate User List filter in the current prototype. Reset clears search/filter/sort/page to defaults and should update query params. Logout/login must reset view state to Dashboard and must not keep expanded User Management submenu, active subroute, filter toggle state, custom select, query params, or pagination state. |
| State Handling | Implement loading, empty, no-result, partial-error, unauthorized, stale, and API failure states for summary cards, table, user detail view, reset-password action view, status-action view, and reported-user detail. Pagination is 10 users per page after search/filter/sort. New or sparse accounts must render without broken layout when profile/assets/offers/reports/activity are empty. |
| Permission / Privacy | BO has one `Admin` account type; enforce module/action permission at route, UI, API, and service level. UI hiding is not sufficient. Sensitive fields are masked by default in production, with reveal controlled by permission, business reason where required, and audit. Reset password is available only for Email accounts and blocked for Apple/Google/Pending Verification/Suspended/Banned/Deletion Requested/Deleted or Archived cases as specified by the prototype. Suspend, ban, restore, unban, resend verification, Account Deletion routing, sensitive reveal, and export each need separate permission keys. User List does not expose Export in Phase 1; export must route through Reports/export or system export with permission, scope control, expiry/background job, and audit. |
| Account Status Actions | Suspend/ban/restore/unban must use confirmation with reason, `Status before action`, `After confirmation`, FO impact preview, and audit note before mutation. Prototype currently shows reason controls but does not validate them; production/API must reject missing required reason before saving. `Deletion Requested` users can be viewed and routed to Account Deletion/dependency review, but User List must not archive/delete directly. `Deleted / Archived` appears in the current prototype list/filter for historical review, but actions are limited to permitted historical detail and sensitive fields must stay masked/anonymized. |
| Responsive QA | Verify 375px, 768px, 1280px, and 1440px against the prototype behavior. Desktop and wide desktop use the control-center layout: compact summary cards, top filter bar, dense table/list rows, row action menu, and structured detail/action views; do not introduce a persistent split list/detail layout for User Detail. Tablet/mobile use stacked card/list rows, hidden row headers, hamburger navigation, panel-header filter toggle, advanced filters expanding in the list area rather than a drawer/bottom sheet, reachable row action menu, and detail/action content that stacks without clipped Thai text. Also verify auth cycle on mobile: User List -> logout -> login returns to Dashboard with nav closed and no User Management submenu, query params, custom select, filter toggle, or pagination state retained. |
| FO Sync Impact | Account status changes must update FO login/session behavior, account access, public profile visibility, and any dependent cache/indexes. Suspended and Banned must revoke/block active sessions and block login/action access until restore/unban; users should see the FO account-status state rather than entering the main app. V1 has no `Restricted`/feature-level account state. Pending Verification cannot use authenticated FO features; Deletion flow belongs to Account Deletion and may revoke sessions, hide profile/assets, and anonymize/archive according to dependency/grace-period policy. Suspend/ban must trigger email notification as the primary channel, with optional secondary in-app notification and delivery result traceable through Notifications/Audit. Profile, Feed, Search, Asset Detail, Board, Notification, Watch Alert, Offer/Chat, Support, Reports, and Audit must consume the same account-state result consistently. Sync should define event name/payload, timing, retry behavior, stale-state handling, and admin-visible failure state. |
| Open Question | Confirm final route names/query params, backend enum-to-Thai label mapping, exact permission keys for sensitive reveal/export/reset/resend-verification/status mutations, final FO sync event contract and cache invalidation timing, and production policy for how broadly `Deleted / Archived` historical rows should appear beyond the prototype review state. |

## 4. Asset Management

- [ ] Asset list รองรับ Sale, Show, Hide, Sold, flagged และ removed states
- [ ] Implementation ต้องใช้ `Show` และ `Hide` ตาม FO เป็นหลัก และ normalize คำเก่าจาก legacy source ก่อนใช้งาน
- [ ] Filters มี status, brand, owner, price range, flagged
- [ ] เพิ่ม filter สำหรับ reported, ซ่อนถาวร, ลบโดยเจ้าของ, has consignment, created/updated date range
- [ ] Asset detail แสดงข้อมูลที่จำเป็นต่อ review ครบ
- [ ] Provenance, proof of payment, consignment และ sale history ต้องจำกัดตาม Admin access
- [ ] Sensitive fields ต้อง mask เป็น default และ reveal ได้เฉพาะ admin access ที่มี permission
- [ ] Reported asset ต้องเข้า moderation queue และไม่หายจาก FO ทันทีเว้นแต่มี policy ชัดเจน
- [ ] Flag/unflag, ซ่อนชั่วคราว, ยกเลิกซ่อนชั่วคราว, ซ่อนถาวร และ force status change ต้องมี confirmation, reason และ update FO visibility rules
- [ ] Status change ต้อง sync ผลไป Feed, Search, Profile, Asset Detail และ Watch Alert ตาม visibility matrix
- [ ] Asset lifecycle ที่มี pending offers ต้อง sync ไป Offer policy: ซ่อนชั่วคราว/auto hidden -> `Paused`, review passed -> `Pending`, ซ่อนถาวร -> `Invalidated`, ลบโดยเจ้าของหรือ Sale/Show -> Hide -> `Cancelled`, Sold -> `Rejected`
- [ ] Sold assets ยังใช้สำหรับ owner history และ admin review
- [ ] Asset mutations ทุกครั้งต้องเขียน audit log พร้อม before/after state
- [ ] Asset Management UI ต้อง responsive ที่ 375px, 768px, 1280px และ 1440px

### Asset Management Prototype Handoff Notes

| Field | Detail |
| --- | --- |
| Prototype Reference | `Prototypes/bo-prototype.html` > `Asset Management` > `Asset List`, `Asset Detail`, `Reported Assets`, and `Asset Report Detail`. |
| Spec Reference | `04_ASSET_MANAGEMENT_MODULE.md` sections 3-16; `08_AUDIT_LOG_MODULE.md`; `09_OFFER_CHAT_MODULE.md`; `11_WATCH_ALERT_MODULE.md`; `../FrontOffice/02_FEED_MODULE.md`; `../FrontOffice/03_SEARCH_FILTER_MODULE.md`; `../FrontOffice/05_ASSET_DETAIL_MODULE.md`. |
| Prototype / Spec Alignment | Prototype aligns with the Phase 1 Asset Management baseline for asset list/detail, canonical asset statuses `Sale`, `Show`, `Hide`, `Sold`, moderation states such as `Admin Hidden` / `Auto Hidden`, reported-asset queue, report detail, confirmation flows, before/after audit notes, FO impact messaging, and responsive operational layout. Production must add server/API permission enforcement, full sensitive-field masking/reveal workflow, required reason validation, persistent audit records, and real FO sync/cache invalidation. |
| Data Needed | Replace mock asset rows with server-paginated API data: asset id, title, brand, model/reference, owner id/name/account status, status, moderation state, report count/report id, reporter count, report reason, priority, price or private-price state, created/updated timestamps, comment/favorite counts, uploaded images, technical specs, description, purchase/provenance proof, sale history, status history, moderation/audit history, allowed actions, blocked actions, and FO impact copy. |
| Route / Drill-in | Left nav has sibling routes `Asset Management / Asset List` and `Asset Management / Reported Assets`. Asset row click or row action opens `Asset Detail` with breadcrumb `Asset Management / Asset List / {assetId}` and back to Asset List. Reported Assets row/action opens Asset Report Detail; `View Asset` opens the asset detail modal/context from the report. Dashboard asset KPI/status/report queue links should preserve equivalent route/filter context. |
| Route / Filter | Asset List prototype filter set is search, asset status, brand, sort, page, and reset. Search covers Asset ID, asset title, owner, brand/model/reference-related text from the row/detail mapping. Status filter includes `Sale`, `Show`, `Hide`, `Sold`, `ซ่อนถาวร`, and `ลบโดยเจ้าของ`; production API must still support spec-level filters for moderation state, reported/flagged, owner, price range, consignment, provenance/proof permission state, and created/updated date range when Product asks to expose them. Reported Assets filters are search, report status `Pending`/`Cleared`, priority, sort by latest/reporters/waiting, page, and reset. Reset clears search/filter/sort/page and should update query params. Logout/login should return to Dashboard and must not retain Asset Management submenu, active subroute, filter toggle state, custom select, query params, selected asset/report, or pagination state. |
| State Handling | Implement loading, empty, no-result, partial-error, unauthorized, stale-data, invalid-state, policy-blocked, sync-failed, permanent-hide/save-failed, audit-failed, session-expired, and unavailable states for Asset List, Asset Detail, Reported Assets, Asset Report Detail, action confirmations, image/proof sections, and audit/history panels. Prototype includes sample error scenarios in action/report confirmation flows but uses in-memory mutation only. |
| Permission / Privacy | BO has one `Admin` account type; enforce module/action permission at route, UI, API, and service layers. Separate permission keys are needed for module view, detail view, reported queue view, sensitive reveal, purchase/provenance proof view, sale history view, force hide, restore temporary hide, permanent hide, close/clear report, export, and audit history. Sensitive purchase price/date/from, proof of payment, consignment contact/terms, owner contact, and sold history must be masked by default in production and reveal only by policy with audit. UI hiding is not sufficient, and direct URL/API access must be rejected server-side. |
| Asset Actions | Prototype action availability follows current asset type and moderation state: Admin can force-hide public `Sale`/`Show` assets in active/reported/reviewing states, restore only temporarily hidden assets, and permanently hide public or temporarily hidden assets according to policy. `Hide` owner-only and `Sold` history states are not quick force-hide targets in V1. Confirmation flows must require reason/note before mutation in production, persist before/after asset status and report status, and close/clear related pending reports only for valid restore/permanent-hide outcomes. ลบโดยเจ้าของ is shown as retained BO record and has no standard moderation action. |
| Responsive QA | Verify 375px, 768px, 1280px, and 1440px. Desktop/wide desktop use dense operational rows, summary cards, top filter controls, row action menus, and full Asset Detail layout with FO preview plus BO context. Tablet/mobile use stacked card rows, hidden table headers, hamburger navigation, filter toggle with advanced filters expanding in the list area, reachable row action menus, image galleries/thumbnails that do not overflow, and detail/report/action views that stack without clipped Thai text. |
| FO Sync Impact | Asset visibility changes must update FO Feed, Search, Asset Detail/public deep links, Profile/Collection, Watch Alert matching/results, Board/comment references where applicable, Offer/Chat references, and Notifications/delivery context. `Sale` returns to Feed/Search/Watch Alert and may accept offers; `Show` stays profile/detail only and must not match Feed/Search/Watch Alert; `Hide`, `Sold`, `ลบโดยเจ้าของ`, `ซ่อนชั่วคราว`, and `ซ่อนถาวร` are not public marketplace results and do not accept new offers. Offer impact is fixed: ซ่อนชั่วคราว/auto hidden -> `Paused`, review passed -> `Pending`, ซ่อนถาวร -> `Invalidated`, ลบโดยเจ้าของ or owner Hide -> `Cancelled`, Sold -> `Rejected`. Sync contract must define event names, payload, timing, retry/idempotency, cache/index invalidation, admin-visible failure state, and audit correlation id. |
| Open Question | Confirm final route names/query params, exact permission key names, whether spec-only filters become visible in V1 UI or remain API/report filters, sensitive reveal approval level, and final FO sync/cache invalidation SLA for moderation actions. Restore from ซ่อนถาวร is out of standard moderation flow; restore remains available only for temporary hide. |

## 5. Content / Board

- [ ] Article list รองรับ draft, scheduled, published, archived
- [ ] Article editor รองรับ title, slug, excerpt, cover image, alt text, category, tags, author, read time, quote, body, related articles, SEO fields
- [ ] Preview as FO ต้องเป็น admin-only และไม่เพิ่ม view count
- [ ] Publish now และ schedule publish ต้องใช้เวลาแสดงผลตาม Asia/Bangkok
- [ ] Archived articles ต้องหายจาก Board/search/category
- [ ] FO Board Main ต้องใช้ Published Articles เท่านั้นสำหรับ Main Hero, Trending Now และ Journal Board preview; Phase 1 ไม่ใช้ Banner entity, Featured toggle หรือ Featured order
- [ ] Eligible article query ต้องใช้ `status = Published`, `publishDateTime <= now` ตาม Asia/Bangkok, active category, required FO card fields ครบ และไม่เป็น archived/unpublished/deleted/policy-hidden
- [ ] Automatic fallback ordering ต้องเป็น `publishDateTime DESC`, `updatedAt DESC`, `articleId DESC`
- [ ] Main Hero ต้องเลือก eligible article ลำดับแรก และ reserve `articleId` ไม่ให้ซ้ำใน Trending Now หรือ Journal Board preview บน Board Main
- [ ] Trending Now ต้องเลือกจาก eligible articles ที่ไม่ใช่ Main Hero; ถ้ามี trending score ให้ใช้ score ก่อนแล้ว fallback ordering, ถ้ายังไม่มี score ให้ใช้ latest remaining articles
- [ ] Journal Board preview บน Board Main ต้องเลือกจาก eligible articles ที่ยังไม่ถูกใช้ใน Main Hero/Trending Now; ถ้าไม่มี remaining article ให้ซ่อน section preview
- [ ] Journal Board View All ต้องเป็นหน้ารวม eligible Published Articles ทั้งหมด เรียงตาม fallback ordering และอนุญาตให้มีบทความเดียวกับ Hero/Trending ได้
- [ ] Category hero/list ต้องดึงจาก eligible Published Articles ของ active category นั้น โดยใช้ fallback ordering และหลีกเลี่ยงการซ้ำภายในหน้าเดียวกัน
- [ ] Category active/inactive ต้องส่งผลต่อ FO category sidebar
- [ ] Banner management เป็น future scope เฉพาะ campaign/promotion/event/sponsor/external link/non-article deep link และไม่อยู่ใน Phase 1 Board Main
- [ ] Report article จาก FO ต้องเข้า BO reported Board Content handoff และไม่ทำให้ article หายทันที
- [ ] Publish/archive/category actions ต้อง audit-log พร้อม before/after state
- [ ] Article editor และ preview ต้อง responsive ที่ 375px, 768px, 1280px และ 1440px

## 6. Market Data

- [ ] Brand CRUD รองรับ EN/TH names, logo, country, founded year, official website, active status
- [ ] Model CRUD รองรับ brand relation, reference numbers, specs, active status
- [ ] Price index รองรับ brand/model/reference, min/max THB, source URL, updated date, history
- [ ] Inactive brand/model ต้องหยุด Watch Alert trigger ใหม่ และไม่แสดงใน FO autocomplete/filter
- [ ] Market data changes ต้อง audit-log
- [ ] Reference number management ต้องผูก brand/model และใช้กับ Add Asset/Search/Price Index matching
- [ ] The Watch API ต้องถูกเรียกจาก backend sync/cache เท่านั้น ห้าม FO client เรียกตรง
- [ ] ข้อมูลจาก The Watch API ต้องถูกเก็บใน TukDaeng database ก่อน BO/FO ใช้งาน
- [ ] BO ต้องรองรับ Admin เพิ่ม/แก้/override brand/model/reference/price index ตาม permission
- [ ] ห้าม hard delete brand/model/reference/price index ที่เคยถูกใช้กับ asset, alert, price history หรือ audit แล้ว ให้ใช้ inactive/soft delete
- [ ] Manual override ต้องไม่ถูก provider sync overwrite โดยไม่ผ่าน conflict review
- [ ] เก็บ provider metadata: provider name, endpoint/source level, provider updated date, synced date, sync status
- [ ] Provider price จาก The Watch API เป็น USD ต้องมี USD -> THB conversion metadata ก่อนใช้ใน FO
- [ ] รองรับ provider error/rate limit/usage limit และ fallback ไป cached data ล่าสุด
- [ ] Import ต้องมี dry-run validation, duplicate detection และ error report รายแถว
- [ ] Market data sync/cache invalidation ต้องครอบคลุม Add Asset, Search Filter, Watch Alert และ Portfolio
- [ ] Existing asset ต้องยังเก็บ historical brand/model/reference ได้แม้ master data ถูก inactive
- [ ] Market Data UI ต้อง responsive ที่ 375px, 768px, 1280px และ 1440px

### Market Data Prototype Handoff Notes

| Area | Notes |
| --- | --- |
| Prototype / Spec Alignment | `Prototypes/bo-prototype.html` currently exposes Market Data as a shared operational list shell with submenu entry points for `Brands`, `Models`, `Price Index`, and `Import`. This aligns with the high-level module scope, but it is not yet a full CRUD/import workflow. |
| Implementation Gap | Production still needs dedicated brand/model/reference/price-index forms, provider sync metadata, manual override conflict review, import dry-run validation, duplicate/error report rows, and server-side pagination. |
| Permission / Audit | Create/update/activate/inactivate/import/export/provider-sync actions need separate permission keys and audit events with before/after values. UI hiding is not enough. |
| FO Sync Impact | Market-data changes must invalidate FO Add Asset autocomplete, Search filters/autocomplete, Watch Alert criteria/matching, Portfolio valuation, and Watch Price surfaces. Inactive data must stop new FO selection and new Watch Alert triggers while preserving historical assets and alert history. |

## 7. Directory

- [ ] Postponed from Phase 1; do not expose BO Directory navigation, route, CRUD, import/export, publication control, map/contact/image fields, or FO sync behavior in the Phase 1 prototype/build.
- [ ] Keep `07_DIRECTORY_MODULE.md` as future reference only until Product approves FO directory detail routes and confirms the taxonomy for Watch Shops, Accessories Shop, Repair Shop, Auction Center, Consignment Center, Authentication Center, and Community.
- [ ] If Product reopens Directory later, restore the full item/category CRUD, publication, audit, map-provider, import, and responsive requirements from `07_DIRECTORY_MODULE.md`.

### Directory Prototype Handoff Notes

| Area | Notes |
| --- | --- |
| Prototype / Spec Alignment | Directory has been removed from the Phase 1 BO prototype navigation because FO only has placeholder menu entries and no approved directory detail pages. |
| Implementation Gap | No Phase 1 implementation. Future scope must restart from `07_DIRECTORY_MODULE.md` after FO route/detail scope is approved. |
| Permission / Audit | No Phase 1 Directory permissions or audit events are required because Directory mutations are not exposed. |
| FO Sync Impact | No Phase 1 FO Directory sync. Placeholder FO menu entries must not imply active BO Directory publication. |

## 8. Audit Log

- [ ] Audit log บันทึก admin ID, admin access, action type, target type, target ID, before value, after value, IP address, timestamp และ reason เมื่อมี
- [ ] Audit log ต้อง immutable จาก admin UI ปกติ
- [ ] เฉพาะ Admin ดู/export full audit log ได้
- [ ] Audit log filter ได้ตาม admin, admin access, action, target, date range
- [ ] Sensitive data reveal/export, provider sync, import/export และ background job ต้อง audit-log
- [ ] Audit log ต้องมี correlation ID สำหรับ workflow/job ที่มีหลาย event
- [ ] Audit export ต้อง audit ตัวเองและมี controlled access/expiry
- [ ] Retention baseline อย่างน้อย 1 ปี
- [ ] Audit Log UI ต้อง responsive ที่ 375px, 768px, 1280px และ 1440px

### Audit Log Prototype Handoff Notes

| Area | Notes |
| --- | --- |
| Prototype / Spec Alignment | Audit Log is reachable from Settings via the `Audit Log` submenu route and appears as a read/review surface in the shared prototype shell. This matches the navigation expectation, but production still needs a dedicated immutable audit list/detail implementation. |
| Implementation Gap | Production must add server-side search/filter/sort/pagination, audit detail with before/after diff, correlation-id grouping, masked payload states, export workflow, and error/empty/loading states. |
| Permission / Audit | Full audit visibility and export must be permission controlled. Audit export must create its own audit event and use controlled access/expiry. |
| FO Sync Impact | Audit rows should trace BO actions that affect FO visibility, notifications, account access, content publication, marketplace/search state, Watch Alert triggers, and exports. |

## 9. Offer Management

- [ ] Offer list ต้องรองรับ search/filter/sort/pagination และ status `Pending`, `Paused`, `Accepted`, `Rejected`, `Cancelled`, `Invalidated`
- [ ] Implementation ต้องใช้ `Rejected` ตาม FO เป็นหลัก และ normalize legacy `Declined` เป็น `Rejected`
- [ ] FO button/action copy ต้องใช้ `Decline` ได้ แต่เมื่อกดแล้วต้องเปลี่ยน status เป็น `Rejected`
- [ ] Offer detail ต้องแสดง asset summary, buyer, owner, offer timeline, related chat room, notification delivery และ audit events
- [ ] Offer status timeline ต้องเก็บ actor/source, timestamp, before/after state และ reason เมื่อจำเป็น
- [ ] Offer Management V1 ต้องเป็น read-only ไม่มี accept/decline/cancel/force-expire/invalidate action
- [ ] Asset ลบโดยเจ้าของต้องทำให้ related offers เป็น `Cancelled` ตาม FO Offer policy
- [ ] Owner เปลี่ยน asset จาก `Sale`/`Show` เป็น `Hide` ต้องทำให้ pending offers เป็น `Cancelled`
- [ ] Asset sold ต้อง auto reject other pending offers เป็น `Rejected` ตาม FO Offer policy
- [ ] Asset ถูก auto hidden จาก report หรือซ่อนชั่วคราวระหว่าง review ต้องทำให้ pending offers เป็น `Paused` และ FO ต้องไม่แสดง Accept/Decline
- [ ] Review ผ่านและ asset กลับเป็น `Sale`/`Show` ต้องทำให้ `Paused` offers กลับเป็น `Pending`
- [ ] Asset ถูกซ่อนถาวรจาก moderation ต้องทำให้ pending/paused offers เป็น `Invalidated`
- [ ] `Show` asset ต้องรองรับ offer/contact เฉพาะ Asset Detail/Public Profile detail ตาม FO rule และไม่ขึ้น Feed/Search/Watch Alert
- [ ] `Hide`, `Sold`, `ซ่อนถาวร`, `ลบโดยเจ้าของ` ต้องไม่รับ offer ใหม่
- [ ] Related chat context ต้องเปิดแบบ read-only ตาม permission และ privacy masking
- [ ] User report จาก chat ต้อง route ไป `User Management > Reported Users` พร้อม `Sources = Chat`
- [ ] FO Delete Chat ต้องเป็น user-level visibility เท่านั้น ห้าม hard delete server record โดยไม่มี retention/audit policy
- [ ] Blocked users ต้องส่งข้อความใหม่ไม่ได้ แต่ history เดิมยังอ่านได้ตาม FO read-only rule
- [ ] Admin ห้าม edit user message หรือ offer price โดยตรง
- [ ] Offer notification delivery ต้อง trace ได้ แต่ template/retry อยู่ใน Notification module
- [ ] Pending offer ต้องเป็น dependency สำหรับ block account deletion
- [ ] Export offer history ต้องจำกัด permission และ audit export event
- [ ] Offer Management UI ต้อง responsive ที่ 375px, 768px, 1280px และ 1440px

### Offer Management Prototype Handoff Notes

| Area | Notes |
| --- | --- |
| Prototype / Spec Alignment | The prototype exposes `Offer Management` with `Offer List` as a read-only overview for asset interest, buyer/seller, offer price, status, and related chat context. It removes chat-report/dispute queue wording; user reports from chat belong in `User Management > Reported Users`. |
| Implementation Gap | Production still needs offer detail, buyer/owner/asset summaries, offer timeline, related chat read-only context, notification delivery, permission-gated export, and empty/loading/error states. |
| Permission / Audit | Offer list/detail is read-only. Sensitive reveal, related-chat view, and offer export must be permission-gated and audit-logged. No V1 write action should appear in this module. |
| FO Sync Impact | Offer status must reflect FO/system events: seller accept/decline, asset deleted or owner hide -> `Cancelled`, asset sold -> other pending offers `Rejected`, asset auto-hidden/temp-hidden -> `Paused`, review passed -> `Pending`, permanent hide -> `Invalidated`, notification delivery context, and account-deletion dependency checks. |

## 11. Watch Alert Management

- [ ] Watch Alert list ต้องรองรับ search/filter/sort/pagination และ export ตาม permission
- [ ] Alert detail ต้องแสดง owner, alert name, criteria, status, notification toggle และ trigger history
- [ ] Criteria schema ต้องใช้ schema เดียวกับ Search Filter และทุก field ต้อง optional
- [ ] Alert name ต้อง optional และรองรับ generated/default name
- [ ] Watch Alert match ต้องใช้เฉพาะ asset status `Sale`
- [ ] Watch Alert ต้องไม่ match `Show`, `Hide`, `Sold`, `ลบโดยเจ้าของ`, `ซ่อนถาวร`
- [ ] Watch Alert notification destination ต้องเป็น `Watch Alert Result List` ห้ามเปิด Asset Detail โดยตรง
- [ ] Trigger history ต้องเก็บ criteria snapshot, matched asset, trigger time, notification event และ exclusion reason ถ้ามี
- [ ] Block relation ต้องเป็น exclusion context สำหรับ trigger/result review
- [ ] Market data inactive dependency ต้องแสดง warning และหยุด new trigger ตาม policy แต่ไม่ลบ history เดิม
- [ ] Admin disable alert ได้ตาม permission พร้อม confirmation, reason และ audit
- [ ] Disabled alert ต้องหยุด trigger notification ใหม่
- [ ] Admin enable alert ได้ตาม permission พร้อม criteria revalidation และ audit
- [ ] Notification delivery trace ดูได้ แต่ template/retry อยู่ใน Notification module
- [ ] Watch Alert UI ต้อง responsive ที่ 375px, 768px, 1280px และ 1440px

### Watch Alert Prototype Handoff Notes

| Area | Notes |
| --- | --- |
| Prototype / Spec Alignment | The prototype exposes `Alert Criteria`, `Trigger History`, and `Disabled Alerts`, which matches the spec-level Watch Alert operating areas. It does not yet include full alert detail, criteria revalidation, or disable/enable confirmation flows. |
| Implementation Gap | Production still needs owner/criteria detail, optional/generated alert name handling, trigger-history snapshots, exclusion reasons, inactive market-data warnings, and notification-delivery trace. |
| Permission / Audit | Disable/enable/export and criteria-sensitive reveal need separate permission checks and audit. Enable must revalidate criteria before saving. |
| FO Sync Impact | Matching must remain Sale-only. `Show`, `Hide`, `Sold`, owner-deleted, permanently hidden, blocked relation, and inactive market-data cases must not generate new FO Watch Alert notifications. Notification destination must remain `Watch Alert Result List`. |

## 12. Help & Support

- [ ] Ticket queue ต้องรองรับ search/filter ตาม Ticket ID, user, channel, type, priority, status, assignee, SLA และ date range
- [ ] BO ต้องรองรับ manual ticket จาก LINE / Phone / Email ตาม FO Help contact-only baseline
- [ ] Ticket detail ต้องแสดง requester context, account status, source channel, conversation, internal note และ related entity
- [ ] Status ต้องใช้ `New`, `Open`, `In Progress`, `Waiting User`, `Resolved`, `Closed`, `Spam / Invalid`
- [ ] Priority ต้องใช้ `Urgent`, `High`, `Medium`, `Low`
- [ ] First response SLA ต้องตั้ง baseline 8 ชั่วโมง และแสดง On track / Near breach / Breached
- [ ] Admin must assign, reply, add internal note, link entity, and change priority/status according to action policy
- [ ] Internal note ต้องไม่แสดงให้ผู้ใช้และไม่ sync ไป FO
- [ ] ถ้า FO เปิด in-app ticket history ในอนาคต BO reply/status ต้อง sync กลับ FO ตาม contract
- [ ] Ticket ต้อง link ไป User, Asset, Offer, Chat, Report, Watch Alert, Notification, Market Data หรือ Account Deletion ได้ตาม permission
- [ ] Sensitive reveal, export, status change, reply และ assignment ต้องมี audit log
- [ ] Help / Support UI ต้อง responsive ที่ 375px, 768px, 1280px และ 1440px

### Help & Support Prototype Handoff Notes

| Area | Notes |
| --- | --- |
| Prototype / Spec Alignment | The prototype exposes `Tickets`, `Assignment`, and `SLA`, and Dashboard includes support-ticket counts. This aligns with the support operating model, but it is not yet a complete ticket detail/reply/manual-ticket workflow. |
| Implementation Gap | Production still needs ticket detail, requester context, related entity links, reply history, internal notes, assignment/change-priority/status flows, manual ticket creation from LINE/Phone/Email, and full SLA states. |
| Permission / Audit | Assignment, reply, internal note, link entity, priority/status change, sensitive reveal, and export require permission checks and audit. Internal notes must never sync to FO/user-facing channels. |
| FO Sync Impact | FO V1 remains contact-only unless Product opens in-app ticket history. If in-app ticket history is enabled later, BO status/reply sync needs a separate contract. First response SLA baseline remains 8 hours. |

## 13. Account Deletion Requests

- [ ] Deletion request queue ต้องรองรับ search/filter ตาม Request ID, user, status, account status, pending offer, grace period และ requested date
- [ ] Request detail ต้องแสดง user context, deletion timeline, pending offers, assets, chats, reports และ support tickets
- [ ] หลัง FO Delete Account สำเร็จ account ต้องเข้าสู่ deactivated/login blocked state และ public profile/assets ต้องถูกซ่อน
- [ ] Grace period ต้องใช้ baseline 30 วันและแสดง active / ending soon / expired
- [ ] Pending incoming/outgoing offer ต้อง block archive/anonymization ได้
- [ ] Recheck blocking conditions ต้อง query dependency ล่าสุดจาก Offer Management, Asset, Report และ Support modules
- [ ] Archive approval, request cancellation, anonymization trigger, and archive report export require Admin access policy, confirmation, reason, and audit
- [ ] Admin ดู request และ recheck blocking conditions ได้ แต่ approve/cancel/export ไม่ได้
- [ ] Archive/anonymization plan ต้องแยก hide, retain, archive และ anonymize ต่อ entity ให้ชัด
- [ ] Sensitive reveal, recheck, blocked, approve archive, archive complete, anonymize complete, cancel และ export ต้องมี audit log
- [ ] Account Deletion UI ต้อง responsive ที่ 375px, 768px, 1280px และ 1440px

### Account Deletion Prototype Handoff Notes

| Area | Notes |
| --- | --- |
| Prototype / Spec Alignment | The prototype exposes `Requests`, `Grace Period`, and `Anonymization`, and user records can route deletion-requested users toward the Account Deletion context. This aligns with the module boundary, but full dependency review and archive/anonymization workflows are still implementation gaps. |
| Implementation Gap | Production needs request detail, dependency recheck across Offer/Chat, Asset, Report, and Support modules, 30-day grace-period state, archive/anonymization plan, cancellation, export, and stale dependency handling. |
| Permission / Audit | Recheck, approve archive, cancel, anonymize, sensitive reveal, and export must be permission-gated and audit-logged with before/after values and reason. |
| FO Sync Impact | Successful FO delete-account flow must block login/deactivate account, hide public profile/assets, preserve required records for retention, and only anonymize/archive after blocking dependencies are resolved. |

## 14. Notifications

- [ ] Notification dashboard ต้องแสดง broadcast list, system trigger templates, delivery logs และ failed delivery summary
- [ ] Broadcast ต้องรองรับ Draft, Pending Approval, Scheduled, Sending, Sent, Cancelled และ Failed
- [ ] Broadcast ต้องมี title, body, optional image, channel, target audience, deep link, send now/schedule และ preview
- [ ] Broadcast ที่ส่งถึงผู้ใช้จริงต้องผ่าน Admin approval
- [ ] Generic Broadcast ห้ามแสดงใน FO Notification Center จนกว่า master decision เพิ่ม scope หรือ mapping ชัดเจน
- [ ] System trigger ต้องรองรับ Like, Comment, Follow, New Offer, Offer Accepted, Offer Rejected, Offer Cancelled และ Watch Alert
- [ ] FO Notification Center ต้องรองรับเฉพาะ Like, Comment, Follow, Offer และ Watch Alert ตาม V1 baseline
- [ ] Chat / New Message ต้องไม่เข้า Notification Center และใช้ Chat badge/count เท่านั้น
- [ ] Watch Alert notification destination ต้องเป็น Watch Alert Result List เท่านั้น
- [ ] System template ต้องใช้ allowlist variables และห้ามใส่ sensitive data เช่น phone, email, LINE หรือ internal note
- [ ] Disabled notification type ต้องไม่ส่ง notification ใหม่
- [ ] Delivery log ต้องเก็บ queued/sent/delivered/opened/failed/skipped พร้อม failure reason
- [ ] Retry failed notification ต้องมี idempotency guard และ audit log
- [ ] Template update, type enable/disable, broadcast approve/send/cancel, retry และ export ต้องมี audit log
- [ ] Notifications UI ต้อง responsive ที่ 375px, 768px, 1280px และ 1440px

### Notifications Prototype Handoff Notes

| Area | Notes |
| --- | --- |
| Prototype / Spec Alignment | The prototype exposes `Broadcast`, `System Templates`, and `Delivery Logs`, plus Dashboard `Broadcast Ready` counts. This matches the module split but not the full broadcast approval/template/retry implementation. |
| Implementation Gap | Production still needs broadcast draft/approval/schedule/send/cancel, preview, system trigger template configuration, delivery log detail, retry/idempotency, failed/skipped reason handling, and export. |
| Permission / Audit | Template update, type enable/disable, broadcast approve/send/cancel, retry, sensitive reveal, and export require permission checks and audit. |
| FO Sync Impact | FO Notification Center V1 must remain limited to Like, Comment, Follow, Offer, and Watch Alert. Generic Broadcast must not appear in the FO in-app list until Product confirms scope. Watch Alert notification destination must remain `Watch Alert Result List`; Chat/New Message uses chat badge/count, not Notification Center. |

## 15. Reports & Analytics

- [ ] Report catalog ต้องมี User, Asset, Offer, Chat, Content / Board, Asset Reported Comments, Search, Watch Alert, Support, Notification และ Account Deletion reports
- [ ] ทุก report ต้องรองรับ date range, filter, sort, policy-based visibility และ last updated
- [ ] ทุก report ที่ export ได้ต้องรองรับ CSV และ Excel ตาม permission
- [ ] Large export ต้องใช้ background job พร้อม status Queued / Processing / Completed / Failed / Expired / Cancelled
- [ ] Sensitive data ต้อง mask เป็น default และ sensitive view/export ต้อง audit-log
- [ ] User Report ต้องแสดง new users, DAU/MAU, auth method, account status และ support/deletion signals
- [ ] User Report ต้องแยก Guest public view/share analytics ออกจาก registered-user metrics และต้องไม่ใช้ Guest เป็น account status/filter
- [ ] User Report ต้องรองรับ explicit guest/public metrics ได้แก่ Guest Visitors, Public Asset Views, Public Article Views, Public Profile Views, Public Shares และ Guest-to-Signup Conversion เมื่อ tracking เปิดใช้
- [ ] Asset Report ต้องใช้ status `Show` / `Hide` ตาม FO และไม่ใช้ legacy collection wording
- [ ] Offer Report ต้องใช้ status `Rejected` ไม่ใช้ `Declined`
- [ ] Chat Report ต้องจำกัด transcript export ตาม permission และ audit ทุกครั้ง
- [ ] Search Report ต้องแสดง top searched keywords/brands/models, no-result searches และ save-as-watch-alert conversion ถ้ามี tracking
- [ ] Watch Alert Report ต้องยืนยัน Sale-only match และ destination `Watch Alert Result List`
- [ ] Support Report ต้องวัด first response SLA 8 ชั่วโมง
- [ ] Notification Report ต้องแสดง queued/sent/delivered/opened/failed/skipped และ failure reason
- [ ] Account Deletion Report ต้องแสดง blocked reason, grace period และ archive/anonymization status
- [ ] Reports UI ต้อง responsive ที่ 375px, 768px, 1280px และ 1440px

### Reports & Analytics Prototype Handoff Notes

| Area | Notes |
| --- | --- |
| Prototype / Spec Alignment | The prototype exposes Reports with `User`, `Asset`, `Offer`, `Search`, and `Export Jobs`. This covers the visible shell, but the spec requires the full report catalog: User, Asset, Offer, Chat, Content/Board, Asset Reported Comments, Search, Watch Alert, Support, Notification, Account Deletion, and Export Job/Access History. |
| Implementation Gap | Production still needs report catalog/detail views, date range/filter/sort controls, last-updated timestamps, chart/table fallbacks, CSV/Excel exports, background export job states, and sensitive report-access handling. |
| Permission / Audit | Report access must be policy-based. Sensitive report views/exports require masking by default, explicit permission, reason where required, and audit events for request/complete/fail/download. |
| FO Sync Impact | Reports must use canonical FO terms: asset `Show`/`Hide`, offer status `Rejected`, Watch Alert Sale-only matching and `Watch Alert Result List` destination, first-response support SLA 8 hours, and guest/public analytics separated from registered-user metrics. |

## 16. Admin Settings

- [ ] Admin ทุก admin access ต้องเข้าดู own profile/settings และเปลี่ยน password ตาม rule ได้
- [ ] Admin ต้องจัดการ admin account lifecycle: invite, change admin access policy, suspend/reactivate, unlock, archive
- [ ] ระบบต้องป้องกันการ suspend/archive/change admin access policy ของ Admin active คนสุดท้าย
- [ ] Settings submenu ต้องมี `Roles & Permissions` สำหรับ role templates และ module/action policy
- [ ] Roles & Permissions matrix ต้องแสดงสิทธิ์ตาม role template, module, action และ enforce ทั้ง UI/API/service level
- [ ] Content role split ต้องรองรับ `Content Editor` สำหรับ draft authoring และ `Content Publisher` สำหรับ publish/schedule/archive/reported Board actions
- [ ] Permission change ต้องมี confirmation, reason, before/after diff และ audit log
- [ ] Security policy ต้องสอดคล้องกับ Auth baseline: email/password only, mandatory Email OTP สำหรับ Admin, idle 8h, max 24h, failed login 5 ครั้ง, lockout 15 นาที
- [ ] Retention settings ต้องไม่อนุญาต manual delete audit logs จาก UI ปกติ
- [ ] Export policy ต้องรองรับ CSV/Excel, background job, expiry, sensitive export reason และ audit
- [ ] Feature flags ต้องแสดง FO/BO impact ก่อนบันทึก และ audit ทุกครั้ง
- [ ] Integration settings ต้องแสดง metadata/status เท่านั้น และห้ามเปิดเผย secrets ใน BO UI
- [ ] System defaults ต้องแสดง timezone `Asia/Bangkok`, currency THB, Thai-primary language, server pagination และ sensitive masking baseline
- [ ] Settings change history ต้อง link ไป Audit Log detail ตาม permission
- [ ] Admin Settings UI ต้อง responsive ที่ 375px, 768px, 1280px และ 1440px

### Admin Settings Prototype Handoff Notes

| Area | Notes |
| --- | --- |
| Prototype / Spec Alignment | The prototype exposes `Admin Accounts`, `Roles & Permissions`, `Security`, `Retention`, policy/support content entries, `Version History`, and an `Audit Log` route from Settings. This matches the high-level Settings scope, but the full admin-account lifecycle and permission matrix are not yet implemented in detail. |
| Implementation Gap | Production still needs own-profile/password settings, admin invite/suspend/reactivate/unlock/archive, last-active-admin guard, role template matrix, security/retention/export policies, feature flags, integration metadata, version history, and settings change history. |
| Permission / Audit | Permission changes, admin lifecycle actions, security/retention/export policy changes, feature flags, and sensitive/export settings must require confirmation, reason where needed, before/after diff, and audit. |
| FO Sync Impact | Settings changes can alter BO access, FO/BO feature flags, retention/export behavior, public legal/support content, and security defaults. Changes must surface FO/BO impact before save and link history to Audit Log where permitted. |

