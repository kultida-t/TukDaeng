# FSP-040 Spec doc re-sync — Evidence Bundle

Task: FSP-040 Spec doc re-sync — module specs ตาม prototype ปัจจุบัน + DEC-59/60 implement (fo-flow)
Task ID: 7a1b5521-3ff3-4506-80f3-ddb938d31303
Baseline: commit a3ca17d (FSP-039) → commits cf2889e + 4b1c4c6
Date: 2026-11-06

## Commits
- cf2889e — FSP-040: spec doc re-sync (21 files, +599/-225)
- 4b1c4c6 — FSP-040 tail: D11 TH copy canonical + B16 checklist FO-TEST-12 re-sync

## Files changed (deliverable)
- FrontOffice/*.md — 15 spec files + DEV_CHAT_IMPLEMENTATION_CHECKLIST.md
- Prototypes/fo-flow/index.html — title= EN-only sweep 20 จุด + D11 TH copy (2 จุด)
- docs/money-display-rules.md — B18 open-question flag
- Prototypes/scratch/_lineref-resync.cjs, _fsp040-spec-patch.cjs, _fsp040-title-sweep.cjs — helper scripts (sync method)

## Verification
- 6 FSP regression suites: 21+14+17+8+20+19 = 99 tests all pass (raw output: FSP-040-test-results.txt)
- Manual QA checklist (title= tooltips TH/EN, 6 cases): ผ่านทั้งหมด — ผู้ใช้ยืนยันในแชท
- DEC-59/60 code check: โค้ดถูกต้องอยู่แล้ว (salePosts() = discoverablePosts+price; .pf-stat ไม่อยู่ใน GUEST_GATE_SEL / row actions อยู่ครบ)

## Key decisions
- DEC-60: no code change needed — followers/following lists guest-viewable, row actions gated
- DEC-59: no code change needed — priced pfkind:"post" already in WA match pool
- D11: แก้ proto copy → canonical ไม่พร้อมใช้งานแล้ว (board article + chat)
- fo_session missing→member kept (rst dev flow); title= dev-only surfaces ข้ามตั้งใจ

## Evidence gaps
- ไม่มีภาพ Before/After (งานเป็น doc sync + tooltip copy เล็กน้อย — manual checklist ครอบคลุม)
