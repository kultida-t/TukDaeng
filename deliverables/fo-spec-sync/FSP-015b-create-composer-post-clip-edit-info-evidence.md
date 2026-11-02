# FSP-015b — 02_FEED Update Evidence (create post/clip composer + edit info)

Date: 2026-10-21
Task: `49d6d68f` — "FSP-015b อัปเดต 02_FEED — create post/clip composer + edit info"
Scope: `FrontOffice/02_FEED_MODULE.md` เท่านั้น — sync ตาม `Prototypes/fo-flow/index.html` (read-only) + baseline 00_GLOBAL (session §7, lifecycle §12) / 00_NAV §6.x (sub page `create`) / boundary ที่ FSP-015a จดไว้ใน §5
Gap source: `gap-FSP-002a-feed-search.md` (create/composer section) + `gap-FSP-002b-create-saved-wa.md` + `FSP-005-consolidated-gap-signoff.md`
Boundary: ลบ "## Boundary — FSP-015b Scope" block ออกจาก §5 แล้ว (ย้ายเข้า In Scope) — scope ที่เหลือของ composer (Sale Record form / drawer internals / WA matching internals) ยังอ้าง 14_PORTFOLIO / 04_ASSET_MANAGEMENT / 10_WATCH_ALERT ตามเดิม

Prototype anchors verified: `CP_ME`/`CP_ROLL`/`CP_CLIPS`/`CP_MEDIA`/`CF_SPECS`/`CF_MAX_MEDIA`/`CF_TAGS`/`CF_LOCS`/`CF_LOC_KM` ~15529–15585; `cpState`/`cfMedia`/`cfActiveClip`/`cfPlayClip` + clip playback helpers ~15586–15642; `feedClipTick` ~15643–15671; `cfPickerHTML` ~15672–15785 (hero/Recents grid/Select multi/`×`/`Next` + edit `+` tile); `cfStep2HTML` ~15786–15884 (media strip/caption/chips/option rows/visibility pick/Share/Add Asset); `cfFieldsFromMeta` ~15885–15912; `cfToPortfolio` ~15915–15926; `assetFromPost`/`soldFromPost` ~15929–15958; `insertNewPost` ~15959–15990; `metaFromPost` ~15995–16006; `openPostEdit`/`closePostEdit`/`applyPostEdit` ~16007–16108; `cfPaneHTML` + `pane-sw` ~16109+ (loc/price/spec/cost/cond/more panes); `PF_MINE` ~16574–16577; `pfKind`/`PFO_STATUS` ~16380/~16604; `refreshPostViews` ~13938–13964; composer handlers (discard/next/back/cells/remove/zoom/panes/toggles/share) ~19987–20463; `pm-own-edit` → `openPostEdit` ~20499–20500; `dlg-discard-go` ~20660–20674; feed header `+` entry ~19358; profile `+`/empty-CTA asset entries ~16826/~16852; `GUEST_GATE_SEL` (`[data-flow]` ∈ gate) + `obGate` ~22997–23012

## 1. What changed (section map)

| Section | Change |
| --- | --- |
| §3 Prototype Reference | +composer anchors (constants/state, `cfPickerHTML`/`cfStep2HTML`/`cfPaneHTML`, publish/edit helpers, handlers, `PF_MINE`/`pfKind`, dead affordances: camera tile/Recents dropdown/expand icon → `Not in this prototype yet`) |
| §4 Master Alignment | +Create entry / Publish (`insertNewPost`) / Edit info rows |
| §5 Scope | **ย้าย composer เข้า In Scope** — entries (post vs asset mode), 2-step flow, option panes, fields, `Also save to My Assets`, publish + asset-mode outcomes, edit info mode; **ลบ Boundary block**; Out เพิ่ม Sale Record/drawer internals อ้าง 14_PORTFOLIO/04 |
| §6 Screen Mapping | +composer step 1/2, option panes, media zoom `.ig-zoom`, discard dialog, Edit info mode rows |
| §7 User States | Guest gate list +`+` ทุกจุด (`[data-flow]`); Member +2 composer modes; Owner +`Edit` → Edit info composer + `following:true` self-post note |
| §8 User Flow | +4 flows — Create Post Flow (post mode), Create Asset Flow (asset mode), Edit Info Flow, Discard Draft Flow |
| §9 Business Rules | Post Model `hideCounts` → seeded-only (composer ไม่มี setter); +**Composer Entry & Modes Rule** (`data-flow="create"` / `data-mode="asset"`), **Media Picker Rule** (single→multi ≤10, dead controls), **Composer Fields Rule** (caption/chips/loc/price/spec/cond/cost/more panes), **Publish Rule** (`insertNewPost` fields/toasts/WA-delayed toast/mock estimate band), **Asset Mode Rule** (`cfToPortfolio` + visibility outcomes → `PF_MINE` drawer-only vs feed post), **Edit Info Rule** (prefill/drawer toggle/add-media/Done→`applyPostEdit`/surface restore), **Clip Media Rule**, **Audience Rule** (stored not enforced); Lifecycle table +5 composer transitions |
| §10 Permission | Guest +`+` gated; Member +create post/asset; Owner +Edit info (fields + `pfkind` sale/show/hide/post — `sold` เปลี่ยนไม่ได้) |
| §11 Validation | +media ≥1 required เดียว (Next/Share/Add Asset disabled), ≤10 max, edit ลบชิ้นสุดท้ายไม่ได้, ไม่มี required อื่น, price/purchase digits+comma, purchase date 1900–วันนี้ (invalid/future inline + block Done), audience 2 ค่า, drawer OFF → `pfkind:"post"`, sold ไม่ให้แก้ status |
| §12 Exception | +guest `+` gate, Next/Share disabled, last-media guard, >10 guard, purchase-date errors, discard dialog, WA match toast, dead affordances toast, location no-match |
| §13 Empty State | +picker ไม่ได้เลือก (`เลือกรูปภาพ`/`Select photos` hero tile), location pane no-match |
| §14 Notification | +WA match toast (simulation — ไม่ใช่ notification item) |
| §15 Analytics | +`composer_opened`/`composer_media_selected`/`composer_multi_select_toggled`/`composer_step2_opened`/`composer_pane_opened`/`composer_hashtag_inserted`/`composer_discard_shown`/`composer_discarded`/`post_published`/`clip_published`/`asset_created`/`post_edit_saved`/`post_edit_discarded`; `post_edit_opened` wording → Edit info composer |
| §16 ACs | +AC-FEED-039–052 (guest gate, entry modes, picker, media-required, step 2 fields, panes, publish, asset mode, edit prefill/done/drawer-toggle, discard, clip, audience stored); AC-FEED-029 ref → AC-FEED-047–049 |
| §17 Related | +04_ASSET_MANAGEMENT link (asset mode → drawer record) |
| §18 Future | +draft persistence, real camera/upload + media editing, `Followers only` enforcement, `hideCounts` composer control |

## 2. Cross-doc ref check (ก่อนปิดงาน)

| Check | Result |
| --- | --- |
| `AC-FEED-` refs นอก 02 | `DOCUMENT_VERSION.md` เท่านั้น (historical changelog v1.4 `AC-FEED-017J–017L`) — AC-FEED-039–052 ใหม่ไม่ชน ref เก่า ✓ |
| `FSP-015b`/`Boundary`/`post editor` ใน 02 | 0 เหลือ — boundary block ลบแล้ว, "post editor" → "Edit info composer" ครบ 3 จุด (§4/§8 menu table/§15) ✓ |
| 00_NAV §6.x | `+` → Create composer (post/asset), guest gated, own-profile `+` → asset mode — ตรง spec ใหม่ทุกจุด (lines 147/210/227/254/392/413) ✓ |
| 00_GLOBAL §7/§11 | Login-Required list มี `Create (`+` post/asset composer)` — gate ตรง; session §7 reset ไม่แตะ composer (draft ไม่ persist — spec บันทึก) ✓ |
| `composer` refs ไฟล์อื่น | 13 §363/`DEV_IMPLEMENTATION_CHECKLIST` §327/`QA_TEST_SCENARIO_CHECKLIST` §1252 = mail composer (unrelated) ✓ |
| 11_SOCIAL §"Feed Social Rules"/AC-SOCIAL-005 | **ขัด prototype** — "comment จาก Feed ต้องเปิด Asset Detail ไม่ใช่ composer บน Feed" + "Owner like asset ตัวเองได้" (prototype: shared comment sheet เปิดจาก feed + own-like toast `This is your own listing`) — **flag ให้ FSP-022** ไม่แก้นอก scope ✓ |
| `hideCounts` | spec เดิมอ้าง "setter อยู่ composer (FSP-015b)" — verify จริง: More options pane มีแค่ commenting + audience → update เป็น "ไม่มี setter ใน V1" + deviation + Future item ✓ |

## 3. Verification

| Check | Result |
| --- | --- |
| ไฟล์ที่แก้ | `FrontOffice/02_FEED_MODULE.md` เท่านั้น (+ evidence file นี้) — diff +~180 บรรทัดบน rewrite ของ FSP-015a ✓ |
| `git diff -- Prototypes/` | 3 hunks เดิมของ task `716b8972` (password ≥8: chg-pwd desc, length check, signup validation) — **งานนี้ไม่แตะ Prototypes/** ✓ |
| Copies ที่เขียนลง spec | ตรง prototype verbatim: `สร้างโพสต์ใหม่`/`New post`, `เพิ่มสินทรัพย์ใหม่`/`Add Asset`, `เลือกหลายรายการ`/`Select`, `เลือกรูปภาพ`/`Select photos`, `เขียนคำอธิบาย...`/`Add a caption…`, `เขียนคำอธิบายสินทรัพย์…`/`Describe this asset…`, `Add location`/`Add price`/`Watch details`/`Condition`/`Cost details (private)`/`More options`, `Also save to My Assets`, `Turn off commenting`, `ทุกคน`/`Everyone`, `เฉพาะผู้ติดตาม`/`Followers only`, `แชร์`/`Share`, `เริ่มใหม่ใช่ไหม`/`หากคุณย้อนกลับตอนนี้ ฉบับร่างนี้จะไม่ได้รับการบันทึก`/`เริ่มใหม่`/`แก้ไขต่อไป`, `แก้ไขข้อมูล`/`Edit info`, `ทิ้งการแก้ไข?`, `เพิ่มรูปภาพหรือคลิป`/`Add photos or clips`, `ไม่พบสถานที่ที่ค้นหา`/`No matching places`, `วันที่ซื้อไม่ถูกต้อง`/`Invalid purchase date`, `วันที่ซื้ออยู่ในอนาคตไม่ได้`/`Purchase date can't be in the future`, `Posted · shared to feed ✓`, `Posted · shared to feed + My Assets ✓`, `Clip shared to feed ✓`, `Saved to My Assets · posted to feed/shown on profile/private ✓`, `Post updated`, `Post needs at least 1 photo or clip`, `You can add up to 10 photos or clips`, `Not in this prototype yet`, `Watch alert matched:` ✓ |
| Publish semantics | `insertNewPost` prepend `POSTS` + `following:true` + `pfkind:"post"` (drawer OFF) / `sale` (drawer ON via `cfToPortfolio`); `type` sale/showcase ตาม price; clip-only draft → `clip` + toast ต่าง; feed re-render + scroll top — ตรง handler ~15959–15990 + share handler ~20400+ ✓ |
| Asset-mode semantics | Show/Hide → `PF_MINE` drawer-only (ไม่เข้า feed/search/WA); Post to feed → `insertNewPost` `pfkind:"sale"`; กลับ own profile grid เสมอ — ตรง `cfToPortfolio` + handler ✓ |
| Edit semantics | `openPostEdit` prefilled step 2 (Cancel/Done), `applyPostEdit` update fields + `pfkind` + drawer link (attach/detach/materialize + sold lock), surface restore (detail/viewer/profile), `refreshPostViews` — ตรง ~16007–16108 + `pm-own-edit` ~20499 ✓ |
| Validation | media ≥1 = required เดียว; purchase date = inline validation เดียวใน cost pane (invalid/future, block Done, back cancel) — ลบ claim "required fields" เก่าออกหมด ✓ |
| ACs ใหม่ | AC-FEED-039–052 ทุกข้ออ้างพฤติกรรมจริง (`GUEST_GATE_SEL`, `data-flow`/`data-mode`, `cfPickerHTML`/`cfStep2HTML`, `CF_MAX_MEDIA`, `cfToPortfolio`/`PF_MINE`, `insertNewPost`, `openPostEdit`/`applyPostEdit`, `dlg-discard-go`, `feedClipTick`) ✓ |

## 4. Deviations flagged (spec เลือก prototype — documented, not spec)

| Deviation | Note |
| --- | --- |
| `hideCounts` ไม่มี composer setter | More options = commenting + audience เท่านั้น — spec เก็บ read semantics, setter → Future (FSP-015a จด "setter อยู่ composer" ผิด — แก้แล้ว) |
| `audience:"followers"` stored-only | feed/viewer ไม่กรองตาม audience — Audience Rule mark contract + deviation + Future item |
| Asset mode `Show`/`Hide` ทิ้ง audience/noComments | drawer-only record hardcode `public`/false — documented |
| Composer toasts EN hardcode | `Posted · shared to feed ✓`/`Clip shared ✓`/`Post updated`/`Post needs at least 1…`/`You can add up to 10…`/`Watch alert matched:` ไม่มี TH → flag language sweep (FSP-026) |
| `Estimated Market Price` band | mock estimate ±5–6% ปัด 5,000 + `Last Price Update`=วันนี้ — ไม่ใช่ market data จริง (10_WATCH_ALERT/market data ไม่เกี่ยว) |
| `likedBy` seed fake `the watch` | artifact บนโพสต์ใหม่ — likes=0 ไม่ render |
| Dead affordances | camera tile / `Recents` dropdown / expand icon → `Not in this prototype yet` — documented ไม่ใช่ feature |
| Edit `Cancel` = discard dialog เสมอ | ไม่เช็ค dirty (ต่างจาก create ที่ปิดเงียบเมื่อ draft ว่าง) — รับตาม prototype |
| Draft ไม่ persist | `cpState` in-memory เท่านั้น → Future item |

## 5. Flags ส่งต่อ (ไม่แก้นอก scope)

- **FSP-017** — `04_ASSET_MANAGEMENT_MODULE.md`: asset mode → drawer record interface อ้างไว้แล้ว (02 §5 Out + §9 Asset Mode Rule); `cfToPortfolio`/`assetFromPost`/`soldFromPost`/`PFO_STATUS` เป็น canonical ของ 04
- **FSP-022** — `11_SOCIAL_MODULE.md` ขัด prototype 2 จุด: (1) "กด Comment Count จาก Feed ต้องเปิด Asset Detail" + AC-SOCIAL-005 — จริงคือ shared comment sheet เปิดจาก feed ตรง ๆ (D8 + 02 §8); (2) "Owner สามารถ Like Asset ตัวเองได้" — จริง own-like → toast `This is your own listing`
- **FSP-024** — `14_PORTFOLIO_MODULE.md`: `PF_MINE` drawer-only store + `pfkind` show/hide/sold + `assetId` link semantics + Sold history link preservation — 02 อ้าง interface ไว้แล้ว
- **FSP-025/026/027** — checklists/Master docs: composer scope ใหม่ (AC-FEED-039–052) ต้อง map ใน QA/impl checklist + EN-hardcode toasts เข้า language sweep
- งานทั้งหมดยัง uncommitted รวม FSP-006–015b — รอพี่สั่ง commit แยก
