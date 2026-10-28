# 06 Profile Module

อ้างอิงหลักจาก [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md) + baseline [00_GLOBAL_RULES_MODULE.md](00_GLOBAL_RULES_MODULE.md) §9–§14 + [00_NAVIGATION_AND_CROSS_MODULE_FLOW.md](00_NAVIGATION_AND_CROSS_MODULE_FLOW.md) §6.6–§10 + [02_FEED_MODULE.md](02_FEED_MODULE.md) (own-post menu + pin + follow canonical) + [04_ASSET_MANAGEMENT_MODULE.md](04_ASSET_MANAGEMENT_MODULE.md) (drawer/`pfkind`/sold semantics + portfolio entry — FSP-017 lock) — prototype `Prototypes/fo-flow/index.html` เป็น source of truth เดียวของพฤติกรรม (FO-PRD-v1.9)

---

# 1. Document Information

| Item | Detail |
|---|---|
| Module Name | Profile (Owner Profile / Public Profile — spec เดิมตีความเป็น asset-centric grid + Total Asset Value; prototype คือ Instagram-style post-centric profile) |
| Platform | Mobile Application |
| Version | V1 |
| Owner | Product / UX / Engineering |
| Status | Draft |
| Document Type | Functional PRD - Master Aligned |

---

# 2. Objective

Profile คือ sub-page 2 รูปแบบบน route เดียว `profile:{username}` — **Owner Profile** (`{username}` === ผู้ใช้ปัจจุบัน) และ **Public/Viewer Profile** (ของคนอื่น) — โครงแบบ Instagram: header (avatar + story ring + ชื่อ + stats posts/followers/following), bio block (category + bio + link chip), action row ที่ต่างกันตาม own/viewer, status tabs และ post grid 3 คอลัมน์ที่ tile เปิด Post Viewer mode `pfp`

Owner Profile เป็นทางเข้าหลักของ private surfaces: composer asset mode (`+`), Edit profile, QR profile share, portfolio entry (`.pf-pfo`), followers/following management (Remove follower, manage following), Settings entry และ tabs `hide`/`sold` ซึ่งเป็น **reachability เดียว** ของ hidden/sold post detail (FSP-018 handoff)

โมดูลนี้ต้องคุม visibility matrix (public เห็นเฉพาะ `Sale`+`Show` ตาม canonical 00_GLOBAL §10), follow/unfollow/favorite/mute semantics ระดับ account ที่ต่างกันตาม surface, block/unblock keep-page flow, report user flow, QR share overlay, edit profile + username rename migration และ guest gate — โดยยึดพฤติกรรม prototype เป็นตัวตัดสินเมื่อ spec เดิมขัดกัน

---

# 3. Prototype Reference

Source of truth: `Prototypes/fo-flow/index.html` (read-only — ห้ามแก้)

- Routes: `profile:{username}` → `profileHTML` (~17574), `pfollow:{username}:{tab}` → `pfollowHTML` (~17575), `about:{username}` → `aboutHTML` (~17576), `pedit` → `peditHTML` (~17577), `portfolio` → `portfolioHTML` (canonical 04/14)
- Profile data: `PROFILES` seed (~16287–16312), `profileOf` (~16395–16416 — fabricate profile ให้ทุก name: avatar gen + hash-mock stats `120+h%4800`/`120+h%800`), `pfAllUsers` (~16780–16786 — users จาก POSTS sellers + COMMENTS + CP_ME), `PF_VBADGE` (~16689), session sets `PF_EXTRA_FOL`/`PF_EXTRA_FAV`/`PF_EXTRA_MUT`/`PF_BLOCKED`/`PF_REMOVED_FOL` (~16313–16314); fresh-account seed `PROFILES` zero (~22971)
- Grid data: `pfGridPosts` (~16578–16603 — `PF_MINE` drawer-only posts + `userPosts` + gfx mocks), `pfKind` (~16604 — fallback `price || type==="sale" ? "sale" : "show"`), `pfTabPosts` (~16605–16610 — drop `archived`, `all` = ทุก kind, tab อื่น filter kind, pinned-first newest-pin-first), gfx mocks `PF_GFX_KINDS`/`PF_GFX_SALE`/`PF_GFX_SOLD`/`PF_GFX_META`/`PF_GFX_REG`/`PF_GFX_DEL` (~16419–16575), pin state `pinnedIn`/`PIN_MAX`/`applyPin`/`pinFeedback`/`pinSeq` (~16612–16634)
- Profile page `profileHTML` (~16829–16901): own head (`+` `data-flow="create" data-mode="asset"` / `pf-uname` / `pf-menu` burger) vs viewer head (`sub-back` / `pf-more`), `TABS` own 5 (`all`/`sale`/`show`/`hide`/`sold` icon+label) vs viewer 3 (`all`/`sale`/`show`), avatar `pf-av` `data-pfav` + story ring + `pf-note` bubble, `pf-disp`, `pf-stat` (+`data-pfgo` บน followers/following, disable ตอน blocked), `pf-sleep` chip, `pf-bio` (`pf-cat`/`pf-biot`/link chip `pf-link`/`pf-atch`), viewer `@username` chip + `pf-fby` followed-by row, actions row (own: `pf-edit`/`pf-share`/`pf-pfo` — viewer: `pf-foll`/`pf-msg` — blocked: `pf-unblock`), `pf-tabs`, `pfNavHTML` (~16798–16800)
- Tiles/empty: `pfTilesHTML` (~16813–16820 — `pf-tile` + stack badge (multi-photo) / clip play icon / `pf-pin` marker), `pfEmptyHTML` (~16821–16828 — `pf-cta` `data-flow="create" data-mode="asset"` เฉพาะ own `all` ว่าง)
- Entries ไป profile: `[data-pf-user]` handler (~21778–21792 — `pushSub profile:{u}`) บน detail head/caption/comments/likes rows/`pv-seller`/search `sr-scard`/`pfollow` rows/settings mrow/chat item `ch-menu-act-btn`; feed `pfWho` (post-head avatar/who + `caption > b`); own `data-navgo="profile"` → `profile:{CP_ME.name}` (~21289); composer asset save lands `profile:{me}` (~20183, ~20307, ~20670); follow notification `type:"follow"` → `rpPush profile:{u}` (~17805)
- Tab/grid handlers: `data-pfgo` → `pfollow:` (~21303–21311), `data-pftab` swap-in-place บน `profile:`/`pfollow:` (~21312–21332 — ไม่ re-slide, คง scroll), `pf-tile` → `openPostViewer(list, pid, 0, false, "Posts", u)` mode `pfp` + `scr._pinTab` (~21333–21347), pfollow slide-back-out-right (~20759)
- Avatar overlay: `data-pfav` → `scr._pfAv` → `pfAvovHTML` (~16801–16812 — acts `foll`(viewer only)/`share`/`copy`/`qr`), handlers ~21348–21366 (tap นอก acts/img ปิด; `share`→`Profile shared`, `copy`→`Profile link copied`, `qr`→`QR code isn't in this prototype yet`)
- Follow/mute/favorite: `pfIsFollowed`/`pfSetFollow` (~16637–16646 — `PF_EXTRA_*` cover users ไม่มี post), `setFollowing` shared (~14114–14139 — unfollow clears `favorite`+`muted` + feed re-render), `pfIsFav`/`pfSetFav`/`pfIsMuted`/`pfSetMuted` (~16647–16664), `pf-foll` handler (~21367–21391 — following → `mfSheet`, fresh → instant; `pfp-follow` pv-head pill instant + fade-out ~1200+240ms ~14540), `pf-flw` instant flip (~21394–21403), `mfSheetHTML` (~16768–16779 — favorites/mute/unfollow), `muteDlgHTML` (~14712), mf rows handlers (~21449–21473)
- Followers/following: `pfollowHTML` (~16904–16937 — EN labels `{n} followers`/`{n} following`, `pfl-q` live search → `No results found`, own followers = `pf-msg` + `pf-rmf` x-Remove, own following = `pf-dots` → `pfl-pop` popover, viewer = `pf-flw` pill, own non-member → empty lists ~16910, self filtered จาก lists คนอื่น ~16909), `pf-dots`/`pfl-pop` markup+handlers (~21405–21437 — `unf` instant + `เลิกติดตามแล้ว`/`Unfollowed` + row remove / `mute` → muteDlg หรือ `Unmuted`), `pf-rmf` → `Remove follower?` dlg (~21438–21447), `dlg-rmf-go` (~20697), `pfl-q` input (~20069)
- QR: `pfProfileLink` = `https://tukdaeng.app/u/{encodeURIComponent(u)}` (~13748), `pfQrSvg`/`pfQrPaint` (~13756–13781 — `qrcode` lib → SVG dots + finder patterns), `PF_QR_THEMES` 5 themes, `pfOpenQr`/`pfOpenCam`/`pfCloseCam`/`pfCloseQr`/`pfDownloadQr` (~13782–13854 — `getUserMedia` env cam + `BarcodeDetector` ~600ms poll → `Profile QR scanned`/`QR code scanned`; no API → `Camera isn't available on this device`; denied → `Allow camera access to scan a QR code`; PNG download 1080px → `QR code saved`), handlers `.pf-qr-x`/`.pf-qr-color`/`.pf-cam-x`/`.pf-qr-scan`/`.pf-qr-share`/`.pf-qr-copy`/`.pf-qr-dl` (~21478–21489 — share → `shareSheetHTML`, copy → `pfCopyText` + `Link copied`)
- Viewer `...` menu: `pf-more` → pm-rows card (~21498–21514 — `pf-sh-report` (danger) / `pf-sh-block` (label flips `Block`↔`Unblock`) / `pf-sh-about` / `pf-sh-copy` / `pf-sh-share` + cancel card `pf-sh-cancel`), handlers ~21516–21557 (`copy` → toast `Profile link copied` toast-only, `share` → `shareSheetHTML`, `about` → `pushSub about:{u}`)
- Block: `blkSheetHTML` (~16691–16706 — avatar + `Block {u}?` + `This will also block any other profiles they may have or create in the future.` + 3 impact rows + `Block` + `Block and report`; `fromChat` → เฉพาะ `Block`), `unblockDlgHTML` (~16721–16729 — `Unblock {u}?` center dlg), `pfRestrictHint` banner (~16730–16742 — ~6s auto-hide, tap dismiss, `Learn more` dead), `pfIsBlocked`/`pfSetBlocked` (~16668–16688 — PF_BLOCKED + PF_REMOVED_FOL + unfollow + chat `th.blocked` + `p.blocked` + feed re-render; unblock ไม่ re-follow), `pf-sh-block` handler (~21540–21550), `blk-go` (`Blocking` transient toast)/`blk-rep` (~21585–21610), `pf-unblock`/`m-unblock` → unblockDlg (~21639–21653), `pf-rhint` dismiss (~21654), `dlg-unblk-go` (~20690–20696)
- Report user: `pf-sh-report` → `rpPush report:pick:{u}` + `pmDropCovered` (~21531–21538, ~14883–14898 — picker `pg-up` slide-up ~14827), pages `report:pick:`/`report:posts:`/`report:user`/`report:post`/`report:done:` (~17512–17573 — reasons `PM_REASONS`, `rp-tile` picker grid = `pfTabPosts(u,"all")`, `report:done` = `Thanks for your feedback` + `rp-step` rows + `Done`), `rp-step` (~21611–21628 — block→blkSheet/unblock→unblockDlg/unfollow→instant+`Unfollowed`/mute→muteDlg/unmute→instant), `rp-done` → `rpClose` + `Report submitted · thanks for letting us know` (~21629–21634), `rpBack`/`rpClose` (~14899–14945)
- About: `aboutHTML` (~16743–16765 — hero avatar + username + `PF_VBADGE` + note + `Date joined` (hash-mock month+year, TH +543) + `Account based in Thailand` + `Verified` row + foot note)
- Edit: `peditHTML` (~16938–16950 — `pe-pic` + `pe-name` (maxlength 20) + `pe-bio` (maxlength 150, rows 5) + `pe-link` + `pe-save`), `peValidLink` (~16951–16956 — `^@[A-Za-z0-9_.]{1,30}$` / bare domain / `new URL` http+https), save handler + validation + rename migration (~21729–21776 — regex `^[a-z0-9_.]{3,20}$` + unique vs `PROFILES`+`POSTS.seller` + `pe-err`/`is-err`/focus first + migrate `PROFILES` key/`POSTS.seller`/`COMMENTS`/`followedBy`/`PF_BLOCKED`/`PF_REMOVED_FOL`/`PF_EXTRA_*`/`NEW_USER_KEY` `fo_newuser`/`obSaveAccount`/`_subStack` `profile:` keys + `o.disp = uname` → `subBack` + `Profile updated`)
- Guest gate `GUEST_GATE_SEL` + `obGate` (~22997–23012, trigger ~20157): profile-family gated = `[data-flow]` (`+`/`pf-cta`), `[data-navgo="profile"]`, `.pf-foll`, `.pf-flw`, `.pf-msg`, `.pf-avov-act`, `.pf-dots`, `.pf-rmf`, `.pf-unblock`, `.pf-more`, `.pf-menu`, `.pf-edit`, `.pf-share`, `.pf-sh-report`, `.pf-sh-block`, `.pf-sh-share`, `.pm-own-*` (ใน pfp viewer), `.pm-go-report`; **ไม่** gated = `[data-pf-user]`, `[data-pfgo]`, `[data-pftab]`, `.pf-tile`, `[data-pfav]`, `.pfl-q`
- Dead controls (ห้ามเขียนเป็น feature): `pf-msg` → `Open a listing to chat with this seller` (~21490–21491), `.pf-addp`/`.pf-addchip`/`.pf-avadd`/`.pf-note`/`.pf-sleep` → `Not in this prototype yet` (~21492–21493), avatar-overlay `qr` → `QR code isn't in this prototype yet` (~21359), `pe-pic` → `Photo picker isn't in this prototype yet`, `.set-btn` dead (canonical 13_SETTINGS), `pf-uname` → `Signed in as {me}` toast (~21496–21497 — account-switcher demo)
- Quirks: `pfNavHTML(false)` → viewer profile ไฮไลต์ **Feed** tab ใน nav ที่ embed (~16798–16800), `pf-fby` ยัง render บน blocked profile ถ้ามี followedBy data (~16884), `report:posts:` picker grid = `pfTabPosts(u,"all")` (leak class เดียวกับ public `all`), `profileOf` fabricate → ไม่มี user-not-found reachability

---

# 4. Master Alignment Summary

| Topic | Master Baseline | Profile Module Rule |
| --- | --- | --- |
| Profile type | Owner Profile + Public Profile | route `profile:{username}` sub-page (00_NAV §6.6) — own/viewer render จาก `profileHTML` เดียวกัน ต่าง head/actions/tabs |
| Grid model | Asset tabs บน profile (master เดิม) | **post-centric**: grid = โพสต์ (`pfkind`) ไม่ใช่ asset entity — asset management/values อยู่ 04/14 เท่านั้น |
| Status model | `Sale`/`Show`/`Hide`/`Sold` (00_GLOBAL §9) | `pfkind` mirror ตาม canonical 04; `post` = โพสต์ทั่วไปไม่ผูก asset |
| Visibility | 00_GLOBAL §10 + AC-GLOBAL-003 | public profile = เฉพาะ `Sale`+`Show`; owner = ทุก kind รวม `post`/`hide`/`sold` — prototype `all` leak ถือเป็น defect (S-14, §9/§19) |
| Guest | 00_GLOBAL §11 | เปิด/browse public profile + grid→viewer + lists ได้ฟรี; identity actions → Member Sheet |
| Block | 00_GLOBAL §13 + 00_NAV §10 contract | blocked profile = keep-page (masked stats + empty grid + Unblock) — canonical S-13 ไม่ใช่ unavailable page |
| Private data | 00_GLOBAL §14 | Purchase Price/Date, Sold History, Portfolio Value = private — **ไม่แสดงบน profile เลย** (ไม่มี Total Asset Value headline) |
| Portfolio | entry จาก own profile | `.pf-pfo` icon เท่านั้น (canonical 04 §8 Portfolio Browse Flow) |
| Own-post menu | canonical 02_FEED §8/§9 | ใช้ใน pfp viewer เมื่อเป็น own post (incl. Pin/Archive/Edit info/Mark as sold/View sale record/Delete) |
| Report | IG-style report stack (00_NAV §6.6 routes `report:*`) | entry `pf-sh-report` → `report:pick`; internals canonical 15_TRUST_SAFETY |
| Notifications | Follow notification (00_NAV §8) | `type:"follow"` → `profile:{user}` — unfollow/block/remove ไม่แจ้ง |
| Deep link | 00_NAV §10 contract | external deep link = contract เท่านั้น (prototype ไม่มี mechanism; `profileOf` fabricate → ไม่มี not-found reachability) |
| ไม่มีใน V1 | — | Total Asset Value headline บน profile, asset-card `...` quick actions บน grid, public asset `...` menu, own `...` head menu, real chat จาก profile, photo picker, user-not-found page (reachability) |

---

# 5. Scope

## In Scope

- `profile:{username}` page — own vs viewer anatomy (head/actions/stats/bio/tabs/grid/empty), blocked variant
- Profile tabs `all`/`sale`/`show`/`hide`/`sold` + `pfTabPosts`/`pfKind` semantics + pin ordering + `archived` drop
- Profile grid tiles → Post Viewer `pfp` handoff + hide/sold post reachability (owner only)
- `pfollow:{u}:{tab}` followers/following pages — rows, viewer `pf-flw` pill, own `pf-rmf` Remove + `pf-dots` manage popover, live search
- Follow/unfollow/favorite/mute จาก profile surfaces — per-surface behavior map
- Viewer `...` menu (Report/Block/About/Copy profile URL/Share this profile)
- `about:{u}` About this account page
- Block flow (`blkSheet`) + unblock (`unblockDlg` + restrict hint) + blocked keep-page
- Report user path (`report:pick` → `report:posts`/`report:user` → `report:done` + steps)
- QR profile share overlay (own) — themes/camera scan/share/copy/download + viewer share paths
- Avatar overlay (`data-pfav` → `pf-avov`)
- `pedit` Edit profile — fields, validation, username rename migration
- Own entries: `+` composer asset mode, `pf-pfo` portfolio, `pf-cta` empty-state, `pf-menu` settings
- Guest gating map + Member Sheet
- Deviations vs spec เดิม + dead controls + quirks

## Out Of Scope (module อื่นเป็นเจ้าของ)

- Post model / composer / Edit info / own-post menu anatomy+rows — canonical [02_FEED_MODULE.md](02_FEED_MODULE.md) (FSP-015a/b lock); เอกสารนี้ระบุเฉพาะ entry + surface differences
- Post Viewer `pfp` mechanics/sheets — canonical [03_SEARCH_FILTER_MODULE.md](03_SEARCH_FILTER_MODULE.md) (FSP-016); เอกสารนี้ระบุเฉพาะ `pf-tile` entry + `pf-foll`/`pfp-follow` + `pm-*` surface
- Post Detail layer — [05_ASSET_DETAIL_MODULE.md](05_ASSET_DETAIL_MODULE.md) (FSP-018); เอกสารนี้ระบุเฉพาะ reachability (own tabs)
- Drawer/`pfkind`/sell/`sold:`/`pfasset:`/`portfolio`/`soldhist` internals — [04_ASSET_MANAGEMENT_MODULE.md](04_ASSET_MANAGEMENT_MODULE.md) (FSP-017) + [14_PORTFOLIO_MODULE.md](14_PORTFOLIO_MODULE.md) (FSP-024)
- Comments/likes/share/save sheet internals — 02_FEED + [11_SOCIAL_MODULE.md](11_SOCIAL_MODULE.md) (FSP-022); `shareSheetHTML` reuse แค่ระบุ entry
- Settings pages (blocked list `m-unblock`, favorites, muted, archive) — [13_SETTINGS_MODULE.md](13_SETTINGS_MODULE.md); เอกสารนี้ระบุเฉพาะ `pf-menu` entry + shared sets contract
- Chat room + threads — [07_CHAT_MODULE.md](07_CHAT_MODULE.md) (FSP-020); `pf-msg` dead documented เท่านั้น
- Report post flow + moderation semantics + `PM_REASONS` — [15_TRUST_SAFETY_MODULE.md](15_TRUST_SAFETY_MODULE.md); เอกสารนี้ระบุเฉพาะ user-report path จาก profile
- Watch Alert — [10_WATCH_ALERT_MODULE.md](10_WATCH_ALERT_MODULE.md) (FSP-021)
- Notification internals — [09_NOTIFICATION_MODULE.md](09_NOTIFICATION_MODULE.md) (FSP-021); เอกสารนี้ระบุเฉพาะ profile-related notif types
- External deep-link routing/unavailable states — contract 00_NAV §10
- Member Sheet internals — 00_GLOBAL §11 / 01_AUTH
- BO moderation — master contract เท่านั้น

---

# 6. Screen Mapping

| Screen / State | Prototype | Description |
| --- | --- | --- |
| Owner Profile | `profile:{CP_ME.name}` + `profileHTML` own | head `+`/username/burger + Edit profile/Share profile/`.pf-pfo` + 5 tabs + grid |
| Public Profile | `profile:{username}` + `profileHTML` !own | head back/`...` + Follow|Following⌄/Chat + `@username` chip + followed-by + 3 tabs + grid |
| Blocked Profile | `profile:{u}` isB | masked stats (`0`/`−`/`−`) + empty grid + single `Unblock` |
| Followers / Following | `pfollow:{u}:{followers\|following}` + `pfollowHTML` | EN tab labels + live search + rows (Remove/… pill ตาม own/viewer) |
| About This Account | `about:{u}` + `aboutHTML` | hero + Date joined + Account based in + Verified row |
| Edit Profile | `pedit` + `peditHTML` | avatar + Username/Bio/Link + Save |
| Avatar Overlay | `.pf-avov` (`scr._pfAv` → `pfAvovHTML`) | big avatar + act row (Follow*/Share/Copy link/QR code) |
| QR Overlay | `.pf-qr` (`pfOpenQr`) | full-screen — X/COLOR/Scan QR + QR card + Share profile/Copy link/Download |
| Following Manage Sheet | `mf-open` + `mfSheetHTML` | Add/Remove favorites + Mute + Unfollow |
| Viewer `...` Menu | `pm-open` pm-rows | Report/Block|Unblock/About/Copy URL/Share + Cancel card |
| Block Sheet | `pm-open` + `blkSheetHTML` | avatar + `Block {u}?` + 3 impact rows + Block + Block and report |
| Unblock Dialog | center dlg + `unblockDlgHTML` | `Unblock {u}?` + Unblock/Cancel + `pfRestrictHint` หลัง unblock |
| Report User Stack | `report:pick:`/`report:posts:`/`report:user`/`report:post`/`report:done:` | picker (pg-up) → reasons → done + steps |
| Mute Dialog | center dlg + `muteDlgHTML` | `Mute {u}?` + `Mute posts`/Cancel (shared feed dialog) |
| Remove Follower Dialog | center dlg | `Remove follower?` + Remove/Cancel |
| Member Sheet | `obGate()` | guest gate `Join TukDaeng` (00_GLOBAL §11) |

---

# 7. User States

## Guest

- เปิด public profile ได้ (`[data-pf-user]` entries + `pf-tile` → pfp viewer + `[data-pftab]` switch + `[data-pfgo]` pfollow lists + `data-pfav` avatar overlay shell — ไม่ gate)
- Identity actions ทั้งหมด → Member Sheet `Join TukDaeng` (ดู gate list §9 Guest Gate Rule) — รวม `.pf-sh-share`/`.pf-sh-copy` ที่ unreachable เพราะ `.pf-more` gated ก่อน
- ไม่มี own profile — `[data-navgo="profile"]` gated ที่ bottom nav
- `profileOf` fabricate → guest เปิด profile ชื่อใดก็ render (ไม่มี not-found)

## Member / Viewer (non-owner)

- Full browse: header + stats (กด followers/following เปิด pfollow ได้) + bio + `@username` chip + followed-by row + 3 tabs + grid→pfp viewer
- `pf-foll`: `Follow` → instant; `Following ⌄` → mfSheet (favorites/mute/unfollow)
- `pf-msg` → dead toast `Open a listing to chat with this seller`
- `pf-more` → Report/Block/About/Copy/Share/Cancel
- pfollow lists → `pf-flw` pill flip in place
- pfp viewer: `pfp-follow` instant + fade; `pm-btn` บนโพสต์คนอื่น = report-only menu

## Owner

- ทุกอย่างของ viewer-page layout + head `+` (composer asset mode) + `pf-uname` (`Signed in as` toast) + `pf-menu` → settings
- Actions: `pf-edit` → pedit, `pf-share` → QR overlay, `.pf-pfo` → portfolio
- 5 tabs (`all`/`sale`/`show`/`hide`/`sold`) — `hide`/`sold` = private reachability
- Grid own posts → pfp viewer + `pmOwnMenuHTML` (Pin/Archive/Edit info/Mark as sold|View sale record/Delete — canonical 02)
- pfollow own: followers rows `แชท` (dead) + `x` Remove → `Remove follower?` dlg; following rows `...` → Unfollow/Mute popover
- `pedit` save → rename migration + `Profile updated`

## Blocked Relationship (viewer blocked owner — `PF_BLOCKED`)

- Profile **keep-page** (canonical S-13): head/back/`...` ปกติ + avatar/bio/link ปกติ — stats `0 posts`/`−`/`−`, `data-pfgo` ปิด (ไม่กดได้), grid `No posts yet`, actions = `Unblock` primary เดียว
- `pf-fby` ยัง render ถ้า profile มี followedBy (quirk — §9 Deviations)
- `pf-more` ยังใช้ — `pf-sh-block` row อ่าน `Unblock` → unblockDlg
- Unblock → `Unblocked` toast + restrict-hint banner; ไม่ re-follow

---

# 8. User Flow

## Open Profile Flow

- Entries: `[data-pf-user]` (detail head, caption avatar/name, comments, likes rows, `pv-seller`, search card, pfollow rows, settings rows, chat item/menu) · feed `pfWho` (avatar/who/caption-name) · `data-navgo="profile"` (own) · composer asset-save landing · follow notification · `about:`/`pfollow:` back chains
- `pushSub profile:{u}` — page slides over stack (00_NAV §6.7); back pops + slides out right
- Tab state embed ใน route `profile:{u}:{tab}` — default `all`, unknown tab → `all`

## Tab Switch Flow

- `[data-pftab]` → swap in place (`_subSwap` — ไม่ re-slide, คง scroll); pfollow page ใช้ handler เดียวสลับ `followers`/`following`
- Grid re-render: pins ของ tab นั้นมาก่อน (newest pin first) แล้วตามด้วย un-pinned ตาม natural order

## Grid → Post Flow (reachability)

- `pf-tile` → `openPostViewer(list, pid, 0, false, "Posts", u)` mode `pfp` + `scr._pinTab = tab` (pin context ให้ own-post menu)
- ใน viewer: own post → `pmOwnMenuHTML`; others → `pmMenuHTML` report-only; `View full detail`/`pv-dt` → Post Detail (05)
- **Own `hide`/`sold` tabs = เส้นทางเดียว** ไป hidden/sold post surfaces (viewer + detail + `View sale record`) — FSP-018 handoff
- กริด viewer-profile re-render อัตโนมัติหลัง applyPin (`top.startsWith("profile:")`)

## Follow / Unfollow Flow (per surface — พฤติกรรมต่างกันโดยเจตนา)

| Surface | Fresh follow | ขณะ following |
| --- | --- | --- |
| Feed/post `.follow-btn` | instant → `กำลังติดตาม`/`Following` | กดอีก → confirm sheet `Unfollow @{u}?` + `Unfollow`/`Cancel` (canonical 02_FEED) |
| Profile `pf-foll` | instant → `Following ⌄` + re-render | `Following ⌄` → `mfSheet` (ไม่ใช่ confirm) |
| PV head `pfp-follow` | instant flip → fade-out ~1.2s หลัง follow | instant unfollow (no sheet) |
| Lists `pf-flw` (pfollow) | instant flip in place (row คงที่ — undo ได้) | instant flip back |
| Own following `pf-dots` → `Unfollow` | — | instant + `เลิกติดตามแล้ว`/`Unfollowed` + ลบ row |
| mfSheet `Unfollow` | — | instant + ปิด sheet + re-render (no confirm) |
| report:done `Unfollow` step | — | instant + `Unfollowed` + green check |

- `setFollowing` shared: update ทุก post ของ seller + unfollow ล้าง `favorite`+`muted` (หลุดจาก Settings lists) + feed re-render (`following`/`favorites` tab หรือเมื่อ unmute/unfollow)
- `PF_EXTRA_FOL` cover users ไม่มี feed post (follow จาก pfollow/overlay/list)

## Manage Following Sheet (mfSheet)

- `Following ⌄` → sheet 3 rows: `เพิ่มในรายการโปรด`/`Add to favorites` ↔ `ลบออกจากรายการโปรด`/`Remove from favorites` (star icon flips in place), `ปิดเสียงเตือน`/`Mute` → `muteDlgHTML` center (`Mute {u}?` + `Mute posts`/`Cancel` → `Muted` toast), `เลิกติดตาม`/`Unfollow` → instant

## Followers / Following Flow

- Stats `followers`/`following` → `pushSub pfollow:{u}:{tab}` (slides over; back ออกขวา คง scroll profile)
- Tabs EN labels `{n} followers`/`{n} following`; `pfl-q` live filter → `No results found`
- Row แตะ → `pushSub profile:{user}` (ยกเว้นกด action button ใน row)
- Own `followers` rows: `แชท`/`Chat` (dead toast) + `x` → `Remove follower?` dlg (`We won't let {u} know…` + `Remove` danger/`Cancel`) → `PF_REMOVED_FOL` + หายจาก list
- Own `following` rows: `...` → `pfl-pop` popover (`Unfollow` instant + row remove / `Mute`|`Unmute`)
- Viewer lists: `pf-flw` pill เท่านั้น; self ไม่ขึ้นใน list คนอื่น; own non-member (session `new`) → lists ว่าง

## Viewer `...` Menu Flow

- `pf-more` → pm-rows card: `Report` (danger) / `Block`|`Unblock` / `About this account` / `Copy profile URL` / `Share this profile` + cancel card `Cancel`
- `Report` → `rpPush report:pick:{u}` (`pg-up` slide-up ทับ sheet; sheet snap shut `pmDropCovered` ~300ms)
- `Block` → `blkSheetHTML` (หรือ `unblockDlgHTML` ถ้า blocked อยู่แล้ว)
- `About this account` → `pushSub about:{u}`
- `Copy profile URL` → toast `Profile link copied` (toast-only — ไม่แตะ clipboard)
- `Share this profile` → `shareSheetHTML()` generic (canonical 11_SOCIAL)
- `Cancel`/backdrop → ปิด

## Report User Flow

- `report:pick:{u}`: `What do you want to report?` → `A specific post` → `report:posts:{u}` (rp-tile picker grid + Select ทีละรูป + `Next` → `report:post`) หรือ `Something about this account` → `report:user`
- `report:user`/`report:post`: `Why are you reporting this account/post?` + `PM_REASONS` rows → `report:done:{u}`
- `report:done:{u}`: `Thanks for your feedback` + step rows (Block→blkSheet / Unblock→unblockDlg / Unfollow→instant+`Unfollowed` / Mute→muteDlg / Unmute→instant+`Unmuted`) — step สำเร็จ disabled + green check; `Done`/`X` → `rpClose` + toast `Report submitted · thanks for letting us know`
- report **ไม่** ซ่อน profile — reported profile ยังเปิดได้ปกติ
- `blk-rep` (`Block and report` ใน blkSheet) = block ก่อน แล้วเข้า `report:pick:{u}` เดิม

## Block / Unblock Flow

- Entries: `pf-sh-block` / report done step `block` / chat report (canonical 07/15)
- `blkSheetHTML`: avatar + `Block {u}?` + `This will also block any other profiles they may have or create in the future.` + 3 impact rows (won't message/find profile · won't be notified · unblock anytime in Settings) + `Block` + `Block and report` (fromChat → เฉพาะ `Block`)
- `Block` → `pfSetBlocked(true)` (`PF_BLOCKED` + `PF_REMOVED_FOL` + unfollow + chat `th.blocked` + `p.blocked` ทุกโพสต์ + feed re-render) → re-render `profile:`/`report:done:`/`chmenu:`/`chatroom:` ถ้าอยู่บน top → toast `Blocking`
- Unblock entries: blocked-profile `pf-unblock` / `pf-sh-block` (label `Unblock`) / settings `m-unblock` / report step → `unblockDlgHTML` (`Unblock {u}?` + desc `…will now be able to request to follow and message you… won't be notified…` + `Unblock`/`Cancel`)
- `Unblock` → `pfSetBlocked(false)` (ไม่ re-follow) → toast `Unblocked` + `pfRestrictHint` banner ~6s (tap dismiss; `Learn more` dead)

## QR Share Flow (own profile)

- `pf-share` → `pfOpenQr` → full-screen `.pf-qr` (dataset.u = own username)
- Head: `X` close (`pfCloseQr` — ลบ share-open ด้วย) · `COLOR` (cycle `PF_QR_THEMES` 5 ชุด สลับ fg/bg repaint) · `Scan QR`
- Mid: QR card (SVG dots + finder + `@USERNAME` ใต้ QR) — payload = `https://tukdaeng.app/u/{username}`
- Actions: `Share profile` → `shareSheetHTML()` · `Copy link` → `pfCopyText` + `Link copied` · `Download` → PNG 1080px via canvas + `QR code saved`
- `Scan QR`: `getUserMedia` env camera + `BarcodeDetector` poll ~600ms → `Profile QR scanned`/`QR code scanned`; ไม่มี API → `Camera isn't available on this device`; denied → `Allow camera access to scan a QR code`; `pf-cam-x` ปิด cam; hint `Point your camera at a QR code`

## Avatar Overlay Flow

- `data-pfav` (avatar บน profile) → `scr._pfAv` → `pfAvovHTML` — tap พื้นว่าง/นอก act+img → ปิด
- Viewer acts: `Follow`/`Following` (toggle จริง) + `Share` (`Profile shared`) + `Copy link` (`Profile link copied`) + `QR code` (dead `QR code isn't in this prototype yet`)
- Own acts: `Share`/`Copy link`/`QR code` (dead) — **ไม่มี** Follow row
- Guest: overlay เปิดได้แต่ทุก `.pf-avov-act` gated → Member Sheet

## Edit Profile Flow

- `pf-edit` → `pushSub pedit` — head `แก้ไขโปรไฟล์`/`Edit profile` + avatar + `เปลี่ยนรูปโปรไฟล์`/`Edit picture` (dead → `Photo picker isn't in this prototype yet`)
- Fields: `ชื่อผู้ใช้`/`Username` (maxlength 20) · `ประวัติโดยย่อ`/`Bio` (maxlength 150) · `ลิงก์`/`Link`
- `pe-save` validate: username `trim().toLowerCase()` + `^[a-z0-9_.]{3,20}$` + unique (vs `PROFILES` keys + `POSTS.seller`) → bio ≤150 → link `peValidLink` (`@handle` / bare domain / http(s) URL) — fail → `pe-err` inline + `is-err` + focus first invalid
- Save OK → rename migration ครบ (`PROFILES` key, `POSTS.seller`, `COMMENTS` names+replies, `followedBy` arrays, `PF_BLOCKED`/`PF_REMOVED_FOL`/`PF_EXTRA_*`, `fo_newuser` storage, `obSaveAccount`, `_subStack` `profile:` keys) + `o.disp = uname` → `subBack` → `Profile updated`

## Owner Entry Flows

- `+` (head) / `pf-cta` (empty all tab) → `data-flow="create" data-mode="asset"` → composer asset mode (canonical 04) → save กลับ `profile:{me}` + asset บนหัวกริด
- `.pf-pfo` (wallet icon) → `portfolio` (canonical 04/14 — member-only; non-member เห็น `ไม่พบข้อมูล`)
- `.pf-menu` (burger) → `settings` (entry เดียวของ Settings — canonical 00_NAV §7/13)

---

# 9. Business Rules

## Profile Route & Data Rule

- `profile:{username}` sub-page route (00_NAV §6.6) — `own` เมื่อ `uname === CP_ME.name` เท่านั้น; tab embed ใน key `profile:{u}:{tab}`
- `profileOf(name)` fabricate profile ให้**ทุก** username: avatar gen, `disp` = name, bio default `⌚ watch collector`, stats hash-mock (`120+h%4800` followers / `120+h%800` following ถ้าไม่มี seed) — **ไม่มี user-not-found reachability ใน prototype** (contract §18)
- `posts` stat = `u.posts` seed หรือ `pfTabPosts(u,"all").length`; `followers`/`following` = seed string (เช่น `21.1K`) — new session seed `0`
- `ring` = `u.story` หรือ own profile เสมอ; `followedBy`/`fbyMore` viewer-only + mock จาก `followedSellers` ถ้าไม่มี seed

## Own vs Viewer Rule

| Element | Own | Viewer |
| --- | --- | --- |
| Head left | `+` → composer asset mode | `sub-back` |
| Head center | `pf-uname` → `Signed in as {me}` toast | — |
| Head right | `pf-menu` burger → `settings` | `pf-more` `...` |
| Actions | `แก้ไขโปรไฟล์`/`Edit profile` + `แชร์โปรไฟล์`/`Share profile` + `.pf-pfo` wallet | `ติดตาม`/`Follow` ↔ `กำลังติดตาม ⌄`/`Following ⌄` + `แชท`/`Chat` (dead) — blocked: `เลิกบล็อก`/`Unblock` เดียว |
| Tabs | `all`/`sale`/`show`/`hide`/`sold` (5) | `all`/`sale`/`show` (3) |
| Extras | `pf-note` bubble / `pf-sleep` chip (dead toasts) | `pf-atch` @username chip + `pf-fby` followed-by |
| Bottom nav | Profile active | **Feed active** (`pfNavHTML(false)` quirk) |

## Grid Content Rule (`pfTabPosts`)

- Pool = `PF_MINE` (drawer-only) + `userPosts(uname)` (POSTS seller) + gfx mock posts (`PF_GFX_REG`); กรอง `!archived` (mirror `userPosts`)
- `all` = ทุก kind; tab อื่น filter `pfKind === tab`; `pfKind` fallback = `p.pfkind || (price || type==="sale" ? "sale" : "show")` (canonical 04)
- Deleted gfx tombstone `PF_GFX_DEL` — ไม่ regenerate
- Pin: `p.pins[tab]` per-tab; pinned-first sort `pins[tab]` desc (newest pin ก่อน); `PIN_MAX = 3` ต่อ tab — เกิน → `Pin limit reached` dlg (`You can only pin up to three posts… will replace your oldest pinned post` + `Confirm`/`Cancel` → replace oldest); unpin กลับ natural slot; feedback `Pinning…`/`Your post has been pinned` pill→toast (canonical pin rule 02_FEED)
- Tile = `photos[0]` + stack badge (multi-photo) หรือ clip play icon + `pf-pin` marker เมื่อ pin ใน tab ปัจจุบัน — **ไม่มี status badge / ไม่มี `...` / ไม่มี quick actions** (deviation จาก spec เดิม)

## Tab Visibility Rule (canonical)

- Public profile: viewer เห็นเฉพาะ `Sale`+`Show` posts (00_GLOBAL §10 + AC-GLOBAL-003) — `post`/`hide`/`sold` kinds ต้องไม่ขึ้นบน viewer grid/tab ใด ๆ
- Owner profile: `all` = ทุก kind ของตัวเอง (incl. `post`/`hide`/`sold`); `hide`/`sold` tabs = private reachability (owner เท่านั้น)
- **Prototype defect (S-14 — 00_GLOBAL §10 note)**: viewer `all` render `pfTabPosts` ทั้ง pool — leak `post`/`hide`/`sold` ของผู้อื่นขึ้น grid → **ถือเป็น defect ไม่ copy เป็น spec**; canonical = filter ตาม matrix ข้างบน (`report:posts:` picker ใช้ `pfTabPosts "all"` — leak class เดียวกัน)

## Profile-Grid Reachability Rule

- Own `hide`/`sold` tabs → `pf-tile` → `pfp` viewer → `View full detail`/`pv-dt`/`pm-own-soldview` = **เส้นทางเดียว** ของ hidden/sold post detail + sold record (FSP-018 handoff; canonical visibility ไม่เปลี่ยน)
- `archived` post หลุด grid ทุก tab (ยังอยู่ใน Archive page — canonical 02/13)

## Follow / Favorite / Mute Rule

- Follow = account-level (`pfSetFollow` → `setFollowing` ทุก post ของ seller / `PF_EXTRA_FOL` สำหรับ user ไม่มี post); state sync ข้าม feed/profile/viewer head/lists
- Per-surface behavior ตาม §8 table — **ห้าม normalize เป็น confirm เดียว** (feed = confirm sheet, profile/lists/viewer-head/report-step = instant)
- Unfollow ล้าง `favorite`+`muted` ของ seller นั้น (หลุด Settings `favorites`/`muted` lists)
- Self ไม่ปรากฏใน lists คนอื่น; `pf-foll`/`pf-flw`/`pfp-follow` ทั้งหมด gated สำหรับ guest

## Remove Follower Rule

- Own followers tab เท่านั้น (`pf-rmf` x) — `PF_REMOVED_FOL` ซ่อน row; block อัตโนมัติ add เข้า `PF_REMOVED_FOL` ด้วย; ไม่แจ้งอีกฝ่าย (`We won't let {u} know…`)

## Block Rule

- `PF_BLOCKED` session set — effects: unfollow + add removed-follower + `th.blocked` ทุก thread + `p.blocked` ทุกโพสต์ (feed eligibility ตัดออก — canonical 02) + blocked-profile keep-page render
- Keep-page contract (S-13/00_NAV): masked stats `0 posts`/`−`/`−`, `data-pfgo` ปิด, grid `ยังไม่มีโพสต์`/`No posts yet`, `Unblock` primary — **ไม่ใช่** generic unavailable page ของ spec เดิม
- Unblock: ไม่ re-follow + `Unblocked` + `pfRestrictHint` (restrict feature ไม่มีใน V1 — banner เท่านั้น)
- Shared กับ Settings `blocked` list (`m-unblock` → dlg เดียวกัน) + chat (`th.blocked`)

## Report User Rule

- `pf-sh-report`/`blk-rep` → `report:pick:{u}` (`pg-up` rounded-picker style) → branches `report:posts:{u}` (tile picker → `report:post`) / `report:user` → `report:done:{u}`
- `report:done` steps = real actions (Block/Unblock/Unfollow/Mute/Unmute) + green-check completed + `Done` → `Report submitted · thanks for letting us know`
- Report ไม่เปลี่ยน visibility — reported profile ยังเปิดได้; reason set = `PM_REASONS` (canonical 15)
- `report:` stack ทับ profile — `rpBack`/`rpClose` คืน profile ข้างล่าง (stack mechanics canonical 00_NAV §6.7)

## Share & QR Rule

- `pfProfileLink` = `https://tukdaeng.app/u/{encodeURIComponent(username)}` — payload ของ QR + Copy link
- QR overlay **own profile เท่านั้น** (`.pf-share` gated + own action เท่านั้น) — viewer share path = `pf-sh-share` generic sheet + `pf-sh-copy` toast-only
- `pf-qr-*` = real behaviors (themes/copy/download/camera); avatar-overlay `qr` action = dead toast (inconsistency — §19)

## Edit Profile Rule

- Fields = Username/Bio/Link เท่านั้น — Phone/LINE/Email = contract-only per 13_SETTINGS (prototype ไม่มี contact rows)
- Username = identity key → rename migration ครบทุก reference (list §8) + `disp` sync = username (ไม่มี display name แยกใน V1)
- Entry เดียว = own profile `pf-edit` (S-05 — ไม่มี row ใน Settings)

## About This Account Rule

- `pf-sh-about` → `about:{u}` — hero (avatar + name + `PF_VBADGE` เมื่อ verified) + community note + `Date joined` (hash-mock month/year; TH +543) + `Account based in Thailand` + `Verified` row (เฉพาะ verified) + verified foot note

## Navigation & Back Rule

- `profile:`/`pfollow:`/`about:`/`pedit` push บน `_subStack` — back pop + slide ออกขวา (pfollow back พิเศษ: คง scroll profile ข้างล่าง)
- `data-pftab` swap ไม่ re-slide; viewer `pfNavHTML(false)` → Feed tab active (quirk — §19)
- `pedit` save → `subBack` กลับ profile; QR overlay ไม่ใช่ stack page (`.pf-qr` in-page overlay)

## Guest Gate Rule

- **Free browse**: `[data-pf-user]` entry, profile page render, `[data-pftab]`, `.pf-tile` → pfp viewer, `[data-pfgo]` pfollow lists, `pfl-q` search, `data-pfav` overlay shell
- **Gated → Member Sheet**: `[data-navgo="profile"]` (own profile ทั้งหน้า), `[data-flow]` (`+`/`pf-cta`), `.pf-foll`, `.pf-flw`, `.pf-msg`, `.pf-avov-act`, `.pf-dots`, `.pf-rmf`, `.pf-unblock`, `.pf-more`, `.pf-menu`, `.pf-edit`, `.pf-share`, `.pf-sh-report`, `.pf-sh-block`, `.pf-sh-share`, `.pm-own-*`/`.pm-go-report` ใน pfp
- `pf-sh-copy`/`pf-sh-about` ไม่อยู่ใน selector แต่ unreachable (ต้องผ่าน `.pf-more` ที่ gated)
- Spec เดิมอนุญาต "guest share public profile/asset โดยไม่ login" — **ถูกแทนด้วย gate จริง** (canonical S-03, 00_GLOBAL §11)

## Deviations & Dead-Code Notes (spec เดิม → prototype)

1. **Post-centric grid** — spec เดิม asset cards + quick actions; prototype `pf-tile` = โพสต์ (photos[0] + stack/clip/pin เท่านั้น)
2. **ไม่มี Total Asset Value** บน profile — portfolio entry = `.pf-pfo` icon เท่านั้น (canonical 04)
3. **Owner head** = `+`/username/burger→settings — ไม่มี `...` own menu / share-sheet เดิม (share = `pf-share` QR แยก)
4. **Public `all` leak** (S-14 canonical defect) — spec ใช้ canonical sale+show, flag defect ที่ §19
5. **Blocked = keep-page** (canonical) — spec เดิมบอก unavailable/not-found state; prototype render constrained page
6. **Block confirm = `blkSheet`** bottom sheet (ไม่มี Cancel row — dismiss ผ่าน backdrop) + `Block and report` — spec เดิม center `Block this user?` + Cancel
7. **Report done** = `Thanks for your feedback` + steps + `Done` toast — spec เดิม `Report submitted` dialog + "remain visible" copy
8. **Share own = QR overlay** — spec เดิม share-sheet + preview card; viewer `pf-sh-copy` = toast-only (ไม่ copy จริง — ต่างจาก `pf-qr-copy` ที่ใช้ `pfCopyText`)
9. **Guest share gated** — spec เดิม AC บอก guest share ได้; gate list จริงล็อกทุก share path (canonical S-03)
10. **Edit profile fields** = username/bio/link — spec เดิม username/phone/LINE/email (contact = contract-only 13_SETTINGS)
11. **Unfollow behaviors หลาย surface** — spec เดิมบังคับ confirm sheet เดียวทุกจุด; prototype แยก feed-confirm vs profile/list instant (documented §8)
12. **`pf-msg` Chat dead** — toast `Open a listing to chat with this seller` (chat เข้าผ่าน listing เท่านั้น — 07)
13. **Followers/following pages + Remove follower + manage popover** — ใหม่ทั้งชุด (spec เดิมไม่มี)
14. **About this account** — ใหม่ (spec เดิมไม่มี)
15. **Avatar overlay** — ใหม่; `qr` act dead ทั้งที่ `pf-share` เปิด QR จริง (inconsistency)
16. **IG extras**: verified badge (`PF_VBADGE` — spec เดิม out-of-scope), story ring, category, link chip, `pf-note`, `pf-sleep`, `pf-addchip`, `pf-avadd` — note/sleep/addchip/avadd dead toasts
17. **Viewer nav ไฮไลต์ Feed** (`pfNavHTML(false)`) — ไม่ใช่ Profile/ไม่ใช่ none
18. **`pf-fby` render บน blocked page** ถ้ามี followedBy data (quirk)
19. **Stats hash-mock + string format** (`21.1K`); `profileOf` fabricate → ไม่มี not-found
20. **`report:posts:` picker = `pfTabPosts "all"`** — leak hide/sold tiles (S-14 class เดียวกัน)
21. **`pfp-follow` fade-out** ~1.2s หลัง follow (pv head)
22. **Session-only state**: follow/fav/mute/block/removed/pins/gfx tombstones/QR theme — refresh หาย (persistence = contract §18)
23. **EN-hardcoded strings** (language sweep FSP-026): pfollow labels/empties/`Search username`, QR labels+toasts, `blkSheet`/`unblockDlg`/`Remove follower?`/`Pin limit reached` ทั้งก้อน, `Blocking`/`Unblocked`/`Unfollowed`/`Muted`/`Unmuted`/`Profile shared`/`Profile link copied`/`QR code…`/`Link copied`/`QR code saved`/`Signed in as`/`Camera…`/`Allow camera…`
24. **`pf-sh-share` อยู่ใน gate list แต่ unreachable** (`.pf-more` gated ก่อน) — belt-and-suspenders
25. **`.pf-menu` → `settings` direct**; `.set-btn` dead (canonical 13)
26. **`pedit` `o.disp = uname`** — save เปลี่ยน disp ตาม username เสมอ (ไม่มีช่อง display name แยก)
27. **own follower rows มี `pf-msg` dead ด้วย** — Chat button ซ้ำซ้อนกับ profile `pf-msg`
28. **`report:done` ใน stack `rp-over` ทับ pv** — block จาก done แล้ว re-render `report:done:{u}` ให้ step กลาย Unblock พร้อมใช้

---

# 10. Permission Rules

## Guest

| Action | Allowed? |
| --- | --- |
| เปิด public profile / เลื่อนดู / สลับ tabs | ✓ |
| แตะ grid tile → Post Viewer `pfp` | ✓ |
| เปิด followers/following lists + search | ✓ |
| เปิด avatar overlay | ✓ (acts ใน overlay gated) |
| Follow / unfollow / favorite / mute (ทุก surface) | ✗ → Member Sheet |
| Chat (`pf-msg`) | ✗ → Member Sheet |
| `...` viewer menu (`pf-more`) + Report/Block/Share ในนั้น | ✗ → Member Sheet |
| Own profile / Edit / QR / `+` / `pf-pfo` / `pf-menu` | ✗ → Member Sheet (หรือ unreachable) |
| Own-post menu rows (`pm-own-*`) ใน pfp | ✗ → Member Sheet |

## Member / Viewer

- Browse + follow/unfollow/fav/mute/report/block/share/copy/about ครบตาม §8 — Chat button แสดงแต่ dead
- เห็นเฉพาะ `Sale`+`Show` บน viewer grid (canonical; defect §19)

## Owner

- ทุก surface ของตัวเองเต็ม + private tabs `hide`/`sold` + own-post menu + pin + followers/following management + pedit + QR + portfolio + settings

## Blocked

- Viewer-ที่ถูกเราบล็อก (เราเปิดดู): keep-page ตาม §9 Block Rule — actions = Unblock เท่านั้น (+ `...` menu ยังเปิดได้)
- ผู้ถูกบล็อกฝั่งตรงข้าม: contract — ไม่เห็น profile/โพสต์เรา (00_GLOBAL §13; prototype ไม่จำลองฝั่ง reverse)

---

# 11. Validation Rules

| Field / Input | Rule |
| --- | --- |
| `pe-name` Username | `trim().toLowerCase()` + `^[a-z0-9_.]{3,20}$` + unique vs `PROFILES` keys + `POSTS.seller` — fail → `pe-err` inline + `is-err` + focus first invalid (`ชื่อผู้ใช้ต้องมี 3–20 ตัวอักษร`/`ชื่อผู้ใช้นี้ถูกใช้แล้ว` class messages) |
| `pe-bio` Bio | `maxlength=150` (input-level clamp) — ไม่มี error path เพิ่ม |
| `pe-link` Link | `peValidLink`: `^@[A-Za-z0-9_.]{1,30}$` หรือ bare domain (`(www\.)?a-z0-9-(.a-z0-9-)+(/…)?`) หรือ `new URL` protocol http/https — ว่าง = OK (ลบ link); fail → `pe-err` + `is-err` |
| `pfl-q` Search username | live filter case-insensitive บน row names — ไม่ match → `No results found` (ไม่มี error) |
| Username ตอนเปิด profile | ไม่ validate (route key ตรง ๆ) — `profileOf` fabricate ถ้าไม่มี data |
| Pin | `PIN_MAX=3` ต่อ tab → `Pin limit reached` confirm-replace-oldest (ไม่ใช่ error block) |

---

# 12. Exception Handling

| Case | Behavior |
| --- | --- |
| Username ไม่มีในระบบ | `profileOf` fabricate — render profile ปกติด้วย mock data (contract: not-found state = 00_NAV §10; prototype ไม่มี reachability) |
| Blocked deep link / ไม่มีสิทธิ์ | keep-page semantics (canonical) — external deep-link unavailable contract 00_NAV §10 |
| Camera ไม่รองรับ (`!getUserMedia`/`!BarcodeDetector`) | toast `Camera isn't available on this device` |
| Camera denied | toast `Allow camera access to scan a QR code` |
| QR scan สำเร็จ | `Profile QR scanned`/`QR code scanned` (ไม่มี navigation — demo) |
| `pf-sh-copy` (viewer menu) | toast `Profile link copied` — **ไม่** copy จริง (ต่างจาก `pf-qr-copy` ที่ใช้ `pfCopyText`) |
| เปิด `portfolio` โดยไม่ใช่ member | `ไม่พบข้อมูล`/`No data found` (canonical 04) |
| Pin เกิน limit | replace-oldest confirm dlg (ไม่ใช่ hard error) |
| `archived` post | หลุด grid เงียบ ๆ — ไม่มี placeholder |
| Delete post จาก pfp | tile หลุด grid + `PF_GFX_DEL` tombstone (gfx ไม่ regenerate) |
| Rename ซ้ำชื่อตัวเองเดิม | `uname === oldName` → save path ปกติ (no-op migrate) |
| `profile:` stack key ระหว่าง rename | `_subStack` rewrite `profile:{old}` → `profile:{new}` — back chain ไม่พัง |

---

# 13. Empty State

| Surface | Copy |
| --- | --- |
| Own `all` ว่าง | `เพิ่มสินทรัพย์ชิ้นแรกของคุณ`/`Add your first asset` + `สินทรัพย์ที่บันทึกและโพสต์ที่แชร์จะแสดงที่นี่`/`Assets you save and posts you share will show up here.` + `เพิ่มสินทรัพย์ใหม่`/`Add asset` CTA |
| Own tab อื่นว่าง | `ยังไม่มีโพสต์ในแท็บ{label}`/`No {label} posts` (label = ชื่อ tab localized) |
| Viewer `all` ว่าง / blocked | `ยังไม่มีโพสต์`/`No posts yet` (icon camPlain) |
| Viewer tab อื่นว่าง | `No {label} posts`/`ยังไม่มีโพสต์ในแท็บ{label}` |
| pfollow followers ว่าง | `No followers yet` (EN hardcode) |
| pfollow following ว่าง (own) | `You're not following anyone yet` (EN) |
| pfollow following ว่าง (viewer) | `Not following anyone yet` (EN) |
| pfollow search ไม่เจอ | `No results found` (EN) |
| Own lists (session `new`) | empty ทั้งสอง tab |

---

# 14. Notification Rules

| Event | Notification |
| --- | --- |
| Member follow user | `type:"follow"` ตาม canonical 00_NAV §8/09 — destination `profile:{follower}` (model มี seed; session ไม่ generate) |
| Unfollow / Remove follower / Block / Unblock / Mute | **ไม่มี** notification อีกฝ่าย (`They won't be notified…` / `We won't let {u} know…`) |
| Report สำเร็จ | ไม่มี notif ต่อผู้ถูกรายงาน — toast `Report submitted · thanks for letting us know` ฝั่ง reporter เท่านั้น |

---

# 15. Analytics Events

Contract-level (prototype ไม่มี analytics layer — เก็บ event ที่หน้า profile ควร emit):

| Event | Trigger |
| --- | --- |
| `profile_open` | pushSub `profile:{u}` (own/viewer variant) |
| `profile_tab_switch` | `[data-pftab]` บน profile |
| `profile_tile_open` | `pf-tile` → pfp viewer |
| `profile_follow` / `profile_unfollow` | `pfSetFollow` on/off (ทุก surface: pf-foll/mfSheet/pfp-follow/pf-flw/pfl-pop/report step) |
| `profile_followers_open` / `profile_following_open` | `data-pfgo` |
| `profile_remove_follower` | `dlg-rmf-go` |
| `profile_favorite_toggle` / `profile_mute_toggle` | `mf-fav` / mute confirm / pfl-pop mute |
| `profile_block` / `profile_unblock` | `blk-go` / `dlg-unblk-go` |
| `profile_report_start` / `profile_report_done` | `pf-sh-report` → `report:pick` / `rp-done` |
| `profile_menu_open` | `pf-more` |
| `profile_copy_url` | `pf-sh-copy` / `pf-qr-copy` |
| `profile_share` | `pf-sh-share` / `pf-qr-share` |
| `profile_qr_open` / `profile_qr_color` / `profile_qr_download` / `profile_qr_scan_open` / `profile_qr_scanned` | `.pf-qr` actions |
| `profile_edit_open` / `profile_edit_save` / `profile_edit_photo_tap` | `pf-edit` / `pe-save` / `pe-pic` |
| `profile_portfolio_open` | `.pf-pfo` |
| `profile_settings_open` | `pf-menu` |
| `profile_avatar_overlay_open` | `data-pfav` |

---

# 16. Acceptance Criteria

## Profile Page & Entries

| ID | Acceptance Criteria |
| --- | --- |
| AC-PROFILE-001 | Owner profile ต้องแสดง head `+` (composer asset) + username button + burger→settings และ actions `Edit profile`/`Share profile`/`.pf-pfo` |
| AC-PROFILE-002 | Viewer profile ต้องแสดง head `sub-back` + `pf-more` `...` และ actions `Follow`↔`Following ⌄` + `Chat` พร้อม `@username` chip และ `pf-fby` เมื่อมี followedBy |
| AC-PROFILE-003 | Profile ต้องเปิดได้จาก `[data-pf-user]` ทุก surface (detail head/caption/comments/likes/pv-seller/search/pfollow/settings/chat) + feed `pfWho` + `data-navgo="profile"` + composer-save landing + follow notification |
| AC-PROFILE-004 | `+` บน own head และ `pf-cta` บน empty `all` ต้องเปิด composer `data-flow="create" data-mode="asset"` และ save แล้วกลับ `profile:{me}` |
| AC-PROFILE-005 | `.pf-pfo` ต้อง push `portfolio` route (canonical 04) และต้องไม่มี Total Asset Value บน profile page |
| AC-PROFILE-006 | `pf-menu` ต้อง push `settings`; `pf-uname` ต้อง toast `Signed in as {me}`; `pf-edit` ต้อง push `pedit`; `pf-share` ต้องเปิด `.pf-qr` overlay |
| AC-PROFILE-007 | Bottom nav บน own profile ไฮไลต์ Profile; viewer profile ไฮไลต์ Feed (`pfNavHTML`) |
| AC-PROFILE-008 | Profile page ต้อง render avatar+story ring(เมื่อ `ring`)+disp+stats+bio(cat/text/link chip)+verified badge(เมื่อ `verified`) — `pf-note`/`pf-sleep` render เมื่อมี data และ dead-toast เมื่อแตะ |

## Tabs & Grid

| ID | Acceptance Criteria |
| --- | --- |
| AC-PROFILE-009 | Owner tabs ต้องเป็น `all`/`sale`/`show`/`hide`/`sold` (icon+label, `pf-tab-txt`) ตามลำดับ |
| AC-PROFILE-010 | Viewer tabs ต้องเป็น `all`/`sale`/`show` เท่านั้น |
| AC-PROFILE-011 | `all` tab ต้องแสดง grid posts ทั้งหมดที่ `!archived` (PF_MINE + userPosts + gfx) |
| AC-PROFILE-012 | Tab `sale`/`show`/`hide`/`sold` ต้อง filter `pfKind === tab`; `pfKind` fallback = `price \|\| type==="sale" ? "sale" : "show"` |
| AC-PROFILE-013 | Pinned posts ต้องขึ้นก่อนต่อ tab (newest pin ก่อน), `PIN_MAX=3` ต่อ tab เกิน → `Pin limit reached` replace-oldest |
| AC-PROFILE-014 | `pf-tile` ต้องแสดง `photos[0]` + stack badge (multi-photo) หรือ clip icon + `pf-pin` เมื่อ pin tab นั้น — ต้องไม่มี status badge/`...`/quick actions |
| AC-PROFILE-015 | `pf-tile` ต้องเปิด Post Viewer mode `pfp` (`openPostViewer` title `Posts`) พร้อม `_pinTab` = tab ปัจจุบัน |
| AC-PROFILE-016 | Own `hide`/`sold` tabs ต้องเป็น reachability เดียวของ hidden/sold post detail (viewer + `View sale record`) |
| AC-PROFILE-017 | Canonical: viewer grid ต้องมีเฉพาะ `Sale`+`Show` (00_GLOBAL §10) — public `all` leak ของ prototype ถือเป็น defect ตาม §19 |
| AC-PROFILE-018 | `[data-pftab]` ต้อง swap grid in place (ไม่ slide, คง scroll) — tab state embed `profile:{u}:{tab}`, unknown → `all` |

## Follow / Favorite / Mute

| ID | Acceptance Criteria |
| --- | --- |
| AC-PROFILE-019 | `pf-foll` fresh → follow instant + re-render เป็น `Following ⌄`; `Following ⌄` ต้องเปิด `mfSheet` (ไม่ใช่ unfollow confirm) |
| AC-PROFILE-020 | `mfSheet` ต้องมี Add/Remove favorites (icon flips in place) + Mute → `muteDlg` (`Mute posts`) + Unfollow → instant ไม่ confirm |
| AC-PROFILE-021 | Feed `.follow-btn` ขณะ following ต้องเปิด `Unfollow @{u}?` confirm sheet (canonical 02) — ต่างจาก profile surface โดยเจตนา |
| AC-PROFILE-022 | `pf-flw` ใน pfollow lists ต้อง flip in place (ไม่ re-render, row คง, undo ได้) |
| AC-PROFILE-023 | `pfp-follow` ใน viewer head ต้อง instant toggle + fade-out ~1.2s หลัง follow |
| AC-PROFILE-024 | Unfollow ต้องล้าง `favorite`+`muted` ของ seller (หลุด Settings lists) และ update ทุก post ผ่าน `setFollowing` |
| AC-PROFILE-025 | User ไม่มี feed post ต้อง follow ได้ผ่าน `PF_EXTRA_FOL` (เช่น จาก pfollow/overlay) |

## Followers / Following

| ID | Acceptance Criteria |
| --- | --- |
| AC-PROFILE-026 | Stats `followers`/`following` (`data-pfgo`) ต้อง push `pfollow:{u}:{tab}`; back ต้อง slide ออกขวา คง scroll profile |
| AC-PROFILE-027 | pfollow ต้องมี tab labels `{n} followers`/`{n} following` + `pfl-q` live search → `No results found` เมื่อไม่ match |
| AC-PROFILE-028 | Own followers rows ต้องมี `Chat` (dead toast) + `x` → `Remove follower?` dlg → `PF_REMOVED_FOL` + row หาย (ไม่แจ้งอีกฝ่าย) |
| AC-PROFILE-029 | Own following rows `...` ต้องเปิด `pfl-pop` — `Unfollow` instant + `Unfollowed` + row remove / `Mute`→`muteDlg` หรือ `Unmuted` |
| AC-PROFILE-030 | Viewer lists ต้องมี `pf-flw` pill เท่านั้น และ self ต้องไม่ปรากฏใน lists ของคนอื่น; own non-member (session `new`) → lists ว่าง |

## Share & QR

| ID | Acceptance Criteria |
| --- | --- |
| AC-PROFILE-031 | QR overlay ต้องมี X / `COLOR` (5 themes cycle) / `Scan QR` + QR card (`https://tukdaeng.app/u/{u}`) + `Share profile`/`Copy link`/`Download` |
| AC-PROFILE-032 | `pf-qr-copy` ต้อง copy จริงผ่าน `pfCopyText` + `Link copied`; `pf-qr-dl` ต้อง download PNG + `QR code saved`; `pf-qr-share` → `shareSheetHTML` |
| AC-PROFILE-033 | `Scan QR` ต้อง `getUserMedia`+`BarcodeDetector` — toasts: scanned/`Camera isn't available on this device`/`Allow camera access to scan a QR code`; `pf-cam-x` ปิด cam |
| AC-PROFILE-034 | Viewer `...` → `Copy profile URL` ต้อง toast `Profile link copied` (toast-only); `Share this profile` → generic share sheet |
| AC-PROFILE-035 | Avatar overlay ต้องแสดง acts ตาม own/viewer — viewer: Follow toggle จริง + Share/Copy/QR (toasts); own: Share/Copy/QR (QR dead toast `QR code isn't in this prototype yet`) |

## Viewer Menu / About / Report / Block

| ID | Acceptance Criteria |
| --- | --- |
| AC-PROFILE-036 | `pf-more` ต้องเปิด menu: `Report`(danger)/`Block`↔`Unblock`/`About this account`/`Copy profile URL`/`Share this profile`/`Cancel` |
| AC-PROFILE-037 | `about:{u}` ต้องแสดง hero(+vbadge)/note/`Date joined`/`Account based in Thailand`/`Verified` row(เฉพาะ verified)+foot note |
| AC-PROFILE-038 | `pf-sh-report` ต้อง push `report:pick:{u}` (pg-up) → `A specific post`→`report:posts`→`report:post` หรือ `Something about this account`→`report:user` → `report:done:{u}` |
| AC-PROFILE-039 | `report:done` ต้องแสดง `Thanks for your feedback` + steps (Block/Unblock/Unfollow/Mute/Unmute จริง + green check) + `Done` → `Report submitted · thanks for letting us know` |
| AC-PROFILE-040 | `blkSheet` ต้องมี avatar + `Block {u}?` + desc + 3 impact rows + `Block` + `Block and report` (fromChat → `Block` เดียว) — ไม่มี Cancel row |
| AC-PROFILE-041 | `Block` ต้อง `pfSetBlocked(true)` (unfollow+removed-fol+`th.blocked`+`p.blocked`+feed re-render) + re-render profile/report top + toast `Blocking`; `Block and report` ต้องต่อ `report:pick:{u}` |
| AC-PROFILE-042 | Blocked profile ต้อง keep-page: stats `0`/`−`/`−`, `pfgo` ปิด, grid `No posts yet`, action `Unblock` เดียว — ไม่ใช่ unavailable page |
| AC-PROFILE-043 | Unblock (ทุก entry) ต้องเปิด `unblockDlg` → `pfSetBlocked(false)` + `Unblocked` + `pfRestrictHint` ~6s และต้องไม่ re-follow |
| AC-PROFILE-044 | Report ต้องไม่ซ่อน profile — reported profile เปิดได้ปกติหลัง `Done` |
| AC-PROFILE-045 | pfp viewer บน own post ต้องใช้ `pmOwnMenuHTML` (incl. Pin); บนโพสต์คนอื่น = report-only menu (canonical 02) |

## Edit Profile

| ID | Acceptance Criteria |
| --- | --- |
| AC-PROFILE-046 | `pedit` ต้องมี avatar + `Edit picture` (dead toast `Photo picker isn't in this prototype yet`) + Username/Bio/Link + `Save` |
| AC-PROFILE-047 | Username ต้อง validate `^[a-z0-9_.]{3,20}$` (lowercase) + unique vs `PROFILES`+`POSTS.seller` — fail → `pe-err`/`is-err`/focus first |
| AC-PROFILE-048 | Link ต้อง validate `peValidLink` (`@handle`/bare domain/http(s) URL; ว่าง = ลบ); Bio clamp maxlength 150 |
| AC-PROFILE-049 | Save ต้อง migrate ทุก reference (PROFILES key/POSTS.seller/COMMENTS/followedBy/PF_BLOCKED/PF_REMOVED_FOL/PF_EXTRA_*/fo_newuser/obSaveAccount/`_subStack` keys) + `disp=uname` → `subBack` + `Profile updated` |

## Guest Gate

| ID | Acceptance Criteria |
| --- | --- |
| AC-PROFILE-050 | Guest ต้องเปิด/browse public profile + tabs + tiles→pfp + pfollow lists + avatar overlay shell ได้โดยไม่ login |
| AC-PROFILE-051 | Guest แตะ gated controls (`[data-navgo="profile"]`/`[data-flow]`/`.pf-foll`/`.pf-flw`/`.pf-msg`/`.pf-avov-act`/`.pf-dots`/`.pf-rmf`/`.pf-unblock`/`.pf-more`/`.pf-menu`/`.pf-edit`/`.pf-share`/`.pf-sh-*`) ต้องเปิด Member Sheet `Join TukDaeng` |
| AC-PROFILE-052 | Guest ต้องไม่เข้าถึง own profile/Edit/QR/portfolio/settings ได้ (gate หรือ unreachable) |

## Contract / Deviation Guard

| ID | Acceptance Criteria |
| --- | --- |
| AC-PROFILE-053 | Profile ต้องไม่แสดง Purchase Price/Date, Sold History, Portfolio Value หรือ Total Asset Value (00_GLOBAL §14) |
| AC-PROFILE-054 | `pf-msg`/`pf-note`/`pf-sleep`/`pf-addchip`/`pf-avadd`/overlay-`qr`/`pe-pic`/`pf-uname` ต้องเป็น dead/demo toasts เท่านั้น — ห้าม spec เป็น feature |
| AC-PROFILE-055 | `profileOf` fabricate ทุก username — ต้องไม่มี user-not-found state ใน V1 prototype semantics (contract §18) |
| AC-PROFILE-056 | State follow/fav/mute/block/removed/pins เป็น session-only — ไม่ persist (contract §18) |

---

# 17. Related Modules

- [00_GLOBAL_RULES_MODULE.md](00_GLOBAL_RULES_MODULE.md) — statuses §9 / visibility §10 (canonical public matrix + S-14 leak note) / guest §11 / block §13 / private §14
- [00_NAVIGATION_AND_CROSS_MODULE_FLOW.md](00_NAVIGATION_AND_CROSS_MODULE_FLOW.md) — routes §6.6 / back §6.7 / entry matrix §7 / notification destinations §8 / deep-link contract §10
- [01_AUTHENTICATION_MODULE.md](01_AUTHENTICATION_MODULE.md) — session states (`member`/`new`/`guest`) + `CP_ME`
- [02_FEED_MODULE.md](02_FEED_MODULE.md) — own-post menu + pin rule + `.follow-btn` confirm sheet + `setFollowing` canonical
- [03_SEARCH_FILTER_MODULE.md](03_SEARCH_FILTER_MODULE.md) — Post Viewer `pfp` mode + `pv-seller` head + viewer sheets (FSP-016)
- [04_ASSET_MANAGEMENT_MODULE.md](04_ASSET_MANAGEMENT_MODULE.md) — composer asset mode + `pfkind`/drawer + `.pf-pfo`/`+`/CTA entries + sold semantics (FSP-017)
- [05_ASSET_DETAIL_MODULE.md](05_ASSET_DETAIL_MODULE.md) — `View full detail`/`pv-dt` reachability จาก pfp (FSP-018)
- [07_CHAT_MODULE.md](07_CHAT_MODULE.md) — `pf-msg` dead + chat item/menu profile entries + `th.blocked` (FSP-020)
- [09_NOTIFICATION_MODULE.md](09_NOTIFICATION_MODULE.md) — follow notification (FSP-021)
- [10_WATCH_ALERT_MODULE.md](10_WATCH_ALERT_MODULE.md) — WA (FSP-021)
- [11_SOCIAL_MODULE.md](11_SOCIAL_MODULE.md) — `shareSheetHTML`/share/save semantics (FSP-022)
- [13_SETTINGS_MODULE.md](13_SETTINGS_MODULE.md) — `settings` entry + `blocked`/`favorites`/`muted` lists + contact-fields contract (S-05)
- [14_PORTFOLIO_MODULE.md](14_PORTFOLIO_MODULE.md) — `portfolio`/`pfasset:`/`sold:`/`soldhist` (FSP-024)
- [15_TRUST_SAFETY_MODULE.md](15_TRUST_SAFETY_MODULE.md) — report internals + `PM_REASONS` + moderation contract
- [README_MODULE_INDEX.md](README_MODULE_INDEX.md) — module map

---

# 18. Future Enhancement

- **User-not-found / unavailable contract** — `profileOf` fabricate ทุก name; contract state ต้องมีเมื่อ routing จริง (00_NAV §10)
- **Persistence** — follow/fav/mute/block/removed/pins/profile edits เป็น session-only; server persistence + sync
- **Real share links/deep links** — `pf-sh-copy` ควร copy จริง; `https://tukdaeng.app/u/{u}` ต้อง resolve เป็น deep link + block/not-found validation (spec เดิม AC-PROFILE-007F–H เดิม — ย้ายเป็น contract)
- **Public `all` leak fix** — viewer `all` filter ตาม canonical (S-14 defect; `report:posts` picker ด้วย)
- **Photo picker** — `pe-pic` ปัจจุบัน dead toast
- **Chat from profile** — `pf-msg` ปัจจุบัน dead; IG มี Message button จริง (07 handoff)
- **Restrict feature** — `pfRestrictHint` banner มีแล้วแต่ไม่มี restrict flow
- **IG extras ที่ยัง dead**: `pf-note` note bubble, `pf-sleep` sleep mode, `pf-addchip`/suggested row, `pf-avadd` add avatar, avatar-overlay QR action, `pf-uname` account switcher
- **Story ring** — `ring` แสดงแต่ไม่มี story surface
- **Display name แยกจาก username** — ตอนนี้ `disp` = username เสมอ
- **language sweep** — EN-hardcoded strings (§9 Deviation #23) เข้า FSP-026
- **Follower/following real data** — mock lists (`pfAllUsers` + slice) → real relationships
