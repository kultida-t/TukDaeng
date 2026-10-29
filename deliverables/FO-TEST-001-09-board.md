# FO-TEST-001-09 — Test Cases: Board (นิตยสาร) (แอปมือถือจริง)

**Task**: `ec6323af-755b-45b3-bf58-5d3a2bfd4b93` — FO-TEST-09 — Test Cases: Board (นิตยสาร) (FO prototype → real app)
**SoT**: แอปมือถือ TukDaeng จริงบนอุปกรณ์จริง + expected ตาม `FrontOffice/12_BOARD_MODULE.md` (FO-PRD-v1.9) — `Prototypes/fo-flow` = แค่ reference ว่าหน้าตาควรเป็นแบบไหน
**Scope**: inventory §2.8 Board Editorial — แท็บ Board + board home + `boardall` + `boardsearch` + Categories sheet + `boardart:<id>` (Article Detail) + like/share + gating + nav/state/language/theme + real-app behaviors (per-account like, deep link, offline)
**ก่อนเทส**: อ่านกติกาใน `deliverables/FO-TEST-001-testcase-prompt.md` + spec `FrontOffice/12_BOARD_MODULE.md` + หมายเหตุรอบ 2026-10-28 ใน task note
**ต่อจาก**: FO-TEST-01–08 (รอบนี้ reuse template — เล่มนี้สมมติรู้กติกาบ้านแล้ว)
**Status**: รอบแรก = เทสบน HTML prototype (54 cases + 17 gaps) — **รอบนี้แปลงมาเทสแอปจริง: เก็บ TC ID เดิม (001–058 ปรับ expected ตาม spec ล็อก) + เพิ่ม real-app cases (059+)** — prototype ถูกปรับให้ตรง spec แล้ว (ลบ dead wiring + เพิ่ม scroll restore)
**หมายเหตุ**: เขียนเสร็จรอรีวิว — อย่าเพิ่งปิดงาน

---

## §0 วิธีใช้ + สภาพแวดล้อม + กติกาที่ล็อก

- **ทดสอบบนเครื่องจริงเท่านั้น** — ติดตั้งแอป build ทดสอบลงมือถือจริง (iOS/Android ตามที่ทีมกำหนด) แตะ/ปัด/พิมพ์/เลื่อนบนหน้าจอจริง — **ไม่ใช้ browser, dev console, ปุ่ม dev/demo ในหน้า setting หรือ channel dev เพื่อบังคับสถานะ** — เตรียมสถานะด้วย action จริงในแอป + ข้อมูลจริงบน server เท่านั้น
- **Actors**: `GUEST` = ไม่ sign in · `MEMBER` = sign in ปกติ (บัญชีทดสอบที่ทีมสร้างให้) · `NEW` = สมัครใหม่ (ใช้ต้องมีบัญชีใหม่จริง) · `ACCT-2` = **บัญชีจริงที่สอง บนเครื่องจริงอีกเครื่อง** — เคสที่ต้อง ACCT-2 แต่ไม่มีบัญชี/เครื่องเพิ่ม → มาร์ก `BLOCK` ระบุใน Note (อย่า workaround ด้วยการแก้ state เอง)
- **จุดเข้า board**: แท็บ Board บน bottom nav; ทางเข้า Article Detail ได้หลายทาง (hero / row / search result / deep link)
- **Type**: `POSITIVE` = flow ปกติ · `NEGATIVE` = ขาดเงื่อนไข/ข้อมูลผิด · `EDGE` = ขอบเขต · `STATE` = เช็ก state ที่เก็บไว้ · `GATE` = บังคับ sign in · `GATE-inverse` = ยืนยันว่าเปิดเสรี (guest เข้าได้) — อธิบายแบบเดียวกับเล่ม Chat
- **[GATE] ทุกเคสเทส 2 รอบ**: รอบ A เป็น `GUEST` (expect Member Sheet), รอบ B เป็น `MEMBER` (expect feature ทำงาน) — guest ที่ไม่ใช่ GATE ต้องใช้งานได้เสรี (เปิดเทียบ Member Sheet ของ Chat/Alerts)
- **Device back เทียบเท่า ปุ่มย้อนในแอป/ปิดทีละชั้น**: เคสที่ขั้นตอนมี "แตะ back/✕" — tester สลับเครื่องมือเป็น device back (ปุ่ม/เจสเจอร์ของ OS) ได้ ผลต้องเทียบเท่ากัน (ล็อกแล้ว: ปิดทีละชั้น เหมือนทุกเล่ม)
- **ภาษาตามแอปทั้งหมด** (ล็อก 2026-10-28): expected = ทุกข้อความ UI ของ board เปลี่ยนตามภาษาที่เลือกในแอป — เจอ UI string ค้างอีกภาษา = **FAIL**; ยกเว้น **เนื้อบทความจริง** (title/sub/body/author จาก CMS — เป็น content ไม่ใช่ UI) และชื่อแบรนด์/รุ่นในเนื้อหา
- **Dark theme**: ทุกหน้าใน §1 ต้องอ่านได้ครบใน dark theme (contrast โอเค ไม่มีจุดตัวอักษรจมพื้นหลัง) — เทสคู่กับ light ที่ BRD-057
- **Priority**: `HIGH` = flow ปกติ · `MED` = รอง · `EDGE`/`NEGATIVE`/`STATE`/`GATE` เป็น MED เว้นกำหนด · เคสใหม่ที่ขึ้น "BLOCK if" อยู่แล้ว = MED
- **ตัวเลข/ภาษาใน expected = ตาม spec/dict ไม่ใช่ข้อมูลจริง** — จำนวนบทความ featured/latest/categories/tags ขึ้นข้อมูลบน server จริง: จำนวนจริงต้องตรงข้อมูลบน server — น้อย/มากกว่าที่ spec ตัวอย่างไว้ไม่ใช่ FAIL ถ้าตรงข้อมูลจริง; ไม่ตรงข้อมูลจริง = FAIL
- **Result column**: เว้นว่าง — tester กรอก `PASS`/`FAIL`/`BLOCK` + ปัญหาใน `Note`
- **ไม่มีเคสแบบ "จดผล/จดพฤติกรรม"** — expected ชัด ไม่ตรง = `FAIL` (พฤติกรรมที่ spec ไม่ล็อกระบุชัดไว้ เช่น ")
- **Out of scope**: โมดูลอื่น (Chat/Alerts/Saved = มีเล่มของตัวเอง) · เวอร์ชัน dev-channel · งานสร้าง/แก้บทความฝั่ง BO · เคส server latency ละเอียด (เจอแค่ตอนนี้ว่า board ไม่มี live state เยอะ)

## §1 Coverage map

| Page / Route | ขอบเขต | TC ที่ครอบ |
| --- | --- | --- |
| แท็บ `board` (Board home) | guest เข้าเสรี · bd-head (Categories + TUK DAENG \| Board + Search) · hero carousel บทความ featured (หลายภาพ/ปัด/จุด/Read more/แตะเปิดบทความ) · Latest Articles + View all · แถวบทความ (รูป+หมวด+หัวข้อ+นาทีอ่าน) · end note · bottom nav | BRD-001..012, 049–051, 056, 057 |
| `boardall` (All Articles + category pills) | crumb กลับ · pill `All` + หมวด (filter ตอนนั้น) · ลากแถว pill ได้ · รวมบทความ featured ด้วย | BRD-013..022, 051 |
| Categories sheet (`bdmenu`) | burger เปิด sheet หมวดหมู่ · เลือก → `boardall` filter ไว้ · ปิด sheet | BRD-018..021 |
| `boardsearch` | ช่องค้น (autofocus) · Popular Topics chips · live filter (ตัวเลขผล) · บัตรผล · no-result · แตะ chip = เติมคำ | BRD-023..033 |
| `boardart:<id>` (Article Detail) | floating nav (back/like/share — ไม่มี bottom nav) · หมวด/หัวข้อ/author แถว · cover รูป · callout + ย่อหน้า · tag chips · end | BRD-034..048, 052–055, 058 |
| guest-gated like/share | [GATE] เทียบ Member Sheet | BRD-041..048 |
| Nav/state/language/theme | ตำแหน่ง scroll/tab-state · filter persist · state ข้ามหน้า · ภาษา · dark | BRD-049..058 |
| Real-app behaviors | like ผูกบัญชี + sync ข้ามเครื่อง + persist restart · share copy link → deep link จริง · บทความ unavailable · offline/รูปเสีย · ไม่มี alerts | BRD-059..069 |

## §2 Test cases

ผู้ทดสอบ: อย่าพึ่ง row นี้อย่างเดียว — ให้อ่าน expected ขึ้นก่อนแล้วค่อยทดสอบ (เปิด Note ด้วยตอนเจอปัญหา)

### Setup

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SETUP-01 | ติดตั้งแอป | — | SETUP | เครื่องจริงเครื่องหลัก | ติดตั้ง build ทดสอบที่ทีมส่งให้ → เปิดแอป | เห็นหน้า onboarding (แอปสะอาด) | splash/หน้าแรกของแอป | — | |
| SETUP-02 | สถานะเริ่มต้น | — | SETUP | แอปติดตั้งแล้ว | ลบข้อมูลแอป/ติดตั้งใหม่ ถ้าเคยใช้เครื่องนี้มาก่อน | แอปสะอาด เหมือนผู้ใช้ใหม่ | — | — | |
| SETUP-03 | ผู้ใช้ GUEST | — | SETUP | แอปสะอาด | ไม่ sign in → เดินเข้า feed ได้เลย | guest mode | bottom nav ครบ (Feed/Board เป็นต้น) | — | |
| SETUP-04 | ผู้ใช้ MEMBER | — | SETUP | แอปสะอาด | sign in ด้วยบัญชีทดสอบที่ทีมสร้าง | เข้า feed เป็นสมาชิก | avatar/ชื่อตัวเองในที่ที่ต้องแสดง | — | |
| SETUP-05 | ผู้ใช้ NEW | — | SETUP | แอปสะอาด | สมัครใหม่ด้วยเบอร์/อีเมลทดสอบจริง → ผ่าน onboarding จนเข้า feed | member ใหม่ | เหมือน member (board ไม่แยกสถานะ) | — | |
| SETUP-06 | ข้อมูลอ้างอิง | MEMBER | SETUP | sign in แล้ว | บันทึกบน Note ของไฟล์: `ACTOR-MEMBER`, `ACCT-2`, `ART-FEAT` = บทความที่เห็นบน hero, `ART-A` = บทความที่อยู่นอก featured, `CAT-X` = หมวดที่มีบทความเยอะ, `Q-HIT` = คำที่ควรเจอใน title, `Q-MISS` = คำที่ไม่ควรเจอ | ข้อมูลพร้อม | ไม่มี (เป็นบันทึก) | — | |
| SETUP-07 | ทางเข้า + ปุ่ม | — | SETUP | อยู่หน้าใดก็ได้ | ทดลอง: แท็บ Board บน bottom nav → board home; burger = Categories; แว่น = search; View all = boardall; ใน article: back/like/share เป็น floating pill บนสุด | ทางเข้าทำงาน | ตำแหน่งตาม spec §6 | — | |
| SETUP-08 | Member Sheet mechanics | GUEST | SETUP | เป็น guest | ลองกด action ที่ gate (เช่น like ใน article) | Member Sheet เด้ง มี Sign in/Sign up/Close | bottom sheet ขึ้นจากขอบล่าง เหมือนทุกหน้า | — | |
| SETUP-09 | เครื่องที่สอง + ACCT-2 | — | SETUP | มีเครื่องจริงอีกเครื่อง | ติดตั้ง build เดียวกันลงเครื่องที่สอง → sign in `ACCT-2` → อยู่ feed | บัญชีสองพร้อม | — | — | |
| SETUP-10 | เตรียม offline/รูปเสีย | MEMBER | SETUP | sign in แล้ว | เปิดบทความ ART-A ไว้ (โหลดรูปครบแล้ว) → เตรียมปิดเน็ต (เครื่องบิน/ปิด Wi-Fi) | พร้อมเทส | — | — | |

### 2.1 Board home — guest/member

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BRD-001 | แท็บ Board เปิดเสรี | GUEST | GATE-inverse | อยู่ Feed เป็น guest | แตะแท็บ Board | เปิด board home ได้เสรี (ไม่เด้ง Member Sheet) — รอบ B: ทำซ้ำกับ MEMBER เหมือนกัน | bd-head (burger + `TUK DAENG \| Board`) + hero + Latest Articles + bottom nav เปลี่ยน active มา Board | HIGH | |
| BRD-002 | โครง board home | MEMBER | POSITIVE | อยู่ board | scroll ลงดู | หน้า render ตามลำดับ: head → hero → Latest → rows → end note → bottom nav | — | HIGH | |
| BRD-003 | การ์ดใน hero | MEMBER | POSITIVE | อยู่ board | ดูสไลด์แรกของ carousel | ปกภาพเต็มเฟรม + ขาวเข้มล่าง (อ่านตัวอักษรได้) + หมวด (tag pill) + หัวข้อ + subtitle + `Read more` + จุดเลื่อน (จุดปัจจุบัน active) | tag = หมวดของบทความจริง (ถ้าหมวดว่าง → FEATURED/แนะนำ ตาม dict) | HIGH | |
| BRD-004 | แตะ hero เปิดบทความ | MEMBER | POSITIVE | อยู่ board | แตะกลางสไลด์ (ไม่โดน Read more) | push ไป Article Detail ของบทความนั้น | transition แบบเลื่อน (ตาม nav ของ app) | HIGH | |
| BRD-005 | Read more เปิดบทความ | MEMBER | POSITIVE | อยู่ board | แตะปุ่ม Read more บนสไลด์ | เหมือน BRD-004 — เปิดบทความเดียวกัน | — | MED | |
| BRD-006 | ปัด hero ไปข้างหน้า | MEMBER | POSITIVE | อยู่ board, hero มี ≥2 slides | ปัดซ้าย (ลากแล้วปล่อย) → snap ไปสไลด์ถัดไป | สไลด์ถัดมาเข้าเฟรม จุดเลื่อนเปลี่ยนตาม และ **ไม่เปิดบทความ** (ลาก≠แตะ) | ระหว่างลาก ภาพตามนิ้วไปแล้ว snap เมื่อปล่อย | HIGH | |
| BRD-007 | แตะจุดเลื่อน | MEMBER | POSITIVE | อยู่ board, hero มี ≥3 slides | แตะจุดที่ไม่ใช่ปัจจุบัน | carousel เลื่อนไปสไลด์นั้น จุดเปลี่ยน active | — | MED | |
| BRD-008 | ปัดเกินขอบ | MEMBER | EDGE | อยู่สไลด์แรก | ปัดขวาที่สไลด์แรก → ขยับแล้วกลับ; ไปสไลด์สุดท้าย → ปัดซ้าย → เหมือนกัน | ไม่วนลูป, ไม่ autoplay | — | MED | |
| BRD-009 | bd-head pinned ตอนเลื่อน | MEMBER | POSITIVE | อยู่ board | เลื่อนลงผ่าน hero ไป list | bd-head อยู่ติดบน (sticky + glass) ไม่หลบเหมือน hero | bottom nav คงที่ล่าง | HIGH | |
| BRD-010 | แถว Latest Articles | MEMBER | POSITIVE | อยู่ board | ดูแถวที่สองของ list | รูป thumb ซ้าย + หมวดเล็ก + หัวข้อ (ตัด ~2 บรรทัด) + meta `N min read · เวลา` — **ไม่มีตัวเลข like บนแถว** | จำนวนแถว = จำนวนบทความที่ไม่ featured ตอนนั้น | HIGH | |
| BRD-011 | แตะแถวเปิดบทความ | MEMBER | POSITIVE | อยู่ board | แตะแถวที่สอง | push ไป Article Detail ของเรื่องนั้น | — | HIGH | |
| BRD-012 | ปลาย list | MEMBER | EDGE | อยู่ board | เลื่อนจนสุด | เจอ end note เช่น `คุณดูครบทั้งหมดแล้ว/You're all caught up` | ไม่มี pagination ใน V1 — เห็น load more/infinite scroll = FAIL | MED | |

### 2.2 boardall — View all + หมวด + Categories sheet

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BRD-013 | เปิด View all | MEMBER | POSITIVE | อยู่ board | แตะ `View all` (หรือเข้าทาง burger) | push ไป `boardall`: crumb บนสุด (icon home + `บทความล่าคล่าว/Latest Articles`) + pill `ทั้งหมด/All` active + list เต็มรวม featured ด้วย + end note | crumb ไม่กลับ bottom nav | HIGH | |
| BRD-014 | เลือก pill ที่มีบทความ | MEMBER | POSITIVE | อยู่ boardall | แตะ pill `CAT-X` (ที่มีบทความหลายเรื่อง) | pill กลายเป็น active + list เปลี่ยนเฉพาะบทความที่หมวดตรง — อ้างอิง spec D7: match แบบ substring บน cat+title (เจอมากกว่าที่คิดได้) | pill auto-center ตามตำแหน่งใหม่ | HIGH | |
| BRD-015 | pill = substring ของหมวดอื่น | MEMBER | STATE | อยู่ boardall + ข้อมูลมีคู่หมวดซ้อน เช่น `Guides` ซ้อน `Watch Guides` | แตะ pill `Guides` | list แสดงทั้งเรื่องที่ cat=`Guides` และ `Watch Guides` (ตาม spec D7) — ถ้าไม่มีคู่นี้ในข้อมูล → BLOCK พร้อมเหตุผล (ไม่มีข้อมูลทดสอบ) | — | MED | |
| BRD-016 | ไล่ pill ที่เหลือ | MEMBER | EDGE | อยู่ boardall | แตะทีละ pill จนหมด | แต่ละหมวดแสดงบทความตัวเอง; หมวดที่ไม่มีบทความ → `ไม่มีบทความในหมวดนี้/No articles in this category` | — | MED | |
| BRD-017 | ลากแถว pill | MEMBER | EDGE | อยู่ boardall + pill ล้นจอ | ลากซ้าย/ขวาบนแถว → ปล่อย → แตะ pill ทันที | ลาก = เลื่อน (pill ตามนิ้ว); ปล่อยลาก = ไม่เปลี่ยนหมวด (threshold ~5px); แตะสั้น = เลือก | ลากไม่กระตุก ไม่ค้าง | MED | |
| BRD-018 | burger เปิด Categories | MEMBER | POSITIVE | อยู่ board | แตะ burger มุมซ้ายบน bd-head | bottom sheet `Categories/หมวดหมู่` + รายการหมวดจากข้อมูลจริง + ปุ่ม `ปิด/Close` + พื้น dim กดปิดได้ | — | HIGH | |
| BRD-019 | เลือกหมวดจาก sheet | MEMBER | POSITIVE | Categories เปิดอยู่ | แตะ `CAT-X` | sheet ปิด → push `boardall` ที่ filter หมวดนั้นไว้ + pill `CAT-X` active + center | — | HIGH | |
| BRD-020 | ปิด sheet โดยไม่เลือก | MEMBER | POSITIVE | Categories เปิดอยู่ | แตะ `ปิด` หรือแตะพื้น dim | sheet ปิด อยู่ board เดิม ไม่เปลี่ยน state | — | MED | |
| BRD-021 | Categories สำหรับ guest | GUEST | GATE-inverse | เป็น guest, อยู่ board | เปิด burger → เลือกหมวด | ไป boardall ที่ filter นั้น **ไม่เด้ง Member Sheet** (guest ดูได้) | — | HIGH | |
| BRD-022 | back กลับตำแหน่งเดิม + filter คงอยู่ | MEMBER | STATE | อยู่ boardall ที่ filter `CAT-X` + เลื่อนลงกลาง | แตะบทความ → เปิด detail → แตะ back | กลับมา boardall **ที่ scroll เดิม** + filter `CAT-X` ยัง active + แถว pill ตำแหน่งเดิม (ตำแหน่งล็อก 2026-10-28: restore ตำแหน่งเดิม) | — | HIGH | |

### 2.3 boardsearch

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BRD-023 | เปิด boardsearch | MEMBER | POSITIVE | อยู่ board | แตะแว่นมุมขวาบน bd-head | push ไป `boardsearch`: sbar (back + ช่องพิมพ์) autofocus/keyboard ขึ้น + crumb + `หัวข้อยอดนิยม/Popular Topics` + chips + ช่องว่าง | transition ตาม design | HIGH | |
| BRD-024 | live filter ตามตัวพิมพ์ | MEMBER | POSITIVE | อยู่ boardsearch | พิมพ์ `Q-HIT` ทีละตัว | ผลกรองสดตามตัวอักษร + `N results for 'Q-HIT'` + การ์ด (รูป+หมวด+หัวข้อ+meta รวมไลก์) | — | HIGH | |
| BRD-025 | การ์ดผลการค้น | MEMBER | POSITIVE | search มีผล | ดูการ์ดแรก | thumb + cat + หัวข้อเต็ม (ไม่ clamp) + meta รวม `N likes` (ตาม spec §11) | — | MED | |
| BRD-026 | ไม่เจอผล | MEMBER | NEGATIVE | อยู่ boardsearch | พิมพ์ `Q-MISS` | `0 results` + icon แว่นขวาง + `No results found for 'Q-MISS'` + hint เช่น `ลองคำอื่น/Try different keyword or browse popular topics` | — | HIGH | |
| BRD-027 | แตะ Popular Topic chip | MEMBER | POSITIVE | อยู่ boardsearch | แตะ chip (เช่น `Dress Watch`) | เติม `Dress Watch` ลงช่อง + ผลตามนั้น + `1 result` (singular) ถ้าเจอเดียว | — | MED | |
| BRD-028 | ลบตัวพิมพ์จนว่าง | MEMBER | EDGE | พิมพ์แล้ว | ลบทีละตัวจนช่องว่าง | กลับมาโหมด `Popular Topics` + chips ตอนช่องว่าง | — | MED | |
| BRD-029 | ไม่มีปุ่ม X ในช่อง | MEMBER | NEGATIVE | อยู่ boardsearch + พิมพ์แล้ว | มองหาปุ่ม X/clear ในช่องพิมพ์ → ลองแตะมุมขวาของช่อง | **ไม่มีปุ่ม X** (spec ล็อก: เคลียร์ด้วยการลบตัวพิมพ์ — dead UI ลบแล้ว) — canonical lock: ต้องมีปุ่ม X เคลียร์ช่องทำงานจริง — ไม่มี = FAIL | — | MED | |
| BRD-030 | Enter ในช่อง | MEMBER | EDGE | พิมพ์แล้ว | กด Enter/Return บนคีย์บอร์ด | ไม่เกิดอะไรพิเศษ (ผลกรองสดอยู่แล้ว) | — | MED | |
| BRD-031 | ค้นคำที่อยู่เฉพาะในเนื้อบทความ | MEMBER | NEGATIVE | อยู่ boardsearch + บันทึกคำจากเนื้อบทความ | เปิดบทความ → บันทึกคำที่อยู่ใน body เท่านั้น (ไม่อยู่ใน title/sub/cat) → กลับมาพิมพ์คำนั้น | `0 results` — search ไม่ค้น body (corpus = title + cat + sub ตาม spec §11) | — | HIGH | |
| BRD-032 | back แล้ว state คง / เข้าใหม่ reset | MEMBER | STATE | อยู่ boardsearch + พิมพ์ `Q-HIT` มีผล + เลื่อนผลลง | แตะผล → เปิด detail → แตะ back → กลับ board home → แตะแว่นใหม่ | รอบแรก: กลับมา boardsearch **ที่ state เดิม** (ช่องมี `Q-HIT`, ผลตำแหน่งเดิม, scroll ตำแหน่งเดิม); รอบสอง: เข้าใหม่ = ช่องว่าง + chips (reset) | — | HIGH | |
| BRD-033 | guest ค้นหา + เปิดผล | GUEST | GATE-inverse | เป็น guest, อยู่ board | แตะแว่น → พิมพ์ → แตะผล | ใช้ได้เต็ม ไม่มี gate (เปิดบทความฟรี) | — | HIGH | |

### 2.4 boardart — Article Detail

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BRD-034 | โครง Article Detail | MEMBER | POSITIVE | เปิด `ART-A` แล้ว | เลื่อนลงดูทั้งหน้า | floating nav (back + like + share) pinned บนสุด ตลอด → หมวด → หัวข้อใหญ่ → แถว `avatar + Author + Date + N likes` → ปกภาพ → callout → ย่อหน้า → tag chips ท้ายหน้า → **ไม่มี bottom nav** (spec §6) | — | HIGH | |
| BRD-035 | เนื้อหาของบทความแต่ละเรื่อง | MEMBER | EDGE | เปิด `ART-A` จำเนื้อ → back → เปิด `ART-FEAT` | เปรียบ body/author/วันที่ | แต่ละเรื่องแสดงเนื้อ/author/วันที่ **ของตัวเอง** — ถ้าเห็นเนื้อ/author เหมือนกันทุกเรื่อง = mock leftover → FAIL | ข้อมูลจริงจาก CMS | HIGH | |
| BRD-036 | หมวดยาว (cat label + tag chip) | MEMBER | EDGE | เปิดบทความในหมวดที่ชื่อยาว (ต้องมีข้อมูลนี้ — ไม่มี → BLOCK) | ดู cat label บนหัวข้อ + tag chip ท้ายหน้า | หมวดยาว wrap/ตัดตาม design ไม่ทะลุกรอบ; tag `#<cat>` ไม่มีช่องว่าง (ลบ whitespace ตาม design) — ถ้าไม่มีหมวดยาว → BLOCK พร้อมเหตุผล (ไม่มีข้อมูลทดสอบ) | — | MED | |
| BRD-037 | nav pinned + back | MEMBER | POSITIVE | เปิดบทความ + เลื่อนกลาง | เลื่อนลงจนเห็น nav → แตะ back (บน nav) | nav อยู่ pinned (floating pill) ไม่หลบ → back กลับหน้าก่อนหน้า transition ตาม design | — | HIGH | |
| BRD-038 | `N min read` | MEMBER | EDGE | เปิดบทความสองเรื่อง (สั้น/ยาว) | เทียบ label นาทีอ่าน + ความยาวเนื้อ | label นาทีอ่านสะท้อนความยาวตามที่ CMS กำหนด (ไม่บังคับตัวเลขเฉพาะ) | — | MED | |
| BRD-039 | ลิงก์ไปบทความที่ไม่มีอยู่ | MEMBER | NEGATIVE | มี deep link หรือวิธีเปิด URL บทความ | เปิดลิงก์ board ที่ id ไม่มีจริง (เช่นแก้ id ในลิงก์) → เข้าในแอป | หน้า `ไม่พบบทความ/Article not found` + `This article is no longer available.` + ปุ่ม back กลับได้ — ถ้าเปิดลิงก์ไม่ได้ → `BLOCK` พร้อมเหตุผล | — | MED | |
| BRD-040 | ไม่มี action อื่นบน article | MEMBER | NEGATIVE | เปิดบทความ | มองหาปุ่ม/เมนูอื่นนอกเหนือ back/like/share (overflow · save · comment · footer bar) | **ไม่มี** — V1 มีแค่ 3 ปุ่ม; ถ้า build มี entry อื่น — entry อื่นนอกเหนือ back/like/share = FAIL (V1 scope) | — | HIGH | |

### 2.5 boardart — Like/Share + GATE

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BRD-041 | [GATE] like ทำงาน / guest → Member Sheet | MEMBER/GUEST | GATE | เปิด `ART-A` | **รอบ A (GUEST)**: แตะ like → Member Sheet เด้ง → ปิด → like ไม่เปลี่ยน; **รอบ B (MEMBER)**: แตะ like → pill กลาย on + ตัวเลขใน author row +1 → แตะอีกครั้ง → off + ตัวเลขกลับเดิม | รอบ guest กด like ไม่เปลี่ยน state จริง | HIGH | |
| BRD-042 | like state persist ทั่วหน้า | MEMBER | STATE | like ไว้แล้ว | back ไป home → เปิดบทความเดิมใหม่ → เช็กหน้า search เดิม | เปิดใหม่: pill ยัง on + ตัวเลขคง; ใน `boardsearch` การ์ดเดียวกัน meta แสดงไลก์ใหม่แล้ว | — | HIGH | |
| BRD-043 | ตำแหน่งตัวเลข like | MEMBER | EDGE | เปิดบทความ | เทียบกับรูปตำแหน่งตัวเลข | ตัวเลขอยู่ในแถว author (`N likes`) + ใน card บน search — **ไม่มีตัวเลขบน pill** (spec §12 — pill เป็น icon อย่างเดียว) | — | MED | |
| BRD-044 | [GATE] share ทำงาน / guest → Member Sheet | MEMBER/GUEST | GATE | เปิด `ART-A` | **รอบ A (GUEST)**: แตะ share → Member Sheet → ปิด; **รอบ B (MEMBER)**: แตะ share → share sheet เด้ง (friends + apps + `Copy link`) | sheet เดียวกับของ post (shareSheetHTML ตาม spec) | HIGH | |
| BRD-045 | share sheet actions | MEMBER | POSITIVE | share sheet เปิดอยู่ | แตะ `Copy link` → ดู toast + วางลิงก์ใน note; แตะเพื่อน → `ส่งแล้ว/Sent`; แตะพื้น dim → ปิด | copy → ลิงก์ของบทความนั้นถูกเก็บ (เปิดได้จริงใน BRD-062); เพื่อน → Sent; backdrop ปิด | — | MED | |
| BRD-046 | guest ลอง like → sign in ผ่าน sheet | GUEST | GATE | guest + เปิด `ART-A` | แตะ like → Member Sheet → แตะ `Sign in` → sign in สำเร็จ → กลับมาที่ article | หน้าอยู่ที่เดิม + like **ยังไม่เปลี่ยน** (guest ต้องแตะใหม่เอง — ไม่ resume ตาม spec §14) | — | HIGH | |
| BRD-047 | ไม่มี save/bookmark entry | MEMBER | NEGATIVE | เปิดบทความ | มองหาปุ่ม save/bookmark (มุมหน้า / ใน action bar / ใน sheet) | **ไม่มี** (V1 out of scope — dead wiring ลบออกแล้ว); มี save/bookmark = FAIL (V1 out of scope) | — | HIGH | |
| BRD-048 | ไม่มี report/more entry | MEMBER | NEGATIVE | เปิดบทความ | มองหาปุ่ม `...`/เมนูเพิ่มเติม/report | **ไม่มี** (V1 — report contract §13 เป็นเผื่ออนาคต); ถ้า build มี report = FAIL (นอก scope V1) | — | HIGH | |

### 2.6 Navigation / State / Language / Theme

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BRD-049 | nav chain + back ทีละชั้น | MEMBER | POSITIVE | อยู่ board | board → `View all` → `boardall` → แตะบทความ → `boardart` → back → back | back ทีละชั้น: `boardart`→`boardall` (state เดิม) → `board` (scroll เดิม) → home ไม่มี back (root) | — | HIGH | |
| BRD-050 | back กลับ scroll/hero/dot เดิม | MEMBER | STATE | อยู่ board + เลื่อนผ่าน hero + dot อยู่สไลด์ที่ 3 | แตะบทความ → เปิด detail → back | กลับมา board **ที่ตำแหน่งเดิมแน่นอน** — hero ยังที่สไลด์ 3, scroll เดิม, ไม่รีเซ็ต (spec lock 2026-10-28 — นี่คือ gap เดิมที่แก้แล้วใน prototype) | — | HIGH | |
| BRD-051 | tab-state board + re-tap | MEMBER | STATE | อยู่ `boardall` filter `CAT-X` + เลื่อนกลาง | แท็บ Feed → แท็บ Board กลับ → แท็บ Board อีกครั้ง (re-tap) | รอบแรก: กลับมา `boardall` ตำแหน่งเดิม (filter/scroll คง — tab-state ล็อกทุกแท็บ); รอบสอง: re-tap บน Board = root reset → `board` home + search state ล้าง | — | HIGH | |
| BRD-052 | guest ใช้งานเต็มนอกจาก gate | GUEST | GATE-inverse | เป็น guest | เปิด board → hero → บทความ → search → เปิดผล → back | ทุกขั้นเปิดได้เสรี **ไม่เด้ง Member Sheet** (gate เฉพาะ like/share) | — | HIGH | |
| BRD-053 | รูปโหลดไม่ขึ้น/ช้า | MEMBER | NEGATIVE | เปิดบทความที่รูปใหญ่ + เน็ตช้าหรือขาด | เข้า board ตอนเน็ตอ่อน/เปิดบทความที่รูปยังไม่โหลด → ดูพฤติกรรม | แสดง placeholder/fallback ตาม design ไม่ crash/หน้าว่าง — ถ้ารูปโหลดหมดแล้ว จำลองด้วยรูปที่แตก (BLOCK ถ้าไม่มีวิธี) | — | MED | |
| BRD-054 | หัวข้อยาวข้ามพื้นผิว | MEMBER | EDGE | เปิดบทความที่หัวข้อยาวมาก (ต้องมีข้อมูลนี้ — ไม่มี → BLOCK) | เทียบหน้า home row / hero / article head / search card | หัวข้อยาว clamp ตาม design — ไม่ทะลุกรอบ — ถ้าข้อมูลไม่มีหัวข้อยาว → BLOCK พร้อมเหตุผล (ไม่มีข้อมูลทดสอบ) | — | MED | |
| BRD-055 | แตะรัว/ซ้อน navigation | MEMBER | EDGE | อยู่ board | แตะบทความรัว ๆ ซ้ำ / แตะ View all รัว ๆ → back | ไม่ค้าง ไม่เด้งหน้าซ้อนแบบผิด — push ตามจำนวนแตะ → back ไล่ทีละชั้น (ตาม lock: ปิดทีละชั้น) | — | MED | |
| BRD-056 | ภาษาตามแอปทุกหน้า | MEMBER | POSITIVE | ตั้งแอปเป็นภาษาไทย/อังกฤษ ตามลำดับ | ไล่ทุกหน้า (board / boardall / Categories sheet / boardsearch / boardart) → เปลี่ยนภาษา → ไล่ซ้ำ | ทุกข้อความ UI เปลี่ยนตามภาษาแอป — เจอค้างอีกภาษา = FAIL; ยกเว้นเนื้อบทความจริง (title/body/author จาก CMS — content ไม่ใช่ UI) | — | HIGH | |
| BRD-057 | dark theme อ่านได้ครบ | MEMBER | POSITIVE | ตั้ง theme = dark | ไล่ทุกหน้า board + เปิด article → เลื่อนลงสุด → เช็ก dim/contrast | ทุกตัวอักษรอ่านได้ ไม่มีจุดตัวอักษรจมพื้นหลัง / สีพัง (ดาร์กโทนตาม design) | — | HIGH | |
| BRD-058 | article ไม่มี bottom nav — ออกทาง back | MEMBER | POSITIVE | เปิดบทความ | ดูขอบล่าง + ลอง back | ไม่มี bottom nav (spec §6) — ออกทาง back pill เท่านั้น (device back เทียบเท่า) | — | HIGH | |

### 2.7 Real-app behaviors (เพิ่มเฉพาะรอบนี้)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BRD-059 | like ผูกกับบัญชี (per-user) | ACCT-2 | STATE | เครื่องที่สอง sign in `ACCT-2` | เครื่องหลัก (MEMBER) like `ART-A` → เครื่องที่สองเปิด `ART-A` เดียวกัน | เครื่องที่สองเห็นตัวเลขรวม (รวม like ของ MEMBER) แต่ pill **ไม่ on** สำหรับ ACCT-2 — like เป็นของบัญชี (spec §12) — ไม่มี ACCT-2 → `BLOCK` | — | HIGH | |
| BRD-060 | like count sync ข้ามเครื่อง | MEMBER + ACCT-2 | STATE | เปิด `ART-A` บนสองเครื่องพร้อมกัน | เครื่องหลักแตะ like → เครื่องที่สองดูตัวเลข (refresh/pull ถ้าต้อง) | ตัวเลขอัปเดตบนเครื่องที่สอง (sync ผ่าน server)| — | MED | |
| BRD-061 | like persist ข้าม restart | MEMBER | STATE | like `ART-A` ไว้ | ปิดแอปสนิท (kill) → เปิดใหม่ → เข้าบทความเดิม | pill ยัง on + ตัวเลขคง (server-backed) | — | HIGH | |
| BRD-062 | copy link เปิดลิงก์จริง | MEMBER | POSITIVE | เปิด `ART-A` + share sheet | `Copy link` → วางลิงก์ → เปิด (ในแอป/จาก note/แชร์ไปเครื่องอื่น) | ลิงก์ resolve ไป `ART-A` จริง เปิดได้เต็ม (ไม่ใช่ลิงก์ตาย/ไม่เปิด) — ถ้า build ไม่มี deep link → `BLOCK` พร้อมเหตุผล | — | HIGH | |
| BRD-063 | guest เปิด deep link บทความ | GUEST | POSITIVE | มีลิงก์บทความจริง (จาก BRD-062) | ปิดแอป → เปิดลิงก์ (เครื่อง guest) → เข้าในแอป | เปิด `Article Detail` อ่านได้เต็มโดยไม่ gate (guest browse free ตาม spec) — ถ้าไม่มี deep link → `BLOCK` | — | MED | |
| BRD-064 | deep link ไปบทความที่ถูกลบ/ปิด | MEMBER | NEGATIVE | มีบทความที่ถูกลบ/unpublish บน BO | เปิดลิงก์บทความนั้น | หน้า `ไม่พบบทความ/Article not found` + `This article is no longer available.` — ถ้าไม่มีวิธีทำบทความหาย → `BLOCK` พร้อมเหตุผล | — | MED | |
| BRD-065 | deep link เข้ามา — back ตก Feed | MEMBER | STATE | ปิดแอปสนิท → เปิดลิงก์บทความ | เปิดลิงก์จากภายนอก → อยู่ Article Detail → แตะ back | ไม่มี history ในแอป → back ตก `Feed` (ไม่ปิดแอป/ไม่หน้าว่าง) ตาม contract §13 | — | HIGH | |
| BRD-066 | เน็ตหลุดระหว่างใช้ board | MEMBER | NEGATIVE | เปิด board โหลดเสร็จแล้ว | เปิดโหมดเครื่องบิน → เลื่อน/แตะบทความ → เปิด article → ลองกด like → เปิดเน็ตคืน | หน้าที่โหลดไว้อยู่แล้วอ่านได้ต่อ; การกระทำที่ต้องเน็ต (like/load ใหม่) แสดง error/ล้มเหลวชัด ไม่ silent fail; เน็ตกลับมา → ทำงานต่อได้| — | MED | |
| BRD-067 | รูปโหลดไม่ขึ้น (real app) | MEMBER | NEGATIVE | มีวิธีทำให้รูปแตก/ไม่โหลด | เปิด board ตอนรูปโหลดไม่สำเร็จ (เน็ตอ่อน/แคชพัง) | แสดง placeholder/fallback ตาม design — layout ไม่พัง — ถ้าทำไม่ได้ → `BLOCK` | — | MED | |
| BRD-068 | กิจกรรม board ไม่สร้าง Alerts | MEMBER | STATE | มี like/share สำเร็จแล้ว | แตะ like + share บทความ → ไปแท็บ Alerts | **ไม่มี** รายการ alerts เพิ่มจากกิจกรรม board (spec §17 — board ไม่สร้างแจ้งเตือน) | — | MED | |
| BRD-069 | loading state ตอนเปิด board | MEMBER | POSITIVE | ปิดแอป → เปิดใหม่ | แตะแท็บ Board ทันที | แสดง skeleton/spinner ตาม design ระหว่างโหลดข้อมูล → เนื้อมาเมื่อโหลดเสร็จ | — | MED | |

## §3 Mapping ของ gap เดิม → spec ล็อก / ผลการแก้

| รหัสเดิม (GAP-BRD-…) | gap เดิม (รอบ prototype) | ผลลัพธ์ตาม spec `12_BOARD_MODULE.md` + การตัดสิน 2026-10-28 | TC ที่ครอบ |
| --- | --- | --- | --- |
| GAP-BRD-01 | `data-bdmore` มี handler แต่ไม่มี trigger → action sheet (Share / Copy Link / Save / Report) ตาย | spec V1: ไม่มี overflow/more entry — dead code ถูกลบจาก prototype แล้ว; report เป็น contract §13 (อนาคต) | BRD-040, 048 |
| GAP-BRD-02 | `data-bdsave` unreachable → ไม่มี save entry | spec V1: ไม่มี save/bookmark — dead ลบ | BRD-047 |
| GAP-BRD-03 | `data-bdclear` ตาย (มี query แต่ไม่มีปุ่ม render) | spec: ไม่มีปุ่ม X ในช่องค้น — dead ลบ | BRD-029 |
| GAP-BRD-04 | helpers ตาย: `bdJournal`, `bdStepSlide`, `bdScrollHandler`, `BD_FEAT_MAX`, `.bd-dfoot-sub`, `a.author`/`a.saved` inject | dead code ลบออกจาก prototype ทั้งหมด (คืนสภาพตาม spec) | — (cleanup) |
| GAP-BRD-05 | state ที่เข้าไม่ถึง (Categories ว่าง / Article not found / subtitle ว่าง) | real app เปิดได้ตามข้อมูลจริง + deep link — unreachable states ใน prototype เท่านั้น | BRD-016, 039, 064 |
| GAP-BRD-06 | filter ตรงหมวดผ่าน `includes` (substring) → `Guides` match `Watch Guides` | spec D7 ล็อก substring match — พฤติกรรมนี้คือ correct | BRD-014, 015 |
| GAP-BRD-07 | หัวข้อ `boardall` = `Latest Articles` แต่รวม featured ด้วย | spec AC-004 confirm — ชื่อ crumb ถูกแล้ว | BRD-013 |
| GAP-BRD-08 | search ไม่ค้น body | spec §11 corpus = title + cat + sub — ไม่ค้น body คือ by design | BRD-031 |
| GAP-BRD-09 | back จาก article → re-render ใหม่ → scroll/hero/dot รีเซ็ต | **spec lock 2026-10-28: restore ตำแหน่งเดิม** — prototype แก้แล้ว (scroll memory) | BRD-022, 049, 050 |
| GAP-BRD-10 | ทุกบทความใช้ `BD_BODY` เหมือนกัน | mock — production ใช้เนื้อจริงต่อเรื่อง → FAIL ถ้าเห็นเหมือนกัน | BRD-035 |
| GAP-BRD-11 | author hardcode `Tuk Daeng Editorial` + date ไม่สะท้อน | mock (D15) — production ใช้ field จริง | BRD-035, 038 |
| GAP-BRD-12 | ไม่มีบทความยาวใน seed → เคส "N min read" เทสไม่ได้จริง | ตัวเลขต้องตรงข้อมูลจริงบน build — ไม่ตรง = FAIL | BRD-038 |
| GAP-BRD-13 | localize ครึ่งเดียว (EN strings hardcode) | **ล็อก 2026-10-28: ทุก UI ตามภาษาแอป** — article content ยกเว้น | BRD-056 |
| GAP-BRD-14 | like pill ไม่มีตัวเลข — ตัวเลขอยู่ใน author row + search card | spec §12 confirm — pill icon เดียว + count ใน meta | BRD-043 |
| GAP-BRD-15 | `boardart` ไม่มี bottom nav | spec §6 confirm — ออกทาง back pill | BRD-034, 058 |
| GAP-BRD-16 | `bdFilterCat` persist ข้าม nav | spec D14 — คงจนกว่า user เปลี่ยนเอง | BRD-022, 051 |
| GAP-BRD-17 | seed dates มาจาก Date.now → `today`/`Xd ago` ตามเวลาจริง | real data| — |

**สรุปผลการเคลียร์รอบนี้** — ทั้งหมด 17 จุด: ลบ dead code จริง 4 กลุ่ม (01–04), ล็อกเป็น spec/deviation ที่ถูกต้อง 8 จุด (06–08, 14–17 บางส่วน), ตัดสินใหม่ว่าต้องแก้/เพิ่มเคส 5 จุด (05, 09–13)

## §4 Traceability — inventory §2.8 + TC ครอบ

| Inventory หน้า/route | Action ใน inventory | TC ที่ครอบ | หมายเหตุ |
| --- | --- | --- | --- |
| `board` (Board home) | เข้าดูได้เลย | BRD-001 | guest เสรี — เทียบ GATE-inverse กับ Chat/Alerts/Profile |
| `board` | burger → Categories sheet → เลือก → `boardall` filter | BRD-018..021 | |
| `board` | แว่น → `boardsearch` (autofocus) | BRD-023 | |
| `board` | hero: แตะสไลด์/Read more → `boardart` | BRD-004, 005 | |
| `board` | hero: ปัด → snap; จุด → ไปสไลด์; เกินขอบ → กลับ | BRD-006..008 | |
| `board` | bd-head ติดบนตอนเลื่อน | BRD-009 | sticky ตาม CSS จริง (spec §9) |
| `board` | row Latest → `boardart` | BRD-011 | |
| `board` | end note (ไม่มี pagination) | BRD-012 | |
| `boardall` | crumb → กลับ `board` | BRD-049 | |
| `boardall` | pill → filter substring (D7) | BRD-014..016 | |
| `boardall` | ลาก pill ไม่เปลี่ยน filter | BRD-017 | |
| `boardall` | เลือกหมวดใน sheet → มาหน้านี้พร้อม filter | BRD-019 | |
| `boardall` | back จาก `boardart` → กลับตำแหน่งเดิม | BRD-022 | **lock ใหม่ — เดิม reset** |
| `boardsearch` | พิมพ์ → live filter → card/0 results | BRD-024, 026, 031 | corpus ตาม §11 |
| `boardsearch` | chip → เติมคำ → ผล | BRD-027 | |
| `boardsearch` | ลบตัวพิมพ์ → chips; ไม่มีปุ่ม X | BRD-028, 029 | ปุ่ม dead ลบแล้ว |
| `boardsearch` | Enter → ไม่เกิดอะไร | BRD-030 | |
| `boardsearch` | back → state เดิม; เข้าใหม่ → reset | BRD-032 | |
| `boardart:<id>` | floating nav pinned (back/like/share) ไม่มี bottom nav | BRD-034, 037, 058 | |
| `boardart` | หมวด/หัวข้อ/author แถว/ปก/callout/body/tags | BRD-034, 036 | |
| `boardart` | เนื้อของแต่ละเรื่อง (mock leftover = FAIL) | BRD-035 | |
| `boardart` | `N min read` | BRD-038 | |
| `boardart` | ลิงก์ id ไม่มี → not found | BRD-039, 064 | BLOCK ถ้าไม่มี deep link |
| `boardart` | ไม่มี action อื่น (save/report/comment) | BRD-040, 047, 048 | dead ลบ |
| `boardart` | [GATE] like + share | BRD-041, 044, 046 | guest → Member Sheet |
| `boardart` | like persist ข้ามหน้า + ตำแหน่งตัวเลข | BRD-042, 043 | |
| `boardart` | share sheet: copy link + เพื่อน + backdrop | BRD-045 | |
| `boardart` | tag chips ไม่กดได้ (non-interactive) | — | ตาม spec; chips ไม่มี action — ไม่มีเคสเพราะ check อยู่ใน BRD-034 |
| guest | เปิด board/article/search เต็ม | BRD-001, 021, 033, 052 | |
| nav | back ทีละชั้น + tab-state + re-tap | BRD-049..051, 058 | lock: restore ตำแหน่งเดิม |
| state | like ผูกบัญชี + persist restart + sync ข้ามเครื่อง | BRD-059..061 | ACCT-2 (BLOCK ถ้าไม่มี) |
| deep link | copy link → เปิดจริง + guest เปิด + บทความหาย + back ตก Feed | BRD-062..065 | BLOCK ถ้าไม่มี |
| offline/edge | เน็ตหลุด + รูปแตก | BRD-053, 066, 067 | BLOCK ถ้าไม่มีวิธี |
| alerts | board ไม่สร้างแจ้งเตือน | BRD-068 | spec §17 |
| loading | skeleton ตอนเปิด board | BRD-069 | ตามเคส BRD-069 |
| ภาษา/ธีม | ทุกหน้า localize + dark อ่านได้ | BRD-056, 057 | ล็อก |

## หมายเหตุท้าย

- **ก่อนส่งงานจริง**: เขียนเสร็จ → รอ PO/หัวหน้ารีวิว → แก้ตาม feedback → ค่อยปิด task (กฎเดียวกับทุกเล่ม)
- **ตัวเลขทั้งหมดเป็นตัวอย่างตาม spec** — ตัวเลขจริงต้องตรงข้อมูลบน build — contract คือขีดจำกัดของ spec (featured ≤5 ฯลฯ) เกิน = FAIL; จำนวนน้อยกว่าตัวอย่าง spec ถ้าตรงข้อมูลจริง = ผ่าน
- **เคสที่ต้อง test data แต่ไม่มีวิธีจริง**: BRD-015 (คู่หมวดซ้อน), BRD-036 (หมวดยาว), BRD-039 (ลิงก์บทความตาย), BRD-053/067 (รูปแตก), BRD-064 (บทความถูกลบ) → `BLOCK` พร้อมระบุขาดอะไรใน Note
- **หน้าที่ขึ้น "ไม่มี"**: ถ้า build แสดง entry ที่ spec บอกไม่มี (save/report/more/X) → ไม่ใช่ FAIL โดยอัตโนมัติ — ตรวจ contract ตาม spec แล้วบันทึก flag ลง Note ให้ทีมตัดสิน

- สถิติ: **69 TC** — High 41 / Medium 28 / Low 0 (SETUP rows 10 แถวแยกใน checklist; รวมใน csv 79 แถว)
