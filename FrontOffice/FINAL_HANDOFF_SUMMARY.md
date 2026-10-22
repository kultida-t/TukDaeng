# TukDaeng PRD Final Handoff Summary

อ้างอิงหลักจาก [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md)

**Current Baseline Version:** `FO-PRD-v1.9`
**Version Registry:** [DOCUMENT_VERSION.md](DOCUMENT_VERSION.md)

---

# 1. Handoff Status

ชุดเอกสาร PRD สำหรับ TukDaeng App พร้อมใช้เป็น baseline สำหรับ Product / UX / Dev / QA ในระดับ module-level แล้ว โดยมีเอกสารหลักดังนี้:

- Dev baseline handoff: [DEV_BASELINE_HANDOFF_2026-06-22.md](DEV_BASELINE_HANDOFF_2026-06-22.md)
- Document version: [DOCUMENT_VERSION.md](DOCUMENT_VERSION.md)
- Master source of truth: [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md)
- Module index: [README_MODULE_INDEX.md](README_MODULE_INDEX.md)
- Global rules: [00_GLOBAL_RULES_MODULE.md](00_GLOBAL_RULES_MODULE.md)
- Navigation rules: [00_NAVIGATION_AND_CROSS_MODULE_FLOW.md](00_NAVIGATION_AND_CROSS_MODULE_FLOW.md)
- Module PRD: `01-18`
- Error-state copy catalog: [ERROR_STATE_UI_COPY_CATALOG.md](ERROR_STATE_UI_COPY_CATALOG.md)

หมายเหตุสำหรับรอบ 2026-06-23: `FO-PRD-v1.1` supersede `FO-PRD-v1.0` สำหรับ Dev / QA / Figma โดยเพิ่ม product decision เรื่อง Asset Detail / Social comment model ให้รองรับ IG-style one-level replies ใต้ comment หลัก, ใช้ `View more replies` สำหรับ collapsed replies ชั้นเดียว และไม่รองรับ multi-level nested thread

หมายเหตุสำหรับรอบ 2026-07-02: `FO-PRD-v1.2` supersede `FO-PRD-v1.1` สำหรับ Dev / QA / Figma เฉพาะ error-state handoff โดยเพิ่ม [ERROR_STATE_UI_COPY_CATALOG.md](ERROR_STATE_UI_COPY_CATALOG.md), lock copy/retry scope ของ Feed refresh failure, Feed load-more failure, image failure, owner fallback และอัปเดต Feed/QA checklist ให้ตรงกับ Figma ล่าสุด

หมายเหตุสำหรับรอบ 2026-07-16: `FO-PRD-v1.3` supersede `FO-PRD-v1.2` สำหรับ clarification เรื่อง account suspension/ban โดย V1 ไม่มี `Restricted` account state, Suspended/Banned ต้องเข้า main app ไม่ได้, BO status change ต้อง revoke/block session, email เป็น primary notification channel และ FO Alerts feed ไม่เพิ่ม Account Action type

หมายเหตุสำหรับรอบ 2026-10-22: `FO-PRD-v1.9` supersede baseline ชุด `v1.x` ทั้งหมด โดย sync เอกสารตาม `Prototypes/fo-flow/index.html` ที่ locked แล้ว (master §16 Sync Decision Log เป็น canonical) — feed post-centric, Member Sheet, Alerts feed 5 types, composer asset mode, Sale Record 2 ฟิลด์, share member-only, delete account login-to-restore

# 2. Approved Product Decisions

| Decision | Final V1 Rule |
| --- | --- |
| `Show` asset actions | `Show` ไม่ขึ้น Feed/Search/Watch Alert และไม่มี `Ask Seller` (chat entry มีเฉพาะ sale post — S-07/07_CHAT_MODULE) |
| `Hide` price handling | `Hide` ไม่ใช้ listing price และห้ามแสดงราคาใน public/viewer surfaces |
| Chat notification | Chat / New Message ไม่เข้า Alerts feed; แจ้งเตือนเฉพาะในเมนู Chat ด้วย unread badge/count |
| Alerts feed types | รองรับ Like, Comment, Follow, Watch Alert + `system` (placeholder destination — S-17) |
| Comment replies | รองรับ IG-style one-level replies ใต้ comment หลัก; ใช้ `View more replies` สำหรับ collapsed replies ชั้นเดียว; ไม่รองรับ multi-level nested thread |
| Post-block chat | Chat history เดิมอ่านได้แบบ read-only; ส่งข้อความใหม่ไม่ได้; สร้าง Chat ใหม่ไม่ได้ |
| Future menu items | รายการ drawer ทั้ง 9 (Watch Brands, Watch Price Index, Watch Shops, Accessories Shop, Repair Shop, Auction Center, Consignment Center, Authentication Center, Community) เป็น placeholder rows ไม่เป็น active route ใน production V1 (S-19) |
| Back Office | Mobile V1 ใช้ [18_ADMIN_SCOPE_NOTE.md](18_ADMIN_SCOPE_NOTE.md) เป็น boundary; Full BO PRD ทำแยกเมื่อเริ่ม Back Office sprint |

# 3. Remaining Decision Items

ยังมีรายการที่ไม่ block handoff แต่ควรเก็บใน product decision log:

- Delete Chat behavior แบบละเอียด: locked ใน Chat Module แล้ว คือซ่อนจาก Chat List เฉพาะฝั่งผู้กด ไม่ลบ server history ไม่มี restore UI และมี swipe action (pin/mute/hide/delete) ตาม spec ล่าสุด
- Share channel implementation: recommendation คือ system share sheet พร้อม fallback copy public deep link และไม่สร้าง notification; Share เป็น member-only ทุก surface — guest กด Share เจอ Member Sheet (S-03)
- Article Comment / Report Article: locked แล้ว คือไม่เปิด Article Comment ใน FO V1; Report Article เป็น contract-only (S-04 — prototype menu dead) map เข้า Trust & Safety `Report Board Content`
- Delete Account retention / grace period policy: locked V1 rule คือ two-page flow (terms → reason → password → scheduled → guest), soft delete/deactivate หลัง confirm, revoke session ทันที, กลับไป pre-auth และ login-to-restore ภายใน grace period 30 วันก่อน hard delete/anonymization ตาม policy (S-02/S-27)
- Full Back Office PRD: เริ่มหลัง FO baseline, Dev checklist และ QA checklist ครบ/นิ่งแล้วเท่านั้น


# 4. Handoff Readiness Checklist

| Check | Status |
| --- | --- |
| Master updated with approved decisions | Done |
| Module PRD `00-18` created | Done |
| README module index created | Done |
| Dev implementation checklist created | Done |
| QA test scenario checklist created | Done |
| Final handoff summary created | Done |
| Dev baseline handoff reviewed by Product | Done |
| Error-state copy catalog created | Done |
| Feed error-state QA checklist updated | Done |
| Dev / QA sign-off | Pending team review |

# 5. Recommended Next Step

ให้ Product lock เอกสาร baseline ชุดนี้ก่อน แล้วส่ง [DEV_BASELINE_HANDOFF_2026-06-22.md](DEV_BASELINE_HANDOFF_2026-06-22.md) ให้ Dev review app ที่ทำไปแล้วเทียบกับ baseline ล่าสุด จากนั้น UX ค่อยอัปเดตหน้าจอตาม baseline เดียวกัน
