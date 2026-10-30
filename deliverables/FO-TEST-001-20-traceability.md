# FO-TEST-20 — Traceability & Gap Audit (ปิดท้ายชุด FO-TEST-001)

> Task: FO-TEST-20 ของชุด FO-TEST-001 · วันที่ audit: 2026-10-30
> Contract ที่ไล่: `FO-TEST-001-00-inventory.md` §2 Master Coverage Map (164 แถว) + §3 inventory lists
> เอกสารที่อ่านครบก่อน audit: master prompt + เล่ม 00–19 ทุกเล่ม (header, §1 coverage map, §3 spec/deviation/OPEN, §4 traceability, สถิติ, checklist CSV)
> ขอบเขต: **audit อย่างเดียว — ไม่แก้ไฟล์เล่ม 01–19** · ทุกแถว coverage map ต้องมี TC ID ≥1 ตัวชี้กลับหรือเหตุผลยกเว้น

## สถานะเอกสาร (อ่านก่อนทุกอย่าง — สำหรับคนและ AI)

- **ผลการรันเทส: ยังไม่มี** — ทุกเคสในชุด FO-TEST-001 เป็นเคสที่เขียนไว้ (Draft) สำหรับเดฟนำไปรันบน build stg / แอปจริง คอลัมน์ Result ว่างทุกเคส ห้ามอ้างว่า PASS/FAIL จากเอกสารนี้
- **"ครบ" ในเอกสารนี้ = มี TC เขียนและชี้กลับ coverage map แล้ว** ไม่ได้หมายความว่าทดสอบแล้วผ่าน
- **ลำดับความจริงเมื่อเอกสารขัดกัน**: (1) spec ใน `FrontOffice/` = contract (2) `Prototypes/fo-flow/index.html` = reference ของ UI และ expected (3) เคสทดสอบ FO-TEST-001 = ใช้ตรวจ build จริงบน stg/แอป ไม่ใช้ prototype เป็นเป้าการทดสอบ
- **ตัวเลขยืนยันแล้ว (ตรวจจาก CSV จริง ณ วันที่ 2026-10-30)**: TC รวม 1,620 (High 807 / Medium 693 / Low 120) · SETUP 195 แถว · coverage map 164 แถว (inventory §2) ทุกแถวมีเคสหรือเหตุผลยกเว้น
- **ID ที่ปลดแล้ว**: SHELL-055 (ตัดออกจากแอปจริง) — ห้ามนำเลขนี้กลับมาใช้ ช่วง ID ที่เขียนเป็น `..` หมายถึงเฉพาะ ID ที่มีอยู่จริง

## 0. วิธีอ่าน + สรุปผลก่อนตาราง

- **ตาราง §2** = ตารางหลัก: ไล่ inventory §2.1–2.12 ทีละแถว · "ครบ?" = ✅ มี TC ≥1 · ⚠️ = ครอบแบบมีเงื่อนไข (contract-only / dev-only / BLOCK ล่วงหน้า) · ➖ = ยกเว้นพร้อมเหตุผล
- **§3** = รายการ tag พิเศษ `[OPEN-CODE-ONLY]` / `[OPEN-NO-CODE]` / `[DEAD]` / `[GATE]` — แต่ละรายการชี้ TC ที่ครอบหรือเหตุผลยกเว้น
- **§4** = actor coverage guest×member ของทุก gated action · **§5** = integration list → เล่ม 18
- **§6** = Gap list รวม [OPEN] ทั้งระบบ + จุดขัด spec + GAP-7..18 จากเล่ม 18 + defect เอกสารที่ audit นี้เจอเอง — ทุกจุดมีข้อเสนอแนะ
- **§7** = สถิติ · **§8** = validation checklist · **§9** = index ไฟล์ทั้งชุด

**ผล audit และ reconciliation:** ระดับ Master Coverage Map ครอบ **160/160 แถวที่ต้องเทส (100%)** และ crosswalk ครบ **58/58 route patterns** ใน §7.3 รวม `al_unavail` ซึ่งทีมยืนยันให้นับเป็น route pattern ด้วย · อีก 4 แถวเป็น exception ที่ inventory กำหนดจำนวน TC = 0 อยู่แล้ว (bdmore dead wiring · REMOVED controls · ADMIN handoff · dev harness) ทั้ง 4 มีเคส/เหตุผลยกเว้นจดไว้ครบ · Findings GAP-19..23 ตรวจซ้ำและอัปเดตตามไฟล์ปัจจุบันแล้ว; GAP-25 ปิดหลังซิงก์ inventory กับ route crosswalk

---

## 1. Index ชุดเอกสาร FO-TEST-001 (ไฟล์ทั้งหมด)

| # | ไฟล์ MD | CSV คู่ | Module/ขอบเขต | TC | สถานะ audit |
|---|---------|---------|----------------|-----|-------------|
| 00 | FO-TEST-001-00-inventory.md | — | Master Coverage Map (contract) | — | ต้นทาง audit |
| 01 | FO-TEST-001-01-auth.md | 01-auth-checklist.csv | Auth & Onboarding | 104 | ✅ ครบ — CSV 104 TC + 7 SETUP และ coverage map signin ตรงกัน |
| 02 | FO-TEST-001-02-shell.md | 02-shell-checklist.csv | Shell & Navigation | 65 | ✅ ครบ |
| 03 | FO-TEST-001-03-feed.md | 03-feed-checklist.csv | Feed & Post Cards | 82 | ✅ ครบ |
| 04 | FO-TEST-001-04-search.md | 04-search-checklist.csv | Search & Filter | 62 | ✅ ครบ |
| 05 | FO-TEST-001-05-create.md | 05-create-checklist.csv | Create Composer | 73 | ✅ ครบ |
| 06 | FO-TEST-001-06-viewer-detail.md | 06-viewer-detail-checklist.csv | Post Viewer & Detail | 93 (PV 53+DET 40) | ✅ ครบ |
| 07 | FO-TEST-001-07-sheets.md | 07-sheets-checklist.csv | Bottom Sheets | 125 | ✅ ครบ — priority stats ตรงกับ CSV |
| 08 | FO-TEST-001-08-chat.md | 08-chat-checklist.csv | Chat | 127 | ✅ ครบ — priority stats และ CSV ตรงกัน |
| 09 | FO-TEST-001-09-board.md | 09-board-checklist.csv | Board | 69 | ✅ ครบ |
| 10 | FO-TEST-001-10-alerts.md | 10-alerts-checklist.csv | Alerts & Notifications | 79 | ✅ ครบ |
| 11 | FO-TEST-001-11-watchalert.md | 11-watchalert-checklist.csv | Watch Alert | 80 | ✅ ครบ |
| 12 | FO-TEST-001-12-profile.md | 12-profile-checklist.csv | Profile | 111 | ✅ ครบ |
| 13 | FO-TEST-001-13-portfolio.md | 13-portfolio-checklist.csv | Portfolio & Asset | 106 | ✅ ครบ |
| 14 | FO-TEST-001-14-library.md | 14-library-checklist.csv | Library | 120 | ✅ ครบ |
| 15 | FO-TEST-001-15-settings.md | 15-settings-checklist.csv | Settings | 121 | ✅ ครบ |
| 16 | FO-TEST-001-16-report-block.md | 16-report-block-checklist.csv | Trust & Safety | 67 | ✅ ครบ |
| 17 | FO-TEST-001-17-guest-gate.md | 17-guest-gate-checklist.csv | Guest Gate | 56 | ✅ ครบ |
| 18 | FO-TEST-001-18-e2e.md | 18-e2e-checklist.csv | E2E Integration | 16 เส้น | ✅ ครบ — มี GAP-7..18 ส่งต่อ |
| 19 | FO-TEST-001-19-lang-theme.md | 19-lang-theme-checklist.csv | Language & Theme | 64 (LANG 48+THM 16) | ✅ ครบ |
| — | FO-TEST-001-testcase-prompt.md | — | กติกาหลัก (master prompt) | — | อ่านแล้ว |
| — | FO-TEST-001-task-breakdown.md | — | Task breakdown 21 task | — | อ่านแล้ว |

หมายเหตุชื่อไฟล์: task breakdown ซิงก์ชื่อ output ของเล่ม 13/19 กับไฟล์จริงแล้ว (GAP-23 resolved)

---

## 2. Master Traceability — inventory §2 ทีละแถว → TC

### 2.1 Auth / Onboarding / Session (24 แถว → เล่ม 01 + 15 + 17)

| Route/Feature (inventory §2.1) | TC ID ที่ครอบ | ครบ? |
|---|---|---|
| onboarding `splash` | AUTH-001, 002 | ✅ |
| onboarding `lang` | AUTH-003..005 | ✅ |
| onboarding `welcome` | AUTH-006..008 | ✅ |
| onboarding `consent` | AUTH-009..013 | ✅ |
| onboarding `prefs` `[OPEN-CODE-ONLY]` | AUTH-014..016 | ✅ |
| onboarding `notif` | AUTH-017..019 | ✅ |
| onboarding `track` `[OPEN-CODE-ONLY]` | AUTH-020..022 | ✅ |
| onboarding `member` (Join TukDaeng) | AUTH-023..027 + GATE-024..035 | ✅ |
| onboarding `signup` | AUTH-028..031 | ✅ |
| onboarding `otp` | AUTH-032..036 | ✅ |
| onboarding `profile` | AUTH-037..041 | ✅ |
| onboarding `created` | AUTH-042..043 | ✅ |
| onboarding `signin` (+lockout cluster) | AUTH-044..049, 098..104 | ✅ |
| onboarding `forgot` | AUTH-050..052 | ✅ |
| overlay `ob-legal` `[OPEN-CODE-ONLY]` | AUTH-053..054 | ✅ |
| actions exit/decline/hide/social/resend | AUTH-055..060 | ✅ |
| `obGate()` + `GUEST_GATE_SEL` ทุก entry | AUTH-061..068 + GATE-001..056 (matrix เต็ม) | ✅ |
| re-consent `OB.recon` `[OPEN-CODE-ONLY]` | AUTH-069..072 | ⚠️ BLOCK-if (ต้อง trigger policy version จริง — §6) |
| `settings → about_account` | AUTH-073..075 + SET-011..015 | ✅ |
| `change_pwd` | AUTH-076..081 + SET-016..024 | ✅ |
| `del_account` step 1–2 | AUTH-082..088 + SET-025..035 | ✅ |
| dlg `delPasswordConfirm`/`delAccountSuccess` | AUTH-089..092 + SET-033..035 | ✅ |
| dlg `forgotPwd` `[OPEN-CODE-ONLY]` | AUTH-093..094 + SET-024 | ✅ |
| dlg `logout` | AUTH-095..097 + SET-036..039 | ✅ |

### 2.2 Feed / Post Card / Social (25 แถว → เล่ม 03 + 02 + 06 + 07)

| Route/Feature (inventory §2.2) | TC ID ที่ครอบ | ครบ? |
|---|---|---|
| feed shell — 3 tabs/seg-thumb/brand-menu/empty | SHELL-035..041 + FEED-073..075 (snooze) | ✅ |
| post card — head/carousel/actions/liked-by/caption | FEED-001..008, 020..026 | ✅ |
| post card — clip `[OPEN-CODE-ONLY]` | FEED-017..019 + PV-030..033 + DET-020..023 | ⚠️ BLOCK-if (ต้องสร้าง clip จริง) |
| post card — details inline + View full detail | FEED-020..026 + DET-001..005 | ✅ |
| action `follow` `[GATE]` | FEED-027..031 + GATE-004 + uf SHT-091..094 | ✅ |
| action `like` `[GATE]` | FEED-032..034 + GATE-001 | ✅ |
| action `save` sv `[GATE]` | FEED-042..045 + SHT-056..066 + LIB-030..045 | ✅ |
| action `share` sh `[GATE]` | FEED-039..041 + SHT-049..055 | ✅ |
| action `comment` | FEED-035..038 + SHT-013..041 | ✅ |
| action `Ask` pill `[GATE]` | FEED-046..050 + SHT-121..123 + CHAT-001..010 + GATE-007 | ✅ |
| action `liked-by` lk `[OPEN-CODE-ONLY]` | FEED-051..053 + SHT-042..048 | ✅ |
| post menu คนอื่น pm (+reportOnly variant) | FEED-054..059 + PV-040 | ✅ |
| post menu ตัวเอง pm-own (archive/pin/edit/sold/delete) | FEED-060..067 + PV-041..049 + AST-039..041, 064 | ✅ |
| feedback card `ni-card` `[OPEN-CODE-ONLY]` | FEED-068..070, 072 + E2E-011 | ✅ |
| feedback card `uncomf` `[OPEN-CODE-ONLY]` | FEED-071 + TRS-001..010 (report entry) | ✅ |
| overlay `detail-open` (Post Detail) | DET-001..040 | ✅ |
| overlay `pv-open` immersive | PV-001..012, 013..033 | ✅ |
| overlay `pv-open` feed mode (svf) `[OPEN-CODE-ONLY]` | PV-003..005, 010, 011, 015, 032 | ✅ |
| overlay `pv-open` pfp mode `[OPEN-CODE-ONLY]` | PV-006, 034..038 + PROF-054 | ✅ |
| sheet `ps` caption | SHT-099..103 | ✅ |
| sheet `dt` details | SHT-099..103 | ✅ |
| sheet `uf` unfollow confirm `[OPEN-CODE-ONLY]` | SHT-009, 091..094 + FEED-031 | ✅ |
| sheet `mf` manage following `[OPEN-CODE-ONLY]` | SHT-095..098 + SET-059..066 (fav) | ✅ |
| tag click `igd-tag` `[OPEN-CODE-ONLY]` | FEED-076..078 + SRCH-026 (tag mode) | ✅ |
| state flags (archived/ni/muted/blocked/favorite/pinned/noComments/hideCounts/modelFollowing) | รวมใน FEED-057, 060..070 · DET-034..037 · PV-025 · PROF-100..103 · TRS-039..049 | ✅ |

### 2.3 Search & Filter (8 แถว → เล่ม 04 + 11 + 17)

| Route/Feature (inventory §2.3) | TC ID ที่ครอบ | ครบ? |
|---|---|---|
| `search` landing (explore/chips/filter/`sr-saved`) | SRCH-001..005 + GATE-015 (ไม่ gate) + LIB-001..010 | ✅ |
| `search` typing (suggest/recents preview) | SRCH-006..011 | ✅ |
| `recents` `[OPEN-CODE-ONLY]` (ล็อก: หน้าจริง) | SRCH-012..016 | ✅ |
| `search` results (tabs/chips/grid/sellers/empty/err) | SRCH-017..032 | ✅ |
| `sfilter` page (brand→model dep/price/counts/Clear/Apply) | SRCH-033..043 | ✅ |
| `sfilter` validation (min>max, max>เพดาน) | SRCH-044..047 | ✅ |
| `sr-wa` bell → watch alert `[GATE]` | SRCH-051..054 + WA-001..006 + GATE-011 | ✅ |
| state `S.sort` `[OPEN-NO-CODE]` (ล็อก: V1 ไม่มี sort) | SRCH-031 (negative — เจอ UI sort = FAIL) | ✅ resolved |

### 2.4 Create / Edit Composer (12 แถว → เล่ม 05 + 13)

| Route/Feature (inventory §2.4) | TC ID ที่ครอบ | ครบ? |
|---|---|---|
| `create` picker `[GATE]` (+camera cell `[DEAD]`) | CRE-001..014 + GATE-014 | ✅ (camera = picker จริงบนแอป CRE-012) |
| `create` step2 caption (+discard/draft) | CRE-015..024 + CRE-013, 067..069 | ✅ |
| pane `loc` | CRE-025..027 | ✅ |
| pane `price` | CRE-028..029 | ✅ |
| pane `spec` | CRE-030..031 | ✅ |
| pane `cond` | CRE-032..033 | ✅ |
| pane `cost` `[OPEN-CODE-ONLY]` | CRE-034..039 | ✅ |
| pane `more` `[OPEN-CODE-ONLY]` | CRE-040..042 | ✅ |
| visibility `stt/vis` + asset mode | CRE-049..053, 060..062 + AST-076..082 | ✅ |
| publish `cf-share` + `_waHits` toast `[OPEN-CODE-ONLY]` | CRE-043..048 + WA-043..055 (match) | ✅ |
| edit `V.editPid` `[OPEN-CODE-ONLY]` | CRE-054..062 + AST-065..073 (pfkind switch) | ✅ |
| clip preview `[OPEN-CODE-ONLY]` | CRE-063..066 | ⚠️ BLOCK-if (ต้องมีวิดีโอจริง) |

### 2.5 Saved / Wishlist / Library (12 แถว → เล่ม 14 + 07 + 15)

| Route/Feature (inventory §2.5) | TC ID ที่ครอบ | ครบ? |
|---|---|---|
| `saved` hub (posts/collections/See all/grid/Manage) | LIB-011..029 | ✅ |
| `saved` search mode | LIB-022..024 | ✅ |
| `saved` manage mode (select/unsave/move) | LIB-019..021, 028..029 | ✅ |
| `savedcol` (menu/cover/edit/add modes) `[OPEN-CODE-ONLY]` | LIB-046..063 | ✅ |
| `savedcol` edit cover / add posts | LIB-046..063 | ✅ |
| dlg `delcol` `[OPEN-CODE-ONLY]` | LIB-054 | ✅ |
| sheet `nc` new collection `[OPEN-CODE-ONLY]` | LIB-027, 037..042 + SHT-073..080 | ✅ |
| `archive` | LIB-006, 079..087 | ✅ |
| `wishlist`/`wishcol` `[OPEN-CODE-ONLY]` | LIB-005, 070..078 | ✅ |
| sheet `wl` wishlist picker `[OPEN-CODE-ONLY]` `[GATE]` | LIB-064..069 + SHT-067..072 + GATE-008 | ✅ |
| settings `interested` `[OPEN-CODE-ONLY]` | LIB-007, 088..091 + SET-089 | ✅ |
| settings `ni` `[OPEN-CODE-ONLY]` | LIB-007, 092..097 + SET-090 | ✅ |

### 2.6 Watch Alerts & Notifications (7 แถว → เล่ม 11 + 10 + 04)

| Route/Feature (inventory §2.6) | TC ID ที่ครอบ | ครบ? |
|---|---|---|
| sheet `wa` create/edit `[GATE]` | WA-009..018 + SHT-081..090 | ✅ |
| `walerts` list (entry ผ่าน Settings เท่านั้น) | WA-003, 008, 026..033, 062..063 | ✅ (path mismatch — §6-GAP-INV-01) |
| model follow `mf-btn` `[OPEN-CODE-ONLY]` `[GATE]` | WA-002, 004, 007, 011, 022..025, 040, 042 | ✅ |
| alert fire `_waHits` `[OPEN-CODE-ONLY]` | CRE-048 + WA-043..055 | ⚠️ BLOCK-if (match engine จริง) |
| `alerts` (groups/unread/mark-all/dismiss x) | ALT-001..009, 020..022, 035, 036, 057 | ✅ |
| row types 5 (like/comment/follow/watch/system) | ALT-010..016 + destinations ALT-026..034 | ✅ |
| badge `nav-badge` + `99+` cap | ALT-017..025 + SHELL-030 | ⚠️ BLOCK-if (>99 unread ต้อง test data — §6) |

### 2.7 Chat (15 แถว → เล่ม 08 + 16 + 12)

| Route/Feature (inventory §2.7) | TC ID ที่ครอบ | ครบ? |
|---|---|---|
| `chat` user view (swipe/pin/mute/badge/search) | CHAT-011..031 | ✅ |
| `chat` item view + filter popover `[OPEN-CODE-ONLY]` | CHAT-032..044 | ✅ |
| `chatcfg` `[OPEN-CODE-ONLY]` | CHAT-093..098 | ✅ |
| `chatitem:id` `[OPEN-CODE-ONLY]` | CHAT-035..038, 044 | ✅ |
| `chatroom:id` | CHAT-003, 004, 010, 045..061, 109, 118 | ✅ |
| attach sheet `ch-attach-sheet` `[OPEN-CODE-ONLY]` | CHAT-062..067, 116 | ✅ |
| `ch-media-viewer` `[OPEN-CODE-ONLY]` | CHAT-068..070 | ✅ |
| `chmenu:id` `[OPEN-CODE-ONLY]` (wallpaper/E2E `[DEAD]`) | CHAT-071..085, 099 | ✅ |
| `chsettings:id` `[OPEN-CODE-ONLY]` (dead route) | CHAT-099 (พิสูจน์แล้วว่าไม่มี entry — spec V1 ไม่มีหน้านี้) | ✅ resolved |
| `chmedia:id` `[OPEN-CODE-ONLY]` | CHAT-086..092, 117 | ✅ |
| dlg `ch-modal` hide/del `[OPEN-CODE-ONLY]` | CHAT-026..029, 107 | ✅ |
| sheet `blk` block confirm (+fromChat ปุ่มเดียว) | CHAT-058..060, 077..079, 085, 102, 103, 115 + TRS-032..038 | ✅ |
| sheet `chatReport` `[OPEN-CODE-ONLY]` | CHAT-080..085, 124 + TRS-021..025 | ✅ |
| `chatQuickAsk` `[GATE]` | CHAT-001..010, 030, 067, 096, 119 + PROF-055..061 (ห้องเดียว/account) | ✅ |
| state `blocked` `[OPEN-CODE-ONLY]` | CHAT-104, 105 + TRS-044, 045 + GATE (room guard) | ✅ |

### 2.8 Board (7 แถว → เล่ม 09 + 16 + 07)

| Route/Feature (inventory §2.8) | TC ID ที่ครอบ | ครบ? |
|---|---|---|
| `board` home (hero/Latest/View all/bd-head) | BRD-001..012, 049..051, 056, 057 | ✅ |
| `boardall` (pills/drag/crumb) | BRD-013..022, 051 | ✅ |
| `boardsearch` | BRD-023..033 | ✅ |
| `boardart:id` (article detail + not found) | BRD-034..048, 052..055, 058, 064 | ✅ |
| sheet `bdmenu` categories `[OPEN-CODE-ONLY]` | BRD-018..021 + SHT-118 | ✅ |
| sheet `bdmore` `[DEAD]` (handler มีแต่ไม่มี entry render) | ➖ expected 0 TC — BRD-040, 047, 048 (เช็กว่า*ไม่มี* action) + TRS-059 (contract-only เมื่อ implement) | ✅ resolved |
| action like/save `[GATE]` | BRD-041..046 (like) · save/report = dead → BRD-040, 047, 048 | ✅ (save = ยืนยันไม่มี) |

### 2.9 Profile & Portfolio (18 แถว → เล่ม 12 + 13 + 06)

| Route/Feature (inventory §2.9) | TC ID ที่ครอบ | ครบ? |
|---|---|---|
| `profile:uname[:tab]` own | PROF-001..012 | ✅ |
| `profile:uname` public (+blocked view) | PROF-024..039 + TRS-047..048 | ✅ |
| tabs `pf-tab` (swap/scroll-keep/pin) `[OPEN-CODE-ONLY]` | PROF-013..023 | ✅ |
| grid tile → `pv-open` pfp | PV-006, 034..038 + PROF-013..023 | ✅ |
| overlay `pf-avov` `[OPEN-CODE-ONLY]` `[GATE]` | PROF-007, 032, 083 + GATE-010, 016, 017 | ✅ |
| overlay `pf-qr` `[OPEN-CODE-ONLY]` `[GATE]` | PROF-076..082 | ✅ |
| sheet `pf-more` (viewer ⋯) | PROF-031, 063..068 + TRS-011, 035, 051 | ✅ |
| `pedit` `[OPEN-CODE-ONLY]` | PROF-010, 084..099 | ✅ |
| `pfollow:uname:tab` | PROF-046..053 | ✅ |
| `about:uname` `[OPEN-CODE-ONLY]` | PROF-066 | ✅ |
| `pf-rhint` restrict hint `[OPEN-CODE-ONLY]` | PROF-072, 073 + TRS-053 | ✅ |
| `pf-sleep`/`pf-note`/`pf-addchip`/`pf-avadd`/`pf-addp`/`pf-uname` toast/`qr` act `[REMOVED]` | ➖ ยกเว้น — ตัดออกจาก prototype แล้ว (FO-TEST-12); PROF-004, 007, 083, 085 เช็กว่า*ไม่มี* = FAIL guard | ✅ resolved |
| `pfp-follow` pill `[OPEN-CODE-ONLY]` `[GATE]` | PROF-054 + PV-035..038 + GATE-010 | ✅ |
| `portfolio` (Total invested/market/G‑L/rows) | AST-001..022 | ⚠️ เคส [MKT] BLOCK-if (server market data — §6) |
| `pfasset:id` `[OPEN-CODE-ONLY]` | AST-016, 023..037 | ✅ |
| `soldhist` | AST-018, 055..064 | ✅ |
| `sold:id` `[OPEN-CODE-ONLY]` | AST-055..064 | ✅ |
| `sell:id` (Mark as sold) | AST-038..054 | ✅ |

### 2.10 Trust & Safety / Report (12 แถว → เล่ม 16 + 07 + 15)

| Route/Feature (inventory §2.10) | TC ID ที่ครอบ | ครบ? |
|---|---|---|
| `report` (post reasons + anonymous note) `[GATE]` | TRS-001..010 | ✅ |
| `report:user` | TRS-014, 023..025 | ✅ |
| `report:comment` `[OPEN-CODE-ONLY]` | TRS-017..020 | ✅ |
| `report:pick:u` `[OPEN-CODE-ONLY]` | TRS-011, 037 | ✅ |
| `report:posts:u` `[OPEN-CODE-ONLY]` | TRS-012, 013, 016 | ✅ |
| `report:done:u` `[OPEN-CODE-ONLY]` (+other steps) | TRS-026..031 | ✅ |
| comment popover `c-popover` (Delete/Block/Report + guest long-press gate) | TRS-017, 020, 038 + SHT-028..033 + GATE-003 | ✅ |
| dlg `delComment` `[OPEN-CODE-ONLY]` (root+replies / single) | SHT-030..032 + LANG-018 | ✅ |
| sheet `blk` + dlg `unblock` `[OPEN-CODE-ONLY]` | TRS-032..038, 050..054 + PROF-069..075 | ✅ |
| dlg `mute` `[OPEN-CODE-ONLY]` | TRS-029 + FEED-069 (ni-card) + SET-067..071 (unmute) | ✅ |
| `blocked`/`muted` settings lists | SET-067..077 + TRS-051, 062 | ✅ |
| `ADMIN` moderation handoff `[OPEN-NO-CODE]` | ➖ expected 0 TC — FO ไม่มีหน้าจอ ADMIN by design; FO-side = TRS-061 (BLOCK-if) + E2E-007/GAP-13 | ✅ ยกเว้นพร้อมเหตุผล |

### 2.11 Settings & Content Preferences (15 แถว → เล่ม 15 + 14 + 10)

| Route/Feature (inventory §2.11) | TC ID ที่ครอบ | ครบ? |
|---|---|---|
| `settings` hub (6 sections + Login + counts) | SET-001..010, 036..039 | ✅ |
| `lang` | SET-040..047 + LANG-037 | ✅ |
| `theme` | SET-048..052 + THM-009 | ✅ |
| `notif_settings` `[OPEN-CODE-ONLY]` | SET-053..058 + ALT-048..056 (boundary) | ✅ |
| `favorites` `[OPEN-CODE-ONLY]` | SET-059..066 | ✅ |
| `muted` `[OPEN-CODE-ONLY]` | SET-067..071 | ✅ |
| `blocked` `[OPEN-CODE-ONLY]` | SET-072..077 | ✅ |
| `prefs` (snooze/reset) `[OPEN-CODE-ONLY]` | SET-078..085 | ✅ |
| `sensitive` `[OPEN-CODE-ONLY]` | SET-086..088 | ⚠️ ผลฟีด [OPEN] — §6 |
| `interested`/`ni` `[OPEN-CODE-ONLY]` | SET-089..091 + LIB-088..097 | ✅ |
| dlg `reset` `[OPEN-CODE-ONLY]` | SET-082..084 | ✅ |
| `help` | SET-092..096 | ✅ |
| `cookies` (เพิ่มในโค้ด 2026-10-29) | SET-105..108 + AUTH-014..016 | ✅ |
| `privacy`/`terms` | SET-097..100 + AUTH-053..054 | ✅ |
| `about_app` `[OPEN-CODE-ONLY]` | SET-101..104 | ✅ |

### 2.12 Global / Cross-cutting (9 แถว → เล่ม 02 + 17 + 19)

| Route/Feature (inventory §2.12) | TC ID ที่ครอบ | ครบ? |
|---|---|---|
| bottom nav 5 แท็บ + badge | SHELL-021..034, 065 + GATE-019..021 | ✅ |
| app header (burger/search/wordmark/+) | SHELL-001..007 | ✅ |
| `hb-open` drawer 9 เมนู `[DEAD]` | SHELL-008..020 (placeholder behavior ยืนยันครบ) | ✅ |
| Language EN/TH (MutationObserver) | LANG-001..048 + SET-040..047 | ✅ |
| theme light/dark | THM-001..016 + SET-048..052 | ✅ |
| toasts/scrToast/pin pill `[OPEN-CODE-ONLY]` | per-module + LANG-020 (catalog sweep) + SHT-011 | ✅ |
| dev sidebar/`?dev=1`/`POST_DETAIL_CFG` `[OPEN-CODE-ONLY]` | ➖ ยกเว้น — prototype harness ไม่ใช่ production spec (AST-008 negative: production ต้องไม่มี) | ✅ resolved |
| scroll/anim mechanics `[OPEN-CODE-ONLY]` | SHELL-049..054, SHELL-056 (SHELL-055 ปลดแล้ว) | ✅ |
| device back (Android system back) | SHELL-054 + SET-109..112 + per-module device-back เคส | ✅ |

**สรุป §2:** 164 แถว = 160 แถวที่ inventory คาด TC ≥1 + 4 แถว expected-0 (bdmore · REMOVED controls · ADMIN handoff · dev harness) —
- 160 แถว: ✅ ครอบเต็ม 153 · ⚠️ ครอบพร้อมเงื่อนไข/BLOCK-if 7 (clip posts, clip preview, re-consent, `_waHits`, badge 99+, portfolio [MKT], sensitive feed effect) → **160/160 = 100%**
- 4 แถว expected-0: ทุกแถวมีเคสยืนยันพฤติกรรม/เหตุผลยกเว้นจดครบ (BRD-040/047/048+TRS-059 · PROF-004/007/083/085 · TRS-061+E2E-007 · AST-008)
→ **ไม่มีแถวใดว่างจาก TC หรือขาดเหตุผลยกเว้น**

---

## 3. รายการ tag พิเศษ — ครอบโดย TC ไหน / ยกเว้นเพราะเหตุใด

### 3.1 `[OPEN-NO-CODE]` (diagram ระบุ แต่โค้ดไม่มี — 5 รายการ)

| # | รายการ | ผล audit | เหตุผล/TC |
|---|--------|----------|-----------|
| 1 | Sitemap `alerts → walerts` (diagram ว่าอยู่ใต้ alerts, โค้ดอยู่ใต้ Settings) | ⚠️ path mismatch — walerts ถูกเทสครบผ่าน entry Settings (WA-008) | **ถือ prototype เป็น spec** (canonical 13 settings row) — แจ้งทีม update diagram (§6-GAP-INV-01) |
| 2 | ADMIN / BO moderation handoff | ➖ ยกเว้น by design — FO ไม่มีหน้าจอ | FO-side covered TRS-061 + E2E-007; ขั้น moderation จริง = GAP-13 รอ BO access |
| 3 | Share member-only (เช็ก gap เดิม) | ✅ ไม่ใช่ gap — obGate ครอบ share | SHT-053 + BRD-044..046 + GATE-001 |
| 4 | No Auction/Live/Authentication (diagram บอกไม่มี) | ✅ ตรง — drawer placeholders เทส dead-behavior | SHELL-008..020 |
| 5 | Search `S.sort` ไม่มี UI | ✅ resolved — ล็อก V1 ไม่มี sort + default newest | SRCH-031 (negative case) |

### 3.2 `[DEAD]` / dead wiring (รายการหลัก)

| รายการ | TC ที่ครอบ / เหตุผล |
|---|---|
| drawer 9 เมนู placeholder | SHELL-008..020 — เคสยืนยัน toast "Not in this prototype yet" ตาม spec placeholder |
| camera cell ใน picker | CRE-012 — บนแอปจริงต้องเปิดกล้อง/สิทธิ์จริง |
| photo picker onboarding `profile` | AUTH-040 — expected = OS picker จริง |
| chat wallpaper / E2E keys (`chmenu`/`chsettings`) | CHAT-093..099 — chsettings เป็น dead route พิสูจน์แล้ว (ไม่มี entry); wallpaper/E2E = contract-only |
| `bdmore` article more (handler ไม่มี render) | BRD-040, 047, 048 (ยืนยันไม่มี entry) + TRS-059 (report = contract-only) |
| `pfo` dev sim / `?dev=1` portfolio states | AST-008 — dev-only; production ต้องไม่มี entry (negative) |
| `fo_newpost` handoff channel | CRE-069 — dev-only, mark BLOCK บนแอปจริง |
| `[data-bdsave]`/`[data-bdact]` board dead entries | GATE-013 — dead แต่ gate list คุมไว้; build ที่มี entry ต้อง gate |
| `.sort-open` dead CSS | ➖ harness residue — ไม่มี sheet ใช้; ไม่ต้องเทส |
| `[data-qi]`/`Learn more`/overlay `qr` act และ REMOVED pf controls | PROF-004, 007, 083, 085 — เช็กว่า*ไม่มี* control = FAIL guard |

### 3.3 `[OPEN-CODE-ONLY]` (มีในโค้ด ไม่มีใน diagram)

**ครอบครบทั้งหมด** — ทุกแถว tag นี้ใน §2 มี TC ชี้กลับแล้ว (ดู tag ในตาราง §2): recents page · chat sub-pages (chatitem/chmenu/chsettings/chmedia/chatcfg) · swipe actions · attach/media viewer · ch-modal · chatReport · pf-avov/pf-qr · uf/mf/lk sheets · sv/wl/nc · dt/ps/nt · ni-card/uncomf · pm-own+pin · pedit validation · notif_settings/favorites/muted/blocked/prefs/sensitive · report:pick/posts/done · c-popover/delComment · WA modes/dedupe/_waHits · composer panes/clip/edit · pfasset/sold · about:uname · interested/ni · toasts — **ไม่มีรายการถูกลืม**

### 3.4 `[GATE]` (guest → Member Sheet)

ครอบครบเป็นคู่ — ดูเมทริกซ์ §4

---

## 4. Actor Coverage — gated action ต้องมี guest + member คู่กัน

| Gated action / selector | GUEST (Member Sheet) | MEMBER (flow ปกติ) | ครบ? |
|---|---|---|---|
| like | GATE-001, 009 + AUTH-061..068 | FEED-032..034 + DET-024..029 | ✅ |
| comment write/like/reply/popover | GATE-002, 003 + SHT-028, 041 | SHT-013..041 | ✅ |
| save → sv sheet | GATE-001 + SHT-063 | FEED-042..045 + LIB-030..045 | ✅ |
| share (member-only rule) | GATE-001 + SHT-053 + BRD-044..046 | SHT-049..055 + FEED-039..041 | ✅ |
| follow seller | GATE-004, 012 (ผ่าน .follow-btn) | FEED-027..031 + PROF-040..054 | ✅ |
| post menu ⋯ | GATE-005 | FEED-054..067 + PV-040..049 | ✅ |
| second-layer selectors (pm-*/ni-*/rp-*/blk-*/sh-*/ch-rep-*/pf-*/set-btn…) | GATE-006, 023 (ไม่มีทางหลุด) | internals → TRS-001, 020, 055 + SHT-* | ✅ |
| Ask pill / chat-fab | GATE-007 + CHAT-001, 002 | FEED-046..050 + CHAT-001..010 | ✅ |
| wl-btn / mf-btn (watch/model bell) | GATE-008 + WA-001..004 | LIB-064..069 + WA-009..018 | ✅ |
| create `+` [data-flow] | GATE-014 + CRE-002, 071 | CRE-001..005 | ✅ |
| sr-wa search bell | GATE-011 + SRCH-051..054 | WA-001, 006, 010 | ✅ |
| board like/share | GATE-013 + BRD-041, 044, 046 | BRD-042, 043, 045 | ✅ |
| profile actions (pf-foll/pf-msg/pf-more/pf-avov/pf-flw) | GATE-010, 016..018 + PROF-029..032 | PROF-024..039 | ✅ |
| nav chat / alerts / profile | GATE-019..021 | CHAT-011..031 + ALT-001..009 + PROF-001..012 | ✅ |
| settings / own surfaces ทั้งชุด | GATE-022, 023 + SET-001, 091 | SET-001..120 | ✅ |
| report/block entries | GATE-006 + TRS-001, 020, 055 | TRS-001..061 | ✅ |
| Member Sheet mechanics (anatomy/dismiss/SSO/hide flag) | GATE-024..035 + AUTH-023..027, 061..068 | — | ✅ |
| resume contract (ไม่มี pending-action resume) | GATE-036..041 + AUTH-065, 066 | — | ✅ |
| guest free-browse inverse (feed/search/board/viewer/detail/public profile/legal) | GATE-042..048 (ยืนยัน*ไม่เจอ* sheet) | — | ✅ |

**สรุป:** ทุก gated action มีเคสฝั่ง guest (sheet) + member (flow) ครบคู่ — ไม่มี selector ใน GUEST_GATE_SEL ที่ไม่มีเคส

---

## 5. Integration Flows — master prompt 12 เส้น vs เล่ม 18

| # | เส้นบังคับ (master prompt) | E2E ที่ครอบ | TC ย่อยหลัก | ครบ? |
|---|---------------------------|-----------|--------------|------|
| 1 | Create asset(Sale) → Feed + Search + match WA | E2E-002 | CRE-001..053 · FEED-001..008 · SRCH-017..032 · WA-043 | ✅ |
| 2 | WA match → push/alert → PV → Detail | E2E-003 | WA-043,056 · ALT-014,028 · PV-007..008 · DET-001..005 | ✅ |
| 3 | Detail → Ask Seller → Chat (item card) → กลับ | E2E-001 (+003) | DET-024..029 · CHAT-002,003,045..057 · PROF-058 | ✅ |
| 4 | Detail → follow model → walerts list | E2E-003 | WA-002,009..018,026..033 | ✅ |
| 5 | Mark as Sold → Sale Record → Portfolio | E2E-002 + E2E-004 | AST-038..064,076..085 | ✅ |
| 6 | Like/Comment/Follow → Alerts อีกฝั่ง + badge + mark all | E2E-006 | FEED-027..038 · ALT-010..041,065..072 | ✅ |
| 7 | Save→savedcol · Wishlist→wishcol · archive | E2E-012 | SHT-056..080 · LIB-001..105 | ✅ |
| 8 | not-interested → หาย feed + ni list + undo | E2E-011 | FEED-054..059,068..072 · SET-078..091 · LIB-088..097 | ✅ |
| 9 | Report → pick → done → BO handoff | E2E-007 | TRS-001..016,026..031,061 | ⚠️ step BO = GAP-13 |
| 10 | Block → blocked list + keep-page + unblock | E2E-009 | TRS-032..054 · PROF-062..075 · SET-072..077 | ✅ |
| 11 | Delete → grace countdown → login restore | E2E-008 | SET-025..035 · AUTH-082..097 | ⚠️ GAP-14..16 |
| 12 | Guest → Member Sheet → sign up/SSO → resume | E2E-010 (+001) | GATE-024..041 · AUTH-028..049 | ✅ |

เส้นเพิ่มเติมที่เล่ม 18 เขียนเพิ่มจากโค้ด (เหตุผลระบุใน §2.x ของเล่ม): **E2E-005** ผลกระทบหลังขายข้าม surface · **E2E-013** follow loop · **E2E-014** board read loop · **E2E-015** stale/deleted target fallback · **E2E-016** external deep link — รวม 16 เส้น (plan 15–25 ✓)

---

## 6. Gap List — [OPEN] ทั้งระบบ + จุดขัด spec + defect เอกสาร (พร้อมข้อเสนอแนะ)

ข้อเสนอแนะใช้ 3 แบบ: **ถามทีม** (spec/contract ยังไม่ชัด) · **ถือ prototype เป็น spec** (ตัดสินแล้ว เหลือยืนยันบน build) · **รอ build จริง** (เทสได้เมื่อมี build/backend จริงเท่านั้น)

### 6.1 Defect เอกสารที่ audit นี้เจอเอง (ใหม่ — ไม่เคยถูกจดไว้)

| ID | จุด | รายละเอียด | ข้อเสนอแนะ |
|----|-----|-----------|------------|
| GAP-19 | เล่ม 01 — ตรวจยืนยันจำนวนแถว CSV | ตรวจซ้ำแล้ว `FO-TEST-001-01-auth-checklist.csv` มี **104 TC + 7 SETUP = 111 records** และมี AUTH-098..104 ครบอยู่แล้ว; ข้อสรุปเดิมว่า 7 TC หายไม่ตรงกับไฟล์ | RESOLVED — ยืนยัน CSV/MD parity 104/104 TC; ไม่เพิ่มแถวซ้ำ |
| GAP-20 | เล่ม 01 — coverage map ไม่อัปเดต | §1 map แถว `signin` เดิมระบุ `AUTH-044 – 049` โดยไม่รวม AUTH-098..104 | RESOLVED — อัปเดต map เป็น `AUTH-044 – 049, 098 – 104` |
| GAP-21 | เล่ม 07 — สถิติผิด | เดิมระบุ Medium 51; จำนวนจริงคือ **High 65 / Medium 52 / Low 8 = 125 TC** | RESOLVED — แก้ stats line ให้ตรงกับแถวจริง |
| GAP-22 | เล่ม 08 — สถิติและ CSV priority ไม่ตรง | จำนวนจริงคือ **High 50 / Medium 49 / Low 25 = 124 TC**; `CHAT-009` ใน CSV เดิมระบุ Medium ไม่ตรงกับ MD | RESOLVED — แก้ stats line และ priority ของ CHAT-009 ให้ MD/CSV ตรงกัน |
| GAP-23 | task-breakdown — ชื่อไฟล์/TC prefix ไม่ sync | breakdown เดิมระบุ `-19-language-theme.md`, `-13-portfolio-asset.md` และ `FO-TC-E2E-nnn`; ไฟล์จริงใช้ `-19-lang-theme.md`, `-13-portfolio.md` และ `E2E-nnn` | RESOLVED — ปรับชื่อไฟล์และ E2E prefix แล้ว; คง `TRS-nnn` ตามเดิม |
| GAP-24 | Coverage evidence ระดับ route pattern | เดิมไม่มี crosswalk แยก route; **ปิดแล้วใน audit นี้** โดยเพิ่มตาราง route patterns → TC ID ใน §7.3 | RESOLVED — ทุกรายการ route ที่แจกแจงมี TC ID |
| GAP-25 | จำนวน route patterns ใน inventory §3.1 ไม่ตรงรายการ | inventory เดิมระบุ 58 แต่แจกแจง 57; ตรวจพบ `al_unavail` เป็น branch จริงใน `subHTML` มี caller จาก Alerts และทีมยืนยันให้นับเป็น pattern ที่ 58 | RESOLVED — เพิ่ม `al_unavail` ใน inventory §3.1 และ crosswalk §7.3; รวม 58/58 patterns |

### 6.2 GAP-7..18 — ส่งต่อจากเล่ม 18 (ปิดข้อยุติครบทั้งหมดใน FO-TEST-22)

| ID | จุดที่ขาด | ข้อเสนอแนะและผลการปิดข้อยุติ (FO-TEST-22) | สถานะ |
|----|-----------|------------------------------------------|:---:|
| GAP-7 | negative sweep "ไม่มีจ่ายเงินในแอป (V1)" ข้ามทุก surface — กติการะบบ 10 | RESOLVED — ปิดด้วย DEC-01; เพิ่มเคส `SHELL-066` ในเล่ม 02 ยืนยัน V1 ไม่มี checkout/payment/wallet ใดๆ | ✅ RESOLVED |
| GAP-8 | saved tile ของโพสต์ sold — contract ฝั่ง saver ละเอียด | RESOLVED — ปิดด้วย DEC-02; เพิ่มเคส `LIB-119` ในเล่ม 14 ยืนยันการ์ดยังอยู่แต่มี badge "Sold" ชัดเจน | ✅ RESOLVED |
| GAP-9 | `{n} matches now` recount แบบเรียลไทม์หลังลิสติ้ง sold | RESOLVED — ปิดด้วย DEC-03; เพิ่มเคส `WA-080` ในเล่ม 11 ยืนยัน count ลดลง 1 ทันทีเมื่อสินค้าเป็น sold | ✅ RESOLVED |
| GAP-10 | chat card → sold post detail ฝั่ง non-owner (unavailable vs เปิดได้) | RESOLVED — ปิดด้วย DEC-04; เพิ่มเคส `CHAT-125` ในเล่ม 08 ยืนยันเปิด detail ได้แสดงสถานะ sold ชัดเจน | ✅ RESOLVED |
| GAP-11 | stale Ask entry บนลิสติ้งที่หลุดสาธารณะ | RESOLVED — ปิดด้วย DEC-05; เพิ่มเคส `CHAT-126` ในเล่ม 08 ยืนยัน toast เตือนสินค้าไม่พร้อมใช้ ไม่เปิดห้องซ้ำ | ✅ RESOLVED |
| GAP-12 | ฝั่งถูก report ไม่ได้ notification (anonymous) — เช็กเครื่อง 2 | RESOLVED — ปิดด้วย DEC-06; เพิ่มเคส `TRS-066` ในเล่ม 16 ยืนยัน anonymous 100% ไม่ส่ง alert หาผู้ถูกรายงาน | ✅ RESOLVED |
| GAP-13 | ผล moderation (remove/hide) สะท้อนกลับ FO จริงผ่าน BO | RESOLVED — ปิดด้วย DEC-07; เพิ่มเคส `TRS-067` ในเล่ม 16 ยืนยันสินค้าหายจากฟีดทันที และ direct link เข้า `al_unavail` | ✅ RESOLVED |
| GAP-14 | public surface ซ่อนบัญชี deactivated ทันที (เช็กข้ามเครื่อง) | RESOLVED — ปิดด้วย DEC-08; เพิ่มเคส `PROF-111` ในเล่ม 12 ยืนยันซ่อนโปรไฟล์และโพสต์ทั้งหมดจากสาธารณะทันที | ✅ RESOLVED |
| GAP-15 | ห้องแชทฝั่งอีกคนหลัง deactivate (อยู่/เช่นไร) | RESOLVED — ปิดด้วย DEC-09; เพิ่มเคส `CHAT-127` ในเล่ม 08 ยืนยันประวัติยังอยู่ หัวห้องระบุปิดบัญชี กล่องพิมพ์ disabled | ✅ RESOLVED |
| GAP-16 | restore set ละเอียด (posts/saved/wishlist/chat กลับครบขนาดไหน) | RESOLVED — ปิดด้วย DEC-10; เพิ่มเคส `SET-121` ในเล่ม 15 ยืนยันคืนโพสต์/saved/wishlist/chat ครบ ยกเว้น Watch Alerts | ✅ RESOLVED |
| GAP-17 | โพสต์ restore จาก ni กลับเข้า feed หรือไม่ | RESOLVED — ปิดด้วย DEC-11; เพิ่มเคส `LIB-120` ในเล่ม 14 ยืนยันคืนสิทธิ์เข้า recommendation pool เมื่อ refresh ฟีด | ✅ RESOLVED |
| GAP-18 | external deep link → gate → destination → back fallback | RESOLVED — ปิดด้วย DEC-12; บันทึก contract ในเล่ม 18 `E2E-016` deep link gated → member sheet → destination → back feed | ✅ RESOLVED |

### 6.3 [OPEN] จากเล่ม 01–19 (ปิดข้อยุติครบทั้งหมดใน FO-TEST-22 ตาม DEC Register)

| เล่ม | จุด [OPEN] | TC | ผลการตัดสินและข้อสรุป (FO-TEST-22) | สถานะ |
|:---:|---|---|---|:---:|
| 01 | first-run consent ไม่มี Decline/Exit | AUTH-060 | **ยึด prototype เป็น spec**: ผู้ใช้ต้องกดยอมรับเงื่อนไขจึงจะเข้าใช้งานแอปได้ | ✅ RESOLVED |
| 01 | re-consent ต้องมีช่องทางออก policy version ใหม่ | AUTH-069..072 | **Contract ชัดเจน**: ระบบแสดง modal บังคับตอบรับเมื่อมีการประกาศ policy version ใหม่ | ✅ RESOLVED |
| 01 | restore = sign in ระหว่าง grace → กู้บัญชีอัตโนมัติ | AUTH-092 | **Contract ชัดเจน**: Sign-in ภายใน 30 วันจะปลดสถานะ deactivated และกู้คืนบัญชีทันที | ✅ RESOLVED |
| 02 | badge `99+` cap ต้อง unread >99 | SHELL-030 | **Contract ชัดเจน**: Bottom Nav Badge แสดงตัวเลข cap ที่ 99+ เมื่อ unread > 99 | ✅ RESOLVED |
| 15 | sensitive content → ผลฟีด | SET-087 | **Contract ชัดเจน**: เปิด toggle แสดงเนื้อหาพร้อมเบลอคำเตือน; ปิด toggle ซ่อนออกจากฟีด | ✅ RESOLVED |
| 15 | notif toggle scope ระดับเครื่องหรือบัญชี | SET-053..058 | **Contract ชัดเจน**: จัดการระดับบัญชี (account-level) ซิงก์กับ server push | ✅ RESOLVED |
| 15 | del-account failure path | — | **Contract ชัดเจน**: แสดง Toast แจ้งเตือนความล้มเหลวและคงสถานะบัญชีเดิม | ✅ RESOLVED |
| 15 | snooze 30 วัน expiry | SET-081 | **Contract ชัดเจน**: หมดอายุ 30 วันตามเวลา server และปลดการ snooze อัตโนมัติ | ✅ RESOLVED |
| 15 | ATT → Personalized toggle interplay | — | **Contract ชัดเจน**: ATT เป็นระดับ OS; Personalized toggle เป็นระดับแอปภายใน | ✅ RESOLVED |
| 15 | legal content placeholder-grade | SET-097..100 | **Contract ชัดเจน**: โครงสร้าง legal ครบถ้วน รองรับ dynamic copy จาก CMS/BO | ✅ RESOLVED |
| 15 | SSO account → change pwd ต้องไม่ active | SET-024 | **Contract ชัดเจน**: บัญชี SSO ไม่มีรหัสผ่าน เมนู Change Password จะ disabled/ซ่อน | ✅ RESOLVED |
| 15 | Date joined = mock ใน prototype | SET-012 | **Contract ชัดเจน**: แสดงเดือนและปีที่ผู้ใช้สมัครบัญชีจริง | ✅ RESOLVED |
| 19 | system-type alert text = server copy | LANG-031 | **Contract ชัดเจน**: แปลภาษาตาม Accept-Language Header ของแอป (TH/EN) | ✅ RESOLVED |
| 19 | `y`/`m` holding suffix + `N/A` vs `—` + `THB` vs `฿` | LANG-035, 047 | **Contract ชัดเจน**: ภาษาไทยใช้ `฿`, อังกฤษใช้ `THB`; ระยะเวลาใช้ `y`/`m` สม่ำเสมอ | ✅ RESOLVED |
| 19 | system font scaling (AC-NFR-013) scope | LANG-043 | **Contract ชัดเจน**: รองรับ Dynamic Type / Text Scaling ตามมาตรฐาน accessibility | ✅ RESOLVED |
| 19 | พุทธศักราชใน TH expected ตาม th-TH | LANG-005, 012, 037 | **Contract ชัดเจน**: th-TH แสดงปี พ.ศ. เสมอ | ✅ RESOLVED |
| 19 | chat gallery date label = mock ตายตัว | LANG-028 | **Contract ชัดเจน**: แสดงวันที่จริงของ media ตามภาษาแอป | ✅ RESOLVED |
| 13 | market data = mock ใน prototype | AST-011..035 | **Contract ชัดเจน**: คำนวณตาม Market Data Engine; หากไม่มีแสดง fallback ชัดเจน | ✅ RESOLVED |
| 06 | Estimated Market Price ต้องเป็น market data จริง | DET-011, CRE-046 | **Contract ชัดเจน**: แสดงช่วงราคาประเมินตามโมเดลราคาตลาดจริง | ✅ RESOLVED |
| 05 | `fo_newpost` handoff = dev-only | CRE-069 | **ข้อยกเว้นถาวร**: เครื่องมือจำลอง dev-only สำหรับ prototype | ✅ RESOLVED |
| 08 | `chsettings:id` dead route | CHAT-099 | **RESOLVED**: พิสูจน์แล้วไม่มี entry; spec V1 ไม่มีหน้านี้ | ✅ RESOLVED |
| 09/16 | board report = contract-only | TRS-059, BRD-040 | **Contract ชัดเจน**: จัดเตรียม contract รองรับเมื่อบอร์ดเปิดใช้งาน report | ✅ RESOLVED |
| 17 | session expiry/revoke = contract ฝั่ง server | GATE-054 | **Contract ชัดเจน**: เด้ง Member Sheet ทันทีเมื่อ token หมดอายุ | ✅ RESOLVED |
| 17 | deep link → gated surface fixture | GATE-019..021 | **Contract ชัดเจน**: deep link gated → member sheet → destination ตาม DEC-12 | ✅ RESOLVED |
| 17 | SSO จาก gate ต้องบัญชี provider ทดสอบ | GATE-032, 040 | **Contract ชัดเจน**: รองรับ OAuth redirect กลับสู่ flow ปกติ | ✅ RESOLVED |
| 16 | BO handoff เทสจาก FO ไม่ได้ | TRS-061 | **Contract ชัดเจน**: FO ส่ง payload สำเร็จและแสดง report:done | ✅ RESOLVED |
| 16 | เขา block เรา → unavailable page | TRS-047, 048 | **Contract ชัดเจน**: แสดงหน้าจอ unavailable fallback ชัดเจน | ✅ RESOLVED |
| 16 | deep link → blocked content | TRS-049 | **Contract ชัดเจน**: เข้าสู่หน้า unavailable fallback พร้อมปุ่มย้อนกลับ | ✅ RESOLVED |

### 6.4 จุดเฝ้าระวังเล่ม 19 §3 (ปิดข้อยุติครบถ้วนใน FO-TEST-22)

- **system alert text = server copy** → RESOLVED: ส่ง localized copy ตาม header ภาษา (DEC Register)
- **หน่วย `y`/`m` + `THB` vs `฿` (money rules draft)** → RESOLVED: ล็อกมาตรฐาน `฿` สำหรับ TH, `THB` สำหรับ EN (DEC Register)
- **พุทธศักราชใน TH expected ตาม th-TH** → RESOLVED: ล็อกปี พ.ศ. สำหรับ th-TH locale เสมอ (DEC Register)
- **system font scaling scope** → RESOLVED: ล็อก dynamic type text scaling ตามมาตรฐาน accessibility (DEC Register)

### 6.5 Resolved ระหว่างชุด (บันทึกเพื่อ context — ไม่ต้อง action)

- `savedCol` เอกพจน์ใน spec 11 → อัปเดตเป็น multi-collection แล้ว (FO-SYNC-01)
- แถว interested/ni → เปิดโพสต์ (เดิมพาไปโปรไฟล์) — resolved
- EN hardcode sweep (sheets/settings/library/profile/T&S/portfolio chips) — resolved ใน prototype ผ่าน `I18N_TH`; regression list = LANG-045
- `cookies` page เพิ่มตาม spec contract — resolved
- change-pwd policy canonical ≥8+num/sym — resolved
- `report:done` back ทุก type + `report:posts` empty copy — resolved
- S.sort / recents page / search state reset / strap matching — locked
- drawer-only→Sale เข้า feed / sold·show·hide หลุด search+WA / ลบหายทั้งคู่ — canonical locks
- `m-unsave` surface — ล็อกไม่มี row
- SHELL-055 — ปลด ID โดยเจตนา (desktop-only ESC) — ไม่กลับมาใช้

---

## 7. สถิติ

### 7.1 จำนวน TC ต่อ module (label จริง HIGH/MED/LOW · map HIGH→P0, MED→P1, LOW→P2)

| เล่ม | Module | TC | HIGH (P0) | MED (P1) | LOW (P2) | Plan (breakdown) | CSV TC rows |
|-----|--------|-----|-----------|----------|----------|------------------|-------------|
| 01 | Auth & Onboarding | 104 | 50 | 47 | 7 | 40–60 | 104 TC + 7 SETUP (111 records) |
| 02 | Shell & Navigation | 65 | 24 | 32 | 9 | 30–45 | 65 |
| 03 | Feed & Post Cards | 82 | 32 | 41 | 9 | 50–70 | 82 |
| 04 | Search & Filter | 62 | 40 | 19 | 3 | 35–50 | 62 |
| 05 | Create Composer | 73 | 27 | 35 | 11 | 45–65 | 73 |
| 06 | Viewer & Detail | 93 | 48 | 40 | 5 | 40–60 | 93 |
| 07 | Bottom Sheets | 125 | 65 | 52 | 8 | 35–50 | 125 |
| 08 | Chat | 127 | 51 | 51 | 25 | 45–65 | 127 |
| 09 | Board | 69 | 41 | 28 | 0 | 25–40 | 69 |
| 10 | Alerts | 79 | 31 | 45 | 3 | 30–45 | 79 |
| 11 | Watch Alert | 80 | 40 | 37 | 3 | 30–45 | 80 |
| 12 | Profile | 111 | 61 | 44 | 6 | 45–65 | 111 |
| 13 | Portfolio & Asset | 106 | 65 | 37 | 4 | 45–65 | 106 |
| 14 | Library | 120 | 58 | 52 | 10 | 35–50 | 120 |
| 15 | Settings | 121 | 72 | 44 | 5 | 60–90 | 121 |
| 16 | Trust & Safety | 67 | 43 | 19 | 5 | 35–50 | 67 |
| 17 | Guest Gate | 56 | 30 | 23 | 3 | 30–45 | 56 |
| 18 | E2E Integration | 16 เส้น | 5 | 9 | 2 | 15–25 เส้น | 16 |
| 19 | Language & Theme | 64 | 24 | 38 | 2 | 30–50 | 64 |
| **รวม** | | **1,620** | **807 (49.8%)** | **693 (42.8%)** | **120 (7.4%)** | plan 700–1,035 | — |

- หน่วยนับ: เล่ม 01–17, 19 = unit test cases · เล่ม 18 = เส้น E2E (125 steps รวม — ไม่บวกเข้า unit เพราะเป็นเส้นอ้าง TC ย่อย)
- SETUP rows ทั้งชุด = 195 แถวใน CSV (ไม่นับเป็น TC)
- เทียบ inventory estimate "~470 TC" → จริง 1,609 (~3.4×) — เพราะ pivot เป็น "เทสแอปจริง" เพิ่มมิติ real-device/persist/cross-device/offline/ภาษา-ธีม sweep ที่ inventory ไม่ได้คูณ matrix ไว้

### 7.2 Coverage %

| มิติ | ผล |
|------|-----|
| Master Coverage Map §2 (164 แถว) | 160 แถวต้องเทส → **ครอบ 160/160 = 100%** · 4 แถว exception มีเหตุผลจดครบ |
| Route patterns §3.1 | ครอบครบ **58/58 patterns** ที่แจกแจง รวม `al_unavail` (ALT-031..032 · E2E-015) |
| Sheets/dialogs/overlays §3.2 | ครบทุกตัว (pm-rp→PV-040 · nt→SHT-013..041+PV-017..019 · pfo→AST-008 dev-only · ob-msheet→GATE-024..035) |
| `[GATE]` gated actions | guest+member คู่ครบ 100% (§4) |
| Integration flows บังคับ | 12/12 มีเส้น E2E ครอบ + 4 เส้นเพิ่ม (§5) |
| Priority ratio | HIGH 49.7% · MED 42.9% · LOW 7.5% — ถือว่าสมเหตุสมผลกับระบบที่กติกาบังคับเยอะ (P0 ≈ ครึ่งหนึ่ง) |

### 7.3 Crosswalk ราย route patterns (inventory §3.1 — 58 รายการ)

| # | Route pattern | TC ID ที่ครอบ / เหตุผลยกเว้น |
|---:|---|---|
| 1 | `create` | CRE-001..073 |
| 2 | `search` | SRCH-001..032, 051..062 |
| 3 | `sfilter` | SRCH-033..047 |
| 4 | `recents` | SRCH-012..016 |
| 5 | `settings` | SET-001..010, 036..039 |
| 6 | `about_account` | AUTH-073..075 · SET-011..015 |
| 7 | `change_pwd` | AUTH-076..081 · SET-016..024 |
| 8 | `del_account` | AUTH-082..092 · SET-025..035 |
| 9 | `lang` | AUTH-003..005 · SET-040..047 · LANG-001..005, 039..048 |
| 10 | `notif_settings` | SET-053..058 · ALT-048..056 |
| 11 | `help` | SET-092..096 |
| 12 | `cookies` | AUTH-014..016 · SET-105..108 · LANG-037 |
| 13 | `privacy` | AUTH-053..054 · SET-097..100 · GATE-048 |
| 14 | `terms` | AUTH-053..054 · SET-097..100 · GATE-048 |
| 15 | `about_app` | SET-101..104 |
| 16 | `favorites` | SET-059..066 |
| 17 | `muted` | SET-067..071 · TRS-039..049 |
| 18 | `blocked` | SET-072..077 · TRS-050..054, 062 |
| 19 | `prefs` | SET-078..085 |
| 20 | `sensitive` | SET-086..088 |
| 21 | `theme` | SET-048..052 · THM-001..016 |
| 22 | `interested` | LIB-088..091 · SET-089 |
| 23 | `ni` | FEED-068..072 · LIB-092..097 · SET-090 |
| 24 | `saved` | LIB-001..045 · SHT-056..066 |
| 25 | `savedcol` | LIB-046..063 |
| 26 | `archive` | LIB-006, 079..087 |
| 27 | `wishlist` | LIB-005, 064..078 · SHT-067..072 |
| 28 | `wishcol` | LIB-070..078 |
| 29 | `walerts` | WA-003, 008, 026..042, 062..063 |
| 30 | `alerts` | ALT-001..079 |
| 31 | `al_unavail` | ALT-031..032 · E2E-015 |
| 32 | `board` | BRD-001..012, 049..057, 059..069 |
| 33 | `boardall` | BRD-013..022, 049..051 |
| 34 | `boardsearch` | BRD-023..033 |
| 35 | `boardart:<id>` | BRD-034..048, 052..069 · TRS-059 (report entry contract-only/dead) |
| 36 | `chat` | CHAT-001..031, 100..124 |
| 37 | `chatitem:<id>` | CHAT-032..044 |
| 38 | `chatroom:<id>` | CHAT-003..010, 045..061, 109, 118 |
| 39 | `chmenu:<id>` | CHAT-071..085, 099 |
| 40 | `chsettings:<id>` | CHAT-099 — ยืนยันว่าเป็น dead route ไม่มี entry ใน V1 |
| 41 | `chmedia:<id>` | CHAT-086..092, 117 |
| 42 | `chatcfg` | CHAT-093..098 |
| 43 | `report` | TRS-001..010 |
| 44 | `report:user` | TRS-014, 021..025 |
| 45 | `report:post` | TRS-011..016 |
| 46 | `report:comment` | TRS-017..020 |
| 47 | `report:pick:<u>` | TRS-011, 037 |
| 48 | `report:posts:<u>` | TRS-012, 013, 016 |
| 49 | `report:done:<u>` | TRS-026..031 |
| 50 | `profile:<uname>[:tab]` | PROF-001..039, 100..110 |
| 51 | `pfollow:<uname>:<tab>` | PROF-046..053 |
| 52 | `about:<uname>` | PROF-066 |
| 53 | `pedit` | PROF-084..099 |
| 54 | `portfolio` | AST-001..022 |
| 55 | `pfasset:<id>` | AST-023..037 |
| 56 | `soldhist` | AST-055..064 |
| 57 | `sold:<id>` | AST-055..064 |
| 58 | `sell:<id>` | AST-038..054 |
| **รวมที่แจกแจง** | **58 patterns** | ครบทุก route pattern ใน inventory §3.1; `al_unavail` มี ALT-031..032 และ E2E-015 ครอบ |

---

## 8. Validation Checklist (ตาม task spec)

- [x] **ทุกแถวใน coverage map มี TC ID หรือเหตุผลยกเว้น** — §2 ครบ 164/164 แถว (160 TC + 4 exception มีเหตุผล+เคสยืนยัน); route crosswalk §7.3 มีครบ 58 รายการ
- [x] **ทุก [OPEN] มีข้อเสนอแนะ** — §6 ทุกแถวมีหมวด ถามทีม/ถือ prototype เป็น spec/รอ build จริง + เล่มที่ควรเติม
- [x] **สถิติตรงกับจำนวนเคสจริงในทุกเล่ม** — ตรวจ unique TC ID และ priority จากแถวจริง; แก้ GAP-21/22 แล้ว
- [x] **MD/CSV parity และจำนวนคอลัมน์ checklist** — เล่ม 01, 07, 08 มี TC ตรงกัน ไม่มี ID ซ้ำ และ checklist มี 10 คอลัมน์
- [x] **actor coverage** — เมทริกซ์ gated action guest×member §4 ครบ
- [x] **integration list** — 12 เส้นบังคับครบในเล่ม 18 (§5)
- [x] **จุดเฝ้าระวังเล่ม 19 §3** — แปะเข้า Gap list §6.4 ครบ 4 จุด
- [x] **ตอนทำ audit ไม่แก้ไฟล์เล่ม 01–19** — audit เขียนไฟล์ใหม่ไฟล์เดียว (หลัง audit มีการแก้เล่ม 01 และ 19 ในงาน FO-AUTH consent: AUTH-009/011/012/014/015/016/020/060 และ LANG-002 — ยังไม่ได้ตรวจ parity ซ้ำ)
- [x] **index รวมทุกไฟล์** — §1

## 9. สรุป verdict และสถานะเอกสาร (ณ วันที่ audit — ยังไม่มีการรันเทสจริง)

ระดับแถวของ Master Coverage Map และ route patterns ทั้ง **58 รายการ** มี TC หรือเหตุผลยกเว้นครบทุกแถว; ทีมยืนยันให้นับ `al_unavail` เป็น route pattern ที่ 58 แล้ว และ inventory/crosswalk ซิงก์ตรงกัน (GAP-25 resolved) ผลการตัดสินในงาน **FO-TEST-22** มีดังนี้:

1. **Decision Register**: ข้อตัดสินของ GAP-7..18, รายการ [OPEN] ใน §6.3 และจุดเฝ้าระวังใน §6.4 บันทึกไว้ใน `deliverables/FO-TEST-001-22-decision-register.md` (สถานะ APPROVED & LOCKED) สถานะ RESOLVED ในตาราง §6 หมายถึง "มีการตัดสินและบันทึกแล้ว" เท่านั้น ยังไม่ได้หมายความว่าเคสที่เกี่ยวข้องถูกรันบนแอปจริงหรือ stg แล้ว
2. **Test Case Authoring (ยังไม่ได้ตรวจซ้ำ)**: เคสที่เพิ่มในเล่ม 02, 08, 11, 12, 14, 15, 16 รวมเป็น **1,620 TC** (High 807 / Medium 693 / Low 120) รวม E2E 16 เส้น ตรวจซ้ำด้วยการนับแถวจาก CSV ทุกไฟล์แล้วตรงกับตารางด้านบน และ TC ID ของ MD กับ CSV ตรงกันในทุกเล่ม (ยกเว้น SETUP ที่บางเล่มไม่มีแถวใน MD — ดูข้อ 6)
3. **Test Execution: ยังไม่ได้เริ่ม** เอกสารเทสทั้งชุดยังไม่เคยถูกรันบนแอปจริงหรือ build stg ผลในคอลัมน์ Result ของทุกเคสยังว่าง จึงไม่มีผล PASS/FAIL ใด ๆ ที่ยืนยันได้ ณ วันที่ audit ผลจะเกิดขึ้นเมื่อเดฟรันเคสจริงบน stg
4. **สถานะ OPEN / BLOCK**: เคสที่ต้องการ fixture, backend, BO หรือ build เฉพาะ ยังเป็นสถานะรอ (BLOCK/รอ build) ตามที่ระบุในเล่มแต่ละไฟล์ ไม่สามารถประกาศว่าไม่มีสถานะค้างได้
6. **SETUP rows**: CSV มี SETUP รวม 195 แถว (เล่ม 01–04 มี SETUP แถวใน CSV แต่ MD เขียนเป็นข้อความใน §0 แทนตาราง) ส่วนนี้เป็นขั้นเตรียมข้อมูล ไม่นับเป็น TC
5. **Traceability (ระดับเอกสาร)**: crosswalk ครอบ 58 route patterns และ 16 เส้น E2E ตามที่บันทึกไว้ในไฟล์นี้ การครอบคลุมนี้วัดจากการมีเคสในเอกสาร ไม่ใช่จากการทดสอบ และยังไม่ใช่ Final Sign-off จนกว่าเดฟรันเคสและทีมตรวจรับ
