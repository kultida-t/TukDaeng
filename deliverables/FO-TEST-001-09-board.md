# FO-TEST-001-09 — Test Cases: Board (นิตยสาร — board / boardall / boardsearch / boardart:id)

> **สืบทอดจาก FO-TEST-02/03/07/08:** กติกาเดิมทั้งหมด (เคสหลัก = ทีละการกระทำ, ทุก [GATE] เทส guest+member คู่, sheet mechanics — backdrop/handle ปิด ไม่มี ESC/drag — เทสใน FO-TEST-07 แล้ว, share sheet เนื้อหาเทสใน FO-TEST-03/07 แล้ว, toast ~2–3s) — task นี้เทสเฉพาะ **entry + เนื้อหา/ปลายทางฝั่ง board** เท่านั้น
> **Source of truth (index.html):** seed `BOARD` `L18150–18166` (15 articles, `BD_BODY` `L18145–18149`, `BD_CATEGORIES` `L18173`, `BD_POPULAR_TAGS` `L18177`) · helpers `bdGet/bdFeatured/bdLatest/bdFilteredJournal` `L18167–18175` · carousel drag/dots `bdGoSlide/bdCarouselScroll/bdStepSlide*` `L18179–18199` + mouse drag `L18209–18265` · `bdCenterPill` `L18201` · markup `bdHeadHTML/bdCardHTML/bdRowHTML/bdListHTML` `L18276–18311` · `boardHomeHTML` `L18312` · `boardAllHTML` `L18349` · `bdResultsHTML` `L18363` · `boardSearchHTML` `L18378` · `boardSearchSync` `L18392` · `boardArticleHTML` `L18398` · `boardClick` `L18445–18587` (incl. dead `data-bdmore`/`data-bdact`/`data-bdsave` branches `L18517–18568`)
> **Handlers:** dispatch `subHTML` `L17807–17810` · boardClick `L21620` (ก่อน navgo `L21622` และ dead check `L22148` เสมอ) · navgo→board `L21630` (`bdQ=""` + openSub swap) · guest gate `L20494` + `GUEST_GATE_SEL` `L23461–23470` (มี `[data-bdlike]`/`[data-bdsave]`/`[data-bdshare]`/`[data-bdact=share|save|report]`) · `.bd-q` input `L20323` · `.sub-back`→`subBack` `L21087–21116` → `rpBack` `L15214` (re-render ทุกครั้ง)
> **ค้นพบสำคัญ (รายละเอียด §4):** `data-bdmore` sheet (Share Article/Copy Link/Save to Favorites/Report Article) wire ครบแต่ **ไม่มีปุ่ม trigger บนหน้าไหนเลย** → article save/report ทั้งคู่เข้าถึงไม่ได้ · `data-bdclear` (X ล้าง search) เป็น dead UI เพราะเข้า boardsearch ด้วย `bdQ=""` เสมอ · back จาก article ทำ `renderSub` ใหม่ → scroll/hero/pill-bar รีเซ็ตบนสุด (ไม่ restore ตำแหน่ง) · เนื้อบทความ `BD_BODY` 3 ย่อหน้าเหมือนกันทุกเรื่อง + author hardcode "Tuk Daeng" · article page **ไม่มี bottom nav** · "No articles in this category" + "Article not found" เป็น unreachable states
> **เขียนเสร็จรอรีวิว — อย่าเพิ่งปิดงาน**

## 0. วิธีใช้ + สภาพแวดล้อม

- เปิด `http://localhost:8901/index.html` (หรือเปิดไฟล์ตรง) · viewport 440×956 · desktop mouse — **hero carousel และแถว category pills ลากด้วย mouse drag** (mousedown/mousemove/mouseup จริง; threshold ~5–6px, snap กลับเข้า slide, suppress click ~120ms หลังลาก)
- **Actors:** GUEST (browse board ได้ฟรีทั้งหมด — gate เฉพาะ like/share/save/report) / MEMBER `demo@tukdaeng.com` / `Tukdaeng123` (= king.mr.fox) / NEW เหมือน member (ไม่มี seed ต่าง)
- **Seed anchors (`BOARD` L18150):** featured (hero 5 ใบ, `feat` 1–5) = b1 Featured "The Perpetual Calendar: A Century of Mastery" · b2 Market Watch "Daytona Prices Stabilize in Q3" · b3 Technical "Understanding Silicon Hairsprings" · b7 Rolex "Rolex Price Development Across Five Years: Factors and Forecasts" · b14 Watch Trends "Best New Watches Under $6,000 in 2026" — latest (ไม่ feat) 10 เรื่องเรียง b4→b11
- **Pill counts (substring บน cat+title):** All=15 · Market Watch=1 (b2) · Rolex=5 (b7,b8,b9,b10,b11 — b8 โดนเพราะ cat "Feature More Rolex Collections") · Technical=1 (b3) · Collector=1 (b4) · Guides=2 (b13,b15) · Industry=1 (b12) → ทุก pill มีผล ≥1 เสมอ
- **Popular tags 6 chips:** Rolex(5)/Daytona(1)/Perpetual Calendar(1)/Titanium(1)/Patina(1)/Grand Seiko(1) — ทุก chip ได้ผล ≥1
- **Layer/z:** board ทุกหน้าอยู่ใน `.page-sub` stack กลาง (`rpPush` สไลด์ขวา, back สไลด์ออกขวา) — board home เปิดด้วย `openSub` swap จาก bottom nav (ไม่สไลด์)
- **Priority:** High = core flow/กติกา (gate, nav, list→article, like/share) · Medium = feature หลัก · Low = edge/quirk/dead-proof
- **dead-list check (ตามที่สั่ง):** dead-list `L22148` = `.nav-item, .sh-add, .act:not(...), .ask-pill, .app-header .icon-btn:not([data-flow]):not(.set-btn):not(.search-btn), .emoji-row, .comment-input, .c-meta` — **ไม่มี selector ของ board** (`data-bd*`/`.bd-*` ทั้งหมดปลอด) และ `boardClick(e)` ถูกเรียกที่ `L21620` **ก่อน** dead check + navgo `L21622` ก่อน `.nav-item` โดน dead → ปุ่ม board ที่ render จริงทำงานครบ; dead ของ board เป็นรูปแบบ "ไม่มี element render" (bdmore/bdsave/bdclear) ไม่ใช่ dead-list

## 1. Coverage map — board routes & overlays (inventory §2.8)

| Route/Overlay (inventory §2.8) | ปกติ | Edge | รวม |
|---|---|---|---|
| `board` home (hero carousel + Latest + View all + bd-head) | BRD-001..007,009..011 | BRD-008,012 (edge/end-note) | 12 |
| `boardall` (all articles + pills + breadcrumb) | BRD-013..016 | BRD-017,022 (drag/back state) | 6 |
| sheet `bdmenu` categories | BRD-018..020 | BRD-021 (guest) | 4 |
| `boardsearch` (search bar + tags + results/empty) | BRD-023..028,032,033 | BRD-029..031 (dead X/Enter/body-no-match) | 11 |
| `boardart:id` (cover/meta/like/share/back) | BRD-034,037 | BRD-035,036,038..040 | 7 |
| like/share actions + [GATE] | BRD-041,042,044..046 | BRD-043 (count ไม่มีบน pill) | 6 |
| sheet `bdmore` + `data-bdsave` (dead wiring) | BRD-047,048 (พิสูจน์เข้าไม่ได้) | — | 2 |
| navigation/state/i18n/theme/edge | BRD-049..058 | (ในตาราง) | 10 |
| **รวม** | | | **58** |

## 2. Test cases

### 2.1 Board tab + home + hero carousel

| TC ID | Steps | Expected | Actor | Priority | Note |
|---|---|---|---|---|---|
| FO-TC-BRD-001 | [GATE-inverse] guest: แตะแท็บ Board บน bottom nav → ปิด → member ทำซ้ำ | guest → **board home เปิดได้ฟรี ไม่มี Member Sheet** (ต่างจาก chat/alerts/profile tab); member → board home เปิดแบบ swap ไม่สไลด์ | GUEST/MEMBER | High | `[data-navgo="board"]` ไม่อยู่ใน GUEST_GATE_SEL; L21630 |
| FO-TC-BRD-002 | member: อ่านหน้า board home | bd-head: burger (ซ้าย) + brand "TUK DAENG \| Board" (TUK DAENG สีแดง) + search icon (ขวา); hero carousel; section "Latest Articles" + ปุ่ม "View all ›"; list 10 แถว; "You're all caught up"; bottom nav 5 แท็บ Board active | MEMBER | High | `boardHomeHTML` L18312 |
| FO-TC-BRD-003 | อ่าน hero slide 1 | bg รูปเต็ม slide + gradient ดำล่าง + tag pill แดง = cat "FEATURED" (EN uppercase) + h2 title 2 บรรทัด + sub 2 บรรทัด + ปุ่มแดง "Read more/อ่านต่อ" ขวาล่าง; dots 5 จุดจุดแรก active (ยาว) | MEMBER | Medium | tag แสดง `a.cat` ไม่ใช่คำว่า Featured — TH mode ก็ยัง EN |
| FO-TC-BRD-004 | แตะตัว slide (ไม่ใช่ปุ่ม Read more) | `boardart:b1` สไลด์เข้าจากขวา (rpPush) | MEMBER | High | `data-bdart` บน `.bd-slide` L18322 |
| FO-TC-BRD-005 | แตะปุ่ม "Read more" บน slide 2 | article b2 เปิด — bubble `data-bdart` เดียวกันกับ slide | MEMBER | Medium | L18327 |
| FO-TC-BRD-006 | กดซ้ายลาก hero ไปซ้าย >6px แล้วปล่อย | snap ไป slide ถัดไป + dot active ย้ายตาม + **ไม่เปิด article** (`bdDidDrag` suppress คลิก ~120ms) | MEMBER | High | mouse drag L18209–18265 + L18456 |
| FO-TC-BRD-007 | แตะ dot ที่ 4 | carousel smooth-scroll ไป slide 4 + dot 4 active (onscroll `bdCarouselScroll` sync) | MEMBER | Medium | `data-bddot` → `bdGoSlide` L18448 |
| FO-TC-BRD-008 | ลาก slide แรกไปขวา / slide สุดท้ายไปซ้ายจนสุด | snap กลับขอบเดิม — มี 5 slides ตาม seed (`feat` 1–5); ไม่มี autoplay ไม่มี loop | MEMBER | Low | `BD_FEAT_MAX`=5 เป็น dead constant ไม่ได้ใช้ clamp |
| FO-TC-BRD-009 | scroll ลงผ่าน hero ไปกลาง list | bd-head ยัง pinned บนสุดพร้อม glass blur (sticky) — **ไม่หลบ** เหมือน feed; bottom nav คงที่ล่าง | MEMBER | Medium | sticky CSS L3631–3641; `bdScrollHandler` ว่าง L18269 |
| FO-TC-BRD-010 | อ่านแถว Latest แถวแรก | b4 "Why Vintage Patina Is the Real Story": thumb ซ้าย + cat "COLLECTOR" แดง + title clamp 2 บรรทัด + meta "5 min read · 3 hours ago" — **ไม่มี likes บนแถว** | MEMBER | Medium | `bdRowHTML` L18297 — ต่างจาก bdCardHTML ที่มี likes |
| FO-TC-BRD-011 | แตะแถวล่าง ๆ (เช่น b9 "Submariner vs Explorer") | `boardart:b9` เปิดทับ | MEMBER | High | `data-bdart` บน `.bd-row` |
| FO-TC-BRD-012 | เลื่อนสุด list | "YOU'RE ALL CAUGHT UP" (EN hardcode, ตัวเล็ก uppercase) หลังแถวสุดท้าย — ไม่มี pagination/infinite scroll | MEMBER | Low | `bd-end-note` L18310 |

### 2.2 `boardall` + category pills + Categories sheet

| TC ID | Steps | Expected | Actor | Priority | Note |
|---|---|---|---|---|---|
| FO-TC-BRD-013 | board home → กด "View all" | `boardall` สไลด์ทับ: crumb "🏠 › Latest Articles" + pill bar 7 ตัว (All active แดง + center) + list **15 แถวรวม featured** + end note; crumb title ซ้ำกับ section home แต่เนื้อหา = ทั้ง BOARD | MEMBER | High | `data-bdall` รีเซ็ต `bdFilterCat="All"` L18488 |
| FO-TC-BRD-014 | boardall → แตะ pill "Rolex" | list เหลือ 5 แถว (b7,b8,b9,b10,b11 — **b8 โดนเพราะ cat "Feature More Rolex Collections" มีคำว่า rolex**) + pill Rolex active + scroll ไปกลางอัตโนมัติ | MEMBER | High | substring match `cat+" "+title` L18175 + `bdCenterPill` |
| FO-TC-BRD-015 | แตะ pill "Guides" | 2 แถว: b13 (cat "Guides") + b15 (cat "**Watch** Guides" — substring match) | MEMBER | Medium | เคสพิสูจน์ partial-cat match |
| FO-TC-BRD-016 | ไล่ pill ที่เหลือทีละตัว | Market Watch→1 (b2) · Technical→1 (b3) · Collector→1 (b4) · Industry→1 (b12) · All→15 — ไม่มี pill ไหนว่าง | MEMBER | Medium | "No articles in this category" เลยเข้าถึงไม่ได้ (ดู BRD-058 §4) |
| FO-TC-BRD-017 | ลากแถว pills ซ้าย/ขวา แล้วปล่อย | แถว scroll ตาม (grab cursor) — ถ้าลาก >5px ปล่อยบน pill **ไม่ trigger filter** (`bdPillsDidDrag` suppress); ลาก <5px = คลิกปกติ | MEMBER | Low | pills drag L18222–18244 + L18479 |
| FO-TC-BRD-018 | board home → กด burger (☰) บน bd-head | Categories sheet (variant pm) เลื่อนขึ้น: title "Categories" กลาง + 7 rows (All…Industry) + การ์ด "Close" แยกล่าง + backdrop | MEMBER | High | `openSheet(scr,"pm",...)` L18497 — **burger ตรงนี้ = categories ไม่ใช่ app drawer** |
| FO-TC-BRD-019 | sheet → เลือก "Technical" | sheet ปิด + `boardall` push ทับ + pill Technical active + list เหลือ b3 | MEMBER | High | `data-bdmenu-cat` L18506 — เข้า boardall ผ่าน sheet ไม่ผ่าน View all ก็ได้ |
| FO-TC-BRD-020 | sheet เปิด → กด "Close" / แตะ backdrop | ทั้งสองปิด sheet — อยู่ board home เดิม ไม่ nav (mechanics ตาม FO-TEST-07) | MEMBER | Medium | `data-bdcancel-sheet` L18551 |
| FO-TC-BRD-021 | guest: เปิด burger → เลือก "Rolex" → ดู list | **ไม่ถูก gate ทั้งจุด** — sheet เปิด เลือก category boardall filter ได้ครบ (browse free) | GUEST | Medium | `data-bdmenu`/`data-bdmenu-cat` ไม่อยู่ใน GUEST_GATE_SEL |
| FO-TC-BRD-022 | boardall filter "Rolex" → เปิด b9 → กด back | กลับ boardall: **filter ยัง Rolex + pill ยัง active** (`bdFilterCat` global) แต่ **list scroll รีเซ็ตบนสุด + แถว pills รีเซ็ตตำแหน่ง** (active pill อาจไม่กลางจอ — `bdCenterPill` ไม่ถูกเรียกตอน re-render) | MEMBER | Medium | renderSub rebuild ทุก rpBack — GAP-BRD-09 |

### 2.3 `boardsearch` — ค้นหาใน board

| TC ID | Steps | Expected | Actor | Priority | Note |
|---|---|---|---|---|---|
| FO-TC-BRD-023 | board home → กด search icon บน bd-head | `boardsearch` push ทับ: sbar (ไอคอน + input **autofocus** ~320ms) + crumb "🏠 › Search" + "Popular Topics" + chips 6 ตัว — **ไม่มีปุ่ม X ในช่อง** (bdQ รีเซ็ต "" เสมอตอนเข้า) | MEMBER | High | `data-bdsearch` L18458 + focus L18460 |
| FO-TC-BRD-024 | พิมพ์ "rolex" ทีละตัว | live filter ทุก keystroke → "5 results for “rolex”" + cards b7,b8,b9,b10,b11 — case-insensitive match title+cat+sub | MEMBER | High | `.bd-q` input L20323 → `boardSearchSync` |
| FO-TC-BRD-025 | อ่าน result card | การ์ด `bd-card`: รูป 16:9 + cat + **title เต็มไม่ clamp** + meta "N min read · ago • N likes" — ต่างจาก bd-row (มี likes, ไม่ clamp) | MEMBER | Medium | `bdCardHTML` L18283 |
| FO-TC-BRD-026 | พิมพ์ "zzzz" | "0 results for “zzzz”" + empty block: ไอคอนแว่นกากบาท + "No results found for “zzzz”" + แถว hint "Try searching with different keywords like Rolex, Daytona, or Titanium" | MEMBER | High | `bd-none` L18376 — localized TH/EN |
| FO-TC-BRD-027 | แตะ chip "Patina" | q เติม "Patina" + focus กลับ input + "**1 result** for “Patina”" (singular) + card b4 — เทียบ plural ใน BRD-024 | MEMBER | Medium | `data-bdtag` L18469 + singular ternary L18375 |
| FO-TC-BRD-028 | ลบข้อความในช่องจนหมด | กลับ "Popular Topics" + chips โดยไม่ต้อง back | MEMBER | Medium | q ว่าง → `bd-sugg` render |
| FO-TC-BRD-029 | พิมพ์ค้างไว้ → หาปุ่ม X ล้างในช่อง | **ไม่มีปุ่ม X เลย** — `data-bdclear` render เฉพาะตอน mount (`bdQ` ถูกรีเซ็ตทุก entry) + `boardSearchSync` มีแต่ลบไม่มีเพิ่ม → dead UI พิสูจน์แล้ว | MEMBER | Low | GAP-BRD-03 — ล้างได้แค่ลบเอง |
| FO-TC-BRD-030 | พิมพ์คำแล้วกด Enter | ไม่มีอะไรเพิ่ม — ไม่มี submit handler (live filter ทำงานอยู่แล้ว) | MEMBER | Low | keydown ไม่มี branch `.bd-q` |
| FO-TC-BRD-031 | พิมพ์ "leap" (คำในเนื้อบทความ b1) | **0 results** — ยืนยัน board search ไม่ค้น body บทความ (เฉพาะ title+cat+sub) | MEMBER | Low | L18374 filter fields |
| FO-TC-BRD-032 | พิมพ์ "rolex" → เปิด card b9 → back → อ่านหน้า | boardsearch re-render: **q "rolex" + ผลยังอยู่ครบ + input เติมค่าเดิม** (`bdQ` global ไม่ถูกล้างตอน rpBack) แต่ focus/scroll หาย; กด crumb 🏠 → board home → เข้า search อีกครั้ง → reset เป็น chips | MEMBER | Medium | search state persist ผ่าน `bdQ` — ต่างจาก scroll ที่หาย |
| FO-TC-BRD-033 | guest: เข้า search → พิมพ์ + เปิดผล | ใช้ได้ครบฟรี ไม่ gate — เหมือน member | GUEST | Medium | browse-free rule |

### 2.4 `boardart:id` — article detail

| TC ID | Steps | Expected | Actor | Priority | Note |
|---|---|---|---|---|---|
| FO-TC-BRD-034 | เปิด b1 → อ่านทั้งหน้า | bd-dnav: back pill ซ้าย + pill group ขวา (♥ like + ↗ share) pinned glass ตลอด scroll · cat "FEATURED" แดง · h1 · author row (avatar td-editorial.png + "Author/Tuk Daeng" + "Date/Oct 28, 2024" + ♥ 12) · cover 16:9 · callout = sub · 3 ย่อหน้า · tags 4 ตัว — **ไม่มี bottom nav** (ต่างจาก board pages อื่น) | MEMBER | High | `boardArticleHTML` L18398 — ไม่มี `${boardNavHTML()}` |
| FO-TC-BRD-035 | เทียบเนื้อ b1 vs b9 | **3 ย่อหน้าเหมือนกันทุกบทความ** (`BD_BODY` shared) + Author แสดง "Tuk Daeng" hardcode (field `a.author`="Tuk Daeng Editorial" ไม่ถูกใช้) — boilerplate quirk | MEMBER | Low | GAP-BRD-10/11 |
| FO-TC-BRD-036 | เปิด b8 (cat "Feature More Rolex Collections") | cat ยาวแสดง "FEATURE MORE ROLEX COLLECTIONS" uppercase wrap ได้ + tag "#FeatureMoreRolexCollections" (ตัดช่องว่าง) | MEMBER | Low | edge ชื่อ category ยาว — cat ยาวไม่มีใน pill bar (BD_CATEGORIES 7 ตัวเท่านั้น) |
| FO-TC-BRD-037 | scroll ลงอ่านกลางบทความ → กด back pill | nav pill ติดบนสุด glass (sticky+blur); back → หน้าก่อนสไลด์ออกขวา (rpBack) | MEMBER | Medium | sticky L3633 + `.sub-back`→`subBack` L21115 |
| FO-TC-BRD-038 | เปิด b14 ("15 min read") → อ่านเนื้อจริง | เนื้อยัง 3 ย่อหน้าสั้นเหมือนเดิม — meta "15 min read" ไม่สัมพันธ์ความยาวจริง (ไม่มีบทความยาวใน seed) | MEMBER | Low | edge บทความยาว = ไม่มีใน prototype — GAP-BRD-12 |
| FO-TC-BRD-039 | ตรวจเส้นทาง `boardart:` id ไม่มีใน BOARD (เชิงโค้ด/UI ปกติเข้าไม่ได้) | render "Article not found" + "This article is no longer available." (`chEmptyHTML`) — ใน UI ทุก `data-bdart` มาจาก BOARD → unreachable state | MEMBER | Low | L18400 — เคสเดียวกับ CHAT-061 pattern |
| FO-TC-BRD-040 | หาปุ่มอื่นบน article (more/save/comment/share bar ล่าง) | **มีแค่ back/like/share ลอยบน** — ไม่มี more (...), ไม่มี save, ไม่มี comment, ไม่มี footer bar; `bd-dfoot-sub` ที่ handler อ้างไม่ถูก render | MEMBER | Medium | ผูกกับ BRD-047/048 dead wiring |

### 2.5 like / share / save — actions + [GATE]

| TC ID | Steps | Expected | Actor | Priority | Note |
|---|---|---|---|---|---|
| FO-TC-BRD-041 | [GATE] member: article b1 → กด ♥ → กดซ้ำ; guest: กด ♥ | member: pill on (แดงเต็ม `bd-pill-like.on`) + count ใน author-likes 12→13; กดซ้ำ → off + กลับ 12 / guest: **Member Sheet "Join TukDaeng"** — like ไม่ทำงาน | MEMBER/GUEST | High | `[data-bdlike]` ใน GUEST_GATE_SEL L23469; handler L18569–18586 |
| FO-TC-BRD-042 | member: like b1 → back → เปิด b1 ใหม่ → ค้น "perpetual" ใน boardsearch | like ค้าง: pill on + 13 (flag บน `BOARD` mutated) + **search card meta ก็ขึ้น 13 likes** (อ่าน `a.likes` ตัวเดียวกัน) | MEMBER | Medium | persist ทั้ง session (ไม่มี backend) |
| FO-TC-BRD-043 | member: like แล้วดูตำแหน่งที่เห็นผล | **ปุ่ม like ไม่มีตัวเลข** (pill ไอคอนล้วน) — count เห็นเฉพาะแถว author-likes บน article + meta บน search card; rows/boardall/home ไม่แสดง likes เลย | MEMBER | Low | render diff bdRowHTML vs bdCardHTML |
| FO-TC-BRD-044 | [GATE] member: กด ↗ share pill → อ่าน sheet; guest: กด ↗ | member: share sheet (variant sh) ขึ้น — search field + friends grid + app row (Messenger/Direct/LINE/Facebook/Copy link) — **generic เหมือน post share ไม่ผูกชื่อบทความ** / guest: Member Sheet | MEMBER/GUEST | High | `shareSheetHTML()` L13957 ไม่รับ arg |
| FO-TC-BRD-045 | member: share sheet → กด Copy link → กดเพื่อนหนึ่ง → ปิด backdrop | Copy → toast (ตาม sheet mechanics FO-TEST-07); เพื่อน → toast "Sent to …" (ตาม FO-TEST-03); backdrop ปิด — actions ภายในเทสแล้ว ที่นี่เช็กว่าเปิดจาก article ได้เหมือนกัน | MEMBER | Medium | handlers shared กับ post share |
| FO-TC-BRD-046 | guest: กด ♥ → Member Sheet → Sign in สำเร็จ → ดู article | กลับ article เดิม แต่ **like ไม่ resume** — ต้องกด ♥ เองอีกครั้ง (obGate ไม่เก็บ pending action) | GUEST→MEMBER | Medium | สอดคล้อง CHAT-101; เคสเมทริกซ์เต็มอยู่ FO-TEST-17 |
| FO-TC-BRD-047 | หา entry "save article" ทุกจุด (article, rows, cards, sheet) | **ไม่มีปุ่ม save เลย** — `data-bdsave` ไม่ถูก render ที่ไหน + sheet bdmore (ที่ควรมี Save) ไม่มี trigger → `a.saved` toggle เข้าถึงไม่ได้ทาง UI; saved article ไม่มีหน้ารวม | MEMBER | Medium | GAP-BRD-02 — dead wiring ครบวง |
| FO-TC-BRD-048 | หา "..." more menu บน article/list/card | **ไม่มี** → sheet `data-bdmore` (Share Article / Copy Link / Save to Favorites / Report Article) ที่ wire ไว้ L18517–18549 เข้าถึงไม่ได้ทั้งก้อน — รวม **Report article ก็ report ไม่ได้** | MEMBER | Medium | GAP-BRD-01 — handler มีแต่ไม่มี DOM ผลิต `data-bdmore` |

### 2.6 Navigation / state / edge / i18n / theme

| TC ID | Steps | Expected | Actor | Priority | Note |
|---|---|---|---|---|---|
| FO-TC-BRD-049 | nav chain: board → View all → b9 → back → back → อ่าน stack | ลำดับ: boardall (filter ค้าง) → board home; **board home ไม่มีปุ่ม back** (root tab — ออกได้แค่ bottom nav); แตะ Feed → stack ล้าง | MEMBER | High | rpPush chain L15198 + subBack L15157 |
| FO-TC-BRD-050 | board home scroll ลงกลาง list (hero พ้นจอ) → เปิด b5 → back | **กลับ board home แต่ scroll รีเซ็ตบนสุด + hero กลับ slide 1 + dot reset** — `renderSub` rebuild ทุก rpBack ไม่มี scroll restore (ต่างจาก profile `_pfScrollStack`) — brief ขอ "back กลับตำแหน่งเดิม" → คาด fail ถ้า spec ต้องการ restore | MEMBER | High | GAP-BRD-09 — quirk สำคัญของ task |
| FO-TC-BRD-051 | อยู่ boardall (filter Rolex) → แตะแท็บ Board ซ้ำ → อ่านหน้า | swap กลับ board home (stack reset เหลือ ["board"], scroll บนสุด, `bdQ` ล้าง) — **`bdFilterCat` ยังค้าง "Rolex"** (navgo ไม่ reset) → View all ครั้งถัดไปจึง reset "All" ตอนกด data-bdall | MEMBER | Medium | navgo L21630 ล้างเฉพาะ bdQ |
| FO-TC-BRD-052 | guest: เปิด article b3 อ่านครบ (scroll สุด + tags) | **ไม่เจอ gate เลยตลอดหน้า** — browse ฟรีตามกติกา "guests can browse boards"; gate เฉพาะ like/share | GUEST | High | L23392 comment ยืนยันกติกา |
| FO-TC-BRD-053 | devtools: แก้ `src` cover/img แถวให้ 404 → เปิด article + ดู list + hero | ไม่มี onerror fallback: cover/`bd-row img`/`bd-card-img` = broken icon (layout ยังอยู่); hero `.bd-slide` ใช้ background-image → เหลือพื้นดำ+gradient (tag/title/ปุ่มยังอ่านได้) — ความเสียหายต่างกันตามวิธี render | MEMBER | Low | edge รูปเสีย — ไม่มี fallback ในโค้ด |
| FO-TC-BRD-054 | เทียบ title ยาว b7 บน 3 surface | row/home → clamp 2 บรรทัด ellipsis · hero h2/p → clamp 2 · **search card → ไม่ clamp แสดงเต็ม** (inconsistency) | MEMBER | Low | `.bd-card .bd-ct` ไม่มี line-clamp vs `.bd-row .bd-ct` มี |
| FO-TC-BRD-055 | แตะ card/row/article like รัว ๆ หลายครั้ง | card → `rpPush` ทุกคลิก → stack สะสม `boardart:` ซ้ำหลายชั้น (back ต้องกดหลายครั้ง — ไม่มี guard) · like pill → toggle ตามคลิก count ขยับทุกครั้ง (ไม่มี debounce) | MEMBER | Low | edge กดรัว — ไม่มี click guard ทั้งสอง |
| FO-TC-BRD-056 | TH: เปิด board home + boardall + boardsearch + article | localized: แท็บ "กระดานข่าว", "บทความล่าสุด", "ดูทั้งหมด", "อ่านต่อ", placeholder "ค้นหาบทความ แบรนด์ หรือประเด็นที่สนใจ...", "หัวข้อยอดนิยม", "N ผลลัพธ์ สำหรับ…", no-result + hint / **EN hardcode:** ชื่อ cat+pills ทุกตัว, "min read", "N likes", "You're all caught up", "No articles in this category", "Categories"/"Close" ใน sheet, "Author"/"Date", วันที่ "Oct 28, 2024", tags, toast ฝั่ง board | MEMBER | Medium | GAP-BRD-13 — i18n ครึ่งเดียว |
| FO-TC-BRD-057 | dark theme: เปิด board ทุกหน้า + article | bg `#0e1014` (`.page-sub:has(.bd-*)` dark), pills dark `surface-2`, pill-btn/pill-group dark, glass var เปลี่ยน; hero ไม่เปลี่ยน (bg ดำอยู่แล้ว); article อ่านได้ครบ contrast โอเค | MEMBER | Medium | CSS L10099 + dark rules กระจาย |
| FO-TC-BRD-058 | board home → article (ไม่มี bottom nav) → ออกยังไง | ออกได้แค่ back pill เท่านั้น (article ไม่มี nav ไม่มี gesture อื่น); บน home/all/search bottom nav ครบ + Board active เสมอ | MEMBER | Medium | `boardArticleHTML` ไม่มี boardNavHTML |

## 3. Traceability audit — board vs inventory §2.8

| Inventory row | TC ที่ครอบ |
|---|---|
| `board` home (hero carousel dots+drag / Latest / View all / bd-head burger+search) | BRD-001..012,018 |
| `boardall` (all articles + category pills drag+center + breadcrumb) | BRD-013..017,022 |
| `boardsearch` (search bar + popular tags + results count + empty) | BRD-023..033 |
| `boardart:id` (cover, author/meta, likes count, tags, like pill, share pill, back, "Article not found") | BRD-034..040,041..046,052,053,058 |
| sheet `bdmenu` categories → boardall + focus pill | BRD-018..021 |
| sheet `bdmore` (article more) — [DEAD] no `data-bdmore` rendered | BRD-048 (**พิสูจน์เข้าถึงไม่ได้**) |
| action like/save [GATE] (like toggle+count / save toggle session flag) | BRD-041..043 (like) + BRD-046,047 (save = unreachable/guest gate list) |
| ปุ่ม board vs dead-list (ตามที่สั่งตรวจ) | ผ่าน — ไม่มี `bd-*`/`data-bd*` ใน dead-list; `boardClick` ก่อน dead check เสมอ (dead ของ board คือ "ไม่มี element render" ไม่ใช่ dead-list) |
| [GATE] เทส 2 กรณี (ตามที่สั่ง) | BRD-041,044,046 (guest→Member Sheet / member ทำงานจริง) + BRD-021,033,052 (browse ฝั่งไม่ gate) |

## 4. Gaps / quirks ที่พบในระหว่างออกแบบ (ยืนยันกับทีมก่อน file bug)

- **GAP-BRD-01 (dead wiring ทั้งก้อน):** sheet `data-bdmore` (Share Article / Copy Link / Save to Favorites / Report Article) — handler `L18517–18529` + actions `L18531–18550` wire ครบ แต่ **ไม่มี element ใด render `data-bdmore`** → more-sheet + 4 actions เข้าถึงไม่ได้เลย; `data-bdact=share|save|report` gated ใน `GUEST_GATE_SEL` ด้วย (copy ไม่ gate) แต่ reach ไม่ถึงทั้งหมด
- **GAP-BRD-02 (dead UI):** `data-bdsave` — handler `L18559–18568` มีแต่ไม่มี element render → save article เข้าถึงไม่ได้; `.bd-dfoot-sub` ที่ like handler อ้าง `L18582` ก็ไม่ถูก render (dead update branch)
- **GAP-BRD-03 (dead UI):** `data-bdclear` (ปุ่ม X ล้าง search) — render เฉพาะตอน `bdQ` ไม่ว่างตอน mount แต่ทุก entry (`data-bdsearch`, navgo) รีเซ็ต `bdQ=""` → X ไม่มีวันโผล่; `boardSearchSync` มีแต่ remove ไม่มี add
- **GAP-BRD-04 (dead code/data):** `bdStepSlide` `L18191` (prev/next arrows ไม่มี DOM), `BD_FEAT_MAX` `L18144`, `bdScrollHandler` `L18269` ว่าง, field `a.author` "Tuk Daeng Editorial" ไม่ถูก render (UI hardcode "Tuk Daeng")
- **GAP-BRD-05 (unreachable states):** "No articles in this category" `L18308` — ทุก pill ใน `BD_CATEGORIES` match ≥1 เสมอ (substring cat+title); "Article not found" `L18400` — ทุก `data-bdart` มาจาก BOARD
- **GAP-BRD-06:** pill filter ใช้ substring บน `cat+" "+title` → edge matches: "Rolex" pill ดึง b8 (cat "Feature More Rolex Collections"), "Guides" ดึง b15 ("Watch Guides") — ถ้า spec ต้องการ exact-cat match จะ fail
- **GAP-BRD-07:** `boardall` crumb title = "Latest Articles" แต่ list = BOARD ทั้ง 15 (รวม featured ที่อยู่ hero ด้วย) — ชื่อกับเนื้อหาไม่ตรง + "all" ใน `bdJournal()` = BOARD เต็ม
- **GAP-BRD-08:** search ค้นเฉพาะ `title+cat+sub` — ไม่ค้นเนื้อบทความ (`BD_BODY`) แม้จะขึ้นผลสำเร็จใน reader; hint แนะนำ keywords ที่ match ทุกอัน (ทุก chip ได้ผล ≥1)
- **GAP-BRD-09 (สำคัญกับ brief):** back จาก article/boardall → `rpBack` → `renderSub` rebuild innerHTML → **scroll รีเซ็ตบนสุด + hero กลับ slide 1 + dot reset + pill bar ไม่ re-center** — ไม่มี scroll restore (มีเฉพาะ `_pfScrollStack` ของ profile) — ถ้า spec ต้องการ "back กลับตำแหน่งเดิม" จะ fail
- **GAP-BRD-10:** `BD_BODY` 3 ย่อหน้าเดียวกันทุกบทความ — เนื้อ editorial ไม่ได้ผูกกับเรื่อง; "N min read" ไม่สัมพันธ์ความยาวจริง (b14 บอก 15 แต่เนื้อ 3 ย่อหน้า)
- **GAP-BRD-11:** author row hardcode "Tuk Daeng" + avatar `td-editorial.png` ทุกเรื่อง — `a.author` field เป็น dead data
- **GAP-BRD-12:** ไม่มี article ยาว/หลายรูป/inline media ใน body — content model = cover เดียว + callout + paragraphs + tags เท่านั้น
- **GAP-BRD-13 (i18n ครึ่งเดียว):** localized เฉพาะหัวข้อ section/ปุ่มหลัก + search states; EN hardcode: cat names+pills, "min read"/"likes"/"You're all caught up"/"No articles in this category"/"Categories"/"Close"/"Author"/"Date"/dates/tags/toasts ("Link copied", "Saved to favorites", "Report submitted…")
- **GAP-BRD-14:** like pill ไม่มีตัวเลขติดปุ่ม — เห็น count เฉพาะ author-likes; `data-bdlike` handler พยายามอัปเดต `span` ในปุ่มที่ไม่มีอยู่ (`cnt` null เสมอ) → dead branch ย่อย
- **GAP-BRD-15:** article page ไม่มี bottom nav — ออกได้แค่ back pill (ตั้งใจหรือไม่ ให้เทียบกับ spec; board pages อื่นมีครบ)
- **GAP-BRD-16:** `bdFilterCat` เป็น global module var — persist ข้าม nav/back/tab จนกว่าจะเปลี่ยนเองหรือกด View all (navgo ล้างเฉพาะ `bdQ` ไม่ล้าง filter)
- **GAP-BRD-17:** date "Oct 28, 2024"/"ago" เป็น seed ตายตัว — ไม่มี date logic; author likes seed ต่างกันแต่ body เหมือนกัน
- **เชื่อม task อื่น:** share sheet internals + sheet mechanics = FO-TEST-03/07 · Member Sheet resume matrix เต็ม = FO-TEST-17 · Report article (ถ้าเปิดใช้ bdmore) = FO-TEST-16 · scroll-to-hide comparison = FO-TEST-02
