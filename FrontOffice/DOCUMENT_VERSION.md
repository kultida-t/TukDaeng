# TukDaeng Document Version

**Current Baseline Version:** `FO-PRD-v1.1`  
**Release Date:** 2026-06-23  
**Branch:** `docs-frontoffice-spec-updates`  
**Status:** Product-reviewed baseline update for Dev / QA / Figma

---

# 1. Version Rule

เอกสาร Front Office ทุกไฟล์ใน branch นี้ให้อ้างอิง version กลางเดียวกันจากไฟล์นี้

เมื่อมีการอัปเดต requirement ที่กระทบ Dev / QA / Figma ให้เพิ่ม version ใหม่ใน Version History และอัปเดต `Current Baseline Version`

## Version Format

ใช้ format:

```text
FO-PRD-vX.Y
```

- เพิ่ม `X` เมื่อมีการเปลี่ยน baseline ใหญ่ หรือเปลี่ยน scope สำคัญ
- เพิ่ม `Y` เมื่อมีการ clarify / เพิ่ม requirement / ปรับ checklist ที่ไม่เปลี่ยน scope หลัก

---

# 2. Current Baseline Scope

`FO-PRD-v1.1` ครอบคลุม `FO-PRD-v1.0` ทั้งหมด และเพิ่ม decision update:

- Asset Detail / Social comments รองรับ IG-style one-level replies ใต้ comment หลัก
- `View more replies` ใช้สำหรับกาง replies ชั้นเดียวใต้ comment หลัก
- ไม่รองรับ multi-level nested thread หรือ reply ซ้อนเกิน 1 ชั้น

Baseline scope หลักยังครอบคลุม:

- Master Product Definition
- Module PRD `00-18`
- Dev Baseline Handoff
- Dev Implementation Checklist
- Chat-specific Dev Checklist
- QA Scenario Checklist
- Figma Gap Checklist
- Figma UX Cleanup Task Breakdown

---

# 3. Version History

| Version | Date | Summary | Key Files |
| --- | --- | --- | --- |
| `FO-PRD-v1.1` | 2026-06-23 | Product decision update for Asset Detail / Social comment model: support IG-style one-level replies, allow collapsed `View more replies`, and explicitly prohibit multi-level nested threads. Supersedes `FO-PRD-v1.0` for Dev / QA / Figma. | `TukDaeng_Master_Product_Definition.md`, `00_GLOBAL_RULES_MODULE.md`, `00_NAVIGATION_AND_CROSS_MODULE_FLOW.md`, `05_ASSET_DETAIL_MODULE.md`, `11_SOCIAL_MODULE.md`, `DEV_IMPLEMENTATION_CHECKLIST.md`, `DEV_CHAT_IMPLEMENTATION_CHECKLIST.md`, `QA_TEST_SCENARIO_CHECKLIST.md`, `Figma_Gap_Checklist_Against_Master.md`, `FIGMA_UX_CLEANUP_TASK_BREAKDOWN.md`, `FO_Functional_PRD.md` |
| `FO-PRD-v1.0` | 2026-06-22 | Initial Front Office baseline for Dev / QA / Figma handoff. Includes module PRD `00-18`, asset status rules, Add/Edit Asset required-field matrix, Chat-focused Dev checklist and Figma cleanup work packs. | `DEV_BASELINE_HANDOFF_2026-06-22.md`, `README_MODULE_INDEX.md`, `TukDaeng_Master_Product_Definition.md`, `DEV_IMPLEMENTATION_CHECKLIST.md`, `DEV_CHAT_IMPLEMENTATION_CHECKLIST.md`, `QA_TEST_SCENARIO_CHECKLIST.md`, `FIGMA_UX_CLEANUP_TASK_BREAKDOWN.md` |

---

# 4. Dev Reference Note

When sending documents to Dev, include both:

- Branch: `docs-frontoffice-spec-updates`
- Version: `FO-PRD-v1.1`

If Dev reports a gap or builds against this baseline, ask them to cite the version number in their response.
