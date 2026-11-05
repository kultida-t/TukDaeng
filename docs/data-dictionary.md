# Data Dictionary — TukDaeng

| รายการ | ข้อมูล |
|---|---|
| Version | 0.2 (Part A FO + Part B BO draft) |
| Date | 2026-11-05 · Asia/Bangkok |
| Task | BAC-003 [`f79ccc40`] + BAC-004 [`3d96c18c`] — Mission `0e19c244` Objective: Data Dictionary & ERD / Feature: Data Dictionary |
| Status | **DRAFT — รอ review** (entity inventory + field dictionary ครบ FO+BO — รอพี่มาเต็มตรวจ) |
| Source of truth | `FrontOffice/` + `BackOffice/` module specs — ทุกจุดในเอกสารนี้อ้าง spec section |

## 0. วิธีอ่านเอกสารนี้

- รูปแบบอ้างอิงเหมือน `business-process-flows.md`: `NN §X` = `FrontOffice/NN_*_MODULE.md` section X; `BO-NN §X` = `BackOffice/`; `00G` = `00_GLOBAL_RULES_MODULE.md`; `00NAV` = `00_NAVIGATION_AND_CROSS_MODULE_FLOW.md`
- ป้าย `(contract)` = spec contract สำหรับ production ที่ prototype ไม่ครอบ — spec เจ้าของ mark ไว้เอง
- ป้าย `(deviation)` = พฤติกรรม prototype ที่ spec บันทึกเป็น deviation — documented, ไม่ใช่ canonical
- Type ที่ใช้: `string`, `int`, `money` (THB จำนวนเต็ม แสดง `฿` + comma), `bool`, `enum`, `date` (ISO `YYYY-MM-DD`), `datetime`, `ref` (pointer ไป entity อื่น), `array<T>`, `localized` (`{en,th}` pair)
- Part A = entities ที่ FO spec เป็นเจ้าของเท่านั้น (E-01..E-25); Part B = entities ที่ BO spec เป็นเจ้าของ (BE-01..BE-27, §8–13) — entity ที่ต่อกันอ้างข้าม Part (เช่น report record ต่อ E-15, watch alert ต่อ E-18) แทนเขียนซ้ำ
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

---

# Part B — Back Office (BO)

## 8. Entity Inventory (BO)

| ID | Entity | โมดูลเจ้าของ (BO-) | Kind | Detail |
|---|---|---|---|---|
| BE-01 | Admin Account | 01, 16 | core | §B10.1 |
| BE-02 | Admin Invitation | 01, 16 | core (sensitive) | §B10.2 |
| BE-03 | Admin Session & Lockout | 01, 16 | system | §B10.3 |
| BE-04 | Role / Permission | 16 | reference | §B10.4 |
| BE-05 | User (BO admin view) | 03 | core — ต่อ E-01 | §B10.5 |
| BE-06 | Report Case | 00G, 03, 04 | core — ต่อ E-15 | §B10.6 |
| BE-07 | Asset (BO view + option relations) | 04, 17 | core — ต่อ E-07 | §B10.7 |
| BE-08 | Comment (BO moderation view) | 04 | core — ต่อ E-10 | §B10.8 |
| BE-09 | Article | 05 | core (CMS) — ต่อ E-20 | §B10.9 |
| BE-10 | Category | 05 | reference | §B10.10 |
| BE-11 | Market Data: Brand / Model / Reference | 06 | reference | §B10.11 |
| BE-12 | Price Index | 06 | reference — ต่อ E-25 | §B10.12 |
| BE-13 | Provider Sync Job | 06 | system | §B10.13 |
| BE-14 | Directory Item / Category | 07 | reference (postponed) | §B10.14 |
| BE-15 | Audit Event | 08, 00G | system | §B10.15 |
| BE-16 | Watch Alert (BO view) + Trigger | 11 | core — ต่อ E-18 | §B10.16 |
| BE-17 | Policy / Policy Version | 12 | reference — ต่อ E-24 | §B10.17 |
| BE-18 | Support Center | 12 | reference — ต่อ E-23 | §B10.18 |
| BE-19 | Account Deletion Request (BO lifecycle) | 13 | core — ต่อ E-21 | §B10.19 |
| BE-20 | Delivery Log | 14, 16 | system | §B10.20 |
| BE-21 | Broadcast Notification | 14 | core (Phase 2/future) | §B10.21 |
| BE-22 | Notification Template | 14 | reference (Phase 2/future) | §B10.22 |
| BE-23 | Option Group (`spec_option_groups`) | 17 | reference | §B10.23 |
| BE-24 | Option (`spec_options`) | 17 | reference | §B10.24 |
| BE-25 | Spec Option Audit (`spec_option_audit`) | 17 | system | §B10.25 |
| BE-26 | Spec Option Suggestion | 17 | core | §B10.26 |
| BE-27 | Spec Option Alias | 17 | reference | §B10.27 |

Sub-records ที่ไม่แยกเป็น BE: Account Status History row (อยู่ใน BE-05), Asset Status History row (อยู่ใน BE-07), Admin Action History row (อยู่ใน BE-06/BE-19/BE-01 detail), User Action History row (อยู่ใน BE-16), Matched Asset row + Trigger record (อยู่ใน BE-16), Deletion Timeline step (อยู่ใน BE-19) — เป็น read-model ของ audit/lifecycle ไม่ใช่ entity อิสระ

## 9. BO Shared Conventions

### 9.1 ID / Ref patterns (BO-owned)

| Pattern | ใช้กับ | Ref |
|---|---|---|
| `ADM-xxx` | Admin Account id (list `ADM-001..010`, master `ADM-010`) | BO-16 §8.2 |
| `INV-xxxxx` | Admin Invitation id — immutable, ห้าม reuse | BO-01 §10.1 |
| `ROL-xxx` | Role id (System + Custom) | BO-16 §9.9/§9.11 |
| `U-xxxx` | User id (recipient/target reference) | BO-16 §16.1 |
| `AST-` | Asset reference — asset-linked post report ใช้ ref เดียวกัน | BO-00G §11, BO-04 §15 |
| `POST-` | post-only report reference (kind `post` ไม่ผูก asset) | BO-00G §11 |
| `RPU-` / `RPO-` / `RCO-` | report case prefix ตาม target type — `RPU-` reported user, `RPO-` reported post, `RCO-` reported comment (decided FB-03; `RPU-560`/`RCO-` มีตัวอย่างใน spec อยู่แล้ว) | BO-16 §16.1, BO-08 §10 |
| `DEL-xxx` | Account Deletion Request id (`DEL-033`) | BO-13 §7 |
| `AUD-xxxxx` | Audit Event id — jump link จาก History & Actions | BO-08 §10, BO-16 §8.3 |
| `WAL-XXXX` | Watch Alert id ฝั่ง BO (ต่อ `wa{n}` ของ FO) | BO-11 §7 |
| `DLV-ACCT-<admin-seq>-INV-<attempt-seq>` | invitation email delivery id — attempt seq เพิ่มต่อ target, ห้าม reuse | BO-01 §10.1, BO-16 §16.3 |
| `DLV-DEL-<req>-<event>` | deletion lifecycle email (`REQ`/`GR7`/`GR3`/`RES`/`REJ`/`DEL`) | BO-14 §9.3 |
| `DLV-WA-xxx` | Watch Alert delivery id | BO-11 §12, BO-16 §16.1 |
| `DLV-ACCT-xxx` | account-status email (suspend/ban/reset) | BO-14 §9.3, BO-16 §16.6 |
| `POL-TOU` / `POL-PP` | Policy id — stable, ห้ามเปลี่ยน, fixed 2 types Phase 1 | BO-12 §10 |
| `CAT-###` | Category id (auto-generated) | BO-05 §12 |
| `ART-` | Article reference (audit jump → Article Detail) | BO-08 §10 |
| `JOB-*` | Sync Job id (`JOB-BRAND-LIST` ฯลฯ) | BO-06 §12 |
| `OG-xxx` | Option Group id (`group_id` sequence) | BO-17 §6/§17.1 |
| `OPT-xxx` | Option id (`spec_options.id`) | BO-17 §7/§17.2 |
| `ROLE-HIST-*` | prototype Role history reference เท่านั้น — production resolve ไป immutable audit event/correlation | BO-16 §9.8 |

Report ref เป็น **frozen identifier ตอน intake** ตาม link state ณ เวลารายงาน — `POST-` ไม่เปลี่ยนเป็น `AST-` ย้อนหลังเมื่อโพสต์ถูกผูก asset ภายหลัง; detail join current state เสมอ (BO-00G §11, BO-04 §15)

### 9.2 Status contracts (canonical)

- User status: `Pending Verification` / `Active` / `Suspended` / `Banned` / `Deletion Requested` / `Deleted` — `Deleted` เป็น read-back state ไม่มี direct delete action; `Guest` ไม่ใช่ status (BO-03 §9, BO-00G §10.1)
- Admin status: `Invited` / `Active` / `Locked` / `Suspended` / `Archived` (BO-01 §10, BO-16 §8.1)
- Invitation status: `Pending` / `Used` / `Expired` / `Cancelled` / `Superseded` — `Pending` ได้สูงสุด 1 record/account; terminal records ไม่ hard delete (BO-01 §10.1)
- Asset: owner status `Sale`/`Show`/`Hide`/`Sold` + **moderation overlay** `None`/`Admin Hidden`/`Auto Hidden`/`Permanently Hidden` + system retention `ลบโดยเจ้าของ` — overlay ไม่เปลี่ยน owner status (BO-04 §9, BO-00G §10.2)
- Comment status: `Visible` / `Hidden` / `Removed` / `User Deleted` (BO-04 §18)
- Report status: `Pending` / `Closed` — Closed final ไม่ reopen (BO-03 §11, BO-04 §12/§16)
- Content status: `Draft` / `Scheduled` / `Published` / `Archived` (BO-05 §10, BO-00G §10.3); Policy version `Draft`/`Published`/`Archived` — ≤1 Published + ≤1 Draft ต่อ policy type (BO-12 §9)
- Deletion request: `รอดำเนินการ` / `คืนบัญชีแล้ว` / `ปฏิเสธคืนบัญชี` / `ลบตัวตนแล้ว` + account `Active`/`Deactivated`/`Anonymized` (BO-13 §9/§10)
- Delivery status: record `Queued`/`Sent`/`Delivered`/`Opened`/`Failed`/`Skipped`; Phase-1 UI แสดง `Sent`/`Retry` (retryable failure → Retry) (BO-14 §12, BO-16 §16.1)
- Broadcast status (Phase 2): `Draft`/`Pending Approval`/`Scheduled`/`Sending`/`Sent`/`Cancelled`/`Failed` (BO-14 §8.2)
- Role status: `active`/`inactive`; Role type `system`/`custom`; Option/Group `is_active` bool; Suggestion `pending`/`promoted`/`mapped`/`ignored`; Sync job `Completed`/`Running`/`Failed` (BO-16 §9.11, BO-17, BO-06 §12)

### 9.3 Time, masking, permission

- Timestamp store UTC, display `Asia/Bangkok` (BO-08 §5, BO-16 §11); publish/schedule เวลา `Asia/Bangkok` (BO-05 §9)
- Sensitive = masked default; reveal ต้องมี business reason + permission + audit (BO-00G §14, BO-13 §10.4) — sensitive list: user email/phone/auth id/IP/login history, provenance, purchase price/date/source, proof of payment, sale history, chat exports, deletion archive, audience exports (Phase 2)
- Permission enforcement ที่ route + API + service เสมอ — UI hiding ไม่ใช่ authorization; API permission เป็นตัวตัดสิน (BO-01 §12, BO-16 §9.6)

## 10. BO Entity Detail

### §B10.1 BE-01 Admin Account
Source: `BO-01 §10`, `BO-16 §8`

| Field | Type | Constraints / Notes | Ref |
|---|---|---|---|
| `admin_id` | string | `ADM-xxx` system generated, immutable | BO-01 §10, BO-16 §8.2 |
| `full_name` | string | required, 1–100 chars; self-edit no-op ไม่ audit | BO-01 §10, BO-16 §7 |
| `email` | string | unique login identifier; read-only self-service | BO-01 §10, BO-16 §8.6 |
| `role_id` | ref→Role | **required FK** RESTRICT; ไม่เก็บชื่อ Role/permission payload ซ้ำ (prototype เก็บชื่อ = mock) | BO-01 §10, BO-16 §9.11 |
| `status` | enum | `Invited`/`Active`/`Locked`/`Suspended`/`Archived` | BO-01 §10, BO-16 §8.1 |
| `account_revision` | int ≥1 | เพิ่มเมื่อ identity/status/Role/activation state เปลี่ยน; optimistic concurrency | BO-01 §10, BO-16 §8.9 |
| `is_master` | bool | master (`ADM-010`) — ห้าม suspend/archive/change role; Master badge | BO-16 §8.2/§8.7 |
| `last_login_at` | datetime? | `—` ถ้ายังไม่เคย login | BO-01 §10, BO-16 §8.2 |
| `created_by`/`updated_by`/`created_at`/`updated_at` | ref/datetime | audit fields | BO-01 §10 |
| invitation context (เมื่อ `Invited`) | object | `invitation_id/status`, `issued_at`, `expires_at`, `last_delivery_*`, `resend_available_at`, `resend_count_rolling_24h`, `can_resend/cancel/reissue` — server-calculated | BO-16 §8.9 |

Relationships: Admin N—1 Role; Admin 1—N Invitation (≤1 Pending); 1—N Session; 1—N AuditEvent (actor); 1—N DeliveryLog (recipient)

### §B10.2 BE-02 Admin Invitation
Source: `BO-01 §10.1` (canonical — `admin_invitations` + `admin_invitation_operations` + `delivery_outbox`)

| Field | Type | Constraints / Notes | Ref |
|---|---|---|---|
| `invitation_id` | string | `INV-xxxxx` PK immutable, ห้าม reuse | BO-01 §10.1 |
| `target_admin_id` | ref→Admin | account `Invited` ตอน issue/consume; unique partial บน `Pending` | BO-01 §10.1 |
| `target_email_normalized` | string | snapshot ตอน issue; activation ต้องตรง email ปัจจุบัน | BO-01 §10.1 |
| `role_id` + `role_revision` | ref→Role + int | snapshot ตอน issue; activation revalidate Role | BO-01 §10.1, BO-16 §9.11 |
| `token_hash` | string | keyed HMAC-SHA-256 ของ CSPRNG ≥256-bit; unique; **ห้ามเก็บ raw token** | BO-01 §10.1 |
| `token_revision` | int ≥1 | เพิ่มทุก issuance; reject stale/superseded | BO-01 §10.1 |
| `status` | enum | `Pending`→`Used`/`Expired`/`Cancelled`/`Superseded`; derive `Expired` จาก `expires_at <= now` | BO-01 §10.1 |
| `expires_at` | datetime | `issued_at + 72h` | BO-01 §10.1 |
| `issued_at`/`created_at`/`updated_at`, `issued_by_admin_id` | datetime / ref | canonical | BO-01 §10.1 |
| `cancelled_at`/`used_at`/`superseded_at` | datetime? | เฉพาะ terminal transition | BO-01 §10.1 |
| `cancelled_by_admin_id` / `superseded_by_invitation_id` | ref | required เมื่อ `Cancelled`/`Superseded` | BO-01 §10.1 |
| `issuance_idempotency_key` / `correlation_id` | string | ledger + correlation account/invitation/audit/delivery | BO-01 §10.1 |

- Resend: cooldown 60s, ≤5 successful issuances/rolling 24h; provider failure ไม่ rollback; audit/delivery ห้ามมี raw/hashed token, password, OTP, secret (BO-01 §10.1, BO-08 §7)

### §B10.3 BE-03 Admin Session & Lockout
Source: `BO-01 §8/§9/§9.1`, `BO-16 §7`

| Field / Rule | Type | Constraints | Ref |
|---|---|---|---|
| `session_id` | opaque | masked display | BO-16 §7.1 |
| `idle_timeout` / `max_session` | const | 8 ชม. / 24 ชม. | BO-01 §8 |
| `metadata` | object | browser/OS, masked IP, created/last activity, current marker | BO-01 §8.1 |
| `revoked` | bool | individual revoke = session อื่นเท่านั้น; Logout All = all-or-nothing | BO-01 §8.1 |
| `failed_attempts` | int | 5 ครั้งติด → lock 15 นาที + audit | BO-01 §9 |
| `reset_token` | opaque | 30 นาที, one-time, supersede atomic; eligible `Active`+failed-login `Locked`; reset → revoke ทุก session | BO-01 §9.1 |
| `pwd_change_attempts` | int | 5 ครั้ง → `RATE_LIMITED` audit เดียว + block 15 นาที (prototype 60s) | BO-01 §8.1, BO-16 §7.2 |
| `password` | secret | ≥12 chars + 4 char classes (BO policy ≠ FO ≥8); hash only | BO-01 §8.1, BO-16 §7.2 |

### §B10.4 BE-04 Role / Permission
Source: `BO-16 §9.11` (canonical), `§9.1–9.3`, `§9.7–9.10`

| Field | Type | Constraints / Notes | Ref |
|---|---|---|---|
| `role_id` | string | `ROL-xxx` PK immutable | BO-16 §9.11 |
| `role_key` | string | `^[a-z0-9_]+$` 1–64 unique immutable; ไม่ใช้เป็น FK | BO-16 §9.11 |
| `display_name` | string | 1–64, case-insensitive unique | BO-16 §9.11 |
| `description` | string? | ≤512, blank→null | BO-16 §9.11 |
| `role_type` | enum | `system` (8 baseline — ห้าม rename/delete/แก้/deactivate) / `custom` | BO-16 §9.1/§9.11 |
| `status` | enum | `active`/`inactive`; System ต้อง `active`; inactive → ไม่ eligible assign | BO-16 §9.11 |
| `revision` | int ≥1 | `expected_revision` guard | BO-16 §9.11 |
| `permission_set` | array<{key,level}> | ≥1 granted; level `view`/`manage`/`approve`/`admin`; Custom ห้าม `admin`; Phase-1 catalog 40 keys; absence=`none` | BO-16 §9.2/§9.11 |
| `creation_mode` | enum | `system_baseline`/`from_scratch`/`derived`/`copied`/`legacy` — UI = `from_scratch` เท่านั้น | BO-16 §9.11 |
| `source_role_id`+`source_revision` | ref→Role + int? | required เมื่อ `derived`/`copied`; pair-or-null; ห้าม cycle | BO-16 §9.11 |
| `source_provenance_status` | enum | `verified`/`not_applicable`/`legacy_unknown` | BO-16 §9.11 |
| `created/updated_*` | datetime/ref | | BO-16 §9.11 |

- Permission level 5: `none`/`view`/`manage`/`approve`/`admin`; safeguards: self/master/last-super-admin/last-role-manager/last-admin-capable/status guard/session freshness (BO-16 §9.7); audit `ADMIN_ACCOUNT_ROLE_CHANGE` full record (BO-16 §9.8)

### §B10.5 BE-05 User (BO view — ต่อ E-01)
Source: `BO-03 §7–§10`

| Field | Type | Constraints / Notes | Ref |
|---|---|---|---|
| `user_id` | string | `U-xxxx` | BO-03 §7, BO-16 §16.1 |
| `status` | enum | `Pending Verification`/`Active`/`Suspended`/`Banned`/`Deletion Requested`/`Deleted` — เปลี่ยนผ่าน action เท่านั้น | BO-03 §9, BO-00G §10.1 |
| `auth_method` | enum | `email`/`apple`/`google` — ขับ `Send Password Reset` eligibility | BO-03 §7/§10 |
| `email`/contact | string | masked default; แสดงเฉพาะที่มีจริง | BO-03 §8 |
| `last_active`/`date_joined`/`verification_state` | misc | sort/search fields | BO-03 §7 |
| `assets_count` by status / `report_count` | int | summary + latest reason/status | BO-03 §8 |
| `followers`/`following`/`profile_url` | misc | | BO-03 §8 |
| `account_status_history[]` | array | {action, timestamp, actor, reason, before/after} — รวม deletion lifecycle 4 ประเภท | BO-03 §8, BO-13 §16 |

- Actions: Send Password Reset (email+Active), Suspend, Ban, Unsuspend, Unban, Resend verification, Open Account Deletion, View deleted summary — reason+confirm+audit (BO-03 §7/§10); Suspend/Ban → revoke session + email primary (BO-00G §12)

### §B10.6 BE-06 Report Case — ต่อ E-15 (stored record)
Source: `BO-00G §11`, `BO-03 §11–12`, `BO-04 §12–20`

| Field | Type | Constraints / Notes | Ref |
|---|---|---|---|
| `report_id` | string | `RPU-`(user)/`RPO-`(post)/`RCO-`(comment) ตาม target type — decided FB-03 | BO-03 §11, BO-16 §16.1 |
| `target_type` | enum | `post`/`user`/`comment` — **post = feed post**; asset-linked→`AST-`, post-only→`POST-`; ไม่มี `article` (ตัด V1) | BO-00G §11, BO-04 §15 |
| `target_ref` | ref | frozen ณ intake; detail join current state | BO-00G §11 |
| `reason` | enum | `PM_REASONS` 9 เหตุผลชุดเดียวทุก type; reason-only ไม่มี details | BO-00G §11 |
| `reporter_count` | int | **unique reporter**; history {timestamp, reporter, status, reason} | BO-03 §11, BO-04 §14/§20 |
| `priority` | enum | `Low` 1–2 / `Medium` 3–4 / `High` ≥5 หรือ severe | BO-03 §11 |
| `status` | enum | `Pending`/`Closed` — final | BO-03 §11, BO-04 §12/§16 |
| `source` | enum | user report: `User Profile`/`Chat` (chat = thread ref เท่านั้น) | BO-03 §12, BO-00G §11 |
| `created_at`/`closed_at`/`audit_refs` | datetime/ref | | BO-04 §15 |

- Auto-hide ≥5 unique reporters บน `Sale`/`Show` → `Auto Hidden` (owner status คง + audit); `Hide`/`Sold` → ไม่ซ่อน (BO-04 §14); close ใช้ได้เฉพาะ `Pending` + asset ไม่อยู่ Admin/Auto Hidden (BO-04 §13); comment actions ตาม §19
- Post-only (`POST-`) detail แสดง post context (เนื้อหา/ผู้โพสต์/สถานะโพสต์) + **spec fields จาก Watch Spec Set ของโพสต์เมื่อมี (E-09)** — ไม่มี asset status/moderation fields เพราะไม่มี asset record ให้ join (decided FB-06)

### §B10.7 BE-07 Asset (BO view — ต่อ E-07)
Source: `BO-04 §7–§11`, `BO-17 §17.4`

| Field | Type | Constraints / Notes | Ref |
|---|---|---|---|
| `asset_id` | string | `AST-`; list เฉพาะ asset entity (ไม่รวม post-only) | BO-04 §7 |
| `owner_id`/`owner` | ref→User | + owner account status | BO-04 §8 |
| spec fields | string/ref | brand/model/ref/year/condition/delivery/case/movement/dial/strap — แสดงเฉพาะที่มีข้อมูล | BO-04 §8 |
| `owner_status` | enum | `Sale`/`Show`/`Hide`/`Sold` — **admin ห้ามเปลี่ยนโดยตรง** | BO-04 §9, BO-00G §10.2 |
| `moderation_state` | enum | `None`/`Admin Hidden`/`Auto Hidden`/`Permanently Hidden` — overlay | BO-04 §9 |
| `system_state` | enum? | `ลบโดยเจ้าของ` retention record | BO-04 §9/§11 |
| `price` | money? | read-only; `-` เมื่อไม่มี | BO-04 §8 |
| sensitive block | object | provenance, purchase price/date/from, proof, sold history — masked/readonly | BO-04 §8/§22 |
| option FKs | ref→Option? | `condition_id`(req เมื่อ `Sale`)/`case_material_id`/`movement_id`/`dial_color_id`/`strap_bracelet_type_id` + `asset_delivery_items.option_id` (group `delivery`) — deactivate ห้าม cascade | BO-17 §17.4 |
| `*_snapshot` | string | คู่ relation id; free-text → relation `null` | BO-17 §17.4, BO-06 §16 |
| `status_history[]` | array | {date/time, actor, action, status, ref(Report ID), reason/note} | BO-04 §8 |
| `comment_count`/`favorite_count`, `created_at`/`updated_at` | misc | | BO-04 §8 |

### §B10.8 BE-08 Comment (BO view — ต่อ E-10)
Source: `BO-04 §16–§21`

| Field | Type | Constraints / Notes | Ref |
|---|---|---|---|
| `comment_id` | string | `RCO-` ref | BO-04 §17, BO-08 §10 |
| `asset_id` | ref→Asset | | BO-04 §17 |
| `type` | enum | `Root comment`/`Reply` | BO-04 §17 |
| `author`/`text` | ref/string | | BO-04 §17 |
| `status` | enum | `Visible`/`Hidden`/`Removed`/`User Deleted` — overlay ไม่แก้ต้นฉบับ | BO-04 §18 |

- Hide (Visible→Hidden, report คง Pending, อีเมล) / Restore (Hidden→Visible + auto Close) / Remove (Visible|Hidden→Removed + auto Close, irreversible) / Close no violation (report→Closed เท่านั้น, ไม่ส่งอีเมล) (BO-04 §19); comment count นับเฉพาะที่เห็น (BO-04 §21)

### §B10.9 BE-09 Article — ต่อ E-20
Source: `BO-05 §7–§13` — BO เจ้าของ record (FO `BOARD` = read model)

| Field | Type | Constraints / Notes | Ref |
|---|---|---|---|
| `article_id` | string | `ART-` | BO-05 §7, BO-08 §10 |
| `title`/`slug`/`category_id`/`author` | string/ref | required; slug unique auto-gen+editable; category active only; author = admin ปัจจุบัน | BO-05 §9 |
| `status` | enum | `Draft`/`Scheduled`/`Published`/`Archived`; Scheduled ต้องไม่ย้อนหลัง | BO-05 §9/§10 |
| `publish_at` | datetime? | required เมื่อ Scheduled; `Asia/Bangkok` | BO-05 §9 |
| `cover_image`+`cover_alt`/`deck` | image/string | required cover; JPG/PNG/WebP ≤5MB, ratio 1:1–16:9 | BO-05 §9 |
| `blocks[]` | array<Block> | ≥1 non-divider; 10 types; safe-URL links | BO-05 §9 |
| `likes`/`read_time` | int | | BO-05 §8/§13 |
| `change_history[]` | array | {date/time, admin, action, detail, result} | BO-05 §8 |

### §B10.10 BE-10 Category
Source: `BO-05 §12`

| Field | Type | Constraints / Notes | Ref |
|---|---|---|---|
| `category_id` | string | `CAT-###` auto | BO-05 §12 |
| `name`/`slug` | string | required, unique; slug lowercase-hyphen auto-fill; name map FO `cat` tag | BO-05 §12 |
| `description` | string? | | BO-05 §12 |
| `status` | enum | `Active`/`Inactive`; deactivate block เมื่อมี linked articles | BO-05 §12 |
| `display_order`/`article_count`/`updated_at` | int/datetime | reorder modal active only; count guard >0 | BO-05 §12 |

### §B10.11 BE-11 Market Data: Brand / Model / Reference
Source: `BO-06 §14–§16`

| Entity | Required fields | Ref |
|---|---|---|
| Watch Brand | brand_id, name, aliases?, provider key, is_active, model_count, reference_count, last_sync, quality/mapping status | BO-06 §15.1 |
| Watch Model | model_id, brand ref, name, reference_count, movement summary, case summary?, provider key, is_active, last_sync | BO-06 §15.2 |
| Reference | reference_id, brand ref, model ref **nullable**, ref no., prod year/range, case material/size, movement, description, est. price, last updated, provider key, mapping status | BO-06 §14/§15.3 |

- Provider = The Watch API; FO อ่าน internal cache เท่านั้น; provider trace (name/key/endpoint/params/synced_at) (BO-06 §14); `is_active=false` → หาย FO selector คง relation; `no current listing` ≠ inactive (BO-06 §16, BO-11 §10.1); asset เลือก match → relation id + snapshot, free-text → `null` (BO-06 §16)

### §B10.12 BE-12 Price Index — ต่อ E-25
Source: `BO-06 §14/§15.4`

| Field | Type | Constraints | Ref |
|---|---|---|---|
| `price_index_id`/`source_level` | string/enum | PK; level Brand/Model/Reference + ref | BO-06 §15.4 |
| `source_currency`/`source_price` | enum/money | provider currency | BO-06 §14 |
| `converted_price_thb`/`fx_rate`/`fx_rate_date` | money/decimal/date | non-THB ต้องมี conversion metadata | BO-06 §14/§17 |
| `provider_updated_at`/`synced_at`/`effective_at`/`quality_status` | datetime/enum | | BO-06 §14/§15.4 |

### §B10.13 BE-13 Provider Sync Job
Source: `BO-06 §12–13/§18`

| Field | Type | Constraints | Ref |
|---|---|---|---|
| `job_id`/`name`/`endpoint`/`params`/`scope` | string/enum | `JOB-*`; scope: brand/model/ref lists, price, enrich | BO-06 §12/§18 |
| `status` | enum | `Completed`/`Running`/`Failed` — failed ไม่ replace cache | BO-06 §12/§13 |
| `started_at`/`duration`/`result_count`/`error_code`/`retry_count`/`cache_impact` | misc | error เช่น `too_many_results` | BO-06 §13/§18 |
| `timeline[]` | array | fetch→normalize→cache→refresh dependent | BO-06 §13 |

### §B10.14 BE-14 Directory Item / Category (postponed)
Source: `BO-07 §6–§8` — **postponed Phase 1**

| Entity | Fields | Ref |
|---|---|---|
| Directory Category | category_id, name_th/en, slug, description, active, display_order — baseline 7 | BO-07 §6 |
| Directory Item | name_th(req), category(req), status `Draft`/`Active`/`Inactive`/`Archived`(req) + optional: name_en, address/province/district/postal, phone, line_id, email, website, facebook, instagram, logo, cover ≤5, description, opening_hours, lat/long, tags, display_order, internal_note | BO-07 §7/§8 |

- ห้าม hard delete record ที่เคยเป็น FK — Inactive/Archived (BO-07 §8); consignment binding ตัดออก (BO-DIR-DEC-003)

### §B10.15 BE-15 Audit Event
Source: `BO-08 §5–§8`, `BO-00G §13`

| Field | Type | Constraints / Notes | Ref |
|---|---|---|---|
| `audit_id` | string | `AUD-xxxxx` unique immutable | BO-08 §5 |
| `timestamp` | datetime | store UTC, display Asia/Bangkok | BO-08 §5 |
| `actor_type`/`actor_id`/`actor_access` | enum/ref | `Admin`/`System`/`ProviderJob` + access ณ เวลา action | BO-08 §5 |
| `action_type` | enum | `ADMIN_*`/`ASSET_*`/`COMMENT_*`/`REPORT_*`/`POLICY_*`/`ACCOUNT_DELETION_*`/`ROLE_*`/`GROUP_*`/`OPTION_*`/`WATCH_ALERT_*`/`SUPPORT_CENTER_UPDATE` | BO-08 §7 |
| `target_entity_type`/`target_entity_id` | enum/string | ตาม §6 baseline types | BO-08 §5/§6 |
| `module`/`risk` | enum | module badge; `High`/`Medium`/`Low` | BO-08 §9 |
| `before_value`/`after_value` | JSON | snapshot/diff; sensitive mask | BO-08 §5 |
| `reason`/`note` | string? | required เมื่อ destructive/public-impact | BO-08 §5, BO-00G §13 |
| `result`/`error_code` | enum/string? | `Success`/`Failed`/`Partial`/`Skipped` | BO-08 §5 |
| `ip_address`/`session_id`/`request_id`/`user_agent` | string? | request context | BO-08 §5 |
| `fo_impact`/`correlation_id`/`reference` | string | correlation เชื่อม workflow + delivery; reference jump ตาม prefix | BO-08 §5/§10 |

- Immutable + retention ≥1ปี + audit write ต้องสำเร็จพร้อม mutation; ห้าม secret ใน audit (BO-08 §7/§8/§11); canonical identity events: `ADMIN_INVITATION_*`, `ADMIN_PROFILE_UPDATE` Low, `ADMIN_PASSWORD_CHANGE` High, `ADMIN_SESSION_REVOKE(_ALL)` Medium (BO-08 §7, BO-01 §10.1)

### §B10.16 BE-16 Watch Alert (BO view) + Trigger — ต่อ E-18
Source: `BO-11 §7–§12` — read-only (ไม่มี admin action)

| Field | Type | Constraints / Notes | Ref |
|---|---|---|---|
| `alert_id`/`name`/`owner` | string/ref | `WAL-XXXX`; owner = user id+name+account status read-only | BO-11 §7/§7.1 |
| `status` | enum | `Active`/`User Disabled`/`Deleted` (soft delete ยังเห็น) — ไม่มี Admin Disabled | BO-11 §8 |
| `notification` | enum | `On`/`Off` | BO-11 §7 |
| `criteria[]` | array | schema = Search Filter — option criteria match ด้วย **relation id เท่านั้น**; free-text match ได้เฉพาะ keyword บน snapshot | BO-11 §9 |
| `matches`/`triggers`/`last_triggered` | int/datetime? | `—` ถ้าไม่เคย | BO-11 §7 |
| `inactive_dependency` | bool | criteria อ้าง `is_active=false` → warning + หยุด trigger ใหม่ | BO-11 §10.1 |
| `created_at`/`updated_at`/`deleted_at` | datetime | soft delete → ไม่มี trigger ใหม่หลังลบ | BO-11 §7.1 |

Trigger record: `trigger_id`, `alert_id`, `matched_asset_id`, `asset_status` ตอน trigger, `criteria_snapshot`, `match_timestamp`, `notification_event_id?`, `delivery_status` (`Delivered`/`Skipped`/`Failed`/`Pending`), `exclusion_reason?` — แสดงเฉพาะ new matches >0 (BO-11 §11); match pool = `Sale` + visibility + block (BO-11 §10); destination = Watch Alert Result List (BO-11 §12); User Action History {timestamp, actor, action, changes, note} (BO-11 §7.1)

### §B10.17 BE-17 Policy / Policy Version — ต่อ E-24
Source: `BO-12 §7–§12.5`

| Field | Type | Constraints / Notes | Ref |
|---|---|---|---|
| `policy_id` | enum | `POL-TOU`/`POL-PP` fixed 2 types, stable id | BO-12 §10 |
| `version`/`status` | string/enum | `v{x.y}(-draft)`; `Draft`/`Published`/`Archived` — ≤1 Published + ≤1 Draft ต่อ type; publish → เดิม → Archived auto; bump → FO re-consent | BO-12 §9/§12.2 |
| `content_th`/`content_en` | HTML | ครบ 2 ภาษาก่อน publish; allowed tags `P H2 H3 UL OL LI A STRONG EM BR` | BO-12 §10/§12 |
| `change_summary` | string | required | BO-12 §12 |
| `updated_by`/`updated_at`/`published_at` | ref/datetime | | BO-12 §11/§12.3 |

### §B10.18 BE-18 Support Center — ต่อ E-23
Source: `BO-12 §13` — single form

| Field | Type | Constraints / Notes | Ref |
|---|---|---|---|
| `channels[]` | fixed array(5) | LINE/Phone/Email/Facebook/Website fixed; ต่อ channel: `active`, `value` (req เมื่อ active + format ตาม type), `description_th`/`description_en` ≤200 | BO-12 §13 |
| `business_hours` | string | required ≤80 + `HH:MM - HH:MM` | BO-12 §13 |
| `availability_th`/`availability_en` | string | required ≤120 | BO-12 §13 |
| `last_updated`/`last_editor` | datetime/ref | | BO-12 §13 |

### §B10.19 BE-19 Account Deletion Request — ต่อ E-21
Source: `BO-13 §4–§16` — FO intake สร้าง atomic (deactivate+revoke+hide+close-reports)

| Field | Type | Constraints / Notes | Ref |
|---|---|---|---|
| `request_id`/`user_id` | string/ref | `DEL-xxx`; user link ไป User Detail | BO-13 §7 |
| `request_status` | enum | `รอดำเนินการ`/`คืนบัญชีแล้ว`/`ปฏิเสธคืนบัญชี`/`ลบตัวตนแล้ว` | BO-13 §9 |
| `account_status` | enum | `Active`/`Deactivated`/`Anonymized` — แยกจาก request status | BO-13 §10 |
| `requested_at`/`grace_end` | datetime/date | `deactivated_at + 30d`; reject **ไม่เริ่มนับใหม่** | BO-13 §14 |
| `serious_flag`/`restore_blocked` | bool | reject → self-restore (sign-in) block → support state (ต่อ E-21) | BO-13 §10.2/§12 |
| `dependency`/`deletion_plan`/`timeline[]` | object | 3 tiles drill-in; Data→Action plan; timeline steps | BO-13 §12.2–12.4 |
| `history[]` | array | {วันที่เวลา, ผู้ดำเนินการ, action, ส่งอีเมล(DLV), audit(AUD), รายละเอียด} | BO-13 §12.5 |
| `cancelled_at` | datetime? | | BO-13 §12.2 |

- Restore 2 ช่องทาง (sign-in login-to-restore + admin modal); reject ซ้ำได้; `ลบตัวตนแล้ว` = system job คืนไม่ได้; re-registration อีเมลเดิม = บัญชีใหม่ (BO-13 §10.1–10.3); reason enums 4+4 (BO-13 §13.1–13.2); อีเมล lifecycle 5 จุด + reminder 7/3 วัน → BE-20 (BO-14 §9.3)

### §B10.20 BE-20 Delivery Log
Source: `BO-14 §12–13`, `BO-16 §16` — Phase 1 host = Settings > Delivery Logs (read-only)

| Field | Type | Constraints / Notes | Ref |
|---|---|---|---|
| `delivery_id` | string | `DLV-ACCT-<seq>-INV-<seq>`/`DLV-DEL-<req>-<event>`/`DLV-WA-*`/`DLV-ACCT-xxx` — immutable | BO-16 §16.1/§16.3 |
| `notification_id`/`source` | ref | source entity — **ไม่ใช้ raw token** | BO-14 §12 |
| `event`/`notification_type` | enum | invitation/account-status/deletion lifecycle/watch alert | BO-16 §16.1/§16.3 |
| `recipient` | ref | email/address mask | BO-14 §12 |
| `channel` | enum | `Email`/`Push`/`In-app`/`Push + In-app` | BO-14 §12 |
| `status` | enum | `Queued`/`Sent`/`Delivered`/`Opened`/`Failed`/`Skipped`; UI map `Sent`/`Retry` | BO-14 §12, BO-16 §16.1 |
| `failure_reason`/`retryable`/`provider` | misc | | BO-14 §12, BO-16 §16.3 |
| `destination`/`created_at`/`sent_at`/`delivered_at`/`opened_at` | misc | | BO-14 §12 |
| `priority`/`tags`/`admin_note`/`detail`/`correlation_id` | misc | correlation เชื่อม mutation+audit+outbox+delivery | BO-14 §12, BO-16 §16.2 |

- Retry = provider/outbox idempotent ไม่ใช่ admin action Phase 1; provider failure ไม่ rollback; ห้าม secret ใน record (BO-14 §12.1/§13)

### §B10.21 BE-21 Broadcast Notification (Phase 2/future)
Source: `BO-14 §8`

| Field | Type | Notes | Ref |
|---|---|---|---|
| `broadcast_id`/`title`/`body`/`image?` | string | | BO-14 §8.1/§8.3 |
| `status` | enum | `Draft`/`Pending Approval`/`Scheduled`/`Sending`/`Sent`/`Cancelled`/`Failed` | BO-14 §8.2 |
| `channel`/`target_audience`/`deep_link`/`scheduled_at` | misc | audience ห้าม Banned/Deleted/Anonymized/Deletion Requested | BO-14 §8.1/§8.4 |
| `created_by`/`approved_by`/`delivery_stats` | ref/object | | BO-14 §8.1 |

- In-app center ต้องมี master decision (BO-14 §8.5)

### §B10.22 BE-22 Notification Template (Phase 2/future)
Source: `BO-14 §10`

| Field | Type | Notes | Ref |
|---|---|---|---|
| `notification_type` | enum | Like/Comment/Follow/Watch Alert (+ lifecycle emails) | BO-14 §10 |
| `title_template`/`body_template`/`destination_pattern`/`enabled` | misc | variables allowlist ต่อ type; **ห้าม sensitive data** | BO-14 §10 |
| `updated_by`/`updated_at` | ref/datetime | | BO-14 §10 |

### §B10.23 BE-23 Option Group (`spec_option_groups`)
Source: `BO-17 §6/§17.1`

| Field | Type | Constraints / Notes | Ref |
|---|---|---|---|
| `group_id` | int | `OG-xxx` PK sequence | BO-17 §17.1 |
| `group` (key) | string | snake_case ≤64 unique, **ห้าม rename หลังใช้งาน** | BO-17 §17.1/§6.1.1 |
| `display_name_en`/`display_name_th` | string | required ≤128 unique; EN ASCII only | BO-17 §17.1/§6.1.6 |
| `description` | string? | ≤512 | BO-17 §17.1 |
| `allows_multi_select` | bool | `true` เฉพาะ `delivery`; true→false warning ไม่ตัดค่าเดิม | BO-17 §17.1/§6.1.1 |
| `is_active` | bool | deactivate block เมื่อมี asset usage; inactive → ทั้ง group หาย FO form/filter/WA ใหม่ | BO-17 §17.1/§6.1.2 |
| `is_system` | bool | `System`/`Custom` — System Option Deactivate Policy | BO-17 §6/§10.1 |
| `sort_order` | int | sequential 10,20,…; reorder active only | BO-17 §17.1/§6.1.7 |
| `created_at`/`updated_at` | datetime | | BO-17 §17.1 |

- Delete group: Inactive + no asset usage + type-to-confirm; hard delete พร้อม `GROUP_DELETE` audit (BO-17 §6.1.4); seed groups 6: condition, delivery(multi), case_material, movement, dial_color, strap_bracelet_type (BO-17 §17.1)

### §B10.24 BE-24 Option (`spec_options`)
Source: `BO-17 §7/§17.2`

| Field | Type | Constraints / Notes | Ref |
|---|---|---|---|
| `id` | int | `OPT-xxx` PK — FK target `watch_assets`/`asset_delivery_items` | BO-17 §17.2 |
| `group_id`/`option_key` | ref/string | `UNIQUE(group_id, option_key)`; snake_case ห้าม rename | BO-17 §17.2 |
| `label_en`/`label_th`/`description_en` | string | editable | BO-17 §17.2 |
| `sort_order`/`is_active`/`is_system`/`deactivated_at` | misc | `is_active=false` → หาย FO selector คง relation | BO-17 §17.2 |
| `created_by_admin_id`/`updated_by_admin_id` | ref? | NULL เมื่อ seed | BO-17 §17.2 |

### §B10.25 BE-25 Spec Option Audit (`spec_option_audit`)
Source: `BO-17 §17.3` — sync เข้า audit กลางด้วย

| Field | Type | Constraints | Ref |
|---|---|---|---|
| `id`/`actor_admin_id`/`created_at` | int/ref | | BO-17 §17.3 |
| `action_type` | enum | `OPTION_*`(6) + `GROUP_*`(6) + `OPTION_SUGGESTION_*`(3) | BO-17 §17.3 |
| `option_id`/`group_id`/`suggestion_id` | ref | option nullable (group-level); suggestion เฉพาะ SUGGESTION_* | BO-17 §17.3 |
| `before_value`/`after_value`/`reason`/`ip_address`/`session_context` | misc | GROUP_DELETE เก็บ snapshot ทั้งชุด | BO-17 §17.3 |

### §B10.26 BE-26 Spec Option Suggestion (`spec_option_suggestions`)
Source: `BO-17 §23.1/§23.3/§23.4`

| Field | Type | Constraints / Notes | Ref |
|---|---|---|---|
| `id`/`group_id` | int/ref | เฉพาะ 4 กลุ่ม `ระบุเอง` (case_material/movement/dial_color/strap) | BO-17 §23.1 |
| `submitted_text`/`normalized_text` | string | `UNIQUE(group_id, normalized_text)` dedup | BO-17 §23.1 |
| `usage_count` | int | +1 ทุก save ค่าเดิม; demand signal; **ห้าม auto-promote** | BO-17 §23.1/§23.4 |
| `status` | enum | `pending`/`promoted`/`mapped`/`ignored` — ignored ไม่ block ถาวร | BO-17 §23.1/§23.4 |
| `resolved_option_id`/`resolved_by_admin_id`/`resolved_at`/`resolution_note` | ref/datetime/string? | | BO-17 §23.1 |
| `first_submitted_at`/`last_submitted_at` | datetime | | BO-17 §23.1 |

- Write path `ระบุเอง` → match option/alias → relation id; ไม่ match → relation `null` + snapshot + upsert pool; pool ไม่แสดง FO selector จนกว่า `promoted` (BO-17 §23.3); promote/map alias → backfill relation id + re-run WA match dedup `(alert_id,asset_id)` (BO-17 §23.4)

### §B10.27 BE-27 Spec Option Alias (`spec_option_aliases`)
Source: `BO-17 §23.2`

| Field | Type | Constraints / Notes | Ref |
|---|---|---|---|
| `id`/`option_id` | int/ref | `UNIQUE(option_id, normalized_alias)` | BO-17 §23.2 |
| `alias_text`/`normalized_alias` | string | normalized unique ภายใน group | BO-17 §23.2 |
| `source` | enum | `suggestion_map`/`admin`/`seed` | BO-17 §23.2 |
| `created_by_admin_id`/`created_at` | ref?/datetime | | BO-17 §23.2 |

- Alias ไม่ใช่ option — auto-link relation id เมื่อ `ระบุเอง` ตรง; ลบ alias ไม่แก้ asset เดิม (BO-17 §23.2)

## 11. BO Cross-module Relationship Summary

```text
Role 1──< Admin Account (role_id RESTRICT) ──< Admin Invitation (≤1 Pending)
                  ├──< Admin Session ── lockout/revoke
                  └──< Audit Event (actor) / Delivery Log (recipient)
User (E-01/BE-05) ──< Asset (BE-07) ── moderation overlay + option FKs → Option (BE-24)
      │                │                    snapshot text ⊥ relation id
      │                └──< Report Case (BE-06: AST-/POST-/user/RCO-)
      │                       └── unique reporters ≥5 → Auto Hidden
      ├──< Watch Alert (BE-16) ── criteria → Option/MarketData (relation id)
      │         └──< Trigger ── match Sale assets ──> Delivery DLV-WA-*
      ├──< Deletion Request (BE-19 DEL-) ── auto close reports
      │         lifecycle emails → DLV-DEL-* ── audit ACCOUNT_DELETION_*
      └──< Audit Event (ref: U-/AST-/DEL-/ADM-/ART-/POL-/RPU-/RCO-)
Article (BE-09) ── Category (BE-10); Policy (BE-17) bump → FO re-consent (E-05)
Option Group (BE-23) 1──< Option (BE-24) ──< Alias (BE-27); Group ──< Suggestion (BE-26)
Market Data (BE-11) ──< Price Index (BE-12) ── Sync Job (BE-13)
Directory (BE-14) postponed; Broadcast (BE-21) + Template (BE-22) Phase 2
Audit Event (BE-15) ←─ ทุก write action; Delivery Log (BE-20) ←─ email/push attempts
```

## 12. BO Findings (บันทึกเท่านั้น — ไม่แก้ spec)

| # | Finding | Spec refs | ผลกระทบ dictionary |
|---|---|---|---|
| FB-01 | WA Detail §7.1 เขียน "summary tiles 5 ช่อง" (รวม Source) แต่ AC-BO-WA-002D ระบุ 4 tiles — field list กับ AC ไม่ตรง | BO-11 §7.1 vs AC-BO-WA-002D | **DECIDED + spec แก้แล้ว:** 4 tiles ตาม AC; Source (`Search`/`Model follow`) เป็น Source badge ที่ Detail Head — BO-11 §7.1 ปรับแล้ว |
| FB-02 | `spec_option_groups` DDL (§17.1) ไม่มี `is_system` column แต่ List column "System" + §10.1 policy ใช้งานอยู่ | BO-17 §17.1 vs §6/§10.1 | **DECIDED + spec แก้แล้ว:** เพิ่ม `is_system` (default `false`; seed 6 groups = `true`, group จาก Add Group = `false`) — BO-17 §17.1 แก้แล้ว |
| FB-03 | Report ID ไม่มี canonical pattern (`RPU-`/`RCO-` ปรากฏใน delivery/audit เท่านั้น) | BO-16 §16.1, BO-08 §10, BO-03 §11 | **DECIDED + spec แก้แล้ว:** per-type prefix `RPU-`(user)/`RPO-`(post)/`RCO-`(comment) — เพิ่มนิยามใน BO-00G §11 + sync §9.1/BE-06 |
| FB-04 | `Deleted` user status อยู่ใน BO-03 §9 แต่ตอนแรกเข้าใจว่าไม่อยู่ใน canonical table | BO-00G §10.1 vs BO-03 §9 | **RESOLVED — ไม่มี gap:** `Deleted` อยู่ใน §10.1 table อยู่แล้ว; เพิ่ม `Pending Verification` ลง table ให้ครบ 6 สถานะ (เดิมมีแต่ใน paragraph) |
| FB-05 | Audit target types `Banner`/`ChatRoom`/`ChatMessage`/`ExportJob`/`ImportJob`/`SystemSetting` ไม่มี module spec นิยาม entity | BO-08 §6 | **DECIDED:** คง enum เผื่อไว้เป็น audit vocabulary reservation (ห้ามตัด — append-only + future modules) — entities คง out-of-scope V1 |
| FB-06 | `POST-` report ไม่มี asset status/moderation ให้ join แต่ Report Data Model §15 กำหนด separation required — spec มี exception เองสำหรับ post-only | BO-04 §15 | **DECIDED:** post-only detail = post context + spec fields จาก Watch Spec Set เมื่อมี (E-09) — ไม่มี asset status/moderation |
| FB-07 | Delivery status UI (`Sent`/`Retry`) เป็น mapper บน provider status 6 ค่า — record ต้องเก็บ provider status จริง | BO-16 §16.1 | **DECIDED:** record เก็บ provider status 6 ค่า; UI map `Sent`/`Retry` ตอนแสดงเท่านั้น — contract note BE-20 |

## 13. BO Out-of-scope / Deferred entities

| Entity | สถานะ | Ref |
|---|---|---|
| Directory Item/Category (BE-14) | postponed Phase 1 — ห้ามเปิดเมนู/route | BO-07 exceptions, BO-DIR-DEC-001 |
| Broadcast (BE-21) + Template (BE-22) | Phase 2/future | BO-14 §8–§10 |
| Banner | audit target type เท่านั้น ไม่มี entity spec V1 | BO-08 §6 |
| ChatRoom/ChatMessage (BO) | audit type + report context เท่านั้น — ไม่มี BO chat module | BO-08 §6, BO-13 §12.3 |
| ExportJob/ImportJob/SystemSetting | audit type + policy เท่านั้น ไม่มี schema | BO-08 §6, BO-16 §12–13 |
| Support ticket | future scope — module 12 Phase 1 = Policy + Support Center | BO-13 §11 |
| Delivery retry/export actions | provider/outbox state; governed action = future | BO-14 §13, BO-16 §16.4–16.5 |
| Reported Article queue | **ถอดจาก V1** (FO-BO-001 e4); reason set 6 เหตุผลไม่มี producer | BO-00G §11 |
| Search Insights / Demand Overview / Reports-Analytics | aggregate views ไม่ใช่ entity | BO-11 §6.1/§15, BO-15 |
