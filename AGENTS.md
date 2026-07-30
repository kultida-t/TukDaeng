# Agent Instructions

## Protected Prototype Screens

The following prototype screens are confirmed and locked as of 2026-07-19. They must not be modified unless the user explicitly requests changes to the named protected screen or flow:

- Login
- Dashboard, including the Dashboard menu entry, active state, routing, cards, metrics, and links from Dashboard content
- User Management > User List, including the User Management menu entry, User List submenu/active state, user detail views/panels, and every confirmation modal, lock/confirm state, or action flow opened from the User List screen
- User Management > Reported Users and Report Detail, including report lists/queues, report detail views/panels, report status actions, user actions opened from report context, confirmation modals, lock/confirm states, audit/result states, breadcrumbs, routing, and navigation state
- Asset Management > Asset List and Asset Detail, including the Asset Management menu entry, Asset List submenu/active state, asset detail views/panels, asset status/action buttons, confirmation modals, lock/confirm states, audit/result states, breadcrumbs, routing, and navigation state
- Asset Management > Reported Assets and Asset Report Detail, including report lists/queues, asset report detail views/panels, every detail modal opened from these screens, report status actions, asset/user actions opened from asset report context, confirmation modals, lock/confirm states, audit/result states, breadcrumbs, routing, and navigation state
- Content Management > Articles > Article List, Article Detail, Add Article, and Edit Article, including the Articles menu entry/submenu/active state, article list/filters/cards/actions, article detail views/panels, add/edit entry points, editor form, block builder, image upload controls, publish scheduling controls, preview modal, submit/cancel flow, validation states, breadcrumbs, routing, and navigation state

When working on other screens:

- Do not edit files that belong to the protected screens.
- Do not modify shared components, styles, routes, layout shells, navigation, state logic, mock data, or assets in a way that changes the protected screens or their menu behavior.
- If a required change may affect a protected screen, stop and ask for approval before editing.
- Before finalizing any UI change, report whether the protected screens were touched.

See `PROTECTED_SCREENS.md` for the protected-screen policy and review checklist.
