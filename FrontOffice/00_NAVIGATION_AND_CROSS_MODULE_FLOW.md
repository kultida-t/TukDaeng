# 00 Navigation And Cross-Module Flow

อ้างอิงหลักจาก [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md)

---

# 1. Document Information

| Field | Detail |
| --- | --- |
| Module Name | Navigation And Cross-Module Flow |
| Platform | Mobile Application |
| Version | V1 |
| Status | Draft |
| Owner | Product / UX / Engineering |
| Document Type | Cross-Module Functional PRD - Master Aligned |

# 2. Objective

Navigation And Cross-Module Flow เป็นเอกสารกลางสำหรับกำหนด app shell, layer model, entry point, routing, deep link destination, login-required gate และ cross-module handoff ของแอป TukDaeng

เป้าหมายคือให้ Dev และ QA เข้าใจตรงกันว่าแต่ละ action พาผู้ใช้ไปที่หน้าจอใด ใช้ global state ใด และต้อง fallback อย่างไรเมื่อผู้ใช้เป็น Guest, Asset ถูกลบ, Asset เปลี่ยนสถานะ, User ถูก Block หรือ notification/deep link ชี้ไปยังข้อมูลที่ไม่พร้อมใช้งาน

# 3. Prototype Reference

Source of truth สำหรับพฤติกรรม navigation: `Prototypes/fo-flow/index.html`

- App header ของ feed shell — burger (drawer), search icon, wordmark `TUK DAENG`, ปุ่ม `+` create
- Feed tabs (All Posts / Following / Favorites) — segmented control ใต้ header (รายละเอียดอยู่ 02_FEED)
- Bottom navigation 5 แท็บ (Feed / Chat / Boards / Alerts / Profile) + unread badges
- Hamburger drawer — 9 placeholder rows
- Sub-page layer stack — search, settings, chat, alerts, board, profile, saved/library, report pages
- Post Viewer (`.page-pv`) — immersive viewer 3 modes
- Post Detail (`.page-detail`) — detail layer เหนือ viewer (asset-detail equivalent)
- Bottom sheets (comments / likes / post menu / share / save / wishlist / watch alert / mute-follow) + center dialogs
- Member Sheet `Join TukDaeng` — guest gate
- Report flow — full-page multi-step stack

# 4. Master Alignment Summary

| Area | Master Baseline |
| --- | --- |
| App shell | Bottom nav 5 แท็บ (Feed / Chat / Boards / Alerts / Profile); Search และ Create เป็น header entries ไม่ใช่ nav tab |
| Destination model | Post Detail (`.page-detail`) = asset-detail equivalent; Post Viewer (`.page-pv`) = immersive viewer — ไม่มี "Asset Detail" แยกเป็น page ของตัวเอง |
| Feed navigation | Feed card tap media = carousel เท่านั้น; เข้า Post Detail ผ่าน `Tap for details` → `View full detail`; owner area เปิด Public Profile |
| Comment surface | Comment เปิดผ่าน shared bottom sheet จากทุก surface (feed card / viewer / detail) — ไม่บังคับผ่าน detail |
| Guest restriction | Guest ใช้ action ที่ต้องมีตัวตนต้องเห็น Member Sheet `Join TukDaeng` — รวม Share ทุก surface (S-03: share ต้อง login) |
| Watch Alert notification | เปิด Notification แล้วไป Post Viewer ของ Asset ที่ match โดยตรง ไม่มี Result List คั่น |
| Notification types | Like, Comment, Follow, Watch Alert + System (security — placeholder destination) |
| Chat persistence | Chat ยังอยู่เมื่อ Asset ถูกลบหรือ Sold |
| Deleted asset | Post Detail แสดง `รายการนี้ไม่พร้อมใช้งานแล้ว` (contract — prototype แสดงเฉพาะ toast/empty state) |
| Block impact | Block ต้องซ่อน asset จาก Feed/Search/Watch Alert Result ไม่ใช้ Follow relation; blocked profile แสดงหน้าโปรไฟล์ที่ grid ว่าง + ปุ่ม Unblock (IG keep-page) |
| Menu scope | Drawer 9 รายการเป็น future/placeholder — แถวดูใช้งานได้แต่กดแล้ว toast ไม่ใช่ route จริง |

# 5. Scope

## In Scope

- App shell และ navigation layer model (root feed / sub-page stack / post viewer / post detail / sheets / dialogs)
- Bottom navigation tabs + badges + tab behavior
- App header entries (drawer, search, create) และ hamburger drawer
- Cross-module entry points
- Deep link destinations (contract — prototype ไม่ครอบ)
- Notification destinations
- Login-required gate routing (Member Sheet)
- In-app back stack behavior
- Deleted / unavailable fallback
- Blocked user fallback
- Feed to Detail / Profile / Viewer handoff
- Watch Alert notification to post viewer handoff
- Chat context handoff
- Trust & Safety entry points
- Menu scope decision notes

## Out Of Scope

- Visual design of navigation components
- Native OS routing implementation
- Push notification technical payload contract
- Back Office navigation
- Future services not in master baseline
- เนื้อหาภายใน sub page แต่ละหน้า (อยู่ใน module spec ของตัวเอง)

# 6. App Shell & Navigation Model

## 6.1 Canonical Destination Terms

นิยามชื่อ destination ที่ใช้ร่วมกันทุก module spec — module specs ที่ยังใช้คำว่า `Asset Detail` ให้อ่านเป็น Post Detail ตาม mapping นี้ (rename เป็น scope ของ task แต่ละ module)

| Spec Term | Prototype Layer | นิยาม |
| --- | --- | --- |
| Feed / Feed Shell | root `.screen` (`.feed-scroll` + `.bottom-nav`) | social post feed — post-centric (โพสต์ `Sale` + `post` ตาม 00_GLOBAL §10) — mount ตลอดอยู่ล่างสุด |
| Post Detail | `.page-detail` overlay | detail layer ของโพสต์ — asset-detail equivalent (specs, price, descriptions, actions, watch-alert entry); เดิมใน spec เรียก `Asset Detail` |
| Post Viewer | `.page-pv` overlay | immersive full-screen viewer แบบ IG (scroll snap แนวตั้ง) 3 modes: `default` (grid/search/notification), `feed` (saved/wishlist/archive), `pfp` (profile grid) |
| Sub Page | `.page-sub` + `_subStack` | pushed pages ทั้งหมดนอก feed shell (ดู route map §6.6) |
| Bottom Sheet | `.comment-sheet` + `.sheet-backdrop` | sheet กลางที่ share ทุก surface: comments, likes, post menu, share, save, wishlist, watch alert, mute/follow |
| Dialog | `.dlg` | center dialog (confirm/alert) |
| Member Sheet | `.ob` (gate variant) | guest gate `Join TukDaeng` — นิยามเต็มที่ 00_GLOBAL §11 |
| Report Stack | `.page-sub` + `rp-over` | report pages ทับ stack ปกติ — X ปิดทั้งกอง, `<` slide กลับ |

## 6.2 Layer Model

แอปมี root feed screen เดียว + overlay layers เรียงจากล่างขึ้นบน:

| Layer | Open | Close | หมายเหตุ |
| --- | --- | --- | --- |
| Root feed shell | mount ตลอด | — | bottom nav แสดงเฉพาะเมื่อไม่มี overlay layer เปิด (`sub-open` / `detail-open` / `pv-open` ซ่อน bottom nav) |
| Sub Page (`.page-sub`) | `openSub` (root page) / `pushSub` (push ทับ) | `sub-back` pop ทีละหน้า | nav-tab root เปิดแบบ swap ทันทีไม่ slide; push ทับ slide จากขวาและหน้าก่อนค้างเป็น ghost; `report:pick` เลื่อนขึ้นจากล่าง |
| Report Stack (`rp-over`) | `rpOpenFromPost` จาก post menu / chat | `sub-x` ปิดทั้งกอง / `sub-back` slide ออกขวา | ทับ layer ปกติรวม post viewer |
| Post Viewer (`.page-pv`) | `openPostViewer` | `pv-back` | เปิดจาก grid tiles / notifications เท่านั้น — ไม่เปิดจาก feed card โดยตรง |
| Post Detail (`.page-detail`) | `openPostDetail` | `detail-back` | อยู่เหนือ viewer — detail-back เผย viewer ที่ mount ค้างอยู่ข้างล่าง |
| Bottom Sheet | `openSheet` | backdrop tap / close control | comments, likes, post menu, share, save, wishlist, watch alert |
| Dialog | `openDlg` | action / dismiss | topmost |
| Member Sheet | `obGate` | scrim tap / auth success | guest gate — ทับทุก layer |

## 6.3 Bottom Navigation

Bottom nav 5 แท็บ เรียงซ้าย→ขวา (render ซ้ำในแต่ละ sub page shell — chat / alerts / board / profile มี nav ของตัวเอง):

| # | Tab | TH Label | Destination | Badge |
| --- | --- | --- | --- | --- |
| 1 | Feed | ฟีด | root feed shell | — |
| 2 | Chat | แชท | Chat List (`chat` sub page) | unread รวมทุก thread — cap `99+` |
| 3 | Boards | กระดานข่าว | Board home (`board` sub page) | — |
| 4 | Alerts | แจ้งเตือน | Alerts center (`alerts` sub page) | unread alerts — cap `99+` |
| 5 | Profile | โปรไฟล์ | Own profile (`profile:{me}` sub page) | — |

Tab behavior:

- กด Chat / Boards / Alerts / Profile → เปิด sub page ทับ feed **แบบ swap ทันที ไม่มี slide animation** (IG behavior — nav-tab pages replace กัน)
- กด Feed → เคลียร์ sub stack ทั้งหมดกลับ feed shell
- กด Feed ซ้ำตอนอยู่ feed อยู่แล้ว → refresh list + smooth scroll to top (IG behavior)
- กด Boards → board เปิดใหม่พร้อม search state ว่างเสมอ
- Active state ไฮไลต์แท็บของ page ที่กำลังแสดง; ดู public profile ของคนอื่นไม่ไฮไลต์ Profile tab
- Guest gate: แท็บ Chat / Alerts / Profile เป็น login-required — guest กดแล้วเปิด Member Sheet `Join TukDaeng`; Feed / Boards ใช้ได้เสรี
- แท็บทำงานบน surface ล่างสุดเสมอ — เปิดจาก sub page ที่มี nav ของตัวเองจะ swap root page ใหม่ (ไม่ stack ทับกัน)

## 6.4 App Header (Feed Shell)

App header อยู่เฉพาะ feed shell เท่านั้น:

| Control | Action | Guest |
| --- | --- | --- |
| Burger | เปิด hamburger drawer (§6.5) | ใช้ได้ |
| Search icon | เปิด Search sub page (`search`) | ใช้ได้ — Search เป็น header entry ไม่ใช่ nav tab |
| Wordmark `TUK DAENG` + caret | brand menu (design variant `ft:"none"` เท่านั้น — dead variant ใน prototype, ไม่ใช่ spec feature) | — |
| `+` | เปิด Create composer (post / asset modes — รายละเอียด 02_FEED / 04_ASSET_MANAGEMENT) | gated → Member Sheet |

Feed tabs (All Posts / Following / Favorites) เป็น segmented control ใต้ header — scope 02_FEED; guest กดได้ทุก tab เห็น empty state (S-16)

Prototype artifacts ที่ห้ามเขียนเป็น feature: status bar mock, home indicator, dev buttons (`themeToggle`, `obReplay`, `obRecon`), `?dev` param, `PFO_SIMS`, `POST_DETAIL_CFG`, design variants (card `a2/b2/c2/a3/b3/c3/mixed`, `ft:"none"` brand menu, `data-nav` icons variant)

## 6.5 Hamburger Drawer

- Burger ใน app header → drawer panel เลื่อนเข้าจากขอบจอ + scrim — แตะ scrim ปิด
- มี 9 รายการ — **ทุกรายการเป็น future/placeholder**: แสดงเป็นแถวปกติพร้อม icon + label + chevron (ดูใช้งานได้) แต่กดแล้ว toast `Not in this prototype yet` — ไม่มี route จริง ไม่มี disabled/future marking บน UI
- รายการอยู่ที่ §11 Menu Scope Rules
- ต่างจาก contextual menus อื่นที่ทำงานจริง: board burger = category filter sheet, chat room `...` = room menu — ทั้งสองไม่ใช่ placeholder

## 6.6 Sub-Page Route Map

Route names ของ `.page-sub` stack (prototype `subHTML`) — ใช้เป็นชื่ออ้างอิงกลางใน module specs:

| Group | Routes |
| --- | --- |
| Create / Search | `create`, `search`, `sfilter`, `recents` |
| Board | `board`, `boardsearch`, `boardall`, `boardart:{id}` |
| Alerts | `alerts`, `walerts` |
| Chat | `chat`, `chatitem:{id}`, `chatroom:{id}`, `chmenu:{id}`, `chmedia:{id}`, `chatcfg`; `chsettings:{id}` = dead route ไม่มี entry (prototype artifact) |
| Saved / Library | `saved`, `savedcol`, `archive`, `wishlist`, `wishcol`, `interested`, `ni` |
| Settings & Account | `settings`, `about_account`, `change_pwd`, `del_account`, `lang`, `theme`, `notif_settings`, `favorites`, `muted`, `blocked`, `prefs`, `sensitive`, `help`, `privacy`, `terms`, `about_app` |
| Report | `report`, `report:user`, `report:post`, `report:pick:{user}`, `report:posts:{user}`, `report:done:{user}` |
| Profile | `profile:{user}`, `pfollow:{user}:{tab}`, `about:{user}`, `pedit`, `portfolio`, `pfasset:{id}`, `soldhist`, `sold:{id}`, `sell:{id}` |

Entry notes:

- `settings` เข้าผ่าน profile menu (`.pf-menu`) เท่านั้น — ไม่มี settings button อื่นที่ใช้งานได้ (`.set-btn` เป็น dead handler)
- `alerts` เข้าผ่าน bottom-nav tab เท่านั้น; `walerts` เข้าผ่าน Settings > Watch Alerts / search bell / post detail bell
- Guest gate: routes ที่ผูกกับ gated entries ต้องไม่เข้าถึงได้โดย guest (tab/search/sheet ที่เปิดมันถูก gate ก่อนแล้ว)

## 6.7 In-App Back Behavior

Back ในแอปใช้ `.sub-back` ตัวเดียวจัดการทุก sub page:

| Context | Back Behavior |
| --- | --- |
| Sub stack มี 1 page | pop → ปิด `.page-sub` layer กลับ surface ข้างล่าง |
| Sub stack มี >1 page (profile / pfollow / chat / chmenu / chsettings / report) | slide ออกขวา (IG pop) — หน้าก่อนค้างอยู่ข้างล่างไม่ re-slide |
| Saved / Wishlist / collection pages | unwind inner mode ก่อน pop — `search` → `menu` → `cover` → `edit` → `add` → `allmenu` → `allposts` → `manage` แล้วค่อยออกจาก page |
| `sfilter` | back ทิ้ง filter draft (Apply เท่านั้นที่ commit) |
| `search` mode `results` | back กลับ landing (explore) ไม่ pop page |
| `del_account` step 2 | back กลับ step 1 |
| `pfollow:` (followers/following) | slide ออกขวา + restore profile scroll position |
| Alerts page back button | กลับ Feed เสมอ (`data-navgo="feed"` — ไม่ใช่ generic pop) |
| `.detail-back` | ปิด Post Detail — Post Viewer ที่เปิดอยู่ข้างล่างยังอยู่ |
| `.pv-back` | ปิด Post Viewer กลับ surface ที่เปิดมัน |
| `.sub-x` (report) | ปิด report stack ทั้งกองในครั้งเดียว คงหน้าที่เปิด report ไว้ |

# 7. Cross-Module Entry Point Matrix

| Source | Action | Destination | Rule |
| --- | --- | --- | --- |
| Feed | Tap post media | carousel ซ้าย/ขวาใน card เดิม | ไม่มี navigation — ไม่มี full-screen image viewer ใน V1 |
| Feed | `Tap for details` → `View full detail` | Post Detail | โพสต์ต้อง visible ต่อ current user |
| Feed | Tap owner avatar / name / caption owner | Public Profile (`profile:{user}` push) | Blocked → IG keep-page (§10) |
| Feed | Tap Like / Comment count / Share / Save / liked-by row | bottom sheet ตาม action | guest → Member Sheet (S-03: share gated); comment = shared comment sheet |
| Feed | `...` post menu | own / others post menu sheet | guest → Member Sheet |
| Feed | Ask Seller pill | Chat room (item-scoped) | guest → Member Sheet; own post / blocked → toast ตาม 07_CHAT |
| Feed | Search icon (header) | Search sub page | ใช้ได้เสรีรวม guest |
| Feed | `+` (header) | Create composer (post / asset) | guest → Member Sheet |
| Feed | Burger (header) | Hamburger drawer | ใช้ได้เสรี |
| Search landing / results | Tap explore / result tile | Post Viewer | tile เป็น photo grid — เปิด viewer โดยตรง |
| Search results | `sr-wa` bell | Watch Alert sheet | guest → Member Sheet |
| Public Profile | Tap grid tile | Post Viewer (pfp mode) | เห็นเฉพาะ `Sale`/`Show` ตาม visibility matrix |
| Public Profile | Follow / message / share / QR / menu | action ตาม profile spec | guest → Member Sheet |
| Saved / Wishlist / Archive tile | Tap | Post Viewer (feed mode) | member-only surfaces |
| Post Viewer | `View full detail` (details sheet) | Post Detail — slide ทับ viewer | detail-back กลับ viewer |
| Post Viewer | rail actions (like / comment / share / save / `...`) | bottom sheets | guest → Member Sheet |
| Post Detail | Ask Seller / contact owner | Chat room | guest → Member Sheet |
| Post Detail | `mf-btn` Follow this model | Watch Alert sheet | guest → Member Sheet |
| Post Detail | `wl-btn` | Wishlist sheet | guest → Member Sheet |
| Chat room | View asset / item card | Post Detail | โพสต์ไม่มีแล้ว → toast `Listing detail isn't in this prototype yet` (contract: unavailable state); chat ยังอยู่เมื่อ asset deleted/sold |
| Board home / list | Tap article card | Article Detail (`boardart:{id}`) | ใช้ได้เสรีรวม guest (read-only) |
| Article Detail | Share / like / save / report | sheets / report flow | guest → Member Sheet (S-03) |
| Alerts | Tap row | ตาม §8 destination matrix | แท็บ gated สำหรับ guest อยู่แล้ว |
| Alerts | Back button | Feed | เสมอ — ไม่ใช่ pop |
| Own Profile | `+` / empty-state CTA | Create composer (asset mode) | member only |
| Own Profile | menu (`pf-menu`) | Settings sub page | member only — guest ไม่มี own profile |
| Report entry (post menu / profile / chat) | Report | Report stack (`report` / `report:pick`) | guest → Member Sheet; X ปิดทั้งกอง |

# 8. Notification Destination Rules

Alerts tab (`alerts` sub page) — แตะ row แล้ว mark read + sync badge ทันที:

| Notification Type | Destination | Notes |
| --- | --- | --- |
| Like | Post Viewer — โพสต์ของตัวเอง 1 ใบ (header `Post` / username) | โพสต์หายแล้ว → unavailable state `รายการนี้ไม่พร้อมใช้งานแล้ว` + `Go back` (§10 — ไม่ใช่ toast) |
| Comment | Post Viewer — โพสต์ของตัวเอง 1 ใบ | เหมือน Like — comment ไม่ focus/deep-scroll ใน V1; โพสต์หาย → unavailable state เดียวกัน |
| Follow | Public Profile — `rpPush("profile:{user}")` | blocked/unavailable → fallback ตาม §10 |
| Watch Alert | Post Viewer — โพสต์ที่ match โดยตรง | ไม่มี Result List คั่นใน V1; โพสต์หาย → unavailable state parity กับ like/comment (resolved FSP-030) |
| System | placeholder — ไม่มี destination ใน V1 | security alert type (`A new device just logged in...`); prototype tap = toast `Security details aren't in this prototype yet`; destination contract อยู่ 09_NOTIFICATION |

Follow row เท่านั้นที่มี dismiss (X) + `Follow back` button — รายละเอียด UI อยู่ 09_NOTIFICATION; Mark all as read อยู่บน section header แรก

Notification types outside this list are not in V1 unless master is updated

# 9. Login-Required Gate Routing

Guest (session `guest`) ใช้ action ที่ต้องมีตัวตนต้องแสดง Member Sheet `Join TukDaeng` แบบ guest gate — นิยาม sheet, copy, actions และ capabilities เต็มอยู่ที่ [00_GLOBAL_RULES_MODULE.md](00_GLOBAL_RULES_MODULE.md) §11 (เดิมเรียก Global Login Required Dialog — surface เดียวกัน)

Gate triggers ที่เกี่ยวกับ navigation:

- Bottom-nav tabs: Chat / Alerts / Profile
- Header `+` create composer
- Share ทุก surface — feed, post viewer, post detail, profile grid, article, share profile/QR (S-03: share ต้อง login ทุกจุด)
- Social actions ทั้งหมด (like, comment surface actions, save, wishlist, follow, mute, not-interested, post menus, report, block)
- Chat entries ทุกจุด (Ask Seller, chat item, room actions)
- Watch Alert create / manage (`sr-wa`, `mf-btn`, walerts settings)
- Settings entry (profile menu) และ surfaces ภายใต้
- Profile actions (edit, follower/following rows, unblock)

Gate actions:

| Action | Destination |
| --- | --- |
| Sign up / social | Authentication flow → session `new` หรือ `member` ตามบัญชี |
| Sign in | Authentication Sign In → `member` หรือ `new` |
| Skip for now / scrim tap | ปิด sheet กลับ surface เดิม ไม่มี side effect — เปิดใหม่ทุกครั้งที่ guest กด gated action |

# 10. Unavailable Fallback Rules

| Case | Destination / Fallback |
| --- | --- |
| Deleted Asset deep link | Post Detail unavailable state with `รายการนี้ไม่พร้อมใช้งานแล้ว` (contract — prototype แสดง toast `This post is no longer available` / `Article not found` / `Chat not found` ตาม surface) |
| Sold Asset from public surface | Public list should not show it; stale deep link shows Permission Denied / Unavailable state (non-owner) or Owner-only Sold detail (owner) |
| Hide Asset from public surface | Public list should not show it; stale deep link shows Permission Denied / Unavailable state (non-owner) or Owner-only detail (owner) |
| Blocked Profile | IG keep-page — profile แสดงปกติแต่ grid ว่าง (`No posts yet`) + ปุ่ม Unblock แทน Follow (S-13); ไม่ใช่ unavailable state แยก |
| Blocked Asset owner | Asset hidden from Feed, Search and Watch Alert matching; direct deep link shows Unavailable / blocked state |
| Deleted Asset from Chat | Chat remains, asset preview opens Post Detail หรือ unavailable state |
| Unpublished / Deleted Article deep link | Article Detail unavailable state with `บทความนี้ไม่พร้อมใช้งานแล้ว` |
| Invalid Article deep link | Article Not Found state |

Unavailable / permission fallback screen CTA:

- Primary CTA label ต้องใช้ `Go back`
- Behavior: ถ้ามี navigation history ให้กลับไปหน้าก่อนหน้าที่ user เข้ามา เช่น Feed, Public Profile หรือ Chat
- ถ้าไม่มี navigation history เช่น เปิดจาก external deep link โดยตรง ให้ fallback ไป Feed
- ห้ามใช้ label เฉพาะทาง เช่น `Back to feed` บน shared fallback screen เว้นแต่ entry point นั้นรู้แน่นอนว่ามาจาก Feed เท่านั้น

# 11. Menu Scope Rules

The following menu items are outside current master baseline and must not be treated as implemented V1 modules without product decision:

- Watch Brands
- Watch Price Index
- Watch Shops
- Accessories Shop
- Repair Shop
- Auction Center
- Consignment Center
- Authentication Center
- Community, if it means more than Board/Social scope

These items may exist only as clearly marked future-phase placeholders and must not be active routes in V1

Prototype note: the locked `fo-flow` prototype renders the hamburger/drawer menu with all 9 items present but unwired — tapping any of them shows a placeholder toast (`Not in this prototype yet`). Drawer rows แสดงเหมือนใช้งานได้ (icon + label + chevron ไม่มี marking) — นี่คือ placeholder pattern ของ prototype: enabled-looking rows + dead-tap toast. In V1 they are documented as future/placeholder menu rows only; no module spec defines their behavior

Prototype-only artifacts (ไม่ใช่ spec feature): design variants ใน prototype เช่น card `a2/b2/c2/a3/b3/c3/mixed`, `ft:"none"` brand menu, `data-nav` icon variants เป็น dead variants; เช่นเดียวกับ dev buttons, demo account/OTP, `?dev` param, `PFO_SIMS` และ `POST_DETAIL_CFG` — เป็น prototype tooling เท่านั้น ห้าม spec เป็น product feature

# 12. Deep Link Rules

**Contract-only (S-29): prototype ไม่ครอบ deep link เลย** — ไม่มี URL routing; share = in-app share sheet mock (friend grid + app row) + toast `Link copied`; profile link `https://tukdaeng.app/u/{user}` มีแค่เป็น text สำหรับ QR/copy; `?dev` param เป็น dev preview artifact — rules ทั้งหมดในหัวข้อนี้เป็น production contract

- Every deep link must validate authentication, permission, asset status, block relationship, and deletion state before rendering the target
- Every app entry, foreground resume, deep link, and notification route must validate account status before rendering authenticated destinations; `Suspended` and `Banned` users must be redirected to the account status state
- Deep links to login-required surfaces from Guest must show Member Sheet `Join TukDaeng` or Sign In
- Deep links to unavailable Asset must not crash or show stale private data
- Deep links from push notification must use the notification destination matrix
- Deep link ของ Asset สถานะ `Hide` หรือ `Sold` ที่เปิดโดย non-owner ต้องแสดง Permission Denied / Unavailable state ไม่ใช่เปิด private detail
- Owner เปิด deep link ของ Asset ตัวเองที่ `Hide` หรือ `Sold` ต้องแสดง Owner-only detail
- Deep link ของ Article ที่ถูก unpublish, deleted หรือ invalid ID ต้องแสดง Article Unavailable / Not Found state ไม่ใช่เปิดเนื้อหา
- Admin เปิด deep link ของ Article ตัวเองที่ถูก unpublish ต้องเห็น Article Detail พร้อม admin preview note

# 13. Back Button And Main Navigation After Deep Link

เมื่อหน้าจอเปิดจาก external deep link (ไม่มี in-app navigation history) ต้องจัดการ back button และ main navigation ดังนี้ (contract — ส่วน in-app back stack ดู §6.7):

## Back Button บน Normal Screen

- ถ้ามี in-app navigation history ให้ back button กลับไปหน้าก่อนหน้าตามปกติ
- ถ้าไม่มี navigation history (เปิดจาก external deep link โดยตรง) ให้ back button fallback ไป Feed
- ห้ามปิด app หรือแสดงหน้าจอว่างเปล่าเมื่อกด back button จากหน้าที่เปิดจาก external deep link
- กฎนี้ใช้กับทุก screen ที่เปิดจาก deep link เช่น Post Detail, Public Profile, Article Detail

## Back Button บน Error / Unavailable State

- ใช้ rule เดียวกับ Unavailable Fallback Rules: primary CTA `Go back`
- ถ้ามี navigation history ให้กลับหน้าก่อนหน้า
- ถ้าไม่มี navigation history (external deep link) ให้ fallback ไป Feed

## Main Navigation หลังเปิด Deep Link

- หลังเปิด deep link ทั้ง Guest และ Login user ต้องใช้งาน main navigation (bottom tab / menu) ต่อได้ เพื่อเข้าถึง Feed, Search, Profile, Alerts และ surface อื่น ๆ ตามสิทธิ์
- ห้ามล็อก user อยู่ในหน้าเดียวหลังเปิด deep link โดยไม่มีทางออกนอกจาก back button
- Guest ที่เปิด deep link แล้วใช้ main navigation ต้องเจอ Member Sheet `Join TukDaeng` เมื่อกด login-required surface เช่นเดียวกับการเข้าผ่าน entry point ปกติ

# 14. Analytics Events

(contract — prototype ไม่มี tracking layer)

| Event | Trigger |
| --- | --- |
| `nav_tab_selected` | User taps a bottom-nav tab |
| `nav_feed_to_post_detail` | `View full detail` opens Post Detail |
| `nav_post_viewer_opened` | Post Viewer opens from grid / notification |
| `nav_feed_to_public_profile` | Feed owner area opens Public Profile |
| `nav_notification_opened` | User opens notification |
| `nav_notification_destination_resolved` | App resolves notification destination |
| `nav_member_sheet_opened` | Guest triggers login-required action |
| `nav_deep_link_unavailable_asset` | Deep link points to unavailable asset |
| `nav_blocked_destination_shown` | Blocked/unavailable fallback shown |
| `nav_future_menu_tapped` | User taps future/placeholder drawer item |

# 15. Validation Rules

- Every route to Post Detail / Post Viewer must validate post availability and visibility
- Every route to Public Profile must validate block relationship
- Every route to Chat must validate authentication (guest → Member Sheet)
- Every notification route must map to one approved destination
- Every bottom-nav tab that is login-required must gate before opening the sub page
- Every drawer item outside baseline must remain a placeholder row (ไม่ใช่ active route)

# 16. Exception Handling

| Case | Expected Handling |
| --- | --- |
| Notification target deleted | Toast / unavailable state — ไม่ crash |
| Notification type unsupported | Do not render as active V1 notification type (System type = placeholder destination) |
| Deep link requires Login | Show Member Sheet `Join TukDaeng` or Sign In |
| Account suspended or banned | Clear/reject authenticated route and show account status state (contract) |
| Destination blocked | Show blocked keep-page (profile) หรือ unavailable fallback (asset) |
| Drawer item tapped | Show placeholder toast only — no navigation |
| Route validation fails | Stay on current screen or show safe error state |

# 17. Acceptance Criteria

| ID | Criteria |
| --- | --- |
| AC-NAV-001 | Post Detail opens via `Tap for details` → `View full detail` — feed card media tap = in-card carousel only |
| AC-NAV-002 | Feed owner area (avatar / name / caption owner) opens Public Profile |
| AC-NAV-003 | ไม่มี Full Screen Image Viewer ใน V1 — feed media tap = carousel เท่านั้น |
| AC-NAV-004 | Comment เปิดผ่าน shared bottom sheet ได้จาก feed card, post viewer และ post detail — ไม่บังคับผ่าน detail; composer input เป็น contract (prototype view-only) |
| AC-NAV-005 | Guest login-required actions show Member Sheet `Join TukDaeng` (gate mode) |
| AC-NAV-006 | Like notification opens Post Viewer of the own post |
| AC-NAV-007 | Comment notification opens Post Viewer of the own post |
| AC-NAV-008 | Follow notification opens Public Profile |
| AC-NAV-010 | Watch Alert notification opens Post Viewer of the matched post directly — no Result List in V1 |
| AC-NAV-011 | Deleted Asset deep link shows `รายการนี้ไม่พร้อมใช้งานแล้ว` (contract) |
| AC-NAV-012 | Chat remains accessible when related Asset is deleted or Sold |
| AC-NAV-014 | Blocked users/assets do not render in Feed, Search or Watch Alert matching; blocked profile renders keep-page with empty grid + Unblock |
| AC-NAV-015 | Drawer items outside master baseline render as enabled-looking placeholder rows — tap shows placeholder toast, never an active route |
| AC-NAV-016 | Deep links validate auth, permission, asset status, deletion and block state before rendering (contract) |
| AC-NAV-016A | Deep link ของ Asset `Hide` หรือ `Sold` ที่เปิดโดย non-owner ต้องแสดง Permission Denied / Unavailable state ไม่ใช่เปิด private detail (contract) |
| AC-NAV-016B | Owner เปิด deep link ของ Asset ตัวเองที่ `Hide` หรือ `Sold` ต้องแสดง Owner-only detail (contract) |
| AC-NAV-016C | เมื่อหน้าจอเปิดจาก external deep link โดยไม่มี navigation history แล้วกด back button ต้อง fallback ไป Feed ไม่ใช่ปิด app หรือแสดงหน้าว่าง (contract) |
| AC-NAV-016D | หลังเปิด deep link ทั้ง Guest และ Login user ต้องใช้งาน main navigation ต่อได้ และ Guest ที่กด login-required surface ต้องเจอ Member Sheet `Join TukDaeng` (contract) |
| AC-NAV-016E | Deep link ของ Article ที่ถูก unpublish, deleted หรือ invalid ID ต้องแสดง Article Unavailable / Not Found state ไม่ใช่เปิดเนื้อหา (contract) |
| AC-NAV-016F | Admin เปิด deep link ของ Article ตัวเองที่ถูก unpublish ต้องเห็น Article Detail พร้อม admin preview note (contract) |
| AC-NAV-017 | Bottom nav มี 5 แท็บตามลำดับ Feed / Chat / Boards / Alerts / Profile — tab Chat/Boards/Alerts/Profile เปิด sub page แบบ swap ทันทีไม่ slide |
| AC-NAV-018 | กด Feed tab เคลียร์ sub stack กลับ feed; กด Feed ซ้ำตอนอยู่ feed แล้ว refresh list + scroll to top |
| AC-NAV-019 | Unread badge บน Chat / Alerts tab แสดงจำนวนรวมและ cap ที่ `99+` |
| AC-NAV-020 | Guest กด tab Chat / Alerts / Profile ต้องเจอ Member Sheet ก่อน — Feed และ Boards ใช้ได้เสรี |
| AC-NAV-021 | Search เป็น header icon → sub page (ไม่ใช่ nav tab); Create เป็น header `+` → composer (guest gated) |
| AC-NAV-022 | Hamburger drawer มี 9 placeholder rows (Watch Brands, Watch Price Index, Watch Shops, Accessories Shop, Repair Shop, Auction Center, Consignment Center, Authentication Center, Community) — ทุกแถวกดแล้ว toast |
| AC-NAV-023 | Pushed sub page slide จากขวา; deep-stack back (`sub-back`) slide ออกขวา; report `sub-x` ปิด stack ทั้งกอง; `detail-back` ปิด Post Detail เผย Post Viewer ข้างล่าง |
| AC-NAV-024 | Alerts back button กลับ Feed เสมอ (ไม่ใช่ generic pop) |
| AC-NAV-025 | Share ทุก surface (feed / viewer / detail / profile grid / article / share profile) ต้อง login — guest เห็น Member Sheet |
| AC-NAV-026 | Post Viewer เปิดจาก grid tiles (explore / search results / profile / saved / wishlist / archive) และ notification เท่านั้น — ไม่เปิดจาก feed card โดยตรง |

# 18. Related Modules

- [00_GLOBAL_RULES_MODULE.md](00_GLOBAL_RULES_MODULE.md)
- [01_AUTHENTICATION_MODULE.md](01_AUTHENTICATION_MODULE.md)
- [02_FEED_MODULE.md](02_FEED_MODULE.md)
- [03_SEARCH_FILTER_MODULE.md](03_SEARCH_FILTER_MODULE.md)
- [05_ASSET_DETAIL_MODULE.md](05_ASSET_DETAIL_MODULE.md)
- [06_PROFILE_MODULE.md](06_PROFILE_MODULE.md)
- [07_CHAT_MODULE.md](07_CHAT_MODULE.md)
- [09_NOTIFICATION_MODULE.md](09_NOTIFICATION_MODULE.md)
- [10_WATCH_ALERT_MODULE.md](10_WATCH_ALERT_MODULE.md)
- [11_SOCIAL_MODULE.md](11_SOCIAL_MODULE.md)
- [12_BOARD_MODULE.md](12_BOARD_MODULE.md)
- [13_SETTINGS_MODULE.md](13_SETTINGS_MODULE.md)
- [15_TRUST_SAFETY_MODULE.md](15_TRUST_SAFETY_MODULE.md)

# 19. Future Enhancement

- Formal deep link payload contract + implementation (prototype: mock share sheet only)
- Push notification payload contract
- Route guard technical spec
- Future service menu taxonomy (drawer destinations)
- System notification destination surface
- Back Office navigation map
