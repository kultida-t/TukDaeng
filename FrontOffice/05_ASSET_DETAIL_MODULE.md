# 05 Post Detail Module (Asset Detail)

อ้างอิงหลักจาก [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md) + baseline [00_GLOBAL_RULES_MODULE.md](00_GLOBAL_RULES_MODULE.md) §9–§12/§14 + [00_NAVIGATION_AND_CROSS_MODULE_FLOW.md](00_NAVIGATION_AND_CROSS_MODULE_FLOW.md) §6.6–§10 + [02_FEED_MODULE.md](02_FEED_MODULE.md) (post model / own-post menu / Edit info canonical) + [03_SEARCH_FILTER_MODULE.md](03_SEARCH_FILTER_MODULE.md) (post viewer 3 modes + lifecycle matrix canonical — FSP-016 lock) — prototype `Prototypes/fo-flow/index.html` เป็น source of truth เดียวของพฤติกรรม (FO-PRD-v1.9)

---

# 1. Document Information

| Item | Detail |
|---|---|
| Module Name | Post Detail (เดิมเรียก Asset Detail — spec เดิมตีความเป็น asset entity page แยก; prototype คือ post detail layer) |
| Platform | Mobile Application |
| Version | V1 |
| Owner | Product / UX / Engineering |
| Status | Draft |
| Document Type | Functional PRD - Master Aligned |

---

# 2. Objective

Post Detail คือ read-facing detail layer ของโพสต์ (`.page-detail` overlay — "asset-detail equivalent" ตาม 00_NAV) — หน้าเต็มที่รวมรูป, actions, FOR SALE/SHOWCASE tag, ชื่อ Brand+Model, Reference, Descriptions และ spec groups (รวม `Price & Data Source`) ของโพสต์เดียว พร้อม entry พิเศษ 2 จุดที่ไม่มีบน feed card: `mf-btn` Follow this model (Watch Alert จาก spec โพสต์) และ `wl-btn` Wish List

โมดูลนี้ต้องคุมว่า detail ถูกเปิดจาก entry points ที่ prototype มีจริงเท่านั้น, render จาก post model เดียวกับ feed, ไม่แสดง private data (purchase/sold/portfolio อยู่ owner surfaces ของ 04/14) และไม่มี owner/contact block ของ spec เดิม (prototype ไม่มี)

---

# 3. Prototype Reference

Source of truth: `Prototypes/fo-flow/index.html` (read-only — ห้ามแก้)

- Detail layer: `.page-detail` mount ทุก screen (~19376) + CSS z-index เหนือ `.page-pv` + bottom nav ซ่อนเมื่อ `detail-open` (~1308–1333, ~6331); `openPostDetail` (~14686–14705 — render + `detailPid` + scroll reset + head เข้า scroller); `detail-back` (~21811–21814 — ปิดเฉพาะ `detail-open`); `keepScroll` re-render ตอนสลับภาษา (~19712–19714); `refreshPostViews` re-render detail ที่เปิดอยู่ (~13963)
- Detail anatomy `detailHTML` dl1 (~13355–13398): `detailHeadHTML` dh3 (~13334–13347 — back + title `รายละเอียด`/`Detail` + `pm-btn`), hero + `photo-counter`/`photo-dots`/`clipUiHTML` (~13370–13378), actions row like/comment/views/share + `mf-btn` + `wl-btn` (~13380–13389), `saleTagHTML` (~13349–13353), `detail-name`/`detail-ref` fallback rules (~13358–13365), `Descriptions`/`คำอธิบาย` + `p.desc` (~13393–13394), `detailSpecsHTML` (~13521–13525 — **ไม่** filter `Price & Data Source`)
- Spec groups: `specGroupsHTML` shared renderer (~13528–13554); `p.specs` = flattened `specGroups` rows (~13092); `specOf` (~14197); `naSpec` (~16117); seed `specGroups` 3 กลุ่ม (Watch Specifications / Item Details / Price & Data Source ~12771–12796)
- Entries: `.view-full` handler (~21849–21857 — คง `pv-open` ไว้ detail ทับ viewer); `detailsHTML`/`triggerHTML` (`Tap for details` expander, filter `Price & Data Source` ~13302–13332); `pvDetailsSheetHTML` (`dt` sheet ~14470–14474); chat item `[data-chgo="post"]` (~19125–19134)
- `hasDetails` gating: feed card ~14021, `pfp`/`svf` card ~14487 (`price || specGroups.length || specs.length`); `pv-dt` เฉพาะ `specGroups.length` (~14442)
- Comments: `commentsFor`/`commentRowsHTML`/`commentsHTML` (~13556–13608), `COMMENT` seed threads (~13114–13156), `.comment-btn` handler (~22015–22028), `.c-like` local toggle (~22540–22546)
- Watch Alert from detail: `.mf-btn` handler (~21899–21917), `modelKeyOf`/`syncModelFlags`/`refreshMfBtns` (~16199–16213), `waCriteriaFromPost` (~16124–16147 — field map + `mapped` exclusion list), `waSheetHTML` shared sheet (~16234–16279), WA handlers `wa-mode`/`wa-go`/`wa-del` (~21920–21978)
- Wish List: `wlSheetHTML`/`WISHLISTS` (~13708–13733), handlers `.wl-btn`/`.wl-pick`/`.wl-new`/`syncWlBtns` (~22437–22482)
- Shared sheets ที่ detail ใช้: `likesSheetHTML`/`shareSheetHTML`/`saveSheetHTML` (~13644–13706), share/save handlers (~22030–22067, ~22490–22526)
- Own/viewer: `isOwnPost` → `pmOwnMenuHTML`/`pmMenuHTML` (canonical 02_FEED); edit-from-detail `V.editFromDetail` (~16024–16064); delete closes open detail (~20740)
- `findPost` (~16577 — `POSTS` + `PF_GFX_REG` + `PF_MINE`); `pfTabPosts`/`pfKind` (~16604–16610 — sold/hide reachable ผ่าน own profile tabs); `PF_GFX_SOLD` (~16550–16559); `soldFromPost`/`markAssetSold` (~15942–15958, ~17139–17149)
- Guest gate `GUEST_GATE_SEL` + `obGate` (~22997–23012): `.like-btn`/`.share-btn`/`.wl-btn`/`.mf-btn`/`.pm-btn`/`.comment-input`/`.emoji-row`/`.c-like`/`.c-meta` gated — `.comment-btn` และ `.view-full` ไม่ gate
- Dead/tooling (ห้ามเขียนเป็น feature): `POST_DETAIL_CFG` per-post variant overrides (~13106–13112 — dev artifact), `igDetailHTML`/`igBodyHTML`/`igDetailHeadHTML` dl2 (~13444–13519 — มี post-head/caption/ask/save/liked-by ที่ dl1 ไม่มี), `chatPopHTML`/`chat-fab`/`sendChat`/`closeChatPop` (~13400–13442, ~21816–21836), header variants `dh2`/`dh4`/`dh5`, spec layouts `ds` acc/cards/tabs/seg + `dStyle` d1/d3, price variants `pr` pr1–pr4, `tg` tg2 — ดู 00_NAV §11 prototype-tooling rule

---

# 4. Master Alignment Summary

| Area | Master Baseline |
| --- | --- |
| Destination model | Post Detail (`.page-detail`) = asset-detail equivalent เดียวใน V1 — ไม่มี Asset Detail page แยก (00_NAV §6.1) |
| Status model | `pfkind` ∈ `post`/`sale`/`show`/`hide`/`sold` mirror กับ canonical `Sale`/`Show`/`Hide`/`Sold` (00_GLOBAL §9) |
| Visibility | ตาม 00_GLOBAL §10 — detail เปิดได้เฉพาะโพสต์ที่ visible ต่อ current user ผ่าน entry นั้น (feed=sale+post, public profile=sale+show, owner profile=ทุกสถานะ); viewer ต้องไม่ถึง hide/sold ของคนอื่น |
| Private data | Purchase Price/Date, Sold History, Portfolio Value = private (00_GLOBAL §14) — **Post Detail ไม่แสดงเลย** (อยู่ `pfasset:`/`sold:`/`portfolio` ของ 04/14 เท่านั้น) |
| Guest | เปิด detail + อ่าน specs/comments ได้เสรี (00_GLOBAL §11 capabilities); action ทุกตัว gated → Member Sheet `Join TukDaeng` |
| Navigation | `.page-detail` เป็น layer ไม่ใช่ route — entries ตาม 00_NAV §7 matrix; `.detail-back` ตาม §6.7; unavailable fallbacks ตาม §10 (contract) |
| Comments | shared comment bottom sheet เดียวกับทุก surface (00_NAV §6.1 comment surface rule) — detail ไม่มี inline comment section |
| Watch Alert | `mf-btn` = WA entry ที่ 2 นอกจาก `sr-wa` search bell (03_SEARCH §9 + 10_WATCH_ALERT canonical) |
| ไม่มีใน V1 | Owner/contact block บน detail, Follow จาก detail, Ask Seller บน detail, Save (bookmark) บน detail, Full Screen Image Viewer, inline comments + per-comment `...` actions, comment write/delete/report จริง |

---

# 5. Scope

## In Scope

- Post Detail layer (`.page-detail`) — open/back/layer semantics + re-render behavior
- Entry points ทั้งหมด: `View full detail` (feed card details-body + `dt` sheet + saved/wishlist/archive/profile viewer cards) + chat item card
- Detail anatomy dl1: head, hero carousel + clip UI, action row (like/comment/views/share + `mf-btn` + `wl-btn`), sale tag, name/ref, Descriptions, spec groups + `Price & Data Source`
- Detail actions: like toggle, comment sheet entry, share sheet entry, `mf-btn` WA flow (criteria จาก spec + `modelKey` bell state + `No details on this post to watch`), `wl-btn` wishlist flow, `pm-btn` own/others menu, photo carousel, `#tag` in desc
- Owner vs viewer vs guest state บน detail (layout เดียวกัน — ต่างที่ menu + gate + eligibility)
- Sold/hide/show post บน detail (reachability + display + `View sale record` path)
- Edit-from-detail + delete-closes-detail lifecycle
- Empty/fallback rules (no-specs post, empty desc, missing post)
- Deviations vs spec เดิม + dead variant paths

## Out Of Scope (module อื่นเป็นเจ้าของ)

- Post model / composer / Edit info internals / own-post menu anatomy/rows — canonical [02_FEED_MODULE.md](02_FEED_MODULE.md) (FSP-015a/b lock); เอกสารนี้ระบุเฉพาะ fields ที่ detail render + surface-restore semantics
- Post Viewer (`.page-pv`) 3 modes + sheets mechanics — canonical [03_SEARCH_FILTER_MODULE.md](03_SEARCH_FILTER_MODULE.md) (FSP-016); เอกสารนี้ระบุเฉพาะ handoff `View full detail` → detail
- Comments/likes/share/save sheet internals — shared sheets canonical อยู่ 02_FEED + [11_SOCIAL_MODULE.md](11_SOCIAL_MODULE.md) (FSP-022)
- Watch Alert internals — `waSheetHTML`, `alertMatch`, alert list, match notification — canonical [10_WATCH_ALERT_MODULE.md](10_WATCH_ALERT_MODULE.md) (FSP-021); เอกสารนี้ระบุเฉพาะ `mf-btn` entry + criteria/bell semantics
- Wishlist hub (saved/wishlist/collections pages) — canonical 02_FEED §9 / saved-library surfaces (FSP-002b inventory)
- Chat room + item card anatomy — [07_CHAT_MODULE.md](07_CHAT_MODULE.md) (FSP-020)
- Report flow internals + comment moderation — [15_TRUST_SAFETY_MODULE.md](15_TRUST_SAFETY_MODULE.md); `pm-btn` report entry canonical 02_FEED
- Profile grid/tabs/sold tab reachability — [06_PROFILE_MODULE.md](06_PROFILE_MODULE.md) (FSP-019)
- Portfolio pages `pfasset:`/`sold:`/`sell:`/`soldhist` + purchase/sale math — [04_ASSET_MANAGEMENT_MODULE.md](04_ASSET_MANAGEMENT_MODULE.md) (FSP-017) + [14_PORTFOLIO_MODULE.md](14_PORTFOLIO_MODULE.md) (FSP-024)
- Deep-link routing/unavailable states — contract เท่านั้น (00_NAV §10; prototype ไม่มี external deep link mechanism)
- BO moderation — master contract เท่านั้น

---

# 6. Screen Mapping

| Screen / State | Prototype | Description |
| --- | --- | --- |
| Post Detail (dl1) | `.page-detail` + `detailHTML()` | layer เต็มจอ — head + hero + actions + tag + name/ref + Descriptions + spec groups |
| Detail over viewer | `detail-open` + `pv-open` คงอยู่ | `View full detail` จาก `dt` sheet / pfp-svf card — `detail-back` เผย viewer ข้างล่าง |
| Detail over feed/sub page | `detail-open` เดี่ยว | `View full detail` จาก feed card / chat item — `detail-back` กลับ surface เดิม |
| Comments sheet จาก detail | `.comment-btn` → `commentsHTML()` | shared sheet ตัวเดียวกับ feed/viewer (ไม่ใช่ `nt` variant — นั้นสงวน viewer) |
| Watch Alert sheet จาก detail | `.mf-btn` → `waSheetHTML()` | shared WA sheet (`source:"detail"`, `modelKey` set) |
| Wishlist sheet จาก detail | `.wl-btn` → `wlSheetHTML()` | Wish List + collections + New collection |
| Share sheet จาก detail | `.share-btn` → `shareSheetHTML()` | friends grid + app row + `Copy link` |
| Member Sheet | `obGate()` | guest gate `Join TukDaeng` (00_GLOBAL §11) |

---

# 7. User States

## Guest

ทำได้ (ไม่ gate):

- เปิด Post Detail ผ่านทุก public entry (`View full detail` จาก feed card / `dt` sheet / viewer cards)
- ดู content ทั้งหมด: hero carousel, action row, tag, name/ref, Descriptions, spec groups + `Price & Data Source`
- เปิด comment sheet อ่าน comments + replies (`comment-btn` ไม่ gate)
- กด `#tag` ใน Descriptions → search; กดรูป → carousel

ต้อง login (Member Sheet `Join TukDaeng` — gated selectors บน detail):

- `.like-btn`, `.share-btn` (S-03), `.mf-btn`, `.wl-btn`, `.pm-btn` (post menus)
- ภายใน comment sheet: `.comment-input`, `.emoji-row`, `.c-like`, `.c-meta` (Reply)

## Member / Viewer (non-owner)

- ทุกอย่างของ guest + like, share, `mf-btn` (WA จาก spec โพสต์), `wl-btn` (wishlist), `...` → others menu (Add/Remove favorites · Not interested · Report — canonical 02_FEED)
- เห็น detail เฉพาะโพสต์ที่ eligible ผ่าน entry นั้น (`sale`/`post` ทาง feed; `sale`/`show` ทาง public profile; ไม่มีทางถึง `hide`/`sold` ของคนอื่น — 00_GLOBAL §10)
- Comment input/reply = contract (prototype dead → toast `Not in this prototype yet`)

## Owner

- Layout เดียวกับ viewer เป๊ะ (detail ไม่มี owner block/private section)
- `...` → own-post menu (Archive · Turn off/on commenting · Edit · Mark as sold · Pin to top of grid · Delete — canonical 02_FEED); โพสต์ `sold` เห็น `View sale record` แทน Edit
- `Edit` จาก detail → detail ซ่อนระหว่าง composer + เปิดคืนหลังปิด composer (`V.editFromDetail`)
- `Delete` โพสต์ที่ detail เปิดอยู่ → detail ปิดอัตโนมัติ
- เห็น detail ของทุก `pfkind` รวม `hide`/`sold` (reachability ผ่าน own profile tabs — 06_PROFILE)
- Like โพสต์ตัวเองได้; `mf-btn`/`wl-btn` ใช้ได้บนโพสต์ตัวเอง (ตาม prototype — ดู §9 Deviations)

## Blocked Relationship

- โพสต์ของ seller ที่ block กัน/ถูก block หลุดจาก feed/search/viewer-eligible lists ก่อนแล้ว (00_GLOBAL §13) → ไม่มี public entry ถึง detail; stale/direct entry → unavailable contract (00_NAV §10)
- `muted`/`ni` posts หลุด eligibility เช่นเดียวกัน — `findPost` resolve ได้แต่ไม่มี UI path มาถึง

---

# 8. User Flow

## Open Post Detail (ทุก entry)

```text
Entry A: Feed card → `Tap for details` (เฉพาะโพสต์ที่ hasDetails) → details-body → `View full detail`
Entry B: Post viewer (default) → `Tap for details` (`pv-dt`, เฉพาะมี specGroups) → `dt` sheet → `View full detail`
Entry C: Post viewer feed/pfp modes (saved/wishlist/archive/profile grid) → card `Tap for details` → `View full detail`
Entry D: Chat room → item card / `View asset` (`data-chgo="post"`)
→ `openPostDetail` → detail layer slide ทับ (viewer คง mount ข้างล่าง)
→ `.detail-back` → ปิด detail เผย surface/viewer เดิม
```

- Feed card media tap **ไม่** เข้า detail (carousel เท่านั้น — AC-NAV-001)
- ไม่มี entry จาก notification โดยตรง — notification → Post Viewer ก่อน (00_NAV §8) แล้วค่อย `View full detail`
- `findPost` คืน null → ไม่เกิดอะไร (`view-full` silent no-op); chat path → toast `Listing detail isn't in this prototype yet` (contract: unavailable state)

## Detail Actions Flow

```text
Post Detail
→ like-btn    → toggle liked + likes ±1 (sync ทุก like-btn ของ pid เดียวกันทุก surface)
→ comment-btn → comments bottom sheet (rows + replies + emoji row + input)
→ share-btn   → share sheet → `Sent to {name}` / `Shared to {app}` / `Link copied`
→ mf-btn      → WA sheet (criteria จาก post specs หรือ edit draft ของ alert เดิม)
→ wl-btn      → auto-wishlist (ครั้งแรก) + wishlist sheet → pick collection
→ pm-btn      → own menu / others menu ตาม isOwnPost
→ hero tap    → carousel ซ้าย/ขวา (ครึ่งจอ) + dots อัปเดต (photos >1)
→ `#tag`      → search results ของ tag นั้น
```

## Watch Alert From Detail Flow (`mf-btn`)

```text
`mf-btn` (bell — title `Follow this model` / `Following this model`)
→ modelKey = `brand|model|ref` (lowercase) ของโพสต์
→ มี ON/OFF alert ที่ modelKey เดียวกัน → เปิด sheet edit mode (criteria/name/mode เดิม)
→ ไม่มี → criteria = waCriteriaFromPost(post)
   → criteria ว่าง → toast `No details on this post to watch` (จบ — ไม่เปิด sheet)
→ waSheet (source:"detail", matchMode "all", name = waName auto)
→ Save → dedupe sig+mode → `You already saved this alert` หรือสร้าง alert → `Watch alert on`
→ `syncModelFlags` + `refreshMfBtns` — bell `.on` บนทุกโพสต์ที่ modelKey ตรง alert ON
→ Delete ใน sheet → `Watch alert removed` + bell off
```

## Wishlist From Detail Flow (`wl-btn`)

```text
`wl-btn` (gift — title `Wish List`)
→ ครั้งแรก: set `wishlisted` + sync icon → เปิด wlSheet (`"Wishlist"` = pseudo-row ของ flag; `wlCols` = array multi-collection — canonical 11)
→ sheet: `Wish List` head pick + collection rows + `New collection` (→ nc sheet)
→ pick `Wish List` ขณะ wishlisted → un-wishlist (`wlCols` ล้าง) → toast `Removed from your wish list`
→ pick col ที่ check อยู่ → เอาออกเฉพาะ col นั้น → `Removed from {col}`; pick col ใหม่ → `wlCols.push` → `Added to {col}`/`Added to Wish List`
```

## Edit Info From Detail Flow

```text
own menu `Edit`
→ detail ถูกซ่อน (`V.editFromDetail`) → Edit info composer ทับ
→ `Done`/`Cancel` → composer ปิด → detail เปิดคืน (re-render content ใหม่ เว้นแต่ viewer base — canonical 02_FEED)
→ toast `Post updated` + `refreshPostViews`
```

## Sold Post Flow

```text
Own profile → Sold/all tab tile → viewer (pfp mode) → `Tap for details` → `View full detail`
→ Post Detail layout เดิม (specs/tag ตามข้อมูลที่เหลือ — ดู §9 Sold Post Rule)
→ `...` own menu → `View sale record` → `sold:{id}` page (04_ASSET_MANAGEMENT — ไม่ใช่ detail อีกต่อไป)
```

---

# 9. Business Rules

## Detail Layer Rule

- `.page-detail` เป็น overlay layer ของ screen (ไม่ใช่ `.page-sub` route — ไม่มี route name, ไม่อยู่ใน sub stack)
- Z-order: เหนือ `.page-pv` (viewer mount ค้างข้างล่างตลอดที่ detail เปิด) และเหนือ `.page-sub`; bottom nav ซ่อนขณะ `detail-open`
- เปิด 1 detail ต่อ screen; `dataset.detailPid` จำโพสต์ที่เปิด — shared handlers (like/comment/share/save/wl/mf/menu) resolve pid จาก `.post` ancestor ก่อน แล้ว fallback `detailPid`
- `detail-back` ปิดเฉพาะ `detail-open` — ไม่มี pop chain, ไม่มี forward; เปิดซ้ำโพสต์เดิม = re-render + scroll กลับบน
- Re-render triggers: like/save/wl/wa state sync (class toggle, ไม่ re-render ทั้งหน้า), `refreshPostViews` (post mutate → re-render detail ที่เปิดอยู่), lang switch (`keepScroll` preserve scroll)
- Head เป็น sticky ภายใน `detail-scroll` (openPostDetail ย้าย `.detail-head` เข้า scroller)

## Detail Entry Rule

| Entry | Path | Gating |
| --- | --- | --- |
| Feed card | `Tap for details` → `View full detail` | โพสต์ `hasDetails` = `price \|\| specGroups.length \|\| specs.length`; โพสต์ต้องอยู่ feed eligibility ก่อนแล้ว |
| Viewer `dt` sheet | `pv-dt` → `dt` sheet → `View full detail` | `pv-dt` แสดงเฉพาะ `specGroups.length > 0`; detail ทับ viewer (`pv-open` คงอยู่) |
| Viewer feed/pfp cards | card `Tap for details` → `View full detail` | เหมือน feed card (svf/pfp render `postCard` เต็ม) — saved/wishlist/archive member-only, profile grid ตาม tab visibility |
| Chat item | `[data-chgo="post"]` | เปิด detail ตรงจาก item card; `findPost` ไม่เจอ → toast `Listing detail isn't in this prototype yet` |

- `View full detail` ไม่ gate สำหรับ guest (browse ฟรีตาม 00_GLOBAL §11 capabilities)
- โพสต์ไม่มี details เลย (ไม่มี price/specs) ไม่มี `Tap for details`/`pv-dt` → เข้า detail ได้เฉพาะทาง chat item (หรือ state อื่นที่มี pid)

## Detail Anatomy Rule (dl1)

เรียงบนลงล่าง:

| # | Element | Rule |
| --- | --- | --- |
| 1 | `detail-head` (dh3) | back `‹` + title `รายละเอียด`/`Detail` (กึ่งกลาง) + `pm-btn` `…` — sticky ใน scroll |
| 2 | `detail-hero` | รูปแรกเต็มกว้าง; `photo-counter` `1/N` เมื่อ photos >1; clip badge + duration + progress เมื่อมี clip (`clipUiHTML` — mechanics canonical 02_FEED); `photo-dots` ใต้ hero |
| 3 | `post-actions` | `like-btn` (heart — **ไม่มีตัวเลข**), `comment-btn` + count (ซ่อนทั้งปุ่มเมื่อ `noComments`), `views-stat` eye + count (ซ่อนเมื่อ `hideCounts` หรือ `views` ว่าง/`"0"`), `share-btn`; `act-right`: `mf-btn` (bell — `Follow this model`/`Following this model`) + `wl-btn` (gift — `Wish List`) |
| 4 | `inline-tag` | ตาม `pfkind` (DEC-21): `sale` → `ลงขาย`/`FOR SALE`; `show` → `โชว์`/`SHOWCASE` (muted); `sold` → `ขายแล้ว`/`SOLD` (muted); `hide` → `ซ่อน`/`HIDDEN` (muted); โพสต์ธรรมดา (`post`) ไม่มี tag |
| 5 | `detail-name` | `Brand + Model` จาก flat `specs` (ตัดค่า `n/a`/`N/A` ทิ้ง); `specs` ว่าง → fallback = caption ส่วนแรกก่อน `—` (trim) |
| 6 | `detail-ref` | `Ref. {value}`; `n/a` → `Ref. -`; **ไม่ render เลย** เมื่อ `specs` ว่าง |
| 7 | `Descriptions`/`คำอธิบาย` + desc | `p.desc` (field ของตัวเอง — **ไม่ copy จาก caption**); ว่าง → `-`; `#tag` ภายใน desc = `.igd-tag` กด → search (เหมือน caption hashtags) |
| 8 | Spec groups | `detailSpecsHTML` render `specGroups` ทุกกลุ่มเป็น `spec-row` label–value — **รวม `Price & Data Source`** (ต่างจาก `detailsHTML` ของ feed card/feed-viewer expander ที่ filter กลุ่มนี้ออก) |

สิ่งที่ **ไม่มี** บน dl1 (ขัด spec เดิม — เป็น deviations ด้านล่าง): seller/owner block, Follow button, Ask Seller pill, save/bookmark button, liked-by row, caption, comment list inline, timestamp

## Description Rule

- `desc` เป็น post field แยกจาก `caption`/`captionFull` (composer มี field Description ของตัวเอง — canonical 02_FEED)
- Prototype seeds บางโพสต์เคย copy caption ลง `desc` (showcase posts) — `metaFromPost` ไม่ preload กลับในกรณีนั้น (ระบุใน 02_FEED Edit rule)
- Detail fallback `-` เมื่อ `desc` ว่าง — ไม่มี placeholder อื่น

## Price & Data Source Rule

- กลุ่ม `Price & Data Source` ใน `specGroups` = `Asking Price` · `Estimated Market Price` · `Last Price Update` · `Data Source` (`TukDaeng Market Data`)
- แสดงบน Post Detail เสมอเมื่ออยู่ใน `specGroups` (เป็น spec group ปกติกลุ่มสุดท้าย — ไม่ใช่ private data: `Estimated Market Price`/`Data Source` เป็น public market data, `Asking Price` = price)
- ค่า `N/A` แสดงตาม seed ตรง ๆ (ไม่มี row-hiding)
- `waCriteriaFromPost` **ยกเว้น** keys กลุ่มนี้ (`Asking Price`/`Estimated Market Price`/`Last Price Update`/`Data Source` อยู่ใน `mapped` exclusion) — WA ไม่ snapshot ราคาจาก detail entry
- Market data contract (`PFO_SRC`/market price feeds) อยู่ 14_PORTFOLIO — detail แค่ render สตริงที่ post เก็บ

## Like / Comment / Views Row Rule

- `like-btn` toggle `post.liked` + `likes ±1` — sync `.liked` class ทุก `.like-btn` ของ pid เดียวกันข้าม surfaces (feed card / viewer rail / detail); detail ไม่แสดงตัวเลขข้างหัวใจ (`.lk-n` มีเฉพาะ own-post cards บน feed/pfp — canonical 02/06)
- `comment-btn` ซ่อนทั้งปุ่มเมื่อ `noComments` (Turn off commenting — canonical 02_FEED); count แสดง `p.comments` เมื่อ >0
- `views-stat` เป็น read-only (ซ่อนเมื่อ `hideCounts` หรือ `views` ว่าง/`"0"`) — ไม่ใช่ button, ไม่มี destination
- `share-btn` → shared share sheet; guest gated (S-03 — share ต้อง login ทุกจุด)

## Comment Surface Rule (จาก detail)

- `comment-btn` → shared comments bottom sheet (`commentsHTML`) — sheet เดียวกับ feed card/viewer ทุกประการ (00_NAV comment surface rule); `nt` variant ถูก toggle เฉพาะตอน viewer เปิดอยู่และ detail **ไม่**เปิด — จาก detail ได้ regular sheet
- Anatomy: sheet title `ความคิดเห็น`/`Comments`, rows (avatar→profile · name·time · text · `Reply` meta · heart+count ขวา), replies 1 ระดับใต้ root (`.c-row.reply`), emoji row 8 ตัว, input `เพิ่มความคิดเห็น...`/`Add a comment...` + img/gif icons
- Replies = one-level เท่านั้น (nested ไม่เกิน 1 ชั้น — data model `c.replies[]` ไม่มีชั้นซ้อน)
- Empty thread → บรรทัดเดียว `ยังไม่มีความคิดเห็น`/`No comments yet` (ไม่มี `Be the first to comment.` / `Write a comment...` ของ spec เดิม — deviation)
- โพสต์ที่มี comment count แต่ไม่มี seeded thread → `commentsFor` สร้าง mock rows ให้ครบตาม count (session-generated — contract)
- Comment interactions ใน prototype เป็น read/like-only: `c-like` toggle local (member), `Reply`/`emoji`/`input` → toast `Not in this prototype yet` (member) หรือ Member Sheet (guest); **ไม่มี** per-comment `...` menu, **ไม่มี** delete/report comment, **ไม่มี** `View all comments` (sheet คือ list เต็มแล้ว) — write/delete/report เป็น contract (§18)
- Root comment meta เป็น hardcode `Reply` (EN ล้วน) ส่วน reply rows เป็น `ตอบกลับ`/`Reply` ตามภาษา — prototype quirk (deviation)

## Watch Alert Entry Rule (`mf-btn`)

- `mf-btn` อยู่ `act-right` ของ detail เท่านั้น (ไม่มีบน feed card/viewer rail) — เป็น WA entry ที่ 2 นอกจาก `sr-wa` (03_SEARCH canonical)
- `modelKey` = `[Brand, Model, Reference].map(specOf).trim().toLowerCase().join("|")`; bell `.on` เมื่อมี ON alert ที่ `modelKey` เดียวกัน (`syncModelFlags` — `modelKey:"||"` ไม่นับ); title สลับ `Follow this model`/`Following this model`
- เปิดด้วย alert เดิมที่ modelKey match (ON หรือ OFF) → edit draft (`id`/`criteria`/`matchMode`/`name`/`modelKey` เดิม) → sheet title `Edit watch alert`
- เปิดด้วย alert ใหม่ → `criteria = waCriteriaFromPost(post)`:
  - mapped fields: Brand·Model·Reference·Year·Condition·`Case Diameter`·`Movement Type`·`Dial Color`·Strap (`Strap/Bracelet Material` + `Strap Material` รวม) + `Delivery contents` (จาก `Box & Papers` → `SEARCH_DELIV` match)
  - spec rows อื่นที่ไม่อยู่ `mapped` exclusion list (รวม `Collection`, `Case Material`, `Calibre` ฯลฯ) ติดไปเป็น generic criteria ด้วย (label-match)
  - **ยกเว้น** price/data-source keys (`Asking Price`/`Estimated Market Price`/`Last Price Update`/`Data Source`) และค่า `n/a`
  - criteria ว่างเปล่า → toast `No details on this post to watch` — sheet ไม่เปิด (โพสต์ไม่มี specs เลยเช่น showcase ธรรมดา/โพสต์ text-only)
- Sheet = shared `waSheetHTML` (`source:"detail"`, `matchMode:"all"` default, name auto `waName(criteria)` แก้ได้) — mechanics/dedupe/modes/delete canonical 10_WATCH_ALERT (FSP-021) + 03_SEARCH §9
- ผลลัพธ์ match นับจาก `salePosts()` เท่านั้น (canonical 03/10 — sold/hide post ที่ detail เปิดอยู่ไม่ถูกนับ)
- Guest → Member Sheet (`.mf-btn` ∈ `GUEST_GATE_SEL`)

## Wishlist Entry Rule (`wl-btn`)

- `wl-btn` (gift icon) อยู่ `act-right` — เป็น wishlist entry หลักของโพสต์ (wishlist **ไม่ใช่** save/bookmark — save-btn ไม่มีบน detail)
- กดครั้งแรกบนโพสต์ที่ยังไม่ wishlist → set `wishlisted:true` + `wlAt` ทันทีก่อนเปิด sheet (optimistic) แล้วเปิด `wlSheet` (`wlCols` = multi-collection array — canonical 11; `"Wishlist"` = pseudo-row ของ flag)
- Sheet anatomy: `Wish List` head pick (thumb = รูปแรกของ post) + `Collections` section + `New collection` + rows (`WISHLISTS` seed: `Next buy`, `Grail goals`)
- Pick `Wish List` ขณะ wishlisted → un-wishlist (`wishlisted/wlCols/wlAt/wlColAt` reset — หลุดทุก collection) → toast `Removed from your wish list`; pick col ที่ check อยู่ → เอาออกเฉพาะ col นั้น (`Removed from {col}`); pick col ใหม่ → `wlCols.push` (`Added to {col}` / `Added to Wish List`) — ติ๊กได้หลาย col
- `New collection` → `nc` sheet (shared new-collection flow — canonical saved/library surfaces)
- Guest → Member Sheet (`.wl-btn` ∈ `GUEST_GATE_SEL`)

## Post Menu Rule (`pm-btn`)

- `pm-btn` บน detail head → `isOwnPost` (`seller === CP_ME`) → `pmOwnMenuHTML` / อื่น → `pmMenuHTML` — canonical 02_FEED §9 (entries: Archive/commenting/Edit/Mark as sold/Pin/Delete หรือ `View sale record` บน sold · favorites/Not interested/Report)
- `scr.dataset.pmPid` resolve จาก `detailPid` เมื่อไม่มี `.post` ancestor (~20469)
- Edit → edit-from-detail (§8); Delete → confirm `Delete post?` → ลบ + ปิด detail อัตโนมัติ (~20740); Mark as sold/`View sale record` → `sell:`/`sold:` sub pages (04_ASSET_MANAGEMENT)
- Guest → Member Sheet (`.pm-btn` gated — guest ไม่เปิด post menu จาก detail ได้)

## Photo Carousel Rule

- Hero swipe: เลื่อนทีละ 1 รูป หยุดที่รูปแรกและรูปสุดท้าย (ไม่วน); double-tap = ไลก์ (guest → gate); single tap ไม่ทำอะไร; อัปเดต `photo-counter` + `photo-dots` — handler เดียวกับ feed card (`.post-photo, .detail-hero` shared; ตาม 02 DEC-14)
- รูปเดียว → tap ไม่ทำอะไร; มี clip → tap = clip play control (`clipUiHTML` mechanics 02_FEED)
- **ไม่มี** full-screen image viewer / zoom / pinch — ตัดจาก spec เดิม (B1 ใน gap inventory — contract §18)

## Own vs Viewer Rule

- Layout เหมือนกันทุก element — owner/viewer ต่างกันเฉพาะ: (1) `pm-btn` menu ที่เปิด, (2) guest gate, (3) eligibility ว่าถึง detail ได้หรือไม่
- Owner **ไม่มี** private section เพิ่มบน detail (purchase cost/sale record/portfolio value อยู่ `pfasset:`/`sold:`/`portfolio` เท่านั้น — 00_GLOBAL §14)
- Owner ใช้ `mf-btn`/`wl-btn` บนโพสต์ตัวเองได้ตาม prototype (ไม่มี self-guard — deviation flag)
- Owner like โพสต์ตัวเองได้ (toggle เหมือนกัน); ไม่มี Follow ให้กดเพราะไม่มี seller block เลย

## Sold Post Rule

- Reachability: own profile `sold`/ `all` tab → pfp viewer → `Tap for details` (hasDetails) → `View full detail` → detail — viewer คนอื่นไม่มีทางถึง (visibility matrix; public profile leak ที่ 00_GLOBAL §10 บันทึกเป็น defect ไม่ใช่ spec)
- Display: detail render ตามข้อมูลที่โพสต์เหลือ — `pfkind:"sold"` **ไม่**เปลี่ยน anatomy
  - โพสต์ที่ขายผ่าน `markAssetSold`: tag เป็น `SOLD` (DEC-21) และ spec groups คงอยู่
  - gfx sold seeds (`PF_GFX_SOLD`): flat `specs` เท่านั้น + `price:null` → `SHOWCASE` tag + name จาก specs + ไม่มี spec groups (deviation — tag อ่านจาก price ไม่ใช่ pfkind)
- `pm-btn` บน sold post → `View sale record` แทน `Edit` → `sold:{id}` page (private sale record — canonical 04/14; `soldFromPost` materialize เมื่อไม่มี link)
- `sold` ไม่มี `Edit`/`Mark as sold` ใน menu; `applyPostEdit` กัน status sold ไว้แล้ว (canonical 02/04)
- `mf-btn` บน sold post ใช้ได้ (criteria จาก specs ที่เหลือ) — match count ไม่นับโพสต์ sold เอง (salePosts เท่านั้น)
- Chat กับ post ที่ sold ยังใช้ได้ (canonical 00_GLOBAL §12: chat อยู่) — chat item เปิด detail ได้ตามปกติ

## Hide / Show Post Rule

- `hide`: owner เห็น detail ผ่าน own profile tabs เท่านั้น; `show`: public profile `show` tab → viewer pfp → detail (visibility matrix §10)
- ทั้งสองใช้ layout เดียวกัน — `hide` ที่เป็น drawer-only (`PF_MINE`) มี specs ตามที่สร้าง; detail ไม่มี "private" marking พิเศษ

## Unavailable / Missing Post Rule

- `findPost` = `POSTS` + `PF_GFX_REG` + `PF_MINE` — resolve ไม่ได้: `view-full` silent return (ไม่มี UI feedback); chat entry → toast `Listing detail isn't in this prototype yet`
- โพสต์ถูกลบขณะ detail เปิด → detail ปิดอัตโนมัติ (delete handler splice ก่อน re-render)
- Deleted/permission states เต็มรูปแบบ (`รายการนี้ไม่พร้อมใช้งานแล้ว` page) = contract ตาม 00_GLOBAL §11 + 00_NAV §10 — prototype มีแค่ toast/unavailable ระดับ entry

## Deviations & Dead-Code Notes

Spec เลือกตาม prototype — รายการนี้คือจุดที่ spec เดิม/master คาดหวัง แต่ prototype ทำต่างหรือไม่มี (documented, ไม่ใช่ spec):

| # | Deviation | Note |
| --- | --- | --- |
| 1 | ไม่มี Owner Information block + Follow บน detail | spec เดิมบังคับ owner row + follow — dl1 ไม่มี seller element เลย (seller ไป profile ผ่าน comment avatar/post-head ที่ surface อื่นเท่านั้น) |
| 2 | ไม่มี Ask Seller / Contact / Chat entry บน detail | `chat-fab`+`chatPop` เป็น dead path (ต้อง `ask:"bubble"`+dl2); dl1 ไม่มี `ask-pill` — chat เข้าผ่าน feed card Ask / item chat rows เท่านั้น (profile Chat เป็น dead toast ตาม canonical 06; ไม่มี chat notification type) |
| 3 | ไม่มี Save (bookmark) บน detail | action row ใช้ `mf-btn`+`wl-btn` แทน `save-btn`; wishlist คือ save-family ของ detail |
| 4 | ไม่มี Full Screen Image Viewer | tap hero = carousel เท่านั้น (ขัด spec เดิม AC-DETAIL-007 + AC-FEED-016 เดิม) — contract §18 |
| 5 | ไม่มี inline comments + comment actions | ไม่มี `View all comments`/per-comment `...`/delete/report comment; comment sheet read+like-only; input/Reply/emoji dead → `Not in this prototype yet` |
| 6 | `FOR SALE`/`SHOWCASE` tag ขับด้วย `price` ไม่ใช่ `pfkind` | sold post (markAssetSold) ยังขึ้น FOR SALE; gfx sold (price:null) ขึ้น SHOWCASE — canonical sold ไม่ควรมี sale tag; flag FSP-030 |
| 7 | `Price & Data Source` บน detail แต่ถูก filter ใน feed expander | `detailsHTML` ตัดกลุ่มนี้ออก — detail เต็มกว่า expander (ตั้งใจตามโค้ด — รับตามจริง) |
| 8 | `mf-btn`/`wl-btn` ใช้บนโพสต์ตัวเองได้ | ไม่มี self-guard — owner wishlist/watch โพสต์ตัวเองได้ (IG ก็ไม่กัน wishlist; flag เป็น contract note) |
| 9 | Root comment `Reply` ไม่ localize | `<span class="c-meta">Reply</span>` hardcode EN; reply rows มี `ตอบกลับ`/`Reply` — language sweep FSP-026 |
| 10 | Comment empty copy เดี่ยว | `No comments yet`/`ยังไม่มีความคิดเห็น` บรรทัดเดียว — ไม่มี `Be the first to comment.`/`Write a comment...` ของ spec เดิม |
| 11 | `commentsFor` mock thread | โพสต์ที่มี count แต่ไม่มี seed → generate rows จาก `LIKER_POOL`/`PF_CMT_TEXTS` (session) — contract |
| 12 | `POST_DETAIL_CFG` per-post overrides | dev artifact (เปลี่ยน ask/ds/pr/dh/dl/tg ตาม post id) — ทุก seed posts ใช้ dl1; ไม่เขียนเป็น feature (00_NAV §11 tooling rule) |
| 13 | dl2/dh2/dh4/dh5/ds variants/pr variants/tg2 dead | `igDetailHTML` (post-head+caption+ask+save+liked-by), accordion/cards/tabs spec layouts, price variants — dead paths ทั้งหมด |
| 14 | Detail ไม่ persist/deep-link | ไม่มี route — external deep link contract อยู่ 00_NAV §10 เท่านั้น |
| 15 | EN-hardcoded strings | `Follow this model`/`Following this model`/`No details on this post to watch`/`Added to Wish List`/`Removed from your wish list`/`Sent to X`/`Link copied`/`Listing detail isn't in this prototype yet` — language sweep FSP-026 |
| 16 | `pfKind()` fallback | โพสต์ไม่มี `pfkind` infer จาก price (seed/gfx) — canonical อยู่ 04 (documented ที่นั่นแล้ว) |
| 17 | State session-only | `liked`/`wishlisted`/`wlCols`/`modelFollowing` เป็น memory state — persistence = contract |

---

# 10. Permission Rules

## Guest

ดู/ใช้ได้: เปิด detail ทุก public entry, hero carousel, spec groups + Price & Data Source, comment sheet (read), `#tag` → search

ต้อง login (Member Sheet): `.like-btn`, `.share-btn`, `.mf-btn`, `.wl-btn`, `.pm-btn`, `.comment-input`, `.emoji-row`, `.c-like`, `.c-meta`

## Member / Viewer

ทำได้: ทุกอย่างของ guest + like/share/watch alert/wishlist/others menu (favorites/ni/report)

ทำไม่ได้: edit/delete/mark-as-sold/pin/archive/commenting toggle ของโพสต์คนอื่น (menu ไม่มี rows เหล่านั้น); เข้าถึง `hide`/`sold` detail ของคนอื่น (ไม่มี entry)

## Owner

ทำได้: own-post menu เต็ม (archive/commenting/edit/mark-as-sold/pin/delete หรือ `View sale record`), edit-from-detail, like ตัวเอง, `mf-btn`/`wl-btn` ตัวเอง (ตาม prototype)

ทำไม่ได้: `Edit` บน sold post (มี `View sale record` แทน); re-sold (`Mark as sold` หายเมื่อ `pfkind:"sold"`)

## Blocked

โพสต์ blocked seller ไม่มี eligible entry ถึง detail (feed/search/profile กรองก่อนแล้ว) — direct/stale entry → unavailable contract (00_NAV §10)

---

# 11. Validation Rules

- Post Detail เป็น read surface — ไม่มี input field ของตัวเอง
- WA name field (ใน shared sheet): ว่าง → auto-name `waName()` เสมอ ไม่ block (canonical 03/10)
- New collection name (nc sheet): canonical saved/library flow — นอก scope เอกสารนี้
- `view-full`/chat entry resolve `findPost` — missing → silent no-op / `Listing detail isn't in this prototype yet` toast ตามลำดับ

---

# 12. Exception Handling

| Case | Behavior |
| --- | --- |
| `findPost` ไม่เจอ (view-full) | silent return — ไม่มี UI change |
| Chat item post missing | toast `Listing detail isn't in this prototype yet` (contract: unavailable state — canonical copy `รายการนี้ไม่พร้อมใช้งานแล้ว` อยู่ 00_GLOBAL §11) |
| โพสต์ถูกลบขณะ detail เปิด | `detail-open` ถูก remove อัตโนมัติ → เผย surface ข้างล่าง |
| Post ไม่มี specs | detail render minimal: `SHOWCASE` tag + name fallback caption + Descriptions + `-`; ไม่มี `detail-ref`, ไม่มี spec groups; `mf-btn` → `No details on this post to watch` |
| Post ไม่มี `desc` | Descriptions section ยัง render + body `-` |
| `desc`/`specs` มี `#tag` | `.igd-tag` กด → search results (`srchState.q` = tag, tab `foryou`) |
| WA criteria ว่าง | toast `No details on this post to watch` — sheet ไม่เปิด |
| Image โหลดไม่ได้ | contract: hero แสดง image-unavailable แต่ detail ยังเปิดได้ (02_FEED §12 เดียวกัน) — prototype ไม่มี path นี้ |

---

# 13. Empty State

| Context | Copy |
| --- | --- |
| Comment sheet ว่าง | `ยังไม่มีความคิดเห็น` / `No comments yet` (บรรทัดเดียว — deviation จาก spec เดิม) |
| Detail ของโพสต์ไม่มี specs | `SHOWCASE` tag + name (caption fallback) + `Descriptions` + `-` — ไม่ใช่ empty state page |
| Missing post (chat path) | toast `Listing detail isn't in this prototype yet` (contract `No data found`/unavailable อยู่ 00_GLOBAL §11) |

---

# 14. Notification Rules

- Post Detail ไม่สร้าง notification เอง
- Like/comment notifications เปิด Post Viewer (ไม่ใช่ detail) ตาม 00_NAV §8 — canonical 09_NOTIFICATION
- WA match toast (`Watch alert matched`) เกิดฝั่ง publish — canonical 10_WATCH_ALERT/02_FEED
- `mf-btn` save/delete ให้ toast feedback เท่านั้น (`Watch alert on`/`updated`/`removed`) — ไม่มี notification item

---

# 15. Analytics Events

Contract set (prototype ไม่มี tracking layer — เหมือน baseline อื่น):

- `post_detail_open` (entry: feed_card / viewer_dt / viewer_card / chat_item)
- `post_detail_back`
- `post_detail_like` / `post_detail_unlike`
- `post_detail_comment_open`
- `post_detail_share` (`sent:{name}` / `app:{app}` / `copy_link`)
- `post_detail_watch_alert_open` / `post_detail_watch_alert_saved` (source:`detail`) / `post_detail_watch_alert_no_details`
- `post_detail_wishlist_open` / `post_detail_wishlist_pick`
- `post_detail_menu_open` (own / others)
- `post_detail_photo_swipe`
- `post_detail_tag_click`

---

# 16. Acceptance Criteria

## Layer & Entries

| AC ID | Criteria |
|---|---|
| AC-DETAIL-001 | Post Detail ต้องเป็น `.page-detail` overlay เหนือ `.page-pv` — `View full detail` จาก `dt` sheet / viewer card ต้องเปิด detail โดย `pv-open` คงอยู่ และ `.detail-back` ต้องเผย viewer เดิม |
| AC-DETAIL-002 | `View full detail` ต้องแสดงเฉพาะโพสต์ที่ `hasDetails` (price หรือ specGroups หรือ specs); โพสต์ที่ไม่มี details ไม่มี `Tap for details` entry |
| AC-DETAIL-003 | Feed card media tap ต้องเป็น in-card carousel เท่านั้น — ต้องไม่เปิด Post Detail (AC-NAV-001) |
| AC-DETAIL-004 | Chat room item card (`data-chgo="post"`) ต้องเปิด Post Detail ของโพสต์นั้น; post ไม่พบ → toast `Listing detail isn't in this prototype yet` |
| AC-DETAIL-005 | `.detail-back` ต้อง remove เฉพาะ `detail-open` — ไม่มี forward/stack; bottom nav ต้องซ่อนขณะ detail เปิด |

## Anatomy

| AC ID | Criteria |
|---|---|
| AC-DETAIL-006 | Detail head ต้องมี back + title `รายละเอียด`/`Detail` + `...` (`pm-btn`) และ sticky ใน scroll |
| AC-DETAIL-007 | Hero ต้องแสดง `photo-counter` `1/N` + dots เมื่อ photos >1 และ swipe เลื่อนรูปทีละ 1 หยุดที่ปลาย (ไม่วน) และ double-tap = ไลก์; ไม่มี full-screen viewer |
| AC-DETAIL-008 | Action row ต้องมี like / comment(+count) / views / share และ `act-right` = `mf-btn` + `wl-btn` — ต้องไม่มี save-btn, ask-pill, liked-by row หรือ seller block |
| AC-DETAIL-009 | `comment-btn` ต้องซ่อนทั้งปุ่มเมื่อ `noComments`; `views-stat` ต้องซ่อนเมื่อ `hideCounts` หรือ `views` ว่าง/`"0"` |
| AC-DETAIL-010 | Tag ตาม `pfkind` (DEC-21): sale → `FOR SALE`, show → `SHOWCASE`, sold → `SOLD`, hide → `HIDDEN`, โพสต์ธรรมดาไม่มี tag |
| AC-DETAIL-011 | `detail-name` = Brand+Model จาก specs (ตัด `n/a`), fallback caption ส่วนแรกก่อน `—`; `detail-ref` = `Ref. {v}` (`Ref. -` เมื่อ n/a) และไม่ render เมื่อไม่มี specs |
| AC-DETAIL-012 | `Descriptions` ต้อง render `p.desc` (ไม่ copy caption); ว่าง → `-`; `#tag` ใน desc ต้องเปิด search results ของ tag นั้น |
| AC-DETAIL-013 | Spec groups ต้อง render ทุกกลุ่มใน `specGroups` **รวม `Price & Data Source`** (`Asking Price`/`Estimated Market Price`/`Last Price Update`/`Data Source`) — ต่างจาก feed expander ที่ filter กลุ่มนี้ออก |

## Actions

| AC ID | Criteria |
|---|---|
| AC-DETAIL-014 | `like-btn` ต้อง toggle `liked` + `likes ±1` และ sync `.liked` ทุก `.like-btn` ของ pid เดียวกันข้าม feed/viewer/detail |
| AC-DETAIL-015 | `comment-btn` ต้องเปิด shared comments sheet (title `ความคิดเห็น`/`Comments` + rows + one-level replies + emoji row + input); จาก detail ต้องไม่ใช่ `nt` variant |
| AC-DETAIL-016 | Comment rows ต้องมี avatar/name → Public Profile, time, text, `Reply` meta, like heart + count (`c-like` toggle local); ไม่มี per-comment `...`, delete หรือ report action ใน V1 prototype |
| AC-DETAIL-017 | Comment input/emoji/`Reply` (member) → toast `Not in this prototype yet`; guest → Member Sheet; `c-like` เป็น local toggle เท่านั้น (contract: write/delete/report) |
| AC-DETAIL-018 | `share-btn` ต้องเปิด shared share sheet — friends grid → `Sent to {name}`, app row → `Shared to {app}`, `Copy link` → `Link copied` (mock ไม่มี link จริง — canonical 02/11) |

## Watch Alert (`mf-btn`)

| AC ID | Criteria |
|---|---|
| AC-DETAIL-019 | `mf-btn` ต้องเปิด shared WA sheet ด้วย `source:"detail"` + `matchMode:"all"` + name auto `waName` เมื่อไม่มี alert เดิมที่ `modelKey` เดียวกัน |
| AC-DETAIL-020 | `waCriteriaFromPost` ต้อง snapshot mapped spec fields + delivery contents + unmapped spec rows และ **ยกเว้น** `Asking Price`/`Estimated Market Price`/`Last Price Update`/`Data Source` กับค่า `n/a` |
| AC-DETAIL-021 | โพสต์ที่ criteria ว่าง → toast `No details on this post to watch` และต้องไม่เปิด sheet |
| AC-DETAIL-022 | เมื่อมี alert เดิมที่ `modelKey` ตรง → เปิด sheet edit mode (criteria/name/mode เดิม); Save ซ้ำ criteria+mode → `You already saved this alert` |
| AC-DETAIL-023 | Bell `.on` + title `Following this model` เมื่อ ON alert ที่ `modelKey` ตรงกันอยู่ (`syncModelFlags`/`refreshMfBtns` ต้อง sync ทุก mf-btn) |

## Wishlist (`wl-btn`)

| AC ID | Criteria |
|---|---|
| AC-DETAIL-024 | `wl-btn` ครั้งแรกต้อง set `wishlisted` (+`wlAt`) ก่อนเปิด sheet (optimistic) — `wlCols` = multi-collection array (canonical 11) |
| AC-DETAIL-025 | Pick `Wish List` ขณะ wishlisted → un-wishlist + `Removed from your wish list`; pick collection → `Added to {col}` / `Added to Wish List`; `New collection` → nc sheet |

## States

| AC ID | Criteria |
|---|---|
| AC-DETAIL-026 | Guest ต้องเปิด detail + อ่าน specs + เปิด comment sheet อ่านได้เสรี (`view-full`/`comment-btn` ไม่ gate) |
| AC-DETAIL-027 | Guest กด `.like-btn`/`.share-btn`/`.mf-btn`/`.wl-btn`/`.pm-btn` หรือ `.comment-input`/`.emoji-row`/`.c-like`/`.c-meta` → Member Sheet `Join TukDaeng` |
| AC-DETAIL-028 | Owner detail ต้อง layout เดียวกับ viewer — ไม่มี private section (purchase/sale/portfolio อยู่ `pfasset:`/`sold:` ของ 04/14) |
| AC-DETAIL-029 | `pm-btn` ต้องเปิด own menu (member เจ้าของ) หรือ others menu — canonical 02_FEED; guest → Member Sheet |
| AC-DETAIL-030 | `Edit` จาก own menu บน detail ต้องซ่อน detail ระหว่าง composer และเปิดคืนหลัง composer ปิด (`V.editFromDetail`); `Delete` ต้องปิด detail ที่เปิดอยู่ |
| AC-DETAIL-031 | Viewer ต้องไม่มีทางถึง detail ของ `hide`/`sold` post ของคนอื่น (visibility matrix §10); owner เห็น detail ของทุก `pfkind` ผ่าน own profile tabs |

## Sold / Lifecycle

| AC ID | Criteria |
|---|---|
| AC-DETAIL-032 | Sold post บน detail ต้อง render ตามข้อมูลคงเหลือ (tag ตาม price — deviation documented) และ own menu ต้องมี `View sale record` → `sold:{id}` แทน `Edit` |
| AC-DETAIL-033 | `mf-btn` บน sold post ต้องยังทำงาน (criteria จาก specs) แต่ match count ต้องนับเฉพาะ `salePosts()` |
| AC-DETAIL-034 | โพสต์ถูกลบขณะ detail เปิด → detail ต้องปิดอัตโนมัติเผย surface ข้างล่าง |

## Contract / Deviation Guard

| AC ID | Criteria |
|---|---|
| AC-DETAIL-035 | `POST_DETAIL_CFG` และ variant paths (dl2/dh2/dh4/dh5/ds acc-cards-tabs/pr variants/tg2/chat-fab) ต้องไม่ถูกเขียนเป็น feature — dev artifact ตาม 00_NAV §11 |
| AC-DETAIL-036 | Detail ต้องไม่แสดง private data (Purchase Price/Date, Sold History, Portfolio Value) ในทุก mode — 00_GLOBAL §14 |

---

# 17. Related Modules

- [00_GLOBAL_RULES_MODULE.md](00_GLOBAL_RULES_MODULE.md) — statuses §9, visibility §10, gate §11, lifecycle §12, private data §14
- [00_NAVIGATION_AND_CROSS_MODULE_FLOW.md](00_NAVIGATION_AND_CROSS_MODULE_FLOW.md) — layer model §6.1, back §6.7, entry matrix §7, unavailable §10
- [02_FEED_MODULE.md](02_FEED_MODULE.md) — post model, `hasDetails`/details-body, own-post menu, Edit info, share/save sheets canonical
- [03_SEARCH_FILTER_MODULE.md](03_SEARCH_FILTER_MODULE.md) — post viewer modes + `dt` sheet + WA entry semantics canonical (FSP-016)
- [04_ASSET_MANAGEMENT_MODULE.md](04_ASSET_MANAGEMENT_MODULE.md) — `pfkind`/`assetId` linkage, Mark as Sold, `sold:`/`sell:` pages (FSP-017)
- [06_PROFILE_MODULE.md](06_PROFILE_MODULE.md) — profile tabs reachability (sold/hide entries)
- [07_CHAT_MODULE.md](07_CHAT_MODULE.md) — chat room + item card entry
- [09_NOTIFICATION_MODULE.md](09_NOTIFICATION_MODULE.md) — notification → viewer destinations
- [10_WATCH_ALERT_MODULE.md](10_WATCH_ALERT_MODULE.md) — `waSheetHTML`/`modelKey`/`alertMatch` internals
- [11_SOCIAL_MODULE.md](11_SOCIAL_MODULE.md) — comments/likes/share/save sheets canonical
- [14_PORTFOLIO_MODULE.md](14_PORTFOLIO_MODULE.md) — portfolio math + market data contract
- [15_TRUST_SAFETY_MODULE.md](15_TRUST_SAFETY_MODULE.md) — report flow + comment moderation

---

# 18. Future Enhancement

- Comment write/reply/delete/report จริง (prototype read+like-only) — per-comment `...` actions + delete cascade root→replies + report comment sheet (spec เดิม §8/§9 เก็บเป็น contract)
- Full Screen Image Viewer (zoom/pinch/swipe ข้ามรูป) — spec เดิม AC-DETAIL-007 contract
- Seller block + Follow บน detail (spec เดิม owner row) — ถ้าตัดสินเพิ่มต้อง resolve กับ dl1 minimal-head design
- Ask Seller / chat entry บน detail (`chat-fab` dead path → revive หรือยืนยันตัด)
- Save/bookmark บน detail (ปัจจุบันมีแค่ wishlist)
- Comment notification → deep-link focus comment (ปัจจุบันเปิด viewer เฉย ๆ — 00_NAV §8 note)
- Persistent `wishlisted`/`liked`/`modelFollowing` state (prototype session-only)
- Self-guard `mf-btn`/`wl-btn` บนโพสต์ตัวเอง (ถ้าตัดสินใจว่า owner ไม่ควร watch/wishlist ของตัวเอง)
- Sold state visual บน detail (tag ปัจจุบันอ่านจาก price — deviation #6)
- Unavailable detail page เต็มรูปแบบ (`รายการนี้ไม่พร้อมใช้งานแล้ว`) แทน toast/entry-level fallback
- External deep link → Post Detail (contract 00_NAV §10 — ไม่มี route ใน prototype)


## Batch A Amendments (2026-10-30)

- Detail มีแถว liked-by (avatar stack + "Liked by {name} and others") ใต้ action row เมื่อมี likes
- เมื่อปิด commenting: ซ่อนไอคอน 💬 และช่อง "Add comment…" ทุก surface
- Post ที่ถูกลบ/ไม่พร้อมใช้ → หน้า unavailable `รายการนี้ไม่พร้อมใช้งานแล้ว` พร้อมปุ่มกลับ (ไม่ใช่ toast)
