# Agent Instructions

## Protected Prototype Screens

The following prototype screens are confirmed and locked as of 2026-07-19. They must not be modified unless the user explicitly requests changes to the named protected screen or flow:

- Login
- Dashboard, including the Dashboard menu entry, active state, routing, cards, metrics, and links from Dashboard content
- User Management > User List, including the User Management menu entry, User List submenu/active state, user detail views/panels, and every confirmation modal, lock/confirm state, or action flow opened from the User List screen
- User Management > Reported Users and Report Detail, including report lists/queues, report detail views/panels, report status actions, user actions opened from report context, confirmation modals, lock/confirm states, audit/result states, breadcrumbs, routing, and navigation state
- Asset Management > Asset List and Asset Detail, including the Asset Management menu entry, Asset List submenu/active state, asset detail views/panels, asset status/action buttons, confirmation modals, lock/confirm states, audit/result states, breadcrumbs, routing, and navigation state
- Asset Management > Reported Assets and Asset Report Detail, including report lists/queues, asset report detail views/panels, every detail modal opened from these screens, report status actions, asset/user actions opened from asset report context, confirmation modals, lock/confirm states, audit/result states, breadcrumbs, routing, and navigation state
- Asset Management > Reported Comments and Comment Report Detail, including comment report lists/queues, comment report detail views/panels, reported comment reference, comment detail, reporter history, admin action history, View Asset modal, View all comments modal, comment moderation actions (Hide comment, Restore comment, Remove comment, Close no violation), reason selectors, impact notes, email preview/notes, confirmation modals, lock/confirm states, audit/result states, breadcrumbs, routing, and navigation state, confirmed and locked as of 2026-08-19
- Content Management, including the Content Management menu entry, every submenu/active state, Articles > Article List, Article Detail, Add Article, and Edit Article, Categories, Reported Board, Board Report Detail, article/category/report lists, filters/cards/actions, detail views/panels, add/edit entry points, editor forms, block builder, image upload controls, publish scheduling controls, preview modals, submit/cancel flows, report status actions, content status actions, confirmation modals, validation states, breadcrumbs, routing, and navigation state
- Market Data, including the Market Data menu entry, every submenu/active state, market data screens, lists, tables, cards, filters, charts, detail views/panels, import/export or refresh actions, confirmation modals, validation states, breadcrumbs, routing, mock data, and navigation state
- Offer Management, including the Offer Management menu entry, active state, routing, offer list/table/card layout, summary metrics, filters, search, sorting, pagination, row/card open behavior, Offer Detail page, header, offered asset section, View Asset drill-in, Buyer/Owner summary, Offer History, read-only scope, breadcrumbs, back navigation, mock data, helper/data/CSS paths, and navigation state
- Option Master, including the Option Master menu entry, active state, routing, Option Group List (table, summary, filters, search, sorting, pagination, row actions, action menu), Option Detail (header, breadcrumb, option list table, panel title/subtitle, Add Option entry), Add/Edit Option modal (form fields, Group Key/Option Key lock, validation, confirmation), Deactivate/Reactivate Option modal (reason selector, safeguard, System Option Deactivate Policy state), Reorder Option modal (drag-and-drop + up/down fallback), Add/Edit Group modal (form fields, group identifier lock, validation, confirmation), Deactivate/Reactivate/Delete Group modal (reason selector, type-to-confirm for delete, safeguard), Group Audit Log view (read-only, action/timestamp/actor/reason/before-after diff), Reorder Groups (drag-and-drop + up/down fallback), breadcrumbs, back navigation, mock data, helper/data/CSS paths, and navigation state, confirmed and locked as of 2026-08-25
- Market Demand, including the Market Demand menu entry, every submenu/active state, Demand Overview (aggregate KPI tiles, trigger trend chart, frequently triggered list, read-only), Search Insights (popular keyword, popular filter selection/combination, no-result search, search trend over time, search funnel, average results per search, Popular Filter tag impression/select, aggregate only, no user-identifying data), Watch Alert List (read-only, no admin action, no action menu, row click to Alert Detail, filter bar with Status/Notification/Trigger history/Match status/Last Triggered date range, sort, pagination 10/page, mobile card, filter state persistence, reset all filters), Watch Alert Detail (Detail Head with Alert ID : Alert Name + Status badge + Notification badge, Section 1 Alert Summary tiles, Section 2 Owner Summary read-only, Section 3 Criteria structured chips/rows with inactive market data warning, Section 4 Matched Assets table with Asset ID link to Asset Detail and pagination, Section 5 Trigger & Notification History with delivery status badges and soft delete notice, Section 6 User Action History, back button to Watch Alert List, read-only, no admin action), inactive market data dependency warning, no current listing vs inactive market data distinction, breadcrumbs, back navigation, mock data, helper/data/CSS paths, and navigation state, confirmed and locked as of 2026-09-01
- Settings > Policy & Versioning, including the Settings menu entry, Policy & Versioning submenu/active state, routing, Policy & Versioning List (table, Policy/Description/Status/Version/Updated/Updated By/Action columns, no summary cards, no search/filter/pagination), Policy Detail (breadcrumb, language tabs TH/EN, published content body, metadata tiles, change summary, Create Draft / Edit Draft / Version History actions, back button), Policy Editor (breadcrumb, Draft metadata tiles, formatting toolbar, contenteditable canvas TH/EN, change summary field, Save Draft / Preview / Publish / Cancel actions, editor sidebar), Policy Publish confirmation modal (policy/version/change summary, archive notice, confirm/cancel), Policy Version History (table, Version/Status/Updated By/Updated/Published Date/Change Summary/Action columns, row click to View modal, action menu with Edit Draft / View version / Restore), Policy Version View modal (read-only TH/EN content, metadata), Policy Restore confirmation modal, Policy Preview modal (TH/EN content preview), breadcrumbs, back navigation, mock data, helper/data/CSS paths, and navigation state, confirmed and locked as of 2026-09-03
- Settings > Support Center, including the Settings menu entry, Support Center submenu/active state, routing, Support Center edit form (channel list with Active/Inactive toggle, channel value field, channel description TH/EN, business hours field, availability TH/EN fields, required markers, validation, error UI, disabled state for inactive channels, Preview / Save actions), Support Center Preview modal (phone frame, FO Help screen preview, language toggle TH/EN, live form data, channel icons, business hours/availability display, empty state when no active channels), breadcrumbs, back navigation, mock data, helper/data/CSS paths, and navigation state, confirmed and locked as of 2026-09-03

When working on other screens:

- Do not edit files that belong to the protected screens.
- Do not modify shared components, styles, routes, layout shells, navigation, state logic, mock data, or assets in a way that changes the protected screens or their menu behavior.
- If a required change may affect a protected screen, stop and ask for approval before editing.
- Before finalizing any UI change, report whether the protected screens were touched.

See `PROTECTED_SCREENS.md` for the protected-screen policy and review checklist.

## Language Conventions

UI copy, labels, error messages, and documentation for TukDaeng are primarily in Thai. When writing or editing code:

- Write UI-facing copy (button labels, headings, tooltips, toast/error messages, empty states) in Thai unless the surrounding file already uses English.
- Write code comments in the same language as neighboring comments in the file; if the file has no comments yet, prefer Thai for user-facing intent and English for purely technical notes.
- Keep technical terms, product names, file names, screen names, statuses, commands, and code identifiers in English when that is clearer or already the convention in the file.
- Match the tone and register of nearby copy so new text blends in rather than standing out.

## Kanban Task Style

When the user asks to create, split, or add Kanban tasks for TukDaeng, prefer one complete task per user-facing work item instead of splitting audit, implementation, QA, and work-log into separate tasks, unless the user explicitly asks for subtasks.

Each Kanban task should be written as a complete execution brief and include, where relevant:

- A concise task title
- Context or reason for the task
- Files, screens, modules, or areas expected to be changed
- Protected screens or flows affected
- Pages and flows to check
- What will be done
- Manual QA checklist
- Viewports to verify for UI-related work
- Acceptance criteria
- Scope boundaries, including what must not be changed

Use Thai as the default language for Kanban task descriptions and related task details. Keep technical terms, product names, file names, screen names, statuses, commands, code identifiers, or English terms that are clearer and commonly understood in English. Prioritize readability for Thai-speaking users.

## Kanban Completion Rule

When a Kanban task involves editing files, do not move the task to `done` immediately after implementation or verification. Keep the task in `in_progress` and wait for explicit user confirmation that the result is accepted. Only move the task to `done` after the user confirms the edited result is OK.

## Documentation Standard Rule

ห้ามแทรก note แบบ meta-commentary (เช่น "Note (BO-XXX, วันที่): ...") ในเนื้อหาเอกสารปกติ เพราะไม่ใช่มาตรฐานของเอกสาร ห้ามใช้รูปแบบนี้ในเอกสาร baseline/module spec เว้นแต่จะเป็นเอกสารที่มีไว้สำหรับบันทึกการเปลี่ยนแปลงโดยเฉพาะ (เช่น DOCUMENT_VERSION.md) เรื่องที่ต้องรอ decision ให้ไปไว้ใน section Open Decisions ของเอกสารนั้น ๆ แทน

## Time Display Format

When showing work hours in summaries or reports, display in `X ชม. Y นาที` format (e.g. `1 ชม. 37 นาที`) instead of decimal hours (e.g. `1.62 ชม.`). Convert decimal hours by splitting the integer part as hours and multiplying the fractional part by 60 for minutes. Apply this to all time displays including per-task hours, totals, and running timers.
