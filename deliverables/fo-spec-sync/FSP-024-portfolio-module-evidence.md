# FSP-024 — 14_PORTFOLIO Update Evidence (dashboard/sold/cost/mark-as-sold)

Date: 2026-10-22
Task: `6f7a9399` — "FSP-024 อัปเดต 14_PORTFOLIO — dashboard/sold/cost/mark-as-sold (mission:cc291dc9)"
Scope: `FrontOffice/14_PORTFOLIO_MODULE.md` (rewrite ทั้งไฟล์ 798 → ~759 บรรทัด) + `FrontOffice/README_MODULE_INDEX.md` (one-liner module 14) — sync ตาม `Prototypes/fo-flow/index.html` (read-only) + baseline 00_GLOBAL (session §7, statuses §9, visibility §10, gate §11 Member Sheet, private data §14) / 00_NAV (route map §6.6, sub-stack back §6.7, deep-link contract §12) / 04_ASSET_MGMT (drawer/`assetId`/`pfkind`/`markAssetSold` lifecycle canonical — FSP-017 lock) / 05_ASSET_DETAIL (private-data boundary — FSP-018) / 06_PROFILE (`.pf-pfo` entry placement — FSP-019) / 02_FEED (own-post menu anatomy canonical) / 09 (Alerts feed canonical — FSP-021)
Context: FSP-022/023 session notes + evidence `FSP-016..023` + gap doc `gap-FSP-003a-profile-portfolio.md` (portfolio portions A9–A14, B13–B17, C3/C6/C7/C16/C17)

Prototype anchors verified (scan บน working copy @ HEAD — line anchors drift จาก gap doc ~600–1200 บรรทัด ให้ค้นด้วย function-name):

- **Routes** `subHTML` ~17816–17821: `portfolio`/`pfasset:{id}`/`soldhist`/`sold:{id}`/`sell:{id}` → `portfolioHTML`/`pfassetHTML`/`soldHistHTML`/`soldDetailHTML`/`sellFormHTML` — ทุกหน้า `.page-sub` stack
- **Data** ~16556–16584: `PF_ASSETS` 9 records (`{id,img,photos[],name,ref,meta,brand,status,market,purchase,bought,asking?,own?}`), `PF_SOLD` 3 records (`{id,img,photos[],name,ref,brand,soldDate,price,purchase,bought}` — **ไม่มี buyer/contact/payment/attachment**), `PF_MKT_UPDATED` fixed date, `PFO_STATUS`/`PFO_CMP`/`PFO_SRC` maps ~16618–16620
- **Math** ~16586–16617: `pfoTHB`/`pfoSignTHB`/`pfoPct`, `pfoEligible` (sale/show/hide + `own!==false`), `pfoCur` (mkt→purchase-fb→none), `pfoGL` (mkt+purchase เท่านั้น), `pfoExp` (asking−purchase), `pfoCmp` (±1% band, `"none"` เมื่อไม่มี market), `pfoHold` (days + `Yy Mm`, sold จบที่ soldDate), `pfoDate` (en-GB)
- **Dashboard** `portfolioHTML` ~17214–17248: head + `pfo-more` (dev-only), nomkt banner, `.pfo-total` = `ต้นทุนรวม/Total invested` (Σ **purchase** + `THB` prefix + lock `ส่วนตัว`) + `มูลค่าตลาด` line (ต้อง `mktTotal != null && glRows.length`) + coverage `ต้นทุนซื้อของ X/Y`; rows `pfoRowHTML` ~17202 แสดง **purchase**; foot note (กล่าว consignment แต่ไม่ implement)
- **Detail** `pfassetHTML` ~17250–17288: hero `data-pfaid` (shared `photoCtx` ~19993) + status chip + Value card 9 rows (private tag) + Listing card เฉพาะ `sale` + `data-sell` เฉพาะ `pfoEligible` + owner-only note
- **Sold** `soldHistHTML` ~17290 (desc + rows `Sold {date}` + price) + `soldDetailHTML` ~17305 (Sale price headline + Realized G/L + Sale record/Return cards + note; chip `st-hide`)
- **Sell form** `sellFormHTML` ~17344–17359: 2 fields — `sell-price` (prefill asking, auto-comma ผ่าน shared handler ~20346) + `sell-gl` live Expected gain (~20350–20357) + `sell-date` (max=today); `sell-save` validation inline `pe-err` + focus (~21940–21960)
- **Transition** `markAssetSold` ~17377: splice `PF_ASSETS` → unshift `PF_SOLD` + linked posts (`POSTS`+`PF_MINE`+`PF_GFX_REG`) `pfkind:"sold"` + `refreshPostViews`; stack splice `sell:`/`pfasset:` → push `sold:` + ghost clone 340ms + toast (~21961–21979)
- **Entries** `.pf-pfo` ~17125 (`data-sub="portfolio"` — own profile เท่านั้น), `pm-own-sold`/`pm-own-soldview` ~14164–14165 + handlers ~20739–20745 (`assetFromPost`/`soldFromPost` materialize + `pmDropCovered`)
- **Dev sims** `PFO_SIMS`/`pfoSimBar` ~17197 + `pfo-more`/`data-pfosim`/`pfo-retry` ~21907–21936 (`?dev=1` เท่านั้น)
- **Session** ~23297–23351: `clearUserData`/`POST_FLAG_KEYS` **ไม่แตะ** `PF_ASSETS`/`PF_SOLD`/`pfkind` → mutations ค้างข้าม session (D9)
- **Gate** ~23362–23371: `GUEST_GATE_SEL` มี `.pm-own-sold`/`.pm-own-soldview` แต่ **ไม่มี** `[data-sub]`/`.pf-pfo` — entry unreachable สำหรับ guest (own profile gated upstream); non-member → `state.session !== "member"` → empty `ไม่พบข้อมูล` ~17225
- **i18n**: inline `isTh` ทุกจุดหลัก + `I18N_TH` dict (`Latest market price`/`Show`/`Hide`/`No data found`/`TukDaeng Market Data`/`Try again`) + `i18nTr` date pattern → พ.ศ.; EN leftovers: `Sale` chip, `PFO_CMP`, `Purchase price estimate`/`No market price`, `N/A` (นอก spec-row), `y/m` suffixes, dev-sim UI, `THB` headline prefix

## 1. What changed (section map)

| Section | Change |
| --- | --- |
| Header refs | rewrite — baseline chain 00_GLOBAL §7/§9/§10/§11/§14 + 00_NAV §6.6/§6.7/§12 + 04/05/06/02 delegation + 09 |
| §1 Doc Info | rewrite — Version 1.9 / synced; rename-trace note (v1.0 = Total-Asset-Value headline + 6-field sold record + Top Brand/YTD + real API + denied/failed production states) |
| §2 Objective | rewrite — owner-private surface 5 sub pages; module = value-math + privacy owner, lifecycle defer 04 |
| §3 Prototype Reference | **ใหม่ทั้งก้อน** — anchors จัดกลุ่ม routes/data/math/dashboard/pages/lifecycle/entries/handlers/dev-sims/session/gate/i18n/shared-deps (function-name + drift note) |
| §4 Master Alignment | **rewrite** — 14 rows: headline invested (D2), icon entry (D1), sold fields 2 (D3), sellable sale/show/hide (D4), no Top Brand/YTD (D5), denied dev-only (D6/D7), mock market data (D8) |
| §5 Scope | rewrite — In = 5 surfaces + math contract + privacy + dev sims + i18n; Out = drawer lifecycle (04), own-post menu (02), `.pf-pfo` placement (06), post detail (05), composer cost UI (02/04), real API, BO view, analytics-by-master items |
| §6 Route & Surface | **ใหม่** — 5 routes + entries + stack semantics (`openSubOver`/`pmDropCovered`) + `PF_ASSETS`/`PF_SOLD` route-split note |
| §7 User States | rewrite — Guest (unreachable + empty-guard fallback), New member (empty), Member/Owner, Viewer (no surface — better than active deny), Admin (BO) |
| §8 Data Model | **ใหม่** — `PF_ASSETS`/`PF_SOLD` field tables + module globals + session-persistence quirk (D9) |
| §9 Value Math Contract | **ใหม่ — core ownership** — eligibility, `pfoCur`, `pfoGL`, `pfoExp`, `pfoCmp` ±1%, `pfoHold`, dashboard totals (invested/mktTotal/glRows/coverage), realized G/L, formatting helpers — ตรง code ทุกสูตร |
| §10 Dashboard | **ใหม่** — anatomy 7 ส่วน + rules (eligible list, empty conditions, nomkt, no add-entry) |
| §11 pfasset Detail | **ใหม่** — Value card 9-row table + Listing card (sale only) + Mark as sold + not-found |
| §12 Sold History + Detail | **ใหม่** — list/desc/rows + sold detail cards + `soldFromPost` materialize defer-04 |
| §13 Mark as Sold | **ใหม่** — entries table + form anatomy + validation table + transition 4 ขั้น + terminal rule |
| §14 Privacy & Access | **ใหม่** — owner-only + reachability-not-deny model + denied-as-contract + guest gate table + rename-trace |
| §15 Dev Sims | **ใหม่** — `PFO_SIMS` mechanics + per-sim render table + `?dev=1`-only |
| §16 i18n & Copy | **ใหม่** — isTh/dict/pattern coverage + EN-leftover inventory (→ FSP-026) |
| §17 Notifications | rewrite — portfolio ไม่สร้าง alert; Alerts feed canonical 09 |
| §18 Empty/Error/Toasts | **ใหม่** — copy table จริงทุกจุด (empty/denied/failed/nomkt/validation/toast) TH+EN |
| §19 Deviations | **ใหม่** — D1–D21 (invested headline, icon entry, 2-field sold, sellable-3, no YTD/brands, empty-not-denied, dev-sim-only, mock market, session persist, market-line quirk, coverage semantics, consignment copy-only, asking-null mislabel, THB/฿ mix, rows=purchase, ex always-up, nomkt detail gap, st-hide sold chip, local-tz hold, no delete, contract analytics) |
| §20 Analytics | rewrite — contract events ใหม่ตาม surface จริง — ลบ `portfolio_value_source_viewed`/`portfolio_market_price_unavailable`/`sold_history_detail_opened`/`portfolio_permission_denied` เดิม (ชื่อ/พฤติกรรมไม่ตรง prototype) |
| §21 ACs | **rewrite ทั้งชุด** — AC-PORT-001–022 sequential (เดิม 001–025 อ้าง metric/fields ที่ไม่มีใน prototype); AC-021 mark dev-sim contract |
| §22 Related | rewrite — เพิ่ม 00_GLOBAL/00_NAV/02/04/05/06/09/15/18 links ตาม boundary ใหม่ |
| §23 Future | rewrite — real API, sold extended fields (D3 sign-off), headline option (D2), Top Brand/YTD reopen, consignment, export/benchmark, valuation alerts, production denied/failed |
| README_MODULE_INDEX L69 | "Owner-only portfolio value, sold history boundary" → "Owner-only portfolio — Total invested dashboard, asset value detail, sold history, mark-as-sold" |

## 2. Cross-doc ref check (ก่อนปิดงาน)

| Check | Result |
| --- | --- |
| `Global Login Required` ใน 14 ใหม่ | **0 actionable hits** — เหลือ 1 จุด rename-trace จงใจ (§14 quote ระบุชื่อเดิม→Member Sheet); กฎจริงใช้ Member Sheet/`GUEST_GATE_SEL`/`obGate` ตาม 00_GLOBAL §11 ✓ |
| `Notification Center` ใน 14 ใหม่ | **0 actionable hits** — เหลือ 1 จุด rename-trace จงใจ (§17); ใช้ Alerts feed canonical 09 ✓ |
| Baseline delegation claims | 00_GLOBAL §9 statuses → §8/`PFO_STATUS` ✓; §10 visibility + §14 private data → §7/§14/AC-020 ✓; §11 Member Sheet → §7/§14 (`.pm-own-*` gated, `.pf-pfo` unreachable-not-gated) ✓; 00_NAV §6.6 route map มี `portfolio`/`pfasset:{id}`/`soldhist`/`sold:{id}`/`sell:{id}` ครบ (L173) → §6 ตรง ✓; §6.7 sub-stack back → §6 entry notes ✓; 04 §6/`96–101` pages + §8/§10–§13 lifecycle claim → §5 Out + §13 defer ✓; 05 private-data boundary (`pfasset:`/`sold:`/`portfolio` surfaces) → §14 ✓; 06 §4 (`.pf-pfo` entry, ไม่มี Total Asset Value headline) → §4 D1 ✓; 02 own-post menu canonical → §5/§13 ✓ |
| AC refs นอก 14 | **0 live refs** — `AC-PORT-*` ไม่มีเอกสารอื่นอ้าง (grep ทั้ง FrontOffice/: เหลือแค่ QA-PORT-001–011 ใน `QA_TEST_SCENARIO_CHECKLIST` L1139–1207 — prefix คนละชุด แต่อ้างพฤติกรรม spec เดิม YTD/fallback-label → flag FSP-027) → renumber sequential ปลอดภัย ✓ |
| Cross-module ซ้ำ contract | own-post menu rows / `assetId`/`cfToPortfolio`/`assetFromPost`/`soldFromPost`/`markAssetSold` mechanics / `.pf-pfo` placement / `.page-detail` private boundary — defer canonical 02/04/05/06 ทั้งหมด ไม่เขียน contract ซ้ำ (§5 Out + §13 "transition mechanics canonical 04 §12") ✓ |
| QA/DEV checklist drift | `QA_TEST_SCENARIO_CHECKLIST` QA-PORT-001–011 อ้าง spec เดิม (Current Value priority, Purchase fallback label, No Valuation, Expected Profit, Realized Gain, **YTD 001–011 ที่ไม่มีใน prototype**) → flag FSP-027 ✓; `DEV_IMPLEMENTATION_CHECKLIST` L160 (public profile ห้ามแสดง purchase/sale history/portfolio value) ยังตรง concept — ไม่ drift ✓ |
| Stale terms ใน synced docs อื่น (flag ไม่แก้) | `Notification Center`: `02_FEED L662`, `13_SETTINGS L539` (ตาม FSP-022 evidence — defer FSP-026 sweep) ✓ |
| 04 overlap กับ 14 | 04 §10–§13 เขียน anatomy/flow ไว้แล้วระดับ structure — 14 เก็บ value math + copy ครบ + deviations; 04 อ้าง "สูตรคำนวณมูลค่าอยู่ 14" ตรงกับ §9 ใหม่ ✓ (ไม่มีข้อขัดแย้ง — 04 claims hold) |

## 3. Verification

| Check | Result |
| --- | --- |
| ไฟล์ที่แก้ | `FrontOffice/14_PORTFOLIO_MODULE.md` (rewrite ทั้งไฟล์ ~759 บรรทัด) + `FrontOffice/README_MODULE_INDEX.md` (1 line) + evidence file นี้ ✓ |
| `git status --porcelain -- Prototypes/` | **ว่าง** — Prototypes/ ไม่ถูกแตะ ✓ |
| Dashboard | head + `pfo-total` (`ต้นทุนรวม` Σpurchase + Private tag + `THB` prefix) + market line (glRows guard) + coverage invested/eligible + `รายการนาฬิกา N` + soldlink + rows (purchase val) + foot note — ตรง ~17214–17248/~17202 ✓ |
| pfasset detail | hero `data-pfaid` + status chip + Value card 9 rows + Listing card (sale only) + `data-sell` (eligible) + owner note — ตรง ~17250–17288 ✓ |
| soldhist + sold detail | desc + rows `ขายแล้วเมื่อ`/`Sold {date}` + `N/A` fallback; detail = Sale price + Realized G/L + Sale record (private) + Return cards + note — ตรง ~17290–17340 ✓ |
| sell form | 2 fields + prefill asking + auto-comma + `sell-gl` live + date max=today + `pe-err` validation + focus — ตรง ~17344–17359/~20346–20357/~21940–21960 ✓ |
| mark-as-sold | splice→unshift + `pfkind:"sold"` + `refreshPostViews` + stack splice→`sold:` + ghost + toast — ตรง ~17377–17387/~21961–21979 ✓ |
| Entries | `.pf-pfo` own-only ~17125; `pm-own-sold` sellable=sale/show/hide ~14157–14165; `pm-own-soldview` sold → `soldFromPost` ~20739–20745 ✓ |
| Guest/non-member | `.pf-pfo`/`[data-sub]` ไม่อยู่ gate — unreachable; `state.session!=="member"` → empty ~17225; `.pm-own-*` gated ~23367 ✓ |
| Dev sims | `?dev=1` + `PFO_SIMS` 4 states + simbar/`pfo-retry` reset — ตรง ~17197–17201/~21907–21936 ✓ |
| Session | `PF_ASSETS`/`PF_SOLD`/`pfkind` ไม่อยู่ `clearUserData`/`POST_FLAG_KEYS` — ตรง ~23297–23351 (D9) ✓ |
| ACs ใหม่ | AC-PORT-001–022 ทุกข้ออ้างพฤติกรรมจริง (entry/eligibility/totals/market-line guard/rows=purchase/pfoCur priority/market-null rows/GL formulas/Listing sale-only/±1% band/entries/form+live+validation/transition/soldhist/sold detail/materialize/private boundary/dev-sims/terminal) ✓ |

## 4. Deviations flagged (spec เลือก prototype — documented, not spec)

| Deviation | Note |
| --- | --- |
| Headline = invested (Σ purchase) | ไม่ใช่ Total Asset Value = Σ current value — คนละ metric (gap C3; sign-off master mapping อยู่ FSP-025) |
| Entry = wallet icon ล้วน | ไม่มีตัวเลขบน profile (gap C1 — 06 เขียนแล้วตาม prototype) |
| Sold record = price+date | ไม่มี Buyer/Contact/Payment Method/Attachment (gap C7 — product sign-off ตอน implement หรือ future §23) |
| sellable = sale/show/hide | Show/Hide ก็ Mark as sold ได้ (gap C6 — สมเหตุ: drawer asset คือของในคลัง) |
| ไม่มี Top Brand/YTD | cut per user feedback — `PF_YTD_OPEN` removed (gap B14) |
| Non-member → empty ไม่ใช่ denied | `state.session!=="member"` guard; denied = `?dev` sim เท่านั้น (gap C16/B17) |
| Market data mock ทั้งก้อน | `market` field + fixed `PF_MKT_UPDATED` + `TukDaeng Market Data` + ±5% band — ไม่มี real API boundary |
| Session persist | `PF_*`/pfkind mutations ค้างข้าม session (class เดียวกับ 12 D8/11 D7 — รวม FSP-030) |
| Consignment copy-only | foot note + `own` flag แต่ไม่มี implementation (gap B15) |
| Market-line guard quirk | ต้องมี ≥1 GL row ถึงแสดง market value — asset market-only ทั้งกลุ่ม → `unavailable` |
| `asking==null` mislabel | comparison แสดง `No market price` ทั้งที่ขาด asking |
| EN leftovers | `Sale` chip (Show/Hide แปลแต่ Sale ไม่มี dict key → ชิปผสมภาษา), PFO_CMP, src fb/none, `N/A` นอก spec-row, `y/m` suffix — sweep FSP-026 |
| `THB`/`฿` prefix mix | headline `THB N` vs rows `฿N` |
| Expected profit class | `up` เสมอเมื่อมีค่า (ไม่มี `dn`) |
| `nomkt` ไม่เข้า detail | `pfasset` เรียก `pfoCur(a,false)` เสมอ |
| Sold chip = `st-hide` | ไม่มี `st-sold` class |
| Device-local dates | `pfoHold`/`pfoDate` ไม่มี Asia/Bangkok explicit; `30.4` month approximation |

## 5. Flags ส่งต่อ (ไม่แก้นอก scope)

- **FSP-025 (Master Product Definition)** — invested-centric vs value-centric headline sign-off (D2); sold-record 6-field master contract vs 2-field prototype (D3); Top Brand/YTD removal sign-off (D5); consignment concept (D12)
- **FSP-026 (index + DEV checklists + Use Cases/PRD)** — `Notification Center` leftovers `02_FEED L662`/`13_SETTINGS L539` (ตาม FSP-022); portfolio EN-only strings (§16); Use Cases/PRD ที่อ้าง portfolio 6-field sold record/YTD ต้อง sync
- **FSP-027 (QA checklist)** — QA-PORT-001–011 rewrite ตาม AC-PORT-001–022 (เดิมอ้าง Total Asset Value/fallback-label/YTD/No Valuation ที่ไม่มีใน prototype)
- **FSP-030 (consistency sweep)** — session-flag persistence `PF_ASSETS`/`PF_SOLD`/`pfkind` (D9 — รวมกับ 11 D7/12 D8); `asking==null` → `No market price` mislabel (D13); `THB`/`฿` mix (D14); `ex` always-`up` class (D16); `nomkt` sim ไม่เข้า pfasset (D17); pfkind leak เข้า WA/search (`salePosts` ไม่กรอง — gap C17, canonical 00_GLOBAL §10 defect note เขียนไว้แล้ว)
