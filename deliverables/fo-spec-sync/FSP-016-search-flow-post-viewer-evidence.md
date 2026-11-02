# FSP-016 — 03_SEARCH_FILTER Update Evidence (search flow + post viewer)

Date: 2026-10-21
Task: `f79cd8cf` — "FSP-016 อัปเดต 03_SEARCH_FILTER — search flow + post viewer"
Scope: `FrontOffice/03_SEARCH_FILTER_MODULE.md` เท่านั้น (rewrite ทั้งไฟล์) — sync ตาม `Prototypes/fo-flow/index.html` (read-only) + baseline 00_GLOBAL (session §7, gate §11, lifecycle §12) / 00_NAV §6.x (routes `search`/`sfilter`/`recents`, layer model, back rules §6.7, entry matrix §7, notification §8) / 02_FEED (post model + eligibility ที่ FSP-015a/b lock)
Gap source: `gap-FSP-002a-feed-search.md` (A10–A15, B1–B20, C12–C21 ส่วน search/viewer) + `FSP-005-consolidated-gap-signoff.md`

Prototype anchors verified: `SEARCH_*` consts + `MAX_PRICE` ~14178–14195; helpers ~14196–14201; `blankFilters`/`srchState` ~14203–14217; `salePosts`/`haystack`/`matchQuery` ~14218–14227; `delivMatch`/`matchFilters` ~14228–14252; `searchResults` ~14253–14260; `filterCount` + `*Count` helpers ~14261–14276; `sellerAvatar`/`sellerSub`/`pushRecent`/`suggestRows` ~14277–14302; `tagRows` ~14303–14313; `exploreTiles` ~14314–14319; `landingHTML`/`recentHTML`/`recentPageHTML`/`suggestHTML`/`activeFilterChips`/`searchHTML` ~14320–14394; `resultSellers`/`sellerCardHTML`/`resultGridHTML`/`accountRowHTML`/`searchResultsHTML` ~14395–14633; `filterHTML`/`applyFilters` ~14634–14685; `pvPostHTML`/`pvPostSheetHTML`/`pvDetailsSheetHTML`/`svfPostHTML`/`pfpPostHTML`/`openPostViewer` ~14419–14586; `.pv-track` snap CSS ~3686–3706; `openSub`/`pushSub`/`renderSub`/`subBack` ~14783–14868; `search-btn` ~19355; handlers ~21103–21273; Enter ~19939–19946; live suggest ~20082–20089; price input ~20107–20120; chips drag ~20137–20154; `sr-wa` ~22002–22013; `waCriteriaFromSearch`/`waName`/`waSig`/`alertMatch` ~16124–16213; `waSheetHTML` ~16237–16251; `liked-by`/`share`/`save`/`more-link`/`pv-dt`/`view-full` handlers ~21849–22610; notification→viewer ~17806–17821; `GUEST_GATE_SEL`/`obGate` ~22997–23012

## 1. What changed (section map)

| Section | Change |
| --- | --- |
| Header/§2 Objective | rewrite — IG discovery surface (post-centric), ลบ marketplace asset-search wording ทั้งหมด |
| §3 Prototype Reference | **ใหม่ทั้งก้อน** — anchor index + dead/untriggered list (`S.sort`, `S.err`, `POST_DETAIL_CFG`, decorative tiles, recents seed, coach-mark) |
| §4 Master Alignment | rewrite — entry/results model/eligibility/filter draft/recents/WA entry/guest/nav/ไม่มีใน V1 |
| §5 Scope | rewrite — In = search flow 3 modes + recents + suggestions + tabs + filter page + post viewer 3 modes + WA entry + gates; Out = detail internals (05), WA internals (10), saved hub (11), profile grid (06), notif (09), report (15), sort/result-count/infinite-scroll, market-data activation model |
| §6 Screen Mapping | rewrite — landing/typing/recents page/suggestions/results 3 tabs/sfilter/viewer 3 modes/sheets/Member Sheet/empty-error |
| §7 User States | rewrite — Guest (browse ครบ + gate list), Member, Owner, Blocked (blocked หลุดยกเว้น `#` grid — deviation) |
| §8 User Flow | **rewrite ทั้งก้อน** — 11 flows: open search, typing→submit, popular chip, recents, suggestions, tabs, filter flow, price range, active chips, hashtag→search, tile→viewer, viewer actions, WA from results |
| §9 Business Rules | **rewrite ทั้งก้อน** — Search Entry/State/Keyword (เก็บชื่อ `Search Keyword Rule` + `Filter Visibility Rule` เพื่อรักษา ref จาก 10_WATCH_ALERT)/Results Eligibility (surface matrix — แก้ C13), Explore/Recents/Suggestions/Tabs/Active Chips/Filter Page (11 sections + dependent model)/Price Range/Sort/Post Viewer Entry+Anatomy+Modes+Navigation/Post Sync/WA Search Entry/WA Name/Lifecycle/Error contract/**Deviations & Dead-Code Notes** |
| §10–12 Permission/Validation/Exception | rewrite ให้ตรง gate list จริง + price validation 2 rules EN + dedupe + deleted toast |
| §13 Empty State | rewrite — EN-only copies จริง (`No data found` + `Try a different keyword or adjust your filters`/`No suggestions`/`No recent searches`) |
| §14 Notification | rewrite — ไม่สร้าง; WA notif → Post Viewer ตาม 00_NAV §8 |
| §15 Analytics | rewrite — contract event set ใหม่ (search_*/filter_*/post_viewer_*/watch_alert_*) mark contract |
| §16 ACs | **rewrite ทั้งชุด** — AC-SEARCH-001–040 sequential (เดิม 001–038 + letter suffixes 008A/009A/009B/009E/010A/029A/031A — renumber; ไม่มี live cross-ref ดู §2) |
| §17 Related | +09_NOTIFICATION/13_SETTINGS/14_PORTFOLIO links |
| §18 Future | +sort UI, result count, TH localization, recents persist, option-master suggestions, `#` grid ni/blocked consistency, popular filter, AI search, insights instrumentation |

## 2. Cross-doc ref check (ก่อนปิดงาน)

| Check | Result |
| --- | --- |
| `AC-SEARCH-` refs นอก 03 | `DOCUMENT_VERSION.md` เท่านั้น — historical changelog v1.8 (`AC-SEARCH-008A/009E`) ไม่ใช่ live ref; renumber ปลอดภัย ✓ |
| `Global Login Required Dialog` ใน 03 | **0** — spec ใหม่ใช้ Member Sheet ตาม rename note 00_GLOBAL §11 (เหลือ 67 hits ในเอกสารอื่น → per-module tasks) ✓ |
| Rule names ที่ 10_WATCH_ALERT อ้าง | `Filter Visibility Rule` + `Search Keyword Rule` เก็บชื่อเดิม (10 อ้างที่ lines 189/195) + เพิ่ม free-text snapshot clause ให้ตรง claim ของ 10 ✓ |
| 00_NAV §6.6/§6.7/§7/§8 | routes `search`/`sfilter`/`recents`, back rules (results→landing, sfilter→discard), entry matrix (tile→viewer, sr-wa→WA sheet, notification→viewer), Post Viewer 3 modes — ตรง spec ใหม่ทุกจุด (00_NAV เขียนก่อนหน้านี้แล้วตรงพฤติกรรม) ✓ |
| 00_GLOBAL §7/§11/§12 | guest capabilities มี `ใช้ Search (explore, results, filters)` อยู่แล้วตรง; gate list ตรง `GUEST_GATE_SEL`; lifecycle transitions → search impact ตรง §12 matrix ✓ |
| 02_FEED refs | 02 §5 Out อ้าง `03_SEARCH_FILTER_MODULE.md` (FSP-016) — resolve แล้ว; eligibility/post model/sheets/menus อ้าง canonical 02 ✓ |
| Stale terms ใน 03 (`Make Offer`/`Asset Detail`/`card layout`/`Result Count`/`sort UI`/`slider`/`infinite scroll` claims) | 0 ที่ conflict — เหลือเฉพาะ negative statements (ไม่มีใน V1); `Asset Detail` → `Post Detail` ตาม 00_NAV §6.1 ครบ ✓ |
| Docs กลางยัง asset-search (Master §Search, PRD §3.3, FO_PRD §Search, Use_Cases §3, DEV checklist §3, QA-SEARCH-*) | ขัด spec ใหม่ทั้งหมด (sale-only search, autocomplete entity, slider, result count, no-results copy) → flag FSP-025/026/027 ไม่แก้นอก scope ✓ |

## 3. Verification

| Check | Result |
| --- | --- |
| ไฟล์ที่แก้ | `FrontOffice/03_SEARCH_FILTER_MODULE.md` เท่านั้น (+ evidence file นี้) — rewrite เต็ม ~590 บรรทัด ✓ |
| `git status --porcelain -- Prototypes/` | `M Prototypes/fo-flow/index.html` = diff เดิมของ task `716b8972` (password ≥8 — verified `git diff --stat` 9 lines แตะ validation) — **งานนี้ไม่แตะ Prototypes/** ✓ |
| Copies ที่เขียนลง spec | ตรง prototype verbatim: `For you`/`Profiles`/`Tags`, `Search` (placeholder), `Recent`/`See all`/`Cancel`/`Clear all`/`Recent searches`, `No suggestions`/`No recent searches`, `No data found`/`Try a different keyword or adjust your filters`, `Something went wrong. Please try again.`/`Try again`, `Filters`/`Apply`/`Clear all`, `Minimum`/`Maximum`, `Minimum price must not exceed maximum price`/`Maximum price must not exceed 2,000,000`, `N listings`/`N รายการประกาศ`/`Following`/`กำลังติดตาม`/`ติดตาม`, `Likes`/`ถูกใจ`, `Tap for details`/`แตะเพื่อดูรายละเอียด`, `Add comment…`/`เพิ่มความคิดเห็น…`, `Posts`/`Post`, `Create watch alert`/`สร้างการแจ้งเตือนนาฬิกา`, `ตรงทุกเงื่อนไข`/`ตรงเงื่อนไขใดเงื่อนไขหนึ่ง`/`เฉพาะรุ่น`, `N now`, `Watch alert on`/`Watch alert updated`/`Watch alert removed`/`You already saved this alert`/`This post is no longer available`/`No details on this post to watch`, `THB {min\|0}–{max\|Any}`, `Any new listing`, `Unfollow @{seller}?` ✓ |
| Search semantics | 3 modes, recents dedupe/cap 8/session-only, suggestions kw≤6+sellers≤4, tabs foryou=Accounts+Posts (name-match accounts — ไม่นับ post sellers), tags=hashtag rows → `#` results, `#` grid = `POSTS` กรอง `!muted` (deviation), filters AND + draft pattern + model dependency + (N) counts — ตรง handlers ทุกจุด ✓ |
| Filter semantics | 11 sections ตรง table, price = inputs only (strip non-digit เงียบ + auto-comma), validate 2 rules ตอน Apply, `Apply (N)`/`Clear all`/back-discard, chips `data-rm` ลบ commit ทันที — ตรง `filterHTML`/`applyFilters` + input handler ~20108 ✓ |
| Viewer semantics | entry = tiles+notifications เท่านั้น (AC-NAV-026), default snap viewer anatomy (rail/foot/pv-add), feed/pfp modes, sheets ps/dt/nt/lk/sh/sv/menus, pv-back/pv-srch (`mode=typing` เฉพาะเมื่อมี stack), detail-over-viewer, rp-over report — ตรง `openPostViewer` + handlers ✓ |
| WA entry semantics | `sr-wa` gated; `waCriteriaFromSearch` snapshot; bell `on` = sig match; dedupe→edit mode; ซ้ำ→`You already saved this alert`; name auto (`waName`) ว่าง→regen ไม่ block; match=`salePosts()`; modes disabled เมื่อ criteria ว่าง — ตรง ~21899–22013 + ~16124–16251 ✓ |
| Guest semantics | search/explore/results/filter/viewer browse ฟรี; gate list ตรง `GUEST_GATE_SEL` (`.sr-wa`/`.follow-btn`/`.like-btn`/`.save-btn`/`.share-btn`/`.pm-btn`/`.comment-input`/`.lk-follow`) — ตรง 00_GLOBAL §11 ✓ |
| ACs ใหม่ | AC-SEARCH-001–040 ทุกข้ออ้างพฤติกรรมจริง (`srchState`/`salePosts`/`searchResults`/`pushRecent`/`suggestRows`/`tagRows`/`filterHTML`/`applyFilters`/`matchFilters`/`openPostViewer`/`pvPostHTML`/`waCriteriaFromSearch`/`waName`/`waSig`/`GUEST_GATE_SEL`) ✓ |

## 4. Deviations flagged (spec เลือก prototype — documented, not spec)

| Deviation | Note |
| --- | --- |
| `#` query grid รวม ni/blocked | `searchResults` ใช้ `POSTS` กรองแค่ `!muted` — spec รับตาม prototype + flag FSP-030 |
| Alert name ไม่ block เมื่อว่าง | ว่าง → `waName()` regenerate เสมอ (spec เดิม AC-SEARCH-031A บังคับชื่อ — แก้แล้ว) |
| Search surfaces EN-only | เกือบทั้งโมดูลไม่มี isTh branch (ยกเว้น seller card/viewer labels/WA sheet) — language sweep FSP-026 |
| Recents = session memory + seed mock | ไม่ persist; seed 6 rows เป็น mock — spec ระบุ contract |
| `S.sort` / `S.err` dead | sort `plo`/`phi`/`pop` ไม่มี UI; error block ไม่มี trigger — mark dead/contract |
| Explore tall/views badge | decorative index คงที่ (2/3/7) ไม่ใช่ popularity |
| `pv-add` แสดงแม้ `noComments` | rail comment ซ่อนตามกฎแต่ `Add comment…` bar ยังเปิด sheet ได้ — prototype quirk รับตามจริง |
| `pv-srch` ไม่มี stack → ปิดเฉย ๆ | จาก notification ที่ไม่มี `_subStack`, search icon แค่ปิด viewer — รับตาม prototype |
| Option catalogs static | `SEARCH_*` consts + dynamic Year/Ref จาก salePosts — `is_active`/option-master model เป็น contract ไม่มีใน prototype |
| Filter `Clear all` ไม่ commit | reset เฉพาะ `fDraft` — ต้อง Apply ถึงมีผล (ต่างจาก active chip `×` ที่ commit ทันที) |

## 5. Flags ส่งต่อ (ไม่แก้นอก scope)

- **FSP-018** — `05_ASSET_DETAIL_MODULE.md`: `View full detail` → Post Detail + `mf-btn` WA entry (criteria `waCriteriaFromPost` + `modelKey`) + `No details on this post to watch` toast — 03 อ้าง interface ไว้แล้ว
- **FSP-019** — `06_PROFILE_MODULE.md`: `pfp` viewer shell + `pfTabPosts` list + Follow pill rules — 03 ระบุแค่ entry/mode
- **FSP-021** — `10_WATCH_ALERT_MODULE.md`: `waSheetHTML` shared sheet + `alertMatch`/`walerts` list + `mf-btn` entry (C19: entry ที่ 2 นอกจาก search — spec เดิมบอก search-only ผิดแล้ว) + notification → viewer (09)
- **FSP-022** — `11_SOCIAL_MODULE.md`: shared sheets (likes/comments/share/save) + `setFollowing` + `pfp`/`lk-follow` semantics — 03 อ้าง entry-level เหมือน 02
- **FSP-025/026/027** — Master §Search / PRD §3.3 / FO_PRD / Use_Cases §3 / DEV checklist §3 (lines 79–93) / QA-SEARCH-* (001–003) ยัง marketplace-search หนัก (sale-only, autocomplete entity+counts, slider, result count, `No results found` copy, alert-name required) — ต้อง sync ตาม 03 ใหม่ + EN-hardcode copies เข้า language sweep
- **FSP-030** — `#` grid ni/blocked inconsistency + `pv-add` vs `noComments` quirk + `For you` dual-role naming — consistency sweep
- งานทั้งหมดยัง uncommitted รวม FSP-006–016 — รอพี่สั่ง commit แยก
