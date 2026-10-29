# FO-TEST-001-13 — Test Cases: Portfolio & Asset Management (แอปมือถือจริง)

**Task**: FO-TEST-13 ของชุด FO-TEST-001 — เขียนเป็นเวอร์ชันเทสแอปมือถือจริงตั้งแต่แรก (ไม่มีรอบ prototype แยก เพราะ spec ล็อกแล้ว)
**SoT**: แอป TukDaeng build ทดสอบบนมือถือจริง — expected ล็อกตาม `FrontOffice/14_PORTFOLIO_MODULE.md` (AC-PORT-001..022) + `04_ASSET_MANAGEMENT_MODULE.md` (drawer lifecycle/`assetId`/`pfkind`/mark-as-sold/delete canonical) + `05_ASSET_DETAIL_MODULE.md` (private-data boundary) + `06_PROFILE_MODULE.md` (entry `pf-pfo` + own/public tabs) + `00_NAVIGATION_AND_CROSS_MODULE_FLOW.md` (sub-stack back/unavailable contract) + `00_GLOBAL_RULES_MODULE.md` §10 visibility matrix + `docs/money-display-rules.md` (DRAFT — อ้างเฉพาะจุดที่ spec 14 ล็อกไว้แล้ว) — `Prototypes/fo-flow` = แค่ reference ว่าหน้าตาควรเป็นแบบไหน
**Scope**: `portfolio` dashboard + `pfasset:{id}` + `sell:{id}` + `soldhist` + `sold:{id}` + asset lifecycle ทุก transition (Sale/Show/Hide/Sold) + Add-asset entry จาก own profile + ความต่อเนื่องข้าม surface (feed/search/profile/detail/chat) + persistence + guest gate + real-app behaviors
**ยกเว้น**: composer internals (ฟอร์มสร้าง asset/โพสต์ทีละขั้น, photo picker, spec/cond/cost panes) — ของ FO-TEST-05 (เล่มนี้เช็กเฉพาะ entry + ผลลัพธ์ที่ตกลง portfolio) · Post Viewer/Detail internals — ของ FO-TEST-06 · feed eligibility/ordering — ของ FO-TEST-03 · search/Watch Alert internals — ของ FO-TEST-04/11 (เช็กเฉพาะ visible/absent) · own-profile anatomy/tabs ละเอียด — ของ FO-TEST-12 · Member Sheet internals — ของ FO-TEST-17 · BO Market Data internals — นอก scope FO
**การตัดสินล็อก 2026-10-30** (ถามผู้ใช้ก่อนเขียน): (1) เคสกลุ่มที่ต้องใช้**ราคาตลาด** (Estimated market / Unrealized G/L / Market value line / Market comparison chip / Data source / Last update) เขียนเต็มทุกสูตร แต่ precondition = "server มีราคาตลาดของรุ่นนั้นจริง" — build ที่ยังไม่มี market data → กลุ่มนี้ `BLOCK` ทั้งชุด ส่วนเคสฝั่ง fallback (`—`/`No market price`/`Market value unavailable`) ทำได้เสมอด้วย asset ที่ไม่มีราคาตลาด (2) expected ตาม **canonical** ทั้ง 3 จุดที่ prototype deviate: ลบโพสต์ → asset หายจาก portfolio ด้วย · เปลี่ยน Show/Hide→Sale ผ่าน Edit → ขึ้น feed + ค้นเจอ · ของสถานะ Show/Hide/Sold ไม่โผล่ search + ไม่ชนเงื่อนไข watch alert (3) ฟอร์มบันทึกการขายมีแค่ **ราคาขาย + วันที่ขาย** — ไม่มีช่องผู้ซื้อ/ช่องทางติดต่อ/วิธีจ่าย (เคสเช็กว่าไม่มี) และหน้า Portfolio **ไม่มี** ปุ่มเพิ่มของข้างใน (เพิ่มได้แค่จาก own profile)
**หมายเหตุ**: เขียนเสร็จรอรีวิว — อย่าเพิ่งปิดงาน

---

## §0 วิธีใช้ + สภาพแวดล้อม + กติกาที่ล็อก

- **ทดสอบบนเครื่องจริงเท่านั้น** — ติดตั้งแอป build ทดสอบลงมือถือจริง แตะ/ปัด/พิมพ์/เลื่อนบนหน้าจอจริง — **ไม่ใช้ browser, dev console, ปุ่ม dev/demo, localStorage, OTP จำลอง** — เตรียมสถานะด้วย action จริงในแอป + ข้อมูลจริงบน server เท่านั้น
- **Actors**: `GUEST` = ไม่ sign in · `MEMBER` = บัญชีทดสอบจริงบนเครื่องหลัก (เจ้าของ portfolio) · `NEW` = สมัครใหม่ (portfolio ว่างเสมอ) · `ACCT-2` = **บัญชีจริงที่สอง บนเครื่องจริงอีกเครื่อง** — ใช้เป็น public viewer + cross-device sync + ฝั่ง buyer ที่คุยก่อนขาย — เคสที่ต้องบัญชี/เครื่องอื่นแต่ไม่มี → mark `BLOCK` ระบุใน Note
- **Server sync เป็นตัวแปรใหญ่ของเล่มนี้** — contract บังคับให้ทุก asset/portfolio state อยู่ฝั่ง server; build ที่ state ไม่ persist/ไม่ sync ข้ามเครื่อง → เคส §2.9 ที่เกี่ยว = `BLOCK`/`FAIL` ตามอาการ (persist ไม่รอด = FAIL contract, ไม่ใช่ทางเลือก) — **ห้าม**นับ mirror/localStorage เป็นหลักฐาน persist
- **Type**: `POSITIVE` · `NEGATIVE` · `EDGE` · `STATE` · `GATE` (บังคับ sign in) · `GATE-inverse` (ยืนยันเปิดเสรี)
- **[GATE] ทุกเคสเทส 2 รอบ**: รอบ A `GUEST` → expect Member Sheet; รอบ B `MEMBER` → expect feature ทำงาน
- **[MKT] precondition ราคาตลาด**: เคสที่เขียน "server มีราคาตลาด" ต้องเลือก asset ที่ `แหล่งข้อมูล`/`Data source` แสดงแหล่งราคาจริง (จดจาก SETUP-06) — build/รุ่นที่ไม่มี market data → เคสนั้น `BLOCK` พร้อมเหตุผล ห้ามเดาเลขแทน
- **ตัวเลขทุกตัวคำนวณจากข้อมูลจริง** — expected เขียนเป็นสูตร (`Σ purchase`, `asking − purchase`, `(asking−market)/market×100`) — tester ใช้ตัวเลขที่จดจาก SETUP-06 คำนวณเทียบ อย่า FAIL เพราะเลขไม่ตรงตัวอย่าง
- **Device back เทียบเท่าปุ่มย้อนในแอป/ปิดทีละชั้น** — sheet/dialog/overlay เปิดอยู่ต้องปิดชั้นบนสุดก่อน เคสที่มีขั้น "แตะ back/ปิด" ใช้ device back ของ OS แทนได้ ผลต้องเทียบเท่ากัน
- **ภาษาตามแอปทั้งหมด** (ล็อก 2026-10-28): ทุกข้อความ UI + toast เปลี่ยนตามภาษาที่เลือก — เจอ string ค้างอีกภาษา = **FAIL** (prototype hardcode EN หลายจุด เช่น chip `Sale/Show/Hide`, `Above/At/Below market`, `No market price` — ในแอปจริงถือเป็นบั๊ก); ยกเว้นชื่อ user/แบรนด์/รุ่น/reference
- **Dark theme**: ทุกหน้า/sheet/dialog อ่านได้ครบใน dark — contrast โอเค ไม่มีตัวอักษรจมพื้นหลัง
- **Priority**: `HIGH` = กติกาหลัก/flow สำคัญ · `MED` = feature หลัก/edge · `LOW` = quirk; เคส BLOCK-if = MED เว้นกำหนด
- **Result column**: เว้นว่าง — tester กรอก `PASS`/`FAIL`/`BLOCK` + ปัญหาใน `Note`
- **ไม่มีเคสแบบ "จดผล" ไม่มีผลลัพธ์ทางเลือก** — ทุกเคส expected ตรง spec/contract ข้อเดียวเด็ดขาด ไม่ตรง = FAIL
- **Out of scope**: ตามหัวข้อ ยกเว้น ด้านบน — เคสใดเจอว่า feature ยังไม่ implement ใน build → `BLOCK` พร้อมเหตุผลใน Note (ห้าม workaround)

## §1 Coverage map

| Route / Surface (inventory §2.9 + spec 14/04) | ขอบเขต | TC ที่ครอบ |
| --- | --- | --- |
| entry `pf-pfo` → `portfolio` | gate · entry เดียว · anatomy · empty (NEW) · no nav · dev-sim ห้ามโผล่ | AST-001..008 |
| `portfolio` dashboard | Total invested · coverage · market line · eligibility · rows/count/link · ไม่มี add/sort/filter · scroll ยาว | AST-009..022 |
| `pfasset:{id}` | hero/dots · status chip · Value card 9 rows · Listing card (sale) · Mark as sold · no edit/delete · not-found | AST-023..037 |
| `sell:{id}` | entries (pfasset + own-post menu) · hero/prefill · Expected gain live · validation · cancel · save → transition · stack | AST-038..054 |
| `soldhist` + `sold:{id}` | list newest-first · empty · sold detail cards · G/L math · holding · immutable · View sale record | AST-055..064 |
| status lifecycle | Show/Hide→Sale · Sale→Hide/Show · drawer OFF · rapid toggle · sold terminal · edit price/cost · delete | AST-065..075 |
| Add asset + cross-surface | `+` Show/Hide/Feed · empty CTA · cost fields · visibility matrix · consistency sweep | AST-076..085 |
| edge / error / empty | broken image · stale/deleted link · hidden/sold link → unavailable · zero/huge price · sold viewer · double save · all-sold empty | AST-086..095 |
| persistence / lang / theme / device | kill · sign-out · device B sync · TH/EN · dark · device back · offline · rotate | AST-096..106 |

## §2 Test cases

ผู้ทดสอบ: อ่าน expected ก่อนรันเสมอ — เคสที่เขียน "BLOCK ถ้า..." ให้ mark BLOCK พร้อมเหตุผลใน Note (ห้าม workaround)

### Setup

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SETUP-01 | ติดตั้งแอป | — | SETUP | เครื่องจริงเครื่องหลัก | ติดตั้ง build ทดสอบที่ทีมส่งให้ → เปิดแอป | เปิดขึ้น feed หรือ onboarding | splash/หน้าแรกขึ้นตาม build | — | |
| SETUP-02 | สถานะเริ่มต้น | — | SETUP | แอปติดตั้งแล้ว | ลบข้อมูลแอป/ติดตั้งใหม่ ถ้าเคยใช้เครื่องนี้มาก่อน | แอปสะอาด เหมือนผู้ใช้ใหม่ | — | — | |
| SETUP-03 | ผู้ใช้ GUEST | — | SETUP | แอปสะอาด | ไม่ sign in → เดินเข้า feed ได้เลย | guest mode | bottom nav ครบ | — | |
| SETUP-04 | ผู้ใช้ MEMBER | — | SETUP | แอปสะอาด | sign in ด้วยบัญชีทดสอบที่ทีมสร้าง | เข้า feed เป็นสมาชิก | avatar/ชื่อตัวเองในที่ที่ต้องแสดง | — | |
| SETUP-05 | ผู้ใช้ NEW | — | SETUP | แอปสะอาด | สมัครใหม่ด้วยอีเมล/เบอร์ทดสอบจริง → ผ่าน onboarding จนเข้า feed | member ใหม่ — portfolio/โพสต์ว่างเสมอ | — | — | |
| SETUP-06 | ชุด asset อ้างอิง | MEMBER | SETUP | sign in แล้ว | สร้างผ่านแอปจริง (ปุ่ม `+` / composer) แล้วจดค่าลง Note: `A-SALE` = โพสต์ลงฟีด ≥2 รูป + ราคาซื้อ + วันที่ซื้อ + ราคาตั้งขาย · `A-SHOW` = โชว์ + ราคาซื้อ/วันซื้อ · `A-HIDE` = ซ่อน + ราคาซื้อ/วันซื้อ · `A-NOCOST` = ซ่อน ไม่ใส่ราคาซื้อ/วันซื้อ · เปิด `pfasset` แต่ละชิ้นจด `แหล่งข้อมูล` = มี/ไม่มีราคาตลาด + ค่า market + วันอัปเดต → จด `A-MKT` = ชิ้นที่มี market · `A-NOMKT` = ชิ้นที่ไม่มี · จด รุ่นเครื่อง + OS | ข้อมูลจดพร้อม — สร้าง asset ไม่ได้ = เคสที่เกี่ยว `BLOCK` ทั้งเล่ม; server ไม่มีราคาตลาดเลย = เคส [MKT] `BLOCK` ทั้งชุด | — | — | |
| SETUP-07 | ทางเข้า | MEMBER | SETUP | sign in แล้ว | own profile → แตะ wallet → `portfolio` เปิด → แตะแถว `A-SALE` → `pfasset` เปิด → back → `ประวัติการขาย →` → `soldhist` เปิด | ทุก entry เปิดหน้าถูก — เข้าไม่ได้ = เคสที่เกี่ยว BLOCK | ตำแหน่งปุ่มตาม spec 06/14 | — | |
| SETUP-08 | เครื่องที่สอง + ACCT-2 | — | SETUP | มีเครื่องจริงอีกเครื่อง | ติดตั้ง build เดียวกันลงเครื่องสอง → sign in `ACCT-2` → เปิด notification permission ทั้งสองเครื่อง | บัญชีสองพร้อม — ถ้าไม่มี → เคส ACCT-2/cross-device เป็น BLOCK | — | — | |
| SETUP-09 | ACCT-2 ถามลิสติ้งก่อนขาย | ACCT-2 | SETUP | `A-SALE` อยู่บน feed | เครื่องสอง: ACCT-2 เปิด `A-SALE` → `สอบถาม/Ask` → ส่งข้อความ 1 ฉบับ | ห้อง DM กับ MEMBER มีการ์ดลิสติ้ง `A-SALE` เป็นข้อความ + ข้อความขึ้นฝั่งขวา — ใช้เช็กหลังขาย (AST-089) | — | — | |
| SETUP-10 | baseline visibility | MEMBER | SETUP | SETUP-06 เสร็จ | เปิด: feed (เห็น `A-SALE`) · search รุ่นนั้น (เจอ `A-SALE`) · own profile แท็บ Sale/Show/Hide · `portfolio` (เห็น 4 แถว A-SALE/A-SHOW/A-HIDE/A-NOCOST) | ทุก surface เห็นของถูกที่ตามสถานะ — จุดใดไม่ตรง จดลง Note เป็นบริบทก่อนรัน | — | — | |

### 2.1 Entry & Access — เข้า Portfolio

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| AST-001 | [GATE] เข้า portfolio | GUEST/MEMBER | GATE | SETUP-03/04/07 | **รอบ A (GUEST)**: แตะแท็บ Profile บน nav → ปิด sheet · **รอบ B (MEMBER)**: เปิด own profile → แตะ wallet | A: Member Sheet `Join TukDaeng` เด้ง — guest ไม่มีทางถึง own profile/portfolio เลย; B: `portfolio` push เปิด | B: head `พอร์ตโฟลิโอ/Portfolio` + back | HIGH | |
| AST-002 | entry เดียว — wallet เท่านั้น | MEMBER | NEGATIVE | sign in แล้ว | หาทางเข้า portfolio จากจุดอื่น: public profile `U-2` (ไม่มีปุ่ม wallet) · feed · search · settings · ชื่อ/ตัวเลขบน own profile | **ไม่มี** entry ใด ๆ นอกจากปุ่ม wallet บน own profile ตัวเอง — โปรไฟล์คนอื่นไม่มีปุ่ม wallet ไม่มีตัวเลขมูลค่าให้กด | — | HIGH | |
| AST-003 | portfolio anatomy | MEMBER | UI | `portfolio` เปิด | อ่านหน้าบน-ล่าง | head: back + `พอร์ตโฟลิโอ/Portfolio` (ไม่มี ⋯/menu ใด ๆ) · บล็อก headline (`ต้นทุนรวม` + `ส่วนตัว` tag + `THB N` + บรรทัดมูลค่าตลาด/ไม่พบข้อมูล + บรรทัด coverage) · `รายการนาฬิกา {N}`/`Assets {N}` + `ประวัติการขาย →` · rows · footnote — **ไม่มี bottom nav** (หน้าลึก) | layout ครบทุกส่วน | HIGH | |
| AST-004 | NEW → empty state | NEW | POSITIVE | account ใหม่ไม่มี asset | เปิด own profile → wallet → `portfolio` | wallet icon + `ไม่พบข้อมูล`/`No data found` + `นาฬิกาที่คุณระบุสถานะ ลงขาย โชว์ หรือ ซ่อน จะแสดงที่นี่`/`Assets you list as Sale, Show or Hide will appear here.` — **ไม่มี** headline/ตัวเลข/rows | — | HIGH | |
| AST-005 | guest reach — ไม่มีทางถึง | GUEST | NEGATIVE | เป็น guest | เดินทุกทางที่เป็นไปได้: feed · public profile · search · tile/viewer | ไม่มี surface ใดพา guest เข้า portfolio/pfasset/soldhist/sell ได้เลย — จุดลึกทุกจุดเป็น owner-only (ไม่มี share/deep-link เปิดเสรี) | — | HIGH | |
| AST-006 | back → own profile จุดเดิม | MEMBER | STATE | own profile แท็บ Sale scroll ลง → wallet → portfolio | เปิด portfolio → back | กลับ own profile แท็บ Sale เดิม ตำแหน่ง scroll เดิม — ไม่เด้งกลับ All/บนสุด | — | MED | |
| AST-007 | ทุกหน้า portfolio = หน้าลึก ไม่มี nav | MEMBER | NEGATIVE | portfolio เปิด | เช็กขอบล่างบน `portfolio` → เข้า `pfasset` → `sell` → `soldhist` → `sold` ทีละหน้า | ทุกหน้าไม่มี bottom nav (sub page ทับเต็มจอ) — เจอ nav หลุดที่ไหน = FAIL | — | HIGH | |
| AST-008 | ไม่มี dev/preview controls บน production | MEMBER | NEGATIVE | build production | scroll ดูทั้งหน้า `portfolio` + head + soldhist | **ไม่มี** ⋯ menu/`Preview:` banner/ตัวเลือกจำลองสถานะ (nomkt/empty/failed/denied) — dev sims เป็น dev-only (AC-PORT-021) เจอบน build จริง = FAIL | — | MED | |

### 2.2 Portfolio Dashboard — ตัวเลข + List

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| AST-009 | headline = Total invested (Σ purchase) | MEMBER | POSITIVE | จด purchase ของทุกชิ้นจาก SETUP-06 | เปิด `portfolio` อ่าน headline → คำนวณ Σ purchase ของทุกชิ้น eligible ที่มีราคาซื้อ เทียบตัวเลขบนจอ | `ต้นทุนรวม`/`Total invested` + `ส่วนตัว`/`Private` tag + `THB {Σ}` = ผลรวมราคาซื้อจริง — ไม่ใช่มูลค่าปัจจุบัน/ตลาด — comma คั่นหลักพัน | — | HIGH | |
| AST-010 | coverage line | MEMBER | POSITIVE | มี asset ทั้งแบบมี/ไม่มีราคาซื้อ | อ่านบรรทัด coverage → นับชิ้นที่มี purchase>0 (X) กับชิ้น eligible ทั้งหมด (Y) | `ต้นทุนซื้อของ {X}/{Y} รายการ · มีเพียงคุณเท่านั้นที่เห็น`/`Purchase cost of {X}/{Y} assets · only you can see this` — X/Y ตรงจำนวนจริง | — | HIGH | |
| AST-011 | [MKT] market value line | MEMBER | POSITIVE | ≥1 ชิ้นมี market+purchase (SETUP-06: `A-MKT`) — server ไม่มี market เลย → `BLOCK` | อ่านบรรทัดมูลค่าตลาด → คำนวณ Σ market ของชิ้นที่มี market + GL% = Σ(market−purchase ของชิ้นที่คิดได้)/Σpurchase ชิ้นนั้น เทียบ | `มูลค่าตลาด`/`Market value` `฿{Σmarket}` · `±N.N%` ตรงสูตร — ค่าบวก class up/ลบ class dn | — | HIGH | |
| AST-012 | ไม่มี GL row → บรรทัด unavailable | MEMBER | POSITIVE | account/สถานะที่ชิ้น eligible ทุกชิ้นไม่มี market หรือไม่มี purchase (เช่น NEW + asset ที่ไม่มีราคาตลาด — เตรียมผ่านแอปจริง; เตรียมไม่ได้ → `BLOCK`) | เปิด `portfolio` อ่านบรรทัดมูลค่าตลาด | แสดง `ไม่พบข้อมูลมูลค่าตลาด`/`Market value unavailable` — **ไม่**แสดง `฿0` หรือเว้นว่าง | — | MED | |
| AST-013 | eligible = sale+show+hide เท่านั้น | MEMBER | POSITIVE | มี A-SALE/A-SHOW/A-HIDE (+ของขายแล้วหลัง AST-048) | เปิด `portfolio` เช็กรายชื่อแถว | แถว = ทุกชิ้นที่ status sale/show/hide เท่านั้น — ของที่ขายแล้ว/โพสต์ธรรมดา (ไม่เข้าลิ้นชัก) **ไม่**อยู่ใน list | — | HIGH | |
| AST-014 | row แสดงราคาซื้อ ไม่ใช่ราคาขาย/ตลาด | MEMBER | POSITIVE | portfolio เปิด | อ่านแต่ละแถว: รูป + ชื่อ + `ref · meta` + ตัวเลขขวาสุด | ตัวเลขขวา = `฿{purchase}` (ราคาซื้อ) — **ไม่ใช่** asking/market; ชิ้นที่ไม่มี purchase → `—` | — | HIGH | |
| AST-015 | `รายการนาฬิกา {N}` นับตรง | MEMBER | POSITIVE | portfolio เปิด | นับแถวจริงเทียบตัวเลขหลัง `รายการนาฬิกา`/`Assets` | count = จำนวนแถวที่แสดงจริงพอดี | — | MED | |
| AST-016 | row → `pfasset:{id}` | MEMBER | POSITIVE | portfolio เปิด | แตะแถว `A-SALE` | push `pfasset:{id}` ของชิ้นนั้น — title `รายละเอียดนาฬิกา`/`Asset` | — | HIGH | |
| AST-017 | back จาก pfasset → scroll เดิม | MEMBER | STATE | list ยาวพอ scroll (ไม่พอก็ยังต้องกลับ list) | scroll ลง → แตะแถวกลาง ๆ → `pfasset` → back | กลับ `portfolio` ตำแหน่ง scroll เดิม ไม่เด้งบนสุด | — | MED | |
| AST-018 | `ประวัติการขาย →` → `soldhist` | MEMBER | POSITIVE | portfolio เปิด | แตะ `ประวัติการขาย`/`Sold history →` | push `soldhist` — title `ประวัติการขาย`/`Sold history` | — | HIGH | |
| AST-019 | footnote อธิบายการนับ | MEMBER | UI | portfolio เปิด | อ่านบรรทัดท้ายหน้า | `นับเฉพาะนาฬิกาที่คุณเป็นเจ้าของในสถานะ ลงขาย โชว์ และ ซ่อน — ไม่รวมรายการที่ขายแล้ว ลบ ซ่อนถาวร หรือสินค้าฝากขาย`/`Counts Sale, Show & Hide pieces you own — sold, deleted, permanently hidden and consignment items are excluded.` | — | MED | |
| AST-020 | ไม่มี search/filter/sort/edit บน dashboard | MEMBER | NEGATIVE | portfolio เปิด | อ่านทั้งหน้า + กดค้าง/แตะแถวค้าง | **ไม่มี** ช่องค้นหา/ตัวกรอง/เรียง/ปุ่มแก้ไข/ลบ — เป็น list อ่านอย่างเดียว (action เดียวคือแตะแถวเข้า pfasset) | — | MED | |
| AST-021 | ไม่มีปุ่มเพิ่มของในหน้า Portfolio (lock) | MEMBER | NEGATIVE | portfolio เปิด (ทั้งเคสมีของและ empty) | หา `+`/Add/เพิ่มสินทรัพย์ ทุกตำแหน่งในหน้า | **ไม่มี** entry เพิ่ม asset ใด ๆ ในหน้า Portfolio — เพิ่มได้แค่ own profile `+`/ปุ่มหน้าว่าง (canonical Add-Asset Entry Rule) | — | HIGH | |
| AST-022 | list ยาว scroll ได้ครบ | MEMBER | EDGE | asset ≥15 ชิ้น (สร้างเพิ่มผ่านแอปจริงจนครบ — สร้างช้า/ไม่ได้ → `BLOCK`) | scroll ลงสุด → นับแถว → แตะแถวท้ายสุด → back | scroll ลื่นทุกแถว render ครบไม่ซ้ำไม่หาย; count ตรง; แถวท้ายเปิด pfasset ได้ปกติ | — | MED | |

### 2.3 Asset Detail — `pfasset:{id}`

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| AST-023 | pfasset anatomy | MEMBER | UI | `pfasset:{A-SALE}` เปิด | อ่านหน้าบน-ล่าง | head: back + `รายละเอียดนาฬิกา`/`Asset` · hero + counter `1/N` + dots · ชื่อ + `ref · meta · brand` + status chip · การ์ด `มูลค่า`/`Value` (+`ส่วนตัว`/`private` tag) · การ์ด `การลงประกาศ`/`Listing` (sale) · ปุ่ม `บันทึกการขาย`/`Mark as sold` · footnote `ข้อมูลเฉพาะเจ้าของ — จะไม่แสดงบนโปรไฟล์สาธารณะของคุณ`/`Owner-only data — never shown on your public profile.` — **ไม่มี** bottom nav | layout ครบ | HIGH | |
| AST-024 | status chip ตามสถานะ | MEMBER | POSITIVE | `pfasset` ของ A-SALE/A-SHOW/A-HIDE | เปิดทีละชิ้นดู chip | chip ตรงสถานะ: `Sale`/`Show`/`Hide` (label ตามภาษาแอป — spec เก็บ EN ไว้แต่ล็อกภาษาบังคับตามแอป) + สีต่างกัน | — | HIGH | |
| AST-025 | hero หลายรูป swipe | MEMBER | POSITIVE | `A-SALE` มี ≥2 รูป | ปัดซ้าย/ขวาบน hero → ดู counter + dots · เปิดชิ้นรูปเดียวเทียบ | counter `i/N` เปลี่ยนตามรูป + dot active ตาม; รูปเดียว → ไม่มี counter/dots | — | MED | |
| AST-026 | [MKT] Current value = ราคาตลาด | MEMBER | POSITIVE | `A-MKT` มี market | เปิด `pfasset:{A-MKT}` อ่าน `มูลค่าปัจจุบัน`/`Current value` + `ที่มาของมูลค่า`/`Value source` | `฿{market}` + `Latest market price` — ไม่ใช่ราคาซื้อ | — | HIGH | |
| AST-027 | ไม่มี market → fallback ราคาซื้อ | MEMBER | POSITIVE | `A-NOMKT` มี purchase แต่ไม่มี market | เปิด `pfasset` อ่าน Current value + Value source | `฿{purchase}` + `Purchase price estimate` | — | HIGH | |
| AST-028 | ไม่มี market+purchase → `—` | MEMBER | POSITIVE | `A-NOCOST` | เปิด `pfasset` อ่าน Current value + Value source | `—` + `No market price` | — | MED | |
| AST-029 | [MKT] Estimated/Update/Source | MEMBER | POSITIVE | `A-MKT` | อ่าน `ราคาประเมินตลาด`/`Estimated market` + `อัปเดตราคาล่าสุด`/`Last price update` + `แหล่งข้อมูล`/`Data source` | Estimated = `฿{market×0.95}` – `฿{market×1.05}` (ปัด step 500) · Last update = วันที่ sync จริงของ server (ไม่ใช่วันนี้โดยอัตโนมัติ) · Source = ชื่อแหล่งข้อมูลจริง | — | HIGH | |
| AST-030 | ไม่มี market → 3 แถวเป็น `—` | MEMBER | POSITIVE | `A-NOMKT` | อ่าน Estimated market / Last price update / Data source | ทั้ง 3 แถว `—` | — | MED | |
| AST-031 | [MKT] Unrealized G/L สูตร + สี | MEMBER | POSITIVE | `A-MKT` มี market+purchase | คำนวณ `market − purchase` เทียบ `กำไร/ขาดทุนที่ยังไม่เกิดขึ้น`/`Unrealized gain/loss` | `±฿N (±N.N%)` — บวก `+฿` class up / ลบ `−฿` class dn (base = purchase, ทศนิยม 1 ตำแหน่ง) | — | HIGH | |
| AST-032 | Unrealized `—` เมื่อคำนวณไม่ได้ | MEMBER | POSITIVE | `A-NOCOST` + `A-NOMKT` (ไม่มี market) | อ่าน Unrealized ทั้งสองชิ้น | `—` ทั้งคู่ — asset ที่มีแค่ purchase (fallback) ก็ `—` เพราะไม่มี market | — | MED | |
| AST-033 | Purchase/Purchased/Holding rows | MEMBER | POSITIVE | `pfasset` A-SALE (มีทั้งคู่) + A-NOCOST | อ่าน `ราคาซื้อ`/`Purchase price` + `วันที่ซื้อ`/`Purchased` + `ระยะเวลาถือครอง`/`Holding period` | A-SALE: `฿{purchase}` + `d MMM yyyy` + `{d} วัน · {y}y {m}m`/`{d} days · {y}y {m}m` (bought→วันนี้) · A-NOCOST: ทั้ง 3 แถว `—` | — | MED | |
| AST-034 | Listing card เฉพาะ sale | MEMBER | POSITIVE | `pfasset` A-SALE vs A-SHOW/A-HIDE | เปรียบหน้า 3 ชิ้น | sale → การ์ด `การลงประกาศ`/`Listing`: `ราคาตั้งขาย`/`Asking price` `฿N` + `กำไรที่คาดหวัง`/`Expected profit` `±฿N (±N.N%)` (asking−purchase; คำนวณไม่ได้ `—`) + `เปรียบเทียบตลาด`/`Market comparison` chip — show/hide → **ไม่มี**การ์ดนี้ | — | HIGH | |
| AST-035 | [MKT] Market comparison ±1% band | MEMBER | POSITIVE | sale asset ที่ปรับ asking ให้ชนแต่ละช่วงได้ (market คงที่) | ตั้ง asking > market+1% → `pfasset`; ตั้งใน ±1% → `pfasset`; ตั้ง < market−1% → `pfasset` (ปรับผ่าน Edit/สร้างชิ้นใหม่ — ปรับไม่ได้ → `BLOCK`) | chip: `Above market` / `At market` / `Below market` ตามสูตร `(asking−market)/market×100` — dead band ±1% นับ `At market` | — | HIGH | |
| AST-036 | sale ไม่มี asking → `No market price` | MEMBER | POSITIVE | sale asset ที่ไม่ใส่ราคา (สร้างผ่านแอปจริง — ทำไม่ได้ → `BLOCK`) | เปิด `pfasset` ดู Market comparison | แสดง `ไม่มีราคาตลาด`/`No market price` (quirk spec: ไม่ใส่ asking ก็ขึ้น copy เดียวกัน) | — | MED | |
| AST-037 | ไม่มี action อื่นนอกจาก Mark as sold | MEMBER | NEGATIVE | `pfasset` เปิด | อ่านทั้งหน้า + แตะค้างบน hero/ชื่อ | ไม่มี แก้ไข/ลบ/เปลี่ยนสถานะ/แชร์ บน `pfasset` — control เดียวคือ `บันทึกการขาย`/`Mark as sold` + back | — | MED | |

### 2.4 Mark as Sold — `sell:{id}` ฟอร์ม + Transition

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| AST-038 | sell anatomy + prefill | MEMBER | UI | `pfasset:{A-SALE}` → `บันทึกการขาย` | อ่านหน้าฟอร์ม | head: back + `บันทึกการขาย`/`Mark as sold` · sell-hero (รูป + brand + model + ref + status chip) · note `ข้อมูลเป็นส่วนตัว — รายการจะย้ายไปประวัติการขายและหลุดจากมูลค่าพอร์ตโฟลิโอโดยอัตโนมัติ`/`Private data — …` · `ราคาขาย (บาท)`/`Sale price (THB) *` prefill = asking + `วันที่ขาย`/`Sale date *` default=วันนี้ + `บันทึกการขาย`/`Save sale record` | — | HIGH | |
| AST-039 | entry จาก own-post menu (sale post) | MEMBER | POSITIVE | โพสต์ลิสติ้งตัวเองบน feed/profile | ⋯ menu โพสต์ → `บันทึกการขาย`/`Mark as sold` | เปิด `sell:{id}` ฟอร์มเดียวกัน — โพสต์ที่ยังไม่มี drawer record ต้องสร้าง record ให้เมื่อบันทึก (materialize — ผลเหมือนกัน) | — | HIGH | |
| AST-040 | Mark as sold บน show/hide post | MEMBER | POSITIVE | โพสต์ Show หรือ Hide ของตัวเอง (เปิดจาก own profile tab → viewer → ⋯) | ⋯ menu → `บันทึกการขาย`/`Mark as sold` | เปิดฟอร์มได้เหมือน sale — drawer asset ที่ไม่ได้ลงขายก็บันทึกการขายได้ (D4) | — | HIGH | |
| AST-041 | sold/post kind → ไม่มี Mark as sold | MEMBER | NEGATIVE | โพสต์ sold (หลังขาย) + โพสต์ธรรมดา (ไม่เข้าลิ้นชัก) | ⋯ menu ทีละโพสต์ อ่านแถว | sold → มี `ดูประวัติการขาย`/`View sale record` แทน Edit, **ไม่มี** `บันทึกการขาย` · โพสต์ธรรมดา → มี Edit แต่**ไม่มี** Mark as sold | — | HIGH | |
| AST-042 | ช่องราคา numeric + auto-comma | MEMBER | UI | sell เปิด | ล้างช่อง → พิมพ์ `449000` → ดู keyboard/ผล | keyboard ตัวเลข + ใส่ comma อัตโนมัติ `449,000` — รับเฉพาะตัวเลข | placeholder `เช่น 449,000`/`e.g. 449,000` | MED | |
| AST-043 | Expected gain live-update | MEMBER | POSITIVE | sell ของชิ้นที่ purchase>0 | แก้ราคาขายทีละค่า → ดูแถว `กำไรที่คาดหวัง`/`Expected gain` → ล้างช่อง | อัปเดตทันที = `price − purchase` `±฿N (±N.N%)`; price ≤0/ว่าง → `—`; ชิ้นที่ไม่มี purchase → **ไม่มี**แถวนี้เลย | — | HIGH | |
| AST-044 | validate ราคาขาย | MEMBER | NEGATIVE | sell เปิด | ล้างราคา → `บันทึกการขาย` · ใส่ `0` → save · ใส่ลบ → save | ทุกครั้งไม่ save: inline error `กรุณากรอกราคาขาย`/`Sale price required` + field ขอบแดง + focus ช่องราคา — ไม่มี record ใหม่ | — | HIGH | |
| AST-045 | validate วันที่ขาย | MEMBER | NEGATIVE | sell เปิด | ล้างวันที่ → save · เลือกวันอนาคต (picker ล็อกสูงสุดวันนี้ — เลือกไม่ได้ก็ผ่านเงื่อนไขเดียวกัน) | ว่าง → `กรุณาเลือกวันที่ขาย`/`Sale date required`; อนาคต → `วันที่ขายไม่ถูกต้อง`/`Invalid sale date` (หรือ picker กันไม่ให้เลือกเกินวันนี้) — focus ช่องแรกที่ผิด | — | HIGH | |
| AST-046 | ไม่มีฟิลด์ผู้ซื้อ/ติดต่อ/จ่ายเงิน (lock) | MEMBER | NEGATIVE | sell เปิด + sold:{id} | scroll ดูทั้งฟอร์ม + sold detail | **ไม่มี**ช่อง/แถว Buyer/Contact/Payment/Attachment ใด ๆ — record เก็บแค่ sale price + sale date (D3 lock) | — | HIGH | |
| AST-047 | cancel/back → ไม่บันทึก | MEMBER | NEGATIVE | sell เปิด | กรอกราคา+วันที่ → กด back (ไม่กด save) → เช็ก portfolio + soldhist + โพสต์ | ไม่มี record ใหม่ — asset ยังสถานะเดิม อยู่ portfolio/แท็บเดิม ไม่มี toast | — | HIGH | |
| AST-048 | save → transition เต็ม | MEMBER | POSITIVE | sell ของ `A-SALE` กรอกถูก | `บันทึกการขาย` → รอ toast | toast `บันทึกการขายแล้ว · ย้ายไปประวัติการขาย ✓`/`Sale recorded · moved to Sold history ✓` + ลงที่ `sold:{id}` แสดงราคา/วันที่ที่กรอก — asset ย้ายออกจาก portfolio list ทันที | — | HIGH | |
| AST-049 | stack หลัง save — back ถูกจุด | MEMBER | STATE | save สำเร็จจากเส้นทาง portfolio→pfasset→sell (AST-048) | อยู่ `sold:{id}` → กด back ทีละครั้ง | back กลับ `portfolio` (หน้าก่อนเข้า pfasset) — ฟอร์ม sell + pfasset ถูกตัดออกจาก stack ไม่ย้อนกลับมา | — | HIGH | |
| AST-050 | save → dashboard อัปเดตทันที | MEMBER | STATE | จด Total invested/count ก่อนขาย | หลัง AST-048: เปิด `portfolio` | asset หายจาก list + `รายการนาฬิกา N` −1 + Total invested ลดลงเท่าราคาซื้อชิ้นนั้น + coverage X/Y ลด | — | HIGH | |
| AST-051 | save → โพสต์กลาย sold ทุก surface | MEMBER | POSITIVE | `A-SALE` มีโพสต์ลิงก์ | หลังขาย: เช็ก feed · own profile แท็บ `ขายแล้ว`/`Sold` · เปิด detail โพสต์ · ⋯ menu | โพสต์หายจาก feed · อยู่แท็บ Sold ของตัวเอง · detail มี tag `ขายแล้ว`/`SOLD` · menu มี `ดูประวัติการขาย`/`View sale record` แทน Edit — ไม่มี Mark as sold | — | HIGH | |
| AST-052 | save → หลุด search + watch alert | MEMBER | POSITIVE | `A-SALE` เคยค้นเจอ + มี WA ตรงเงื่อนไข (ไม่มี WA → เช็กแค่ search) | หลังขาย: search รุ่นเดิม → ดูผล | ลิสติ้งหายจากผล search ทันที และไม่ชนเงื่อนไข watch alert (ไม่มีแจ้งเตือน match ใหม่จากชิ้นนี้) — canonical visibility | — | HIGH | |
| AST-053 | sale date ย้อนหลัง → holding ถูก | MEMBER | POSITIVE | sell กรอกวันที่ขายย้อนหลัง (เช่น 30 วันก่อน) | save → เปิด `sold:{id}` อ่าน `ระยะเวลาถือครอง`/`Holding period` | holding คำนวณจาก `bought` → `soldDate` ที่เลือก (ไม่ใช่วันนี้) — จำนวนวัน/ปีเดือนตรง | — | MED | |
| AST-054 | กด save รัว → record เดียว | MEMBER | EDGE | sell กรอกถูก | แตะ `บันทึกการขาย` รัว 2–3 ครั้งเร็ว ๆ | sold record เดียวใน `soldhist` — ไม่มีรายการซ้ำ ไม่มีหน้าซ้อน | — | MED | |

### 2.5 Sold History — `soldhist` + `sold:{id}`

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| AST-055 | soldhist anatomy + เรียงใหม่สุดก่อน | MEMBER | POSITIVE | ขายแล้ว ≥2 ชิ้น | `portfolio` → `ประวัติการขาย →` → อ่าน | head `ประวัติการขาย`/`Sold history` + desc `บันทึกข้อมูลนาฬิกาที่ขายแล้วจะเก็บไว้ที่นี่ และไม่นำไปรวมกับมูลค่าพอร์ตโฟลิโอ`/`Sold pieces keep their sale record here — they're never counted in portfolio value.` + rows (รูป + ชื่อ + `ขายแล้วเมื่อ {d MMM yyyy}`/`Sold {d MMM yyyy}` + `฿{price}`/`N/A`) — ล่าสุดขึ้นก่อน | — | HIGH | |
| AST-056 | empty soldhist | NEW/MEMBER | POSITIVE | ยังไม่เคยขาย | เปิด `soldhist` | history icon + `ไม่พบข้อมูล`/`No data found` | — | MED | |
| AST-057 | row → `sold:{id}` + back | MEMBER | POSITIVE | soldhist มีแถว | แตะแถว → อ่าน → back | push `sold:{id}` title `รายการที่ขายแล้ว`/`Sold item`; back กลับ soldhist ตำแหน่งเดิม | — | HIGH | |
| AST-058 | sold detail anatomy | MEMBER | UI | `sold:{id}` เปิด | อ่านหน้าบน-ล่าง | hero + counter/dots · ชื่อ + `ref · brand` + chip `ขายแล้ว`/`Sold` · headline `ราคาขาย`/`Sale price` `฿N` (+`กำไร/ขาดทุนที่เกิดขึ้นจริง`/`Realized gain/loss` `±฿N (±N.N%)` เมื่อมี purchase) · การ์ด `บันทึกการขาย`/`Sale record` (`ส่วนตัว`/`private`: `วันที่ขาย`/`Sale date` + `ราคาขาย`/`Sale price`) · การ์ด `ผลตอบแทน`/`Return` (`ราคาซื้อ` + `ระยะเวลาถือครอง`) · footnote `กำไร/ขาดทุนที่เกิดขึ้นจริงจะแยกออกจากมูลค่าพอร์ตโฟลิโอ`/`Realized gain/loss is separate from portfolio value.` — ไม่มี bottom nav | — | HIGH | |
| AST-059 | Realized G/L ทั้งกำไรและขาดทุน | MEMBER | POSITIVE | ขายชิ้นหนึ่งเหนือทุน + ชิ้นหนึ่งต่ำกว่าทุน (เตรียมผ่าน sell จริง) | เปิด `sold:{id}` ทีละใบเทียบ `price − purchase` | กำไร `+฿N (+N.N%)` class up · ขาดทุน `−฿N (−N.N%)` class dn — base = purchase | — | HIGH | |
| AST-060 | holding period ถึงวันขาย | MEMBER | POSITIVE | sold มี bought+soldDate | อ่าน `ระยะเวลาถือครอง`/`Holding period` | `{d} วัน · {y}y {m}m`/`{d} days · …` คำนวณ `bought → soldDate` ตรงจริง | — | MED | |
| AST-061 | sold ไม่มี purchase → fallback copy | MEMBER | POSITIVE | ขายชิ้นที่ไม่มีราคาซื้อ (`A-NOCOST` ผ่าน AST-040) | เปิด `sold:{id}` | ไม่มีแถว Realized G/L · `ราคาซื้อ`/`Purchase price` + `ระยะเวลาถือครอง` = `N/A` (sold surfaces ใช้ N/A ตาม spec — §3 ท้ายเล่ม) | — | MED | |
| AST-062 | sold = เดินสุดท้าย ไม่มี revert | MEMBER | NEGATIVE | `sold:{id}` + soldhist + โพสต์ sold | หา แก้ไข/ลบ/ย้ายกลับ/บันทึกการขาย ทุกตำแหน่ง | **ไม่มี** revert/edit/delete/Mark-as-sold บน surface sold ใด ๆ — menu โพสต์ sold มีแค่ `ดูประวัติการขาย`/`View sale record` | — | HIGH | |
| AST-063 | sold hero หลายรูป | MEMBER | POSITIVE | sold record มี ≥2 รูป | ปัด hero บน `sold:{id}` | counter `i/N` + dots ตามรูปเหมือน pfasset | — | LOW | |
| AST-064 | View sale record จากโพสต์ sold | MEMBER | POSITIVE | โพสต์ sold ในแท็บ Sold → viewer → ⋯ | แตะ `ดูประวัติการขาย`/`View sale record` | เปิด `sold:{id}` ของ record ที่ผูกกับโพสต์นั้น — ข้อมูลราคา/วันที่ตรงที่บันทึก | — | HIGH | |

### 2.6 Asset Lifecycle — Status Transitions

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| AST-065 | Show → Sale (ลงขายทีหลัง) | MEMBER | POSITIVE | `A-SHOW` drawer อยู่แท็บ Show | own profile → Show tab → viewer → ⋯ → `แก้ไข`/`Edit` → สถานะ `ขาย`/`Sale` + ใส่ราคา → Done | โพสต์เข้า feed + ค้นเจอ + ย้ายไปแท็บ Sale + `pfasset` chip กลาย Sale + Listing card โผล่ (canonical — ไม่เข้า feed = FAIL) | — | HIGH | |
| AST-066 | Hide → Sale | MEMBER | POSITIVE | `A-HIDE` อยู่แท็บ Hide | Edit → สถานะ `ขาย`/`Sale` + ราคา → Done → เช็ก feed/search/แท็บ/portfolio | เข้า feed + ค้นเจอ + แท็บ Sale + chip Sale — ของที่เคยซ่อนขึ้นสาธารณะครบ | — | HIGH | |
| AST-067 | Sale → Hide | MEMBER | POSITIVE | sale post อยู่ feed | Edit → สถานะ `ซ่อน`/`Hide` → Done → เช็ก feed · public profile (ACCT-2) · แท็บ · portfolio | หายจาก feed + หายจาก public profile + ค้นไม่เจอ + ย้ายแท็บ Hide + ยังอยู่ portfolio (chip Hide) | — | HIGH | |
| AST-068 | Sale → Show | MEMBER | POSITIVE | sale post อยู่ feed | Edit → สถานะ `โชว์`/`Show` → Done → เช็ก feed · search · public profile Show tab (ACCT-2) · portfolio | หลุด feed+search แต่คนอื่นยังเห็นบน profile แท็บ Show + portfolio chip Show + Listing card หายจาก pfasset | — | HIGH | |
| AST-069 | drawer OFF — เอาออกจาก portfolio | MEMBER | POSITIVE | โพสต์ที่อยู่ลิ้นชัก (sale/show/hide) | Edit → ปิด `บันทึกลงในสินทรัพย์ของฉันด้วย`/`Also save to My Assets` → Done → เช็ก portfolio + แท็บ | โพสต์หลุดลิ้นชัก: หายจาก portfolio + หายจากแท็บสถานะ (อยู่แท็บ All เป็นโพสต์ธรรมดา) + `pfasset` ของ record เดิม → `ไม่พบข้อมูล`/`No data found` — โพสต์/feed ไม่หาย | — | HIGH | |
| AST-070 | Sale ↔ Hide ซ้ำเร็ว | MEMBER | EDGE | sale post อยู่ feed | Edit → Hide → Done → Edit → Sale → Done สลับ 3 รอบเร็ว ๆ → เช็กทุก surface | สถานะสุดท้ายตรงกันทุกที่ (feed/แท็บ/portfolio chip/detail tag/search) — ไม่มี record ซ้ำ ไม่มี listing ผี ไม่มี chip ค้างผิด | — | MED | |
| AST-071 | sold แก้สถานะไม่ได้ | MEMBER | NEGATIVE | โพสต์ sold (AST-048) | ⋯ menu → หา Edit (ไม่มี — มี View sale record) · เปิด edit ผ่านทางอื่นถ้ายังเข้าได้ → ดูสวิตช์ลิ้นชัก | ไม่มีทางเปลี่ยนสถานะ sold: menu ไม่มี Edit/Mark as sold; ถ้าเข้าฟอร์มแก้ได้ สวิตช์ลิ้นชักต้องล็อก `This item lives in your Sold history` ไม่ให้ detach | — | HIGH | |
| AST-072 | แก้ราคาตั้งขาย → sync ทุกจุด | MEMBER | STATE | sale asset มี asking | Edit → เปลี่ยนราคา → Done → เช็ก `pfasset` (Asking/Expected profit/comparison) + post detail (ราคา) | ตัวเลขทุกจุดอัปเดตตามราคาใหม่ — Expected profit/comparison คำนวณใหม่ | — | MED | |
| AST-073 | แก้ราคาซื้อ/วันซื้อ → portfolio คำนวณใหม่ | MEMBER | STATE | asset มี purchase+bought | Edit → แก้ราคาซื้อ/วันซื้อ (ช่อง Cost details) → Done → เช็ก portfolio headline + pfasset | Total invested/coverage/แถวราคา/Value card/holding อัปเดตตามค่าใหม่ | — | MED | |
| AST-074 | ลบโพสต์ → asset หายด้วย (canonical) | MEMBER | POSITIVE | โพสต์ที่ผูก asset (sale/show/hide) — สร้างชิ้นทดสอบก่อน | ⋯ menu → `ลบ`/`Delete` → confirm → เช็ก profile grid + portfolio + pfasset | โพสต์หายจาก grid/feed และ asset หายจาก portfolio + `pfasset` เดิม → `ไม่พบข้อมูล`/`No data found` (ลบแล้วหายทุกที่ — orphan ค้าง = FAIL) | — | HIGH | |
| AST-075 | ลบโพสต์ drawer-only (Show/Hide จาก `+`) | MEMBER | POSITIVE | โพสต์ลิ้นชักที่ไม่เคยลงฟีด | ⋯ menu จาก viewer → `ลบ`/`Delete` → confirm | หายจาก profile grid + portfolio เช่นกัน — ปุ่มลบต้องทำงานจริง (กดแล้วไม่เกิดอะไร = FAIL) | — | HIGH | |

### 2.7 Add Asset & Cross-Surface Consistency

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| AST-076 | `+` → โชว์ → ลง portfolio | MEMBER | POSITIVE | own profile → `+` → asset mode | ใส่รูป+ข้อมูล → เลือก `โชว์`/`Show` → `เพิ่มสินทรัพย์ใหม่`/`Add Asset` → เช็ก profile แท็บ Show + portfolio + feed | toast `บันทึกลงลิ้นชักและแสดงบนโปรไฟล์แล้ว ✓`/`Saved to My Assets · shown on profile ✓` + อยู่แท็บ Show + อยู่ portfolio (chip Show) + **ไม่**อยู่ feed + ACCT-2 เห็นบน public profile แท็บ Show | — | HIGH | |
| AST-077 | `+` → ซ่อน → owner-only | MEMBER + ACCT-2 | POSITIVE | asset mode เลือก `ซ่อน`/`Hide` | save → เช็กแท็บ Hide + portfolio · เครื่อง ACCT-2 เปิด public profile | toast `บันทึกลงลิ้นชักแบบซ่อนแล้ว ✓`/`Saved to My Assets · private ✓` + อยู่แท็บ Hide + portfolio — ACCT-2 **ไม่เห็น** ที่ไหนเลย (grid/public/feed/search) | — | HIGH | |
| AST-078 | `+` → โพสต์ลงฟีด → Sale เต็มรูป | MEMBER | POSITIVE | asset mode เลือก `โพสต์ลงฟีด`/`Post to feed` + ใส่ราคา | save → เช็ก feed · แท็บ Sale · portfolio · search · `pfasset` | toast `บันทึกลงลิ้นชักและโพสต์ลงฟีดแล้ว ✓`/`Saved to My Assets · posted to feed ✓` + อยู่ feed + แท็บ Sale + portfolio (chip Sale) + ค้นเจอ + `pfasset` มี Listing card | — | HIGH | |
| AST-079 | empty CTA → composer เดียวกัน | NEW | POSITIVE | own profile แท็บ All ว่าง | แตะ `เพิ่มสินทรัพย์ใหม่`/`Add asset` ใน empty state | เปิด asset composer เดียวกับปุ่ม `+` (mode asset + ตัวเลือก Show/Hide/Post to feed) | — | MED | |
| AST-080 | จุดตกหลัง save = own profile | MEMBER | STATE | asset mode save สำเร็จ | ดูหน้าที่ลงหลัง toast + กด back | ลงกลับ own profile (ของใหม่อยู่ grid บนสุด/แท็บที่เกี่ยว) — **ไม่**ลง portfolio/pfasset; back → จุดก่อนเข้า composer | — | MED | |
| AST-081 | ใส่ Cost details → ค่าส่วนตัวถูกที่ | MEMBER + ACCT-2 | POSITIVE | composer asset ใส่ `ราคาซื้อ`/`Purchased` + ราคาซื้อ | save → เช็ก portfolio แถว + Total invested + `pfasset` Value card · ACCT-2 เปิดโพสต์/detail ชิ้นเดียวกัน | แถว `฿{purchase}` + headline เพิ่มตาม + pfasset มี Purchase/Purchased/Holding — ฝั่ง ACCT-2 **ไม่เห็น** purchase/bought/cost ใด ๆ บนโพสต์/detail (private boundary) | — | HIGH | |
| AST-082 | cancel composer → ไม่เกิดอะไร | MEMBER | NEGATIVE | asset mode กรอกแล้ว | กด back ออกก่อน save → เช็ก profile + portfolio | ไม่มี tile ใหม่ ไม่มีแถว portfolio ใหม่ — ไม่มี draft ค้าง | — | MED | |
| AST-083 | sweep ข้าม surface หลังขาย | MEMBER | STATE | `A-SALE` ขายแล้ว (AST-048) | ไล่เช็ก: portfolio · soldhist · own แท็บ Sold · detail โพสต์ · feed · search | ชิ้นเดียวกันสถานะตรงกันทุกจุด: ไม่อยู่ portfolio list · อยู่ soldhist · แท็บ Sold มี tile · detail `ขายแล้ว`/`SOLD` · feed+search ไม่มี — หน้าใดค้างสถานะเก่า = FAIL | — | HIGH | |
| AST-084 | pfasset ↔ post detail ข้อมูลตรงกัน | MEMBER | POSITIVE | `A-SALE` (ก่อนขาย) | เทียบ `pfasset` กับ post detail ของโพสต์ลิงก์ | รูป/ชื่อ/ref/ราคาตั้งขายตรงกัน — ตัวเลขส่วนตัว (purchase/bought/market/GL) มีเฉพาะ pfasset | — | MED | |
| AST-085 | visibility matrix ฝั่งคนดู (ACCT-2) | ACCT-2 | POSITIVE | MEMBER มี A-SALE(ยังไม่ขาย)/A-SHOW/A-HIDE + ของ sold | เครื่องสอง: เช็ก feed · public profile MEMBER ทุกแท็บ · search | เห็น: A-SALE (feed+Sale tab+search+detail) · A-SHOW (เฉพาะ profile แท็บ Show — ไม่มี feed/search) · **ไม่เห็น** A-HIDE/ของ sold ที่ไหนเลย | — | HIGH | |

### 2.8 Edge / Error / Empty

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| AST-086 | รูปหาย/โหลดไม่ได้ | MEMBER | EDGE | asset ที่รูปโหลดพัง (สร้างด้วยรูปที่ถูกลบ/ลิงก์เสีย — เตรียมไม่ได้ → `BLOCK`) | เปิด portfolio + `pfasset` + soldhist | แถว/hero แสดง placeholder/ภาพแทน ไม่แครช — ตัวเลข/ชื่อยังแสดงครบ แตะเข้าได้ | — | MED | |
| AST-087 | เปิด asset ที่ถูกลบแล้ว | MEMBER | EDGE | อีกเครื่อง/ทางอื่นลบ asset ขณะ `pfasset` เปิดค้าง (เครื่อง B sign in บัญชีเดียวกันลบ หรือลบผ่าน flow AST-074 — ทำไม่ได้ → `BLOCK`) | re-open `pfasset:{id}` เดิม (back ออกแล้วเข้าใหม่/refresh) | หน้า `ไม่พบข้อมูล`/`No data found` — **ไม่**แสดงข้อมูลส่วนตัวค้างของชิ้นที่ถูกลบ | — | HIGH | |
| AST-088 | ลิงก์/การ์ดลิสติ้งที่ถูก Hide | ACCT-2 | POSITIVE | ACCT-2 เคย Ask `A-SALE` (SETUP-09) → MEMBER เปลี่ยนเป็น Hide (AST-067) | เครื่องสอง: เปิดห้อง chat → แตะการ์ดลิสติ้ง | ห้อง chat ยังอยู่ แต่การ์ด → หน้าไม่พร้อมใช้งาน/`ไม่พบโพสต์นี้` (unavailable — ไม่เปิด detail ได้) — ไม่มีข้อมูลส่วนตัวหลุด | — | HIGH | |
| AST-089 | การ์ดลิสติ้งที่ขายแล้ว | ACCT-2 | POSITIVE | ห้อง chat มีการ์ด `A-SALE` → MEMBER ขายแล้ว (AST-048) | แตะการ์ดในแชท + ลองค้นหาโพสต์ | การ์ด → unavailable (sold = owner-only); ห้องยังคุยได้ต่อปกติ — MEMBER ฝั่งเจ้าของยังเปิดโพสต์ได้จากแท็บ Sold | — | HIGH | |
| AST-090 | purchase = 0/ไม่ใส่ | MEMBER | POSITIVE | `A-NOCOST` | ดูแถว portfolio + headline | แถว `—` + ไม่ถูกนับใน X ของ coverage + ไม่รวม Total invested | — | MED | |
| AST-091 | ราคาใหญ่มาก | MEMBER | EDGE | ขายด้วยราคาสูง (เช่น 9,999,999) ผ่าน sell จริง | ดู sold detail + soldhist | `฿9,999,999` comma ครบ ไม่ล้น layout — Realized G/L คำนวณตรง | — | MED | |
| AST-092 | ชื่อ/ref ยาว | MEMBER | EDGE | asset ชื่อ/ref ยาวผิดปกติ (สร้างจริง — ทำไม่ได้ → `BLOCK`) | ดูแถว portfolio + pfasset + soldhist | ตัด ellipsis/wrap เรียบร้อย ไม่ทับราคา/chip | — | LOW | |
| AST-093 | sold post ใน viewer ของเจ้าของ | MEMBER | POSITIVE | แท็บ Sold มี tile | แตะ tile → viewer → ⋯ menu → swipe โพสต์อื่นในแท็บ | detail มี tag `ขายแล้ว`/`SOLD` + menu มี `ดูประวัติการขาย`/`View sale record` (ไม่มี Edit/Mark as sold) + viewer ไหลเฉพาะแท็บ Sold | — | MED | |
| AST-094 | เปิด/ยกเลิก sell ซ้ำเร็ว | MEMBER | EDGE | `pfasset` เปิด | กด `บันทึกการขาย` → back → กดใหม่ รัว ๆ หลายรอบ → สุดท้าย save | ฟอร์มเปิด/ปิดเรียบ ไม่ค้าง ไม่ซ้อนหน้า — save สำเร็จ record เดียว | — | LOW | |
| AST-095 | ขายชิ้นสุดท้าย → portfolio ว่าง + soldhist ติดอยู่ | MEMBER | EDGE | ขาย asset ทุกชิ้นจนหมด | เปิด `portfolio` → อ่าน → สร้าง asset ใหม่ผ่าน `+` → เปิด `portfolio` → `ประวัติการขาย →` | `portfolio` → empty state `ไม่พบข้อมูล`/`No data found` + explainer (ไม่มีแถว/section — ตาม spec empty state ไม่มี Sold history link → ช่วงนี้ไม่มีทางเข้า soldhist จากหน้าจอ — flag §3); เพิ่ม asset ใหม่ → list กลับ + soldhist ยังเก็บ record เดิมครบ | — | MED | |

### 2.9 Persistence / Language / Theme / Real Device

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| AST-096 | state รอด kill+restart | MEMBER | STATE | มี asset ครบสถานะ + sold ≥1 + pin/แก้ไขล่าสุด | kill app เด็ดขาด → เปิดใหม่ → เปิด portfolio/soldhist/แท็บ | ทุกอย่างคงเดิม: asset rows/sold records/status/ตัวเลข — server-backed | — | HIGH | |
| AST-097 | state รอด sign-out→in | MEMBER | STATE | เหมือน AST-096 | sign out → sign in บัญชีเดิม → เช็กทุกหน้า | เหมือน AST-096 ทุกข้อ — ไม่มี state หลุด/รีเซ็ต | — | HIGH | |
| AST-098 | portfolio เหมือนกันข้ามเครื่อง | MEMBER | STATE | sign in บัญชี `U-ME` เดียวกันบนเครื่องสอง (SETUP-08 — อาจใช้เครื่องสามหรือย้าย session) | เครื่อง B: เปิด portfolio/soldhist เทียบเครื่อง A | dashboard/rows/soldhist/ตัวเลขเหมือนกันเป๊ะ — server truth ไม่ใช่ local copy — build จำกัดเครื่องเดียว → `BLOCK` | — | HIGH | |
| AST-099 | mark-as-sold sync ข้ามเครื่อง | MEMBER | STATE | ล็อกอินบัญชีเดียวกันสองเครื่อง | เครื่อง A: ขายชิ้นหนึ่งผ่าน sell → เครื่อง B: เปิด portfolio + soldhist + แท็บ Sold | เครื่อง B เห็น asset หลุด list + record ใหม่ใน soldhist + โพสต์ในแท็บ Sold — sync ช้า → `BLOCK` ระบุเวลาที่ลอง | — | HIGH | |
| AST-100 | เปลี่ยนสถานะ sync ข้ามเครื่อง | MEMBER | STATE | ล็อกอินสองเครื่อง | เครื่อง A: Sale→Hide → เครื่อง B: เช็กแท็บ/portfolio/feed | B สะท้อนสถานะใหม่ครบ (chip/แท็บ/ไม่อยู่ feed) | — | MED | |
| AST-101 | ภาษาไทยทั้งเล่ม | MEMBER | UI | ตั้งภาษา TH | ไล่ portfolio/pfasset/sell/soldhist/sold/toast/dialog | ทุก label/toast ไทยครบ — string EN ค้างที่ไหน = FAIL (จุดเสี่ยง spec บันทึกไว้: chip `Sale`/`Show`/`Hide`, `Above/At/Below market`, `No market price`, `Latest market price`/`Purchase price estimate`, `N/A`, หน่วย `y`/`m`, `THB`) | — | HIGH | |
| AST-102 | ภาษาอังกฤษทั้งเล่ม | MEMBER | UI | ตั้งภาษา EN | เหมือน AST-100 | ทุก label/toast EN ครบ — TH ค้าง = FAIL | — | MED | |
| AST-103 | dark theme | MEMBER | UI | เปิด dark | ไล่ทุกหน้า portfolio รวมฟอร์ม/empty/chip | อ่านครบ contrast พอ — chip up/dn (เขียว/แดง) แยกสีได้ — ตัวหนังสือจม = FAIL | — | MED | |
| AST-104 | device back ทีละชั้น | MEMBER | STATE | อยู่ own profile | กด device back ไล่: portfolio → pfasset → sell → (cancel) → pfasset → portfolio → profile → back อีกครั้ง | แต่ละกด pop ชั้นบนสุดทีเดียวตาม stack — ไม่เด้งออกหลายชั้น ไม่วนเข้าฟอร์มซ้ำ | — | MED | |
| AST-105 | offline — อ่านได้ เขียนไม่หลอก | MEMBER | EDGE | เปิด airplane mode | เปิด portfolio → พยายาม mark-as-sold save → กลับ online → เช็ก server | อ่าน: แสดงข้อมูลล่าสุดที่มี หรือ error state ชัดเจน (ตาม build) · **เขียน: save ต้อง error ชัดเจน + ไม่บันทึกหลอก** — reconnect แล้ว state ต้องตรง server ไม่ซ้ำ | — | HIGH | |
| AST-106 | rotate + small screen | MEMBER | EDGE | เครื่องจอเล็กสุดในทีม | portfolio/pfasset/sell/soldhist หมุนแนวนอน + เทียบจอแคบ | layout ไม่พัง: แถวไม่ทับ ราคาไม่ล้น ชิปไม่ตก — เครื่องล็อก portrait → เคสนี้ `BLOCK` | — | LOW | |

## §3 Spec deviations/contract ที่กระทบเคสเล่มนี้

| Deviation / contract | ผลต่อ expected | TC |
| --- | --- | --- |
| Market data เป็น mock ใน prototype — แอปจริงผูก server (lock 2026-10-30) | เคส [MKT] เขียนเต็มทุกสูตรแต่ต้องมีราคาตลาดจริง — server ไม่มี = `BLOCK` ทั้งชุด; fallback path ทำได้เสมอ | AST-011, 026, 029, 031, 035 |
| ลบโพสต์ prototype ทิ้ง asset ค้างในลิ้นชัก (deviation) → canonical = หายทั้งคู่ (lock) | ลบแล้วต้องหายจาก portfolio + `pfasset` → `ไม่พบข้อมูล` — เจอ orphan = FAIL | AST-074, 075, 087 |
| drawer-only asset → Sale prototype ไม่เข้า feed (deviation) → canonical = เข้า feed+search (lock) | Show/Hide→Sale ต้องขึ้นฟีด+ค้นเจอ — ไม่ขึ้น = FAIL | AST-065, 066 |
| `salePosts()` ไม่กรอง pfkind (prototype defect) → canonical = sold/show/hide หลุด search+WA (lock) | ของที่ไม่ใช่ลิสติ้งขายต้องไม่โผล่ search/ไม่ชน WA — หลุด = FAIL | AST-052, 067, 068, 085 |
| Sold record แค่ price+date (D3 — ตัด buyer/contact/payment/attachment, lock 2026-10-30) | เคสเช็กว่าฟิลด์เหล่านั้น**ไม่มี** — เจอเพิ่ม = spec เปลี่ยน แจ้งรีวิว | AST-046, 058 |
| Headline = `Total invested` Σ purchase (D2 — spec เดิม Total Asset Value) | headline ต้องเป็นต้นทุนรวมไม่ใช่มูลค่าตลาด | AST-009, 011 |
| Mark as sold ครอบ sale+show+hide (D4 — spec เดิมเฉพาะ sale) | เมนูโพสต์โชว์/ซ่อนต้องมี `บันทึกการขาย` | AST-040 |
| entry = wallet icon เดียว (D1 — spec เดิมมีตัวเลขมูลค่าเป็น entry) | ไม่มีทางเข้าอื่น — เจอ entry เพิ่ม = แจ้งรีวิว | AST-002, 021 |
| persist `PF_ASSETS`/`PF_SOLD` เป็น session-only ใน prototype (D9) → แอปจริงต้อง server-backed (lock เล่ม 12) | kill/sign-out/cross-device ต้องรอด — หลุด = FAIL contract | AST-096..100 |
| dev sims `?dev` (nomkt/empty/failed/denied) = dev-only (AC-PORT-021) | production ไม่มี preview entry/banner — real error state ทดสอบผ่าน offline จริง | AST-008, 105 |
| `THB` headline vs `฿` rows + `N/A` (sold) vs `—` (pfasset) = quirk ที่ spec ล็อกไว้ (money-display-rules ยัง DRAFT) | expected ตาม spec 14 ตรง ๆ — ถ้า build รวมเป็น `—` ทั้งระบบแจ้งรีวิวเพื่ออัปเดต spec ไม่ใช่ auto-FAIL | AST-009, 014, 028, 055, 061 |
| chip `Sale/Show/Hide` + `Above/At/Below market` + `No market price` + `PFO_SRC` = EN hardcode ใน prototype (FSP-026 sweep list) | ล็อกภาษาเหนือกว่า — TH mode เจอ EN ค้าง = FAIL | AST-024, 034..036, 101 |
| no-asking sale → chip `No market price` (quirk D13) | expected ตาม spec — copy เดียวกับไม่มีตลาด | AST-036 |
| `sold` post ใน viewer: menu `View sale record` แทน Edit (canonical 04 §12) | ไม่มี Edit/Mark-as-sold บนโพสต์ sold | AST-041, 051, 062, 071, 093 |
| guest/non-member เข้า portfolio → empty state (GUEST-001 pattern — prototype) → แอปจริง: guest ไม่มีทางถึงเลย | เคส guest คือ "ไม่มี entry" ไม่ใช่ "เปิดแล้วเห็นว่าง" | AST-001, 005 |
| empty portfolio ไม่มี `Sold history` link (early-return ก่อน section — spec gap) | owner ที่ขายหมดจะไม่มีทางเข้า soldhist จากหน้าจอจนกว่าจะมี asset ใหม่ — expected ตาม spec (empty state); build ที่ใส่ link ไว้ = ดีกว่า spec → แจ้งรีวิว | AST-095 |
| chat ค้างหลัง sold/hide/delete — การ์ดลิสติ้งกลาย unavailable (00_NAV §8/§10) | ห้องอยู่ การ์ดตาย — ไม่มีข้อมูลส่วนตัวหลุด | AST-088, 089 |

## §4 Traceability — inventory + actions ครอบ

| Inventory หน้า/route | Action ใน inventory | TC ที่ครอบ | หมายเหตุ |
| --- | --- | --- | --- |
| `pf-pfo` wallet บน own profile → `portfolio` | gate · entry เดียว · back · deep page no nav | AST-001..008 | `[GATE]` nav+wallet |
| `portfolio` dashboard `.pfo-total`/`.pfo-sec`/`.pfo-row`/`.pfo-note` | headline · coverage · market line · rows/count · soldlink · footnote · no-add · long list | AST-009..022 | eligible sale/show/hide |
| `pfasset:{id}` `.detail-hero[data-pfaid]`/`.pfd-id`/`.pfo-card`/`data-sell` | hero swipe+dots · chip · Value 9 rows · Listing card · Mark as sold · not-found | AST-016, 023..037 | owner-only |
| `sell:{id}` `.sell-hero`/`.sell-price`/`.sell-date`/`.sell-gl`/`.sell-save` | entries · prefill · Expected gain live · validation 3 rules · cancel · save transition+stack | AST-038..054 | materialize `assetFromPost` |
| `soldhist` `.pfo-row` → `sold:{id}` | desc · newest-first · empty · sold detail cards · G/L · holding · immutable | AST-018, 055..064 | `N/A` per spec |
| own-post menu `pm-own-sold`/`pm-own-soldview` | Mark as sold (sale/show/hide) · View sale record (sold) · no sold/post kind | AST-039..041, 051, 064, 093 | gated member |
| composer asset mode (`+`/empty CTA/`vis-opt`) + `cfToPortfolio`/`assetId` | Show/Hide/Feed visibility · cost fields · return to profile · toast | AST-076..082 | internals = FO-TEST-05 |
| Edit composer `stt-opt`/drawer toggle/`editSold` lock + `applyPostEdit` | Show/Hide↔Sale · drawer OFF · sold locked · price/cost sync | AST-065..073 | canonical lifecycle |
| `pm-own-del` → delete post+asset | delete everywhere + stale `pfasset` → not-found | AST-074, 075, 087 | canonical |
| cross-surface visibility (00_GLOBAL §10) | sale→feed/search/WA+public · show→profile only · hide/sold→owner only | AST-052, 065..068, 077, 083..085, 088, 089 | lock 3 จุด |
| persist layer | kill · sign-out · device B · mutation sync | AST-096..100 | server truth |
| lang/theme/device | TH/EN sweep · dark · device back · offline · rotate | AST-101..106 | EN ค้าง = FAIL |
| `pfo-more`/`?dev` sims | production ไม่มี entry | AST-008 | AC-PORT-021 |

## หมายเหตุท้าย

- **ก่อนส่งงานจริง**: เขียนเสร็จ → รอ PO/หัวหน้ารีวิว → แก้ตาม feedback → ค่อยปิด task (กฎเดียวกับทุกเล่ม)
- **ตัวเลขขึ้นข้อมูลจริงเป็นตัวแปรหลัก** — ทุกเคสคณิตศาสตร์ตัดสินจากค่าที่จดใน SETUP-06 (purchase/bought/asking/market/วัน sync) — อย่า FAIL เพราะจำนวนไม่ตรงตัวอย่าง; สูตรผิดเท่านั้นที่ FAIL
- **เคส BLOCK ล่วงหน้าที่คาดว่าอาจเจอ**: เคส [MKT] ทั้งชุด (AST-011, 026, 029, 031, 035 — server ไม่มีราคาตลาด) · AST-012 (เตรียมสถานะ no-GL ไม่ได้) · AST-022 (สร้าง asset เยอะไม่ได้) · AST-036 (sale ไม่ใส่ราคาไม่ได้) · AST-086 (ทำรูปพังไม่ได้) · AST-087 (ลบข้ามเครื่องไม่ได้) · AST-088/089 (ไม่มี flow Ask/chat) · AST-092 (ตั้งชื่อยาวไม่ได้) · AST-095 (ขายชิ้นสุดท้ายช้า/ทำไม่ได้) · AST-098..100 (ไม่มีเครื่องสอง/sync ยังไม่ทำ) · AST-106 (ล็อก portrait)
- **ครอบโดยเล่มอื่น ไม่ทำซ้ำ**: composer internals → FO-TEST-05 · PV/Detail internals → FO-TEST-06 · feed eligibility → FO-TEST-03 · search/WA internals → FO-TEST-04/11 · own-profile anatomy → FO-TEST-12 · Member Sheet → FO-TEST-17
- **จุดที่ล็อกในรอบนี้ (ถามผู้ใช้ 2026-10-30)**: (1) market cluster = full math + precondition BLOCK + fallback path แยก (2) 3 จุด deviation → expected ตาม canonical (ลบหายทั้งคู่ / Show·Hide→Sale ขึ้น feed / sold·show·hide ไม่โผล่ search+WA) (3) ฟอร์มขาย 2 ฟิลด์ + ไม่มีปุ่มเพิ่มใน Portfolio — เขียนเคสล็อกทั้งคู่
- **จุดเฝ้าระวังรอบรีวิว**: `N/A` vs `—` (money rules ยัง draft — expected ตาม spec 14); `THB` vs `฿`; chip/status EN hardcode (ภาษาล็อกชนะ); holding-period suffix `y`/`m` เป็นภาษาเดียวกันทั้งสองภาษา
