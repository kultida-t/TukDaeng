# TukDaeng PRD Final Handoff Summary

อ้างอิงหลักจาก [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md)

**Current Baseline Version:** `FO-PRD-v1.3`
**Version Registry:** [DOCUMENT_VERSION.md](DOCUMENT_VERSION.md)

---

# 1. Handoff Status

ชุดเอกสาร PRD สำหรับ TukDaeng App พร้อมใช้เป็น baseline สำหรับ Product / UX / Dev / QA ในระดับ module-level แล้ว โดยมีเอกสารหลักดังนี้:

- Dev baseline handoff: [DEV_BASELINE_HANDOFF_2026-06-22.md](DEV_BASELINE_HANDOFF_2026-06-22.md)
- Document version: [DOCUMENT_VERSION.md](DOCUMENT_VERSION.md)
- Master source of truth: [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md)
- Module index: [README_MODULE_INDEX.md](README_MODULE_INDEX.md)
- Figma checklist: [Figma_Gap_Checklist_Against_Master.md](Figma_Gap_Checklist_Against_Master.md)
- Figma cleanup task breakdown: [FIGMA_UX_CLEANUP_TASK_BREAKDOWN.md](FIGMA_UX_CLEANUP_TASK_BREAKDOWN.md)
- Global rules: [00_GLOBAL_RULES_MODULE.md](00_GLOBAL_RULES_MODULE.md)
- Navigation rules: [00_NAVIGATION_AND_CROSS_MODULE_FLOW.md](00_NAVIGATION_AND_CROSS_MODULE_FLOW.md)
- Module PRD: `01-18`
- Error-state copy catalog: [ERROR_STATE_UI_COPY_CATALOG.md](ERROR_STATE_UI_COPY_CATALOG.md)

หมายเหตุสำหรับรอบ 2026-06-23: `FO-PRD-v1.1` supersede `FO-PRD-v1.0` สำหรับ Dev / QA / Figma โดยเพิ่ม product decision เรื่อง Asset Detail / Social comment model ให้รองรับ IG-style one-level replies ใต้ comment หลัก, ใช้ `View more replies` สำหรับ collapsed replies ชั้นเดียว และไม่รองรับ multi-level nested thread

หมายเหตุสำหรับรอบ 2026-07-02: `FO-PRD-v1.2` supersede `FO-PRD-v1.1` สำหรับ Dev / QA / Figma เฉพาะ error-state handoff โดยเพิ่ม [ERROR_STATE_UI_COPY_CATALOG.md](ERROR_STATE_UI_COPY_CATALOG.md), lock copy/retry scope ของ Feed refresh failure, Feed load-more failure, image failure, owner fallback และอัปเดต Feed/QA checklist ให้ตรงกับ Figma ล่าสุด

หมายเหตุสำหรับรอบ 2026-07-16: `FO-PRD-v1.3` supersede `FO-PRD-v1.2` สำหรับ clarification เรื่อง account suspension/ban โดย V1 ไม่มี `Restricted` account state, Suspended/Banned ต้องเข้า main app ไม่ได้, BO status change ต้อง revoke/block session, email เป็น primary notification channel และ FO Notification Center ไม่เพิ่ม Account Action type

# 2. Approved Product Decisions

| Decision | Final V1 Rule |
| --- | --- |
| `Show` asset actions | `Show` ไม่ขึ้น Feed/Search/Watch Alert แต่สามารถ Make Offer / Contact Seller / Chat ได้จาก Asset Detail หรือ Public Profile detail entry |
| `Hide` price handling | `Hide` ไม่ใช้ listing price และห้ามแสดงราคาใน public/viewer surfaces |
| Chat notification | Chat / New Message ไม่เข้า Notification Center; แจ้งเตือนเฉพาะในเมนู Chat ด้วย unread badge/count |
| Notification Center types | รองรับเฉพาะ Like, Comment, Follow, Offer, Watch Alert |
| Comment replies | รองรับ IG-style one-level replies ใต้ comment หลัก; ใช้ `View more replies` สำหรับ collapsed replies ชั้นเดียว; ไม่รองรับ multi-level nested thread |
| Post-block chat | Chat history เดิมอ่านได้แบบ read-only; ส่งข้อความใหม่ไม่ได้; สร้าง Chat/Offer ใหม่ไม่ได้ |
| Future menu items | Watch Shops, Accessories Shop, Repair Shop, Auction Center, Consignment Center, Authentication Center ไม่เป็น active route ใน production V1 |
| Back Office | Mobile V1 ใช้ [18_ADMIN_SCOPE_NOTE.md](18_ADMIN_SCOPE_NOTE.md) เป็น boundary; Full BO PRD ทำแยกเมื่อเริ่ม Back Office sprint |

# 3. Figma Must Fix Before Dev / QA

ใช้ [Figma_Gap_Checklist_Against_Master.md](Figma_Gap_Checklist_Against_Master.md) เป็น checklist หลัก โดยต้องเคลียร์อย่างน้อย:

- ทุก `Must Fix`
- ทุก `High`
- Chat / New Message ต้องย้ายออกจาก Notification Center และแสดงเป็น unread badge/count ใน Chat menu
- `Show` detail ต้องคง Offer / Contact Seller / Chat แต่ annotate ว่าไม่ขึ้น Feed/Search/Watch Alert
- Future menu items ต้องเป็น hidden / disabled / placeholder อย่างชัดเจน

# 4. Remaining Decision Items

ยังมีรายการที่ไม่ block handoff แต่ควรเก็บใน product decision log:

- Delete Chat behavior แบบละเอียด: locked ใน Chat Module แล้ว คือซ่อนจาก Chat List เฉพาะฝั่งผู้กด ไม่ลบ server history ไม่มี restore UI และมี overflow menu/mute/delete copy ตาม Figma ล่าสุด
- Share channel implementation: recommendation คือ system share sheet พร้อม fallback copy public deep link และไม่สร้าง notification
- Article Comment / Report Article: locked แล้ว คือไม่เปิด Article Comment ใน FO V1; ใช้ UI label `Report article` และ map เข้า Trust & Safety `Report Board Content`
- Delete Account retention / grace period policy: locked V1 rule คือ soft delete/deactivate หลัง confirm, revoke session ทันที, แสดง `Account deletion started`, กลับไป Sign In / pre-auth และใช้ grace period 30 วันก่อน hard delete/anonymization ตาม policy
- Full Back Office PRD: เริ่มหลัง FO baseline, Figma cleanup, Dev checklist และ QA checklist ครบ/นิ่งแล้วเท่านั้น


# 5. Handoff Readiness Checklist

| Check | Status |
| --- | --- |
| Master updated with approved decisions | Done |
| Module PRD `00-18` created | Done |
| Figma checklist cleanup to module-level format | Done |
| Figma UX cleanup task breakdown created | Done |
| README module index created | Done |
| Dev implementation checklist created | Done |
| QA test scenario checklist created | Done |
| Final handoff summary created | Done |
| Dev baseline handoff reviewed by Product | Done |
| Figma error-state visual updates completed | Done |
| Error-state copy catalog created | Done |
| Feed error-state QA checklist updated | Done |
| Remaining non-error Figma visual updates | Pending team review |
| Dev / QA sign-off | Pending team review |

# 6. Recommended Next Step

ให้ Product lock เอกสาร baseline ชุดนี้ก่อน แล้วส่ง [DEV_BASELINE_HANDOFF_2026-06-22.md](DEV_BASELINE_HANDOFF_2026-06-22.md) ให้ Dev review app ที่ทำไปแล้วเทียบกับ baseline ล่าสุด จากนั้น UX/Figma ค่อยอัปเดตหน้าจอตาม baseline เดียวกัน โดยใช้ [Figma_Gap_Checklist_Against_Master.md](Figma_Gap_Checklist_Against_Master.md) และ [FIGMA_UX_CLEANUP_TASK_BREAKDOWN.md](FIGMA_UX_CLEANUP_TASK_BREAKDOWN.md) เป็น checklist งานออกแบบ
