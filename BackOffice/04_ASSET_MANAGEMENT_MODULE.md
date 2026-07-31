# 04 BO Asset Management Module

**Version:** `BO-04-v0.1`  
**Date:** 2026-07-31  
**Status:** Prototype-aligned baseline  
**Platform:** Responsive Web Back Office  
**Primary FO Sources:** `../FrontOffice/04_ASSET_MANAGEMENT_MODULE.md`, `../FrontOffice/05_ASSET_DETAIL_MODULE.md`, `../FrontOffice/02_FEED_MODULE.md`, `../FrontOffice/03_SEARCH_FILTER_MODULE.md`, `../FrontOffice/06_PROFILE_MODULE.md`, `../FrontOffice/10_WATCH_ALERT_MODULE.md`, `../FrontOffice/14_PORTFOLIO_MODULE.md`  
**Integration Map:** `../ProjectAdmin/FO_BO_INTEGRATION_MAP.md`

## 1. วัตถุประสงค์

BO Asset Management คือหน้าจอสำหรับ Admin ใช้ตรวจสอบ จัดการ และควบคุม operational state ของ asset ที่ผู้ใช้สร้างจาก FO

โมดูลนี้ต้องรองรับงานหลัก:

- ดูรายการ asset ทั้งหมดที่เกิดจาก FO
- ตรวจสอบรายละเอียด asset แบบครบถ้วนตามสิทธิ์
- ดู reported asset และดำเนินการ moderation
- จัดการ moderation visibility ของ asset ตามสิทธิ์ โดยไม่เปลี่ยน owner-controlled status โดยตรง
- ตรวจสอบ sensitive context เช่น provenance, proof of payment, consignment และ sold history ในรูปแบบ read-only/masked ตาม prototype
- ทำให้ผลของ BO action sync กลับไป FO surfaces อย่างถูกต้อง
- บันทึก audit log ทุก action ที่กระทบข้อมูลหรือ visibility

## 2. Scope

### In Scope

- Asset list พร้อม search, status/brand filter, sort, pagination และ reset filter ตาม prototype
- Asset detail สำหรับ admin review
- Status visibility control: `Sale`, `Show`, `Hide`, `Sold`, `ซ่อนชั่วคราว`, `ซ่อนถาวร`, `ลบโดยเจ้าของ`
- Reported asset queue และ moderation workflow
- ซ่อนชั่วคราวและซ่อนถาวรจาก public surfaces
- Moderation visibility action ตาม Admin Permission โดยไม่ให้ Admin เปลี่ยน owner-controlled asset status โดยตรง
- Sensitive-field review ผ่าน purchase history, consignment details, proof of payment และ sold history modal ตาม prototype
- Audit trail พร้อม before/after state และ reason
- Responsive layout สำหรับ desktop, tablet และ mobile-width browser

### Out Of Scope

- การสร้าง asset แทน user จาก BO ใน Phase 1
- การแก้ไข business data แทน owner แบบเต็มรูปแบบ
- Payment operation หรือ escrow
- AI moderation
- Offer/chat dispute workflow แบบเต็มรูปแบบ อยู่ใน Phase 2 module
- Generic BO action สำหรับเปลี่ยน `Sale`/`Show`/`Hide`/`Sold`
- Flag/unflag asset, export asset list และ generic sensitive-data reveal flow ยังไม่อยู่ใน prototype ปัจจุบัน

## 3. Admin Access And Permissions

BO uses a single Admin account type only. Admin access is controlled by module access, action policy, sensitive-data policy, confirmation, reason, and audit requirements instead of separate BO admin account types.


| Access Area | Rule |
| --- | --- |
| Module access | Admin can use list/detail/search/filter when module access is granted. |
| Write action | Moderation actions such as temporary hide, restore visibility, permanent hide, and close report require permission check, confirmation for high-risk actions, reason when FO/user impact exists, and audit log. |
| Sensitive data | Prototype shows sensitive review context in read-only/masked form; production reveal policy can be added outside the current prototype flow. |
| Export | Not exposed in the current prototype; production export requires permission check, scope control, expiry/background job where needed, and audit export event. |
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

Asset list ใน prototype แสดงข้อมูลหลักสำหรับ scan และเปิด detail:

- Asset ID
- Asset name
- Brand
- Owner
- Asset Status รวม owner-controlled status และ moderation pill เช่น `Sale`, `Show`, `Hide`, `Sold`, `Consignment`, `ซ่อนชั่วคราว`, `ซ่อนถาวร`, `ลบโดยเจ้าของ`
- Action menu สำหรับเปิด detail และ moderation action ที่ทำได้ตามสถานะ

ข้อมูลเชิงลึก เช่น thumbnail/gallery, model/series, reference no., price, created/updated date, report count, linked offer และ history แสดงใน Asset Detail หรือ Reported Asset Detail แทนการใส่ทุก column ใน list

### Search

Prototype search ใน Assets List ค้นจากข้อมูล asset mock รวมถึง:

- Asset ID
- Brand
- Asset name/model
- Owner name
- Description keyword
- Status/tag/context ที่อยู่ใน mock data

Production implementation อาจขยายให้ค้น owner username/user ID และ reference no. แบบ field-specific ได้เมื่อเชื่อม backend

### Filters

Prototype มี filter ขั้นต่ำ:

- Status: `Sale`, `Show`, `Hide`, `Sold`, `ซ่อนถาวร`, `ลบโดยเจ้าของ`
- Status preset พิเศษ: `Sale - Consignment`
- Brand
- Sort: newest first / oldest first
- Reset filter

Reported asset ใช้ submenu `Reported Assets` พร้อม report status, priority และ sort filter แยกต่างหาก

Production implementation อาจเพิ่ม owner, price range, created/updated date range, has report และ provenance/proof filter ตาม permission หากต้องการ workflow ละเอียดกว่าต้นแบบ

### Saved Views

Phase 1 prototype ใช้ status filter ในหน้า Assets List เป็น saved-view preset หลัก โดยต้องครอบคลุม:

- All Assets = `All asset status`
- Sale Listings = `Sale`
- Public Collection = `Show`
- Owner-only Assets = `Hide`
- Sold Assets = `Sold`
- ซ่อนถาวร = moderation state `Permanently Hidden`
- ลบโดยเจ้าของ = owner-deleted state
- Reported Assets = แยกเป็น submenu/queue `Asset Management > Reported Assets` ไม่ใช่ saved view ใน Assets List

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

### Price Display Rules

ให้ใช้ rule กลางเดียวกับ FO:

- Owner สามารถกรอก `Asking Price (THB)` ได้ทุกสถานะ (`Sale`, `Show`, `Hide`) และระบบสามารถเก็บราคาต่อไปในสถานะ `Sold`
- Price เป็น optional ทุกสถานะ; ถ้าไม่กรอกต้องเก็บเป็น empty/null และ BO ต้องแสดง `-` ไม่สร้าง placeholder เช่น `N/A`
- BO Asset Detail / Report Detail ต้องแสดง field `Price` เสมอ: มีราคาให้แสดงราคา ไม่มีราคาให้แสดง `-`
- FO public/buyer-facing surface แสดงราคาเฉพาะ status `Sale`
- Status `Sale`: ถ้ามีราคา FO แสดงราคานั้น; ถ้าไม่มีราคา FO แสดง `Price on request`
- Status `Show` หรือ `Hide`: แม้มีราคากรอกไว้ FO public surface ต้องไม่แสดงราคา; ราคาเห็นได้เฉพาะ Owner ในหน้าแก้ไข / owner-private view และ BO/Admin view
- Status `Sold`: BO แสดงราคาปกติเหมือน Sale; FO owner-facing sold view หากมีราคาให้แสดงเป็นราคาขีดฆ่าเพื่อบอกว่าขายแล้ว

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

Prototype แสดงข้อมูลกลุ่มนี้ใน read-only modal เช่น purchase history, consignment details, proof of payment และ sold history โดยใช้ข้อมูลตัวอย่างแบบ masked/summarized
ระบบจริงควรต่อยอดด้วย Admin Permission, permission denied state และ reveal audit เมื่อมีการเปิดข้อมูลเสี่ยงสูงแบบเต็ม

## 7. Status And FO Visibility Matrix

| Status | FO Visibility | Feed | Search | Watch Alert | Offer |
| --- | --- | --- | --- | --- | --- |
| `Sale` | Public marketplace + owner profile + public profile | Yes | Yes | Yes | Available |
| `Show` | Public profile/detail only | No | No | No | Detail/Profile only if FO Offer rule allows |
| `Hide` | Owner only | No | No | No | Not available |
| `Sold` | Owner sold history + admin review | No | No | No | Not available |
| `ซ่อนชั่วคราว` | Hidden from public FO surfaces ระหว่างรอตรวจสอบ; owner ยังเห็นพร้อมสถานะถูกซ่อนชั่วคราว | No | No | No | Existing related offers disabled/paused per offer policy |
| `ซ่อนถาวร` | Hidden from all public FO surfaces; owner ยังเห็นแบบ read-only พร้อมสถานะถูกซ่อนถาวร | No | No | No | Existing related offers invalidated/cancelled per offer policy |
| `ลบโดยเจ้าของ` | เจ้าของลบ asset จาก FO แล้ว; ไม่แสดงใน owner list ปกติหรือ public surfaces แต่ BO ยังเก็บ record ตาม retention policy | No | No | No | Existing related offers cancelled per offer policy |

หมายเหตุ: เอกสาร BO ตั้งแต่ `BO-04-v0.1` เป็นต้นไปให้ใช้ status ตาม FO คือ `Show` และ `Hide` เท่านั้น
`Hide` ในตารางนี้หมายถึง owner ตั้ง asset ให้เห็นเฉพาะเจ้าของ ไม่ใช่การซ่อนชั่วคราวจาก report/moderation

`ซ่อนถาวร` เป็น moderation state ของ Back Office ไม่ใช่การลบข้อมูลจริง และไม่ใช่ `Hide` ที่ owner เลือกเองจาก Front Office

## 8. Status Change Rules

Admin ไม่มีสิทธิ์เปลี่ยน owner-controlled asset status โดยตรง เช่น `Sale`, `Show`, `Hide`, `Sold`
ใน Phase 1 สถานะเหล่านี้ต้องมาจาก FO owner action หรือ transaction/offer flow เท่านั้น

BO action ใน prototype เป็น moderation visibility overlay บนสถานะเดิม เช่น `Admin Hidden`, `Auto Hidden`, `Permanently Hidden` และต้องมี:

- Permission check
- Confirmation modal
- Required reason
- Before/after value
- Audit log
- FO sync event หรือ cache invalidation

### Required FO Impact

| Change | Required Result |
| --- | --- |
| `Sale` -> `Sold` | ไม่ใช่ BO quick action; ต้องมาจาก owner action หรือ transaction/offer flow เท่านั้น หลังเปลี่ยนแล้วถอดจาก Feed, Search, Watch Alert, public marketplace surfaces; owner เห็นใน Sold tab; main asset edit ใน FO เป็น read-only |
| `Sale` -> `Hide` | Owner action เท่านั้นใน V1; ถอดจาก public surfaces ทั้งหมด เหลือ owner-only |
| `Hide` -> `Sale` | Owner action เท่านั้นใน V1; กลับเข้า Feed/Search/Watch Alert เมื่อข้อมูลครบตาม FO rule |
| `Show` -> `Sale` | Owner action เท่านั้นใน V1; กลับเข้า marketplace surfaces และรับ offer ได้ตาม FO rule |
| `Sale` -> `Show` | Owner action เท่านั้นใน V1; หายจาก Feed/Search/Watch Alert แต่ยังอยู่ public profile/detail |
| Any -> `ซ่อนชั่วคราว` | หายจาก public surfaces ระหว่างรอตรวจสอบ; restore/unhide ได้เฉพาะเมื่อ Admin ตรวจแล้วไม่ผิด |
| Any -> `ซ่อนถาวร` | หายจาก public surfaces ทั้งหมด; owner ยังเห็นแบบ read-only พร้อมสถานะถูกซ่อนถาวร; owner แก้ไข publish ใหม่ ยกเลิกซ่อน boost mark sold หรือลบเองไม่ได้; ไม่ถูกนับใน portfolio/asset value |
| Any -> `ลบโดยเจ้าของ` | เกิดจากเจ้าของเป็นผู้ลบใน FO; หายจาก owner list ปกติและ public surfaces; BO เก็บ record ตาม retention policy และไม่ถูกนับใน portfolio/asset value |

ดังนั้น prototype ต้องไม่มี generic BO control สำหรับเปลี่ยน `Sale`/`Show`/`Hide`/`Sold` โดยตรง
Admin ทำได้เฉพาะ moderation actions ที่ซ้อนทับ visibility และ report outcome ตามสิทธิ์

ถ้า asset ที่ถูกซ่อนถาวร, ลบโดยเจ้าของ หรือ sold มี pending offers ต้องส่งผลไป Offer lifecycle เป็น invalidated/cancelled ตาม offer policy ที่กำหนดใน Phase 2

เมื่อ asset ถูกลบโดยเจ้าของจาก FO ต้องมีรายการใน Asset Status History / Audit History ด้วย โดย actor เป็นเจ้าของ asset, action เป็น `Asset Deleted By Owner`, before เป็นสถานะก่อนลบ และ after เป็น `ลบโดยเจ้าของ`

## 9. Reported Asset Handling

เมื่อ FO user report asset:

- Asset ต้องเข้า BO reported asset queue
- Report 1 ครั้ง: เข้า reported asset queue และยังไม่ซ่อนจาก FO
- Report 3 ครั้งจาก unique reporter: ยกระดับเป็น priority review / `Reviewing` แต่ยังไม่ซ่อนจาก FO อัตโนมัติ
- Report 5 ครั้งจาก unique reporter: ระบบซ่อนโพสต์ชั่วคราวได้โดยคง `Asset Status` เดิม เช่น `Sale` หรือ `Show` และตั้ง `Moderation State` เป็น `Auto Hidden` หรือ `Pending Review` เพื่อรอ Admin ตรวจสอบ
- Temporary report hiding ใช้ได้เฉพาะ asset ที่มี public visibility คือ `Sale` และ `Show`; ห้ามใช้กับ `Hide` เพราะเป็น owner-only อยู่แล้ว และห้ามใช้กับ `Sold` เพราะเป็น sold history/read-only
- ถ้า asset ถูก report ตอนเป็น `Sale`/`Show` แต่ owner เปลี่ยนเป็น `Hide` หรือ `Sold` ก่อน Admin action หรือก่อนถึง auto-hide threshold ให้ report queue ยังเก็บ report ไว้เพื่อ audit/review แต่ต้อง block `Force Hide` และไม่ตั้ง `Moderation State = Auto Hidden`; UI ต้องแสดง current asset status ล่าสุดและให้ Admin ทำได้เฉพาะ review/no action, ซ่อนถาวรตาม policy หรือ action กับ account/report ถ้าหลักฐานผิดจริง
- การซ่อนอัตโนมัติจากจำนวน report ต้องนับ unique reporter เท่านั้น ไม่นับ report ซ้ำจาก user เดิม และต้องมี guardrail กัน report bombing จากบัญชีใหม่หรือกลุ่มบัญชีที่เกี่ยวข้องกัน
- กรณี risk สูง เช่น scam, counterfeit, stolen image, ข้อมูลหลอกลวง หรือ external payment fraud ใน V1 ยังไม่มี automated detector/verified signal ให้ซ่อนอัตโนมัติจาก reason เพียงอย่างเดียว; ให้เข้า priority review และให้ Admin ใช้ `Force Hide` เองหลังดู evidence
- Admin ต้อง review report แล้วเลือก action
- Action ที่เป็นไปได้ใน V1: no action/keep visible, Force Hide โดยตั้ง `Moderation State = Admin Hidden`, Restore visibility หลังตรวจแล้วไม่ผิด, ซ่อนถาวรตาม policy
- Restore visibility รองรับเฉพาะ asset ที่ถูกซ่อนชั่วคราวเท่านั้น ไม่รองรับการ restore จากสถานะซ่อนถาวรใน moderation flow ปกติ
- การลบ asset จริงไม่ใช่ action ปกติในหน้า Asset Management ของ prototype นี้ หากต้องลบข้อมูลจริงให้ถือเป็นกระบวนการนอกหน้าจอปกติ เช่น internal request, legal/privacy request หรือ system retention job ตามนโยบายระบบ
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

ใน prototype ปัจจุบัน sensitive context เป็น read-only review modal และใช้ข้อมูลตัวอย่างแบบ masked/summarized
ถ้าระบบจริงเพิ่มปุ่ม reveal ข้อมูลเต็ม ต้อง audit เมื่อข้อมูลมีความเสี่ยงสูง เช่น proof of payment หรือ consignment contact

## 11. Admin Actions

| Action | Requirement |
| --- | --- |
| View detail | Admin access must have module access |
| View purchase/provenance context | Read-only/masked modal ตาม prototype |
| View consignment details | Read-only/masked modal ตาม prototype |
| View sale history | Read-only/summarized modal สำหรับ sold asset |
| ซ่อนชั่วคราว | Confirmation + reason required; audit; FO surfaces update |
| ยกเลิกซ่อนชั่วคราว | Confirmation + reason required; audit; FO surfaces update |
| ซ่อนถาวร | Confirmation + reason required; audit; FO surfaces update; owner เห็น read-only และไม่สามารถลบเอง |
| Close report | Confirmation/reason ตาม report outcome และ audit; รายงานที่ปิดแล้วถือเป็น final state ใน Phase 1 และไม่เปิดกลับจาก prototype flow ปกติ |

Admin action scope ใน Phase 1 ไม่รวมการเปลี่ยน `Sale`/`Show`/`Hide`/`Sold` โดยตรง เพราะเป็น owner-controlled หรือ transaction-controlled status

Bulk action, flag/unflag, export asset list และ generic reveal sensitive data ไม่อยู่ใน prototype ปัจจุบัน หากเพิ่มภายหลังต้องมี permission, confirmation/reason ตามความเสี่ยง และ audit

## 12. Error, Empty, Loading States

ต้องรองรับ:

- Empty list เมื่อไม่มี asset ตาม filter
- Empty reported queue
- Asset unavailable state เมื่อ asset ถูกซ่อนถาวรหรือ ลบโดยเจ้าของ ระหว่างเปิดหน้า
- Error scenario ใน confirmation modal สำหรับซ่อนชั่วคราว, restore visibility และซ่อนถาวร
- Production implementation ควรเพิ่ม partial load error, permission denied state และ stale status warning เมื่อเชื่อม backend จริง

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

Action types ที่ prototype ต้องแสดงใน history/audit:

- `ASSET_TEMP_HIDE`
- `ASSET_TEMP_UNHIDE`
- `ASSET_PERMANENT_HIDE`
- `ASSET_OWNER_DELETE`
- `ASSET_RESTORE` ใช้เฉพาะการยกเลิกซ่อนชั่วคราว

Action types สำหรับ production extension แต่ไม่อยู่ใน prototype ปัจจุบัน:

- `ASSET_FLAG`
- `ASSET_UNFLAG`
- `ASSET_EXPORT`
- `ASSET_SENSITIVE_FIELD_REVEAL`

## 14. Integration With Other BO Modules

| Module | Integration |
| --- | --- |
| Dashboard | ใช้ asset count, reported asset count, status distribution, recent moderation |
| User Management | Asset list/detail ต้อง link กลับ owner profile ใน BO |
| Offer & Chat | Asset ซ่อนถาวร, ลบโดยเจ้าของ หรือ sold ต้องกระทบ pending offer และ related chat context |
| Social Interaction | Reported comments บน asset detail ต้องเชื่อม context |
| Watch Alert | Sale asset เท่านั้นที่ trigger watch alert |
| Audit Log | ทุก write/export/reveal action ต้อง searchable |
| Reports & Analytics | Asset data ต้อง export/aggregate ตาม permission |

## 15. Performance

Prototype ปัจจุบันเป็น static HTML/JS mock และทำ search/filter/sort/pagination ฝั่ง client จาก mock data ทั้งหมด

เมื่อเปลี่ยนเป็น production implementation:

- Asset list ต้องใช้ server-side pagination
- Search/filter ต้องไม่โหลด asset ทั้งหมดมาที่ client
- Image gallery ใช้ thumbnail และ lazy loading
- Export ขนาดใหญ่ควรเป็น background job หากเปิด export feature
- Dashboard metric ควรอ่านจาก aggregate/cache ไม่ query detail หนักทุกครั้ง

## 16. Acceptance Criteria

| ID | Criteria |
| --- | --- |
| AC-BO-ASSET-001 | Admin เห็น asset list พร้อม search/filter/sort/pagination ตาม Admin access |
| AC-BO-ASSET-002 | Asset detail แสดง core fields, gallery/FO preview, status, owner, comments, history และ moderation context ครบ |
| AC-BO-ASSET-003 | Sensitive review context แสดงใน read-only/masked/summarized modal ตาม prototype และพร้อมต่อยอด permission/reveal audit ในระบบจริง |
| AC-BO-ASSET-004 | Reported asset เข้า queue โดยไม่หายจาก FO ทันที เว้นแต่มี rule ชัดเจน |
| AC-BO-ASSET-005 | ซ่อนชั่วคราว/ยกเลิกซ่อนชั่วคราว/ซ่อนถาวร และ report outcome ต้องมี confirmation, reason และ audit; Admin ต้องไม่เปลี่ยน `Sale`/`Show`/`Hide`/`Sold` โดยตรง |
| AC-BO-ASSET-006 | BO moderation visibility action sync ผลไป FO surfaces ตาม visibility matrix โดยไม่เปลี่ยน owner-controlled status ตรง ๆ |
| AC-BO-ASSET-007 | BO implementation ใช้ status `Show` และ `Hide` ตาม FO เป็นหลัก และ normalize คำเก่าจาก legacy source ก่อนใช้งาน |
| AC-BO-ASSET-008 | Sold asset ใช้สำหรับ owner history/admin review และไม่กลับไป marketplace surface |
| AC-BO-ASSET-009 | Asset ที่ถูกซ่อนถาวรหรือ ลบโดยเจ้าของ หายจาก public FO surfaces และ direct link ใช้ unavailable behavior |
| AC-BO-ASSET-010 | Responsive layout ใช้งานได้ที่ mobile-width, tablet และ desktop |
| AC-BO-ASSET-011 | Asset ที่ถูกซ่อนถาวรยังแสดงให้ owner เห็นแบบ read-only แต่ owner แก้ไข publish ใหม่ ยกเลิกซ่อน boost mark sold หรือลบเองไม่ได้ |
| AC-BO-ASSET-012 | Asset ที่ถูกซ่อนถาวรและ ลบโดยเจ้าของ ต้องไม่ถูกนำไปรวมใน portfolio/asset value |
| AC-BO-ASSET-013 | Asset ที่ลบโดยเจ้าของต้องมี history/audit row ระบุ actor เจ้าของ, action `Asset Deleted By Owner`, before/after state และ timestamp |

## 17. Open Decisions

| ID | Decision Needed | Current Recommendation |
| --- | --- | --- |
| BO-ASSET-DEC-001 | จะเปิด restore จากสถานะซ่อนถาวรใน Phase 1 หรือไม่ | ไม่เปิดใน moderation flow ปกติ; restore ได้เฉพาะซ่อนชั่วคราว |
| BO-ASSET-DEC-002 | Sensitive-field reveal ต้อง audit ทุกครั้งหรือเฉพาะ high-risk fields | Audit อย่างน้อย proof of payment, consignment contact และ export |
| BO-ASSET-DEC-003 | Pending offer เมื่อ asset ถูก BO remove/sold ใช้ status `Cancelled` หรือ `Invalidated` | ใช้ `Invalidated` เป็น system-caused state และ map UX ใน Offer module |
| BO-ASSET-DEC-004 | Direct-link unavailable copy ใน FO | ให้ FO UX กำหนด copy แต่ BO ต้องส่ง state ที่ชัดเจน |

