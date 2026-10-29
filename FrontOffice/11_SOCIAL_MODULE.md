# 11 Social Module

อ้างอิงหลักจาก [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md) + baseline [00_GLOBAL_RULES_MODULE.md](00_GLOBAL_RULES_MODULE.md) §7 (session), §11 (guest gate = Member Sheet + empty state), §13 (block/report impact), §14 (private data) + [00_NAVIGATION_AND_CROSS_MODULE_FLOW.md](00_NAVIGATION_AND_CROSS_MODULE_FLOW.md) §6 (layer/nav), §7 (entry matrix — routes `saved`/`savedcol`/`wishlist`/`wishcol`/`interested`/`ni`/`pfollow:`/`report:*`), §8 (notification destination matrix), §9 (gate routing), §10 (unavailable fallback), AC-NAV-026 (post viewer entries) + [02_FEED_MODULE.md](02_FEED_MODULE.md) (post card anatomy, post menus `pm-*`, ni-card/uncomf-card, feed tabs `following`/`favorites`, `refreshPostViews`, own-post menu — FSP-002 lock) + [03_SEARCH_FILTER_MODULE.md](03_SEARCH_FILTER_MODULE.md) (post viewer modes + rail actions + `pv-add` + `sr-saved` entry — FSP-016 lock) + [05_ASSET_DETAIL_MODULE.md](05_ASSET_DETAIL_MODULE.md) (detail action row, `wl-btn`/`mf-btn` entries — FSP-017 lock) + [06_PROFILE_MODULE.md](06_PROFILE_MODULE.md) (`pfSetFollow`/`pfIsFollowed`/`pfSetFav`/`pfSetMuted`/`pfSetBlocked` canonical, `pf-foll`/`mfSheet`/`pfollow:`/`pf-rmf`, QR share overlay — FSP-019 lock) + [09_NOTIFICATION_MODULE.md](09_NOTIFICATION_MODULE.md) (Alerts feed canonical — alert types/rows/destinations — FSP-021 lock) + [10_WATCH_ALERT_MODULE.md](10_WATCH_ALERT_MODULE.md) (`mf-btn` WA flow — FSP-021 lock) + [13_SETTINGS_MODULE.md](13_SETTINGS_MODULE.md) (settings pages `interested`/`ni`/`favorites`/`muted`/`blocked`/`notif_settings` + library rows) + [15_TRUST_SAFETY_MODULE.md](15_TRUST_SAFETY_MODULE.md) (report type contract — synced FSP-031, ดู §19) — prototype `Prototypes/fo-flow/index.html` เป็น source of truth เดียวของพฤติกรรม (FO-PRD-v1.9)

---

# 1. Document Information

| Item | Detail |
|---|---|
| Module Name | Social — post-centric IG-style interactions (like, comments, share, save/collections, Wish List, follow/favorites/mute, not-interested, report/block entries); spec เดิมตีความเป็น asset-centric engagement (Like→Favorites, Comment เฉพาะ Asset Detail, "Notification Center", "Global Login Required Dialog"); prototype คือ post-first ที่ทุก action ทำบน post card/shared sheets และ saved/wishlist เป็นระบบ private collections แยกกัน |
| Platform | Mobile Application |
| Version | V1 |
| Owner | Product / UX / Engineering |
| Status | Draft |
| Document Type | Functional PRD — prototype-synced (FO-PRD-v1.9) |

---

# 2. Objective

Social Module คุมพฤติกรรม interaction ทั้งหมดที่ผูกกับ **post** หรือ **account คนอื่น**: like/unlike + likes sheet, comment sheet (read + emoji quick-react + long-press moderation), share sheet, save + collections, Wish List + collections, follow/unfollow (account-level), favorites/mute/not-interested feedback loop, report & block entries — พร้อม private hub pages (`saved`, `savedcol`, `wishlist`, `wishcol`) และ guest gating ผ่าน Member Sheet

โมดูลนี้ต้องคุม: shared bottom-sheet internals (`lk`/`sh`/`sv`/`wl`/`nc`/`uf`/`pm`/`nt`), state model ของ post flags + account-level sets, hub pages + collection CRUD/select/move/search, follow semantics ที่ propagate ข้าม surface, report/block entries ที่ social surfaces เปิดใช้ — โดยยึดพฤติกรรม prototype เป็นตัวตัดสินเมื่อ spec เดิมขัดกัน

---

# 3. Prototype Reference

Source of truth: `Prototypes/fo-flow/index.html` (read-only — ห้ามแก้; line anchors อาจ drift ให้ค้นด้วย function-name)

- Post flags + fields: `POSTS` seed (~12800–13300) — `liked`, `likes`, `likedBy`, `views`, `comments`, `commentPreview`, `noComments`, `hideCounts`, `saved`, `savedCols` (multi-collection array — lock 2026-10-29), `savedAt`, `colAt`, `wishlisted`, `wlCols` (multi), `wlAt`, `wlColAt`, `following`, `favorite`, `muted`, `ni`, `blocked`, `archived`, `pins`
- Comments: `COMMENTS` seed (~13339 — threads ต่อ post id `{id,name,avatar,time,text,likes,replies[]}` 1 ชั้น), `commentsFor` (~13802 — สร้าง synthetic comments จาก `LIKER_POOL`+`PF_CMT_TEXTS` เมื่อ `p.comments>0` แต่ไม่มี seed; auto-assign `c-{i}`/`r-{ci}-{ri}`), `commentRowsHTML` (~13815 — filter `pfIsBlocked` ทั้ง comment+replies; row = avatar/`data-pf-user` + name+time + text + `.c-meta` `Reply` + `.c-like` heart+count), `commentsHTML` (~13953 — `sheet-title` `ความคิดเห็น`/`Comments` + `.sheet-list` + `.emoji-row` 8 emoji + `.comment-input` แบบ dead), `openCommentPopover`/`closeCommentPopover`/`delCommentDlgHTML`/`deleteComment` (~13858–13951), `dlg-delcomment-go` handler (~22971)
- Sheets: `likesSheetHTML` (~14002 — likers = `p.likedBy` + `LIKER_POOL` dedupe; `lk-note` เฉพาะโพสต์คนอื่น), `shareSheetHTML` (~14021 — `.sh-q` + `FRIENDS` 12 + `SHARE_APPS` 5: Messenger/Direct/LINE/Facebook/Copy link), `saveSheetHTML`/`COLLECTIONS` (~14043), `wlSheetHTML`/`WISHLISTS` (~14072), `openSheet` variants (~14096 — `uf pm pm-rp lk sh sv so dt nt ps nc wl wa mf`), `ncSheetHTML` (~15876 — Cancel/Next|Save + name 40 chars + count + clear-X + optional preview)
- Saved hub: `SAVED_TABS` (`all`/`collections`/`posts` ~15319), `savedState`/`savedPosts`/`colPosts`/`colCover`/`savedList`/`svdTileHTML`/`colCardHTML`/`colCardBigHTML`/`svdConfirmDelete`/`svdDeleteCol`/`svdEmptyHTML`/`svdSparkIcon`/`svdBarHTML`/`svdSelectHeadHTML`/`savedSearchBodyHTML`/`savedBodyHTML`/`savedHTML`/`savedColHTML` (~15319–15500), `svdAddHTML`/`svdCoverHTML`/`svdEditHTML`/`svdMoveSheetHTML`/`ecCoverHTML` (~15827–15875)
- Wish List hub: `wlState`/`wlPosts`/`wlColPosts`/`wlListPosts`/`wlColCover`/`wlSparkIcon`/`wlColCardHTML`/`wlColCardBigHTML`/`wlBodyHTML`/`wishlistHTML`/`wishColHTML`/`wlAddHTML`/`wlEcCoverHTML`/`wlEditHTML`/`wlCoverHTML`/`wlMoveSheetHTML`/`wlDeleteCol`/`inWlCol`/`isWl`/`colState`/`colList` (~15539–15790)
- Follow/favorite/mute: `setFollowing` (~14472 — account-level, update ทุก post ของ seller; unfollow ล้าง `favorite`+`muted`), `setMuted`/`mutedSellers`/`favoriteSellers`/`followedSellers`/`setFavorite` (~14515–14534), `pmMenuHTML`/`pmOwnMenuHTML`/`refreshPostViews` (~14255–14322), `niCardHTML`/`uncomfCardHTML` (~14324–14350), `uf` unfollow sheet inline (~22236), `mfSheetHTML`/`muteDlgHTML` (~15074/~17130 — canonical 06)
- Block: `pfSetBlocked` (~17033 — `PF_BLOCKED`+`PF_REMOVED_FOL`+unfollow both-ways via `pfSetFollow`, chat thread `blocked` flag, `p.blocked` ทุก post), `blkSheetHTML` (~17053 — avatar + `Block {u}?` + impact 3 rows + `Block`/`Block and report`), `unblockDlgHTML` (~17083), `pfRestrictHint` (~17092 — banner 6s หลัง unblock)
- Report: `rpOpenFromPost`/`rpPush`/`rpBack`/`rpClose`/`pmDropCovered` (~15234–15307 — `rp-over` mode ทับ post viewer), report pages `report`/`report:pick:{u}`/`report:posts:{u}`/`report:user`/`report:post`/`report:comment`/`report:done:{u}` (~17873–17933), `PM_REASONS`/`PM_REASONS_TH` (~14232–14253 — 9 เหตุผล)
- Handlers (global click chain): `.follow-btn`/`.uf-confirm`/`.uf-cancel` (~22236–22274), `.comment-btn` (~22392), `.liked-by` (~22408), `.lk-follow` (~22418), `.share-btn`/`.sh-fr`/`.sh-app` (~22424–22445), `.svd-*` manage/search/select/move/unsave/add/edit (~22446–22813), `.wl-btn`/`.wl-pick`/`.wl-new` (~22814–22858), `.save-btn`/`.sv-pick`/`.sv-new` (~22867–22912), `.c-pop-*` popover + `.dlg-delcomment-go` (~22913–22991), `.emoji-row` (~22992), `.c-like` (~23028), `.like-btn` (~23111), `.pm-fav`/`.pm-ni`/`.pm-undo`/`.pm-go-report`/`.ni-*`/`.uc-*` (~20890–21000), `.blk-go`/`.blk-rep`/`.rp-step`/`.rp-next`/`.rp-done`/`.pf-unblock`/`.m-unblock` (~21951–22029), `.pm-reason`/`.rp-opt` (~20947–20966), `.m-unsave`/`.m-unlike`/`.m-restore`/`.fav-*` (~21400–21460), `m-unmute` (~21396)
- Long-press tiles: `contextmenu` listener บน `.svd-tile` (~20486 — enter select mode + select tile ทันที)
- Long-press comments: `pointerdown/move/up` handlers ท้ายไฟล์ (~23595+ — 450ms hold, 8px move threshold → `openCommentPopover`; owner-added — อยู่ใน scope protected ของงานนี้)
- Input filters: `.sh-q` (~20418 — filter `.sh-fr` ตาม name), `.svd-q` (~20453 — live filter hub list), `.nc-input` (~20462 — counter `N / 40` + Next enable)
- Session: `POST_FLAG_KEYS`/`snapPosts`/`clearUserData`/`restoreUserData`/`applySessionData`/`setSession` (~23421–23482)
- Gate: `GUEST_GATE_SEL` + `obGate` (~23486+ — trigger ~20519; social selectors ดู §16)

---

# 4. Master Alignment Summary

| Topic | Master Baseline | Prototype Rule (FSP-022) |
| --- | --- | --- |
| Like entry | Feed + Asset Detail | ตรง + เพิ่ม post viewer (rail + `pfp` cards) — sync ทุก `.like-btn` ของ pid เดียวกัน |
| Like ↔ Favorites | Like เพิ่ม Asset เข้า Favorites, Unlike ลบออก | **ขัด** — `liked` (per-post) กับ `favorite` (per-seller feed filter) เป็นคนละระบบ; liked posts ไป list `interested` (Settings) ไม่ใช่ Favorites |
| Owner like | Owner like โพสต์ตัวเองได้ | ตรง — และโพสต์ตัวเองเท่านั้นที่แสดง `lk-n` count บนปุ่ม (likes private แบบ IG) |
| Comment entry | Comment ทำใน Asset Detail เท่านั้น | **ขัด** — `comment-btn` อยู่บนทุก post card (feed/detail/viewer) เปิด shared comment sheet ได้ตรง ไม่ต้องเข้า detail; `pv-add` bar เป็น entry เสริม (canonical 03) |
| Comment structure | IG-style one-level replies | ตรง — `replies[]` 1 ชั้น ไม่มี nested ซ้อน |
| Comment composer | — | **ไม่มีใน V1** — `.comment-input` เป็น div read-only (dead); วิธีเดียวที่เพิ่ม comment ได้คือ `.emoji-row` quick-react (push comment `{id:"c-own-…", name:CP_ME, time:"Just now"}`) |
| Comment delete/report | Delete + Report via `...` | ตรงแต่เปลี่ยน surface — ไม่มี `...` บน comment; ใช้ **long-press** (450ms) เปิด `.c-popover`: own → `Delete`, คนอื่น → `Block` + `Report` |
| Comment moderation | Hide comment ไม่ใช้ | ตรง — ไม่มี Hide; report ไม่ทำให้ comment หายทันที |
| Follow entry | Public Profile + owner info บน detail | ขยาย — `.follow-btn` (post-head/detail/pv foot/ps sheet), `pfp-follow` head pill, `sc-follow` search card, `pf-foll`/`pf-flw`/mfSheet/`pf-rmf` (canonical 06), `al-fbtn` (canonical 09), `lk-follow` (cosmetic — §19) |
| Following feed | Sale assets ของ user ที่ follow | ขัดบางส่วน — feed tab `following` แสดง **ทุกโพสต์ eligible** ของ followed sellers (ไม่จำกัด sale; canonical 02 feed-tab rule), `favorites` แท็บแยกต่างหาก |
| Save / collections | — | เพิ่มระบบ IG Saved: `save-btn` → sv sheet (Saved + collections + New collection) + hub routes `saved`/`savedcol` — spec เดิมไม่มี |
| Wish List | — | เพิ่มระบบแยกจาก Saved: `wl-btn` (detail only) → wl sheet + hub `wishlist`/`wishcol` — gift icon, collections ของตัวเอง |
| Guest restriction | Global Login Required Dialog | แทนด้วย **Member Sheet `Join TukDaeng`** ผ่าน `GUEST_GATE_SEL` + `obGate` (canonical 00_GLOBAL §11) |
| Notification | "Notification Center" | แทนด้วย **Alerts feed** (canonical 09) — like/comment → Post Viewer โพสต์ตัวเอง, follow → `profile:{u}`; social actions ใน session **ไม่สร้าง alert row** (ALERTS seed-only, contract 09 §14) |
| Share | System share sheet + copy deep link | Prototype: in-app sheet เท่านั้น — friends grid + 4 apps + Copy link (sim toast); ไม่มี native share, ไม่มี deep-link validation flow |

---

# 5. Scope

## In Scope

- Like / Unlike post (ทุก surface — feed card, detail, post viewer rail, pfp card) + like count sync
- Likes sheet (`lk`) — liker list, `lk-note` privacy copy, `lk-follow` rows
- Comment sheet (`commentsHTML`, `nt` variant บน viewer) — rows, one-level replies, emoji quick-react, comment like (cosmetic), long-press popover (Delete own / Block+Report others), delete confirm + cascade replies
- Share sheet (`sh`) — search friends, `sh-fr` friend pick, `sh-app` (Messenger/Direct/LINE/Facebook/Copy link)
- Save (`sv`) — `save-btn` → sheet (Saved + collections + New collection), Saved hub (`saved`/`savedcol`), collection CRUD (new/edit/cover/delete), select/manage (move, unsave/remove, add to collection), search ใน hub, long-press select
- Wish List (`wl`) — `wl-btn` (detail only) → sheet, Wish List hub (`wishlist`/`wishcol`), collection ops เหมือน Saved
- Follow / Unfollow — semantics ระดับบัญชี (`setFollowing` propagate + unfollow ล้าง favorite/mute), unfollow confirm sheet (`uf`), followers/following lists semantics (surfaces canonical 06)
- Favorites (`pm-fav`/mfSheet/settings) + Mute (`ni-mute`/`mf-mute`/`muteDlg`/`m-unmute`) + Not interested (`pm-ni` → ni-card → uncomf-card → restore)
- Report & Block entries จาก social surfaces (post `...`, comment popover, profile, uncomfortable card) + block effects บน social surfaces
- Guest gate สำหรับ social actions (GUEST_GATE_SEL) + session data rules (member restore / guest+new clear)

## Out of Scope For V1

- Comment composer จริง (text input + submit) — `.comment-input` dead; Reply `.c-meta` ไม่มี handler
- Multi-level nested comment เกิน 1 reply level, Edit comment, comment attachment/reaction/mention
- Native OS share sheet, share deep-link validation flow
- Repost, Story, activity feed อื่นนอกจาก Alerts (09)
- Notification generation จาก social actions (ALERTS seed-only — contract 09 §14)
- Board article like/save/share (`data-bd*`) — canonical 12 (gate list เดียวกันเท่านั้น)
- Watch Alert (`mf-btn`/`waSheetHTML`) — canonical 10
- Report flow internals (reason taxonomy, SLA, admin moderation) — canonical 15 (synced FSP-031 — §19)
- Chat (`pf-msg`, `blkSheetHTML(fromChat)`, `report:done` chat teardown) — canonical 07

---

# 6. Surface Mapping

| Surface | Route/Entry | Social actions |
| --- | --- | --- |
| Feed card (`postCard`) | feed tabs `all`/`following`/`favorites` | like, comment-btn → comment sheet, share-btn, save-btn, follow-btn (post-head เมื่อยังไม่ follow), `...` → pm menu (fav conditional/NI/report), pfWho → profile |
| Post Detail (`.page-detail`) | `View full detail` | like/comment-btn/share-btn, `wl-btn` (wishlist — **เฉพาะ detail**), `mf-btn` (WA — canonical 10), `pm-btn` |
| Post Viewer (`.page-pv`) | grid tiles + notifications | rail: like/Likes label → lk sheet/comment(+count)/views/share/save/`...`; foot: follow pill (ยังไม่ follow), caption `…` → `ps`, `pv-add` → comment sheet `nt` |
| Comments sheet (`commentsHTML`, `nt` variant) | `.comment-btn`, `pv-add` | rows+replies, emoji-row quick-react, `.c-like`, long-press popover |
| Likes sheet (`lk`) | `.liked-by` strip, pv `Likes` label | liker rows → profile (`data-pf-user`), `lk-follow` |
| Share sheet (`sh`) | `.share-btn`, `pf-sh-share`, `data-bdshare` (12) | `.sh-q` filter, `.sh-fr`, `.sh-app` |
| Save sheet (`sv`) | `.save-btn` | `.sv-pick` rows (Saved + collections), `.sv-new` → `nc` |
| Wish List sheet (`wl`) | `.wl-btn` (detail) | `.wl-pick` rows, `.wl-new` → `nc` |
| New-collection sheet (`nc`) | `.sv-new`/`.wl-new`/`.svd-plus`/`.svd-mv-new` | input + counter + Next/Save |
| Unfollow sheet (`uf`) | `.follow-btn` เมื่อ following | `uf-confirm`/`uf-cancel` |
| Post menus (`pm`) | `...` บน card/detail/viewer | others: `pm-fav` (conditional `following\|\|favorite`), `pm-ni`, `pm-go-report`; own: `pm-own-*` (canonical 02); `reportOnly` variant = Report เท่านั้น |
| Saved hub | `saved` (settings row + `.sr-saved` + `data-sub="saved"`), `savedcol` | tabs, collections CRUD, select/manage, move sheet, unsave/remove dialogs, search, tile → viewer feed mode |
| Wish List hub | `wishlist` (`data-sub="wishlist"`), `wishcol` | เหมือน Saved |
| Report pages | `report*` routes | reason list, pickers, done+Other steps (§15) |
| Settings social lists | `interested` (liked posts + `m-unlike`), `ni` (`m-restore`), `favorites`/`muted`/`blocked` (`fav-*`/`m-unmute`/`m-unblock`) | canonical 13 — เอกสารนี้คุม semantics ของ flag เท่านั้น; **แถวโพสต์ (interested/ni) แตะ → Post Viewer feed mode ของโพสต์นั้น** (lock 2026-10-29 — ไม่ใช่โปรไฟล์คนขาย) |

---

# 7. User States

## Guest (`state.session === "guest"`)

- อ่าน comments ได้ (`.comment-btn` **ไม่** gate — เปิด sheet เห็น rows+replies), เปิด likes sheet ได้ (`.liked-by` ไม่ gate), เข้า Saved/Wish List hub ได้แต่เห็น empty (`clearUserData` ล้าง state ทั้งหมด)
- Action ที่ต้องมีตัวตนทั้งหมด → Member Sheet `Join TukDaeng` (`obGate`): `.like-btn`, `.save-btn`, `.share-btn`, `.wl-btn`, `.mf-btn`, `.follow-btn`, `.comment-input`, `.emoji-row`, `.c-like`, `.c-meta`, `.lk-follow`, `.pm-btn`, `.rp-opt`, `.pm-reason`, profile-family (`.pf-foll`,`.pf-flw`,`.pf-msg`,`.pf-avov-act`,`.pf-dots`,`.pf-rmf`,`.pf-unblock`,`.pf-more`,`.pf-menu`,`.pf-edit`,`.pf-share`,`.pf-sh-*`,`.pm-own-*`,`.pm-go-report`), `[data-bd*]` like/save/share/report (canonical 12)
- Comment popover (`c-pop-item`) gate ใน handler — กด Block/Report/Delete แล้ว popover ปิด → `obGate` แทน execute

## Member

- Social actions ครบทุกจุด + private state จริง (liked/saved/wishlist/follow/favorite/mute/ni/blocked + collections + WATCH_ALERTS restore จาก snapshot)

## New Member (`session === "new"`)

- Member powers เต็มแต่เริ่มด้วย empty state (clearUserData เหมือน guest); profile ถูกสร้างใน `PROFILES` (canonical 06)

## Owner

- Like โพสต์ตัวเองได้, `lk-n` count แสดงเฉพาะโพสต์ตัวเอง, ไม่มี follow button บนโพสต์ตัวเอง (`composer` เซ็ต `following:true` ให้โพสต์ตัวเอง — canonical 03), own `...` → `pmOwnMenuHTML` (canonical 02), `isOwn` comment → popover `Delete` เท่านั้น

## Blocked context

- `p.blocked` → โพสต์หลุด feed/viewer lists; comments ของ blocked user ถูก filter ออกจาก `commentRowsHTML`; profile viewer blocked → `pf-unblock` เดียว (canonical 06); chat thread `blocked` (canonical 07)

---

# 8. Data Model

## Post-level flags (`POSTS` — per-post, viewer-owned)

| Field | Meaning | Set โดย |
| --- | --- | --- |
| `liked` / `likes` | like state + count | `.like-btn` toggle ±1 |
| `likedBy` | first liker (สำหรับ `liked-by` strip + lk sheet) | seed เท่านั้น |
| `views` / `comments` / `commentPreview` | counts + feed preview | seed; `comments` อัปเดตจาก emoji-react + deleteComment |
| `noComments` | ซ่อน comment button/sheet entry | own-post menu `pm-own-nocomm` (canonical 02) |
| `hideCounts` | ซ่อน `liked-by` strip + views | post setting |
| `saved` / `savedCols` / `savedAt` / `colAt` | Saved state + collection memberships (**array — post อยู่ได้หลาย collection พร้อมกัน**) + sort stamps | `.save-btn`/`.sv-pick`/move/unsave |
| `wishlisted` / `wlCols` / `wlAt` / `wlColAt` | Wish List state + collection memberships (array — multi เหมือนกัน) + stamps | `.wl-btn`/`.wl-pick`/move/remove |
| `following` / `favorite` / `muted` | account-level แต่เก็บบนทุก post ของ seller | `setFollowing`/`setFavorite`/`setMuted` (ทุก `p.seller===seller`) |
| `ni` / `blocked` / `archived` | feed exclusion flags | `pm-ni`/`pfSetBlocked`/archive (canonical 02) |

## Account-level sets (`PF_*` — canonical 06)

- `PF_EXTRA_FOL`/`PF_EXTRA_FAV`/`PF_EXTRA_MUT` — users ไม่มี post (follow/fav/mute จาก lists/overlay)
- `PF_BLOCKED`, `PF_REMOVED_FOL`, `PF_GFX_REG`/`PF_GFX_DEL` — block, remove-follower, gfx reg

## Collections

- `COLLECTIONS` — Saved collections `{name, thumb?, coverPid?}`; `"Saved"` = pseudo-row ของ flag `saved` เอง (ไม่ใช่สมาชิกใน `savedCols` — ติ๊ก row นี้ = เซฟ/ถอดเซฟทั้งโพสต์)
- `WISHLISTS` — Wish List collections แยก array (`"Wishlist"` = pseudo-row ของ flag `wishlisted` เช่นกัน)
- ทุก collection = **Private** (label คงที่บน sheet/cards); **ชื่อซ้ำได้** — ไม่มี dedupe (lock 2026-10-29, LIB-042)
- **Multi-collection (lock 2026-10-29)** — post หนึ่งอยู่ได้หลาย collection พร้อมกัน (`savedCols`/`wlCols` เป็น array ของชื่อ); picker ติ๊กได้หลายอัน; เอาออกทีละอันไม่กระทบอันอื่น; ยกเลิกเซฟ (un-save / un-wishlist) หลุดทุก collection เพราะ flag ถูกล้างพร้อม array

## Session snapshot

- `POST_FLAG_KEYS` = `["liked","saved","savedCols","wishlisted","wlCols","wlAt","wlColAt","following","favorite","muted","archived","archivedAt","ni","blocked","pins"]`
- `member` → `restoreUserData` (posts flags + `COLLECTIONS`/`WISHLISTS` restore); `guest`/`new` → `clearUserData` (flags ล้าง + PF sets ล้าง + `WATCH_ALERTS` ล้าง + `ALERTS=null`)
- **ไม่ reset**: `likes`/`views`/`comments` counts, `savedAt`/`colAt` (sort stamps ไม่อยู่ใน `POST_FLAG_KEYS` — `savedCols`/`wlCols` อยู่ใน keys แล้วจึงล้าง/คืนตาม session ถูกต้อง; ดู §19 quirk)

---

# 9. Like & Likes Sheet

## Like Rules

- `.like-btn` toggle `p.liked` + `p.likes += ±1` — sync **ทุก** `.like-btn` ของ pid เดียวกันทุก surface ในหน้าจอ (feed card, detail, pv rail, pfp card) ด้วย class toggle; `lk-n` อัปเดตเฉพาะโพสต์ตัวเอง
- 1 user = 1 like/post; owner like ตัวเองได้; ไม่มี undo confirm
- `liked` ไม่ผูก Favorites — liked posts ไป Settings > `interested` (`รายการที่สนใจ`/`Interested`) — list `POSTS.filter(p.liked)` + `Remove` (`m-unlike` → `liked=false, likes--` + feed re-render) (canonical 13)

## Visibility rules

- `lk-n` (ตัวเลขบนหัวใจ) — เฉพาะ `p.seller === CP_ME.name` และ `likes>0` (like counts private แบบ IG)
- `liked-by` strip (`Liked by {p.likedBy.name} and others`) — ซ่อนเมื่อ `hideCounts` หรือ `likes===0` หรือไม่มี `likedBy`
- `lk-note` ใน likes sheet — เฉพาะโพสต์**คนอื่น**: `มีเพียง {seller} เท่านั้นที่สามารถดูจำนวนผู้กดถูกใจทั้งหมดในโพสต์นี้ได้`/`Only {seller} can see the total number of likes on this post.` (ไม่แสดงบนโพสต์ตัวเอง)

## Likes sheet (`lk`)

- Entry: `.liked-by` strip บน card/detail หรือ pv rail `Likes`/`ถูกใจ` label
- เนื้อหา: `sheet-title` `ยอดถูกใจ`/`Likes` + `lk-note` (ตามกฎด้านบน) + rows = `[p.likedBy] + LIKER_POOL` dedupe (username + display name + avatar + `data-pf-user` → profile + `lk-follow` button)
- `lk-follow` — cosmetic toggle in-place (`Follow` ↔ `Following`) **ไม่** เรียก `setFollowing` — state ไม่ propagate (§19 quirk)

---

# 10. Comments

## Entry & sheet

- `.comment-btn` (feed card, detail, viewer rail, pfp card) → `commentsHTML` — บน post viewer (`pv-open` โดยไม่มี `detail-open`) ใช้ variant `nt`; `.pv-add` (`Add comment…`/`เพิ่มความคิดเห็น…`) → sheet เดียวกัน (canonical 03)
- Sheet anatomy: handle + title `ความคิดเห็น`/`Comments` + `.sheet-list` rows + `.emoji-row` (8 emoji: ❤️🙌🔥👏🥲😍😮😂) + `.comment-input` (avatar + `Add a comment...` field + img/gif icons — **dead**, ไม่มี input/submit handler)
- Comment source: `COMMENTS[pid]` seed หรือ generated จาก `LIKER_POOL`/`PF_CMT_TEXTS` (`commentsFor` — names ตัด seller ออก, avatar จาก `pfAvatar` เมื่อ `commentPreview` match); replies 1 ชั้นเท่านั้น (ไม่มี nested reply-of-reply UI)
- `noComments` → ซ่อน `comment-btn` ทุก surface (แต่ `pv-add` ยังเปิด sheet ได้ — quirk canonical 03)
- `.c-meta` `Reply`/`ตอบกลับ` — **ไม่มี handler** (dead affordance; guest กด → gate ตาม selector)

## Emoji quick-react (วิธีเดียวที่เขียน comment ได้ใน V1)

- `.emoji-row span` → push `{id:"c-own-"+Date.now(), name:CP_ME, avatar:mrfox, time:"Just now"/"เมื่อสักครู่", text:emoji, likes:0}` เข้า `commentsFor(p)` + `p.comments++` + re-render rows + `.comment-count` sync + scroll ท้าย list
- Comment ที่สร้าง = own (`data-is-own`) → long-press ลบได้ทันที

## Row actions

- `.c-like` — cosmetic like (class toggle + ±1 ใน label; **ไม่ persist** — re-render reset; `0` เริ่มแสดงเมื่อ liked → `1`)
- Avatar/name → `data-pf-user` → `profile:{u}` (canonical 06)

## Long-press moderation (`.c-popover`)

- Trigger: pointer-hold 450ms (movement ≤8px) บน `.c-row` หรือ contextmenu — เปิด popover เหนือ row ภายใน comment sheet (backdrop ปิด)
- Own comment (`data-is-own`) → `Delete` เท่านั้น; คนอื่น → `Block` + `Report`
- `Block` → ถ้า blocked อยู่แล้ว → `unblockDlgHTML`; ถ้ายัง → `blkSheetHTML` (sheet `pm`); block สำเร็จ → กลับมาที่ comment sheet + toast `Blocked and hidden comments`/`บล็อกและซ่อนความคิดเห็นแล้ว`
- `Report` → ปิด sheet → `report:comment` page (X only, ไม่มี back — §15)
- `Delete` → `delCommentDlgHTML` center dialog (`Delete this comment?`/`ลบความคิดเห็นนี้หรือไม่?`):
  - root มี replies → `This action cannot be undone. This comment and its replies will be removed.`
  - reply หรือ root ไม่มี replies → `This action cannot be undone. This comment will be removed.`
- `dlg-delcomment-go` → `deleteComment(pid,cid,rid)`: reply → splice reply + `comments--`; root → splice + `comments -= 1+replyCount` → re-render sheet + `.comment-count` sync + toast `This comment was removed.`/`ลบความคิดเห็นแล้ว` — ไม่มี undo
- Block ผู้เขียน → comments+replies ของเขาหายจาก rows (`commentRowsHTML` filter `pfIsBlocked`) — แต่ **ไม่ลบข้อมูลจริง** (`COMMENTS` ยังมี; unblocking แล้ว reopen sheet เห็นกลับ)

---

# 11. Share

- `.share-btn` ทุก surface (feed card, detail, pv rail, pfp card) → `openSheet "sh"`; `data-shPid` จำ post (resolve จาก `.post` ancestor → fallback `detailPid`)
- `pf-sh-share` (profile avatar overlay) → sheet เดียวกัน (canonical 06); board share `data-bdshare`/`data-bdact=share` → sheet เดียวกัน (canonical 12)
- Sheet anatomy: `.sh-q` search (live filter `.sh-fr` ตาม name) + friends grid (`FRIENDS` 12 — avatar+username) + app row (`SHARE_APPS`: Messenger, Direct, LINE, Facebook, `Copy link` สี gray)
- Actions: `.sh-fr` → ปิด sheet + toast `Sent to {name}`; `.sh-app` → ปิด + toast `Shared to {app}` หรือ `Link copied` (copy)
- **ไม่มี** native OS share, share count, share tracking, deep-link validation (contract — §20)
- Share ไม่สร้าง alert (canonical 09)

---

# 12. Save & Collections (Saved)

## Save entry (`save-btn` → `sv` sheet)

- `save-btn` (feed card right, pv rail, pfp card): `!p.saved` → `saved=true, savedAt` (`savedCols` คง memberships เดิม/ว่าง) + `syncSaveBtns` (filled bookmark) แล้ว **เปิด sheet เสมอ** (ทั้งกรณี saved อยู่แล้ว — เพื่อเลือก collection)
- `saveSheetHTML`: row แรก `sv-head` (`Saved`/`Private` + post thumb + bookmark — pseudo-row ของ flag `saved`) + `Collections` section + `sv-new` `New collection` + rows `sv-pick` (`colCover` thumb หรือ bookmark icon; check บน `(p.savedCols||[]).includes(c.name)` — **ติ๊กได้หลาย collection**)
- `.sv-pick` semantics (multi-collection — lock 2026-10-29):
  - `col==="Saved"` && `p.saved` → **unsave** (`saved=false, savedCols=[], savedAt=0` — หลุดทุก collection) + toast `Removed from your saved`
  - `col` ที่อยู่ใน `p.savedCols` แล้ว → เอาออก**เฉพาะ collection นั้น** (`savedCols` ลบชื่อ) + toast `Removed from {col}` — **ยัง saved + อยู่ collection อื่นต่อ**
  - `col` ใหม่ → `savedCols.push(col)` (+`colAt`) + toast `Saved`/`Saved to {col}`
  - `col==="Saved"` && `!p.saved` → `saved=true, savedAt` + toast `Saved`
- `.sv-new` → `ncSheetHTML` (`_ncFrom="save"`) — Next สร้าง `COLLECTIONS.push({name})` + `savedCols.push(name)` + toast `Saved to {name}`; ชื่อซ้ำกับ collection เดิมได้ (ไม่ block)

## Saved hub (`saved` route)

- Entries: Settings > Your library row `โพสต์ที่บันทึกไว้`/`Saved` (count badge = `POSTS.filter(p.saved).length`), `.sr-saved` บน search landing (`pushSub("saved")`), `data-sub="saved"`
- Head: back + `บันทึกแล้ว`/`Saved` + `svd-srch` + `svd-plus` (new collection)
- Tabs `SAVED_TABS`: `ทั้งหมด`/`All` (collections section — 4 cards `svd-col` + `See all` — + `All posts` section grid + `Manage`), `คอลเลกชัน`/`Collections` (big cards `svd-colbig`), `โพสต์`/`Posts` (grid)
- Tile → `openPostViewer(list, pid, feed)` mode `feed` (canonical 03/AC-NAV-026); multi-photo tile มี `svd-stack` icon
- Search (`svd-srch`): mode `search` — `sr-head` + `.svd-q` (`ค้นหารายการที่บันทึกไว้`/`Search your saved`) live filter `matchQuery` → `No results found`/`ไม่พบผลลัพธ์` + `ไม่มีโพสต์ที่บันทึกไว้ตรงกับ "{q}"`
- Empty: `Nothing saved yet`/`ยังไม่มีรายการที่บันทึก` + `Save posts you want to see again. Only you can see what you've saved.` (guest/empty)
- Collections tab empty: `No collections yet`/`ยังไม่มีคอลเลกชัน` + `Create a collection to organise your saved posts.`

## Collection page (`savedcol` route)

- Head: back + name + `svd-srch` + `svd-more`; title row `{name}` + `{n} item(s)` + grid (เรียง `colAt` desc)
- `svd-more` → menu (`.svd-mi`): `Add to collection` (mode `add` — grid ของ saved posts ที่ยังไม่อยู่ collection นี้, pick หลายตัว + `Done` → `Added N post(s)`), `Edit collection` (mode `edit` — cover + `Change cover` + name field + `Delete collection` + note `When you delete this collection, the photos and videos will still be saved.`), `Select...` (manage — เฉพาะมี items), `Delete collection` (danger → `svdConfirmDelete` dlg)
- `svd-editdone` → rename (+ map ชื่อเดิม→ใหม่ใน `savedCols` ทุก post + `V.col`) + toast `Collection updated`; `ec-chgcover` → `cover` mode → `ec-ctile` pick → `coverPid` (fallback cover = latest post ใน collection); `ec-del`/`mi del` → `Delete collection?` dlg → `dlg-delcol-go` → `svdDeleteCol` (ลบชื่อออกจาก `savedCols` ทุก post — **posts ยัง saved อยู่** + `subBack` + `Collection deleted`)
- `svdAddHTML` empty: `No saved posts to add` + `Add posts to your saved first, then add them here.` (bookmark icon)

## All-posts + Select/manage

- `Manage`/`svd-more` บน `allposts` → `svdSelectHeadHTML` (Cancel + `All posts`/`โพสต์ทั้งหมด` title + `Select all`/`Deselect all`) + `svdBarHTML`: `Unsave` + `Add to collection` (disabled เมื่อเลือก 0) — ใน collection: `Remove` + `Move to collection`
- Long-press (`contextmenu`) บน `.svd-tile` → enter manage + select tile นั้นทันที (จาก `saved`/`wishlist` hub → mode `allposts`)
- `.svd-unsave`:
  - ใน `savedcol` → `Remove from this collection?` dlg (`Post will still be saved in all posts.` + `Remove`) → `dlg-rmcol-go` → ลบชื่อ col นั้นออกจาก `savedCols` (membership อื่นคงอยู่) + `Removed from {col}`
  - ใน all-posts → `Unsave post?` dlg (`Unsaving this post will also remove it from any collections.` + `Unsave`) → `dlg-unsave-go` → `saved=false, savedCols=[]` ทั้งหมดที่เลือก + `Removed from All posts` (toast + thumb)
- `.svd-move` → `svdMoveSheetHTML` (Collections list — ตัด current col + `New collection`) → `.svd-mv` → ใน `savedcol` context: ลบ current col + เพิ่ม col เป้าหมาย (`Moved to {col}`); จาก hub/all-posts: เพิ่ม col เป้าหมาย โดยเก็บ memberships เดิม (`Added to {col}`) — memberships อื่นไม่ถูกแตะทั้งสองกรณี; `.svd-mv-new` → `nc` variant `Save` + preview (`_ncFrom="move"`, `_ncPids`) → **`savedCols=[name]` — ล้าง memberships เดิมทั้งหมดแล้วเหลือแค่ col ใหม่** (lock 2026-10-29 — ต่างจาก move→existing ที่เป็น additive)
- Settings row `m-unsave` (interested-style list — ถ้ามี surface) → `saved=false, savedCols=[]` + `syncSaveBtns` + `renderSub` — ไม่มี confirm

## Library surfaces — ผลกระทบจากต้นทางโพสต์ (lock 2026-10-29)

กฎเดียวกันทุก private list (`saved`/`savedcol`/`wishlist`/`wishcol`/`interested`/`ni` — ผ่าน `libVisible`):

| ต้นทางเปลี่ยนสถานะ | ผลต่อ tile/list |
| --- | --- |
| `sold` (mark as sold) | tile **อยู่ + เปิด viewer ได้ปกติ** (โพสต์ยังมีตัวตน — เห็นสถานะขายแล้ว) |
| `hide` (asset status Hide / `pfkind:"hide"`) | tile **หาย**จาก hub + ทุก collection |
| `archive` (เจ้าของ archive) | tile **หาย**จาก saved ของทุกคน (รวมเจ้าของเอง); unarchive → **กลับมา** เพราะ archive ไม่ลบ flag เซฟ |
| `block` (เจ้าของโพสต์ถูก block) | tile **หาย** — ของที่มองไม่เห็นแล้วไม่ค้างในคลัง |
| `delete` (ลบโพสต์) | tile **หาย** + ทางเปิดที่ค้าง (viewer/detail/deep link) → unavailable state `รายการนี้ไม่พร้อมใช้งานแล้ว`/`This post is no longer available` — ไม่แสดงข้อมูลเก่า |
| `ni` / `muted` | **ไม่กระทบ** — exclusion เฉพาะ feed (02 §9); โพสต์ยังอยู่ saved/library ปกติ |

- เมื่อ tile หาย → collection cover อัปเดตเป็นรูปตัวอื่นใน col (ไม่ค้างรูปที่หายไป) และ count badge ของ settings rows สะท้อนจำนวนที่มองเห็นจริง

---

# 13. Wish List

- `wl-btn` — **เฉพาะ Post Detail** (gift icon `Wish List`): `!p.wishlisted` → `wishlisted=true, wlAt` (`wlCols` คงเดิม/ว่าง — `"Wishlist"` เป็น pseudo-row ของ flag ไม่ใช่ collection) + `syncWlBtns` + เปิด `wl` sheet เสมอ
- `wlSheetHTML` = save-sheet shape: `wl-head` (`Wish List`/`Private` + gift icon — filled เมื่อ wishlisted) + `WISHLISTS` rows (`wl-pick`, check เมื่อ `(p.wlCols||[]).includes(name)` — ติ๊กได้หลายอัน) + `wl-new`
- `.wl-pick` (multi-collection เหมือน save): `col==="Wishlist"` && wishlisted → un-wishlist (`wishlisted=false, wlCols=[], wlAt=0, wlColAt=0` — หลุดทุก collection) + `Removed from your wish list`; col ที่ check อยู่ → เอาออกเฉพาะ col นั้น + `Removed from {col}`; col ใหม่ → `wlCols.push(col)` + `wlColAt` + `Added to Wish List`/`Added to {col}`
- `wl-new` → `nc` (`_ncFrom="wishlist"`) → `WISHLISTS.push` + `wlCols.push(name)` + `Added to {name}`; ชื่อซ้ำได้
- `wishlist` hub — เหมือน Saved: head `สิ่งที่อยากได้`/`Wish List` + `svd-srch`/`svd-plus`, tabs เดียวกัน (`All`/`Collections`/`Posts`), sections `Collections` + `รายการทั้งหมด`/`All items` + `Manage`, settings row `รายการที่อยากได้`/`Wish List` (count = `wlPosts().length`)
- `wishcol` page — เหมือน savedcol: menu Add/Edit/Select/Delete (`wlDeleteCol` — ลบชื่อออกจาก `wlCols` ทุก post, posts ยัง wishlisted), search `Search your wish list`, `Remove`/`Move to collection` bar (move→existing = additive เหมือน saved; move→new = `wlCols=[name]` ล้างเดิม), unsave dlg `Remove from wish list?` (`Removing this post will also remove it from any collections.`), remove-from-col `Post will still be on your wish list.`
- Empty: `Nothing on your wish list yet`/`ยังไม่มีรายการในสิ่งที่อยากได้` + `Tap the gift icon on a model page to add it here.` (gift spark icon); collections empty `No collections yet`/`ยังไม่มีคอลเลกชัน` + `Create a collection to organise your wish list posts.`
- Wish List กับ Saved แยกระบบสมบูรณ์ (arrays, col fields, icons, entries) — collection ชื่อ `"Wishlist"` ใน `COLLECTIONS` seed เป็น Saved collection ธรรมดา ไม่เกี่ยวกับ Wish List hub (§19 quirk)

---

# 14. Follow / Favorites / Mute / Not-interested

## Follow semantics (canonical — surfaces อยู่ 02/03/06/09)

- Follow = **account-level** — `setFollowing(scr, seller, on)`: set `p.following` ทุก post ของ seller; `on=false` → ล้าง `p.favorite` + `p.muted` ด้วย (หลุดจาก Favorites/Muted settings lists)
- `PF_EXTRA_FOL` cover users ที่ไม่มี post (follow จาก pfollow/overlay/likes rows — canonical 06 `pfSetFollow` delegate → `setFollowing` เมื่อมี post)
- Surface sync: `.follow-btn` flip `ติดตาม`/`Follow` ↔ `กำลังติดตาม`/`Following` บนทุก card; ถ้า card ไม่มีปุ่ม (เพิ่ง unfollow ตอน following tab) inject `.follow-btn` ก่อน `...`; detail button flip; feed re-render เมื่ออยู่ `following`/`favorites` tab หรือ unfollow
- `.follow-btn` เมื่อ following → `uf` confirm sheet (`Unfollow @{seller}?`/`เลิกติดตาม @{seller} หรือไม่?` + `Unfollow`/`เลิกติดตาม` + `Cancel`/`ยกเลิก`) → `uf-confirm` → `setFollowing(false)` + toast `Unfollowed`/`เลิกติดตามแล้ว`; เมื่อยังไม่ follow → instant
- ไม่มีปุ่ม Follow บนโพสต์/โปรไฟล์ตัวเอง; `pfp-follow` head pill แสดงเฉพาะยังไม่ follow (canonical 03); `pf-foll` (profile) → instant follow / `Following ⌄` → `mfSheet` (canonical 06)
- Follow ไม่สร้าง alert ฝั่งตัวเอง; alert `follow` row = เมื่อคนอื่น follow เรา (canonical 09; Follow back ใช้ `pfSetFollow` ตัวจริง)

## Favorites (`favorite` — seller-level feed filter, ไม่ใช่ post like)

- `setFavorite(scr, seller, on)` — set `p.favorite` ทุก post ของ seller; re-render เมื่ออยู่ `favorites` tab
- Entries: `pm-fav` บน others-post `...` menu — **conditional**: แสดงเฉพาะ `p.following || p.favorite` (follow แล้วถึง fav ได้); `mf-fav` ใน mfSheet (canonical 06); settings `favorites` page (`fav-add`/`fav-remove`/`fav-removeall` — canonical 13)
- Toasts: `Added to favorites` / `Removed from favorites` / `Removed all favorites`
- Feed tab `favorites` = posts ของ favorite sellers (canonical 02 eligibility เดียวกับ tabs อื่น)

## Mute (`muted`)

- `setMuted(scr, seller, on)` — set `p.muted` ทุก post; โพสต์หลุด feed หลัง re-render; **ยัง follow อยู่**
- Entries: `ni-mute` (ni-card → `muteDlgHTML` `Mute {u}?` + `Mute posts`/`Cancel` → `Muted`), `mf-mute` (mfSheet → dlg เดียวกัน), `mute` step บน report:done, settings `muted` list (`m-unmute` → `Posts unmuted`), `pfSetMuted` PF_EXTRA (canonical 06), `unmute`/`Unmuted` toast
- Unfollow ล้าง mute อัตโนมัติ (setFollowing rule)

## Not interested (`ni`) — canonical 02, semantics ที่นี่

- `pm-ni` → `p.ni=true` → card swap เป็น `niCardHTML` ใน place: `Thanks for your feedback` + `We'll suggest fewer posts like this.` + `Undo` (`pm-undo` → `ni=false` + card กลับ) + (following → `Mute {seller}` + `Unfollow {seller}`; ไม่ follow → `Manage content preferences` → `prefs`) + `This post made me uncomfortable`
- `ni-unfollow` → `setFollowing(false)` + card หาย + `Unfollowed`; `ni-mute` → `muteDlgHTML`
- `ni-uncomf` → `uncomfCardHTML` (check + `uc-report` → `openSub("report")` + `uc-undo`)
- หลัง re-render → โพสต์ ni หลุด feed ถาวรจนกว่า restore ที่ Settings `ni` (`ไม่สนใจ`/`Not interested` — `m-restore` → `ni=false` + feed re-render) (canonical 13/02)

---

# 15. Report & Block (social entries)

## Report entries → `report*` routes (canonical flow internals = 15_TRUST_SAFETY, synced FSP-031 — §19)

| Entry | Route | Context |
| --- | --- | --- |
| Others-post `...` → `pm-go-report` | `report` (root) — หรือ `rp-over` ทับ post viewer | `rpUser` = post.seller |
| ni-card uncomfortable → `uc-report` | `report` | เหมือนกัน |
| Comment popover → `Report` | `report:comment` (X only — **ไม่มี back**) | `rpPid`/`rpCid`/`rpTargetType="comment"` |
| Profile `pf-sh-report` / `pf-more` report | `report:pick:{u}` → `report:posts:{u}` (Select a post grid + `Next`) → `report:post` หรือ `report:user` | canonical 06 |
| Chat block-and-report | `report:pick:` / `report:done:` (+ chat teardown `rpClose`) | canonical 07 |
| Board `data-bdact=report` | toast `Report submitted. Thank you for notifying us.` (no route) | canonical 12 |

## Report pages (prototype behavior — entry-level description)

- Reason page (`report`/`report:user`/`report:post`/`report:comment`): head `รายงาน`/`Report` + back (ยกเว้น root `report`, `report:comment`, chat-origin) + X + `Why are you reporting this {account|post|comment}?` + `Your report is anonymous…` + 9 `pm-reason` rows (`PM_REASONS`/`PM_REASONS_TH`: I just don't like it / Bullying or unwanted contact / Suicide, self-injury or eating disorders / Violence, hate or exploitation / Counterfeit or replica item / Nudity or sexual activity / Scam, fraud or spam / False information / Intellectual property)
- `pm-reason` → มี `rpUser` → `report:done:{u}`; ไม่มี → toast `Report submitted · thanks for letting us know` + ปิด stack
- `report:done:{u}` — `Thanks for your feedback` + `We use these reports to show you less of this kind of content in the future.` + `Other steps you can take`: `Block`/`Unblock` (block → blkSheet; unblock → dlg), `Unfollow {u}` (instant — เฉพาะ following, row กลายเป็น completed check), `Mute`/`Unmute {u}` (mute → `muteDlgHTML`; unmute → instant `Unmuted`) + `Done` → `rpClose` + toast `Report submitted · thanks for letting us know`
- Report **ไม่ทำให้ content หายทันที** (15 contract) — moderation อยู่ BO

## Block (`PF_BLOCKED` + `p.blocked`)

- `blkSheetHTML` — `Block {u}?` + `This will also block any other profiles they may have or create in the future.` + impact 3 rows (can't message/find profile & content · won't be notified · unblock anytime in Settings) + `Block` + `Block and report` (จาก chat → Block เดียว)
- `blk-go` → `pfSetBlocked(u, true)`: `PF_BLOCKED` + `PF_REMOVED_FOL` add + `pfSetFollow(false)` (unfollow both ways) + chat thread `blocked` + `p.blocked` ทุก post + feed re-render; toast `Blocking` (transient) — จาก comment popover → กลับ comment sheet + `Blocked and hidden comments`/`บล็อกและซ่อนความคิดเห็นแล้ว`
- `blk-rep` → block + `report:pick:{u}` stack
- `unblockDlgHTML` (`pf-unblock`/`m-unblock`/popover blocked/`rp-step unblock`) — `Unblock {u}?` + desc + `dlg-unblock-go` → `pfSetBlocked(false)` — **ไม่ re-follow** (IG rule) + `pfRestrictHint` banner 6s (`You can restrict them to hide their comments and messages without blocking them completely.` + `Learn more` — tap ปิด)
- Block effects: โพสต์หลุด feed/viewer, comments ของเขาถูก filter จาก sheet, profile แสดง blocked state (canonical 06), ไม่แจ้งอีกฝ่าย (canonical 09 §14)

---

# 16. Guest Gate (social subset ของ `GUEST_GATE_SEL`)

| Gated (→ Member Sheet `Join TukDaeng`) | Not gated (guest ใช้/เห็นได้) |
| --- | --- |
| `.like-btn`, `.share-btn`, `.save-btn`, `.wl-btn`, `.mf-btn` | `.comment-btn` (อ่าน comments), `.liked-by` (เปิด likes sheet), `data-pf-user` rows, `.svd-tile`→viewer (hub ว่างอยู่แล้ว), `sr-saved`/`data-sub="saved"`/`data-sub="wishlist"` (hub เข้าได้แต่ empty), explore/search/viewer surfaces |
| `.follow-btn`, `.lk-follow`, `.sc-follow`, `pf-foll`, `pf-flw`, `pfp-follow`, `al-fbtn` (09), `pm-fav`, `pm-ni`, `pm-go-report`, `pm-own-*` (ผ่าน `.pm-btn`) | |
| `.comment-input`, `.emoji-row`, `.c-like`, `.c-meta`, `c-pop-item` (in-handler gate) | |
| `.rp-opt`, `.pm-reason`, `rp-step` (ผ่าน selector ครอบในไฟล์ — guest เข้า report page ไม่ได้อยู่แล้วเพราะ entries ทั้งหมด gated) | |
| `[data-bdlike]`, `[data-bdsave]`, `[data-bdshare]`, `[data-bdact]` share/save/report (12) | |

- Social settings rows (`interested`/`ni`/`favorites`/`muted`/`blocked`) เข้าผ่าน Settings — 00_GLOBAL §11 capabilities (canonical 13)
- Session switch → `applySessionData` refresh `.feed-list` + `.page-sub` + badges (canonical 00_GLOBAL §7)

---

# 17. Notifications (cross-module hand-off → 09 canonical)

- Social actions ใน session **ไม่สร้าง alert row** — `ALERTS` เป็น seed เท่านั้น (09 §14 lock)
- Trigger contract (09): like → `like` row (aggregate) → Post Viewer โพสต์ตัวเอง; comment → `comment` row → เดียวกัน (ไม่มี focus/deep-scroll comment); follow → `follow` row + `Follow back`/`Following` (`al-fbtn` → `pfSetFollow` จริง) + dismiss `x` → `profile:{follower}`; post หาย → `This post is no longer available`
- `Report`/block/unfollow/remove-follower/mute **ไม่แจ้งอีกฝ่าย** (canonical 06 §14 / 09)
- Share/save/wishlist/not-interested ไม่มี alert
- **ไม่มี "Notification Center"** — UI = Alerts feed (`แจ้งเตือน`/`Alerts`, route `alerts`)

---

# 18. Empty / Error / Toasts

| Case | Copy |
| --- | --- |
| Saved hub empty | `Nothing saved yet`/`ยังไม่มีรายการที่บันทึก` + `Save posts you want to see again. Only you can see what you've saved.` |
| Saved collections empty | `No collections yet`/`ยังไม่มีคอลเลกชัน` + `Create a collection to organise your saved posts.` |
| Saved/col search empty | `No results found`/`ไม่พบผลลัพธ์` + `No saved posts match "{q}".`/`ไม่มีโพสต์ที่บันทึกไว้ตรงกับ "{q}"` |
| Wish List empty | `Nothing on your wish list yet`/`ยังไม่มีรายการในสิ่งที่อยากได้` + `Tap the gift icon on a model page to add it here.` |
| WL search empty | `No results found` + `No wish list posts match "{q}".`/`ไม่มีรายการในสิ่งที่อยากได้ตรงกับ "{q}"` |
| Saved add-picker empty | `No saved posts to add` + `Add posts to your saved first, then add them here.` |
| WL add-picker empty | `No wish list posts to add` + `Add posts to your wish list first, then add them here.` |
| Cover picker empty | `No posts yet` + `Save posts to this collection first.` / `Add posts to this collection first.` |
| Comments empty | `No comments yet`/`ยังไม่มีความคิดเห็น` (inline ใน sheet-list) |
| Settings social lists empty | `Nothing here yet`/`ยังไม่มีข้อมูลที่นี่` (`subPostRows`) |

**Toasts (scrToast 1.8s; มี thumb เมื่อระบุ)**

| Action | Copy |
| --- | --- |
| Save | `Saved` / `Saved to {col}` / `Removed from your saved` / `Removed from {col}` / `Removed from All posts` (+thumb) |
| Wish List | `Added to Wish List` / `Added to {col}` / `Removed from your wish list` / `Removed from {col}` / `Removed from Wish List` (+thumb) |
| Move/add | `Moved to {col}` / `Added to {col}` (+thumb) / `Added N post(s)` |
| Collection | `Collection created` / `Collection updated` / `Collection deleted`/`ลบคอลเลกชันแล้ว` |
| Share | `Sent to {name}` / `Shared to {app}` / `Link copied` |
| Follow | `Unfollowed`/`เลิกติดตามแล้ว` |
| Favorites | `Added to favorites` / `Removed from favorites` / `Removed all favorites` |
| Mute | `Muted` / `Posts unmuted` / `Unmuted` |
| Block | `Blocking` / `Blocked and hidden comments`/`บล็อกและซ่อนความคิดเห็นแล้ว` |
| Comment | `This comment was removed.`/`ลบความคิดเห็นแล้ว` |
| Report | `Report submitted · thanks for letting us know` |

---

# 19. Deviations & Prototype Quirks

| # | Topic | Prototype | Contract / note |
| --- | --- | --- | --- |
| D1 | Like ↔ Favorites | `liked` per-post, `favorite` per-seller feed tab — ระบบแยกกัน | Spec เดิมบอก like→Favorites — แก้ตาม prototype; liked posts = `interested` list |
| D2 | Comment composer | `.comment-input` dead (div), `.c-meta` Reply dead — emoji-row เป็นทางเดียวที่เพิ่ม comment | Contract: composer จริง (text submit + Reply affordance) — future |
| D3 | Comment entry | `comment-btn` บน card ทุก surface เปิด sheet ตรง — ไม่บังคับผ่าน detail | Spec เดิมบอก comment เฉพาะ Asset Detail — แก้ตาม prototype (02/03 lock แล้ว) |
| D4 | `lk-follow` cosmetic | Follow button ใน likes sheet flip label เท่านั้น ไม่ propagate | Contract: `setFollowing` จริง — flag (FSP-030 quirk list) |
| D5 | `pv-add` กับ `noComments` | `pv-add` bar แสดงเสมอแม้โพสต์ปิด comment — เปิด sheet ได้ | canonical 03 quirk — รับตาม prototype |
| D6 | `liked-by` strip บาง card | `likedBy` ไม่มี → strip ซ่อน; `p.likedBy.name` ใน lk sheet จะพังถ้าเปิดบนโพสต์ไม่มี likedBy (entry ทั้งหมดซ่อนตามเงื่อนไขเดียวกันจึงไม่เกิดจริง) | note only |
| D7 | Session flags | `savedAt`/`colAt`/`likes`/`views`/`comments` ไม่อยู่ใน `POST_FLAG_KEYS` — sort stamps + counts ค้างข้าม session (`savedCols`/`wlCols` อยู่ใน keys แล้ว — memberships ล้าง/คืนถูกต้อง) | cosmetic — lists filter flag ก่อนจึงไม่ leak UI; dev ให้ reset stamps เพิ่มเทียบท่าเดียวกัน |
| D7b | Library persistence | prototype persist = `POSTS_SNAP` in-memory + `fo_*` localStorage mirrors ต่อ session — การ์ด/flag อยู่รอด sign-out/in ในเครื่องเดียว | contract: server-backed ข้าม kill/restart + cross-device sync (lock FO-TEST-12/13/14) — prototype จำลองไม่ได้โดยเจตนา |
| D8 | `COLLECTIONS` seed มีชื่อ `"Wishlist"` | Saved-collection ธรรมดา ชื่อชนกับ Wish List pseudo-collection | แยกระบบสมบูรณ์ — แค่ naming ชน |
| D9 | Report pages no-back | `report` root + `report:comment` + chat-origin ไม่มี back — X only | รับตาม prototype |
| D10 | `commentPreview` | ฟีดการ์ดแสดง preview 1 บรรทัด — ไม่ใช่ comment sheet entry | canonical 02 card anatomy |
| D11 | Board `data-bd*` | Article like/save/share/report แยกระบบ (article objects + toasts เฉพาะ) | canonical 12 — ไม่ใช่ social post state |
| D12 | `m-unsave` settings | unsave จาก settings list ไม่มี confirm | รับตาม prototype |
| D13 | ~~15_TRUST_SAFETY ยังไม่ sync~~ **RESOLVED FSP-031** | 15_TRUST sync ระดับ prototype แล้ว (report stack `report*` routes/`PM_REASONS`/pickers/done page/shared surfaces — ตรงกับที่เอกสารนี้อ้าง); reason taxonomy/SLA/moderation contract คงอยู่ใน 15 ตามเดิม | resolved — flag เดิม FSP-023+ |

---

# 20. Analytics Events (contract — prototype ไม่มี tracking)

- `post_liked` / `post_unliked` / `likes_sheet_opened`
- `comment_sheet_opened` / `comment_emoji_reacted` / `comment_deleted` / `comment_report_started` / `comment_blocked_from_popover`
- `share_sheet_opened` / `post_shared_friend` / `post_shared_app` / `post_link_copied`
- `post_saved` / `post_unsaved` / `saved_collection_created` / `saved_collection_renamed` / `saved_collection_deleted` / `saved_moved_to_collection` / `saved_bulk_unsaved`
- `post_wishlisted` / `post_unwishlisted` / `wl_collection_created` / `wl_collection_deleted` / `wl_moved_to_collection`
- `user_followed` / `user_unfollowed` / `favorite_added` / `favorite_removed` / `seller_muted` / `seller_unmuted` / `post_marked_not_interested` / `post_ni_restored`
- `report_started` / `report_reason_selected` / `report_completed` / `user_blocked` / `user_unblocked`
- `guest_social_gated` (Member Sheet จาก social action)

---

# 21. Acceptance Criteria

## AC-SOCIAL-001: Like toggles across surfaces

Given Member เห็นโพสต์บน feed card หรือ detail หรือ post viewer
When กด `like-btn`
Then `p.liked` toggle + `p.likes` ±1 + ทุก `.like-btn` ของ pid เดียวกันใน screen flip พร้อมกัน
And โพสต์ตัวเอง → `lk-n` count อัปเดต; โพสต์คนอื่นไม่แสดง count

## AC-SOCIAL-002: Like is private — liked-by strip + lk sheet

Given โพสต์มี `likes>0` + `likedBy` และไม่ `hideCounts`
When กด `liked-by` strip (หรือ `Likes` label บน viewer)
Then likes sheet เปิดพร้อม liker rows + `lk-note` เฉพาะโพสต์คนอื่น
And guest เปิด sheet ได้แต่ `lk-follow` gate → Member Sheet

## AC-SOCIAL-003: Comment sheet opens from any surface

Given โพสต์ไม่ `noComments`
When กด `comment-btn` บน feed card / detail / viewer / `pv-add`
Then comment sheet เปิด (`nt` variant เมื่อ viewer โดยไม่มี detail-open) แสดง comments + one-level replies
And guest อ่านได้โดยไม่ gate

## AC-SOCIAL-004: Emoji quick-react adds own comment

Given Member เปิด comment sheet
When กด emoji ใน `.emoji-row`
Then comment ใหม่ `{name: CP_ME, time:"Just now"}` ถูกเพิ่มท้าย list + `p.comments`++ + `.comment-count` sync + scroll ลงล่าง

## AC-SOCIAL-005: Long-press moderation — delete own comment

Given Member long-press (≥450ms) comment ของตัวเอง
Then popover แสดง `Delete` เท่านั้น
When กด Delete → confirm dlg
Then root comment ลบทั้ง replies (`comments -= 1+replies`) / reply ลบเฉพาะตัว (`comments--`) + toast `This comment was removed.` — ไม่มี undo

## AC-SOCIAL-006: Long-press moderation — report/block others

Given Member long-press comment คนอื่น
Then popover แสดง `Block` + `Report`
When เลือก Report → `report:comment` page (X only); เลือก Block → blkSheet (หรือ unblock dlg ถ้า blocked อยู่)
And block สำเร็จ → comments ของเขาหายจาก sheet + toast `Blocked and hidden comments`
And report ไม่ทำให้ comment หายทันที

## AC-SOCIAL-007: Guest gate บน comment actions

Given Guest เปิด comment sheet (ผ่าน `comment-btn` ที่ไม่ gate)
When กด `.c-like` / `.c-meta` / `.emoji-row` / `.comment-input` / popover item
Then Member Sheet `Join TukDaeng` เปิดแทน execute

## AC-SOCIAL-008: Share sheet — friends / apps / copy

Given Member กด `share-btn` บน surface ใดก็ได้
Then share sheet เปิด (search filter + 12 friends + 5 apps)
When เลือก friend → `Sent to {name}`; app → `Shared to {app}`; Copy link → `Link copied`
And sheet ปิดทันทีหลังเลือก

## AC-SOCIAL-009: Save via sheet + collections

Given Member กด `save-btn`
Then post ถูก mark `saved` + sheet เปิด (Saved + collections + New collection)
When pick `Saved` ขณะ saved → unsave (`savedCols` ล้างทั้งหมด) + `Removed from your saved`
And pick collection → `savedCols` เพิ่มชื่อนั้น + `Saved to {col}`; pick collection ที่ check อยู่ → เอาออกเฉพาะ col นั้น + `Removed from {col}` (ติ๊กได้หลาย col)
And `New collection` → nc sheet → สร้าง + `savedCols.push(name)` + `Saved to {name}`

## AC-SOCIAL-010: Saved hub — tabs / search / tile → viewer

Given Member เข้า `saved` (settings row / `.sr-saved`)
Then head `Saved` + tabs All/Collections/Posts + collections section + all-posts grid
When กด search → live filter + empty `No results found`/`No saved posts match "{q}"`
And กด tile → post viewer `feed` mode ตาม list หน้านั้น (canonical 03/AC-NAV-026)
And guest เข้าได้แต่เห็น `Nothing saved yet`

## AC-SOCIAL-011: Saved select/manage — move, unsave, delete collection

Given Member ใน saved/savedcol เลือก `Manage` หรือ long-press tile
Then select mode: `Select all` + bar `Unsave`/`Add to collection` (in-col: `Remove`/`Move to collection`)
When Unsave ใน all-posts → confirm `Unsave post?` → `saved=false, savedCols=[]` ที่เลือก + `Removed from All posts`
And Remove ใน col → `Remove from this collection?` → ลบเฉพาะ col นั้นออกจาก `savedCols` + `Removed from {col}`
And Move → move sheet (ไม่มี current col + New collection) → in-col `Moved to {col}` (เปลี่ยน membership) / hub `Added to {col}` (additive); move→new col = `savedCols=[name]` ล้างเดิม
And `...` → Delete collection → `Delete collection?` → ลบชื่อออกจาก `savedCols` ทุก post (posts ยัง saved) + `Collection deleted`

## AC-SOCIAL-012: Wish List — detail entry + parallel collections

Given Member กด `wl-btn` บน Post Detail (entry เดียว)
Then `wishlisted` + wl sheet เปิด (`"Wishlist"` = pseudo-row ของ flag)
When pick `Wish List` ซ้ำ → un-wishlist (`wlCols` ล้าง) + `Removed from your wish list`; pick collection → `wlCols.push` + `Added to {col}`; pick col ที่ check อยู่ → เอาออกเฉพาะ col นั้น
And hub `wishlist`/`wishcol` ทำงานขนาน Saved (tabs/search/manage/move/edit/cover/delete)
And empty → `Nothing on your wish list yet` + `Tap the gift icon on a model page…`

## AC-SOCIAL-013: Follow is account-level + unfollow confirm

Given Member กด `follow-btn` (post-head/detail/viewer foot/`pfp` head pill/`sc-follow`)
Then `p.following` ทุก post ของ seller flip + ปุ่ม sync ข้าม surface
When กด `following` → `uf` sheet `Unfollow @{seller}?` → confirm → `setFollowing(false)` + ล้าง `favorite`+`muted` + `Unfollowed`
And ไม่มีปุ่ม follow บนโพสต์ตัวเอง; follow ผ่าน `pfSetFollow` sync `PF_EXTRA_FOL` สำหรับ user ไม่มี post (canonical 06)

## AC-SOCIAL-014: Favorites / Mute / Not-interested semantics

Given Member เลือก `pm-fav` (เฉพาะ `following||favorite`) → `setFavorite` ± toast
And `ni-mute`/`mf-mute` → `muteDlgHTML` → `Muted` + โพสต์หลุด feed หลัง re-render
And `pm-ni` → card แปลง ni-card (Undo/Mute/Unfollow/Manage prefs/uncomfortable)
And restore: `m-unlike` (interested), `m-restore` (ni), `m-unmute` (muted), `m-unblock` (blocked)

## AC-SOCIAL-015: Report entries + done page

Given Member เลือก Report จาก `...` menu / uncomfortable card / comment popover / profile
Then เปิด `report`/`report:comment`/`report:pick:{u}` ตาม context
When เลือก `pm-reason` → `report:done:{u}` `Thanks for your feedback` + Other steps (Block/Unblock, Unfollow, Mute/Unmute) + `Done`
And report ไม่ทำให้ content หายทันที (15 contract); `report`/`report:comment` ไม่มี back — X only

## AC-SOCIAL-016: Block effects

Given Member confirm `Block` ใน blkSheet
Then `PF_BLOCKED`+unfollow both-ways+`p.blocked` ทุก post+chat blocked+feed re-render + toast `Blocking`
And comments ของ blocked user ถูก filter จาก sheet; unblock (dlg) ไม่ re-follow + `pfRestrictHint` 6s

## AC-SOCIAL-017: Guest gate — Member Sheet

Given Guest กด social action ใน `GUEST_GATE_SEL` (like/save/share/wl/follow/comment-input/emoji/c-like/c-meta/lk-follow/pm-*/rp-*/pf-*)
Then Member Sheet `Join TukDaeng` เปิด (gate mode — scrim dismiss) แทน execute
And `.comment-btn`/`.liked-by`/hub entries ไม่ gate — guest เห็น read-only/empty state

## AC-SOCIAL-018: Session data rules

Given สลับ session `member` ↔ `guest`/`new`
Then `member` → restore flags + `COLLECTIONS`/`WISHLISTS`; `guest`/`new` → clear ทั้งหมด (`POST_FLAG_KEYS` + PF sets + collections + WATCH_ALERTS)
And counts (`likes`/`views`/`comments`) ไม่ reset (post data ไม่ใช่ user data — §19 D7)

---

# 22. Related Modules

- [02_FEED_MODULE.md](02_FEED_MODULE.md) — post card anatomy + `pm-*` menus + ni-card + feed tabs + eligibility (entry canonical)
- [03_SEARCH_FILTER_MODULE.md](03_SEARCH_FILTER_MODULE.md) — post viewer modes + rail/foot actions + `pv-add`/`sr-saved` entries
- [05_ASSET_DETAIL_MODULE.md](05_ASSET_DETAIL_MODULE.md) — detail action row + `wl-btn`/`mf-btn` entries
- [06_PROFILE_MODULE.md](06_PROFILE_MODULE.md) — `pfSetFollow`/`pfIsFollowed`/`pfSetFav`/`pfSetMuted`/`pfSetBlocked`/`pfIsBlocked` canonical, `pf-foll`/`mfSheet`/`pfollow:`/`pf-rmf`/`pf-sh-*`, QR share overlay
- [07_CHAT_MODULE.md](07_CHAT_MODULE.md) — chat threads + `blkSheetHTML(fromChat)` + chat-origin report teardown
- [09_NOTIFICATION_MODULE.md](09_NOTIFICATION_MODULE.md) — Alerts feed canonical + trigger contract
- [10_WATCH_ALERT_MODULE.md](10_WATCH_ALERT_MODULE.md) — `mf-btn`/`waSheetHTML` canonical
- [12_BOARD_MODULE.md](12_BOARD_MODULE.md) — board article `data-bd*` actions (แยกระบบ)
- [13_SETTINGS_MODULE.md](13_SETTINGS_MODULE.md) — `interested`/`ni`/`favorites`/`muted`/`blocked`/`notif_settings` pages + library rows
- [15_TRUST_SAFETY_MODULE.md](15_TRUST_SAFETY_MODULE.md) — report taxonomy/SLA/moderation contract (synced FSP-031 — §19 D13 resolved)
- [00_NAVIGATION_AND_CROSS_MODULE_FLOW.md](00_NAVIGATION_AND_CROSS_MODULE_FLOW.md) — routes + sheets inventory + gate routing + viewer entry rule
- [00_GLOBAL_RULES_MODULE.md](00_GLOBAL_RULES_MODULE.md) — session §7 / Member Sheet §11 / block §13 / private data §14

---

# 23. Future Enhancement

- Comment composer จริง (text input + submit + Reply target) — dead UI ตอนนี้เป็น placeholder
- Edit comment, multi-level replies, attachment, reactions, mentions
- `lk-follow` → `setFollowing` จริง (D4)
- Native OS share + share deep links + share counts
- Notification generation จาก social actions (09 §14 contract)
- Reset `savedAt`/`colAt` + counts ใน session switch (D7)
- Report tracking for reporter (report flow full sync ใน 15 ทำแล้ว — D13 resolved FSP-031)
