# 17 Non-Functional Requirements

อ้างอิงหลักจาก [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md)

---

# 1. Document Information

| Field | Detail |
| --- | --- |
| Module Name | Non-Functional Requirements |
| Platform | Mobile Application / Web Back Office |
| Version | V1 |
| Status | Draft |
| Owner | Product / UX / Engineering / QA |
| Document Type | QA Baseline - Master Aligned |

# 2. Objective

Non-Functional Requirements กำหนด baseline ด้าน Performance, Security, Localization และ Accessibility สำหรับทุกโมดูลของ TukDaeng V1 เพื่อให้ QA ใช้ตรวจระบบได้สม่ำเสมอและไม่ปนกับ functional PRD รายโมดูล

# 3. Master Alignment Summary

| Area | Master Baseline |
| --- | --- |
| Performance | Feed ควรโหลดภายใน 2 วินาที |
| Performance | รูปภาพต้อง Lazy Load |
| Performance | Feed ต้องรองรับ Infinite Scroll |
| Performance | End-of-list แสดง `คุณดูรายการทั้งหมดแล้ว` |
| Security | ทุก API ใช้ HTTPS |
| Security | ใช้ Token-based Authentication |
| Security | Private Asset Data ต้องตรวจสิทธิ์ทุกครั้ง |
| Security | Admin Action ต้องมี Audit Trail ใน Back Office |
| Localization | รองรับภาษาไทยและอังกฤษ |
| Localization | ราคาแสดงเป็น THB |
| Localization | Empty State ใช้ข้อความกลางตามที่กำหนด |
| Accessibility | Font size รองรับการปรับตามระบบ |
| Accessibility | รองรับ Screen Reader ตามความเหมาะสมของ Mobile Platform |

# 4. Figma Gap Checklist For Non-Functional Requirements

| Priority | Gap | Master Baseline | Figma Action |
| --- | --- | --- | --- |
| High | Feed performance/loading state ยังไม่ครบ | Feed ควรโหลดภายใน 2 วินาที, Infinite Scroll, end-of-list | เพิ่ม loading, load-more และ end-of-list state |
| High | Image loading/fallback state ยังไม่ชัด | รูปภาพต้อง Lazy Load | เพิ่ม skeleton/placeholder/error image state |
| High | Private data อาจปรากฏใน public screens | Private Asset Data ต้องตรวจสิทธิ์ทุกครั้ง | แยก Owner-only และ Viewer/Public state ให้ชัด |
| High | Admin action audit ไม่ถูกระบุใน admin/back office flow | Admin Action ต้องมี Audit Trail | เพิ่ม audit trail requirement ใน Back Office note |
| Medium | ภาษาไทย/อังกฤษยังไม่เห็น coverage ครบ | รองรับ TH/EN | ตรวจ copy และพื้นที่ข้อความสำหรับสองภาษา |
| Medium | ราคาอาจมีหลาย currency format | ราคาแสดงเป็น THB | Normalize price format และ currency label |
| Medium | Empty state copy ไม่สม่ำเสมอ | ใช้ข้อความกลาง `ไม่พบข้อมูล` / `No data found` | Normalize empty state |
| Medium | Accessibility state ยังไม่ถูก annotate | Font size และ Screen Reader ต้องรองรับตาม platform | เพิ่ม note สำหรับ dynamic font และ accessibility labels |

# 5. Performance Requirements

| Requirement | Acceptance |
| --- | --- |
| Feed initial load | ควรโหลดภายใน 2 วินาทีภายใต้ network condition ที่ product/engineering ตกลง |
| Image loading | รูปภาพต้อง Lazy Load |
| Feed pagination | Feed ต้องรองรับ Infinite Scroll |
| End of list | เมื่อ Scroll ถึงรายการสุดท้ายให้แสดง `คุณดูรายการทั้งหมดแล้ว` |
| Offline Feed | Feed ต้องแสดง cached data ได้เมื่อ offline หากมีข้อมูลล่าสุด |

# 6. Security Requirements

| Requirement | Acceptance |
| --- | --- |
| HTTPS | ทุก API ต้องใช้ HTTPS |
| Authentication | ใช้ Token-based Authentication |
| Private data authorization | Private Asset Data ต้องตรวจสิทธิ์ทุกครั้ง |
| Admin audit | Admin Action ต้องมี Audit Trail ใน Back Office |
| Route guard | Deep link / notification destination ต้อง validate auth, permission, deletion, block และ asset status |
| Push payload | Push notification payload ต้องไม่ใส่ private data ที่ไม่จำเป็น |

# 7. Localization Requirements

| Requirement | Acceptance |
| --- | --- |
| Languages | รองรับภาษาไทยและอังกฤษ |
| Price | ราคาแสดงเป็น THB |
| Empty state | ใช้ข้อความกลาง `ไม่พบข้อมูล` และ `No data found` |
| Labels | ใช้ canonical terminology ตาม master |
| Text expansion | UI ต้องรองรับความยาวข้อความต่างกันระหว่าง TH/EN |

# 8. Accessibility Requirements

| Requirement | Acceptance |
| --- | --- |
| Font scaling | Font size รองรับการปรับตามระบบ |
| Screen Reader | รองรับ Screen Reader ตามความเหมาะสมของ Mobile Platform |
| Touch target | Action สำคัญควรมีพื้นที่กดเหมาะสมกับ mobile platform |
| Image accessibility | รูปภาพสำคัญควรมี label/description ตามความเหมาะสม |
| Error accessibility | Error state ต้องสื่อสารได้ด้วยข้อความ ไม่พึ่งสีอย่างเดียว |

# 9. QA Checklist

| Area | Check |
| --- | --- |
| Performance | Feed load, lazy image, infinite scroll, end-of-list |
| Offline | Feed cached data when offline |
| Security | HTTPS, token, route guard, private data authorization |
| Localization | TH/EN copy, THB price, empty state |
| Accessibility | Dynamic font, screen reader, touch target, error text |
| Admin | Audit trail requirement exists for Back Office actions |

# 10. Acceptance Criteria

| ID | Criteria |
| --- | --- |
| AC-NFR-001 | Feed ควรโหลดภายใน 2 วินาทีตาม baseline ที่ทีมตกลง |
| AC-NFR-002 | รูปภาพต้อง Lazy Load |
| AC-NFR-003 | Feed รองรับ Infinite Scroll |
| AC-NFR-004 | End-of-list ต้องแสดง `คุณดูรายการทั้งหมดแล้ว` |
| AC-NFR-005 | Feed แสดง cached data ได้เมื่อ offline หากมีข้อมูลล่าสุด |
| AC-NFR-006 | ทุก API ใช้ HTTPS |
| AC-NFR-007 | ระบบใช้ Token-based Authentication |
| AC-NFR-008 | Private Asset Data ต้องตรวจสิทธิ์ทุกครั้ง |
| AC-NFR-009 | Admin Action ต้องมี Audit Trail ใน Back Office |
| AC-NFR-010 | ระบบรองรับภาษาไทยและอังกฤษ |
| AC-NFR-011 | ราคาแสดงเป็น THB |
| AC-NFR-012 | Empty State ใช้ข้อความกลางตาม master |
| AC-NFR-013 | Font size รองรับการปรับตามระบบ |
| AC-NFR-014 | รองรับ Screen Reader ตามความเหมาะสมของ Mobile Platform |

# 11. Related Modules

- [00_GLOBAL_RULES_MODULE.md](00_GLOBAL_RULES_MODULE.md)
- [00_NAVIGATION_AND_CROSS_MODULE_FLOW.md](00_NAVIGATION_AND_CROSS_MODULE_FLOW.md)
- [02_FEED_MODULE.md](02_FEED_MODULE.md)
- [05_ASSET_DETAIL_MODULE.md](05_ASSET_DETAIL_MODULE.md)
- [13_SETTINGS_MODULE.md](13_SETTINGS_MODULE.md)
- [16_INTEGRATIONS_MODULE.md](16_INTEGRATIONS_MODULE.md)
- [18_ADMIN_SCOPE_NOTE.md](18_ADMIN_SCOPE_NOTE.md)

# 12. Future Enhancement

- Formal performance budget by device/network tier
- WCAG mapping
- Automated accessibility test checklist
- Security threat model
- Observability and SLA/SLO definition
