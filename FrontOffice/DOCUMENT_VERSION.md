# TukDaeng Document Version

**Current Baseline Version:** `FO-PRD-v1.4`
**Release Date:** 2026-08-21
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

`FO-PRD-v1.4` covers all of `FO-PRD-v1.3` and clarifies Share Asset Deep Link, Share Profile Deep Link, and navigation-after-deep-link behavior for Dev / QA / Figma:

- Master Share V1 updated: Share Asset entry point expanded to Feed Card, Asset Detail, and Profile asset grid; Share Profile entry point is Owner Profile and Public Profile. Comment still Asset Detail only.
- Asset Detail Share Rule synced with master and Social Module: system share sheet primary, copy public deep link fallback, Guest share without Login, no Notification Center item, full deep link validation
- Shared deep link display state matrix by status (`Sale` / `Show` / `Hide` / `Sold` / Deleted / blocked) and user context (Guest / Login non-owner / Owner)
- Shared profile deep link display state for blocked and deleted user
- Back button on normal Asset Detail opened from external deep link must fallback to Feed when no navigation history
- Main navigation (bottom tab / menu) must remain available after opening a deep link for both Guest and Login users
- Hide / Sold stale deep link by non-owner must show Permission Denied / Unavailable state; Owner sees Owner-only detail
- New module ACs (AC-DETAIL-026A–026H, AC-NAV-016A–016D, AC-FEED-017J–017L, AC-PROFILE-007D–007I) and QA scenarios (QA-GLOBAL-003C–003H)

`FO-PRD-v1.3` covers all of `FO-PRD-v1.2` and clarifies account suspension handling for Dev / QA / Figma:

- V1 has no `Restricted` / feature-level account state
- Suspended/Banned users cannot enter the main app and must see an account status state
- BO suspend/ban must revoke/block active sessions
- Email is the primary user notification channel for suspend/ban; FO Notification Center does not add Account Action type
- Apple private relay and Google email must be treated as account email channels when provider configuration supports delivery

`FO-PRD-v1.2` covers all of `FO-PRD-v1.1` and adds the final error-state UI copy handoff for Dev / QA / Figma:

- Feed refresh failure, load-more failure, image failure, and owner fallback copy / retry scope
- Shared full-page, banner/snackbar, inline section, image placeholder, permission/unavailable, and empty-state rules
- QA scenario updates for finalized Feed error states

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
| `FO-PRD-v1.4` | 2026-08-21 | Clarifies Share Asset Deep Link, Share Profile Deep Link, and navigation-after-deep-link behavior. Expands Share Asset entry points to Feed Card, Asset Detail, and Profile asset grid (master override). Adds Share Profile entry points (Owner Profile, Public Profile). Syncs Asset Detail Share Rule with master and Social Module. Adds shared deep link display state matrix by status and user context for both asset and profile. Adds back button fallback to Feed for normal screen opened from external deep link. Adds main navigation availability after deep link for Guest and Login. Adds Hide/Sold stale deep link Permission Denied / Unavailable state for non-owner and Owner-only detail for owner. | `TukDaeng_Master_Product_Definition.md`, `00_NAVIGATION_AND_CROSS_MODULE_FLOW.md`, `02_FEED_MODULE.md`, `05_ASSET_DETAIL_MODULE.md`, `06_PROFILE_MODULE.md`, `11_SOCIAL_MODULE.md`, `Figma_Gap_Checklist_Against_Master.md`, `FIGMA_UX_CLEANUP_TASK_BREAKDOWN.md`, `QA_TEST_SCENARIO_CHECKLIST.md` |
| `FO-PRD-v1.3` | 2026-07-16 | Clarifies suspended/banned account handling: no `Restricted` account state in V1, active session revocation, account status state on app entry/sign-in, email as primary suspend/ban notification, no Account Action type in FO Notification Center, and Apple/Google email handling. | `01_AUTHENTICATION_MODULE.md`, `00_NAVIGATION_AND_CROSS_MODULE_FLOW.md`, `09_NOTIFICATION_MODULE.md`, `15_TRUST_SAFETY_MODULE.md`, `16_INTEGRATIONS_MODULE.md`, `QA_TEST_SCENARIO_CHECKLIST.md` |
| `FO-PRD-v1.2` | 2026-07-02 | Final error-state UI copy and retry-scope handoff for Front Office. Locks Feed refresh failure, load-more failure, image failure, owner fallback, shared section/unavailable/empty-state behavior, and QA coverage before moving to Back Office work. | `ERROR_STATE_UI_COPY_CATALOG.md`, `02_FEED_MODULE.md`, `QA_TEST_SCENARIO_CHECKLIST.md`, `README_MODULE_INDEX.md`, `FINAL_HANDOFF_SUMMARY.md`, `DEV_IMPLEMENTATION_CHECKLIST.md` |
| `FO-PRD-v1.1` | 2026-06-23 | Product decision update for Asset Detail / Social comment model: support IG-style one-level replies, allow collapsed `View more replies`, and explicitly prohibit multi-level nested threads. Supersedes `FO-PRD-v1.0` for Dev / QA / Figma. | `TukDaeng_Master_Product_Definition.md`, `00_GLOBAL_RULES_MODULE.md`, `00_NAVIGATION_AND_CROSS_MODULE_FLOW.md`, `05_ASSET_DETAIL_MODULE.md`, `11_SOCIAL_MODULE.md`, `DEV_IMPLEMENTATION_CHECKLIST.md`, `DEV_CHAT_IMPLEMENTATION_CHECKLIST.md`, `QA_TEST_SCENARIO_CHECKLIST.md`, `Figma_Gap_Checklist_Against_Master.md`, `FIGMA_UX_CLEANUP_TASK_BREAKDOWN.md`, `FO_Functional_PRD.md` |
| `FO-PRD-v1.0` | 2026-06-22 | Initial Front Office baseline for Dev / QA / Figma handoff. Includes module PRD `00-18`, asset status rules, Add/Edit Asset required-field matrix, Chat-focused Dev checklist and Figma cleanup work packs. | `DEV_BASELINE_HANDOFF_2026-06-22.md`, `README_MODULE_INDEX.md`, `TukDaeng_Master_Product_Definition.md`, `DEV_IMPLEMENTATION_CHECKLIST.md`, `DEV_CHAT_IMPLEMENTATION_CHECKLIST.md`, `QA_TEST_SCENARIO_CHECKLIST.md`, `FIGMA_UX_CLEANUP_TASK_BREAKDOWN.md` |

---

# 4. Dev Reference Note

When sending documents to Dev, include both:

- Branch: `docs-frontoffice-spec-updates`
- Version: `FO-PRD-v1.4`

If Dev reports a gap or builds against this baseline, ask them to cite the version number in their response.
