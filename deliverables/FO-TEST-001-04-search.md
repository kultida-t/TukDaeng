# FO-TEST-04 — Test Cases: Search & Filter (FO prototype)

> Task: FO-TEST-04 ของชุด FO-TEST-001 · วันที่: 2026-10-27
> กติกาหลัก: `deliverables/FO-TEST-001-testcase-prompt.md` · Task breakdown: `deliverables/FO-TEST-001-task-breakdown.md`
> Source of Truth: `Prototypes/fo-flow/index.html` (SEARCH-001 block ~L14489–14996 — state ~L14517–14528, matching ~L14530–14587, landing ~L14631–14642, recents ~L14520–14524/14654–14668, suggest ~L14597–14613/14669–14681, chips ~L14682–14688, results ~L14906–14944, filter ~L14945–14996 · handlers ~L21440–21611 · wa entry ~L22354–22366 + criteria ~L16464–16475 · viewer entry ~L21533–21551 + ~L14841–14897 · igd-tag ~L23053–23060 · price input ~L20445–20447 · subBack ~L15157–15180 · gate ~L23461–23470)
> สัญญาความครอบคลุม: `deliverables/FO-TEST-001-00-inventory.md` §2.3 — ไม่เดา behavior เพิ่ม

## 0. วิธีใช้เอกสาร + สภาพแวดล้อม

- เปิด prototype ที่ `http://localhost:8901/index.html` (หรือเปิดไฟล์ตรง) — Viewport 440×956, ทดสอบทั้ง Light/Dark และ TH/EN ตามที่ระบุในเคส
- **Actor**: `GUEST` = session guest · `MEMBER` = demo `demo@tukdaeng.com` / `Tukdaeng123` · `NEW` = สมัครใหม่ (ข้อมูลว่าง)
- **Type**: UI = การแสดงผล · Func = การทำงาน · Int = เชื่อมข้าม module · Edge = negative/boundary
- **Priority**: High = core flow/กติการะบบ · Medium = feature หลัก · Low = edge/cosmetic
- **[GATE]**: guest แตะ action ใน `GUEST_GATE_SEL` → `obGate()` = Member Sheet "Join TukDaeng" — ใน scope นี้สิ่งที่ถูก gate คือ **`.sr-wa` (กระดิ่ง results)** และ **`.sc-follow` (ปุ่ม Follow บน seller card)** ทุกเคส [GATE] มีคู่ guest/member (sheet mechanics อยู่ FO-TEST-01, เมทริกซ์ทั้งแอป FO-TEST-17)
- **ทางเข้า search**: ไอคอนแว่นขยายบน app header (`.search-btn`) ทำงานได้ทั้ง guest/member — ไม่ถูก gate
- **Search state เป็น memory ต่อ screen** (`scr._search` — session เดียว ไม่ persist ข้าม reload): recents/filters/q/mode ค้างไว้ทั้ง session — การเปิด search ซ้ำจะ "กลับมาที่ state เดิม" ไม่ใช่ landing เสมอ (ดู SRCH-029/030)
- **Sale listings ใน mock (5 ใบ)** — ค้นเจอเฉพาะใบที่มีราคา (ยกเว้น tag mode): p1 Watch 777 — Rolex Submariner Date · Ref. 126610LN · 41mm · Black · Automatic · 2023 · Very Good · Full set · **THB 420,000** (views 1.2K) · p2 the watch — Tudor Black Bay 41 · Ref. M7941A1A0RU · 41mm · Black · Automatic · 2024 · New · Full set · **THB 145,000** (2.8K) · p4 davikah — Rolex Datejust 41 · Ref. 126334 · 41mm · Blue · Automatic · 2023 · Very Good · Full set · **THB 380,000** (980) · p5 watch.daily — Breguet Classique 7137 · Ref. 7137BR · 39mm · Silver guilloché · Automatic · 2021 · Very Good · Full set · **THB 890,000** (1.5K) · p6 neng_mua — Grand Seiko Snowflake · Ref. SBGA211 · 41mm · White (Snowflake) · Spring Drive · 2023 · Like New · Full set · **THB 165,000** (1.9K)
- **Recents seed** = 6 แถว: Watch 777 · chrono.th · rolex · grand seiko · 126610ln · wrist.story
- **เรื่องเงิน** อ้าง `docs/money-display-rules.md` (DRAFT v0.1): ช่องราคา filter ใส่ comma ให้อัตโนมัติ (§4.2); chip ราคาแสดงเต็มจำนวน `THB x – y`; badge views เช่น `1.2K` คือตัวนับ **ไม่ใช่เงิน**
- **สิ่งที่อยู่นอก scope** (เคสอยู่ task อื่น — ห้ามซ้ำ): header/burger/back ของ shell (FO-TEST-02), viewer/detail internals ทุก mode (FO-TEST-06 — ที่นี่เช็คเฉพาะ "entry จาก tile" + ปุ่มกลับ), wa sheet internals/save/list (FO-TEST-11 — ที่นี่เช็คเฉพาะ entry + state กระดิ่ง), saved page internals (FO-TEST-14), report/block flows (FO-TEST-16 — ใช้เป็น precondition เท่านั้น), Member Sheet mechanics (FO-TEST-01/17)

## 1. Coverage Map ของ task นี้ (เทียบ inventory §2.3)

| Route/Feature (inventory §2.3) | TC ID ที่ครอบ |
|---|---|
| `search` — landing (explore grid + popular chips + filter + `sr-saved`) | SRCH-001 – 005 |
| `search` — typing (suggest kw+seller / recents 4 แถว) | SRCH-006 – 011 |
| `recents` page `[OPEN-CODE-ONLY]` | SRCH-012 – 016 |
| `search` — results (tabs/chips/grid/sellers/empty/err→retry) | SRCH-017 – 032 |
| `sfilter` page (10 กลุ่ม chip + price + counts + Clear/Apply) | SRCH-033 – 043 |
| `sfilter` validation (min>max, max>2,000,000) | SRCH-044 – 047 |
| `sr-wa` bell → Watch Alert `[GATE]` | SRCH-051 – 054 |
| state `S.sort` (ไม่มี UI) `[OPEN-NO-CODE]` | SRCH-031 |
| tile → Post Viewer (`xp-tile` → `pv-open`) | SRCH-055 – 057 |
| guest coverage รวมของหน้า search | SRCH-058 – 059 |
| i18n / theme / money spot-check | SRCH-060 – 062 |

## 2. Test Cases

### 2.1 Search Entry & Landing

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-SRCH-001 | เปิดหน้า search + anatomy | MEMBER | UI | member อยู่ feed | 1. แตะไอคอนแว่นขยายมุมขวาบนของ header | `openSub("search")` — หน้า search เลื่อนทับ feed | head: ← + ช่อง "Search" (fake) + ไอคอน bookmark; chip row: ไอคอน filter (sliders) + For you(เริ่มต้น on) + Rolex/Submariner/Datejust/Grand Seiko/Tudor/Breguet/Full set; ด้านล่าง explore grid รูปจัตุรัส | High | |
| FO-TC-SRCH-002 | explore grid content | MEMBER | UI | หน้า search landing เปิดอยู่ | 1. เลื่อนดู grid | grid = **ทุกรูปของทุกโพสต์** (ไม่ใช่ทีละโพสต์ — การ์ด 3 รูปได้ 3 tile); badge 👁+views โผล่เฉพาะ tile ลำดับที่ 3, 4, 8 ของ grid; ไม่มี tile สูงพิเศษ (tall set ว่างในโค้ด) | รูปครบ ไม่มี tile ว่าง/รูปเสีย | Medium | |
| FO-TC-SRCH-003 | popular chip → results | MEMBER | Func | อยู่ landing | 1. แตะ chip "Rolex" 2. back กลับ landing 3. แตะ chip "For you" | "Rolex" → mode results q="Rolex" + push เข้า recents; "For you" → q="" → results แสดง sale posts ทั้ง 5 ใบ และ**ไม่**ถูก push เข้า recents | results เด้งทันทีจาก chip | High | |
| FO-TC-SRCH-004 | bookmark shortcut (sr-saved) | MEMBER + GUEST | Func | อยู่ landing | 1. แตะไอคอน bookmark บน head | `pushSub("saved")` → หน้า Saved เด้ง — member เห็น Saved hub, **guest เปิดได้ฟรีแต่เห็น "No saved posts yet"** (ไม่ gate ที่ entry; back กลับ search landing) | stack ซ้อน — back จาก saved กลับ search ไม่ใช่ feed | Medium | |
| FO-TC-SRCH-005 | ออกจากหน้า search | MEMBER | Func | อยู่ landing | 1. แตะ ← บน head | `subBack` pop stack → ปิด sub กลับ feed | feed โผล่ตำแหน่งเดิม | Medium | |

### 2.2 Typing Mode & Suggestions

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-SRCH-006 | เข้า typing mode + Recent block | MEMBER | Func | อยู่ landing | 1. แตะช่อง "Search" (fake) | mode → typing: input จริง focus + ปุ่ม "Cancel"; body เปลี่ยนจาก grid เป็น **Recent block** (q ว่าง): หัว "Recent" + "See all" (เพราะ seed 6 > 4) + 4 แถวแรก (Watch 777, chrono.th, rolex, grand seiko) — seller row มี avatar+sub ("1 listing"/"0 listings"), kw row มีไอคอนนาฬิกา + ปุ่ม × ทุกแถว | ไม่มี explore grid ตอน typing | High | |
| FO-TC-SRCH-007 | suggest kw พร้อม counts | MEMBER | Func | typing mode, q ว่าง | 1. พิมพ์ "rolex" | suggest สดทุก keystroke: kw rows = "Rolex"(2 listings) + "Rolex Submariner"(1) + "Rolex Datejust"(1) + "Rolex Daytona"(0) + "Rolex GMT-Master II"(0) + "Rolex Explorer"(0) — kw สูงสุด 6 แถว ตามด้วย seller rows (ถ้าชื่อ match) | ไอคอนแว่นขยายนำแถว + sub "N listings" | High | |
| FO-TC-SRCH-008 | suggest seller rows | MEMBER | Func | typing mode | 1. ลบแล้วพิมพ์ "watch" | ไม่มี kw row (ไม่มี brand/model/ref ชื่อมี "watch") → แถว seller 3 แถว: Watch 777 "1 listing" · the watch "Following" · watch.daily "1 listing" (sub = Following ถ้า follow อยู่ ไม่งั้น "N listings") | avatar + ชื่อ + sub | Medium | |
| FO-TC-SRCH-009 | suggest ref rows + ไม่มีผล | MEMBER | Edge | typing mode | 1. พิมพ์ "126" 2. ลบแล้วพิมพ์ "xyz123" | "126" → kw rows "126610LN" + "126334" (ref ไม่มี sub); "xyz123" → "No suggestions" (empty state กลางจอ) | ref row = ไอคอน+ตัวเลขล้วน | Medium | |
| FO-TC-SRCH-010 | ปุ่ม × ล้าง query | MEMBER | Func | typing mode, มี q | 1. พิมพ์อะไรก็ได้ 2. แตะปุ่ม × (circle-x) ในช่อง | `S.q=""` → body กลับ Recent block; ปุ่ม × แสดงเฉพาะตอนมีตัวอักษร (class `has-q`) | ช่องว่าง + recents กลับมา | Medium | |
| FO-TC-SRCH-011 | Cancel + Enter | MEMBER | Func | typing mode มี q="rolex" | 1. แตะ "Cancel" → landing 2. เปิด typing ใหม่ พิมพ์ "rolex" กด Enter | Cancel → mode landing (grid กลับ, **q ยังค้างใน state**); Enter → results + pushRecent("kw","rolex") — "rolex" ขยับขึ้นหัว recents (มีอยู่แล้ว → dedupe ไม่ซ้ำ) | landing กลับมาเหมือนเดิม; recents ไม่มีแถวซ้ำ | High | |

### 2.3 Recent Searches `[OPEN-CODE-ONLY]`

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-SRCH-012 | recents page | MEMBER | UI | typing mode, recents >4 | 1. แตะ "See all" ข้างหัว "Recent" | `pushSub("recents")` → หน้า "Recent searches": head ← + title + "Clear all" + ลิสต์เต็ม (seed 6 แถว เรียงใหม่สุดบน) | เห็นครบทุกแถวรวม 126610ln, wrist.story | High | |
| FO-TC-SRCH-013 | ลบ recents รายแถว | MEMBER | Func | recents page เปิด | 1. แตะ × แถวแรก | `splice` แถวนั้นออก → re-render เหลือ 5 แถว; ทำบน Recent block ของ typing ก็ลบได้เหมือนกัน (index ตรงกันเพราะ preview = 4 แถวแรกของลิสต์เดียวกัน) | แถวหายทันที ไม่มี confirm | Medium | |
| FO-TC-SRCH-014 | Clear all | MEMBER | Func | recents page เปิด | 1. แตะ "Clear all" 2. back กลับหน้า typing | `recents=[]` → หน้า recents แสดง "No recent searches"; กลับ typing (q ว่าง) → Recent block = "No recent searches" และไม่มี "See all" | empty state ทั้งสองจุด | Medium | |
| FO-TC-SRCH-015 | แตะ recent row → results | MEMBER | Func | recents page เปิด | 1. แตะแถว "grand seiko" 2. จาก results แตะ ← | แตะ → q="grand seiko" + mode results + pushRecent(ขยับขึ้นหัว); **stack ถูก reset เป็น ["search"]** → ← จาก results กลับ landing (ไม่ใช่หน้า recents) | results ของ "grand seiko" = p6 เท่านั้น | High | |
| FO-TC-SRCH-016 | dedupe + สูงสุด 8 แถว | MEMBER | Edge | recents ว่าง (ทำ SRCH-014 ก่อน) | 1. ค้น "rolex" → กลับ ค้น "ROLEX" → กลับ 2. ค้นคำต่างกัน 9+ ครั้ง (เช่น rolex, tudor, breguet, seiko, submariner, datejust, snowflake, 126610ln, classique) | dedupe case-insensitive ("ROLEX" = "rolex" → แถวเดิมขยับขึ้นหัว ไม่สร้างซ้ำ); `slice(0,8)` → เก็บสูงสุด 8 แถว ตัวเก่าสุดหลุด | ลิสต์ไม่ซ้ำ ไม่เกิน 8 | Low | |

### 2.4 Results — Tabs / Accounts / Grid / Empty / Error

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-SRCH-017 | results anatomy | MEMBER | UI | ค้น "rolex" แล้วอยู่ results | 1. ดู head + tabs + body | head: ← + ช่อง fake แสดง q ("rolex") + กระดิ่ง (sr-wa) + ไอคอน filter; tabs: For you(on)/Profiles/Tags; body For you: section "Accounts" (เฉพาะเมื่อมี seller ชื่อ match) + section "Posts" + grid 2 คอลัมน์ | ไม่มี chips row เมื่อยังไม่ filter | High | |
| FO-TC-SRCH-018 | query match seller → โพสต์ของ seller มาด้วย | MEMBER | Func | อยู่ search typing | 1. พิมพ์ "watch" กด Enter | haystack รวมชื่อ seller → Posts = p1(Watch 777), p2(the watch), p5(watch.daily) 3 ใบ; Accounts = seller 3 แถว (avatar+ชื่อ+sub) | section "Accounts" อยู่เหนือ "Posts" | High | |
| FO-TC-SRCH-019 | 0 ผลลัพธ์ | MEMBER | Edge | อยู่ search typing | 1. ค้น "zzzzz" | For you: ไม่มี Accounts; Posts = ไอคอนแว่นขยายใหญ่ + "No data found" + "Try a different keyword or adjust your filters"; สลับ Profiles/Tags → "No data found" (ไม่มี hint บรรทัดสอง) | empty state ทุก tab | High | |
| FO-TC-SRCH-020 | result grid tile | MEMBER | UI | results มี ≥8 ใบ (ค้น q ว่างผ่าน chip "For you") | 1. ดู grid | tile = รูปแรกของโพสต์ (`photos[0]`) จัตุรัส 2 คอลัมน์; badge 👁views เฉพาะ tile index 2,3,7; เรียงตามลำดับ POSTS (sort="new" ไม่มีผลเรียงเพิ่ม) | ไม่มีราคา/ชื่อบน tile | Medium | |
| FO-TC-SRCH-021 | Profiles tab | MEMBER | Func | results q="watch" | 1. แตะ tab "Profiles" | seller cards: avatar + ชื่อ + "N listings · Following?" + ปุ่ม Follow/Following ขวาแถว; q ว่าง → **"No data found"** (resultSellers return [] เมื่อไม่มี q) | card เต็มแถว มีปุ่ม Follow | Medium | |
| FO-TC-SRCH-022 | Follow บน seller card `[GATE]` | MEMBER + GUEST | Func | Profiles tab q="watch" | 1. member แตะ "Follow" ของ Watch 777 2. guest ทำซ้ำ | member: ปุ่ม flip เป็น "Following" + `setFollowing` จริง; guest: `.follow-btn` ∈ gate → Member Sheet เด้ง ไม่มีการ follow | card re-render หลัง toggle | High | |
| FO-TC-SRCH-023 | แตะ seller card → profile | MEMBER | Func | Profiles tab q="watch" | 1. แตะตัวการ์ด (ไม่ใช่ปุ่ม Follow) | `data-pf-user` → `pushSub("profile:Watch 777")` — public profile เด้งทับ; back กลับ results | stack ซ้อน results←profile | Medium | |
| FO-TC-SRCH-024 | Accounts row ใน For you ≠ profile | MEMBER | Func | results q="watch" tab For you | 1. แตะแถว "the watch" ใน Accounts | `.ac-row` → **ตั้ง q="the watch" แล้วค้นใหม่** (results = p2 เท่านั้น) + push เป็น seller recent — ไม่ได้ไป profile (ต่างจาก Profiles tab) | q บนช่องเปลี่ยนเป็น "the watch" | Medium | |
| FO-TC-SRCH-025 | Tags tab | MEMBER | Func | results q ว่างหรือ "rolex" | 1. แตะ tab "Tags" 2. แตะแถว "#rolex" | rows = hashtag ทั้งหมดจาก caption + suggested tags เรียงจำนวนโพสต์มาก→น้อย ("#tukdaeng" นำ — ทุกโพสต์มี); แตะแถว → q="#rolex" + tab กลับ For you + results tag mode | แถวมีไอคอน # + "N posts" | Medium | |
| FO-TC-SRCH-026 | tag mode รวมโพสต์ที่ไม่มีราคา | MEMBER | Func | results | 1. ค้น "#tukdaeng" (พิมพ์ตรง ๆ หรือกดจาก Tags tab) | q ขึ้นต้น # → ลิสต์ = POSTS ทั้งหมดที่ไม่ muted (รวม showcase ที่ไม่มีราคา — ต่างจาก For you ปกติที่เฉพาะ sale) → grid รวม p7/p8/p9/p10/p11/p3 ด้วย | grid ยาวกว่าผลค้นปกติชัดเจน | High | |
| FO-TC-SRCH-027 | error state + Try again | MEMBER | Edge | results เปิดอยู่ (SETUP-09) | 1. console set `._search.err=true` 2. แตะ tab "Profiles" (ให้ re-render) 3. แตะ "Try again" | `S.err` → body เปลี่ยนเป็น error block (tabs ยังอยู่); Try again → `err=false` → ผลกลับมาปกติ | ไอคอน + "Something went wrong. Please try again." + ปุ่ม Try again | Low | |
| FO-TC-SRCH-028 | hashtag จาก feed → tag mode | MEMBER | Int | feed ที่ p1 caption expand แล้ว | 1. แตะ "#Rolex" ใน caption | `openSub("search")` + mode results q="#Rolex" tab foryou → tag mode (FEED-076 เชื่อมมาที่นี่) — **hashtag click ไม่ถูก push เข้า recents** | ผล = p1 + p4 (caption มี #Rolex) | Medium | |
| FO-TC-SRCH-029 | back จาก results → landing + state ค้าง | MEMBER | Func | results q="rolex" + filter ใส่แล้ว (SRCH-040) | 1. แตะ ← บน head | mode → "landing" (ไม่ใช่ typing); S.q/S.f ยังอยู่ → เปิด sfilter หรือค้นใหม่แล้ว filter ยังทำงาน | landing แสดง grid เหมือนเดิม ไม่มี chips แสดง | High | |
| FO-TC-SRCH-030 | เปิด search ซ้ำ → คืน state เดิม | MEMBER | Edge | เคยค้น q="rolex" ค้างไว้แล้วกลับ feed | 1. แตะไอคอน search อีกครั้ง | `scr._search` persist → เปิดมาเจอ **results "rolex" เดิม** ไม่ใช่ landing (state memory ต่อ session — ต้อง reload เพื่อ reset) | q+filters+tab เดิมทั้งหมด | Medium | |
| FO-TC-SRCH-031 | sort — ไม่มี UI `[OPEN-NO-CODE]` | MEMBER | Edge | results 5 ใบ (chip "For you") | 1. หา control sort บนหน้า → ไม่มี 2. (console) `document.querySelector('.screen')._search.sort='plo'` แล้วแตะ tab Profiles→For you ให้ re-render | ไม่มี UI sort บน production path (observation); logic ใน state ทำงานถ้าบังคับ: plo → p2,p6,p4,p1,p5 (ราคาน้อย→มาก); 'phi' กลับอันดับ; 'pop' เรียง views มาก→น้อย | ต้องไม่มี control sort ที่แตะได้ | Low | |
| FO-TC-SRCH-032 | โพสต์ ni/muted/blocked หลุดจากผล | MEMBER | Int | ทำ "Not interested" การ์ด p1 ผ่าน feed ⋯ ก่อน (FEED-059) | 1. เปิด search ค้น "rolex" 2. ดู explore grid บน landing | salePosts กรอง `ni/muted/blocked` → p1 หายจากผล "rolex" (เหลือ p4); explore grid กรองชุดเดียวกัน → รูป p1 หาย; แต่ tag mode (#rolex) กรองแค่ muted → p1 ยังโผล่ใน tag mode | ผลลัพธ์หดลงตาม flag | Medium | |

### 2.5 Filters (`sfilter`)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-SRCH-033 | filter page anatomy | MEMBER | UI | อยู่ landing หรือ results | 1. แตะไอคอน filter (sliders) | `pushSub("sfilter")` → หน้า "Filters": head ← + title; 11 กลุ่มตามลำดับ — Brand · Model · Price range (THB) · Year of production · Reference · Condition · Case size · Movement · Dial color · Strap / Bracelet · Delivery contents; footer "Clear all" + "Apply" (ไม่มีเลขเมื่อยังไม่เลือก) | chip ทุกตัวมี "(n)" ต่อท้าย | High | |
| FO-TC-SRCH-034 | counts ตรง mock + (0) กดได้ | MEMBER | UI | filter page เปิด | 1. อ่าน counts แต่ละกลุ่ม | Brand: Rolex(2) Tudor(1) Breguet(1) Grand Seiko(1) Omega(0) Patek Philippe(0); Year: 2024(1) 2023(3) 2021(1); Condition: New(1) Like New(1) Very Good(3) Good(0) Fair(0); Case: 41 mm(4) 39 mm(1) อื่น(0); Movement: Automatic(4) Spring Drive(1); Delivery: Full set(5) With box(5) With papers(5) Watch only(0) — **chip (0) ยังกดเลือกได้** (count = รายการขายปัจจุบัน ไม่ใช่ inactive) | เลขใน () ตรง mock ทุกตัว | Medium | |
| FO-TC-SRCH-035 | brand → model dependency | MEMBER | Func | filter page | 1. แตะ "Rolex" 2. ดูกลุ่ม Model 3. แตะ "Submariner" + "Datejust" 4. เอา "Rolex" ออก | เลือก brand → title กลุ่มเปลี่ยน "Model · Rolex" + chips เหลือเฉพาะ 5 รุ่น Rolex; เอา brand ออก → models ที่เลือกไว้**ถูก prune ออก** (allowed set กรอง) + ลิสต์กลับครบทุกแบรนด์ | chip on = พื้นเข้ม; scroll ไม่เด้งกลับบน | High | |
| FO-TC-SRCH-036 | multi-select ใน key เดียว = OR | MEMBER | Func | filter page | 1. Brand: แตะ Rolex + Tudor 2. Apply | f.brand=["Rolex","Tudor"] → ผล = p1,p4 (Rolex) + p2 (Tudor) = 3 ใบ | chips row บน results แสดง "Rolex ×" "Tudor ×" | High | |
| FO-TC-SRCH-037 | ข้าม key = AND | MEMBER | Func | filter page | 1. Brand Rolex + Condition "New" 2. Apply | brand AND cond → Rolex ทั้ง 2 ใบเป็น Very Good → **0 ผล** "No data found" + hint | chips "Rolex ×" "New ×" ยังแสดงแม้ 0 ผล | High | |
| FO-TC-SRCH-038 | back = discard draft | MEMBER | Func | filter page, เลือก chips ไว้แล้ว | 1. แตะ ← (ไม่กด Apply) 2. เปิด filter ใหม่ | `fDraft=null` → ไม่มีอะไร apply; เปิดใหม่ draft เริ่มจาก S.f เดิม (chips ที่เพิ่งเลือกเล่น ๆ หาย) | results/landing ไม่มี chips ใหม่ | High | |
| FO-TC-SRCH-039 | Clear all (ใน draft) | MEMBER | Func | filter page มีเลือกไว้ | 1. แตะ "Clear all" | `fDraft=blankFilters()` → ทุก chip off + ช่องราคาว่าง + Apply ไม่มีเลข; **ยังไม่แตะ S.f** จนกว่า Apply | หน้า filter ล้างสะอาด | Medium | |
| FO-TC-SRCH-040 | Apply → results + chips | MEMBER | Func | filter page เลือก Rolex + pmin/pmax | 1. แตะ "Apply (n)" | `S.f=fDraft`, mode=results, stack=["search"] → หน้า results พร้อม chips row ใต้ tabs; ← จาก results กลับ landing (ไม่ใช่ filter page) | ปุ่ม Apply แสดง "Apply (2)" เมื่อเลือก 2 ค่า | High | |
| FO-TC-SRCH-041 | scroll ไม่เด้งตอนเลือก chip | MEMBER | Edge | filter page เลื่อนลงกลางจอ | 1. แตะ chip กลุ่มล่าง (เช่น Delivery) | handler เก็บ `scrollTop` แล้ว restore หลัง renderSub → หน้าไม่กระโดดกลับบนสุด | viewport อยู่กลุ่มเดิม | Low | |
| FO-TC-SRCH-042 | quirk: Strap/Delivery matching | MEMBER | Edge | filter page | 1. แตะ "Leather" → Apply → ดูผล 2. แตะ "Oystersteel bracelet" → Apply | "Leather" count (0) — match case-sensitive: "Alligator leather" ของ p5 **ไม่**ผ่าน (l เล็ก); "Oystersteel bracelet" (0) — "Oystersteel (Oyster bracelet)" ของ p1 ไม่มี substring นี้; Delivery "With box"(5) นับทับ Full set เพราะ text มี "box" | ผล 0 ใบทั้งคู่ — เป็นพฤติกรรมจริงของโค้ด ไม่ใช่บั๊กที่ต้องแก้เอง | Medium | |
| FO-TC-SRCH-043 | filter ทำงานใน tag mode | MEMBER | Edge | results tag mode (#tukdaeng) | 1. เปิด filter → เลือก Brand "Breguet" → Apply | matchFilters ใช้กับ tag mode ด้วย → "#tukdaeng"+Breguet = เหลือแค่ p5 (showcase ไม่มี spec Brand → หลุด); "#rolex"+Breguet = 0 ผล | chips แสดงบน tag results | Low | |

### 2.6 Price Range & Validation

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-SRCH-044 | ช่องราคา auto-comma / digits-only | MEMBER | Func | filter page | 1. พิมพ์ "420000" ในช่อง Minimum 2. พิมพ์ "12a3b" | input handler `unNum`+`fmtNum` → "420,000" ทันที; ตัวอักษรถูกตัดเหลือ "123" (อ้าง money-display-rules §4.2 — ระบบใส่ comma ให้) | placeholder "Minimum"/"Maximum" หายเมื่อมีค่า | Medium | |
| FO-TC-SRCH-045 | min > max | MEMBER | Func | filter page | 1. Minimum 500,000 · Maximum 100,000 → Apply | validation ก่อน apply → error "Minimum price must not exceed maximum price" โผล่ใต้ช่องราคา; **อยู่หน้า filter ต่อ ไม่มีอะไร apply** | `.flt-err` แดงใต้ price row | High | |
| FO-TC-SRCH-046 | max เกิน 2,000,000 | MEMBER | Func | filter page | 1. Maximum 3,000,000 → Apply 2. แก้เป็น 2,000,000 → Apply | > MAX_PRICE → error "Maximum price must not exceed 2,000,000"; =2,000,000 ผ่าน (เพดาน inclusive) → ไป results | error เปลี่ยนตาม rule ที่เจอ | High | |
| FO-TC-SRCH-047 | chip ราคา + ขอบเปิด | MEMBER | Func | filter page | 1. ใส่แค่ Minimum 200,000 → Apply 2. เปิด filter ใส่แค่ Maximum 500,000 → Apply | min only → ผลเฉพาะ ≥200,000 (p1,p4,p5) + chip "THB 200,000–Any"; max only → chip "THB 0–500,000"; ทั้งสองช่อง → "THB 200,000–500,000" กรองช่วงจริง | chip ราคาเดียวรวมทั้งช่วง (full amount + THB ตาม money rules) | High | |

### 2.7 Active Filter Chips & Persistence

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-SRCH-048 | chips แสดงทุกค่าที่ apply | MEMBER | UI | results ที่ apply Brand Rolex + Dial Blue | 1. ดูแถวใต้ tabs | chips row: "Rolex ×" + "Blue ×" ตามลำดับ key (brand,model,cond,ref,year,csz,move,dial,strap,deliv แล้ว price ท้ายสุด); ไม่มี chips เมื่อ filter ว่าง | chip สไตล์ on + × เล็ก | High | |
| FO-TC-SRCH-049 | ลบ chip ทีละอัน → ผลเปลี่ยนทันที | MEMBER | Func | results มี chips Rolex + 41 mm | 1. แตะ × บน chip "Rolex" | `S.f.brand` ตัดค่านั้น → re-render: chip หาย + ผลขยาย (เหลือกรองแค่ 41mm → 4 ใบ) | ไม่ต้อง Apply ซ้ำ | High | |
| FO-TC-SRCH-050 | ลบ chip ราคา + filter ค้างข้ามหน้า | MEMBER | Func | results มี chip "THB 200,000–500,000" | 1. × ทิ้ง → min/max ถูกล้างคู่กัน 2. ← กลับ landing → เปิด filter → ← → ค้นใหม่ | chip ราคาลบ = เคลียร์ทั้ง pmin/pmax; **S.f ที่เหลือ persist** — back ไป landing/เข้าออก filter/ค้นคำใหม่ filter ยังทำงาน (persist จน reload) | ผลใหม่ยังถูกกรองด้วย chip ที่เหลือ | High | |

### 2.8 Search Bell → Watch Alert `[GATE]` (entry เท่านั้น — flow อยู่ FO-TEST-11)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-SRCH-051 | bell — guest [GATE] | GUEST | Func | guest อยู่ results (ค้นอะไรก็ได้) | 1. แตะกระดิ่งบน head | `.sr-wa` ∈ gate → Member Sheet "Join TukDaeng"; wa sheet ไม่เปิด | sheet เด้ง; ปิดแล้วอยู่ results เดิม | High | |
| FO-TC-SRCH-052 | bell — member เปิด wa sheet | MEMBER | Func | results q="rolex" ไม่มี filter | 1. แตะกระดิ่ง | `_waDraft = {source:"search", criteria:[Keyword rolex], matchMode:"all", name:'"rolex"'}` → sheet "Create watch alert": ช่องชื่อ autofill `"rolex"` + 3 โหมด (Match all/any/model + "N now") + ปุ่ม "Create alert" — **criteria ไม่ลิสต์ใน sheet** (ออกแบบให้ดูหน้าหลัง) | sheet เลื่อนขึ้นบน results | High | |
| FO-TC-SRCH-053 | bell พร้อม filters → name จาก criteria | MEMBER | Func | results ที่ apply Brand Rolex + Model Submariner | 1. แตะกระดิ่ง 2. ปิด sheet | waName → "Rolex Submariner" autofill; criteria = filter chips ทั้งหมด; match count ต่อโหมดคำนวณจาก criteria จริง (all → 1 now) | ปิดแล้วกลับ results chips ยังอยู่ | Medium | |
| FO-TC-SRCH-054 | bell on-state + edit mode | MEMBER | Edge | สร้าง alert จากการค้นนี้แล้ว (กด "Create alert" ใน sheet หนึ่งครั้งเป็น setup — internals อยู่ FO-TEST-11) | 1. ดูกระดิ่งบน results เดิม 2. แตะอีกครั้ง | `waSaved` (source=search + sig เดียวกัน) → กระดิ่งได้ `.on`; แตะ → sheet โหมด "Edit watch alert" (ปุ่ม "Save changes" + "Delete alert") ไม่สร้างซ้ำ | ไอคอนเติม/สีต่างจาก off | Medium | |

### 2.9 Grid Tile → Post Viewer (กติกา: viewer เปิดจาก tile เท่านั้น)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-SRCH-055 | explore tile → viewer | MEMBER | Func | อยู่ landing | 1. แตะ tile ลำดับที่ 1 (รูปแรกของ p1) 2. swipe ขึ้น/ลง 3. แตะ ← | `openPostViewer` แบบ immersive (ไม่ feedMode): track = ทุกโพสต์, เปิดที่ pid+photo index ที่แตะ; swipe = เปลี่ยนโพสต์แนวตั้ง; pv-head = ← + ไอคอน search; ← กลับ landing | รูปเต็มจอ + rail ปุ่มขวา (internals → FO-TEST-06) | High | |
| FO-TC-SRCH-056 | result tile → viewer ตามลิสต์ผลค้น | MEMBER | Func | results q="rolex" (2 ใบ) | 1. แตะ tile p4 (ใบที่ 2) 2. swipe ลง 3. ← | list = searchResults → viewer มีแค่ 2 โพสต์ (p1,p4) เริ่มที่ p4 photo0; swipe สุดขอบไม่ไปต่อ; ← กลับ **results เดิม** (chips/q ไม่หาย) | viewer ไม่แสดงโพสต์นอกผลค้น | High | |
| FO-TC-SRCH-057 | ไอคอน search ใน viewer → typing | MEMBER | Func | viewer เปิดจาก tile | 1. แตะไอคอนแว่นขยายบน pv-head | ปิด pv-open → ถ้ามี search sub อยู่ → mode = "typing" (ช่องมี q เดิมค้าง) | กลับหน้าพิมพ์ค้น ไม่ใช่ landing | Medium | |

### 2.10 Guest Coverage รวม

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-SRCH-058 | guest browse search ครบวงจร — ฟรี | GUEST | Func | guest เปิด search | 1. landing → พิมพ์ "rolex" → Enter → results → เปิด filter เลือก/Apply → แตะ tile → viewer → ← | ทุกขั้นทำได้ไม่เจอ Member Sheet: search/suggest/results/filter/apply/viewer ล้วนไม่อยู่ใน gate | UI เหมือน member ทุกจุด | High | |
| FO-TC-SRCH-059 | guest gates ในบริบท search | GUEST | Func | guest อยู่ results q="watch" | 1. แตะกระดิ่ง → sheet เด้ง ปิด 2. tab Profiles → แตะ Follow → sheet 3. ← กลับ landing แตะ bookmark | gate เฉพาะ `.sr-wa` + `.sc-follow` (= `.follow-btn`); **bookmark/sr-saved ไม่ gate** → Saved page เปิด "No saved posts yet" | sheet × 2 จุด, saved ว่าง | High | |

### 2.11 i18n / Theme / Money — Spot-check (sweep เต็ม → FO-TEST-19)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-SRCH-060 | หน้า search ส่วนใหญ่ hardcode EN `[OPEN]` | MEMBER | UI | lang=TH | 1. เปิด search ไล่ landing → typing → results → filter | label เกือบทั้งหมดไม่ผ่าน isTh: "Search", "Recent", "See all", "For you/Profiles/Tags", "Accounts/Posts", "No data found", "Filters", section titles, "Clear all"/"Apply", "Recent searches" — คง EN; ที่แปลจริง: sub ของ seller card ("N รายการประกาศ"/"กำลังติดตาม"), ปุ่ม Follow, wa sheet | quirk ที่ควรรายงาน — ไม่ใช่ defect ของเคส | Medium | |
| FO-TC-SRCH-061 | เงินบน search = chip ราคาเท่านั้น | MEMBER | UI | apply price range แล้ว | 1. ดู chip + views badge บน tile | chip "THB 200,000–500,000" = เต็มจำนวน + THB + comma (money rules §4.1 full amount); "0"/"Any" ตอนขอบเปิด; badge "1.2K"/"980" = **views ไม่ใช่เงิน** ห้ามมี THB | ไม่มีทศนิยม ไม่มี ฿ ปน | Medium | |
| FO-TC-SRCH-062 | dark theme | MEMBER | UI | theme=dark | 1. ไล่ landing/typing/results/filter/chips/empty | surface/chip on-state/ตัวอักษรอ่านได้; grid รูปไม่เพี้ยน; error text อ่านได้ | contrast ปกติทุกหน้า | Low | |

## 3. หมายเหตุ / ข้อจำกัดที่ต้องรีวิว

1. **ไม่มี UI ให้ทำให้ `S.err` เป็นจริง** — error state ("Something went wrong. Please try again." + Try again) เข้าถึงได้แค่ทาง console (`._search.err=true` แล้วแตะ tab ให้ re-render) — SRCH-027 จึงเป็นเคส dev-assisted เช่นเดียวกับ sort (SRCH-031)
2. **sort field มี state+logic แต่ไม่มี control** — inventory mark `[OPEN-NO-CODE]`; เคสนี้ยืนยันว่า "ไม่มี UI" เป็นข้อเท็จจริง + logic ทำงานถ้าบังคับ state (plo/phi/pop)
3. **search state persist ต่อ screen ทั้ง session** — เปิด search ซ้ำเจอ results เดิม (SRCH-030); reset ได้ด้วย reload / "1st" replay เท่านั้น — ถ้า PO ตั้งใจให้กลับ landing เสมอ ให้ mark เป็น gap
4. **Strap/Delivery matching มี quirk**: "Leather" ไม่ match "Alligator leather" (case-sensitive `includes`), "Oystersteel bracelet" ไม่ match "Oystersteel (Oyster bracelet)", "With box"/"With papers" นับทับ "Full set" ทั้ง 5 ใบ — SRCH-042 บันทึกเป็นพฤติกรรมจริง ไม่ใช่สิ่งที่ tester ต้องแก้
5. **recents cap 8 + dedupe case-insensitive**; Recent preview แสดง 4 แถว + "See all" เมื่อ >4 — ทั้งสองหน้าแชร์ลิสต์เดียวกัน
6. **Accounts row (For you) ไปค้นด้วยชื่อ seller ไม่ใช่ profile** — ต่างจาก seller card ใน Profiles tab (`data-pf-user` → profile); SRCH-023/024 คุมคู่กัน
7. **tag mode (q ขึ้นต้น #) ใช้ `POSTS.filter(!muted)`** — รวม showcase + โพสต์ ni/blocked ด้วย ต่างจาก normal results ที่กรอง `salePosts()` (ni/muted/blocked หลุด + ต้องมีราคา) — SRCH-026/032
8. **ส่วนใหญ่ของหน้า search hardcode EN** — เฉพาะ seller card sub + Follow + wa sheet ที่แปลไทย; รายงานเป็น `[OPEN]` เชื่อม FO-TEST-19
9. **suggest seller sub ใช้โพสต์แรกของ seller ตัดสิน "Following"** — sellerSub ดู `posts[0].following` เป็นตัวแทน
10. traceability: rows ที่ defer ออก — `pv-open` internals → FO-TEST-06, sheet `wa` save/list → FO-TEST-11, `saved` internals → FO-TEST-14, Member Sheet → FO-TEST-01/17
