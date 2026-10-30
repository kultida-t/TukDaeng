# 03 Search & Filter Module

อ้างอิงหลักจาก [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md) + baseline [00_GLOBAL_RULES_MODULE.md](00_GLOBAL_RULES_MODULE.md) §7/§9–§12 + [00_NAVIGATION_AND_CROSS_MODULE_FLOW.md](00_NAVIGATION_AND_CROSS_MODULE_FLOW.md) §6–§9 — prototype `Prototypes/fo-flow/index.html` เป็น source of truth เดียวของพฤติกรรม (FO-PRD-v1.9)

---

# 1. Document Information

| Field | Detail |
| --- | --- |
| Module Name | Search & Filter |
| Platform | Mobile Application |
| Version | V1 |
| Status | Draft |
| Owner | Product / UX / Engineering |
| Document Type | Functional PRD - Master Aligned |

# 2. Objective

Search & Filter Module คือ discovery surface แบบ IG (post-centric — S-09) — เข้าจาก search icon บน app header ของ feed shell แล้วเปิด `search` sub page: landing = popular chips + explore photo grid, typing = recent searches + live suggestions, results = tabs `For you` / `Profiles` / `Tags` พร้อม active filter chips, filter page (`sfilter`) = chip multi-select แบบ draft pattern (Apply เท่านั้นที่ commit) และ result/explore tile เปิด Post Viewer เต็มจอเลื่อนแนวตั้งผ่านรายการโพสต์

เป้าหมายหลักคือให้ผู้ใช้ค้นพบโพสต์จาก keyword / filter / hashtag, ค้นหา seller accounts และ hashtags, กรอง sale listing ด้วยเงื่อนไขหลายมิติ (AND logic), และบันทึกเงื่อนไขค้นหาเป็น Watch Alert — ตามสิทธิ์ของ session (guest browse ได้เสรี, action ที่ต้องมีตัวตนเจอ Member Sheet `Join TukDaeng`)

# 3. Prototype Reference

Source of truth: `Prototypes/fo-flow/index.html` (read-only — ห้ามแก้)

- Search constants + state (~14178–14217): `SEARCH_BRANDS`, `SEARCH_POPULAR` (8 chips), `SEARCH_REFS`, `SEARCH_COND`, `SEARCH_DELIV`, `SEARCH_MOVE`, `SEARCH_DIAL`, `SEARCH_CASE`, `SEARCH_STRAP`, `MAX_PRICE` = `2,000,000`; helpers `esc`/`specOf`/`priceNum`/`viewsNum`/`fmtNum`/`unNum` (~14196–14201); `blankFilters`/`srchState` (~14203–14217) — state ผูกกับ screen object (session memory), `recents` seed เป็น mock 6 rows
- Eligibility + matching (~14218–14260): `salePosts()` (`price && !ni && !muted && !blocked`), `haystack`/`matchQuery` (ทุกคำต้องเจอใน haystack), `delivMatch`/`matchFilters`, `searchResults` (`#` query → `POSTS` กรองแค่ `!muted`; ปกติ → `salePosts()`), `S.sort` dead (`"new"` เสมอ — `plo`/`phi`/`pop` มี code แต่ไม่มี UI)
- Count + suggestion helpers (~14261–14302): `filterCount`, `brandCount`/`modelCount`/`optCount`/`strapCount`/`delivCount` (นับจาก `salePosts()`), `sellerAvatar`/`sellerSub`, `pushRecent` (dedupe แบบ case-insensitive + cap 8), `suggestRows` (keyword ≤6 + sellers ≤4)
- Tags + explore (~14303–14319): `tagRows` (hashtag จาก caption ทุกโพสต์ `!muted` + `CF_TAGS` seed), `exploreTiles` (ทุก photo ของทุกโพสต์ `!ni && !muted && !blocked`; tall/views badge = decorative index คงที่)
- Search UI (~14320–14633): `landingHTML` (chips + `xp-grid`), `recentRowHTML`/`recentHTML`/`recentPageHTML`, `suggestHTML`, `activeFilterChips`, `searchHTML` (modes `landing`/`typing`/`results`), `resultSellers`, `accountRowHTML`, `sellerCardHTML` (มี isTh branch บางส่วน), `resultGridHTML`, `searchResultsHTML` (head/tabs/sections/empty/error blocks)
- Filter page (~14634–14685): `filterHTML` (sections + `fDraft` clone + `Apply (N)` + `Clear all`), `applyFilters` (validate → `.flt-err` หรือ commit + `_subStack = ["search"]`)
- Post viewer (~14419–14586 + CSS ~3686–3760): `pvPostHTML` (rail/foot/`pv-add`), `pvPostSheetHTML` (`ps` sheet), `pvDetailsSheetHTML` (`dt` sheet), `svfPostHTML`/`pfpPostHTML`, `openPostViewer` (default / `feed` / `pfp` modes); `.pv-track` `scroll-snap-type: y mandatory` + `.pv-post` `scroll-snap-align: start` / `snap-stop: always`
- Entries: `.search-btn` บน feed app-header (~19355); `.igd-tag` hashtag ใน caption → `openSub("search")` + preset q (~22590–22597); `.sr-saved` → `pushSub("saved")` (~21132–21133); `.sr-chip ico` / `.flt-open` → `sfilter`
- Search handlers (~21103–21273): `.search-btn`/`.sr-x`/`.sr-cancel`/`.sr-fake`/`.sr-saved`/`.sr-pick`/`.rc-all`/`.rc-clear`/`.rc-x`/`.rc-row`+`.ac-row`/`.sr-tab`/`.sc-follow`/`.xp-tile`/`.pv-back`/`.pv-srch`/`.pv-add`/`[data-rm]`/`.sr-retry`/`.flt-chip`/`.flt-clear`/`.flt-apply`; Enter submit (~19939–19946); live suggestion input (~20082–20089); price auto-comma + digits-only (~20107–20120); chips-row drag scroll (~20137–20154)
- Back semantics (~14842–14868 + ~20750–20780): `subBack` — `sfilter` → `fDraft = null` ทิ้ง draft; `search` mode `results` → `mode = "landing"`; pick จาก `recents` page → `_subStack = ["search"]`
- Sheets + actions บน viewer: `.liked-by` → likes sheet (~22030–22038), share (~22046–22067), save (~22490–22520), comment (`pv-add` → `nt` variant ~21215–21227, `.comment-btn` ~22015–22028), `more-link` → `ps` + `details-toggle.pv-dt` → `dt` (~22567–22610), `.view-full` → `openPostDetail` ทับ viewer (~21849–21857), `follow-btn` → unfollow sheet (~21859–21898), `.pm-btn` → own/others post menu + `rpOpenFromPost` report stack ทับ viewer (`rp-over`, ~14872–14882)
- Watch Alert: `WA_FK_LABEL` (~16117–16121), `waCriteriaFromSearch`/`waCriteriaFromPost` (~16124–16160), `critMatch`/`alertMatch`/`alertMatchCount`/`waSig`/`waName`/`modelKeyOf`/`syncModelFlags`/`refreshMfBtns` (~16161–16213), `waModesHTML`/`waSheetHTML`/`waRowHTML`/`walertsHTML` (~16215–16279); handlers `.sr-wa`/`.wa-mode`/`.wa-go`/`.wa-del`/`.wa-tgl` (~21899–22013); entry ที่ 2 `mf-btn` บน Post Detail (~21899–21917)
- Guest gate `GUEST_GATE_SEL` + `obGate` (~22997–23012): `.sr-wa`/`.follow-btn`/`.sc-follow`/`.like-btn`/`.save-btn`/`.share-btn`/`.pm-btn`/`.comment-input`/`.lk-follow` gated; search/explore/filter/viewer surfaces ไม่ gated
- Notification → viewer (~17806–17821): watch alert row → `pfp` viewer 1 โพสต์; like/comment row → own post `pfp` viewer; post หาย → toast `This post is no longer available`
- Language re-render รักษา scroll ของ viewer/sub page (~19700–19723)
- Dead/untriggered (ห้ามเขียนเป็น feature): `S.sort` (`plo`/`phi`/`pop` ไม่มี control), `S.err` (error block + `sr-retry` render ได้แต่ไม่มี code path ใด set `err = true`), `POST_DETAIL_CFG`, explore tall-tile/views badge (decorative index 2/3/7), recents seed rows (mock ไม่ใช่ history จริง), coach-mark copy `.search-btn` (onboarding artifact)

# 4. Master Alignment Summary

| Area | Master Baseline |
| --- | --- |
| Search entry | Search icon บน app header ของ feed shell → `search` sub page (root ของ `_subStack`) — ไม่ใช่ bottom-nav tab (00_NAV §6.4/§6.6) |
| Result model | Photo grid (`xp-tile`) → Post Viewer — **ไม่ใช่** feed card / asset card (post-centric, S-09) |
| Result eligibility | Posts grid บน results = `salePosts()` — โพสต์ที่มีราคา (sale listing) + ไม่ `ni`/`muted`/`blocked`; explore/tags/hashtag surfaces ใช้ post eligibility ของตัวเอง (§9) |
| Filter | Chip multi-select draft pattern — edits ไปที่ `fDraft`, `Apply` commit เข้า `S.f` เท่านั้น; price = typed inputs (ไม่มี slider); ทุก option แสดง `(N)` = จำนวน sale listing ที่เห็น — `(0)` เลือกได้ (no current listing ≠ inactive) |
| Recent searches | อยู่ใน scope V1 — session-memory list ≤8 รายการ (inline 4 แถว + `See all` → `recents` page + `Clear all` + X รายแถว) |
| Watch Alert | `sr-wa` bell บน results head → shared Watch Alert sheet (criteria = keyword + filters + price); match เฉพาะ `salePosts()`; entry ที่ 2 = `mf-btn` บน Post Detail (canonical อยู่ [10_WATCH_ALERT_MODULE.md](10_WATCH_ALERT_MODULE.md)) |
| Guest | Search / explore / results / filter / post viewer browse ได้เสรี (00_GLOBAL §11 guest capabilities) — identity actions → Member Sheet `Join TukDaeng` |
| Navigation | Post Viewer = `.page-pv` overlay เหนือ sub page; Post Detail เหนือ viewer; back ตาม 00_NAV §6.7 (results → landing, `sfilter` → ทิ้ง draft) |
| ไม่มีใน V1 | Sort UI, result count, pull-to-refresh / infinite scroll, saved search เป็น feature แยก, Popular Filter context-aware |

# 5. Scope

## In Scope

- Search entry: `.search-btn` บน app header, hashtag (`igd-tag`) จากทุก caption surface, `pv-srch` jump กลับ search
- `search` sub page 3 modes: `landing` (popular chips + explore photo grid), `typing` (field + Cancel + X, recents/suggestions), `results` (head + tabs + active filter chips + sections)
- Recent searches: push อัตโนมัติเมื่อเลือก, dedupe, cap 8, inline 4 แถว + `See all` → `recents` page (`Clear all` + X รายแถว) — session memory เท่านั้น
- Live suggestions: keyword rows (brand/model พร้อม `N listings`, reference) + seller rows (พร้อม `N listings`/`Following`)
- Results tabs: `For you` (Accounts section + Posts grid), `Profiles` (seller cards + Follow button), `Tags` (hashtag rows + `N posts`)
- Active filter chips + per-chip remove (price chip ลบทั้ง min/max)
- `sfilter` page: 11 sections, dependent Model ← Brand, price range inputs + validation, draft/commit/discard pattern, `Clear all`, `Apply (N)`
- Post Viewer: 3 modes (`default` scroll-snap / `feed` / `pfp`), rail + foot + `pv-add` actions, sheets (`ps`/`dt`/`nt`/`lk`/`sh`/`sv`/post menus), back + search-icon semantics, detail-over-viewer
- Watch Alert entry จาก results (`sr-wa` → criteria snapshot + bell `on` state)
- Guest gate behavior (browse vs gated actions → Member Sheet)
- Empty/error states ตามที่ prototype render จริง (รวม EN-only copies)
- Contract-only: search error path (`S.err` ไม่มี trigger ใน prototype), analytics events

## Out Of Scope (module อื่นเป็นเจ้าของ)

- Post Detail internals (specs, `mf-btn`, `wl-btn`, ask) — [05_ASSET_DETAIL_MODULE.md](05_ASSET_DETAIL_MODULE.md) (FSP-018); เอกสารนี้ระบุแค่ `View full detail` → Post Detail handoff
- Watch Alert sheet internals / matching / list / notification — [10_WATCH_ALERT_MODULE.md](10_WATCH_ALERT_MODULE.md) (FSP-021); เอกสารนี้ระบุเฉพาะ criteria snapshot + entry + bell state
- Saved / Wishlist hub + collections internals (`sr-saved` เป็น entry เท่านั้น) — [11_SOCIAL_MODULE.md](11_SOCIAL_MODULE.md) (FSP-022)
- Profile grid + `pfp` viewer content rules — [06_PROFILE_MODULE.md](06_PROFILE_MODULE.md) (FSP-019); viewer mode `pfp` ระบุแค่ shell/entry
- Notification list internals — [09_NOTIFICATION_MODULE.md](09_NOTIFICATION_MODULE.md) (FSP-021); destination อ้าง 00_NAV §8
- Report stack internals — [15_TRUST_SAFETY_MODULE.md](15_TRUST_SAFETY_MODULE.md) (entry จาก post menu ใน viewer เท่านั้น)
- Comment/likes/share/save sheet internals — shared sheets ของ [11_SOCIAL_MODULE.md](11_SOCIAL_MODULE.md) (02_FEED อ้าง entry-level เช่นเดียวกัน)
- Sort UI / result count / pull-to-refresh / infinite scroll / end-of-list marker — ไม่มีใน V1 (prototype ไม่มี)
- Market Data `is_active` model / option-master lifecycle — prototype ใช้ static catalogs (`SEARCH_*`); no current listing vs inactive เป็น backend contract (ดู Filter Visibility Rule)
- Search Insights / keyword analytics backend — aggregate concern ฝั่ง BO

# 6. Screen Mapping

| Screen / State | Prototype | Description |
| --- | --- | --- |
| Search landing | `search` sub page · `mode:"landing"` | back + fake field + `sr-saved` icon + popular chips + explore `xp-grid` |
| Search typing | `mode:"typing"` | real input `.sr-q` + `.sr-x` + `Cancel`; body = recents (q ว่าง) หรือ suggestions |
| Recent section | `recentHTML()` | `Recent` + ≤4 rows + `See all`; per-row X |
| Recent searches page | `recents` route · `recentPageHTML()` | back + title + `Clear all` + full list |
| Suggestions | `suggestHTML()` | keyword rows (search icon + `N listings`) + seller rows (avatar + `N listings`/`Following`) |
| Search results | `mode:"results"` · `searchResultsHTML()` | head (back/fake field/`sr-wa` bell/filter icon) + tabs + active filter chips + body ตาม tab |
| Results — For you | `tab:"foryou"` | `Accounts` section + `Posts` `xp-grid two` |
| Results — Profiles | `tab:"profiles"` | seller cards (`sr-scard`) + Follow button |
| Results — Tags | `tab:"tags"` | hashtag rows `#tag` + `N posts` |
| Filter page | `sfilter` route · `filterHTML()` | back + `Filters` + chip sections + price inputs + `Clear all`/`Apply (N)` |
| Post Viewer — default | `.page-pv` · `openPostViewer()` | immersive snap viewer (explore/result tiles, notifications) |
| Post Viewer — feed mode | `.page-pv.feed` | head title + `pv-srch` + feed-style cards (saved/wishlist/archive) |
| Post Viewer — pfp mode | `.page-pv.pfp` | head `Posts`/`{user}` + Follow pill + `pfp-post` cards (profile grid) |
| Caption sheet | `ps` sheet · `pvPostSheetHTML()` | seller head + full caption + time + comments + dead input |
| Details sheet | `dt` sheet · `pvDetailsSheetHTML()` | spec/details + `View full detail` → Post Detail |
| Comment sheet | `nt` variant · `commentsHTML()` | shared comment sheet (view-only composer — contract) |
| Likes / Share / Save / Watch Alert sheets | `lk`/`sh`/`sv`/`wa` | shared bottom sheets (canonical 11_SOCIAL / 10_WATCH_ALERT) |
| Member Sheet | `obGate()` | guest gate `Join TukDaeng` (00_GLOBAL §11) |
| Result empty / error | `.sr-empty-block` | `No data found` / `Something went wrong. Please try again.` + `Try again` |

# 7. User States

## Guest

Guest ทำได้โดยไม่ gate:

- เปิด search sub page (header icon, hashtag ใน caption), พิมพ์/ลบ keyword, submit ค้นหา, กด `Cancel`/X
- ดู popular chips + explore grid, recents (session-local), suggestions, results ทุก tab, active filter chips
- เปิด `sfilter`, toggle chips, `Apply`/`Clear all`, back ทิ้ง draft
- แตะ explore/result tile เปิด Post Viewer + เลื่อนดูโพสต์ใน list + `pv-back`/`pv-srch`
- เปิด caption (`ps`) / details (`dt`) / comments / likes sheets เพื่ออ่าน และ `View full detail` → Post Detail + seller area → Public Profile (read-only)
- เปิด Saved hub จาก `sr-saved` (guest เห็น empty — ไม่ gate แต่ไม่มีข้อมูล)

Guest กดแล้วเจอ Member Sheet `Join TukDaeng` (gate — `GUEST_GATE_SEL`):

- `sr-wa` watch-alert bell, Follow ทุกจุด (results seller card `.sc-follow`, viewer foot `.follow-btn`, `ps` sheet, `pfp` head pill)
- like / save / share / `...` post menu บน viewer rail และทุก action ในเมนู (favorites / not-interested / report / own items)
- comment input / emoji row / comment like / liker-row Follow (ภายใน sheets)
- mute / unfollow / report / block ทุกจุด

## Member

Member ใช้ครบ: search + recents (ของ session ตัวเอง), suggestions, results ทุก tab, filter draft/apply/clear, tile → viewer + rail actions (like/save/share/menu), comment surface, Follow/Unfollow seller จาก results/viewer, Watch Alert create/edit/delete จาก `sr-wa` (dedupe → `You already saved this alert`)

## Owner (โพสต์ตัวเอง)

- `...` menu บนโพสต์ตัวเองใน viewer = own-post menu เดียวกับ feed (archive/commenting/edit/sold/pin/delete — canonical 02_FEED)
- โพสต์ตัวเองขึ้น explore/results ตาม eligibility เดียวกับโพสต์คนอื่น (composer เซ็ต `following:true` ให้ตัวเอง)

## Blocked Relationship

- โพสต์ของบัญชีที่ block กัน (`p.blocked`) หลุดจาก results Posts grid และ explore grid — **ยกเว้น** hashtag query ที่ยังแสดง (deviation — §9 Deviations)
- Blocked seller ไม่ขึ้นใน Accounts section / Profiles tab / suggestions (`PF_BLOCKED`)
- Muted seller: โพสต์หลุดทุก surface ของ search (results, explore, tags, hashtag grid)
- Not-interested (`ni`): หลุดจาก results Posts grid + explore แต่ยังขึ้นใน hashtag grid (deviation)

# 8. User Flow

## Open Search

1. User กด search icon บน app header ของ feed shell (guest กดได้ — ไม่ gate)
2. `openSub(scr, "search")` เปิด sub page เป็น root ของ stack (`_subStack = ["search"]`), mode default `landing`
3. แสดง popular chips + explore grid; back จาก landing ปิดหน้า search กลับ feed shell

## Landing → Typing → Submit

1. User แตะ fake field (หรือ `sr-fake` บน results head) → `mode = "typing"` — input จริง focus พร้อม cursor ท้ายข้อความ (คง q เดิมถ้ามี)
2. q ว่าง → แสดง `Recent` section; q ไม่ว่าง → live suggestions ทุก keystroke (`input` handler re-render body เท่านั้น)
3. `Cancel` → กลับ `landing` (คง q); `.sr-x` → ล้าง q เป็น `""` (กลับไป recents)
4. Enter/Submit → `q` trimmed; ถ้าไม่ว่าง `pushRecent(kw)`; `mode = "results"`, `tab = "foryou"`

## Popular Chip

1. User กด chip บน landing (`For you` = q ว่าง — เท่ากับ browse ทุก sale listing; อื่น = keyword)
2. Chip ที่ไม่ใช่ `For you` → `pushRecent(kw)` อัตโนมัติ
3. `mode = "results"`, `tab = "foryou"` — ไม่มี transition พิเศษ

## Recent Searches

1. Typing (q ว่าง) → `Recent` + ≤4 แถว; >4 → `See all` → `recents` page (back + title + `Clear all` + list เต็ม)
2. Row มี 2 แบบ: seller (avatar + name + `N listings`/`Following` sub) และ keyword (clock icon + text); X รายแถวลบทันที; `Clear all` ล้างทั้ง list
3. กด row (ทั้ง inline และบน `recents` page) → `pushRecent` + `q` + `mode = "results"` + `tab = "foryou"`; pick จาก `recents` page → `_subStack` เหลือ `["search"]` (back กลับหน้า search)
4. Recents เก็บบนเครื่องข้ามการเปิดแอป (DEC-22) และล้างเมื่อ sign out / เปลี่ยน session (00_GLOBAL §7); มี Clear all และลบรายแถวได้; seed rows ใน prototype เป็น mock

## Suggestions

1. พิมพ์ q → ระบบ render keyword rows ก่อน (brand/model ที่ชื่อ contains q พร้อม `N listings` จาก sale listings ปัจจุบัน + reference ที่ contains q — รวม ≤6) ตามด้วย seller rows (name contains q — ≤4, sub `N listings` หรือ `Following`)
2. ไม่มีผล → `No suggestions`
3. กด row → `pushRecent` (kw หรือ seller ตามชนิด) + `q` + `mode = "results"`

## Results Tabs

1. `For you` = `Accounts` section (seller ที่**ชื่อ** match q — post seller ที่ชื่อไม่ match ไม่นับ) + `Posts` grid
2. `Profiles` = seller cards (avatar, name, `N listings`/`N รายการประกาศ`, `· Following`, Follow/Following button)
3. `Tags` = hashtag rows + `N posts` (นับจากทุกโพสต์ `!muted` ที่มี tag ใน caption) — กด tag → q เป็น `#tag` → results tab `foryou` ที่ grid แสดงทุกโพสต์
4. สลับ tab ไม่เปลี่ยน q/filters; active filter chips แสดงใต้ tabs เสมอเมื่อมี filter

## Filter Flow (`sfilter`)

1. เปิดจาก filter icon บน landing chips หรือ `flt-open` บน results head → `pushSub("sfilter")` + clone `S.f` → `fDraft`
2. User toggle chips — edits ลง `fDraft` เท่านั้น (re-render แต่คง scroll position); เลือก/ยกเลิก Brand → prune `model` ที่ไม่ใช่ของ brand ที่เลือกออกจาก draft
3. `Clear all` → `fDraft` = blank (ไม่ commit — ต้อง Apply ถึงมีผล)
4. `Apply (N)` (N = จำนวน filter values ที่เลือก, price นับ 1) → validate price → commit `S.f = fDraft`, `mode = "results"`, `_subStack = ["search"]` (กลับ results โดยตรง)
5. Back/ออกกลางทาง → `fDraft = null` ทิ้ง draft ทั้งหมด (00_NAV §6.7)

## Price Range

1. พิมพ์ min/max — input handler strip ทุก non-digit เงียบ + auto-format comma ทุก keystroke (`2000000` → `2,000,000`)
2. `Apply` → validate: min > max → `Minimum price must not exceed maximum price`; max > `2,000,000` → `Maximum price must not exceed 2,000,000` — error แสดงใน `.flt-err` และไม่ commit
3. ผ่าน → commit เป็น price chip `THB {min|0}–{max|Any}` บน results

## Active Filter Chips

1. Results แสดง chip ต่อ selected value (`data-rm`) + chip price รวม 1 อัน
2. กด `×` → ลบ value นั้นออกจาก `S.f` ทันที (price chip ล้างทั้ง min/max) + re-render results — ไม่ต้อง Apply

## Hashtag → Search

1. User กด `#tag` (`.igd-tag`) ใน caption บน feed card / viewer / post detail / caption sheet
2. `openSub(scr, "search")` เปิดหน้า search ใหม่ + `q = "#tag"` + `mode = "results"` + `tab = "foryou"`
3. Posts grid แสดง**ทุกโพสต์**ที่ caption match (ไม่จำกัด sale — ดู Results Eligibility Rule)

## Result Tile → Post Viewer

1. User กด `xp-tile` บน explore grid (ทุก photo ของทุก eligible post) หรือ `xp-grid two` บน results (photo แรกของแต่ละ result)
2. `openPostViewer` เปิด `.page-pv`: default mode = รายการโพสต์ของ grid นั้น, เลื่อนแนวตั้ง snap ทีละโพสต์, เปิดที่โพสต์/photo index ที่กด (result tile = photo index 0 เสมอ)
3. `pv-back` → ปิด viewer กลับหน้าที่เปิดมา; `pv-srch` → ปิด viewer + กลับ `mode = "typing"` ของหน้า search (เฉพาะเมื่อมี sub stack — จาก notification ที่ไม่มี stack, icon นี้แค่ปิด viewer)

## Post Viewer Actions

1. Rail: like (toggle + sync), `Likes`/`ถูกใจ` label → likes sheet, comment (+count) → comment sheet `nt` variant, views (read-only), share → share sheet, save → save sheet, `...` → post menu (own/others ตาม `isOwnPost()`)
2. Foot: avatar/seller → Public Profile; `Follow` pill (เฉพาะยังไม่ follow → follow ทันที; following → unfollow sheet `Unfollow @{seller}?`); caption `…` → `ps` sheet; `Tap for details`/`แตะเพื่อดูรายละเอียด` → `dt` sheet (เฉพาะโพสต์ที่มี `specGroups`)
3. `pv-add` `Add comment…`/`เพิ่มความคิดเห็น…` → comment sheet เดียวกัน
4. `View full detail` ใน `dt` sheet → Post Detail slide ทับ viewer (`pv-open` คงอยู่ — `detail-back` กลับ viewer); Report จาก `...` → report stack `rp-over` ทับ viewer
5. Guest: rail actions + Follow + menu ทั้งหมด → Member Sheet; เปิด sheets ดู/ไป detail/profile ได้เสรี

## Watch Alert From Results

1. Member กด `sr-wa` bell บน results head (guest → Member Sheet)
2. `waCriteriaFromSearch` snapshot: keyword (`fk:"q"` ถ้ามี) + ทุก filter value + price range → draft `source:"search"`, `matchMode:"all"`, name = `waName()` auto
3. Shared Watch Alert sheet เปิด (title `Create watch alert`/`สร้างการแจ้งเตือนนาฬิกา`): name input (auto-filled, editable), match modes `ตรงทุกเงื่อนไข`/`ตรงเงื่อนไขใดเงื่อนไขหนึ่ง`/`เฉพาะรุ่น` พร้อม `N now` count, `Create alert`/`สร้างการแจ้งเตือน`
4. Criteria เหมือน alert เดิม (`waSig`) → เปิดเป็น edit mode (Save changes + Delete) แทน; save criteria ซ้ำ matchMode ซ้ำ → toast `You already saved this alert`
5. สำเร็จ → toast `Watch alert on`/`Watch alert updated` + bell `on` บน results head; alert เข้า Watch Alerts list (Settings)

# 9. Business Rules

## Search Entry Rule

- Entry หลัก = `.search-btn` บน app header ของ feed shell เท่านั้น — Search ไม่ใช่ bottom-nav tab (00_NAV §6.4)
- `openSub` เปิดเป็น root ของ `_subStack` เสมอ — หน้า search ไม่ stack ซ้ำ
- Entry เสริม: `.igd-tag` (hashtag → results `#tag`), `.sr-saved` (→ `saved` hub), `pv-srch` (viewer → typing)
- Coach-mark copy `Search brands, references or collectors.`/`ค้นหาแบรนด์ รุ่น หรือนักสะสมได้ที่นี่` เป็น onboarding artifact — ไม่ใช่ spec feature

## Search State Rule

- `srchState` ผูกกับ screen object (`scr._search`) — session memory เท่านั้น; เปลี่ยน session/unmount → state ใหม่ (00_GLOBAL §7/§12)
- เปิด search ใหม่ทุกครั้ง (fresh open) กลับ landing และล้าง q / filters / tab (DEC-24)
- Fields: `mode` (`landing`/`typing`/`results`), `q`, `tab` (`foryou`/`profiles`/`tags`), `sort` (`"new"` — dead), `err`, `recents` (≤8), `f` (applied filters), `fDraft` (filter draft)
- `fDraft` ถูกสร้างเมื่อเปิด `sfilter` และถูกทิ้งเมื่อ back/Apply (null หลัง commit/discard)

## Search Keyword Rule

- `matchQuery`: ทุกคำที่แยกด้วย whitespace ของ query ต้องปรากฏใน haystack (case-insensitive) = `seller + caption + captionFull + chips + specs (label + value)` — spec snapshot text ครอบค่า free-text ที่ Owner save ไว้ด้วย (ค้นเจอผ่าน keyword เสมอ)
- Query ว่าง (หลัง trim) = match ทุกโพสต์ใน eligible set (chip `For you` / Enter ด้วย q ว่าง → ทุก sale listing)
- Query ขึ้นต้น `#` = hashtag mode — ดู Results Eligibility Rule

## Results Eligibility Rule

Surface eligibility แยกตาม surface — **ไม่ใช่** "search = sale only" ทั้งโมดูล:

| Surface | Eligible set |
| --- | --- |
| Results Posts grid (non-`#` query) | `salePosts()` = มี `price` (sale listing) + ไม่ `ni`/`muted`/`blocked` |
| Results Posts grid (`#` query) | `POSTS` กรอง `!ni && !muted && !blocked` — รวม showcase/post ธรรมดา (DEC-23) |
| Explore grid (landing) | ทุก photo ของทุกโพสต์ `!ni && !muted && !blocked` (รวม non-sale) |
| Tags tab + `tagRows` | ทุกโพสต์ `!muted` |
| Accounts / Profiles / seller suggestions | seller ที่ชื่อ match q, ไม่ `PF_BLOCKED` (ไม่จำกัด sale posts) |
| Filter option counts `(N)` + WA match | `salePosts()` เท่านั้น |

- `matchFilters` apply กับผลลัพธ์ทุกชนิด (รวม `#` query)
- ไม่มี result count บนหน้า results — ตัวเลขที่เห็นคือ `(N)` ข้าง filter option + `Apply (N)` = จำนวน filter ที่เลือก ไม่ใช่จำนวนผลลัพธ์

## Explore Landing Rule

- Chips row: filter icon (→ `sfilter`) + `SEARCH_POPULAR` คงที่ ≤10 chips (`For you` active default, `Rolex`, `Submariner`, `Datejust`, `Grand Seiko`, `Tudor`, `Breguet`, `Full set`); scroll แนวนอนได้
- Explore grid `xp-grid`: `xp-tile` ต่อ photo — ทุก photo ของทุก eligible post (flatten); บาง tile มี `.xp-views` badge (decorative — index คงที่ 2/3/7, ไม่ใช่กฎธุรกิจ)
- Tile → Post Viewer default mode ที่ post + photo index นั้น; list ของ viewer = eligible posts ทั้งหมด (ไม่ใช่ทุก photo — viewer snap ทีละโพสต์)

## Recents Rule

- `pushRecent` ทุกครั้งที่เลือก keyword/seller/tag เข้า results — dedupe แบบ case-insensitive ตาม (kind, value), ค่าใหม่ขึ้นหัว, cap 8
- Kind: `kw` (keyword/hashtag) / `seller` — render row ต่างกัน (clock icon vs avatar)
- Persist บนเครื่องข้ามการเปิดแอป และล้างเมื่อ sign out / เปลี่ยน session (DEC-22); seed ใน prototype เป็น mock 6 rows
- ลบรายแถวด้วย X; `Clear all` ล้างทั้งหมด; ไม่มี confirm

## Suggestions Rule

- Live ทุก keystroke: `q` ว่าง → recents; `q` ไม่ว่าง → suggestions
- Keyword pool = `SEARCH_BRANDS` (brand + `brand model` label) + `SEARCH_REFS` — name contains q (case-insensitive); sub = `N listings` จาก `brandCount`/`modelCount` (refs ไม่มี sub); ≤6 rows
- Seller pool = sellers จาก `POSTS` (dedupe, name contains q); sub = `N listings` (เฉพาะโพสต์ที่มี price) หรือ `Following`; ≤4 rows — keyword rows ก่อนเสมอ
- ไม่มี entity/option-master suggestions (Condition/Delivery/Case/Movement/Dial/Strap) และไม่มี `is_active` concept — static catalogs (deviation จาก spec เดิม, contract อยู่ Filter Visibility Rule)

## Results Tabs Rule

- `For you`: `Accounts` (ก่อน) + `Posts` — Accounts = `resultSellers` (ชื่อ match q, dedupe, ไม่ blocked) render `accountRowHTML` (`N listings` + `· Following`) — **ไม่**นับ seller ที่มีโพสต์ match แต่ชื่อไม่ match (IG semantic)
- `Profiles`: `sellerCardHTML` รายการเดียวกับ Accounts แต่เต็มการ์ด + Follow button (`sc-follow` → `setFollowing` toggle + re-render)
- `Tags`: `tagRows` — รวม hashtag จาก caption ทุกโพสต์ `!muted` + `CF_TAGS` seed; filter ตาม q (strip `#`); count = จำนวนโพสต์ที่มี tag; sort count desc → alpha; กด → `#tag` results
- Tab default `foryou` ทุกครั้งที่เข้า results (submit/chip/recent/suggestion/tag)

## Active Filter Chips Rule

- แสดงเมื่อ `filterCount(S.f) > 0`: chip ต่อ selected value + chip `THB {pmin|0}–{pmax|Any}` อันเดียวสำหรับ price
- `×` ลบ value ทันที (commit ทันทีไม่ใช่ draft) — price chip ล้าง `pmin`+`pmax`
- Chips row ลาก scroll แนวนอนได้ (drag — desktop pointer)

## Filter Page Rule

- `fDraft` = deep clone ของ `S.f` ตอนเปิด — ทุก chip edit ลง draft; `Apply` commit; back/`sub-back` ทิ้ง (00_NAV §6.7)
- Sections (ทั้งหมด multi-select chips):

| Section | Key | Source | Match logic |
| --- | --- | --- | --- |
| Brand | `brand` | `SEARCH_BRANDS` keys | `specOf(p,"Brand")` exact |
| Model | `model` | models ของ brand ที่เลือก (ไม่เลือก = ทุก brand) | `specOf(p,"Model")` contains |
| Price range (THB) | `pmin`/`pmax` | typed inputs | `priceNum` ≥min ≤max |
| Year of production | `year` | unique `specOf(p,"Year")` จาก salePosts, sort desc | exact |
| Reference | `ref` | unique `specOf(p,"Reference")` จาก salePosts | exact |
| Condition | `cond` | `SEARCH_COND` | `specOf(p,"Condition")` exact |
| Case size | `csz` | `SEARCH_CASE` | `specOf(p,"Case Diameter")` exact |
| Movement | `move` | `SEARCH_MOVE` | `specOf(p,"Movement Type")` contains |
| Dial color | `dial` | `SEARCH_DIAL` | `specOf(p,"Dial Color")` contains |
| Strap / Bracelet | `strap` | `SEARCH_STRAP` | `Strap/Bracelet Material` + `Strap Material` contains |
| Delivery contents | `deliv` | `SEARCH_DELIV` | `delivMatch` (regex บน `Box & Papers` + chips) |

- Model dependency: เลือก brand → section title `Model · {brands joined " + "}` + model list เฉพาะ brand เหล่านั้น; toggle brand → prune model ที่ไม่อยู่ใน brand ที่เหลือทันที
- ทุก option แสดง `(N)` = จำนวน `salePosts()` ที่ match — รวม `(0)` เลือกได้เสมอ
- Section order คงที่ตามตาราง; scroll position คงไว้เมื่อ chip re-render

## Filter Visibility Rule

- Option lists ใน prototype เป็น static catalogs (`SEARCH_*`) + dynamic (Year/Reference จาก salePosts) — production contract: Brand/Model/Reference มาจาก Market Data, ที่เหลือมาจาก option master ที่ `is_active=true`
- `(N)` count = no current listing ยังเลือกได้เสมอ เพื่อรองรับ Watch Alert use case (หารุ่นที่ตรงเงื่อนไขแม้ตอนนี้ไม่มี listing)
- แยกความหมาย: `no current listing` (active แต่ N=0 → แสดงเลือกได้) vs `inactive market data`/`deactivated option` (`is_active=false` → ไม่แสดงเป็นตัวเลือกใหม่) — prototype ไม่มี inactive entity ใน catalog, contract เดิมคงไว้

## Price Range Rule

- Inputs 2 ช่อง (`Minimum`/`Maximum`) ไม่มี slider; `inputmode="numeric"`
- ระหว่างพิมพ์: strip ทุก non-digit เงียบ (ตัวอักษร/ทศนิยม/ติดลบ/สัญลักษณ์หายทันที ไม่มี error) + auto-comma; paste `2,000,000` หรือ `20,00,000` → normalize เป็น `2,000,000`
- Validate เฉพาะตอน `Apply`: `min > max` → `Minimum price must not exceed maximum price`; `max > 2,000,000` → `Maximum price must not exceed 2,000,000` (EN hardcode — deviation)
- ว่างทั้งคู่ = ไม่ใช้เงื่อนไข; กรอกข้างเดียวใช้ข้างนั้น; min == max = ราคาเท่ากัน; `MAX_PRICE` = 2,000,000 THB

## Sort Rule

- V1 ไม่มี sort control — `S.sort = "new"` ตลอด (natural order ของ POSTS); `plo`/`phi`/`pop` มี code เผื่อแต่ไม่มี UI → ไม่ใช่ feature

## Post Viewer Entry Rule

- Post Viewer เปิดจาก grid tiles เท่านั้น — explore tile, results tile, profile grid tile, saved/wishlist/archive tile, notification row (00_NAV AC-NAV-026) — **ไม่เปิด**จาก feed card โดยตรง
- Tile → viewer list = post list ของ grid นั้น: explore = eligible posts; results = `searchResults(S)`; saved/wl/archive = collection list; profile = `pfTabPosts(user, tab)`; notification = 1 โพสต์
- Viewer เปิดที่ post (และ photo index) ของ tile ที่กด — snap ทีละโพสต์ตาม `scroll-snap-type: y mandatory`

## Post Viewer Anatomy Rule (default mode)

- Head: `pv-back` + `pv-srch` (search icon) — floating บนโพสต์
- `pv-post` เต็มจอ: full-bleed photo (`object-fit: cover`, photo index = phi ของ tile; โพสต์อื่น index 0) + bottom gradient
- Rail (ขวา): like heart, `Likes`/`ถูกใจ` label → likes sheet, comment icon + count (ซ่อนเมื่อ `noComments`), views eye + count (ซ่อนเมื่อ `hideCounts` หรือ views = 0/ว่าง), share, save bookmark (filled เมื่อ saved), `...` menu
- Foot (ล่างซ้าย): avatar + seller name (→ Public Profile) + `Follow`/`ติดตาม` pill (เฉพาะยังไม่ follow), caption สั้น + `…` → `ps` sheet, `Tap for details`/`แตะเพื่อดูรายละเอียด` → `dt` sheet (เฉพาะ `specGroups.length > 0`)
- `pv-add` bar `Add comment…`/`เพิ่มความคิดเห็น…` → comment sheet (`nt` variant)

## Post Viewer Modes Rule

| Mode | Head | Body | Entries |
| --- | --- | --- | --- |
| `default` | back + `pv-srch` floating | snap `pv-post` เต็มจอ | explore/results tiles, notification |
| `feed` | back + title + `pv-srch` | `svf-track` feed cards (`postCard` เดิม) | saved/wishlist/archive tiles |
| `pfp` | back + `Posts`/`{user}` + Follow pill (เฉพาะคนอื่น + ยังไม่ follow + ไม่ block) | `pfp-post` feed-style cards | profile grid tiles, notification (like/comment/watch) |

- ทุก mode scroll ไปที่โพสต์ที่กด (feed/pfp: `offsetTop - 86`; default: index × viewport height)
- `pfp` mode title แสดง `<b>{title}</b><span>{user}</span>` (`Posts`/`{user}` หรือ `Post`/`{user}` จาก notification)

## Post Viewer Navigation Rule

- รูปหลายรูปใน pv-post / pfp-post / feed-mode card: swipe ทีละ 1 หยุดที่ปลาย (ไม่วน); double-tap = ไลก์ (guest → gate); single tap ไม่ทำอะไร — ตาม 02 DEC-14
- `pv-back` → ปิด viewer (`pv-open` + `rp-over` ออก) กลับ surface ที่เปิดมา — ไม่ re-render search state
- `pv-srch` → ปิด viewer; ถ้ามี `_subStack` → `mode = "typing"` ของหน้า search (กลับไปพิมพ์ต่อ q เดิม); ถ้าไม่มี stack (เช่นเปิดจาก notification) → ปิดเฉย ๆ
- Post Detail เปิดทับ viewer (`view-full` → `openPostDetail`); `detail-back` กลับ viewer — viewer mount ค้าง (00_NAV §6.7)
- Report stack เปิดทับ viewer (`rp-over`); `sub-x`/`sub-back` คืน viewer
- Post flags (liked/saved/following/muted/…) sync ทุก surface ผ่าน `refreshPostViews`; language switch re-render viewer คง scroll/mode (`_pvArgs`)

## Watch Alert Search Entry Rule

- `sr-wa` bell แสดงบน results head เสมอ (ทั้ง q ว่าง/ไม่ว่าง); `on` เฉพาะเมื่อมี alert `source:"search"` ที่ `waSig` ตรง criteria ปัจจุบัน (alert จาก detail/settings ที่ sig เดียวกันไม่เปิด `on`)
- Criteria snapshot (`waCriteriaFromSearch`): keyword `fk:"q"` (ถ้า q ไม่ว่าง) + ทุก filter value ตาม `WA_FK_LABEL` + price range `fk:"price"` (`THB {min|0} – {max|Any}`)
- Criteria ว่างเปล่า = alert "ทุก listing ใหม่" (`Any new listing`) — อนุญาต
- Dedupe: `waSig` ตรง alert เดิม (ทุก source) → เปิด sheet เป็น edit mode; criteria + matchMode ซ้ำตอน save → toast `You already saved this alert` ไม่สร้างซ้ำ
- `matchMode` default `all`; `any`/`model` disabled เมื่อ criteria ว่าง (`all` = watch every new listing)
- Save → toast `Watch alert on` / `Watch alert updated`; Delete (edit mode) → `Watch alert removed`; ปิด sheet ไม่ commit
- Match count `N now` บน mode rows = `alertMatchCount` จาก `salePosts()` — sale เท่านั้น (canonical matching อยู่ 10_WATCH_ALERT)
- Entry ที่ 2 = `mf-btn` `Follow this model` บน Post Detail → `waCriteriaFromPost` + `modelKey` (canonical 05/10)

## Watch Alert Name Rule

- `waName` auto: `brand model · ref` / `"keyword"` / criteria แรก 2 ค่า join ` · ` / `Any new listing`
- Name field auto-filled + editable; **ว่างตอน save → regenerate auto-name เสมอ ไม่มี validation block** (deviation จาก spec เดิมที่บังคับชื่อ — prototype wins)

## Lifecycle Impact (post/asset transitions)

| Transition | Search impact |
| --- | --- |
| `Sale` → `Sold` / `Hide` / `Show` | โพสต์หลุด results Posts grid (ไม่มี price-eligibility เมื่อ `pfkind` เปลี่ยน — canonical `salePosts` ตาม price + flags), filter counts, WA match — ตาม 00_GLOBAL §12 |
| `Hide`/`Show` → `Sale` | กลับเข้า results grid + WA matching ถ้าตรง criteria |
| Asset-linked → `post` (ไม่มี price) | หลุด results Posts grid + filter counts + WA match — ยังอยู่ explore/tags surfaces |
| Post deleted | หลุดทุก surface; เปิดจาก notification/list เก่า → toast `This post is no longer available` (contract: unavailable state ของ Post Detail อยู่ 05/00_GLOBAL §11) |
| Block / unblock | block → หลุดทันที (posts grid, explore, accounts); unblock → กลับตาม eligibility |
| Mute / unmute / not-interested | muted → หลุดทุก search surface รวม `#tag`/tags; ni → หลุด results grid + explore (hashtag grid ยังขึ้น — deviation) |

## Search Error / Loading (contract — S-29)

- `S.err` → `.sr-empty-block` sad icon + `Something went wrong. Please try again.` + `Try again` — **ไม่มี code path ใด set `err = true` ใน prototype** (render path มี แต่ untriggered): spec เก็บเป็น contract เท่านั้น
- `Try again` → `err = false` + re-render
- ไม่มี skeleton/loading state, ไม่มี infinite scroll/pagination/pull-to-refresh ใน V1 — grid render ครั้งเดียว (`loading="lazy"` บน tile images)

## Prototype Deviations & Dead-Code Notes (documented, not spec)

- Search surfaces เกือบทั้งหมด **EN-only** (tabs `For you`/`Profiles`/`Tags`, placeholder `Search`, `Recent`/`See all`/`Cancel`/`Clear all`, `Filters`/`Apply`/`Clear all`/section titles/validation messages, `No data found`/`Try a different keyword or adjust your filters`/`No suggestions`/`No recent searches`, `Something went wrong…`/`Try again`, toasts `Watch alert on`/`updated`/`removed`/`You already saved this alert`/`This post is no longer available`) — มี isTh เฉพาะ seller card (`N รายการประกาศ`/`กำลังติดตาม`/`ติดตาม`), viewer labels, unfollow sheet และ Watch Alert sheet — language gap รวมใน sweep FSP-026
- `#` query results grid ใช้ `POSTS` กรองแค่ `!muted` → โพสต์ `ni`/`blocked` ยังขึ้นใน hashtag results (spec ยอมรับตาม prototype — flag ให้ FSP-030 consistency sweep)
- `S.sort` (`plo`/`phi`/`pop`) + `S.err` = dead state (code มี ไม่มี UI/trigger)
- Explore `.xp-views` badge + `tall` tile = decorative index คงที่ (2/3/7) ไม่ใช่ popularity logic
- Recents seed 6 rows = mock — `pushRecent` cap 8 เป็นกฎจริง
- `For you` ปรากฏ 2 บทบาท: landing chip (browse all) vs results tab — ชื่อเดียวกันตาม prototype
- `pv-add` `Add comment…` แสดงเสมอแม้ `noComments` — rail comment button ซ่อนตามกฎ แต่ bar นี้ยังเปิด comment sheet ได้ (prototype quirk — รับตามจริง)
- `resultSellers` นับ `N listings` = โพสต์ที่มี price ของ seller นั้น (ไม่ใช่ทุกโพสต์)
- `pfp-post` others-menu = Report เดียว (ตาม 02 deviation เดิม)

# 10. Permission Rules

## Guest

สามารถ (ไม่ gate):

- เปิด/ใช้ search ทุก mode (landing/typing/results), recents (session-local), suggestions, tabs, filter page + Apply/Clear
- เปิด Post Viewer จาก tile, เลื่อนดู, เปิด caption/details/comments/likes sheets อ่านอย่างเดียว, `View full detail` → Post Detail, seller → Public Profile
- `pv-back`/`pv-srch`, hashtag → search, `sr-saved` → Saved hub (empty)

ไม่สามารถ (gate → Member Sheet `Join TukDaeng`):

- Watch Alert (`sr-wa`), Follow ทุกจุด, like/save/share/post menus บน viewer, comment composer, report/block/mute/unfollow/not-interested

## Member

ใช้งานครบทุกอย่าง + Watch Alert create/edit/delete/toggle จาก results entry

# 11. Validation Rules

## Search Keyword

- ไม่ required — q ว่าง = browse ทุก eligible post
- รองรับอักขระทุกภาษา/ตัวเลข/`#` (matching เป็น substring contains, case-insensitive)
- `Enter` = submit; ไม่มี sanitize พิเศษนอกเหนือ `esc()` output

## Filter

- ไม่มี required field — Apply ด้วย draft ว่าง = ไม่มีเงื่อนไข (เทียบเท่า clear)
- Chips toggle อิสระทุก section; multiple sections = AND logic (`matchFilters` ทุกเงื่อนไขต้องผ่าน)

## Price Range

- digits-only enforcement ณ ขณะพิมพ์ (non-digit ถูก strip เงียบ — ไม่มี error message สำหรับตัวอักษร/ทศนิยม/ติดลบ)
- Auto-comma + normalize (internal = digits ล้วน)
- Validate ตอน Apply เท่านั้น: `min > max` → `Minimum price must not exceed maximum price`; `max > MAX_PRICE (2,000,000)` → `Maximum price must not exceed 2,000,000`
- ว่าง = ไม่จำกัดข้างนั้น (`0`/`Any` บน chip)

## Watch Alert

- Criteria ไม่มี required field (criteria ว่าง = `Any new listing`)
- Alert name: auto-filled เสมอ, editable, ว่างตอน save → regenerate auto (ไม่ block — ดู §9)
- Dedupe `waSig` (criteria set) → edit mode; criteria+mode ซ้ำตอน save → `You already saved this alert`

# 12. Exception Handling

| Case | Behavior |
| --- | --- |
| Results ไม่พบ (Posts grid ว่าง) | `.sr-empty-block` icon + `No data found` + `Try a different keyword or adjust your filters` (For you) / `No data found` (Profiles/Tags) |
| Suggestions ไม่พบ | `No suggestions` |
| Recents ว่าง | `No recent searches` (ทั้ง section และ `recents` page) |
| Search error (contract — ไม่มี trigger) | sad icon + `Something went wrong. Please try again.` + `Try again` → `err=false` re-render |
| Price validation fail | `.flt-err` ใต้ price row — ไม่ commit, draft คงอยู่ |
| Alert ซ้ำ | `You already saved this alert` + เปิด sheet edit mode ของ alert เดิม |
| โพสต์ถูกลบก่อนเปิด | toast `This post is no longer available` (จาก notification/list เก่า) |
| Blocked/muted/ni | กรองออกจาก eligible set ตาม Results Eligibility Rule — ไม่มี error UI |
| Guest กด gated action | Member Sheet `Join TukDaeng` (ทับทุก layer รวม viewer) |
| `mf-btn` โพสต์ไม่มี spec | toast `No details on this post to watch` (entry 05 — บันทึกเพื่อ cross-ref) |

# 13. Empty State

| Surface | Copy (prototype — EN only) |
| --- | --- |
| Results For you | `No data found` + `Try a different keyword or adjust your filters` |
| Results Profiles / Tags | `No data found` |
| Suggestions | `No suggestions` |
| Recent section / recents page | `No recent searches` |
| Watch Alerts list (cross-ref) | `No watch alerts yet — tap the bell on a post or save a search to start one` (canonical 10) |

หมายเหตุ: global empty `ไม่พบข้อมูล`/`No data found` ของ 00_GLOBAL §11 ตรงเฉพาะส่วน `No data found`; sub-copy `Try a different keyword or adjust your filters` เป็น variant ของ module นี้; EN-only = deviation (language sweep)

# 14. Notification Rules

- Search module ไม่สร้าง notification โดยตรง
- Watch Alert notification → Post Viewer โพสต์ที่ match โดยตรง (`pfp` mode 1 โพสต์) — ไม่มี Result List คั่นใน V1 (00_NAV §8; canonical 10_WATCH_ALERT)
- `Watch alert matched:` toast ตอน publish โพสต์ใหม่ = simulation, ไม่ใช่ notification item (02_FEED §14)

# 15. Analytics Events

Contract (S-29 — prototype ไม่มี tracking layer; event names เป็นข้อตกลงสำหรับ implement):

- `search_opened` — เปิด `search` sub page
- `search_query_submitted` — Enter/chip/suggestion/recent/tag → results (พร้อม q kind)
- `search_recent_selected` / `search_recent_removed` / `search_recents_cleared` / `search_recents_view_all`
- `search_suggestion_selected` (kind: kw/seller)
- `search_result_tab_switched` (foryou/profiles/tags)
- `search_result_tile_opened` (→ post viewer)
- `filter_opened` / `filter_chip_toggled` (key,value) / `filter_cleared` / `filter_applied` (N) / `filter_chip_removed` (key) / `filter_price_error`
- `post_viewer_opened` (mode + source surface) / `post_viewer_scrolled` / `post_viewer_closed` (back vs srch)
- `post_viewer_sheet_opened` (ps/dt/nt/lk/sh/sv/menu)
- `watch_alert_sheet_opened` (source: search) / `watch_alert_created` / `watch_alert_updated` / `watch_alert_deleted` / `watch_alert_duplicate`
- `search_error_retry` (contract — ไม่มี trigger ใน prototype)

# 16. Acceptance Criteria

| ID | Criteria |
| --- | --- |
| AC-SEARCH-001 | กด `.search-btn` บน feed app-header ต้องเปิด `search` sub page ที่ landing mode — guest ใช้ได้โดยไม่ gate |
| AC-SEARCH-002 | Landing ต้องแสดง popular chips (filter icon + `SEARCH_POPULAR`) และ explore photo grid จากทุก photo ของทุกโพสต์ `!ni && !muted && !blocked` |
| AC-SEARCH-003 | กด chip ต้องเข้า results: `For you` = q ว่าง (ทุก sale listing), chip อื่น = q เป็น keyword + pushRecent |
| AC-SEARCH-004 | แตะ fake field ต้องเข้า typing mode พร้อม input focus + `Cancel`; `Cancel` กลับ landing คง q; `.sr-x` ล้าง q |
| AC-SEARCH-005 | q ว่างใน typing ต้องแสดง `Recent` ≤4 rows + `See all` (เมื่อ >4); q ไม่ว่างต้องแสดง live suggestions ทุก keystroke |
| AC-SEARCH-006 | Enter ต้อง submit: trim q, `pushRecent` เมื่อไม่ว่าง, `mode="results"`, `tab="foryou"` |
| AC-SEARCH-007 | Recents ต้อง dedupe case-insensitive ตาม kind+value, ค่าใหม่ขึ้นหัว, cap 8; X ลบรายแถว, `Clear all` ล้างทั้งหมด — session memory เท่านั้น |
| AC-SEARCH-008 | `See all` ต้องเปิด `recents` page (back + `Clear all` + full list); กด row จาก page ต้องเข้า results และ `_subStack` เหลือ `["search"]` |
| AC-SEARCH-009 | Suggestions ต้องแสดง keyword rows ≤6 (brand/`brand model` พร้อม `N listings`, reference) ตามด้วย seller rows ≤4 (พร้อม `N listings`/`Following`); ไม่มีผล → `No suggestions` |
| AC-SEARCH-010 | Query matching ต้องเป็น AND ของทุกคำบน haystack (seller + caption + chips + specs) case-insensitive |
| AC-SEARCH-011 | Results Posts grid (non-`#` query) ต้องแสดงเฉพาะ `salePosts()` — โพสต์มี price + ไม่ `ni`/`muted`/`blocked`; ต้องไม่แสดง showcase/post ที่ไม่มี price |
| AC-SEARCH-012 | `#` query ต้องค้นทุกโพสต์ `!muted` (รวม non-sale, ni, blocked — deviation documented) |
| AC-SEARCH-013 | Results head ต้องมี back + fake field (แสดง q, แตะกลับ typing คง q) + `sr-wa` bell + filter icon; back จาก results ต้องกลับ landing ไม่ pop page |
| AC-SEARCH-014 | Results ต้องมี tabs `For you`/`Profiles`/`Tags`; tab default `foryou` ทุกครั้งที่เข้า results |
| AC-SEARCH-015 | `For you` ต้องแสดง `Accounts` (seller ชื่อ match q, ไม่ blocked) + `Posts` `xp-grid two`; seller ที่ชื่อไม่ match ต้องไม่อยู่ใน Accounts แม้โพสต์ match |
| AC-SEARCH-016 | `Profiles` ต้องแสดง seller cards พร้อม `N listings`/`N รายการประกาศ` + `· Following` + Follow button; guest กด Follow → Member Sheet |
| AC-SEARCH-017 | `Tags` ต้องแสดง hashtag rows + `N posts` (รวมจากทุกโพสต์ `!muted` + `CF_TAGS` seed), sort count desc → alpha; กด tag → `#tag` results |
| AC-SEARCH-018 | Result tile / explore tile ต้องเปิด Post Viewer default mode ที่โพสต์นั้น (explore = photo index ของ tile, results = index 0) — ไม่เปิด feed card |
| AC-SEARCH-019 | Filter page ต้องมี 11 sections: Brand, Model, Price range, Year, Reference, Condition, Case size, Movement, Dial color, Strap/Bracelet, Delivery contents — ทุก option มี `(N)` count จาก `salePosts()` และ `(0)` เลือกได้ |
| AC-SEARCH-020 | Model ต้อง dependent: เลือก brand → list เหลือ model ของ brand ที่เลือก + title `Model · {brands}` + prune model ที่ไม่เข้าเงื่อนออกจาก draft |
| AC-SEARCH-021 | Filter edits ต้องลง `fDraft` เท่านั้น — `Apply` commit เข้า `S.f`; back/ออกทิ้ง draft; `Clear all` reset draft (ไม่ commit) |
| AC-SEARCH-022 | `Apply` ต้องแสดง `Apply (N)` เมื่อมี selection; commit แล้วกลับ results (`_subStack=["search"]`) พร้อม active filter chips |
| AC-SEARCH-023 | Price inputs ต้อง strip non-digit + auto-comma ทุก keystroke; Apply ต้อง error `Minimum price must not exceed maximum price` (min>max) และ `Maximum price must not exceed 2,000,000` (เกินเพดาน) โดยไม่ commit |
| AC-SEARCH-024 | Active filter chips ต้องมี chip ต่อ value + chip `THB {min\|0}–{max\|Any}`; `×` ลบ value ทันที (price chip ล้างทั้งคู่) โดยไม่ต้อง Apply |
| AC-SEARCH-025 | Multiple filters ต้องใช้ AND logic (`matchFilters`); filter apply กับ `#` query ด้วย |
| AC-SEARCH-026 | Post Viewer default ต้องเป็น full-bleed photo snap แนวตั้ง (scroll-snap mandatory) + head (back + search icon) + rail + foot + `pv-add` ตาม Anatomy Rule |
| AC-SEARCH-027 | Rail ต้องซ่อน comment เมื่อ `noComments` และซ่อน views เมื่อ `hideCounts`/views ว่าง; save แสดง filled เมื่อ saved; `...` เปิด own/others menu ตามเจ้าของโพสต์ |
| AC-SEARCH-028 | `Likes` label → likes sheet; caption `…` → `ps` sheet; `Tap for details` → `dt` sheet (เฉพาะมี specGroups); `pv-add`/comment → `nt` comment sheet; `View full detail` → Post Detail ทับ viewer |
| AC-SEARCH-029 | `pv-back` ปิด viewer กลับ surface เดิม; `pv-srch` ปิด viewer + กลับ `mode="typing"` เมื่อมี sub stack (ไม่มี → ปิดเฉย ๆ) |
| AC-SEARCH-030 | Viewer modes: `feed` (saved/wl/archive tile → head title + `pv-srch` + feed cards) และ `pfp` (profile tile → head `Posts`/`{user}` + Follow pill ตามเงื่อนไข) ต้อง scroll ไปที่โพสต์ที่กด |
| AC-SEARCH-031 | Guest ต้อง browse search/results/filter/viewer ได้ครบ — แต่ `sr-wa`/Follow/like/save/share/`...`/comment input ต้องเจอ Member Sheet `Join TukDaeng` |
| AC-SEARCH-032 | `sr-wa` ต้องเปิด shared Watch Alert sheet ด้วย criteria = keyword + ทุก filter + price; criteria ว่าง = `Any new listing`; bell `on` เมื่อ sig ตรง |
| AC-SEARCH-033 | Alert name ต้อง auto-fill จาก `waName` + editable; ว่างตอน save → regenerate auto — ต้องไม่ block (deviation จาก spec เดิม) |
| AC-SEARCH-034 | Criteria `waSig` ซ้ำ → เปิด edit mode; criteria+matchMode ซ้ำตอน save → `You already saved this alert`; save → `Watch alert on`/`Watch alert updated`; delete → `Watch alert removed` |
| AC-SEARCH-035 | WA match count บน mode rows ต้องนับจาก `salePosts()` เท่านั้น; `any`/`model` disabled เมื่อ criteria ว่าง |
| AC-SEARCH-036 | Asset `Sale`→`Sold`/`Hide`/`Show` หรือ post ที่หลุด price ต้องหายจาก results Posts grid + filter counts + WA match; `Hide`/`Show`→`Sale` ต้องกลับเข้า |
| AC-SEARCH-037 | Blocked seller ต้องหายจาก results grid/explore/accounts/profiles/suggestions (ยกเว้น `#` grid — deviation); muted ต้องหายทุก search surface |
| AC-SEARCH-038 | Report จาก `...` ใน viewer ต้องเปิด report stack `rp-over` ทับ viewer และไม่ทำให้โพสต์หายจาก results ทันที |
| AC-SEARCH-039 | Results ว่างต้องแสดง `No data found` (+ `Try a different keyword or adjust your filters` บน For you); error state (contract) = `Something went wrong. Please try again.` + `Try again` — ทุก copy EN-only (deviation) |
| AC-SEARCH-040 | V1 ต้องไม่มี sort UI / result count / pull-to-refresh / infinite scroll / end-of-list marker บน search results — grid render ครั้งเดียว |

# 17. Related Modules

- [00_GLOBAL_RULES_MODULE.md](00_GLOBAL_RULES_MODULE.md)
- [00_NAVIGATION_AND_CROSS_MODULE_FLOW.md](00_NAVIGATION_AND_CROSS_MODULE_FLOW.md)
- [02_FEED_MODULE.md](02_FEED_MODULE.md)
- [05_ASSET_DETAIL_MODULE.md](05_ASSET_DETAIL_MODULE.md)
- [06_PROFILE_MODULE.md](06_PROFILE_MODULE.md)
- [09_NOTIFICATION_MODULE.md](09_NOTIFICATION_MODULE.md)
- [10_WATCH_ALERT_MODULE.md](10_WATCH_ALERT_MODULE.md)
- [11_SOCIAL_MODULE.md](11_SOCIAL_MODULE.md)
- [13_SETTINGS_MODULE.md](13_SETTINGS_MODULE.md)
- [14_PORTFOLIO_MODULE.md](14_PORTFOLIO_MODULE.md)
- [15_TRUST_SAFETY_MODULE.md](15_TRUST_SAFETY_MODULE.md)

# 18. Future Enhancement

- Sort control บน results (`plo`/`phi`/`pop` มี dead code รองรับ)
- Result count / pull-to-refresh / infinite scroll / end-of-list marker
- TH localization ของ search surfaces ทั้งหมดต้องครบตาม DEC-19 (ปัจจุบัน EN-only ยังไม่ครบ — language sweep FSP-026)
- Saved Search เป็น feature แยก / recents persist ข้าม session
- Popular Filter / context-aware Popular Model / trending page
- Entity/option-master suggestions (Condition/Delivery/Case/Movement/Dial/Strap) + `is_active` gating จริงแทน static catalogs
- `#` grid ให้เคารพ ni/blocked เหมือน surfaces อื่น (prototype inconsistency — ติดตาม FSP-030)
- AI Search Suggestion / Natural Language Search
- Search Insights event instrumentation (analytics contract ใน §15)


## Batch A Amendments (2026-10-30)

- ผลลัพธ์เรียงใหม่→เก่า
- แตะ hashtag ใน caption ไม่ push เข้า recents; เลือก tag ภายใน search push ตาม Recents Rule
- Guest เปิด Saved เห็น empty "No saved posts yet" / "ยังไม่มีโพสต์ที่บันทึก"
