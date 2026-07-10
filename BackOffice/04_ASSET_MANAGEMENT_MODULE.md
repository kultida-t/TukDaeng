# 04 BO Asset Management Module

**Version:** `BO-04-v0.1`  
**Date:** 2026-07-06  
**Status:** Draft baseline  
**Platform:** Responsive Web Back Office  
**Primary FO Sources:** `../FrontOffice/04_ASSET_MANAGEMENT_MODULE.md`, `../FrontOffice/05_ASSET_DETAIL_MODULE.md`, `../FrontOffice/02_FEED_MODULE.md`, `../FrontOffice/03_SEARCH_FILTER_MODULE.md`, `../FrontOffice/06_PROFILE_MODULE.md`, `../FrontOffice/10_WATCH_ALERT_MODULE.md`, `../FrontOffice/14_PORTFOLIO_MODULE.md`  
**Integration Map:** `../ProjectAdmin/FO_BO_INTEGRATION_MAP.md`

## 1. วัตถุประสงค์

BO Asset Management คือหน้าจอสำหรับ Admin ใช้ตรวจสอบ จัดการ และควบคุม operational state ของ asset ที่ผู้ใช้สร้างจาก FO

โมดูลนี้ต้องรองรับงานหลัก:

- ดูรายการ asset ทั้งหมดที่เกิดจาก FO
- ตรวจสอบรายละเอียด asset แบบครบถ้วนตามสิทธิ์
- ดู reported/flagged asset และดำเนินการ moderation
- เปลี่ยนสถานะหรือ visibility ของ asset ตามสิทธิ์
- ควบคุม sensitive fields เช่น provenance, proof of payment, consignment และ sold history
- ทำให้ผลของ BO action sync กลับไป FO surfaces อย่างถูกต้อง
- บันทึก audit log ทุก action ที่กระทบข้อมูลหรือ visibility

## 2. Scope

### In Scope

- Asset list พร้อม search, filter, sort, pagination และ export ตาม permission
- Asset detail สำหรับ admin review
- Status visibility control: `Sale`, `Show`, `Hide`, `Sold`, `Removed/Hidden`
- Reported asset queue และ moderation workflow
- Flag/unflag asset
- Soft remove / hide from public surfaces
- Force status change ตาม Admin Permission
- Sensitive-field masking และ reveal ตาม Admin access
- Audit trail พร้อม before/after state และ reason
- Responsive layout สำหรับ desktop, tablet และ mobile-width browser

### Out Of Scope

- การสร้าง asset แทน user จาก BO ใน Phase 1
- การแก้ไข business data แทน owner แบบเต็มรูปแบบ
- Payment operation หรือ escrow
- AI moderation
- Offer/chat dispute workflow แบบเต็มรูปแบบ อยู่ใน Phase 2 module

## 3. Admin Access And Permissions

BO uses a single Admin account type only. Admin access is controlled by module access, action policy, sensitive-data policy, confirmation, reason, and audit requirements instead of separate BO admin account types.


| Access Area | Rule |
| --- | --- |
| Module access | Admin can use list/detail/search/filter when module access is granted. |
| Write action | Create, update, status change, remove, restore, publish, archive, retry, and similar actions require permission check, confirmation for high-risk actions, reason when FO/user impact exists, and audit log. |
| Sensitive data | Mask by default; reveal only with business reason, policy approval, and audit log. |
| Export | Requires permission check, scope control, expiry/background job where needed, and audit export event. |
| Direct URL/API | Enforce access at route, API, and service layers; never rely only on hidden UI. |
## 4. Responsive Layout

BO Asset Management ต้องเป็น responsive web application:

| Width | Layout Requirement |
| --- | --- |
| Mobile-width browser | Table เปลี่ยนเป็น stacked cards, filter อยู่ใน drawer/bottom sheet, action สำคัญยังเข้าถึงได้ |
| Tablet | Table แสดง column สำคัญ, secondary fields เปิดผ่าน detail panel |
| Desktop | Full table, side filter, bulk/saved view controls และ split detail panel ได้ |

ห้ามมี horizontal overflow ที่ทำให้ action หลักใช้งานไม่ได้ ยกเว้น table container ที่ตั้งใจให้ scroll เฉพาะภายใน

## 5. Asset List

Asset list ต้องแสดงข้อมูลขั้นต่ำ:

- Asset ID
- Thumbnail
- Brand
- Model / Series
- Reference No.
- Owner
- Status
- Moderation state
- Flag/report count
- Asking price หรือ owner estimated value ตาม permission
- Created date
- Updated date
- Last status change
- Linked offers count ถ้ามี

### Search

ต้องค้นหาได้จาก:

- Asset ID
- Brand
- Model / Series
- Reference No.
- Owner name / username / user ID
- Description keyword

### Filters

ต้องมี filter ขั้นต่ำ:

- Status: `Sale`, `Show`, `Hide`, `Sold`, `Removed/Hidden`
- Moderation state: normal, flagged, reported, removed
- Brand
- Owner
- Price range
- Created date range
- Updated date range
- Has report
- Has consignment
- Has provenance/proof fields ตาม permission

### Saved Views

Phase 1 ควรรองรับ saved views อย่างน้อย:

- All Assets
- Sale Listings
- Public Collection
- Owner-only Assets
- Sold Assets
- Reported Assets
- Removed Assets

## 6. Asset Detail

Asset detail ต้องรวมข้อมูลสำหรับ review:

### Core Fields

- Gallery images สูงสุด 10 รูป
- Brand
- Model / Series
- Reference No.
- Year
- Condition
- Scope of Delivery
- Case Size
- Thickness
- Case Material
- Movement
- Dial Color
- Strap / Bracelet Type
- Description
- Status
- Owner
- Created/updated timestamps

### Commerce Fields

- Asking Price
- Owner Estimated Value
- Offer summary ถ้ามี
- Sold status และ sold history ถ้ามี

### Provenance And Consignment

ข้อมูลกลุ่มนี้เป็น sensitive data:

- Provenance type
- Purchase Price
- Purchase Date
- Purchase From
- Proof of Payment
- Consignment owner contact
- Consignment terms
- Consignment asking price

BO ต้องแสดงข้อมูลกลุ่มนี้ตาม Admin Permission เท่านั้น และควร mask เป็น default สำหรับ admin access ที่ไม่ได้รับสิทธิ์

## 7. Status And FO Visibility Matrix

| Status | FO Visibility | Feed | Search | Watch Alert | Offer |
| --- | --- | --- | --- | --- | --- |
| `Sale` | Public marketplace + owner profile + public profile | Yes | Yes | Yes | Available |
| `Show` | Public profile/detail only | No | No | No | Detail/Profile only if FO Offer rule allows |
| `Hide` | Owner only | No | No | No | Not available |
| `Sold` | Owner sold history + admin review | No | No | No | Not available |
| `Removed/Hidden` | Hidden from public FO surfaces | No | No | No | Existing related offers invalidated/cancelled per offer policy |

หมายเหตุ: เอกสาร BO ตั้งแต่ `BO-04-v0.1` เป็นต้นไปให้ใช้ status ตาม FO คือ `Show` และ `Hide` เท่านั้น

## 8. Status Change Rules

Admin force status change ต้องมี:

- Permission check
- Confirmation modal
- Required reason
- Before/after value
- Audit log
- FO sync event หรือ cache invalidation

### Required FO Impact

| Change | Required Result |
| --- | --- |
| `Sale` -> `Sold` | ถอดจาก Feed, Search, Watch Alert, public marketplace surfaces; owner เห็นใน Sold tab; main asset edit ใน FO เป็น read-only |
| `Sale` -> `Hide` | ถอดจาก public surfaces ทั้งหมด เหลือ owner-only |
| `Hide` -> `Sale` | กลับเข้า Feed/Search/Watch Alert เมื่อผ่าน moderation และข้อมูลครบ |
| `Show` -> `Sale` | กลับเข้า marketplace surfaces และรับ offer ได้ตาม FO rule |
| `Sale` -> `Show` | หายจาก Feed/Search/Watch Alert แต่ยังอยู่ public profile/detail |
| Any -> `Removed/Hidden` | หายจาก public surfaces และ direct link ต้องแสดง unavailable behavior ตาม FO policy |

ถ้า asset ที่ถูก remove/sold มี pending offers ต้องส่งผลไป Offer lifecycle เป็น invalidated/cancelled ตาม offer policy ที่กำหนดใน Phase 2

## 9. Reported And Flagged Asset Handling

เมื่อ FO user report asset:

- Asset ต้องเข้า BO reported asset queue
- Asset ไม่ควรถูกซ่อนจาก FO ทันที เว้นแต่มี policy/system rule ชัดเจน
- Admin หรือ Admin ต้อง review report แล้วเลือก action
- Action ที่เป็นไปได้: resolve/no action, flag, unflag, force status, soft remove
- ทุกผลลัพธ์ต้อง audit-log และผูกกลับ report record

Reported asset detail ควรแสดง:

- Report reason
- Reporter
- Reported owner
- Report timestamp
- Previous report history
- Asset current status
- Related comments/offers ถ้ามีและ admin access มีสิทธิ์

## 10. Sensitive Data Rules

Sensitive fields ต้องไม่แสดงแบบเปิดโล่งกับทุก Admin access:

| Data | Default Behavior | Allowed Roles |
| --- | --- | --- |
| Purchase Price | Masked | Admin, admin access ที่ได้รับ permission เฉพาะ |
| Purchase Date / Purchase From | Masked หรือ partial | Admin ตาม policy |
| Proof of Payment | Hidden/preview blocked | Admin หรือ permission เฉพาะ |
| Consignment Owner Contact | Masked | Admin ตาม case |
| Consignment Terms | Masked | Admin, permission เฉพาะ |
| Sold History | Limited summary | Admin ตาม case |

การ reveal sensitive field ควรถูก audit เมื่อข้อมูลมีความเสี่ยงสูง เช่น proof of payment หรือ consignment contact

## 11. Admin Actions

| Action | Requirement |
| --- | --- |
| View detail | Admin access must have module access |
| Reveal sensitive data | Permission required; audit when high-risk |
| Flag asset | Reason required; audit |
| Unflag asset | Reason required; audit |
| Soft remove asset | Confirmation + reason required; audit; FO surfaces update |
| Force status change | Permission + confirmation + reason; audit; FO sync |
| Export asset list | Permission required; audit export event |

Bulk action ใน Phase 1 ควรจำกัดเฉพาะ low-risk action หรือทำผ่าน queue ที่มี confirmation ชัดเจน ห้าม bulk reveal sensitive data

## 12. Error, Empty, Loading States

ต้องรองรับ:

- Empty list เมื่อไม่มี asset ตาม filter
- Empty reported queue
- Partial load error สำหรับ sensitive section โดยไม่ทำให้ detail ทั้งหน้าล่ม
- Permission denied state สำหรับ action หรือ field ที่ admin access ไม่มีสิทธิ์
- Asset unavailable state เมื่อ asset ถูก remove/archive ระหว่างเปิดหน้า
- Stale status warning เมื่อมี concurrent update

## 13. Audit Requirements

ทุก write action ต้องบันทึก:

- Admin ID
- Admin Access
- Action type
- Target asset ID
- Before value
- After value
- Reason/note
- Related report ID ถ้ามี
- IP address หรือ session context ถ้ามี
- Timestamp เป็น `Asia/Bangkok`

Action types ขั้นต่ำ:

- `ASSET_FLAG`
- `ASSET_UNFLAG`
- `ASSET_REMOVE`
- `ASSET_RESTORE` ถ้าเปิดใช้ในอนาคต
- `ASSET_FORCE_STATUS_CHANGE`
- `ASSET_EXPORT`
- `ASSET_SENSITIVE_FIELD_REVEAL`

## 14. Integration With Other BO Modules

| Module | Integration |
| --- | --- |
| Dashboard | ใช้ asset count, reported asset count, status distribution, recent moderation |
| User Management | Asset list/detail ต้อง link กลับ owner profile ใน BO |
| Offer & Chat | Asset removed/sold ต้องกระทบ pending offer และ related chat context |
| Social Interaction | Reported comments บน asset detail ต้องเชื่อม context |
| Watch Alert | Sale asset เท่านั้นที่ trigger watch alert |
| Audit Log | ทุก write/export/reveal action ต้อง searchable |
| Reports & Analytics | Asset data ต้อง export/aggregate ตาม permission |

## 15. Performance

- Asset list ต้องใช้ server-side pagination
- Search/filter ต้องไม่โหลด asset ทั้งหมดมาที่ client
- Image gallery ใช้ thumbnail และ lazy loading
- Export ขนาดใหญ่ควรเป็น background job
- Dashboard metric ควรอ่านจาก aggregate/cache ไม่ query detail หนักทุกครั้ง

## 16. Acceptance Criteria

| ID | Criteria |
| --- | --- |
| AC-BO-ASSET-001 | Admin เห็น asset list พร้อม search/filter/sort/pagination ตาม Admin access |
| AC-BO-ASSET-002 | Asset detail แสดง core fields, gallery, status, owner และ moderation context ครบ |
| AC-BO-ASSET-003 | Sensitive fields ถูก mask เป็น default และเปิดได้เฉพาะ admin access ที่มี permission |
| AC-BO-ASSET-004 | Reported asset เข้า queue โดยไม่หายจาก FO ทันที เว้นแต่มี rule ชัดเจน |
| AC-BO-ASSET-005 | Flag/unflag/remove/force status ต้องมี confirmation, reason และ audit |
| AC-BO-ASSET-006 | BO status change sync ผลไป FO surfaces ตาม visibility matrix |
| AC-BO-ASSET-007 | BO implementation ใช้ status `Show` และ `Hide` ตาม FO เป็นหลัก และ normalize คำเก่าจาก legacy source ก่อนใช้งาน |
| AC-BO-ASSET-008 | Sold asset ใช้สำหรับ owner history/admin review และไม่กลับไป marketplace surface |
| AC-BO-ASSET-009 | Removed asset หายจาก public FO surfaces และ direct link ใช้ unavailable behavior |
| AC-BO-ASSET-010 | Responsive layout ใช้งานได้ที่ mobile-width, tablet และ desktop |

## 17. Open Decisions

| ID | Decision Needed | Current Recommendation |
| --- | --- | --- |
| BO-ASSET-DEC-001 | จะเปิด `restore removed asset` ใน Phase 1 หรือไม่ | ยังไม่เปิดเป็น default; ถ้าต้องเปิดต้องมี Admin permission และ audit |
| BO-ASSET-DEC-002 | Sensitive-field reveal ต้อง audit ทุกครั้งหรือเฉพาะ high-risk fields | Audit อย่างน้อย proof of payment, consignment contact และ export |
| BO-ASSET-DEC-003 | Pending offer เมื่อ asset ถูก BO remove/sold ใช้ status `Cancelled` หรือ `Invalidated` | ใช้ `Invalidated` เป็น system-caused state และ map UX ใน Offer module |
| BO-ASSET-DEC-004 | Direct-link unavailable copy ใน FO | ให้ FO UX กำหนด copy แต่ BO ต้องส่ง state ที่ชัดเจน |
