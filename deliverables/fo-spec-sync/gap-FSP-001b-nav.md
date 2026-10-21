# FSP-001b — Gap Inventory: Navigation / Drawer / Global Shell

วันที่สแกน: 21 ต.ค. 2026
Source of truth: `Prototypes/fo-flow/index.html` (read-only, ~23k บรรทัด — bottom nav ~16788–16800, drawer ~19379–19394 + i18n ~19683–19698, nav wiring ~21274–21302, sub-page stack ~14783–14945 + subHTML route table ~17151–17583, guest gate ~22996–23011, alerts click ~17776–17825)
เทียบกับ: `FrontOffice/00_NAVIGATION_AND_CROSS_MODULE_FLOW.md` + `FrontOffice/00_GLOBAL_RULES_MODULE.md`

---

## A. Prototype มี แต่ Spec 00 ไม่มี (→ ต้องเพิ่มใน spec ตอน FSP-010/011)

### A1. Bottom navigation bar 5 แท็บ (spec ไม่มีโครง bottom nav เลย)
- `botNavHTML()` แท็บ: **Feed / Chat / Boards / Alerts / Profile** (TH: ฟีด/แชท/กระดานข่าว/แจ้งเตือน/โปรไฟล์) — `data-navgo` span ใน `.bottom-nav` ที่ render ซ้ำในแต่ละ sub page (chat/alerts/board/profile เรียก botNavHTML ของตัวเอง)
- Unread badge บน Chat (`chBadgeHTML`, รวม unread ทุก thread) และ Alerts (`alBadgeHTML`) — cap "99+"
- พฤติกรรมแท็บ: กด Chat/Boards/Alerts/Profile → `openSub(scr, name, swap=true)` — เปิดเป็น sub page ทับ feed **แบบ swap ทันที ไม่มี slide** (comment ใน CSS: "nav-tab swap (IG behavior) — bottom-nav pages replace instantly"); กด Feed → เคลียร์ `_subStack` กลับ feed; **กด Feed ซ้ำตอนอยู่ feed แล้ว = refresh list + scroll to top** (IG behavior)
- spec 00_NAV §7 มีแค่ตาราง "Primary Navigation Surfaces" (Feed/Search/Add Asset/Notifications/Profile/Settings/Chat/Board/Portfolio/Watch Alert) — ไม่ระบุว่ามี bottom nav, จำนวนแท็บ, ลำดับ, badge หรือ tab behavior เลย → ต้องเขียน section ใหม่ทั้งก้อน (FSP-011)

### A2. Hamburger drawer 9 รายการ — dead ทั้งหมด
- `.hb-btn` (burger ใน app-header) → `.hb-open` panel เลื่อนจากขอบ, scrim แตะปิด
- รายการ: Watch Brands, Watch Price Index, Watch Shops, Accessories Shop, Repair Shop, Auction Center, Consignment Center, Authentication Center, Community — **ทุกรายการกดแล้ว toast "Not in this prototype yet"** (dead handler)
- ลูกศร chevron ทุกแถว ดูเหมือนใช้งานได้จริง (ไม่มี disabled/future badge)
- spec §12 Menu Scope Rules ระบุแค่ **7 รายการ** — ขาด "Watch Brands" และ "Watch Price Index" ที่ prototype เพิ่มมา (และ Price Index อาจผูกกับข้อมูลตลาดใน portfolio — ต้องตัดสินว่า in-scope/future)
- spec บอกให้ "mark future/placeholder" — prototype แสดงเป็นแถวปกติที่กดแล้ว toast, ไม่มี marking บน UI

### A3. App header (feed shell)
- `.app-header`: burger (drawer) + แว่นขยาย search + wordmark "TUK DAENG" พร้อม caret + ปุ่ม `+` (`data-flow="create"` → composer)
- wordmark caret เปิด `brand-menu` dropdown เฉพาะ variant `ft="none"` — variant ปัจจุบัน `ft="segment"` ใช้ feed-tabs แทน (brand-menu ยังอยู่ในโค้ดแต่ dead)
- Feed tabs: ทั้งหมด/กำลังติดตาม/รายการโปรด (All Posts/Following/Favorites) — segmented control ใต้ header
- spec ไม่มีนิยาม header composition / feed tab bar (feed tabs น่าจะของ 02_FEED — flag ข้ามไป FSP-015a)

### A4. Layer/stack navigation model (ทั้งสถาปัตยกรรมไม่มีใน spec)
- โครงหน้าจอเดียว `.screen` + overlay layers 3 ชั้น:
  - `.page-sub` (`.sub-open` + `_subStack`) — sub pages push จากขวา, nav-tab swap ทันที (`pg-swap`), `report:pick` เลื่อนขึ้น (`pg-up`), ghost clone ตอน push ทับ
  - `.page-pv` (`.pv-open`) — full-screen post viewer (IG-style, scroll snap แนวตั้ง, 3 modes: default / `feed` / `pfp` profile-posts)
  - `.page-detail` (`.detail-open`) — post detail layer อยู่เหนือ pv (detail-back reveals viewer underneath)
  - `rp-over` — report flow ทับ stack, X ปิดทั้งกอง (`rpClose`), `<` slide กลับ (`rpBack`)
  - `.comment-sheet`+backdrop (sheets: comments/likes/post menu/share/wa/report), `.dlg` center dialog
- Route table `subHTML()`: create, search, sfilter, recents, settings, about_account, change_pwd, del_account, lang, notif_settings, help, privacy, terms, about_app, favorites, muted, blocked, prefs, sensitive, theme, alerts, board, boardsearch, boardall, boardart:, chat, chatitem:, chatroom:, chmenu:, chsettings:, chmedia:, chatcfg, walerts, saved, savedcol, archive, wishlist, wishcol, interested, ni, report(:user/:post/:pick:/:done:/:posts:), profile:, pfollow:, about:, pedit, portfolio, pfasset:, soldhist, sold:, sell:
- spec พูดถึง "screen/destination" เป็นนามธรรม ไม่มีนิยาม root tab + pushed sub + viewer + detail overlay → FSP-011 ควรบันทึก layer model เป็น source of truth

### A5. Back-button behavior จริงใน prototype
- `.sub-back` เดียวจัดการทุก sub page: pop `_subStack`; deep stack (profile:/pfollow:/chat:/chmenu:/chsettings:/report) ใช้ `rpBack` slide ออกขวา
- กรณีพิเศษ: saved/wishlist unwind inner mode ก่อน pop (search→menu→cover→edit→add→allmenu→allposts→manage); back จาก sfilter ทิ้ง draft; back จาก search results กลับ landing (IG); del_account step 2→1
- `.detail-back` ปิด detail, `.pv-back` ปิด viewer, `.sub-x` (X) ปิด report stack ทั้งกอง
- spec §13A เขียน back rules เฉพาะ context deep link เท่านั้น — in-app back stack ไม่ถูกเขียนเลย

### A6. Session model ใน nav (member / guest / new)
- `state.session` persist `fo_session`; `applySessionData()` สลับข้อมูลทั้งก้อน: member = demo data restore, new = `fo_newuser` profile ใหม่ว่าง ๆ (CP_ME swap, feedTab บังคับ "all"), guest = clear ทุกอย่าง (`__guest__`)
- Guest gate `GUEST_GATE_SEL` ครอบ navgo chat/alerts/profile + ~50 selector ของ action ที่ต้องมีตัวตน → `obGate()` member sheet; feed/board/search ดูได้เสรี
- Guest ยังกด feed tab Following/Favorites ได้ (ไม่ gate) — แต่ข้อมูลว่างอยู่แล้ว แสดง empty state
- spec §10 list "feature ที่ต้อง login" ไม่ตรง gate selectors จริง (ซ้ำกับ FSP-001a C5 — แต่ครั้งนี้เจอข้อเท็จจริงเพิ่ม: navgo chat/alerts/profile + set-btn/pf-menu ก็ gate)

### A7. System notification type (นอก spec list)
- Alerts tab มี type `system` — "A new device just logged in to your account near Bangkok, TH" — กดแล้ว toast "Security details aren't in this prototype yet"
- spec §9 กำหนด type = Like/Comment/Follow/Offer/Watch Alert เท่านั้น (Offer ตายแล้วตาม removal scope) — system/security notification ไม่มีใน spec

### A8. Notification destinations จริงใน prototype
- follow → `rpPush("profile:" + user)` เปิด public profile (ตรง spec)
- like/comment → `openPostViewer` โพสต์ตัวเอง 1 ใบ (head "Post"/username) — ถ้าโพสต์หาย toast "This post is no longer available"
- watch → `openPostViewer` โพสต์ที่ match โดยตรง (ดู C1)
- ทุกแถวกดแล้ว mark read + badge sync; มี Mark all as read + dismiss (X เฉพาะ follow)

### A9. Error/empty states ที่มีจริง
- Search: `S.err` → "Something went wrong. Please try again." + ปุ่ม Try again (`sr-retry`)
- Portfolio: "Unable to load data." + ปุ่ม `pfo-retry`
- Empty: "No data found"/"ไม่พบข้อมูล" ใช้จริง (ตรง spec) + variant อื่น ("No alerts yet", "No posts yet", "You're all caught up", "Article not found", "Chat not found")
- Alerts back = `data-navgo="feed"` (กลับ feed เสมอ ไม่ใช่ generic pop)

### A10. Prototype chrome/artifacts ที่ spec ไม่ควรมี
- statusbar mock (9:41 + ไอคอน), home indicator, `#themeToggle` dev button, `obReplay` "1st", `obRecon` "v2", `?dev` URL param (portfolio preview states)
- Design-variant flags: `state.variant="a1"`, `data-nav="labeled"` (มี CSS "icons" variant), `data-ft="segment"` (มี "none"/brand-menu variant) — set ครั้งเดียวตอน init ไม่มี runtime toggle
- `.set-btn` handler มีแต่ไม่มี markup (dead code — settings เข้าผ่าน `.pf-menu` เท่านั้น)
- Drawer/board/chat burger สามจุด: board `data-bdmenu` → category sheet จริง; chat `data-chgo="more"` → room menu จริง (ไม่ใช่ dead)

---

## B. Spec 00 มี แต่ Prototype ไม่มี (→ ต้องตัดสินใจว่า spec เก็บไว้เป็น contract หรือต้องปรับ)

| # | ของใน spec | สถานะใน prototype |
|---|---|---|
| B1 | Deep link ทั้งชุด (§13 + §13A + AC-NAV-016A–F): auth/permission/status/block validation, back fallback ไป Feed, main nav ใช้ต่อได้, Hide/Sold owner vs non-owner, Article unpublish/deleted/invalid states, admin preview | **ไม่มี deep link เลย** — ไม่มี URL routing; share = sheet mock + toast "Link copied"; profile link `https://tukdaeng.app/u/{user}` มีแค่เป็น text สำหรับ QR/copy; `?dev` param เป็น dev preview เท่านั้น |
| B2 | Global Login Required Dialog (title/copy/3 ปุ่มตาม spec) | เป็น member sheet "Join TukDaeng" (ซ้ำ FSP-001a C3 — จุดเดียวกัน ไม่นับซ้ำ) |
| B3 | Watch Alert **Result List** เป็น destination (§8/§9, AC-NAV-010) | ไม่มี result list — walerts page มีแค่ toggle + Edit badge; notification เปิด post viewer ตรง (ดู C1) |
| B4 | Deleted Asset state `รายการนี้ไม่พร้อมใช้งานแล้ว` (§11, AC-GLOBAL-008/009) + fallback CTA `Go back` | ไม่มี unavailable screen — มีแค่ toast "This post is no longer available" (alerts) / "Article not found" / "Chat not found" empty states |
| B5 | Offline / cached Feed (§10, AC-GLOBAL-014) | ไม่มีเลย |
| B6 | Blocked destination fallback "unavailable/blocked state" (§11, AC-NAV-014) | blocked profile แสดง "No posts yet" + ปุ่ม Unblock แทน (IG-style — ไม่ใช่ unavailable state แยก) |
| B7 | Offer ใน notification matrix + Cross-module matrix (§8/§9, AC-NAV-009/013) | Offer ถูกถอดแล้ว → removal scope FSP-006/007 |
| B8 | "Make Offer" / "Contact Seller" entry จาก Asset Detail + Asset Detail surface ทั้งก้อน | prototype ไม่มี asset detail แยก — มี post detail/viewer ที่เล่นบทเดียวกัน (flag ไป FSP-018) |
| B9 | Feed error state + ปุ่ม `ลองใหม่` (AC-GLOBAL-013) | feed ไม่มี error path; error มีเฉพาะ search + portfolio (copy ต่างกันเล็กน้อย) |
| B10 | Suspended/Banned account status check ทุก entry/route (§13, Exception) | ไม่มี account status เลย (ซ้ำ FSP-001a B5) |
| B11 | Analytics events `nav_*` ทั้งตาราง | ไม่มี tracking layer (ปกติ — contract) |
| B12 | Hide Feed Item + undo (§12 Trust & Safety) | มี `ni`/not-interested จริง (post menu) — อยู่ใน gate list แล้ว, undo เป็น toast/restore ผ่าน Settings > Not interested — ตรวจ undo ชั่วคราวตอน FSP-002a |

หมายเหตุ: B1–B5, B10, B11 เป็น contract-level ที่ prototype จำลองไม่ได้ — เก็บใน spec แต่ต้องระบุชัด "prototype ไม่ครอบ" เหมือนข้อสรุป FSP-001a

---

## C. ขัดกันโดยตรง (conflicts ต้อง sync)

| # | Spec 00 บอก | Prototype ทำจริง | ข้อเสนอ |
|---|---|---|---|
| C1 | Watch Alert notification ต้องไป **Watch Alert Result List** "must not open Asset Detail directly" | เปิด post viewer ของโพสต์ที่ match **โดยตรง** (`alertsClick` → `openPostViewer([p])`) และไม่มี result list อยู่ในระบบเลย | ต้องตัดสิน: (ก) แก้ spec ให้ตรง prototype = notification เปิด post เดียว หรือ (ข) spec บังคับ result list เป็น contract — แนะนำถามผู้ใช้ เพราะเป็น AC ชัดเจน (AC-NAV-010) ที่ prototype ฝ่าฝืน |
| C2 | Notification types = Like, Comment, Follow, Offer, Watch Alert เท่านั้น | like, comment, follow, watch + **system** (security alert "new device logged in") — Offer ไม่มี | เอา Offer ออก (removal scope) + ตัดสินว่า `system` จะเขียนเข้า spec เป็น type ที่ 5 หรือเป็น prototype artifact |
| C3 | Feed Card → Asset Detail; Comment ต้องทำผ่าน Asset Detail เท่านั้น | prototype มี 2 viewers: `.page-detail` (post detail มี comments inline) + `.page-pv` (IG viewer เปิด comment **sheet** ได้ตรง) — comment เปิดได้จากทั้ง feed card และ viewer ผ่าน bottom sheet ไม่ต้องเข้า detail ก่อน | map คำว่า "Asset Detail" ของ spec → post detail/viewer ของ prototype หรือเขียนนิยามใหม่ (flag ไป FSP-018 แต่ rule กลางอยู่ใน 00) |
| C4 | Menu items นอก baseline "must be marked future/placeholder/needs decision" | drawer แสดงเป็นแถวปกติพร้อม chevron กดได้ → toast "Not in this prototype yet" ไม่มี marking | spec เขียนพฤติกรรมจริง: enabled-looking rows + dead-tap toast = placeholder pattern ของ prototype |
| C5 | Share = "system share sheet / copy public deep link" | in-app share sheet mock (friend grid + app row) + toast "Link copied" — ไม่มี link จริง | เก็บ spec เป็น contract; ระบุ prototype mock เท่านั้น |
| C6 | Feed = "Marketplace list of Asset `Sale`" เท่านั้น | feed = ขาย + **โพสต์ธรรมดา (ไม่ผูก asset)** (`pfkind` post ไม่กรองออก, กรองแค่ show/hide/sold) + 3 tabs All/Following/Favorites | spec global rule "Feed ใช้เฉพาะ Sale" ขัดกับ feed จริงที่มี social posts — ต้องเขียนใหม่ (กระทบ 00_GLOBAL §9/§14 + 02_FEED; flag FSP-015a/010) |
| C7 | "Notifications" เป็น primary surface | ใน prototype ชื่อแท็บ = **Alerts** (แจ้งเตือน) แสดง badge unread | sync คำว่า Notifications vs Alerts (terminology) |
| C8 | Search เป็น primary navigation surface | search เป็น **icon ใน app-header** เปิด sub page — ไม่ใช่ tab | เขียนให้ตรง: search = header entry ไม่ใช่ nav tab |
| C9 | Add Asset เป็น primary surface + อยู่ใน login-required list | `+` ใน app-header เปิด composer โพสต์/สินทรัพย์ (mode post/asset); profile "+" เปิด Add-Asset mode | map "Add Asset" → create composer (post + asset modes) — flag FSP-017 |

---

## D. Cross-module notes (ไม่ใช่ spec 00 แต่เจอระหว่างสแกน)

- Offer refs ใน 00_NAV: §4 (Chat persistence/Offer context), §8 matrix (Make Offer, Offer Detail, Offer notification), §9, §10 (Make Offer), §16, AC-NAV-009/013 → เข้า removal list FSP-006/007
- "Asset Detail" ทั้งเอกสาร 00 ใช้คำเดียว แต่ prototype มี post detail + post viewer 2 ชั้น → ต้องนิยาม mapping ใน 00 ก่อน (ใช้ซ้ำทุก module spec)
- Feed tabs + create composer → scope 02_FEED (FSP-015a/b); Search → 03 (FSP-016); drawer 9 items ถ้า in-scope → ต้องมี spec destination ใหม่ทั้งหมด
- `.set-btn` dead handler — ไม่มีผลต่อ spec แต่ควรจำไว้ว่า settings entry = profile burger เท่านั้น
- Board burger = category filter sheet จริง ไม่ใช่ dead (ต่างจาก drawer หลัก)
- Blocked profile แสดง "No posts yet" + Unblock (IG) — spec เขียน "unavailable/blocked state" คนละ pattern → flag ให้ FSP-019 (06_PROFILE) + 15_TRUST_SAFETY
- Coach marks ชี้ไปที่ `.bottom-nav` + create + search (อยู่ใน onboarding — จดไว้ใน FSP-001a A9 แล้ว)

## E. สรุปจำนวน

- Prototype-only (ต้องเพิ่มใน spec): 10 กลุ่ม (A1–A10)
- Spec-only (ต้องตัดสินใจ): 12 รายการ (B1–B12)
- Conflicts: 9 รายการ (C1–C9)
