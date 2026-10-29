# TukDaeng Front Office — QA Test Scenario Checklist

| Field | Value |
| --- | --- |
| Document | QA Test Scenario Checklist |
| Version | 2.0 — synced to FO-PRD-v1.9 (FSP-027) |
| Status | Active |
| Owner | QA Team |
| Source of truth | `Prototypes/fo-flow` (locked) + `TukDaeng_Master_Product_Definition.md` §16 Sync Decision Log |

## Purpose

This document is the QA execution checklist for Front Office V1. Each scenario maps to the canonical module specs (`00`–`17`) and the Master §16 Sync Decision Log. Any behavior that conflicts with the locked `fo-flow` prototype + Master §16 has been removed from this checklist — see §1.3 Removed Behaviors for the full guard list.

## Conventions

- **`Maps to`** — AC IDs that actually exist in the module specs (verified by cross-document grep). Items that assert a rule with no direct AC cite the spec section instead (e.g. `00_GLOBAL §11`).
- **Prototype** — verifiable on the locked `fo-flow` prototype today.
- **(contract)** — production contract per S-29: the prototype has no implementation to compare against; verify in production/staging or by code review. Prototype-only mock behavior is noted where relevant.
- **Known documented defects** (S-10, S-14 and module deviation notes): these are *not* spec. When observed, log them as defects — never write expected results around them:
  - `salePosts()` counts priced `show`/`hide`/`sold` posts into Search results grid, filter `(N)` counts and Watch Alert `N now`/`_waHits` (S-10 — canonical pool is `Sale` only)
  - Viewer profile `all` tab leaks `post`/`hide`/`sold` posts onto the public grid (S-14 — canonical public profile is `Sale`+`Show` only)
  - `FOR SALE` tag on detail is driven by `price`, not `pfkind`, so a sold post with a leftover price still shows `FOR SALE` (05 §9 deviation)
  - Hidden chat threads still appear in Items view groups; media send does not un-hide/move-to-top
  - Comment input/`Reply`/`emoji` from Post Detail are dead affordances (`Not in this prototype yet`) while the emoji quick-react inside the comment sheet is live — surface-dependent quirk
  - EN/TH hardcoded strings across several surfaces (language sweep scope)

---

## 1. Test Data Setup

### Actors

| Actor | Session | Role in tests |
| --- | --- | --- |
| Guest | `guest` | Unauthenticated browser — free-browse + Member Sheet gate checks |
| Member A | `member` | Viewer — follows Member B, has saved posts, collections, watch alerts, liked posts |
| Member B | `member` | Seller/owner — own posts in every `pfkind`, portfolio drawer assets, sold records, chat threads |
| Member C | `member` | Second seller — favorites/mute/block/removed-follower test target |
| New Member | `new` | Just registered — member powers but empty personal data |
| Suspended / Banned | — | Account-status states (contract only — prototype has no status check) |

### Seed content (minimum)

- Per seller: ≥1 `sale` post (price + specGroups), ≥1 `showcase` post (no price), ≥1 plain `post` (non-asset), ≥1 multi-photo post, ≥1 clip post, ≥1 `noComments` post, ≥1 `hideCounts` post
- Member B portfolio: ≥1 `show` drawer asset with purchase cost, ≥1 `hide` drawer asset, ≥1 `sale` linked asset, ≥1 `sold` record (sale price + sale date), ≥1 asset with no purchase cost (`N/A` paths)
- Alerts feed rows covering all 5 types: `like` (aggregated multi-user), `comment`, `follow`, `watch`, `system`
- Watch alerts: ≥1 `search`-source (keyword + filters + price), ≥1 `detail`-source (`modelKey`), ≥1 paused
- Chat: ≥1 thread with messages + media, ≥1 pinned, ≥1 muted, ≥1 hidden, plus draft-room state before first send
- Collections: ≥1 Saved collection, ≥1 Wish List collection, ≥1 archived post, ≥1 `ni` post
- Board: ≥1 article per category; hero carousel with ≥2 slides
- One blocked user pair (B blocks C) for keep-page/read-only tests

### Removed / renamed behaviors — do NOT test these

These legacy behaviors were deleted or renamed in FO-PRD-v1.9. If any of them appear live in the app it is a defect, not a feature:

| Legacy item | Canonical replacement |
| --- | --- |
| `Global Login Required Dialog` | Member Sheet `Join TukDaeng` bottom sheet (gate variant, scrim-dismiss, stays on surface) |
| `Notification Center` | Alerts feed (`แจ้งเตือน`/`Alerts`) — 5 types only |
| `Price on request` label | Removed — empty price = `showcase`; no buyer-facing price label |
| `Hide this asset` owner action | Owner lifecycle = status `Hide` via Edit info `Profile status` pick; viewer feed hiding = `Not interested` (different concept) |
| `Total Asset Value` headline | `Total invested` (Σ purchase prices, private) |
| `Top Brand Holdings` / `YTD Performance` | Removed from Portfolio V1 entirely |
| `Contact Seller` / Offer flow / offer amount / offer status / offer notification | `Ask Seller` pill — chat entry on `sale` posts only; no Offer feature in V1 |
| Watch Alert `Result List` screen | Watch notification taps straight into Post Viewer of the matched post |
| Same-User-Merge chat thread | Thread key = `{user, item}` — same seller, different listing = new room |
| Standalone `Change Status` sheet / Edit Asset form | Status changes via Edit info `Profile status` pick only |
| 6-field Sale Record (Buyer/Contact/Payment/Attachment/Note) | 2-field record: `Sale price` + `Sale date` (+ live Expected gain when purchase > 0) |
| Sale-only marketplace feed | Post-centric feed — `post` + `sale` posts eligible |
| `Report` center dialog `Report submitted. Thank you for letting us know.` | `report:pick` → `report:posts`/`report:user` → `report:done` step rows → `Report submitted · thanks for letting us know` |
| Center dialog `Block this user?` + Cancel | `blkSheet` bottom sheet `Block {u}?` + `Block` / `Block and report` (fromChat = `Block` only) |
| Comment free-text input / `Reply` affordance | Emoji quick-react (8 emoji) is the only write path; input/`Reply` are dead |
| `Favorites` = liked posts | Favorites = account-level seller preference; liked posts land in Settings > Content preferences > Interested |
| `Likes` notification type name | Alert types = `like`/`comment`/`follow`/`watch`/`system` |
| Chat notification / offer notification / Market Update / Price Valuation / Sale Success / Moderation / Account Action types | Only the 5 canonical types exist; `system` is a placeholder type |
| Edit Profile row in Settings Home | Edit Profile entry = own profile page only (S-05) |
| Search sort UI / result count / saved search / context-aware popular (S-24) | None in V1 |
| Provenance / Consignment entity (S-25) | None in V1 |
| E2E / Letter Sealing as a feature (S-18) | Chat footer copy claim only — never spec it as a feature |
| Confirm Password field, OTP expiry UI, Verification Success page, Reset Password page (S-20) | Removed from spec |
| Drawer rows as live routes (S-19) | 9 placeholder rows → placeholder toast only |
| Like count on others' posts (S-26) | Like count is private — own posts only |
| Full-screen image viewer / pinch zoom | None — media tap = in-card carousel |
| Payment Gateway | Phase 2 (AC-INT-012) |

---

## 2. Global Role & Permission

### QA-GLOBAL-001
**Objective:** Verify Member Sheet `Join TukDaeng` gate on every login-required action.
**Maps to:** AC-GLOBAL-007, AC-NAV-005, AC-AUTH-022, AC-AUTH-048
**Precondition:** Session `guest` (signed out).
**Steps:**
1. From feed card tap like, comment input, share, save, follow, `...` menu.
2. Tap `Ask Seller` on a sale post; tap `+` composer; tap Watch Alert bell (`sr-wa`/`mf-btn`).
3. Tap bottom-nav Chat, Alerts, Profile tabs.
4. On a public profile tap Follow, `...` menu, pfollow pill.
5. On a board article tap like / share.
**Expected result:**
- Every gated tap opens the same bottom sheet `Join TukDaeng` overlaid on the current surface — never a page navigation, never a different dialog.
- Scrim tap or `Skip for now` dismisses back to the same surface unchanged; nothing is persisted.
- Free-browse surfaces (feed tabs, search, boards, post viewer/detail, public profile grid, pfollow lists, avatar overlay shell, legal pages) never trigger the gate.

### QA-GLOBAL-002
**Objective:** Verify Member Sheet anatomy and choices.
**Maps to:** AC-AUTH-030, 00_GLOBAL §11
**Precondition:** Guest; Member Sheet open via any gated action.
**Steps:**
1. Inspect sheet content and buttons.
2. Tap `Sign up` / `Email`, `Log in`, Apple, Google, `Skip for now`, `Don't show this again` + skip.
**Expected result:**
- Sheet shows title `Join TukDaeng`, value copy, social row (Apple/Google), email path and `Have an account? Log in` link.
- `Email`/`Sign up` → Sign Up page; `Log in` → Sign In page; Apple/Google → toast `Not in this prototype yet` (prototype).
- `Don't show this again` + skip suppresses the sheet on later gated taps in that context (first-run variant persists per AC-AUTH-030).
- After successful sign-in from the gate the surface stays put — the gated action must be tapped again (no pending-action resume).

### QA-GLOBAL-003
**Objective:** Verify guest free-browse scope end to end.
**Maps to:** AC-GLOBAL-017, AC-FEED-007, AC-SEARCH-031, AC-BOARD-012
**Precondition:** Session `guest`.
**Steps:**
1. Switch feed tabs All / Following / Favorites.
2. Open search, type, submit, open filters, open a result tile → Post Viewer → `View full detail`.
3. Open Boards, open an article.
4. Open a public profile, switch tabs, open a grid tile, open followers/following lists.
**Expected result:**
- All browsing completes with zero gates; Following/Favorites tabs render with guest-appropriate (membership-filtered/empty) content rather than a sheet.
- Any identity action inside these surfaces still opens the Member Sheet.

### QA-GLOBAL-004
**Objective:** Verify share is login-required on every surface (S-03).
**Maps to:** AC-NAV-025, AC-FEED-017, AC-SOCIAL-008, AC-BOARD-011, AC-BOARD-012
**Precondition:** Session `guest`, then repeat as Member A.
**Steps:**
1. As guest: tap share on feed card, Post Viewer rail, Post Detail, article detail, profile `Share this profile` path.
2. As member: repeat and exercise friends row, app row, `Copy link`.
**Expected result:**
- Guest: every share entry opens Member Sheet — never the share sheet, system share, or a copy-link fallback.
- Member: share sheet opens (search field + 12 friends grid + Messenger/Direct/LINE/Facebook/`Copy link`); friend → `Sent to {name}`; app → `Shared to {app}`; copy → `Link copied`. No native OS share, no share count.

### QA-GLOBAL-005
**Objective:** Verify bottom-nav gate map.
**Maps to:** AC-NAV-017, AC-NAV-020, AC-NAV-019
**Precondition:** Session `guest`.
**Steps:**
1. Tap each bottom-nav tab in order: Feed, Chat, Boards, Alerts, Profile.
2. Check unread badge caps on Chat and Alerts tabs as member.
**Expected result:**
- Feed and Boards open freely; Chat, Alerts and Profile each open the Member Sheet.
- Tab order is exactly Feed / Chat / Boards / Alerts / Profile; non-feed tabs swap instantly without slide.
- As member, nav badge shows Σunread capped at `99+` and disappears at 0.

### QA-GLOBAL-006
**Objective:** Verify session state matrix (member / new / guest).
**Maps to:** AC-GLOBAL-016, AC-NOTI-016, AC-WA-023, AC-WA-024, AC-CHAT-039
**Precondition:** Ability to switch session state.
**Steps:**
1. Switch to `new`: open Alerts feed, Watch Alerts list, Chat list, own profile, portfolio.
2. Switch to `guest` and repeat.
3. Switch back to `member` and verify data restore.
**Expected result:**
- `new` has full member powers but empty personal data: `No alerts yet`, `No watch alerts yet`, `No chats yet`, empty pfollow lists, portfolio with no rows — gated surfaces that need *identity* open page-1/onboarding surfaces rather than Member Sheet where the spec says so.
- `guest` shows Member Sheet on gated surfaces and cleared member data everywhere.
- `member` restores account data (alerts re-seed; watch alerts/session-state items follow documented restore rules — WA alerts are not restored after session switch, documented deviation).

### QA-GLOBAL-007
**Objective:** Verify sign-out cleanup.
**Maps to:** AC-GLOBAL-020, AC-AUTH-021, AC-AUTH-049, AC-SETTING-008
**Precondition:** Member A signed in with personal data (likes, saved, chats, alerts).
**Steps:**
1. Settings → `Log out` → confirm `Log out of @{user}?`.
2. Browse surfaces as the now-guest session.
3. Sign back in with the same account.
**Expected result:**
- Session becomes `guest` + toast `Logged out successfully`; personal data cleared from surfaces (liked/saved state gone, chat/alerts empty).
- Credential persists — sign-in works immediately with the same account; sign-in success re-enters silently.

### QA-GLOBAL-008
**Objective:** Verify the canonical status model.
**Maps to:** AC-GLOBAL-001, AC-ASSET-MGMT-019, AC-PORT-022
**Steps:**
1. Create assets/posts through every path (Add Asset visibility picks, post composer, Edit info).
2. Inspect every status picker and post `pfkind` outcome.
**Expected result:**
- Only `Sale`, `Show`, `Hide`, `Sold` statuses exist for asset-linked posts, plus `post` for non-asset posts.
- `Sold` never appears in any status pick — it is reachable only via `Mark as sold` and is terminal (`View sale record` replaces `Edit`; drawer toggle locked `This item lives in your Sold history`).

### QA-GLOBAL-009
**Objective:** Verify the visibility matrix on every surface.
**Maps to:** AC-GLOBAL-002, AC-GLOBAL-003, AC-GLOBAL-004, AC-GLOBAL-005, AC-ASSET-MGMT-024
**Precondition:** Member B owns one post in each state: `post`, `sale`, `show`, `hide`, `sold`. Member A + Guest browse.
**Steps:**
1. Check feed for all three actors.
2. Check search results grid and Watch Alert match counts.
3. Check Member B's public profile (as A and guest) and own profile tabs.
**Expected result:**

| Surface | `post` | `sale` | `show` | `hide` | `sold` |
| --- | --- | --- | --- | --- | --- |
| Feed (any viewer) | ✓ | ✓ | – | – | – |
| Search results / WA match | – | ✓ | – | – | – |
| Public profile (non-owner) | – | ✓ | ✓ | – | – |
| Owner profile `all` tab | ✓ | ✓ | ✓ | ✓ | ✓ |
| Owner status tabs | – | ✓ | ✓ | ✓ | ✓ |

- Priced `show`/`hide`/`sold` leaking into search/WA counts is the documented S-10 defect — log it, do not accept it.

### QA-GLOBAL-010
**Objective:** Verify empty-state copy rule.
**Maps to:** AC-GLOBAL-006
**Steps:** Open empty states across surfaces (search no results, empty chat list, empty alerts, empty saved, empty sold history, empty pfasset/sell/sold id).
**Expected result:** Generic empty copy `ไม่พบข้อมูล` / `No data found` plus surface-specific subtitles where spec'd (e.g. `No chats yet` + `Tap Ask on a post to start chatting with the seller.`).

### QA-GLOBAL-011
**Objective:** Verify deleted/unavailable post handling.
**Maps to:** AC-GLOBAL-008, AC-ASSET-MGMT-038, AC-NAV-011, AC-DETAIL-034
**Steps:**
1. Member B deletes a post that A had saved/wishlisted.
2. A opens the stale tile; B opens a stale `sell:`/`sold:`/`pfasset:` id; a chat links to the deleted post.
**Expected result:**
- Post disappears from every surface; stale tile → toast `This post is no longer available` (prototype) / full unavailable page `รายการนี้ไม่พร้อมใช้งานแล้ว` (contract).
- Chat remains accessible (AC-NAV-012); `data-chgo="post"` on the deleted item → toast `Listing detail isn't in this prototype yet` (prototype) / unavailable state (contract).
- A detail open on a post that gets deleted closes automatically.

### QA-GLOBAL-012
**Objective:** Verify private data never leaks to public surfaces.
**Maps to:** AC-GLOBAL-012, AC-ASSET-MGMT-018, AC-ASSET-MGMT-039, AC-PORT-020, AC-PROFILE-053, AC-DETAIL-036
**Steps:** As Member A and Guest, inspect every surface of Member B's assets/posts: feed card, viewer, detail, public profile, pfollow lists.
**Expected result:** No purchase price/date, no sale record fields, no portfolio values, no `Total invested`, no holding period, no expected profit — anywhere. These appear only on owner-only `portfolio`/`pfasset:`/`sell:`/`sold:`/`soldhist` routes.

### QA-GLOBAL-013
**Objective:** Verify implied-consent model.
**Maps to:** AC-GLOBAL-018, AC-AUTH-014, AC-AUTH-026, AC-TS-013
**Steps:** Inspect every submit action (Welcome `Continue`, `Create account`, social buttons, re-consent `Accept & continue`).
**Expected result:**
- Legal text with tappable Terms of Use / Privacy Policy links accompanies every submit action; acceptance is implied by the submit — no checkbox anywhere.
- Optional consent (Analytics / Personalized) defaults off and is changeable later at Settings > Privacy / Cookie settings.

### QA-GLOBAL-014
**Objective:** Verify re-consent on policy version bump.
**Maps to:** AC-GLOBAL-019, AC-AUTH-051, AC-AUTH-052
**Precondition:** Policy version bumped (contract — simulate via consent record state).
**Steps:**
1. Open app in each session (`member`, `new`, `guest`).
2. On the re-consent sheet tap each required row, then `Decline`; rerun and choose `Accept & continue`.
**Expected result:**
- Sheet `We've updated our policies` overlays before any use, listing Terms/Privacy v{n} rows that open the in-app legal viewer.
- `Accept & continue` records new consent and proceeds; `Decline` leaves only `Sign out` (member/new) or `Exit app` (guest) — no continue path.

### QA-GLOBAL-015
**Objective:** Verify lifecycle transitions propagate per matrix.
**Maps to:** AC-GLOBAL-015, AC-ASSET-MGMT-022, AC-ASSET-MGMT-030, AC-SEARCH-036
**Steps:** On Member B's `sale` post: Edit info → `Profile status` → `Show`, then `Hide`, then back `Sale`; then `Mark as sold`.
**Expected result:**
- `sale`→`show`/`hide`: post leaves feed immediately (`refreshPostViews`) and drops from search results grid, filter counts and WA matching; reverse transition returns it.
- `Mark as sold`: linked posts become `pfkind:"sold"`, leave feed/status tabs/search/WA (canonical — `salePosts()` leak is the S-10 defect), and land under owner `sold` tab + `soldhist`.

---

## 3. Authentication & Onboarding

### QA-AUTH-001
**Objective:** Verify first-run onboarding sequence (one time only).
**Maps to:** AC-AUTH-025, AC-AUTH-026, AC-AUTH-027, AC-AUTH-028, AC-AUTH-029, AC-AUTH-030
**Precondition:** Fresh install / cleared storage.
**Steps:**
1. Open app; step through splash → language → welcome → privacy notice → notification prompt → track prompt → Member Sheet.
2. At notification prompt choose `Skip` (then rerun choosing `Continue`); at track prompt choose `Ask App Not to Track`.
3. On Member Sheet tick `Don't show this again` and `Skip for now`; restart the app.
**Expected result:**
- Exact order and single presentation; finish persists so relaunch skips the flow.
- `Continue` on welcome records implied consent; Privacy Notice separates essential (always on) from optional toggles; Accept all / Reject all / Cookie settings each record a consent record.
- Notification `Skip` never triggers the OS dialog; only `Continue` does. `Ask App Not to Track` forces personalization consent off.
- Member Sheet shows `Sign up`/`Sign in`/`Skip for now` + social row + `Don't show this again`; hidden + skipped sheet does not reappear.

### QA-AUTH-002
**Objective:** Verify Email/Password sign-up form (S-20 cleaned).
**Maps to:** AC-AUTH-001, AC-AUTH-031, AC-AUTH-014, AC-AUTH-005
**Steps:**
1. Open Sign Up from Member Sheet.
2. Try weak passwords: <8 chars; ≥8 letters-only; ≥8 with a digit or symbol.
3. Submit empty/invalid fields, then a valid pair.
**Expected result:**
- Fields = Email + Password only — **no Confirm Password field**.
- Password field has show/hide toggle + 4-bar strength meter (visual aid, not the policy).
- Canonical policy (00_GLOBAL §12): ≥8 characters **and** at least one number or symbol — reject otherwise. (Prototype deviates with `≥8 + score ≥2`; that is a documented deviation — assert the canonical rule in production.)
- `Create account` carries legal text; valid submit → OTP Verification.

### QA-AUTH-003
**Objective:** Verify OTP behavior.
**Maps to:** AC-AUTH-002, AC-AUTH-032, AC-AUTH-033, AC-AUTH-034
**Steps:**
1. Type a wrong 6-digit code; watch resend state; close the app mid-flow and reopen.
2. Enter the correct code.
**Expected result:**
- Six numeric boxes, auto-advance, backspace walks back, auto-submits on the 6th digit — no Verify button.
- Wrong code → shake + `That code is incorrect. Try again.` + fields cleared.
- `Resend code in 0:30` cooldown before the button returns; no OTP-expired state exists anywhere (S-20).
- Credential persisted before OTP — the account can still sign in after an app restart mid-flow.

### QA-AUTH-004
**Objective:** Verify email signup does NOT auto-login (S-22).
**Maps to:** AC-AUTH-002A, AC-AUTH-038, AC-AUTH-043
**Steps:** Complete email signup + OTP.
**Expected result:** Lands on `Account created` page `Welcome, {name}. Sign in to start exploring.` + `Sign in` button → returns to Sign In. The user is not inside the app; a successful sign-in afterwards opens silently (no welcome toast) with session `new` for a freshly registered account.

### QA-AUTH-005
**Objective:** Verify email uniqueness.
**Maps to:** AC-AUTH-007
**Steps:** Sign up with an already-registered email.
**Expected result:** `This email is already registered. Try signing in.` + path offered to Sign In.

### QA-AUTH-006
**Objective:** Verify Profile Setup.
**Maps to:** AC-AUTH-035, AC-AUTH-036
**Steps:** After OTP (email) or provider consent (social): inspect suggestion; try invalid usernames; use `Skip for now`.
**Expected result:**
- Avatar + `Add photo` + suggested username (email local-part sanitized; `member`+digits fallback; social uses provider display name first).
- Username `3–20` chars, `[a-z0-9_.]` lowercase; failure → `Username required — 3–20 characters: a–z, 0–9, _ or .`
- `Skip for now` assigns the suggested name automatically.

### QA-AUTH-007
**Objective:** Verify social sign-up.
**Maps to:** AC-AUTH-009, AC-AUTH-010, AC-AUTH-011, AC-AUTH-037
**Steps:** Sign up via Apple and via Google (contract for real providers; prototype shows `Not in this prototype yet` toast on the Member Sheet row).
**Expected result:** Provider auto-fills name/email/photo; no password step, no OTP, no Account created page; after Profile Setup the user lands inside the app as session `new`.

### QA-AUTH-008
**Objective:** Verify sign-in form and validation.
**Maps to:** AC-AUTH-039, AC-AUTH-040
**Steps:** Submit empty email, malformed email, empty password; press Enter; tap back.
**Expected result:**
- Fields = Email + Password (show/hide) + `Forgot password?` + `New here? Create account` + social row; field validation precedes credential check with exact copies `Enter your email.` / `Enter a valid email address.` / `Enter your password.`
- Enter submits; back returns to Member Sheet.

### QA-AUTH-009
**Objective:** Verify credential-failure counter.
**Maps to:** AC-AUTH-041
**Steps:** Enter wrong credentials repeatedly, then the right pair.
**Expected result:** Banner `Email or password is incorrect. (n/5)` increments per consecutive failure and resets on success.

### QA-AUTH-010
**Objective:** Verify 5-failure lockout.
**Maps to:** AC-AUTH-042
**Steps:** Fail sign-in 5 times consecutively.
**Expected result:** `Too many attempts. Try again in 15 minutes or reset your password.` + Sign in disabled (contract: 15-minute server-side lockout; prototype disables without a timer).

### QA-AUTH-011
**Objective:** Verify successful sign-in semantics.
**Maps to:** AC-AUTH-043, AC-AUTH-044, AC-AUTH-045
**Steps:** Sign in as returning member; sign in right after email signup; social sign-in on a persisted provider account.
**Expected result:**
- Silent entry — no welcome toast/dialog; session = `member` for a returning member with data, `new` for a just-registered account.
- Social sign-in that matches a persisted provider account enters `new` silently without Profile Setup.
- Sign-in checks auth method + account status first (contract for suspended/banned and grace-period restore).

### QA-AUTH-012
**Objective:** Verify auth-method binding.
**Maps to:** AC-AUTH-012, AC-AUTH-013, AC-AUTH-045
**Steps (contract):** Try email/password on an SSO-only account; try a social provider on an email/password account.
**Expected result:** Both rejected; production shows a method-specific error (prototype folds into generic `incorrect`).

### QA-AUTH-013
**Objective:** Verify Forgot Password (S-20 cleaned).
**Maps to:** AC-AUTH-046, AC-AUTH-047, AC-AUTH-017
**Steps:**
1. `Forgot password?` → submit invalid email; then a valid one (also try an SSO-only email and a nonexistent email).
2. Look for any in-app Reset Password page.
**Expected result:**
- Page = `Reset password` (email field + `Send reset link`, back → Sign In); invalid format → `Enter a valid email address.` on submit.
- Every submit lands on `Check your email` + `If an account exists for {email}, we sent a reset link.` + `Back to sign in` — identical copy regardless of account existence or auth method.
- There is no in-app Reset Password page, Verification Success page, or OTP expiry UI anywhere in V1.

### QA-AUTH-014
**Objective:** Verify suspended/banned account handling (contract).
**Maps to:** AC-AUTH-015, AC-AUTH-016, AC-AUTH-016A
**Steps:** Sign in as suspended and banned accounts; simulate a BO revocation mid-session.
**Expected result:**
- Sign-in blocked from main app; account status state shows reason, duration when backend sends it, and a Support contact channel.
- A BO revoke mid-session clears the local session and shows the account status state instead of the app.
- Email (not in-app notification) is the primary suspend/ban channel.

### QA-AUTH-015
**Objective:** Verify token/session rules.
**Maps to:** AC-AUTH-021, AC-AUTH-023, AC-AUTH-049, AC-AUTH-050
**Steps:** Expire/revoke a token; sign out; delete the account; restart the app between steps.
**Expected result:**
- Expired token → guest state or Member Sheet by context; all auth APIs over HTTPS with token auth.
- Sign-out clears session only (credential survives for re-login); Delete Account removes the persisted credential + revokes session → `guest`.

### QA-AUTH-016
**Objective:** Verify login-to-restore during deletion grace period (S-02, contract).
**Maps to:** AC-AUTH-045, AC-SETTING-010B
**Steps:** Delete the account, then sign in again within 30 days.
**Expected result:** Successful sign-in cancels the deletion and restores the account — no separate restore screen.

### QA-AUTH-017
**Objective:** Verify out-of-V1 auth features are absent (S-20, S-24 list).
**Maps to:** AC-AUTH-024, AC-AUTH-031
**Steps:** Sweep auth surfaces for removed features.
**Expected result:** No 2FA, Passkey, Biometric login, Account Linking, Account Merge, Device Management; no Confirm Password, no OTP expiry UI, no Verification Success page, no Reset Password page.

---

## 4. Feed

### QA-FEED-001
**Objective:** Verify post-centric eligibility (S-09).
**Maps to:** AC-FEED-001, AC-FEED-002, AC-FEED-003, AC-GLOBAL-002
**Precondition:** Seed posts of every `pfkind` (`post`, `sale`, `show`, `hide`, `sold`), plus archived/`ni`/muted/blocked posts.
**Steps:** Browse the feed as Member A, Member B (owner), Guest.
**Expected result:**
- Feed contains `post` (non-asset) and `sale` posts — including plain non-asset posts, so the feed is not a sale-only marketplace.
- `show`/`hide`/`sold` asset posts never render; archived, not-interested, muted and blocked (either direction) posts never render; own posts appear in own feed.

### QA-FEED-002
**Objective:** Verify feed tabs.
**Maps to:** AC-FEED-004, AC-FEED-005, AC-FEED-006, AC-FEED-007
**Steps:** Switch All / Following / Favorites as member (with follows + favorites + snoozed suggested state) and as guest.
**Expected result:**
- `All` = every eligible post (snooze-suggested filters suggested posts); `Following` = eligible posts of followed sellers; `Favorites` = eligible posts of favorited sellers.
- Guest can open every tab with no gate (S-16); membership-filtered tabs simply show guest-appropriate content.

### QA-FEED-003
**Objective:** Verify post card anatomy.
**Maps to:** AC-FEED-009, AC-FEED-010, AC-FEED-015, AC-FEED-019, AC-NAV-001, AC-NAV-002
**Steps:** Inspect sale, showcase, multi-photo, clip, noComments, hideCounts, own and others' cards.
**Expected result:**
- Head: avatar + seller (→ public profile) + location sub-line + `Follow` (only when not following) + `...`.
- Media: left/right tap = wrap-around carousel, `1/N` counter + dots; media tap never opens detail/viewer/zoom (no fullscreen viewer in V1).
- Actions: like heart, comment + count (hidden entirely when `noComments`), views eye + count (hidden when `hideCounts`/empty), share, save, `Ask Seller` pill on others' sale posts, liked-by strip (not own post, not `hideCounts`), caption + `more` + `#tag` → search, `Tap for details` when `hasDetails`.

### QA-FEED-004
**Objective:** Verify like behavior and privacy (S-26).
**Maps to:** AC-FEED-011, AC-FEED-012, AC-SOCIAL-001, AC-SOCIAL-002
**Steps:** Member A likes/unlikes a post; Member B checks own post; A checks B's post count display.
**Expected result:**
- Toggle updates `liked` + `likes ±1` and syncs every surface for the same post.
- Like count is private: `lk-n` shows only on the owner's own posts; other posts show `Liked by {name} and others` strip; 1 user = 1 like; owner can like own post; no unlike confirm.

### QA-FEED-005
**Objective:** Verify comment entry from card.
**Maps to:** AC-FEED-016, AC-FEED-028, AC-SOCIAL-003, AC-NAV-004
**Steps:** Tap comment on a card; repeat on a `noComments` post; toggle `Turn off commenting` on an own post.
**Expected result:**
- Shared comment bottom sheet opens directly from the card (no detail detour).
- `noComments` hides both the button and count on every surface; toggling back restores them + toast `Commenting turned on/off`.

### QA-FEED-006
**Objective:** Verify views stat is read-only.
**Maps to:** AC-FEED-009, AC-DETAIL-009
**Steps:** Attempt to tap the views icon on a normal post and a `hideCounts` post.
**Expected result:** Eye + count is a display stat only — no button, no destination; hidden when `hideCounts` or empty/`0`.

### QA-FEED-007
**Objective:** Verify save flow from card.
**Maps to:** AC-FEED-018, AC-SOCIAL-009
**Steps:** Tap save once (unsaved post); re-open the sheet; pick `Saved` again; pick another collection; create `New collection`.
**Expected result:**
- First tap sets `saved` + filled bookmark, then always opens the sheet (`savedCols` = multi-collection array — post อยู่ได้หลาย col).
- Picking `Saved` while saved → unsave (`savedCols` ล้างทั้งหมด) + `Removed from your saved`; re-picking a checked collection removes just that membership + `Removed from {col}` (still saved); a different collection adds it (`Saved to {col}`); `New collection` creates + assigns (`Saved to {name}`).

### QA-FEED-008
**Objective:** Verify `Ask Seller` is sale-only and scoped (replaces Contact Seller).
**Maps to:** AC-FEED-019, AC-CHAT-001, AC-CHAT-002
**Steps:** Look for the pill on: others' sale post (feed card action row + price-footer + post viewer actions), showcase/plain post, own post, blocked-seller post, post detail, public profile.
**Expected result:**
- Pill appears only on others' `sale` posts on those surfaces — **never** on Post Detail, never on profile (`pf-msg` is a dead toast `Open a listing to chat with this seller`), never on non-sale posts.
- Tap opens an item-scoped chat room; own post → `This is your own listing`; blocked seller → `Cannot message a blocked account`; guest → Member Sheet.

### QA-FEED-009
**Objective:** Verify card follow button.
**Maps to:** AC-FEED-020, AC-PROFILE-021, AC-SOCIAL-013
**Steps:** Follow from a card; tap again while following; unfollow from the confirm sheet.
**Expected result:**
- Button shows only when not following; first tap follows instantly (all posts of that seller flip).
- While following it opens `Unfollow @{seller}?` confirm sheet → `Unfollow`/`Cancel`; unfollow clears that seller's `favorite` + `muted` and re-renders following/favorites tabs.

### QA-FEED-010
**Objective:** Verify others-post `...` menu.
**Maps to:** AC-FEED-021, AC-SOCIAL-014
**Steps:** Open `...` on others' posts (not followed; followed; favorite); open `...` on the same post inside the `pfp` viewer.
**Expected result:**
- Menu rows: `Add to favorites`/`Remove from favorites` (only when following or already favorite), `Not interested`, `Report` (danger) — Cancel/backdrop dismisses.
- `pfp` viewer variant is report-only.

### QA-FEED-011
**Objective:** Verify Not interested loop (replaces `Hide this asset`).
**Maps to:** AC-FEED-022, AC-FEED-023, AC-FEED-024, AC-SOCIAL-014
**Steps:**
1. `...` → `Not interested` on a followed seller's post and an unfollowed seller's post.
2. Tap `This post made me uncomfortable`, then `Undo`.
3. Re-render the feed (tab switch); restore via Settings.
**Expected result:**
- Card swaps in place to ni-card: `Thanks for your feedback` + `We'll suggest fewer posts like this.` + `Undo` + (followed: `Mute {seller}` + `Unfollow {seller}`; not followed: `Manage content preferences` → `prefs`).
- Uncomfortable → card with `Thanks for letting us know` + `Report` → report stack + `Undo`; undo restores the card either way.
- After re-render the post is gone from feed permanently until restored at Settings > Content preferences > Not interested (`Restore` per item or `Reset suggested content` for all); NI affects only the viewer's feed — search/WA/public profile/owner state/chat are untouched.

### QA-FEED-012
**Objective:** Verify mute flow.
**Maps to:** AC-FEED-025, AC-SOCIAL-014
**Steps:** `Mute {seller}` from ni-card → confirm; unmute from Settings.
**Expected result:** Dialog `Mute {seller}?` + `You can unmute them anytime from their profile. We won't let them know you muted them.` + `Mute posts`/`Cancel` → all seller posts leave feed + toast `Muted`; unmute via Settings > Muted accounts; unfollow also clears mute.

### QA-FEED-013
**Objective:** Verify own-post `...` menu rows and conditions.
**Maps to:** AC-FEED-026, AC-FEED-029, AC-FEED-030, AC-FEED-031, AC-FEED-032, AC-ASSET-MGMT-025
**Steps:** Open `...` on own posts of each `pfkind` (`post`, `sale`, `show`, `hide`, `sold`) from feed and detail.
**Expected result:**
- Rows: `Archive`/`Unarchive`, `Turn off/on commenting`, `Edit`, `Pin to top of grid`/`Unpin from grid`, `Delete` (danger).
- `Mark as sold` appears only for `sale`/`show`/`hide`; `sold` shows `View sale record` instead of `Edit` and no `Mark as sold`.

### QA-FEED-014
**Objective:** Verify archive/unarchive.
**Maps to:** AC-FEED-027, AC-FEED-033
**Steps:** Archive an own post; check feed + profile grid + pins; unarchive from the Archive page.
**Expected result:** Archived post leaves feed + grid instantly, all pins cleared, toast `Post archived`; Archive page (Settings > Your library > `คลังข้อมูลที่เก็บถาวร`/`Archive`) shows newest-first grid + `Only you can see posts you've archived` + tile → viewer `feed` mode; unarchive returns the post (pins do not) + `Post unarchived`.

### QA-FEED-015
**Objective:** Verify pin-to-grid.
**Maps to:** AC-FEED-031, AC-PROFILE-013
**Steps:** Pin posts on the `all` tab context and a specific tab; pin a 4th post on a tab; unpin.
**Expected result:**
- Pin applies to the profile-grid tab context (pin from feed = `all`); pinned posts sort first per tab, newest pin first.
- `PIN_MAX = 3` per tab → `Pin limit reached` dialog (`…will replace your oldest pinned post` + `Confirm`/`Cancel`) → Confirm replaces the oldest pin.
- Feedback pill `Pinning…`/`Unpinning…` → toast `Your post has been pinned`/`Your post has been unpinned`; unpin returns the post to its natural slot; archiving clears every pin.

### QA-FEED-016
**Objective:** Verify delete post.
**Maps to:** AC-FEED-032, AC-ASSET-MGMT-037
**Steps:** `Delete` → Cancel; then `Delete` → confirm on a post others saved.
**Expected result:** Dialog `Delete post?` / `This post will be permanently deleted.` / `Delete` (danger) / `Cancel`; confirm removes it from every surface (feed, viewer, detail, grids, saved/wishlist tiles) + toast `Post deleted`; no undo.

### QA-FEED-017
**Objective:** Verify `Tap for details` inline expander.
**Maps to:** AC-FEED-014, AC-DETAIL-002
**Steps:** Tap `Tap for details` on a post with specs, then on another card; check a post without price/specs.
**Expected result:**
- `details-body` expands inline (price row + spec groups — `Price & Data Source` group is filtered out here, unlike Post Detail) + `View full detail` → Post Detail; label toggles to `Hide details`; only one card's details open at a time.
- Posts with no price and no specs have no `Tap for details`.

### QA-FEED-018
**Objective:** Verify post composer (post mode).
**Maps to:** AC-FEED-039, AC-FEED-040, AC-FEED-041, AC-FEED-042, AC-FEED-043, AC-FEED-044, AC-FEED-045, AC-FEED-050, AC-FEED-051
**Steps:**
1. `+` on feed header → step 1 Recents grid (single → `Select` multi-pick ≤10, clips show duration); camera tile/expand → dead toast.
2. `Next` (disabled until ≥1 media) → step 2: media strip, caption, hashtag chips, option panes (location, price, watch details, condition, cost details when drawer ON, more options).
3. `Share`; then reopen composer, add a draft, `×` to leave.
**Expected result:**
- Title `สร้างโพสต์ใหม่`/`New post`; media is the only required input.
- Share → `insertNewPost` lands the new post at top of feed + re-render + scroll-to-top + toast; matching an ON Watch Alert also toasts `Watch alert matched`.
- `×` mid-draft → discard dialog (`เริ่มใหม่`/`แก้ไขต่อไป`); empty draft closes silently; back on step 2 returns to step 1 keeping the draft.
- Clip-only post previews playable + `Clip shared to feed ✓`.

### QA-FEED-019
**Objective:** Verify feed refresh model.
**Maps to:** AC-FEED-008, AC-FEED-035, AC-NAV-018
**Steps:** Re-tap the Feed nav icon while already on feed; scroll a long feed.
**Expected result:** Re-tap re-renders the list + smooth scroll to top; no pull-to-refresh gesture, no infinite scroll, no pagination, no end-of-list marker — the list renders once.

### QA-FEED-020
**Objective:** Verify feed failure states.
**Maps to:** AC-GLOBAL-013, AC-GLOBAL-014, AC-FEED-036, AC-FEED-037
**Steps (contract for production):** Kill feed fetch; load feed offline; break one image.
**Expected result:** Feed error → error state + `ลองใหม่`/`Try again`; offline shows cached data; a failed image keeps the card with a placeholder + per-image retry (not a whole-card crash).

---

## 5. Search & Filter

### QA-SEARCH-001
**Objective:** Verify search entry and landing.
**Maps to:** AC-SEARCH-001, AC-SEARCH-002, AC-SEARCH-003
**Steps:** Tap the header search icon (guest + member); inspect landing; tap `For you` and a brand chip.
**Expected result:** Landing shows filter icon + popular chips (`For you` default + brand/tag chips ≤10) + explore grid of every photo of every eligible post; `For you` submits an empty query (all sale listings); other chips submit their keyword + record a recent.

### QA-SEARCH-002
**Objective:** Verify typing mode, recents and suggestions.
**Maps to:** AC-SEARCH-004, AC-SEARCH-005, AC-SEARCH-006, AC-SEARCH-007, AC-SEARCH-008, AC-SEARCH-009
**Steps:** Tap the fake field; with empty query check recents (`See all` page when >4); type `sub`; use `×`, `Clear all`, row `X`; press Enter on empty and non-empty queries.
**Expected result:**
- Typing mode: input focused + `Cancel` (returns to landing keeping q); empty q → `Recent` ≤4 + `See all` page (back + `Clear all` + full list).
- Recents: dedupe case-insensitive by (kind, value), newest on top, cap 8, per-row `X`, `Clear all` — session memory (S-23; prototype seeds 6 mock rows).
- Live suggestions: ≤6 keyword rows (brand/`brand model` + `N listings`, references) then ≤4 seller rows (`N listings`/`Following`), keyword rows first; nothing → `No suggestions`.
- Enter trims + submits (records recent when non-empty) → results `foryou` tab.

### QA-SEARCH-003
**Objective:** Verify query matching semantics.
**Maps to:** AC-SEARCH-010, AC-SEARCH-012
**Steps:** Search `rolex sub` (multi-word), `#speedy` (hashtag), empty query.
**Expected result:** Every whitespace-separated word must appear (case-insensitive) in seller + caption + captionFull + chips + spec labels/values — free-text spec values are always searchable; `#` queries search every `!muted` post (includes non-sale — documented deviation); empty query matches the whole eligible set.

### QA-SEARCH-004
**Objective:** Verify results eligibility (Sale-only pool, S-09/S-10).
**Maps to:** AC-SEARCH-011, AC-GLOBAL-002
**Precondition:** Seed: `sale` post, showcase post (no price), plain `post`, plus priced `show`/`hide`/`sold` posts, `ni`/muted/blocked posts.
**Steps:** Search a keyword matching all of them.
**Expected result:** Canonical: results Posts grid shows `salePosts()` only — priced, not `ni`/`muted`/`blocked`; showcase/plain posts never appear in the results grid (they remain reachable via explore/tags). Priced `show`/`hide`/`sold` leaking in is the documented S-10 defect — log it.

### QA-SEARCH-005
**Objective:** Verify results tabs.
**Maps to:** AC-SEARCH-013, AC-SEARCH-014, AC-SEARCH-015, AC-SEARCH-016, AC-SEARCH-017
**Steps:** On results, switch For you / Profiles / Tags; tap a tag row; tap `sr-wa` and filter icons; go back.
**Expected result:**
- Head: back (→ landing, does not pop the page) + fake field showing q (→ typing keeping q) + `sr-wa` bell + filter icon; default tab `foryou` on every results entry.
- `For you` = `Accounts` (sellers whose *name* matches, not blocked) + `Posts` grid; sellers whose posts match but names don't are excluded.
- `Profiles` = same sellers as full cards + `N listings` + `· Following` + working Follow (guest → Member Sheet).
- `Tags` = hashtag rows + `N posts` (all `!muted` posts + seeds), count desc → alpha; tap → `#tag` results.

### QA-SEARCH-006
**Objective:** Verify absent search features (S-24).
**Maps to:** AC-SEARCH-040
**Steps:** Look for sort controls, a result count, saved-search UI, context-aware popular chips.
**Expected result:** None exist — `S.sort` is fixed `new` (natural order); the `(N)` numbers on filter options are sale-listing counts, `Apply (N)` is the selection count, not a result count; no pull-to-refresh/infinite scroll/result count/sort/saved search.

### QA-SEARCH-007
**Objective:** Verify filter page.
**Maps to:** AC-SEARCH-019, AC-SEARCH-020, AC-SEARCH-021, AC-SEARCH-022, AC-SEARCH-025
**Steps:** Open `sfilter`; pick Brand + dependent Model + other sections; check `(N)` counts; Apply; reopen and back out without applying; use `Clear all`.
**Expected result:**
- 11 sections in fixed order (Brand, Model, Price range, Year, Reference, Condition, Case size, Movement, Dial color, Strap/Bracelet, Delivery contents), all multi-select chips; every option shows `(N)` from `salePosts()` — `(0)` stays selectable (Watch Alert use case).
- Brand → Model dependency: model list filters to selected brands + title `Model · {brands}` + non-matching model picks pruned.
- Edits go to `fDraft`; `Apply (N)` commits and returns to results with active chips; back/discarding drops the draft; `Clear all` resets the draft without committing; multiple filters AND together (also on `#` queries).

### QA-SEARCH-008
**Objective:** Verify price range inputs.
**Maps to:** AC-SEARCH-023, AC-SEARCH-024
**Steps:** Type letters/negatives/decimals into min/max; paste `20,00,000`; Apply min>max; Apply max>2,000,000; use a single bound and min==max; remove the price chip.
**Expected result:** Non-digits strip silently + auto-comma (paste normalizes); Apply blocks with `Minimum price must not exceed maximum price` or `Maximum price must not exceed 2,000,000` without committing; single bound and equal bounds are valid; the `THB {min|0}–{max|Any}` chip clears both values on `×` — chip removal commits instantly (no Apply needed).

### QA-SEARCH-009
**Objective:** Verify Post Viewer entry and modes.
**Maps to:** AC-SEARCH-018, AC-SEARCH-026, AC-SEARCH-030, AC-NAV-026
**Steps:** Tap tiles from explore grid, results grid, profile grid, saved/wishlist/archive grids.
**Expected result:** Tiles open the Post Viewer only — never the feed card; viewer list = the grid's post list and snaps to the tapped post (explore keeps the tapped photo index); modes: `default` (explore/results), `feed` (saved/wishlist/archive), `pfp` (profile — `Posts`/`{user}` head + conditional Follow pill).

### QA-SEARCH-010
**Objective:** Verify Post Viewer anatomy and navigation.
**Maps to:** AC-SEARCH-027, AC-SEARCH-028, AC-SEARCH-029
**Steps:** In default mode inspect head/rail/foot/`pv-add`; open `dt` sheet → `View full detail`; use `pv-back` and `pv-srch` (with and without sub stack).
**Expected result:**
- Head: `pv-back` + `pv-srch` floating; rail: like, `Likes`/`ถูกใจ` → likes sheet, comment + count (hidden when `noComments`), views (hidden when `hideCounts`/empty), share, save (filled when saved), `...` (own vs others menu); foot: avatar + seller + `Follow` pill (not-yet-followed only), caption `…` → `ps` sheet, `Tap for details` → `dt` sheet (only when specGroups exist); `pv-add` → comment sheet `nt` variant.
- `pv-back` closes to the originating surface; `pv-srch` closes back to `mode="typing"` when a sub stack exists (else just closes); `View full detail` opens Post Detail over the viewer (viewer stays mounted); report stack overlays with `rp-over`.

### QA-SEARCH-011
**Objective:** Verify guest scope inside search.
**Maps to:** AC-SEARCH-031
**Steps:** As guest, run the full path: landing → typing → results → filters → viewer → detail; then tap `sr-wa`, Follow, like, save, share, `...`, comment input.
**Expected result:** All browsing works; every gated control opens the Member Sheet.

### QA-SEARCH-012
**Objective:** Verify empty and error states.
**Maps to:** AC-SEARCH-039
**Steps:** Search a nonsense keyword; simulate an error (contract).
**Expected result:** `No data found` + `Try a different keyword or adjust your filters` on For you; error contract = `Something went wrong. Please try again.` + `Try again` (EN-only copies — documented deviation).

### QA-SEARCH-013
**Objective:** Verify lifecycle impact on search.
**Maps to:** AC-SEARCH-036, AC-SEARCH-037
**Steps:** Transition a `sale` post → `show`/`hide`/`sold`; transition back; remove a post's price; delete a post; block/mute/NI a seller.
**Expected result:** `sale`→non-sale drops the post from results grid + filter counts + WA match; reverse returns it; unpriced post leaves the grid but stays on explore/tags surfaces; deleted post leaves everywhere + stale open → toast; blocked drops from all search surfaces; muted drops everywhere; `ni` drops from results + explore.

---

## 6. Profile

### QA-PROFILE-001
**Objective:** Verify profile route and heads.
**Maps to:** AC-PROFILE-001, AC-PROFILE-002, AC-PROFILE-003, AC-PROFILE-007, AC-PROFILE-018
**Steps:** Open own profile (bottom nav) and a viewer profile via any `[data-pf-user]` entry; switch tabs.
**Expected result:**
- `profile:{u}` slides over the stack; tab embeds in `profile:{u}:{tab}`; `[data-pftab]` swaps the grid in place (no re-slide, keeps scroll); back slides out right.
- Own head: `+` (composer asset mode) + username (`Signed in as` toast) + burger → settings; viewer head: `sub-back` + `...`.
- Bottom nav highlights Profile on own page, Feed on viewer page (quirk — documented).

### QA-PROFILE-002
**Objective:** Verify own vs viewer action rows.
**Maps to:** AC-PROFILE-004, AC-PROFILE-005, AC-PROFILE-006, AC-PROFILE-036
**Steps:** Check both profiles' action buttons and the viewer `...` menu.
**Expected result:**
- Own: `+`/empty-state `Add asset` → composer `data-mode="asset"`; `pf-edit` → `pedit`; `pf-share` → QR overlay; `.pf-pfo` wallet → portfolio; `pf-menu` → settings.
- Viewer: `Follow`↔`Following ⌄` + `แชท`/`Chat` (dead toast `Open a listing to chat with this seller`); `...` → `Report` (danger) / `Block`↔`Unblock` / `About this account` / `Copy profile URL` (toast `Profile link copied`) / `Share this profile` (shared share sheet) / `Cancel`.
- Blocked: `Unblock` primary only.

### QA-PROFILE-003
**Objective:** Verify tab model and public visibility (S-14).
**Maps to:** AC-PROFILE-009, AC-PROFILE-010, AC-PROFILE-011, AC-PROFILE-012, AC-PROFILE-017, AC-GLOBAL-003
**Steps:** Compare own tabs vs viewer tabs; populate one post per `pfkind`.
**Expected result:** Owner: 5 tabs `all`/`sale`/`show`/`hide`/`sold`; viewer: 3 tabs `all`/`sale`/`show`; `all` = every unarchived own kind for owner, Sale+Show only for viewer (a viewer `all`-tab leak of `post`/`hide`/`sold` is the S-14 defect — log it); other tabs filter `pfKind === tab` (fallback infers from price).

### QA-PROFILE-004
**Objective:** Verify grid tiles and pinned ordering.
**Maps to:** AC-PROFILE-013, AC-PROFILE-014, AC-PROFILE-015
**Steps:** Inspect tiles for single/multi-photo, clip, pinned posts; open a tile.
**Expected result:** Tile = `photos[0]` + stack badge or clip icon + `pf-pin` marker only — no status badge, no `...`, no quick actions; pinned-first per tab (newest pin first); tile → Post Viewer `pfp` mode at that post with pin context.

### QA-PROFILE-005
**Objective:** Verify hide/sold private reachability.
**Maps to:** AC-PROFILE-016
**Steps:** As owner, open `hide` and `sold` tabs → tile → `pfp` viewer → `View full detail`; try to reach the same detail as a viewer.
**Expected result:** Own `hide`/`sold` tabs are the *only* path to hidden/sold post detail (viewer + detail + `View sale record`); a non-owner has no route at all.

### QA-PROFILE-006
**Objective:** Verify per-surface follow/unfollow behaviors.
**Maps to:** AC-PROFILE-019, AC-PROFILE-020, AC-PROFILE-021, AC-PROFILE-022, AC-PROFILE-023, AC-PROFILE-024, AC-PROFILE-025
**Steps:** Follow/unfollow from: feed card button, profile `pf-foll`/`Following ⌄` (mfSheet), pfp head `pfp-follow`, pfollow `pf-flw` rows, own following `...` popover, report-done step.
**Expected result:**
- Feed button → `Unfollow @{u}?` confirm sheet; profile `pf-foll` → instant follow, `Following ⌄` → mfSheet (`Add to favorites`/`Mute` → `Mute {u}?` dlg / `Unfollow` instant); `pfp-follow` → instant + fade ~1.2s; `pf-flw` → instant flip in place (undo-able); all instant paths are intentionally non-confirm.
- Unfollow clears the seller's `favorite` + `muted`; users without posts are followable via `PF_EXTRA_FOL`; state syncs across feed/profile/viewer/lists.

### QA-PROFILE-007
**Objective:** Verify followers/following pages.
**Maps to:** AC-PROFILE-026, AC-PROFILE-027, AC-PROFILE-028, AC-PROFILE-029, AC-PROFILE-030
**Steps:** Open stats followers/following; filter via `pfl-q`; on own lists use `แชท`, `x` Remove, `...` popover; open rows.
**Expected result:** `pfollow:{u}:{tab}` slides over (back keeps profile scroll); `{n} followers`/`{n} following` tabs + live filter `No results found`; own followers rows = `แชท` (dead toast) + `x` → `Remove follower?` dlg (`We won't let {u} know…`) → row gone; own following `...` → `Unfollow` (instant + `Unfollowed` + row removed) / `Mute`; viewer lists show only the `pf-flw` pill; self never appears; rows open `profile:{user}`.

### QA-PROFILE-008
**Objective:** Verify QR share overlay (own profile only).
**Maps to:** AC-PROFILE-031, AC-PROFILE-032, AC-PROFILE-033, AC-PROFILE-034
**Steps:** `pf-share` → cycle `COLOR` 5 themes; `Share profile`; `Copy link`; `Download`; `Scan QR` (grant/deny camera, unsupported API).
**Expected result:** Full-screen `.pf-qr` with X/`COLOR`/`Scan QR`; QR payload `https://tukdaeng.app/u/{username}`; copy → `Link copied` (real `pfCopyText`); download → PNG 1080px + `QR code saved`; camera → `Profile QR scanned`/`QR code scanned`, unsupported → `Camera isn't available on this device`, denied → `Allow camera access to scan a QR code`; overlay is own-profile only (viewer share goes through `pf-sh-share` generic sheet).

### QA-PROFILE-009
**Objective:** Verify About this account.
**Maps to:** AC-PROFILE-037
**Steps:** `...` → `About this account` on a verified and unverified account.
**Expected result:** `about:{u}` page: hero (avatar + name + verified badge when verified) + community note + `Date joined` (mock month/year, TH +543) + `Account based in Thailand` + `Verified` row (verified only).

### QA-PROFILE-010
**Objective:** Verify report-user flow from profile.
**Maps to:** AC-PROFILE-038, AC-PROFILE-039, AC-PROFILE-044
**Steps:** `...` → `Report` → pick `A specific post` (tile picker → `Next` → `report:post`) and `Something about this account` (`report:user`); complete a reason; land on `report:done`; run each step; `Done`.
**Expected result:** `report:pick` slides up over the sheet; reason pages list `PM_REASONS`; done page = `Thanks for your feedback` + real step rows (Block→blkSheet / Unblock→unblockDlg / Unfollow→instant / Mute→muteDlg) with green-check completion; `Done`/`X` closes the stack + toast `Report submitted · thanks for letting us know`; the reported profile stays fully openable.

### QA-PROFILE-011
**Objective:** Verify block sheet, effects and keep-page (S-13).
**Maps to:** AC-PROFILE-040, AC-PROFILE-041, AC-PROFILE-042, AC-NAV-014
**Steps:** `...` → `Block`; inspect sheet; confirm; open the blocked profile; check feed/chat/posts.
**Expected result:**
- `blkSheet`: avatar + `Block {u}?` + `This will also block any other profiles they may have or create in the future.` + 3 impact rows + `Block` + `Block and report` (dismiss = backdrop; fromChat variant has `Block` only) — **not** a `Block this user?` center dialog.
- Effects: `PF_BLOCKED` + removed-follower + unfollow + `th.blocked` on every thread + `p.blocked` on their posts + feed re-render → transient `Blocking` toast.
- Blocked profile = keep-page: normal head/avatar/bio/link, masked stats `0 posts`/`−`/`−`, pfgo disabled, grid `No posts yet`, single `Unblock` action.

### QA-PROFILE-012
**Objective:** Verify unblock.
**Maps to:** AC-PROFILE-043
**Steps:** Unblock via keep-page button, `...` menu label, Settings blocked list, report-done step.
**Expected result:** Every entry opens `unblockDlgHTML` (`Unblock {u}?` + `…will now be able to request to follow and message you… won't be notified…` + `Unblock`/`Cancel`) → `Unblocked` toast + restrict-hint banner; never re-follows automatically.

### QA-PROFILE-013
**Objective:** Verify Edit Profile.
**Maps to:** AC-PROFILE-046, AC-PROFILE-047, AC-PROFILE-048, AC-PROFILE-049
**Steps:** `pf-edit` → try invalid usernames (uppercase, symbols, <3 chars, taken name), >150 bio, invalid links (`not a link`), `@handle`/domain/URL links; save a rename.
**Expected result:**
- Fields = Username / Bio / Link only — no Phone/LINE/Email rows in V1; `Edit picture` is a dead toast.
- Username `^[a-z0-9_.]{3,20}$` lowercase + unique vs all profiles and post sellers; Bio ≤150; Link accepts `@handle`, bare domain or http(s) URL (empty clears); failures → inline `pe-err` + `is-err` + focus first invalid.
- Save migrates every reference (profile key, post sellers, comments, followedBy, block/removed/extra sets, storage, stack keys) → back + `Profile updated`; `disp` syncs to the new username.

### QA-PROFILE-014
**Objective:** Verify avatar overlay actions.
**Maps to:** AC-PROFILE-035
**Steps:** Tap the avatar on a viewer profile, own profile, and as guest.
**Expected result:** Overlay opens for everyone; viewer acts = `Follow`/`Following` (real toggle) + `Share` (`Profile shared`) + `Copy link` (`Profile link copied`) + `QR code` (dead toast `QR code isn't in this prototype yet`); own acts = Share/Copy/QR only (no Follow); every act is gated for guest → Member Sheet.

### QA-PROFILE-015
**Objective:** Verify guest scope on profile surfaces.
**Maps to:** AC-PROFILE-050, AC-PROFILE-051, AC-PROFILE-052
**Steps:** As guest: open a public profile, switch tabs, open tiles → pfp, open pfollow lists, open the avatar overlay; then tap every gated control (`Follow`, `...`, `pf-flw`, `+`, burger, `pf-edit`, `pf-share`, pf-sh rows, pm rows, unblock).
**Expected result:** All browsing works (including fabricated `profileOf` for any name); every gated control opens the Member Sheet — guest can never reach own profile, Edit, QR, portfolio or settings.

### QA-PROFILE-016
**Objective:** Verify no private data on profile.
**Maps to:** AC-PROFILE-005, AC-PROFILE-053
**Steps:** Inspect own profile and viewer profile for portfolio-like rows.
**Expected result:** No `Total Asset Value`, no `Total invested`, no purchase/sold/portfolio values anywhere on the profile page — the only portfolio touchpoint is the owner wallet icon `.pf-pfo`.

### QA-PROFILE-017
**Objective:** Verify `profileOf` fabrication (prototype) vs not-found contract.
**Maps to:** AC-PROFILE-055
**Steps:** Open a profile for a nonexistent username.
**Expected result:** Prototype fabricates and renders any username (no user-not-found state); production contract retains the unavailable state (§18 contract).

---

## 7. Post Detail

### QA-DETAIL-001
**Objective:** Verify the detail layer model.
**Maps to:** AC-DETAIL-001, AC-DETAIL-005
**Steps:** Open detail from a feed card and from a viewer `dt` sheet; press `detail-back`; reopen the same post; trigger a like/lang switch while open.
**Expected result:** `.page-detail` is an overlay layer above `.page-pv` (viewer stays mounted) — one detail per screen, no route/forward; back removes only the layer; reopening re-renders to top; post mutations/lang switch re-render the open detail preserving scroll.

### QA-DETAIL-002
**Objective:** Verify detail entries and gating.
**Maps to:** AC-DETAIL-002, AC-DETAIL-004
**Steps:** Enter via feed `Tap for details`→`View full detail`, viewer `dt` sheet, viewer feed/pfp cards, chat item card; try a post with no price/specs; try as guest.
**Expected result:** `hasDetails` (`price || specGroups || specs`) gates the visible entries; `pv-dt` shows only when specGroups exist; chat item always opens detail (missing → `Listing detail isn't in this prototype yet` toast); entry never gated for guest.

### QA-DETAIL-003
**Objective:** Verify detail anatomy top to bottom.
**Maps to:** AC-DETAIL-006, AC-DETAIL-007, AC-DETAIL-008, AC-DETAIL-009, AC-DETAIL-010, AC-DETAIL-011, AC-DETAIL-012, AC-DETAIL-013
**Steps:** Inspect a full-spec sale post, a no-spec showcase post, a clip post, a `noComments`/`hideCounts` post.
**Expected result:**
- Sticky head: back `‹` + `รายละเอียด`/`Detail` + `pm-btn`; hero: first photo full-bleed + `1/N` counter + dots + clip badge/progress; action row: like (no number), comment + count (fully hidden when `noComments`), views eye + count, share; `act-right`: `mf-btn` + `wl-btn`.
- `ลงขาย`/`FOR SALE` when priced, `โชว์`/`SHOWCASE` when not; name = Brand + Model from specs (`n/a` dropped; fallback = caption head); `Ref. {value}`/`Ref. -` (absent entirely when no specs); `Descriptions` renders `p.desc` (`-` when empty; `#tag` → search); all `specGroups` render **including `Price & Data Source`** (`Asking Price`/`Estimated Market Price`/`Last Price Update`/`Data Source` — public market data).

### QA-DETAIL-004
**Objective:** Verify absent elements on detail (negative guard).
**Maps to:** AC-DETAIL-008, 05 §9 Deviations
**Steps:** Scan the page for seller block, Follow button, Ask Seller, save/bookmark, liked-by row, caption, inline comments, timestamp, fullscreen viewer trigger.
**Expected result:** None of them exist on dl1 — no owner information block, no chat entry (`chat-fab` is dead code), no save button (Wish List is the detail's save-family), no fullscreen viewer/zoom (hero tap = carousel).

### QA-DETAIL-005
**Objective:** Verify detail social actions.
**Maps to:** AC-DETAIL-014, AC-DETAIL-015, AC-DETAIL-018
**Steps:** Like from detail; open comments; share.
**Expected result:** Like toggles + syncs every `.like-btn` for the post (no count shown on detail); comment opens the regular shared comment sheet (same as feed/viewer); share opens the shared share sheet — guest gated.

### QA-DETAIL-006
**Objective:** Verify `mf-btn` Watch Alert entry.
**Maps to:** AC-DETAIL-019, AC-DETAIL-020, AC-DETAIL-021, AC-DETAIL-022, AC-DETAIL-023
**Steps:** Tap `Follow this model` on a spec'd post (no prior alert, paused alert, matching ON alert); tap it on a spec-less post; save and check the bell.
**Expected result:**
- Sheet opens `source:"detail"` with criteria from mapped specs (Brand/Model/Reference/Year/Condition/Case Diameter/Movement Type/Dial Color/Strap + delivery contents) **plus unmapped spec rows**, excluding `N/A` and `Price & Data Source` keys; spec-less post → toast `No details on this post to watch` (no sheet).
- Existing `modelKey` match (ON or OFF) → edit mode; bell `.on` + `Following this model` only while an ON alert matches; match counts come from `salePosts()` (sold post itself never counted).

### QA-DETAIL-007
**Objective:** Verify `wl-btn` Wish List entry.
**Maps to:** AC-DETAIL-024, AC-DETAIL-025
**Steps:** First tap; pick `Wish List` again; pick/create a collection; try as guest.
**Expected result:** First tap sets `wishlisted` then opens the `wl` sheet (`"Wishlist"` = pseudo-row; `wlCols` = multi-collection array); re-picking `Wish List` un-wishlists (`Removed from your wish list`); re-picking a checked collection removes just that membership (`Removed from {col}`); `New collection` → `nc` sheet → `Added to {name}`; guest → Member Sheet.

### QA-DETAIL-008
**Objective:** Verify `pm-btn` menus from detail.
**Maps to:** AC-DETAIL-029, AC-DETAIL-030, AC-FEED-026, AC-FEED-032
**Steps:** Open `...` on own post (each `pfkind`) and others' post from the detail head; run `Edit` and `Delete` from here.
**Expected result:** Own → `pmOwnMenuHTML` (Archive/commenting/Edit/Mark as sold/Pin/Delete, or `View sale record` on sold); others → favorites/Not interested/Report variant; `Edit` hides the detail behind the composer then restores it; `Delete` → confirm → detail auto-closes; guest → Member Sheet.

### QA-DETAIL-009
**Objective:** Verify owner vs viewer parity.
**Maps to:** AC-DETAIL-028, AC-DETAIL-036
**Steps:** Compare an own post's detail vs a viewer's, including portfolio-adjacent data.
**Expected result:** Identical layout — no private section (purchase cost, sale record, portfolio value live only on `pfasset:`/`sold:`/`portfolio` routes); owner may use `mf-btn`/`wl-btn` on own posts and like own posts (no self-guard — documented).

### QA-DETAIL-010
**Objective:** Verify sold-post detail.
**Maps to:** AC-DETAIL-031, AC-DETAIL-032, AC-DETAIL-033
**Steps:** Open a sold post's detail via own `sold` tab → pfp → `View full detail`; try to reach it as a viewer; check the menu and `mf-btn`.
**Expected result:** Owner path only (viewer has no route); detail renders the leftover data — a marked-sold post keeps `FOR SALE` if price remains (documented deviation: tag is price-driven, not `pfkind`); menu shows `View sale record` → `sold:{id}` (materializes when unlinked); `mf-btn` still works on leftover specs but never counts the sold post.

### QA-DETAIL-011
**Objective:** Verify guest scope on detail.
**Maps to:** AC-DETAIL-026, AC-DETAIL-027
**Steps:** As guest: open a detail, read specs, open the comment sheet and read; tap like/share/`mf`/`wl`/`pm`/comment input.
**Expected result:** Full read access; every gated control → Member Sheet.

### QA-DETAIL-012
**Objective:** Verify unavailable/missing post handling.
**Maps to:** AC-DETAIL-034, AC-NAV-011
**Steps:** Open `view-full` for a deleted post id; open detail via chat item of a deleted post; delete a post while its detail is open.
**Expected result:** Silent return on `view-full` (prototype); chat → `Listing detail isn't in this prototype yet` toast; detail auto-closes on delete; contract = full unavailable page `รายการนี้ไม่พร้อมใช้งานแล้ว` + `Permission Denied`/`Unavailable` for non-owner `hide`/`sold` deep links.

---

## 8. Watch Alert

### QA-WA-001
**Objective:** Verify all three entries.
**Maps to:** AC-WA-001, AC-WA-002, AC-WA-011, AC-WA-015, AC-SEARCH-032
**Steps:** From search results head (`sr-wa`), Post Detail `mf-btn`, and Settings > `การแจ้งเตือนนาฬิกา`/`Watch Alerts` row.
**Expected result:** `sr-wa` always present on results head; `mf-btn` only on detail `act-right`; `walerts` page via settings row with `WATCH_ALERTS.length` count badge; all open the shared `waSheetHTML` — `Create watch alert` vs `Edit watch alert` titles.

### QA-WA-002
**Objective:** Verify criteria snapshots (S-11).
**Maps to:** AC-WA-005, AC-SEARCH-032, AC-DETAIL-020
**Steps:** Create from search with keyword + filters + price range; create from detail; try editing criteria in the sheet.
**Expected result:** Search snapshot = `q` + every selected filter value + `THB {min|0} – {max|Any}`; detail snapshot = mapped + unmapped specs minus `N/A`/price keys; criteria are never editable in the sheet — changing conditions means creating a new alert.

### QA-WA-003
**Objective:** Verify alert naming.
**Maps to:** AC-WA-006, AC-SEARCH-033
**Steps:** Auto-check names for spec-based, keyword-based, criteria-mixed and empty criteria; edit the name; save with an empty name.
**Expected result:** `waName` = `Brand Model · Reference` → `"keyword"` → first 2 criteria joined ` · ` → `Any new listing`; field is prefilled + editable; an empty name on save regenerates the auto-name — no validation block (prototype wins over old spec).

### QA-WA-004
**Objective:** Verify match modes.
**Maps to:** AC-WA-007, AC-WA-016, AC-WA-019, AC-SEARCH-035
**Steps:** Create alerts for `all`, `any`, `model`; try `any`/`model` with empty criteria; check `N now` counts.
**Expected result:** `all` = every criterion; `any` = ≥1; `model` = only brand/model/ref criteria (≥1 required); `any`/`model` disabled on empty criteria (`all` = watch every new listing); mode rows show live `N now` counted from `salePosts()`.

### QA-WA-005
**Objective:** Verify dedupe behavior.
**Maps to:** AC-WA-009, AC-WA-010, AC-SEARCH-034
**Steps:** Save an alert; recreate the same criteria from the same and from a different entry; tap `sr-wa` when a `detail`-sourced alert matches; tap `mf-btn` with a paused match.
**Expected result:** Signature match (any source) opens the sheet in edit mode — never a duplicate; saving identical criteria + mode → `You already saved this alert`; `sr-wa` bell `on` only for `source:"search"` alerts; `mf-btn` matches by `modelKey` including paused alerts.

### QA-WA-006
**Objective:** Verify the shared sheet mechanics.
**Maps to:** AC-WA-004, AC-WA-008
**Steps:** Type a name, pick a different mode, close the sheet without saving, reopen.
**Expected result:** Fields = name input + `Notify me when a post matches` + mode rows + `Create alert`/`Save changes` + `Delete alert` (edit only); mode picks preserve the typed name; closing without saving commits nothing.

### QA-WA-007
**Objective:** Verify save/edit/delete outcomes.
**Maps to:** AC-WA-014, AC-SEARCH-034
**Steps:** Create, edit name/mode, delete from the edit sheet; try deleting from the list row.
**Expected result:** Create → `Watch alert on`; save → `Watch alert updated` (only name + matchMode change); `Delete alert` removes instantly — **no confirmation** — + `Watch alert removed`; list rows have no delete affordance.

### QA-WA-008
**Objective:** Verify the Watch Alerts list.
**Maps to:** AC-WA-011, AC-WA-012, AC-WA-013
**Steps:** Open `walerts` with alerts present and empty; toggle a row.
**Expected result:** Page = back + title + `Get notified when a new listing matches what you're watching.` + rows (bell + name + criteria ` · ` or `Any new listing` + `Edit` badge + mode label + `{n} matches now` + pause toggle); paused rows dim `.wa-off` + toast `Watch alert on`/`Watch alert paused`; empty → `No watch alerts yet — tap the bell on a post or save a search to start one`.

### QA-WA-009
**Objective:** Verify the match pool (S-10 boundary).
**Maps to:** AC-WA-017, AC-WA-018
**Steps:** Compare `N now` against a hand-counted set containing `sale`, priced `show`/`hide`/`sold`, blocked/muted/`ni` posts.
**Expected result:** Canonical contract = `Sale` posts only; blocked/muted/not-interested excluded always; priced non-sale kinds counted by `salePosts()` are the documented S-10 defect.

### QA-WA-010
**Objective:** Verify match feedback and notification destination (S-08, S-11).
**Maps to:** AC-WA-021, AC-WA-022, AC-NOTI-012, AC-NAV-010
**Steps:** Publish a post matching an ON alert (prototype); simulate a real match (contract).
**Expected result:** Prototype = delayed toast `Watch alert matched: {name}` (`+N more`) after the publisher's own post — a self-match simulation, not a feed row; contract = a `watch` row appears in the Alerts feed → tap → **Post Viewer of the matched post directly** — there is no Result List screen in V1.

### QA-WA-011
**Objective:** Verify bell sync (`modelFollowing`).
**Maps to:** AC-WA-020, AC-DETAIL-023
**Steps:** Save a detail-source alert; open details of matching and non-matching posts; pause/delete the alert.
**Expected result:** `mf-btn` shows `.on` + `Following this model` exactly while an ON alert shares the post's `modelKey` (`brand|model|ref`); pause/delete flips it back everywhere.

### QA-WA-012
**Objective:** Verify guest/session scope.
**Maps to:** AC-WA-023, AC-WA-024
**Steps:** As guest tap `sr-wa`/`mf-btn` and try reaching `walerts`; switch sessions and check alert persistence.
**Expected result:** Guest → Member Sheet on both entries; `walerts` unreachable (settings gated); `new`/`guest` sessions have `WATCH_ALERTS = []`; session switches clear alerts and member sign-out/in does not restore them (documented deviation — persistence is contract).

### QA-WA-013
**Objective:** Verify production matching contract (S-29).
**Maps to:** AC-WA-025
**Steps (contract):** Match option criteria against relation ids; free-text spec assets; inactive market data; BO backfill re-match.
**Expected result:** Option criteria match by relation id only (free-text specs don't match option criteria); keyword criteria cover free-text spec values; `is_active=true` with no listings still alerts (N=0 is valid); `is_active=false` stops new triggers + dependency warning; BO promote/alias backfill re-notifies deduped by `(alert_id, asset_id)`.

### QA-WA-014
**Objective:** Verify absent WA features (negative guard).
**Maps to:** AC-WA-026
**Steps:** Look for a Result List, criteria editing, delete confirmation, frequency/digest/quiet-hours, alert-per-alert notification history.
**Expected result:** None exist in V1.

---

## 9. Asset Management & Portfolio

### QA-ASSET-001
**Objective:** Verify asset creation entries.
**Maps to:** AC-ASSET-MGMT-001, AC-ASSET-MGMT-002, AC-ASSET-MGMT-003
**Steps:** Try opening asset creation as guest, as member via own-profile `+`, via `all`-tab empty-state `Add asset` CTA, and via the feed `+`.
**Expected result:** Guest and any non-owner path → Member Sheet/`Permission denied` (contract); own `+` and empty-state CTA open composer `data-mode="asset"`; feed `+` always opens **post** mode — no asset creation there.

### QA-ASSET-002
**Objective:** Verify asset-mode composer.
**Maps to:** AC-ASSET-MGMT-004, AC-ASSET-MGMT-005, AC-ASSET-MGMT-006, AC-ASSET-MGMT-010, AC-ASSET-MGMT-015
**Steps:** Open asset mode; check title/placeholders/primary button, visibility pick, cost pane, required fields.
**Expected result:** Title `เพิ่มสินทรัพย์ใหม่`/`Add Asset`, caption placeholder `เขียนคำอธิบายสินทรัพย์…`/`Describe this asset…`, primary `Add Asset`; Visibility pick `โชว์`/`Show` (default) / `ซ่อน`/`Hide` / `โพสต์ลงฟีด`/`Post to feed` replaces the drawer toggle; `Cost details (private)` pane always present; only media is required (`Add Asset` disabled until ≥1).

### QA-ASSET-003
**Objective:** Verify Add Asset save outcomes per visibility.
**Maps to:** AC-ASSET-MGMT-006, AC-ASSET-MGMT-007, AC-ASSET-MGMT-008, AC-ASSET-MGMT-009
**Steps:** Save one asset per visibility option; check surfaces + toasts.
**Expected result:** Every path creates a `PF_ASSETS` drawer record (`cfToPortfolio` + `assetId` link); `Show` → drawer-only post `pfkind:"show"` (never feed/search/WA); `Hide` → `pfkind:"hide"`; `Post to feed` → `pfkind:"sale"` entering feed + `ขาย` tab + search/WA (+ possible `Watch alert matched` toast); save lands back on the own profile grid (never feed) + visibility-specific toast (`Saved to My Assets · posted to feed ✓` / `· shown on profile ✓` / `· private ✓`) — no confirmation/`Adding...` state.

### QA-ASSET-004
**Objective:** Verify spec fields are free-text.
**Maps to:** AC-ASSET-MGMT-011, AC-ASSET-MGMT-012
**Steps:** Open Watch details; type free values; check Condition and Box & papers.
**Expected result:** 22 `CF_SPECS` fields are free-text + a Description textarea — no option lists/autocomplete/Market Data link/`ระบุเอง`; the only option inputs are `Condition` (5 fixed single-select) and `Box & papers` (4 fixed toggles, re-tap clears), rendering as chips + Item Details.

### QA-ASSET-005
**Objective:** Verify price field (replaces `Price on request`).
**Maps to:** AC-ASSET-MGMT-013
**Steps:** Leave `Add price` empty; enter `1234567`; type letters/commas; check every buyer surface for a `Price on request` label.
**Expected result:** Digits + auto-comma only; empty price = `showcase` — no price tag, and **no `Price on request` label exists anywhere** (feed card, details, Post Detail, search, viewer).

### QA-ASSET-006
**Objective:** Verify media rules.
**Maps to:** AC-ASSET-MGMT-010, AC-ASSET-MGMT-014
**Steps:** Try saving with 0 media; add photos + clips up to 10 combined.
**Expected result:** ≥1 media required; clips accepted in asset mode (≤10 combined with photos).

### QA-ASSET-007
**Objective:** Verify private cost details.
**Maps to:** AC-ASSET-MGMT-015, AC-ASSET-MGMT-016, AC-ASSET-MGMT-017, AC-ASSET-MGMT-018
**Steps:** Open the cost pane; try an invalid date and a future date; leave fields empty; check public surfaces for the values.
**Expected result:** `ราคาซื้อ` (digits+comma) + `วันที่ซื้อ` (min 1900-01-01, max today) + privacy note; invalid → `วันที่ซื้อไม่ถูกต้อง`/`Invalid purchase date`, future → `วันที่ซื้ออยู่ในอนาคตไม่ได้`/`Purchase date can't be in the future`, and `Done` stays blocked until valid; both fields optional — stored only on the drawer record and never shown publicly.

### QA-ASSET-008
**Objective:** Verify status transitions path (replaces Change Status sheet).
**Maps to:** AC-ASSET-MGMT-019, AC-ASSET-MGMT-020, AC-ASSET-MGMT-022, AC-ASSET-MGMT-023
**Steps:** Open a post's Edit info with drawer ON; change `Profile status` through `ขาย`/`โชว์`/`ซ่อน`; toggle the drawer OFF.
**Expected result:**
- Status changes exist **only** inside Edit info `Profile status` pick (`stt-opt`) — no standalone Change Status sheet or Edit Asset form exists; `sold` is never an option.
- `→show`/`hide` pulls the post from feed + search/WA immediately; `→sale` returns it; drawer OFF cuts `assetId` + splices `PF_ASSETS` + `pfkind:"post"` (post stays on feed, leaves status tabs/search/WA; existing sold link survives).

### QA-ASSET-009
**Objective:** Verify sold is terminal.
**Maps to:** AC-ASSET-MGMT-021, AC-PORT-022
**Steps:** On a `sold` post open the own menu and Edit info.
**Expected result:** `View sale record` replaces `Edit` in the menu; drawer toggle locked with `This item lives in your Sold history`; `applyPostEdit` never changes its `pfkind`.

### QA-ASSET-010
**Objective:** Verify Mark as sold entries.
**Maps to:** AC-ASSET-MGMT-025, AC-ASSET-MGMT-026, AC-ASSET-MGMT-032, AC-PORT-013
**Steps:** Check `Mark as sold` on `post`/`sale`/`show`/`hide`/`sold` own posts; use the `pfasset` button; use it on a post with no asset link.
**Expected result:** Menu row only on `sale`/`show`/`hide` (never `post`/`sold`); both entries open `sell:{id}` directly — an unlinked post materializes `assetFromPost` first; the `pfasset` button shows only for `pfoEligible` (own + sale/show/hide).

### QA-ASSET-011
**Objective:** Verify the 2-field Sale Record form.
**Maps to:** AC-ASSET-MGMT-027, AC-PORT-014
**Steps:** Open `sell:{id}` for an asset with purchase cost and one without; type in the price field.
**Expected result:** Fields = `Sale price (THB)` (prefilled asking, required >0) + `Sale date` (default/max today, required) — **no Buyer/Contact/Payment Method/Attachment/Note fields**; `Expected gain` row appears only when `purchase > 0` and live-updates `price − purchase` (`±฿N (±N.N%)`, `—` when ≤0).

### QA-ASSET-012
**Objective:** Verify mark-as-sold transition.
**Maps to:** AC-ASSET-MGMT-028, AC-ASSET-MGMT-029, AC-ASSET-MGMT-030, AC-PORT-016
**Steps:** Submit empty price/date and invalid date; then save correctly.
**Expected result:** Failures show inline `pe-err` (`Sale price required`/`Sale date required`/`Invalid sale date`) + focus first field — no state change; success has no confirmation — `markAssetSold` moves the record `PF_ASSETS`→`PF_SOLD`, flips linked posts to `pfkind:"sold"`, pushes `sold:{id}` (dropping `sell:`/`pfasset:`), toasts `Sale recorded · moved to Sold history ✓`, and the asset leaves feed/search/WA/profile status tabs + `Total invested` immediately.

### QA-ASSET-013
**Objective:** Verify the sold record page.
**Maps to:** AC-ASSET-MGMT-031, AC-PORT-018, AC-PORT-019
**Steps:** Open `sold:{id}` for assets with and without purchase cost; reach it from a sold post's `View sale record`.
**Expected result:** Headline Sale price + `Realized G/L` + Sale record card (price + date) + Return card (`N/A` without cost) + private note; `soldFromPost` materializes for sold posts without a link.

### QA-PORT-001
**Objective:** Verify Portfolio dashboard (replaces `Total Asset Value`).
**Maps to:** AC-ASSET-MGMT-033, AC-PORT-001, AC-PORT-002, AC-PORT-003, AC-PORT-004, AC-PORT-005, AC-PORT-006, AC-PORT-007
**Steps:** Open via the own-profile wallet icon as owner; try as guest/new member and on a viewer profile; read the headline, rows and notes.
**Expected result:**
- `portfolio` is owner-only — the wallet icon exists only on own profile; guests/non-members get `ไม่พบข้อมูล`/gate; new members see an empty portfolio.
- Headline = `Total invested` with a `Private` tag (sum of positive purchase prices of `pfoEligible` assets — `sale`/`show`/`hide` owned, sold/deleted excluded) — **never** `Total Asset Value`; market-value line appears only when ≥1 asset has market data; list shows `pfoEligible` rows with purchase value + `Sold history` link + exclusion note.

### QA-PORT-002
**Objective:** Verify `pfasset` value cards.
**Maps to:** AC-ASSET-MGMT-034, AC-PORT-008, AC-PORT-009, AC-PORT-010, AC-PORT-011, AC-PORT-012
**Steps:** Open `pfasset:{id}` for a `sale` asset (with market data, without), a `show`/`hide` asset.
**Expected result:**
- Hero + status chip + Value card (private tag) + `Mark as sold` — no Edit/Delete actions on this page.
- Current value priority = market → purchase fallback → `N/A` (no valuation); unrealized G/L = market − purchase only when both exist; market-dependent rows hidden without market data.
- Listing card on `sale` only: `Asking price` + `Expected profit` (`asking − purchase`, `±฿N (±N.N%)`, `—` when n/a) + `Market comparison` chip (asking vs market, ±1% dead band → `At market`; purchase fallback never feeds comparison).

### QA-PORT-003
**Objective:** Verify sold history list.
**Maps to:** AC-ASSET-MGMT-035, AC-PORT-017
**Steps:** Open `soldhist` with records and empty.
**Expected result:** Description + exclusion note + rows `Sold {date}` + price/`N/A` → `sold:{id}`; empty → `No data found`.

### QA-ASSET-014
**Objective:** Verify delete boundaries.
**Maps to:** AC-ASSET-MGMT-037, AC-ASSET-MGMT-038
**Steps:** Look for delete actions on drawer surfaces (`portfolio`, `pfasset`, `soldhist`, `sold`); delete a linked post.
**Expected result:** Delete exists only at post level (`Delete post?` → permanent); drawer surfaces have no delete; a deleted post leaves every surface (stale link → `This post is no longer available` / contract unavailable page) — drawer-record behavior after post delete follows the Delete Rule contract.

### QA-ASSET-015
**Objective:** Verify missing-id handling on owner routes.
**Maps to:** AC-ASSET-MGMT-036
**Steps:** Open `pfasset:`/`sell:`/`sold:` with unknown ids.
**Expected result:** `No data found` empty state with the head intact.

### QA-PORT-004
**Objective:** Verify portfolio privacy boundary.
**Maps to:** AC-PORT-020, AC-ASSET-MGMT-039
**Steps:** Search every public/viewer surface for purchase cost, sold history, portfolio values, `Total invested`, expected profit, holding period.
**Expected result:** None of them render anywhere outside owner routes — including Post Detail (no owner block at all) and Public Profile.

### QA-PORT-005
**Objective:** Verify removed portfolio features are absent (negative guard).
**Maps to:** AC-PORT-005, AC-ASSET-MGMT-033, 14_PORTFOLIO §4
**Steps:** Scan portfolio surfaces for `Total Asset Value`, `Top Brand Holdings`, `YTD Performance`, offer history, 6-field sale records.
**Expected result:** None exist — headline is `Total invested`; sold record = price + date (+ realized G/L + return); no offer-era sections anywhere.

### QA-ASSET-016
**Objective:** Verify BO-hidden asset contract.
**Maps to:** AC-ASSET-MGMT-040
**Steps (contract):** Have BO permanently hide an asset; open the owner's view.
**Expected result:** Owner sees it read-only, excluded from public surfaces and portfolio math, with no delete/edit/sell rights.

---

## 10. Chat

### QA-CHAT-001
**Objective:** Verify chat is listing-scoped (S-07).
**Maps to:** AC-CHAT-001, AC-CHAT-003, AC-FEED-019
**Steps:** Ask Seller on the same post twice; Ask on two different listings of the same seller; check profile `pf-msg`, follower-row `แชท`, Post Detail for chat entries.
**Expected result:**
- Thread key = `{user, item.id}`: same post re-opens the existing room (+ un-hides it); a different listing from the same seller always opens a **new** room — no same-user merge.
- `.ask-pill` exists only on sale-post surfaces (feed card action row, price-footer variant, post viewer actions); Post Detail has no chat entry (`chat-fab`/`chatPop` dead); `pf-msg` + follower-row `แชท` → dead toast `Open a listing to chat with this seller`.

### QA-CHAT-002
**Objective:** Verify Ask guards order.
**Maps to:** AC-CHAT-002
**Steps:** Ask as guest; on own post; on a blocked seller's post; with a missing post lookup.
**Expected result:** Guest → Member Sheet → own post `This is your own listing` → blocked `Cannot message a blocked account` → findPost fail `Not in this prototype yet`; Ask closes open overlays before pushing `chatroom:{id}` (back closes the room layer to the surface beneath).

### QA-CHAT-003
**Objective:** Verify draft-room lifecycle.
**Maps to:** AC-CHAT-004
**Steps:** Open a room via Ask without sending; check the chat list; send the first message; open Ask for a different item meanwhile.
**Expected result:** A fresh room lives in `C.draft` — invisible in the list until the first `chSend` (then it `unshift`s to top); only one draft exists at a time (asking elsewhere replaces it); per-room `t.draft` text persists while navigating.

### QA-CHAT-004
**Objective:** Verify the post reference card snapshot.
**Maps to:** AC-CHAT-005, AC-CHAT-021
**Steps:** Open a room (empty vs with messages); edit/mark-sold/delete the linked post; tap the card.
**Expected result:** `ch-post-card` snapshot (`cap`/`price`/`photo`/`owner`/`pid`) never mutates — edits, sold, deleted leave the card unchanged and show no status chips; placement = standalone `me` column when the room is empty, attached to the first bubble otherwise; tap → Post Detail (or `Listing detail isn't in this prototype yet` when unresolvable).

### QA-CHAT-005
**Objective:** Verify the Chats list.
**Maps to:** AC-CHAT-006, AC-CHAT-007, AC-CHAT-008, AC-CHAT-009, AC-CHAT-010
**Steps:** Inspect rows (pinned, muted, blocked, unread, own-last-message); search `ch-q`; open rooms to clear unread; check the nav badge; empty the list.
**Expected result:** Row = avatar (+ pin badge) + username + `Blocked` chip or mute icon + preview (`You: ` prefix) + time + unread pill; ordering = pinned-first then insertion order — send moves a room to top; `ch-q` matches user + item caption + message texts → `No chats found`/`Try another name, item or message.`; opening a room clears its unread and the nav badge = Σunread capped `99+`; hidden threads excluded; empty → `No chats yet` + `Tap Ask on a post to start chatting with the seller.`

### QA-CHAT-006
**Objective:** Verify the Items view and filter.
**Maps to:** AC-CHAT-011, AC-CHAT-012, AC-CHAT-013, AC-CHAT-014
**Steps:** Tap the Items pill (first and second time); use `Filter items by` options; open a single-thread asked item and a multi-thread own listing; inspect `chatitem:`.
**Expected result:**
- First tap switches view + clears search; second tap toggles the `Filter items by` popover (`All items`/`Your listings`/`Items you asked about` + checkmark).
- Groups by `item.id`: own → `Your listings` (`{price} · N chats`), others → `Items you asked about` (`{price} · last msg`); direct single-thread asked items open the room, others open `chatitem:{id}` (head `Item chats` + floating pill card `Your listing`/`@{owner} · N chats` + `ch-iq` search + same swipe actions).
- Empties per state (`No item chats yet`/`No items found`/`No listings found`/`No asked items found`); hidden threads still count in Items groups (documented leak quirk).

### QA-CHAT-007
**Objective:** Verify LINE-style swipe actions.
**Maps to:** AC-CHAT-015, AC-CHAT-016, AC-CHAT-017, AC-CHAT-018
**Steps:** Swipe right >40px (Pin/Mute), swipe left >40px (Hide/Delete) on list and `chatitem:` rows; abort a short swipe; suppress the tap after a swipe.
**Expected result:**
- Right → green circles `Pin`↔`Unpin` (`pinnedAt` + `ปักหมุดแชทแล้ว`/`ยกเลิกการปักหมุดแล้ว` + pin badge + re-sort) and `Mute`↔`Unmute` (`ปิดการแจ้งเตือนแล้ว`/`เปิดการแจ้งเตือนแล้ว` + mute icon).
- Left → gray `Hide` → iOS modal `Hiding chats doesn't delete their messages.` → `t.hidden` + `ซ่อนแชทแล้ว`; `Delete` → iOS modal `Are you sure you want to delete this chat?` → removed + `ลบแชทเรียบร้อยแล้ว` + open `chatroom:`/`chmenu:`/`chsettings:` tops unwound; gestures follow the lock/rubber-band/suppress-click thresholds; identical on both pages.

### QA-CHAT-008
**Objective:** Verify room anatomy and composer.
**Maps to:** AC-CHAT-019, AC-CHAT-020, AC-CHAT-022, AC-CHAT-025
**Steps:** Open a room; send a message; inspect bubble grouping/day dividers/`Read`/`Sent`; use room search; open a missing thread.
**Expected result:**
- Header: `<` + username → `profile:{u}` push + 🔍 + `≡` → `chmenu:{tid}` (missing → `Chat options aren't in this prototype yet`); bubbles: `ch-day` dividers, `them` avatar only on the first of a run, time per bubble, `Read`/`Sent` only on the latest own message (new sends always `Sent`).
- Composer: `+` attach, `ch-input` → `t.draft` + send enable; Enter/send → `chSend` (+ un-hide + draft→threads + move-to-top + `read:false` + refocus).
- 🔍 replaces the whole header (`Messages` placeholder + clear/close); live query highlights `<mark>` and dims non-matches (media always dim); close restores the header.
- Missing thread → `Chat not found`/`This conversation is no longer available.`

### QA-CHAT-009
**Objective:** Verify attach and media bubbles.
**Maps to:** AC-CHAT-023
**Steps:** `+` → pick a photo; tap a media bubble; send media in a hidden room.
**Expected result:** `Photos & videos` sheet ≤8 unique POSTS photos (mock picker); selection pushes a media bubble (+ `t.media`) — tap opens the in-frame viewer; media send does **not** un-hide or move-to-top (documented quirk vs `chSend`).

### QA-CHAT-010
**Objective:** Verify blocked-room behavior.
**Maps to:** AC-CHAT-024, AC-CHAT-034
**Steps:** Block a chat partner; open the thread; try sending; check the row.
**Expected result:** Composer replaced by `ch-blocked-bar` (`You blocked this account` + `You can't message or call them unless you unblock them.` — "call" is a leftover deviation) + `Unblock` → `unblockDlg`; `Blocked` chip on the row; history stays read-only — blocking never deletes the thread; `chSend` guard shows `Cannot message a blocked account`.

### QA-CHAT-011
**Objective:** Verify the chat menu page (S-18 guard included).
**Maps to:** AC-CHAT-026, AC-CHAT-027, AC-CHAT-042
**Steps:** `≡` → press each circle button and each row; check the footer copy.
**Expected result:**
- Head `<` + username; 4 circles: `Mute`↔`Unmute`, `Profile` → `profile:{u}`, `Block`↔`Unblock`, `Report` → `chatReportSheet`; rows: `Photos & videos` → `chmedia:` (+ thumb strip or `No photos or videos found.`) and `Listings & Items` → post detail.
- Footer `This chat is protected with End-to-End Encryption` is a **copy claim only** — there is no E2E/Letter Sealing feature and none may be spec'd (S-18); **no Delete chat entry** on this page (swipe only); `chsettings:` is a dead route.

### QA-CHAT-012
**Objective:** Verify the media gallery.
**Maps to:** AC-CHAT-028
**Steps:** `Photos & videos` → `Select`; select items; Trash and Download; empty room; `✕`.
**Expected result:** Grid + `Select` mode (`{n} selected`/`Cancel`/`Deselect` + numbered badges); Trash → `ลบรูปภาพที่เลือกแล้ว`, Download → `บันทึกลงในรูปภาพแล้ว` — no Share; empty → `No photos or videos found.`; `✕` pops + resets select state (no slide).

### QA-CHAT-013
**Objective:** Verify chat config.
**Maps to:** AC-CHAT-029, AC-CHAT-030
**Steps:** Open `chatcfg`; flip toggles; change Default chat view; edit Quick Ask.
**Expected result:** Toggles `notif`/`preview`/`followOnly` flip instantly (no enforcement surface for `followOnly` — documented); `Default chat view` Chats/Items applies + switches immediately; Quick Ask ≤80 chars prefills the draft-room composer.

### QA-CHAT-014
**Objective:** Verify block/unblock from chat.
**Maps to:** AC-CHAT-031, AC-CHAT-032, AC-CHAT-033
**Steps:** `chmenu` → `Block`; then `Unblock` via blocked bar/menu/report step.
**Expected result:** `Block` opens `blkSheetHTML(u, fromChat=true)` — same sheet as profile but `Block` only (no `Block and report`, backdrop dismiss); effects = `PF_BLOCKED` + removed-follower + unfollow + `th.blocked` all threads + `p.blocked` all posts + feed re-render + transient `Blocking`; every unblock entry → `unblockDlg` → `Unblocked` + re-render; never re-follows.

### QA-CHAT-015
**Objective:** Verify report-from-chat flow.
**Maps to:** AC-CHAT-035, AC-CHAT-036, AC-CHAT-037, AC-CHAT-038
**Steps:** `chmenu` → `Report` → choose `Report` and separately `Report and delete`; complete the reason; `Done`/`✕`.
**Expected result:** Sheet = avatar + `Are you sure you want to report {u}?` + `Report and delete` (danger) + `Report` + `Cancel`; both jump straight to `report:user` (skips `report:pick`; no `<` when `rpFromChat`) → `PM_REASONS` → `report:done` real step rows → `Done` closes the whole stack + `Report submitted · thanks for letting us know`; `Report and delete` additionally hides + removes the thread and returns to the Chat List (contract: remove-from-actor-list + retention).

### QA-CHAT-016
**Objective:** Verify session and navigation rules.
**Maps to:** AC-CHAT-039, AC-CHAT-040, AC-CHAT-041
**Steps:** Open the Chat tab as `new`/`guest`; switch sessions; re-tap the Chat nav icon repeatedly; back out of stack pages and the Quick-Ask room.
**Expected result:** `new`/`guest` → `threads = []`; session switch resets threads/draft (cfg flags persist — quirk); every `data-navgo` resets to `cfg.defView` + `all` filter + cleared searches; `chat*`/`chmenu:` back = slide-out-right; `chmedia:` `✕` = pop + swap; the Quick-Ask room back closes the overlay layer.

### QA-CHAT-017
**Objective:** Verify chat vs asset lifecycle.
**Maps to:** AC-NAV-012, AC-GLOBAL-009, AC-CHAT-005
**Steps:** Chat about a post, then mark it sold, then delete it; check the room each time.
**Expected result:** The room stays fully usable in both cases — history, item card (frozen snapshot) and composer unaffected by sold/deleted post states.

### QA-CHAT-018
**Objective:** Verify absent chat features (negative guard).
**Maps to:** AC-CHAT-042, 07 §9 Deviations
**Steps:** Look for: file messages, Asset Cards, Offer Cards, `chsettings` entries (note/wallpaper/export/encryption/delete-data), call actions, incoming-message simulation, timestamp sorting.
**Expected result:** None exist — message types = text + image/video + post ref card only; send timestamps are mock `09:41`; ordering = insertion + pin-first (no timestamp sort); no `Send offer` / offer flow anywhere.

---

## 11. Alerts Feed

### QA-NOTI-001
**Objective:** Verify the feed surface (replaces `Notification Center`).
**Maps to:** AC-NOTI-001, AC-NOTI-018, AC-NAV-024
**Steps:** Open the `แจ้งเตือน`/`Alerts` tab; inspect the head; press back.
**Expected result:** Head = back + `แจ้งเตือน`/`Alerts` + grouped sections; back always returns to Feed (`data-navgo="feed"` — not a generic pop); the surface is named Alerts feed — there is no `Notification Center` anywhere.

### QA-NOTI-002
**Objective:** Verify exactly 5 alert types (S-17).
**Maps to:** AC-NOTI-002, AC-NOTI-014, AC-NOTI-021, AC-NOTI-022
**Steps:** Inspect seed rows and try to find any other type.
**Expected result:**
- Types = `like`, `comment`, `follow`, `watch`, `system` — nothing else: no chat row, no offer row, no Market Update / Price Valuation / Sale Success / Moderation / Account Action types.
- Anatomy per type: like = avatar stack + heart badge + thumb; comment = avatar + text + thumb; follow = avatar + `Follow back`/`กำลังติดตาม` pill + `x`; watch = post thumb + alert name; system = icon + text (placeholder).

### QA-NOTI-003
**Objective:** Verify tap destinations.
**Maps to:** AC-NOTI-010, AC-NOTI-011, AC-NOTI-012, AC-NOTI-013, AC-NAV-006, AC-NAV-007, AC-NAV-008, AC-NAV-010
**Steps:** Tap one row of each type.
**Expected result:** `like`/`comment` → Post Viewer of the own post (solo `Post` head); `follow` → `profile:{u}` pushed over the feed; `watch` → Post Viewer of the matched post **directly** (no Result List); `system` → no navigation (placeholder toast `Security details aren't in this prototype yet`); every tap marks the row read + syncs the badge before navigating.

### QA-NOTI-004
**Objective:** Verify unread/badge mechanics.
**Maps to:** AC-NOTI-005, AC-NOTI-006, AC-NOTI-007, AC-NOTI-008
**Steps:** Tap unread rows; use `Mark all as read`; use `x` on a follow row; count the badge.
**Expected result:** Tap → `unread=false` + `.unread` cleared + badge sync; `Mark all as read`/`อ่านทั้งหมดแล้ว` sits on the first section only; `x` exists only on follow rows and removes them instantly; nav badge = Σunread capped `99+` on every nav instance, gone at 0.

### QA-NOTI-005
**Objective:** Verify aggregation and time labels.
**Maps to:** AC-NOTI-003, AC-NOTI-004
**Steps:** Inspect a multi-user like row and time labels in both languages.
**Expected result:** Likes aggregate `{u1}, {u2} และคนอื่น ๆ อีก {n} คน`/`{u1}, {u2} and N others`; times use `ago`/`formatAlertTime` (TH `นาที`/`ชม.`/`วัน`/`สัปดาห์`).

### QA-NOTI-006
**Objective:** Verify Follow back.
**Maps to:** AC-NOTI-009
**Steps:** `Follow back` on a follow row; tap again.
**Expected result:** Real `pfSetFollow` toggle — pill flips `Follow back`↔`กำลังติดตาม` and the follow state syncs everywhere.

### QA-NOTI-007
**Objective:** Verify guest and session behavior.
**Maps to:** AC-NOTI-015, AC-NOTI-016, AC-NOTI-017
**Steps:** As guest tap the Alerts tab; as `new` open the feed; switch sessions.
**Expected result:** Guest → Member Sheet before the feed ever opens; `new` sees `No alerts yet` + desc (alert lists start empty); `applySessionData` sets `ALERTS = null` — returning members get fresh seed rows (read state doesn't restore).

### QA-NOTI-008
**Objective:** Verify notification settings mapping.
**Maps to:** AC-NOTI-019, AC-NOTI-020, AC-SETTING-012
**Steps:** Open Settings > Notification settings; flip each toggle; check for extra toggles.
**Expected result:** Exactly 4 toggles — `Likes`, `Comments`, `New followers`, `Watch Alerts`; `system` has no toggle; OFF (contract) stops generating rows of that type (prototype keeps a memory flag only); no Chat/Offer/Moderation/Market/Price/Sale/Account toggles exist.

### QA-NOTI-009
**Objective:** Verify share/board actions create no alerts.
**Maps to:** AC-NOTI-014, 12 §17
**Steps:** Share posts, like articles, report content; check the feed for new rows.
**Expected result:** No new rows — alerts are seed/contract-driven in V1; board actions never create alert rows.

---

## 12. Social (Comments / Like / Save / Share / Wish List)

### QA-SOCIAL-001
**Objective:** Verify the shared comment sheet.
**Maps to:** AC-SOCIAL-003, AC-DETAIL-015, AC-DETAIL-016
**Steps:** Open comments from a feed card, viewer rail/`pv-add`, detail and pfp card; inspect rows, replies, empty state.
**Expected result:** Same sheet everywhere — title `ความคิดเห็น`/`Comments` + rows (avatar/name → `profile:{u}`, time, text, `Reply` meta, heart + count) + 1-level replies + emoji row (8 emoji) + `Add a comment...` input (dead) + img/gif icons (dead); `nt` variant only on the post viewer; empty → single line `No comments yet`/`ยังไม่มีความคิดเห็น`; `noComments` posts still let `pv-add` open the sheet (quirk).

### QA-SOCIAL-002
**Objective:** Verify emoji quick-react is the only write path (S-12).
**Maps to:** AC-SOCIAL-004, AC-SOCIAL-007, AC-DETAIL-017
**Steps:** Pick an emoji; try typing in the input/`Reply`/img/gif; as guest tap input.
**Expected result:** Emoji appends an own comment (`Just now`/`เมื่อสักครู่`, `likes:0`) + `comments++` + list scrolls; input/`Reply`/img/gif → `Not in this prototype yet` for members (dead affordances); every comment action is gated for guest → Member Sheet — no free-text comments in V1.

### QA-SOCIAL-003
**Objective:** Verify long-press comment moderation.
**Maps to:** AC-SOCIAL-005, AC-SOCIAL-006
**Steps:** Long-press (~450ms / contextmenu) an own comment, an own comment with replies, and someone else's comment; run each menu option.
**Expected result:**
- Own → `Delete` only → `Delete this comment?` dialog (with replies: `…comment and its replies will be removed.`; without: `…comment will be removed.`) → `This comment was removed.` + count sync (no undo).
- Others → `Block` + `Report`: `Block` → `blkSheet` (already-blocked → `unblockDlg`) + `Blocked and hidden comments` — their comments hide (not deleted; unblocking restores); `Report` → `report:comment` page (X only, no back).

### QA-SOCIAL-004
**Objective:** Verify comment like.
**Maps to:** 11 §10 Row actions (quirk)
**Steps:** Heart a comment, close and reopen the sheet.
**Expected result:** `c-like` toggles cosmetically (label ±1, `0`→`1` when first liked) — **not persisted**: a re-render resets it.

### QA-SOCIAL-005
**Objective:** Verify the likes sheet and count privacy (S-26).
**Maps to:** AC-SOCIAL-002
**Steps:** Open `Liked by`/`Likes` on own and others' posts; use `lk-follow`.
**Expected result:** Sheet `ยอดถูกใจ`/`Likes` + liker rows (→ profile) + `lk-follow` cosmetic toggle; note `Only {seller} can see the total number of likes on this post.` shows only on others' posts; numeric count exists only on own posts.

### QA-SOCIAL-006
**Objective:** Verify the shared share sheet.
**Maps to:** AC-SOCIAL-008
**Steps:** Open share from feed card, viewer, detail, profile, article; filter friends; send to friend/app/copy.
**Expected result:** One sheet everywhere — `.sh-q` live filter + 12-friend grid + app row (Messenger, Direct, LINE, Facebook, `Copy link`); friend → `Sent to {name}`; app → `Shared to {app}`; copy → `Link copied`; no native share/count/tracking; creates no alert row.

### QA-SOCIAL-007
**Objective:** Verify Save + collections semantics.
**Maps to:** AC-SOCIAL-009
**Steps:** First save; re-pick `Saved`; re-pick same collection; pick a different collection; create a collection from the sheet.
**Expected result:** First tap sets `saved` + `Saved` + filled bookmark, sheet always opens; `Saved` re-pick → unsave `Removed from your saved`; same-col re-pick → back to `Saved` `Removed from {col}` (still saved); other col → `Saved to {col}`; `New collection` → `nc` → `Saved to {name}`.

### QA-SOCIAL-008
**Objective:** Verify the Saved hub.
**Maps to:** AC-SOCIAL-010
**Steps:** Enter via Settings > Your library `Saved` (count badge) and search landing `.sr-saved`; check tabs, search mode, tiles, empties.
**Expected result:** Head `บันทึกแล้ว`/`Saved` + search + plus; tabs `All` (collections cards + `See all` + `All posts` + `Manage`) / `Collections` / `Posts`; tile → Post Viewer `feed` mode; search `Search your saved` live filters → `No results found`; empties `Nothing saved yet`/`No collections yet` per spec.

### QA-SOCIAL-009
**Objective:** Verify collection page + manage bar.
**Maps to:** AC-SOCIAL-011
**Steps:** Open a collection; use `svd-more` (Add / Edit / Select / Delete); long-press a tile; manage-select posts → `Unsave`, `Remove`, `Move to collection`; delete the collection.
**Expected result:** `savedcol` = name + `{n} items` + grid (`colAt` desc); menu rows work per spec (edit rename + cover + `Collection updated`; add mode; select mode); bar in `All posts` = `Unsave`/`Add to collection`, inside a collection = `Remove`/`Move to collection`; dialogs `Unsave post?` (`…also remove it from any collections.`) and `Remove from this collection?` (`Post will still be saved in all posts.`); deleting a collection returns posts to `Saved` + `Collection deleted`.

### QA-SOCIAL-010
**Objective:** Verify Wish List is a separate system.
**Maps to:** AC-SOCIAL-012, AC-DETAIL-024, AC-DETAIL-025
**Steps:** Wishlist from detail `wl-btn`; open the `wishlist` hub and a `wishcol`; compare with Saved.
**Expected result:** `wl-btn` exists only on Post Detail (gift icon); parallel semantics to Save (pick/unpick/collections/`New collection` → `Added to {name}`); hub `สิ่งที่อยากได้`/`Wish List` with the same tabs/manage/search; completely separate arrays/fields/icons from Saved — the `Wishlist` collection inside Saved is unrelated (quirk).

### QA-SOCIAL-011
**Objective:** Verify follow is account-level.
**Maps to:** AC-SOCIAL-013
**Steps:** Follow a seller; check their other posts/surfaces; unfollow; check favorites/mute lists.
**Expected result:** `setFollowing` flips every post of the seller across feed/profile/viewer/lists; users without posts covered by `PF_EXTRA_FOL`; unfollow clears `favorite` + `muted`; no follow button on own posts.

### QA-SOCIAL-012
**Objective:** Verify Favorites semantics (not post likes).
**Maps to:** AC-SOCIAL-014, AC-SETTING-019
**Steps:** Favorite a followed seller via `...`/mfSheet; check the `favorites` feed tab and Settings > Favorites (`Suggested`/`Remove all`); unfollow.
**Expected result:** `favorite` is a seller-level flag across all their posts; menu row exists only when following/favorited; toasts `Added to favorites`/`Removed from favorites`/`Removed all favorites`; the favorites tab shows their eligible posts; Settings page = search + list + `Remove all` + `Suggested` (followed non-favorites → `Add account`); unfollow removes them from the list.

### QA-SOCIAL-013
**Objective:** Verify Interested list (liked posts home).
**Maps to:** 11 §9 Like Rules, AC-SETTING-018
**Steps:** Like posts; open Settings > Content preferences > `รายการที่สนใจ`/`Interested`; `Remove` a row.
**Expected result:** Liked posts (not Favorites) land in Interested = `POSTS.filter(p.liked)`; `Remove` unlikes (`liked=false`, `likes--`) + re-renders; like state never enters Favorites.

### QA-SOCIAL-014
**Objective:** Verify report/block entries from social surfaces.
**Maps to:** AC-SOCIAL-015, AC-SOCIAL-016
**Steps:** From post `...` → `Report`; from comment long-press → `Report`/`Block`; check effects.
**Expected result:** `Report` opens the report stack (`report:pick`/`report:post`/`report:comment` variants by entry) → `report:done` with real follow-up actions; `Block` → `blkSheet` → `PF_BLOCKED` effects everywhere (posts filtered, comments hidden, threads flagged).

### QA-SOCIAL-015
**Objective:** Verify guest gate on social actions.
**Maps to:** AC-SOCIAL-017, AC-SOCIAL-007
**Steps:** As guest tap like, comment actions, share, save, follow, `...` on posts and comments.
**Expected result:** Every action → Member Sheet; reading likes/comments/share-sheet previews is free where the spec allows the sheet itself to open.

### QA-SOCIAL-016
**Objective:** Verify session-only state contract.
**Maps to:** AC-SOCIAL-018
**Steps:** Like/save/NI/follow/block, then switch session and return (contract check for persistence).
**Expected result:** Prototype state is session-memory (`liked`, `saved`/`savedCols`, `wishlisted`/`wlCols`, `ni`, `muted`, `favorite`, `PF_*` sets); persistence across sessions is a production contract (§18).

---

## 13. Settings

### QA-SETTING-001
**Objective:** Verify settings entry.
**Maps to:** AC-SETTING-014, AC-SETTING-011
**Steps:** Find the settings entry on own profile, viewer profile, guest.
**Expected result:** Only own-profile burger `pf-menu` opens `settings` — no other entry (no drawer row, no viewer menu); guest → Member Sheet.

### QA-SETTING-002
**Objective:** Verify Settings Home structure (S-05).
**Maps to:** AC-SETTING-001, AC-SETTING-002, AC-SETTING-015
**Steps:** Read the page top to bottom.
**Expected result:** Title `การตั้งค่าและกินกรรม`/`Settings and activity` + sections in order: `Account` (About your account) → `Your library` (Saved / Wish List / Archive / Watch Alerts with count badges) → `What you see` (Favorites / Muted accounts / Blocked with counts + Content preferences) → `Your app and media` (Language + Theme mode with value pills) → `Notifications` (Notification settings) → `More info and support` (Help / Privacy & cookies / Privacy Policy / Terms of Use / About) → `Login` (Log out) — **no Edit profile row** (entry = own profile only) and no direct Change Password / Delete Account rows.

### QA-SETTING-003
**Objective:** Verify About your account.
**Maps to:** AC-SETTING-003, AC-SETTING-016
**Steps:** Open Account → About your account.
**Expected result:** Hero + account information + `Security` (Change password) + `Account management` (Delete account); email displays read-only — no inline edit surfaces.

### QA-SETTING-004
**Objective:** Verify language.
**Maps to:** AC-SETTING-004
**Steps:** Switch English ↔ ภาษาไทย; restart.
**Expected result:** Selection shows a check + toast; persists per device (default `en`); re-renders open surfaces (feed/viewer keep scroll).

### QA-SETTING-005
**Objective:** Verify theme mode.
**Maps to:** AC-SETTING-005
**Steps:** Switch Dark ↔ Light; restart.
**Expected result:** Immediate theme swap + value pill; persists per device (default `dark`).

### QA-SETTING-006
**Objective:** Verify notification settings (S-06).
**Maps to:** AC-SETTING-012, AC-NOTI-019
**Steps:** Open Notification settings; count toggles; flip them.
**Expected result:** `การตั้งค่าการแจ้งเตือน` + `Choose what notifications you receive on this device.` + groups `Activity` (Likes / Comments / New followers) + `Trading & Alerts` (Watch Alerts) — exactly 4 toggles, auto-save (no Save button), default ON for new members; no Chat, Offer, Moderation, Market Update, Price/Valuation, Sale Success or Account Action toggles.

### QA-SETTING-007
**Objective:** Verify What-you-see pages.
**Maps to:** AC-SETTING-019
**Steps:** Open Favorites / Muted accounts / Blocked; use search, Remove all, Suggested, Unmute, Unblock, row taps.
**Expected result:**
- Favorites: search field + `Remove all` + `Suggested` (followed non-favorites → `Add account`) + toasts; empty `No favorites yet`.
- Muted: `Unmute` → `Posts unmuted`; empty `No muted accounts`.
- Blocked: `Unblock` → `Unblock {user}?` confirm + desc → `Unblocked` (no re-follow); empty `No blocked accounts`.
- Tapping a row (not the action) opens that public profile.

### QA-SETTING-008
**Objective:** Verify Content preferences.
**Maps to:** AC-SETTING-018, 11 §14
**Steps:** Open Content preferences; toggle Sensitive content, Snooze suggested; open Not interested + Interested lists; Reset suggested content.
**Expected result:** `Sensitive content` = `Less`/`Standard` (default, applies instantly); `Snooze suggested posts` toggle affects All-tab suggested filtering; `Reset suggested content?` confirm clears every `ni`; Not interested rows `Restore` per item; Interested rows remove (unlike); no `ni`-affected post returns to feed until restored.

### QA-SETTING-009
**Objective:** Verify Change Password (S-28).
**Maps to:** AC-SETTING-013, AC-AUTH-020, AC-AUTH-020A–E
**Steps:** Wrong current; new = current; mismatched confirm; short/simple new; API failure (contract); valid submit.
**Expected result:** In-app page with Current / New / Confirm fields; errors in order `Current password is incorrect.` → `New password must be different from current password.` → `Passwords do not match.`; new must satisfy canonical policy (≥8 + number/symbol); API/network error → `Unable to change password. Please try again.` without a field flag.

### QA-SETTING-010
**Objective:** Verify Log out.
**Maps to:** AC-SETTING-008
**Steps:** `Login` section → `ออกจากระบบ`/`Log out` → confirm.
**Expected result:** `Log out of @{user}?` → session `guest` + `Logged out successfully` + cleared personal surfaces.

### QA-SETTING-011
**Objective:** Verify Delete Account 2-page flow (S-27, S-02).
**Maps to:** AC-SETTING-009, AC-SETTING-010, AC-SETTING-010A–D
**Steps:** About your account → Account management → Delete account; try Continue with no reason; finish page 1; fail and pass the password check on page 2; sign back in during grace (contract); inspect the destination after success.
**Expected result:** Page 1 = reasons (required) + optional feedback; page 2 = current-password confirm (empty/wrong → inline error) → schedules deletion with 30-day grace + login-to-restore (S-02); success lands on the spec'd destination; failure → `Unable to delete account.` (contract); retention keeps audit-critical records per AC-SETTING-010A.

### QA-SETTING-012
**Objective:** Verify legal pages.
**Maps to:** AC-SETTING-006, AC-TS-014
**Steps:** Open Privacy Policy and Terms of Use from Settings, Help topics, About, and auth consent surfaces.
**Expected result:** In-app scrollable pages — Privacy = 4 sections, Terms = 3 sections (prototype placeholder content; production needs real legal text + version/date); labels exactly `Privacy Policy`/`Terms of Use`.

### QA-SETTING-013
**Objective:** Verify Help and About.
**Maps to:** AC-SETTING-007
**Steps:** Open Help and About; use `Contact support`.
**Expected result:** Help = `ศูนย์ช่วยเหลือ` + `Support channels` rows with locked copy + `Available daily · 09:00 - 22:00 (GMT+7)` + `Help topics`; About = app/company info (`Version 0.0.1`, `Mister Fox Co., Ltd. · Est. 2026`) + `Legal & Support` links; `Contact support` routes to the same Help page.

### QA-SETTING-014
**Objective:** Verify cookie preferences (contract).
**Maps to:** AC-SETTING-017
**Steps:** Open `Privacy & cookies` (no route in prototype — contract check).
**Expected result:** Essential `Always on` (non-editable) + Analytics + Personalized toggles bound to consent records.

### QA-SETTING-015
**Objective:** Verify library rows.
**Maps to:** AC-SETTING-015
**Steps:** Open Saved / Wish List / Archive / Watch Alerts rows; compare count badges with real counts.
**Expected result:** Each row opens its destination with an accurate count badge (`saved`/`wishlist`/`archive`/`walerts`).

---

## 14. Board

### QA-BOARD-001
**Objective:** Verify board home (S-01 editorial model).
**Maps to:** AC-BOARD-001, AC-BOARD-002, AC-BOARD-003
**Steps:** Open the Board tab; inspect hero carousel + Latest Articles; swipe/drag slides and tap dots.
**Expected result:** Home = hero carousel (interactive swipe/dots) + `Latest Articles` list + `View all` + search icon — read-only editorial content; no user-content actions (no post/comment/report-user on home).

### QA-BOARD-002
**Objective:** Verify View all + categories.
**Maps to:** AC-BOARD-004, AC-BOARD-005, AC-BOARD-006
**Steps:** `View all`; tap category pills; use the burger → Categories sheet; use the home crumb.
**Expected result:** `boardall` pill taps filter by category substring (cat + title) with the active pill centered; burger opens the Categories sheet → pushes `boardall` pre-filtered; `data-bdhome` crumb returns to home.

### QA-BOARD-003
**Objective:** Verify article search.
**Maps to:** AC-BOARD-007, AC-BOARD-008
**Steps:** Open search; inspect empty state; type matching and non-matching queries; tap a card.
**Expected result:** `boardsearch` opens with autofocus; empty query → `Popular Topics` chips (tap = fill query); typing live-filters title + cat + sub → `{n} results for {q}`; no hits → `No results found for "{q}"` + suggestion; card → Article Detail.

### QA-BOARD-004
**Objective:** Verify article detail anatomy.
**Maps to:** AC-BOARD-009, AC-BOARD-013
**Steps:** Open an article; open an invalid id.
**Expected result:** Floating pill nav (back + like heart + share) + category label → title + author row (`Author`=`Tuk Daeng` + `Date` + like count) + cover + callout + 3-paragraph body + non-interactive tag chips; invalid id → `Article not found`/`This article is no longer available.` (no unpublished/deleted split in prototype).

### QA-BOARD-005
**Objective:** Verify article like.
**Maps to:** AC-BOARD-010
**Steps:** Like/unlike an article as member; check count sync; tap as guest.
**Expected result:** Toggle `.on` + `likes ±1` synced across every `[data-bdlike]`; 1 user = 1 like, no liked-by strip/sheet; guest → Member Sheet.

### QA-BOARD-006
**Objective:** Verify article share (S-03).
**Maps to:** AC-BOARD-011, AC-BOARD-012
**Steps:** Share as member and as guest.
**Expected result:** Member → the shared share sheet (same friends/apps/copy as post share — no article-specific text); guest → Member Sheet.

### QA-BOARD-007
**Objective:** Verify guest gate map on board.
**Maps to:** AC-BOARD-012
**Steps:** As guest: browse home/all/search/detail freely; tap like/share/save/report entries.
**Expected result:** All browsing free; like/share (+ dead save/report entries) → Member Sheet before any handler runs; post-sign-in the gated action must be tapped again (no pending resume).

### QA-BOARD-008
**Objective:** Verify report article (contract — S-04).
**Maps to:** AC-BOARD-016, AC-TS-009
**Steps (contract):** Find `Report article` on the detail overflow; submit each reason state; submit twice; check the article afterwards.
**Expected result:** Report sheet = `Report article` + `Why are you reporting this article?` + reasons (`Spam or misleading`/`Harassment or hate`/`Scam or fraud`/`Illegal or restricted item`/`Inappropriate content`/`Other`) + optional details + `Submit report` disabled until a reason; success → `Report submitted` + `Our team will review it. This article will remain visible until moderation is complete.` + `Done`; duplicate → `You already reported this article.`; API fail → `Unable to submit report. Please try again.`; the article stays visible (never a `Hide article`/`Hide this asset` success copy); guest → Member Sheet; prototype has no overflow menu (dead path only — `Report submitted. Thank you for notifying us.` toast is not the contract copy).

### QA-BOARD-009
**Objective:** Verify article deep link contract.
**Maps to:** AC-BOARD-017, AC-NAV-016E, AC-NAV-016F
**Steps (contract):** Open shared links: published (guest/member), unpublished, deleted, invalid, admin-owned unpublished.
**Expected result:** Per matrix — published renders (guest read-only); unpublished/deleted → `บทความนี้ไม่พร้อมใช้งานแล้ว`; invalid → Not Found; admin self-published preview → detail + admin note; back with no history → Feed fallback; main nav keeps working.

### QA-BOARD-010
**Objective:** Verify board back navigation.
**Maps to:** AC-BOARD-014
**Steps:** Home → detail → back; home → all → back; search → detail → back.
**Expected result:** `.sub-back` pops to the originating surface; board home has no back (root).

### QA-BOARD-011
**Objective:** Verify dead artifacts are not live.
**Maps to:** AC-BOARD-018
**Steps:** Look for the overflow menu (`data-bdmore`), save/report entries, `Saved to favorites` behaviors, `bd-dfoot-sub`.
**Expected result:** These are dead/mocked paths — no functional article save/report UI ships in V1 prototype; spec-level report is contract-only per QA-BOARD-008.

### QA-BOARD-012
**Objective:** Verify no user-content actions (S-01).
**Maps to:** AC-BOARD-015
**Steps:** Look for add/edit/delete/publish entries on any board surface.
**Expected result:** None — board is TukDaeng editorial content only in FO V1.

---

## 15. Trust & Safety

### QA-TS-001
**Objective:** Verify block confirmation UI (replaces `Block this user?` dialog).
**Maps to:** AC-TS-001, AC-TS-001A, AC-PROFILE-040, AC-CHAT-031
**Steps:** Trigger block from profile `...`, chat `chmenu`, and report-done step; dismiss each way.
**Expected result:** Confirmation = `blkSheet` bottom sheet (avatar + `Block {u}?` + future-profiles desc + 3 impact rows + `Block` + `Block and report`; fromChat = `Block` only) — dismiss via backdrop, never via a Cancel row; **not** the old `Block this user?` center dialog; `Block and report` blocks then re-opens `report:pick:{u}`.

### QA-TS-002
**Objective:** Verify block effects everywhere.
**Maps to:** AC-TS-002, AC-TS-002A, AC-TS-003, AC-TS-004, AC-TS-005, AC-NAV-014
**Steps:** Block Member C; check feed, search grid/explore/accounts/tags, WA `N now`, following feed, chat rooms, profile.
**Expected result:** Their posts leave Feed, Search surfaces and Watch Alert matching; follow relationship excluded both ways; all threads gain `th.blocked` (read-only history + `Blocked` chip + blocked-bar); profile renders keep-page (masked stats + `No posts yet` + `Unblock` only); transient `Blocking` → `Blocked` feedback; existing deep links to their content → unavailable state (contract).

### QA-TS-003
**Objective:** Verify unblock semantics.
**Maps to:** AC-PROFILE-043, AC-SETTING-019
**Steps:** Unblock from keep-page, `...` label, Settings blocked list, chat blocked bar/menu, report step.
**Expected result:** Every entry → `unblockDlgHTML` (`Unblock {u}?` + `Unblock`/`Cancel`) → `Unblocked` toast + restrict-hint banner; no re-follow; the other party is never notified.

### QA-TS-004
**Objective:** Verify report post/user flow.
**Maps to:** AC-TS-006, AC-TS-007, AC-TS-006A, AC-TS-006B, AC-PROFILE-038, AC-PROFILE-039
**Steps:** `...`/`Report` → `report:pick`; choose `A specific post` → tile picker → `report:post`; choose `Something about this account` → `report:user`; try submitting without a reason; complete to `report:done`; run steps; `Done`/`X`; dismiss mid-way.
**Expected result:**
- `report:pick` → `report:posts:{u}` (grid picker, one tile at a time → `Next`) or `report:user`; reason pages use `PM_REASONS`; no reason = cannot submit.
- `report:done` = `Thanks for your feedback` + real step rows (Block/Unblock/Unfollow/Mute/Unmute) with green-check completion; `Done`/`X` → `rpClose` + `Report submitted · thanks for letting us know`.
- Mid-flow dismiss (backdrop/`sub-x`) creates nothing.

### QA-TS-005
**Objective:** Verify report does not remove content.
**Maps to:** AC-TS-010, AC-TS-011
**Steps:** Report a post, a user, a comment; recheck the content and profile.
**Expected result:** Everything stays fully visible and openable; reported parties never see the reporter's identity; removal happens only via Admin moderation in BO.

### QA-TS-006
**Objective:** Verify report comment.
**Maps to:** AC-TS-008, AC-SOCIAL-006
**Steps:** Long-press another user's comment → `Report`.
**Expected result:** `report:comment` page (X only, no back) + `PM_REASONS` → submitted via done flow + `Report submitted · thanks for letting us know`.

### QA-TS-007
**Objective:** Verify report from chat.
**Maps to:** AC-CHAT-035, AC-CHAT-036, AC-CHAT-037, AC-CHAT-038
**Steps:** `chmenu` → `Report` → `Report` vs `Report and delete`; complete flow; `Done`.
**Expected result:** `chatReportSheet` (`Report and delete`/`Report`/`Cancel`) → straight to `report:user` (skips `report:pick`, no `<`) → `report:done` → `Report submitted · thanks for letting us know`; `Report and delete` removes the thread from the actor's list + strips open chat pages + returns to Chat List.

### QA-TS-008
**Objective:** Verify report type coverage.
**Maps to:** AC-TS-006, AC-TS-007, AC-TS-008, AC-TS-009
**Steps:** Inventory report entries across surfaces.
**Expected result:** Types = Asset (post), User, Comment, Board Content — Board Content is contract-only copy per QA-BOARD-008; nothing else exists.

### QA-TS-009
**Objective:** Verify report guest gate.
**Maps to:** 00_GLOBAL §11, AC-BOARD-016
**Steps:** As guest, trigger every report entry (post `...`, profile `...`, comment, article).
**Expected result:** All report entries are login-required → Member Sheet.

### QA-TS-010
**Objective:** Verify moderation contract.
**Maps to:** AC-TS-011, AC-TS-012
**Steps (contract):** Report content; have an Admin act in BO; check FO surfaces and SLA.
**Expected result:** Admin actions in Back Office within the 24h SLA with audit trail; removed content stops rendering normally in FO.

### QA-TS-011
**Objective:** Verify Apple compliance coverage.
**Maps to:** AC-TS-015
**Steps:** Confirm presence of Report, Block, Terms of Use, Privacy Policy, and the moderation flow.
**Expected result:** All five are reachable in-app per spec.

### QA-TS-012
**Objective:** Verify removed-content handling (contract).
**Maps to:** AC-TS-011, 15 §12 Removed Content Rule
**Steps:** Reopen surfaces pointing at admin-removed content.
**Expected result:** Removed content renders as unavailable — never as normal content.

---

## 16. Integrations & Failure

### QA-INT-001
**Objective:** Verify SSO integrations.
**Maps to:** AC-INT-001, AC-INT-002, AC-INT-003, AC-INT-004
**Steps:** Sign in/up via Apple and Google (contract); try email/password on SSO accounts.
**Expected result:** Both providers supported for sign-in and sign-up; SSO email skips OTP; SSO accounts cannot sign in via email/password (method-mismatch rejection).

### QA-INT-002
**Objective:** Verify SSO error paths.
**Maps to:** 16 §9
**Steps:** Trigger an Apple/Google provider error; sign up with an Apple private-relay email.
**Expected result:** Provider errors show an SSO error + retry; private-relay emails are stored as the account email and still receive account-status mail.

### QA-INT-003
**Objective:** Verify FCM push integration.
**Maps to:** AC-INT-005, AC-INT-006
**Steps (contract):** Receive push for each alert type; tap each with valid and invalidated targets.
**Expected result:** Push types limited to like/comment/follow/watch; Watch Alert push opens the matched Post Viewer directly; every destination validates auth/permission/status/deletion/block → falls back per navigation rules.

### QA-INT-004
**Objective:** Verify push-permission-denied handling.
**Maps to:** 16 §9, AC-AUTH-028
**Steps:** Deny OS push permission (and Skip the pre-permission prompt).
**Expected result:** App fully usable — no blocking, no repeated nagging; `Skip` on the pre-permission page never triggers the OS dialog.

### QA-INT-005
**Objective:** Verify image storage/CDN rules.
**Maps to:** AC-INT-007, AC-INT-008, AC-INT-009
**Steps:** Scroll long feeds/lists; break an image upload and a CDN fetch.
**Expected result:** Feed/list images lazy-load; upload failure → retry/remove/replace affordance; CDN failure → placeholder + retry; unauthorized assets never load on public surfaces.

### QA-INT-006
**Objective:** Verify Watch Price API fallback (portfolio).
**Maps to:** AC-INT-010, AC-INT-011
**Steps (contract):** Open portfolio with the API up, degraded and down.
**Expected result:** API = first current-value source; unavailable → purchase-price fallback → `No Valuation`; the portfolio page never fails wholesale; source/last-updated shows when API data is used; market comparison never falls back to purchase.

### QA-INT-007
**Objective:** Verify payment gateway absence.
**Maps to:** AC-INT-012
**Steps:** Sweep for payment/checkout surfaces.
**Expected result:** None — Payment Gateway is Phase 2.

### QA-INT-008
**Objective:** Verify security and session revocation rules.
**Maps to:** 16 §8, AC-AUTH-016A, AC-AUTH-023
**Steps (contract):** Force a network timeout; have BO suspend the account mid-session; inspect push payloads.
**Expected result:** Timeout → error + retry where appropriate; all integration calls over HTTPS; BO suspend/ban revokes the session → account status state; push payloads carry no unnecessary private data.

---

## 17. Navigation & Deep Link

### QA-NAV-001
**Objective:** Verify bottom nav model.
**Maps to:** AC-NAV-017, AC-NAV-018, AC-NAV-019
**Steps:** Tap each tab; re-tap Feed; check badges.
**Expected result:** 5 tabs Feed/Chat/Boards/Alerts/Profile; non-feed tabs swap instantly (no slide); Feed re-tap clears the sub stack, re-renders and scrolls to top; Chat/Alerts badges = Σunread cap `99+`.

### QA-NAV-002
**Objective:** Verify header entries and drawer placeholders (S-19).
**Maps to:** AC-NAV-021, AC-NAV-022, AC-NAV-015
**Steps:** Use header search, `+`, and the hamburger drawer; tap every drawer row.
**Expected result:** Search → `search` sub page; `+` → composer (guest gated); drawer = 9 placeholder rows (Watch Brands / Watch Price Index / Watch Shops / Accessories Shop / Repair Shop / Auction Center / Consignment Center / Authentication Center / Community) — every row toasts a placeholder and never routes anywhere.

### QA-NAV-003
**Objective:** Verify sub-stack mechanics.
**Maps to:** AC-NAV-023
**Steps:** Push a sub page; back out; open a report stack and close it; open detail over a viewer and back.
**Expected result:** Pushed pages slide from the right; `sub-back` slides out right; report `sub-x`/`rpClose` closes the whole stack; `detail-back` removes only the detail layer (viewer stays mounted).

### QA-NAV-004
**Objective:** Verify notification routing.
**Maps to:** AC-NAV-006, AC-NAV-007, AC-NAV-008, AC-NAV-010
**Steps:** Tap like/comment/follow/watch alert rows.
**Expected result:** like/comment → own Post Viewer; follow → Public Profile; watch → matched Post Viewer directly — no Result List anywhere.

### QA-NAV-005
**Objective:** Verify Post Viewer entry matrix.
**Maps to:** AC-NAV-026, AC-SEARCH-018
**Steps:** Try opening the viewer from feed card media, explore tile, results tile, profile tile, saved/wishlist/archive tiles, alert row.
**Expected result:** Viewer opens only from grid tiles and notification rows — never from a feed card directly.

### QA-NAV-006
**Objective:** Verify deep link validation (contract — S-29).
**Maps to:** AC-NAV-016, AC-NAV-016A, AC-NAV-016B, AC-NAV-011
**Steps:** Open shared links for: normal post, `hide`/`sold` asset as owner and non-owner, deleted asset, blocked owner's post, suspended user target.
**Expected result:** Every link validates auth + permission + asset status + block + deletion before render: non-owner `hide`/`sold` → Permission Denied/Unavailable; owner `hide`/`sold` → owner detail; deleted → `รายการนี้ไม่พร้อมใช้งานแล้ว`; blocked → unavailable.

### QA-NAV-007
**Objective:** Verify back + main navigation after deep link (contract).
**Maps to:** AC-NAV-016C, AC-NAV-016D
**Steps:** Open a deep link with no in-app history; press back; use the bottom nav; repeat as guest into a gated surface.
**Expected result:** Back falls back to Feed — never closes the app or shows a blank page; main navigation remains usable; guest hitting a gated surface gets the Member Sheet like any normal entry.

### QA-NAV-008
**Objective:** Verify chat stays reachable across asset states.
**Maps to:** AC-NAV-012, AC-GLOBAL-009
**Steps:** Chat on a post → mark it sold → delete it; check the room each step.
**Expected result:** The thread keeps working (read + send per block rules) — asset state never kills the room; the item card remains a frozen snapshot.

### QA-NAV-009
**Objective:** Verify alerts back target.
**Maps to:** AC-NAV-024
**Steps:** Open Alerts via the tab and via a notification; press back on the page.
**Expected result:** Back always lands on Feed — never a generic pop to whatever was beneath.

---

## 18. Regression Sign-Off Matrix

| Section | Spec source | QA items | Owner | Result | Sign-off |
| --- | --- | --- | --- | --- | --- |
| Global Role & Permission | 00_GLOBAL, 00_NAV, 01_AUTH | QA-GLOBAL-001 – 015 | | ☐ Pass ☐ Fail | |
| Authentication & Onboarding | 01_AUTHENTICATION | QA-AUTH-001 – 017 | | ☐ Pass ☐ Fail | |
| Feed | 02_FEED | QA-FEED-001 – 020 | | ☐ Pass ☐ Fail | |
| Search & Filter | 03_SEARCH | QA-SEARCH-001 – 013 | | ☐ Pass ☐ Fail | |
| Profile | 06_PROFILE | QA-PROFILE-001 – 017 | | ☐ Pass ☐ Fail | |
| Post Detail | 05_ASSET_DETAIL | QA-DETAIL-001 – 012 | | ☐ Pass ☐ Fail | |
| Watch Alert | 10_WATCH_ALERT, 03 §9 | QA-WA-001 – 014 | | ☐ Pass ☐ Fail | |
| Asset Management & Portfolio | 04_ASSET_MGMT, 14_PORTFOLIO | QA-ASSET-001 – 016, QA-PORT-001 – 005 | | ☐ Pass ☐ Fail | |
| Chat | 07_CHAT | QA-CHAT-001 – 018 | | ☐ Pass ☐ Fail | |
| Alerts Feed | 09_NOTIFICATION | QA-NOTI-001 – 009 | | ☐ Pass ☐ Fail | |
| Social | 11_SOCIAL | QA-SOCIAL-001 – 016 | | ☐ Pass ☐ Fail | |
| Settings | 13_SETTINGS | QA-SETTING-001 – 015 | | ☐ Pass ☐ Fail | |
| Board | 12_BOARD | QA-BOARD-001 – 012 | | ☐ Pass ☐ Fail | |
| Trust & Safety | 15_TRUST_SAFETY, 06/07 canonical | QA-TS-001 – 012 | | ☐ Pass ☐ Fail | |
| Integrations & Failure | 16_INTEGRATIONS | QA-INT-001 – 008 | | ☐ Pass ☐ Fail | |
| Navigation & Deep Link | 00_NAV | QA-NAV-001 – 009 | | ☐ Pass ☐ Fail | |

**Sign-off rules:**
- Every scenario must be run in a session state matching its precondition (`member`/`new`/`guest` and ownership).
- `(contract)` items close on production/staging verification or code-review evidence — the prototype cannot satisfy them alone.
- Documented defects (S-10, S-14, and module deviation notes) are logged as defects — never waived as expected behavior.
