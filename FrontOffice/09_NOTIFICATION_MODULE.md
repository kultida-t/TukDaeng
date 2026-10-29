# 09 Notification Module

อ้างอิงหลักจาก [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md) + baseline [00_GLOBAL_RULES_MODULE.md](00_GLOBAL_RULES_MODULE.md) §7 (session), §11 (guest gate = Member Sheet + empty state), §13 (block/report impact), §14 (private data) + [00_NAVIGATION_AND_CROSS_MODULE_FLOW.md](00_NAVIGATION_AND_CROSS_MODULE_FLOW.md) §6 (layer/nav/badge), §7 (entry matrix), §8 (notification destination matrix — canonical), §9 (gate routing), §10 (unavailable fallback) + [06_PROFILE_MODULE.md](06_PROFILE_MODULE.md) (follow notif → `profile:{user}` + `pfSetFollow`/`pfIsFollowed` canonical — FSP-019 lock) + [07_CHAT_MODULE.md](07_CHAT_MODULE.md) (chat = badge-only ไม่ใช่ alert type — FSP-020 lock) + [13_SETTINGS_MODULE.md](13_SETTINGS_MODULE.md) (`notif_settings` page + library row canonical — FSP-013/014 lock) — prototype `Prototypes/fo-flow/index.html` เป็น source of truth เดียวของพฤติกรรม (FO-PRD-v1.9)

---

# 1. Document Information

| Item | Detail |
|---|---|
| Module Name | Notification (Alerts feed) — UI ใช้ชื่อ `แจ้งเตือน`/`Alerts`; spec เดิมตีความเป็น flat notification list แบบ asset-centric (Like→Asset Detail, Comment→focus comment, WA→Result List); prototype คือ IG-style activity feed ที่ทุก destination เป็น Post Viewer / Public Profile |
| Platform | Mobile Application |
| Version | V1 |
| Owner | Product / UX / Engineering |
| Status | Draft |
| Document Type | Functional PRD - Master Aligned |

---

# 2. Objective

Alerts feed คือ member-only surface บน bottom-nav `แจ้งเตือน`/`Alerts` (route `alerts`) ที่รวมเหตุการณ์ของบัญชีไว้เป็นฟีดกิจกรรมแบบ IG — like (aggregate หลาย user), comment, follow (พร้อม inline `Follow back` + dismiss `x`), watch alert match และ system row — แบ่งกลุ่มตามช่วงเวลา `Today`/`Yesterday`/`Last 7 days`/`Earlier` พร้อม unread state + nav badge และ `Mark all as read`

โมดูลนี้ต้องคุม: ชุด notification type ที่รองรับ, row anatomy ต่อ type, read/unread + badge semantics, row actions (mark read / mark all / dismiss / follow back), destination routing ตาม 00_NAV §8 และ guest gate — โดยยึดพฤติกรรม prototype เป็นตัวตัดสินเมื่อ spec เดิมขัดกัน

---

# 3. Prototype Reference

Source of truth: `Prototypes/fo-flow/index.html` (read-only — ห้ามแก้)

- Route + page: `alerts` → `alertsHTML` (~17703); nav item + badge ใน `botNavHTML` (~17006 — `[data-navgo="alerts"]` + `alBadgeHTML()` + label `แจ้งเตือน`/`Alerts`); `data-navgo="alerts"` → `openSub(scr,"alerts",true)` swap-open (~21504)
- Data model: `ALERTS` (~17882 — `null` จนกว่า init), `alInit` (~17883–17911 — `state.session !== "member"` → `ALERTS = []` เสมอ (guest + new); member seed 13 rows — field `{id:"al{n}", type, users[], more, ago, grp, unread, text?, pid?, thumb?, name?, price?}`; `wa()` helper ผูก watch rows กับ post จริงผ่าน `findPost` + `specOf`)
- Badge: `alUnread`/`alBadgeHTML`/`alBadgeSync` (~17912–17920 — count = unread rows, cap `99+`, sync ทุก `.nav-item[data-navgo="alerts"]` instance)
- Row anatomy: `alAvatarHTML` (~17924–17933 — like>1 user → `.al-stack` 2 avatar + heart badge `al-badge`; like เดี่ยว → avatar + heart badge; watch → `.al-watch` bell icon + seller mini avatar `.al-wseller`; system → `.al-sys` circle-`!` icon; comment/follow → single avatar), `alTextHTML` (~17934–17947 — copy ต่อ type + `<span class="al-time">` จาก `formatAlertTime`), `alRowHTML` (~17948–17957 — `.al-row.unread` + `data-alid`; follow → `al-fbtn` (`data-alfollow`) + `al-x` (`data-aldismiss`); like/comment/watch → `al-thumb` ขวา)
- Page render: `alertsHTML` (~17958–17981 — `.al-scroll` + `.al-head` = `.al-back` `data-navgo="feed"` + title `แจ้งเตือน`/`Alerts`; group sections ตามลำดับ fix `Today`/`Yesterday`/`Last 7 days`/`Earlier` (TH `วันนี้`/`เมื่อวาน`/`7 วันที่ผ่านมา`/`ก่อนหน้า`) render เฉพาะกลุ่มไม่ว่าง; `.al-readall` `Mark all as read`/`อ่านทั้งหมดแล้ว` บน section แรกเมื่อ unread>0; empty = `chEmptyHTML` `No alerts yet` + desc), `alRerender` (~17982–17987 — `_subSwap` re-render คง scrollTop)
- Click handler: `alertsClick` (~17988–18037 — chain order `data-alreadall` → `data-aldismiss` → `data-alfollow` → `.al-row`; wired ใน global click chain ~21494 ก่อน navgo)
- Unavailable state: `al_unavail` sub page (unavailable state `รายการนี้ไม่พร้อมใช้งานแล้ว`/`This post is no longer available` + ปุ่ม `Go back` — contract 00_NAV §10; เปิดแทน toast เมื่อ post target หายทุก type)
- Read/dismiss persistence: `alLoadState`/`alSaveState` (`localStorage: fo_alstate` — `{r:[ids อ่านแล้ว], x:[ids ที่ dismiss]}` — จำลอง server-backed persist: คงอยู่ข้าม reload + session switch ตาม contract)
- Helpers: `formatAlertTime` (~13376–13383 — `ago` string `Nm/Nh/Nd/Nw` → TH `นาที`/`ชม.`/`วัน`/`สัปดาห์`), `chEmptyHTML` (~17876 — shared empty card กับ 07_CHAT), `pfSetFollow`/`pfIsFollowed` (~16849–16858 — canonical 06), `rpPush` → `pushSub` (~15095), `openPostViewer` (~14738 — signature `(scr, posts, pid, phi, feedMode, title, user)`; `user` ≠ me → pfp head + `pf-foll` chip ตอน unfollowed)
- Notification settings: settings row `data-sub="notif_settings"` (~17390 — canonical 13), page ~17560–17572 (4 toggles 2 groups), toggle handler `[data-notif-tgl]` ~21217–21223 (`state.notif` persist ผ่าน `localStorage: fo_notif`)
- Gate + session: `GUEST_GATE_SEL` รวม `[data-navgo="alerts"]` + `.al-fbtn` (~23337–23339) → `obGate` Member Sheet; `applySessionData` reset `ALERTS = null` + `alBadgeSync()` (~23294/~23323)
- WA rows in feed: `type:"watch"` seed ผูก `p1`/`p5`/`p3`; destination + Watch Alert internals canonical = [10_WATCH_ALERT_MODULE.md](10_WATCH_ALERT_MODULE.md)

---

# 4. Master Alignment Summary

| Topic | Master Baseline | Notification Module Rule |
| --- | --- | --- |
| Supported types | Like, Comment, Follow, Watch Alert | ตรง + **เพิ่ม `system`** — prototype มี security row (`A new device just logged in…`) เป็น type ที่ 5; 00_NAV §8 รับไว้แล้ว (destination = placeholder, contract อยู่เอกสารนี้ §9) |
| Destinations | Like/Comment → post ของตัวเอง; Follow → profile ผู้ติดตาม; Watch Alert → post ที่ match โดยตรง | ตรง 00_NAV §8 — ทุก content destination = **Post Viewer** (ไม่ใช่ Asset Detail, ไม่มี focus comment, ไม่มี Result List) |
| Read state | unread → read เมื่อเปิด | ตรง + extras ที่ prototype เพิ่ม: `Mark all as read`, dismiss `x` (follow row), inline `Follow back` |
| Grouping | — | feed แบ่ง section ตาม age bucket (Today/Yesterday/Last 7 days/Earlier) — ไม่ใช่ flat DESC list |
| Guest restriction | login-required surfaces → Member Sheet | แท็บ `แจ้งเตือน` อยู่ใน `GUEST_GATE_SEL` — guest เห็นแค่ icon; session `new` เข้าได้แต่ feed ว่าง (`ALERTS=[]`) |
| Chat notification | New Message = badge เท่านั้น | ตรง canonical 07 §14 — **ไม่มี chat type ใน feed** |
| Notification settings | — | `notif_settings` 4 toggles อยู่ใน V1 (canonical หน้า = 13_SETTINGS); module นี้คุม mapping toggle ↔ type เท่านั้น |
| Private data | 00_GLOBAL §14 | feed ไม่แสดง private data (price ใน watch row = asking price public) |

---

# 5. Scope

## In Scope

- Alerts feed page (`alerts`) — header, group sections, row anatomy ทุก type, empty state
- Notification types: `like` / `comment` / `follow` / `watch` / `system` (+ aggregate `more` บน like)
- Read / unread state + `.al-readall` Mark all as read + nav badge (cap `99+`)
- Row actions: open destination, dismiss `x` (follow), inline `Follow back`/`Following` (follow)
- Destination routing ตาม 00_NAV §8 + fallback เมื่อ post หาย
- Guest gate (Member Sheet) + session semantics (`member` seed / `new`+`guest` ว่าง / reset ตอน session switch)
- Notification settings boundary (type toggles — page internals อยู่ 13)
- Deviations + dead/placeholder surfaces

## Out Of Scope (module อื่นเป็นเจ้าของ)

- Post Viewer internals + modes — [03_SEARCH_FILTER_MODULE.md](03_SEARCH_FILTER_MODULE.md); เอกสารนี้ระบุเฉพาะ notification → viewer handoff (single-post, solo header)
- Public Profile + `pfSetFollow`/`pfIsFollowed` semantics — [06_PROFILE_MODULE.md](06_PROFILE_MODULE.md)
- Watch Alert engine/sheet/list + `wa*` internals — [10_WATCH_ALERT_MODULE.md](10_WATCH_ALERT_MODULE.md); เอกสารนี้ระบุเฉพาะ `watch` row anatomy + destination
- Chat badge — [07_CHAT_MODULE.md](07_CHAT_MODULE.md) (`chBadgeSync`; ไม่ใช่ alert type)
- `notif_settings` page anatomy + settings entry — [13_SETTINGS_MODULE.md](13_SETTINGS_MODULE.md)
- Bottom nav / layer model / Member Sheet internals — 00_NAV §6 / 00_GLOBAL §11
- Push notification transport (FCM) — contract เท่านั้น (§14/§18)
- BO-generated notifications (moderation/account action) — ไม่มีใน V1 feed

---

# 6. Screen Mapping

| Screen / State | Prototype | Description |
| --- | --- | --- |
| Alerts feed | `alerts` sub page (`alertsHTML`) | หน้าเดียวของ module — scroll `.al-scroll` + bottom nav ของตัวเอง (active `alerts`) |
| Feed header | `.al-head` | back `data-navgo="feed"` (กลับ Feed เสมอ ไม่ใช่ pop) + title `แจ้งเตือน`/`Alerts` + spacer ขวา (invisible icon-btn เพื่อความสมมาตร) |
| Group section | `.al-sec` + `.al-row` | section label + `Mark all as read` บน section แรก + rows |
| Notification row | `.al-row` | avatar/icon + text + time + side element (thumb หรือ follow button) + dismiss `x` (follow เท่านั้น) |
| Nav badge | `.nav-badge` ใน `[data-navgo="alerts"]` | unread count cap `99+` — sync ทุก nav instance |
| Empty state | `chEmptyHTML` | `No alerts yet` + desc (shared component กับ chat) |
| Member Sheet | `.ob` gate variant | guest gate — canonical 00_GLOBAL §11 |
| Notification settings | `notif_settings` sub page | type toggles — canonical page อยู่ 13_SETTINGS |

---

# 7. User States

## Guest (session `guest`)

- เห็นเฉพาะ nav icon `แจ้งเตือน` — กดแล้วเจอ Member Sheet `Join TukDaeng` (gate `[data-navgo="alerts"]`)
- ไม่มีทางเข้าถึง feed — `alInit` ให้ `ALERTS = []` เสมอสำหรับ non-member
- `.al-fbtn` อยู่ใน gate list ด้วย (defense-in-depth — unreachable อยู่แล้วเพราะเข้าหน้าไม่ได้)

## New Member (session `new`)

- เข้าหน้าได้ทันที แต่ feed ว่างเสมอ — `alInit` guard `session !== "member"` → `[]` → empty state `No alerts yet`

## Member

- Feed เต็ม: seed rows ทุก type, unread badge, mark read / mark all, dismiss, follow back, destination routing
- กลับเข้าหน้าใหม่ re-render จาก `ALERTS` state ปัจจุบัน + read/dismiss persist ข้าม session (server-backed contract)

## Blocked / Unavailable Context

- Follow destination เข้า `profile:{user}` ตามปกติ — blocked profile แสดง keep-page ตาม canonical 06/00_NAV §10
- Post destination (like/comment/watch) ที่โพสต์หาย → fallback ตาม §9 Destination Fallback Rule

---

# 8. User Flow

## Open Alerts Feed

```text
Bottom nav แจ้งเตือน
-> (member) swap-open `alerts` ทับ feed — ไม่มี slide
-> render groups + rows + badge state ปัจจุบัน
```

```text
Guest กด tab
-> Member Sheet `Join TukDaeng` (gate) — feed ไม่เปิด
```

## Read Notification

```text
Tap .al-row
-> a.unread = false + ลบ .unread class + alBadgeSync + persist id เข้า fo_alstate.r
-> route ตาม type (ดู §9 Destination Rule)
-> ถ้า unread หมด -> ลบปุ่ม `Mark all as read`
```

## Mark All As Read

```text
Tap `อ่านทั้งหมดแล้ว` / `Mark all as read` (section แรก)
-> ทุก row unread = false + persist ทุก id เข้า fo_alstate.r + alBadgeSync + alRerender
```

## Dismiss Follow Row

```text
Tap `x` บน follow row
-> splice row ออกจาก ALERTS + persist id เข้า fo_alstate.x + alRerender (badge ไม่เปลี่ยนถ้า row อ่านแล้ว)
-> row หายถาวร — ไม่กลับมาแม้เปิดแอปใหม่/สลับ session (ไม่มี undo)
```

## Follow Back Inline

```text
Tap `ติดตามกลับ`/`Follow back` บน follow row
-> pfSetFollow(user, !current) — sync follow state จริงทั้งระบบ (canonical 06)
-> ปุ่มสลับ Following ↔ Follow back
-> ไม่ mark read / ไม่ navigate (handler ตัดก่อน .al-row)
```

## Open Destination (per type)

```text
like/comment -> find โพสต์ตัวเองใน pfTabPosts(me,"all")
   -> เจอ: openPostViewer [post เดียว] title `Post` + solo header
   -> ไม่เจอ: pushSub `al_unavail` — unavailable state + `Go back` (00_NAV §10)
watch -> findPost(pid)
   -> เจอ: openPostViewer [post] title `Post` + seller name + solo header + inject Follow (ถ้ายังไม่ follow)
   -> ไม่เจอ: pushSub `al_unavail` เช่นเดียวกัน (parity กับ like/comment — resolved FSP-030)
follow -> rpPush `profile:{follower}`
system -> toast `Security details aren't in this prototype yet` (placeholder — ไม่มี destination ใน V1)
```

## Back

```text
ปุ่ม `<` บน al-head = data-navgo="feed" -> เคลียร์ sub stack กลับ Feed เสมอ (canonical 00_NAV §6.7/§7)
```

---

# 9. Business Rules

## Data Model Rule (`ALERTS`)

- `ALERTS` = list ต่อ account — init ครั้งแรกที่ render (`alInit` lazy): `member` → seed set (reconcile กับ persisted read/dismiss state), `new`/`guest` → `[]`
- Row fields: `id`, `type` (`like|comment|follow|watch|system`), `users[]` (actors; index 0 = primary), `more` (aggregate count นอกเหนือ 2 ชื่อแรก), `ago` (label string), `grp` (age bucket), `unread`, `pid`+`thumb` (post ref — like/comment/watch), `text` (comment excerpt / system message), `name`+`price` (watch: `Brand Model` + asking price)
- Read state (`unread→read`) + dismiss ต้อง **persist ถาวรต่อ account** — contract: server-backed (คงอยู่ข้ามเปิดแอปใหม่ + ข้ามเครื่อง); prototype จำลองผ่าน `fo_alstate` localStorage
- ไม่มี generation path — `ALERTS` เป็น seed เท่านั้น (like/comment/follow/watch/system ไม่มี code สร้าง row ใหม่; trigger contract อยู่ §14)
- `applySessionData` → `ALERTS = null` (re-init ตาม session ใหม่) + `alBadgeSync` — persisted state re-apply ตอน init ถัดไป ไม่ใช่ reset ใหม่ทั้งหมด

## Group & Order Rule

- กลุ่มเรียงตามลำดับ fix: `Today` → `Yesterday` → `Last 7 days` → `Earlier` (TH `วันนี้`/`เมื่อวาน`/`7 วันที่ผ่านมา`/`ก่อนหน้า`) — render เฉพาะกลุ่มที่มี row
- ภายในกลุ่มเรียงตามลำดับใน list (prototype = seed order; contract = created DESC ภายใน bucket)
- `Mark all as read` แสดงเฉพาะบน section header แรก และเฉพาะเมื่อ unread > 0

## Row Anatomy Rule (per type)

| Type | Avatar/icon | Text | Right side | Extras |
| --- | --- | --- | --- | --- |
| `like` | 1 user → avatar + heart badge; >1 user → stack 2 avatar + heart badge | `{names} liked your post.` / `ถูกใจโพสต์ของคุณ` (+ `และคนอื่น ๆ อีก N คน` เมื่อ `more`/users>2) | post thumb | — |
| `comment` | single avatar | `{name} commented: {text}` / `แสดงความคิดเห็น:` | post thumb | — |
| `follow` | single avatar | `{name} started following you.` / `เริ่มติดตามคุณ` | `Follow back`/`Following` button | dismiss `x` |
| `watch` | bell icon + seller mini avatar overlay | `Watch alert {name} — new listing from {seller} · {price}` / `การแจ้งเตือนนาฬิกา {name} — รายการใหม่จาก {seller} · {price}` | post thumb | — |
| `system` | circle-`!` icon | `{text}` (ข้อความดิบ เช่น `A new device just logged in to your account near Bangkok, TH`) | — | — |

- `names` = 2 ชื่อแรก bold join `, ` + `and N others`/`และคนอื่น ๆ อีก N คน` เมื่อมี (`n = more + users.length - 2`)
- Time label = `ago` string + `formatAlertTime` แปลงหน่วยเป็น TH (`m`→`นาที`, `h`→`ชม.`, `d`→`วัน`, `w`→`สัปดาห์`)

## Read / Unread Rule

- Row ใหม่เริ่ม `unread` → `.al-row.unread` (visual highlight)
- Tap row → `unread=false` + `alBadgeSync` ทันที ก่อน navigate + persist id (server-backed contract)
- `Mark all as read` → clear unread ทุก row + persist ทุก id + badge หมด + re-render
- หลัง row-tap ถ้า `alUnread() === 0` → ลบปุ่ม mark-all ออก (ป้องกันปุ่มค้าง)
- `data-alfollow`/`data-aldismiss` ตัดก่อน row handler — tap ปุ่มเหล่านั้น **ไม่ mark read** และไม่ navigate
- Read state คงอยู่ข้าม kill/reopen app + session switch + เครื่องอื่นบัญชีเดียวกัน (contract — ไม่ใช่ session-local)

## Badge Rule

- Badge = Σ unread rows บน nav item `แจ้งเตือน` — cap `99+` เหมือน chat badge
- `alBadgeSync` re-render ทุก `.nav-item[data-navgo="alerts"]` instance (nav ซ้ำบนหลาย sub page shell)
- Badge หายเมื่อ unread = 0; ไม่มี badge สำหรับ session `new`/`guest` (list ว่าง)

## Destination Rule (canonical 00_NAV §8)

| Type | Destination | Fallback |
| --- | --- | --- |
| `like` | Post Viewer — โพสต์ของตัวเอง 1 ใบ (lookup `pfTabPosts(me,"all")` ด้วย `pid`; title `Post` + `pfp-tt solo`) | post ไม่อยู่ใน own posts → unavailable state `รายการนี้ไม่พร้อมใช้งานแล้ว` + `Go back` (`al_unavail` — 00_NAV §10) |
| `comment` | เหมือน like — viewer โพสต์ตัวเอง; **ไม่มี focus/deep-scroll comment ใน V1** | เหมือน like |
| `follow` | Public Profile `profile:{users[0]}` ผ่าน `rpPush` (push ทับ alerts) | blocked → keep-page ตาม canonical 06 |
| `watch` | Post Viewer — post ที่ match โดยตรง (`findPost(pid)`; title `Post` + seller; `pfp-follow` chip ถูกลบ; inject `Follow` button ก่อน `...` เมื่อ `!p.following`) | post หาย → unavailable state เดียวกัน (parity กับ like/comment — resolved FSP-030) |
| `system` | **placeholder — ไม่มี destination ใน V1** | tap → toast `Security details aren't in this prototype yet` (contract: security/account activity surface — future) |

- ไม่มี destination อื่น: ไม่มี Asset Detail direct, ไม่มี Result List, ไม่มี chat room, ไม่มี settings jump

## `system` Type Rule (decision — FSP-021)

- `system` เป็น notification type ที่รองรับใน V1 feed (prototype มี seed row + icon + copy จริง; 00_NAV §8 ล็อกไว้แล้วโดย hand-off destination contract มาที่เอกสารนี้)
- V1 destination = **placeholder เท่านั้น** — tap ไม่ navigate; production contract = เปิด security/account activity surface เมื่อมี (§18)
- Seed row = security event (`A new device just logged in to your account near Bangkok, TH`) — scope `system` ใน V1 = security/session alerts เท่านั้น; ใช้กับ event อื่นต้องมี master decision เพิ่ม

## Follow Row Actions Rule

- `Follow back`/`กำลังติดตาม` (`al-fbtn`, `data-alfollow`) — toggle follow จริงผ่าน `pfSetFollow` (sync POSTS `p.following` หรือ `PF_EXTRA_FOL` ตาม canonical 06); ปุ่มสลับ `.on` + label — **label ต้องตามภาษาแอปทุกสถานะ** (resolved: เดิม toggle แล้ว hardcode EN)
- Dismiss `x` (`data-aldismiss`) — **มีเฉพาะ follow rows**; ลบ row ออกจาก `ALERTS` ทันที + **persist ถาวร** (ไม่กลับมาหลังเปิดแอปใหม่/สลับ session; ไม่มี undo, ไม่มี confirm)
- Follow row ยังเปิด profile ได้ด้วยการ tap พื้นที่ row (ไม่ใช่ปุ่ม)

## Notification Settings Boundary Rule

- `notif_settings` มี 4 toggles ผูก type ตรง ๆ: `likes`→`like`, `comments`→`comment`, `follows`→`follow`, `walerts`→`watch` — default ON ทั้งหมด; หน้า + row anatomy canonical อยู่ 13_SETTINGS
- Toggle state ต้อง **persist ข้ามเปิดแอปใหม่** (contract; prototype persist ผ่าน `fo_notif`)
- **Contract: toggle OFF ต้องหยุดรับ notification ของ type นั้นจริง** (§14) — prototype ไม่มี generation เลยไม่มี code path กรอง (acceptance อยู่ฝั่งแอปจริง)
- Rows เดิมที่มีอยู่แล้วไม่ถูกลบเมื่อปิด toggle — toggle หยุดเฉพาะการสร้างใหม่

## Session Rule

- `member` → seed เต็ม reconcile กับ persisted state; `new`/`guest` → `ALERTS=[]` (ไม่มี badge, feed ว่าง, tab ของ guest โดน gate อยู่แล้ว)
- เปลี่ยน session → `ALERTS=null` re-init ใหม่ — read marks/dismiss ที่ persist แล้ว **ยังคงอยู่** (contract server-backed — member กลับมาไม่ได้ unread คืน)

## Deviations & Dead-Code Notes (spec เลือก prototype — documented, not spec)

1. **Feed = IG activity list grouped by age** — spec เดิม flat list เรียง Created Date DESC เดียว; prototype ใช้ `grp` bucket + section headers
2. **Destinations ทั้งหมด = Post Viewer/Public Profile** — spec เดิม Like/Comment→Asset Detail (+focus comment), WA→Result List; ไม่มี focus comment affordance ใน viewer (00_NAV §8 canonical)
3. **`system` type มีจริง** — spec เดิมจำกัด 4 types; เก็บเป็น V1 type placeholder destination (§9 `system` rule)
4. **Like aggregate `more` + avatar stack** — spec เดิมไม่มี aggregation model
5. **`Mark all as read` + dismiss `x` + inline `Follow back`** — extras ที่ spec เดิมไม่มี; dismiss มีเฉพาะ follow rows (like/comment/watch/system ลบไม่ได้)
6. ~~**`watch` row missing-post = silent no-op**~~ — RESOLVED (FSP-030): ทุก post destination ที่หายเปิด `al_unavail` unavailable state parity กันแล้ว
7. **Empty copy `No alerts yet` + desc** — ไม่ใช่ global `ไม่พบข้อมูล`/`No data found` (empty variant ของ module ตาม 00_GLOBAL §11)
8. ~~**`al-fbtn` toggle → label hardcode EN `Following`/`Follow back`**~~ — RESOLVED: label ตามภาษาแอปทุกสถานะ (`ติดตามกลับ`/`กำลังติดตาม` ↔ `Follow back`/`Following`)
9. **`state.notif` toggles ไม่กรองอะไรจริง** — page + persist มีจริง (`fo_notif`) แต่ prototype ไม่มี generation เลยไม่มี code path กรอง — enforcement = contract เท่านั้น (§14)
10. **ไม่มี notification generation** — `ALERTS` seed ตายตัว; like/comment/follow/WA match ใน session ไม่สร้าง row (WA hit = toast simulation ฝั่ง 10)
11. **ไม่มี retention/older-than cleanup** — `Earlier` bucket คงที่
12. **ไม่มี error/loading/offline state ของ feed** — contract เท่านั้น (§12)
13. ~~**Read state ไม่ persist**~~ — RESOLVED: read/dismiss persist ถาวร (contract server-backed; prototype จำลองผ่าน `fo_alstate`)

---

# 10. Permission Rules

## Guest

| Action | Result |
| --- | --- |
| Bottom nav `แจ้งเตือน` | Member Sheet `Join TukDaeng` (gated `[data-navgo="alerts"]`) |
| `.al-fbtn` (Follow back) | Member Sheet (defense-in-depth — unreachable) |
| Alerts feed/rows/settings | ไม่มีทางเข้าถึง |

## Member / New Member

| Action | Result |
| --- | --- |
| เปิด feed + tap row ทุก type | ใช้ได้ (member เห็น seed; `new` เห็น empty state) |
| Mark read / Mark all / dismiss / Follow back | member only (ต้องเข้าถึง feed ก่อน) |
| Notification settings toggles | ผ่าน Settings (member-only entry — canonical 13) |

## Other User

- ไม่มีสิทธิ์เห็น alert feed ของ user อื่น (feed = per-session account scope เสมอ)

---

# 11. Validation Rules

ไม่มี form input ในหน้า feed — validation ที่เหลือคือ routing guard:

| Condition | Rule |
| --- | --- |
| Row `pid` resolve ไม่ได้ (like/comment) | `al_unavail` — unavailable state `รายการนี้ไม่พร้อมใช้งานแล้ว` + `Go back` (00_NAV §10) |
| Row `pid` resolve ไม่ได้ (watch) | `al_unavail` เดียวกัน (parity — resolved deviation #6) |
| `system` tap | placeholder toast — ไม่ navigate |
| Unknown type | contract: ไม่ render เป็น row (unsupported type ต้องไม่เข้า feed — 00_NAV §16) |
| Follow target blocked | `profile:{u}` → keep-page ตาม canonical (ไม่ใช่ error) |

---

# 12. Exception Handling

| Case | Behavior |
| --- | --- |
| Post ของ like/comment row ถูกลบ/หาย | unavailable state `รายการนี้ไม่พร้อมใช้งานแล้ว`/`This post is no longer available` + ปุ่ม `Go back` (`al_unavail` — 00_NAV §10 contract) |
| Post ของ watch row หาย | unavailable state เดียวกัน (`al_unavail` — parity กับ like/comment) |
| Follow target ไม่มีจริง | `profileOf` fabricate profile (06 deviation — `user-not-found` ไม่ reachable); contract: `ไม่พบผู้ใช้งาน` |
| Feed load/render fail | contract: `ไม่สามารถโหลดข้อมูลได้`/`Unable to load data.` + `ลองใหม่` (prototype ไม่มี path) |
| Push/deep link เข้า alerts โดย guest | Member Sheet ก่อนเสมอ (00_NAV §9/§12 contract) |
| Account suspended/banned | clear session → account status state (contract — 00_GLOBAL §12) |

---

# 13. Empty State

| Surface | Copy จริง |
| --- | --- |
| Alerts feed ว่าง (`new`/หลัง dismiss หมด) | `No alerts yet` + `Watch alerts, likes, comments and new followers will show up here.` (TH `ยังไม่มีการแจ้งเตือน` + `การแจ้งเตือนนาฬิกา ยอดถูกใจ ความคิดเห็น และผู้ติดตามใหม่จะแสดงที่นี่`) — `chEmptyHTML` shared กับ 07 |

หมายเหตุ: ไม่ใช้ global `ไม่พบข้อมูล`/`No data found` — variant เฉพาะ module ตาม 00_GLOBAL §11

---

# 14. Notification Rules (Trigger Contract)

Prototype ไม่ generate rows (seed เท่านั้น) — ตารางนี้เป็น production contract ว่า event ใดควรสร้าง alert type ใด:

| Trigger | Recipient | Type | Destination |
| --- | --- | --- | --- |
| User likes post ของฉัน | Post owner (me) | `like` (aggregate `more` เมื่อหลาย user) | Post Viewer โพสต์ตัวเอง |
| User comments บน post ของฉัน | Post owner (me) | `comment` (text excerpt) | Post Viewer โพสต์ตัวเอง |
| User follows ฉัน | Followed user (me) | `follow` (+ Follow back + dismiss) | `profile:{follower}` |
| Watch Alert ON match โพสต์ใหม่ | Alert owner | `watch` (name = `waName`-style label + seller + price) | Post Viewer โพสต์ที่ match ตรง — canonical engine อยู่ 10_WATCH_ALERT |
| Security/session event (new device login ฯลฯ) | Account owner | `system` | placeholder V1 → security surface (future) |

- **Chat / New Message ไม่ใช่ type** — unread badge ในแท็บ `แชท` เท่านั้น (canonical 07 §14)
- Toggle `state.notif[k]` OFF (contract) → หยุดสร้าง/แสดง type ที่ map (`likes`/`comments`/`follows`/`walerts`); `system` ไม่มี toggle (security ห้ามปิด — เหมือนไม่มีใน notif_settings)
- Push notification = transport เสริมเท่านั้น (FCM contract) — in-app feed คือ source of truth
- `Report`/block/unfollow/remove-follower/mute **ไม่แจ้งอีกฝ่าย** (canonical 06 §14)
- Delete account → `system`/ทุก alert หยุดตาม erasure contract (13_SETTINGS — copy `Watch Alerts Cancelled` อยู่ del_account term card)

---

# 15. Analytics Events

(contract — prototype ไม่มี tracking layer; event names เป็นข้อตกลงสำหรับ implement)

| Event | Trigger |
| --- | --- |
| `alerts_opened` | เปิด `alerts` ผ่าน nav tab |
| `alert_opened` | tap `.al-row` (payload: type) |
| `alert_marked_read` | row unread → read |
| `alert_marked_all_read` | `data-alreadall` |
| `alert_dismissed` | `data-aldismiss` (follow rows) |
| `alert_follow_back` | `data-alfollow` toggle on |
| `alert_open_post_viewer` | like/comment/watch → viewer |
| `alert_open_profile` | follow → `profile:{u}` |
| `alert_destination_unavailable` | post missing / fallback |
| `alert_system_placeholder` | `system` row tap (placeholder surface) |
| `alerts_badge_cleared` | unread 0 (mark-all หรือ per-row) |

---

# 16. Acceptance Criteria

## Feed & Anatomy

| AC ID | Criteria |
|---|---|
| AC-NOTI-001 | `alerts` page = `.al-head` (back `data-navgo="feed"` + title `แจ้งเตือน`/`Alerts`) + group sections `วันนี้`/`เมื่อวาน`/`7 วันที่ผ่านมา`/`ก่อนหน้า` ตามลำดับ fix + bottom nav active `alerts` |
| AC-NOTI-002 | Row anatomy ตรงตาราง §9: like=avatar stack+heart badge+thumb, comment=avatar+text+thumb, follow=avatar+`Follow back`+`x`, watch=bell+seller mini+`Watch alert {name} — …` +thumb, system=icon+text |
| AC-NOTI-003 | Like aggregate ต้อง render `{u1}, {u2} และคนอื่น ๆ อีก {n} คน`/`and N others` เมื่อ `more`>0 |
| AC-NOTI-004 | Time label ใช้ `ago` + `formatAlertTime` (TH suffix `นาที`/`ชม.`/`วัน`/`สัปดาห์`) |

## Read / Badge / Actions

| AC ID | Criteria |
|---|---|
| AC-NOTI-005 | Tap row → `unread=false` + `.unread` class หาย + `alBadgeSync` ก่อน navigate เสมอ |
| AC-NOTI-006 | Nav badge = Σunread cap `99+`; sync ทุก nav instance; หายเมื่อ 0 |
| AC-NOTI-007 | `Mark all as read`/`อ่านทั้งหมดแล้ว` อยู่บน section แรกเฉพาะเมื่อ unread>0 → clear ทุก unread + ปุ่มหายหลัง unread=0 |
| AC-NOTI-008 | `x` dismiss (follow row เท่านั้น) → ลบ row ออกจาก list ทันที + re-render — ไม่มี confirm/undo |
| AC-NOTI-009 | `Follow back`/`กำลังติดตาม` → `pfSetFollow` toggle จริง + ปุ่มสลับ label/.on — ไม่ mark read ไม่ navigate |

## Destinations

| AC ID | Criteria |
|---|---|
| AC-NOTI-010 | `like`/`comment` → Post Viewer โพสต์ตัวเอง 1 ใบ (title `Post`, solo header) — ไม่ focus comment; post หาย → unavailable state `รายการนี้ไม่พร้อมใช้งานแล้ว` + `Go back` (`al_unavail`) |
| AC-NOTI-011 | `follow` → `rpPush profile:{users[0]}` push ทับ alerts page |
| AC-NOTI-012 | `watch` → Post Viewer โพสต์ที่ match โดยตรง (title `Post` + seller; ไม่มี Result List; inject `Follow` เมื่อยังไม่ follow) |
| AC-NOTI-013 | `system` → ไม่ navigate (placeholder — prototype toast `Security details aren't in this prototype yet`) |
| AC-NOTI-014 | ไม่มี type/destination อื่น: ไม่มี chat row, offer row, Asset Detail direct, Result List, comment focus |

## Guest / Session

| AC ID | Criteria |
|---|---|
| AC-NOTI-015 | Guest กด tab `แจ้งเตือน` → Member Sheet `Join TukDaeng` — feed ไม่เปิด (tab อยู่ใน `GUEST_GATE_SEL`) |
| AC-NOTI-016 | Session `new`/`guest` → `ALERTS=[]` → `No alerts yet` + desc (new เข้าหน้าได้, guest โดน gate ก่อน) |
| AC-NOTI-017 | `applySessionData` → `ALERTS=null` + `alBadgeSync` — re-init reconcile persisted state: read/dismiss คงอยู่ข้าม session switch (contract server-backed) |
| AC-NOTI-018 | Back `<` บน alerts head → กลับ Feed เสมอ (`data-navgo="feed"` — ไม่ใช่ generic pop) |

## Notification Settings Boundary

| AC ID | Criteria |
|---|---|
| AC-NOTI-019 | `notif_settings` มี toggle ตรง type `likes`/`comments`/`follows`/`walerts` เท่านั้น — default ON; toggle state persist ข้ามเปิดแอปใหม่; page anatomy canonical 13_SETTINGS |
| AC-NOTI-020 | Toggle OFF (contract) ต้องหยุด type ที่ map; `system` ไม่มี toggle; rows เดิมไม่ถูกลบเมื่อปิด — prototype ไม่มี generation เลยไม่กรองจริง (documented deviation) |

## Guard

| AC ID | Criteria |
|---|---|
| AC-NOTI-021 | Type นอกชุด `like/comment/follow/watch/system` ต้องไม่ render เป็น row (Market Update/Sale Success/Moderation/Account Action/Chat = ไม่มีใน V1) |
| AC-NOTI-022 | Chat ไม่ใช่ alert type — ไม่มี row/chat destination ใน feed (canonical 07 §14 badge-only) |

---

# 17. Related Modules

- [00_GLOBAL_RULES_MODULE.md](00_GLOBAL_RULES_MODULE.md) — session §7, gate §11, block §13, private §14
- [00_NAVIGATION_AND_CROSS_MODULE_FLOW.md](00_NAVIGATION_AND_CROSS_MODULE_FLOW.md) — nav/badge §6.3, routes §6.6, entry matrix §7, **destination matrix §8 (canonical)**, gate routing §9, unavailable §10
- [02_FEED_MODULE.md](02_FEED_MODULE.md) — post model + `pfTabPosts`/`POSTS` canonical
- [03_SEARCH_FILTER_MODULE.md](03_SEARCH_FILTER_MODULE.md) — Post Viewer (`openPostViewer`) canonical
- [06_PROFILE_MODULE.md](06_PROFILE_MODULE.md) — `profile:{u}` + `pfSetFollow`/`pfIsFollowed` + follow semantics (FSP-019 lock)
- [07_CHAT_MODULE.md](07_CHAT_MODULE.md) — chat badge-only canonical (FSP-020 lock)
- [10_WATCH_ALERT_MODULE.md](10_WATCH_ALERT_MODULE.md) — `watch` alert engine + `_waHits` simulation canonical (FSP-021)
- [13_SETTINGS_MODULE.md](13_SETTINGS_MODULE.md) — `notif_settings` page + library section + delete-account erasure copy canonical
- [15_TRUST_SAFETY_MODULE.md](15_TRUST_SAFETY_MODULE.md) — block/report impact on destinations

---

# 18. Future Enhancement

- `system` destination surface (security/account activity page) + event types เพิ่มเติมตาม master decision
- Notification generation pipeline (real triggers → rows; server-side feed)
- Push notification (FCM) + deep link → destination matrix (00_NAV §12 contract)
- Toggle enforcement จริง (`state.notif` → generation/filtering) — persist ทำแล้ว
- Retention/aging policy จริง (bucket จาก timestamp ไม่ใช่ `grp` field) + pagination/older-than
- Per-row mark unread (undo read)
- Dismiss สำหรับ type อื่น + bulk dismiss
- Comment focus/deep-scroll ใน Post Viewer (ถ้าเพิ่ม affordance)
- Preference center เพิ่มเติม (digest, quiet hours, per-channel)
