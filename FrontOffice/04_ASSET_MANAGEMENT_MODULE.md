# 04 Asset Management Module

อ้างอิงหลักจาก [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md) + baseline [00_GLOBAL_RULES_MODULE.md](00_GLOBAL_RULES_MODULE.md) §9–§12/§14 + [00_NAVIGATION_AND_CROSS_MODULE_FLOW.md](00_NAVIGATION_AND_CROSS_MODULE_FLOW.md) §6.6–§8 + [02_FEED_MODULE.md](02_FEED_MODULE.md) (post model / composer / own-post menu canonical) — prototype `Prototypes/fo-flow/index.html` เป็น source of truth เดียวของพฤติกรรม (FO-PRD-v1.9)

---

# 1. Document Information

| Item | Detail |
|---|---|
| Module Name | Asset Management |
| Platform | Mobile Application |
| Version | V1 |
| Owner | Product / UX / Engineering |
| Status | Draft |
| Document Type | Functional PRD - Master Aligned |

---

# 2. Objective

Asset Management Module คือ owner-private domain ของ "My Assets drawer" (ลิ้นชักสินทรัพย์) — ระบบจัดการนาฬิกาที่ member เป็นเจ้าของ: เพิ่มสินทรัพย์ผ่าน composer asset mode (drawer-first — ทุกเส้นทางสร้าง drawer record ก่อน ไม่ใช่ marketplace listing form แยก), สถานะ `Sale`/`Show`/`Hide`/`Sold` บน drawer record ที่ mirror กับ `pfkind` ของโพสต์ที่ link, purchase cost (ราคาซื้อ + วันที่ซื้อ) เป็น private cost data, และ Mark as Sold ที่ย้าย asset เข้า Sold history

โมดูลนี้ต้องคุม ownership, status lifecycle และ private data ให้ชัด — drawer record ไม่เคย public เอง การเข้าถึง public เกิดผ่าน linked post + `pfkind` เท่านั้น และ private data (ต้นทุน/ประวัติขาย/มูลค่า) ต้องไม่หลุดไปยัง public surfaces

---

# 3. Prototype Reference

Source of truth: `Prototypes/fo-flow/index.html` (read-only — ห้ามแก้)

- Composer constants (~15672–15695): `CF_TAGS` (10 hashtag chips), `CF_LOCS`/`CF_LOC_KM`, `CF_CONDS` (5 ตัวเลือก), `CF_BOXES` (4 ตัวเลือก), `CF_SPECS` (Watch Specifications 20 fields + Item Details 2 fields — free-text ทั้งหมด), `cfToday()`; `CF_MAX_MEDIA` = 10 (~15993)
- Composer UI (~15529–15879): `createHTML`/`cfPickerHTML` (step 1 — title `เพิ่มสินทรัพย์ใหม่`/`Add Asset` เมื่อ `V.mode === "asset"`), `cfStep2HTML` (step 2 — rows + **Visibility pick** `vis-opt` ~15855–15859 เฉพาะ asset mode, **Profile status pick** `stt-opt` ~15850–15854 เฉพาะ edit mode + drawer ON, `Also save to My Assets` toggle ~15860–15867, primary button `Add Asset` ~15871), `cfPaneHTML` (panes loc/price/spec/**cost** ~15718–15725/cond/more), `cfVal` (row summaries ~15742–15751)
- Drawer data (~15913–16108 + ~16318–16576): `cfToPortfolio` (draft → `PF_ASSETS` record ~15915–15926), `assetFromPost` (materialize record จาก post ~15929–15939), `soldFromPost` (materialize sold record ~15942–15958), `insertNewPost` (~15959–15990), `metaFromPost`/`openPostEdit`/`applyPostEdit` (~15992–16108 — edit sync กลับ drawer asset ~16095–16107); `PF_ASSETS` seed (~16318–16328), `PF_SOLD` (~16329–16344), `PF_MINE` (drawer-only posts ~16574–16576), `findPost`/`pfGridPosts`/`pfKind`/`pfTabPosts` (~16577–16609)
- Portfolio helpers (~16348–16382): `pfoTHB`/`pfoSignTHB`/`pfoPct`, `pfoEligible` (`status ∈ sale/show/hide && own !== false`), `pfoCur`/`pfoGL`/`pfoExp`/`pfoCmp`/`pfoHold`/`pfoDate`, `PFO_STATUS`/`PFO_CMP`/`PFO_SRC`
- Pages (~16958–17149): `pfoSimBar`/`PFO_SIMS` (dev `?dev` preview เท่านั้น), `pfoRowHTML` (~16964–16975), `portfolioHTML` (~16976–17011), `pfassetHTML` (~17012–17051), `soldHistHTML` (~17052–17066), `soldDetailHTML` (~17067–17103), `sellFormHTML` (~17106–17121), `openSubOver`/`openSellForm`/`markAssetSold` (~17124–17149)
- Entries: own-profile `+` icon (`data-flow="create" data-mode="asset"` ~16852) + `all`-tab empty-state CTA `เพิ่มสินทรัพย์ใหม่`/`Add asset` (~16826); `.pf-pfo` portfolio button บน own-profile actions row (~16887); own-post menu rows `pm-own-sold`/`pm-own-soldview` (~13920–13935) + handlers (~20501–20507)
- Handlers: composer `cf-share` asset mode (~20277–20317) + post mode (~20318–20332); `vis-opt`/`stt-opt` (~20426–20433); `.cf-f` input — `price`/`purchase` strip non-digit + auto-comma, `bought` live validation (~19990–20010); `pane-done` cost block เมื่อ date invalid (~20404–20414); `data-sell`/`sell-save` + inline `pe-err` validation + stack splice → `sold:{id}` (~21684–21728); `sell-price` → Expected gain live update (~20108–20120); `dlg-delpost-go` post delete (~20730–20744)
- Guest gate `GUEST_GATE_SEL` + `obGate` (~22997–23012): `[data-flow]` (composer entries) + `.pm-btn` (post menus) + profile tab gated → Member Sheet `Join TukDaeng`
- Feed/status effects: `refreshPostViews` (`show`/`hide`/`sold` ดึง card ออก feed ~13938–13949); feed eligibility filter (~14096)
- Dead/tooling (ห้ามเขียนเป็น feature): `pfo-more` dev sim bar + `PFO_SIMS` (`?dev` preview states), `POST_DETAIL_CFG`, `PF_GFX_*` registry (mock grid posts), `chsettings:{id}` dead route — ดู 00_NAV §11 prototype-tooling rule

---

# 4. Master Alignment Summary

| Area | Master Baseline |
| --- | --- |
| Status model | canonical `Sale`/`Show`/`Hide`/`Sold` เท่านั้น (00_GLOBAL §9); โพสต์ feed-only ใช้ kind `post` ไม่นับเป็น asset status |
| Visibility | ตาม 00_GLOBAL §10 — Feed = `sale` + `post`; Search/Watch Alert = `Sale` เท่านั้น; Public Profile = `Sale`+`Show`; Owner เห็นทุกสถานะ |
| Lifecycle | ตาม 00_GLOBAL §12 — transition ทุกเส้นทางมี required impact บน Feed/Search/WA/profile |
| Private data | Purchase Price, Purchase Date, Sold History, Portfolio Value Detail = private (00_GLOBAL §14) — เห็นเฉพาะ Owner/Admin |
| Add Asset | Composer asset mode (drawer-first) — ไม่ใช่ multi-step listing form; ไม่มี provenance/consignment entity (ตัดตาม sign-off เดิม) |
| Guest | Asset management ทั้งหมด member-only — guest กด gated entry ใด ๆ เจอ Member Sheet `Join TukDaeng` (00_GLOBAL §11) |
| Navigation | Routes `create` / `portfolio` / `pfasset:{id}` / `soldhist` / `sold:{id}` / `sell:{id}` ตาม 00_NAV §6.6; back ตาม §6.7 (sub stack pop) |
| Mark as Sold | entries = own-post menu + portfolio asset detail ตามที่ prototype มีจริง — Sale Record = ราคาขาย + วันที่ขายเท่านั้น |
| ไม่มีใน V1 | ฟอร์ม Add/Edit Asset แยก, Change Status sheet แยก, confirmation `Add this asset?`/`Save sale history?`, Market Data autocomplete, option-master `ระบุเอง`, provenance/consignment, payment ในแอป |

---

# 5. Scope

## In Scope

- Add Asset entries: own-profile `+` icon + `all`-tab empty-state CTA (`data-mode="asset"`)
- Composer asset mode deltas เหนือ shared composer: title/placeholder/primary `Add Asset`, **Visibility pick** `Show`/`Hide`/`Post to feed`, `Cost details (private)` row แสดงเสมอ
- Asset data model: `PF_ASSETS` drawer record + `assetId` link + `pfkind` status mirror + `PF_MINE` drawer-only posts
- Status transitions: set ตอนสร้าง (visibility), เปลี่ยนผ่าน Edit info `Profile status` pick (`stt-opt`), `post` ↔ drawer detach/link, `Sold` ผ่าน Mark as Sold เท่านั้น
- Mark as Sold: entries (own-post menu + portfolio asset detail), `sell:{id}` Sale Record form, `markAssetSold` transition, `sold:{id}` landing
- Purchase cost fields: `purchase` (ราคาซื้อ) + `bought` (วันที่ซื้อ) — private, validation,จุดที่ถูกใช้ต่อ (portfolio/pfasset/sell form/sold record)
- Asset list + asset detail: `portfolio` page anatomy + `pfasset:{id}` owner detail ในระดับ structure/fields/privacy (สูตรคำนวณมูลค่าอยู่ 14_PORTFOLIO)
- Sold history (`soldhist`) + sold record (`sold:{id}`) anatomy
- Delete asset semantics (post-level delete + drawer record behavior)
- Lifecycle impact, private data rule, guest gate, contract-only items (BO moderation states)

## Out Of Scope (module อื่นเป็นเจ้าของ)

- Composer mechanics — picker, media strip, caption/hashtags, option panes (loc/price/spec/cond/more), discard dialogs, `insertNewPost`, Edit info internals — canonical อยู่ [02_FEED_MODULE.md](02_FEED_MODULE.md) §9 (FSP-015b lock แล้ว); เอกสารนี้ระบุเฉพาะ asset-mode deltas + drawer linkage
- Own-post menu anatomy/rows — canonical 02_FEED §8/§9; เอกสารนี้ระบุเฉพาะ semantics ของ `Mark as sold`/`View sale record` entries
- Post Detail page (public-facing detail, `mf-btn`, `wl-btn`) — [05_ASSET_DETAIL_MODULE.md](05_ASSET_DETAIL_MODULE.md) (FSP-018)
- Portfolio analytics/valuation — current value, unrealized/realized G-L, expected profit, market comparison, holding period, totals, `PFO_SIMS` states, market-price contract — [14_PORTFOLIO_MODULE.md](14_PORTFOLIO_MODULE.md) (FSP-024)
- Profile shell/grid/tabs/follow — [06_PROFILE_MODULE.md](06_PROFILE_MODULE.md) (FSP-019); เอกสารนี้ระบุเฉพาะ entry + status tab mapping
- Watch Alert internals — [10_WATCH_ALERT_MODULE.md](10_WATCH_ALERT_MODULE.md) (FSP-021); WA toast simulation หลัง `Post to feed` อยู่ 10/02
- Market Data / option-master spec options / `ระบุเอง` free-text promotion flow — ไม่มีใน V1 prototype (fields เป็น free-text ล้วน) — contract/future เท่านั้น (§9 Spec Free-Text Rule, §18)
- Provenance / Consignment entity — ไม่มีใน V1 (sign-off เดิม)
- Payment ในแอป / transaction — Phase 1 ไม่มี
- BO moderation surfaces (ซ่อนถาวร / ซ่อนชั่วคราว) — master contract เท่านั้น prototype ไม่มี (§9 Contract Notes)

---

# 6. Screen Mapping

| Screen / State | Prototype | Description |
| --- | --- | --- |
| Add Asset composer | `create` sub page · `V.mode === "asset"` | picker → step 2 — title `เพิ่มสินทรัพย์ใหม่`/`Add Asset`, primary `Add Asset`, Visibility pick, `Cost details` row เสมอ |
| My Assets drawer (list) | `portfolio` route · `portfolioHTML()` | head `พอร์ตโฟลิโอ`/`Portfolio` + Total invested (private) + `รายการนาฬิกา`/`Assets` rows + `ประวัติการขาย`/`Sold history` link |
| Portfolio asset detail | `pfasset:{id}` route · `pfassetHTML()` | hero + status chip + Value card (private) + Listing card (`sale` only) + `Mark as sold` |
| Sale Record form | `sell:{id}` route · `sellFormHTML()` | title `บันทึกการขาย`/`Mark as sold` — hero + Sale price* + Expected gain live + Sale date* + `Save sale record` |
| Sold history | `soldhist` route · `soldHistHTML()` | head `ประวัติการขาย`/`Sold history` + desc + rows `Sold {date}` + price |
| Sold record detail | `sold:{id}` route · `soldDetailHTML()` | title `รายการที่ขายแล้ว`/`Sold item` — Sale price + Realized G/L + Sale record + Return cards |
| Own-post menu asset rows | `pmOwnMenuHTML()` | `Mark as sold` (`pfkind` ∈ sale/show/hide) / `View sale record` (`sold` แทน Edit) — canonical 02_FEED |
| Member Sheet | `obGate()` | guest gate `Join TukDaeng` (00_GLOBAL §11) |

---

# 7. User States

## Guest

- เข้าถึง asset management ไม่ได้เลย — ทุก entry gated: bottom-nav Profile tab, `[data-flow]` composer (ทั้ง post/asset mode), `.pm-btn` post menus, portfolio/ sold history (อยู่ใต้ own profile ซึ่ง member-only)
- Guest ที่กด entry เหล่านั้นเจอ Member Sheet `Join TukDaeng` (00_GLOBAL §11)
- Guest เห็น public sale posts ของ seller บน feed/search/profile ตาม visibility matrix ได้ปกติ (read-only) — แต่ไม่มี asset surface ใด ๆ ของตัวเอง

## Member / Owner

- Add Asset ผ่าน own-profile `+` / empty-state CTA
- จัดการ drawer assets ของตัวเอง: เปิด `portfolio` list → `pfasset:{id}` detail → `Mark as sold` → `sell:{id}` → `sold:{id}` + `soldhist`
- เปลี่ยน status ผ่าน Edit info (own-post menu `Edit` → `Profile status` pick เมื่อ drawer ON)
- Mark as Sold จาก own-post menu (`pfkind` ∈ `sale`/`show`/`hide`) หรือ pfasset button (`pfoEligible`)
- ดู private data ของตัวเอง (purchase cost, sold history, portfolio value)

## Non Owner / Viewer

- ไม่มี asset management surface ของผู้อื่นเลย — viewer เห็นเฉพาะ posts ตาม visibility matrix (`Sale`+`Show` บน public profile); drawer/portfolio/purchase cost/sold history เป็น owner-private เสมอ
- ไม่สามารถ Edit / Delete / Change Status / Mark as Sold / เห็น private asset data

## Blocked Relationship

- Block กระทบ post surfaces ตาม 00_GLOBAL §13 (โพสต์อีกฝ่ายหาย feed/search/WA) — ไม่มี asset-management surface ให้ถูกบล็อกเพราะเป็น owner-only ทั้งโมดูล

---

# 8. User Flow

## Add Asset Flow (asset mode — 3 visibility paths)

```text
Own profile `+` หรือ `Add asset` (empty state)
→ composer `create` mode `asset` (title `เพิ่มสินทรัพย์ใหม่`/`Add Asset`)
→ Step 1 picker เลือก media (≥1 จึงกด Next ได้ — mechanics ตาม 02_FEED)
→ Step 2: caption + option rows + Visibility pick (default `โชว์`/`Show`)
→ `Add Asset`
→ สร้าง drawer record เสมอ (`cfToPortfolio`) + link `assetId`
→ กลับ own profile grid (record ใหม่อยู่บนสุด) + toast ตาม visibility
```

| Visibility | Result |
| --- | --- |
| `โชว์`/`Show` (default) | `PF_MINE` drawer-only post `pfkind:"show"` + drawer record status `show` — โชว์บน profile ไม่เข้า feed/search/WA — toast `บันทึกลงลิ้นชักและแสดงบนโปรไฟล์แล้ว ✓`/`Saved to My Assets · shown on profile ✓` |
| `ซ่อน`/`Hide` | `PF_MINE` drawer-only post `pfkind:"hide"` + record `hide` — owner-only — toast `บันทึกลงลิ้นชักแบบซ่อนแล้ว ✓`/`Saved to My Assets · private ✓` |
| `โพสต์ลงฟีด`/`Post to feed` | `insertNewPost` → feed post `pfkind:"sale"` + record `sale` + link `assetId` — toast `บันทึกลงลิ้นชักและโพสต์ลงฟีดแล้ว ✓`/`Saved to My Assets · posted to feed ✓`; WA match → toast `Watch alert matched` หน่วงตามหลัง |

- ไม่มี confirmation dialog, ไม่มี `Adding...` state, ไม่มี required field นอกเหนือ ≥1 media (primary `Add Asset` disabled จนกว่ามี media)
- Discard draft ตาม 02_FEED (asset mode → กลับ own profile)

## Post → Drawer Save Flow (post mode)

- Post mode `Share` + `Also save to My Assets` toggle ON → `insertNewPost` (`pfkind:"sale"`) + `cfToPortfolio` status `sale` + link — toast `Posted · shared to feed + My Assets ✓` (canonical 02_FEED Publish Rule)

## Status Change Flow (Edit info)

```text
Own-post menu `Edit` (โพสต์ไม่ใช่ sold)
→ `openPostEdit` — composer step 2 prefilled
→ drawer toggle ON → `Profile status` pick ขาย/โชว์/ซ่อน (stt-opt)
→ `Done` → `applyPostEdit`
→ pfkind เปลี่ยน + drawer record sync (status/fields) + surfaces refresh
→ toast `Post updated` + คืน surface เดิม
```

- Drawer toggle OFF → `pfkind:"post"` + ตัด `assetId` + ลบ drawer record (sold link คงไว้)
- Drawer toggle OFF → ON → materialize `cfToPortfolio` ถ้ายังไม่มี link

## Mark as Sold Flow

```text
Entry A: own-post menu `Mark as sold` (pfkind ∈ sale/show/hide)
  → materialize `assetFromPost` ถ้ายังไม่มี drawer link → `sell:{id}`
Entry B: pfasset page `Mark as sold` (pfoEligible)
  → `sell:{id}`
→ Sale Record form (prefill Sale price = asking; Sale date = วันนี้)
→ `Save sale record` (validate price>0 + date ไม่เกินวันนี้)
→ `markAssetSold` — asset ย้าย PF_ASSETS → PF_SOLD + linked post(s) `pfkind:"sold"`
→ stack ตัด sell:/pfasset: ทิ้ง → push `sold:{id}` (ghost slide)
→ toast `บันทึกการขายแล้ว · ย้ายไปประวัติการขาย ✓`/`Sale recorded · moved to Sold history ✓`
```

- ไม่มี confirmation dialog ก่อน save (ตาม prototype — ดู §9 Deviations)

## View Sale Record Flow

- Own-post menu บนโพสต์ `sold` → `View sale record` (`pm-own-soldview` แทน Edit) → `soldFromPost` materialize record ถ้าจำเป็น → `sold:{id}` (stack ทับผ่าน `openSubOver` เหมือน report pages)
- Portfolio → `Sold history` link → `soldhist` → row → `sold:{id}`

## Portfolio Browse Flow

- Own profile → wallet icon (`.pf-pfo`) → `portfolio` → asset rows → `pfasset:{id}` → back ตาม sub stack
- `soldhist`/`sold:{id}`/`sell:{id}` เป็น pushed pages บน stack เดียวกัน (00_NAV §6.6/§6.7)

## Delete Asset Flow

- ไม่มี delete บน drawer surfaces (`pfasset` ไม่มีปุ่มลบ) — delete เกิดที่ **post level** เสมอ: own-post menu `Delete` → dialog `Delete post?`/`This post will be permanently deleted.`/`Delete`/`Cancel` → โพสต์หายทุก surface + toast `Post deleted` (canonical 02_FEED)
- Drawer record ของโพสต์ที่ถูกลบ **ไม่** ถูกลบตามใน prototype (assetId กลาย dangling — deviation, ดู §9)

---

# 9. Business Rules

## Asset Data Model Rule

Asset = drawer record ใน `PF_ASSETS` (session memory) + linked post (ถ้ามี) — สองชั้นที่ mirror กันผ่าน `assetId`:

| Field | ความหมาย |
| --- | --- |
| `id` | `pfa-…` (seed) / `pfa-x{ts}` (สร้างใหม่) — `sold:{id}`/`pfasset:{id}`/`sell:{id}` routes อ้าง id นี้ |
| `img`/`photos` | media ของ asset — hero แรก + counter `1/N` + dots เมื่อ >1 |
| `name` | `[brand, model].join(" ")` หรือ caption slice ≤42 หรือ `Untitled asset` |
| `ref`/`meta`/`brand` | reference / `year · cond` / brand — แสดงบน rows + detail head |
| `status` | `sale`/`show`/`hide` (`PFO_STATUS` — ไม่มี `sold`: sold ย้ายออกไป `PF_SOLD`) |
| `market` | market price (seed/mock — contract อยู่ 14_PORTFOLIO; asset ที่สร้างใหม่ = `null`) |
| `purchase`/`bought` | ราคาซื้อ + วันที่ซื้อ — private cost data (Purchase Cost Rule) |
| `asking` | ราคาตั้งขาย (จาก `Add price` pane) — ใช้ prefill Sale price + expected profit |
| `own` | `pfoEligible` ต้อง `own !== false` — assets ของ owner เสมอ |

Post-side linkage:

- `post.assetId` → `PF_ASSETS.id` (หรือ `PF_SOLD.id` หลังขาย) — `findPost` ค้น `POSTS` + `PF_GFX_REG` + `PF_MINE`
- `post.pfkind` ∈ `post`/`sale`/`show`/`hide`/`sold` — mirror ของ drawer status + feed eligibility (`pfKind()` fallback: `pfkind || (price ? "sale" : "show")`)
- `PF_MINE` = drawer-only posts จาก asset mode `Show`/`Hide` — session-only, ไม่เคยเข้า `POSTS` เลยไม่มีทางรั่ว feed/search

## Status Model Rule

- Canonical statuses: `sale`, `show`, `hide`, `sold` (00_GLOBAL §9) — เก็บบน `PF_ASSETS.status` (sale/show/hide) + `post.pfkind`
- `post` เป็น kind ของโพสต์ที่ไม่ผูก drawer — ไม่ใช่ asset status (อยู่ feed + profile `ทั้งหมด` tab เท่านั้น)
- สถานะถูกกำหนด 3 ทางเท่านั้น: (1) Visibility pick ตอน Add Asset, (2) Edit info `Profile status` pick, (3) Mark as Sold → `sold`
- `sold` เป็น terminal — ไม่มีในทุก status pick, ไม่มี Edit, ไม่มี Mark as sold ซ้ำ; เส้นทางกลับไม่มีใน V1

## Visibility Matrix (canonical — 00_GLOBAL §10)

| Status | Owner Profile | Public Profile | Feed | Search | Watch Alert |
| --- | --- | --- | --- | --- | --- |
| `sale` | แสดง | แสดง | แสดง | แสดง | Match |
| `show` | แสดง | แสดง | ไม่แสดง | ไม่แสดง | ไม่ Match |
| `hide` | แสดงเฉพาะ Owner | ไม่แสดง | ไม่แสดง | ไม่แสดง | ไม่ Match |
| `sold` | แสดงเฉพาะ Owner | ไม่แสดง | ไม่แสดง | ไม่แสดง | ไม่ Match |
| `post` (ไม่ผูก asset) | แสดง | ไม่แสดง | แสดง | ไม่แสดง | ไม่ Match |

- Prototype defects ที่บันทึกไว้ใน 00_GLOBAL (ไม่ใช่ spec — implementation ต้องแก้): `salePosts()` ไม่กรอง `pfkind` → priced `hide`/`sold` post รั่วเข้า search/WA match; public `all` tab รั่ว `post`/`hide`/`sold`

## Add Asset Entry Rule

- Entry 2 จุดเท่านั้น (member-only): `+` icon บน own-profile head (`data-flow="create" data-mode="asset"`, title `เพิ่มสินทรัพย์ใหม่`/`Add asset`) + `all`-tab empty-state CTA `เพิ่มสินทรัพย์ใหม่`/`Add asset` (`pf-cta`)
- Guest → Member Sheet (`[data-flow]` ∈ `GUEST_GATE_SEL`; own profile tab เองก็ gated)
- Feed header `+` เป็น post mode (`data-flow="create"` ไม่มี `data-mode`) — ไม่ใช่ asset entry
- ไม่มี Add Asset entry ภายใน `portfolio` page (list ไม่มีปุ่มเพิ่ม)

## Asset Composer Rule (asset mode deltas)

- Composer เดียวกับ post mode ทุก mechanics (02_FEED canonical) — deltas ของ `mode === "asset"`:
  - Titles: `เพิ่มสินทรัพย์ใหม่`/`Add Asset` (ทั้ง step 1 + step 2); caption placeholder `เขียนคำอธิบายสินทรัพย์…`/`Describe this asset…`; primary `เพิ่มสินทรัพย์ใหม่`/`Add Asset` (ไม่ใช่ Share)
  - `Cost details (private)` row แสดงเสมอ (post mode แสดงเฉพาะเมื่อ drawer toggle ON)
  - **Visibility pick** (`vis-opt`) แทน drawer toggle: `โชว์`/`Show` (default) · `ซ่อน`/`Hide` · `โพสต์ลงฟีด`/`Post to feed` — copy sub:
    - Show: `แสดงในคอลเลกชันบนโปรไฟล์ให้ผู้ใช้อื่นเข้าชม`/`Shown in your profile collection for others to see`
    - Hide: `เก็บไว้ในลิ้นชักส่วนตัว — คุณเท่านั้นที่เห็น`/`Kept in your private drawer — only you can see it`
    - Post to feed: `บันทึกเข้าลิ้นชักแล้วประกาศลงฟีดทันที — สเปกตามไปอัตโนมัติ`/`Save to your drawer and post to feed — specs go along automatically`
- จบ flow กลับ own profile เสมอ (`openSub profile:{me}`) — ไม่กลับ feed, ไม่ไป asset detail
- Show/Hide path hardcode `audience:"public"` + `noComments:false` — ทิ้งค่า More options ที่ตั้งไว้ (deviation — ดู §9 Deviations)
- Draft `cpState` ไม่ persist (ตาม 02_FEED); discard dialog เหมือนกัน (กลับ own profile แทน feed)

## Spec Free-Text Rule (Asset Fields)

- Watch details = `CF_SPECS` 22 fields **free-text ทั้งหมด** — Watch Specifications 20 (Brand, Collection, Model, Reference, Case Diameter, Thickness, Lug-to-Lug, Case Material, Case Color, Bezel Material, Dial Color, Dial Pattern, Movement Type, Calibre, Power Reserve, Functions, Water Resistance, Strap/Bracelet Material, Strap Color, Clasp Type) + Item Details 2 (Year, Service History) + Description textarea
- ไม่มี option lists / autocomplete / Market Data link / `ระบุเอง` entries / suggestion pool ใน V1 — ค่าที่พิมพ์เก็บตามจริงลง `specGroups` (ค่าว่าง render `N/A` บน detail)
- เฉพาะ 2 sections ที่เป็น fixed options: `Condition` single-select 5 ค่า (`CF_CONDS`: `Brand New`/`Like New`/`Very Good`/`Good`/`Fair`) + `Box & papers` toggle 4 ค่า (`CF_BOXES`: `Full set — box & papers`/`Box only`/`Papers only`/`Watch only (no set)` — กดซ้ำยกเลิกได้); ทั้งสอง render เป็น `chips` + เพิ่มใน `Item Details`
- Clip ใช้ได้ใน asset mode เหมือน post mode (ไม่มี video-out-of-scope rule) — `clips[]` duration ต่อ slide
- Option-master / market-data autocomplete / spec_options relation / `ระบุเอง` promotion = **contract/future เท่านั้น** (ดู §18) — spec เดิมที่อ้าง structured option model + seed files ถูก override ด้วยพฤติกรรม free-text ของ prototype

## Purchase Cost Rule (private)

- Fields: `purchase` (ราคาซื้อ THB) + `bought` (วันที่ซื้อ) — owner-private เสมอ (00_GLOBAL §14); ไม่แสดงบน public surfaces ใด ๆ
- Entry: `Cost details (private)` pane — asset mode แสดงเสมอ; post mode + edit mode แสดงเมื่อ drawer toggle ON เท่านั้น
- Input behavior: ราคาซื้อ = digits-only strip non-digit เงียบ + auto-comma (`unNum`/`fmtNum`); วันที่ซื้อ = native date input `min="1900-01-01" max={วันนี้}`
- Validation (live ตอน input + block ตอน Done — ดู §11): date invalid/out-of-range → `is-err` + `pane-err` `วันที่ซื้อไม่ถูกต้อง`/`Invalid purchase date` (future → `วันที่ซื้ออยู่ในอนาคตไม่ได้`/`Purchase date can't be in the future`); `pane-done` บน cost pane ปิดไม่ได้จนกว่า date จะ valid (back `cf-pane-back` ยกเลิกได้เสมอ); ไม่มี validation บังคับกรอก — เว้นว่างได้ทั้งคู่ (optional)
- Row summary บน step 2: `THB {purchase}` หรือ `{bought date}` (สั้น — ราคามาก่อน)
- เก็บลง drawer record `purchase`/`bought` ผ่าน `cfToPortfolio` (สร้าง) / `applyPostEdit` (แก้ — sync กลับ `pa.purchase`/`pa.bought`)
- จุดที่ถูกใช้ต่อ: `portfolio` Total invested + per-row value, `pfasset` Value card (`Purchase price`/`Purchased`), `sell:{id}` Expected gain live preview, `sold:{id}` Return card + Realized G/L — สูตรทั้งหมดอยู่ 14_PORTFOLIO

## Drawer Record Rule

- ทุก asset-mode save สร้าง `PF_ASSETS` record (`cfToPortfolio`) เสมอ ก่อนผล visibility อื่น — record คือ source ของ drawer/portfolio
- `cfToPortfolio` mapping: `name` = brand+model หรือ caption ≤42 หรือ `Untitled asset`; `ref`/`meta`/`brand` จาก meta; `purchase`/`bought`/`asking` จาก cost/price fields; `market` = `null` เสมอ (record ใหม่ไม่มี market data); `status` ตาม visibility (`feed` → `sale`)
- `assetId` link: ฝั่ง post (`POSTS[0]` หรือ `PF_MINE[0]`) ชี้กลับ record — link นี้ทำให้ Edit info ย้าย status ได้ภายหลัง
- `assetFromPost` = materialize-on-demand: โพสต์ที่มี status-tab kind แต่ไม่มี link (เช่น seeded gfx post) ได้ record เมื่อ `Mark as sold` ถูกกด — seed fields จาก post specs/caption, `status` ตาม `pfkind` (default `sale`)
- `soldFromPost` = materialize-on-demand เดียวกันสำหรับ `PF_SOLD` เมื่อ `View sale record` (fixture sold posts ไม่มี link; optional fields ว่าง)
- แก้ไขผ่าน `applyPostEdit` sync กลับ drawer asset (`pa`): `status` (เมื่อ pfkind ∈ PFO_STATUS), `purchase`/`bought`/`asking`/`name`/`ref`/`meta`/`brand`/`img`/`photos`
- `post` detach (drawer OFF): splice `PF_ASSETS` + `assetId = null` — link ไป `PF_SOLD` คงไว้ (sold ตัดไม่ได้)

## Status Change Rule

- ไม่มี standalone "Change status" sheet ใน V1 — เปลี่ยนสถานะผ่าน **Edit info composer** เท่านั้น (own-post menu `Edit` → `Profile status` pick `stt-opt` เมื่อ drawer toggle ON):
  - `ขาย`/`Sale` — `แสดงในแท็บขายบนโปรไฟล์ — ใส่ราคาหรือไม่ใส่ก็ได้`/`Listed in your Sale tab — price is optional`
  - `โชว์`/`Show` — `แสดงในคอลเลกชัน ไม่ได้ลงขาย — หลุดจากฟีด`/`In your collection, not for sale — leaves the feed`
  - `ซ่อน`/`Hide` — `เก็บไว้ในลิ้นชักส่วนตัว — หลุดจากฟีด คุณเท่านั้นที่เห็น`/`Private drawer — leaves the feed, only you can see it`
- `sold` ไม่มีใน pick; โพสต์ sold → drawer toggle locked ON disabled + `รายการนี้อยู่ในประวัติการขายแล้ว`/`This item lives in your Sold history` (และ own-post menu ไม่มี Edit — เห็น `View sale record` แทน)
- `applyPostEdit`: `pfkind` = pick เมื่อ drawer ON, `post` เมื่อ OFF — sold เปลี่ยนไม่ได้ (`pfkind !== "sold"` guard); แล้ว lifecycle impact ตาม §12 ทันที (`refreshPostViews` ดึง card ออก feed เมื่อไป `show`/`hide`/`sold`)
- เลือกค่าเดิมได้ (ไม่มี same-value disabled rule — ต่างจาก spec เดิม); กด `Done` แล้ว apply เสมอ

## Mark as Sold Rule

- Entry 2 จุด (owner เท่านั้น):
  - Own-post menu `บันทึกการขาย`/`Mark as sold` (`pm-own-sold`) — แสดงเมื่อ `pfKind(post)` ∈ `sale`/`show`/`hide` (sold = final ไม่มี; `post` ไม่มี); โพสต์ที่ไม่มี drawer link ได้ `assetFromPost` materialize ก่อนเปิด form; เปิดจาก viewer → sheet snap ปิด (`pmDropCovered`)
  - Portfolio asset detail `pfasset:{id}` → `บันทึกการขาย`/`Mark as sold` button (`data-sell`) — แสดงเมื่อ `pfoEligible` (status ∈ sale/show/hide + own)
- ทั้งสอง entry เปิด `sell:{id}` เดียวกัน (`openSellForm` → `openSubOver` — stack ทับได้ทั้งบน profile/viewer)

## Sale Record Form Rule (`sell:{id}`)

- Head: back + title `บันทึกการขาย`/`Mark as sold`
- Hero: รูป + brand + model text + ref + status chip ปัจจุบัน (`PFO_STATUS`)
- Note: `ข้อมูลเป็นส่วนตัว — รายการจะย้ายไปประวัติการขายและหลุดจากมูลค่าพอร์ตโฟลิโอโดยอัตโนมัติ`/`Private data — the piece moves to Sold history and drops out of portfolio value automatically.`
- Fields (เท่าที่ prototype มี — **ไม่มี** Buyer/Contact/Payment Method/Attachment):
  - `ราคาขาย (บาท)`/`Sale price (THB)` **required** — prefill จาก `asking` เมื่อมี, digits+auto-comma, live update Expected gain ตอนพิมพ์
  - `Expected gain` row (เฉพาะเมื่อ `purchase > 0`) — `asking/purchase` diff live (`sell-gl`)
  - `วันที่ขาย`/`Sale date` **required** — native date, default วันนี้, `max={วันนี้}`
- Primary `บันทึกการขาย`/`Save sale record` — **ไม่มี confirmation dialog** (ต่างจาก spec เดิม — ดู Deviations)
- Save ผ่าน → `markAssetSold` + stack: splice `sell:{id}`/`pfasset:{id}` ทิ้ง → push `sold:{id}` (ghost clone slide ทับ) + toast `บันทึกการขายแล้ว · ย้ายไปประวัติการขาย ✓`/`Sale recorded · moved to Sold history ✓`

## Sold Transition Rule (`markAssetSold`)

- `PF_ASSETS` splice → `PF_SOLD.unshift` — record เก็บ `soldDate`, `price` (ราคาขาย), `purchase`, `bought` (carry จาก asset)
- ทุก linked post (`POSTS` + `PF_MINE` + `PF_GFX_REG` ที่ `assetId` เดียวกัน) → `pfkind:"sold"` + `refreshPostViews` — หลุด feed ทันที + lifecycle impact ตาม 00_GLOBAL §12
- Sold record เก็บเฉพาะราคาขาย+วันที่ขาย — G/L/holding คำนวณจาก cost fields ที่ carry มา (14_PORTFOLIO)

## Sold Record Rule (`sold:{id}` + `soldhist`)

- `soldhist`: head `ประวัติการขาย`/`Sold history` + desc `บันทึกข้อมูลนาฬิกาที่ขายแล้วจะเก็บไว้ที่นี่ และไม่นำไปรวมกับมูลค่าพอร์ตโฟลิโอ`/`Sold pieces keep their sale record here — they're never counted in portfolio value.` + rows (img, name, `ขายแล้วเมื่อ {date}`/`Sold {date}`, price หรือ `N/A`) → `sold:{id}`
- `sold:{id}` (`soldDetailHTML`): head `รายการที่ขายแล้ว`/`Sold item` + hero + name/ref·brand + `Sold` chip + `ราคาขาย`/`Sale price` total (+ `กำไร/ขาดทุนที่เกิดขึ้นจริง`/`Realized gain/loss` เมื่อมี purchase) + `บันทึกการขาย`/`Sale record` card (Sale date, Sale price — private tag) + `ผลตอบแทน`/`Return` card (Purchase price, Holding period — `N/A` เมื่อไม่มี) + note `กำไร/ขาดทุนที่เกิดขึ้นจริงจะแยกออกจากมูลค่าพอร์ตโฟลิโอ`
- `soldFromPost` materialize ให้โพสต์ sold ที่ไม่มี link — `soldDate` default วันนี้, `price` fallback asking/post price, optional fields ว่าง

## Asset List Rule (`portfolio` — My Assets drawer)

- Entry: own profile actions row → wallet icon (`.pf-pfo`, title `พอร์ตโฟลิโอ`/`Portfolio`) → `portfolio` route
- Anatomy (`portfolioHTML`): head back + `พอร์ตโฟลิโอ`/`Portfolio` → `pfo-total` card (`ต้นทุนรวม`/`Total invested` + `ส่วนตัว`/`Private` tag — sum เฉพาะ `purchase > 0` + `มูลค่าตลาด`/`Market value` + G/L% เมื่อคำนวณได้ ไม่งั้น `Market value unavailable` + `ต้นทุนซื้อของ N/M รายการ · มีเพียงคุณเท่านั้นที่เห็น`) → `รายการนาฬิกา`/`Assets` section (`N` count + `ประวัติการขาย`/`Sold history` link → `soldhist`) → rows `pfo-row` (img, name, `ref · meta`, purchase value `฿` หรือ `—`) → note `นับเฉพาะนาฬิกาที่คุณเป็นเจ้าของในสถานะ ลงขาย โชว์ และ ซ่อน — ไม่รวมรายการที่ขายแล้ว ลบ ซ่อนถาวร หรือสินค้าฝากขาย`/`Counts Sale, Show & Hide pieces you own — sold, deleted, permanently hidden and consignment items are excluded.`
- List = `PF_ASSETS.filter(pfoEligible)` — status `sale`/`show`/`hide` เท่านั้น (sold/deleted ไม่รวม); `nomkt` state มี banner `ไม่พบราคาตลาดบางรายการ — ซ่อนการเปรียบเทียบราคาตลาด`/`Some market prices are unavailable — market comparison hidden` (dev sim — contract อยู่ 14)
- คณิตศาสตร์ทั้งหมด (current value/G-L/market comparison/holding/YTD) → 14_PORTFOLIO canonical; เอกสารนี้ระบุเฉพาะโครง + private positioning

## Asset Detail Rule (`pfasset:{id}`)

- Head: back + `รายละเอียดนาฬิกา`/`Asset`; id ไม่เจอ → `No data found` empty
- Anatomy (`pfassetHTML`): hero (img + `1/N` counter + dots) → `pfd-id` (name, `ref · meta · brand`, status chip `PFO_STATUS`) → `มูลค่า`/`Value` card (**private tag** — Current value, Value source, Estimated market ±5%, Last price update, Data source, `ราคาซื้อ`/`Purchase price`, `วันที่ซื้อ`/`Purchased`, Unrealized gain/loss, Holding period — `—` เมื่อไม่มีข้อมูล) → `การลงประกาศ`/`Listing` card (เฉพาะ `sale` — Asking price, Expected profit, Market comparison chip หรือ `ไม่มีราคาตลาด`/`No market price`) → `Mark as sold` button (เฉพาะ `pfoEligible`) → note `ข้อมูลเฉพาะเจ้าของ — จะไม่แสดงบนโปรไฟล์สาธารณะของคุณ`/`Owner-only data — never shown on your public profile.`
- ไม่มี Edit/Delete/Change-status action บนหน้านี้ — แก้ไขทำผ่าน linked post (`Edit` info composer) เท่านั้น; action เดียวคือ Mark as sold

## Delete Asset Rule

- Delete ทำที่ post level เสมอ (ไม่มี delete บน drawer surfaces): own-post menu `Delete` → confirm `Delete post?`/`This post will be permanently deleted.`/`Delete`/`Cancel` → permanent (canonical 02_FEED Delete Rule)
- ผลตาม prototype: โพสต์ออกจาก `POSTS`/`PF_GFX_REG` + ทุก surface element + toast `Post deleted` — **drawer record (`PF_ASSETS`/`PF_SOLD`) ไม่ถูกลบตาม** → sold history ยังครบ, portfolio asset กลาย orphan (assetId dangling — deviation, contract ด้านล่าง)
- Drawer-only post (`PF_MINE`) delete = no-op ใน prototype (handler หาใน `POSTS`/`PF_GFX_REG` เท่านั้น — ไม่มี effect, ไม่มี toast) — deviation
- Contract (ตาม master — prototype ไม่ครอบ): ลบ asset ต้องเอาออกจาก owner list + public surfaces ทั้งหมด + ไม่รวม portfolio; backend/BO เก็บ record ตาม retention + audit (owner delete, before/after, timestamp); ไม่ใช่ hard delete ทันทีเว้นแต่ policy

## Private Data Rule

- Owner-private เสมอ (00_GLOBAL §14): `purchase`/`bought` (purchase cost), `PF_SOLD` records, portfolio value fields — viewer/guest ไม่เห็นบน public profile/post detail/search ใด ๆ
- Portfolio surfaces ทั้งชุด tag `ส่วนตัว`/`private`/`Private` + note `มีเพียงคุณเท่านั้นที่เห็น`/`only you can see this` / `ข้อมูลเฉพาะเจ้าของ`/`Owner-only data`
- Cost pane note: `ข้อมูลต้นทุนเป็นข้อมูลส่วนตัว — ใช้คำนวณมูลค่าและกำไร/ขาดทุนในพอร์ตโฟลิโอ มีเพียงคุณเท่านั้นที่เห็น`/`Cost details are private — they feed portfolio value and gain/loss. Only you can see them.`
- `pfasset`/`sell`/`sold`/`soldhist`/`portfolio` เป็น owner routes — non-owner ไม่มีทางเข้า (ไม่มี UI entry; deep link ไป owner-only page ต้อง Permission denied — contract, ตาม PFO_SIMS `denied` state)

## BO Moderation States (contract — prototype ไม่มี)

- ซ่อนถาวร/ซ่อนชั่วคราวจาก BO: master contract เดิมยังใช้ (owner เห็น read-only `ถูกซ่อนถาวรโดยผู้ดูแล`, ไม่ public, ไม่รวม portfolio, chat อยู่) — แต่ prototype ไม่มี surface ใด ๆ; implementation ต้อง map เข้า status model โดยไม่แตะ canonical 4 statuses
- Owner ไม่มีสิทธิ์ delete/edit/sell asset ที่ถูกซ่อนถาวร (contract)

## Lifecycle Impact (post/asset transitions)

ตาม 00_GLOBAL §12 + 03_SEARCH_FILTER lifecycle matrix + prototype effects จริง:

| Transition | Impact |
| --- | --- |
| Asset created `Show`/`Hide` (asset mode) | `PF_MINE` + `PF_ASSETS` — profile grid `ทั้งหมด`/`โชว์`/`ซ่อน` tabs; ไม่เข้า feed/search/WA เลย |
| Asset created `Post to feed` | `POSTS` `pfkind:"sale"` + `PF_ASSETS` — เข้า feed + profile `ขาย` tab + search/WA eligible + WA match toast |
| Edit info → `show`/`hide` | `pfkind` เปลี่ยน + `pa.status` sync — หลุด feed (`refreshPostViews` ลบ card) + หลุด search/WA matching; ย้าย profile tab |
| Edit info → `sale` (บน POSTS post) | เข้า feed + `ขาย` tab + search/WA eligible ใหม่ |
| Edit info drawer OFF | `pfkind:"post"` + ตัด `assetId` + ลบ `PF_ASSETS` record — อยู่ feed + `ทั้งหมด` tab เท่านั้น; หลุด status tabs/search/WA |
| `sale`/`show`/`hide` → `sold` (Mark as sold) | `PF_ASSETS`→`PF_SOLD` + linked posts `pfkind:"sold"` — หลุด feed/search/WA/profile status tabs ทันที; เข้า `ขายแล้ว` tab + `soldhist` |
| Post deleted | หายทุก surface — drawer record คงอยู่ (deviation, ดู Delete Rule) |
| Drawer-only `PF_MINE` → `sale` via Edit | `pfkind:"sale"` แต่ยังอยู่ `PF_MINE` — **ไม่เข้า feed** (PF_MINE ไม่ merge เข้า POSTS — deviation) |
| Report submitted | ไม่หายจาก surfaces จนกว่า moderation (00_GLOBAL §13) |
| ni / mute / block | หายจาก surfaces ของ viewer นั้นตาม 02_FEED Relation Flags + 00_GLOBAL §13 |

## Prototype Deviations & Dead-Code Notes (documented, not spec)

- **Add Asset ไม่มี confirmation** — spec เดิมบังคับ `Add this asset?` + `Adding...` + `Asset added.` + ไป Owner Asset Detail; prototype save ทันที + toast + กลับ own profile grid — spec เลือก prototype
- **Sale Record ไม่มี confirmation** — spec เดิมบังคับ `Save sale history?` dialog; prototype save ทันที — spec เลือก prototype
- **Sale Record fields** — prototype มีแค่ Sale price + Sale date (ไม่มี Buyer/Contact/Payment Method/Attachment ที่ spec เดิม require)
- **ไม่มี Edit Asset form / Change Status sheet** — spec เดิมมีทั้งคู่; prototype ใช้ shared Edit info composer + `Profile status` pick เท่านั้น
- **ไม่มี required fields** — media ≥1 เป็นเงื่อนไขเดียว (Next/Add Asset disabled); รูปอย่างเดียวก็ save ได้ (ต่างจาก Required Field Matrix เดิม)
- **ไม่มี `Price on request`** — โพสต์ไม่มี price = showcase (ไม่มี price tag) ไม่ใช่ label พิเศษ; price optional ทุก status
- **Spec free-text ล้วน** — ไม่มี option master/`ระบุเอง`/autocomplete (contract §18); spec เดิมที่อ้าง relation id + snapshot + suggestion pool ถูก override
- **Show/Hide path ทิ้ง More-options** — `audience`/`noComments` hardcode `public`/`false` บน `PF_MINE` record (มี UI ให้ตั้งแต่ไม่ถูกใช้)
- **Post delete ทิ้ง drawer orphan** — `PF_ASSETS`/`PF_SOLD` ไม่ถูกลบตาม → portfolio ยังโชว์ asset ที่ post ถูกลบไปแล้ว (contract: ลบต้องเอาออกทั้งคู่ — flag)
- **`PF_MINE` delete no-op** — delete บน drawer-only post ไม่มี effect เลย (handler ค้นแค่ `POSTS`/`PF_GFX_REG` — flag)
- **`PF_MINE` → `sale` ไม่เข้า feed** — flip status บน drawer-only post ไม่เคย merge เข้า `POSTS` (flag)
- **`pfKind()` fallback** — post ไม่มี `pfkind` infer จาก price (`price||type==="sale" ? "sale" : "show"`) — gfx/seed posts ไม่มี pfkind จริง
- **`pfo-more`/`PFO_SIMS`** = dev `?dev` preview tooling เท่านั้น (00_NAV §11) — `nomkt`/`empty`/`failed`/`denied` states เป็น contract ไม่ใช่ reachable UI
- **`sold` post ยังเข้า search/WA match** — `salePosts()` pfkind leak (00_GLOBAL §10 defect note — canonical คือหลุด)
- **Session-only** — `PF_ASSETS`/`PF_SOLD`/`PF_MINE`/`WATCH_ALERTS` เป็น memory state (sign-out/reset ล้าง); persistence = contract
- **EN/TH mixed** — portfolio/sell/sold surfaces มี isTh ครบ; composer toasts `Posted ·…`/`Watch alert matched` ต้องแปลไทยตาม DEC-19 (language sweep FSP-026)

---

# 10. Permission Rules

## Guest

ไม่สามารถ: เข้า own profile (tab gated), Add Asset (`[data-flow]` gated), เปิด post menus (`.pm-btn` gated → ไม่เห็น Mark as sold/Edit/Delete entries), เข้า portfolio/pfasset/sell/soldhist/sold routes (ทั้งหมดอยู่ใต้ own profile — member-only), เห็น private asset data

## Owner

สามารถ: Add Asset (composer asset mode ทุก visibility), เปิด `portfolio` → `pfasset:{id}` → `sell:{id}` → `sold:{id}` + `soldhist`, Mark as Sold จาก own-post menu (`pfkind` ∈ `sale`/`show`/`hide`) หรือ pfasset (`pfoEligible`), เปลี่ยน status ผ่าน Edit info (`Profile status` pick — ยกเว้น sold), detach drawer (toggle OFF → `post`), Delete post (confirm), ดู private data ของตัวเองทั้งหมด

## Non Owner

ไม่สามารถ: เข้า asset routes ของผู้อื่น (ไม่มี entry; contract permission denied), Edit/Delete/Change Status/Mark as Sold, เห็น private asset data — เห็นเฉพาะ public post surfaces ตาม Visibility Matrix

## Admin

Admin จัดการผ่าน Back Office เท่านั้น — ไม่ใช่ผ่าน FO Asset Management Module (ซ่อนถาวร/ชั่วคราว = contract §9)

---

# 11. Validation Rules

## Composer (asset + edit modes — asset-relevant)

- **Media**: ≥1 จึง proceed (Next/`Add Asset`/`Done` disabled เมื่อ 0; edit ลบจนเหลือ 0 → toast `Post needs at least 1 photo or clip`); ≤10 (`You can add up to 10 photos or clips`) — canonical 02_FEED
- **Purchase price** (`purchase`): digits-only — strip non-digit เงียบ + auto-comma; optional (เว้นว่างได้); `>0` implied โดย format (0/ว่าง → `null`)
- **Purchase date** (`bought`): native date `min="1900-01-01" max={วันนี้}` — live `is-err` + `pane-err`: unparseable/underflow → `วันที่ซื้อไม่ถูกต้อง`/`Invalid purchase date`; future → `วันที่ซื้ออยู่ในอนาคตไม่ได้`/`Purchase date can't be in the future`; **`pane-done` บน cost pane ปิดไม่ได้**จนกว่า date valid (re-paint error + focus; `cf-pane-back` ยกเลิกได้)
- ไม่มี required validation อื่น — caption/specs/price/condition ทั้งหมด optional (เว้นว่าง = `N/A` บน detail rows; ไม่มี price = showcase)

## Sale Record (`sell:{id}`)

- **Sale price**: required + `>0` — ว่าง/≤0 → `pe-err` `กรุณากรอกราคาขาย`/`Sale price required`
- **Sale date**: required — ว่าง → `กรุณาเลือกวันที่ขาย`/`Sale date required`; unparseable/เกินวันนี้ (`badInput`/`rangeOverflow`) → `วันที่ขายไม่ถูกต้อง`/`Invalid sale date`
- Fail → `pe-err` inline + `is-err` + focus field แรกที่ผิด; ไม่ save
- Success → `markAssetSold` (ไม่มี duplicate guard — tap ต่อเนื่องระหว่าง transition เป็น prototype edge; contract: disable ระหว่าง save)

---

# 12. Exception Handling

| Case | Prototype / Contract |
| --- | --- |
| `pfasset:{id}` / `sell:{id}` / `sold:{id}` id ไม่เจอ | sad icon + `ไม่พบข้อมูล`/`No data found` (head คงอยู่) |
| `soldhist` ว่าง | history icon + `ไม่พบข้อมูล`/`No data found` |
| `portfolio` ว่าง / guest | wallet icon + `ไม่พบข้อมูล`/`No data found` + `นาฬิกาที่คุณระบุสถานะ ลงขาย โชว์ หรือ ซ่อน จะแสดงที่นี่`/`Assets you list as Sale, Show or Hide will appear here.` |
| Portfolio load failed / denied / market unavailable | `PFO_SIMS` states — dev `?dev` preview เท่านั้น; **contract**: `Unable to load data.` + `ลองใหม่อีกครั้ง`/`Try again`, `Permission denied.`/`พอร์ตโฟลิโอเป็นข้อมูลส่วนตัว`, `nomkt` banner (canonical 14_PORTFOLIO) |
| Linked post detail หลัง delete/sold | post หาย → toast `This post is no longer available` (00_GLOBAL §11 contract: unavailable state) |
| Sell form asset หายระหว่างเปิด | `sell-save` guard `!a` → no-op (ไม่มี error UI — edge) |

---

# 13. Empty State

| Surface | Copy |
| --- | --- |
| `portfolio` ไม่มี eligible assets | `ไม่พบข้อมูล`/`No data found` + `นาฬิกาที่คุณระบุสถานะ ลงขาย โชว์ หรือ ซ่อน จะแสดงที่นี่`/`Assets you list as Sale, Show or Hide will appear here.` |
| `soldhist` ว่าง | `ไม่พบข้อมูล`/`No data found` |
| Own profile `all` tab ว่าง | `เพิ่มสินทรัพย์ชิ้นแรกของคุณ`/`Add your first asset` + `สินทรัพย์ที่บันทึกและโพสต์ที่แชร์จะแสดงที่นี่`/`Assets you save and posts you share will show up here.` + `Add asset` CTA (canonical 06_PROFILE) |
| ใช้ global empty `ไม่พบข้อมูล`/`No data found` (00_GLOBAL §11) ทุกจุดที่ไม่มี copy เฉพาะ | |

---

# 14. Notification Rules

- Asset Management ไม่สร้าง notification item เมื่อ Add/Edit/Sell/Delete
- `Post to feed` ที่ตรง Watch Alert ON ของผู้ใช้เอง → toast `Watch alert matched: {name}` หน่วง ~2 วิ (simulation — canonical 10_WATCH_ALERT; Show/Hide path ไม่มีเพราะไม่เข้า `POSTS`)

---

# 15. Analytics Events

Contract (prototype ไม่มี tracking layer — mark contract เหมือน modules อื่น):

| Event | Trigger |
| --- | --- |
| `asset_add_open` | เปิด composer asset mode |
| `asset_add_success` | `Add Asset` สำเร็จ (tag visibility `show`/`hide`/`feed`) |
| `asset_status_change` | `applyPostEdit` เปลี่ยน `pfkind` |
| `asset_mark_sold_open` | `sell:{id}` เปิด (entry: `pm-own-sold` / `data-sell`) |
| `asset_mark_sold_success` | `markAssetSold` เสร็จ |
| `asset_sold_view` | `sold:{id}` เปิด |
| `asset_delete_success` | post delete confirm |
| `portfolio_view` / `portfolio_asset_view` | `portfolio` / `pfasset:{id}` เปิด |

---

# 16. Acceptance Criteria

## Entry & Guest

| AC ID | Criteria |
|---|---|
| AC-ASSET-MGMT-001 | Guest ต้องไม่สามารถเข้าถึง asset management ได้ — `[data-flow]` composer, post menus, own profile tab ทั้งหมด gated → Member Sheet `Join TukDaeng` |
| AC-ASSET-MGMT-002 | Add Asset entry ต้องมีเฉพาะ own-profile `+` icon + `all`-tab empty-state `Add asset` CTA (`data-mode="asset"`) — feed `+` ต้องเป็น post mode ไม่ใช่ asset |
| AC-ASSET-MGMT-003 | `portfolio`/`pfasset`/`sell`/`soldhist`/`sold` ต้องเป็น owner routes — non-owner/guest ไม่มี entry และต้อง Permission denied เมื่อเข้าทางอื่น (contract) |

## Add Asset (composer asset mode)

| AC ID | Criteria |
|---|---|
| AC-ASSET-MGMT-004 | Asset mode ต้องใช้ composer เดียวกับ post mode — title `เพิ่มสินทรัพย์ใหม่`/`Add Asset`, caption placeholder `เขียนคำอธิบายสินทรัพย์…`/`Describe this asset…`, primary `Add Asset` |
| AC-ASSET-MGMT-005 | Asset mode ต้องมี Visibility pick `โชว์`/`Show` (default) · `ซ่อน`/`Hide` · `โพสต์ลงฟีด`/`Post to feed` แทน drawer toggle พร้อม sub-copy ตาม prototype |
| AC-ASSET-MGMT-006 | `Add Asset` ต้องสร้าง `PF_ASSETS` drawer record เสมอ (`cfToPortfolio`) + link `assetId` — ทุก visibility path |
| AC-ASSET-MGMT-007 | `Show` → drawer-only post `pfkind:"show"` (`PF_MINE`) — ต้องไม่เข้า feed/search/WA; `Hide` → `pfkind:"hide"` owner-only เช่นกัน |
| AC-ASSET-MGMT-008 | `Post to feed` → `insertNewPost` `pfkind:"sale"` — เข้า feed + `ขาย` tab + search/WA eligible; WA match → toast `Watch alert matched` |
| AC-ASSET-MGMT-009 | Add Asset ต้องไม่มี confirmation/`Adding...` state — save แล้วกลับ own profile grid + toast ตาม visibility (`Saved to My Assets · posted to feed ✓`/`· shown on profile ✓`/`· private ✓`) |
| AC-ASSET-MGMT-010 | Add Asset ต้องไม่มี required field นอกเหนือ ≥1 media — primary disabled จนกว่ามี media; รูปอย่างเดียว save ได้ |

## Fields & Spec Free-Text

| AC ID | Criteria |
|---|---|
| AC-ASSET-MGMT-011 | Watch details ต้องเป็น `CF_SPECS` 22 fields free-text + Description textarea — ต้องไม่มี option list/autocomplete/Market Data link/`ระบุเอง` |
| AC-ASSET-MGMT-012 | เฉพาะ `Condition` (5 fixed single-select) + `Box & papers` (4 fixed toggle) ที่เป็น options — กดซ้ำยกเลิก Box ได้; render เป็น `chips` + Item Details |
| AC-ASSET-MGMT-013 | `Add price` = digits + auto-comma optional — เว้นว่าง = showcase (ไม่มี price tag / ไม่มี `Price on request` label) |
| AC-ASSET-MGMT-014 | Clip media ต้องใช้ได้ใน asset mode เหมือน post mode (`clips[]` ≤10 รวมกับ photos) |

## Purchase Cost (private)

| AC ID | Criteria |
|---|---|
| AC-ASSET-MGMT-015 | `Cost details (private)` pane ต้องแสดงเสมอใน asset mode (post/edit mode เมื่อ drawer ON) — fields: `ราคาซื้อ` (digits+comma) + `วันที่ซื้อ` (date, min 1900-01-01, max วันนี้) + privacy note |
| AC-ASSET-MGMT-016 | Purchase date invalid → `is-err` + `pane-err` `วันที่ซื้อไม่ถูกต้อง`/`Invalid purchase date`; future → `วันที่ซื้ออยู่ในอนาคตไม่ได้`/`Purchase date can't be in the future`; `Done` บน cost pane ต้องปิดไม่ได้จนกว่า valid |
| AC-ASSET-MGMT-017 | Cost fields ต้อง optional — เว้นว่างได้; เก็บลง `purchase`/`bought` บน drawer record เท่านั้น |
| AC-ASSET-MGMT-018 | Purchase cost + sold history + portfolio value ต้อง private — ไม่แสดงบน public surfaces ใด ๆ (00_GLOBAL §14) |

## Status & Transitions

| AC ID | Criteria |
|---|---|
| AC-ASSET-MGMT-019 | Canonical statuses = `sale`/`show`/`hide`/`sold` เท่านั้น (+ kind `post` สำหรับโพสต์ไม่ผูก drawer) — `sold` ต้องไม่มีในทุก status pick |
| AC-ASSET-MGMT-020 | Status change ต้องทำผ่าน Edit info `Profile status` pick (`stt-opt` — drawer ON) เท่านั้น — ต้องไม่มี standalone Change Status sheet/Edit Asset form |
| AC-ASSET-MGMT-021 | `sold` post ต้องเป็น terminal: own-post menu แสดง `View sale record` แทน `Edit`, drawer toggle locked + `This item lives in your Sold history`, `applyPostEdit` ต้องไม่เปลี่ยน `pfkind` |
| AC-ASSET-MGMT-022 | Edit info → `show`/`hide`/`sold` ต้องดึงโพสต์ออก feed ทันที (`refreshPostViews`) + หลุด search/WA matching; → `sale` (บน feed post) ต้องเข้า feed ใหม่ |
| AC-ASSET-MGMT-023 | Drawer toggle OFF ต้องตัด `assetId` + splice `PF_ASSETS` + `pfkind:"post"` — โพสต์อยู่ feed แต่หลุด status tabs/search/WA (sold link คงไว้) |
| AC-ASSET-MGMT-024 | Visibility matrix ต้องตรง canonical 00_GLOBAL §10 ทุกช่อง (Sale/Show/Hide/Sold/post × Owner/Public/Feed/Search/WA) |

## Mark as Sold & Sale Record

| AC ID | Criteria |
|---|---|
| AC-ASSET-MGMT-025 | `Mark as sold` บน own-post menu ต้องแสดงเฉพาะ `pfkind` ∈ `sale`/`show`/`hide` — `post`/`sold` ไม่แสดง |
| AC-ASSET-MGMT-026 | `Mark as sold` ต้องเปิด `sell:{id}` โดยตรงจากทั้ง own-post menu และ pfasset button — โพสต์ไม่มี link ต้อง materialize `assetFromPost` ก่อน |
| AC-ASSET-MGMT-027 | Sale Record form ต้องมีเฉพาะ `Sale price (THB)` (prefill asking, required >0) + `Sale date` (default/max วันนี้, required) + Expected gain live (เมื่อ `purchase > 0`) — ไม่มี Buyer/Contact/Payment/Attachment |
| AC-ASSET-MGMT-028 | Save fail ต้อง inline `pe-err` (`Sale price required`/`Sale date required`/`Invalid sale date`) + focus field แรก — ต้องไม่เปลี่ยนสถานะ |
| AC-ASSET-MGMT-029 | Save ผ่านต้องไม่มี confirmation — `markAssetSold` ย้าย `PF_ASSETS`→`PF_SOLD` + linked posts `pfkind:"sold"` + push `sold:{id}` (ตัด sell/pfasset ทิ้ง) + toast `Sale recorded · moved to Sold history ✓` |
| AC-ASSET-MGMT-030 | Mark as Sold สำเร็จต้องหลุด Feed/Search/WA/profile status tabs ทันที ตาม 00_GLOBAL §12 (canonical — prototype `salePosts()` leak เป็น documented defect ไม่ใช่ spec) |
| AC-ASSET-MGMT-031 | `sold:{id}` ต้องแสดง Sale price + Realized G/L + Sale record card + Return card (N/A เมื่อไม่มี cost) + private positioning; `soldFromPost` materialize ให้โพสต์ sold ที่ไม่มี link |
| AC-ASSET-MGMT-032 | pfasset `Mark as sold` button ต้องแสดงเฉพาะ `pfoEligible` (status ∈ sale/show/hide + own) |

## Asset List & Detail

| AC ID | Criteria |
|---|---|
| AC-ASSET-MGMT-033 | `portfolio` ต้องเข้าจาก own-profile wallet icon เท่านั้น — แสดง Total invested (Private tag) + `Assets` rows + `Sold history` link + exclusion note; list = `pfoEligible` เท่านั้น |
| AC-ASSET-MGMT-034 | `pfasset:{id}` ต้องแสดง hero + status chip + Value card (private) + Listing card (เฉพาะ `sale`) + `Mark as sold` — ต้องไม่มี Edit/Delete action บนหน้านี้ |
| AC-ASSET-MGMT-035 | `soldhist` ต้องแสดง desc exclusion note + rows `Sold {date}` + price/`N/A` → `sold:{id}`; ว่าง → `No data found` |
| AC-ASSET-MGMT-036 | Missing id บน `pfasset:`/`sell:`/`sold:` ต้อง `No data found` empty + head คงอยู่ |

## Delete & Lifecycle

| AC ID | Criteria |
|---|---|
| AC-ASSET-MGMT-037 | Delete ต้องอยู่ที่ post level เท่านั้น — confirm `Delete post?`/`This post will be permanently deleted.` + permanent + toast `Post deleted`; ไม่มี delete บน drawer surfaces |
| AC-ASSET-MGMT-038 | Post deleted ต้องหายทุก surface; stale link → `This post is no longer available` (contract: unavailable state) — drawer record behavior ตาม Delete Rule contract (prototype orphan = deviation) |
| AC-ASSET-MGMT-039 | Private data ต้องไม่หลุด — purchase cost/sold/portfolio value ไม่แสดงบน viewer/public surfaces ใด ๆ |
| AC-ASSET-MGMT-040 | BO ซ่อนถาวร (contract): owner เห็น read-only + ไม่ public + ไม่รวม portfolio + owner ไม่มี delete/edit/sell rights |

---

# 17. Related Modules

- [00_GLOBAL_RULES_MODULE.md](00_GLOBAL_RULES_MODULE.md) — status model §9, visibility §10, gate §11, lifecycle §12, privacy §14
- [00_NAVIGATION_AND_CROSS_MODULE_FLOW.md](00_NAVIGATION_AND_CROSS_MODULE_FLOW.md) — routes §6.6, back §6.7, entry matrix §7
- [02_FEED_MODULE.md](02_FEED_MODULE.md) — post model, composer canonical, own-post menu, eligibility, lifecycle
- [05_ASSET_DETAIL_MODULE.md](05_ASSET_DETAIL_MODULE.md) — Post Detail (public detail page)
- [06_PROFILE_MODULE.md](06_PROFILE_MODULE.md) — profile shell/grid/status tabs/`+` entry shell
- [10_WATCH_ALERT_MODULE.md](10_WATCH_ALERT_MODULE.md) — WA matching/notifications
- [13_SETTINGS_MODULE.md](13_SETTINGS_MODULE.md) — archive/library entries
- [14_PORTFOLIO_MODULE.md](14_PORTFOLIO_MODULE.md) — valuation math, totals, G/L, market comparison, sold history analytics
- [15_TRUST_SAFETY_MODULE.md](15_TRUST_SAFETY_MODULE.md) — report/block effects
- [16_INTEGRATIONS_MODULE.md](16_INTEGRATIONS_MODULE.md) — market data contract

---

# 18. Future Enhancement

- Structured spec options: Market Data autocomplete (brand/model/reference), `spec_options` option master + `ระบุเอง` free-text promotion + suggestion pool + seed files — contract เมื่อ market-data model พร้อม (spec เดิมเก็บเป็น reference: relation `*_id` + `*_snapshot` + BO curation flow)
- Bulk Upload / Asset Import / QR Asset Verification / Watch Authentication Service
- Provenance / Consignment (ถ้า master เพิ่ม entity)
- Sale record extended fields (Buyer / Contact / Payment Method / Attachment) — ถ้า product ต้องการ record ละเอียดกว่า price+date
- Persistence ของ drawer/sold records (ปัจจุบัน session memory)
- Un-sold / sale record correction flow ที่มี audit trail
- Delete drawer-record cascade (แก้ orphan deviation) + delete บน `PF_MINE` posts
