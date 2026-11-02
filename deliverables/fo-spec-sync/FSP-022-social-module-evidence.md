# FSP-022 — 11_SOCIAL Update Evidence (like/comment/share/save/wishlist/follow + report-block entries)

Date: 2026-10-22
Task: `9fb7ccc8` — "FSP-022 อัปเดต 11_SOCIAL — like/share/follow + saved/wishlist (mission:cc291dc9)"
Scope: `FrontOffice/11_SOCIAL_MODULE.md` (rewrite ทั้งไฟล์ ~614 บรรทัด) + `FrontOffice/README_MODULE_INDEX.md` (one-liner module 11) — sync ตาม `Prototypes/fo-flow/index.html` (read-only) + baseline 00_GLOBAL (session §7, gate §11 Member Sheet, block §13, private §14) / 00_NAV (sheets inventory §6, routes `saved`/`savedcol`/`wishlist`/`wishcol`/`interested`/`ni`/`pfollow:`/`report:*` §7, notif destination §8, gate §9, AC-NAV-026) / 02_FEED (post card + `pm-*` menus + ni-card + feed tabs + eligibility + `refreshPostViews` — FSP-002 lock, เดลีเกต likes sheet/follow semantics/social graph/saved-wishlist hub มา 11) / 03_SEARCH (post viewer modes + `pv-add` + `sr-saved` entry — FSP-016 lock) / 05_ASSET_DETAIL (detail action row + `wl-btn`/`mf-btn` — FSP-017 lock) / 06_PROFILE (`pfSetFollow`/`pfSetFav`/`pfSetMuted`/`pfSetBlocked`/`pfollow:`/`mfSheet`/QR share — FSP-019 lock) / 09_NOTIFICATION (Alerts feed canonical — FSP-021 lock) / 10_WATCH_ALERT (`mf-btn` WA — FSP-021 lock) / 13_SETTINGS (`interested`/`ni`/`favorites`/`muted`/`blocked` pages + library rows) / 15_TRUST_SAFETY (report contract — ยังไม่ sync)
Context: FSP-021 session note + evidence `FSP-016..021` + gap docs `gap-FSP-002b-create-saved-wa.md` (saved/WA), `gap-FSP-003a-profile-portfolio.md` (follow/profile social), `gap-FSP-003b-chat-notifications.md` (chat-notif boundary)

Prototype anchors verified (scan บน working copy ปัจจุบัน @ HEAD `02de990` — owner's comment long-press work committed เป็น `1540195`; line anchors ในเอกสารนี้คือ state ปัจจุบัน อาจ drift ให้ค้นด้วย function-name):

**Comments:** `COMMENTS` seed ~13339 (`replies[]` 1 ชั้น; บาง thread ไม่มี `id` → auto `c-{i}`/`r-{ci}-{ri}`); `commentsFor` ~13802 (generated comments จาก `LIKER_POOL`+`PF_CMT_TIMES`+`PF_CMT_TEXTS` เมื่อ `p.comments>0` ไม่มี seed); `commentRowsHTML` ~13815 (filter `pfIsBlocked` ทั้ง comment+replies; row `data-pid/cid/rid/author/is-own`); `commentsHTML` ~13953 (`sheet-title` + `.sheet-list` + `.emoji-row` 8 emoji + `.comment-input` dead div); `openCommentPopover`/`closeCommentPopover`/`delCommentDlgHTML`/`deleteComment` ~13858–13951 (popover anchor ใน `.comment-sheet`; own→Delete / others→Block+Report); `dlg-delcomment-go` ~22971 (root ลบ cascade `comments -= 1+replies`, reply `comments--` + toast `This comment was removed.`/`ลบความคิดเห็นแล้ว`); `c-pop-item` handler ~22913 (guest → `obGate` in-handler); `emoji-row` ~22992 (push `c-own-{ts}` own comment + count++ + scroll bottom — **เป็นวิธีเดียวที่เพิ่ม comment ได้**); `c-like` ~23028 (cosmetic toggle ไม่ persist); `.c-meta` Reply = **ไม่มี handler** (dead); long-press `pointerdown/move/up` ~23595+ (450ms, 8px threshold — owner commit `1540195` ไม่แตะ)

**Like/Share/Save/WL sheets:** `likesSheetHTML` ~14002 (likers=`p.likedBy`+`LIKER_POOL` dedupe; `lk-note` เฉพาะโพสต์คนอื่น `Only {seller} can see the total number of likes…`); `shareSheetHTML` ~14021 (`.sh-q` + `FRIENDS` 12 + `SHARE_APPS` 5: Messenger/Direct/LINE/Facebook/Copy link); `saveSheetHTML`/`COLLECTIONS` ~14043 (head `Saved`/`Private` + rows + `sv-new`); `wlSheetHTML`/`WISHLISTS` ~14072 (`Wish List` + gift icon fill); `openSheet` ~14096 (variants `uf pm pm-rp lk sh sv so dt nt ps nc wl wa mf`); `ncSheetHTML` ~15876 (Cancel/Next|Save + preview + 40-char count); `LIKER_POOL`/`FRIENDS`/`SHARE_APPS`/`COLLECTIONS`/`WISHLISTS` ~13969–14070; `pfProfileLink`/`pfQrSvg`/`pfQrPaint`/`PF_QR_THEMES`/`pfOpenQr` ~14105–14180 (QR share — canonical 06)

**Saved/Wishlist hub:** `SAVED_TABS` ~15319 (`all`/`collections`/`posts`); `savedState` ~15322; `archivePosts`/`archiveHTML` ~15327 (canonical 02); `savedPosts`/`colPosts`/`colCover`/`savedList`/`svdTileHTML`/`colCardHTML`/`colCardBigHTML` ~15345–15377; `svdConfirmDelete`/`svdDeleteCol`/`svdEmptyHTML`/`svdSparkIcon`/`svdBarHTML`/`svdSelectHeadHTML`/`savedSearchBodyHTML`/`savedBodyHTML`/`savedHTML` ~15378–15499; `savedColHTML` ~15500; `wlState`/`wlPosts`/`wlColPosts`/`wlListPosts`/`wlColCover`/`wlSparkIcon`/`wlColCardHTML`/`wlBodyHTML`/`wishlistHTML` ~15539–15649; `wishColHTML`/`wlAddHTML`/`wlEcCoverHTML`/`wlEditHTML`/`wlCoverHTML`/`wlMoveSheetHTML`/`wlDeleteCol`/`inWlCol`/`isWl`/`colState`/`colList`/`ecCoverHTML`/`svdEditHTML`/`svdCoverHTML`/`svdAddHTML`/`svdMoveSheetHTML` ~15553–15875; settings rows `data-sub="saved"|"wishlist"|"interested"|"ni"` ~17527–17872; `interested`=`POSTS.filter(p.liked)`+`m-unlike`, `ni`=`p.ni`+`m-restore` ~17871

**Menus/follow/state:** `PM_REASONS`/`PM_REASONS_TH` ~14232–14253 (9 เหตุผล); `pmMenuHTML` ~14255 (reportOnly variant / `pm-fav` conditional `following||favorite` / `pm-ni` / `pm-go-report`); `pmOwnMenuHTML` ~14278 (canonical 02); `refreshPostViews` ~14295; `niCardHTML`/`uncomfCardHTML` ~14324–14350 (Undo/Mute/Unfollow/prefs/uncomfortable→check+Report); `setFollowing` ~14472 (ทุก `p.seller===seller`; unfollow ล้าง `favorite`+`muted`; inject `.follow-btn`; re-render `following`/`favorites` tab); `setMuted`/`mutedSellers`/`favoriteSellers`/`followedSellers`/`setFavorite` ~14515–14534; `scrToast` ~14504 (1.8s, optional thumb); `muteDlgHTML` ~15074; `pfSetBlocked` ~17033 (PF_BLOCKED+PF_REMOVED_FOL+pfSetFollow(false)+chat `blocked`+`p.blocked`+feed re-render); `blkSheetHTML` ~17053 (`Block {u}?` + 3 impact rows + `Block`/`Block and report`); `unblockDlgHTML` ~17083; `pfRestrictHint` ~17092 (6s banner); `mfSheetHTML` ~17130 (canonical 06)

**Report pages:** `rpOpenFromPost`/`rpPush`/`rpBack`/`rpClose`/`pmDropCovered` ~15234–15307 (`rp-over` ทับ viewer); routes `report`/`report:user`/`report:post`/`report:comment` (reason pages — `hasBack` false เมื่อ root/`report:comment`/chat-origin) + `report:pick:{u}` (What do you want to report? → posts/acct) + `report:posts:{u}` (Select a post grid + `Next`) + `report:done:{u}` (Thanks for your feedback + Other steps: block/unblock/unfollow/mute + `Done`) ~17873–17933

**Handlers:** `follow-btn`/`uf-confirm`/`uf-cancel` ~22236–22274 (following→uf sheet, else instant `setFollowing`); `comment-btn` ~22392 (`nt` variant เมื่อ `pv-open`+`!detail-open`); `liked-by` ~22408 → `lk`; `lk-follow` ~22418 (cosmetic flip — **ไม่เรียก setFollowing**); `share-btn`/`sh-fr`/`sh-app` ~22424–22445 (`Sent to {name}`/`Shared to {app}`/`Link copied`); `svd-manage`/`svd-done`/`svd-tab`/`svd-see`/`svd-col`/`svd-srch`/`svd-selall`/`svd-cancel`/`svd-x`/`svd-plus`/`svd-more`/`svd-mi`/`ec-chgcover`/`ec-ctile`/`ec-del`/`dlg-delcol-go`/`svd-editdone`/`svd-adddone`/`svd-tile` ~22446–22660; `svd-move`/`svd-mv`/`svd-mv-new`/`svd-unsave`/`dlg-unsave-go`/`dlg-rmcol-go`/`nc-cancel`/`nc-x`/`nc-next` ~22662–22813; `wl-btn`/`wl-pick`/`wl-new`/`wl-col` ~22814–22858; `save-btn`/`sv-pick`/`sv-new` ~22867–22912; `c-popover-backdrop`/`c-pop-item`/`dlg-delcomment-go` ~22913–22991; `emoji-row` ~22992; `sheet-backdrop`/`sheet-handle` close ~23021; `c-like` ~23028; `like-btn` ~23111 (±1 + `.lk-n` sync ทุกปุ่ม pid เดียวกัน); `pm-own-*` ~20842; `pm-fav` ~20890; `pm-ni`/`ni-unfollow`/`pm-undo`/`pm-go-report`/`rp-opt`/`pm-reason` ~20902–20966; `ni-mute`/`ni-pref`/`ni-uncomf`/`uc-report`/`uc-undo` ~20968–21000; `mf-fav`/`mf-mute`/`mf-unf` ~21813; `blk-rep`/`blk-go`/`rp-step`/`rp-next`/`rp-done`/`pf-unblock`/`m-unblock`/`pf-rhint` ~21951–22029; `m-unmute`/`m-unsave`/`m-restore`/`m-unlike`/`fav-remove`/`fav-add`/`fav-removeall` ~21396–21460; `pv-add` ~21577 (`nt` comment sheet); long-press `.svd-tile` contextmenu ~20486; `.sh-q`/`.fav-q`/`.pfl-q`/`.svd-q`/`.nc-input` input filters ~20418–20468

**Session/gate:** `POST_FLAG_KEYS`/`snapPosts`/`clearUserData`/`restoreUserData`/`applySessionData`/`setSession` ~23421–23482 (`POST_FLAG_KEYS` ไม่มี `likes`/`views`/`comments`/`savedCol`/`savedAt`/`colAt` — ดู deviation D7); `GUEST_GATE_SEL`+`obGate` ~23486+ (trigger ~20519 — social selectors ดูตาราง §16)

## 1. What changed (section map)

| Section | Change |
| --- | --- |
| Header/§1 Doc Info | rewrite — `Social` → post-centric IG-style; spec เดิม asset-centric (Like→Favorites, Comment เฉพาะ detail, "Notification Center", "Global Login Required Dialog") |
| §2 Objective | rewrite — ขอบเขต post/account interactions + shared sheets + private hubs + guest gating |
| §3 Prototype Reference | **ใหม่ทั้งก้อน** — ~80 anchors จัดกลุ่ม comments/sheets/hubs/menus/report/handlers/session/gate (function-name + line ปัจจุบัน + drift note) |
| §4 Master Alignment | **rewrite** — แถว "Like↔Favorites" แก้เป็น liked≠favorite; "Comment entry" แก้เป็น card-ทุก-surface; เพิ่ม comment composer dead/emoji-react, Save/WishList เป็นระบบใหม่, guest gate→Member Sheet, Notification→Alerts feed, share→in-app sheet |
| §5 Scope | rewrite — In = like/likes sheet, comment sheet+moderation, share sheet, save+wishlist sheets+hubs+collections CRUD, follow/fav/mute/ni semantics, report/block entries, gate+session; Out = composer จริง/nested replies/native share/notif generation/`data-bd*`(12)/`mf-btn`(10)/report internals(15)/chat(07) |
| §6 Surface Mapping | **ใหม่** — 16 surfaces (feed card, detail, viewer, comments/likes/share/save/wl/nc/uf/pm sheets, saved+wishlist hubs, report pages, settings social lists) |
| §7 User States | rewrite — Guest (อ่านได้: comments/likes sheet/hub empty; gate ทุก action), Member, New (empty state), Owner (like ตัวเอง + `lk-n` + own popover Delete เดียว), Blocked context |
| §8 Data Model | **ใหม่** — post flags table + `PF_*` sets + `COLLECTIONS`/`WISHLISTS` (Private) + session snapshot `POST_FLAG_KEYS` |
| §9 Like & Likes Sheet | **ใหม่** — toggle sync ±1/`lk-n` own-only/`liked-by` strip conditions/`lk-note`/`lk-follow` cosmetic + `interested` link |
| §10 Comments | **ใหม่** — sheet anatomy + `nt` variant, generated comments, emoji quick-react (เขียนได้ทางเดียว), `.c-like` cosmetic, long-press popover, delete cascade + copies, block-filter rows |
| §11 Share | **ใหม่** — `sh` sheet (`.sh-q` filter + friends + 5 apps + toasts), reuse โดย `pf-sh-share`(06)/`data-bd*`(12); ไม่มี native share/deep link |
| §12 Save & Collections | **ใหม่** — `save-btn` auto-save+sheet, `sv-pick` 3-branch semantics, Saved hub (tabs/search/manage/tile→viewer), `savedcol` CRUD (add/edit/cover/rename/delete), select+move+unsave dialogs, long-press select, `m-unsave` |
| §13 Wish List | **ใหม่** — `wl-btn` detail-only, `wl-pick` semantics, `wishlist`/`wishcol` hubs ขนาน Saved, empty copies, แยกระบบกับ Saved + `"Wishlist"` naming quirk |
| §14 Follow/Fav/Mute/NI | **ใหม่** — `setFollowing` account-level + unfollow ล้าง fav+mute, `uf` confirm sheet, surface sync rules, favorites (`pm-fav` conditional), mute (`muteDlgHTML`+settings), ni-card→uncomf-card→restore |
| §15 Report & Block | **ใหม่** — entry table (`pm-go-report`/`uc-report`/comment popover/`pf-sh-*`/chat/board), report page anatomy + reasons + `report:done` Other steps, blkSheet + unblock dlg + `pfRestrictHint` + block effects |
| §16 Guest Gate | **ใหม่** — gated vs not-gated table ตาม `GUEST_GATE_SEL` จริง + in-handler `c-pop-item` gate |
| §17 Notifications | **ใหม่** — hand-off ไป 09 canonical (no in-session generation, trigger contract, ไม่แจ้งฝั่ง report/block) — **แทน "Notification Rules" เดิมทั้งตาราง** |
| §18 Empty/Toasts | **ใหม่** — empty copies ต่อ surface + toast inventory ครบ (รวม thumb variants) |
| §19 Deviations | **ใหม่** — D1–D13 (liked≠favorite, dead composer/Reply, comment entry ทุก surface, `lk-follow` cosmetic, `pv-add`+noComments, likedBy guard, session-flag gap, `"Wishlist"` naming, report no-back, commentPreview, `data-bd*` boundary, `m-unsave` no-confirm, 15 unsynced) |
| §20 Analytics | rewrite — contract `post_*`/`saved_*`/`wl_*`/`user_*`/`report_*`/`guest_social_gated` — ลบ `asset_liked`/`guest_social_login_required_shown` เดิม |
| §21 ACs | **rewrite ทั้งชุด** — AC-SOCIAL-001–018 (เดิม 001–014 + 008A/008B suffixes) renumber sequential |
| §22 Related | +00_GLOBAL/00_NAV/02/03/05/06/07/09/10/12/13/15 links ตาม boundary ใหม่ |
| §23 Future | +composer จริง, `lk-follow` real, native share, notif generation, session-flag reset, 15 report sync, edit/nested comments/mentions |
| README_MODULE_INDEX L66 | "Like, favorite sync, comment, follow, share" → "Like, comments, share, save/collections, Wish List, follow, report/block entries" |

## 2. Cross-doc ref check (ก่อนปิดงาน)

| Check | Result |
| --- | --- |
| `Global Login Required` ใน 11 ใหม่ | **0 actionable hits** — เหลือเฉพาะ §4/§19 rename-trace จงใจ (spec-เดิม → Member Sheet); กฎจริงใช้ `GUEST_GATE_SEL`+`obGate` ตาม 00_GLOBAL §11 ✓ |
| `Notification Center` ใน 11 ใหม่ | **0 actionable hits** — เหลือเฉพาะ rename-trace จงใจ; §17 ใช้ `Alerts feed`/`route alerts` ตาม 09 canonical ✓ |
| Baseline delegation claims | 02 L96 (likes sheet/follow semantics/social graph/saved-wishlist hub → 11 FSP-022) → §9/§12/§13/§14 ครอบครบ ✓; 03 L80/L84 (saved/wishlist hub + comment/likes/share/save sheet internals → 11) → §10/§11/§12/§13 ✓; 05 L82 (shared sheets canonical 02+11) → §9–§13 ✓; 06 L102/L228 (`shareSheetHTML` canonical 11; QR overlay 06) → §11 อ้าง boundary ✓; 13 L61/L110/L515/L521 (library rows + `interested` semantics → 11) → §9/§12/§13 ✓; 09 §14 trigger contract (like/comment→own-post viewer, follow→profile, no generation) → §17 ✓ |
| 02 L569 `lk-follow` claim | 02 บอก "visual-only toggle ใน prototype; spec ถือเป็น action จริงตาม 11" — 11 §9+D4 เขียนตรง: prototype cosmetic / contract = `setFollowing` จริง ✓ |
| 02 L211 save semantics | `กดครั้งแรกตั้ง saved แล้วเปิด sheet; Saved ซ้ำ=unsave; assign col` — 11 §12 ตรงทุกข้อ + เติม `Removed from {col}` re-pick branch ✓ |
| AC refs นอก 11 | **0 live refs** — `AC-SOCIAL-*` ไม่มีเอกสารอื่นอ้าง (grep ทั้ง FrontOffice/) → renumber 001–018 ปลอดภัย ✓ |
| Emoji-row dead-code suspicion | **resolved: NOT dead** — handler ~22992 push comment จริง (id `c-own-{ts}`); เดิมสงสัยเพราะ `.emoji-row` อยู่ gate list ก่อน handler block — ยืนยัน handler อยู่ global click chain ใช้งานได้; spec §10 เขียนเป็น "emoji quick-react = วิธีเดียวที่เพิ่ม comment ใน V1" ✓ |
| Stale terms ใน synced docs อื่น (flag ไม่แก้) | `Notification Center`: `02_FEED L662` ("Share/Save/NI/Mute/Archive/Pin ไม่สร้าง Notification Center item"), `13_SETTINGS L539` (notif toggle clause), `07_CHAT L472` (intentional negative ref — ปล่อย), `00_NAV L249`/`00_GLOBAL L207/211` (rename-trace จงใต — ปล่อย) → flag FSP-026 sweep ✓ |
| Stale terms ใน not-yet-synced modules (flag) | `12_BOARD` L121/266/285/308/344/526/542/562/610, `15_TRUST_SAFETY` L114/270, `16_INTEGRATIONS` L69–70, `DEV_*`/QA/legacy docs ตาม FSP-021 evidence — defer ตาม task ของเอกสารนั้น (FSP-023/025–028) ✓ |
| `data-bd*` boundary | board article like/save/share/report = article objects + toasts เฉพาะ (`Saved to favorites`/`Report submitted…`) — §19 D11 defer canonical 12 ✓ |
| Comment long-press owner diff | committed `1540195` — เอกสารนี้ spec ตามพฤติกรรมนั้น (450ms/8px/popover); **ไม่แตะ prototype** ✓ |

## 3. Verification

| Check | Result |
| --- | --- |
| ไฟล์ที่แก้ | `FrontOffice/11_SOCIAL_MODULE.md` (rewrite ทั้งไฟล์ ~614 บรรทัด) + `FrontOffice/README_MODULE_INDEX.md` (1 line) + evidence file นี้ ✓ |
| `git status --porcelain -- Prototypes/` | **ว่าง** — Prototypes/ ไม่ถูกแตะ (owner's long-press commit `1540195` อยู่ใน HEAD แล้ว) ✓ |
| Like | `p.liked` toggle + `p.likes ±1` + `.lk-n` sync เฉพาะโพสต์ตัวเอง + `liked-by` strip ตาม `hideCounts\|likes\|likedBy` — ตรง ~23111/~14866/~14002 ✓ |
| Comments | sheet `commentsHTML` (+`nt`), generated comments, emoji-react add, cosmetic `c-like`, long-press popover, delete cascade + copies — ตรง ~13802–13951/~22913–22992 ✓ |
| Share | `.sh-q` live filter + `sh-fr`/`sh-app` toasts — ตรง ~14021/~20418/~22424–22445 ✓ |
| Save | auto-save → `sv` sheet; `sv-pick` 3-branch; hub tabs/search/`svd-col`/`savedcol` CRUD/manage/move/unsave dialogs — ตรง ~22867–22912/~22392–22660/~15345–15500 ✓ |
| Wish List | `wl-btn` detail-only → `wl` sheet; `wl-pick` 3-branch; `wishlist`/`wishcol` hubs — ตรง ~22814–22858/~15539–15790 ✓ |
| Follow | `.follow-btn` instant/uf-confirm; `setFollowing` all-seller-posts + clear fav/mute; `pfSetFollow`/`PF_EXTRA_FOL` (06) — ตรง ~22236–22274/~14472 ✓ |
| Fav/Mute/NI | `pm-fav` conditional; `muteDlgHTML`; ni-card→uncomf-card→`m-restore` — ตรง ~14255/~14324–14350/~20968–21000 ✓ |
| Report/Block | entries → `report*` routes; reasons 9; `report:done` Other steps; blkSheet/unblock/`pfRestrictHint` — ตรง ~17873–17933/~21951–22029 ✓ |
| Guest gate | selectors ตาม `GUEST_GATE_SEL` จริง (รวม in-handler `c-pop-item` gate); not-gated = `.comment-btn`/`.liked-by`/hub entries — ตรง ~23486+/~22913 ✓ |
| Session | `POST_FLAG_KEYS` snapshot/restore + clear guest/new; counts+`savedCol`/`savedAt`/`colAt` ไม่ reset (D7) — ตรง ~23421–23482 ✓ |
| ACs ใหม่ | AC-SOCIAL-001–018 ทุกข้ออ้างพฤติกรรมจริง (`.like-btn`/`lk-n`/`liked-by`/`commentsHTML`/`emoji-row`/popover/`dlg-delcomment-go`/`obGate`/`sh-fr`/`sh-app`/`sv-pick`/`svd-*`/`wl-btn`/`wl-pick`/`setFollowing`/`uf-confirm`/`pm-fav`/`muteDlgHTML`/`m-restore`/`report:*`/`blkSheetHTML`/`pfSetBlocked`/`pfRestrictHint`/`GUEST_GATE_SEL`/`POST_FLAG_KEYS`) ✓ |

## 4. Deviations flagged (spec เลือก prototype — documented, not spec)

| Deviation | Note |
| --- | --- |
| Like↔Favorites แยกระบบ | `liked` per-post + `favorite` per-seller feed tab — spec เดิม "like→Favorites" ผิด; liked posts ไป `interested` settings list (canonical 13 L515) |
| Comment composer dead | `.comment-input` div + `.c-meta` Reply ไม่มี handler — เขียน comment ได้แค่ `.emoji-row` quick-react; contract composer = future |
| Comment entry ทุก surface | `comment-btn` เปิด sheet ตรงจาก card ไม่บังคับผ่าน detail — spec เดิม detail-only ผิด (02/03 lock ตาม prototype อยู่แล้ว) |
| `lk-follow` cosmetic | flip label เท่านั้นไม่ `setFollowing` — contract: real follow (02 L569 ล็อก wording เดียวกัน) |
| `pv-add` vs `noComments` | bar ยังเปิด sheet ได้แม้ปิด comment — canonical 03 quirk |
| Session-flag gap | `savedCol`/`savedAt`/`colAt`/`likes`/`views`/`comments` ไม่อยู่ `POST_FLAG_KEYS` — collection assignment ค้างข้าม session (cosmetic; `colPosts` filter `saved` ก่อน) |
| `COLLECTIONS` seed ชื่อ `"Wishlist"` | ชนกับ Wish List pseudo-collection แต่คนละระบบ |
| Report `report`/`report:comment` ไม่มี back | X only — ตาม prototype |
| `m-unsave` ไม่ confirm | settings list unsave ทันที |
| 15_TRUST_SAFETY ยังไม่ sync | report entries/flow ใน spec นี้อ้างตาม prototype; taxonomy/SLA/moderation เดิมอยู่ 15 — flag FSP-023+ |
| `comments` synthetic generation | `commentsFor` สร้าง mock comments เมื่อ `p.comments>0` ไม่มี seed — demo-only (production = API) |
| Saved/Wish List EN+TH mixed | hub copies สองภาษาตาม `state.lang` บางจุด EN-only (collection toasts, menu labels `Add to collection`/`Edit collection`) — language sweep FSP-026 |

## 5. Flags ส่งต่อ (ไม่แก้นอก scope)

- **FSP-023 (12_BOARD)** — `data-bd*` article actions canonical + stale `Global Login Required`/`Notification Center` ใน 12 (L121/266/285/308/344/526/542/562/610); board share ใช้ `shareSheetHTML` ร่วม (entry boundary ระบุไว้ §11)
- **FSP-023+/15_TRUST_SAFETY** — sync report flow internals: `report`/`report:pick:`/`report:posts:`/`report:user`/`report:post`/`report:comment`/`report:done:` routes, 9 `PM_REASONS`, anonymous copy, Other steps (block/unfollow/mute), `Report submitted · thanks for letting us know`; ปัจจุบัน 15 ยัง legacy (Report Asset bottom sheet/24h SLA forms)
- **FSP-026 sweep** — `Notification Center` leftovers ใน synced docs: `02_FEED L662`, `13_SETTINGS L539`; + social language: collection toasts/menu labels EN-only, `Send to`/`Shared to`/`Link copied`, `Select all`/`Deselect all`, `Add N posts`, report pages mixed
- **FSP-030 consistency sweep** — `lk-follow` cosmetic→real; comment composer dead (`Reply`+input) vs contract; `savedCol`/`savedAt`/`colAt`+counts ไม่ reset session; `m-unsave` no-confirm vs destructive pattern; `COLLECTIONS` seed `"Wishlist"` naming collision; `pm-fav` conditional (`following||favorite`) vs favorites-settings add-any
- **Prototype drift note** — anchors เป็น line ปัจจุบัน @ `02de990`; owner commit `1540195` (comment long-press) เข้า HEAD แล้ว — task ถัดไป verify ด้วย function-name
- งานทั้งหมดยัง uncommitted รวม FSP-006–021 — รอพี่สั่ง commit แยก
