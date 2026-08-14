# Agent Instructions

## Protected Prototype Screens

The following prototype screens are confirmed and locked as of 2026-07-19. They must not be modified unless the user explicitly requests changes to the named protected screen or flow:

- Login
- Dashboard, including the Dashboard menu entry, active state, routing, cards, metrics, and links from Dashboard content
- User Management > User List, including the User Management menu entry, User List submenu/active state, user detail views/panels, and every confirmation modal, lock/confirm state, or action flow opened from the User List screen
- User Management > Reported Users and Report Detail, including report lists/queues, report detail views/panels, report status actions, user actions opened from report context, confirmation modals, lock/confirm states, audit/result states, breadcrumbs, routing, and navigation state
- Asset Management > Asset List and Asset Detail, including the Asset Management menu entry, Asset List submenu/active state, asset detail views/panels, asset status/action buttons, confirmation modals, lock/confirm states, audit/result states, breadcrumbs, routing, and navigation state
- Asset Management > Reported Assets and Asset Report Detail, including report lists/queues, asset report detail views/panels, every detail modal opened from these screens, report status actions, asset/user actions opened from asset report context, confirmation modals, lock/confirm states, audit/result states, breadcrumbs, routing, and navigation state
- Content Management, including the Content Management menu entry, every submenu/active state, Articles > Article List, Article Detail, Add Article, and Edit Article, Categories, Reported Board, Board Report Detail, article/category/report lists, filters/cards/actions, detail views/panels, add/edit entry points, editor forms, block builder, image upload controls, publish scheduling controls, preview modals, submit/cancel flows, report status actions, content status actions, confirmation modals, validation states, breadcrumbs, routing, and navigation state
- Market Data, including the Market Data menu entry, every submenu/active state, market data screens, lists, tables, cards, filters, charts, detail views/panels, import/export or refresh actions, confirmation modals, validation states, breadcrumbs, routing, mock data, and navigation state
- Offer Management, including the Offer Management menu entry, active state, routing, offer list/table/card layout, summary metrics, filters, search, sorting, pagination, row/card open behavior, Offer Detail page, header, offered asset section, View Asset drill-in, Buyer/Owner summary, Offer History, read-only scope, breadcrumbs, back navigation, mock data, helper/data/CSS paths, and navigation state

When working on other screens:

- Do not edit files that belong to the protected screens.
- Do not modify shared components, styles, routes, layout shells, navigation, state logic, mock data, or assets in a way that changes the protected screens or their menu behavior.
- If a required change may affect a protected screen, stop and ask for approval before editing.
- Before finalizing any UI change, report whether the protected screens were touched.

See `PROTECTED_SCREENS.md` for the protected-screen policy and review checklist.

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
