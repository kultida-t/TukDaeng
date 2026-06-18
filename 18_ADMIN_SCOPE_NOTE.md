# 18 Admin Scope Note

อ้างอิงหลักจาก [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md)

---

# 1. Document Information

| Field | Detail |
| --- | --- |
| Module Name | Admin Scope Note |
| Platform | Web Back Office |
| Version | V1 |
| Status | Draft |
| Owner | Product / UX / Engineering / Operations |
| Document Type | Scope Boundary Note - Master Aligned |

# 2. Objective

Admin Scope Note ระบุขอบเขต Admin / Back Office ที่ master กล่าวถึง แต่ยังไม่ได้แตกเป็น Functional PRD เต็มสำหรับ mobile user-facing app

เอกสารนี้ใช้กันความสับสนว่า Admin เป็น role ใน mobile app หรือไม่ และใช้กำหนด minimum requirement ที่ module user-facing ต้องเชื่อมกับ Admin moderation, report handling และ audit trail

# 3. Master Alignment Summary

| Area | Master Baseline |
| --- | --- |
| Platform | Web Back Office สำหรับ Admin |
| Admin access | Admin ใช้งานผ่าน Back Office เท่านั้น |
| Responsibilities | ตรวจสอบ Report, Moderation, จัดการ Board Content, จัดการ User / Asset ตาม policy |
| SLA | ดำเนินการภายใน 24 ชั่วโมงสำหรับ Report ที่เข้ามา |
| Sold Asset | Sold Asset เก็บไว้เพื่อ Sales History, Portfolio และ Admin Review |
| Report impact | Asset หรือ Content จะหายเมื่อ Admin ดำเนินการตาม Moderation เท่านั้น |
| Apple compliance | ต้องรองรับ Report, Block, Terms, Privacy, Moderation Flow |
| Security | Admin Action ต้องมี Audit Trail ใน Back Office |

# 4. Figma Gap Checklist For Admin Scope

| Priority | Gap | Master Baseline | Figma Action |
| --- | --- | --- | --- |
| Must Fix | Figma อาจสื่อว่า Admin เป็น mobile role | Admin ใช้งานผ่าน Web Back Office เท่านั้น | แยก Admin flow ออกจาก mobile app หรือ annotate ว่าเป็น Back Office |
| High | Report flow ยังไม่แสดงผลต่อ Admin moderation | Report ต้องถูกตรวจโดย Admin และ content หายหลัง moderation เท่านั้น | เพิ่ม report submitted state และ admin review note |
| High | Board content management ยังไม่แยก owner ชัด | บทความสร้างและจัดการโดย Admin ผ่าน Back Office | Annotate Board content as Admin-managed |
| High | Audit Trail ยังไม่ถูกระบุ | Admin Action ต้องมี Audit Trail ใน Back Office | เพิ่ม audit trail requirement ใน Back Office scope |
| Medium | 24-hour handling SLA ยังไม่ถูกระบุ | Admin ดำเนินการภายใน 24 ชั่วโมงสำหรับ Report | เพิ่ม SLA note ใน moderation queue |
| Medium | Sold Asset Admin Review ยังไม่ชัด | Sold Asset เก็บไว้เพื่อ Admin Review | เพิ่ม admin-review availability note |

# 5. Scope Boundary

## In Scope For This Note

- Admin actor definition
- Back Office platform boundary
- Report review and moderation responsibility
- Board content management ownership
- User / Asset management by policy
- 24-hour report handling SLA
- Audit Trail requirement
- Mobile-to-Back-Office handoff assumptions

## Out Of Scope For This Note

- Full Back Office screen-by-screen PRD
- Admin authentication details
- Admin role hierarchy
- Moderation policy content
- Audit log schema
- Admin dashboard metrics
- Internal operations tooling implementation

Full Back Office PRD timing:

- ยังไม่เริ่ม Full Back Office PRD ระหว่าง FO cleanup
- ให้จัดการ FO baseline, Figma cleanup, Dev checklist, QA checklist และ FO sign-off ให้ครบ/นิ่งก่อน
- หลัง FO complete แล้วค่อยเปิด Back Office sprint แยกและทำ Full BO PRD แยกจาก FO mobile scope

# 6. Admin Responsibilities

Admin รับผิดชอบ:

- ตรวจสอบ Report
- Moderation
- จัดการ Board Content
- จัดการ User / Asset ตาม policy
- ดำเนินการภายใน 24 ชั่วโมงสำหรับ Report ที่เข้ามา

# 7. Mobile App Boundary

Admin ไม่ใช่ role ใน mobile app V1

Mobile app ต้องรองรับ:

- User ส่ง Report จาก Asset, User, Comment, Board Content
- User ใช้ Block ได้ตาม Trust & Safety rule
- Terms of Use และ Privacy Policy เข้าถึงได้
- Content ที่ถูก moderation แล้วต้องถูกซ่อน/จัดการตามผลจาก Back Office
- Public surfaces ต้องไม่แสดง content ที่ Admin action ทำให้ unavailable

Mobile app ไม่ต้องมี:

- Admin dashboard
- Report queue
- Moderation controls
- User management controls
- Asset management controls สำหรับ Admin
- Audit log viewer

# 8. Report And Moderation Flow

1. User ส่ง Report จาก supported content type
2. ระบบบันทึก report และแสดง submitted state
3. Content ยังไม่หายทันทีจาก public surface เว้นแต่ policy หรือ automated rule ในอนาคตกำหนด
4. Admin ตรวจสอบ Report ผ่าน Back Office
5. Admin ดำเนินการ moderation ตาม policy
6. Public surfaces sync ผล moderation เช่น hide/remove/unavailable
7. Admin action ถูกบันทึกใน Audit Trail

# 9. Admin Review Surfaces

| Source | Admin Relevance |
| --- | --- |
| Reported Asset | Admin review และ moderation |
| Reported User | Admin review และ policy action |
| Reported Comment | Admin review และ moderation |
| Reported Board Content | Admin review และ moderation |
| Sold Asset | เก็บไว้เพื่อ Sales History, Portfolio และ Admin Review |
| Board Article | สร้างและจัดการโดย Admin ผ่าน Back Office |

# 10. Audit Trail Requirements

Admin Action ต้องมี Audit Trail ใน Back Office

ควรบันทึกอย่างน้อย:

- Admin identifier
- Action type
- Target type
- Target identifier
- Timestamp
- Reason / note ตาม policy
- Before / after status เมื่อเกี่ยวข้อง

# 11. Acceptance Criteria

| ID | Criteria |
| --- | --- |
| AC-ADMIN-001 | Admin ใช้งานผ่าน Web Back Office เท่านั้น |
| AC-ADMIN-002 | Mobile app V1 ไม่แสดง Admin role หรือ Admin controls |
| AC-ADMIN-003 | Report รองรับ Asset, User, Comment และ Board Content |
| AC-ADMIN-004 | Report ไม่ทำให้ Asset หรือ Content หายทันทีโดยไม่มี Admin moderation |
| AC-ADMIN-005 | Admin ต้องสามารถตรวจสอบ Report ผ่าน Back Office ตาม scope master |
| AC-ADMIN-006 | Admin ดำเนินการภายใน 24 ชั่วโมงสำหรับ Report ที่เข้ามา |
| AC-ADMIN-007 | Board content สร้างและจัดการโดย Admin ผ่าน Back Office |
| AC-ADMIN-008 | Sold Asset เก็บไว้เพื่อ Sales History, Portfolio และ Admin Review |
| AC-ADMIN-009 | Admin Action ต้องมี Audit Trail ใน Back Office |
| AC-ADMIN-010 | Apple compliance ต้องรองรับ Report, Block, Terms, Privacy และ Moderation Flow |

# 12. Related Modules

- [00_GLOBAL_RULES_MODULE.md](00_GLOBAL_RULES_MODULE.md)
- [00_NAVIGATION_AND_CROSS_MODULE_FLOW.md](00_NAVIGATION_AND_CROSS_MODULE_FLOW.md)
- [11_SOCIAL_MODULE.md](11_SOCIAL_MODULE.md)
- [12_BOARD_MODULE.md](12_BOARD_MODULE.md)
- [15_TRUST_SAFETY_MODULE.md](15_TRUST_SAFETY_MODULE.md)
- [17_NON_FUNCTIONAL_REQUIREMENTS.md](17_NON_FUNCTIONAL_REQUIREMENTS.md)

# 13. Future Enhancement

- Full Admin Back Office PRD หลัง FO baseline, Figma cleanup, Dev checklist และ QA checklist ครบ/นิ่งแล้ว
- Admin role hierarchy
- Moderation policy matrix
- Report queue dashboard
- Audit log search and export
- Admin analytics
