# 06 BO Market Data Module

**Version:** `BO-06-v1.0`  
**Date:** 2026-08-10  
**Status:** สเปกปัจจุบัน  
**Platform:** Responsive Web Back Office

## UI Standards And Prototype Reference

เอกสารนี้ต้องใช้ร่วมกับ `00_GLOBAL_RULES_MODULE.md` และยึดรูปแบบหน้าจอ/พฤติกรรมที่ยืนยันแล้วใน `../Prototypes/bo-prototype.html` เป็นมาตรฐานหลัก

ห้ามออกแบบ pattern แยกเองสำหรับ list toolbar, breakpoint, table/card layout, pagination, reset, drill-down, drawer, modal หรือ detail layout ยกเว้นเอกสารนี้ระบุไว้ชัดเจนว่าเป็น override ที่อนุมัติแล้ว

Market Data ใน prototype เป็นเมนูอ่านข้อมูลอ้างอิงตลาดนาฬิกาแบบ read-only สำหรับ Phase 1 โดย Admin ใช้เพื่อตรวจดู Brand, Model, Reference, ราคาอ้างอิง, source metadata, sync status และ sync history ที่มาจาก API/backend sync เท่านั้น

## 1. Document Information

| Field | Detail |
| --- | --- |
| Module Name | BO Market Data |
| Platform | Responsive Web Back Office |
| Version | `BO-06-v1.0` |
| Status | สเปกปัจจุบัน |
| Owner | Product / UX / Engineering / Operations |
| Document Type | Functional PRD |

## 2. Objective

Market Data เป็นเมนูสำหรับให้ Admin ตรวจสอบข้อมูลกลางของนาฬิกาที่ระบบใช้ร่วมกันระหว่าง BO และ FO ได้แก่ Brand, Model, Reference, Watch Detail และ Price Index

ข้อมูลเหล่านี้ต้องมาจาก API/backend sync เป็นหลัก โดย prototype อ้างอิง source เป็น `thewatchapi` / The Watch API และให้ BO อ่านจาก TukDaeng backend/cache เท่านั้น ไม่เรียก external provider จาก FO client โดยตรง

หน้าจอนี้ต้องช่วยให้ Admin:

- เห็นสถานะ sync ล่าสุดของ catalog
- เห็นจำนวน Brand, Model และ Reference ที่ใช้งานอยู่
- ไล่ดูข้อมูลแบบ Brand -> Model -> Reference ได้ชัดเจน
- เปิดรายละเอียด Reference ใน drawer เพื่อดูข้อมูลทางเทคนิค ราคาอ้างอิง และ source note
- ตรวจ sync history, endpoint, result, error และ cache impact
- เห็น data quality / mapping warning โดยไม่แก้ master data โดยตรงใน Phase 1

## 3. Scope

### In Scope

- Market Data Dashboard
- Brands & Models catalog
- Brand detail แบบรายการ Model
- Model detail แบบรายการ Reference
- Reference detail drawer
- Sync History list
- Sync History detail page
- Summary metric cards
- Search ภายใน Brands & Models, Brand detail และ Model detail
- Pagination สำหรับรายการ catalog
- Read-only audit trail entry point
- Provider sync status, endpoint, result, retry, rate-limit และ cache action visibility
- Responsive layout ตาม prototype

### Out Of Scope

- เพิ่ม Brand จาก BO
- เพิ่ม Model จาก BO
- เพิ่ม Reference จาก BO
- แก้ไข/ลบ/ปิดใช้งาน/เปิดใช้งาน master data จาก BO
- Override provider data จาก BO
- CSV/XLSX import เพื่อแก้ market data ใน Phase 1
- Export market data จากหน้าจอ Market Data ใน Phase 1
- Manual conflict merge ใน BO
- AI price prediction
- Real-time external market feed pass-through ไป FO
- Portfolio benchmark analytics แบบลึก
- Payment, offer, escrow หรือ settlement data

## 4. Menu Structure

เมนูหลัก: `Market Data`

Submenu ภายใต้ Market Data:

| เมนู | หน้าที่ |
| --- | --- |
| Dashboard | แสดงภาพรวม sync ล่าสุด, จำนวนข้อมูล catalog และแบรนด์ที่เพิ่งอัปเดต |
| Brands & Models | แสดงรายการ Brand ทั้งหมด และ drill-down ไป Model / Reference |
| Sync History | แสดงประวัติ backend sync job จาก provider/API |

พฤติกรรมการนำทาง:

- เมื่อเข้า `Market Data` ให้เปิด `Dashboard` เป็นหน้าแรก
- เมนู `Market Data` และ submenu ที่เลือกต้องแสดง active state ถูกต้อง
- จาก `Dashboard` หรือ `Brands & Models` คลิก Brand เพื่อไป Brand detail
- จาก Brand detail คลิก Model เพื่อไป Model detail
- จาก Model detail คลิก Reference เพื่อเปิด Reference detail drawer
- จาก `Sync History` คลิก `Detail` หรือ row เพื่อเปิด Sync History detail page
- ปุ่มกลับจาก Brand detail ต้องกลับ `Brands & Models`
- ปุ่มกลับจาก Model detail ต้องกลับ Brand detail เดิม
- ปุ่มกลับจาก Sync History detail ต้องกลับ `Sync History`

## 5. Admin Access And Permissions

Admin ที่มีสิทธิ์เข้าถึง Market Data สามารถดู list/detail/search/filter และ sync history ได้ตามสิทธิ์ module access

กฎทั่วไป:

- Market Data Phase 1 เป็น read-only
- Add, edit, delete, import, export, override และ status change ต้องไม่เป็น action ที่ใช้งานได้บนหน้าจอหลัก
- หากมี entry point ที่เกี่ยวกับการแก้ไขจาก prototype/development tool ต้องแสดง modal `Read-only in Phase 1`
- API permission ต้อง enforce ที่ route, API และ service layer ไม่พึ่งเฉพาะการซ่อนปุ่มใน UI
- การเปิด audit trail อ่านได้ตามสิทธิ์ audit/module access
- Manual sync หากเปิดใช้ใน production ต้องจำกัดเฉพาะ operations permission และบันทึก audit ทุกครั้ง

| Action | Phase 1 Rule |
| --- | --- |
| View Dashboard | Allowed |
| View Brand / Model / Reference | Allowed |
| Search catalog | Allowed |
| View Sync History | Allowed |
| View Sync Detail | Allowed |
| View Audit Trail | Allowed by permission |
| Manual Sync Trigger | Operations-only if enabled; audit required |
| Add/Edit/Delete/Import/Export/Override/Status Change | Not available from BO Market Data |

## 6. Responsive Layout

| Breakpoint | ความกว้าง | ข้อกำหนดของ Market Data |
| --- | --- | --- |
| Mobile | `<= 760px` | รายการแสดงเป็น card-like rows, column สำคัญต้องเปลี่ยนเป็น label/value, search เต็มความกว้าง, pagination ใช้งานได้, drawer ต้องไม่ล้นจอ |
| Tablet | `761px - 1365px` | ตารางยังคงอ่านได้โดยคง column สำคัญ, metric cards จัดเรียงตามพื้นที่, detail/drawer ต้องไม่ทับเนื้อหาสำคัญ |
| Desktop | `> 1365px` | แสดง table เต็ม, metric cards 4 ใบ, dashboard status และ brand table เป็น layout หลักตาม prototype |

ข้อกำหนดเพิ่มเติม:

- ข้อความ, chip, button, row และตัวเลขต้องไม่ล้น container
- ตารางใหญ่ต้องใช้ pagination ไม่โหลดทุก record เข้า browser พร้อมกัน
- Row ที่คลิกได้ต้องมี hit area ชัดเจนทั้ง mobile และ desktop
- Reference drawer ต้อง scroll ได้เมื่อเนื้อหายาว

## 7. Dashboard

Header:

- Breadcrumb: `การดำเนินงาน / Market Data / Dashboard`
- Page title: `Dashboard`
- Panel title: `Recently Updated Brands`
- Page action หลักว่างตาม prototype
- Filter bar ว่างตาม prototype

Summary cards ต้องแสดง 4 cards ตามลำดับ:

| Card | ตัวอย่างค่า | คำอธิบาย |
| --- | --- | --- |
| Total Brands | `482` หรือค่าจาก catalog จริง | จำนวน brand ทั้งหมดใน catalog |
| Total Models | `8,924` หรือค่าจาก catalog จริง | จำนวน model ทั้งหมด |
| Total References | ค่าจาก reference catalog | จำนวน reference ทั้งหมด |
| Last Sync | `just now` หรือเวลาล่าสุด | เวลา sync ล่าสุดพร้อม timestamp |

Dashboard content:

- KPI row คงไว้ 4 cards โดย `Last Sync` เป็นข้อมูลเวลาซิงก์ล่าสุด ไม่ใช่สถานะงานที่กำลังทำ
- เมื่อมี sync ที่กำลังทำงานหรือมีข้อผิดพลาดที่ต้องติดตาม ให้แสดง `Latest Sync Status` เป็น status strip เต็มความกว้างใต้ KPI row ในกลุ่มเดียวกัน
- เมื่อไม่มี active sync หรือสถานะที่ต้องติดตาม ให้ซ่อน status strip ทั้งส่วนและยุบพื้นที่ทันที โดยไม่แสดง empty card
- ใช้สีน้ำเงินสำหรับ progress ring ขณะกำลัง Sync และใช้สีแดงเฉพาะกรณี Sync ล้มเหลว เพื่อไม่ให้สถานะกำลังทำงานถูกตีความเป็นข้อผิดพลาด
- Status strip ต้องแสดง progress ring, ข้อความสถานะ, จำนวน synced brands เทียบ total brands, จำนวนรุ่นที่ยังต้องตรวจ price / mapping validation และปุ่ม `ดูรายละเอียดใน Sync History`
- กดปุ่มจาก status strip ต้องพา Admin ไปหน้า `Sync History` เพื่อดูรายการงานที่กำลังทำงานและเปิดรายละเอียด job ได้
- กรณี sync ผิดพลาด ให้แจ้งผลกระทบว่า catalog ล่าสุดยังถูกใช้งาน และให้ Admin ไปตรวจรายละเอียดใน `Sync History`
- แสดงตาราง `Recently Updated Brands`

ตาราง `Recently Updated Brands`:

| Column | ข้อกำหนด |
| --- | --- |
| Brand | ชื่อ brand และคลิกไป Brand detail ได้ |
| Models | จำนวน model |
| References | จำนวน reference |
| Last Updated | เวลา sync ล่าสุด หรือ `Syncing...` |
| Status | `Completed` หรือ `Syncing` |

Pagination:

- แสดงข้อความช่วงรายการ เช่น `แสดง 1-5 จาก <total>`
- มีปุ่มก่อนหน้า, เลขหน้า และถัดไป
- ปุ่มที่ใช้งานไม่ได้ต้อง disabled

## 8. Brands & Models

Header:

- Breadcrumb: `การดำเนินงาน / Market Data / Brands & Models`
- Page title: `Brands & Models`
- Panel title: `All Brands [<brand count>]`
- Page action หลักว่างตาม prototype

Filter:

- มี search field เดียว
- Placeholder: `Search brand / model / reference`
- ค้นหาได้จาก Brand ID, Brand name, Model name, Reference number และข้อมูลย่อยที่เกี่ยวข้อง
- ไม่มี status filter หรือ provider filter บนหน้า Brands & Models ตาม prototype ปัจจุบัน

Summary cards:

| Card | ตัวอย่างค่า | คำอธิบาย |
| --- | --- | --- |
| Sample Brands | `5` | กลุ่ม brand ตัวอย่างที่เปิด drill-down ได้ |
| Sample Models | `10` | จำนวน model ตัวอย่าง |
| Sample References | `24` | จำนวน reference ตัวอย่าง |
| Latest Sync | `08:14` | วันที่/เวลาซิงก์ล่าสุด |

Info cards:

- `Brand-first workflow`
- `API source`
- `Read-only`

ตาราง Brand list:

| Column | ข้อกำหนด |
| --- | --- |
| Brand | ชื่อ brand |
| Models | จำนวน model และ metadata สำหรับ mobile card |
| References | จำนวน reference |
| Action | ปุ่ม `View` เพื่อเปิด Brand detail |

กฎการแสดงผล:

- Row ทั้ง row และปุ่ม `View` ต้องเปิด Brand detail เดียวกัน
- Mobile ต้องแสดง metadata เช่น Models, References, Last Sync ใน card row
- Empty state: `No brands found`
- Pagination ต้องทำงานและ reset ไปหน้าแรกเมื่อ search เปลี่ยน

## 9. Brand Detail

เปิดจาก Brand row ใน `Brands & Models`

Header:

- Breadcrumb: `การดำเนินงาน / Market Data / Brands & Models / <Brand>`
- Page title: `<Brand>`
- Back button: `Back to Brands`
- Panel title: `<Brand> -- All Models (<model count>)`
- ไม่มี summary cards, info cards และ right detail panel

Filter:

- มี search field เดียว
- Placeholder: `Search <Brand> models`

ตาราง Model list:

| Column | ข้อกำหนด |
| --- | --- |
| Model | ชื่อ model |
| References | จำนวน reference และ metadata สำหรับ mobile card |
| Action | ปุ่ม `View` เพื่อเปิด Model detail |

Mobile metadata ต้องมีอย่างน้อย:

- References
- Movement

Empty state: `No models found for this brand`

## 10. Model Detail

เปิดจาก Model row ใน Brand detail

Header:

- Breadcrumb: `การดำเนินงาน / Market Data / Brands & Models / <Brand> / <Model>`
- Page title: `<Model short name>`
- Back button: `Back to <Brand>`
- Panel title: `<Model full name> -- All References (<reference count>)`
- ไม่มี summary cards, info cards และ right detail panel

Filter:

- มี search field เดียว
- Placeholder: `Search <Model> references`

ตาราง Reference list:

| Column | ข้อกำหนด |
| --- | --- |
| Reference No. | เลข reference |
| Movement | movement ของ reference หรือ fallback จาก model |
| Production Year | ปีหรือช่วงปีผลิต |
| Material | วัสดุตัวเรือน |
| Estimated Price | ราคาอ้างอิง ต้องแสดงเป็น pill/market price style |
| Last Updated | วันที่ update ล่าสุด |

กฎการแสดงผล:

- คลิก Reference row เพื่อเปิด Reference detail drawer
- Empty state: `No references found for this model`
- Pagination ต้องทำงานและ reset เมื่อ search เปลี่ยน

## 11. Reference Detail Drawer

Reference detail เปิดเป็น drawer/modal จาก Model detail ไม่ใช่หน้าใหม่

Drawer header:

- แสดง Brand uppercase
- แสดง Model short name
- แสดง `Ref. <reference number>`
- มีปุ่มปิด drawer

Spec grid ต้องแสดง:

| Field | ข้อกำหนด |
| --- | --- |
| Movement | ใช้ reference movement หรือ fallback จาก model |
| ปีที่ผลิต | ปีหรือช่วงปีผลิต |
| วัสดุตัวเรือน | case material |
| ขนาดหน้าปัด | case size |

Price card:

- Label: `ราคาตลาดโดยประมาณ (USD)`
- แสดงราคาจาก provider เป็น USD ใน prototype
- แสดง trend เช่น `+2.4% / 30 วัน`
- แสดง chart preview ตาม prototype

Source copy:

- แสดงคำอธิบาย reference เป็นภาษาไทยเมื่อมี mapping
- หากไม่มีคำอธิบายเฉพาะ ให้ใช้ fallback description ที่อ่านรู้เรื่อง
- แสดง source note ด้านล่าง เช่น `อัปเดตจาก thewatchapi ล่าสุด <date>`

กฎ:

- Drawer ต้องไม่เปิด action แก้ไขข้อมูล
- ข้อมูลราคาเป็น indicative market data ไม่ใช่ราคาขายจริงของ asset
- หากแสดง USD ต้องเก็บ conversion metadata แยกใน backend ก่อนนำไปใช้กับ FO ที่ต้องแสดง THB

## 12. Sync History

Header:

- Breadcrumb: `การดำเนินงาน / Market Data / Sync History`
- Page title: `Sync History`
- Panel title: `Sync Run History`
- Page action หลักว่างตาม prototype
- Filter bar ว่างตาม prototype ปัจจุบัน

Summary cards:

| Card | ตัวอย่างค่า | คำอธิบาย |
| --- | --- | --- |
| Log Entries Today | `5` | จำนวน sync log วันนี้ |
| Completed | `3` | job ที่สำเร็จ |
| Running | `1` | job ที่กำลังทำงาน |
| Failed | `1` | job ที่ล้มเหลวและคง cache เดิม |

Info cards:

- `Brand-first workflow`
- `API source`
- `Read-only`

ตาราง Sync History:

| Column | ข้อกำหนด |
| --- | --- |
| รายการข้อมูล | ชื่อ job และ Job ID |
| ข้อมูลที่อัปเดต | Scope และ scope type |
| สถานะ | Pill เช่น สำเร็จ / กำลังทำงาน / ล้มเหลว |
| เวลา | Started และ duration |
| ผลลัพธ์ | จำนวนที่ sync หรือ error summary |
| หมายเหตุ | แสดง issue เฉพาะ job ที่มี warning/error |
| รายละเอียด | ปุ่ม `Detail` |

ตัวอย่าง job จาก prototype:

| Job ID | Endpoint | Status | Notes |
| --- | --- | --- | --- |
| `JOB-BRAND-LIST` | `/v1/brand/list` | Completed | refresh brand autocomplete และ dependent filters |
| `JOB-MODEL-ROLEX` | `/v1/model/list?brand=rolex` | Completed | refresh Rolex model options |
| `JOB-OMEGA-SEARCH` | `/v1/model/search?brand=omega` | Running | ยังไม่ replace cache จนกว่า job จะเสร็จ |
| `JOB-PATEK-LIST` | `/v1/model/list?brand=patek+philippe` | Completed | refresh Patek Philippe model options |
| `JOB-SEIKO-REF` | `/v1/reference/list?brand=seiko` | Failed | `too_many_results`; ไม่ replace current Seiko cache |

## 13. Sync History Detail

เปิดจาก row หรือปุ่ม `Detail` ใน Sync History

Header:

- Breadcrumb: `การดำเนินงาน / Market Data / Sync History / <Job ID>`
- Page title: ชื่อ sync job เช่น `Brand List Sync`
- Back button: `Back to Sync History`
- Panel title: ชื่อ sync job
- Panel subtitle: `<Job ID> - <Endpoint>`

Summary tiles:

- Job ID
- สถานะ
- เริ่มเมื่อ
- ใช้เวลา

Section สำหรับ Completed:

- Sync Summary: Provider, Endpoint, Sync criteria, Scope, Result
- จำนวนที่ sync
- Sync Status timeline:
  - ดึงข้อมูลจาก provider
  - ตรวจสอบและ normalize
  - อัปเดต backend cache
  - Refresh dependent data

Section สำหรับ Running:

- Sync Summary: Provider, Endpoint, Dataset, Sync criteria
- Processing timeline
- ระบุว่า cache ปัจจุบันยังถูกใช้จนกว่า job จะเสร็จสมบูรณ์

Section สำหรับ Failed:

- Sync Summary: Provider, Endpoint, Dataset, Sync criteria, Error code, Retry count, Rate limit
- Error detail
- Cache impact ต้องระบุว่าไม่แทนที่ cache เดิม
- Processing timeline ต้องแสดง step ที่ล้มเหลว

## 14. Provider And Data Rules

External provider ปัจจุบัน: The Watch API / `thewatchapi`

Supported provider areas:

| Provider Area | BO Target |
| --- | --- |
| Brand list/search | Watch Brand |
| Model list/search | Watch Model / Series |
| Reference list/search | Reference Number |
| Watch detail | Reference detail / watch specification |
| Brand price history | Brand-level Price Index |
| Model price history | Model-level Price Index |
| Reference price history | Reference-level Price Index |

กฎข้อมูล:

- API token ต้องเก็บใน backend secret/config เท่านั้น
- FO client ห้ามเรียก The Watch API โดยตรง
- BO และ FO ต้องอ่านจาก TukDaeng internal API/cache
- ต้องเก็บ provider trace เช่น provider name, provider key, endpoint, params, synced_at
- Reference จาก `reference/list` ที่เป็น brand-scoped ห้าม assume model relation จนกว่า backend mapping/enrichment ยืนยัน
- `watch_references.model_id` ต้อง nullable ได้
- Provider price ที่เป็น USD ต้องเก็บ `source_currency`, `source_price`, `converted_price_thb`, `fx_rate`, `fx_rate_date`, `provider_updated_at`, `synced_at`
- ถ้า provider unavailable, rate limit หรือ usage limit ให้ FO ใช้ cached data ล่าสุดตาม fallback policy

## 15. Data Domains

### 15.1 Watch Brand

ขั้นต่ำต้องมี:

- Brand ID
- Name
- Aliases ถ้ามี
- Provider name/key
- Active status จาก provider/backend policy
- Model count
- Reference count
- Last sync
- Quality/mapping status

### 15.2 Watch Model / Series

ขั้นต่ำต้องมี:

- Model ID
- Brand relation
- Model / Series name
- Reference count
- Movement summary
- Case summary ถ้ามี
- Provider name/key
- Active status จาก provider/backend policy
- Last sync

### 15.3 Reference Number

ขั้นต่ำต้องมี:

- Reference ID
- Brand relation
- Model relation nullable
- Reference number
- Production year / year range
- Case material
- Case size
- Movement
- Description
- Estimated price
- Last updated
- Provider name/key
- Mapping status

### 15.4 Price Index

ขั้นต่ำต้องมี:

- Price Index ID
- Brand / Model / Reference relation
- Source level: Brand, Model หรือ Reference
- Source currency
- Source price
- Converted THB price เมื่อใช้กับ FO
- FX rate และ FX rate date
- Provider updated date
- Synced date
- Effective date
- Quality status

## 16. FO Usage Rules

| FO Area | Market Data Usage |
| --- | --- |
| Add Asset | Brand/model/reference autocomplete, structured selection และ prefill ค่า specification ที่ provider มีให้ |
| Search / Filter | Brand, model, reference, case size, movement และ filter ที่เกี่ยวข้อง |
| Search Autocomplete | แสดงทุก entity ที่ `is_active=true` พร้อมจำนวน Asset Sale ปัจจุบันข้างชื่อ (แม้จำนวนเป็น `0` = no current listing) เพื่อรองรับ Watch Alert use case — entity ที่ `is_active=false` เท่านั้นที่ไม่แสดง |
| Watch Alert | ใช้ criteria schema เดียวกับ Search Filter และ active market data; criteria สามารถอ้าง entity ที่มี no current listing ได้ (ถือเป็น unmet demand ปกติ ไม่ใช่ inactive market data) |
| Portfolio | ใช้ Price Index เป็น valuation source priority แรกเมื่อมีข้อมูลเพียงพอ |
| Watch Price / Integrations | ใช้ latest active price data ตาม brand/model/reference |

Market Data boundary สำหรับ FO Add/Edit Asset:

- Market Data เป็น catalog กลางสำหรับ Brand, Model, Reference, provider specification และ Price Index เท่านั้น
- ข้อมูลที่ Owner กรอกใน Add/Edit Asset เช่น production year, condition, scope of delivery, case size, case material, movement, dial color และ strap/bracelet type ต้องเก็บใน Asset / Asset Specification domain
- เมื่อ Owner เลือก Reference ที่มีใน Market Data ระบบสามารถ prefill spec จาก provider ได้ แต่ Owner ต้องแก้ไขได้ และค่าที่ Owner save ต้องไม่ถูก provider sync overwrite
- Asset ต้องเก็บ relation id ไป Market Data เมื่อเลือก option ที่ match ได้ และต้องเก็บ snapshot text ของ Brand / Model / Reference ไว้กับ Asset เพื่อคง display history
- ถ้า Owner กรอก free-text ที่ยังไม่มีใน Market Data ให้ asset relation เป็น `null` และเก็บ snapshot text ได้ โดยไม่สร้าง Brand / Model / Reference ใหม่ใน BO Market Data Phase 1
- Internal option master เช่น condition, delivery item, case material, movement, dial color และ strap/bracelet type เป็น option สำหรับ Asset form/search filter ไม่ใช่ provider catalog ที่ BO Market Data แก้ไขได้ใน Phase 1; จัดการโดย Admin ผ่าน `17_OPTION_MASTER_MODULE.md` section 22 (FO Integration Guidelines) ซึ่งกำหนด prefill behavior, mapping rule ระหว่าง provider text และ `spec_options` และ fallback behavior เมื่อ option ถูก deactivate
- FO API ที่ให้บริการ Brand/Model/Reference autocomplete และ filter dropdown ต้อง return `listing_count` (จำนวน Asset Sale ปัจจุบันที่ User มีสิทธิ์เห็น) ข้างชื่อ entity ด้วย เพื่อรองรับ Filter Visibility Rule ของ `03_SEARCH_FILTER_MODULE.md` — ค่านี้เปลี่ยนแปลงบ่อย ต้อง cache แยกจาก Market Data catalog หรือดึง on-demand ตอนเปิด dropdown

Inactive หรือ unmapped market data:

- ไม่ควรเป็น option ใหม่ใน FO autocomplete/filter (entity ที่ `is_active=false`)
- ต้องไม่ลบ relation/history ของ asset เดิม
- Watch Alert เดิมต้องเก็บ history ได้ แต่ไม่ควร trigger match ใหม่ถ้า criteria อ้าง option ที่ inactive ตาม policy
- กรณี entity/option `is_active=true` แต่ไม่มี Asset Sale ตอนนั้น (no current listing) ไม่ใช่ inactive market data — entity/option ยังแสดงใน autocomplete/filter พร้อมจำนวน `(0)` และ Watch Alert ที่อ้างถือเป็น unmet demand ปกติ ทำงานต่อได้

## 17. Data Quality

ต้องตรวจอย่างน้อย:

- Duplicate brand/model/reference
- Alias collision
- Missing required fields
- Reference ที่ยังไม่ผูก model
- Invalid price range
- Missing conversion metadata สำหรับ non-THB source price
- Inactive parent with active child
- Provider error หรือ stale sync
- Too many results จาก provider endpoint

Data quality warning ไม่จำเป็นต้อง block ทุกกรณี แต่ต้องแสดงชัดก่อน backend นำข้อมูลไปใช้กับ FO autocomplete, Search, Watch Alert หรือ Portfolio

## 18. Sync And Cache

Backend sync jobs ที่ต้องรองรับ:

- Sync brand list
- Sync models by brand
- Sync references by brand
- Enrich reference -> model relation ผ่าน model/search, reference/search หรือ backend mapping rule
- Sync brand/model/reference price history ตาม plan access

Sync ต้องมี:

- Sync log
- Audit log สำหรับ manual trigger/result/error/retry
- Last successful sync timestamp
- Endpoint, params, parent entity, provider error code/message
- Retry count
- Rate-limit metadata เมื่อ provider ส่งมา
- Cache action / cache invalidation result

Cache invalidation ต้องกระทบ:

- Add Asset autocomplete
- Search filter options
- Search autocomplete
- Watch Alert criteria/matching
- Portfolio valuation
- Watch Price / Price Index surfaces

## 19. Error, Empty, Loading States

| State | ข้อกำหนด |
| --- | --- |
| Loading Dashboard | แสดง skeleton/placeholder สำหรับ metric cards และ table |
| Loading Catalog | แสดง loading state ใน table โดยไม่ทำให้ layout กระโดด |
| Empty Brand Search | แสดง `No brands found` |
| Empty Model Search | แสดง `No models found for this brand` |
| Empty Reference Search | แสดง `No references found for this model` |
| Empty Sync Logs | แสดง `No sync logs found` |
| Provider Failed | แสดง error summary และระบุว่า cache เดิมยังใช้อยู่ถ้าไม่ replace |
| Rate Limit | แสดง error code/rate-limit detail ใน Sync History detail |
| Permission Denied | แสดง access denied ตาม global BO rule |
| Read-only Action | แสดง modal `Read-only in Phase 1` |

## 20. Copy And Visual Rules

Copy rules:

- ใช้ชื่อเมนูและหัวข้อภาษาอังกฤษตาม prototype: `Dashboard`, `Brands & Models`, `Sync History`
- ใช้คำอธิบายภาษาไทยเพื่ออธิบายผลกระทบเชิงงาน
- ห้ามใช้ข้อความ placeholder เช่น `Sample data` เป็นข้อความหลัก
- สถานะ sync ต้องอ่านรู้เรื่อง ไม่แสดง raw backend code เป็นข้อความเดียวโดยไม่มี label
- Price ใน drawer ต้องระบุ currency ชัดเจน

Visual rules:

- Layout ต้องเป็น operational catalog/control view ไม่ใช่ analytics report page
- Summary card ต้องเป็น pattern เดียวกับ BO prototype
- Table row ต้อง compact และอ่านง่าย
- Mobile row ต้องใช้ label/value ตาม prototype
- Drawer ต้องใช้รูปแบบเดียวกับ `market-reference-drawer`
- Card shadow/border ต้องเบาและไม่ซ้อน card ใน card
- Typography ต้องตาม global/prototype style

## 21. Performance

- Dashboard initial load หลังเข้าเมนูควรไม่เกิน 3 วินาทีสำหรับข้อมูลหลัก
- Catalog list ต้องใช้ pagination และ server-side filtering เมื่อข้อมูลจริงมีปริมาณมาก
- Search ต้อง debounce หรือใช้ server query ตามขนาดข้อมูลจริง
- Reference drawer ต้องโหลดข้อมูลเฉพาะ reference ที่เลือก
- Sync History detail ต้องโหลด timeline/metadata เฉพาะ job ที่เปิด
- Provider sync ต้องทำใน backend job ไม่ block UI

## 22. Audit Requirements

ต้อง audit:

- Manual sync trigger หากเปิดใช้
- Manual sync result
- Sync error/retry
- Read-only blocked action ที่เป็น sensitive operation หากเกิดจาก direct route/API
- Future approved correction/export workflow

Audit event ต้องมี:

- Admin ID
- Target type
- Target ID
- Action
- Before/after ถ้ามี
- Result
- Reason ถ้ามี
- Timestamp
- Session/IP context ตาม global audit policy

## 23. Integration With Other Modules

| Module | Integration |
| --- | --- |
| Dashboard | แสดง warning งาน Market Data ใน Work Queue เมื่อมี mapping/price issue |
| Asset Management | Asset detail อ้าง brand/model/reference และใช้ price index ช่วยตรวจราคา |
| Search / Filter | ใช้ active market data สำหรับ filter/autocomplete |
| Watch Alert | ใช้ market schema สำหรับ criteria และ match |
| Portfolio | ใช้ Price Index เป็น valuation source |
| Reports | ใช้ข้อมูล top searched brands และ market/search report แยกจาก Market Data screen |
| Audit Log | ค้น provider sync trigger/result/error/retry ได้ |
| Settings / Permissions | ควบคุม module access และ operations sync permission |

## Module-Specific Exceptions

ไม่มี

Market Data ต้องใช้ app shell, navigation, breakpoint, list toolbar, desktop table/grid, mobile card, pagination, reset, detail/drawer และ confirmation modal ตาม `00_GLOBAL_RULES_MODULE.md` และ `../Prototypes/bo-prototype.html` โดยไม่มี UI/layout override เฉพาะโมดูล

## 24. Acceptance Criteria

| ID | Criteria |
| --- | --- |
| AC-BO-MARKET-001 | เข้าเมนู `Market Data` แล้วเปิด `Dashboard` เป็นหน้าแรก และ active state ของเมนู/submenu ถูกต้อง |
| AC-BO-MARKET-002 | Market Data แสดง submenu ครบ `Dashboard`, `Brands & Models`, `Sync History` ตาม prototype |
| AC-BO-MARKET-003 | Dashboard แสดง summary cards ครบ `Total Brands`, `Total Models`, `Total References`, `Last Sync` |
| AC-BO-MARKET-004 | Dashboard แสดง Latest Sync Status แบบ conditional status strip เมื่อมี sync ที่กำลังทำงาน/ต้องติดตาม พร้อม progress ring, ปุ่มไป Sync History และแสดงตาราง Recently Updated Brands เสมอ |
| AC-BO-MARKET-005 | Dashboard brand row คลิกไป Brand detail ได้ |
| AC-BO-MARKET-006 | `Brands & Models` แสดง panel title `All Brands [<count>]` และมี search field `Search brand / model / reference` |
| AC-BO-MARKET-007 | Brand list แสดง column Brand, Models, References, Action และปุ่ม `View` เปิด Brand detail ได้ |
| AC-BO-MARKET-008 | Brand detail แสดง `<Brand> -- All Models (<count>)`, search model และปุ่มกลับ `Back to Brands` |
| AC-BO-MARKET-009 | Model detail แสดง `<Model> -- All References (<count>)`, search reference และปุ่มกลับ `Back to <Brand>` |
| AC-BO-MARKET-010 | Reference row เปิด Reference detail drawer พร้อม spec grid, USD price card, chart, description และ source note |
| AC-BO-MARKET-011 | `Sync History` แสดง summary cards Log Entries Today, Completed, Running, Failed |
| AC-BO-MARKET-012 | Sync History table แสดง job, scope, status, time, result, issue note และ Detail action |
| AC-BO-MARKET-013 | Sync History detail แสดง Job ID, status, started, duration, endpoint, criteria, result/error และ cache impact |
| AC-BO-MARKET-014 | Failed sync ต้องระบุว่าไม่ replace current cache และแสดง error code/retry/rate-limit เมื่อมีข้อมูล |
| AC-BO-MARKET-015 | Market Data Phase 1 ไม่มี add/edit/delete/import/export/override/status change ที่ใช้งานได้จาก BO |
| AC-BO-MARKET-016 | หากเรียก action ที่ไม่อนุญาต ต้องแสดง `Read-only in Phase 1` และไม่เปลี่ยนข้อมูล |
| AC-BO-MARKET-017 | BO/FO อ่าน market data จาก TukDaeng backend/cache ไม่เรียก The Watch API จาก FO client โดยตรง |
| AC-BO-MARKET-018 | Reference ที่มาจาก brand-scoped endpoint ต้องรองรับ `model_id` nullable จนกว่า backend mapping จะยืนยัน |
| AC-BO-MARKET-019 | Provider USD price ต้องมี conversion metadata ก่อนใช้แสดง/คำนวณเป็น THB บน FO |
| AC-BO-MARKET-020 | Sync/cache refresh ต้อง invalidate downstream cache สำหรับ Add Asset, Search, Watch Alert, Portfolio และ Watch Price |
| AC-BO-MARKET-021 | Empty, loading, failed, rate limit และ permission denied states ต้องแสดงตามที่กำหนด |
| AC-BO-MARKET-022 | Responsive ต้องใช้งานได้ที่ 375px, 760px, 1024px, 1366px และ 1440px โดยข้อความ/ปุ่ม/ตารางไม่ล้นหรือซ้อนกัน |

## 25. Related Modules

- `00_GLOBAL_RULES_MODULE.md`
- `02_DASHBOARD_MODULE.md`
- `04_ASSET_MANAGEMENT_MODULE.md`
- `08_AUDIT_LOG_MODULE.md`
- `11_WATCH_ALERT_MODULE.md`
- `15_REPORTS_ANALYTICS_MODULE.md`
- `16_ADMIN_SETTINGS_MODULE.md`
- `../FrontOffice/03_SEARCH_FILTER_MODULE.md`
- `../FrontOffice/04_ASSET_MANAGEMENT_MODULE.md`
- `../FrontOffice/10_WATCH_ALERT_MODULE.md`
- `../FrontOffice/14_PORTFOLIO_MODULE.md`

## 26. Open Decisions

| ID | Decision Needed | Current Recommendation |
| --- | --- | --- |
| BO-MARKET-DEC-001 | Production จะเปิด manual sync trigger บน BO หรือไม่ | เปิดเฉพาะ operations permission พร้อม audit และ rate-limit guard |
| BO-MARKET-DEC-002 | FX rate source สำหรับ USD -> THB | ต้องเลือก central FX source และเก็บ fx metadata ใน price index |
| BO-MARKET-DEC-003 | การจัดการ mapping warning จะมี queue แยกหรือไม่ | Phase 1 แสดง warning/read-only; workflow แก้ไขให้เป็น backend/provider process |
| BO-MARKET-DEC-004 | Production plan/usage limit ของ The Watch API | Dev/Ops ต้องยืนยัน plan, quota, endpoint access และ rate limit ก่อน launch |
