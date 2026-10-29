# FO-TEST-001-17 — Test Cases: Guest Gate & Member Sheet (แอปมือถือจริง)

**Task**: FO-TEST-17 ของชุด FO-TEST-001 — เล่ม cross-cutting "guest × ทุก gated action ในแอป" ที่ทุกเล่ม 02–16 mark `[GATE]` ไว้แล้วส่งต่อมาที่นี่ — เขียนเป็นเวอร์ชันเทสแอปมือถือจริงตั้งแต่แรก (ไม่มีรอบ prototype แยก เพราะ spec ล็อกแล้ว)
**SoT**: แอป TukDaeng build ทดสอบบนมือถือจริง — expected ล็อกตาม `FrontOffice/00_GLOBAL_RULES_MODULE.md` §7 (Session Model GUEST-001 + persist keys + Coach Marks) §11 (Member Sheet canonical + Guest Capabilities + Login-Required Actions + bottom-sheet dismiss rule) + `FrontOffice/01_AUTHENTICATION_MODULE.md` §7–9 (Member Sheet first-run/gate variant + Sign Out → gate + SSO + session result) + `FrontOffice/15_TRUST_SAFETY_MODULE.md` §13 (report/block gate subset) + `FrontOffice/11_SOCIAL_MODULE.md` §16 + `12_BOARD_MODULE.md` §14 (board subset) + `00_NAVIGATION_AND_CROSS_MODULE_FLOW.md` §6.2/§6.3 (Member Sheet ทับทุก layer + nav gated tabs) — `Prototypes/fo-flow` = แค่ reference ว่าหน้าตาควรเป็นแบบไหน (เช่น `GUEST_GATE_SEL` ใช้อ้างครอบเท่านั้น ไม่ใช่ตัวเทส)
**Scope**: เมทริกซ์ gated action ทุก surface (feed/viewer/detail/comments/likes · search · board · saved hub · public profile · bottom nav · create · settings) + second-layer selectors ที่ guest ถึงไม่ได้ + Member Sheet ทั้ง 2 variant (first-run/gate) anatomy + sign in/up/SSO routes + dismiss ทุกวิธี + `Don't show this again` + sign out → gate + resume contract (ไม่มี pending-action resume) + guest free-browse + persist (gate/onboarding flags รอด kill/sign-out/ข้ามเครื่อง) + TH/EN + ธีมสว่าง/มืด
**ยกเว้น**: internals ของฟีเจอร์ที่ gate ป้องกัน (composer/chat/wa sheet/save sheet/post menus/report stack/settings pages) → เล่มเจ้าของ feature · auth internals (signup form/OTP/sign-in validation/forgot/lockout/onboarding steps splash→track) → FO-TEST-01 · report/block gate **internals** → FO-TEST-16 TRS-001/020/055 (เล่มนี้เช็กเฉพาะว่า entry อยู่ใน gate list/ไม่มีทางหลุดให้ guest) · surface anatomy (feed card/search/board/profile/comments/likes) → FO-TEST-03/04/09/12/07/11 · re-consent → FO-TEST-01 AUTH-069..072 · E2E guest→member journey เต็ม → FO-TEST-18
**หมายเหตุ**: เขียนเสร็จรอรีวิว — อย่าเพิ่งปิดงาน · ชื่อไฟล์ตาม task-breakdown §17 `FO-TEST-001-17-guest-gate.md` + TC ID `GATE-nnn`

---

## §0 วิธีใช้ + สภาพแวดล้อม + กติกาที่ล็อก

- **ทดสอบบนเครื่องจริงเท่านั้น** — ติดตั้งแอป build ทดสอบลงมือถือจริง แตะ/ปัด/พิมพ์/เลื่อนบนหน้าจอจริง — **ไม่ใช้ browser, dev console, ปุ่ม dev/demo, localStorage, ข้อมูลจำลอง** — เตรียมสถานะด้วย action จริงในแอป + ข้อมูลจริงบน server เท่านั้น
- **Actors**: `GUEST` = ผ่าน onboarding แล้ว Skip for now ไม่ sign in · `MEMBER` = บัญชีทดสอบจริงบนเครื่องหลัก · `NEW` = สมัครใหม่ผ่าน flow จริง (member powers แต่ข้อมูลว่าง — 00_GLOBAL §7) · `ACCT-2` = **บัญชีจริงที่สอง บนเครื่องจริงอีกเครื่อง** — ใช้เทส per-device persist — เคสที่ต้องบัญชี/เครื่องอื่นแต่ไม่มี → mark `BLOCK` ระบุใน Note
- **Type**: `POSITIVE` · `NEGATIVE` · `EDGE` · `STATE` · `UI` · `GATE` · `GATE-inverse`
- **[GATE] ทุกเคสเทส 2 รอบ**: รอบ A `GUEST` → expect Member Sheet `เข้าร่วมตึกแดง`/`Join TukDaeng` ก่อน handler + **action ต้องไม่เกิดผล** (like ไม่ติด, follow ไม่เปลี่ยน, เมนูไม่เปิด); รอบ B `MEMBER` → expect feature ทำงานปกติไม่เจอ sheet — ไม่ครบ 2 รอบ = เทสไม่จบ
- **Gate fires before handler** — กติกาแกนของเล่มนี้: guest แตะ gated action → sheet เด้ง**ก่อน** พฤติกรรมของ action ทำงานเสมอ — ถ้า action ไปก่อนแล้ว sheet ตามหลัง = **FAIL**
- **Sheet ทับทุก layer** (00_NAV §6.2): gate ต้องลอยเหนือ feed / sub page / post viewer / post detail / bottom sheet / dialog — ปิดแล้ว surface ข้างล่างต้องอยู่สภาพเดิม
- **Resume contract (ล็อก 15 §13)**: sign-in สำเร็จจาก gate → surface เดิมคงอยู่ แต่ action ที่กดไว้ **ไม่ auto-resume** — ต้องแตะใหม่เอง ถ้า build ทำ action ค้างไว้ให้เอง = **FAIL**
- **Device back เทียบเท่า dismiss ในแอป** — bottom sheet ต้องปิดด้วย device back ได้ตามกติกา sheet ทั่วไป (00_GLOBAL §11)
- **ภาษาตามแอปทั้งหมด** (ล็อก 2026-10-28): ทุกข้อความบน Member Sheet + onboarding + auth pages เปลี่ยนตามภาษา — เจอ string ค้างอีกภาษา = **FAIL**; ยกเว้นชื่อแบรนด์ TukDaeng/Google/Apple — หมายเหตุ: **guest ไม่มีทางเปลี่ยนภาษาในแอป** (settings gated) — ภาษาของ guest = ภาษาที่เลือกตอน onboarding หรือที่ persist บนเครื่องจาก session member ก่อนหน้า
- **ธีมสว่าง/มืด**: GATE-056 ตรวจ gate Member Sheet และหน้า auth ที่เปิดจาก sheet ในทั้งสองธีม — อ่านข้อความและปุ่มได้ชัด ไม่มีส่วนสำคัญถูกกลืนกับพื้นหลัง
- **Priority**: `HIGH` = กติกาหลัก/gate entry หลัก · `MED` = entry รอง/mechanics/persist · `LOW` = quirk; เคส BLOCK ล่วงหน้า = MED เว้นกำหนด
- **Result column**: เว้นว่าง — tester กรอก `PASS`/`FAIL`/`BLOCK` + ปัญหาใน `Note`
- **ไม่มีเคสแบบ "จดผล" ไม่มีผลลัพธ์ทางเลือก** — ทุกเคส expected ตรง spec/contract ข้อเดียวเด็ดขาด ไม่ตรง = FAIL

## §1 Coverage map

| Route / Surface (inventory + `GUEST_GATE_SEL` + spec §11) | ขอบเขต | TC ที่ครอบ |
| --- | --- | --- |
| Feed card + social actions | like/save/share · follow post head · ⋯ menu trigger · Ask · comment write/like/reply/popover · likes-sheet follow | GATE-001..005 |
| second-layer selectors (อยู่หลัง parent ที่ gate) | pm-*/ni-*/rp-*/sh-*/blk-*/ch-rep-*/al-fbtn/pf-sh-*/pf-rmf/pf-dots/pf-unblock/set-btn | GATE-006 |
| Ask Seller / chat entries / detail actions | ask-pill · chat-fab · wl-btn · mf-btn | GATE-007..008 |
| overlay layers (viewer/detail/comments sheet) | gate ลอยเหนือ + dismiss แล้ว surface intact · pfp-follow pill | GATE-009..010 |
| Search | sr-wa watch alert bell · sc-follow seller card | GATE-011..012 |
| Board | article like · article share (bdlike/bdshare) | GATE-013 |
| Create + saved hub | [data-flow] `+` ทุกจุด · sr-saved → hub ว่าง (free) | GATE-014..015 |
| Public profile | pf-foll · pf-msg · pf-more · pf-avov-act · pf-flw ใน lists | GATE-016..018 |
| Bottom nav | chat / alerts / profile tabs — tab ไม่สลับ | GATE-019..021 |
| Settings + own-profile surfaces | ทุกทางตัน — ไม่มีทางถึง guest | GATE-022..023 |
| Member Sheet mechanics | anatomy 2 variants · dismiss ทุกวิธี · no-persist · auth routes · SSO · hide flag · sign out | GATE-024..035 |
| Resume contract | sign in/up/SSO จาก gate → surface คงอยู่ ต้องกดใหม่ · abandon | GATE-036..041 |
| Guest free-browse | feed tabs · search · board · viewer/detail/sheets read · public profile · legal | GATE-042..048 |
| Persist / session | kill · sign-out clear · onboarding flags · per-device · guest coach marks · session expiry | GATE-049..054 |
| TH/EN + light/dark | sheet copy 2 ภาษา 2 variants · gate sheet ตรวจในธีมสว่างและมืด | GATE-055..056 |

## §2 Test cases

ผู้ทดสอบ: อ่าน expected ก่อนรันเสมอ — เคสที่เขียน "BLOCK ถ้า..." ให้ mark BLOCK พร้อมเหตุผลใน Note (ห้าม workaround)

### Setup

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SETUP-01 | ติดตั้งแอป | — | SETUP | เครื่องจริงเครื่องหลัก | ติดตั้ง build ทดสอบที่ทีมส่งให้ → เปิดแอป | เห็นหน้า onboarding (แอปสะอาด) | splash/หน้าแรกของแอป | — | |
| SETUP-02 | สถานะเริ่มต้น | — | SETUP | แอปติดตั้งแล้ว | ลบข้อมูลแอป/ติดตั้งใหม่ ถ้าเคยใช้เครื่องนี้มาก่อน | แอปสะอาด เหมือนผู้ใช้ใหม่ | — | — | |
| SETUP-03 | ผู้ใช้ GUEST | — | SETUP | แอปสะอาด | เดิน onboarding ครบ → หน้า Member Sheet **ไม่ติ๊ก** `Don't show this again` → `Skip for now` | เข้า feed เป็น guest — บันทึกภาษาที่เลือกตอน onboarding ลง Note (ใช้เคส TH/EN) | bottom nav ครบ 5 แท็บ | — | |
| SETUP-04 | ผู้ใช้ MEMBER | — | SETUP | แอปสะอาด | sign in ด้วยบัญชีทดสอบที่ทีมสร้าง | เข้า feed เป็นสมาชิก | avatar/ชื่อตัวเองในที่ที่ต้องแสดง | — | |
| SETUP-05 | เครื่องที่สอง + ACCT-2 | — | SETUP | มีเครื่องจริงอีกเครื่อง | ติดตั้ง build เดียวกันลงเครื่องสอง → ผ่าน onboarding → Skip เป็น guest (ไม่ต้อง sign in) · sign in `ACCT-2` ไว้ถ้าต้องใช้ | เครื่อง B พร้อมเป็น guest — ถ้าไม่มีเครื่องสอง → เคส GATE-052 เป็น BLOCK | — | — | |
| SETUP-06 | ชุดข้อมูลทดสอบ | MEMBER | SETUP | sign in แล้ว | ทำผ่านแอปจริงแล้วบันทึกชื่อลง Note: เลือก `P-1` โพสต์ขาย + `P-2` โพสต์ธรรมดาของคนอื่นที่มี comments+likes · `U-PUB` public profile ที่มีโพสต์+followers · `ART-1` บทความบน board · เจอ seller card ใน search results | ข้อมูลพร้อม — หา fixture ไม่ได้ = เคสที่เกี่ยว BLOCK | — | — | |
| SETUP-07 | member baseline สำหรับเทส clear | MEMBER | SETUP | SETUP-06 เสร็จ | like `P-1` · save `P-2` · follow `U-PUB` · ตั้ง watch alert 1 รายการ · มี chat thread อย่างน้อย 1 รายการ · สลับ feed ไป tab `กำลังติดตาม`/`Following` ค้างไว้ | ข้อมูลติดบัญชีพร้อม — ใช้เคส sign-out clear (GATE-050) | — | — | |
| SETUP-08 | ทางเข้า gated entries ครบ | MEMBER | SETUP | SETUP-06 เสร็จ | เดินเปิดทีละ entry เป็น member: like/save/share/comment-input/follow/⋯/ask · search bell+seller follow · board like/share · `+` · nav chat/alerts/profile · public profile follow/chat/⋯/avatar/list-follow | ทุก entry เจอและทำงานเป็น member — หน้าไหนไม่มี entry = เคสที่เกี่ยว BLOCK ระบุ | — | — | |

### 2.1 Gate Matrix — Feed / Post / Overlays

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GATE-001 | [GATE] like / save / share บน feed card | GUEST/MEMBER | GATE | guest บน feed มี `P-1`/`P-2` | **รอบ A (GUEST)**: แตะ like → dismiss → แตะ save → dismiss → แตะ share · **รอบ B (MEMBER)**: แตะทั้งสาม | A: ทุกแตะ → Member Sheet `เข้าร่วมตึกแดง`/`Join TukDaeng` ก่อน handler — หลัง dismiss โพสต์**ไม่ถูก like** (หัวใจไม่ติด/ตัวเลขไม่ขยับ) ไม่มี save sheet ไม่มี share sheet; B: like toggle, save sheet, share sheet เปิดปกติ | A: sheet gate ทับ feed; B: ไม่มี sheet | HIGH | |
| GATE-002 | [GATE] comment write actions | GUEST/MEMBER | GATE | `P-1` มี comments | **รอบ A**: เปิด comments sheet (ฟรี) → แตะช่องพิมพ์ → dismiss → แตะ emoji row → dismiss → แตะไลก์ comment → dismiss → แตะ reply/meta · **รอบ B** | A: sheet เปิดอ่านได้ แต่ทุก write action → Member Sheet — ไม่มี keyboard เด้ง ไม่มี like/reply เกิด; B: พิมพ์/emoji/like/reply ทำงาน (reply 1 ชั้น) | A: input ไม่โฟกัส sheet ทับ comments sheet | HIGH | |
| GATE-003 | [GATE] comment popover items | GUEST/MEMBER | GATE | `P-1` มี comment คนอื่น | **รอบ A**: long-press comment → แตะ `Report`/`Block` บน popover · **รอบ B** | A: popover เปิดได้แต่แตะ item → Member Sheet ก่อน act (in-handler gate — internals เคส TRS-020 ครอบแล้ว เล่มนี้เช็กเฉพาะว่า entry ยังอยู่ใน gate list); B: เปิด blkSheet/report flow | — | HIGH | |
| GATE-004 | [GATE] follow entries บน content | GUEST/MEMBER | GATE | `P-1` + post ที่มี likers | **รอบ A**: แตะ `ติดตาม`/`Follow` บน post head → dismiss → เปิด likes sheet (ฟรี) → แตะ Follow บนแถว liker · **รอบ B** | A: ทั้งสองจุด → Member Sheet ปุ่มไม่เปลี่ยนสถานะ; B: follow toggle ทำงานทั้งสองจุด | — | HIGH | |
| GATE-005 | [GATE] post ⋯ menu trigger | GUEST/MEMBER | GATE | feed มี `P-1` | **รอบ A**: แตะ ⋯ บนการ์ด · **รอบ B**: แตะ ⋯ | A: Member Sheet เด้งทันที — guest **เห็นเมนูไม่ได้ด้วยซ้ำ** (ไม่มีแถว ไม่สนใจ/รายงาน โผล่); B: sheet เมนูเปิดปกติ (คนอื่น: favorites/ไม่สนใจ/รายงาน) | — | HIGH | |
| GATE-006 | [GATE] second-layer ไม่มีทางหลุดให้ guest | GUEST | NEGATIVE | guest browse ได้ | เดินทุก free surface (feed/search/board/viewer/detail/comments/likes/public profile/lists/avatar overlay) หาทางแตะถึง: ไม่สนใจ · favorites · report/block/mute ทุกรูป · own-post actions (archive/pin/edit/mark sold/delete) · share-sheet rows · alerts follow btn · unblock · settings btn | **ไม่มี path ใดเปิด actions เหล่านี้ได้เลย** — ทุกตัวอยู่หลัง parent ที่ gate (⋯/pf-more/nav/chat/settings ถูกดักตั้งแต่ชั้นแรก) — build ที่ให้ guest เห็น/แตะ layer 2 ได้ = FAIL ที่ parent | — | MED | |
| GATE-007 | [GATE] Ask Seller + chat entries | GUEST/MEMBER | GATE | `P-1` โพสต์ขาย + post detail เปิดได้ | **รอบ A**: แตะ `ถามผู้ขาย`/Ask pill บนการ์ด → dismiss → เปิด detail → แตะ chat-fab/Ask ใน detail · **รอบ B** | A: ทุก chat entry → Member Sheet ไม่มีห้องแชทสร้าง; B: เปิด chat/สร้าง draft thread ตาม spec 07 | — | HIGH | |
| GATE-008 | [GATE] wishlist + model-follow bell บน detail | GUEST/MEMBER | GATE | post detail เปิด | **รอบ A**: แตะ wl-btn (ของขวัญ) → dismiss → แตะ mf-btn (กระดิ่ง) · **รอบ B** | A: ทั้งคู่ → Member Sheet — ไม่มี wishlist sheet ไม่มี watch alert sheet; B: wl sheet + wa sheet เปิดตาม spec | — | HIGH | |
| GATE-009 | [GATE] sheet ทับ overlay layers + คืนสภาพ | GUEST/MEMBER | GATE | guest เปิด viewer/detail/comments ได้ | **รอบ A**: (1) เปิด Post Viewer จาก tile → แตะ like → dismiss (2) เปิด Post Detail → แตะ like → dismiss (3) comments sheet → แตะ input → dismiss · **รอบ B**: ทำซ้ำเป็น member | A: Member Sheet ลอยเหนือทุก layer — dismiss แล้ว viewer/detail/comments sheet ข้างล่าง**อยู่สภาพเดิมครบ** (ตำแหน่ง scroll/โพสต์เดิม/sheet ไม่หุบ); B: actions ทำงานใน overlays ปกติ | gate sheet อยู่ชั้นบนสุดเหนือทุก surface | HIGH | |
| GATE-010 | [GATE] follow pill ใน viewer head (pfp) | GUEST/MEMBER | GATE | viewer "Posts" จาก profile grid ของ `U-PUB` (ยังไม่ follow) | **รอบ A**: เปิด viewer จาก grid tile → แตะ Follow pill บน head · **รอบ B** | A: → Member Sheet ปุ่มไม่เปลี่ยน; B: follow ทันทีปุ่มหาย/เปลี่ยนสถานะ | — | MED | |

### 2.2 Gate Matrix — Search / Board / Create / Library

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GATE-011 | [GATE] watch alert bell บน search results | GUEST/MEMBER | GATE | guest search keyword ที่มีผล | **รอบ A**: search → หน้า results → แตะกระดิ่ง · **รอบ B** | A: → Member Sheet — wa sheet ไม่เปิด; B: wa create sheet เปิด autofill จาก query+filters | — | HIGH | |
| GATE-012 | [GATE] follow บน seller card ใน results | GUEST/MEMBER | GATE | results มี seller cards | **รอบ A**: scroll ถึง seller card → แตะ `ติดตาม` · **รอบ B** | A: → Member Sheet ปุ่มไม่เปลี่ยน; B: follow toggle | — | MED | |
| GATE-013 | [GATE] board article like + share | GUEST/MEMBER | GATE | `ART-1` เปิดได้จาก board | **รอบ A**: เปิดบทความ → แตะ like pill → dismiss → แตะ share pill · **รอบ B** | A: ทั้งคู่ → Member Sheet — like count ไม่ขยับ ไม่มี share sheet (S-03: share ต้อง login ทุก surface); B: like toggle + share ทำงาน | — | HIGH | |
| GATE-014 | [GATE] create `+` ทุก entry | GUEST/MEMBER | GATE | guest บน feed | **รอบ A**: แตะ `+` บน app header → dismiss → หา `+`/ปุ่มสร้างอื่นที่ guest เห็นได้ แตะทีละจุด · **รอบ B**: แตะ `+` | A: ทุก create entry (`[data-flow]`) → Member Sheet — composer ไม่เปิด; B: composer picker เปิด | — | HIGH | |
| GATE-015 | saved hub เข้าได้แต่ว่าง (ไม่ gate) | GUEST/MEMBER | GATE-inverse | guest บน search landing | **รอบ A**: แตะ bookmark shortcut บน search head → ดูหน้า saved · **รอบ B**: member เข้า saved | A: **ไม่เจอ sheet** — hub เปิดแสดง empty `Nothing saved yet`/`ยังไม่มีรายการที่บันทึก` (sr-saved ไม่อยู่ใน gate list — hub ว่างอยู่แล้ว); B: เห็นรายการที่ save ไว้ | — | MED | |

### 2.3 Gate Matrix — Profile / Nav / Settings

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GATE-016 | [GATE] public profile actions | GUEST/MEMBER | GATE | `U-PUB` เปิดได้ | **รอบ A**: แตะ `ติดตาม` → dismiss → แตะ `แชท`/`Chat` → dismiss → แตะ ⋯ · **รอบ B** | A: ทั้งสาม → Member Sheet — follow ไม่เปลี่ยน ไม่มีห้องแชท เมนูไม่เปิด; B: follow toggle / เปิดห้องแชท / เมนู pf-more เปิด | — | HIGH | |
| GATE-017 | [GATE] avatar overlay actions | GUEST/MEMBER | GATE | `U-PUB` มี avatar | **รอบ A**: แตะ avatar (overlay เปิดฟรี) → แตะ Follow → dismiss → เปิดใหม่แตะ Share → dismiss → แตะ Copy link · **รอบ B** | A: overlay shell เปิดได้แต่ทุก action → Member Sheet — ไม่มี copy เกิด; B: follow/share/copy ทำงาน | — | MED | |
| GATE-018 | [GATE] follow rows ใน followers/following list | GUEST/MEMBER | GATE | `U-PUB` มี followers | **รอบ A**: แตะ stats → เปิด followers list (ฟรี) → แตะ Follow บนแถว user · **รอบ B** | A: list เปิดอ่านได้แต่ปุ่ม Follow → Member Sheet; B: follow toggle ต่อแถว | — | MED | |
| GATE-019 | [GATE] bottom nav — แชท | GUEST/MEMBER | GATE | guest บน feed | **รอบ A**: แตะแท็บ `แชท`/`Chat` · **รอบ B** | A: Member Sheet ทับ feed — **แท็บไม่สลับ** active ยังอยู่ feed + ไม่มี chat list/badge โผล่; B: เปิด chat list ปกติ | — | HIGH | |
| GATE-020 | [GATE] bottom nav — แจ้งเตือน | GUEST/MEMBER | GATE | guest บน feed | **รอบ A**: แตะแท็บ `แจ้งเตือน`/`Alerts` · **รอบ B** | A: Member Sheet — แท็บไม่สลับ ไม่มี alerts โผล่; B: เปิด alerts feed ปกติ | — | HIGH | |
| GATE-021 | [GATE] bottom nav — โปรไฟล์ | GUEST/MEMBER | GATE | guest บน feed | **รอบ A**: แตะแท็บ `โปรไฟล์`/`Profile` · **รอบ B** | A: Member Sheet — แท็บไม่สลับ own profile เข้าไม่ได้; B: เปิด own profile ปกติ | — | HIGH | |
| GATE-022 | [GATE] settings entry — ทุกทางตัน | GUEST/MEMBER | GATE | guest browse ได้ | **รอบ A**: หาทางเข้า settings ทุกจุด (nav profile → gate · ⋯ ต่าง ๆ · drawer) · **รอบ B**: own profile → เมนู → settings | A: **ไม่มี path ใดถึง settings** — ทุกทางตัน Member Sheet ที่ปุ่มชั้นแรก (settings ทั้งชุดอยู่หลัง own profile menu ที่ gate); B: settings home เปิดปกติ | — | HIGH | |
| GATE-023 | [GATE] own-profile surfaces ถึงไม่ได้เลย | GUEST | NEGATIVE | guest browse ได้ | หาทางเข้า: own profile · pedit · portfolio · `+` add asset · followers/following ของตัวเอง · QR · walerts · blocked/muted/favorites/interested/ni lists · About this account (ผ่าน pf-more) | ทุก surface เข้าไม่ได้ — ทางเข้าทั้งหมดอยู่หลัง nav profile / pf-more / pf-menu / settings ที่ gate ชั้นแรก — build ที่เปิดหน้าเหล่านี้ให้ guest เห็น (แม้แต่ empty) = FAIL | — | MED | |

### 2.4 Member Sheet — Mechanics

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GATE-024 | gate variant anatomy | GUEST | UI | gate sheet เปิดจาก gated action | อ่าน sheet | — | **bottom sheet** (ไม่ใช่ center dialog): scrim + grab handle + ภาพประกอบ + title `เข้าร่วมตึกแดง`/`Join TukDaeng` + body `เข้าสู่ระบบหรือสมัครสมาชิกฟรีเพื่อใช้ฟีเจอร์นี้`/`Sign in or create a free account to use this feature.` + `สมัครสมาชิก`/`Sign up` (primary) + `เข้าสู่ระบบ`/`Sign in` (secondary) + `ข้ามไปก่อน`/`Skip for now` (text) + social row Google/Apple — **ไม่มี** checkbox `Don't show this again` | HIGH | |
| GATE-025 | first-run variant anatomy | GUEST | UI | แอปสะอาด เดิน onboarding ถึง member sheet | อ่าน sheet | — | anatomy เดียวกันแต่ body `สร้างบัญชีฟรีเพื่อติดตามนักสะสม แชท และลงขายนาฬิกาของคุณ`/`Create a free account to follow collectors, chat and list your watches.` + มี checkbox `ไม่ต้องแสดงข้อความนี้อีก`/`Don't show this again` — ต่างจาก gate variant 2 จุด (body copy + checkbox) | MED | |
| GATE-026 | scrim dismiss | GUEST | POSITIVE | gate sheet เปิด | แตะบริเวณมืด (scrim) หลัง sheet | sheet ปิด — ยัง guest หน้าเดิม action เดิมไม่ทำงาน ไม่มี toast | sheet เลื่อนลงหาย surface ข้างล่างสภาพเดิม | HIGH | |
| GATE-027 | `Skip for now` dismiss | GUEST | POSITIVE | gate sheet เปิด | แตะ `ข้ามไปก่อน`/`Skip for now` | ปิดเงียบกลับ browse ต่อเป็น guest — session ไม่เปลี่ยน action ไม่ทำงาน | ไม่มี toast/feedback พิเศษ | HIGH | |
| GATE-028 | device back dismiss | GUEST | POSITIVE | gate sheet เปิด | กด device back (Android gesture/button) | ปิด sheet เทียบเท่า scrim dismiss (bottom-sheet rule 00_GLOBAL §11) — **ไม่ออกจากแอป** | — | MED | |
| GATE-029 | ไม่จำ choice — เปิดใหม่ทุกครั้ง | GUEST | STATE | ดัก gate ด้วย scrim/Skip ไปแล้ว | แตะ gated action ซ้ำ 3–4 ครั้งสลับวิธี dismiss | sheet เปิดใหม่ทุกครั้งสภาพเดิม — ไม่มี "จำว่าเคยปิด" — gate mode ไม่ persist choice (00_GLOBAL §11) | — | HIGH | |
| GATE-030 | กดรัว → sheet ใบเดียว | GUEST | EDGE | guest บน feed | แตะ gated action รัว ๆ หลายครั้งก่อน sheet ขึ้นเต็ม | เปิด sheet เดียวไม่ stack ซ้ำ ไม่กระพริบหลายใบ | — | LOW | |
| GATE-031 | เส้นทาง Sign up / Sign in จาก sheet | GUEST | POSITIVE | gate sheet เปิด | (1) `สมัครสมาชิก` → ดูหน้า → back (2) `เข้าสู่ระบบ` → ดูหน้า → back | `Sign up` → หน้า `Create your account` · `Sign in` → หน้า `Sign in` — back จากทั้งสองหน้า**กลับ Member Sheet** ไม่ใช่ออกไป feed | sheet กลายเป็นหน้า auth เต็มจอ | HIGH | |
| GATE-032 | SSO row จาก sheet | GUEST | POSITIVE | gate sheet เปิด + มีบัญชี Apple/Google ทดสอบ — ไม่มี → `BLOCK` | `Google`/`Apple` → ดู flow → (ทำซ้ำ) ยกเลิกกลาง provider sheet | เลือก → เปิด provider sign-in ของ OS จริง (ไม่มี toast placeholder) — ยกเลิกกลาง flow → กลับ Member Sheet/session guest เดิม | — | MED | |
| GATE-033 | hide + Skip → run ถัดไปเงียบ | GUEST | STATE | first-run member sheet บนแอปสะอาด | ติ๊ก `Don't show this again` → `Skip for now` → kill app → เปิดใหม่ → kill อีกครั้ง → เปิดใหม่ | ทุก run ถัดไปเข้า feed เงียบ ๆ **ไม่แสดง sheet อัตโนมัติอีก** (persist `fo_member_hide` — AC-AUTH-030) — แต่ gate จาก action ยังเด้งปกติ | checkbox ติดจริงก่อน Skip | HIGH | |
| GATE-034 | ไม่ hide + Skip → sheet เด้งใหม่ run ถัดไป | GUEST | STATE | ต้อง reset แอปสะอาดอีกรอบ (หลัง GATE-033) | onboarding ใหม่ → member sheet **ไม่ติ๊ก** hide → `Skip for now` → kill → เปิดใหม่ | run ถัดไป member sheet **เด้งอัตโนมัติอีก** เป็น re-prompt (flag `fo_member_hide` ไม่ถูกตั้ง — spec เงื่อนไข "เข้าเงียบ" ผูกกับการติ๊กเท่านั้น) | — | MED | |
| GATE-035 | sign out → gate sheet ทันที | MEMBER→GUEST | STATE | sign in อยู่ | Settings → `ออกจากระบบ` → ยืนยัน → สังเกต → แตะ scrim/Skip | หลัง logout เข้า feed เป็น guest + Member Sheet gate variant เด้งทันทีให้ sign in กลับ (spec 01 §8 step 3) — dismiss แล้ว browse ต่อเป็น guest | toast `ออกจากระบบสำเร็จ`/`Logged out successfully` + sheet ทับ feed | HIGH | |

### 2.5 Resume Contract (ล็อก — ไม่มี pending-action resume)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GATE-036 | sign in จาก gate (feed) → ต้องกดใหม่ | GUEST→MEMBER | POSITIVE | guest แตะ like `P-1` → sheet เปิด | `เข้าสู่ระบบ` → sign in สำเร็จ → กลับดู `P-1` | เข้า feed เป็น member ตำแหน่งเดิม — โพสต์**ยังไม่ถูก like** (action ไม่ resume) — แตะ like อีกครั้งถึงติด | feed สภาพเดิม session member | HIGH | |
| GATE-037 | sign in จาก gate บน overlay → overlay คงอยู่ | GUEST→MEMBER | STATE | guest เปิด Post Viewer/Detail → แตะ like → sheet | sign in สำเร็จ | กลับมา viewer/detail **ยังเปิดอยู่เหนือ feed** โพสต์เดิม — like ไม่ได้ทำ — กดใหม่ทำงาน | overlay ไม่ถูกปิดไปด้วย | HIGH | |
| GATE-038 | sign in ระหว่าง comments sheet → sheet ค้าง | GUEST→MEMBER | STATE | comments sheet เปิด + gate จาก input | sign in สำเร็จ | กลับมา comments sheet ยังเปิด — input ยังต้องแตะใหม่เอง (คราวนี้พิมพ์ได้เพราะ member) | sheet ไม่หุบ | MED | |
| GATE-039 | sign up จาก gate → session `new` + member powers | GUEST→NEW | POSITIVE | gate sheet เปิด + อีเมลทดสอบรับ OTP จริง — ไม่มี → `BLOCK` | `สมัครสมาชิก` → เดิน flow ครบจนเข้าแอป → กลับ surface เดิม → แตะ action ที่เคยกด | สมัครสำเร็จเข้า session `new` — surface เดิมคงอยู่ — gated action ทำงานทันทีเมื่อกดใหม่ (new = member powers ข้อมูลว่าง) | — | MED | |
| GATE-040 | SSO returning จาก gate → เข้าเงียบ ๆ | GUEST→NEW | POSITIVE | มีบัญชีที่เคยสมัครด้วย provider เดียวกันในเครื่อง — ไม่มี → `BLOCK` | gate sheet → `Google`/`Apple` (provider เดียวกับบัญชีที่ persist) | เข้า session `new` ของตัวเองเงียบ ๆ ไม่ผ่าน profile step ไม่มี welcome toast — surface เดิมคงอยู่ — action ไม่ resume ต้องกดใหม่ | — | MED | |
| GATE-041 | abandon auth กลางทาง → ยัง guest | GUEST | NEGATIVE | gate sheet → `เข้าสู่ระบบ` → หน้า sign in | back → sheet → scrim dismiss → ทำซ้ำด้วย `สมัครสมาชิก` | ยกเลิกทุกจุดกลับ guest browse ต่อ — ไม่มี session ถูกสร้าง action เดิมไม่ทำงาน | — | MED | |

### 2.6 Guest Free-Browse — ยืนยัน "ไม่เจอ" sheet (GATE-inverse)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GATE-042 | feed ทั้ง 3 tabs ใช้ได้เสรี | GUEST | GATE-inverse | guest บน feed | สลับ `ทั้งหมด`/`กำลังติดตาม`/`รายการโปรด` กลับไปมา + scroll + pull | สลับได้ทุกแท็บไม่มี sheet — Following/Favorites แสดง empty state เพราะ guest ไม่มีความสัมพันธ์ (§11) | tab สลับจริง ไม่ใช่ค้าง All | HIGH | |
| GATE-043 | search + filter + recents เสรี | GUEST | GATE-inverse | guest | explore tiles → พิมพ์ suggest → submit results → เปิด sfilter → ใส่ brand/price → Apply → เปิด recents → ลบแถว/Clear all | ทุกขั้นทำได้ไม่มี sheet — filter apply จริง chips ขึ้น recents จัดการได้ | — | HIGH | |
| GATE-044 | board read เสรี | GUEST | GATE-inverse | guest | แท็บ `กระดานข่าว` → เลื่อน hero/dots → View all → เลือก category → search → เปิด `ART-1` อ่าน | browse/read ได้ครบไม่มี sheet — กระทั่งแตะ like/share เท่านั้นที่ gate (GATE-013) | — | MED | |
| GATE-045 | viewer/detail/comments/likes read เสรี | GUEST | GATE-inverse | guest | เปิด viewer จาก tile → เลื่อนโพสต์ → เปิด caption/details sheets → View full detail → เปิด comments อ่าน → เปิด likes sheet อ่าน | read surfaces ทั้งหมดเปิดได้ไม่มี sheet — gate เฉพาะ write/action เท่านั้น | — | HIGH | |
| GATE-046 | public profile read เสรี | GUEST | GATE-inverse | `U-PUB` | เปิดโปรไฟล์ → สลับ tabs → แตะ grid tile → viewer → เปิด followers/following lists → แตะ avatar overlay (shell) | อ่านได้ครบไม่มี sheet — action บน surface เหล่านี้ค่อย gate ทีละจุด (GATE-016..018) | — | MED | |
| GATE-047 | legal viewer เสรี | GUEST | GATE-inverse | guest | เปิด Terms of Use / Privacy Policy จากทางเข้าที่ guest ถึงได้ (ลิงก์บน member sheet/auth pages/onboarding) → อ่าน → ปิด | legal viewer เปิดได้ไม่ gate — แสดง version + effective date — หมายเหตุ: ในแอป guest ไม่มี settings entry (GATE-022) จึงถึง legal ผ่าน onboarding/auth links เท่านั้น | — | MED | |
| GATE-048 | sweep ไม่มี gate หลุม | GUEST | NEGATIVE | guest ทั่วแอป | scroll/drag/pull-refresh/back/แตะ avatar→profile/แตะ hashtag/แตะ tile/แตะ breadcrumb บน free surfaces รัว ๆ | ไม่มี Member Sheet เด้งจาก interaction ที่ไม่ใช่ gated action — sheet เด้งเฉพาะตามเมทริกซ์ §2.1–2.3 เท่านั้น | — | LOW | |

### 2.7 Persist / Session / Coach Marks

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GATE-049 | guest persist ข้าม kill | GUEST | STATE | guest + เคย dismiss gate | kill app → เปิดใหม่ → แตะ gated action | ยัง guest (ไม่ auto sign-in) — gate ยังเด้งปกติ — guest ที่ไม่ได้ติ๊ก hide เจอ re-prompt sheet ตาม GATE-034 | — | HIGH | |
| GATE-050 | sign out → เคลียร์ข้อมูลส่วนตัวทุก surface | MEMBER→GUEST | STATE | SETUP-07 ทำแล้ว (like/save/follow/WA/chat + feed ค้าง Following) | sign out → dismiss gate sheet → เช็ก feed/โพสต์เดิม/profile คนที่เคย follow | session guest: `P-1` ไม่ติด like `P-2` ไม่ติด saved `U-PUB` ไม่ใช่ following — feed tab กลับ `ทั้งหมด`/`All` — ไม่มี chat/alerts badge — flags ส่วนตัวหายทุก surface (00_GLOBAL §7 Session Data Rules) | — | HIGH | |
| GATE-051 | onboarding flags รอด kill + sign-out-in | MEMBER | STATE | ผ่าน onboarding + sign in แล้ว | kill → เปิดใหม่ → sign out → sign in ใหม่ → kill → เปิดใหม่ | onboarding ไม่รันซ้ำทุกกรณี (persist onboarded) — coach marks ไม่เด้งซ้ำ (persist toured) — member_hide ที่เคยติ๊กยังมีผลต่อ guest re-prompt | — | MED | |
| GATE-052 | member_hide เป็นของเครื่อง | GUEST + ACCT-2 | STATE | SETUP-05 เครื่อง B — ไม่มี → `BLOCK` | เครื่อง A: ติ๊ก hide+Skip (GATE-033) · เครื่อง B: guest ปกติ → kill → เปิดใหม่ | flag ไม่ตามไปเครื่อง B — เครื่อง B ที่ไม่เคยติ๊ก hide ยังเจอ re-prompt sheet ตามปกติ (device-local flag เหมือน lang/theme — lock per-device) | — | MED | |
| GATE-053 | guest coach marks = variant sign-up | GUEST | UI | guest รอบแรกหลัง onboarding | สังเกต coach marks หลังเข้า feed → kill → เปิดใหม่ดูอีกครั้ง | guest variant nudge **sign-up** แทน member actions (00_GLOBAL §7) — แสดงครั้งเดียว (persist toured) run ถัดไปไม่เด้ง — build ที่ nudge create/save ให้ guest = FAIL | — | MED | |
| GATE-054 | session หมดอายุ/ถูก revoke → guest หรือ sheet | MEMBER | NEGATIVE | ต้องมีช่องทาง expire/revoke session จาก server — ไม่มี → `BLOCK` ระบุ | บังคับ token หมดอายุ/BO suspend ระหว่างใช้งาน → แตะ gated action | กลับ guest state หรือแสดง Member Sheet ตาม context (01 §9 Token rules / 00_GLOBAL §7 revoke → account status state) — contract ฝั่ง server | — | MED | |

### 2.8 TH/EN + Dark Theme บน Member Sheet

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GATE-055 | TH/EN sweep ทั้ง 2 variants | GUEST | UI | guest ที่เลือก TH ตอน onboarding (SETUP-03 บันทึก) + member ตั้ง EN แล้ว sign out เพื่อได้ guest EN | ภาษา TH: trigger gate → อ่าน sheet + เปิด first-run ดู variant+checkbox · ภาษา EN: ทำซ้ำ | TH: `เข้าร่วมตึกแดง` + `เข้าสู่ระบบหรือสมัครสมาชิกฟรีเพื่อใช้ฟีเจอร์นี้` + `สมัครสมาชิก`/`เข้าสู่ระบบ`/`ข้ามไปก่อน` + checkbox `ไม่ต้องแสดงข้อความนี้อีก` · EN: `Join TukDaeng` + `Sign in or create a free account to use this feature.` + `Sign up`/`Sign in`/`Skip for now` + `Don't show this again` — ทุก string ตามภาษาไม่มีค้าง | — | MED | |
| GATE-056 | Member Sheet อ่านชัดในธีมสว่างและมืด | GUEST | UI | ใช้เครื่องเดิมที่เปลี่ยนธีมได้ และตั้งค่า theme คงอยู่หลัง sign out | รอบธีมสว่าง: ขณะเป็น MEMBER ตั้ง Light → sign out → เปิด gate sheet → เข้า Sign in แล้วกลับ sheet · รอบธีมมืด: sign in → ตั้ง Dark → sign out → เปิด gate sheet → เข้า Sign in แล้วกลับ sheet | ทั้งสองรอบยังเป็น GUEST และ gate sheet ทำงานเหมือนเดิม — ไม่เกิดการทำ action ที่เรียก gate | title/body/ปุ่ม/social row อ่านชัด ไม่ถูกตัดหรือกลืนกับพื้นหลังทั้ง Light และ Dark; หน้า Sign in ที่เปิดจาก sheet อ่านได้ในทั้งสองธีม | LOW | |

## §3 จุดเฝ้าระวัง spec ↔ prototype ↔ เคส

| จุด | สถานะ | เคสที่เกี่ยว |
| --- | --- | --- |
| **gate list ครอบ selector ลูกผ่านพ่อ** — `.sc-follow` (seller card) มี class `.follow-btn` และ `pfp-follow` มี class `.pf-foll` อยู่แล้ว — gate ทำงานแม้ selector ย่อยไม่อยู่ใน list ตรง ๆ — build ต้องเช็กผลจริง ไม่ใช่ชื่อ class | observed in prototype | GATE-010/012 |
| **`[data-bdsave]`/`[data-bdact]` = dead entries** — spec 12 §14 บอก gate list ยังคุมไว้ แต่ V1 ไม่มี entry จริงบนบทความ (report article = contract-only → TRS-059) — build ที่มี entry เหล่านี้ต้อง gate ด้วยเช่นกัน | contract-only V1 | GATE-013 |
| **hide flag มีผลเฉพาะ first-run sheet** — `fo_member_hide` ไม่ปิด gate variant — guest ที่ติ๊ก hide แล้วยังเจอ sheet ทุกครั้งที่แตะ gated action (spec §11: gate mode ไม่จำ choice) — ส่วน re-prompt ตอน launch (GATE-034) อิงเงื่อนไข spec: "เข้าเงียบ" ผูกกับการติ๊กเท่านั้น | spec-implied | GATE-029/033/034 |
| **saved hub guest → เข้าได้แต่ empty** — `sr-saved` ไม่อยู่ใน gate list (spec 11 §16 not-gated column) — wishlist/settings path ตันเพราะ pf-menu gated — ถ้า build gate bookmark shortcut = FAIL เพราะ spec ให้เข้า | spec 11 §16 | GATE-015 |
| **second-layer = defense-in-depth** — `.pm-*`/`.rp-*`/`.blk-*`/`.ch-rep-*`/`.ni-*`/`.pf-sh-*`/`.sh-add`/`.sh-fr`/`.al-fbtn`/`.set-btn`/`.pf-rmf`/`.pf-dots`/`.pf-unblock` อยู่ใน gate list แต่ guest ถึงไม่ได้เพราะ parent gate — เคสเช็ก "ไม่มีทางหลุด" แทนการเทสทีละตัว (internals อยู่เล่มเจ้าของ feature) | by design | GATE-006/023 |
| **SSO จาก gate ต้องมีบัญชี provider ทดสอบ** — returning = silent `new`; first-time = social registration — ไม่มีบัญชี Apple/Google ผูกเครื่อง → BLOCK | BLOCK ล่วงหน้า | GATE-032/040 |
| **guest ไม่มีทางเปลี่ยนภาษา/ธีมในแอป** — settings ทั้งชุด gated (§11) — ภาษาของ guest = ที่เลือกตอน onboarding หรือค่า persist บนเครื่องจาก member ก่อน sign out — ถ้า build ให้ guest เข้า lang/theme ได้ผ่านทางอื่น = FAIL GATE-022 | spec §11 | GATE-022/055/056 |
| **session expiry/revoke = contract ฝั่ง server** — token หมดอายุ → guest หรือ sheet (01 §9); Suspended/Banned → account status state (00_GLOBAL §7) — prototype ไม่ครอบ ต้องอาศัย backend | BLOCK ล่วงหน้า | GATE-054 |
| **deep link → gated surface** — guest เปิดลิงก์ชี้ chat/alerts/own profile — contract 00_NAV; ไม่มีช่องทางสร้างลิงก์บนเครื่อง → เช็กเท่าที่ทีมทำ fixture ไว้ | BLOCK ถ้าไม่มี fixture | GATE-019..021 |
| **sign out → gate sheet ทันที** — spec 01 §8 step 3 บังคับ sheet เด้งหลัง logout — build ที่ sign out แล้วเงียบ = FAIL | spec lock | GATE-035 |

## §4 Traceability — inventory + `GUEST_GATE_SEL` ครอบ

| กลุ่มจาก `GUEST_GATE_SEL` / spec §11 login-required list | TC ที่ครอบ | หมายเหตุ |
| --- | --- | --- |
| `.like-btn` `.save-btn` `.share-btn` (feed/viewer/detail/pv) | GATE-001, 009 | |
| `.comment-input` `.emoji-row` `.c-like` `.c-meta` | GATE-002 | sheet เปิดอ่านฟรี |
| comment popover `c-pop-item` (in-handler gate) | GATE-003 | internals → TRS-020 |
| `.follow-btn` `.lk-follow` `.sc-follow` (ผ่าน .follow-btn) | GATE-004, 012 | |
| `.post-head .more` `.pm-btn` | GATE-005 | guest เห็นเมนูไม่ได้ |
| `.pm-fav` `.pm-ni` `.pm-go-report` `.pm-own-*` `.rp-opt` `.pm-reason` `.uc-report` `.ni-mute` `.ni-unfollow` `.sh-add` `.sh-fr` `.blk-rep` `.blk-go` `.ch-rep-del-btn` `.ch-rep-only-btn` `.al-fbtn` `.set-btn` | GATE-006 | หลัง parent ที่ gate — เช็กไม่มีทางหลุด (report/block internals → TRS-001/055) |
| `.ask-pill` `.chat-fab` | GATE-007 | |
| `.wl-btn` `.mf-btn` | GATE-008 | wishlist + model-follow bell |
| `.pf-foll` (incl. `pfp-follow`) `.pf-msg` `.pf-more` `.pf-avov-act` `.pf-flw` | GATE-010, 016, 017, 018 | |
| `[data-bdlike]` `[data-bdshare]` (+ dead `[data-bdsave]`/`[data-bdact]`) | GATE-013 | dead entries → §3 watch |
| `.sr-wa` | GATE-011 | |
| `[data-flow]` (feed `+` / profile `+` / CTA) | GATE-014 | own-profile entries ถึงไม่ได้เพิ่มเติมที่ GATE-023 |
| `sr-saved` saved hub (NOT gated) | GATE-015 | เช็กว่า*ไม่* gate |
| `[data-navgo="chat"/"alerts"/"profile"]` | GATE-019..021 | |
| `.pf-menu` `.pf-edit` `.pf-share` `.pf-rmf` `.pf-dots` `.pf-unblock` `.pf-sh-*` + settings/portfolio/walerts/about | GATE-022, 023 | settings ทั้งชุด + own surfaces ตัน |
| Member Sheet gate variant (`.ob` `obGate`) | GATE-024..030, 035 | canonical 00_GLOBAL §11 |
| Member Sheet first-run + `Don't show this again` (`fo_member_hide`) | GATE-025, 033, 034 | AC-AUTH-030 |
| auth routes sign up / sign in / SSO จาก sheet | GATE-031, 032, 040 | flow internals → FO-TEST-01 |
| resume contract (surface คงอยู่ ไม่มี pending-action resume) | GATE-036..041 | lock 15 §13 / 01 §8 |
| Guest Capabilities (feed tabs/search/board/viewer/detail/public profile/legal/comments-likes read) | GATE-042..048 | AC-GLOBAL-017 |
| Session model + data rules (guest persist/clear/new powers) | GATE-049..052, 039 | GUEST-001, 00_GLOBAL §7 |
| onboarding flags (onboarded/member_hide/toured/coach marks) | GATE-051..053 | 00_GLOBAL §7 |
| token expiry/revoke (contract) | GATE-054 | |
| TH/EN + light/dark | GATE-055, 056 | |

## หมายเหตุท้าย

- **ก่อนส่งงานจริง**: เขียนเสร็จ → รอ PO/หัวหน้ารีวิว → แก้ตาม feedback → ค่อยปิด task (กฎเดียวกับทุกเล่ม)
- **เคส BLOCK ล่วงหน้า**: GATE-032, 040 (ไม่มีบัญชี Apple/Google ทดสอบ) · GATE-039 (ไม่มีอีเมลรับ OTP จริง) · GATE-052 (ไม่มีเครื่องสอง) · GATE-054 (ไม่มีช่องทาง expire/revoke session จาก server)
- **ครอบโดยเล่มอื่น ไม่ทำซ้ำ**: auth internals (signup/OTP/signin/forgot/lockout/onboarding steps) → FO-TEST-01 · report/block gate internals (post ⋯ → sheet, comment popover item → sheet, entries ทุกจุด) → FO-TEST-16 TRS-001/020/055 · surface anatomy feed/search/board/profile/comments/likes → FO-TEST-03/04/09/12/07/11 · settings internals → FO-TEST-15 · guest→member E2E เต็ม → FO-TEST-18
- **จุดต่างโดยเจตนาจากเล่ม 01**: เล่ม 01 เทส mechanics ของ sheet จากฝั่ง auth flow (AUTH-061..068 — trigger/dismiss/skip/signin/bypass) — เล่มนี้เทส **เมทริกซ์ entry ทั้งแอป + persist flags + resume contract ทุก surface** — overlap ที่ sheet anatomy/choice เจตนา เพราะ gate variant เป็น canonical ของเล่มนี้
- **การเทียบ gate list**: เมทริกซ์อิง `GUEST_GATE_SEL` (prototype `index.html` ~24162) + spec §11 login-required list — บน build จริงให้เช็ก**ผล** (sheet ก่อน handler) ไม่ใช่เช็กชื่อ selector
- สถิติ: **56 TC** — High 30 / Medium 23 / Low 3 (SETUP rows 8 แถวแยกใน checklist; รวมใน csv 64 แถว)
