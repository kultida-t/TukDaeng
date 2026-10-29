# 14 Portfolio Module

อ้างอิงหลักจาก [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md) + baseline [00_GLOBAL_RULES_MODULE.md](00_GLOBAL_RULES_MODULE.md) §7 (session model), §9 (asset statuses `Sale`/`Show`/`Hide`/`Sold`), §10 (visibility matrix), §11 (guest gate = Member Sheet `Join TukDaeng`), §14 (private data) + [00_NAVIGATION_AND_CROSS_MODULE_FLOW.md](00_NAVIGATION_AND_CROSS_MODULE_FLOW.md) §6.6 (route map `portfolio`/`pfasset:{id}`/`soldhist`/`sold:{id}`/`sell:{id}`), §6.7 (sub stack back) + [04_ASSET_MANAGEMENT_MODULE.md](04_ASSET_MANAGEMENT_MODULE.md) (drawer record/`assetId`/`pfkind` lifecycle + `markAssetSold` canonical — FSP-017 lock) + [05_ASSET_DETAIL_MODULE.md](05_ASSET_DETAIL_MODULE.md) (post detail layer — private data boundary) + [06_PROFILE_MODULE.md](06_PROFILE_MODULE.md) (`.pf-pfo` entry placement — FSP-019 lock) + [02_FEED_MODULE.md](02_FEED_MODULE.md) (own-post menu anatomy canonical) — prototype `Prototypes/fo-flow/index.html` เป็น source of truth เดียวของพฤติกรรม (FO-PRD-v1.9)

---

# 1. Document Information

| Field | Detail |
| --- | --- |
| Module Name | Portfolio — owner-only value dashboard (Total invested headline + market value line + asset list + sold history + mark-as-sold) |
| Version | 1.9 (FO-PRD-v1.9 spec-sync FSP-024) |
| Status | Functional PRD — synced to fo-flow prototype |
| Owner | Tuk Daeng Project |
| Document Type | Front Office Functional PRD |
| Source of Truth | `Prototypes/fo-flow/index.html` (พฤติกรรม) + Master Product Definition (business intent) |

> spec เดิม (v1.0) ตีความ Portfolio เป็น **Total Asset Value** headline (Σ Current Value) + entry ผ่านตัวเลขมูลค่าบน profile + Sold History 6 ฟิลด์ (Buyer/Contact/Payment Method/Attachment) + Top Brand Holdings + YTD Performance วิธี A + real Watch Price API boundary + permission-denied/load-failed states เป็น production path — prototype คือ **invested-centric dashboard** (headline `ต้นทุนรวม`/`Total invested` = Σ purchase) ที่ entry เป็น wallet icon ล้วน, sold record เก็บแค่ราคา+วันที่, ไม่มี Top Brand/YTD เลย, market data เป็น mock และ denied/failed มีเฉพาะ `?dev` preview — เอกสารฉบับนี้เขียนตามพฤติกรรมจริงและ flag ทุก deviation ใน §19

---

# 2. Objective

Portfolio Module คือ owner-private surface ที่ให้ member เห็นมูลค่า/ต้นทุนคอลเลกชันของตัวเอง — เข้าผ่าน wallet icon (`.pf-pfo`) บน **own profile เท่านั้น** แล้ว stack เป็น sub pages 5 หน้า: `portfolio` (dashboard: Total invested + market value line + asset rows), `pfasset:{id}` (per-asset value card + listing card + Mark as sold), `soldhist` (sold history list), `sold:{id}` (sold record detail: realized G/L + return) และ `sell:{id}` (mark-as-sold form: ราคาขาย + วันที่ขาย)

โมดูลนี้เป็นเจ้าของ **value math contract** (current value priority, unrealized/realized G/L, expected profit, market comparison, holding period, totals/coverage) + privacy boundary (owner-only, ไม่มี surface ของ viewer) — ส่วน drawer lifecycle (`assetId` link, `pfkind` mirror, materialize-on-demand, `markAssetSold` transition, composer/edit sync) เป็น canonical ของ 04_ASSET_MGMT และ own-post menu anatomy เป็น canonical ของ 02_FEED; เอกสารนี้ระบุเฉพาะ entry + semantics ฝั่ง portfolio

---

# 3. Prototype Reference

Source of truth: `Prototypes/fo-flow/index.html` (read-only — ห้ามแก้) — line anchors คือ state ปัจจุบัน @ HEAD อาจ drift ให้ค้นด้วย function-name

- Routes (`subHTML` ~17816–17821): `portfolio` → `portfolioHTML`, `pfasset:{id}` → `pfassetHTML`, `soldhist` → `soldHistHTML`, `sold:{id}` → `soldDetailHTML`, `sell:{id}` → `sellFormHTML` — ทุก route เป็น `.page-sub` stack page (00_NAV §6.6/§6.7)
- Data: `PF_ASSETS` seed 9 records (~16556–16566 — `{id:"pfa-NN", img, photos[], name, ref, meta, brand, status:sale/show/hide, market, purchase, bought, asking?}` + `own` flag optional), `PF_SOLD` seed 3 records (~16569–16582 — `{id:"pfs-NN", img, photos[], name, ref, brand, soldDate, price, purchase, bought}`), `PF_MKT_UPDATED` mock date (~16584 — comment: last Watch Price API sync), `PFO_STATUS`/`PFO_CMP`/`PFO_SRC` label maps (~16618–16620)
- Math helpers: `pfoTHB`/`pfoSignTHB`/`pfoPct` (~16586–16588), `pfoEligible` (~16589 — status ∈ sale/show/hide + `own !== false`), `pfoCur` (~16591 — market → purchase fallback → none), `pfoGL` (~16597 — market−purchase เมื่อทั้งคู่จริง), `pfoExp` (~16601 — asking−purchase), `pfoCmp` (~16603 — ±1% dead band; `"none"` เมื่อไม่มี market), `pfoHold` (~16610 — days + `Yy Mm` human form; sold ใช้ `soldDate` เป็นจุดจบ), `pfoDate` (~16617 — en-GB `d Mon yyyy`)
- Dashboard: `pfoRowHTML` (~17202 — row = img + name + `ref · meta` + **purchase** value), `portfolioHTML` (~17214 — head + nomkt banner + `.pfo-total` headline card + `รายการนาฬิกา`/`Assets` section + rows + foot note)
- Pages: `pfassetHTML` (~17250 — hero `data-pfaid` + status chip + Value card (private tag) + Listing card (`sale` only) + `data-sell` button + owner-only note), `soldHistHTML` (~17290 — desc + rows `Sold {date}` + price → `sold:{id}`), `soldDetailHTML` (~17305 — Sale price headline + Realized G/L + Sale record card + Return card + note), `sellFormHTML` (~17344 — sell-hero + private note + `sell-price` prefill asking + `sell-gl` live Expected gain + `sell-date` (max=today) + `sell-save`)
- Lifecycle: `markAssetSold` (~17377 — splice `PF_ASSETS` → unshift `PF_SOLD` + linked posts `pfkind:"sold"` + `refreshPostViews`), `openSellForm`/`openSubOver` (~17375/~17362 — stack ทับ viewer เหมือน report pages); canonical narrative อยู่ 04 §10–§12
- Entries: `.pf-pfo` wallet icon บน own profile actions row (~17125 — `data-sub="portfolio"`, title `พอร์ตโฟลิโอ`/`Portfolio`), `pfo-soldlink` → `soldhist` (~17245), `pfo-row` → `pfasset:{id}` (~17203), sold row → `sold:{id}` (~17293), `data-sell` → `sell:{id}` (~17286/21938), own-post menu `pm-own-sold`/`pm-own-soldview` (~14164–14165 + handlers ~20739–20745 — canonical 02_FEED)
- Handlers: `pfo-more` dev sheet + `data-pfosim` + `pfo-retry` (~21907–21936), `data-sell` → `openSellForm` (~21938), `sell-save` validation + `markAssetSold` + stack splice → `sold:{id}` + ghost clone + toast (~21940–21980), `sell-price` input → auto-comma + live `sell-gl` update (~20346–20357)
- Dev sims: `PFO_SIMS` + `pfoSimBar` (~17197–17201 — `?dev` query เท่านั้น; sims `nomkt`/`empty`/`failed`/`denied`)
- Session: `clearUserData`/`restoreUserData`/`applySessionData`/`POST_FLAG_KEYS` (~23297–23351) — **ไม่แตะ `PF_ASSETS`/`PF_SOLD`/`pfkind`** (sold marks + record mutations ค้างข้าม session — deviation D9); `state.session !== "member"` → portfolio/soldhist empty state (~17225)
- Guest gate: `GUEST_GATE_SEL` (~23362–23371) รวม `.pm-own-sold`/`.pm-own-soldview`/`.pf-menu` ฯลฯ — **แต่ไม่รวม `[data-sub]`/`.pf-pfo`** (entry อยู่ใต้ own profile ซึ่ง guest เข้าไม่ได้อยู่แล้ว — §14)
- language: `isTh` ternary ใน markup ทุกจุด + `I18N_TH` dict (`Latest market price`→`ราคาตลาดล่าสุด`, `Show`→`แสดง`, `Hide`→`ซ่อน`, `No data found`→`ไม่พบข้อมูล`, `TukDaeng Market Data`→`ข้อมูลตลาดตึกแดง`) + `i18nTr` date pattern (`d Mon yyyy` → พ.ศ.) — leftover EN inventory ใน §16
- Shared deps: `sub-back`/`pushSub`/`openSub`/`openSubOver` (canonical 00_NAV §6.7), `photoCtx`/`applyPhoto` (`data-pfaid` hero swipe — shared post-hero mechanics), `esc`, `I.*` icon set, `fmtNum`/`unNum` (price input), `pmDropCovered` (sheet snap-shut เมื่อเปิดจาก viewer), `sr-empty-block` empty-state pattern

---

# 4. Master Alignment Summary

| Topic | Master Baseline | Portfolio Module Rule (ตาม prototype) |
| --- | --- | --- |
| Privacy | Portfolio เป็น private เห็นเฉพาะ Owner | ตรง — entry มีเฉพาะ own profile (`.pf-pfo`); ไม่มี viewer surface เลย; non-member session → empty state |
| Entry Point | Total Asset Value เป็น entry point | **ขัด spec เดิม** — profile ไม่มีตัวเลขมูลค่า; entry = wallet icon `pf-pfo` อย่างเดียว (D1 — placement canonical 06 §4) |
| Headline metric | Total Asset Value = Σ Current Value | **ขัด spec เดิม** — headline คือ `ต้นทุนรวม`/`Total invested` = Σ `purchase` (cost basis); market value เป็นบรรทัดรอง (D2) |
| Calculation scope | Sale, Show, Hide ที่ยังใช้งานได้ | ตรง — `pfoEligible` = status sale/show/hide + `own !== false`; ไม่รวม sold/deleted/perm-hidden (consignment = copy-only, D12) |
| Current Value | Watch Price API → Purchase fallback → No valuation | ตรงลำดับ — `pfoCur` mkt→fb→none; แต่ "API" คือ `market` field mock + `TukDaeng Market Data` label (D8) |
| Gain/Loss | Unrealized = Current − Purchase (mkt เท่านั้น) | ตรง — `pfoGL` เฉพาะ market+purchase>0; fallback ไม่นับ |
| Expected Profit / Market Comparison | asking−purchase / asking vs market ±1% | ตรง — `pfoExp`/`pfoCmp` ±1% dead band (`above`/`at`/`below`/`none`) — เฉพาะ `sale` Listing card |
| Sold History fields | Sale Date, Buyer, Contact, Sale Price, Payment Method, Attachment | **ขัด spec เดิม** — record/detail/form มีแค่ **Sale price + Sale date** (+ purchase/bought carry-over สำหรับ G/L) — ไม่มี buyer/contact/payment/attachment เลย (D3) |
| Sold exclusion | Sold ไม่รวม Portfolio value | ตรง — sold ย้าย `PF_SOLD` แยก; desc `ไม่นำไปรวมกับมูลค่าพอร์ตโฟลิโอ` |
| Mark as Sold scope | spec เดิม: เฉพาะ `Sale` | **ขัด spec เดิม** — `sellable`/`pfoEligible` = sale/show/hide (drawer asset ที่ไม่ได้ลงขายก็บันทึกการขายได้) (D4) |
| Holding Period | Today−Purchase; sold = SaleDate−Purchase | ตรง — `pfoHold` days + `Yy Mm`; device-local date |
| Top Brand Holdings / YTD | Top-3 brand + YTD วิธี A | **ไม่มี** — `PF_YTD_OPEN` ถูกตัดโดยตั้งใจ (`YTD tile cut per user feedback (minimal dashboard)`) (D5) |
| Denied / failed states | permission denied + load failed + retry เป็น states จริง | dev-sim เท่านั้น (`?dev=1`); production path: non-member → empty `ไม่พบข้อมูล` (D6/D7) |
| Guest | เข้า Portfolio ไม่ได้ | ตรงเจตนา — guest เข้าถึง entry ไม่ได้ (อยู่ใต้ own profile ที่ gate โดย `[data-navgo="profile"]`); ถ้าหลุดมาถึง → empty state ไม่ใช่ denied (§14) |
| Notifications | ไม่สร้าง notification | ตรง — portfolio ไม่สร้าง alert (Alerts feed canonical 09) |

---

# 5. Scope

## In Scope

- `portfolio` dashboard — Total invested headline (private tag) + Market value line + coverage + asset rows + Sold history link + foot note
- `pfasset:{id}` owner asset detail — hero + status chip + Value card + Listing card (`sale` only) + `Mark as sold` entry
- `soldhist` list + `sold:{id}` sold record detail (realized G/L + return card)
- `sell:{id}` mark-as-sold form — Sale price* + Expected gain live + Sale date* + validation + save transition
- Value math contract — `pfoCur`/`pfoGL`/`pfoExp`/`pfoCmp`/`pfoHold`/`pfoPct`/totals/coverage (เจ้าของ canonical = เอกสารนี้)
- Privacy boundary — owner-only ทุก surface; private data fields ตาม 00_GLOBAL §14
- Dev preview states (`PFO_SIMS` — `?dev` only) + empty/denied/failed render contracts
- language coverage + EN leftovers inventory (§16/§19)
- Dead/quirk boundary (§19)

## Out of Scope (module อื่นเป็นเจ้าของ / ไม่มีใน V1)

- Drawer record lifecycle — `cfToPortfolio`/`assetFromPost`/`soldFromPost`/`assetId` link/`pfkind` mirror/`markAssetSold` transition mechanics/delete semantics — canonical [04_ASSET_MANAGEMENT_MODULE.md](04_ASSET_MANAGEMENT_MODULE.md) (FSP-017); เอกสารนี้ระบุเฉพาะผลกระทบฝั่ง value math
- Own-post menu anatomy/rows (`pm-own-sold`/`pm-own-soldview` item list) — canonical [02_FEED_MODULE.md](02_FEED_MODULE.md); เอกสารนี้ระบุเฉพาะ entry semantics
- `.pf-pfo` button placement/own-profile head anatomy — canonical [06_PROFILE_MODULE.md](06_PROFILE_MODULE.md) (FSP-019)
- Post Detail `.page-detail` (viewer asset info) — [05_ASSET_DETAIL_MODULE.md](05_ASSET_DETAIL_MODULE.md) (FSP-018); private data ไม่ปรากฏที่นั่น
- Composer asset mode + cost fields UI (`purchase`/`bought` inputs) — canonical 02_FEED §9 + 04 §8; เอกสารนี้ระบุเฉพาะว่า field เหล่านั้นถูกใช้ต่อที่ไหน
- Member Sheet/`obGate`/`GUEST_GATE_SEL` internals — canonical 00_GLOBAL §11
- Real Watch Price API integration — prototype ใช้ `market` mock field + `PF_MKT_UPDATED` fixed date; API boundary เป็น contract (§9 + §23)
- Portfolio benchmark / allocation / brand analytics / YTD / export — ตัดออกตาม prototype (D5) + future §23
- BO/admin view ของ member portfolio — ไม่มีใน FO V1

---

# 6. Route & Surface Mapping

| Route (`.page-sub` stack) | Surface | Entry | 
| --- | --- | --- |
| `portfolio` | Dashboard — head + Total invested card + Assets rows + Sold history link | `.pf-pfo` wallet icon บน own profile actions row (`data-sub="portfolio"` → `pushSub`) |
| `pfasset:{id}` | Asset value detail — hero + Value/Listing cards + Mark as sold | `pfo-row` tap บน dashboard (`data-sub="pfasset:{id}"`) |
| `soldhist` | Sold history list — desc + sold rows | `pfo-soldlink` บน dashboard (`data-sub="soldhist"`) |
| `sold:{id}` | Sold record detail — Sale price + Realized G/L + Sale record/Return cards | soldhist row (`data-sub="sold:{id}"`) / own-post menu `pm-own-soldview` → `soldFromPost` |
| `sell:{id}` | Mark-as-sold form — Sale price + Expected gain + Sale date | `data-sell` บน `pfasset:{id}` (`pfoEligible` เท่านั้น) / own-post menu `pm-own-sold` → `assetFromPost` ถ้าไม่มี link |

Entry notes:

- ทุกหน้าเป็น pushed sub page บน stack เดียวกัน — back = `.sub-back` pop ตาม 00_NAV §6.7; เปิดจาก post viewer (`pv-open`) ใช้ `openSubOver` (stack ทับ viewer เหมือน report pages + `pmDropCovered` snap sheet ปิด)
- `pf-pfo` ไม่มี bottom nav — portfolio ทั้งก้อนเป็น sub layer เหนือ profile
- `pfasset:{id}` lookup เฉพาะ `PF_ASSETS` — id ที่ย้ายไป `PF_SOLD` แล้วจะ not-found ที่นี่ (ดู §12 route split)
- `sold:{id}` lookup เฉพาะ `PF_SOLD` — เช่นเดียวกัน asset id ที่ยังไม่ขายจะ not-found
- ไม่มี deep-link/external entry — contract 00_NAV §12 เท่านั้น

---

# 7. User States

## Guest (session `guest`)

- เข้าถึง portfolio surface ไม่ได้เลย — entry `.pf-pfo` อยู่บน own profile actions row ซึ่ง guest ไม่มี (`[data-navgo="profile"]` อยู่ใน `GUEST_GATE_SEL` → Member Sheet `Join TukDaeng`)
- own-post menu entries (`pm-own-sold`/`pm-own-soldview`) อยู่ใน `GUEST_GATE_SEL` → Member Sheet ก่อน handler (gate-before-dispatch ตาม 00_GLOBAL §11)
- ถ้าหลุดมาที่ `portfolio` ด้วย session `guest` → render **empty state** `ไม่พบข้อมูล`/`No data found` + explainer (`state.session !== "member"` guard — ไม่ใช่ denied)
- ไม่เห็น Total invested, asset rows, sold history หรือ private field ใด ๆ

## New Member (session `new`)

- เข้าถึง `.pf-pfo` ได้ (member powers) แต่ `state.session !== "member"` → **empty state** เหมือน guest (fresh account ยังไม่มี asset — GUEST-001 pattern)
- หลังเพิ่ม asset ผ่าน composer asset mode → drawer record ใหม่ (`pfa-x{ts}`) ขึ้น list ตามปกติ (`market:null` → fallback purchase/`—`)

## Member / Owner (session `member`)

- เห็น portfolio ของตัวเองครบ: Total invested + market value + coverage + rows + sold history
- เปิด `pfasset:{id}` → value/listing cards + `Mark as sold` (eligible เท่านั้น)
- บันทึกการขายจาก 2 entries: `data-sell` (pfasset) / `pm-own-sold` (own-post menu)
- ดู `sold:{id}` จาก soldhist row หรือ `pm-own-soldview` บนโพสต์ sold ของตัวเอง

## Viewer / Other User

- **ไม่มี portfolio surface ของคนอื่นเลย** — viewer profile ไม่มี `.pf-pfo`; ไม่มี route ที่รับ user param (ดีกว่า spec เดิมที่ต้อง active-deny)
- Public surfaces (feed/search/detail/public profile) ต้องไม่แสดง private fields — `purchase`/`bought`/`soldDate`/`price`(sale record)/portfolio values (00_GLOBAL §14)

## Admin

- FO ไม่มี admin scope — BO moderation/admin view = contract นอก module นี้ (18_ADMIN_SCOPE_NOTE)

---

# 8. Data Model

## 8.1 `PF_ASSETS` — active drawer asset record

| Field | Rule |
| --- | --- |
| `id` | `pfa-NN` (seed) / `pfa-x{ts}` (composer) — key ของ `pfasset:`/`sell:` routes + `post.assetId` link |
| `img` / `photos[]` | cover + hero carousel source (`data-pfaid` swipe) |
| `name` / `ref` / `meta` / `brand` | display identity — name = brand+model หรือ caption ≤42 (`cfToPortfolio` mapping canonical 04) |
| `status` | `sale`/`show`/`hide` เท่านั้น (`PFO_STATUS`) — `sold` ไม่อยู่ใน model นี้ (ย้าย `PF_SOLD`) |
| `market` | mock market price (`null` = ไม่มี market data — record จาก composer/materialize เป็น `null` เสมอ) |
| `purchase` | ราคาซื้อ (private) — `null`/`0` = ไม่มี cost basis |
| `bought` | วันที่ซื้อ ISO `YYYY-MM-DD` (`""` = ไม่มี) |
| `asking` | ราคาตั้งขาย — optional; ใช้ Expected profit + Market comparison + sell-form prefill |
| `own` | ownership flag — `own === false` = consignment/ไม่ใช่ของตัวเอง → หลุด `pfoEligible` (ไม่มี seed/UI ที่ set — copy-only feature, D12) |

## 8.2 `PF_SOLD` — sold record

| Field | Rule |
| --- | --- |
| `id` | `pfs-NN` (seed) / `pfa-NN`/`pfa-x{ts}` carry-over (asset id เดิม — `sold:{id}` ใช้ key เดิม) / `pfs-x{ts}` (`soldFromPost` materialize) |
| `img` / `photos[]` / `name` / `ref` / `brand` | carry จาก asset/post |
| `soldDate` | วันที่ขาย ISO — จาก sell form |
| `price` | ราคาขาย — จาก sell form (`null` → แสดง `N/A`) |
| `purchase` / `bought` | cost basis carry-over — ใช้ Realized G/L + Holding period (`null`/`""` → `—`/`N/A`) |

> **ไม่มี** Buyer / Contact / Payment Method / Attachment ใน record model — spec เดิมกำหนด 6 ฟิลด์ (D3)

## 8.3 Module globals

| Global | Rule |
| --- | --- |
| `PF_MKT_UPDATED` | mock "last market sync" date (fixed `2026-10-07`) — แสดง `Last price update` เมื่อ asset มี `market` |
| `PFO_STATUS` | `sale`→`Sale`/`st-sale`, `show`→`Show`/`st-show`, `hide`→`Hide`/`st-hide` — status chip labels (EN constants; `Show`/`Hide` ถูก observer แปล — §16) |
| `PFO_CMP` | `above`→`Above market`/`cmp-above`, `at`→`At market`, `below`→`Below market` (EN-only — leftover) |
| `PFO_SRC` | `mkt`→`Latest market price`, `fb`→`Purchase price estimate`, `none`→`No market price` |
| `scr._pfoSim` | per-screen dev sim state (`""`/`nomkt`/`empty`/`failed`/`denied`) — `?dev` only (§15) |

## 8.4 Session persistence

- `PF_ASSETS`/`PF_SOLD` **ไม่อยู่**ใน `clearUserData`/`snapPosts`/`restoreUserData` — mutation (composer adds, mark-as-sold moves, materialized records) ค้างข้าม session switch (deviation D9 — class เดียวกับ `BOARD` flags ใน 12 D8 / post flags ใน 11 D7)
- `pfkind:"sold"` บน linked posts ก็ไม่ reset (`pfkind` ไม่อยู่ใน `POST_FLAG_KEYS`) — consistent กับ persistence ข้างบน

---

# 9. Value Math Contract (canonical — module นี้เป็นเจ้าของ)

## 9.1 Eligibility

```text
pfoEligible(a) = a.status ∈ {sale, show, hide} AND a.own !== false
```

- `own === false` = consignment → excluded (UI/seed ไม่มีจริง — copy+flag เท่านั้น, D12)
- `sold`/deleted/perm-hidden ไม่อยู่ใน `PF_ASSETS` เลย จึง excluded โดยโครงสร้าง (delete semantics canonical 04)

## 9.2 Current value (per asset)

```text
pfoCur(a, mktOff):
  if !mktOff AND a.market != null        → { v: a.market,   src: "mkt" }
  if a.purchase != null AND a.purchase>0 → { v: a.purchase, src: "fb"  }
  else                                   → { v: null,       src: "none"}
```

- `mktOff` = dev-sim `nomkt` เท่านั้น (ไม่ใช่ runtime flag จริง)
- Source labels: `PFO_SRC` — `Latest market price` / `Purchase price estimate` / `No market price`

## 9.3 Unrealized gain/loss

```text
pfoGL(a, mktOff) = (mktOff OR market==null OR purchase==null OR purchase<=0) ? null : market − purchase
display = pfoSignTHB(gl) + " (" + pfoPct(gl, purchase) + ")"   // +฿N (+N.N%) / −฿N (−N.N%)
```

- Purchase-fallback rows **ไม่นับ** G/L (ไม่มี market price จริง)
- สี up/dn class เมื่อ gl != null

## 9.4 Expected profit (sale listing เท่านั้น)

```text
pfoExp(a) = (asking != null AND purchase > 0) ? asking − purchase : null
```

- ใช้ใน Listing card (`pfasset` sale) + live preview `sell-gl` บน sell form (sale-price − purchase)

## 9.5 Market comparison

```text
pfoCmp(a, mktOff):
  asking == null          → null
  mktOff OR market==null  → "none"
  p = (asking − market)/market × 100  →  p > 1 : "above" | p < −1 : "below" | else "at"
```

- ±1% dead band → `At market`; purchase fallback **ไม่เคย**ใช้ใน comparison
- `null`/`none` → แสดง `ไม่มีราคาตลาด`/`No market price` (ข้อความเดียวกัน — quirk D13: เคส asking==null ก็ขึ้น "No market price")

## 9.6 Holding period

```text
pfoHold(from, to?):
  !from          → null
  b < a          → null            // to < from → invalid
  d = round((b − a)/864e5)         // days; to default = now (device local)
  txt = y ? "{y}y {m}m" : m ? "{m}m" : "{d}d"   // y=⌊d/365⌋, m=⌊(d%365)/30.4⌋
```

- ยังไม่ขาย: `pfoHold(a.bought)` — จบที่วันนี้; sold: `pfoHold(x.bought, x.soldDate)`
- แสดง `{d} วัน · {txt}` (TH) / `{d} days · {txt}` (EN) — `—`/`N/A` เมื่อ null
- timezone = device-local `new Date()` — ไม่มี `Asia/Bangkok` explicit (quirk — spec เดิมระบุ BKK)

## 9.7 Dashboard totals

```text
els      = PF_ASSETS.filter(pfoEligible)
invested = els.filter(a => a.purchase != null && a.purchase > 0)
total    = Σ invested.purchase                       // → "THB N" headline
mktTotal = mktOff ? null : Σ els.(market || 0)       // รวม asset ที่ไม่มี purchase ด้วย
glRows   = els.filter(gl != null)                    // market+purchase>0 เท่านั้น
glSum/glBase = Σ glRows.gl / Σ glRows.purchase
```

- **Headline = `Total invested` = Σ purchase** — ไม่ใช่ Σ current value (D2)
- Market line แสดง `Market value ฿{mktTotal} · {pfoPct(glSum, glBase)}` **เฉพาะเมื่อ** `mktTotal != null && glRows.length > 0` — ถ้าไม่มี GL-computable row เลย → `Market value unavailable` แม้บาง asset จะมี `market` (quirk D10)
- Coverage = `ต้นทุนซื้อของ {invested.length}/{els.length} รายการ` — นับ invested (มี purchase) บน eligible ทั้งหมด — **ไม่ใช่** "คำนวณจาก X/Y" ของ spec เดิม (D11)

## 9.8 Realized gain/loss (sold เท่านั้น)

```text
soldDetail: gl = (x.purchase > 0) ? x.price − x.purchase : null
display = "กำไร/ขาดทุนที่เกิดขึ้นจริง/Realized gain/loss " + pfoSignTHB(gl) + " (" + pfoPct(gl, purchase) + ")"
```

- แยกจาก portfolio value เสมอ — note `กำไร/ขาดทุนที่เกิดขึ้นจริงจะแยกออกจากมูลค่าพอร์ตโฟลิโอ`

## 9.9 Formatting

| Helper | Output |
| --- | --- |
| `pfoTHB(n)` | `฿N` (`toLocaleString("en-US")`) |
| `pfoSignTHB(n)` | `+฿N` / `−฿N` (unicode minus) / `฿N` |
| `pfoPct(d, b)` | `+N.N%` / `−N.N%` — `abs(d)/b*100` ทศนิยม 1 ตำแหน่ง |
| `pfoDate(iso)` | `d Mon yyyy` en-GB — observer แปลเป็น พ.ศ. ใน TH mode (§16) |
| headline total | `THB N` (ตัวหนังสือ THB ไม่ใช่ ฿ — ต่างจาก rows, quirk D14) |
| Estimated market band | `market ±5%` ปัดเป็น 500 (`round(m*0.95/500)*500` – `round(m*1.05/500)*500`) |

---

# 10. Portfolio Dashboard (`portfolio`)

## Anatomy (top→bottom)

1. `detail-head`: `sub-back` + title `พอร์ตโฟลิโอ`/`Portfolio` + `pfo-more` (เฉพาะ `?dev=1`; production = invisible spacer)
2. `pfoSimBar` (เมื่อ sim active — `Preview: {name}` + Reset)
3. `pfo-banner` เมื่อ `nomkt` sim: `ไม่พบราคาตลาดบางรายการ — ซ่อนการเปรียบเทียบราคาตลาด`/`Some market prices are unavailable — market comparison hidden`
4. `.pfo-total` headline card:
   - `ต้นทุนรวม`/`Total invested` + lock icon `ส่วนตัว`/`Private` tag
   - `THB {total}` (Σ purchase)
   - `มูลค่าตลาด`/`Market value` `฿{mktTotal}` · `±N.N%` (up/dn color) **หรือ** `ไม่พบข้อมูลมูลค่าตลาด`/`Market value unavailable`
   - coverage: `ต้นทุนซื้อของ X/Y รายการ · มีเพียงคุณเท่านั้นที่เห็น`/`Purchase cost of X/Y assets · only you can see this`
5. `.pfo-sec`: `รายการนาฬิกา`/`Assets` + `{els.length}` count + `pfo-soldlink` → `ประวัติการขาย →`/`Sold history →` (history icon)
6. Rows (`pfoRowHTML` — `.mrow.pfo-row` → `pfasset:{id}`): img + name + `ref · meta` + **purchase price** (`฿N` หรือ `—` เมื่อ purchase==null/<=0) — **rows แสดง cost basis ไม่ใช่ current value** (D15)
7. Foot note: `นับเฉพาะนาฬิกาที่คุณเป็นเจ้าของในสถานะ ลงขาย โชว์ และ ซ่อน — ไม่รวมรายการที่ขายแล้ว ลบ ซ่อนถาวร หรือสินค้าฝากขาย`/`Counts Sale, Show & Hide pieces you own — sold, deleted, permanently hidden and consignment items are excluded.`

## Rules

- List = `PF_ASSETS.filter(pfoEligible)` — ลำดับ array เดิม (unshift ใหม่ขึ้นก่อน — composer/materialize unshift)
- Empty conditions → empty state (§18): `state.session !== "member"` OR `sim === "empty"` OR `!els.length`
- `nomkt` sim → banner + `mktTotal = null` → Market line = `Market value unavailable` + rows fallback purchase (ยังแสดง list ปกติ)
- ไม่มี search/filter/sort/pagination — list เดียวจบ
- ไม่มี Add Asset entry ภายในหน้า (เพิ่มผ่าน own profile `+`/empty-tab CTA — canonical 04/06)

---

# 11. Portfolio Asset Detail (`pfasset:{id}`)

## Anatomy

1. `detail-head`: back + title `รายละเอียดนาฬิกา`/`Asset`
2. Hero: `detail-hero` `data-pfaid` + `photo-counter 1/N` + `photo-dots` (swipe carousel — shared `photoCtx`/`applyPhoto`; multi-photo เท่านั้นที่มี dots)
3. `.pfd-id`: `pfd-name` + `pfd-meta` (`ref · meta · brand`) + status chip `PFO_STATUS` (Sale/Show/Hide)
4. **Value card** (`pfo-card` + `pfo-privtag` lock `ส่วนตัว`/`private`) — rows (`pfd-kv`):

   | Label (TH/EN) | Value |
   | --- | --- |
   | มูลค่าปัจจุบัน/Current value | `pfoCur` → `฿N` หรือ `—` |
   | ที่มาของมูลค่า/Value source | `PFO_SRC[src]` |
   | ราคาประเมินตลาด/Estimated market | `market ±5%` band (ปัด 500) หรือ `—` เมื่อไม่มี market |
   | อัปเดตราคาล่าสุด/Last price update | `pfoDate(PF_MKT_UPDATED)` หรือ `—` |
   | แหล่งข้อมูล/Data source | `TukDaeng Market Data` หรือ `—` |
   | ราคาซื้อ/Purchase price | `฿N` หรือ `—` |
   | วันที่ซื้อ/Purchased | `pfoDate(bought)` หรือ `—` |
   | กำไร/ขาดทุนที่ยังไม่เกิดขึ้น/Unrealized gain/loss | `pfoGL` → `±฿N (±N.N%)` up/dn หรือ `—` |
   | ระยะเวลาถือครอง/Holding period | `pfoHold(bought)` → `N วัน · Yy Mm`/`N days · Yy Mm` หรือ `—` |

5. **Listing card** — เฉพาะ `status === "sale"`:

   | Label | Value |
   | --- | --- |
   | ราคาตั้งขาย/Asking price | `฿{asking}` หรือ `—` |
   | กำไรที่คาดหวัง/Expected profit | `pfoExp` → `±฿N (±N.N%)` หรือ `—` (class `up` เมื่อมี — ไม่มี dn ตรงนี้, quirk D16) |
   | เปรียบเทียบตลาด/Market comparison | `PFO_CMP` chip (Above/At/Below market) หรือ `ไม่มีราคาตลาด`/`No market price` |

6. `Mark as sold` primary button (`data-sell`) — เฉพาะ `pfoEligible(a)` → `openSellForm` → `sell:{id}`
7. Foot note: `ข้อมูลเฉพาะเจ้าของ — จะไม่แสดงบนโปรไฟล์สาธารณะของคุณ`/`Owner-only data — never shown on your public profile.`

## Rules

- lookup `PF_ASSETS` เท่านั้น — id ไม่เจอ (รวม sold ที่ย้ายแล้ว) → empty `ไม่พบข้อมูล` (§18)
- ไม่มี Edit/Delete/status actions บนหน้านี้ — edit/delete อยู่ post level (canonical 02/04); sold = terminal
- `pfoCur`/`pfoGL` บนหน้านี้ใช้ `mktOff=false` เสมอ — dev sim `nomkt` ไม่ follow เข้า detail (quirk D17)
- Show/Hide asset ไม่มี Listing card (ไม่มี asking concept บน surface นี้)

---

# 12. Sold History (`soldhist`) + Sold Detail (`sold:{id}`)

## `soldhist` list

- `detail-head`: back + title `ประวัติการขาย`/`Sold history`
- Desc: `บันทึกข้อมูลนาฬิกาที่ขายแล้วจะเก็บไว้ที่นี่ และไม่นำไปรวมกับมูลค่าพอร์ตโฟลิโอ`/`Sold pieces keep their sale record here — they're never counted in portfolio value.`
- Rows (`.mrow.pfo-row` → `sold:{id}`): img + name + `ขายแล้วเมื่อ {date}`/`Sold {date}` + sale price `฿N` (`N/A` เมื่อ null)
- ลำดับ = `PF_SOLD` array (unshift → ขายล่าสุดขึ้นก่อน)
- Empty → history icon + `ไม่พบข้อมูล`/`No data found`

## `sold:{id}` detail

1. `detail-head`: back + title `รายการที่ขายแล้ว`/`Sold item`
2. Hero `data-pfaid` + counter/dots (swipe เหมือน pfasset)
3. `.pfd-id`: name + `ref · brand` (`N/A` เมื่อว่างทั้งคู่) + `ขายแล้ว`/`Sold` chip (ใช้ class `st-hide` — muted style)
4. `.pfo-total` headline: `ราคาขาย`/`Sale price` `฿N`/`N/A` + Realized G/L line (เมื่อ `purchase > 0`): `กำไร/ขาดทุนที่เกิดขึ้นจริง`/`Realized gain/loss` `±฿N (±N.N%)` up/dn
5. **Sale record card** (private tag): `วันที่ขาย`/`Sale date` `pfoDate(soldDate)` + `ราคาขาย`/`Sale price`
6. **Return card**: `ราคาซื้อ`/`Purchase price` (`N/A`) + `ระยะเวลาถือครอง`/`Holding period` `pfoHold(bought, soldDate)` (`N/A`)
7. Foot note: `กำไร/ขาดทุนที่เกิดขึ้นจริงจะแยกออกจากมูลค่าพอร์ตโฟลิโอ`/`Realized gain/loss is separate from portfolio value.`

## Rules

- Record fields = sale price + sale date + carried cost basis เท่านั้น — **ไม่มี buyer/contact/payment method/attachment** (D3)
- lookup `PF_SOLD` เท่านั้น — not found → `ไม่พบข้อมูล` (sad icon)
- `soldFromPost` materialize (canonical 04): โพสต์ sold ที่ไม่มี `assetId` link → สร้าง record `pfs-x{ts}` จาก post specs/caption — `soldDate` default วันนี้, `price` fallback `post.sold.price` → `post.price`, `purchase`/`bought` ว่าง — แล้ว `post.assetId = rec.id` (link กลับ)
- ไม่มี edit/delete/revert บน sold record — `sold` terminal (04 §12)

---

# 13. Mark as Sold (`sell:{id}`)

## Entries

| Entry | Condition | Path |
| --- | --- | --- |
| `pfasset:{id}` → `data-sell` button | `pfoEligible(a)` | `openSellForm` → `openSubOver` push `sell:{id}` |
| Own-post menu `บันทึกการขาย`/`Mark as sold` (`pm-own-sold`) | `pfKind(post)` ∈ sale/show/hide (canonical 02_FEED menu) | ไม่มี `assetId` → `assetFromPost(post)` materialize → `openSellForm`; เปิดจาก viewer → `pmDropCovered` snap sheet |

## Form anatomy (`sellFormHTML`)

1. `detail-head`: back + title `บันทึกการขาย`/`Mark as sold`
2. `sell-hero`: img + brand + model (name ตัด prefix brand) + ref + status chip `PFO_STATUS`
3. Note: `ข้อมูลเป็นส่วนตัว — รายการจะย้ายไปประวัติการขายและหลุดจากมูลค่าพอร์ตโฟลิโอโดยอัตโนมัติ`/`Private data — the piece moves to Sold history and drops out of portfolio value automatically.`
4. `ราคาขาย (บาท)`/`Sale price (THB)` * — `sell-price` numeric input, auto-comma ผ่าน shared price-input handler (`.flt-pmin,.flt-pmax,.sell-price` — `unNum`/`fmtNum`), prefill `asking` เมื่อมี, placeholder `เช่น 449,000`/`e.g. 449,000`
5. `กำไรที่คาดหวัง`/`Expected gain` (`sell-gl`, `data-aid`) — เฉพาะเมื่อ `a.purchase > 0`; initial = `asking − purchase`; **live update** ตาม `sell-price` input → `+price − purchase` (`±฿N (±N.N%)` up/dn, `—` เมื่อ price ≤ 0)
6. `วันที่ขาย`/`Sale date` * — `sell-date` `type="date"`, `value` = วันนี้, `max` = วันนี้ (ขายย้อนหลังได้ ขายอนาคตไม่ได้)
7. `sell-save` primary button: `บันทึกการขาย`/`Save sale record`

## Validation (`.sell-save` click)

| Field | Condition | Error (TH/EN) |
| --- | --- | --- |
| `sell-price` | `!price OR +price <= 0` | `กรุณากรอกราคาขาย`/`Sale price required` |
| `sell-date` | `!date` | `กรุณาเลือกวันที่ขาย`/`Sale date required` |
| `sell-date` | `validity.badInput OR validity.rangeOverflow` | `วันที่ขายไม่ถูกต้อง`/`Invalid sale date` |

- inline `pe-err` + `.is-err` + `focus()` ฟิลด์แรกที่ผิด — clear ทั้งคู่ก่อน validate
- ฟอร์มมีแค่ 2 ฟิลด์ — ไม่มี buyer/contact/payment/attachment fields (D3)

## Save transition (`markAssetSold` — transition mechanics canonical 04 §12)

1. `PF_ASSETS` splice record ออก → `PF_SOLD.unshift` `{id, img, photos, name, ref, brand, soldDate, price, purchase, bought}` (id เดิม — asset id กลายเป็น sold record id)
2. ทุก linked post (`POSTS` + `PF_MINE` + `PF_GFX_REG` ที่ `assetId` เดียวกัน) → `pfkind = "sold"` + `refreshPostViews` (หลุด feed + profile `ขายแล้ว` tab — lifecycle 00_GLOBAL §12)
3. Stack: ตัด `sell:{id}` + `pfasset:{id}` ทิ้งจาก `_subStack` → push `sold:{id}` — ghost clone เก็บหน้าฟอร์มไว้ 340ms ขณะ sold detail slide เข้า (`zIndex` lift เมื่อ `rp-over`)
4. Toast `บันทึกการขายแล้ว · ย้ายไปประวัติการขาย ✓`/`Sale recorded · moved to Sold history ✓` + asset thumb

## Rules

- `sold` = terminal — ไม่มี revert/un-sold path ใน V1
- sold record เก็บ `purchase`/`bought` carry-over เพื่อคำนวณ Realized G/L + Holding บน `sold:{id}`
- asset ที่ `market` เป็น null (composer/materialize) บันทึกขายได้ปกติ — ไม่ block ด้วย valuation
- เมื่อ `purchase <= 0`/null: ฟอร์มไม่มี Expected gain row; sold detail ไม่มี Realized G/L line (`price` ยังบันทึกปกติ)

---

# 14. Privacy & Access Rules

## Owner-Only Rule

- ทุก surface ของ module นี้เป็น owner-only — private tags แสดงบน dashboard headline (`ส่วนตัว`/`Private`), pfasset Value card (`ส่วนตัว`/`private`), sold Sale record card (`ส่วนตัว`/`private`)
- Private fields ตาม 00_GLOBAL §14: `purchase`, `bought`, `soldDate`, `price` (sale record), Total invested, market value, G/L ทุกชนิด, Expected profit, Holding period — **ต้องไม่ปรากฏ**บน public surfaces (feed/search/detail/public profile/viewer)
- Viewer profile ไม่มี `.pf-pfo` (canonical 06 — viewer actions = Follow/Chat เท่านั้น); routes ไม่รับ user param → ไม่มี "portfolio ของคนอื่น" ให้ deny

## Reachability (แทน active permission checks)

- `portfolio` entry = own profile เท่านั้น → guest เข้าไม่ได้ (profile nav gated) — **gate เกิดที่ entry ไม่ใช่ในหน้า**
- `[data-sub]`/`.pf-pfo` **ไม่อยู่**ใน `GUEST_GATE_SEL` — ไม่ต้อง gate เพราะ button ไม่เคย render ให้ guest กด
- ถ้า non-member session หลุดมาถึง `portfolio` ด้วยวิธีใดก็ตาม → empty state `ไม่พบข้อมูล` (guard `state.session !== "member"`) — ไม่แสดง denied เพราะถือว่า "ไม่มีข้อมูลของ session นี้" (D6)

## Denied State (dev-only contract)

- `denied` sim render: lock icon + `ไม่ได้รับอนุญาต`/`Permission denied.` + `พอร์ตโฟลิโอเป็นข้อมูลส่วนตัว — มีเพียงเจ้าของเท่านั้นที่เห็น`/`Portfolios are private — only the owner can see this.`
- เป็น `?dev` preview เท่านั้น — เก็บเป็น **contract** สำหรับ implement (production ใช้ reachability + empty guard แทน active deny)

## Guest Gate

| Action | Guest result |
| --- | --- |
| เปิด `portfolio`/`pfasset`/`soldhist`/`sold`/`sell` | entry ไม่มีให้ guest (unreachable); ถ้าหลุด → empty state |
| `.pm-own-sold`/`.pm-own-soldview` (own-post menu) | `GUEST_GATE_SEL` → Member Sheet `Join TukDaeng` (มาก่อน handler — แต่ guest ไม่มี own posts เลยไม่ถึงเมนูนี้) |
| Browse public profile/posts | canonical 06/02 — ไม่เกี่ยวกับ portfolio |

> "Global Login Required Dialog" (ชื่อเดิมในเอกสาร v1.0-era) = Member Sheet `Join TukDaeng` surface เดียวกัน (00_GLOBAL §11 rename-trace)

---

# 15. Dev Preview States (`PFO_SIMS` — `?dev=1` only)

- `pfo-more` (dots icon บน dashboard head) → `pm` sheet: `Preview states (prototype)` — `Normal` / `Market prices unavailable` / `Empty portfolio` / `Load failed` / `Viewer access — permission denied` (check = active)
- `data-pfosim` → `scr._pfoSim` + `renderSub`; simbar `Preview: {PFO_SIMS[sim]}` + `Reset` แสดงบนหน้าที่ sim เปลี่ยน render (`denied`/`empty`/`dashboard` — `failed` ไม่มี simbar)
- `pfo-retry` (บน failed state) → reset sim → `renderSub` ("ลองใหม่อีกครั้ง" ใน sim = กลับ normal — ไม่มี retry logic จริง)

| Sim | Render |
| --- | --- |
| `nomkt` | banner + `mktTotal=null` → `Market value unavailable` + `pfoCur` fallback purchase ทุก row (detail ไม่ follow — D17) |
| `empty` | wallet icon + `ไม่พบข้อมูล`/`No data found` + `นาฬิกาที่คุณระบุสถานะ ลงขาย โชว์ หรือ ซ่อน จะแสดงที่นี่`/`Assets you list as Sale, Show or Hide will appear here.` |
| `failed` | sad icon + `ไม่สามารถโหลดข้อมูลได้`/`Unable to load data.` + `ลองใหม่อีกครั้ง`/`Try again` |
| `denied` | lock icon + `ไม่ได้รับอนุญาต`/`Permission denied.` + explainer (§14) |

- **production ไม่มีเมนูนี้** — sims เป็น prototype preview เท่านั้น; เก็บ denied/failed เป็น state contract สำหรับ implement (D7)

---

# 16. Language & Copy

- แปลผ่าน `isTh` ternary inline ทุกจุดหลัก (labels/notes/titles/toasts/errors) — ไม่มี dict block เฉพาะ portfolio
- `I18N_TH` dict ช่วย observer (MutationObserver — canonical language contract): `Latest market price`→`ราคาตลาดล่าสุด`, `Show`→`แสดง`, `Hide`→`ซ่อน`, `No data found`→`ไม่พบข้อมูล`, `TukDaeng Market Data`→`ข้อมูลตลาดตึกแดง`, `Try again`→`ลองอีกครั้ง`
- `i18nTr` date pattern: `pfoDate` output `d Mon yyyy` → `d มิ.ย. 2566` (พ.ศ.) ใน TH mode
- **EN-only leftovers** (flag → FSP-026 sweep):
  - `PFO_STATUS` chip `Sale` (ไม่มี dict key — `Show`/`Hide` แปลแต่ `Sale` ค้าง EN → chip ผสมภาษา)
  - `PFO_CMP` chips `Above market`/`At market`/`Below market`
  - `PFO_SRC` `Purchase price estimate`/`No market price`
  - `N/A` fallbacks (sold rows/return card — `N/A` แปลเฉพาะใน spec-row context เท่านั้น)
  - `days`/`y`/`m` suffixes ใน holding period (`{d} วัน · {y}y {m}m`)
  - Dev-sim UI ทั้งก้อน (`Preview states (prototype)`, sim names, `Reset`) — dev-only จึงไม่นับ user-facing
  - headline `THB` prefix (dashboard) vs `฿` (rows/cards) — format inconsistency (D14)

---

# 17. Notification Rules

- Portfolio **ไม่สร้าง alert/notification** — mark-as-sold, value changes, market updates ไม่มี in-session generation (Alerts feed canonical [09_NOTIFICATION_MODULE.md](09_NOTIFICATION_MODULE.md))
- ไม่มี "Notification Center" — rename-trace เท่านั้น (canonical = Alerts feed)
- Market-movement/valuation alerts = future (§23)

---

# 18. Empty / Error / Toast Copy

| State | Icon | TH | EN |
| --- | --- | --- | --- |
| Portfolio empty / non-member | wallet | `ไม่พบข้อมูล` + `นาฬิกาที่คุณระบุสถานะ ลงขาย โชว์ หรือ ซ่อน จะแสดงที่นี่` | `No data found` + `Assets you list as Sale, Show or Hide will appear here.` |
| Sold history empty | history | `ไม่พบข้อมูล` | `No data found` |
| `pfasset`/`sold`/`sell` not-found | sad | `ไม่พบข้อมูล` | `No data found` |
| Denied (dev sim) | lock | `ไม่ได้รับอนุญาต` + `พอร์ตโฟลิโอเป็นข้อมูลส่วนตัว — มีเพียงเจ้าของเท่านั้นที่เห็น` | `Permission denied.` + `Portfolios are private — only the owner can see this.` |
| Load failed (dev sim) | sad | `ไม่สามารถโหลดข้อมูลได้` + `ลองใหม่อีกครั้ง` | `Unable to load data.` + `Try again` |
| nomkt banner (dev sim) | clock | `ไม่พบราคาตลาดบางรายการ — ซ่อนการเปรียบเทียบราคาตลาด` | `Some market prices are unavailable — market comparison hidden` |
| Sell validation | — | `กรุณากรอกราคาขาย` / `กรุณาเลือกวันที่ขาย` / `วันที่ขายไม่ถูกต้อง` | `Sale price required` / `Sale date required` / `Invalid sale date` |
| Save success toast | — | `บันทึกการขายแล้ว · ย้ายไปประวัติการขาย ✓` | `Sale recorded · moved to Sold history ✓` |

---

# 19. Deviations & Quirks (spec เลือก prototype — documented, not contract)

| # | Deviation | Note |
| --- | --- | --- |
| D1 | ไม่มี Total Asset Value figure บน profile | entry = wallet icon `.pf-pfo` ล้วน (C1 gap — เขียน spec ตาม prototype; placement canonical 06) |
| D2 | Headline = `Total invested` (Σ purchase) ไม่ใช่ Σ current value | dashboard = cost-basis-centric; market value เป็น secondary line (C3 gap) |
| D3 | Sold record = price + date เท่านั้น | ไม่มี Buyer/Contact/Payment Method/Attachment ใน model/form/detail (C7 gap — spec v1.0 ต้องการ 6 ฟิลด์) |
| D4 | `sellable` = sale/show/hide (ไม่ใช่ sale only) | drawer asset Show/Hide บันทึกการขายได้ (C6 gap) |
| D5 | ไม่มี Top Brand Holdings / YTD | `PF_YTD_OPEN` ถูกตัดโดยตั้งใจ (`minimal dashboard` — B14 gap) |
| D6 | Non-member → empty state ไม่ใช่ denied | `state.session !== "member"` guard → `ไม่พบข้อมูล`; denied มีเฉพาะ dev sim (C16 gap) |
| D7 | Denied/failed = `?dev` preview เท่านั้น | production ไม่มี load/denied path (B17 gap) |
| D8 | Market data = mock | `market` field + `PF_MKT_UPDATED` fixed + `TukDaeng Market Data` label + ±5% band — ไม่มี real API boundary; composer/materialize records `market:null` เสมอ |
| D9 | `PF_ASSETS`/`PF_SOLD`/`pfkind` ไม่ reset ข้าม session | `clearUserData`/`POST_FLAG_KEYS` ไม่แตะ — sold marks + mutations ค้าง (class เดียวกับ 12 D8/11 D7) |
| D10 | Market line ต้องการ ≥1 GL-computable row | `mktTotal != null && glRows.length` — asset ที่มี market แต่ทุกตัวไม่มี purchase → `Market value unavailable` แม้มี market data |
| D11 | Coverage นับ invested ไม่ใช่ valued | `ต้นทุนซื้อของ X/Y` — X = มี purchase; spec เดิม "คำนวณจาก X/Y" (valued) ผิด (B16 gap) |
| D12 | Consignment = copy + flag เท่านั้น | foot note กล่าวถึง `สินค้าฝากขาย`/`consignment` + `own` flag รองรับ แต่ไม่มี seed/UI ที่ set `own:false` (B15 gap; Consignment Center dead ใน hb drawer) |
| D13 | `asking == null` → Market comparison แสดง `No market price` | `pfoCmp` null → label เดียวกับ no-market (misleading — ปัญหาคือไม่มี asking); เกิดได้บน sale asset ที่ไม่ใส่ asking |
| D14 | `THB` prefix บน headline vs `฿` บน rows/cards | format ไม่ consistent ในหน้าเดียวกัน |
| D15 | Dashboard rows แสดง **purchase** ไม่ใช่ current value | `pfo-val` = `a.purchase` — สอดคล้อง headline invested (list แสดงต้นทุน) |
| D16 | Expected profit row ใช้ class `up` เมื่อมีค่าเสมอ | `ex != null ? "up" : ""` — ไม่มี `dn` เมื่อขาดทุนคาดหวัง (ตัวเลขยังถูก แค่สี) |
| D17 | `nomkt` sim ไม่ follow เข้า `pfasset` detail | detail เรียก `pfoCur(a, false)` เสมอ — sim มีผลเฉพาะ dashboard view |
| D18 | `sold` chip ใช้ `st-hide` class | sold chip style ยืม Hide (muted) — ไม่มี `st-sold` |
| D19 | Holding period ใช้ device-local date | `new Date()` ไม่มี `Asia/Bangkok` explicit; `m` = ⌊d%365/30.4⌋ approximation |
| D20 | ไม่มี delete บน portfolio surfaces | delete เกิด post level เท่านั้น; drawer record ของโพสต์ที่ถูกลบ dangling (canonical 04 §13) |
| D21 | Analytics events = contract-only | ไม่มี tracking layer ใน prototype (เหมือน modules อื่น — §20) |

---

# 20. Analytics Events (contract — prototype ไม่มี tracking layer)

- `portfolio_opened` (`.pf-pfo` tap)
- `portfolio_asset_opened` (`pfasset:{id}` view)
- `sold_history_opened` (`soldhist` view)
- `sold_record_opened` (`sold:{id}` view)
- `mark_as_sold_started` (`sell:{id}` open + entry source: `pfasset` / `post-menu`)
- `mark_as_sold_completed` (`markAssetSold` success)
- `portfolio_denied_viewed` (contract — dev sim ไม่นับ)

---

# 21. Acceptance Criteria

## AC-PORT-001: Portfolio Reachable From Own Profile Only

Given member อยู่บน own profile  
When กด wallet icon `.pf-pfo`  
Then ระบบ push `portfolio` บน sub stack  
And viewer profile ของ user อื่นต้องไม่มี `.pf-pfo`  
And ต้องไม่มีตัวเลข portfolio value บน profile head (entry = icon ล้วน)

## AC-PORT-002: Guest Cannot Reach Portfolio

Given session `guest`  
When guest browse app  
Then ต้องไม่มี entry ใดถึง `portfolio`/`pfasset`/`soldhist`/`sold`/`sell` (own profile gated ผ่าน `[data-navgo="profile"]` → Member Sheet `Join TukDaeng`)  
And ถ้า `portfolio` ถูก render ด้วย session ไม่ใช่ `member` ต้องแสดง empty state `ไม่พบข้อมูล`/`No data found` + explainer — ไม่ใช่ denied

## AC-PORT-003: New Member Sees Empty Portfolio

Given session `new` (fresh account ไม่มี asset)  
When เปิด `portfolio`  
Then ต้องแสดง wallet icon + `ไม่พบข้อมูล`/`No data found` + `นาฬิกาที่คุณระบุสถานะ ลงขาย โชว์ หรือ ซ่อน จะแสดงที่นี่`/`Assets you list as Sale, Show or Hide will appear here.`

## AC-PORT-004: Eligibility Filter

Given `PF_ASSETS` มี records หลาย status  
When dashboard render list  
Then ต้องแสดงเฉพาะ `pfoEligible` = status ∈ `sale`/`show`/`hide` AND `own !== false`  
And `sold` records ต้องอยู่ `PF_SOLD` (ไม่ปรากฏใน list)

## AC-PORT-005: Dashboard Headline = Total Invested

Given eligible assets บางตัวมี `purchase > 0`  
When dashboard render `.pfo-total`  
Then headline ต้องแสดง `ต้นทุนรวม`/`Total invested` + lock `ส่วนตัว`/`Private` tag + `THB {Σ purchase}`  
And coverage line = `ต้นทุนซื้อของ {invested}/{eligible} รายการ · มีเพียงคุณเท่านั้นที่เห็น`

## AC-PORT-006: Market Value Line

Given มี ≥1 asset ที่ `market != null && purchase > 0` และ sim ไม่ใช่ `nomkt`  
When dashboard render  
Then ต้องแสดง `มูลค่าตลาด`/`Market value` `฿{Σ market}` · `±N.N%` (glSum/glBase) พร้อม up/dn class  
When ไม่มี GL-computable row เลย หรือ sim `nomkt`  
Then ต้องแสดง `ไม่พบข้อมูลมูลค่าตลาด`/`Market value unavailable`

## AC-PORT-007: Asset Rows Show Purchase Value

Given dashboard rows render  
Then แต่ละ row ต้องแสดง img + name + `ref · meta` + `฿{purchase}` (`—` เมื่อ purchase null/≤0)  
And tap → `pfasset:{id}`  
And section head = `รายการนาฬิกา {N}`/`Assets {N}` + `ประวัติการขาย →`/`Sold history →` link → `soldhist`

## AC-PORT-008: Current Value Source Priority

Given asset เปิดใน `pfasset:{id}`  
When คำนวณ `Current value`/`Value source`  
Then `market != null` → `฿{market}` + `Latest market price`  
And `market == null && purchase > 0` → `฿{purchase}` + `Purchase price estimate`  
And ไม่มีทั้งคู่ → `—` + `No market price`

## AC-PORT-009: Market-Dependent Value Rows

Given asset ไม่มี `market` (composer/materialize records)  
When `pfasset:{id}` render Value card  
Then `Estimated market`/`Last price update`/`Data source` ต้องแสดง `—`  
And `Unrealized gain/loss` ต้องแสดง `—` (ต้องมี market+purchase>0 ถึงคำนวณ)

## AC-PORT-010: Unrealized Gain/Loss Formula

Given asset มี `market` และ `purchase > 0`  
When render `Unrealized gain/loss`  
Then ต้องเท่ากับ `market − purchase` แสดง `±฿N (±N.N%)` (base = purchase) + up/dn class  
And purchase-fallback rows ต้องไม่ถูกนับ (src `fb` → `—`)

## AC-PORT-011: Listing Card Sale Only

Given `pfasset:{id}` ของ asset status `sale`  
Then ต้องแสดง Listing card: `Asking price` + `Expected profit` (`asking − purchase`, `±฿N (±N.N%)`, `—` เมื่อคำนวณไม่ได้) + `Market comparison` chip  
And status `show`/`hide` ต้องไม่แสดง Listing card

## AC-PORT-012: Market Comparison ±1% Band

Given sale asset มี `asking` และ `market`  
When คำนวณ `pfoCmp`  
Then `(asking − market)/market × 100` > 1% → `Above market` chip; < −1% → `Below market`; อื่น → `At market`  
And `market == null` (หรือ `nomkt` sim) → `ไม่มีราคาตลาด`/`No market price` — **ห้าม**ใช้ purchase fallback ใน comparison

## AC-PORT-013: Mark As Sold Entries

Given eligible asset (`sale`/`show`/`hide` + own)  
Then `pfasset:{id}` ต้องแสดง `Mark as sold` (`data-sell`) → `sell:{id}`  
And own-post menu บนโพสต์ `pfKind` ∈ sale/show/hide ต้องมี `บันทึกการขาย`/`Mark as sold` row — โพสต์ไม่มี `assetId` ต้อง `assetFromPost` materialize ก่อนเปิดฟอร์ม  
And โพสต์ `sold`/`post` kind ต้องไม่มี row นี้

## AC-PORT-014: Sell Form Anatomy + Prefill

Given `sell:{id}` เปิด  
Then ต้องแสดง sell-hero (img + brand + model + ref + status chip) + private note + `Sale price (THB) *` (prefill `asking` เมื่อมี, auto-comma numeric) + `Sale date *` (`type=date`, default+max = วันนี้) + `Save sale record`  
And เมื่อ `purchase > 0` ต้องมี `Expected gain` row ที่ live-update ตาม `sell-price` (`price − purchase`, `±฿N (±N.N%)`, `—` เมื่อ ≤0)  
And ต้องไม่มี buyer/contact/payment/attachment fields

## AC-PORT-015: Sell Form Validation

Given `sell-save` กด  
When price ว่าง/≤0 → error `กรุณากรอกราคาขาย`/`Sale price required`  
When date ว่าง → `กรุณาเลือกวันที่ขาย`/`Sale date required`  
When date `badInput`/`rangeOverflow` → `วันที่ขายไม่ถูกต้อง`/`Invalid sale date`  
Then แสดง inline `pe-err` + `.is-err` + focus ฟิลด์แรกที่ผิด — ไม่ save

## AC-PORT-016: Mark As Sold Transition

Given save ผ่าน validation  
When `markAssetSold` ทำงาน  
Then asset ต้องย้าย `PF_ASSETS` → `PF_SOLD` (id เดิม + `soldDate`/`price` + carry `purchase`/`bought`)  
And ทุก post ที่ `assetId` เดียวกันต้อง `pfkind = "sold"` + `refreshPostViews`  
And stack ต้องตัด `sell:{id}`/`pfasset:{id}` ทิ้ง → push `sold:{id}` (sold detail slide เข้า)  
And toast `บันทึกการขายแล้ว · ย้ายไปประวัติการขาย ✓`/`Sale recorded · moved to Sold history ✓`  
And asset ต้องหลุดจาก portfolio list/value ทันที

## AC-PORT-017: Sold History List

Given `PF_SOLD` มี records  
When เปิด `soldhist`  
Then ต้องแสดง desc + rows (img + name + `ขายแล้วเมื่อ {date}`/`Sold {date}` + `฿{price}`/`N/A`) ลำดับล่าสุดก่อน  
And row tap → `sold:{id}`  
And empty → `ไม่พบข้อมูล`/`No data found`

## AC-PORT-018: Sold Record Detail

Given `sold:{id}` valid  
Then ต้องแสดง hero + name + `ref · brand` + `ขายแล้ว`/`Sold` chip + headline `ราคาขาย`/`Sale price`  
And เมื่อ `purchase > 0` ต้องแสดง `กำไร/ขาดทุนที่เกิดขึ้นจริง`/`Realized gain/loss` `±฿N (±N.N%)` (price − purchase, base = purchase)  
And Sale record card (private tag) = `Sale date` + `Sale price` เท่านั้น  
And Return card = `Purchase price` + `Holding period` (`soldDate − bought`)  
And ต้องไม่มี buyer/contact/payment/attachment rows  
And invalid id → `ไม่พบข้อมูล`

## AC-PORT-019: View Sale Record From Sold Post

Given own post `pfkind === "sold"`  
When own-post menu → `ดูประวัติการขาย`/`View sale record` (`pm-own-soldview` แทน Edit)  
Then `soldFromPost` ต้องคืน linked `PF_SOLD` record หรือ materialize `pfs-x{ts}` (soldDate = วันนี้, price fallback post price, cost fields ว่าง) → เปิด `sold:{id}`  
And post `assetId` ต้อง link กลับ record ที่ materialize

## AC-PORT-020: Private Data Never On Public Surfaces

Given portfolio/sold/private fields (`purchase`, `bought`, `soldDate`, sale `price`, totals, G/L, expected profit, holding)  
When render feed/search/detail/public profile/viewer surfaces  
Then ต้องไม่แสดงค่าเหล่านี้ (00_GLOBAL §14; detail boundary canonical 05)

## AC-PORT-021: Dev Sims Dev-Only

Given production (ไม่มี `?dev=1`)  
When dashboard render  
Then head ต้องไม่มี `pfo-more` (invisible spacer) และไม่มีทางเข้าถึง sims  
Given `?dev=1` + `pfo-more` → เลือก sim  
Then `nomkt` → banner + `Market value unavailable`; `empty` → empty state; `failed` → failed + `Try again` (reset sim); `denied` → denied copy

## AC-PORT-022: Sold Is Terminal

Given record อยู่ `PF_SOLD`  
Then ต้องไม่มี revert/edit/delete path บน sold surfaces  
And `sold` post ต้องไม่มี `Edit`/`Mark as sold` ใน own-post menu (เห็น `View sale record` แทน — canonical 04 §12)

---

# 22. Related Modules

- [00_GLOBAL_RULES_MODULE.md](00_GLOBAL_RULES_MODULE.md) — §7 session model, §9 statuses, §10 visibility, §11 Member Sheet gate, §14 private data
- [00_NAVIGATION_AND_CROSS_MODULE_FLOW.md](00_NAVIGATION_AND_CROSS_MODULE_FLOW.md) — §6.6 routes, §6.7 sub stack back, §12 deep-link contract
- [02_FEED_MODULE.md](02_FEED_MODULE.md) — own-post menu anatomy/rows canonical (`pm-own-sold`/`pm-own-soldview`), composer internals
- [04_ASSET_MANAGEMENT_MODULE.md](04_ASSET_MANAGEMENT_MODULE.md) — drawer record lifecycle canonical: `cfToPortfolio`/`assetFromPost`/`soldFromPost`/`assetId`/`pfkind`/`markAssetSold` transition/delete semantics/cost field capture
- [05_ASSET_DETAIL_MODULE.md](05_ASSET_DETAIL_MODULE.md) — post detail layer + private-data boundary
- [06_PROFILE_MODULE.md](06_PROFILE_MODULE.md) — `.pf-pfo` entry placement + own-profile anatomy + sold tab reachability
- [09_NOTIFICATION_MODULE.md](09_NOTIFICATION_MODULE.md) — Alerts feed canonical (portfolio ไม่สร้าง alert)
- [15_TRUST_SAFETY_MODULE.md](15_TRUST_SAFETY_MODULE.md) — report flows (ไม่เกี่ยวกับ portfolio surfaces โดยตรง)
- [18_ADMIN_SCOPE_NOTE.md](18_ADMIN_SCOPE_NOTE.md) — BO scope boundary

---

# 23. Future Enhancement

- Real Watch Price API integration (แทน `market` mock + `PF_MKT_UPDATED`) + real unavailable/retry path
- Sold record extended fields — Buyer / Contact / Payment Method / Attachment (spec เดิม contract ที่ prototype ตัด — D3; ต้อง product sign-off ว่าจะเพิ่มใน form หรือตัดถาวร)
- Total Asset Value headline option (Σ current value) — product decision ระหว่าง invested-centric vs value-centric (D2)
- Top Brand Holdings + YTD Performance (cut per feedback — reopen ถ้า master เพิ่มกลับ)
- Consignment Center (entry dead ใน hb drawer + `own` flag + foot-note copy พร้อมรองรับ)
- Portfolio export (PDF/Excel), benchmark, allocation, brand trend, IRR
- Market-movement / valuation alerts (09 integration)
- Denied/failed production states เมื่อมี real load path


## Contract updates — canonical lock 2026-10-29 (FO-TEST hardening)

- Empty portfolio state ต้องแสดงลิงก์ "ประวัติการขาย / Sold history" เมื่อมี sold record อยู่ (owner ที่ขาย asset ชิ้นสุดท้ายยังเข้าถึง soldhist ได้เสมอ) — แก้ spec gap เดิมที่ลิงก์หายไปกับ asset list
