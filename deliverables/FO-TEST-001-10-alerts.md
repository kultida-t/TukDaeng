# FO-TEST-001-10 — Test Cases: Alerts & Notifications (แอปมือถือจริง)

**Task**: FO-TEST-10 ของชุด FO-TEST-001 — เขียนเป็นเวอร์ชันเทสแอปมือถือจริงตั้งแต่แรก (ไม่มีรอบ prototype แยก เพราะ spec ล็อกแล้ว)
**SoT**: แอป TukDaeng build ทดสอบบนมือถือจริง — expected ล็อกตาม `FrontOffice/09_NOTIFICATION_MODULE.md` + `FrontOffice/00_NAVIGATION_AND_CROSS_MODULE_FLOW.md` §6.3/§6.7/§8/§10/§12 (FO-PRD-v1.9) — `Prototypes/fo-flow` = แค่ reference ว่าหน้าตาควรเป็นแบบไหน
**Scope**: inventory §2.6 — แท็บ `แจ้งเตือน/Alerts` (route `alerts`) + 5 alert types (like/comment/follow/watch/system) + row anatomy + read/unread + badge `nav-badge` + Mark all as read + dismiss `x` + inline Follow back + destination routing + guest gate + `notif_settings` boundary (4 toggles) + real-app behaviors (generation จริงผ่านบัญชีที่สอง, push, persistence, offline, cross-device)
**ยกเว้น**: `walerts` (หน้ารายการ watch alert + engine + sheet สร้าง) — ของ FO-TEST-11 · เนื้อในหน้า `notif_settings` (anatomy เต็ม) — ของ FO-TEST-15 · chat badge — ของ FO-TEST-08
**การตัดสินล็อก 2026-10-29** (ถามผู้ใช้ก่อนเขียน): (1) read state/dismiss = server-backed persist ข้ามเปิดแอปใหม่และข้ามเครื่อง (2) รวมเคส push notification นอกแอป พร้อม BLOCK-if (3) เขียนเคสสร้างแจ้งเตือนจริงครบทุก type พร้อม BLOCK-if build ไม่ generate (4) toggle `notif_settings` ยึด contract — OFF ต้องหยุด type นั้นจริง
**หมายเหตุ**: เขียนเสร็จรอรีวิว — อย่าเพิ่งปิดงาน

---

## §0 วิธีใช้ + สภาพแวดล้อม + กติกาที่ล็อก

- **ทดสอบบนเครื่องจริงเท่านั้น** — ติดตั้งแอป build ทดสอบลงมือถือจริง แตะ/ปัด/พิมพ์/เลื่อนบนหน้าจอจริง — **ไม่ใช้ browser, dev console, ปุ่ม dev/demo, localStorage, OTP จำลอง** — เตรียมสถานะด้วย action จริงในแอป + ข้อมูลจริงบน server เท่านั้น
- **Actors**: `GUEST` = ไม่ sign in · `MEMBER` = บัญชีทดสอบจริงบนเครื่องหลัก · `NEW` = สมัครใหม่ (feed ว่างเสมอ) · `ACCT-2` = **บัญชีจริงที่สอง บนเครื่องจริงอีกเครื่อง** — แจ้งเตือนสร้างด้วยตัวเองไม่ได้ ต้องให้คนอื่นกด like/comment/follow ให้จริง — เคสที่ต้อง ACCT-2 แต่ไม่มี → mark `BLOCK` ระบุใน Note
- **จุดเข้า alerts**: แท็บ `แจ้งเตือน` บน bottom nav เท่านั้น (ไม่มี entry อื่น — `walerts` อยู่ใต้ Settings คนละ route)
- **Type**: `POSITIVE` · `NEGATIVE` · `EDGE` · `STATE` (เช็ก state ที่เก็บไว้) · `GATE` (บังคับ sign in) · `GATE-inverse` (ยืนยันเปิดเสรี)
- **[GATE] ทุกเคสเทส 2 รอบ**: รอบ A `GUEST` → expect Member Sheet; รอบ B `MEMBER` → expect feature ทำงาน
- **Device back เทียบเท่าปุ่มย้อนในแอป/ปิดทีละชั้น** — เคสที่มีขั้น "แตะ back" ใช้ device back ของ OS แทนได้ ผลต้องเทียบเท่ากัน
- **ภาษาตามแอปทั้งหมด** (ล็อก 2026-10-28): ทุกข้อความ UI ของ alerts เปลี่ยนตามภาษาที่เลือก — เจอ string ค้างอีกภาษา = **FAIL** (รวมปุ่ม `Follow back`/`Following` หลังกด — prototype เคย hardcode EN ซึ่งในแอปจริงถือเป็นบั๊ก); ยกเว้นชื่อ user/แบรนด์/รุ่นในเนื้อ content
- **Dark theme**: ทุกหน้าอ่านได้ครบใน dark — contrast โอเค ไม่มีตัวอักษรจมพื้นหลัง
- **Priority**: `HIGH` = กติกาหลัก/flow สำคัญ · `MED` = feature หลัก/edge · `LOW` = quirk; เคส BLOCK-if = MED เว้นกำหนด
- **จำนวน alert/กลุ่มเวลา ขึ้นข้อมูลจริงบน server** — expected ทุกข้อเขียนให้ตัดสินได้จากข้อมูลที่มีจริง (เช่น กลุ่มเรียง fix แต่ render เฉพาะกลุ่มที่มี row — มีแต่วันนี้ = เห็นแค่ `วันนี้/Today` ถือว่าถูก)
- **Result column**: เว้นว่าง — tester กรอก `PASS`/`FAIL`/`BLOCK` + ปัญหาใน `Note`
- **ไม่มีเคสแบบ "จดผล" ไม่มีผลลัพธ์ทางเลือก** — ทุกเคส expected ตรง spec/contract ข้อเดียวเด็ดขาด ไม่ตรง = FAIL (เล่มนี้เป็นเล่มตรวจรับ — dev ต้อง pass ทุกเคสที่ไม่ BLOCK ถึงจะสมบูรณ์)
- **Out of scope**: `walerts` list/engine/sheet สร้าง (FO-TEST-11) · `notif_settings` page anatomy เต็ม (FO-TEST-15) · chat list/badge (FO-TEST-08) · Member Sheet internals (FO-TEST-17) · Post Viewer/Detail internals (FO-TEST-06) · BO-generated notifications (ไม่มีใน V1)

## §1 Coverage map

| Route / Surface (inventory §2.6) | ขอบเขต | TC ที่ครอบ |
| --- | --- | --- |
| แท็บ `alerts` (Alerts feed) | gate guest · head (back→feed + title) · group sections Today/Yesterday/Last 7/Earlier · empty state · unread highlight · no walerts entry · end of list | ALT-001..009 |
| Row types (5) | like เดี่ยว/aggregate `and N others` · comment + excerpt · follow (Follow back + x) · watch (bell+seller mini+price) · system (icon+text ดิบ) · ข้อความยาว | ALT-010..016 |
| Read/unread + badge `nav-badge` | badge = Σunread · tap mark read · mark all · ปุ่มอยู่ section แรก · ปุ่มหายเมื่อ unread=0 · cap `99+` · sync ทุก nav instance · persist ข้ามเปิดแอป | ALT-017..025 |
| Destinations (§8 matrix) | like/comment → PV โพสต์ตัวเอง · watch → PV ลิสติ้ง · follow → profile · system → no-nav · target หาย → unavailable · blocked → keep-page | ALT-026..034 |
| Follow row actions | dismiss `x` (เฉพาะ follow) · persist · Follow back toggle จริง · ไม่ mark read/navigate · label ตามภาษา | ALT-035..041 |
| Guest / NEW / session | gate · deep link เป็น guest · NEW empty · ไม่มี chat row · report ไม่แจ้งอีกฝ่าย · ไม่มีทางเข้าอื่น | ALT-042..047 |
| `notif_settings` boundary | entry · 4 toggles 2 groups · default ON · OFF หยุด type (contract) · persist · re-enable · rows เก่าคงอยู่ | ALT-048..056 |
| Nav / state / language / theme | back→feed เสมอ · stack ซ้อน · device back · tab-state · re-tap · TH/EN sweep · dark · แตะรัว | ALT-057..064 |
| Real generation | like/comment/follow/watch/system rows เกิดจริงจากกิจกรรมบน server · aggregate · ไม่ซ้ำ · latency | ALT-065..072 |
| Real device edge | push นอกแอป · permission off · offline · sync ข้ามเครื่อง · account isolation · alert เก่ากดได้ · refresh | ALT-073..079 |

## §2 Test cases

ผู้ทดสอบ: อ่าน expected ก่อนรันเสมอ — เคสที่เขียน "BLOCK ถ้า..." ให้ mark BLOCK พร้อมเหตุผลใน Note (ห้าม workaround)

### Setup

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SETUP-01 | ติดตั้งแอป | — | SETUP | เครื่องจริงเครื่องหลัก | ติดตั้ง build ทดสอบที่ทีมส่งให้ → เปิดแอป | เห็นหน้า onboarding (แอปสะอาด) | splash/หน้าแรกของแอป | — | |
| SETUP-02 | สถานะเริ่มต้น | — | SETUP | แอปติดตั้งแล้ว | ลบข้อมูลแอป/ติดตั้งใหม่ ถ้าเคยใช้เครื่องนี้มาก่อน | แอปสะอาด เหมือนผู้ใช้ใหม่ | — | — | |
| SETUP-03 | ผู้ใช้ GUEST | — | SETUP | แอปสะอาด | ไม่ sign in → เดินเข้า feed ได้เลย | guest mode | bottom nav ครบ | — | |
| SETUP-04 | ผู้ใช้ MEMBER | — | SETUP | แอปสะอาด | sign in ด้วยบัญชีทดสอบที่ทีมสร้าง | เข้า feed เป็นสมาชิก | avatar/ชื่อตัวเองในที่ที่ต้องแสดง | — | |
| SETUP-05 | ผู้ใช้ NEW | — | SETUP | แอปสะอาด | สมัครใหม่ด้วยอีเมล/เบอร์ทดสอบจริง → ผ่าน onboarding จนเข้า feed | member ใหม่ — alerts feed ว่างเสมอ | — | — | |
| SETUP-06 | ข้อมูลอ้างอิง | MEMBER | SETUP | sign in แล้ว | บันทึกลง Note ของไฟล์: `ACTOR-MEMBER` · `ACCT-2` · `POST-OWN` = โพสต์ขายของตัวเอง (ถ้ายังไม่มีให้สร้างผ่าน `+` → composer) · `WATCH-X` = criteria ที่ ACCT-2 ลงลิสติ้ง match ได้ · `ACCT-3+` = บัญชีเสริมสำหรับ aggregate (ถ้ามี) · บันทึก "รุ่นเครื่อง + OS" ทุกเครื่อง | ข้อมูลพร้อม — ขาดตัวใด mark BLOCK เคสที่เกี่ยว | — | — | |
| SETUP-07 | ทางเข้า + ปุ่ม | MEMBER | SETUP | sign in แล้ว | ทดลอง: แท็บ `แจ้งเตือน` → alerts feed · back `<` บนหัว → feed · `Mark all as read` บน section แรก · `x` + `Follow back` บน follow row · เส้นทาง notif settings: profile → menu → Settings → `การตั้งค่าการแจ้งเตือน/Notification settings` | ทุก entry เปิดถูก | ตำแหน่งตาม spec §6 | — | |
| SETUP-08 | Member Sheet mechanics | GUEST | SETUP | เป็น guest | กดแท็บ `แจ้งเตือน` (gated) | Member Sheet เด้ง มี Sign in/Sign up/Skip — feed ไม่เปิด | bottom sheet จากขอบล่างเหมือนทุกหน้า | — | |
| SETUP-09 | เครื่องที่สอง + ACCT-2 | — | SETUP | มีเครื่องจริงอีกเครื่อง | ติดตั้ง build เดียวกันลงเครื่องสอง → sign in `ACCT-2` → เปิด notification permission ทั้งสองเครื่อง → ตั้งเวลาเครื่องตรงกัน | บัญชีสองพร้อม — ถ้าไม่มี → เคส ACCT-2 เป็น BLOCK | — | — | |
| SETUP-10 | สร้างแจ้งเตือนจริง baseline | MEMBER + ACCT-2 | SETUP | POST-OWN มีอยู่ + ACCT-2 sign in | ACCT-2 กด like POST-OWN → คอมเมนต์ POST-OWN → follow `ACTOR-MEMBER` → เครื่องหลักเปิด alerts | เห็น row like + comment + follow ใหม่ (unread) + badge เพิ่ม — ถ้า action จริงแล้วไม่เด้ง → mark BLOCK เคส §2.9 ทั้งหมด | row anatomy ตรง type | — | |
| SETUP-11 | เตรียม watch alert + aggregate | MEMBER | SETUP | sign in แล้ว | สร้าง watch alert ผ่าน bell ใน Post Detail / search ด้วย criteria `WATCH-X` ที่ ACCT-2 ลงลิสติ้ง match ได้ → ถ้ามี `ACCT-3+` ให้ follow/like เตรียมเคส aggregate | watch alert พร้อม — สร้างไม่ได้ → BLOCK ALT-014/028/032/053/069; ไม่มีบัญชีเสริม → BLOCK ALT-011/068 | — | — | |

### 2.1 Alerts Feed — open & structure

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ALT-001 | [GATE] แท็บแจ้งเตือน | GUEST/MEMBER | GATE | SETUP-03/04 | **รอบ A (GUEST)**: แตะแท็บ `แจ้งเตือน` → ปิด sheet · **รอบ B (MEMBER)**: แตะแท็บ | A: Member Sheet `Join TukDaeng` เด้ง feed ไม่เปิด ไม่มี badge; B: alerts feed เปิดแบบ swap (ไม่สไลด์ทับ) + แท็บ active | head `แจ้งเตือน/Alerts` + bottom nav active | HIGH | |
| ALT-002 | โครงหน้า alerts | MEMBER | UI | มี alert อย่างน้อย 1 row | เปิด alerts → อ่านหน้า | หัว `.al-head`: ปุ่ม back `<` + title `แจ้งเตือน/Alerts` + พื้นว่างขวาสมมาตร (ไม่มีปุ่มใช้งาน) + group sections + rows + bottom nav ของตัวเอง (active alerts) | layout ครบทุกส่วน | HIGH | |
| ALT-003 | กลุ่มเวลาเรียง fix + กลุ่มว่างไม่แสดง | MEMBER | UI | มี alert | อ่านลำดับ section header | section เรียง `วันนี้/Today` → `เมื่อวาน/Yesterday` → `7 วันที่ผ่านมา/Last 7 days` → `ก่อนหน้า/Earlier` เสมอ — render เฉพาะกลุ่มที่มี row (มีแต่วันนี้ = เห็นแค่ Today) | label ตามภาษาแอป | MED | |
| ALT-004 | เรียงภายในกลุ่ม | MEMBER | STATE | กลุ่มมี ≥2 rows | เทียบเวลา `ago` ของแถวในกลุ่มเดียวกัน | แถวใหม่กว่าอยู่บนกว่า (created DESC ภายใน bucket) | — | MED | |
| ALT-005 | รูปแบบเวลา | MEMBER | UI | มี alert หลายอายุ | เทียบ label เวลา TH vs EN | TH: `N นาที/N ชม./N วัน/N สัปดาห์` · EN: `Nm/Nh/Nd/Nw` — หน่วยตามภาษาแอปไม่ปะปน | — | MED | |
| ALT-006 | ความต่าง read/unread | MEMBER | UI | มีทั้ง unread และ read rows | เทียบแถว | unread มีพื้นหลัง/น้ำหนักต่างจาก read ชัดเจน (highlight) — ตรวจทั้ง light/dark | — | HIGH | |
| ALT-007 | Empty state | NEW | POSITIVE | สมัครใหม่ ยังไม่มีกิจกรรม | เปิด alerts | `ยังไม่มีการแจ้งเตือน/No alerts yet` + desc `การแจ้งเตือนนาฬิกา ยอดถูกใจ ความคิดเห็น และผู้ติดตามใหม่จะแสดงที่นี่` — **ไม่ใช่** `ไม่พบข้อมูล/No data found`; ไม่มี badge บนแท็บ | empty card ตาม design | HIGH | |
| ALT-008 | ปลาย feed — ไม่มี pagination | MEMBER | EDGE | alert จำนวนมาก | เลื่อนจนสุด list | alerts โหลดเป็นหน้า 10 รายการ เลื่อนใกล้ท้าย → โหลดหน้าถัดไปต่อเนื่อง จนถึง row เก่าสุด; pull-to-refresh ที่บนสุดรีโหลดหน้าแรก (DEC-25 A1, A27) | — | MED | |
| ALT-009 | ไม่มี entry ไป walerts | MEMBER | NEGATIVE | อยู่ alerts | มองหาลิงก์/ปุ่มไป watch alert list ในหน้า alerts | **ไม่มี** — `walerts` เข้าได้จาก Settings เท่านั้น (FO-TEST-11); เจอ link/ปุ่มใน alerts = FAIL | — | MED | |

### 2.2 Row Anatomy — 5 types

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ALT-010 | like row คนเดียว | MEMBER | UI | ACCT-2 like POST-OWN (SETUP-10) | อ่าน row like | avatar คนไลก์ + heart badge บน avatar + `{name} liked your post.`/`ถูกใจโพสต์ของคุณ` + เวลา + thumb โพสต์ขวา | ชื่อ actor เป็นตัวหนา | HIGH | |
| ALT-011 | like row aggregate | MEMBER | UI | ≥3 บัญชี like โพสต์เดียวกัน (ACCT-2+3) | อ่าน row like รวม | avatar stack 2 อัน + heart badge + `{u1}, {u2} and N others`/`{u1}, {u2} และคนอื่น ๆ อีก N คน` + thumb — ถ้าบัญชีไม่พอ → `BLOCK` | n = จำนวนคนนอกเหนือ 2 ชื่อแรก | MED | |
| ALT-012 | comment row | MEMBER | UI | ACCT-2 comment POST-OWN | อ่าน row comment | avatar คนคอมเมนต์ + `{name} commented: {excerpt}`/`แสดงความคิดเห็น:` + thumb — excerpt ยาวถูกตัดบรรทัดตาม design | — | HIGH | |
| ALT-013 | follow row | MEMBER | UI | ACCT-2 follow (SETUP-10) | อ่าน row follow | avatar + `{name} started following you.`/`เริ่มติดตามคุณ` + ปุ่ม `Follow back`/`ติดตามกลับ` (หรือ `Following`/`กำลังติดตาม` ถ้าติดตามกลับแล้ว) + `x` มุมขวา — **ไม่มี thumb** | — | HIGH | |
| ALT-014 | watch row | MEMBER | UI | watch alert match แล้ว (SETUP-11/ALT-069) | อ่าน row watch | bell icon + seller mini avatar ซ้อน + `Watch alert {name} — new listing from {seller} · {price}`/`การแจ้งเตือนนาฬิกา {name} — รายการใหม่จาก {seller} · {price}` + thumb — ไม่มี row → `BLOCK` | name = Brand Model/ชื่อ alert; price = asking ของลิสติ้ง | MED | |
| ALT-015 | system row | MEMBER | UI | system alert เกิดแล้ว (ALT-070) | อ่าน row system | icon วงกลม `!` (ไม่ใช่ avatar) + ข้อความดิบ เช่น `A new device just logged in to your account near Bangkok, TH` + เวลา — ไม่มี thumb/`x`/ปุ่ม — ไม่มี row → `BLOCK` | — | MED | |
| ALT-016 | ข้อความยาว | MEMBER | EDGE | alert ที่ชื่อ user/ข้อความ/ชื่อ alert ยาวมาก | ดู row ที่ข้อมูลยาว | ชื่อ/comment excerpt/ข้อความ system/ชื่อ watch alert ยาว → wrap/ตัดตาม design ไม่ทะลุกรอบ ไม่ทับ `x`/thumb — ไม่มีข้อมูลยาวจริงให้เทส → `BLOCK` | — | MED | |

### 2.3 Read, Badge & Mark All

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ALT-017 | badge = จำนวน unread พอดี | MEMBER | STATE | มี unread ≥1 (SETUP-10) | นับแถว unread ใน feed เทียบเลขบน badge แท็บ | badge เท่ากับจำนวนแถว unread เป๊ะ (รวมทุก type รวม watch+system) | badge อยู่บนไอคอนแท็บแจ้งเตือน | HIGH | |
| ALT-018 | แตะ row unread → อ่าน + badge ลด | MEMBER | POSITIVE | มี unread | บันทึก badge → แตะ row unread 1 แถว → กลับ alerts | แถว highlight หายทันทีก่อนเปิด destination + badge ลด 1 + แถวยังคงสถานะอ่านหลังกลับ | — | HIGH | |
| ALT-019 | แตะ row ที่อ่านแล้ว | MEMBER | POSITIVE | row อ่านแล้ว | แตะ row read | badge ไม่เปลี่ยน + ยัง navigate ไป destination ปกติ | — | MED | |
| ALT-020 | Mark all as read | MEMBER | POSITIVE | unread ≥2 | แตะ `อ่านทั้งหมดแล้ว/Mark all as read` บน section แรก | ทุก row กลายเป็นอ่าน + badge หาย + ปุ่มหาย + ไม่มี row ไหนหายไปจาก feed | re-render ไม่กระตุก | HIGH | |
| ALT-021 | ปุ่ม mark-all อยู่เฉพาะ section แรก + เฉพาะเมื่อมี unread | MEMBER | UI | unread >0 | อ่าน section headers ทุกกลุ่ม | ปุ่มอยู่บน section header **แรกเท่านั้น**; feed ที่อ่านครบแล้วไม่มีปุ่มเลย | — | MED | |
| ALT-022 | อ่านครบเองแล้วปุ่มหาย | MEMBER | STATE | เหลือ unread แถวเดียว | แตะ row unread สุดท้าย → กลับมา alerts | ปุ่ม `Mark all as read` หายอัตโนมัติ (ไม่ค้าง) | — | MED | |
| ALT-023 | badge cap `99+` | MEMBER | EDGE | สร้าง unread >99 ได้ (เช่น seed/ข้อมูลทดสอบจริงบน server) | ดู badge เมื่อ unread ≥100 | แสดง `99+` ไม่ใช่ตัวเลขจริง — สร้าง unread ขนาดนั้นไม่ได้ → `BLOCK` | — | MED | |
| ALT-024 | badge sync ทุก surface ที่มี bottom nav | MEMBER | STATE | มี unread | เทียบ badge บนแท็บแจ้งเตือนที่หน้า feed vs ที่หน้า alerts เอง | ตัวเลขเท่ากันทุกจุดที่ bottom nav ปรากฏ | — | MED | |
| ALT-025 | อ่านแล้วคงสถานะข้ามเปิดแอป (persist — lock) | MEMBER | STATE | อ่าน row ไว้แล้ว | kill แอป → เปิดใหม่ → เข้า alerts | แถวที่อ่านแล้วยังเป็นอ่าน + badge นับเฉพาะ unread จริง — ไม่กลับมาเป็น unread (ตัดสินใจ: server-backed) | — | HIGH | |

### 2.4 Destinations (00_NAV §8 matrix)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ALT-026 | like → Post Viewer โพสต์ตัวเอง | MEMBER | POSITIVE | มี like row | แตะ row like | Post Viewer เปิดโพสต์**ของตัวเองใบเดียว** (title `Post`, header solo) — ไม่ใช่ Asset Detail/feed; back → alerts | viewer แบบ notification mode | HIGH | |
| ALT-027 | comment → Post Viewer โพสต์ตัวเอง (ไม่ focus comment) | MEMBER | POSITIVE | มี comment row | แตะ row comment | เหมือน ALT-026 — **ไม่มี** auto scroll/focus ไปที่ comment (V1 contract) — build focus/deep-scroll = FAIL | — | HIGH | |
| ALT-028 | watch → Post Viewer ลิสติ้งตรง | MEMBER | POSITIVE | มี watch row (ALT-069) | แตะ row watch | Post Viewer เปิด**โพสต์ที่ match โดยตรง** (title `Post` + ชื่อ seller) — ไม่มี result list คั่น; ถ้ายังไม่ follow seller → เห็นปุ่ม `Follow` ใน viewer head — ไม่มี watch row → `BLOCK` | — | HIGH | |
| ALT-029 | follow → profile ผู้ติดตาม | MEMBER | POSITIVE | มี follow row | แตะ row follow (ไม่โดนปุ่ม/`x`) | push ไป public profile ของคน follow ทับหน้า alerts; back → กลับ alerts (stack ค้าง) | — | HIGH | |
| ALT-030 | system → ไม่มี destination (V1) | MEMBER | NEGATIVE | มี system row | แตะ row system | **ไม่ navigate ออกจาก alerts** — system row ไม่มี destination ใน V1 (FSP-021) — แตะแล้วเปิดหน้าใดก็ตาม = FAIL | — | MED | |
| ALT-031 | โพสต์เป้าหมายถูกลบ (like/comment) | MEMBER + ACCT-2 | NEGATIVE | ACCT-2 like/comment โพสต์ที่ MEMBER **จะลบ** | ACCT-2 like POST-TMP → MEMBER ลบ POST-TMP (post menu → delete) → แตะ row alert นั้น | **ไม่เปิด viewer** — แสดง unavailable state `รายการนี้ไม่พร้อมใช้งานแล้ว/This post is no longer available` + ปุ่ม `Go back` (contract ตาม 00_NAV §10 — toast เด้งแล้วอยู่ alerts เฉย ๆ ไม่ถือว่าตรง contract) — row ยังคงถูก mark read | — | HIGH | |
| ALT-032 | ลิสติ้งของ watch row หาย | MEMBER + ACCT-2 | NEGATIVE | มี watch row แล้ว ACCT-2 ลบลิสติ้ง | แตะ row watch | เหมือน ALT-031 (contract: toast/unavailable parity กับ like/comment — ห้าม silent no-op ในแอปจริง) — ไม่มีวิธีทำลิสติ้งหาย → `BLOCK` | — | MED | |
| ALT-033 | follow → profile คนที่เรา block | MEMBER + ACCT-2 | EDGE | ACCT-2 follow ก่อน → MEMBER block ACCT-2 ทีหลัง | แตะ row follow ของ ACCT-2 | เปิด profile แบบ **keep-page**: หน้าโปรไฟล์แสดงปกติแต่ grid ว่าง/`No posts yet` + ปุ่ม `Unblock` แทน Follow (S-13) — ไม่ใช่ unavailable state | — | MED | |
| ALT-034 | กลับจาก destination → state ค้าง | MEMBER | STATE | เลื่อน alerts ไปกลาง list + มี row อ่านแล้ว | แตะ row → destination → back | กลับ alerts ที่ **scroll เดิม** + row ที่อ่านแล้วยังอ่าน + badge ไม่เด้งกลับ | — | MED | |

### 2.5 Follow Row Actions (dismiss x + Follow back)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ALT-035 | dismiss `x` ลบ row ทันที | MEMBER | POSITIVE | มี follow row | แตะ `x` บน follow row | row หายจาก feed ทันที — **ไม่มี confirm ไม่มี undo**; ถ้า row ยัง unread → badge ลดตาม; ถ้าอ่านแล้ว → badge เดิม | re-render รักษา scroll | HIGH | |
| ALT-036 | dismiss persist ข้ามเปิดแอป (lock) | MEMBER | STATE | dismiss แล้ว | kill แอป → เปิดใหม่ → alerts | row ที่ dismiss ไม่กลับมา (server-backed ตามการตัดสินใจ) — กลับมา = FAIL | — | MED | |
| ALT-037 | Follow back → กำลังติดตามจริง | MEMBER + ACCT-2 | POSITIVE | มี follow row + ยังไม่ follow ACCT-2 | แตะ `ติดตามกลับ/Follow back` | ปุ่มสลับเป็น `กำลังติดตาม/Following` + follow เกิดจริง: เครื่องสองเห็น follower +1 / โปรไฟล์ MEMBER following +1 — ไม่ใช่แค่เปลี่ยนป้าย | — | HIGH | |
| ALT-038 | กดซ้ำ → unfollow | MEMBER | POSITIVE | follow back แล้ว | แตะ `กำลังติดตาม/Following` | ปุ่มกลับ `ติดตามกลับ/Follow back` + unfollow จริง (followers ฝั่ง ACCT-2 ลดกลับ) | — | MED | |
| ALT-039 | ปุ่ม/`x` ไม่ mark read ไม่ navigate | MEMBER | STATE | follow row ยัง unread | แตะ `Follow back` → แตะ `x` (row ใหม่อีกแถวถ้าถูกลบ) | แตะปุ่ม/`x` → row ยัง unread + badge ไม่เปลี่ยนจากการ mark read (dismiss ลดเพราะ row หาย ไม่ใช่เพราะอ่าน) + ไม่เปิด destination | — | MED | |
| ALT-040 | `x` มีเฉพาะ follow rows | MEMBER | NEGATIVE | มีหลาย type | มองหา `x` บน row like/comment/watch/system | **ไม่มี** บน type อื่น — dismiss ได้เฉพาะ follow | — | MED | |
| ALT-041 | label ปุ่มตามภาษาแอป | MEMBER | POSITIVE | ตั้งภาษาไทย + follow row | แตะ Follow back → ดู label → เปลี่ยนเป็น EN → ทำซ้ำ | ทุกสถานะ label ตามภาษาแอป (`ติดตามกลับ`↔`กำลังติดตาม` / `Follow back`↔`Following`) — **ค้าง EN ขณะภาษาไทย = FAIL** (prototype quirk ที่ต้องไม่มีในแอปจริง) | — | HIGH | |

### 2.6 Guest, Gate & Session

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ALT-042 | deep link เข้า alerts เป็น guest | GUEST | GATE | มีลิงก์/ช่องทางเปิด alerts จากภายนอก (push/deep link) | เปิดลิงก์นั้นเป็น guest | Member Sheet `Join TukDaeng` ก่อนเสมอ — feed ไม่เปิด — ไม่มี deep link → `BLOCK` | — | MED | |
| ALT-043 | guest → sign in ผ่าน gate → ใช้ alerts ได้ | GUEST | GATE | แท็บ gated เด้ง sheet | Member Sheet → `Sign in` → sign in สำเร็จ | กลับ surface เดิม (ไม่ auto-open alerts ตามกติกา sheet §9) + แตะแท็บแจ้งเตือนเปิด feed ได้แล้ว | — | MED | |
| ALT-044 | NEW member → feed ว่าง + ไม่มี badge | NEW | POSITIVE | SETUP-05 | แตะแท็บแจ้งเตือน | เปิด feed ได้ทันที (ไม่ gate) + empty state ALT-007 + ไม่มี badge | — | HIGH | |
| ALT-045 | chat ไม่ใช่ alert type | MEMBER + ACCT-2 | NEGATIVE | ACCT-2 ส่งข้อความถึง MEMBER | ACCT-2 ส่ง chat → เช็ก alerts feed + badge แท็บ Chat | ข้อความเพิ่ม badge **แท็บ Chat เท่านั้น** — alerts feed **ไม่มี row ใหม่** + badge alerts ไม่เปลี่ยน (canonical: chat = badge-only) | — | MED | |
| ALT-046 | report/block ไม่แจ้งอีกฝ่าย | MEMBER + ACCT-2 | NEGATIVE | MEMBER report/block ACCT-2 | MEMBER report โพสต์ ACCT-2 / block ACCT-2 → เครื่องสองเปิด alerts | feed ของ ACCT-2 **ไม่มี row** บอกว่าถูก report/block/mute (canonical 06 §14) | — | MED | |
| ALT-047 | ไม่มีทางเข้า alerts อื่น | GUEST | NEGATIVE | เป็น guest | หา entry อื่นนอก bottom nav (search/profile/settings/drawer) | ไม่มีทางเข้าอื่น — alerts เข้าได้ทางแท็บเท่านั้น (gate ที่แท็บ) | — | LOW | |

### 2.7 Notification Settings (boundary — page anatomy อยู่ FO-TEST-15)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ALT-048 | เข้าหน้า notif settings | MEMBER | POSITIVE | SETUP-07 เส้นทาง | profile → menu → Settings → `การตั้งค่าการแจ้งเตือน` | เปิดหน้า: desc `เลือกประเภทการแจ้งเตือนที่คุณต้องการรับบนอุปกรณ์นี้/Choose what notifications you receive on this device.` + กลุ่ม `กิจกรรม/Activity` (`ยอดถูกใจ/Likes`, `ความคิดเห็น/Comments`, `ผู้ติดตามใหม่/New followers`) + กลุ่ม `การซื้อขายและการแจ้งเตือน/Trading & Alerts` (`การแจ้งเตือนนาฬิกา/Watch Alerts`) — **ไม่มี toggle สำหรับ system** | 4 toggle ครบ | HIGH | |
| ALT-049 | default ON ทุกตัว | NEW | STATE | บัญชีใหม่ | เปิด notif settings | 4 toggles ON ทั้งหมด | — | MED | |
| ALT-050 | OFF likes → ไม่ได้ like alert (contract — lock) | MEMBER + ACCT-2 | STATE | toggle likes OFF | ACCT-2 like โพสต์ MEMBER → เปิด alerts | **ไม่มี like row ใหม่** + badge ไม่เพิ่มจาก like นั้น — build ยังเด้ง = FAIL (ยึด contract ไม่ใช่ prototype memory-only) | — | HIGH | |
| ALT-051 | OFF comments → ไม่ได้ comment alert | MEMBER + ACCT-2 | STATE | toggle comments OFF | ACCT-2 comment → alerts | ไม่มี comment row ใหม่ | — | MED | |
| ALT-052 | OFF follows → ไม่ได้ follow alert | MEMBER + ACCT-2 | STATE | toggle follows OFF | ACCT-2 unfollow แล้ว follow ใหม่ → alerts | ไม่มี follow row ใหม่ | — | MED | |
| ALT-053 | OFF walerts → ไม่ได้ watch alert | MEMBER + ACCT-2 | STATE | toggle walerts OFF + watch alert พร้อม | ACCT-2 ลงลิสติ้ง match `WATCH-X` → alerts | ไม่มี watch row ใหม่ — engine ไม่มี → `BLOCK` | — | MED | |
| ALT-054 | toggle persist ข้ามเปิดแอป | MEMBER | STATE | ปิด likes ไว้ | kill แอป → เปิดใหม่ → notif settings | toggle ยัง OFF | — | MED | |
| ALT-055 | เปิดกลับ → รับต่อได้ | MEMBER + ACCT-2 | STATE | likes OFF→ON | ACCT-2 like อีกครั้ง → alerts | like row ใหม่โผล่ปกติ + badge นับ | — | MED | |
| ALT-056 | rows เดิมไม่หายเมื่อปิด toggle | MEMBER | STATE | มี like row อยู่ + likes OFF | ปิด toggle → เปิด alerts | row เก่ายังอยู่ครบ — toggle หยุด "การสร้างใหม่" ไม่ลบของเดิม | — | MED | |

### 2.8 Nav, State, Language & Theme

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ALT-057 | back ของ alerts กลับ Feed เสมอ | MEMBER | POSITIVE | อยู่ alerts | แตะ `<` บนหัว | กลับ Feed เสมอ — **ไม่ใช่** pop stack/ไม่กลับหน้าก่อน (กติกาบังคับ `data-navgo="feed"`); เช็กแท็บ Feed active | — | HIGH | |
| ALT-058 | back ผ่าน stack ซ้อน | MEMBER | POSITIVE | alerts → follow row → profile | อยู่ profile → back → back | back แรก: กลับ alerts (stack) · back สอง: กลับ Feed — ทีละชั้น | — | HIGH | |
| ALT-059 | device back เทียบเท่า | MEMBER | POSITIVE | อยู่ alerts | กด device back (ปุ่ม/เจสเจอร์ OS) | ผลเทียบเท่าแตะ `<` — กลับ Feed (ไม่ออกแอปจากหน้าลึก) | — | HIGH | |
| ALT-060 | tab-state คงอยู่ | MEMBER | STATE | เลื่อน alerts กลาง list + มี unread | แท็บ Feed → แท็บแจ้งเตือนกลับ | กลับมา alerts **ตำแหน่งเดิม** + unread/scroll คง + badge ไม่เปลี่ยน | — | MED | |
| ALT-061 | แตะแท็บแจ้งเตือนซ้ำ | MEMBER | EDGE | อยู่ alerts | แตะแท็บแจ้งเตือนอีกครั้ง | อยู่หน้า alerts เดิม ไม่ซ้อน stack ไม่เปิด page ซ้ำ | — | LOW | |
| ALT-062 | ภาษาตามแอปทุกส่วน | MEMBER | POSITIVE | ตั้งภาษาไทยแล้วอังกฤษ | ไล่: title, group labels, mark-all, ทุก row type, time units, Follow back, empty, notif settings | ทุกข้อความ UI ตามภาษาแอป — ค้างอีกภาษา = FAIL (ยกเว้นชื่อ user/แบรนด์/content) | — | HIGH | |
| ALT-063 | dark theme อ่านได้ | MEMBER | POSITIVE | theme = dark | ไล่ทุกหน้าใน §1 + ไล่ rows ทุก type + unread highlight | อ่านได้ครบ contrast โอเค ไม่มีจุดจมพื้นหลัง — unread/read แยกได้ใน dark | — | HIGH | |
| ALT-064 | แตะรัวไม่ซ้อน | MEMBER | EDGE | อยู่ alerts | แตะ row รัว ๆ / แตะ mark-all รัว ๆ | ไม่ค้าง ไม่เปิด destination ซ้อนเกินหนึ่ง — back ไล่ทีละชั้น | — | LOW | |

### 2.9 Real Generation (สร้างแจ้งเตือนจริงผ่านบัญชีอื่น)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ALT-065 | like จริง → row ใหม่ | MEMBER + ACCT-2 | POSITIVE | SETUP-10 | ACCT-2 like POST-OWN → เครื่องหลักเปิด alerts | like row ใหม่โผล่ unread + badge +1 + anatomy ตรง ALT-010 | — | HIGH | |
| ALT-066 | comment จริง → row + excerpt | MEMBER + ACCT-2 | POSITIVE | SETUP-10 | ACCT-2 comment `clean set 🔥` บน POST-OWN → alerts | comment row ใหม่พร้อม excerpt ตรงข้อความที่พิมพ์ | — | HIGH | |
| ALT-067 | follow จริง → row + ปุ่ม | MEMBER + ACCT-2 | POSITIVE | ACCT-2 ยังไม่ follow | ACCT-2 follow → alerts | follow row ใหม่ unread + `Follow back` กดได้ (ALT-037) | — | HIGH | |
| ALT-068 | aggregate หลายคน | MEMBER + ACCT-2+3 | EDGE | ≥3 บัญชี like โพสต์เดียวกัน | ให้บัญชีเสริม like POST-OWN เพิ่ม → alerts | row like รวมเป็น `u1, u2 and N others` ไม่สร้าง row แยกต่อคน — บัญชีไม่พอ → `BLOCK` | — | MED | |
| ALT-069 | watch alert match → row | MEMBER + ACCT-2 | POSITIVE | watch alert `WATCH-X` ตั้งไว้ (SETUP-11) | ACCT-2 ลงลิสติ้งใหม่ที่ match criteria → alerts | watch row ใหม่โผล่ (anatomy ALT-014) + แตะ → PV ลิสติ้งตรง (ALT-028) — engine ไม่เด้ง → `BLOCK` | — | MED | |
| ALT-071 | ไม่สร้าง row ซ้ำจาก action เดียวกัน | MEMBER + ACCT-2 | EDGE | ACCT-2 like แล้ว | ACCT-2 unlike → like ซ้ำโพสต์เดิม → alerts | ไม่มี row like ซ้ำซ้อนเหมือนกัน 2 แถว — เห็น duplicate → FAIL | — | MED | |
| ALT-072 | ความหน่วงการมาถึง | MEMBER + ACCT-2 | EDGE | ACCT-2 พร้อมกด | ACCT-2 like → ภายใน 60 วินาทีเปิด alerts บนเครื่องหลัก | เห็น row like ใหม่ภายใน 60 วินาที — ไม่โผล่เลย → FAIL | — | MED | |

### 2.10 Real Device Edge (push / offline / multi-device / misc)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ALT-073 | push notification นอกแอป | MEMBER + ACCT-2 | POSITIVE | notif permission ON ทั้งคู่ + แอปเครื่องหลักปิด/background | ACCT-2 like POST-OWN → ดูเครื่องหลัก → แตะ push | push/banner เด้งนอกแอป → แตะ push → เปิดแอปเข้า destination เดียวกับ row tap ตาม §8 matrix (like → Post Viewer โพสต์ตัวเอง) — ปลายทางอื่น = FAIL — ไม่มี push → `BLOCK` | — | MED | |
| ALT-074 | push permission OFF → in-app ยังทำงาน | MEMBER + ACCT-2 | STATE | ปิด notif permission เครื่องหลัก | ACCT-2 like → เปิดแอป → alerts | ไม่มี push (ปิดแล้ว) แต่ row + badge ในแอปยังมาปกติ — feed คือ source of truth | — | MED | |
| ALT-075 | offline เปิด alerts | MEMBER | NEGATIVE | alerts เคยโหลดไว้ | เครื่องบิน → เปิด alerts → แตะ `ลองใหม่` หลังเปิดเน็ตกลับ | error state `Unable to load data` + ปุ่ม `ลองใหม่/Try again` — ห้าม crash/จอขาว/แสดงข้อมูลเก่าแบบเงียบ ๆ — กด `ลองใหม่` ตอนเน็ตกลับ → feed โหลดได้ | — | MED | |
| ALT-076 | read sync ข้ามเครื่อง (lock) | MEMBER (+เครื่องสาม ถ้ามี) | STATE | sign in `ACTOR-MEMBER` สองเครื่องได้ | เครื่อง A อ่าน/mark all → เครื่อง B เปิด alerts | read state + badge sync ข้ามเครื่อง (server-backed ตามการตัดสินใจ) — build จำกัด session เดียว → `BLOCK` | — | MED | |
| ALT-077 | feed เป็นของบัญชีตัวเองเท่านั้น | MEMBER + ACCT-2 | STATE | alerts ของ MEMBER มี rows | sign out → sign in ACCT-2 → alerts | เห็นเฉพาะ alerts ของ ACCT-2 เอง — ไม่เห็นของ MEMBER (per-account scope) | — | HIGH | |
| ALT-078 | alert เก่า (Earlier) กดได้ปกติ | MEMBER | POSITIVE | มี row กลุ่ม Earlier (ข้อมูลจริง) | แตะ row เก่าสุดใน feed | เปิด destination ตาม type ปกติ — ไม่ใช่แถวตาย — ไม่มี alert เก่าจริง → `BLOCK` | — | MED | |
| ALT-079 | feed fetch ข้อมูลล่าสุดเมื่อเข้าใหม่ | MEMBER + ACCT-2 | EDGE | ACCT-2 พึ่งกด like | อยู่ alerts → สลับไปแท็บอื่นแล้วกลับ หรือ back ออกแล้วเข้าใหม่ | feed fetch ข้อมูลล่าสุดจาก server — row ของ ACCT-2 โผล่โดยไม่ต้อง kill app — ไม่โผล่เลย → FAIL | — | MED | |

## §3 Spec deviations/contract ที่กระทบเคสเล่มนี้

| จุดจาก spec 09 §9 / contract | พฤติกรรม expected ในแอปจริง | TC ที่ครอบ |
| --- | --- | --- |
| `watch` row missing-post = silent no-op (เดิม deviation #6 — RESOLVED: prototype เปิด `al_unavail` แล้ว) | contract: unavailable state + `Go back` ทุก type — แอปจริงต้องไม่ silent | ALT-032 |
| `al-fbtn` label hardcode EN หลัง toggle (เดิม deviation #8 — RESOLVED ใน prototype) | ต้องตามภาษาแอปทุกสถานะ — EN ค้าง = FAIL | ALT-041, 062 |
| `state.notif` toggles ไม่กรอง (deviation #9 — persist ทำแล้วใน prototype) | contract: OFF หยุด generation จริง + toggle persist (lock ข้อ 4) | ALT-050..056 |
| Read/dismiss session-local (เดิม deviation #13 — RESOLVED: prototype persist `fo_alstate`) | lock ข้อ 1: server-backed persist ข้ามเปิดแอป + ข้ามเครื่อง | ALT-025, 036, 076 |
| `system` type = placeholder destination V1 (FSP-021) | แตะไม่ navigate — build เปิดหน้าใดก็ตาม = FAIL | ALT-030 |
| ไม่มี generation ใน prototype (deviation #10) | แอปจริงต้องสร้าง row จาก trigger จริง §14 — เคส §2.9 ทั้งหมด | ALT-065..072 |
| Empty copy `No alerts yet` (deviation #7 — ไม่ใช่ No data found) | copy เฉพาะ module | ALT-007 |
| Chat = badge-only ไม่ใช่ alert type (canonical 07 §14) | ไม่มี chat row ใน feed | ALT-045 |
| Report/block/mute ไม่แจ้งอีกฝ่าย (canonical 06 §14) | feed เป้าหมายไม่มี row | ALT-046 |
| `walerts` entry อยู่ Settings เท่านั้น (inventory [OPEN-NO-CODE]) | ไม่มี link จาก alerts — walerts = FO-TEST-11 | ALT-009 |

## §4 Traceability — inventory §2.6 + actions ครอบ

| Inventory หน้า/route | Action ใน inventory | TC ที่ครอบ | หมายเหตุ |
| --- | --- | --- | --- |
| `alerts` page | เปิด/โครง/groups/empty/unread/back→feed | ALT-001..008, 057 | guest gate ALT-001/042 |
| `alerts` | mark all read + ปุ่มอยู่/หายตาม unread | ALT-020..022 | |
| `alerts` | dismiss `x` (follow เท่านั้น) + persist | ALT-035, 036, 040 | |
| `alerts` | inline Follow back/Following | ALT-037..039, 041 | sync follow จริง |
| row types | like single/aggregate, comment, follow, watch, system anatomy | ALT-010..016 | |
| row tap → destination | PV ตัวเอง (like/comment) · PV listing (watch) · profile (follow) · no-nav (system) | ALT-026..030 | fallback ALT-031..033 |
| badge `nav-badge` | count/cap 99+/sync/clear | ALT-017..019, 023, 024 | |
| guest gate | tab gated + deep link guest + sign-in resume | ALT-001, 042, 043, 047 | |
| NEW/session | empty + ไม่มี badge + isolation + persist | ALT-007, 025, 036, 044, 076, 077 | lock server-backed |
| `notif_settings` | 4 toggles + boundary enforcement | ALT-048..056 | anatomy เต็มอยู่ FO-TEST-15 |
| ไม่มีใน V1 | chat row / walerts entry / ปลายทางอื่น (Asset Detail/Result List/chat room) | ALT-009, 045, 030 (negative รวม) | AC-NOTI-014/021/022 |
| nav/state | back→feed เสมอ · stack · device back · tab-state · re-tap | ALT-057..061, 064 | |
| lang/theme | TH/EN sweep + dark | ALT-041, 062, 063 | |
| generation จริง | like/comment/follow/watch/system rows + aggregate + dedupe + latency | ALT-065..072 | ACCT-2 (BLOCK-if) |
| real device | push (tap → destination) · permission off · offline · cross-device sync · old alert · refresh | ALT-073..079 | BLOCK-if push/engine |

## หมายเหตุท้าย

- **ก่อนส่งงานจริง**: เขียนเสร็จ → รอ PO/หัวหน้ารีวิว → แก้ตาม feedback → ค่อยปิด task (กฎเดียวกับทุกเล่ม)
- **ข้อมูลจริงบน server เป็นตัวแปรหลัก** — จำนวน alert/อายุกลุ่ม/จำนวน like ขึ้นกิจกรรมจริง: expected ทุกข้อตัดสินได้จากข้อมูลที่มีจริง อย่า FAIL เพราะจำนวนน้อยกว่าตัวอย่าง
- **เคส BLOCK ล่วงหน้าที่คาดว่าอาจเจอ**: ALT-011/068 (ต้อง ≥3 บัญชี), ALT-014/028/032/053/069 (watch engine), ALT-015/070 (system trigger), ALT-023 (unread >99), ALT-042 (deep link), ALT-073 (push ยังไม่ implement)
- **อยู่นอก scope**: `walerts` list + สร้าง/แก้ watch alert (FO-TEST-11) · anatomy เต็มของ `notif_settings` (FO-TEST-15) · push payload/FCM contract ละเอียด (out of V1)

- สถิติ: **79 TC** — High 31 / Medium 45 / Low 3 (SETUP rows 11 แถวแยกใน checklist; รวมใน csv 90 แถว)


## DEC-25 Amendments (ผลตามข้อตัดสิน IG — CSV ยังไม่ sync)

- ALT-008: expected = โหลดเป็นหน้า 10 + pull-to-refresh (DEC-25)
- ALT-070: ยกเลิกเคส (ไม่อยู่ใน V1 — DEC-26)
- ALT-075: expected = แสดงข้อมูลที่โหลดไว้ + แถบ offline (ERROR_STATE)
