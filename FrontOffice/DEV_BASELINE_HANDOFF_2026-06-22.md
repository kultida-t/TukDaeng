# TukDaeng Dev Baseline Handoff

**Date:** 2026-06-22  
**Baseline Version:** `FO-PRD-v1.0`
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

Dev / QA / Figma ควรอ้างอิง [DOCUMENT_VERSION.md](DOCUMENT_VERSION.md) และใช้ `FO-PRD-v1.1` เป็น baseline ล่าสุด

---

# 1. Handoff Position

เอกสารชุดนี้ไม่ใช่ change list เฉพาะรายการที่เพิ่มวันที่ 2026-06-22 แต่เป็น baseline ล่าสุดของ TukDaeng Front Office ทั้งชุด หลังจากรีวิวและจัดระเบียบ requirement ใหม่ตั้งแต่เริ่มรอบ PRD cleanup

Dev ควรใช้เอกสารชุดนี้เป็น source of truth ใหม่สำหรับการแก้ app ที่ทำไปก่อนหน้าแล้ว เพราะ implementation เดิมอ้างอิงข้อมูลชุดเก่าที่ไม่ตรงกับ decision ล่าสุดหลายจุด

Baseline version เดิมสำหรับรอบ 2026-06-22 คือ `FO-PRD-v1.0` แต่หลัง decision update วันที่ 2026-06-23 ให้ Dev / QA / Figma ใช้ baseline ล่าสุด `FO-PRD-v1.1` หาก Dev ส่ง gap list หรือ status กลับมา ให้ระบุ version ที่ใช้อ้างอิงเพื่อให้ trace กลับมาได้ถูกต้อง

หาก implementation ปัจจุบัน, Figma เดิม หรือเอกสารเก่า conflict กับชุดนี้ ให้ยึดชุดนี้ก่อน

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

Figma references remain useful for visual alignment, but if Figma conflicts with the PRD baseline, Dev should flag the conflict and wait for Figma to be updated from this baseline.

---

# 3. Baseline Areas Dev Must Recheck

## Global

- Canonical Asset status is only `Sale`, `Show`, `Hide`, `Sold`
- Add/Edit can select only `Sale`, `Show`, `Hide`
- `Sold` must come from Mark as Sold / Sale Record flow
- Guest actions that require login must show Global Login Required Dialog
- Private data must be permission-gated every time
- Deleted and blocked content must be filtered from all public surfaces and deep links

## Feed / Search / Watch Alert

- Feed, Search and Watch Alert match only `Sale`
- `Show`, `Hide`, `Sold`, `Deleted` must not appear in marketplace list surfaces
- Feed card must not show Location in V1
- Hide this asset is viewer-level preference, not asset status `Hide`
- Report Asset does not remove the asset immediately
- Block User must affect Feed, Search, Watch Alert Result and related profile visibility

## Asset Management

- Gallery requires minimum 1 image and supports maximum 10 images
- `Sale` requires Photos, Brand, Model / Series, Condition, Price and Description
- `Show` requires Photos, Brand and Model / Series; Price is not required
- `Hide` requires Photos and Brand only
- `Hide` must not use listing price or expose price in public/viewer surfaces
- Provenance, purchase data, proof of payment, consignment data, sold history and portfolio value detail are private
- Mark as Sold opens Sale Record Form before status becomes `Sold`
- Delete Asset must remove public visibility and cancel related offers while chat remains

## Asset Detail / Offer / Chat

- Viewer can open only public `Sale` and `Show` details
- Owner can open own `Sale`, `Show`, `Hide`, `Sold`
- `Show` can Make Offer / Contact Seller / Chat only from Asset Detail or Public Profile detail entry
- `Hide`, `Sold`, `Deleted` cannot create new offers
- Asset Sold auto rejects other pending offers
- Chat/New Message is not a Front Office Notification Center type

## Profile / Portfolio

- Owner Profile shows all own statuses: `Sale`, `Show`, `Hide`, `Sold`
- Public Profile shows only `Sale` and `Show`
- Public Profile tabs are `All`, `Sale`, `Show`
- Public surfaces must never show private asset data
- Portfolio is owner-only and calculates from `Sale`, `Show`, `Hide`; `Sold` appears in Sold History, not Total Asset Value

## Notification / Settings / Board

- Notification Center types are only Like, Comment, Follow, Offer, Watch Alert
- Settings includes Theme Mode and Delete Account baseline
- Board is Article Area; FO users do not create/edit/delete articles in V1
- Article Share is public; Article Like requires login

---

# 4. Recommended Dev Update Flow

1. Read master and module index first
2. Compare current app implementation against [DEV_IMPLEMENTATION_CHECKLIST.md](DEV_IMPLEMENTATION_CHECKLIST.md)
3. Mark each checklist item as Done / Needs Fix / Not Applicable with reason
4. Split fixes by module to avoid mixing global status/privacy changes with UI-only changes
5. Run QA regression from [QA_TEST_SCENARIO_CHECKLIST.md](QA_TEST_SCENARIO_CHECKLIST.md)
6. Send implementation gaps back to Product/UX only when the baseline is unclear or conflicts with current Figma

---

# 5. Figma Timing

Figma should be updated after this baseline is locked. Dev should not treat older Figma screens as final if they conflict with the PRD baseline.

Recommended sequence:

1. Product locks this baseline
2. Dev reviews and estimates implementation gaps
3. UX/Figma updates screens to match this baseline
4. Dev and QA use the same baseline for implementation and regression

---

# 6. Open Follow-Up Items

These items do not block Dev baseline review but should be clarified before final production sign-off:

- Consignment-specific workflow and validation beyond Add/Edit baseline
- Full Back Office PRD, which remains separate from Front Office mobile baseline
- Final Figma status after screens are updated from this baseline
