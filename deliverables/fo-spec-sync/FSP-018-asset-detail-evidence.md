# FSP-018 — 05_ASSET_DETAIL Update Evidence (Post Detail page + comments + entries)

Date: 2026-10-21
Task: `5abf6480-6d7c-49df-8601-8ca5f6308995` — "FSP-018 อัปเดต 05_ASSET_DETAIL — detail page + comments + entries"
Scope: `FrontOffice/05_ASSET_DETAIL_MODULE.md` เท่านั้น (rewrite ทั้งไฟล์) — sync ตาม `Prototypes/fo-flow/index.html` (read-only) + baseline 00_GLOBAL (statuses §9, visibility §10, gate §11, lifecycle §12, private §14) / 00_NAV §6.x (layer model §6.1, back §6.7, entry matrix §7, unavailable §10) / 02_FEED (post model + own-post menu + Edit info canonical — FSP-015a/b lock) / 03_SEARCH_FILTER (post viewer 3 modes + lifecycle matrix — FSP-016 lock) / 04_ASSET_MANAGEMENT (drawer/`pfkind`/sold semantics — FSP-017 lock)
Context: FSP-016 session note + `FSP-016-search-flow-post-viewer-evidence.md` + `FSP-017-asset-mgmt-add-statuses-purchase-evidence.md` + `gap-FSP-002a-feed-search.md`

Prototype anchors verified: `.page-detail` mount ~19376 + CSS z-index/nav-hide ~1308–1333/~6331; `openPostDetail` ~14686–14705; `detail-back` ~21811–21814; `keepScroll` re-render ~19712–19714; `refreshPostViews` re-render ~13938–13963; `detailHTML` dl1 ~13355–13398; `detailHeadHTML` dh3 ~13334–13347; `saleTagHTML` ~13349–13353; name/ref fallbacks ~13358–13365; Descriptions `p.desc` ~13393–13394; `detailSpecsHTML`/`specGroupsHTML` ~13521–13554; `specs` flatten ~13092 + `specOf` ~14197 + `naSpec` ~16117; seed `specGroups` (Price & Data Source) ~12771–12796; `detailsHTML`/`triggerHTML` Price-group filter ~13302–13332; `hasDetails` ~14021/~14487; `pv-dt` specGroups gate ~14442; `pvDetailsSheetHTML` `dt` sheet ~14470–14474; `.view-full` handler ~21849–21857; chat `[data-chgo="post"]` ~18468/~18681 + handler ~19087–19134; `commentsFor`/`commentRowsHTML`/`commentsHTML` ~13556–13608; `COMMENT` seeds ~13114–13156; `.comment-btn` ~22015–22028 (`nt` toggle ~22024); `.c-like` ~22540–22546; share sheet ~13663–13683 + handlers ~22030–22067; `wlSheetHTML`/`WISHLISTS` ~13708–13733 + `.wl-btn`/`wl-pick`/`wl-new`/`syncWlBtns` ~22437–22482; `saveSheetHTML` ~13714–13733 + save handlers ~22490–22526; `.mf-btn` handler ~21899–21917; `modelKeyOf`/`syncModelFlags`/`refreshMfBtns` ~16199–16213; `waCriteriaFromPost` + `mapped` exclusions ~16124–16147; `waSheetHTML` ~16234–16279; `wa-mode`/`wa-go`/`wa-del` ~21920–21978; `likesSheetHTML` ~13644–13660; like sync ~22623–22640; hero/`.post-photo` carousel halves ~22553–22565; `pm-btn` → `pmPid` ~20469–20470 + `pmOwnMenuHTML`/`pmMenuHTML` canonical 02; `V.editFromDetail` ~16024–16064 + close restore ~20211–20216/~20665; `dlg-delpost-go` detail cleanup ~20733–20744; `findPost`/`pfKind`/`pfTabPosts` ~16577–16610; `PF_GFX_SOLD` ~16550–16559; `soldFromPost` ~15942–15958 + `markAssetSold` ~17139–17149; `GUEST_GATE_SEL`/`obGate` ~22997–23012; dead: `POST_DETAIL_CFG` ~13106–13112, `igDetailHTML`/`igBodyHTML`/`igDetailHeadHTML` ~13444–13519, `chatPopHTML`/`chat-fab`/`sendChat` ~13400–13442/~21816–21836, `dh2`/`dh4`/`dh5`, `ds` acc/cards/tabs/seg + `dStyle`, `pr` pr1–pr4, `tg2`

## 1. What changed (section map)

| Section | Change |
| --- | --- |
| Header/§1 Doc Info | rename module → **Post Detail (เดิม Asset Detail)** — spec เดิมตีความเป็น standalone asset-entity page (gallery+owner block+chat+report), prototype คือ post detail overlay layer |
| §2 Objective | rewrite — detail layer รวม hero/actions/tag/name/ref/Descriptions/spec groups + `mf-btn`/`wl-btn` entries; ไม่มี owner/contact block |
| §3 Prototype Reference | **ใหม่ทั้งก้อน** — anchor index ครอบ layer/anatomy/entries/comments/WA/wishlist/shared sheets/own-viewer/gate + dead/tooling list (`POST_DETAIL_CFG`, dl2 igDetail*, chatPop/chat-fab, dh2/dh4/dh5, ds variants, pr variants, tg2) |
| §4 Master Alignment | rewrite — destination model (detail = asset-detail equivalent), statuses/visibility/private/guest per 00_GLOBAL, layer model 00_NAV §6.1, shared comment sheet rule, `mf-btn` = WA entry ที่ 2, ไม่มีใน V1 list |
| §5 Scope | rewrite — In = layer semantics + 4 entries + anatomy + actions + states + sold/hide/show + edit/delete lifecycle + fallbacks + deviations; Out = post model/composer/menus (02), viewer mechanics (03), comment/like/share/save internals (02/11), WA internals (10), wishlist hub, chat room (07), report (15), profile reachability (06), portfolio pages (04/14), deep-link contract (00_NAV §10), BO moderation |
| §6 Screen Mapping | rewrite — 8 surfaces: detail dl1, detail-over-viewer, detail-over-sub, comments/WA/wishlist/share sheets, Member Sheet |
| §7 User States | rewrite — Guest (browse ฟรี, action gate list), Member/Viewer, Owner (layout เดิม — ต่าง menu/gate/eligibility), Blocked (eligibility-gated ไม่มีทางถึง) |
| §8 User Flow | **rewrite ทั้งก้อน** — Open Detail (4 entries A–D + ไม่มีจาก media tap/notification ตรง), Detail Actions, `mf-btn` WA flow (modelKey→edit draft / criteria→sheet / empty→toast), `wl-btn` flow, Edit-from-detail, Sold post flow |
| §9 Business Rules | **rewrite ทั้งก้อน** — Detail Layer, Entry, Anatomy (8 elements + absent list), Description (field แยกจาก caption), Price & Data Source (render บน detail / filter ใน expander / excluded จาก WA criteria), Like/Comment/Views Row, Comment Surface (shared sheet + one-level replies + read/like-only), `mf-btn` WA (modelKey/criteria/map/exclusions/empty toast), `wl-btn` (optimistic wishlist + picks), `pm-btn` menus, Photo Carousel (ไม่มี fullscreen), Own vs Viewer, Sold Post (reachability + tag-driven-by-price + `View sale record`), Hide/Show, Unavailable/Missing, **Deviations & Dead-Code Notes (17 รายการ)** |
| §10–12 Permission/Validation/Exception | rewrite — gate table ตาม `GUEST_GATE_SEL`; read surface ไม่มี validation ของตัวเอง; exception table (missing post/silent no-op/chat toast/no-specs minimal render/no-desc `-`/`#tag`→search/WA empty criteria) |
| §13 Empty State | rewrite — `No comments yet`/`ยังไม่มีความคิดเห็น` บรรทัดเดียว, minimal render ไม่ใช่ empty page |
| §14 Notification | rewrite — detail ไม่สร้าง notification; like/comment notif → viewer (00_NAV §8); WA/toast เฉพาะฝั่ง sheet |
| §15 Analytics | rewrite — contract `post_detail_*` event set |
| §16 ACs | **rewrite ทั้งชุด** — AC-DETAIL-001–036 sequential จัดกลุ่ม (Layer/Entries, Anatomy, Actions, WA, Wishlist, States, Sold/Lifecycle, Guard) — เดิม letter-suffix set (005A/007A–E/008A–F/010A–D/012A–D/017A/B/021A/B/022A/B/024A/B/025A/B/026A–H/028A/B/029A/B/030A/B) ลบทิ้ง — renumber; ไม่มี live cross-ref ดู §2 |
| §17 Related | +00_GLOBAL/00_NAV/02/03/04/06/07/09/10/11/14/15 links ตาม boundary ใหม่ |
| §18 Future | +comment write/reply/delete/report, fullscreen viewer, seller block + Follow, Ask/chat entry revive, save bookmark, comment notif deep-link, persistence, self-guard mf/wl, sold tag fix, full unavailable page, external deep link |

## 2. Cross-doc ref check (ก่อนปิดงาน)

| Check | Result |
| --- | --- |
| `AC-DETAIL` refs นอก 05 | `DOCUMENT_VERSION.md` (historical changelog AC-DETAIL-010A/B, 026A–026H) + `FSP-009` evidence (S-26 flag อ้าง AC-DETAIL-017A/B เดิม) — ไม่มี live ref; renumber ปลอดภัย ✓ |
| `05_ASSET_DETAIL`/`Post Detail` ใน synced baselines | 00_NAV §6.1/§8/§10 (asset-detail equivalent + destination + deleted deep link) ✓; 00_GLOBAL §11/§14 (unavailable contract + private data) ✓; 02_FEED §5 Out (specs/descriptions/mf-btn/wl-btn → 05) ✓; 03_SEARCH §5 Out (specs/mf-btn/wl-btn/ask → 05) ✓; 04 §5/§17 (Post Detail → 05) ✓ — ทุก boundary ตรง spec ใหม่ |
| Stale terms ใน synced baselines (00/01/02/03/04/05/13) | grep `Global Login Required Dialog`/`Make Offer`/`View all comments`/`Full Screen Image`/`Contact Seller`/`Hide comment`/`Owner Information` = **0 stale** — hits ที่เหลือมีแต่ (a) rename notes จงใจใน 00_GLOBAL §11/00_NAV, (b) "ไม่มีใน V1" statements ใน 02/00_NAV/05 เอง ✓ |
| Stale terms ใน not-yet-synced modules | 06_PROFILE (14 hits), 07_CHAT (9), 09_NOTIFICATION (18 — destination wording เดิม), 10_WATCH_ALERT (9 — spec_options/`ระบุเอง` model เดิม), 11_SOCIAL (42), 14_PORTFOLIO (5), 15_TRUST_SAFETY (7), 16_INTEGRATIONS (4), 17_NFR (1) — flag FSP-019/020/021/022/024 ไม่แก้นอก scope ✓ |
| Stale terms ใน legacy/central docs | Master (27), PRD/FO_PRD/Use_Cases, README_MODULE_INDEX (module name เดิม), DEV_IMPLEMENTATION/DEV_CHAT checklists, QA_TEST_SCENARIO (48 hits + `DETAIL-0`/`QA-DETAIL` ids), ERROR_STATE catalog, DOCUMENT_VERSION — flag FSP-025/026/027 ✓ |
| `View full detail` wording | ตรง prototype + 00_NAV §7/§8 + 02/03 boundary notes ทุกจุด ✓ |
| Status/tag names | `Sale`/`Show`/`Hide`/`Sold` canonical; tag `ลงขาย`/`FOR SALE` ขับด้วย `price` documented เป็น deviation (sold ยังขึ้น FOR SALE) ✓ |
| Watch Alert contract | `source:"detail"`, `matchMode:"all"`, modelKey bell, dedupe `You already saved this alert`, `No details on this post to watch` — ตรง 03_SEARCH §9 + handler ~21899–21978 ✓ |

## 3. Verification

| Check | Result |
| --- | --- |
| ไฟล์ที่แก้ | `FrontOffice/05_ASSET_DETAIL_MODULE.md` เท่านั้น (+ evidence file นี้) — rewrite เต็ม ~578 บรรทัด ✓ |
| `git status --porcelain -- Prototypes/` | `M Prototypes/fo-flow/index.html` = diff เดิมของ task `716b8972` (password ≥8 — verified ซ้ำตอนนี้: 3 hunks รหัสผ่าน 6→8 + signup pw validation) — **งานนี้ไม่แตะ Prototypes/** ✓ |
| Copies ที่เขียนลง spec | ตรง prototype verbatim: `รายละเอียด`/`Detail`, `ลงขาย`/`FOR SALE`, `โชว์`/`SHOWCASE`, `Descriptions`/`คำอธิบาย`, `Ref. -`, `Tap for details`, `View full detail`, `ความคิดเห็น`/`Comments`, `เพิ่มความคิดเห็น...`/`Add a comment...`, `No comments yet`/`ยังไม่มีความคิดเห็น`, `ตอบกลับ`/`Reply`, `Not in this prototype yet`, `Follow this model`/`Following this model`, `No details on this post to watch`, `Watch alert on`/`updated`/`removed`, `You already saved this alert`, `Added to {col}`/`Added to Wish List`/`Removed from your wish list`/`Removed from {col}`, `New collection`, `Sent to {name}`/`Shared to {app}`/`Link copied`, `Listing detail isn't in this prototype yet`, `Join TukDaeng` ✓ |
| Entry contract | 4 entries เท่านั้น (feed expander / `pv-dt`→`dt` sheet / viewer pfp-svf card / chat item) + `hasDetails` gating + `pv-dt` specGroups gate + ไม่มีจาก media tap/notif — ตรง ~21849–21857 + ~14442 + ~18468/18681 ✓ |
| Layer semantics | detail ทับ viewer (`pv-open` คง), `detail-back` remove เฉพาะ class, `detailPid` fallback, scroll reset + head sticky, re-render บน `refreshPostViews`/lang-switch — ตรง ~14686–14705/~21811–21814/~13963/~19712 ✓ |
| Anatomy | 8 elements ตรง `detailHTML` dl1 + absent list (ไม่มี seller/follow/ask/save/liked-by/caption/inline comments/timestamp) — ตรง ~13355–13398 ✓ |
| Comments | shared sheet + one-level replies + avatar→profile + read/like-only + empty copy + mock generation — ตรง ~13556–13608/~22015–22028/~22540–22546 ✓ |
| `mf-btn` | modelKey + edit-draft path + criteria map + price/data-source exclusions + empty→toast + bell sync — ตรง ~16199–16213/~16124–16147/~21899–21917 ✓ |
| `wl-btn` | optimistic wishlist ก่อนเปิด sheet + pick semantics + `New collection` — ตรง ~22437–22482/~13708–13733 ✓ |
| Sold post | reachability ผ่าน own profile tabs (pfp viewer) + tag ตาม price (markAssetSold=FOR SALE, gfx=SHOWCASE) + `View sale record`→`sold:{id}` + no Edit/mark-sold — ตรง `pfTabPosts`/~13920–13935/~15942–15958/~17139–17149 ✓ |
| Boundary preservation | post model/menus/composer→02, viewer→03, sheets→02/11, WA internals→10, chat→07, profile→06, portfolio→04/14, report→15 — "canonical อยู่ X" ทุกจุด ไม่มี spec ซ้ำ ✓ |
| ACs ใหม่ | AC-DETAIL-001–036 ทุกข้ออ้างพฤติกรรมจริง (`detail-open`/`pv-open`/`hasDetails`/`detail-back`/`noComments`/`hideCounts`/`p.desc`/`specGroups`/`c-like`/`modelKey`/`waCriteriaFromPost`/`wishlisted`/`wlCol`/`pmPid`/`V.editFromDetail`/`pfkind`/`sold:`/`GUEST_GATE_SEL`) ✓ |

## 4. Deviations flagged (spec เลือก prototype — documented, not spec)

| Deviation | Note |
| --- | --- |
| ไม่มี Owner Information block + Follow บน detail | spec เดิมบังคับ owner row + follow — dl1 ไม่มี seller element เลย |
| ไม่มี Ask Seller / Chat entry บน detail | `chat-fab`/`chatPop` dead path (ต้อง `ask:"bubble"`+dl2); chat เข้าผ่าน feed/profile เท่านั้น |
| ไม่มี Save/bookmark บน detail | action row ใช้ `mf-btn`+`wl-btn`; wishlist = save-family ของ detail |
| ไม่มี Full Screen Image Viewer | tap hero = carousel halves เท่านั้น — contract §18 (ขัด spec เดิม AC-DETAIL-007 + AC-FEED-016 เดิม) |
| ไม่มี inline comments + comment actions | ไม่มี `View all comments`/per-comment `...`/delete/report; sheet read+like-only; input/Reply/emoji dead → `Not in this prototype yet` |
| `FOR SALE`/`SHOWCASE` tag ขับด้วย `price` ไม่ใช่ `pfkind` | sold post (markAssetSold) ยัง FOR SALE; gfx sold (price:null) ขึ้น SHOWCASE — flag FSP-030 |
| `Price & Data Source` บน detail แต่ถูก filter ใน feed expander | `detailSpecsHTML` ไม่ filter / `detailsHTML` filter — รับตามจริง |
| `mf-btn`/`wl-btn` ใช้บนโพสต์ตัวเองได้ | ไม่มี self-guard — contract note §18 |
| Root comment `Reply` ไม่ localize | hardcode EN บน root; reply rows มี `ตอบกลับ`/`Reply` — language sweep FSP-026 |
| Comment empty copy เดี่ยว | `No comments yet`/`ยังไม่มีความคิดเห็น` — ไม่มี `Be the first to comment.`/`Write a comment...` ของ spec เดิม |
| `commentsFor` mock thread | count แต่ไม่มี seed → generate จาก `LIKER_POOL`/`PF_CMT_TEXTS` — contract |
| `POST_DETAIL_CFG` + variant paths dead | dl2 igDetail (post-head/caption/ask/save/liked-by), dh2/dh4/dh5, ds acc/cards/tabs/seg, pr1–pr4, tg2 — dev artifact ตาม 00_NAV §11 |
| Detail ไม่ persist/deep-link | ไม่มี route — external deep link contract 00_NAV §10 |
| EN-hardcoded strings | `Follow this model`/`No details on this post to watch`/wishlist+share toasts/`Listing detail isn't in this prototype yet` — FSP-026 |
| `pfKind()` fallback | โพสต์ไม่มี `pfkind` infer จาก price — canonical 04 (documented ที่นั่นแล้ว) |
| Session-only state | `liked`/`wishlisted`/`wlCol`/`modelFollowing` memory — persistence contract |

## 5. Flags ส่งต่อ (ไม่แก้นอก scope)

- **FSP-019** — `06_PROFILE_MODULE.md`: own profile tabs (`pfTabPosts`/`pfKind`) เป็น reachability ของ hide/sold post detail + `all` leak defect (00_GLOBAL §10 note) — 05 ระบุแค่ entry semantics
- **FSP-020** — `07_CHAT_MODULE.md`: `[data-chgo="post"]` entry + `Listing detail isn't in this prototype yet` fallback + item card anatomy — 05 ระบุแค่ handoff
- **FSP-021** — `09_NOTIFICATION`/`10_WATCH_ALERT`: like/comment notif → viewer (00_NAV §8); `waCriteriaFromPost`/`waSheetHTML`/`modelKey`/`alertMatch`/`salePosts()` internals — **10 ยังอ้าง `spec_options`/`ระบุเอง` option criteria เดิม → ต้องเขียนตาม free-text reality** (flag เดิมจาก FSP-017 ยืนยันยังจริง)
- **FSP-022** — `11_SOCIAL_MODULE.md`: comments/likes/share/save sheets canonical + `Liked by` list + S-26 like-count privacy (05 เดิม AC-DETAIL-017A/B claims public like count — ถูกตัดไปแล้ว, 11 ยังมี claims อยู่)
- **FSP-024** — `14_PORTFOLIO_MODULE.md`: `pfasset:`/`sold:` pages + market data contract (`PFO_SRC`) — 05 ระบุแค่ render spec strings
- **FSP-025/026/027** — Master §Asset Detail/PRD/Use_Cases/README index (module name "Asset Detail" เดิม)/DEV+QA checklists (`DETAIL-0xx`/`QA-DETAIL` ids เดิม)/ERROR_STATE catalog — sync ตาม 05 ใหม่ + EN-hardcode copies เข้า language sweep (เพิ่ม `No details on this post to watch`, `Follow this model`, `Listing detail isn't in this prototype yet`, wishlist/share toasts)
- **FSP-030** — sold post ยังขึ้น FOR SALE tag (tag อ่านจาก price ไม่ใช่ pfkind) + `pv-add` เปิด comment sheet แม้ `noComments` (flag เดิมจาก FSP-016 — detail path `comment-btn` ซ่อนถูกแล้ว) + self-guard mf/wl บน own post — consistency sweep
- งานทั้งหมดยัง uncommitted รวม FSP-006–018 — รอพี่สั่ง commit แยก
