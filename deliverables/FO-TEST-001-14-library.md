# FO-TEST-001-14 — Test Cases: Library (Saved / Wishlist / Archive / NI) (แอปมือถือจริง)

**Task**: FO-TEST-14 ของชุด FO-TEST-001 — เขียนเป็นเวอร์ชันเทสแอปมือถือจริงตั้งแต่แรก (ไม่มีรอบ prototype แยก เพราะ spec ล็อกแล้ว)
**SoT**: แอป TukDaeng build ทดสอบบนมือถือจริง — expected ล็อกตาม `FrontOffice/11_SOCIAL_MODULE.md` §12–14 (Save & Collections / Wish List / Not-interested — AC-SOCIAL-009..014) + `02_FEED_MODULE.md` §9 (Archive Flow/Rule — AC-FEED-026/027/033) + `13_SETTINGS_MODULE.md` (Your library rows + `interested`/`ni` — AC-SETTING-015 + Content Preferences Rule) + `00_GLOBAL_RULES_MODULE.md` §10–12 (visibility matrix, guest capabilities, lifecycle, offline contract) + `00_NAVIGATION_AND_CROSS_MODULE_FLOW.md` §6–7 (sub-stack, entry matrix, AC-NAV-026 viewer entries) + `03_SEARCH_FILTER_MODULE.md` (`sr-saved` entry — FSP-016) — `Prototypes/fo-flow` = แค่ reference ว่าหน้าตาควรเป็นแบบไหน
**Scope**: `saved` hub (3 tabs + search + manage) + `savedcol` collection page (add/edit/cover/select/delete modes) + sheet `sv` + `nc` new collection + `wishlist` hub + `wishcol` + sheet `wl` + `archive` + settings `interested` + `ni` + entry points (settings Your-library rows, `sr-saved` บนหน้าค้นหา, save-btn/gift icon ทุก surface) + sync ข้าม surface + persist ข้ามเครื่อง + guest gate + ต้นทางเปลี่ยนสถานะ
**ยกเว้น**: internals ของ Post Viewer/Post Detail — ของ FO-TEST-06 (เช็กเฉพาะ entry + back + title) · mechanics ของ save sheet/comments/like/share ในฐานะ sheet — ของ FO-TEST-07 · ปุ่ม/เมนูบน feed card โดยละเอียด — ของ FO-TEST-03 · own-post menu อื่น (pin/edit/sold/delete) — ของ FO-TEST-03/13 · Watch Alerts หน้าปลายทาง — ของ FO-TEST-11 (เช็กเฉพาะ row บน settings) · `prefs` hub + favorites/muted/blocked — ของ FO-TEST-15 (เช็กเฉพาะทางเข้า interested/ni) · Member Sheet internals — ของ FO-TEST-17
**การตัดสินล็อก 2026-10-29** (ถามผู้ใช้ก่อนเขียน): (1) **multi-collection** — โพสต์ 1 โพสต์อยู่พร้อมกันได้หลายคอลเลกชันตามแบบจำลองล่าสุดและ IG จริง (spec 11 เขียน `savedCol` เอกพจน์ = ค้างเก่า) — เลือก/เอาออกทีละคอลเลกชัน ยกเลิกเซฟถึงหลุดทุกอัน (2) **ต้นทางเปลี่ยนสถานะ** — ขายแล้ว = tile ยังอยู่+เปิดได้ เห็นสถานะขายแล้ว · เจ้าของซ่อน(Hide)/เก็บเข้าคลังถาวร(Archive)/บล็อกเรา = tile หายจาก library ของคนเซฟ · เจ้าของลบ = tile หาย + เปิดทางที่ค้างอยู่เจอหน้า "ไม่พร้อมใช้งาน" (3) **offline** — หน้าคลังแสดงข้อมูลชุดล่าสุดที่เคยโหลด (ตาม global offline contract แบบ feed) แต่ action ที่ต้องเขียนข้อมูลไม่สำเร็จและแจ้งชัด ไม่เงียบ (4) **แถว Interested/NI** — แตะแถวโพสต์เปิดโพสต์นั้น (Post Viewer) ไม่ใช่โปรไฟล์คนขาย (แบบจำลองพาไปโปรไฟล์ = deviation)
**หมายเหตุ**: เขียนเสร็จรอรีวิว — อย่าเพิ่งปิดงาน

---

## §0 วิธีใช้ + สภาพแวดล้อม + กติกาที่ล็อก

- **ทดสอบบนเครื่องจริงเท่านั้น** — ติดตั้งแอป build ทดสอบลงมือถือจริง แตะ/ปัด/พิมพ์/เลื่อนบนหน้าจอจริง — **ไม่ใช้ browser, dev console, ปุ่ม dev/demo, localStorage, OTP จำลอง** — เตรียมสถานะด้วย action จริงในแอป + ข้อมูลจริงบน server เท่านั้น
- **Actors**: `GUEST` = ไม่ sign in · `MEMBER` = บัญชีทดสอบจริงบนเครื่องหลัก (เจ้าของ library) · `NEW` = สมัครใหม่ (library ว่างเสมอ) · `ACCT-2` = **บัญชีจริงที่สอง บนเครื่องจริงอีกเครื่อง** — ใช้เป็นเจ้าของโพสต์ที่เปลี่ยนสถานะ/ลบ/ซ่อน/บล็อก + cross-device sync — เคสที่ต้องบัญชี/เครื่องอื่นแต่ไม่มี → mark `BLOCK` ระบุใน Note
- **Server sync เป็นตัวแปรใหญ่ของเล่มนี้** — contract บังคับให้ทุก library state (saved/collections/wishlist/archive/interested/ni + ชื่อ/cover คอลเลกชัน) อยู่ฝั่ง server; build ที่ state ไม่ persist/ไม่ sync ข้ามเครื่อง → เคส §2.9 ที่เกี่ยว = `BLOCK`/`FAIL` ตามอาการ (persist ไม่รอด = FAIL contract ไม่ใช่ทางเลือก) — **ห้าม**นับ mirror/localStorage เป็นหลักฐาน persist
- **Type**: `POSITIVE` · `NEGATIVE` · `EDGE` · `STATE` · `UI` (เช็กโครงหน้า) · `GATE` (บังคับ sign in) · `GATE-inverse` (ยืนยันเปิดเสรี)
- **[GATE] ทุกเคสเทส 2 รอบ**: รอบ A `GUEST` → expect Member Sheet/ไม่มีทางถึง; รอบ B `MEMBER` → expect feature ทำงาน
- **Device back เทียบเท่าปุ่มย้อนในแอป/ปิดทีละชั้น** — sheet/dialog/manage mode/search mode เปิดอยู่ต้องปิดชั้นบนสุดก่อน เคสที่มีขั้น "แตะ back/ปิด" ใช้ device back ของ OS แทนได้ ผลต้องเทียบเท่ากัน
- **ภาษาตามแอปทั้งหมด** (ล็อก 2026-10-28): ทุกข้อความ UI + toast + dialog + ช่องค้นหา + ตัวนับ เปลี่ยนตามภาษาที่เลือก — เจอ string ค้างอีกภาษา = **FAIL** (prototype hardcode EN หลายจุดในส่วน library เช่น Edit collection, New collection sheet, move sheet, ตัวนับ "N saved posts"/"N items", dialog ลบ/ถอด — ในแอปจริงถือเป็นบั๊ก); ยกเว้นชื่อ user/แบรนด์/รุ่น/ชื่อ collection ที่ user ตั้งเอง
- **Dark theme**: ทุกหน้า/sheet/dialog อ่านได้ครบใน dark — contrast โอเค ไม่มีตัวอักษรจมพื้นหลัง
- **Priority**: `HIGH` = กติกาหลัก/flow สำคัญ · `MED` = feature หลัก/edge · `LOW` = quirk; เคส BLOCK-if = MED เว้นกำหนด
- **Result column**: เว้นว่าง — tester กรอก `PASS`/`FAIL`/`BLOCK` + ปัญหาใน `Note`
- **ไม่มีเคสแบบ "จดผล" ไม่มีผลลัพธ์ทางเลือก** — ทุกเคส expected ตรง spec/contract ข้อเดียวเด็ดขาด ไม่ตรง = FAIL
- **Out of scope**: ตามหัวข้อ ยกเว้น ด้านบน — เคสใดเจอว่า feature ยังไม่ implement ใน build → `BLOCK` พร้อมเหตุผลใน Note (ห้าม workaround)

## §1 Coverage map

| Route / Surface (inventory §2.5 + spec 11/02/13) | ขอบเขต | TC ที่ครอบ |
| --- | --- | --- |
| entries — settings Your library rows · `sr-saved` · guest reach · no-nav · back | 4 rows+count · เข้าจุดเดียว · guest gate · หน้าลึกไม่มี nav | LIB-001..010 |
| `saved` hub | head+tabs · collections section ≤4+See all · all-posts grid · Manage · search mode · tile→viewer · empty 2 แบบ · sort · plus | LIB-011..029 |
| sheet `sv` + `nc` | save-btn ทุก entry · sheet เปิดเสมอ · head Saved · pick col (multi) · new col · sync ข้าม surface | LIB-030..045 |
| `savedcol` | head+more menu · add picker · edit (cover/rename/delete) · select/remove/move · search · empty · cover fallback | LIB-046..063 |
| `wishlist` + `wishcol` + sheet `wl` | wl-btn เฉพาะ detail · sheet/hub/wishcol ขนาน saved · empty · แยกระบบจาก saved | LIB-064..078 |
| `archive` | archive/unarchive · grid newest-first · tile→viewer title Archive · empty · หลุด library ฝั่ง saver | LIB-079..087 |
| `interested` + `ni` | rows+ปุ่มลบออก/คืนค่า · แตะแถว→โพสต์ · empty · sort | LIB-088..097 |
| ต้นทางเปลี่ยนสถานะ + cross-surface | sold/hide/archive/delete/block → tile · count/refresh · ni/mute ไม่กระทบ | LIB-098..105 |
| edge / persist / device | รายการเยอะ · รูปเสีย · กดรัว · kill/sign-out/เครื่อง B · device back/surface · offline · TH/EN · dark | LIB-106..118 |

## §2 Test cases

ผู้ทดสอบ: อ่าน expected ก่อนรันเสมอ — เคสที่เขียน "BLOCK ถ้า..." ให้ mark BLOCK พร้อมเหตุผลใน Note (ห้าม workaround)

### Setup

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SETUP-01 | ติดตั้งแอป | — | SETUP | เครื่องจริงเครื่องหลัก | ติดตั้ง build ทดสอบที่ทีมส่งให้ → เปิดแอป | เปิดขึ้น feed หรือ onboarding | splash/หน้าแรกขึ้นตาม build | — | |
| SETUP-02 | สถานะเริ่มต้น | — | SETUP | แอปติดตั้งแล้ว | ลบข้อมูลแอป/ติดตั้งใหม่ ถ้าเคยใช้เครื่องนี้มาก่อน | แอปสะอาด เหมือนผู้ใช้ใหม่ | — | — | |
| SETUP-03 | ผู้ใช้ GUEST | — | SETUP | แอปสะอาด | ไม่ sign in → เดินเข้า feed ได้เลย | guest mode | bottom nav ครบ | — | |
| SETUP-04 | ผู้ใช้ MEMBER | — | SETUP | แอปสะอาด | sign in ด้วยบัญชีทดสอบที่ทีมสร้าง | เข้า feed เป็นสมาชิก | avatar/ชื่อตัวเองในที่ที่ต้องแสดง | — | |
| SETUP-05 | ผู้ใช้ NEW | — | SETUP | แอปสะอาด | สมัครใหม่ด้วยอีเมล/เบอร์ทดสอบจริง → ผ่าน onboarding จนเข้า feed | member ใหม่ — library ว่างเสมอ (ไม่มี saved/collections/wishlist/archive/interested/ni) | — | — | |
| SETUP-06 | ชุดข้อมูล library ของ MEMBER | MEMBER | SETUP | sign in แล้ว | ทำผ่านแอปจริงแล้วจดชื่อ/แคปชันลง Note: เซฟ 3 โพสต์ — `P-S1` = sale post · `P-S2` = โพสต์ธรรมดา · `P-S3` = โพสต์หลายรูป · สร้างคอลเลกชัน `C-A`+`C-B` (กด + บนหน้า saved) · ใส่ `P-S1` เข้า `C-A` · ใส่ `P-S2` เข้า `C-A` และ `C-B` (หลายคอลเลกชัน) · เปิด detail โพสต์ → กดของขวัญ ใส่ `P-W1`+`P-W2` ใน wish list + สร้าง wishlist col `W-A` ใส่ `P-W2` · กดถูกใจ `P-L1`+`P-L2` (เข้า Interested) · กดเมนู `ไม่สนใจ` บน `P-NI` 1 โพสต์ · สร้างโพสต์ตัวเอง 1 โพสต์ (`P-OWN`) แล้ว archive เป็น `P-ARC` | ข้อมูลจดพร้อม — สร้างสถานะไม่ได้ = เคสที่เกี่ยว `BLOCK` | — | — | |
| SETUP-07 | ทางเข้า | MEMBER | SETUP | SETUP-06 เสร็จ | own profile → เมนู → `การตั้งค่าและกิจกรรม` → เห็นกลุ่ม `คลังของคุณ` → เปิด `บันทึกแล้ว`/`สิ่งที่อยากได้`/`คลังข้อมูลที่เก็บถาวร` ทีละ row · กลับ feed → ไอคอนค้นหา → เห็นไอคอน bookmark บนหน้าค้นหา | ทุก entry เปิดหน้าถูก — เข้าไม่ได้ = เคสที่เกี่ยว BLOCK | row ตาม spec 13 | — | |
| SETUP-08 | เครื่องที่สอง + ACCT-2 | — | SETUP | มีเครื่องจริงอีกเครื่อง | ติดตั้ง build เดียวกันลงเครื่องสอง → sign in `ACCT-2` → เปิด notification permission ทั้งสองเครื่อง | บัญชีสองพร้อม — ถ้าไม่มี → เคส ACCT-2/cross-device เป็น BLOCK | — | — | |
| SETUP-09 | ACCT-2 เจ้าของโพสต์ต้นทาง | MEMBER+ACCT-2 | SETUP | SETUP-06/08 เสร็จ | เครื่องสอง: ACCT-2 สร้าง `P-X1` (sale post) + `P-X2` (โพสต์ธรรมดา) → เครื่องหลัก: MEMBER เซฟ `P-X1` ใส่ `C-A` + ใส่ `P-X2` เข้า wish list | `P-X1` อยู่ใน `C-A`/all posts · `P-X2` อยู่ wish list — ใช้เทสต้นทางเปลี่ยนสถานะ §2.8 | — | — | |
| SETUP-10 | baseline library | MEMBER | SETUP | SETUP-06/09 เสร็จ | เปิด `การตั้งค่า` จด count แต่ละ row (Saved ≥3 · Wish List ≥2 · Archive ≥1) → เปิด `saved` จดแท็บ/การ์ด/จำนวน tile → เปิด `สนใจ`/`ไม่สนใจ` จดจำนวนแถว | count/tile/row ตรงข้อมูลที่เตรียม — จุดใดไม่ตรง จดลง Note เป็นบริบทก่อนรัน | — | — | |

### 2.1 Entry & Access — ทางเข้า Library + Guest Gate

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| LIB-001 | [GATE] เข้า `saved` ผ่านไอคอน bookmark บนหน้าค้นหา | GUEST/MEMBER | GATE | SETUP-03/04 | **รอบ A (GUEST)**: feed → ไอคอนค้นหา → แตะ bookmark มุมบน → ดูหน้า · **รอบ B (MEMBER)**: ทำเหมือนกัน | A: `saved` เปิดได้เลย **ไม่มี** Member Sheet — เห็น empty state เท่านั้น (hub เปิดเสรีแต่ข้อมูลว่าง); B: `saved` เปิดเห็น tile ที่เซฟไว้ | A: `ยังไม่มีรายการที่บันทึก`/`Nothing saved yet` + copy อธิบาย; B: head `บันทึกแล้ว`/`Saved` + tile ตามจริง | HIGH | |
| LIB-002 | settings > Your library rows | MEMBER | POSITIVE | SETUP-07 | เปิด `การตั้งค่าและกิจกรรม` → อ่านกลุ่ม `คลังของคุณ`/`Your library` | 4 แถวเรียง `บันทึกแล้ว`/`Saved` · `รายการที่อยากได้`/`Wish List` · `คลังข้อมูลที่เก็บถาวร`/`Archive` · `การแจ้งเตือนนาฬิกา`/`Watch Alerts` — ตัวเลขท้ายแถวตรงจำนวนจริงของ session | ไอคอน+label+count ครบทุกแถว | HIGH | |
| LIB-003 | [GATE] guest ไม่มีทางเข้า Settings → archive/interested/ni | GUEST | GATE | SETUP-03 | เป็น guest หาทางเข้า: แตะแท็บ Profile → เจอ Member Sheet · ลองทุกทางที่เป็นไปได้หา settings/archive/interested/ni | ทุกทางตัน Member Sheet `เข้าร่วมตึกแดง`/`Join TukDaeng` — guest เข้า archive/interested/ni ไม่ได้เลย (ไม่ใช่เปิดแล้วว่าง) | sheet gate copy ตาม spec | HIGH | |
| LIB-004 | entries ของ `saved` ครบ 2 จุดเท่านั้น | MEMBER | NEGATIVE | sign in แล้ว | หาทางเข้า saved จากจุดอื่น: feed card · detail · viewer · profile · ปุ่ม `+` | **ไม่มี** entry อื่นนอกจาก settings row `บันทึกแล้ว` + ไอคอน bookmark บนหน้าค้นหา — sheet เซฟไม่พาเข้า hub | — | MED | |
| LIB-005 | entry ของ `wishlist` = settings row เท่านั้น | MEMBER | NEGATIVE | sign in แล้ว | หาทางเข้า wish list จากจุดอื่น: gift sheet บน detail · feed · หน้าค้นหา · profile | **ไม่มี** entry อื่นนอกจาก settings row `รายการที่อยากได้` — ไม่มี shortcut เหมือน `sr-saved` | — | MED | |
| LIB-006 | entry ของ `archive` = settings row เท่านั้น | MEMBER | NEGATIVE | sign in แล้ว | หาทางเข้า archive จาก feed/menu โพสต์ตัวเอง/profile/จุดอื่น | **ไม่มี** entry อื่นนอกจาก settings row `คลังข้อมูลที่เก็บถาวร` (เมนู archive ทำ action เท่านั้น ไม่พาเข้าหน้า) | — | MED | |
| LIB-007 | entry `interested`/`ni` ผ่าน content preferences | MEMBER | POSITIVE | SETUP-07 | settings → `การตั้งค่าเนื้อหา`/`Content preferences` → แตะ `สนใจ`/`Interested` → back → `ไม่สนใจ`/`Not interested` | เปิดหน้า `รายการที่สนใจ`/`Interested` และ `ไม่สนใจ`/`Not interested` ถูกทาง | head ตาม spec + back กลับ prefs | HIGH | |
| LIB-008 | ทุกหน้า library = หน้าลึก ไม่มี nav | MEMBER | NEGATIVE | sign in แล้ว | เช็กขอบล่างบน `saved` → `savedcol` → `wishlist` → `wishcol` → `archive` → `interested` → `ni` ทีละหน้า | ทุกหน้าไม่มี bottom nav (sub page ทับเต็มจอ) — เจอ nav หลุดที่ไหน = FAIL | — | HIGH | |
| LIB-009 | back จาก `saved` → หน้าก่อนหน้าจุดเดิม | MEMBER | STATE | เข้า `saved` จาก settings | settings scroll ลงกลาง ๆ → เปิด `บันทึกแล้ว` → back → ทำซ้ำโดยเข้าจาก bookmark บนหน้าค้นหา | กลับ settings ตำแหน่ง scroll เดิม / กลับหน้าค้นหา landing เดิม — ไม่เด้งหน้าอื่น | — | MED | |
| LIB-010 | [GATE] ปุ่ม bookmark/gift/เมนูการ์ด บน surface หลัก | GUEST/MEMBER | GATE | SETUP-03/04 | **รอบ A (GUEST)**: แตะ bookmark บน feed card → ปิด sheet → เปิด detail แตะของขวัญ → ปิด → แตะ `⋯` บนการ์ด (ทางเข้าไม่สนใจ/mute/รายงาน) · **รอบ B (MEMBER)**: ทำเหมือนกัน | A: ทุกครั้งเจอ Member Sheet — ไม่มี state เปลี่ยน; B: เซฟ/เข้า wish list จริง + sheet เลือกปลายทางเปิด + เมนูโพสต์เปิดได้ | A: sheet gate; B: ไอคอนเต็ม + sheet เปิด + เมนูขึ้น | HIGH | |

### 2.2 Saved Hub — Tabs / Grid / Search / Manage

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| LIB-011 | `saved` anatomy | MEMBER | UI | `saved` เปิดมีข้อมูล | อ่านหน้าบน-ล่าง | head: back + `บันทึกแล้ว`/`Saved` + ไอคอนค้นหา + ไอคอน `+` · tabs `ทั้งหมด`/`คอลเลกชัน`/`โพสต์` (All/Collections/Posts) · section `คอลเลกชัน`+`ดูทั้งหมด` · section `โพสต์ทั้งหมด`+`จัดการ` · grid — **ไม่มี bottom nav** | layout ครบทุกส่วน | HIGH | |
| LIB-012 | สลับ 3 tabs | MEMBER | POSITIVE | `saved` เปิด | แตะ `คอลเลกชัน` → `โพสต์` → `ทั้งหมด` | คอลเลกชัน = การ์ดใหญ่ทุกคอลเลกชัน; โพสต์ = grid เฉพาะโพสต์ (ไม่มี section คอลเลกชัน); ทั้งหมด = sections ทั้งสอง | tab active เปลี่ยนตาม | HIGH | |
| LIB-013 | section คอลเลกชัน ≤4 การ์ด + See all | MEMBER | POSITIVE | มี col ≥5 (สร้างเพิ่มผ่านแอป — ไม่ได้ → `BLOCK`) | แท็บ `ทั้งหมด` → นับการ์ดคอลเลกชัน → แตะ `ดูทั้งหมด`/`See all` | section แสดงสูงสุด 4 การ์ด; `ดูทั้งหมด` พาไปแท็บ `คอลเลกชัน` เห็นครบ | — | MED | |
| LIB-014 | การ์ดคอลเลกชัน | MEMBER | UI | มี `C-A` มีของ + `C-B` ว่างหรือน้อย | ดูการ์ด col | cover = รูปโพสต์ล่าสุดใน col (หรือรูปที่ตั้งเป็น cover) · ชื่อ col · `ส่วนตัว`/`Private` + ไอคอนล็อก; col ว่าง = ไอคอน bookmark แทนรูป | — | MED | |
| LIB-015 | grid เรียงเซฟล่าสุดก่อน | MEMBER | POSITIVE | เซฟหลายตัว | จำ tile บนสุด → กลับ feed เซฟโพสต์ใหม่ → เปิด `saved` อีกครั้ง | โพสต์ที่เพิ่งเซฟอยู่ tile แรก — ลำดับตามเวลาเซฟ ใหม่→เก่า | — | MED | |
| LIB-016 | tile หลายรูปมี stack icon | MEMBER | UI | `P-S3` หลายรูปอยู่ใน saved | ดู tile `P-S3` เทียบ tile รูปเดียว → เข้า manage ดูอีกที | tile หลายรูปมีไอคอน stack มุมขวาบน · รูปเดียวไม่มี · โหมดเลือก icon เปลี่ยนเป็นวงกลมติ๊ก | — | LOW | |
| LIB-017 | tile → Post Viewer (feed mode) | MEMBER | POSITIVE | `saved` เปิด | แตะ tile `P-S1` → ปัดขึ้น/ลงดูโพสต์ถัดไป | เปิด Post Viewer หัวข้อ `Saved` · ปัดได้ภายในลิสต์ที่เซฟ (ลำดับตาม grid) · ไม่ใช่ feed ทั่วไป | — | HIGH | |
| LIB-018 | viewer→detail→กลับ hub จุดเดิม | MEMBER | STATE | เปิด viewer จาก tile | viewer → `ดูรายละเอียดเต็ม`/`View full detail` → detail → back → back | detail เปิดทับ viewer · detail-back เผย viewer เดิม · back จาก viewer กลับ `saved` แท็บ+scroll เดิม | — | HIGH | |
| LIB-019 | Manage → select mode | MEMBER | POSITIVE | `saved` มีของ | แตะ `จัดการ`/`Manage` | เข้าโหมดเลือก: head `ยกเลิก`/`Cancel` + `โพสต์ทั้งหมด`/`All posts` + `เลือกทั้งหมด`/`Select all` · แถบล่าง `ยกเลิกการบันทึก`/`Unsave` + `เพิ่มลงในคอลเลกชัน`/`Add to collection` — ทั้งคู่ disabled จนกว่าเลือก ≥1 | tile มีวงกลมเลือก | HIGH | |
| LIB-020 | เลือกหลายตัว + Select all | MEMBER | POSITIVE | select mode เปิด | แตะ tile 2 ตัว → แตะ `เลือกทั้งหมด` → `ยกเลิกการเลือกทั้งหมด` | ปุ่มแถบล่างเปิดเมื่อเลือก ≥1 · Select all เลือกครบทุก tile → ป้ายเปลี่ยน `Deselect all` → กดซ้ำล้างทั้งหมด | — | MED | |
| LIB-021 | long-press tile → manage | MEMBER | EDGE | `saved` เปิด | กดค้างบน tile 1 ตัว | เข้าโหมดเลือกทันที + tile ที่กดถูกเลือก (วงกลมติ๊ก) | — | MED | |
| LIB-022 | search mode live filter | MEMBER | POSITIVE | `saved` มีของ | แตะไอคอนค้นหา → พิมพ์ชื่อ/แคปชันโพสต์ที่มีจริง | เปลี่ยนเป็นหน้าค้นหา: ช่อง `ค้นหารายการที่บันทึกไว้`/`Search your saved` + `ยกเลิก` — ผล grid กรองตามที่พิมพ์ทันที (match ชื่อคนขาย/แคปชัน/สเปก) | — | HIGH | |
| LIB-023 | search ไม่เจอ | MEMBER | NEGATIVE | search mode เปิด | พิมพ์คำที่ไม่มีใน saved | `ไม่พบผลลัพธ์`/`No results found` + `ไม่มีโพสต์ที่บันทึกไว้ตรงกับ "{q}"`/`No saved posts match "{q}".` | — | MED | |
| LIB-024 | ออกจาก search mode | MEMBER | STATE | search mode มี q | แตะ `ยกเลิก`/`Cancel` | ปิดช่องค้นหา กลับหน้า `saved` เดิม — ไม่ pop ออกจาก hub ทั้งหน้า | — | MED | |
| LIB-025 | empty saved (NEW) | NEW | POSITIVE | account ใหม่ | เปิด `saved` | ไอคอน bookmark + `ยังไม่มีรายการที่บันทึก`/`Nothing saved yet` + `บันทึกโพสต์ที่คุณต้องการดูอีกครั้ง คุณเท่านั้นที่เห็นสิ่งที่คุณบันทึกไว้`/`Save posts you want to see again. Only you can see what you've saved.` | — | HIGH | |
| LIB-026 | empty collections (NEW) | NEW | POSITIVE | account ใหม่ | `saved` → แท็บ `คอลเลกชัน` | `ยังไม่มีคอลเลกชัน`/`No collections yet` + `สร้างคอลเลกชันเพื่อจัดระเบียบโพสต์ที่บันทึกไว้ของคุณ`/`Create a collection to organise your saved posts.` | — | MED | |
| LIB-027 | `+` บน head → new collection sheet | MEMBER | POSITIVE | `saved` เปิด | แตะ `+` → พิมพ์ชื่อ `C-EMPTY` → Next | sheet สร้างคอลเลกชันเปิด → col ใหม่เกิด (ว่าง) โผล่ในแท็บ `คอลเลกชัน` | — | MED | |
| LIB-028 | unsave จนหมด → กลับ empty | MEMBER | STATE | `saved` มีของ | manage → Select all → `ยกเลิกการบันทึก` → ยืนยัน | โพสต์ทั้งหมดหลุด saved → hub กลับ `ยังไม่มีรายการที่บันทึก` + count บน settings row = 0 | — | MED | |
| LIB-029 | unsave จากใน viewer → tile หาย | MEMBER | STATE | tile→viewer เปิด | viewer → แตะ bookmark → sheet → แตะแถว `Saved` ถอด → ปิด viewer | โพสต์ unsave → กลับ hub tile นั้นหาย (grid อัปเดต) | — | MED | |

### 2.3 Save Sheet (`sv`) + New Collection (`nc`)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| LIB-030 | กด bookmark ครั้งแรก | MEMBER | POSITIVE | โพสต์ยังไม่เซฟ | feed → แตะ bookmark บนการ์ด | โพสต์ saved ทันที + ไอคอนเปลี่ยนเป็นเต็ม + **sheet เปิดเสมอ** (ให้เลือกปลายทาง) — ไม่มี toast ตอนกดครั้งแรก | sheet head `Saved`/`Private` | HIGH | |
| LIB-031 | กด bookmark ซ้ำบนของที่เซฟแล้ว | MEMBER | POSITIVE | โพสต์ saved แล้ว | แตะ bookmark อีกครั้ง | **sheet เปิดอีก** — ไม่ unsave ทันที (เอาออกทำได้ใน sheet/จัดการ เท่านั้น) | — | HIGH | |
| LIB-032 | save sheet anatomy | MEMBER | UI | sheet เปิด | อ่าน sheet | แถวหัว `Saved`+`Private`+รูปโพสต์+bookmark เต็ม · section `Collections` + `New collection` · แถวแต่ละ col (cover/ไอคอน + ชื่อ + `Private` + เครื่องหมายถูกบน col ที่โพสต์อยู่) | — | HIGH | |
| LIB-033 | แตะแถวหัว `Saved` → unsave | MEMBER | POSITIVE | sheet เปิดบนโพสต์ที่ saved | แตะแถวหัว `Saved` | โพสต์ unsave ทั้งหมด (ออกทุก col) + toast `Removed from your saved` + ไอคอน bookmark ว่างทุก surface | — | HIGH | |
| LIB-034 | แตะ col → เข้า col | MEMBER | POSITIVE | sheet เปิด + มี `C-A` | แตะ `C-A` | โพสต์เข้า `C-A` + toast `Saved to C-A` + sheet ปิด · เปิด `savedcol C-A` เจอ tile | — | HIGH | |
| LIB-035 | multi-collection — อยู่ 2 col พร้อมกัน | MEMBER | POSITIVE | `P-S1` อยู่ `C-A` แล้ว | เปิด sheet → แตะ `C-B` → เปิด sheet อีกครั้งดูเครื่องหมาย | เข้า `C-B` เพิ่ม **โดยยังอยู่ `C-A`** — เครื่องหมายถูก 2 แถวพร้อมกัน · tile โผล่ทั้ง `savedcol C-A` และ `C-B` | — | HIGH | |
| LIB-036 | แตะ col ที่อยู่แล้ว → เอาออกเฉพาะ col นั้น | MEMBER | POSITIVE | `P-S1` อยู่ `C-A`+`C-B` | เปิด sheet → แตะ `C-A` | ออกจาก `C-A` เท่านั้น — ยัง saved + ยังอยู่ `C-B` + toast `Removed from C-A` | — | HIGH | |
| LIB-037 | nc sheet anatomy + Next gate | MEMBER | UI | sheet → `New collection` | อ่าน sheet → ดู `Next` → พิมพ์ตัวอักษร → ลบ | head `Cancel`+`New collection`+`Next` (disabled ตอนช่องว่าง) · ช่อง `Collection name` + counter `0 / 40` · พิมพ์ → `Next` เปิด + counter เปลี่ยน · clear-X เคลียร์ช่อง | — | HIGH | |
| LIB-038 | nc สร้างจาก save flow | MEMBER | POSITIVE | sheet → `New collection` | พิมพ์ `C-NEW` → `Next` | col `C-NEW` เกิด + โพสต์เข้า col นั้น + toast `Saved to C-NEW` · เปิด `saved` เห็นการ์ดใหม่ | — | HIGH | |
| LIB-039 | nc จาก move → ปุ่ม Save + preview | MEMBER | POSITIVE | manage เลือก ≥1 → ย้าย → `New collection` | ดู sheet | ปุ่มเป็น `Save` (ไม่ใช่ Next) + รูป preview โพสต์แรกที่เลือกอยู่ใต้ head | — | MED | |
| LIB-040 | nc Cancel | MEMBER | STATE | nc เปิด (จาก save flow / จาก + บน hub) | แตะ `Cancel` ทีละจุด | จาก save flow → กลับ sheet เซฟเดิม; จาก hub → sheet ปิด กลับหน้าเดิม — ไม่สร้าง col | — | MED | |
| LIB-041 | ชื่อ >40 ตัว / ช่องว่าง | MEMBER | EDGE | nc เปิด | พิมพ์ชื่อยาวเกิน 40 → พิมพ์ช่องว่างล้วน | ชื่อตัดที่ 40 ตัวอักษร · ช่องว่างล้วน → `Next` ยัง disabled | counter `40 / 40` สูงสุด | LOW | |
| LIB-042 | ชื่อซ้ำกับ col เดิม | MEMBER | EDGE | มี `C-A` แล้ว | สร้าง col ชื่อ `C-A` อีกอันผ่าน `+` | ระบบสร้างได้ — สองคอลเลกชันชื่อเดียวกันเป็นอิสระต่อกัน (ตามพฤติกรรมที่ล็อก) | — | LOW | |
| LIB-043 | save จากทุก entry point | MEMBER | POSITIVE | โพสต์ใหม่ยังไม่เซฟ | เซฟโพสต์เดียวกันทีละจุด: feed card → detail → viewer rail → การ์ดบนโปรไฟล์ (ทีละโพสต์ 4 ตัว) | ทุกจุดเปิด sheet รูปแบบเดียวกัน + ผล saved เหมือนกัน + ไอคอนเต็ม sync | — | HIGH | |
| LIB-044 | sync ไอคอนข้าม surface | MEMBER | STATE | เซฟ `P-S1` แล้ว | เซฟจาก detail → กลับ feed ดูการ์ด → เปิด viewer rail → เปิด `saved` | bookmark เต็มทุก surface ของโพสต์เดียวกัน + tile อยู่ใน hub | — | HIGH | |
| LIB-045 | ปิด sheet ด้วย backdrop/device back | MEMBER | STATE | sheet เปิด | แตะ scrim → เปิดใหม่ → device back | ทั้งสองวิธีปิดเฉพาะ sheet — หน้าเดิมอยู่ ไม่กลับหน้า | — | MED | |

### 2.4 Collection Page — `savedcol`

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| LIB-046 | `savedcol` anatomy | MEMBER | UI | เปิด `C-A` มีของ | อ่านหน้า | head: back + ชื่อ col + ไอคอนค้นหา + `⋯` · title ชื่อ + `N saved posts` (ตามภาษา) · grid — ไม่มี nav | — | HIGH | |
| LIB-047 | tile → viewer ภายใน col เท่านั้น | MEMBER | POSITIVE | `C-A` มี ≥2 ตัว | แตะ tile → ปัดขึ้น/ลง | viewer swipe เฉพาะโพสต์ใน `C-A` (ไม่หลุดไปโพสต์ saved อื่น) | — | MED | |
| LIB-048 | `⋯` menu | MEMBER | POSITIVE | `savedcol` เปิด | แตะ `⋯` → อ่านเมนู → col ว่างเปรียบเทียบ | เมนู: `Add to collection` · `Edit collection` · `Select...` (**เฉพาะ col มีของ**) · `Delete collection` (สีอันตราย) · แตะนอกเมนู → ปิด | — | HIGH | |
| LIB-049 | Add to collection picker | MEMBER | POSITIVE | `C-A` มีของ + มี saved ตัวอื่นอยู่นอก | `⋯` → `Add to collection` → ติ๊ก 2 tile → `Done` | หน้าเต็ม picker: `Cancel` + `Saved · Add from` + `Done` · grid เฉพาะโพสต์ saved ที่**ยังไม่อยู่** `C-A` · ติ๊ก → title เปลี่ยน `N Selected` · Done → เข้า `C-A` + toast `Added 2 posts` | — | HIGH | |
| LIB-050 | picker empty | MEMBER | NEGATIVE | saved ทุกตัวอยู่ `C-A` หมดแล้ว (หรือยังไม่เคยเซฟ — เตรียมผ่านแอป) | `⋯` → `Add to collection` | `No saved posts to add` + `Save more posts first, then add them here.` (ตามภาษา) | — | MED | |
| LIB-051 | Edit collection anatomy | MEMBER | UI | `⋯` → `Edit collection` | อ่านหน้า | `Cancel` + `Edit collection` + `Done` · cover + `Change cover` · ช่อง `Collection name` (≤40) · `Delete collection` + note `When you delete this collection, the photos and videos will still be saved.` (ตามภาษา) | — | MED | |
| LIB-052 | rename | MEMBER | POSITIVE | Edit เปิด | แก้ชื่อ `C-A` → `C-A2` → `Done` → กลับ hub ดูการ์ด → เปิด sheet เซฟของโพสต์ใน col | ชื่อเปลี่ยนทุกจุด (head/การ์ด/เช็กบน sheet) + toast `Collection updated` — โพสต์ไม่หลุด | — | MED | |
| LIB-053 | Change cover | MEMBER | POSITIVE | `C-A` มี ≥2 รูป | Edit → `Change cover` → เลือกโพสต์อื่น → กลับดูการ์ด | picker grid เฉพาะโพสต์ใน col + ติ๊กบน cover ปัจจุบัน → เลือก → กลับ Edit + cover การ์ดเปลี่ยนเป็นรูปที่เลือก | — | MED | |
| LIB-054 | Delete collection | MEMBER | POSITIVE | `savedcol` เปิด | `⋯`/`Edit` → `Delete collection` → อ่าน dlg → `Delete` | dlg `Delete collection?` + note โพสต์ยังบันทึก + `Delete`/`Cancel` → ยืนยัน: col หาย + โพสต์ยังอยู่ `saved` แท็บทั้งหมด + กลับ hub + toast `Collection deleted` | — | HIGH | |
| LIB-055 | Select → Remove (ใน col) | MEMBER | POSITIVE | `C-A` มี ≥2 | `⋯` → `Select...` → เลือก 1 → `ลบออก`/`Remove` → อ่าน dlg → `Remove` | dlg `Remove from this collection?` + `Post will still be saved in all posts.` → ยืนยัน: tile หลุด `C-A` แต่**ยัง saved** อยู่ all posts + toast `Removed from C-A` | — | HIGH | |
| LIB-056 | Select → Move to collection | MEMBER | POSITIVE | `C-A` มีของ + `C-B` | select ≥1 → `ย้ายไปคอลเลกชัน`/`Move to collection` → เลือก `C-B` | sheet รายชื่อ col **ไม่มี `C-A`** + `New collection` → เลือก: โพสต์หลุด `C-A` เข้า `C-B` + toast `Moved to C-B` | — | HIGH | |
| LIB-057 | Move → New collection | MEMBER | POSITIVE | เลือก ≥1 → move sheet → `New collection` | พิมพ์ `C-MOV` → `Save` | col ใหม่เกิด + โพสต์อยู่แค่ `C-MOV` (หลุดทุก col เดิม) + toast `Moved to C-MOV` + preview รูปบน sheet | — | MED | |
| LIB-058 | search ใน col | MEMBER | POSITIVE | `savedcol` เปิด | ไอคอนค้นหา → พิมพ์คำที่เจอ/ไม่เจอ | กรองเฉพาะโพสต์ใน `C-A` · ไม่เจอ → `No results found` + `No saved posts match "{q}".` (ตามภาษา) | — | MED | |
| LIB-059 | col ว่าง | MEMBER | POSITIVE | `C-EMPTY` สร้างแล้วยังไม่ใส่ของ (SETUP LIB-027) | เปิด `C-EMPTY` | `No saved posts yet` (ตามภาษา) — ไม่มี title นับจำนวน | — | MED | |
| LIB-060 | cover fallback เมื่อโพสต์ออก | MEMBER | EDGE | `C-A` cover = tile แรก | เอาโพสต์ที่เป็น cover ออกจาก `C-A` → กลับ hub ดูการ์ด | cover เปลี่ยนเป็นรูปโพสต์ตัวอื่นใน col อัตโนมัติ (โพสต์ล่าสุดที่เหลือ) · ไม่มีของเหลือ → ไอคอน bookmark | — | MED | |
| LIB-061 | Unsave ทั้ง col แล้ว col ยังอยู่ | MEMBER | STATE | `C-A` มีของ | select all → `ลบออก` ยืนยัน → กลับ hub แท็บคอลเลกชัน | โพสต์หลุด `C-A` ทั้งหมด แต่ `C-A` ยังเป็น col ว่างอยู่ (ไม่ถูกลบ) | — | MED | |
| LIB-062 | long-press tile ใน col | MEMBER | EDGE | `savedcol` มีของ | กดค้าง tile 1 ตัว | เข้า select mode + tile นั้นถูกเลือก | — | LOW | |
| LIB-063 | ชื่อ col ยาว 40 | MEMBER | EDGE | สร้าง col ชื่อยาวสุด | ดูการ์ด + head `savedcol` | ชื่อแสดงครบหรือตัดแบบไม่ล้น layout — ไม่ทับปุ่ม/หลุดจอ | — | LOW | |

### 2.5 Wish List — `wl` Sheet + `wishlist` Hub + `wishcol`

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| LIB-064 | gift icon เฉพาะ Post Detail | MEMBER | NEGATIVE | sign in แล้ว | หาไอคอนของขวัญบน: feed card · viewer rail · การ์ดโปรไฟล์ → เปรียบกับ Post Detail | **มีเฉพาะ Post Detail** (มุมขวาแถว action เดียวกับ bell) — surface อื่นไม่มี | — | HIGH | |
| LIB-065 | กด gift ครั้งแรก | MEMBER | POSITIVE | detail โพสต์ยังไม่อยู่ wish list | แตะของขวัญ | โพสต์เข้า wish list + ไอคอนเต็ม + **wl sheet เปิดเสมอ** — ไม่มี toast ตอนกดครั้งแรก | sheet head `Wish List`/`Private` + gift เต็ม | HIGH | |
| LIB-066 | wl sheet anatomy | MEMBER | UI | wl sheet เปิด | อ่าน sheet | แถวหัว `Wish List`/`Private`+รูป+ไอคอนของขวัญเต็ม · `Collections` + `New collection` · แถว col + เช็กบน col ที่อยู่ | — | MED | |
| LIB-067 | แตะแถวหัว `Wish List` → เอาออกทั้งหมด | MEMBER | POSITIVE | โพสต์อยู่ wish list | เปิด wl sheet → แตะแถวหัว | ออกจาก wish list ทั้งหมด (ทุก col) + toast `Removed from your wish list` + ไอคอนว่าง | — | HIGH | |
| LIB-068 | pick col + multi-col + เอาออก | MEMBER | POSITIVE | `P-W1` อยู่ wish list + มี `W-A` | sheet → แตะ `W-A` → เปิดอีกครั้ง → แตะ `W-A` ซ้ำ | แตะครั้งแรก: เข้า `W-A` + toast `Added to W-A` + เช็ก; แตะซ้ำ: ออก `W-A` แต่**ยังอยู่ wish list** + toast `Removed from W-A` — multi-col เหมือน saved | — | HIGH | |
| LIB-069 | wl New collection | MEMBER | POSITIVE | wl sheet → `New collection` | พิมพ์ `W-NEW` → Next | col ใหม่ใน wish list + โพสต์เข้า + toast `Added to W-NEW` — แยกจาก COLLECTIONS ของ saved สมบูรณ์ | — | MED | |
| LIB-070 | `wishlist` hub anatomy | MEMBER | UI | `wishlist` เปิดมีของ | อ่านหน้า | head `สิ่งที่อยากได้`/`Wish List` + ค้นหา + `+` · tabs เดียวกัน 3 อัน · section `คอลเลกชัน` + `รายการทั้งหมด`/`All items` + `จัดการ` — ไม่มี nav | — | HIGH | |
| LIB-071 | wishlist empty (NEW) | NEW | POSITIVE | account ใหม่ | เปิด `wishlist` | ไอคอนของขวัญ + `ยังไม่มีรายการในสิ่งที่อยากได้`/`Nothing on your wish list yet` + `แตะไอคอนของขวัญในหน้ารุ่นนาฬิกาเพื่อเพิ่มที่นี่`/`Tap the gift icon on a model page to add it here.` | — | HIGH | |
| LIB-072 | `wishcol` anatomy + menu | MEMBER | POSITIVE | เปิด `W-A` มีของ | อ่านหน้า + `⋯` | head ชื่อ + ค้นหา + `⋯` · title `N items` (ตามภาษา) · เมนูชุดเดียวกับ savedcol (Add/Edit/Select/Delete + cover/rename) | — | MED | |
| LIB-073 | wishcol Remove (ยังอยู่ wish list) | MEMBER | POSITIVE | `W-A` มีของ | select ≥1 → `ลบออก` → อ่าน dlg → ยืนยัน | dlg `Remove from this collection?` + `Post will still be on your wish list.` → tile หลุด `W-A` แต่ยังอยู่ all items + toast `Removed from W-A` | — | MED | |
| LIB-074 | unsave จาก wish list ทั้งหมด | MEMBER | POSITIVE | `wishlist` มีของ | จัดการ → เลือก ≥1 → `ลบออก`/`Remove` → อ่าน dlg → ยืนยัน | dlg `Remove from wish list?` + `Removing this post will also remove it from any collections.` → ออก wish list ทั้งหมด + toast `Removed from Wish List` | — | HIGH | |
| LIB-075 | tile → viewer title Wish List | MEMBER | POSITIVE | `wishlist` เปิด | แตะ tile → ปัด | viewer feed mode หัวข้อ `Wish List` swipe ในลิสต์ wish list | — | MED | |
| LIB-076 | search ใน wish list | MEMBER | POSITIVE | `wishlist` มีของ | ไอคอนค้นหา → พิมพ์เจอ/ไม่เจอ | กรองเฉพาะ wish list · ไม่เจอ → `No results found` + `No wish list posts match "{q}".`/`ไม่มีรายการในสิ่งที่อยากได้ตรงกับ "{q}"` · ช่อง `Search your wish list`/`ค้นหาสิ่งที่อยากได้ของคุณ` | — | MED | |
| LIB-077 | Saved กับ Wish List แยกระบบ | MEMBER | POSITIVE | `P-S1` saved + `P-W1` wish listed | เซฟ `P-W1` ด้วย → เอา `P-W1` ออกจาก wish list → เช็ก `saved` | โพสต์เดียวอยู่ทั้งสองฝั่งได้ · เอาออกฝั่งหนึ่งไม่กระทบอีกฝั่ง — คอลเลกชันคนละชุด | — | HIGH | |
| LIB-078 | wishlist collections tab empty | NEW | POSITIVE | account ใหม่ | `wishlist` → แท็บ `คอลเลกชัน` | `ยังไม่มีคอลเลกชัน`/`No collections yet` + `Create a collection to organise your wish list posts.` (ตามภาษา) | — | LOW | |

### 2.6 Archive — `archive`

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| LIB-079 | archive โพสต์ตัวเอง | MEMBER | POSITIVE | มีโพสต์ตัวเองบน feed/profile | `⋯` บนโพสต์ตัวเอง → `Archive` | โพสต์หลุด feed + profile grid ทันที + pins ทั้งหมดถูกล้าง + toast `Post archived` → เข้า `archive` | — | HIGH | |
| LIB-080 | `archive` anatomy | MEMBER | UI | `archive` มีของ | อ่านหน้า | head back + `คลังเก็บ`/`Archive` (ไม่มี ⋯/menu) · note `คุณเท่านั้นที่สามารถดูโพสต์ที่คุณจัดเก็บไว้`/`Only you can see posts you've archived` · grid **เรียง archived ล่าสุดก่อน** — ไม่มี nav | — | HIGH | |
| LIB-081 | archive empty | MEMBER/NEW | POSITIVE | ไม่มีโพสต์ archived | เปิด `archive` | ไอคอน history + `ไม่มีโพสต์ในคลังเก็บ`/`No archived posts` + `โพสต์ที่คุณจัดเก็บจะแสดงให้คุณเห็นเท่านั้น`/`Posts you archive will only be visible to you.` | — | MED | |
| LIB-082 | tile → viewer title Archive | MEMBER | POSITIVE | `archive` มี ≥2 | แตะ tile → ปัด | viewer feed mode หัวข้อ `Archive` swipe ในลิสต์ archived | — | MED | |
| LIB-083 | unarchive → กลับ feed | MEMBER | POSITIVE | `P-ARC` archived | archive viewer/หน้า archive → เมนูโพสต์ → `Unarchive` → เช็ก feed + profile grid + pins | โพสต์กลับ feed+grid ตาม eligibility + toast `Post unarchived` — **pin ไม่กลับ** (ต้องปักใหม่) | — | HIGH | |
| LIB-084 | หน้า archive refresh หลัง unarchive | MEMBER | STATE | `archive` เปิดอยู่ | unarchive โพสต์จากเมนูใน viewer → ปิด viewer กลับหน้า archive | tile หายจาก grid เหลือเฉพาะที่ยัง archived | — | MED | |
| LIB-085 | settings row count ตามจำนวน archived | MEMBER | STATE | SETUP-10 จด count | archive เพิ่ม 1 → กลับ settings ดู row → unarchive → ดูอีกที | count ขึ้น/ลงตามจำนวน archived จริง | — | MED | |
| LIB-086 | เจ้าของ archive → หลุด library คนเซฟ | MEMBER+ACCT-2 | POSITIVE | SETUP-09: MEMBER เซฟ `P-X1` ของ ACCT-2 | เครื่องสอง: ACCT-2 archive `P-X1` → เครื่องหลัก: เปิด `saved` + `C-A` ใหม่ | tile `P-X1` หายจาก all posts + `C-A` ของ MEMBER (sync ตาม server — ถ้าค้าง ให้ปิด/เปิดหน้าใหม่แล้วต้องหาย) | — | HIGH | |
| LIB-087 | archive โพสต์ตัวเองที่ตัวเองเซฟ | MEMBER | POSITIVE | โพสต์ตัวเองที่เซฟไว้ (สร้าง+เซฟผ่านแอปจริง) | archive โพสต์นั้น → เปิด `saved` → unarchive → เปิด `saved` อีกครั้ง | ตอน archived: tile หายจาก saved (archive rule — หลุด tiles ที่อ้างถึง) · ตอน unarchive: tile **กลับมา**ใน saved เพราะ archive ไม่ลบสถานะเซฟ (กลับ eligibility เดิม) | — | MED | |

### 2.7 Interested + Not Interested — `interested` / `ni`

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| LIB-088 | `interested` anatomy | MEMBER | UI | SETUP-06 มี `P-L1/P-L2` | settings → การตั้งค่าเนื้อหา → `สนใจ` → อ่านหน้า | head back + `รายการที่สนใจ`/`Interested` · แถว = รูปโพสต์ + ชื่อคนขาย + แคปชัน + ปุ่ม `ลบออก`/`Remove` — ไม่มี nav | — | HIGH | |
| LIB-089 | like → เข้า list · ลบออก → unlike | MEMBER | POSITIVE | `interested` เปิด | จดจำนวน → กลับ feed กดถูกใจโพสต์ใหม่ → เปิด list → `ลบออก` บน `P-L1` → เช็กยอดถูกใจบนการ์ด | โพสต์ที่เพิ่งถูกใจเข้า list · `ลบออก` = เอาถูกใจออก → แถวหาย + ยอดถูกใจโพสต์ลด 1 (ไม่ติดลบ) + หัวใจบนการ์ดว่าง | — | HIGH | |
| LIB-090 | แตะแถว → เปิดโพสต์ | MEMBER | POSITIVE | `interested` มีแถว | แตะแถว (ไม่ใช่ปุ่ม `ลบออก`) → back | เปิดโพสต์ตัวนั้น (Post Viewer feed mode เหมือน tile คลังอื่น) — **ไม่ใช่**โปรไฟล์คนขาย (ล็อก 2026-10-29) | — | MED | |
| LIB-091 | `interested` empty | NEW | POSITIVE | account ใหม่ | เปิด `สนใจ` | `ยังไม่มีข้อมูลที่นี่`/`Nothing here yet` | — | MED | |
| LIB-092 | `ni` anatomy | MEMBER | UI | SETUP-06 มี `P-NI` | `ไม่สนใจ` → อ่านหน้า | head back + `ไม่สนใจ`/`Not interested` · แถวเดียวกับ interested + ปุ่ม `คืนค่า`/`Restore` — ไม่มี nav | — | HIGH | |
| LIB-093 | mark ไม่สนใจ → เข้า ni list | MEMBER | POSITIVE | feed มีโพสต์คนอื่น | `⋯` บนการ์ด → `ไม่สนใจ` → ดูการ์ด → เปิด `ไม่สนใจ` | การ์ดเปลี่ยนเป็น thanks card (`ขอบคุณสำหรับความคิดเห็น`/`Thanks for your feedback` + `Undo` + ตัวเลือก mute/unfollow/manage prefs + `This post made me uncomfortable`) · โพสต์เข้า ni list · หลัง re-render หลุด feed | — | HIGH | |
| LIB-094 | คืนค่า → กลับ feed | MEMBER | POSITIVE | `ni` มี `P-NI` | `คืนค่า` บนแถว → กลับ feed เลื่อนหา | โพสต์หลุด ni list + กลับแสดง feed อีกครั้งตาม eligibility (ไม่บังคับบนสุด) | — | HIGH | |
| LIB-095 | `ni` empty | NEW | POSITIVE | account ใหม่ | เปิด `ไม่สนใจ` | `ยังไม่มีข้อมูลที่นี่`/`Nothing here yet` | — | MED | |
| LIB-096 | เรียงล่าสุดก่อน | MEMBER | POSITIVE | กดถูกใจ/ไม่สนใจ หลายตัวต่างเวลา | กดถูกใจโพสต์ใหม่ → เปิด `สนใจ` ดูแถวบนสุด (ทำซ้ำกับ ni) | รายการที่เพิ่งกดอยู่บนสุด — เรียงเวลากด ใหม่→เก่า | — | MED | |
| LIB-097 | back → prefs จุดเดิม | MEMBER | STATE | `interested` เปิด | back → back | กลับ `การตั้งค่าเนื้อหา` เดิม → อีกครั้งกลับ settings จุดเดิม | — | LOW | |

### 2.8 Source-State Changes + Cross-Surface Sync

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| LIB-098 | ต้นทางขายแล้ว → tile อยู่+เปิดได้ | MEMBER+ACCT-2 | POSITIVE | SETUP-09 | เครื่องสอง: ACCT-2 mark `P-X1` ขายแล้ว → เครื่องหลัก: เปิด `saved`/`C-A` → แตะ tile `P-X1` | tile ยังอยู่ + เปิด viewer ได้ปกติ เห็นโพสต์สถานะขายแล้ว (ตามล็อก — โพสต์ยังมีตัวตน) | — | HIGH | |
| LIB-099 | ต้นทางถูกซ่อน (Hide) → tile หาย | MEMBER+ACCT-2 | POSITIVE | SETUP-09 (ACCT-2 เพิ่ม `P-X3` sale → MEMBER เซฟ) | เครื่องสอง: ACCT-2 เปลี่ยน `P-X3` เป็น Hide → เครื่องหลัก: เปิด `saved` ใหม่ | tile `P-X3` หายจาก hub + ทุก col ที่อยู่ (sync ตาม server) | — | HIGH | |
| LIB-100 | ต้นทางถูกลบ → หาย + เปิดค้างเจอไม่พร้อมใช้งาน | MEMBER+ACCT-2 | POSITIVE | เครื่องหลักเปิด viewer ของ `P-X2` จาก wish list ค้างไว้ | เครื่องสอง: ACCT-2 ลบ `P-X2` → เครื่องหลัก: ปิด/เปิด `wishlist` ใหม่ + บน viewer ที่ค้าง แตะ `View full detail`/รีเฟรช | tile หายจาก wish list · ทางเปิดที่ค้าง (viewer/detail เดิม) แสดง `รายการนี้ไม่พร้อมใช้งานแล้ว`/`This post is no longer available` — ไม่แสดงข้อมูลเก่า | — | HIGH | |
| LIB-101 | เจ้าของบล็อกเรา → tile หาย | MEMBER+ACCT-2 | POSITIVE | MEMBER เซฟโพสต์ `P-X4` ของ ACCT-2 (เตรียมเพิ่มผ่านแอป) | เครื่องสอง: ACCT-2 block MEMBER → เครื่องหลัก: เปิด `saved` ใหม่ | tile `P-X4` หาย (ของที่มองไม่เห็นแล้วไม่ค้างในคลัง) | — | MED | |
| LIB-102 | count badge + hub อัปเดตตามจริง | MEMBER | STATE | SETUP-10 จด count | เซฟเพิ่ม 1 / เอาออก 1 → กลับ settings ดู row `Saved` | count ขึ้น/ลงตามจำนวน saved จริงเสมอ | — | MED | |
| LIB-103 | unsave จาก viewer ที่เปิดจาก col | MEMBER | STATE | เปิด viewer จาก `savedcol` | viewer → แตะ bookmark → แตะ `Saved` ถอด → ปิด viewer | tile หายจาก col + all posts — grid อัปเดต | — | MED | |
| LIB-104 | ni/mute ไม่กระทบ library | MEMBER | POSITIVE | เซฟ `P-S1` ไว้ + mark ni โพสต์ `P-N2` ที่เซฟไว้ + mute seller ของ `P-S2` (เตรียมผ่านแอป) | เปิด `saved` | `P-N2`/`P-S2` ยังอยู่ใน saved — ni/mute เป็น exclusion เฉพาะ feed ไม่ลบของในคลัง | — | MED | |
| LIB-105 | cover col อัปเดตเมื่อต้นทางหาย | MEMBER+ACCT-2 | EDGE | `C-A` มี tile ที่เป็น cover = `P-X1` | ACCT-2 ลบ/ซ่อน `P-X1` → เปิด hub | การ์ด `C-A` เปลี่ยน cover เป็นรูปตัวอื่นใน col (ไม่ค้างรูปของที่หายไป) | — | LOW | |

### 2.9 Edge / Error / Persistence / Real Device

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| LIB-106 | รายการเยอะ scroll ลื่น | MEMBER | EDGE | saved ≥15 ตัว (เซฟเพิ่มผ่านแอป — ทำไม่ได้ → `BLOCK`) | `saved` scroll ลงสุด → นับ tile → แตะ tile ท้าย → back | scroll ลื่น render ครบไม่ซ้ำไม่หาย · tile ท้ายเปิด viewer ได้ · back กลับตำแหน่งเดิม | — | MED | |
| LIB-107 | tile รูปเสีย/โหลดไม่ได้ | MEMBER | EDGE | โพสต์ที่เซฟมีรูปโหลดไม่ได้ (เน็ตอ่อน/CDN fail — เตรียมไม่ได้ → `BLOCK`) | เปิด `saved` ดู tile | tile แสดง fallback (placeholder/รูปสำรอง) ไม่เป็นช่องแตก/ไม่กระตุก | — | LOW | |
| LIB-108 | กด bookmark/gift รัว | MEMBER | EDGE | detail เปิด | แตะ bookmark 5 ครั้งรวด + gift รัว → ปิด/เปิด | state นิ่ง — saved/wishlisted ไม่ toggle ผิด ไม่ซ้ำ sheet ซ้อน | — | MED | |
| LIB-109 | เลือก+unsave รัวใน manage | MEMBER | EDGE | select mode เปิด | ติ๊ก tile รัวหลายตัว + กด unsave ซ้ำเร็ว ๆ | จำนวนที่เลือกถูก · dialog เปิดครั้งเดียว · ผลลัพธ์ไม่ค้างครึ่ง | — | LOW | |
| LIB-110 | kill app → state คง | MEMBER | POSITIVE | SETUP-06 เสร็จ | kill app (swipe ทิ้ง) → เปิดใหม่ → เปิดทุกหน้า library | saved/collections(+ชื่อ+cover)/wishlist/wishcol/archive/interested/ni ครบเหมือนเดิม — persist ฝั่ง server | — | HIGH | |
| LIB-111 | sign out → guest เห็นว่าง → sign in กลับครบ | MEMBER | POSITIVE | SETUP-06 เสร็จ | sign out → เปิด `saved` ผ่าน bookmark (guest) → sign in เดิม → เปิดทุกหน้า | ตอน guest เห็น empty เท่านั้น (ข้อมูล member ไม่หลุดให้ guest) · sign in กลับ → ข้อมูลเดิมครบรวมคอลเลกชัน+ชื่อ+cover | — | HIGH | |
| LIB-112 | เครื่อง B เห็นเหมือนเครื่อง A | MEMBER | POSITIVE | เครื่องสอง sign in MEMBER เดิม | เปิด `saved`/`C-A`/`wishlist`/`archive`/`interested`/`ni` บนเครื่องสอง เทียบเครื่องหลัก | เนื้อหา+ลำดับ+ชื่อ col+cover เหมือนกันทุกหน้า (server เป็น source เดียว) | — | HIGH | |
| LIB-113 | mutate บนเครื่อง B → sync A | MEMBER | POSITIVE | เครื่องสอง sign in MEMBER เดิม | เครื่องสอง: เซฟโพสต์ใหม่ + สร้าง col `C-B2` + archive โพสต์ตัวเอง → เครื่องหลัก: เปิดหน้าใหม่ | เครื่องหลักเห็น tile ใหม่ + col `C-B2` + archived tile ตาม server | — | HIGH | |
| LIB-114 | device back ไล่ชั้น | MEMBER | STATE | เปิด `savedcol` → search → ยกเลิก → manage → dlg เปิด | device back ทีละครั้ง | ปิดชั้นบนสุดทีละชั้น: dlg → manage → col → hub → settings — ไม่เด้งข้ามชั้น | — | HIGH | |
| LIB-115 | surface แล้วกลับจุดเดิม | MEMBER | STATE | อยู่ `savedcol` mode search มี q / manage เลือกไว้ | กด Home → เปิดแอปกลับ | กลับหน้าเดิม state เดิม (ชั้น+การเลือก+ข้อความค้นหาค้างตาม OS lifecycle ปกติ — แอปไม่เด้ง feed ใหม่) | — | MED | |
| LIB-116 | offline — เห็นชุดล่าสุด + เขียนไม่ได้ | MEMBER | POSITIVE | เคยเปิด `saved` มีข้อมูล | เปิด airplane → เปิด `saved`/`wishlist` → ลองเซฟ/ลบ col → กลับ online | เห็นรายการชุดล่าสุดที่เคยโหลด (ล็อก 2026-10-29) · action เขียนไม่สำเร็จ + แจ้งชัด (ไม่เงียบ/ไม่บันทึกหลอก) · reconnect ตรง server | — | HIGH | |
| LIB-117 | TH/EN sweep | MEMBER | POSITIVE | สลับภาษาใน settings | เปิดทุกหน้า library ทั้ง TH+EN รวม sheet/dlg/manage/search/edit col/nc | ทุก label+toast+dialog+placeholder+ตัวนับ ตามภาษาที่เลือก — EN ค้างในโหมด TH (หรือกลับกัน) = FAIL (prototype hardcode EN: Edit collection/nc/move/dlg/count) | — | HIGH | |
| LIB-118 | dark theme | MEMBER | POSITIVE | เปิด dark | เปิดทุกหน้า + sheet + dialog | อ่านได้ครบ ไม่มีตัวอักษรจมพื้น · ไอคอน/วงกลมเลือก/ป้าย Private เห็นชัด | — | MED | |

## §3 Spec deviations / contract ที่กระทบเคสเล่มนี้

| จุด | ผลต่อเคส | TC |
| --- | --- | --- |
| **Multi-collection** — แบบจำลองล่าสุดใช้ `savedCols`/`wlCols` (หลาย col ต่อโพสต์) vs spec 11 เขียน `savedCol` เอกพจน์ → ล็อกตามแบบจำลอง+IG จริง (ถามผู้ใช้ 2026-10-29) | เคส pick/move/remove คาดหวัง multi-membership — spec 11 ต้องอัปเดตตาม (แจ้งรีวิว) | LIB-035, 036, 055..057, 068, 073 |
| **แถว interested/ni แตะ → เปิดโพสต์** (ล็อกผู้ใช้) vs แบบจำลองพาไปโปรไฟล์ (`data-pf-user`) → canonical = เปิดโพสต์ | expected = viewer เปิดโพสต์ — build ที่พาไปโปรไฟล์ = FAIL | LIB-090 |
| **ต้นทางเปลี่ยนสถานะ** (ล็อกผู้ใช้): sold=อยู่เปิดได้ · hide/archive/block=หาย · delete=หาย+stale→unavailable | spec archive rule (02 §9) ล็อกแค่ archive — ส่วน hide/block/delete เป็นการตัดสินใหม่ | LIB-086, 098..101 |
| **library persist = server** (lock เล่ม 12/13) — prototype persist แค่ session flag | kill/sign-out/เครื่อง B ต้องรอด — หลุด = FAIL contract | LIB-110..113 |
| **guest → saved/wishlist hub เปิดได้เห็น empty** (spec 11 §16 — `sr-saved`/`data-sub` ไม่ gate) vs archive/interested/ni ไม่มีทาง (settings ทั้งชุด gate) | เคส guest ของ saved = "เปิดได้ว่าง" · ของ archive/interested/ni = "ไม่มีทางถึง" | LIB-001, 003 |
| **EN hardcode จุด library**: Edit collection, nc sheet, move sheet, dlg ลบ/ถอด, `N saved posts`/`N items`, add picker, `Search {col}` — prototype ไม่มีคู่ TH | ล็อกภาษาเหนือกว่า — TH mode เจอ EN ค้าง = FAIL | LIB-117 + เคสที่เกี่ยว |
| **nc `svd-mv-new` = `p[k]=[name]`** — ย้ายไป col ใหม่ล้าง col เดิมทั้งหมด (ต่างจากย้ายไป col ที่มีอยู่ = เพิ่ม) | expected ตามพฤติกรรมที่ล็อก — ถ้า build เก็บหลาย col หลัง move→new = แจ้งรีวิว | LIB-057 |
| **ชื่อ col ซ้ำได้** — ไม่มี dedupe ในแบบจำลอง/spec | สร้างชื่อซ้ำสำเร็จ = พฤติกรรมปกติ (ถ้า build block ชื่อซ้ำ = แจ้งรีวิว) | LIB-042 |
| **`m-unsave` settings surface** — spec เขียน "ถ้ามี surface" | ไม่มี list unsave ใน settings → ไม่มีเคส | — |
| **archive เคลียร์ pins ไม่คืน** (AC-FEED-027) | unarchive ไม่คืน pin | LIB-079, 083 |
| **ตัวนับ settings rows ต้องสะท้อนข้อมูลจริง** (AC-SETTING-015) | count ทุก row ตรง session | LIB-002, 085, 102 |
| **ni ไม่กระทบ library** — exclusion เฉพาะ feed (spec 02 §9 vs 11 §14) | โพสต์ ni/muted ยังอยู่ saved | LIB-104 |

## §4 Traceability — inventory + actions ครอบ

| Inventory หน้า/route (§2.5) | Action ใน inventory | TC ที่ครอบ | หมายเหตุ |
| --- | --- | --- | --- |
| `saved` hub (posts/collections tabs, See all, Manage, search icon) | tabs · col cards · grid · `svd-srch` · `svd-plus` · tile→viewer | LIB-001, 011..021, 025..028 | guest openable-empty |
| `saved` search mode (`mode=search`) | live filter · no-result · back exits search | LIB-022..024 | |
| `saved` manage mode | select multi/all · unsave · add to collection | LIB-019..021, 028, 029 | |
| `savedcol` (menu/add/edit/cover/select modes) | `svd-more` menu · `svdAddHTML` · `svdEditHTML` · `svdCoverHTML` · remove/move | LIB-046..063 | |
| dialog `delcol` | Delete collection confirm (โพสต์ยังอยู่) | LIB-054 | |
| sheet `nc` new collection | ชื่อ+สร้าง จาก sv sheet/manage/+ | LIB-027, 037..042 | |
| sheet `sv` save picker | head Saved · col rows · check · unsave | LIB-030..036, 044, 045 | |
| `archive` grid + "เฉพาะคุณที่เห็น" | archive/unarchive · tile→viewer · empty | LIB-006, 079..087 | owner-only |
| `wishlist`/`wishcol` hub | parallel saved (tabs/search/manage/edit/cover/delete) | LIB-005, 070..078 | |
| sheet `wl` wishlist picker | wl-btn (detail only) · pick/new | LIB-064..069 | |
| settings `interested` | liked list + Remove | LIB-007, 088..091 | |
| settings `ni` | ni list + Restore | LIB-007, 092..097 | |
| post flags `saved`/`savedCols`/`wishlisted`/`wlCols`/`archived`/`ni`/`liked` | เข้า/ออกแต่ละ list + sync | LIB-029, 030..036, 065..074, 079..099 | |
| count badges settings rows | ตรงจำนวนจริง | LIB-002, 085, 102 | |
| guest gate (save/wl/archive/ni/menu) | Member Sheet vs openable-empty | LIB-001, 003, 010 | |
| persist/cross-device | kill · sign-out · เครื่อง B | LIB-110..113 | server truth |
| viewer entries (AC-NAV-026) | tile→viewer feed mode ทุก library surface | LIB-017, 047, 075, 082, 090 | |
| ต้นทาง sold/hide/delete/block | tile impact + stale path | LIB-086, 087, 098..101, 105 | ล็อก 2026-10-29 |

## หมายเหตุท้าย

- **ก่อนส่งงานจริง**: เขียนเสร็จ → รอ PO/หัวหน้ารีวิว → แก้ตาม feedback → ค่อยปิด task (กฎเดียวกับทุกเล่ม)
- **จุดที่ล็อกในรอบนี้ (ถามผู้ใช้ 2026-10-29)**: (1) multi-collection ตามแบบจำลอง+IG จริง (spec 11 ค้าง `savedCol` เอกพจน์ — แจ้งอัปเดต spec) (2) ต้นทาง sold/hide/archive/block/delete → library impact ตามการแบ่งสถานะ (3) offline = cache ชุดล่าสุด + action เขียนไม่ได้แจ้งชัด (4) แถว interested/ni แตะ → เปิดโพสต์
- **เคส BLOCK ล่วงหน้าที่คาดว่าอาจเจอ**: LIB-013 (สร้าง col ≥5 ไม่ได้) · LIB-050 (เตรียม saved ครบทุก col ไม่ได้) · LIB-086, 098..101, 105, 112, 113 (ไม่มีเครื่องสอง/ACCT-2 ไม่ได้/สถานะข้ามบัญชี sync ยังไม่ทำ) · LIB-106 (เซฟ ≥15 ช้า/ไม่ได้) · LIB-107 (ทำรูปพังไม่ได้)
- **spec gap/จุดเฝ้าระวังรอบรีวิว**: spec 11 ยังเขียน `savedCol` เอกพจน์ (ต้องอัปเดตเป็น multi) · EN hardcode จุด library ต้อง sweep ภาษา · viewer title `Saved`/`Wish List`/`Archive` เป็น EN ในแบบจำลอง (ในแอปจริงต้องตามภาษา) · LIB-087 (archive โพสต์ที่ตัวเองเซฟ → หลุด) อาศัยว่าเซฟโพสต์ตัวเองได้
- **ครอบโดยเล่มอื่น ไม่ทำซ้ำ**: PV/Detail internals → FO-TEST-06 · sheets mechanics → FO-TEST-07 · feed/own-post menus → FO-TEST-03/13 · walerts หน้าปลายทาง → FO-TEST-11 · prefs/favorites/muted/blocked → FO-TEST-15 · Member Sheet → FO-TEST-17
