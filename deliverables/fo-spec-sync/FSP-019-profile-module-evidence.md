# FSP-019 — 06_PROFILE Update Evidence (own/viewer/follow/QR/block/drawer/edit)

Date: 2026-10-22
Task: `6684c203` — "FSP-019 อัปเดต 06_PROFILE — own/viewer/follow/QR/block/drawer/edit"
Scope: `FrontOffice/06_PROFILE_MODULE.md` เท่านั้น (rewrite ทั้งไฟล์ 658 บรรทัด) — sync ตาม `Prototypes/fo-flow/index.html` (read-only) + baseline 00_GLOBAL (statuses §9, visibility §10, gate §11, block §13, private §14) / 00_NAV (routes §6.6, back §6.7, entry matrix §7, notif §8, deep-link §10) / 02_FEED (own-post menu + `.follow-btn` + pin canonical — FSP-015a/b lock) / 04_ASSET_MANAGEMENT (drawer/`pfkind`/sold + `.pf-pfo`/`+`/CTA entries — FSP-017 lock) / 05_ASSET_DETAIL (detail reachability — FSP-018 lock) / 13_SETTINGS (settings entry + contact-fields contract — S-05)
Context: FSP-018 session note + `FSP-016-search-flow-post-viewer-evidence.md` + `FSP-017-asset-mgmt-add-statuses-purchase-evidence.md` + `FSP-018-asset-detail-evidence.md` + `gap-FSP-003a-profile-portfolio.md`

Prototype anchors verified: routes `profile:`/`pfollow:`/`about:`/`pedit` ~17574–17577; `profileHTML` ~16829–16901 (own/viewer heads, TABS 5 vs 3, stats/`pfgo`, bio/`pf-atch`/`pf-fby`, actions own `pf-edit`/`pf-share`/`pf-pfo` vs viewer `pf-foll`/`pf-msg` vs blocked `pf-unblock`); `pfTilesHTML`/`pfEmptyHTML` ~16813–16828; `pfNavHTML`/`botNavHTML` ~16788–16800; `profileOf`/`PROFILES`/`pfAllUsers` ~16287–16312/~16395–16416/~16780–16786; session sets `PF_BLOCKED`/`PF_REMOVED_FOL`/`PF_EXTRA_*` ~16313–16314; `pfGridPosts`/`pfKind`/`pfTabPosts` ~16578–16610; gfx `PF_GFX_*` ~16419–16575; pin `pinnedIn`/`PIN_MAX`/`applyPin`/`pinFeedback` ~16612–16634 + `Pin limit reached` dlg ~20508–20516/`dlg-pin-go` ~20646–20658; entries `[data-pf-user]` ~21778–21792 + `pfWho` + `data-navgo="profile"` ~21289 + composer landing ~20183/20307/20670 + follow notif ~17805; tab/go/tile/avatar handlers ~21303–21366; `pf-foll`/`mfSheet` ~21367–21391/~16768–16779/~21449–21473; `pf-flw` ~21394–21403; `pf-dots`/`pfl-pop`/`pf-rmf`/`dlg-rmf-go` ~21405–21447/~20697; `pfollowHTML` ~16904–16937 + `pfl-q` ~20069 + back-out-right ~20759; `pf-msg`/dead chips/`pf-menu`/`pf-uname` ~21490–21497; `pf-more` + `pf-sh-*` ~21498–21557; QR `pfProfileLink`/`pfQrSvg`/`pfQrPaint`/`pfOpenQr`/`pfOpenCam`/`pfCloseQr`/`pfDownloadQr` ~13748–13854 + handlers ~21478–21489; block `blkSheetHTML`/`unblockDlgHTML`/`pfRestrictHint` ~16691–16742 + `pfSetBlocked` ~16671–16688 + `blk-go`/`blk-rep`/`pf-unblock`/`m-unblock`/`dlg-unblk-go` ~21585–21653/~20690–20696; report `report:pick:`/`report:posts:`/`report:user`/`report:post`/`report:done:` ~17512–17573 + `rpPush`/`pmDropCovered`/`rpBack`/`rpClose` ~14883–14945 + `rp-step`/`rp-done` ~21611–21634; `aboutHTML` ~16743–16765; `peditHTML`/`peValidLink` ~16938–16956 + save/migration ~21729–21776; `GUEST_GATE_SEL`/`obGate` ~22997–23012/~20157; fresh-account `PROFILES` zero seed ~22971; dead `pe-pic`/overlay-`qr` ~21359.

## 1. What changed (section map)

| Section | Change |
| --- | --- |
| Header/§1 Doc Info | rename → **Profile (Owner/Public)** — spec เดิม asset-centric grid + Total Asset Value; prototype คือ IG-style post-centric profile |
| §2 Objective | rewrite — `profile:{username}` 2 variants + post grid→`pfp` viewer + own profile = entry ของ private surfaces (hide/sold reachability, pedit, QR, portfolio, settings) |
| §3 Prototype Reference | **ใหม่ทั้งก้อน** — anchor index ครอบ routes/data/grid/tabs/tiles/entries/follow/pfollow/QR/block/report/about/edit/gate/dead/quirks (~60 anchors พร้อม line numbers) |
| §4 Master Alignment | rewrite — post-centric grid rule, visibility canonical vs S-14 leak, block keep-page (S-13), ไม่มี Total Asset Value, portfolio = `.pf-pfo` เท่านั้น, report stack 00_NAV §6.6 |
| §5 Scope | rewrite — In = profile pages/tabs/grid/pfollow/follow/menu/block/report/QR/overlay/pedit/entries/gate/deviations; Out = post model+menus (02), pfp viewer (03), detail (05), drawer/portfolio (04/14), shared sheets (02/11), settings pages (13), chat (07), report internals+reasons (15), WA (10), notif internals (09), deep-link contract |
| §6 Screen Mapping | rewrite — 14 surfaces (2 profile variants, blocked, pfollow, about, pedit, avatar overlay, QR overlay, mfSheet, viewer menu, blkSheet, unblockDlg, report stack, muteDlg, rmf dlg, Member Sheet) |
| §7 User States | rewrite — Guest (browse free + gate map + ไม่มี own profile), Member/Viewer, Owner (+`+`/pedit/QR/portfolio/5 tabs/own-post menu/pin/rmf), Blocked (keep-page + masked stats + Unblock + `pf-fby` quirk) |
| §8 User Flow | **rewrite ทั้งก้อน** — Open Profile, Tab Switch, Grid→Post (reachability), Follow/Unfollow per-surface table (7 surfaces), mfSheet, Followers/Following, `...` menu, Report user (`pick`→branches→`done`), Block/Unblock, QR, Avatar overlay, Edit profile, Owner entries |
| §9 Business Rules | **rewrite ทั้งก้อน** — Route/Data (profileOf fabricate), Own-vs-Viewer table, Grid Content (`pfTabPosts`+`pfKind`+pin+tile anatomy), Tab Visibility canonical (S-14 defect), Reachability, Follow/Fav/Mute, Remove Follower, Block (keep-page + effects), Report User, Share&QR, Edit (username=identity + contact=contract-only), About, Nav/Back, Guest Gate, **Deviations & Dead-Code Notes (28 รายการ)** |
| §10–12 Permission/Validation/Exception | rewrite — gate table ตาม `GUEST_GATE_SEL`; pedit validation (username regex+unique, bio 150, `peValidLink`), `pfl-q`, pin limit; exception table (fabricate/not-found contract, camera toasts, `pf-sh-copy` toast-only, archive drop, rename stack-key rewrite) |
| §13 Empty State | rewrite — own `all` CTA copy, per-tab `No {label} posts`, viewer/blocked `No posts yet`, pfollow EN empties |
| §14 Notification | rewrite — follow notif → `profile:{user}` (canonical 00_NAV §8); unfollow/remove/block/mute/report ไม่แจ้ง |
| §15 Analytics | rewrite — contract `profile_*` event set (18 events) |
| §16 ACs | **rewrite ทั้งชุด** — AC-PROFILE-001–056 sequential จัดกลุ่ม 9 หมวด (Entries, Tabs&Grid, Follow, pfollow, Share&QR, Menu/About/Report/Block, Edit, Guest Gate, Guard) — เดิม letter-suffix set (007A–007L, 018A, 020A/B, …) + asset-centric claims ลบทิ้ง — renumber; ไม่มี live cross-ref ดู §2 |
| §17 Related | +00_GLOBAL/00_NAV/01/02/03/04/05/07/09/10/11/13/14/15/README links ตาม boundary ใหม่ |
| §18 Future | +not-found contract, persistence, real deep links, S-14 leak fix, photo picker, chat entry, restrict, IG dead extras, story ring, disp แยก username, i18n sweep, real follower data |

## 2. Cross-doc ref check (ก่อนปิดงาน)

| Check | Result |
| --- | --- |
| `AC-PROFILE`/`06_PROFILE` refs นอก 06 | refs ที่มี = boundary notes เท่านั้น (03 §5, 04 §5/§6/§17, 05 §5/§17, 13 §4/§5/§9, 00_NAV/00_GLOBAL/01/02 README lists) — ไม่มี ref ถึง AC number เก่า → renumber ปลอดภัย ✓ |
| Synced baselines stale terms | grep `Total Asset Value`/`User Not Found`/`Block this user`/`Global Login Required`/`asset card` ใน 00/01/02/03/04/05/13 = **0 stale** (เหลือแค่ rename-note จงใจใน 00_GLOBAL §11 + 00_NAV) ✓ |
| Boundary claims ที่ baselines ฝากไว้ | 04 §6: `pf-pfo`/own-empty copy/`+` CTA → ตรง spec ใหม่ §6/§13 ✓; 05: "sold/hide reachability ผ่าน own profile tabs" → §9 Reachability Rule + AC-016 ✓; 13: "Edit entry = own profile เท่านั้น, contact fields contract-only" → §9 Edit Rule ✓; 00_GLOBAL §10 S-14 leak note → §9 Tab Visibility canonical + §19 flag ✓ |
| Stale terms ใน not-yet-synced modules | `Global Login Required`: 07(3)/09(3)/10(3)/11(5)/12(7)/15(1)/16(2); `Total Asset Value`: 14(30); `User Not Found`/`Block this user`: 07/09/11/15 — flag FSP-020/021/022/024 ไม่แก้นอก scope ✓ |
| Stale terms ใน legacy/central docs | Master(18), PRD(2), FO_Functional_PRD(1), Use_Cases(1), QA_TEST_SCENARIO_CHECKLIST(36), DEV_IMPLEMENTATION_CHECKLIST(16), DEV_CHAT_CHECKLIST(2), DOCUMENT_VERSION(15), README_MODULE_INDEX (`Public Profile detail entry` L92 เดิม) — flag FSP-025/026/027 ✓ |
| `pf-pfo` / `+` / CTA entry semantics | ตรง 04 canonical (`data-flow="create" data-mode="asset"` ~16852/~16826, `data-sub="portfolio"` ~16887) ✓ |
| Copies ที่เขียนลง spec | ตรง prototype verbatim: `แก้ไขโปรไฟล์`/`Edit profile`, `แชร์โปรไฟล์`/`Share profile`, `ทั้งหมด`/`ขาย`/`โชว์`/`ซ่อน`/`ขายแล้ว`, `ติดตาม`/`กำลังติดตาม`, `แชท`, `เลิกบล็อก`, `เพิ่มสินทรัพย์ชิ้นแรกของคุณ`/`สินทรัพย์ที่บันทึกและโพสต์ที่แชร์จะแสดงที่นี่`, `ยังไม่มีโพสต์ในแท็บ{}`/`No {} posts`, `ยังไม่มีโพสต์`/`No posts yet`, `No followers yet`/`You're not following anyone yet`/`Not following anyone yet`/`No results found`, `Block {u}?`/`This will also block any other profiles…`/`Block and report`/`Blocking`, `Unblock {u}?`/`Unblocked`, `Remove follower?`/`We won't let {u} know…`, `Thanks for your feedback`/`Report submitted · thanks for letting us know`, `Share profile`/`Copy link`/`Download`/`COLOR`/`Link copied`/`QR code saved`/`Camera isn't available on this device`/`Allow camera access to scan a QR code`/`Profile QR scanned`, `Profile shared`/`Profile link copied`/`QR code isn't in this prototype yet`, `Open a listing to chat with this seller`, `Not in this prototype yet`, `Photo picker isn't in this prototype yet`, `Signed in as {u}`, `Profile updated`, `Pin limit reached`/`Your post has been pinned`, `Mute {u}?`/`Mute posts`/`Muted`/`Unmuted`, `เลิกติดตามแล้ว`/`Unfollowed`, `เกี่ยวกับบัญชีนี้`/`About this account`/`Date joined`/`Account based in`/`Verified` ✓ |

## 3. Verification

| Check | Result |
| --- | --- |
| ไฟล์ที่แก้ | `FrontOffice/06_PROFILE_MODULE.md` เท่านั้น (+ evidence file นี้) — rewrite เต็ม 658 บรรทัด ✓ |
| `git status --porcelain -- Prototypes/` | `M Prototypes/fo-flow/index.html` = diff เดิมของ task `716b8972` (password ≥8 — verified ซ้ำตอนนี้: 3 hunks: chg-pwd desc 6→8, `newVal.length <6→8`, signup pw error) — **งานนี้ไม่แตะ Prototypes/** ✓ |
| Own profile anatomy | `+`/uname/burger + Edit/Share/`.pf-pfo` + 5 tabs + grid — ตรง ~16852–16896 ✓ |
| Viewer anatomy | back/`...` + `pf-foll`/`pf-msg` + `@uname` chip + `pf-fby` + 3 tabs — ตรง ~16858–16895 ✓ |
| Grid semantics | `pfTabPosts` pool (PF_MINE+userPosts+gfx) + `!archived` + kind filter + pin order — ตรง ~16578–16610 ✓ |
| Tab visibility canonical | public = Sale+Show (00_GLOBAL §10) — prototype `all` leak documented เป็น defect ไม่ copy เป็น spec ✓ |
| Reachability | own `hide`/`sold` → `pf-tile` → `pfp` → detail/`sold:{id}` = path เดียว (FSP-018 handoff) ✓ |
| Follow per-surface | feed-confirm vs `pf-foll` mfSheet vs `pf-flw`/`pfp-follow`/`pfl-pop`/report-step instant — ตรง ~21367–21473/~14114–14139 ✓ |
| Block keep-page | masked stats `0`/`−`/`−` + `pfgo` ปิด + `No posts yet` + `Unblock` — ตรง ~16834–16891 (`isB`) ✓ |
| QR | `https://tukdaeng.app/u/{u}` + 5 themes + camera + share/copy/download — ตรง ~13748–13854/~21478–21489 ✓ |
| Edit | username regex+unique + bio 150 + `peValidLink` + full rename migration + `Profile updated` — ตรง ~16938–16956/~21729–21776 ✓ |
| Boundary preservation | post/menus→02, pfp viewer→03, detail→05, drawer/portfolio→04/14, sheets→02/11, settings pages→13, chat→07, report internals+reasons→15, WA→10, notif→09 — "canonical อยู่ X" ทุกจุด ไม่มี spec ซ้ำ ✓ |
| ACs ใหม่ | AC-PROFILE-001–056 ทุกข้ออ้างพฤติกรรมจริง (`pf-foll`/`mfSheet`/`pf-flw`/`pfp-follow`/`pf-rmf`/`pfl-pop`/`pf-sh-*`/`blkSheet`/`unblockDlg`/`pf-qr-*`/`pf-avov`/`pe-*`/`pfTabPosts`/`pfKind`/`data-pftab`/`data-pfgo`/`pf-tile`/`GUEST_GATE_SEL`) ✓ |

## 4. Deviations flagged (spec เลือก prototype — documented, not spec)

| Deviation | Note |
| --- | --- |
| Post-centric grid (ไม่ใช่ asset cards) | `pf-tile` = โพสต์ photos[0]+stack/clip/pin — spec เดิม asset card + `...` quick actions ทั้งชุดถูกตัด |
| ไม่มี Total Asset Value บน profile | `.pf-pfo` icon เท่านั้น (canonical 04) |
| Owner head = `+`/username/burger | ไม่มี `...` own menu; burger → settings direct (`.set-btn` dead) |
| Public `all` leak `post`/`hide`/`sold` | canonical Sale+Show ตาม 00_GLOBAL §10 — **defect S-14** ไม่ copy เป็น spec; `report:posts:` picker leak class เดียวกัน |
| Blocked = keep-page ไม่ใช่ unavailable | canonical S-13/00_NAV — masked stats + Unblock; spec เดิมบอก unavailable |
| Block confirm = `blkSheet` ไม่ใช่ center dlg | `Block`+`Block and report`, dismiss ผ่าน backdrop |
| Report done = `Thanks for your feedback` + steps | ไม่ใช่ `Report submitted` modal ของ spec เดิม |
| Share own = QR overlay จริง; viewer copy = toast-only | `pf-qr-copy` ใช้ `pfCopyText` จริง / `pf-sh-copy` toast เปล่า |
| Guest share gated | spec เดิม AC บอก guest share public profile/asset ได้ — gate list ล็อกทุก path (canonical S-03) |
| Edit fields = username/bio/link | Phone/LINE/Email = contract-only (13_SETTINGS S-05) |
| Unfollow หลาย surface behaviors | feed=confirm sheet / profile `Following⌄`=mfSheet / lists+pv-head+popover+report-step=instant — spec เดิมบังคับ confirm เดียว |
| `pf-msg` Chat dead | `Open a listing to chat with this seller` — chat เข้าผ่าน listing (07) |
| Followers/following pages + Remove follower | ใหม่ทั้งชุด — EN-hardcoded labels/empties |
| About this account + Avatar overlay | ใหม่ — overlay `qr` act dead (inconsistency กับ `pf-share` QR จริง) |
| IG extras verified/ring/cat/link/note/sleep | note/sleep/addchip/avadd dead toasts |
| Viewer nav ไฮไลต์ Feed (`pfNavHTML(false)`) | quirk — documented |
| `pf-fby` render บน blocked page | quirk — documented |
| `profileOf` fabricate ทุก name | ไม่มี user-not-found reachability → contract §18 |
| Session-only state | follow/fav/mute/block/removed/pins/gfx/QR theme → persistence contract |
| EN-hardcoded strings (~30 copies) | pfollow/QR/blkSheet/dlgs/toasts → i18n sweep FSP-026 |
| `disp` = username เสมอ | ไม่มี display name แยก (pedit save `o.disp = uname`) |
| own follower rows มี `pf-msg` dead | Chat button ซ้ำกับ profile `pf-msg` |

## 5. Flags ส่งต่อ (ไม่แก้นอก scope)

- **FSP-020** — `07_CHAT_MODULE.md`: `pf-msg` dead (`Open a listing to chat with this seller`) + chat item/menu `[data-pf-user]` entries + `th.blocked` sync + `ch-rep-*` → `report:user` paths + `Global Login Required` stale (3 hits)
- **FSP-021** — `09_NOTIFICATION`/`10_WATCH_ALERT`: follow notif → `profile:{user}` (00_NAV §8); stale `Global Login Required`(3+3) + `User Not Found`(09)
- **FSP-022** — `11_SOCIAL_MODULE.md`: `shareSheetHTML` reuse (`pf-sh-share`/`pf-qr-share`) + `pfCopyText` + follow/fav/mute feed semantics — stale `Global Login Required`(5) + `Block this user`(1)
- **FSP-024** — `14_PORTFOLIO_MODULE.md`: **`Total Asset Value` 30 hits** — portfolio entry คือ `.pf-pfo` เท่านั้น (ไม่มี headline บน profile); `portfolio`/`pfasset:`/`sold:`/`soldhist` internals + `pfoSimBar` dev
- **FSP-025/026/027** — Master §Profile (18 stale), PRD/FO_PRD/Use_Cases, README_MODULE_INDEX (L92 `Public Profile detail entry` เดิม), DEV+QA checklists (`AC-PROFILE` เดิม/asset-centric checks 36+16+2), DOCUMENT_VERSION (15) — sync ตาม 06 ใหม่ + **EN-hardcode copies เข้า i18n sweep**: pfollow labels/empties/`Search username`, QR labels+toasts, `blkSheet`/`unblockDlg`/`Remove follower?`/`Pin limit reached`, `Blocking`/`Unblocked`/`Unfollowed`/`Muted`/`Unmuted`/`Profile shared`/`Profile link copied`/`QR code…`/`Link copied`/`QR code saved`/`Signed in as`/`Camera…`/`Allow camera…`/`Profile updated`/`Open a listing…`/`Photo picker…`/`Not in this prototype yet`
- **FSP-030** — public `all` leak (S-14: `pfTabPosts` ไม่ filter visibility; `report:posts:` picker ด้วย) + viewer nav ไฮไลต์ Feed + `pf-fby` บน blocked page + avatar-overlay `qr` dead-vs-real inconsistency + `pf-sh-copy` toast-only — consistency sweep
- งานทั้งหมดยัง uncommitted รวม FSP-006–019 — รอพี่สั่ง commit แยก
