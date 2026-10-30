# FO-TEST-06 — Test Cases: Post Viewer & Post Detail (แอปมือถือจริง)

> Task: FO-TEST-06 ของชุด FO-TEST-001 · รอบแรก (prototype): 2026-10-27 · แปลงเป็นเวอร์ชันเทสแอปจริง: 2026-10-28
> กติกาหลัก: `deliverables/FO-TEST-001-testcase-prompt.md` · Task breakdown: `deliverables/FO-TEST-001-task-breakdown.md`
> Source of Truth: แอป TukDaeng build ทดสอบบนมือถือจริง — ทดสอบผ่านหน้าจอ/ท่าทางนิ้วเท่านั้น (ห้ามใช้ช่องทาง dev ทุกชนิด)
> สัญญาความครอบคลุม: `deliverables/FO-TEST-001-00-inventory.md` §2 — TC ID เดิม FO-TC-PV-001–053 + FO-TC-DET-001–040 คงไว้ครบเพื่อ traceability
> Spec ที่ล็อกรอบนี้ (ต่างจากพฤติกรรม prototype เดิม): ดู §3 — `Prototypes/fo-flow/index.html` ถูกอัปเดตให้ตรง spec แล้ว (immersive carousel + clip เล่นได้, เอาปุ่มค้นหาออกจาก Saved/Archive viewer, ซ่อน "Add comment…" บนโพสต์ปิดคอมเมนต์, detail clip เล่นทุกทางเข้า, liked-by row บน detail, status tag ตามสถานะ asset ไม่ใช่ราคา, detail head ติดบน)

## 0. วิธีใช้เอกสาร + สภาพแวดล้อม

- **สภาพแวดล้อม**: ติดตั้งแอป TukDaeng build ทดสอบบนมือถือจริง (SETUP-01) — **ห้าม** เทสผ่าน browser/localhost/prototype/emulator/DevTools/localStorage/ปุ่ม dev/demo credentials/OTP จำลอง; ทุกการเตรียมสถานะทำผ่าน flow จริงของแอปเท่านั้น (ล้างข้อมูลแอป/ติดตั้งใหม่ = SETUP-02); scroll/typing/tap = ท่าทางนิ้วบนจอจริง
- **Actor**: `GUEST` = ยังไม่ล็อกอิน · `MEMBER` = ล็อกอินบัญชีทดสอบจริง · `OWNER` = member ในฐานะเจ้าของโพสต์/asset ที่ตัวเองสร้างผ่าน composer (SETUP-09–13) · `ACCT-2` = บัญชีที่สองจริง ใช้สร้าง like/comment/alert/โพสต์จากคนอื่น (SETUP-17)
- **Type**: UI = การแสดงผล · Func = การทำงาน · Int = เชื่อมข้าม module · Edge = negative/boundary
- **Priority**: High = core flow/กติการะบบ · Medium = feature หลัก · Low = edge/cosmetic
- **[GATE]**: guest แตะ action ที่ต้องล็อกอิน → Member Sheet "Join TukDaeng" — ใน scope viewer/detail สิ่งที่ถูก gate คือ like / save / share / 🎁 wishlist / 🔔 follow model / Ask Seller / ช่องพิมพ์คอมเมนต์ + emoji / like คอมเมนต์ / follow ทุกปุ่ม / ⋯ เมนูทุกจุด — ที่**ไม่**ถูก gate (guest ใช้ได้): tile / ← / carousel / ปุ่ม 💬 เปิดอ่าน / "Add comment…" / "Tap for details" / "View full detail ›" / liked-by / hashtag — เคส [GATE] ทำคู่ guest+member (sheet mechanics อยู่ FO-TEST-01, เมทริกซ์ทั้งแอป FO-TEST-17)
- **Layer model**: viewer เปิดทับหน้าที่มา (search / saved / profile / alerts); **detail อยู่เหนือ viewer เสมอ** — เปิด detail ผ่าน "View full detail ›" แล้วกด ← จะเผยหน้าข้างล่างตำแหน่งเดิม (โพสต์เดิม scroll เดิม)
- **Viewer 3 โหมด**:
  1. **Immersive** — โพสต์เต็มจอแบบ photo stream ปัดขึ้นลงเปลี่ยนโพสต์ + rail ขวา + foot ล่าง; โพสต์หลายรูปมี **carousel** (แตะครึ่งซ้าย/ขวา หรือ swipe + counter/dots) และ clip เล่นได้ — เปิดจาก tile ใน Explore หน้า Search landing + grid ผลค้นหาเท่านั้น
  2. **List mode** — การ์ด feed ใน scroll ปกติ head = ← + ชื่อ collection (**ไม่มีไอคอนค้นหา** — spec ล็อก) — เปิดจาก tile ใน Saved / Wish List / Archive
  3. **Profile mode (pfp)** — การ์ด feed head = ← + ชื่อ surface/username + pill "Follow" (เฉพาะ user ≠ ตัวเอง + ยังไม่ follow + ไม่ block) — เปิดจาก tile บน profile grid และ alert rows (solo โพสต์เดียว)
- **กติกา entry**: viewer เปิดได้เฉพาะจาก grid tiles / notification rows — แตะรูปบน feed card หลัก = carousel เท่านั้น ไม่เปิด viewer
- **Deep/shared link**: ลิงก์โพสต์ที่แชร์มา — guest เปิดอ่าน detail ได้เต็ม แต่ action ที่ gate เด้ง Member Sheet (spec ล็อก)
- **ปุ่ม back ของระบบ (Android)**: เทียบเท่า ← ในแอป — ปิด viewer/detail กลับหน้าข้างล่างตำแหน่งเดิม (iOS ทดสอบเฉพาะปุ่มในแอป)
- **ตัวเลขเวลา/จำนวน/ข้อความ** (เวลา fade ของ Follow pill ~1.2s, toast ~2s, clip เล่นเมื่อเห็น >55% ของจอ) เป็นค่าอ้างอิง design — ค่าที่มี ~ ผ่านเมื่อพฤติกรรมเกิดตามกติกาโดยไม่ตรวจค่าเป๊ะ; ค่าที่ไม่มี ~ ต้องตรงเป๊ะ; พฤติกรรมหลักผิด = FAIL
- **เงื่อนไขผลลัพธ์**: ทุกเคสระบุ expected ชัดเจน — ไม่ตรง = FAIL; ถ้า build ไม่มีคุณสมบัติ/ข้อมูลที่เคสต้องการเลย → mark **BLOCK** พร้อมเหตุผล (ห้ามเขียน ")
- **เรื่องเงิน** อ้าง `docs/money-display-rules.md` §4.1–4.2: ราคาใน detail แสดงเต็มจำนวน `THB x,xxx,xxx` ไม่มีทศนิยม; **Estimated Market Price = ราคาประเมินจากข้อมูลตลาดจริงของรุ่นนั้น** (spec ล็อก — ค่าที่เห็น)
- **คลิป/วิดีโอ**: โพสต์ที่มีวิดีโอ — บน viewer/detail เล่นจริงพร้อมเสียงตามระดับเครื่อง (spec ล็อก) — ไม่ใช่ภาพนิ่งหรือ badge นับเวลาจำลอง; เล่น/หยุดได้ (control ตาม design ของ build)
- **Status tag บน detail**: ตามสถานะ asset ของโพสต์ ไม่ใช่ราคา — โพสต์ feed ธรรมดา (ไม่ผูก My Assets) **ไม่มี tag**; asset: ขาย = "FOR SALE" · โชว์ = "SHOWCASE" · ขายแล้ว = "SOLD" · ซ่อน = "HIDDEN" — คนอื่นเห็นเฉพาะ sale/show (sold/hide เข้าถึงได้เฉพาะเจ้าของอยู่แล้ว) (spec ล็อก)
- **สิ่งที่อยู่นอก scope** (เคสอยู่ task อื่น — ห้ามซ้ำ): feed card internals + actions บน feed หลัก (FO-TEST-03), composer (FO-TEST-05), mechanics ภายใน bottom sheets — comments/likes/share/save/wishlist/watch-alert/details sheets ที่นี่เช็คเฉพาะ "เปิดเข้าได้จาก viewer/detail + state sync บน surface ข้างล่าง" (FO-TEST-07), profile page/search page/saved hub/alerts list ตัวเอง (FO-TEST-08/09/10/12), watch alert form (FO-TEST-11), report flow ข้างใน (FO-TEST-15), portfolio/sale record (FO-TEST-13), Member Sheet (FO-TEST-01/17)

## 1. Coverage Map ของ task นี้ (เทียบ inventory §2)

| Route/Feature (inventory §2) | TC ID ที่ครอบ |
|---|---|
| explore tile → viewer immersive (search landing + results grid) | PV-001 – 002, PV-011, PV-015, PV-032 |
| saved/wishlist/archive tile → viewer list mode | PV-003 – 005, PV-010 – 011 |
| profile grid tile → viewer pfp | PV-006, PV-034 – 038 |
| alert rows (like/comment/watch) → viewer solo | PV-007 – 008, PV-039 |
| back / layer ปิด viewer | PV-010 – 012 |
| pv-post rail/foot (like/Likes/comment/views/share/save/⋯/follow/Add comment/Tap for details/caption …) | PV-013 – 025 |
| photo carousel tap/swipe/counter/dots (การ์ด + immersive + detail hero) | PV-015, PV-026 – 029, DET-007 |
| clip เล่น/หยุด/เสียง (การ์ด + immersive + detail hero) | PV-030 – 033, DET-020 – 023 |
| pfp-follow pill + watch-alert inject | PV-035 – 039 |
| ⋯ post menus (คนอื่น/เจ้าของ, pin-tab, Ask pill gate) | PV-040 – 049, DET-015 |
| "View full detail ›" → detail เหนือ viewer + ← | DET-001 – 005 |
| detail content (head/hero/status tag/name/ref/desc/specs/liked-by/money) | DET-006 – 019, DET-032 |
| like/comment/share/🔔/🎁/⋯ บน detail `[GATE]` | DET-024 – 029 |
| comments/likes sheet entry + state sync | DET-030 – 033, PV-017 – 019 |
| states: noComments/hideCounts/views 0/no-details/missing post | DET-034 – 037, PV-025 |
| Language TH/EN + dark theme | DET-038 – 039 |
| guest coverage รวม viewer/detail + deep link | PV-012, PV-020 – 021, PV-036, DET-005, DET-025 – 029, DET-031, DET-040 |
| own post จาก composer (sale/feed-only/asset/clip) | PV-050 – 053 |

## 2. Test Cases

### Setup (ทำก่อนเริ่มเทส)

| TC ID | เริ่มจาก | ขั้นตอน | ผลที่ต้องเห็น |
|---|---|---|---|
| SETUP-01 | - | ติดตั้งแอป TukDaeng build ทดสอบบนมือถือจริง (Android Play Store / iOS App Store หรือ TestFlight ตามที่ทีมแจก) → เปิดแอป | splash แล้วไหลเข้า onboarding — ห้ามเทสผ่าน browser/prototype |
| SETUP-02 | - | รีเซ็ตสถานะแอป: Android = Settings → Apps → TukDaeng → Storage → Clear data · iOS = ลบแอปติดตั้งใหม่ | onboarding เด้งใหม่เหมือนใช้ครั้งแรก ข้อมูลเก่าถูกล้าง |
| SETUP-03 | - | GUEST: รีเซ็ต (SETUP-02) หรือ Log out → เดิน onboarding ถึง sheet "Join TukDaeng" → "Skip for now" | อยู่ feed แบบ guest |
| SETUP-04 | - | MEMBER: member sheet → "Sign in" → กรอก email+password บัญชีทดสอบจริง (SETUP-06) | อยู่ feed แบบ member เห็นข้อมูลจริงของบัญชีนั้น |
| SETUP-05 | - | Member Sheet + Settings: sheet เด้งเวลา guest แตะ action gated — ปิดด้วยแตะบริเวณมืด/"Skip for now" · ภาษา/ธีม: Profile → ≡ → "Language"/"Theme" | รู้วิธีปิด sheet และสลับภาษา/ธีมในแอป |
| SETUP-06 | - | ข้อมูลอ้างอิงจากข้อมูลจริง: บัญชีทดสอบ email+password · ACCT-2 = บัญชีที่สองจริง (สำหรับ alert/follow/liked-by) · MODEL-X = รุ่นนาฬิกาที่มี market data (สำหรับ Estimated) · POST-X = โพสต์ขายของ seller อื่นที่มี ≥3 รูป + specs + ราคา + comments · POST-Y = โพสต์รูปเดียว · POST-Z = โพสต์ที่ไม่มี specs/ราคาเลย · บันทึก "รุ่นเครื่อง + OS" ลงคอลัมน์ "ทดสอบบน (Device/OS)" ทุกเคสที่รัน | มีข้อมูลครบ — ถ้าขาดตัวใด mark BLOCK เคสที่เกี่ยว |
| SETUP-07 | - | ทางเข้า viewer แต่ละ entry: Explore = nav Search → landing grid → tile · Results = พิมพ์คำค้น → grid ผล → tile · Saved = own profile → bookmark → collection → tile · Profile = แตะชื่อ seller → grid tile · Alerts = nav ระฆัง → แตะ row (member เท่านั้น) | viewer เด้งทับหน้าเดิม — โหมดตาม entry (immersive/list/pfp) |
| SETUP-08 | - | เตรียม media บนเครื่อง: gallery ต้องมีวิดีโอ ≥1 คลิป (ถ่าย/โหลดมาเอง) + รูป ≥3 ใบ· อนุญาต Photos/Camera ให้แอป | media พร้อมสำหรับเคส clip/carousel |
| SETUP-09 | MEMBER | ทำ own sale post: + → เลือกรูป 3 ใบ → Next → caption + เปิด "Add price" ใส่ราคา + "Watch details" ใส่ Brand/Model/Reference (ใช้ MODEL-X) + เปิด "Also save to My Assets" → Share | โพสต์ใหม่ seller = บัญชีตัวเอง (สถานะ Sale) ขึ้นบนสุด feed + own profile grid แท็บ Sale — ใช้กับ PV-050/051, DET-008/010/011/015 |
| SETUP-10 | MEMBER | ทำ own feed-only post: + → เลือกรูป 1 ใบ → Next → caption อะไรก็ได้ → Share (ไม่ใส่ราคา/specs, ไม่เปิด My Assets) | โพสต์ขึ้น feed + อยู่แท็บ All ของ own profile เท่านั้น (ไม่มีสถานะ asset) — ใช้กับ DET-009/013, PV-053, DET-035 |
| SETUP-11 | MEMBER | ทำ own asset posts: own profile → ปุ่ม + ซ้ายบน (asset mode) → เลือกรูป + ใส่ specs → Visibility "Show" → Add Asset · ทำซ้ำอีกรายการ Visibility "Hide" | asset Show อยู่แท็บ Show ของ own profile (ไม่ขึ้น feed) · asset Hide อยู่แท็บ Hide (เจ้าของเห็นเท่านั้น) — ใช้กับ DET-009 |
| SETUP-12 | OWNER | ทำ own sold post: ใช้โพสต์จาก SETUP-09 → ⋯ → "Mark as sold" → กรอก sale record ตาม flow (FO-TEST-13) | โพสต์ย้ายไปแท็บ Sold — เมนู ⋯ แสดง "View sale record" แทน "Edit" — ใช้กับ PV-038/048, DET-009 |
| SETUP-13 | MEMBER | ทำ own clip post: + → เลือกวิดีโอจากเครื่อง (SETUP-08) → Next → Share | โพสต์คลิปของตัวเองอยู่บน feed + own profile grid — ใช้กับ PV-030–032/052, DET-020–023 |
| SETUP-14 | OWNER | ทำ archived post: ⋯ บนโพสต์ตัวเอง → "Archive" | โพสต์ย้ายเข้า Archive (Profile → ≡ → Archive) — ใช้กับ PV-005 |
| SETUP-15 | MEMBER | เตรียม saved collections: 🔖 บนโพสต์คนอื่น ≥2 โพสต์ → เลือก/สร้าง ≥2 collections (เช่น "Saved" + "Grail list") ผ่าน save sheet | collection มีโพสต์พร้อมเปิด viewer — ใช้กับ PV-003/004 |
| SETUP-16 | MEMBER | ทำ watch alert ที่จะ match: search → ค้นแบรนด์ MODEL-X → 🔔 → "Create alert" ให้ criteria match (flow อยู่ FO-TEST-11) | alert ON — โพสต์ใหม่ที่ match จะเด้ง toast/alert row — ใช้กับ PV-007/039, DET-027 |
| SETUP-17 | ACCT-2 | บนเครื่อง/บัญชีที่สอง: (a) like + comment โพสต์ของบัญชีหลัก → เกิด like/comment alert rows · (b) publish โพสต์ที่ spec match alert ของ SETUP-16 → เกิด watch alert row · (c) ไม่ follow บัญชีหลัก (สำหรับเคส pill) | หน้า Alerts ของบัญชีหลักมี like/comment/watch rows จริง — ถ้าจัด ACCT-2 ไม่ได้ → mark BLOCK PV-007/008/039, DET-037 |

### 2.1 Entry — viewer modes & tiles

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-PV-001 | เปิด immersive viewer จาก explore tile | MEMBER | Func | member เปิด nav Search → landing เห็น explore grid | 1. แตะ tile รูปที่ 2 ของ POST-X (มี ≥3 รูป) 2. สังเกตหน้าจอ | tile → immersive viewer เต็มจอทับหน้า search — เปิดที่โพสต์นั้น **เริ่มที่รูป index ของ tile ที่แตะ** (counter "2/3") | head: ← + 🔍 · โพสต์เต็มจอ + rail ขวา + foot ล่าง + dots บน media | High | |
| FO-TC-PV-002 | เปิดจาก tile ใน grid ผลค้นหา | MEMBER | Func | search คำที่เจอ POST-X → results grid | 1. แตะ tile ของ POST-X 2. swipe ลงดูโพสต์ถัดไป | viewer list = เฉพาะผลค้นหา ไม่ใช่ทุกโพสต์ — โพสต์ถัดไปใน track คือผลลำดับถัดไป | เปิดที่โพสต์ที่แตะทันที | High | |
| FO-TC-PV-003 | เปิด list-mode viewer จาก Saved tile | MEMBER | Func | SETUP-15: collection "Saved" มีโพสต์ | 1. แตะ tile ของโพสต์ใบที่ 2 2. scroll ดูการ์ดอื่น | tile → list-mode viewer: head ← + ชื่อ collection + ไอคอนค้นหา (pv-srch); การ์ด = feed card เต็ม | การ์ด = feed card เต็ม (head/photo/actions/liked-by/caption/"Tap for details") ไม่ใช่ immersive | High | |
| FO-TC-PV-004 | list mode — title ตาม collection | MEMBER | UI | SETUP-15: ≥2 collections | 1. เปิด tile ใน collection A 2. เปิด tile ใน collection B | title head = ชื่อ collection จริงที่เปิดมา (ไม่ใช่ "Saved" เสมอ) | title ตรงหน้าที่มา | Medium | |
| FO-TC-PV-005 | list mode — Archive tile | MEMBER | Func | SETUP-14: มี archived post | 1. เปิด Archive (Profile → ≡ → Archive) 2. แตะ tile | tile → list-mode viewer title "Archive" list = เฉพาะโพสต์ archived | การ์ดโพสต์ archived แสดงปกติ | Medium | |
| FO-TC-PV-006 | เปิด profile viewer (pfp) จาก grid tile | MEMBER | Func | เปิด profile ของ seller POST-X (แตะชื่อ seller บนการ์ด) → แท็บ Posts | 1. แตะ grid tile ใบกลาง | tile → pfp viewer ของ user นั้น; เลื่อนไปที่ tile ที่แตะ; track = โพสต์ของแท็บนั้น | head: ← + "Posts"/username + pill "Follow" (ถ้ายังไม่ follow); การ์ด feed-parity | High | |
| FO-TC-PV-007 | เปิด solo viewer จาก watch alert row | MEMBER | Func | SETUP-16+17: Alerts มี watch row ของ seller ACCT-2 ที่ยังไม่ follow | 1. แตะ watch row | solo viewer (โพสต์เดียว ไม่มีโพสต์อื่นให้ swipe) — pill "Follow" ไม่อยู่บน head แต่ถูกแทรก **ในหัวการ์ด** แทน (spec ล็อก) | title "Post"/username ของ seller | High | |
| FO-TC-PV-008 | solo viewer จาก like/comment alert | MEMBER | Func | SETUP-17: Alerts มี like/comment row ชี้โพสต์ตัวเอง | 1. แตะ like row 2. แตะ comment row | solo viewer ของโพสต์นั้น — user = ตัวเองจึงไม่มี follow pill ทั้ง head และหัวการ์ด | title "Post"/ชื่อบัญชีตัวเอง | Medium | |
| FO-TC-PV-009 | กติกา entry — feed photo ไม่เปิด viewer | MEMBER | Edge | อยู่ feed หลัก เห็นการ์ดหลายรูป | 1. แตะรูปกลางการ์ด 2. แตะครึ่งซ้าย/ขวา | เป็นแค่ carousel (เปลี่ยนรูป) — viewer **ไม่เปิด** (entry เฉพาะ tiles/notifications ตามกติกา) | feed นิ่ง ไม่มี overlay | High | |
| FO-TC-PV-010 | ← ปิด viewer กลับหน้าเดิม (+ device back) | MEMBER | Func | viewer เปิดจากทุก entry | 1. เปิดจาก explore → ← 2. ทำซ้ำจาก saved + profile tile 3. (Android) กดปุ่ม back ของระบบแทน | viewer ปิด → หน้าข้างล่างโผล่ครบ state เดิม (ค่า search/collection/tab เดิม); device back ทำหน้าที่เดียวกับ ← | กลับหน้าเดิมตำแหน่งเดิม | High | |
| FO-TC-PV-011 | ไอคอนค้นหาบน viewer head — มีเฉพาะ immersive | MEMBER | Func | immersive viewer จาก search results + list-mode viewer จาก Saved/Archive | 1. (immersive) แตะ 🔍 2. (list mode) ดู head | immersive และ list/feed mode มีไอคอนค้นหา ปิด viewer แล้วกลับหน้า search; pfp mode ไม่มีไอคอนค้นหา | ไม่มีปุ่มซ้ำซ้อน | Medium | |
| FO-TC-PV-012 | guest เปิด viewer ได้ (browse) | GUEST | Func | guest session เปิด explore tile | 1. แตะ tile 2. swipe ดูหลายโพสต์ 3. แตะรูปเปลี่ยน slide 4. แตะ ← | guest เปิด/swipe/carousel/ปิด viewer ได้ปกติ — เฉพาะ action ข้างในที่ gate | viewer แสดงเต็มเหมือน member | High | |

### 2.2 Immersive pv-post — rail/foot/actions

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-PV-013 | anatomy ของ pv-post | MEMBER | UI | immersive viewer เปิดที่ POST-X | 1. สังเกตทั้งจอ | — | รูปเต็มจอ + grad มืดล่าง + counter/dots (หลายรูป); rail ขวา: ♡ · "Likes" · 💬+count · 👁views · share · 🔖 · ⋯; foot: avatar+username+"Follow" (ถ้ายังไม่ follow) + caption ย่อ "…" + "Tap for details"; ล่างสุด "Add comment…" | High | |
| FO-TC-PV-014 | vertical swipe ระหว่างโพสต์ | MEMBER | Func | viewer list มี ≥3 โพสต์ | 1. swipe ขึ้น 2 ครั้ง 2. swipe ลง 1 ครั้ง | เลื่อนทีละเต็มจอ — ขึ้น = โพสต์ถัดไป / ลง = ก่อนหน้าใน list เดียวกัน | แต่ละโพสต์ snap เต็มจอ | High | |
| FO-TC-PV-015 | โพสต์หลายรูปใน immersive = carousel (swipe ทีละรูป ไม่วน) | MEMBER | Func | เปิด tile รูปที่ 2 ของ POST-X | 1. swipe ซ้ายที่รูปที่ 2 2. swipe ซ้ายจนถึงรูปสุดท้าย 3. swipe ซ้ายต่อที่รูปสุดท้าย | swipe ทีละ 1 รูป; ที่รูปสุดท้ายหยุด ไม่วนกลับรูป 1 (แรงต้านแล้วเด้งกลับ) | counter "2/3"→"3/3" แล้วค้างที่ "3/3" + dots ตาม index | High | |
| FO-TC-PV-016 | ♡ like บน rail — sync ข้าม surface | MEMBER | Func | viewer เปิดโพสต์ที่ยังไม่ like | 1. แตะ ♡ 2. แตะอีกครั้ง 3. back ไป feed ดูการ์ดเดียวกัน | toggle like — หัวใจเติมสี⇄ออก; state sync ไปการ์ด feed/detail ของโพสต์เดียวกัน | icon เปลี่ยนสถานะทันที | High | |
| FO-TC-PV-017 | "Likes" label → likes sheet (entry) | MEMBER | Func | viewer เปิด | 1. แตะ "Likes" บน rail | likes sheet เด้งคร่อม viewer (owner ของโพสต์เห็น count, คนอื่นเห็น "and others" — mechanics อยู่ FO-TEST-07) | sheet ขึ้นจากล่างเหนือ viewer | Medium | |
| FO-TC-PV-018 | 💬 → comments sheet (entry) | MEMBER | Func | viewer เปิดที่ POST-X (มี comments) | 1. แตะ 💬 | comments sheet เด้ง จำนวนแสดงบน icon ก่อนแตะ — sheet internals อยู่ FO-TEST-07 | sheet ทับ viewer | Medium | |
| FO-TC-PV-019 | "Add comment…" → comments sheet | MEMBER | Func | viewer เปิดโพสต์ที่เปิดคอมเมนต์ | 1. แตะ "Add comment…" | comments sheet เปิด (ไม่ถูก gate — guest เปิดอ่านได้ แต่ช่องพิมพ์ใน sheet gate อยู่) | sheet เปิดพร้อมช่อง comment | Medium | |
| FO-TC-PV-020 | share / 🔖 save — guest `[GATE]` | GUEST + MEMBER | Func | viewer เปิด | 1. (guest) แตะ share 2. (guest) แตะ 🔖 3. (member) แตะทั้งสอง | guest: ทั้งคู่ → Member Sheet เด้ง sheet ไม่เปิด; member: share → sh sheet · 🔖 → sv sheet (entry เท่านั้น mechanics อยู่ FO-TEST-07) | Member Sheet ทับ viewer; member เห็น sheet จริง | High | |
| FO-TC-PV-021 | ♡ like — guest `[GATE]` | GUEST + MEMBER | Func | viewer เปิด | 1. (guest) แตะ ♡ 2. (member) แตะ ♡ | guest → Member Sheet ไม่ toggle; member → toggle ปกติ | ตาม gate | High | |
| FO-TC-PV-022 | follow-btn ใน foot + seller link | MEMBER | Func | viewer เปิดโพสต์ของ seller ที่ยังไม่ follow | 1. แตะ "Follow" ข้างชื่อ 2. แตะ avatar/ชื่อ seller | Follow → follow จริง (ปุ่มเปลี่ยน/หาย ผล sync ทุก surface); แตะชื่อ/avatar → เปิด profile ของ seller ทับ viewer | ปุ่ม "Follow" แสดงเฉพาะโพสต์ที่ยังไม่ follow | Medium | |
| FO-TC-PV-023 | caption "…" → caption sheet | MEMBER | Func | viewer เปิดโพสต์ที่ caption ยาว | 1. แตะ "…" ท้าย caption | caption sheet เด้ง (seller head + caption เต็ม + time + comments preview) — ไม่ใช่ inline expand แบบ feed card | sheet ทับ viewer | Medium | |
| FO-TC-PV-024 | "Tap for details" → sheet → "View full detail ›" | MEMBER | Func | viewer เปิด POST-X (มี specs) | 1. แตะ "Tap for details" 2. แตะ "View full detail ›" | dt sheet เด้ง (specs ย่อ + ราคาแถวบน + link); "View full detail ›" → เปิด detail เต็มจอทับ viewer | sheet มีราคา "THB …" + specs; detail เหนือ viewer | High | |
| FO-TC-PV-025 | ไม่มี "Tap for details" บนโพสต์ไม่มีรายละเอียด | MEMBER | UI | viewer เปิด POST-Z (ไม่มี specs/ราคา) | 1. ดู foot ของ pv-post | ไม่มีปุ่ม "Tap for details" — detail เข้าได้เฉพาะโพสต์ที่มีรายละเอียด (spec ล็อก: ไม่เกี่ยวกับราคา — asset Show ที่กรอก specs ไว้เข้า detail ได้ตามปกติ) | foot มีแค่ seller+caption | Medium | |

### 2.3 Photo carousel + dots

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-PV-026 | double-tap = ไลก์ / single tap ไม่ทำอะไร (การ์ดหลายรูป) | MEMBER | Func | การ์ดหลายรูปใน list/pfp viewer + immersive (ทำทั้งสอง mode) | 1. double-tap รูปของการ์ดหลายรูป 2. single tap รูปเดียวกัน | double-tap → ไลก์ +1 (ครั้งที่สองไม่ยกเลิก); single tap ไม่เปลี่ยนรูปและไม่เปิดอะไร | heart animation ตรงจุดที่แตะ; ปุ่ม ♡ บน rail เติมสี | High | |
| FO-TC-PV-027 | swipe ซ้าย/ขวา (หยุดที่ปลาย) | MEMBER | Func | การ์ด/immersive หลายรูป | 1. swipe ซ้ายจากรูป 1 2. swipe ซ้ายที่รูปสุดท้าย 3. swipe ขวาที่รูปแรก | swipe ผ่าน threshold → เปลี่ยนรูปทีละ 1; ที่ขอบแรก/สุดท้าย = ต้าน (resistance) **ไม่วน** (ตาม DEC-14 — เหมือน feed) | รูปลากตามนิ้วแล้วเด้งกลับเมื่อเกินขอบ | High | |
| FO-TC-PV-028 | swipe แนวตั้งไม่กิน carousel | MEMBER | Edge | การ์ดหลายรูปใน track | 1. กดบนรูปแล้วลากแนวตั้ง >แนวนอน | gesture แนวตั้งถูกยกให้ scroll → track เลื่อนตามปกติ (scroll ชนะ) | ไม่ติดเปลี่ยนรูประหว่าง scroll หน้า | Medium | |
| FO-TC-PV-029 | dots + counter เฉพาะหลายรูป | MEMBER | UI | เทียบ POST-X (หลายรูป) กับ POST-Y (รูปเดียว) ทั้งการ์ดและ immersive | 1. ดู media ของทั้งสองโพสต์ | รูปเดียว → ไม่มี counter/dots เลย; หลายรูป → counter "1/m" + dots (immersive = counter/dots บน media ตาม design) | dot on = รูปแรกเสมอตอนเปิด (ยกเว้นเปิดจาก tile index อื่น) | Medium | |

### 2.4 Clip — เล่นจริงพร้อมเสียง

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-PV-030 | clip บนการ์ดใน pfp/list viewer | MEMBER | Func | SETUP-13: own clip post → pfp/list viewer | 1. เลื่อนให้ clip อยู่กลางจอ 2. เลื่อนจน clip หลุดจอ | วิดีโอเล่นอัตโนมัติเมื่อเห็นส่วนใหญ่ของจอ (>55% = design ref) + **เสียงตามระดับเครื่อง**; เลื่อนหลุด → หยุด | badge/progress/control ตาม design — ไม่ใช่ภาพนิ่ง | High | |
| FO-TC-PV-031 | clip reset เมื่อสลับ slide | MEMBER | Func | clip post มี media อื่นต่อท้าย (SETUP-13 เลือกวิดีโอ+รูป หรือหลายชิ้น) | 1. ให้ clip เล่นสักพัก 2. เปลี่ยน slide ไปรูปอื่นแล้วกลับ | เปลี่ยน slide ออก → clip หยุด; กลับมา → เล่นใหม่ตั้งแต่ต้น (state ของ slide นั้น reset) | badge/ตำแหน่งเล่นกลับจุดเริ่มต้น | Medium | |
| FO-TC-PV-032 | clip ใน immersive viewer เล่นได้ (spec ล็อก) | MEMBER | Func | own clip post เจอใน search/explore → แตะ tile | 1. เปิด tile ของ clip post ใน immersive viewer | clip slide เล่นวิดีโอจริงพร้อมเสียงตามเครื่อง — เหมือนมาตรฐาน viewer ทั่วไป (prototype เดิมเป็นรูปนิ่ง — spec ล็อกใหม่ให้เล่นได้) | มี badge dur/control ตาม design | High | |
| FO-TC-PV-033 | เสียงคลิป + หยุด/เล่น | MEMBER | Func | clip กำลังเล่นบน viewer/detail | 1. ฟังเสียง 2. แตะ media/control เพื่อหยุด 3. แตะอีกครั้งเล่นต่อ | เสียงดังตาม volume เครื่อง (ไม่ใช่คลิปเงียบถาวร); มีวิธีหยุด/เล่นต่อตาม design (แตะคลิป/ปุ่มหยุดตาม design) — ไม่มีทางหยุดหรือเล่นเงียบถาวร = FAIL | control เห็น/ใช้ได้ | High | |

### 2.5 pfp viewer + Follow pill

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-PV-034 | pfp head anatomy + back | MEMBER | UI | pfp viewer จาก tile ของ seller POST-X | 1. ดู head 2. แตะ ← | head: ← + "Posts"/username + spacer + pill "Follow" (ถ้ายังไม่ follow); back → กลับ profile grid แท็บเดิม | ไม่มีไอคอนค้นหาใน pfp head | Medium | |
| FO-TC-PV-035 | pfp-follow pill — member (fade) | MEMBER | Func | pfp viewer ของ ACCT-2 ที่ยังไม่ follow | 1. แตะ "Follow" บน head 2. รอสักครู่ | pill flip เป็น "Following" แล้ว fade หายไปเอง (~1.2s = design ref); ผล follow sync ทั้งแอป | pill หายจาก head | High | |
| FO-TC-PV-036 | pfp-follow — guest `[GATE]` | GUEST + MEMBER | Func | pfp viewer ของ user ที่ยังไม่ follow | 1. (guest) แตะ pill 2. (member) แตะ pill | guest → Member Sheet ไม่มีการ follow; member → follow ปกติตาม PV-035 | Member Sheet ทับ viewer | High | |
| FO-TC-PV-037 | ไม่มี pill เมื่อ follow แล้ว/ตัวเอง/blocked | MEMBER | Edge | เปิด pfp ของ (a) seller ที่ follow แล้ว (b) own profile (c) user ที่ block ไว้ (build ไม่มีฟีเจอร์ block → BLOCK) | 1. ดู head ทั้ง 3 กรณี | pill render เฉพาะ user≠ตัวเอง + ยังไม่ follow + ไม่ block — ทั้ง 3 กรณี head ไม่มี pill | head ว่างช่วงขวา | Medium | |
| FO-TC-PV-038 | tab context บน own profile viewer | OWNER | Func | own profile → แท็บ "Sold" → แตะ tile → ⋯ บนการ์ด | 1. เปิด viewer จากแท็บ Sold 2. เปิด ⋯ | เมนู own อ่าน context ของแท็บ: โพสต์ sold แสดง "View sale record" แทน "Edit" และไม่มี "Mark as sold" (spec ล็อก: sold แก้ไม่ได้) | เมนู own ตรง context แท็บ | Medium | |
| FO-TC-PV-039 | watch-alert solo: Follow อยู่ในหัวการ์ด | MEMBER | Func | SETUP-16+17: watch row ของ ACCT-2 ที่ยังไม่ follow | 1. เปิด solo viewer 2. ดูหัวการ์ด 3. แตะ "Follow" ในการ์ด | ไม่มี pill บน head — "Follow" ถูกแทรกหน้า ⋯ ในหัวการ์ดแทน (spec ล็อก); แตะ → follow จริง | ปุ่มอยู่ในหัวการ์ดไม่ใช่ head viewer | Medium | |

### 2.6 ⋯ Post menus (คนอื่น / เจ้าของ)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-PV-040 | ⋯ บน pfp card ของคนอื่น = Report เท่านั้น | MEMBER | Func | pfp viewer ของ seller POST-X | 1. แตะ ⋯ บนหัวการ์ด | sheet แถวเดียว "Report" (reportOnly — ต่างจากเมนูเต็มบน feed/immersive) | sheet สั้นแถวเดียว | High | |
| FO-TC-PV-041 | ⋯ บน rail/card ของคนอื่น = เมนูเต็ม + Ask pill gate | GUEST + MEMBER | Func | immersive viewer POST-X + list-mode viewer | 1. แตะ ⋯ บน rail (immersive) 2. แตะ ⋯ บนหัวการ์ด (list mode) 3. (guest) แตะ "Ask" บนการ์ด sale | ⋯ → เมนูเต็ม: กลุ่ม favorites (เฉพาะ follow/fav แล้ว) + "Not interested" + "Report"; Ask pill บนการ์ด sale — guest แตะ → Member Sheet (gate) · member → เข้า chat seller | แถวตามสถานะ follow/fav | High | |
| FO-TC-PV-042 | "Add to favorites" ⇄ "Remove from favorites" | MEMBER | Func | viewer ของ seller ที่ follow/fav ได้ | 1. ⋯ → "Add to favorites" 2. ⋯ → "Remove from favorites" | toggle favorite + toast; แถวสลับ label+icon ตามสถานะ | sheet ปิดหลังเลือก + toast | Medium | |
| FO-TC-PV-043 | "Not interested" | MEMBER | Func | immersive/list viewer | 1. ⋯ → "Not interested" | โพสต์ถูก mark — หายจาก feed หลัก (เห็นผลเมื่อกลับ feed) + feedback toast | feed หลังไม่มีโพสต์นั้น | Medium | |
| FO-TC-PV-044 | "Report" → report flow entry | MEMBER | Func | viewer เปิด | 1. ⋯ → "Report" | เมนูปิด → หน้า report เลื่อนทับ viewer — flow ข้างในอยู่ FO-TEST-15 | report page ทับ viewer | Medium | |
| FO-TC-PV-045 | ⋯ บน own post = เมนูเจ้าของครบ | OWNER | Func | own post ใน pfp/list viewer (ไม่ใช่ sold) | 1. แตะ ⋯ บนโพสต์ตัวเอง | เมนูเจ้าของ 6 แถว: "Archive" · "Turn off commenting" · "Edit" · "Mark as sold" · "Pin to top of grid" · "Delete" (danger) | 6 แถวเต็ม ไม่ใช่ reportOnly | High | |
| FO-TC-PV-046 | "Archive" ⇄ "Unarchive" | OWNER | Func | เมนูเจ้าของเปิดอยู่ | 1. แตะ "Archive" 2. ⋯ อีกครั้ง 3. แตะ "Unarchive" | toggle archive — โพสต์หายจาก feed/grid เข้า Archive / กลับมา; แถวสลับ label ตามสถานะ | โพสต์หาย/กลับทุก surface | Medium | |
| FO-TC-PV-047 | "Turn off commenting" ⇄ "Turn on commenting" | OWNER | Func | เมนูเจ้าของบนโพสต์ตัวเอง (verify จาก ⋯ เมนูเท่านั้น — spec ล็อก) | 1. แตะ "Turn off commenting" 2. ดูการ์ด/viewer/detail ของโพสต์นั้น 3. เปิดอีกครั้ง → "Turn on commenting" | toggle noComments → ไอคอน 💬 หายจากการ์ด/rail/detail + **"Add comment…" หายด้วย** (spec ล็อก); แถวสลับ label | comment icon + Add comment หาย/กลับ | Medium | |
| FO-TC-PV-048 | "Pin to top of grid" + เมนู sold post | OWNER | Func | เมนูเจ้าของจากแท็บ Posts (a) โพสต์ปกติ (b) โพสต์ sold (SETUP-12) | 1. แตะ "Pin to top of grid" 2. ⋯ บน sold post | pin → โพสต์ติดบน grid แท็บนั้น (เกิน limit → dialog เลือกแทนตัวเก่าสุด); sold post: แถว "Edit" → "View sale record" ไม่มี "Mark as sold" | pin ติดขอบบน grid หลังกลับ profile | Medium | |
| FO-TC-PV-049 | "Delete" → confirm + ลบจริง | OWNER | Func | เมนูเจ้าของเปิดอยู่ | 1. แตะ "Delete" 2. อ่าน dialog 3. ยืนยัน | dialog confirm กลางจอ (ลบถาวร) → ยืนยันแล้วโพสต์ถูกลบจากทุก surface (ยกเลิก = ปิดเฉย ๆ) | โพสต์หายจาก grid/feed | High | |

### 2.7 Detail — entry + layering

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-DET-001 | "View full detail ›" จาก viewer → detail เหนือ viewer | MEMBER | Func | immersive viewer POST-X → dt sheet เปิด | 1. แตะ "View full detail ›" | dt sheet ปิด + detail เลื่อนทับเต็มจอ — viewer ยังอยู่ข้างล่าง | detail เต็มจอทับสนิท | High | |
| FO-TC-DET-002 | ← detail เผย viewer ข้างล่าง (+ device back) | MEMBER | Func | detail เปิดอยู่เหนือ viewer (DET-001) | 1. แตะ ← บน detail head 2. (Android) เปิดอีกครั้งแล้วกด device back | detail ปิด → viewer โผล่ตำแหน่งเดิม (โพสต์เดิม scroll เดิม) — **กติกา: detail อยู่เหนือ viewer เสมอ**; device back เทียบเท่า ← | pv-post เดิมกลับมา | High | |
| FO-TC-DET-003 | "Tap for details" → "View full detail ›" จาก feed card | MEMBER | Func | feed หลักการ์ด POST-X | 1. แตะ "Tap for details" ใต้ caption 2. แตะ "View full detail ›" | inline details ขยายใต้ caption (ปุ่มกลาย "Hide details"); view-full → detail ทับ feed — back กลับ feed (ไม่มี viewer ข้างล่าง) | inline details + link; detail ทับ feed | High | |
| FO-TC-DET-004 | detail จาก card-mode viewer | MEMBER | Func | list/pfp viewer การ์ด POST-X | 1. "Tap for details" → "View full detail ›" 2. ← | card → inline details → view-full → detail ทับ viewer; back → viewer ตำแหน่งเดิม | เหมือน DET-001/002 บน card mode | Medium | |
| FO-TC-DET-005 | detail เปิดจาก guest (browse) | GUEST | Func | guest เปิด viewer → dt → view-full | 1. เปิด detail ของ POST-X 2. แตะ ← | guest เปิด/อ่าน detail ได้ครบ — เฉพาะ action ที่ gate | detail render เต็มเหมือน member | Medium | |

### 2.8 Detail — content

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-DET-006 | detail head + hero anatomy | MEMBER | UI | detail ของ POST-X | 1. ดู head + hero 2. scroll ลงดู spec | head: ← + "Detail" + ⋯ **ติดบนตลอดขณะ scroll** (spec ล็อก — fixed); hero: รูป + counter "1/n" มุมขวาบน + dots ใต้รูป | head ไม่เลื่อนหายตามเนื้อหา | High | |
| FO-TC-DET-007 | hero photo nav (swipe หยุดปลาย) + double-tap ไลก์ | MEMBER | Func | detail POST-X | 1. swipe ซ้าย/ขวาที่ hero จนถึงปลาย 2. double-tap hero 3. single tap hero | swipe ทีละ 1 รูป หยุดที่ปลาย ไม่วน; double-tap → ไลก์ +1 (ครั้งที่สองไม่ยกเลิก); single tap ไม่ทำอะไร | counter "n/m" + dot on ตรง; heart animation เมื่อ double-tap | High | |
| FO-TC-DET-008 | tag FOR SALE + name/ref/desc | MEMBER | UI | detail ของโพสต์ขาย (POST-X หรือ own sale SETUP-09) | 1. ดูใต้ action row | tag "FOR SALE" (สถานะ Sale); name = Brand+Model จาก specs; "Ref. …"; หัว "Descriptions" + desc เต็ม | name จาก specs ไม่ใช่ caption ดิบ | High | |
| FO-TC-DET-009 | status tag ตามสถานะ asset (spec ล็อก) | OWNER + MEMBER | Func | own posts จาก SETUP-09/10/11/12 | 1. เปิด detail ของ: feed-only post · asset Sale · asset Show · sold post · asset Hide 2. เปิด detail โพสต์คนอื่นด้วย MEMBER | feed post ธรรมดา (ไม่ผูก assets) → **ไม่มี tag**; Sale → "FOR SALE" · Show → "SHOWCASE" · Sold → "SOLD" · Hide → "HIDDEN" — tag ตามสถานะไม่ใช่ราคา (sale ไม่ใส่ราคาก็ยัง FOR SALE); คนอื่นเห็นเฉพาะ sale/show (sold/hide เข้าถึงได้เฉพาะเจ้าของ) | tag ตรงสถานะทุกแท็บ | High | |
| FO-TC-DET-010 | spec groups ครบ + "Price & Data Source" | MEMBER | Func | detail ของ own sale post (SETUP-09) | 1. scroll ผ่าน spec sections | spec แสดงทุกกลุ่มรวม "Price & Data Source" (ต่างจาก details sheet ที่ตัดออก) — แต่ละกลุ่ม head + rows label/value | โครงกลุ่มชัดเจน | High | |
| FO-TC-DET-011 | ราคาใน spec rows ตาม money rules | MEMBER | UI | detail ของโพสต์ที่มีราคา+MODEL-X specs | 1. อ่าน "Price & Data Source" | Asking Price "THB x,xxx,xxx" เต็มจำนวน comma ไม่มีทศนิยม · **Estimated Market Price = ค่าประเมินจาก market data จริงของรุ่นนั้น** (ต้องเป็นค่าจาก market data จริง — band รอบราคาตั้งขาย = FAIL; server ไม่มี market data = BLOCK) · Last Price Update + Data Source ตาม design | ไม่มี ฿/ทศนิยม | High | |
| FO-TC-DET-012 | ไม่มี price element แยกนอก spec rows | MEMBER | Edge | detail POST-X | 1. หา element ราคาโดด ๆ | ราคาอยู่ใน spec group "Price & Data Source" เท่านั้น — ไม่มี price row แยก | ราคาอยู่ใน spec rows เดียว | Medium | |
| FO-TC-DET-013 | โพสต์ไม่มีรายละเอียด = ไม่มีทางเข้า detail | MEMBER | Edge | การ์ด POST-Z (ไม่มี specs/ราคา) + asset Show ที่มี specs (SETUP-11) | 1. ดูใต้ caption การ์ด POST-Z 2. เปิด own Show tab → tile ของ asset Show | POST-Z → ไม่มี "Tap for details"/"View full detail" เลย (เข้า detail ไม่ได้); asset Show ที่มี specs → มี "Tap for details" เข้า detail ได้ปกติ + tag SHOWCASE (spec ล็อก: ทางเข้าขึ้นกับมีรายละเอียด ไม่เกี่ยวราคา/feed) | ปุ่มมี/ไม่มีตามเงื่อนไข | Medium | |
| FO-TC-DET-014 | hashtag ใน desc → search | MEMBER | Func | detail ของโพสต์ที่มี #tag ใน Descriptions | 1. แตะ hashtag | เปิด search ผลของ tag นั้นทับ detail | search page เหนือ detail | Low | |
| FO-TC-DET-015 | detail ⋯ = เมนูตาม ownership | MEMBER + OWNER | Func | detail โพสต์คนอื่น + detail own post | 1. แตะ ⋯ บน detail head ทั้งสองกรณี | คนอื่น → เมนูเต็ม (fav/Not interested/Report); ตัวเอง → เมนูเจ้าของ 6 แถว (PV-045) | เมนูตรง owner | High | |
| FO-TC-DET-016 | detail scroll + head fixed | MEMBER | UI | detail POST-X | 1. scroll ลงสุด spec 2. scroll กลับ 3. ปิดแล้วเปิดใหม่ | scroll ภายในลื่น; **head ติดบนไม่เลื่อนหาย** (spec ล็อก); เปิดใหม่เริ่มบนสุดเสมอ (scrollTop reset) | head ค้างตำแหน่ง | Low | |
| FO-TC-DET-017 | เปิด detail โพสต์อื่นต่อ | MEMBER | Edge | detail POST-X เปิด → back → เปิด POST-Y | 1. เปิด detail POST-Y (รูปเดียว) | render ใหม่ทั้งหน้า — ไม่มี counter/dots (รูปเดียว) ไม่มีของโพสต์ก่อนค้าง | สะอาดไม่มี state เดิม | Medium | |
| FO-TC-DET-018 | ไม่มี owner row / Ask / save / chat bubble บน detail | MEMBER | UI | detail POST-X | 1. หา follow-btn/Ask Seller/save-btn/chat-fab บนหน้า | ไม่มีทั้งหมด (spec ล็อก — detail มีเฉพาะ like/💬/👁/share + 🔔 follow model + 🎁 wishlist + ⋯) | ปุ่มที่มีครบตาม list | Medium | |
| FO-TC-DET-019 | ไม่มี related posts section | MEMBER | UI | detail POST-X scroll สุด | 1. หาส่วน related/more-from-seller | ไม่มี — ท้ายหน้าคือ spec groups แล้วจบ (spec ล็อก: intentionally absent) | ไม่มี grid โพสต์อื่น | Low | |

### 2.9 Detail — clip hero

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-DET-020 | clip hero เล่น — เข้าจาก feed ตรง | MEMBER | Func | SETUP-13: clip post อยู่ feed หลัก → "Tap for details" → "View full detail ›" | 1. เปิด detail จาก feed card | hero clip เล่นวิดีโอจริงพร้อมเสียง (autoplay เมื่อเห็นบนจอ) | badge/control ตาม design | High | |
| FO-TC-DET-021 | clip hero เล่นเหมือนกัน — เข้าผ่าน viewer (spec ล็อก) | MEMBER | Func | clip post เปิดผ่าน viewer → dt → "View full detail ›" | 1. เปิด detail เหนือ viewer | clip **เล่นปกติไม่ต่างจาก DET-020** — ทางเข้าไม่กระทบการเล่น (prototype เดิมเงียบเมื่อมี sub ข้างล่าง — spec ล็อกใหม่ให้เล่นเสมอ) | badge/control เดินจริง | High | |
| FO-TC-DET-022 | hero clip reset เมื่อสลับรูป | MEMBER | Func | clip post มีรูปเพิ่ม | 1. เปลี่ยน slide ไปรูปธรรมดาแล้วกลับ | clip slide หยุดเมื่อออก + เล่นใหม่ตั้งแต่ต้นเมื่อกลับ | เวลา/progress reset | Low | |
| FO-TC-DET-023 | clip หยุดเมื่อออกจาก detail | MEMBER | Func | clip กำลังเล่นบน detail | 1. แตะ ← | detail ปิด → เสียง/การเล่นหยุดทันที ไม่มีเสียงค้างเบื้องหลัง | เงียบหลัง back | Medium | |

### 2.10 Detail — actions + `[GATE]`

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-DET-024 | like-btn บน detail (member) — sync | MEMBER | Func | detail ของโพสต์ที่ยังไม่ like เปิดเหนือ viewer | 1. แตะ ♡ 2. back ไป viewer ดู rail | toggle liked; rail ♡ บน viewer ข้างล่าง sync (state เดียวกัน) | icon สลับทันทีทั้งสองชั้น | High | |
| FO-TC-DET-025 | like-btn — guest `[GATE]` | GUEST + MEMBER | Func | detail เปิด | 1. (guest) แตะ ♡ 2. (member) แตะ ♡ | guest → Member Sheet ไม่ toggle; member → toggle ปกติ | ตาม gate | High | |
| FO-TC-DET-026 | share-btn — guest `[GATE]` | GUEST + MEMBER | Func | detail เปิด | 1. (guest) แตะ share 2. (member) แตะ share | guest → Member Sheet; member → share sheet เด้งเหนือ detail (mechanics FO-TEST-07) | sheet ทับ detail | High | |
| FO-TC-DET-027 | 🔔 follow model → watch alert — `[GATE]` + alert จริง | GUEST + MEMBER | Func | detail ของโพสต์ MODEL-X · SETUP-16 alert ON | 1. (guest) แตะ 🔔 2. (member) แตะ 🔔 3. (member) มี ACCT-2 โพสต์ match alert | guest → Member Sheet; member → wa sheet เปิด (สร้างใหม่/แก้ของเดิมตาม model เดียวกัน) → icon on เมื่อ alert ON; match จริง → toast สองจังหวะ (โพสต์เผยแพร่ + "Watch alert matched: …" ~2s = design ref) | icon ตามสถานะ alert | High | |
| FO-TC-DET-028 | 🎁 wishlist — `[GATE]` | GUEST + MEMBER | Func | detail เปิด | 1. (guest) แตะ 🎁 2. (member) แตะ 🎁 | guest → Member Sheet; member → wl sheet (entry) — icon swap เมื่อ wishlisted | wl outline/filled ตามสถานะ | High | |
| FO-TC-DET-029 | detail ⋯ — guest `[GATE]` | GUEST + MEMBER | Func | detail เปิด | 1. (guest) แตะ ⋯ 2. (member) แตะ ⋯ | guest → Member Sheet; member → เมนูตาม ownership (DET-015) | ตาม gate | High | |

### 2.11 Comments / likes — entry + state sync (mechanics → FO-TEST-07)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-DET-030 | 💬 บน detail → comments sheet | MEMBER | Func | detail POST-X (มี comments) | 1. แตะ 💬 | comments sheet เปิดพร้อม comments จริงของโพสต์นั้น — count บน icon ตรง | sheet ทับ detail | Medium | |
| FO-TC-DET-031 | 💬 — guest อ่านได้ input gate | GUEST | Func | detail เปิด | 1. แตะ 💬 2. แตะช่อง "Add a comment…" | ปุ่ม 💬 ไม่ gate → sheet เปิดอ่านได้; แตะช่องพิมพ์/emoji/like คอมเมนต์ → Member Sheet | read-only สำหรับ guest | Medium | |
| FO-TC-DET-032 | liked-by row บน detail → likes sheet (spec ล็อก) | MEMBER | Func | detail ของโพสต์ที่มี likes (เช่นโพสต์ที่ ACCT-2 like แล้ว) | 1. ดูใต้ action row บน detail 2. แตะ liked-by row 3. เทียบกับ rail "Likes" + liked-by บนการ์ด | detail มี liked-by row (avatar stack + "Liked by X and others") ใต้ action row — แตะ → likes sheet (entry เดียวกับ rail/การ์ด); ตัวเลข likes เฉพาะโพสต์ตัวเอง | row แสดงทุกครั้งที่มี likes | High | |
| FO-TC-DET-033 | state sync like/comment ข้าม surface | MEMBER | Int | viewer + detail ของโพสต์เดียวกัน | 1. like บน detail → back → ดู rail viewer 2. unlike → back | state เดียวกัน — surface ที่ re-render สะท้อนค่าล่าสุด ไม่มีค้างสถานะเก่า | sync ครบทุก surface | Medium | |

### 2.12 States + edge + language/theme

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-DET-034 | noComments — 💬 + "Add comment…" หายทุก surface (spec ล็อก) | OWNER | Func | own post ตั้ง "Turn off commenting" (PV-047) | 1. เปิด viewer + detail + การ์ด feed ของโพสต์นั้น | ไอคอน 💬 ไม่แสดงบน rail/การ์ด/detail **และ "Add comment…" บน immersive viewer หายด้วย** (spec ล็อก — prototype เดิมค้างไว้) | ไม่มีช่องทางเปิดคอมเมนต์เหลือ | Medium | |
| FO-TC-DET-035 | views 0 / โพสต์ใหม่ — ซ่อน views + liked-by | OWNER | Edge | own post ใหม่จาก composer (SETUP-10 views 0, likes 0) | 1. ดูการ์ด/detail ของโพสต์ | ไม่มี 👁views (count 0 ไม่แสดง) + ไม่มี liked-by row (ไม่มี likes) | ไม่มีตัวชี้ว่าง | Medium | |
| FO-TC-DET-036 | ตัวเลข likes เฉพาะ own post (privacy) | MEMBER | UI | เทียบ own card กับ card คนอื่นใน pfp viewer | 1. ดู action row ทั้งสอง | ตัวเลขจำนวน likes แสดงเฉพาะโพสต์ตัวเอง; โพสต์คนอื่นเห็นแค่ ♡ + "and others" ไม่มีเลข | ตัวเลขไม่รั่วบนโพสต์คนอื่น | Medium | |
| FO-TC-DET-037 | missing post — alert ชี้โพสต์ที่ถูกลบ | MEMBER | Edge | SETUP-17: ACCT-2 like own post → ลบโพสต์นั้น (PV-049) แล้วเปิด alerts | 1. แตะ alert row เดิม | แสดงหน้า unavailable `รายการนี้ไม่พร้อมใช้งานแล้ว` + ปุ่มกลับ — viewer ไม่เปิด ไม่ crash | toast ~2s = design ref | Medium | |
| FO-TC-DET-038 | Language — label TH/EN บน viewer + detail | MEMBER | Func | viewer + detail POST-X | 1. สลับ TH สังเกต 2. สลับ EN | pv: "ถูกใจ"/"แตะเพื่อดูรายละเอียด"/"เพิ่มความคิดเห็น…"/"ติดตาม"; detail: "ลงขาย"/"คำอธิบาย"/spec label; เปลี่ยนภาษาขณะเปิดอยู่ → re-render คงตำแหน่ง | ไม่มี label ค้างภาษาเดิม | Medium | |
| FO-TC-DET-039 | dark theme — viewer + detail | MEMBER | UI | viewer + detail เปิด | 1. toggle dark 2. toggle light | immersive viewer dark เสมอ (design); detail/sheets ตามธีม — ตัวอักษร/ไอคอนอ่านได้ทั้งสองโหมด | ไม่มี contrast พัง | Low | |
| FO-TC-DET-040 | guest browse detail ครบ + deep link | GUEST | Func | guest เปิด detail POST-X + guest เปิดลิงก์โพสต์ที่แชร์มา | 1. scroll spec ครบ 2. แตะ carousel 3. แตะ hashtag 4. (แยกรอบ) เปิด shared/deep link โพสต์ | อ่าน spec/เลื่อนรูป/search จาก hashtag ได้ปกติ; deep link → guest เห็น detail เต็ม แต่ action ที่ gate เด้ง Member Sheet (spec ล็อก) | read-only เต็มทั้งสองทางเข้า | Medium | |

### 2.13 Integration — own post จาก composer (FO-TEST-05)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-PV-050 | own sale post → pfp viewer + เมนูเจ้าของ | OWNER | Int | SETUP-09: own sale post (price+specs+3 รูป) | 1. own profile → Posts/Sale tab → แตะ tile ของโพสต์ใหม่ 2. แตะ ⋯ | โพสต์อยู่ใน grid → pfp viewer เปิดการ์ด (มีราคา + "Tap for details"); ⋯ → เมนูเจ้าของครบ (PV-045) | การ์ดแสดงราคา "THB …" | High | |
| FO-TC-PV-051 | own post → detail + spec groups จาก composer | OWNER | Int | SETUP-09 | 1. "Tap for details" → "View full detail ›" | detail render specGroups ที่กรอก: Watch Specifications + Item Details + Price & Data Source (Asking=ราคาที่ใส่, Estimated=market data จริงของ MODEL-X, Data Source ตาม design) + tag FOR SALE + name จาก specs | name = Brand Model จาก spec | High | |
| FO-TC-PV-052 | own clip post → เล่นใน pfp + immersive | OWNER | Int | SETUP-13: own clip post | 1. own profile → tile ของ clip post 2. หาโพสต์นั้นใน explore/search → เปิด immersive | clip เล่นพร้อมเสียงทั้งบนการ์ดใน pfp viewer และใน immersive viewer (spec ล็อก PV-032) | มี badge/control ทั้งสอง mode | High | |
| FO-TC-PV-053 | feed-only post ไม่ใส่ราคา — ไม่มี status tag | OWNER | Int | SETUP-10: feed post ไม่ใส่ราคา/specs | 1. own profile → tile ของโพสต์ 2. ถ้ากรอก specs ไว้ → เข้า detail | การ์ดไม่มีราคา; โพสต์ feed ธรรมดา (ไม่ผูก My Assets) ไม่มี status tag บน detail แม้เข้า detail ได้ (spec ล็อก: tag เฉพาะ asset) | ไม่มี FOR SALE/SHOWCASE | Medium | |

## 3. Spec ที่ล็อกรอบนี้ + ข้อจำกัดที่ต้องรีวิว

**Spec ที่ล็อก (ตัดสินแล้วกับผู้ใช้ 2026-10-28) — prototype อัปเดตตามแล้ว:**

1. **Immersive viewer = carousel + clip เล่นได้** — เดิมแสดงรูปเดียวตาม index ของ tile ไม่มี carousel; ล็อกใหม่: tap ครึ่งซ้าย/ขวา (wrap) + swipe (bounded) + counter/dots เหมือนการ์ด + clip เล่นพร้อมเสียง — แก้ prototype แล้ว (PV-001/015/026–029/032)
2. **เอาไอคอนค้นหาออกจาก Saved/Archive viewer** — เดิม 🔍 ทำหน้าที่เหมือน back ซ้ำซ้อน; ล็อก: head = ← + ชื่อ collection เท่านั้น (immersive ยังมี 🔍 เพราะกลับ search context ได้) — แก้แล้ว (PV-011)
3. **โพสต์ปิดคอมเมนต์ซ่อน "Add comment…" ด้วย** — เดิม 💬 หายแต่แถบพิมพ์ค้างเปิด sheet ได้; ล็อก: หายตามไอคอน — แก้แล้ว (PV-047/DET-034)
4. **Detail clip เล่นทุกทางเข้า** — เดิมไม่เล่นเมื่อมี sub/viewer ข้างล่าง; ล็อก: เล่นเสมอไม่ว่าเข้าจาก feed ตรงหรือผ่าน viewer — แก้แล้ว (DET-020/021)
5. **Detail ต้องมี liked-by row** — เดิมไม่มีทางเข้า likes จาก detail; ล็อก: มี row "Liked by X and others" ใต้ action row แตะ → likes sheet — แก้แล้ว (DET-032)
6. **Status tag = สถานะ asset ไม่ใช่ราคา** — เดิมผูก `!!price` + มี variant ซ่อน tag; ล็อก: feed post ธรรมดาไม่มี tag · asset: FOR SALE/SHOWCASE/SOLD/HIDDEN · คนอื่นเห็นเฉพาะ sale/show — แก้แล้ว (DET-008/009, PV-053)
7. **Detail head ติดบน (fixed)** — spec ล็อกตามมาตรฐานแอป (DET-006/016)
8. **ทางเข้า detail ขึ้นกับมีรายละเอียด** — ไม่เกี่ยวกับราคา: asset Show ที่กรอก specs เข้า detail ได้จาก own Show tab; โพสต์ไม่มี specs/ราคาเลยไม่มีทางเข้า (PV-025/DET-013)
9. **Clip = วิดีโอจริง + เสียง** — บนแอปเล่นพร้อมเสียงตามระดับเครื่อง + หยุด/เล่นได้; badge countdown ของ prototype เป็น mock เท่านั้น (PV-030–033, DET-020–023)
10. **Solo viewer จาก watch alert inject "Follow" ในหัวการ์ด** (ไม่ใช่ pill บน head) — คงเป็น spec (PV-007/039)
11. **pfp-follow pill fade หาย ~1.2s หลัง follow** — design ref (PV-035)
12. **ตัวเลข likes เฉพาะโพสต์ตัวเอง** (privacy) + feed photo tap = carousel เท่านั้น + ไม่มี related posts บน detail — ล็อกเป็น spec (DET-036, PV-009, DET-019)
13. **guest deep/shared link → อ่าน detail ได้ + action gate** — spec ล็อก (DET-040)
14. **Estimated Market Price = market data จริงของรุ่นนั้น** — ค่าที่เห็นบันทึกจริงลง Note; ถ้าเป็น band mock รอบราคาตั้งขาย → flag ทีม (DET-011)
15. **Alert rows ต้องเป็นของจริง** — like/comment/watch alert ผลิตผ่าน ACCT-2 จริง (SETUP-17) ห้าม seed ผ่าน dev; ไม่มี ACCT-2 → BLOCK เคสที่เกี่ยว (PV-007/008/039, DET-037)
16. **Ask Seller pill บนการ์ด sale ใน list/pfp viewer อยู่ใน gate** — guest แตะ → Member Sheet (PV-041)

**ข้อจำกัด/พฤติกรรมที่คงไว้ตาม spec เดิม:**

17. **detail ไม่มี owner row / Ask Seller / save / chat-fab** — เป็นส่วนของ dl2 dev harness เท่านั้น (DET-018)
18. **detail ไม่มี related posts** — intentionally absent (DET-019)
19. **viewer เปิดได้เฉพาะ tiles/notifications** — รูป feed card ไม่เปิด viewer (PV-009)
20. **ราคาอยู่ใน spec group เท่านั้น** ไม่มี price element แยก (DET-012)
21. traceability: sheets internals → FO-TEST-07, report → FO-TEST-15, watch alert form → FO-TEST-11, portfolio/sale record → FO-TEST-13, Member Sheet → FO-TEST-01/17

**จุด BLOCK ที่รู้ล่วงหน้า:**

- เคสที่ต้อง ACCT-2 (PV-007/008/039, DET-037 และขั้นตอน unfollowed seller ใน PV-035/036) — ถ้าจัดบัญชีที่สองไม่ได้ mark BLOCK
- เคสคลิปทั้งหมด (PV-030–033/052, DET-020–023) ถ้าเครื่องไม่มีวิดีโอ/สร้างโพสต์คลิปไม่ได้ → BLOCK จนเตรียมได้
- PV-037 กรณี blocked user — ถ้า build ยังไม่มีฟีเจอร์ block → BLOCK เฉพาะข้อย่อยนั้น

- สถิติ: **93 TC** — High 48 / Medium 40 / Low 5 (SETUP rows 17 แถวแยกใน checklist; รวมใน csv 110 แถว)
