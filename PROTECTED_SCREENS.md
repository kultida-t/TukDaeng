# Protected Prototype Screens

These screens have been confirmed and are locked from incidental changes:

- Login
- Dashboard
- User Management > User List

## User List Protected Scope

The protected User Management > User List scope includes:

- The main User List table or list screen.
- User detail views, detail panels, or detail pages opened from User List.
- Every modal, drawer, confirmation dialog, toast result, and action flow opened from User List actions.
- Row actions, bulk actions, filter, search, sorting, pagination, tabs, selection state, and visible status changes on User List.
- Mock data, fixtures, state logic, route parameters, and shared components that directly support the User List detail or action flows.

## Rules

- Do not change layout, styling, behavior, routing, copy, mock data, or component structure for the protected screens unless the user explicitly asks for that exact change.
- Treat shared files as high risk when they are used by protected screens. This includes layout shells, navigation, route guards, theme files, global CSS, common components, shared hooks, stores, API mocks, fixtures, and assets.
- If a requested change to another screen requires editing shared code that may affect a protected screen, pause and ask the user for approval first.
- Do not perform broad refactors, formatting-only rewrites, or dependency upgrades that touch protected-screen files as part of unrelated work.
- After completing UI work, state clearly whether any protected-screen files or shared dependencies were touched.

## Review Checklist Before Editing

- Identify the files and routes involved in the requested change.
- Check whether any target file is part of Login, Dashboard, User Management > User List, User List detail views, or User List action modals.
- Check whether any shared file is used by those protected screens.
- If protected impact is possible, ask for confirmation before editing.
- Keep changes scoped to the requested screen or feature.

## Approval Requirement

Changes to the protected screens are allowed only when the user explicitly confirms the screen name and requested change.
