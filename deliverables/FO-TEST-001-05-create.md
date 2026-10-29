# FO-TEST-05 — Test Cases: Create Composer post/asset (แอปมือถือจริง)

> Task: FO-TEST-05 ของชุด FO-TEST-001 · รอบแรก (prototype): 2026-10-27 · แปลงเป็นเวอร์ชันเทสแอปจริง: 2026-10-28
> กติกาหลัก: `deliverables/FO-TEST-001-testcase-prompt.md` · Task breakdown: `deliverables/FO-TEST-001-task-breakdown.md`
> Source of Truth: แอป TukDaeng build ทดสอบบนมือถือจริง — ทดสอบผ่านหน้าจอ/ท่าทางนิ้วเท่านั้น (ห้ามใช้ช่องทาง dev ทุกชนิด)
> สัญญาความครอบคลุม: `deliverables/FO-TEST-001-00-inventory.md` §2.4 — TC ID เดิม FO-TC-CRE-001–073 คงไว้ครบเพื่อ traceability
> Spec ที่ล็อกรอบนี้ (ต่างจากพฤติกรรม prototype เดิม): ดู §3 — `Prototypes/fo-flow/index.html` ถูกอัปเดตให้ตรง spec แล้ว (hero ใบล่าสุด, meta-only dirty → discard dialog + ล้าง draft, hero clip-play, เอาไอคอน expand ออก)

## 0. วิธีใช้เอกสาร + สภาพแวดล้อม

- **สภาพแวดล้อม**: ติดตั้งแอป TukDaeng build ทดสอบบนมือถือจริง (SETUP-01) — **ห้าม** เทสผ่าน browser/localhost/prototype/emulator/DevTools/localStorage/ปุ่ม dev/demo credentials/OTP จำลอง; ทุกการเตรียมสถานะทำผ่าน flow จริงของแอปเท่านั้น (ล้างข้อมูลแอป/ติดตั้งใหม่ = SETUP-02)
- **Actor**: `GUEST` = ยังไม่ล็อกอิน · `MEMBER` = ล็อกอินบัญชีทดสอบจริง · `NEW` = สมัครใหม่ผ่านฟอร์มสมัครจริง (OTP จริง — profile ว่าง เห็น CTA ที่ member ไม่เห็น) · `OWNER` = member ในฐานะเจ้าของโพสต์/asset ที่ตัวเองสร้างผ่าน composer (SETUP-10/11/13)
- **Type**: UI = การแสดงผล · Func = การทำงาน · Int = เชื่อมข้าม module · Edge = negative/boundary
- **Priority**: High = core flow/กติการะบบ · Medium = feature หลัก · Low = edge/cosmetic
- **[GATE]**: guest แตะ action ที่ต้องล็อกอิน → Member Sheet "Join TukDaeng" — ใน scope นี้สิ่งที่ถูก gate คือ **ปุ่ม + ทุกจุด** (header, own profile, empty CTA) — เคส [GATE] มีคู่ guest/member (sheet mechanics อยู่ FO-TEST-01, เมทริกซ์ทั้งแอป FO-TEST-17)
- **Composer**: หน้าสร้างเนื้อหาเต็มจอของแอป มี 2 step — step 1 picker (เลือกรูป/วิดีโอจากเครื่อง) ⇄ step 2 caption/editor — draft อยู่ในหน่วยความจำของแอป **ไม่ persist ข้ามการ kill/เปิดใหม่** (ล็อก V1 — ดู §3)
- **โหมด composer 2 แบบ**: post mode (header + → title "New post", ปุ่ม "Share") · asset mode (profile + / empty CTA → title "Add Asset", ปุ่ม "Add Asset", มีแถว Cost + ส่วน Visibility) · Edit info = แก้โพสต์เดิม (title "Edit info", ปุ่ม Cancel/Done)
- **Media**: รูป/วิดีโอจริงในเครื่องทดสอบ — เตรียมตาม SETUP-08 (≥11 รูป + ≥1 วิดีโอ เพื่อเทสเพดาน); เลือกได้สูงสุด **10 ชิ้น**
- **สถานที่**: ค้นสถานที่จริง (SETUP-09) — ระยะทางแสดงตามตำแหน่งเครื่องจริง
- **ปุ่ม back ของระบบ (Android)**: ทำหน้าที่เทียบเท่า ←/✕ ในแอป — step 2 → กลับ step 1; picker มี draft → discard dialog; picker ว่าง → ปิด composer (เคสที่เกี่ยวระบุไว้ — บน iOS ทดสอบเฉพาะปุ่มในแอป)
- **ตัวเลขเวลา/จำนวน/ข้อความ** (เช่น เวลา toast, ชื่อแท็บ, ข้อความ error) เป็นค่าอ้างอิง design — ค่าที่มี ~ ผ่านเมื่อพฤติกรรมเกิดตามกติกาโดยไม่ตรวจค่าเป๊ะ; ค่าที่ไม่มี ~ ต้องตรงเป๊ะ; พฤติกรรมหลักผิด = FAIL
- **เงื่อนไขผลลัพธ์**: ทุกเคสระบุ expected ชัดเจน — ไม่ตรง = FAIL; ถ้า build ไม่มีคุณสมบัติ/ข้อมูลที่เคสต้องการเลย → mark **BLOCK** พร้อมเหตุผล (ห้ามเขียน ")
- **เรื่องเงิน** อ้าง `docs/money-display-rules.md` §4.1–4.2: ช่องราคา/ต้นทุนใส่ comma ให้อัตโนมัติ; ค่าที่แสดง = เต็มจำนวน `THB x,xxx,xxx` ไม่มีทศนิยม; **Estimated Market Price = ราคาประเมินจากข้อมูลตลาดของรุ่นนั้น** (spec ล็อก: อนาคตดึงจาก market data API — ค่าที่เห็น =)
- **สิ่งที่อยู่นอก scope** (เคสอยู่ task อื่น — ห้ามซ้ำ): header/burger/back ของ shell (FO-TEST-02), ผลของโพสต์บน feed card internals (FO-TEST-03 — ที่นี่เช็คเฉพาะว่าโพสต์ใหม่ขึ้น feed ถูกต้อง), viewer/detail internals (FO-TEST-06 — เช็คเฉพาะ restore surface), สร้าง watch alert จริง (FO-TEST-11 — ที่นี่ใช้เป็น precondition + เช็ค toast match), portfolio/soldhist/sell form (FO-TEST-13 — เช็คเฉพาะ asset/ลิงก์ถูกสร้าง), Member Sheet mechanics (FO-TEST-01/17)

## 1. Coverage Map ของ task นี้ (เทียบ inventory §2.4)

| Route/Feature (inventory §2.4) | TC ID ที่ครอบ |
|---|---|
| `create` — entry ปุ่ม + post/asset `[GATE]` | CRE-001 – 005, CRE-071 |
| `create` — picker (media จริง/Select/camera/album/hero/Next/max 10) | CRE-006 – 014 |
| `create` — step2 caption (thumb strip/caption/chips/rows/Share) | CRE-015 – 024 |
| pane `loc` | CRE-025 – 027 |
| pane `price` | CRE-028 – 029 |
| pane `spec` | CRE-030 – 031 |
| pane `cond` | CRE-032 – 033 |
| pane `cost` `[OPEN-CODE-ONLY]` | CRE-034 – 039 |
| pane `more` `[OPEN-CODE-ONLY]` | CRE-040 – 042 |
| visibility `stt/vis` + "Also save to My Assets" toggle | CRE-049 – 053, CRE-060 – 062 |
| publish `cf-share` → post ใหม่ + watch-alert toast `[OPEN-CODE-ONLY]` | CRE-043 – 048 |
| edit `V.editPid` (เข้าแก้ไข/เพิ่มรูป/Done-Cancel/restore) `[OPEN-CODE-ONLY]` | CRE-054 – 062 |
| clip preview `[OPEN-CODE-ONLY]` | CRE-063 – 066 |
| discard dialog + draft edge (handoff `fo_newpost` = dev-only นอก scope — CRE-069) | CRE-013, CRE-067 – 069 |
| guest coverage รวมของ composer | CRE-002, CRE-071 |
| Language / theme / money spot-check | CRE-028, CRE-035, CRE-047, CRE-070, CRE-072 – 073 |

## 2. Test Cases

### Setup (ทำก่อนเริ่มเทส)

| TC ID | เริ่มจาก | ขั้นตอน | ผลที่ต้องเห็น |
|---|---|---|---|
| SETUP-01 | - | ติดตั้งแอป TukDaeng build ทดสอบบนมือถือจริง (Android Play Store / iOS App Store หรือ TestFlight ตามที่ทีมแจก) → เปิดแอป | splash แล้วไหลเข้า onboarding — ห้ามเทสผ่าน browser/prototype |
| SETUP-02 | - | รีเซ็ตสถานะแอป: Android = Settings → Apps → TukDaeng → Storage → Clear data · iOS = ลบแอปติดตั้งใหม่ | onboarding เด้งใหม่เหมือนใช้ครั้งแรก draft/ข้อมูลเก่าถูกล้าง |
| SETUP-03 | - | GUEST: รีเซ็ต (SETUP-02) หรือ Log out → เดิน onboarding ถึง sheet "Join TukDaeng" → "Skip for now" | อยู่ feed แบบ guest |
| SETUP-04 | - | MEMBER: จาก member sheet กด "Sign in" → กรอก email+password บัญชีทดสอบจริง (SETUP-09) | อยู่ feed แบบ member เห็นข้อมูลจริงของบัญชีนั้น |
| SETUP-05 | - | NEW: รีเซ็ต → member sheet → "Sign up" → สมัครด้วยอีเมลจริงที่รับ OTP ได้ จนสำเร็จ (flow อยู่ FO-TEST-01) | เข้าแอปเป็น member ใหม่ — own profile กริดว่าง เห็น CTA "Add your first asset" |
| SETUP-06 | - | ทางเข้า Composer: Post mode = ปุ่ม + มุมขวาบนของ feed header · Asset mode = ปุ่ม + ซ้ายบน own profile head (หรือ CTA "Add your first asset" ตอนกริดว่าง) | composer เด้งเต็มจอ เข้า step 1 picker เสมอ (Edit info เข้า step 2 ตรง) |
| SETUP-07 | - | Member Sheet + Settings: sheet เด้งเวลา guest แตะ action gated — ปิดด้วยแตะบริเวณมืด/"Skip for now" · ภาษา/ธีม: Profile → ≡ → "Language"/"Theme" | รู้วิธีปิด sheet และสลับภาษา/ธีมในแอป |
| SETUP-08 | - | เตรียม media บนเครื่อง: รูป ≥11 ใบ + วิดีโอ ≥1 คลิปใน gallery (ถ่าย/โหลดมาเอง) · อนุญาตสิทธิ์ Photos/Camera/Location ให้แอป · บันทึก "รุ่นเครื่อง + OS" ลงคอลัมน์ "ทดสอบบน (Device/OS)" ทุกเคสที่รัน | media พร้อมเทสเพดาน 10 ใบ + คลิป + สถานที่จริง |
| SETUP-09 | - | ข้อมูลอ้างอิงจากข้อมูลจริง: บัญชีทดสอบ email+password · อีเมลรับ OTP จริง · สถานที่จริงที่ค้นเจอใกล้เครื่อง (เช่น ห้างที่อยู่ในระบบ) = LOC-X · รุ่นนาฬิกาที่มี market data (สำหรับ Estimated) = MODEL-X · บัญชีที่สองสำหรับเช็ค Followers-only (ถ้าจัดได้) = ACCT-2 | มีข้อมูลครบ — ถ้าขาดตัวใด mark BLOCK เคสที่เกี่ยว |
| SETUP-10 | MEMBER | ทำ own post: + → เลือกรูป 1 ใบ → Next → caption อะไรก็ได้ → Share | โพสต์ใหม่ขึ้นหัว feed — เมนู ⋯ เป็นเมนูเจ้าของมี "Edit" — ใช้กับ CRE-044/054–058 |
| SETUP-11 | MEMBER | ทำ own post ผูก My Assets: ทำเหมือน SETUP-10 แต่ก่อน Share เปิด toggle "Also save to My Assets" + ใส่ price | toast "...shared to feed + My Assets ✓" — โพสต์อยู่แท็บ Sale + Portfolio มี asset — ใช้กับ CRE-060/061 |
| SETUP-12 | MEMBER | ทำ watch alert ที่จะ match โพสต์ทดสอบ: เปิด search → ค้นแบรนด์ที่จะใส่ใน spec (เช่น Rolex) → กระดิ่ง → "Create alert" ให้ criteria match (flow อยู่ FO-TEST-11) | alert ON — โพสต์ใหม่ที่ spec match จะเด้ง toast "Watch alert matched: ..." — ใช้กับ CRE-048 |
| SETUP-13 | OWNER | ทำ own sold post: สร้างโพสต์ → ⋯ → "Mark as sold" → กรอก sale record ตาม flow (FO-TEST-13) | โพสต์ย้ายไปแท็บ Sold — ใช้กับ CRE-062 |

### 2.1 Entry & `[GATE]` (ปุ่ม + → composer)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-CRE-001 | เปิด composer post mode จาก header + | MEMBER | Func | member อยู่ feed · อนุญาต Photos แล้ว | 1. แตะปุ่ม + มุมขวาบนของ header | composer เลื่อนขึ้นเต็มจอเข้า **step 1 picker** — ถ้าเป็นการเปิดครั้งแรกหลังติดตั้งจะมี OS permission prompt ขอ Photos ก่อน (อนุญาต) | head: ✕ + "New post" + "Next" (จาง); bar: "Recents ⌄" + "Select"; grid: ช่องกล้อง + รูป/วิดีโอจริงของเครื่อง; hero = "Select photos" | High | |
| FO-TC-CRE-002 | ปุ่ม + — guest `[GATE]` | GUEST + MEMBER | Func | guest อยู่ feed | 1. (guest) แตะ + 2. ปิด sheet แล้ว sign in member แตะ + อีกครั้ง | guest: Member Sheet "Join TukDaeng" เด้ง **composer ไม่เปิด**; member: เปิด picker ปกติ (ทำซ้ำ asset mode: guest เข้า own profile ไม่ได้เลยเพราะ nav profile ก็ถูก gate) | sheet ขึ้นทับ feed; หลังปิดอยู่ feed เดิม | High | |
| FO-TC-CRE-003 | เปิด composer asset mode จาก profile + | OWNER | Func | member เปิด own profile | 1. แตะไอคอน + ซ้ายบนของ profile head | composer โหมด asset: head "Add Asset" + ✕ + "Next" — โครง picker เหมือน post mode | title ต่างจาก post mode ชัดเจน | High | |
| FO-TC-CRE-004 | empty-state CTA บน profile (NEW session) | NEW | Func | สมัครใหม่จริง (SETUP-05) เปิด own profile | 1. ดู empty state แท็บ All 2. แตะปุ่ม "Add your first asset" | กริดว่าง → "Add your first asset" + desc + ปุ่ม primary; แตะ → composer asset mode (member ที่มีของแล้วไม่เห็น CTA นี้) | ปุ่ม render เฉพาะ own + แท็บ all + กริดว่าง | Medium | |
| FO-TC-CRE-005 | ✕ บน draft ว่าง → ปิดเงียบ | MEMBER | Func | composer เปิดใหม่ ไม่ได้เลือก/พิมพ์/ตั้งค่าอะไร | 1. แตะ ✕ บน head 2. (asset mode ทำซ้ำ: profile + → ✕) 3. เปิด composer ใหม่อีกครั้ง | ไม่มี dialog — ปิดทันที: post mode กลับ feed · asset mode กลับ own profile; **เปิดใหม่แล้วว่างสะอาด** (draft ถูกล้างเมื่อปิด — spec ล็อก) | ปิดเร็วไม่มี warning | Medium | |

### 2.2 Picker — Step 1 (เลือก media)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-CRE-006 | เลือกรูปเดี่ยว (โหมดปกติ) | MEMBER | Func | picker เปิด (post mode) | 1. แตะรูปช่องที่ 1 2. แตะรูปช่องที่ 3 | โหมดไม่-select: แตะ = เลือกทีละใบแทนที่ — ช่องแรก sel → เปลี่ยนเป็นช่อง 3; "Next" เปลี่ยนเป็นสีปกติเมื่อเลือก ≥1 | cell ที่เลือกมีกรอบ/overlay; **hero แสดงใบล่าสุดที่แตะเสมอ** (spec ล็อก) | High | |
| FO-TC-CRE-007 | Select mode — เลือกหลายรูป + เลขลำดับ | MEMBER | Func | picker เปิด | 1. แตะ "Select" 2. แตะรูป 3 ช่องติดกัน | grid เข้า selmode (วงกลม radio ทุก cell); แตะแล้ว radio แสดงเลข 1,2,3 ตามลำดับเลือก; ปุ่ม Select มีสถานะ on | เลขใน radio = ลำดับเลือก ไม่ใช่ตำแหน่ง grid | High | |
| FO-TC-CRE-008 | ยกเลิก/เรียงเลขใหม่ใน selmode | MEMBER | Func | เลือก 3 รูปไว้ (CRE-007) | 1. แตะรูปที่เลข 2 ออก 2. แตะรูปใหม่เพิ่ม | เอาออก → เลขที่เหลือ re-sequence ทันที (3→2); เพิ่ม → ได้เลขถัดไปต่อท้าย | เลขอัปเดตโดยไม่กระพริบทั้งจอ | Medium | |
| FO-TC-CRE-009 | ปิด Select กลางทาง | MEMBER | Edge | เลือก 2 รูปใน selmode | 1. แตะ "Select" อีกครั้ง (off) 2. แตะรูปใหม่ | sel ออก → radio หายทั้ง grid; highlight เก่ายังค้างบน cell (state ยังจำ) จนแตะใหม่ → order รีเซ็ตเหลือใบเดียวใหม่ | radio หายหลังปิดโหมด | Medium | |
| FO-TC-CRE-010 | เพดาน 10 media | MEMBER | Edge | selmode เลือกครบ 10 ช่อง | 1. แตะช่องที่ 11 | toast "You can add up to 10 photos or clips" (ระยะเวลา toast = design ref ~2s); ไม่ถูกเพิ่ม เลขยัง 1–10 | toast ขึ้นชัดเจน | Medium | |
| FO-TC-CRE-011 | cell คลิป + hero clip | MEMBER | UI | picker เปิด · เครื่องมีวิดีโอ (SETUP-08) | 1. เลื่อนหา cell วิดีโอ 2. แตะ cell วิดีโอ | cell วิดีโอมี badge ▶+ระยะเวลามุมล่าง; แตะ → hero เป็น clip variant: ไอคอน play ใหญ่กลาง + badge dur | badge ชัดเจนบน cell/hero | Medium | |
| FO-TC-CRE-012 | media controls จริง — album/camera/permission | MEMBER | Func | picker เปิด | 1. แตะ "Recents ⌄" 2. แตะช่องกล้อง 3. (แยกรอบ) ปฏิเสธ Photos permission แล้วเปิด picker | Recents → ตัวเลือกอัลบั้มจริงของเครื่อง (ตาม design/OS); ช่องกล้อง → เปิดกล้องจริง (ขอ Camera permission ถ้ายังไม่เคยอนุญาต) ถ่ายแล้วเข้า draft ได้; hero **ไม่มีไอคอน expand** (spec ล็อก — ไม่มีปุ่มนี้); deny Photos → picker แสดงสถานะขอสิทธิ์/ว่างตาม design ไม่ crash | control ทำงานจริงทุกจุด — ถ้าจุดไหนยัง placeholder = FAIL | High | |
| FO-TC-CRE-013 | ✕ ตอนมี draft → discard dialog | MEMBER | Func | picker เลือกรูป ≥1 หรือพิมพ์ caption แล้ว | 1. แตะ ✕ 2. อ่าน dialog 3. แตะ "Cancel" | dirty → dialog confirm discard + "Discard"(danger) + "Cancel" — Cancel ปิด dialog กลับ picker draft เหมือนเดิม | dialog ทับ composer | High | |
| FO-TC-CRE-014 | Discard → ล้าง draft จริง | MEMBER | Func | discard dialog เปิดอยู่ (CRE-013) | 1. แตะ "Discard" 2. แตะ + เปิด composer ใหม่ | composer ปิดกลับ feed; เปิดใหม่ → picker ว่างสะอาด (media/caption/meta หายหมด) | ไม่มีค่าค้าง | High | |

### 2.3 Step 2 — Caption & Media Strip

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-CRE-015 | เข้า step 2 + anatomy | MEMBER | UI | picker เลือก 1 รูป | 1. แตะ "Next" | เข้า step 2 caption/editor: head ← + "New post"; thumb strip; ช่อง caption (placeholder "Add a caption…"); แถว hashtag chips แนะนำ (ชุด design); rows Add location/Add price/Watch details/Condition/More options (ไม่มี Cost เพราะ toggle off); ปุ่ม "Share" ท้ายจอ | Next เปลี่ยนเป็น "Share" | High | |
| FO-TC-CRE-016 | ← กลับ picker (+ device back) | MEMBER | Func | อยู่ step 2 | 1. แตะ ← บน head 2. (Android) กดปุ่ม back ของระบบ | กลับ step 1 picker; การเลือก/media/caption ยังอยู่ครบ; device back ทำหน้าที่เดียวกัน (step2→step1, picker มี draft → dialog, picker ว่าง → ปิด) | picker แสดง sel เดิม | Medium | |
| FO-TC-CRE-017 | thumb strip + ลบ media | MEMBER | Func | step2 มี 3 รูป | 1. แตะ × มุม thumb ใบที่ 2 2. × ต่อจนหมด | thumb หายทีละใบ; **ลบใบสุดท้าย → เด้งกลับ step 1 picker อัตโนมัติ** (spec ล็อก: โพสต์ต้องมี media ≥1 — ไม่มีสถานะ Share disabled ให้เทส) | strip เป็น multi ตอน >1 ใบ | High | |
| FO-TC-CRE-018 | ลากเรียง thumb ใหม่ | MEMBER | Edge | step2 มี ≥3 รูป | 1. กดค้าง thumb ใบแรก (~0.4s = design ref) 2. ลากไปท้ายสุด 3. ปล่อย | long-press → เข้า drag (thumb ตามนิ้ว); ปล่อยตำแหน่งใหม่ → ลำดับ thumb เรียงใหม่จริง | ลำดับเปลี่ยนจริง ไม่ใช่แค่เลื่อน scroll | Medium | |
| FO-TC-CRE-019 | zoom viewer — เปิด/ปิด | MEMBER | Func | step2 มี ≥2 รูป | 1. แตะ thumb ใบที่ 2 2. แตะ backdrop มืดรอบรูป | zoom overlay เต็มจอแสดงรูป index ที่แตะ + dots จำนวน media (จุด on ตรง index); แตะ backdrop → ปิด overlay | overlay เหนือ step2 | High | |
| FO-TC-CRE-020 | zoom swipe ซ้าย/ขวา | MEMBER | Edge | zoom เปิดอยู่ media 3 ชิ้น | 1. swipe ซ้าย 2. swipe ขวาสุดขอบ | swipe เปลี่ยน slide ±1 (ระยะ swipe ขั้นต่ำ = design ref ~40px); ขอบซ้าย/ขวาสุด clamp ไม่วน — dots ตาม | dots อัปเดตตาม slide | Medium | |
| FO-TC-CRE-021 | พิมพ์ caption → คงอยู่ข้าม step | MEMBER | Func | step2 | 1. พิมพ์ caption 2. ← กลับ picker 3. Next กลับมา | ข้อความคงอยู่ข้าม step/re-render ภายใน session เดียวกัน | ช่องยังมีข้อความเดิม | Medium | |
| FO-TC-CRE-022 | hashtag chip → เติม caption | MEMBER | Func | step2, caption มี "#rolex" อยู่แล้ว | 1. แตะ chip ตัวอื่น 2. แตะ "#rolex" | chip ต่อท้าย caption เว้นวรรค; tag ที่มีอยู่แล้ว **ไม่เติมซ้ำ** (dedupe) | caption อัปเดตในช่องทันที | Medium | |
| FO-TC-CRE-023 | caption ว่าง Share ได้ | MEMBER | Edge | step2 มีรูป ไม่มี caption | 1. กด "Share" ทันที | ไม่บังคับ caption — publish ได้ปกติ โพสต์ขึ้น feed ไม่มี caption | โพสต์ไม่มี caption | Low | |
| FO-TC-CRE-024 | hero = ใบล่าสุดเสมอ (spec ล็อก) | MEMBER | Edge | selmode เลือก 3 รูปไม่ตามลำดับ grid | 1. ดู hero ตอนแตะสด 2. ← กลับ picker/Next ให้ re-render แล้วดู hero | hero = **ใบล่าสุดของ order เสมอ** ทั้งตอนแตะสดและหลัง re-render — ไม่มีกรณีกลับไปใบแรก (spec ล็อก — prototype เดิมเคยไม่ตรง ถูกแก้แล้ว) | ตำแหน่ง hero คงที่ตามกติกาเดียว | Medium | |

### 2.4 Panes — loc / price / spec / cond

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-CRE-025 | pane mechanics (เปิด/ปิด) | MEMBER | Func | step2 | 1. แตะแถว "Add location" 2. แตะ ← 3. เปิดใหม่แตะ "Done" | pane เลื่อนเข้าทับ step2 (head: ← + title + "Done"); ←/Done ปิด pane → step2 อัปเดตค่าของแถว | pane เลื่อนเข้าเหมือนหน้าย่อย | High | |
| FO-TC-CRE-026 | เลือกสถานที่จริง → แถวมีชื่อ+ระยะ + ลบ | MEMBER | Func | loc pane เปิด · Location permission อนุญาต | 1. ค้น/แตะสถานที่จริง LOC-X (SETUP-09) 2. ดูแถว 3. แตะ ✕ ในแถว | เลือกแล้ว pane ปิดเอง → แถวแสดงชื่อสถานที่ + sub ระยะทางตามตำแหน่งเครื่องจริง (format "N km" = design ref) + ✕ + note ใต้แถว; ✕ → แถวกลับ "Add location" note หาย; **ถ้า deny Location → แถวยังแสดงชื่อสถานที่ โดยระยะทางหายหรือแสดงตาม design — แอป crash/แสดงระยะผิดพลาด = FAIL** | ค่าระยะทางสมเหตุสมผลกับตำแหน่งจริง | Medium | |
| FO-TC-CRE-027 | ค้นหาสถานที่ + ไม่พบ | MEMBER | Edge | loc pane เปิด | 1. พิมพ์ชื่อบางส่วนของ LOC-X 2. พิมพ์ "xyz" | filter/ผลค้นหาสดตามที่พิมพ์ → เจอ LOC-X; คำไม่ match → empty state ตาม design (เช่น "No matching places") | ลิสต์หดตาม query | Low | |
| FO-TC-CRE-028 | price — auto comma → row "THB x" | MEMBER | Func | price pane เปิด | 1. พิมพ์ "420000" 2. พิมพ์ต่อ "12a3" 3. Done | ช่องแสดง "420,000" ทันที (auto comma §4.2); ตัวอักษรถูกตัดเหลือตัวเลข; แถว "Add price" val = "**THB 420,000**" (เต็มจำนวน ไม่มีทศนิยม §4.1) | มี hint เรื่อง separator อัตโนมัติ | High | |
| FO-TC-CRE-029 | เว้นราคา = showcase | MEMBER | Func | step2 | 1. เปิด price pane ไม่พิมพ์อะไร Done 2. ดูแถว | แถว val ว่าง — hint ใน pane บอกเว้นว่าง = showcase (ไม่มีป้ายราคา); publish จะได้โพสต์ประเภท showcase (เชื่อม CRE-045) | ไม่มีค่าค้างบนแถว | Medium | |
| FO-TC-CRE-030 | spec pane anatomy | MEMBER | UI | spec pane เปิด | 1. เลื่อนดูทั้ง pane | กลุ่ม Watch Specifications (จำนวนช่องตาม design) + Item Details + Description textarea + note ว่า Condition & Box ตั้งใน Condition section | จัดกลุ่มชัดเจน | Low | |
| FO-TC-CRE-031 | spec กรอก → row สรุป + persist | MEMBER | Func | spec pane เปิด | 1. Brand="Rolex", Model="Submariner Date", Reference="126610LN" 2. Done | แถว "Watch details" val = "Rolex · Submariner Date" (brand·model); เปิด pane ซ้ำค่ายังอยู่ครบ | val ไม่ยาวล้น | Medium | |
| FO-TC-CRE-032 | cond — เลือกล็อก / box ยกเลิกได้ | MEMBER | Func | cond pane เปิด | 1. แตะ "Very Good" 2. แตะ "Very Good" ซ้ำ 3. แตะ "Full set — box & papers" 4. แตะซ้ำอีกครั้ง | condition = เลือกเดี่ยว **กดซ้ำไม่ยกเลิก** (spec ล็อก); box&papers **กดซ้ำ toggle off** ได้ — สองกลุ่มพฤติกรรมต่างกันเป็น spec ที่ล็อก | radio on ตัวเดียวต่อกลุ่ม | Medium | |
| FO-TC-CRE-033 | เปลี่ยนใจข้ามตัวเลือก cond | MEMBER | Edge | cond pane เลือก "Very Good" | 1. แตะ "Good" 2. Done | เขียนทับ → เหลือ on เดียว "Good"; แถว val เปลี่ยนเป็น "Good" | ไม่มีสองตัว on | Low | |

### 2.5 Panes — cost & more

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-CRE-034 | cost row เฉพาะ asset/drawer | MEMBER | UI | step2 post mode + step2 asset mode (เปรียบเทียบ) | 1. post mode step2: ดู rows 2. เปิด toggle "Also save to My Assets" 3. asset mode step2: ดู rows | post+toggle off → ไม่มีแถว Cost; toggle on → แถว "Cost details (private)" โผล่ระหว่าง Condition กับ More options; asset mode → มีเสมอ | แถวโผล่/หายตามเงื่อนไข | Medium | |
| FO-TC-CRE-035 | cost — purchase auto comma | MEMBER | Func | cost pane เปิด (asset mode) | 1. พิมพ์ "398000" 2. Done | ช่อง "398,000" auto comma; แถว cost val = "**THB 398,000**" (price-only summary); placeholder มี comma | ตาม money rules §4.2 | Medium | |
| FO-TC-CRE-036 | cost — row แสดงวันที่เมื่อไม่มีราคา | MEMBER | Func | cost pane เปิด | 1. เลือก Purchase date = วันนี้ 2. Done | กรอกแค่วันที่ → แถว val = วันที่ (format = design ref เช่น "27 Oct 2026"); ถ้ามีราคาด้วย → แสดงราคาแทน (price ชนะ) | ฟอร์แมตวันที่เดียวกันทั้ง TH/EN | Low | |
| FO-TC-CRE-037 | bought อนาคต → error + Done ถูกบล็อก | MEMBER | Func | cost pane เปิด | 1. เลือก/พิมพ์ Purchase date มากกว่าวันนี้ 2. แตะ "Done" 3. แตะ ← | error "Purchase date can't be in the future" + ช่อง error state; **Done ไม่ปิด pane**; ← back ยังปิดได้ (ยกเลิกค่าที่พิมพ์ค้าง) | error สีแดงใต้ช่อง date | High | |
| FO-TC-CRE-038 | date bounds — เลือกนอกช่วงไม่ได้/ผิด → error | MEMBER | Edge | cost pane เปิด | 1. ลองเลือกวันที่ก่อน min ของ design (เช่น ก่อน 1900) ผ่าน date picker 2. ดูว่ามีช่องพิมพ์วันที่ด้วยมือหรือไม่ (spec B1 = ไม่มี) | picker ไม่ให้เลือกนอกช่วง (ตัวเลือกจาง/ปัดย้อนกลับ); เป็น picker-only ไม่มีช่องพิมพ์มือ (spec B1) | bounds ของ picker ชัดเจน | Low | |
| FO-TC-CRE-039 | cost privacy note | MEMBER | UI | cost pane เปิด | 1. อ่านท้าย pane | ข้อความอธิบายว่าต้นทุนเป็นข้อมูลส่วนตัว ใช้คำนวณ portfolio คนอื่นไม่เห็น (TH แปลครบ) | label ธรรมดาไม่ใช่ฟิลด์ | Low | |
| FO-TC-CRE-040 | more — turn off commenting → ผลจริง | MEMBER | Func | more pane เปิด → Done → Share | 1. toggle "Turn off commenting" on → Done → Share 2. เปิดเมนู ⋯ ของโพสต์ที่เพิ่งสร้าง | toggle on; หลัง publish เมนู ⋯ ของโพสต์ตัวเองแสดง "**Turn on commenting**" (แทน "Turn off commenting") — verify ผลจริงได้จากเมนู | สถานะสะท้อนบนโพสต์จริง | Medium | |
| FO-TC-CRE-041 | more — audience followers only | MEMBER | Func | more pane เปิด · มีบัญชีที่ 2 ACCT-2 ที่ไม่ follow (SETUP-09) | 1. แตะ "Followers only" → Done 2. Share 3. ดูแถว More options 4. ล็อกอิน ACCT-2 หาโพสต์นี้ | แถว val = "Followers only" + publish สำเร็จ; ผลการมองเห็นจริง: ACCT-2 (non-follower) ไม่เห็นโพสต์นี้ใน feed/profile — **ถ้าจัดบัญชีที่ 2 ไม่ได้ → mark BLOCK ขั้นตอน 4** | แถวแสดง audience ที่เลือก | Medium | |
| FO-TC-CRE-042 | more — ค่าคงอยู่ข้าม pane เปิดปิด | MEMBER | Edge | ตั้ง noComments+followers แล้ว Done | 1. เปิด more อีกครั้ง | toggle/radio ยังตรงค่าที่ตั้ง — meta persist ข้ามการเปิดปิด pane | ไม่รีเซ็ตเมื่อเปิดซ้ำ | Low | |

### 2.6 Publish — Post Mode

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-CRE-043 | โพสต์มีราคา → sale post ขึ้น feed | MEMBER | Int | step2: รูป + caption + price 420,000 + cond Very Good | 1. แตะ "Share" | toast "Posted · shared to feed ✓" (มี thumb) → กลับ feed scroll บนสุด เจอการ์ดตัวเอง: ชื่อบัญชีตัวเอง · "Just now" · "THB 420,000" · chip "Very Good" (+ "Full set — box & papers" ถ้าเลือก) | การ์ดครบถ้วนเหมือนโพสต์อื่น | High | |
| FO-TC-CRE-044 | โพสต์ใหม่เป็น own post (เมนู ⋯) | OWNER | Func | เพิ่ง share เสร็จ (CRE-043) | 1. แตะ ⋯ บนการ์ดตัวเอง | เมนูเจ้าของ: Archive / Turn off commenting / **Edit** / Mark as sold / Pin / Delete — ต่างจากการ์ดคนอื่น | เข้า Edit ได้ (เชื่อม CRE-054) | Medium | |
| FO-TC-CRE-045 | โพสต์ไม่มีราคา → showcase หลุดจาก search | MEMBER | Int | step2: รูป + caption มี "#tukdaeng" (ไม่ใส่ price) | 1. Share 2. เปิด search ค้นคำใน caption 3. ค้น "#tukdaeng" | showcase ไม่มีราคา: ขึ้น feed แต่ **ไม่อยู่ในผลค้นปกติ**; ค้นแบบ tag (ขึ้นต้น #) → ยังเจอถ้า caption มี tag นั้น | การ์ดไม่มีป้ายราคา | High | |
| FO-TC-CRE-046 | spec ที่กรอก → Tap for details + Estimated | MEMBER | Int | โพสต์จาก CRE-043 (spec กรอก MODEL-X) | 1. แตะ "Tap for details"/เปิด detail 2. ดูกลุ่ม Price & Data Source | spec table แสดงฟิลด์ที่กรอก ค่าว่าง = "N/A"; กลุ่ม Price & Data Source: Asking "THB 420,000" · **Estimated = ราคาประเมินจาก market data ของรุ่นนั้น** (spec ล็อก — ต้องเป็นค่าจาก market data จริง; band รอบราคาตั้งขาย = FAIL; server ไม่มี market data = BLOCK) · Last Price Update · Source ตาม design | ตาราง spec เหมือนโพสต์อื่น | Medium | |
| FO-TC-CRE-047 | ยืนยันหน่วยเงินทุกจุด | MEMBER | UI | publish แล้วดูการ์ด+แถว+detail | 1. อ่านราคาบนการ์ด/แถว/detail | ทุกจุด "THB 420,000" เต็มจำนวน comma ไม่มีทศนิยม ไม่มี ฿ ปน (§4.1); Estimated แสดงตาม design | รูปแบบเดียวกันทุกจุด | Medium | |
| FO-TC-CRE-048 | watch alert match → toast สองจังหวะ | MEMBER | Int | alert ON ที่ match (SETUP-12) | 1. สร้างโพสต์ที่ spec match alert → Share | toast แรก "Posted · shared to feed ✓" ตามด้วย toast ที่สอง "**Watch alert matched: {ชื่อ alert}**" (+N more ถ้าหลายตัว) — ลำดับต้องถูก (publish ก่อน match); ช่วงห่าง ~2s | toast สองจังหวะต่อเนื่อง | Medium | |

### 2.7 "Also save to My Assets" + Asset Mode

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-CRE-049 | toggle "Also save to My Assets" on | MEMBER | Func | step2 post mode | 1. เปิด toggle 2. ดู step2 ใหม่ | toggle on → แถว "Cost details (private)" โผล่; sub อธิบายว่าเก็บเข้า profile collection | toggle เปลี่ยนสถานะชัด | Medium | |
| FO-TC-CRE-050 | post+drawer on → publish → เข้า Sale tab | OWNER | Int | step2 post mode, toggle on, price+brand ใส่ | 1. Share 2. เปิด own profile แท็บ Sale | toast "**Posted · shared to feed + My Assets ✓**" (ต่างจาก post ธรรมดา); โพสต์โผล่แท็บ Sale + Portfolio มี asset แถวใหม่ (ลิงก์กัน — cost ไปด้วยถ้ากรอก) | toast ข้อความต่าง | High | |
| FO-TC-CRE-051 | asset mode anatomy | OWNER | UI | asset composer step2 | 1. ดู head/caption/rows/ส่วนล่าง | title "Add Asset"; caption placeholder "Describe this asset…"; มีแถว Cost; ส่วน "**Visibility**": 3 radio — Show(**default on**)/Hide/Post to feed พร้อม sub อธิบาย; ปุ่มล่าง "Add Asset" (ไม่ใช่ Share); ไม่มี toggle "Also save to My Assets" | default = Show | High | |
| FO-TC-CRE-052 | asset vis=Show → profile only | OWNER | Int | asset step2 รูป+specs, Visibility=Show | 1. แตะ "Add Asset" 2. ดู feed + profile แท็บ Show | toast "**Saved to My Assets · shown on profile ✓**" → กลับ own profile ของใหม่อยู่กริด/แท็บ Show; **ไม่ขึ้น feed/search** | อยู่เฉพาะ profile | High | |
| FO-TC-CRE-053 | asset vis=Hide / vis=Post to feed | OWNER | Int | asset step2 ทำ 2 รอบ | 1. เลือก Hide → "Add Asset" 2. สร้างใหม่ เลือก Post to feed → "Add Asset" | Hide → toast "**Saved to My Assets · private ✓**" อยู่แท็บ Hide เท่านั้น; Post to feed → toast "**Saved to My Assets · posted to feed ✓**" + ขึ้น feed เหมือนโพสต์ขาย + watch alert match ได้เหมือน post mode | toast 3 แบบต่างกันตาม vis | High | |

### 2.8 Edit Info (แก้โพสต์เดิม)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-CRE-054 | เข้า Edit info — prefilled | OWNER | Func | own post บน feed (SETUP-10) → ⋯ → "Edit" | 1. แตะ "Edit" | เข้า step 2 ตรง (ไม่มี picker): head "Cancel" + "**Edit info**" + "Done"; thumbs = รูปโพสต์เดิม; caption/price/spec/cond/loc/audience/noComments เติมค่าปัจจุบัน; cost มาจาก asset ที่ลิงก์ถ้ามี; toggle/stt สะท้อนสถานะเดิม | ไม่มีขั้น picker | High | |
| FO-TC-CRE-055 | Edit Cancel → discard → โพสต์เดิม | OWNER | Func | Edit info เปิด + แก้ caption | 1. แตะ "Cancel" 2. "Discard" | dialog confirm discard (TH/EN ตามภาษา) + Discard/Cancel; Discard → ปิด composer โพสต์ไม่เปลี่ยน | กลับ surface เดิม | High | |
| FO-TC-CRE-056 | เพิ่มรูปผ่าน thumb "+" | OWNER | Func | Edit info เปิด | 1. แตะ thumb "+" ท้าย strip 2. เลือกรูปเพิ่ม → "Done" 3. เปิดอีก เลือกแล้วกด ← | "+" (โผล่เมื่อ media <10) → picker เพิ่มรูป head "Add photos or clips" selmode (ไม่มีปุ่ม Select) — เลือกเพิ่มต่อท้าย; "Done" เก็บเพิ่มกลับ step2; **← ทิ้งที่เพิ่งเลือก คืนชุดเดิม** | picker title/ปุ่มต่างจากโหมด create | High | |
| FO-TC-CRE-057 | ลบรูปจนเหลือ 1 → toast | OWNER | Edge | Edit info มี 2 รูป | 1. × thumb จนเหลือใบเดียว 2. × อีกครั้ง | toast "**Post needs at least 1 photo or clip**" — ลบใบสุดท้ายไม่ได้ (ต่างจาก create ที่เด้งกลับ picker) | strip คง 1 ใบ | Medium | |
| FO-TC-CRE-058 | Done → apply + toast + surface | OWNER | Func | Edit info เปิดจาก feed card | 1. แก้ caption + เปลี่ยนราคา 2. "Done" | อัปเดตการ์ด: caption/price/chips/spec ใหม่; toast "**Post updated**" + thumb; ปิดกลับ surface เดิม | การ์ดใช้ค่าใหม่ทันที | High | |
| FO-TC-CRE-059 | Edit จาก detail/viewer → restore surface | OWNER | Int | own post detail เปิด → ⋯ → Edit | 1. "Done" 2. (ทำซ้ำ Cancel → Discard) | Done → detail เปิดใหม่เนื้อหาสด; Cancel/Discard → detail เดิมกลับมา; (เปิดจาก Posts viewer: composer เลื่อนทับ viewer, Done แล้ว viewer ยังอยู่ใต้) | restore ถูกชั้น | Medium | |
| FO-TC-CRE-060 | toggle drawer off → detach | OWNER | Int | Edit info โพสต์ผูก asset (SETUP-11) | 1. ปิด toggle "Also save to My Assets" 2. Done | asset หลุดออกจาก Portfolio + โพสต์หลุดแท็บ Sale — เหลือแค่ feed (แท็บ All); ปุ่มไม่ disabled | ลิงก์ asset หาย | High | |
| FO-TC-CRE-061 | Profile status switch ขาย↔โชว์ | OWNER | Int | Edit info โพสต์ drawer-on (เห็นส่วน Profile status) | 1. เลือก "Show" → Done 2. ดู feed + profile 3. (กลับ "Sale") | โพสต์หลุดจาก feed ไปอยู่แท็บ Show (asset status sync); ส่วนนี้มีเฉพาะตอน drawer on: radio ขาย/โชว์/ซ่อน; สลับกลับ Sale → โพสต์กลับ feed | radio 3 ตัว | Medium | |
| FO-TC-CRE-062 | โพสต์ sold ไม่มี Edit (spec ล็อก) | OWNER | Edge | own profile แท็บ Sold → โพสต์ sold (SETUP-13) → ⋯ | 1. ดูเมนูเจ้าของของโพสต์ sold | เมนูแสดง "**View sale record**" แทน "Edit" — sold เป็น final ไม่ให้แก้ผ่าน UI ปกติ (spec ล็อก) | ไม่มีแถว Edit | Medium | |

### 2.9 Clip Preview

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-CRE-063 | lone clip → step2 clip UI | MEMBER | Func | picker เลือกวิดีโอเพียง 1 คลิป → Next | 1. ดู step2 | thumb แบบคลิป (dur badge); zoom เปิดเป็น clip mode พร้อมปุ่ม play/dur/progress | badge dur บน thumb | Medium | |
| FO-TC-CRE-064 | clip zoom — play/pause/countdown | MEMBER | Func | lone clip step2 | 1. แตะ thumb → zoom เปิด 2. แตะตรงกลางเล่น 3. แตะอีกครั้งหยุด 4. เล่นจนจบ | เปิดมา pause (▶); แตะเล่น → ⏸ + dur นับถอยหลัง + progress เดิน; pause ค้างเวลา; จบ → กลับ pause+reset | countdown ฟอร์แมต m:ss | Medium | |
| FO-TC-CRE-065 | mixed draft คลิปใน zoom | MEMBER | Edge | step2 มีรูป+คลิปปน | 1. แตะ thumb คลิป → zoom 2. swipe ไปรูปอื่นแล้วกลับ | slide คลิปมี play/dur/prog แตะเล่นได้; slide รูปเป็น viewer ธรรมดา — สลับโหมดตาม item | play โผล่เฉพาะ slide คลิป | Low | |
| FO-TC-CRE-066 | hero clip play + share clip → feed | MEMBER | Int | picker เลือกวิดีโอ 1 คลิป | 1. แตะ ▶ บน hero clip 2. Next → Share | **แตะ ▶ บน hero → เล่น/หยุดพรีวิวได้ + dur นับถอยหลัง** (spec ล็อก — prototype เดิมไม่มี handler ถูกแก้แล้ว); Share → toast "**Clip shared to feed ✓**" (ข้อความเฉพาะคลิป) + การ์ดคลิปขึ้น feed | toast ต่างจาก photo post | Medium | |

### 2.10 Discard / Draft — Edge

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-CRE-067 | meta-only draft → ✕ เด้ง dialog (spec ล็อก) | MEMBER | Edge | step2: กรอกแค่ price/spec (ไม่มี media/caption — ลบ media จนเด้งกลับ step1 ได้) | 1. แตะ ✕ 2. ใน dialog กด "Discard" 3. เปิด composer ใหม่ | **dirty นับทุก field รวม meta → discard dialog เด้งเหมือน draft ปกติ** (spec ล็อก — prototype เดิมปิดเงียบถูกแก้แล้ว); Discard → ปิด + เปิดใหม่ว่างสะอาด meta หายหมด; (ทำซ้ำ Cancel → กลับมา meta ยังอยู่) | ไม่มีเส้นทางปิดเงียบทิ้ง meta ค้าง | High | |
| FO-TC-CRE-068 | draft ไม่ persist ข้าม kill/restart | MEMBER | Edge | มี draft ค้าง (เลือกรูป+พิมพ์ caption) | 1. ออกไปหน้า home โดยไม่ปิด composer (สลับแอป) 2. kill แอปจาก recent apps → เปิดใหม่ → แตะ + | **draft หาย — composer เปิดใหม่เป็น picker ว่าง** (spec ล็อก V1: ไม่มี draft persistence ข้าม restart) | picker ว่างใหม่เสมอ | Medium | |
| FO-TC-CRE-069 | `fo_newpost` handoff — dev-only นอก scope | MEMBER | Edge | - | - | **เคสนี้เป็นเส้นทาง dev harness ของ prototype (localStorage จาก create-post.html) — ไม่มีบนแอปจริง ทดสอบไม่ได้ → mark BLOCK พร้อมเหตุผล "dev-only: ไม่มีบนแอปจริง"** เก็บ TC ID ไว้เพื่อ traceability | - | Low | |

### 2.11 Guest / Language / Theme / Money — Spot-check

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-CRE-070 | TH labels sweep ทั้ง composer | MEMBER | UI | lang=TH (Settings → Language) | 1. ไล่ picker → step2 → ทุก pane → vis/stt → dialogs | label UI แปลครบทุกจุด (title/pane/error/radio/buttons) — เหลือ EN บน label ถือ FAIL; toast wording ตรงตาม spec | ไม่ล้น/ไม่ผิดเพศ | Medium | |
| FO-TC-CRE-071 | guest ไม่มีเส้นทางเข้า composer | GUEST | Func | guest | 1. แตะ + บน header → sheet เด้ง ปิด 2. ลองเข้า profile (nav) | ปุ่ม + และ profile nav ถูก gate ทั้งคู่ → guest เข้า composer ไม่ได้ทุก entry; หลังปิด sheet อยู่ feed เดิม | ไม่มี composer โผล่ | High | |
| FO-TC-CRE-072 | dark theme | MEMBER | UI | theme=dark (Settings → Theme) | 1. ไล่ picker/step2/panes/zoom/dialogs | surface ดำอ่านได้ทุกหน้า radio/sel ชัด zoom backdrop เข้ม dialog อ่านได้ | ไม่มี text จมพื้น | Low | |
| FO-TC-CRE-073 | money sweep ทุกจุดแสดงเงิน | MEMBER | UI | เคส price/cost/publish ทำแล้ว | 1. เช็ค row price/cost + Estimated + placeholder | row "THB 420,000"/"THB 398,000" เต็มจำนวน; placeholder มี comma; **Estimated = ค่าจาก market data ของรุ่นนั้น** (spec ล็อก E4); ไม่มีทศนิยม/฿ ปน — อ้าง money-display-rules §4.1–4.2 | สม่ำเสมอทุกจุด | Medium | |

## 3. Spec ที่ล็อกรอบนี้ + ข้อจำกัดที่ต้องรีวิว

**Spec ที่ล็อก (ตัดสินแล้วกับผู้ใช้ 2026-10-28) — prototype อัปเดตตามแล้ว:**

1. **Hero preview = ใบล่าสุดที่เลือกเสมอ** — prototype เดิม cell-tap ใช้ `order.at(-1)` แต่ re-render เต็มใช้ `order[0]` → แก้ prototype ให้ใช้ใบล่าสุดทุกทาง (CRE-024)
2. **Meta-only draft ต้องเด้ง discard dialog + ปิด = ล้าง draft** — dirty นับทุก field (media/caption/price/spec/loc/…); prototype เดิมเช็คแค่ order+caption และ `_cp` ค้าง → แก้แล้ว (CRE-067)
3. **โพสต์ sold แก้ไขไม่ได้** — เมนูเจ้าของแสดง "View sale record" แทน "Edit" ถือเป็น spec สุดท้าย (CRE-062)
4. **โพสต์ต้องมี media ≥1** — ลบใบสุดท้ายบน step2 เด้งกลับ picker อัตโนมัติ; ไม่มีสถานะ Share disabled ให้เทส (CRE-017)
5. **Hero clip play ทำงานได้** — แตะ ▶ บน hero clip เล่น/หยุดพรีวิว + countdown; prototype เดิมไม่มี handler → เพิ่มแล้ว (CRE-066)
6. **ไม่มีปุ่ม expand บน hero** — เอาออกจาก prototype แล้ว; แอปจริงไม่ต้องมี (ถ้ามีต้องเปิด full-screen preview — ถ้าเจอให้ flag)
7. **Estimated Market Price = market data จริงของรุ่นนั้น** — band −5%/+6% step 5,000 รอบราคาตั้งขายเป็น mock ของ prototype เท่านั้น; แอปต้องแสดงค่าประเมินจากข้อมูลตลาดจริง (อนาคตผ่าน API) — ค่าต้องเป็นค่าจาก market data จริง; ยังเป็น band = FAIL (CRE-046/073)
8. **Watch alert match = alert ON ที่ match จริง** — สร้างผ่าน search flow (SETUP-12) → toast สองจังหวะ publish ก่อน match; ช่วง ~2s = design ref (CRE-048)
9. **Draft ไม่ persist ข้าม kill/restart** — V1 (CRE-068)
10. **Controls จริง** — Recents ⌄ → album picker จริง, ช่องกล้อง → กล้องจริง, Photos denied → สถานะขอสิทธิ์/ว่างตาม design (CRE-012)
11. **Media controls บนแอปจริง** — gallery/OS picker, permission model จริง, video dur badge จริง (ทั้ง section 2.2)

**ข้อจำกัด/พฤติกรรมที่คงไว้ตามโค้ดเดิม (spec ที่เห็น):**

12. **condition เลือกแล้วยกเลิกไม่ได้** แต่ box&papers กดซ้ำ toggle off ได้ — สองกลุ่มพฤติกรรมต่างกันเป็น spec (CRE-032)
13. **validation เบาโดยดีไซน์** — cost Done ถูกบล็อกเฉพาะ date invalid/future; ฟิลด์อื่นไม่บังคับ (price/spec/caption ว่างได้) (CRE-037/023/029)
14. **asset mode × post mode ต่างกัน** — title/caption placeholder/ปุ่มล่าง + แถว Cost + Visibility; edit ใช้ post mode เสมอ (CRE-051/054)
15. **drawer-only (Show/Hide) ไม่เข้า feed/search** — อยู่เฉพาะ profile tab (CRE-052/053)
16. **`fo_newpost` handoff = dev-only** — localStorage channel ของ prototype เท่านั้น ไม่มีบนแอปจริง (CRE-069 = BLOCK dev-only)
17. traceability: rows ที่ defer ออก — ผลละเอียดการ์ด/viewer/detail → FO-TEST-03/06, wa sheet internals → FO-TEST-11, portfolio/sold record → FO-TEST-13, Member Sheet → FO-TEST-01/17, guest matrix เต็ม → FO-TEST-17

**จุด BLOCK ที่รู้ล่วงหน้า:**

- CRE-041 ขั้นตอนเช็คการมองเห็น non-follower ต้องมีบัญชีที่ 2 ที่ไม่ follow — ถ้าจัดไม่ได้ mark BLOCK
- CRE-069 = BLOCK (dev-only ไม่มีบนแอปจริง)
- เคสที่ต้องวิดีโอจริง (CRE-011/012/063–066) ถ้าเครื่องไม่มีวิดีโอเตรียม → BLOCK จนเตรียมได้

- สถิติ: **73 TC** — High 27 / Medium 35 / Low 11 (SETUP rows 13 แถวแยกใน checklist; รวมใน csv 86 แถว)
