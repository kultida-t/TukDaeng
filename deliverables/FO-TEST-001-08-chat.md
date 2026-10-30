# FO-TEST-001-08 — Test Cases: Chat (แอปมือถือจริง)

> Task: FO-TEST-08 ของชุด FO-TEST-001 · รอบแรก (prototype): 2026-10-27 · แปลงเป็นเวอร์ชันเทสแอปจริง: 2026-10-28
> กติกาหลัก: `deliverables/FO-TEST-001-testcase-prompt.md` · Task breakdown: `deliverables/FO-TEST-001-task-breakdown.md`
> Source of Truth: แอป TukDaeng build ทดสอบบนมือถือจริง — ทดสอบผ่านหน้าจอ/ท่าทางนิ้วเท่านั้น (ห้ามใช้ช่องทาง dev ทุกชนิด) · expected ล็อกตาม `FrontOffice/07_CHAT_MODULE.md` (FO-PRD-v1.9 — spec เลือกพฤติกรรม prototype + บันทึก deviation เป็น spec; สรุป §3)
> สัญญาความครอบคลุม: `deliverables/FO-TEST-001-00-inventory.md` §2.7 — TC ID เดิม FO-TC-CHAT-001–107 คงไว้ครบเพื่อ traceability · เพิ่ม FO-TC-CHAT-108–124 ครอบพฤติกรรมที่เทสได้เฉพาะแอปจริง (ข้อความขาเข้า/เรียลไทม์, push notification, persistence, download จริง, offline, ทดสอบ 2 เครื่อง)
> สืบทอดจาก FO-TEST-01/02R/03R/04/05/06/07: actors + sign in/out, กติกา [GATE] เทส guest+member คู่, sheet mechanics (ปิดทีละชั้น/ลากลง/scrim — SHT-001..012), Ask pill surfaces + viewer/detail (PV/DET), Member Sheet — ไฟล์นี้เทส **Chat ทั้งวงจร** บนแอปจริง
> **เขียนเสร็จรอรีวิว — อย่าเพิ่งปิดงาน**

## 0. วิธีใช้ + สภาพแวดล้อม

- **อุปกรณ์:** มือถือจริง Android และ/หรือ iOS (ตามที่ทีมกำหนด)"รุ่นเครื่อง + OS" ลงคอลัมน์ "ทดสอบบน (Device/OS)" ทุกเคสที่รัน · ทุกการกระทำ = ท่าทางนิ้วบนจอจริง (แตะ / กดค้าง / ลากซ้าย-ขวา / swipe) + ปุ่ม back ของระบบ (Android)
- **ห้าม:** browser, prototype file, DevTools, viewport emulator, localStorage, ปุ่ม dev/dev harness, demo creds, status bar จำลอง — ใช้บัญชีทดสอบจริงและข้อมูลจริงที่สร้างผ่าน UI เท่านั้น
- **2 เครื่อง/2 บัญชี:** เคส incoming/push/realtime ต้องใช้ MEMBER บนเครื่องหลัก + `ACCT-2` บนเครื่องที่สอง (SETUP-11) — ถ้าจัดเครื่องที่สองไม่ได้ mark **BLOCK** เคสที่เกี่ยว (ดู Note ในเคส)
- **Actors:** `GUEST` (ยังไม่ล็อกอิน — เข้า chat ไม่ได้เลย ทุก entry gate) · `MEMBER` (ล็อกอินบัญชีทดสอบจริง — เป็นทั้งผู้ซื้อและผู้ขายใน account เดียว) · `NEW` (สมัครใหม่ — chat list ว่าง) · `OWNER` = member ในฐานะเจ้าของลิสติ้งที่มีคนทัก (`Your listings`) · `ACCT-2` = บัญชีที่สองจริงบนเครื่องที่สอง
- **Type:** Func = พฤติกรรม · UI = การแสดงผล · Int = เชื่อมข้าม module · Edge = negative/boundary
- **Priority:** High = กติกาหลัก/flow สำคัญ (gate, ส่งข้อความ, swipe, block, report+delete, Ask loop, thread model) · Medium = feature หลัก · Low = edge/quirk
- **กติการะบบที่ล็อกตาม 07_CHAT_MODULE (สรุป — รายละเอียด §3):**
  - Thread key = `user + item(listing)` — seller เดิมแต่คนละลิสติ้ง = ห้องใหม่เสมอ ไม่มี room merge · ห้องใหม่เป็น draft นอก list จนกว่า "ส่งข้อความแรก" (text) ถึงเข้า list
  - Post reference card = snapshot นิ่ง (รูป/ชื่อ owner/caption/ราคา) — ไม่มี sold/deleted state บนการ์ด; แตะ → Post Detail, โพสต์หาย → unavailable state ตาม contract
  - Swipe ขวา → ปุ่มวงกลม Pin/Mute · Swipe ซ้าย → Hide/Delete (มี confirm dialog) · un-hide อัตโนมัติเมื่อส่งข้อความ/Ask ใหม่
  - Block จาก chat = sheet `Block` ปุ่มเดียว (ไม่มี Block and report) → ห้อง read-only + blocked bar + `Unblock`; Report จาก chat ข้าม reason-picker หน้าแรก ไป `report:user` ตรง (head มีแค่ ✕)
  - Badge บนแท็บ Chat = ผลรวม unread (cap `99+`) — ไม่ใช่ notification ใน Alerts feed
  - ไม่มีใน V1 (ห้าม spec เป็น feature — ถ้าเจอถือว่าผิดแผน): user→user chat เปล่า ๆ ไม่ผูกลิสติ้ง, DM จากปุ่มบน profile, typing indicator, reaction, pin ข้อความ, แก้ไขข้อความ, group chat, voice, file/asset card message, E2E encryption/Letter Sealing (เป็น copy อย่างเดียว), chat wallpaper, export chat, หน้า room settings
- **ข้อความ EN/TH ในคอลัมน์ expected** เป็นค่าอ้างอิงจาก design — wording ต่างจาก spec = FAIL (ข้อความ UI ที่ spec ระบุเป็นค่าล็อก)
- **ตัวเลขเวลา/ระยะ** (threshold ลาก ~40px, toast ~2 วิ) เป็นค่าอ้างอิง design
- **เงื่อนไขผลลัพธ์:** ทุกเคสระบุ expected ชัดเจน — ไม่ตรง = FAIL; ถ้า build ไม่มีคุณสมบัติ/ข้อมูลที่เคสต้องการเลย → mark **BLOCK** พร้อมเหตุผล (ห้ามเขียน ")
- **ภาษา:** ข้อความ chat ทุกตัวต้องแปลตามภาษาแอปครบ (เว้นชื่อผลิตภัณฑ์/แบรนด์ภายนอก) — เจอ hardcode ผสม = FAIL
- **สิ่งที่อยู่นอก scope:** feed card internals + post menus (FO-TEST-03/06) · Post Detail เนื้อหา (FO-TEST-06) · sheet mechanics ทั่วไป (FO-TEST-07) · report flow ข้างในหลังเลือกเหตุผล (FO-TEST-15/16) · blocked list ใน Settings (FO-TEST-15) · Member Sheet เนื้อหา (FO-TEST-01/17) · เมทริกซ์ guest ทั้งแอป (FO-TEST-17)

## 1. Coverage map — chat routes & surfaces (inventory §2.7)

| Route/Overlay (inventory §2.7) | ปกติ | Edge/[GATE] | รวม |
|---|---|---|---|
| Entries — Ask pill / guest gate / draft lifecycle | CHAT-001..004,007,010 | CHAT-005,006,008,009 | 10 |
| Chat list Chats view + swipe actions | CHAT-011..015,017..029 | CHAT-016,030,031 | 21 |
| Items view + filter popover + `chatitem:id` | CHAT-032..041 | CHAT-042..044 | 13 |
| `chatroom:id` | CHAT-045..057 | CHAT-058..061 | 17 |
| Attach + media message + media viewer | CHAT-062..065,068,069 | CHAT-066,067,070 | 9 |
| `chmenu:id` + block/report sheets | CHAT-071..080 | CHAT-081..085 | 15 |
| `chmedia:id` gallery + select mode | CHAT-086..088,091,092 | CHAT-089,090 | 7 |
| `chatcfg` + ไม่มี room settings (dead route) | CHAT-093..096,098 | CHAT-097,099 | 7 |
| Guest matrix / blocked / language / theme / sold-hide edge | CHAT-100..103,106,107 | CHAT-104,105 | 8 |
| Real-device: incoming/realtime/persistence/push/offline/2 เครื่อง | CHAT-108..115,119..124 | CHAT-116..118 | 17 |
| **รวม** | | | **124** |

## 2. Test cases

### Setup (ทำก่อนเริ่มเทส)

| TC ID | เริ่มจาก | ขั้นตอน | ผลที่ต้องเห็น |
|---|---|---|---|
| SETUP-01 | - | ติดตั้งแอป TukDaeng build ทดสอบบนมือถือจริง (Android Play Store / iOS App Store หรือ TestFlight ตามที่ทีมแจก) → เปิดแอป | splash แล้วไหลเข้า onboarding — ห้ามเทสผ่าน browser/prototype |
| SETUP-02 | - | รีเซ็ตสถานะแอป: Android = Settings → Apps → TukDaeng → Storage → Clear data · iOS = ลบแอปติดตั้งใหม่ | onboarding เด้งใหม่เหมือนใช้ครั้งแรก ข้อมูลเก่าถูกล้าง |
| SETUP-03 | - | GUEST: รีเซ็ต (SETUP-02) หรือ Log out → เดิน onboarding ถึง sheet "Join TukDaeng" → "Skip for now" | อยู่ feed แบบ guest |
| SETUP-04 | - | MEMBER: member sheet → "Sign in" → กรอก email+password บัญชีทดสอบจริง (SETUP-06) | อยู่ feed แบบ member เห็นข้อมูลจริงของบัญชีนั้น |
| SETUP-05 | - | NEW: member sheet → "Sign up" → email ใหม่ที่รับ OTP จริง + password → OTP จริง → Profile Continue → "Sign in" | อยู่ feed แบบ member ใหม่ — chat list ว่าง (ใช้เคส empty state CHAT-121) |
| SETUP-06 | - | บันทึกข้อมูลอ้างอิงจากข้อมูลจริง: บัญชีทดสอบ email+password · ACCT-2 = บัญชีที่สองจริง (ล็อกอินบนเครื่องที่สอง) · SELLER-X = seller ที่มีโพสต์ขาย ≥2 ลิสติ้ง → POST-A1/POST-A2 (อาจใช้ ACCT-2 เป็น seller) · POST-OWN = โพสต์ขายของตัวเอง (ถ้ายังไม่มีให้สร้างผ่าน composer: + → โหมดลิสติ้ง → ใส่ข้อมูล → Post to feed) · USER-BLK = บัญชีที่จะใช้เทส block (ใช้ ACCT-2 ได้ — เตรียม thread คุยกันไว้ก่อน) · บันทึก "รุ่นเครื่อง + OS" ลงทุกเคสที่รัน | มีข้อมูลครบ — ถ้าขาดตัวใด (เช่นไม่มี ACCT-2) mark BLOCK เคสที่เกี่ยว |
| SETUP-07 | MEMBER | ทางเข้า chat ทั้งหมดบนแอปจริง: แท็บ "แชท/Chat" บน bottom nav · ปุ่ม "Ask/สอบถาม" บนการ์ด sale (action row ใต้โพสต์ + บนแถวราคา) + บน rail ใน post viewer (เฉพาะ sale post) · ในหน้า list: ⚙ gear → chat settings, ช่อง Search, แท็บ Chats/Items · ในห้อง: ชื่อ user → profile, 🔍 ค้นในห้อง, ≡ → menu ห้อง, + → แนบรูป | ทุก entry เปิดปลายทางถูกต้อง — Post Detail และ profile (ปุ่ม Message/Chat) ไม่ใช่ทางเข้าห้อง (ดู CHAT-007/009) |
| SETUP-08 | - | Member Sheet "Join TukDaeng" (เด้งเวลา guest แตะ action ที่ gate): ปิดโดยแตะพื้นมืดหรือ "Skip for now" · ทุกเคส [GATE] ทำคู่ — guest เห็น Member Sheet → ปิด → sign in member → ทำซ้ำเห็น flow จริง | sheet ปิดแล้วกลับหน้าเดิม ไม่มี action เกิด |
| SETUP-09 | MEMBER | เทคนิค swipe บนแถวแชท (เทียบ LINE): กดแถวค้างแล้วลากซ้าย/ขวาช้า ๆ จนเห็นปุ่มโผล่ (~40px) → ปล่อยให้ reveal ค้าง · ลากสั้น <threshold → แถวเด้งกลับ · ลากเกิน → rubber-band · แตะแถวที่ reveal อยู่ = หุบกลับ (ไม่เข้าห้อง) | reveal ซ้าย/ขวาค้างได้ตามทิศ — ใช้กับทุกเคส CHAT-017..029 |
| SETUP-10 | MEMBER + ACCT-2 | เตรียมห้องจริง (ทำผ่าน UI เท่านั้น): (a) MEMBER → Ask บน POST-A1 → ส่งข้อความแรก → ห้อง THREAD-A เกิด (member=ผู้ซื้อ) · (b) MEMBER → Ask บน POST-A2 (seller เดียวกัน คนละลิสติ้ง) → ส่งข้อความ → THREAD-A2 ห้องใหม่ · (c) ACCT-2 บนเครื่อง 2 → Ask บน POST-OWN ของ MEMBER → ส่งข้อความ → ห้อง THREAD-IN (member=ผู้ขาย ฝั่งรับ) · (d) คุยสองทางหลายข้อความให้มี history + แนบรูปอย่างน้อย 1 รูปในห้องใดห้องหนึ่ง | MEMBER เห็น THREAD-A, THREAD-A2, THREAD-IN ใน list · Items view มีทั้ง "Your listings" (POST-OWN) และ "Items you asked about" (POST-A1/A2) |
| SETUP-11 | - | เตรียมเครื่องที่สอง + สิทธิ์แจ้งเตือน: (a) เครื่อง 2 ติดตั้งแอป + sign in ACCT-2 + เปิด notification permission ทั้งสองเครื่อง · (b) ตั้งเวลาเครื่องตรงกัน · (c) ทดสอบว่า ACCT-2 ส่งข้อความถึง MEMBER ได้จริงก่อนรันเคส incoming/push | ข้อความจาก ACCT-2 ไปถึง MEMBER — ถ้าระบบยังไม่ส่งข้อความข้ามบัญชีจริง mark BLOCK CHAT-108..118 |

### 2.1 Entries — nav / Ask Seller / draft lifecycle

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-CHAT-001 | แท็บ Chat บน bottom nav [GATE] | GUEST/MEMBER | Func | SETUP-03/04 | 1. guest: แตะแท็บ Chat → ปิด sheet 2. sign in → แตะซ้ำ | guest → Member Sheet "Join TukDaeng" (chat list ไม่เปิด); member → chat list เปิดแบบ swap (ไม่สไลด์ทับ) | แท็บ Chat active; list/pill tabs เห็นครบ | High | |
| FO-TC-CHAT-002 | ปุ่ม Ask บนการ์ด sale [GATE] | GUEST/MEMBER | Func | POST-A1 อยู่ feed | 1. guest: แตะ "Ask/สอบถาม" → ปิด sheet 2. member: แตะซ้ำ | guest → Member Sheet; member → ห้องแชทเปิด (draft room ของ POST-A1) | ห้องมีการ์ดลิสติ้งปักบน | High | |
| FO-TC-CHAT-003 | Ask → draft room + prefill | MEMBER | Func | ยังไม่เคยคุย POST-A1 | 1. แตะ Ask บน POST-A1 | ห้องเปิด: หัว = ชื่อ seller + การ์ดลิสติ้ง (รูป + owner + caption + ราคา) อยู่เหนือ composer + day divider วันนี้ + ไม่มี bubble + **input prefill ข้อความ Quick Ask** (default "สนใจสินค้าชิ้นนี้ครับ ยังอยู่ไหมครับ?" หรือข้อความที่ตั้งไว้ใน chat settings) + send ใช้งานได้ | การ์ด snapshot ครบทุกฟิลด์ | High | |
| FO-TC-CHAT-004 | Ask ซ้ำ seller+item เดิม → ห้องเดิม | MEMBER | Func | THREAD-A มีอยู่แล้ว | 1. กลับ feed → Ask POST-A1 อีกครั้ง | เปิดห้อง **เดิม** — msgs เดิมครบ ไม่สร้างซ้ำ (match user+item) | ห้องเดียวใน list | High | |
| FO-TC-CHAT-005 | Ask โพสต์ตัวเอง | OWNER | Edge | POST-OWN อยู่ feed (ผ่าน own profile/feed) | 1. ดูแถวปุ่มของโพสต์ตัวเองบนการ์ดฟีด, ใน viewer และใน detail | ไม่มีปุ่ม Ask บนโพสต์ตัวเองทุกจุด (การ์ดฟีด, viewer, detail) — จึงไม่มีทางสร้างห้องคุยกับตัวเอง (toast "This is your own listing" เป็นตัวกันเส้นทางอื่น ไม่มีทางกดผ่าน UI) | ไม่มีปุ่ม Ask | Medium | |
| FO-TC-CHAT-006 | Ask seller ที่ block อยู่ | MEMBER | Edge | block USER-BLK ไว้แล้ว + ยังเข้าถึงโพสต์ USER-BLK ได้ (viewer/detail ที่เปิดค้างก่อน block หรือลิงก์ที่แชร์มา) | 1. แตะ Ask บนโพสต์ของ USER-BLK | ไม่เปิดห้อง — toast/hint ต้องตรง "Cannot message a blocked account" ; ถ้าระบบซ่อนโพสต์คนถูก block ครบจนหา entry ไม่ได้ → BLOCK (setup เงื่อนไขไม่ครบ) | ไม่มี thread ใหม่ใน list | Medium | |
| FO-TC-CHAT-007 | Ask entries ครบทุก surface + ไม่มี entry บน Post Detail | MEMBER | Func | POST-A1 | 1. Ask จาก action row ใต้การ์ด feed 2. Ask จากแถวราคา (price-footer) 3. เปิด viewer ของ POST-A1 → Ask บน rail 4. เปิด Post Detail → หา chat entry | ทั้ง 3 entry เปิดห้องเดียวกัน (user+item เดิม); **Post Detail ไม่มีปุ่ม chat/fab/Ask เด็ดขาด** (canonical — Ask อยู่บน card/footer/viewer rail เท่านั้น); โพสต์ที่ไม่ใช่ sale ไม่มี Ask pill | ปุ่ม Ask มีเฉพาะบน sale post | High | |
| FO-TC-CHAT-008 | back จากห้องที่เปิดผ่าน Ask | MEMBER | Func | เปิดห้องผ่าน Ask จาก viewer/detail | 1. detail/viewer ของ POST-A1 → Ask → อยู่ห้อง 2. กด back ในห้อง | ปิด layer กลับ **surface ข้างล่าง** (feed) — overlay viewer/detail ที่เปิดอยู่ถูกปิดตอน Ask แล้ว ไม่กลับไปที่ detail (spec ล็อก: Ask รีเซ็ต stack เหลือห้องหน้าเดียว) | ไม่มีหน้าค้างซ้อน | Medium | |
| FO-TC-CHAT-009 | ปุ่ม Chat/Message บน profile → เปิด DM | MEMBER | Func | public profile ของ SELLER-X | 1. เปิด profile seller → แตะปุ่ม Chat/Message | เปิดห้อง DM ของ seller นั้นทันที (กฎ IG: ห้องเดียวต่อ account — lock FO-TEST-12; ไม่ผูกลิสติ้ง) — ไม่มีปุ่ม/ไม่เปิดห้อง = FAIL | ห้อง user-to-user เดิมถ้ามี | High | |
| FO-TC-CHAT-010 | draft room ไม่เข้า list จนกว่าส่งข้อความแรก | MEMBER | Func | ไม่มี thread กับ POST-B1 (ลิสติ้งใหม่ของ seller อื่น) | 1. Ask POST-B1 → **ไม่ส่งอะไรเลย** → back 2. เปิด chat list 3. Ask POST-B1 อีกครั้ง | list **ไม่มีแถวใหม่** (ห้องยังเป็น draft); Ask ซ้ำ → ห้องเดิมเปิดพร้อม prefill/ข้อความที่พิมพ์ค้างไว้ | การ์ดลิสติ้งยังปักอยู่ | High | |

### 2.2 Chat list — Chats view + swipe actions

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-CHAT-011 | โครงหน้า Chat list | MEMBER | UI | SETUP-10 | 1. เปิดแท็บ Chat → อ่านหน้า | pill tabs "Chats" (active) + "Items" (มี caret) + ⚙ gear + ช่อง Search + list แถว + bottom nav | layout ครบทุกส่วน | High | |
| FO-TC-CHAT-012 | องค์ประกอบแถว thread | MEMBER | UI | list มีหลายห้อง (pinned/ปกติ/muted/blocked) | 1. อ่านแต่ละแถว | avatar (+pin badge เมื่อ pinned) + username + chip "Blocked" หรือไอคอน mute + preview (ขึ้น "You: " เมื่อข้อความสุดท้ายจากเรา) + เวลา (HH:MM วันนี้ / ชื่อวันหรือวันที่ ถ้าเก่ากว่า) + unread pill | แถว pin ขึ้นกลุ่มบนสุด | High | |
| FO-TC-CHAT-013 | badge บนแท็บ = ผลรวม unread + อ่านแล้วเคลียร์ | MEMBER | Func | THREAD-IN มี unread ≥1 (ให้ ACCT-2 ส่งก่อน) | 1. บันทึก badge บนแท็บ Chat 2. เข้าห้อง THREAD-IN → ออกมา | badge = ผลรวม unread ทุกห้อง (cap 99+); เข้าห้องแล้ว unread เคลียร์ + badge ลดทันที | ตัวเลขตรงกับรวม unread pill | High | |
| FO-TC-CHAT-014 | เปิดห้องจากแถว + back | MEMBER | Func | THREAD-A ใน list | 1. แตะแถว THREAD-A 2. กด back | ห้องสไลด์เข้า; back สไลด์ออกกลับ list — state เดิม (search/scroll ตาม spec §3) | transition ถูกทิศ | High | |
| FO-TC-CHAT-015 | ค้นหาใน list | MEMBER | Func | SETUP-10 | 1. พิมพ์ชื่อ seller 2. พิมพ์ชื่อลิสติ้ง 3. พิมพ์คำในข้อความ 4. พิมพ์ "zzz" → ลบ | live filter ครอบ username + ชื่อลิสติ้ง + เนื้อข้อความ; "zzz" → "No chats found" + "Try another name, item or message."; ล้าง → แถวกลับครบ | placeholder ตามภาษาแอป | High | |
| FO-TC-CHAT-016 | กดค้าง (long-press) บนแถว | MEMBER | Edge | list | 1. กดนิ้วค้างบนแถว ~1 วินาที | ไม่มี context menu/อะไรเกิด — actions มีเฉพาะ swipe | — | Low | |
| FO-TC-CHAT-017 | swipe ขวา → Pin + Mute | MEMBER | Func | list | 1. ลากแถวไปขวา >threshold แล้วปล่อย 2. ลากสั้นกว่า threshold | ลากพอ → reveal ปุ่มวงกลม: 📌 Pin + 🔕 Mute; ลากสั้น → snap กลับไม่ reveal; ลากเกิน → rubber-band | ปุ่มวงกลมโผล่ฝั่งซ้าย | High | |
| FO-TC-CHAT-018 | swipe ซ้าย → Hide + Delete | MEMBER | Func | list | 1. ลากแถวไปซ้าย >threshold แล้วปล่อย | reveal ปุ่มสี่เหลี่ยม: "Hide" + "Delete" ฝั่งขวา | ปุ่มเห็นชัดอ่านได้ | High | |
| FO-TC-CHAT-019 | แตะแถวที่ reveal อยู่ | MEMBER | Func | แถว reveal อยู่ | 1. แตะตัวแถว (ไม่ใช่ปุ่ม) | reveal หุบกลับ — **ไม่เข้าห้อง** | — | Medium | |
| FO-TC-CHAT-020 | แตะพื้นอื่นขณะ reveal | MEMBER | Func | แถว reveal อยู่ | 1. แตะพื้นว่าง/แถวอื่นนอกปุ่ม | reveal หุบกลับ | — | Medium | |
| FO-TC-CHAT-021 | reveal ทีละแถวเท่านั้น | MEMBER | Edge | แถว A reveal อยู่ | 1. เริ่มลากแถว B | A หุบอัตโนมัติ — reveal ได้ทีละ 1 แถว | — | Low | |
| FO-TC-CHAT-022 | swipe สั้นแล้วแตะต่อทันที | MEMBER | Edge | list | 1. ลากแถวช้า ๆ ไม่ถึง threshold → ปล่อย 2. แตะแถวต่อทันที | แถว snap กลับ ไม่ reveal; แตะต่อเข้าห้องได้ปกติ (ไม่มี ghost tap) | — | Low | |
| FO-TC-CHAT-023 | Pin แถว | MEMBER | Func | แถวปกติ (ยังไม่ pin) | 1. swipe ขวา → กด 📌 Pin | toast ยืนยัน (ต้องตรง "ปักหมุดแชทแล้ว") + แถวขึ้นกลุ่ม pinned บนสุด + pin badge บน avatar + reveal หุบ | pin badge เห็นชัด | High | |
| FO-TC-CHAT-024 | Unpin | MEMBER | Func | แถว pin อยู่ | 1. swipe ขวา → กด Pin ซ้ำ | unpin — toast + badge หาย + แถวกลับกลุ่มปกติ | ลำดับกลับตามเดิม | Medium | |
| FO-TC-CHAT-025 | Mute / Unmute | MEMBER | Func | แถวปกติ | 1. swipe ขวา → กด 🔕 Mute 2. กดซ้ำ (Unmute) | mute → toast + ไอคอน mute ข้างชื่อ; unmute → toast + ไอคอนหาย (ข้อความตามภาษาแอป) | icon ตำแหน่งเดียวกับ Blocked chip | Medium | |
| FO-TC-CHAT-026 | Hide → confirm dialog | MEMBER | Func | แถว reveal ซ้าย | 1. กด "Hide" | confirm dialog/แผ่นยืนยันเด้ง: ข้อความต้องตรง "Hiding chats doesn't delete their messages." + ปุ่ม Cancel + Hide | dialog ตามภาษาแอป + theme | High | |
| FO-TC-CHAT-027 | ยกเลิก Hide | MEMBER | Func | dialog Hide เปิด | 1. กด Cancel / แตะพื้นมืด | dialog ปิด + reveal หุบ — แถวยังอยู่ ไม่มี toast | — | Medium | |
| FO-TC-CHAT-028 | ยืนยัน Hide | MEMBER | Func | dialog Hide เปิด | 1. กด "Hide" | toast ยืนยัน + แถวหายจาก Chats view — ห้องยังอยู่ (กลับมาได้ผ่าน Ask/ข้อความใหม่) | แถวหายเฉพาะ Chats view | High | |
| FO-TC-CHAT-029 | Delete → confirm → ลบจริง | MEMBER | Func | แถวที่ไม่ต้องการแล้ว | 1. swipe ซ้าย → "Delete" → อ่าน dialog → กด "Delete" | dialog ต้องตรง "Are you sure you want to delete this chat?" → ลบ: toast + แถวหาย + ประวัติหายฝั่งเราถาวร (เปิดใหม่/รีสตาร์ทก็ไม่กลับ — เทียบ CHAT-110) | ไม่มี undo | High | |
| FO-TC-CHAT-030 | Ask ลิสติ้งเดิมของห้องที่ซ่อน → un-hide | MEMBER | Func | ซ่อน THREAD-A ไว้ | 1. กลับ feed → Ask POST-A1 | เปิดห้องเดิม + msgs ครบ + แถว**กลับมาแสดงใน list** (un-hide อัตโนมัติ); (ลบแล้ว Ask → ห้องใหม่ msgs ว่าง) | แถวกลับมาโผล่ | Medium | |
| FO-TC-CHAT-031 | ห้องที่ซ่อนยังนับ badge + โผล่ใน Items view (deviation) | MEMBER | Edge | ซ่อนห้องที่ยังมี unread ไว้ | 1. ดู badge บนแท็บ 2. เปิด Items view → หากลุ่มของห้องที่ซ่อน | canonical lock: badge **ไม่**นับ unread ของห้องที่ซ่อน + Items view groups ไม่แสดงห้องที่ซ่อน — ยังนับ/ยังแสดง = FAIL | group row แสดงครบ | Low | |

### 2.3 Items view + filter popover + `chatitem:id`

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-CHAT-032 | แท็บ Items — 2 sections | MEMBER | Func | SETUP-10 | 1. แตะแท็บ "Items" | สลับเป็น item view: section "Your listings" (POST-OWN) + "Items you asked about" (POST-A1/A2) + tab active ย้าย | 2 หัวข้อ section ชัด | High | |
| FO-TC-CHAT-033 | องค์ประกอบ item row | MEMBER | UI | items view | 1. อ่านแถวแต่ละกลุ่ม | thumb รูปลิสติ้ง + ชื่อ + preview: mine = "ราคา · N chats" / asked = "ราคา · ข้อความล่าสุด" + เวลา + unread รวมของกลุ่ม | — | Medium | |
| FO-TC-CHAT-034 | asked item thread เดียว → เข้าห้องตรง | MEMBER | Func | POST-A1 มี thread เดียว (THREAD-A) | 1. แตะ item POST-A1 | เข้าห้องตรงเลย ไม่ผ่านหน้า item chats (isDirectRoom) | — | High | |
| FO-TC-CHAT-035 | ลิสติ้งตัวเอง → หน้า Item chats | OWNER | Func | POST-OWN มี ≥1 ห้อง (THREAD-IN) | 1. แตะ POST-OWN ใน Your listings | เปิดหน้า Item chats: head "Item chats" + back + การ์ด item pill (รูป + cap + ราคา + "Your listing · N chats") + ช่อง search + list threads | pill ลอยเหนือ list | High | |
| FO-TC-CHAT-036 | swipe ใน item chats ทำงานเหมือน list | OWNER | Func | หน้า Item chats | 1. ลากแถวซ้าย/ขวา + แตะแถว | swipe pin/mute/hide/del ทำงานเหมือน list หลัก; tap → ห้อง | ปุ่มเหมือนกันทุกประการ | Medium | |
| FO-TC-CHAT-037 | search ใน item chats | OWNER | Func | หน้า Item chats มี ≥2 threads | 1. พิมพ์ชื่อคนทัก 2. พิมพ์คำที่ไม่มี | live filter เฉพาะ thread ใน item นี้; ไม่เจอ → "No chats found" + "Try another name or message." | — | Medium | |
| FO-TC-CHAT-038 | back จาก item chats | OWNER | Func | หน้า Item chats | 1. กด back | กลับ chat list — item view ยังค้าง (view ไม่กลับ Chats เอง) | — | Medium | |
| FO-TC-CHAT-039 | แตะแท็บ Items ซ้ำ → filter popover | MEMBER | Func | อยู่ items view | 1. แตะแท็บ "Items" อีกครั้ง | popover เปิด: "Filter items by/กรองตามรายการ" + 3 แถว (All items ✓ / Your listings / Items you asked about) + backdrop | check อยู่ตัวเลือกปัจจุบัน | High | |
| FO-TC-CHAT-040 | เลือก filter | MEMBER | Func | popover เปิด | 1. เลือก "Your listings" → เปิดใหม่เลือก "Items you asked about" | เหลือเฉพาะกลุ่มที่เลือก; check ย้ายตาม; popover ปิดเอง; ถ้ากลุ่มนั้นว่าง → "No listings found" / "No asked items found" + "No items match your filter." | — | High | |
| FO-TC-CHAT-041 | ปิด popover | MEMBER | Func | popover เปิด | 1. แตะ backdrop 2. แตะพื้นใน popover (ไม่ใช่แถว) | backdrop → ปิด; แตะใน popover → ไม่ปิด ไม่ทำอะไร | — | Low | |
| FO-TC-CHAT-042 | กลับแท็บ Chats → reset | MEMBER | Func | filter/search ค้างไว้ | 1. แตะแท็บ "Chats" | กลับ user view + ช่อง search ถูกล้าง + item filter กลับ All | — | Medium | |
| FO-TC-CHAT-043 | สลับแท็บ nav แล้วกลับ → reset เป็น default view | MEMBER | Func | อยู่ items view/พิมพ์ค้นค้าง | 1. แตะ nav Feed → แตะ Chat กลับ | เปิด chat = **default view** ตาม chat settings (Chats เว้นแต่ตั้ง Items ไว้) + search/filter เคลียร์ — ไม่ค้างหน้าเดิม | — | Medium | |
| FO-TC-CHAT-044 | ลบ/ซ่อน thread สุดท้ายของ item ขณะอยู่หน้า item chats | OWNER | Edge | item มี thread เดียว | 1. (a) ลบ thread สุดท้าย 2. (b) ทำซ้ำกับ item อื่นแต่เลือก Hide | ลบ → หน้าแสดง "Item not found"/"No chats for this item." (group หาย); ซ่อน → การ์ด item ยังอยู่ + list ว่าง "No chats found" (ผลต่างกัน — spec ล็อกตาม deviation) | empty copy ตรง | Low | |

### 2.4 `chatroom:id` — ห้องสนทนา

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-CHAT-045 | โครงห้อง + post reference card | MEMBER | UI | THREAD-A | 1. เปิดห้อง → อ่านทั้งหน้า | head: back + ชื่อ user + 🔍 + ≡; day divider ("Today"/วันที่จริง); **post reference card** (รูป + owner + caption + ราคา); bubbles ซ้าย=เขา (avatar), ขวา=เรา | การ์ดเห็นชัดแตะได้ | High | |
| FO-TC-CHAT-046 | bubble grouping + Read/Sent | MEMBER | UI | ห้องที่มีข้อความติดกันหลายอันทั้งสองฝั่ง | 1. อ่าน bubble meta | ข้อความฝั่งเขาติดกัน → avatar เฉพาะ bubble แรกของกลุ่ม; เวลาข้างทุก bubble; **เฉพาะข้อความเราอันสุดท้าย** แสดงสถานะ Sent → Read (เปลี่ยนเป็น Read เมื่ออีกฝั่งอ่าน; prototype จำลองหลัง ~3 วิ ขณะห้องเปิดอยู่) | avatar ไม่ซ้ำทุก bubble | Medium | |
| FO-TC-CHAT-047 | composer enable/disable | MEMBER | Func | ห้องเปิด | 1. พิมพ์ข้อความ → ลบหมด → พิมพ์แต่ช่องว่าง | พิมพ์ → send เปิดใช้; ลบ/ช่องว่างล้วน → send disabled (trim) | สถานะปุ่มสื่อชัด | High | |
| FO-TC-CHAT-048 | ส่งข้อความจริง | MEMBER | Func | ห้องเปิด | 1. พิมพ์ "สวัสดีครับ" → กด send 2. กลับ list | bubble ขวาใหม่ + สถานะ Sent + **เวลาจริงของเครื่อง** + input ล้าง + focus กลับ; list → แถวขึ้นบนสุด (หลังกลุ่ม pinned) + preview "You: สวัสดีครับ" | เวลาไม่ใช่ค่าคงที่ | High | |
| FO-TC-CHAT-049 | ส่งด้วยปุ่มบนคีย์บอร์ด/Enter | MEMBER | Func | ห้องเปิด | 1. พิมพ์ → กดปุ่ม send/return บนคีย์บอร์ด | ส่งเหมือนกดปุ่ม send (return = newline = FAIL — send key ต้องส่งข้อความ) | — | Medium | |
| FO-TC-CHAT-050 | draft ค้างระหว่าง navigate | MEMBER | Func | ห้องเปิด | 1. พิมพ์ค้างไว้ (ไม่ส่ง) → back → เข้าห้องเดิม | input เติม draft เดิม + send enabled | — | Medium | |
| FO-TC-CHAT-051 | ข้อความยาว/อีโมจิ/ไทยผสม | MEMBER | Edge | ห้องเปิด | 1. ส่งข้อความยาวมากหลายบรรทัด + อีโมจิ + ไทยผสมอังกฤษ | bubble wrap ไม่ล้นกรอบ ส่งได้ปกติ | wrap ถูกต้อง | Low | |
| FO-TC-CHAT-052 | แตะการ์ดลิสติ้ง → Post Detail | MEMBER | Int | THREAD-A | 1. แตะการ์ดลิสติ้งในห้อง 2. back จาก detail | Post Detail เปิดทับห้อง; กลับมาห้องเดิมครบ (scroll/draft เดิม) | — | High | |
| FO-TC-CHAT-053 | การ์ดของโพสต์ที่ถูกลบ → unavailable | MEMBER | Edge | สร้างห้องบนโพสต์ ACCT-2 ก่อน → ให้ ACCT-2 ลบโพสต์นั้น | 1. เปิดห้อง → แตะการ์ดลิสติ้ง | แสดง unavailable state/toast ตาม contract "รายการนี้ไม่พร้อมใช้งานแล้ว" (หรือหน้า unavailable + Go back ตาม design) — การ์ด snapshot ยังแสดงข้อมูลเดิม | ข้อความตามภาษาแอป | Medium | |
| FO-TC-CHAT-054 | แตะชื่อ seller ในหัวห้อง → profile | MEMBER | Func | ห้องเปิด | 1. แตะชื่อ/avatar บน head 2. back | profile ของ user นั้นสไลด์ทับ; back กลับห้องเดิม | — | Medium | |
| FO-TC-CHAT-055 | ค้นหาในห้อง | MEMBER | Func | ห้องมีข้อความหลายอัน | 1. แตะ 🔍 2. พิมพ์คำที่มีในข้อความ 3. กด clear → กด ✕ ปิด | head สลับเป็นกล่องค้นหา (autofocus); พิมพ์ → ข้อความ match ไฮไลต์ ที่ไม่ match จาง (media จางเสมอเมื่อมี query); clear → ครบ; ✕ → head กลับปกติ | highlight เห็นชัด | High | |
| FO-TC-CHAT-056 | composer ระหว่าง search mode | MEMBER | Edge | search mode เปิด | 1. ดู composer/ลองพิมพ์ส่ง | ส่งข้อความไม่ได้จนกว่าออกจาก search (composer ถูกซ่อนหรือ disable ตาม design) | — | Low | |
| FO-TC-CHAT-057 | เปิดห้องแล้วอยู่ล่างสุด | MEMBER | Func | ห้องยาวมี scroll | 1. เปิดห้อง | เห็นข้อความล่าสุดทันที (scroll ลงล่างสุดอัตโนมัติ) | — | Low | |
| FO-TC-CHAT-058 | ห้องที่ block → blocked bar | MEMBER | Func | block USER-BLK (มี thread) | 1. เปิดห้องของ USER-BLK | composer ถูกแทนด้วย blocked bar: ไอคอน + "You blocked this account" + คำอธิบายส่งข้อความไม่ได้จนกว่า unblock + ปุ่ม **Unblock** — ไม่มี input/+/send; ประวัติอ่านได้ read-only | bar เห็นชัดตาม theme | High | |
| FO-TC-CHAT-059 | Unblock จากห้อง | MEMBER | Func | ห้อง blocked | 1. กด "Unblock" บน bar → confirm | dialog "Unblock X?" → Unblock → toast + composer กลับ + chip Blocked หายจาก list | — | High | |
| FO-TC-CHAT-060 | ส่งข้อความในห้อง blocked ไม่ได้ | MEMBER | Edge | ห้อง blocked | 1. หาทางส่งทุกช่องทาง (composer/attach/+) | ไม่มีทางส่ง — ไม่มี composer/+ เลย | — | Low | |
| FO-TC-CHAT-061 | ห้องที่ไม่มีอยู่ → "Chat not found" | MEMBER | Edge | สร้างสถานการณ์ห้องหายได้เท่านั้น (เช่น thread ถูกลบจากอีกเครื่อง/ทีมลบข้อมูลทดสอบ/เปิดลิงก์ห้องที่ไม่มี) | 1. เปิดห้องที่ไม่มีอยู่ | "Chat not found" + "This conversation is no longer available." หรือ unavailable state เทียบเท่า + ทางกลับ — ถ้าสร้างสถานการณ์ไม่ได้เลย mark BLOCK พร้อมเหตุผล | — | Low | |

### 2.5 Attach + media message + media viewer

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-CHAT-062 | ปุ่ม + เปิดตัวเลือกรูป | MEMBER | Func | ห้องเปิด | 1. กด "+" ใน composer | ตัวเลือกรูปเปิด (sheet "Photos & videos"/gallery picker ตาม design ของ build) ทับห้อง | มีทางปิดชัดเจน | High | |
| FO-TC-CHAT-063 | เลือกรูป → media message | MEMBER | Func | picker เปิด | 1. เลือกรูป 1 รูป | รูปถูกส่งเป็น media bubble (ถ้า build มีขั้น preview/caption/multi-select → ส่งจนจบแล้วผลเดียวกัน) + thread ขึ้นบนสุด | bubble รูปฝั่งเรา | High | |
| FO-TC-CHAT-064 | รูปที่ส่งเข้า gallery/strip | MEMBER | Func | ส่งรูปแล้ว | 1. เปิด ≡ menu → ดู "Photos & videos" 2. เปิด gallery | รูปที่ส่งโผล่ใน strip + ใน media gallery | — | Medium | |
| FO-TC-CHAT-065 | ปิด picker โดยไม่ส่ง | MEMBER | Func | picker เปิด | 1. กด ✕/back/แตะพื้นมืด | ปิด — ไม่ส่งอะไร ห้องเดิม | — | Medium | |
| FO-TC-CHAT-066 | ส่งวิดีโอ (ถ้ารองรับ) | MEMBER | Edge | picker มีวิดีโอให้เลือก | 1. เลือกวิดีโอ → ดู bubble | bubble มี play overlay/badge บอกเป็นวิดีโอ + แตะเล่นได้; build รับเฉพาะรูป → BLOCK | badge เห็นชัด | Low | |
| FO-TC-CHAT-067 | ส่งรูปเป็นข้อความแรกใน draft room (deviation) | MEMBER | Edge | ห้อง draft ใหม่ (ยังไม่เคยส่ง) | 1. Ask โพสต์ใหม่ → + → ส่งรูป → back → ดู list | canonical lock: media send ทำให้ draft เข้า list + move-to-top + unhide เหมือนส่ง text — ห้องไม่ขึ้น list = FAIL | — | Medium | |
| FO-TC-CHAT-068 | media viewer เต็มจอ | MEMBER | Func | ห้องมี media bubble | 1. แตะ media bubble / thumb ใน strip / item ใน gallery | viewer เปิดเต็มจอ: รูปกลางจอ + ปุ่มปิด — เหนือทุก layer | — | High | |
| FO-TC-CHAT-069 | ปิด media viewer | MEMBER | Func | viewer เปิด | 1. กด ✕ 2. แตะพื้นมืดรอบรูป 3. device back (Android) | ทุกวิธีปิดได้; แตะบนตัวรูปไม่ปิด | — | Medium | |
| FO-TC-CHAT-070 | zoom/swipe ใน viewer (V1 ไม่บังคับ) | MEMBER | Edge | viewer เปิด (ห้องมี ≥2 รูป) | 1. pinch zoom / double-tap / swipe ข้ามรูป | canonical lock: viewer ต้อง swipe ข้ามรูปได้ (หลายรูป) + ซูมได้ (pinch/double-tap) — ไม่มี = FAIL | — | Low | |

### 2.6 `chmenu:id` + block/report จาก chat

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-CHAT-071 | โครงหน้า room menu | MEMBER | UI | ห้องเปิด | 1. กด ≡ → อ่านหน้า | head: back + username; 4 ปุ่มวงกลม (Mute / Profile / Block / Report); แถว "Photos & videos ›" + strip รูปหรือ empty card; แถว "Listings & Items › ชื่อลิสติ้ง"; footer ข้อความ encryption note (display copy เท่านั้น — ดู §3) | ครบทุกส่วน | High | |
| FO-TC-CHAT-072 | tile Mute ⇄ Unmute | MEMBER | Func | chmenu เปิด | 1. กด tile Mute → กลับ list → กลับมา | toast + tile กลายเป็น Unmute + สถานะ active; mute icon บนแถว list ตรงกัน | icon sync สองจุด | Medium | |
| FO-TC-CHAT-073 | tile Profile | MEMBER | Func | chmenu เปิด | 1. กด Profile → back | profile ของ user นั้นทับ; back กลับ chmenu | — | Low | |
| FO-TC-CHAT-074 | แถว Photos & videos → gallery | MEMBER | Func | chmenu เปิด | 1. แตะแถว "Photos & videos" | เปิด media gallery ของห้อง | — | Medium | |
| FO-TC-CHAT-075 | แตะรูปใน strip → viewer ตรง | MEMBER | Func | chmenu มี media strip | 1. แตะรูปใน strip | media viewer เปิดตรง (ไม่ผ่าน gallery) | — | Low | |
| FO-TC-CHAT-076 | แถว Listings & Items → detail | MEMBER | Func | chmenu เปิด | 1. แตะแถว | Post Detail ของลิสติ้งเปิดทับ (เหมือนการ์ดในห้อง) — โพสต์หาย → unavailable ตาม CHAT-053 | — | Medium | |
| FO-TC-CHAT-077 | tile Block → sheet ปุ่มเดียว | MEMBER | Func | chmenu ของ USER-BLK (ยังไม่ block) | 1. กด tile Block → อ่าน sheet | bottom sheet: avatar + "Block X?" + คำอธิบาย + impact rows + ปุ่ม **Block เดียว** — **ไม่มี "Block and report"** เพราะเปิดจาก chat; ปิด = backdrop | sheet ตามภาษาแอป | High | |
| FO-TC-CHAT-078 | ยืนยัน Block → ผลข้ามจุด | MEMBER | Func | sheet Block เปิด | 1. กด Block → กลับห้อง → กลับ list → feed | sheet ปิด + toast; chmenu tile เป็น Unblock; ห้องมี blocked bar; แถวมี chip "Blocked"; โพสต์/comment ของคนนั้นหายจาก feed/sheet (ผลเต็มอยู่ FO-TEST-16) | chip แทน mute icon | High | |
| FO-TC-CHAT-079 | tile Unblock → dialog | MEMBER | Func | chmenu ของคนที่ block แล้ว | 1. tile เป็น Unblock → กด → confirm | center dialog "Unblock X?" → Unblock → toast + ทุกอย่างกลับ (composer/แถว/feed) — ไม่ re-follow | — | High | |
| FO-TC-CHAT-080 | tile Report → report sheet | MEMBER | Func | chmenu เปิด | 1. กด tile Report → อ่าน sheet | sheet: avatar + "Are you sure you want to report X?" + คำอธิบาย (Report and delete จะลบแชท+ประวัติ) + ปุ่ม **Report and delete** (แดง) / **Report** / **Cancel** | — | High | |
| FO-TC-CHAT-081 | Cancel report sheet | MEMBER | Func | report sheet เปิด | 1. กด Cancel | sheet ปิด กลับ chmenu — ไม่มีอะไรเกิด | — | Medium | |
| FO-TC-CHAT-082 | Report → flow จนจบ ห้องยังอยู่ | MEMBER | Func | report sheet เปิด | 1. กด "Report" 2. เลือกเหตุผล → done → กด Done/✕ | ไปหน้า report ของ user ตรง (**head ไม่มีปุ่ม back มีแค่ ✕**); เลือกเหตุผล → หน้า done ("Thanks for your feedback" + other steps); ปิด → กลับ chmenu + toast "Report submitted…" — **thread ยังอยู่** | — | High | |
| FO-TC-CHAT-083 | Report and delete → ห้องถูกลบหลังจบ flow | MEMBER | Func | report sheet เปิด (ห้องทดสอบที่ลบได้) | 1. กด "Report and delete" → ทำ report จนถึง done → กด Done/✕ | flow เดียวกัน + เมื่อปิด stack → **thread ถูกลบ** + ลงที่ chat list (ห้อง/menu ถูกปิดทิ้ง) | แถวหายจาก list | High | |
| FO-TC-CHAT-084 | Report and delete → ยกเลิกกลาง flow | MEMBER | Func | report flow เปิด (ยังไม่ถึง done) | 1. กด "Report and delete" → กด ✕ ก่อนถึงหน้า done | ปิด stack → **chat ไม่ถูกลบ** กลับ chmenu — ลบเฉพาะเมื่อผ่าน done แล้วเท่านั้น | แถวยังอยู่ | Medium | |
| FO-TC-CHAT-085 | done steps → Block จากหน้า report | MEMBER | Edge | หน้า report:done ของ flow จาก chat | 1. ที่ขั้น "Other steps" กด "Block X" | เปิด block sheet **แบบปุ่มเดียว** (fromChat — ไม่มี Block and report แม้อยู่ในหน้า report) | — | Low | |

### 2.7 `chmedia:id` — media gallery

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-CHAT-086 | โครง gallery + date grouping | MEMBER | UI | ห้องมี media | 1. chmenu → "Photos & videos" | head: ✕ + ชื่อ user + ปุ่ม "Select" + ป้ายกลุ่มวันที่ **ตามวันที่จริงของ media** (วันที่คงที่/hardcode = FAIL) + grid รูป | — | Medium | |
| FO-TC-CHAT-087 | แตะรูป (ไม่ select) → viewer | MEMBER | Func | gallery เปิด | 1. แตะรูปหนึ่ง | media viewer เปิด | — | Low | |
| FO-TC-CHAT-088 | Select mode + bottom bar | MEMBER | Func | gallery เปิด | 1. กด "Select" → แตะ 2 รูป | head สลับ "Cancel / 2 selected / Deselect" + badge เลขลำดับ 1,2 บนรูป + bottom bar: 🗑 + ⬇ (enabled เมื่อมีเลือก; Deselect disabled เมื่อ 0) | badge ลำดับชัด | High | |
| FO-TC-CHAT-089 | Trash รูปที่เลือก | MEMBER | Func | select ≥1 รูป | 1. กด 🗑 | รูปหายจาก gallery + toast + ออกจาก select mode; media bubble ในห้องต้องหายตาม — ยังแสดง = FAIL (desync) | — | Medium | |
| FO-TC-CHAT-090 | Download รูป | MEMBER | Func | select ≥1 รูป | 1. กด ⬇ → เช็ก gallery/Photos ของเครื่อง | รูปถูกบันทึกลงเครื่องจริง (ขอ permission ครั้งแรก) + toast ยืนยัน | — | Medium | |
| FO-TC-CHAT-091 | ออกจาก select mode | MEMBER | Func | select mode | 1. Deselect / Cancel / ✕ ปิดหน้า | Deselect → เลือก 0; Cancel → ออก select; ✕ → ปิดหน้า + reset selection | — | Low | |
| FO-TC-CHAT-092 | gallery ว่าง | MEMBER | Func | ห้องที่ไม่มี media | 1. เปิด chmedia | "No photos or videos found." กลางหน้า + **ไม่มีปุ่ม Select** | — | Low | |

### 2.8 `chatcfg` + ไม่มี room settings (dead route)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-CHAT-093 | โครงหน้า Chat settings | MEMBER | UI | chat list | 1. กด ⚙ gear | เปิด Chat settings: back + หัวข้อ + section Notifications (Message notifications on / Show message preview on) + Privacy ("Only people I follow can message me" off) + Default chat view (Chats/Items) + ช่อง Quick Ask message + note | ครบทุก section | High | |
| FO-TC-CHAT-094 | toggles flip + ผลจริง | MEMBER | Func | chatcfg + ACCT-2 | 1. ปิด "Message notifications" 2. ให้ ACCT-2 ส่งข้อความ (เครื่องหลักอยู่ background) 3. ปิด "Show message preview" แล้วให้ส่งอีกครั้ง | toggle flip ทันที + บันทึก; notif off → **ไม่มี push** จากข้อความใหม่ (badge ยังอัปเดตตอนเปิดแอป); preview off → push มาแต่ไม่โชว์เนื้อข้อความ (build ยังไม่มี push → BLOCK ทั้งเคส) | toggle สถานะชัด | Medium | |
| FO-TC-CHAT-095 | Default chat view = Items | MEMBER | Func | chatcfg | 1. เลือก "Items" → back → nav Feed → Chat | เปิด chat = **items view** ทันที (defView มีผลจริงทุกครั้งที่เข้า tab) | radio check ถูก | Medium | |
| FO-TC-CHAT-096 | Quick Ask message → prefill ถัดไป | MEMBER | Int | chatcfg | 1. แก้ข้อความเป็น "ขอรูปเพิ่มครับ" → back → Ask โพสต์ใหม่ | draft prefill = ข้อความใหม่ (บันทึก live ไม่ต้องกด save); จำกัดความยาว ~80 ตัวอักษร | — | High | |
| FO-TC-CHAT-097 | "Only people I follow" บังคับจริง | MEMBER | Edge | followOnly = on + บัญชีที่ MEMBER ไม่ follow (ACCT-2) | 1. เปิด toggle 2. ให้ ACCT-2 (ที่ไม่ได้ follow) เริ่มแชท/Ask ลิสติ้งของ MEMBER (บนแอปจริง ใช้บัญชีที่สอง; prototype = เรียก `chIncomingAsk(ACCT-2)` ใน console) | ACCT-2 ไม่ได้ห้อง/ข้อความเข้า list ของ MEMBER (ไม่มี thread ใหม่); ทักได้ = FAIL | toggle flip ได้ + บล็อกการเริ่มแชทจริง | Low | |
| FO-TC-CHAT-098 | back จาก chatcfg | MEMBER | Func | chatcfg | 1. กด back | กลับ chat list | — | Low | |
| FO-TC-CHAT-099 | ไม่มีหน้า room settings + ไม่มี Delete ใน chmenu | MEMBER | Edge | chmenu + หัวห้อง + chatcfg | 1. ไล่ทุก entry: หัวห้อง (back/ชื่อ/🔍/≡), chmenu (4 tiles + 2 แถว), chatcfg | **ไม่มี** entry ไปหน้า room settings (Note notifications/wallpaper/export/encryption keys/Delete data) ที่ไหนเลย — dead feature ตาม spec V1; และ **ไม่มี Delete chat ใน chmenu** — ลบได้เฉพาะ swipe บน list หรือ Report and delete; ถ้ามี Delete chat ใน chmenu = FAIL | — | Medium | |

### 2.9 Guest matrix / blocked state / language / theme / edge

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-CHAT-100 | guest ทุก entry → Member Sheet | GUEST | Func | SETUP-03 | 1. ลองทีละ entry: แท็บ Chat / Ask บนการ์ด / Ask บน rail ใน viewer | ทุกอัน → Member Sheet "Join TukDaeng" — ไม่มี chat UI เปิดเลย | sheet เด้งทุกจุด | High | |
| FO-TC-CHAT-101 | guest → sign in → ไม่ resume ไป chat | GUEST→MEMBER | Func | gate เด้งจากแท็บ Chat | 1. ปิด sheet → sign in สำเร็จ | กลับ feed แบบ member — **ยังต้องแตะ Chat เองอีกครั้ง** (ไม่มี pending-action resume สำหรับ nav) | — | Medium | |
| FO-TC-CHAT-102 | block → ผลข้ามจุดทั้งแอป | MEMBER | Int | block USER-BLK แล้ว | 1. ดู list/ห้อง/feed/profile | แถวมี chip "Blocked"; ห้อง blocked bar; feed/comments ของเขาถูกกรอง; profile เปิดได้แต่ interaction ตัด (keep-page rule — ผลเต็ม FO-TEST-16) | — | High | |
| FO-TC-CHAT-103 | สถานะ blocked ใน chmenu + list | MEMBER | Func | ห้อง blocked | 1. เปิด ≡ → ดู tile → กลับ list | tile = Unblock (สถานะ active); แถวแสดง chip "Blocked" แทน mute icon | — | Medium | |
| FO-TC-CHAT-104 | ห้องของลิสติ้งที่ sold แล้ว | MEMBER | Edge | ACCT-2 mark POST-A1 เป็น sold | 1. เปิด THREAD-A → แตะการ์ดลิสติ้ง | ห้อง+ประวัติยังใช้ได้ (chat อยู่เมื่อ sold); การ์ด = snapshot เดิม **ไม่มี sold marker** (spec V1); แตะ → Post Detail เปิดได้ (โพสต์ยังอยู่) | — | Medium | |
| FO-TC-CHAT-105 | ห้องของลิสติ้งที่ owner ซ่อน (hide) | MEMBER | Edge | ACCT-2 ซ่อนลิสติ้งของตัวเองที่ MEMBER มีห้องอยู่ | 1. เปิดห้อง → แตะการ์ด | การ์ดยัง render (snapshot); แตะ → unavailable state "รายการนี้ไม่พร้อมใช้งานแล้ว" (hidden = เห็นเฉพาะเจ้าของ) — เปิด detail ได้ = FAIL | — | Low | |
| FO-TC-CHAT-106 | language TH/EN ทั้งโมดูล | MEMBER | UI | สลับภาษาแอป TH⇄EN | 1. เปิด list/ห้อง/chmenu/attach/gallery/chatcfg/dialogs ทั้งสองภาษา | ข้อความทุกตัวแปลตามภาษาแอปครบ: tabs, search placeholders, swipe buttons, previews "You:", Blocked chip, day labels, Read/Sent, empty states, dialog/sheet/toast — เจอ hardcode ผสมภาษา = FAIL | — | Medium | |
| FO-TC-CHAT-107 | dark theme ทุกหน้า + dialog | MEMBER | UI | เปิด dark theme | 1. เปิด list/ห้อง/menu/gallery → เปิด confirm dialog (Hide/Delete/Unblock) | ทุกหน้า dark ถูกต้อง **รวม confirm dialogs** (ต้องไม่หลุดเป็น light) + ตำแหน่งอยู่ในเฟรมแอปไม่เต็มหน้าต่างผิดเพี้ยน | contrast อ่านได้ | Medium | |

### 2.10 เคสแอปจริงเท่านั้น — incoming / realtime / persistence / push / offline / 2 เครื่อง

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-CHAT-108 | ข้อความขาเข้า → unread + badge + preview | MEMBER + ACCT-2 | Func | SETUP-10/11 · ห้อง THREAD-IN | 1. บนเครื่อง 2: ACCT-2 ส่งข้อความในห้องกับ MEMBER 2. บนเครื่องหลัก: เปิด chat list (pull refresh/เข้าใหม่) | แถว THREAD-IN แสดงข้อความใหม่ + unread pill + badge แท็บเพิ่ม + preview อัปเดต| unread pill ตัวเลขถูก | High | |
| FO-TC-CHAT-109 | คุยสองทางแบบเรียลไทม์ | MEMBER + ACCT-2 | Func | ห้องเดียวกันเปิดบนสองเครื่อง | 1. สลับส่งข้อความจากทั้งสองเครื่องหลายรอบ | ข้อความอีกฝั่งโผล่ในห้องที่เปิดอยู่ (real-time โดยไม่ต้องออก/เข้าห้อง); ลำดับข้อความไม่สลับ | bubble ฝั่งถูกต้อง | High | |
| FO-TC-CHAT-110 | persistence ข้าม restart + re-login | MEMBER | Func | มี threads/pins/mutes/draft | 1. ปิดแอปสนิท → เปิดใหม่ → เปิด chat 2. Log out → sign in กลับ | ห้อง + ประวัติ + pin/mute/draft ยังอยู่ครบ (server-backed); หายหลัง restart = FAIL (spec V1 session-only เป็น deviation ของ prototype เท่านั้น) | — | High | |
| FO-TC-CHAT-111 | push notification ข้อความใหม่ | MEMBER + ACCT-2 | Func | notif on + preview on · แอปหลักอยู่ background/lock | 1. ACCT-2 ส่งข้อความ → ดูการแจ้งเตือนเครื่องหลัก 2. แตะ push | push เด้งพร้อมชื่อผู้ส่ง + เนื้อข้อความ (preview on); แตะ → เปิดแอปไปห้อง/list ที่เกี่ยว — ถ้าระบบยังไม่มี push mark BLOCK | — | High | |
| FO-TC-CHAT-112 | preview off → push ไม่โชว์เนื้อความ | MEMBER + ACCT-2 | Func | notif on + preview off | 1. ACCT-2 ส่ง → อ่าน push | push มาแต่เนื้อข้อความถูกซ่อน (เช่นแสดงแค่ชื่อ/จำนวน) | — | Medium | |
| FO-TC-CHAT-113 | notif off → ไม่มี push แต่ badge อัปเดต | MEMBER + ACCT-2 | Func | notif off | 1. ACCT-2 ส่ง → รอ → เปิดแอป | ไม่มี push เด้ง; เมื่อเปิดแอป unread/badge อัปเดตตามปกติ | — | Medium | |
| FO-TC-CHAT-114 | mute ห้อง → ข้อความใหม่ไม่เด้ง | MEMBER + ACCT-2 | Edge | mute THREAD-IN ไว้ | 1. ACCT-2 ส่งในห้องที่ mute → ดู badge/push | ข้อความใหม่ไม่เพิ่ม badge บนแท็บ + ไม่มี push (ยังนับ badge ห้องที่ mute = FAIL) | mute icon ยังอยู่ | Low | |
| FO-TC-CHAT-115 | ถูก block ฝั่งตรงข้าม → ส่งไม่ถึง | MEMBER + ACCT-2 | Edge | ACCT-2 block MEMBER ไว้ | 1. MEMBER ส่งข้อความในห้องเดิมกับ ACCT-2 → ดูเครื่อง 2 | ACCT-2 **ไม่ได้รับ**ข้อความ; MEMBER เห็นสถานะส่งไม่สำเร็จ/ห้อง read-only/hint ตาม design | — | Medium | |
| FO-TC-CHAT-116 | media ขาเข้า → bubble + gallery + viewer | MEMBER + ACCT-2 | Func | ห้องเปิดทั้งสองเครื่อง | 1. ACCT-2 ส่งรูป/วิดีโอ → ดูฝั่ง MEMBER | media bubble ฝั่งซ้าย + เข้า "Photos & videos"/gallery ของห้อง + แตะเปิด viewer ได้ (วิดีโอเล่นได้ถ้ารองรับ) | — | Medium | |
| FO-TC-CHAT-117 | download → บันทึกลงเครื่องจริง | MEMBER | Func | gallery มีรูป + เครื่องยังไม่เคยอนุญาต | 1. Select → ⬇ → ตอบ permission → เช็ก Photos/Files | ขอสิทธิ์ครั้งแรก (ถ้ายังไม่เคย) + ไฟล์อยู่ใน gallery/file manager ของเครื่องจริง + toast ยืนยัน — ปฏิเสธ permission → toast/hint อธิบาย + ไม่ crash (ไม่มี hint/crash = FAIL) | — | Medium | |
| FO-TC-CHAT-118 | ส่งตอน offline → ไม่หาย/มีสถานะ | MEMBER | Edge | ห้องเปิด + ปิดเน็ต (airplane) | 1. ปิดเน็ต → ส่งข้อความ → เปิดเน็ตคืน | ข้อความ**ไม่หาย** — แสดงสถานะ pending/failed และส่งต่อได้เมื่อเน็ตกลับ; ถ้าข้อความหายเงียบ ๆ = FAIL | bubble มีสถานะชัด | Medium | |
| FO-TC-CHAT-119 | seller เดิมคนละลิสติ้ง → ห้องใหม่ | MEMBER | Func | THREAD-A (POST-A1) มีอยู่ | 1. Ask POST-A2 (seller เดียวกัน คนละลิสติ้ง) → ส่งข้อความ | ห้อง**ใหม่**พร้อมการ์ดของ POST-A2 — ไม่ merge กับ THREAD-A; list มี 2 แถวของ seller เดียวกัน | การ์ดต่างลิสติ้ง | High | |
| FO-TC-CHAT-120 | badge ไม่ใช่ alert — ไม่มี chat ใน Alerts feed | MEMBER + ACCT-2 | Func | มี unread | 1. เปิด Alerts tab → หารายการ chat | ไม่มี alert type ของ chat — badge เฉพาะแท็บ Chat เท่านั้น (canonical 09_NOTIFICATION) | — | Low | |
| FO-TC-CHAT-121 | NEW member → empty states | NEW | UI | SETUP-05 | 1. เปิดแท็บ Chat → ดู Chats + Items | Chats: "No chats yet" + hint ต้องตรง "Tap Ask on a post to start chatting with the seller."; Items: "No item chats yet" + คำอธิบาย — ข้อความตามภาษาแอป | — | Medium | |
| FO-TC-CHAT-122 | log out → ข้อมูล chat ไม่รั่ว + sign in กลับคืน | MEMBER | Func | มี threads | 1. Log out → เปิด chat (เป็น guest) 2. sign in กลับ → เปิด chat | guest ไม่เห็น surface ใดของ chat; sign in กลับ → ห้อง+ประวัติกลับมาครบจาก server | — | Medium | |
| FO-TC-CHAT-123 | ลบแชท → อีกฝั่งไม่กระทบ | MEMBER + ACCT-2 | Func | ห้องที่คุยกันอยู่ | 1. MEMBER ลบห้อง → ดูเครื่อง 2 | ห้องหายฝั่ง MEMBER เท่านั้น — ACCT-2 ยังเห็นห้อง+ประวัติครบ (delete = ฝั่งตัวเอง) | — | Medium | |
| FO-TC-CHAT-124 | Report and delete → อีกฝั่งไม่กระทบ | MEMBER + ACCT-2 | Edge | ทำ Report and delete สำเร็จ (CHAT-083) | 1. หลัง flow จบ → ดูเครื่อง 2 | thread หายเฉพาะฝั่งผู้รายงาน — ACCT-2 ยังเห็นห้องปกติ (รายงานไม่ลบข้อมูลฝั่งถูกรายงาน) | — | Low | |
| FO-TC-CHAT-125 | Chat card → sold post detail ฝั่ง non-owner | MEMBER | Func | ห้องแชทมีการ์ดสินค้าที่ต่อมาถูก Mark as Sold | 1. แตะการ์ดสินค้าในห้องแชท 2. ตรวจสอบหน้า Post Detail ที่เปิดขึ้นมา | เปิด Post Detail ได้ปกติ มี badge หรือแถบสถานะ "Sold" แสดงชัดเจน และไม่มีปุ่ม Ask Seller (GAP-10 / DEC-04) | Post Detail แสดงสถานะ Sold | High | |
| FO-TC-CHAT-126 | Stale Ask entry บนลิสติ้งที่หลุดสาธารณะ | MEMBER | Edge | เปิดหน้าลิสติ้งค้างไว้ก่อนสินค้าถูกลบหรือซ่อน | 1. แตะปุ่ม Ask บนลิสติ้งที่ stale 2. สังเกตผล | ระบบแจ้งเตือน Toast "รายการนี้ไม่พร้อมใช้งานแล้ว" และคงอยู่ที่หน้าเดิม ไม่สร้างห้องแชทซ้ำ (GAP-11 / DEC-05) | Toast แจ้งเตือนสินค้าไม่พร้อมใช้ | Medium | |
| FO-TC-CHAT-127 | ห้องแชทฝั่งคู่สนทนาหลังอีกฝ่าย Deactivate | MEMBER + ACCT-2 | Func | เคยแชทคุยกัน ต่อมา ACCT-2 ขอลบบัญชี (Deactivate) | 1. MEMBER เปิดหน้ารายการแชท 2. แตะเข้าห้องแชทของ ACCT-2 | ห้องแชทและประวัติข้อความเดิมยังคงอยู่ หัวห้องระบุชื่อ "ผู้ใช้งานที่ปิดบัญชี" หรือสถานะ Deactivated และกล่องพิมพ์ข้อความถูกปิด (Disabled) (GAP-15 / DEC-09) | กล่องข้อความ disabled + ชื่อปิดบัญชี | Medium | |

## 3. Spec decisions — findings เดิม GAP-CHAT-01..18 ถูกล็อกเป็นพฤติกรรมจริง (อ้าง `FrontOffice/07_CHAT_MODULE.md`)

| Finding เดิม (รอบ prototype) | Spec ล็อกสำหรับแอปจริง | TC ที่ verify |
|---|---|---|
| GAP-CHAT-01 `chsettings:` dead route (room settings เข้าไม่ได้) | ไม่มีหน้า room settings ใน V1 — ไม่มี entry ใด ๆ (Note notifications/wallpaper/export/keys/Delete data ไม่ใช่ feature) | CHAT-099 |
| GAP-CHAT-02 `.chat-pop`/`.chat-fab` dead (inline DM เปิดไม่ได้) | ไม่มี inline chat pop — Ask/fab เปิดห้องเต็ม; Post Detail ไม่มี chat entry เลย | CHAT-007 |
| GAP-CHAT-03 `ch-modal` ไม่ติด dark + fixed ทั้ง viewport | confirm dialogs ต้องตาม theme ของแอป + อยู่ในเฟรมจอถูกต้อง | CHAT-026,029,107 |
| GAP-CHAT-04 language mismatch สองทิศ (UI EN hardcode, toast TH hardcode) | ข้อความทุกตัวแปลตามภาษาแอปครบ — mismatch = FAIL | CHAT-106 |
| GAP-CHAT-05 ส่งรูปเป็นข้อความแรกใน draft ไม่เข้า list | media send materialize draft + unhide + move-to-top เหมือน text (canonical lock) | CHAT-067 |
| GAP-CHAT-06 badge นับ unread ห้องที่ซ่อน | deviation ล็อก: badge ไม่นับ + Items groups ไม่แสดงห้องที่ซ่อน/mute (canonical lock) | CHAT-031 |
| GAP-CHAT-07 back จากห้อง (เปิดผ่าน Ask) ลง feed ไม่กลับ detail | ล็อก: Ask ปิด overlay + รีเซ็ต stack เหลือห้องหน้าเดียว → back ปิด layer ลง surface ข้างล่าง | CHAT-008 |
| GAP-CHAT-08 ปุ่ม Chat บน profile = toast dead-end | dead entry ตาม spec (canonical 06) — ทุกห้องผูกลิสติ้ง ไม่มี DM เปล่า | CHAT-009 |
| GAP-CHAT-09 `followOnly` | บังคับแล้ว (canonical lock 2026-10-29) — คนที่ไม่ได้ follow เริ่มแชทไม่ได้ | CHAT-097 |
| GAP-CHAT-10 gallery date label hardcode "October 2569 BE" | ป้ายกลุ่มวันที่ต้องตามวันที่จริงของ media — คงที่ = flag | CHAT-086 |
| GAP-CHAT-11 block toast "Blocking" อ่านงง | toast ยืนยัน block (ข้อความตาม design) | CHAT-078 |
| GAP-CHAT-12 timestamp "09:41" ตายตัว + ไม่มี incoming | เวลาจริงของเครื่อง + ข้อความขาเข้าจาก ACCT-2 ทดสอบได้จริง | CHAT-048,108,109 |
| GAP-CHAT-13 ไม่มีวิดีโอใน attach + viewer ไม่มี zoom/swipe | V1: video = เล่นได้ถ้า build รองรับ (ถ้า build ไม่รองรับ → BLOCK พร้อมเหตุผล); viewer = single-image ไม่บังคับ zoom/swipe | CHAT-066,070 |
| GAP-CHAT-14 dead-list ไม่ชนปุ่ม chat | ไม่เกี่ยวกับแอปจริง — ปุ่ม chat ทุกตัวต้องทำงานจริง | ทุกเคส |
| GAP-CHAT-15 item-view rows (aggregate) swipe ไม่ได้ | ล็อก: aggregate rows ใน Items view ไม่มี swipe (แตะเข้าห้อง/item chats); thread rows ใน item chats swipe ได้ | CHAT-034,036 |
| GAP-CHAT-16 nav เข้า chat ใหม่ = reset เสมอ | ล็อก: ทุกครั้งที่แตะแท็บ Chat → default view + เคลียร์ search/filter | CHAT-043 |
| GAP-CHAT-17 gallery ลบรูปไม่ sync bubble | แอปจริงต้องจัดการสอดคล้อง| CHAT-089 |
| GAP-CHAT-18 ลบ/ซ่อน thread สุดท้ายของ item ผลต่างกัน | ล็อก: ลบ → "Item not found"; ซ่อน → "No chats found" | CHAT-044 |

- **spec ล็อกเพิ่มเติมรอบนี้ (เทสได้เฉพาะแอปจริง):** ข้อความขาเข้า/เรียลไทม์ผ่าน ACCT-2 เครื่องที่สอง (CHAT-108,109,116) · persistence server-backed ข้าม restart/re-login (CHAT-110,122) · push + preview + notif toggle (CHAT-111..114) · download ลงเครื่องจริง (CHAT-117) · offline send ไม่หาย (CHAT-118) · ลบ/report ไม่กระทบอีกฝั่ง (CHAT-123,124) · Sent/Read = real receipts (canonical lock): ข้อความเราแสดง Sent → Read เมื่ออีกฝั่งอ่าน — ค้าง Sent หลังอ่าน = FAIL
- **ยังอยู่ task อื่น (ไม่ซ้ำที่นี่):** report stack internals/เหตุผล/moderation = FO-TEST-15/16 · blocked list + unblock ใน Settings = FO-TEST-15 · Post Detail internals = FO-TEST-06 · sheet mechanics = FO-TEST-07 · เมทริกซ์ guest ทั้งแอป = FO-TEST-17 · badge→alerts rules = FO-TEST-10
- **FO-SYNC-01 sync (2026-10-29):** GAP-CHAT-04 (language mismatch สองทิศ) — **RESOLVED ใน prototype**: toast ที่ hardcode TH (`ซ่อนแชทแล้ว`/`ลบแชทเรียบร้อยแล้ว`/`คัดลอกประวัติแชทเรียบร้อยแล้ว`/`ลบรูปภาพที่เลือกแล้ว`/`บันทึกลงในรูปภาพแล้ว` + wallpaper notice) ทำคู่ isTh/EN แล้ว + chat hide/delete confirm modals ตามภาษาแอป + EN ที่ขาดเข้า `I18N_TH` dict — contract ภาษาเดิมไม่เปลี่ยน; gallery date label/timestamp ตายตัว = mock (documented deviation เดิม)

## 4. Traceability audit — chat vs inventory §2.7

| Inventory row | TC ที่ครอบ |
|---|---|
| `chat` Chats view (rows, unread, pin/mute/blocked chips, `You:` preview, time, search) | CHAT-011..031, 108, 121 |
| `chat` Items view + filter popover (`Your listings`/`Items you asked about`/isDirectRoom) | CHAT-032..042 |
| `chatitem:id` (head/pill/search/rows+swipe/empty) | CHAT-035..038, 044 |
| `chatroom:id` (header/bubbles/day/Sent-Read/post card/composer/draft/blocked bar/room search) | CHAT-003,004,010,045..061, 109, 118 |
| attach sheet + media message | CHAT-062..067, 116 |
| `ch-media-viewer` | CHAT-068..070 |
| `chmenu:id` (4 tiles/media strip/Listings/E2E footer/ไม่มี Delete) | CHAT-071..085, 099 |
| `chmedia:id` gallery + select mode | CHAT-086..092, 117 |
| `chsettings:id` | CHAT-099 (**dead route — ไม่มี entry พิสูจน์แล้ว**, spec V1 ไม่มีหน้านี้) |
| `chatcfg` | CHAT-093..098 |
| Hide/Delete confirm dialogs | CHAT-026..029, 107 |
| block sheet (fromChat ปุ่มเดียว) + unblock dlg | CHAT-058..060,077..079,085,102,103,115 |
| `chatReport` sheet + report:user/done (ไม่มี back) + rpDelChat | CHAT-080..085, 124 |
| Quick Ask (entries/draft/prefill/own/blocked/un-hide) | CHAT-001..010, 030, 067, 096, 119 |
| guest gate | CHAT-001,002,100,101 |
| badge/notification | CHAT-013,031,108,111..114,120 |
| session/persistence | CHAT-110,122,123 |
| edge: sold/hide/deleted listing, offline, language, theme | CHAT-053,104,105,106,107,118 |

- สถิติ: **127 TC** — High 51 / Medium 51 / Low 25 (SETUP rows 11 แถวแยกใน checklist; รวมใน csv 138 แถว)


## DEC-25 Amendments (ผลตามข้อตัดสิน IG — CSV ยังไม่ sync)

- CHAT-086: ยกเลิก (ไม่มีการจัดกลุ่มตามวันในแกลเลอรี — C1)
- CHAT-097: ผ่านเมื่อเปิด "Only people I follow" แล้วข้อความจากคนที่ไม่ได้ตามเข้าโฟลเดอร์ Requests (C2)
- CHAT-110 / CHAT-118 / CHAT-127 / CHAT-031 / CHAT-048 / CHAT-067 / CHAT-070: expected ตาม DEC-25 (ดู 07 Amendments) — สถานะ "ไม่ตรง" ใน batch B เป็น implementation gap ไม่ใช่ expected ผิด
