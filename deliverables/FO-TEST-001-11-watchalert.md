# FO-TEST-001-11 — Test Cases: Watch Alert (แอปมือถือจริง)

**Task**: FO-TEST-11 ของชุด FO-TEST-001 — เขียนเป็นเวอร์ชันเทสแอปมือถือจริงตั้งแต่แรก (ไม่มีรอบ prototype แยก เพราะ spec ล็อกแล้ว)
**SoT**: แอป TukDaeng build ทดสอบบนมือถือจริง — expected ล็อกตาม `FrontOffice/10_WATCH_ALERT_MODULE.md` (FO-PRD-v1.9) + canonical entries ใน `03_SEARCH_FILTER_MODULE.md` (`sr-wa`) / `05_ASSET_DETAIL_MODULE.md` (`mf-btn`) / `13_SETTINGS_MODULE.md` (library row + notif toggle + delete-account copy) + `00_NAVIGATION_AND_CROSS_MODULE_FLOW.md` §6/§8/§9/§10 — `Prototypes/fo-flow` = แค่ reference ว่าหน้าตาควรเป็นแบบไหน
**Scope**: inventory §2.6 ส่วน Watch — sheet `wa` (create/edit) + 3 entries (`sr-wa` results head / `mf-btn` Post Detail / `Edit` บน list row) + `walerts` list page (ผ่าน Settings) + match engine contract (`watch` row → Post Viewer ตรง) + guest gate + persistence + real-app behaviors (offline, cross-device, market-data dependency)
**ยกเว้น**: alerts feed anatomy/badge/mark-all/destinations — ของ FO-TEST-10 (เล่มนี้อ้าง ALT-028/031/032/053 เท่านั้น) · `notif_settings` page anatomy เต็ม — ของ FO-TEST-15 · search/filter internals — ของ FO-TEST-04 · Post Detail anatomy — ของ FO-TEST-06 · delete account flow — ของ FO-TEST-15 (เล่มนี้เช็กเฉพาะผลต่อ alerts)
**การตัดสินล็อก 2026-10-29** (ถามผู้ใช้ก่อนเขียน): (1) alerts = server-backed — อยู่รอดปิดแอป + sign-out/in + sync ข้ามเครื่อง (2) ลบ alert ต้องมี confirm dialog ก่อน — ตาม destructive pattern ทั้งแอป (FSP-030 resolved — แก้ spec+prototype แล้ว) (3) list เรียงใหม่สุดบนสุด (แก้ spec+prototype แล้ว) (4) โพสต์ตัวเองที่ตรง alert ตัวเอง → แจ้งเตือนเหมือนของคนอื่น (5) เขียนข้อมูลตอนเน็ตหลุด → error ชัดเจน + ไม่บันทึกหลอก (6) bell `Follow this model` ติดไฟเฉพาะ alert ที่สร้างจาก detail เท่านั้น (พี่คิง — alert จาก search ไม่ติดไฟ)
**หมายเหตุ**: เขียนเสร็จรอรีวิว — อย่าเพิ่งปิดงาน

---

## §0 วิธีใช้ + สภาพแวดล้อม + กติกาที่ล็อก

- **ทดสอบบนเครื่องจริงเท่านั้น** — ติดตั้งแอป build ทดสอบลงมือถือจริง แตะ/ปัด/พิมพ์/เลื่อนบนหน้าจอจริง — **ไม่ใช้ browser, dev console, ปุ่ม dev/demo, localStorage, OTP จำลอง** — เตรียมสถานะด้วย action จริงในแอป + ข้อมูลจริงบน server เท่านั้น
- **Actors**: `GUEST` = ไม่ sign in · `MEMBER` = บัญชีทดสอบจริงบนเครื่องหลัก · `NEW` = สมัครใหม่ (alert list ว่างเสมอ) · `ACCT-2` = **บัญชีจริงที่สอง บนเครื่องจริงอีกเครื่อง** — ใช้ลงลิสติ้งเพื่อ trigger match จริง · `ACCT-3` = บัญชีเสริมสำหรับเคส block — เคสที่ต้องบัญชีอื่นแต่ไม่มี → mark `BLOCK` ระบุใน Note
- **Match engine เป็นตัวแปรใหญ่ของเล่มนี้** — contract บังคับให้ server match โพสต์ `Sale` ใหม่กับ ON alerts แล้วสร้าง `watch` row ใน alerts feed; build ที่ยังไม่มี engine → เคส §2.6 ที่ต้อง trigger จริงทั้งหมด = `BLOCK` ล่วงหน้าใน Note (ห้าม workaround)
- **Type**: `POSITIVE` · `NEGATIVE` · `EDGE` · `STATE` · `GATE` (บังคับ sign in) · `GATE-inverse` (ยืนยันเปิดเสรี)
- **[GATE] ทุกเคสเทส 2 รอบ**: รอบ A `GUEST` → expect Member Sheet; รอบ B `MEMBER` → expect feature ทำงาน
- **Device back เทียบเท่าปุ่มย้อนในแอป/ปิดทีละชั้น** — sheet/dialog เปิดอยู่ต้องปิดชั้นบนสุดก่อน เคสที่มีขั้น "แตะ back/ปิด" ใช้ device back ของ OS แทนได้ ผลต้องเทียบเท่ากัน
- **ภาษาตามแอปทั้งหมด** (ล็อก 2026-10-28): ทุกข้อความ UI + toast ของ watch alert เปลี่ยนตามภาษาที่เลือก — เจอ string ค้างอีกภาษา = **FAIL** (prototype hardcode toast เป็น EN ซึ่งในแอปจริงถือเป็นบั๊ก); ยกเว้นชื่อ user/แบรนด์/รุ่นและค่า criteria ในเนื้อ content
- **Dark theme**: ทุกหน้า/sheet/dialog อ่านได้ครบใน dark — contrast โอเค ไม่มีตัวอักษรจมพื้นหลัง
- **Priority**: `HIGH` = กติกาหลัก/flow สำคัญ · `MED` = feature หลัก/edge · `LOW` = quirk; เคส BLOCK-if = MED เว้นกำหนด
- **จำนวน `{n} matches now`/`{n} now` ขึ้นข้อมูลจริงบน server** — expected เขียนให้ตัดสินได้จากจำนวนลิสติ้ง Sale ที่ตรงจริง อย่า FAIL เพราะเลขไม่ตรงตัวอย่าง
- **Result column**: เว้นว่าง — tester กรอก `PASS`/`FAIL`/`BLOCK` + ปัญหาใน `Note`
- **ไม่มีเคสแบบ "จดผล" ไม่มีผลลัพธ์ทางเลือก** — ทุกเคส expected ตรง spec/contract ข้อเดียวเด็ดขาด ไม่ตรง = FAIL (เล่มนี้เป็นเล่มตรวจรับ — dev ต้อง pass ทุกเคสที่ไม่ BLOCK ถึงจะสมบูรณ์)
- **Out of scope**: alerts feed mechanics (FO-TEST-10) · `notif_settings` page anatomy + toggle enforcement (FO-TEST-10 ALT-048..056) · search/filter internals (FO-TEST-04) · Post Detail/Viewer internals (FO-TEST-06) · Member Sheet internals (FO-TEST-17) · delete account flow (FO-TEST-15) · BO market-data admin (ใช้แค่เตรียมสถานะเคส BLOCK-if)

## §1 Coverage map

| Route / Surface (inventory §2.6 + spec 10) | ขอบเขต | TC ที่ครอบ |
| --- | --- | --- |
| `sr-wa` search bell (results head) | gate guest · on-state เมื่อ sig ตรง + source search · tap on → edit · criteria snapshot จาก query+filters+price | WA-001, 004, 006, 010, 021, 022 |
| `mf-btn` detail bell (`Follow this model`) | gate guest · criteria snapshot จาก spec โพสต์ · `No details` toast · modelKey dedupe · bell sync | WA-002, 004, 007, 011, 023, 024, 025 |
| sheet `wa` (create/edit ใช้ร่วมทุก entry) | title/name field/mode rows+N now/disabled modes/draft name persist/CTA/create/save/dismiss | WA-009..018, 019, 034..037 |
| `walerts` list page (Settings > Watch Alerts) | head/desc/row anatomy/ordering/empty/paused dim/count badge/truncate | WA-003, 026..033, 062, 063 |
| Edit / Pause / Delete | edit sheet · rename/regen/mode change/คง on-state · toggle pause/resume + toast + dim + bell sync · delete confirm dlg · ไม่มี delete บน row | WA-034..042 |
| Dedupe | sig+mode ซ้ำ · คนละ mode · cross-source sig · modelKey รวม paused | WA-006, 007, 019..022 |
| Match & notify (engine จริง) | match จริง → watch row ≤60s · mode semantics · price/keyword · Sale-only pool · paused/deleted · multi-alert · own listing · blocked pool · tap → PV · row เก่าหลังลบ alert · ลิสติ้งหาย · push · ไม่มี triggered marker | WA-043..061 |
| Bell sync / modelFollowing | detail alert → bell on ทุกเรือน modelKey เดียวกัน · search alert ไม่ขับ bell (lock) | WA-024, 025, 040, 042 |
| Nav / state / language / theme | back→settings · device back ปิดทีละชั้น (sheet→dlg→page) · backdrop dismiss · TH sweep · dark · แตะรัว | WA-062..069 |
| Real device edge | persist kill/sign-out/cross-device · isolation · offline read/write · criteria ขัดแย้ง · inactive market data · backfill dedup · delete account | WA-070..079 |

## §2 Test cases

ผู้ทดสอบ: อ่าน expected ก่อนรันเสมอ — เคสที่เขียน "BLOCK ถ้า..." ให้ mark BLOCK พร้อมเหตุผลใน Note (ห้าม workaround)

### Setup

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SETUP-01 | ติดตั้งแอป | — | SETUP | เครื่องจริงเครื่องหลัก | ติดตั้ง build ทดสอบที่ทีมส่งให้ → เปิดแอป | เห็นหน้า onboarding (แอปสะอาด) | splash/หน้าแรกของแอป | — | |
| SETUP-02 | สถานะเริ่มต้น | — | SETUP | แอปติดตั้งแล้ว | ลบข้อมูลแอป/ติดตั้งใหม่ ถ้าเคยใช้เครื่องนี้มาก่อน | แอปสะอาด เหมือนผู้ใช้ใหม่ | — | — | |
| SETUP-03 | ผู้ใช้ GUEST | — | SETUP | แอปสะอาด | ไม่ sign in → เดินเข้า feed ได้เลย | guest mode | bottom nav ครบ | — | |
| SETUP-04 | ผู้ใช้ MEMBER | — | SETUP | แอปสะอาด | sign in ด้วยบัญชีทดสอบที่ทีมสร้าง | เข้า feed เป็นสมาชิก | avatar/ชื่อตัวเองในที่ที่ต้องแสดง | — | |
| SETUP-05 | ผู้ใช้ NEW | — | SETUP | แอปสะอาด | สมัครใหม่ด้วยอีเมล/เบอร์ทดสอบจริง → ผ่าน onboarding จนเข้า feed | member ใหม่ — walerts ว่างเสมอ | — | — | |
| SETUP-06 | ข้อมูลอ้างอิง | MEMBER | SETUP | sign in แล้ว | บันทึกลง Note ของไฟล์: `ACTOR-MEMBER` · `ACCT-2` · `POST-FULL` = โพสต์ขายที่ spec ครบ (brand/model/reference/year/condition) · `POST-NOSPEC` = โพสต์ที่ spec ว่าง/ไม่ระบุทุกช่อง (หาไม่ได้ให้ ACCT-2 สร้างลิสติ้งที่ไม่กรอก spec) · `CRIT-X` = criteria ที่ ACCT-2 จะลงลิสติ้ง match ได้ (เช่น brand+model+ช่วงราคา) · `CRIT-CONFLICT` = criteria ขัดแย้งกัน (เช่น brand A + model ของ brand B) · บันทึก "รุ่นเครื่อง + OS" ทุกเครื่อง | ข้อมูลพร้อม — ขาดตัวใด mark BLOCK เคสที่เกี่ยว | — | — | |
| SETUP-07 | ทางเข้า + ปุ่ม | MEMBER | SETUP | sign in แล้ว | ทดลอง: search → submit → bell `sr-wa` บนหัวผลลัพธ์ · เปิด Post Detail ของ `POST-FULL` → bell `Follow this model` ที่ act-right · profile → menu → Settings → `การแจ้งเตือนนาฬิกา/Watch Alerts` | ทุก entry เปิด sheet/หน้าถูก | ตำแหน่งตาม spec §6 | — | |
| SETUP-08 | Member Sheet mechanics | GUEST | SETUP | เป็น guest | กด bell `sr-wa` บนหัวผลลัพธ์ (gated) | Member Sheet เด้ง มี Sign in/Sign up/Skip — sheet WA ไม่เปิด | bottom sheet จากขอบล่างเหมือนทุกหน้า | — | |
| SETUP-09 | เครื่องที่สอง + ACCT-2 | — | SETUP | มีเครื่องจริงอีกเครื่อง | ติดตั้ง build เดียวกันลงเครื่องสอง → sign in `ACCT-2` → เปิด notification permission ทั้งสองเครื่อง → ตั้งเวลาเครื่องตรงกัน | บัญชีสองพร้อม — ถ้าไม่มี → เคส ACCT-2/ACCT-3 เป็น BLOCK | — | — | |
| SETUP-10 | สร้าง alert baseline | MEMBER | SETUP | SETUP-06 เสร็จ | สร้าง `WA-SEARCH` จาก search bell ด้วย criteria `CRIT-X` (กรอก keyword/filters/price แล้วกด bell บนหัวผลลัพธ์) + `WA-MODEL` จาก bell บน Post Detail ของ `POST-FULL` → เปิด `walerts` | เห็น 2 แถวใน list — สร้างไม่ได้ → mark BLOCK เคสทั้งเล่มที่เกี่ยวกับ create/list | row anatomy ตรง WA-027 | — | |
| SETUP-11 | เตรียม match engine จริง | MEMBER + ACCT-2 | SETUP | `WA-SEARCH` ตั้งไว้ + ACCT-2 พร้อมลงขาย | ACCT-2 เตรียมลิสติ้ง Sale ที่ตรง `CRIT-X` (กรอก spec ให้ตรงทุก criterion) → ลงขาย → เครื่องหลักเปิด alerts | ภายใน 60 วินาทีต้องมี watch row ใหม่ — **ถ้า action จริงแล้วไม่เด้ง = ไม่มี match engine → mark BLOCK เคส §2.6 ที่ต้อง trigger ทั้งหมด** | watch row anatomy ตาม ALT-014 | — | |

### 2.1 Entries & Guest Gate

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| WA-001 | [GATE] search bell `sr-wa` | GUEST/MEMBER | GATE | SETUP-03/04 | **รอบ A (GUEST)**: search → submit → แตะ bell บนหัวผลลัพธ์ → ปิด sheet · **รอบ B (MEMBER)**: ทำเหมือนกัน | A: Member Sheet `Join TukDaeng` เด้ง sheet WA ไม่เปิด; B: sheet `Create watch alert` เปิดพร้อม criteria จาก query/filters | bell อยู่บนหัวผลลัพธ์ขวาสุดก่อนปุ่ม filter | HIGH | |
| WA-002 | [GATE] detail bell `mf-btn` | GUEST/MEMBER | GATE | `POST-FULL` | **รอบ A (GUEST)**: เปิด Post Detail → แตะ bell `Follow this model` → ปิด sheet · **รอบ B (MEMBER)**: ทำเหมือนกัน | A: Member Sheet เด้ง; B: sheet `Create watch alert` เปิดพร้อม criteria จาก spec โพสต์ | bell อยู่กลุ่ม `act-right` คู่กับ Wish List | HIGH | |
| WA-003 | [GATE] หน้า `walerts` | GUEST/MEMBER | GATE | SETUP-03/04 | **รอบ A (GUEST)**: พยายามเข้า Settings (แท็บ profile/menu) · **รอบ B (MEMBER)**: profile → menu → Settings → `การแจ้งเตือนนาฬิกา/Watch Alerts` | A: ถูก gate ตั้งแต่ entry (Member Sheet) — ไม่มีทางถึงหน้า walerts; B: หน้า list เปิดได้ | — | HIGH | |
| WA-004 | bell แสดงให้ guest เห็นปกติ | GUEST | GATE-inverse | เป็น guest | เปิดผลค้นหา + Post Detail → มองตำแหน่ง bell | bell ทั้งสอง render ปกติ ไม่ถูกซ่อน — gate เฉพาะตอนแตะ | ไม่มี badge/label เตือน guest | MED | |
| WA-005 | ไม่มี bell บน feed card / viewer card | MEMBER | NEGATIVE | อยู่ feed + Post Viewer | มองหา bell สร้าง watch alert บน feed card และบนการ์ดใน Post Viewer | **ไม่มี** — entry เฉพาะ results head + Post Detail (V1); เจอ bell ที่ surface อื่น = FAIL | — | LOW | |
| WA-006 | กด search bell ที่ on → เปิด Edit เดิม | MEMBER | POSITIVE | `WA-SEARCH` สร้างแล้ว (SETUP-10) | กลับมาผลค้นหาชุดเดิม → bell on-state → แตะ bell | เปิด sheet `Edit watch alert` ของ alert เดิม — **ไม่สร้าง alert ใหม่** | bell แสดงสถานะ on ตั้งแต่ก่อนกด | HIGH | |
| WA-007 | กด detail bell ที่ Following → เปิด Edit เดิม | MEMBER | POSITIVE | `WA-MODEL` สร้างแล้ว | เปิด Post Detail ของ `POST-FULL` → bell `Following this model` → แตะ | เปิด sheet `Edit watch alert` ของ alert เดิม | title กระดิ่ง `Following this model` | HIGH | |
| WA-008 | walerts มีทางเข้าเดียวผ่าน Settings | MEMBER | NEGATIVE | sign in แล้ว | หา entry ไปหน้า walerts จาก alerts tab / drawer / search / bell ทั้งสอง | **ไม่มีทางเข้าอื่น** — bell เปิด sheet เท่านั้นไม่ใช่หน้า list; เจอ link/ปุ่มไป walerts จากจุดอื่น = FAIL | — | MED | |

### 2.2 Sheet Anatomy & Create

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| WA-009 | create sheet anatomy | MEMBER | UI | อยู่ผลค้นหา | แตะ bell → อ่าน sheet | title `สร้างการแจ้งเตือนนาฬิกา/Create watch alert` + label `ตั้งชื่อการแจ้งเตือนนี้/Give this watch alert a name` + name field prefilled + section `แจ้งเตือนฉันเมื่อโพสต์ตรงกับเงื่อนไข/Notify me when a post matches` + mode rows 3 แถว + CTA `สร้างการแจ้งเตือน/Create alert` — **ไม่มีปุ่ม Delete ในโหมดสร้าง** | layout ครบทุกส่วน | HIGH | |
| WA-010 | criteria snapshot จาก search | MEMBER | POSITIVE | อยู่หน้า search | พิมพ์ keyword + เปิด filter เลือก brand/model/ช่วงราคา → apply → แตะ bell → กด Create | criteria ใน draft ครอบ keyword + ทุก filter ที่เลือก + price range; หลัง save เปิด `walerts` → criteria text บน row แสดงค่าครบ join ด้วย ` · ` รวมช่วงราคารูปแบบ `THB {min|0} – {max|Any}` | — | HIGH | |
| WA-011 | criteria snapshot จาก detail | MEMBER | POSITIVE | `POST-FULL` | เปิด detail → แตะ bell → กด Create → เปิด `walerts` อ่าน criteria text | criteria = spec ที่โพสต์กรอกจริง (brand/model/reference/year/condition/case/movement/dial/strap/delivery + spec rows อื่นที่ไม่ได้ map) — ค่า spec ที่เว้นว่าง/ไม่ระบุ **ไม่เข้า** criteria และ **ไม่มี** Asking Price/Estimated Market Price/Last Price Update/Data Source ใน criteria | — | HIGH | |
| WA-012 | mode rows + live count | MEMBER | UI | sheet เปิดด้วย criteria ไม่ว่าง | อ่าน mode rows 3 แถว | แต่ละแถว: title (`ตรงทุกเงื่อนไข`/`ตรงเงื่อนไขใดเงื่อนไขหนึ่ง`/`เฉพาะรุ่น` — EN `Match all criteria`/`Match any criteria`/`Model only`) + desc + ตัวเลข `{n} รายการในขณะนี้`/`{n} now` ที่นับเฉพาะลิสติ้ง Sale ปัจจุบันที่ตรง mode นั้น — เลขต้องตรงจำนวนจริงบน server | — | HIGH | |
| WA-013 | criteria ว่าง → เฉพาะ `all` ใช้ได้ | MEMBER | EDGE | เปิดผลค้นหาโดยไม่ใส่คำ/ไม่เลือก filter | แตะ bell → พยายามเลือก mode `any`/`model` | mode `any`/`model` disabled เลือกไม่ได้ — เหลือ `all` เท่านั้น; alert ที่สร้าง = `Any new listing` (watch ทุกลิสติ้งใหม่) — เข้าผลลัพธ์ว่างแบบไม่มีเงื่อนไขไม่ได้ → `BLOCK` | mode disabled เห็นชัด | MED | |
| WA-014 | เปลี่ยน mode ไม่เสียชื่อที่พิมพ์ | MEMBER | STATE | sheet create เปิด | พิมพ์ชื่อเอง `My Daytona hunt` → แตะเลือก mode `any` → ดูช่องชื่อ | ชื่อที่พิมพ์ยังอยู่ครบหลัง sheet re-render (draft persist) — ชื่อหาย/reset เป็น auto = FAIL | — | MED | |
| WA-015 | create → alert ON ทันที | MEMBER | POSITIVE | sheet create เปิดพร้อม criteria | กด `สร้างการแจ้งเตือน/Create alert` → เปิด `walerts` + กลับดู bell ต้นทาง | toast ยืนยันเปิดการแจ้งเตือนตามภาษาแอป (EN: `Watch alert on`) + alert ใหม่สถานะ ON ปรากฏใน list + bell entry เดิมกลาย on-state (`sr-wa` ติดไฟ / `mf-btn` เป็น `Following this model`) | sheet ปิดเอง | HIGH | |
| WA-016 | auto-name ตามลำดับ `waName` | MEMBER | POSITIVE | มี alert จากหลาย entry | สร้าง alert: (a) จาก detail ที่มี brand+model+ref → (b) จาก search ที่มีแค่ keyword → (c) จาก filter ที่ไม่มี brand/model | ชื่อ auto: (a) `Brand Model · Reference` (ref มีค่อยต่อท้าย) · (b) `"keyword"` ในเครื่องหมายคำพูด · (c) criteria 2 ค่าแรก join ` · ` — prefill ในช่องชื่อทุกครั้ง | — | MED | |
| WA-017 | เว้นชื่อว่างตอน save → regen ไม่ block | MEMBER | POSITIVE | sheet create เปิด | ลบชื่อในช่องให้ว่าง → กด Create | บันทึกสำเร็บันทึก้วยชื่อ auto ตาม `waName` — **ไม่มี** validation block/ข้อความบังคับกรอก | — | HIGH | |
| WA-018 | ปิด sheet ไม่ save → ไม่ commit | MEMBER | NEGATIVE | sheet create เปิด พิมพ์ชื่อ+เลือก mode แล้ว | ลาก sheet ลง/แตะ backdrop ปิด → เปิด `walerts` | **ไม่มี alert ใหม่** — draft ทิ้งทั้งหมด | — | MED | |

### 2.3 Dedupe & Bell Sync

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| WA-019 | save ซ้ำ criteria+mode | MEMBER | NEGATIVE | `WA-SEARCH` อยู่ (criteria `CRIT-X`, mode `all`) | สร้าง alert ที่ criteria+mode เหมือน `WA-SEARCH` เป๊ะผ่าน entry ที่ไม่ dedupe (เช่น detail ที่ spec ออกมา criteria ชุดเดียวกัน) → กด Create | **ไม่สร้างซ้ำ** — toast `You already saved this alert` ตามภาษาแอป + เปิด sheet Edit ของ alert เดิม — ทำ criteria ตรงเป๊ะไม่ได้ด้วย UI → `BLOCK` | list ยังมี alert เดียวชุดนั้น | HIGH | |
| WA-020 | criteria เดียวกันคนละ mode → สร้างได้ | MEMBER | POSITIVE | `WA-SEARCH` mode `all` | สร้าง alert criteria เดียวกันแต่เลือก mode `any` → save | สร้าง alert ใหม่สำเร็จ — dedupe เฉพาะ criteria+mode ตรงกันทั้งคู่ — ทำ criteria ตรงเป๊ะไม่ได้ → `BLOCK` | list มี 2 แถว | MED | |
| WA-021 | sr-wa sig ตรง alert จาก source อื่น | MEMBER | EDGE | alert จาก detail ที่ criteria = เฉพาะ filter ที่ search ตั้งซ้ำได้ (เช่น เหลือแค่ brand) | ตั้ง search/filter ให้ criteria เหมือน alert จาก detail เป๊ะ → แตะ `sr-wa` | เปิด sheet Edit ของ alert นั้น (dedupe ทุก source) — แต่ bell `sr-wa` **ไม่**กลาย on เพราะ alert ไม่ได้ `source:"search"` — ทำ criteria ตรงเป๊ะไม่ได้ → `BLOCK` | bell off-state | MED | |
| WA-022 | modelKey dedupe รวม alert ที่ paused | MEMBER | POSITIVE | `WA-MODEL` paused อยู่ (WA-039) | เปิด Post Detail ของโพสต์ modelKey เดียวกัน → แตะ bell | เปิด sheet Edit ของ alert เดิม (dedupe แม้ paused) — ไม่สร้างใหม่ | bell แสดง off-state (`Follow this model`) เพราะ alert ปิดอยู่ | MED | |
| WA-023 | detail bell บนโพสต์ไม่มี spec | MEMBER | NEGATIVE | `POST-NOSPEC` (SETUP-06) | เปิด Post Detail → แตะ bell | toast `No details on this post to watch` ตามภาษาแอป — **sheet ไม่เปิด** ไม่มี draft | — | HIGH | |
| WA-024 | bell on ทุกเรือนที่ modelKey ตรง | MEMBER | STATE | `WA-MODEL` ON + มีอีกโพสต์ brand/model/ref เดียวกัน | เปิด Post Detail ของโพสต์เรือนอื่นที่ modelKey เดียวกัน → อ่าน bell | bell `Following this model` ติดไฟด้วย (sync ตาม modelKey ไม่ใช่ตามโพสต์) — ไม่มีโพสต์เรือนที่สอง modelKey เดียวกัน → `BLOCK` | — | MED | |
| WA-025 | search alert ไม่ขับ bell (lock พี่คิง) | MEMBER | NEGATIVE | `WA-SEARCH` ที่ criteria ครอบ brand+model+ref ของ `POST-FULL` | เปิด Post Detail ของ `POST-FULL` → อ่าน bell | bell ยัง `Follow this model` (off-state) — alert จาก search **ไม่ติดไฟ** bell แม้เงื่อนไขตรงรุ่น (lock 2026-10-29: bell = action ติดตามรุ่นบน detail เท่านั้น) | — | HIGH | |

### 2.4 Watch Alerts List (`walerts`)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| WA-026 | page anatomy | MEMBER | UI | มี alert ≥1 | Settings → `Watch Alerts` → อ่านหน้า | หัว: back `<` (pop กลับ Settings) + title `การแจ้งเตือนนาฬิกา/Watch Alerts` + desc `รับการแจ้งเตือนเมื่อมีรายการใหม่ตรงกับนาฬิกาที่คุณกำลังติดตาม`/`Get notified when a new listing matches what you're watching.` + rows | — | HIGH | |
| WA-027 | row anatomy | MEMBER | UI | มี alert ≥1 | อ่านแถว alert | bell icon + ชื่อ + criteria text (ค่า join ` · `) + badge `แก้ไข/Edit` + mode label (`ตรงทุกเงื่อนไข`/`ตรงเงื่อนไขใดเงื่อนไขหนึ่ง`/`เฉพาะรุ่น` — EN `Match all`/`Match any`/`Model only`) + `{n} รายการในขณะนี้`/`{n} matches now` + pause toggle — **ไม่มีปุ่มลบบน row** (ลบได้เฉพาะใน edit sheet) | — | HIGH | |
| WA-028 | empty state | NEW | POSITIVE | สมัครใหม่ ไม่มี alert | เปิด `walerts` | `ยังไม่มีการแจ้งเตือนนาฬิกา — แตะไอคอนกระดิ่งบนโพสต์หรือบันทึกการค้นหาเพื่อเริ่มต้น`/`No watch alerts yet — tap the bell on a post or save a search to start one` — **ไม่ใช่** `ไม่พบข้อมูล/No data found` | — | HIGH | |
| WA-029 | เรียงใหม่สุดบนสุด (lock) | MEMBER | STATE | สร้าง alert ≥2 (SETUP-10) | เปิด `walerts` → เทียบลำดับกับเวลาสร้าง | alert ที่สร้างล่าสุดอยู่**บนสุด** — ไม่ใช่ต่อท้ายล่าง (lock 2026-10-29) | — | HIGH | |
| WA-030 | paused row visual | MEMBER | UI | มี alert paused | ดูแถว paused เทียบแถว ON | แถว paused จาง/dim ชัดเจนต่างจากแถว ON — ชื่อ/criteria/count/toggle ยังแสดงครบ | ทั้ง light/dark แยกได้ | MED | |
| WA-031 | criteria ว่างบน row | MEMBER | UI | alert `Any new listing` (WA-013) | อ่าน criteria text ของแถวนั้น | แสดง `ทุกรายการใหม่`/`Any new listing` แทน criteria | — | MED | |
| WA-032 | settings row count badge | MEMBER | STATE | มี alert N แถว | เปิด Settings → อ่าน badge บน row `Watch Alerts` → สร้างเพิ่ม/ลบแล้วกลับมา | count = จำนวน alerts เป๊ะ และอัปเดตตาม create/delete ทันที | — | MED | |
| WA-033 | ชื่อ/criteria ยาว | MEMBER | EDGE | alert ที่ชื่อ/criteria text ยาวมาก | ดูแถวนั้น | ข้อความ wrap/ตัดตาม design ไม่ทะลุกรอบ ไม่ทับ toggle/badge — ไม่มีข้อมูลยาวจริง → `BLOCK` | — | MED | |

### 2.5 Edit / Pause / Delete

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| WA-034 | edit sheet anatomy | MEMBER | UI | มี alert | `walerts` → แตะ badge `แก้ไข/Edit` บนแถว | sheet โหมด edit: title `แก้ไขการแจ้งเตือนนาฬิกา/Edit watch alert` + name + mode rows + CTA `บันทึกการเปลี่ยนแปลง/Save changes` + ปุ่ม `ลบการแจ้งเตือน/Delete alert` — **ไม่มีช่องแก้ criteria** (criteria = snapshot) | — | HIGH | |
| WA-035 | rename → save | MEMBER | POSITIVE | sheet edit เปิด | แก้ชื่อเป็น `Rolex hunt 2026` → กด Save | toast `Watch alert updated` ตามภาษาแอป + row แสดงชื่อใหม่ + criteria/mode/count เดิม | — | HIGH | |
| WA-036 | เคลียร์ชื่อใน edit → regen | MEMBER | POSITIVE | sheet edit เปิด | ลบชื่อให้ว่าง → กด Save | บันทึกสำเร็จ ชื่อกลายเป็น auto `waName` ใหม่ — ไม่ block | — | MED | |
| WA-037 | เปลี่ยน mode → จำนวน match เปลี่ยน | MEMBER | STATE | alert mode `all` criteria หลายตัว | เปิด edit → เลือก mode `any` → Save → ดู `{n} matches now` | mode label เปลี่ยน + count คำนวณตาม mode ใหม่ (โดยทั่วไป any ≥ all) — criteria เดิมไม่เปลี่ยน | — | MED | |
| WA-038 | edit คง on-state เดิม | MEMBER | STATE | alert paused อยู่ | เปิด edit → rename → Save | alert ยัง paused (แก้ได้แค่ name+mode — `on`/criteria/source เดิม) | แถวยัง dim | MED | |
| WA-039 | pause → dim + ไม่ match | MEMBER | POSITIVE | alert ON | แตะ toggle บนแถว | toast `Watch alert paused` ตามภาษาแอป + toggle off + แถว dim + ต่อจากนี้ alert ไม่ match/ไม่นับ (ผูก WA-051) + bell detail ของ modelKey นั้นหลุด (ถ้าเป็น detail alert) | re-render ไม่กระตุก | HIGH | |
| WA-040 | resume → ON + bell กลับ | MEMBER | POSITIVE | `WA-MODEL` paused | แตะ toggle → เปิด detail `POST-FULL` | toast `Watch alert on` + แถวกลับปกติ + bell `Following this model` ติดไฟอีกครั้ง | — | MED | |
| WA-041 | delete → confirm dialog (lock) | MEMBER | POSITIVE | sheet edit เปิด | แตะ `ลบการแจ้งเตือน/Delete alert` → อ่าน dialog → กด `ยกเลิก/Cancel` | **confirm dialog เด้งก่อนเสมอ** (title `ลบการแจ้งเตือนนี้หรือไม่?`/`Delete watch alert?` + desc ลบถาวร + `ลบ/Delete` + `ยกเลิก/Cancel`) — Cancel → กลับ sheet edit เดิม **ไม่มีอะไรถูกลบ** — ลบทันทีโดยไม่ถาม = FAIL | dialog ทับ sheet | HIGH | |
| WA-042 | confirm delete → ลบจริง | MEMBER | POSITIVE | confirm dialog เปิดอยู่ | กด `ลบ/Delete` | toast `Watch alert removed` ตามภาษาแอป + แถวหายจาก list + bell ที่เกี่ยวหลุด on-state + count badge บน Settings ลด 1 | sheet+dialog ปิดพร้อมกัน | HIGH | |

### 2.6 Match & Notify (Real Engine)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| WA-043 | match จริง → watch row | MEMBER + ACCT-2 | POSITIVE | `WA-SEARCH` (`CRIT-X`) ON + engine พร้อม (SETUP-11) | ACCT-2 ลงลิสติ้ง Sale ตรง `CRIT-X` → เครื่องหลักเปิด alerts | ภายใน 60 วินาทีเห็น watch row ใหม่ unread + badge +1 + anatomy ตาม ALT-014 (`การแจ้งเตือนนาฬิกา {name} — รายการใหม่จาก {seller} · {price}`/`Watch alert {name} — new listing from {seller} · {price}` + bell icon + seller mini + thumb) — engine ไม่เด้ง → `BLOCK` | — | HIGH | |
| WA-044 | ลิสติ้งไม่ตรง → ไม่เด้ง | MEMBER + ACCT-2 | NEGATIVE | `WA-SEARCH` ON | ACCT-2 ลงลิสติ้งที่ spec ต่างจาก `CRIT-X` → alerts | **ไม่มี watch row ใหม่** + badge ไม่เพิ่ม | — | HIGH | |
| WA-045 | mode `all` ต้องครบทุก criterion | MEMBER + ACCT-2 | EDGE | alert mode `all` ≥2 criteria | ACCT-2 ลงลิสติ้งที่ตรงทุก criterion ยกเว้น 1 ตัว → alerts → จากนั้นลงที่ตรงครบ | ลิสติ้งขาด 1 criterion **ไม่เด้ง**; ลิสติ้งครบเด้ง — engine ไม่เด้ง → `BLOCK` | — | MED | |
| WA-046 | mode `any` ตรง ≥1 | MEMBER + ACCT-2 | POSITIVE | alert mode `any` ≥2 criteria | ACCT-2 ลงลิสติ้งที่ตรงเพียง 1 criterion → alerts | watch row ใหม่เด้ง — engine ไม่เด้ง → `BLOCK` | — | MED | |
| WA-047 | mode `model` เฉพาะ brand/model/ref | MEMBER + ACCT-2 | EDGE | alert mode `model` ที่ criteria มี brand/model/ref | (a) ACCT-2 ลงลิสติ้งตรง brand+model+ref แต่ spec อื่นไม่ตรง → (b) ลงที่ตรงแค่ brand อย่างเดียว | (a) เด้ง (ไม่สนฟิลด์อื่น) · (b) ไม่เด้ง (ต้องครบทุกตัวในกลุ่ม) — engine ไม่เด้ง → `BLOCK` | — | MED | |
| WA-048 | price criterion ใน/นอก range | MEMBER + ACCT-2 | EDGE | alert มี price range (จาก WA-010) | ACCT-2 ลงลิสติ้ง spec เดียวกันราคาใน range → อีกใบราคาเกิน range → alerts | ใบใน range เด้ง · ใบนอก range ไม่เด้ง — engine ไม่เด้ง → `BLOCK` | — | MED | |
| WA-049 | keyword ต้องเจอครบทุกคำ (AND) | MEMBER + ACCT-2 | EDGE | alert มี keyword หลายคำ | ACCT-2 ลงลิสติ้ง caption/spec มีครบทุกคำ → อีกใบขาด 1 คำ | ใบครบทุกคำเด้ง · ใบขาดคำไม่เด้ง — engine ไม่เด้ง → `BLOCK` | — | MED | |
| WA-050 | match เฉพาะ Sale (contract) | MEMBER + ACCT-2 | NEGATIVE | `WA-SEARCH` ON | ACCT-2 ลงลิสติ้งที่ spec ตรง `CRIT-X` แต่สถานะ **ไม่ใช่ Sale** (showcase/ซ่อน) → alerts + อ่าน `{n} matches now` | **ไม่เด้ง + ไม่นับ** — contract match เฉพาะลิสติ้ง Sale (การนับลิสติ้ง priced สถานะอื่นคือ defect pfkind-leak ที่บันทึกไว้ ห้ามมีในแอปจริง) | — | HIGH | |
| WA-051 | paused → ไม่เด้งไม่นับ | MEMBER + ACCT-2 | STATE | `WA-SEARCH` paused (WA-039) | ACCT-2 ลงลิสติ้งตรง `CRIT-X` → alerts + matches now บนแถว | ไม่มี row + count ไม่นับลิสติ้งนั้น — engine ไม่เด้ง → `BLOCK` | — | HIGH | |
| WA-052 | deleted → ไม่เด้ง | MEMBER + ACCT-2 | NEGATIVE | ลบ `WA-SEARCH` แล้ว (WA-042) | ACCT-2 ลงลิสติ้งที่ตรง `CRIT-X` เดิม → alerts | ไม่มี watch row — ลบแล้วหยุดถาวร | — | HIGH | |
| WA-053 | หลาย alert ตรงลิสติ้งเดียว → row ราย alert | MEMBER + ACCT-2 | EDGE | มี ≥2 alerts ON ที่ criteria ต่างกันแต่ตรงลิสติ้งเดียวกันได้ | ACCT-2 ลงลิสติ้งที่ตรงทั้งสอง alert → alerts | **watch row ราย alert** (≥2 rows ชื่อ alert ต่างกัน — hit ราย alert ตาม contract) — engine ไม่เด้ง → `BLOCK` | — | MED | |
| WA-054 | โพสต์ตัวเองตรง alert ตัวเอง → เด้ง (lock) | MEMBER | POSITIVE | `WA-SEARCH` ON + MEMBER ลงขายได้ | MEMBER ลงลิสติ้ง Sale ตรง `CRIT-X` ของตัวเอง → alerts | มี watch row ใหม่ — ไม่ exclude self-match (lock 2026-10-29 เหมือน saved-search ของ marketplace จริง) — engine ไม่เด้ง → `BLOCK` | — | MED | |
| WA-055 | ลิสติ้งของคนที่ block/mute → ไม่ match | MEMBER + ACCT-3 | NEGATIVE | `WA-SEARCH` ON + MEMBER block `ACCT-3` | ACCT-3 ลงลิสติ้งตรง `CRIT-X` → alerts + matches now | ไม่มี row + ไม่นับ — post ของผู้ถูก block/mute/ni ออกจาก match pool (00_GLOBAL §13) — ไม่มีบัญชีสาม → `BLOCK` | — | HIGH | |
| WA-056 | tap watch row → Post Viewer ตรง | MEMBER | POSITIVE | มี watch row (WA-043) | แตะ row | Post Viewer เปิด**โพสต์ที่ match โดยตรง** (title `Post`) — ไม่มี result list คั่น; back → alerts (เด็ดขาดเหมือน ALT-028) | — | HIGH | |
| WA-057 | ลบ alert แล้ว row เก่ายังกดได้ | MEMBER | POSITIVE | มี watch row จาก alert ที่ถูกลบแล้ว | ลบ alert นั้น → กลับ alerts → แตะ row เดิม | เปิด Post Viewer ลิสติ้งเดิมได้ปกติ — row ไม่ผูก alert id (ลบ alert ไม่ลบ notification ที่ส่งไปแล้ว) | — | MED | |
| WA-058 | ลิสติ้งที่ match ถูกลบทีหลัง | MEMBER + ACCT-2 | NEGATIVE | มี watch row แล้ว ACCT-2 ลบลิสติ้งนั้น | แตะ row | **ไม่เปิด viewer** — unavailable state `รายการนี้ไม่พร้อมใช้งานแล้ว/This post is no longer available` + ปุ่ม `Go back` (contract 00_NAV §10 — ห้าม silent no-op; ตรง ALT-032) — ไม่มีวิธีทำลิสติ้งหาย → `BLOCK` | — | MED | |
| WA-059 | push นอกแอป → PV ลิสติ้ง | MEMBER + ACCT-2 | POSITIVE | notif permission ON + แอปเครื่องหลักปิด/background + `WA-SEARCH` ON | ACCT-2 ลงลิสติ้ง match → ดูเครื่องหลัก → แตะ push | push/banner เด้งนอกแอป → แตะ push → เปิด Post Viewer ลิสติ้ง match ตรง (ปลายทางเดียวกับ row tap) — ไม่มี push → `BLOCK` | — | MED | |
| WA-060 | ไม่มี triggered marker บน alert row | MEMBER | NEGATIVE | มี alert ที่เคยเด้งแล้ว + ที่ยังไม่เคยเด้ง | เทียบแถวสองแถวใน `walerts` | แถวแสดง anatomy เหมือนกันทุกประการ — V1 **ไม่มี** marker/ป้าย "เคยแจ้งเตือน"/last-triggered บน alert row (เด้งเห็นที่ alerts feed เท่านั้น) | — | LOW | |
| WA-061 | `{n} matches now` นับ pool ลิสติ้ง Sale จริง | MEMBER + ACCT-2 | STATE | `WA-SEARCH` ON | บันทึก count → ACCT-2 ลงลิสติ้งตรง → เปิด walerts ใหม่ → ให้ ACCT-2 mark sold ใบที่ตรง → เปิดใหม่ | count เพิ่มเมื่อมีลิสติ้ง Sale ตรงใหม่ + ลดเมื่อลิสติ้งออกจาก Sale (sold/ลบ/ซ่อน) — นับ server-backed ทุกครั้งที่เปิดหน้า | — | MED | |

### 2.7 Nav / State / Language / Theme

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| WA-062 | back ของ walerts กลับ Settings | MEMBER | POSITIVE | อยู่ `walerts` | แตะ `<` บนหัว | กลับหน้า Settings เดิม (pop ทีละหน้า — walerts push ทับ Settings) — ไม่กลับ feed | — | HIGH | |
| WA-063 | device back จาก walerts | MEMBER | POSITIVE | อยู่ `walerts` | กด device back (ปุ่ม/เจสเจอร์ OS) | เทียบเท่าปุ่ม `<` — กลับ Settings ไม่ออกแอป | — | HIGH | |
| WA-064 | device back ขณะ sheet เปิด | MEMBER | POSITIVE | sheet `wa` เปิดอยู่ | กด device back → กดอีกครั้ง | ครั้งแรกปิด sheet เท่านั้น (หน้าข้างล่างไม่ถูก pop) — ครั้งสองค่อยย้อนหน้า — ปิดทีละชั้น | — | HIGH | |
| WA-065 | device back ขณะ confirm dialog | MEMBER | POSITIVE | confirm dlg `Delete watch alert?` เปิด | กด device back | ปิด dialog — **ไม่ลบ** alert (เหมือนกด Cancel) | — | MED | |
| WA-066 | dismiss sheet ผ่าน backdrop | MEMBER | STATE | sheet create เปิดพร้อมชื่อ+mode | แตะพื้นหลังนอก sheet → เปิด `walerts` | sheet ปิด + ไม่มี alert ใหม่ (draft ทิ้ง — เหมือน WA-018) | — | MED | |
| WA-067 | ภาษาตามแอปทุกส่วน (lock) | MEMBER | POSITIVE | ตั้งภาษาไทยแล้วอังกฤษ | ไล่: sheet title/label/placeholder/section/mode title+desc+count/CTA/Delete, หน้า walerts (title/desc/rows/mode label/count/empty), toasts ทุกตัว, confirm dlg, `No details` toast | ทุกข้อความ UI + toast ตามภาษาแอป — **ค้าง EN ขณะภาษาไทย = FAIL** (prototype EN-hardcode ถือเป็นบั๊กในแอปจริง); ยกเว้นชื่อ alert ที่ตั้งเอง/ชื่อแบรนด์ใน criteria | — | HIGH | |
| WA-068 | dark theme อ่านได้ | MEMBER | POSITIVE | theme = dark | ไล่ sheet + mode rows + walerts list (รวม paused dim) + confirm dlg + toggle | อ่านได้ครบ contrast โอเค — paused/ON แยกได้ใน dark ไม่มีจุดจมพื้นหลัง | — | HIGH | |
| WA-069 | แตะรัวไม่ซ้อน | MEMBER | EDGE | sheet create เปิด / อยู่ walerts | แตะ Create รัว ๆ / แตะ toggle รัว ๆ / แตะ Delete รัว ๆ | ไม่สร้าง alert ซ้ำ ไม่ค้าง ไม่เปิด dialog ซ้อนเกินหนึ่ง — back ไล่ทีละชั้น | — | LOW | |

### 2.8 Real Device Edge

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| WA-070 | persist ข้ามเปิดแอป (lock) | MEMBER | STATE | มี alert ≥1 | kill แอป → เปิดใหม่ → `walerts` | alerts ยังครบทุกแถว + on-state + bell states เดิม — server-backed (lock ข้อ 1); หาย = FAIL | — | HIGH | |
| WA-071 | persist ข้าม sign-out/in (lock) | MEMBER | STATE | มี alert ≥1 | sign out → sign in บัญชีเดิม → `walerts` | alerts ยังครบ — ไม่หายตามการสลับ session | — | HIGH | |
| WA-072 | sync ข้ามเครื่อง (lock) | MEMBER (+เครื่องสาม ถ้ามี) | STATE | sign in `ACTOR-MEMBER` สองเครื่องได้ | เครื่อง A สร้าง/แก้/pause/ลบ alert → เครื่อง B เปิด `walerts` | เห็น alerts + สถานะเดียวกันข้ามเครื่อง (server-backed lock) — build จำกัดเครื่องเดียว → `BLOCK` | — | MED | |
| WA-073 | alerts เป็นของบัญชีตัวเองเท่านั้น | MEMBER + ACCT-2 | STATE | MEMBER มี alerts | sign out → sign in `ACCT-2` → `walerts` | เห็นเฉพาะ alerts ของ `ACCT-2` (ว่างถ้าไม่เคยสร้าง) — ไม่เห็นของ MEMBER | — | HIGH | |
| WA-074 | offline เปิด walerts | MEMBER | NEGATIVE | walerts เคยโหลดไว้ | เครื่องบิน → เปิด `walerts` → เปิดเน็ตกลับ → แตะ `ลองใหม่` | error state `Unable to load data` + ปุ่ม `ลองใหม่/Try again` — ห้าม crash/จอขาว/แสดง list เก่าแบบเงียบ ๆ — กดลองใหม่ตอนเน็ตกลับ → โหลดได้ | — | MED | |
| WA-075 | offline write ไม่บันทึกหลอก (lock) | MEMBER | NEGATIVE | เครื่องบิน + sheet create เปิด/อยู่ walerts | เครื่องบิน → กด Create (หรือ edit/pause/delete) → ดูผล → เปิดเน็ตกลับ → เปิด walerts ใหม่ | แจ้ง error/ล้มเหลวชัดเจน + **ไม่มี alert/การเปลี่ยนแปลงที่ server ไม่รู้จัก** — ขึ้นสำเร็จหลอก = FAIL; ตอนเน็ตกลับ list ต้องตรง server | — | HIGH | |
| WA-076 | criteria ขัดแย้งกัน → สร้างได้ แต่ไม่เด้ง | MEMBER | EDGE | `CRIT-CONFLICT` (brand A + model ของ brand B ใน criteria เดียวกัน mode `all`) | สร้าง alert ด้วย criteria ขัดแย้ง → ดู `{n} now` ใน sheet + เปิด walerts | สร้างสำเร็จ (ไม่มี validation block) + `{n} matches now` = 0 เสมอ + ไม่เด้งกับลิสติ้งใด — ไม่เคย match ทางกายภาพ | — | MED | |
| WA-077 | inactive market data → หยุด trigger + warning | MEMBER + BO | NEGATIVE | alert ที่อ้าง entity/option ที่ BO กำลังจะ deactivate | ให้ admin deactivate option นั้นบน BO → เปิด walerts + ให้ ACCT-2 ลงลิสติ้งที่เคยตรง | alert เก็บอยู่ใน list แต่**หยุด trigger ใหม่** + แสดง dependency warning บนแถว/ใน sheet (contract §9 Production Rules — ต่างจาก "no current listing" ที่ alert ยังทำงานปกติ) — ไม่มีสิทธิ์ BO/ทำไม่ได้ → `BLOCK` | warning เห็นชัด | MED | |
| WA-078 | backfill re-match dedup | MEMBER + BO | EDGE | มี watch row จาก match เดิมอยู่แล้ว | ให้ admin promote suggestion/map alias ที่กระทบ alert เดิมบน BO → รอ re-match → เปิด alerts | ไม่มี watch row ซ้ำสำหรับ `(alert_id, asset_id)` เดิม — มีเฉพาะ row ของ match ใหม่จริง (contract dedup) — ไม่มีสิทธิ์ BO → `BLOCK` | — | MED | |
| WA-079 | delete account → alerts ยกเลิก | MEMBER | EDGE | บัญชีทดสอบที่ยอมลบทิ้งได้ + มี alerts | เริ่ม delete account → อ่าน terms → ผ่าน flow จน scheduled → login กลับ (restore) → เปิด `walerts` | terms แสดงการ์ด `การแจ้งเตือนนาฬิกาจะถูกยกเลิก`/`Watch Alerts Cancelled` + หลัง restore `walerts` **ว่าง** (alerts ถูกยกเลิกตอนเริ่มลบ) — ไม่มีบัญชีที่ลบทิ้งได้ → `BLOCK` | — | MED | |

## §3 Spec deviations/contract ที่กระทบเคสเล่มนี้

| จุดจาก spec 10 / contract | พฤติกรรม expected ในแอปจริง | TC ที่ครอบ |
| --- | --- | --- |
| `WATCH_ALERTS` ไม่ restore หลัง session switch (เดิม deviation #12 — RESOLVED: lock server-backed + prototype persist `fo_walerts`) | alerts อยู่รอดปิดแอป + sign-out/in + sync ข้ามเครื่อง | WA-070..072 |
| Delete instant ไม่ confirm (เดิม deviation #3 — RESOLVED 2026-10-29: confirm dlg ตาม destructive pattern ทั้งแอป — แก้ spec+prototype แล้ว) | `wa-del` → confirm dialog ก่อนลบเสมอ ลบทันที = FAIL | WA-041, 042, 065 |
| List ordering spec เดิมเงียบ (RESOLVED: ใหม่สุดบนสุด — แก้ spec+prototype แล้ว) | alert ล่าสุดอยู่บนสุด | WA-029 |
| `salePosts` pfkind leak — priced show/hide/sold ถูกนับ (S-10 defect — contract Sale only) | match/count เฉพาะลิสติ้ง Sale — เห็นนับ/เด้งสถานะอื่น = FAIL | WA-050, 061 |
| Match feedback = `_waHits` toast simulation เท่านั้น (deviation #6) | engine จริงบน server สร้าง watch row จริง — ไม่มี engine = BLOCK §2.6 | WA-043..061 |
| `modelKey` ต่อ detail-created เท่านั้น (deviation #15 — RESOLVED เจตนาโดยพี่คิง) | search alert ไม่ขับ bell แม้ criteria ตรงรุ่น | WA-025 |
| Paused alert ยังเป็น dedupe target (deviation #9) | bell เจอ alert off ที่ตรง → เปิด edit ไม่สร้างซ้ำ | WA-022 |
| `sr-wa` bell on เฉพาะ `source:"search"` (deviation #8) | sig ตรง detail alert → edit แต่ bell ไม่ on | WA-021 |
| Toasts EN-only hardcode (deviation #11) | toast/ข้อความ UI ตามภาษาแอป — EN ค้าง = FAIL | WA-067 (+ทุกเคส toast) |
| Offline write — spec เดิมเงียบ (lock 2026-10-29) | error ชัดเจน + ไม่บันทึกหลอก | WA-075 |
| Self-match (lock 2026-10-29) | โพสต์ตัวเองตรง alert ตัวเอง → watch row ปกติ | WA-054 |
| ไม่มี alert-per-alert notification history (deviation #16) | ไม่มี triggered marker บน alert row | WA-060 |
| `notif_settings` toggle `walerts` = contract-level opt-out | OFF หยุด watch row ใหม่ — covered โดย ALT-053 (FO-TEST-10) | — |
| Production contract: inactive market data / backfill dedup / relation-id criteria | alert หยุด trigger + warning เมื่อ option deactivated; re-match dedup `(alert_id, asset_id)` | WA-077, 078 |
| Delete account → Watch Alerts Cancelled (canonical 13) | alerts ยกเลิกอัตโนมัติตอนเริ่มลบ + terms card | WA-079 |

**FO-SYNC-01 sync (2026-10-29):**

- **RESOLVED — Toasts EN-only (deviation #11)**: `Watch alert on`/`updated`/`paused`/`removed` + `You already saved this alert` + `No details on this post to watch` + `Watch alert matched: {n} (+N more)` เพิ่ม `I18N_TH` dict + `i18nTr` pattern แล้ว — spec 10 §293 ปิด deviation ตาม
- **ต่างโดยเจตนา (คงไว้)**: `_waHits` toast = match simulation (engine จริง = server contract — deviation #6) · `modelKey` เฉพาะ detail-created (เจตนา — พี่คิงล็อก) · paused alert เป็น dedupe target · `sr-wa` bell on เฉพาะ `source:"search"` · ไม่มี per-alert history — ทั้งหมด documented deviations ตาม spec

## §4 Traceability — inventory §2.6 + actions ครอบ

| Inventory หน้า/route | Action ใน inventory | TC ที่ครอบ | หมายเหตุ |
| --- | --- | --- | --- |
| `sr-wa` bell (results head) | เปิด sheet create/edit · on-state · dedupe by sig · snapshot จาก S | WA-001, 004, 006, 010, 021 | criteria ครอบ q+filters+price |
| `mf-btn` (Post Detail act-right) | เปิด sheet create/edit · modelKey dedupe · `No details` toast · bell on/off sync | WA-002, 004, 007, 011, 022, 023, 024, 025, 040, 042 | canonical 05 §9 |
| sheet `wa` create | title/name/modes+count/disabled/draft persist/CTA/no-delete | WA-009..018 | shared ทุก entry |
| sheet `wa` edit | title edit/Save changes/Delete alert/ไม่มี criteria editor | WA-019, 034..038, 041 | |
| `walerts` page | head/desc/rows/empty/ordering/back→settings | WA-003, 026, 028, 029, 062, 063 | entry ผ่าน Settings เท่านั้น (WA-008) |
| `.wa-row` | name/criteria text/Edit badge/mode label/count/toggle/dim/ไม่มี delete | WA-027, 030..033 | |
| `.wa-tgl` | pause/resume + toast + sync flags/bells | WA-039, 040, 051 | |
| `.wa-del` | confirm dlg → delete + toast + sync | WA-041, 042, 065 | lock confirm |
| settings row `Watch Alerts` | entry + count badge | WA-003, 032 | canonical 13 |
| guest gate | `.sr-wa`/`.mf-btn` ∈ GUEST_GATE_SEL · walerts unreachable | WA-001..004 | |
| match engine (contract) | match → watch row · modes · fk semantics · Sale pool · paused/deleted · multi-alert · self · blocked | WA-043..055, 061 | BLOCK-if engine |
| destination (canonical 09) | watch row → PV ตรง · row เก่าหลังลบ alert · ลิสติ้งหาย | WA-056..058 | ref ALT-028/032 |
| push transport | push watch match → PV | WA-059 | BLOCK-if |
| nav/state/lang/theme | back stack · device back ทีละชั้น · backdrop · TH · dark · แตะรัว | WA-062..069 | |
| real-app contract | persist/cross-device/isolation/offline/conflict/market-data/backfill/delete-account | WA-070..079 | BLOCK-if ตามเงื่อนไข |

## หมายเหตุท้าย

- **ก่อนส่งงานจริง**: เขียนเสร็จ → รอ PO/หัวหน้ารีวิว → แก้ตาม feedback → ค่อยปิด task (กฎเดียวกับทุกเล่ม)
- **ข้อมูลจริงบน server เป็นตัวแปรหลัก** — จำนวน match/`{n} now`/จำนวนลิสติ้งขึ้นข้อมูลจริง: expected ทุกข้อตัดสินได้จากข้อมูลที่มีจริง อย่า FAIL เพราะจำนวนน้อยกว่าตัวอย่าง
- **เคส BLOCK ล่วงหน้าที่คาดว่าอาจเจอ**: WA-013 (เข้าผลลัพธ์ว่างไม่มีเงื่อนไขไม่ได้), WA-019/020/021 (ทำ criteria ตรงเป๊ะผ่าน UI ยาก), WA-024 (ไม่มีโพสต์เรือนสอง modelKey เดียวกัน), WA-033 (ไม่มีข้อมูลยาว), WA-043..055/058/059/061 (match engine + push ยังไม่ implement), WA-055 (ต้องบัญชีสาม), WA-072 (build จำกัดเครื่องเดียว), WA-077/078 (ต้องสิทธิ์ BO), WA-079 (ต้องบัญชีลบทิ้งได้)
- **ครอบโดยเล่มอื่น ไม่ทำซ้ำ**: watch row anatomy/badge/mark-all/`walerts` toggle enforcement → FO-TEST-10 (ALT-010..056) · Post Viewer internals → FO-TEST-06 · Member Sheet internals → FO-TEST-17 · `notif_settings` anatomy + delete account flow → FO-TEST-15
- **จุดที่แก้ spec+prototype ในรอบนี้** (align ให้ตรง contract ก่อนเทส): (1) `wa-del` → confirm dialog `Delete watch alert?`/`ลบการแจ้งเตือนนี้หรือไม่?` + `dlg-wadel-go` แทน instant delete (2) `walertsHTML` เรียงใหม่สุดบนสุด (3) persist `WATCH_ALERTS` ผ่าน `fo_walerts` + `waLoad` ใน `restoreUserData` + `syncModelFlags` หลัง applySessionData + ล้าง key ตอน demo reset (4) spec 10: §3/§4/§8/§9/§12/§14/§16/deviations/§18 อัปเดต RESOLVED + lock notes ตามการตัดสิน 6 ข้อ

- สถิติ: **79 TC** — High 39 / Medium 37 / Low 3 (SETUP rows 11 แถวแยกใน checklist; รวมใน csv 90 แถว)
