# FO-TEST-02 — Test Cases: Shell & Navigation (FO prototype)

> Task: FO-TEST-02 ของชุด FO-TEST-001 · วันที่: 2026-10-27
> กติกาหลัก: `deliverables/FO-TEST-001-testcase-prompt.md` · Task breakdown: `deliverables/FO-TEST-001-task-breakdown.md`
> Source of Truth: `Prototypes/fo-flow/index.html` (app shell ~L19647–19711, bottom nav ~L17103–17115, drawer handler ~L21612–21617, navgo ~L21622–21640, scroll-to-hide ~L20122–20134, sub-stack mechanics ~L15098–15260, tour ~L23301–23341, gate ~L23461–23475)
> สัญญาความครอบคลุม: `deliverables/FO-TEST-001-00-inventory.md` §2.12 เป็นหลัก + แถว feed tabs ใน §2.2 — ไม่เดา behavior เพิ่ม

## 0. วิธีใช้เอกสาร + สภาพแวดล้อม

- เปิด prototype ที่ `http://localhost:8901/index.html` (หรือเปิดไฟล์ตรง) — Viewport 440×956, ทดสอบทั้ง Light/Dark และ TH/EN ตามที่ระบุในเคส
- **Actor**: `GUEST` = session guest (Skip for now หรือ logout), `MEMBER` = demo `demo@tukdaeng.com` / `Tukdaeng123`, `NEW` = สมัครใหม่ (member powers แต่ข้อมูลว่าง)
- **Type**: UI = การแสดงผล · Func = การทำงาน · Int = เชื่อมข้าม module · Edge = negative/boundary
- **Priority**: High = core flow/กติการะบบ · Medium = feature หลัก · Low = edge/cosmetic
- **[GATE]**: guest แตะ action ใน `GUEST_GATE_SEL` → `obGate()` (Member Sheet "Join TukDaeng") — ทุกเคส [GATE] ในไฟล์นี้มีคู่ guest/member ครบ; mechanics ของ sheet อยู่ FO-TEST-01 (AUTH-061–068) และเมทริกซ์ gate ทั้งแอปอยู่ FO-TEST-17
- **Scroll-to-hide** ทำงานเฉพาะ container `.feed-scroll` (หน้า Feed เท่านั้น): เลื่อนลง `dy > 6px` และ `scrollTop > 56` → `.screen` ได้คลาส `bars-hidden` (header ลอยขึ้น + bottom nav จมลง); `dy < -6` หรือ `scrollTop ≤ 8` → แถบกลับมา
- **Bottom nav** ที่เห็นบนแต่ละแท็บ render ซ้ำในหน้านั้น (chat/alerts/board ฝัง `botNavHTML` ของตัวเอง); nav ของ feed (ลูกตรงของ `.screen`) ถูกซ่อนอัตโนมัติเมื่อมี `sub-open`/`detail-open`/`pv-open`
- **Nav variant เริ่มต้น** `data-nav="labeled"` (floating glass pill + label) — variant `icons` และ `data-ft="none"` (brand-menu) เป็น dev harness เท่านั้น ไม่เขียน TC production
- localStorage keys ที่เกี่ยว: `fo_session`, `fo_onboarded`, `fo_toured`, `fo_member_hide`, `fo_lang`, `fo_theme`
- ปุ่ม dev `"1st"` (obReplay) ล้างทุก key + render ใหม่ → ใช้ replay onboarding/ทัวร์; ปุ่ม `☾/☀` (themeToggle) สลับธีมเร็ว
- ในเดสก์ท็อปให้ "scroll" ด้วย mouse wheel/drag บนพื้นที่ฟีด; เคสที่ต้องเข้า Post Viewer ให้แตะ grid tile (เช่นใน profile หรือ saved) — feed card กด media ไม่เปิด viewer (กติการะบบ เช็กใน FO-TEST-03/06)

## 1. Coverage Map ของ task นี้ (เทียบ inventory §2.12 + §2.2)

| Route/Overlay (inventory) | TC ID ที่ครอบ |
|---|---|
| app header — burger / search / wordmark / + create (§2.12) | SHELL-001 – 007 |
| `hb-open` drawer — 9 เมนู placeholder (§2.12) | SHELL-008 – 020 |
| bottom nav 5 แท็บ + badge (§2.12) | SHELL-021 – 034 |
| feed shell — Feed Tabs segmented control + seg-thumb + empty ต่อ tab (§2.2 — เฉพาะ shell; card internals → FO-TEST-03) | SHELL-035 – 041 |
| scroll/anim mechanics — scroll-to-hide (§2.12) | SHELL-042 – 048 |
| scroll/anim mechanics — sub open/push/back, ghost slides, rp-over, pg-swap, pv scroll snap (§2.12) | SHELL-049 – 056 |
| coach marks `ob-coach` / `OB_TOUR` / `OB_TOUR_GUEST` (mechanics defer มาจาก FO-TEST-01 — ไม่ใช่แถว inventory แยก) | SHELL-057 – 061 |
| i18n EN/TH + theme light/dark (§2.12 — spot-check เท่านั้น; sweep เต็มอยู่ FO-TEST-19) | SHELL-062 – 064 |
| scrToast / pin pill+toast (§2.12) — อยู่ในความรับผิดชอบของ module ที่ trigger (FO-TEST-03..17) | — (note) |
| dev sidebar / `?dev=1` / `POST_DETAIL_CFG` / `data-nav="icons"` / `data-ft="none"` brand-menu (§2.12) — prototype harness | — out of scope |

## 2. Test Cases

### 2.1 App Header

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-SHELL-001 | app header layout | MEMBER | UI | session member บน feed | 1. ตรวจแถวบนสุดของ feed 2. ดู statusbar + แถบล่างสุด | — | statusbar "9:41" + ไอคอน signal/wifi/battery; header: burger + search (ซ้าย), wordmark "TUK DAENG" แดงกลางจอ (caret ซ่อนใน ft=segment), spacer, ปุ่ม + (ขวา); home indicator แถบล่างสุด | Medium | |
| FO-TC-SHELL-002 | header `.hb-btn` | MEMBER | Func | อยู่ feed | 1. แตะไอคอน burger มุมซ้ายบน | `.screen` ได้ `hb-open` → drawer เลื่อนเข้าจากซ้าย | panel ทาบซ้าย + scrim มืดคลุม feed | High | |
| FO-TC-SHELL-003 | header `.search-btn` | MEMBER | Func | อยู่ feed | 1. แตะไอคอน search | `openSub(scr,"search")` → หน้า Search landing เด้ง (explore tiles + popular chips + recents) | sub page เต็มจอทับ feed; bottom nav ของ feed ถูกซ่อน (หน้า search ไม่มี nav ของตัวเอง) | High | |
| FO-TC-SHELL-004 | header `+` `[data-flow="create"]` [GATE] | MEMBER | Func | อยู่ feed | 1. แตะปุ่ม + | `openSub(scr,"create")` → IG picker เปิด | หน้า create เต็มจอ | High | |
| FO-TC-SHELL-005 | header `+` [GATE] | GUEST | Func | session guest บน feed | 1. แตะปุ่ม + 2. แตะ scrim ปิด sheet | `+` อยู่ใน `GUEST_GATE_SEL` → `obGate()` Member Sheet เด้ง; create ไม่เปิด; ปิด sheet → ยัง guest บน feed | sheet "Join TukDaeng" + gate copy "Sign in or create a free account to use this feature." | High | |
| FO-TC-SHELL-006 | header `.search-btn` | GUEST | Func | session guest บน feed | 1. แตะไอคอน search | search **ไม่ถูก gate** → หน้า search เปิดได้ฟรี | เหมือน SHELL-003 | Medium | |
| FO-TC-SHELL-007 | header wordmark | MEMBER | Edge | อยู่ feed (ft=segment ค่าปกติ) | 1. แตะ wordmark "TUK DAENG" / บริเวณ caret | ไม่มี handler ในโหมด segment → ไม่เกิดอะไร (wordmark ตอบสนองเฉพาะ `data-ft="none"` dev variant) | caret ไม่แสดง (`display:none`), cursor = default | Low | |

### 2.2 Burger Drawer (`hb-open`)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-SHELL-008 | `hb-open` drawer UI | MEMBER | UI | อยู่ feed → เปิด drawer | 1. แตะ burger 2. ตรวจ panel | — | panel ชิดซ้ายมี 9 แถวเรียงต่อกัน แต่ละแถว = icon + label + chevron › ขวา; scrim มืดคลุม feed ทั้งจอ | Medium | |
| FO-TC-SHELL-009 | `hb-open` scrim close | MEMBER | Func | drawer เปิดอยู่ | 1. แตะบริเวณมืด (scrim) ขวาของ panel | `.hb-scrim` → ลบ `hb-open` → drawer เลื่อนออก ปิด | feed กลับมาใช้งานได้ตามเดิม | High | |
| FO-TC-SHELL-010 | drawer item — Watch Brands `[DEAD]` | MEMBER | Func | drawer เปิดอยู่ | 1. แตะแถว "Watch Brands / แบรนด์นาฬิกา" | toast "Not in this prototype yet" ~1.8s — ไม่มีหน้าใหม่ ไม่มี navigation | toast ลอยล่างจอ; drawer ยังเปิดค้าง | Medium | |
| FO-TC-SHELL-011 | drawer item — Watch Price Index `[DEAD]` | MEMBER | Func | drawer เปิดอยู่ | 1. แตะ "Watch Price Index / ดัชนีราคานาฬิกา" | toast "Not in this prototype yet" เหมือนเดิม | เหมือน SHELL-010 | Medium | |
| FO-TC-SHELL-012 | drawer item — Watch Shops `[DEAD]` | MEMBER | Func | drawer เปิดอยู่ | 1. แตะ "Watch Shops / ร้านนาฬิกา" | toast "Not in this prototype yet" | เหมือน SHELL-010 | Medium | |
| FO-TC-SHELL-013 | drawer item — Accessories Shop `[DEAD]` | MEMBER | Func | drawer เปิดอยู่ | 1. แตะ "Accessories Shop / ร้านอุปกรณ์เสริม" | toast "Not in this prototype yet" | เหมือน SHELL-010 | Medium | |
| FO-TC-SHELL-014 | drawer item — Repair Shop `[DEAD]` | MEMBER | Func | drawer เปิดอยู่ | 1. แตะ "Repair Shop / ศูนย์ซ่อมแซม" | toast "Not in this prototype yet" | เหมือน SHELL-010 | Medium | |
| FO-TC-SHELL-015 | drawer item — Auction Center `[DEAD]` | MEMBER | Func | drawer เปิดอยู่ | 1. แตะ "Auction Center / ศูนย์ประมูล" | toast "Not in this prototype yet" | เหมือน SHELL-010 | Medium | |
| FO-TC-SHELL-016 | drawer item — Consignment Center `[DEAD]` | MEMBER | Func | drawer เปิดอยู่ | 1. แตะ "Consignment Center / ศูนย์ฝากขาย" | toast "Not in this prototype yet" | เหมือน SHELL-010 | Medium | |
| FO-TC-SHELL-017 | drawer item — Authentication Center `[DEAD]` | MEMBER | Func | drawer เปิดอยู่ | 1. แตะ "Authentication Center / ศูนย์ตรวจเช็คแท้" | toast "Not in this prototype yet" | เหมือน SHELL-010 | Medium | |
| FO-TC-SHELL-018 | drawer item — Community `[DEAD]` | MEMBER | Func | drawer เปิดอยู่ | 1. แตะ "Community / ชุมชนคนรักนาฬิกา" | toast "Not in this prototype yet" | เหมือน SHELL-010 | Medium | |
| FO-TC-SHELL-019 | drawer dismiss paths | MEMBER | Edge | drawer เปิดอยู่ | 1. แตะพื้นว่างใน panel (ไม่โดนแถว) 2. กด ESC บนคีย์บอร์ด 3. แตะ burger ซ้ำ | panel-area tap ไม่ทำอะไร; ESC ไม่มี handler → ไม่ปิด; burger ซ้ำ = add `hb-open` ซ้ำ (idempotent ยังเปิดอยู่) — ปิดได้ทางเดียวคือ scrim | drawer ค้างเปิดทุกเคส | Low | |
| FO-TC-SHELL-020 | drawer as guest | GUEST | Func | session guest บน feed | 1. แตะ burger 2. แตะแถวใดก็ได้ | drawer **ไม่ถูก gate** (hb ไม่อยู่ใน `GUEST_GATE_SEL`) → เปิดปกติ; แถว → toast เดียวกัน | เหมือน member | Medium | |

### 2.3 Bottom Nav (5 แท็บ)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-SHELL-021 | bottom nav UI | MEMBER | UI | อยู่ feed | 1. ตรวจแถบนำทางล่าง | — | floating glass pill 5 item: Feed/Chat/Boards/Alerts/Profile (ไอคอน+label); active pill หลัง Feed; badge เลข unread บน Chat+Alerts | Medium | |
| FO-TC-SHELL-022 | nav แต่ละแท็บ | MEMBER | Func | อยู่ feed | 1. แตะ Chat 2. แตะ Board 3. แตะ Alerts 4. แตะ Profile 5. แตะ Feed | แต่ละแท็บ `openSub(swap)` → หน้า chat / board / alerts / own-profile / feed ตามลำดับ; active pill ย้ายตาม; เปิดแบบ swap (`pg-swap` ไม่มี slide จากขวา) | หน้า root ของแท็บนั้นแสดงพร้อม nav ของตัวเอง (ยกเว้น feed ที่ใช้ nav ของ shell) | High | |
| FO-TC-SHELL-023 | nav guest — Chat/Alerts/Profile [GATE] | GUEST | Func | session guest บน feed | 1. แตะ Chat 2. ปิด sheet 3. แตะ Alerts 4. ปิด sheet 5. แตะ Profile | ทั้ง 3 แท็บอยู่ใน `GUEST_GATE_SEL` → Member Sheet เด้งทุกครั้ง; แท็บ **ไม่สลับ** (อยู่ feed เหมือนเดิม) | sheet "Join TukDaeng" ทับ feed; nav/badge/active ไม่เปลี่ยน | High | |
| FO-TC-SHELL-024 | nav member — แท็บที่ gate (คู่ 023) [GATE] | MEMBER | Func | session member บน feed | 1. แตะ Chat 2. แตะ Alerts 3. แตะ Profile | member ไม่เจอ sheet — ทุกแท็บเปิดหน้าปกติ | เหมือน SHELL-022 | High | |
| FO-TC-SHELL-025 | nav guest — Feed/Board | GUEST | Func | session guest | 1. แตะ Feed 2. แตะ Board | feed + board **ไม่อยู่ใน gate** → ใช้ได้ฟรี; board เปิดหน้า board ปกติ | ไม่มี Member Sheet | Medium | |
| FO-TC-SHELL-026 | nav re-tap Feed (refresh rule) | MEMBER | Func | อยู่ feed เลื่อนลงมาลึก | 1. เลื่อน feed ลงกลาง ๆ 2. แตะแท็บ Feed ซ้ำ | `wasFeed` → re-render `feed-list` + `scrollTo(top, smooth)` — feed สดใหม่และกลับขึ้นบนสุด | การ์ด re-render + เลื่อนขึ้นนุ่ม ๆ | High | |
| FO-TC-SHELL-027 | nav re-tap ขณะลึก (root reset) | MEMBER | Func | member เข้า chatroom จาก chat list | 1. แตะ Chat → แตะห้อง `chatroom:id` 2. แตะแท็บ Chat อีกครั้ง | nav tap ที่สอง `openSub("chat")` → `_subStack=["chat"]` → กลับ chat list root (ไม่ใช่ถอยหนึ่งชั้น) | chat list แสดงใหม่ (view/itemFilter/q reset ผ่าน `chatResetToDefault()`) | High | |
| FO-TC-SHELL-028 | nav roundtrip — feed scroll kept | MEMBER | Func | อยู่ feed เลื่อนลงกลาง ๆ | 1. แตะ Board 2. แตะ Feed กลับ | feed-scroll element ไม่ถูกทำลาย → ตำแหน่ง scroll เดิมคงอยู่ (ต่างจาก re-tap ใน 026) | feed กลับมาที่จุดเดิมพอดี | Medium | |
| FO-TC-SHELL-029 | nav badge — chat + alerts | MEMBER | UI | member มี unread | 1. ดู badge บน Chat + Alerts | `chUnread()`/`alUnread()` >0 → `<span class="nav-badge">{n}</span>`; เข้าหน้า+อ่าน/mark all read → badge sync หาย/ลดตามจริง | badge เลขแดงทับไอคอน | High | |
| FO-TC-SHELL-030 | nav badge `99+` cap | MEMBER | Edge | — | 1. (ตรวจจากโค้ด/หรือยัด unread มากกว่า 99 ถ้าทำได้) | `n > 99 ? "99+" : n` — mock ไม่มีเส้นทางสร้าง unread >99 ให้ยืนยัน logic `[OPEN]` verify ด้วยตาในโค้ด | ข้อความ "99+" | Low | |
| FO-TC-SHELL-031 | nav badge — guest/new | GUEST vs NEW | Edge | session guest และ new | 1. ดู nav บน feed ทั้งสอง session | guest/new: `alInit()`→[] และ `CHAT.threads`→[] → ไม่มี badge เลย | nav ไม่มีเลขทั้งคู่ | Medium | |
| FO-TC-SHELL-032 | nav active บน public profile | MEMBER | Edge | เปิด profile คนอื่น (avatar→profile) | 1. ดู active pill บน nav | `pfNavHTML(own=false)` → `botNavHTML("feed")` → pill อยู่ที่ **Feed** (ไม่ใช่ Profile) | Feed active แม้อยู่หน้า profile | Low | |
| FO-TC-SHELL-033 | nav หายใต้ overlay | MEMBER | Func | เปิด Post Viewer จาก tile | 1. แตะ grid tile → pv เปิด 2. ดู nav 3. `pv-back` | `.screen.pv-open > .bottom-nav` ซ่อน (pv ไม่มี nav ของตัวเอง); ปิด → nav กลับมา (เหมือนกันกับ detail-open) | nav หายระหว่าง pv/detail | Medium | |
| FO-TC-SHELL-034 | nav บนหน้าลึก | MEMBER | Edge | pushSub หน้าลึก (เช่น settings, saved, chatroom) | 1. เข้าหน้าลึกแล้วดู nav | หน้าลึกไม่ render `botNavHTML` → **ไม่มี bottom nav** — ออกได้เฉพาะ `sub-back` (nav มีเฉพาะ root 5 หน้า + public/own profile) | ไม่มี pill ลอยล่าง | Medium | |

### 2.4 Feed Tabs (segmented control)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-SHELL-035 | feed tabs UI | MEMBER | UI | อยู่ feed | 1. ดูแถบใต้ header | — | 3 ปุ่ม All Posts / Following / Favorites + `.seg-thumb` pill อยู่ใต้แท็บ active (default "all") | Medium | |
| FO-TC-SHELL-036 | feed tab — Following | MEMBER | Func | อยู่ feed | 1. แตะ "Following" | `setFeedTab` → `state.feedTab="following"` → feed-list render เฉพาะโพสต์ `following` + `fs.scrollTop=0` + thumb เลื่อนมา | thumb slide ไปใต้ Following; เนื้อหาเปลี่ยนเป็นของคนที่ follow | High | |
| FO-TC-SHELL-037 | feed tab — Favorites | MEMBER | Func | อยู่ feed | 1. แตะ "Favorites" | เหมือน 036 แต่กรอง `p.favorite` | thumb ใต้ Favorites; เห็นเฉพาะโพสต์ favorite | High | |
| FO-TC-SHELL-038 | feed tab — re-tap active | MEMBER | Edge | อยู่แท็บ all | 1. แตะ "All Posts" ซ้ำ | guard `state.feedTab === tab` → return เงียบ ๆ ไม่ re-render | ไม่มีการเปลี่ยนแปลง | Low | |
| FO-TC-SHELL-039 | feed tab — following empty | NEW | UI | session new (ไม่เคย follow) | 1. แตะ "Following" | `feedEmptyHTML("following")` | icon users 56px + "Follow others to see their posts here / ติดตามผู้อื่นเพื่อดูโพสต์ของพวกเขาที่นี่" | Medium | |
| FO-TC-SHELL-040 | feed tab — favorites empty | GUEST | UI | session guest | 1. แตะ "Favorites" | `feedEmptyHTML("favorites")` | icon star 56px + "No favorites yet / ยังไม่มีรายการโปรด" | Medium | |
| FO-TC-SHELL-041 | feed tabs as guest | GUEST | Func | session guest | 1. สลับ Following ↔ Favorites ↔ All | feed tabs **ไม่ถูก gate** → สลับได้ปกติ; following/favorites = empty state | tabs ทำงานเหมือน member | Medium | |

### 2.5 Scroll-to-hide (`bars-hidden`)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-SHELL-042 | scroll-to-hide — hide | MEMBER | Func | อยู่ feed บนสุด | 1. เลื่อนลงแรง ๆ (scrollTop >56, dy>6) | `.screen` + `bars-hidden` → header `translateY(-100%-16px)` + nav `translateY(160%)` + `pointer-events:none` | header หลบขึ้น + nav จมลง กด nav ไม่ได้ | High | |
| FO-TC-SHELL-043 | scroll-to-hide — show | MEMBER | Func | bars-hidden อยู่ | 1. เลื่อนขึ้นแรง ๆ (dy<-6) | ลบ `bars-hidden` → ทั้งสองแถบ transition กลับ | header+nav สไลด์กลับ | High | |
| FO-TC-SHELL-044 | scroll-to-hide — top force | MEMBER | Func | bars-hidden อยู่ | 1. เลื่อนจนชนบน (scrollTop ≤8) | บังคับลบ `bars-hidden` โดยไม่สนทิศ | แถบโผล่ที่จุดบนสุดเสมอ | Medium | |
| FO-TC-SHELL-045 | scroll-to-hide — small deltas | MEMBER | Edge | อยู่ feed | 1. แกว่งเลื่อนลงทีละ ≤6px | `dy` ไม่ถึง threshold → ไม่ toggle | แถบนิ่ง ไม่กระพริบ | Low | |
| FO-TC-SHELL-046 | bars-hidden ลามไป sub page | MEMBER | Edge | bars-hidden อยู่ → แตะ avatar โพสต์ | 1. เข้า profile คนอื่น 2. เลื่อนหน้า profile 3. back กลับ feed → เลื่อนขึ้น | class อยู่บน `.screen` → nav ของ profile ก็ถูกซ่อนตาม (`pf-scroll` ไม่ปลดล็อก); back → feed ยัง hidden จนเลื่อนขึ้น/ถึงบน `[OPEN]` ไม่ชัดว่า intended | nav หายทั้ง feed และหน้าใหม่ | Medium | |
| FO-TC-SHELL-047 | scroll ในหน้าอื่นไม่ hide | MEMBER | Func | เปิด alerts/chat/board | 1. เลื่อน list ในหน้านั้นลงยาว ๆ | listener จับเฉพาะ `.feed-scroll` → `.sub-scroll`/`.ch-scroll`/`.bd-scroll` ไม่กระทบ `bars-hidden` | nav ของหน้านั้นอยู่นิ่งตลอด | Medium | |
| FO-TC-SHELL-048 | scroll lock ตอน sheet เปิด | MEMBER | Edge | เปิด comments sheet บน feed | 1. พยายามเลื่อน feed ใต้ sheet | `.comments-open` → `:is(.feed-scroll,...){overflow:hidden}` → feed เลื่อนไม่ได้ | feed นิ่งจนกว่าปิด sheet | Low | |

### 2.6 Back & Navigation Mechanics

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-SHELL-049 | sub-back root page | MEMBER | Func | เปิด search (stack=["search"]) | 1. แตะ `sub-back` บนซ้าย | `subBack` → pop + ลบ `sub-open` → หน้าเลื่อนออกขวากลับ feed | feed เผยข้างล่างสภาพเดิม | High | |
| FO-TC-SHELL-050 | nested back (ghost slide) | MEMBER | Func | เปิด settings → หน้าลูก (เช่น lang) stack ≥2 | 1. แตะ `sub-back` | `rpBack` → clone `pg-ghost pg-out-r`: หน้าปัจจุบันเลื่อนออกขวาเหนือหน้าก่อนที่อยู่นิ่ง → render หน้าก่อนแบบ swap | animation ขวา-ออกเสมอ ไม่มี slide ซ้าย-เข้า | High | |
| FO-TC-SHELL-051 | alerts `al-back` → feed เสมอ | MEMBER | Func | เปิด alerts จาก nav | 1. แตะ back บนซ้ายของหัว alerts | `al-back` = `data-navgo="feed"` → `_subStack=[]` + ลบ `sub-open` → **กลับ feed เสมอ** (ไม่ pop stack ปกติ) | หน้า alerts ถูกแทนด้วย feed | High | |
| FO-TC-SHELL-052 | alerts → profile → back chain | MEMBER | Func | อยู่ alerts | 1. แตะ follow alert row → profile push ขึ้น 2. `sub-back` 3. `al-back` | row → `rpPush("profile:u")` ซ้อน alerts; back → `rpBack` กลับ **alerts** (ไม่ feed); `al-back` → feed เสมอ | chain: alerts → profile → alerts → feed | High | |
| FO-TC-SHELL-053 | deep overlay back chain | MEMBER | Func | tile→pv→"View full detail"→detail | 1. เปิด pv จาก tile 2. เปิด detail 3. `detail-back` 4. `pv-back` | detail อยู่เหนือ pv เสมอ — `detail-back` ลบ `detail-open` เผย pv ข้างล่าง; `pv-back` ลบ `pv-open`+`rp-over` กลับต้นทาง | layering: sub < pv < detail | High | |
| FO-TC-SHELL-054 | browser back | MEMBER | Edge | อยู่หน้าลึกใดก็ได้ | 1. กดปุ่ม Back ของเบราว์เซอร์ | SPA ไม่มี history/route integration → ออกจากแอป/หน้าเลิกใช้งาน `[OPEN]` ไม่มี in-app back ผ่าน browser | ไม่มี intermediate state | Low | |
| FO-TC-SHELL-055 | ESC key | MEMBER | Edge | เปิด sub/sheet/pv ใดก็ได้ | 1. กด ESC | ไม่มี keydown Escape handler → ไม่มีอะไรปิด `[OPEN]` (desktop-only concern — mobile ไม่มีปุ่มนี้) | หน้าจอนิ่ง | Low | |
| FO-TC-SHELL-056 | pv scroll snap | MEMBER | Func | pv เปิด immersive (multi-post track) | 1. เลื่อน pv ขึ้นลง 2. เทียบ feed/pfp mode (เปิดจาก saved/search tile) | immersive `.pv-track` = `scroll-snap-type:y mandatory` + `snap-stop:always` → snap ทีละโพสต์เต็มจอ; `.page-pv.feed`/`.pfp` = `snap:none` → เลื่อนอิสระ | สัมผัสต่างกันชัดต่อ mode | Medium | |

### 2.7 Coach Marks (`ob-coach` / `OB_TOUR` / `OB_TOUR_GUEST`)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-SHELL-057 | tour start (member/new) | NEW | Func | จบ onboarding ครั้งแรก (สมัครใหม่ → feed) | 1. ดู bubble แรก | `obFinish` → tour=true + `!fo_toured` → `obTour(0)` ชี้ `.app-header [data-flow=create]` | bubble แดง glass 230px + arrow ชี้เป้า + ปุ่ม "Next" | Medium | |
| FO-TC-SHELL-058 | tour Next → Got it | NEW | Func | bubble 1 แสดง | 1. กด Next ×3 2. กด "Got it" | Next → `obTour(i+1)`: mark2 `.search-btn` → mark3 `.feed-tabs` → mark4 `.bottom-nav` (ปุ่มสุดท้าย "Got it"); Got it → ลบ bubble จบ | arrow `--ax` ตามเป้าแต่ละจุด; bubble flip เหนือ/ใต้ตามตำแหน่ง | Medium | |
| FO-TC-SHELL-059 | tour dismiss outside | NEW | Func | bubble ใดก็ได้แสดง | 1. แตะจอนอก bubble | click นอก `.ob-coach` → `obTourI=-1` + remove ทุก bubble — จบ tour เงียบ | bubble หายทันที | Medium | |
| FO-TC-SHELL-060 | tour guest copy | GUEST | Func | first-run → Skip for now (non-gate) | 1. ดู mark1 + mark4 | `isGuest()` → `OB_TOUR_GUEST`: mark1 "Sign up to create your first post." + mark4 "Sign in to use chat, alerts and your profile." (ต่างจาก member copy) | copy ชวน sign-up แทน how-to | Medium | |
| FO-TC-SHELL-061 | `fo_toured` once-ever | MEMBER | Edge | tour เล่นไปแล้ว | 1. sign out → sign in demo → feed 2. "1st" → sign in demo อีกครั้ง | `fo_toured` ถูก set ก่อน tour เล่น → sign-in ครั้งต่อไปไม่มี bubble; demo sign-in (`isNew=false`) ก็ไม่ trigger tour อยู่แล้ว — ทัวร์มีเฉพาะครั้งแรกของเครื่อง | ไม่มี bubble เด้งซ้ำ | Low | |

### 2.8 i18n & Theme Spot-check (sweep เต็ม → FO-TEST-19)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-SHELL-062 | TH labels shell | MEMBER | UI | `state.lang="th"` | 1. ดู nav labels 2. feed tabs 3. เปิด drawer | nav: ฟีด/แชท/กระดานข่าว/แจ้งเตือน/โปรไฟล์; tabs: ทั้งหมด/กำลังติดตาม/รายการโปรด (seg-thumb re-measure ตามความกว้าง); drawer 9 แถวภาษาไทย; coach bubble ใช้ th เมื่อ tour เล่น | ไม่มี label ตกค้าง EN | Medium | |
| FO-TC-SHELL-063 | light theme shell | MEMBER | UI | `data-theme="light"` | 1. ดู header/nav/active pill | nav glass เด่นขาว; header blur gradient สว่าง; active pill + badge อ่านชัด; wordmark แดงคอนทราสต์พอ | ไม่มีจุดจางหาย | Low | |
| FO-TC-SHELL-064 | lang swap mid-shell | MEMBER | Func | อยู่ feed กลาง scroll | 1. settings→lang→ไทย→กลับ feed | `syncAppLanguage` → re-render ทุก surface พร้อม `keepScroll` → labels เปลี่ยนไม่ต้อง reload + scroll/ตำแหน่งเดิมคงอยู่ + thumb re-measure | ทุก label สลับทันที | Medium | |

## 3. หมายเหตุ / OPEN items

- **[OPEN] SHELL-030** — badge `99+` cap: mock ไม่มีเส้นทางสร้าง unread >99 → verify จาก logic `n > 99 ? "99+" : n` ใน `chBadgeHTML`/`alBadgeHTML` (~L17967, L18016)
- **[OPEN] SHELL-046** — `bars-hidden` อยู่บน `.screen` ทั้งตัว → ซ่อน `.bottom-nav` ของทุก sub page ที่เปิดทับด้วย ทั้งที่ `.feed-scroll` เท่านั้นที่ปลดล็อกได้: ไม่ชัดว่า intended (IG-style "nav อยู่กับ feed") หรือ leak — ยกให้ทีมตัดสิน
- **[OPEN] SHELL-054/055** — ไม่มี browser-history back และไม่มี ESC handler: prototype เป็น SPA เดี่ยวไม่มี routing → desktop tester ต้องอาศัย `sub-back`/`pv-back`/scrim เท่านั้น
- **ขอบเขตที่ตัดออก**: post card/media/action บน feed (FO-TEST-03), เนื้อหาหน้า search/sfilter (04), viewer/detail internals + `pv-srch` (06), sheet/dialog mechanics เช่น `openSheet`/backdrop (07), alerts list เนื้อหา + mark-all-read ภายในหน้า (10), drawer `brand-menu` ft=none + `data-nav="icons"` + dev sidebar = prototype harness (ไม่ใช่ production), snooze/prefs ที่กระทบ All tab (15), i18n/theme sweep เต็ม (19)
- toasts `scrToast`/`pin-pill`/`pin-toast`/`flowToast` เป็นของ action แต่ละ module — ไฟล์นี้เช็กเฉพาะที่ trigger จาก shell (drawer `[DEAD]` toast ใช้ `#flowToast` ลอย fixed ล่าง viewport ~1.8s)
- สถิติ: **64 TC** — High 20 / Medium 33 / Low 11 (SETUP rows แยกใน checklist)
