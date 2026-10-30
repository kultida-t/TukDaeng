# FO-TEST-001-16 — Test Cases: Report & Block — Trust & Safety (แอปมือถือจริง)

**Task**: FO-TEST-16 ของชุด FO-TEST-001 — เล่ม Trust & Safety (report stack + shared block/unblock surfaces) ที่เล่ม 03/04/07/08/12/15 อ้าง cross-book มาตลอด — เขียนเป็นเวอร์ชันเทสแอปมือถือจริงตั้งแต่แรก (ไม่มีรอบ prototype แยก เพราะ spec ล็อกแล้ว)
**SoT**: แอป TukDaeng build ทดสอบบนมือถือจริง — expected ล็อกตาม `FrontOffice/15_TRUST_SAFETY_MODULE.md` (report stack + entry matrix §8 + shared surfaces §9 + rules §12 + AC-TS-001..019) + `00_GLOBAL_RULES_MODULE.md` §13 (Block/Report impact + AC-GLOBAL-010/011) + `06_PROFILE_MODULE.md` (canonical `blkSheet`/`unblockDlg`/`pfSetBlocked` + keep-page S-13) + `07_CHAT_MODULE.md` (`chatReportSheet` + `th.blocked` room effects) + `11_SOCIAL_MODULE.md` (comment popover + `Blocked and hidden comments`) + `12_BOARD_MODULE.md` §13 (Report Board Content — contract-only) + `00_NAVIGATION_AND_CROSS_MODULE_FLOW.md` §6.1/§6.6/§6.7 (Report Stack routes + back/X) — `Prototypes/fo-flow` = แค่ reference ว่าหน้าตาควรเป็นแบบไหน
**Scope**: report stack ทุกหน้า (`report` / `report:pick:{u}` / `report:posts:{u}` / `report:post` / `report:user` / `report:comment` / `report:done:{u}`) + report entry ทุกจุด (post `⋯` / uncomf ack card / profile `⋯` / comment long-press popover / `chmenu` Report / `Block and report`) + shared surfaces `blkSheet` / `unblockDlg` / `chatReportSheet` / `muteDlg` (done-step) + block impact ข้ามทุก surface (feed/search/WA/following/chat/comments/profile keep-page) + unblock ทุก entry + guest gate + persist + TH/EN + dark
**ยกเว้น**: internals ของหน้าที่เปิด report อยู่ (feed card/Post Viewer/Post Detail → FO-TEST-03/06 · profile anatomy → FO-TEST-12 · chat room internals → FO-TEST-08 · comment sheet internals → FO-TEST-07/11) · Settings `blocked`/`muted` list anatomy → FO-TEST-15 (เล่มนี้เช็กเฉพาะ unblock entry จาก list) · Member Sheet internals + guest-gate matrix เต็มทั้งแอป → FO-TEST-17 · BO review/moderation internals → เล่มฝั่ง BO (เล่มนี้เช็กเฉพาะ contract ฝั่ง FO) · board article internals → FO-TEST-09
**หมายเหตุ**: เขียนเสร็จรอรีวิว — อย่าเพิ่งปิดงาน · ชื่อไฟล์ตามที่สั่ง `FO-TEST-001-16-report-block.md` (task-breakdown §16 sync แล้ว)

---

## §0 วิธีใช้ + สภาพแวดล้อม + กติกาที่ล็อก

- **ทดสอบบนเครื่องจริงเท่านั้น** — ติดตั้งแอป build ทดสอบลงมือถือจริง แตะ/ปัด/พิมพ์/เลื่อนบนหน้าจอจริง — **ไม่ใช้ browser, dev console, ปุ่ม dev/demo, localStorage, ข้อมูลจำลอง** — เตรียมสถานะด้วย action จริงในแอป + ข้อมูลจริงบน server เท่านั้น
- **Actors**: `GUEST` = ไม่ sign in · `MEMBER` = บัญชีทดสอบจริงบนเครื่องหลัก · `ACCT-2` = **บัญชีจริงที่สอง บนเครื่องจริงอีกเครื่อง** — ใช้เทสฝั่งถูก block/ถูก report (เขา block เรา · ไม่มี notification ให้เขา · cross-device sync) — เคสที่ต้องบัญชี/เครื่องอื่นแต่ไม่มี → mark `BLOCK` ระบุใน Note
- **เป้าหมายเทส (ตั้งชื่อใน SETUP-06 แล้วบันทึกจริงลง Note)**: `U-BLK` = user เป้าหมาย block/report หลัก (มีโพสต์+โปรไฟล์จริง) · `U-CHT` = user ที่มี chat thread กับเราอยู่แล้ว · `U-CM` = user ที่มี comment `C-RP` บนโพสต์ใดก็ได้ · `U-F` = user ที่เรา follow อยู่ (สำหรับ done-step Unfollow) · `P-RP` = โพสต์ของคนอื่นที่ใช้ report · `U-NP` = user ที่ไม่มีโพสต์เลย (edge)
- **Type**: `POSITIVE` · `NEGATIVE` · `EDGE` · `STATE` · `UI` · `GATE` · `GATE-inverse`
- **[GATE] ทุกเคสเทส 2 รอบ**: รอบ A `GUEST` → expect Member Sheet/ไม่มีทางถึง; รอบ B `MEMBER` → expect feature ทำงาน — report/block ทุก entry อยู่ใน gate list (spec 15 §13)
- **Device back เทียบเท่า `<`/`✕` ในแอป** — report stack เปิดอยู่ต้อง pop/close ชั้นบนสุดก่อน; เคส "แตะ back" ใช้ device back แทนได้ ผลต้องเทียบเท่า
- **ภาษาตามแอปทั้งหมด** (ล็อก 2026-10-28): ทุกข้อความ UI + toast + sheet + dialog เปลี่ยนตามภาษาที่เลือก — เจอ string ค้างอีกภาษา = **FAIL** — string canonical ในตารางนี้เขียน `TH`/`EN` คู่กัน; จุดที่เคย hardcode EN ใน prototype (`blkSheet`/`chatReportSheet`/blocked bar+chip/`pf-more` rows/`uncomf` card/`chmenu` labels) เพิ่ม TH แล้วรอบนี้ — expected เขียน `TH`/`EN` คู่กันตาม copy ใหม่; ยกเว้นชื่อ user/แบรนด์/รุ่น
- **Dark theme**: ทุกหน้า/sheet/dialog อ่านได้ครบใน dark — contrast โอเค
- **Priority**: `HIGH` = กติกาหลัก/flow สำคัญ · `MED` = feature หลัก/edge · `LOW` = quirk; เคส BLOCK ล่วงหน้า = MED เว้นกำหนด
- **Result column**: เว้นว่าง — tester กรอก `PASS`/`FAIL`/`BLOCK` + ปัญหาใน `Note`
- **ไม่มีเคสแบบ "จดผล" ไม่มีผลลัพธ์ทางเลือก** — ทุกเคส expected ตรง spec/contract ข้อเดียวเด็ดขาด ไม่ตรง = FAIL
- **กติกาใหญ่ของเล่มนี้**: report = submit ตอนแตะเหตุผล (ไม่มีปุ่ม Submit แยก) แล้วไป `report:done` เสมอ · report **ไม่ลบ** content ใด ๆ (รอ Admin moderation) · block = shared `blkSheet` เท่านั้น (ห้าม `Block this user?` center dialog) · unblock = shared `unblockDlg` เท่านั้น + ไม่ re-follow · ฝั่งเรา block = keep-page (S-13) · ฝั่งถูก block = unavailable (00_NAV §10)

## §1 Coverage map

| Route / Surface (inventory §2.10 + spec 15) | ขอบเขต | TC ที่ครอบ |
| --- | --- | --- |
| `report` (post reason page) | entry ⋯/uncomf · X-only · 9 reasons · submit=แตะเหตุผล · rp-over ทับ viewer | TRS-001..010 |
| `report:pick:{u}` / `report:posts:{u}` / `report:post` / `report:user` | picker 2 ทาง · grid เลือกทีละใบ · Next disabled · `<` pop | TRS-011..016 |
| `report:comment` + comment popover | long-press → Block/Report · X-only ทั้งกอง | TRS-017..020 |
| `chatReportSheet` + `report:user` (fromChat) | Report / Report and delete / Cancel · teardown list | TRS-021..025 |
| `report:done:{u}` + `rp-step` | thanks + steps Block/Unfollow/Mute/Unblock · green check · toast เดียวกัน | TRS-026..031 |
| `blkSheet` (ทุก entry) | anatomy · backdrop · `Blocking` toast · fromChat variant · Block and report · comment-context toast | TRS-032..038 |
| block impact ข้าม surface | feed/search/WA/follow/keep-page/chat/comments/notification/deep link | TRS-039..049 |
| `unblockDlg` (ทุก entry) | anatomy · entries · cancel · `Unblocked` + restrict-hint · ไม่ re-follow · ผลกลับ | TRS-050..054 |
| guest gate + edge + handoff | gate ทุก entry · self-report · report ซ้ำ · board contract · FO notification · BO handoff | TRS-055..061 |
| persist / ภาษา / dark | block ติดบัญชีข้าม kill/sign-out/เครื่อง · TH/EN · dark | TRS-062..065 |

## §2 Test cases

ผู้ทดสอบ: อ่าน expected ก่อนรันเสมอ — เคสที่เขียน "BLOCK ถ้า..." ให้ mark BLOCK พร้อมเหตุผลใน Note (ห้าม workaround)

### Setup

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SETUP-01 | ติดตั้งแอป | — | SETUP | เครื่องจริงเครื่องหลัก | ติดตั้ง build ทดสอบที่ทีมส่งให้ → เปิดแอป | เห็นหน้า onboarding (แอปสะอาด) | splash/หน้าแรกของแอป | — | |
| SETUP-02 | สถานะเริ่มต้น | — | SETUP | แอปติดตั้งแล้ว | ลบข้อมูลแอป/ติดตั้งใหม่ ถ้าเคยใช้เครื่องนี้มาก่อน | แอปสะอาด เหมือนผู้ใช้ใหม่ | — | — | |
| SETUP-03 | ผู้ใช้ GUEST | — | SETUP | แอปสะอาด | ไม่ sign in → เดินเข้า feed ได้เลย | guest mode | bottom nav ครบ | — | |
| SETUP-04 | ผู้ใช้ MEMBER | — | SETUP | แอปสะอาด | sign in ด้วยบัญชีทดสอบที่ทีมสร้าง | เข้า feed เป็นสมาชิก | avatar/ชื่อตัวเองในที่ที่ต้องแสดง | — | |
| SETUP-05 | เครื่องที่สอง + ACCT-2 | — | SETUP | มีเครื่องจริงอีกเครื่อง | ติดตั้ง build เดียวกันลงเครื่องสอง → sign in `ACCT-2` | บัญชีสองพร้อม — ถ้าไม่มี → เคส ACCT-2/cross-device เป็น BLOCK | — | — | |
| SETUP-06 | ชุดข้อมูล report/block | MEMBER | SETUP | sign in แล้ว | ทำผ่านแอปจริงแล้วบันทึกชื่อลง Note: เลือก `U-BLK` (user ที่มีโพสต์+โปรไฟล์จริง ใช้ block/report หลัก) · `U-CHT` (user ที่มี thread แชทอยู่แล้ว — ไม่มีให้ Ask สร้างก่อน) · `U-CM` เจ้าของ comment `C-RP` บนโพสต์ใดก็ได้ · follow `U-F` ไว้ (ทำ unfollow step ได้) · เลือก `P-RP` โพสต์คนอื่นสำหรับ report · หา `U-NP` user ที่ไม่มีโพสต์ (ถ้ามี) | ข้อมูลพร้อม — สร้างสถานะไม่ได้ = เคสที่เกี่ยว `BLOCK` | — | — | |
| SETUP-07 | ทางเข้า report/block ครบ | MEMBER | SETUP | SETUP-06 เสร็จ | เดินเปิดทีละ entry: post ⋯ · profile ⋯ · long-press comment · chatroom → `≡` → `chmenu` · ni-card → uncomf | ทุก entry เปิดได้ตรงจุด — เข้าไม่ได้ = เคสที่เกี่ยว BLOCK | — | — | |
| SETUP-08 | baseline สะอาด | MEMBER | SETUP | SETUP-06 เสร็จ | Settings → `บัญชีที่บล็อก`/`Blocked` ต้องไม่มี `U-BLK`/`U-CHT`/`U-CM` ค้าง · Chat list ของ `U-CHT` ไม่มี chip `Blocked` | สถานะเริ่มสะอาด — ถ้ามีค้างให้ unblock ก่อนรัน | — | — | |

### 2.1 Report Post — `report` + entries + stack

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TRS-001 | [GATE] post ⋯ → Report entry | GUEST/MEMBER | GATE | feed มีโพสต์คนอื่น `P-RP` | **รอบ A (GUEST)**: แตะ ⋯ บนการ์ด · **รอบ B (MEMBER)**: แตะ ⋯ | A: Member Sheet `เข้าร่วมตึกแดง`/`Join TukDaeng` เด้งทันที — guest เห็นเมนูไม่ได้ด้วยซ้ำ; B: sheet ⋯ คนอื่น = `ไม่สนใจ`/`Not interested` + `รายงาน`/`Report` (danger) | A: sheet gate; B: bottom sheet 2 แถว | HIGH | |
| TRS-002 | Report entry ครบทุก surface ของ ⋯ | MEMBER | POSITIVE | เข้าถึง `P-RP` ได้จาก feed card / post viewer rail / post detail / profile grid tile | เปิด ⋯ ทีละ surface → เช็กแถว Report → แตะ | ทุก surface มี `รายงาน`/`Report` ตัวแดง และเปิดหน้า `report` เดียวกัน | — | MED | |
| TRS-003 | `report` anatomy (post reason page) | MEMBER | UI | ⋯ → Report | อ่านหน้า | head = title `รายงาน`/`Report` + `✕` — **ไม่มี `<`** · q `ทำไมคุณถึงรายงานโพสต์นี้?`/`Why are you reporting this post?` + disclaimer `การรายงานของคุณจะไม่เปิดเผยตัวตน…`/`Your report is anonymous…` + 9 reason rows มี chevron | sheet ⋯ ปิดไปพร้อมกัน (ไม่มีแถวโผล่ใต้หน้า) | HIGH | |
| TRS-004 | ชุดเหตุผล canonical 9 ข้อ | MEMBER | UI | `report` เปิด | อ่านเหตุผลทุกแถวบน-ล่าง | 9 เหตุผลชุดเดียวตามลำดับ `PM_REASONS`: `ฉันแค่ไม่ชอบ`/`I just don't like it` · `การกลั่นแกล้งหรือการติดต่อที่ไม่พึงประสงค์`/`Bullying or unwanted contact` · `การฆ่าตัวตาย ทำร้ายตัวเอง หรือพฤติกรรมการกินที่ผิดปกติ`/`Suicide, self-injury or eating disorders` · `ความรุนแรง ความเกลียดชัง หรือการแสวงหาประโยชน์`/`Violence, hate or exploitation` · `สินค้าลอกเลียนแบบหรือของปลอม`/`Counterfeit or replica item` · `ภาพเปลือยหรือกิจกรรมทางเพศ`/`Nudity or sexual activity` · `การหลอกลวง การฉ้อโกง หรือสแปม`/`Scam, fraud or spam` · `ข้อมูลเท็จ`/`False information` · `ทรัพย์สินทางปัญญา`/`Intellectual property` — ชุดเดียวกันทุก report type | — | HIGH | |
| TRS-005 | แตะเหตุผล = submit ในตัว | MEMBER | POSITIVE | `report` เปิด | แตะเหตุผล 1 แถว | push ไป `report:done:{u}` ทันที — **ไม่มี** ปุ่ม Submit/Next แยก และ**ไม่มี**ช่อง Additional details | — | HIGH | |
| TRS-006 | `✕` กลาง flow → ไม่สร้าง report | MEMBER | NEGATIVE | `report` เปิด | แตะ `✕` โดยไม่เลือกเหตุผล | กอง report ปิดทั้งกองในครั้งเดียว กลับ surface เดิม — ไม่มี report ถูกสร้าง ไม่มี toast | — | HIGH | |
| TRS-007 | dismiss ทุกวิธีกลาง flow | MEMBER | NEGATIVE | `report:posts`/`report:user` เปิด | ทดสอบทีละวิธี: `<` จนหมดกอง · `✕` · device back | ทุกวิธีออกได้โดยไม่สร้าง report — device back เทียบเท่าปุ่มในแอป | — | MED | |
| TRS-008 | report stack ทับ post viewer | MEMBER | STATE | Post Viewer `P-RP` เปิดอยู่ | ⋯ ใน viewer → Report → เลือกเหตุผล → `Done` | หน้า report เลื่อนทับ viewer (`rp-over`) — ปิดกองแล้ว viewer ยังอยู่ข้างล่างใช้ต่อได้ | viewer ไม่ถูกปิดไปด้วย | HIGH | |
| TRS-009 | report ไม่ลบโพสต์ (AC-TS-010) | MEMBER | POSITIVE | report `P-RP` เสร็จแล้ว | กลับ feed → เปิด viewer/detail/กริดโปรไฟล์ seller ดูโพสต์เดิม | โพสต์ยังแสดงปกติทุก surface — report ≠ removal รอ Admin moderation เท่านั้น | — | HIGH | |
| TRS-010 | uncomf ack card → Report | MEMBER | POSITIVE | `ไม่สนใจ` `P-RP` → ni-card → `โพสต์นี้ทำให้ฉันรู้สึกไม่สบายใจ` | แตะ `Report` บน ack card → ทำซ้ำแตะ `Undo` รอบใหม่ | ack card (check + `Thanks for letting us know` + `Report`/`Undo`) → Report เปิดหน้า `report` เหตุผลโพสต์เดียวกับ ⋯ (entry เสริม ไม่ใช่ type ใหม่) · Undo คืนการ์ดเดิม | — | MED | |

### 2.2 Report User — `report:pick` / `report:posts` / `report:user`

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TRS-011 | `report:pick` anatomy | MEMBER | UI | profile `U-BLK` → ⋯ → `Report` | อ่านหน้า | head `Report` + `✕` ไม่มี `<` · `คุณต้องการรายงานอะไร?`/`What do you want to report?` + disclaimer + ตัวเลือก `โพสต์ใดโพสต์หนึ่ง`/`A specific post` + `เกี่ยวกับบัญชีนี้`/`Something about this account` | picker เลื่อนขึ้นทับ sheet ⋯ (sheet snap shut) | HIGH | |
| TRS-012 | `A specific post` → grid picker | MEMBER | UI | `report:pick` เปิด | `A specific post` → แตะ tile 1 ใบ → แตะอีกใบ | หน้า `เลือกโพสต์`/`Select a post`: `<` + `✕` + tile grid โพสต์ของ `U-BLK` + `ถัดไป`/`Next` **disabled จนเลือก** — เลือกทีละ 1 ใบเสมอ (เลือกใหม่แทนที่เดิม) | tile ที่เลือกมี check overlay | HIGH | |
| TRS-013 | Next → `report:post` → done | MEMBER | POSITIVE | เลือก tile แล้ว | `Next` → เลือกเหตุผล | `report:post` (`<`+`✕` · q `…โพสต์นี้?`) → เหตุผล → `report:done:{u}` | — | HIGH | |
| TRS-014 | `Something about this account` → `report:user` | MEMBER | POSITIVE | `report:pick` เปิด | `Something about this account` → เลือกเหตุผล | `report:user` (`<`+`✕` · q `…บัญชีนี้?`/`…this account?`) → `report:done:{u}` | — | HIGH | |
| TRS-015 | `<` pop ทีละหน้า / `✕` ปิดกอง | MEMBER | STATE | อยู่ `report:post` (มาจาก posts picker) | `<` → `<` → `✕` | `<` ย้อนทีละหน้า (post → pick) slide ออกขวา · `✕` ปิดทั้งกองในครั้งเดียว คง profile ข้างล่าง | — | MED | |
| TRS-016 | user ไม่มีโพสต์ → empty state | MEMBER | EDGE | SETUP-06 มี `U-NP` — ไม่มี → `BLOCK` | profile `U-NP` ⋯ → Report → `A specific post` | แสดง empty copy `ยังไม่มีโพสต์`/`No posts yet` — `Next` ยัง disabled ไปต่อไม่ได้ | — | LOW | |

### 2.3 Report Comment — long-press popover + `report:comment`

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TRS-017 | popover items ตามเจ้าของ | MEMBER | UI | เปิด comment sheet ที่มี `C-RP` + comment ตัวเอง | long-press comment คนอื่น → long-press comment ตัวเอง | คนอื่น: `บล็อก`/`Block` + `รายงาน`/`Report` (danger) · ตัวเอง: `ลบ`/`Delete` เท่านั้น | popover ลอยใกล้แถว + backdrop แตะปิด | HIGH | |
| TRS-018 | Report → `report:comment` X-only | MEMBER | POSITIVE | popover คนอื่นเปิด | `รายงาน` → เลือกเหตุผล | `report:comment` — title `Report` + `✕` **ไม่มี `<`** + q `…ความคิดเห็นนี้?`/`…this comment?` + เหตุผลชุดเดียว → `report:done:{u}` (มี `<` ย้อนได้เหมือน type อื่น) | comments sheet ปิดไปตอนเปิด report | HIGH | |
| TRS-019 | ปิด → toast + comment ยังอยู่ | MEMBER | POSITIVE | report comment ถึง `report:done` | `Done` หรือ `✕` → เปิด comments เดิมอีกครั้ง | toast `ส่งรายงานแล้ว…`/`Report submitted · thanks…` + กลับ surface เดิม — comment ที่ถูก report **ยังแสดง** (report ไม่ลบ) | — | HIGH | |
| TRS-020 | [GATE] guest long-press | GUEST/MEMBER | GATE | comments เปิดได้ (browse) | **รอบ A (GUEST)**: long-press comment คนอื่น → แตะ `Report`/`Block` บน popover · **รอบ B (MEMBER)** | A: popover เปิดได้ แต่แตะ item → Member Sheet `Join TukDaeng` ก่อน act — ไม่มี report/block เกิด; B: flow ทำงานตาม TRS-018/038 | — | HIGH | |

### 2.4 Report From Chat — `chatReportSheet` → `report:user`

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TRS-021 | chmenu → `chatReportSheet` | MEMBER | UI | `chatroom` กับ `U-CHT` → `≡` → `chmenu` | แตะวงกลม `Report` → อ่าน sheet | sheet: avatar + `Are you sure you want to report {u}?` + desc `If this user appears suspicious, please report them. Selecting "Report and delete" will delete this chat and its associated history.` + `Report and delete` (danger) + `Report` + `Cancel` | layout เดียวกับ blkSheet (handle + avatar กลาง) | HIGH | |
| TRS-022 | Cancel/backdrop → อยู่หน้าเดิม | MEMBER | NEGATIVE | `chatReportSheet` เปิด | `Cancel` → ทำซ้ำแตะ backdrop | ปิด sheet อยู่ `chmenu` เดิม — ไม่มี report ไม่ลบอะไร | — | MED | |
| TRS-023 | `Report` → `report:user` ตรง | MEMBER | POSITIVE | `chatReportSheet` เปิด | `Report` → เลือกเหตุผล → `Done` | **ข้าม `report:pick`** — `report:user` ไม่มี `<` → `report:done` ไม่มี `<` → toast + กลับ `chmenu`/`chatroom` เดิม · **thread ไม่หาย** | — | HIGH | |
| TRS-024 | `Report and delete` → teardown | MEMBER | POSITIVE | `chatReportSheet` เปิด (thread `U-CHT` อยู่ใน list) | `Report and delete` → เหตุผล → `Done` | เส้นทางเดียวกัน + หลัง `Done`/`✕`: thread หายจาก chat list ของเรา (remove-from-actor-list) + `chmenu:`/`chatroom:` ถูก strip ออกจาก stack → กลับ Chat List + toast (AC-TS-017) | — | HIGH | |
| TRS-025 | Report and delete → ออกกลาง flow | MEMBER | NEGATIVE | เลือก `Report and delete` แล้ว อยู่ `report:user`/`report:done` | ออกด้วย `✕`/device back | ออกได้ปกติ — mid-flow dismiss **ไม่สร้าง report และไม่ลบ thread** (teardown เกิดเฉพาะตอนปิดหลัง done page) | — | MED | |

### 2.5 `report:done` + Other Steps

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TRS-026 | `report:done` anatomy | MEMBER | UI | เลือกเหตุผลแล้ว | อ่านหน้า | head `Report` + `✕` (+ `<` ยกเว้น fromChat) · green check + `ขอบคุณสำหรับข้อเสนอแนะ`/`Thanks for your feedback` + `เราใช้รายงานเหล่านี้เพื่อแสดงเนื้อหาประเภทนี้น้อยลงในอนาคต`/`We use these reports…` + `ขั้นตอนอื่น ๆ ที่คุณทำได้`/`Other steps you can take` + step rows + `เสร็จสิ้น`/`Done` — **ไม่มี** Restrict/message steps | — | HIGH | |
| TRS-027 | step rows = action จริงเท่านั้น | MEMBER | UI | `report:done` ของ `U-F` (follow อยู่ ไม่ได้ mute/block) | อ่าน rows | `บล็อก {u}`/`Block {u}` + `เลิกติดตาม {u}`/`Unfollow {u}` + `ปิดเสียงเตือน {u}`/`Mute {u}` — คนที่ block อยู่แล้วแถวแรกอ่าน `เลิกบล็อก {u}`/`Unblock {u}`; คนที่ไม่ได้ follow ไม่มี Unfollow row | — | HIGH | |
| TRS-028 | step Unfollow → instant + check | MEMBER | POSITIVE | `report:done` ของ `U-F` | แตะ `Unfollow` → สังเกตแถว | unfollow ทันที + toast `Unfollowed` + แถวกลาย disabled + green check คงแถว (IG pattern — ไม่หายไป) | — | HIGH | |
| TRS-029 | step Mute/Unmute | MEMBER | POSITIVE | `report:done` | `Mute {u}` → dialog `Mute {u}?` → `Mute posts` → แตะ `Unmute` | `Mute` → `muteDlg` (`…unmute them anytime… won't let them know…` + `Mute posts`/`Cancel`) → toast `Muted` + แถว disabled+check · `Unmute` step → instant + toast `Unmuted` + แถวกลับ `Mute` | — | MED | |
| TRS-030 | step Block/Unblock → shared surfaces | MEMBER | POSITIVE | `report:done` 2 รอบ (คนปกติ + คนที่ block อยู่) | step `Block` → อีกรอบ step `Unblock` | `Block` → `blkSheet` (fromChat variant ถ้ามาจาก chat — `Block` เดียวไม่มี `Block and report`) · `Unblock` → `unblockDlg` — สำเร็จ = disabled + green check | — | HIGH | |
| TRS-031 | `Done`/`✕` → toast เดียวกันทุก type | MEMBER | POSITIVE | `report:done` จาก report post/user/comment/chat | กด `Done` → รอบอื่นกด `✕` | toast `ส่งรายงานแล้ว · ขอบคุณที่แจ้งให้เราทราบ`/`Report submitted · thanks for letting us know` — toast เดียวกันทุก report type + ปิดทั้งกอง คงหน้าที่เปิด report ไว้ | — | HIGH | |

### 2.6 Block — `blkSheet` shared surface

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TRS-032 | `blkSheet` anatomy | MEMBER | UI | profile `U-BLK` ⋯ → `Block` | อ่าน sheet | handle + avatar + `Block {u}?` + `This will also block any other profiles they may have or create in the future.` + 3 impact rows (`They won't be able to message you or find your profile or content on TukDaeng.` · `They won't be notified that you blocked or reported them.` · `You can unblock them anytime in Settings.`) + `Block` + `Block and report` — **ไม่มี Cancel row** (dismiss = backdrop เท่านั้น) | — | HIGH | |
| TRS-033 | backdrop dismiss → ไม่ block | MEMBER | NEGATIVE | `blkSheet` เปิด | แตะ backdrop | ปิด sheet — ไม่ block ไม่มีผลใด ๆ (AC-TS-001A) | — | HIGH | |
| TRS-034 | `Block` → apply + toast | MEMBER | POSITIVE | `blkSheet` เปิด | `Block` | sheet ปิด + toast `กำลังบล็อก`/`Blocking` (transient) + effects apply ทันที (รายละเอียด §2.7) — หน้าที่เปิดอยู่ re-render | — | HIGH | |
| TRS-035 | ทุก entry เปิด sheet เดียวกัน | MEMBER | POSITIVE | `U-BLK` unblock อยู่ | เปิด Block จาก: profile ⋯ · comment popover · `chmenu` · `report:done` step | sheet ใบเดียวกันทุก entry — ยกเว้น chat/done-step-from-chat เป็น fromChat variant (ปุ่มเดียว) | — | HIGH | |
| TRS-036 | fromChat variant | MEMBER | UI | `chmenu` ของ `U-CHT` | `Block` → อ่านปุ่ม | `blkSheet` เหลือปุ่ม `Block` เดียว — **ไม่มี** `Block and report` | — | MED | |
| TRS-037 | `Block and report` | MEMBER | POSITIVE | `blkSheet` เปิด (non-chat) | `Block and report` | block เกิดก่อน (effects เหมือน TRS-034) + `report:pick:{u}` เลื่อนขึ้นต่อทันที — ทำ report ต่อได้ | sheet หุบพับใต้หน้า report | MED | |
| TRS-038 | comment popover → Block | MEMBER | POSITIVE | long-press `C-RP` → `Block` | `Block` ใน sheet | comment sheet หุบ → `blkSheet` → block → comment sheet กลับมา + toast `บล็อกและซ่อนความคิดเห็นแล้ว`/`Blocked and hidden comments` — comments ของ `U-CM` ซ่อน (ไม่ลบ) | — | HIGH | |

### 2.7 Block Impact ข้ามทุก Surface (00_GLOBAL §13 + S-13)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TRS-039 | feed — โพสต์หายทันที | MEMBER | POSITIVE | `U-BLK` มีโพสต์ใน feed | block `U-BLK` → กลับ feed เช็กทุก tab | โพสต์ `U-BLK` หายทันทีทุก tab (AC-TS-002/002A) — unblock แล้วกลับมา | — | HIGH | |
| TRS-040 | search — ไม่ขึ้นผล | MEMBER | POSITIVE | `U-BLK` blocked + มีโพสต์ `Sale` ที่เคยเจอ | search keyword เดิม + เช็ก suggestion | โพสต์ `U-BLK` ไม่แสดงใน Search result (AC-TS-003) | — | HIGH | |
| TRS-041 | watch alert — ไม่เข้า matching | MEMBER + U-BLK owner | NEGATIVE | WA `WA-1` ตั้งไว้ + `U-BLK` blocked | ให้ `U-BLK` ลงโพสต์ใหม่ที่ match `WA-1` (ผ่านเครื่อง/บัญชีที่ทีมควบคุม) → ดู alert/match list | โพสต์ `U-BLK` ไม่เข้า Watch Alert result (AC-TS-004) — ควบคุมบัญชี `U-BLK` ไม่ได้ → `BLOCK` ระบุใน Note | — | MED | |
| TRS-042 | follow ตัดทั้งสองทิศ | MEMBER | STATE | MEMBER ↔ `U-BLK` follow กันอยู่ | block `U-BLK` → เช็ก following/followers ทั้งสองฝั่ง | auto-unfollow ทันที + `U-BLK` หลุด followers เรา (removed) — Following feed ไม่ใช้ความสัมพันธ์นี้อีก (AC-TS-005) | — | HIGH | |
| TRS-043 | profile keep-page (S-13) | MEMBER | POSITIVE | `U-BLK` blocked | เปิด `profile:U-BLK` | หน้า**คงอยู่**: head/back/⋯ ปกติ + avatar/bio/link ปกติ — stats `0 posts`/`−`/`−` กดไม่ได้ + grid `No posts yet` + action เดียว `เลิกบล็อก`/`Unblock` — **ไม่ใช่** unavailable page | ⋯ ยังเปิดได้ แถว Block อ่าน `Unblock` | HIGH | |
| TRS-044 | chat — bar + chip + read-only | MEMBER | POSITIVE | มี thread `U-CHT` → block `U-CHT` | เปิด Chat list → เข้าห้องเดิม | แถว list มี chip `Blocked` · ห้อง composer ถูกแทนด้วย bar `You blocked this account` + `You can't message or call them unless you unblock them.` + ปุ่ม `Unblock` — ประวัติแชทอ่านได้ปกติ (block ไม่ลบ thread) | — | HIGH | |
| TRS-045 | เปิดห้องใหม่/ส่งข้อความไม่ได้ | MEMBER | NEGATIVE | `U-CHT` blocked | `Ask` บนโพสต์ `U-CHT` + `แชท`/`Chat` บน profile `U-CHT` + พิมพ์ในห้องเดิม | ทุกทางถูกกัน — `Ask`/`Chat` → toast `ไม่สามารถส่งข้อความถึงบัญชีที่ถูกบล็อก`/`Cannot message a blocked account` ไม่เปิดห้อง · ห้องเดิมไม่มี composer ให้ส่ง | — | HIGH | |
| TRS-046 | comments ซ่อนไม่ลบ | MEMBER | STATE | `C-RP` ของ `U-CM` → block `U-CM` | เปิด comment sheet เดิม → unblock `U-CM` → เปิดอีกครั้ง | หลัง block: comments `U-CM` หายจาก sheet · หลัง unblock: กลับมาแสดง — ซ่อนไม่ลบ | — | MED | |
| TRS-047 | ไม่แจ้งฝั่งถูก block | MEMBER + ACCT-2 | POSITIVE | SETUP-05 มี ACCT-2 — ไม่มี → `BLOCK` | เครื่อง MEMBER block `ACCT-2` → เครื่องสองเช็ก alerts + เปิด profile MEMBER | `ACCT-2` **ไม่ได้ notification ใด ๆ** (`They won't be notified…`) — และเปิดโปรไฟล์ MEMBER ไม่เจอ/เป็น unavailable ตาม 00_NAV §10 | — | MED | |
| TRS-048 | เขา block เรา → unavailable | MEMBER + ACCT-2 | POSITIVE | ACCT-2 block MEMBER ผ่านแอปจริงบนเครื่องสอง | เครื่อง MEMBER เปิด `profile:ACCT-2` (ชื่อเดิม/ค้นหา/deep link) | หน้า `profile:ACCT-2` แสดงสถานะ **ไม่พร้อมใช้งาน** ตาม 00_NAV §10 — **ไม่ใช่** keep-page ที่มี Unblock (ตรงข้ามฝั่งเรา block) — sync block ข้ามเครื่องช้า → `BLOCK` ระบุเวลาที่ลอง | — | HIGH | |
| TRS-049 | notification/deep link → blocked content | MEMBER | NEGATIVE | `U-BLK` blocked + เคยมี notification/ลิงก์ชี้ content `U-BLK` | แตะ notification เก่า/deep link นั้น | ไม่เปิด content ที่ไม่มีสิทธิ์เห็น — `รายการนี้ไม่พร้อมใช้งานแล้ว`/unavailable ตาม 00_NAV §10 — ไม่มี notification/ลิงก์เก่าให้กด → `BLOCK` ระบุ | — | MED | |

### 2.8 Unblock — `unblockDlg` shared surface

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TRS-050 | `unblockDlg` anatomy | MEMBER | UI | `U-BLK` blocked → keep-page `Unblock` | อ่าน dialog | center dialog `เลิกบล็อก {u} หรือไม่?`/`Unblock {u}?` + desc `{u} and other profiles they may have or create will now be able to request to follow and message you on TukDaeng. They won't be notified that you unblocked them.` + `เลิกบล็อก`/`Unblock` (danger) + `ยกเลิก`/`Cancel` | — | HIGH | |
| TRS-051 | ทุก entry เปิด dialog เดียวกัน | MEMBER | POSITIVE | `U-BLK` blocked | เปิด Unblock จาก: keep-page · ⋯ menu (แถวอ่าน `Unblock`) · Settings `บัญชีที่บล็อก` list · `ch-blocked-bar` ในห้อง · `report:done` step | dialog copy เดียวกันทุก entry | — | HIGH | |
| TRS-052 | Cancel → ไม่เปลี่ยน | MEMBER | NEGATIVE | `unblockDlg` เปิด | `Cancel` | ปิด dialog — `U-BLK` ยัง blocked เหมือนเดิม | — | MED | |
| TRS-053 | confirm → `Unblocked` + ไม่ re-follow | MEMBER | POSITIVE | `unblockDlg` เปิด (เคย follow `U-BLK` ก่อน block) | `Unblock` → ดู profile `U-BLK` | toast `Unblocked` + banner restrict-hint `คุณสามารถจำกัดพวกเขาเพื่อซ่อนความคิดเห็นและข้อความโดยไม่ต้องบล็อกทั้งหมด`/`You can restrict them…` ~6 วิ หายเอง (แตะ = dismiss) — **ไม่** re-follow (ปุ่มกลับ `ติดตาม`/`Follow`) + ฝั่งถูก unblock ไม่ถูกแจ้ง | — | HIGH | |
| TRS-054 | ผลหลัง unblock กลับปกติ | MEMBER | STATE | unblock `U-BLK` แล้ว | เช็ก feed / ห้อง `U-CHT` / comments / profile | โพสต์กลับ feed · chip `Blocked` หาย + composer กลับ · comments ที่ซ่อนกลับมา · profile เต็ม — visibility ตาม normal permission | — | MED | |

### 2.9 Guest Gate + Edge + Moderation Handoff

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TRS-055 | [GATE] report/block entries ทุกจุด | GUEST/MEMBER | GATE | guest browse ได้ | **รอบ A (GUEST)**: กดทีละจุด post ⋯ · profile ⋯ · uncomf `Report` · comment popover item · chmenu Report/Block · **รอบ B (MEMBER)** | A: ทุกจุด → Member Sheet `Join TukDaeng` ก่อน handler — ไม่มี report/block เกิด (post ⋯/profile ⋯ gate ที่ปุ่มเมนูเลย; chmenu เข้าไม่ได้เพราะ chat nav gated) · B: entries ทำงานปกติ — gate matrix เต็มทั้งแอป → FO-TEST-17 | — | HIGH | |
| TRS-056 | own post ⋯ ไม่มี Report | MEMBER | NEGATIVE | โพสต์ตัวเอง | เปิด ⋯ บนโพสต์ตัวเอง | เมนูตัวเอง = Archive / Comments on-off / Edit / Mark as sold / Pin / Delete — **ไม่มี** `รายงาน`/`Report` | — | MED | |
| TRS-057 | ไม่มี path report ตัวเอง | MEMBER | NEGATIVE | sign in | หาทาง report ตัวเอง: own profile menu · own comment popover · own post ⋯ | ไม่มี Report entry ชี้ตัวเองเลย (own profile menu = Settings; own comment popover = Delete เท่านั้น) | — | LOW | |
| TRS-058 | report ซ้ำ target เดิม | MEMBER | EDGE | report `P-RP` ไปแล้ว | เปิด flow อีกครั้ง → เลือกเหตุผล → done | ทำซ้ำได้ปกติ — ไม่มี "already reported" guard/สถานะเคยรายงาน | — | LOW | |
| TRS-059 | Report Board Content (contract-only) | MEMBER | NEGATIVE | เปิด board article ใด ๆ | หา report entry บนบทความ/⋯ article | V1 = **ไม่มี live entry** (contract-only — spec 12 §13/§19 D4) — build ที่มี dead-path toast `Report submitted. Thank you for notifying us.` = **FAIL** (copy ผิด contract; live toast ต้อง `Report submitted · thanks for letting us know`) | — | LOW | |
| TRS-060 | ไม่มี FO notification/report status | MEMBER | NEGATIVE | report สำเร็จแล้ว | เปิด Alerts + หา surface สถานะ report ของเรา | report ไม่สร้าง alerts item + ไม่มี "สถานะรายงาน" ฝั่ง FO ใน V1 (report = anonymous + no tracking) | — | MED | |
| TRS-061 | BO handoff (contract) | MEMBER | NEGATIVE | report สำเร็จแล้ว | ตรวจจากฝั่ง FO ว่ามีอะไรบ่ง handoff | FO มีแค่ `report:done` + toast — review/24h SLA/audit trail อยู่ Back Office ทั้งหมด — ตรวจจาก FO ไม่ได้ → `BLOCK` ระบุ (ต้องเข้า BO) | — | MED | |

### 2.10 Persist / ภาษา / ธีม

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TRS-062 | block persist ข้าม kill | MEMBER | STATE | `U-BLK` blocked | kill app เด็ดขาด → เปิดใหม่ → เช็ก feed/ห้อง/profile/Settings list | block ยังครบทุก surface + `U-BLK` อยู่ใน Settings `บัญชีที่บล็อก` — server-backed (lock รวม 2026-10-29) | — | HIGH | |
| TRS-063 | block persist ข้าม sign-out + เครื่อง B | MEMBER + ACCT-2 | STATE | `U-BLK` blocked + SETUP-05 — ไม่มี → `BLOCK` เฉพาะขาเครื่อง B | sign out → sign in ใหม่ → เช็ก · sign in MEMBER บนเครื่องสอง → เช็ก | state ติดบัญชี — รอด sign-out + ตามไปเครื่อง B (server persist) | — | HIGH | |
| TRS-064 | TH/EN sweep | MEMBER | STATE | ผ่านหน้า report/block แล้ว | สลับภาษา TH↔EN ค้างอยู่หน้า report/keep-page → เปิด sheets อีกครั้ง | ทุกข้อความ + เหตุผล + toasts เปลี่ยนตามภาษา — prototype เพิ่ม TH ครบแล้ว (§3) · build ที่ค้าง EN บน surfaces เหล่านี้ = FAIL | — | MED | |
| TRS-065 | dark readable | MEMBER | UI | ผ่านทุก report page/sheet/dialog แล้ว | สลับ dark → เปิด report stack + blkSheet + unblockDlg + chatReportSheet + blocked profile | อ่านครบ contrast โอเคทุก surface | — | LOW | |
| TRS-066 | ฝั่งถูก report ไม่ได้รับการแจ้งเตือน (Anonymous Reporting) | MEMBER + ACCT-2 | NEGATIVE | MEMBER ส่ง Report โพสต์หรือผู้ใช้ของ ACCT-2 | 1. MEMBER ทำตามขั้นตอน Report จนถึง done 2. ตรวจสอบเครื่อง ACCT-2 ในหน้า Alerts, Push และ Chat | ACCT-2 ไม่ได้รับ Push Notification หรือ Alerts แจ้งเตือนใดๆ ทั้งสิ้นในขณะที่ถูกรายงาน และไม่มีตัวบ่งชี้ใดๆ ให้ทราบตัวตนผู้รายงาน (GAP-12 / DEC-06) | — | HIGH | |
| TRS-067 | ผล moderation (remove/hide) จาก BO สะท้อนกลับ FO ทันที | MEMBER | STATE | ลิสติ้งถูก Admin ใน BO มีคำสั่ง Hide หรือ Remove | 1. ตรวจสอบหน้า Feed และผลการค้นหา 2. เปิดดูผ่าน direct link / deep link | ลิสติ้งนั้นหายไปจาก Feed และ Search ทันที และเมื่อเปิดผ่าน direct link จะแสดงหน้าจอ fallback `al_unavail` ("รายการนี้ไม่พร้อมใช้งานแล้ว") พร้อมปุ่มกลับหน้าหลัก (GAP-13 / DEC-07) | — | HIGH | |

## §3 จุดเฝ้าระวัง spec ↔ prototype ↔ เคส

| จุด | สถานะ | เคสที่เกี่ยว |
| --- | --- | --- |
| **`pfRestrictHint`** — เคย flag dead-call ใน spec 07/15 ทั้งที่ build wire แล้ว → resolved: spec 15 §3/§5/§9/§20 D6 + spec 07 (§3/§flow/deviation/AC/notes) sync เป็น wired + I18N_TH แล้ว | resolved 2026-10-29 | TRS-053 |
| **EN hardcode บน shared surfaces — resolved** — เติม isTh + TH copy ใน prototype ครบ: `blkSheet` + `chatReportSheet` + `ch-blocked-bar` + `ch-blk-badge` (`บล็อกแล้ว`) + `pf-more` rows + uncomf ack card + `chmenu` labels — expected = `ตามภาษาแอป` | resolved 2026-10-29 | TRS-032/021/044/064 |
| **task-breakdown §16** — ชื่อ output + TC ID sync แล้ว (`FO-TEST-001-16-report-block.md` + `TRS-nnn`) | resolved 2026-10-29 | — |
| **`report:posts` empty + `report:done` back — resolved** — picker แสดง `ยังไม่มีโพสต์`/`No posts yet` เมื่อไม่มีโพสต์ (D7 resolved) · `report:done` มี `<` ทุก type ยกเว้น fromChat (D10 resolved) · grid ยังใช้ `pfTabPosts(u,"all")` (quirk 06) | resolved 2026-10-29 | TRS-016/018/026 |
| **Report state ไม่ persist (D8)** — `rpFromChat`/`rpDelChat`/`rpTargetType`/`_rpDone`/`_rpSel` เป็น memory state — reload หาย — production = report records จริง | mock simplification | TRS-007/025 |
| **Board report = contract-only** — `data-bdmore` dead wiring · copy `Report submitted. Thank you for notifying us.` ≠ live toast — unify เมื่อ entry implement (12 §13/§19 D4) | contract-only V1 | TRS-059 |
| **BO handoff เทสจาก FO ไม่ได้** — 24h SLA / review queue / audit trail = contract ฝั่ง BO — เคสรับได้แค่ "FO ไม่มีผลข้างเคียงผิด" | BLOCK ล่วงหน้า | TRS-061 |
| **เขา block เรา ต้องเครื่องสอง** — unavailable page ฝั่งถูก block sync ผ่าน server เท่านั้น (prototype จำลองไม่ได้) — ไม่มี ACCT-2 → BLOCK | BLOCK ล่วงหน้า | TRS-047/048 |
| **WA matching exclusion** — trigger match จริงต้องมีโพสต์ใหม่จากอีกบัญชี — ไม่มีช่องทาง → BLOCK | BLOCK ล่วงหน้า | TRS-041 |
| **deep link → blocked content** — contract 00_NAV §10 แต่ไม่มีช่องทางสร้าง deep link เก่าบนเครื่อง → BLOCK ถ้าไม่มี notification ค้าง | BLOCK ล่วงหน้า | TRS-049 |

## §4 Traceability — inventory + actions ครอบ

| Inventory หน้า/route (§2.10) | Action ใน inventory | TC ที่ครอบ | หมายเหตุ |
| --- | --- | --- | --- |
| `report` | reason list (post) + anonymous note | TRS-001..010 | entry pm menu + uncomf card |
| `report:user` | reason list (account) — fromChat ไม่มี `<` | TRS-014, 023..025 | |
| `report:comment` | reason list (comment) | TRS-017..020 | |
| `report:pick:{u}` | picker post/account | TRS-011, 037 | |
| `report:posts:{u}` | grid + Next disabled | TRS-012, 013, 016 | |
| `report:done:{u}` | thanks + steps + Done→close stack | TRS-026..031 | |
| comment popover `c-popover` | Block + Report / Delete | TRS-017, 020, 038 | |
| sheet `blk` + dialog `unblock` | Block/Unblock — keep-page · comments ซ่อน | TRS-032..038, 050..054 | |
| sheet `chatReport` | Report and delete / Report / Cancel → `report:user` | TRS-021..025 | |
| state `blocked` (chat) | blocked bar + chip + send disabled | TRS-044, 045 | |
| `pf-more` viewer ⋯ | Report/Block/Unblock/About/Copy/Share | TRS-011, 035, 051 | entries — anatomy → FO-TEST-12 |
| `blocked` settings list | row + unblock dialog | TRS-051, 062 | list anatomy → FO-TEST-15 |
| board `data-bdmore`/report | dead entry — contract-only | TRS-059 | |
| guest gate (report/block subset) | Member Sheet ก่อน handler | TRS-001, 020, 055 | matrix เต็ม → FO-TEST-17 |
| block impact | feed/search/WA/follow/comments/keep-page/unavailable | TRS-039..049 | 00_GLOBAL §13 + S-13 |
| persist/ภาษา/dark | kill · sign-out · เครื่อง B · TH/EN · dark | TRS-062..065 | |

## หมายเหตุท้าย

- **ก่อนส่งงานจริง**: เขียนเสร็จ → รอ PO/หัวหน้ารีวิว → แก้ตาม feedback → ค่อยปิด task (กฎเดียวกับทุกเล่ม)
- **sync แล้วรอบนี้ (2026-10-29)**: (1) prototype `index.html` — เติม isTh + TH copy ครบบน `blkSheet`/`chatReportSheet`/`ch-blocked-bar`/`ch-blk-badge`/`pf-more`/uncomf card/`chmenu` labels + `report:done` เพิ่ม `<` ครบทุก type (ยกเว้น fromChat) + `report:posts` เพิ่ม empty copy `ยังไม่มีโพสต์`/`No posts yet` (2) spec `15_TRUST_SAFETY_MODULE.md` — D6/D7/D10 resolved + §6 table/§12 rule/§10 flow/§17/§5/§3/§9/AC-TS-008 sync (3) spec `07_CHAT_MODULE.md` — pfRestrictHint flags → wired (4) task-breakdown §16 — filename + TC ID ตรงไฟล์จริง
- **เคส BLOCK ล่วงหน้า**: TRS-016 (ไม่มี `U-NP`) · TRS-041 (ไม่มีวิธี trigger WA match) · TRS-047, 048, 063 (ไม่มีเครื่องสอง/ACCT-2) · TRS-049 (ไม่มี notification/deep link ค้าง) · TRS-061 (ต้องเข้า BO)
- **ครอบโดยเล่มอื่น ไม่ทำซ้ำ**: feed/viewer/detail internals → FO-TEST-03/06 · comment sheet mechanics → FO-TEST-07/11 · chat room internals → FO-TEST-08 · profile anatomy + keep-page surface detail → FO-TEST-12 · Settings blocked/muted list anatomy → FO-TEST-15 · Member Sheet internals + gate matrix เต็ม → FO-TEST-17 · E2E moderation loop → FO-TEST-18
- **จุดต่างโดยเจตนาจากเล่มเก่า**: เล่ม 12 เช็ก keep-page จากฝั่ง profile (PROF-070..075) — เล่มนี้เช็กจากฝั่ง Trust & Safety contract (block impact ข้าม surface + shared surface ทุก entry) — overlap เจตนา ไม่ใช่ซ้ำ

- สถิติ: **67 TC** — High 43 / Medium 19 / Low 5 (SETUP rows 8 แถวแยกใน checklist; รวมใน csv 75 แถว)
