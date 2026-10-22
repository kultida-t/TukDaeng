# FSP-025 — Master Product Definition Sync Evidence (FO-PRD-v1.9)

Date: 2026-10-22
Task: `0596742d` — "FSP-025 sync Master Product Definition (mission:cc291dc9)"
Scope: `FrontOffice/TukDaeng_Master_Product_Definition.md` (rewrite ทั้งไฟล์ 1025 → 1074 บรรทัด) — sync ตาม module specs ที่ rewrite แล้วทั้งชุด (baseline chain: `00_GLOBAL` §7/§8/§9/§10/§11/§12/§13/§14 + `00_NAV` §6/§8/§10/§11/§12 + `01`–`14` module specs)
Context: session notes FSP-016–024 + evidence `FSP-005` (sign-off S-01–S-29) + `FSP-007` (RL-02 — offer refs ใน master ถูกลบไปแล้ว) + `FSP-019/020/021/023/024` flags ที่ฝาก FSP-025
Rule: master เป็น assumption doc เก่า — ทุกจุดที่ขัด prototype ให้เลือก prototype (sign-off default); production contract ที่ prototype ไม่ครอบ mark `(contract — prototype ไม่ครอบ)` ตามแบบ module specs

## 1. What changed (section map)

| Section | Change |
| --- | --- |
| Header | เพิ่ม Status "Synced to fo-flow prototype baseline (FO-PRD-v1.9)" + sync note อ้าง FSP-005 sign-off + contract-only convention |
| §1 Product Definition | เพิ่ม bullet social post sharing + clarify "ไม่ใช่ Social Network เต็มรูปแบบ" ว่า feed เป็น post-centric แต่ปลายทางคือ marketplace community |
| §3 User Model | **ใหม่ Session Model `member`/`new`/`guest`** (canonical 00_GLOBAL §7); User capabilities +post/saved/wishlist; Owner +post kind note; Viewer +post-on-feed-only note; **Guest rewrite ทั้งก้อน** — browse capabilities ใหม่ (feed ทุก tab ungated, search, boards, detail/viewer, public profile, legal) + gated list เพิ่ม **Share ทุก surface (S-03)** + Member Sheet แทน Global Login Required Dialog |
| §4 Canonical Terminology | เพิ่ม terms: Post/Post Detail/Post Viewer/Member Sheet/Alerts feed/Liked vs Favorites (account-level)/Saved·Wish List/Sale Record/Total invested; Legacy mapping +4 rows (Asset Detail→Post Detail, Global Login Required→Member Sheet, Notification Center→Alerts feed, Total Asset Value→Total invested + `.pf-pfo`, Hide this asset→Not interested) |
| §5 Asset Status Model | statuses เดิม + `post` row ใน matrix + rules อัปเดต post-centric (S-09/S-10/S-14 defect notes) — ตัด "Show ติดต่อผู้ขายได้" (chat = listing-scoped sale only) |
| §6 Global Visibility Rules | **rewrite ทุก surface** — Feed post-centric + exclusions + tabs semantics (Favorites=favorite sellers) + guest ungated + no infinite scroll; Search = photo grid→viewer + recent searches + ไม่มี sort/count; WA = 3 entries/auto-name/snapshot/instant-delete; Public Profile = sale+show + viewer `...` menu (Report/Block/About/Copy URL/Share) ไม่มี asset quick actions; Owner Profile = tabs 5 + own entries + own-post menu canonical 02 + ไม่มี Total Asset Value headline |
| §7 Authentication | **rewrite** — onboarding chain, OTP 6-digit auto-submit, profile setup, `Account created`→sign in เอง (S-22), attempt counter `(n/5)`+lockout, forgot generic sent, implied consent + optional opt-in + re-consent, credential persist, password canonical (S-21), ตัด spec-only states (S-20), suspended/banned contract |
| §7 Feed | **rewrite** — post-centric tabs (`ทั้งหมด`/`กำลังติดตาม`/`รายการโปรด`), IG card anatomy + actions, others/own-post menus, Not-interested loop (แทน Hide Feed Item), Create composer entries+fields, ไม่มี infinite scroll/comment composer |
| §7 Share & Deep Links | **ใหม่ทั้งก้อน** — share = member-only ทุก surface (S-03), shared in-app sheet (friends + 4 apps + copy link), deep link contract-only matrix (canonical 00_NAV §12) |
| §7 Search & Filter | **rewrite** — keyword+suggestions+recents, results tabs (For you/Profiles/Tags), `sfilter` 11 sections (Brand/Model/Price/Year/Reference/Condition/Case size/Movement/Dial/Strap/Delivery), draft/commit pattern, `(0)` selectable, no sort/count |
| §7 Post Detail & Post Viewer | **แทน "Asset & Asset Detail"** — `.page-detail` model, anatomy (hero/action row/mf-btn/wl-btn/specs), ไม่มี owner block/follow/ask/inline comments/full-screen viewer; **locked decision คงเดิม**: Price Analytics อยู่ Portfolio เท่านั้น (canonical 14 §9); Contact = Ask Seller pill บน sale post เท่านั้น |
| §7 Asset Management | **rewrite** — composer asset mode (drawer-first), visibility pick Show/Hide/Post to feed, `Also save to My Assets`, cost details private, `asking` optional ทุก status (**ตัด `Price on request`** — ไม่มี label), free-text fields (ไม่มี Market Data autocomplete/option-master), ตัด multi-step form/required matrix/Change Status sheet/confirmations/provenance (S-25), Mark as Sold = sale/show/hide + 2-field Sale Record, delete/BO ซ่อนถาวร contract คงเดิม |
| §7 Chat | **rewrite** — thread key user+item (S-07 ไม่มี merge), draft room `C.draft` + Quick Ask, snapshot ref card, Chats/Items views, media message เท่านั้น (ตัด File/Asset Card), swipe pin/mute/hide/delete, `chmenu`/`chmedia`/`chatcfg`, block via shared `blkSheet`, report `report:user` + Report and delete, ตัด E2E claim (S-18) + `chsettings` dead |
| §7 Social | **rewrite** — like ทุก surface + private count (S-26), liked→Interested list ≠ Favorites (D7), comments 1-level + sheet ทุก surface + emoji composer + long-press popover, follow account-level + unfollow ล้าง favorite/mute, Saved/Wish List systems, social ไม่สร้าง alert |
| §7 Watch Alert | **rewrite** — 3 entries shared sheet, auto-name, snapshot criteria + 3 match modes, instant delete (S-11), walerts page ผ่าน Settings>Your library, watch row → Post Viewer ตรง (S-08) |
| §7 Notification → Alerts feed | **rewrite** — 5 types (+`system` placeholder S-17), age-bucket sections, Mark all as read, follow back/dismiss, destinations = Post Viewer/profile (D12), chat badge only |
| §7 Profile | **rewrite** — own: pf-pfo/`+`/pf-menu/pedit/QR/tabs 5 post-grid ไม่มี headline ตัวเลข; viewer: follow/`...` menu/about/share/QR/blocked keep-page (S-13); ตัด asset-card `...` quick actions |
| §7 Portfolio | **rewrite ตาม FSP-024 sign-offs** — headline = Total invested Σ purchase (D2), eligible = sale/show/hide + `own!==false`, math contract (pfoCur mkt→purchase→none, GL mkt+purchase, Exp asking−purchase, Cmp ±1%, Hold Yy Mm), **ตัด Top Brand/YTD (D5)**, **Sale Record = price+date เท่านั้น (D3)**, consignment copy-only (D12), denied/failed = dev-sim เท่านั้น, owner-only |
| §7 Board | **rewrite** — editorial magazine model (S-01: hero ≤5 + Latest + freeform tags — ตัด 7 master sections), member-only like/share (S-03), static list + end note (ไม่มี infinite scroll D2), search แยก surface, Report Article contract-only (S-04) |
| §7 Chat Room Actions | **รวมเข้า §7 Chat** — mute/block/report/hide/delete ผ่าน swipe + `chmenu` (ตาม prototype) |
| §7 Settings | **rewrite** — IG 6-section structure (S-05), About your account (Security chg-pwd S-28 + Account management delete), language/theme/notif settings 4 toggles (S-06)/content prefs/what-you-see pages/privacy & cookies contract/help/about/legal/logout, Delete = 2-page + password + scheduled + **login-to-restore grace 30 วัน (S-02)** |
| §8 Global State & Error | Member Sheet spec (copy/scrim/first-run checkbox), guest free-vs-gated อ้าง §3+00_GLOBAL §11, deleted asset contract, **เพิ่ม Re-consent Decline**, feed error + offline contract marks |
| §9 Lifecycle | asset transitions + เพิ่ม `post`↔asset link transitions; **เพิ่ม Account & Session Lifecycle** (signup→new, signin→member/new, signout→guest, delete→grace login-to-restore, suspended→revoke contract, policy bump→re-consent) |
| §10 Trust & Safety | block effects +unfollow/clear favorite+mute + keep-page (S-13) + IG sheet; report types + IG multi-step stack (D9) + board content contract-only; Apple compliance เดิม |
| §11 Data Privacy | +portfolio value detail + no headline บน public surfaces + like count private (S-26) |
| §12 NFR | **ตัด Feed infinite scroll + `คุณดูรายการทั้งหมดแล้ว`** → static list (board end note เท่านั้น) + deep-link route guard contract |
| §13 Integrations | เดิม + Watch Price API = contract (prototype mock `market` field) |
| §14 Phase 1 Exclusions | +Offer removal note, comment composer, infinite scroll/sort/count, WA result list, native share/deep link, full-screen viewer, inline comments, chat file/asset card/E2E, market-data autocomplete, Top Brand/YTD, board UGC/comment/save, **`Price on request`**, drawer placeholders |
| §15 Source Of Truth | +ordering (master→00_GLOBAL→module→legacy) + post-centric bullets + Member Sheet + 5 notif types + defect-vs-contract rule |
| §16 Sync Decision Log | **ใหม่ทั้งก้อน** — ตาราง S-01–S-29 + portfolio D-decisions (D1/D2/D3/D4/D5/D12) ลง sign-off ใน master |
| §17 Module PRD Checklist | เดิม (renumber จาก §16) |

## 2. Sign-off decisions ที่ลงใน master (ตาม task handoff)

| Decision | ลงใน master ตรงไหน |
| --- | --- |
| Headline portfolio = Total invested (Σ purchase) ไม่ใช่ Total Asset Value | §7 Portfolio + §4 terminology + §16 (S-15/D2) |
| Sold record = Sale price + Sale date เท่านั้น (ตัด 6-field) | §7 Asset Mgmt (Mark as Sold) + §7 Portfolio (Sold History) + §16 (D3) |
| ตัด Top Brand Holdings/YTD ตาม user feedback | §7 Portfolio "ไม่มีใน V1" + §14 exclusions + §16 (D5) |
| Consignment = copy-only ไม่มี implementation | §7 Portfolio (foot note + `own` flag) + §14 + §16 (D12/S-25) |
| Price analytics อยู่ Portfolio เท่านั้น (locked เดิม) | §7 Post Detail Price Analytics — คงเดิม 100% ยืนยันแล้ว |
| Share = member-only + deep link contract-only matrix | §7 Share & Deep Links + §3 Guest + §8 + §16 (S-03/S-29) |
| Status model sold/hide เหมือนเดิม + post kind | §5 + matrix row `post` |
| Offer refs | master สะอาดอยู่แล้วจาก FSP-007 — รอบนี้เพิ่มแค่ exclusion note §14 (0 live offer refs) |

## 3. Cross-doc ref check (ก่อนปิดงาน)

| Check | Result |
| --- | --- |
| `git status --porcelain -- Prototypes/` | **ว่าง** — Prototypes/ ไม่ถูกแตะ ✓ |
| `grep -i offer` master ใหม่ | 5 hits — ทุกจุดเป็น exclusion/removal note จงใจ (§7 Chat, §7 Settings S-06, §14, §16) — 0 live refs ✓ |
| `Global Login Required` / `Notification Center` / `Total Asset Value` / `Price on request` / `Top Brand` / `YTD` ใน master ใหม่ | 17 hits — ทุกจุดเป็น rename-trace (§4 + เดิมเรียก), exclusion list หรือ decision log — 0 live usage ✓ |
| `master §` refs จากเอกสารอื่น | 0 hits — ไม่มีเอกสารไหนอ้าง master ด้วยเลข section → renumber §16→§17 (checklist) ปลอดภัย ✓ |
| Terms ใหม่ที่ master ตั้ง | `Member Sheet`/`Alerts feed`/`Post Detail`/`Post Viewer`/`Total invested`/`Sale Record`/`Not interested`/`pfkind`/`pfp`/`pf-pfo` — ตรง canonical names ใน module specs ทั้งหมด ✓ |
| Baseline delegation | 00_GLOBAL §7 session → §3; §8 consent → §7 Auth/Settings; §9/§10 status+matrix → §5; §11 Member Sheet+guest lists → §3/§8; §12 lifecycle+password → §9/§7; §13 block/report → §10; §14 privacy → §11; 00_NAV §8 destinations → §7 Notification; §12 deep link → §7 Share & Deep Links; §11 drawer/menu scope → §14 ✓ |

## 4. Deviations / stale docs ที่ flag ต่อ (ไม่แก้นอก scope)

| Item | Flag ไป |
| --- | --- |
| `00_GLOBAL` §15 line "Notification types ใช้เฉพาะ Like, Comment, Follow, Watch Alert" — stale vs 09/00_NAV §8 ที่เพิ่ม `system` (master ให้ 5 types ตาม 09) | FSP-030 |
| `17_NON_FUNCTIONAL_REQUIREMENTS` — master alignment + §4 ยังเขียน "Feed ต้องรองรับ Infinite Scroll" + end-of-list marker (ขัด baseline ใหม่ no infinite scroll) | FSP-030 (17 ไม่ได้ rewrite ใน mission นี้) |
| `15_TRUST_SAFETY`/`16_INTEGRATIONS`/`18_ADMIN_SCOPE_NOTE` — ยังเป็นฟอร์แมตเก่า mirror master เดิม (ไม่มี prototype anchors); เนื้อหายัง consistent กับ master ใหม่ส่วนใหญ่ แต่ควร re-check ใน sweep | FSP-030 |
| Legacy docs `PRD.md`/`FO_Functional_PRD.md`/`Use_Cases.md`/`DEV_*`/`QA_*`/`FINAL_HANDOFF`/`DEV_BASELINE_HANDOFF` — ยัง asset-centric/offer-era wording หนัก (`Price on request`, Sale-only feed, multi-step form, `Notification Center`) — มี owner tasks เดิม | FSP-026/027/028 |
| `salePosts()` pfkind leak + public `all` tab leak — documented defects ใน master §5/§6 + 00_GLOBAL §10 (spec เขียน contract ถูกแล้ว ไม่แก้ prototype) | FSP-030 รวม quirk list |
| README_MODULE_INDEX L94 "supported types Like, Comment, Follow, Watch Alert เท่านั้น" — stale vs system type | FSP-026 (flag เดิมจาก FSP-021) |

## 5. Verification

| Check | Result |
| --- | --- |
| ไฟล์ที่แก้ | `FrontOffice/TukDaeng_Master_Product_Definition.md` (rewrite ทั้งไฟล์ 1074 บรรทัด, +579/−530 diff) + evidence ไฟล์นี้ |
| Sign-off coverage | S-01–S-29 ครบใน §16 + portfolio D1–D5/D12 — ทุก decision มีตำแหน่งลงใน master + ref module ✓ |
| Master↔module consistency | ทุก "Master Baseline" row ใน module alignment tables (00_GLOBAL/00_NAV/01–14) มี counterpart ใน master ใหม่ — ตรวจ feed model/session/gate/share/search/WA/notif/chat/board/settings/portfolio ครบ ✓ |
| ข้อห้าม | ไม่ได้แตะ `Prototypes/` (git clean) ✓; ไม่ commit (FSP-006–025 uncommitted รอคำสั่ง) ✓ |
