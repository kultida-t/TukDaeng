# FO-TEST-02 — Test Cases: Shell & Navigation (สำหรับเทสแอปจริงบนมือถือ)

> Task: FO-TEST-02R ของชุด FO-TEST-001 (ต่อยอดจาก FO-TEST-02 ที่ปิดไปแล้ว) · ปรับเป็นเวอร์ชันเทสแอปจริง: 2026-10-28
> กติกาหลัก: `deliverables/FO-TEST-001-testcase-prompt.md` · Task breakdown: `deliverables/FO-TEST-001-task-breakdown.md`
> แหล่งออกแบบเคส: `Prototypes/fo-flow/index.html` (ใช้เป็นแม่แบบแตกเคส/expected เท่านั้น — ทุกเคสเขียนให้ทำบนแอปจริงได้)
> สัญญาความครอบคลุม: `deliverables/FO-TEST-001-00-inventory.md` §2.12 เป็นหลัก + แถว feed tabs ใน §2.2 — ไม่เดา behavior เพิ่ม

## 0. สภาพแวดล้อมเทส + วิธีใช้เอกสาร

- **อุปกรณ์:** โทรศัพท์มือถือเครื่องจริง ติดตั้งแอป TukDaeng build ทดสอบจาก Google Play (Android) / App Store หรือ TestFlight (iOS) ตามที่ทีมแจก — ห้ามเทสผ่าน browser/prototype
- รีเซ็ตสถานะแอปด้วย **การลบแอปแล้วติดตั้งใหม่** หรือ Clear app data (Android: ตั้งค่าระบบ → Apps → TukDaeng → Storage → Clear data) — ใช้เมื่อเคสต้องการ first-run state (onboarding/coach marks)
- **Actor**: `GUEST` = ยังไม่ล็อกอิน (เดิน onboarding แล้วกด Skip for now หรือ logout), `MEMBER` = ล็อกอินบัญชีทดสอบที่ทีมมอบหมาย, `NEW` = สมัครบัญชีใหม่ผ่าน flow จริง (member powers แต่ข้อมูลว่าง)
- **ข้อมูลทดสอบที่ต้องได้จากทีมก่อนเริ่ม (SETUP-06):** บัญชีทดสอบ (email+password), อีเมลที่รับ OTP จริงได้ (สำหรับสมัครใหม่), บัญชีที่มี unread เยอะหรือ tooling สร้าง unread ถ้าจะเทส badge เกิน 99 (SHELL-030)
- **เลื่อนหน้าจอ = ใช้นิ้วปัดบนจอจริงเท่านั้น** (ไม่ใช่ mouse wheel/drag) — scroll-to-hide ให้เลื่อนลงจนแถบ header/nav หลบ แล้วเลื่อนขึ้นจนแถบกลับมา
- **status bar ด้านบนจอ** = ของเครื่องจริง (เวลา/สัญญาณ/แบตเตอรี่จริง) — expected เทียบองค์ประกอบเท่านั้น ไม่ตรึงตัวเลขเวลา
- **สลับธีม/ภาษา** = ผ่านหน้า Settings ในแอป (SETUP-07) หรือธีมระบบของเครื่อง (ถ้าแอปตั้งให้ตามระบบ) — บนแอปจริงไม่มีปุ่มลัดสลับธีมแบบ dev
- **เล่น coach marks (ทัวร์แนะนำการใช้งาน) ซ้ำ** = ทัวร์เด้งครั้งเดียวต่อการติดตั้ง → ต้อง reinstall/clear app data แล้วเดิน onboarding เข้า feed ใหม่ (SETUP-09)
- **ตัวเลขเวลา/ระยะตายตัว** (เช่น toast ~2 วิ, ระยะเลื่อนที่ทำให้แถบหลบ, animation) เป็นค่าอ้างอิงจาก design — บนแอปจริงให้จดค่าที่เห็นจริงลง Note; ถ้าต่างให้ flag ทีมตัดสิน ไม่ FAIL อัตโนมัติ
- **ข้อความ EN ในคอลัมน์ expected** เป็นค่าอ้างอิงจาก design — ถ้าแอปจริง wording ต่างแต่ความหมายเหมือนกัน ให้จดใน Note แทน FAIL
- **คอลัมน์ "ทดสอบบน (Device/OS)"** ใน checklist — จดเครื่อง+OS ที่รันเคสนั้นทุกแถวที่เล่นจริง (เช่น `iPhone 15 · iOS 18`, `Galaxy S24 · Android 15`); เคสที่รันคนละเครื่องให้จดค่าที่ใช้ ถ้าเคสเฉพาะ OS ใด (เช่น SHELL-054 เฉพาะ Android) ให้ระบุไว้ในช่องนี้
- **Type**: UI = การแสดงผล · Func = การทำงาน · Int = เชื่อมข้าม module · Edge = negative/boundary
- **Priority**: High = core flow/กติการะบบ · Medium = feature หลัก · Low = edge/cosmetic
- **[GATE]**: action ที่ guest แตะแล้วเด้ง Member Sheet "Join TukDaeng" — ทุกเคส [GATE] ในไฟล์นี้มีคู่ guest/member ครบ; mechanics ของ sheet อยู่ FO-TEST-01 (AUTH-061–068) และเมทริกซ์ gate ทั้งแอปอยู่ FO-TEST-17
- **scroll-to-hide** ตาม design ทำงานเฉพาะหน้า Feed: เลื่อนลงพอประมาณ → header ลอยขึ้นหลบ + bottom nav จมลง; เลื่อนขึ้นหรือถึงบนสุด → แถบกลับมา (เคส SHELL-042–048)
- **Bottom nav** แสดงเฉพาะหน้า root 5 แท็บ + หน้าโปรไฟล์ — หน้าลึกและ overlay (Post Viewer, Post Detail) ไม่มี nav
- **variant พิเศษของ navigation** (nav แบบไอคอนล้วนไม่มี label, header แบบไม่มี feed tabs, dev sidebar ฯลฯ) เป็น dev harness ของ prototype — out of scope เหมือนเดิม ไม่เขียน TC และไม่ mark BLOCK

## 1. Coverage Map ของ task นี้ (เทียบ inventory §2.12 + §2.2)

| Route/Overlay (inventory) | TC ID ที่ครอบ |
|---|---|
| app header — burger / search / wordmark / + create (§2.12) | SHELL-001 – 007 |
| hamburger menu (≡ drawer) — 9 เมนู placeholder (§2.12) | SHELL-008 – 020 |
| bottom nav 5 แท็บ + badge (§2.12) | SHELL-021 – 034, 065 |
| feed shell — แถบเลือกแท็บฟีด (segmented control) + pill ชี้แท็บ active + empty ต่อ tab (§2.2 — เฉพาะ shell; เนื้อหาการ์ด → FO-TEST-03) | SHELL-035 – 041 |
| scroll/anim mechanics — scroll-to-hide (§2.12) | SHELL-042 – 048 |
| scroll/anim mechanics — เปิดหน้าลึก/ถอยหลัง/overlay ซ้อน/scroll snap (§2.12) | SHELL-049 – 056 (เว้น 055 — ตัดออก desktop-only) |
| coach marks (member/guest) — mechanics defer มาจาก FO-TEST-01 ไม่ใช่แถว inventory แยก | SHELL-057 – 061 |
| Language/Theme — EN/TH + light/dark (§2.12 — spot-check เท่านั้น; sweep เต็มอยู่ FO-TEST-19) | SHELL-062 – 064 |
| toast / pin pill (§2.12) — อยู่ในความรับผิดชอบของ module ที่ trigger (FO-TEST-03..17) | — (note) |
| dev harness variants — nav ไอคอนล้วน / header ไม่มี feed tabs / dev sidebar (§2.12) | — out of scope |

## 2. Test Cases

### 2.1 App Header

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-SHELL-001 | app header layout | MEMBER | UI | member อยู่หน้า feed | 1. ตรวจแถวบนสุดของ feed 2. ดู status bar ของเครื่อง + ขอบล่างจอ | — | status bar ของเครื่องจริง (เวลา/สัญญาณ/แบตจริง — ไม่ตรึงค่า); header: burger + search (ซ้าย), wordmark "TUK DAENG" แดงกลางจอ (ไม่มี caret), spacer, ปุ่ม + (ขวา); home indicator/ขอบล่างตาม OS | Medium | |
| FO-TC-SHELL-002 | ปุ่ม burger บน header | MEMBER | Func | อยู่ feed | 1. แตะไอคอน burger มุมซ้ายบน | hamburger menu (drawer) เลื่อนเข้าจากซ้าย | panel ทาบซ้าย + scrim มืดคลุม feed | High | |
| FO-TC-SHELL-003 | ปุ่ม search บน header | MEMBER | Func | อยู่ feed | 1. แตะไอคอน search | หน้า Search landing เด้งเต็มจอ (explore tiles + popular chips + recents) | หน้า search ทับ feed; bottom nav ของ feed ถูกซ่อน (หน้า search ไม่มี nav ของตัวเอง) | High | |
| FO-TC-SHELL-004 | ปุ่ม + create [GATE] | MEMBER | Func | อยู่ feed | 1. แตะปุ่ม + | หน้า create (media picker) เปิดเต็มจอ | หน้า create ทับ feed | High | |
| FO-TC-SHELL-005 | ปุ่ม + [GATE] | GUEST | Func | guest อยู่ feed | 1. แตะปุ่ม + 2. แตะ scrim ปิด sheet | + เป็น gated action → Member Sheet เด้ง; create ไม่เปิด; ปิด sheet → ยัง guest บน feed | sheet "Join TukDaeng" + gate copy ประมาณ "Sign in or create a free account to use this feature." | High | |
| FO-TC-SHELL-006 | ปุ่ม search | GUEST | Func | guest อยู่ feed | 1. แตะไอคอน search | search **ไม่ถูก gate** → หน้า search เปิดได้ฟรี | เหมือน SHELL-003 | Medium | |
| FO-TC-SHELL-007 | wordmark | MEMBER | Edge | อยู่ feed (โหมดปกติ) | 1. แตะ wordmark "TUK DAENG" / บริเวณกลาง header | ไม่มี action ในโหมดปกติ → ไม่เกิดอะไร (wordmark ตอบสนองเฉพาะ dev variant ที่ out of scope) | ไม่มี caret แสดง; แตะแล้วนิ่ง | Low | |

### 2.2 Hamburger Menu (≡ drawer)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-SHELL-008 | drawer UI | MEMBER | UI | อยู่ feed → เปิด drawer | 1. แตะ burger 2. ตรวจ panel | — | panel ชิดซ้ายมี 9 แถวเรียงต่อกัน แต่ละแถว = icon + label + chevron › ขวา; scrim มืดคลุม feed ทั้งจอ | Medium | |
| FO-TC-SHELL-009 | scrim close | MEMBER | Func | drawer เปิดอยู่ | 1. แตะบริเวณมืด (scrim) ขวาของ panel | drawer เลื่อนออกปิด | feed กลับมาใช้งานได้ตามเดิม | High | |
| FO-TC-SHELL-010 | drawer item — Watch Brands | MEMBER | Func | drawer เปิดอยู่ | 1. แตะแถว "Watch Brands / แบรนด์นาฬิกา" | ตาม design เมนูยังไม่มีหน้าปลายทาง — ควรมี toast/ข้อความแจ้งว่ายังไม่เปิดใช้ (เช่น "Coming soon") ~2 วิ ไม่มี navigation; **จดพฤติกรรมจริง** — ถ้าเปิดหน้าจริงหรือไม่มีแถวนี้ให้จด Note | toast/ข้อความลอยล่างจอ; drawer ยังเปิดค้าง | Medium | |
| FO-TC-SHELL-011 | drawer item — Watch Price Index | MEMBER | Func | drawer เปิดอยู่ | 1. แตะ "Watch Price Index / ดัชนีราคานาฬิกา" | เหมือน SHELL-010 — จดพฤติกรรมจริง | เหมือน SHELL-010 | Medium | |
| FO-TC-SHELL-012 | drawer item — Watch Shops | MEMBER | Func | drawer เปิดอยู่ | 1. แตะ "Watch Shops / ร้านนาฬิกา" | เหมือน SHELL-010 — จดพฤติกรรมจริง | เหมือน SHELL-010 | Medium | |
| FO-TC-SHELL-013 | drawer item — Accessories Shop | MEMBER | Func | drawer เปิดอยู่ | 1. แตะ "Accessories Shop / ร้านอุปกรณ์เสริม" | เหมือน SHELL-010 — จดพฤติกรรมจริง | เหมือน SHELL-010 | Medium | |
| FO-TC-SHELL-014 | drawer item — Repair Shop | MEMBER | Func | drawer เปิดอยู่ | 1. แตะ "Repair Shop / ศูนย์ซ่อมแซม" | เหมือน SHELL-010 — จดพฤติกรรมจริง | เหมือน SHELL-010 | Medium | |
| FO-TC-SHELL-015 | drawer item — Auction Center | MEMBER | Func | drawer เปิดอยู่ | 1. แตะ "Auction Center / ศูนย์ประมูล" | เหมือน SHELL-010 — จดพฤติกรรมจริง | เหมือน SHELL-010 | Medium | |
| FO-TC-SHELL-016 | drawer item — Consignment Center | MEMBER | Func | drawer เปิดอยู่ | 1. แตะ "Consignment Center / ศูนย์ฝากขาย" | เหมือน SHELL-010 — จดพฤติกรรมจริง | เหมือน SHELL-010 | Medium | |
| FO-TC-SHELL-017 | drawer item — Authentication Center | MEMBER | Func | drawer เปิดอยู่ | 1. แตะ "Authentication Center / ศูนย์ตรวจเช็คแท้" | เหมือน SHELL-010 — จดพฤติกรรมจริง | เหมือน SHELL-010 | Medium | |
| FO-TC-SHELL-018 | drawer item — Community | MEMBER | Func | drawer เปิดอยู่ | 1. แตะ "Community / ชุมชนคนรักนาฬิกา" | เหมือน SHELL-010 — จดพฤติกรรมจริง | เหมือน SHELL-010 | Medium | |
| FO-TC-SHELL-019 | drawer dismiss paths | MEMBER | Edge | drawer เปิดอยู่ | 1. แตะพื้นว่างใน panel (ไม่โดนแถว) 2. แตะ burger ซ้ำ 3. (Android) กดปุ่ม/เจสเจอร์ back ของเครื่อง | แตะพื้นว่างไม่ทำอะไร; burger ซ้ำ = ยังเปิดอยู่ — ทางปิดหลักตาม design คือ scrim; device back ให้จดผลจริง (ปิด/ไม่ปิด) | drawer ค้างเปิดจนกว่าจะแตะ scrim (หรือ device back ถ้าแอปรองรับ) | Low | |
| FO-TC-SHELL-020 | drawer as guest | GUEST | Func | guest อยู่ feed | 1. แตะ burger 2. แตะแถวใดก็ได้ | drawer **ไม่ถูก gate** → เปิดปกติ; แถวเมนู → toast/ข้อความเดียวกับ member | เหมือน member | Medium | |

### 2.3 Bottom Nav (5 แท็บ)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-SHELL-021 | bottom nav UI | MEMBER | UI | อยู่ feed | 1. ตรวจแถบนำทางล่าง | — | floating pill 5 item: Feed/Chat/Boards/Alerts/Profile (ไอคอน+label); pill active หลัง Feed; badge เลข unread บน Chat+Alerts (ถ้าบัญชีมี) | Medium | |
| FO-TC-SHELL-022 | nav แต่ละแท็บ | MEMBER | Func | อยู่ feed | 1. แตะ Chat 2. แตะ Board 3. แตะ Alerts 4. แตะ Profile 5. แตะ Feed | แต่ละแท็บเปิดหน้า chat / board / alerts / own-profile / feed ตามลำดับ; active pill ย้ายตาม; เปิดแบบสลับทันที (ไม่มี slide จากขวาเหมือนหน้าลึก) | หน้า root ของแท็บนั้นแสดงพร้อม nav | High | |
| FO-TC-SHELL-023 | nav guest — Chat/Alerts/Profile [GATE] | GUEST | Func | guest อยู่ feed | 1. แตะ Chat 2. ปิด sheet 3. แตะ Alerts 4. ปิด sheet 5. แตะ Profile | ทั้ง 3 แท็บเป็น gated → Member Sheet เด้งทุกครั้ง; แท็บ **ไม่สลับ** (อยู่ feed เหมือนเดิม) | sheet "Join TukDaeng" ทับ feed; nav/badge/active ไม่เปลี่ยน | High | |
| FO-TC-SHELL-024 | nav member — แท็บที่ gate (คู่ 023) [GATE] | MEMBER | Func | member อยู่ feed | 1. แตะ Chat 2. แตะ Alerts 3. แตะ Profile | member ไม่เจอ sheet — ทุกแท็บเปิดหน้าปกติ | เหมือน SHELL-022 | High | |
| FO-TC-SHELL-025 | nav guest — Feed/Board | GUEST | Func | guest อยู่ feed | 1. แตะ Feed 2. แตะ Board | feed + board **ไม่อยู่ใน gate** → ใช้ได้ฟรี; board เปิดหน้า board ปกติ | ไม่มี Member Sheet | Medium | |
| FO-TC-SHELL-026 | nav re-tap Feed (refresh rule) | MEMBER | Func | อยู่ feed เลื่อนลงมาลึก | 1. เลื่อน feed ลงกลาง ๆ ด้วยนิ้ว 2. แตะแท็บ Feed ซ้ำ | re-tap = refresh — feed render ใหม่ + เลื่อนกลับขึ้นบนสุดแบบ smooth | การ์ด re-render + เลื่อนขึ้นนุ่ม ๆ | High | |
| FO-TC-SHELL-027 | nav re-tap ขณะอยู่หน้าลึกของแท็บ (root reset) | MEMBER | Func | member เข้าห้องแชทจาก chat list | 1. แตะ Chat → แตะห้องแชทใดก็ได้ 2. แตะแท็บ Chat อีกครั้ง | แตะแท็บซ้ำขณะอยู่หน้าลึก → กลับ root ของแท็บนั้น (chat list) ไม่ใช่ถอยทีละชั้น | chat list แสดงใหม่ (ตัวกรอง/ช่องค้นหาของ list reset) | High | |
| FO-TC-SHELL-028 | nav roundtrip — feed scroll kept | MEMBER | Func | อยู่ feed เลื่อนลงกลาง ๆ | 1. แตะ Board 2. แตะ Feed กลับ | feed กลับมาที่ตำแหน่ง scroll เดิมพอดี (ต่างจาก re-tap ใน 026 ที่ refresh) | feed กลับมาที่จุดเดิม ไม่รีเฟรช | Medium | |
| FO-TC-SHELL-065 | nav roundtrip — tab state kept ทุกแท็บ | MEMBER | Func | member sign in อยู่ | 1. เปิด Alerts → เลื่อนลงกลาง ๆ → แตะ Feed → แตะ Alerts กลับ 2. ทำซ้ำกับ Board (เลื่อนลง) และ Chat (เลื่อนลงถ้า list ยาว) 3. เปิด Alerts → แตะแถวแจ้งเตือนเข้าหน้าลึก (เช่น โปรไฟล์จากแถว follow) → แตะ Feed → แตะ Alerts กลับ | ทุกแท็บกลับมาที่**ตำแหน่ง scroll เดิม** (สลับแท็บ ≠ รีเฟรช — มาตรฐาน tab จำ state ของตัวเองแบบ IG); แท็บที่เข้าหน้าลึกไว้กลับมาเจอ**หน้าลึกนั้นที่ตำแหน่งเดิม** — ถ้าแท็บไหนกลับมาเด้งขึ้นบนสุด/ลืมหน้าลึก = FAIL (ยกเว้น re-tap แท็บเดิม = root reset ตาม 027) | หน้าลึกและตำแหน่งคงอยู่ข้ามการสลับแท็บ | High | |
| FO-TC-SHELL-029 | nav badge — chat + alerts | MEMBER | UI | member มี unread | 1. ดู badge บน Chat + Alerts 2. เข้า Alerts → อ่าน/mark all read → ดู badge อีกครั้ง | badge แสดงเลข unread จริง; อ่านหมดแล้ว badge หาย/ลดตามจริง | badge เลขแดงทับไอคอน | High | |
| FO-TC-SHELL-030 | nav badge `99+` cap | MEMBER | Edge | ต้องมี unread >99 | 1. ดู badge เมื่อ unread เกิน 99 — ต้องอาศัยบัญชีเทสที่มี unread >99 หรือ tooling/seed จากทีม | ตาม design แสดง "99+"; ถ้าไม่มีทางสร้าง unread ถึง 99 บน build นี้ → mark BLOCK พร้อมเหตุผล (ต้องการ test data/tooling) | ข้อความ "99+" | Low | |
| FO-TC-SHELL-031 | nav badge — guest/new | GUEST vs NEW | Edge | session guest และ new | 1. ดู nav บน feed ทั้งสอง session | guest/new ไม่มีข้อมูล unread → ไม่มี badge เลย | nav ไม่มีเลขทั้งคู่ | Medium | |
| FO-TC-SHELL-032 | nav active บน public profile | MEMBER | Edge | เปิด profile คนอื่น (แตะ avatar/ชื่อบนโพสต์) | 1. ดู active pill บน nav ขณะอยู่หน้าโปรไฟล์เขา | ตาม design pill อยู่ที่ **Feed** (ไม่ใช่ Profile) — จดผลจริง | Feed active แม้อยู่หน้า profile | Low | |
| FO-TC-SHELL-033 | nav หายใต้ overlay | MEMBER | Func | เปิด Post Viewer จาก grid tile | 1. แตะ grid tile → viewer เปิด 2. ดู nav 3. กด back ปิด viewer | nav หายระหว่าง viewer/Post Detail เปิด; ปิดแล้ว nav กลับมาเหมือนเดิม | nav หายระหว่าง overlay | Medium | |
| FO-TC-SHELL-034 | nav บนหน้าลึก | MEMBER | Edge | เข้าหน้าลึก (เช่น settings, saved, ห้องแชท) | 1. เข้าหน้าลึกแล้วดูด้านล่างจอ | หน้าลึก **ไม่มี bottom nav** — ออกได้เฉพาะลูกศร back บนซ้าย (nav มีเฉพาะ root 5 หน้า + หน้าโปรไฟล์) | ไม่มี pill ลอยล่าง | Medium | |

### 2.4 Feed Tabs (แถบเลือกแท็บฟีด)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-SHELL-035 | feed tabs UI | MEMBER | UI | อยู่ feed | 1. ดูแถบใต้ header | — | 3 ปุ่ม All Posts / Following / Favorites + pill ชี้ตำแหน่งอยู่ใต้แท็บ active (ค่าเริ่มต้น "all") | Medium | |
| FO-TC-SHELL-036 | feed tab — Following | MEMBER | Func | อยู่ feed | 1. แตะ "Following" | สลับเป็นฟีดเฉพาะคนที่ follow + scroll กลับบนสุด + pill เลื่อนมาใต้ Following | pill slide ไปใต้ Following; เนื้อหาเปลี่ยน | High | |
| FO-TC-SHELL-037 | feed tab — Favorites | MEMBER | Func | อยู่ feed | 1. แตะ "Favorites" | เหมือน 036 แต่กรองเฉพาะโพสต์ favorite | pill ใต้ Favorites; เห็นเฉพาะโพสต์ favorite | High | |
| FO-TC-SHELL-038 | feed tab — re-tap active | MEMBER | Edge | อยู่แท็บ All Posts | 1. แตะ "All Posts" ซ้ำ | แท็บที่ active อยู่แล้วกดซ้ำ → ไม่ re-render ไม่มีอะไรเปลี่ยน | หน้าจอนิ่ง | Low | |
| FO-TC-SHELL-039 | feed tab — following empty | NEW | UI | session new (ไม่เคย follow) | 1. แตะ "Following" | แสดง empty state | icon คน + ข้อความประมาณ "Follow others to see their posts here / ติดตามผู้อื่นเพื่อดูโพสต์ของพวกเขาที่นี่" | Medium | |
| FO-TC-SHELL-040 | feed tab — favorites empty | GUEST | UI | guest อยู่ feed | 1. แตะ "Favorites" | แสดง empty state | icon ดาว + ข้อความประมาณ "No favorites yet / ยังไม่มีรายการโปรด" | Medium | |
| FO-TC-SHELL-041 | feed tabs as guest | GUEST | Func | guest อยู่ feed | 1. สลับ Following ↔ Favorites ↔ All Posts | feed tabs **ไม่ถูก gate** → สลับได้ปกติ; following/favorites = empty state | tabs ทำงานเหมือน member | Medium | |

### 2.5 Scroll-to-hide (แถบหลบตอนเลื่อน)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-SHELL-042 | scroll-to-hide — hide | MEMBER | Func | อยู่ feed บนสุด | 1. ปัดฟีดลงแรง ๆ ด้วยนิ้ว (ผ่านช่วงโพสต์แรกไป) | เลื่อนลงพอประมาณ → header หลบขึ้นด้านบน + bottom nav จมลงหาย; ลองแตะ nav ตอนนี้กดไม่ได้ (ระยะ threshold จริงจด Note) | header หลบขึ้น + nav จมลง | High | |
| FO-TC-SHELL-043 | scroll-to-hide — show | MEMBER | Func | แถบหลบอยู่ | 1. ปัดฟีดขึ้นแรง ๆ | header + nav สไลด์กลับมาครบ | ทั้งสองแถบกลับ | High | |
| FO-TC-SHELL-044 | scroll-to-hide — top force | MEMBER | Func | แถบหลบอยู่ | 1. เลื่อนจนชนบนสุดของฟีด | แถบทั้งคู่กลับมาเองทันทีที่ถึงบนสุด (ไม่ต้องเลื่อนขึ้นแรง) | แถบโผล่ที่จุดบนสุดเสมอ | Medium | |
| FO-TC-SHELL-045 | scroll-to-hide — small deltas | MEMBER | Edge | อยู่ feed | 1. แกว่งเลื่อนลง-ขึ้นทีละน้อย ๆ ด้วยนิ้ว | เลื่อนน้อยไม่ถึงเกณฑ์ → ไม่ hide/show | แถบนิ่ง ไม่กระพริบ | Low | |
| FO-TC-SHELL-046 | สถานะหลบต้องไม่ลามไปหน้าอื่น | MEMBER | Edge | แถบหลบอยู่ → แตะ avatar โพสต์ | 1. เข้า profile คนอื่น 2. ดู nav + เลื่อนหน้า profile 3. back กลับ feed → เลื่อนขึ้น | scroll-to-hide ใช้ได้เฉพาะหน้า feed เท่านั้น — nav ของหน้าอื่นต้องแสดงปกติเสมอ ห้ามหลบตามสถานะของ feed; ถ้า nav หน้า profile หายตาม → **FAIL เป็น bug** | nav หน้า profile แสดงชัด ไม่หาย; กลับ feed แล้วเลื่อนขึ้นแถบ feed คืนตามเดิม | High | |
| FO-TC-SHELL-047 | scroll ในหน้าอื่นไม่ hide | MEMBER | Func | เปิด alerts/chat/board | 1. เลื่อน list ในหน้านั้นลงยาว ๆ | scroll-to-hide ทำงานเฉพาะหน้า feed → nav ของหน้าอื่นอยู่นิ่ง | nav ของหน้านั้นอยู่นิ่งตลอด | Medium | |
| FO-TC-SHELL-048 | scroll lock ตอน sheet เปิด | MEMBER | Edge | เปิด comments sheet บน feed | 1. พยายามเลื่อนฟีดใต้ sheet | ฟีดเลื่อนไม่ได้จนกว่าปิด sheet | feed นิ่งจนกว่าปิด sheet | Low | |

### 2.6 Back & Navigation Mechanics

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-SHELL-049 | back จากหน้าระดับแรก | MEMBER | Func | เปิดหน้า Search | 1. แตะลูกศร back บนซ้าย | หน้าเลื่อนออกขวากลับ feed | feed เผยข้างล่างสภาพเดิม | High | |
| FO-TC-SHELL-050 | back หน้าซ้อน (slide ขวา) | MEMBER | Func | เปิด settings → หน้าลูก (เช่น Language) | 1. แตะลูกศร back บนซ้าย | หน้าปัจจุบันเลื่อนออกขวาเหนือหน้าก่อนที่อยู่นิ่ง → กลับหน้าก่อนหน้าพอดี | animation ขวา-ออกเสมอ ไม่มี slide ซ้าย-เข้า | High | |
| FO-TC-SHELL-051 | alerts back → feed เสมอ | MEMBER | Func | เปิด alerts จาก nav | 1. แตะ back บนซ้ายของหัว alerts | back ของหน้า alerts = **กลับ feed เสมอ** (ไม่ถอยทีละชั้น — กติการะบบ) | หน้า alerts ถูกแทนด้วย feed | High | |
| FO-TC-SHELL-052 | alerts → profile → back chain | MEMBER | Func | อยู่ alerts | 1. แตะแถว alert แบบ follow → โปรไฟล์ push ขึ้น 2. แตะ back 3. แตะ back ของ alerts อีกครั้ง | แถว → โปรไฟล์ทับ alerts; back → กลับ **alerts** (ไม่ feed); back ของ alerts → feed เสมอ | chain: alerts → profile → alerts → feed | High | |
| FO-TC-SHELL-053 | overlay ซ้อน back chain | MEMBER | Func | tile → Post Viewer → "View full detail" | 1. เปิด viewer จาก tile 2. เปิด detail 3. back ของ detail 4. back ของ viewer | detail อยู่เหนือ viewer เสมอ — back ของ detail เผย viewer ข้างล่าง; back ของ viewer กลับต้นทาง | layering: หน้าลึก < viewer < detail | High | |
| FO-TC-SHELL-054 | ปุ่ม back ของระบบ (Android) | MEMBER | Func | อยู่หน้าลึกใดก็ได้ (เช่น settings→language, ห้องแชท, Post Detail) | 1. (Android) กดปุ่ม/เจสเจอร์ back ของเครื่อง 2. กลับ feed root แล้วกดอีกครั้ง 3. (iOS ไม่มีปุ่ม back — ข้าม) | back ของระบบ = **ถอยหน้าภายในแอปเทียบเท่าลูกศร back ในแอป** เสมอ (มาตรฐาน Android back navigation) — ห้ามออกจากแอปตอนอยู่หน้าลึก; ที่หน้า root (feed) ถึงออกจากแอป/minimize ตามมาตรฐาน OS — ถ้าออกกลางทาง/ไม่ถอย = **FAIL เป็น bug** | ถอยไปหน้าก่อนหน้าเหมือนกด back ในแอป | High | |
| FO-TC-SHELL-056 | viewer scroll snap | MEMBER | Func | เปิด Post Viewer แบบ immersive (จาก tile ที่เข้า track หลายโพสต์) | 1. เลื่อน viewer ขึ้นลงช้า ๆ ด้วยนิ้ว 2. เทียบกับ viewer จาก saved/search tile (แบบ list) | immersive: snap ทีละโพสต์เต็มจอ (เลื่อนครึ่งใบค้างไม่ได้); แบบ list: เลื่อนอิสระ | สัมผัสการเลื่อนต่างกันชัดต่อ mode | Medium | |

### 2.7 Coach Marks (ทัวร์แนะนำการใช้งาน)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-SHELL-057 | tour start (member/new) | NEW | Func | สมัครใหม่จบ onboarding → เข้า feed ครั้งแรก | 1. ดู bubble แรก | bubble แรกชี้ปุ่ม + บน header | bubble แดงโปร่ง + arrow ชี้เป้า + ปุ่ม "Next" | Medium | |
| FO-TC-SHELL-058 | tour Next → Got it | NEW | Func | bubble 1 แสดง | 1. กด Next ×3 2. กด "Got it" ที่จุดสุดท้าย | bubble เดิน 4 จุด: + → search → feed tabs → bottom nav; จุดสุดท้ายปุ่มเป็น "Got it" กดแล้วจบ | arrow ชี้เป้าแต่ละจุด; bubble flip เหนือ/ใต้ตามตำแหน่ง | Medium | |
| FO-TC-SHELL-059 | tour dismiss outside | NEW | Func | bubble ใดก็ได้แสดง | 1. แตะจอนอก bubble | bubble หายทันที — จบ tour เงียบ | bubble หาย | Medium | |
| FO-TC-SHELL-060 | tour guest copy | GUEST | Func | first-run → กด Skip for now (non-gate) | 1. ดู bubble จุดแรก + กด Next ไปจุดสุดท้าย | copy เวอร์ชันชวนสมัคร ต่างจาก member: จุดแรกประมาณ "Sign up to create your first post." + จุดสุดท้ายประมาณ "Sign in to use chat, alerts and your profile." | copy ชวน sign-up แทน how-to | Medium | |
| FO-TC-SHELL-061 | ทัวร์เล่นครั้งเดียวต่อการติดตั้ง | MEMBER | Edge | เครื่องนี้เคยเห็นทัวร์แล้ว | 1. ออกจากระบบ → sign in บัญชีทดสอบ → ดู feed 2. ลบแอป/เคลียร์ data → ติดตั้งใหม่ → sign in อีกครั้ง | สถานะทัวร์ผูกกับ**การติดตั้งบนเครื่อง** ไม่ใช่ session — install เดิม sign in ซ้ำต้อง **ไม่เด้งซ้ำ** (เด้งทุก sign-in = FAIL น่ารำคาญผู้ใช้); หลัง reinstall ถือ first-run ใหม่ → ทัวร์เล่นอีกครั้งถือว่า**ปกติตามมาตรฐาน** (ถ้าแอปกันไว้ฝั่ง server ไม่เด้งเลยก็ไม่ fail — จดผล) | ไม่มี bubble ซ้ำบน install เดิม | Low | |

### 2.8 Language/Theme Spot-check (EN/TH + light/dark — sweep เต็ม → FO-TEST-19)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
|---|---|---|---|---|---|---|---|---|---|
| FO-TC-SHELL-062 | TH labels shell | MEMBER | UI | เปลี่ยนภาษาเป็นไทย (Settings → Language ตาม SETUP-07) | 1. ดู nav labels 2. feed tabs 3. เปิด drawer | nav: ฟีด/แชท/กระดานข่าว/แจ้งเตือน/โปรไฟล์; tabs: ทั้งหมด/กำลังติดตาม/รายการโปรด (pill วัดตำแหน่งใหม่ตามความกว้าง); drawer 9 แถวภาษาไทย; coach bubble ใช้ไทยเมื่อ tour เล่น | ไม่มี label ตกค้าง EN | Medium | |
| FO-TC-SHELL-063 | light theme shell | MEMBER | UI | สลับธีม Light ผ่าน Settings ในแอป (SETUP-07) หรือธีมระบบเครื่อง | 1. ดู header/nav/active pill บน feed | nav pill โทนสว่างอ่านชัด; header ชัด; active pill + badge อ่านชัด; wordmark แดงคอนทราสต์พอ | ไม่มีจุดจางหาย | Low | |
| FO-TC-SHELL-064 | lang swap mid-shell | MEMBER | Func | อยู่ feed เลื่อนลงกลาง ๆ | 1. เข้า Settings → Language → เลือกไทย → กลับ feed | label ทั้งแอปสลับไทยทันทีโดยไม่ reload + ตำแหน่ง scroll เดิมคงอยู่ + pill แท็บวัดใหม่ | ทุก label สลับทันที | Medium | |

## 3. หมายเหตุ / OPEN items

- **[OPEN] SHELL-030** — badge `99+` cap: ต้องมีบัญชีเทสที่ unread >99 หรือ tooling/seed data จากทีม — ถ้าทำไม่ได้บน build นี้ mark BLOCK พร้อมเหตุผล
- **SHELL-046 (ยืนยัน spec แล้ว 2026-10-28)** — scroll-to-hide ใช้ได้เฉพาะหน้า feed เท่านั้น: สถานะ "แถบหลบ" ของ feed **ต้องไม่ลามไปซ่อน nav ของหน้าอื่น** (profile/search/alerts ฯลฯ ต้องแสดง nav ปกติเสมอ) — ถ้าแอปจริงพบ nav หน้าอื่นหายตาม = bug ให้ FAIL (ใน prototype เคยพบสถานะนี้ลามข้ามหน้า)
- **SHELL-054 (ยืนยัน spec แล้ว 2026-10-28)** — ปุ่ม/เจสเจอร์ back ของระบบ (Android) ต้องถอยหน้าภายในแอปเทียบเท่า in-app back เสมอ ห้ามออกจากแอปตอนอยู่หน้าลึก (อยู่ feed root ถึงออกได้ตามมาตรฐาน OS) — เงื่อนไขนี้เพิ่มลง inventory §2.12 (แถว device back) แล้ว; iOS ไม่มีปุ่ม back → เคสนี้เทสเฉพาะ Android
- **SHELL-055 (ตัดออกจากฉบับแอปจริง)** — เคสเดิมเทสปุ่ม ESC บน desktop browser; บนมือถือไม่มีปุ่ม ESC จึงไม่มีวิธีเทส → ตัดเคสออกและ**ปลด ID 055** (ไม่นำเลขนี้กลับมาใช้ เพื่อคงเลขเดิมของเคสอื่นให้ trace กับ inventory ได้ตรง)
- **SHELL-061** — กติกามาตรฐาน: ทัวร์ผูกกับการติดตั้งไม่ใช่ session → install เดิม sign in ซ้ำห้ามเด้งซ้ำ; reinstall เล่นใหม่ได้ (first-run ใหม่)
- **SHELL-065 (spec ล็อก 2026-10-28)** — แต่ละแท็บของ bottom nav จำ state ของตัวเองแบบ IG: สลับแท็บแล้วกลับมา = กลับมาที่หน้า+ตำแหน่ง scroll เดิม (รวมหน้าลึกที่เปิดค้างในแท็บนั้น) — **สลับแท็บไม่ใช่รีเฟรช**; ข้อยกเว้นเดียวคือ re-tap แท็บที่ active อยู่ = pop กลับ root ของแท็บนั้น (SHELL-027) — หมายเหตุ: แก้ prototype ให้ alerts/board/chat/profile จำ stack+scroll แยกแท็บแล้ว (เดิม alerts กลับมาเด้งขึ้นบนสุด — ตรวจด้วย Playwright แล้วผ่านทุก path)
- **ขอบเขตที่ตัดออก**: post card/media/action บน feed (FO-TEST-03), เนื้อหาหน้า search/sfilter (04), viewer/detail internals (06), sheet/dialog mechanics เช่น backdrop (07), alerts list เนื้อหา + mark-all-read ภายในหน้า (10), drawer variant แบบ dev + nav ไอคอนล้วน + dev sidebar = prototype harness (ไม่ใช่ production), snooze/prefs ที่กระทบ All tab (15), language/theme sweep เต็ม (19)
- toast/pin pill เป็นของ action แต่ละ module — ไฟล์นี้เช็กเฉพาะที่ trigger จาก shell (toast ของเมนู drawer ลอยล่างจอ ~2 วิ ตาม design — จดเวลาจริง)
- สถิติ: **64 TC** — High 23 / Medium 32 / Low 9 (SETUP rows แยกใน checklist; SHELL-055 ถูกตัด—desktop-only)
