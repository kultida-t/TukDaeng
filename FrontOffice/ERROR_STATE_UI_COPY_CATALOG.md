# Front Office Error State UI Copy Catalog

**Baseline Version:** `FO-PRD-v1.2`  
**Date:** 2026-07-02  
**Owner:** Product / UX / Dev / QA  
**Scope:** Final Front Office error, loading, fallback, and retry copy for Figma-to-Dev handoff.

---

# 1. Purpose

This catalog is the shared reference for Front Office error-state UI copy and behavior. Dev should use it with the module PRDs, especially `02_FEED_MODULE.md`, `00_GLOBAL_RULES_MODULE.md`, and `QA_TEST_SCENARIO_CHECKLIST.md`.

If this file conflicts with an older Figma annotation, use this file for error-state copy and retry scope.

---

# 2. State Type Rules

| State type | Use when | Layout | Retry scope |
| --- | --- | --- | --- |
| Full-page error | Initial screen data cannot load and no cached data exists | Centered empty/error screen in content area | Reload the current screen request |
| Banner / snackbar | Refresh/update fails but existing data is still visible | Short message above affected content or as snackbar | Retry the refresh/update request only |
| Inline list error | Pagination/load-more fails after existing items are visible | Error block after the last successfully loaded item | Retry the next-page request only |
| Section error | A non-critical section fails inside a loaded screen | Inline error inside that section | Retry that section request only |
| Image placeholder | Data loads but an image request fails | Placeholder inside the exact image frame | Retry that image request only |
| Field validation | User input is invalid | Message near the field or form action | No network retry until user fixes input |
| Permission / unavailable | User cannot access an entity or it no longer exists | Shared fallback screen or row/card fallback | Go back or route to a safe destination |

---

# 3. Feed States

## Initial Feed Load Failed

| Element | Copy |
| --- | --- |
| Title | `Unable to load feed` |
| Body | `Your internet connection may be unstable. Check your connection and try again.` |
| Button | `Try again` |

Behavior:

- Show a full-page error in the Feed content area.
- Do not show an empty list state.
- Retry reloads the current Feed tab.

## Offline, No Cache

| Element | Copy |
| --- | --- |
| Title | `No internet connection` |
| Body | `Connect to the internet and try loading the feed again.` |
| Button | `Try again` |

Behavior:

- Show a full-page offline state.
- Retry checks connection and reloads the current Feed tab.

## Offline With Cache

| Element | Copy |
| --- | --- |
| Banner | `You are offline. This information may not be up to date.` |

Behavior:

- Keep showing cached Feed cards.
- Remove the banner after fresh data loads successfully.

## Refresh Feed Failed With Existing Data

| Element | Copy |
| --- | --- |
| Message | `Unable to update feed. Please try again.` |
| Action | `Retry` |

Behavior:

- Keep all existing Feed cards visible.
- Show as a banner/snackbar below the top bar and above Feed tabs when possible.
- Retry refreshes the current Feed tab only.
- Do not run load-more pagination from this action.

## Load More Feed Items Failed

| Element | Copy |
| --- | --- |
| Title | `Unable to load more feed items` |
| Body | `Check your connection and try again.` |
| Button | `Try again` |

Behavior:

- Keep all existing Feed cards visible.
- Show the inline error after the last successfully loaded Feed card.
- Retry loads the next page only.
- Do not refresh or clear the whole Feed.

## Slow Network

| Element | Copy |
| --- | --- |
| Message | `Loading data. This may take a moment.` |

Behavior:

- Keep skeleton/loading visible.
- Do not show a blank page.

---

# 4. Feed Card Image States

## Feed Card Image Failed

| Element | Copy |
| --- | --- |
| Title | `Image failed to load` |
| Button | `Retry image` |

Behavior:

- Show the placeholder inside the image frame only.
- Preserve the original image frame size so the card layout does not jump.
- Keep Brand, Model, Price, Owner, Posted Time, Like Count, and Comment Count visible.
- Retry re-requests only this card image.
- Do not reload the whole Feed.

## Partial Gallery Image Failed

| Element | Copy |
| --- | --- |
| Title | `Image failed to load` |
| Button | `Retry image` |

Behavior:

- Show loaded images normally.
- Show the placeholder only on the failed slide.
- Retry only the failed image request.

---

# 5. Feed Card Owner Fallback States

## Profile Image Failed, Owner Data Loaded

Use when the profile/avatar image fails but owner id and display name are available.

| Element | Copy / UI |
| --- | --- |
| Avatar | Default user icon or initials |
| Name | Actual seller display name |
| Time | Listing timestamp |
| Follow | Enabled if follow state is known |

Behavior:

- Do not show an error message in the owner row.
- Owner row can still open Public Profile if owner id is known.

## Owner Data Loading

| Element | UI |
| --- | --- |
| Avatar | Circular skeleton |
| Name | Text skeleton |
| Time | Text skeleton if timestamp is also pending |
| Follow | Hidden or disabled skeleton |
| More menu | Hidden until required ids/actions are known |

Behavior:

- Do not show `Unknown seller` while the request is still pending.
- Avoid enabling actions that depend on owner id.

## Owner Data Failed, Asset Data Loaded

| Element | Copy / UI |
| --- | --- |
| Avatar | Default user icon |
| Name | `Unknown seller` |
| Time | Show only if timestamp comes from listing data |
| Follow | Hidden |
| More menu | Hidden unless listing-level actions are still valid |

Behavior:

- Keep the Feed card visible.
- Do not show `Follow` because owner id/follow state may be unknown.
- If listing-level actions remain valid, the more menu may show only those actions, such as `Report listing`.

## Seller Unavailable

| Element | Copy / UI |
| --- | --- |
| Avatar | Default user icon |
| Name | `Seller unavailable` |
| Follow | Hidden |
| More menu | Hide owner actions; keep only valid listing-level actions if allowed |

Behavior:

- Public Profile entry must not open private/unavailable user data.
- Asset visibility still follows the global visibility and block rules.

---

# 6. Asset Detail / Section Errors

## Detail Loaded, Additional Section Failed

| Element | Copy |
| --- | --- |
| Title | `Unable to load more details` |
| Body | `Check your connection and try again.` |
| Button | `Try again` |

Behavior:

- Keep the loaded Asset Detail content visible.
- Retry only the failed section.
- Do not reload the entire Asset Detail screen unless the failed section is the primary request.

## Asset Unavailable

| Element | Copy |
| --- | --- |
| Title | `This item is no longer available.` |
| Button | `Go back` |

Behavior:

- If navigation history exists, return to the previous screen.
- If no navigation history exists, route to Feed.
- Do not use `Back to feed` unless the entry point is known to be Feed.

## Permission Denied

| Element | Copy |
| --- | --- |
| Title | `Permission denied` |
| Button | `Go back` |

Behavior:

- Do not expose private data.
- Route using the same fallback rule as unavailable state.

---

# 7. Search / Result List States

## Search No Result

| Element | Copy |
| --- | --- |
| Message | `No data found` |

## Search Error

| Element | Copy |
| --- | --- |
| Message | `Something went wrong. Please try again.` |
| Button | `Try again` |

Behavior:

- Retry reruns the current search with the same keyword, filters, and sort.
- Deleted assets from stale results must route to Asset Unavailable.

---

# 8. Empty States

Use the global empty-state copy unless a module has an approved exception.

| Element | Copy |
| --- | --- |
| Message | `No data found` |

Approved exceptions:

| Context | Copy |
| --- | --- |
| Asset comments | `No comments yet.` |
| Asset comments helper | `Be the first to comment.` |
| Portfolio gain/loss unavailable | `Gain/Loss unavailable` |

---

# 9. Retry Scope Checklist For Dev

| UI action | Must retry |
| --- | --- |
| Feed full-page `Try again` | Current Feed tab initial request |
| Offline full-page `Try again` | Current Feed tab after connection check |
| Refresh failed `Retry` | Refresh/update request only |
| Load more `Try again` | Next-page pagination request only |
| Image `Retry image` | Single image request only |
| Section `Try again` | Failed section request only |
| Search `Try again` | Current search result request only |
| Permission/unavailable `Go back` | Navigation fallback only, no data mutation |

---

# 10. Dev Handoff Notes

- Existing data must not be cleared when refresh, pagination, image, or section retry fails.
- Image failures must not hide the entire card when asset data exists.
- Owner fallback must not show owner-dependent actions unless owner id and permission state are known.
- Retry actions must be idempotent and scoped to the failed request.
- QA should verify trigger, UI behavior, copy, retry scope, and data preservation for every state in this catalog.
