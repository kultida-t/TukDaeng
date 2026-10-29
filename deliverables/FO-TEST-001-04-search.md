# FO-TEST-04 — Test Cases: Search & Filter (สำหรับเทสแอปจริงบนมือถือ)

> Task: FO-TEST-04 ของชุด FO-TEST-001 · รอบแรกเวอร์ชัน prototype: 2026-10-27 · ปรับเป็นเวอร์ชันเทสแอปจริง: 2026-11-26
> กติกาหลัก: `deliverables/FO-TEST-001-testcase-prompt.md` · Task breakdown: `deliverables/FO-TEST-001-task-breakdown.md`
> แหล่งออกแบบเคส: `Prototypes/fo-flow/index.html` (ใช้เป็นแม่แบบแตกเคส/expected เท่านั้น — ทุกเคสเขียนให้ทำบนแอปจริงได้; prototype ถูกอัปเดตให้ตรง spec ที่ล็อกรอบนี้แล้ว ดู §3)
> สัญญาความครอบคลุม: `deliverables/FO-TEST-001-00-inventory.md` §2.3 — ไม่เดา behavior เพิ่ม · TC ID เดิมคงไว้ครบทุกตัวเพื่อ traceability

## 0. สภาพแวดล้อมเทส + วิธีใช้เอกสาร

- **อุปกรณ์:** โทรศัพท์มือถือเครื่องจริง ติดตั้งแอป TukDaeng build ทดสอบจาก Google Play (Android) / App Store หรือ TestFlight (iOS) ตามที่ทีมแจก — ห้ามเทสผ่าน browser/prototype
- รีเซ็ตสถานะแอปด้วย **การลบแอปแล้วติดตั้งใหม่** หรือ Clear app data (Android: ตั้งค่าระบบ → Apps → TukDaeng → Storage → Clear data) — ใช้เมื่อเคสต้องการ first-run state
- **Actor**: `GUEST` = ยังไม่ล็อกอิน (เดิน onboarding แล้วกด Skip for now หรือ logout) · `MEMBER` = ล็อกอินบัญชีทดสอบที่ทีมมอบหมาย · `NEW` = สมัครบัญชีใหม่ผ่าน flow จริง (OTP จริง — SETUP-06)
- **ข้อมูลทดสอบที่ต้องเตรียมก่อนเริ่ม (SETUP-06/08):** บัญชีทดสอบ (email+password), อีเมลที่รับ OTP จริง, บัญชี seller ตัวอย่าง, และ **ชุดข้อมูลค้นหา** — sale listings หลายแบรนด์/รุ่น/ช่วงราคา + โพสต์ showcase ที่มี hashtag; ถ้าข้อมูลบน test env ไม่ครบ ให้สร้างจากบัญชีที่สองผ่าน composer หรือขอ test data จากทีม; ทำไม่ได้จริง ๆ → **mark BLOCK พร้อมเหตุผล**
- **บทบาทข้อมูลอ้างอิง (SETUP-08):** ก่อนเริ่มให้ค้น/เลื่อนดูข้อมูลจริงแล้วบันทึกตัวอย่างลง Note — ทุกเคสอ้างชุดนี้แทนข้อมูล mock เดิม:
  - `SA` = seller ที่มี sale listing ≥1 ใบ และ member ยังไม่ follow · `SB` = seller ที่ member follow อยู่แล้ว
  - `BX` = แบรนด์ที่มี sale listing ≥2 ใบ (รุ่นต่างกัน) · `BY` = แบรนด์อื่นที่มี listing ≥1 ใบ
  - `LL` = sale listing ที่ spec Strap เป็นกลุ่มหนัง (เช่น "Alligator leather") · `LZ` = โพสต์ showcase (ไม่มีราคา) ที่ caption มี hashtag `HZ`
  - `HZ` = hashtag ที่โผล่บนโพสต์ ≥2 ใบ · `KW-SELL` = keyword ที่ตรงชื่อ seller ≥1 ราย · `KW-NONE` = คำที่ไม่ match อะไรเลย (เช่น "zzzzz")
- **ท่าทางบนจอ (ทำบนเครื่องจริงเท่านั้น):** เลื่อน = ปัดนิ้ว · พิมพ์ = คีย์บอร์ดจริงบนเครื่อง · แตะ/แตะค้าง/swipe = นิ้วจริง · Enter = ปุ่ม search/enter บนคีย์บอร์ด
- **status bar** ด้านบนจอ = ของเครื่องจริง (เวลา/สัญญาณ/แบตจริง — ไม่ตรึงค่า)
- **สลับธีม/ภาษา** = ผ่าน Settings ในแอป (SETUP-07) หรือธีมระบบของเครื่อง (ถ้าแอปตั้งตามระบบ)
- **ตัวเลขเวลา/จำนวน/ขีดจำกัด** (recents cap 8 / preview 4 แถว / suggest ≤6 kw rows / เพดานราคา 2,000,000 / "Apply (n)" = จำนวนค่าที่เลือก) — ตัวเลขที่มี ~ คือพฤติกรรมโดยประมาณ (contract = พฤติกรรมนั้นเกิด เช่น toast หายเอง); ตัวเลขเป๊ะ (lockout 15 นาที, cap, เพดาน) ต้องตรง design — ต่าง = FAIL
- **ข้อความ EN ในคอลัมน์ expected** เป็นค่าอ้างอิงจาก design — wording ต่างจาก spec = FAIL (ข้อความ UI ที่ spec ระบุเป็นค่าล็อก)
- **คอลัมน์ "ทดสอบบน (Device/OS)"** ใน checklist(เช่น `iPhone 15 · iOS 18`, `Galaxy S24 · Android 15`)
- **Type**: UI = การแสดงผล · Func = การทำงาน · Int = เชื่อมข้าม module · Edge = negative/boundary
- **Priority**: High = core flow/กติการะบบ · Medium = feature หลัก · Low = edge/cosmetic
- **[GATE]**: action ที่ guest แตะแล้วเด้ง Member Sheet "Join TukDaeng" — ใน scope นี้สิ่งที่ถูก gate คือ **กระดิ่ง Watch Alert บนหัวผลค้นหา** และ **ปุ่ม Follow บน seller card**; ทุกเคส [GATE] มีคู่ guest/member ครบ (mechanics ของ sheet อยู่ FO-TEST-01 AUTH-061–068, เมทริกซ์ทั้งแอป FO-TEST-17)
- **เรื่องเงิน** อ้าง `docs/money-display-rules.md`: ช่องราคา filter ใส่ comma ให้อัตโนมัติ (§4.2); chip ราคาแสดงเต็มจำนวน `THB x–y` (§4.1); badge views เช่น `1.2K` คือตัวนับ **ไม่ใช่เงิน**
- **Variant dev harness / ช่องทาง dev ใด ๆ** (console flag, mock toggle) = out of scope — error state เทสด้วยการตัดเน็ตจริงเท่านั้น (SETUP-09)
- **กติกาที่ล็อกแล้วสำหรับ module นี้ (ใช้เป็น FAIL criteria ได้เลย — ล็อกร่วมกับ PO รอบเดียวกับ 03R):**
  - **ไม่มี sort control ใน V1** — หน้าผลค้นหาต้องไม่มี UI เรียงลำดับใด ๆ (เจอ = FAIL); ผลเรียง default = **newest first** (โพสต์ล่าสุดขึ้นก่อน)
  - **เปิด search ใหม่ = เจอ landing เสมอ** — ออกไป feed แล้วกลับมาเจอหน้า landing ที่ล้าง state (ไม่เจอผลค้น/filter/tab เดิม); แต่ **recents = ข้อมูล user persist ข้ามการปิดเปิดแอป** (เก็บจนลบเอง/Clear all)
  - **label หน้า search แปลตามภาษาแอปครบ** — lang=TH ต้องไม่เหลือ label EN (เหลือ = FAIL)
  - **error → retry เทสด้วยตัดเน็ตจริง** (airplane mode) — ไม่มีช่องทาง dev trigger
  - **Strap/Delivery = structured matching** — เลือกค่า filter ต้องเจอ listing ที่ spec เป็นตระกูลเดียวกัน (เช่น "Leather" เจอ "Alligator leather"); chip (0) → 0 ผล
  - **tag mode (q ขึ้นต้น #) รวมโพสต์ที่ไม่มีราคา แต่ยังกรอง ni/muted/blocked เหมือนผลค้นปกติ**
  - **Accounts row (For you) แตะแล้วค้นใหม่ด้วยชื่อ seller** ไม่ใช่เปิด profile; การ์ดใน tab Profiles → public profile
  - **brand → model dependency** — เลือก brand แล้วกลุ่ม Model เหลือเฉพาะรุ่นของ brand นั้น; เอา brand ออก → model ที่เลือกค้างถูกลบออกเอง
  - **back จาก filter โดยไม่ Apply = ทิ้ง draft** — ไม่มีอะไร apply; เปิดใหม่เริ่มจาก filter ที่ apply ล่าสุด
  - (สืบทอดจาก FO-TEST-02R/03R) Android device back ถอยหน้าภายในแอปเทียบเท่า in-app back — ห้ามออกจากแอปตอนอยู่หน้าลึก
- **สิ่งที่อยู่นอก scope** (เคสอยู่ task อื่น — ห้ามซ้ำ): header/burger/back ของ shell (FO-TEST-02), viewer/detail internals ทุก mode (FO-TEST-06 — ที่นี่เช็คเฉพาะ "entry จาก tile" + ปุ่มกลับ), wa sheet internals/save/list (FO-TEST-11 — ที่นี่เช็คเฉพาะ entry + state กระดิ่ง), saved page internals (FO-TEST-14), report/block flows (FO-TEST-16 — ใช้เป็น precondition เท่านั้น), Member Sheet mechanics (FO-TEST-01/17), language/theme sweep เต็ม (FO-TEST-19)

## 1. Coverage Map ของ task นี้ (เทียบ inventory §2.3)

| Route/Feature (inventory §2.3) | TC ID ที่ครอบ |
|---|---|
| `search` — landing (explore grid + popular chips + filter + bookmark) | SRCH-001 – 005 |
| `search` — typing (suggest kw+seller / recents preview) | SRCH-006 – 011 |
| `recents` page `[OPEN-CODE-ONLY]` → **ล็อกแล้ว: เป็นหน้าจริง** | SRCH-012 – 016 |
| `search` — results (tabs/chips/grid/sellers/empty/err→retry) | SRCH-017 – 032 |
| `sfilter` page (กลุ่ม chip + price + counts + Clear/Apply) | SRCH-033 – 043 |
| `sfilter` validation (min>max, max>เพดาน) | SRCH-044 – 047 |
| `sr-wa` bell → Watch Alert `[GATE]` | SRCH-051 – 054 |
| state `S.sort` (ไม่มี UI) `[OPEN-NO-CODE]` → **ล็อกแล้ว: V1 ไม่มี sort + default newest first** | SRCH-031 |
| tile → Post Viewer | SRCH-055 – 057 |
| guest coverage รวมของหน้า search | SRCH-058 – 059 |
| Language / theme / money spot-check | SRCH-060 – 062 |

## 2. Test Cases

### 2.1 Search Entry & Landing

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-SRCH-001 | เปิดหน้า search + anatomy | MEMBER | UI | member อยู่ feed | 1. แตะไอคอนแว่นขยายมุมขวาบนของ header | หน้า search เลื่อนทับ feed (entry ไม่อยู่ใน gate — guest ใช้ได้เหมือนกัน) | head: ← + ช่อง "Search" (fake) + ไอคอน bookmark; chip row: ไอคอน filter (sliders) + chip "For you"(เริ่มต้น on) + popular keyword chips; ด้านล่าง explore grid รูปจัตุรัส | High | |
| FO-TC-SRCH-002 | explore grid content | MEMBER | UI | หน้า search landing เปิดอยู่ | 1. เลื่อนดู grid ด้วยนิ้วจนสุด | grid = **ทุกรูปของทุกโพสต์** ที่มองเห็นได้ (ไม่ใช่ทีละโพสต์ — โพสต์หลายรูปได้หลาย tile); ไม่มี tile ว่าง/รูปเสีย/โหลดค้าง | badge 👁+views โผล่บน tile บางตัวตาม design (ตำแหน่ง/จำนวน = ค่าอ้างอิง); รูปเรียงจัตุรัส 3 คอลัมน์ | Medium | |
| FO-TC-SRCH-003 | popular chip → results | MEMBER | Func | อยู่ landing | 1. แตะ chip keyword (เช่นชื่อ `BX`) 2. back กลับ landing 3. แตะ chip "For you" | chip keyword → results q=keyword + **ถูก push เข้า recents**; "For you" → q ว่าง → results แสดง sale posts ทั้งหมดที่มองเห็น และ**ไม่**ถูก push เข้า recents | results เด้งทันทีจาก chip; q บนช่องตรง keyword ที่แตะ | High | |
| FO-TC-SRCH-004 | bookmark shortcut | MEMBER + GUEST | Func | อยู่ landing | 1. member แตะไอคอน bookmark บน head → back 2. guest ทำซ้ำ | หน้า Saved เด้งทับ search — member เห็น Saved hub, **guest เปิดได้ฟรีแต่เห็น "No saved posts yet"** (ไม่ gate ที่ entry); back กลับ search landing ไม่ใช่ feed | stack ซ้อน — back จาก saved กลับ search | Medium | |
| FO-TC-SRCH-005 | ออกจากหน้า search | MEMBER | Func | อยู่ landing | 1. แตะ ← บน head | search ปิดกลับ feed ตำแหน่ง scroll เดิม (Android: device back เทียบเท่า — กติกาล็อก) | feed โผล่ตำแหน่งเดิม | Medium | |

### 2.2 Typing Mode & Suggestions

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-SRCH-006 | เข้า typing mode + Recent block | MEMBER | Func | อยู่ landing (recents ตามจริง) | 1. แตะช่อง "Search" (fake) | โหมด typing: input จริง focus + คีย์บอร์ดเด้ง + ปุ่ม "Cancel"; body เปลี่ยนจาก grid เป็น **Recent block** (q ว่าง): หัว "Recent" + preview ≤4 แถวแรก + "See all" **เฉพาะเมื่อ recents >4**; ถ้ายังไม่เคยค้น → "No recent searches" ไม่มี See all — seller row มี avatar+sub, kw row มีไอคอนนาฬิกา + ปุ่ม × ทุกแถว | ไม่มี explore grid ตอน typing | High | |
| FO-TC-SRCH-007 | suggest kw พร้อม counts | MEMBER | Func | typing mode, q ว่าง; เลือก `BX` แล้ว | 1. พิมพ์ชื่อ `BX` (หรือส่วนหนึ่งของชื่อ) | suggest สดทุก keystroke: kw rows = brand + model ที่ชื่อ match เรียงตาม design (**≤6 แถว** — design ref); sub "N listings" ต้องตรงจำนวน sale listing จริงของแบรนด์/รุ่นนั้น (เทียบกับตัวเลข (n) บนหน้า filter); ตามด้วย seller rows ถ้าชื่อ seller match | ไอคอนแว่นขยายนำแถว + sub "N listings" | High | |
| FO-TC-SRCH-008 | suggest seller rows | MEMBER | Func | typing mode; พิมพ์ `KW-SELL` หรือชื่อ `SA` | 1. ลบช่องแล้วพิมพ์ชื่อ seller จริง | แถว seller โผล่: avatar + ชื่อ + sub = "Following" ถ้า follow อยู่ ไม่งั้น "N listings" ตามจำนวน sale listing จริงของ seller นั้น | avatar + ชื่อ + sub | Medium | |
| FO-TC-SRCH-009 | suggest ref rows + ไม่มีผล | MEMBER | Edge | typing mode | 1. พิมพ์ ref fragment ของ listing จริง (เช่นตัวเลขรุ่น 3–4 หลัก) 2. ลบแล้วพิมพ์ `KW-NONE` | ref fragment → kw rows เลขรุ่นที่ match (ref ไม่มี sub); `KW-NONE` → "No suggestions" (empty state กลางจอ) | ref row = ไอคอน+ตัวเลขล้วน | Medium | |
| FO-TC-SRCH-010 | ปุ่ม × ล้าง query | MEMBER | Func | typing mode, มี q | 1. พิมพ์อะไรก็ได้ 2. แตะปุ่ม × ในช่อง | q ถูกล้าง → body กลับ Recent block; ปุ่ม × แสดงเฉพาะตอนมีตัวอักษร | ช่องว่าง + recents กลับมา | Medium | |
| FO-TC-SRCH-011 | Cancel + Enter | MEMBER | Func | typing mode มี q | 1. แตะ "Cancel" → landing 2. เปิด typing ใหม่ พิมพ์ keyword เดิมกด Enter (ปุ่ม search บนคีย์บอร์ด) | Cancel → mode landing (grid กลับ); Enter → results + query ถูก push เข้า recents — คำที่มีอยู่แล้วขยับขึ้นหัว **ไม่สร้างแถวซ้ำ** (dedupe) | landing กลับมาเหมือนเดิม; recents ไม่มีแถวซ้ำ | High | |

### 2.3 Recent Searches (ล็อก: เป็นหน้าจริง — กด See all แล้วเด้งเต็มจอ)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-SRCH-012 | recents page | MEMBER | UI | typing mode, recents >4 (SETUP-10) | 1. แตะ "See all" ข้างหัว "Recent" | หน้า "Recent searches" เด้งเต็มจอ: head ← + title + "Clear all" + ลิสต์เต็ม เรียงใหม่สุดบน | เห็นครบทุกแถวรวมแถวที่ preview ไม่แสดง | High | |
| FO-TC-SRCH-013 | ลบ recents รายแถว | MEMBER | Func | recents page เปิด | 1. แตะ × แถวแรก 2. back ไป typing ลบอีกแถวจาก preview | แถวนั้นหายทันที ไม่มี confirm; ลบได้ทั้งบนหน้า recents และ preview ใน typing (ลิสต์เดียวกัน index ตรงกัน) | แถวหายทันที | Medium | |
| FO-TC-SRCH-014 | Clear all | MEMBER | Func | recents page เปิด | 1. แตะ "Clear all" 2. back กลับหน้า typing | recents ล้างหมด → หน้า recents แสดง "No recent searches"; กลับ typing (q ว่าง) → Recent block = "No recent searches" และไม่มี "See all" | empty state ทั้งสองจุด | Medium | |
| FO-TC-SRCH-015 | แตะ recent row → results | MEMBER | Func | recents page เปิด (มี recents) | 1. แตะแถว keyword หรือ seller 2. จาก results แตะ ← | แตะ → q=ค่านั้น + results + recents ขยับขึ้นหัว; ← จาก results กลับ **landing** (ไม่ใช่หน้า recents — stack ถูก reset) | results ตรง keyword/seller ที่แตะ | High | |
| FO-TC-SRCH-016 | dedupe + cap + persist ข้าม restart | MEMBER | Edge | recents ว่าง (ทำ SRCH-014 ก่อน) หรือติดตั้งใหม่ | 1. ค้น "rolex" → กลับ ค้น "ROLEX" 2. ค้นคำต่างกันเพิ่มอีกหลายครั้ง (design cap = 8) 3. **kill app แล้วเปิดใหม่** → เข้า search typing | dedupe ไม่สนตัวพิมพ์ ("ROLEX" = "rolex" → แถวเดิมขยับขึ้นหัว ไม่ซ้ำ); เก็บสูงสุดตาม design cap (8) ตัวเก่าสุดหลุด; **ล็อก spec: recents ยังอยู่ครบหลัง kill/เปิดแอปใหม่** (persist เป็น user data ไม่ใช่ session state — หาย = FAIL) | ลิสต์ไม่ซ้ำ ไม่เกิน cap; recents อยู่ข้าม restart | High | |

### 2.4 Results — Tabs / Accounts / Grid / Empty / Error

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-SRCH-017 | results anatomy | MEMBER | UI | ค้น keyword แล้วอยู่ results | 1. ดู head + tabs + body | head: ← + ช่อง fake แสดง q + กระดิ่ง (watch alert) + ไอคอน filter; tabs: For you(on)/Profiles/Tags; body For you: section "Accounts" (เฉพาะเมื่อมี seller ชื่อ match) + section "Posts" + grid 2 คอลัมน์ | ไม่มี chips row เมื่อยังไม่ filter | High | |
| FO-TC-SRCH-018 | query match seller → โพสต์ของ seller มาด้วย | MEMBER | Func | อยู่ search typing; เลือก `KW-SELL`/`SA` แล้ว | 1. พิมพ์ `KW-SELL` (หรือชื่อ `SA`) กด Enter | การค้นจับคำจากชื่อ seller ด้วย → Accounts = seller ที่ชื่อ match; Posts = โพสต์ที่ seller/caption/specs มีคำนั้น (รวมโพสต์ของ seller นั้นด้วย) | section "Accounts" อยู่เหนือ "Posts" | High | |
| FO-TC-SRCH-019 | 0 ผลลัพธ์ | MEMBER | Edge | อยู่ search typing | 1. ค้น `KW-NONE` 2. สลับ tab Profiles/Tags | For you: ไม่มี Accounts; Posts = ไอคอนแว่นขยายใหญ่ + "No data found" + "Try a different keyword or adjust your filters"; สลับ Profiles/Tags → "No data found" (ไม่มี hint บรรทัดสอง) | empty state ทุก tab | High | |
| FO-TC-SRCH-020 | result grid tile + ล็อกเรียง newest first | MEMBER | UI | results มีหลายใบ (เช่น chip "For you") | 1. ดู grid 2. เทียบลำดับกับเวลาโพสต์จริง (เปิดโพสต์ดู timestamp) | tile = รูปแรกของโพสต์ จัตุรัส 2 คอลัมน์; badge 👁views บาง tile (ตำแหน่ง = design ref); ไม่มีราคา/ชื่อบน tile; **ล็อก spec: ผลเรียง newest first — โพสต์ล่าสุดขึ้นก่อน** (ไม่ตรง = FAIL) | grid เรียงใหม่→เก่า | High | |
| FO-TC-SRCH-021 | Profiles tab | MEMBER | Func | results มี q | 1. แตะ tab "Profiles" 2. (ทำซ้ำ) ทำให้ q ว่างผ่าน chip "For you" แล้วสลับ tab | seller cards: avatar + ชื่อ + "N listings"(ตามจริง) /"· Following" + ปุ่ม Follow/Following ขวาแถว — เฉพาะ seller ที่**ชื่อ** match q; q ว่าง → "No data found" | card เต็มแถว มีปุ่ม Follow | Medium | |
| FO-TC-SRCH-022 | Follow บน seller card `[GATE]` | MEMBER + GUEST | Func | Profiles tab มี card `SA` | 1. member แตะ "Follow" ของ `SA` 2. guest ทำซ้ำ | member: ปุ่ม flip เป็น "Following" + follow จริง (เช็กได้จาก head การ์ด/profile); guest: Member Sheet "Join TukDaeng" เด้ง ไม่มีการ follow | card re-render หลัง toggle | High | |
| FO-TC-SRCH-023 | แตะ seller card → profile | MEMBER | Func | Profiles tab มี card | 1. แตะตัวการ์ด (ไม่ใช่ปุ่ม Follow) | public profile ของ seller เด้งทับ; back กลับ results เดิม | stack ซ้อน results←profile | Medium | |
| FO-TC-SRCH-024 | Accounts row ใน For you → ค้นใหม่ (ล็อก: ไม่ใช่ profile) | MEMBER | Func | results q ที่มี Accounts rows | 1. แตะแถว seller ใน section Accounts | **ค้นใหม่ด้วย q=ชื่อ seller** → Posts เหลือเฉพาะโพสต์ที่ match ชื่อนั้น + ถูก push เป็น seller recent — **ต้องไม่เปิด profile** (ต่างจาก Profiles tab) | q บนช่องเปลี่ยนเป็นชื่อ seller | Medium | |
| FO-TC-SRCH-025 | Tags tab | MEMBER | Func | results เปิดอยู่ | 1. แตะ tab "Tags" 2. แตะแถว hashtag (เช่น `HZ`) | rows = hashtag ทั้งหมดจาก caption + suggested tags เรียงจำนวนโพสต์มาก→น้อย พร้อม "N posts" ตรงจริง; แตะแถว → q=#tag + tab กลับ For you + เข้า tag mode | แถวมีไอคอน # + "N posts" | Medium | |
| FO-TC-SRCH-026 | tag mode รวมโพสต์ที่ไม่มีราคา | MEMBER | Func | results เปิดอยู่; มี `LZ` (showcase มี hashtag `HZ`) | 1. ค้น `#HZ` (พิมพ์ตรง ๆ หรือกดจาก Tags tab) | q ขึ้นต้น # → ผล = ทุกโพสต์ที่มี tag นั้น **รวม showcase ที่ไม่มีราคา** (`LZ` ต้องโผล่ — ต่างจากผลค้นปกติที่เฉพาะ sale) | grid รวมโพสต์ showcase | High | |
| FO-TC-SRCH-027 | error state + Try again (ตัดเน็ตจริง) | MEMBER | Edge | อยู่ search เปิด results ได้ปกติ (SETUP-09) | 1. เปิด airplane mode บนเครื่อง 2. ทำการค้นใหม่หรือดึงโหลดผล 3. เห็น error แล้วปิด airplane mode 4. แตะ "Try again" | ตัดเน็ตแล้วค้น → body เปลี่ยนเป็น error block (tabs ยังอยู่); กลับมามีเน็ตแล้วกด Try again → ผลโหลดปกติ — **มาตรฐานแอป: ต้องมี error state + retry ใช้งานได้จริง** | ไอคอน + "Something went wrong. Please try again." + ปุ่ม Try again (wording ตามภาษาแอป) | High | |
| FO-TC-SRCH-028 | hashtag จาก feed → tag mode | MEMBER | Int | feed การ์ดที่ caption มี hashtag (เช่น `HZ`) expand แล้ว | 1. แตะ hashtag ใน caption | หน้า search เด้งตรง results q="#…" (tag mode) — **hashtag click ไม่ถูก push เข้า recents** (เชื่อม FEED-076) | ผล = โพสต์ที่มี tag นั้น | Medium | |
| FO-TC-SRCH-029 | back จาก results → landing + state ค้างใน session | MEMBER | Func | results q=keyword + filter ใส่แล้ว (SRCH-040) | 1. แตะ ← บน head 2. เปิด filter page ดูค่า | ← → mode landing (ไม่ใช่ typing); **ใน session เดียวกัน q+filters ยังอยู่** — เปิด filter เห็นค่าที่ apply ล่าสุด ค้นใหม่ผลยังถูกกรอง | landing แสดง grid เหมือนเดิม ไม่มี chips แสดง | High | |
| FO-TC-SRCH-030 | เปิด search ซ้ำ → landing เสมอ (ล็อก spec) | MEMBER | Edge | เคยค้น q+filter ค้างไว้แล้วออกไป feed | 1. แตะไอคอน search อีกครั้ง | **ล็อก spec: เจอ landing เสมอ state ถูกล้าง** — ไม่เจอ results เดิม, filter เดิมถูกล้าง (เปิด filter เห็นค่าว่าง), q เดิมหาย — เจอผลค้นเดิม = FAIL (มาตรฐาน IG/Shopee/YouTube) | landing + explore grid | High | |
| FO-TC-SRCH-031 | sort — ล็อก: V1 ไม่มี control + default newest first | MEMBER | Edge | results หลายใบ (chip "For you") | 1. หา control sort ทุกจุดบนหน้า (head/tabs/chips/เมนู) 2. เทียบลำดับกับเวลาโพสต์ | **ล็อก spec: ต้องไม่มี UI sort ที่แตะได้เลย — เจอ = FAIL**; ลำดับผล = newest first เท่านั้น (โพสต์ล่าสุดขึ้นก่อน — ตรวจจาก timestamp จริง) | ไม่มี dropdown/sheet/ปุ่มเรียงใด ๆ | High | |
| FO-TC-SRCH-032 | โพสต์ ni/muted/blocked หลุดจากผล (+tag mode ล็อกกรองครบ) | MEMBER | Int | ทำ "Not interested" การ์ดของ `BX` ผ่าน feed ⋯ ก่อน (SETUP-13, เชื่อม FEED-059) | 1. ค้น `BX` ดู grid 2. กลับ landing ดู explore grid 3. ค้น `#tag` ของโพสต์นั้น | โพสต์ที่ NI หายจากผลค้นปกติและ explore grid; **ล็อก spec: tag mode กรองเหมือนกัน — โพสต์ ni/muted/blocked ต้องไม่โผล่ใน tag results** (ถ้าโผล่ = FAIL) | ผลลัพธ์หดลงตาม flag | High | |

### 2.5 Filters

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-SRCH-033 | filter page anatomy | MEMBER | UI | อยู่ landing หรือ results | 1. แตะไอคอน filter (sliders) | หน้า "Filters" เด้ง: head ← + title; กลุ่มตามลำดับ design — Brand · Model · Price range (THB) · Year of production · Reference · Condition · Case size · Movement · Dial color · Strap / Bracelet · Delivery contents; footer "Clear all" + "Apply" (ไม่มีเลขเมื่อยังไม่เลือก) | chip ทุกตัวมี "(n)" ต่อท้าย | High | |
| FO-TC-SRCH-034 | counts "(n)" ตรงข้อมูลจริง + (0) กดได้ | MEMBER | Func | filter page เปิด | 1. อ่าน (n) ทุกกลุ่ม 2. spot-check: เลือกค่าที่ n>0 ใน 2 กลุ่ม → Apply → นับผลเทียบ | ทุก chip มี "(n)" ≥0; **เลขต้องตรงจำนวน sale listing จริงที่ match ค่านั้นบน test env** (นับจากผลที่ apply ได้เทียบ — ไม่ตรง = FAIL); **chip (0) ยังกดเลือกได้** (count = รายการปัจจุบัน ไม่ใช่ inactive) | เลขใน สมเหตุสมผลกับข้อมูลจริง | High | |
| FO-TC-SRCH-035 | brand → model dependency (ล็อก) | MEMBER | Func | filter page; `BX` มี ≥2 รุ่น | 1. แตะ `BX` 2. ดูกลุ่ม Model 3. แตะรุ่น 1–2 ตัว 4. เอา `BX` ออก | เลือก brand → title กลุ่มเปลี่ยน "Model · {brand}" + chips เหลือเฉพาะรุ่นของ brand นั้น; **เอา brand ออก → model ที่เลือกไว้ถูกลบออกเอง** + ลิสต์กลับครบทุกแบรนด์ | chip on = พื้นเข้ม; scroll ไม่เด้งกลับบน | High | |
| FO-TC-SRCH-036 | multi-select ใน key เดียว = OR | MEMBER | Func | filter page; `BX`/`BY` มี listing | 1. Brand: แตะ `BX` + `BY` 2. Apply | ผล = union ของทั้งสองแบรนด์ — **เทียบกับผลรวมของ (n) สอง chip ที่แสดง** (ต้องเท่ากัน) | chips row บน results แสดง "{BX} ×" "{BY} ×" | High | |
| FO-TC-SRCH-037 | ข้าม key = AND | MEMBER | Func | filter page | 1. Brand `BX` + เลือก Condition ที่ listing ของ `BX` ไม่มี (ดูจาก counts/spec จริง) 2. Apply | ข้าม key = AND → ไม่มี listing ตรงทั้งคู่ → **0 ผล "No data found" + hint** | chips "BX ×" "{cond} ×" ยังแสดงแม้ 0 ผล | High | |
| FO-TC-SRCH-038 | back = discard draft (ล็อก) | MEMBER | Func | filter page, เลือก chips ไว้แล้ว | 1. แตะ ← (ไม่กด Apply) 2. เปิด filter ใหม่ | **ไม่มีอะไร apply** — draft ถูกทิ้ง; เปิดใหม่ draft เริ่มจาก filter ที่ apply ล่าสุดเท่านั้น (chips ที่เลือกเล่น ๆ หาย) | results/landing ไม่มี chips ใหม่ | High | |
| FO-TC-SRCH-039 | Clear all (ใน draft) | MEMBER | Func | filter page มีเลือกไว้ | 1. แตะ "Clear all" | ทุก chip off + ช่องราคาว่าง + Apply ไม่มีเลข; **ยังไม่แตะ filter จริงจนกว่า Apply** | หน้า filter ล้างสะอาด | Medium | |
| FO-TC-SRCH-040 | Apply → results + chips | MEMBER | Func | filter page เลือก `BX` + ค่าอื่น 1 ตัว | 1. ดูปุ่ม Apply 2. แตะ | ปุ่มแสดง "Apply (n)" = **จำนวนค่าที่เลือก** (design ref); Apply → ไป results พร้อม chips row ใต้ tabs; ← จาก results กลับ landing (ไม่ใช่ filter page) | chips row ใต้ tabs | High | |
| FO-TC-SRCH-041 | scroll ไม่เด้งตอนเลือก chip | MEMBER | Edge | filter page เลื่อนลงกลางจอ | 1. แตะ chip กลุ่มล่าง (เช่น Delivery) | หน้าไม่กระโดดกลับบนสุด — scroll อยู่ตำแหน่งเดิม | ตำแหน่ง scroll อยู่กลุ่มเดิม | Low | |
| FO-TC-SRCH-042 | Strap/Delivery = structured matching (ล็อก) | MEMBER | Edge | filter page; มี `LL` (strap หนัง) + listing Oystersteel | 1. เลือก "Leather" → Apply → ดูผล 2. เปิดใหม่ เลือก "Oystersteel bracelet" → Apply | **ล็อก spec: match ตามตระกูล spec จริง** — "Leather" ต้องเจอ `LL` (เช่น spec "Alligator leather"); "Oystersteel bracelet" ต้องเจอ listing ที่ strap เป็น Oystersteel (เช่น "Oystersteel (Oyster bracelet)"); chip (0) → 0 ผล; Delivery "With box"/"With papers" นับทับ "Full set" ตาม semantics ของ (มีกล่อง/เอกสาร) — ถ้า match ไม่เจอทั้งที่มี spec ตระกูลนั้น = FAIL | ผลตรงตระกูล spec | High | |
| FO-TC-SRCH-043 | filter ทำงานใน tag mode | MEMBER | Edge | results tag mode (`#HZ`) | 1. เปิด filter → เลือก Brand `BY` → Apply | ตัวกรองใช้กับ tag mode ด้วย → เหลือเฉพาะโพสต์ที่มี tag `HZ` **และ** เป็น `BY` (showcase ที่ไม่มี spec Brand หลุด); chips แสดงบน tag results | chips แสดงบน tag results | Low | |

### 2.6 Price Range & Validation

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-SRCH-044 | ช่องราคา auto-comma / digits-only | MEMBER | Func | filter page | 1. พิมพ์ 420000 ในช่อง Minimum 2. พิมพ์ตัวอักษรปน เช่น "12a3b" | ระบบใส่ comma ให้ทันที → "420,000"; ตัวอักษรถูกตัดเหลือแต่ตัวเลข (อ้าง money-display-rules §4.2) | placeholder "Minimum"/"Maximum" หายเมื่อมีค่า | Medium | |
| FO-TC-SRCH-045 | min > max | MEMBER | Func | filter page | 1. Minimum 500,000 · Maximum 100,000 → Apply | validation ก่อน apply → error "Minimum price must not exceed maximum price" โผล่ใต้ช่องราคา (ตามภาษาแอป); **อยู่หน้า filter ต่อ ไม่มีอะไร apply** | ข้อความ error แดงใต้ price row | High | |
| FO-TC-SRCH-046 | max เกินเพดาน | MEMBER | Func | filter page | 1. Maximum เกินเพดาน design (3,000,000) → Apply 2. แก้เป็น 2,000,000 → Apply | > เพดาน (design ref = 2,000,000) → error "Maximum price must not exceed 2,000,000" (ตามภาษาแอป); พอดีเพดานผ่าน (inclusive) → ไป results | error เปลี่ยนตาม rule ที่เจอ | High | |
| FO-TC-SRCH-047 | chip ราคา + ขอบเปิด | MEMBER | Func | filter page | 1. ใส่แค่ Minimum (เช่น 200,000) → Apply 2. เปิดใหม่ใส่แค่ Maximum → Apply 3. ใส่ทั้งคู่ | min only → ผลเฉพาะ ≥ min + chip "THB {min}–Any" (TH แสดง "ไม่จำกัด"); max only → chip "THB 0–{max}"; ทั้งสอง → "THB {min}–{max}" กรองช่วงจริง | chip ราคาเดียวรวมทั้งช่วง (full amount + THB ตาม money rules) | High | |

### 2.7 Active Filter Chips & Persistence

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-SRCH-048 | chips แสดงทุกค่าที่ apply | MEMBER | UI | results ที่ apply ≥2 ค่า (เช่น Brand + Dial) | 1. ดูแถวใต้ tabs | chips row: ทุกค่าที่เลือกแสดงเป็น chip "{value} ×" ตามลำดับ key ของ design (brand,model,cond,ref,year,csz,move,dial,strap,deliv แล้ว price ท้ายสุด); ไม่มี chips เมื่อ filter ว่าง | chip สไตล์ on + × เล็ก | High | |
| FO-TC-SRCH-049 | ลบ chip ทีละอัน → ผลเปลี่ยนทันที | MEMBER | Func | results มี chips ≥2 ตัว (เช่น Brand + ขนาดตัวเรือน) | 1. แตะ × บน chip ตัวหนึ่ง | ค่านั้นถูกเอาออกจาก filter → re-render: chip หาย + ผลขยายตาม filter ที่เหลือทันที **ไม่ต้อง Apply ซ้ำ** | ผลเปลี่ยนทันที | High | |
| FO-TC-SRCH-050 | ลบ chip ราคา + filter ค้างใน session | MEMBER | Func | results มี chip ราคา + filter อื่นค้าง | 1. × chip ราคา → min/max ถูกล้างคู่กัน 2. ← กลับ landing → เปิด filter → ← → ค้นใหม่ | chip ราคาลบ = เคลียร์ทั้ง min/max; **filter ที่เหลือ persist ใน search session** — back ไป landing/เข้าออก filter/ค้นคำใหม่ ผลยังถูกกรอง (หมดอายุเมื่อ search state reset — ดู SRCH-030) | ผลใหม่ยังถูกกรองด้วย chip ที่เหลือ | High | |

### 2.8 Search Bell → Watch Alert `[GATE]` (entry เท่านั้น — flow อยู่ FO-TEST-11)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-SRCH-051 | bell — guest [GATE] | GUEST | Func | guest อยู่ results (ค้นอะไรก็ได้) | 1. แตะกระดิ่งบน head | **ล็อก spec: guest → Member Sheet "Join TukDaeng" เท่านั้น**; wa sheet ไม่เปิด | sheet เด้ง; ปิดแล้วอยู่ results เดิม | High | |
| FO-TC-SRCH-052 | bell — member เปิด wa sheet | MEMBER | Func | results q=keyword ไม่มี filter | 1. แตะกระดิ่ง | **ล็อก spec: member → sheet "Create watch alert"**: ชื่อ autofill จาก q + 3 โหมด (Match all/any/model + "N now") + ปุ่ม "Create alert" — criteria ไม่ลิสต์ใน sheet (ดูหน้าหลัง; internals → FO-TEST-11) | sheet เลื่อนขึ้นบน results | High | |
| FO-TC-SRCH-053 | bell พร้อม filters → name จาก criteria | MEMBER | Func | results ที่ apply Brand+Model (เช่น `BX` + รุ่น) | 1. แตะกระดิ่ง 2. ปิด sheet | ชื่อ autofill จาก criteria (เช่น "{brand} {model}"); match count ต่อโหมดคำนวณจาก criteria จริง | ปิดแล้วกลับ results chips ยังอยู่ | Medium | |
| FO-TC-SRCH-054 | bell on-state + edit mode | MEMBER | Edge | สร้าง alert จากการค้นนี้แล้ว (SETUP-12 — กด "Create alert" หนึ่งครั้งเป็น setup) | 1. ดูกระดิ่งบน results เดิม 2. แตะอีกครั้ง | **ล็อก spec: กระดิ่งเป็นสถานะ on เมื่อมี alert ที่ criteria เดียวกัน**; แตะ → sheet โหมด "Edit watch alert" (ปุ่ม "Save changes" + "Delete alert") ไม่สร้างซ้ำ | ไอคอนเติม/สีต่างจาก off | Medium | |

### 2.9 Grid Tile → Post Viewer (กติกา: viewer เปิดจาก tile เท่านั้น — internals อยู่ FO-TEST-06)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-SRCH-055 | explore tile → viewer | MEMBER | Func | อยู่ landing | 1. แตะ tile ใบแรก 2. swipe ขึ้น/ลง 3. แตะ ← | Post Viewer เต็มจอเปิดที่โพสต์/รูปที่แตะ (immersive); swipe แนวตั้งเปลี่ยนโพสต์; pv-head = ← + ไอคอน search; ← กลับ landing | รูปเต็มจอ + rail ปุ่มขวา (internals → FO-TEST-06) | High | |
| FO-TC-SRCH-056 | result tile → viewer ตามลิสต์ผลค้น | MEMBER | Func | results q=keyword มี ≥2 ใบ | 1. แตะ tile ใบที่ 2 2. swipe ลง 3. ← | viewer มีเฉพาะโพสต์ในลิสต์ผลค้น เริ่มที่ใบที่แตะ; swipe สุดขอบไม่ไปต่อ; ← กลับ **results เดิม** (q+chips ไม่หาย) | viewer ไม่แสดงโพสต์นอกผลค้น | High | |
| FO-TC-SRCH-057 | ไอคอน search ใน viewer → typing | MEMBER | Func | viewer เปิดจาก tile (มี search อยู่ใต้) | 1. แตะไอคอนแว่นขยายบน pv-head | viewer ปิด → กลับหน้า search โหมด typing (ช่องมี q เดิมค้าง) — ไม่ใช่ landing | กลับหน้าพิมพ์ค้น | Medium | |

### 2.10 Guest Coverage รวม

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-SRCH-058 | guest browse search ครบวงจร — ฟรี | GUEST | Func | guest เปิด search | 1. landing → พิมพ์ keyword → Enter → results → เปิด filter เลือก+Apply → แตะ tile → viewer → ← | ทุกขั้นทำได้ไม่เจอ Member Sheet: search/suggest/results/filter/apply/viewer ล้วนไม่อยู่ใน gate | UI เหมือน member ทุกจุด | High | |
| FO-TC-SRCH-059 | guest gates ในบริบท search | GUEST | Func | guest อยู่ results q=`KW-SELL` | 1. แตะกระดิ่ง → sheet เด้ง ปิด 2. tab Profiles → แตะ Follow → sheet 3. ← กลับ landing แตะ bookmark | gate เฉพาะกระดิ่ง + ปุ่ม Follow บน seller card; **bookmark ไม่ gate** → Saved page เปิด "No saved posts yet" | sheet × 2 จุด, saved ว่าง | High | |

### 2.11 Language / Theme / Money — Spot-check (sweep เต็ม → FO-TEST-19)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-SRCH-060 | label หน้า search แปลครบตามภาษาแอป (ล็อก) | MEMBER | UI | lang=TH (Settings → Language → ไทย) | 1. ไล่ landing → typing (Recent/suggest) → recents page → results (ทั้ง 3 tab) → filter page → error message | **ล็อก spec: label UI ทุกตัวเป็นไทย — เหลือ EN = FAIL**: "ค้นหา" · "ยกเลิก" · "ล่าสุด"/"ดูทั้งหมด" · "การค้นหาล่าสุด"/"ล้างทั้งหมด"/"ไม่มีการค้นหาล่าสุด" · "สำหรับคุณ"/"โปรไฟล์"/"แท็ก" · "บัญชี"/"โพสต์" · "ไม่พบข้อมูล" · "ตัวกรอง" + ชื่อกลุ่มทั้ง 11 · "ใช้ (n)"/"ล้างทั้งหมด" · error ราคา · sub "N รายการประกาศ"/"กำลังติดตาม"/"N โพสต์"; เนื้อหา user-gen (ชื่อ seller/keyword/brand/caption) คงเดิม | ไม่มี label เหลือ EN | High | |
| FO-TC-SRCH-061 | เงินบน search = chip ราคาเท่านั้น | MEMBER | UI | apply price range แล้ว | 1. ดู chip ราคา + badge views บน tile | chip "THB {min}–{max}" = เต็มจำนวน + THB + comma ไม่มีทศนิยม (money rules §4.1); ขอบเปิดแสดง "0"/"Any"(TH=ไม่จำกัด); badge views = ตัวนับ **ไม่ใช่เงิน** ห้ามมี THB/฿ | ไม่มีทศนิยม ไม่มี ฿ ปน | Medium | |
| FO-TC-SRCH-062 | dark theme | MEMBER | UI | theme=dark (Settings ในแอป/ระบบ) | 1. ไล่ landing/typing/results/filter/chips/empty/recents page | surface/chip on-state/ตัวอักษรอ่านได้; grid รูปไม่เพี้ยน; error text อ่านได้ | contrast ปกติทุกหน้า | Low | |

## 3. หมายเหตุ / Spec ที่ล็อกรอบนี้ + ผลกระทบต่อ prototype

**Spec ที่ล็อก (แทนข้อ [OPEN] ของรอบแรก — ตัดสินร่วมกับ PO):**

1. **Sort** `[OPEN-NO-CODE]` → **ล็อก: V1 ไม่มี control sort** — หน้าผลค้นหาห้ามมี UI เรียง (เจอ = FAIL); default = newest first เท่านั้น (SRCH-020/031)
2. **Recents page** `[OPEN-CODE-ONLY]` → **ล็อก: เป็นหน้าจริง** เหมือน prototype (See all → "Recent searches" เต็มจอ — SRCH-012–016)
3. **Language** `[OPEN]` → **ล็อก: label หน้า search ต้องแปลตามภาษาแอปครบ** — เหลือ EN = FAIL (SRCH-060); prototype เดิม hardcode EN เกือบทั้งหมด → **อัปเดตแล้ว**: เพิ่มคำแปลที่ขาดลงชั้นแปลภาษากลาง ("Recent"/"See all"/"Cancel"/"No recent searches"/"No suggestions"/"Create watch alert"/ข้อความ error ราคา + pattern "Apply (n)" กับ "THB x–Any")
4. **Search state** `[OPEN]` → **ล็อก: เปิดใหม่เจอ landing เสมอ + state ล้าง** (SRCH-030 เปลี่ยนจาก expected เดิม); **recents persist ข้าม restart** (SRCH-016) — prototype เดิมกลับมาเจอ results เดิม + recents อยู่แค่ memory → **อัปเดตแล้ว**: reset เป็น landing ทุกครั้งที่เปิดผ่านไอคอน search/hashtag + recents persist ลง localStorage (และถูกล้างตอน "1st" replay)
5. **err→retry** → **ล็อก: เทสด้วยตัดเน็ตจริง (airplane mode)** — ไม่ใช้ console flag (SRCH-027); บนแอปจริงต้องมี error state + retry ใช้ได้จริง มาตรฐานแอป
6. **Strap/Delivery matching** → **ล็อก: structured match ตามตระกูล spec** (SRCH-042) — quirk เดิม (Leather ≠ "Alligator leather") ถือว่าผิด → prototype **อัปเดตแล้ว**: strapMatch ให้ "Leather" เจอ "Alligator leather" และ "Oystersteel bracelet" เจอ "Oystersteel (Oyster bracelet)"
7. **Tag mode** → **ล็อก: รวมโพสต์ไม่มีราคา แต่กรอง ni/muted/blocked เหมือนผลค้นปกติ** (SRCH-026/032) — prototype เดิมกรองแค่ muted → **อัปเดตแล้ว** ให้กรองครบ (ทั้ง results และตัวนับ Tags tab)
8. **Watch alert bell** → **ล็อก: guest = Member Sheet เท่านั้น; member = Create/Edit sheet ตามว่ามี alert criteria เดียวกันอยู่แล้วหรือไม่** (SRCH-051–054)
9. **brand→model dependency / back=discard / Accounts row→ค้นใหม่ / chip counts ตามข้อมูลจริง** — คงพฤติกรรม design เดิมเป็น expected (SRCH-024/034/035/038)
10. **ค่าคงที่ design** (recents cap 8 / preview 4 / dedupe ไม่สนตัวพิมพ์ / เพดานราคา 2,000,000 / suggest ≤6 kw / "Apply (n)") = ค่าอ้างอิง

**ข้อจำกัด/แหล่ง BLOCK ที่ต้องรู้:**

- เคสที่ต้องการข้อมูลเฉพาะ (`BX` 2 ใบขึ้นไป, `LL` strap หนัง, `LZ` showcase + `HZ` hashtag, `KW-SELL` seller หลายราย) — ถ้า test env ไม่มี ให้สร้างผ่าน composer/บัญชีที่สองหรือขอ test data จากทีมก่อน; สร้างไม่ได้จริง ๆ mark BLOCK พร้อมเหตุผล
- error state (SRCH-027) ใช้ airplane mode ของเครื่องเท่านั้น — ถ้า build ทดสอบไม่แสดง error state เลย (เช่น offline ทำผลว่างเปล่า) = FAIL เพราะไม่ตรงมาตรฐานแอป
- traceability: rows ที่ defer ออก — `pv-open` internals → FO-TEST-06, wa sheet save/list → FO-TEST-11, `saved` internals → FO-TEST-14, Member Sheet → FO-TEST-01/17, language/theme sweep เต็ม → FO-TEST-19
- สถิติ: **62 TC** — High 40 / Medium 19 / Low 3 (SETUP rows 13 แถวแยกใน checklist; รวมใน csv 75 แถว)
