# TukDaeng Document Version

**Current Baseline Version:** `FO-PRD-v1.6`
**Release Date:** 2026-09-01
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

`FO-PRD-v1.6` covers all of `FO-PRD-v1.5` and clarifies that Market Comparison / Expected Profit are not part of V1 Asset Detail per current Figma (designed only in Portfolio / Assets Value):

- Asset Detail V1 ตาม Figma ปัจจุบัน **ไม่มี** ส่วนแสดงผล Market Comparison หรือ Expected Profit; analytics ทั้งสองออกแบบไว้ใน Portfolio / Assets Value เท่านั้น
- ย้าย Market Comparison / Expected Profit ออกจาก Price Analytics Rule หลักของ `05_ASSET_DETAIL_MODULE.md` ไปไว้ใน section ใหม่ "Pending Figma / Out of V1 Asset Detail Scope" พร้อมสูตรและ permission สำหรับใช้ในอนาคต
- ปรับ AC-DETAIL-010A และ AC-DETAIL-010B ให้ระบุ `(Pending Figma)` และอธิบายว่า V1 Asset Detail ยังไม่แสดง
- ปรับ Figma Gap Checklist (Asset Detail section ใน `05_ASSET_DETAIL_MODULE.md` และ `Figma_Gap_Checklist_Against_Master.md`) ให้ระบุชัดว่า Figma ปัจจุบันออกแบบไว้เฉพาะ Portfolio / Assets Value และต้องรอ product decision ก่อนเพิ่มใน Asset Detail
- ปรับ Portfolio Figma Gap (`14_PORTFOLIO_MODULE.md`) และ Market Comparison rule ให้ note ว่าการเพิ่มใน Asset Detail เป็น pending product decision
- ปรับ `FIGMA_UX_CLEANUP_TASK_BREAKDOWN.md` ให้ระบุ pending Figma / pending product decision สำหรับ Asset Detail Market Comparison และ Expected Profit
- ปรับ `DEV_IMPLEMENTATION_CHECKLIST.md` ส่วน Asset Detail ให้ mark pending; ส่วน Portfolio คงไว้แต่ note ว่าสูตรเดียวกันใช้ใน Asset Detail เมื่อ Figma ออกแบบเพิ่ม
- ปรับ `QA_TEST_SCENARIO_CHECKLIST.md`: QA-DETAIL-005 และ QA-DETAIL-006 ระบุ Pending Figma พร้อม note ให้ทดสอบเมื่อมีการเพิ่มส่วนนี้; QA-PORT-008 ระบุ Asset Detail เป็น pending

`FO-PRD-v1.5` covers all of `FO-PRD-v1.4` and aligns Profile asset-card quick action `...` with Figma design for Public / Visitor view:

- Public Profile / Visitor view แสดงปุ่ม `...` บน asset card สำหรับ Asset สถานะ `Sale` และ `Show` (เดิมห้ามแสดง)
- Visitor quick action menu มีเฉพาะ `Share asset` และ `Report asset` สำหรับ `Sale` และ `Show`
- Visitor ต้องไม่เห็น `Edit asset`, `Edit provenance`, `Edit purchase history`, `Mark as sold`, `Change status`, `Delete asset` หรือ `View sale history` ใน asset-card quick action
- Guest กด `Share asset` ได้โดยไม่ต้อง Login; Guest กด `Report asset` ต้องเจอ Global Login Required Dialog
- `Report asset` เปิด Trust & Safety Report Asset flow และไม่ซ่อน asset ทันทีจนกว่า Admin จะดำเนินการ
- เดิม AC-PROFILE-007C ห้าม `...` บน Public/Visitor view → เปลี่ยนเป็นอนุญาตเฉพาะ `Sale` และ `Show`
- อัปเดต AC-PROFILE-007A ถอดคำว่า "เฉพาะ Owner view" เพราะ `...` แสดงทั้ง Owner และ Visitor (ต่างแค่ action set)
- เพิ่ม AC-PROFILE-007J, 007K, 007L และ QA-PROFILE-002A-PUB, QA-PROFILE-002A-GUEST
- แก้ QA-PROFILE-002B ให้รวม `Share asset` ใน Sale และ Show ของ Owner และแยก Show กับ Hide ให้ชัด เพื่อสอดคล้องกับ AC-PROFILE-007B
- เพิ่ม negative test case ใน QA-PROFILE-002A-PUB และ QA-PROFILE-002A-GUEST สำหรับ `Hide` และ `Sold` (ต้องไม่แสดง `...`)
- อัปเดต AC-PROFILE-007I ให้รวม `Report asset` ในรายการ action ที่ Guest ต้อง Login ก่อน
- แก้ consistency: เพิ่ม "เท่านั้น" ใน AC-PROFILE-007E, AC-PROFILE-007J และ Share Asset rule ของ Public Profile
- เพิ่ม DEV_IMPLEMENTATION_CHECKLIST items สำหรับ Visitor `...` menu และ Guest policy
- อัปเดต Figma Gap Checklist Profile section ทั้งใน `06_PROFILE_MODULE.md` section 5 และ `Figma_Gap_Checklist_Against_Master.md`: เพิ่ม gap entry สำหรับการตรวจ Figma Visitor `...` menu หลังสเปก v1.5 อัปเดต

`FO-PRD-v1.4` covers all of `FO-PRD-v1.3` and clarifies Share Asset Deep Link, Share Profile Deep Link, Share Article Deep Link, and navigation-after-deep-link behavior for Dev / QA / Figma:

- Master Share V1 updated: Share Asset entry point expanded to Feed Card, Asset Detail, and Profile asset grid; Share Profile entry point is Owner Profile and Public Profile; Share Article entry point is Article Detail. Comment still Asset Detail only.
- Asset Detail Share Rule synced with master and Social Module: system share sheet primary, copy public deep link fallback, Guest share without Login, no Notification Center item, full deep link validation
- Article Share Rule synced with master: system share sheet primary, copy public Article deep link fallback, Guest share without Login, no Notification Center item, Article deep link validation
- Shared deep link display state matrix by status (`Sale` / `Show` / `Hide` / `Sold` / Deleted / blocked) and user context (Guest / Login non-owner / Owner) for Asset
- Shared profile deep link display state for blocked and deleted user
- Shared Article deep link display state for unpublished, deleted and invalid Article
- Back button on normal screen opened from external deep link must fallback to Feed when no navigation history (Asset Detail, Public Profile, Article Detail)
- Main navigation (bottom tab / menu) must remain available after opening a deep link for both Guest and Login users
- Hide / Sold stale deep link by non-owner must show Permission Denied / Unavailable state; Owner sees Owner-only detail
- New module ACs (AC-DETAIL-026A–026H, AC-NAV-016A–016F, AC-FEED-017J–017L, AC-PROFILE-007D–007I, AC-BOARD-010A–010F) and QA scenarios (QA-GLOBAL-003C–003H, QA-BOARD-002A–002F)

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
| `FO-PRD-v1.6` | 2026-09-01 | Clarifies that Market Comparison / Expected Profit are not part of V1 Asset Detail per current Figma (designed only in Portfolio / Assets Value). Moves Market Comparison / Expected Profit out of the main Price Analytics Rule in `05_ASSET_DETAIL_MODULE.md` into a new "Pending Figma / Out of V1 Asset Detail Scope" section that keeps the formulas and permissions for future use. Marks AC-DETAIL-010A and AC-DETAIL-010B as `(Pending Figma)`. Updates Figma Gap Checklist entries (Asset Detail section in `05_ASSET_DETAIL_MODULE.md` and `Figma_Gap_Checklist_Against_Master.md`) to state that current Figma has these analytics only in Portfolio / Assets Value and that adding them to Asset Detail requires product decision. Updates `14_PORTFOLIO_MODULE.md` Figma Gap and Market Comparison rule to note Asset Detail is pending. Updates `FIGMA_UX_CLEANUP_TASK_BREAKDOWN.md` to mark Asset Detail Market Comparison / Expected Profit as pending Figma / pending product decision. Updates `DEV_IMPLEMENTATION_CHECKLIST.md` Asset Detail items to pending; Portfolio items keep formulas with note that the same formulas apply to Asset Detail when Figma adds them. Updates `QA_TEST_SCENARIO_CHECKLIST.md` QA-DETAIL-005 and QA-DETAIL-006 to Pending Figma with notes; QA-PORT-008 notes Asset Detail is pending. | `05_ASSET_DETAIL_MODULE.md`, `14_PORTFOLIO_MODULE.md`, `Figma_Gap_Checklist_Against_Master.md`, `FIGMA_UX_CLEANUP_TASK_BREAKDOWN.md`, `DEV_IMPLEMENTATION_CHECKLIST.md`, `QA_TEST_SCENARIO_CHECKLIST.md` |
| `FO-PRD-v1.5` | 2026-09-01 | Aligns Profile asset-card quick action `...` with Figma for Public / Visitor view. Changes AC-PROFILE-007C from prohibiting `...` to allowing it for `Sale` and `Show` only. Updates AC-PROFILE-007A to remove "เฉพาะ Owner view" qualifier. Updates AC-PROFILE-007I to include `Report asset` in Guest login-required actions. Adds Visitor quick action menu (`Share asset`, `Report asset`) with Guest policy (Share without Login, Report requires Login). Adds AC-PROFILE-007J, 007K, 007L, QA scenarios QA-PROFILE-002A-PUB, QA-PROFILE-002A-GUEST with negative test cases for `Hide`/`Sold`. Fixes QA-PROFILE-002B to include `Share asset` in Owner Sale/Show and split Show/Hide for AC-PROFILE-007B consistency. Fixes consistency: adds "เท่านั้น" to AC-PROFILE-007E, AC-PROFILE-007J and Share Asset rule. Adds DEV_IMPLEMENTATION_CHECKLIST items. Updates Figma Gap Checklist Profile section with Visitor `...` menu verification gap. Adds Visitor `...` menu tasks to FIGMA_UX_CLEANUP_TASK_BREAKDOWN. | `06_PROFILE_MODULE.md`, `TukDaeng_Master_Product_Definition.md`, `QA_TEST_SCENARIO_CHECKLIST.md`, `DEV_IMPLEMENTATION_CHECKLIST.md`, `Figma_Gap_Checklist_Against_Master.md`, `FIGMA_UX_CLEANUP_TASK_BREAKDOWN.md` |
| `FO-PRD-v1.4` | 2026-08-21 | Clarifies Share Asset Deep Link, Share Profile Deep Link, Share Article Deep Link, and navigation-after-deep-link behavior. Expands Share Asset entry points to Feed Card, Asset Detail, and Profile asset grid (master override). Adds Share Profile entry points (Owner Profile, Public Profile). Locks Article Share channel (system share sheet primary, copy public Article deep link fallback). Syncs Asset Detail Share Rule with master and Social Module. Adds shared deep link display state matrix by status and user context for Asset, Profile, and Article. Adds back button fallback to Feed for normal screen opened from external deep link. Adds main navigation availability after deep link for Guest and Login. Adds Hide/Sold stale deep link Permission Denied / Unavailable state for non-owner and Owner-only detail for owner. | `TukDaeng_Master_Product_Definition.md`, `00_NAVIGATION_AND_CROSS_MODULE_FLOW.md`, `02_FEED_MODULE.md`, `05_ASSET_DETAIL_MODULE.md`, `06_PROFILE_MODULE.md`, `11_SOCIAL_MODULE.md`, `12_BOARD_MODULE.md`, `Figma_Gap_Checklist_Against_Master.md`, `FIGMA_UX_CLEANUP_TASK_BREAKDOWN.md`, `QA_TEST_SCENARIO_CHECKLIST.md`, `DEV_IMPLEMENTATION_CHECKLIST.md` |
| `FO-PRD-v1.3` | 2026-07-16 | Clarifies suspended/banned account handling: no `Restricted` account state in V1, active session revocation, account status state on app entry/sign-in, email as primary suspend/ban notification, no Account Action type in FO Notification Center, and Apple/Google email handling. | `01_AUTHENTICATION_MODULE.md`, `00_NAVIGATION_AND_CROSS_MODULE_FLOW.md`, `09_NOTIFICATION_MODULE.md`, `15_TRUST_SAFETY_MODULE.md`, `16_INTEGRATIONS_MODULE.md`, `QA_TEST_SCENARIO_CHECKLIST.md` |
| `FO-PRD-v1.2` | 2026-07-02 | Final error-state UI copy and retry-scope handoff for Front Office. Locks Feed refresh failure, load-more failure, image failure, owner fallback, shared section/unavailable/empty-state behavior, and QA coverage before moving to Back Office work. | `ERROR_STATE_UI_COPY_CATALOG.md`, `02_FEED_MODULE.md`, `QA_TEST_SCENARIO_CHECKLIST.md`, `README_MODULE_INDEX.md`, `FINAL_HANDOFF_SUMMARY.md`, `DEV_IMPLEMENTATION_CHECKLIST.md` |
| `FO-PRD-v1.1` | 2026-06-23 | Product decision update for Asset Detail / Social comment model: support IG-style one-level replies, allow collapsed `View more replies`, and explicitly prohibit multi-level nested threads. Supersedes `FO-PRD-v1.0` for Dev / QA / Figma. | `TukDaeng_Master_Product_Definition.md`, `00_GLOBAL_RULES_MODULE.md`, `00_NAVIGATION_AND_CROSS_MODULE_FLOW.md`, `05_ASSET_DETAIL_MODULE.md`, `11_SOCIAL_MODULE.md`, `DEV_IMPLEMENTATION_CHECKLIST.md`, `DEV_CHAT_IMPLEMENTATION_CHECKLIST.md`, `QA_TEST_SCENARIO_CHECKLIST.md`, `Figma_Gap_Checklist_Against_Master.md`, `FIGMA_UX_CLEANUP_TASK_BREAKDOWN.md`, `FO_Functional_PRD.md` |
| `FO-PRD-v1.0` | 2026-06-22 | Initial Front Office baseline for Dev / QA / Figma handoff. Includes module PRD `00-18`, asset status rules, Add/Edit Asset required-field matrix, Chat-focused Dev checklist and Figma cleanup work packs. | `DEV_BASELINE_HANDOFF_2026-06-22.md`, `README_MODULE_INDEX.md`, `TukDaeng_Master_Product_Definition.md`, `DEV_IMPLEMENTATION_CHECKLIST.md`, `DEV_CHAT_IMPLEMENTATION_CHECKLIST.md`, `QA_TEST_SCENARIO_CHECKLIST.md`, `FIGMA_UX_CLEANUP_TASK_BREAKDOWN.md` |

---

# 4. Dev Reference Note

When sending documents to Dev, include both:

- Branch: `docs-frontoffice-spec-updates`
- Version: `FO-PRD-v1.5`

If Dev reports a gap or builds against this baseline, ask them to cite the version number in their response.
