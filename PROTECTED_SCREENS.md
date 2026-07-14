# Protected Prototype Screens

These screens have been confirmed by the user and are locked from incidental changes as of 2026-07-14:

- Login
- Dashboard, including the Dashboard menu entry and links that open Dashboard content
- User Management > User List
- User Management > Reported Users
- User Management > Report Detail
- User Management menu entry, User List navigation state, and Reported Users navigation state

## Protected Prototype Files

The current confirmed prototype implementation is in:

- `Prototypes/bo-prototype.html`
- `Prototypes/assets/login-watch-hero.png`
- `Prototypes/assets/tukdaeng-app-icon.png`
- `Prototypes/assets/user-avatars/*`
- `Prototypes/assets/fonts/*`

Do not edit these files for unrelated work if the edit can change Login, Dashboard, User Management menu behavior, User List, Reported Users, user/report detail views, or any user/report action flows.

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

## Rules

- Do not change layout, styling, behavior, routing, copy, mock data, or component structure for the protected screens unless the user explicitly asks for that exact change.
- Do not change navigation labels, menu order, active states, breadcrumbs, or route behavior for Dashboard or User Management unless the user explicitly approves that exact change.
- Treat shared files as high risk when they are used by protected screens. This includes layout shells, navigation, route guards, theme files, global CSS, common components, shared hooks, stores, API mocks, fixtures, and assets.
- If a requested change to another screen requires editing shared code that may affect a protected screen, pause and ask the user for approval first.
- Do not perform broad refactors, formatting-only rewrites, or dependency upgrades that touch protected-screen files as part of unrelated work.
- After completing UI work, state clearly whether any protected-screen files or shared dependencies were touched.

## Review Checklist Before Editing

- Identify the files and routes involved in the requested change.
- Check whether any target file is part of Login, Dashboard, Dashboard menu, User Management menu, User Management > User List, User Management > Reported Users, User Detail, Report Detail, or any user/report action modal.
- Check whether any shared file is used by those protected screens.
- If protected impact is possible, ask for confirmation before editing.
- Keep changes scoped to the requested screen or feature.

## Approval Requirement

Changes to the protected screens are allowed only when the user explicitly confirms the screen name and requested change. General requests such as "adjust layout", "clean up styles", "refactor prototype", or "update navigation" are not enough approval to touch these locked screens or their menu behavior.
