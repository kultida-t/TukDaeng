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

## Protected Prototype Files

The current confirmed prototype implementation is in:

- `Prototypes/bo-prototype.html`
- `Prototypes/assets/login-watch-hero.png`
- `Prototypes/assets/tukdaeng-app-icon.png`
- `Prototypes/assets/user-avatars/*`
- `Prototypes/assets/fonts/*`

Do not edit these files for unrelated work if the edit can change Login, Dashboard, User Management menu behavior, User List, Reported Users, user/report detail views, any user/report action flows, Asset Management menu behavior, Asset List, Asset Detail, Reported Assets, Asset Report Detail, any asset report detail modal, any asset status/action flows, Asset Management > Reported Comments, Comment Report Detail, any comment report detail modal, any comment moderation action flow, any Content Management screen, submenu, navigation state, article/category/report flow, or content action flow, any Market Data screen, menu behavior, submenu, navigation state, data view, chart, filter, detail panel, import/export action, or refresh flow, or any Offer Management screen, menu behavior, routing, offer list, filter, detail page, data, helper functions, CSS, or back/drill-in behavior.

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
- Offered Asset section, including Offer ID, Asset ID, Asset Name, Offer Amount, Asking Price, Asset Status, Created time, and the `View Asset` drill-in.
- Buyer / Owner section, including User ID/name display and any helper functions or mock data that directly support these values.
- Offer History section, including table/card structure, Date / Time, Actor, Action, Status, Reason / Note, row ordering, and responsive behavior.
- Read-only behavior and absence of BO write actions such as accept, decline, cancel, force-expire, invalidate, edit price, edit message, export, related chat action, or notification delivery action unless explicitly approved.
- Offer Management mock data, route/render helpers, data mapping helpers, CSS selectors, responsive rules, and shared state that directly support Offer list or Offer Detail rendering or navigation.

## Rules

- Do not change layout, styling, behavior, routing, copy, mock data, or component structure for the protected screens unless the user explicitly asks for that exact change.
- Do not change navigation labels, menu order, active states, breadcrumbs, or route behavior for Dashboard, User Management, Asset Management, Content Management, or Market Data unless the user explicitly approves that exact change.
- Treat shared files as high risk when they are used by protected screens. This includes layout shells, navigation, route guards, theme files, global CSS, common components, shared hooks, stores, API mocks, fixtures, and assets.
- If a requested change to another screen requires editing shared code that may affect a protected screen, pause and ask the user for approval first.
- Do not perform broad refactors, formatting-only rewrites, or dependency upgrades that touch protected-screen files as part of unrelated work.
- After completing UI work, state clearly whether any protected-screen files or shared dependencies were touched.

## Review Checklist Before Editing

- Identify the files and routes involved in the requested change.
- Check whether any target file is part of Login, Dashboard, Dashboard menu, User Management menu, User Management > User List, User Management > Reported Users, User Detail, Report Detail, any user/report action modal, Asset Management menu, Asset Management > Asset List, Asset Detail, Asset Management > Reported Assets, Asset Report Detail, any asset report detail modal, any asset action modal, Asset Management > Reported Comments, Comment Report Detail, any comment report detail modal, any comment moderation action modal, any Content Management screen, submenu, modal, detail view, or action flow, any Market Data screen, menu behavior, submenu, modal, detail view, chart, filter, data action, or refresh flow, or any Offer Management screen, menu behavior, list, filter, detail view, route, or data flow.
- Check whether any shared file is used by those protected screens.
- If protected impact is possible, ask for confirmation before editing.
- Keep changes scoped to the requested screen or feature.

## Approval Requirement

Changes to the protected screens are allowed only when the user explicitly confirms the screen name and requested change. General requests such as "adjust layout", "clean up styles", "refactor prototype", or "update navigation" are not enough approval to touch these locked screens, their action flows, or their menu behavior.
