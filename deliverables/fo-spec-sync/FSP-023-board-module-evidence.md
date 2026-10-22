# FSP-023 — 12_BOARD Update Evidence (home/list/search/article detail + data-bd* contract)

Date: 2026-10-22
Task: `0c6e4cb9` — "FSP-023 อัปเดต 12_BOARD — home/list/search/article detail (mission:cc291dc9)"
Scope: `FrontOffice/12_BOARD_MODULE.md` (rewrite ทั้งไฟล์ 638 → ~557 บรรทัด) + `FrontOffice/README_MODULE_INDEX.md` (one-liner module 12) — sync ตาม `Prototypes/fo-flow/index.html` (read-only) + baseline 00_GLOBAL (session §7, gate §11 Member Sheet — S-03 share gated, report impact §13) / 00_NAV (nav+route §6.3/6.6/6.7, entry matrix §7, gate §9, unavailable fallback §10, deep-link contract §12–13) / 11_SOCIAL (`shareSheetHTML` canonical §11, `data-bd*` boundary §5+D11 — FSP-022 lock) / 09_NOTIFICATION (Alerts feed canonical — FSP-021 lock) / 15_TRUST_SAFETY (`Board Content` report type — ยังไม่ sync)
Context: FSP-022 session note + evidence `FSP-016..022` + gap doc `gap-FSP-004-board-settings.md` (board A1–A4, B1–B23, C5/C7/C12–C15/C17 — settings portions อยู่ FSP-013/014 done แล้วตามลำดับ mission ก่อนหน้า)

Prototype anchors verified (scan บน working copy @ HEAD — line anchors drift จาก gap doc ~240 บรรทัด ให้ค้นด้วย function-name):

- **Routes/subHTML** ~17729–17733: `board`/`boardsearch`/`boardall`/`boardart:{id}` → `boardHomeHTML`/`boardSearchHTML`/`boardAllHTML`/`boardArticleHTML`; navgo `board` → `bdQ=""` + `openSub(scr,"board",true)` ~21531 (reset search state — ตรง 00_NAV §6.3)
- **Data** ~18065–18098: `bdQ` global, `BD_P`, `BD_FEAT_MAX=5`, `BD_BODY[3]` shared body, `BOARD` 15 บทความ (`{id,cat,title,sub?,img,min,ago,date,likes,feat?}` + inject `author:"Tuk Daeng Editorial"`,`liked`,`saved`), `bdGet`/`bdMeta`/`bdFeatured`/`bdLatest`/`bdJournal`(dead)/`bdFilteredJournal` (substring `cat+title.includes(cat)` ไม่ใช่ strict match), `BD_CATEGORIES` 7, `BD_POPULAR_TAGS` 6 ~18100
- **Carousel/drag** ~18102–18194: `bdCarouselScroll` dots sync, `bdGoSlide`, `bdStepSlide`(dead), `bdCenterPill`, document mouse-drag (carousel 6px/pills 5px + snap-back + `bdDidDrag`/`bdPillsDidDrag` suppress), `bdScrollHandler` no-op
- **Anatomy** ~18196–18234: `boardNavHTML`=`botNavHTML("board")`, `bdHeadHTML` (burger `data-bdmenu`+brand+`data-bdsearch`), `bdCardHTML` (มี `N likes`), `bdRowHTML` (ไม่มี likes), `bdListHTML` (rows+`You're all caught up`; empty `No articles in this category` EN-only)
- **Pages** ~18235–18366: `boardHomeHTML` (hero `bdFeatured`+`bd-dots`+Latest head+`data-bdall`), `boardAllHTML` (crumb `data-bdhome`+pills+`.bd-all-list`), `bdResultsHTML` (empty-q→Popular Topics; q→`N results for`+card grid/`No results found for`+suggestion), `boardSearchHTML` (`.bd-sbar`+`.bd-q`+`data-bdclear` ตาม render-time `bdQ`), `boardSearchSync` (re-render `.bd-res` เท่านั้น — ไม่ re-add clear-X), `boardArticleHTML` (`.bd-dnav` pill back+like+share → cat/h1/author-row(hardcode `Tuk Daeng`+`td-editorial.png`)/cover/callout/`BD_BODY`×3/tags `#Watches #{cat} #TukDaeng #Horology`; invalid → `chEmptyHTML` EN+dict)
- **Click chain** `boardClick` ~18368–18510: `bddot`→`bdart`(suppress drag)→`bdsearch`(reset+autofocus 320ms)→`bdclear`→`bdtag`→`bdcat`→`bdhome`(rpBack)→`bdall`(reset All+center pill)→`bdmenu`(pm sheet)→`bdmenu-cat`→`bdmore`/`bdact`/`bdsave`(**dead — ไม่มี element render**; `bdact=report`→toast `Report submitted. Thank you for notifying us.`)→`bdcancel-sheet`→`bdshare`→`shareSheetHTML()`→`bdlike`(toggle±1 sync `[data-bdlike]`+`[data-bdlike-count]`+`.bd-dfoot-sub` dead query); wired ~21521
- **Search input** ~20224: `.bd-q` input event → `bdQ` + `boardSearchSync` (live, no debounce)
- **Gate** ~20395 + ~23362–23371: `GUEST_GATE_SEL` ครอบ `[data-bdlike]`/`[data-bdsave]`/`[data-bdshare]`/`[data-bdact=share|save|report]` → `obGate()` Member Sheet ก่อน `boardClick` (listener เดียวกัน `#stage` — gate return ก่อน dispatch)
- **Session** ~23297–23351: `POST_FLAG_KEYS`/`snapPosts`/`clearUserData`/`restoreUserData`/`applySessionData` — **ไม่แตะ `BOARD`** (article flags ค้างข้าม session — D8)
- **i18n** ~19660–19858 + ~19903–19911: `I18N_TH` board block ~19695 (`Board`/`| Board`/`Categories`/`All`/`Featured`/cat names/`You're all caught up`/`Author`/`Date`/`Close`/`Like`/`Share`/`Article not found`/`This article is no longer available.`→`บทความนี้ไม่มีให้บริการแล้ว`) + `i18nTr` patterns (`{n} min read · {ago}`→`อ่าน {n} นาที`, date→พ.ศ.) + setLang board re-render (`.bd-sec h3`/`.bd-viewall`/`.bd-hero-btn`/`.bd-q` placeholder)

## 1. What changed (section map)

| Section | Change |
| --- | --- |
| Header refs | rewrite — เพิ่ม baseline chain 00_GLOBAL §7/§11/§13 + 00_NAV §6.3/6.6/6.7/§7/§9/§10/§12–13 + 11_SOCIAL §11 + 09 + 15 (unsynced note) |
| §1 Doc Info | rewrite — module name = editorial magazine; Version 1.9 / Status synced; เพิ่ม rename-trace note (v1.0 = 7-section + infinite scroll + guest-share + stale terms) |
| §2 Objective | rewrite — magazine surfaces + `data-bd*` board-specific boundary + guest gating |
| §3 Prototype Reference | **ใหม่ทั้งก้อน** — anchors จัดกลุ่ม routes/data/carousel/anatomy/pages/click-chain/input/gate/session/i18n/shared-deps (function-name + line ปัจจุบัน + drift note) |
| §4 Master Alignment | **rewrite** — 7-section row แก้เป็น magazine (D1); infinite scroll ขัด (D2); guest-share เดิมผิดตาม S-03 (D3); Notification→Alerts feed; guest gate→Member Sheet |
| §5 Scope | rewrite — In = 4 surfaces + carousel/pills/sheet/search/detail + like/share + gate + i18n + dead boundary; Out = create/edit/delete/comment, infinite scroll, saved-article, report live entry, native share/deep link, trending algo, publish-state sim, BO authoring, content i18n; Report boundary = spec-only contract |
| §6 Route & Surface Mapping | **ใหม่** — 4 routes + entries + bottom-nav presence + nav semantics (swap-open, rpPush/rpBack, suppress-drag) |
| §7 User States | rewrite — Guest (browse free / like-share gated / liked-state-leak note), Member, New, Admin(BO) |
| §8 Data Model | **ใหม่** — `BOARD` fields + taxonomy (pills ไม่ใช่ strict enum) + module globals (`bdQ`/`bdFilterCat` reset semantics + session-flag gap) + filter vs search corpus semantics |
| §9 Board Home | **ใหม่** — head + hero carousel rules (≤5, dots sync, drag/snap, no arrows/autoplay, `bdStepSlide` dead) + Latest + View all |
| §10 All Articles | **ใหม่** — crumb + pills (drag suppress + `bdCenterPill`) + substring filter + `No articles in this category` + Categories sheet flow |
| §11 Article Search | **ใหม่** — sbar/autofocus/clear-X dead-in-practice + Popular Topics + live results card grid + empty copy ครบ TH/EN |
| §12 Article Detail | **ใหม่** — floating pill anatomy + author row (hardcode `Tuk Daeng` ≠ `a.author` — D15) + `data-bdlike` semantics (±1 sync, `.bd-dfoot-sub` dead query) + `data-bdshare` → shared sheet canonical 11 |
| §13 Contract Rules | **ใหม่** — Report Article locked flow + deep-link/display-state matrix + back/main-nav เก็บเป็น contract-only (prototype ไม่ครอบ) + copy-drift note (`บทความนี้ไม่พร้อมใช้งานแล้ว` vs dict `บทความนี้ไม่มีให้บริการแล้ว`) |
| §14 Guest Gate | **ใหม่** — gated vs not-gated table ตาม `GUEST_GATE_SEL` จริง + gate-before-handler order + no pending-resume |
| §15 User Flows | rewrite — 4 flows ตามพฤติกรรมจริง (browse/view-all+filter/search/like-share) |
| §16 i18n & Copy | **ใหม่** — 4-layer coverage table + EN-only leftover inventory |
| §17 Notifications | **แทน "Notification Rules" เดิม** — board ไม่สร้าง alert; ไม่มี "Notification Center" |
| §18 Empty/Error/Toasts | **ใหม่** — copy table จริงทุกจุด + dead-path toasts + no-retry note |
| §19 Deviations | **ใหม่** — D1–D16 (magazine model, no infinite scroll, guest-share gated, report dead entry, save dead, bdmore/bdclear dead, substring filter, session-flag gap, search×filter no-combine, dead queries, unavailable-copy drift, EN leftovers, comment drift, bdFilterCat persist, author hardcode, 15 unsynced) |
| §20 Analytics | rewrite — contract events ใหม่ตาม surface จริง — ลบ `board_section_opened`/`article_list_load_more`/`article_report_started` เดิม (ไม่มี surface รองรับ) |
| §21 ACs | **rewrite ทั้งชุด** — AC-BOARD-001–018 sequential (เดิม 001–012 + 010A–F/011A–D suffixes); AC-016/017 mark contract; AC-018 dead-artifact guard |
| §22 Related | rewrite — เพิ่ม 00_GLOBAL/00_NAV/03/09/11/15/18 links ตาม boundary ใหม่ |
| §23 Future | rewrite — master mapping, report entry, saved article, infinite scroll, native share/deep link, trending, comment, content i18n, session reset, search×filter |
| README_MODULE_INDEX L67 | "Article board, categories, read/like/share" → "Editorial magazine board — hero featured, Latest list, categories, article search, detail like/share" |

## 2. Cross-doc ref check (ก่อนปิดงาน)

| Check | Result |
| --- | --- |
| `Global Login Required` ใน 12 ใหม่ | **0 actionable hits** — เหลือ 3 จุด rename-trace จงใจ (§1 note อ้าง spec เดิม, §4 negation, §14 negation); กฎจริงใช้ Member Sheet/`GUEST_GATE_SEL` ตาม 00_GLOBAL §11 ✓ |
| `Notification Center` ใน 12 ใหม่ | **0 actionable hits** — เหลือ 2 จุด rename-trace จงใจ (§1, §17); §17 ใช้ Alerts feed canonical 09 ✓ |
| Baseline delegation claims | 00_GLOBAL §11 (`Board actions (like, save, share, report article)` ใน login-required list + guest capabilities `ดู Boards และ Article Detail`) → §7/§14 ตรง ✓; 00_NAV §6.3 (`board เปิดใหม่พร้อม search state ว่าง`) → `bdQ=""` reset §6/AC-001 ✓; 00_NAV §6.6 route map → §6 ตรง ✓; 00_NAV §7 entry matrix (board tap→`boardart` free incl. guest; article actions→guest Member Sheet S-03) → §6/§14 ✓; 00_NAV §10 unavailable fallback → §13 contract ✓; 11 §5/D11 (`data-bd*` canonical 12) + §11 (`data-bdshare`→sheet เดียวกัน) → §12/§22 ตรง ✓ |
| AC refs นอก 12 | **0 live refs** — `AC-BOARD-*` ไม่มีเอกสารอื่นอ้าง (grep ทั้ง repo: เหลือแค่ DOCUMENT_VERSION L88 changelog entry ของ v1.4 — historical record ไม่แก้) → renumber sequential ปลอดภัย ✓ |
| QA/DEV checklist drift | `QA_TEST_SCENARIO_CHECKLIST` QA-BOARD-001–005C + `DEV_IMPLEMENTATION_CHECKLIST` §11 (L277–307) ยังอ้าง spec เดิม (7 sections/infinite scroll/guest-share/locked report entry) → flag FSP-026/027 ตาม mission (ไม่แก้ใน scope นี้) ✓ |
| Stale terms ใน synced docs อื่น (flag ไม่แก้) | `Notification Center`: `02_FEED L662`, `13_SETTINGS L539` (ตาม FSP-022 evidence — defer FSP-026 sweep); `00_NAV`/`00_GLOBAL` rename-trace จงใจ ✓ |
| `data-bd*` boundary กับ 11 | 12 §12/§14 own `data-bd*` contract เต็ม; 11 §15 table `Board data-bdact=report → toast` ยังตรงพฤติกรรม prototype ✓ |
| Report article contract vs prototype | spec §13 เก็บ locked flow เป็น contract-only ชัดเจน (C7 decision ของ gap doc) — prototype entry dead ทั้งเส้น documented D4/D6; ไม่ spec UI ที่ prototype ไม่ได้ implement เป็น live ✓ |

## 3. Verification

| Check | Result |
| --- | --- |
| ไฟล์ที่แก้ | `FrontOffice/12_BOARD_MODULE.md` (rewrite ทั้งไฟล์ ~557 บรรทัด) + `FrontOffice/README_MODULE_INDEX.md` (1 line) + evidence file นี้ ✓ |
| `git status --porcelain -- Prototypes/` | **ว่าง** — Prototypes/ ไม่ถูกแตะ ✓ |
| Board home | `bd-head` + hero `bdFeatured`≤5 + dots + Latest + `View all` + rows + caught-up — ตรง ~18235–18270 ✓ |
| All Articles | crumb `data-bdhome` + pills `BD_CATEGORIES` + substring filter + empty EN-only — ตรง ~18272–18285/~18098 ✓ |
| Categories sheet | `data-bdmenu` → pm sheet 7 rows + Close → `data-bdmenu-cat` push `boardall` pre-filtered — ตรง ~18420–18439 ✓ |
| Article search | sbar + autofocus 320ms + Popular Topics + live `title+cat+sub` + `N results for` + card grid + no-results copy — ตรง ~18286–18320/~20224 ✓ |
| Article detail | `bd-dnav` pill + author row + `data-bdlike-count` + cover/callout/`BD_BODY`×3/tag chips; invalid → `chEmptyHTML` — ตรง ~18321–18366 ✓ |
| Like | `data-bdlike` toggle `liked`/`likes±1` sync `.on`+`[data-bdlike-count]` (+dead `.bd-dfoot-sub` query) — ตรง ~18492–18509 ✓ |
| Share | `data-bdshare` → `shareSheetHTML()` shared — ตรง ~18478–18481 (canonical 11 §11) ✓ |
| Guest gate | `[data-bdlike]`/`[data-bdshare]`/`[data-bdsave]`/`[data-bdact]` ใน `GUEST_GATE_SEL` → `obGate` ก่อน `boardClick` — ตรง ~23370/~20395 ✓ |
| Session | `BOARD` ไม่อยู่ใน `POST_FLAG_KEYS`/`clearUserData`/`restoreUserData` — flags ค้างข้าม session (D8) — ตรง ~23297–23351 ✓ |
| Dead code | `data-bdmore`/`data-bdact`/`data-bdsave` ไม่มี element render (grep ยืนยัน — render เฉพาะใน dead-menu markup); `bdJournal`/`bdStepSlide`/`bd-dfoot-sub`/`data-bdclear`(render-time `bdQ` ว่างเสมอ) dead — ตรง §19 D5/D6/D10 ✓ |
| ACs ใหม่ | AC-BOARD-001–018 ทุกข้ออ้างพฤติกรรมจริง (`navgo`/`bdQ` reset, hero/dots/drag-suppress, `bdall`/`bdcat`/`bdCenterPill`, `bdmenu`/`bdmenu-cat`, `bd-q` live/`bdtag`, `boardart` anatomy, `data-bdlike`/`data-bdshare`, gate, `chEmptyHTML`, rpBack/sub-back, contract report/deep-link, dead-artifact guard) ✓ |

## 4. Deviations flagged (spec เลือก prototype — documented, not spec)

| Deviation | Note |
| --- | --- |
| 7 master sections → magazine | hero ≤5 + Latest + freeform tags — master mapping เป็นงาน FSP-025 (กระทบ master baseline — sign-off) |
| No infinite scroll | static 15 + `You're all caught up`/`คุณดูครบทั้งหมดแล้ว` — pattern เดียวกับ feed |
| Guest share gated | spec เดิม public-share ผิด — S-03 ล็อก share ต้อง login ทุก surface (00_GLOBAL §11 ใหม่กว่า spec เดิม) |
| Report Article ไม่มี entry | `data-bdmore` menu dead ทั้งก้อน → contract-only §13 (compliance เก็บ, live entry = future) |
| Save Article dead | `data-bdsave`/`a.saved`/toasts มีแต่ไม่มีปุ่ม — Saved Article future |
| `data-bdclear` dead-in-practice | render เฉพาะ `bdQ` non-empty แต่ทุก entry reset `""` + sync ไม่ re-add → clear-X ไม่เคยโผล่ |
| Filter = substring ไม่ใช่ enum | `(cat+title).includes(pill)` — `Rolex` pill จับ `Feature More Rolex Collections`+title-match |
| `BOARD` flags ไม่ reset ข้าม session | `liked`/`saved` ค้าง — guest เห็น heart `.on` ได้ (กดไม่ได้เพราะ gate); เดียวกับ 11 D7 |
| Search ไม่ combine filter | `boardsearch` match ทั้ง `BOARD` เสมอ ไม่สน `bdFilterCat` |
| Dead helpers | `bdJournal()`, `bdStepSlide()`, `.bd-dfoot-sub` query |
| Unavailable-copy drift | dict `บทความนี้ไม่มีให้บริการแล้ว` vs contract `บทความนี้ไม่พร้อมใช้งานแล้ว` (00_NAV §10) — unify FSP-026 |
| EN-only leftovers | `No articles in this category`, `N likes`, tag chips, sheet rows, board toasts — sweep FSP-026 |
| Code-comment drift | `hero + trending + Journal Board` comment vs `Latest Articles` label จริง |
| `bdFilterCat` persist | reset เฉพาะ `View all` — re-entry ผ่าน sheet คงค่าเดิม |
| Author hardcode | UI `Tuk Daeng` ≠ `a.author` `Tuk Daeng Editorial` |
| 15 unsynced | board report contract อ้าง spec เดิม+compliance; 15 sync = FSP-025/030 |

## 5. Flags ส่งต่อ (ไม่แก้นอก scope)

- **FSP-024 (14_PORTFOLIO)** — ไม่มี board overlap
- **FSP-025 (Master Product Definition)** — 7-section vs magazine taxonomy sign-off (D1); board naming `Board` vs tab `Boards`/`กระดานข่าว` (gap C14); 15_TRUST_SAFETY report-flow sync (D16)
- **FSP-026 (index + DEV checklists + Use Cases/PRD)** — `DEV_IMPLEMENTATION_CHECKLIST` §11 Board (L277–307) rewrite ตาม spec ใหม่; unavailable-copy unify (`บทความนี้ไม่มีให้บริการแล้ว` vs `บทความนี้ไม่พร้อมใช้งานแล้ว`); board EN-only strings (D12); `Notification Center` leftovers `02_FEED L662`/`13_SETTINGS L539` (ตาม FSP-022)
- **FSP-027 (QA checklist)** — QA-BOARD-001–005C rewrite ตาม AC-BOARD-001–018 (เดิมอ้าง 7-section/infinite-scroll/guest-share/locked-report entry)
- **FSP-030 (consistency sweep)** — board report toast copy `Report submitted. Thank you for notifying us.` (dead-path) vs social `Report submitted · thanks for letting us know` vs contract §13; `bdFilterCat` persist quirk (D14); session-flag reset `BOARD` (D8 — รวมกับ 11 D7)
