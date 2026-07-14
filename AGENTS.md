# Agent Instructions

## Protected Prototype Screens

The following prototype screens are confirmed and locked as of 2026-07-14. They must not be modified unless the user explicitly requests changes to the named protected screen or flow:

- Login
- Dashboard, including the Dashboard menu entry, active state, routing, cards, metrics, and links from Dashboard content
- User Management > User List, including the User Management menu entry, User List submenu/active state, user detail views/panels, and every confirmation modal, lock/confirm state, or action flow opened from the User List screen
- User Management > Reported Users and Report Detail, including report lists/queues, report detail views/panels, report status actions, user actions opened from report context, confirmation modals, lock/confirm states, audit/result states, breadcrumbs, routing, and navigation state

When working on other screens:

- Do not edit files that belong to the protected screens.
- Do not modify shared components, styles, routes, layout shells, navigation, state logic, mock data, or assets in a way that changes the protected screens or their menu behavior.
- If a required change may affect a protected screen, stop and ask for approval before editing.
- Before finalizing any UI change, report whether the protected screens were touched.

See `PROTECTED_SCREENS.md` for the protected-screen policy and review checklist.
