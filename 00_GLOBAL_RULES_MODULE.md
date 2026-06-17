# 00 Global Rules Module

อ้างอิงหลักจาก [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md)

---

# 1. Document Information

| Field | Detail |
| --- | --- |
| Module Name | Global Rules |
| Platform | Mobile Application |
| Version | V1 |
| Status | Draft |
| Owner | Product / UX / Engineering |
| Document Type | Cross-Module Functional PRD - Master Aligned |

# 2. Objective

Global Rules Module เป็นเอกสารกลางสำหรับกฎที่ทุกโมดูลต้องใช้ร่วมกัน เพื่อลดความคลาดเคลื่อนระหว่าง Feed, Search, Asset Detail, Profile, Watch Alert, Chat, Offer, Social, Board, Settings, Portfolio และ Trust & Safety

เอกสารนี้ครอบคลุม user model, asset status, visibility matrix, global states, lifecycle, trust & safety impact, privacy และ source-of-truth rules ที่ต้องอ้างอิงร่วมกันก่อนตัดสินใจในแต่ละโมดูล

# 3. Prototype Reference

- Global Login Required Dialog
- Empty State
- Deleted / Unavailable Asset State
- Error State
- Offline / Cached Data State
- Blocked / Unavailable User State
- Report Entry State

# 4. Master Alignment Summary

| Area | Master Baseline |
| --- | --- |
| User model | User มี role เดียวหลังสมัคร ไม่แยก Buyer / Seller / Collector |
| Context model | ใช้ Owner / Viewer / Guest เป็น context ไม่ใช่ role ถาวร |
| Asset statuses | ใช้เฉพาะ `Sale`, `Show`, `Hide`, `Sold` |
| Public visibility | Viewer เห็นเฉพาะ `Sale` และ `Show` ตาม surface ที่อนุญาต |
| Marketplace visibility | Feed, Search, Watch Alert ใช้เฉพาะ `Sale` |
| Owner visibility | Owner Profile เห็น Asset ของตัวเองทุกสถานะ |
| Empty state | ทุกหน้าที่ไม่มีข้อมูลใช้ข้อความ `ไม่พบข้อมูล` |
| Login required | Guest ใช้ feature ที่ต้อง Login ต้องเห็น Global Login Required Dialog |
| Deleted asset | Asset ต้องหายจาก public surfaces, Detail แสดง `รายการนี้ไม่พร้อมใช้งานแล้ว` |
| Offline cached | ต้องรองรับข้อมูลล่าสุดที่โหลดไว้เมื่อ offline อย่างน้อยสำหรับ Feed |
| Block | Asset ของผู้ถูก Block ต้องหายจาก Feed, Search, Watch Alert Result |
| Report | Report ไม่ทำให้ Asset หายทันที จนกว่า Admin moderation |
| Privacy | Private asset data เห็นเฉพาะ Owner หรือ Admin ตามสิทธิ์ |
| Source of truth | ถ้าเอกสารอื่น conflict ให้ยึด master และ global rules นี้ก่อน |

# 5. Figma Gap Checklist For Global Rules

| Priority | Gap | Master Baseline | Figma Action |
| --- | --- | --- | --- |
| Must Fix | หลาย screen ยังใช้ status หรือ label จากเอกสารเก่า | ใช้ canonical status `Sale`, `Show`, `Hide`, `Sold` | Normalize label และลบ status model ซ้ำ |
| Must Fix | Public/private visibility ยังเสี่ยงปนกัน | Private data เห็นเฉพาะ Owner หรือ Admin | แยก Owner-only section และ public state ให้ชัด |
| High | Global Login Required Dialog ยังไม่ถูกใช้สม่ำเสมอ | Guest ใช้ feature ที่ต้อง Login ต้องเห็น dialog เดียวกัน | เพิ่ม reusable dialog state และ mapping ทุก action |
| High | Deleted Asset state ยังไม่ครบทุก entry point | Detail ต้องแสดง `รายการนี้ไม่พร้อมใช้งานแล้ว` และ public lists ต้องไม่แสดง asset | เพิ่ม unavailable state ใน Detail, Chat, Offer และ deep link |
| High | Block impact ยังไม่ชัดในหลาย surface | Block ต้องซ่อน Asset จาก Feed, Search, Watch Alert Result และไม่ใช้ Follow relation | เพิ่ม blocked/unavailable state และ filtering note |
| High | Offline cached state ยังมีเฉพาะบางหน้าจอ | อย่างน้อย Feed ต้องแสดงข้อมูลล่าสุดเมื่อ offline | เพิ่ม offline/cached indicator และ fallback state |
| Medium | Empty state copy ไม่สม่ำเสมอ | ทุกหน้าที่ไม่มีข้อมูลใช้ `ไม่พบข้อมูล` | Normalize empty copy หรือระบุข้อยกเว้นอย่างเป็นทางการ |
| Medium | Report อาจสื่อว่า asset หายทันที | Report ไม่ทำให้ Asset หายทันทีจนกว่า Admin moderation | เพิ่ม post-report confirmation ที่ไม่เปลี่ยน visibility ทันที |

# 6. Scope

## In Scope

- User context rules
- Asset status model
- Visibility matrix
- Empty state
- Login Required state
- Deleted / unavailable asset state
- Feed error state
- Offline / cached data state
- Lifecycle rules
- Block and Report impact
- Data privacy rules
- Source-of-truth rules

## Out Of Scope

- UI layout รายหน้าจอของแต่ละโมดูล
- Business flow เฉพาะโมดูล
- Back Office implementation
- Technical API contract แบบละเอียด
- Design system token

# 7. Canonical User Context

| Context | Definition |
| --- | --- |
| User | ผู้ใช้หลังสมัคร มี role เดียว ไม่แยก Buyer / Seller / Collector |
| Owner | User ที่เป็นเจ้าของ Asset หรือ Profile นั้น |
| Viewer | User หรือ Guest ที่กำลังดู Asset หรือ Profile ของคนอื่น |
| Guest | ผู้ใช้ที่ยังไม่ Login |
| Admin | ผู้ดูแลระบบผ่าน Back Office ไม่ใช่ actor หลักของ mobile app |

User เดียวกันสามารถเป็น Owner ใน asset ของตัวเอง และเป็น Viewer เมื่อดู asset ของคนอื่น

# 8. Asset Status Model

ระบบใช้สถานะ Asset ตามชุดนี้เท่านั้น:

- `Sale`
- `Show`
- `Hide`
- `Sold`

ห้ามใช้ status model ซ้ำ เช่น `Available / Sold` แยกอีกชั้น หรือ legacy label ที่ทำให้ data model ขัดกับ master

# 9. Visibility Matrix

| Status | Owner Profile | Public Profile | Feed | Search | Watch Alert |
| --- | --- | --- | --- | --- | --- |
| Sale | แสดง | แสดง | แสดง | แสดง | Match |
| Show | แสดง | แสดง | ไม่แสดง | ไม่แสดง | ไม่ Match |
| Hide | แสดงเฉพาะ Owner | ไม่แสดง | ไม่แสดง | ไม่แสดง | ไม่ Match |
| Sold | แสดงเฉพาะ Owner | ไม่แสดง | ไม่แสดง | ไม่แสดง | ไม่ Match |

# 10. Global State Rules

## Empty State

ทุกหน้าที่ไม่มีข้อมูลใช้ข้อความเดียวกัน:

| Language | Message |
| --- | --- |
| TH | ไม่พบข้อมูล |
| EN | No data found |

## Login Required

Guest ใช้ feature ที่ต้อง Login ต้องแสดง Global Login Required Dialog

Feature ที่ต้อง Login:

- Like
- Follow
- Comment
- Chat
- Make Offer
- Favorites
- Following
- Watch Alert
- Add Asset
- Edit Asset
- Delete Asset

## Deleted Asset

เมื่อ Asset ถูกลบ:

- Asset ต้องหายจาก Feed, Search, Watch Alert และ Public Profile
- Asset Detail ต้องแสดง `รายการนี้ไม่พร้อมใช้งานแล้ว`
- Chat ยังอยู่
- Offer ที่เกี่ยวข้องต้องเป็น `Cancelled`

## Feed Error

หากโหลด Feed ไม่สำเร็จ:

- แสดง Error State
- แสดงปุ่ม `ลองใหม่`

## Offline / Cached Data

ระบบต้องรองรับการแสดงข้อมูลล่าสุดที่โหลดไว้เมื่ออินเทอร์เน็ตขาดหาย อย่างน้อยสำหรับ Feed

# 11. Lifecycle Rules

| Transition | Required Impact |
| --- | --- |
| `Sale` -> `Sold` | หายจาก Feed, Following, Favorites, Search, Watch Alert ทันที; Offer อื่นถูก Reject อัตโนมัติ; Chat ยังอยู่ |
| `Sale` -> `Hide` | หายจาก Feed, Following, Favorites, Search, Watch Alert ทันที |
| `Hide` -> `Sale` | กลับเข้า Feed, Search, Watch Alert และกลับเข้า Following/Favorites ตามเงื่อนไข |
| `Show` -> `Sale` | แสดงใน Feed, Search และ Match Watch Alert |
| `Sale` -> `Show` | หายจาก Feed, Search, Watch Alert แต่ยังแสดงใน Public Profile |
| Deleted | หายจาก public surfaces และ Detail แสดง unavailable state |

# 12. Trust & Safety Global Impact

## Block User

เมื่อ User Block ผู้ใช้อีกคน:

- Asset ของผู้ถูก Block ต้องหายจาก Feed ทันที
- Asset ของผู้ถูก Block ต้องหายจาก Search ทันที
- Asset ของผู้ถูก Block ต้องหายจาก Watch Alert Result ทันที
- ความสัมพันธ์ Follow ระหว่างกันต้องไม่ถูกใช้ในการแสดง Following Feed

## Report

ระบบต้องรองรับ Report:

- Asset
- User
- Comment
- Board Content

Report ไม่ทำให้ Asset หรือ Content หายจาก public surfaces ทันที การซ่อนต้องเกิดจาก Admin moderation

# 13. Data Privacy Rules

ข้อมูลต่อไปนี้เป็น Private และเห็นเฉพาะ Owner หรือ Admin ตามสิทธิ์:

- Provenance
- Purchase Price
- Purchase Date
- Purchase From
- Proof of Payment
- Consignment Owner Contact
- Consignment Terms
- Sold History
- Portfolio Value Detail

Public Profile, Feed, Search, Watch Alert และ Viewer Asset Detail ต้องไม่แสดง private data เหล่านี้

# 14. Source Of Truth Rules

หากเอกสารหรือ Figma มีเงื่อนไขไม่ตรงกัน ให้ตัดสินตามลำดับ:

1. `TukDaeng_Master_Product_Definition.md`
2. `00_GLOBAL_RULES_MODULE.md`
3. Module PRD รายโมดูล
4. Figma annotation
5. Legacy documents

หลักตัดสินความขัดแย้ง:

- ใช้สถานะ canonical: `Sale`, `Show`, `Hide`, `Sold`
- ใช้ Owner / Viewer เป็น context ไม่ใช่ role
- Feed, Search และ Watch Alert ใช้เฉพาะ `Sale`
- Public Profile ใช้ `Sale` และ `Show`
- Owner Profile เห็นทุกสถานะ
- Hide และ Sold ต้องไม่ Public
- Comment เป็น single-level
- Notification types ใช้เฉพาะ Like, Comment, Follow, Offer, Watch Alert

# 15. Validation Rules

- ทุก public surface ต้อง validate asset status ก่อนแสดง
- ทุก private data section ต้อง validate Owner หรือ Admin permission
- ทุก login-required action ต้อง validate authentication
- ทุก blocked relationship ต้องถูกใช้เป็น filter ก่อนแสดง public list
- ทุก lifecycle transition ต้อง update dependent surfaces ตาม matrix

# 16. Exception Handling

| Case | Expected Handling |
| --- | --- |
| User เปิด deleted asset จาก deep link | แสดง `รายการนี้ไม่พร้อมใช้งานแล้ว` |
| Guest ใช้ login-required action | แสดง Global Login Required Dialog |
| Blocked user เปิด profile/asset | แสดง unavailable state หรือไม่แสดงข้อมูลตาม Trust & Safety rule |
| Asset status เปลี่ยนระหว่าง session | เมื่อ sync/refresh ต้องอัปเดต visibility ตาม matrix |
| Offline ระหว่าง Feed | แสดง cached data หากมี |
| ไม่มีข้อมูล | แสดง `ไม่พบข้อมูล` |

# 17. Acceptance Criteria

| ID | Criteria |
| --- | --- |
| AC-GLOBAL-001 | ทุกโมดูลใช้ status เฉพาะ `Sale`, `Show`, `Hide`, `Sold` |
| AC-GLOBAL-002 | Feed, Search และ Watch Alert แสดงหรือ match เฉพาะ Asset `Sale` |
| AC-GLOBAL-003 | Public Profile แสดงเฉพาะ Asset `Sale` และ `Show` |
| AC-GLOBAL-004 | Owner Profile แสดง Asset ของ Owner ได้ทุกสถานะ |
| AC-GLOBAL-005 | Hide และ Sold ไม่แสดงใน public surfaces |
| AC-GLOBAL-006 | Empty state ใช้ `ไม่พบข้อมูล` / `No data found` |
| AC-GLOBAL-007 | Guest ใช้ login-required feature แล้วเห็น Global Login Required Dialog |
| AC-GLOBAL-008 | Deleted Asset หายจาก public lists และ Detail แสดง `รายการนี้ไม่พร้อมใช้งานแล้ว` |
| AC-GLOBAL-009 | Deleted Asset ไม่ลบ Chat แต่ Offer ที่เกี่ยวข้องต้องเป็น `Cancelled` |
| AC-GLOBAL-010 | Block ทำให้ asset ของผู้ถูก Block หายจาก Feed, Search และ Watch Alert Result |
| AC-GLOBAL-011 | Report ไม่ทำให้ content หายทันทีโดยไม่มี Admin moderation |
| AC-GLOBAL-012 | Private asset data ไม่แสดงต่อ Viewer หรือ Guest |
| AC-GLOBAL-013 | Feed error มี Error State และปุ่ม `ลองใหม่` |
| AC-GLOBAL-014 | Feed รองรับ offline cached data |
| AC-GLOBAL-015 | Lifecycle transition ต้อง update surfaces ตาม matrix |

# 18. Related Modules

- [01_AUTHENTICATION_MODULE.md](01_AUTHENTICATION_MODULE.md)
- [02_FEED_MODULE.md](02_FEED_MODULE.md)
- [03_SEARCH_FILTER_MODULE.md](03_SEARCH_FILTER_MODULE.md)
- [04_ASSET_MANAGEMENT_MODULE.md](04_ASSET_MANAGEMENT_MODULE.md)
- [05_ASSET_DETAIL_MODULE.md](05_ASSET_DETAIL_MODULE.md)
- [06_PROFILE_MODULE.md](06_PROFILE_MODULE.md)
- [10_WATCH_ALERT_MODULE.md](10_WATCH_ALERT_MODULE.md)
- [15_TRUST_SAFETY_MODULE.md](15_TRUST_SAFETY_MODULE.md)

# 19. Future Enhancement

- Global design system state catalog
- Central permission matrix for API contract
- Back Office moderation PRD
- Full offline mode beyond Feed
- Real-time cross-surface invalidation
