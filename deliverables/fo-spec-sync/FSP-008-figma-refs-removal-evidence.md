# FSP-008 — Figma Docs/Sections/Refs Removal Evidence

**Task:** `b32328d8` — FSP-008 ลบเอกสาร Figma 2 ไฟล์ + Figma Gap sections + refs
**Mission:** Sync FrontOffice Spec ให้ตรง fo-flow Prototype (FO-PRD-v1.9) → Objective 2: ลบเนื้อหาที่ไม่ตรง Prototype | Feature: Remove Figma References
**Closed:** 2026-10-21 15:15 ICT | **hours_spent:** 0.35 ชม. (banked by auto-timer)
**Commit:** ยังไม่ได้ commit — changes อยู่ใน working tree รวมกับ FSP-006/007 (รอผู้ใช้สั่ง commit)

## Deleted files (staged `D`)

- `FrontOffice/Figma_Gap_Checklist_Against_Master.md` — ลบทั้งไฟล์ (49 figma lines)
- `FrontOffice/FIGMA_UX_CLEANUP_TASK_BREAKDOWN.md` — ลบทั้งไฟล์ (38 figma lines)

## Figma Gap Checklist sections removed + renumbered (19 files)

`00_GLOBAL_RULES_MODULE.md`, `00_NAVIGATION_AND_CROSS_MODULE_FLOW.md`, `01_AUTHENTICATION_MODULE.md`, `02_FEED_MODULE.md`, `03_SEARCH_FILTER_MODULE.md`, `04_ASSET_MANAGEMENT_MODULE.md`, `05_ASSET_DETAIL_MODULE.md`, `06_PROFILE_MODULE.md`, `07_CHAT_MODULE.md`, `09_NOTIFICATION_MODULE.md`, `10_WATCH_ALERT_MODULE.md`, `11_SOCIAL_MODULE.md`, `12_BOARD_MODULE.md`, `13_SETTINGS_MODULE.md`, `14_PORTFOLIO_MODULE.md`, `15_TRUST_SAFETY_MODULE.md`, `16_INTEGRATIONS_MODULE.md`, `17_NON_FUNCTIONAL_REQUIREMENTS.md`, `18_ADMIN_SCOPE_NOTE.md`

ส่วนนี้รวม stray figma refs นอก section ที่ sweep ออกด้วย (00_NAV guardrail/chat sidebar, 00_GLOBAL interaction-state naming, 15_TRUST work pack ref, 18_ADMIN baseline ref ฯลฯ)

## Central documents — active refs removed (8 files)

- `FrontOffice/README_MODULE_INDEX.md` — ลบ `# 5. Figma Review Workflow` ทั้ง section + renumber §6→§5; เอาออกจาก Source Of Truth Order (item 5-6), Recommended Reading Path rows, readiness list, decision-table follow-ups (20 figma diff lines)
- `FrontOffice/DOCUMENT_VERSION.md` — ลบเฉพาะ live refs: status line, version rule, baseline scope list → ตัด "Figma" ออกจาก handoff target; **version-history entries v1.0–v1.7 เก็บไว้** (บันทึกเหตุการณ์อดีตตาม sign-off FSP-005)
- `FrontOffice/DEV_BASELINE_HANDOFF_2026-06-22.md` — ตัด "Figma" จาก handoff target + ลบ `# 5. Figma Timing` section → renumber §6→§5 + ลบ Figma follow-up bullet (13 lines)
- `FrontOffice/FINAL_HANDOFF_SUMMARY.md` — ลบ links 2 ไฟล์ + `# 3. Figma Must Fix` section → renumber §4–9→§3–8 + readiness rows (11 lines)
- `FrontOffice/DEV_IMPLEMENTATION_CHECKLIST.md` — ลบ ref link + purpose wording + 2 Figma gate items (6 lines)
- `FrontOffice/ERROR_STATE_UI_COPY_CATALOG.md` — ตัด Figma-to-Dev wording 2 จุด
- `FrontOffice/QA_TEST_SCENARIO_CHECKLIST.md` — ลบ ref link
- `FrontOffice/TukDaeng_Master_Product_Definition.md` — ตัด Figma-cleanup clause
- `README.md` (root) — ลบ 2 key-file rows + ปรับ folder map/note (4 lines)

## Cross-repo dangling fix (1 file)

- `BackOffice/07_DIRECTORY_MODULE.md` — แก้ reference ที่ชี้มา `../FrontOffice/Figma_Gap_Checklist_Against_Master.md` ซึ่งถูกลบ → ชี้ไปเอกสาร FO ที่ยังมีจริง (minimal fix — link จะ dangle)

## Files intentionally NOT touched

- `Prototypes/**` — ห้ามแตะเด็ดขาด; `git status --porcelain Prototypes/` = ว่าง
- `DailyLogs/**`, `deliverables/**` — บันทึกเหตุการณ์อดีต คงไว้
- `FrontOffice/DOCUMENT_VERSION.md` history entries — คงไว้ตาม sign-off (24 figma hits ล้วน version narratives)
- `BackOffice/DOCUMENT_VERSION.md` — history row เพียงจุดเดียว คงไว้
- `FrontOffice/PRD.md`, `FO_Functional_PRD.md`, `Use_Cases.md`, `DEV_CHAT_IMPLEMENTATION_CHECKLIST.md` — diff ของไฟล์กลุ่มนี้เป็นงาน FSP-007 (offer removal) ไม่มี figma diff

## Verification results

- `git diff HEAD -- FrontOffice/ | grep -c "^-.*[Ff]igma"` = **215 removed / 0 added**
- `grep -i figma` ใน `FrontOffice/` = 27 hits: `DOCUMENT_VERSION.md` 24 (history entries ทั้งหมด), `README_MODULE_INDEX.md` 1 + `FINAL_HANDOFF_SUMMARY.md` 2 (dated notes — history)
- refs ชื่อไฟล์ 2 ตัวข้าม repo เหลือเฉพาะ `DOCUMENT_VERSION` history, `deliverables/`, `DailyLogs/` — **live docs = 0 dangling**
- `grep "^#+.*[Ff]igma"` ทั้ง repo เหลือเฉพาะ DailyLogs + deliverables sign-off headings — **ไม่มี figma heading ใน live docs**
- `git status --porcelain Prototypes/` = **ว่าง** (ไม่แตะ prototype)
