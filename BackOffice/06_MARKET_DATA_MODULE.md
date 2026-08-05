# 06 BO Market Data Module

**Version:** `BO-06-v0.2`  
**Date:** 2026-08-05  
**Status:** Draft baseline  
**Platform:** Responsive Web Back Office  
**Primary FO Sources:** `../FrontOffice/03_SEARCH_FILTER_MODULE.md`, `../FrontOffice/04_ASSET_MANAGEMENT_MODULE.md`, `../FrontOffice/10_WATCH_ALERT_MODULE.md`, `../FrontOffice/14_PORTFOLIO_MODULE.md`, `../FrontOffice/16_INTEGRATIONS_MODULE.md`  
**Integration Map:** `../ProjectAdmin/FO_BO_INTEGRATION_MAP.md`

## 1. วัตถุประสงค์

BO Market Data Module คือระบบอ่านและติดตามข้อมูลกลางของนาฬิกา เช่น Brand, Model, Reference Number, Watch Detail และ Price Index ที่ดึงจาก API/backend sync เพื่อให้ FO ใช้งานได้สม่ำเสมอใน Add Asset, Search/Filter, Watch Alert และ Portfolio valuation

Market Data เป็น master/reference data ที่มาจาก provider/API เป็นหลัก ผู้ใช้ FO และ Admin ใน BO ไม่สามารถเพิ่ม แก้ไข ลบ ปิดใช้งาน หรือ override master data เหล่านี้ได้โดยตรงใน Phase 1

Current external source ที่ dev ใช้อยู่: `https://www.thewatchapi.com/`

BO ต้องไม่เรียก external API ตรงจาก FO client ให้ใช้ BO/backend เป็นตัว sync, normalize, cache และควบคุม active/inactive ก่อนส่งข้อมูลให้ FO

## 2. Scope

### In Scope

- Watch Brand read-only catalog
- Watch Model / Series read-only catalog
- Reference Number read-only catalog
- Watch detail read-only catalog
- Price Index read-only catalog
- Active/Inactive visibility from provider/backend policy
- External provider sync จาก The Watch API
- Provider sync logs, source metadata, cache status และ data quality visibility
- Data quality validation
- FO sync สำหรับ autocomplete, filter, Watch Alert และ Portfolio
- Responsive web layout

### Out Of Scope

- Real-time external market feed integration แบบ live pass-through ไป FO ใน Phase 1
- BO add/edit/delete/inactivate/reactivate/override market data by Admin ใน Phase 1
- CSV/XLSX import สำหรับแก้หรือเพิ่ม market data เองใน Phase 1
- Manual override/conflict resolution workflow ใน Phase 1
- Export market data เป็นไฟล์จาก BO ใน Phase 1 เว้นแต่เป็น future/reporting scope ที่ได้รับอนุมัติแยก
- AI price prediction
- User-submitted master data approval workflow
- Portfolio benchmark/advanced analytics
- Payment, transaction, escrow หรือ settlement data

## 3. Admin Access And Permissions

BO uses a single Admin account type only. Admin access is controlled by module access, action policy, sensitive-data policy, confirmation, reason, and audit requirements instead of separate BO admin account types.


| Access Area | Rule |
| --- | --- |
| Module access | Admin can use list/detail/search/filter when module access is granted. |
| Write action | Phase 1 has no BO write action for market data. Add, edit, delete, status change, import, override, and conflict merge are hidden/disabled. |
| Provider sync action | Backend scheduled sync is the default. Manual sync trigger is allowed only as an operations action when permission exists, must audit the trigger/result, and must be placed only on the Sync Logs screen, not on Catalog or brand/model/reference detail pages. |
| Sensitive data | Mask by default; reveal only with business reason, policy approval, and audit log. |
| Export | Out of Phase 1 for the Market Data screen unless approved as a reporting workflow. |
| Direct URL/API | Enforce access at route, API, and service layers; never rely only on hidden UI. |
## 4. Responsive Layout

| Width | Requirement |
| --- | --- |
| Mobile-width browser | Master data list แสดงเป็น cards, filter อยู่ใน drawer, drill-down/detail ยังเข้าถึงได้ |
| Tablet | Table แสดง column สำคัญและเปิด detail เป็น panel ได้ |
| Desktop | Full table, side filter, API sync status/logs, detail drawer หรือ split view |

ตารางขนาดใหญ่ต้องใช้ server-side pagination และไม่โหลดข้อมูลทั้งหมดเข้าหน้า browser

## 5. Data Domains

## 5.0 External Provider: The Watch API

The Watch API เป็น external watch data provider ที่ dev ใช้อยู่สำหรับข้อมูล:

- Brand list/search
- Model list/search
- Reference list/search
- Watch details เช่น movement, year of production, case material, case diameter, description
- Historical prices ระดับ brand/model/reference

### Supported API Areas To Map

| The Watch API Area | BO Target |
| --- | --- |
| Brand List / Brand Search | Watch Brand |
| Model List / Model Search | Watch Model / Series |
| Reference List / Reference Search | Reference Number |
| Brand Price History | Brand-level Price Index |
| Model Price History | Model-level Price Index |
| Reference Price History | Reference-level Price Index |

### Provider Data Rules

- API token ต้องเก็บใน backend secret/config เท่านั้น ห้ามอยู่ใน FO client
- BO ต้องเก็บ `provider_name = TheWatchAPI` และ provider record ID/key เท่าที่มี
- ข้อมูลจาก provider ต้องผ่าน normalize ก่อนใช้ใน master data เช่น brand casing, alias, reference formatting, duplicate merge
- Price จาก provider documentation เป็น indicative asking price ใน USD ต้อง convert/normalize ก่อนแสดงเป็น THB หรือใช้ใน Portfolio
- ต้องเก็บ `source_currency`, `source_price`, `converted_price_thb`, `fx_rate`, `fx_rate_date`, `provider_updated_at`, `synced_at`
- ถ้า provider unavailable หรือ usage/rate limit เกิดขึ้น FO ต้องใช้ cached data ล่าสุดหรือ fallback rule ของ Portfolio
- Phase 1 ไม่มี manual override ใน BO ดังนั้น provider/backend sync เป็นแหล่งข้อมูลเดียวสำหรับ market data ที่แสดงใน BO/FO

### Provider Error Handling

ต้องรองรับ error อย่างน้อย:

- Invalid API token
- Usage limit reached
- Endpoint access restricted ตาม subscription plan
- Rate limit reached
- Resource not found
- Maintenance/server error
- Too many results หรือ malformed parameters

BO ต้องบันทึก provider sync status: `Pending`, `Synced`, `Failed`, `Skipped`, `Conflict`

### 5.0A Internal Database Ownership And Phase 1 Read-only Rules

หลังจากดึงข้อมูลจาก The Watch API แล้ว ระบบต้องบันทึกข้อมูลลง database ของ TukDaeng ก่อนใช้งานจริง โดยถือว่า internal database เป็น operational source of truth สำหรับ BO และ FO

หลักการ:

- The Watch API เป็น external provider/source เท่านั้น
- TukDaeng database/cache เป็นแหล่งข้อมูลที่ BO และ FO ใช้อ่านผ่าน internal API
- Admin ใน BO อ่าน ค้นหา กรอง drill-down ดู source metadata ดู data quality และดู sync log ได้เท่านั้นใน Phase 1
- Admin ใน BO ไม่สามารถเพิ่ม แก้ไข ปิดใช้งาน ลบ import หรือ override ข้อมูล market data ได้เองใน Phase 1
- ถ้าพบข้อมูลผิด ให้ใช้ process นอกระบบหรือ future `request correction` workflow แทนการแก้ record ตรง
- FO ต้องเห็นเฉพาะข้อมูลที่ผ่าน active/inactive rule และ policy ของระบบเราแล้ว

Phase 1 action rules:

| Action | Rule |
| --- | --- |
| View/List/Detail/Search/Filter | Allowed for Admin with module access. |
| Manual Sync Trigger | Allowed only for permitted operations users; audit trigger/result and show rate/error status. |
| Create/Update/Delete | Not available in Phase 1. |
| Inactivate/Reactivate | Not available from BO in Phase 1; visibility follows provider/backend policy. |
| Override Provider Data | Not available in Phase 1. |
| Import CSV/XLSX | Not available in Phase 1. |
| Export CSV/XLSX | Not available from this module in Phase 1 unless moved to approved Reports scope. |
| Resolve Conflict | Not available as BO merge action in Phase 1; display data quality issue only. |

Recommended internal fields:

- `source_type`: `Provider`
- `provider_name`
- `provider_key`
- `active_status`
- `last_synced_at`
- `provider_updated_at`
- `quality_status`
- `sync_status`

### 5.1 Watch Brand

Fields ขั้นต่ำ:

- Brand ID
- Name EN
- Name TH
- Aliases
- Logo
- Country
- Founded year
- Official website
- Active/Inactive
- Display order
- Created/updated timestamps

Brand active จึงจะแสดงใน FO autocomplete/filter สำหรับการเลือกใหม่

### 5.2 Watch Model / Series

Fields ขั้นต่ำ:

- Model ID
- Brand relation
- Model / Series name
- Aliases
- Production years ถ้ามี
- Default case size ถ้ามี
- Movement family ถ้ามี
- Active/Inactive
- Created/updated timestamps

Model ต้องผูกกับ active brand และ dependent filter ต้องทำงานแบบ Brand -> Model

### 5.3 Reference Number

Fields ขั้นต่ำ:

- Reference ID
- Brand
- Model / Series
- Reference number
- Year range
- Case material
- Case size
- Movement
- Dial variants
- Strap/bracelet options
- Active/Inactive

Reference number ใช้ช่วย Add Asset, Search keyword, Filter และ Price Index matching

### 5.4 Price Index

Fields ขั้นต่ำ:

- Price Index ID
- Brand
- Model / Series
- Reference number
- Condition ถ้ามี
- Currency
- Min price
- Max price
- Median/Market price
- Source type
- Source URL
- Source note
- Provider name เช่น `TheWatchAPI`
- Provider endpoint/source level: Brand, Model, Reference
- Source currency
- Source price
- Converted THB price
- FX rate และ FX rate date ถ้ามี conversion
- Effective date
- Updated date
- Provider updated date
- Synced date
- Active/Inactive

Currency baseline สำหรับการแสดงผลใน BO และ FO คือ THB แต่ provider price จาก The Watch API เป็น USD ตามเอกสาร provider ดังนั้นต้องมี exchange/conversion rule ชัดเจนก่อนนำไปใช้กับ FO Portfolio หรือ Watch Price

## 6. Active / Inactive Rules

| Entity | Active Result | Inactive Result |
| --- | --- | --- |
| Brand | แสดงใน FO autocomplete/filter และเลือกสร้าง asset ใหม่ได้ | ไม่แสดงสำหรับการเลือกใหม่; existing asset ยังเก็บ brand เดิมได้ |
| Model | แสดงใต้ brand ที่ active | ไม่แสดงสำหรับการเลือกใหม่; existing asset ยังเก็บ model เดิมได้ |
| Reference | ใช้เป็น option/search/matching ได้ | ไม่แสดงเป็น option ใหม่; existing asset ยังอ้างอิงได้ |
| Price Index | ใช้คำนวณ Portfolio/Watch Price/Market Comparison ได้ | ไม่ใช้เป็น current price ใหม่ แต่เก็บ history ได้ |

Inactive brand/model/reference ต้องไม่ทำให้ asset เดิมเสียข้อมูล และต้องไม่ลบ historical relation

## 7. FO Usage Rules

| FO Area | Market Data Usage |
| --- | --- |
| Add Asset | Brand/model/reference autocomplete และ structured selection |
| Search / Filter | Brand, model, reference, condition, case size, movement, dial, strap filters |
| Search Autocomplete | แสดงเฉพาะ option ที่เกี่ยวกับ Sale asset ที่ user มีสิทธิ์เห็น ตาม FO search rule |
| Watch Alert | Criteria ใช้ schema เดียวกับ Search Filter และ match เฉพาะ Sale asset |
| Portfolio | ใช้ Price Index เป็น priority แรกของ Current Value |
| Watch Price / Integrations | ใช้ latest active price data ตาม brand/model/reference |

Market data inactive ต้องหยุด new selection และ Watch Alert trigger ใหม่ที่อ้าง option นั้นตาม policy แต่ไม่ควรทำให้ alert เดิมหายจากประวัติ

## 8. Price Index Rules

### Current Price Selection

เมื่อมี price record หลายรายการ:

1. ใช้ active provider price จาก The Watch API/backend cache ที่ match reference ได้ตรงที่สุด
2. ถ้าไม่มี reference match ให้ fallback ไป model/brand level ตาม policy
3. ใช้ provider updated date/synced date ล่าสุดที่ยัง active ตาม backend policy
4. ถ้าไม่มี active price ให้ FO ใช้ fallback rule ของ Portfolio เช่น Owner Estimated Value, Purchase Price fallback หรือ No Valuation

### Price Validation

- Min price ต้องไม่มากกว่า max price
- Median/market price ต้องอยู่ในช่วง min/max เว้นแต่มี reason
- Currency ต้องระบุ
- Source URL หรือ source note ต้องมีอย่างน้อยหนึ่งรายการ
- Updated date ต้องไม่เป็นอนาคต เว้นแต่เป็น scheduled provider sync ที่แยก workflow
- ถ้า source currency ไม่ใช่ THB ต้องมี conversion metadata ก่อนใช้งานใน FO
- Provider price ต้องแสดง source label และ provider updated date ใน BO

## 9. Provider Sync

### Provider Sync

Phase 1 ให้ใช้ provider sync แบบ backend scheduled job เป็นหลัก หรือ manual operations-triggered sync ที่มี permission และ audit เท่านั้น ไม่ใช่ FO client call

Sync jobs ที่ควรมี:

- Sync brands
- Sync models by brand
- Sync references by brand/model ตาม provider capability
- Sync price history by brand/model/reference ตาม plan ที่เปิดใช้งาน

Sync ต้องมี:

- Retry policy สำหรับ rate limit/server error
- Sync log และ audit log
- Last successful sync timestamp
- Usage/rate limit visibility ถ้า API response/header ให้ข้อมูล

Phase 1 ไม่รองรับ CSV/XLSX import/export จาก Market Data screen เพราะข้อมูล brand/model/reference/detail/price เป็น master data มาตรฐานที่ต้องมาจาก API/backend source เดียวก่อน

## 10. Data Quality

ต้องตรวจ:

- Duplicate brand/model/reference
- Alias collision
- Missing required fields
- Invalid price range
- Inactive parent with active child
- Reference ที่ไม่ผูก brand/model
- Source URL invalid

Data quality warning ไม่จำเป็นต้อง block ทุกกรณี แต่ต้องชัดเจนก่อน backend นำข้อมูลไปใช้กับ FO autocomplete, Search, Watch Alert หรือ Portfolio

## 11. Audit Requirements

ต้อง audit:

- Provider sync trigger และ provider sync result
- Provider sync error/retry
- Future approved correction/export workflow ถ้ามี

Audit event ต้องมี admin ID, admin access, target type, target ID, action/result, reason ถ้ามี, timestamp และ session/IP context ถ้ามี

## 12. FO Sync And Cache

Market data sync/cache refresh ต้อง trigger downstream cache invalidation สำหรับ:

- Add Asset autocomplete
- Search filter options
- Search autocomplete
- Watch Alert criteria/matching
- Portfolio valuation
- Watch Price / Price Index surfaces

ถ้า sync เป็น async ต้องมี status ให้ Admin เห็น เช่น pending, synced, failed และ retry ได้ตาม operations permission

FO ต้องอ่านข้อมูลจาก internal API/cache ของ TukDaeng เท่านั้น ไม่อ่าน The Watch API ตรง เพื่อป้องกัน token leak, rate-limit กระทบผู้ใช้ และควบคุม active/inactive policy ได้

## 13. Error, Empty, Loading States

ต้องรองรับ:

- Empty brand/model/reference/price list
- No search result
- Provider sync failed
- Provider rate/usage limit reached
- Duplicate detected
- Sync failed
- Price source unavailable
- Permission denied

## 14. Integration With Other Modules

| Module | Integration |
| --- | --- |
| Asset Management | Asset detail อ้าง brand/model/reference และใช้ status เพื่อ FO visibility |
| Search / Filter | ใช้ active master data และ Sale-only visibility |
| Watch Alert | Criteria schema ใช้ Search Filter และ active market data |
| Portfolio | Price Index เป็น valuation source priority แรก |
| The Watch API | External provider สำหรับ brand/model/reference/watch details/price history ที่ต้อง sync เข้า BO ก่อนใช้ |
| Dashboard | แสดง data quality warnings, latest price updates, inactive data count จาก sync/cache |
| Audit Log | provider sync trigger/result/error/retry ต้อง searchable |
| Reports | Future approved export/reporting scope แยกจาก Phase 1 Market Data screen |

## 15. Acceptance Criteria

| ID | Criteria |
| --- | --- |
| AC-BO-MARKET-001 | Admin เปิดดู list/detail/search/filter ของ brand/model/reference/detail/price index ได้ตาม module access โดยไม่มี add/edit/delete/import/override action ใน Phase 1 |
| AC-BO-MARKET-002 | Brand -> Model dependent relation ต้องถูกต้องใน BO และส่งผลถึง FO |
| AC-BO-MARKET-003 | Inactive brand/model/reference ไม่แสดงเป็น option ใหม่ใน FO autocomplete/filter |
| AC-BO-MARKET-004 | Existing asset ยังเก็บ historical brand/model/reference ได้แม้ master data ถูก inactive |
| AC-BO-MARKET-005 | Price Index active ใช้เป็น source ของ Portfolio Current Value และ Watch Price |
| AC-BO-MARKET-006 | ถ้าไม่มี active price index FO ต้อง fallback ตาม Portfolio rule |
| AC-BO-MARKET-007 | Market Data screen Phase 1 ต้องไม่มี CSV/XLSX import flow |
| AC-BO-MARKET-008 | The Watch API ต้องถูกเรียกผ่าน backend sync/cache เท่านั้น ไม่ถูกเรียกตรงจาก FO client |
| AC-BO-MARKET-009 | ข้อมูลที่ sync จาก The Watch API ต้องถูกเก็บใน TukDaeng database ก่อน BO/FO ใช้งาน |
| AC-BO-MARKET-010 | Admin ไม่สามารถเพิ่ม/แก้/override market data ใน BO Phase 1 ได้ |
| AC-BO-MARKET-011 | Active/inactive visibility ถูกกำหนดจาก provider/backend policy ไม่ใช่ BO manual status action |
| AC-BO-MARKET-012 | Provider/backend sync เป็น source เดียวของ Phase 1 และต้องเก็บ source trace เพื่อรองรับ future correction workflow |
| AC-BO-MARKET-013 | Provider USD price ต้องมี conversion metadata ก่อนใช้เป็น THB ใน FO |
| AC-BO-MARKET-014 | Market data sync/cache refresh ต้อง trigger cache invalidation ไป FO surfaces ที่เกี่ยวข้อง |
| AC-BO-MARKET-015 | Provider sync trigger/result/error/retry ทุกครั้งต้อง audit-log |
| AC-BO-MARKET-016 | UI responsive ใช้งานได้ที่ mobile-width, tablet และ desktop |

## 16. Open Decisions

| ID | Decision Needed | Current Recommendation |
| --- | --- | --- |
| BO-MARKET-DEC-001 | External price source จะ integrate ใน Phase 1 หรือไม่ | Phase 1 ใช้ The Watch API/backend sync เป็นหลัก และไม่ใช้ manual/import price index |
| BO-MARKET-DEC-002 | Inactive brand/model ส่งผลต่อ Watch Alert เดิมอย่างไร | ไม่ trigger match ใหม่สำหรับ inactive criteria แต่ยังเก็บ alert history |
| BO-MARKET-DEC-003 | Price fallback จาก model/brand level ใช้ได้แค่ไหน | ใช้ได้พร้อม label ชัดเจนว่าเป็น fallback ไม่ใช่ reference exact |
| BO-MARKET-DEC-004 | Multi-currency support | Phase 1 แสดง THB เป็นหลัก |
| BO-MARKET-DEC-005 | The Watch API plan/usage limit ที่ production ต้องใช้ | ต้องให้ dev/ops ยืนยัน plan, quota, endpoint access และ rate limit ก่อน launch |
| BO-MARKET-DEC-006 | FX rate source สำหรับ USD -> THB | ต้องเลือก source กลางและเก็บ fx metadata ใน price index |
