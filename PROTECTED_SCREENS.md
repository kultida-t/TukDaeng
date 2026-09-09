# Protected Prototype Screens

These screens have been confirmed by the user and are locked from incidental changes as of 2026-07-19:

- Login
- Dashboard, including the Dashboard menu entry and links that open Dashboard content
- User Management > User List
- User Management > Reported Users
- User Management > Report Detail
- User Management menu entry, User List navigation state, and Reported Users navigation state
- Asset Management > Asset List
- Asset Management > Asset Detail
- Asset Management > Reported Assets
- Asset Management > Asset Report Detail
- Asset Management > Reported Comments, confirmed and locked as of 2026-08-19
- Asset Management > Comment Report Detail, confirmed and locked as of 2026-08-19
- Asset Management menu entry, Asset List navigation state, Asset Detail navigation state, Reported Assets navigation state, Asset Report Detail navigation state, Reported Comments navigation state, Comment Report Detail navigation state, and asset status/action flows
- Content Management > Articles > Article List, confirmed and locked as of 2026-07-23
- Content Management > Articles > Article Detail, confirmed and locked as of 2026-07-23
- Content Management > Articles > Add Article, confirmed and locked as of 2026-07-22
- Content Management > Articles > Edit Article, confirmed and locked as of 2026-07-23
- Content Management > Categories, confirmed and locked as of 2026-07-31
- Content Management > Reported Board, confirmed and locked as of 2026-07-31
- Content Management > Board Report Detail, confirmed and locked as of 2026-07-31
- Market Data, including the Market Data menu entry, submenu/active states, routing, market data screens, lists, tables, cards, filters, charts, detail views/panels, import/export or refresh actions, breadcrumbs, mock data, and navigation state, confirmed and locked as of 2026-08-10
- Offer Management, including Offer Management menu entry, active state, routing, offer list/table/card layout, summary metrics, filters, search, sorting, pagination, row/card open behavior, Offer Detail, breadcrumbs, mock data, and navigation state, confirmed and locked as of 2026-08-13
- Option Master, including the Option Master menu entry, active state, routing, Option Group List (table, summary, filters, search, sorting, pagination, row actions, action menu), Option Detail (header, breadcrumb, option list table, panel title/subtitle, Add Option entry, action menu with Delete option), Add/Edit Option modal (form fields, Group Key/Option Key lock, validation, confirmation), Deactivate/Reactivate Option modal (reason selector, safeguard, System Option Deactivate Policy state), Delete Option modal (destructive, type-to-confirm with Option Key, used_in_assets safeguard, irreversible warning), Reorder Option modal (drag-and-drop + up/down fallback), Add/Edit Group modal (form fields, group identifier lock, validation, confirmation), Deactivate/Reactivate/Delete Group modal (reason selector, type-to-confirm for delete, safeguard), Group Audit Log view (read-only, action/timestamp/actor/reason/before-after diff), Reorder Groups (drag-and-drop + up/down fallback), breadcrumbs, back navigation, mock data, helper/data/CSS paths, and navigation state, confirmed and locked as of 2026-08-25
- Market Demand, including the Market Demand menu entry, every submenu/active state, Demand Overview, Search Insights, Watch Alert List, Watch Alert Detail, breadcrumbs, mock data, helper/data/CSS paths, and navigation state, confirmed and locked as of 2026-09-01
- Settings > Policy & Versioning, including the Settings menu entry, Policy & Versioning submenu/active state, routing, Policy & Versioning List, Policy Detail, Policy Editor, Policy Publish confirmation modal, Policy Version History, Policy Version View modal, Policy Restore confirmation modal, Policy Preview modal, breadcrumbs, back navigation, mock data, helper/data/CSS paths, and navigation state, confirmed and locked as of 2026-09-03
- Settings > Support Center, including the Settings menu entry, Support Center submenu/active state, routing, Support Center edit form, Support Center Preview modal, breadcrumbs, back navigation, mock data, helper/data/CSS paths, and navigation state, confirmed and locked as of 2026-09-03
- Account Deletion, including the Account Deletion menu entry, active state, routing, Deletion Requests List, Request Detail (5 sections), Modal คืนบัญชี + ปฏิเสธคืนบัญชี (with email note + email preview), lifecycle email delivery logs (DLV-DEL-xxx), grace period countdown, breadcrumbs, back navigation, mock data, helper/data/CSS paths, and navigation state, confirmed and locked as of 2026-09-09

## Protected Prototype Files

The current confirmed prototype implementation is in:

- `Prototypes/bo-prototype.html`
- `Prototypes/assets/login-watch-hero.png`
- `Prototypes/assets/tukdaeng-app-icon.png`
- `Prototypes/assets/user-avatars/*`
- `Prototypes/assets/fonts/*`

Do not edit these files for unrelated work if the edit can change Login, Dashboard, User Management menu behavior, User List, Reported Users, user/report detail views, any user/report action flows, Asset Management menu behavior, Asset List, Asset Detail, Reported Assets, Asset Report Detail, any asset report detail modal, any asset status/action flows, Asset Management > Reported Comments, Comment Report Detail, any comment report detail modal, any comment moderation action flow, any Content Management screen, submenu, navigation state, article/category/report flow, or content action flow, any Market Data screen, menu behavior, submenu, navigation state, data view, chart, filter, detail panel, import/export action, or refresh flow, any Offer Management screen, menu behavior, routing, offer list, filter, detail page, data, helper functions, CSS, or back/drill-in behavior, any Option Master screen, menu behavior, routing, Option Group List, Option Detail, option/group CRUD modal, reorder modal, audit log view, filter, helper functions, CSS, or back navigation, any Market Demand screen, menu behavior, submenu, navigation state, Demand Overview, Search Insights, Watch Alert List, Watch Alert Detail, criteria/matched assets/trigger & notification/user action sections, inactive market data warning, soft delete notice, filter, helper functions, CSS, or back navigation, any Settings > Policy & Versioning screen, menu behavior, routing, Policy & Versioning List, Policy Detail, Policy Editor, publish/version view/restore/preview modal, version history table, filter, helper functions, CSS, or back navigation, any Settings > Support Center screen, menu behavior, routing, Support Center edit form, channel toggle/value/description fields, business hours/availability fields, validation, preview modal, helper functions, CSS, or back navigation, or any Account Deletion screen, menu behavior, routing, Deletion Requests List, Request Detail sections, restore/reject restore modal, lifecycle email delivery log, filter, helper functions, CSS, or back navigation.

## Login Protected Scope

The protected Login scope includes:

- Login layout, hero visual, logo/app identity, credential fields, copy, validation, error state, loading state, and login transition.
- Forgot/reset-password entry points or login-adjacent flows when they are rendered from the Login screen.
- Auth state, mock credentials, route guards, and state transitions that control entry from Login into the Back Office prototype.

## Dashboard Protected Scope

The protected Dashboard scope includes:

- Dashboard page layout, cards, metrics, charts/panels, activity lists, empty/loading/error states, and refresh behavior.
- Dashboard menu entry, active menu state, Dashboard routing, and links from Dashboard widgets into protected User Management views.
- Mock data, computed values, timers, and shared state that directly support Dashboard rendering.

## User List Protected Scope

The protected User Management > User List scope includes:

- The main User List table or list screen.
- User detail views, detail panels, or detail pages opened from User List.
- Every modal, drawer, confirmation dialog, toast result, lock/confirm state, and action flow opened from User List actions.
- Row actions, bulk actions, filter, search, sorting, pagination, tabs, selection state, and visible status changes on User List.
- User Management menu entry, User List submenu/active state, breadcrumbs, and back navigation connected to User List.
- Mock data, fixtures, state logic, route parameters, and shared components that directly support the User List detail or action flows.

## Reported Users And Report Detail Protected Scope

The protected User Management > Reported Users and Report Detail scope includes:

- The main Reported Users list/table, report queue, report summary, report filters, search, sorting, pagination, tabs, and selection state.
- Report Detail pages, detail panels, report context sections, linked user context, linked asset/chat/support context, and back navigation from Report Detail.
- Every modal, drawer, confirmation dialog, toast result, lock/confirm state, and action flow opened from Reported Users or Report Detail actions.
- Report status actions, user status actions triggered from report context, reason selectors, evidence/context fields, validation, disabled states, completed states, and audit/result messages.
- User Management menu entry, Reported Users submenu/active state, breadcrumbs, route behavior, and transitions between Reported Users, Report Detail, User Detail, and User List.
- Mock data, fixtures, state logic, route parameters, audit records, computed labels, and shared components that directly support Reported Users or Report Detail flows.

## Asset List And Asset Detail Protected Scope

The protected Asset Management > Asset List and Asset Detail scope includes:

- The main Asset List table/list screen, asset summary cards, asset filters, search, sorting, pagination, row actions, and row menu behavior.
- Asset Detail pages, detail panels, FO preview, listing summary, owner context, description/specification sections, comments, purchase history, sale history, status history, moderation history, and back navigation from Asset Detail.
- Every modal, drawer, confirmation dialog, toast result, lock/confirm state, and action flow opened from Asset List or Asset Detail actions.
- Asset status actions, visibility actions, temporary hide actions, restore visibility actions, delete/archive actions, reason selectors, impact notes, validation, disabled states, completed states, and audit/result messages.
- Asset Management menu entry, Asset List submenu/active state, breadcrumbs, route behavior, transitions between Asset List and Asset Detail, and navigation state.
- Mock data, fixtures, state logic, route parameters, audit records, computed labels, and shared components that directly support Asset List, Asset Detail, or asset action flows.

## Reported Assets And Asset Report Detail Protected Scope

The protected Asset Management > Reported Assets and Asset Report Detail scope includes:

- The main Reported Assets list/table, asset report queue, report summary, report filters, search, sorting, pagination, tabs, and selection state.
- Asset Report Detail pages, detail panels, report context sections, linked asset context, linked owner/user context, evidence/context sections, status history, moderation history, and back navigation from Asset Report Detail.
- Every modal, drawer, detail modal, confirmation dialog, toast result, lock/confirm state, and action flow opened from Reported Assets or Asset Report Detail actions.
- Report status actions, asset status actions triggered from report context, owner/user actions opened from asset report context, reason selectors, evidence/context fields, validation, disabled states, completed states, and audit/result messages.
- Asset Management menu entry, Reported Assets submenu/active state, breadcrumbs, route behavior, transitions between Reported Assets, Asset Report Detail, Asset Detail, and Asset List, and navigation state.
- Mock data, fixtures, state logic, route parameters, audit records, computed labels, and shared components that directly support Reported Assets or Asset Report Detail flows.

## Reported Comments And Comment Report Detail Protected Scope

The protected Asset Management > Reported Comments and Comment Report Detail scope includes:

- The main Reported Comments list/table, comment report queue, report summary, report filters, search, sorting, pagination, tabs, and selection state.
- Comment Report Detail pages, detail panels, reported comment reference section, comment detail section, reporter history, admin action history, linked asset context (View Asset modal), View all comments modal, and back navigation from Comment Report Detail.
- Every modal, drawer, detail modal, confirmation dialog, toast result, lock/confirm state, and action flow opened from Reported Comments or Comment Report Detail actions, including Hide comment, Restore comment, Remove comment, and Close no violation.
- Comment moderation actions, reason selectors, impact notes, email preview/notes, validation, disabled states, completed states, audit/result messages, and email delivery state.
- Asset Management menu entry, Reported Comments submenu/active state, breadcrumbs, route behavior, transitions between Reported Comments, Comment Report Detail, Asset Detail, and Asset List, and navigation state.
- Mock data, fixtures, state logic, route parameters, audit records, computed labels, email copy helpers, and shared components that directly support Reported Comments or Comment Report Detail flows.

## Content Management Protected Scope

The protected Content Management scope includes:

- The Articles list/table/card screen, article summary cards, filters, search, sorting, pagination, status chips, row/card actions, and list empty/loading/error states.
- Article Detail views, readonly article rendering, cover/title images, captions, metadata, author/category/status fields, published/scheduled state, and back navigation from Article Detail.
- The Add Article and Edit Article buttons/entry points from Content Management > Articles and the route/state transitions into the article editor.
- The Add Article and Edit Article editor layout, header fields, category selector, author field, cover upload, cover caption, intro/deck field, content block builder, block add/delete/move controls, image block upload, publish status selector, publish date/time controls, and submit/cancel buttons.
- The article preview opened from Add Article or Edit Article, including Board card preview, FO phone preview, scroll containment behavior, modal layout, copy, imagery, metadata, and close behavior.
- Validation, disabled states, upload error states, draft defaults, generated article IDs, timestamp handling, and save/create/update behavior for articles.
- The Categories list/table/card screen, category summary cards, filters, search, sorting, row/card actions, category detail modal, add/edit category forms, activate/deactivate flows, linked article counts, FO category visibility, and category selector/filter sync.
- The Reported Board list/table/card screen, report queue, report summary, report filters, search, sorting, pagination, row/card actions, report detail views/panels, reported article preview modal, evidence/context sections, status history, moderation history, and back navigation.
- Reported Board status actions, article status actions triggered from report context, archive/clear/close flows, reason selectors, validation, disabled states, completed states, audit/result states, confirmation modals, and toast/result messaging.
- Content Management menu entry, every submenu/active state, breadcrumbs, titles, panel labels, route behavior, navigation state, and back/cancel behavior connected to Articles, Categories, Reported Board, or Board Report Detail.
- Mock data, state logic, computed values, helper functions, styles, assets, and shared components that directly support Content Management rendering or behavior.

## Market Data Protected Scope

The protected Market Data scope includes:

- Market Data menu entry, every submenu/active state, breadcrumbs, titles, panel labels, route behavior, navigation state, and back/cancel behavior connected to Market Data screens.
- Market data list/table/card screens, summary metrics, filters, search, sorting, pagination, tabs, chart panels, empty/loading/error states, and visible status changes.
- Detail views, detail panels, drilldowns, preview panels, history panels, and any modal or drawer opened from Market Data screens.
- Import/export, refresh, sync, publish, archive, activate/deactivate, or status actions connected to Market Data, including confirmation modals, validation, disabled states, completed states, audit/result messages, and toast/result messaging.
- Mock data, fixtures, state logic, route parameters, computed values, helper functions, styles, assets, and shared components that directly support Market Data rendering or behavior.

## Offer Management Protected Scope

The protected Offer Management scope includes:

- Offer Management menu entry, active state, breadcrumbs, titles, panel labels, routing, navigation state, and back navigation connected to Offer Management.
- Offer list/table/card layout, summary metrics, filters, search, sorting, pagination, row/card open behavior, empty states, and visible status/amount/asset/buyer/owner display.
- Offer Detail page layout, header, breadcrumb, page title, panel title/subtitle, status/amount chips, and back navigation to Offer Management.
- Offered Asset section, including Offer ID, Asset ID (link drill-in to Asset Detail), Asset Name, Offer Amount, Asking Price, Asset Status, Created time, and the `Asset ID` link drill-in.
- Buyer / Owner section, including User ID/name display and any helper functions or mock data that directly support these values.
- Offer History section, including table/card structure, Date / Time, Actor, Action, Status, Reason / Note, row ordering, and responsive behavior.
- Read-only behavior and absence of BO write actions such as accept, decline, cancel, force-expire, invalidate, edit price, edit message, export, related chat action, or notification delivery action unless explicitly approved.
- Offer Management mock data, route/render helpers, data mapping helpers, CSS selectors, responsive rules, and shared state that directly support Offer list or Offer Detail rendering or navigation.

## Option Master Protected Scope

The protected Option Master scope includes:

- Option Master menu entry, active state, breadcrumbs, titles, panel labels, routing, navigation state, and back navigation connected to Option Master.
- Option Group List screen, including table layout, summary row, filters, search, sorting, pagination, row actions, action menu (Edit Group, Deactivate Group, Reactivate Group, Delete Group, View Audit Log), Status column, Status filter, page actions (`เพิ่ม Group`, `จัดเรียง`), and empty/loading/error states.
- Option Detail screen, including header, breadcrumb, panel title/subtitle, option list table (Option Key, Display Name TH/EN, Status, Sort Order, Action menu with Edit, Deactivate/Reactivate, Delete, Audit Log), Add Option entry, filter, search, sorting, pagination, and back navigation to Option Group List.
- Add/Edit Option modal, including form fields (group_id readonly, Option Key required lowercase snake_case unique ≤64 locked after create, Display Name TH/EN required unique, description optional, is_active toggle, sort_order), validation, error notes, confirmation, and audit `OPTION_ADD`/`OPTION_EDIT`.
- Delete Option modal (destructive), including type-to-confirm with Option Key, used_in_assets safeguard (button hidden when option is used in assets), irreversible warning, option summary, confirmation, and audit `OPTION_DELETE`.
- Deactivate/Reactivate Option modal, including reason selector, safeguard (≥1 active option remaining for all groups), System Option Deactivate Policy state, confirmation, and audit `OPTION_DEACTIVATE`/`OPTION_REACTIVATE`.
- Reorder Option modal, including drag-and-drop + up/down fallback, active options only ≥2, sort_order sequential, audit `OPTION_REORDER` once per save when order changes.
- Add/Edit Group modal, including form fields (group_id readonly, Group Key required lowercase snake_case unique ≤64 locked after create, Display Name EN/TH required unique, description optional, allows_multi_select toggle, is_active toggle), validation, confirmation, and audit `GROUP_CREATE`/`GROUP_EDIT`.
- Deactivate/Reactivate Group modal, including reason selector, safeguard (no asset using option in group), confirmation, and audit `GROUP_DEACTIVATE`/`GROUP_REACTIVATE`.
- Delete Group modal (destructive), including type-to-confirm, group must be Inactive + no asset using option, irreversible warning, confirmation, and audit `GROUP_DELETE`.
- Group Audit Log view, read-only, action types 6 (GROUP_CREATE/EDIT/DEACTIVATE/REACTIVATE/DELETE/REORDER), columns (action, timestamp, actor, reason, before-after diff), and back navigation.
- Reorder Groups, including drag-and-drop + up/down fallback, active groups only ≥2, sort_order sequential 10/20/30..., audit `GROUP_REORDER` once per save when order changes.
- Option Master mock data, route/render helpers, data mapping helpers, CSS selectors, responsive rules, and shared state that directly support Option Group List, Option Detail, any option/group CRUD modal, reorder modal, or audit log view rendering or navigation.

## Market Demand Protected Scope

The protected Market Demand scope includes:

- Market Demand menu entry, every submenu/active state (Demand Overview, Search Insights, Watch Alert List), breadcrumbs, titles, panel labels, route behavior, navigation state, and back navigation connected to Market Demand screens.
- Demand Overview screen, including aggregate KPI tiles (Active Alerts, Alerts with Matches, Unmet Demand, Notification Success Rate), trigger trend chart, frequently triggered list, read-only scope (no admin action), and last-updated meta.
- Search Insights screen, including popular keyword, popular filter selection by dimension, popular filter combination, no-result search count and rate, search trend over time (รายวัน/รายสัปดาห์), search funnel (Search Submit → Result Click → Asset Detail Open → Watch Alert/Offer), average results per search, and Popular Filter tag impression/select — all aggregate only, with no user-identifying data, and clear time range/ranking criteria labeling.
- Watch Alert List screen, including read-only behavior (no admin action, no action menu, no disable/enable/export/bulk), row click to Alert Detail, filter bar (Status, Notification, Trigger history, Match status, Last Triggered date range), sort options, pagination 10/page with range display, mobile card layout (≤760px), filter state persistence across drill-in/back, reset all filters, and empty state.
- Watch Alert Detail screen, including Detail Head (Alert ID : Alert Name + Status badge + Notification badge), Section 1 Alert Summary tiles (Created, Updated, Matches, Triggers), Section 2 Owner Summary (User ID, Display Name, Account Status) read-only, Section 3 Criteria (structured chips/rows, no raw JSON, inactive market data warning), Section 4 Matched Assets table (Asset ID link to Asset Detail, pagination 10/page, empty row states), Section 5 Trigger & Notification History (trigger with new matches > 0, delivery status badges, soft delete notice, pagination 10/page), Section 6 User Action History (timestamp, actor, action, changes, note, pagination 10/page, visible even after delete), back button to Watch Alert List, and read-only scope (no admin action).
- Inactive market data dependency warning (Alert List warning icon + filter, Alert Detail warning badge) and no current listing vs inactive market data distinction, including deactivated option dependency handling.
- Watch Alert status contract (Active, User Disabled, Deleted/soft delete) and read-only admin access (no Admin Disabled state, no admin write action on user alerts).
- Market Demand mock data, route/render helpers, data mapping helpers, CSS selectors, responsive rules, and shared state that directly support Demand Overview, Search Insights, Watch Alert List, or Watch Alert Detail rendering or navigation.

## Policy & Versioning Protected Scope

The protected Settings > Policy & Versioning scope includes:

- Settings menu entry, Policy & Versioning submenu/active state, breadcrumbs, titles, panel labels, route behavior, navigation state, and back navigation connected to Policy & Versioning screens.
- Policy & Versioning List screen, including table layout (Policy, Description, Status, Version, Updated, Updated By, Action columns), policy type badges (Terms of Use = blue, Privacy Policy = purple), status badges (Published = green, Draft = amber, version = slate), draft badge, no summary cards, no search/filter/pagination (2 policies only), row click and chevron action to open Policy Detail, and empty/loading/error states.
- Policy Detail screen, including breadcrumb, page title (policy type label), language tabs (TH/EN), published content body, metadata tiles (Status, Version, Updated, Updated By), change summary section, action buttons (Create Draft / Edit Draft / Version History), and back button to Policy & Versioning List.
- Policy Editor screen, including breadcrumb, Draft metadata tiles (Policy, Version, Status), formatting toolbar, contenteditable canvas (TH/EN), language tabs, change summary textarea, action buttons (Cancel, Preview, Publish, Save Draft), editor sidebar (editor info, publish guidance), validation (content TH/EN required, change summary required), error UI, and back navigation.
- Policy Publish confirmation modal, including policy type, version, change summary, archive notice (previous Published becomes Archived), confirm/cancel actions, and success toast.
- Policy Version History screen, including table layout (Version, Status, Updated By, Updated, Published Date, Change Summary, Action columns), status badges, row click to open Version View modal, action menu (Edit Draft for Draft versions, View version, Restore for Archived versions), and back navigation.
- Policy Version View modal (read-only), including policy type label, version, language tabs (TH/EN), content body, metadata, and close behavior.
- Policy Restore confirmation modal, including source version, new draft version, confirm/cancel actions, and success toast.
- Policy Preview modal, including policy type label, Draft version, language tabs (TH/EN), content preview, and close behavior.
- Policy status contract (Draft / Published / Archived), publish flow (Draft → Published, previous Published → Archived automatically), restore flow (Archived → new Draft), single Published per policy type, single Draft per policy type, and Draft button label change (Create Draft vs Edit Draft).
- Policy & Versioning mock data, route/render helpers, data mapping helpers, CSS selectors, responsive rules, and shared state that directly support Policy & Versioning List, Policy Detail, Policy Editor, Version History, or any policy modal rendering or navigation.

## Support Center Protected Scope

The protected Settings > Support Center scope includes:

- Settings menu entry, Support Center submenu/active state, breadcrumbs, titles, panel labels, route behavior, navigation state, and back navigation connected to Support Center screens.
- Support Center edit form, including channel list (LINE, Phone, Email, Facebook, Website) with Active/Inactive toggle, channel value field (required when Active, disabled when Inactive), channel description TH/EN (optional, disabled when Inactive), business hours field (required, time range validation), availability TH/EN fields (required), required markers, validation, error UI, disabled state for inactive channels, and action buttons (Preview, Save).
- Support Center channel toggle behavior, including active/inactive state, re-render on toggle, status badge (Active = green, Inactive = gray), and aria-label.
- Support Center save behavior, including input sync to data, validation block on invalid, last updated/editor update, success toast, and re-render.
- Support Center Preview modal, including phone frame, FO Help screen preview (header, Contact support heading, availability, channel list with icons, business hours), language toggle (TH/EN), live form data (reflects unsaved edits), channel icons (LINE, Phone, Email, Facebook, Website), empty state when no active channels, scroll preservation on language switch, and close behavior.
- Support Center mock data, route/render helpers, data mapping helpers, validation helpers, CSS selectors, responsive rules, and shared state that directly support Support Center edit form or Preview modal rendering or navigation.

## Account Deletion Protected Scope

The protected Account Deletion scope includes:

- Account Deletion menu entry, active state, breadcrumbs, titles, panel labels, routing, navigation state, and back navigation connected to Account Deletion screens.
- Deletion Requests List screen, including full-width panel layout (no KPI summary cards), table 7 columns + action (Request ID, User link to User Detail with User ID secondary line, Assets, Request Status pill, Account Status pill, Grace Period countdown pill showing `—` when request is finished, Requested At, row menu with single ดูรายละเอียด entry desktop/tablet only), mobile card stack without `...` button, filter bar (search Request ID/User ID/name, request status filter, grace period state filter, sort), filter state persistence across drill-in/back, reset all filters, pagination 10/page with range display, and empty state.
- Request Detail screen, including Detail Head (profile image, Request ID : Display Name, chips สถานะคำขอ/สถานะบัญชี, Serious flag pill), Section 1 User Context (masked sensitive fields), Section 2 Deletion Timeline (vertical timeline, countdown, restore request/reject notes, cancelled note), Section 3 Dependency Summary (6 tiles with cross-module drill-in read-only filtered by userId), Section 4 Deletion Plan table, and Section 5 History & Actions (table with วันที่/เวลา, ผู้ดำเนินการ, Action, ส่งอีเมล column with sent pill + delivery log jump, รายละเอียด; event รับคำขอคืนบัญชี via support with `—` timestamp; ปฏิเสธคืนบัญชี shown every time; action buttons visible only during grace period and hidden after request ends with no explanation note).
- Modal คืนบัญชี (Restore Account), including context note (ผู้ใช้ขอคืนบัญชี), reason selector (4 options), note field, impact note, email note (registered owner email as primary channel), email preview (TH/EN subject/body live-updated by reason), confirm/cancel, result state, account status sync back to Active in User Management, and Account Status History row.
- Modal ปฏิเสธคืนบัญชี (Reject Restore), including context note (ปฏิเสธคืนบัญชีครั้งก่อน), reason selector (4 options), note field, impact note, email note, email preview, repeated rejection support (history shows every rejection with inbound restore request record before each), grace period not reset, and result state.
- Lifecycle email system, including 5 lifecycle emails (ยืนยันลบบัญชี REQ / เตือนใกล้ครบ grace period GR7/GR3 / คืนบัญชีแล้ว RES / ปฏิเสธคืนบัญชี REJ / ลบตัวตนแล้ว DEL), delivery log IDs `DLV-DEL-<req>-<event>` in Notifications, History & Actions ส่งอีเมล column with delivery log jump, mobile email pill styling, and no-send rules.
- Grace period behavior, including 30-day countdown pill (เหลือ X วัน / ครบแล้ว), button visibility rules (คืนบัญชี/ปฏิเสธคืนบัญชี shown throughout grace period, hidden after request ends), and auto-delete as system job (not admin action).
- Account status sync, including status sync back to Active in User Management (list + detail + linked reports) on restore, Account Status History rows (ขอลบบัญชี / คืนบัญชี / ปฏิเสธคืนบัญชี / ลบบัญชีอัตโนมัติ), and drill-in from User List `Open Account Deletion` opening Request Detail directly.
- Account Deletion mock data, route/render helpers, data mapping helpers, CSS selectors, responsive rules, and shared state that directly support Deletion Requests List, Request Detail, any restore/reject modal, lifecycle email delivery log, or back navigation rendering.

## Rules

- Do not change layout, styling, behavior, routing, copy, mock data, or component structure for the protected screens unless the user explicitly asks for that exact change.
- Do not change navigation labels, menu order, active states, breadcrumbs, or route behavior for Dashboard, User Management, Asset Management, Content Management, Market Data, Option Master, Market Demand, Account Deletion, Settings > Policy & Versioning, or Settings > Support Center unless the user explicitly approves that exact change.
- Treat shared files as high risk when they are used by protected screens. This includes layout shells, navigation, route guards, theme files, global CSS, common components, shared hooks, stores, API mocks, fixtures, and assets.
- If a requested change to another screen requires editing shared code that may affect a protected screen, pause and ask the user for approval first.
- Do not perform broad refactors, formatting-only rewrites, or dependency upgrades that touch protected-screen files as part of unrelated work.
- After completing UI work, state clearly whether any protected-screen files or shared dependencies were touched.

## Review Checklist Before Editing

- Identify the files and routes involved in the requested change.
- Check whether any target file is part of Login, Dashboard, Dashboard menu, User Management menu, User Management > User List, User Management > Reported Users, User Detail, Report Detail, any user/report action modal, Asset Management menu, Asset Management > Asset List, Asset Detail, Asset Management > Reported Assets, Asset Report Detail, any asset report detail modal, any asset action modal, Asset Management > Reported Comments, Comment Report Detail, any comment report detail modal, any comment moderation action modal, any Content Management screen, submenu, modal, detail view, or action flow, any Market Data screen, menu behavior, submenu, modal, detail view, chart, filter, data action, or refresh flow, any Offer Management screen, menu behavior, list, filter, detail view, route, or data flow, any Option Master screen, menu behavior, Option Group List, Option Detail, option/group CRUD modal, reorder modal, audit log view, filter, route, or data flow, any Market Demand screen, menu behavior, submenu, Demand Overview, Search Insights, Watch Alert List, Watch Alert Detail, criteria/matched assets/trigger & notification/user action section, inactive market data warning, soft delete notice, filter, route, or data flow, any Account Deletion screen, menu behavior, Deletion Requests List, Request Detail, restore/reject restore modal, lifecycle email delivery log, grace period countdown, filter, route, or data flow, any Settings > Policy & Versioning screen, menu behavior, Policy & Versioning List, Policy Detail, Policy Editor, publish/version view/restore/preview modal, version history table, filter, route, or data flow, or any Settings > Support Center screen, menu behavior, Support Center edit form, channel toggle/value/description fields, business hours/availability fields, validation, preview modal, route, or data flow.
- Check whether any shared file is used by those protected screens.
- If protected impact is possible, ask for confirmation before editing.
- Keep changes scoped to the requested screen or feature.

## Approval Requirement

Changes to the protected screens are allowed only when the user explicitly confirms the screen name and requested change. General requests such as "adjust layout", "clean up styles", "refactor prototype", or "update navigation" are not enough approval to touch these locked screens, their action flows, or their menu behavior.
