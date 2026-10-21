# FSP-015a — 02_FEED Update Evidence (tabs / cards / own-post menu / archive / pin)

Date: 2026-10-21
Task: `49d032ed` — "FSP-015a อัปเดต 02_FEED — tabs/cards/own-post menu/archive/pin"
Scope: `FrontOffice/02_FEED_MODULE.md` เท่านั้น (rewrite ทั้งไฟล์) — sync ตาม `Prototypes/fo-flow/index.html` (read-only) + sign-off FSP-005 + baseline 00_GLOBAL (FSP-010) / 00_NAV (FSP-011) / 13_SETTINGS (FSP-014)
Gap source: `gap-FSP-002a-feed-search.md` (A1–A15, B1–B20, C1–C21 ส่วน feed) + `FSP-005-consolidated-gap-signoff.md`
คง boundary ไว้: เพิ่ม "## Boundary — FSP-015b Scope" block ใน §5 — composer/create flow + `insertNewPost` ยังเป็นของ FSP-015b

Prototype anchors verified: `POSTS` seed ~12751–13100; `state` defaults (`variant:"a1"`, `ft:"segment"`, `feedTab:"all"`) ~13270; `formatPostTime` ~13272; `commentsHTML` ~13595–13608; `likesSheetHTML` ~13644–13661 (+`lk-note` 13652); `shareSheetHTML` ~13663–13683; `saveSheetHTML`/`wlSheetHTML` ~13685–13735; `pmMenuHTML` ~13897–13915; `pmOwnMenuHTML` ~13920–13935; `niCardHTML` ~13966–13981; `uncomfCardHTML` ~13984–13995; `postCard` ~14008–14083; `feedContentHTML`/`feedEmptyHTML`/`setFeedTab` ~14085–14109; `setFollowing`/`setMuted`/`setFavorite`/`followedSellers`/`mutedSellers`/`favoriteSellers` ~14111–14176; `pvPostHTML` ~14420 / `pfpPostHTML` ~14485 (+`lk-n` own-count 14508); `muteDlgHTML` ~14712–14718; `archivePosts`/`archiveHTML` ~14965–14982; `CP_ME` ~15530; `applyPin`/`pinnedIn`/`PIN_MAX`/`pinFeedback` ~16604–16634; `pfSetMuted` ~16660; settings rows ~17161–17173; archive viewer tile ~22253–22260; own-menu handlers ~20479–20527; `dlg-pin-go` ~20646–20657; `dlg-mute-go` ~20676–20687; `dlg-delpost-go` ~20730–20744; ni/uncomf handlers ~20528–20645; unfollow sheet ~21859–21898; sheets handlers ~22015–22067/~22437–22539; `chatQuickAsk` ~18873–18892; photo/caption/details handlers ~22553–22640; feed nav re-tap ~21293–21300; `GUEST_GATE_SEL`/`obGate` ~22997–23012; `feedTab` reset ~22976/~23094

## 1. Sign-off decisions applied

| Decision | Applied in 02 |
| --- | --- |
| S-09 post-centric feed | §2 Objective + §4 alignment + §9 Post Model/Eligibility — feed = social post feed (`sale` + `post`), ลบ marketplace asset-list semantics ทั้งหมด |
| S-16 guest tabs ไม่ gate | §7 Guest + §9 Feed Tabs Rule + AC-FEED-007 — guest กด 3 tabs ได้ เห็น empty state; gate เฉพาะ identity actions → Member Sheet |
| D7 favorites = account-level | §4/§9 Feed Tabs/Relation Flags + AC-FEED-006/020 — Favorites tab = favorite sellers; like → Interested (Settings); ลบ like→Favorites sync เดิม |
| S-26 private like count | §7 Owner + §8 + AC-FEED-012 — `Liked by {name} and others` ไม่มีตัวเลข; `lk-note` owner-only total; `lk-n` เฉพาะ `seller === CP_ME` |
| D8 comment จาก feed ได้ | §8 + AC-FEED-016 — shared comment sheet เปิดจาก feed card ตรง ๆ ไม่บังคับผ่าน detail |
| D9 report = full-page stack | §8 others menu + AC-FEED-034 — Report เปิด report stack (15_TRUST_SAFETY); ลบ bottom-sheet report เดิม |
| S-03 share gated | §7 Guest + §8 + AC-FEED-017 — share sheet gated ทุก surface (รวม feed) — แก้ old spec "Guest share without Login" |
| AC-NAV-018 tap-to-refresh | §8 Tap-to-Refresh + AC-FEED-008 — re-tap Feed nav = re-render + scroll top; ไม่มี pull-to-refresh |
| AC-NAV-003 no FS image viewer | §5 Out + §9 Card Navigation + AC-FEED-010 — media tap = carousel เท่านั้น |
| AC-NAV-026 viewer entry | §9 Card Navigation — feed card ไม่เปิด Post Viewer (viewer = tiles/notification only); `View full detail` → Post Detail |
| D21 unfollow surface variation | §8 — card/pfp `Following` button → `Unfollow @{seller}?` sheet; ni-card `Unfollow {seller}` = instant + `Unfollowed` toast |
| S-29 contract-only | §4/§9 Network/Image/Owner-fallback/Analytics mark contract — prototype ไม่ครอบ feed error path |
| Dead variants (D4) | §3 + §9 Deviations — card `a2/b2/c2/a3/b3/c3/mixed`, `ft:"none"`, `POST_DETAIL_CFG`, `chat-fab` (`ask:"bubble"` unreachable), `lk-follow` visual-only — documented ไม่ใช่ feature |

## 2. What changed (section map)

| Section | Change |
| --- | --- |
| Header/§2 Objective | rewrite — post-centric social feed, ลบ "marketplace-only / not social" |
| §3 Prototype Reference | **ใหม่ทั้งก้อน** — anchor index + dead-variant list |
| §4 Master Alignment | rewrite — post model/eligibility/tabs/favorites/guest/comment/own-post/report/perf |
| §5 Scope | rewrite — In = tabs/cards/actions/menus/ni-loop/archive/pin/empty/guest/contract; **+Boundary FSP-015b** (composer/create/`insertNewPost`); Out = Search/Post Detail/report internals/social/chat/portfolio/WA/content-prefs internals + infinite scroll + FS viewer |
| §6 Screen Mapping | rewrite — feed surfaces + ni/uncomf cards + menus + sheets + dialogs + archive + Member Sheet |
| §7 User States | rewrite — Guest (tab access + gate list), Member, Owner (own menu/no Ask/like total), Blocked (feed exclusion rules) |
| §8 User Flow | **rewrite ทั้งก้อน** — open feed, switch tab, tap-to-refresh, photo carousel, 10 card social actions, others menu table, ni feedback loop (ni-card → uncomf → restore/mute/unfollow), own menu table, archive flow, pin flow (limit confirm), delete flow |
| §9 Business Rules | **rewrite ทั้งก้อน** — Post Model fields, Eligibility (`pfkind` ∉ show/hide/sold + ni/muted/blocked/archived), Tabs Rule (+snooze), Card Anatomy a1, Card Navigation, Own-Post Menu Rule (Edit→editor/sold→record, Mark as sold → `sell:{id}`), Archive Rule (clears pins), Pin Rule (per-tab `pins[]`, `PIN_MAX`=3, replace-oldest confirm), Relation Flags (unfollow clears fav+mute), Lifecycle table post-centric; คง Network/Image/Owner-fallback = contract (copies เดิม); +Deviations & Dead-Code Notes |
| §10–12 Permission/Validation/Exception | rewrite ให้ตรง menu/action จริง + กฎ pin/archive/sold/delete |
| §13 Empty State | rewrite — Following (`Follow others to see their posts here`), Favorites (`No favorites yet`), All fallback (prototype quirk: copy favorites → spec ใช้ `ไม่พบข้อมูล` flag deviation), Archive |
| §14 Notification | rewrite — feed ไม่สร้าง notification; WA→Post Viewer (S-08) |
| §15 Analytics | rewrite — contract event set post-centric (feed_viewed/tab/refreshed/carousel/details/profile/hashtag/like/sheets/ask/follow/menu/fav/ni/uncomf/mute/report/archive/commenting/edit/sold/pin/delete/member-sheet) |
| §16 ACs | **rewrite ทั้งชุด** — AC-FEED-001–038 (เดิมมี ~031 + sub-letters 017J–017L — renumber sequential; ไม่มี ref ข้ามเอกสารที่ต้องแก้ ดู §3) |
| §18 Future | +pull-to-refresh/infinite scroll/FS media viewer |

## 3. Cross-doc ref check (ก่อนปิดงาน)

| Check | Result |
| --- | --- |
| `AC-FEED-` refs นอก 02 | `DOCUMENT_VERSION.md` เท่านั้น — historical changelog (v1.4 `AC-FEED-017J–017L`) ไม่ใช่ live ref; renumber ปลอดภัย ✓ |
| `Global Login Required Dialog` ใน 02 | 0 — spec ใหม่ใช้ Member Sheet ตาม rename note 00_GLOBAL §11 (module อื่น sync ใน task ของตัวเอง FSP-016+) ✓ |
| Stale feed terms ใน 02 (`Hide this asset`/`Make Offer`/`Asset Sale`-only/`infinite scroll` claim) | 0 ที่ conflict — `infinite scroll` เหลือเฉพาะ negative/out-of-scope statements ✓ |
| Snooze semantics | 13 §511–512 (FSP-014 canonical "All→following only") ↔ 02 §9 Snooze + AC-FEED-004 ตรงกัน ✓ |
| Favorites semantics | 13 §523 (account-level favorites list) ↔ 02 §9 + AC-FEED-006 ตรงกัน ✓ |
| ni restore path | 13 §516 (`ni` page Restore / `Reset suggested content`) ↔ 02 §8 ni loop + AC-FEED-024 ตรงกัน ✓ |
| Archive route/surface | 13 §62/§110 (`archive` = library destination ของ 02) ↔ 02 §8/§6 + AC-FEED-033; settings row label `คลังข้อมูลที่เก็บถาวร` vs page title `คลังเก็บ` จดถูกต้อง ✓ |
| Session reset | 00_GLOBAL §7 (session `new` → feed `All`) ↔ 02 §8 Open Feed (`feedTab` reset `all` on sign-out) ตรงกัน ✓ |
| Eligibility vs 00_GLOBAL §10 | "โพสต์ผูก asset ต้อง `Sale` เท่านั้น; `post` เข้า feed" ↔ 02 Eligibility Rule + AC-FEED-002 ตรงกัน ✓ |
| Member Sheet gate | 00_GLOBAL §11/`GUEST_GATE_SEL` ↔ 02 §7 gate list + AC-FEED-013 ตรงกัน ✓ |

## 4. Verification

| Check | Result |
| --- | --- |
| ไฟล์ที่แก้ | `FrontOffice/02_FEED_MODULE.md` เท่านั้น (+ evidence file นี้) ✓ |
| `git status --porcelain -- Prototypes/` | **ไม่ว่าง** — `M Prototypes/fo-flow/index.html` มาจาก task `716b8972` (in-progress ของพี่: password ≥8 — verify ด้วย `git diff`: 3 hunks change_pwd helper/check + signup `obScore`→length เท่านั้น) ไม่ใช่การแก้ของงานนี้ ✓ |
| Copies ที่เขียนลง spec | ตรง prototype verbatim: `Follow others to see their posts here`/`No favorites yet`/`Thanks for your feedback`/`We'll suggest fewer posts like this.`/`This post made me uncomfortable`/`Thanks for letting us know`/`Mute {seller}?`/`You can unmute them anytime from their profile. We won't let them know you muted them.`/`Mute posts`/`Muted`/`Unfollowed`/`Added to favorites`/`Removed from favorites`/`Liked by {name} and others`/`Only {seller} can see the total number of likes on this post.`/`This is your own listing`/`Cannot message a blocked account`/`Turn off commenting`/`Commenting turned off`/`Mark as sold`/`View sale record`/`Pin to top of grid`/`Pin limit reached`/`Are you sure you want to pin this post? You can only pin up to three posts to your grid. Pinning this post will replace your oldest pinned post.`/`Pinning...`/`Your post has been pinned`/`Delete post?`/`This post will be permanently deleted.`/`Post deleted`/`Post archived`/`Post unarchived`/`คลังเก็บ`/`Only you can see posts you've archived`/`ไม่มีโพสต์ในคลังเก็บ` ✓ |
| ACs ที่เขียนใหม่ | ทุกข้ออ้าง handler/element จริงใน prototype (`postCard`, `pmOwnMenuHTML`, `pmMenuHTML`, `niCardHTML`, `uncomfCardHTML`, `applyPin`/`dlg-pin-go`, `dlg-delpost-go`, `dlg-mute-go`, `archivePosts`/`archiveHTML`, `feedEmptyHTML`, nav re-tap handler); contract items mark ชัด ✓ |
| Old-spec conflicts removed | marketplace-only objective, sale-only feed, card required fields (brand/model/price/time/owner/counts, no-location), card tap→Asset Detail, comment จาก feed ไม่ได้, like→Favorites, guest-gated tabs, owner menu (Edit asset/purchase history/Change status), others menu (Hide asset/Report Asset/Block User/Share Asset), hide+undo snackbar, bottom-sheet report, guest share, Full Screen Image Viewer — ลบ/flag ครบ ✓ |

## 5. Deviations flagged (spec เลือก prototype)

| Deviation | Note |
| --- | --- |
| `feedEmptyHTML("all")` fallback = `No favorites yet` + star | All-tab empty edge case ใช้ copy ผิด context — spec §13 กำหนด generic `ไม่พบข้อมูล` + flag |
| `lk-follow` visual-only | Likes sheet Follow ไม่ sync `setFollowing` — dead artifact; spec ถือเป็น action จริง (11_SOCIAL canonical) |
| `pfp-post` others-menu = report-only | spec รับตาม prototype (viewer context เหลือ Report เดียว) |
| `hideCounts` composer flag | ซ่อน liked-by + views — บันทึกเป็น post field; setter อยู่ composer (FSP-015b) |
| Save on own post | save-btn render ทุกโพสต์รวม own — ไม่ยกเว้น (ตาม prototype) |

## 6. Flags ส่งต่อ (ไม่แก้นอก scope)

- **FSP-015b** — composer/create (`+` entry, post vs asset modes, Edit info internals, `insertNewPost`, `hideCounts` setter) — boundary block อยู่ 02 §5
- **FSP-016** — `03_SEARCH_FILTER_MODULE.md` ยังใช้ `Global Login Required Dialog` + asset-centric wording (rename note 00_GLOBAL §11 บอกให้ sync ใน task ตัวเอง)
- **FSP-018** — `05_ASSET_DETAIL_MODULE.md` stale: `Like → Favorites` (456/809–810), `Global Login Required Dialog`, comment route wording — feed ให้ canonical: like→Interested, favorites=account-level
- **FSP-019** — `06_PROFILE_MODULE.md` AC-PROFILE-007L "Guest share without Login" ขัด S-03 (share gated) + visitor `...` menu (Share/Report asset) ยัง asset-centric
- **FSP-022** — 11_SOCIAL canonical ของ likes sheet (lk-note/`lk-follow`)/follow sheet/save+collections — 02 อ้าง entry-level ไว้แล้ว
- **FSP-024** — 14_PORTFOLIO: `sell:{id}`/`sold:{id}` forms + drawer statuses (`pfkind` show/hide/sold) — 02 อ้างผลกระทบต่อ feed ไว้
- **FSP-025/026/027** — `DEV_IMPLEMENTATION_CHECKLIST.md` §2 Feed (lines 54–70) + `QA_TEST_SCENARIO_CHECKLIST.md` ยัง asset-centric หนัก (Feed=Sale-only, no Location, Hide this asset, Comment/Share→Asset Detail, guest share) — ต้อง sync ตาม 02 ใหม่ + Master/README/Use_Cases
- **FSP-030** — sweep: `DOCUMENT_VERSION.md` historical `AC-FEED-017J–017L` ไม่ต้องแก้ (changelog); AC renumber 001–038 ให้ QA map ใน checklist task
- งานทั้งหมดยัง uncommitted รวม FSP-006–015a — รอพี่สั่ง commit แยก
