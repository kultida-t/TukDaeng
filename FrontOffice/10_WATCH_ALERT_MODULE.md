# 10 Watch Alert Module

อ้างอิงหลักจาก [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md) + baseline [00_GLOBAL_RULES_MODULE.md](00_GLOBAL_RULES_MODULE.md) §7 (session), §9–§10 (status/visibility — Sale-only match + `salePosts()` pfkind-leak defect note), §11 (guest gate = Member Sheet), §12 (lifecycle), §13 (block impact), §14 (private data) + [00_NAVIGATION_AND_CROSS_MODULE_FLOW.md](00_NAVIGATION_AND_CROSS_MODULE_FLOW.md) §6 (layer/routes), §7 (entry matrix), §8 (`watch` notification destination), §9 (gate routing) + [03_SEARCH_FILTER_MODULE.md](03_SEARCH_FILTER_MODULE.md) (`sr-wa` search entry + `waCriteriaFromSearch`/`waName` canonical — FSP-016 lock) + [05_ASSET_DETAIL_MODULE.md](05_ASSET_DETAIL_MODULE.md) (`mf-btn` detail entry + `modelKey` canonical — FSP-018 lock) + [02_FEED_MODULE.md](02_FEED_MODULE.md) (composer publish → `_waHits` toast — FSP-015b lock) + [09_NOTIFICATION_MODULE.md](09_NOTIFICATION_MODULE.md) (`watch` alert feed row canonical — FSP-021) + [13_SETTINGS_MODULE.md](13_SETTINGS_MODULE.md) (library row + `walerts` entry + notif toggle + delete-account copy — FSP-013/014 lock) — prototype `Prototypes/fo-flow/index.html` เป็น source of truth เดียวของพฤติกรรม (FO-PRD-v1.9)

---

# 1. Document Information

| Item | Detail |
|---|---|
| Module Name | Watch Alert — spec เดิมตีความเป็น Search-Filter-only entry + Result List + required-name validation; prototype คือ shared bottom sheet (3 entries) + Settings list page + in-memory match engine บน post pool |
| Platform | Mobile Application |
| Version | V1 |
| Owner | Product / UX / Engineering |
| Status | Draft |
| Document Type | Functional PRD - Master Aligned |

---

# 2. Objective

Watch Alert ให้ Member บันทึกชุด criteria (snapshot จาก search query/filters หรือ spec ของโพสต์) ไว้ติดตาม listing ใหม่ — เมื่อโพสต์ `Sale` ใหม่ตรง criteria ต้องแจ้งเตือนเจ้าของ alert และเปิด Post Viewer ของโพสต์ที่ match โดยตรง (**ไม่มี Result List คั่นใน V1**)

โมดูลนี้ต้องคุม: 3 entry points ที่เปิด sheet เดียวกัน (`sr-wa` search bell / `mf-btn` post-detail bell / Edit บน list row), criteria model + 3 match modes (`all`/`any`/`model`) พร้อม live match count `N now`, alert name auto-generate (ว่างก็ regen ไม่ block), dedupe ด้วย `waSig`/`modelKey`, Watch Alerts list page (`walerts`) ที่ pause/resume/edit/delete, bell-state sync กลับ detail (`modelFollowing`) และ guest gate — โดยยึดพฤติกรรม prototype เป็นตัวตัดสินเมื่อ spec เดิมขัดกัน

---

# 3. Prototype Reference

Source of truth: `Prototypes/fo-flow/index.html` (read-only — ห้ามแก้)

- Store + modes: `WATCH_ALERTS` + `waSeq` (~16322–16323 — in-memory; row `{id:"wa{n}", name, source:"search"|"detail", criteria[{l,v,fk?,min?,max?}], matchMode, modelKey|null, on}`), `WA_MODES` (~16324–16328 — `all`/`any`/`model` + title/desc/badge), `naSpec` (~16329 — กรองค่า `N/A`), `WA_FK_LABEL` (~16330–16333 — fk map brand/model/cond/ref/year/csz/move/dial/strap/deliv)
- Criteria snapshot: `waCriteriaFromPost` (~16336–16359 — pick spec ที่ map + strap concat + `SEARCH_DELIV` `delivMatch` + unmapped spec rows; ข้าม `N/A` + mapped labels รวม `Asking Price`/`Estimated Market Price`/`Last Price Update`/`Data Source`/`Box & Papers`), `waCriteriaFromSearch` (~16361–16372 — keyword `fk:"q"` + ทุก filter value ตาม `WA_FK_LABEL` + price `fk:"price"` `{min,max}` label `THB {min|0} – {max|Any}`)
- Match engine: `critMatch` (~16374–16393 — semantics ต่อ fk), `alertMatch` (~16394–16402 — criteria ว่าง = match เฉพาะ mode `all`), `alertMatchCount` (~16403 — บน `salePosts()`), `waSig` (~16404 — criteria signature `fk||l:v` sort join `¦`), `waName` (~16405–16410), `salePosts` (~14426 — `price && !ni && !muted && !blocked` — **ไม่ filter pfkind** → defect note)
- Model-follow sync: `modelKeyOf` (~16412 — `brand|model|ref` lowercase), `syncModelFlags` (~16413–16416 — ON alert ที่ modelKey ตรง → `p.modelFollowing`; `"||"` ไม่นับ), `refreshMfBtns` (~16417–16425 — `.mf-btn` `.on` + title `Following this model`)
- Sheet + list: `waModesHTML` (~16427–16445 — mode rows + `N now`/`{n} รายการในขณะนี้` live count + `any`/`model` disabled เมื่อ criteria ว่าง), `waSheetHTML` (~16449–16463 — shared sheet `wa`/`wa-open`; title Create/Edit; `.wa-name` prefilled; `wa-go` CTA; `wa-del` เฉพาะ edit), `waRowHTML` (~16464–16483 — `.wa-row` + `.wa-off` เมื่อ paused; name + criteria text ` · `-join + `Edit` badge + mode label + `{n} matches now` + `wa-tgl` switch), `walertsHTML` (~16484–16491 — head `sub-back` + title `การแจ้งเตือนนาฬิกา`/`Watch Alerts` + desc + rows/empty)
- Entries: `sr-wa` บน results head (~14806–14813 — `on` เมื่อ alert `source:"search"` sig ตรง), `mf-btn` บน Post Detail `act-right` (~13479 — canonical entry semantics อยู่ 05 §9), settings row `data-sub="walerts"` + `WATCH_ALERTS.length` count (~17380)
- Handlers: `mf-btn` (~22126–22144 — modelKey dedupe ทุก source → edit; ใหม่ → `waCriteriaFromPost` draft `source:"detail"` mode `all`; criteria ว่าง → `No details on this post to watch` ไม่เปิด sheet), `wa-mode` (~22147–22158 — เก็บ name input เข้า draft ก่อน re-render sheet), `wa-go` (~22159–22191 — name `trim() || waName(criteria)`; edit → update + `Watch alert updated`; create → dedupe `waSig`+`matchMode` → dupe = เปิด edit เดิม + `You already saved this alert`; push + `Watch alert on`; sync flags + renderSub), `wa-del` (~22192–22205 — **ลบทันทีไม่ confirm** + `Watch alert removed`), `wa-tgl` (~22206–22218 — `a.on` flip + `Watch alert on`/`Watch alert paused`), `.wa-badge` Edit (~22219–22228), `sr-wa` (~22229–22241 — dedupe by sig ทุก source → edit draft; ใหม่ → `source:"search"`)
- WA hit simulation: `insertNewPost` คำนวณ `POSTS[0]._waHits` (~16201 — ON alerts ที่ match โพสต์ใหม่); toast `Watch alert matched: {name}` `(+N more)` หน่วง ~2.1–2.4s หลัง publish toast (~20525–20527 asset `Post to feed`, ~20541–20543 post share, ~19950–19957 `fo_newpost` carry)
- Route + wiring: `walerts` → `walertsHTML` (~17715); `notif_settings` toggle `walerts` (~17571 — `When new listings match your criteria`); `data-sub` generic push (canonical 13)
- Gate + session: `GUEST_GATE_SEL` รวม `.mf-btn` + `.sr-wa` (~23338/~23342); `walerts` page เข้าผ่าน Settings เท่านั้น (member-only — `.pf-menu` gated); `applySessionData`/`clearUserData` → `WATCH_ALERTS.length = 0` (~23282 — **ไม่มี restore** → alert หายทุก session switch)
- Feed side: `watch` notification rows + badge + destination — canonical [09_NOTIFICATION_MODULE.md](09_NOTIFICATION_MODULE.md)

---

# 4. Master Alignment Summary

| Topic | Master Baseline | Watch Alert Module Rule |
| --- | --- | --- |
| Entry point | spec เดิม: Search Filter เท่านั้น | **3 entries เปิด shared sheet เดียวกัน**: `sr-wa` (search results head) + `mf-btn` `Follow this model` (Post Detail — canonical 05) + `Edit` บน `walerts` row (edit-only) — prototype wins |
| Alert name | spec เดิม: required ตอน save ว่าง→block | **auto-name เสมอ** — `waName` prefill + save `trim() || waName(criteria)` regen; ไม่มี validation block (prototype wins — canonical entry อยู่ 03 §9) |
| Match rule | เฉพาะ Asset `Sale` | contract = Sale only (00_GLOBAL §10); prototype `salePosts()` = priced post ทุกสถานะ (`pfkind` leak — defect บันทึกแล้ว S-10, ดู §9 Match Pool Rule) |
| Criteria editing | spec เดิม: แก้ name/criteria/toggle | **criteria = snapshot ไม่แก้ใน sheet** — edit ได้แค่ name + `matchMode` (+ delete); เปลี่ยน criteria = สร้าง alert ใหม่ (prototype wins) |
| Delete | spec เดิม: ต้อง confirm | **instant delete** ใน sheet — ไม่มี confirm dialog (prototype wins — deviation flag) |
| Notification destination | post ที่ match โดยตรง ไม่มี Result List | ตรง 00_NAV §8 — `watch` row → Post Viewer (canonical 09); match feedback ตอน publish = toast simulation `_waHits` |
| Empty state | `ไม่พบข้อมูล`/`No data found` | copy เฉพาะ `No watch alerts yet — tap the bell on a post or save a search to start one` (module variant ตาม 00_GLOBAL §11) |
| Guest restriction | login-required → Member Sheet | `.mf-btn`/`.sr-wa` ∈ `GUEST_GATE_SEL`; `walerts` page อยู่หลัง settings (member-only) |
| Block impact | 00_GLOBAL §13 | `p.blocked`/`p.muted`/`p.ni` ถูกกรองออกจาก `salePosts()` pool — post ของผู้ถูก block ไม่ match/นับ |
| Private data | 00_GLOBAL §14 | criteria/name/count ใช้ public fields เท่านั้น (asking price — ไม่มี purchase cost/sold history) |

---

# 5. Scope

## In Scope

- Watch Alert data model (`WATCH_ALERTS`) + alert fields + `source`/`modelKey`/`on`
- Shared Watch Alert sheet (`wa`/`wa-open`) — create + edit modes, name field, 3 match modes + live `N now` count, `wa-go` CTA, `wa-del` (edit only)
- 3 entries: `sr-wa` (search), `mf-btn` (post detail — entry semantics canonical 05), `wa-badge` Edit (list row)
- `walerts` list page — rows, criteria text, mode badge, live count, `wa-tgl` pause/resume, empty state
- Criteria schema + `critMatch`/`alertMatch`/`alertMatchCount`/`waSig`/`waName` semantics
- `modelKey` + `syncModelFlags`/`refreshMfBtns` bell sync (post detail `Following this model` state)
- Dedupe rules (sig+mode on save; sig on `sr-wa`; modelKey on `mf-btn`)
- `_waHits` publish-match toast simulation + contract notification (`watch` feed row — canonical 09)
- Guest gate + session semantics + deviations/dead notes
- Production contract layer (v1.8): relation-id option criteria, keyword-over-free-text, no-current-listing vs inactive market data, backfill re-match dedup — prototype ไม่ model (§9 Production Contract Rules)

## Out Of Scope (module อื่นเป็นเจ้าของ)

- Search filter page + `matchFilters`/`searchResults`/`specOf` internals — [03_SEARCH_FILTER_MODULE.md](03_SEARCH_FILTER_MODULE.md); เอกสารนี้ระบุเฉพาะ criteria snapshot ที่ WA ใช้
- Post Detail anatomy + `mf-btn` placement/title — [05_ASSET_DETAIL_MODULE.md](05_ASSET_DETAIL_MODULE.md)
- Composer publish flow (`insertNewPost`/`Post to feed`) — [02_FEED_MODULE.md](02_FEED_MODULE.md); เอกสารนี้ระบุเฉพาะ `_waHits` handoff
- Alerts feed rows/badge/destination — [09_NOTIFICATION_MODULE.md](09_NOTIFICATION_MODULE.md)
- Settings page structure + `notif_settings` page + library row — [13_SETTINGS_MODULE.md](13_SETTINGS_MODULE.md)
- Market Data / Option Master lifecycle (BO) — inactive/alias/backfill mechanics เป็น contract ฝั่งระบบ (§9 Production Contract Rules)
- Push transport — contract §14/§18

---

# 6. Screen Mapping

| Screen / State | Prototype | Description |
| --- | --- | --- |
| Watch Alert sheet | bottom sheet `wa`/`wa-open` (`waSheetHTML`) | shared sheet เดียวทุก entry — create/edit variant |
| Mode rows | `.wa-mode` + `.wa-rad` | radio pick `all`/`any`/`model` + `{n} now` live count + disabled state |
| Watch Alerts list | `walerts` sub page | head `sub-back` (pop กลับ Settings) + title + desc + `.wa-row` list/empty |
| List row | `.wa-row` | bell icon + name + criteria text + `Edit` badge + mode label + `{n} matches now` + `wa-tgl` toggle |
| Search bell | `.sr-wa` | results head — `on` เมื่อ search-source alert sig ตรง (canonical 03) |
| Detail bell | `.mf-btn` | Post Detail `act-right` — `Follow this model`/`Following this model` (canonical 05) |
| Member Sheet | `.ob` gate | guest gate — 00_GLOBAL §11 |

---

# 7. User States

## Guest (session `guest`)

- กด `sr-wa`/`mf-btn` → Member Sheet `Join TukDaeng` (ทั้งคู่อยู่ใน `GUEST_GATE_SEL`)
- ไม่มีทางเข้าถึง `walerts` page (เข้าผ่าน Settings ที่ gate แล้ว) — และ `WATCH_ALERTS=[]` เสมอสำหรับ non-member

## New Member (session `new`)

- สร้าง/จัดการ alert ได้เต็มเหมือน member; เริ่มต้น `WATCH_ALERTS` ว่าง → empty state

## Member

- ทุกอย่างใน §8 — create/edit/delete/toggle, bell states sync ข้าม surfaces, match toast ตอน publish

## Paused / Blocked Context

- Alert paused (`on:false`) → `.wa-off` row + ไม่นับใน `_waHits`/`modelFollowing` — criteria/count ยังแสดงปกติ
- Post ของผู้ถูก block/muted/ni → ออกจาก `salePosts()` pool → ไม่ match + ไม่นับ `N now`

---

# 8. User Flow

## Create จาก Search (`sr-wa`)

```text
Search results head -> tap bell `sr-wa`
-> waCriteriaFromSearch(S) snapshot (keyword + filters + price)
-> sig ตรง alert เดิม (ทุก source) -> เปิด sheet เป็น Edit ของ alert นั้น
-> ไม่ตรง -> draft {source:"search", matchMode:"all", name:waName(criteria)}
-> sheet -> เลือก mode (ดู N now ต่อ mode) -> Create alert
-> toast `Watch alert on` + bell `sr-wa` กลาย on
```

## Create จาก Post Detail (`mf-btn` — canonical entry 05)

```text
Post Detail act-right -> tap bell `Follow this model`
-> modelKey ตรง alert เดิม (on/off ก็ได้) -> เปิด sheet Edit ของ alert นั้น
-> ไม่มี -> waCriteriaFromPost(post) -> ว่าง -> toast `No details on this post to watch` (ไม่เปิด sheet)
-> มี -> draft {source:"detail", matchMode:"all", name:waName, modelKey}
-> save -> `Watch alert on` + bell กลาย `Following this model`
```

## Edit จาก List

```text
Settings > Watch Alerts (`walerts`)
-> tap `Edit` badge บน .wa-row -> sheet edit mode (name + modes + Save changes + Delete alert)
-> Save changes -> `Watch alert updated` | Delete alert -> ลบทันที `Watch alert removed`
```

## Pause / Resume

```text
.wa-tgl บน row -> a.on flip -> toast `Watch alert on`/`Watch alert paused`
-> syncModelFlags + refreshMfBtns (bell บน detail ตามมา) + renderSub
```

## Match Notification (simulation + contract)

```text
publish โพสต์ feed (share / Post to feed / fo_newpost carry)
-> insertNewPost คำนวณ _waHits = ON alerts ที่ alertMatch โพสต์ใหม่
-> มี hit -> toast `Watch alert matched: {name}` (+ `+N more`) หน่วง ~2 วิ หลัง toast หลัก
(contract: match จริง -> `watch` row ใน alerts feed -> tap -> Post Viewer โพสต์นั้น — 09 canonical)
```

---

# 9. Business Rules

## Alert Model Rule

- Alert fields: `id` (`wa{n}`), `name`, `source` (`"search"` | `"detail"` — กำหนด bell-state ของ `sr-wa`; settings edit ไม่เปลี่ยน source), `criteria[]` (snapshot `{l=label, v=value, fk?=filter key, min?/max?=price}`), `matchMode` (`all`|`any`|`model`), `modelKey` (`brand|model|ref` lowercase — เฉพาะ detail-created), `on` (bool)
- `WATCH_ALERTS` = in-memory store ต่อ session — **ไม่ persist** (§9 deviations)

## Criteria Snapshot Rule

- Criteria ถูก snapshot ตอนสร้าง draft — **แก้ใน sheet ไม่ได้**; เปลี่ยนเงื่อนไข = สร้าง alert ใหม่ (หรือกด entry ใหม่หลังปรับ filter)
- `waCriteriaFromSearch`: keyword `fk:"q"` (เมื่อ q ไม่ว่าง) + ทุก selected filter value map `WA_FK_LABEL` + price range `fk:"price"` `{min,max}` (label `THB {min|0} – {max|Any}`) — canonical semantics อยู่ 03 §9
- `waCriteriaFromPost`: mapped spec picks (Brand/Model/Reference/Year/Condition/Case Diameter/Movement Type/Dial Color) + Strap/Bracelet concat + `SEARCH_DELIV` ที่ `delivMatch` + **unmapped spec rows** ทั้งหมด (ข้าม `N/A` + mapped list รวม `Asking Price`/`Estimated Market Price`/`Last Price Update`/`Data Source`/`Box & Papers`)
- Criteria ว่างเปล่า = alert `Any new listing` — อนุญาต (match ทุก listing ใหม่ใน mode `all`)

## Alert Name Rule

- `waName(criteria)` auto: `Brand Model` (+` · Reference`) → `"keyword"` → criteria 2 ค่าแรก join ` · ` → `Any new listing`
- Name field prefill + editable; **ว่างตอน save → regenerate auto-name เสมอ ไม่มี validation block** (prototype wins — canonical entry rule เดียวกันใน 03 §9)

## Match Mode Rule

| Mode | Semantics (`alertMatch`) | Sheet copy (EN / TH) |
| --- | --- | --- |
| `all` | ทุก criterion ต้อง match (`every`); criteria ว่าง → match ทุก post | `Match all criteria` / `ตรงทุกเงื่อนไข` |
| `any` | ≥1 criterion match (`some`) | `Match any criteria` / `ตรงเงื่อนไขใดเงื่อนไขหนึ่ง` |
| `model` | เฉพาะ criteria `fk` ∈ {brand, model, ref} ต้อง match ทั้งหมด และต้องมี ≥1 | `Model only` / `เฉพาะรุ่น` |

- `any`/`model` disabled เมื่อ criteria ว่าง (`all` เท่านั้นที่ใช้ได้ — watch every new listing)
- แต่ละ mode row แสดง live count `{n} now`/`{n} รายการในขณะนี้` = `alertMatchCount(mode, criteria)` บน pool ปัจจุบัน

## Criterion Match Rule (`critMatch`)

| `fk` | Match semantics |
| --- | --- |
| `brand` | `eq` spec `Brand` |
| `model` | `includes` spec `Model` |
| `ref` | `eq` spec `Reference` |
| `year` | `eq` spec `Year` |
| `cond` | `eq` spec `Condition` |
| `csz` | `eq` spec `Case Diameter` |
| `move` | `includes` spec `Movement Type` |
| `dial` | `includes` spec `Dial Color` |
| `strap` | `includes` บน `Strap/Bracelet Material` + `Strap Material` concat |
| `deliv` | `delivMatch` (Box & Papers + chips regex — canonical 03) |
| `price` | `priceNum` ใน range `[min,max]` (ว่างข้างไหน = ไม่จำกัด) |
| `q` | `matchQuery` (multi-word AND substring บน haystack — canonical 03) |
| (no fk) | `eq` spec ตาม `l` label ตรง ๆ (unmapped spec rows จาก post entry) |

(`eq`/`includes` case-insensitive + trim; `N/A` ไม่เคยเข้า criteria — กรองด้วย `naSpec` ตอน snapshot)

## Match Pool Rule

- Contract: match เฉพาะโพสต์ `Sale` (00_GLOBAL §10/§12) — Show/Hide/Sold/post-only ห้าม match
- Prototype: `salePosts()` = `POSTS.filter(price && !ni && !muted && !blocked)` — **ไม่ filter `pfkind`** → โพสต์ priced `show`/`hide`/`sold` ถูกนับใน `N now`/`_waHits` (defect ที่บันทึกแล้ว S-10 — ร่วมกับ search grid; ไม่ใช่ spec)
- Blocked/muted/not-interested ถูกกรองออกจาก pool เสมอ (00_GLOBAL §13 aligned)

## Dedupe Rule

- Save create-path: `waSig(criteria)` + `matchMode` ซ้ำ alert เดิม → **ไม่สร้างใหม่** — เปิด sheet เป็น edit ของ alert เดิม + toast `You already saved this alert`
- `sr-wa` entry: sig ตรง alert เดิม **ทุก source** → เปิด edit mode; bell `on` เฉพาะเมื่อ alert ที่ตรงมี `source:"search"`
- `mf-btn` entry: `modelKey` ตรง alert เดิม (on หรือ off, ทุก source) → เปิด edit mode ของ alert นั้น

## Sheet Rule (`waSheetHTML`)

- Shared bottom sheet เดียวทุก entry — title `Create watch alert`/`สร้างการแจ้งเตือนนาฬิกา` vs `Edit watch alert`/`แก้ไขการแจ้งเตือนนาฬิกา`
- Field เดียว: `.wa-name` (label `Give this watch alert a name`, placeholder `Name this alert`) + section `Notify me when a post matches` + mode rows + CTA `Create alert`/`Save changes` + `Delete alert` (เฉพาะ edit)
- Mode pick: เก็บ name input ปัจจุบันเข้า draft ก่อน re-render (ไม่เสียชื่อที่พิมพ์)
- ปิด sheet โดยไม่ save = ไม่ commit อะไร (`_waDraft` ถูกเขียนทับตอนเปิดใหม่)
- Save: name = `input.trim() || waName(criteria)`; edit → update `name`+`matchMode` เท่านั้น (`criteria`/`source`/`modelKey`/`on` คงเดิม); create → push `{on:true}` + post-save `syncModelFlags` + `refreshMfBtns` + `renderSub`

## Watch Alerts List Rule (`walerts`)

- Entry: Settings > `การแจ้งเตือนนาฬิกา`/`Watch Alerts` (library row + `WATCH_ALERTS.length` count — canonical 13)
- Page: `sub-back` pop กลับ Settings + title + desc `Get notified when a new listing matches what you're watching.` + rows
- Row: bell icon + name + criteria text (values join ` · ` หรือ `Any new listing`) + `Edit` badge + mode label (`Match all`/`Match any`/`Model only`) + `{n} matches now` live count + pause toggle
- Paused row = `.wa-off` (visual dim) — count/ค่าอื่นยังแสดง
- Row actions: `Edit` badge → edit sheet; `wa-tgl` → pause/resume; **ไม่มี delete บน row** (delete อยู่ใน sheet edit เท่านั้น)

## Bell Sync Rule (`modelFollowing`)

- `modelKeyOf(post)` = `brand|model|ref` lowercase; `syncModelFlags` ตั้ง `p.modelFollowing` เมื่อมี **ON** alert ที่ `modelKey` เดียวกัน (alert `"||"` ว่างไม่นับ)
- `refreshMfBtns` sync `.mf-btn` `.on` + title `Following this model`/`Follow this model` ทุก surface ที่มี bell หลัง save/delete/toggle (canonical entry 05)

## Notification Rule

- Contract: ON alert match โพสต์ `Sale` ใหม่ → `watch` notification row ใน alerts feed (canonical 09 — anatomy/destination) → tap = Post Viewer โพสต์นั้นโดยตรง ไม่มี Result List
- Prototype: ไม่มี generation — feedback เดียวคือ `_waHits` toast หลัง **ตัวเอง** publish โพสต์ (simulation — ดู deviations)
- Pause (`on:false`) → ไม่นับใน `_waHits` + bell `Following` หลุด; Delete → หยุดทันที (match state หายกับ row)

## Session Rule

- Member-only feature — `new`/`guest` → `WATCH_ALERTS=[]`
- `applySessionData`/`clearUserData` → `WATCH_ALERTS.length = 0` ทุก session switch และ **`restoreUserData` ไม่ restore** → alerts หายถาวรใน session demo (deviation — persistence contract §18)

## Production Contract Rules (v1.8 — prototype ไม่ model; เก็บเป็น contract)

กฎชุดนี้คือ production matching contract ที่ spec เดิม (FO-PRD-v1.8) sign-off ไว้ — prototype เทียบ spec text ตรง ๆ ผ่าน `critMatch` ไม่มี relation/market-data concept จึงเขียนเป็น contract layer ชัด ๆ:

- **Option criteria match relation id เท่านั้น** — production ต้อง match option-based criteria (Condition/Material/Movement/Dial/Strap/Delivery) ด้วย relation id; asset ที่เก็บ spec เป็น free-text (relation `null`) ไม่ match option criteria (prototype: string `eq`/`includes` บน spec text)
- **Keyword criteria ครอบ free-text spec** — `q` ต้อง match snapshot text รวมค่า `ระบุเอง` (ตรง `matchQuery` semantics ใน prototype)
- **No current listing vs inactive market data** — entity/option `is_active=true` แต่ไม่มี listing = alert ทำงานปกติ (prototype: `N now` = 0 ได้ปกติ); `is_active=false` (deactivated) = alert เก็บ history แต่หยุด trigger ใหม่ + dependency warning (prototype ไม่มี concept)
- **Backfill re-match dedup** — BO promote suggestion/map alias → re-run match + แจ้ง match ใหม่ dedup ด้วย (`alert_id`,`asset_id`) (prototype ไม่มี)
- **Criteria อ้างได้เฉพาะ entity/option `is_active=true`** — suggestion pool ที่ยังไม่ promote ไม่ใช่ criteria (prototype: criteria คือ free-text snapshot อยู่แล้ว — contract นี้ apply ตอนมี relation model จริง)

## Deviations & Dead-Code Notes (spec เลือก prototype — documented, not spec)

1. **3 entries + shared sheet** — spec เดิมบังคับ Search Filter เท่านั้น (C1 resolved: เลือก multi-entry ตาม prototype; `sr-wa`/`mf-btn` canonical อยู่ 03/05)
2. **Name auto-regen ไม่ block** — spec เดิม required + inline validation + focus กลับช่อง; prototype `trim() || waName` เสมอ (C2 resolved)
3. **Delete instant ไม่ confirm** — spec เดิมบังคับ confirmation (C3 resolved — ส่วนอื่นใช้ dlg แต่ WA เลือก instant + toast; flag ให้ FSP-030 ตัดสิน consistency)
4. **Criteria ไม่แก้ใน sheet** — spec เดิม Edit flow แก้ criteria/toggle ได้ (C6 resolved: sheet = name + matchMode + delete เท่านั้น)
5. **`salePosts()` pfkind leak** — priced `show`/`hide`/`sold` นับเข้า `N now` + `_waHits` (S-10 defect — contract = Sale only)
6. **Match feedback = toast เท่านั้น** — `_waHits` คำนวณตอน **ตัวเอง** publish (self-match simulation — ไม่ใช่ notification item จริง); ไม่มี watch row ใหม่ใน feed จาก event จริง
7. **ไม่มี Result List** — spec เดิมมี result-list screen (resolved — notification เปิด viewer ตรง ตาม 00_NAV §8)
8. **Edit path บน `sr-wa` cross-source** — sig ตรง alert จาก detail ก็เปิด edit ได้ แต่ bell `on` เฉพาะ `source:"search"` (source-aware quirk)
9. **Paused alert ยังเป็น dedupe target** — `mf-btn`/`sr-wa` เจอ alert off ที่ตรง → เปิด edit (ไม่สร้างซ้ำ)
10. **Sheet ไม่มี Cancel/close affordance ชัดเจน** — dismiss ผ่าน backdrop/handle เท่านั้น (sheet pattern ทั่วไป)
11. **EN/TH mixed hardcode** — sheet/page มี isTh pair ครบ แต่ toasts EN-only (`Watch alert on`/`updated`/`paused`/`removed`/`You already saved this alert`/`No details on this post to watch`) + mode desc EN keys — language sweep FSP-026
12. **`WATCH_ALERTS` ไม่ restore หลัง session switch** — member sign-out/in = alert หายหมด (persistence contract §18)
13. **`notif_settings` toggle `walerts` ไม่กรองอะไรจริง** — memory flag (canonical 09 §9)
14. **ไม่มี frequency/digest/quiet-hours** — instant-match concept เท่านั้น
15. **`modelKey` ต่อ detail-created เท่านั้น** — search alert ที่ criteria เป็น brand+model+ref ล้วนไม่ได้ `modelKey` → ไม่ขับ bell `Following this model` (quirk)
16. **ไม่มี alert-per-alert notification history** — feed rows เป็น seed (09) ไม่ผูก alert id

---

# 10. Permission Rules

## Guest

| Action | Result |
| --- | --- |
| `sr-wa` (search bell) / `mf-btn` (detail bell) | Member Sheet `Join TukDaeng` |
| `walerts` page / sheet / toggles | ไม่มีทางเข้าถึง (settings gated + list ว่าง) |

## Member / New Member

ทำได้ทุกอย่างใน §8 — create/edit/delete/pause/resume; `new` เริ่มจาก list ว่าง

## Other User

- ไม่มีสิทธิ์เห็น/แก้ alert ของ user อื่น (per-session account scope)
- Alert ของฉันไม่ match post ของผู้ที่ block กัน (`p.blocked` ออกจาก pool — 00_GLOBAL §13)

---

# 11. Validation Rules

| Field / Condition | Rule |
| --- | --- |
| Alert name | ไม่มี required block — auto `waName` prefill; save `trim() || waName(criteria)` |
| Criteria | ไม่มี required field — ว่าง = `Any new listing` (mode `all` เท่านั้นใช้ได้) |
| `matchMode` | ต้องเป็น `all`/`any`/`model`; `any`/`model` disabled เมื่อ criteria ว่าง |
| Duplicate | `waSig`+`matchMode` ซ้ำ → เปิด edit เดิม + `You already saved this alert` (ไม่สร้าง) |
| `mf-btn` บนโพสต์ไม่มี criteria | `No details on this post to watch` — ไม่เปิด sheet |
| Price criterion | `min`/`max` จาก search filter (digits normalize — canonical 03) |

---

# 12. Exception Handling

| Case | Behavior |
| --- | --- |
| `mf-btn` บน post ไม่มี spec | toast `No details on this post to watch` |
| Alert ซ้ำ (save) | toast `You already saved this alert` + เปิด edit ของ alert เดิม |
| Guest กด WA entry | Member Sheet `Join TukDaeng` (ทับทุก layer) |
| Alert/row missing | contract: ไม่มี path (in-memory list สอดคล้องเสมอใน session) |
| Save/delete/toggle fail | ไม่มี async fail path — mock success เสมอ (contract §18) |
| Matched post หายก่อนเปิดจาก feed row | ตาม 09 destination fallback (watch = silent no-op — deviation) |
| Delete account | watch alerts ยกเลิกอัตโนมัติ (copy term card `Watch Alerts Cancelled` — canonical 13) |

---

# 13. Empty State

| Surface | Copy จริง |
| --- | --- |
| `walerts` list ว่าง | `No watch alerts yet — tap the bell on a post or save a search to start one` (TH `ยังไม่มีการแจ้งเตือนนาฬิกา — แตะไอคอนกระดิ่งบนโพสต์หรือบันทึกการค้นหาเพื่อเริ่มต้น`) |
| criteria text ว่างบน row | `Any new listing`/`ทุกรายการใหม่` |

หมายเหตุ: ไม่ใช้ global `ไม่พบข้อมูล`/`No data found` — module variant ตาม 00_GLOBAL §11

---

# 14. Notification Rules

| Trigger | Recipient | Channel | Destination |
| --- | --- | --- | --- |
| โพสต์ `Sale` ใหม่ match ON alert | Alert owner | `watch` row ใน alerts feed (canonical 09) | Post Viewer โพสต์ที่ match ตรง — ไม่มี Result List |
| โพสต์ใหม่ของตัวเอง match ON alert (prototype simulation) | Publisher (me) | delayed toast `Watch alert matched: {name}` `(+N more)` | ไม่มี (toast only) |

- Multiple matched alerts → hit ราย alert (`_waHits` = names ทั้งหมดที่ match); toast แสดงชื่อแรก + `+N more`
- Paused/deleted alert ไม่ match; blocked/muted/ni post ไม่เข้า pool
- Toggle `state.notif.walerts` = contract-level opt-out (`When new listings match your criteria` — canonical 09/13)
- Push = transport contract เท่านั้น (§18)

---

# 15. Analytics Events

(contract — prototype ไม่มี tracking layer; align กับ event ที่ 03/05/09 ประกาศไว้)

| Event | Trigger |
| --- | --- |
| `watch_alert_sheet_opened` | `sr-wa`/`mf-btn`/Edit → `waSheetHTML` (payload: source, mode) |
| `watch_alert_created` | `wa-go` create path → push `WATCH_ALERTS` |
| `watch_alert_updated` | `wa-go` edit path |
| `watch_alert_deleted` | `wa-del` |
| `watch_alert_duplicate` | sig+mode ซ้ำ → reopen edit |
| `watch_alert_toggled` | `wa-tgl` pause/resume |
| `watch_alert_mode_changed` | `wa-mode` pick |
| `watch_alert_list_opened` | `data-sub="walerts"` |
| `watch_alert_matched` | `_waHits` non-empty (publish simulation) |
| `watch_alert_notification_opened` | `watch` row tap → viewer (canonical 09 emit) |

---

# 16. Acceptance Criteria

## Entries & Sheet

| AC ID | Criteria |
|---|---|
| AC-WA-001 | `sr-wa` บน results head เปิด shared WA sheet ด้วย `source:"search"` + criteria = `waCriteriaFromSearch` (keyword `q` + ทุก filter + price range) — canonical entry rule 03 §9 |
| AC-WA-002 | `mf-btn` เปิด sheet ด้วย `source:"detail"` + `matchMode:"all"` + `waName` เมื่อไม่มี alert `modelKey` เดียวกัน — canonical entry rule 05 §9 |
| AC-WA-003 | `mf-btn` บนโพสต์ไม่มี criteria → toast `No details on this post to watch` — ไม่เปิด sheet |
| AC-WA-004 | Edit `wa-badge` บน `.wa-row` เปิด sheet edit mode (title `Edit watch alert`, CTA `Save changes`, มี `Delete alert`) |
| AC-WA-005 | Criteria = snapshot — ไม่แก้ใน sheet; sheet แก้ได้แค่ name + `matchMode` |

## Name / Mode / Dedupe

| AC ID | Criteria |
|---|---|
| AC-WA-006 | Name auto `waName`: `Brand Model · Reference` → `"keyword"` → criteria 2 ค่าแรก ` · ` → `Any new listing`; ว่างตอน save → regen (ไม่ block) |
| AC-WA-007 | Mode `all`/`any`/`model` semantics ตามตาราง §9 + `any`/`model` disabled เมื่อ criteria ว่าง + แต่ละ row แสดง `{n} now`/`{n} รายการในขณะนี้` |
| AC-WA-008 | Mode pick ต้องเก็บชื่อที่พิมพ์ค้างไว้ (draft persist ข้าม sheet re-render) |
| AC-WA-009 | Save ที่ criteria+mode ซ้ำ alert เดิม → `You already saved this alert` + เปิด edit เดิม ไม่สร้างซ้ำ |
| AC-WA-010 | `sr-wa` เจอ sig ตรง (ทุก source) → เปิด edit; bell `on` เฉพาะ `source:"search"`; `mf-btn` เจอ `modelKey` ตรง (on/off) → เปิด edit |

## List & Toggle & Delete

| AC ID | Criteria |
|---|---|
| AC-WA-011 | `walerts` page = `sub-back` + title `การแจ้งเตือนนาฬิกา`/`Watch Alerts` + desc + rows (bell icon, name, criteria ` · `-join, `Edit` badge, mode label, `{n} matches now`, `wa-tgl`) |
| AC-WA-012 | Empty → `No watch alerts yet — tap the bell on a post or save a search to start one`; criteria ว่างบน row → `Any new listing` |
| AC-WA-013 | `wa-tgl` → `a.on` flip + row `.wa-off` เมื่อ paused + toast `Watch alert on`/`Watch alert paused` + `syncModelFlags`/`refreshMfBtns` |
| AC-WA-014 | `wa-del` (edit sheet) → ลบ alert ทันที **ไม่มี confirm** + `Watch alert removed` + sync flags + re-render list |
| AC-WA-015 | Settings row `Watch Alerts` แสดง `WATCH_ALERTS.length` count badge (canonical 13) |

## Match Engine

| AC ID | Criteria |
|---|---|
| AC-WA-016 | `critMatch` ตรงตาราง §9 ทุก `fk` (eq/includes/price range/`matchQuery`/`delivMatch`/label-eq fallback) — `N/A` ไม่เข้า criteria |
| AC-WA-017 | Pool = `salePosts()` (price + `!ni` + `!muted` + `!blocked`); contract match = `Sale` only — `pfkind` leak เป็น documented defect (S-10) ไม่ใช่ spec |
| AC-WA-018 | Post ของผู้ถูก block / ที่ mute / not-interested → ไม่ match และไม่นับ `N now` |
| AC-WA-019 | Mode `model` match เฉพาะ criteria brand/model/ref และต้องมี ≥1 ตัว; criteria ว่างใน mode `all` = match ทุก post |

## Bell Sync & Notification

| AC ID | Criteria |
|---|---|
| AC-WA-020 | ON alert ที่ `modelKey` ตรงโพสต์ → `p.modelFollowing` → `.mf-btn` `.on` + title `Following this model` ทุก surface (save/delete/toggle ต้อง sync ทันที); `"||"` ไม่นับ |
| AC-WA-021 | Publish โพสต์ใหม่ที่ match ON alert → `_waHits` + delayed toast `Watch alert matched: {name}`/`+N more` (simulation — ไม่ใช่ feed row) |
| AC-WA-022 | (Contract) match จริง → `watch` row ใน alerts feed → tap → Post Viewer โพสต์นั้นตรง ไม่มี Result List (canonical 09/00_NAV §8) |

## Guest / Session / Contract

| AC ID | Criteria |
|---|---|
| AC-WA-023 | Guest กด `sr-wa`/`mf-btn` → Member Sheet `Join TukDaeng`; `walerts` unreachable (settings gated); `WATCH_ALERTS=[]` สำหรับ non-member |
| AC-WA-024 | `applySessionData` → `WATCH_ALERTS` เคลียร์ (member ไม่ restore — documented deviation; persistence = contract) |
| AC-WA-025 | (Contract) option criteria match ด้วย relation id เท่านั้น; keyword criteria ครอบ free-text spec; `is_active=false` หยุด trigger + dependency warning; backfill re-match dedup (`alert_id`,`asset_id`) — prototype ไม่ model กฎชุดนี้ |
| AC-WA-026 | Dead/absent ต้องไม่เป็น feature: ไม่มี Result List screen, ไม่มี criteria editor ใน sheet, ไม่มี delete confirm dlg, ไม่มี frequency/digest settings |

---

# 17. Related Modules

- [00_GLOBAL_RULES_MODULE.md](00_GLOBAL_RULES_MODULE.md) — session §7, visibility/match §10, gate §11, lifecycle §12, block §13, private §14
- [00_NAVIGATION_AND_CROSS_MODULE_FLOW.md](00_NAVIGATION_AND_CROSS_MODULE_FLOW.md) — routes §6.6, entry matrix §7, notif destination §8, gate §9
- [02_FEED_MODULE.md](02_FEED_MODULE.md) — post model + composer publish → `_waHits` handoff
- [03_SEARCH_FILTER_MODULE.md](03_SEARCH_FILTER_MODULE.md) — `sr-wa` entry + `waCriteriaFromSearch`/`waName`/`waSig` canonical + `matchQuery`/`delivMatch`/`specOf` (FSP-016 lock)
- [05_ASSET_DETAIL_MODULE.md](05_ASSET_DETAIL_MODULE.md) — `mf-btn` entry + `modelKey`/bell semantics canonical (FSP-018 lock)
- [09_NOTIFICATION_MODULE.md](09_NOTIFICATION_MODULE.md) — `watch` feed row + destination canonical (FSP-021)
- [13_SETTINGS_MODULE.md](13_SETTINGS_MODULE.md) — library row + `walerts` entry + `notif_settings` toggle + delete-account copy (FSP-013/014 lock)
- [14_PORTFOLIO_MODULE.md](14_PORTFOLIO_MODULE.md) — drawer asset lifecycle (FSP-024 pending)
- [15_TRUST_SAFETY_MODULE.md](15_TRUST_SAFETY_MODULE.md) — block impact on match pool

---

# 18. Future Enhancement

- Alert persistence + sync ข้าม device (prototype: session-only + หายตอน session switch)
- Real match pipeline → `watch` notification rows (แทน `_waHits` toast) + notification history ผูก alert id
- Relation-id criteria model + market-data dependency warnings (v1.8 contract — §9 Production Contract)
- Criteria editing ใน sheet (ถ้าตัดสินใจเพิ่ม — ตอนนี้ snapshot-only)
- Delete confirmation (consistency กับ destructive pattern อื่น — flag FSP-030)
- Alert frequency / digest / quiet hours
- Price-triggered alerts (price drop) + market price alert
- Saved search เป็น feature แยกจาก alert
- `modelKey` ให้ search-source alerts ด้วย (bell sync ครบทุก alert ที่เป็น pure brand/model/ref)
- Push notification payload + deep link `walerts`/matched post
- language sweep — WA toasts EN-hardcode
