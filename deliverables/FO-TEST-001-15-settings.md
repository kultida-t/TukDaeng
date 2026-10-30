# FO-TEST-001-15 — Test Cases: Settings (15 หน้าย่อย) (แอปมือถือจริง)

**Task**: FO-TEST-15 ของชุด FO-TEST-001 — เขียนเป็นเวอร์ชันเทสแอปมือถือจริงตั้งแต่แรก (ไม่มีรอบ prototype แยก เพราะ spec ล็อกแล้ว)
**SoT**: แอป TukDaeng build ทดสอบบนมือถือจริง — expected ล็อกตาม `FrontOffice/13_SETTINGS_MODULE.md` (Settings Menu Rule / About your account / Language / Theme / Help & About / Legal / Privacy & Cookie / Log Out / Delete Account / Change Password / Content Preferences / What You See / Notification Settings — AC-SETTING-001..019) + `00_GLOBAL_RULES_MODULE.md` §8 (consent/legal viewer) §11 (guest gate) §12 (password policy ≥8 + ตัวเลขหรือสัญลักษณ์) + `00_NAVIGATION_AND_CROSS_MODULE_FLOW.md` §6 (sub-stack back) + `01_AUTHENTICATION_MODULE.md` §8–9 (sign out / credential persist) — `Prototypes/fo-flow` = แค่ reference ว่าหน้าตาควรเป็นแบบไหน
**Scope**: `settings` landing (6 sections + Login) + หน้าย่อย `about_account` / `change_pwd` / `del_account` / `lang` / `theme` / `notif_settings` / `favorites` / `muted` / `blocked` / `prefs` / `sensitive` / `help` / `privacy` / `terms` / `about_app` + `cookies` (Privacy & cookies — spec contract) + dialog `logout` / `reset` / `unblock` / `forgotPwd` / `delPasswordConfirm` / `delAccountSuccess` + entry points (own profile menu, ni-card "Manage content preferences") + persist ข้าม kill/sign-out/ข้ามเครื่อง + guest gate + TH/EN + dark
**ยกเว้น**: internals ของ saved/wishlist/archive/walerts — ของ FO-TEST-14/11 (เช็กเฉพาะ row+count บน settings) · `interested`/`ni` list mechanics — ของ FO-TEST-14 LIB-088..097 (เช็กเฉพาะทางเข้า/back ผ่าน prefs) · mechanics ลึกของ auth — sign in/sign up/OTP/forgot flow → FO-TEST-01 (เล่มนี้เช็ก entry+confirm UI ของ change_pwd/del_account ตาม task breakdown) · report/block/mute creation flows จาก profile/chat/feed → FO-TEST-16 (เล่มนี้เช็ก settings list + unblock/unmute + ผลกลับ feed) · Member Sheet internals → FO-TEST-17 · ni-card mechanics → FO-TEST-03
**การตัดสินล็อก 2026-10-29** (ถามผู้ใช้ก่อนเขียน): (1) **Privacy & cookies บังคับมี** — spec 13 + 00_GLOBAL §8 ต้องมี row `Privacy & cookies` + หน้า consent (Essential `Always on` ไม่มี toggle + `Analytics`/`Personalized` บันทึกลง consent record ทันที) — prototype เดิมไม่มี แก้เพิ่มแล้วรอบนี้ (row + หน้า `cookies` ผูก consent record เดียวกับ onboarding) — build ไม่มี = FAIL (2) **persist แยก scope** — lang/theme/notif toggles = **ต่อ device** (kill/sign-out บนเครื่องเดิมรอด · เครื่อง B เป็นค่าของตัวเอง ไม่ตามบัญชี) ตาม spec; ส่วน favorites/muted/blocked/snooze/sensitive = **ติดบัญชี** server persist ข้ามเครื่องตาม lock รวม (3) **restore ไม่คืน watch alerts** — sign in กู้บัญชีใน 30 วัน = ยกเลิกคำขอลบ + บัญชีใช้ได้ปกติ แต่ alerts ที่ถูกยกเลิกตอน deactivate ไม่กลับมา (spec เติมบรรทัดแล้ว) (4) **sensitive เทส apply+persist** — ไม่มี sensitive-flagged content ให้พิสูจน์ผลฟีด จึงเทสเท่าที่ยืนยันได้ + ผลฟีด = BLOCK (ต้องมี sensitive-flagged fixture)
**หมายเหตุ**: เขียนเสร็จรอรีวิว — อย่าเพิ่งปิดงาน

---

## §0 วิธีใช้ + สภาพแวดล้อม + กติกาที่ล็อก

- **ทดสอบบนเครื่องจริงเท่านั้น** — ติดตั้งแอป build ทดสอบลงมือถือจริง แตะ/ปัด/พิมพ์/เลื่อนบนหน้าจอจริง — **ไม่ใช้ browser, dev console, ปุ่ม dev/demo, localStorage, OTP จำลอง** — เตรียมสถานะด้วย action จริงในแอป + ข้อมูลจริงบน server เท่านั้น
- **Actors**: `GUEST` = ไม่ sign in · `MEMBER` = บัญชีทดสอบจริงบนเครื่องหลัก · `NEW` = สมัครใหม่ (ค่าตั้งต้นเสมอ) · `DEL-ACCT` = บัญชีทดสอบที่สร้างมาเพื่อลบเท่านั้น (เคส §2.4 destructive) · `SSO-ACCT` = บัญชี SSO-only (Apple/Google) · `ACCT-2` = **บัญชีจริงที่สอง บนเครื่องจริงอีกเครื่อง** — ใช้ trigger like/post ให้เทสผล toggle แจ้งเตือน + cross-device sync — เคสที่ต้องบัญชี/เครื่องอื่นแต่ไม่มี → mark `BLOCK` ระบุใน Note
- **ค่าตั้งค่า 2 ระดับ — ตัวแปรใหญ่ของเล่มนี้**: ของติดบัญชี (favorites/muted/blocked/snooze/sensitive/ni marks) = server persist ข้าม kill/sign-out/ข้ามเครื่อง — หลุด = FAIL contract · ของติดเครื่อง (lang/theme/notif toggles/cookie consent) = persist บนเครื่องนั้นเท่านั้น รอด kill+sign-out แต่ไม่ตามไปเครื่อง B — ถ้า build sync ข้ามเครื่อง = FAIL (spec ล็อกระดับเครื่อง)
- **Type**: `POSITIVE` · `NEGATIVE` · `EDGE` · `STATE` · `UI` · `GATE` · `GATE-inverse`
- **[GATE] ทุกเคสเทส 2 รอบ**: รอบ A `GUEST` → expect Member Sheet/ไม่มีทางถึง; รอบ B `MEMBER` → expect feature ทำงาน — settings ทั้ง module เข้าได้แค่ own profile menu ที่ gated อยู่แล้ว เลย gate เทสครั้งเดียวที่ entry
- **Device back เทียบเท่าปุ่มย้อนในแอป/ปิดทีละชั้น** — dialog/sheet/หน้าย่อยเปิดอยู่ต้องปิดชั้นบนสุดก่อน; เคส "แตะ back" ใช้ device back แทนได้ ผลต้องเทียบเท่า
- **ภาษาตามแอปทั้งหมด** (ล็อก 2026-10-28): ทุกข้อความ UI + toast + dialog + ช่องค้นหา เปลี่ยนตามภาษาที่เลือก — เจอ string ค้างอีกภาษา = **FAIL** (prototype hardcode EN หลายจุดในส่วน settings: toast `Added to favorites`/`Removed from favorites`/`Removed all favorites`/`Posts unmuted`/`Unblocked`/`Muted`/`Suggested content reset` + dialog `reset`/`mute` + restrict hint หลัง unblock — ในแอปจริงถือเป็นบั๊ก); ยกเว้นชื่อ user/แบรนด์/รุ่น
- **Dark theme**: ทุกหน้า/dialog อ่านได้ครบใน dark — contrast โอเค
- **Priority**: `HIGH` = กติกาหลัก/flow สำคัญ · `MED` = feature หลัก/edge · `LOW` = quirk; เคส BLOCK ล่วงหน้า = MED เว้นกำหนด
- **Result column**: เว้นว่าง — tester กรอก `PASS`/`FAIL`/`BLOCK` + ปัญหาใน `Note`
- **ไม่มีเคสแบบ "จดผล" ไม่มีผลลัพธ์ทางเลือก** — ทุกเคส expected ตรง spec/contract ข้อเดียวเด็ดขาด ไม่ตรง = FAIL
- **เคส destructive (§2.4 ลบบัญชี) ใช้เฉพาะ `DEL-ACCT`** ที่สร้างมาเพื่อลบ — ห้ามลบ MEMBER หลัก

## §1 Coverage map

| Route / Surface (inventory §2.11 + spec 13) | ขอบเขต | TC ที่ครอบ |
| --- | --- | --- |
| `settings` landing | entry pf-menu เท่านั้น · 6 sections+Login · rows/chevron · count badges · value pills · no-nav · back | SET-001..010 |
| `about_account` | hero · info 2 rows · Security · Account mgmt · no contact rows | SET-011..015 |
| `change_pwd` + dialog `forgotPwd` | 3 fields+eyes · validation ลำดับ · wrong current · policy canonical · success · forgot | SET-016..024 |
| `del_account` + 2 dialogs | 2-page flow · reason required · password confirm · scheduled +30d · guest out · restore · alerts ไม่คืน | SET-025..035 |
| `logout` row + dialog | danger row · confirm → guest + Member Sheet · cancel · no back | SET-036..039 |
| `lang` | 2 options+flag+check · apply ทั้งแอป · toast · pill · per-device persist · สลับค้างหน้าย่อย | SET-040..047 |
| `theme` | 2 options+check · apply ทันทีไม่มี toast · pill · per-device persist | SET-048..052 |
| `notif_settings` | 4 toggles 2 groups · default ON · auto-save · ปิด→ไม่สร้าง alert item · per-device | SET-053..058 |
| `favorites` | desc+search+sections · add/remove/remove all · toast · row→profile · feed tab · count | SET-059..066 |
| `muted` | rows+Unmute · toast · โพสต์กลับ feed · empty · row→profile | SET-067..071 |
| `blocked` | rows+Unblock · confirm dialog · ผลกลับ feed · ไม่ re-follow · empty | SET-072..077 |
| `prefs` + snooze + `reset` | 3 rows+snooze+reset · snooze→feed เหลือเฉพาะ follow · reset เคลียร์ ni+snooze | SET-078..085 |
| `sensitive` | Less/Standard+check · apply ทันที · persist | SET-086..088 |
| `interested`/`ni` nav | entry ผ่าน prefs + back (list mechanics → FO-TEST-14) | SET-089..091 |
| `help` | channels 3 rows+availability · external intents · help topics → legal | SET-092..096 |
| `privacy`/`terms` | in-app legal · sections · entries รวมหน้าเดียว · back | SET-097..100 |
| `about_app` | brand/tagline/version/corp · Legal&Support links · ไม่มีข้อมูลบัญชี | SET-101..104 |
| `cookies` (Privacy & cookies) | row ตาม spec · Essential always-on · toggles → consent record | SET-105..108 |
| nav/back/device | back ทุกหน้า → landing/parent · deep stack · device back · scroll | SET-109..112 |
| edge/persist/cross-device | kill/sign-out/เครื่อง B · toggle รัว · offline · TH/EN · dark | SET-113..120 |

## §2 Test cases

ผู้ทดสอบ: อ่าน expected ก่อนรันเสมอ — เคสที่เขียน "BLOCK ถ้า..." ให้ mark BLOCK พร้อมเหตุผลใน Note (ห้าม workaround)

### Setup

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SETUP-01 | ติดตั้งแอป | — | SETUP | เครื่องจริงเครื่องหลัก | ติดตั้ง build ทดสอบที่ทีมส่งให้ → เปิดแอป | เห็นหน้า onboarding (แอปสะอาด) | splash/หน้าแรกของแอป | — | |
| SETUP-02 | สถานะเริ่มต้น | — | SETUP | แอปติดตั้งแล้ว | ลบข้อมูลแอป/ติดตั้งใหม่ ถ้าเคยใช้เครื่องนี้มาก่อน | แอปสะอาด เหมือนผู้ใช้ใหม่ | — | — | |
| SETUP-03 | ผู้ใช้ GUEST | — | SETUP | แอปสะอาด | ไม่ sign in → เดินเข้า feed ได้เลย | guest mode | bottom nav ครบ | — | |
| SETUP-04 | ผู้ใช้ MEMBER | — | SETUP | แอปสะอาด | sign in ด้วยบัญชีทดสอบที่ทีมสร้าง (บันทึกรหัสผ่านจริงไว้ — ใช้เคส change_pwd/del) | เข้า feed เป็นสมาชิก | avatar/ชื่อตัวเองในที่ที่ต้องแสดง | — | |
| SETUP-05 | ผู้ใช้ NEW | — | SETUP | แอปสะอาด | สมัครใหม่ด้วยอีเมล/เบอร์ทดสอบจริง → ผ่าน onboarding (รวมหน้า cookie consent) จนเข้า feed | member ใหม่ — ค่าตั้งต้นทุกอย่าง (notif ON ทั้งหมด · sensitive Standard · ไม่มี fav/mute/block · ไม่มี ni) | — | — | |
| SETUP-06 | ชุดข้อมูล settings ของ MEMBER | MEMBER | SETUP | sign in แล้ว | ทำผ่านแอปจริงแล้วบันทึกชื่อลง Note: ติดตาม `A-F1`+`A-F2` (ผ่านปุ่ม Follow บนโพสต์) · เพิ่ม `A-FAV` เป็น favorite (เมนูโพสต์ → เพิ่มในรายการโปรด) · ปิดเสียง `A-MUT` (เมนูโพสต์/ni-card → Mute) · บล็อก `A-BLK` (โปรไฟล์ → เมนู → Block) · กดถูกใจ `P-L1` · mark `ไม่สนใจ` `P-NI` · สร้างโพสต์ตัวเอง `P-OWN` · ตั้ง watch alert `WA-1` · เซฟ `P-SV` 1 โพสต์ · ใส่ `P-WL` ใน wish list · archive `P-ARC` 1 โพสต์ | ข้อมูลพร้อม — สร้างสถานะไม่ได้ = เคสที่เกี่ยว `BLOCK` | — | — | |
| SETUP-07 | ทางเข้า settings | MEMBER | SETUP | SETUP-06 เสร็จ | own profile → เมนู (burger `การตั้งค่าและกิจกรรม`) → เปิด `settings` → เดินเข้าออกทุก row ทีละแถว | ทุก row เปิดหน้าถูก — เข้าไม่ได้ = เคสที่เกี่ยว BLOCK | settings home ตาม spec §9 | — | |
| SETUP-08 | เครื่องที่สอง + ACCT-2 | — | SETUP | มีเครื่องจริงอีกเครื่อง | ติดตั้ง build เดียวกันลงเครื่องสอง → sign in `ACCT-2` → เปิด notification permission ทั้งสองเครื่อง | บัญชีสองพร้อม — ถ้าไม่มี → เคส ACCT-2/cross-device เป็น BLOCK | — | — | |
| SETUP-09 | บัญชีชนิดพิเศษ | — | SETUP | แอปสะอาด | สมัคร `DEL-ACCT` (บัญชีสำหรับลบเท่านั้น — บันทึกอีเมล+รหัส) → sign in กลับ MEMBER · ถ้าทีมมีบัญชี SSO-only (Apple/Google) ให้บันทึกไว้เป็น `SSO-ACCT` — ไม่มี → เคส SET-024 เป็น BLOCK | `DEL-ACCT` sign in ได้ · `SSO-ACCT` บันทึกหรือยืนยันว่าไม่มี | — | — | |
| SETUP-10 | baseline settings | MEMBER | SETUP | SETUP-06 เสร็จ | เปิด `การตั้งค่า` บันทึก count แต่ละ row (Saved · Wish List · Archive · Watch Alerts · Favorites · Muted · Blocked) + value pill ภาษา/ธีม → เทียบกับข้อมูลที่เตรียมใน SETUP-06 | count/pill ตรงข้อมูลจริง — จุดใดไม่ตรง บันทึกลง Note เป็นบริบทก่อนรัน | — | — | |

### 2.1 Settings Home — Entry / Anatomy / Rows

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SET-001 | [GATE] เข้า settings ผ่าน own profile menu | GUEST/MEMBER | GATE | SETUP-03/04 | **รอบ A (GUEST)**: แตะแท็บ Profile → เจอ Member Sheet · ลองหาทางเข้า settings ทุกจุดที่เป็นไปได้ · **รอบ B (MEMBER)**: own profile → เมนู (burger) | A: ทุกทางตัน Member Sheet `เข้าร่วมตึกแดง`/`Join TukDaeng` — guest เข้า settings ไม่ได้เลย; B: settings home เปิดทับโปรไฟล์ | A: sheet gate; B: head `การตั้งค่าและกิจกรรม`/`Settings and activity` | HIGH | |
| SET-002 | entry อยู่ที่ own profile menu จุดเดียว | MEMBER | NEGATIVE | sign in แล้ว | หาทางเข้า settings จากจุดอื่น: feed header · burger drawer · detail · โปรไฟล์คนอื่น · bottom nav | **ไม่มี** entry อื่นนอกจาก burger `การตั้งค่าและกิจกรรม` บน own profile — (ni-card `จัดการความต้องการเนื้อหา` พาเข้า `prefs` โดยตรง ไม่ใช่ settings home — เคส SET-085) | — | MED | |
| SET-003 | settings anatomy 6 sections + Login | MEMBER | UI | `settings` เปิด | อ่านหน้าบน-ล่าง | sections เรียง: `บัญชี`/`Account` → `คลังของคุณ`/`Your library` → `สิ่งที่คุณเห็น`/`What you see` → `แอปและสื่อของคุณ`/`Your app and media` → `การแจ้งเตือน`/`Notifications` → `ข้อมูลเพิ่มเติมและการสนับสนุน`/`More info and support` → `การเข้าสู่ระบบ`/`Login` | ทุกกลุ่มมีหัวข้อ section | HIGH | |
| SET-004 | rows ครบทุก section ตาม spec | MEMBER | UI | `settings` เปิด | นับแถวทีละกลุ่ม | Account: `About your account` · Library: `Saved`/`Wish List`/`Archive`/`Watch Alerts` (count) · What you see: `Favorites`/`Muted accounts`/`Blocked` (count) + `Content preferences` · App: `Language`/`Theme mode` (value pill) · Notifications: `Notification settings` · More info: `Help`/`Privacy & cookies`/`Privacy Policy`/`Terms of Use`/`About` · Login: `Log out` (ตัวแดง ไม่มี chevron) | ไอคอน+label+chevron ครบทุกแถว | HIGH | |
| SET-005 | count badges ตรงข้อมูลจริง | MEMBER | POSITIVE | SETUP-06/10 | เทียบตัวเลขท้ายแถวกับข้อมูลจริง → เพิ่ม favorite 1 → กลับดู | ทุก count ตรง session จริง · เพิ่ม/ลบรายการแล้ว count ขยับตามทันที | — | HIGH | |
| SET-006 | value pills ภาษา/ธีม | MEMBER | UI | `settings` เปิด | อ่าน pill ท้ายแถว `ภาษา`/`Language` + `โหมดธีม`/`Theme mode` | ภาษา: `English`/`ภาษาไทย` ตามที่เลือก · ธีม: `โหมดสว่าง`/`Light` หรือ `โหมดมืด`/`Dark` ตามที่เลือก — เปลี่ยนค่าแล้ว pill เปลี่ยนตาม | — | MED | |
| SET-007 | ไม่มี Edit profile / Change pwd / Delete บน home | MEMBER | NEGATIVE | `settings` เปิด | อ่านทุกแถวหา `แก้โปรไฟล์`/`Edit profile` · `เปลี่ยนรหัสผ่าน` · `ลบบัญชี` | ไม่มีทั้ง 3 แถว — edit profile อยู่ที่ own profile; change pwd/delete อยู่ใน About your account เท่านั้น | — | HIGH | |
| SET-008 | ทุก row นำทางถูกหน้า | MEMBER | POSITIVE | `settings` เปิด | แตะทีละแถว → เช็ก head หน้าปลายทาง → back | ทุกแถวเปิดหน้าตรง (Saved→`บันทึกแล้ว` · Wish List→`สิ่งที่อยากได้` · Archive→`คลังเก็บ` · Watch Alerts→`การแจ้งเตือนนาฬิกา` · Favorites→`รายการโปรด` · Muted→`บัญชีที่ปิดเสียง` · Blocked→`บัญชีที่บล็อก` · Content preferences→`การตั้งค่าเนื้อหา` · Language→`ภาษา` · Theme→`โหมดธีม` · Notif→`การตั้งค่าการแจ้งเตือน` · Help→`ศูนย์ช่วยเหลือ` · Cookies→`ความเป็นส่วนตัวและคุกกี้` · Privacy→`นโยบายความเป็นส่วนตัว` · Terms→`ข้อกำหนดการใช้งาน` · About→`เกี่ยวกับตึกแดง`) | — | HIGH | |
| SET-009 | ไม่มี bottom nav + back กลับโปรไฟล์ | MEMBER | STATE | `settings` เปิดจาก own profile | เช็กขอบล่าง → แตะ back | หน้าลึกเต็มจอ ไม่มี bottom nav · back กลับ own profile ตำแหน่งเดิม (ไม่เด้ง feed) | — | HIGH | |
| SET-010 | settings scroll + กลับตำแหน่งเดิม | MEMBER | STATE | `settings` เปิด | scroll ลงสุด → เปิด `About` → back | กลับ settings ที่ตำแหน่ง scroll เดิม ไม่เด้งบนสุด | — | LOW | |

### 2.2 About Your Account — `about_account`

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SET-011 | anatomy | MEMBER | UI | settings → `เกี่ยวกับบัญชีของคุณ` | อ่านหน้า | head back + `เกี่ยวกับบัญชีของคุณ`/`About your account` · hero = avatar + ชื่อแสดง + `@{username}` ของบัญชีจริง · `ข้อมูลบัญชี`/`Account information` · `ความปลอดภัย`/`Security` · `การจัดการบัญชี`/`Account management` — ไม่มี nav | — | HIGH | |
| SET-012 | Account information ตรงบัญชี | MEMBER/NEW | POSITIVE | SETUP-04/05 | อ่าน `วันที่เข้าร่วม`/`Date joined` + `ตำแหน่งบัญชี`/`Account based in` บน MEMBER → sign in NEW ดูอีกครั้ง | Date joined = เดือน/ปีที่สมัครจริงของแต่ละบัญชี (ต่างกันถูก) · based in = `ประเทศไทย`/`Thailand` | — | MED | |
| SET-013 | Security → `change_pwd` | MEMBER | POSITIVE | `about_account` เปิด | แตะ `เปลี่ยนรหัสผ่าน`/`Change password` → back | เปิดหน้าเปลี่ยนรหัสผ่าน · back กลับ about เดิม | — | HIGH | |
| SET-014 | Account management → `del_account` | MEMBER | POSITIVE | `about_account` เปิด | แตะ `ลบบัญชีผู้ใช้`/`Delete account` (ตัวแดง) → back | เปิด delete flow step 1 · back กลับ about เดิม | row ตัวแดง danger | HIGH | |
| SET-015 | ไม่มี contact rows | MEMBER | NEGATIVE | `about_account` เปิด | อ่านทุกแถวหา Username/Phone/Line/Email | ไม่มี contact rows — fields เหล่านั้น contract-only ไม่มี UI ใน Settings | — | MED | |

### 2.3 Change Password — `change_pwd` + dialog `forgotPwd`

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SET-016 | anatomy | MEMBER | UI | about → `เปลี่ยนรหัสผ่าน` | อ่านหน้า | head `เปลี่ยนรหัสผ่าน`/`Change password` + desc กติการหัสผ่าน (≥8 ตัวอักษร + ตัวเลข/สัญลักษณ์) · 3 fields `รหัสผ่านปัจจุบัน`/`Current password` · `รหัสผ่านใหม่`/`New password` · `ยืนยันรหัสผ่านใหม่`/`Re-type new password` พร้อม eye ทุก field · link `ลืมรหัสผ่านใช่ไหม?`/`Forgot your password?` ใต้ Current · submit `เปลี่ยนรหัสผ่าน` | — | HIGH | |
| SET-017 | validation ไล่ลำดับ | MEMBER | NEGATIVE | `change_pwd` เปิด | กด submit ทีละเคส: 1. เว้นหมด 2. current ผิด (กรอกผิดจงใจ) 3. current ถูก+new ว่าง 4. new <8 ตัว 5. new = current 6. new ถูก+re-type ไม่ตรง | error ตามลำดับ: `กรุณากรอกรหัสผ่านปัจจุบัน` → `รหัสผ่านปัจจุบันไม่ถูกต้อง` → `กรุณากรอกรหัสผ่านใหม่` → policy error → `รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านปัจจุบัน` → `รหัสผ่านใหม่ไม่ตรงกัน` — ข้อก่อนผ่านก่อนถึงข้อถัดไป (ตามภาษาแอป) | inline error กล่องเดียว + field สถานะผิด + focus ช่องนั้น | HIGH | |
| SET-018 | wrong current ถูกปฏิเสธ | MEMBER | NEGATIVE | `change_pwd` เปิด | current = รหัสที่ไม่ใช่ของจริง + new/confirm ถูก → submit | ปฏิเสธที่ current — `รหัสผ่านปัจจุบันไม่ถูกต้อง` ไม่มีการเปลี่ยนรหัส | — | HIGH | |
| SET-019 | policy canonical: ต้องมีตัวเลขหรือสัญลักษณ์ | MEMBER | NEGATIVE | `change_pwd` เปิด | current ถูก + new `abcdefgh` (8 ตัว ตัวอักษรล้วน ไม่มีตัวเลข/สัญลักษณ์) + confirm ตรง → submit | **ถูกปฏิเสธ** ด้วย policy error (canonical ≥8 + ตัวเลขหรือสัญลักษณ์อย่างน้อย 1 ตัว — 00_GLOBAL §12) — build ที่ยอมรับ = FAIL | field new สถานะผิด + focus | HIGH | |
| SET-020 | eye toggle อิสระทีละช่อง | MEMBER | EDGE | `change_pwd` เปิด | พิมพ์ทั้ง 3 ช่อง → แตะ eye ทีละอัน | แต่ละช่องสลับ show/hide อิสระกัน | icon เปลี่ยนเฉพาะช่องนั้น | LOW | |
| SET-021 | เปลี่ยนสำเร็จ | MEMBER | POSITIVE | `change_pwd` เปิด + รู้ current จริง | current ถูก + new ผ่าน policy + confirm ตรง → submit → สังเกต session | กลับ `about_account` + toast `เปลี่ยนรหัสผ่านเรียบร้อยแล้ว`/`Password changed successfully` — ยังเป็น member ไม่ถูก sign out (บันทึกรหัสใหม่ไว้ใช้ SET-022/035) | — | HIGH | |
| SET-022 | รหัสใหม่มีผลจริง (sign in) | MEMBER | POSITIVE | SET-021 ผ่าน | sign out → sign in ด้วยรหัส**เก่า** → sign in ด้วยรหัส**ใหม่** | รหัสเก่าเข้าไม่ได้ · รหัสใหม่เข้าได้ — credential อัปเดตจริงฝั่ง server | — | HIGH | |
| SET-023 | forgot → reset dialog | MEMBER | POSITIVE | `change_pwd` เปิด | แตะ `ลืมรหัสผ่านใช่ไหม?` → อ่าน dialog → `ส่งลิงก์รีเซ็ต` → ทำซ้ำแตะ `ยกเลิก` | dialog `รีเซ็ตรหัสผ่าน?`/`Reset password?` + desc แสดงอีเมล mask ของบัญชีปัจจุบัน · Send → toast `ส่งลิงก์รีเซ็ตรหัสผ่านไปยัง {masked email} แล้ว`/`Password reset link sent to {masked email}` · Cancel → ปิดเฉย ๆ อยู่หน้าเดิม | mask = ตัวแรก+***+@domain | MED | |
| SET-024 | SSO-only ไม่เห็น change pwd active | SSO-ACCT | NEGATIVE | SETUP-09 มี `SSO-ACCT` — ไม่มี → `BLOCK` | sign in `SSO-ACCT` → about → อ่าน Security | `เปลี่ยนรหัสผ่าน` ไม่แสดงเป็น active action (ซ่อน/disabled + อธิบายว่าใช้บัญชีจาก provider) — contract ตาม spec | — | MED | |

### 2.4 Delete Account — `del_account` + dialogs (destructive — ใช้ `DEL-ACCT` เท่านั้น)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SET-025 | step 1 anatomy | DEL-ACCT | UI | sign in `DEL-ACCT` → about → `ลบบัญชีผู้ใช้` | อ่านหน้า step 1 | head `ลบบัญชีผู้ใช้`/`Delete account` · hero = trash icon + `เสียดายที่เราต้องบอกลากัน`/`We're sorry to see you go` + desc · การ์ดเงื่อนไข 3 ใบ: `ระยะเวลาผ่อนผัน 30 วัน` · `ลบข้อมูลถาวรหลังจาก 30 วัน` · `การแจ้งเตือนนาฬิกาจะถูกยกเลิก` · ปุ่ม `ดำเนินการต่อ`/`Continue to delete` + `เก็บบัญชีของฉันไว้`/`Keep my account` | — | HIGH | |
| SET-026 | Keep my account → กลับ about | DEL-ACCT | POSITIVE | step 1 เปิด | แตะ `เก็บบัญชีของฉันไว้` | กลับ `about_account` — ไม่มี dialog ไม่ลบอะไร บัญชียังใช้ได้ | — | MED | |
| SET-027 | step 2 anatomy | DEL-ACCT | UI | step 1 → `ดำเนินการต่อ` | อ่านหน้า step 2 | head `เหตุผลในการลบบัญชี`/`Why are you leaving?` + title `ทำไมคุณถึงต้องการลบบัญชี?` + sub · radio เหตุผล 6 ข้อ (`ฉันไม่ได้ใช้งานตึกแดงแล้ว` · `มีความกังวลเรื่องความเป็นส่วนตัวและความปลอดภัย` · `ได้รับการแจ้งเตือนบ่อยเกินไป` · `สร้างหรือมีบัญชีอื่นใช้งานแล้ว` · `พบปัญหาการเริ่มต้นใช้งานหรือปัญหาเทคนิค` · `เหตุผลอื่น ๆ`) · textarea `ความคิดเห็นเพิ่มเติม (ไม่บังคับ)` · ปุ่ม `ดำเนินการขอลบบัญชี`/`Continue` + `ย้อนกลับ`/`Back` | — | HIGH | |
| SET-028 | ไม่เลือกเหตุผล → error | DEL-ACCT | NEGATIVE | step 2 เปิด | กด `ดำเนินการขอลบบัญชี` โดยไม่เลือก → เลือกเหตุผล 1 ข้อ | ไม่เลือก → inline err `กรุณาเลือกเหตุผลในการขอลบบัญชี`/`Please select a reason to continue.` (scroll ไปหา error) ไม่เปิด dialog · เลือกแล้ว error หายทันที | radio เลือกได้ทีละตัวเดียว | HIGH | |
| SET-029 | back จาก step 2 → step 1 + state ค้าง | DEL-ACCT | STATE | เลือกเหตุผล+พิมพ์ feedback แล้ว | แตะ `ย้อนกลับ` → `ดำเนินการต่อ` อีกครั้ง → ทำซ้ำด้วย back ลูกศรบน head | back (ทั้งปุ่มในหน้าและลูกศรบน head) กลับ step 1 · กลับเข้า step 2 เหตุผล+feedback ที่เลือกไว้ค้างอยู่ | — | MED | |
| SET-030 | เลือกเหตุผล → password dialog anatomy | DEL-ACCT | UI | เลือกเหตุผลแล้ว | กด `ดำเนินการขอลบบัญชี` | dialog `ยืนยันการขอลบบัญชี`/`Confirm account deletion` + desc กรอกรหัสเพื่อเริ่ม 30-Day Grace Period · field `รหัสผ่านปัจจุบัน`+eye (autofocus) · ปุ่ม `ยืนยันลบบัญชี`/`Delete account` (danger) + `ยกเลิก` | — | HIGH | |
| SET-031 | dialog: ว่าง/ผิด → inline err | DEL-ACCT | NEGATIVE | dialog เปิด | กด `ยืนยันลบบัญชี` โดยว่าง → กรอกรหัสผิด → submit | ว่าง → `กรุณากรอกรหัสผ่านของคุณ`/`Please enter your password.` · ผิด → `รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบแล้วลองใหม่อีกครั้ง`/`Incorrect password. Please try again.` | field สถานะผิด + focus กลับช่อง | HIGH | |
| SET-032 | รหัสถูก → scheduled dialog +30 วัน | DEL-ACCT | POSITIVE | dialog เปิด | กรอกรหัสจริงของ `DEL-ACCT` → `ยืนยันลบบัญชี` → อ่าน dialog | dialog `ตั้งเวลากำหนดลบบัญชีแล้ว`/`Account deletion scheduled` + trash icon + `บัญชี @DEL-ACCT ถูกปิดการใช้งาน...กำหนดลบถาวรวันที่ {date} (30 วัน)` — `{date}` = วันนี้+30 วัน (format ตามภาษาเครื่อง TH=พ.ศ.) + ข้อความ login ก่อนกำหนดเพื่อกู้คืน · ปุ่มเดียว `ออกจากระบบ`/`Log out` | — | HIGH | |
| SET-033 | Log out → guest + กลับไม่ได้ | DEL-ACCT→GUEST | POSITIVE | scheduled dialog เปิด | กด `ออกจากระบบ` → ลองกด back | ปิด settings stack ทั้งกอง → feed guest (scroll บนสุด) + toast `บัญชีถูกระงับการใช้งานและเริ่มนับถอยหลัง 30 วัน`/`Account deactivated. 30-day grace period started.` + Member Sheet `Join TukDaeng` · back ไม่มีทางกลับ about/settings | — | HIGH | |
| SET-034 | sign in ใน 30 วัน = restore | DEL-ACCT | POSITIVE | SET-033 เสร็จ | sign in `DEL-ACCT` เดิม → เปิดหน้าต่าง ๆ ดูข้อมูล | sign in สำเร็จ = ยกเลิกคำขอลบ + บัญชีใช้งานปกติ — ไม่มี blocked state `scheduled for deletion` ตอน sign in · ข้อมูลบัญชีกลับครบ | — | HIGH | |
| SET-035 | restore ไม่คืน watch alerts + del เช็ก credential เดียวกับ change_pwd | DEL-ACCT/MEMBER | POSITIVE | `DEL-ACCT` มี `WA-1` ก่อนลบ (ไม่ได้ตั้ง → BLOCK ข้อแรก พร้อมเหตุผล) · MEMBER เพิ่งเปลี่ยนรหัส SET-021 | หลัง restore เปิด `walerts` ดู → MEMBER: เปิด del dialog กรอกรหัส**เก่า** → ยกเลิก → เปิดใหม่กรอกรหัส**ใหม่** → `ยกเลิก` ก่อนยืนยันสุดท้าย | alerts ที่ถูกยกเลิกตอน deactivate **ไม่กลับมา** (ล็อก 2026-10-29) · del dialog ปฏิเสธรหัสเก่าและรับรหัสที่เพิ่งเปลี่ยน (credential ชุดเดียวกับ change_pwd) | — | HIGH | |

### 2.5 Log Out — row + dialog `logout`

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SET-036 | row + dialog anatomy | MEMBER | UI | `settings` เปิด | แตะ `ออกจากระบบ`/`Log out` ท้ายสุด (กลุ่ม Login) | row ตัวแดง ไม่มี chevron → dialog `ออกจากระบบ @{user} หรือไม่?`/`Log out of @{user}?` + `คุณจะต้องเข้าสู่ระบบอีกครั้งเพื่อเข้าถึงบัญชีของคุณ` + `ออกจากระบบ` (danger) + `ยกเลิก` | — | HIGH | |
| SET-037 | cancel → อยู่เดิม | MEMBER | NEGATIVE | dialog เปิด | แตะ `ยกเลิก` | ปิด dialog เฉย ๆ — ยัง member อยู่ `settings` เดิม ไม่มี toast | — | MED | |
| SET-038 | confirm → guest + Member Sheet | MEMBER→GUEST | POSITIVE | dialog เปิด | กด `ออกจากระบบ` → ลอง back | ปิด settings stack ทั้งกอง → feed guest + toast `ออกจากระบบแล้ว`/`Logged out successfully` + Member Sheet `Join TukDaeng` (scrim/`ข้ามไปก่อน` = browse guest) · ไม่มี path กลับ sign in/settings ด้วย back | — | HIGH | |
| SET-039 | credential รอด logout | MEMBER | STATE | SET-038 เสร็จ | sign in กลับด้วยบัญชีเดิม | เข้าได้ตามปกติ — logout ธรรมดาไม่ลบ credential (เฉพาะ delete account ที่ล้าง) | — | MED | |

### 2.6 Language — `lang`

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SET-040 | anatomy | MEMBER | UI | settings → `ภาษา`/`Language` | อ่านหน้า | head `ภาษา`/`Language` + desc `Choose your preferred language for the TukDaeng app.` · options `English` (`App interface in English`) + `ภาษาไทย` (`หน้าจอแอปเป็นภาษาไทย`) พร้อม flag + check บนตัวเลือกปัจจุบัน | — | HIGH | |
| SET-041 | สลับ TH↔EN ทั้งแอปเปลี่ยน | MEMBER | POSITIVE | `lang` เปิด | แตะตัวเลือกอีกภาษา → ออกไปเดินหลายหน้า (settings/feed/profile/หน้าย่อย) | apply ทันทีทั้ง UI — labels/toast/dialog/ช่องค้นหา/ตัวนับ เปลี่ยนตามภาษา · check ย้ายตัวเลือก · toast `เปลี่ยนภาษาเรียบร้อย`/`Language updated` · ข้อความที่ user สร้าง (แคปชัน/ชื่อบัญชี) ไม่ถูกแปล | — | HIGH | |
| SET-042 | value pill บน home อัปเดต | MEMBER | STATE | เพิ่งสลับภาษา | back กลับ settings ดูแถว `ภาษา` | pill แสดงภาษาใหม่ทันที | — | MED | |
| SET-043 | persist ข้าม kill | MEMBER | STATE | เลือกภาษาไทยไว้ | kill app (swipe ทิ้ง) → เปิดใหม่ | ยังเป็นภาษาที่เลือก — persist บนเครื่อง | — | HIGH | |
| SET-044 | รอด sign-out บนเครื่องเดิม | MEMBER | STATE | เลือกภาษาไทยไว้ | sign out → guest → sign in กลับบนเครื่องเดิม | ตลอดทางยังเป็นภาษาไทย (ค่าติดเครื่อง ไม่ผูก session) | — | MED | |
| SET-045 | ไม่ตามไปเครื่อง B | MEMBER | STATE | เครื่องหลัก=ไทย · เครื่องสอง sign in MEMBER เดิม | เปิดแอปเครื่องสองดูภาษา | เครื่องสองใช้ภาษาของตัวเอง (default/ที่ตั้งไว้) ไม่ตามเครื่องหลัก — per-device ตาม spec | — | MED | |
| SET-046 | สลับภาษาค้างอยู่หน้าย่อย | MEMBER | EDGE | เปิด `favorites` | back → `lang` → สลับภาษา → back เข้า `favorites` อีกครั้ง | หน้าย่อยทุกหน้า render ภาษาใหม่ทันทีเมื่อเข้าใหม่ — ไม่ค้างภาษาเก่า · หน้า `lang` เอง re-render เป็นภาษาใหม่ | — | MED | |
| SET-047 | กดตัวเลือกเดิมซ้ำ | MEMBER | EDGE | `lang` เปิด อยู่ภาษาไทย | แตะ `ภาษาไทย` ซ้ำ | ไม่เกิดอะไรแปลก — check อยู่ที่เดิม ไม่มี toast ซ้ำผิด (toast ซ้ำ = FAIL) | — | LOW | |

### 2.7 Theme — `theme`

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SET-048 | anatomy | MEMBER | UI | settings → `โหมดธีม`/`Theme mode` | อ่านหน้า | head `โหมดธีม`/`Theme mode` + desc `Choose how TukDaeng looks on this device.` · `โหมดสว่าง`/`Light mode` (`Bright background for daytime browsing.`) · `โหมดมืด`/`Dark mode` (`Dimmed background that's easier on the eyes at night.`) + check บนตัวเลือกปัจจุบัน | — | HIGH | |
| SET-049 | สลับ Light↔Dark ทันที | MEMBER | POSITIVE | `theme` เปิด | แตะอีกโหมด → เดินหลายหน้า | apply ทันทีทั้งแอป ไม่ re-render หน้าที่เปิดอยู่ · check ย้าย · **ไม่มี toast** · stack settings ค้างอยู่ไม่ปิด | ทุกหน้าอ่านได้ทั้ง 2 ธีม | HIGH | |
| SET-050 | value pill + persist kill/sign-out | MEMBER | STATE | สลับเป็นโหมดเดียว | back ดู pill → kill app → เปิดใหม่ → sign out/in | pill ตรงโหมดปัจจุบัน · โหมดค้างข้าม kill และ sign-out บนเครื่องเดิม | — | HIGH | |
| SET-051 | ไม่ตามไปเครื่อง B | MEMBER | STATE | เครื่องหลัก=dark · เครื่องสอง sign in MEMBER เดิม | เปิดแอปเครื่องสอง | เครื่องสองใช้ธีมของตัวเอง ไม่ตามเครื่องหลัก — per-device | — | MED | |
| SET-052 | สลับธีมค้างหน้าย่อย | MEMBER | EDGE | เปิด `terms`/`privacy` หน้าข้อความยาว | back → `theme` → สลับ → back เข้าหน้าเดิม | หน้าย่อย render ธีมใหม่ถูก อ่านครบไม่มีตัวอักษรจมพื้น | — | LOW | |

### 2.8 Notification Settings — `notif_settings`

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SET-053 | anatomy 2 groups | MEMBER | UI | settings → `การตั้งค่าการแจ้งเตือน` | อ่านหน้า | head `การตั้งค่าการแจ้งเตือน`/`Notification settings` + desc `Choose what notifications you receive on this device.` · `กิจกรรม`/`Activity`: `Likes`+`Comments`+`New followers` · `การซื้อขายและการแจ้งเตือน`/`Trading & Alerts`: `Watch Alerts` — desc ต่อ toggle ครบ · ไม่มี Chat/Market/Price/Moderation toggle | — | HIGH | |
| SET-054 | NEW default ON ทุกตัว | NEW | POSITIVE | account ใหม่ | เปิดหน้า | toggle 4 ตัว ON ทั้งหมด | — | MED | |
| SET-055 | auto-save ไม่มี save button | MEMBER | POSITIVE | `notif_settings` เปิด | ปิด `Likes` → back เข้าใหม่ → เปิดกลับ | toggle ค้างค่าที่ตั้งทันที ไม่ต้องกดบันทึก · เปิด/ปิดกลับได้ | switch สะท้อนค่าจริง | HIGH | |
| SET-056 | ปิด type → ไม่สร้าง alert item ของ type นั้น | MEMBER+ACCT-2 | POSITIVE | MEMBER มี `P-OWN` · `ACCT-2` พร้อม | MEMBER ปิด `Likes` → เครื่องสอง: ACCT-2 กดถูกใจ `P-OWN` → เครื่องหลัก: เปิด `alerts` → MEMBER เปิด `Likes` กลับ → ACCT-2 unlike+like ใหม่ → ดู alerts | ตอน toggle ปิด: ไม่มี alert row ถูกใจใหม่ในลิสต์ · ตอนเปิดกลับ: alert เข้าปกติ — spec §9 ปิดแล้วไม่สร้าง FO Alerts item (เทสบนเครื่องเดียวกับที่ตั้งค่า) | — | HIGH | |
| SET-057 | persist kill บนเครื่องเดิม | MEMBER | STATE | ปิด `Comments` ไว้ | kill app → เปิดใหม่ → เปิด `notif_settings` | toggle ยัง OFF — persist บนเครื่อง | — | MED | |
| SET-058 | per-device เครื่อง B อิสระ | MEMBER | STATE | เครื่องหลัก `Comments`=OFF · เครื่องสอง sign in MEMBER เดิม | เครื่องสอง: เปิด `notif_settings` | เครื่องสองแสดงค่าของตัวเอง (default ON) ไม่ตามเครื่องหลัก — ถ้า build sync ข้ามเครื่อง = FAIL (spec ล็อกระดับเครื่อง) | — | MED | |

### 2.9 Favorites — `favorites`

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SET-059 | anatomy | MEMBER | UI | settings → `รายการโปรด`/`Favorites` มี `A-FAV` | อ่านหน้า | head `รายการโปรด`/`Favorites` · desc `โพสต์ใหม่จากรายการโปรดของคุณจะแสดงสูงขึ้นในฟีด มีเพียงคุณเท่านั้นที่เห็นว่าคุณเพิ่มหรือลบใคร`/`New posts from your favorites will appear higher in feed. Only you can see who you add or remove.` · ช่อง `ค้นหา`/`Search` · section `รายการโปรด` + `ลบทั้งหมด`/`Remove all` · section `แนะนำ`/`Suggested` = `A-F1`/`A-F2` (follow แต่ยังไม่ favorite) + `เพิ่มบัญชี`/`Add account` | — | HIGH | |
| SET-060 | empty → `No favorites yet` | NEW | POSITIVE | account ใหม่ | เปิด `favorites` | `ยังไม่มีรายการโปรด`/`No favorites yet` + ไม่มีปุ่ม `ลบทั้งหมด` | — | MED | |
| SET-061 | Suggested → Add เข้า favorites | MEMBER | POSITIVE | `A-F1` อยู่ Suggested | แตะ `เพิ่มบัญชี` บน `A-F1` → ดูหน้า → กลับ settings ดู count | `A-F1` ย้ายเข้า section รายการโปรด + toast `Added to favorites` (ตามภาษา) · count บน settings row +1 | — | HIGH | |
| SET-062 | Remove → กลับ Suggested | MEMBER | POSITIVE | `A-FAV` อยู่รายการโปรด | แตะ `ลบออก`/`Remove` บน `A-FAV` | `A-FAV` หลุด favorites (กลับเข้า Suggested เพราะยัง follow) + toast `Removed from favorites` · count -1 | — | HIGH | |
| SET-063 | Remove all | MEMBER | POSITIVE | มี favorite ≥2 | แตะ `ลบทั้งหมด`/`Remove all` | favorites ว่างทั้งหมด + toast `Removed all favorites` · Suggested เต็มบัญชีที่ follow · ปุ่ม Remove all หายเมื่อว่าง | — | MED | |
| SET-064 | search live filter | MEMBER | POSITIVE | มี fav+suggested | พิมพ์ชื่อบัญชีบางส่วน/คำที่ไม่มี | rows กรองตามชื่อทันที · ไม่เจอ = ไม่มีแถวโชว์ | — | MED | |
| SET-065 | แตะ row → public profile | MEMBER | POSITIVE | `favorites` มีแถว | แตะแถวบัญชี (ไม่ใช่ปุ่ม Remove/Add) → back | เปิด public profile ของบัญชีนั้น · back กลับ `favorites` เดิม | — | MED | |
| SET-066 | ผลกลับ feed: Favorites tab | MEMBER | POSITIVE | `A-FAV` เป็น favorite + มีโพสต์ | เพิ่ม `A-F1` เป็น favorite → กลับ feed แท็บ `รายการโปรด`/`Favorites` → ลบ `A-FAV` ออก → ดูแท็บอีกครั้ง | โพสต์ของ `A-F1`+`A-FAV` อยู่ในแท็บ Favorites · หลังลบ `A-FAV` โพสต์ของ `A-FAV` หลุดแท็บ (ยังอยู่ feed All) | — | HIGH | |

### 2.10 Muted Accounts — `muted`

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SET-067 | anatomy | MEMBER | UI | settings → `บัญชีที่ปิดเสียง`/`Muted accounts` มี `A-MUT` | อ่านหน้า | head `บัญชีที่ปิดเสียง`/`Muted accounts` · row = avatar + ชื่อ + `ปิดเสียงโพสต์แล้ว`/`Posts muted` + ปุ่ม `เปิดเสียง`/`Unmute` — ไม่มี nav | — | HIGH | |
| SET-068 | Unmute → โพสต์กลับ feed | MEMBER | POSITIVE | `A-MUT` โพสต์เคยอยู่ feed (SETUP-06 บันทึกไว้) | `เปิดเสียง` บน `A-MUT` → ดู list → กลับ feed เลื่อนหา | row หาย + toast `Posts unmuted` (ตามภาษา) · โพสต์ของ `A-MUT` กลับมาใน feed · count settings row -1 | — | HIGH | |
| SET-069 | empty | NEW | POSITIVE | account ใหม่ | เปิด `muted` | `ไม่มีบัญชีที่ปิดเสียง`/`No muted accounts` | — | MED | |
| SET-070 | แตะ row → public profile | MEMBER | POSITIVE | `muted` มีแถว | แตะแถว → back | เปิด public profile · back กลับ `muted` เดิม | — | MED | |
| SET-071 | persist ข้ามเครื่อง | MEMBER | STATE | `A-MUT` muted · เครื่องสอง sign in MEMBER เดิม | เครื่องสอง: เปิด `muted` ดูแถว → เครื่องหลัก: `เปิดเสียง` → เครื่องสอง: เปิดหน้าใหม่ | ทั้งสองเครื่องเห็น list เดียวกัน · unmute บนเครื่องหลักสะท้อนบนเครื่องสอง — server persist | — | HIGH | |

### 2.11 Blocked — `blocked`

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SET-072 | anatomy | MEMBER | UI | settings → `บัญชีที่บล็อก`/`Blocked` มี `A-BLK` | อ่านหน้า | head `บัญชีที่บล็อก`/`Blocked profiles` · row = avatar + ชื่อ + `รวมถึงโปรไฟล์อื่นที่พวกเขาอาจมีหรือสร้างขึ้น`/`Includes other profiles they may have or create` + `ปลดบล็อก`/`Unblock` | — | HIGH | |
| SET-073 | Unblock → confirm dialog anatomy | MEMBER | UI | `blocked` มี `A-BLK` | แตะ `ปลดบล็อก` | dialog `เลิกบล็อก {user} หรือไม่?`/`Unblock {user}?` + desc `{user} and other profiles they may have or create will now be able to request to follow and message you on TukDaeng. They won't be notified that you unblocked them.` (ตามภาษา) + `เลิกบล็อก`/`Unblock` (danger) + `ยกเลิก`/`Cancel` | — | HIGH | |
| SET-074 | cancel → ยัง blocked | MEMBER | NEGATIVE | dialog เปิด | แตะ `ยกเลิก` | ปิด dialog — `A-BLK` ยังอยู่ list ยัง blocked | — | MED | |
| SET-075 | confirm → unblock + ผลกลับ feed + ไม่ re-follow | MEMBER | POSITIVE | `A-BLK` โพสต์เคยอยู่ feed · เคย follow `A-BLK` ก่อน block | ยืนยัน `เลิกบล็อก` → ดู list → feed เลื่อนหา → เปิดโปรไฟล์ `A-BLK` | ปลดบล็อก + toast `Unblocked` (ตามภาษา) + row หาย · โพสต์ของ `A-BLK` กลับ feed · โปรไฟล์เข้าได้ปกติแต่ปุ่มเป็น `ติดตาม`/`Follow` — **ไม่ re-follow** อัตโนมัติ · count settings row -1 | — | HIGH | |
| SET-076 | empty | NEW | POSITIVE | account ใหม่ | เปิด `blocked` | `ไม่มีบัญชีที่ถูกบล็อก`/`No blocked accounts` | — | MED | |
| SET-077 | persist ข้ามเครื่อง | MEMBER | STATE | `A-BLK` blocked · เครื่องสอง sign in MEMBER เดิม | เครื่องสอง: เปิด `blocked` → เครื่องหลัก: unblock → เครื่องสอง: เปิดหน้าใหม่ | ทั้งสองเครื่องเห็น list เดียวกัน · unblock บนเครื่องหลักสะท้อนบนเครื่องสอง | — | HIGH | |

### 2.12 Content Preferences — `prefs` + snooze + dialog `reset`

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SET-078 | anatomy | MEMBER | UI | settings → `การตั้งค่าเนื้อหา`/`Content preferences` | อ่านหน้า | head `การตั้งค่าเนื้อหา`/`Content preferences` · rows `เนื้อหาที่ละเอียดอ่อน`/`Sensitive content` · `สนใจ`/`Interested` · `ไม่สนใจ`/`Not interested` · toggle `หยุดพักโพสต์แนะนำในฟีดชั่วคราว`/`Snooze suggested posts in feed` (desc `ซ่อนโพสต์จากบัญชีที่คุณไม่ได้ติดตามเป็นเวลา 30 วัน`/`Hide posts from accounts you don't follow for 30 days.`) · row `รีเซ็ตเนื้อหาที่แนะนำ`/`Reset suggested content` | — | HIGH | |
| SET-079 | snooze ON → feed เหลือเฉพาะ follow | MEMBER | POSITIVE | feed มีโพสต์บัญชีที่ไม่ได้ follow | เปิด toggle → กลับ feed แท็บ `ทั้งหมด`/`All` เลื่อนดู | toggle ON ทันทีไม่มี confirm · feed All เหลือเฉพาะโพสต์จากบัญชีที่ follow — โพสต์บัญชีที่ไม่ได้ follow หาย · แท็บอื่นไม่กระทบ | switch on | HIGH | |
| SET-080 | snooze OFF → แนะนำกลับ | MEMBER | POSITIVE | snooze ON | ปิด toggle → กลับ feed | โพสต์บัญชีที่ไม่ได้ follow กลับมาแสดงปกติ | — | MED | |
| SET-081 | snooze persist ข้ามเครื่อง | MEMBER | STATE | snooze ON · เครื่องสอง sign in MEMBER เดิม | เครื่องสอง: เปิด `prefs` ดู toggle → เครื่องหลัก: ปิด → เครื่องสอง: เปิดหน้าใหม่ | toggle ตรงกันทั้งสองเครื่อง — snooze ติดบัญชี server persist · หมดอายุ 30 วัน = contract ทดสอบไม่ได้ใน session บันทึก Note ไว้ | — | MED | |
| SET-082 | reset dialog anatomy | MEMBER | UI | `prefs` เปิด | แตะ `รีเซ็ตเนื้อหาที่แนะนำ`/`Reset suggested content` | dialog `Reset suggested content?` + `Posts you marked as not interested will be shown again.` (ตามภาษาแอป — prototype hardcode EN = deviation) + `Reset` (danger) + `Cancel` | — | HIGH | |
| SET-083 | confirm → เคลียร์ ni + ปิด snooze + กลับ feed | MEMBER | POSITIVE | `P-NI` อยู่ ni list + snooze ON | เตรียมเพิ่ม ni อีก 1 โพสต์ → เปิด `ไม่สนใจ` บันทึกแถว → กลับ prefs → Reset → `Reset` → ดู `ni` + toggle + feed | ni marks เคลียร์หมด (list ว่าง) · snooze กลับ OFF เอง · โพสต์ที่เคย ni กลับเข้า feed · toast `Suggested content reset` (ตามภาษา) | — | HIGH | |
| SET-084 | cancel → ไม่เปลี่ยน | MEMBER | NEGATIVE | dialog เปิด + มี `P-NI` | แตะ `Cancel` → ดู `ni` | ปิด dialog — ni marks+snooze อยู่เหมือนเดิม | — | MED | |
| SET-085 | entry จาก ni-card `จัดการความต้องการเนื้อหา` | MEMBER | POSITIVE | feed มีการ์ด thanks (`P-NI` เพิ่ง mark + seller ไม่ได้ follow) | บน ni-card แตะ `จัดการความต้องการเนื้อหา`/`Manage content preferences` → back | เปิด `prefs` โดยตรง (ไม่ผ่าน settings home) · back กลับ feed จุดเดิม | — | MED | |

### 2.13 Sensitive Content — `sensitive`

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SET-086 | anatomy + default | MEMBER/NEW | UI | prefs → `เนื้อหาที่ละเอียดอ่อน`/`Sensitive content` | อ่านหน้า | head `เนื้อหาที่ละเอียดอ่อน`/`Sensitive content` + desc `เลือกระดับของเนื้อหาที่ละเอียดอ่อนที่คุณจะเห็นในฟีด`/`Choose how much sensitive content you see in feed.` · options `น้อยลง`/`Less` (`คุณจะเห็นเนื้อหาที่ละเอียดอ่อนน้อยลง`) + `มาตรฐาน`/`Standard` (`คุณจะเห็นเนื้อหาที่ละเอียดอ่อนบางส่วน`) + check — default `Standard` บน NEW | — | HIGH | |
| SET-087 | เลือก Less → apply ทันที | MEMBER | POSITIVE | `sensitive` เปิด | แตะ `น้อยลง` → แตะ `มาตรฐาน` กลับ | check ย้ายทันที · apply ไม่มี save button ไม่มี toast — ผลกรองฟีดจริง = BLOCK (ต้องมี sensitive-flagged content บน build/seed จึงเทียบผลฟีดได้ — ไม่มี fixture = รายงาน BLOCK พร้อมเหตุผล) | — | HIGH | |
| SET-088 | persist ข้าม kill + เครื่อง B | MEMBER | STATE | เลือก `น้อยลง` ไว้ | kill app → เปิดใหม่ดู → เครื่องสอง sign in MEMBER เปิด `sensitive` | ค่าค้างข้าม kill และเหมือนกันเครื่องสอง — sensitive ติดบัญชี server persist | — | MED | |

### 2.14 Interested / Not Interested — nav ผ่าน `prefs`

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SET-089 | rows เปิดถูกหน้า | MEMBER | POSITIVE | `prefs` เปิด + มี `P-L1`/`P-NI` | แตะ `สนใจ` → เช็กหน้า → back → แตะ `ไม่สนใจ` → เช็กหน้า | `สนใจ` → `รายการที่สนใจ`/`Interested` (แถวโพสต์ที่ถูกใจ + `ลบออก`) · `ไม่สนใจ` → `ไม่สนใจ`/`Not interested` (แถว + `คืนค่า`) — list mechanics เต็มอยู่ FO-TEST-14 LIB-088..097 | head ตรง spec | HIGH | |
| SET-090 | back → prefs → settings จุดเดิม | MEMBER | STATE | `interested` เปิด | back → back → back | `interested`→`prefs`→`settings`→own profile ตามลำดับ ไม่ข้ามชั้น | — | MED | |
| SET-091 | [GATE] guest ไม่มีทางเข้า prefs/interested/ni | GUEST | GATE | SETUP-03 | เป็น guest ลองหาทางเข้า content preferences/interested/ni ทุกจุด | ทุกทางตัน Member Sheet (เข้าผ่าน settings ซึ่ง gate อยู่แล้ว — ไม่มีทางลัดอื่น) | — | HIGH | |

### 2.15 Help — `help`

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SET-092 | anatomy | MEMBER | UI | settings → `ศูนย์ช่วยเหลือ`/`Help` | อ่านหน้า | head `ศูนย์ช่วยเหลือ`/`Help` · `ช่องทางการติดต่อ`/`Support channels` + `ให้บริการทุกวัน · 09:00 - 22:00 น. (GMT+7)`/`Available daily · 09:00 - 22:00 (GMT+7)` · rows `LINE Official`(@mrfoxthailand) · `โทรศัพท์ติดต่อ`/`Call support`((+66) 80-008-8088) · `อีเมลติดต่อ`/`Email support`(service@mrfox.com) · `หัวข้อช่วยเหลือ`/`Help topics`: `ความเป็นส่วนตัวและความปลอดภัย` + `ข้อกำหนดและแนวทางปฏิบัติ` | — | HIGH | |
| SET-093 | LINE → เปิดออกนอกแอป | MEMBER | POSITIVE | `help` เปิด | แตะ `LINE Official` | เปิด LINE app หรือ browser ไปหน้า @mrfoxthailand (external intent) — กลับเข้าแอปแล้วอยู่ `help` เดิม | — | MED | |
| SET-094 | โทร → dialer | MEMBER | POSITIVE | `help` เปิด | แตะ `โทรศัพท์ติดต่อ` | เปิด dialer พร้อมเบอร์ (+66) 80-008-8088 กรอกให้ — ไม่โทรออกเอง | — | MED | |
| SET-095 | อีเมล → mail composer | MEMBER | POSITIVE | `help` เปิด | แตะ `อีเมลติดต่อ` | เปิด mail composer ใส่ service@mrfox.com ใน To — ไม่ส่งเอง | — | MED | |
| SET-096 | help topics → legal pages | MEMBER | POSITIVE | `help` เปิด | แตะ `ความเป็นส่วนตัวและความปลอดภัย` → back → `ข้อกำหนดและแนวทางปฏิบัติ` → back | `Privacy & Safety` → หน้า `privacy` เดียวกับ settings row · `Terms & Guidelines` → หน้า `terms` เดียวกัน · back กลับ `help` | — | MED | |

### 2.16 Legal Pages — `privacy` / `terms`

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SET-097 | `privacy` anatomy | MEMBER | UI | settings → `นโยบายความเป็นส่วนตัว`/`Privacy Policy` | อ่าน+เลื่อนสุด | head `นโยบายความเป็นส่วนตัว`/`Privacy Policy` · in-app page scrollable · 4 sections `1. Information We Collect` · `2. How We Use Information` · `3. Data Protection & Retention` · `4. Your Rights` (ตามภาษา — prototype EN source + TH display layer) | — | HIGH | |
| SET-098 | `terms` anatomy | MEMBER | UI | settings → `ข้อกำหนดการใช้งาน`/`Terms of Use` | อ่าน+เลื่อนสุด | head `ข้อกำหนดการใช้งาน`/`Terms of Use` · 3 sections `1. Agreement to Terms` · `2. Listing Authenticity` · `3. Termination & Deactivation` | — | HIGH | |
| SET-099 | entries ทุกจุดเปิดหน้าเดียวกัน | MEMBER | POSITIVE | sign in แล้ว | เปิด `privacy` จาก settings row / Help topics / About Legal&Support → เปรียบ | ทุก entry เปิดหน้า `privacy` เดียวกัน (ไม่ใช่ external link / ไม่ใช่หน้าคนละชุด) — เช่นเดียวกับ `terms` | — | MED | |
| SET-100 | back จาก legal | MEMBER | STATE | `privacy` เปิดจาก settings | back | กลับ `settings` จุดเดิม (ถ้าเข้าจาก help → กลับ `help`) | — | MED | |

### 2.17 About App — `about_app`

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SET-101 | anatomy | MEMBER | UI | settings → `เกี่ยวกับตึกแดง`/`About` | อ่านหน้า | head `เกี่ยวกับตึกแดง`/`About` · brand `TUK DAENG` · tagline `ศูนย์รวมและดูแลนาฬิกาหรูสำหรับนักสะสม`/`The digital curator for watch collectors` · `เวอร์ชัน 0.0.1`/`Version 0.0.1` (เลขเวอร์ชัน build ทดสอบจริง) · `Mister Fox Co., Ltd. · Est. 2026` · section `ข้อมูลทางกฎหมายและการสนับสนุน`/`Legal & Support` | — | HIGH | |
| SET-102 | Legal&Support links | MEMBER | POSITIVE | `about_app` เปิด | แตะ `Privacy Policy` → back → `Terms of Use` → back → `ติดต่อฝ่ายบริการลูกค้า`/`Contact support` | Privacy/Terms → หน้า legal เดียวกับ settings row · Contact support → หน้า `help` เดิม (ไม่ใช่หน้าใหม่) | — | MED | |
| SET-103 | ไม่มีข้อมูลบัญชี | MEMBER | NEGATIVE | `about_app` เปิด | อ่านทุกแถวหา Delete Account / Change password / Edit profile / Date joined / contact fields | ไม่มีทั้งหมด — หน้านี้ข้อมูลแอป+บริษัทเท่านั้น | — | HIGH | |
| SET-104 | back → settings | MEMBER | STATE | `about_app` เปิด | back | กลับ `settings` จุดเดิม | — | LOW | |

### 2.18 Privacy & Cookies — `cookies` (spec contract — ล็อก 2026-10-29)

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SET-105 | row อยู่ใน More info section | MEMBER | UI | `settings` เปิด | อ่านกลุ่ม `ข้อมูลเพิ่มเติมและการสนับสนุน` → แตะ `ความเป็นส่วนตัวและคุกกี้`/`Privacy & cookies` | มี row ตาม spec (อยู่ระหว่าง Help กับ Privacy Policy) → เปิดหน้า `cookies` — build ไม่มี row = **FAIL** | — | HIGH | |
| SET-106 | anatomy | MEMBER | UI | `cookies` เปิด | อ่านหน้า | head `ความเป็นส่วนตัวและคุกกี้`/`Privacy & cookies` + desc · row `จำเป็น`/`Essential` — `เปิดตลอด`/`Always on` **ไม่มี toggle** + desc จำเป็นต่อการทำงานและความปลอดภัย · toggles `การวิเคราะห์การใช้งาน`/`Analytics` + `การปรับแต่งเฉพาะบุคคล`/`Personalized content` | — | HIGH | |
| SET-107 | toggles บันทึกลง consent record ทันที | MEMBER | POSITIVE | `cookies` เปิด | เปิด `Analytics` → back เข้าใหม่ → เปิด `Personalized` → ปิด `Analytics` | toggle auto-save ทันที ไม่มี save button · ค่าค้างเมื่อเข้าใหม่ · ค่าต้องตรงกับที่เคยเลือกตอน onboarding (consent record ชุดเดียวกัน) | — | HIGH | |
| SET-108 | persist kill + ค่าเริ่มต้น | MEMBER/NEW | STATE | ตั้งค่า toggles ไว้ · NEW ที่ skip consent | kill app → เปิดใหม่ดู → NEW: เปิด `cookies` | ค่าค้างข้าม kill บนเครื่องเดิม (ต่อ device) · NEW ที่ไม่เคย opt-in = toggles OFF default | — | MED | |

### 2.19 Navigation & Back — sub-stack

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SET-109 | back ทุกหน้าย่อย → landing/parent | MEMBER | STATE | `settings` เปิด | เดินเข้าแต่ละหน้าแล้ว back: lang/theme/notif/fav/muted/blocked/help/cookies/privacy/terms/about → settings · about→(change_pwd/del_account)→about · prefs→(sensitive/interested/ni)→prefs | ทุกหน้า back กลับ parent ถูก (settings landing หรือหน้าแม่) — ไม่เด้ง feed/โปรไฟล์ข้ามชั้น | — | HIGH | |
| SET-110 | deep stack pop ทีละชั้น | MEMBER | STATE | settings → about → change_pwd → back ×3 | แตะ back ทีละครั้ง | change_pwd → about → settings → own profile — pop ทีละหน้า ไม่เด้งทีเดียว | — | MED | |
| SET-111 | device back เทียบเท่า in-app back | MEMBER | STATE | settings → favorites → search มี q / dialog reset เปิด | ใช้ device back ของ OS ทีละครั้ง | ปิดชั้นบนสุดทีละชั้นเหมือน in-app back (dialog → หน้าย่อย → landing → profile) — ไม่ปิดแอป | — | MED | |
| SET-112 | หน้าย่อยทั้งหมดไม่มี bottom nav | MEMBER | NEGATIVE | sign in แล้ว | เช็กขอบล่างทุกหน้า settings stack | ทุกหน้าย่อย + dialogs ไม่มี bottom nav (sub page ทับเต็มจอ) — เจอ nav หลุดที่ไหน = FAIL | — | HIGH | |

### 2.20 Edge / Persist / Cross-Device / Real Device

| TC ID | Feature | Actor | Type | Precondition | Test Steps | Expected — การทำงาน | Expected — การแสดงผล | Priority | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SET-113 | kill app → account prefs คง | MEMBER | POSITIVE | SETUP-06 เสร็จ + ตั้ง sensitive/snooze | kill app → เปิดใหม่ → เปิดทุก list/prefs | favorites/muted/blocked/snooze/sensitive/ni ครบเหมือนเดิม — persist ฝั่ง server | — | HIGH | |
| SET-114 | sign out → guest ตัน → sign in กลับครบ | MEMBER | POSITIVE | SETUP-06 เสร็จ | sign out → ลองเข้า settings เป็น guest → sign in เดิม → เปิดทุกหน้า | ตอน guest ตัน Member Sheet · sign in กลับ → favorites/muted/blocked/snooze/sensitive/ni เดิมครบ | — | HIGH | |
| SET-115 | เครื่อง B เห็น account prefs เดียวกัน | MEMBER | POSITIVE | เครื่องสอง sign in MEMBER เดิม | เปิด favorites/muted/blocked/prefs/sensitive เทียบเครื่องหลัก | list + toggle ตรงกันทุกหน้า (server เป็น source เดียว) — lang/theme/notif ต่างได้ตาม per-device | — | HIGH | |
| SET-116 | mutate เครื่อง B → sync A | MEMBER | POSITIVE | เครื่องสอง sign in MEMBER เดิม | เครื่องสอง: เพิ่ม favorite 1 + ปิดเสียง 1 → เครื่องหลัก: เปิดหน้าใหม่ | เครื่องหลักเห็น favorite/mute ใหม่ตาม server · count บน settings row อัปเดต | — | HIGH | |
| SET-117 | toggle รัว ๆ | MEMBER | EDGE | `notif_settings`/`prefs`/`sensitive`/`cookies` เปิด | แตะ toggle/option รัวหลายครั้งต่อเนื่อง | state นิ่งตามการแตะสุดท้าย — ไม่ค้างครึ่ง ไม่กระตุกค้าง | — | MED | |
| SET-118 | offline — เขียนไม่ได้แจ้งชัด | MEMBER | POSITIVE | เคยเปิด `favorites` มีข้อมูล | airplane on → เปิด `favorites`/`muted`/`blocked` → ลอง Remove/Unblock/Snooze → กลับ online | เห็น list ชุดล่าสุด (offline contract) · action เขียนไม่สำเร็จ + แจ้งชัด (ไม่เงียบ/ไม่บันทึกหลอก) · reconnect ตรง server | — | HIGH | |
| SET-119 | TH/EN sweep ทั้ง settings | MEMBER | POSITIVE | สลับภาษาใน `lang` | เปิดทุกหน้า settings stack ทั้ง TH+EN รวม dialogs (logout/reset/unblock/forgotPwd/del) | ทุก label+toast+dialog+placeholder ตามภาษา — EN ค้างในโหมด TH (หรือกลับกัน) = FAIL (จุดเฝ้าระวัง: toasts favorites/unmute/unblock/reset/mute + dialog reset/mute + restrict hint) | — | HIGH | |
| SET-120 | dark sweep | MEMBER | POSITIVE | เปิด dark | เปิดทุกหน้า + dialogs + toggles + legal text | อ่านได้ครบ ไม่มีตัวอักษรจมพื้น · สวิตช์/เครื่องหมายถูก/แถวแดงเห็นชัดทั้ง 2 ธีม | — | MED | |
| SET-121 | ขอบเขตข้อมูลที่กู้คืน (Restore Scope) เมื่อ sign-in ระหว่าง 30d grace | MEMBER | STATE | บัญชีกดลบเข้าสู่ grace period 30 วัน | 1. Sign-in ด้วยอีเมล/รหัสผ่านเดิม 2. ตรวจสอบโพสต์สินค้า, Saved, Wishlist, ประวัติแชท 3. ตรวจสอบหน้า Watch Alerts | โพสต์สินค้า, รายการ Saved, รายการ Wishlist และประวัติแชทกลับมาครบถ้วนตามปกติ **ยกเว้น Watch Alerts** ที่ถูกล้างออกและไม่กู้คืนตามกติกากลาง (GAP-16 / DEC-10) | ข้อมูลหลักคืนครบ + Watch Alerts ว่าง | HIGH | |

## §3 Spec deviations / contract ที่กระทบเคสเล่มนี้

| จุด | ผลต่อเคส | TC |
| --- | --- | --- |
| **Privacy & cookies** — spec 13 + 00_GLOBAL §8 บังคับมี row+หน้า consent แต่ prototype เดิมไม่มี → เพิ่ม row+หน้า `cookies` ใน prototype แล้ว (ล็อกผู้ใช้ 2026-10-29) | เคสคาดว่ามี — build ไม่มี = FAIL | SET-004, 008, 105..108 |
| **persist scope** — lang/theme/notif = per-device (spec "ต่อ device"/"on this device") vs lock รวม server persist → ล็อกแยก: ของติดเครื่องไม่ตามบัญชี, ของติดบัญชี sync ข้ามเครื่อง (ถามผู้ใช้) | เคสข้ามเครื่องของ lang/theme/notif คาด "ไม่ตาม"; เคส account prefs คาด sync | SET-043..045, 050..051, 057..058 vs SET-071, 077, 081, 088, 115..116 |
| **restore ไม่คืน watch alerts** — spec เดิมไม่ได้เขียน → ล็อกผู้ใช้ คง cancelled + เติมบรรทัด spec §9 grace semantics | expected = alerts ไม่กลับหลัง restore | SET-035 |
| **sensitive feed effect** — spec apply ทันทีแต่ไม่มี sensitive-flagged content ให้พิสูจน์ → เทส apply+persist เท่านั้น, ผลฟีด [OPEN] | OPEN — รอข้อมูลทดสอบ content flag ก่อนเพิ่มเคสคาดผลฟีด | SET-087 |
| **EN hardcode จุด settings** — toasts (`Added/Removed/Removed all favorites` · `Posts unmuted` · `Unblocked` · `Muted` · `Suggested content reset`) + dialog `reset`/`mute` + restrict hint หลัง unblock — prototype EN-only | ล็อกภาษาเหนือกว่า — TH mode เจอ EN ค้าง = FAIL | SET-119 + เคสที่เกี่ยว |
| **del dialog credential** — prototype mock-bug เช็ก `mockPassword` คนละ field กับ change_pwd → แก้เป็น `userPwd` แล้ว (spec §9 note resolved) | del เช็กรหัสชุดเดียวกับ change_pwd | SET-035 |
| **SSO change pwd** — contract ต้องไม่ active สำหรับ SSO-only · prototype แสดงเสมอ | เคสต้อง `SSO-ACCT` — ไม่มี → BLOCK | SET-024 |
| **Change pwd policy** — canonical ≥8+num/sym · prototype เช็กเฉพาะความยาว | เคส `abcdefgh` ต้องถูกปฏิเสธ | SET-019 |
| **notif toggle desc vs effect** — spec desc "on this device" แต่ rule บอกปิดแล้วไม่สร้าง alert item → เทสผลบนเครื่องที่ตั้งค่าเท่านั้น | ไม่ลากเคสผลไปข้ามเครื่อง | SET-056 |
| **fav search `sub-empty` ไม่มีเคสว่างแยก** — search ไม่เจอ = ไม่มีแถว (ไม่มี copy เฉพาะ) | expected = แถวหาย ไม่ระบุ empty copy | SET-064 |
| **Date joined mock** — prototype fixed Oct 2024/2026 → แอปจริงต้องเป็นวันสมัครจริง | expected = เดือน/ปีจริงของบัญชี | SET-012 |
| **del-account failure path** — contract §12 `Unable to delete account.` ไม่มีใน prototype → ทดสอบไม่ได้บนเครื่องจริง (ต้องให้ server ล้มเหลวเอง) → BLOCK พร้อมเหตุผล | — | — |
| **Snooze 30 วัน expiry** — contract หมดอายุเองหลัง 30 วัน → ทดสอบไม่ได้ใน session | BLOCK พร้อมเหตุผล (รอ 30 วันจริง ทดสอบไม่ได้ใน session) | SET-081 |
| **ATT interplay** — spec บอก user เคย `Ask App Not to Track` → Personalized ต้อง off+disabled → จำลอง ATT state บนเครื่องทดสอบไม่ได้ → contract note (เคสไม่บังคับ) | — | — |

**FO-SYNC-01 sync (2026-10-29):**

- **RESOLVED — EN hardcode จุด settings**: toasts (`Added`/`Removed`/`Removed all favorites` · `Posts unmuted` · `Unblocked` · `Muted` · `Suggested content reset`) + dialog `reset`/`mute` + `pfRestrictHint` → เติม `I18N_TH` dict + isTh branches ใน prototype แล้ว
- **RESOLVED — Change pwd policy**: prototype enforce ≥8 + num/sym แล้ว (เดิมเช็กเฉพาะความยาว) — spec 13 §498/503 อัปเดตเป็น resolved; `abcdefgh` ถูกปฏิเสธตาม contract
- **ต่างโดยเจตนา (คงไว้)**: `?dev` sims · persist per-device vs server (contract ระบุใน spec) · Date joined mock · del-account failure path ไม่มีใน prototype · SSO change pwd ไม่มีบัญชีจำลอง · snooze 30d/ATT = contract ที่เทสใน session ไม่ได้

## §4 Traceability — inventory + actions ครอบ

| Inventory หน้า/route (§2.11) | Action ใน inventory | TC ที่ครอบ | หมายเหตุ |
| --- | --- | --- | --- |
| `settings` | pf-menu entry · 6 sections · rows+count+pill · Log out row | SET-001..010, 036..039 | gate ที่ pf-menu |
| `about_account` | hero · info · Security · mgmt | SET-011..015 | |
| `change_pwd` + `forgotPwd` dlg | 3 fields+eyes · validation · forgot | SET-016..024 | flow detail ร่วม FO-TEST-01 |
| `del_account` + pwd/success dlg | 2-page · reason · password · scheduled · restore | SET-025..035 | destructive — DEL-ACCT |
| dialog `logout` | confirm/cancel → guest | SET-036..039 | |
| `lang` | en/th swap + toast + persist | SET-040..047 | per-device |
| `theme` | light/dark swap + persist | SET-048..052 | per-device |
| `notif_settings` | 4 toggles auto-save + ผล alert | SET-053..058 | per-device |
| `favorites` | search · remove · remove all · suggested add | SET-059..066 | |
| `muted` | list + unmute | SET-067..071 | |
| `blocked` | list + unblock dialog | SET-072..077 | |
| `prefs` + `sensitive` + `interested`/`ni` nav | rows · snooze · sensitive level · reset | SET-078..091 | list internals → FO-TEST-14 |
| dialog `reset` | Reset suggested content confirm | SET-082..084 | |
| `help` | channels · topics | SET-092..096 | |
| `privacy`/`terms` | legal pages render + entries | SET-097..100 | |
| `about_app` | brand + Legal&Support | SET-101..104 | |
| `cookies` (Privacy & cookies) | Essential + toggles → consent | SET-105..108 | spec contract — เพิ่มในโค้ด 2026-10-29 |
| guest gate | Member Sheet ที่ entry | SET-001, 091 | |
| persist/cross-device | kill · sign-out · เครื่อง B | SET-113..116 + per-section persist เคส | 2 scope ตามล็อก |
| back/device back | sub-stack pop + device parity | SET-109..112 | |

## หมายเหตุท้าย

- **ก่อนส่งงานจริง**: เขียนเสร็จ → รอ PO/หัวหน้ารีวิว → แก้ตาม feedback → ค่อยปิด task (กฎเดียวกับทุกเล่ม)
- **จุดที่ล็อกในรอบนี้ (ถามผู้ใช้ 2026-10-29)**: (1) Privacy & cookies บังคับมี → เพิ่มใน prototype แล้ว (row+หน้า `cookies`) (2) persist แยก scope: lang/theme/notif = per-device, ที่เหลือ = server ข้ามเครื่อง (3) restore ไม่คืน watch alerts → เติม spec (4) sensitive เทส apply+persist ผลฟีด [OPEN]
- **แก้ spec+prototype รอบนี้**: prototype `index.html` — เพิ่มแถว Privacy & cookies + หน้า `cookies` (Essential/toggles → fo_consent ผ่าน obLog) + แก้ del pwd check `mockPassword`→`userPwd` · spec `13_SETTINGS_MODULE.md` — route `cookies` + note restore ไม่คืน alerts + mock-bug resolved · inventory §2.11 + route list เพิ่ม `cookies`
- **เคส BLOCK ล่วงหน้า** (ต้องมีเครื่องที่สองหรือ ACCT-2 — ไม่มี = BLOCK พร้อมเหตุผล): SET-024 (ไม่มี SSO-ACCT) · SET-056 (ไม่มีเครื่องสอง/ACCT-2 trigger like ไม่ได้) · SET-071, 077, 081, 088, 115, 116 (ไม่มีเครื่องสอง) · SET-035 (DEL-ACCT ตั้ง WA ไม่ได้) · SET-093..095 (เครื่องไม่มี LINE/mail app — dialer/mail intent อาจหน้าต่าง OS)
- **spec gap/จุดเฝ้าระวังรอบรีวิว**: notif toggle = "on this device" vs rule ไม่สร้าง alert item [OPEN — รอตัดสิน: ระดับเครื่องหรือระดับบัญชี] (เฝ้าดูเครื่อง B) · del-account failure path ยังไม่มีเคสบังคับ · snooze 30d expiry เทสไม่ได้ · ATT→Personalized interplay ทำ contract note · legal content เป็น placeholder-grade ตาม spec (production ต้อง legal จริง+version/effective date — เคสเช็กโครงไม่ล็อก copy)
- **ครอบโดยเล่มอื่น ไม่ทำซ้ำ**: interested/ni list mechanics → FO-TEST-14 (LIB-088..097) · saved/wishlist/archive/walerts → FO-TEST-14/11 · auth mechanics (sign in/up/OTP/forgot semantics) → FO-TEST-01 · block/mute/report creation → FO-TEST-16 · Member Sheet → FO-TEST-17 · ni-card → FO-TEST-03 · favorites feed tab internals → FO-TEST-03

- สถิติ: **121 TC** — High 72 / Medium 44 / Low 5 (SETUP rows 10 แถวแยกใน checklist; รวมใน csv 131 แถว)
