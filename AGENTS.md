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
- Offer Management, including the Offer Management menu entry, active state, routing, offer list/table/card layout, summary metrics, filters, search, sorting, pagination, row/card open behavior, Offer Detail page, header, offered asset section, Asset ID link drill-in, Buyer/Owner summary, Offer History, read-only scope, breadcrumbs, back navigation, mock data, helper/data/CSS paths, and navigation state
- Option Master, including the Option Master menu entry, active state, routing, Option Group List (table, summary, filters, search, sorting, pagination, row actions, action menu), Option Detail (header, breadcrumb, option list table, panel title/subtitle, Add Option entry), Add/Edit Option modal (form fields, Group Key/Option Key lock, validation, confirmation), Deactivate/Reactivate Option modal (reason selector, safeguard, System Option Deactivate Policy state), Reorder Option modal (drag-and-drop + up/down fallback), Add/Edit Group modal (form fields, group identifier lock, validation, confirmation), Deactivate/Reactivate/Delete Group modal (reason selector, type-to-confirm for delete, safeguard), Group Audit Log view (read-only, action/timestamp/actor/reason/before-after diff), Reorder Groups (drag-and-drop + up/down fallback), breadcrumbs, back navigation, mock data, helper/data/CSS paths, and navigation state, confirmed and locked as of 2026-08-25
- Market Demand, including the Market Demand menu entry, every submenu/active state, Demand Overview (aggregate KPI tiles, trigger trend chart, frequently triggered list, read-only), Search Insights (popular keyword, popular filter selection/combination, no-result search, search trend over time, search funnel, average results per search, Popular Filter tag impression/select, aggregate only, no user-identifying data), Watch Alert List (read-only, no admin action, no action menu, row click to Alert Detail, filter bar with Status/Notification/Trigger history/Match status/Last Triggered date range, sort, pagination 10/page, mobile card, filter state persistence, reset all filters), Watch Alert Detail (Detail Head with Alert ID : Alert Name + Status badge + Notification badge, Section 1 Alert Summary tiles, Section 2 Owner Summary read-only, Section 3 Criteria structured chips/rows with inactive market data warning, Section 4 Matched Assets table with Asset ID link to Asset Detail and pagination, Section 5 Trigger & Notification History with delivery status badges and soft delete notice, Section 6 User Action History, back button to Watch Alert List, read-only, no admin action), inactive market data dependency warning, no current listing vs inactive market data distinction, breadcrumbs, back navigation, mock data, helper/data/CSS paths, and navigation state, confirmed and locked as of 2026-09-01
- Settings > Policy & Versioning, including the Settings menu entry, Policy & Versioning submenu/active state, routing, Policy & Versioning List (table, Policy/Description/Status/Version/Updated/Updated By/Action columns, no summary cards, no search/filter/pagination), Policy Detail (breadcrumb, language tabs TH/EN, published content body, metadata tiles, change summary, Create Draft / Edit Draft / Version History actions, back button), Policy Editor (breadcrumb, Draft metadata tiles, formatting toolbar, contenteditable canvas TH/EN, change summary field, Save Draft / Preview / Publish / Cancel actions, editor sidebar), Policy Publish confirmation modal (policy/version/change summary, archive notice, confirm/cancel), Policy Version History (table, Version/Status/Updated By/Updated/Published Date/Change Summary/Action columns, row click to View modal, action menu with Edit Draft / View version / Restore), Policy Version View modal (read-only TH/EN content, metadata), Policy Restore confirmation modal, Policy Preview modal (TH/EN content preview), breadcrumbs, back navigation, mock data, helper/data/CSS paths, and navigation state, confirmed and locked as of 2026-09-03
- Settings > Support Center, including the Settings menu entry, Support Center submenu/active state, routing, Support Center edit form (channel list with Active/Inactive toggle, channel value field, channel description TH/EN, business hours field, availability TH/EN fields, required markers, validation, error UI, disabled state for inactive channels, Preview / Save actions), Support Center Preview modal (phone frame, FO Help screen preview, language toggle TH/EN, live form data, channel icons, business hours/availability display, empty state when no active channels), breadcrumbs, back navigation, mock data, helper/data/CSS paths, and navigation state, confirmed and locked as of 2026-09-03
- Account Deletion, including the Account Deletion menu entry, active state, routing, Deletion Requests List (full-width panel ตาม pattern Reported Users, ตาราง 7 คอลัมน์ + row menu ดูรายละเอียด, mobile card ไม่แสดงปุ่ม ..., filter bar with search/request status/grace period state/sort, filter state persistence, reset all filters, pagination 10/page, empty state), Request Detail (Detail Head with Request ID : Display Name + chips สถานะคำขอ/สถานะบัญชี + Serious flag pill, Section 1 User Context masked, Section 2 Deletion Timeline + countdown + restore/reject notes, Section 3 Dependency Summary 6 tiles with cross-module drill-in read-only, Section 4 Deletion Plan table, Section 5 History & Actions with ส่งอีเมล column + delivery log jump), Modal คืนบัญชี (context note, reason selector, note, impact note, email note + email preview live update), Modal ปฏิเสธคืนบัญชี (context note ปฏิเสธก่อนหน้า, reason selector, note, impact note, email note + email preview, ปฏิเสธซ้ำได้), lifecycle email delivery logs (DLV-DEL-xxx) ใน Notifications ที่ trace กลับ History & Actions, grace period countdown, no-send rules, breadcrumbs, back navigation (รวม back จาก User Detail กลับ Request Detail), mock data, helper/data/CSS paths, and navigation state, confirmed and locked as of 2026-09-09
- Settings > Delivery Logs, including the Settings menu entry, Delivery Logs submenu/active state, routing, Delivery Log List (full-width panel ตาม pattern Audit Log / Deletion Requests, ไม่มี KPI cards, read-only, ตาราง 7 คอลัมน์ Delivery ID / Event / Source / Recipient / Channel / Status / Detail, status pill Sent/Retry, channel pill Email/Push, ไม่มี row action menu, row click เปิด read-only detail modal, mobile card, filter bar with เปิด/ปิดตัวกรอง toggle + search (Delivery ID, Source, Recipient, Event) + delivery status filter + channel filter + sort ล่าสุด/เก่าสุด, filter state persistence, reset all filters, pagination 10/page, empty state), Delivery Log Detail modal (read-only, pattern option-audit-modal, header Delivery ID + event name, rows Source / Recipient / Channel / Status / Priority / Detail / Tags chips / Admin note, ไม่มี action footer), delivery ID patterns (DLV-DEL-<req>-<event>, DLV-ACCT-xxx, DLV-WA-xxx), delivery log jump links (data-delivery-log-jump) จาก Account Deletion History & Actions / User Management Admin Action History / Dashboard alert card & notification ไป Settings > Delivery Logs, ไม่มี Notifications menu entry ใน sidebar (Phase 1), breadcrumbs, back navigation, mock data, helper/data/CSS paths, and navigation state, confirmed and locked as of 2026-09-15

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

## Kanban Time Tracking Rule

ห้ามเรียก `log_time` ด้วยมือเพื่อบวกเวลาเข้า task โดยเด็ดขาด — ระบบ kanban มี auto-timer ที่บันทึกเวลาอัตโนมัติเมื่อย้าย task เข้า/ออก `in_progress` การเรียก `log_time` ด้วยมือจะทำให้ `hours_spent` สูงกว่าเวลาจริง (double-count) กฎนี้บังคับเสมอ ไม่มีข้อยกเว้น

- ห้ามเรียก `log_time` ก่อน `move_task` เป็น `done` — auto-timer บันทึกเวลาอัตโนมัติอยู่แล้ว
- ห้ามเรียก `log_time` หลัง `move_task` เป็น `done` — เว้นแต่ `get_time_summary` flag ว่าค่าผิดปกติและผู้ใช้สั่งชัดเจนว่าให้ปรับ
- ใช้ค่า `hours_spent` จากระบบเป็นค่าจริงเสมอ — ห้ามบวก/ลด/ปรับเอง
- ถ้า `hours_spent` ดูผิดปกติ (เช่น สูงกว่าเวลาจริงมากเพราะเคยเรียก `log_time` ด้วยมือ) → แจ้งผู้ใช้และถามว่าจะให้ปรับผ่าน `update_task` หรือไม่ ห้ามปรับเองโดยไม่ได้รับอนุญาต

## Documentation Standard Rule

ห้ามแทรก note แบบ meta-commentary (เช่น "Note (BO-XXX, วันที่): ...") ในเนื้อหาเอกสารปกติ เพราะไม่ใช่มาตรฐานของเอกสาร ห้ามใช้รูปแบบนี้ในเอกสาร baseline/module spec เว้นแต่จะเป็นเอกสารที่มีไว้สำหรับบันทึกการเปลี่ยนแปลงโดยเฉพาะ (เช่น DOCUMENT_VERSION.md) เรื่องที่ต้องรอ decision ให้ไปไว้ใน section Open Decisions ของเอกสารนั้น ๆ แทน

## Test Cleanup Rule

หลังรัน Playwright test (หรือ test framework อื่น) เสร็จทุกครั้ง ต้องลบ test artifact ที่ไม่เกี่ยวกับโปรเจคออกทั้งหมด — ได้แก่ `test-results/`, `playwright-report/`, และ `.last-run.json` ที่ถูกสร้างขึ้นระหว่างการรัน ไฟล์เหล่านี้เป็น build artifact ที่ regenerate ได้ทุกครั้งและถูก ignore ใน `.gitignore` แล้ว ห้ามปล่อยให้ค้างใน working directory หลังเทสเสร็จ ยกเว้นผู้ใช้สั่งเก็บไว้เพื่อตรวจสอบ failure โดยเฉพาะ

## Time Display Format

When showing work hours in summaries or reports, display in `X ชม. Y นาที (D.D ชม.)` format (e.g. `1 ชม. 37 นาที (1.6 ชม.)`, `0 ชม. 39 นาที (0.7 ชม.)`) — showing both hours-minutes and decimal hours rounded to 1 decimal place in parentheses. Convert decimal hours by splitting the integer part as hours and multiplying the fractional part by 60 for minutes for the first part, and compute the parenthesized decimal as `(X × 60 + Y) ÷ 60` rounded to 1 decimal place. Apply this to all time displays including per-task hours, totals, and running timers.

## Work Summary Attribution Rule

เมื่อสรุปงาน (work summary / session note): งานที่ทำนอกเหนือแผนของ task ปัจจุบัน ให้แยกส่วนไว้ในสรุปชัดเจน (เช่น กลุ่ม "งานที่ทำเพิ่มนอกแผน") — **แต่ถ้างานนั้นตรงกับงานของ task อื่นที่มีอยู่ใน board แล้ว ให้ระบุงานส่วนนั้นเป็นของ task ที่มีอยู่ ไม่ใช่ของ task ปัจจุบัน** เช่น ถ้าระหว่างทำ task prototype มีการตรวจ responsive/protected ที่เป็นขอบเขตของ task QA อยู่แล้ว ให้ระบุในสรุปว่าเป็นงานล่วงหน้าของ task QA นั้น (เช่น "ทำล่วงหน้าบางส่วนใน <task เดิม>") ไม่ใช่นับเป็นงานนอกแผนของ task ที่กำลังทำ — เพื่อให้ชั่วโมงและขอบเขตของแต่ละ task สะท้อนงานจริงของ task นั้น

## Fun Work Blog Style (blog ขำๆ จากงานประจำวัน)

## Fun Work Blog Style (blog ขำๆ จากงานประจำวัน)

When the user asks for a fun blog from the day's work (e.g. "เขียน blog ขำๆ", "blog ขำๆ จากที่ทำงานวันนี้"), write it in the "หนูขี้เม้า" persona — the same voice as the kanban tea/gossip entries:

- Narrate in first person as "หนู" (the little assistant), telling the story of the day's work like juicy gossip — playful, whiny-but-cute, with natural Thai particles (เนาะ, เนี่ย, แหละ, ค่ะ/ครับ) and 555/emojis where they land naturally.
- Write as flowing storytelling, NOT a report: no section headers, no tables, no bullet lists, no stiff/formal phrasing. Dramatic reveals and teasing asides are good (e.g. "แต่เดี๋ยวก่อนนะ มีอะไรแง้มอีก...", "ไม่ใช่แกล้งนะ แต่...").
- Weave real numbers from the kanban (hours, task counts, feedback points, test results) into the story as punchlines, not as a data table. Self-deprecating irony about the day's work is welcome.
- End with a short sign-off plus a teaser for the next episode (e.g. "แล้วพรุ่งนี้เข้าเบิ่งกันต่อนะคะ ... 🐹🌙").
- Source facts from `get_session_context` / `get_time_summary` (kanban-tukdaeng) so the story stays true to what actually happened.
