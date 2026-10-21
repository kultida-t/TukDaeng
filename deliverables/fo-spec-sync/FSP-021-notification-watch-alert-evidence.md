# FSP-021 — 09_NOTIFICATION + 10_WATCH_ALERT Update Evidence (alerts feed + WA sheet/list/engine)

Date: 2026-10-21
Task: `e4072733` — "FSP-021 อัปเดต 09_NOTIFICATION + 10_WATCH_ALERT"
Scope: `FrontOffice/09_NOTIFICATION_MODULE.md` (rewrite ทั้งไฟล์ ~470 บรรทัด) + `FrontOffice/10_WATCH_ALERT_MODULE.md` (rewrite ทั้งไฟล์ ~477 บรรทัด) — sync ตาม `Prototypes/fo-flow/index.html` (read-only) + baseline 00_GLOBAL (session §7, visibility/match §10, gate §11 Member Sheet, lifecycle §12, block §13, private §14) / 00_NAV (routes §6.6, entry matrix §7, **notif destination §8 canonical**, gate §9, unavailable §10) / 03_SEARCH (`sr-wa` entry + `waCriteriaFromSearch`/`waName`/`waSig`/`matchQuery`/`delivMatch`/`specOf` canonical — FSP-016 lock) / 05_ASSET_DETAIL (`mf-btn` + `modelKey` entry canonical — FSP-018 lock) / 02_FEED (`insertNewPost`/`_waHits` handoff — FSP-015b lock) / 06_PROFILE (`pfSetFollow`/`pfIsFollowed`/`profile:{u}` canonical — FSP-019 lock) / 07_CHAT (chat = badge-only canonical — FSP-020 lock) / 13_SETTINGS (`notif_settings` page + library row + delete-account copy canonical — FSP-013/014 lock)
Context: FSP-020 session note (`f84ffda9` done) + `FSP-016..020` evidence files + `gap-FSP-003b-chat-notifications.md` (ฝั่ง notifications) + `gap-FSP-002b-create-saved-wa.md` (ฝั่ง WA)

Prototype anchors verified (scan บน working copy ปัจจุบัน — line numbers ขยับจาก gap docs เพราะ owner diff ~360 บรรทัด comment long-press popover; ค้นด้วย function-name ตาม note):

**Alerts feed:** routes `alerts`→`alertsHTML` ~17703 + `walerts`→`walertsHTML` ~17715; nav item `[data-navgo="alerts"]` + `alBadgeHTML()` ~17006; `data-navgo`→`openSub(scr,"alerts",true)` ~21504 (swap-open); `ALERTS`/`alInit` ~17882–17911 (non-member → `[]`; member seed 13 rows, `wa()` helper ผูก post จริง); `alUnread`/`alBadgeHTML`/`alBadgeSync` ~17912–17920 (cap `99+`); `alAvatarHTML` ~17924–17933 (stack/heart badge/bell+seller-mini/`!` icon); `alTextHTML` ~17934–17947 (per-type copy + `formatAlertTime` ~13376–13383); `alRowHTML` ~17948–17957 (follow → `al-fbtn`+`al-x`, others → `al-thumb`); `alertsHTML` ~17958–17981 (`.al-head` back=`data-navgo="feed"` + title `แจ้งเตือน`/`Alerts` + group order fix + `data-alreadall` บน section แรก + `chEmptyHTML` empty); `alRerender` ~17982–17987 (`_subSwap` + scroll preserve); `alertsClick` ~17988–18037 (chain: readall → dismiss → follow → row; wired ~21494 ก่อน navgo); destinations ~18017–18034 (`follow`→`rpPush profile:`; `watch`→`openPostViewer` single + solo + inject `.follow-btn`; `like`/`comment`→`pfTabPosts(me,"all")` → viewer own post หรือ toast `This post is no longer available`; `system`→toast `Security details aren't in this prototype yet`)

**Watch Alert:** `WATCH_ALERTS`+`waSeq` ~16322–16323; `WA_MODES` ~16324–16328; `naSpec` ~16329; `WA_FK_LABEL` ~16330–16333; `waCriteriaFromPost` ~16336–16359 (mapped picks + strap concat + `SEARCH_DELIV` + unmapped rows; ข้าม `N/A`+mapped incl. price/data-source/Box); `waCriteriaFromSearch` ~16361–16372; `critMatch` ~16374–16393; `alertMatch` ~16394–16402 (criteria ว่าง = mode `all` เท่านั้น); `alertMatchCount` ~16403; `waSig` ~16404; `waName` ~16405–16410; `modelKeyOf`/`syncModelFlags`/`refreshMfBtns` ~16412–16425 (`"||"` ไม่นับ); `waModesHTML` ~16427–16445 (`N now`/`N รายการในขณะนี้` + disabled); `waSheetHTML` ~16449–16463; `waRowHTML` ~16464–16483 (`.wa-off` paused); `walertsHTML` ~16484–16491; settings row+count ~17380; `sr-wa`+`waSaved` ~14806–14813; `mf-btn` ~13479; `salePosts` ~14426 (price+`!ni`+`!muted`+`!blocked` — ไม่ filter pfkind); handlers `mf-btn` ~22126–22144, `wa-mode` ~22147–22158, `wa-go` ~22159–22191, `wa-del` ~22192–22205, `wa-tgl` ~22206–22218, `wa-badge` edit ~22219–22228, `sr-wa` ~22229–22241; `_waHits` ~16201 + toasts ~19950–19957/`fo_newpost`, ~20525–20527, ~20541–20543; `notif_settings` page ~17560–17572 + toggle handler ~21217–21223; `GUEST_GATE_SEL` ~23336–23345 (`[data-navgo="alerts"]`/`.al-fbtn`/`.mf-btn`/`.sr-wa`); `applySessionData` ~23292–23325 (`ALERTS=null`, `WATCH_ALERTS.length=0` ใน `clearUserData` ~23282 — ไม่ restore)

## 1. What changed (section map)

### 09_NOTIFICATION_MODULE.md

| Section | Change |
| --- | --- |
| Header/§1 Doc Info | rename → **Notification (Alerts feed)** — spec เดิม flat list asset-centric; prototype คือ IG-style activity feed |
| §2 Objective | rewrite — member-only `alerts` surface, 5 types, age-group sections, unread/badge, row actions |
| §3 Prototype Reference | **ใหม่ทั้งก้อน** — anchor index ครอบ route/state/badge/row anatomy/page/click chain/helpers/settings/gate/session (~30 anchors พร้อม line numbers ปัจจุบัน) |
| §4 Master Alignment | rewrite — เพิ่ม `system` type เป็น type ที่ 5 (00_NAV §8 hand-off), destinations = Post Viewer/Profile ทั้งหมด, grouping + extras, chat badge-only |
| §5 Scope | rewrite — In = feed/anatomy/read/badge/mark-all/dismiss/follow-back/destinations/gate/session/settings boundary; Out = viewer(03)/profile(06)/WA internals(10)/chat(07)/notif_settings page(13)/nav+sheet(00)/push transport/BO notif |
| §6 Screen Mapping | rewrite — 8 surfaces (feed, head, section, row, nav badge, empty, Member Sheet, notif_settings cross-ref) |
| §7 User States | rewrite — Guest (icon-only + gate), New (เข้าได้ feed ว่าง), Member, Blocked/unavailable context |
| §8 User Flow | **rewrite ทั้งก้อน** — open feed (swap-open + gate), read, mark-all, dismiss, follow-back inline, per-type destination, back→feed |
| §9 Business Rules | **rewrite ทั้งก้อน** — Data model (lazy init/seed/reset), Group&Order (fixed buckets), Row anatomy ต่อ type (ตาราง), Read/Unread, Badge 99+, **Destination Rule table ตาม 00_NAV §8**, **`system` Type Rule (decision)**, Follow-row actions, Notification Settings boundary (13 canonical + contract enforcement), Session, **Deviations 13 รายการ** |
| §10–12 Permission/Validation/Exception | rewrite — gate table (`[data-navgo="alerts"]`/`.al-fbtn`), routing validation (missing post → toast; watch = silent no-op deviation), exception table รวม contract states |
| §13 Empty | rewrite — `No alerts yet` + desc verbatim (ไม่ใช่ global copy) |
| §14 Notification Rules | rewrite — trigger contract table 5 types + กฎไม่แจ้ง (report/block/ฯลฯ) + toggle contract + chat badge-only + delete-account erasure |
| §15 Analytics | rewrite — contract `alerts_*`/`alert_*` set (11 events) — ลบ `notification_open_chat_room`/`notification_open_asset_detail`/`notification_open_comment_focus` ที่ตายตาม destination เก่า |
| §16 ACs | **rewrite ทั้งชุด** — AC-NOTI-001–022 sequential จัดกลุ่ม 6 หมวด — เดิม AC-NOTI-001–012 (ข้าม 008/009) renumber; ไม่มี live cross-ref (ดู §2) |
| §17 Related | +00_GLOBAL/00_NAV/02/03/06/07/10/13/15 links ตาม boundary ใหม่ |
| §18 Future | +system destination surface, generation pipeline, push+deep link, toggle enforcement, watch-missing toast parity (FSP-030), retention, unread persist, per-type dismiss, comment focus, i18n |

### 10_WATCH_ALERT_MODULE.md

| Section | Change |
| --- | --- |
| Header/§1 Doc Info | reframe — spec เดิม Search-only entry + Result List + required name; prototype = shared sheet 3 entries + Settings list + in-memory engine |
| §2 Objective | rewrite — criteria snapshot, 3 match modes + `N now`, auto-name, dedupe, walerts list, bell sync |
| §3 Prototype Reference | **ใหม่ทั้งก้อน** — anchor index ครอบ store/criteria/engine/sheet/list/entries/handlers/simulation/gate/session (~35 anchors) |
| §4 Master Alignment | rewrite — resolved C1 (multi-entry), C2 (auto-name), C3 (instant delete), C6 (criteria snapshot-only) ตาม prototype; match pool = Sale contract + pfkind-leak defect note |
| §5 Scope | rewrite — In = model/sheet/3 entries/list/engine/dedupe/sync/`_waHits`/gate/session/**v1.8 Production Contract layer**; Out = search internals(03)/detail(05)/composer(02)/feed rows(09)/settings pages(13)/market-data lifecycle(BO) |
| §6 Screen Mapping | rewrite — 7 surfaces (sheet, mode rows, walerts list, row, sr-wa, mf-btn, Member Sheet) |
| §7 User States | rewrite — Guest (gate ทั้งสอง entry + page unreachable), New (ว่าง), Member, Paused/Blocked context |
| §8 User Flow | **rewrite ทั้งก้อน** — create-from-search, create-from-detail, edit-from-list, pause/resume, match notification (simulation+contract) |
| §9 Business Rules | **rewrite ทั้งก้อน** — Alert model, Criteria snapshot (2 builders), Name rule (auto-regen), Match mode table, `critMatch` per-fk table, Match pool (contract Sale + defect), Dedupe 3 ทาง, Sheet rule, List rule, Bell sync, Notification rule, Session (no-restore deviation), **Production Contract Rules (v1.8 retained)**, **Deviations 16 รายการ** |
| §10–12 Permission/Validation/Exception | rewrite — gate table; validation (no required block, dedupe, no-details toast); exceptions รวม delete-account WA cancel (13 copy) |
| §13 Empty | rewrite — `No watch alerts yet — …` verbatim + `Any new listing` |
| §14 Notification | rewrite — `watch` row contract (09 canonical) + `_waHits` toast simulation |
| §15 Analytics | rewrite — contract `watch_alert_*` set (10 events — align ชื่อกับ 03/05/09 contract sets) |
| §16 ACs | **rewrite ทั้งชุด** — AC-WA-001–026 sequential จัดกลุ่ม 6 หมวด — เดิม AC-WA-001–018 (มี 004A suffix) renumber; DOCUMENT_VERSION refs AC-WA-016/017/018 ใน v1.8 history = historical (ดู §2) |
| §17 Related | +00_GLOBAL/00_NAV/02/03/05/09/13/14/15 links |
| §18 Future | +persistence, real match pipeline, relation-id criteria model, criteria editing, delete confirm (FSP-030), frequency/digest, price alerts, saved search, modelKey ให้ search-source, push/deep link, i18n |

## 2. Cross-doc ref check (ก่อนปิดงาน)

| Check | Result |
| --- | --- |
| `Global Login Required` ใน 09/10 ใหม่ | **0 hits** — แทนด้วย Member Sheet `Join TukDaeng` + `GUEST_GATE_SEL` ทั้งหมด (FSP-020 handoff ปิดเรียบร้อย) ✓ |
| `AC-NOTI-*`/`AC-WA-*` refs นอก 09/10 | **0 live refs** ใน FrontOffice/ — เหลือ historical ใน `DOCUMENT_VERSION.md` (v1.8 entry อ้าง AC-WA-016/017/018) + gap/evidence docs → renumber ปลอดภัย, flag FSP-028 ✓ |
| `system` type decision | **เก็บเป็น V1 type + placeholder destination** — 00_NAV §8 ล็อกไว้แล้ว ("destination contract อยู่ 09_NOTIFICATION") → 09 §9 `system` Type Rule + AC-NOTI-013 เป็น canonical; seed row = security (`A new device just logged in…`), scope = security/session เท่านั้น ✓ |
| Chat = badge-only | 09 §4/§14 + AC-NOTI-022 ตรง canonical 07 §14 (alerts feed ไม่มี chat type) ✓ |
| Boundary claims ที่ baselines ฝากไว้ | 00_NAV §8 destination matrix → 09 §9 Destination Rule ตรงทุกแถว (รวม System placeholder) ✓; 00_NAV §7 `Alerts back → feed` → AC-NOTI-018 ✓; 06 §14 `follow notif → profile:{follower}` → 09 §8/§14 ✓; 13 §530 "notif settings in-scope ทั้ง 13 และ 09 (resolve C8)" → 09 §9 Notification Settings Boundary + AC-NOTI-019/020 ✓; 03 §9 `sr-wa`/`waName`/`waSig` canonical → 10 อ้างไม่ซ้ำ ✓; 05 §9 `mf-btn`/`modelKey` canonical → 10 อ้างไม่ซ้ำ ✓; 02 `_waHits` toast handoff → 10 §8/§14 ✓; 04 "WA toast simulation canonical 10" → §14 ✓; 00_GLOBAL §10 `salePosts()` pfkind-leak defect → 10 §9 Match Pool + deviation #5 ✓ |
| Stale terms ใน 09/10 เดิมที่ถูกแทน | `Notification Center` (ใช้ `Alerts feed`/route `alerts`), `Result List`, `focus comment`, `Asset Detail` destination, `Global Login Required`, required Alert Name + inline validation, WA delete confirm, `watch_alert_create_started`/`renamed`/`notification_toggled`/`post_opened`/`notification_opened` events เดิม — เหลือเฉพาะการอ้าง spec-เดิม/deviation จงใจ ✓ |
| Stale terms ใน not-yet-synced modules (flag ไม่แก้) | `Notification Center` item claims: 02_FEED L662, 11_SOCIAL L294, 12_BOARD L266/L526, 15_TRUST_SAFETY L270 — ยังตรงเจตนา (ไม่สร้าง item) แต่ชื่อ surface เป็น legacy term → flag FSP-022/023 ตอน sync เอกสารนั้น; `Global Login Required` ที่เหลือ: 11/12/15/16 (pending sync) ✓ |
| Stale terms ใน legacy/central docs | Master L297/313/581/714/750, README_MODULE_INDEX L94 (**"supported types Like, Comment, Follow, Watch Alert เท่านั้น" — stale หลัง system type decision**), DEV_IMPLEMENTATION_CHECKLIST L214–218, DEV_BASELINE_HANDOFF L86/98, QA_CHECKLIST L1018/1099/1106/1384, DEV_CHAT_CHECKLIST L95/99/136/196, FINAL_HANDOFF L35/36, DOCUMENT_VERSION (v1.3/v1.8 history) — flag FSP-025/026/027/028 ✓ |
| 07 §14 reference กลับมาที่ 09 | "canonical: alerts feed ไม่มี chat type — 09_NOTIFICATION" — 09 ใหม่ยืนยัน AC-NOTI-022 ✓ |
| ERROR_STATE_UI_COPY_CATALOG | ไม่มี alerts/WA copies — flag เพิ่มตอน i18n sweep FSP-026 ✓ |

## 3. Verification

| Check | Result |
| --- | --- |
| ไฟล์ที่แก้ | `FrontOffice/09_NOTIFICATION_MODULE.md` (rewrite ~470 บรรทัด) + `FrontOffice/10_WATCH_ALERT_MODULE.md` (rewrite ~477 บรรทัด) + evidence file นี้ ✓ |
| `git status --porcelain -- Prototypes/` | `M Prototypes/fo-flow/index.html` = **diff เดิมของ owner ก่อน session นี้** (comment long-press popover ~360 บรรทัด — ไม่มีส่วน alerts/WA) — **งานนี้ไม่แตะ Prototypes/ (read-only เท่านั้น); anchors สแกนจาก state ปัจจุบันด้วย function-name** ✓ |
| Feed anatomy | 5 types + aggregate `more` + stack/heart/bell/`!` avatar + thumb/side/x — ตรง ~17895–17957 ✓ |
| Groups + actions | fixed `Today/Yesterday/Last 7 days/Earlier` + `Mark all as read` (section แรก + unread>0) + dismiss follow-only + readall-remove-on-0 — ตรง ~17958–18037 ✓ |
| Destinations | follow→`rpPush profile:` / watch→viewer+solo+inject Follow / like·comment→own-post viewer หรือ toast / system→placeholder toast — ตรง ~18017–18034 ✓ |
| WA sheet | shared `wa`/`wa-open`; Create/Edit variants; `wa-name` prefill; 3 modes + `N now` + disabled logic; `wa-go`/`wa-del` — ตรง ~16449–16463/~22147–22241 ✓ |
| WA engine | `critMatch` per-fk + `alertMatch` 3 modes (empty→all) + `alertMatchCount`/`waSig`/`waName`/`modelKeyOf`/`syncModelFlags`/`refreshMfBtns` — ตรง ~16374–16425 ✓ |
| WA list | `walertsHTML` sub-back + desc + rows (`wa-off`/Edit badge/mode/`N matches now`/`wa-tgl`) + empty copy — ตรง ~16464–16491 ✓ |
| Dedupe | save-time `waSig`+`matchMode` → reopen edit + `You already saved this alert`; `sr-wa` sig dedupe ทุก source (bell `on` เฉพาะ `source:"search"`); `mf-btn` `modelKey` dedupe on/off — ตรง ~22171–22178/~22234–22238/~22133–22136 ✓ |
| Guest gate | `[data-navgo="alerts"]`/`.al-fbtn`/`.mf-btn`/`.sr-wa` ∈ `GUEST_GATE_SEL`; `walerts`/`notif_settings` อยู่หลัง settings (member-only entry) — ตรง ~23336–23345 ✓ |
| Session | `member` seed / `new`+`guest` ว่าง; `applySessionData` reset ทั้งคู่ (WA ไม่ restore — deviation) — ตรง ~17885/~23282–23294 ✓ |
| ACs ใหม่ | AC-NOTI-001–022 + AC-WA-001–026 ทุกข้ออ้างพฤติกรรมจริง (`alInit`/`alBadgeSync`/`al-readall`/`aldismiss`/`alfollow`/`rpPush`/`openPostViewer`/`pfSetFollow`/`GUEST_GATE_SEL`/`waSheetHTML`/`waCriteriaFromSearch|Post`/`waName`/`waSig`/`modelKey`/`alertMatch`/`salePosts`/`wa-tgl`/`wa-del`/`_waHits`/`syncModelFlags`/`state.notif`) ✓ |

## 4. Deviations flagged (spec เลือก prototype — documented, not spec)

| Deviation | Note |
| --- | --- |
| Feed = IG activity list grouped by age bucket | spec เดิม flat DESC list; 5th type `system` เพิ่มจาก baseline 4 |
| Destinations ทั้งหมด Post Viewer/Profile | ไม่มี Asset Detail direct, focus comment, Result List — canonical 00_NAV §8 |
| `system` = V1 type placeholder destination | decision ตาม 00_NAV §8 hand-off; tap = dead toast; production = security surface (future) |
| Follow row extras | `Follow back` (real `pfSetFollow` toggle) + dismiss `x` + `Mark all as read` — extras ที่ spec เดิมไม่มี; dismiss เฉพาะ follow |
| `watch` row missing post = silent no-op | like/comment มี toast `This post is no longer available` — inconsistency flag FSP-030 |
| `al-fbtn` post-toggle label EN hardcode | render แรกมี TH (`ติดตามกลับ`/`กำลังติดตาม`) แต่ toggle แล้วเหลือ `Following`/`Follow back` — i18n quirk |
| `state.notif` toggles ไม่กรองจริง + ไม่ reset ตอน session switch | page มีจริง (13 canonical) — enforcement = contract |
| `ALERTS` seed-only ไม่มี generation | read/dismiss ไม่ persist ข้าม session |
| WA: 3 entries shared sheet | spec เดิมบังคับ Search Filter เท่านั้น (C1 resolved) |
| WA: name auto-regen ไม่ block | spec เดิม required + validation (C2 resolved — canonical rule เดียวกันใน 03 §9 อยู่แล้ว) |
| WA: delete instant ไม่ confirm | spec เดิมบังคับ confirm (C3 resolved — flag FSP-030 consistency กับ destructive pattern) |
| WA: criteria snapshot-only | แก้ไม่ได้ใน sheet — แก้ได้แค่ name+matchMode (C6 resolved) |
| WA: `salePosts()` pfkind leak | priced show/hide/sold นับเข้า `N now`+`_waHits` — defect S-10 (contract = Sale only) |
| WA: `_waHits` self-match toast | simulation บนโพสต์ตัวเองตอน publish — ไม่ใช่ feed row จริง |
| WA: `WATCH_ALERTS` ไม่ restore หลัง session switch | `clearUserData` ล้างแต่ `restoreUserData` ไม่คืน — member เสีย alerts ใน demo |
| WA: `modelKey` เฉพาะ detail-source | search alert criteria เป็น brand+model+ref ล้วนก็ไม่ขับ bell `Following this model` (quirk) |
| WA/Alerts: EN/TH mixed hardcode | WA toasts EN-only, `al-fbtn` toggle EN — i18n sweep FSP-026 |
| v1.8 contract retained เป็น contract layer | relation-id criteria / keyword-over-free-text / inactive market data / backfill dedup — prototype ไม่ model (string-match engine) — เก็บเป็น Production Contract Rules §9 ชัด ๆ ไม่ลบทิ้ง (DOCUMENT_VERSION v1.8 content preserved) |

## 5. Flags ส่งต่อ (ไม่แก้นอก scope)

- **FSP-022 (11_SOCIAL)** — `Notification Center` term ที่ L294 + like/follow notif semantics ฝั่ง social (no item created — ตรง 09 §14)
- **FSP-023 (12_BOARD + 15_TRUST_SAFETY)** — `Notification Center` term ที่ 12 L266/L526 + 15 L270
- **FSP-025/026/027/028** — legacy docs stale: README_MODULE_INDEX L94 (type list 4 → ต้อง +system หรือระบุ placeholder), Master L750 (`notif settings` baseline), DEV_IMPLEMENTATION_CHECKLIST L214–218 (4-type check + `Login Required Dialog` wording), DEV_BASELINE_HANDOFF L86/98, QA_CHECKLIST L1018/1099/1106/1384 (`Notification Center` + `ไม่พบข้อมูล` empty checks), DEV_CHAT_CHECKLIST, FINAL_HANDOFF L35/36, DOCUMENT_VERSION history (AC-WA-016–018 เดิม = historical ไม่ต้องแก้เนื้อ history) + **i18n sweep copies**: `No alerts yet`/`Mark all as read`/`Follow back`/`Following`/`Watch alert matched:`/`Watch alert on|updated|paused|removed`/`You already saved this alert`/`No details on this post to watch`/`Any new listing`/`Security details aren't in this prototype yet`/`This post is no longer available`
- **FSP-030 consistency sweep** — `watch` missing-post silent no-op vs like/comment toast parity; WA instant-delete vs destructive-confirm pattern (C3 ยัง flag ไว้); `state.notif` no-enforcement/no-reset; `WATCH_ALERTS` no-restore; `modelKey` ไม่ครอบ search-source alerts; `Earlier` bucket static; `system` type vs 13_SETTINGS §14 "security alert = future/Needs Decision" (09 ตัดสินเก็บเป็น feed row ตาม 00_NAV §8 — reconcile wording ฝั่ง 13)
- **Prototype drift note** — `index.html` ยังมี uncommitted diff ของ owner (comment long-press popover); anchors ในเอกสารนี้อาจ drift — task ถัดไป verify ด้วย function-name เหมือนเดิม
- งานทั้งหมดยัง uncommitted รวม FSP-006–021 — รอพี่สั่ง commit แยก
