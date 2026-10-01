# BO Shared Remediation — Fix Coverage & Protected Impact

เอกสาร coverage ของ Mission "BO Shared UI, Accessibility & Navigation Remediation" (mission `1e359966`, task `BOR-003`)
ล็อก **ขอบเขตจุดแก้จริง** จาก contract ทั้งสองฉบับ (`docs/bo-modal-empty-state-contract.md`, `docs/bo-navigation-naming-contract.md`)
และ audit findings ของ Mission Audit `1800d8aa` — เป็น input บังคับให้ BOR-004 (filter clipping), BOR-005 (modal consistency),
BOR-006 (focus management), BOR-007–010 (named module fixes) ก่อนเริ่ม implementation

- Status: Implemented & verified — fix points ทั้งหมด implement แล้วใน BOR-004–010 + BOR-006a และผ่าน regression BOR-011/012/013 (0 fail); Scope Change เพิ่มเติมและ deviation ที่อนุมัติแต่ไม่ได้ implement ระบุใน §7
- จุดที่อยู่ในเอกสารนี้ = scope ที่อนุญาตให้แก้; จุดนอกเอกสารนี้ = ห้ามแตะ (protected ตาม `AGENTS.md` / `PROTECTED_SCREENS.md`)
- เอกสารนี้ไม่ได้แก้ prototype ใด ๆ — เป็นการออกแบบ scope เท่านั้น

---

## 1. วิธีนับจุดแก้ (Method)

- นับที่ **จุดโค้ดที่ต้องแก้จริง** (template block / shared function / CSS rule) ไม่ใช่นับจำนวน modal ที่ render ออกมา
  — เช่น template เดียวที่ใช้ render หลาย action variants (Suspend/Ban/Restore) นับเป็น 1 จุดแก้ แต่ระบุ surfaces ที่ได้ผล
- ทุกจุดถูก verify ด้วยการอ่านโค้ดจริงใน `Prototypes/bo-prototype.html` แล้ว (เลขบรรทัดเป็น ~ ตำแหน่ง ณ commit ปัจจุบัน)
- Scan รวม: `showUserActionModal(` 62 call sites (+1 definition), action-row containers 65 blocks,
  `.layout > .panel` overflow rules ทุก body mode, `.filters` injection sites 47 จุด

---

## 2. Fix Coverage — Contract A: Modal Action Order (Cancel → Confirm)

**Fix points: 12** — template blocks ที่มี footer เรียง Confirm ก่อน Cancel (DOM order = visual order ผิด contract)

| # | ตำแหน่ง ~บรรทัด | Modal / Surface | Module (protected screen ที่แตะ) | In clause? |
| --- | --- | --- | --- | --- |
| A1 | 22887 | Asset Report status/close confirm | Asset Mgmt > Reported Assets | ✅ shared modal changes |
| A2 | 24011 | Asset Hide (ซ่อนชั่วคราว) | Asset Mgmt > Asset Detail | ✅ shared modal changes |
| A3 | 24070 | Asset Delete Post (ซ่อนถาวร) | Asset Mgmt > Asset Detail | ✅ shared modal changes |
| A4 | 24129 | Asset Restore Visibility | Asset Mgmt > Asset Detail | ✅ shared modal changes |
| A5 | 28217 | Admin Account action modal (Suspend/Reactivate/Unlock/Archive) | Settings > Admin Accounts | ✅ shared modal changes |
| A6 | 28299 | Admin Change Role confirm | Settings > Admin Accounts | ✅ shared modal changes |
| A7 | 30569 | User action modal (Suspend/Ban/Restore/… ทุก user action) | User Mgmt > User Detail | ✅ shared modal changes |
| A8 | 30919 | Deletion action modal (คืนบัญชี / ปฏิเสธคืนบัญชี) | Account Deletion > Request Detail | ✅ shared modal changes |
| A9 | 31244 | User Report status confirm | User Mgmt > Reported Users | ✅ shared modal changes |
| A10 | 37669 | Market Sync modal (Start Sync/Cancel, Retry/Close, View History/Close states) | Market Data > Sync History | ✅ shared modal changes |
| A11 | 44695 | Board Report action confirm | Content Mgmt > Reported Articles | ✅ shared modal changes |
| A12 | 45314 | Reported Comment action confirm | Asset Mgmt > Reported Comments | ✅ shared modal changes |

หมายเหตุ:

- Contract ฉบับ BOR-001 list ไว้ 10 จุด — การ verify จริงพบเพิ่ม 2 จุด (A5, A8) ทั้งคู่อยู่บน protected screens
  (Admin Accounts, Account Deletion) แต่เข้า named clause "shared modal changes" เพราะเป็น action-row order เดียวกัน
- **ออกจาก coverage:** page footer ของ `renderArticleEditorPage` (~43749 — Preview / Save / ยกเลิก)
  เป็น page-level action row ไม่ใช่ modal footer → Contract A scope ถึงเฉพาะ modal; บันทึกเป็น observation
  ถ้าอยาก align ให้เสนอ Scope Change (แตะ Article Editor — protected Content Mgmt)
- Market Sync (A10) เป็น locked long-running modal — แก้เฉพาะลำดับปุ่มในแต่ละ state; guard ระหว่าง running คงเดิมตาม Contract B row 4
- Action rows อีก ~53 blocks ที่ scan แล้วไม่มีปัญหา: canonical อยู่แล้ว, ปุ่มเดียว, หรือเป็น detail-page action
  (ไม่ใช่ confirm/cancel pair) — ไม่ต้องแตะ

## 3. Fix Coverage — Contract B: Modal Close Policy

**Fix points: 1 shared handler + ~16 opt-in surfaces**

Close paths ปัจจุบันทำงานที่ 2 จุดกลาง:

- Delegated click handler (~46380) — `[data-user-action-modal-close]` ทำงานทุก modal แล้ว ✅;
  backdrop click ผูกเฉพาะ `.audit-log-detail-modal`
- ESC handler (~49997) — ผูกเฉพาะ `.audit-log-detail-modal`

การแก้ = เพิ่ม opt-in marker (เช่น class/`data-` attribute) บน read-only surfaces แล้วขยาย handler ทั้งสองให้ครอบ
— ไม่ใช่การเปิด backdrop/ESC ทั้งระบบ (form/confirm ต้องกัน accidental close ตาม Contract B)

Surfaces ที่ verify เป็น read-only / acknowledge → opt-in ให้ backdrop + ESC:

| # | Modal | Module | ประเภท |
| --- | --- | --- | --- |
| B1 | `renderAssetCommentsModal` (~22488) View all comments | Reported Comments | read-only |
| B2 | `renderAssetReportDetailModal` (~22546) | Reported Assets | read-only |
| B3 | `renderAssetPurchaseHistoryModal` (~23111) | Asset Detail | read-only |
| B4 | `renderAssetSaleRecordModal` (~23203) | Asset Detail | read-only |
| B5 | `openDeliveryLogDetailModal` (~24790) | Settings > Delivery Logs | read-only |
| B6 | `openPolicyPreviewModal` (~35422) | Settings > Policy & Versioning | preview |
| B7 | `openPolicyVersionViewModal` (~35545) | Settings > Policy & Versioning | read-only |
| B8 | `openSupportCenterPreviewModal` (~35688) | Settings > Support Center | preview |
| B9 | WA "View All" modal ใน `renderWatchAlertOverview` (~38034) | Market Demand > Demand Overview | read-only |
| B10 | SI "View All" modal ใน `renderSearchInsights` (~38325) | Market Demand > Search Insights | read-only |
| B11 | `openOptionViewModal` (~40243) Option detail view | Option Master | read-only (มีปุ่มนำทาง Edit/Audit) |
| B12 | `openOptionAuditLogModal` (~41914) | Option Master | read-only |
| B13 | `openOptionGroupAuditLogModal` (~41680) | Option Master | read-only |
| B14 | `renderCategoryDetailModal` (~42029) Category Detail | Content Mgmt > Categories | read-only |
| B15 | `openArticlePreviewModal` (~43094) | Content Mgmt > Articles | preview |
| B16 | `renderBoardReportContentModal` (~44784) View article content | Reported Articles | read-only |

Surfaces acknowledge ปุ่มเดียว (`renderCategoryActionBlockedModal` ~42252, `openArticleCompactAlertModal` ~43068)
— ปิดด้วย backdrop/ESC ได้ไม่เสี่ยง ให้ opt-in รวมกับกลุ่ม read-only ได้ (ตัดสินละเอียดใน BOR-005)

คงเดิม (ไม่แตะ):

- `.audit-log-detail-modal` — canonical อยู่แล้ว (ปิด X / backdrop / ESC) — test `qa-bo-014d` test 9 assert ไว้ ห้ามถอด
- `market-reference-drawer` — drawer variant; ตรวจพฤติกรรมปัจจุบันใน BOR-005 ถ้าใช้ shared container จะได้ backdrop/ESC ตาม opt-in เดียวกัน
- Form/confirm/destructive modals ทั้งหมด (~44 surfaces) — X + ยกเลิก เท่านั้น (กันข้อมูลสูญหาย)
- Market Sync running state — locked ตาม Contract B row 4
- ESC guard: ปิด modal ก่อน ไม่ตกไป `setNavOpen(false)` ใน event เดียวกัน (Contract B ข้อ 2)
- Mobile ≤460px: drawer/modal กินเต็ม viewport → backdrop area ไม่มี → backdrop-close N/A โดยนิยาม (Contract B ข้อ 1)

## 4. Fix Coverage — Contract C: Keyboard Focus

**Fix points: 2 shared functions** (`showUserActionModal` ~30372 เปิด + `closeUserActionModal` ~30392 ปิด)
ครอบ shared modal ทั้งระบบ (62 call sites + drawer variants) — ไม่มี per-modal code

1. **Initial focus** แยกตามประเภท modal (Contract C.1):
   - Form → ฟิลด์แรกที่กรอกได้ — **ข้อยกเว้นที่มีอยู่แล้วและต้องไม่พัง:** Change Password focus `#my-account-pw-current`
     (test `qa-bo-025`/`qa-bo-018` assert `document.activeElement` อยู่แล้ว)
   - Confirm/destructive → ปุ่มยกเลิก
   - Read-only/drawer → ปุ่ม X หรือ heading
2. **Focus trap** — Tab/Shift+Tab วนใน modal; release ทุก close path ห้ามค้าง (C.2/C.5)
3. **Restore focus** — กลับ opener; opener หาย → fallback main heading (C.3)

Reconcile กับ test baseline (บังคับ):

- `tests/qa-bo-018-mission1-scoped-smoke.spec.js` test 2 — ชื่อ test พูดถึง "ไม่ focus trap" แต่ assert จริงคือ
  ปิด/เปิดใหม่ได้และหน้า interactive → trap ใหม่ต้องไม่บล็อก close path ใด; ถ้าต้องปรับชื่อ/cmnt test ทำใน BOR-006 เป็น test-baseline update
- `tests/qa-bo-014d-audit-log-detail-modal.spec.js` test 9 — canonical 3-way close ของ drawer คงเดิม
- `tests/qa-bo-025` + `qa-bo-018` — initial-focus targets เดิมห้ามเปลี่ยน

จุดที่อยู่นอก coverage: ฟิลด์ focus ในหน้า page-level (Article editor, Support Center form) — ไม่ใช่ modal

## 5. Fix Coverage — Filter Dropdown Clipping

**Fix points: 11 list surfaces** — root cause เดียวกันทั้งหมด

Root cause: `.custom-select-menu` เป็น `position:absolute` ใต้ `.custom-select` → `.filters` → `.panel`
ที่มี `overflow:hidden` (desktop) / `overflow-x:auto` — เมื่อ list ว่างหรือสั้น panel หด เมนูที่เปิดลงล่างถูกตัดที่ขอบ panel;
บนจอแคบเมนูล้นขอบขวาก็ถูกตัด (audit confirm "dropdown clipping ข้าม module" ที่ 390/768/1280/1440px)

Precedent ที่มีในโค้ดแล้ว (ใช้ตามนี้ ห้ามคิด pattern ใหม่):

- List ใหม่ที่แก้แล้ว (deletion/delivery-log/admin-account/role list): `.panel { overflow: visible }` + `#table { overflow-x: auto; overflow-y: visible }`
- Row action menus: fixed positioning แบบ `.row-menu-list.is-fixed` (JS คำนวณ ~46143, CSS ~5377)

| # | Surface | body mode / panel rule ~บรรทัด | Module (protected) |
| --- | --- | --- | --- |
| F1 | User Accounts | `user-accounts-mode` 7377 | User Mgmt |
| F2 | Reported Users | `user-list-mode` 7383 | User Mgmt |
| F3 | Reported Assets | `user-list-mode` 7383 | Asset Mgmt |
| F4 | Reported Comments | `user-list-mode` 7383 | Asset Mgmt |
| F5 | Asset List | `asset-list-mode` 1557 (+@1180 12681) | Asset Mgmt |
| F6 | Articles | `asset-list-mode`+`article-list-mode` | Content Mgmt |
| F7 | Categories | `asset-list-mode`+`category-list-mode` | Content Mgmt |
| F8 | Reported Articles | `reported-board-mode` 1620 (+asset-list/user-list) | Content Mgmt |
| F9 | Offer List | `offer-list-mode` 1613 | Offer Mgmt |
| F10 | Sync History | `market-list-mode` non-dashboard 2503/2595 | Market Data |
| F11 | Watch Alert List | `watch-alert-list-mode` 2113 (2-class rule ชนะ `watch-alert-mode` visible 3100) | Market Demand |

ไม่ affected / ไม่แตะ:

- Dashboard (`dashboard-mode` 1219 hidden แต่ `.filters` ว่าง — ไม่มี dropdown)
- Market > Dashboard(Market Overview) — panel visible (2508) + ไม่มี filters; Brands & Models — search-only ไม่มี custom-select
- Option Master (group list/detail override visible 1578/1587), Account Deletion, Delivery Logs, Admin Accounts,
  Roles & Permissions — fixed pattern แล้ว
- Policy & Versioning / Version History (16062/16169) — ไม่มี filter bar
- Audit Log desktop — ไม่มี base `overflow:hidden` บน panel; @media ≤760px มี hidden (9523) → ตรวจใน responsive QA
  (BOR-011/013) แก้เฉพาะเมื่อ reproduce ได้จริง
- Support Center, detail pages ทั้งหมด — panel visible แล้ว

หมายเหตุ breakpoint: @media ≤1180px (12644/12681) และ ≤760px (14476) ยัง re-hide panel ของ asset/reported-board/user-list
— การแก้ต้องครอบทั้ง base rule และ media override; ส่วน mobile rules ของหน้า fixed-then-locked (13773–14067)
ถือว่า intentional สำหรับ card layout — verify ใน QA เท่านั้น

## 6. Fix Coverage — Navigation & Naming

Named items จาก baseline (มี execution task แล้ว — list เพื่อ traceability):

| Item | Fix task | จุดแก้ ~บรรทัด | Protected surface |
| --- | --- | --- | --- |
| WAL-1440 → Alert Detail (entity deep link + push source context + canonical sub `Watch Alert List`) | BOR-007 | `data-wa-alert-row` ~38108, handler ~46667 | Market Demand (Demand Overview + Alert Detail) |
| DEL-033 → User Detail destination-owned active state (back คง DEL-PTO-006) | BOR-008 | `data-user-open` ~29106/47646, `renderUserDetailPageSpec` ~31475 | Account Deletion + User Mgmt (shared render path) |
| Categories modal titles → English | BOR-009 | ~39650/41993/42052 | Content Mgmt > Categories |
| `Dashboard` sub → `Market Overview` | BOR-010 | `navGroups` ~17916 + compare points ~20464/20567/21293/31741/36136+/39127+/46774 | Market Data |

### Flag decisions (3 จุดค้างจาก BOR-001/002)

**Flag 1 — Market `Back to …` label divergence (~37360/37395/37572):**
ตัดสิน **IN COVERAGE — ผูกเข้า BOR-010** (อนุมัติแล้วตอนตรวจรับ BOR-003). เหตุผล: Contract C.4 ล็อก canonical
`กลับไป <destination label>` (Thai verb + English label) และ BOR-010 อยู่ใน named clause
"Market Data > Dashboard → Market Overview" ซึ่ง approve การแตะ naming surfaces ของ Market Data แล้ว —
เปลี่ยน 3 label เป็น `กลับไป Brands` / `กลับไป ${brand.name}` / `กลับไป ${pageLabel}` blast radius เล็กและอยู่ module เดียวกัน

**Flag 2 — `jumpToModule` ไม่ reset back stack (~35969):**
ตัดสิน **IN COVERAGE — ผูกเข้า BOR-007**. Contract B.6 ล็อกว่า cross-module jump ต้องสะอาดเหมือน sidebar nav
(`resetBackNavigation()` ที่ ~46716); จุดแก้คือเพิ่ม `resetBackNavigation()` ใน `jumpToModule` — call sites ทั้งหมด
(`data-module-jump` ~46675, market sync → Sync History ~46663) ลงที่ list = context ใหม่ เหมาะกับ reset.
Entity deep link (Contract B.1) ต่างหาก — push source context ผ่าน `pushBackNavigationContext` ไม่ใช่ jumpToModule
→ BOR-007 implement แยกสำหรับ WAL-1440. Caveat ที่ต้อง verify ใน BOR-012: ไม่มี jump path ใดพึ่ง stack ค้างอยู่

**Flag 3 — Empty-state copy ไม่มี execution task:**
ตัดสิน **SCOPE CHANGE — ไม่รวมใน mission นี้**. เหตุผล: (1) canonical title `ไม่พบข้อมูล` ตาม Contract D อยู่นอก
named clause ทั้งหมด (ไม่ใช่ filter/modal/focus/nav/naming); (2) copy ที่เบี่ยงอยู่บนหน้า protected ที่ lock แล้ว
(Audit Log / Delivery Logs / Admin Accounts); (3) Contract D เองมีข้อยกเว้น intentional variation ที่อาจครอบ
entity-specific titles — ต้องให้ PO/reviewer ตัดสินว่าจะ normalize หรือยกเว้น ไม่ใช่ฝืนแก้.
Inventory ที่พบ (input ให้ Scope Change ถ้าอนุมัติ): `ไม่พบ audit event` (~24597), `ไม่พบ delivery log` (~24724),
`ไม่พบ admin account` (~27794) — subtitle `ลองปรับคำค้นหรือตัวกรอง แล้วลองใหม่` ตรง canonical อยู่แล้ว;
`ไม่พบข้อมูล` canonical ใช้อยู่ทั่วระบบ (~31345/31403/39246/39896/40048/41970/44211/44535/44842/45523/45577/45708)

## 7. Out of Scope / Scope Change Register

| รายการ | เหตุผล |
| --- | --- |
| Empty-state copy normalization (Flag 3) | นอก named clause + อยู่บนจอ lock + มีข้อยกเว้น intentional variation ที่ต้องให้ reviewer ตัดสิน |
| Article Editor page footer order (~43749) | Page-level row ไม่ใช่ modal — Contract A ไม่ครอบ; จอ Content Mgmt protected |
| Normalize Thai modal titles อื่นในระบบ (`ยืนยันการปิดรายงาน` ฯลฯ) | Contract C.3 ระบุชัดว่า existing convention อยู่นอก named scope — มีเฉพาะ Categories ที่ approve |
| `overflow:hidden` mobile rules ของจอที่ fixed-then-locked (13773–14067) | intentional สำหรับ card layout — verify-only ใน QA |
| `.filters{overflow:hidden!important}` บน detail pages (8002/8667/9098) | detail state-block context ไม่ใช่ filter bar — ไม่มี dropdown อยู่ข้างใน |
| Sidebar structure/IA changes, audit finding groups อื่น, Module Phase 2 | Baseline Out of Scope |
| `.wa-alert-filter-bar` collapse rule @761–1365px (~12364) | Scope Change อนุมัติใน BOR-004 — grid 7 tracks (min ~1020px) ล้น panel เมื่อ viewport <1366 ทำ reset button + date inputs หลุดจอ (เคยถูก `overflow:hidden` ปิดไว้); แก้ด้วย flex-wrap: filter 4 ตัวแถวบนเต็มกว้าง / sort + date range ยืดเต็ม + reset ต่อท้าย แถวล่าง |
| `.audit-filter-bar` collapse @761–1365px (~12380; rules ≤1180/≤980 เดิมเก็บเป็น fallback) | Scope Change อนุมัติใน BOR-004 — date input ชิดขอบจอทำ native picker ล้น (browser คุมตำแหน่ง picker ปรับ CSS ไม่ได้) → ย้าย input ออกจากขอบด้วย flex-wrap: search/module/risk แถวบนเต็มกว้าง / sort + date range ยืดเต็ม + reset ต่อท้าย แถวล่าง |
| `.filters .custom-select-menu` max-height 280→220px (~7145) | Scope Change อนุมัติใน BOR-004 — dropdown ยาวชิดขอบล่าง viewport; ลดความสูงเฉพาะ filter context (เมนูมี scrollbar ในตัวอยู่แล้ว) ไม่แตะ select ใน modal |
| ลบ footer `ปิด` ใน `openOptionViewModal` (B11, ~40274) — footer เหลือ `ดู Audit Log` + `Edit` | Scope Change อนุมัติใน BOR-005 — redundant close control ซ้ำกับ X + ESC/backdrop ที่ opt-in แล้ว; B11 เป็น read-only surface เดียวที่มี footer close button ทำให้ deviate จาก 15 surfaces อื่น — ลบแล้ว consistent กว่าเดิม (close ยังมี X/ESC/backdrop) |
| Phone preview close position + modal focus ring บน mouse | Scope Change อนุมัติใน BOR-006a (พบระหว่างตรวจรับ BOR-009) — `.board-report-phone-preview-close` แพ้ `.user-action-close{position:relative}` ด้วย specificity เท่ากัน → bump เป็น `.board-report-phone-preview .board-report-phone-preview-close`; และถอด `focusVisible:true` จาก shared initial/restore focus → ring/tooltip โชว์เฉพาะ keyboard flow ตาม `:focus-visible` heuristic |
| `openAccountDeletionRequest` ไม่ push back context (~31167) | แก้ใน BOR-008 ภายใต้ named clause "Account Deletion → User Detail" — pre-existing gap ทำ User Detail → Request Detail → back หลุดไป User List; เพิ่ม `pushBackNavigationContext()` ให้ back กลับ User Detail + `syncExpandedNavForModule("deletions")` ใน `renderDeletionDetail` กัน accordion ต้นทางค้างกางตอน back |
| Market back labels `Back to …` (Flag 1 — ~37518/37553/37730) | อนุมัติ IN COVERAGE ผูก BOR-010 แต่ implementation หลุดไป → ตัดสินใน BOR-014 และ **แก้แล้วใน BOR-010a**: `กลับไป Brands` / `กลับไป <brand>` / `กลับไป <pageLabel>` ตาม Contract C.4 — Option Master `Back to Option Groups` ยกเว้นถาวรเป็น convention เดิม |

## 8. Protected Impact Summary

ทุก fix point แตะ protected screen — ครอบโดย named clause ดังนี้:

| Named clause | Fix points ที่ครอบ |
| --- | --- |
| Shared filter changes (ใน coverage ที่เอกสารนี้ล็อก) | F1–F11 |
| Shared modal changes (ใน coverage) | A1–A12, close-policy opt-in B1–B16 |
| Shared focus changes (ใน coverage) | shared open/close functions — ทุก modal surface |
| WAL-1440 → Alert Detail | BOR-007 (+ jumpToModule reset per Flag 2) |
| Account Deletion → User Detail | BOR-008 |
| Categories modal naming | BOR-009 |
| Market Data > Dashboard → Market Overview | BOR-010 (+ back labels per Flag 1) |

กฎคงเดิม: จุดแก้ใดที่พบเพิ่มระหว่าง implement และไม่อยู่ในตารางนี้ → หยุด เสนอ Scope Change ตาม baseline policy
ห้ามถือว่าเอกสารนี้เป็น blanket approval บน protected screens

## 9. Implementation Status (อัปเดตใน BOR-014)

| Task | ผลลัพธ์ |
| --- | --- |
| BOR-004 | done — F1–F11 แก้ด้วย precedent pattern (panel overflow visible + table scroll) ครอบ base rule + media overrides; +3 Scope Changes ใน §7 (filter-bar wrap ×2, dropdown max-height) |
| BOR-005 | done — A1–A12 เป็น Cancel→Confirm; B1–B16 + 2 acknowledge surfaces + market-reference/audit drawers opt-in `data-modal-dismissible`; +B11 footer Scope Change (§7) |
| BOR-006 | done — shared initial focus ตามประเภท modal + focus trap + restore ผ่าน shared open/close functions; แปลง 7 bypass sites เป็น `showUserActionModal`; ลบ blur-after-close ของ BOR-005; qa-bo-018 test 2 baseline update |
| BOR-006a | done — phone preview close position + keyboard-only focus ring (Scope Change §7); qa-bo-018/_bor006 baseline update |
| BOR-007 | done — WAL-1440 → Alert Detail โดยตรง + push source context (Demand Overview) + `jumpToModule` reset back stack (Flag 2); canonical sub `Watch Alert List` |
| BOR-008 | done — destination-owned active state (`users`/`User Accounts`) + deletions accordion sync + `openAccountDeletionRequest` back-context push (§7) |
| BOR-009 | done — Categories modal titles English 7 จุด (Category Detail/Add/Edit/Reorder) + qa-bo-005 baseline update |
| BOR-010 | done — `Market Overview` rename ~25 compare points + perm matrix + qa-bo-006 baseline; internal keys คงเดิม; ⚠️ Flag 1 back labels ไม่ได้ implement → ต่อใน BOR-010a (§7) |
| BOR-010a | done — Flag 1 fixed: Market detail back labels → `กลับไป Brands` / `กลับไป <brand>` / `กลับไป <pageLabel>` (~37518/37553/37730) ตาม Contract C.4; verify _bor010 20/20 + _bor012 314/314 |
| BOR-011/012/013 | done — regression ผ่านครบ 0 fail ครอบ filter/modal/focus/navigation + responsive 4 viewports + manual QA; ไม่พบ finding |

---

## References

- `Prototypes/bo-prototype.html` — modal container ~17841, `showUserActionModal` ~30372, `closeUserActionModal` ~30392,
  close/ESC handlers ~46380/~49997, `.custom-select*` CSS ~7105–7160, panel overflow rules §5,
  `backNavigationStack` ~20424–20591, `jumpToModule` ~35969, market back buttons ~37360/37395/37572
- `docs/bo-modal-empty-state-contract.md` — Contract A–D (BOR-001)
- `docs/bo-navigation-naming-contract.md` — Contract A–C + named items (BOR-002)
- `tests/_bor005-modal-consistency.cjs`, `_bor006-focus.cjs`, `_bor006a-verify.cjs`, `_bor007-verify.cjs`,
  `_bor008-verify.cjs`, `_bor009-verify.cjs`, `_bor010-verify.cjs`, `_bor011-verify.cjs`, `_bor012-verify.cjs`,
  `_bor013-verify.cjs` — per-task verification + regression scripts
- `deliverables/bo-prototype-audit-objective-2/cross-module-ui-consistency.txt` — clipping/modal/empty-copy findings
- `AGENTS.md`, `PROTECTED_SCREENS.md` — protected screen policy
- Mission `1e359966` Approved Baseline — Scope, Protected Approval Clause, Task Creation Policy
