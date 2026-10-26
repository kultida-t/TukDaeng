# FSP-029 — Mission Acceptance Criteria Verification + Prototype Untouched Evidence

Date: 2026-10-22
Task: `1992b2f7` — "FSP-029 ตรวจ AC รวม + verify prototype ไม่ถูกแตะ" (mission:cc291dc9)
Scope: ตรวจ Acceptance Criteria ระดับ Mission ทั้งชุด — gap inventory ครบ, ไม่มี spec อ้างฟีเจอร์ที่ prototype ไม่มี, cross-reference ไม่แหว่ง, DOCUMENT_VERSION = FO-PRD-v1.9, `git status`/`git diff` ของ `Prototypes/` ว่างเปล่า
Context: ทำหลัง FSP-028 (DOCUMENT_VERSION bump เสร็จแล้ว) — canonical = locked `Prototypes/fo-flow/index.html` + master §16 Sync Decision Log (S-01–S-29) + `FSP-005-consolidated-gap-signoff.md`
Rule: ห้ามแตะ `Prototypes/` เด็ดขาด — task นี้เป็น verify-only ไม่แก้ไฟล์ spec ใด ๆ

## 1. AC Result Matrix

| # | Acceptance Criterion | Result | หลักฐาน |
| --- | --- | --- | --- |
| AC-1 | Gap inventory ครบ | **PASS** | 7 gap files ครบทุก spec cluster + FSP-005 consolidated sign-off (§2) |
| AC-2 | ไม่มี spec อ้างฟีเจอร์ที่ prototype ไม่มี | **PASS** | 2 sweeps × 369 hits ทั้งหมด classify เป็น intentional — live stale ใหม่ = 0 (§3) |
| AC-3 | Cross-reference ไม่แหว่ง | **PASS (ใน mission scope)** | FO-internal markdown links + AC code refs + deleted-file refs สะอาด; findings นอก edit scope 2 จุด flag ไว้ (§4/§5) |
| AC-4 | DOCUMENT_VERSION = FO-PRD-v1.9 | **PASS** | Header baseline v1.9 + Release Date 2026-10-22 + version refs ทุกจุดที่ claim current = v1.9 (§6) |
| AC-5 | Prototype ไม่ถูกแตะ | **PASS** | `git status --porcelain -- Prototypes/` = 0 lines; `git diff --stat -- Prototypes/` = ว่าง (§7) |

## 2. AC-1 — Gap Inventory Coverage

Gap files 7 ไฟล์ใน `deliverables/fo-spec-sync/` ครบทุก cluster ตาม FSP-005 §1:

| Gap file | Spec เทียบ | Prototype-only (A) | Spec-only (B) | Conflicts (C) |
| --- | --- | --- | --- | --- |
| `gap-FSP-001a-auth.md` | 01_AUTHENTICATION | 13 | 10 | 8 |
| `gap-FSP-001b-nav.md` | 00_GLOBAL + 00_NAV | 10 | 12 | 9 |
| `gap-FSP-002a-feed-search.md` | 02_FEED + 03_SEARCH | 15 | 20 | 21 |
| `gap-FSP-002b-create-saved-wa.md` | 10_WATCH_ALERT + 11_SOCIAL (+04) | 11 | 12 | 13 |
| `gap-FSP-003a-profile-portfolio.md` | 06_PROFILE + 14_PORTFOLIO | 14 | 23 | 19 |
| `gap-FSP-003b-chat-notifications.md` | 07_CHAT + 09_NOTIFICATION | 10 | 20 | 19 |
| `gap-FSP-004-board-settings.md` | 12_BOARD + 13_SETTINGS | 13 | 23 | 17 |

- Consolidated sign-off `FSP-005-consolidated-gap-signoff.md`: dedupe map D1–D25, Removal List RL-01–04, Sign-off S-01–S-29 (§4) — ครบทุกข้อที่ต้องตัดสินก่อน execution
- Evidence chain ต่อเนื่อง: gap files (FSP-001–004) + sign-off (FSP-005) + evidence files FSP-007–028 + commit `4f0e0ad` (FSP-001–021); FSP-006 ไม่มี evidence file แยก — งานลบ `08_OFFER_MODULE.md` + offer refs ใน module specs ถูกบันทึกใน FSP-007 evidence §RL-01 context + commit เดียวกัน (ไม่ใช่ gap ของ inventory แต่เป็นรูปแบบ evidence ที่ต่างจาก task อื่น — flag เบา ๆ ใน §5)
- Module specs ปัจจุบัน: `00`–`18` ลบ `08_OFFER_MODULE.md` แล้ว + ไม่มีไฟล์ Figma 2 ไฟล์ — ตรง file inventory ของ baseline v1.9

## 3. AC-2 — Spec ไม่อ้างฟีเจอร์ที่ prototype ไม่มี (Stale-Feature Sweep)

Sweep 2 รอบทั้ง `FrontOffice/`:

| Sweep | Terms | Hits | Live stale |
| --- | --- | --- | --- |
| #1 | `offer`/`08_OFFER`, `Price on request`, `Notification Center`, `Global Login Required`, `Total Asset Value`, `Top Brand`, `infinite scroll`, `load-more`, `multi-step`, `Contact Seller`, `Hide this asset`, `Confirm Password`, `provenance`/`consignment`, `Figma` | 280 (26 ไฟล์) | **0** |
| #2 | `Result List`, `saved search`, `read receipt`, `Letter Sealing`, `Verification Success`, `Reset Password`, `OTP expiry`, `auto-login`, `guest share`, `Make Offer`, `Incoming Offers` | 89 | **0** |

Classification ของ hits ทั้งหมด (ทุกราย = intentional):

| ประเภท | ตัวอย่าง |
| --- | --- |
| Negation / `ไม่มีใน V1` | module specs "ไม่มีใน V1" tables, QA "Expected result: None exist", master "ไม่มีใน V1: Offer ทั้งชุด…" |
| Rename-trace | `เดิมเรียก Global Login Required Dialog → Member Sheet`, `เดิมเรียก Notification Center → Alerts feed` (00_GLOBAL §11 note + ทุก canonical ref) |
| `ขัด spec เดิม` deviation tables | 05/06/12/14 headers + D-tables บันทึก spec เดิม vs prototype (เอกสารตั้งใจบันทึก deviation) |
| Sync notes / S-xx decision log | legacy tier sync notes (PRD/Use_Cases/FO_Functional_PRD/DEV checklists/ERROR_STATE), master §16 S-01–S-29 rows |
| QA guard/negation | `QA_TEST_SCENARIO_CHECKLIST.md` §1.3 Removed-behaviors guard table 24 rows + expected results ที่ตรวจว่าฟีเจอร์ "ไม่มี" |
| Historical version log | `DOCUMENT_VERSION.md` entries v1.0–v1.8 + `FINAL_HANDOFF_SUMMARY`/`README_MODULE_INDEX` หมายเหตุรอบ — ไม่แก้ย้อนตาม version-log rule |
| Contract-only marks | `(contract — prototype ไม่ครอบ)` เช่น ERROR_STATE load-more states, deep links, analytics, Report Article (S-04), file message (S-29) |
| Prototype copy quote | `consignment`/`สินค้าฝากขาย` ใน 14_PORTFOLIO = copy ที่ prototype แสดงจริงใน foot note (copy-only ไม่มี implementation — D12) |
| Dead-copy documentation | E2E/`Letter Sealing` footer claim — spec ระบุชัดว่า "ห้าม spec เป็น feature" (S-18) |
| Known residual → FSP-030 | `15_TRUST` L114 `Global Login Required Dialog` + L270 `Notification Center`; `16_INTEG` L69-70 `Global Login Required`; `17_NFR` L85 `infinite scroll`; `00_GLOBAL` L356 notif-type list `ใช้เฉพาะ Like, Comment, Follow, Watch Alert` (ขาด `system` — S-17; flag เดิมระบุ L15 แต่ตำแหน่งจริง L356) |
| Documented defects | `salePosts()` pfkind leak (S-10), public `all` tab leak (S-14), sold-post `FOR SALE` tag — ไม่แก้ prototype, QA บังคับ log defect |

Offer refs: `[Oo]ffer` = 24 hits ทั้ง FrontOffice/ — ทุกจุดอยู่ในบริบท negation (`ไม่มี Offer`/`ถอดแล้ว`), removal note ใน 13_SETTINGS retention copy, QA guard table, DOCUMENT_VERSION history — **live offer feature ref = 0**

## 4. AC-3 — Cross-Reference Integrity

| Check | Result |
| --- | --- |
| Markdown links `[..](x.md)` ใน FrontOffice/ | unique targets 28 รายการ — 26 ตรงไฟล์จริง + `../ProjectAdmin/FO_BO_INTEGRATION_MAP.md` (2 refs — ดู finding F-2) |
| Refs ไปไฟล์ที่ถูกลบ (`08_OFFER_MODULE`, `Figma_Gap_Checklist_Against_Master`, `FIGMA_UX_CLEANUP_TASK_BREAKDOWN`) | ใน FrontOffice/: เหลือเฉพาะ `DOCUMENT_VERSION.md` historical entries + v1.9 removal description — intentional ทั้งหมด |
| AC code cross-refs | 502 unique `AC-*` codes ที่ QA checklist อ้าง → **0 missing** เทียบ 569 codes ที่นิยามใน spec files ทั้งชุด |
| Version refs | ทุกไฟล์ที่ claim `Current Baseline` = `FO-PRD-v1.9` (DOCUMENT_VERSION, README_MODULE_INDEX, FINAL_HANDOFF_SUMMARY, root README `Current Front Office baseline`) |
| Module inventory refs | README_MODULE_INDEX ไม่มี entry ชี้ 08/Figma docs; master §16 canonical ครบ S-01–S-29 |

## 5. Findings / Deviations (ไม่กระทบ AC ใน mission scope — flag ให้ตัดสินใจ)

| # | Finding | สถานะ / ข้อเสนอ |
| --- | --- | --- |
| F-1 | **BackOffice docs ยังอ้าง `../FrontOffice/08_OFFER_MODULE.md`** — `BackOffice/09_OFFER_CHAT_MODULE.md` L12, `13_ACCOUNT_DELETION_MODULE.md` L12, `14_NOTIFICATIONS_MODULE.md` L7, `15_REPORTS_ANALYTICS_MODULE.md` L7, `BackOffice/DOCUMENT_VERSION.md` L110 (+สำเนา historical ใน `deliverables/mission-1-obj*/DOCUMENT_VERSION.md`) — link dangle ตั้งแต่ FSP-006 ลบไฟล์; BO spec เป็นเอกสารคนละชุด/locked tier นอก edit scope ของ mission นี้ (FSP-008 เคย minimal-fix BO link 1 จุดใน `07_DIRECTORY`) | flag — รอผู้ใช้ตัดสินว่าจะ cleanup refs ฝั่ง BO ใน task แยกหรือไม่ (ไม่ใช่ AC breach ของ FO mission: cross-ref rule ครอบ FO doc set ที่ mission แก้) |
| F-2 | **`ProjectAdmin/FO_BO_INTEGRATION_MAP.md` ถูกลบตั้งแต่ commit `adb265a` (2026-07-10)** — แต่ยังถูก link จาก `README.md` L7/L35/L84/L90 + `FrontOffice/README_MODULE_INDEX.md` L51 + `FrontOffice/18_ADMIN_SCOPE_NOTE.md` L24 — pre-existing broken ref ไม่เกี่ยวกับ mission นี้ | flag — เสนอ task แยกตัดสิน: ลบ refs หรือ restore integration map |
| F-3 | FSP-006 ไม่มี evidence file แยก (`FSP-006-*-evidence.md` ไม่มีใน deliverables/) — งานถูกบันทึกผ่าน FSP-007 evidence + commit `4f0e0ad` | note only — audit trail ยัง trace ได้ครบ ไม่ต้องย้อนสร้าง |
| F-4 | Residual stale 5 จุด (15_TRUST L114/270, 16_INTEG L69-70, 17_NFR L85, 00_GLOBAL L356) + DOCUMENT_VERSION §2 historical block `Module PRD 00-18` | tracked → FSP-030 ตาม flag เดิม (ไม่เปลี่ยน) |

## 6. AC-4 — DOCUMENT_VERSION

| Check | Result |
| --- | --- |
| `FrontOffice/DOCUMENT_VERSION.md` header | `Current Baseline Version: FO-PRD-v1.9` + `Release Date: 2026-10-22` + §2 v1.9 scope paragraph + §3 history row + §4 Dev Reference ✓ |
| Live baseline claims อื่น | README_MODULE_INDEX L5, FINAL_HANDOFF_SUMMARY L5, root `README.md` L17 — ทั้งหมด `FO-PRD-v1.9` ✓ |
| `FO-PRD-v1.0–1.8` hits ที่เหลือ | intentional historical เท่านั้น (ตาม FSP-028 evidence §3 — ตรวจซ้ำรอบนี้ไม่พบ live claim ใหม่) |

## 7. AC-5 — Prototype Untouched

```
$ git status --porcelain -- Prototypes/     → (ว่าง — 0 lines)
$ git diff --stat -- Prototypes/            → (ว่าง — ไม่มี diff)
$ git status --porcelain                    → เฉพาะ FrontOffice/*.md (17 ไฟล์ modified), README.md, deliverables/fo-spec-sync/FSP-022–028 evidence (untracked)
```

Prototype `Prototypes/fo-flow/index.html` ไม่มีการแก้ไขตลอด mission — สอดคล้องข้อห้าม "ห้ามแก้ไข Prototypes/ เด็ดขาด" และยืนยันซ้ำกับ verify ของทุก task ก่อนหน้า

## 8. Verification Summary

| Check | Result |
| --- | --- |
| ไฟล์ที่แก้ใน task นี้ | ไม่มี — verify-only + evidence file นี้ |
| Mission AC | 5/5 PASS (AC-3 มี findings นอก edit scope — flag F-1/F-2 ไม่ใช่ breach) |
| Gap inventory | 7 gap files + consolidated sign-off + evidence chain FSP-005–028 ครบ |
| Spec-vs-prototype | live stale ใหม่ = 0; residual 5 จุด tracked → FSP-030; documented defects 3 จุดคงไว้ตาม sign-off |
| Cross-reference | FO-internal clean; AC refs 502→0 missing; deleted-file refs = historical only |
| Version | FO-PRD-v1.9 ทุกจุดที่ claim current baseline |
| Prototype | `Prototypes/` ว่างทั้ง status และ diff |
| Commit | ไม่ commit — FSP-022–029 uncommitted รอคำสั่งแยก (FSP-001–021 committed `4f0e0ad`) |

**Verdict: PASS** — Acceptance Criteria ของ Mission ครบทุกข้อตาม scope; findings F-1/F-2 เป็น pre-existing/cross-spec issues นอกขอบเขตแก้ไขของ mission (flag ให้ผู้ใช้ตัดสินใจ — ไม่บล็อก AC); residual consistency items ถูก track ไป FSP-030 ตามแผนเดิม
