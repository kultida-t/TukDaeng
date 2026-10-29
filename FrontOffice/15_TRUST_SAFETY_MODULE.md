# 15 Trust & Safety Module

อ้างอิงหลักจาก [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md) + baseline [00_GLOBAL_RULES_MODULE.md](00_GLOBAL_RULES_MODULE.md) §7 (session model), §11 (guest gate = Member Sheet `Join TukDaeng`), §13 (block/report impact) + [00_NAVIGATION_AND_CROSS_MODULE_FLOW.md](00_NAVIGATION_AND_CROSS_MODULE_FLOW.md) §6.1 (canonical destination terms — Report Stack), §6.2 (layer model), §6.6 (sub-page route map `report:*`), §6.7 (in-app back — `sub-x` ปิดทั้งกอง), §9 (gate routing), §10 (unavailable fallback) + [06_PROFILE_MODULE.md](06_PROFILE_MODULE.md) (canonical shared surfaces `blkSheetHTML`/`unblockDlgHTML`/`pfSetBlocked`/`pfRestrictHint` + keep-page S-13 — FSP-019 lock) + [07_CHAT_MODULE.md](07_CHAT_MODULE.md) (`chatReportSheet`/`rpFromChat`/`rpDelChat` + `th.blocked` room effects — FSP-020 lock) + [11_SOCIAL_MODULE.md](11_SOCIAL_MODULE.md) (comment popover + `uc-report` entry + `Blocked and hidden comments`) + [12_BOARD_MODULE.md](12_BOARD_MODULE.md) §13 (Report Board Content contract — S-04) — prototype `Prototypes/fo-flow/index.html` เป็น source of truth เดียวของพฤติกรรม (FO-PRD-v1.9)

---

# 1. Document Information

| Field | Detail |
| --- | --- |
| Module Name | Trust & Safety — report stack + shared block/unblock surfaces + moderation handoff |
| Version | 1.9 (FO-PRD-v1.9 spec-sync FSP-031) |
| Status | Functional PRD — synced to fo-flow prototype |
| Owner | Tuk Daeng Project |
| Document Type | Front Office Functional PRD |
| Source of Truth | `Prototypes/fo-flow/index.html` (พฤติกรรม) + Master Product Definition (business intent) |

> spec เดิม (v1.0) เป็น contract-level: report = per-type forms/bottom sheet + ชุดเหตุผลแยกตาม type + confirmation `Block this user?` center dialog + success copy `Report submitted` / `Our team will review…` — prototype คือ IG-style full-page report stack (`report:pick` → `PM_REASONS` → `report:done` + step rows) + shared `blkSheet`/`unblockDlg`/`chatReportSheet` ที่ใช้ร่วมหลายจอ; เอกสารฉบับนี้เขียนตามพฤติกรรมจริงและ flag ทุก deviation ใน §20

---

# 2. Objective

Trust & Safety Module คุม report/block mechanics ทั้งหมดของ Front Office — report stack แบบ full-page multi-step (canonical 00_NAV §6.1/§6.6), shared block/unblock/mute surfaces (canonical 06_PROFILE), report entry ทุก surface (post / profile / comment / chat / board), guest gate ด้วย Member Sheet, block impact ข้ามทุก surface, legal access/consent, Apple compliance และ moderation handoff ไป Back Office

หลักสำคัญของ V1 คือ Report ไม่ทำให้ content หายทันที ส่วน content จะหายเมื่อ Admin ดำเนินการตาม moderation เท่านั้น — และ report ทุกเส้นทางจบที่ `report:done` + toast `Report submitted · thanks for letting us know`

---

# 3. Prototype Reference

Source of truth: `Prototypes/fo-flow/index.html` (read-only — ห้ามแก้) — line anchors คือ state ปัจจุบัน @ HEAD อาจ drift ให้ค้นด้วย function-name

- Reasons: `PM_REASONS`/`PM_REASONS_TH` (~14108–14129 — 9 เหตุผลชุดเดียวทุก report type/page)
- Report stack plumbing: `rpOpenFromPost` (~15110 — post `...` entry; pv-open → `rp-over` mode ทับ post viewer), `rpPush` (~15121 — push + slide restart), `pmDropCovered` (~15128 — snap sheet shut เมื่อถูก report page ครอบ), `rpBack` (~15137 — pop ทีละหน้า ghost slide-out-right), `rpClose` (~15155 — ปิดทั้งกอง + `hadDone && rpDelChat` → `t.hidden` + ออกจาก `C.threads` + strip `chmenu:`/`chatroom:` + unshift `chat`)
- Report pages (`subHTML` ~17749–17809): reason pages `report`/`report:user`/`report:post`/`report:comment` (~17750), picker `report:pick:{u}` (~17763), done page `report:done:{u}` (~17778 — `rp-step` rows + green check), post picker `report:posts:{u}` (~17800 — `rp-tile` grid + `Next`)
- Shared surfaces: `blkSheetHTML(u, fromChat)` (~16929), `chatReportSheetHTML(u, tid)` (~16946), `unblockDlgHTML` (~16959), `muteDlgHTML` (~14950), `pfRestrictHint` (~17310 — wire หลัง `dlg-unblock-go` แล้ว + I18N_TH)
- Block engine: `pfSetBlocked`/`pfIsBlocked`/`pfSetMuted`/`pfIsMuted` (~16894–16926 — `PF_BLOCKED`+`PF_REMOVED_FOL`+unfollow+`th.blocked` ทุก thread+`p.blocked` ทุกโพสต์+feed re-render)
- Entries/handlers: post `...` menu `pmMenuHTML` (~14131 — `pm-go-report` row), `pm-go-report` handler (~20813), `uc-report` uncomf card (~14218 + handler ~20863), `pf-sh-report`/`pf-sh-block` (~21746/21770/21780), `blk-rep` Block-and-report (~21827), `blk-go` (~21837 — `Blocking` transient / `Blocked and hidden comments`), `dlg-unblock-go` (~20926 — `Unblocked`), `dlg-mute-go` (~20914 — `Muted` + done-step green check), `rp-step`/`rp-next`/`rp-done` (~21865–21889), `ch-rep-del-btn`/`ch-rep-only-btn` (~21796–21810 — set `rpFromChat`/`rpDelChat`), comment popover (~13746–13772 — own: Delete; others: Block + Report; guest → `obGate` ~22804)
- Guest gate: `GUEST_GATE_SEL` (~23362–23371) + first-line gate check (~20395 → `obGate()` Member Sheet ก่อน handler ใด ๆ)
- Entries ที่เป็น surface ของ module อื่น: post `...` (canonical 02/05/06/11), profile `...` (`pf-more`/`pf-sh-*` canonical 06), `chmenu` (canonical 07), comment long-press popover (canonical 11), board `data-bdmore`/`data-bdact='report'` (**dead** — contract-only 12 §13/§19 D4)

---

# 4. Master Alignment Summary

| Topic | Master Baseline | Trust & Safety Module Rule (ตาม prototype) |
| --- | --- | --- |
| Admin Scope | Admin ใช้งานผ่าน Back Office เท่านั้น | Front Office ส่ง report; Back Office review/moderation — ตรง |
| Report SLA | Admin ดำเนินการภายใน 24 ชั่วโมงสำหรับ Report ที่เข้ามา | PRD ระบุ 24h review SLA (contract — prototype ไม่ครอบ) |
| Report UI | Report flow = IG-style full-page multi-step stack (D9) | report ทุก type ใช้ sub-page stack ไม่ใช่ bottom-sheet form ของ spec เดิม (D1) |
| Block Confirm | Block ผ่าน shared confirmation surface | `blkSheet` bottom sheet `Block {u}?` + `Block`/`Block and report` (fromChat = `Block` เดียว) — **ไม่ใช่** `Block this user?` center dialog + Cancel (D2) |
| Block Impact | Asset ของผู้ถูก Block หายจาก Feed, Search, Watch Alert Result | `p.blocked` filter ทุกโพสต์ + `th.blocked` ทุก thread + unfollow + `PF_REMOVED_FOL` — ครบตาม §12 |
| Following Impact | ความสัมพันธ์ Follow ระหว่างกันต้องไม่ถูกใช้ในการแสดง Following Feed | `pfSetBlocked` บังคับ unfollow ทั้งสองทิศ + unblock ไม่ re-follow |
| Report Types | Asset, User, Comment, Board Content | post report = type `Asset (post)`; Board Content = contract-only (S-04 — `data-bdmore` dead) |
| Report Impact | Report ไม่ทำให้ Asset หายจาก Feed ทันที | report สำเร็จ → `report:done` + toast เท่านั้น — content/profile คงเปิดได้ปกติ |
| Moderation Impact | Asset หรือ Content จะหายเมื่อ Admin ดำเนินการตาม Moderation เท่านั้น | Content removal เป็น Admin action (contract) |
| Guest Report/Block | login-required | ทุก report/block entry อยู่ใน `GUEST_GATE_SEL` → Member Sheet `Join TukDaeng` |
| Apple Compliance | Report, Block, Terms of Use, Privacy Policy, Moderation Flow | มีครบใน app |
| Legal Consent | ทุกช่องทางสมัครต้องยอมรับ Terms of Use และ Privacy Policy ก่อนสมัคร | Sign Up ทุกช่องทางต้องมี consent (canonical 01) |
| Legal Access | Settings รองรับ Privacy Policy และ Terms of Use | routes `privacy`/`terms` ใน settings (canonical 13) |

---

# 5. Scope

## In Scope

- Report post (`report` page — post `...` menu + uncomfortable ack card entries)
- Report user (`report:pick:{u}` → `report:user` หรือ `report:posts:{u}` → `report:post`)
- Report comment (`report:comment` — X-only page)
- Report from chat (`chatReportSheet` → `report:user` direct + `Report and delete` teardown)
- `report:done:{u}` thanks page + other-steps rows (Block/Unblock/Unfollow/Mute/Unmute)
- Block User ผ่าน shared `blkSheet` (ทุก entry: profile `...`, comment popover, chmenu, report:done step, `Block and report`)
- Unblock ผ่าน shared `unblockDlg` (ทุก entry: keep-page, `...` label, Settings blocked list, chat bar/menu, report:done step)
- Block impact ข้ามทุก surface (feed/search/WA/following/chat/comments/profile keep-page)
- Guest gate = Member Sheet `Join TukDaeng` ทุก report/block entry
- Report success state (`report:done` + toast `Report submitted · thanks for letting us know`)
- Terms of Use / Privacy Policy access + Sign Up consent
- Back Office moderation handoff + 24-hour report review SLA (contract)
- Apple compliance coverage

## Out of Scope For V1 Unless Master Adds Decision

- Report Board Content live entry (contract-only — `data-bdmore` dead, 12 §13/§19 D4)
- Appeal Ban
- Report tracking for reporter
- Trust score / Reputation score
- Automated moderation / AI content detection
- Moderation notifications in Front Office
- Restrict feature (`pfRestrictHint` banner แสดงจริงหลัง unblock เป็น hint เท่านั้น — ไม่มี restrict flow)
- Message-level report (report `report:done` ไม่มี message steps — IG มี แต่ TukDaeng ตัด)

---

# 6. Report Stack & Route Mapping

Report stack = `.page-sub` + `rp-over` layer (canonical 00_NAV §6.1/§6.2) — report pages เลื่อนขึ้น/ผลัดทับ stack ปกติ รวม post viewer; `✕` (`sub-x`/`rpClose`) ปิดทั้งกองในครั้งเดียวคงหน้าที่เปิด report ไว้, `<` (`sub-back`/`rpBack`) pop ทีละหน้า slide ออกขวา

| Route | Page | Head | Body |
| --- | --- | --- | --- |
| `report` | Post reason page (entry ตรงจาก post `...` / uncomf card) | title `Report` + `✕` — **ไม่มี `<`** | `Why are you reporting this post?` + anonymous disclaimer + `PM_REASONS` rows |
| `report:pick:{u}` | Type picker (profile `...` / `Block and report`) | title `Report` + `✕` — **ไม่มี `<`** | `What do you want to report?` + options `A specific post` / `Something about this account` |
| `report:posts:{u}` | Post grid picker | `<` + title `Select a post` + `✕` | `rp-tile` grid ของ `pfTabPosts(u,"all")` — เลือกทีละ 1 ใบ + `Next` (disabled จนเลือก) → `report:post` |
| `report:post` | Post reason page (ผ่าน picker) | `<` + `✕` | `Why are you reporting this post?` + `PM_REASONS` |
| `report:user` | User reason page | `<` + `✕` — **`rpFromChat` → `✕` เท่านั้น** | `Why are you reporting this account?` + `PM_REASONS` |
| `report:comment` | Comment reason page | title `Report` + `✕` — **ไม่มี `<`** | `Why are you reporting this comment?` + `PM_REASONS` |
| `report:done:{u}` | Thanks + other steps | `<` + `✕` — **`rpFromChat` → `✕` เท่านั้น** | `Thanks for your feedback` + `Other steps you can take` + `rp-step` rows + `Done` |

Anonymous disclaimer เหมือนกันทุก reason/pick page: `Your report is anonymous. If someone is in immediate danger, call the local emergency services - don't wait.` (TH: `การรายงานของคุณจะไม่เปิดเผยตัวตน หากมีคนตกอยู่ในอันตรายทันที โปรดโทรติดต่อบริการฉุกเฉินในพื้นที่`)

## Report Reason Set (`PM_REASONS` — canonical ชุดเดียวทุก type)

| # | EN | TH |
| --- | --- | --- |
| 1 | I just don't like it | ฉันแค่ไม่ชอบ |
| 2 | Bullying or unwanted contact | การกลั่นแกล้งหรือการติดต่อที่ไม่พึงประสงค์ |
| 3 | Suicide, self-injury or eating disorders | การฆ่าตัวตาย ทำร้ายตัวเอง หรือพฤติกรรมการกินที่ผิดปกติ |
| 4 | Violence, hate or exploitation | ความรุนแรง ความเกลียดชัง หรือการแสวงหาประโยชน์ |
| 5 | Counterfeit or replica item | สินค้าลอกเลียนแบบหรือของปลอม |
| 6 | Nudity or sexual activity | ภาพเปลือยหรือกิจกรรมทางเพศ |
| 7 | Scam, fraud or spam | การหลอกลวง การฉ้อโกง หรือสแปม |
| 8 | False information | ข้อมูลเท็จ |
| 9 | Intellectual property | ทรัพย์สินทางปัญญา |

- Reason rows เป็น nav buttons (`pm-reason` + chevron) — **การแตะเหตุผลคือการ submit ในตัว** → push ไป `report:done:{u}` ทันที ไม่มีปุ่ม Submit/Next แยกบนหน้าเหตุผล
- `report:done` success copy: `Thanks for your feedback` + `We use these reports to show you less of this kind of content in the future.`
- ปิดกองด้วย `Done`/`✕` → toast `Report submitted · thanks for letting us know` (TH/EN ใช้ string เดียว)
- Report Board Content ใช้ reason sheet + success copy ของ contract แยก (12 §13 — spec-only จนกว่า entry implement; reason set ต่างจาก `PM_REASONS` เป็น contract copy)

---

# 7. User States

## Guest (session `guest`)

- ดู Terms of Use และ Privacy Policy ได้
- ใช้ Report หรือ Block ไม่ได้ — ทุก report/block entry อยู่ใน `GUEST_GATE_SEL` → Member Sheet `Join TukDaeng` ตาม global rule (00_GLOBAL §11)

## Member (session `member`/`new`)

- Block User ได้ทุก entry
- Report post / user / comment ได้ผ่าน report stack; Report Board Content = contract-only
- เปิด Terms of Use และ Privacy Policy ได้

## Reported User

- ยังใช้งานได้จนกว่า Admin จะดำเนินการ
- ไม่เห็นว่าใครเป็นผู้รายงาน (report = anonymous ตาม disclaimer)
- ไม่ได้รับ notification เมื่อถูก report/block/unblock (`They won't be notified…` ใน `blkSheet`/`unblockDlg` copy)

## Admin

- ตรวจสอบ Report และดำเนินการ moderation ผ่าน Back Office
- ต้องดำเนินการภายใน 24 ชั่วโมงสำหรับ Report ที่เข้ามา (contract)

## Suspended / Banned User

- ต้องถูก block จาก authenticated app access ตาม Authentication rule (contract S-29)
- ต้องเห็น account status state พร้อมเหตุผล ระยะเวลาถ้ามี และช่องทางติดต่อ Support ตาม Authentication rule
- V1 ไม่มี `Restricted` หรือ feature-level restriction จาก Trust & Safety; report threshold จะยกระดับ queue/review หรือทำให้เกิด `Suspended`/`Banned` ตาม BO policy เท่านั้น
- รายละเอียด appeal เป็น future

---

# 8. Report / Block Entry Point Matrix

| Surface | Entry | เปิดอะไร | Route / Sheet | หมายเหตุ |
| --- | --- | --- | --- | --- |
| Feed card / post viewer rail / Post Detail / profile grid tile (โพสต์คนอื่น) | `...` → `Report` (`pm-go-report`) | report stack | `report` (post reasons — ไม่ผ่าน pick) | pv-open → `rp-over` mode ทับ viewer; sheet snap shut ด้วย `pmDropCovered` |
| Not-interested card → uncomfortable ack card | `uc-report` (`Report` บน uncomf card) | report stack | `report` | `ni-uncomf` swap การ์ดเป็น ack state ก่อน (canonical 11/02) |
| Public Profile `...` (`pf-more` sheet) | `Report` (`pf-sh-report`) | report stack | `report:pick:{u}` | `pg-up` slide-up ทับ sheet → branch post/user |
| Comment (long-press บน comment ของคนอื่น) | `Report` (`c-pop-item[data-act="report"]`) | report stack | `report:comment` | X-only page; sets `rpTargetType="comment"` + `rpPid`/`rpCid` |
| Chat room `≡` → `chmenu` | `Report` (`report-chat-user` circle) | `chatReportSheet` bottom sheet | → `report:user` (ข้าม `report:pick`, ไม่มี `<`) | 2 path: `Report` / `Report and delete` — canonical 07 |
| `blkSheet` (ทุก entry ยกเว้น fromChat) | `Block and report` (`blk-rep`) | block ก่อน → report stack | `report:pick:{u}` | `pfSetBlocked(true)` ก่อน แล้ว `rpPush` picker |
| Profile `...` / comment popover / `chmenu` / `report:done` step | `Block` / `Unblock` | `blkSheet` / `unblockDlg` | shared surfaces §9 | label toggle ตาม `pfIsBlocked` |
| Blocked keep-page / Settings `blocked` list / chat `ch-blocked-bar` | `Unblock` (`pf-unblock`/`m-unblock`/`unblock-room`) | `unblockDlg` center dlg | shared surface §9 | canonical 06/13/07 |
| Board Article Detail | `Report article` | — | **contract-only** (S-04 — `data-bdmore` dead, ไม่มี live entry) | 12 §13/§19 D4 |

ทุก entry ในตารางอยู่ใน `GUEST_GATE_SEL` → guest กด → Member Sheet ก่อน handler ทำงาน (§13)

---

# 9. Shared Surfaces (canonical 06_PROFILE — ใช้ร่วมหลายจอ)

## `blkSheet` — Block confirmation (bottom sheet `.comment-sheet` `pm-open`)

- Anatomy: drag handle + centered avatar + `Block {u}?` + `This will also block any other profiles they may have or create in the future.` + 3 impact rows:
  1. `They won't be able to message you or find your profile or content on TukDaeng.`
  2. `They won't be notified that you blocked or reported them.`
  3. `You can unblock them anytime in Settings.`
- Actions: `Block` + `Block and report` — **`fromChat` variant = `Block` เดียว** (chat entry + report:done step เมื่อ `rpFromChat`)
- **ไม่มี Cancel row** — dismiss ผ่าน backdrop tap เท่านั้น
- `Block` → `pfSetBlocked(true)`: `PF_BLOCKED` + `PF_REMOVED_FOL` + unfollow ทั้งสองทิศ + `th.blocked` ทุก thread ของ user + `p.blocked` ทุกโพสต์ + feed re-render → re-render `profile:`/`report:done:`/`chmenu:`/`chatroom:` ถ้าอยู่บน top → toast `Blocking` (transient) — entry จาก comment context → toast `Blocked and hidden comments` แทน (comments ของ user นั้นซ่อน ไม่ลบ; unblock แล้วกลับมา)
- `Block and report` (`blk-rep`) = `pfSetBlocked(true)` ก่อน แล้ว `rpPush report:pick:{u}` (มีเฉพาะ variant ที่ไม่ใช่ fromChat)

## `unblockDlg` — Unblock confirmation (center dialog `.dlg`)

- `Unblock {u}?` + `{u} and other profiles they may have or create will now be able to request to follow and message you on TukDaeng. They won't be notified that you unblocked them.` + `Unblock` (danger) + `Cancel`
- `Unblock` → `pfSetBlocked(false)` → toast `Unblocked` + re-render — **ไม่ re-follow เสมอ**; ฝั่งถูก unblock ไม่ถูกแจ้ง
- restrict-hint banner (`pfRestrictHint` ~6s, tap dismiss, `Learn more` dead) เป็น canonical 06 contract — wire หลัง `dlg-unblock-go` แล้ว (มี I18N_TH)
- ประวัติแชทคงอ่านได้ read-only ทั้งก่อนและหลัง unblock; block/unblock ไม่ลบ thread

## `chatReportSheet` — Chat report confirmation (bottom sheet, canonical 07)

- Layout เดียวกับ blkSheet: avatar + `Are you sure you want to report {u}?` + `If this user appears suspicious, please report them. Selecting "Report and delete" will delete this chat and its associated history.`
- Actions: `Report and delete` (danger) + `Report` + `Cancel` (ปิด sheet อยู่หน้าเดิม)
- ทั้งสองปุ่ม → `rpFromChat=true` + `rpPush report:user` — **ข้าม `report:pick` เสมอ** (user-report ตรง); `Report and delete` เพิ่ม `rpDelChat=tid`

## `muteDlg` — Mute confirmation (center dialog — ใช้โดย report:done step + mute entries ของ 06/11)

- `Mute {u}?` + `You can unmute them anytime from their profile. We won't let them know you muted them.` + `Mute posts` (danger) + `Cancel` → `Muted` toast

## Report/Block Success States

| Action | Success Feedback |
| --- | --- |
| Report (ทุก type) | `report:done` page (`Thanks for your feedback` + steps) → `Done`/`✕` → toast `Report submitted · thanks for letting us know` |
| Block | transient toast `Blocking` (จาก comment context: `Blocked and hidden comments`) |
| Unblock | toast `Unblocked` + restrict-hint banner ~6s (contract 06 — wire แล้ว §20 D6) |
| Mute (done step) | `Muted` toast + step green check |
| Unfollow (done step) | `Unfollowed` toast + step green check |
| Unmute (done step) | `Unmuted` toast + step กลับเป็น `Mute` |

---

# 10. User Flows

## Report Post Flow (post `...` / uncomf card)

```text
post "..." menu (feed / post viewer / detail / grid tile)
-> Report (pm-go-report) -> pmDropCovered + rpOpenFromPost
-> "report" page (X only) : Why are you reporting this post? + PM_REASONS
-> แตะเหตุผล = submit -> rpPush report:done:{u}
-> Other steps (Block/Unblock/Unfollow/Mute) หรือ Done/✕
-> rpClose + toast "Report submitted · thanks for letting us know"
-> โพสต์ยังแสดงปกติ — รอ Admin moderation
```

## Report User Flow (profile `...` / Block and report)

```text
profile "..." -> Report (pf-sh-report)
-> report:pick:{u} (pg-up เลื่อนขึ้นทับ sheet; X only)
   -> "A specific post" -> report:posts:{u} (tile grid เลือกทีละใบ -> Next) -> report:post
   -> "Something about this account" -> report:user
-> เหตุผล PM_REASONS -> report:done:{u}
-> Done/✕ -> rpClose + toast — profile ที่ถูก report ยังเปิดได้ปกติ
```

## Report Comment Flow

```text
long-press comment ของคนอื่น -> popover -> Report
-> report:comment (X only, ไม่มี <)
-> เหตุผล PM_REASONS -> report:done:{u} (มี `<` ย้อนได้ เหมือน type อื่น)
-> Done/✕ -> rpClose + toast
```

## Report From Chat Flow

```text
chmenu -> Report (report-chat-user) -> chatReportSheet
   -> "Report"            -> report:user (rpFromChat — ไม่มี <)
   -> "Report and delete" -> report:user เดียวกัน + rpDelChat=tid
-> เหตุผล PM_REASONS -> report:done:{u} (ไม่มี <)
-> Done/✕ -> rpClose + toast
   -> rpDelChat: thread t.hidden + ออกจาก actor's list + strip chmenu:/chatroom: -> กลับ Chat List
   -> Report ธรรมดา: กลับหน้าที่เปิด report (chmenu:/chatroom:)
```

## Block User Flow

```text
profile "..." / comment popover / chmenu / report:done step
-> blkSheet (fromChat variant เมื่อมาจาก chat)
-> "Block" -> pfSetBlocked(true) -> impact ทุก surface + toast "Blocking"
-> "Block and report" (ไม่ใช่ fromChat) -> block ก่อน -> report:pick:{u}
```

## Unblock User Flow

```text
keep-page Unblock / "..." label / Settings blocked list / chat bar+menu / report:done step
-> unblockDlg (Unblock danger / Cancel)
-> "Unblock" -> pfSetBlocked(false) -> toast "Unblocked" (+ restrict-hint contract)
-> ไม่ re-follow — ฝั่งถูก unblock ไม่ถูกแจ้ง
```

## Legal Consent Flow

```text
Sign Up -> Accept Terms of Use and Privacy Policy -> Continue registration
```

---

# 11. User Flow State After Report/Block

- Report สำเร็จ **ไม่เปลี่ยน visibility อะไรเลย** — post/profile/comment ที่ถูก report เปิดได้ปกติทั้งฝั่ง reporter และ reported party (D5)
- Block สำเร็จ apply effects ทันทีตาม §12 Block User Rule ทุก surface ที่ render อยู่ (feed re-render + sub-stack top re-render)
- `report:done` steps เป็น optional follow-up — กด/ไม่กดก็ไม่เปลี่ยนสถานะ report ที่ submit ไปแล้ว (submit เกิดตอนเลือกเหตุผล)

---

# 12. Business Rules

## Report Stack Rule

- Report ทุก live type ใช้ `.page-sub` report stack เท่านั้น — ห้าม bottom-sheet form / center dialog form (D1/D9 master)
- `✕` (`sub-x`/`rpClose`) ปิด report stack ทั้งกองในครั้งเดียว คงหน้าที่เปิด report ไว้เสมอ
- `<` (`rpBack`) pop ทีละหน้า — แสดงเฉพาะหน้าที่มาจากการ push ต่อ (`report:posts`/`report:post`/`report:user`/`report:done` ยกเว้น `rpFromChat`)
- Mid-flow dismiss (X, `<` จนหมดกอง, backdrop, system back) ต้องไม่สร้าง report
- Report page ที่เปิดทับ post viewer ต้องใช้ `rp-over` mode — viewer อยู่ข้างล่างและกลับมาเมื่อกองปิด
- `report` reason page (จาก post `...`/uncomf) ต้อง set `rpUser` = seller ของโพสต์เพื่อให้ `report:done` step rows ผูกกับเจ้าของโพสต์

## Report Reason Rule

- Reason pages ทุกหน้าใช้ `PM_REASONS` (9 เหตุผล ตาราง §6) ชุดเดียว — ไม่มีชุดเหตุผลแยกตาม type ใน live stack (D3)
- การแตะ reason row = submit report ในตัว → ไป `report:done:{u}` — ไม่มี Submit button/Additional details field บน live stack (D3)
- `report:posts:{u}`: `Next` disabled จนกว่าเลือก tile; เลือกได้ทีละ 1 ใบเสมอ (เลือกใหม่แทนที่เดิม)

## `report:done` Steps Rule

- Step rows มีเฉพาะ action ที่มีจริงใน app: `Block`/`Unblock`, `Unfollow` (เฉพาะเมื่อ following), `Mute`/`Unmute` — ไม่มี Restrict / message steps
- `Block` step → `blkSheet` (`fromChat` variant เมื่อ `rpFromChat`); `Unblock` step → `unblockDlg`; `Unfollow`/`Unmute` = instant + toast; `Mute` → `muteDlg`
- Step ที่ทำสำเร็จ → disabled + green check คงแถวไว้ (IG pattern); step ที่ไม่เกี่ยว (ไม่ได้ follow) ไม่ render
- `Done`/`✕` → `rpClose` + toast `Report submitted · thanks for letting us know` เสมอ — toast เดียวกันทุก report type

## Report Type Rule

Report รองรับ type ต่อไปนี้ตาม master (QA-TS-008):

| Type | Live route | สถานะ |
| --- | --- | --- |
| Asset (post) | `report` / `report:post` | live |
| User | `report:user` (ผ่าน `report:pick` หรือ chat) | live |
| Comment | `report:comment` | live |
| Board Content | — | contract-only (S-04 — `data-bdmore` dead, 12 §13/§19 D4) |

## Report Impact Rule

- Submit Report (เลือกเหตุผล) แล้วต้องแสดง `report:done` success state
- Report ไม่ทำให้ Asset/Post/Comment หายทันที; Report User ไม่ทำให้ profile/content หายทันที
- ผู้ถูก report ไม่เห็นตัวตนของ reporter (anonymous disclaimer บนทุก reason page)
- Asset หรือ Content จะหายเมื่อ Admin ดำเนินการตาม Moderation เท่านั้น
- Report Submitted ไม่สร้าง Alerts feed item ใน Front Office V1
- `Report and delete` (chat) = remove-from-actor-list เท่านั้น — ห้ามเขียนเป็น server-side delete; retention/moderation เป็น contract (canonical 07 §18)

## Block User Rule

- Member สามารถ Block User ได้จากทุก entry ใน §8
- Block confirmation = shared `blkSheet` เท่านั้น (§9) — ห้าม `Block this user?` center dialog (D2)
- Backdrop dismiss ต้องไม่ apply block
- เมื่อ block แล้ว content ของผู้ถูก block ต้องหายจาก Feed, Search surfaces, Watch Alert matching (`p.blocked` ทุกโพสต์)
- ความสัมพันธ์ Follow ระหว่างกันต้องไม่ถูกใช้ในการแสดง Following Feed — `pfSetBlocked` บังคับ unfollow + `PF_REMOVED_FOL`
- Threads ทั้งหมดของ user นั้น → `th.blocked`: ประวัติอ่านได้ read-only + `Blocked` chip + `ch-blocked-bar` + `chSend` guard `Cannot message a blocked account` — block ไม่ลบ thread และปิดการสร้าง chat ใหม่ระหว่างคู่ที่ block กัน (canonical 07)
- Comments ของผู้ถูก block ซ่อนจาก comment sheet (`Blocked and hidden comments`) — ซ่อนไม่ลบ; unblock แล้วกลับมา
- Profile ของผู้ถูก block = IG keep-page (S-13): masked stats `0 posts`/`−`/`−`, grid `No posts yet`, `Unblock` primary — canonical 06
- Existing notification/deep link ที่เปิดไปยัง blocked content ต้องไม่เปิด content ที่ user ไม่มีสิทธิ์เห็น (contract 00_NAV §10)

## Unblock User Rule

- Unblock ทุก entry ผ่าน shared `unblockDlg` เท่านั้น — confirm `Unblock` danger / `Cancel`
- `pfSetBlocked(false)` ต้องไม่ re-follow — user ต้อง follow ใหม่เองถ้าต้องการ
- ฝั่งถูก unblock ต้องไม่ถูกแจ้ง
- หลัง unblock: visibility/messaging กลับตาม normal permission; comments ที่ซ่อนกลับมาแสดง

## Chat Block Rule

- Master ระบุว่า Chat รองรับ Block User และ Report User — chat entry ใช้ `blkSheet` fromChat variant (`Block` เดียว) และ `chatReportSheet` → `report:user` ตรง (canonical 07)
- หลัง Block ต้องปิดการส่งข้อความใหม่และการสร้าง Chat ใหม่ระหว่างคู่ที่ block กัน; chat history อ่านได้แบบ read-only — Master §Block User + 07_CHAT explicit แล้วเป็น canonical

## Removed Content Rule

- Content ที่ถูกลบโดย Admin ต้องไม่แสดงเป็น content ปกติ (contract)
- หากต้องแสดง placeholder ให้ใช้ข้อความ removed/unavailable ตาม 00_NAV §10

## Moderation Rule

- Admin ตรวจสอบ Report ผ่าน Back Office
- Admin ต้องดำเนินการภายใน 24 ชั่วโมงสำหรับ Report ที่เข้ามา (contract)
- Admin สามารถจัดการ User / Asset / Board Content ตาม policy
- Admin action ต้องมี Audit Trail ใน Back Office ตาม security baseline (contract)

## Apple Compliance Rule

ระบบต้องรองรับ: Report, Block, Terms of Use, Privacy Policy, Moderation Flow

## Legal Consent Rule

- ทุกช่องทาง Sign Up ต้องยอมรับ Terms of Use และ Privacy Policy ก่อนสมัคร (canonical 01)
- ใช้ label `Terms of Use` เป็น canonical label
- Privacy Policy และ Terms of Use ต้องเข้าถึงได้จาก Settings (routes `privacy`/`terms` — canonical 13)

---

# 13. Guest Gate (Trust & Safety subset ของ `GUEST_GATE_SEL`)

| Gated → Member Sheet `Join TukDaeng` (gate ทำงานก่อน handler) | Not gated |
| --- | --- |
| `.post-head .more`, `.pm-btn` (post `...` — guest เห็น sheet เลยไม่ได้ด้วยซ้ำ) | อ่าน Terms of Use / Privacy Policy |
| `.pm-go-report`, `.rp-opt`, `.pm-reason`, `.uc-report` | browse post/profile/comment/board |
| `.pf-more`, `.pf-sh-report`, `.pf-sh-block`, `.pf-unblock` | |
| `.blk-rep`, `.blk-go`, `.ch-rep-del-btn`, `.ch-rep-only-btn` | |
| `.ni-mute`, `.ni-unfollow`, comment popover items (guest → `obGate` ก่อน act) | |
| `[data-bdact='report']` (dead entry — gate list ยังคุมไว้) | |

- Gate = Member Sheet `Join TukDaeng` (canonical 00_GLOBAL §11) — ไม่ใช่ "Global Login Required Dialog" ของ spec เดิม
- หลัง sign-in สำเร็จจาก gate, surface คงอยู่ — user ต้องกด action ใหม่ (ไม่มี pending-action resume)

---

# 14. Permission Rules

| Actor | Permission |
| --- | --- |
| Guest | ดู Terms / Privacy ได้; Block/Report ไม่ได้ (ทุก entry → Member Sheet) |
| Member | Block/Unblock/Mute และ Report post/user/comment ได้; Report Board Content = contract-only |
| Reported/Blocked User | ไม่เห็น reporter identity; ไม่ถูกแจ้งเมื่อถูก report/block/unblock |
| Admin | Review report และ moderation ผ่าน Back Office (24h SLA, audit trail) |
| Suspended/Banned User | ใช้งานไม่ได้ตาม account state (contract) |

---

# 15. Validation Rules

| Field / Condition | Rule |
| --- | --- |
| Report Type | ต้องเป็น Asset (post), User, Comment หรือ Board Content (Board Content = contract-only) |
| Report Reason | Required — การแตะ reason row คือ submit ในตัว; ไม่มี path ไป `report:done` โดยไม่เลือกเหตุผล |
| `report:posts` Next | Disabled จนกว่าเลือก tile; เลือกทีละ 1 ใบ |
| Report Dismiss | Mid-flow dismiss (X / `<` / backdrop / system back) must not create report |
| Report Board Content sheet (contract) | `Submit report` disabled จนเลือก reason; `Additional details` optional — contract copy ตาม 12 §13 |
| Block Confirmation | `blkSheet` required ก่อน apply block; backdrop dismiss must not apply block |
| Unblock Confirmation | `unblockDlg` required ก่อน unblock; `Cancel` must not change state |
| Terms Consent | Required before Sign Up |
| Privacy Consent | Required before Sign Up |

---

# 16. Exception Handling

## User Already Blocked

- Block entry บน user ที่ blocked อยู่แล้วต้องแสดง `Unblock` label และเปิด `unblockDlg` แทน `blkSheet` — ไม่มี "already blocked" error path ใน live UI
- Contract copy (ถ้า server race): TH `คุณได้บล็อกผู้ใช้งานนี้แล้ว` / EN `This user has already been blocked.`

## Report Failed (contract — prototype ไม่มี API)

- TH: `ส่งรายงานไม่สำเร็จ กรุณาลองใหม่`
- EN: `Couldn’t submit report. Please try again.`

## Permission Denied (contract)

- TH: `คุณไม่มีสิทธิ์ดำเนินการ`
- EN: `Permission denied.`

## Suspended Account (contract)

- TH: `บัญชีของคุณถูกระงับการใช้งาน`
- EN: `Your account has been suspended.`

## Blocked / Unavailable Content (contract — 00_NAV §10)

- TH: `ไม่สามารถเปิดข้อมูลได้`
- EN: `Unable to open content.`

## Dead-path Toast (prototype quirk — ไม่ใช่ contract)

- `data-bdact='report'` เหลือ dead-path toast `Report submitted. Thank you for notifying us.` — copy นี้ไม่ใช่ contract และต่างจาก live toast `Report submitted · thanks for letting us know` (12 §13 — unify เมื่อ entry implement)

---

# 17. Empty State

Trust & Safety Front Office ไม่มี list empty state หลักใน V1 — report stack ไม่มี "no reports" surface; `report:posts:{u}` ของ user ที่ไม่มีโพสต์แสดง empty copy `ยังไม่มีโพสต์`/`No posts yet` + `Next` ยัง disabled

หากมี Back Office report list ให้ใช้ empty state ตาม Back Office spec ไม่ใช่ Front Office module นี้

---

# 18. Notification Rules

Trust & Safety ไม่อยู่ใน Notification baseline ของ master

- Report Submitted ไม่ต้องส่ง notification ใน V1 baseline
- ผู้ถูก report/block/unblock ต้องไม่ได้รับ notification (`They won't be notified…` — `blkSheet`/`unblockDlg` copy)
- Moderation Action notification เป็น future / Back Office scope ไม่อยู่ใน Front Office V1 baseline
- User suspension/ban messaging อยู่ใน Authentication/account state มากกว่า Notification baseline

---

# 19. Analytics Events (contract — prototype ไม่มี tracking)

- `user_block_started` (blkSheet opened), `user_blocked`, `user_unblocked`
- `user_report_started` (report stack opened), `user_report_submitted`
- `post_report_started`, `post_report_submitted`
- `comment_report_started`, `comment_report_submitted`
- `board_content_report_started`, `board_content_report_submitted` (contract — เมื่อ entry implement)
- `chat_report_started`, `chat_report_and_delete_submitted` (contract — เมื่อ tracking เพิ่ม)
- `terms_of_use_opened`, `privacy_policy_opened`, `signup_legal_consent_accepted`
- `report_done_step_taken` (block/unblock/unfollow/mute จาก done page), `report_guest_gated` (action)

---

# 20. Deviations & Prototype Quirks (spec เลือก prototype — documented, not spec)

| # | Topic | Prototype | Contract / note |
| --- | --- | --- | --- |
| D1 | Report UI = full-page stack | `report:*` sub pages เลื่อนทับ stack + `rp-over` ทับ viewer | spec เดิมเป็น per-type forms/bottom sheet — master D9 ตัดสินแล้ว (ไม่ใช่ bottom sheet) |
| D2 | Block confirm = `blkSheet` | bottom sheet `Block {u}?` + impact rows + `Block`/`Block and report` (fromChat = `Block` เดียว) — dismiss=backdrop | spec เดิม `Block this user?` center dialog + Cancel ถูกแทนที่ (QA-TS-001; canonical S-13/06) |
| D3 | Reason set เดียวทุก type | `PM_REASONS` 9 เหตุผล; reason row = submit (ไม่มี Submit button/Additional details บน live stack) | spec เดิมมีชุดเหตุผลแยกตาม type + optional details + disabled submit — Board Content contract ยังใช้ sheet แยก (12 §13) |
| D4 | Success = `report:done` + toast | `Thanks for your feedback` + other-steps rows + `Done` → `Report submitted · thanks for letting us know` | spec เดิม `Report submitted`/`Our team will review…` form success ถูกแทนที่ — Board Content contract ยังคง copy เดิม (spec-only) |
| D5 | Report ไม่เปลี่ยน visibility | post/profile/comment ยังเปิดได้ปกติหลัง report | ตรง master — report ≠ removal |
| D6 | `pfRestrictHint` | wire หลัง `dlg-unblock-go` แล้ว + I18N_TH — banner ~6s แสดงจริง | canonical 06 contract ตรง — restrict feature เองไม่มีใน V1 (banner เป็น hint เท่านั้น) — resolved 2026-10-29 |
| D7 | `report:posts` empty state | user ที่ไม่มีโพสต์ → picker แสดง `ยังไม่มีโพสต์`/`No posts yet` + `Next` disabled | resolved 2026-10-29 — เพิ่ม empty copy ตาม empty standard |
| D8 | Report routes ไม่มี persistence | `rpFromChat`/`rpDelChat`/`rpTargetType`/`_rpDone`/`_rpSel`/`_rpBase` เป็น screen-dataset/memory state — reload = หาย | mock simplification — production = report draft/records จริง |
| D9 | Uncomf-card report = post report | `uc-report` เปิด `report` page เดียวกับ post `...` (ไม่มี "uncomfortable" report type) | IG pattern — feedback card เป็น entry เสริม ไม่ใช่ type ใหม่ |
| D10 | Comment reason page = X-only | `report:comment` เป็น stack root ไม่มี `<`; `report:done` มี `<` เหมือน type อื่น (resolved 2026-10-29) | — |

---

# 21. Acceptance Criteria

## AC-TS-001: Block User

Given Member เห็น user ที่ต้องการ block  
When Member กด Block จาก entry ใดก็ได้และ confirm ใน `blkSheet`  
Then ระบบต้อง block user สำเร็จ (`pfSetBlocked(true)` effects ครบ)

## AC-TS-001A: Block User Requires Confirmation

Given Member เลือก Block User จาก Profile, comment popover, Chat หรือ `report:done` step  
When confirmation แสดง  
Then ต้องเป็น `blkSheet` bottom sheet (avatar + `Block {u}?` + future-profiles desc + 3 impact rows + `Block` + `Block and report`; fromChat = `Block` เดียว) — **ไม่ใช่** `Block this user?` center dialog  
When Member dismiss ผ่าน backdrop  
Then ระบบต้องไม่ block user และ visibility/chat state ต้องไม่เปลี่ยน

## AC-TS-002: Block Removes Assets From Feed

Given Member block user รายหนึ่ง  
When Member เปิด Feed  
Then Post ของผู้ถูก block ต้องไม่แสดงใน Feed

## AC-TS-002A: Block User Removes Feed-Visible Content

Given Member เห็น post ของ user คนหนึ่งใน Feed  
When Member block user นั้นจาก entry ใดก็ได้ (profile `...` / comment popover / report step) และ Confirm  
Then ระบบต้องใช้ Block User rule เดียวกัน  
And post/content ของ user นั้นต้องไม่แสดงใน Feed หลัง block สำเร็จ

## AC-TS-003: Block Removes Assets From Search

Given Member block user รายหนึ่ง  
When Member เปิด Search Result  
Then Post ของผู้ถูก block ต้องไม่แสดงใน Search

## AC-TS-004: Block Removes Assets From Watch Alert Result

Given Member block user รายหนึ่ง  
When Watch Alert match ทำงาน  
Then Post ของผู้ถูก block ต้องไม่เข้า Watch Alert matching

## AC-TS-005: Block Excludes Following Relationship

Given Member block หรือถูก block โดย user ที่เคย follow กัน  
When Following Feed คำนวณรายการ  
Then ความสัมพันธ์ Follow ระหว่างกันต้องไม่ถูกใช้ในการแสดง Following Feed

## AC-TS-006: Report Post

Given Member เปิด post `...` menu หรือ uncomfortable ack card  
When Member กด Report และเลือกเหตุผลจาก `PM_REASONS`  
Then ระบบต้องแสดง `report:done:{u}` success page  
And เมื่อกด `Done`/`✕` ต้องแสดง toast `Report submitted · thanks for letting us know`

## AC-TS-006A: Report Stack Mid-Flow Dismiss

Given Member เปิด report stack หน้าใดก็ได้  
When Member dismiss ด้วย `✕`, `<` จนหมดกอง, backdrop หรือ system back โดยไม่เลือกเหตุผล  
Then ระบบต้องไม่สร้าง report

## AC-TS-006B: Report Reason Required To Proceed

Given Member อยู่บน reason page หรือ `report:posts` picker  
When Member ยังไม่เลือกเหตุผล / tile  
Then ต้องไม่มี path ไป `report:done` (reason row = submit; `Next` บน picker disabled จนเลือก tile)  
When Member เลือกเหตุผล / tile แล้ว  
Then flow ต้องไปต่อได้

## AC-TS-007: Report User

Given Member เปิด Profile `...` หรือ Chat `chmenu`  
When Member เลือก Report (profile → `report:pick` → `Something about this account`; chat → `chatReportSheet` → `Report`/`Report and delete`) และเลือกเหตุผล  
Then ระบบต้องแสดง `report:done:{u}` + toast `Report submitted · thanks for letting us know` เมื่อปิดกอง  
And chat entry ต้องข้าม `report:pick` และไม่มี `<` (`rpFromChat`)

## AC-TS-008: Report Comment

Given Member long-press comment ของ user อื่น  
When Member เลือก Report จาก popover และเลือกเหตุผล  
Then ระบบต้องเปิด `report:comment` (X only) → `report:done` (มี `<` ย้อนได้เหมือน type อื่น) → toast `Report submitted · thanks for letting us know`

## AC-TS-009: Report Board Content (contract)

Given Member เห็น Board Content เมื่อ report entry ถูก implement  
When Member ส่ง Report Board Content พร้อม reason  
Then ระบบต้องแสดง report submitted success ตาม contract 12 §13  
And article ต้องคงแสดงจน moderation เสร็จ (spec-only จนกว่า `data-bdmore` implement — S-04)

## AC-TS-010: Report Does Not Remove Content Immediately

Given Member report post, user หรือ comment  
When report submit สำเร็จ (`report:done` แสดง)  
Then content/profile ต้องไม่หายทันทีเพราะ report เพียงอย่างเดียว และต้องเปิดได้ปกติ

## AC-TS-011: Admin Moderation Removes Content

Given Admin ดำเนินการ moderation ผ่าน Back Office  
When Admin remove Asset หรือ Content  
Then content จึงถูก remove/ซ่อนตาม policy

## AC-TS-012: Report SLA

Given Report ถูกส่งเข้า Back Office  
When Admin review queue ทำงาน  
Then Report ต้องอยู่ภายใต้ SLA ดำเนินการภายใน 24 ชั่วโมง

## AC-TS-013: Legal Consent Before Sign Up

Given user สมัครผ่าน Email, Google หรือ Apple  
When user ยังไม่ยอมรับ Terms of Use และ Privacy Policy  
Then ระบบต้องไม่ให้สมัครต่อจนกว่าจะยอมรับ

## AC-TS-014: Legal Access From Settings

Given Member เปิด Settings  
When Member กด Privacy Policy หรือ Terms of Use  
Then ระบบต้องเปิดเอกสารที่เกี่ยวข้อง (routes `privacy`/`terms`)

## AC-TS-015: Apple Compliance Coverage

Given app ถูกตรวจ Apple compliance  
When ตรวจ feature ด้าน safety  
Then app ต้องมี Report, Block, Terms of Use, Privacy Policy และ Moderation Flow

## AC-TS-016: Report Done Steps Are Real Actions

Given Member อยู่บน `report:done:{u}`  
When Member กด step row  
Then `Block` ต้องเปิด `blkSheet` (`fromChat` variant เมื่อ `rpFromChat`), `Unblock` ต้องเปิด `unblockDlg`, `Unfollow`/`Unmute` ต้อง apply ทันทีพร้อม toast, `Mute` ต้องเปิด `muteDlg`  
And step ที่สำเร็จต้อง disabled พร้อม green check คงแถวไว้

## AC-TS-017: Chat Report And Delete

Given Member เปิด `chatReportSheet` จาก `chmenu`  
When Member เลือก `Report and delete` และทำ flow จนถึง `report:done` แล้วกด `Done`/`✕`  
Then thread ต้องหายจาก actor's chat list (remove-from-actor-list + strip `chmenu:`/`chatroom:` pages → กลับ Chat List) พร้อม toast `Report submitted · thanks for letting us know`  
When Member เลือก `Report` ธรรมดา  
Then ต้องกลับหน้าที่เปิด report เดิมและ thread คงอยู่

## AC-TS-018: Guest Gate On Report/Block Entries

Given session เป็น `guest`  
When guest กด report/block entry ใดก็ได้ (post `...`, profile `...`, comment popover, chat `chmenu`, uncomf `Report`, blkSheet actions)  
Then ระบบต้องแสดง Member Sheet `Join TukDaeng` ก่อน handler ทำงาน และต้องไม่สร้าง report/block ใด ๆ

## AC-TS-019: Unblock Via Shared Dialog

Given Member block user ไว้แล้ว  
When Member กด Unblock จาก entry ใดก็ได้ (keep-page / `...` label / Settings blocked list / chat bar+menu / `report:done` step)  
Then ระบบต้องเปิด `unblockDlg` (`Unblock {u}?` + `Unblock`/`Cancel`)  
And เมื่อ confirm ต้อง `pfSetBlocked(false)` + toast `Unblocked` โดยไม่ re-follow และไม่แจ้งอีกฝ่าย

---

# 22. Related Modules

- [00_GLOBAL_RULES_MODULE.md](00_GLOBAL_RULES_MODULE.md) — §7 session, §11 Member Sheet, §13 block/report impact
- [00_NAVIGATION_AND_CROSS_MODULE_FLOW.md](00_NAVIGATION_AND_CROSS_MODULE_FLOW.md) — §6.1/§6.2/§6.6/§6.7 report stack + routes + back, §9 gate, §10 unavailable fallback
- [01_AUTHENTICATION_MODULE.md](01_AUTHENTICATION_MODULE.md) — sign-up legal consent + suspended/banned account states
- [02_FEED_MODULE.md](02_FEED_MODULE.md) — post `...` entry + uncomf/ni cards (entry เท่านั้น; internals canonical ที่นี่)
- [06_PROFILE_MODULE.md](06_PROFILE_MODULE.md) — canonical `blkSheet`/`unblockDlg`/`pfSetBlocked`/keep-page + `report:pick` entry (FSP-019 lock)
- [07_CHAT_MODULE.md](07_CHAT_MODULE.md) — `chatReportSheet`/`rpFromChat`/`rpDelChat` + `th.blocked` room effects (FSP-020 lock)
- [10_WATCH_ALERT_MODULE.md](10_WATCH_ALERT_MODULE.md) — block excludes WA matching
- [11_SOCIAL_MODULE.md](11_SOCIAL_MODULE.md) — comment popover + `Blocked and hidden comments` + mute/unfollow semantics
- [12_BOARD_MODULE.md](12_BOARD_MODULE.md) — `Report Board Content` contract (S-04)
- [13_SETTINGS_MODULE.md](13_SETTINGS_MODULE.md) — `blocked` list + `privacy`/`terms` routes
- Back Office / Admin — moderation handoff + audit trail

---

# 23. Future Enhancement

- Report Board Content live entry (เมื่อ `data-bdmore`/article overflow implement)
- Restrict feature (`pfRestrictHint` banner → real restrict flow)
- Appeal Ban
- Report Tracking
- Trust Score / Reputation Score
- Automated Moderation / AI Content Detection
- Moderation notification
- Message-level report (chat message รายข้อความ)
