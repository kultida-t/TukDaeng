# 02 Feed Module

อ้างอิงหลักจาก [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md) + baseline [00_GLOBAL_RULES_MODULE.md](00_GLOBAL_RULES_MODULE.md) §7/§9–§12 + [00_NAVIGATION_AND_CROSS_MODULE_FLOW.md](00_NAVIGATION_AND_CROSS_MODULE_FLOW.md) §6–§9 — prototype `Prototypes/fo-flow/index.html` เป็น source of truth เดียวของพฤติกรรม (FO-PRD-v1.9)

---

# 1. Document Information

| Field | Detail |
| --- | --- |
| Module Name | Feed |
| Platform | Mobile Application |
| Version | V1 |
| Status | Draft |
| Owner | Product / UX / Engineering |
| Document Type | Functional PRD - Master Aligned |

# 2. Objective

Feed Module เป็น social post feed หลักของ TukDaeng (post-centric — S-09) — แสดงโพสต์ทุกประเภทที่เข้าเงื่อนไข: โพสต์ลงขาย (มีราคา + spec), โพสต์โชว์ของ และโพสต์ธรรมดาที่ไม่ผูก asset ไม่ใช่ marketplace list เฉพาะ asset `Sale`

เป้าหมายหลักคือให้ผู้ใช้ค้นพบโพสต์จากทั้งระบบและจากบัญชีที่ติดตาม/อยู่ในรายการโปรด, โต้ตอบกับโพสต์ (like, comment surface, share, save, ask seller), เข้า Post Detail และ Public Profile จาก card, จัดการโพสต์ของตัวเอง (archive, commenting, edit, mark as sold, pin, delete) และปรับ feed ที่เห็นผ่าน not-interested feedback loop ตามสิทธิ์ของ session

# 3. Prototype Reference

Source of truth: `Prototypes/fo-flow/index.html` (read-only — ห้ามแก้)

- `POSTS` seed + post fields (~12751–13100): `type:"sale"/"showcase"`, `pfkind` (drawer link), `photos`/`clips`, `price`/`specGroups`/`chips`, `caption`/`captionFull`, `location`, `audience`, `noComments`, `hideCounts`, `ni`/`muted`/`blocked`/`archived`/`pins`, `likedBy`/`commentPreview`
- `postCard()` (~14008–14083) + `feedContentHTML()`/`feedEmptyHTML()`/`setFeedTab()` (~14085–14109) — variant `a1` เท่านั้นที่ใช้งาน
- Feed shell + segmented tabs (~19345–19366); active state `state = { variant:"a1", ft:"segment", ask:"outline", dl:"dl1", dh:"dh1", ds:"full", pr:"pr1", tg:"tg1", tStyle:"t3", dStyle:"d2", nav:"labeled", feedTab:"all" }` (~13270)
- Post menus: `pmMenuHTML()` others (~13897–13915), `pmOwnMenuHTML()` own (~13920–13935), openers `isOwnPost()` (~20465–20478)
- Feedback cards: `niCardHTML()` (~13966–13981), `uncomfCardHTML()` (~13984–13995), `muteDlgHTML()` (~14712–14718)
- Own-post handlers: archive / noComments / edit / sold / soldview / pin / del (~20480–20527), `dlg-delpost-go` (~20730–20744), `dlg-pin-go` (~20646–20657), `applyPin`/`pinnedIn`/`PIN_MAX`/`pinFeedback` (~16604–16634)
- Others-menu handlers: `pm-fav` / `pm-ni` / `pm-undo` / `pm-go-report` / `ni-mute` / `ni-pref` / `ni-uncomf` / `ni-unfollow` / `uc-report` / `uc-undo` / `dlg-mute-go` (~20528–20645, ~20676–20687)
- Relation helpers: `setFollowing`/`setMuted`/`setFavorite`/`followedSellers`/`mutedSellers`/`favoriteSellers` (~14111–14176), `pfSetMuted` (~16660–16664)
- Sheets: `commentsHTML` (~13595–13608), `likesSheetHTML` (~13644–13661), `shareSheetHTML` (~13663–13683), `saveSheetHTML`/`wlSheetHTML` (~13685–13735), unfollow sheet (~21859–21898)
- Card action handlers: photo tap carousel + `more-link`/`details-toggle`/`igd-tag`/like (~22553–22640), comment/save/share/wl/likes (~22015–22067, ~22437–22539), ask → `chatQuickAsk` (~18873–18892, ~19236–19241)
- Feed nav re-tap refresh (~21293–21300); `formatPostTime` (~13272–13282)
- Archive: `archivePosts()`/`archiveHTML()` (~14965–14982), tile → post viewer (~22253–22260), Settings entry row (~17167), `data-sub="archive"` route (~17505)
- Guest gate `GUEST_GATE_SEL` + `obGate` (~22997–23012); `state.feedTab` reset (~22976, ~23094)
- Create composer (sub page `create` — CREATE-001/FEED-024/PROFILE-017): `CP_ME`/`CP_ROLL`/`CP_CLIPS`/`CP_MEDIA` (~15530–15585), `cpState`/`cfMedia`/`cfActiveClip`/`cfPlayClip`/clip playback helpers (~15586–15642), feed clip autoplay `feedClipTick` (~15643–15671)
- Composer constants: `CF_TAGS`/`CF_LOCS`/`CF_LOC_KM`/`CF_CONDS`/`CF_BOXES`/`CF_SPECS` (~15672–15695), `CF_MAX_MEDIA` = 10 (~15993)
- Composer UI: `cfPaneHTML` option panes loc/price/spec/cost/cond/more (~15696–15741), `cfVal` row summaries (~15742–15751), `cfZoomGo` media zoom (~15752–15777), `cfPickerHTML` step 1 (~15778–15809), `cfStep2HTML` step 2 (~15810–15878), `createHTML` (~15879–15882)
- Publish/edit helpers: `cfFieldsFromMeta` (~15885–15912), `cfToPortfolio` (~15915–15926), `assetFromPost`/`soldFromPost` (~15929–15958), `insertNewPost` (~15959–15990), `metaFromPost` (~15995–16006), `openPostEdit`/`closePostEdit`/`applyPostEdit` (~16007–16108)
- Create entries: feed header `+` `data-flow="create"` (~19358), own profile `+` + empty-state CTA `data-mode="asset"` (~16826, ~16852), `[data-flow]` dispatcher (~20158–20164); guest gate — `[data-flow]` ∈ `GUEST_GATE_SEL` (~22999)
- Composer handlers: discard/next/back/cells/remove/zoom/panes/toggles/share (~20155–20463), `dlg-discard-go` (~20660–20675), `pm-own-edit` → `openPostEdit` (~20499–20500)
- `PF_MINE` drawer-only post store (~16574–16577); `pfKind`/`PFO_STATUS` (~16380, ~16604); `refreshPostViews` (~13938–13964)
- Dead variants/artifacts (ห้ามเขียนเป็น feature — ตาม 00_NAV §6.4): card `a2/b2/c2/a3/b3/c3/mixed`, `ft:"none"` brand-menu dropdown, `chat-fab`/`chatPopHTML` (`ask:"bubble"` unreachable), `POST_DETAIL_CFG`, `lk-follow` visual-only toggle; composer dead affordances: camera tile, `Recents` dropdown, expand icon → toast `Not in this prototype yet`

# 4. Master Alignment Summary

| Area | Master Baseline |
| --- | --- |
| Feed model | Post-centric social feed — โพสต์ `Sale` + โพสต์ `post` (ไม่ผูก asset); ไม่ใช่ marketplace Sale-only list (S-09, 00_GLOBAL §9/§10) |
| Feed eligibility | ไม่แสดงโพสต์ที่ viewer ติด exclusion: not-interested / muted / blocked / archived; โพสต์ที่ผูก asset สถานะ `Show`/`Hide`/`Sold` หลุดจาก feed |
| Tabs | `ทั้งหมด` (All Posts) / `กำลังติดตาม` (Following) / `รายการโปรด` (Favorites) — segmented control ใต้ app header |
| Favorites meaning | Favorite = account-level (favorite sellers) — **ไม่ใช่** liked posts; liked posts อยู่ Settings > Content preferences > Interested (D7) |
| Guest | ดู feed + กดทุก tab ได้ (ไม่ gate — S-16); action ที่ต้องมีตัวตน → Member Sheet `Join TukDaeng` |
| Card navigation | media tap = in-card carousel เท่านั้น; Post Detail เปิดผ่าน `Tap for details` → `View full detail`; owner area → Public Profile (00_NAV §7) |
| Comment | shared bottom sheet เปิดได้จาก feed card โดยตรง — ไม่บังคับผ่าน detail (D8) |
| Create entry | Feed header `+` = post composer; own profile `+`/empty-state CTA = asset composer — guest gated ทั้งคู่ (Member Sheet) |
| Publish | `insertNewPost` แทรกโพสต์ใหม่บนสุดของ feed — `pfkind:"post"` (feed-only) หรือ `sale` เมื่อ drawer opt-in / Post-to-feed |
| Edit info | Own-post menu `Edit` = composer เดียวกัน prefilled — แก้ media/caption/fields + drawer link + profile status |
| Own-post lifecycle | Archive / Turn off commenting / Edit / Mark as sold / Pin to grid / Delete (+ View sale record สำหรับ sold) |
| Others-post menu | Favorites (conditional) / Not interested / Report — ไม่มี Share/Block/Hide ในเมนู (Share เป็น action button, Block อยู่ใน report flow + profile) |
| Report | Full-page multi-step report stack ตาม Trust & Safety — entry จาก post menu (D9) |
| Performance | Feed โหลดเร็ว, รูป lazy load, render ทั้ง list ครั้งเดียว — ไม่มี infinite scroll / pull-to-refresh ใน V1 |
| Error / Offline | network/image/owner-fallback states = contract (S-29 — prototype ไม่ครอบ feed error path) |

# 5. Scope

## In Scope

- Feed tabs `All Posts` / `Following` / `Favorites` + semantics + snooze interaction + guest behavior
- Feed post card structure (variant `a1` — flat IG card) + in-card interactions
- Feed card actions: like, comment sheet, views, share sheet, save sheet, Ask Seller, Follow/Unfollow, liked-by → Likes sheet, caption expand, `Tap for details` expander → Post Detail, hashtag → Search
- Tap-to-refresh: กด bottom-nav Feed ซ้ำตอนอยู่ feed = re-render + scroll to top
- Own-post `...` menu: Archive/Unarchive, Turn off/on commenting, Edit (→ Edit info composer), Mark as sold → Sale Record form, View sale record (sold), Pin/Unpin to grid (per profile tab, max 3), Delete (confirm, permanent)
- Others-post `...` menu: Add/Remove from favorites (conditional), Not interested, Report
- Not-interested feedback loop: ni-card (feedback + Undo + Mute/Unfollow/Manage content preferences) + uncomfortable card (Report/Undo) + restore ผ่าน Settings > Content preferences > Not interested
- Archive surface: Settings > Your library > Archive — archived grid + archive post viewer
- Feed empty states ต่อ tab
- Guest gate behavior ของ feed actions (Member Sheet `Join TukDaeng`)
- Create composer (sub page `create`): entries (`+` feed header → post mode; own profile `+`/CTA → asset mode), 2-step flow (media picker → caption/details), option panes, discard dialog
- Composer media model: photo/clip (video) ใน Recents roll เดียวกัน, single/multi-select ≤10, zoom preview, clip playback + feed clip autoplay semantics
- Composer fields: caption + hashtag chips, location, price (sale vs showcase), watch details (free-text specs + description), condition + box & papers, cost details (private), more options (commenting + audience), `Also save to My Assets` toggle, asset-mode visibility pick
- Publish: `insertNewPost` post fields/toasts/scroll-top/Watch-Alert match toast; asset mode → `cfToPortfolio` drawer record + visibility outcomes (drawer-only vs post-to-feed)
- Edit info mode: own-post `Edit` → prefilled composer (`openPostEdit`), add/remove media, Done → `applyPostEdit` (fields + `pfkind` + drawer link sync) + surface restore
- Contract-only: feed network states, image-level failure states, owner fallback states, analytics, performance targets (S-29)

## Out Of Scope (module อื่นเป็นเจ้าของ)

- Search/explore/filter/post viewer — [03_SEARCH_FILTER_MODULE.md](03_SEARCH_FILTER_MODULE.md) (FSP-016)
- Post Detail internals (specs, descriptions, `mf-btn`, `wl-btn`) — [05_ASSET_DETAIL_MODULE.md](05_ASSET_DETAIL_MODULE.md) (FSP-018)
- Report flow internals (reason pages, `report:done` other steps, block/unblock) — [15_TRUST_SAFETY_MODULE.md](15_TRUST_SAFETY_MODULE.md) (entry point เท่านั้นที่อยู่ที่นี่)
- Likes sheet internals, follow/unfollow semantics, social graph, Saved/Wishlist hub + collections management — [11_SOCIAL_MODULE.md](11_SOCIAL_MODULE.md) (FSP-022)
- Chat room + quick-ask flow internals — [07_CHAT_MODULE.md](07_CHAT_MODULE.md) (FSP-020)
- Sale Record form + Sold history + portfolio drawer record/tab internals — [14_PORTFOLIO_MODULE.md](14_PORTFOLIO_MODULE.md) (FSP-024) / [04_ASSET_MANAGEMENT_MODULE.md](04_ASSET_MANAGEMENT_MODULE.md) (FSP-017); composer ระบุเฉพาะ interface ที่สร้าง/แก้/ตัด link drawer record (`cfToPortfolio`, `assetId`, `pfkind`)
- Watch Alert sheet — [10_WATCH_ALERT_MODULE.md](10_WATCH_ALERT_MODULE.md) (FSP-021)
- Content preferences pages internals (`prefs`/`sensitive`/`interested`/`ni`/`favorites`/`muted`/`blocked`) — [13_SETTINGS_MODULE.md](13_SETTINGS_MODULE.md) (FSP-014 — feed spec ระบุแค่ผลกระทบต่อ feed)
- Infinite scroll / pull-to-refresh / end-of-list marker — prototype ไม่มีใน V1
- Full Screen Image Viewer — ไม่มีใน V1 (feed media tap = carousel เท่านั้น, AC-NAV-003)
- Real-time feed refresh จากอุปกรณ์/actor อื่น

# 6. Screen Mapping

| Screen / State | Prototype | Description |
| --- | --- | --- |
| Feed — All Posts | `.feed-scroll` + `feedTab:"all"` | โพสต์ที่เข้าเงื่อนไขทั้งหมด (snooze on → เฉพาะ following) |
| Feed — Following | `feedTab:"following"` | โพสต์ของบัญชีที่กำลัง follow |
| Feed — Favorites | `feedTab:"favorites"` | โพสต์ของบัญชีที่อยู่ใน favorites (account-level) |
| Feed tabs | `.feed-tabs` / `.feed-tab` | segmented control ใต้ app header (variant `ft:"segment"`) |
| Post card | `postCard()` variant `a1` | flat IG card — head/photo/actions/liked-by/caption/time/details |
| ni-card | `niCardHTML()` | feedback card แทนโพสต์หลังกด Not interested |
| uncomfortable card | `uncomfCardHTML()` | card หลังกด "This post made me uncomfortable" |
| Feed empty — Following | `feedEmptyHTML("following")` | users icon + `Follow others to see their posts here` |
| Feed empty — Favorites | `feedEmptyHTML("favorites")` | star icon + `No favorites yet` |
| Others-post menu | `pmMenuHTML()` | bottom sheet: Favorites (conditional) / Not interested / Report |
| Others-post menu (Posts viewer) | `pmMenuHTML(reportOnly)` | bottom sheet เหลือ Report เดียวบน `pfp-post` |
| Own-post menu | `pmOwnMenuHTML()` | bottom sheet: Archive / Commenting / Edit or View sale record / Mark as sold / Pin / Delete |
| Unfollow sheet | `.uf` sheet | `Unfollow @{seller}?` + Unfollow/Cancel |
| Mute dialog | `muteDlgHTML()` | `Mute {seller}?` + Mute posts/Cancel |
| Pin limit dialog | `dlg-pin-go` | `Pin limit reached` + Confirm/Cancel |
| Delete post dialog | `dlg-delpost-go` | `Delete post?` + Delete/Cancel |
| Comment sheet | `commentsHTML()` | shared sheet — view-only composer (contract) |
| Likes sheet | `likesSheetHTML()` | liker list + Follow + private-count note |
| Share sheet | `shareSheetHTML()` | friend grid + app row (mock — contract deep link) |
| Save sheet | `saveSheetHTML()` | Saved + Collections + New collection |
| Archive page | `archive` route | archived post grid — owner-only surface |
| Archive post viewer | Post Viewer `feed` mode | tile → viewer (title `Archive`) |
| Create composer — step 1 picker | `create` sub page · `cfPickerHTML()` | hero preview + Recents grid (photos + clips) + `Select` multi-mode + `Next` |
| Create composer — step 2 | `cfStep2HTML()` | media strip + caption + hashtag chips + option rows + `Share`/`Add Asset` |
| Composer option panes | `cfPaneHTML()` — `loc`/`price`/`spec`/`cost`/`cond`/`more` | slide-in pane เหนือ step 2 (Done/back ปิดกลับ) |
| Composer media zoom | `.ig-zoom` | full preview จาก thumb — clip = playable + countdown |
| Discard dialog | `dlg-discard-go` | create `เริ่มใหม่ใช่ไหม` / edit `ทิ้งการแก้ไข?` |
| Edit info mode | `openPostEdit()` · `V.editPid` | composer เดียวกัน prefilled — Cancel/Done แทน Share |
| Member Sheet | `obGate()` | guest gate `Join TukDaeng` (00_GLOBAL §11) |

# 7. User States

## Guest

Guest ทำได้โดยไม่ gate:

- ดู Feed และกดทุก feed tab (`All`/`Following`/`Favorites`) — เห็น empty state เพราะไม่มี relation (S-16)
- เลื่อนดู post cards, swipe carousel, กด `more` ขยาย caption, กด `Tap for details` ขยาย details + `View full detail` เข้า Post Detail
- เปิด Public Profile, เปิด comment sheet เพื่อดู comments, เปิด likes sheet เพื่อดู liker list
- กด Feed nav ซ้ำเพื่อ refresh
- กด hashtag ใน caption เข้า Search

Guest กดแล้วเจอ Member Sheet `Join TukDaeng` (gate — `GUEST_GATE_SEL`):

- Like, Save, Share, Wishlist, Follow, Ask Seller
- `+` create (feed header) / `+` บน profile (`[data-flow]` ทุกจุด) — guest เปิด composer ไม่ได้เลย
- `...` post menu (`.post-head .more` / `.pm-btn`) ทุกเมนูย่อย
- Comment input / emoji row / comment like / liker-row Follow
- Not-interested / Report / Mute / Unfollow ทุกจุด

## Member

Member ใช้ feed ครบตาม visibility rule: like/unlike, save + collections, share, comment surface, ask seller, follow/unfollow (unfollow ผ่าน confirm sheet บน card), add/remove favorites, not-interested feedback loop, report, archive/pin/delete โพสต์ตัวเอง

Member สร้างโพสต์ผ่าน composer ได้ 2 mode: post mode (`+` feed header) และ asset mode (`+`/CTA บน own profile) — รายละเอียด §8 Create Flows + §9 Composer Rules

## Owner (โพสต์ตัวเอง)

- Card ของโพสต์ตัวเองไม่แสดง Follow button และไม่แสดง Ask Seller pill (กดได้เฉพาะบนโพสต์คนอื่น — own ได้ `This is your own listing`)
- `...` menu เปิด own-post menu (แยกจาก others menu โดย `isOwnPost()` = seller คือ current user)
- `Edit` เปิด Edit info composer ของโพสต์ตัวเอง — แก้ media/caption/fields + drawer link + profile status (ไม่มีบนโพสต์ `sold`)
- เห็น like count ตัวเลขบน own-post surfaces (like count เป็น private — S-26: คนอื่นเห็น `Liked by {name} and others` ไม่มีตัวเลข)
- `Following`/`Favorites` tab นับโพสต์ตัวเองตาม relation flag ที่ตั้งไว้ (composer เซ็ต `following:true` ให้โพสต์ตัวเอง)

## Blocked Relationship

- โพสต์ของบัญชีที่ block กัน (ทั้งสองทิศ) ไม่แสดงใน feed (`p.blocked` filter)
- Muted seller: โพสต์ทั้งหมดของ seller นั้นหายจาก feed ทุก tab (`p.muted`)
- Not-interested: โพสต์นั้นหายจาก feed หลัง render ใหม่ (`p.ni` — ระหว่าง session เดียวกัน card ถูกแทนด้วย ni-card ก่อน)

# 8. User Flow

## Open Feed

1. User เปิดแอปหรือกลับ feed shell → feed อยู่ใต้ทุก layer เสมอ (00_NAV §6.2)
2. Feed tab default = `All Posts` (`state.feedTab:"all"` — ไม่ persist; session change/sign-out reset เป็น `all`; session `new` บังคับ `All` ตาม 00_GLOBAL §7)
3. ระบบแสดงโพสต์ทั้ง list ครั้งเดียวตาม eligibility rule §9 — ไม่มี pagination/load-more

## Switch Feed Tab

1. User กด `ทั้งหมด` / `กำลังติดตาม` / `รายการโปรด` บน segmented control
2. ระบบ re-render list ตาม rule ของ tab + scroll กลับบนสุด
3. Guest กดได้ทุก tab (ไม่ gate) — Following/Favorites เห็น empty state

## Tap-to-Refresh

1. User กด bottom-nav `Feed` ขณะอยู่ feed อยู่แล้ว (ไม่มี sub page เปิด)
2. ระบบ re-render feed list + smooth scroll to top (IG behavior — AC-NAV-018)
3. ไม่มี pull-to-refresh gesture ใน V1

## Card Photo Interaction

1. User แตะครึ่งซ้าย/ขวาของรูป หรือ swipe → carousel เปลี่ยนรูปแบบวนวน (wrap around) — counter `1/N` + dots sync
2. แตะรูปไม่เปิด detail/viewer/zoom — ไม่มี Full Screen Image Viewer
3. `View full detail` ใน details-body หรือ tile บน surface อื่นเท่านั้นที่พาไป Post Detail / Post Viewer

## Card Social Actions

1. **Like** — toggle `liked` + นับ ±1; ปุ่ม sync ทุก surface ของโพสต์เดียวกัน; guest → Member Sheet; like ไม่ส่งเข้า Favorites (Favorites = account-level — D7); liked posts ไป Settings > Content preferences > Interested
2. **Comment** — เปิด shared comment sheet (`ความคิดเห็น` + rows + emoji row + `Add a comment...` input) — input/emoji/reply เป็น composer contract (view-only ใน prototype); `noComments` post ไม่มีปุ่ม+count; guest เปิด sheet ดูได้แต่ input gated
3. **Views** — read-only stat (eye icon + count); ซ่อนเมื่อ `hideCounts` หรือ views = 0
4. **Share** — share sheet (friend grid + app row Messenger/Direct/LINE/Facebook/Copy link) → toast `Sent to {name}`/`Shared to {app}`/`Link copied`; guest → Member Sheet (S-03: share gated ทุก surface); deep link = contract (D16)
5. **Save** — save sheet (row `Saved` + Collections list + `New collection`) — กดครั้งแรกตั้ง `saved` แล้วเปิด sheet; เลือก row = assign collection (`Saved` default); เลือก `Saved` ซ้ำ = unsave → toast `Removed from your saved`; hub อยู่ 11_SOCIAL
6. **Ask Seller** — เปิด chat room แบบ item-scoped (post นั้นเป็น context); own post → toast `This is your own listing`; blocked seller → toast `Cannot message a blocked account`; guest → Member Sheet; รายละเอียด 07_CHAT
7. **Liked-by row** — เปิด Likes sheet (`Likes` + liker rows + Follow buttons + note `Only {seller} can see the total number of likes on this post.` — note แสดงเฉพาะโพสต์คนอื่น); guest เปิดดูได้ แต่ Follow gated
8. **Follow (card)** — แสดงเฉพาะโพสต์ที่ยังไม่ follow; กด = follow ทันที (ทุกโพสต์ของ seller เดียวกัน sync); ถ้า following อยู่แล้วกดจากจุดอื่น (เช่น pfp head) ได้ unfollow sheet `Unfollow @{seller}?`; unfollow เคลียร์ favorite + mute ของ seller นั้นด้วย
9. **Caption** — `more` ขยายเต็ม inline; แตะ caption ที่ขยายแล้วพับกลับ (+ ปิด details-toggle ที่เปิดค้าง); hashtag `#tag` → Search results ของ tag นั้น
10. **`Tap for details`** — ขยาย `details-body` inline (price row + spec groups + `View full detail` → Post Detail); เปิดได้ทีละ card เดียว (เปิดใหม่ปิดเก่า); label สลับ `Tap for details`/`Hide details`; แสดงเฉพาะโพสต์ที่มี price หรือ spec

## Others-Post Menu (`...`)

เมนูจาก `.post-head .more` / `.pm-btn` บนโพสต์คนอื่น (guest → Member Sheet):

| Row | เงื่อนไขแสดง | Result |
| --- | --- | --- |
| `Add to favorites` / `Remove from favorites` | แสดงเฉพาะเมื่อ following หรือเป็น favorite อยู่แล้ว | toggle favorite (account-level — ทุกโพสต์ของ seller) + toast `Added to favorites` / `Removed from favorites` |
| `Not interested` | เสมอ | เปลี่ยน card เป็น ni-card (ดูด้านล่าง) |
| `Report` (danger) | เสมอ | เปิด report stack — รายละเอียด 15_TRUST_SAFETY |

บน Posts viewer (`pfp-post`) เมนูโพสต์คนอื่นเหลือเฉพาะ `Report` (report-only variant)

## Not-Interested Feedback Loop

1. Member เลือก `Not interested` → card เปลี่ยนเป็น **ni-card** แทนโพสต์:
   - `Thanks for your feedback` + ปุ่ม `Undo` + sub `We'll suggest fewer posts like this.`
   - ถ้า following seller: `Mute {seller}` (desc `Stop seeing new posts from them in feed`) + `Unfollow {seller}`
   - ถ้าไม่ follow: `Manage content preferences` → `prefs` page (13_SETTINGS)
   - `This post made me uncomfortable` → **uncomfortable card** (check icon + `Thanks for letting us know` + `If you think this post goes against our Community Standards you can report it.` + `Report` → report stack + `Undo`)
2. `Undo` (ทั้ง ni-card และ uncomfortable card) → คืน card ปกติ + เคลียร์ not-interested flag
3. หลัง re-render (switch tab / refresh) โพสต์ ni หายจาก feed — restore ระยะยาวผ่าน Settings > Content preferences > Not interested (`Restore` รายตัว หรือ `Reset suggested content` ล้างทั้งหมด — 13_SETTINGS)
4. `Mute {seller}` → mute dialog (`Mute {seller}?` / `You can unmute them anytime from their profile. We won't let them know you muted them.` / `Mute posts` / `Cancel`) → โพสต์ seller ทั้งหมดหายจาก feed + toast `Muted`; unmute ผ่าน Settings > Muted accounts หรือ profile
5. `Unfollow {seller}` จาก ni-card → unfollow ทันที (ไม่มี confirm sheet — surface นี้ instant ตาม D21) + card หาย + toast `Unfollowed`

## Own-Post Menu (`...`)

เมนูจาก `.post-head .more` / `.pm-btn` บนโพสต์ตัวเอง ทุก surface (feed / viewer / detail / profile):

| Row | เงื่อนไขแสดง | Result |
| --- | --- | --- |
| `Archive` / `Unarchive` | เสมอ | toggle archived — ดู Archive Rule §9 |
| `Turn off commenting` / `Turn on commenting` | เสมอ | toggle `noComments` — ซ่อน/แสดง comment button+count ทุก surface + toast `Commenting turned off`/`Commenting turned on` |
| `Edit` | โพสต์ที่ไม่ใช่ sold | เปิด Edit info composer prefilled — ดู Edit Info Flow/Rule |
| `View sale record` | เฉพาะ `pfkind:"sold"` (แทน Edit) | เปิด `sold:{id}` sold record page (14_PORTFOLIO) |
| `Mark as sold` | `pfkind` ∈ `sale`/`show`/`hide` | materialize asset ถ้ายังไม่ผูก แล้วเปิด `sell:{id}` Sale Record form (14_PORTFOLIO); สำเร็จ → `pfkind:"sold"` หลุด feed |
| `Pin to top of grid` / `Unpin from grid` | เสมอ (context = profile tab ที่เปิดอยู่ หรือ `all` จาก feed) | toggle pin — ดู Pin Rule §9 |
| `Delete` (danger) | เสมอ | confirm dialog แล้วลบถาวร — ดู Delete Rule §9 |

## Archive Flow

1. Owner เลือก `Archive` จาก own-post menu → โพสต์หลุด feed + profile grid ทันที, pins ทั้งหมดถูกล้าง, toast `Post archived`
2. `Unarchive` → โพสต์กลับเข้า feed/grid ตาม eligibility เดิม, toast `Post unarchived` (pin ไม่กลับ)
3. Archive page: Settings > Your library > row `คลังข้อมูลที่เก็บถาวร` / `Archive` (route `archive`, แสดง count บน row) — head back + title `คลังเก็บ` / `Archive` + note `คุณเท่านั้นที่สามารถดูโพสต์ที่คุณจัดเก็บไว้` / `Only you can see posts you've archived` + photo grid เรียง archived ล่าสุดก่อน
4. Empty: `ไม่มีโพสต์ในคลังเก็บ` / `No archived posts` + `โพสต์ที่คุณจัดเก็บจะแสดงให้คุณเห็นเท่านั้น` / `Posts you archive will only be visible to you.`
5. แตะ tile → Post Viewer `feed` mode (title `Archive`) — member-only surface

## Pin Flow

1. Owner เลือก `Pin to top of grid` → โพสต์ถูก pin บน profile grid ของ tab context นั้น (pin แยกต่อ tab — pin จาก feed = tab `all`)
2. ถ้า pin ครบ 3 แล้ว (`PIN_MAX = 3` ต่อ tab) → dialog `Pin limit reached` / `Are you sure you want to pin this post? You can only pin up to three posts to your grid. Pinning this post will replace your oldest pinned post.` / `Confirm` / `Cancel` → Confirm แทนหมุดเก่าสุด
3. Feedback: pill `Pinning...`/`Unpinning...` แล้ว toast `Your post has been pinned`/`Your post has been unpinned`
4. Pinned posts เรียงก่อนโพสต์ปกติในทุก grid ของ tab นั้น — pin ใหม่สุดอยู่หน้าสุด; unpin กลับตำแหน่งเดิมตาม natural order
5. Archive ล้าง pin ทุก tab ของโพสต์นั้น

## Delete Post Flow

1. Owner เลือก `Delete` → dialog `Delete post?` / `This post will be permanently deleted.` / `Delete` (danger) / `Cancel`
2. Confirm → โพสต์หายจากทุก surface (feed, viewer, detail, profile grid, saved/wishlist tiles) + toast `Post deleted` — ไม่มี undo

## Create Post Flow (post mode)

1. Member กด `+` บน feed header → composer sub page `create` เปิด mode `post` (guest → Member Sheet) — head `×` + title `สร้างโพสต์ใหม่`/`New post` + `Next`
2. Step 1 picker: เลือก media จาก Recents grid (photos + clips ผสม) — single-select default; `เลือกหลายรายการ`/`Select` เปิด multi-pick เลขลำดับ (≤10); hero preview แสดง media ล่าสุดที่เลือก; camera tile / `Recents` dropdown / expand icon = dead → toast `Not in this prototype yet`
3. `Next` (active เมื่อมี ≥1 media) → step 2: media strip, caption, hashtag chips, option rows
4. (optional) กรอก fields ผ่าน option panes — location / price / watch details / condition / cost details (เฉพาะ drawer toggle ON) / more options (commenting + audience); toggle `Also save to My Assets` (default OFF)
5. `แชร์`/`Share` → `insertNewPost` แทรกโพสต์ใหม่บนสุด feed — ดู Publish Rule §9; composer ปิด, feed re-render + scroll to top + toast; โพสต์ตรง Watch Alert ON → toast `Watch alert matched` หน่วงตามหลัง
6. กด `×` กลางทาง → Discard Draft Rule (draft ว่างปิดเงียบ / มีของเจอ dialog)

## Create Asset Flow (asset mode)

1. Member กด `+` บน own profile หรือ `เพิ่มสินทรัพย์ใหม่`/`Add asset` บน profile empty state → composer เดียวกัน mode `asset` — title `เพิ่มสินทรัพย์ใหม่`/`Add Asset`, ปุ่มล่าง `Add Asset`
2. Flow เหมือน post mode — caption placeholder `เขียนคำอธิบายสินทรัพย์…`, `Cost details (private)` row แสดงเสมอ, และมี **Visibility pick** แทน drawer toggle: `โชว์`/`Show` (default) · `ซ่อน`/`Hide` · `โพสต์ลงฟีด`/`Post to feed`
3. `Add Asset` → สร้าง portfolio drawer record เสมอ (`cfToPortfolio` — Show/Hide = drawer-only post ไม่เข้า feed; Post to feed = feed post `pfkind:"sale"` + link) — ดู Asset Mode Rule §9
4. ปิดแล้วกลับ own profile grid (record ใหม่อยู่บนสุด) + toast ตาม visibility — ไม่กลับ feed

## Edit Info Flow

1. Owner เลือก `Edit` จาก own-post menu → `openPostEdit` — composer prefilled เปิดที่ step 2 โดยตรง, head `Cancel` + `แก้ไขข้อมูล`/`Edit info` + `Done` (ไม่มีปุ่ม Share)
2. Fields prefill จากโพสต์ตาม Edit Prefill Rule §9 — media strip มี `+` tile เพิ่มรูป/clip ได้ (รวม ≤10, ต้องเหลือ ≥1)
3. `Done` → `applyPostEdit` อัปเดต post + `pfkind` + drawer link ตาม Edit Apply Rule → toast `Post updated`, sync ทุก surface (`refreshPostViews`), คืน surface ที่เปิดมา (detail เปิดคืน / posts viewer คงอยู่ / profile / feed)
4. `Cancel` → discard dialog `ทิ้งการแก้ไข?` เสมอ (ไม่เช็ค dirty) — Discard ปิดโดยไม่แก้อะไร + คืน surface เดิม

## Discard Draft Flow (create)

1. กด `×` บน step 1: draft ว่าง (ไม่มี media + caption ว่าง) → ปิดเงียบ; draft มีของ → dialog: `เริ่มใหม่ใช่ไหม` / `หากคุณย้อนกลับตอนนี้ ฉบับร่างนี้จะไม่ได้รับการบันทึก` + `เริ่มใหม่` + `แก้ไขต่อไป` (EN: `If you go back now, your edits will be discarded.` / `Discard` / `Cancel`)
2. Discard → ล้าง draft + กลับ surface ต้นทาง (asset mode → own profile; post mode → feed); Cancel → กลับไปแก้ต่อ
3. Back บน step 2 (`cf-back2`) ไม่ใช่ discard — ย้อนกลับ step 1 โดย draft คงอยู่

# 9. Business Rules

## Post Model (feed-relevant fields)

| Field | ความหมาย |
| --- | --- |
| `type` | `sale` (มี price + specGroups) / `showcase` (ไม่มี price) — display hint |
| `pfkind` | portfolio drawer link: `post` (ไม่ผูก asset — composer/seeded plain post), `sale`, `show`, `hide`, `sold` (drawer statuses — 14_PORTFOLIO) |
| `photos` / `clips` | media slides — clips[i] = duration ของ video slide (clip badge + progress bar บนรูป) |
| `price` / `specGroups` / `chips` / `desc` | sale detail — render ใน details-body + Post Detail |
| `caption` / `captionFull` | short + full caption (hashtags render เป็น tag ที่กดได้) |
| `location` / `audience` / `noComments` | composer-set flags — location = sub-line ใต้ชื่อ; noComments = ซ่อน comment affordance; audience = เก็บค่าไม่ enforce (ดู Audience Rule) |
| `hideCounts` | seeded-post flag — ซ่อน liked-by + views ทุก surface; composer ไม่มี setter ใน V1 (deviation) |
| `liked` / `saved` / `savedCol` / `wishlisted` / `wlCol` | viewer-level flags (collections อยู่ 11_SOCIAL) |
| `ni` / `muted` / `blocked` / `archived` / `archivedAt` / `pins` | feed-exclusion / lifecycle flags |
| `likes` / `comments` / `views` / `likedBy` / `commentPreview` | social counters — like total เป็น private (S-26) |

## Feed Eligibility Rule

Feed แสดงโพสต์ที่ผ่านทุกเงื่อนไข:

- ไม่ติด viewer-level exclusion: `ni` (not interested), `muted` (seller muted), `blocked` (block relationship)
- ไม่ `archived`
- `pfkind` ไม่อยู่ใน `show` / `hide` / `sold` — โพสต์ที่ผูก asset ต้องอยู่ `sale` เท่านั้นที่อยู่ feed; `post` (ไม่ผูก asset) เข้า feed เสมอ (00_GLOBAL §10)

Search และ Watch Alert matching เป็น asset surfaces — match เฉพาะ `Sale` (00_GLOBAL §10, S-10)

## Feed Tabs Rule

| Tab | TH | Rule |
| --- | --- | --- |
| All Posts | ทั้งหมด | โพสต์ eligible ทั้งหมด — ถ้า Snooze suggested posts เปิดอยู่ เหลือเฉพาะโพสต์ของบัญชีที่ follow |
| Following | กำลังติดตาม | โพสต์ eligible ของ seller ที่ `following` |
| Favorites | รายการโปรด | โพสต์ eligible ของ seller ที่ `favorite` (account-level favorites — ตั้งจาก post menu หรือ Settings > Favorites) |

- Active tab แสดงด้วย segmented state; สลับ tab = re-render + scroll top
- Guest กดได้ทุก tab — Following/Favorites ของ guest ว่างเสมอ (ไม่มี relation) แสดง empty state ไม่ใช่ Member Sheet (S-16)
- `feedTab` ไม่ persist — reset `all` เมื่อ sign-out/session change; session `new` เริ่มที่ `All`
- Favorites = favorite sellers (IG-style) **ไม่ใช่** liked posts — like ไม่ sync เข้า tab นี้ (D7)

## Snooze Interaction

`Snooze suggested posts in feed` (Settings > Content preferences — 13_SETTINGS) เปิดแล้ว All tab เหลือเฉพาะโพสต์ของบัญชีที่ follow (concept: ซ่อน suggested posts 30 วัน); ไม่กระทบ Following/Favorites tab

## Post Card Anatomy (variant `a1`)

ตามลำดับบน card:

1. **Post head** — avatar-ring + seller name + location sub-line (เฉพาะโพสต์ที่มี location) + `Follow`/`ติดตาม` button (เฉพาะโพสต์ที่ยังไม่ follow — following ไม่แสดงปุ่ม) + `...` more
2. **Photo area** — รูปปัจจุบันของ carousel + counter `1/N` (หลายรูป) + clip badge (▶ + duration ของ slide แรก) + progress bar (clip posts)
3. **Photo dots** — เมื่อมีหลายรูป
4. **Action row** — like / comment (+count; ซ่อนทั้งคู่เมื่อ `noComments`) / views stat (ซ่อนเมื่อ `hideCounts` หรือ views 0) / share — ขวาสุด: `Ask`/`สอบถาม` pill (โพสต์คนอื่นเท่านั้น) + save bookmark
5. **Liked-by row** — stack avatars + `Liked by {name} and others` / `ถูกใจโดย {name} และคนอื่น ๆ` (แสดงเมื่อมี likes + likedBy + ไม่ hideCounts) — ไม่แสดงตัวเลขรวม (private like count)
6. **Caption** — `{seller}` bold + caption short + `more` (เฉพาะเมื่อ captionFull ยาวกว่า หรือมี details ซ่อนอยู่); hashtags render เป็น tag
7. **Posted time** — localized (`3 days ago` → `3 วันที่แล้ว` ฯลฯ)
8. **Details expander** — เฉพาะโพสต์ที่มี price หรือ spec: `Tap for details` + chevron → `details-body` (price row + spec groups ทุกกลุ่มยกเว้น `Price & Data Source` + `View full detail` link)

Card ไม่แสดงใน V1: FOR SALE/SHOWCASE type tag, price/condition overlay, verified badge, asset status badge (dead variants `a2/b2/c2/a3/b3/c3/mixed`, `tg2`)

## Card Navigation Rules

- แตะ media = carousel เท่านั้น — ไม่เปิดอะไร (ไม่มี Full Screen Image Viewer)
- `View full detail` → Post Detail (`.page-detail`)
- avatar / seller name / caption owner / liked-by name → Public Profile (`profile:{seller}`)
- `#hashtag` → Search results (mode `results`, query = tag)
- Feed card ไม่เปิด Post Viewer — viewer เปิดจาก grid tiles/notification เท่านั้น (AC-NAV-026)

## Own-Post Menu Rule

- เมนูแยกจาก others-post menu โดย `isOwnPost()` (seller = current user) — ใช้ sheet เดียวกันทุก surface
- Row order ตาม prototype: Archive → Turn off commenting → Edit หรือ View sale record → Mark as sold (conditional) → Pin → Delete
- `Mark as sold` แสดงเฉพาะโพสต์ `pfkind` ∈ `sale`/`show`/`hide` (sold เป็น final — ไม่มี Edit; โพสต์ `post`/`sold` ไม่มี Mark as sold)
- `Edit` = Edit info composer (แก้ media/caption/fields + `pfkind`/drawer link — ดู Edit Info Rule) — ไม่ใช่ asset edit
- `Delete` ต้องมี confirm เสมอ และเป็น permanent (ลบโพสต์ออกจากทุก surface + collection tiles) — ไม่มี undo

## Archive Rule

- `archived` เป็น owner-level lifecycle flag — ไม่ใช่ asset status และไม่กระทบ viewer อื่น
- Archived post: หลุด feed + owner profile grid + saved/wishlist tiles ที่อ้างถึง; อยู่ใน Archive page เท่านั้น
- Archive ล้าง `pins` ทุก tab; unarchive ไม่คืน pin
- Archive ไม่เปลี่ยน `pfkind` — unarchive แล้วกลับสภาพ eligibility เดิม
- Archive page เข้าผ่าน Settings > Your library เท่านั้น (member-only); guest ไม่มี archive

## Pin Rule

- Pin เป็น per-post per-profile-tab flag (`pins[tab]`) — pin จาก feed/pv = tab `all`; pin จาก Posts viewer = tab ที่ viewer เปิดอยู่
- จำกัด 3 pins ต่อ tab (`PIN_MAX`) — pin เกินต้อง confirm replace oldest (dialog `Pin limit reached`)
- Pinned posts เรียงก่อนใน profile grid — pin ใหม่สุดอยู่หน้าสุด (`pins[tab]` seq มากกว่าก่อน); unpinned ตาม natural order
- Feedback สองจังหวะ: pill `Pinning...`/`Unpinning...` (สั้น) แล้ว toast `Your post has been pinned`/`Your post has been unpinned`
- Archive ล้าง pins; delete ลบโพสต์พร้อม pins

## Relation Flags Rule (feed impact)

| Action | Effect บน feed |
| --- | --- |
| Follow seller | โพสต์ seller เข้า Following tab; follow button หายจาก card ทุก surface |
| Unfollow | ออกจาก Following tab; เคลียร์ `favorite` + `muted` ของ seller ด้วย (favorites/muted lists ใน Settings หลุดตาม) |
| Add to favorites | โพสต์ seller เข้า Favorites tab + เข้า Settings > Favorites list |
| Remove from favorites | ออกจาก Favorites tab/list |
| Mute seller | โพสต์ seller หาย feed ทุก tab (เก็บ following) — unmute ที่ Settings > Muted accounts / profile |
| Not interested | โพสต์นั้นออกจาก feed (ni-card → หายหลัง re-render) — restore ที่ Settings > Content preferences > Not interested |
| Block | โพสต์อีกฝ่ายหาย feed + search + WA matching (00_GLOBAL §13) — entry ผ่าน report flow/profile ไม่ใช่ feed menu |

## Composer Entry & Modes Rule

- Composer = sub page `create` (full-screen — 00_NAV §6) มี 2 mode ใช้ UI/state เดียวกัน (`cpState`):
  - **Post mode** — `data-flow="create"` ไม่มี `data-mode` — entry = `+` บน feed header; title `สร้างโพสต์ใหม่`/`New post`; primary action `แชร์`/`Share`
  - **Asset mode** — `data-flow="create" data-mode="asset"` — entry = `+` บน own profile + `เพิ่มสินทรัพย์ใหม่`/`Add asset` บน empty state; title `เพิ่มสินทรัพย์ใหม่`/`Add Asset`; primary action `Add Asset`; มี Visibility pick แทน drawer toggle + `Cost details` row แสดงเสมอ
- Guest กด `+` ทุกจุด → Member Sheet (`[data-flow]` ∈ `GUEST_GATE_SEL`)
- Draft (`cpState`) อยู่ในหน่วยความจำของ screen — คงอยู่จนกว่า `Share`/`Add Asset`/`Discard`; ไม่มี draft persistence ใน V1

## Media Picker Rule (step 1)

- Recents grid (`CP_MEDIA`) ผสม photos + clips — clip cell แสดง duration badge
- Default = **single-select** (เลือกใหม่แทนที่ selection เดิม); `เลือกหลายรายการ`/`Select` toggle → **multi-select** (badge ตัวเลขตามลำดับที่เลือก); picker ใน edit mode เป็น multi-select เสมอ
- สูงสุด 10 media ต่อโพสต์ (`CF_MAX_MEDIA`) — เลือกเกิน → toast `You can add up to 10 photos or clips`
- Hero preview = media ล่าสุดที่เลือก (clip → play overlay + duration); selection ว่าง → `เลือกรูปภาพ`/`Select photos` tile
- `Next` disabled จนกว่าจะมี ≥1 media — media เป็น required field เดียวของ composer
- Dead affordances → toast `Not in this prototype yet`: camera tile, `Recents` dropdown, expand icon

## Composer Fields Rule (step 2)

- **Media strip** — `×` บน thumb ลบ item (สร้างใหม่: ลบหมดกลับ step 1; edit: เหลือ ≥1 เสมอ); แตะ thumb → zoom viewer (photo → full preview + dots; clip → playable + countdown + progress bar; แตะ backdrop ปิด); create mode เพิ่ม media ต้องย้อน step 1, edit mode มี `+` tile ใน strip (รวม ≤10)
- **Caption** — contenteditable free-text; ไม่มี required/length validation; placeholder `เขียนคำอธิบาย...`/`Add a caption…` (asset mode `เขียนคำอธิบายสินทรัพย์…`/`Describe this asset…`)
- **Hashtag chips** — `CF_TAGS` 10 chips (`#rolex` `#patekphilippe` `#omegawatch` `#tudorwatch` `#grandseiko` `#cartier` `#watchesofinstagram` `#fullset` `#watchcollector` `#TukDaeng`); กดแทรกลง caption เฉพาะเมื่อยังไม่มี tag นั้น
- **Option rows → slide-in pane** (Done/back ปิด pane กลับ step 2):
  - `Add location` — list `CF_LOCS` 8 สถานที่ + ระยะ km (`CF_LOC_KM`) + live search filter (`ไม่พบสถานที่ที่ค้นหา`/`No matching places`); เลือก → ปิด pane ทันที row แสดงชื่อ + km + `×` ลบ + note `People you share this content with can see the location you tag and view your content on the map.`
  - `Add price` — digits-only + auto-comma; เว้นว่าง = showcase post (`หากเป็นโพสต์โชว์ให้เว้นว่างไว้`)
  - `Watch details` — `CF_SPECS` 22 fields free-text (Watch Specifications 20 + Item Details 2) + Description textarea; note ว่า Condition/Box ตั้งใน Condition section
  - `Condition` — 5 ตัวเลือก single-select (`Brand New`/`Like New`/`Very Good`/`Good`/`Fair`) + Box & papers 4 ตัวเลือก (`Full set — box & papers`/`Box only`/`Papers only`/`Watch only (no set)` — กดซ้ำยกเลิกได้)
  - `Cost details (private)` — purchase price (digits + comma) + purchase date (date picker, 1900-01-01 ถึงวันนี้) + privacy note; แสดงเฉพาะ asset mode หรือ drawer toggle ON; validation ดู §11
  - `More options` — `Turn off commenting` toggle + audience pick `ทุกคน`/`Everyone` ↔ `เฉพาะผู้ติดตาม`/`Followers only` + privacy note; row value แสดง `Followers only` เมื่อเลือก
- **`Also save to My Assets`** drawer toggle (post mode + edit) — default OFF; ON → เพิ่ม `Cost details` row (และ `Profile status` pick ใน edit mode)

## Publish Rule (`insertNewPost`)

- Post mode `Share` → `insertNewPost` แทรกโพสต์ใหม่บนสุดของ `POSTS`: seller = current user, `time:"Just now"`, `following:true`, `favorite:false`, `pfkind:"post"`, likes/comments/views = 0
- `type` = `sale` เมื่อมี price, `showcase` เมื่อไม่มี — display hint เท่านั้น (`pfkind` เป็นตัวกำหนด eligibility)
- Fields จาก meta (`cfFieldsFromMeta`): `price` (`THB` + comma), `chips` = [cond, box], `specGroups` = ทุก CF_SPECS row (ค่าว่าง render `N/A`) + `Condition`/`Box & Papers` เพิ่มใน Item Details — สร้างเฉพาะเมื่อมี spec input หรือ cond/box
- `Price & Data Source` band เพิ่มอัตโนมัติเมื่อมี details หรือ price: Asking Price, **Estimated Market Price** (mock estimate ≈ −5%/+6% ปัด 5,000 — prototype-computed ไม่ใช่ market data จริง), Last Price Update = วันนี้, Data Source `TukDaeng Market Data`
- Clip draft ที่มี media เดียวล้วน → `clip` + `clips[1]` + toast `Clip shared to feed ✓`; mixed/photo draft → `clips[]` duration ต่อ slide (null = photo)
- `Also save to My Assets` ON → `pfkind:"sale"` + สร้าง drawer asset (`cfToPortfolio` status `sale`) + link `assetId`
- Toast: `Posted · shared to feed ✓` / `Posted · shared to feed + My Assets ✓` (drawer ON) / `Clip shared to feed ✓` — EN hardcode (deviation); composer ปิด + feed re-render + scroll top
- โพสต์ใหม่ที่ตรง Watch Alert ON → toast `Watch alert matched: {name}` `(+N more)` หน่วง ~2 วินาทีหลัง toast หลัก (simulation — 10_WATCH_ALERT)

## Asset Mode Rule (composer → drawer)

- `Add Asset` สร้าง portfolio drawer record เสมอ (`cfToPortfolio` ตาม visibility) + link `assetId` กลับไปที่ post — ทุก path เป็น drawer record ก่อน
- Visibility pick (default `โชว์`/`Show`):
  - `โชว์`/`Show` → drawer-only post `pfkind:"show"` ใน `PF_MINE` — โชว์บน profile แต่**ไม่เข้า `POSTS`** (ไม่ขึ้น feed/search/WA matching)
  - `ซ่อน`/`Hide` → drawer-only `pfkind:"hide"` — private เห็นเฉพาะ owner
  - `โพสต์ลงฟีด`/`Post to feed` → `insertNewPost` `pfkind:"sale"` — เข้า feed + Sale tab + search/WA eligible (`บันทึกเข้าลิ้นชักแล้วประกาศลงฟีดทันที`)
- จบแล้วกลับ own profile grid เสมอ + toast ตาม path: `Saved to My Assets · posted to feed ✓` / `Saved to My Assets · shown on profile ✓` / `Saved to My Assets · private ✓` (มี TH)
- Deviation: Show/Hide path ทิ้งค่า audience/noComments ที่ตั้งใน More options (record hardcode `public`/false)

## Edit Info Rule (FEED-024)

- Entry = own-post menu `Edit` เท่านั้น — `openPostEdit` เปิด composer prefilled ที่ step 2; sold post ไม่มี Edit (ดู Own-Post Menu Rule)
- Prefill (`metaFromPost`): media = `photos` + `clips` ต่อ slide; caption = `captionFull`; meta ย้อนกลับจาก post fields (location, audience, noComments, price, `CF_SPECS` by label — `N/A` → ว่าง, cond, box); `desc` preload เฉพาะเมื่อเป็น description จริง (ไม่ใช่ caption ที่ถูก copy); cost fields prefill จาก linked drawer asset
- Drawer toggle สะท้อน membership จริง: ON เมื่อ `assetId` ชี้ drawer asset หรือ `pfkind` ∈ `sale`/`show`/`hide`; ON → `Profile status` pick `ขาย`/`Sale` (Listed in your Sale tab — price is optional) · `โชว์`/`Show` (in collection, leaves feed) · `ซ่อน`/`Hide` (private drawer, leaves feed); sold post → toggle locked ON disabled + `This item lives in your Sold history` (ไม่มี `sold` ใน pick)
- Add media: `+` tile (รวม ≤10) → picker `เพิ่มรูปภาพหรือคลิป`/`Add photos or clips` (multi-select เสมอ) — `Done` เก็บของที่เพิ่ม, back ยกเลิก; ลบจนเหลือ 0 ไม่ได้ → toast `Post needs at least 1 photo or clip`
- `Done` → `applyPostEdit` (`post` update):
  - media/caption/location/audience/noComments/specs/chips/price ตาม draft; `type` ตาม price; `desc` = description field
  - `pfkind` = `Profile status` pick เมื่อ drawer ON; `post` เมื่อ OFF — `sold` เปลี่ยนไม่ได้ผ่าน Edit เลย
  - Drawer link: ON โดยยังไม่ link → materialize drawer asset (`cfToPortfolio`); ปิด toggle → ตัด `assetId` + ลบ drawer asset (link ไป Sold history คงไว้); drawer asset ที่ link อยู่ sync fields ตาม post
  - Surface restore: เปิดจาก Post Detail → detail ถูกซ่อนระหว่างแก้ + เปิดคืนหลัง Done/Cancel; เปิดจาก Posts viewer → composer ทับ viewer (viewer คงอยู่); อื่น → คืน sub stack เดิม; toast `Post updated` + `refreshPostViews` ทุก surface (รวมเอาโพสต์ออกจาก feed เมื่อ `pfkind` ไป `show`/`hide`/`sold`)
- `Cancel` → discard dialog `ทิ้งการแก้ไข?`/`If you go back now, your edits will be discarded.` + `ทิ้งการแก้ไข`/`Discard` + `แก้ไขต่อ`/`Cancel` — เสมอไม่ว่าจะแก้จริงหรือไม่

## Clip Media Rule

- `clips[i]` = duration ของ slide ที่เป็น video (`null` = photo); `clip` singular = โพสต์ที่มี clip เดียว
- Feed/detail clip autoplay เองเมื่อ card มองเห็น ≥55% — เลื่อนผ่าน pause เลื่อนกลับเล่นต่อ, จบแล้ววน, badge นับเวลาถอยหลัง + progress bar (`feedClipTick`)
- Composer: draft clip เดียวล้วน = playable preview + play/pause + countdown; clip ใน mixed draft เล่นผ่าน zoom viewer เท่านั้น

## Audience Rule (stored, not enforced — deviation)

- `audience` เก็บ `public`/`followers` บนโพสต์จาก More options แต่ feed/viewer ไม่กรองตาม audience ใน V1 — enforcement เป็น contract (prototype deviation — flag)

## Lifecycle Impact (post-centric)

| Transition | Feed Impact |
| --- | --- |
| Post created (composer `Share`) | `insertNewPost` — โพสต์ใหม่บนสุด feed; `pfkind:"post"` (drawer OFF) หรือ `sale` (drawer ON) |
| Asset composer `Post to feed` | post `pfkind:"sale"` + drawer record — เข้า feed + profile Sale tab |
| Asset composer `Show`/`Hide` | drawer-only record — ไม่เข้า feed/search/WA เลย |
| Edit info → `โชว์`/`ซ่อน` | `pfkind` → `show`/`hide` — หลุด feed ทันที + หลุด search/WA matching |
| Edit info → drawer OFF | `pfkind` → `post` — ตัด drawer link + ลบ drawer asset; อยู่ feed แต่หลุด profile status tabs + search/WA |
| Post `sale` → `sold` (Mark as sold สำเร็จ) | หลุด feed ทันที + ทุก tab; own-post menu เปลี่ยน Edit → View sale record |
| Post `sale` ↔ `show`/`hide` (drawer status change) | `show`/`hide` หลุด feed; กลับ `sale` เข้า feed ใหม่ |
| Post archived ↔ unarchived | หลุด/กลับ feed ตาม eligibility; pins ล้างตอน archive |
| Post deleted | หายทุก surface + detail ที่เปิดอยู่ปิด; deep-link/stale ref → unavailable state (contract) |
| Report submitted | ไม่หายจาก feed จนกว่า moderation (00_GLOBAL §13) |
| ni / mute / block | หายจาก feed ของ viewer นั้นตาม Relation Flags Rule |

## Performance And Loading

- Feed ควรโหลดภายใน 2 วินาที; รูปภาพ lazy load (prototype: `loading="lazy"` บน tiles)
- Render list ทั้งก้อนครั้งเดียว — ไม่มี infinite scroll / load-more / end-of-list marker ใน V1
- Refresh = tap Feed nav re-tap เท่านั้น — ไม่มี pull-to-refresh / auto real-time refresh
- V1 ไม่รองรับ real-time feed refresh สำหรับโพสต์ใหม่/like/comment จากอุปกรณ์อื่น

## Feed Network States (contract — S-29, prototype ไม่ครอบ feed error path)

หน้าฟีดต้องแยกสถานะ network ให้ชัดเจน เพื่อไม่ให้ผู้ใช้เห็นหน้าว่างหรือ loading ค้างเมื่อสัญญาณไม่ดี

| State | Trigger | UI Behavior | TH Copy | EN Copy |
| --- | --- | --- | --- | --- |
| Initial loading | ผู้ใช้เปิด Feed และยังไม่มีข้อมูลบนหน้าจอ | แสดง skeleton ของ post card ในตำแหน่งรายการ ห้ามแสดงหน้าว่าง | ไม่ต้องมีข้อความ | No copy |
| Slow network | โหลดนานเกิน 2 วินาที แต่ request ยังไม่ fail | คง skeleton/loading ไว้ และแสดงข้อความเล็กใต้ tabs หรือเหนือ list | `กำลังโหลดข้อมูล อาจใช้เวลาสักครู่` | `Loading data. This may take a moment.` |
| Initial load failed, no cache | API fail หรือ timeout และไม่มี cached Feed | แสดง full-page error state กลางพื้นที่ list พร้อมปุ่ม `ลองใหม่` | Title: `โหลดฟีดไม่สำเร็จ` Body: `สัญญาณอินเทอร์เน็ตอาจไม่เสถียร กรุณาตรวจสอบการเชื่อมต่อแล้วลองอีกครั้ง` Button: `ลองใหม่` | Title: `Unable to load feed` Body: `Your internet connection may be unstable. Check your connection and try again.` Button: `Try again` |
| Offline, no cache | อุปกรณ์ offline ตั้งแต่เปิด Feed และไม่มี cached Feed | แสดง full-page offline state กลางพื้นที่ list พร้อมปุ่ม `ลองใหม่` | Title: `ไม่มีการเชื่อมต่ออินเทอร์เน็ต` Body: `เชื่อมต่ออินเทอร์เน็ตแล้วลองโหลดฟีดอีกครั้ง` Button: `ลองใหม่` | Title: `No internet connection` Body: `Connect to the internet and try loading the feed again.` Button: `Try again` |
| Offline with cache | อุปกรณ์ offline แต่เคยโหลด Feed สำเร็จมาก่อน | แสดง card จาก cache ต่อไป และมี offline banner ด้านบน list | `คุณกำลังออฟไลน์ ข้อมูลอาจไม่ใช่ข้อมูลล่าสุด` | `You are offline. This information may not be up to date.` |
| Refresh failed with existing data | ผู้ใช้ re-tap Feed nav แล้ว refresh fail แต่ยังมีข้อมูลเดิมบนหน้าจอ | คงข้อมูลเดิมไว้ ห้ามล้าง list และแสดง snackbar/banner สั้น ๆ พร้อม retry ได้ | `อัปเดตฟีดไม่สำเร็จ กรุณาลองใหม่` + `ลองใหม่` | `Unable to update feed. Please try again.` + `Retry` |

Network state rules:

- ห้ามแสดง loading spinner ค้างเกิน timeout โดยไม่มีข้อความหรือ action
- ปุ่ม `ลองใหม่` ต้องเรียกโหลด feed tab ปัจจุบันซ้ำ
- หากมี cache ต้องให้ cache สำคัญกว่า full-page error เพื่อให้ผู้ใช้ยังดู Feed ล่าสุดได้
- Offline/cached indicator ต้องไม่บัง tabs, header actions, card action หรือ bottom navigation
- เมื่อ reconnect สำเร็จ ให้ refresh Feed แบบเงียบหรือผ่าน user action ตาม platform behavior และเอา offline banner ออกเมื่อข้อมูลใหม่โหลดสำเร็จ

## Feed Image Load States (contract — S-29)

กรณี feed data โหลดสำเร็จ แต่รูปโพสต์โหลดไม่สำเร็จ ต้องถือเป็น image-level failure ไม่ใช่ feed error

| State | Trigger | UI Behavior | TH Copy | EN Copy |
| --- | --- | --- | --- | --- |
| Image loading | Card data มาแล้ว แต่รูปยังโหลดอยู่ | แสดง image skeleton หรือ blurred placeholder ในพื้นที่รูป โดยพื้นที่ card ต้องไม่กระโดดหรือเปลี่ยนขนาด | ไม่ต้องมีข้อความ | No copy |
| Image failed | รูปหลักของ card โหลดไม่สำเร็จ | แสดง placeholder สี neutral ในพื้นที่รูป พร้อม icon รูปภาพ/แจ้งเตือน และให้ข้อมูล text ของ card แสดงต่อได้ครบ | `โหลดรูปไม่สำเร็จ` | `Image failed to load` |
| Retry image | ผู้ใช้กดพื้นที่ placeholder หรือปุ่ม retry เฉพาะรูป | โหลดรูปของ card นั้นใหม่เท่านั้น ห้าม reload ทั้ง feed | `ลองโหลดรูปใหม่` | `Retry image` |
| Partial gallery failed | โพสต์มีหลายรูปและบางรูปโหลดไม่สำเร็จ | แสดงรูปที่โหลดได้ก่อน ถ้ารูปปัจจุบัน fail ให้แสดง placeholder เฉพาะ slide นั้น | `โหลดรูปไม่สำเร็จ` | `Image failed to load` |

Image failure rules:

- ห้ามซ่อน card เพียงเพราะรูปโหลดไม่สำเร็จ หากข้อมูลโพสต์โหลดสำเร็จแล้ว
- caption, seller, action row และ details expander ต้องยังแสดงและกด action ได้ตามสิทธิ์
- Placeholder ต้องใช้ขนาดเท่าพื้นที่รูปจริง เพื่อไม่ให้ layout กระโดด
- การ retry รูปต้อง retry เฉพาะ image request ของ card/slide นั้น ไม่ใช่ reload feed ทั้งหน้า
- หากรูปโหลดไม่สำเร็จเพราะ offline และมี cached thumbnail ให้แสดง cached thumbnail ก่อน placeholder
- หากไม่มีรูปที่โหลดได้เลย ให้ยังเปิด Post Detail ได้ แต่ hero แสดง image unavailable state เฉพาะรูป

## Feed Owner Fallback States (contract — S-29)

กรณีข้อมูลโพสต์โหลดสำเร็จ แต่ข้อมูล owner/profile บางส่วนโหลดไม่สำเร็จ ต้อง fallback เฉพาะ owner row และห้ามซ่อนทั้ง card

| State | Trigger | UI Behavior | EN Copy / UI |
| --- | --- | --- | --- |
| Profile image failed, owner data loaded | รูปโปรไฟล์โหลดไม่สำเร็จ แต่ owner id และ display name มาแล้ว | ใช้ default avatar หรือ initials; ชื่อจริง, เวลา, Follow และ action ที่มี permission ชัดเจนยังแสดงได้ | Avatar fallback; keep actual seller name |
| Owner data loading | Owner/profile request ยัง pending | แสดง avatar/name skeleton; ซ่อนหรือ disable Follow และ more menu จนรู้ owner id/action permission | Skeleton only |
| Owner data failed, post data loaded | Post data มาแล้ว แต่ owner/profile resolve ไม่สำเร็จ | ใช้ default avatar, แสดง `Unknown seller`, ซ่อน Follow, ซ่อน owner-dependent menu | `Unknown seller` |
| Seller unavailable | Owner ถูกลบ unavailable หรือ blocked ตาม Trust & Safety | ใช้ default avatar, แสดง `Seller unavailable`, ซ่อน Follow และ owner actions | `Seller unavailable` |

Owner fallback rules:

- `Unknown seller` ใช้เฉพาะเมื่อ owner/profile request fail หลัง post data โหลดสำเร็จแล้ว ไม่ใช้ระหว่าง loading
- ถ้า owner id หรือ follow state ไม่ชัด ห้ามแสดงปุ่ม `Follow`
- ถ้า more menu ต้องพึ่ง owner id ให้ซ่อนเมนู; ถ้ายังมี listing-level action ที่ valid เช่น report อาจแสดงเฉพาะ action นั้นได้
- ถ้าแค่รูปโปรไฟล์โหลดไม่สำเร็จ แต่ owner data มาแล้ว ให้ใช้ชื่อจริงของ seller และเปิด owner/profile action ได้ตาม permission

## Prototype Deviations & Dead-Code Notes (documented, not spec)

- `feedEmptyHTML("all")` fallback ใช้ copy `No favorites yet` + star icon — edge case เมื่อโพสต์ทุกใบติด exclusion; spec กำหนด All-empty copy ให้ถูก context (ดู §13)
- `lk-follow` บน Likes sheet เป็น visual-only toggle ใน prototype (ไม่ sync follow state — dead artifact); spec ถือ Follow จาก likes sheet เป็น action จริงตาม 11_SOCIAL
- `pfp-post` (Posts viewer) ของคนอื่นเปิด report-only menu — spec รับตาม prototype
- `hideCounts` flag ซ่อน liked-by row + views ทุก surface — มีเฉพาะบน seeded posts; composer ไม่มี setter (More options มีแค่ commenting + audience) — spec เก็บ field + read semantics แต่ไม่มี UI เขียนค่าใน V1
- `audience:"followers"` ถูกเก็บบนโพสต์แต่ feed ไม่กรองตาม audience (ดู Audience Rule) — enforcement เป็น contract
- Asset mode `Show`/`Hide` path ทิ้ง audience/noComments ที่ตั้งใน More options (drawer-only record hardcode `public`/false)
- Composer toasts หลายตัว EN hardcode ไม่มี TH branch: `Posted · shared to feed ✓` / `Posted · shared to feed + My Assets ✓` / `Clip shared to feed ✓` / `Post updated` / `Post needs at least 1 photo or clip` / `You can add up to 10 photos or clips` / `Watch alert matched:` — i18n sweep (FSP-026)
- `Estimated Market Price` band บนโพสต์ใหม่ = mock estimate (±5–6% ปัด 5,000 + `Last Price Update` = วันนี้) — ไม่ใช่ market data จริง
- โพสต์ใหม่ seed `likedBy` fake (`the watch`) — artifact ไม่มีผล render (likes=0 ไม่แสดง liked-by row)
- Design variants `a2/b2/c2/a3/b3/c3/mixed` (price overlay / quiet price / footer price / type tag), `ft:"none"` brand-menu dropdown, `POST_DETAIL_CFG` เป็น dead prototype artifacts — ไม่ใช่ spec
- `chat-fab`/`chatPopHTML` (floating DM) ต้อง `ask:"bubble"` จึงจะ mount — unreachable ใน active config
- Save บนโพสต์ตัวเองทำได้ (save-btn ไม่ยกเว้น own post)
- Composer draft ไม่ persist ข้าม session — `cpState` อยู่ใน memory เท่านั้น

# 10. Permission Rules

| Actor | Permission |
| --- | --- |
| Guest | ดู feed ทุก tab + empty states, card carousel, caption/details expand, Post Detail, Public Profile, comment sheet (view), likes sheet (view) |
| Guest | ห้าม like/save/share/wishlist/follow/ask/menu/comment-input/not-interested/report — ทุกจุด → Member Sheet |
| Guest | ห้ามสร้างโพสต์/asset — `+` ทุกจุด (`[data-flow]`) → Member Sheet |
| Member | ใช้ feed และ action ที่เกี่ยวข้องตาม eligibility rule |
| Member | สร้างโพสต์ (post mode) / เพิ่ม asset (asset mode) ผ่าน create composer ได้ครบทุก field |
| Member | Not interested, Mute, Unfollow, Add/Remove favorites, Report ได้จากเมนู/feedback card ของโพสต์ผู้อื่น |
| Owner | Archive, commenting toggle, Edit, Mark as sold, Pin, Delete ได้จากเมนูของโพสต์ตัวเอง; เห็น like total บน own surfaces |
| Owner | Edit info เฉพาะโพสต์ตัวเอง (entry ผ่าน own-post menu เท่านั้น) — แก้ media/fields + `pfkind` (sale/show/hide/post) + drawer link; `sold` เปลี่ยนไม่ได้ |
| Blocked User | ไม่เห็นโพสต์ของอีกฝ่ายใน feed; ไม่ได้รับการแสดงใน Following/Favorites tab ของอีกฝ่าย |
| Admin | ไม่ใช่ primary actor ของ Feed V1 (moderation อยู่ Back Office) |

# 11. Validation Rules

- โพสต์ที่แสดงใน feed ต้องผ่าน eligibility rule (ไม่ ni/muted/blocked/archived และ `pfkind` ∉ `show`/`hide`/`sold`)
- ทุก login-required action ต้อง validate session — `guest` → Member Sheet ก่อน execute (00_GLOBAL §11)
- Own-post menu actions ต้อง validate ownership (`seller` = current user)
- `Mark as sold` ต้องมีโพสต์ที่ `pfkind` ∈ `sale`/`show`/`hide` เท่านั้น และต้องเปิด Sale Record form ก่อนเปลี่ยน `sold`
- `Edit` ห้ามแสดงบนโพสต์ `sold` (แสดง `View sale record` แทน)
- `Delete` ต้องผ่าน confirm dialog เสมอ และห้าม undo
- `Pin` เกิน `PIN_MAX` (3 ต่อ tab) ต้องผ่าน confirm replace-oldest dialog
- `Mute` ต้องผ่าน mute confirm dialog; `Unfollow` จาก card follow button ต้องผ่าน unfollow sheet (ยกเว้น unfollow จาก ni-card = instant ตาม surface)
- Favorites row ใน others-post menu แสดงเฉพาะเมื่อ following หรือ favorite อยู่แล้ว
- Report entry จาก feed ต้องใช้ report flow ของ Trust & Safety (reason required อยู่ฝั่ง flow)
- การเปิด Post Detail / viewer จาก feed ต้อง validate post availability + visibility ก่อน render (contract)
- Composer ต้องมี media ≥1 — `Next`/`Share`/`Add Asset` disabled จนครบ; edit mode ลบชิ้นสุดท้ายไม่ได้ (`Post needs at least 1 photo or clip`); รวมสูงสุด 10 (`You can add up to 10 photos or clips`)
- Composer ไม่มี required field อื่น — caption/price/specs/condition/location ว่างได้ทั้งหมด (price ว่าง = `showcase`)
- Price/purchase input = digits-only + auto-comma (`unNum`/`fmtNum`)
- Purchase date ต้องอยู่ 1900-01-01 ถึงวันนี้ — invalid → `วันที่ซื้อไม่ถูกต้อง`/`Invalid purchase date`, future → `วันที่ซื้ออยู่ในอนาคตไม่ได้`/`Purchase date can't be in the future` inline; `Done` ของ cost pane ถูก block จนกว่าจะ valid (back ยกเลิก pane ได้เสมอ)
- Audience มี 2 ค่าเท่านั้น (`public`/`followers`); edit drawer OFF บังคับ `pfkind:"post"`; `sold` ไม่ให้แก้ status

# 12. Exception Handling

| Case | Expected Handling |
| --- | --- |
| โหลด Feed ไม่สำเร็จ | แสดง Error State และปุ่ม `ลองใหม่` (contract) |
| เน็ตช้าและ feed ยังไม่ fail | แสดง loading/skeleton ต่อพร้อมข้อความ `กำลังโหลดข้อมูล อาจใช้เวลาสักครู่` (contract) |
| Offline แต่มี cache | แสดงข้อมูลล่าสุดที่โหลดไว้ พร้อม offline/cached indicator (contract) |
| Offline และไม่มี cache | แสดง empty/error state ที่สื่อว่าไม่มีข้อมูลพร้อม retry (contract) |
| Refresh fail แต่มีข้อมูลเดิม | คงข้อมูลเดิมไว้และแสดง snackbar/banner `อัปเดตฟีดไม่สำเร็จ กรุณาลองใหม่` (contract) |
| Post data โหลดสำเร็จแต่รูปโหลดไม่ขึ้น | คง card ไว้ แสดง placeholder ในพื้นที่รูปพร้อม `โหลดรูปไม่สำเร็จ` และ retry เฉพาะรูป (contract) |
| โพสต์เปลี่ยน `pfkind` ระหว่างดู feed | ถ้าเข้า `show`/`hide`/`sold` ให้หลุดจาก feed เมื่อ refresh หรือ sync |
| Seller ถูก block/mute | โพสต์ของ seller ต้องหายจาก feed เมื่อข้อมูล sync |
| Owner archive/unarchive | โพสต์หลุด/กลับ feed ทันทีตาม eligibility |
| Like / Unlike ล้มเหลว | คืนค่า UI เป็นสถานะก่อนหน้าและแสดง error ที่เหมาะสม (contract) |
| Mark as sold ล้มเหลว | คงโพสต์ใน feed และแสดง error ที่เหมาะสม (contract) |
| Delete post ล้มเหลว | คงโพสต์ใน feed และแสดง error ที่เหมาะสม (contract) |
| Report สำเร็จจาก feed | แสดง report:done + other steps — ไม่ทำให้โพสต์หายจาก feed ทันที |
| Archive ที่เปิดอยู่แล้วโพสต์ถูก unarchive/delete | list ต้อง reflect state ล่าสุดเมื่อ re-render |
| Guest ใช้ action ที่ต้อง login | แสดง Member Sheet `Join TukDaeng` (gate mode) |
| Guest กด `+` create | แสดง Member Sheet (`[data-flow]` ∈ gate list) — composer ไม่เปิด |
| Tab เป้าหมายไม่มีโพสต์ | แสดง empty state ของ tab นั้น |
| กด `Next`/`Share` โดยไม่มี media | ปุ่ม disabled — กดไม่ได้ |
| Edit ลบ media ชิ้นสุดท้าย | toast `Post needs at least 1 photo or clip` — ไม่ลบ |
| เลือก media เกิน 10 ชิ้น | toast `You can add up to 10 photos or clips` — ไม่เพิ่ม |
| Purchase date invalid/future | inline error ใน cost pane + block `Done` (back ยกเลิกได้เสมอ) |
| ปิด composer ระหว่างมี draft | discard dialog ตาม Discard Draft Flow — draft ว่างปิดเงียบ |
| โพสต์ใหม่ตรง Watch Alert ON | toast `Watch alert matched: {name}` หน่วงหลัง toast หลัก ~2 วินาที |
| กด camera tile / `Recents` / expand ใน composer | toast `Not in this prototype yet` (dead affordances) |
| Location pane ไม่เจอสถานที่ | แสดง `ไม่พบสถานที่ที่ค้นหา`/`No matching places` |

# 13. Empty State

| State | Icon | Message / Behavior |
| --- | --- | --- |
| Following empty | users | `Follow others to see their posts here` / `ติดตามผู้อื่นเพื่อดูโพสต์ของพวกเขาที่นี่` |
| Favorites empty | star | `No favorites yet` / `ยังไม่มีรายการโปรด` |
| All empty | star (prototype fallback — edge case เมื่อทุกโพสต์ติด exclusion) | `No favorites yet` ใน prototype; spec กำหนดให้ใช้ generic `ไม่พบข้อมูล` / `No data found` ตาม 00_GLOBAL §11 (prototype deviation — flag) |
| Archive empty | history | `ไม่มีโพสต์ในคลังเก็บ` / `No archived posts` + `โพสต์ที่คุณจัดเก็บจะแสดงให้คุณเห็นเท่านั้น` / `Posts you archive will only be visible to you.` |
| Composer picker — ยังไม่เลือก media | camera | `เลือกรูปภาพ` / `Select photos` hero tile |
| Composer location pane — ไม่เจอสถานที่ | — | `ไม่พบสถานที่ที่ค้นหา` / `No matching places` |

# 14. Notification Rules

- Feed ไม่สร้าง notification โดยตรง
- Like / Comment / Follow notification ถูกกำหนดใน 09_NOTIFICATION + 11_SOCIAL — destination = Post Viewer / Public Profile ตาม 00_NAV §8
- Watch Alert notification เปิด Post Viewer ของโพสต์ที่ match โดยตรง (S-08 — ไม่มี Result List)
- Share / Save / Not-interested / Mute / Archive / Pin ไม่สร้าง Notification Center item
- โพสต์ใหม่จาก composer ที่ตรง Watch Alert ON → toast `Watch alert matched: {name}` (simulation — ไม่ใช่ notification item; 10_WATCH_ALERT)

# 15. Analytics Events

(contract — prototype ไม่มี tracking layer, S-29)

| Event | Trigger |
| --- | --- |
| `feed_viewed` | User เปิด Feed |
| `feed_tab_changed` | User เปลี่ยน feed tab |
| `feed_refreshed` | User กด Feed nav ซ้ำตอนอยู่ feed (tap-to-refresh) |
| `feed_card_photo_swiped` | User เลื่อน carousel ใน card |
| `feed_caption_expanded` | User กด `more` ขยาย caption |
| `feed_details_expanded` | User กด `Tap for details` |
| `feed_detail_opened` | User กด `View full detail` → Post Detail |
| `feed_profile_opened` | User เปิด Public Profile จาก card |
| `feed_hashtag_tapped` | User กด hashtag ใน caption |
| `post_liked` / `post_unliked` | Member like/unlike จาก feed |
| `comment_sheet_opened` | เปิด comment sheet จาก feed |
| `likes_sheet_opened` | เปิด likes sheet จาก liked-by row |
| `share_sheet_opened` | เปิด share sheet |
| `save_sheet_opened` / `post_saved` / `post_unsaved` | save sheet interactions |
| `ask_seller_tapped` | กด Ask pill (item-scoped chat) |
| `post_followed` / `post_unfollowed` | follow/unfollow จาก feed surfaces |
| `post_menu_opened` | เปิด `...` menu (own/others) |
| `favorites_added` / `favorites_removed` | toggle favorites จาก others menu |
| `not_interested_marked` / `not_interested_undone` | Not interested + Undo |
| `uncomfortable_marked` | `This post made me uncomfortable` |
| `mute_confirmed` | Confirm mute dialog |
| `report_flow_opened` | Report จาก post menu / uncomfortable card |
| `post_archived` / `post_unarchived` | Archive toggle |
| `commenting_toggled` | Turn off/on commenting |
| `post_edit_opened` | Edit จาก own menu → Edit info composer |
| `mark_as_sold_tapped` | Mark as sold → sell form |
| `sale_record_opened` | View sale record |
| `post_pinned` / `post_unpinned` / `pin_limit_confirmed` | pin actions |
| `post_delete_confirmed` | Delete post confirm |
| `archive_opened` / `archive_post_viewed` | Archive surface |
| `composer_opened` | เปิด create composer (post/asset mode) |
| `composer_media_selected` / `composer_multi_select_toggled` | เลือก media / toggle Select ใน picker |
| `composer_step2_opened` | `Next` เข้า step 2 |
| `composer_pane_opened` | เปิด option pane (`loc`/`price`/`spec`/`cost`/`cond`/`more`) |
| `composer_hashtag_inserted` | กด hashtag chip แทรก caption |
| `composer_discard_shown` / `composer_discarded` | discard dialog แสดง / ยืนยันทิ้ง draft |
| `post_published` / `clip_published` | `Share` สำเร็จ (post mode) |
| `asset_created` | `Add Asset` สำเร็จ — visibility `show`/`hide`/`feed` |
| `post_edit_saved` / `post_edit_discarded` | Edit info `Done` / Discard |
| `member_sheet_shown` | Guest ใช้ action ที่ต้อง login |

# 16. Acceptance Criteria

| ID | Criteria |
| --- | --- |
| AC-FEED-001 | Feed แสดงเฉพาะโพสต์ที่ผ่าน eligibility rule — ไม่แสดงโพสต์ ni/muted/blocked/archived และไม่แสดงโพสต์ `pfkind` `show`/`hide`/`sold` |
| AC-FEED-002 | โพสต์ `post` (ไม่ผูก asset) และโพสต์ `sale` เข้า feed; โพสต์ที่ผูก asset สถานะ `Show`/`Hide`/`Sold` ไม่เข้า feed |
| AC-FEED-003 | Feed กรองโพสต์ของบัญชีที่ block กัน (ทั้งสองทิศ) ออก |
| AC-FEED-004 | `All` แสดงโพสต์ eligible ทั้งหมด; เมื่อ Snooze suggested posts เปิดอยู่ เหลือเฉพาะโพสต์ของบัญชีที่ follow |
| AC-FEED-005 | `Following` แสดงเฉพาะโพสต์ eligible ของ seller ที่ Member กำลัง Follow |
| AC-FEED-006 | `Favorites` แสดงเฉพาะโพสต์ eligible ของ seller ที่อยู่ใน favorites (account-level — ไม่ใช่ liked posts) |
| AC-FEED-007 | Guest กดได้ทุก feed tab โดยไม่เจอ Member Sheet — Following/Favorites แสดง empty state |
| AC-FEED-008 | กด bottom-nav Feed ซ้ำตอนอยู่ feed ต้อง re-render list + scroll to top |
| AC-FEED-009 | Post card แสดง post head (avatar, seller, location sub-line ถ้ามี, Follow button ถ้ายังไม่ follow, `...`), photo carousel + counter + dots, action row (like/comment+count/views/share + Ask pill + save), liked-by row, caption + `more`, posted time และ details expander เมื่อมี price/spec |
| AC-FEED-010 | แตะรูปใน card ต้องเป็น carousel ซ้าย/ขวาเท่านั้น — ไม่เปิด detail หรือ full-screen image viewer |
| AC-FEED-011 | Member กด Like แล้วปุ่ม toggle + นับ ±1 และ sync ทุก surface ของโพสต์เดียวกัน; like ต้องไม่เพิ่มโพสต์เข้า Favorites tab |
| AC-FEED-012 | Like count เป็น private — card/others surfaces แสดง `Liked by {name} and others` ไม่มีตัวเลขรวม; Likes sheet ของโพสต์คนอื่นแสดง note `Only {seller} can see the total number of likes on this post.` |
| AC-FEED-013 | Guest กด like/save/share/follow/ask/`...` menu/comment input ต้องเห็น Member Sheet `Join TukDaeng` |
| AC-FEED-014 | `Tap for details` ขยาย details-body inline (price + spec groups + `View full detail`) และ `View full detail` เปิด Post Detail; เปิด expander ใหม่ต้องปิด expander ที่เปิดค้างบน card อื่น |
| AC-FEED-015 | Seller avatar/name/caption owner เปิด Public Profile ของเจ้าของโพสต์ |
| AC-FEED-016 | Comment button เปิด shared comment sheet จาก feed card โดยตรง; โพสต์ `noComments` ไม่แสดง comment button + count |
| AC-FEED-017 | Share button เปิด share sheet (friend grid + app row + copy link); guest ต้องเจอ Member Sheet (share gated ทุก surface) |
| AC-FEED-018 | Save button เปิด save sheet (Saved + Collections + New collection); เลือก collection assign โพสต์เข้า collection นั้น; เลือก `Saved` ซ้ำ = unsave |
| AC-FEED-019 | Ask Seller pill แสดงเฉพาะโพสต์คนอื่น — เปิด item-scoped chat; own post ไม่แสดง pill (และกดจากจุดอื่นต้อง toast `This is your own listing`); blocked seller → toast `Cannot message a blocked account` |
| AC-FEED-020 | Follow button บน card แสดงเฉพาะโพสต์ที่ยังไม่ follow — กด follow ทันทีและ sync ทุกโพสต์ของ seller; unfollow ผ่าน `Unfollow @{seller}?` sheet; unfollow เคลียร์ favorite + mute ของ seller นั้น |
| AC-FEED-021 | Others-post menu มี `Add/Remove from favorites` (เฉพาะเมื่อ following หรือ favorite อยู่แล้ว), `Not interested`, `Report` — ไม่มี Share/Block/Hide ในเมนู |
| AC-FEED-022 | `Not interested` เปลี่ยน card เป็น ni-card (`Thanks for your feedback` + `Undo` + `We'll suggest fewer posts like this.` + action rows) — following seller แสดง `Mute {seller}` + `Unfollow {seller}`, ไม่ follow แสดง `Manage content preferences` |
| AC-FEED-023 | `This post made me uncomfortable` เปลี่ยนเป็น uncomfortable card (`Thanks for letting us know` + `Report` + `Undo`) — Report เปิด report stack, Undo คืน card ปกติ |
| AC-FEED-024 | โพสต์ ni หลัง re-render หายจาก feed และ restore ได้ที่ Settings > Content preferences > Not interested (`Restore`/`Reset suggested content`) |
| AC-FEED-025 | `Mute {seller}` ต้องเปิด mute dialog (`Mute {seller}?` + `Mute posts`/`Cancel`); confirm แล้วโพสต์ seller ทั้งหมดหายจาก feed + toast `Muted`; unmute ที่ Settings > Muted accounts หรือ profile |
| AC-FEED-026 | Own-post menu มี `Archive`/`Unarchive`, `Turn off/on commenting`, `Edit` (sold → `View sale record`), `Mark as sold` (เฉพาะ `sale`/`show`/`hide`), `Pin to top of grid`/`Unpin from grid`, `Delete` — ใช้ sheet เดียวกันทุก surface |
| AC-FEED-027 | `Archive` ทำให้โพสต์หลุด feed + profile grid ทันที + ล้าง pins ทุก tab + toast `Post archived`; `Unarchive` คืนตาม eligibility + toast `Post unarchived` โดยไม่คืน pin |
| AC-FEED-028 | Turn off commenting ซ่อน comment button + count ทุก surface (feed/viewer/detail) + toast `Commenting turned off`; Turn on คืนค่าเดิม + `Commenting turned on` |
| AC-FEED-029 | `Edit` เปิด Edit info composer prefilled (ดู AC-FEED-047–049); โพสต์ `sold` ไม่มี Edit — แสดง `View sale record` เปิด sold record page แทน |
| AC-FEED-030 | `Mark as sold` เปิด Sale Record form (`sell:{id}`) โดยตรง — โพสต์ที่ยังไม่ผูก asset ต้อง materialize asset ก่อน; สำเร็จแล้ว `pfkind:"sold"` หลุด feed |
| AC-FEED-031 | `Pin to top of grid` pin โพสต์บน profile grid ของ tab context (สูงสุด 3 ต่อ tab); pin เกินต้องเห็น dialog `Pin limit reached` — Confirm แทนหมุดเก่าสุด; pinned เรียงก่อน (ใหม่สุดหน้าสุด); feedback = `Pinning...` pill + `Your post has been pinned` toast |
| AC-FEED-032 | `Delete` ต้องเห็น dialog `Delete post?` / `This post will be permanently deleted.` — Confirm ลบโพสต์จากทุก surface + toast `Post deleted` ไม่มี undo |
| AC-FEED-033 | Archive page (Settings > Your library > Archive) แสดง archived post grid + note `Only you can see posts you've archived` — owner-only; tile เปิด Post Viewer feed mode |
| AC-FEED-034 | Report จาก feed เปิด report stack ของ Trust & Safety และไม่ทำให้โพสต์หายจาก feed ทันที |
| AC-FEED-035 | Feed render ทั้ง list ครั้งเดียว — ไม่มี infinite scroll, load-more state, pull-to-refresh หรือ end-of-list marker ใน V1 |
| AC-FEED-036 | โหลด feed ไม่สำเร็จต้องแสดง Error State + `ลองใหม่`; offline ต้องแสดง cached data เมื่อมี (contract) |
| AC-FEED-037 | Feed image failure ต้องคง card + placeholder + retry เฉพาะรูป (contract); owner fallback ต้องใช้ `Unknown seller`/`Seller unavailable` เฉพาะเมื่อ owner resolve ไม่ได้ (contract) |
| AC-FEED-038 | V1 ไม่รองรับ real-time feed refresh สำหรับโพสต์ใหม่, like หรือ comment จากอุปกรณ์อื่น |
| AC-FEED-039 | Guest กด `+` (feed header หรือ profile — `[data-flow]` ทุกจุด) ต้องเห็น Member Sheet `Join TukDaeng` — composer ต้องไม่เปิด |
| AC-FEED-040 | `+` บน feed header เปิด composer post mode (title `สร้างโพสต์ใหม่`/`New post` + `แชร์`/`Share`); `+`/`Add asset` บน own profile เปิด asset mode (title `เพิ่มสินทรัพย์ใหม่`/`Add Asset` + Visibility pick + `Add Asset` button) |
| AC-FEED-041 | Step 1 picker = Recents grid photos+clips (clip แสดง duration badge), single-select default, `Select` → multi-pick numbered ≤10 (เกิน → toast `You can add up to 10 photos or clips`); camera/Recents/expand → toast `Not in this prototype yet` |
| AC-FEED-042 | `Next`/`Share`/`Add Asset` disabled จนกว่ามี ≥1 media — media เป็น required เดียว; field อื่นว่างได้หมด |
| AC-FEED-043 | Step 2 = media strip + caption + hashtag chips + option rows; `×` บน thumb ลบ media (create ลบหมดกลับ step 1); แตะ thumb เปิด zoom viewer (clip = playable); chips แทรก tag ลง caption เฉพาะเมื่อยังไม่มี |
| AC-FEED-044 | Option panes ทำงานตาม Composer Fields Rule: location (list+km+search+`×` ลบ), price (digits+comma, ว่าง=showcase), watch details (22 free-text + description), condition (5+4 pick), cost (เฉพาะ asset/drawer ON + date validation), more options (commenting toggle + audience pick) |
| AC-FEED-045 | Post mode `Share` → `insertNewPost` แทรกโพสต์ใหม่บนสุด feed: `pfkind:"post"` (drawer OFF) / `sale` (ON + materialize asset), `type` ตาม price, specGroups ตาม fields + `Price & Data Source` band; feed re-render + scroll top + toast `Posted · shared to feed ✓`/`Clip shared to feed ✓`/`Posted · shared to feed + My Assets ✓`; WA match → toast `Watch alert matched` หน่วง ~2 วินาที |
| AC-FEED-046 | Asset mode `Add Asset` สร้าง drawer record เสมอ: `Show`/`Hide` = drawer-only post ไม่เข้า feed/search (`PF_MINE`); `Post to feed` = feed post `pfkind:"sale"`; ทุก path กลับ own profile grid + toast ตาม visibility |
| AC-FEED-047 | `Edit` เปิด Edit info composer prefilled ที่ step 2 (Cancel/Done ไม่มี Share): media + caption + meta ย้อนจาก post fields, cost จาก linked asset; `+` tile เพิ่ม media ≤10; ลบชิ้นสุดท้าย → toast `Post needs at least 1 photo or clip` |
| AC-FEED-048 | Edit `Done` → `applyPostEdit` อัปเดต post fields + `pfkind` + drawer link (เชื่อมใหม่/ตัด/materialize) + toast `Post updated` + sync ทุก surface + คืน surface เดิม (detail เปิดคืน / viewer คงอยู่) |
| AC-FEED-049 | Edit drawer toggle สะท้อน membership: ON → `Profile status` pick `ขาย`/`โชว์`/`ซ่อน` + Cost row; OFF → `pfkind:"post"`; sold → toggle locked ON disabled; โชว์/ซ่อน หลุด feed หลัง Done |
| AC-FEED-050 | ปิด composer ระหว่างมี draft → discard dialog (create `เริ่มใหม่ใช่ไหม`, edit `ทิ้งการแก้ไข?` เสมอไม่เช็ค dirty); draft ว่าง → ปิดเงียบ; Discard จาก asset mode → กลับ profile |
| AC-FEED-051 | Clip เดียวล้วนใน draft = playable preview + toast `Clip shared to feed ✓` หลัง Share; feed/detail clip autoplay เมื่อเห็น ≥55% พร้อม countdown + progress |
| AC-FEED-052 | `audience:"followers"` ถูกเก็บบนโพสต์แต่ feed ต้องไม่กรองตาม audience ใน V1 (stored-only — deviation) |

# 17. Related Modules

- [00_GLOBAL_RULES_MODULE.md](00_GLOBAL_RULES_MODULE.md)
- [00_NAVIGATION_AND_CROSS_MODULE_FLOW.md](00_NAVIGATION_AND_CROSS_MODULE_FLOW.md)
- [03_SEARCH_FILTER_MODULE.md](03_SEARCH_FILTER_MODULE.md)
- [04_ASSET_MANAGEMENT_MODULE.md](04_ASSET_MANAGEMENT_MODULE.md)
- [05_ASSET_DETAIL_MODULE.md](05_ASSET_DETAIL_MODULE.md)
- [06_PROFILE_MODULE.md](06_PROFILE_MODULE.md)
- [07_CHAT_MODULE.md](07_CHAT_MODULE.md)
- [10_WATCH_ALERT_MODULE.md](10_WATCH_ALERT_MODULE.md)
- [11_SOCIAL_MODULE.md](11_SOCIAL_MODULE.md)
- [13_SETTINGS_MODULE.md](13_SETTINGS_MODULE.md)
- [14_PORTFOLIO_MODULE.md](14_PORTFOLIO_MODULE.md)
- [15_TRUST_SAFETY_MODULE.md](15_TRUST_SAFETY_MODULE.md)

# 18. Future Enhancement

- Personalized ranking / feed recommendation model
- Pull-to-refresh + infinite scroll
- Real-time feed refresh
- Saved feed preferences
- Sponsored listing
- Full-screen media viewer (pinch zoom)
- Composer draft persistence (save draft ข้าม session)
- Real camera/upload + media editing (crop/filter) — prototype ใช้ Recents mock
- Audience `Followers only` enforcement ใน feed/viewer
- `hideCounts` composer control (hide like/view counts per post)
