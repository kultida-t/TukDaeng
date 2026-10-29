# FO-TEST-03 — Test Cases: Feed & Post Cards (สำหรับเทสแอปจริงบนมือถือ)

> Task: FO-TEST-03R ของชุด FO-TEST-001 (ต่อยอดจาก FO-TEST-03 ที่ปิดไปแล้ว) · ปรับเป็นเวอร์ชันเทสแอปจริง: 2026-10-28
> กติกาหลัก: `deliverables/FO-TEST-001-testcase-prompt.md` · Task breakdown: `deliverables/FO-TEST-001-task-breakdown.md`
> แหล่งออกแบบเคส: `Prototypes/fo-flow/index.html` (ใช้เป็นแม่แบบแตกเคส/expected เท่านั้น — ทุกเคสเขียนให้ทำบนแอปจริงได้)
> สัญญาความครอบคลุม: `deliverables/FO-TEST-001-00-inventory.md` §2.2 — ไม่เดา behavior เพิ่ม

## 0. สภาพแวดล้อมเทส + วิธีใช้เอกสาร

- **อุปกรณ์:** โทรศัพท์มือถือเครื่องจริง ติดตั้งแอป TukDaeng build ทดสอบจาก Google Play (Android) / App Store หรือ TestFlight (iOS) ตามที่ทีมแจก — ห้ามเทสผ่าน browser/prototype
- รีเซ็ตสถานะแอปด้วย **การลบแอปแล้วติดตั้งใหม่** หรือ Clear app data (Android: ตั้งค่าระบบ → Apps → TukDaeng → Storage → Clear data) — ใช้เมื่อเคสต้องการ first-run state
- **Actor**: `GUEST` = ยังไม่ล็อกอิน (เดิน onboarding แล้วกด Skip for now หรือ logout) · `MEMBER` = ล็อกอินบัญชีทดสอบที่ทีมมอบหมาย · `NEW` = สมัครบัญชีใหม่ผ่าน flow จริง (member powers แต่ข้อมูลว่าง — follow 0 คน) · `OWNER` = member ที่มีโพสต์ของตัวเองบน feed (สร้างผ่านปุ่ม `+` ตาม SETUP-09)
- **ข้อมูลทดสอบที่ต้องเตรียมก่อนเริ่ม (SETUP-06):** บัญชีทดสอบ (email+password), อีเมลที่รับ OTP จริง, บัญชี seller ตัวอย่างสำหรับเคส block, และ **feed ที่มีการ์ดครบประเภท** — ถ้า feed ว่างหรือขาดประเภทการ์ด ให้สร้างจากบัญชีที่สองผ่าน composer (`+`) หรือขอ test data จากทีม; เคสที่หาการ์ด/สถานะตาม precondition ไม่ได้เลยให้ **mark BLOCK พร้อมเหตุผล**
- **การ์ดตัวอย่าง (SETUP-08):** ก่อนเริ่มให้เลื่อน feed จริงแล้วเลือกการ์ดตามบทบาท A–G บันทึก seller/ลักษณะลง Note — ทุกเคสอ้างการ์ดตัวอย่างชุดนี้แทนข้อมูล mock เดิม:
  - `A` = การ์ดขาย (sale) มีราคา มี ≥2 รูป · `B` = การ์ด showcase (ไม่มีราคา) รูปเดียว · `C` = การ์ดขายรูปเดียว · `D` = การ์ดของ seller ที่ follow อยู่แล้ว · `E` = การ์ดของ seller ที่ยังไม่ follow · `F` = การ์ดที่มีแถว "Liked by …" (มีคน like แล้ว) · `G` = การ์ดที่ caption มี hashtag
- **ท่าทางบนจอ (ทำบนเครื่องจริงเท่านั้น):** เลื่อน = ปัดนิ้ว · ดึงลง (pull) = ลากนิ้วลงที่บนสุดของลิสต์ · แตะครึ่งซ้าย/ขวาของรูป = แตะนิ้วจริง · ลากรูป = กดค้างแล้วลาก · แตะคู่ = แตะ 2 ครั้งรวด
- **status bar** ด้านบนจอ = ของเครื่องจริง (เวลา/สัญญาณ/แบตจริง — ไม่ตรึงค่า)
- **สลับธีม/ภาษา** = ผ่าน Settings ในแอป (SETUP-07) หรือธีมระบบของเครื่อง (ถ้าแอปตั้งตามระบบ)
- **ตัวเลขเวลา/ระยะตายตัว** (toast ~2 วิ, pill "Pinning...", ระยะลากรูปที่เปลี่ยน slide, เกณฑ์ ~55% visible ของ clip autoplay) — ตัวเลขที่มี ~ คือพฤติกรรมโดยประมาณ (contract = พฤติกรรมนั้นเกิด เช่น toast หายเอง); ตัวเลขเป๊ะ (lockout 15 นาที, cap, เพดาน) ต้องตรง design — ต่าง = FAIL
- **ข้อความ EN ในคอลัมน์ expected** เป็นค่าอ้างอิงจาก design — wording ต่างจาก spec = FAIL (ข้อความ UI ที่ spec ระบุเป็นค่าล็อก)
- **คอลัมน์ "ทดสอบบน (Device/OS)"** ใน checklist(เช่น `iPhone 15 · iOS 18`, `Galaxy S24 · Android 15`)
- **Type**: UI = การแสดงผล · Func = การทำงาน · Int = เชื่อมข้าม module · Edge = negative/boundary
- **Priority**: High = core flow/กติการะบบ · Medium = feature หลัก · Low = edge/cosmetic
- **[GATE]**: action ที่ guest แตะแล้วเด้ง Member Sheet "Join TukDaeng" — ทุกเคส [GATE] มีคู่ guest/member ครบ; mechanics ของ sheet อยู่ FO-TEST-01 (AUTH-061–068) และเมทริกซ์ gate ทั้งแอปอยู่ FO-TEST-17
- **กติกาที่ล็อกแล้วจาก FO-TEST-02R (ใช้เป็น FAIL criteria ได้เลย):**
  - scroll-to-hide ใช้ได้เฉพาะหน้า feed — nav หน้าอื่นต้องแสดงเสมอ ห้ามหลบตามสถานะ feed
  - (Android) ปุ่ม/เจสเจอร์ back ของเครื่องต้องถอยหน้าภายในแอปเทียบเท่าลูกศร back ในแอป — ห้ามออกจากแอปตอนอยู่หน้าลึก (อยู่ feed root ถึงออกได้ตามมาตรฐาน OS)
  - coach marks เล่นครั้งเดียวต่อการติดตั้ง — install เดิม sign in ซ้ำห้ามเด้งซ้ำ
- **เรื่องเงิน** อ้าง `docs/money-display-rules.md`: ราคาบนการ์ดแสดงใน details block รูปแบบ "THB ###,###"; ตัวเลขหลังไอคอน 👁 คือ **จำนวน view ไม่ใช่เงิน** ห้ามตีความเป็นสกุลเงิน
- **Variant dev harness** (รูปแบบการ์ด/ปุ่ม Ask/รายละเอียดทางเลือกของ prototype) = out of scope ไม่เขียน TC — เทสการ์ดรูปแบบ production เท่านั้น
- **สิ่งที่อยู่นอก scope** (มีเคสใน task อื่น — ห้ามทำซ้ำ): feed tabs/empty ต่อ tab (FO-TEST-02 SHELL-035–041), scroll-to-hide mechanics (SHELL-042–048), Post Viewer ทุก mode + Post Detail internals (FO-TEST-06), internals ของ comments/likes/share/save sheet (FO-TEST-07 — ที่นี่เช็คแค่ entry + เนื้อหาระดับผิว), chatroom internals (FO-TEST-08), report stack internals (FO-TEST-16), composer internals (FO-TEST-05), settings/prefs internals (FO-TEST-15), language/theme sweep เต็ม (FO-TEST-19)

## 1. Coverage Map ของ task นี้ (เทียบ inventory §2.2)

| Route/Feature (inventory §2.2) | TC ID ที่ครอบ |
|---|---|
| feed shell — tabs/seg-thumb/brand-menu/empty ต่อ tab | FO-TEST-02 (SHELL-035–041) — ยกเว้น snooze filter → FEED-073–075 |
| post card — head/photo/actions/liked-by/caption/details-toggle | FEED-001 – 008, 020 – 026 |
| post card — clip posts `[OPEN-CODE-ONLY]` | FEED-017 – 019 (ต้องมีโพสต์ clip จริง — SETUP-10; ไม่มีทางสร้าง = BLOCK) |
| post card — details inline + "View full detail" entry | FEED-020 – 026 |
| action `follow` `[GATE]` + uf sheet entry | FEED-027 – 031 |
| action `like` `[GATE]` | FEED-032 – 034 |
| action `comment` | FEED-035 – 038 |
| action `share` (sh sheet) `[GATE]` | FEED-039 – 041 |
| action `save` (sv sheet) `[GATE]` | FEED-042 – 045 |
| action `Ask` pill `[GATE]` | FEED-046 – 050 |
| action `liked-by` (lk sheet) `[OPEN-CODE-ONLY]` | FEED-051 – 053 (ต้องมีการ์ด F) |
| post menu — คนอื่น (pm) | FEED-054 – 059 |
| post menu — ของตัวเอง (pm-own) | FEED-060 – 067 (ต้องมีโพสต์ตัวเอง — SETUP-09) |
| feedback card `ni-card` `[OPEN-CODE-ONLY]` | FEED-068 – 070, 072 |
| feedback card `uncomf` `[OPEN-CODE-ONLY]` | FEED-071 |
| overlay `detail-open` / `pv-open` / sheet `ps`/`dt`/`mf` | FO-TEST-06/07/12 — ที่นี่เช็คเฉพาะ entry (FEED-025/026) + negative pv (FEED-011/012) |
| tag click `igd-tag` `[OPEN-CODE-ONLY]` + avatar/name → profile | FEED-076 – 078 (ต้องมีการ์ด G) |
| state flags (archived/ni/muted/blocked/favorite/pinned/noComments) | รวมในเคสที่เกี่ยว (057, 060–070) |
| filter → feed ว่าง (snooze) | FEED-073 – 075 |
| Language / theme / money display spot-check | FEED-079 – 082 (sweep เต็ม → FO-TEST-19) |

## 2. Test Cases

### 2.1 Post Card — Anatomy & Feed Content

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-FEED-001 | Sale card anatomy | MEMBER | UI | member อยู่ feed แท็บ All; เลือกการ์ด A แล้ว (SETUP-08) | 1. เลื่อนหาการ์ด A 2. ไล่ดูทุกส่วนบนการ์ดบนลงล่าง | — | head: avatar ring + ชื่อ seller + ปุ่ม "Follow" (ถ้ายังไม่ follow) + ปุ่ม ⋯; รูป + counter "1/N" + dots N จุด; actions: ♡ + 💬(+เลขถ้ามีคอมเมนต์) + 👁 +ตัวเลข view + share + ปุ่ม "Ask" + 🔖; แถว "Liked by …" (ถ้าโพสต์มี like); caption + "more"; เวลาโพสต์; **ไม่มีราคา/ป้าย FOR SALE/"Tap for details" จนกว่าจะกด more** | High | |
| FO-TC-FEED-002 | Showcase card anatomy | MEMBER | UI | อยู่ feed; เลือกการ์ด B แล้ว | 1. เลื่อนหาการ์ด B 2. กด "more" ใน caption แล้วดูใต้เวลา | — | head เหมือนการ์ดขาย; มีปุ่ม "Ask" เหมือนกัน; caption ขยายได้ แต่**ไม่มี "Tap for details"** โผล่ (showcase ไม่มี spec/ราคา); ถ้าเป็นรูปเดียวไม่มี counter/dots | High | |
| FO-TC-FEED-003 | การ์ด seller ที่ follow แล้ว | MEMBER | UI | feed มีการ์ด D (follow) + E (ไม่ follow) | 1. เทียบ head ของการ์ด D กับ E | — | การ์ด D (follow แล้ว) **ไม่มี**ปุ่ม "Follow" บน head; การ์ด E มีปุ่ม "Follow" | Medium | |
| FO-TC-FEED-004 | Feed ลิสต์ + pull-to-refresh | MEMBER | Func | member อยู่ feed บนสุด | 1. จำการ์ดแรกสุด 2. เลื่อนลงจนสุดลิสต์ 3. กลับบนสุดแล้วดึงจอลง (pull) ด้วยนิ้วจนสุดแล้วปล่อย | มาตรฐาน feed app: feed เรียงโพสต์ล่าสุดไว้บนสุดตั้งแต่เปิด (newest first); เลื่อนลงสุด → โหลดโพสต์เก่าต่อ (pagination) หรือลิสต์จบสะอาด; ดึงลงที่บนสุด → **ต้องมี pull-to-refresh**: indicator หมุนแล้ว feed โหลดข้อมูลใหม่ (โพสต์ใหม่เข้ามาอยู่บน/ลำดับเปลี่ยนตามข้อมูลล่าสุด) — ไม่มี PTR = FAIL ตาม spec | indicator แสดงระหว่าง refresh; ท้ายลิสต์ไม่มี skeleton/spinner ค้าง ไม่ error | Medium | |
| FO-TC-FEED-005 | views-stat ≠ เงิน | MEMBER | UI | อยู่ feed | 1. ดูตัวเลขหลังไอคอน 👁 ของการ์ดหลายใบ | — | แสดงจำนวน view (เช่น "980", "1.2K") — ไม่มี "THB" ไม่ format เป็นเงิน (อ้าง money-display-rules §views) | Medium | |
| FO-TC-FEED-006 | การ์ดบน guest | GUEST | UI | guest อยู่ feed (SETUP-03) | 1. ดูการ์ด A ทั้งใบเทียบตอนเป็น member | render เหมือน member ทุกส่วน (Follow / Ask / 🔖 ยังแสดง) — gate เกิดตอนแตะเท่านั้น ไม่ใช่ตอน render | เหมือน FEED-001 | Medium | |
| FO-TC-FEED-007 | post-time แปลไทย | MEMBER | UI | lang=TH (Settings → Language → ไทย) | 1. ดูเวลาใต้ caption ของการ์ดหลายใบ | เวลาแสดงภาษาไทยตามอายุโพสต์จริง เช่น "3 วันที่แล้ว" / "11 ชั่วโมงที่แล้ว" | ตัวหนังสือไทย ไม่เหลือ "ago" | Medium | |
| FO-TC-FEED-008 | caption short + hashtag | MEMBER | UI | อยู่ feed ที่การ์ด G (caption ยาว + hashtag) | 1. อ่าน caption ก่อนกด 2. แตะ "more" | ก่อนกด = บรรทัดแรก + " more"; กด more → caption เต็มหลายบรรทัด + hashtag เป็นสีลิงก์แตะได้ | hashtag เป็นสี accent | Medium | |

### 2.2 Media Carousel ในการ์ด (กติกาบังคับ: ไม่เปิด Post Viewer)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-FEED-009 | ตัวบอกรูปหลายใบ | MEMBER | UI | อยู่ feed | 1. ดูการ์ด A (≥2 รูป) เทียบการ์ด B (รูปเดียว) | — | การ์ด A: counter "1/N" มุมขวาบนของรูป + dots N จุดใต้รูป (จุดแรกเข้ม); การ์ด B: ไม่มี counter/dots | High | |
| FO-TC-FEED-010 | แตะครึ่งซ้าย/ขวาของรูป | MEMBER | Func | อยู่ feed ที่การ์ด A | 1. แตะครึ่งขวาของรูปด้วยนิ้ว 2. แตะขวาซ้ำจนครบรอบ 3. แตะครึ่งซ้าย | แตะครึ่งขวา → รูปถัดไป, ครึ่งซ้าย → ก่อนหน้า; index วนรอบ (สุดท้าย → แรก) — เปลี่ยนเฉพาะในการ์ดเดิม | counter 1/N→2/N→…→วน; dot เข้มย้ายตาม | High | |
| FO-TC-FEED-011 | **กติกาบังคับ — แตะ media ไม่เปิด Post Viewer** | MEMBER | Func | อยู่ feed ที่การ์ด A | 1. แตะรูปหลายครั้งทั้งซ้าย/ขวา 2. แตะรูปของการ์ด B (รูปเดียว) ด้วย | Post Viewer **ต้องไม่เปิดเลย** — เกิดแค่เปลี่ยนรูปในการ์ด (หลายรูป) หรือไม่เกิดอะไร (รูปเดียว); ถ้า viewer/หน้าใหม่เด้ง = FAIL | ไม่มี immersive viewer/หน้าใหม่เด้ง — การ์ดอยู่ที่เดิม | High | |
| FO-TC-FEED-012 | **กติกาบังคับ — ลาก media ไม่เปิด Post Viewer** | MEMBER | Func | อยู่ feed ที่การ์ด A | 1. กดค้างรูปลากไปซ้ายด้วยนิ้วแล้วปล่อย 2. ลากซ้ำอีกครั้ง | ลากผ่านเกณฑ์ (design ~64px หรือ ~20% ความกว้าง) → slide เปลี่ยน; หลังปล่อยนิ้วไม่มี viewer เปิด | counter เปลี่ยนตาม slide; viewer ไม่เปิดทั้งสองครั้ง | High | |
| FO-TC-FEED-013 | ลากไม่ถึงเกณฑ์ | MEMBER | Edge | อยู่ feed ที่การ์ด A | 1. กดค้างรูปลากซ้ายนิด ๆ แล้วปล่อย | ระหว่างลากรูปขยับตามนิ้ว; ปล่อย → เด้งกลับ index เดิม (ไม่เปลี่ยน slide) | counter เดิม; รูปสแนปกลับ | Medium | |
| FO-TC-FEED-014 | rubber-band ต้น/ท้าย | MEMBER | Edge | อยู่ feed ที่การ์ด A slide แรก | 1. ลากรูปไปขวา (พยายามเลยขอบแรก) 2. ไป slide สุดท้ายแล้วลากซ้าย | ที่ขอบแรก/ขอบท้ายรูปขยับตามแบบต้าน ๆ (rubber-band); ปล่อย → เด้งกลับ ไม่ wrap ตอนลาก | index ไม่เปลี่ยน | Low | |
| FO-TC-FEED-015 | รูปเดียว — แตะ/ลากไม่ทำอะไร | MEMBER | Edge | อยู่ feed ที่การ์ด B (รูปเดียว) | 1. แตะรูปซ้าย/ขวา 2. ลากซ้ายขวา | ไม่เปลี่ยนรูป และไม่เปิด viewer | การ์ดนิ่ง | Medium | |
| FO-TC-FEED-016 | gesture แนวตั้งชนะ | MEMBER | Edge | อยู่ feed ที่การ์ด A | 1. กดค้างบนรูปแล้วลากแนวตั้ง (เหมือนจะเลื่อนฟีด) | ลากแนวตั้ง → รูปไม่ translate; feed เลื่อนปกติ | รูปไม่ลากตาม ฟีดเลื่อน | Medium | |

### 2.3 Clip Posts — ต้องมีการ์ด clip บน feed (SETUP-10); ถ้าแอปจริงสร้าง/หาไม่ได้ mark BLOCK ทั้งกลุ่ม

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-FEED-017 | clip card UI | MEMBER | UI | โพสต์ clip อยู่บน feed (SETUP-10) | 1. ดูการ์ด clip | — | badge ▶"0:NN" (เวลาจริงของ clip) มุมรูป + แถบ progress บาง ๆ ใต้รูป; counter/dots ตามจำนวน media | Medium | |
| FO-TC-FEED-018 | clip autoplay ตาม visibility | MEMBER | Func | การ์ด clip บน feed | 1. เลื่อนให้การ์ดเข้าเฟรมเกินครึ่ง 2. เลื่อนผ่านจนเห็นน้อยลง 3. เลื่อนกลับ | design: เห็น ≥~55% → เล่นเอง (badge นับเวลาถอยหลัง + แถบ progress เดิน); เห็นน้อยกว่า → หยุดค้าง; กลับมา → เล่นต่อจากจุดเดิม; ครบเวลา → วนใหม่| badge นับลง + แถบขยับ; หยุด/ต่อตามมุมมอง | Medium | |
| FO-TC-FEED-019 | clip ถูกบัง / slide อื่น | MEMBER | Edge | การ์ด clip (มี ≥2 media: clip+รูป) บน feed | 1. แตะ avatar → เปิด profile ทับ feed 2. back กลับ 3. swipe ไป slide รูปถ่าย | ตอนถูกหน้าอื่นบัง clip หยุด; กลับมาเล่นต่อ; slide ที่เป็นรูปถ่ายไม่มี badge/progress | pause/resume ตาม overlay; badge ตาม slide | Low | |

### 2.4 Details Inline ("Tap for details")

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-FEED-020 | more → เผย toggle | MEMBER | Func | อยู่ feed ที่การ์ด A | 1. แตะ "more" ใน caption | caption ขยายเต็ม → ปุ่ม "Tap for details ⌄" โผล่ใต้เวลา (ก่อน expand ปุ่มนี้ถูกซ่อน) | ปุ่มเส้นบรรจบซ้าย-ขวาโผล่ | High | |
| FO-TC-FEED-021 | เปิด details block | MEMBER | Func | caption การ์ด A expand แล้ว | 1. แตะ "Tap for details" | กล่อง spec เปิดในการ์ด + label เปลี่ยน "Hide details" | บรรทัดแรก = ราคา "THB ###,###" แดง + "View full detail ›"; ตามด้วยกลุ่ม "Watch Specifications" + "Item Details" แบบ label:value; ตาม design กลุ่ม "Price & Data Source" ไม่แสดงในกล่องนี้ — แสดง = FAIL | High | |
| FO-TC-FEED-022 | ปิด details + เปิดได้ทีละการ์ด | MEMBER | Func | details การ์ด A เปิดอยู่ | 1. แตะ "Hide details" 2. เปิด details การ์ด A แล้วไปเปิดของการ์ดขายอื่น | กดซ้ำ = หุบ label กลับ "Tap for details"; เปิดการ์ดใหม่ → กล่องของการ์ดเดิมปิดอัตโนมัติ | details เปิดได้ทีละ 1 การ์ดทั้ง feed | Medium | |
| FO-TC-FEED-023 | แตะ caption ที่ expand → ยุบทั้งคู่ | MEMBER | Func | การ์ด A: caption expanded + details เปิด | 1. แตะบริเวณข้อความ caption (ไม่โดน hashtag/ปุ่ม) | caption ยุบกลับบรรทัดเดียว + กล่อง details ปิดตาม | cap-full ซ่อน; details หาย | Medium | |
| FO-TC-FEED-024 | showcase ไม่มี toggle | MEMBER | Func | อยู่ feed ที่การ์ด B | 1. แตะ "more" ของการ์ด B | caption ขยายตามปกติ แต่ไม่มี "Tap for details" โผล่ | ไม่มีปุ่ม details | Medium | |
| FO-TC-FEED-025 | "View full detail" → Post Detail | MEMBER | Func | details การ์ด A เปิดอยู่ | 1. แตะ "View full detail ›" 2. กด back ในแอปกลับ 3. (Android) เปิดอีกครั้งแล้วกด back ของเครื่อง | หน้า Post Detail เด้งเต็มจอทับ feed; back ในแอปกลับ feed ที่เดิม; device back (Android) ต้องเทียบเท่า back ในแอป — ห้ามออกจากแอป (กติกาล็อก) | detail page เต็มจอ; feed เผยข้างล่างเมื่อ back | High | |
| FO-TC-FEED-026 | entry เดียวกันบน guest | GUEST | Func | guest อยู่ feed ที่การ์ด A, expand+เปิด details แล้ว | 1. แตะ "View full detail ›" | "View full detail" ไม่อยู่ใน gate → detail เปิดได้ฟรี | เหมือน FEED-025 | Medium | |

### 2.5 Follow Seller `[GATE]`

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-FEED-027 | Follow — guest [GATE] | GUEST | Func | guest อยู่ feed ที่การ์ด E | 1. แตะ "Follow" บน head การ์ด 2. แตะ scrim/"Skip for now" ปิด sheet | Member Sheet "Join TukDaeng" เด้ง; ไม่มีการ follow จริง | sheet ทับ feed; ปิดแล้วปุ่มยัง "Follow" | High | |
| FO-TC-FEED-028 | Follow — member | MEMBER | Func | อยู่ feed ที่การ์ด E (ยังไม่ follow seller) | 1. แตะ "Follow" | follow จริง → ปุ่ม flip เป็น "Following" ใน place | ปุ่มเปลี่ยน label/สไตล์เป็น Following | High | |
| FO-TC-FEED-029 | Follow → เข้าแท็บ Following | MEMBER | Int | follow seller ของการ์ด E แล้ว | 1. แตะแท็บ "Following" | การ์ดของ seller ที่เพิ่ง follow โผล่ในแท็บ Following ร่วมกับการ์ด follow เดิม | Following tab มีการ์ด E | Medium | |
| FO-TC-FEED-030 | Unfollow ผ่านปุ่ม "Following" + uf sheet | MEMBER | Func | กำลัง follow seller การ์ด E (ปุ่มแสดง Following) | 1. แตะ "Following" 2. sheet เด้ง → แตะ "Unfollow" 3. (ทำซ้ำ) เปิด sheet แล้วแตะ "Cancel" | sheet ยืนยัน "Unfollow @{seller}?"; ยืนยัน → toast "Unfollowed" + ปุ่มกลับ "Follow"; Cancel → ปิดเฉย ๆ ยัง follow อยู่ | toast ลอย ~2 วิ; ปุ่มกลับ "Follow" | High | |
| FO-TC-FEED-031 | Unfollow ล้าง favorite+mute | MEMBER | Edge | follow + Add to favorites seller การ์ด E แล้ว (ผ่าน ⋯) | 1. แตะ "Following" → "Unfollow" 2. เปิดแท็บ Favorites 3. เปิด ⋯ เมนูการ์ด E | unfollow ล้าง favorite+mute ด้วย → โพสต์ออกจากแท็บ Favorites; เมนู ⋯ ไม่มีแถว favorites อีก | Favorites tab หายการ์ดนั้น; เมนูเหลือ NI/Report | Medium | |

### 2.6 Like `[GATE]`

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-FEED-032 | Like — guest [GATE] | GUEST | Func | guest อยู่ feed ที่การ์ด A | 1. แตะ ♡ | ปุ่ม like อยู่ใน gate → Member Sheet เด้ง; ไม่เกิดการ like | sheet เด้ง; หัวใจยังโบก | High | |
| FO-TC-FEED-033 | Like — member toggle | MEMBER | Func | อยู่ feed ที่การ์ด A | 1. แตะ ♡ 2. แตะ ♡ ซ้ำ | like toggle on/off ได้เรื่อย ๆ; ตาม design การ์ดคนอื่นไม่มีตัวเลขกำกับหัวใจ (มีเฉพาะโพสต์ตัวเอง) | หัวใจเติมสี ↔ โบก | High | |
| FO-TC-FEED-034 | like ค้างข้าม surface | MEMBER | Int | like การ์ด A แล้ว | 1. เปิด detail การ์ด A (more → Tap for details → View full detail) 2. unlike บนหน้า detail 3. back กลับ feed | สถานะ like ซิงก์ทั้งสองชั้น — like บน feed แสดง liked บน detail และกลับกัน | หัวใจตรงกันทั้งการ์ดกับ detail | Medium | |

### 2.7 Comment

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-FEED-035 | เลขบนไอคอน comment | MEMBER | UI | อยู่ feed; เทียบการ์ดที่มีคอมเมนต์กับโพสต์ตัวเองที่เพิ่งสร้าง (comments=0, SETUP-09) | 1. ดู 💬 ของทั้งสองการ์ด | — | โพสต์ที่มีคอมเมนต์ → เลขจำนวนต่อท้ายไอคอน; comments=0 → ไอคอนล้วน | Low | |
| FO-TC-FEED-036 | เปิด comments sheet — member | MEMBER | Func | อยู่ feed ที่การ์ดที่มีคอมเมนต์ | 1. แตะ 💬 | sheet "Comments" เด้ง | รายการคอมเมนต์จริง (หรือข้อความว่าง), แถว emoji ลัด, ช่อง "Add a comment..." | High | |
| FO-TC-FEED-037 | comments sheet — guest อ่านได้ แตะเขียนไม่ได้ | GUEST | Func | guest อยู่ feed ที่การ์ดที่มีคอมเมนต์ | 1. แตะ 💬 → sheet เปิด อ่านรายการ 2. แตะช่อง "Add a comment..." 3. ปิดเปิดใหม่ แตะ ♡ ข้างคอมเมนต์ / emoji row / "Reply" | ปุ่มเปิด sheet ไม่อยู่ใน gate → อ่านได้ฟรี; ทุก input control (ช่องพิมพ์/emoji/like คอมเมนต์/Reply) → Member Sheet เด้งแทน | อ่านคอมเมนต์ได้; ทุกจุดเขียน → "Join TukDaeng" | High | |
| FO-TC-FEED-038 | comment sheet ว่าง | OWNER | Edge | โพสต์ตัวเองบน feed (comments=0, SETUP-09) | 1. แตะ 💬 การ์ดตัวเอง | sheet เปิดพร้อมสถานะว่าง | "No comments yet / ยังไม่มีความคิดเห็น" | Low | |

### 2.8 Share `[GATE]`

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-FEED-039 | Share — guest [GATE] | GUEST | Func | guest อยู่ feed | 1. แตะไอคอน share (↗) ใต้รูป | share อยู่ใน gate → Member Sheet เด้ง; share sheet ไม่เปิด | sheet เด้ง | High | |
| FO-TC-FEED-040 | share sheet layout — member | MEMBER | Func | อยู่ feed ที่การ์ด A | 1. แตะ share | เปิด share sheet ในแอปตาม design: ช่อง "Search", grid เพื่อน, แถวแอป Messenger / Direct / LINE / Facebook / "Copy link" — ต้องเป็น sheet ในแอปเพราะต้องรองรับ send-to-friend (FEED-041); ถ้าเปิด share sheet ของระบบ (OS) แทน = FAIL/gap เพราะส่งให้เพื่อนในแอปไม่ได้ | sheet เด้งจากล่าง | Medium | |
| FO-TC-FEED-041 | ส่งให้เพื่อน / แอป / copy | MEMBER | Func | share sheet เปิด | 1. แตะเพื่อนคนหนึ่ง → เปิดแท็บ Chat ดูห้องกับคนนั้น 2. เปิด share ใหม่ → แตะ "LINE" 3. เปิดใหม่ → แตะ "Copy link" แล้วลองวางที่อื่น | เพื่อน → ปิด sheet + toast "Sent to {ชื่อ}" และ**โพสต์ต้องโผล่ในห้องแชทกับเพื่อนคนนั้นจริง** (การ์ดโพสต์เป็น message ล่าสุด — เปิด Chat เช็ก; toast เฉย ๆ แล้วไม่ส่ง = FAIL); แอป → เปิดแอปนั้นพร้อมลิงก์ผ่าน OS share (prototype แสดง toast "Shared to {app}" แทน — ข้อจำกัดของ prototype); copy → toast "Link copied" + ลิงก์วางได้จริง | toast ลอยล่างจอ ~2 วิ; ห้องแชทมีการ์ดโพสต์ที่ส่ง | Medium | |

### 2.9 Save `[GATE]` (sv sheet)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-FEED-042 | Save — guest [GATE] | GUEST | Func | guest อยู่ feed | 1. แตะ bookmark 🔖 | save อยู่ใน gate → Member Sheet เด้ง | sheet เด้ง | High | |
| FO-TC-FEED-043 | save โพสต์ที่ยังไม่ save | MEMBER | Func | อยู่ feed ที่การ์ดที่ยังไม่ save | 1. แตะ 🔖 | save สำเร็จ → icon เติม + save sheet เปิด | sheet: แถวหัว "Saved / Private" + ส่วน Collections (รายการของบัญชีจริง — ถ้าไม่เคยสร้าง = เห็นแค่ "New collection") + "New collection" | High | |
| FO-TC-FEED-044 | เลือก collection | MEMBER | Func | save sheet เปิดอยู่ (มี collection อย่างน้อย 1 อัน — สร้างผ่าน "New collection" ถ้ายังไม่มี) | 1. แตะ collection ที่ต้องการ | โพสต์เข้า collection → ปิด sheet + toast "Saved to {ชื่อ collection}" | toast ลอย; icon ยังเติม | Medium | |
| FO-TC-FEED-045 | เอาออกจาก saved | MEMBER | Func | โพสต์อยู่ใน collection แล้ว | 1. แตะ 🔖 (sheet เปิด ไม่ unsave ทันที) 2. แตะแถว "Saved" บนสุด | เลือก "Saved" → unsave → toast "Removed from your saved" + icon โบกลง | sheet ปิด; bookmark ว่าง | Medium | |

### 2.10 Ask Seller `[GATE]`

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-FEED-046 | Ask — guest [GATE] | GUEST | Func | guest อยู่ feed ที่การ์ด A | 1. แตะปุ่ม "Ask" | Ask อยู่ใน gate → Member Sheet เด้ง; ไม่เข้า chat | sheet เด้ง | High | |
| FO-TC-FEED-047 | Ask → chatroom (sale) | MEMBER | Func | อยู่ feed ที่การ์ด A | 1. แตะ "Ask" | เข้าห้องแชทกับ seller (สร้าง/หา thread เดิม) — ออกจาก feed | ห้องแชทมีการ์ด item (รูป+caption+ราคา) ปักหัว + ช่องพิมพ์มีข้อความตั้งต้นรอส่ง | High | |
| FO-TC-FEED-048 | Ask บนการ์ด showcase | MEMBER | Func | อยู่ feed ที่การ์ด B | 1. แตะ "Ask" ของการ์ด B | showcase ก็มี Ask → เข้าห้องแชทเหมือนกัน; item card ไม่มีบรรทัดราคา | chatroom เปิดปกติ | Medium | |
| FO-TC-FEED-049 | Ask ซ้ำโพสต์เดิม | MEMBER | Edge | เคย Ask การ์ด A แล้วกลับ feed | 1. แตะ "Ask" ของการ์ด A อีกครั้ง | เปิดห้องเดิมกับ seller เดิม — ไม่สร้างแชทซ้ำใน chat list | ห้องเดิมเปิด | Medium | |
| FO-TC-FEED-050 | Ask seller ที่ block แล้ว | MEMBER | Edge | block seller การ์ด A ไว้ก่อน (เปิด profile เขา → ⋯ → Block — flow อยู่ FO-TEST-16) | 1. พยายาม Ask seller ที่ block (เปิดโพสต์ผ่าน detail หรือช่องทางที่เข้าถึงได้) | toast "Cannot message a blocked account" — ไม่เปิดห้องแชท | toast เตือนแทนห้องแชท| Low | |

### 2.11 Liked-by → Likes Sheet (lk)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-FEED-051 | เปิด likes sheet | MEMBER | Func | อยู่ feed ที่การ์ด F (มีแถว Liked by) | 1. แตะแถว "Liked by …" 2. ใน sheet แตะชื่อ/avatar liker | liked-by ไม่ถูก gate → sheet "Likes" เปิด; แตะ liker → เปิด profile ของเขา | sheet: note "Only {seller} can see the total number of likes on this post." (เพราะไม่ใช่โพสต์เรา) + รายชื่อ likers + ปุ่ม "Follow" ท้ายแถว | Medium | |
| FO-TC-FEED-052 | Follow ใน lk sheet ต้อง follow จริง | MEMBER | Func | likes sheet เปิดอยู่ (การ์ด F) | 1. แตะ "Follow" ของ liker 2. ออกจาก sheet เปิดโพสต์/โปรไฟล์ของ liker คนนั้น หรือแท็บ Following ตรวจสถานะจริง | กด Follow ต้อง follow จริง: ปุ่ม flip เป็น "Following" + สถานะจริงตามมา (head การ์ด/โปรไฟล์ของ liker แสดง Following หรือโพสต์เขาเข้าแท็บ Following); ถ้า flip เฉพาะใน sheet แต่ไม่ได้ follow จริง = **FAIL เป็น bug** (prototype เคยเป็น visual-only quirk — แอปจริงต้องทำงานจริง) | ปุ่ม flip + สถานะ follow จริงยืนยันได้นอก sheet | Medium | |
| FO-TC-FEED-053 | lk sheet — guest | GUEST | Func | guest อยู่ feed ที่การ์ด F | 1. แตะ "Liked by…" → sheet เปิด 2. แตะ "Follow" ในแถว liker | เปิด sheet อ่านรายชื่อได้ฟรี; กด Follow → Member Sheet เด้ง | อ่านได้ กด follow ไม่ได้ | Medium | |

### 2.12 Post Menu (⋯) — โพสต์คนอื่น

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-FEED-054 | ⋯ — guest [GATE] | GUEST | Func | guest อยู่ feed ที่การ์ด A | 1. แตะ ⋯ บน head การ์ด | ⋯ อยู่ใน gate → Member Sheet เด้ง; เมนูไม่เปิด | sheet เด้ง | High | |
| FO-TC-FEED-055 | เมนูโพสต์ที่ยังไม่ follow | MEMBER | Func | อยู่ feed ที่การ์ด E (ยังไม่ follow) | 1. แตะ ⋯ 2. แตะ scrim ปิด | เมนูกลุ่มเดียว: "Not interested" + "Report"(แดง) — ไม่มีแถว favorites; แตะพื้นมืดปิดได้ | sheet การ์ดเดียว | High | |
| FO-TC-FEED-056 | เมนูโพสต์ที่ follow แล้ว | MEMBER | Func | อยู่ feed ที่การ์ด D (follow อยู่) | 1. แตะ ⋯ | เมนู 2 กลุ่ม: "Add to favorites" + "Not interested" / "Report" | เมนู 2 กลุ่ม | High | |
| FO-TC-FEED-057 | Add/Remove favorites | MEMBER | Func | ⋯ เมนูการ์ด D เปิด | 1. แตะ "Add to favorites" 2. เปิด ⋯ ใหม่ 3. แตะ "Remove from favorites" 4. ดูแท็บ Favorites ระหว่างขั้น | add → toast "Added to favorites" + การ์ดโผล่ในแท็บ Favorites; เมนูเปิดใหม่ = "Remove from favorites" (ดาวเต็ม); remove → toast + หายจากแท็บ | toast ตาม action; label สลับตาม state | High | |
| FO-TC-FEED-058 | Report — entry | MEMBER | Func | ⋯ เมนูการ์ด A เปิด | 1. แตะ "Report" | หน้ารายงาน (เลือกเหตุผล) เด้งเต็มจอ — เมนูปิดไปพร้อมกัน (flow ละเอียดอยู่ FO-TEST-16) | หน้า report เลื่อนทับ | Medium | |
| FO-TC-FEED-059 | Not interested → ni-card | MEMBER | Func | ⋯ เมนูการ์ด E เปิด | 1. แตะ "Not interested" | การ์ดถูกแทนด้วย feedback card (sheet ปิด) | "Thanks for your feedback" + ปุ่ม "Undo" + "We'll suggest fewer posts like this." + แถว "Manage content preferences" (เพราะไม่ follow) + "This post made me uncomfortable" | High | |

### 2.13 Post Menu (⋯) — โพสต์ตัวเอง (OWNER — ต้องมีโพสต์ตัวเองบน feed, SETUP-09)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-FEED-060 | การ์ดตัวเอง anatomy + เมนู | OWNER | UI | โพสต์ตัวเองอยู่บน feed | 1. ดู head การ์ดตัวเอง 2. แตะ ⋯ | การ์ดตัวเองไม่มี Follow/Ask; เมนู: "Archive" / "Turn off commenting" / "Edit" / "Pin to top of grid" / "Delete"(แดง) — ตาม design โพสต์ธรรมดา **ไม่มี** "Mark as sold" / Report / Not interested (เมนูต้องครบ 5 แถวนี้เท่านั้น — เพิ่ม/ขาดแถว = FAIL) | เมนู 5 แถว | High | |
| FO-TC-FEED-061 | **กติกาบังคับ — เมนูเจ้าของ vs คนอื่นต่างกัน** | OWNER | Func | feed มีทั้งการ์ดตัวเองและการ์ดคนอื่น | 1. เปิด ⋯ การ์ดตัวเอง จำรายการ 2. ปิด 3. เปิด ⋯ การ์ด E เทียบ | เมนูสองชุดต่างกันชัด — ตัวเอง = Archive/Commenting/Edit/Pin/Delete; คนอื่น = (Add to favorites)/Not interested/Report | ไม่มีรายการซ้ำกัน | High | |
| FO-TC-FEED-062 | Archive | OWNER | Func | ⋯ เมนูโพสต์ตัวเองเปิด | 1. แตะ "Archive" | การ์ดหายจาก feed ทันที + toast "Post archived" (กู้ได้ผ่านหน้า Archive — FO-TEST-14) | การ์ดหาย + toast | High | |
| FO-TC-FEED-063 | Turn off/on commenting | OWNER | Func | ⋯ เมนูเปิด | 1. แตะ "Turn off commenting" → ดูการ์ด 2. ⋯ → "Turn on commenting" | off → 💬 หายจากการ์ด + toast "Commenting turned off"; on → ปุ่มกลับ + toast "Commenting turned on" | 💬 หาย/กลับบนการ์ด | Medium | |
| FO-TC-FEED-064 | Edit — entry | OWNER | Func | ⋯ เมนูเปิด | 1. แตะ "Edit" | หน้า composer โหมดแก้ไขเปิด พร้อมข้อมูลเดิมของโพสต์ (internals → FO-TEST-05) | composer prefilled เด้ง | Medium | |
| FO-TC-FEED-065 | Pin to top of grid | OWNER | Func | ⋯ เมนูเปิด (pin ยังไม่ถึง 3) | 1. แตะ "Pin to top of grid" | feedback 2 ชั้น: pill "Pinning..." → toast "Your post has been pinned"; เมนูครั้งถัดไปเป็น "Unpin from grid" (ผลบน grid อยู่ profile — FO-TEST-12) | pill+toast ตามลำดับ | Medium | |
| FO-TC-FEED-066 | Pin limit 3 | OWNER | Edge | pin ไว้ครบ 3 โพสต์แล้ว (ต้องมีโพสต์ตัวเอง ≥4 — สร้างผ่าน composer หรือบัญชีเทสที่มีอยู่แล้ว; ทำไม่ได้ → mark BLOCK) | 1. ⋯ โพสต์ที่ 4 → "Pin to top of grid" 2. แตะ "Cancel" → ทำใหม่แล้วแตะ "Confirm" | dialog "Pin limit reached" (กลางจอ): Confirm → pin แทนตัวเก่าสุด; Cancel → ไม่เปลี่ยน | dialog กลางจอ | Low | |
| FO-TC-FEED-067 | Delete | OWNER | Func | ⋯ เมนูเปิด | 1. แตะ "Delete" 2. dialog → "Cancel" → เปิดใหม่ → "Delete" | dialog "Delete post? This post will be permanently deleted."; Cancel → อยู่; Confirm → ลบถาวรหายจาก feed | การ์ดหายหลังยืนยันเท่านั้น | High | |

### 2.14 Feedback Cards (ni-card / uncomf)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-FEED-068 | ni-card — Manage content preferences | MEMBER | Func | การ์ด E กลายเป็น ni-card แล้ว (FEED-059) | 1. แตะ "Manage content preferences" | หน้า Content preferences เด้ง (หน้าเดียวกับที่มี toggle Snooze — SETUP-07) | prefs page (เชื่อม FO-TEST-15) | Medium | |
| FO-TC-FEED-069 | ni-card — follow อยู่: Mute/Unfollow | MEMBER | Func | NI โพสต์ของการ์ด D (follow อยู่) | 1. ⋯ → "Not interested" 2. แตะ "Unfollow {seller}" 3. (ทำซ้ำบน seller follow อื่น) แตะ "Mute {seller}" → dialog → "Mute posts" | ni-card ของคนที่ follow แสดงแถว "Mute {seller}" + "Unfollow {seller}"; Unfollow → การ์ดหาย + toast "Unfollowed"; Mute → dialog → "Mute posts" → โพสต์ seller นั้นหายจาก feed | ni-card แสดง 2 แถวตาม follow state | High | |
| FO-TC-FEED-070 | Undo บน ni-card | MEMBER | Func | ni-card แสดงอยู่ | 1. แตะ "Undo" | การ์ดโพสต์ปกติกลับมาเดิม | การ์ดเดิมกลับ | Medium | |
| FO-TC-FEED-071 | uncomf card | MEMBER | Func | ni-card แสดงอยู่ | 1. แตะ "This post made me uncomfortable" 2. แตะ "Report" / "Undo" | การ์ดเปลี่ยนเป็น ack: เช็คใหญ่ + "Thanks for letting us know" + คำอธิบาย Community Standards + ปุ่ม Report(แดง)/Undo; Report → หน้ารายงาน; Undo → กลับสถานะก่อนหน้า | ack card + 2 ทางเลือก | Medium | |
| FO-TC-FEED-072 | ni-card ไม่โผล่บน guest | GUEST | Edge | guest อยู่ feed | 1. ลองหาทางกด "Not interested" | ⋯ ถูก gate → guest เข้าไม่ถึง NI เลย ไม่มี ni-card บน session guest | — | Low | |

### 2.15 Filter → Feed ว่าง (Snooze — ผ่าน Content preferences)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-FEED-073 | snooze on — member | MEMBER | Func | member อยู่ feed; เปิด Content preferences (SETUP-07) | 1. เปิด toggle "Snooze suggested posts in feed" 2. back กลับ feed แท็บ All | feed เหลือเฉพาะโพสต์ของคนที่ follow — เทียบแท็บ Following หน้าตาเดียวกัน | การ์ดคนไม่ follow หายหมด | Medium | |
| FO-TC-FEED-074 | snooze → feed ว่าง (NEW) | NEW | Func | session NEW (follow 0 คน, SETUP-05) + เปิด prefs | 1. เปิด snooze 2. back กลับ feed | snooze เหลือเฉพาะโพสต์ของคนที่ follow + NEW follow 0 คน → feed ว่าง; empty state **ต้องแสดงข้อความตรงบริบท** = ชุดเดียวกับแท็บ Following (icon users + "Follow others to see their posts here / ติดตามผู้อื่นเพื่อดูโพสต์ของพวกเขาที่นี่"); ถ้าโชว์ข้อความ favorites ("No favorites yet / ยังไม่มีรายการโปรด") = **FAIL copy bug** (ข้อความผิดบริบท) | icon users + ข้อความ Following-style | Medium | |
| FO-TC-FEED-075 | snooze off คืนค่า | MEMBER | Func | snooze เปิดอยู่ | 1. ปิด toggle 2. back กลับ feed | feed กลับแสดงโพสต์ครบเหมือนเดิม | feed เต็ม | Medium | |

### 2.16 Hashtag + Profile Entry (ไม่ gate)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-FEED-076 | แตะ hashtag — member+guest | MEMBER + GUEST | Func | caption การ์ด G expand แล้ว (hashtag อยู่ใน cap-full) | 1. แตะ hashtag ใน caption | หน้า Search results เด้งเต็มจอ (ค้นหา hashtag นั้น) — ใช้ได้ทั้ง member/guest ไม่มี gate | หน้า search results | Medium | |
| FO-TC-FEED-077 | avatar/ชื่อ → profile — member | MEMBER | Func | อยู่ feed ที่การ์ด A | 1. แตะ avatar วงแหวน → back 2. แตะชื่อ seller → back 3. แตะชื่อ seller ตัวหน้าหน้า caption → back | ทั้ง 3 จุดเปิด public profile ของ seller เด้งทับ feed | public profile เด้ง | High | |
| FO-TC-FEED-078 | avatar/ชื่อ → profile — guest | GUEST | Func | guest อยู่ feed ที่การ์ด A | 1. แตะ avatar หรือชื่อ seller | profile เปิดฟรี — ไม่มี Member Sheet | เหมือน FEED-077 | Medium | |

### 2.17 Language / Theme / Money — Spot-check (sweep เต็ม → FO-TEST-19)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-FEED-079 | การ์ดภาษาไทย | MEMBER | UI | lang=TH (SETUP-07) | 1. ดูการ์ด A ครบทุก label | label UI เป็นไทย: "ติดตาม", "สอบถาม", "ถูกใจโดย … และคนอื่น ๆ", "เพิ่มเติม", "…ที่แล้ว", "แตะเพื่อดูรายละเอียด"/"ซ่อนรายละเอียด"; ชื่อ seller/ราคา/hashtag/caption content คงเดิม | ไม่มี label UI เหลือเป็น EN บนการ์ด | Medium | |
| FO-TC-FEED-080 | การ์ดธีม Light | MEMBER | UI | สลับธีม Light ผ่าน Settings ในแอป (SETUP-07) หรือธีมระบบ | 1. ดูการ์ด A + เปิด ⋯ เมนู + comments sheet | การ์ด/sheet/dialog อ่านง่ายบนพื้นสว่าง — contrast ปกติทุกจุด | ไม่มีจุดจางหาย | Low | |
| FO-TC-FEED-081 | เงินบนการ์ด vs views | MEMBER | UI | อยู่ feed ที่การ์ด A, details เปิด | 1. ดูบรรทัดราคาในกล่อง details 2. เทียบตัวเลข views | ราคาแสดง "THB ###,###" ตัวแดงหนาตาม format สกุลเงิน; views เป็นจำนวนนับ ไม่ถูก format เป็นเงิน — สองอย่างแยกกันชัด | "THB …" แดงใน details-top | Medium | |
| FO-TC-FEED-082 | toast/pill รวมของ module | MEMBER | UI | ทำเคสอื่น ๆ มาก่อน | 1. สังเกต toast/pill ที่เด้งจากเคสก่อน ๆ | toast ล่างจอ ~2 วิ แล้วหายเอง; pin มี 2 ชั้น: pill "Pinning..." → toast "Your post has been pinned" | consistent | Low | |

## 3. หมายเหตุ / OPEN items (สำหรับเทสแอปจริง)

- **การ์ดตัวอย่างแทน mock** — ฉบับ prototype อ้างการ์ด mock 11 ใบ (p1–p11); ฉบับนี้ใช้บทบาทการ์ด A–G (SETUP-08) เพราะเนื้อหา feed จริงขึ้นกับข้อมูลบัญชี/สภาพแวดล้อม — ถ้า feed ขาดประเภทการ์ดที่ precondition ต้องการ ให้สร้างจากบัญชีที่สองผ่าน composer หรือขอ test data จากทีม; สร้างไม่ได้จริง ๆ → mark BLOCK พร้อมเหตุผล
- **โพสต์ตัวเอง/clip ต้องสร้างผ่าน composer จริงเท่านั้น** (SETUP-09/10 — ไม่มีทาง seed ข้ามหลังบ้านบนเครื่องเทส): ถ้า build ทดสอบยังไม่รองรับโพสต์ clip/วิดีโอ ให้ mark BLOCK เคส FEED-017–019 ทั้งกลุ่ม; เคส pin limit (FEED-066) ต้องมีโพสต์ตัวเอง ≥4 ใบ — ถ้าสร้างไม่ครบ mark BLOCK
- **"Mark as sold" ไม่ควรมีในเมนูโพสต์ธรรมดา** — ตาม design เมนูโพสต์ตัวเองบน feed มี 5 แถว (FEED-060); แอปจริงแสดง Mark as sold บนโพสต์ธรรมดา = FAIL เช่นกัน
- **lk-follow ใน Likes sheet (FEED-052)** — prototype เป็น visual-only quirk (ไม่ follow จริง); บนแอปจริง expected = follow จริง (ตรวจสถานะนอก sheet) — ถ้ายัง visual-only = FAIL เป็น bug
- **snooze ทำ feed ว่าง (FEED-074)** — spec บังคับ: empty copy ต้องตรงบริบท = ชุดเดียวกับแท็บ Following ("Follow others to see their posts here"); ข้อความ Favorites ("No favorites yet") = FAIL copy bug; prototype แก้แล้วให้แสดง copy ถูก
- **share sheet + send-to-friend (FEED-040/041)** — spec ล็อก V1: sheet ต้องเป็นในแอป + แตะเพื่อนต้องส่งโพสต์เข้าห้องแชทจริง (เช็กในแท็บ Chat); OS sheet หรือ toast เฉย ๆ ไม่ส่งจริง = FAIL; prototype อัปเดตแล้วให้ send → เข้าห้องแชทของคนที่เลือก
- **feed ลิสต์/pull-to-refresh (FEED-004)** — spec บังคับ: pull-to-refresh ต้องมีและรีเฟรช feed จริง (มาตรฐาน feed app); prototype อัปเดตแล้วให้ดึงลงแล้วรีเฟรช (หมุนลำดับโพสต์ให้เห็นผล) — ไม่มี PTR บนแอปจริง = FAIL
- **กติกาล็อก (FAIL criteria)** — scroll-to-hide เฉพาะ feed · Android device back ถอยในแอปเทียบเท่า in-app back · coach marks ครั้งเดียวต่อ install — ใช้ร่วมกับเคสที่เกี่ยว (เช่น FEED-019/025)
- ข้อเสนอแนะ traceability เดิมคงไว้: rows `detail-open`/`pv-open`/`ps`/`dt`/`mf`/`wa` defer ไป FO-TEST-06/07/11/12 ตาม breakdown — เหลือเคส "media ไม่เปิด viewer" + "View full detail entry" เป็นตัวเชื่อมในไฟล์นี้
- สถิติ: **82 TC** — High 32 / Medium 41 / Low 9 (SETUP rows 12 แถวแยกใน checklist; รวมใน csv 94 แถว)
