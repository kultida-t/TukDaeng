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
- Asset Management menu entry, Asset List navigation state, Asset Detail navigation state, Reported Assets navigation state, Asset Report Detail navigation state, and asset status/action flows
- Content Management > Articles > Add Article, confirmed and locked as of 2026-07-22

## Protected Prototype Files

The current confirmed prototype implementation is in:

- `Prototypes/bo-prototype.html`
- `Prototypes/assets/login-watch-hero.png`
- `Prototypes/assets/tukdaeng-app-icon.png`
- `Prototypes/assets/user-avatars/*`
- `Prototypes/assets/fonts/*`

Do not edit these files for unrelated work if the edit can change Login, Dashboard, User Management menu behavior, User List, Reported Users, user/report detail views, any user/report action flows, Asset Management menu behavior, Asset List, Asset Detail, Reported Assets, Asset Report Detail, any asset report detail modal, any asset status/action flows, or Content Management > Articles > Add Article.

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

## Add Article Protected Scope

The protected Content Management > Articles > Add Article scope includes:

- The Add article button/entry point from Content Management > Articles and the route/state transition into the article editor.
- The Add Article editor layout, header fields, category selector, author field, cover upload, cover caption, intro/deck field, content block builder, block add/delete/move controls, image block upload, publish status selector, publish date/time controls, and submit/cancel buttons.
- The article preview opened from Add Article, including Board card preview, FO phone preview, scroll containment behavior, modal layout, copy, imagery, metadata, and close behavior.
- Validation, disabled states, upload error states, draft defaults, generated article IDs, timestamp handling, and save/create behavior for new articles.
- Breadcrumbs, titles, panel labels, navigation state, and back/cancel behavior connected to Add Article.
- Mock data, state logic, computed values, helper functions, styles, and shared components that directly support Add Article rendering or behavior.

## Rules

- Do not change layout, styling, behavior, routing, copy, mock data, or component structure for the protected screens unless the user explicitly asks for that exact change.
- Do not change navigation labels, menu order, active states, breadcrumbs, or route behavior for Dashboard, User Management, Asset Management, or Content Management > Articles > Add Article unless the user explicitly approves that exact change.
- Treat shared files as high risk when they are used by protected screens. This includes layout shells, navigation, route guards, theme files, global CSS, common components, shared hooks, stores, API mocks, fixtures, and assets.
- If a requested change to another screen requires editing shared code that may affect a protected screen, pause and ask the user for approval first.
- Do not perform broad refactors, formatting-only rewrites, or dependency upgrades that touch protected-screen files as part of unrelated work.
- After completing UI work, state clearly whether any protected-screen files or shared dependencies were touched.

## Review Checklist Before Editing

- Identify the files and routes involved in the requested change.
- Check whether any target file is part of Login, Dashboard, Dashboard menu, User Management menu, User Management > User List, User Management > Reported Users, User Detail, Report Detail, any user/report action modal, Asset Management menu, Asset Management > Asset List, Asset Detail, Asset Management > Reported Assets, Asset Report Detail, any asset report detail modal, any asset action modal, or Content Management > Articles > Add Article.
- Check whether any shared file is used by those protected screens.
- If protected impact is possible, ask for confirmation before editing.
- Keep changes scoped to the requested screen or feature.

## Approval Requirement

Changes to the protected screens are allowed only when the user explicitly confirms the screen name and requested change. General requests such as "adjust layout", "clean up styles", "refactor prototype", or "update navigation" are not enough approval to touch these locked screens, their action flows, or their menu behavior.
