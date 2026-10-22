# 12 Board Module

อ้างอิงหลักจาก [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md) + baseline [00_GLOBAL_RULES_MODULE.md](00_GLOBAL_RULES_MODULE.md) §7 (session model), §11 (guest gate = Member Sheet `Join TukDaeng` + guest capabilities), §13 (report impact) + [00_NAVIGATION_AND_CROSS_MODULE_FLOW.md](00_NAVIGATION_AND_CROSS_MODULE_FLOW.md) §6.3 (bottom nav / `Boards` tab), §6.6 (route map `board`/`boardsearch`/`boardall`/`boardart:{id}`), §6.7 (in-app back), §7 (entry matrix), §9 (gate routing), §10 (unavailable fallback), §12 (deep link contract — S-29), §13 (back + main nav after deep link) + [11_SOCIAL_MODULE.md](11_SOCIAL_MODULE.md) §11 (`shareSheetHTML` canonical — board share reuse) + [09_NOTIFICATION_MODULE.md](09_NOTIFICATION_MODULE.md) (Alerts feed canonical — board actions ไม่สร้าง alert) + [15_TRUST_SAFETY_MODULE.md](15_TRUST_SAFETY_MODULE.md) (report type `Board Content` contract — synced FSP-031, ดู §19) — prototype `Prototypes/fo-flow/index.html` เป็น source of truth เดียวของพฤติกรรม (FO-PRD-v1.9)

---

# 1. Document Information

| Field | Detail |
| --- | --- |
| Module Name | Board — editorial magazine (hero featured + Latest Articles + category filter + article search + article detail) |
| Version | 1.9 (FO-PRD-v1.9 spec-sync FSP-023) |
| Status | Functional PRD — synced to fo-flow prototype |
| Owner | Tuk Daeng Project |
| Document Type | Front Office Functional PRD |
| Source of Truth | `Prototypes/fo-flow/index.html` (พฤติกรรม) + Master Product Definition (business intent) |

> spec เดิม (v1.0) ตีความ Board เป็น 7-section master model (Feature Article / Trending Now / Journal Board / Watch Brands / Watch 101 / Watch Apparel / Watch Events) + infinite scroll + guest-share-allowed + "Notification Center" + "Global Login Required Dialog" — prototype คือ editorial magazine (hero carousel + Latest list + freeform category tags) ที่ทุก social action ถูก gate ด้วย Member Sheet; เอกสารฉบับนี้เขียนตามพฤติกรรมจริงและ flag ทุก deviation ใน §19

---

# 2. Objective

Board Module คือ editorial content surface บน bottom-nav tab `กระดานข่าว`/`Boards` — บทความนาฬิกาที่ Admin เผยแพร่ผ่าน Back Office ให้ผู้ใช้ทั่วไป (รวม guest) อ่านได้เสรี: Board home (hero carousel บทความ featured + รายการ Latest Articles + `View all`), all-articles list พร้อม category pills + burger Categories sheet, article search page (Popular Topics + live results + card grid) และ Article Detail (author meta + like/share)

โมดูลนี้ต้องคุม: anatomy ของทุก board surface, hero carousel + pill/drag interactions, category taxonomy จริงของ prototype, search behavior, article like/share ผ่าน `data-bd*` handlers (board-specific — **ไม่ใช่** social post state ของ 11_SOCIAL), guest gating ตาม `GUEST_GATE_SEL` และ dead-code boundary — โดยยึดพฤติกรรม prototype เป็นตัวตัดสินเมื่อ spec เดิมขัดกัน

Phase 1 บทความสร้างและจัดการโดย Admin ผ่าน Back Office เท่านั้น — user ทั่วไปไม่มี Create/Edit/Delete/Comment บนบทความ

---

# 3. Prototype Reference

Source of truth: `Prototypes/fo-flow/index.html` (read-only — ห้ามแก้) — line anchors คือ state ปัจจุบัน @ HEAD อาจ drift ให้ค้นด้วย function-name

- Routes (`subHTML` ~17729): `board` → `boardHomeHTML`, `boardsearch` → `boardSearchHTML`, `boardall` → `boardAllHTML`, `boardart:{id}` → `boardArticleHTML`; nav tab `data-navgo="board"` → `bdQ = ""` + `openSub(scr,"board",true)` swap-open (~21531 — reset search state เสมอ, canonical 00_NAV §6.3)
- Data: `BD_P`/`BD_FEAT_MAX=5`/`BD_BODY[3]` (~18066–18072 — shared body paragraphs ทุกบทความ), `BOARD` 15 บทความ mock (~18073–18089 — field `{id:"b{n}", cat, title, sub?, img, min, ago, date, likes, feat?}` + `.map` inject `author:"Tuk Daeng Editorial"`, `liked:false`, `saved:false`; `feat` 1–5 = hero), `bdGet`/`bdMeta` (`{min} min read · {ago}`)/`bdFeatured` (sort `feat`)/`bdLatest` (`!feat`)/`bdJournal` (**dead helper** — ไม่มี caller)/`bdFilteredJournal` (~18090–18098)
- Taxonomy: `BD_CATEGORIES` = `All / Market Watch / Rolex / Technical / Collector / Guides / Industry` + `bdFilterCat` global (~18096–97); `BD_POPULAR_TAGS` = `Rolex / Daytona / Perpetual Calendar / Titanium / Patina / Grand Seiko` (~18100)
- Carousel + pills: `bdCarouselScroll` (dots sync จาก scrollLeft), `bdGoSlide`, `bdStepSlide` (**dead helper** — ไม่มี caller/arrow), `bdCenterPill`, mouse-drag handlers บน document (`bdIsDragging`/`bdPillsDragging`, threshold 6px/5px, snap-back on mouseup), `bdScrollHandler` (no-op — header scroll ตาม content ตาม feed pattern) ~18102–18194
- Anatomy builders: `boardNavHTML` = `botNavHTML("board")`, `bdHeadHTML` (burger `data-bdmenu` + brand `TUK DAENG | Board` + search `data-bdsearch`), `bdCardHTML` (search-result card — img + cat + title + meta + `N likes`), `bdRowHTML` (list row — img + cat + title + meta, **ไม่มี likes**), `bdListHTML` (rows + end note `You're all caught up`; empty → `No articles in this category`) ~18196–18234
- Pages: `boardHomeHTML` (~18235 — `.bd-scroll` + head + `.bd-carousel-wrap` hero slides + `.bd-dots` + `บทความล่าสุด`/`Latest Articles` head + `data-bdall` `View all` + row list + bottom nav), `boardAllHTML` (~18272 — crumb `data-bdhome` home icon + `Latest Articles` + `.bd-pills` + `.bd-all-list` + bottom nav), `bdResultsHTML` (~18286 — empty query → Popular Topics chips; query → `N results for "q"` + card grid หรือ no-results state), `boardSearchHTML` (~18301 — `.bd-sbar` icon + `.bd-q` autofocus input + `data-bdclear` X + crumb + `.bd-res`), `boardSearchSync` (~18315 — re-render `.bd-res` เท่านั้น; ลบ clear-X เมื่อ query ว่าง), `boardArticleHTML` (~18321 — `.bd-dscroll`, invalid id → `chEmptyHTML("Article not found", "This article is no longer available.")`)
- Click chain: `boardClick` (~18368–18510 — ลำดับ `data-bddot` → `data-bdart` → `data-bdsearch` → `data-bdclear` → `data-bdtag` → `data-bdcat` → `data-bdhome` → `data-bdall` → `data-bdmenu` → `data-bdmenu-cat` → `data-bdmore`(**dead**) → `data-bdact`(**dead-path**) → `data-bdcancel-sheet` → `data-bdshare` → `data-bdsave`(**dead**) → `data-bdlike`); wired ใน stage click listener (~21521 — หลัง gate check)
- Search input: `.bd-q` `input` event → `bdQ = value` + `boardSearchSync` (~20224 — live filter ไม่มี submit/debounce)
- Guest gate: `GUEST_GATE_SEL` (~23362–23371) รวม `[data-bdlike]`, `[data-bdsave]`, `[data-bdshare]`, `[data-bdact='share']`, `[data-bdact='save']`, `[data-bdact='report']` → gate check บรรทัดแรกของ stage listener (~20395) → `obGate()` Member Sheet ก่อน `boardClick` ทำงาน
- Session: `applySessionData`/`clearUserData`/`restoreUserData`/`POST_FLAG_KEYS` (~23297–23351) — **ไม่แตะ `BOARD`** (article `liked`/`saved` ไม่ reset ข้าม session — deviation D8)
- i18n: `isTh` ternary ใน markup + `I18N_TH` dict (board block ~19695 — `Board`→`กระดานข่าว`, `Categories`→`หมวดหู่`, cat names, `You're all caught up`→`คุณดูครบทั้งหมดแล้ว`, `Article not found`→`ไม่พบบทความ`, `This article is no longer available.`→`บทความนี้ไม่มีให้บริการแล้ว`, `Author`/`Date`/`Close`/`Like`/`Share`) + `i18nTr` patterns (~19785 `{n} min read · {ago}` → `อ่าน {n} นาที · {th-ago}`, date `Oct 28, 2024` → `28 ต.ค. 2567` พ.ศ.) + `setLang` board re-render (~19903–19911 — `.bd-sec h3`/`.bd-viewall`/`.bd-hero-btn`/`.bd-q` placeholder)
- Shared deps: `shareSheetHTML` (canonical [11_SOCIAL_MODULE.md](11_SOCIAL_MODULE.md) §11), `openSheet` variants `pm`/`sh`, `scrToast` (1.8s), `chEmptyHTML` (~17902 — shared 07_CHAT), `sub-back`/`rpPush`/`rpBack`/`pushSub` (canonical 00_NAV §6.7), `esc`, `I.*` icon set

---

# 4. Master Alignment Summary

| Topic | Master Baseline | Board Module Rule (ตาม prototype) |
| --- | --- | --- |
| Board Type | Community Content / Article Area | ตรง — admin-authored articles เท่านั้น ไม่ใช่ user-generated discussion board |
| Content Sections | Feature Article, Trending Now, Journal Board, Watch Brands, Watch 101, Watch Apparel, Watch Events | **ขัด** — prototype เป็น magazine model: hero featured (≤5) + Latest Articles + freeform category tags ที่ไม่ map 7 sections (deviation D1 — master mapping เป็นงาน FSP-025) |
| Article Detail | รองรับ Article Detail | ตรง — `boardart:{id}` (§12) |
| Article Actions | Article Like, Article Share | ตรง — `data-bdlike` toggle + `data-bdshare` → shared share sheet (member-only; guest → Member Sheet ตาม S-03/00_GLOBAL §11) |
| Search / Filter | Search Article, Category Filter | ตรง แต่**แยก surface** — search page ครอบทุกบทความเสมอ ไม่ทำงานร่วมกับ category filter (D9) |
| Pagination | Infinite Scroll | **ขัด** — list นิ่ง + end note `You're all caught up`/`คุณดูครบทั้งหมดแล้ว` ไม่มี load-more (D2) |
| Content Management | บทความสร้างและจัดการโดย Admin ผ่าน Back Office | ตรง — FO ไม่มี create/edit/delete/comment entry |
| Guest share | spec เดิม: public share action ไม่ต้อง login | **ขัด spec เดิม** — `[data-bdshare]` อยู่ใน `GUEST_GATE_SEL` (S-03: share ต้อง login ทุก surface, 00_GLOBAL §11) — spec เดิมผิด (D3) |
| Guest like/report | login-required | ตรงเจตนา — surface คือ Member Sheet `Join TukDaeng` ไม่ใช่ "Global Login Required Dialog" |
| Notification | — | board actions ไม่สร้าง alert — Alerts feed canonical 09 (ไม่มี "Notification Center") |

---

# 5. Scope

## In Scope

- Bottom-nav tab `กระดานข่าว`/`Boards` → Board home (`board` route, swap-open)
- Board home anatomy — `bd-head` (burger Categories + brand + search icon), hero carousel featured, `Latest Articles` + `View all`, row list, end note
- All-articles list (`boardall`) — crumb, category pills, filtered list
- Categories sheet (`data-bdmenu` → `pm` bottom sheet)
- Article search page (`boardsearch`) — search bar, Popular Topics, live results card grid, empty state
- Article Detail (`boardart:{id}`) — floating nav pill (back + like/share), author meta, cover, body, tags
- Article like toggle (`data-bdlike`) + article share (`data-bdshare` → `shareSheetHTML` shared, canonical 11)
- Guest gating ตาม `GUEST_GATE_SEL` → Member Sheet `Join TukDaeng`
- i18n coverage (isTh ternary + `I18N_TH` dict + `i18nTr` patterns)
- Dead-code boundary (`data-bdmore`/`data-bdsave`/`data-bdact`/`bdJournal`/`bdStepSlide`/`.bd-dfoot-sub`/`data-bdclear`-in-practice — §19)

## Out of Scope For V1

- User Create/Edit/Delete Article (Back Office scope)
- Article Comment
- Infinite scroll / pagination (list นิ่ง — D2)
- Saved Article UI (`data-bdsave`/`a.saved` = dead artifact — D5)
- Report Article live entry (`data-bdmore` menu dead — contract-only §13/§19 D4)
- Article-specific share flow / native OS share / public deep link implementation (contract 00_NAV §12 — S-29)
- Trending/ranking algorithm
- Publish-state / deleted-state simulation (prototype render ทุกบทความเสมอ)
- BO article authoring detail (canonical 18_ADMIN_SCOPE_NOTE)
- Article content i18n (BOARD seed เป็น EN editorial content — translation contract อยู่ CMS/BO)

## Report Board Content Boundary

- Article Comment ไม่อยู่ใน FO V1
- `Report Article` เป็น **spec-only contract** ใน V1 — prototype ไม่มี live entry เลย (`data-bdmore` menu ไม่เคย render, `data-bdact='report'` เหลือแค่ dead-path toast) — flow ล็อกไว้ที่ §13 เป็น Trust & Safety `Report Board Content` handoff (canonical 15 — synced FSP-031)
- เมื่อ entry ถูก implement ต้อง map เข้า report pipeline กลาง ไม่สร้าง FO moderation tooling และ report ไม่ทำให้ article หายทันที

---

# 6. Route & Surface Mapping

| Route (`.page-sub` stack) | Surface | Entry | Bottom nav |
| --- | --- | --- | --- |
| `board` | Board home — head + hero carousel + Latest + rows | nav tab `data-navgo="board"` (swap-open, `bdQ` reset) | มี (`botNavHTML("board")`) |
| `boardall` | All Articles — crumb + category pills + full list | `data-bdall` (View all, reset filter→All) / `data-bdmenu-cat` (sheet → pre-filtered) | มี |
| `boardsearch` | Article search — sbar + crumb + results | `data-bdsearch` (head icon — reset `bdQ` + autofocus 320ms) | มี |
| `boardart:{id}` | Article Detail — floating pill nav + full article | `data-bdart` บน hero slide / `Read more` / row / card | ไม่มี (`.bd-dscroll` เต็มจอ) |

Entry notes:

- Article card/row/slide tap → `rpPush(scr, "boardart:{id}")` — push ทับ page เดิมใน sub stack (canonical 00_NAV §6.7); tap ถูก suppress เมื่อ `bdDidDrag`/`suppressPhotoClick` (drag ไม่ใช่ tap)
- `data-bdhome` บน crumb → `rpBack` (pop 1 ชั้น — กลับ surface ก่อนหน้า)
- Article Detail back = `.sub-back` ใน floating pill → generic pop ตาม 00_NAV §6.7
- Board surfaces ทั้งหมดอยู่ใน `.page-sub` layer เหนือ feed shell — swap-open ไม่มี slide animation ตอนเปิด tab (IG behavior), push ภายใน slide ขวา→ซ้าย
- Board search เป็น board-internal เท่านั้น — ไม่รวม global Search (`search` route = posts/assets/accounts, canonical 03)

---

# 7. User States

## Guest (session `guest`)

- เปิด tab `กระดานข่าว`/`Boards` + อ่านทุก surface ได้เสรี (Boards tab **ไม่อยู่**ใน gate — 00_GLOBAL §11 guest capabilities)
- ใช้ hero carousel, View all, category pills, Categories sheet, search page, open article ได้ครบ (read-only browsing)
- กด `[data-bdlike]` / `[data-bdshare]` (และ dead entries `[data-bdsave]`/`[data-bdact]`) → Member Sheet `Join TukDaeng` gate mode (scrim dismiss ได้ — 00_GLOBAL §11)
- หมายเหตุ quirk: article `liked` state ค้างข้าม session (D8) — guest อาจเห็นหัวใจ `.on` จาก session member ก่อนหน้าแต่กดไม่ได้

## Member

- ทุกอย่างของ Guest + like/unlike article (count ±1 sync ทันที) + share ผ่าน shared share sheet
- (contract) Report Article + Save Article เมื่อ entries ถูก implement — ปัจจุบัน prototype ไม่มี live entry

## New Member (session `new`)

- Member powers ทั้งหมด; `BOARD` flags เริ่มจาก seed (`liked:false`/`saved:false`) — แต่ session switch ไม่ reset (D8)

## Admin

- สร้าง/แก้/ลบ/เผยแพร่บทความผ่าน Back Office เท่านั้น — ไม่ใช้ FO Board Module (canonical 18_ADMIN_SCOPE_NOTE)

---

# 8. Data Model

## `BOARD` article record (mock — production = CMS/API)

| Field | Type | ใช้ที่ |
| --- | --- | --- |
| `id` | `b{n}` string | `boardart:{id}` route param, `bdGet` lookup |
| `cat` | string (EN) | hero tag, `.bd-cat` label, filter/search corpus, tag chip `#{cat}` |
| `title` | string (EN) | hero h2, card/row title, detail h1, search corpus |
| `sub` | string? | hero sub + detail callout (fallback `title`); search corpus |
| `img` | path | hero bg, card/row thumb, detail cover |
| `min` | int | meta `{n} min read` (i18n → `อ่าน {n} นาที`) |
| `ago` | string | meta `{ago}` (i18n `formatPostTime` → TH) |
| `date` | `Oct 28, 2024` | detail author row `Date` (i18n → พ.ศ.) |
| `likes` | int | card meta `N likes` + detail `data-bdlike-count` |
| `feat` | int 1–5? | hero slide order — absent = Latest list |
| `author` | `"Tuk Daeng Editorial"` (injected) | data only — detail แสดง hardcode `Tuk Daeng` + `td-editorial.png` avatar |
| `liked`/`saved` | bool (injected) | viewer flags — `liked` live (like pill), `saved` dead-path เท่านั้น |

## Taxonomy

- `BD_CATEGORIES` = pill/sheet options 7 ค่า (`All` + 6 editorial tags) — **ไม่ใช่** strict enum: บทความจริงมี `cat` กว้างกว่า (`Featured`, `Watch Trends`, `More Watch Brands`, `Watch Basics`, `Watch Guides`, `Feature More Rolex Collections`, `Rolex`, `Collector`, `Industry`, `Guides`, `Market Watch`, `Technical`)
- `BD_POPULAR_TAGS` = 6 chips บน search landing

## Module state (globals — ไม่ใช่ per-screen)

| Var | ความหมาย | Reset |
| --- | --- | --- |
| `bdQ` | search query string | reset `""` เมื่อเปิด board tab (`navgo`) หรือกด `data-bdsearch`; persist ตลอด session |
| `bdFilterCat` | active category (`"All"` default) | reset `All` เมื่อกด `data-bdall` เท่านั้น — เลือกผ่าน sheet (`data-bdmenu-cat`) จะ persist ไป `boardall`; **ไม่ reset** เมื่อเปิด board ใหม่ |
| `a.liked`/`a.saved` | per-article viewer flags | **ไม่ reset ข้าม session** — ไม่อยู่ใน `POST_FLAG_KEYS`/`clearUserData` (D8) |

## Filter/search semantics

- `bdFilteredJournal()` — `All` → `BOARD` ทั้ง 15 (รวม featured); อื่น → `(cat + " " + title).toLowerCase().includes(cat.toLowerCase())` — **substring match บน cat+title** ไม่ใช่ strict category equality (pill `Rolex` match ทั้ง `cat:"Rolex"`, `cat:"Feature More Rolex Collections"` และ title ที่มีคำว่า Rolex — D7)
- `bdResultsHTML()` — `(title + " " + cat + " " + sub).toLowerCase().includes(q)` — match กว้างกว่า filter (รวม `sub`)

---

# 9. Board Home (`board`)

Anatomy (บนลงล่างใน `.bd-scroll`):

1. `bd-head` — burger `data-bdmenu` (title `Categories`) + brand `TUK DAENG | Board` (i18n `| กระดานข่าว`) + search icon `data-bdsearch`
2. Hero carousel `.bd-carousel-wrap` — `.bd-carousel` scroll-snap x mandatory ของ `bdFeatured()` (≤ `BD_FEAT_MAX` = 5 slides, sort `feat`):
   - `.bd-slide` = bg image + `.bd-hero-tag` (`a.cat` — fallback `FEATURED`/`แนะนำ`) + h2 title + p sub (fallback title) + `Read more`/`อ่านต่อ` button — ทั้ง slide และปุ่มเป็น `data-bdart`
   - `.bd-dots` — `data-bddot` ต่อ slide, active = slide ปัจจุบัน (`bdCarouselScroll` sync จาก scrollLeft), tap dot → `bdGoSlide` smooth scroll
   - รองรับ native touch swipe + desktop mouse-drag (drag แล้ว snap กลับ slide ที่ใกล้สุด, threshold 6px, suppress tap หลัง drag); **ไม่มี** arrows/autoplay — `bdStepSlide` เป็น dead helper
3. Section head — `บทความล่าสุด`/`Latest Articles` + `View all`/`ดูทั้งหมด` (`data-bdall` → reset filter + push `boardall`)
4. `bdListHTML(bdLatest())` — row list เฉพาะ non-featured (10 บทความ) + end note `You're all caught up`/`คุณดูครบทั้งหมดแล้ว`
5. `boardNavHTML` — bottom nav active `board`

---

# 10. All Articles + Category Filter (`boardall`)

Anatomy:

1. `.bd-crumb` — home icon `data-bdhome` (aria `Board`) + chevron + `บทความล่าสุด`/`Latest Articles`
2. `.bd-pills` — `BD_CATEGORIES` pill row, horizontal scroll + mouse-drag (5px threshold — drag แล้ว tap ถูก suppress), `.bd-pill.active` = `bdFilterCat`
3. `.bd-all-list` — `bdListHTML(bdFilteredJournal())` rows + end note; empty → `No articles in this category` (**EN-only** — ไม่อยู่ใน `I18N_TH`, ดู §17)

Pill tap (`data-bdcat`): set `bdFilterCat` → toggle `.active` ทุก pill → re-render `.bd-all-list` → `bdCenterPill` scroll pill ที่เลือกเข้ากลาง (smooth)

## Categories Sheet (`data-bdmenu`)

- Burger บน `bd-head` (มีเฉพาะ board home) → `openSheet "pm"` — handle + title `Categories`/`หมวดหมู่` + `.pm-rows` ของ `BD_CATEGORIES` ทั้ง 7 + `Close`/`ปิด` row (`data-bdcancel-sheet`)
- เลือก `data-bdmenu-cat` → set `bdFilterCat` + ปิด sheet + `rpPush boardall` (active pill centered หลัง 100ms)

---

# 11. Article Search (`boardsearch`)

Anatomy:

1. `.bd-sbar` — search icon + `.bd-q` input (autofocus ~320ms, placeholder `Search articles, brands, or topics...`/`ค้นหาบทความ แบรนด์ หรือประเด็นที่สนใจ...`) + `data-bdclear` X **เฉพาะตอน render ด้วย `bdQ` ไม่ว่าง** — ทุก entry reset `bdQ=""` และ `boardSearchSync` ไม่ re-add ปุ่ม → **clear-X ไม่เคยโผล่ในการใช้งานจริง** (dead-in-practice, D6)
2. `.bd-crumb` — home `data-bdhome` + `ค้นหา`/`Search`
3. `.bd-res` — content ตาม query:
   - query ว่าง → `.bd-sugg` `หัวข้อยอดนิยม`/`Popular Topics` + `BD_POPULAR_TAGS` chips (`data-bdtag` → set query + focus + sync)
   - query ไม่ว่าง → live filter ทุก `input` event (ไม่มี debounce/submit) match `title+cat+sub` → heading `{n} results for "{q}"`/`{n} ผลลัพธ์ สำหรับ "{q}"` + `bdCardHTML` grid (card = img + cat + title + meta + `N likes`); 0 ผล → icon + `No results found for "{q}"`/`ไม่พบบทความสำหรับ "{q}"` + `Try searching with different keywords like Rolex, Daytona, or Titanium`/`ลองค้นหาด้วยคำอื่น เช่น Rolex, Daytona หรือ Titanium`

- ไม่มี recent searches / suggestions dropdown / non-article results — scope articles เท่านั้น
- Result card tap → `data-bdart` → `boardart:{id}`

---

# 12. Article Detail (`boardart:{id}`)

Lookup `bdGet(id)` — id ไม่เจอ → `chEmptyHTML("Article not found", "This article is no longer available.")` (i18n dict → `ไม่พบบทความ` + `บทความนี้ไม่มีให้บริการแล้ว`; **ไม่แยก** unpublished/deleted/invalid — contract matrix อยู่ §13)

Anatomy (`.bd-dscroll` — ไม่มี bottom nav):

1. `.bd-dnav` floating pill — `.sub-back` back + `.bd-pill-group` like `data-bdlike` (heart, `.on` เมื่อ liked) + share `data-bdshare`
2. `.bd-dcat` cat label → h1 title
3. `.bd-author-row` — `td-editorial.png` avatar + meta cols `Author`=`Tuk Daeng` (hardcode — ไม่ใช่ `a.author` `Tuk Daeng Editorial`) + `Date`=`a.date` + `.bd-author-likes` heart + `data-bdlike-count` count
4. `.bd-cover` รูปบทความ → `.bd-callout` (sub หรือ title) → `BD_BODY` × 3 paragraphs (shared mock body ทุกบทความ)
5. `.bd-tags` — chips ตายตัว `#Watches` `#{cat}` (strip spaces) `#TukDaeng` `#Horology` — **non-interactive** ไม่ใช่ link

## Article Like (`data-bdlike`)

- Toggle `a.liked` + `a.likes ±1` — sync ทุก `[data-bdlike]` ใน screen (class `.on` + ลูก `span` count) + ทุก `[data-bdlike-count]` + `.bd-dfoot-sub` (**dead query** — ไม่มี element นี้ใน markup, D10)
- 1 user = 1 like ต่อบทความ (flag-based toggle — ไม่มี multi-like)
- ไม่มี liked-by strip, likes sheet, หรือ unlike confirm — article like ไม่ใช่ post like (boundary 11 §5)
- Guest → Member Sheet (§14); like state persist ข้าม session switch (D8)

## Article Share (`data-bdshare`)

- เปิด `shareSheetHTML()` (`openSheet "sh"`) — **sheet เดียวกับ post share** ทุกประการ (friends grid `FRIENDS` 12 + app row Messenger/Direct/LINE/Facebook/`Copy link` → toasts `Sent to {name}`/`Shared to {app}`/`Link copied`) — internals canonical [11_SOCIAL_MODULE.md](11_SOCIAL_MODULE.md) §11
- **ไม่มี** article-specific share text, public deep link generation, หรือ share validation ใน prototype — deep-link contract อยู่ §13
- Guest → Member Sheet (S-03 — spec เดิมอนุญาต guest share ผิด, D3)

---

# 13. Contract Rules (spec-only — prototype ไม่ครอบ)

กฎเหล่านี้เป็น production contract — prototype ไม่มี implementation ให้เทียบ (00_NAV §12 S-29); เมื่อ spec เดิมขัดกับ prototype ให้ยึด prototype และ mark contract แยกชัดเจน

## Report Article (Trust & Safety `Report Board Content` — canonical 15, synced FSP-031)

- Entry point (contract): `Report article` บน Article Detail overflow/`...` menu — **prototype ไม่มี overflow เลย** (`data-bdmore` menu เต็มรูปแบบมี handler แต่ไม่มี element render — D4/D6)
- Reason sheet (locked copy): title `Report article` + prompt `Why are you reporting this article?` + reasons `Spam or misleading` / `Harassment or hate` / `Scam or fraud` / `Illegal or restricted item` / `Inappropriate content` / `Other` + `Additional details (optional)` + `Submit report` (disabled จนเลือก reason)
- Submit → Trust & Safety report type `Board Content` + target type `Article` → success `Report submitted` + `Our team will review it. This article will remain visible until moderation is complete.` + `Done`; duplicate `You already reported this article.`; API fail `Unable to submit report. Please try again.`
- Article ต้องคงแสดงหลัง report จน moderation เสร็จ; ห้ามแสดง `Hide article`/`Hide this asset from feed?` ใน success state
- Guest report entry → Member Sheet (00_GLOBAL §11 — report ทุกประเภท gated)
- Prototype ที่มีจริง: เฉพาะ dead-path toast `Report submitted. Thank you for notifying us.` บน `data-bdact='report'` — copy นี้ **ไม่ใช่** contract copy (ต่างจาก social `Report submitted · thanks for letting us know` ด้วย — i18n/copy sweep FSP-026)

## Article Deep Link & Availability (contract — 00_NAV §10/§12/§13)

เมื่อเปิด shared public Article deep link ระบบต้อง validate publish state + deletion state + availability ก่อน render:

| Case | Guest | Member | Admin (self-published) |
| --- | --- | --- | --- |
| Published | Article Detail (guest read-only) | Article Detail | Article Detail |
| Unpublished (stale link) | Unavailable `บทความนี้ไม่พร้อมใช้งานแล้ว` | เดียวกัน | Article Detail + admin preview note |
| Deleted | Unavailable `บทความนี้ไม่พร้อมใช้งานแล้ว` | เดียวกัน | เดียวกัน |
| Invalid ID | Not Found state | เดียวกัน | เดียวกัน |

- Deep link ไป unavailable article ต้องไม่ crash/แสดงเนื้อหาค้าง; login user ที่ state เปลี่ยนกลาง session ต้อง update ตาม matrix เมื่อ sync/refresh
- Back button บน detail จาก external deep link (ไม่มี in-app history) → fallback Feed — ห้ามปิด app/หน้าว่าง; main navigation ใช้ต่อได้ทั้ง Guest/Member; guest กด gated surface เจอ Member Sheet ตามปกติ
- TH copy note: contract ใช้ `บทความนี้ไม่พร้อมใช้งานแล้ว` (00_NAV §10) แต่ prototype dict ใช้ `บทความนี้ไม่มีให้บริการแล้ว` — copy drift ต้อง unify (D11, FSP-026)

---

# 14. Guest Gate (board subset ของ `GUEST_GATE_SEL`)

| Gated (→ Member Sheet `Join TukDaeng` — gate ทำงานก่อน `boardClick`) | Not gated (guest ใช้เสรี) |
| --- | --- |
| `[data-bdlike]` (article like) | nav tab `data-navgo="board"`, `data-bdart` (เปิดบทความ), `data-bdsearch`, `data-bdall`, `data-bdhome`, `data-bddot` |
| `[data-bdshare]` (article share — S-03) | `data-bdmenu`, `data-bdmenu-cat`, `data-bdcat`, `data-bdtag`, `data-bdclear`, `.bd-q` input, `data-bdcancel-sheet` |
| `[data-bdsave]`, `[data-bdact='share'/'save'/'report']` (dead entries — gate list ยังคุมไว้) | browsing/scroll/drag ทั้งหมด |

- Gate = Member Sheet `Join TukDaeng` bottom sheet (scrim dismiss, ไม่จำ choice) — **ไม่ใช่** "Global Login Required Dialog" (rename ตาม 00_GLOBAL §11)
- หลัง sign-in สำเร็จจาก gate, surface คงอยู่ — like/share ต้องกดใหม่ (ไม่มี pending-action resume ใน prototype)

---

# 15. User Flows

## Browse Board

```text
Tab กระดานข่าว/Boards
-> Board home (hero carousel + Latest Articles)
-> swipe/drag hero หรือแตะ dot
-> แตะ slide/Read more/row -> Article Detail
-> back (.sub-back) -> surface เดิม
```

## View All + Category Filter

```text
Board home
-> View all (data-bdall -> bdFilterCat="All")
-> boardall: pill tap = filter substring (cat+title), active pill centered
-> หรือ burger (data-bdmenu) -> Categories sheet -> เลือก -> push boardall pre-filtered
-> crumb home (data-bdhome) -> rpBack กลับ home
```

## Search Article

```text
Board home -> search icon (data-bdsearch -> bdQ="" + push boardsearch + autofocus)
-> query ว่าง: Popular Topics chips (data-bdtag = set query)
-> พิมพ์: live filter title+cat+sub -> "{n} results for {q}" + card grid
-> 0 ผล: No results found for "{q}" + suggestion
-> แตะ card -> Article Detail
```

## Article Like / Share (member)

```text
Article Detail
-> like pill -> toggle .on + count ±1 ทุกจุด
-> share pill -> shared share sheet -> friend/app/copy -> toast
```

---

# 16. i18n & Copy Rules

แหล่ง TH สามชั้น (I18N-001 — canonical translator ใน prototype, spec นี้คุมเฉพาะ coverage ของ board):

| Layer | Coverage ใน board |
| --- | --- |
| `isTh` ternary ใน markup | hero tag fallback, `Read more`, `Latest Articles`, `View all`, crumb labels, search placeholder, `Popular Topics`, results heading, no-results + suggestion |
| `I18N_TH` exact-match dict | `Board`→`กระดานข่าว`, `| Board`→`| กระดานข่าว`, `Categories`→`หมวดหมู่`, `All`→`ทั้งหมด`, `Featured`→`แนะนำ`, cat names ทั้งชุด, `You're all caught up`→`คุณดูครบทั้งหมดแล้ว`, `Author`→`ผู้เขียน`, `Date`→`วันที่`, `Close`→`ปิด`, `Like`→`ถูกใจ`, `Share`→`แชร์`, `Article not found`→`ไม่พบบทความ`, `This article is no longer available.`→`บทความนี้ไม่มีให้บริการแล้ว` |
| `i18nTr` patterns | `{n} min read · {ago}` → `อ่าน {n} นาที · {th-ago}`; `Oct 28, 2024` → `28 ต.ค. 2567` (พ.ศ.); `{ago}` → TH relative |
| `setLang` board re-render | `.bd-sec h3`, `.bd-viewall span`, `.bd-hero-btn span`, `.bd-q` placeholder (~19903–19911) |

**EN-only leftovers (deviation D12 — i18n sweep FSP-026):** `No articles in this category`, `{n} likes` บน card meta, tag chips, Categories-sheet row labels (`Save to Favorites`/`Remove from Saved`/`Share Article`/`Copy Link`/`Report Article`/`Cancel` — dead path), toasts `Saved to favorites`/`Removed from favorites`/`Link copied`/`Report submitted. Thank you for notifying us.`, BOARD article content (title/sub/body = EN editorial content)

---

# 17. Notifications

- Board actions ทั้งหมด (like, share, save, report) **ไม่สร้าง alert row** — `ALERTS` เป็น seed เท่านั้น (canonical [09_NOTIFICATION_MODULE.md](09_NOTIFICATION_MODULE.md) §14)
- ไม่มี "Notification Center" — notification surface เดียวของระบบคือ Alerts feed (`แจ้งเตือน`/`Alerts`)
- ไม่มี article-publish/admin notification type ใน V1 (future)

---

# 18. Empty / Error / Toasts

| Case | Copy (EN / TH) |
| --- | --- |
| Category list empty | `No articles in this category` — **EN-only** (D12) |
| Search no results | `No results found for "{q}"` / `ไม่พบบทความสำหรับ "{q}"` + `Try searching with different keywords like Rolex, Daytona, or Titanium` / `ลองค้นหาด้วยคำอื่น เช่น Rolex, Daytona หรือ Titanium` |
| Article invalid id | `Article not found`/`ไม่พบบทความ` + `This article is no longer available.`/`บทความนี้ไม่มีให้บริการแล้ว` (dict) — contract TH `บทความนี้ไม่พร้อมใช้งานแล้ว` (D11) |
| End of list | `You're all caught up`/`คุณดูครบทั้งหมดแล้ว` |
| Share toasts | `Sent to {name}` / `Shared to {app}` / `Link copied` — EN-only |
| Dead-path toasts (no live entry) | `Saved to favorites` / `Removed from favorites` / `Report submitted. Thank you for notifying us.` — EN-only |

- ไม่มี board-specific error/retry state ใน prototype (contract load-fail pattern = global `ลองใหม่` — ไม่มี trigger จริง)

---

# 19. Deviations & Prototype Quirks (spec เลือก prototype — documented, not spec)

| # | Topic | Prototype | Contract / note |
| --- | --- | --- | --- |
| D1 | 7 master sections → magazine model | hero featured ≤5 + Latest + freeform `BD_CATEGORIES`/`cat` tags — ไม่มี Trending Now/Journal Board/Watch Brands/Watch 101/Watch Apparel/Watch Events | master taxonomy mapping = FSP-025 sign-off (กระทบ master baseline); spec นี้เขียนตาม prototype |
| D2 | Infinite Scroll | ไม่มี — list นิ่ง 15 บทความ + `You're all caught up` | pattern เดียวกับ feed (FSP-002 B2); pagination = implementation concern/future |
| D3 | Guest share | `[data-bdshare]` gated → Member Sheet | spec เดิม "guest share ได้" ผิด — S-03 (00_GLOBAL §11): share ต้อง login ทุก surface |
| D4 | Report Article entry | ไม่มี live entry — `data-bdmore` menu ไม่เคย render | contract-only §13 (Trust & Safety `Board Content`/`Article`); sign-off: report article = spec-only จนกว่า entry ถูก implement |
| D5 | Save Article | `data-bdsave` handler + `a.saved` + toasts มี แต่ไม่มีปุ่ม render | dead — Saved Article = future; ถ้า implement ต้องไม่ชนกับ post Saved hub (canonical 11 §12) |
| D6 | `data-bdmore`/`data-bdact`/`data-bdclear` | menu+actions unreachable (no trigger element); clear-X ไม่เคย render เพราะ `bdQ` reset ทุก entry และ sync ไม่ re-add | dead/dead-in-practice — spec ไม่รองรับเส้นเหล่านี้ |
| D7 | Category filter = substring | pill match `(cat+title).includes(cat)` — `Rolex` จับ `Feature More Rolex Collections` + title-match ด้วย | ไม่ใช่ strict enum — documented quirk (strict-match = future decision) |
| D8 | Session flags | `clearUserData`/`restoreUserData` ไม่แตะ `BOARD` — `liked`/`saved` ค้างข้าม guest/new/member switch | deviation เดียวกับ 11 D7 — flag ให้ dev reset เพิ่ม |
| D9 | Search × filter ไม่ combine | search page ครอบทุก `BOARD` เสมอ ไม่สน `bdFilterCat` | spec เดิมบอก "ทำงานร่วมกันได้" — ผิดตาม prototype |
| D10 | Dead queries/helpers | `.bd-dfoot-sub` (like handler), `bdJournal()`, `bdStepSlide()` — ไม่มี element/caller | dead — ไม่ spec |
| D11 | Unavailable-state copy | prototype dict `บทความนี้ไม่มีให้บริการแล้ว` + EN title `Article not found`/`ไม่พบบทความ` | contract TH `บทความนี้ไม่พร้อมใช้งานแล้ว` (00_NAV §10) — unify ใน FSP-026 sweep |
| D12 | EN-only leftovers | ดู §16 — หลายสตริงไม่อยู่ใน dict/ternary | i18n sweep FSP-026 |
| D13 | Section-comment drift | code comment `hero + trending + Journal Board` (~18064) แต่ label จริง `Latest Articles` | comment drift เท่านั้น — spec ใช้ label จริง |
| D14 | `bdFilterCat` persist | reset เฉพาะ `data-bdall`; กลับเข้า board ใหม่ filter ค้าง (home ไม่ใช้ filter อยู่แล้ว — กระทบเฉพาะ `boardall` re-entry ผ่าน sheet) | documented quirk |
| D15 | Author display | `a.author`=`Tuk Daeng Editorial` แต่ UI hardcode `Tuk Daeng` + `td-editorial.png` | mock simplification — production ใช้ author field จริง |
| D16 | ~~15_TRUST_SAFETY ยังไม่ sync~~ **RESOLVED FSP-031** | 15_TRUST sync ระดับ prototype แล้ว (report stack/PM_REASONS/shared surfaces); board report contract §13 ยังเป็น spec-only ตาม S-04/D4 ต่อไป — flag ปิด | resolved — flag เดิม FSP-025/030 |

---

# 20. Analytics Events (contract — prototype ไม่มี tracking)

- `board_opened`, `board_view_all`, `board_category_selected`, `board_categories_sheet_opened`
- `board_search_opened`, `board_search_query`, `board_search_result_opened`, `board_popular_tag_tapped`
- `article_opened`, `article_liked`, `article_unliked`, `article_share_opened`, `article_shared` (channel), `article_link_copied`
- `article_report_submitted` (contract — เมื่อ entry implement), `board_guest_gated` (action)

---

# 21. Acceptance Criteria

## AC-BOARD-001: Board Tab Opens Home

Given user กด bottom-nav `กระดานข่าว`/`Boards`
When ระบบเปิด Board
Then ต้อง swap-open sub page `board` (ไม่มี slide animation ตอนเปิด tab) พร้อม `bdQ` reset เป็นค่าว่างเสมอ
And bottom nav ต้อง active `board`

## AC-BOARD-002: Board Home Anatomy

Given user อยู่ Board home
Then ต้องแสดง `bd-head` (burger Categories + brand `TUK DAENG | Board` + search icon), hero carousel ของ featured articles (≤5 เรียง `feat`), section `บทความล่าสุด`/`Latest Articles` + `View all`, row list ของ non-featured articles และ end note `You're all caught up`/`คุณดูครบทั้งหมดแล้ว`
And ต้องไม่แสดง 7 master sections (Feature Article/Trending Now/Journal Board/Watch Brands/Watch 101/Watch Apparel/Watch Events) เป็น UI sections

## AC-BOARD-003: Hero Carousel Interaction

Given Board home แสดง hero carousel
When user swipe/drag/dกด dot
Then slide ต้องเลื่อนแบบ scroll-snap, dot active ต้อง sync ตาม slide ปัจจุบัน และ tap หลัง drag ต้องถูก suppress
And เมื่อ tap slide หรือ `Read more` ต้อง push `boardart:{id}`

## AC-BOARD-004: View All List

Given user กด `View all`
Then ต้อง reset `bdFilterCat` เป็น `All` และ push `boardall` แสดง crumb (home icon + `Latest Articles`), category pills และ row list ของทุกบทความ (รวม featured) พร้อม end note

## AC-BOARD-005: Category Pill Filter

Given user อยู่ `boardall`
When user แตะ pill category
Then ต้อง set `bdFilterCat`, toggle `.active`, re-render list ด้วย substring match บน `cat+title` และ scroll pill เข้ากลาง
And เมื่อไม่มีผลต้องแสดง `No articles in this category`

## AC-BOARD-006: Categories Sheet

Given user อยู่ Board home
When user กด burger `data-bdmenu`
Then ต้องเปิด bottom sheet `Categories`/`หมวดหมู่` รายการ `BD_CATEGORIES` ทั้ง 7 + `Close`
And เมื่อเลือก category ต้องปิด sheet + push `boardall` ที่ pre-filtered ด้วย category นั้น (pill active + centered)

## AC-BOARD-007: Article Search Page

Given user กด search icon บน `bd-head`
Then ต้อง reset `bdQ` + push `boardsearch` + autofocus input
And query ว่างต้องแสดง `หัวข้อยอดนิยม`/`Popular Topics` chips (`BD_POPULAR_TAGS` 6) — tap chip = set query + sync
And พิมพ์ต้อง live-filter `title+cat+sub` ทุก input event แสดง `{n} results for "{q}"`/`{n} ผลลัพธ์ สำหรับ "{q}"` + card grid (img+cat+title+meta+`N likes`)

## AC-BOARD-008: Search Empty State

Given query ไม่ match บทความใด
Then ต้องแสดง `No results found for "{q}"`/`ไม่พบบทความสำหรับ "{q}"` + suggestion `Try searching with different keywords like Rolex, Daytona, or Titanium`/`ลองค้นหาด้วยคำอื่น เช่น Rolex, Daytona หรือ Titanium`

## AC-BOARD-009: Article Detail Anatomy

Given user เปิด `boardart:{id}` ที่ valid
Then ต้องแสดง floating pill (back + like + share), cat label, h1, author row (avatar + `Author`/`ผู้เขียน` `Tuk Daeng` + `Date`/`วันที่` + likes count), cover, callout, body paragraphs และ tag chips `#Watches`/`#{cat}`/`#TukDaeng`/`#Horology`
And ต้องไม่มี bottom nav, overflow `...` menu, comment UI, หรือ create/edit action

## AC-BOARD-010: Article Like Toggle (member)

Given Member เปิด Article Detail
When กด like pill
Then `a.liked` toggle + `a.likes ±1` + `.on` class และ `data-bdlike-count` ต้อง sync ทุกจุดทันที
And 1 user ต้อง like ได้มากสุด 1 ครั้งต่อบทความ (toggle)

## AC-BOARD-011: Article Share (member)

Given Member กด share pill
Then ต้องเปิด shared share sheet เดียวกับ post share (`shareSheetHTML` — friends grid + Messenger/Direct/LINE/Facebook/Copy link)
And เลือก app `Copy link` ต้อง toast `Link copied`
And share ต้องไม่สร้าง alert (canonical 09)

## AC-BOARD-012: Guest Gate On Board Actions

Given Guest (session `guest`)
When guest กด like หรือ share pill บน Article Detail
Then ต้องเปิด Member Sheet `Join TukDaeng` (gate mode — scrim dismiss ได้) และ action ต้องไม่ทำงาน
And guest ต้อง browse home/list/search/article + ใช้ carousel/pills/search ได้เสรีโดยไม่ gate

## AC-BOARD-013: Article Not Found

Given `boardart:{id}` ที่ id ไม่มีใน `BOARD`
Then ต้องแสดง `Article not found`/`ไม่พบบทความ` + `This article is no longer available.`/`บทความนี้ไม่มีให้บริการแล้ว` (i18n dict) — ไม่ crash ไม่แสดงเนื้อหาค้าง

## AC-BOARD-014: Back Navigation

Given user เปิด `boardall`/`boardsearch`/`boardart:{id}` จาก Board home
When กด crumb home (`data-bdhome`) หรือ `.sub-back`
Then ต้อง pop กลับ surface ก่อนหน้าตาม 00_NAV §6.7 — ไม่ปิด app ไม่หน้าว่าง
And (contract) Article Detail จาก external deep link ที่ไม่มี history → back fallback ไป Feed

## AC-BOARD-015: No User Content Actions

Given user ทุก role ใน FO
When ใช้งาน Board surfaces
Then ต้องไม่มี Create/Edit/Delete Article, Article Comment หรือ user-post entry ใด ๆ (contract — Admin จัดการผ่าน BO)

## AC-BOARD-016: Report Article Contract

(contract — ไม่มี live entry ใน prototype) เมื่อ Report Article ถูก implement:
Given Member เปิด overflow `...` บน Article Detail แล้วเลือก `Report article`
Then reason sheet ต้องมี title `Report article` + 6 reasons + `Additional details (optional)` + `Submit report` disabled จนเลือก reason
And submit ต้องส่ง Trust & Safety `Board Content` target `Article`, article คงแสดงจน moderation เสร็จ, success `Report submitted` + `Done`
And Guest กด entry → Member Sheet

## AC-BOARD-017: Article Deep Link Contract

(contract — 00_NAV §12/§13) Given shared Article deep link:
- published → Article Detail ตามสิทธิ์; unpublished/deleted → Unavailable `บทความนี้ไม่พร้อมใช้งานแล้ว`; invalid → Not Found; admin self-published unpublished → detail + preview note
- back จาก no-history deep link → Feed; main navigation ใช้ต่อได้; guest restricted action → Member Sheet

## AC-BOARD-018: Dead Artifacts Not Live

Given Article Detail + board surfaces ใน V1
Then ต้องไม่มี reachable entry ไปยัง `data-bdmore` menu, `data-bdsave`, `data-bdact`, `data-bdclear` flows — handler เหล่านี้เป็น prototype dead code ไม่ใช่ spec contract (ยกเว้น `data-bdact=report` contract §13)

---

# 22. Related Modules

- [00_GLOBAL_RULES_MODULE.md](00_GLOBAL_RULES_MODULE.md) — session model §7, Member Sheet gate §11, report impact §13
- [00_NAVIGATION_AND_CROSS_MODULE_FLOW.md](00_NAVIGATION_AND_CROSS_MODULE_FLOW.md) — nav/tab §6, route map §6.6, back §6.7, entry matrix §7, gate §9, unavailable fallback §10, deep link §12–13
- [03_SEARCH_FILTER_MODULE.md](03_SEARCH_FILTER_MODULE.md) — global Search boundary (board search = internal เท่านั้น)
- [09_NOTIFICATION_MODULE.md](09_NOTIFICATION_MODULE.md) — Alerts feed canonical (board ไม่สร้าง alert)
- [11_SOCIAL_MODULE.md](11_SOCIAL_MODULE.md) — `shareSheetHTML` canonical §11; `data-bd*` เป็น board-specific (11 §5 boundary)
- [15_TRUST_SAFETY_MODULE.md](15_TRUST_SAFETY_MODULE.md) — `Report Board Content` contract (synced FSP-031 — §19 D16 resolved)
- [18_ADMIN_SCOPE_NOTE.md](18_ADMIN_SCOPE_NOTE.md) — BO article authoring/moderation boundary

---

# 23. Future Enhancement

- Master 7-section taxonomy mapping (FSP-025 sign-off — D1)
- Report Article live entry (overflow menu + reason sheet ตาม §13 contract — D4)
- Saved Article surface (`data-bdsave` revival — boundary กับ post Saved ต้องนิยามชัด — D5)
- Infinite scroll / pagination (D2)
- Native OS share + public article deep link generation + publish/deleted state simulation
- Trending/ranking algorithm
- Article comment
- Article content TH localization (CMS)
- Session-flag reset สำหรับ `BOARD` (D8)
- Search+category combined filtering (D9)
