# FSP-017 — 04_ASSET_MANAGEMENT Update Evidence (add asset + statuses + purchase cost)

Date: 2026-10-21
Task: `a8394018` — "FSP-017 อัปเดต 04_ASSET_MGMT — add asset/statuses/purchase cost"
Scope: `FrontOffice/04_ASSET_MANAGEMENT_MODULE.md` เท่านั้น (rewrite ทั้งไฟล์) — sync ตาม `Prototypes/fo-flow/index.html` (read-only) + baseline 00_GLOBAL (session §7, gate §11, lifecycle §12, private §14) / 00_NAV §6.x (routes `create`/`portfolio`/`pfasset:{id}`/`soldhist`/`sold:{id}`/`sell:{id}`, back §6.7, entry matrix §7) / 02_FEED (post model + composer + own-post menu ที่ FSP-015a/b lock) / 03_SEARCH_FILTER (lifecycle matrix ที่ FSP-016 lock)
Gap source: `gap-FSP-002b-create-saved-wa.md` (asset mgmt conflicts) + `gap-FSP-003a-profile-portfolio.md` (portfolio/drawer sections) + `FSP-005-consolidated-gap-signoff.md`

Prototype anchors verified: `CF_TAGS`/`CF_LOCS`/`CF_CONDS`/`CF_BOXES`/`CF_SPECS`/`cfToday` ~15672–15695; `createHTML`/`cfPickerHTML`/`cfStep2HTML`/`cfPaneHTML`/`cfVal` ~15529–15879 (asset titles ~15542, `stt-opt` ~15850–15854, `vis-opt` ~15855–15859, drawer toggle ~15860–15867, `Add Asset` primary ~15871, cost pane ~15718–15725); `cfToPortfolio` ~15915–15926; `assetFromPost` ~15929–15939; `soldFromPost` ~15942–15958; `insertNewPost` ~15959–15990; `metaFromPost`/`openPostEdit`/`applyPostEdit` (drawer sync ~16095–16107) ~15992–16108; `PF_ASSETS`/`PF_SOLD`/`PFO_STATUS`/`PFO_CMP`/`PFO_SRC`/`PF_MINE` + `pfKind`/`pfTabPosts`/`findPost`/`pfGridPosts` ~16318–16609; `pfoEligible`/`pfoCur`/`pfoGL`/`pfoExp`/`pfoCmp`/`pfoHold`/`pfoDate` ~16348–16382; `pfoSimBar`/`PFO_SIMS`/`pfoRowHTML` ~16958–16975; `portfolioHTML` ~16976–17011; `pfassetHTML` ~17012–17051; `soldHistHTML` ~17052–17066; `soldDetailHTML` ~17067–17103; `sellFormHTML` ~17106–17121; `openSubOver`/`openSellForm`/`markAssetSold` ~17124–17149; profile `+`/`Add asset` entries (`data-mode="asset"`) ~16826/16852; `.pf-pfo` ~16887; `pm-own-sold`/`pm-own-soldview` ~13920–13935 + handlers ~20501–20507; composer `cf-share` asset/post modes ~20277–20332; `vis-opt`/`stt-opt` handlers ~20426–20433; `price`/`purchase`/`bought` input handlers ~19990–20010; `pane-done` cost block ~20404–20414; `sell-price` → `sell-gl` live ~20108–20120; `data-sell`/`sell-save`/`pe-err`/stack splice ~21684–21728; `dlg-delpost-go` ~20730–20744; `refreshPostViews` ~13938–13949; `GUEST_GATE_SEL`/`obGate` ~22997–23012; `pfo-more` dev-only ~16980/21654

## 1. What changed (section map)

| Section | Change |
| --- | --- |
| Header/§2 Objective | rewrite — จาก "asset = listing entity แบบ multi-step form + provenance" เป็น owner-private **My Assets drawer** (drawer-first composer asset mode, record+post link สองชั้น) |
| §3 Prototype Reference | **ใหม่ทั้งก้อน** — anchor index ครอบ composer constants/UI/drawer data/portfolio helpers/pages/entries/handlers + dead/tooling list (`pfo-more`/`PFO_SIMS`, `POST_DETAIL_CFG`, `PF_GFX_*`, `chsettings:{id}`) |
| §4 Master Alignment | rewrite — canonical statuses §9, visibility §10, gate §11, lifecycle §12, private §14, Add Asset = composer asset mode, routes §6.6, ไม่มีใน V1 (form แยก/status sheet/confirmations/option-master/provenance/payment) |
| §5 Scope | rewrite — In = Add Asset entries + asset-mode deltas + data model + transitions + Mark as Sold + Sale Record + purchase cost + portfolio/pfasset/soldhist/sold anatomy + delete semantics; Out = composer internals (02), menu anatomy (02), Post Detail (05), portfolio math (14), profile shell (06), WA internals (10), option-master model (future), provenance, BO moderation surfaces |
| §6 Screen Mapping | rewrite — 8 surfaces: create(asset)/portfolio/pfasset/sell/soldhist/sold/own-post menu rows/Member Sheet |
| §7 User States | rewrite — Guest (gated ทั้งหมดผ่าน own profile), Owner, Non-owner (ไม่มี asset surface เลย — ต่างจากเดิมที่มี "public asset" mental model), Blocked (N/A owner-only) |
| §8 User Flow | **rewrite ทั้งก้อน** — Add Asset 3 visibility paths + table, post→drawer save, status change via Edit info, Mark as Sold (2 entries), View sale record, portfolio browse, delete |
| §9 Business Rules | **rewrite ทั้งก้อน** — Asset Data Model (record+link table), Status Model, Visibility Matrix (canonical), Add Asset Entry, Asset Composer deltas, Spec Free-Text (**override option-master** — free-text ล้วน + cond 5/box 4 เท่านั้นที่เป็น options), Purchase Cost, Drawer Record (cfToPortfolio/assetFromPost/soldFromPost/sync), Status Change (Edit info stt-opt เท่านั้น), Mark as Sold, Sale Record (2 fields เท่านั้น), Sold Transition, Sold Record, Asset List, Asset Detail, Delete (orphan deviations), Private Data, BO moderation (contract), Lifecycle Impact table, **Deviations & Dead-Code Notes** (18 รายการ) |
| §10–12 Permission/Validation/Exception | rewrite — guest gate ตาม `GUEST_GATE_SEL`, validation เฉพาะที่ prototype มี (media≥1, purchase digits/date+done-block, sell price/date `pe-err`), missing-id `No data found`, `PFO_SIMS` states = contract |
| §13 Empty State | rewrite — copies จริงจาก `portfolioHTML`/`soldHistHTML`/profile all-tab |
| §14 Notification | rewrite — ไม่สร้าง notification; WA matched toast เฉพาะ `Post to feed` path |
| §15 Analytics | rewrite — contract event set (asset_*/portfolio_*) |
| §16 ACs | **rewrite ทั้งชุด** — AC-ASSET-MGMT-001–040 sequential (เดิม 001–055+ letter suffixes 007A–007H/…ลบทิ้ง — renumber; ไม่มี live cross-ref ดู §2) |
| §17 Related | +00_GLOBAL/00_NAV/02/05/06/10/13/14/15/16 links ตาม boundary ใหม่ |
| §18 Future | +structured spec options (option master + `ระบุเอง` model เดิมย้ายมาที่นี่เป็น contract), bulk upload, provenance, sale record extended fields, persistence, un-sold, delete cascade |

## 2. Cross-doc ref check (ก่อนปิดงาน)

| Check | Result |
| --- | --- |
| `AC-ASSET-MGMT` refs นอก 04 | `DOCUMENT_VERSION.md` เท่านั้น — historical changelog v1.8 (`AC-ASSET-MGMT-007G/007H` ส่วน `ระบุเอง` model) ไม่ใช่ live ref; renumber ปลอดภัย ✓ |
| `04_ASSET_MANAGEMENT` ใน docs อื่น | 02_FEED §5 Out อ้าง `Sale Record form + Sold history + portfolio drawer record` — resolve แล้ว (อยู่ใน scope 04 ใหม่ + math อ้าง 14); 00_NAV §6.1 อ้าง composer modes ตรง ✓ |
| Stale terms ใน synced baselines (00_GLOBAL/00_NAV/01/02/03/05) | grep `Add this asset`/`Asset added`/`Save sale history`/`Confirm sold out`/`Price on request`/`ระบุเอง`/`spec_options`/`Change Status` = **0 hits** — baselines ไม่มี stale contract ที่ spec ใหม่ทิ้ง ✓ |
| Stale terms ใน not-yet-synced modules | 06_PROFILE (`Add asset`/`Mark as sold` wording เดิม), 10_WATCH_ALERT (`spec_options`/`ระบุเอง` จาก v1.8) — flag FSP-019/021 ตามลำดับ ไม่แก้นอก scope ✓ |
| Stale terms ใน legacy docs | Master/PRD/Use_Cases/DEV checklist/QA checklist/`FSP-005-signoff`/gap docs ยังมี wording เดิม — historical/central docs → flag FSP-025/026/027 ✓ |
| Route names | `create`/`portfolio`/`pfasset:{id}`/`soldhist`/`sold:{id}`/`sell:{id}` ตรง 00_NAV §6.6 line 173 ทุกตัว ✓ |
| Status names | `Sale`/`Show`/`Hide`/`Sold` canonical ตรง 00_GLOBAL §9 + `post` kind แยกชัด ✓ |
| Lifecycle matrix | transitions เขียนให้ตรง 00_GLOBAL §12 + 03_SEARCH_FILTER matrix (FSP-016 lock) — sold หลุด search/WA canonical, `salePosts()` leak = defect note ไม่ใช่ spec ✓ |

## 3. Verification

| Check | Result |
| --- | --- |
| ไฟล์ที่แก้ | `FrontOffice/04_ASSET_MANAGEMENT_MODULE.md` เท่านั้น (+ evidence file นี้) — rewrite เต็ม ~602 บรรทัด ✓ |
| `git status --porcelain -- Prototypes/` | `M Prototypes/fo-flow/index.html` = diff เดิมของ task `716b8972` (password ≥8 — `git diff --stat` 9 lines verified ตอน FSP-016) — **งานนี้ไม่แตะ Prototypes/** ✓ |
| Copies ที่เขียนลง spec | ตรง prototype verbatim: `เพิ่มสินทรัพย์ใหม่`/`Add Asset`, `เขียนคำอธิบายสินทรัพย์…`/`Describe this asset…`, `โชว์`/`ซ่อน`/`โพสต์ลงฟีด` + sub-copy ทั้ง 3, `ขาย`/`โชว์`/`ซ่อน` stt-opt + sub-copy, `Cost details (private)` + privacy note, `ราคาซื้อ`/`วันที่ซื้อ`, `วันที่ซื้อไม่ถูกต้อง`/`Invalid purchase date`, `วันที่ซื้ออยู่ในอนาคตไม่ได้`/`Purchase date can't be in the future`, `รายการนี้อยู่ในประวัติการขายแล้ว`/`This item lives in your Sold history`, `บันทึกการขาย`/`Mark as sold`/`Save sale record`, `Sale price (THB)`/`Sale date`/`Expected gain`, `กรุณากรอกราคาขาย`/`Sale price required`/`กรุณาเลือกวันที่ขาย`/`Sale date required`/`วันที่ขายไม่ถูกต้อง`/`Invalid sale date`, `Sale recorded · moved to Sold history ✓`, `Saved to My Assets · posted to feed/shown on profile/private ✓`, `รายการที่ขายแล้ว`/`Sold item`, `ประวัติการขาย`/`Sold history` + desc note, `พอร์ตโฟลิโอ`/`Portfolio`/`Total invested`/`Private`/`มูลค่าตลาด`/`Market value unavailable`/`ต้นทุนซื้อของ N/M รายการ` + exclusion note, `รายละเอียดนาฬิกา`/`Asset`/`มูลค่า`/`Value`/`การลงประกาศ`/`Listing`/`ข้อมูลเฉพาะเจ้าของ`, `No data found` + portfolio empty desc, `Posted · shared to feed + My Assets ✓`, `Watch alert matched`, `Post updated`, `Post deleted`, `This post is no longer available`, `Join TukDaeng` ✓ |
| Add Asset semantics | 3 visibility paths → `PF_MINE` (show/hide) / `insertNewPost` (feed); `cfToPortfolio` เสมอ + `assetId` link; กลับ own profile; ไม่มี confirm/required นอก media ≥1 — ตรง `cf-share` ~20277–20317 ✓ |
| Status semantics | `stt-opt` เฉพาะ edit mode + drawer ON; `sold` guard ใน `applyPostEdit`; toggle OFF → `post` + splice + link sold คง; materialize `cfToPortfolio` เมื่อ ON ใหม่ — ตรง ~16020–16108 ✓ |
| Mark as Sold semantics | 2 entries; `assetFromPost` materialize; sell form 2 fields + `sell-gl` live; `pe-err` validation; `markAssetSold` splice `PF_ASSETS`→`PF_SOLD` + posts `pfkind:"sold"` + stack splice + push `sold:{id}` — ตรง ~21684–21728 + ~17137–17149 ✓ |
| Purchase cost | digits+comma input, date min/max, live `is-err`+`pane-err`, `pane-done` block on invalid, optional/private — ตรง ~19990–20010 + ~20404–20414 ✓ |
| Boundary preservation | composer mechanics→02, menu anatomy→02, Post Detail→05, math→14, profile shell→06, WA→10 — ระบุ "canonical อยู่ X" ทุกจุดที่เอ่ยถึง ไม่มี spec ซ้ำ ✓ |
| ACs ใหม่ | AC-ASSET-MGMT-001–040 ทุกข้ออ้างพฤติกรรมจริง (`vis-opt`/`stt-opt`/`cfToPortfolio`/`assetFromPost`/`soldFromPost`/`applyPostEdit`/`markAssetSold`/`pfoEligible`/`sell-gl`/`pe-err`/`refreshPostViews`/`GUEST_GATE_SEL`) ✓ |

## 4. Deviations flagged (spec เลือก prototype — documented, not spec)

| Deviation | Note |
| --- | --- |
| Add Asset ไม่มี confirm/`Adding...`/ไป asset detail | เดิมบังคับ `Add this asset?` + saving state + navigate detail — prototype save ทันที + toast + กลับ profile grid |
| Sale Record ไม่มี `Save sale history?` confirm | เดิม AC-ASSET-MGMT-029A/030 บังคับ confirm — prototype save ทันที |
| Sale Record = 2 fields | เดิมมี Buyer/Contact/Payment Method/Attachment (required บางตัว) — prototype มีแค่ Sale price + Sale date (+Expected gain read-only) |
| ไม่มี Edit Asset form / Change Status sheet | เดิมมีทั้งคู่เป็น surface แยก — prototype ใช้ shared Edit info composer + `Profile status` pick |
| ไม่มี required fields | เดิม Required Field Matrix บังคับ photos/brand/model/condition/desc ตาม status + validation copy 5 ข้อ — prototype require แค่ media ≥1 |
| ไม่มี `Price on request` | เดิม AC บังคับ label เมื่อไม่มี price — prototype = showcase ไม่มี tag |
| Spec free-text ล้วน | เดิม (v1.8) option master + `ระบุเอง` + `spec_options` relation + suggestion pool บน 4 fields — prototype ทุก field free-text (22 `CF_SPECS` + desc); model เดิมย้าย §18 contract — **กระทบ 10_WATCH_ALERT ที่ยังอ้าง option criteria (FSP-021 flag)** |
| Show/Hide path ทิ้ง More-options | `audience`/`noComments` hardcode `public`/`false` บน `PF_MINE` — flag FSP-030 |
| Post delete ทิ้ง drawer orphan | `PF_ASSETS`/`PF_SOLD` ไม่ถูกลบตาม → assetId dangling + portfolio ยังโชว์ — flag (contract: cascade) |
| `PF_MINE` delete no-op | handler ค้นแค่ `POSTS`/`PF_GFX_REG` — drawer-only post ลบไม่ได้จริง — flag |
| `PF_MINE` → `sale` ไม่เข้า feed | drawer-only post flip status แล้วไม่ merge เข้า `POSTS` — flag |
| `pfKind()` fallback | post ไม่มี `pfkind` infer จาก price — gfx/seed posts |
| `sold` post เข้า search/WA match | `salePosts()` pfkind leak = defect ตาม 00_GLOBAL §10 note (spec ใช้ canonical ไม่ copy defect) |
| `pfo-more`/`PFO_SIMS` dev-only | `?dev` preview — nomkt/empty/failed/denied states = contract |
| Session-only | `PF_ASSETS`/`PF_SOLD`/`PF_MINE` memory state — persistence = contract |
| EN-hardcode toasts | `Posted · …`/`Watch alert matched`/`Post deleted` EN ล้วน — i18n sweep FSP-026 |

## 5. Flags ส่งต่อ (ไม่แก้นอก scope)

- **FSP-018** — `05_ASSET_DETAIL_MODULE.md`: `View full detail` → Post Detail + `mf-btn` WA entry + sold post บน detail — 04 อ้าง interface ไว้แล้ว
- **FSP-019** — `06_PROFILE_MODULE.md`: `+`/empty-CTA/`pf-pfo` entries + `pfTabPosts`/`pfKind` status tabs + `all` leak (public รั่ว post/hide/sold — 00_GLOBAL §10 note) — 04 ระบุแค่ entry semantics
- **FSP-021** — `10_WATCH_ALERT_MODULE.md`: `waCriteriaFromPost`/`alertMatch`/`salePosts()` — **spec เดิมใน 10 ยังอ้าง `spec_options` option criteria + `ระบุเอง` model ที่ 04 ใหม่ทิ้ง (free-text ล้วน)** → ต้องเขียน 10 ใหม่ตาม free-text reality
- **FSP-024** — `14_PORTFOLIO_MODULE.md`: `pfo*` math + `PFO_SIMS`/`nomkt` contract + market data (`PFO_SRC`) — 04 ระบุแค่โครงหน้า + fields ที่ใช้
- **FSP-025/026/027** — Master §Asset/PRD/FO_PRD/Use_Cases/DEV/QA checklists ยัง spec เดิมหนัก (multi-step form, required matrix, provenance fields, confirmations, option master) — sync ตาม 04 ใหม่ + EN-hardcode copies เข้า i18n sweep
- **FSP-030** — orphan drawer record หลัง delete + `PF_MINE` delete no-op + `PF_MINE`→`sale` ไม่เข้า feed + Show/Hide ทิ้ง More-options — consistency/bug sweep
- งานทั้งหมดยัง uncommitted รวม FSP-006–017 — รอพี่สั่ง commit แยก
