# FSP-011 — 00_NAV Update Evidence (app shell + bottom nav + drawer + deep link)

Date: 2026-10-21
Task: `0837d9cc` — "FSP-011 อัปเดต 00_NAV — bottom nav + drawer + headers + deep link"
Scope: `FrontOffice/00_NAVIGATION_AND_CROSS_MODULE_FLOW.md` เท่านั้น (ไฟล์เดียว) — sync ตาม `Prototypes/fo-flow/index.html` (read-only) + sign-off FSP-005 + baseline 00_GLOBAL (FSP-010)
Gap sources: `gap-FSP-001b-nav.md` (nav/drawer/shell), `gap-FSP-002a-feed-search.md` (feed card → detail/viewer, search header entry), `gap-FSP-003b-chat-notifications.md` (alerts destinations)
Prototype anchors verified: `botNavHTML` ~16788–16800, feed shell + drawer ~19352–19394, drawer i18n ~19683–19698, `openSub`/`pushSub`/`renderSub`/`subBack`/`rpPush`/`rpBack`/`rpClose` ~14783–14945, `subHTML` route table ~17151–17583, `alertsClick` ~17776–17825, `navGo` wiring ~21284–21302, `sub-back`/`sub-x` handlers ~20750–20782, `pv-back` ~21206, `detail-back` ~21811, `view-full` → detail ~21849–21858, `GUEST_GATE_SEL` ~22997–23011

## 1. Sign-off decisions applied

| Decision | Applied in 00_NAV |
| --- | --- |
| S-03 share gated | §4, §7, §9, AC-NAV-025 — share ทุก surface (feed/viewer/detail/profile grid/article/share profile) เป็น login-required; ลบ "Guest can share without Login" ทั้ง 4 จุด (flag จาก FSP-010) |
| S-08 WA → post viewer direct | §8 + AC-NAV-010 — ไม่มี Result List (สอดคล้อง master/docs อื่นที่เขียนไว้แล้ว) |
| S-12 comment composer | §4, AC-NAV-004 — comment = shared bottom sheet ทุก surface; composer input = contract (view-only) |
| S-13 blocked profile keep-page | §7, §10, AC-NAV-014 — blocked profile = grid ว่าง + Unblock (IG) ไม่ใช่ unavailable state แยก |
| S-16 guest feed tabs ไม่ gate | §6.4 note — feed tabs กดได้ เห็น empty state |
| S-17 system notif type | §8 — เพิ่ม row System = placeholder destination (prototype dead toast); destination contract → 09_NOTIFICATION |
| S-19 drawer = placeholder | §6.5, §11, AC-NAV-015/022 — 9 rows enabled-looking + dead-tap toast `Not in this prototype yet` |
| S-29 contract-only keep | §10/§12/§13/§16 + AC-NAV-011/016A–F — deep link ทั้งชุด annotate "prototype ไม่ครอบ" (share=mock+toast, ไม่มี URL routing); suspended/banned, analytics = contract |
| D5/C3 destination mapping | §6.1 Canonical Destination Terms — `Asset Detail` ใน module specs เดิม = Post Detail (`.page-detail`); Post Viewer = `.page-pv` |

## 2. What changed (section map)

| Section | Change |
| --- | --- |
| §2 Objective | + app shell, layer model, member sheet |
| §3 Prototype Reference | แทนที่ image list เก่าด้วย fo-flow surfaces จริง (header, bottom nav, drawer, layers, sheets, member sheet, report stack) |
| §4 Master Alignment | rewrite ทั้งตาราง — app shell/destination model/feed nav/comment surface/share gate/keep-page block/menu scope |
| §5 Scope | + layer model, bottom nav, header entries, in-app back stack |
| §6 App Shell & Navigation Model — NEW | §6.1 canonical destination terms (Asset Detail→Post Detail mapping) · §6.2 layer model (feed/sub/report/viewer/detail/sheet/dialog/member sheet + bottom nav hidden under overlays) · §6.3 bottom nav 5 tabs + TH labels + badges 99+ + swap/refresh/gate behaviors · §6.4 app header (burger/search/wordmark/`+`; search=header entry ไม่ใช่ tab; brand-menu=dead variant) + feed tabs note + artifacts · §6.5 drawer mechanics (scrim, dead-tap toast, board/chat burgers ต่างกัน) · §6.6 sub-page route map (กลุ่ม create/search, board, alerts, chat+`chsettings:` dead, saved/library, settings, report, profile) · §6.7 in-app back behavior table (pop, slide-out, saved/wl unwind, sfilter discard, results→landing, del_account, pfollow scroll, alerts→feed, detail-back/pv-back/sub-x) |
| §7 Cross-Module Entry Matrix | rewrite เป็น post-centric — feed media=carousel เท่านั้น, View full detail→Post Detail, tiles→Post Viewer, share rows gated ทุกจุด, Ask Seller/chat handoff, board/article rows, settings entry via pf-menu |
| §8 Notification Destinations | like/comment → Post Viewer ของโพสต์ตัวเอง (toast เมื่อโพสต์หาย); follow → profile push; watch → Post Viewer direct; + System placeholder; mark-read/dismiss notes |
| §9 (เดิม Global Dialog Routing) | rename "Login-Required Gate Routing" → Member Sheet `Join TukDaeng` ref 00_GLOBAL §11 + alias note; gate triggers ตาม `GUEST_GATE_SEL` จริง (tabs, `+`, share, social, chat, WA, settings, profile actions) |
| §10 Unavailable Fallback Rules | ชื่อเดิม (cross-ref) — + prototype annotations (toast/empty states), blocked profile → keep-page |
| §11 Menu Scope Rules | ชื่อเดิม — เพิ่ม Watch Brands + Watch Price Index (ครบ 9 รายการตาม drawer) + อธิบาย placeholder pattern (enabled rows + dead-tap toast ไม่มี marking) |
| §12 Deep Link Rules | ชื่อเดิม (cross-ref) — rules เดิม + contract-only preamble (D16: ไม่มี deep link/URL routing ใน prototype); "Login Required" → Member Sheet |
| §13 Back Button And Main Navigation After Deep Link | ชื่อเดิม (เดิม §13A — cross-ref) — contract + pointer ไป §6.7; Asset Detail → Post Detail |
| §14 Analytics | contract note; rename events post-centric (`nav_feed_to_post_detail`, `nav_post_viewer_opened`, `nav_member_sheet_opened`, `nav_tab_selected`) — event ids ไม่มี cross-doc refs |
| §15/§16 Validation/Exception | sync คำศัพท์ + gate + placeholder + keep-page + contract notes |
| §17 ACs | AC-NAV-001/003/004/005/006/007/010/014/015 reword ตามพฤติกรรมจริง; AC-NAV-016A–F เก็บเป็น contract; +AC-NAV-017–026 (tabs, feed re-tap, badge, guest tabs, header entries, drawer 9 rows, back stack, alerts back, share gated, viewer sources) |
| §18 Related Modules | + 06, 11, 12, 13 |
| §19 Future Enhancement | + deep link implementation, drawer destinations, system notif destination |

Renumbered: §13A→§13, §13→§14, …, §18→§19 — cross-refs ทั้งหมดอ้างชื่อ section ไม่ใช่เลข (ดู §3)

## 3. Cross-doc ref check (ก่อนปิดงาน)

| Check | Result |
| --- | --- |
| `AC-NAV-` refs นอกไฟล์นี้ | 1 hit — `DOCUMENT_VERSION.md:88` history entry (`AC-NAV-016A–016F` ยังอยู่ครบ ไม่ลบ/ไม่ renumber) ✓ |
| Section-name refs จากไฟล์อื่น | `Deep Link Rules` (05:501/514, 12_BOARD:259/271) · `Unavailable Fallback Rules` (05:514, 06:482, 12_BOARD:271) · `Back Button And Main Navigation After Deep Link` (02:414, 06:478/496, 12_BOARD:290) — **คงชื่อเดิมทั้ง 3** ✓ |
| "Guest can share" / share without login | 0 (เดิม 4 จุด §7 — แก้ตาม S-03 แล้ว) ✓ |
| `Global Login Required Dialog` | เหลือ 1 — alias note ใน §9 โดยตั้งใจ (rename per-module = scope FSP-012a/b, 015a–024, 026) ✓ |
| `Result List` | เหลือ 3 — ทั้งหมดเป็นประโยค "ไม่มี Result List คั่น" สอดคล้อง master/DEV/QA/10/09/03/16/02 ✓ |
| `Make Offer` / offer | 0 ✓ |
| AC IDs | AC-NAV-001–016F คงเดิม (reword บางตัว), +017–026 ท้ายตาราง — ไม่มี ref แหว่ง ✓ |

## 4. Verification

| Check | Result |
| --- | --- |
| `git status --porcelain -- Prototypes/` | EMPTY — prototype untouched ✓ |
| ไฟล์ที่แก้ | `FrontOffice/00_NAVIGATION_AND_CROSS_MODULE_FLOW.md` เท่านั้น (+276/−158 lines) ✓ |
| Prototype anchors | ตรวจสอบโค้ดจริงทุกจุดที่อ้าง (ดู header) ✓ |

## 5. Flags ส่งต่อ (ไม่แก้นอก scope)

- `Global Login Required Dialog` ~75 hits ใน module specs/QA/master — per-module rename (FSP-012a/b, 015a–024, 026) — จาก FSP-010
- "Notifications" vs "Alerts" terminology (D14) + copy EN-hardcode (D15) → FSP-026
- `system` notification destination contract + mark-read/dismiss details → FSP-021 (09_NOTIFICATION)
- Feed-card → detail/viewer claims ใน module specs (02 `Asset Detail`, 03 result card, 05 surface ทั้งก้อน, 06 grid) → FSP-015a/016/018/019
- `chsettings:` dead route + chat item card → Post Detail destination wording → FSP-020 (07_CHAT)
- QA checklist: guest-share asserts (QA-GLOBAL-003C–H), AC-NAV-017–026 เป็น AC ใหม่ → FSP-027
- Analytics event rename (contract) → จดใน FSP-030 consistency matrix
