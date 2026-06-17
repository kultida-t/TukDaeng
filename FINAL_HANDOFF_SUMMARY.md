# TukDaeng PRD Final Handoff Summary

อ้างอิงหลักจาก [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md)

---

# 1. Handoff Status

ชุดเอกสาร PRD สำหรับ TukDaeng App พร้อมใช้เป็น baseline สำหรับ Product / UX / Dev / QA ในระดับ module-level แล้ว โดยมีเอกสารหลักดังนี้:

- Master source of truth: [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md)
- Module index: [README_MODULE_INDEX.md](README_MODULE_INDEX.md)
- Figma checklist: [Figma_Gap_Checklist_Against_Master.md](Figma_Gap_Checklist_Against_Master.md)
- Global rules: [00_GLOBAL_RULES_MODULE.md](00_GLOBAL_RULES_MODULE.md)
- Navigation rules: [00_NAVIGATION_AND_CROSS_MODULE_FLOW.md](00_NAVIGATION_AND_CROSS_MODULE_FLOW.md)
- Module PRD: `01-18`

# 2. Approved Product Decisions

| Decision | Final V1 Rule |
| --- | --- |
| `Show` asset actions | `Show` ไม่ขึ้น Feed/Search/Watch Alert แต่สามารถ Make Offer / Contact Seller / Chat ได้จาก Asset Detail หรือ Public Profile detail entry |
| Chat notification | Chat / New Message ไม่เข้า Notification Center; แจ้งเตือนเฉพาะในเมนู Chat ด้วย unread badge/count |
| Notification Center types | รองรับเฉพาะ Like, Comment, Follow, Offer, Watch Alert |
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

- Delete Chat behavior แบบละเอียด เช่น ลบเฉพาะฝั่งตัวเอง, ซ่อนจาก list, หรือกู้ history ได้หรือไม่ได้
- Share channel implementation เช่น system share sheet, copy link, หรือ native deep link preview
- Article Comment / Report Article จะเพิ่มใน Board V1 หรือคงเป็น future/back-office moderation scope
- Delete Account retention / grace period policy
- Full Back Office PRD เมื่อเริ่ม Back Office sprint จริง


# 5. Handoff Readiness Checklist

| Check | Status |
| --- | --- |
| Master updated with approved decisions | Done |
| Module PRD `00-18` created | Done |
| Figma checklist cleanup to module-level format | Done |
| README module index created | Done |
| Dev implementation checklist created | Done |
| QA test scenario checklist created | Done |
| Final handoff summary created | Done |
| Figma visual updates completed | Pending Figma team |
| Dev / QA sign-off | Pending team review |

# 6. Recommended Next Step

ให้ทีม UX/Figma เริ่มแก้ตาม [Figma_Gap_Checklist_Against_Master.md](Figma_Gap_Checklist_Against_Master.md) โดยเริ่มจาก `Must Fix` และ `High` จากนั้น Dev/QA ใช้ [README_MODULE_INDEX.md](README_MODULE_INDEX.md) เป็น entry point สำหรับอ่านเอกสารทั้งหมด
