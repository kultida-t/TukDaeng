# TukDaeng Dev Baseline Handoff

**Date:** 2026-06-22  
**Baseline Version:** `FO-PRD-v1.0` (superseded — current synced baseline `FO-PRD-v1.10`, 2026-10-30)
**Purpose:** ส่ง baseline เอกสารล่าสุดทั้งชุดให้ Dev ใช้แทนเอกสารเก่าที่เคย implement ก่อนหน้า  
**Status:** Product-reviewed and approved as Dev baseline  
**Primary Source of Truth:** [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md)
**Version Registry:** [DOCUMENT_VERSION.md](DOCUMENT_VERSION.md)

---

# 0. Superseded Version Note

`FO-PRD-v1.0` ถูก supersede โดย `FO-PRD-v1.1` วันที่ 2026-06-23 เฉพาะ product decision update เรื่อง Asset Detail / Social comment model:

- รองรับ IG-style one-level replies ใต้ comment หลัก
- `View more replies` ใช้สำหรับกาง replies ชั้นเดียวใต้ comment หลัก
- ไม่รองรับ multi-level nested thread หรือ reply ซ้อนเกิน 1 ชั้น

Dev / QA ควรอ้างอิง [DOCUMENT_VERSION.md](DOCUMENT_VERSION.md) และใช้ `FO-PRD-v1.1` เป็น baseline ล่าสุด

---

# 1. Handoff Position

เอกสารชุดนี้ไม่ใช่ change list เฉพาะรายการที่เพิ่มวันที่ 2026-06-22 แต่เป็น baseline ล่าสุดของ TukDaeng Front Office ทั้งชุด หลังจากรีวิวและจัดระเบียบ requirement ใหม่ตั้งแต่เริ่มรอบ PRD cleanup

Dev ควรใช้เอกสารชุดนี้เป็น source of truth ใหม่สำหรับการแก้ app ที่ทำไปก่อนหน้าแล้ว เพราะ implementation เดิมอ้างอิงข้อมูลชุดเก่าที่ไม่ตรงกับ decision ล่าสุดหลายจุด

Baseline version เดิมสำหรับรอบ 2026-06-22 คือ `FO-PRD-v1.0` แต่หลัง decision update วันที่ 2026-06-23 ให้ Dev / QA ใช้ baseline ล่าสุด `FO-PRD-v1.1` หาก Dev ส่ง gap list หรือ status กลับมา ให้ระบุ version ที่ใช้อ้างอิงเพื่อให้ trace กลับมาได้ถูกต้อง

หาก implementation ปัจจุบัน หรือเอกสารเก่า conflict กับชุดนี้ ให้ยึดชุดนี้ก่อน

---

# 2. Required Reading Order For Dev

| Order | File | Why Dev Must Read |
| --- | --- | --- |
| 1 | [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md) | Product baseline, canonical terms, status model, global scope |
| 2 | [README_MODULE_INDEX.md](README_MODULE_INDEX.md) | Source-of-truth order, module map, reading path |
| 3 | [00_GLOBAL_RULES_MODULE.md](00_GLOBAL_RULES_MODULE.md) | Visibility, lifecycle, privacy, login, deleted/block rules |
| 4 | [00_NAVIGATION_AND_CROSS_MODULE_FLOW.md](00_NAVIGATION_AND_CROSS_MODULE_FLOW.md) | Routing, deep link, notification destination, cross-module fallback |
| 5 | Module PRD `01-18` | Functional detail by module |
| 6 | [DEV_IMPLEMENTATION_CHECKLIST.md](DEV_IMPLEMENTATION_CHECKLIST.md) | Engineering checklist for app update |
| 7 | [QA_TEST_SCENARIO_CHECKLIST.md](QA_TEST_SCENARIO_CHECKLIST.md) | Regression cases Dev should expect QA to verify |

---

# 3. Baseline Areas Dev Must Recheck

## Global

- Canonical Asset status is only `Sale`, `Show`, `Hide`, `Sold`
- Composer pick คือ `Show` / `Hide` / `Post to feed` (post mode); `Sale` เข้าผ่าน `Post to feed` + `Add price` (asset mode)
- `Sold` must come from Mark as Sold / Sale Record flow
- Guest actions that require login must show Member Sheet (`Join TukDaeng` sheet — เดิมเรียก Global Login Required Dialog)
- Private data must be permission-gated every time
- Deleted and blocked content must be filtered from all public surfaces and deep links

## Feed / Search / Watch Alert

- Feed = post-centric (S-09): แสดงโพสต์ `sale` (ผูก asset สถานะ Sale) + `post` (ไม่ผูก asset); Search และ Watch Alert match เฉพาะ `Sale`
- `Show`, `Hide`, `Sold`, `Deleted` must not appear in Feed/Search marketplace surfaces (asset-linked)
- Feed card must not show Location in V1
- `Not interested` is viewer-level preference, not asset status `Hide` (เดิมเรียก Hide this asset)
- Report post does not remove the post immediately
- Block User must affect Feed, Search, Watch Alert Result and related profile visibility

## Asset Management (composer asset mode)

- Media requires minimum 1 image and supports maximum 10 images — required เดียวต่อ status (ไม่มี required matrix)
- Spec fields เป็น free-text (ไม่มี Market Data autocomplete / option-master — S-25)
- Asking Price เป็น optional ทุก status — ถ้ากรอกต้อง > 0; **ไม่มี `Price on request` label**
- `Hide` must not use listing price or expose price in public/viewer surfaces
- Cost details (Purchase Price / Purchase Date) และ portfolio value detail are private — ไม่มี Provenance/Consignment entity ใน V1 (S-25)
- Mark as Sold opens Sale Record (`Sale price` + `Sale date` เท่านั้น — D3) before status becomes `Sold`
- Delete post must remove public visibility while chat remains

## Post Detail / Chat

- Viewer can open only public `Sale` and `Show` post detail
- Owner can open own `Sale`, `Show`, `Hide`, `Sold`
- Chat entry คือ `Ask Seller` บน sale post เท่านั้น; thread key = user + item (S-07 — seller เดิมคนละโพสต์ = ห้องแยก)
- Chat/New Message is not a Front Office Alerts feed type

## Profile / Portfolio

- Owner Profile shows all own statuses: `Sale`, `Show`, `Hide`, `Sold` (tabs ทั้งหมด/ขาย/โชว์/ซ่อน/ขายแล้ว)
- Public Profile shows only `Sale` and `Show` (tabs ขาย/โชว์ — ไม่มี `all` tab สำหรับ public; S-14 leak = documented defect)
- Public surfaces must never show private asset data
- Portfolio is owner-only (wallet icon `.pf-pfo`) and calculates from `Sale`, `Show`, `Hide`; headline = `Total invested` (D2 — ไม่ใช่ Total Asset Value); `Sold` appears in `ประวัติการขาย` (Sale Record = price+date — D3)

## Alerts feed / Settings / Board

- Alerts feed types = Like, Comment, Follow, Watch Alert + `system` placeholder (S-17)
- Settings = IG-style six sections (S-05); Change Password in-app (S-28); Delete Account = two-page flow + login-to-restore (S-02/S-27)
- Board is editorial magazine (S-01); FO users do not create/edit/delete articles in V1
- Share (รวม article) เป็น member-only — guest เจอ Member Sheet (S-03); Article Like requires login

---

# 4. Recommended Dev Update Flow

1. Read master and module index first
2. Compare current app implementation against [DEV_IMPLEMENTATION_CHECKLIST.md](DEV_IMPLEMENTATION_CHECKLIST.md)
3. Mark each checklist item as Done / Needs Fix / Not Applicable with reason
4. Split fixes by module to avoid mixing global status/privacy changes with UI-only changes
5. Run QA regression from [QA_TEST_SCENARIO_CHECKLIST.md](QA_TEST_SCENARIO_CHECKLIST.md)
6. Send implementation gaps back to Product/UX only when the baseline is unclear or internally conflicting

---

# 5. Open Follow-Up Items

These items do not block Dev baseline review but should be clarified before final production sign-off:

- Full Back Office PRD, which remains separate from Front Office mobile baseline
