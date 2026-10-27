# FO-TEST-05 — Test Cases: Create Composer post/asset (FO prototype)

> Task: FO-TEST-05 ของชุด FO-TEST-001 · วันที่: 2026-10-27
> กติกาหลัก: `deliverables/FO-TEST-001-testcase-prompt.md` · Task breakdown: `deliverables/FO-TEST-001-task-breakdown.md`
> Source of Truth: `Prototypes/fo-flow/index.html` (CREATE-001 block ~L15844–16305 — media roll ~L15846–15900, state ~L15901–15957, panes ~L16011–16056, picker ~L16093–16124, step2 ~L16125–16197, field mapping ~L16199–16305 · FEED-024 edit ~L16307–16423 · handlers ~L20492–20801 — input ~L20324–20357, reorder ~L20140–20184, zoom ~L20186–20210, click ~L20502–20801 · discard ~L20507–20543 + dlg ~L20995–21012 · entry `data-flow` ~L20495–20501 + ~L17141/17167/19673 · gate ~L20494 + ~L23461–23475 · handoff `fo_newpost` ~L20057–20066)
> สัญญาความครอบคลุม: `deliverables/FO-TEST-001-00-inventory.md` §2.4 — ไม่เดา behavior เพิ่ม

## 0. วิธีใช้เอกสาร + สภาพแวดล้อม

- เปิด prototype ที่ `http://localhost:8901/index.html` (หรือเปิดไฟล์ตรง) — Viewport 440×956, ทดสอบทั้ง Light/Dark และ TH/EN ตามที่ระบุในเคส
- **Actor**: `GUEST` = session guest · `MEMBER` = demo `demo@tukdaeng.com` / `Tukdaeng123` (ตัวตนในแอป = `king.mr.fox` · avatar mrfox.png) · `NEW` = สมัครใหม่ (ข้อมูลว่าง — profile grid `[]` ทำให้เห็น CTA ที่ member ไม่เห็น) · `OWNER` = member ในฐานะเจ้าของโพสต์/asset ตัวเอง (seller `king.mr.fox`)
- **Type**: UI = การแสดงผล · Func = การทำงาน · Int = เชื่อมข้าม module · Edge = negative/boundary
- **Priority**: High = core flow/กติการะบบ · Medium = feature หลัก · Low = edge/cosmetic
- **[GATE]**: guest แตะ action ใน `GUEST_GATE_SEL` → `obGate()` = Member Sheet "Join TukDaeng" — ใน scope นี้สิ่งที่ถูก gate คือ **`[data-flow]`** (ครอบปุ่ม + ทุกจุด: header, profile, empty CTA) — เคส [GATE] มีคู่ guest/member (sheet mechanics อยู่ FO-TEST-01, เมทริกซ์ทั้งแอป FO-TEST-17)
- **Composer เป็น sub-page เดียว** (`openSub(scr,"create")` → stack ถูก reset เป็น `["create"]`) มี 2 step ใน `.cf`: step 1 picker ⇄ step 2 caption (`.cap-open`) — state อยู่ใน `scr._cp` (session memory เท่านั้น ไม่ persist ข้าม reload)
- **โหมด composer 2 แบบ**: `mode:"post"` (header + → title "New post", ปุ่ม "Share") · `mode:"asset"` (profile + / empty CTA → title "Add Asset", ปุ่ม "Add Asset", มีแถว Cost + ส่วน Visibility) · `editPid` = Edit info (title "Edit info", ปุ่ม Cancel/Done — เป็น post mode เสมอ)
- **Media roll (mock)**: camera cell + `CP_MEDIA` **21 ช่อง** = รูป 16 + คลิป 5 (dur badge `0:12` `0:08` `0:31` `0:45` `0:19`) — เลือกได้สูงสุด **10** (`CF_MAX_MEDIA`)
- **Hashtag chips 10 ตัว**: #rolex #patekphilippe #omegawatch #tudorwatch #grandseiko #cartier #watchesofinstagram #fullset #watchcollector #TukDaeng
- **สถานที่ mock 8 จุด**: Bangkok, Thailand (12km) · Siam Paragon (8km) · CentralWorld (9km) · ICONSIAM (14km) · EmQuartier (7km) · Chatuchak Weekend Market (16km) · Phrom Phong (6km) · Thonglor (5km)
- **Own posts สำหรับเคส edit**: โพสต์ที่ member สร้างเอง (seller `king.mr.fox`) เมนู ⋯ จะเป็น pm-own มีแถว "Edit" — หรือใช้ gfx posts บน own profile (grid 9 รูป ได้ kind ตามลำดับ sale/show/sale/show/hide/sold/sale/show/sold → Sale 3 · Show 3 · Hide 1 · Sold 2)
- **เรื่องเงิน** อ้าง `docs/money-display-rules.md` (DRAFT v0.1): ช่องราคา/ต้นทุนใส่ comma ให้อัตโนมัติ (§4.2); ค่าที่แสดง = เต็มจำนวน `THB x,xxx,xxx` ไม่มีทศนิยม (§4.1 ตัวเลือก B); Estimated Market Price ระบบคำนวณเองช่วง −5%/+6% ปัด step 5,000 (420,000 → `THB 400,000 – 445,000`)
- **สิ่งที่อยู่นอก scope** (เคสอยู่ task อื่น — ห้ามซ้ำ): header/burger/back ของ shell (FO-TEST-02), ผลของโพสต์บน feed card internals (FO-TEST-03 — ที่นี่เช็คเฉพาะว่าโพสต์ใหม่ขึ้น feed ถูกต้อง), viewer/detail internals (FO-TEST-06 — เช็คเฉพาะ restore surface), wa sheet สร้าง alert จริง (FO-TEST-11 — ที่นี่ใช้เป็น precondition + เช็ค `_waHits` toast), portfolio/soldhist/sell form (FO-TEST-13 — เช็คเฉพาะ drawer record ถูกสร้าง/ลิงก์), Member Sheet mechanics (FO-TEST-01/17)

## 1. Coverage Map ของ task นี้ (เทียบ inventory §2.4)

| Route/Feature (inventory §2.4) | TC ID ที่ครอบ |
|---|---|
| `create` — entry `[data-flow]` post/asset `[GATE]` | CRE-001 – 005, CRE-071 |
| `create` — picker (roll/Select/camera[DEAD]/hero/Next/max 10) | CRE-006 – 014 |
| `create` — step2 caption (thumb strip/caption/chips/rows/Share) | CRE-015 – 024 |
| pane `loc` | CRE-025 – 027 |
| pane `price` | CRE-028 – 029 |
| pane `spec` | CRE-030 – 032 |
| pane `cond` | CRE-032 – 033 |
| pane `cost` `[OPEN-CODE-ONLY]` | CRE-034 – 039 |
| pane `more` `[OPEN-CODE-ONLY]` | CRE-040 – 042 |
| visibility `stt/vis` + "Also save to My Assets" toggle | CRE-049 – 053, CRE-060 – 062 |
| publish `cf-share` → `insertNewPost` + `_waHits` toast `[OPEN-CODE-ONLY]` | CRE-043 – 048 |
| edit `V.editPid` (openPostEdit/ig-add/Done-Cancel/restore) `[OPEN-CODE-ONLY]` | CRE-054 – 062 |
| clip preview `[OPEN-CODE-ONLY]` | CRE-063 – 066 |
| discard dialog + draft edge + `fo_newpost` handoff | CRE-013, CRE-067 – 069 |
| guest coverage รวมของ composer | CRE-002, CRE-071 |
| i18n / theme / money spot-check | CRE-028, CRE-035, CRE-047, CRE-070, CRE-072 – 073 |

## 2. Test Cases

### 2.1 Entry & `[GATE]` (ปุ่ม + → composer)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-CRE-001 | เปิด composer post mode จาก header + | MEMBER | Func | member อยู่ feed | 1. แตะปุ่ม + มุมขวาบนของ header | `data-flow` → `openSub("create")` — composer เลื่อนทับ feed เต็มจอ (sub stack reset) เข้า **step 1 picker** ตรง | head: ✕ + "New post" + "Next" (สีจาง/off); bar: "Recents ⌄" + "Select"; grid: ช่องกล้อง + 21 media cell; hero = "Select photos" | High | |
| FO-TC-CRE-002 | ปุ่ม + — guest `[GATE]` | GUEST + MEMBER | Func | guest อยู่ feed | 1. (guest) แตะ + 2. ปิด sheet แล้ว sign in member แตะ + อีกครั้ง | guest: `[data-flow]` ∈ `GUEST_GATE_SEL` → Member Sheet "Join TukDaeng" เด้ง **composer ไม่เปิด**; member: เปิด picker ปกติ (ทำซ้ำ asset mode: guest เข้า own profile ไม่ได้เลยเพราะ nav profile ก็ถูก gate) | sheet ขึ้นทับ feed; หลังปิดอยู่ feed เดิม | High | |
| FO-TC-CRE-003 | เปิด composer asset mode จาก profile + | OWNER | Func | member เปิด own profile (king.mr.fox) | 1. แตะไอคอน + ซ้ายบนของ profile head | `data-mode="asset"` → composer โหมด asset: head "Add Asset" + ✕ (ไม่ใช่ Next — Next อยู่ขวาบนเหมือนเดิม), โครง picker เหมือน post mode | title ต่างจาก post mode ชัดเจน | High | |
| FO-TC-CRE-004 | empty-state CTA บน profile (NEW session) | NEW | Func | session=new (สมัครใหม่ — SETUP-05) เปิด own profile | 1. ดู empty state แท็บ All 2. แตะปุ่ม "Add your first asset" | grid ว่าง → "Add your first asset" + desc "Assets you save and posts you share will show up here." + ปุ่ม primary; แตะ → composer asset mode (CTA นี้ member demo ไม่เห็นเพราะ grid มีของแล้ว) | ปุ่ม render เฉพาะ own + แท็บ all + grid ว่าง | Medium | |
| FO-TC-CRE-005 | ✕ บน draft ว่าง → ปิดเงียบ | MEMBER | Func | composer เปิดใหม่ ไม่ได้เลือก/พิมพ์อะไร | 1. แตะ ✕ บน head 2. (asset mode ทำซ้ำ: profile + → ✕) | ไม่มี dialog — `order`/`caption` ว่าง → ปิดทันที: post mode กลับ feed · asset mode `openSub` swap กลับ own profile | ปิดเร็วไม่มี warning | Medium | |

### 2.2 Picker — Step 1 (เลือก media)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-CRE-006 | เลือกรูปเดี่ยว (โหมดปกติ) | MEMBER | Func | picker เปิด (post mode) | 1. แตะรูปช่องที่ 1 2. แตะรูปช่องที่ 3 | โหมดไม่-select: แตะ = `order=[i]` ทีละใบ — ช่องแรก sel → เปลี่ยนเป็นช่อง 3 (เลือกใหม่แทนที่) ; Next เปลี่ยนเป็นสีปกติ (เอา `.off` ออก) ทั้งที่เลือก ≥1 | cell ที่เลือกมีกรอบ/overlay sel; hero preview แสดงรูปล่าสุดที่แตะ | High | |
| FO-TC-CRE-007 | Select mode — เลือกหลายรูป + เลขลำดับ | MEMBER | Func | picker เปิด | 1. แตะ "Select" 2. แตะรูป 3 ช่องติดกัน | `V.sel` toggle → grid เข้า selmode (วงกลม radio โผล่ทุก cell); แตะแล้ว radio แสดงเลข 1,2,3 ตามลำดับ `order`; ปุ่ม Select มีสถานะ on | เลขใน radio = ลำดับใน order ไม่ใช่ลำดับตำแหน่ง | High | |
| FO-TC-CRE-008 | ยกเลิก/เรียงเลขใหม่ใน selmode | MEMBER | Func | เลือก 3 รูปไว้ (จาก CRE-007) | 1. แตะรูปที่เลข 2 ออก 2. แตะรูปใหม่เพิ่ม | การเอาออก re-sequence เลขที่เหลือทันที (3→2); การเพิ่มต่อท้ายได้เลขถัดไป — `order` คือคิวจริง | เลขอัปเดตใน cell เดิมโดยไม่ re-render ทั้งจอ | Medium | |
| FO-TC-CRE-009 | ปิด Select กลางทาง | MEMBER | Edge | เลือก 2 รูปใน selmode | 1. แตะ "Select" อีกครั้ง (off) 2. แตะรูปใหม่ | sel ออก → แตะครั้งต่อไปเป็นโหมดเดี่ยว: `order=[i]` ใหม่ รูปเก่าหลุดทั้งหมด; ก่อนแตะ sel highlight ยังแสดงค้างบน cell เก่า (state ยังจำจนกว่าจะแตะใหม่) | radio หายทั้ง grid หลังปิดโหมด | Medium | |
| FO-TC-CRE-010 | เพดาน 10 media | MEMBER | Edge | selmode เลือกไปแล้ว 10 ช่อง | 1. แตะช่องที่ 11 | `V.order.length >= 10` → toast "You can add up to 10 photos or clips" ~1.8s; ไม่ถูกเพิ่ม เลขยัง 1–10 | toast ขึ้นด้านล่าง/กลางจอตาม scrToast | Medium | |
| FO-TC-CRE-011 | cell คลิป + hero clip | MEMBER | UI | picker เปิด | 1. เลื่อนหา cell ที่มี dur badge 2. แตะ cell คลิป | cell คลิปมี badge ▶+เวลา (`0:12` ฯลฯ) มุมล่าง; แตะ → hero เปลี่ยนเป็น clip variant: ไอคอน play ใหญ่กลาง + badge dur (ไม่มีปุ่ม expand) | badge ชัดเจนบน cell/hero | Medium | |
| FO-TC-CRE-012 | control ที่เป็น `[DEAD]` ทั้ง 3 จุด | MEMBER | Func | picker เปิด + เลือกรูปไว้ 1 | 1. แตะ "Recents ⌄" 2. แตะช่องกล้อง 3. แตะไอคอน expand บน hero | ทั้งสาม → toast "Not in this prototype yet" (wiring เป็น placeholder — ไม่เปิดอัลบั้ม/กล้อง/zoom); hero clip-play แตะได้แต่ **ไม่มี handler** (ไม่เกิดอะไรเลย — quirk) | toast เดียวกันทุกจุด | Medium | |
| FO-TC-CRE-013 | ✕ ตอนมี draft → discard dialog | MEMBER | Func | picker เลือกรูป ≥1 หรือพิมพ์ caption แล้ว | 1. แตะ ✕ 2. อ่าน dialog 3. แตะ "Cancel" | `order`/`caption` ไม่ว่าง → dialog: EN "If you go back now, your edits will be discarded." + "Discard"(danger) + "Cancel" — Cancel ปิด dialog กลับ picker draft เหมือนเดิม | dialog กลางจอทับ composer | High | |
| FO-TC-CRE-014 | Discard → ล้าง draft จริง | MEMBER | Func | discard dialog เปิดอยู่ (CRE-013) | 1. แตะ "Discard" 2. แตะ + เปิด composer ใหม่ | `scr._cp=null` → composer ปิดกลับ feed; เปิดใหม่ → picker ว่างสะอาด (order/caption/meta หายหมด) | ไม่มีรูปที่เลือกค้าง | High | |

### 2.3 Step 2 — Caption & Media Strip

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-CRE-015 | เข้า step 2 + anatomy | MEMBER | UI | picker เลือก 1 รูป | 1. แตะ "Next" | `V.step=2` + `.cap-open` — step2 เลื่อนขึ้น: head ← + "New post"; thumb strip; caption contenteditable (placeholder "Add a caption…"); chip row 10 hashtag; ig-rows (Add location/Add price/Watch details/Condition/More options — ไม่มี Cost เพราะ post+toggle off); ปุ่ม "Share" ท้ายจอ | Next แสดง "Share" ไม่ใช่ Next อีก | High | |
| FO-TC-CRE-016 | ← กลับ picker | MEMBER | Func | อยู่ step 2 | 1. แตะ ← บน head | `V.step=1` + เอา cap-open ออก → กลับ picker; การเลือก/media ยังอยู่ครบ | picker แสดง sel เดิม | Medium | |
| FO-TC-CRE-017 | thumb strip + ลบ media (rm-mini) | MEMBER | Func | step2 มี 3 รูป | 1. แตะ × มุม thumb ใบที่ 2 2. × ต่อจนหมด | `order.splice` → strip หด; เมื่อ `order` ว่าง → **เด้งกลับ step 1 picker อัตโนมัติ** (ไม่ใช่ Share off — `.ig-share.off` แทบไม่มีทางโผล่บน step2) | strip เป็น multi layout ตอน >1 ใบ เดี่ยวตอนเหลือใบเดียว | High | |
| FO-TC-CRE-018 | ลากเรียง thumb ใหม่ | MEMBER | Edge | step2 มี ≥3 รูป | 1. กดค้าง thumb ใบแรก ~0.4s 2. ลากไปท้ายสุด 3. ปล่อย | long-press 380ms → เข้า drag (thumb มี class drag ตามนิ้ว); ปล่อยตำแหน่งใหม่ → `V.order` splice เรียงใหม่ → re-render strip | ลำดับ thumb เปลี่ยนจริง ไม่ใช่แค่เลื่อน scroll | Medium | |
| FO-TC-CRE-019 | zoom viewer — เปิด/ปิด | MEMBER | Func | step2 มี ≥2 รูป | 1. แตะ thumb ใบที่ 2 2. แตะ backdrop มืดรอบรูป | `ig-zoom.open` โชว์รูป index ที่แตะ + dots จำนวน media (จุด on ตรง index); แตะ backdrop (ไม่ใช่รูป) → ปิด overlay | overlay เต็มจอเหนือ step2 | High | |
| FO-TC-CRE-020 | zoom swipe ซ้าย/ขวา | MEMBER | Edge | zoom เปิดอยู่, media 3 ชิ้น | 1. swipe ซ้าย 2. swipe ขวาสุดขอบ | `cfZoomGo` เปลี่ยน index ±1 (swipe >40px); ขอบซ้าย/ขวาสุด clamp ไม่วน — dots .on ตาม; swipe เฉพาะตอน media >1 | dots อัปเดตตาม slide | Medium | |
| FO-TC-CRE-021 | พิมพ์ caption → คงอยู่ข้าม step | MEMBER | Func | step2 | 1. พิมพ์ "For sale 🔥" 2. ← กลับ picker 3. Next กลับมา | input เก็บลง `V.caption` สด ๆ — กลับ step1/step2 หรือ re-render แล้วข้อความยังอยู่ (persist ใน `scr._cp` ทั้ง session) | ช่องยังมีข้อความเดิม | Medium | |
| FO-TC-CRE-022 | hashtag chip → เติม caption | MEMBER | Func | step2, caption มี "#rolex" อยู่แล้ว | 1. แตะ chip "#tudorwatch" 2. แตะ "#rolex" | chip ต่อท้าย caption ด้วยช่องว่าง ("… #tudorwatch"); `#rolex` มีอยู่แล้ว → **ไม่เติมซ้ำ** (`includes` check) | caption อัปเดตในช่องทันที | Medium | |
| FO-TC-CRE-023 | caption ว่าง Share ได้ | MEMBER | Edge | step2 มีรูป ไม่มี caption | 1. กด "Share" ทันที | ไม่มี required caption — publish ได้ปกติ (post.caption="") ปุ่ม off เฉพาะตอน `order` ว่างซึ่งเกิดไม่ได้บน step2 | โพสต์ขึ้น feed ไม่มี caption | Low | |
| FO-TC-CRE-024 | quirk hero preview ลำดับ | MEMBER | Edge | selmode เลือก 3 รูป ไม่ตามลำดับ grid | 1. ดู hero ตอนแตะสด 2. ←/Next ให้ re-render แล้วดู hero | ตอนแตะสด hero = **ใบสุดท้ายของ order** (`.at(-1)`); หลัง re-render เต็ม `cfPickerHTML` ใช้ `order[0]` — แสดงไม่ตรงกัน (พฤติกรรมจริงของโค้ด — บันทึกเป็น quirk) | ต่างกันตามที่คาด | Low | |

### 2.4 Panes — loc / price / spec / cond

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-CRE-025 | pane mechanics (เปิด/ปิด) | MEMBER | Func | step2 | 1. แตะแถว "Add location" 2. แตะ ← 3. เปิดใหม่แตะ "Done" | `V.meta.pane` → `.cf-pane` slide-in ทับ step2 (head: ← + title + "Done"); ←/`Done` ปิด pane → step2 re-render อัปเดต `.val` ของแถว | pane เลื่อนเข้าจากขวาเหมือน sub-page | High | |
| FO-TC-CRE-026 | เลือกสถานที่ → แถวมีชื่อ+km + note | MEMBER | Func | loc pane เปิด | 1. แตะ "Siam Paragon" 2. ดูแถว 3. แตะ ✕ ในแถว | เลือกแล้ว pane ปิดเอง → แถวเปลี่ยนเป็น lab2: "Siam Paragon" + sub "8km" + ✕ (loc-x) + note ใต้แถว "People you share this content with can see the location you tag…"; ✕ → `meta.loc=""` แถวกลับเป็น "Add location" + note หาย | ค่า km ตรง `CF_LOC_KM` ของสถานที่นั้น | Medium | |
| FO-TC-CRE-027 | ค้นหาสถานที่ + ไม่พบ | MEMBER | Edge | loc pane เปิด | 1. พิมพ์ "siam" 2. พิมพ์ "xyz" | filter สด: เหลือ "Siam Paragon" (contains, case-insensitive); "xyz" → "No matching places" (empty label) | ลิสต์หดตาม query | Low | |
| FO-TC-CRE-028 | price — auto comma → row "THB x" | MEMBER | Func | price pane เปิด | 1. พิมพ์ "420000" 2. พิมพ์ต่อ "12a3" 3. Done | input handler `unNum`+`fmtNum` → "420,000" ทันที ตัวอักษรถูกตัดเหลือตัวเลข (§4.2); แถว "Add price" แสดง `.val.set.price` = "**THB 420,000**" (เต็มจำนวน ไม่มีทศนิยม — §4.1) | มี hint "Type digits only — separators are added automatically…" | High | |
| FO-TC-CRE-029 | เว้นราคา = showcase | MEMBER | Func | step2 | 1. เปิด price pane ไม่พิมพ์อะไร Done 2. ดูแถว | `meta.price` ว่าง → row val ว่าง — hint ใน pane บอก "Leave empty for a showcase post (no price tag)"; publish จะได้ type showcase (เคสเชื่อม CRE-045) | ไม่มีค่าค้างบนแถว | Medium | |
| FO-TC-CRE-030 | spec pane anatomy | MEMBER | UI | spec pane เปิด | 1. เลื่อนดูทั้ง pane | กลุ่ม "Watch Specifications" **20 ช่อง** (Brand→Clasp Type ตาม `CF_SPECS`) + "Item Details" 2 ช่อง (Year, Service History) + "Description" textarea 4 แถว + note "Condition & Box are set in the Condition section — they appear here under Item Details." | title กลุ่มเป็นตัวแดง/uppercase | Low | |
| FO-TC-CRE-031 | spec กรอก → row สรุป + persist | MEMBER | Func | spec pane เปิด | 1. Brand="Rolex", Model="Submariner Date", Reference="126610LN" 2. Done | row "Watch details" val = "Rolex · Submariner Date" (brand·model เท่านั้น); เปิด pane ซ้ำค่ายังอยู่ครบ (`V.meta` persist) | val ตัดเหลือ brand · model ไม่ยาวเกิน | Medium | |
| FO-TC-CRE-032 | cond — เลือกล็อก / box ยกเลิกได้ | MEMBER | Func | cond pane เปิด | 1. แตะ "Very Good" 2. แตะ "Very Good" ซ้ำ 3. แตะ "Full set — box & papers" 4. แตะซ้ำอีกครั้ง | condition = เลือกเดี่ยว **กดซ้ำไม่ยกเลิก** (`meta.cond=v` ตลอด) → row แสดง "Very Good"; box&papers **กดซ้ำ toggle off** (`meta.box=""`) → วงกลมเลือกหาย | radio on ตรงตัวเลือกเดียวต่อกลุ่ม | Medium | |
| FO-TC-CRE-033 | เปลี่ยนใจข้ามตัวเลือก cond | MEMBER | Edge | cond pane เลือก "Very Good" | 1. แตะ "Good" 2. Done | `meta.cond` เขียนทับ → เหลือตัว on เดียว "Good"; row val เปลี่ยนเป็น "Good" | ไม่มีสองตัว on พร้อมกัน | Low | |

### 2.5 Panes — cost & more (`[OPEN-CODE-ONLY]`)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-CRE-034 | cost row เฉพาะ asset/drawer | MEMBER | UI | step2 post mode + step2 asset mode (เปรียบเทียบ) | 1. post mode step2: ดู rows 2. เปิด toggle "Also save to My Assets" 3. asset mode step2: ดู rows | post+toggle off → ไม่มีแถว Cost; toggle on (`V.asset`) → แถว "Cost details (private)" โผล่ระหว่าง Condition กับ More options; asset mode → มีเสมอ (`V.mode==="asset"`) | แถวโผล่/หายตามเงื่อนไขจริง | Medium | |
| FO-TC-CRE-035 | cost — purchase auto comma | MEMBER | Func | cost pane เปิด (asset mode) | 1. พิมพ์ "398000" 2. Done | `unNum`+`fmtNum` → "398,000"; row cost val = "**THB 398,000**" (price-only summary); placeholder "e.g. 398,000" | ตาม money rules §4.2 เหมือนช่องราคา | Medium | |
| FO-TC-CRE-036 | cost — row แสดงวันที่เมื่อไม่มีราคา | MEMBER | Func | cost pane เปิด | 1. เลือก Purchase date = วันนี้ 2. Done | กรอกแค่ `bought` → row val = วันที่ฟอร์แมต `pfoDate` (เช่น "27 Oct 2026"); ถ้ามี purchase ด้วย → แสดงราคาแทน (price ชนะ) | TH/EN ใช้ en-GB เดียวกัน | Low | |
| FO-TC-CRE-037 | bought อนาคต → error + Done ถูกบล็อก | MEMBER | Func | cost pane เปิด | 1. ใส่ Purchase date มากกว่าวันนี้ 2. แตะ "Done" | `rangeOverflow` → ช่อง `is-err` + `.pane-err` "Purchase date can't be in the future" (TH: "วันที่ซื้ออยู่ในอนาคตไม่ได้"); **Done ไม่ปิด pane** — re-trigger input วาด error + focus ช่อง; ← back ยังปิดได้ (ยกเลิกค่าเดิมที่พิมพ์ค้างไว้ใน meta แต่ pane ปิด) | error สีแดงใต้ช่อง date | High | |
| FO-TC-CRE-038 | bought ผิดรูปแบบ/ก่อน 1900 | MEMBER | Edge | cost pane เปิด | 1. console พิมพ์ปี "1800" หรือค่าเพี้ยน (ผ่าน devtools ตั้ง `valueAsDate`/`value`) | `badInput`/`rangeUnderflow` → "Invalid purchase date" (TH: "วันที่ซื้อไม่ถูกต้อง"); error เคลียร์เองเมื่อแก้เป็นค่าถูก (input handler รันสด) | is-err หายตอนค่าถูก | Low | |
| FO-TC-CRE-039 | cost privacy note | MEMBER | UI | cost pane เปิด | 1. อ่านท้าย pane | ข้อความ "Cost details are private — they feed portfolio value and gain/loss. Only you can see them." (TH แปลครบ) — สื่อว่าไม่ไปโชว์บนโพสต์ | label ธรรมดาไม่ใช่ฟิลด์ | Low | |
| FO-TC-CRE-040 | more — turn off commenting | MEMBER | Func | more pane เปิด | 1. เปิด "More options" 2. toggle "Turn off commenting" on 3. Done | `meta.noComments=true` (toggle `pane-sw` on) → หลัง publish `post.noComments` ไปด้วย (การ์ดจะแสดง state ปิดคอมเมนต์ — ผลบนการ์ดเช็คต่อ FEED scope) | toggle pill เปลี่ยนสี | Medium | |
| FO-TC-CRE-041 | more — audience radio | MEMBER | Func | more pane เปิด | 1. แตะ "Followers only" 2. Done 3. ดูแถว More options | `meta.audience="followers"` → แถว More options `.val.set` = "Followers only" (Everyone = ค่าเริ่มต้นไม่แสดง); sub "Only people who follow you" | radio on ตัวเดียว มี footnote "This doesn't affect your account privacy…" | Medium | |
| FO-TC-CRE-042 | more — ค่าคงอยู่ข้าม pane เปิดปิด | MEMBER | Edge | ตั้ง noComments+followers แล้ว Done | 1. เปิด more อีกครั้ง | state ใน `V.meta` persist — toggle/radio ยังตรงที่ตั้งไว้ | ไม่รีเซ็ตเมื่อเปิดซ้ำ | Low | |

### 2.6 Publish — Post Mode (`cf-share` → `insertNewPost`)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-CRE-043 | โพสต์มีราคา → type sale | MEMBER | Int | step2: รูป + caption + price 420,000 + cond Very Good | 1. แตะ "Share" | `insertNewPost`: `POSTS.unshift` type `"sale"`, `pfkind:"post"`, seller `king.mr.fox`, time "Just now", `following:true`; feed re-render + `scrollTop=0` → **การ์ดตัวเองบนสุด feed**; toast "Posted · shared to feed ✓" พร้อม thumb รูปแรก | การ์ดแสดง "THB 420,000" + chip "Very Good" + "Full set — box & papers" ถ้าเลือก | High | |
| FO-TC-CRE-044 | โพสต์ใหม่เป็น own post (เมนู ⋯) | OWNER | Func | เพิ่ง share เสร็จ (CRE-043) | 1. แตะ ⋯ บนการ์ดตัวเอง | `isOwnPost` (seller===king.mr.fox) → เมนู pm-own: Archive / Turn off commenting / **Edit** / Mark as sold / Pin / Delete — เข้า Edit ได้ (เชื่อม CRE-054) | เมนูต่างจากการ์ดคนอื่น | Medium | |
| FO-TC-CRE-045 | โพสต์ไม่มีราคา → showcase หลุดจาก search | MEMBER | Int | step2: รูป + caption เท่านั้น (ไม่ใส่ price) | 1. Share 2. เปิด search ค้นคำใน caption 3. ค้น "#tukdaeng" (ต้องใส่ tag ใน caption) | `type:"showcase"` + `price:null` → ขึ้น feed ปกติแต่ **ไม่อยู่ในผลค้นปกติ** (`salePosts()` ต้องมี price); tag mode (`q` ขึ้นต้น #) กรองแค่ muted → ยังเจอถ้า caption มี tag นั้น | การ์ดไม่มีป้ายราคา/Ask pill | High | |
| FO-TC-CRE-046 | specGroups ที่สร้าง → Tap for details | MEMBER | Int | โพสต์ที่สร้างจาก CRE-043 | 1. แตะ caption more → "Tap for details" หรือเปิด detail | `cfFieldsFromMeta`: specGroups แสดงครบทุกฟิลด์ตั้งแต่มี spec ใดฟิลด์หนึ่ง — ค่าว่าง render "**N/A**"; กลุ่ม "Price & Data Source" เพิ่มเอง: Asking "THB 420,000" · Estimated "THB 400,000 – 445,000" (−5%/+6% step 5k) · Last Price Update = วันนี้ · Source "TukDaeng Market Data" | ตาราง spec เหมือนโพสต์ seed | Medium | |
| FO-TC-CRE-047 | ราคาเขียน mock → ยืนยันหน่วยเงิน | MEMBER | UI | publish แล้วดูการ์ด+detail | 1. อ่านราคาบนการ์ด/แถว/detail | ทุกจุด "THB 420,000" เต็มจำนวน comma + ไม่มีทศนิยม + ไม่มี ฿ ปน (§4.1/ตัวเลือก B); Estimated range แสดงเต็มทั้งสองข้าง `THB a – THB b` | รูปแบบเดียวกันกับโพสต์ seed | Medium | |
| FO-TC-CRE-048 | `_waHits` toast เมื่อ match alert | MEMBER | Int | มี watch alert ON ที่ match spec โพสต์นี้ (SETUP-10 — สร้างผ่าน search bell ก่อน) | 1. สร้างโพสต์ที่ spec match 2. Share | `insertNewPost` คำนวณ `_waHits` จาก `WATCH_ALERTS` on → toast แรก "Posted · shared to feed ✓" ตามด้วย toast ที่สอง **"Watch alert matched: {name}"** (+N more ถ้าหลายตัว) หลัง ~2.1s | toast สองจังหวะต่อเนื่อง | Medium | |

### 2.7 "Also save to My Assets" + Asset Mode (`visibility`)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-CRE-049 | toggle "Also save to My Assets" on | MEMBER | Func | step2 post mode | 1. เปิด toggle (`.sw`) 2. ดู step2 ใหม่ | `V.asset=true` → step2 re-render: แถว "Cost details (private)" โผล่; toggle sub = "Keep this item in your profile collection — full specs live in \"Add Asset\"." | toggle on สีเปลี่ยน | Medium | |
| FO-TC-CRE-050 | post+drawer on → publish → pfkind sale | OWNER | Int | step2 post mode, toggle on, price+brand ใส่ | 1. Share 2. เปิด own profile แท็บ Sale | `POSTS[0].pfkind="sale"` + `assetId` ลิงก์ `cfToPortfolio` (PF_ASSETS ใหม่ status sale) → toast "**Posted · shared to feed + My Assets ✓**"; โพสต์โผล่ profile Sale tab + portfolio มี asset แถวใหม่ (cost ไปด้วยถ้ากรอก) | toast ข้อความต่างจาก post ธรรมดา | High | |
| FO-TC-CRE-051 | asset mode anatomy | OWNER | UI | asset composer step2 | 1. ดู head/caption/rows/ส่วนล่าง | title "Add Asset"; caption placeholder "Describe this asset…"; rows มี Cost; ส่วน "**Visibility**": 3 radio — Show(**default on**) / Hide / Post to feed พร้อม sub อธิบายแต่ละอัน; ปุ่มล่าง "Add Asset" (ไม่ใช่ Share); ไม่มี toggle "Also save to My Assets" | default = Show เลือกไว้ | High | |
| FO-TC-CRE-052 | asset vis=Show → drawer only | OWNER | Int | asset step2 รูป+specs, Visibility=Show | 1. แตะ "Add Asset" 2. ดู feed + profile แท็บ Show | `PF_MINE.unshift` (pfkind "show") + `PF_ASSETS` status "show" + `assetId` ลิงก์ → toast "**Saved to My Assets · shown on profile ✓**"; `openSub` swap ไป own profile — ของใหม่อยู่บนกริด/แท็บ Show; **ไม่เข้า POSTS → ไม่ขึ้น feed/search** | อยู่เฉพาะ profile | High | |
| FO-TC-CRE-053 | asset vis=Hide / vis=Post to feed | OWNER | Int | asset step2 ทำ 2 รอบ | 1. เลือก Hide → Add Asset 2. สร้างใหม่ เลือก Post to feed → Add Asset | Hide → `PF_MINE` pfkind "hide" + asset status "hide" + toast "**Saved to My Assets · private ✓**" + อยู่แท็บ Hide เท่านั้น; Post to feed → `insertNewPost` แล้ว `pfkind="sale"` + `assetId` ลิงก์ drawer → toast "**Saved to My Assets · posted to feed ✓**" + ขึ้น feed (เหมือนโพสต์ขาย) + `_waHits` ได้เหมือน post mode | toast 3 แบบต่างกันตาม vis | High | |

### 2.8 Edit Info (`V.editPid` — FEED-024)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-CRE-054 | เข้า Edit info — prefilled | OWNER | Func | own post บน feed (จาก CRE-043) → ⋯ → "Edit" | 1. แตะ "Edit" | `openPostEdit`: `V.editPid` set, step=2 ตรง — head "Cancel" + "**Edit info**" + "Done"; thumbs = รูปโพสต์เดิม; caption เติม; meta จาก `metaFromPost` (price/spec/cond/box/loc/audience/noComments) + cost จาก asset ลิงก์ถ้ามี; toggle/stt สะท้อน drawer/pfkind | ไม่มีขั้น picker — เข้า step2 เลย | High | |
| FO-TC-CRE-055 | Edit Cancel → discard → โพสต์เดิม | OWNER | Func | Edit info เปิด + แก้ caption | 1. แตะ "Cancel" 2. "Discard" | dialog: EN "If you go back now, your edits will be discarded." + "Discard"/"Cancel" (TH: "ทิ้งการแก้ไข?" / "ทิ้งการแก้ไข" / "แก้ไขต่อ"); Discard → `closePostEdit` (`_cp=null`) โพสต์ไม่เปลี่ยน | กลับ surface เดิม | High | |
| FO-TC-CRE-056 | ig-add → add-media picker | OWNER | Func | Edit info เปิด | 1. แตะ thumb "+" ท้าย strip 2. เลือกรูปเพิ่ม 3. "Done" 4. เปิดอีก เลือกแล้วกด ← | `ig-add` (โผล่เมื่อ `n<10`) → step1 head "Add photos or clips" + ←/Done + grid selmode (ไม่มีปุ่ม Select) — เลือกเพิ่มต่อท้าย `order`; "Done" เก็บเพิ่มกลับ step2; ← (`cf-add-cancel`) **คืน `_orderSnap`** — รูปที่เพิ่งเลือกหาย เหลือชุดเดิม | picker title/ปุ่มต่างจากโหมด create | High | |
| FO-TC-CRE-057 | ลบรูปจนเหลือ 1 → toast | OWNER | Edge | Edit info มี 2 รูป | 1. × thumb จนเหลือใบเดียว 2. × อีกครั้ง | `V.editPid && order.length<=1` → toast "**Post needs at least 1 photo or clip**" — ลบใบสุดท้ายไม่ได้ (ต่างจาก create ที่เด้งกลับ picker) | strip คง 1 ใบ | Medium | |
| FO-TC-CRE-058 | Done → apply + toast + surface | OWNER | Func | Edit info เปิดจาก feed card | 1. แก้ caption + เปลี่ยนราคา 2. "Done" | `applyPostEdit`: อัปเดต photos/caption/price/type/chips/specGroups/loc/audience/noComments; `refreshPostViews` re-render การ์ด; toast "**Post updated**" + thumb; ปิด composer กลับ surface เดิม | การ์ดใช้ค่าใหม่ทันที | High | |
| FO-TC-CRE-059 | Edit จาก detail → กลับ detail | OWNER | Int | own post detail เปิด → ⋯ → Edit | 1. "Done" 2. (ทำซ้ำกับ "Cancel"→Discard) | `editFromDetail` → ปิด `detail-open` ระหว่างแก้; Done → `openPostDetail` เปิด detail ใหม่ด้วยเนื้อหาสด; Cancel/Discard → `detail-open` กลับมาเหมือนเดิม (pv path: เปิดจาก Posts viewer → composer เลื่อนทับ viewer, Done แล้ว viewer ยังอยู่ใต้) | surface restore ถูกชั้น | Medium | |
| FO-TC-CRE-060 | toggle drawer off → detach | OWNER | Int | Edit info โพสต์ที่มี assetId (จาก CRE-050) | 1. ปิด toggle "Also save to My Assets" 2. Done | `V.asset=false` + `post.assetId` → แถว `PF_ASSETS` ถูก splice + `assetId=null` + `pfkind="post"` → หลุด profile Sale tab/Portfolio เหลือแค่ feed (ทั้งหมด) | toggle off ปุ่มไม่ disabled | High | |
| FO-TC-CRE-061 | stt switch ขาย↔โชว์ | OWNER | Int | Edit info โพสต์ drawer-on (แสดงส่วน Profile status) | 1. เลือก "Show" 2. Done 3. ดู feed + profile | `V.pfkind` → `post.pfkind="show"` + `pa.status` sync → **โพสต์หลุดจาก feed** (feed แสดงเฉพาะ sale/post) ไปอยู่แท็บ Show ของ profile (กลับ "Sale" ได้ด้วย stt เดิม); ส่วนนี้โผล่เฉพาะตอน toggle drawer on (`V.editPid && V.asset`) | radio 3 ตัว Sale/Show/Hide | Medium | |
| FO-TC-CRE-062 | โพสต์ sold ไม่มี Edit | OWNER | Edge | own profile แท็บ Sold → tile → ⋯ | 1. ดูเมนู pm-own ของโพสต์ sold | `isSold` → เมนูมี "View sale record" **แทน "Edit"** — เส้นทาง UI ไป `editSold` (toggle locked ON "This item lives in your Sold history") เข้าไม่ได้ผ่านเมนู → state นี้เป็น dead-branch สำหรับ sold (บันทึก quirk) | ไม่มีแถว Edit ในเมนู sold | Low | |

### 2.9 Clip Preview `[OPEN-CODE-ONLY]`

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-CRE-063 | lone clip → step2 clip UI | MEMBER | Func | picker เลือก cell คลิปเพียง 1 ใบ → Next | 1. ดู step2 | `cfActiveClip` (order=1 + มี dur) → thumb แบบคลิป (dur badge) + `.ig-zoom.is-clip` พร้อม pp-btn/dur/prog ฝังอยู่แล้ว (ไม่ต้อง render แบบ photo) | badge dur บน thumb | Medium | |
| FO-TC-CRE-064 | clip zoom — play/pause/countdown | MEMBER | Func | lone clip step2 | 1. แตะ thumb → zoom เปิด 2. แตะตรงกลาง (clip) | เปิดด้วย state pause (ปุ่ม ▶); แตะ → `cfClipToggle`: เล่น — ปุ่มเป็น ⏸, dur นับถอยหลังทุก 0.1s (`rem`), progress bar เดิน; แตะอีกครั้ง → pause ค้างเวลา; เล่นจนจบ → `cfClipStop` กลับ pause+reset | countdown ฟอร์แมต m:ss | Medium | |
| FO-TC-CRE-065 | mixed draft คลิปใน zoom | MEMBER | Edge | step2 มีรูป+คลิปปน (≥2) | 1. แตะ thumb คลิป → zoom 2. swipe ไปรูปอื่นกลับมา | `cfZoomGo` สลับ photo↔clip mode ตาม item — มาถึง item คลิป → is-clip (pp+dur+prog) แตะเล่นได้; ไป item รูป → กลับ viewer ธรรมดา (ถ้าเคยเล่นคลิปค้าง state แยก `viewClip`) | ปุ่ม play โผล่เฉพาะ slide คลิป | Low | |
| FO-TC-CRE-066 | share clip → feed | MEMBER | Int | lone clip step2 | 1. Share | `insertNewPost` รับ `clip`/`clips` → toast "**Clip shared to feed ✓**" (ข้อความเฉพาะคลิป); การ์ดบน feed เป็น clip post (autoplay mechanics ตาม FEED-023 — ผลละเอียดอยู่ FO-TEST-03) | toast ต่างจาก photo post | Medium | |

### 2.10 Discard / Draft / Handoff — Edge

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-CRE-067 | meta-only draft → ✕ เงียบ + draft ค้าง | MEMBER | Edge | step2: ลบ media จนเด้งกลับ step1 (order ว่าง) แต่เคยกรอก price/spec ไว้ | 1. แตะ ✕ (ไม่มี dialog เพราะ order+caption ว่าง) 2. แตะ + เปิดใหม่ → Next | `_cp` ยังอยู่ → `cpState` คืน draft เดิม — เปิดใหม่เจอ picker แต่ Next เข้า step2 แล้ว **meta ยังเต็ม** (price/spec/cond ค้างใน rows); warning ไม่เด้งเพราะเช็คแค่ order/caption — quirk: meta-only draft ปิดเงียบแต่ไม่หาย | ค่าเก่าค้างข้ามครั้งเปิดปิด | Medium | |
| FO-TC-CRE-068 | draft reset ด้วย replay/reload | MEMBER | Edge | มี draft ค้าง (CRE-067) | 1. กดปุ่มลอย "1st" หรือ F5 2. เดินจนถึง feed → แตะ + | `scr._cp` อยู่ใน memory ของ screen element — render ใหม่/reload → draft หาย เปิด picker ว่าง | state memory เท่านั้น | Low | |
| FO-TC-CRE-069 | `fo_newpost` handoff (dev-assisted) | MEMBER | Edge | console | 1. console: `localStorage.setItem("fo_newpost", JSON.stringify({photos:["./assets/asset-uploads/feed-tudor-bb.jpg"], caption:"handoff", meta:{}}))` 2. F5 3. เดินจนถึง feed | boot handler อ่าน+ลบ key → `insertNewPost` → toast "Posted · shared to feed ✓" (+ waHits ถ้า match) — ช่องทางรับโพสต์จาก create-post.html standalone | โพสต์ขึ้นหัว feed | Low | |

### 2.11 Guest / i18n / Theme / Money — Spot-check

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-CRE-070 | TH labels sweep ทั้ง composer | MEMBER | UI | lang=TH | 1. ไล่ picker → step2 → ทุก pane → vis/stt → dialogs | แปลครบ: "สร้างโพสต์ใหม่"/"เพิ่มสินทรัพย์ใหม่" · "ถัดไป" · "เลือกหลายรายการ" · "เพิ่มตำแหน่งที่อยู่" · "ระบุราคา" · "รายละเอียดนาฬิกา" · "สภาพสินค้า" · "ข้อมูลต้นทุน (ส่วนตัว)" · "ตัวเลือกเพิ่มเติม" · "แชร์" · panes ทุก title/label/error · "โชว์/ซ่อน/โพสต์ลงฟีด" · "ขาย/โชว์/ซ่อน" · "ยกเลิก/เสร็จสิ้น" · "แก้ไขข้อมูล" · dialog TH — toasts ส่วนใหญ่คง EN (quirk เช่น "Post updated", "Not in this prototype yet") | label ไม่ล้น/ไม่ผิดเพศ | Medium | |
| FO-TC-CRE-071 | guest ไม่มีเส้นทางเข้า composer | GUEST | Func | guest | 1. แตะ + บน header → sheet เด้ง ปิด 2. ลองไป profile (nav) | `[data-flow]` + `[data-navgo="profile"]` ทั้งคู่อยู่ใน gate → guest เปิด composer ไม่ได้ทุก entry; หลังปิด sheet ยืนยันอยู่ feed เดิม (composer ไม่เปิดแม้แต่ picker) | ไม่มี composer ใด ๆ โผล่ | High | |
| FO-TC-CRE-072 | dark theme | MEMBER | UI | theme=dark | 1. ไล่ picker/step2/panes/zoom/dialogs | surface `.cf` ดำ, radio/sel states อ่านได้, pane inputs contrast ปกติ, zoom backdrop เข้ม, dialog อ่านได้ | ไม่มี text จมพื้น | Low | |
| FO-TC-CRE-073 | money sweep ทุกจุดแสดงเงิน | MEMBER | UI | เคส price/cost/publish ทำแล้ว | 1. เช็ค row price/cost + detail Estimated + placeholder | row = "THB 420,000"/"THB 398,000" เต็มจำนวน; placeholder มี comma ("e.g. 420,000"); Estimated "THB 400,000 – 445,000" (ข้างละค่าเต็ม+ขีด); ไม่มีทศนิยม/฿ ปน — อ้าง money-display-rules §4.1–4.2 + §11 | สม่ำเสมอทุกจุด | Medium | |

## 3. หมายเหตุ / ข้อจำกัดที่ต้องรีวิว

1. **`.ig-share.off` แทบเข้าถึงไม่ได้** — บน step 2 `order` ว่างเมื่อไรก็เด้งกลับ step 1 อัตโนมัติ (rm-mini handler) ปุ่ม Share จึงไม่เคย render disabled จริงบน create flow; คงไว้เป็น dead state (คล้าย `cf-next.off` ที่ใช้ได้จริงแค่ step 1)
2. **hero preview ไม่เสถียร** — cell-tap อัปเดต hero เป็น `order.at(-1)` (ใบล่าสุด) แต่ `cfPickerHTML` re-render เต็มใช้ `order[0]` → ตำแหน่ง hero เปลี่ยนตามทางที่มา (CRE-024 บันทึกเป็น quirk)
3. **control ตาย 3 จุด + 1 จุดเงียบ** — "Recents ⌄", camera cell, hero expand → toast "Not in this prototype yet" (`[DEAD]`); hero `.clip-play` แตะแล้ว **ไม่มี handler เลย** (ไม่แม้แต่ toast) — ควรตัดสินว่าเป็นของจริงหรือ oversight (mark `[OPEN]`)
4. **discard dialog เช็คเฉพาะ order+caption** — meta (price/spec/loc/…) อย่างเดียวไม่ทริกเกอร์ warning และ draft ค้างใน `scr._cp` ข้ามการเปิดปิดจนกว่าจะ Share/Discard/reload (CRE-067) — ถ้า PO ตั้งใจให้ meta ก็นับเป็น dirty ให้ mark gap
5. **sold post เข้า Edit info ไม่ได้ผ่าน UI** — เมนูของโพสต์ sold แสดง "View sale record" แทน "Edit" → branch `editSold` (drawer toggle locked "This item lives in your Sold history") เป็น dead code ผ่านทางเมนูปกติ (CRE-062)
6. **condition เลือกแล้วยกเลิกไม่ได้** แต่ box&papers กดซ้ำ toggle off ได้ — สองกลุ่มใน pane เดียวกันพฤติกรรมต่างกัน (CRE-032)
7. **cost Done ถูกบล็อกเฉพาะ date invalid** — ฟิลด์อื่นไม่มี validation (price ไม่บังคับ, spec ไม่บังคับ, caption ไม่บังคับ) — composer โดยรวม = "validation เบา" ตามโค้ด ไม่ใช่ gap ของเคส
8. **asset mode × post mode ต่างกัน 3 จุด** — title/placeholder caption/ปุ่มล่าง + แถว Cost + Visibility แทน toggle — เคส CRE-051 ล็อก anatomy ไว้; post edit ใช้ post mode เสมอ (`V.mode="post"` ใน openPostEdit) แม้โพสต์จะผูก asset
9. **`fo_newpost` handoff** เป็นเส้นทางรับโพสต์จาก `create-post.html` ไฟล์แยก (อ่านครั้งเดียวตอน boot แล้วลบ key) — CRE-069 dev-assisted; การทดสอบฝั่งไฟล์ `create-post.html` เองอยู่นอก scope task นี้
10. **feed/search มองไม่เห็น drawer-only** — `PF_MINE` (Show/Hide) ไม่เข้า `POSTS` เลย ไม่หลุดไป feed/search/explore โดยดีไซน์ — เคส CRE-052/053 ยืนยันขอบนี้
11. traceability: rows ที่ defer ออก — ผลละเอียดการ์ด/viewer/detail → FO-TEST-03/06, wa sheet internals + walerts → FO-TEST-11, portfolio drawer record → FO-TEST-13, Member Sheet → FO-TEST-01/17, guest matrix เต็ม → FO-TEST-17
