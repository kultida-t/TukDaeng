# BO Shared Contract — Navigation, Active State & Naming

เอกสาร contract กลางสำหรับ Mission "BO Shared UI, Accessibility & Navigation Remediation" (mission `1e359966`, task `BOR-002`)
ล็อกมาตรฐาน **sidebar active state**, **deep-link/back navigation context** และ **naming standard** ที่ task
BOR-003 (fix coverage list), BOR-007 (WAL-1440 deep link), BOR-008 (Account Deletion → User Detail),
BOR-009 (Categories modal title), BOR-010 (Market Overview rename), BOR-012 (navigation regression) และ BOR-014 (doc sync) ต้องยึดตาม

- Status: Contract draft for remediation — ยังไม่ได้แก้ prototype ใด ๆ ตามเอกสารนี้
- Source findings: Mission Audit `1800d8aa` → Objective 1 (WAL-1440 wrong destination, confirmed defect),
  Objective 2 (Categories modal title ต้องเป็น English), Objective 3 (DEL-033 → U-1104 active-sidebar inconsistency,
  Market Overview recommendation, decision: destination-owned active state + Back รักษา source context + permission visibility)
- เอกสารนี้เป็น contract เท่านั้น ไม่ใช่คำสั่งแก้ protected screens — การแก้จอใดอยู่ใต้ named scope ของ baseline และ fix coverage list ของ BOR-003

---

## 1. Current State Baseline (สรุปจาก `Prototypes/bo-prototype.html`)

**Single source of truth ของเมนู** — `navGroups` (~17909):

- 3 sections (ภาษาไทย): `การดำเนินงาน` / `งานตรวจสอบและบริการ` / `เครื่องมือ & รายงาน`
- Items มี `id`, `label` (English), `icon`, `subs` (string labels หรือ `{ label, module }` object — เช่น Audit Log map ไป module `audit`)
- Derived maps: `navParentByModule` (module/sub → parent nav id), `defaultSubByModule` (module → first string sub)
- State globals: `activeModule`, `activeSub`, `expandedMenus` (Set), `activeRow`
- `updateActiveNav()` (~46114): parent `.nav-item` ได้ `.active` เมื่อ `data-module === navParentByModule[activeModule] || activeModule`;
  `.submenu` ได้ `.open` ตาม `expandedMenus`; submenu button ได้ `.active` เมื่อ `data-module === activeModule && data-sub === activeSub`;
  มี guard พิเศษถอด `.active` ของ Dashboard เมื่อ activeModule ไม่ใช่ dashboard
- `syncExpandedNavForModule()` (~30593): clear `expandedMenus` แล้วเพิ่ม parent ของ module ปัจจุบัน (กาง submenu ของ parent เสมอ)
- Back stack: `backNavigationStack` + `getCurrentNavigationContext()` + `pushBackNavigationContext()` (บันทึก list filter state ก่อนเข้า detail — BO-UX-001)
  + `restoreNavigationContext()` + `getDefaultBackContext()` + `goBackToPreviousPage()` + `resetBackNavigation()`
- Generic back button: `renderPageBackButton(attr, label)` → `.page-back-btn` handler → `goBackToPreviousPage()`;
  ยกเว้น Market ใช้ `data-market-back` แยก target (catalog/brand/model)
- Cross-surface jump: `data-module-jump`/`data-sub-jump`/`data-jump` → `jumpToModule(module, sub)` (~35969, 46672);
  jump helpers เฉพาะทาง `jumpToAssetReportReference()`, `jumpToDeliveryLog()`; `data-audit-ref`/`data-delivery-log-jump` เป็น jump แบบ filter-by-reference
- Filter persistence (BO-UX-001): `saveCurrentListFilterState()` ก่อนเข้า detail → `restoreListFilterState()` เมื่อกลับ;
  `resetListFilterPanelsForNavigation()` clear state เมื่อเปลี่ยน route (`module|sub`) — filter คงอยู่เฉพาะ detail→back ใน list เดิม ถูกล้างเมื่อสลับ module/sub
- Display label override เดียวในระบบ: `getSubNavDisplayLabel()` (~21424) — sub `"Asset List"` แสดงเป็น `"Assets"` บน sidebar
- My Account (AIL-020): entry จาก `.admin-box` ที่ profile footer เท่านั้น ไม่อยู่ใน `navGroups` —
  เมื่ออยู่หน้า My Account ไม่มี nav item ใด active; `.admin-box` แสดง active state แทน (body.my-account-mode)

**Breadcrumb convention ปัจจุบัน** — `#crumb` format: `<Section TH> / <Module EN> / [<Sub EN>] [/ <Detail type> / <ID>]`

- List: `การดำเนินงาน / Dashboard`, `เครื่องมือ & รายงาน / Settings / Audit Log`, `งานตรวจสอบและบริการ / Market Demand / Watch Alert List`
- Detail: `การดำเนินงาน / User Management / User Detail / U-xxxx`, `งานตรวจสอบและบริการ / Market Demand / Watch Alert List / WAL-xxxx`
  (Alert Detail ใช้ชื่อ owning list `Watch Alert List` + ID ไม่ใช่คำว่า "Alert Detail"), `งานตรวจสอบและบริการ / Account Deletion / Requests / DEL-xxx`
- Exception: My Account = `My Account` ระดับเดียว (ไม่อ้าง section เพราะไม่มี parent ใน navGroups)

**จุดที่ยังไม่ตรง contract (confirmed findings + observed divergences):**

| จุด | พฤติกรรมปัจจุบัน | Contract ที่เกี่ยว | Fix task |
| --- | --- | --- | --- |
| Frequently Triggered Alerts row `WAL-1440` (`data-wa-alert-row`, ~38108/46667) | `jumpToModule("watch-alerts", "Alert List")` → เปิด list ไม่ใช่ detail และใช้ alias `"Alert List"` ที่ไม่ตรง submenu label `"Watch Alert List"` (ไม่มี sub ใด active) | A.3, B.1, C.2 | BOR-007 |
| DEL-033 → `data-user-open` → User Detail U-1104 (~29106/47646) | `renderUserDetailPageSpec` set `activeSub = "User Accounts"` แต่ไม่ set `activeModule` → sidebar ค้างที่ Account Deletion ทั้งที่ crumb เป็น User Management | A.1 (destination-owned) | BOR-008 |
| Categories modals (~41993/42052/39650) | title ภาษาไทย `รายละเอียดหมวดหมู่`, `เพิ่มหมวดหมู่`, `แก้ไขหมวดหมู่`, `จัดเรียง Category` | C.3 | BOR-009 |
| Market Data sub `"Dashboard"` | ชื่อ sub ชนกับ module `dashboard` ทำให้สับสน; audit เสนอ "Market Overview" | C.2 | BOR-010 |
| Market detail back button (~37572) | label `Back to ${pageLabel}` (English) ต่างจาก pattern กลาง `กลับไป <target>` | C.4 | flag → BOR-003 ตัดสิน coverage |

---

## 2. Contract A — Sidebar Active State

1. **Destination-owned active state (audit decision, Objective 3)** — sidebar active state ผูกกับ **ปลายทางที่ผู้ใช้กำลังดู** ไม่ใช่ต้นทางที่เข้ามา:
   - ทุก render path ของ detail page ต้อง set `activeModule` **และ** `activeSub` ให้เป็น module/sub เจ้าของปลายทางก่อน `updateActiveNav()`
     (เช่น User Detail → `users`/`User Accounts` แม้เปิดจาก Account Deletion หรือ Reported Users context)
   - ต้นทางไม่หาย — เก็บไว้ใน `backNavigationStack` เพื่อ Back (Contract B) แต่ไม่คง active state ไว้
2. **Detail page สืบทอด sub ของ owning list** — sub active = sub ของ list ที่ detail สังกัด:
   User Detail → `User Accounts`, Report Detail (user) → `Reported Users`, Asset Detail → `Asset List`,
   Reported Asset/Comment detail → `Reported Assets`/`Reported Comments`, Article Detail → `Articles`,
   Alert Detail → `Watch Alert List`, Request Detail → (deletions ไม่มี sub → parent `Account Deletion` active),
   Admin/Role/Policy detail → `Admin Accounts`/`Roles & Permissions`/`Policy & Versioning`
3. **Sub label ที่ใช้ set `activeSub` ต้องเป็น canonical label จาก `navGroups` เท่านั้น** — ห้ามใช้ alias ที่ไม่ตรง `data-sub` ของปุ่ม submenu
   (alias `"Alert List"` ปัจจุบันทำให้ไม่มี submenu button active — ถ้าจำเป็นต้องรับ alias ให้ normalize ที่จุดเข้าเดียว ไม่กระจาย `|| "Alert List"` หลายที่)
4. **Accordion state ตาม active module** — `expandedMenus` มีได้ทีละ 1 parent; เข้า module ที่มี subs → กาง parent นั้นเสมอ (`syncExpandedNavForModule`)
5. **หน้าที่อยู่นอก `navGroups`** (เช่น My Account) → ไม่มี `.nav-item`/submenu ใด active; entry point ของมันเอง (`.admin-box`) เป็นตัวแสดง active state
   — test baseline `qa-bo-019a` test 4 assert พฤติกรรมนี้อยู่แล้ว ห้ามเปลี่ยน
6. **Module-id subs** (เช่น `{ label: "Audit Log", module: "audit" }` ใน Settings) — submenu button ใช้ `data-module="audit"`;
   active เมื่อ `activeModule === "audit"` และ parent resolve ผ่าน `navParentByModule` → `settings`
7. **Permission visibility (audit decision)** — entry ที่ admin ไม่มีสิทธิ์ `*.view` ไม่แสดงใน nav;
   jump โดยตรง (deep link/`data-module-jump`) ที่ขาดสิทธิ์ → toast `ไม่มีสิทธิ์…` + อยู่หน้าเดิม (pattern เดิมของ `jumpToDeliveryLog`/`canViewDeliveryLogs`)

---

## 3. Contract B — Deep-link / Back Navigation Context

1. **Entity link ต้องลงที่ entity detail** — link/chip/row ที่ระบุ entity เฉพาะ (ID หรือชื่อเฉพาะ เช่น `WAL-1440`) ต้องเปิด detail page ของ entity นั้นโดยตรง;
   เฉพาะ link แบบ aggregate (เช่น `View All`) เท่านั้นที่ลงที่ list — ห้ามพาไป list แล้วให้ผู้ใช้หาเอง
2. **Forward navigation push source context เสมอก่อนเปลี่ยนหน้า** — ผ่าน `pushBackNavigationContext()` ซึ่ง capture `getCurrentNavigationContext()`
   (module context หรือ detail context เช่น `deletion-detail`) และ save list filter state (BO-UX-001) ในคำสั่งเดียว — handler ที่เปิด detail ต้องเรียก push ก่อน render
3. **Back รักษา source context (audit decision)** — `.page-back-btn` → `goBackToPreviousPage()`: pop stack → `restoreNavigationContext()`;
   ถ้า restore ไม่ได้ (entity หาย/context ไม่รู้จัก) → fallback `getDefaultBackContext()` (owning list ของหน้าปัจจุบัน)
   - ตัวอย่าง canonical: Request Detail → User Detail → Back ต้องกลับ Request Detail เดิม (DEL-PTO-006);
     Demand Overview → Alert Detail → Back กลับ Demand Overview (หลัง BOR-007)
4. **Sidebar nav click = reset context** — การคลิก nav/submenu คือเริ่ม workflow ใหม่: `resetBackNavigation()` + `resetListFilterPanelsForNavigation()` (คงกฎเดิม ~46716)
5. **Filter persistence boundary** — filter ของ list คงอยู่เฉพาะ list→detail→back ใน route เดิม (`module|sub`); เปลี่ยน route = clear
   — `saveCurrentListFilterState` ต้องไม่ overwrite state ที่ save ไว้เมื่ออยู่หน้าที่ไม่มี filter input (WA-QA-002a guard คงไว้)
6. **Jump helpers ที่ไปข้าม module ต้องสะอาดเหมือน sidebar nav** — `jumpToModule`/`data-module-jump` ไป list อื่น = context ใหม่
   (reset filter panel ตามเดิม); ส่วน jump ที่ลง detail เฉพาะ (Contract B.1) ให้ push source context แทน เพื่อ Back กลับต้นทาง
   - ⚠️ Observed: `jumpToModule` ปัจจุบันไม่เรียก `resetBackNavigation()` — หาก BOR-007/008 แตะ path นี้ให้ตรวจว่า stack ไม่ค้าง context ข้าม module; หากต้องเปลี่ยนพฤติกรรม jump ทั้งระบบให้เสนอใน BOR-003 ก่อน
7. **Back button label อ้าง canonical destination** — label ต้องชื่อปลายทางจริงที่ Back จะไป (ดู C.4); ถ้า back target เปลี่ยนตาม context
   (เช่น User Detail ที่เข้าจาก Request Detail) ให้ label สื่อ destination จริงหรือใช้ label กลางของ owning list ตาม convention เดิมของหน้านั้น

---

## 4. Contract C — Naming Standard

1. **Single source: `navGroups`** — ชื่อ module/sub ที่แสดงบน sidebar = `label`/sub string ใน `navGroups` เท่านั้น;
   ห้าม hardcode ชื่อเมนูที่ต่างจาก source ในจุดอื่น (crumb, page title, back label ต้องอ้าง label เดียวกัน)
   - Display override มี chokepoint เดียวคือ `getSubNavDisplayLabel()` — อนุญาตเฉพาะตัวที่มีอยู่ (`Asset List` → `Assets`);
     ห้ามเพิ่ม override ใหม่ใน scope นี้ (เปลี่ยนชื่อจริงให้ rename ที่ `navGroups` แทน)
2. **Module & sub label = English noun phrase** — เช่น `User Management`, `Watch Alert List`, `Sync History`;
   ชื่อ sub ต้องไม่ซ้ำ/สับสนกับ module อื่น → rename `Market Data > Dashboard` เป็น `Market Overview` (BOR-010)
   - **Label vs internal key แยกกัน:** display label เปลี่ยนได้ แต่ internal keys คงเดิมเพื่อจำกัด blast radius —
     permission key (`market.dashboard.view` ~19251), list key (`market-dashboard` จาก `getMarketListKey`),
     body mode class (`market-dashboard-mode`) ไม่ rename; BOR-010 ต้อง inventory จุด compare `=== "Dashboard"` ทั้งหมดก่อนแก้
     (navGroups ~17916, defaults ~20464/20567, `getMarketListKey` ~21293, renderModule ~31741/31775,
     `renderMarketData` ~39127+, `data-market-back` ~46774/46782, summary cards ~37729+, tests `qa-bo-006`)
   - Alias ที่เลิกใช้: `"Alert List"` (→ `Watch Alert List`), `"Catalog"` (→ `Brands & Models`, เก่าที่ ~36895/37309) — canonical เดียวเท่านั้น
3. **Modal title = English** สำหรับ surface ที่อยู่ใน named scope — pattern canonical:
   `<Entity> Detail`, `<Verb> <Entity>` (เช่น `Add Category`, `Edit Category`, `Reorder Categories`), `Confirm <Verb> <Entity>`, `<ID> : <Name>` สำหรับ entity header
   - Named fix (BOR-009): Categories surface — `รายละเอียดหมวดหมู่` → `Category Detail`, `เพิ่มหมวดหมู่` → `Add Category`,
     `แก้ไขหมวดหมู่` → `Edit Category`, `จัดเรียง Category` → `Reorder Categories` (ปรับทั้ง modal title และปุ่ม/`aria-label` ที่สื่อชื่อเดียวกันในหน้า Categories)
   - ⚠️ หมายเหตุ scope: modal title ภาษาไทยอื่นในระบบ (เช่น `ยืนยันการปิดรายงาน`, `ยืนยันการเผยแพร่`) เป็น existing convention —
     ไม่อยู่ใน named scope ของ baseline; หากต้องการ normalize ทั้งระบบให้เสนอ Scope Change ไม่ใช่ฝืนแก้ใน BOR-009
4. **Breadcrumb & back label** — crumb format คง `<Section TH> / <Module EN> / [<Sub EN>] [/ <Detail type> / <ID>]`;
   back button canonical label = `กลับไป <destination label>` (Thai verb + English label — pattern เดิมส่วนใหญ่);
   `Back to …` ของ Market detail (~37572) เป็น observed divergence → ให้ BOR-003 ตัดสินว่าอยู่ใน coverage หรือ flag เป็น variation
5. **Detail head / page title** — `#page-title` = English page type (`User Detail`, `Report Detail`, `Alert Detail`, `Request Detail`);
   detail head pattern `<ID> : <Display Name>` + status pills (คงเดิม); entity ID ใช้ uppercase prefix เดิม (`U-`, `AST-`, `WAL-`, `DEL-`, `ADM-`, `DLV-`, `AUD-`, `RCO-`, `POL-`)
6. **Section headers เป็นภาษาไทย** (`การดำเนินงาน` / `งานตรวจสอบและบริการ` / `เครื่องมือ & รายงาน`) — คงเดิม ไม่เปลี่ยนใน scope นี้

---

## 5. Reconcile กับ Test Baseline (บังคับ — ตาม model ของ BOR-001 §4)

- `tests/qa-bo-009-market-demand.spec.js` — มี test ที่เดินผ่าน `goToMarketDemand(page, "Watch Alert List")` และ assert crumb
  `งานตรวจสอบและบริการ / Market Demand / Watch Alert List` + test 21 (`View All → Watch Alert List`) — BOR-007 เปลี่ยนเฉพาะ
  row WAL-1440 (entity link → detail); `View All` ต้องยังลง list; test ที่ assert sub active ต้องเจอ `data-sub="Watch Alert List"` active (ไม่ใช่ alias)
- `tests/qa-bo-006-market-data.spec.js` — assert `data-sub='Dashboard'`, crumb `การดำเนินงาน / Market Data / Dashboard`,
  `#page-title` = `Dashboard` (test 1,2,5 และ navigation assertions อื่น) — BOR-010 rename ต้องอัปเดต assertions เหล่านี้เป็น test-baseline update
  พร้อมกันในงานเดียว (ห้ามทิ้ง test แดง); internal keys ไม่เปลี่ยนตาม C.2
- `tests/qa-bo-005-content-management.spec.js` — test ~760/793/820 assert modal title `รายละเอียดหมวดหมู่`, `เพิ่มหมวดหมู่`, `แก้ไขหมวดหมู่`
  — BOR-009 ต้องอัปเดตเป็น English titles ตาม C.3 ในงานเดียวกัน
- `tests/qa-bo-019a-my-account.spec.js` test 4 — assert ไม่มี nav item active เมื่ออยู่ My Account และ `.admin-box` แสดง active แทน — คงเดิม (Contract A.5)
- `tests/qa-bo-001-auth-dashboard.spec.js` test 54/55 — Dashboard active state และการเปลี่ยน active เมื่อคลิก metric card (module jump) — คงเดิม
- DEL-PTO-006 contract เดิม (Request Detail → User Detail → back กลับ Request Detail) — BOR-008 เปลี่ยนเฉพาะ active state เป็น destination-owned (Contract A.1);
  back context เดิมต้องไม่พัง — regression check ใน BOR-012
- Manual QA sequence สำหรับ BOR-012: sidebar nav → detail → back (context + filter คง), deep link entity → detail (active ปลายทาง + back กลับต้นทาง),
  jump ข้าม module (filter reset), My Account (ไม่มี nav active)

---

## 6. Protected Impact & Scope Guard

- Contract นี้ใช้เป็นมาตรฐานสำหรับงานแก้ใน **named scope ของ baseline เท่านั้น**: WAL-1440 → Alert Detail,
  Account Deletion → User Detail (active state + back context), Categories modal title, Market Data > Dashboard → Market Overview
- หน้าที่แตะใน scope: Market Demand (Demand Overview mini table + Watch Alert Detail path), Account Deletion (Request Detail → User Detail path),
  User Management (User Detail render path ร่วม), Content Management (Categories modals), Market Data (sub label + surfaces ที่แสดงชื่อ)
- กฎ Contract A/B อธิบายพฤติกรรมที่ถูกต้อง — ห้ามนำไป refactor active-state/back logic ของหน้าอื่นที่ไม่ได้อยู่ใน coverage list ของ BOR-003
- หากพบจุดแก้เกิน named scope (เช่น ต้องเปลี่ยน `updateActiveNav`/`jumpToModule` โครงกลาง หรือแก้ nav ทุกจอ) → หยุดและเสนอ Scope Change ตาม baseline policy
- Sidebar structure/IA change (Option B recommendation ของ audit Objective 3) **อยู่นอก mission นี้** — แยกเป็น mission ถัดไปตาม baseline Out of Scope

---

## 7. Handoff ให้ Task ถัดไป

- **BOR-003**: ใช้ตารางจุดไม่ตรง contract ใน §1 + Contract A–C เป็นเกณฑ์นับ fix coverage; ตัดสินประเด็นค้าง —
  `Back to …` label ของ Market (C.4), `jumpToModule` ไม่ reset back stack (B.6), empty-state copy flag จาก BOR-001
- **BOR-007**: implement WAL-1440 row → `renderWatchAlertDetail("WAL-1440")` พร้อม push source context (Demand Overview) ตาม B.1/B.2 และใช้ canonical sub `Watch Alert List` (A.3)
- **BOR-008**: implement destination-owned active state ใน `renderUserDetailPageSpec` path ที่มาจาก deletions (set `activeModule` ปลายทาง; back คง DEL-PTO-006)
- **BOR-009**: rename Categories modal titles + ปุ่มที่เกี่ยวเป็น English ตาม C.3 พร้อม test-baseline update
- **BOR-010**: rename `Dashboard` sub → `Market Overview` ตาม C.2 (inventory compare points ก่อนแก้) พร้อม test-baseline update
- **BOR-012**: regression เทียบ Contract A–C (active state, deep link, back context, filter persistence, naming surfaces)
- **BOR-014**: sync กฎที่ล็อกแล้วเข้า `BackOffice/BO_UI_UX_STANDARD.md` และเอกสารที่เกี่ยวข้องตามผล remediation จริง

---

## References

- `Prototypes/bo-prototype.html` — `navGroups` (~17909), `navParentByModule`/`defaultSubByModule` (~17928/17941), `updateActiveNav()` (~46114),
  `syncExpandedNavForModule()` (~30593), back stack (~20424–20591), `renderModule()` (~31688), `jumpToModule()` (~35969),
  nav/jump click handlers (~46660–46870), `data-wa-alert-row` (~38108), `data-user-open` (~29106/47646),
  `renderUserDetailPageSpec` (~31475), `renderWatchAlertDetail` (~38782), `getSubNavDisplayLabel` (~21424),
  filter persistence (~21334–21408), Categories modal titles (~39650/41993/42052), market `"Dashboard"` compare points (~17916/20464/20567/21293/31741/36136+/39127+/46774)
- `docs/bo-modal-empty-state-contract.md` — BOR-001 contract (รูปแบบเอกสาร + close policy/focus rules ที่เกี่ยวกับ nav layer)
- `deliverables/bo-prototype-audit-objective-1/system-coverage-audit.txt` — WAL-1440 confirmed defect
- `deliverables/bo-prototype-audit-objective-2/cross-module-ui-consistency.txt` — Categories modal title + modal footer order
- `deliverables/bo-prototype-audit-objective-3/navigation-information-architecture.txt` — DEL-033 → U-1104 finding, Market Overview, Option B, destination-owned active state, permission visibility
- `BackOffice/BO_UI_UX_STANDARD.md`, `PROTECTED_SCREENS.md` — standard/protected scope policy
- Mission `1e359966` Approved Baseline — Scope, Protected Approval Clause, Acceptance Criteria
