# Data Dictionary — TukDaeng

| รายการ | ข้อมูล |
|---|---|
| Version | 0.1 (Part A FO draft) |
| Date | 2026-11-05 · Asia/Bangkok |
| Task | BAC-003 [`f79ccc40`] — Mission `0e19c244` Objective: Data Dictionary & ERD / Feature: Data Dictionary |
| Status | **DRAFT — รอ review** (entity inventory + field dictionary ฝั่ง FO เสร็จ — รอพี่มาเต็มตรวจ) |
| Source of truth | `FrontOffice/` module specs (00 pair + 01–16, 18) — ทุกจุดในเอกสารนี้อ้าง spec section |

## 0. วิธีอ่านเอกสารนี้

- รูปแบบอ้างอิงเหมือน `business-process-flows.md`: `NN §X` = `FrontOffice/NN_*_MODULE.md` section X; `BO-NN §X` = `BackOffice/`; `00G` = `00_GLOBAL_RULES_MODULE.md`; `00NAV` = `00_NAVIGATION_AND_CROSS_MODULE_FLOW.md`
- ป้าย `(contract)` = spec contract สำหรับ production ที่ prototype ไม่ครอบ — spec เจ้าของ mark ไว้เอง
- ป้าย `(deviation)` = พฤติกรรม prototype ที่ spec บันทึกเป็น deviation — documented, ไม่ใช่ canonical
- Type ที่ใช้: `string`, `int`, `money` (THB จำนวนเต็ม แสดง `฿` + comma), `bool`, `enum`, `date` (ISO `YYYY-MM-DD`), `datetime`, `ref` (pointer ไป entity อื่น), `array<T>`, `localized` (`{en,th}` pair)
- Part A = entities ที่ FO spec เป็นเจ้าของเท่านั้น; BO entities (audit, delivery log, admin, market data master, option master ฯลฯ) อยู่ Part B (BAC-004)
- เอกสารนี้รวบรวมจาก spec จริง — ถ้าพบจุดที่ spec ขัดกันเองให้ดู §6 Findings (บันทึกเท่านั้น ไม่แก้ spec)

## 1. Entity Inventory (FO)

| ID | Entity | โมดูลเจ้าของ | Kind | Detail |
|---|---|---|---|---|
| E-01 | User / Account | 01, 06, 13 | core | §3.1 |
| E-02 | Session | 00G, 01 | system | §3.2 |
| E-03 | Credential & Sign-in Guard | 01 | core (sensitive) | §3.3 |
| E-04 | OTP Verification | 01 | system | §3.4 |
| E-05 | Consent Record | 00G, 01, 13 | core | §3.5 |
| E-06 | Post | 02, 05 | core | §3.6 |
| E-07 | Asset (drawer record) | 04, 14 | core | §3.7 |
| E-08 | Sold Record | 04, 14 | core | §3.8 |
| E-09 | Watch Spec Set (post/asset fields) | 04, 02 | reference structure | §3.9 |
| E-10 | Comment (+ Reply) | 05, 11 | core | §3.10 |
| E-11 | Collection (Saved / Wish List) | 11 | core | §3.11 |
| E-12 | Follow / Favorite / Mute (account relations) | 06, 11, 02 | relation | §3.12 |
| E-13 | Block / Removed-follower | 06, 15 | relation | §3.13 |
| E-14 | Not-interested / Content prefs flags | 02, 11, 13 | viewer state | §3.14 |
| E-15 | Report | 15 | core | §3.15 |
| E-16 | Chat Thread / Message / Config | 07 | core | §3.16 |
| E-17 | Notification (alerts feed row) | 09 | core | §3.17 |
| E-18 | Watch Alert | 10, 03, 05 | core | §3.18 |
| E-19 | Search State / Recent Search / Filter | 03 | viewer state | §3.19 |
| E-20 | Board Article | 12 | core (CMS) | §3.20 |
| E-21 | Account Deletion Request | 13 | core | §3.21 |
| E-22 | Settings Preferences | 13 | viewer state | §3.22 |
| E-23 | Support Channel (BO-driven) | 13, 16 | reference (contract) | §3.23 |
| E-24 | Legal Document / Policy Version | 00G, 13 | reference | §3.24 |
| E-25 | Market Price / Valuation source | 14, 16 | reference (contract) | §3.25 |

Entities ที่อยู่ใน post model แต่ไม่แยกเป็น E ของตัวเอง: like count/`likedBy`, view count, pin (`pins[tab]`), archive flag — รวมอยู่ใน E-06 §3.6; viewer-level flags (`liked`/`saved`/`wishlisted`/`ni`/`muted`/`blocked`) อธิบายครบใน §4 Flag Matrix

## 2. Shared Conventions

### 2.1 ID / Ref patterns

| Pattern | ใช้กับ | Ref |
|---|---|---|
| `pfa-NN` / `pfa-x{ts}` | Asset drawer id (`post.assetId`, `pfasset:`/`sell:` routes) | 04 §9, 14 §8.1 |
| `pfs-NN` / `pfs-x{ts}` / asset id carry-over | Sold record id (`sold:{id}` route ใช้ key เดิมของ asset) | 14 §8.2 |
| `wa{n}` | Watch Alert id | 10 §9 |
| `b{n}` | Board article id (`boardart:{id}`) | 12 §8 |
| `c-{…}` / `c-own-{ts}` | Comment id (own = emoji/quick composer) | 11 §10 |
| `user` | Chat thread key — **ห้องเดียวต่อ account** (FO-TEST-12 lock); Ask ลิสติ้งอื่น = เพิ่ม `m.pid` card ในห้องเดิม | 07 §9 |
| `brand\|model\|ref` (lowercase) | WA `modelKey` — join ของ spec Brand/Model/Reference | 05 §9, 10 §9 |
| `AST-` `POST-` `DEL-` `U-` `DLV-` | cross-side entity ref prefixes (ใช้ฝั่ง BO/audit/delivery เป็นหลัก — รายละเอียด Part B) | BAC-002 contract notes |

### 2.2 Session & context model

- Session 3 สถานะ: `member` / `new` / `guest` (GUEST-001) — `new` = member powers เต็มแต่ข้อมูลเริ่มต้นว่าง; `guest` = read-only + Member Sheet gate (00G §7)
- User context = `Owner` / `Viewer` / `Guest` / `Admin` — context ต่อ content ไม่ใช่ role ถาวร; user มี role เดียว ไม่แยก Buyer/Seller/Collector (00G §6)
- Session data swap: `member` restore ข้อมูลบัญชี, `new`/`guest` เคลียร์ข้อมูลส่วนตัวทุก surface (00G §7)

### 2.3 Asset status enum (canonical — 00G §9)

`Sale` / `Show` / `Hide` / `Sold` เท่านั้น + kind `post` (โพสต์ไม่ผูก asset — ไม่ใช่ asset status)

| Status | Owner Profile | Public Profile | Feed | Search | Watch Alert |
|---|---|---|---|---|---|
| `Sale` | แสดง | แสดง | แสดง | แสดง | Match |
| `Show` | แสดง | แสดง | — | — | — |
| `Hide` | เฉพาะ Owner | — | — | — | — |
| `Sold` | เฉพาะ Owner | — | — | — | — |
| `post` | แสดง | แสดง | แสดง | แสดง | — |

(00G §10 — visibility matrix canonical; `sold` = terminal ไม่มี path กลับใน V1 — 04 §9 Status Model Rule)

### 2.4 Money / number / date

- Money = THB integer — input digits-only strip non-digit + auto-comma (`unNum`/`fmtNum`); แสดง `฿{n}` (02 §11, 04 §11); `MAX_PRICE` filter = 2,000,000 (03 §9)
- Price ว่าง = showcase post ไม่ใช่ `Price on request` label (04 §9 deviations)
- Date = ISO `YYYY-MM-DD`; purchase/sale date ต้องอยู่ `1900-01-01` ถึงวันนี้ ห้ามอนาคต (02 §11, 04 §11)
- Money display rules ร่วม FO+BO: `docs/money-display-rules.md` (O-01–O-09 — DRAFT รอพี่คิง, DEC-42)

### 2.5 Privacy tiers

- **Private (owner-only)**: Purchase Price, Purchase Date, Sold History, Portfolio Value Detail (00G §14) — ทุก portfolio surface tag `ส่วนตัว`/`Private`
- **Private (viewer-level)**: like total ของโพสต์คนอื่น (`Liked by {name} and others` ไม่มีตัวเลข — S-26; owner เห็น count บน own surfaces — 11 §9)
- **Anonymous**: report ไม่เปิดเผยตัวตนผู้รายงาน (15 §6 disclaimer)
- **Collections ทั้งหมด** = `Private` label คงที่ (11 §8)

### 2.6 Persistence tiers (prototype ↔ contract)

| Tier | ข้อมูล | Ref |
|---|---|---|
| Server-backed (contract) | sessions/token, credentials, follow/fav/mute/block/removed/pins/archive/profile edits (`fo_pfstate`), watch alerts (`fo_walerts`), notification read/dismiss (`fo_alstate`), chat threads/pins/mutes/hidden/cfg/read (DEC-25), board `liked` (DEC-25), consent record (server-side log) | 06 §9, 10 §9, 09 §9, 07 §9, 00G §8 |
| Device persist (prototype) | `fo_lang`, `fo_theme`, `fo_account` (credential ที่สมัครในเครื่อง), `fo_onboarded`, `fo_member_hide`, `fo_toured`, `fo_consent`/`fo_consent_log`, search recents | 13 §9, 01 §8, 00G §7, 03 §9 |
| Session memory | `POSTS` flags (บางส่วน — ดู §4), `WATCH_ALERTS` draft, `PF_ASSETS`/`PF_SOLD`/`PF_MINE`, `ALERTS` list (seed), composer draft `cpState`, search state `S.*`, thread draft `t.draft`/`galState` | 11 §8, 04 §9, 02 §9, 03 §9, 07 §9 |

## 3. Entity Detail

### 3.1 E-01 User / Account

Source: `01 §7-9`, `06 §9`, `13 §9` — identity = `username` (route key `profile:{username}`)

| Field | Type | Constraints / Notes | Ref |
|---|---|---|---|
| `username` | string | **identity key** — 3–20 chars `[a-z0-9_.]` lowercase, unique vs `PROFILES` + `POSTS.seller`; auto-suggest จาก email local-part / provider display name; rename = migration ครบทุก ref | 01 §9, 06 §9/§11 |
| `disp` | string | display name — sync = username (ไม่มี display name แยกใน V1) | 06 §9 |
| `avatar` | image | `Edit picture` จาก OS picker; SSO photo = avatar เริ่มต้น | 01 §8, 06 §8 |
| `email` | string | unique 1 email = 1 บัญชี; **immutable หลัง verify**; SSO อาจเป็น Apple private relay (ต้องรับ account-status email ได้) | 01 §9/§11, 16 §7 |
| `bio` | string | ≤150 chars; default `⌚ watch collector` (fabricated) | 06 §9/§11 |
| `link` | string | `@handle` / bare domain / http(s) URL; ว่าง = ไม่มี | 06 §11 |
| `authMethod` | enum | `email` / `apple` / `google` — sign in ต้อง method เดิม; SSO ไม่มี password step; ไม่มี account linking ใน V1 | 01 §9 |
| `accountStatus` | enum | `Active` / `Suspended` / `Banned` / deletion-grace (contract) — Suspended/Banned revoke session + เหตุผล + วันสิ้นสุด (ถ้า temporary) + support channel | 01 §7/§9, 00G §12 |
| `verified` | bool | verified badge `PF_VBADGE` — แสดง About This Account | 06 §9 |
| `dateJoined` | date | `Date joined` (TH +543); hash-mock ใน prototype | 06 §9, 13 §9 |
| `accountBasedIn` | string | `Thailand` คงที่ใน V1 | 06 §9, 13 §9 |
| `posts` / `followers` / `following` | int → string | stats counters — seed format `21.1K`; new account = `0`; blocked keep-page mask `0`/`−`/`−` | 06 §9 |
| `followedBy` / `fbyMore` | array / int | followed-by row บน viewer profile (mock) | 06 §9 |
| `story` | bool | avatar ring | 06 §9 |

Relationships: User 1—N Post (seller), Asset, WatchAlert, ChatThread, Report (reporter), Comment, Collection, RecentSearch, Notification; User—User follow/favorite/mute/block (E-12/13)

### 3.2 E-02 Session

Source: `00G §7`, `01 §9 Token Rules`

| Field | Type | Constraints / Notes | Ref |
|---|---|---|---|
| `state` | enum | `member` / `new` / `guest` — transitions ตาม §7 Session Transitions | 00G §7 |
| `token` | opaque | token-based auth, HTTPS (contract); revoke เมื่อ Suspended/Banned/Delete | 01 §9 |
| `feedTab` | enum | `all`/`following`/`favorites` — ไม่ persist, reset `all` ทุก session change; `new` บังคับ `All` | 02 §9 |

### 3.3 E-03 Credential & Sign-in Guard

Source: `01 §8/§9/§11`

| Field | Type | Constraints / Notes | Ref |
|---|---|---|---|
| `email` | string | credential identity (email accounts) | 01 §9 |
| `password` | string (secret) | policy canonical: ≥8 chars + ≥1 ตัวเลขหรือสัญลักษณ์ (S-21); change: ต้องต่าง current + re-type ตรง | 00G §12, 01 §11, 13 §9 |
| `attemptCounter` | int (per email) | consecutive fails → lockout ครบ 5; reset เมื่อ sign in สำเร็จ | 01 §9 |
| `lockoutUntil` | datetime | 15 นาที server-side (contract) — นับแยกตามอีเมล, ไม่ผูกเครื่อง, ปิด/ล้างแอปไม่ reset | 01 §9 |
| `persisted` | bool | credential รอด logout/restart; Delete Account เท่านั้นที่ล้าง | 01 §9, 13 §9 |

### 3.4 E-04 OTP Verification

| Field | Type | Constraints / Notes | Ref |
|---|---|---|---|
| `code` | string(6) | ตัวเลข 6 หลัก, auto-submit เมื่อครบ; ผิด → shake + ล้างช่อง | 01 §9/§11 |
| `resendCooldown` | int(sec) | 30 วินาทีต่อครั้ง | 01 §9 |
| `expiresAt` | — | **ไม่มี expiry state** (S-20); เป็น step ภายใน flow ไม่ใช่ persistent entity | 01 §7/§9 |
| `channel` | enum | `email` transactional | 01 §14 |

### 3.5 E-05 Consent Record

Source: `00G §8`, `01 §8`, `13 §9`

| Field | Type | Constraints / Notes | Ref |
|---|---|---|---|
| `termsVersion` | string | Terms of Use version ที่ยอมรับ | 00G §8 |
| `privacyVersion` | string | Privacy Policy version ที่ยอมรับ | 00G §8 |
| `requiredAcceptedAt` | datetime | implied consent — Continue/Create account/Accept & continue พร้อม legal text; ไม่มี checkbox | 00G §8 |
| `analytics` | bool | optional, default off, opt-in | 00G §8 |
| `personalized` | bool | optional, default off; `Ask App Not to Track` บังคับ off | 00G §8, 01 §8 |
| `language` | enum | `en`/`th` ณ เวลาบันทึก | 00G §8 |
| `recordedAt` | datetime | timestamp ของ record — production = server-side consent log | 00G §8 |

- Re-consent: policy version bump → sheet บังคับทุก session; `Decline` → เหลือเฉพาะ Sign out/Exit app (00G §8)
- Essential cookies/SDK = always on ไม่มี toggle (00G §8, 13 §9)

### 3.6 E-06 Post

Source: `02 §9 Post Model` (canonical), `04 §9` (pfkind), `05 §9` (detail fields)

| Field | Type | Constraints / Notes | Ref |
|---|---|---|---|
| `id` (`pid`) | string | key ของ `findPost` (`POSTS`+`PF_GFX_REG`+`PF_MINE`) | 05 §9 |
| `seller` | ref→User | owner identity = `isOwnPost()` เมื่อ = current user | 02 §9 |
| `type` | enum | `sale` (มี price) / `showcase` (ไม่มี price) — **display hint เท่านั้น** | 02 §9 |
| `pfkind` | enum | `post`/`sale`/`show`/`hide`/`sold` — **ตัวกำหนด eligibility** + drawer status mirror; fallback `price ? "sale" : "show"` (deviation) | 02 §9, 04 §9 |
| `assetId` | ref→Asset? | link ไป drawer record; null เมื่อ detach | 04 §9 |
| `photos[]` | array<image> | 1–10 media slides รวม clips (`CF_MAX_MEDIA`); carousel ไม่วน | 02 §9/§11 |
| `clips[]` | array<int?> | duration ต่อ slide (`null` = photo); `clip` = โพสต์ clip เดียวล้วน | 02 §9 |
| `caption` / `captionFull` | string | short + full; hashtags `#tag` render กดได้ → search; ไม่ required | 02 §9 |
| `desc` | string | field Description แยกจาก caption — detail `Descriptions`; ว่าง → `-` | 05 §9 |
| `price` | money? | `Add price` pane — ว่าง = showcase; auto `Price & Data Source` band | 02 §9 |
| `specGroups[]` | array<SpecGroup> | ดู E-09; ค่าว่าง render `N/A` | 02 §9, 04 §9 |
| `chips[]` | array<enum> | [Condition, Box & papers] — fixed options | 02 §9, 04 §9 |
| `location` | string? | `CF_LOCS` pick + km sub-line | 02 §9 |
| `audience` | enum | `public`/`followers` — **stored ไม่ enforce ใน V1** (deviation/contract) | 02 §9 |
| `noComments` | bool | ซ่อน comment button+count ทุก surface | 02 §9 |
| `hideCounts` | bool | ซ่อน liked-by + views; seeded flag — composer ไม่มี setter (deviation) | 02 §9 |
| `likes` / `comments` / `views` | int | counters; like total = private (S-26); views นับ scroll-pass ≥55% บน feed เท่านั้น (DEC-45) | 02 §9 |
| `likedBy` | ref→User? | first liker สำหรับ liked-by strip | 02 §9, 11 §9 |
| `commentPreview` | text | feed card preview | 02 §9 |
| `liked` | bool | viewer flag — toggle ±1 likes; 1 user = 1 like | 11 §9 |
| `saved` / `savedCols[]` / `savedAt` / `colAt` | bool / array<string> / datetime | Saved flag + multi-collection memberships + sort stamps | 11 §8/§12 |
| `wishlisted` / `wlCols[]` / `wlAt` / `wlColAt` | bool / array<string> / datetime | Wish List เหมือน Saved แต่แยกระบบ; entry เฉพาะ Post Detail `wl-btn` | 11 §8/§13, 05 §9 |
| `following` / `favorite` / `muted` | bool | account-level flags mirror ลงทุก post ของ seller | 11 §8/§14 |
| `ni` | bool | not-interested — feed exclusion + restore path | 02 §9, 11 §14 |
| `blocked` | bool | block relationship → หลุดทุก surface | 02 §9, 00G §13 |
| `archived` / `archivedAt` | bool / datetime | owner lifecycle flag — หลุด feed+grid+tiles; ล้าง pins; Archive page เท่านั้น | 02 §9 |
| `pins` | map<tab,int> | per-tab pin seq — `PIN_MAX=3` ต่อ tab, replace oldest เมื่อเกิน | 02 §9, 06 §9 |
| `modelFollowing` | bool | bell sync จาก ON watch alert ที่ `modelKey` ตรง | 10 §9 |
| `time` | string/datetime | `Just now` seed; posted time localized | 02 §9 |

Relationships: Post N—1 User (seller); Post 0..1—1 Asset (`assetId`); Post 1—N Comment; Post N—M Collection (savedCols/wlCols); Post N—M User (like/save/wishlist/ni flags); Post→ChatThread item snapshot (`m.pid` card)

### 3.7 E-07 Asset (drawer record — `PF_ASSETS`)

Source: `04 §9 Asset Data Model Rule` (canonical), `14 §8.1`

| Field | Type | Constraints / Notes | Ref |
|---|---|---|---|
| `id` | string | `pfa-NN` (seed) / `pfa-x{ts}` (composer) — key ของ `pfasset:`/`sell:` routes | 14 §8.1 |
| `img` / `photos[]` | image / array | hero + carousel | 14 §8.1 |
| `name` | string | `brand + " " + model` หรือ caption ≤42 หรือ `Untitled asset` | 04 §9 |
| `ref` / `meta` / `brand` | string | reference / `year · cond` / brand | 04 §9 |
| `status` | enum | `sale`/`show`/`hide` เท่านั้น (`PFO_STATUS`) — `sold` ไม่อยู่ใน model นี้ | 14 §8.1 |
| `market` | money? | market price — record ใหม่ = `null` เสมอ; contract = Watch Price API (E-25) | 14 §8.1, 16 §7 |
| `purchase` | money? | **private** — ราคาซื้อ; `null`/`0` = ไม่มี cost basis | 14 §8.1, 00G §14 |
| `bought` | date? | **private** — วันที่ซื้อ `1900-01-01`..วันนี้ | 14 §8.1, 04 §11 |
| `asking` | money? | ราคาตั้งขาย — prefill Sale price + Expected profit + Market comparison | 14 §8.1 |
| `own` | bool | `pfoEligible` ต้อง `own !== false` — ของ owner เสมอ | 04 §9 |

Lifecycle: สร้างผ่าน `cfToPortfolio` ทุก asset-mode save; `post.assetId` link สองทิศ; Edit info sync status/fields; drawer OFF → splice + `assetId=null` (link ไป sold คงไว้); Mark as sold → ย้าย `PF_SOLD` (04 §9, 14 §8)

### 3.8 E-08 Sold Record (`PF_SOLD`)

Source: `14 §8.2`, `04 §9`

| Field | Type | Constraints / Notes | Ref |
|---|---|---|---|
| `id` | string | `pfs-NN` (seed) / carry-over `pfa-*` (asset id เดิม — `sold:{id}` ใช้ key เดิม) / `pfs-x{ts}` | 14 §8.2 |
| `img`/`photos[]`/`name`/`ref`/`brand` | — | carry จาก asset/post | 14 §8.2 |
| `soldDate` | date | required — default/max = วันนี้ | 04 §11 |
| `price` | money? | required >0 — Sale price; `null` → `N/A` | 04 §11 |
| `purchase` / `bought` | money? / date? | cost basis carry — ใช้ Realized G/L + Holding period | 14 §8.2 |
| (derived) `realizedGL` | money? | `price − purchase` (เมื่อมี cost basis) | 14 §9.3 |
| (derived) `holdingPeriod` | text | `pfoHold(bought, soldDate)` — `{d}d`/`{m}m`/`{y}y {m}m` | 14 §9.6 |

- **ไม่มี** Buyer / Contact / Payment Method / Attachment (spec เดิม 6 fields — D3) — record เก็บแค่ sale price + sale date (04 §9)

### 3.9 E-09 Watch Spec Set (post/asset field structure)

Source: `04 §9 Spec Free-Text Rule` (canonical), `02 §9`, `05 §9`

- `specGroups[]` = array ของ group `{ label, rows:[{label, value}] }` — ค่าว่าง render `N/A`
- **22 free-text fields** (ไม่มี option list/autocomplete/`ระบุเอง` ใน V1): Watch Specifications 20 — `Brand`, `Collection`, `Model`, `Reference`, `Case Diameter`, `Thickness`, `Lug-to-Lug`, `Case Material`, `Case Color`, `Bezel Material`, `Dial Color`, `Dial Pattern`, `Movement Type`, `Calibre`, `Power Reserve`, `Functions`, `Water Resistance`, `Strap/Bracelet Material`, `Strap Color`, `Clasp Type` + Item Details 2 — `Year`, `Service History` + `Description` textarea
- Fixed options เฉพาะ: `Condition` ∈ {`Brand New`, `Like New`, `Very Good`, `Good`, `Fair`} single-select + `Box & papers` ∈ {`Full set — box & papers`, `Box only`, `Papers only`, `Watch only (no set)`} toggle — render เป็น `chips` + เพิ่มใน `Item Details`
- `Price & Data Source` group (auto เมื่อมี details/price): `Asking Price`, `Estimated Market Price` (mock ±5–6% ปัด 5,000 — ไม่ใช่ market data จริง), `Last Price Update`, `Data Source` = `TukDaeng Market Data` (02 §9)
- Option-master / market-data relation id / suggestion pool = **contract/future เท่านั้น** (04 §9/§18; WA relation-id matching = 10 §9 Production Contract)

### 3.10 E-10 Comment (+ Reply)

Source: `05 §9`, `11 §10`, `00G §15`

| Field | Type | Constraints / Notes | Ref |
|---|---|---|---|
| `id` | string | `c-own-{ts}` เมื่อสร้างใน session | 11 §10 |
| `postId` | ref→Post | `COMMENTS[pid]` | 11 §10 |
| `name` / `avatar` | ref→User | author identity | 11 §10 |
| `text` | string | content; emoji quick-react = comment ตัวเองทันที | 11 §10 |
| `time` | string | `Just now`/`เมื่อสักครู่` | 11 §10 |
| `likes` / `liked` | int / bool | per-comment like toggle persist | 11 §10 |
| `replies[]` | array<Comment> | **one-level เท่านั้น** (IG-style — ไม่มี nested reply-of-reply); `Reply` prefill `@{username}` ต่อท้าย root เดียวกัน | 00G §15, 05 §9, 11 §10 |
| `isOwn` | bool | own comment → long-press `Delete` (confirm; root มี replies → ลบทั้งกระทู้ + `comments -= 1+N`) | 11 §10 |

- Comment composer = real ใน V1 (DEC-17 — `.comment-input` + `Post`); guest อ่านได้ input gated (11 §10)
- Block author → comments+replies หายจาก sheet (filter ไม่ลบข้อมูล — unblock กลับมา) (11 §10)
- `noComments` post = ซ่อน button+count (แต่ `pv-add` bar ยังเปิด sheet ได้ — quirk) (02 §9, 03 §9)

### 3.11 E-11 Collection (Saved / Wish List)

Source: `11 §8/§12/§13` (canonical), `05 §9` (wishlist entry)

| Field | Type | Constraints / Notes | Ref |
|---|---|---|---|
| `name` | string | **ซ้ำได้** — ไม่มี dedupe (LIB-042); rename map ชื่อใน `savedCols` ทุก post | 11 §8/§12 |
| `thumb` / `coverPid` | image / ref→Post | cover จาก `Change cover` หรือ latest post; tile หาย → cover อัปเดตตามที่เหลือ | 11 §12 |
| `privacy` | const | `Private` เสมอ — label คงที่ | 11 §8 |
| members | `post.savedCols[]` / `post.wlCols[]` | **multi-collection** — post อยู่ได้หลาย collection; array ชื่อ collection | 11 §8 |

- `COLLECTIONS` (Saved) กับ `WISHLISTS` (Wish List) **แยกระบบสมบูรณ์** — arrays, flags (`saved`/`wishlisted`), pseudo-rows (`"Saved"`/`"Wishlist"` = flag เอง ไม่ใช่สมาชิก), stamps (`savedAt`/`colAt` vs `wlAt`/`wlColAt`) (11 §8/§13)
- Un-save/un-wishlist → ล้าง flag + หลุดทุก collection; เอาออกทีละ collection ไม่กระทบ membership อื่น; move→new col = ล้าง memberships เดิมเหลือ col ใหม่ (11 §12/§13)
- ลบ collection → ลบชื่อออกจาก `savedCols`/`wlCols` ทุก post — posts ยัง saved/wishlisted (11 §12)

### 3.12 E-12 Follow / Favorite / Mute (account-level relations)

Source: `11 §14`, `06 §9`, `02 §9`

| Relation | Storage | Semantics | Ref |
|---|---|---|---|
| Follow | `p.following` (ทุก post ของ seller) + `PF_EXTRA_FOL` (user ไม่มี post) | account-level; unfollow ล้าง `favorite`+`muted` อัตโนมัติ; per-surface confirm/instant ต่างกันโดยเจตนา | 11 §14, 06 §8 |
| Favorite | `p.favorite` + `PF_EXTRA_FAV` | seller-level feed filter (Favorites tab) — **ไม่ใช่** liked posts; entry เฉพาะ following หรือ favorite อยู่แล้ว | 11 §14, 02 §9 |
| Mute | `p.muted` + `PF_EXTRA_MUT` | โพสต์หลุด feed ทุก tab แต่ยัง follow; unmute ที่ Settings `muted` / profile | 11 §14 |
| Remove follower | `PF_REMOVED_FOL` | own followers เท่านั้น; ไม่แจ้งอีกฝ่าย; block auto-add | 06 §9 |

### 3.13 E-13 Block / Unblock

Source: `06 §9`, `15 §9`, `00G §13`, `11 §15`

- Storage: `PF_BLOCKED` (persist `fo_pfstate`) + `p.blocked` ทุกโพสต์ + `th.blocked` ทุก chat thread + `PF_REMOVED_FOL` add + unfollow ทั้งสองทิศ
- Effects: โพสต์อีกฝ่ายหลุด Feed/Search/WA matching/profile entry; blocked profile = keep-page (masked stats, grid `No posts yet`, `Unblock` เดียว — S-13); comments ของเขาถูก filter; chat = `ch-blocked-bar` read-only
- Unblock: confirm dialog → restore composer/visibility — **ไม่ re-follow** + restrict-hint banner ~6s
- ไม่แจ้งอีกฝ่ายทั้ง block/unblock (`They won't be notified…`)

### 3.14 E-14 Not-interested / Content preference flags

Source: `02 §9`, `11 §14`, `13 §9`

| Flag/Setting | Storage | Semantics | Ref |
|---|---|---|---|
| `ni` (not interested) | `p.ni` per post | card → ni-card (`Undo`/`Mute`/`Unfollow`/`Manage prefs`/`uncomfortable`); หลุด feed หลัง re-render; restore ที่ Settings `ni` หรือ `Reset suggested content` (ล้างทั้งหมด + ปิด snooze) | 02 §8/§9, 13 §9 |
| Snooze suggested | settings toggle | ON → feed `All` เหลือเฉพาะ following (concept: ซ่อน suggested 30 วัน) | 02 §9, 13 §9 |
| Sensitive content | enum `less`/`standard` | default `standard`; auto-save | 13 §9 |
| `interested` list | `p.liked` filter | liked posts — Remove = unlike | 13 §9 |

### 3.15 E-15 Report

Source: `15 §6/§8/§9` (canonical), `06 §9`, `07 §9`, `11 §15`

| Field | Type | Constraints / Notes | Ref |
|---|---|---|---|
| `targetType` | enum | `post` / `user` / `comment` — chat report เป็น user-report ผ่าน chat context (`rpFromChat`, ข้าม `report:pick`) | 15 §6/§8 |
| `targetRef` | ref | `rpUser` (seller/user) / `rpPid`+`rpCid` (comment) / post picker selection | 15 §6, 11 §15 |
| `reason` | enum | **PM_REASONS 9 เหตุผลชุดเดียวทุก type** (required — tap = submit ในตัว): `I just don't like it` / `Bullying or unwanted contact` / `Suicide, self-injury or eating disorders` / `Violence, hate or exploitation` / `Counterfeit or replica item` / `Nudity or sexual activity` / `Scam, fraud or spam` / `False information` / `Intellectual property` (TH pairs ใน 15 §6) | 15 §6 |
| `anonymous` | const | `Your report is anonymous…` — ไม่เปิดเผย reporter | 15 §6 |
| `details` | — | **ไม่มี** free-text details/submit button บน live stack (deviation D3 — spec เดิมมีชุดเหตุผลแยกตาม type + optional details) | 15 §6/§20 |
| `doneSteps` | array | `report:done` other steps: Block/Unblock/Unfollow/Mute/Unmute (real actions + green check) | 15 §6 |
| `deleteChat` | bool? | `Report and delete` (chat) → `rpDelChat` → hidden + ออกจาก threads + กลับ list | 07 §9 |

- Report **ไม่ทำให้ content หายทันที** — moderation อยู่ BO (00G §13); reporter ได้ `report:done` + toast `Report submitted · thanks for letting us know`; ผู้ถูกรายงานไม่ถูกแจ้ง
- Auto-hide ≥5 unique reporters บน Sale/Show post = BO-side contract (BO-04 §14 + FO-15 §11 — BAC-002 resolved; FO ฝั่งบันทึก documented)

### 3.16 E-16 Chat Thread / Message / Config

Source: `07 §9` (canonical)

| Field | Type | Constraints / Notes | Ref |
|---|---|---|---|
| Thread `user` | ref→User | **key = user** — ห้องเดียวต่อ account (FO-TEST-12); Ask listing อื่น = เพิ่ม `m.pid` card ไม่ใช่ห้องใหม่ | 07 §9 + dev #1 |
| `item` | object? | snapshot นิ่ง `{id, cap, price, photo, owner, pid}` — โพสต์แก้/ขาย/ลบไม่เปลี่ยนการ์ด; `item.owner===me` → `Your listings` | 07 §9 |
| `msgs[]` | array | `{f:"me"/"them", t?:text, img?:src, isVideo?:bool, pid?:postRef, at:"HH:MM", day, read:bool}` — types = text + image/video + post-ref card เท่านั้น (ไม่มี file/asset/offer card) | 07 §9 |
| `unread` | int | nav badge Σ cap `99+`; เปิดห้อง = 0 | 07 §9 |
| `draft` | string? | per-thread composer draft (memory) | 07 §9 |
| `pinnedAt` | datetime? | pin → เรียงก่อน + badge; swipe actions | 07 §9 |
| `muted` | bool | mute toast; badge contribution = contract | 07 §9/§14 |
| `hidden` | bool | hide → ออกจาก Chats view; auto un-hide เมื่อ send/Ask ใหม่ | 07 §9 |
| `blocked` | bool | → `ch-blocked-bar` read-only + `Cannot message a blocked account` | 07 §9 |
| `media[]` | array | gallery pool (sent media + seeds) | 07 §9 |
| `searching`/`roomQuery` | — | in-room search state | 07 §9 |
| `C.draft` | object | draft room นอก threads — มีได้ทีละ 1, เข้า list เมื่อ send แรก | 07 §9 |

ChatConfig (`cfg` — persist server-backed DEC-25):

| Field | Type | Constraints | Ref |
|---|---|---|---|
| `notif` | bool | message notifications | 07 §9 |
| `preview` | bool | show message preview | 07 §9 |
| `followOnly` | bool | `Only people I follow can message me` — enforced (RESOLVED 2026-10-29) | 07 §9 |
| `defView` | enum | `chats`/`items` default view | 07 §9 |
| `quick` | string | ≤80 chars — prefill composer ของ draft room (Ask) | 07 §9/§11 |

### 3.17 E-17 Notification (`ALERTS` row)

Source: `09 §9` (canonical)

| Field | Type | Constraints / Notes | Ref |
|---|---|---|---|
| `id` | string | per-account list; read/dismiss persist ถาวร (server-backed contract — `fo_alstate` prototype) | 09 §9 |
| `type` | enum | `like` / `comment` / `follow` / `watch` / `system` — **ไม่มี chat type** | 09 §9, 00G §15, 16 §7 |
| `users[]` | array<ref→User> | actors; index 0 = primary; 2 ชื่อแรก render | 09 §9 |
| `more` | int | aggregate count นอกเหนือ 2 ชื่อ (`and N others`) | 09 §9 |
| `ago` / `grp` | string / enum | time label + bucket `Today`/`Yesterday`/`Last 7 days`/`Earlier` | 09 §9 |
| `unread` | bool | row highlight + badge Σ cap `99+` | 09 §9 |
| `pid` / `thumb` | ref→Post / image | post ref — like/comment/watch | 09 §9 |
| `text` | string? | comment excerpt | 09 §9 |
| `name` / `price` | string / money | watch rows: alert name + seller + asking | 09 §9 |
| `kind` | enum | system subtype: `security` / `account` / `announce` (DEC-43) | 09 §9 |
| `dest` | string | system destination route (`change_pwd`/`about_account`/`about_app`/`al_unavail`; ว่าง → `settings`) | 09 §9 |
| `title` / `body` | localized | `{en,th}` — system rows | 09 §9 |

- Category filter map: `system`→ระบบ, `watch`→Watch Alert, `like`/`comment`/`follow`→กิจกรรม (09 §9)
- Toggle settings map: `likes`→`like`, `comments`→`comment`, `follows`→`follow`, `walerts`→`watch`; `system` ไม่มี toggle (ส่งเสมอ); OFF = หยุดสร้างใหม่เท่านั้น (09 §9, 13 §9)
- Destinations: like/comment → Post Viewer โพสต์ตัวเอง; watch → Post Viewer โพสต์ที่ match; follow → `profile:{u}`; โพสต์หาย → `al_unavail` (09 §9)

### 3.18 E-18 Watch Alert (`WATCH_ALERTS`)

Source: `10 §9` (canonical), `03 §9`, `05 §9`

| Field | Type | Constraints / Notes | Ref |
|---|---|---|---|
| `id` | string | `wa{n}` | 10 §9 |
| `name` | string | auto `waName` (`Brand Model · Reference` → `"keyword"` → 2 criteria แรก → `Any new listing`); editable; ว่างตอน save → regen (ไม่ block) | 10 §9 |
| `source` | enum | `search` / `detail` — กำหนด `sr-wa` bell state | 10 §9 |
| `criteria[]` | array | snapshot `{l=label, v=value, fk?=filter key, min?/max?}` — **แก้ใน sheet ไม่ได้** เปลี่ยน = สร้างใหม่ | 10 §9 |
| `matchMode` | enum | `all`/`any`/`model`; `any`/`model` disabled เมื่อ criteria ว่าง | 10 §9 |
| `modelKey` | string? | `brand\|model\|ref` lowercase — เฉพาะ detail-created; ขับ `mf-btn` `Following this model` | 10 §9, 05 §9 |
| `on` | bool | pause → ไม่ match/ไม่นับ; row `.wa-off` | 10 §9 |

- Criteria fk semantics (`critMatch`): `brand`/`ref`/`year`/`cond`/`csz` = eq; `model`/`move`/`dial` = includes; `strap` = includes บน concat; `deliv` = `delivMatch` regex; `price` = range; `q` = matchQuery; no-fk = eq ตาม label (10 §9)
- Dedupe: `waSig(criteria)` ซ้ำ → เปิด edit เดิม; +`matchMode` ซ้ำตอน save → `You already saved this alert` (10 §9)
- Match pool = `Sale` เท่านั้น (contract; prototype `salePosts()` ไม่ filter `pfkind` → leak — documented defect) (10 §9)
- Match → `watch` notification row → Post Viewer ตรง; self-match ไม่ exclude (lock 2026-10-29); delete account → alerts ยกเลิกถาวร ไม่กลับหลัง restore (10 §9/§12, 13 §9)
- Production contract: option criteria match relation id; `is_active=false` dependency → หยุด trigger ใหม่ + warning; backfill re-match dedup `(alert_id, asset_id)` (10 §9)

### 3.19 E-19 Search State / Recent Search / Filter

Source: `03 §9` (canonical)

**SearchState** (session memory — `scr._search`): `mode` (`landing`/`typing`/`results`), `q`, `tab` (`foryou`/`profiles`/`tags`), `sort` (`"new"` dead), `err` (contract, ไม่มี trigger), `recents` (≤8), `f` (applied), `fDraft` (clone ตอนเปิด `sfilter` — Apply commit / back ทิ้ง)

**RecentSearch**: `{kind: "kw"|"seller", value}` — dedupe case-insensitive ตาม (kind,value), cap 8, ใหม่ขึ้นหัว; persist บนเครื่องข้ามเปิดแอป + ล้างตอน sign out/session change (DEC-22); row X ลบรายตัว `Clear all` ล้างหมด

**SearchFilter** (`S.f` — 11 sections, ทุก option `(N)` จาก `salePosts()`):

| Key | Source | Match | Ref |
|---|---|---|---|
| `brand[]` | `SEARCH_BRANDS` | `specOf(p,"Brand")` eq | 03 §9 |
| `model[]` | models ของ brand ที่เลือก (dependent prune) | `specOf(p,"Model")` contains | 03 §9 |
| `pmin`/`pmax` | typed | `priceNum` range; ≤2,000,000 | 03 §9/§11 |
| `year[]` | unique spec `Year` จาก salePosts | eq | 03 §9 |
| `ref[]` | unique spec `Reference` | eq | 03 §9 |
| `cond[]` | `SEARCH_COND` | `specOf(p,"Condition")` eq | 03 §9 |
| `csz[]` | `SEARCH_CASE` | `Case Diameter` eq | 03 §9 |
| `move[]` | `SEARCH_MOVE` | `Movement Type` contains | 03 §9 |
| `dial[]` | `SEARCH_DIAL` | `Dial Color` contains | 03 §9 |
| `strap[]` | `SEARCH_STRAP` | `Strap/Bracelet Material`+`Strap Material` contains | 03 §9 |
| `deliv[]` | `SEARCH_DELIV` | regex `Box & Papers`+chips | 03 §9 |

- AND logic ข้าม sections; ไม่มี sort UI / result count / pagination ใน V1 (03 §9/§16)
- Contract: Brand/Model/Reference จาก Market Data; ที่เหลือ option master `is_active=true`; `no current listing` (N=0 เลือกได้) ≠ `inactive` (ไม่แสดง) (03 §9 Filter Visibility Rule)

### 3.20 E-20 Board Article (`BOARD`)

Source: `12 §8` (canonical — mock, production = CMS/API)

| Field | Type | Constraints / Notes | Ref |
|---|---|---|---|
| `id` | string | `b{n}` — `boardart:{id}` route | 12 §8 |
| `cat` | string (EN) | category tag — กว้างกว่า pill options (substring match บน cat+title สำหรับ filter) | 12 §8 |
| `title` / `sub` | string | hero/card/detail; sub fallback title | 12 §8 |
| `img` | path | hero/card/detail cover | 12 §8 |
| `min` | int | `{n} min read` | 12 §8 |
| `ago` / `date` | string | meta + detail author row (TH → พ.ศ.) | 12 §8 |
| `likes` / `liked` | int / bool | per-user like (DEC-25 — ข้ามเครื่อง); 1 user = 1 like/article; ไม่ใช่ post like | 12 §8/§12 |
| `feat` | int 1–5? | hero slide order — absent = Latest list | 12 §8 |
| `author` | string | injected `Tuk Daeng Editorial` — detail แสดง `Tuk Daeng` hardcode | 12 §8 |
| `saved` | bool (injected) | **dead-path** — entry ไม่มีใน V1 (D11) | 12 §8/§19 |

Module state: `bdQ` (search query, persist session), `bdFilterCat` (`All` default, persist ข้ามเปิดใหม่); `BD_CATEGORIES` 7 pills (ไม่ใช่ strict enum), `BD_POPULAR_TAGS` 6 chips (12 §8)

### 3.21 E-21 Account Deletion Request

Source: `13 §9 Delete Account Rule` (canonical), `00G §12`, `01 §9`

| Field | Type | Constraints / Notes | Ref |
|---|---|---|---|
| `reason` | enum | required radio — `not_using` / `privacy` / `notifications` / `second_account` / `trouble` / `other` (TH+EN labels ตาม 13 §9); ไม่เลือก → inline error | 13 §9 |
| `feedback` | string? | optional textarea | 13 §9 |
| `passwordConfirm` | string (secret) | current password ถูกต้อง — เช็ก credential เดียวกับ Change Password | 13 §9 |
| `requestedAt` | datetime | deactivate ทันที (soft delete) + revoke session + ลบ credential persist | 13 §9, 01 §9 |
| `deleteAt` | date | `requestedAt + 30 วัน` — แสดงใน scheduled dialog | 13 §9 |
| `graceDays` | const 30 | grace period — sign in สำเร็จ = cancel + restore (S-02 login-to-restore) | 13 §9, 00G §12 |
| `restoreBlocked` | bool | admin ปฏิเสธคืนบัญชี → self-restore ถูก block → support state (BO-13 §10.2 contract) | 13 §9/§12 |
| `watchAlertsCancelled` | bool | WA ยกเลิกตอน deactivate — **ไม่กลับ** หลัง restore | 13 §9 |
| `erasureScope` | — | user-facing: personal data, chat history, watch alerts, posts — hard delete/anonymization ตาม policy; retained records (reports/audit) = server-side retention ไม่อยู่ใน copy | 13 §9 Retention |
| `failureState` | — | API fail → ไม่ sign out / ไม่ revoke / ไม่ล้าง credential + error retry (contract) | 13 §9/§12 |

### 3.22 E-22 Settings Preferences

Source: `13 §9` (canonical)

| Setting | Type | Constraints / Notes | Ref |
|---|---|---|---|
| `language` | enum | `en`/`th` — persist device (`fo_lang`, default `en`); display-layer swap ไม่แปล user text | 13 §9 |
| `theme` | enum | `light`/`dark` — persist device (`fo_theme`, default `dark`) | 13 §9 |
| `notif.likes` / `notif.comments` / `notif.follows` / `notif.walerts` | bool | default ON; auto-save; map 1:1 alert types (E-17) | 13 §9, 09 §9 |
| `prefs.sensitive` | enum | `less`/`standard` (default `standard`) | 13 §9 |
| `prefs.snooze` | bool | snooze suggested posts (ดู E-14) | 13 §9, 02 §9 |
| `favorites` / `muted` / `blocked` lists | array<ref→User> | What-you-see pages + counts; semantics E-12/E-13 | 13 §9 |
| `interested` / `ni` lists | array<ref→Post> | liked posts / not-interested posts + Restore | 13 §9 |
| `chatcfg` | object | ดู E-16 ChatConfig | 07 §9 |
| Contact fields (Phone/LINE/Email Display) | — | **contract-only** — prototype ไม่มี UI; email read-only หลัง verify | 13 §9 |

### 3.23 E-23 Support Channel (BO-driven contract)

Source: `13 §9 Help Rule`, `16 §7` — entity จริงเป็นเจ้าของ BO Support Center (Part B)

| Field | Type | Notes | Ref |
|---|---|---|---|
| `type` | enum | `LINE` / `Phone` / `Email` / `Facebook` / `Website` → interaction ต่างกัน | 13 §9 |
| `value` | string | handle/number/address/URL | 13 §9 |
| `description` | localized | ตามภาษาผู้ใช้ | 13 §9 |
| `availability` / `businessHours` | localized | seed `09:00 - 22:00 (GMT+7)` | 13 §9 |
| `active` | bool | render เฉพาะ Active; ไม่มี → empty state | 13 §9 |

### 3.24 E-24 Legal Document / Policy Version

Source: `00G §8`, `13 §9`

| Field | Type | Notes | Ref |
|---|---|---|---|
| `doc` | enum | `Terms of Use` / `Privacy Policy` — legal viewer ในแอป | 00G §8 |
| `version` | string | แสดงบน legal viewer + re-consent rows; bump → re-consent trigger (compare กับ consent record ล่าสุด — contract backend) | 00G §8 |
| `effectiveDate` | date | แสดงบน viewer | 00G §8 |
| `content` | localized text | prototype = placeholder EN + TH display-layer; production = legal text จริง (DEC-29 draft TH รอเนื้อหา) | 00G §8, 13 §9 |

### 3.25 E-25 Market Price / Valuation source (contract)

Source: `14 §8.3/§9`, `16 §7`

| Field | Type | Notes | Ref |
|---|---|---|---|
| `asset.market` | money? | `null` = ไม่มี market data — record จาก composer = `null` เสมอ | 14 §8.1 |
| `lastUpdate` | date | `PF_MKT_UPDATED` (mock fixed) — `Last price update` | 14 §8.3 |
| `source` | enum | `PFO_SRC`: `mkt` (Latest market price) / `fb` (Purchase price estimate) / `none` (No market price) | 14 §8.3/§9.2 |
| `comparison` | enum | `PFO_CMP`: `above`/`at`/`below` — ±1% dead band บน asking vs market | 14 §9.5 |
| `provider` | — | Watch Price API — unavailable → fallback purchase → No Valuation; ไม่ทำให้ portfolio ล่ม | 16 §7 |

## 4. Viewer-level Flag Matrix (`POST_FLAG_KEYS`)

Source: `11 §8` — flags ที่ reset/restore ตาม session; **ไม่ reset**: `likes`/`views`/`comments` counts, `savedAt`/`colAt` stamps, `pfkind` (quirk D7/D9)

| Flag | Scope | Feed effect | Persist | Ref |
|---|---|---|---|---|
| `liked` | per post/viewer | sync like buttons | server-backed (member) | 11 §9 |
| `saved` + `savedCols[]` | per post/viewer | — | server-backed | 11 §12 |
| `wishlisted` + `wlCols[]` | per post/viewer | — | server-backed | 11 §13 |
| `following` | per seller | Following tab | server-backed (`fo_pfstate`) | 11 §14 |
| `favorite` | per seller | Favorites tab | server-backed | 11 §14 |
| `muted` | per seller | ออก feed ทุก tab | server-backed | 11 §14 |
| `ni` | per post | ออก feed หลัง re-render | server-backed | 02 §9 |
| `blocked` | per user pair | ออก feed/search/WA | server-backed | 00G §13 |
| `archived` + `archivedAt` | owner per post | ออก feed+grid+tiles | server-backed | 02 §9 |
| `pins[tab]` | owner per post/tab | pin-first บน grid | server-backed | 02 §9 |
| `noComments` / `hideCounts` / `audience` | post flags | display semantics | post data | 02 §9 |
| `modelFollowing` | derived | bell sync จาก ON alert | derived — ไม่ persist | 10 §9 |

## 5. Cross-module Relationship Summary

```text
User ──< Post (seller) ──0..1── Asset (assetId, pfkind mirror)
 │         │                       │
 │         ├──< Comment ──< Reply (one-level)      Asset → PF_SOLD (mark as sold; posts → sold)
 │         ├──< Report (target post/user/comment)
 │         └── viewer flags: liked/savedCols/wlCols/ni (×N users)
 │
 ├──< WatchAlert ──match──> Post (Sale only; modelKey = brand|model|ref)
 ├──< ChatThread (1 per user pair) ── item snapshot + m.pid → Post
 ├──< Notification (like/comment/follow/watch/system)
 ├──< Collection (Saved) / (WishList) ──< Post (savedCols/wlCols multi)
 ├──< RecentSearch, SearchFilter (session/device)
 ├── User—User: follow / favorite / mute / block / removedFollower
 ├──< AccountDeletionRequest (grace 30d → hard delete; WA cancelled)
 └──< ConsentRecord, Settings prefs, ChatConfig
BoardArticle (standalone — own liked/saved flags; share sheet เดียวกับ post)
```

## 6. Findings (บันทึกเท่านั้น — ไม่แก้ spec)

| # | Finding | Spec refs | ผลกระทบ dictionary |
|---|---|---|---|
| F-01 | ~~AC-SEARCH-011 ระบุ results grid = `salePosts()` (มี price เท่านั้น) ขัดกับ §9 Results Eligibility Rule + 00G §10 ที่อนุมัติ `discoverablePosts()`~~ **RESOLVED 2026-11-05** — แก้ AC text ให้ตรง `discoverablePosts()` (post+sale) ตามอนุมัติพี่มาเต็ม | 03 §16 vs 03 §9, 00G §10 | Dictionary ยึด §9 canonical; match/count ยัง `salePosts()` |
| F-02 | ~~AC-GLOBAL-002/003 ระบุ Search+Public Profile แสดงเฉพาะ `Sale`(+`Show`) ไม่แสดง `post` ขัดกับ 00G §10 matrix~~ **RESOLVED 2026-11-05** — แก้ทั้งสอง AC ให้ตรง matrix ตามอนุมัติพี่มาเต็ม | 00G §18 vs 00G §10, 06 §9 | Dictionary ยึด §10 matrix |
| F-03 | Post delete ทิ้ง drawer record orphan (`assetId` dangling; `PF_MINE` delete no-op; `PF_MINE`→`sale` ไม่เข้า feed) — deviation ที่ spec บันทึก; contract = ลบออกทั้งคู่ | 04 §9 Delete Rule | E-06/E-07 relation note; implementation ต้องตาม contract |
| F-04 | `salePosts()` ไม่ filter `pfkind` → priced `hide`/`sold` รั่วเข้า search/WA match count (S-10 defect) — documented defect ทุกเล่ม | 03 §9, 04 §9, 10 §9, 00G §10 | E-18 match pool note — canonical = Sale เท่านั้น |
| F-05 | `pfKind()` fallback infer `sale`/`show` จาก price เมื่อ post ไม่มี `pfkind` (seed/gfx) — field ไม่ครบใน seed data | 04 §9, 05 §9 | E-06 `pfkind` จำเป็นต้องมีบน production data |
| F-06 | `PF_FLAG_KEYS` ไม่ครอบ `pfkind`/`savedAt`/`colAt`/`likes`/`views`/`comments` + `PF_ASSETS`/`PF_SOLD`/`PF_MINE` ไม่อยู่ใน session clear — values ค้างข้าม session (deviation class เดียวกัน 11 D7 / 14 D9) | 11 §8, 14 §8.4 | §4 matrix note — production ต้องกำหนด reset semantics ชัด |
| F-07 | Board article `saved` flag เป็น injected dead-path (ไม่มี save entry) แต่ `[data-bdsave]` ยังอยู่ใน gate list — model มี field แต่ไม่มี flow | 12 §8/§19 D11 | E-20 mark dead-path — production ตัดสินใจทิ้งหรือเปิด |
| F-08 | ~~Chat thread key: §9 model text + AC-CHAT-003 เดิมเขียน `{user, item.id}`/seller เดิมคนละ item = ห้องใหม่ ขัด FO-TEST-12 lock (per-user ห้องเดียว)~~ **RESOLVED 2026-11-05** — แก้ทั้ง §9 + AC-CHAT-003 เป็น `user` ห้องเดียวต่อ account ตามอนุมัติพี่มาเต็ม | 07 §9/§16 vs deviations #1 | Dictionary ยึด per-user (FO-TEST-12 lock) |
| F-09 | `audience` field เก็บแต่ไม่ enforce + asset mode `Show`/`Hide` hardcode `public`/`false` — flag มี UI แต่ไม่มี effect | 02 §9, 04 §9 | E-06 mark stored-not-enforced (contract) |
| F-10 | Report ไม่มี entity record structure ใน FO spec (reason-only + anonymous; queue/moderation = BO) — FO ไม่มี report id/status/history model | 15 §6, 00G §13 | E-15 เป็น action model ไม่ใช่ stored record — record structure อยู่ Part B |

## 7. Out-of-scope / Deferred entities (ไม่มีใน FO V1)

| Entity | สถานะ | Ref |
|---|---|---|
| Offer / price negotiation | **ถอดออกจาก baseline** — ไม่มี entity/card/notification/flow (FSP-006/007) | PRODUCT_DEFINITION, 07 §9 |
| Consignment | copy-only + `own` flag — ไม่มี entity/flow (DEC-50, S-25) | PRODUCT_DEFINITION |
| Option-master relation id / spec_options / `ระบุเอง` promotion / market-data autocomplete | contract/future — V1 = free-text specs | 04 §9/§18, 10 §9, 03 §18 |
| Payment / escrow / transaction | Phase 2 | 16 §5 |
| Account linking / merge / 2FA / passkey / biometric / device mgmt | future | 01 §18 |
| Buyer/Contact/Payment/Attachment บน sale record | ตัดออก (D3) | 14 §8.2 |
| Full-text report details / per-type reason sets | spec เดิม — live stack = reason-only PM_REASONS | 15 §20 D3 |
| Comment multi-level nesting | IG one-level เท่านั้น | 00G §15 |
| Notification retention/cleanup + real-time push model | contract | 09 §9/§14 |
| Restrict feature | banner hint เท่านั้น ไม่มีใน V1 | 06 §9 |
