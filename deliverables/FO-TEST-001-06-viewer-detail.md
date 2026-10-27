# FO-TEST-06 — Test Cases: Post Viewer & Post Detail (FO prototype)

> Task: FO-TEST-06 ของชุด FO-TEST-001 · วันที่: 2026-10-27
> กติกาหลัก: `deliverables/FO-TEST-001-testcase-prompt.md` · Task breakdown: `deliverables/FO-TEST-001-task-breakdown.md` (FO-TEST-06 ~L182–204)
> Source of Truth: `Prototypes/fo-flow/index.html` (openPostViewer ~L14841–14897 · pvPostHTML ~L14731–14756 · pvPostSheetHTML ~L14760–14779 · pvDetailsSheetHTML ~L14782–14785 · svfPostHTML ~L14788 · pfpPostHTML ~L14796–14839 · openPostDetail + POST_DETAIL_CFG ~L13266–13273 + ~L14997–15016 · detailHTML dl1 ~L13534–13577 · igDetailHTML dl2 ~L13690–13698 · detailSpecsHTML/specGroupsHTML ~L13700–13733 · pmMenuHTML/pmOwnMenuHTML ~L14191–14229 · clip tick ~L15960–15986 · photo carousel ~L20068–20267 · tile/alert handlers ~L21533/21671/22606–22635/18118–18137 · pm handlers ~L20802–20920 · view-full ~L22201–22210 · follow ~L22212–22236 · gate ~L20494 + ~L23461–23470)
> สัญญาความครอบคลุม: `deliverables/FO-TEST-001-00-inventory.md` §2 — อ้าง route/overlay/feature จากตารางเท่านั้น ไม่เดา behavior เพิ่ม

## 0. วิธีใช้เอกสาร + สภาพแวดล้อม

- เปิด prototype ที่ `http://localhost:8901/index.html` (หรือเปิดไฟล์ตรง) — Viewport **440×956**, ทดสอบทั้ง Light/Dark และ TH/EN ตามที่ระบุในเคส
- **Actor**: `GUEST` = session guest (browse ได้ แต่ action ที่ต้องตัวตนถูก gate) · `MEMBER` = demo `demo@tukdaeng.com` / `Tukdaeng123` (ตัวตนในแอป = `king.mr.fox`) · `NEW` = สมัครใหม่ (profile grid ว่าง) · `OWNER` = member ในฐานะเจ้าของโพสต์ (seller `king.mr.fox`) — โพสต์ของตัวเองได้มาจาก composer (FO-TEST-05) หรือ gfx posts บน own profile
- **Type**: UI = การแสดงผล · Func = การทำงาน · Int = เชื่อมข้าม module · Edge = negative/boundary
- **Priority**: High = core flow/กติการะบบ · Medium = feature หลัก · Low = edge/cosmetic
- **[GATE]**: guest แตะ selector ใน `GUEST_GATE_SEL` → `obGate()` = Member Sheet "Join TukDaeng" — ใน scope viewer/detail ที่ถูก gate คือ `.like-btn` `.save-btn` `.share-btn` `.wl-btn` `.mf-btn` `.ask-pill` `.chat-fab` `.follow-btn` `.pf-foll` `.lk-follow` `.comment-input` `.emoji-row` `.c-like` `.c-meta` `.post-head .more` `.pm-btn` และทุก `.pm-*` row — ที่**ไม่**ถูก gate (guest เปิดดูได้): tile/back/photo carousel/`.comment-btn`/`.pv-add`/`.liked-by`/`.details-toggle`/`.pv-dt`/`.view-full`/`.detail-back`/hashtag — เคส [GATE] ต้องทำคู่ guest+member (sheet mechanics อยู่ FO-TEST-01/17)
- **Layer model**: `.page-pv` (viewer) อยู่เหนือ `.page-sub`; `.page-detail` อยู่เหนือ viewer เสมอ — เปิด detail จาก viewer ผ่าน "View full detail ›" จะคง `pv-open` ไว้ `detail-back` จึงเผย viewer ข้างล่าง; เปิดจาก feed card (ไม่มี sub/pv ข้างล่าง) `detail-back` กลับ feed
- **Viewer 3 โหมด** ใน `.page-pv` เดียว (เลือกจาก args ของ `openPostViewer`):
  1. **Immersive** (ไม่มี `.feed`/`.pfp`) — `.pv-head` (back + แว่นขยาย) + `.pv-track` ของ `.post.pv-post` เต็มจอ — เปิดจาก `xp-tile` (explore grid หน้า search landing + grid ผลการค้นหา) เท่านั้น
  2. **Feed mode** (`.feed`) — `.svd-head` (back + ชื่อ collection + แว่นขยาย) + `.svf-track` ของ `.svf-post` (reused feed card) — เปิดจาก `svd-tile` (Saved/Wish List/Archive grids)
  3. **Profile mode** (`.pfp`) — head มี back + `<ชื่อ surface>/<user>` + `pfp-follow` pill (เฉพาะ user ≠ ตัวเอง + ยังไม่ follow + ไม่ block) + `.svf-track` ของ `.pfp-post` — เปิดจาก `pf-tile` (profile grid) และ alert rows (solo)
- **กติกา entry**: viewer เปิดได้เฉพาะ grid tiles / notifications — รูปบน feed card แตะแล้วเป็นแค่ carousel ไม่เปิด viewer (เคสลบ PV-009)
- **Seed data ที่ใช้อ้างในเคส**: `p1` Rolex 126610LN `THB 420,000` (3 รูป, sale, 3 groups) · `p2` Tudor BB41 `THB 145,000` (sale, cfg tg2 = ไม่มี tag) · `p4` Datejust `THB 380,000` (2 รูป) · `p5` Breguet `THB 890,000` (2 รูป, tg2) · `p6` Snowflake `THB 165,000` (1 รูป) · `p3/p7/p8/p9/p10/p11` = showcase (ไม่มี price/specGroups) · SEED_SAVED: `p7+p10`→"Saved", `p2+p11`→"Wish List", `p1+p9`→"Grail list", `p8`→"Vintage picks" · **seed ไม่มีโพสต์ clip เลย — โพสต์คลิปต้องสร้างจาก composer** (SETUP-06)
- **เรื่องเงิน** อ้าง `docs/money-display-rules.md` (DRAFT v0.1): ราคาบนหน้า detail แสดงผ่าน spec group "Price & Data Source" เต็มจำนวน `THB x,xxx,xxx` ไม่มีทศนิยม; Estimated = string ตรงใน mock เช่น `THB 400,000 – 445,000` (ดู GAP-06 เรื่องรูปแบบ range)
- **สิ่งที่อยู่นอก scope** (เคสอยู่ task อื่น — ห้ามซ้ำ): feed card internals + actions บน feed หลัก (FO-TEST-03), composer (FO-TEST-05), **mechanics ภายใน bottom sheets** — comments/likes/share/save/wishlist/watch-alert/details sheets ใน FO-TEST-06 เช็คเฉพาะ "เปิดเข้าได้จาก viewer/detail + state sync ที่มองเห็นบน surface ข้างล่าง" เท่านั้น (FO-TEST-07), profile page/search page/saved hub/alerts list ตัวเอง (FO-TEST-09/10/08/12), report flow ข้างใน (FO-TEST-15), Member Sheet (FO-TEST-01/17), dev sidebar variants (harness ไม่ใช่ production flow — ยกเว้น `POST_DETAIL_CFG` ที่ผูกกับโพสต์จริงและต้องเทสต์)

## 1. Coverage Map ของ task นี้ (เทียบ inventory §2)

| Route/Feature (inventory §2) | TC ID ที่ครอบ |
|---|---|
| `xp-tile` → `pv-open` immersive (search landing + results grid) | PV-001 – 002, PV-011 |
| `svd-tile` → `pv-open` feedMode (Saved/Wish List/Archive) | PV-003 – 005, PV-026 – 029 |
| `pf-tile` → `pv-open` profile mode (pin-tab aware) | PV-006, PV-034 – 038 |
| alert rows (like/comment/watch) → `pv-open` solo | PV-007 – 008, PV-039 |
| `pv-back` / `pv-srch` / layer ปิด viewer | PV-010 – 012 |
| `.pv-post` rail/foot (`like-btn`/`liked-by`/`comment-btn`/views/`share-btn`/`save-btn`/`pm-btn`/follow/`pv-add`/`pv-dt`/caption `more-link`) | PV-013 – 025 |
| photo carousel `.post-photo`/`.detail-hero` (tap/swipe/counter/dots) | PV-026 – 029, DET-007 |
| clip `.clip-ph` autoplay/badge/progress | PV-030 – 033, DET-020 – 023 |
| `pfp-follow` pill + watch-alert inject | PV-035 – 039 |
| `pm` / `pm-own` menus (incl. reportOnly ใน pfp + detail ⋯) | PV-040 – 049, DET-015 |
| `view-full` → `detail-open` + `detail-back` (detail เหนือ viewer) | DET-001 – 005 |
| `.page-detail` dl1 (head/hero/tag/name/ref/desc/specs/actions) + `POST_DETAIL_CFG` | DET-006 – 019 |
| `mf-btn` / `wl-btn` / `share-btn` / `like-btn` / `comment-btn` บน detail `[GATE]` | DET-024 – 029 |
| comments/likes sheet entry + state sync | DET-030 – 033, PV-017 – 019 |
| states: `noComments`/`hideCounts`/views 0/showcase/empty specs/missing post | DET-034 – 037, PV-025 |
| i18n / theme / money spot-check | DET-011, DET-038 – 040 |
| guest coverage รวมของ viewer/detail | PV-012, PV-020 – 021, PV-036, DET-005, DET-025 – 029, DET-031, DET-040 |
| เชื่อม FO-TEST-05 (own post จาก composer) | PV-050 – 053 |

## 2. Test Cases

### 2.1 Entry — viewer modes & tiles

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-PV-001 | เปิด immersive viewer จาก explore tile | MEMBER | Func | member เปิด nav Search → landing (ยังไม่พิมพ์) เห็น `.xp-grid` | 1. แตะ tile รูปแรกของ `p1` 2. สังเกตหน้าจอ | `xp-tile` → `openPostViewer(feedMode=false)` → `.page-pv` immersive ทับ search sub; เปิดที่โพสต์ `p1` รูป index ที่แตะ | `.pv-head` = ← + แว่นขยาย; `.pv-post` เต็มจอรูป `p1` + rail ขวา + foot ล่าง | High | |
| FO-TC-PV-002 | เปิดจาก tile ใน grid ผลค้นหา | MEMBER | Func | search "rolex" → results `.xp-grid.two` | 1. แตะ tile ของ `p4` 2. swipe ลงดูโพสต์ถัดไป | viewer list = เฉพาะผลค้นหา (`searchResults`) ไม่ใช่ทุกโพสต์ — โพสต์ถัดไปใน track คือผลค้นหาลำดับถัดไป | เปิดที่ `p4` ทันที (scrollTop = index×ความสูงจอ) | High | |
| FO-TC-PV-003 | เปิด feedMode viewer จาก Saved tile | MEMBER | Func | Saved hub → collection "Saved" (p7,p10) | 1. แตะ tile ของ `p10` 2. scroll ดูการ์ดอื่น | `svd-tile` → feedMode: `.svd-head` (back + "Saved" + แว่นขยาย) + `.svf-track` การ์ด feed จริง; เปิดเลื่อนไปที่การ์ด `p10` (`offsetTop−86`, การ์ดแรก scrollTop=0) | การ์ด = postCard เต็ม (head/photo/actions/liked-by/caption/Tap for details) ไม่ใช่ immersive | High | |
| FO-TC-PV-004 | feedMode — title ตาม collection | MEMBER | UI | Saved hub | 1. เปิด tile ใน "Wish List" 2. เปิด tile ใน "Grail list" | title head = ชื่อ collection จริง: "Wish List" / "Grail list" (ไม่ใช่ Saved เสมอ) | title ตรงหน้าที่มา | Medium | |
| FO-TC-PV-005 | feedMode — Archive tile | MEMBER | Func | มีโพสต์ archived ≥1 (pm-own → "Archive" โพสต์ตัวเองก่อน) | 1. เปิด Archive sub 2. แตะ tile | `.arc-grid` tile → feedMode viewer title "Archive" list = `archivePosts()` เท่านั้น | การ์ดโพสต์ archived แสดงปกติใน track | Medium | |
| FO-TC-PV-006 | เปิด profile viewer (pfp) จาก grid tile | MEMBER | Func | เปิด profile ของ `Watch 777` (แตะชื่อ seller บนการ์ด p1) → แท็บ Posts | 1. แตะ grid tile ใบกลาง | `pf-tile` → `openPostViewer(user="Watch 777")` → `.pfp` mode; track = `pfTabPosts` ของแท็บนั้น (`scr._pinTab` เก็บ tab ไว้ให้เมนู Pin); เลื่อนไปที่ tile ที่แตะ | head: ← + "Posts" / `Watch 777` + pill "Follow" (เพราะยังไม่ follow); `.pfp-post` = การ์ด feed-parity | High | |
| FO-TC-PV-007 | เปิด solo viewer จาก alert watch row | MEMBER | Func | Alerts มี watch row (`a.type==="watch"`) | 1. แตะ watch row | `openPostViewer([post], pid, "Post", seller)` + `.pfp-tt.solo` — viewer มีโพสต์เดียว; ถ้ายังไม่ follow seller → `pfp-follow` ถูกเอาออกแล้วใส่ "Follow" ใน `.post-head` ของการ์ดแทน | การ์ดเดียว ไม่มีโพสต์อื่นให้ swipe | High | |
| FO-TC-PV-008 | solo viewer จาก like/comment alert | MEMBER | Func | Alerts มี like/comment row ชี้โพสต์ตัวเอง | 1. แตะ like row 2. แตะ comment row | `openPostViewer([post],"Post", king.mr.fox)` solo — user = ตัวเองจึงไม่มี follow pill; โพสต์ที่ถูกลบแล้ว → toast "This post is no longer available" ไม่เปิด viewer | title "Post"/`king.mr.fox` | Medium | |
| FO-TC-PV-009 | กติกา entry — feed photo ไม่เปิด viewer | MEMBER | Edge | อยู่ feed หลัก | 1. แตะรูปกลางการ์ด `p1` บน feed | เป็นแค่ carousel (เปลี่ยนรูป) — `.page-pv` **ไม่เปิด** (viewer เฉพาะ grid tiles/notifications ตามกติกา) | feed นิ่ง ไม่มี overlay | High | |
| FO-TC-PV-010 | `pv-back` ปิด viewer กลับ sub เดิม | MEMBER | Func | viewer เปิดจากทุก entry | 1. เปิด viewer จาก explore tile 2. แตะ ← 3. ทำซ้ำจาก saved tile + profile tile | `pv-open` ถูกเอาออก → หน้าข้างล่างโผล่ครบ: search landing (ค่า chip/q เดิม) / saved collection / profile grid — state sub ไม่ถูก reset | กลับหน้าเดิมตำแหน่งเดิม | High | |
| FO-TC-PV-011 | `pv-srch` แว่นขยายบน viewer | MEMBER | Func | immersive viewer จาก search results + feedMode viewer จาก Saved | 1. (search) แตะแว่นขยาย 2. (saved) แตะแว่นขยาย | search: ปิด viewer → กลับ search sub โหมด typing (cursor พร้อมพิมพ์); saved: ปิด viewer → saved sub re-render กลับ grid (quirk — ปุ่มแว่นขยายทำหน้าที่เหมือน back อีกทางใน feedMode) | ไม่ค้างบน viewer | Medium | |
| FO-TC-PV-012 | guest เปิด viewer ได้ (browse) | GUEST | Func | guest session เปิด explore tile | 1. แตะ tile 2. swipe ดูหลายโพสต์ 3. แตะ ← | guest เปิด/swipe/ปิด viewer ได้ปกติ (tile/back ไม่อยู่ใน gate) — เฉพาะ action ข้างในที่ gate | viewer แสดงเต็มเหมือน member | High | |

### 2.2 Immersive `.pv-post` — rail/foot/actions

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-PV-013 | anatomy ของ pv-post | MEMBER | UI | immersive viewer เปิดที่ `p1` | 1. สังเกตทั้งจอ | — | `.pv-img` เต็มจอ + grad มืดล่าง; rail ขวาบนลงล่าง: ♡, "Likes", 💬+2, 👁1.2K, share, 🔖, ⋯; foot: avatar+`Watch 777`+"Follow", caption ย่อ + "…", "Tap for details"; ล่างสุด "Add comment…" | High | |
| FO-TC-PV-014 | vertical swipe ระหว่างโพสต์ | MEMBER | Func | viewer list มี ≥3 โพสต์ | 1. swipe ขึ้น 2 ครั้ง 2. swipe ลง 1 ครั้ง | `.pv-track` scroll ทีละเต็มจอ (post ต่อไป/ก่อนหน้า) — ขึ้น = โพสต์ถัดไปใน list | แต่ละ pv-post snap เต็ม viewport | High | |
| FO-TC-PV-015 | โพสต์หลายรูปใน immersive = รูปเดียว (quirk) | MEMBER | Edge | เปิด tile รูปที่ 2 ของ `p4` (มี 2 รูป) | 1. สังเกตรูป + พยายามแตะซ้าย/ขวาบนรูป | `pvPostHTML` แสดง `photos[phi]` รูปเดียว — **ไม่มี carousel/dots/counter** ใน immersive (แตะรูปไม่เกิดอะไร) — บันทึกเป็น quirk ของโหมดนี้ | ไม่มี "1/2" หรือ dots | Medium | |
| FO-TC-PV-016 | like-btn บน rail | MEMBER | Func | viewer เปิดที่ `p3` (ยังไม่ like) | 1. แตะ ♡ 2. แตะอีกครั้ง | toggle `post.liked` — หัวใจแดง⇄ออก; state sync ไปยังการ์ด feed/detail ของโพสต์เดียวกันด้วย | icon เปลี่ยนสถานะทันที | High | |
| FO-TC-PV-017 | "Likes" label → likes sheet (entry) | MEMBER | Func | viewer เปิด | 1. แตะ "Likes" บน rail | `likes-open` + lk sheet เด้งคร่อม viewer (owner ของ post เห็น count, คนอื่นเห็น "and others" — mechanics อยู่ FO-TEST-07) | sheet ขึ้นจากล่างเหนือ pv | Medium | |
| FO-TC-PV-018 | comment-btn → comments sheet (entry) | MEMBER | Func | viewer เปิดที่ `p1` | 1. แตะ 💬 | `comments-open` + comments sheet ของ `p1` เด้ง (จำนวน 2 แสดงบน icon ก่อนแตะ) — sheet internals อยู่ FO-TEST-07 | sheet ทับ viewer | Medium | |
| FO-TC-PV-019 | "Add comment…" → comments sheet | MEMBER | Func | viewer เปิด | 1. แตะ "Add comment…" | pv-add → `nt` variant comments sheet (ไม่ถูก gate — guest เปิดได้ แต่ช่องพิมพ์ใน sheet gate อยู่) | sheet เปิดโฟกัสช่อง comment | Medium | |
| FO-TC-PV-020 | share-btn / save-btn — guest `[GATE]` | GUEST + MEMBER | Func | viewer เปิด | 1. (guest) แตะ share 2. (guest) แตะ 🔖 3. (member) แตะทั้งสอง | guest: ทั้งคู่ ∈ `GUEST_GATE_SEL` → Member Sheet เด้ง sheet ไม่เปิด; member: share → sh sheet, 🔖 → sv sheet (entry เท่านั้น mechanics อยู่ FO-TEST-07) | Member Sheet ทับ pv; member เห็น sheet จริง | High | |
| FO-TC-PV-021 | like-btn — guest `[GATE]` | GUEST + MEMBER | Func | viewer เปิด | 1. (guest) แตะ ♡ 2. (member) แตะ ♡ | guest: `.like-btn` ∈ gate → Member Sheet; member: toggle ปกติ | ตาม gate | High | |
| FO-TC-PV-022 | follow-btn ใน pv-foot + seller link | MEMBER | Func | viewer เปิด `p8` (seller `dial.dude`, ยังไม่ follow) | 1. แตะ "Follow" ข้างชื่อ 2. แตะ avatar/ชื่อ seller | Follow → `setFollowing` on (ปุ่มเปลี่ยน/หายตาม render; ผลไปทุก surface); แตะชื่อ/avatar → `data-pf-user` เปิด profile sub ของ `dial.dude` ทับ viewer | ปุ่ม "Follow" แสดงเฉพาะโพสต์ที่ยังไม่ follow | Medium | |
| FO-TC-PV-023 | caption "…" → ps sheet | MEMBER | Func | viewer เปิดโพสต์ที่ captionFull ยาวกว่า caption | 1. แตะ "…" ท้าย caption | `more-link` ใน pv-post → `comments-open` + `ps` variant = caption sheet (seller head + caption เต็ม + time + comments preview) | sheet ไม่ใช่ inline expand (ต่างจาก feed card) | Medium | |
| FO-TC-PV-024 | "Tap for details" → dt sheet → "View full detail ›" | MEMBER | Func | viewer เปิด `p1` (มี specGroups) | 1. แตะ "Tap for details" 2. แตะ "View full detail ›" | pv-dt → `details-open` + dt sheet (detailsHTML เต็ม + link); "View full detail ›" → `openPostDetail` — detail เลื่อนทับ viewer (`pv-open` ยังอยู่) | sheet มีราคา "THB 420,000" แถวบน + specs ย่อ; detail เต็มจอเหนือ viewer | High | |
| FO-TC-PV-025 | ไม่มี "Tap for details" บน showcase | MEMBER | UI | viewer เปิด `p3` (specGroups=[]) | 1. ดู foot ของ pv-post | `hasSpecs=false` → ไม่ render ปุ่ม `pv-dt` เลย — ไม่มีทางเข้า detail จากโพสต์ showcase ใน immersive viewer | foot มีแค่ seller+caption | Medium | |

### 2.3 Photo carousel + dots (`.post-photo` ในการ์ด svf/pfp + `.detail-hero`)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-PV-026 | tap ซ้าย/ขวาครึ่งรูป (wrap) | MEMBER | Func | feedMode/pfp viewer เปิดการ์ด `p1` (3 รูป) | 1. แตะครึ่งขวา 2 ครั้ง 2. แตะครึ่งขวาอีกครั้ง | `applyPhoto` index+1 ต่อแตะ: 1→2→3→**วนกลับ 1** (tap wrap-around); แตะครึ่งซ้ายที่รูป 1 → วนไปรูปสุดท้าย | counter "2/3"→"3/3"→"1/3"; dot `.on` ตาม index | High | |
| FO-TC-PV-027 | swipe ซ้าย/ขวา (bounded) | MEMBER | Func | การ์ดหลายรูป | 1. swipe ซ้ายจากรูป 1 2. swipe ซ้ายที่รูปสุดท้าย | threshold `min(64, 20% ความกว้าง)` ผ่าน → เปลี่ยนรูป; ที่ขอบแรก/สุดท้าย swipe = ต้าน (resistance) **ไม่วน** ต่างจาก tap | รูปลากตามนิ้วแล้วเด้งกลับเมื่อเกินขอบ | High | |
| FO-TC-PV-028 | swipe แนวตั้งไม่กิน carousel | MEMBER | Edge | การ์ดหลายรูปใน svf/pfp track | 1. กดบนรูปแล้วลากแนวตั้ง >แนวนอน | gesture แนวตั้งถูกยกเลิก carousel → track scroll ต่อได้ตามปกติ (scroll ชนะ) | ไม่ติดเปลี่ยนรูประหว่าง scroll หน้า | Medium | |
| FO-TC-PV-029 | dots + counter เฉพาะหลายรูป | MEMBER | UI | เทียบการ์ด `p1` (3 รูป) กับ `p2` (1 รูป) | 1. ดู photo ของทั้งสองการ์ด | รูปเดียว → ไม่มี counter/dots เลย; หลายรูป → counter "1/3" มุมขวาบน + dots ใต้รูป (เฉพาะ detail/การ์ด — immersive ไม่มี) | dot .on = รูปแรกเสมอตอนเปิด | Medium | |

### 2.4 Clip autoplay / badge / progress (`.clip-ph`)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-PV-030 | clip บนการ์ดใน pfp/feedMode viewer | MEMBER | Func | SETUP-06: own clip post บน own profile → pfp viewer | 1. เปิด viewer เลื่อนให้ clip อยู่กลางจอ 2. เลื่อนจน clip หลุดจอ | `feedClipTick` 100ms: เล่นเฉพาะ media เห็น >55% ของความสูง; ใน `.page-pv` เล่นได้เพราะ `sub-open` ยังอยู่; เลื่อนออก → หยุด+reset | badge "▶ 0:xx" นับถอยหลัง + progress bar เดิน; หลุดจอ badge กลับเวลาเต็ม | High | |
| FO-TC-PV-031 | badge reset เมื่อถึง 0 + reset ต่อ slide | MEMBER | Func | clip post หลาย media (SETUP-06 เลือก clip ไม่ใช่ใบแรก) | 1. รอ badge นับถึง 0 2. เปลี่ยน slide ไปรูปอื่นแล้วกลับ | ถึง 0 → countdown วนใหม่จาก `dur0`; `applyPhoto`→`phClipSet` reset เวลา/progress เฉพาะ slide นั้น | progress bar หดถึง 0 แล้วเต็มใหม่ | Medium | |
| FO-TC-PV-032 | clip ใน immersive viewer = ไม่มี UI | MEMBER | Edge | own clip post เจอใน search/explore → immersive viewer | 1. เปิด tile ของ clip post | `pvPostHTML` ไม่มี `.clip-ph`/badge เลย — immersive แสดงรูปนิ่งเสมอ (quirk: clip เล่นเฉพาะบนการ์ด + detail hero) | ไม่มี badge/progress บน pv-post | Medium | |
| FO-TC-PV-033 | ไม่มี mute/volume control | MEMBER | UI | clip กำลัง autoplay บนการ์ด/detail | 1. หา control เสียงบน media | prototype ไม่มีปุ่ม mute/unmute — clip เป็น visual countdown (badge+bar) เท่านั้น ไม่มีเสียงจริง → บันทึก GAP-03 | ไม่มี icon ลำโพง/ปุ่มเสียง | Low | |

### 2.5 pfp viewer + Follow pill + menus

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-PV-034 | pfp head anatomy + back | MEMBER | UI | pfp viewer จาก `Watch 777` tile | 1. ดู head 2. แตะ ← | head: ← + `<b>Posts</b>`/`Watch 777` + spacer + "Follow" pill; back → กลับ profile grid แท็บเดิม | ไม่มีแว่นขยายใน pfp head (ต่างจาก immersive/feedMode) | Medium | |
| FO-TC-PV-035 | `pfp-follow` pill — member | MEMBER | Func | pfp viewer ของ user ที่ยังไม่ follow | 1. แตะ "Follow" บน head 2. รอ ~1.5s | `pfSetFollow` on → pill flip "Following" → fade + ถูก remove หลัง ~1.2s (IG behavior); ผล follow sync ทั้งแอป | pill หายจาก head | High | |
| FO-TC-PV-036 | `pfp-follow` — guest `[GATE]` | GUEST + MEMBER | Func | pfp viewer ของ user ที่ยังไม่ follow | 1. (guest) แตะ pill 2. (member) แตะ pill | guest: `.pf-foll` ∈ gate → Member Sheet ไม่มีการ follow; member: follow ปกติตาม PV-035 | Member Sheet ทับ viewer | High | |
| FO-TC-PV-037 | ไม่มี pill เมื่อ follow แล้ว/ตัวเอง/blocked | MEMBER | Edge | เปิด pfp ของ (a) seller ที่ follow แล้ว (b) own profile (c) blocked user | 1. ดู head ทั้ง 3 กรณี | `hf` render เฉพาะ `user≠me && !following && !blocked` — ทั้ง 3 กรณี head ไม่มี pill | head ว่างช่วงขวา | Medium | |
| FO-TC-PV-038 | tab context (`_pinTab`) กับ grid แท็บอื่น | MEMBER | Func | own profile → แท็บ "Sold" → แตะ tile → ⋯ บนการ์ด | 1. เปิด viewer จากแท็บ Sold 2. เปิด ⋯ | `scr._pinTab="sold"` ถูกส่งเข้า `pmOwnMenuHTML` → แถว Pin อ่านสถานะจากแท็บ sold (โพสต์ในแท็บนี้แสดง "View sale record" แทน "Edit") | เมนู own ตรง context แท็บ | Medium | |
| FO-TC-PV-039 | watch-alert solo: follow ถูก inject ในการ์ด | MEMBER | Func | watch alert row ของ seller ที่ยังไม่ follow | 1. เปิด solo viewer 2. ดู `.post-head` การ์ด | head pill ถูก remove → มี "Follow" ถูกแทรกหน้า ⋯ ในหัวการ์ดแทน; แตะ → follow ปกติ (guest → gate) | ปุ่มอยู่ใน head การ์ดไม่ใช่ head viewer | Medium | |
| FO-TC-PV-040 | ⋯ บน pfp card (คนอื่น) = reportOnly | MEMBER | Func | pfp viewer ของ `Watch 777` | 1. แตะ ⋯ บนหัวการ์ด `p1` | art มี `.pfp-post` → `pmMenuHTML(reportOnly)` = sheet แถวเดียว "Report" (ไม่มี Add to favorites / Not interested — ต่างจาก feed/immersive) | pm sheet สั้นแถวเดียว danger | High | |
| FO-TC-PV-041 | ⋯ บน pv rail / card ของคนอื่น = pm เต็ม | MEMBER | Func | immersive viewer `p1` + feedMode viewer | 1. แตะ ⋯ บน rail (immersive) 2. แตะ ⋯ บนหัวการ์ด (feedMode) | pm เต็ม: กลุ่ม fav (เฉพาะ following หรือเคย fav — `p1` seller ไม่ follow → ไม่มีแถว) + "Not interested" + "Report" | แถวตาม canFav | High | |
| FO-TC-PV-042 | pm "Add to favorites" ⇄ "Remove from favorites" | MEMBER | Func | viewer ของ `p2` (seller `the watch` follow อยู่ → canFav) | 1. ⋯ → "Add to favorites" 2. ⋯ อีกครั้ง → "Remove from favorites" | `setFavorite` + toast "Added to favorites"/"Removed from favorites"; แถวสลับ label+icon ตาม `post.favorite` | sheet ปิดหลังเลือก + toast | Medium | |
| FO-TC-PV-043 | pm "Not interested" | MEMBER | Func | immersive/feedMode viewer | 1. ⋯ → "Not interested" | `post.ni=true` → โพสต์หายจาก feed (niCard แทน) — บน viewer การ์ดยังอยู่จน re-render (memory-only) | toast/การ์ด feed หลังเปลี่ยน | Medium | |
| FO-TC-PV-044 | pm "Report" → report flow entry | MEMBER | Func | viewer เปิด | 1. ⋯ → "Report" | `pmDropCovered` ปิด sheet ทันที + `rpOpenFromPost` → report sub เลื่อนทับ (`rp-over`) — flow ภายในอยู่ FO-TEST-15 | report page ทับ viewer | Medium | |
| FO-TC-PV-045 | ⋯ บน own post = pm-own ครบ 6 แถว | OWNER | Func | pfp viewer ของตัวเอง หรือ ⋯ บน own card | 1. แตะ ⋯ บนโพสต์ตัวเอง (ไม่ใช่ sold) | `isOwnPost` → pmOwnMenuHTML: "Archive" · "Turn off commenting" · "Edit" · "Mark as sold" · "Pin to top of grid" · "Delete"(danger) | 6 แถวเต็ม ไม่ใช่ reportOnly | High | |
| FO-TC-PV-046 | pm-own "Archive" ⇄ "Unarchive" | OWNER | Func | pm-own เปิดอยู่ | 1. แตะ "Archive" 2. ⋯ อีกครั้ง 3. แตะ "Unarchive" | toggle `post.archived` (+`archivedAt`, เอา pins ออกตอน archive) + `refreshPostViews` ทุก surface; แถวสลับ label ตามสถานะ | โพสต์หายจาก feed หลัก / กลับมา | Medium | |
| FO-TC-PV-047 | pm-own "Turn off commenting" ⇄ "Turn on commenting" | OWNER | Func | pm-own เปิดอยู่ | 1. แตะ "Turn off commenting" 2. ดูการ์ด 3. เปิดอีกครั้ง → "Turn on commenting" | toggle `post.noComments` → ปุ่ม 💬 หายจากการ์ด/viewer rail/detail ของโพสต์นั้น + แถวสลับ label | comment icon หาย/กลับ | Medium | |
| FO-TC-PV-048 | pm-own "Pin to top of grid" + sold post | OWNER | Func | pm-own จากแท็บ Posts (a) โพสต์ปกติ (b) โพสต์ sold | 1. แตะ "Pin to top of grid" 2. บน sold post เปิด ⋯ | pin → `pins[tab]` set + refresh (เกิน limit 3 → dialog เลือกแทนตัวเก่าสุด); sold post: แถว "Edit" กลายเป็น "View sale record" และไม่มี "Mark as sold" | pin ติดขอบบน grid หลังกลับ profile | Medium | |
| FO-TC-PV-049 | pm-own "Delete" → confirm + ลบจริง | OWNER | Func | pm-own เปิดอยู่ | 1. แตะ "Delete" 2. อ่าน dialog 3. ยืนยัน | `dialog-open` confirm กลางจอ (ลบถาวร) → ยืนยันแล้วโพสต์ถูกลบจาก `PF_MINE`/list + refresh ทุก surface (ยกเลิก = ปิดเฉย ๆ) | โพสต์หายจาก grid/feed | High | |

### 2.6 Detail — entry + layering

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-DET-001 | "View full detail ›" จาก viewer → detail เหนือ pv | MEMBER | Func | immersive viewer `p1` → dt sheet เปิด | 1. แตะ "View full detail ›" | `details-open` ถูกเอาออกแต่ **`pv-open` ค้าง** → `.page-detail` เลื่อนทับ viewer; `detailPid=p1` | detail เต็มจอ; เงา viewer ไม่เห็น (ทับสนิท) | High | |
| FO-TC-DET-002 | `detail-back` เผย viewer ข้างล่าง | MEMBER | Func | detail เปิดอยู่เหนือ viewer (DET-001) | 1. แตะ ← บน detail head | `detail-open` ออก → viewer โผล่ตำแหน่งเดิม (โพสต์เดิม scroll เดิม) — **กติกา: detail อยู่เหนือ viewer เสมอ** | pv-post เดิมกลับมา | High | |
| FO-TC-DET-003 | "Tap for details" → "View full detail ›" จาก feed card | MEMBER | Func | feed หลักการ์ด `p1` | 1. แตะ "Tap for details" ใต้ caption 2. แตะ "View full detail ›" | `details-toggle` ขยาย specs inline ใต้ caption (ปุ่มกลาย "Hide details"); view-full → `openPostDetail` — ครั้งนี้ **ไม่มี pv/sub ข้างล่าง** → detail-back กลับ feed | inline details + link; detail ทับ feed | High | |
| FO-TC-DET-004 | detail จาก pfp/svf card | MEMBER | Func | feedMode/pfp viewer การ์ด `p4` | 1. "Tap for details" → "View full detail ›" 2. ← detail-back | card → inline details → view-full → detail ทับ viewer (pv-open ค้าง); back → viewer ตำแหน่งเดิม | เหมือน DET-001/002 บน card mode | Medium | |
| FO-TC-DET-005 | detail เปิดจาก guest (browse) | GUEST | Func | guest เปิด viewer → dt → view-full | 1. เปิด detail ของ `p1` 2. แตะ ← | guest เปิด/อ่าน detail ได้ครบ (view-full/back ไม่ gate) — เฉพาะ action ที่ gate | detail render เต็มเหมือน member | Medium | |

### 2.7 Detail — content (dl1)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-DET-006 | detail head + hero anatomy | MEMBER | UI | detail ของ `p1` | 1. ดู head + hero | head (ย้ายเข้าใน `.detail-scroll`): ← + title "Detail" + ⋯ (`pm-btn`); hero: รูป + counter "1/3" มุมขวาบน + dots ใต้รูป | ตรง dl1 layout | High | |
| FO-TC-DET-007 | hero photo nav + dots | MEMBER | Func | detail `p1` | 1. แตะขวา/ซ้ายครึ่งรูป 2. swipe | `.detail-hero` ใช้ handler เดียวกับการ์ด: tap wrap + swipe bounded + counter/dots update | counter "n/3" + dot .on ตรง | High | |
| FO-TC-DET-008 | tag FOR SALE + name/ref/desc | MEMBER | UI | detail `p1` | 1. ดูใต้ action row | tag "FOR SALE"; `detail-name` = "Rolex Submariner Date" (Brand+Model จาก specs); `detail-ref` = "Ref. 126610LN"; หัว "Descriptions" + `p.desc` เต็ม | name จาก specs ไม่ใช่ caption ดิบ | High | |
| FO-TC-DET-009 | tg2 — p2/p5 ไม่มี tag | MEMBER | Edge | detail `p2` และ `p5` | 1. เปิด detail 2. ดูตำแหน่ง tag | `POST_DETAIL_CFG` ทั้งคู่ `tg:"tg2"` → `saleTagHTML` คืนค่าว่าง — **ไม่มี FOR SALE tag** แม้เป็น sale (cfg จริงของโพสต์ ไม่ใช่ dev toggle) | ไม่มี inline-tag | Medium | |
| FO-TC-DET-010 | spec groups ครบ 3 กลุ่ม + Price & Data Source | MEMBER | Func | detail `p1` | 1. scroll ผ่าน spec sections | `detailSpecsHTML` render **ทุกกลุ่มรวม "Price & Data Source"** (ต่างจาก details sheet ที่ filter ออก): "Watch Specifications" 20 แถว, "Item Details" 4 แถว, "Price & Data Source" 4 แถว — แต่ละกลุ่ม head + rows label/value | โครง ds=full: แถว 2 คอลัมน์ l/v | High | |
| FO-TC-DET-011 | ราคาใน spec rows ตาม money rules | MEMBER | UI | detail `p1` | 1. อ่าน "Price & Data Source" | Asking Price "THB 420,000" · Estimated Market Price "THB 400,000 – 445,000" (literal ตาม mock — ดู GAP-06) · Last Price Update "2026-10-07" · Data Source "TukDaeng Market Data" — เต็มจำนวน comma ไม่มีทศนิยม | ไม่มี ฿/ทศนิยม | High | |
| FO-TC-DET-012 | ไม่มี price element แยกใน dl1 | MEMBER | Edge | detail `p1` | 1. หา element ราคาโดด ๆ | dl1 ไม่มี `.detail-price`/price row แยก — ราคามีเฉพาะใน spec group เท่านั้น (pr1–4 มีผลเฉพาะ dl2 harness) | ราคาอยู่ใน spec rows เดียว | Medium | |
| FO-TC-DET-013 | showcase ไม่มีทางเข้า detail จากการ์ด | MEMBER | Edge | feed/feedMode การ์ด `p3` (specGroups=[], price=null) | 1. ดูใต้ caption การ์ด `p3` 2. ลองหา "Tap for details" | `hasDetails = price‖specGroups‖specs` → showcase ไม่ render trigger/details-toggle เลย → **ไม่มีทางเข้า detail จากการ์ด/viewer** (เข้าได้เฉพาะ path อื่นเช่น chat post card — นอก scope) → บันทึก GAP-04 | ไม่มีปุ่ม "Tap for details" ใต้ caption | Medium | |
| FO-TC-DET-014 | hashtag ใน desc → search | MEMBER | Func | detail `p1` | 1. แตะ `#Rolex` ใน Descriptions | `.igd-tag` → `openSub("search")` query = `#Rolex` mode results ทับ detail | search sub เปิดผล `#Rolex` | Low | |
| FO-TC-DET-015 | detail ⋯ = pm ตาม ownership | MEMBER + OWNER | Func | detail `p1` (คนอื่น) + detail own post | 1. แตะ ⋯ บน detail head ทั้งสองกรณี | `pmPid=detailPid` (ไม่มี `.post` ancestor): คนอื่น → pm เต็ม (ไม่ใช่ reportOnly เพราะไม่ใช่ pfp-post); ตัวเอง → pm-own 6 แถว | เมนูตรง owner | High | |
| FO-TC-DET-016 | detail scroll ลื่น + head ติดบน | MEMBER | UI | detail `p1` | 1. scroll ลงสุด spec 2. scroll กลับ | `.detail-scroll` scroll ภายใน; head อยู่ใน scroller (prepend) → เลื่อนไปพร้อมเนื้อหา (ไม่ fixed) — scrollTop รีเซ็ต 0 ทุกครั้งที่เปิด | เปิดใหม่เริ่มบนสุดเสมอ | Low | |
| FO-TC-DET-017 | เปิด detail ซ้ำ post อื่น | MEMBER | Edge | detail `p1` เปิด → back → เปิด `p6` | 1. เปิด detail `p6` (1 รูป) | `detailPid` เขียนใหม่ + render ใหม่ทั้งหน้า — `p6` ไม่มี counter/dots (รูปเดียว) | ไม่มีของ `p1` ค้าง | Medium | |
| FO-TC-DET-018 | owner section / Ask / save / chat-fab ไม่มีใน dl1 | MEMBER | UI | detail `p1` | 1. หา follow-btn/ask-pill/save-btn/chat-fab บนหน้า | dl1 ไม่ render post-head/owner section, ไม่มี "Ask Seller" pill, ไม่มี save-btn, ไม่มี chat-fab — ทั้งหมดอยู่เฉพาะ dl2 (dev sidebar harness ไม่ใช่ flow จริง) → บันทึก GAP-02 | ปุ่มที่มี: like/💬/👁/share + 🔔mf + 🎁wl | Medium | |
| FO-TC-DET-019 | "related" section ไม่มี | MEMBER | UI | detail `p1` scroll สุด | 1. หาส่วน related posts | ไม่มี related/more-from-seller section ใน detailHTML — ท้ายหน้าคือ spec groups แล้วจบ → บันทึก GAP-05 | ไม่มี grid โพสต์อื่น | Low | |

### 2.8 Detail — clip hero

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-DET-020 | clip hero autoplay — path ไม่มี sub | MEMBER | Func | SETUP-06 own clip post อยู่ feed หลัก → feed card → "Tap for details" → view-full | 1. เปิด detail จาก feed | `.detail-hero.clip-ph` เล่น เพราะ `subOpen=false` (feed ไม่มี sub) — badge นับ + progress เดิน | badge/progress เหมือนการ์ด | High | |
| FO-TC-DET-021 | clip hero เงียบเมื่อมี sub/pv ข้างล่าง | MEMBER | Edge | clip post เปิดผ่าน viewer → view-full | 1. เปิด detail เหนือ pv | `inSub=false` → `on=!subOpen=false` → badge แสดงเวลาเต็มแต่ **ไม่นับถอยหลัง** (quirk: hero clip ไม่เล่นเมื่อ sub เปิดอยู่ข้างล่าง) | badge ค้าง ไม่มี progress | Medium | |
| FO-TC-DET-022 | hero clip reset เมื่อสลับรูป | MEMBER | Func | clip post มีรูปเพิ่ม | 1. เปลี่ยน slide ไปรูปธรรมดาแล้วกลับ | `phClipSet` reset dur/progress ของ slide clip | badge กลับเวลาเต็ม | Low | |
| FO-TC-DET-023 | clip ปิดเมื่อ detail-back | MEMBER | Func | clip กำลังเล่นบน detail | 1. แตะ ← | detail ออกจาก DOM flow (`detail-open` ออก) → tick ไม่เห็น surface → ไม่มี clip เล่นค้าง | ไม่มี badge ลอย | Low | |

### 2.9 Detail — actions + `[GATE]`

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-DET-024 | like-btn บน detail (member) | MEMBER | Func | detail `p3` | 1. แตะ ♡ 2. back ไป viewer ดู rail | toggle liked; rail ♡ บน viewer ข้างล่าง sync เพราะอ่าน `post.liked` เดียวกันเมื่อ re-render | icon สลับทันที | High | |
| FO-TC-DET-025 | like-btn — guest `[GATE]` | GUEST + MEMBER | Func | detail เปิด | 1. (guest) แตะ ♡ 2. (member) แตะ ♡ | guest → Member Sheet ไม่ toggle; member → toggle ปกติ | ตาม gate | High | |
| FO-TC-DET-026 | share-btn — guest `[GATE]` | GUEST + MEMBER | Func | detail เปิด | 1. (guest) แตะ share 2. (member) แตะ share | guest → Member Sheet; member → sh sheet เด้งเหนือ detail (entry เท่านั้น — mechanics FO-TEST-07) | sheet ทับ detail | High | |
| FO-TC-DET-027 | mf-btn 🔔 (follow model → watch alert) — `[GATE]` | GUEST + MEMBER | Func | detail `p1` | 1. (guest) แตะ 🔔 2. (member) แตะ 🔔 3. (member,มี alert อยู่แล้ว) แตะอีกครั้ง | guest → Member Sheet; member → wa sheet เปิด (`_waDraft` ใหม่ หรือโหลด alert ที่มี modelKey เดียวกัน → edit) — icon `.on` เมื่อ `modelFollowing` | title "Follow this model" | High | |
| FO-TC-DET-028 | wl-btn 🎁 (wishlist) — `[GATE]` | GUEST + MEMBER | Func | detail `p4` | 1. (guest) แตะ 🎁 2. (member) แตะ 🎁 | guest → Member Sheet; member → wl sheet (entry) — icon `.saved` เมื่อ `wishlisted` | wl-o/wl-f icon swap | High | |
| FO-TC-DET-029 | detail ⋯ — guest `[GATE]` | GUEST + MEMBER | Func | detail `p1` | 1. (guest) แตะ ⋯ 2. (member) แตะ ⋯ | guest → Member Sheet; member → pm sheet (DET-015) | ตาม gate | High | |

### 2.10 Comments / likes — entry + state sync (mechanics → FO-TEST-07)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-DET-030 | comment-btn บน detail → comments sheet | MEMBER | Func | detail `p1` (comments=2) | 1. แตะ 💬 | comments sheet เปิดพร้อม comments ของ `p1` (seed COMMENTS มีจริง) — จำนวนบน icon ตรง `post.comments` | sheet ทับ detail | Medium | |
| FO-TC-DET-031 | comment-btn — guest เปิด sheet ได้ แต่ input gate | GUEST | Func | detail เปิด | 1. แตะ 💬 2. แตะช่อง "Add a comment…" | `.comment-btn` ไม่ gate → sheet เปิดอ่านได้; แตะ `.comment-input`/emoji → Member Sheet | read-only สำหรับ guest | Medium | |
| FO-TC-DET-032 | lk sheet entry — ไม่มีบน detail dl1 | MEMBER | Func | detail `p1` + viewer `p1` + feedMode card | 1. หา likes row บน detail 2. แตะ "Likes" บน pv rail 3. แตะ liked-by row บนการ์ด | dl1 detail **ไม่มี** likes/liked-by entry (ไม่เหมือน dl2); lk sheet เปิดได้จาก pv rail "Likes" + liked-by row บนการ์ด — liker rows: `likedBy` + pool; owner เห็นจำนวน คนอื่นเห็น "and others" | entry มีเฉพาะ viewer/การ์ด | Medium | |
| FO-TC-DET-033 | state sync like/comment ข้าม surface | MEMBER | Int | viewer `p1` เปิด + detail `p1` เคยเปิด | 1. like บน detail → back → ดู rail viewer 2. unlike → back | state เดียวกัน (`post.liked`) — surface ที่ re-render สะท้อนค่าล่าสุด; การ์ด feed หลักก็ sync (refreshPostViews เมื่อ own-menu/like) | ไม่มีค้างสถานะเก่า | Medium | |

### 2.11 States + edge + i18n/theme

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-DET-034 | `noComments` — ปุ่ม 💬 หายทุก surface | OWNER | Func | own post ตั้ง "Turn off commenting" (PV-047) | 1. เปิด viewer + detail ของโพสต์นั้น | comment-btn ไม่ render บน pv rail/การ์ด/detail แต่ `.pv-add` "Add comment…" **ยังแสดง** และเปิด sheet ได้ (quirk — บันทึก GAP-07) | ไม่มีไอคอน 💬+count | Medium | |
| FO-TC-DET-035 | `hideCounts` / views=0 — ซ่อน views + liked-by | OWNER | Edge | own post ใหม่จาก composer (views:"0") | 1. ดูการ์ด/detail ของโพสต์ | `views-stat` ไม่ render เมื่อ `hideCounts‖!views‖views==="0"`; `liked-by` row ไม่ render เมื่อ `hideCounts‖!likes‖!likedBy` — โพสต์ใหม่ likes:0 → liked-by หาย | ไม่มี 👁 ไม่มี liked-by | Medium | |
| FO-TC-DET-036 | likes นับเฉพาะ own post (privacy) | MEMBER | UI | เทียบ own card กับ card คนอื่นใน pfp viewer | 1. ดู action row ทั้งสอง | `.lk-n` ตัวเลข likes แสดงเฉพาะโพสต์ seller=`king.mr.fox`; คนอื่นเห็นแค่ไอคอน + "and others" | ตัวเลขไม่รั่วบนโพสต์คนอื่น | Medium | |
| FO-TC-DET-037 | missing post — alert like/comment ที่โพสต์ถูกลบ | MEMBER | Edge | ลบ own post ที่ alert ชี้อยู่ (PV-049) แล้วเปิด alerts | 1. แตะ alert row เดิม | `pfTabPosts` ไม่เจอ → toast "This post is no longer available" — viewer ไม่เปิด ไม่ crash | toast ~2s | Medium | |
| FO-TC-DET-038 | i18n — label TH/EN บน viewer+detail | MEMBER | Func | viewer+detail `p1` | 1. สลับ TH สังเกต 2. สลับ EN | pv: "ถูกใจ"/"แตะเพื่อดูรายละเอียด"/"เพิ่มความคิดเห็น…"/"ติดตาม"; detail: "ลงขาย"/"คำอธิบาย"/spec label ตามข้อมูล; เปลี่ยนภาษาขณะ overlay เปิด → re-render ทั้ง pv (`_pvArgs`) + detail (`detailPid`) คง scroll | ไม่มี label ค้างภาษาเดิม | Medium | |
| FO-TC-DET-039 | dark theme — viewer+detail | MEMBER | UI | viewer+detail เปิด | 1. toggle dark | viewer เดิม dark เสมอ (immersive); detail/sheets ตามธีม — ตัวอักษร/ไอคอนอ่านได้ | ไม่มี contrast พัง | Low | |
| FO-TC-DET-040 | guest browse detail ครบ (read-only) | GUEST | Func | guest เปิด detail `p1` | 1. scroll spec ครบ 2. แตะ carousel 3. แตะ hashtag | อ่าน spec/เลื่อนรูป/เปิด search จาก hashtag ได้ปกติ — action ที่ gate เท่านั้นที่เด้ง sheet | read-only เต็ม | Medium | |

### 2.12 Integration — own post จาก composer (FO-TEST-05)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-PV-050 | own sale post → pfp viewer + pm-own | OWNER | Int | SETUP-05: publish sale post จาก composer (มี price+specs) | 1. own profile → Posts tab → แตะ tile ของโพสต์ใหม่ | โพสต์ใหม่ (seller `king.mr.fox`, type sale) อยู่ใน grid → pfp viewer เปิดการ์ด; ⋯ → pm-own ครบ (DET/PV-045) | การ์ดแสดงราคา "THB …" + "Tap for details" | High | |
| FO-TC-PV-051 | own post → detail + spec groups จาก composer | OWNER | Int | SETUP-05 | 1. "Tap for details" → "View full detail ›" | detail render specGroups ที่กรอกใน composer: Watch Specifications + Item Details + Price & Data Source (Asking=ราคาที่ใส่, Estimated=คำนวณระบบ, Data Source) | name = Brand Model จาก spec | High | |
| FO-TC-PV-052 | own clip post → clip autoplay ใน pfp viewer | OWNER | Int | SETUP-06: publish post ที่เลือก clip | 1. own profile → tile ของ clip post | การ์ดใน pfp viewer มี `.clip-ph` + badge เวลา + autoplay (PV-030); ใน immersive (ถ้าเจอใน explore) = รูปนิ่ง (PV-032) | badge นับจริง | Medium | |
| FO-TC-PV-053 | showcase post จาก composer (ไม่ใส่ราคา) | OWNER | Int | publish โพสต์ไม่ใส่ราคา | 1. own profile → tile | type showcase: การ์ดไม่มี price/ไม่มี "Tap for details" (`hasDetails` อาจยัง true ถ้าใส่ specs — เช็คตาม meta ที่กรอก); tag บน detail = "SHOWCASE" ถ้าเข้า detail ได้ | ไม่มี FOR SALE | Medium | |

## 3. Traceability Audit — inventory §2 ↔ เคส

| Inventory item | สถานะครอบคลุม |
|---|---|
| `pv-open` ทุก entry (xp-tile ×2 grid, svd-tile ×3 collection, pf-tile, alert ×3 type) | ✅ PV-001–008, 030–039 |
| viewer 3 mode (immersive/feed/pfp) + solo | ✅ PV-001/003/006/007 |
| swipe ระหว่างโพสต์ + initial position | ✅ PV-002/014 |
| photo carousel tap/swipe/wrap/bounds/dots/counter | ✅ PV-026–029 |
| clip autoplay/badge/progress/reset + quirk | ✅ PV-030–033, DET-020–023 |
| `pv-head` back/search + `pfp-follow` + inject | ✅ PV-010/011/035–039 |
| `pm`/`pm-own` ทุกแถว + reportOnly + pin-tab | ✅ PV-040–049 |
| `detail-open` เหนือ pv + `detail-back` | ✅ DET-001–005 |
| detail content (head/hero/tag/name/ref/desc/specs/money) | ✅ DET-006–019 |
| detail actions + ทุก `[GATE]` (guest+member) | ✅ DET-024–029 + PV-020/021/036 |
| comments/likes entry + sync | ✅ DET-030–033 |
| states: noComments/hideCounts/views0/showcase/missing/solo | ✅ DET-034–037, PV-007/025/051 |
| i18n TH/EN + dark | ✅ DET-038/039 |
| FO-TEST-05 link (own post/clip) | ✅ PV-050–053 |
| sheets internals (nt/lk/sh/sv/dt/ps/wl/wa/uf/nc) | ➡️ entry เท่านั้น — FO-TEST-07 |

## 4. Gaps / Quirks / ข้อสังเกต

- **GAP-01** — รูปใน immersive viewer เป็นรูปเดียว (ไม่มี carousel/dots) ทั้งที่ tile ให้ `phi` ได้ — ต่างจาก IG จริง; เป็น behavior ล็อกของ `pvPostHTML`
- **GAP-02** — ไม่มี owner section / Ask Seller / save-btn / chat-fab / follow-btn บน detail เพราะ production ใช้ dl1 เสมอ (`POST_DETAIL_CFG` ทุก entry = dl1) — ของพวกนี้มีเฉพาะ dl2 ใน dev sidebar (harness) ไม่เขียนเคส production ให้
- **GAP-03** — ไม่มี mute/volume control บน clip ทั้งแอป — clip autoplay เป็น visual countdown (badge+progress) เท่านั้น; คำว่า "mute" ใน inventory หมายถึง mute user ไม่ใช่เสียงคลิป
- **GAP-04** — showcase post เข้า detail แทบไม่ได้ใน flow ปกติ (`hasDetails=false` → ไม่มี "Tap for details"/"View full detail") — เข้าได้เฉพาะผ่านจุดอื่น (เช่น detail ถูกเรียกตรง ๆ); ไม่มีเคส UI ที่บังคับเข้าได้จากหน้าจอจริงนอกจาก chat card (นอก scope)
- **GAP-05** — ไม่มี "related posts"/more-from-seller section บน detail — ไม่อยู่ใน inventory §2 ด้วย ถือว่า intentionally absent
- **GAP-06** — Estimated Market Price ใน mock คือ `"THB 400,000 – 445,000"` (THB ข้างเดียว) ในขณะที่ money-rules §11 ตัวอย่างเขียน `THB 400,000 – THB 445,000` — mock เป็น string literal จึงแสดงตาม mock; รอตัดสินตาม DRAFT (ไม่ใช่ bug ของ flow)
- **GAP-07** — `.pv-add` "Add comment…" ยังแสดงบนโพสต์ `noComments` และเปิด sheet ได้ (comment-btn หายแต่ pv-add ไม่หาย) — quirk
- **GAP-08** — `pv-srch` บน feedMode (Saved/Archive) head ทำหน้าที่เหมือน back อีกปุ่ม (ไม่มี search context ให้กลับ) — quirk เล็ก
- **GAP-09** — detail clip hero ไม่ autoplay เมื่อมี sub/pv เปิดข้างล่าง (`on=!subOpen`) — เล่นเฉพาะ path feed→detail โดยตรง
- **NOTE** — detail head ถูก prepend เข้า `.detail-scroll` (scroll ไปกับเนื้อหา ไม่ fixed); `detail-back` ใน dh4 ใช้ hero-fab (harness)
