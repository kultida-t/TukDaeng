# FO-TEST-001-18 — Test Cases: E2E Integration Scenarios (แอปมือถือจริง)

**Task**: FO-TEST-18 ของชุด FO-TEST-001 — เล่มเส้นทาง end-to-end ข้าม module เขียนเป็นเวอร์ชันเทสแอปมือถือจริงตั้งแต่แรก (ทำหลังเล่ม 01–17 · spec ล็อกแล้ว)
**SoT**: แอป TukDaeng build ทดสอบบนมือถือจริง — expected ล็อกตาม `FrontOffice/00_NAVIGATION_AND_CROSS_MODULE_FLOW.md` §6–§13 (layer/routes/entry matrix/notification destinations/gate routing/unavailable fallback/deep link/back) + `00_GLOBAL_RULES_MODULE.md` §7 (session) §9–§10 (status/visibility matrix) §11 (guest gate) §12 (lifecycle) §13 (block impact) §14 (private data) + `01_AUTHENTICATION_MODULE.md` + `04_ASSET_MANAGEMENT_MODULE.md` (lifecycle + Mark as Sold) + `05_ASSET_DETAIL_MODULE.md` (detail ไม่มี Ask/save/owner block) + `07_CHAT_MODULE.md` (ห้องเดียวต่อ account — FO-TEST-12 lock) + `09_NOTIFICATION_MODULE.md` + `10_WATCH_ALERT_MODULE.md` (match engine/notify) + `13_SETTINGS_MODULE.md` (delete/grace/restore) + `15_TRUST_SAFETY_MODULE.md` — `Prototypes/fo-flow` = แค่ reference ว่าหน้าตา/flow ควรเป็นแบบไหน
**Scope**: **เฉพาะ "ความต่อเนื่องข้าม module"** — เช็ก handoff/state ต่อเนื่องเท่านั้น (ข้อมูลตามไปถึงหน้าถัดไปไหม · badge/count sync ไหม · state เปลี่ยนฝั่งอีก module ไหม · stack/layer ถูกไหม) — **ห้ามซ้ำ internals** ของแต่ละ feature (อยู่เล่มเจ้าของแล้ว อ้าง TC ID ย่อยแทน)
**ยกเว้น**: internals ของทุกฟีเจอร์ → เล่ม 01–17 ตามตาราง §1 · guest gate matrix เต็ม → FO-TEST-17 · report/block internals → FO-TEST-16 · BO internals (moderation queue/review/audit) → นอก scope FO ทั้งหมด · language/theme sweep → FO-TEST-19 · route-level gap audit → FO-TEST-20
**หมายเหตุ**: เขียนเสร็จรอรีวิว — อย่าเพิ่งปิดงาน · ชื่อไฟล์ตาม task-breakdown §18 `FO-TEST-001-18-e2e.md` + TC ID `E2E-nnn` · SETUP ใช้ `SETUP-nn`

---

## §0 วิธีใช้ + สภาพแวดล้อม + กติกาเส้น E2E

- **ทดสอบบนเครื่องจริงเท่านั้น** — ติดตั้งแอป build ทดสอบลงมือถือจริง แตะ/ปัด/พิมพ์/เลื่อนบนหน้าจอจริง — **ไม่ใช้ browser, dev console, ปุ่ม dev/demo, localStorage, ข้อมูลจำลอง** — เตรียมสถานะด้วย action จริงในแอป + ข้อมูลจริงบน server เท่านั้น
- **Actors**: `MEMBER-A` = บัญชีทดสอบหลักบนเครื่อง 1 · `ACCT-2` = บัญชีจริงที่สองบนเครื่อง 2 (**บังคับ**สำหรับเส้นที่ต้องมี "อีกฝั่ง" — chat/alert/social/moderation/sold-handoff) · `GUEST` = ผ่าน onboarding แล้ว Skip for now ไม่ sign in · `NEW` = สมัครใหม่ผ่าน flow จริง · `DEL-ACCT` = บัญชีเสริมสำหรับลบเท่านั้น — เคสที่ต้องเครื่องสอง/บัญชีเสริมแต่ไม่มี → `BLOCK` พร้อมเหตุผลใน Note
- **ลำดับขั้นมีนัย (chain dependency)**: step ในเส้นเดียวกันต่อเนื่องกัน — ถ้า step กลาง FAIL เคสถัดไป**ของเส้นนั้น**ถือ BLOCK (บันทึกใน Note ว่าพังที่ step ไหน) — ผลเดียวต่อเคส = `PASS`/`FAIL`/`BLOCK` · ห้ามคำนิ่ม
- **เคส E2E เช็ก "มือส่งต่อ" เท่านั้น**: expected ของแต่ละ step คือสิ่งที่ต้องเห็นเมื่อ state เดินทางข้าม module — ถ้าอยากเทส internals (validation/copy/anatomy) ให้ไปรัน TC ย่อยในคอลัมน์ขวาสุด อย่าซ้ำที่นี่
- **`[GAP]`** = step นั้นไม่มี TC ย่อยในเล่ม 01–17 ครอบ — บังคับเขียน expected ไว้เหมือนเดิม แล้วส่งต่อเล่ม 20 (FO-TEST-20) ผ่าน §4
- **กติการะบบที่ล็อก (เช็กข้ามเส้นเสมอ)**:
  1. Post Viewer เปิดได้เฉพาะจาก grid tile / notification — feed card กด media ได้แค่ carousel ในการ์ดเดิม
  2. Post Detail อยู่เหนือ viewer เสมอ — detail-back เผย viewer ข้างล่าง; **detail ไม่มี Ask/save/chat-fab/owner block** (spec 05 lock — Ask อยู่บน feed card/price-footer/viewer rail เท่านั้น)
  3. Chat = **ห้องเดียวต่อ account** (FO-TEST-12 lock) — Ask ลิสติ้งต่างชิ้นของ seller เดิมไม่สร้างห้องใหม่ การ์ดลิสติ้งแนบเป็น**ข้อความ** 1 ครั้ง/ลิสติ้ง (ไม่ pin ค้าง) · Ask รีเซ็ต stack — back จากห้องลง surface ข้างล่างไม่ย้อน detail
  4. Mark as Sold → โพสต์หลุด Feed/Search/WA/profile status tabs **ทันที** (canonical — prototype leak เป็น defect ห้ามใช้เป็น expected) · `sold` terminal แก้สถานะไม่ได้
  5. Chat อยู่เมื่อ sold/deleted — การ์ด = snapshot นิ่ง · แตะการ์ด → Post Detail หรือ unavailable `รายการนี้ไม่พร้อมใช้งานแล้ว` + `Go back`
  6. Watch Alert match เฉพาะลิสติ้ง `Sale` · ของผู้ถูก block/mute/ni ออกจาก pool · `watch` row → Post Viewer ตรงไม่มี result list
  7. Report ≠ removal — โพสต์ยังแสดงจนกว่า admin moderation · report ไม่แจ้งฝั่งถูก report · FO ไม่มี "สถานะรายงาน"
  8. Delete → deactivated ทันที (profile/listings ซ่อนจากสาธารณะ) → grace 30 วัน → sign in = restore · **Watch Alerts ไม่กลับมา**
  9. Resume contract (ล็อก 15 §13): sign-in จาก gate → surface คงอยู่แต่ต้องกด action ใหม่ — **ไม่มี pending-action auto-resume**
  10. ไม่มีจ่ายเงินในแอป (V1) — deal จบนอกแอป · back ของ Alerts กลับ Feed เสมอ
- **Priority**: `HIGH` = เส้น core business (buyer/seller/alert/sold) · `MED` = loop รอง · `LOW` = quirk
- **Result column**: เว้นว่าง — tester กรอก `PASS`/`FAIL`/`BLOCK` + ปัญหาใน `Note`

## §1 Coverage map — เส้น × modules × TC ย่อย

| E2E | เส้น | Modules ที่ข้าม | TC ย่อยหลักที่ครอบ (เล่ม 01–17) | Priority |
| --- | --- | --- | --- | --- |
| E2E-001 | Buyer journey เต็ม (บังคับ) | Auth/Gate · Search · Viewer/Detail · Sheets/WA · Chat | AUTH-028..043,061..068 · GATE-001,033..035,042..048 · SRCH-006..043,055..057 · PV-001..012 · DET-001..019,024..029 · SHT-067..072 · WA-002,009..018 · CHAT-002,003,045..057 · PROF-056,058,060,061 · SHELL-066 [CLOSED: DEC-01] | HIGH |
| E2E-002 | Seller journey เต็ม (บังคับ) | Create · Feed · Search · WA · Chat · Asset/Portfolio | CRE-001..053 · FEED-001..008 · SRCH-017..032 · WA-043 · CHAT-032..044,108..124 · AST-038..064,076..085 · PROF-013..023 | HIGH |
| E2E-003 | Watch alert loop (บังคับ) | WA · Alerts · Viewer/Detail · Chat | WA-001,009..015,043,056 · ALT-014,017..034,065..072 · PV-007..008 · DET-001..005 · CHAT-002,003 | HIGH |
| E2E-004 | Asset lifecycle (บังคับ) | Create · Profile tabs · Feed/Search · Portfolio | AST-038..054,065..085 · PROF-013..023 · FEED-001..008 · SRCH-017..032 · WA-050 | HIGH |
| E2E-005 | ผลกระทบหลังขาย ข้าม surface (เพิ่ม — เหตุผล §2.5) | Asset · Feed/Search · Library · Chat · WA | AST-038..054,083,085 · LIB-001..105 · CHAT-011..031,053,104 · WA-050 · LIB-119, WA-080, CHAT-125, CHAT-126 [CLOSED: DEC-02..05] | HIGH |
| E2E-006 | Social loop (บังคับ) | Feed · Sheets · Alerts · Profile | FEED-027..038 · SHT-013..048 · ALT-010..041,065..079 · PROF-040..054 | MED |
| E2E-007 | Moderation loop (บังคับ) | Report stack · Feed · BO handoff · Fallback | TRS-001..016,026..031,047,049,058..061 · ALT-032 · TRS-066, TRS-067 [CLOSED: DEC-06..07] | MED |
| E2E-008 | Delete & restore (บังคับ) | Settings/Auth · Profile · Library · Chat · WA | SET-025..035 · AUTH-044..049,082..097 · PROF-111, CHAT-127, SET-121 [CLOSED: DEC-08..10] | MED |
| E2E-009 | Block → keep-page → unblock (เพิ่ม — เหตุผล §2.9) | Report/Block · Feed/Search · Profile · Chat · Settings | TRS-032..054 · PROF-062,063..075 · SET-072..077 · FEED-027..031 | MED |
| E2E-010 | Guest → member resume (เพิ่ม — เหตุผล §2.10) | Gate · Auth · Surface state | GATE-024..041 · AUTH-028..049 | MED |
| E2E-011 | Not-interested loop (เพิ่ม — เหตุผล §2.11) | Feed · Settings/Prefs · Library NI | FEED-054..059,068..072 · SET-078..091 · LIB-088..097 · LIB-120 [CLOSED: DEC-11] | MED |
| E2E-012 | Library sync ข้าม surface (เพิ่ม — เหตุผล §2.12) | Feed · Sheets · Detail · Library | FEED-042..045 · SHT-056..080 · DET-024..029 · LIB-001..097 · PV-003..005 | MED |
| E2E-013 | Follow loop (เพิ่ม — เหตุผล §2.13) | Feed · Profile · Alerts · Feed tabs | FEED-027..031,054..059 · PROF-040..054 · ALT-035..041 · SHELL-035..041 · SHT-091..098 | MED |
| E2E-014 | Board read loop guest→member (เพิ่ม — เหตุผล §2.14) | Board · Gate · Auth | BRD-001..012,034..048 · GATE-013,036..041 | MED |
| E2E-015 | Stale/deleted target fallback (เพิ่ม — เหตุผล §2.15) | Library · Chat · WA · Alerts · Detail | LIB-098..105 · CHAT-053 · WA-058 · ALT-032 · DET-034..037 | LOW |
| E2E-016 | External deep link → gate → destination (เพิ่ม — เหตุผล §2.16) | Share · Gate · Deep link contract | SHT-049..055 · ALT-043 · [CLOSED: DEC-12] | LOW |

## §2 Test cases

ผู้ทดสอบ: อ่าน expected ก่อนรันเสมอ — step ที่เขียน "BLOCK ถ้า..." ให้ mark BLOCK พร้อมเหตุผลใน Note (ห้าม workaround) · step ที่ขึ้นอยู่กับ step ก่อนหน้า ถ้าต้นทาง FAIL ให้ข้าม step นั้นและบันทึก "BLOCK ตาม dependency" — ผลรวมของเคส = ผลแย่สุดของ chain (step ใด FAIL = เคส FAIL; ถึงปลายทางไม่ได้เพราะ dependency = BLOCK)

### Setup ร่วม (ทำก่อนเส้นแรกเสมอ)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SETUP-01 | ติดตั้งแอปเครื่อง 1 | — | SETUP | เครื่องจริงเครื่องหลัก | ติดตั้ง build ทดสอบที่ทีมส่งให้ → เปิดแอป | เห็นหน้า onboarding (แอปสะอาด) | splash/หน้าแรกของแอป | — | |
| SETUP-02 | เครื่อง 2 + ACCT-2 | — | SETUP | มีเครื่องจริงอีกเครื่อง | ติดตั้ง build เดียวกันลงเครื่อง 2 → sign in `ACCT-2` → เปิด notification permission ทั้งสองเครื่อง → ตั้งเวลาเครื่องตรงกัน | บัญชีสองพร้อม — **ถ้าไม่มีเครื่องสอง → เส้นที่ mark ต้องใช้ ACCT-2 ทั้งหมดเป็น BLOCK** | — | — | |
| SETUP-03 | MEMBER-A พร้อมใช้ | MEMBER-A | SETUP | แอปเครื่อง 1 สะอาด | sign in บัญชีทดสอบหลัก → บันทึก username `U-A` ลง Note | เข้า feed เป็น member | avatar/ชื่อตัวเองในที่ที่ต้องแสดง | — | |
| SETUP-04 | GUEST พร้อมใช้ | GUEST | SETUP | แอปสะอาด/ออกจากระบบ | เดิน onboarding ครบ → Member Sheet **ไม่ติ๊ก** `Don't show this again` → `Skip for now` | เข้า feed เป็น guest — บันทึกภาษาที่เลือกลง Note | bottom nav ครบ 5 แท็บ | — | |
| SETUP-05 | ชุดข้อมูล ACCT-2 | ACCT-2 | SETUP | SETUP-02 เสร็จ | เครื่อง 2 สร้างผ่านแอปจริงแล้วบันทึกชื่อลง Note: `P-B-SALE` ลิสติ้ง Sale ครบ spec (brand/model/ref/condition/price) + `P-B-POST` โพสต์ธรรมดา + `P-B-DEL` โพสต์สำรองสำหรับลบ · บันทึก `U-B` = username ACCT-2 | ข้อมูลพร้อม — สร้างไม่ได้ = เส้นที่เกี่ยว BLOCK | — | — | |
| SETUP-06 | baseline ฝั่ง MEMBER-A | MEMBER-A | SETUP | SETUP-03/05 เสร็จ | เซฟ `P-B-SALE` ใส่ All posts · ใส่ `P-B-POST` ใน wish list · ตั้ง watch alert `WA-A` criteria `CRIT-X` (brand+model ที่ ACCT-2 จะลงตามได้) · เปิด `walerts`/`saved`/wish list บันทึก count ลง Note | baseline พร้อม — ตั้ง `WA-A` ไม่ได้ = E2E-002/003/005 BLOCK | — | — | |
| SETUP-07 | DEL-ACCT + baseline ลบ | DEL-ACCT | SETUP | มีบัญชีเสริม | สมัคร `DEL-ACCT` (บันทึกอีเมล+รหัส) → sign in → สร้างโพสต์ 1 ใบ + เซฟโพสต์ 1 ใบ + ตั้ง WA 1 รายการ + Ask ลิสติ้งของ `ACCT-2` ส่งข้อความ 1 ฉบับ → sign in `MEMBER-A` กลับ | `DEL-ACCT` มีข้อมูลครบสำหรับเช็ก restore — ไม่มีบัญชีเสริม = E2E-008 BLOCK | — | — | |
| SETUP-08 | กลไก moderation ฝั่ง BO | — | SETUP | ทีมให้สิทธิ์ BO/เครื่องมือ moderation | ยืนยันช่องทาง action moderation จริง (BO console/แอดมินเครื่องมือที่ลบหรือซ่อนโพสต์ได้) + บัญชีผู้ใช้ BO | มีช่องทางทำ post หายจากสาธารณะได้ — **ไม่มี → step BO ของ E2E-007 เป็น BLOCK อัตโนมัติ** | — | — | |
| SETUP-09 | อีเมลทดสอบสมัครใหม่ | — | SETUP | เข้าถึงกล่องอีเมลทดสอบ | เตรียมอีเมลสมัครใหม่สำหรับ `NEW` (รับ OTP จริงได้) | OTP เข้ากล่องได้จริง — ไม่มี = step สมัครของ E2E-001/010 BLOCK | — | — | |
| SETUP-10 | อุปกรณ์ส่งลิงก์ | — | SETUP | เครื่อง/ช่องทางส่งลิงก์ภายนอก | เตรียมช่องทางส่งลิงก์นอกแอป (เช่น LINE/notes) ระหว่างเครื่อง 2 → เครื่อง 1 | ส่ง URL โพสต์ข้ามเครื่องได้ — build ไม่มี share-copy-link/deep link = E2E-016 BLOCK | — | — | |

### 2.1 E2E-001 — Buyer journey เต็ม (guest → member → search → detail → watch/wishlist → chat)

ผู้ใช้ใหม่เริ่มเป็น guest → อยากซื้อนาฬิการุ่นเป้าหมาย → สมัครสมาชิก → ค้นหา → ดูละเอียด → ตั้งติดตาม → ทักผู้ขาย · modules: Auth/Gate → Search → Viewer/Detail → Sheets/WA → Chat · **ต้องใช้**: SETUP-01/04/05/09 · ไม่ต้องใช้เครื่อง 2 (อาศัยลิสติ้ง `P-B-SALE` ของ ACCT-2 ที่สร้างไว้แล้ว)

| Step | Action ที่ทำ | Expected — การทำงาน | Expected — การแสดงผล | TC ย่อยที่ครอบ |
| --- | --- | --- | --- | --- |
| 1 | GUEST เปิดแอป → เลื่อน feed → แตะ media บนการ์ด `P-B-SALE` | เข้า feed เป็น guest · แตะ media ได้แค่ carousel ในการ์ดเดิม — **ไม่เปิด** Post Viewer (กติการะบบ 1) | การ์ด sale แสดงราคา+specs ปกติ ไม่มี gate | GATE-042..048 · FEED-001..012 |
| 2 | GUEST แตะ like บน `P-B-SALE` | Member Sheet `เข้าร่วมตึกแดง`/`Join TukDaeng` เด้ง**ก่อน** handler — โพสต์ไม่ถูก like | sheet มี Sign up/Sign in/Skip/social — ไม่มี `Don't show this again` | GATE-001 · AUTH-061..068 |
| 3 | บน sheet แตะ `สมัครสมาชิก`/`Sign up` → กรอกอีเมลใหม่ → OTP → profile setup → created | ผ่าน signup→OTP→profile→created ครบ → เข้า feed เป็น session member ใหม่ (ข้อมูลว่างตามสภาพ NEW) | แต่ละหน้า onboarding ตาม flow auth | AUTH-028..043 · GATE-033..035 |
| 4 | แตะไอคอนค้นหา → พิมพ์ keyword ของ `P-B-SALE` → Enter | suggest แสดงระหว่างพิมพ์ → หน้า results เปิดพร้อมผล · recents บันทึก keyword นี้ | tabs For you/Profiles/Tags + grid ผล | SRCH-006..011,017..032 |
| 5 | เปิด filter เลือก brand + ช่วงราคาที่ครอบ `P-B-SALE` → Apply | ผลกรองเหลือเฉพาะที่ตรง · chips filter แสดงบนหัวผลลัพธ์ | `P-B-SALE` อยู่ใน grid ผล | SRCH-033..043 |
| 6 | แตะ tile `P-B-SALE` | Post Viewer เปิดตรงโพสต์นั้น (feed/list mode — tile = entry เดียวของ viewer) | viewer มี rail actions + Ask pill (sale เท่านั้น) | SRCH-055..057 · PV-001..011 |
| 7 | แตะ `Tap for details`/details sheet → `View full detail ›` | Post Detail เลื่อนทับ viewer แสดง spec ครบ (Watch Specs + Item Details + Price & Data Source) | detail ไม่มีปุ่ม Ask/save/chat-fab — มีเฉพาะ like/💬/👁/share/🔔/🎁/⋯ | DET-001..005,006..019 |
| 8 | บน detail แตะ 🎁 (wishlist) → เลือก/สร้าง collection `W-BUY` | wl sheet เปิด → save เข้า collection → toast + 🎁 on-state · state sync กลับ surface | 🎁 ติดสถานะบน detail | DET-024..029 · SHT-067..072 |
| 9 | บน detail แตะ 🔔 `Follow this model` → เลือก mode → `Create alert` | wa sheet เปิดพร้อม criteria snapshot จาก spec โพสต์ (ไม่รวมราคา/แหล่งข้อมูล) → alert ใหม่ ON + toast `Watch alert on` + 🔔 กลาย `Following this model` | sheet anatomy ครบ (name prefill + 3 modes + N now) | WA-002,009..018 · DET-024..029 |
| 10 | detail-back | เผย Post Viewer ข้างล่างสภาพเดิม (detail เหนือ viewer เสมอ — กติการะบบ 2) | viewer ไม่ re-render ผิดตำแหน่ง | DET-001..005 · PV-010..012 |
| 11 | แตะ Ask pill บน rail ของ viewer | เปิดห้องแชทกับ `U-B` (ห้องเดียวต่อ account) + การ์ดลิสติ้ง `P-B-SALE` แนบเป็น**ข้อความ** + composer prefill quick-ask · overlay viewer/detail ถูกปิด (Ask รีเซ็ต stack) | หัวห้อง = `U-B` · การ์ดมีรูป+ชื่อ+แคปชัน+ราคา | CHAT-002,003,007 · PROF-058 |
| 12 | กดส่งข้อความ quick-ask → back → เปิดแท็บ `แชท` | ข้อความขึ้นฝั่งขวา `Sent` → thread `U-B` ปรากฏใน Chats list (preview = ข้อความล่าสุด) + Items view จัด `U-B` ใต้ `Items you asked about` | back จากห้องลง feed ไม่ย้อน viewer/detail (กติการะบบ 3) | CHAT-045..057 · PROF-056,060,061 |
| 13 | (ต่อเนื่อง — deal ตกลงนอกแอป) สำรวจทุก surface ในเส้นนี้หาช่องจ่ายเงิน/checkout | **ไม่มี** ปุ่ม/flow จ่ายเงินในแอปทุกจุดที่ผ่าน (feed/detail/chat) — V1 deal จบนอกแอปเท่านั้น | ไม่มี CTA ซื้อ/จ่าย/เช็คเอาต์ | [GAP-7] |

**Modules ที่ผ่าน**: Shell/Feed (browse) · Gate+Auth (conversion) · Search/Filter · Viewer/Detail · Wishlist/WA sheets · Chat — **TC ย่อยทั้งหมด**: GATE-001,033..035,042..048 · AUTH-028..043,061..068 · SRCH-006..011,017..032,033..043,055..057 · PV-001..012 · DET-001..019,024..029 · SHT-067..072 · WA-002,009..018 · CHAT-002,003,007,045..057 · PROF-056,058,060,061

**Result**: 

### 2.2 E2E-002 — Seller journey เต็ม (ลงขาย → โดนหาเจอ → คุย → ขายได้ → portfolio)

ผู้ขายลงลิสติ้งใหม่จนถึงปิดการขาย — เช็กว่าลิสติ้งแพร่ไปทุก surface ที่ควรและกลับมาบันทึกผลใน portfolio · modules: Create → Feed → Search/WA → Chat → Asset/Portfolio · **ต้องใช้**: SETUP-02/03/05/06 (MEMBER-A มี `WA-A` criteria `CRIT-X` — ให้ ACCT-2 กรอก spec ลิสติ้งให้ตรง `CRIT-X`)

| Step | Action ที่ทำ | Expected — การทำงาน | Expected — การแสดงผล | TC ย่อยที่ครอบ |
| --- | --- | --- | --- | --- |
| 1 | เครื่อง 2: ACCT-2 แตะ `+` → composer → เลือกรูป ≥2 → step 2 ใส่ caption+spec ตรง `CRIT-X` → price → visibility `โพสต์ลงฟีด`/`Post to feed` → publish | composer ครบ flow → publish สำเร็จ | toast `บันทึกลงลิ้นชักและโพสต์ลงฟีดแล้ว ✓` + (ถ้า match alert ของผู้อื่น) `_waHits`-style toast แจ้ง match | CRE-001..005,006..024,028..031,043..053 |
| 2 | ดูจุดตกหลัง publish + own profile | ลงกลับ own profile — โพสต์ใหม่อยู่ grid บนสุด/แท็บ Sale | แท็บ Sale มี tile ใหม่ | AST-078,080 · PROF-013..023 |
| 3 | เช็ก feed ทั้งสองเครื่อง (ACCT-2 + MEMBER-A) | โพสต์ขึ้น feed บนสุดทั้งสองเครื่องเป็นการ์ด sale ครบ (ราคา/Ask pill) | การ์ด anatomy ถูกต้อง | FEED-001..008 · AST-078 |
| 4 | เครื่อง 1: MEMBER-A search keyword ของลิสติ้งใหม่ | เจอใน results grid (Sale posts เข้า search pool) | tile แสดงรูป+ราคา | SRCH-017..032 |
| 5 | เครื่อง 1: เปิดแท็บ `แจ้งเตือน` (ภายใน ~60 วินาทีหลัง publish) | `WA-A` (criteria `CRIT-X`) match → watch row ใหม่ unread + badge เพิ่ม — **engine ไม่เด้ง → step นี้ BLOCK ทั้งเส้น** | row `การแจ้งเตือนนาฬิกา {name} — รายการใหม่จาก {seller} · {price}` | WA-043 · ALT-014,065..072 |
| 6 | เครื่อง 1: MEMBER-A แตะ tile → viewer → Ask บน rail → ส่งข้อความ | ห้อง `U-B` เปิดพร้อมการ์ดลิสติ้งเป็นข้อความ + ส่งสำเร็จ | การ์ด snapshot ครบ | CHAT-002,003 · PROF-058 |
| 7 | เครื่อง 2: ACCT-2 ดู bottom nav + เปิด `แชท` | badge unread บนแท็บ chat + thread `U-A` เด้งขึ้น list (Chats) และ Items view จัดภายใต้ `Your listings` | unread pill + preview ข้อความล่าสุด | CHAT-011..031,032..044,108..124 |
| 8 | เครื่อง 2: เปิดห้อง → อ่านการ์ด+ข้อความ → ตอบกลับ | การ์ดลิสติ้ง `P-B-SALE` (ลิสติ้งใหม่) อยู่ในสายข้อความฝั่ง `U-A` + ตอบสำเร็จ — ห้องคือห้องเดียวต่อ account เดิมถ้าเคยคุย | bubble ขวาฝั่งเรา `Sent`→`Read` เมื่อ MEMBER-A เปิด | CHAT-045..057,109 |
| 9 | (deal ตกลงนอกแอป) เครื่อง 2: own post ⋯ → `Mark as sold` → ฟอร์ม `sell:{id}` ใส่ราคาขาย+วันที่ → save | transition sold สำเร็จ → ลงหน้า `sold:{id}` sale record + toast | post ติดสถานะ SOLD — แก้กลับไม่ได้ (terminal) | AST-038..054,071 |
| 10 | เครื่อง 2: เช็ก surfaces หลัง sold — own feed · search · own profile แท็บ | โพสต์**หลุดทันที**: ไม่อยู่ feed · ค้นไม่เจอ · ย้ายแท็บ Sold (canonical — leak = FAIL) | แท็บ Sold มี tile + detail `ขายแล้ว`/`SOLD` | AST-083,085 · PROF-013..023 |
| 11 | เครื่อง 2: own profile → wallet → `portfolio` → `soldhist` → `sold:{id}` | แถว asset เดิมออกจาก portfolio list (ไม่นับ market/active) → sold history มี record ใหม่ → detail แสดง sale price + realized G/L + holding period | ตัวเลขตรงข้อมูลที่กรอกตอนขาย | AST-009..022,055..064 |
| 12 | เครื่อง 1: MEMBER-A เปิดห้อง `U-B` เดิม | ห้อง+ประวัติยังใช้ได้ (chat อยู่เมื่อ sold) · การ์ด = snapshot เดิมไม่มี sold marker · แตะการ์ด → Post Detail เปิดได้ (โพสต์ยังอยู่ฝั่ง owner…ฝั่ง public ตามสิทธิ์) | ไม่มี error/ห้องหาย | CHAT-104 · 05 spec §chat-survives-sold |

**Modules ที่ผ่าน**: Create composer · Feed · Search · Watch Alert (match ฝั่งผู้ซื้อ) · Chat (2 เครื่อง) · Asset lifecycle · Portfolio — **TC ย่อยทั้งหมด**: CRE-001..053 · AST-038..085 · PROF-013..023 · FEED-001..008 · SRCH-017..032 · WA-043 · ALT-014,065..072 · CHAT-002,003,011..057,104,108..124 · PROF-058

**Result**: 

### 2.3 E2E-003 — Watch alert loop (ตั้ง alert → match → notification → viewer → chat)

วงจร alert เต็มฝั่งผู้รับ: A ตั้ง alert → B ลงของที่ตรง → A ได้แจ้งเตือน → กดถึงโพสต์ → ทักซื้อ · modules: WA → Alerts → Viewer/Detail → Chat · **ต้องใช้**: SETUP-02/03/05/06

| Step | Action ที่ทำ | Expected — การทำงาน | Expected — การแสดงผล | TC ย่อยที่ครอบ |
| --- | --- | --- | --- | --- |
| 1 | เครื่อง 1: MEMBER-A search → ใส่ keyword+filters = `CRIT-X` → แตะ bell `sr-wa` → `Create alert` | wa sheet เปิด snapshot criteria จาก query+filters → alert `WA-A2` ON + bell on-state | toast `Watch alert on` + sheet ปิดเอง | WA-001,009..015 |
| 2 | เครื่อง 1: Settings → `การแจ้งเตือนนาฬิกา`/`Watch Alerts` | `WA-A2` อยู่ list บนสุด (เรียงใหม่สุดก่อน) + criteria text ครบ join ` · ` + `{n} matches now` นับเฉพาะ Sale ปัจจุบัน | row anatomy ครบ (name/criteria/mode/toggle) | WA-003,026..033 |
| 3 | เครื่อง 2: ACCT-2 ลงลิสติ้ง Sale ที่ spec ตรง `CRIT-X` → publish | publish สำเร็จ (ฝั่ง seller อาจเห็น match toast) | — | CRE-043..048 |
| 4 | เครื่อง 1: รอ ≤60 วินาที → เปิดแท็บ `แจ้งเตือน` | watch row ใหม่ unread เด้ง + badge +1 — **engine ไม่เด้ง → BLOCK เส้นนี้และ step 5–8** | row มี bell icon + seller mini + ราคา + thumb | WA-043 · ALT-014,017..025 |
| 5 | แตะ watch row | Post Viewer เปิด**โพสต์ที่ match โดยตรง** — ไม่มี result list คั่น · row กลาย read + badge ลด | viewer title `Post` + โพสต์ถูกชิ้น | WA-056 · ALT-026..034 |
| 6 | `View full detail ›` → อ่าน spec → detail-back | detail ทับ viewer แสดง spec ตรง `CRIT-X` ที่ตั้งไว้ (brand/model/price range) — เป็นเหตุผลที่ match | spec rows ครบ | DET-001..019 |
| 7 | บน viewer rail แตะ Ask → ส่งข้อความ | ห้อง `U-B` เปิดพร้อมการ์ดลิสติ้งชิ้นนี้เป็นข้อความ 1 ใบ + prefill quick-ask | ถ้าเคย Ask ลิสติ้งอื่นของ `U-B` → **ห้องเดิม** + การ์ดเพิ่มต่อท้าย | CHAT-002,003 · PROF-058..060 |
| 8 | back จากห้อง → alerts → back | back ลง surface ข้างล่าง (alerts) → back ของ Alerts กลับ Feed เสมอ | ไม่มีหน้าค้างซ้อน | CHAT-008 · ALT-057..064 |

**Modules ที่ผ่าน**: Watch Alert (create/list/match/notify) · Alerts (row/badge/destination) · Viewer/Detail · Chat — **TC ย่อยทั้งหมด**: WA-001,003,009..015,026..033,043,056 · ALT-014,017..034,057..072 · DET-001..019 · CHAT-002,003,008 · PROF-058..060

**Result**: 

### 2.4 E2E-004 — Asset lifecycle (show → sale → hide → sale → sold → portfolio)

เดินสถานะ asset ชิ้นเดียวครบทุก transition ที่ spec อนุญาต พร้อมเช็ก visibility matrix ทุกครั้ง · modules: Create → Profile tabs → Feed/Search/WA → Portfolio · **ต้องใช้**: SETUP-02/03 (เครื่อง 2 ใช้เช็กฝั่ง public — ไม่มี → step 2/4/7 ส่วนฝั่ง ACCT-2 BLOCK ย่อย)

| Step | Action ที่ทำ | Expected — การทำงาน | Expected — การแสดงผล | TC ย่อยที่ครอบ |
| --- | --- | --- | --- | --- |
| 1 | MEMBER-A: `+` → asset mode → รูป+spec+cost → visibility `โชว์`/`Show` → Add Asset | สร้างเป็น drawer+Show post → toast `บันทึกลงลิ้นชักและแสดงบนโปรไฟล์แล้ว ✓` | อยู่แท็บ Show + portfolio แถวใหม่ chip Show · **ไม่อยู่** feed/search | AST-076 · CRE-049..053 |
| 2 | เครื่อง 2: ACCT-2 เปิด public profile `U-A` | เห็น tile บนแท็บ Show (Show ขึ้น public profile) · ไม่เจอใน feed/search ของ ACCT-2 | visibility matrix: Show = profile-only | AST-085 |
| 3 | MEMBER-A: viewer ของชิ้นนั้น → ⋯ → `แก้ไข`/`Edit` → สถานะ `ขาย`/`Sale` + ใส่ราคา → Done | Show→Sale: เข้า feed + ค้นเจอ + ย้ายแท็บ Sale + `pfasset` chip Sale + Listing card โผล่ + เข้า WA match pool | — | AST-065 |
| 4 | Edit → สถานะ `ซ่อน`/`Hide` → Done → เช็ก MEMBER-A + เครื่อง 2 | Sale→Hide: หาย feed + ค้นไม่เจอ + หายจาก public profile (ACCT-2) + ย้ายแท็บ Hide + ยังอยู่ portfolio (chip Hide) · ออกจาก WA pool | — | AST-067 · WA-050 |
| 5 | Edit → สถานะ `ขาย`/`Sale` อีกครั้ง → Done | Hide→Sale: กลับ feed/search/แท็บ Sale/pool ครบเหมือน step 3 | — | AST-066,070 |
| 6 | own post ⋯ → `Mark as sold` → `sell:{id}` ใส่ราคา+วันที่ → save | sold transition → `sold:{id}` sale record + toast — โพสต์หลุด feed/search/แท็บเดิมทันที | แท็บ Sold มี tile · detail `ขายแล้ว`/`SOLD` | AST-038..054,083 |
| 7 | `portfolio` → `soldhist` → `sold:{id}` + เครื่อง 2 เช็กฝั่ง public | portfolio list ไม่นับชิ้นนี้แล้ว · record ใน soldhist ครบ (sale price/G-L/holding) · ACCT-2 ไม่เห็นชิ้นนี้ที่ไหนเลย | sold = terminal: ⋯ menu ไม่มี Edit/Mark as sold เหลือ `View sale record` | AST-055..064,071,085 |
| 8 | (ต่อเนื่อง) sweep สถานะสุดท้ายทุก surface ซ้ำ | ชิ้นเดียวกันสถานะตรงกันทุกจุด: grid แท็บ Sold · detail SOLD · pfasset เดิม `ไม่พบข้อมูล` (ออกจาก active list) · soldhist มี record | ไม่มี chip/tag ค้างสถานะเก่า | AST-083,087 |

**Modules ที่ผ่าน**: Composer (asset mode) · Profile tabs/viewer · Edit info (status pick) · Feed/Search/WA (visibility) · Portfolio/soldhist — **TC ย่อยทั้งหมด**: AST-038..087 · CRE-049..053 · PROF-013..023 · WA-050

**Result**: 

### 2.5 E2E-005 — ผลกระทบหลังขาย ข้าม surface (buyer-side view)

เหตุผลที่ต้องมี: กติกา "sold หลุดทุก public surface ทันที" กระทบหลาย module พร้อมกันฝั่ง**คนดู** (feed/search/profile/WA/saved/chat) — เล่ม module เช็กทีละฝั่ง เส้นนี้ยืนยันว่า sync ครบในอีเวนต์เดียว · modules: Asset → Feed/Search/Profile/WA → Library → Chat · **ต้องใช้**: SETUP-02/03/05/06 (MEMBER-A เซฟ `P-B-SALE` + มี `WA-A` ที่เคย match ลิสติ้งนี้ถ้าตรง)

| Step | Action ที่ทำ | Expected — การทำงาน | Expected — การแสดงผล | TC ย่อยที่ครอบ |
| --- | --- | --- | --- | --- |
| 1 | เครื่อง 1: MEMBER-A ยืนยัน baseline — `P-B-SALE` อยู่ feed/search/saved + มี chat thread `U-B` (Ask ไว้) | ลิสติ้งเห็นครบทุก public surface ก่อนขาย | — | LIB-001..010 · CHAT-011..031 |
| 2 | เครื่อง 2: ACCT-2 mark `P-B-SALE` เป็น sold | sold สำเร็จฝั่ง seller | — | AST-038..054 |
| 3 | เครื่อง 1: กลับ feed (refresh) | `P-B-SALE` หายจาก feed ทุกแท็บ — ห้ามค้างเป็นการ์ด SOLD/ปกติ (canonical) | ไม่มีการ์ดผี | AST-083,085 |
| 4 | เครื่อง 1: search keyword เดิม + เปิด public profile `U-B` | ค้นไม่เจอ + หายจากแท็บ Sale ของ public profile `U-B` (public เห็นเฉพาะ Sale/Show) | — | AST-085 · SRCH-017..032 |
| 5 | เครื่อง 1: เปิด `saved` (เคยเซฟ `P-B-SALE`) | tile ของโพสต์ sold จัดการตาม contract library (ถูกเอาออก/หรือแสดงสถานะไม่พร้อมใช้ — ตาม spec 11; count ลดสอดคล้อง) | ไม่มี tile ชี้ detail ที่เปิดว่างเปล่า | LIB-098..105 · [GAP-8]* |
| 6 | เครื่อง 1: เปิด `walerts` ดู `{n} matches now` ของ `WA-A` | ลิสติ้งที่ sold ออกจาก match pool — count ไม่นับมันอีก (Sale-only pool) | count ลดหรือเท่าเดิม ห้ามเพิ่มจากลิสติ้ง sold | WA-050 · [GAP-9]* |
| 7 | เครื่อง 1: เปิด chat list → ห้อง `U-B` | ห้อง+ประวัติคงอยู่ (chat อยู่เมื่อ sold) · การ์ด = snapshot เดิม **ไม่มี** sold marker · แตะการ์ด → Post Detail เปิดได้ตามสิทธิ์ public (sold detail ของคนอื่น = unavailable/permission ตาม spec §10 — หรือ detail ปกติถ้า contract อนุญาต) | ไม่มีห้องหาย/crash | CHAT-104,053 · [GAP-10]* |
| 8 | เครื่อง 1: ลอง Ask บนผลลัพธ์/หน้าอื่นที่ยังอ้าง `P-B-SALE` (ถ้ามี entry ค้าง เช่น viewer ที่เปิดไว้) | ไม่มีทาง Ask ลิสติ้งที่หลุดสาธารณะแล้ว — entry ตาย/สร้างห้องใหม่ไม่เกิดบน target ที่ไม่มีแล้ว | toast/unavailable ตาม contract | [GAP-11] |

\* step 5–8: spec V1 เขียน "sold หลุด public" ชัด แต่พฤติกรรมละเอียดฝั่งคนดู (saved tile / match count / chat card → sold detail / stale Ask entry) ไม่มี TC ย่อยครอบตรง ๆ — mark [GAP] ส่งเล่ม 20

**Modules ที่ผ่าน**: Asset transition · Feed · Search · Public Profile · Watch Alert pool · Library · Chat — **TC ย่อยทั้งหมด**: AST-038..054,083,085 · LIB-001..105 · CHAT-011..031,053,104 · WA-050 · [GAP-8..11]

**Result**: 

### 2.6 E2E-006 — Social loop (like/comment/follow → alerts 3 ประเภท → badge)

ปฏิสัมพันธ์พื้นฐานที่ไหลไปเป็น notification ของอีกฝั่งครบทุก type พร้อมกัน · modules: Feed/Sheets → Alerts → Profile · **ต้องใช้**: SETUP-02/03/05

| Step | Action ที่ทำ | Expected — การทำงาน | Expected — การแสดงผล | TC ย่อยที่ครอบ |
| --- | --- | --- | --- | --- |
| 1 | เครื่อง 2: ACCT-2 โพสต์ `P-B-POST` (โพสต์ธรรมดา) | โพสต์ขึ้น feed | — | CRE-001..048 |
| 2 | เครื่อง 1: MEMBER-A บนการ์ด `P-B-POST`: like → comment ส่ง 1 ข้อความ → Follow `U-B` บน post head | ทั้ง 3 action สำเร็จ — like ติด · comment เข้า sheet · Follow toggle | count like/comment ขยับฝั่ง A ทันที | FEED-027..038 · SHT-013..041 |
| 3 | เครื่อง 2: ACCT-2 ดู bottom nav + เปิด `แจ้งเตือน` | มี alert ใหม่ **3 ประเภทครบ**: like · comment · follow — ทุก row unread + badge = จำนวน unread | row anatomy ตาม type (like=avatar+โพสต์ · comment=excerpt · follow=Follow back+x) | ALT-010..016,065..072 |
| 4 | เครื่อง 2: แตะ like row → back → แตะ comment row → back → แตะ follow row → back | like/comment → Post Viewer โพสต์ตัวเอง `P-B-POST` (solo) · follow → public profile `U-A` · ทุกครั้ง back กลับ alerts | destination ตาม matrix ถูกทุก type | ALT-026..034 |
| 5 | เครื่อง 2: แตะ `Mark all as read` | ทุก row กลาย read + badge บน nav หาย/ลดเป็นศูนย์ + sync ทุก nav instance | ปุ่มหายเมื่อ unread=0 | ALT-017..025 |
| 6 | เครื่อง 1: MEMBER-A เปิด feed แท็บ `กำลังติดตาม`/`Following` | `P-B-POST` อยู่ใน Following feed (follow มีผลต่อ feed composition) | แท็บ Following ไม่ว่าง | PROF-040..054 · SHELL-035..041 |
| 7 | เครื่อง 2: บน follow row (ย้อนกลับดู) — ตรวจว่า ACCT-2 **ไม่ได้** auto-follow กลับ | follow ของ A ไม่สร้างความสัมพันธ์ย้อน — ACCT-2 ต้องกด Follow back เองถ้าจะตาม | follow row ยังมีปุ่ม `Follow back` ใช้งานได้ | ALT-035..041 |

**Modules ที่ผ่าน**: Feed actions · Comments sheet · Follow mechanics · Alerts (generation/destination/badge) · Feed tabs — **TC ย่อยทั้งหมด**: CRE-001..048 · FEED-027..038 · SHT-013..041 · ALT-010..041,065..072 · PROF-040..054 · SHELL-035..041

**Result**: 

### 2.7 E2E-007 — Moderation loop (report → done → ผล moderation กลับ FO)

รายงานโพสต์จากฝั่งผู้ใช้จนถึงจุดที่ผลการตัดสินฝั่ง BO สะท้อนกลับมาที่ FO — **เช็กเฉพาะ UI/state ฝั่ง FO ไม่เทส BO internals** · modules: Report stack → Feed → Unavailable fallback · **ต้องใช้**: SETUP-02/03/05/08 — ไม่มีช่องทาง moderation → step 6–7 BLOCK

| Step | Action ที่ทำ | Expected — การทำงาน | Expected — การแสดงผล | TC ย่อยที่ครอบ |
| --- | --- | --- | --- | --- |
| 1 | เครื่อง 1: MEMBER-A ⋯ บน `P-B-POST` → `รายงาน`/`Report` | sheet ⋯ ปิด + หน้า `report` เลื่อนขึ้น (head `✕` ไม่มี `<` + disclaimer anonymous + 9 reasons) | — | TRS-001..005 |
| 2 | แตะเหตุผล 1 แถว (เช่น `ข้อมูลเท็จ`/`False information`) | submit ในตัว → push `report:done:{u}` ทันที | green check + `ขอบคุณสำหรับข้อเสนอแนะ` + `ขั้นตอนอื่น ๆ` rows (Block/Unfollow/Mute ตามสถานะ) | TRS-005,026..031 |
| 3 | (เลือกเสริม) แตะ `ปิดเสียงเตือน {u}`/`Mute {u}` บน done page → `เสร็จสิ้น`/`Done` | mute apply + toast + แถวติด green check · Done ปิด report stack ทั้งกองกลับ surface เดิม | — | TRS-026..031 |
| 4 | เครื่อง 1: กลับ feed + เปิด detail ของ `P-B-POST` ซ้ำ | **โพสต์ยังแสดงปกติ** — report ≠ removal (รอ admin moderation) | ไม่มี flag/badge "รายงานแล้ว" บนโพสต์ | TRS-009 |
| 5 | เครื่อง 1: เปิด `แจ้งเตือน` + หาหน้าสถานะรายงาน | **ไม่มี** alerts item จากการ report + ไม่มี surface "สถานะรายงาน" ฝั่ง FO (anonymous + no tracking) | — | TRS-060 |
| 6 | เครื่อง 2: เปิด `แจ้งเตือน` ของ ACCT-2 | ACCT-2 **ไม่ได้** notification ว่าถูก report (report anonymous — เหมือน block: `They won't be notified`) | ไม่มี row เกี่ยวกับ report | TRS-047 · [GAP-12]* |
| 7 | ผู้ทดสอบดำเนินการ moderation ผ่าน BO (SETUP-08): ซ่อน/ลบ `P-B-POST` → เครื่อง 1 refresh feed + เปิด entry เดิมที่เคยชี้โพสต์นี้ (saved tile/ลิงก์ใน chat ถ้ามี) | **ไม่มีสิทธิ์ BO → step นี้ BLOCK พร้อมเหตุผล** · ถ้าทำได้: โพสต์หายจาก feed/search ของ MEMBER-A + entry เก่า → unavailable `รายการนี้ไม่พร้อมใช้งานแล้ว` + `Go back` | — | TRS-049,061 · ALT-032 · [GAP-13]* |
| 8 | เครื่อง 1: (ทำซ้ำ) report โพสต์เดิมอีกครั้งถ้ายังเข้าถึงได้ | report ซ้ำทำได้ไม่มี guard "already reported" — ถ้าโพสต์หายแล้วข้าม step นี้ | — | TRS-058 |

\* step 6–7: เล่ม 16 ครอบฝั่ง reporter แล้ว (ไม่มี FO notif/handoff เทสจาก FO ไม่ได้ → TRS-060/061) — ส่วนที่เหลือคือ "ผล moderation กลับ FO" ซึ่งต้องใช้ BO จริง: ยังไม่มี TC ย่อยครอบ end-to-end นี้ → [GAP]

**Modules ที่ผ่าน**: Report stack · Mute (other-steps) · Feed · Alerts (negative) · Unavailable fallback — **TC ย่อยทั้งหมด**: TRS-001..016,026..031,047,049,058..061 · ALT-032 · [GAP-12,13]

**Result**: 

### 2.8 E2E-008 — Delete & restore (ลบบัญชี → grace → login กลับ → ข้อมูลคืน)

วงจรบัญชีเต็ม: deactivate ทันที → ซ่อนจากสาธารณะ → sign in คืนชีพ → ตรวจว่าอะไรกลับ/ไม่กลับ · modules: Settings/Auth → Profile/Library/Chat/WA · **ต้องใช้**: SETUP-02/07 (เครื่อง 2 เช็กฝั่ง public — ไม่มี → step 4 BLOCK ย่อย)

| Step | Action ที่ทำ | Expected — การทำงาน | Expected — การแสดงผล | TC ย่อยที่ครอบ |
| --- | --- | --- | --- | --- |
| 1 | sign in `DEL-ACCT` → own profile → เมนู → Settings → `เกี่ยวกับบัญชี` → `ลบบัญชีผู้ใช้` → step 1 | หน้า del step 1 ครบ (การ์ดเงื่อนไข 3 ใบ รวม `การแจ้งเตือนนาฬิกาจะถูกยกเลิก`) | — | SET-025 · AUTH-082..088 |
| 2 | `ดำเนินการต่อ` → เลือกเหตุผล → `ดำเนินการขอลบบัญชี` → กรอกรหัส → `ยืนยันลบบัญชี` | password dialog → dialog `ตั้งเวลากำหนดลบบัญชีแล้ว` + วันลบถาวร = +30 วัน | — | SET-027..032 · AUTH-089..092 |
| 3 | กด `ออกจากระบบ` | ปิด settings stack → feed guest (scroll บนสุด) + toast `…30-day grace period started.` + Member Sheet `Join TukDaeng` · back ไม่มีทางกลับ | — | SET-033 |
| 4 | เครื่อง 2: ACCT-2 เปิด public profile `DEL-ACCT` + หาโพสต์ของมันใน feed/search | บัญชี deactivated → profile+listings **ซ่อนจากสาธารณะทันที** — profile ไม่พร้อมใช้/ไม่พบ · โพสต์หาย feed+search | ไม่มีข้อมูล DEL-ACCT ค้างบน public surface | [GAP-14] |
| 5 | เครื่อง 2: เปิดห้องแชทที่ `DEL-ACCT` เคย Ask มา (ห้องของ ACCT-2 ฝั่ง seller) | ห้อง+ประวัติยังอยู่ฝั่งอีกคน — ไม่หายพร้อมบัญชี (deactivated ≠ deleted ถาวร) | — | [GAP-15] |
| 6 | เครื่อง 1: บน Member Sheet แตะ `เข้าสู่ระบบ` → sign in `DEL-ACCT` เดิม | sign in สำเร็จ = **ยกเลิกคำขอลบ + restore** — ไม่มี blocked state · เข้า feed เป็น member | — | SET-034 · AUTH-044..049 |
| 7 | เช็กข้อมูลกลับครบ: own profile (โพสต์กลับ) · `saved` · wish list · chat thread เดิม · เครื่อง 2 เช็ก public profile `DEL-ACCT` อีกครั้ง | โพสต์/เซฟ/wishlist/chat กลับครบ · เครื่อง 2 เห็น profile+listings กลับมาปกติ | — | SET-034 · [GAP-16] |
| 8 | Settings → `การแจ้งเตือนนาฬิกา`/`Watch Alerts` | **list ว่าง** — WA ที่ถูกยกเลิกตอน deactivate ไม่กลับมาหลัง restore (ล็อก 2026-10-29) — ต้องตั้งใหม่เอง | empty state walerts | SET-035 |

**Modules ที่ผ่าน**: Settings/Auth (delete+restore) · Profile/Feed/Search (public hidden+return) · Library/Chat (data persistence) · WA (cancelled ถาวร) — **TC ย่อยทั้งหมด**: SET-025..035 · AUTH-044..049,082..097 · [GAP-14..16]

**Result**: 

### 2.9 E2E-009 — Block → keep-page → unblock ข้าม surface

เหตุผลที่ต้องมี: block ตัดพร้อมกันหลาย module (feed/search/WA/follow/chat/profile/settings) — เส้นนี้ยืนยันว่า apply ครบในครั้งเดียวและ unblock คืนถูกต้องโดยไม่ฟื้นความสัมพันธ์ · modules: Report/Block → Feed/Search → Profile → Chat → Settings · **ต้องใช้**: SETUP-02/03/05 + MEMBER-A เคยคุย/ติดตาม `U-B` (ทำ follow+Ask ก่อนรันเส้นนี้)

| Step | Action ที่ทำ | Expected — การทำงาน | Expected — การแสดงผล | TC ย่อยที่ครอบ |
| --- | --- | --- | --- | --- |
| 1 | MEMBER-A: public profile `U-B` → ⋯ → `Block` → blkSheet → `Block` | sheet ปิด + toast `Blocking` + effects apply ทันที | sheet anatomy (avatar + 3 impact rows + Block/Block and report) | TRS-032..037 |
| 2 | กลับ feed (ทุกแท็บ) + search keyword เดิม + เช็ก `walerts` count | โพสต์ `U-B` หาย feed ทุกแท็บ · ค้นไม่เจอ · ออกจาก WA match pool (ไม่นับ/ไม่เด้งต่อไป) | — | TRS-039..041 · WA-055 |
| 3 | เช็ก follow ทั้งสองทิศ (followers/following ของตัวเอง) | auto-unfollow ทันที + `U-B` หลุด followers เรา — ความสัมพันธ์ถูกตัด | count ลดฝั่งที่เกี่ยว | TRS-042 |
| 4 | เปิด `profile:U-B` โดยตรง | **keep-page**: หน้าคงอยู่ head/avatar/bio ปกติ — stats `−`/0 กดไม่ได้ + grid `No posts yet` + ปุ่มเดียว `เลิกบล็อก`/`Unblock` — **ไม่ใช่** unavailable page | ⋯ ยังเปิดได้ (แถวอ่าน `Unblock`) | TRS-043 |
| 5 | เปิด Chat list → ห้อง `U-B` เดิม | แถว list มี chip `Blocked` · ห้อง composer ถูกแทนด้วย bar `You blocked this account` + `Unblock` — ประวัติอ่านได้ | — | TRS-044 · PROF-062 |
| 6 | ลองสร้างทางคุยใหม่: `แชท` บน profile `U-B` + Ask บนลิสติ้ง `U-B` (ถ้าเข้าถึงได้) | ทุกทางถูกกัน → toast `Cannot message a blocked account` ไม่เปิดห้อง | — | TRS-045 · CHAT-006 |
| 7 | เครื่อง 2: ACCT-2 เปิด `แจ้งเตือน` + เปิด profile `U-A` | ACCT-2 ไม่ได้ notification ใด ๆ · เปิด profile คน block → unavailable ตาม 00_NAV §10 (ไม่ใช่ keep-page) | — | TRS-047,048 |
| 8 | MEMBER-A: Settings → `บัญชีที่บล็อก`/`Blocked` | `U-B` อยู่ list | — | SET-072..077 |
| 9 | แตะ `Unblock` (จาก list หรือ keep-page) → dialog → `เลิกบล็อก` | unblock สำเร็จ + toast `Unblocked` (+ restrict hint ถ้ามี) | — | TRS-050..054 |
| 10 | sweep ผลกลับ: feed (โพสต์ `U-B` กลับ) · search · profile ปกติ · comments ของ `U-B` กลับมาในสาย · ห้องแชท composer คืน · followers list | content กลับครบทุก surface — **แต่ไม่ re-follow อัตโนมัติ** (ต้องกด Follow ใหม่ถ้าจะตาม) | — | TRS-046,050..054 · SET-072..077 |

**Modules ที่ผ่าน**: Block sheet/dialog · Feed/Search/WA pool · Follow graph · Profile keep-page · Chat (bar/guard) · Settings lists — **TC ย่อยทั้งหมด**: TRS-032..054 · PROF-062,063..075 · SET-072..077 · WA-055 · CHAT-006

**Result**: 

### 2.10 E2E-010 — Guest → member resume contract

เหตุผลที่ต้องมี: resume contract (surface คงอยู่แต่ต้องกดใหม่) เป็นกติกาที่ล็อกข้ามทุก surface — เส้นนี้ยืนยัน end-to-end บน 2 เส้นทาง auth (sign in / sign up) ว่า state ไม่หลุดและไม่มี pending-action resume · modules: Gate → Auth → Surface state · **ต้องใช้**: SETUP-04/05/09

| Step | Action ที่ทำ | Expected — การทำงาน | Expected — การแสดงผล | TC ย่อยที่ครอบ |
| --- | --- | --- | --- | --- |
| 1 | GUEST บน feed → แตะ save บน `P-B-POST` | Member Sheet เด้งก่อน handler — ไม่มี sv sheet | — | GATE-001,024 |
| 2 | แตะ `เข้าสู่ระบบ` → sign in `MEMBER-A` สำเร็จ | กลับ surface เดิม (feed ตำแหน่งเดิม โพสต์เดิม) เป็น member — action save ที่กดไว้ **ไม่ auto-resume**: โพสต์ยังไม่ถูกเซฟ | bookmark ยังว่างบนการ์ดเดิม | GATE-036..041 · AUTH-044..049 |
| 3 | แตะ save อีกครั้ง (ต้องกดใหม่เอง) | sv sheet เปิดปกติ → เซฟเข้า All posts → toast | bookmark ติด + sheet ครบ | GATE-036..041 · SHT-056..066 |
| 4 | (รอบ B — sign up) sign out → guest → แตะ like `P-B-POST` → `สมัครสมาชิก` → ผ่าน signup+OTP+profile → created | กลับ surface เดิมเป็น member ใหม่ — like ที่กดไว้**ไม่**ติดเอง | หัวใจยังว่าง | GATE-036..041 · AUTH-028..043 |
| 5 | แตะ like อีกครั้ง | like ติดปกติ + count ขยับ | — | GATE-036..041 |
| 6 | (รอบ C — abandon) guest อีกครั้ง → แตะ follow → sheet → `Skip for now` | ปิดเงียบ — session ยัง guest · surface เดิม · action ไม่ทำงาน · เปิด gate ใหม่ได้ทุกครั้ง | — | GATE-026..029 |

**Modules ที่ผ่าน**: Member Sheet · Auth (sign in/sign up) · Surface state persistence · gated actions — **TC ย่อยทั้งหมด**: GATE-001,024..041 · AUTH-028..049 · SHT-056..066

**Result**: 

### 2.11 E2E-011 — Not-interested loop (feed → ni-card → ni list → restore → feed)

เหตุผลที่ต้องมี: "ไม่สนใจ" ไหลข้าม 3 module (feed feedback → content prefs → library ni list → กลับ feed) — เส้นนี้ยืนยัน state เดินทางครบ · modules: Feed → Settings/Prefs → Library NI · **ต้องใช้**: SETUP-03/05

| Step | Action ที่ทำ | Expected — การทำงาน | Expected — การแสดงผล | TC ย่อยที่ครอบ |
| --- | --- | --- | --- | --- |
| 1 | MEMBER-A บน feed: ⋯ `P-B-POST` → `ไม่สนใจ`/`Not interested` | การ์ดโพสต์ถูกแทนด้วย feedback card (ni-card): `Undo` + `Mute seller` + `Unfollow`(ถ้าติดตาม) หรือ `จัดการความต้องการเนื้อหา` | — | FEED-054..059,068..072 |
| 2 | เลื่อน feed ต่อ + refresh | `P-B-POST` ไม่กลับมาใน feed — ni flag กรองออก | — | FEED-068..072 |
| 3 | Settings → `การตั้งค่าเนื้อหา`/`Content preferences` → `ไม่สนใจ`/`Not interested` | `P-B-POST` อยู่ใน ni list | แถวแสดงโพสต์+ปุ่มคืนค่า | SET-078..091 · LIB-088..097 |
| 4 | แตะ `คืนค่า`/`Restore` บนแถว | ออกจาก ni list + toast · ni flag ถูกยก | row หายจาก list | LIB-088..097 |
| 5 | กลับ feed (refresh/เปิดใหม่) | `P-B-POST` กลับมาแสดงใน feed ตามสิทธิ์ปกติ | — | [GAP-17] |
| 6 | (สาขา) ทำ ni อีกครั้ง → บน ni-card แตะ `Undo` ทันที | การ์ดเดิมกลับมาแทน feedback card · ไม่เข้า ni list (undo ก่อน commit) | — | FEED-068..072 |

**Modules ที่ผ่าน**: Feed post-menu + feedback card · Content preferences · NI library list · Feed re-composition — **TC ย่อยทั้งหมด**: FEED-054..059,068..072 · SET-078..091 · LIB-088..097 · [GAP-17]

**Result**: 

### 2.12 E2E-012 — Library sync ข้าม surface (save/wishlist/archive → hub → tile → viewer → unsave)

เหตุผลที่ต้องมี: save/wishlist/archive ถูกกระทำจากหลาย surface (feed card/detail/viewer/own menu) แล้วต้องไปโผล่หน้าเดียวกันครบ + กลับทางก็ต้อง sync — เล่ม module เช็กทีละชิ้น เส้นนี้ยืนยัน round-trip · modules: Feed/Detail → Sheets → Library → Viewer · **ต้องใช้**: SETUP-03/05/06

| Step | Action ที่ทำ | Expected — การทำงาน | Expected — การแสดงผล | TC ย่อยที่ครอบ |
| --- | --- | --- | --- | --- |
| 1 | MEMBER-A: เซฟ `P-B-POST` จาก feed card → sv sheet → `All posts` | toast saved + bookmark ติด · เข้า All posts | — | FEED-042..045 · SHT-056..066 |
| 2 | เซฟ `P-B-SALE` → sv sheet → `+ New collection` `C-BUY` → เลือก | สร้าง collection + ใส่โพสต์ในครั้งเดียว | — | SHT-073..080 |
| 3 | เปิด detail `P-B-SALE` → 🎁 → เลือก `W-BUY` (จาก E2E-001 หรือสร้างใหม่) | เข้า wish list collection | — | DET-024..029 · SHT-067..072 |
| 4 | Settings → กลุ่ม `คลังของคุณ`/`Your library` | row counts ตรงจำนวนจริง (Saved ≥2 · Wish List ≥1) | — | LIB-001..010 |
| 5 | เปิด `saved` → collections แท็บ → `C-BUY` | tile `P-B-SALE` อยู่ใน collection + อยู่ All posts ด้วย (multi-surface sync) | — | LIB-011..029,046..063 |
| 6 | แตะ tile ใน collection | Post Viewer (feed mode) เปิดตรงโพสต์ | — | PV-003..005 · LIB-011..029 |
| 7 | ใน viewer: ⋯/save → unsave `P-B-SALE` → ออกดู hub + `C-BUY` | unsave sync กลับ — tile หายทั้ง hub และ collection · count ลด | — | LIB-030..045,098..105 |
| 8 | own post ⋯ → `Archive` → Settings → `คลังข้อมูลที่เก็บถาวร`/`Archive` | โพสต์ตัวเองย้ายเข้า archive grid (newest-first) + หายจาก profile grid สาธารณะ | `เฉพาะคุณที่เห็น` note | FEED-060..067 · LIB-079..087 |
| 9 | archive → unarchive กลับ | โพสต์กลับ profile เดิม — ไม่สร้างโพสต์ซ้ำ | — | LIB-079..087 |

**Modules ที่ผ่าน**: Save/Wishlist sheets · Detail · Library hubs (saved/collections/wishlist/archive) · Viewer — **TC ย่อยทั้งหมด**: FEED-042..045,060..067 · SHT-056..080 · DET-024..029 · LIB-001..105 · PV-003..005

**Result**: 

### 2.13 E2E-013 — Follow loop (follow → alert → follow back → feed → unfollow clears)

เหตุผลที่ต้องมี: follow ไม่ได้จบที่ปุ่ม — มันเปลี่ยน feed composition + สร้าง alert + unfollow ต้องล้าง favorites/mute ที่เกี่ยว — เช็กทั้งวง · modules: Feed/Profile → Alerts → Feed tabs → Manage following · **ต้องใช้**: SETUP-02/03/05

| Step | Action ที่ทำ | Expected — การทำงาน | Expected — การแสดงผล | TC ย่อยที่ครอบ |
| --- | --- | --- | --- | --- |
| 1 | MEMBER-A: แตะ `ติดตาม`/`Follow` บน post head `P-B-POST` | follow toggle → ปุ่มเปลี่ยนสถานะ · `U-B` เข้า following ของ A | — | FEED-027..031 |
| 2 | เครื่อง 2: ACCT-2 เปิด `แจ้งเตือน` | follow row ใหม่จาก `U-A` (unread + badge) พร้อม `Follow back` + `x` | — | ALT-035..041 |
| 3 | เครื่อง 2: แตะ `Follow back` | ACCT-2 follow `U-A` กลับ — ปุ่มเปลี่ยนสถานะ · ไม่ mark read/ไม่ navigate | — | ALT-035..041 · PROF-040..054 |
| 4 | เครื่อง 1: เปิด feed แท็บ `กำลังติดตาม`/`Following` | โพสต์ `U-B` อยู่ใน Following feed | — | SHELL-035..041 · PROF-040..054 |
| 5 | เครื่อง 1: ⋯ บนโพสต์ `U-B` → `เพิ่มในรายการโปรด`/`Add to favorites` | `U-B` เข้า favorites (feed แท็บ Favorites มีโพสต์) | — | FEED-054..059 · SET-059..066 |
| 6 | เครื่อง 1: แตะ `กำลังติดตาม`/`Following ⌄` บน post head → `เลิกติดตาม`/`Unfollow` → confirm | unfollow สำเร็จ — **ล้าง favorites+mute ของ `U-B` ด้วย** (unfollow clears fav/mute — กติการะบบ) | confirm sheet ตาม uf/mf pattern | FEED-027..031 · SHT-091..098 |
| 7 | sweep: feed แท็บ Following + Favorites + `U-B` ใน following list + favorites list | `U-B` หลุด following + favorites list · โพสต์ยังอยู่ feed `ทั้งหมด`/`All` ปกติ (unfollow ≠ hide) | — | PROF-040..054 · SET-059..066 |

**Modules ที่ผ่าน**: Follow mechanics · Alerts (follow row) · Feed tabs · Favorites · Manage following/unfollow — **TC ย่อยทั้งหมด**: FEED-027..031,054..059 · ALT-035..041 · PROF-040..054 · SHELL-035..041 · SHT-091..098 · SET-059..066

**Result**: 

### 2.14 E2E-014 — Board read loop (guest → article → gate → sign in → like)

เหตุผลที่ต้องมี: Board เป็น module เดียวที่ guest อ่านได้เต็มแต่ interact ต้อง member — เส้นนี้ครอบ board×auth×resume ที่ไม่มีเส้นอื่นแตะ · modules: Board → Gate → Auth · **ต้องใช้**: SETUP-04/09

| Step | Action ที่ทำ | Expected — การทำงาน | Expected — การแสดงผล | TC ย่อยที่ครอบ |
| --- | --- | --- | --- | --- |
| 1 | GUEST: แท็บ `board` → เลือกบทความ `ART-1` | board เปิดฟรี (hero/latest/categories) → article detail อ่านได้ครบ (floating nav back/like/share ไม่มี bottom nav) | — | BRD-001..012,034..048 · GATE-042..048 |
| 2 | แตะ like pill บนบทความ | Member Sheet เด้ง — count ไม่ขยับ | — | GATE-013 · BRD-041..048 |
| 3 | `เข้าสู่ระบบ` → sign in `MEMBER-A` → กลับบทความเดิม | กลับ `ART-1` เดิม (surface คงอยู่) — like ที่กดไว้ไม่ติดเอง (resume contract) | — | GATE-036..041 |
| 4 | แตะ like pill อีกครั้ง → back | like ติด + count +1 · back กลับตำแหน่งเดิมบน board | — | BRD-041..048,049..058 |
| 5 | (ต่อเนื่อง) แตะ share pill → copy link → ส่งให้ตัวเองเปิดทีหลังใช้ E2E-016 | share sheet เปิด (member) → `Copy link` → toast คัดลอกแล้ว | — | SHT-049..055 · BRD-052..055 |

**Modules ที่ผ่าน**: Board (home/detail/gated actions) · Member Sheet · Auth resume · Share sheet — **TC ย่อยทั้งหมด**: BRD-001..012,034..058 · GATE-013,036..041,042..048 · SHT-049..055

**Result**: 

### 2.15 E2E-015 — Stale/deleted target fallback (ของที่กดไว้หายไปทีหลัง)

เหตุผลที่ต้องมี: ทุก entry ที่เคยชี้ content (saved tile / chat card / notification rows) ต้องกราชูนเมื่อ target หาย — spec §10 unavailable contract เป็นข้าม module — เส้นนี้รวมทุก entry ในเรื่องเดียว · modules: Library → Chat → WA → Alerts → Fallback UI · **ต้องใช้**: SETUP-02/03/05/06 (`P-B-DEL` คือโพสต์สำรองที่ ACCT-2 จะลบ — ก่อนรัน: MEMBER-A เซฟ `P-B-DEL` + Ask สร้างห้อง + (ถ้าตั้งได้) alert ที่เคยเด้งชี้ `P-B-DEL`)

| Step | Action ที่ทำ | Expected — การทำงาน | Expected — การแสดงผล | TC ย่อยที่ครอบ |
| --- | --- | --- | --- | --- |
| 1 | เครื่อง 1: MEMBER-A เซฟ `P-B-DEL` + Ask ส่งข้อความ 1 ฉบับ (มีห้อง+การ์ด) | baseline พร้อม: tile ใน saved · ห้อง `U-B` มีการ์ด `P-B-DEL` | — | LIB-030..045 · CHAT-002,003 |
| 2 | เครื่อง 2: ACCT-2 ลบ `P-B-DEL` (⋯ → Delete → confirm) | ลบสำเร็จฝั่ง seller — หายจาก grid/portfolio | — | AST-074,075 |
| 3 | เครื่อง 1: เปิด `saved` | tile `P-B-DEL` ถูกจัดการตาม contract (เอาออก/สถานะไม่พร้อมใช้) — count sync · **ไม่มี** tile ที่กดแล้วเปิดว่างเปล่า/ค้าง | — | LIB-098..105 |
| 4 | เครื่อง 1: เปิดห้อง `U-B` → แตะการ์ด `P-B-DEL` | การ์ด snapshot ยังแสดงข้อมูลเดิม · แตะ → unavailable `รายการนี้ไม่พร้อมใช้งานแล้ว` + `Go back` (ห้องไม่พัง) | — | CHAT-053 |
| 5 | เครื่อง 1: หา notification row เก่าที่ชี้ `P-B-DEL` (เช่น watch row ถ้าเคย match หรือ like row บนโพสต์ที่ลบ) → แตะ | ไม่เปิด viewer → unavailable state + `Go back` (ไม่ silent no-op) · กด `Go back` กลับหน้าก่อนได้ | — | WA-058 · ALT-032 |
| 6 | (ต่อเนื่อง) กด `Go back` บน fallback screen | กลับหน้าก่อนหน้าที่เข้ามา (feed/profile/chat) — ไม่ตกหลุม | label `Go back` ไม่ใช่ label เฉพาะทาง | DET-034..037 |

**Modules ที่ผ่าน**: Library (source change) · Chat (card snapshot) · WA (stale row) · Alerts (stale row) · Unavailable fallback contract — **TC ย่อยทั้งหมด**: LIB-030..045,098..105 · CHAT-002,003,053 · WA-058 · ALT-032 · AST-074,075 · DET-034..037

**Result**: 

### 2.16 E2E-016 — External deep link → gate → destination (quirk)

เหตุผลที่ต้องมี: spec §12/§13 deep link contract เป็น production-only (prototype ไม่มี) — เส้นนี้ยืนยันแค่ว่า build จริงเปิดลิงก์ภายนอกเข้าปลายทางถูกและ guest ถูก gate ถูกจุด — **ถ้า build ไม่รองรับ deep link → ทั้งเคส BLOCK บันทึกเหตุผล** · modules: Share → Deep link → Gate · **ต้องใช้**: SETUP-02/04/05/10

| Step | Action ที่ทำ | Expected — การทำงาน | Expected — การแสดงผล | TC ย่อยที่ครอบ |
| --- | --- | --- | --- | --- |
| 1 | เครื่อง 2: ACCT-2 เปิด `P-B-SALE` (ลิสติ้งที่ยังไม่ sold) → share → `Copy link` → ส่งลิงก์มาเครื่อง 1 ทางช่องทางภายนอก | link ถูกคัดลอก/ส่งถึงเครื่อง 1 — ถ้าไม่มี share/copy link หรือ link เปิดในแอปไม่ได้ → **BLOCK ทั้งเคส** | — | SHT-049..055 |
| 2 | เครื่อง 1 (session guest): แตะลิงก์ | เปิดเข้าแอป → validate auth → surface ที่ต้อง member แสดง Member Sheet/`Sign in` ก่อน ไม่ render content หลัง gate | — | ALT-043 · [GAP-18] |
| 3 | sign in `MEMBER-A` | ไปปลายทางของลิงก์ (Post Detail/Viewer ของ `P-B-SALE`) — ไม่ตก feed กลาง | — | [GAP-18] |
| 4 | กด back บนปลายทาง | back บนหน้าจอจาก external deep link ที่ไม่มี history → fallback Feed (spec §13) | — | [GAP-18] |

**Modules ที่ผ่าน**: Share sheet · Deep link routing · Guest gate · Back fallback — **TC ย่อยทั้งหมด**: SHT-049..055 · ALT-043 · [GAP-18]

**Result**: 

## §3 Watch points (จุดที่เคยพัง/ขัด spec — จับตาเป็นพิเศษตอนรันเส้น)

1. **Ask entry ห้ามอยู่บน Post Detail** — build ที่มีปุ่ม Ask/chat-fab/save บน detail = FAIL (spec 05 lock; DET-018) — เส้น buyer/WA loop ต้อง Ask จาก rail หรือการ์ดเท่านั้น
2. **Ask รีเซ็ต stack** — back จากห้องที่เปิดผ่าน Ask ต้องลง surface ข้างล่าง ไม่ย้อน detail/viewer (CHAT-008) — เคยเป็น dead path
3. **ห้องเดียวต่อ account** — Ask ลิสติ้งชิ้นสองของ seller เดิมต้องไม่สร้างห้องใหม่; การ์ดเป็นข้อความในสาย ไม่ pin ค้าง (FO-TEST-12 lock; PROF-057..060) — ระวัง build เก่าที่ผูก user+item
4. **sold leak** — canonical: โพสต์ sold หลุด feed/search/WA/แท็บเดิมทันที — prototype `salePosts()` leak เป็น documented defect ห้ามใช้เป็น expected (AST-083 · WA-050)
5. **match pool = Sale เท่านั้น + ไม่นับของผู้ถูก block/mute/ni** — E2E-005/009 เช็กฝั่ง pool นี้ (WA-050/055)
6. **report ≠ removal** — อย่า expect โพสต์หายหลัง report:done (TRS-009); ผลลบมาจาก BO เท่านั้น และ FO ไม่มีสถานะรายงาน (TRS-060/061)
7. **restore ไม่คืน WA** — หลัง login-to-restore list `walerts` ต้องว่าง (SET-035; ล็อก 2026-10-29)
8. **resume contract** — sign-in จาก gate แล้ว action เดิมต้องไม่ติดเอง ต้องกดใหม่ (GATE-036..041)
9. **detail เหนือ viewer เสมอ** — detail-back ต้องเผย viewer ใต้ ไม่ใช่ปิดทั้งคู่ (DET-001..005)
10. **badge sync ข้ามเครื่อง/จุด** — unread count ต้อง sync ทุก nav instance และข้ามเปิดแอปใหม่ (ALT-017..025)
11. **keep-page vs unavailable** — ฝั่ง "เรา block เขา" = keep-page มี Unblock; ฝั่ง "เขา block เรา" = unavailable — อย่าสลับกัน (TRS-043 vs 048)
12. **alert rows เก่าไม่ผูก alert id** — ลบ alert แล้ว row เก่ายังกดเปิดลิสติ้งได้; ลิสติ้งหาย → unavailable + Go back (WA-057/058)

## §4 Traceability — เส้น ↔ TC ย่อย ↔ [GAP]

| เส้น | TC ย่อยที่ครอบ (อ้างเล่ม) | [GAP] ในเส้น |
| --- | --- | --- |
| E2E-001 | GATE-001,033..035,042..048 · AUTH-028..043,061..068 · SRCH-006..011,017..043,055..057 · PV-001..012 · DET-001..019,024..029 · SHT-067..072 · WA-002,009..018 · CHAT-002,003,007,045..057 · PROF-056,058,060,061 | [GAP-7] |
| E2E-002 | CRE-001..053 · AST-038..085 · PROF-013..023,058 · FEED-001..008 · SRCH-017..032 · WA-043 · ALT-014,065..072 · CHAT-002,003,011..057,104,108..124 | — |
| E2E-003 | WA-001,003,009..015,026..033,043,056 · ALT-014,017..034,057..072 · DET-001..019 · CHAT-002,003,008 · PROF-058..060 | — |
| E2E-004 | AST-038..087 · CRE-049..053 · PROF-013..023 · WA-050 | — |
| E2E-005 | AST-038..054,083,085 · LIB-001..105 · CHAT-011..031,053,104 · WA-050 · SRCH-017..032 | [GAP-8,9,10,11] |
| E2E-006 | CRE-001..048 · FEED-027..038 · SHT-013..041 · ALT-010..041,065..072 · PROF-040..054 · SHELL-035..041 | — |
| E2E-007 | TRS-001..016,026..031,047,049,058..061 · ALT-032 | [GAP-12,13] |
| E2E-008 | SET-025..035 · AUTH-044..049,082..097 | [GAP-14,15,16] |
| E2E-009 | TRS-032..054 · PROF-062,063..075 · SET-072..077 · WA-055 · CHAT-006 | — |
| E2E-010 | GATE-001,024..041 · AUTH-028..049 · SHT-056..066 | — |
| E2E-011 | FEED-054..059,068..072 · SET-078..091 · LIB-088..097 | [GAP-17] |
| E2E-012 | FEED-042..045,060..067 · SHT-056..080 · DET-024..029 · LIB-001..105 · PV-003..005 | — |
| E2E-013 | FEED-027..031,054..059 · ALT-035..041 · PROF-040..054 · SHELL-035..041 · SHT-091..098 · SET-059..066 | — |
| E2E-014 | BRD-001..012,034..058 · GATE-013,036..041,042..048 · SHT-049..055 | — |
| E2E-015 | LIB-030..045,098..105 · CHAT-002,003,053 · WA-058 · ALT-032 · AST-074,075 · DET-034..037 | — |
| E2E-016 | SHT-049..055 · ALT-043 | [GAP-18] |

### [GAP] list (ส่งต่อ FO-TEST-20)

| ID | เส้น/step | สิ่งที่ยังไม่มี TC ย่อยครอบ | หมายเหตุ |
| --- | --- | --- | --- |
| GAP-7 | E2E-001 step 13 | negative sweep "ไม่มีจ่ายเงินในแอป" แบบข้ามทุก surface | กติการะบบ 5 ยังไม่มีเคสยืนยันแบบรวม |
| GAP-8 | E2E-005 step 5 | saved tile ของโพสต์ที่ sold — contract ละเอียดฝั่ง saver | LIB-098..105 ครอบต้นทางเปลี่ยนสถานะกว้าง ๆ เท่านั้น |
| GAP-9 | E2E-005 step 6 | `{n} matches now` หลุดลิสติ้ง sold แบบเรียลไทม์ | WA-050 ครอบ pool แต่ไม่ครอบ recount หลัง sold |
| GAP-10 | E2E-005 step 7 | chat card → sold post detail ฝั่ง non-owner (unavailable vs เปิดได้) | CHAT-104/053 ครอบบางส่วน — contract ปลายทาง sold ยังคลุมเครือ |
| GAP-11 | E2E-005 step 8 | stale Ask entry บนลิสติ้งที่หลุดสาธารณะ | ไม่มี TC ย่อย |
| GAP-12 | E2E-007 step 6 | ฝั่งถูก report ไม่ได้ notification (anonymous) — เช็กเครื่อง 2 | TRS-060 ครอบฝั่ง reporter เท่านั้น |
| GAP-13 | E2E-007 step 7 | ผล moderation (remove/hide) สะท้อนกลับ FO จริงผ่าน BO | TRS-061 mark BLOCK ล่วงหน้าไว้แล้ว — ต้องการ BO access |
| GAP-14 | E2E-008 step 4 | public surface ซ่อนบัญชี deactivated ทันที (เช็กข้ามเครื่อง) | เล่ม 15 เช็กฝั่งผู้ลบเท่านั้น |
| GAP-15 | E2E-008 step 5 | ห้องแชทฝั่งอีกคนหลัง deactivate (ยังอยู่/เช่นไร) | ไม่มี TC ย่อย |
| GAP-16 | E2E-008 step 7 | restore set ละเอียด (posts/saved/wishlist/chat กลับครบ) — SET-034 ครอบกว้าง ๆ | แยกเคสย่อยในเล่ม 20 |
| GAP-17 | E2E-011 step 5 | โพสต์ที่ restore จาก ni กลับเข้า feed | LIB-088..097 ครอบ restore บน list ไม่ครอบผลกลับ feed |
| GAP-18 | E2E-016 step 2–4 | external deep link → gate → destination → back fallback (production contract §12/§13) | contract-only — module books ไม่มีเคสระดับนี้ |

## สถิติ

| หมวด | จำนวน |
| --- | --- |
| เส้น E2E ทั้งหมด | 16 (บังคับ 7 + เพิ่มเติม 9) |
| HIGH / MED / LOW | 5 / 9 / 2 |
| เส้นที่ต้องใช้เครื่อง 2 (ACCT-2) | 10 เต็ม (E2E-002,003,005,006,007,008,009,013,015,016) + 1 บาง step (E2E-004) |
| SETUP rows | 10 |
| step รวมทุกเส้น | 125 |
| [GAP] ที่ส่งต่อเล่ม 20 | 12 (GAP-7..18) |
