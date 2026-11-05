# AC Traceability Matrix — TukDaeng (Acceptance Criteria → UAT Scope)

| รายการ | ข้อมูล |
|---|---|
| Version | 0.1 (draft) |
| Date | 2026-11-05 · Asia/Bangkok |
| Task | BAC-007 [`f02caac5`] — Mission `0e19c244` Objective: UAT Readiness / Feature: AC Traceability Matrix |
| Status | **v0.1 — APPROVED** (พี่มาเต็ม 2026-11-05; findings AM-01–AM-05 ปิดครบ, spec `BO-17-v0.16`) |
| Source of truth | `FrontOffice/` + `BackOffice/` module specs (Acceptance Criteria sections) · `docs/uat-plan.md` v0.1 §7 (scope register) · `docs/business-process-flows.md` v0.2 (journeys) |

## 0. วิธีอ่านเอกสารนี้

- **แถว = feature area** ในแต่ละ module — ทุก AC ID ของ module ต้องถูก assign ลงแถวใดแถวหนึ่ง **พอดีหนึ่งครั้ง** (coverage invariant: ผลรวม `n` ต่อ unit = จำนวน AC ที่ spec นิยามใน section Acceptance Criteria)
- `Spec ref` = section ของตาราง AC: `NN §X` = `FrontOffice/NN_*_MODULE.md` section X; `BO-NN §X` = `BackOffice/NN_*_MODULE.md` section X
- `Journey` อ้าง `J-xx`/`B-xx`/`X-xx` จาก `docs/business-process-flows.md`; scope unit อ้าง `FO-xx`/`BO-xx`/`XS-x` จาก `docs/uat-plan.md` §7
- **Flag**:
  - `contract` = AC มีส่วนที่ prototype ตรวจไม่ได้จริง (deep link, email จริง, backend timing, stg-only) — mark `Production UAT` ตาม `uat-plan.md` §3.4; ส่วนที่เหลือยังเทสบน prototype ได้
  - `dev` = spec บันทึก deviation — expected = ตาม spec ไม่ใช่ตามที่เห็นในจอ
  - `deferred` = module/AC อยู่นอก Phase 1 (postponed/Phase 2) — ไม่นับเข้า exit criteria รอบนี้
- **เลข ID กระโดด = ตั้งใจ** — AC ที่ถูกถอด/renumber บันทึกใน `DOCUMENT_VERSION.md` (เช่น AC-BOARD-016 ถอดพร้อม Report Article, AC-BO-WA-006/007 ถอดพร้อม admin WA actions) ไม่ใช่ missing AC — ดู AM-02
- เอกสารนี้คือ **matrix เพื่อ sign-off เท่านั้น — ไม่รัน UAT จริง** (ข้อห้ามของ Mission `0e19c244`); เจอ spec ขัดแย้งบันทึกเป็น finding §5 รออนุมัติ ไม่แก้ spec

## 1. Coverage Summary

| Unit | AC prefix | n | Journeys | Flag |
|---|---|---|---|---|
| **FO feature units** | — | **475** | J-01..J-13 | |
| FO-01 Authentication | AC-AUTH | 55 | J-01 (+guest gate ทุก J) | |
| FO-02 Feed | AC-FEED | 52 | J-02, J-04, J-08, J-10 | |
| FO-03 Search & Filter | AC-SEARCH | 40 | J-03, J-06 | |
| FO-04 Asset Management | AC-ASSET-MGMT | 40 | J-04 | |
| FO-05 Asset/Post Detail | AC-DETAIL | 36 | J-02, J-04, J-06, J-08 | |
| FO-06 Profile | AC-PROFILE | 56 | J-11, J-02, J-07, J-08 | |
| FO-07 Chat | AC-CHAT | 42 | J-05, J-07 | |
| FO-09 Notification | AC-NOTI | 26 | J-09 | |
| FO-10 Watch Alert | AC-WA | 26 | J-06 | |
| FO-11 Social | AC-SOCIAL | 18 | J-08, J-10, J-07 | |
| FO-12 Board | AC-BOARD | 17 | J-13 | |
| FO-13 Settings | AC-SETTING | 23 | J-12, J-01 | |
| FO-14 Portfolio | AC-PORT | 22 | J-04, J-10 | |
| FO-15 Trust & Safety | AC-TS | 22 | J-07 | |
| FO-DOC Doc-tier bundle | AC-INT + AC-NFR + AC-ADMIN | 36 | contract review | `contract` |
| FO-00G/00NAV cross-cutting | AC-GLOBAL + AC-NAV | 50 | ทุก J | ผูกทุก FO unit |
| **BO feature units** | — | **324 executable + 33 deferred** | B-01..B-14 | |
| BO-01 Authentication | AC-BO-AUTH | 24 | B-01, B-12 | |
| BO-02 Dashboard | AC-BO-DASH | 16 | B-02 | |
| BO-03 User Management | AC-BO-USER | 28 | B-03, B-04 | |
| BO-04 Asset Management | AC-BO-ASSET | 30 | B-05, B-06 | |
| BO-05 Content Board | AC-BO-CONTENT | 13 | B-08 | |
| BO-06 Market Data | AC-BO-MARKET | 22 | B-09 | |
| BO-07 Directory | AC-BO-DIR | 10 | — | `deferred` |
| BO-08 Audit Log | AC-BO-AUDIT | 17 | B-14 | |
| BO-11 Watch Alert / Market Demand | AC-BO-WA | 26 | B-10 | |
| BO-12 Help & Support | AC-BO-SUPPORT | 15 | B-11 | |
| BO-13 Account Deletion | AC-BO-DEL | 13 | B-07 | |
| BO-14 Notifications | AC-BO-NOTI | 9 (+9 deferred) | B-14 | `deferred` บางส่วน |
| BO-15 Reports & Analytics | AC-BO-REPORT | 14 | — | `deferred` |
| BO-16 Admin Settings | AC-BO-SET | 41 | B-12, B-01, B-14 | |
| BO-17 Option Master | AC-BO-OM | 57 | B-13 | |
| BO-00G cross-cutting | AC-BO-GLOBAL | 13 | ทุก B | ผูกทุก BO unit |

รวม AC ที่ spec นิยาม: **FO 561 + BO 357 = 918 IDs** (FO-05 ตัด cross-ref AC-NAV-001 ที่อยู่ในตัวอักษรของ AC-DETAIL-003; BO-16 ตัด AC-BO-AUDIT-015 ที่เป็นอ้างอิงใน AC-BO-SET-018 — ดู AM-03)

## 2. Front Office Matrix

### FO-00G Global Rules — `00G §18` (cross-cutting, ผูกทุก FO unit)

| Feature หลัก | AC IDs (n) | Journey | Flag |
|---|---|---|---|
| Status & visibility canonical (Sale/Show/Hide/Sold/post, feed/search/WA eligibility) | 001–005, 015 (6) | J-02, J-04, X-09 | |
| Lifecycle effects (deleted asset, block exclusion, report-no-auto-hide, private data) | 008–012 (5) | J-07, X-01/X-09 | |
| Empty/error/offline baseline | 006, 013, 014 (3) | J-02 | |
| Session 3-state & guest gate | 007, 016, 017 (3) | J-01 + ทุก J | |
| Consent & policy (implied consent, re-consent, sign out/delete lifecycle) | 018–020 (3) | J-01, J-12, X-02/X-06 | |

### FO-00NAV Navigation & Cross-module Flow — `00NAV §17` (cross-cutting, ผูกทุก FO unit)

| Feature หลัก | AC IDs (n) | Journey | Flag |
|---|---|---|---|
| Detail/viewer/comment entries & media tap rules | 001–004, 026 (5) | J-02 | 004 `contract` (composer input) |
| Notification → destination mapping | 006–008, 010 (4) | J-09 | |
| Deleted asset / blocked user / chat survival | 011, 012, 014 (3) | J-02, J-07 | 011 `contract` |
| Drawer placeholders & non-baseline rows | 015, 022 (2) | J-12 | |
| Deep link contract (auth/permission/status checks + back fallback) | 016, 016A–016F (7) | J-02 | `contract` |
| Nav structure, tabs, back stack, gates, badges | 005, 017–021, 023–025 (9) | J-01 + ทุก J | |

### FO-01 Authentication — `01 §16`

| Feature หลัก | AC IDs (n) | Journey | Flag |
|---|---|---|---|
| Sign up email/password + OTP (validation, OTP UI, persist, 1 email=1 account) | 001, 001A, 002, 002A, 005, 007, 008, 032–034 (10) | J-01 | 005 `dev` |
| SSO sign-up/sign-in (Apple/Google, no OTP, no password) | 009–013, 037, 044 (7) | J-01 | |
| Profile setup & account created (avatar, username rules, welcome) | 035, 036, 038 (3) | J-01 | |
| Consent & privacy (implied consent, essential/optional, track prompt) | 014, 026, 027, 029 (4) | J-01 | |
| First-run onboarding (splash→sheet sequence, skippable prompts, stg analytics) | 025, 028, 030, 031 (4) | J-01 | 031 `contract` (stg-only) |
| Sign in & lockout (validation, credential errors, 5-attempt lockout, status checks) | 039–043, 045 (6) | J-01 | 042, 045 `contract` |
| Suspended/banned account state | 015, 016, 016A (3) | J-01, X-04 | |
| Forgot/reset password (generic response, reset page) | 017, 046, 047 (3) | J-01 | |
| Change password (current/new/re-type, all error copy) | 020, 020A–020E (6) | J-12 | |
| Session, sign out, guest gate, delete account, re-consent, V1 exclusions | 021–024, 048–052 (9) | J-01, J-12 | |

### FO-02 Feed — `02 §16`

| Feature หลัก | AC IDs (n) | Journey | Flag |
|---|---|---|---|
| Eligibility & tabs (post/sale only, block exclusion, All/Following/Favorites, audience stored-only) | 001–008, 052 (9) | J-02 | 052 `dev` |
| Post card anatomy & media gestures | 009, 010 (2) | J-02 | |
| Card actions (like/comment/share/save/Ask/follow/menu) | 011–021 (11) | J-02, J-08 | |
| Feedback controls (not-interested, uncomfortable, mute) | 022–025 (4) | J-02, J-08 | |
| Own-post menu & lifecycle (archive, commenting, edit, mark sold, pin, delete) | 026–032 (7) | J-02, J-04, J-10 | |
| Archive page & report entry | 033, 034 (2) | J-10, J-07 | |
| Load, pagination, error, offline, image fallback, no real-time | 035–038 (4) | J-02 | 036, 037 `contract` |
| Composer — create/share & media rules | 039–045, 050, 051 (9) | J-02, J-04 | |
| Composer — asset mode & edit (drawer toggle, prefill, Done) | 046–049 (4) | J-04 | |

### FO-03 Search & Filter — `03 §16`

| Feature หลัก | AC IDs (n) | Journey | Flag |
|---|---|---|---|
| Entry & landing (popular chips, explore grid) | 001–003 (3) | J-03 | |
| Typing mode, recents, live suggestions | 004–009 (6) | J-03 | |
| Query matching & results tabs (AND logic, For you/Profiles/Tags, discoverablePosts) | 010–018 (9) | J-03 | 012 `dev` |
| Filter page & chips (11 sections, dependent Model, Apply/draft, price validation) | 019–025 (7) | J-03 | |
| Post Viewer (default/feed/pfp modes, rail, sheets, back) | 026–031 (6) | J-02, J-03 | |
| Watch Alert bell integration (criteria from search, sig dedupe, match count) | 032–035 (4) | J-06 | 033 `dev` |
| Lifecycle/block/report effects on results | 036–038 (3) | J-02, J-07 | 037 `dev` |
| Empty/error states & V1 limits | 039, 040 (2) | J-03 | 039 `contract`+`dev` |

### FO-04 Asset Management — `04 §16`

| Feature หลัก (ตาม spec subgroup) | AC IDs (n) | Journey | Flag |
|---|---|---|---|
| Entry & guest gate (member-only routes, owner-only contract) | 001–003 (3) | J-01, J-04 | 003 `contract` |
| Add Asset composer (asset mode, visibility pick, drawer record, no confirm) | 004–010 (7) | J-04 | |
| Fields & spec free-text (22 CF_SPECS, Condition/Box options, price, clips) | 011–014 (4) | J-04 | |
| Purchase cost private (cost pane, date validation, private rule) | 015–018 (4) | J-04 | |
| Status & transitions (canonical statuses, Profile status pick) | 019–024 (6) | J-04 | |
| Mark as sold & sale record | 025–032 (8) | J-04 | |
| Asset list & detail (drawer surfaces, owner/public views) | 033–036 (4) | J-04, J-10 | |
| Delete & lifecycle (delete rules, surface propagation) | 037–040 (4) | J-04 | 038 `dev`+`contract`, 040 `contract` |

### FO-05 Asset/Post Detail — `05 §16`

| Feature หลัก (ตาม spec subgroup) | AC IDs (n) | Journey | Flag |
|---|---|---|---|
| Layer & entries (detail layer over viewer, entry rules) | 001–005 (5) | J-02 | |
| Anatomy (head/media/spec sections) | 006–013 (8) | J-02 | |
| Actions (like/comment/share/save/ask/menu) | 014–018 (5) | J-02, J-08 | 017 `contract` |
| Watch Alert button (`mf-btn`) | 019–023 (5) | J-06 | |
| Wishlist (`wl-btn`) | 024, 025 (2) | J-10 | |
| States (loading/error/deleted/sold variants) | 026–031 (6) | J-02 | |
| Sold / lifecycle | 032–034 (3) | J-04 | 032 `dev` |
| Contract / deviation guard | 035, 036 (2) | J-02 | `contract` |

### FO-06 Profile — `06 §16`

| Feature หลัก (ตาม spec subgroup) | AC IDs (n) | Journey | Flag |
|---|---|---|---|
| Profile page & entries (own/public, header) | 001–008 (8) | J-11 | |
| Tabs & grid (โพสต์/ขาย/โชว์ tabs, pin, tile→viewer) | 009–018 (10) | J-11, J-02 | |
| Follow / favorite / mute semantics | 019–025 (7) | J-08 | |
| Followers / following lists | 026–030 (5) | J-11 | |
| Share & QR | 031–035 (5) | J-11 | |
| Viewer menu / about / report / block | 036–045 (10) | J-07, J-11 | |
| Edit profile | 046–049 (4) | J-11 | |
| Guest gate | 050–052 (3) | J-01 | |
| Contract / deviation guard | 053–056 (4) | J-11 | 055 `contract` |

### FO-07 Chat — `07 §16`

| Feature หลัก (ตาม spec subgroup) | AC IDs (n) | Journey | Flag |
|---|---|---|---|
| Entry & thread model (item-scoped, own-listing block) | 001–005 (5) | J-05 | |
| Chat list — Chats view | 006–010 (5) | J-05 | 009 `dev` |
| Items view & item chats | 011–014 (4) | J-05 | |
| Swipe actions (pin/mute/delete) | 015–018 (4) | J-05 | |
| Chat room (messages, states, actions) | 019–024 (6) | J-05 | |
| Room search & menu & gallery | 025–028 (4) | J-05 | |
| Chat config | 029, 030 (2) | J-05 | 030 `dev` |
| Block / unblock in chat | 031–034 (4) | J-07 | |
| Report in chat | 035–038 (4) | J-07 | |
| Session / nav / guest / guard | 039–042 (4) | J-05 | |

### FO-09 Notification — `09 §16`

| Feature หลัก (ตาม spec subgroup) | AC IDs (n) | Journey | Flag |
|---|---|---|---|
| Feed & anatomy (rows, types, icons) | 001–004 (4) | J-09 | |
| Read / badge / actions | 005–009 (5) | J-09 | |
| Destinations (per notification type → target) | 010–012, 012A, 013, 014 (6) | J-09 | |
| Guest / session rules | 015–018 (4) | J-09, J-01 | 017 `contract` |
| Notification settings boundary | 019, 020 (2) | J-09, J-12 | 020 `contract`+`dev` |
| Guard | 021, 022 (2) | J-09 | |
| Category filter | 023–025 (3) | J-09 | |

### FO-10 Watch Alert — `10 §16`

| Feature หลัก (ตาม spec subgroup) | AC IDs (n) | Journey | Flag |
|---|---|---|---|
| Entries & sheet (bell entry, criteria sheet) | 001–005 (5) | J-06 | |
| Name / mode / dedupe (auto-name, matchMode, sig rules) | 006–010 (5) | J-06 | |
| List & toggle & delete (manage list, soft delete) | 011–015 (5) | J-06 | |
| Match engine (Sale-only, criteria evaluation, trigger) | 016–019 (4) | J-06, X-03 | 017 `contract` |
| Bell sync & notification (watch row in alerts, destination) | 020–022 (3) | J-06, J-09 | 020 `dev`, 022 `contract` |
| Guest / session / contract | 023–026 (4) | J-06 | 025 `contract` |

### FO-11 Social — `11 §21`

| Feature หลัก | AC IDs (n) | Journey | Flag |
|---|---|---|---|
| Like toggles & likes privacy (cross-surface sync, liked-by strip) | 001, 002 (2) | J-08 | |
| Comments & self-moderation (sheet, emoji react, long-press delete/report, guest read) | 003–007 (5) | J-08, J-07 | |
| Share & save (share sheet, save sheet + collections) | 008, 009 (2) | J-08, J-10 | |
| Saved hub & collection manage (tabs/search/tile→viewer, move/unsave/delete) | 010, 011 (2) | J-10 | |
| Wish List (detail entry + parallel collections) | 012 (1) | J-10 | |
| Follow & content prefs (account-level follow, favorites/mute/not-interested) | 013, 014 (2) | J-08, J-12 | |
| Report & block effects | 015, 016 (2) | J-07 | |
| Guest gate & session data rules | 017, 018 (2) | J-01 | |

### FO-12 Board — `12 §21`

| Feature หลัก | AC IDs (n) | Journey | Flag |
|---|---|---|---|
| Board home & discovery (tab, anatomy, hero carousel, view all, category pills/sheet) | 001–006 (6) | J-13 | |
| Article search (page + empty state) | 007, 008 (2) | J-13 | |
| Article detail & member interactions (anatomy, like, share) | 009–011 (3) | J-13 | |
| Guest gate, not-found & back navigation | 012–014 (3) | J-13 | 014 `contract` |
| Content boundaries & contracts (no user actions, deep link, dead artifacts) | 015, 017, 018 (3) | J-13 | 015, 017 `contract`; 016 removed → AM-02 |

### FO-13 Settings — `13 §16`

| Feature หลัก | AC IDs (n) | Journey | Flag |
|---|---|---|---|
| Settings home & account info (structure, sections, read-only email, about anatomy) | 001–003, 016 (4) | J-12 | 003, 016 `contract` |
| Language / theme / content preferences | 004, 005, 018 (3) | J-12 | |
| Library & what-you-see rows (saved/wishlist/archive/WA, favorites/muted/blocked) | 015, 019 (2) | J-12, J-10 | |
| Legal & help (legal docs, help/about, cookie prefs) | 006, 007, 017 (3) | J-12, X-06/X-07 | 017 `contract` |
| Notification settings baseline | 012 (1) | J-09 | |
| Log out & settings entry point | 008, 014 (2) | J-01, J-12 | |
| Change password | 013 (1) | J-12 | `contract` (บางส่วน) |
| Delete account flow (entry, 2-page, retention, grace restore, success/failure) | 009, 010, 010A–010D (6) | J-01, X-02 | 010A/B/D `contract` |
| Guest gate | 011 (1) | J-12 | |

### FO-14 Portfolio — `14 §21`

| Feature หลัก | AC IDs (n) | Journey | Flag |
|---|---|---|---|
| Entry & eligibility & empty state (owner-only, guest block, eligibility filter) | 001–004 (4) | J-10, J-04 | |
| Dashboard & values (total invested, market value, rows, source priority, gain/loss) | 005–010 (6) | J-04, X-08 | |
| Listing card & market comparison ±1% band | 011, 012 (2) | J-04, X-08 | |
| Mark as sold & sell form (entries, anatomy, prefill, validation, transition) | 013–016 (4) | J-04 | |
| Sold history & record (list, detail, view from sold post, terminal) | 017–019, 022 (4) | J-04 | |
| Privacy & dev guard (private data never public, dev sims dev-only) | 020, 021 (2) | J-10 | 021 `contract` |

### FO-15 Trust & Safety — `15 §21`

| Feature หลัก | AC IDs (n) | Journey | Flag |
|---|---|---|---|
| Block semantics & unblock (confirm, feed/search/WA exclusion, following exclusion, shared dialog) | 001, 001A, 002, 002A, 003–005, 019 (8) | J-07 | |
| Report flows (post stack + dismiss + reason, user, comment, done steps, chat) | 006, 006A, 006B, 007, 008, 016, 017 (7) | J-07 | |
| Report outcomes & moderation contract (no instant removal, admin moderation, handling) | 010–012 (3) | J-07, X-01/X-09 | |
| Legal & compliance (consent before signup, legal access, Apple coverage) | 013–015 (3) | J-01, J-12 | |
| Guest gate on report/block | 018 (1) | J-07 | |

### FO-DOC Doc-tier bundle — `16 §10` + `17 §9` + `18 §10` (contract review sign-off)

| Feature หลัก | AC IDs (n) | Journey | Flag |
|---|---|---|---|
| `16` SSO providers (Apple/Google sign-in/up rules) | INT-001–004 (4) | J-01 | `contract` |
| `16` Push & notification destination (FCM, destination rules) | INT-005, 006 (2) | J-09 | `contract` |
| `16` Image storage/CDN (lazy load, fallback/retry) | INT-007–009 (3) | — | `contract` |
| `16` Market/price API & payment boundary (portfolio support, no payment V1) | INT-010–012 (3) | J-04 | `contract` |
| `17` Performance & feed behaviors (load ≤2s, pagination, offline cache, board end note) | NFR-001–005 (5) | J-02, J-13 | `contract` |
| `17` Security & audit contracts (HTTPS, token, private-data authz, audit trail) | NFR-006–009 (4) | J-01 | `contract` |
| `17` i18n & display & a11y (TH/EN, ฿, empty state, font, screen reader) | NFR-010–014 (5) | J-12 | `contract` |
| `18` Admin boundary & moderation coverage (web-only admin, report targets, audit, Apple) | ADMIN-001–010 (10) | X-01, X-05 | `contract` |

## 3. Back Office Matrix

### BO-00G Global Rules — `BO-00G §18` (cross-cutting, ผูกทุก BO unit)

| Feature หลัก | AC IDs (n) | Journey | Flag |
|---|---|---|---|
| Platform, navigation & UI patterns (responsive web, access-aware nav, consistent patterns, responsive QA) | 001, 003, 004, 011 (4) | ทุก B | |
| Permission, masking, confirmation & audit (route/action enforce, sensitive mask, destructive confirm, audit coverage, export guard) | 002, 008–010, 012 (5) | ทุก B | |
| Canonical status & FO integration map (status contract, FO-support mapping, FO sync impact, guest boundary) | 005–007, 013 (4) | ทุก B, X-01 | |

### BO-01 Authentication — `BO-01 §15`

| Feature หลัก | AC IDs (n) | Journey | Flag |
|---|---|---|---|
| Login & sessions (email/password only, no OTP step, lockout 15min, idle 8h/max 24h, responsive) | 001–005, 011 (6) | B-01 | |
| Route & permission enforcement | 006, 007 (2) | B-01 | |
| Lifecycle states & safeguards & audit | 008–010 (3) | B-01, B-12 | |
| Invitation & activation (one-time token 72h, revalidate, resend cooldown, safe states, delivery trace) | 012–019 (8) | B-01, B-12 | 018 `contract` |
| Forgot/reset & change password (generic response, one-time token 30min, no OTP) | 020, 021 (2) | B-01 | 021 `contract` (บางส่วน) |
| Active sessions, logout all, expired/revoked handling | 022–024 (3) | B-01 | |

### BO-02 Dashboard — `BO-02 §17`

| Feature หลัก | AC IDs (n) | Journey | Flag |
|---|---|---|---|
| Landing, header & KPI & work queue (first page, 6 cards, chips, 7 rows, click-through) | 001–006 (6) | B-02 | |
| Recent activity & panels (filters, click-through, 3 panels) | 007–010 (4) | B-02 | |
| Data boundary, states & responsive (no guest analytics, partial error, unauthorized hide, breakpoints) | 011–016 (6) | B-02 | |

### BO-03 User Management — `BO-03 §16`

| Feature หลัก | AC IDs (n) | Journey | Flag |
|---|---|---|---|
| User list & list controls (summary cards, search, filter, sort, pagination; no guest, no delete/export actions) | 001–007, 015, 016 (9) | B-03 | |
| User detail & account actions (detail sections, password reset eligibility, suspend/ban flow + FO impact) | 008–014 (7) | B-03, X-04 | |
| Reported users queue & detail (list controls, status, report detail sections, close report, sources, deletion-requested) | 017, 017A–024 (9) | B-04, X-01 | |
| States, responsive & shared standards | 025–027 (3) | B-03, B-04 | |

### BO-04 Asset Management — `BO-04 §25`

| Feature หลัก | AC IDs (n) | Journey | Flag |
|---|---|---|---|
| Asset list & detail & BO status actions (read owner-status, temp hide, permanent hide, delete history) | 001–009 (9) | B-05 | |
| Reported assets queue & rules (case source, thresholds, state-change guard, close final) | 010–015 (6) | B-05, X-01 | |
| Standards & responsive | 016, 017 (2) | B-05, B-06 | |
| Reported comments queue & detail (list fields, 4-section detail, status contract) | 018–021 (4) | B-06 | 021 `contract` |
| Comment moderation actions & FO sync (hide/restore/remove/close, count sync, audit, author email) | 022–030 (9) | B-06, X-09 | |

### BO-05 Content Board — `BO-05 §18`

| Feature หลัก | AC IDs (n) | Journey | Flag |
|---|---|---|---|
| Articles CRUD, editor validation & lifecycle (draft/scheduled/published/archived, FO render, unavailable states) | 001–006 (6) | B-08, X-05 | |
| Categories (CRUD, reorder, activate/deactivate, linked-article block) | 007–009 (3) | B-08 | |
| Board placement (auto main hero/trending/journal preview) | 010 (1) | B-08, X-05 | |
| Audit/history, responsive & standards | 011–013 (3) | B-08 | |

### BO-06 Market Data — `BO-06 §24`

| Feature หลัก | AC IDs (n) | Journey | Flag |
|---|---|---|---|
| Dashboard (first page, submenus, summary cards, sync status strip, drill-in) | 001–005 (5) | B-09 | |
| Brands & models browse (brand/model/reference lists + detail + drawer) | 006–010 (5) | B-09 | |
| Sync history (summary cards, table, detail, failed-sync semantics) | 011–014 (4) | B-09 | |
| Phase 1 read-only enforcement | 015, 016 (2) | B-09 | |
| Data contracts (backend/cache only, nullable model_id, USD→THB metadata, downstream invalidation) | 017–020 (4) | B-09, X-08 | `contract` |
| States & responsive | 021, 022 (2) | B-09 | |

### BO-07 Directory — `BO-07 §17` — `deferred` (postponed)

| Feature หลัก | AC IDs (n) | Journey | Flag |
|---|---|---|---|
| ทั้ง module (item CRUD, FO display rules, import, map fallback, audit, responsive) | DIR-001–010 (10) | — | `deferred` — ข้าม Phase 1 sign-off ตาม `uat-plan.md` §1.3 |

### BO-08 Audit Log — `BO-08 §16`

| Feature หลัก | AC IDs (n) | Journey | Flag |
|---|---|---|---|
| Audit write contract (write actions, before/after, sensitive reveal, provider jobs, retention) | 001–004, 009 (5) | B-14 | |
| Access, immutability & export (permission read, immutable, server-side controls, self-audit export) | 005–008 (4) | B-14 | |
| List & detail drawer UI (table pattern, drawer sections, date range, ref pill jump) | 010–014 (5) | B-14 | |
| Ref links & trace (audit-ref jumps, canonical lifecycle events, correlation + secret-free payload) | 015–017 (3) | B-14 | 017 `contract` |

### BO-11 Watch Alert / Market Demand — `BO-11 §19`

| Feature หลัก | AC IDs (n) | Journey | Flag |
|---|---|---|---|
| Market Demand menu & aggregates (Demand Overview, Search Insights — read-only, no user-identifying data) | 001, 011, 011A, 012, 013 (5) | B-10 | |
| WA List read-only (columns, filters incl. match status, no admin action) | 002, 002A, 002B (3) | B-10 | |
| Alert Detail (head + 6 sections: summary, owner, criteria, matched assets, trigger history, user actions) | 002C–002I (7) | B-10 | |
| Criteria & match contract (search-schema, Sale-only, destination, relation-id vs free-text, backfill re-run) | 003–005, 014–017 (7) | B-10, X-03/X-08 | |
| Dependency, block context & responsive (inactive market data warning, block exclusion, breakpoints) | 008, 008A, 009, 010 (4) | B-10 | |

### BO-12 Help & Support — `BO-12 §18`

| Feature หลัก | AC IDs (n) | Journey | Flag |
|---|---|---|---|
| Policy & versioning (list, detail, editor validation, preview, publish confirm, version history/view/restore) | 001–009 (9) | B-11, X-06 | |
| Support Center (5-channel form, validation, FO preview live data) | 010–013 (4) | B-11, X-07 | |
| Audit events & responsive | 014, 015 (2) | B-11 | |

### BO-13 Account Deletion — `BO-13 §19`

| Feature หลัก | AC IDs (n) | Journey | Flag |
|---|---|---|---|
| Queue & request detail & dependencies (list/search/filter, user context, auto-close open reports) | 001–003 (3) | B-07, X-02 | |
| Grace period & lifecycle actions (30-day countdown, restore/reject modals, auto-delete+anonymize, email reuse) | 004–008, 011 (6) | B-07, X-02 | 006 `contract` |
| Lifecycle email, audit & channel notes (5-point email + delivery log, audit actions, channel disclosure) | 009, 012, 013 (3) | B-07, X-02 | |
| Responsive | 010 (1) | B-07 | |

### BO-14 Notifications — `BO-14 §18`

| Feature หลัก | AC IDs (n) | Journey | Flag |
|---|---|---|---|
| Phase 1 — Delivery Logs (queued→failed states + reason, idempotent retry, deletion lifecycle delivery, email preview, no sidebar entry, read-only) | 008, 009, 012–015, 017, 018 (8) | B-14 | |
| Phase 1 — Export contract guard | 016 (1) | B-14 | `contract` (production/future) |
| Phase 2 — Broadcast & triggers (dashboard, broadcast lifecycle, trigger types, destination rules, disabled-type guard, audit, responsive) | 001–007, 010, 011 (9) | — | `deferred` — Phase 2 |

### BO-15 Reports & Analytics — `BO-15 §22` — `deferred` (Phase 2)

| Feature หลัก | AC IDs (n) | Journey | Flag |
|---|---|---|---|
| Report catalog & export infra (9 reports, date range/filter, CSV/Excel, background job, sensitive mask) | 001–005 (5) | — | `deferred` |
| Report-specific rules (user+guest-split metrics, asset status wording, WA report, support exclusion, notification, deletion report, responsive) | 006, 006A, 006B, 007, 009–013 (9) | — | `deferred` |

### BO-16 Admin Settings — `BO-16 §21`

| Feature หลัก | AC IDs (n) | Journey | Flag |
|---|---|---|---|
| My Account & self-service security (edit name, change password no-OTP, own sessions, logout all, no-secret contract) | 001, 038–041 (5) | B-01 | 038, 041 `contract` (บางส่วน) |
| Platform settings (security policy baseline, retention, export, feature flags, integrations no-secret, responsive) | 004–010 (7) | B-12 | |
| Admin accounts — list, detail & action modals (7 columns, master pill, detail tiles, audit/delivery links, suspend/reactivate/unlock/archive, invite, permission gating, master/self safeguard) | 015–023, 033 (10) | B-12 | |
| Role change & lifecycle safeguards (last-admin protection, role change audit) | 002, 024, 025 (3) | B-12 | 024 `contract` |
| Roles & Permissions (8 templates, role list/detail, immutable role_id, create/edit/deactivate, current-phase exclusions) | 003, 026–031 (7) | B-12 | 028 `contract` |
| Invitation lifecycle (production account creation, server capabilities, resend cooldown/quota, DLV-ACCT trace, canonical audit, INV reference) | 032, 034–037 (5) | B-01, B-12 | 032 `contract` |
| Delivery Logs surface (under Settings, Sent/Retry status, no export Phase 1, DLV-DEL trace) | 011–014 (4) | B-14 | 013 `contract` |

### BO-17 Option Master — `BO-17 §20 + §22.10`

| Feature หลัก | AC IDs (n) | Journey | Flag |
|---|---|---|---|
| Spec completeness checks (doc-review — ตรวจเนื้อ spec ไม่ใช่จอ: scope/action rules/impact/audit/data model/seed/migration coverage) | 001–007, 014, 015, 017–019, 021–024, 026, 033, 034, 042, 043 (21) | B-13 | doc-review ไม่ใช่ prototype execute |
| Option-level rules & policies (key lock, deactivate policy, reorder UX + touch fallback, delete option type-to-confirm, deactivate impact) | 008–013, 020, 025 (8) | B-13 | |
| Group-level actions & safeguards (edit/deactivate/delete group, `is_active` Phase 1) | 027–030, 035 (5) | B-13 | |
| Option Group List & group management screens (status/filter/action menu, add group, reorder groups, audit log view, page actions, responsive) | 016, 031, 032, 036–041 (9) | B-13 | |
| FO integration & suggestion pool contract (form/filter/WA criteria, caching/fallback/API, prefill, `ระบุเอง`, curation) | 044–057 (14) | B-13, X-08 | `contract` (บางส่วน) |

## 4. Cross-Side Matrix (XS sign-off groups)

กลุ่ม sign-off ตาม `uat-plan.md` §7.3 — ไม่มี AC ของตัวเอง แต่ anchor ไปยัง AC ทั้งสองฝั่งที่ประกอบ flow

| Unit | Flows | AC anchors (FO side) | AC anchors (BO side) | Flag |
|---|---|---|---|---|
| XS-1 Moderation loop | X-01, X-09 | AC-TS-006–012, 016, 017; AC-GLOBAL-011; AC-NOTI (destinations) | AC-BO-USER-017–024; AC-BO-ASSET-010–015, 018–030 | timing ≤60s = `contract` |
| XS-2 Account lifecycle | X-02, X-04 | AC-SETTING-009, 010–010D; AC-AUTH-015, 016, 016A, 045, 050; AC-GLOBAL-020 | AC-BO-DEL-001–013; AC-BO-USER-013, 014, 024 | suspend enforcement = `contract` |
| XS-3 Content & reference | X-05, X-06, X-07 | AC-BOARD-001–018; AC-SETTING-006, 007, 017; AC-AUTH-051, 052; AC-TS-013, 014 | AC-BO-CONTENT-001–010; AC-BO-SUPPORT-001–013 | reference ≤24h = `contract` |
| XS-4 Data & alerts | X-03, X-08 | AC-WA-016–022; AC-SEARCH-019–025; AC-ASSET-MGMT-011–014; AC-PORT-008, 009 | AC-BO-WA-003–005, 008, 014–017; AC-BO-MARKET-017–020; AC-BO-OM-044–057 | WA async = `contract` |

## 5. Findings — จุดที่พบระหว่างสร้าง matrix (บันทึกเท่านั้น ไม่แก้ spec/prototype)

| ID | Finding | สถานะ | Refs |
|---|---|---|---|
| AM-01 | **BO-17 Option Master ไม่มี AC IDs** — spec เขียน AC เป็น checklist (§20 43 items + §22.10 14 items) ไม่มี `AC-BO-*-###` เหมือน module อื่นทั้งหมด | **CLOSED — พี่มาเต็มอนุมัติ 2026-11-05**: assign `AC-BO-OM-001`–`057` ใน spec แล้ว (`BO-17-v0.16` — §20 → 001–043, §22.10 → 044–057; แปลง checklist → canonical table, เนื้อ criteria คงเดิม) | `BackOffice/17 §20, §22.10` |
| AM-02 | **AC ID numbering gaps เป็น intentional removals** — AC-AUTH-003/004/006/018/019, AC-NAV-009/013, AC-BOARD-016 (ถอดพร้อม Report Article), AC-BO-WA-006/007 (ถอดพร้อม admin WA actions), AC-BO-REPORT-008, AC-TS-009 — ตรวจ `DOCUMENT_VERSION.md` ยืนยันแล้วว่าเป็นผล removal/renumber ไม่ใช่ missing AC; matrix ใช้เลขที่ยังมีอยู่จริงเท่านั้น | CLOSED (informational) | `FO/BO DOCUMENT_VERSION.md` |
| AM-03 | **Cross-referenced ACs ไม่นับซ้ำ** — AC-NAV-001 ถูก quote ในเนื้อ AC-DETAIL-003; AC-BO-AUDIT-015 ถูก quote ในเนื้อ AC-BO-SET-018 — matrix นับเฉพาะจุดนิยาม (owning module) ทำให้ FO-05 = 36, BO-16 = 41 | CLOSED (informational) | `05 §16`, `BO-16 §21` |
| AM-04 | **Contract-flagged ACs ตรวจบน prototype ได้บางส่วน** — 47 ACs มี marker `contract`/`deviation` (§0 legend): UI surface/state ตรวจได้ตาม spec copy แต่ behavior ลึก (deep link, email จริง, ≤60s/≤24h timing, stg analytics, backend token) defer ไป production UAT — matrix flag ไว้ที่ระดับแถว; executor ต้องอ่าน AC text ต่อแถวเพื่อแยก prototype-checkable vs contract-only | CLOSED (convention locked ใน UF-04 style — แจ้งไว้ใน §0) | `uat-plan.md` §3.4 |
| AM-05 | **Deferred ACs (33 IDs)** — BO-07 (10) + BO-15 (14) + BO-14 Phase 2 (9) มี AC นิยามแล้วแต่อยู่นอก Phase 1 scope; matrix เก็บแถว flag `deferred` ไว้เพื่อไม่ให้หลุด traceability ตอน Phase 2 แต่ไม่นับเข้า exit criteria รอบนี้ | **CLOSED — พี่มาเต็มยืนยัน convention 2026-11-05** (เก็บ deferred rows ในไฟล์) | `uat-plan.md` §1.3 |
