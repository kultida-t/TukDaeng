# FO-TEST-001-12 — Test Cases: Profile own + public (แอปมือถือจริง)

**Task**: FO-TEST-12 ของชุด FO-TEST-001 — เขียนเป็นเวอร์ชันเทสแอปมือถือจริงตั้งแต่แรก (ไม่มีรอบ prototype แยก เพราะ spec ล็อกแล้ว)
**SoT**: แอป TukDaeng build ทดสอบบนมือถือจริง — expected ล็อกตาม `FrontOffice/06_PROFILE_MODULE.md` (FO-PRD-v1.9) + chat contract `07_CHAT_MODULE.md` (DM ห้องเดียวต่อ account — FO-TEST-12 lock) + nav/shell `00_NAVIGATION_AND_CROSS_MODULE_FLOW.md` §6/§9/§10 (SHELL-034: viewer profile = deep page ไม่มี bottom nav) + block/report canonical `06`/`07` (FSP-019) + `02_FEED_MODULE.md` (post eligibility) — `Prototypes/fo-flow` = แค่ reference ว่าหน้าตาควรเป็นแบบไหน
**Scope**: own profile `profile:{me}` + public profile `profile:{user}` + sub-pages (`pfollow`, `pedit`, `about`, QR overlay, avatar overlay) + follow/fav/mute/block mechanics + DM from profile + persistence + guest gate + real-app behaviors
**ยกเว้น**: portfolio/`pfasset`/`soldhist`/`sell` internals — ของ FO-TEST-13 (เล่มนี้เช็กเฉพาะ entry `pf-pfo` → `portfolio`) · Chat Center/room internals (bubbles/media/mute room/etc.) — ของ FO-TEST-08 (เล่มนี้เช็กเฉพาะ contract ห้อง DM + การ์ดลิสติ้งจาก Ask) · create-asset flow จากปุ่ม `+` — ของ FO-TEST-05 · Post Viewer/Detail internals — ของ FO-TEST-06 · report reason internals — ของ FO-TEST-16 · Settings pages (Favorites/Muted/Blocked lists anatomy) — ของ FO-TEST-15 (เล่มนี้เช็กเฉพาะผลสะท้อนจาก profile actions) · Member Sheet internals — ของ FO-TEST-17
**การตัดสินล็อก 2026-10-29** (ถามผู้ใช้ก่อนเขียน — spec+prototype แก้ให้ตรงแล้ว): (1) Chat จาก profile/follower row = DM จริงแบบ IG — ห้องเดียวต่อ account ตลอดไป (กฎเดิม "ห้องผูก user+listing" ยกเลิก) (2) กด `Ask` บนลิสติ้ง → เข้าห้องเดิมของ seller + การ์ดลิสติ้งแนบเป็น**ข้อความ** 1 ครั้งต่อลิสติ้ง (reply-story style — ไม่ pin การ์ดค้างบนห้อง) (3) คนที่**ถูก block** เปิดโปรไฟล์คนที่ block ตน → เห็นหน้า "ไม่พร้อมใช้งาน" (unavailable page — 00_NAV §10); ฝั่ง "เรา block เขา" ยัง keep-page ตาม S-13 (4) viewer/public profile **ไม่มี bottom nav** — เฉพาะ own profile ที่มี nav + Profile active (5) ตัด dead controls ออก (`pf-note`/`pf-sleep`/`pf-addchip`/`pf-avadd`/`pf-addp`/username toast/overlay `qr` act); `pf-msg` (DM) + `pe-pic` (photo picker) กลายเป็น real (6) follow/unfollow, favorites, mute, block/unblock, remove follower, pin, profile edits = **server-backed — อยู่รอดปิดแอป + sign-out/in + sync ข้ามเครื่อง** (prototype mirror ด้วย `fo_pfstate`; แอปจริงต้องเป็นฝั่ง server)
**หมายเหตุ**: เขียนเสร็จรอรีวิว — อย่าเพิ่งปิดงาน

---

## §0 วิธีใช้ + สภาพแวดล้อม + กติกาที่ล็อก

- **ทดสอบบนเครื่องจริงเท่านั้น** — ติดตั้งแอป build ทดสอบลงมือถือจริง แตะ/ปัด/พิมพ์/เลื่อนบนหน้าจอจริง — **ไม่ใช้ browser, dev console, ปุ่ม dev/demo, localStorage, OTP จำลอง** — เตรียมสถานะด้วย action จริงในแอป + ข้อมูลจริงบน server เท่านั้น
- **Actors**: `GUEST` = ไม่ sign in · `MEMBER` = บัญชีทดสอบจริงบนเครื่องหลัก · `NEW` = สมัครใหม่ (profile ว่าง/ไม่มี followers) · `ACCT-2` = **บัญชีจริงที่สอง บนเครื่องจริงอีกเครื่อง** — ใช้เป็น public profile เป้าหมาย + follow/block ข้ามทิศ · `ACCT-3` = บัญชีเสริมสำหรับเคส mutual/followed-by — เคสที่ต้องบัญชีอื่นแต่ไม่มี → mark `BLOCK` ระบุใน Note
- **Server sync เป็นตัวแปรใหญ่ของเล่มนี้** — contract บังคับให้ทุก profile state อยู่ฝั่ง server; build ที่ state ไม่ persist/ไม่ sync ข้ามเครื่อง → เคส §2.9 ที่เกี่ยว = `BLOCK`/`FAIL` ตามอาการ (persist ไม่รอด = FAIL contract, ไม่ใช่ทางเลือก)
- **Type**: `POSITIVE` · `NEGATIVE` · `EDGE` · `STATE` · `GATE` (บังคับ sign in) · `GATE-inverse` (ยืนยันเปิดเสรี)
- **[GATE] ทุกเคสเทส 2 รอบ**: รอบ A `GUEST` → expect Member Sheet; รอบ B `MEMBER` → expect feature ทำงาน
- **Device back เทียบเท่าปุ่มย้อนในแอป/ปิดทีละชั้น** — sheet/dialog/overlay เปิดอยู่ต้องปิดชั้นบนสุดก่อน เคสที่มีขั้น "แตะ back/ปิด" ใช้ device back ของ OS แทนได้ ผลต้องเทียบเท่ากัน
- **ภาษาตามแอปทั้งหมด** (ล็อก 2026-10-28): ทุกข้อความ UI + toast ของ profile เปลี่ยนตามภาษาที่เลือก — เจอ string ค้างอีกภาษา = **FAIL** (prototype hardcode หลาย toast เป็น EN ซึ่งในแอปจริงถือเป็นบั๊ก); ยกเว้นชื่อ user/แบรนด์/รุ่นและค่าเนื้อ content
- **Dark theme**: ทุกหน้า/sheet/dialog/overlay อ่านได้ครบใน dark — contrast โอเค ไม่มีตัวอักษรจมพื้นหลัง
- **Priority**: `HIGH` = กติกาหลัก/flow สำคัญ · `MED` = feature หลัก/edge · `LOW` = quirk; เคส BLOCK-if = MED เว้นกำหนด
- **ตัวเลข stats/followers ขึ้นข้อมูลจริงบน server** — expected เขียนให้ตัดสินได้จากจำนวนจริง อย่า FAIL เพราะเลขไม่ตรงตัวอย่าง
- **Result column**: เว้นว่าง — tester กรอก `PASS`/`FAIL`/`BLOCK` + ปัญหาใน `Note`
- **ไม่มีเคสแบบ "จดผล" ไม่มีผลลัพธ์ทางเลือก** — ทุกเคส expected ตรง spec/contract ข้อเดียวเด็ดขาด ไม่ตรง = FAIL
- **Out of scope**: ตามหัวข้อ ยกเว้น ด้านบน — เคสใดเจอว่า feature ยังไม่ implement ใน build → `BLOCK` พร้อมเหตุผลใน Note (ห้าม workaround)

## §1 Coverage map

| Route / Surface (inventory §2.x + spec 06/07) | ขอบเขต | TC ที่ครอบ |
| --- | --- | --- |
| `profile:{me}` own profile | nav entry · head (+/uname/menu) · avatar/stats/bio · Edit/Share/Portfolio · gate | PROF-001..012 |
| own tabs All/Sale/Show/Hide/Sold + grid | tab switch/scroll-keep · per-tab filter · empty · tile→PV · pin order | PROF-013..023 |
| `profile:{user}` public profile | entries · anatomy · no bottom nav · Follow/Chat/⋯ gate · tabs 3 · guest view | PROF-024..039 |
| Follow mechanics + `pfollow` | follow/unfollow/fav/mute · lists/search/Remove · nested profile · feed effect | PROF-040..054 |
| DM contract (spec 07 lock) | one room per account · Ask card message · Items view · blocked guard | PROF-055..062 |
| ⋯ menu / block / report / about | sheet rows · copy URL · share · about page · block/unblock · they-block-you | PROF-063..075 |
| `pf-qr` QR overlay + `pf-avov` | QR card/payload/themes/copy/download/share/scan · avatar overlay acts | PROF-076..083 |
| `pedit` edit profile | fields/validation/save/rename/avatar picker | PROF-084..099 |
| Persistence/lang/theme/device | kill/sign-out/cross-device · TH · dark · back stack · offline · edge | PROF-100..110 |

## §2 Test cases

ผู้ทดสอบ: อ่าน expected ก่อนรันเสมอ — เคสที่เขียน "BLOCK ถ้า..." ให้ mark BLOCK พร้อมเหตุผลใน Note (ห้าม workaround)

### Setup

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SETUP-01 | ติดตั้งแอป | — | SETUP | เครื่องจริงเครื่องหลัก | ติดตั้ง build ทดสอบที่ทีมส่งให้ → เปิดแอป | เปิดขึ้น feed หรือ onboarding | splash/หน้าแรกขึ้นตาม build | — | |
| SETUP-02 | สถานะเริ่มต้น | — | SETUP | แอปติดตั้งแล้ว | ลบข้อมูลแอป/ติดตั้งใหม่ ถ้าเคยใช้เครื่องนี้มาก่อน | แอปสะอาด เหมือนผู้ใช้ใหม่ | — | — | |
| SETUP-03 | ผู้ใช้ GUEST | — | SETUP | แอปสะอาด | ไม่ sign in → เดินเข้า feed ได้เลย | guest mode | bottom nav ครบ | — | |
| SETUP-04 | ผู้ใช้ MEMBER | — | SETUP | แอปสะอาด | sign in ด้วยบัญชีทดสอบที่ทีมสร้าง | เข้า feed เป็นสมาชิก | avatar/ชื่อตัวเองในที่ที่ต้องแสดง | — | |
| SETUP-05 | ผู้ใช้ NEW | — | SETUP | แอปสะอาด | สมัครใหม่ด้วยอีเมล/เบอร์ทดสอบจริง → ผ่าน onboarding จนเข้า feed | member ใหม่ — profile/followers ว่างเสมอ | — | — | |
| SETUP-06 | ข้อมูลอ้างอิง | MEMBER | SETUP | sign in แล้ว | จดลง Note ของไฟล์: `U-ME` = username ตัวเอง · `U-2` = username ของ ACCT-2 (ต้องมี ≥1 ลิสติ้ง Sale + ≥1 โพสต์ Show — ถ้าไม่มีให้ ACCT-2 สร้างผ่านแอปจริง) · `U-3` = username ของ ACCT-3 (ถ้ามี) · `POST-2A`/`POST-2B` = ลิสติ้ง 2 ชิ้นของ ACCT-2 · จด "รุ่นเครื่อง + OS" ทุกเครื่อง | ข้อมูลจดพร้อม — ขาดตัวใด mark BLOCK เคสที่เกี่ยว | — | — | |
| SETUP-07 | ทางเข้า + ปุ่ม | MEMBER | SETUP | sign in แล้ว | ทดลอง: nav `โปรไฟล์` → own profile · กลับ feed → แตะ avatar seller ของ `POST-2A` → public profile · บน own profile: แตะ followers/following → `pfollow` · `แก้ไขโปรไฟล์` → pedit · `แชร์โปรไฟล์` → QR · wallet → portfolio · บน public profile: ⋯ → sheet | ทุก entry เปิดหน้า/overlay ถูก | ตำแหน่งตาม spec §6 | — | |
| SETUP-08 | Member Sheet mechanics | GUEST | SETUP | เป็น guest บน public profile ของ `U-2` | แตะ `ติดตาม/Follow` | Member Sheet `Join TukDaeng` เด้ง — follow ไม่เกิด | bottom sheet จากขอบล่างเหมือนทุกหน้า | — | |
| SETUP-09 | เครื่องที่สอง + ACCT-2 | — | SETUP | มีเครื่องจริงอีกเครื่อง | ติดตั้ง build เดียวกันลงเครื่องสอง → sign in `ACCT-2` → เปิด camera + notification permission ทั้งสองเครื่อง | บัญชีสองพร้อม — ถ้าไม่มี → เคส ACCT-2/cross-device เป็น BLOCK | — | — | |
| SETUP-10 | baseline follow ข้ามทิศ | MEMBER + ACCT-2 | SETUP | SETUP-09 เสร็จ | ACCT-2 เปิด profile `U-ME` → กด Follow · MEMBER เปิด profile `U-2` → กด Follow | ACCT-2 อยู่ใน followers ของ MEMBER; MEMBER อยู่ใน followers ของ ACCT-2 — follow ไม่ persist บน server → mark BLOCK เคส §2.4/§2.9 ที่เกี่ยว | count +1 ทั้งสองฝั่ง | — | |

### 2.1 Own Profile — Entry & Header

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PROF-001 | [GATE] nav tab `โปรไฟล์/Profile` | GUEST/MEMBER | GATE | SETUP-03/04 | **รอบ A (GUEST)**: แตะแท็บ Profile บน bottom nav → ปิด sheet · **รอบ B (MEMBER)**: แตะแท็บเดิม | A: Member Sheet `Join TukDaeng` เด้ง own profile ไม่เปิด; B: own profile `profile:{U-ME}` เปิด | B: แท็บ Profile active บน bottom nav | HIGH | |
| PROF-002 | own page anatomy | MEMBER | UI | own profile เปิด | อ่านหน้าบน-ล่าง | head: `+` (ซ้าย) + username (กลาง) + burger (ขวา) · avatar + stats 3 ช่อง + bio + ปุ่ม `แก้ไขโปรไฟล์`/`แชร์โปรไฟล์`/wallet + tabs 5 + grid + bottom nav (Profile active) | layout ครบทุกส่วน | HIGH | |
| PROF-003 | ปุ่ม `+` → create asset | MEMBER | POSITIVE | own profile | แตะ `+` มุมซ้ายบน | เข้า flow สร้างสินทรัพย์ (create asset — internals ของ FO-TEST-05) — ปิดย้อนกลับมายัง profile | title `เพิ่มสินทรัพย์ใหม่/Add asset` | MED | |
| PROF-004 | username บน head = label เฉย ๆ | MEMBER | NEGATIVE | own profile | แตะ username ตรงกลาง head หลายครั้ง | **ไม่มี** sheet/menu/toast/account-switcher ใด ๆ — เป็น label inert (V1 ไม่มี multi-account) | — | LOW | |
| PROF-005 | burger → Settings | MEMBER | POSITIVE | own profile | แตะ burger ขวาบน → หน้า settings/activity เปิด → back | push หน้า settings; back กลับ profile เดิม state เดิม | title `การตั้งค่าและกิจกรรม/Settings and activity` ที่ปุ่ม | HIGH | |
| PROF-006 | stats = ตัวเลขจริง | MEMBER | POSITIVE | own profile มีโพสต์/followers | เทียบเลข posts/followers/following กับจำนวนจริง (นับ grid All + list) | `posts` = จำนวนโพสต์ตัวเองทั้งหมดในแท็บ All · `ผู้ติดตาม/followers` + `กำลังติดตาม/following` = จำนวนจริงบน server | ตัวหนาเลข + label ใต้ | HIGH | |
| PROF-007 | own avatar → avatar overlay | MEMBER | POSITIVE | own profile | แตะ avatar → อ่าน overlay → แตะพื้นที่ว่างปิด | overlay เปิดพร้อมรูปใหญ่ + actions `Share` + `Copy link` เท่านั้น — **ไม่มี** Follow/QR บน own overlay | — | MED | |
| PROF-008 | bio block ครบ | MEMBER | UI | MEMBER ตั้ง bio+link ไว้ (ถ้ายังไม่มี ให้ pedit ตั้งก่อน) | อ่านส่วน bio บน own profile | แสดง category chip (ถ้ามี) + bio text + link chip — link `@handle` แสดงไอคอน `@` + handle; link URL แสดงไอคอนลิงก์ + text | — | MED | |
| PROF-009 | story ring บน avatar | MEMBER | EDGE | บัญชีมี active story (เตรียมผ่าน flow story จริง — ไม่มี flow → `BLOCK`) | เปิด own profile ดู avatar | avatar มี ring รอบรูปเมื่อมี story active; ไม่มี story → ไม่มี ring | ring เห็นชัดทั้ง light/dark | LOW | |
| PROF-010 | `แก้ไขโปรไฟล์` → pedit | MEMBER | POSITIVE | own profile | แตะ `แก้ไขโปรไฟล์/Edit profile` | push หน้า `pedit` (ฟอร์มเต็ม §2.8) | head `แก้ไขโปรไฟล์/Edit profile` + back | HIGH | |
| PROF-011 | `แชร์โปรไฟล์` → QR overlay | MEMBER | POSITIVE | own profile | แตะ `แชร์โปรไฟล์/Share profile` | overlay QR เต็มจอเปิด (อะนาตอมี §2.7) — ปิดด้วย X ได้ | การ์ด `@USERNAME` ตัวเอง | HIGH | |
| PROF-012 | wallet → portfolio | MEMBER | POSITIVE | own profile | แตะปุ่ม wallet (ขวาสุดแถว actions) | push หน้า `portfolio` — ไม่มีสินทรัพย์ → empty state ตาม spec portfolio (internals FO-TEST-13) | title `พอร์ตโฟลิโอ/Portfolio` ที่ปุ่ม | MED | |

### 2.2 Own Tabs & Grid

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PROF-013 | own tabs 5 แท็บ | MEMBER | UI | own profile | อ่านแถบ tab | แท็บ: `ทั้งหมด/All` + `ขาย/Sale` + `โชว์/Show` + `ซ่อน/Hide` + `ขายแล้ว/Sold` — แต่ละแท็บ icon+label — `Hide`/`Sold` มีเฉพาะ owner | — | HIGH | |
| PROF-014 | tab switch + keep scroll | MEMBER | STATE | grid All ยาวพอ scroll | scroll ลง → แตะ Sale → แตะกลับ All | แท็บสลับเฉพาะ grid (หน้าไม่ slide) + ตำแหน่ง scroll ของ All คงเดิมเมื่อสลับกลับ | แท็บ active ขีด/ไฮไลต์ถูก | MED | |
| PROF-015 | แต่ละแท็บกรองถูกชนิด | MEMBER | POSITIVE | MEMBER มีโพสต์หลายชนิด (สร้างผ่าน create flow จริง — ไม่มี → `BLOCK`) | ไล่แตะ Sale/Show/Hide/Sold เทียบ grid กับสถานะจริงของโพสต์ | Sale=เฉพาะลิสติ้งขาย · Show=เฉพาะโชว์ · Hide=เฉพาะที่ซ่อน · Sold=เฉพาะขายแล้ว · All=รวมทุกชนิดที่ owner เห็น | — | HIGH | |
| PROF-016 | empty tab → empty state | NEW | POSITIVE | account ใหม่ไม่มีโพสต์ | เปิด own profile → ไล่แตะทุกแท็บ | แท็บ All: `เพิ่มสินทรัพย์ชิ้นแรกของคุณ/Add your first asset` + desc + ปุ่ม `เพิ่มสินทรัพย์ใหม่/Add asset`; แท็บอื่น: `ยังไม่มีโพสต์ในแท็บ{ชื่อแท็บ}`/`No {tab} posts` — ไม่ใช่ `ไม่พบข้อมูล` | icon กล้องตรงกลาง | HIGH | |
| PROF-017 | tile → Post Viewer (profile scope) | MEMBER | POSITIVE | own grid มี tile | แตะ tile กลาง ๆ | Post Viewer เปิดโหมด profile (`Posts`) ที่ตำแหน่ง tile นั้น — ปัดซ้าย/ขวาไหลเฉพาะโพสต์ในแท็บเดียวกัน | header viewer `Posts` + username ตัวเอง | HIGH | |
| PROF-018 | multi-photo indicator | MEMBER | UI | MEMBER มีโพสต์หลายรูป (ไม่มี → `BLOCK`) | ดู tile ของโพสต์หลายรูปบน grid | tile มีตัวบ่งชี้หลายรูป (icon/stack badge) ต่างจาก tile รูปเดียว | — | MED | |
| PROF-019 | pin post → tile อยู่บนสุด | MEMBER | POSITIVE | pin โพสต์ผ่าน post menu (canonical PV/feed) | pin โพสต์ 1 + โพสต์ 2 แล้วเปิด own profile grid | โพสต์ที่ pin ขึ้นก่อนโพสต์ธรรมดาใน grid (เรียง pin ก่อน non-pin) + มี pin marker บน tile — ยกเลิก pin → กลับอันดับเวลา | pin icon เห็นบน tile | HIGH | |
| PROF-020 | pin persist ข้าม reopen profile | MEMBER | STATE | pin แล้ว (PROF-019) | ออกจาก profile ไปหน้าอื่น → กลับเข้า → kill app → เปิดใหม่ | ลำดับ pin ยังเหมือนเดิมทุกครั้ง (server-backed) | — | MED | |
| PROF-021 | back จาก PV → tab+scroll เดิม | MEMBER | STATE | อยู่แท็บ Sale scroll ลง → เปิด tile | เปิด tile → กด back ของ viewer | กลับ profile แท็บ Sale เดิม ตำแหน่ง scroll เดิม — ไม่เด้งกลับ All/บนสุด | — | MED | |
| PROF-022 | ลบ/ย้ายโพสต์ → grid sync | MEMBER | STATE | own profile เปิดอยู่ | อีกเครื่อง/อีก flow: archive หรือลบโพสต์ตัวเอง 1 ชิ้น → กลับมา own profile (re-open) | tile โพสต์นั้นหายจาก grid + `posts` count ลดตามจริง — ไม่มี tile ผีกดไม่ได้ | — | MED | |
| PROF-023 | grid tile แตะรัวไม่พัง | MEMBER | EDGE | own grid | แตะ tile เดิมซ้ำรัว ๆ ระหว่าง viewer กำลังเปิด | viewer เปิดครั้งเดียว ไม่ซ้อนหลาย instance; back กลับปกติ | — | LOW | |

### 2.3 Public Profile

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PROF-024 | entries → `profile:{U-2}` | MEMBER | POSITIVE | `POST-2A` อยู่ feed | เปิด profile `U-2` จากทีละจุด: (a) avatar/username บน feed card (b) ชื่อผู้ขายบน Post Detail (c) ชื่อ commenter (d) row ใน likes list (e) ผล search แท็บ Profiles (f) row ใน pfollow (g) ชื่อบนหัวห้อง chat | ทุกจุด push `profile:{U-2}` หน้าเดียวกัน — back ย้อนถูกทางทุกครั้ง (จุดใดเข้าไม่ได้ด้วยข้อมูลที่มี → `BLOCK` เฉพาะจุดนั้น) | — | HIGH | |
| PROF-025 | public page anatomy | MEMBER | UI | profile `U-2` เปิด | อ่านหน้าบน-ล่าง | head: back `<` + ⋯ · avatar + stats + bio + chip `@U-2` + `Followed by …` (ถ้ามี mutual) + ปุ่ม `Follow`/`แชท` + tabs 3 + grid — **ไม่มี** `+`/burger/Edit/Share/wallet | — | HIGH | |
| PROF-026 | ไม่มี bottom nav (SHELL-034) | MEMBER | NEGATIVE | profile `U-2` เปิด | เลื่อนดูขอบล่างจอ + เทียบ own profile | หน้าคนอื่น **ไม่มี** bottom nav เลย (deep page); own profile เท่านั้นที่มี nav + Profile active — เจอ nav บน public = FAIL | — | HIGH | |
| PROF-027 | back กลับจุดที่มา | MEMBER | STATE | เข้าจาก feed scroll ลงไปแล้ว | feed scroll → เปิด profile `U-2` → back | กลับ feed ตำแหน่งเดิม ไม่รีเฟรชกลับบนสุด | — | MED | |
| PROF-028 | guest ดู public profile ได้ | GUEST | GATE-inverse | เป็น guest | เปิด profile `U-2` จาก feed → scroll ดูทุกแท็บ + แตะ tile เปิด viewer | เห็นโปรไฟล์/แท็บ/กริด/เปิด viewer ได้ปกติ — gate เฉพาะ action (Follow/Chat/⋯/acts) ไม่ใช่การดู | — | HIGH | |
| PROF-029 | [GATE] ปุ่ม Follow | GUEST/MEMBER | GATE | profile `U-2` | **รอบ A (GUEST)**: แตะ `ติดตาม/Follow` → ปิด sheet · **รอบ B (MEMBER)**: แตะเดิม | A: Member Sheet เด้ง follow ไม่เกิด; B: ปุ่มกลาย `กำลังติดตาม/Following ⌄` + follow บันทึกจริงบน server | B: ปุ่มจาก primary `ติดตาม` → `Following` มี caret | HIGH | |
| PROF-030 | [GATE] ปุ่ม `แชท/Chat` | GUEST/MEMBER | GATE | profile `U-2` | **รอบ A (GUEST)**: แตะ `แชท/Chat` → ปิด sheet · **รอบ B (MEMBER)**: แตะเดิม | A: Member Sheet เด้ง ไม่มีห้อง; B: เปิดห้อง `chatroom` DM กับ `U-2` (contract §2.5) | B: head ห้อง = ชื่อ `U-2` | HIGH | |
| PROF-031 | [GATE] ⋯ menu | GUEST/MEMBER | GATE | profile `U-2` | **รอบ A (GUEST)**: แตะ ⋯ → ปิด sheet · **รอบ B (MEMBER)**: แตะเดิม | A: Member Sheet เด้ง sheet เมนูไม่เปิด; B: sheet เมนูเปิด (รายการ §2.6) | sheet ลอยจากขอบล่าง | HIGH | |
| PROF-032 | [GATE] avatar overlay acts | GUEST/MEMBER | GATE | profile `U-2` | **รอบ A (GUEST)**: แตะ avatar → overlay → แตะ `Follow` → ปิด gate · **รอบ B (MEMBER)**: ทำเดิม → unfollow คืน | A: Member Sheet เด้งทุก act; B: `Follow` กลาย `Following` + `Share`/`Copy link` ทำงาน | overlay มี 3 acts (viewer): Follow/Share/Copy link | HIGH | |
| PROF-033 | `Followed by …` row | MEMBER | EDGE | `U-2` มี mutual followers กับ MEMBER (ไม่มี → `BLOCK`) | เปิด profile `U-2` อ่านแถวใต้ bio | แสดง `ติดตามโดย {names}`/`Followed by {names}` + avatar นำ ≤3 คน — แสดงเฉพาะเมื่อมี mutual | — | MED | |
| PROF-034 | public tabs 3 เท่านั้น | MEMBER | NEGATIVE | profile `U-2` | อ่านแถบ tab + หา `Hide`/`Sold` | แท็บ: `ทั้งหมด/All` + `ขาย/Sale` + `โชว์/Show` เท่านั้น — **ไม่มี** Hide/Sold บนหน้าคนอื่น | — | HIGH | |
| PROF-035 | public stats → pfollow ของเขา | MEMBER | POSITIVE | profile `U-2` | แตะ `followers` และ `following` บน stats | push `pfollow:{U-2}:followers` / `:following` — list ของ `U-2` (rows ตาม §2.4) | head list = `U-2` | HIGH | |
| PROF-036 | viewer ไม่เห็นโพสต์ hide/sold | MEMBER | POSITIVE | `U-2` มีโพสต์ hide/sold (ACCT-2 ทำให้ผ่าน flow จริง — ไม่มี → `BLOCK`) | นับ grid All ของ `U-2` เทียบกับที่ ACCT-2 เห็นบนเครื่องตัวเอง | grid viewer ไม่มี tile ของโพสต์ Hide/Sold เลย — นับได้เฉพาะ public posts | — | HIGH | |
| PROF-037 | `posts` count ฝั่ง viewer | MEMBER | POSITIVE | profile `U-2` | เทียบเลข `posts` กับจำนวน tile ในแท็บ All ที่เห็น | เลข posts = จำนวนโพสต์ที่ viewer เห็นจริง (ไม่นับ hide/sold ของเขา) | — | MED | |
| PROF-038 | bio/ชื่อยาวไม่พังเลย์เอาต์ | MEMBER | EDGE | `U-2` มี username/bio ยาว (ACCT-2 ตั้ง bio ยาว ~150 ตัว — ทำไม่ได้ → `BLOCK`) | เปิด profile `U-2` + เทียบจอแคบ | ชื่อ/bio wrap หรือตัด ellipsis เรียบร้อย — ปุ่ม/stats/tabs ไม่ล้น ไม่ทับกัน | — | MED | |
| PROF-039 | viewer tile → PV scope ของเขา | MEMBER | POSITIVE | profile `U-2` แท็บ Sale | แตะ tile ในแท็บ Sale → ปัดดูโพสต์ถัดไป | viewer ไหลเฉพาะโพสต์แท็บ Sale ของ `U-2` (ไม่หลุดไปโพสต์ชนิดอื่น/คนอื่น) | header viewer `Posts` + `U-2` | MED | |

### 2.4 Follow Mechanics & `pfollow` Lists

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PROF-040 | follow → followers ขึ้นทั้งสองฝั่ง | MEMBER + ACCT-2 | POSITIVE | MEMBER ยังไม่ follow `U-2` | MEMBER กด Follow บน profile `U-2` → เช็ก count บนหน้า → เครื่อง ACCT-2 เปิด own profile + followers list | followers ของ `U-2` +1 ฝั่ง MEMBER เห็น; บนเครื่อง ACCT-2 เห็น `U-ME` ใน followers + following ของ `U-ME` +1 | — | HIGH | |
| PROF-041 | `Following ⌄` → manage sheet | MEMBER | POSITIVE | follow `U-2` แล้ว | แตะ `กำลังติดตาม/Following ⌄` | sheet เปิด title `U-2` + rows: `เพิ่มในรายการโปรด/Add to favorites` · `ปิดเสียงเตือน/Mute` · `เลิกติดตาม/Unfollow` — แตะ backdrop ปิดได้ | — | HIGH | |
| PROF-042 | unfollow ผ่าน sheet | MEMBER | POSITIVE | sheet Following เปิด | แตะ `เลิกติดตาม/Unfollow` | unfollow ทันที (ไม่มี confirm) + sheet ปิด + toast `เลิกติดตามแล้ว/Unfollowed` + ปุ่มกลับ `ติดตาม/Follow` + followers ของ `U-2` −1 | — | HIGH | |
| PROF-043 | Add to favorites | MEMBER | POSITIVE | sheet Following เปิด | แตะ `เพิ่มในรายการโปรด` → ปิด sheet → Settings → Favorites | toast `Added to favorites` + row ใน sheet กลาย `Remove from favorites` + `U-2` อยู่ในรายการ Favorites (anatomy list ของ FO-TEST-15) | star icon เปลี่ยนเติม | MED | |
| PROF-044 | Remove from favorites | MEMBER | POSITIVE | `U-2` เป็น favorite | เปิด sheet Following → `ลบออกจากรายการโปรด` → เช็ก Favorites | toast `Removed from favorites` + `U-2` หายจาก Favorites | — | MED | |
| PROF-045 | Mute ผ่าน sheet | MEMBER | POSITIVE | sheet Following เปิด | แตะ `ปิดเสียงเตือน/Mute` → confirm dialog → ยืนยัน → กลับ feed | dialog confirm → toast `Muted` + โพสต์ของ `U-2` หายจาก feed eligibility (canonical 02) + `U-2` อยู่ใน Settings > Muted | — | HIGH | |
| PROF-046 | Unmute | MEMBER | POSITIVE | `U-2` muted | เปิด `pfollow` following ⋯ pop หรือ sheet → `เปิดเสียงเตือน/Unmute` → กลับ feed | toast `Unmuted` + โพสต์ `U-2` กลับเข้า feed + หายจาก Muted list | — | MED | |
| PROF-047 | pfollow anatomy (own) | MEMBER | UI | own profile มี followers+following | own → แตะ `followers` → อ่านหน้า → สลับ tab | head: back + title `U-ME` + แท็บ `{n} followers`/`{n} following` + ช่อง `Search username` + rows (avatar+name); own rows: followers → `แชท`+`✕ Remove`; following → `แชท`+`⋯` | — | HIGH | |
| PROF-048 | Remove follower (own) | MEMBER + ACCT-2 | POSITIVE | `U-2` เป็น follower ของ MEMBER | own followers → แตะ `✕` แถว `U-2` → dialog `Remove follower?` → `Remove` → เครื่อง ACCT-2 เช็ก following ของตน | dialog ขึ้น + desc `We won't let {u} know…` → Remove: แถว `U-2` หาย + followers count −1 + ฝั่ง ACCT-2 หลุด following `U-ME` (ไม่มีการแจ้งเตือน ACCT-2) | — | HIGH | |
| PROF-049 | own following ⋯ pop | MEMBER | POSITIVE | own following list | แตะ `⋯` แถว `U-2` → อ่าน pop → `เลิกติดตาม` | pop ใต้แถว: `เลิกติดตาม/Unfollow` (danger) + `ปิดเสียงเตือน/Mute` หรือ `Unmute` → Unfollow: แถวหายจาก following + toast `Unfollowed` | — | MED | |
| PROF-050 | list ของคนอื่น → Follow pill | MEMBER | POSITIVE | `pfollow:{U-2}` | เปิด followers ของ `U-2` → แตะ `Follow` บนแถวที่ยังไม่ follow → แตะอีกครั้งเพื่อ unfollow | pill flip `Follow`↔`Following` ในที่เดิม (แถวไม่เด้งหาย/ไม่ re-render ทั้งหน้า) + ชื่อตัวเอง **ไม่มี** ใน list คนอื่น | — | MED | |
| PROF-051 | search ใน list | MEMBER | POSITIVE | list มีหลายแถว | พิมพ์ username บางส่วน + พิมพ์มั่ว | filter live ตามพิมพ์; ไม่ตรง → `No results found` — ลบคำ → list เต็มกลับ | — | MED | |
| PROF-052 | row → profile ซ้อน | MEMBER | STATE | `pfollow:{U-2}:followers` | แตะแถวคนหนึ่ง → profile เขาเปิด → back | push `profile:{นั้น}` ซ้อนบน list; back กลับ list แท็บเดิม scroll เดิม | — | MED | |
| PROF-053 | guest เปิด list ได้ แต่กดไม่ได้ | GUEST | GATE | เป็น guest บน `pfollow:{U-2}` (เข้าผ่าน stats) | เปิด followers ของ `U-2` → เห็นแถว → แตะ `Follow` บนแถว | list เห็นปกติ; แตะ pill → Member Sheet เด้ง (gated) | — | HIGH | |
| PROF-054 | empty list + effect ลง feed | MEMBER | EDGE | NEW ไม่มี followers/following + MEMBER follow `U-2` แล้ว | NEW: เปิด pfollow ทั้งสองแท็บ · MEMBER: follow `U-2` → กลับ feed แท็บ `กำลังติดตาม/Following` | NEW: `No followers yet` / `You're not following anyone yet` (own); MEMBER: โพสต์ของ `U-2` เริ่มเข้า Following feed (canonical 02) | — | HIGH | |

### 2.5 DM from Profile — One Room Per Account (lock)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PROF-055 | Chat → ห้อง DM เปล่า | MEMBER | POSITIVE | ไม่เคยคุยกับ `U-2` | profile `U-2` → `แชท` | เปิดห้อง `chatroom` ตรงกับ `U-2` — ห้องว่างพร้อม composer ใช้งานได้ — **ไม่มีการ์ดลิสติ้ง** (DM ไม่ผูก item) | head: back + `U-2` + search + ⋯ | HIGH | |
| PROF-056 | ส่งข้อความ → เข้า Chat list | MEMBER | POSITIVE | ห้อง `U-2` เปิด | พิมพ์ข้อความ → ส่ง → back → เปิดแท็บ `แชท` | ข้อความขึ้นฝั่งขวาพร้อม `Sent` + thread `U-2` ปรากฏใน Chats list (preview = ข้อความล่าสุด) | — | HIGH | |
| PROF-057 | Chat ซ้ำ = ห้องเดิม | MEMBER | STATE | เคยคุยกับ `U-2` | ออกจากห้อง → profile `U-2` → `แชท` อีกครั้ง | เข้า**ห้องเดิม**ประวัติครบ — ไม่สร้างห้องใหม่ (ห้องเดียวต่อ account ตลอดไป) | — | HIGH | |
| PROF-058 | Ask → การ์ดลิสติ้งเป็นข้อความ | MEMBER | POSITIVE | `POST-2A` ลิสติ้งของ `U-2` | เปิด `POST-2A` → `สอบถาม/Ask` | เข้า**ห้องเดียวกัน**ของ `U-2` + การ์ดลิสติ้ง `POST-2A` ปรากฏเป็น**ข้อความฝั่งเรา** 1 ใบ (reply-story style) — composer prefill ข้อความ quick-ask — ไม่มีการ์ด pin ค้างบนห้อง | การ์ด: รูป+ชื่อ+แคปชัน+ราคา | HIGH | |
| PROF-059 | Ask ลิสติ้งเดิมซ้ำ → ไม่ซ้ำการ์ด | MEMBER | STATE | เคย Ask `POST-2A` | กด `Ask` บน `POST-2A` อีกครั้ง → อ่านห้อง | ห้องเดิม + **ไม่มี**การ์ด `POST-2A` ใบที่สอง — การ์ดอยู่ตำแหน่งเดิมในสายข้อความ | — | MED | |
| PROF-060 | Ask ลิสติ้งชิ้นที่สอง seller เดิม | MEMBER | POSITIVE | `POST-2B` อีกชิ้นของ `U-2` | กด `Ask` บน `POST-2B` | ห้องเดิมอีก + การ์ด `POST-2B` แนบเพิ่มต่อท้าย (ตอนนี้ห้องมีการ์ด 2 ใบต่างลิสติ้งในสายข้อความ) — Items view ของ Chat จัด `U-2` ใต้ลิสติ้งล่าสุด (`Items you asked about`) | — | HIGH | |
| PROF-061 | DM-only room ไม่ขึ้น Items view | MEMBER | NEGATIVE | มีห้อง DM กับคนที่ไม่เคย Ask (เช่น `U-3` หรือคุยกับ `U-2` ก่อน Ask) | เปิด Chat → แท็บ Items | ห้องที่ไม่เคย Ask **ไม่มี** ใน Items view — เห็นเฉพาะ `Your listings` + `Items you asked about` | — | MED | |
| PROF-062 | block แล้ว Chat ตีกลับ | MEMBER | POSITIVE | MEMBER block `U-2` แล้ว (PROF-070) | เปิด `pfollow` followers ของตน → `แชท` บนแถว `U-2` (หรือเปิดห้องเดิมจาก Chat list) | แตะ `แชท` บนแถว → toast `Cannot message a blocked account` ไม่เปิดห้อง; ห้องเดิมใน list เปิดได้แต่ composer ถูกแทนด้วย blocked bar `You blocked this account` + `Unblock` | — | HIGH | |

### 2.6 ⋯ Menu — Report / Block / About / Copy / Share

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PROF-063 | sheet ⋯ anatomy | MEMBER | UI | profile `U-2` | แตะ ⋯ → อ่าน sheet | card: `Report` (danger) · `Block`/`Unblock` · `About this account` · `Copy profile URL` · `Share this profile` + card `Cancel` แยก — แตะ backdrop ปิดได้ | hairline คั่นทุกแถว | HIGH | |
| PROF-064 | Copy profile URL | MEMBER | POSITIVE | sheet ⋯ เปิด | `Copy profile URL` → วางในแอปอื่น (notes) | toast `Link copied` + clipboard = `https://tukdaeng.app/u/{U-2}` — URL ตรงเป๊ะ encode ถูก | — | HIGH | |
| PROF-065 | Share this profile | MEMBER | POSITIVE | sheet ⋯ เปิด | `Share this profile` | share sheet ของระบบ/แอปเปิดพร้อมลิงก์ profile — ยกเลิกได้ไม่ค้าง | — | MED | |
| PROF-066 | About this account | MEMBER | POSITIVE | sheet ⋯ เปิด | `About this account` → อ่าน → back | push `about:{U-2}`: joined date + country + verified marker + หมายเหตุ why-note — back กลับ profile | — | MED | |
| PROF-067 | Report → report flow | MEMBER | POSITIVE | sheet ⋯ เปิด | `Report` → เลือกรายงานบัญชี → เลือกเหตุผล → ดูหน้าสุดท้าย | เข้า `report:` flow (pick account/post → reasons → done: `Thanks for your feedback` + `Other steps you can take` Block/Unfollow/Mute + `Done`) — internals เหตุผลของ FO-TEST-16 | — | HIGH | |
| PROF-068 | Report แล้วเลือกโพสต์ | MEMBER | POSITIVE | flow report จาก ⋯ | เลือกรายงานโพสต์ → `Select a post` grid → เลือก tile → `Next` → เหตุผล → done | grid โพสต์ของ `U-2` เลือกได้ทีละชิ้น + `Next` ปลดล็อกเมื่อเลือก → ส่งสำเร็จเหมือน PROF-067 | tile เลือกมีเครื่องหมาย | MED | |
| PROF-069 | Block → confirm sheet | MEMBER | UI | sheet ⋯ เปิด | `Block` | sheet `Block {U-2}?` + desc `This will also block any other profiles they may have or create in the future.` + 3 impact rows + `Block` + `Block and report` — Cancel ปิดไม่ block | — | HIGH | |
| PROF-070 | Block → keep-page ฝั่งเรา | MEMBER | POSITIVE | block sheet เปิด | `Block` → รอ toast → อยู่บน profile `U-2` → เช็ก feed/list | toast ยืนยัน + profile `U-2` กลาย keep-page: `posts 0` + `followers −` + `following −` + stats กดไม่ได้ + grid `No posts yet` + ปุ่มเดียว `เลิกบล็อก/Unblock` · ผลข้างเคียง: auto-unfollow + `U-2` หลุด followers เรา + โพสต์ `U-2` หายจาก feed + ห้อง chat มี blocked bar | — | HIGH | |
| PROF-071 | Block and report | MEMBER | POSITIVE | block sheet เปิด (unblock ก่อน) | `Block and report` | block เกิดเหมือน PROF-070 + เข้าสู่ report flow ต่อทันที | — | MED | |
| PROF-072 | Unblock จาก keep-page | MEMBER | POSITIVE | `U-2` blocked | profile `U-2` → `เลิกบล็อก/Unblock` → dialog `Unblock {U-2}?` → `Unblock` | dialog ยืนยัน → toast `Unblocked` + profile กลับเต็ม (stats/grid จริง) + banner restrict-hint ขึ้น ~6 วิแล้วหายเอง — **ไม่** re-follow อัตโนมัติ (ปุ่มกลับ `ติดตาม/Follow`) | — | HIGH | |
| PROF-073 | Unblock จาก Settings > Blocked | MEMBER | POSITIVE | `U-2` blocked | Settings → `บัญชีที่บล็อก/Blocked` → `ปลดบล็อก` แถว `U-2` → dialog → ยืนยัน | dialog เดียวกัน → unblock สำเร็จ + แถวหายจาก list + profile `U-2` กลับเต็ม — list anatomy ของ FO-TEST-15 | count บน settings row ลด | MED | |
| PROF-074 | unblock ไม่คืน follow/fav/mute | MEMBER | STATE | เคย follow+fav `U-2` ก่อน block → unblock | unblock เสร็จ → เช็กปุ่ม + Favorites + Muted | ปุ่มเป็น `ติดตาม/Follow` (ไม่ติดตาม) + `U-2` ไม่อยู่ Favorites + ไม่อยู่ Muted — state ก่อน block ไม่ฟื้น | — | MED | |
| PROF-075 | เขา block เรา → หน้าไม่พร้อมใช้งาน | MEMBER + ACCT-2 | POSITIVE | ACCT-2 block `U-ME` ผ่านแอปจริงบนเครื่องสอง | เครื่อง MEMBER: เปิด profile `U-2` (จากชื่อเดิม/ค้นหา/deep link) | หน้า `profile:{U-2}` แสดงสถานะ **ไม่พร้อมใช้งาน** (`หน้านี้ไม่พร้อมใช้งาน`/`This page isn't available` ตาม 00_NAV §10 unavailable contract) — **ไม่ใช่** keep-page ที่มี Unblock — sync block ข้ามเครื่องช้า → `BLOCK` ระบุเวลาที่ลอง | — | HIGH | |

### 2.7 QR Overlay & Avatar Overlay

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PROF-076 | QR overlay anatomy | MEMBER | UI | own profile → `แชร์โปรไฟล์` | อ่าน overlay | top: `X` + `COLOR` + scan icon · กลาง: การ์ด QR พร้อม `@{USERNAME}` ตัวเอง · ล่าง: `Share profile` + `Copy link` + `Download` — แตะ X ปิดได้ | bg gradient theme 0 | HIGH | |
| PROF-077 | QR payload = profile URL | MEMBER + ACCT-2 | POSITIVE | QR เปิดอยู่ | เครื่อง ACCT-2: เปิดกล้อง/สแกน QR บนจอ MEMBER → เปิดลิงก์ที่ได้ | payload คือ `https://tukdaeng.app/u/{U-ME}` — เปิดแล้วไป profile `U-ME` (ในแอป/deep link ตาม build — ไม่มี deep link → `BLOCK`) | — | HIGH | |
| PROF-078 | COLOR cycle 5 themes | MEMBER | STATE | QR เปิด | แตะ `COLOR` ไล่ทุกครั้ง → ปิด → เปิดใหม่ | กดแต่ละครั้งเปลี่ยน gradient+สี QR วนครบ 5 themes แล้วกลับ theme แรก; ปิด-เปิดใหม่กลับ theme 0 (theme ไม่ persist — spec) | — | LOW | |
| PROF-079 | QR `Copy link` | MEMBER | POSITIVE | QR เปิด | `Copy link` → วางที่อื่น | toast `Link copied` + clipboard = `https://tukdaeng.app/u/{U-ME}` | — | MED | |
| PROF-080 | QR `Download` | MEMBER | POSITIVE | QR เปิด | `Download` → เช็ก gallery/ไฟล์ | toast `QR code saved` + ไฟล์รูป QR อยู่ในเครื่องเปิดได้ — build ไม่มี save → `BLOCK` | — | MED | |
| PROF-081 | QR `Share profile` | MEMBER | POSITIVE | QR เปิด | `Share profile` | share sheet เปิดพร้อมลิงก์ profile (เหมือน PROF-065) | — | MED | |
| PROF-082 | QR Scan → กล้องจริง | MEMBER | POSITIVE | QR เปิด | แตะ scan icon → อนุญาตกล้อง → เช็ก view → ส่อง QR ของ `U-2` (จากเครื่อง ACCT-2) | ขอ camera permission; allow → มุมมองกล้อง + กรอบ + hint `Point your camera at a QR code`; ส่อง QR profile → เปิด profile `U-2`; deny → toast `Allow camera access to scan a QR code` — build ไม่มี scanner → `BLOCK` | — | HIGH | |
| PROF-083 | avatar overlay acts (viewer) | MEMBER | UI | profile `U-2` → แตะ avatar | อ่าน acts → `Share` → `Copy link` → แตะ overlay นอกปุ่ม | 3 acts เท่านั้น: `Follow`/`Following` + `Share` + `Copy link` (**ไม่มี** QR act — ตัดออกแล้ว); Share → `Profile shared`; Copy → `Profile link copied`; แตะว่าง/รูป → overlay ปิด | — | MED | |

### 2.8 Edit Profile (`pedit`)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PROF-084 | pedit anatomy | MEMBER | UI | own → `แก้ไขโปรไฟล์` | อ่านฟอร์ม | head: back + `แก้ไขโปรไฟล์/Edit profile` · avatar + `เปลี่ยนรูปโปรไฟล์/Edit picture` · `ชื่อผู้ใช้/Username` (prefill) · `ประวัติโดยย่อ/Bio` (prefill, ≤150) · `ลิงก์/Link` (prefill) · `บันทึก/Save` | — | HIGH | |
| PROF-085 | Edit picture → picker จริง | MEMBER | POSITIVE | pedit เปิด | `เปลี่ยนรูปโปรไฟล์` → OS photo picker → เลือกรูปจริง | picker ของเครื่องเปิด (ไม่ใช่ toast/demo) → เลือกแล้ว avatar ใหม่ขึ้นทันที + toast `Profile picture updated` — build ไม่มี picker → `BLOCK` | รูปใหม่ทุกจุด (profile/feed/chat) | HIGH | |
| PROF-086 | picker ยกเลิก → ไม่เปลี่ยน | MEMBER | NEGATIVE | picker เปิด | เปิด picker → กดยกเลิก/back ไม่เลือกรูป | avatar เดิม ไม่มี toast ไม่มีการบันทึก | — | MED | |
| PROF-087 | เปลี่ยน username สำเร็จ | MEMBER | POSITIVE | pedit เปิด | แก้ username เป็นชื่อว่างใหม่ `new.name_1` → `บันทึก` → ดู profile | toast `Profile updated` + กลับ profile + ชื่อใหม่ทุกจุด (head/bio chip/chat/list) + route `profile:{new}` เปิดได้ — เปลี่ยนแล้วเปลี่ยนกลับหลังเทส | ปุ่ม Save ใต้ฟอร์ม | HIGH | |
| PROF-088 | rename ไม่ทำ reference หลุด | MEMBER | STATE | เปลี่ยนชื่อแล้ว (PROF-087) | เช็ก: โพสต์ตัวเองยัง seller=ชื่อใหม่ · followers/following เดิม · ห้อง chat เดิม · เปิด `profile:{ชื่อเก่า}` | โพสต์/คอมเมนต์/สัมพันธ์ทั้งหมดยังอยู่กับ account เดิม (migrate ตามชื่อใหม่); `profile:{ชื่อเก่า}` → ไม่พร้อมใช้งาน หรือ resolve ไปชื่อใหม่ตาม server contract — ห้ามยังโชว์ profile สมบูรณ์ภายใต้ชื่อเก่า | — | HIGH | |
| PROF-089 | username format ผิด | MEMBER | NEGATIVE | pedit | ใส่ `Ab`, `a b`, `abc!`, ภาษาไทย ทีละแบบ → `บันทึก` | ไม่บันทึก + inline error `Username required — 3–20 characters: a–z, 0–9, _ or .` (ตามภาษาแอป) + focus ช่อง username — format: `^[a-z0-9_.]{3,20}$` | error แดงใต้ช่อง | HIGH | |
| PROF-090 | username ความยาวขอบ | MEMBER | EDGE | pedit | ลอง `ab` (2) / `abc` (3) / 20 ตัว / พิมพ์ต่อเกิน 20 | `ab` → error เหมือน PROF-089; `abc` และ 20 ตัว → save ผ่าน; ช่อง maxlength=20 พิมพ์เกินไม่ได้ — ตัวพิมพ์ใหญ่ถูก normalize เป็น lowercase | — | MED | |
| PROF-091 | username ซ้ำคนอื่น | MEMBER | NEGATIVE | pedit | ใส่ `U-2` หรือ username ที่มีอยู่ → `บันทึก` | ไม่บันทึก + `This username is already taken.` (ตามภาษาแอป) — ใส่ชื่อเดิมของตัวเอง = ผ่าน | — | HIGH | |
| PROF-092 | bio ≤150 | MEMBER | POSITIVE | pedit | ใส่ bio 150 ตัวพอดี → save · พิมพ์ต่อเกิน 150 | 150 ตัว save ผ่านแสดงเต็มบน profile; maxlength กันพิมพ์เกิน — ไม่มี error ถ้าไม่เกิน | — | MED | |
| PROF-093 | bio ว่างได้ | MEMBER | POSITIVE | pedit | ลบ bio ให้ว่าง → save → ดู profile | บันทึกผ่าน + ส่วน bio หายจาก profile (ไม่มีข้อความ placeholder ค้าง) | — | MED | |
| PROF-094 | link รูปแบบที่รับ | MEMBER | POSITIVE | pedit | save ทีละค่า: `https://example.com/x` · `example.com` · `www.example.com` · `@some_handle` → ดู profile แต่ละครั้ง | ทุกแบบบันทึกผ่าน — URL/domain → link chip ไอคอนลิงก์; `@handle` → chip `@` + handle | — | MED | |
| PROF-095 | link ผิดรูปแบบ | MEMBER | NEGATIVE | pedit | ใส่ `not a url`, `ftp://x`, `javascript:alert(1)` ทีละค่า → `บันทึก` | ไม่บันทึก + inline `Invalid link — enter a URL (https://...) or @username.` (ตามภาษาแอป) + focus ช่อง link | — | HIGH | |
| PROF-096 | ลบ link ออก | MEMBER | POSITIVE | มี link เดิม | ลบช่อง link ให้ว่าง → save → ดู profile | บันทึกผ่าน + link chip หายจาก profile | — | MED | |
| PROF-097 | back ไม่ save → ทิ้ง | MEMBER | NEGATIVE | pedit เปิด | แก้ทุกช่อง → กด back/`<` ไม่กด Save → เปิด pedit ใหม่ | ค่ากลับเป็นเดิมทั้งหมด — ไม่มี confirm ไม่มี draft ค้าง | — | MED | |
| PROF-098 | save สำเร็จ → persist จริง | MEMBER + ACCT-2 | POSITIVE | เปลี่ยน bio/link แล้ว | kill app → เปิดใหม่ → เครื่อง ACCT-2 เปิด profile `U-ME` | ค่าใหม่ยังอยู่หลัง restart และ ACCT-2 เห็นค่าใหม่ (server-backed — ไม่ sync ข้ามเครื่อง = FAIL contract) | — | HIGH | |
| PROF-099 | pedit ไม่มีช่องอื่นแอบ | MEMBER | NEGATIVE | pedit เปิด | scroll ดูทั้งฟอร์ม | ฟิลด์เฉพาะ Username/Bio/Link + Edit picture + Save — ไม่มี email/phone/password/name field อื่น | — | LOW | |

### 2.9 Persistence / Language / Theme / Real Device

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PROF-100 | state รอด kill+restart | MEMBER | STATE | follow+fav+mute+block คนละคน + pin โพสต์ + rmf แล้ว | kill app เด็ดขาด → เปิดใหม่ → เช็กทุก state | ทุกอย่างคงเดิม: following list, Favorites, Muted, Blocked (keep-page), pin order, followers list ไม่มีคนที่ remove — server-backed | — | HIGH | |
| PROF-101 | state รอด sign-out→in | MEMBER | STATE | เหมือน PROF-100 | sign out → sign in บัญชีเดิม → เช็กทุก state | เหมือน PROF-100 ทุกข้อ — ไม่มี state หลุด/รีเซ็ตเป็น demo | — | HIGH | |
| PROF-102 | state sync ข้ามเครื่อง | MEMBER | STATE | sign in `U-ME` บนเครื่องสอง (หรือสลับ) | บนเครื่อง A: follow `U-3` + block `U-2` → เครื่อง B: เปิด profile `U-3`/`U-2` | เครื่อง B เห็น Following + keep-page block เหมือนเครื่อง A — build จำกัดเครื่องเดียว → `BLOCK` | — | HIGH | |
| PROF-103 | profile edits sync ข้ามเครื่อง | MEMBER + ACCT-2 | STATE | เปลี่ยน bio+avatar+link (PROF-085/098) | เครื่อง ACCT-2 เปิด profile `U-ME` | bio/avatar/link ใหม่เห็นจากบัญชีอื่นบนเครื่องอื่น — เป็น server truth ไม่ใช่ local cache | — | HIGH | |
| PROF-104 | guest→member ต่อจาก gate | GUEST→MEMBER | STATE | guest กด Follow → Member Sheet | จาก Member Sheet: sign in จริง → กลับ profile `U-2` → กด Follow | หลัง sign in ใช้งาน action ได้ทันที follow สำเร็จ — ไม่ค้างที่ gate | — | MED | |
| PROF-105 | ภาษาไทยทั้งหน้า | MEMBER | UI | ตั้งภาษา TH | เปิด own + public + pfollow + pedit + QR + sheet ⋯ + mf sheet | ทุก label/toast เป็นภาษาไทยครบ (แท็บ/stats/ปุ่ม/sheet/dialog/empty) — string EN ค้างที่ไหน = FAIL (ยกเว้นชื่อ/username/แบรนด์) | — | HIGH | |
| PROF-106 | ภาษาอังกฤษทั้งหน้า | MEMBER | UI | ตั้งภาษา EN | เหมือน PROF-105 | ทุก label/toast EN ครบ — TH ค้าง = FAIL | — | MED | |
| PROF-107 | dark theme | MEMBER | UI | เปิด dark | ไล่ own/public/pfollow/pedit/QR/avov/sheet/dialog/keep-page | ทุก surface อ่านครบ contrast พอ — ตัวหนังสือจม/กริดพัง = FAIL | — | MED | |
| PROF-108 | device back ทีละชั้น | MEMBER | STATE | profile `U-2` + ⋯ sheet + block sheet + dialog ซ้อน | เปิด ⋯ → Block → ยกเลิก → กด device back ทีละครั้ง | ปิดชั้นบนสุดก่อน (sheet → menu → profile → source) — ไม่มีการเด้งออกหลายชั้นในครั้งเดียว | — | MED | |
| PROF-109 | offline behavior | MEMBER | EDGE | ตั้งค่า offline (airplane) | เปิด profile `U-2` + กด Follow + แก้ bio save | อ่าน: profile แสดงข้อมูลล่าสุดที่มี หรือ error state ชัดเจน (ตาม build); **เขียน: follow/save ต้อง error ชัดเจน + ไม่บันทึกหลอก** — reconnect แล้ว state ต้องตรง server | — | HIGH | |
| PROF-110 | rotate + small screen | MEMBER | EDGE | เครื่องจอเล็กสุดในทีม | own/public/pedit หมุนแนวนอน + เทียบจอแคบ | layout ไม่พัง: stats ไม่ทับ ปุ่มไม่ล้น grid ปรับคอลัมน์ state ไม่หาย — เครื่องล็อก portrait → เคสนี้ `BLOCK` | — | LOW | |

## §3 Spec deviations/contract ที่กระทบเคสเล่มนี้

| Deviation / contract | ผลต่อ expected | TC |
| --- | --- | --- |
| `pf-msg` เดิม dead toast → **real DM** (FO-TEST-12 lock) | Chat จาก profile/row ต้องเปิดห้องจริง เจอ toast `Open a listing to chat…` = FAIL | PROF-030, 055..062 |
| Chat room เดิมผูก `user+item` → **ห้องเดียวต่อ account** (FO-TEST-12 lock) | Ask ลิสติ้งต่างชิ้นต้องไม่สร้างห้องใหม่; การ์ดเป็นข้อความ `m.pid` เท่านั้น | PROF-057..060 |
| `t.item` = ลิสติ้งที่ ask ล่าสุด → Items view | room ไม่เคย ask ไม่ขึ้น Items view | PROF-061 |
| Keep-page block (S-13 canonical — ฝั่งเรา block) vs unavailable (00_NAV §10 — ฝั่งถูก block) | เรา block → masked stats + Unblock; เขา block เรา → หน้าไม่พร้อมใช้งาน | PROF-070..075 |
| ไม่มี bottom nav บน viewer profile (SHELL-034 — prototype เดิมโชว์ nav Feed, แก้แล้ว) | nav หลุดบน public profile = FAIL | PROF-026 |
| Dead controls ตัดออกแล้ว (FO-TEST-12): `pf-note`/`pf-sleep`/`pf-addchip`/`pf-avadd`/`pf-addp`/username toast/overlay `qr` act | เจอ control เหล่านี้บนหน้าจอ = FAIL; `pe-pic`/`pf-msg` ต้อง real | PROF-004, 007, 083, 085 |
| Server-backed profile state (FO-TEST-12 lock — prototype mirror `fo_pfstate`) | kill/sign-out/cross-device ต้อง persist — state หลุด = FAIL ไม่ใช่ "ยังไม่รองรับ" | PROF-100..103 |
| `pfRestrictHint` banner ~6s หลัง unblock | banner ขึ้นทันทีแล้วหายเอง; แตะ = dismiss | PROF-072, 073 |
| Toasts หลายตัว prototype hardcode EN | toast ตามภาษาแอปเสมอ — EN ค้างตอนภาษาไทย = FAIL | PROF-105 (+ทุกเคส toast) |
| `pfp-follow` pill ใน viewer head fade ~1.2s | follow จาก viewer → pill flip แล้วจางหาย | PROF-054 |
| `profileOf` fabricate ทุกชื่อ (prototype) — แอปจริงต้องมี not-found | username ไม่มีจริง → หน้าไม่พร้อมใช้งาน (00_NAV §10) | PROF-075 contract เดียวกัน |
| Rename migration (server) | ชื่อเก่าต้องไม่แสดง profile สมบูรณ์; reference ทั้งหมดตามชื่อใหม่ | PROF-088 |

## §4 Traceability — inventory + actions ครอบ

| Inventory หน้า/route | Action ใน inventory | TC ที่ครอบ | หมายเหตุ |
| --- | --- | --- | --- |
| nav `profile` + `profile:{me}` | head `+`/uname/menu · avatar→avov · stats→pfollow · bio/link · Edit/Share/Portfolio | PROF-001..012 | `[GATE]` nav |
| tabs `pf-tab` + grid `pf-tile` | tab swap+scroll-keep · per-kind filter · tile→PV pfp · pin order · empty | PROF-013..023 | pin ผ่าน post menu canonical |
| `profile:{user}` public | back/⋯ · follow pill+mf · Chat DM · fby · avatar→avov · tabs 3 · no nav | PROF-024..039 | SHELL-034 |
| `pfollow:{u}:{tab}` | tabs+counts · search · own Chat/Remove/⋯pop · other rows Follow pill · nested push | PROF-046..053 | guest view allowed, act gated |
| `pf-msg` (profile + follower row) | DM `pfOpenChat` — ห้องเดียวต่อ account · blocked guard | PROF-030, 055..057, 062 | FO-TEST-12 lock |
| `Ask` → `chatQuickAsk` | ห้องเดิม + การ์ด `m.pid` 1 ครั้ง/ลิสติ้ง · Items view | PROF-058..061 | reply-story contract |
| sheet `pf-more` (⋯) | Report · Block/Unblock · About · Copy URL · Share · Cancel | PROF-031, 063..068 | gated |
| `blk` sheet + `unblock` dlg + `pf-rhint` | Block/Block and report · keep-page · Unblock dlg · restrict hint · no re-follow · they-block-you unavailable | PROF-069..075 | S-13 + 00_NAV §10 |
| `pf-qr` overlay | QR card payload `tukdaeng.app/u/{u}` · COLOR 5 themes · Copy · Download · Share · Scan camera | PROF-076..082 | theme session-only |
| `pf-avov` overlay | Follow/Share/Copy link (viewer) · Share/Copy (own) · no QR act | PROF-007, 032, 083 | `[GATE]` acts |
| `pedit` | Edit picture picker · username rules+taken+rename · bio ≤150 · link URL/domain/@ · save/back | PROF-010, 084..099 | `pe-pic` real (lock) |
| `about:{u}` | joined/country/verified + why-note | PROF-066 | `[OPEN-CODE-ONLY]` |
| follow/fav/mute/rmf/pin server state | persist kill/sign-out/cross-device · feed/list sync | PROF-040..054, 100..103 | `fo_pfstate` mirror |
| guest gate | `[data-navgo="profile"]` + `.pf-foll`/`.pf-flw`/`.pf-msg`/`.pf-avov-act`/`.pf-more`/`.pf-rmf`/`.pf-unblock`/`.pf-share`/`.pf-edit` ∈ GUEST_GATE_SEL | PROF-001, 029..032, 052, 053, 104 | เทส 2 รอบทุก [GATE] |
| lang/theme/device | TH/EN sweep · dark · device back · offline · rotate | PROF-105..110 | |

## หมายเหตุท้าย

- **ก่อนส่งงานจริง**: เขียนเสร็จ → รอ PO/หัวหน้ารีวิว → แก้ตาม feedback → ค่อยปิด task (กฎเดียวกับทุกเล่ม)
- **ข้อมูลจริงบน server เป็นตัวแปรหลัก** — จำนวน followers/posts/count ขึ้นข้อมูลจริง: expected ทุกข้อตัดสินได้จากข้อมูลที่มีจริง อย่า FAIL เพราะจำนวนน้อยกว่าตัวอย่าง
- **เคส BLOCK ล่วงหน้าที่คาดว่าอาจเจอ**: PROF-009 (ไม่มี flow story), PROF-015/018 (สร้างโพสต์หลายชนิดไม่ได้), PROF-024 (บาง entry ไม่มีข้อมูล), PROF-033 (ไม่มี mutual), PROF-036 (ACCT-2 ทำ hide/sold ไม่ได้), PROF-038 (ตั้ง bio ยาวไม่ได้), PROF-075/102/103 (ต้องเครื่องสอง + server sync), PROF-077/080/082 (deep link/save/QR scan ยังไม่ implement), PROF-085 (photo picker), PROF-110 (ล็อก portrait)
- **ครอบโดยเล่มอื่น ไม่ทำซ้ำ**: portfolio/`pfasset`/sold/sell → FO-TEST-13 · Chat Center/room internals → FO-TEST-08 · create flow จาก `+` → FO-TEST-05 · PV/Detail internals → FO-TEST-06 · report reason internals → FO-TEST-16 · Settings lists anatomy (Favorites/Muted/Blocked) + delete account → FO-TEST-15 · Member Sheet internals → FO-TEST-17
- **จุดที่แก้ spec+prototype ในรอบนี้** (align ให้ตรง contract ก่อนเทส): (1) spec 06/07 + prototype: `pf-msg`/`pfOpenChat` DM จริง + `chRoomFor` ห้องเดียวต่อ account + `chatQuickAsk` แนบการ์ดเป็น `m.pid` + DM ไม่ขึ้น Items view (2) `pfNavHTML(own)` — viewer profile ไม่มี nav (3) ตัด dead controls `pf-note`/`pf-sleep`/`pf-addchip`/`pf-avadd`/`pf-addp`/username toast/`qr` act ออกจาก render (4) `pe-pic` → OS photo picker จริง + `pfSave` (5) `pfRestrictHint` wire หลัง unblock (6) persist layer `pfSave`/`pfLoad` → `fo_pfstate:{member|new}` (7) spec 06 §3/§5/§6/deviations + spec 07 §2/§3/§4/deviations/AC อัปเดต lock notes
