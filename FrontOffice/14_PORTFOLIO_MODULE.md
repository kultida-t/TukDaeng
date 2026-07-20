# 14 Portfolio Module

อ้างอิงหลักจาก [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md)

---

# 1. Document Information

| Field | Detail |
| --- | --- |
| Module Name | Portfolio |
| Version | 1.0 |
| Status | Functional PRD - Master Aligned |
| Owner | Tuk Daeng Project |
| Document Type | Front Office Functional PRD |
| Source of Truth | TukDaeng Master Product Definition |

---

# 2. Objective

Portfolio Module ใช้สำหรับให้ Owner ดูมูลค่าคอลเลกชันส่วนตัวของตนเอง โดยคำนวณจาก Asset สถานะ Sale, Show และ Hide ที่ยังใช้งานได้เท่านั้น

Portfolio เป็นข้อมูล private เห็นเฉพาะ Owner และต้องไม่แสดงใน Public Profile

---

# 3. Prototype Reference

| Prototype | Usage |
| --- | --- |
| Main Owner Profile.png | Total Asset Value entry point และ Owner-only profile context |
| Detail asset owner.png | Owner-only private asset data และ Sold History context |

---

# 4. Master Alignment Summary

| Topic | Master Baseline | Portfolio Module Rule |
| --- | --- | --- |
| Privacy | Portfolio เป็น Private และเห็นเฉพาะ Owner | Guest/Public Viewer/User อื่นห้ามเข้าถึง Portfolio |
| Entry Point | Total Asset Value เป็น entry point สำหรับกดเข้า Portfolio | Portfolio เปิดจาก Owner Profile ผ่าน Total Asset Value |
| Calculation | Portfolio คำนวณจาก Sale, Show, Hide ที่ยังใช้งานได้ | ใช้เฉพาะ Asset 3 สถานะนี้ และต้องไม่รวมรายการที่ owner deleted หรือถูก Back Office ซ่อนถาวร |
| Exclusion | Portfolio ไม่รวม Sold, Owner Deleted และซ่อนถาวร | รายการเหล่านี้ไม่ถูกนำไปคำนวณ Total Asset Value |
| Market Price | Watch Price API ใช้ดึงราคาตลาด | ใช้เป็นแหล่ง Current Value ลำดับแรก |
| Fallback Price | หากไม่มีราคาตลาดต้องมี fallback | ใช้ Owner Estimated Value, Purchase Price fallback หรือแสดง No Valuation ตามลำดับ |
| Gain/Loss | คำนวณจาก Current Value เทียบ Purchase Price | คำนวณเฉพาะรายการที่มีข้อมูลพอและไม่ใช้ Purchase Price fallback |
| Sold History | เก็บ Sale Date, Buyer, Contact, Sale Price, Payment Method, Attachment | Sold History แยกจาก Portfolio Value |
| Data Privacy | Portfolio Value Detail, Sold History, Purchase Price/Date/From เป็น private | ห้ามแสดงใน Public Profile หรือ Viewer mode |
| Owner Profile | Owner เห็น Asset ตัวเองทุกสถานะ | Portfolio data ใช้ Owner-only asset scope |
| Public Profile | Public Profile เห็นเฉพาะ Sale และ Show และไม่เห็น private data | Public Profile ไม่แสดง Portfolio Value Detail |

---

# 5. Figma Gap Checklist For Portfolio Module

| Priority | Figma Gap | Master Baseline | Action |
| --- | --- | --- | --- |
| High | Portfolio privacy ยังไม่ชัด | Portfolio เห็นเฉพาะ Owner | เพิ่ม Owner-only Portfolio state และห้าม Public Profile เข้าถึง |
| High | Total Asset Value / Portfolio entry ยังไม่ชัด | Total Asset Value เป็น entry point สำหรับ Portfolio | เพิ่ม interaction จาก Owner Profile ไป Portfolio |
| High | Portfolio calculation ต้อง lock status | Portfolio คำนวณจาก Sale, Show, Hide | annotate calculation source ให้ชัด |
| High | Sold อาจถูกนับรวมใน Portfolio Value | Portfolio ไม่รวม Sold | ระบุว่า Sold excluded และแยกไป Sold History |
| High | Sold History fields ยังไม่ครบ | Sold History ต้องเก็บ Sale Date, Buyer, Contact, Sale Price, Payment Method, Attachment | เพิ่ม field display/state ให้ครบ |
| High | Public Profile อาจแสดง Portfolio/private data | Portfolio Value Detail, Sold History, Purchase data เป็น private | ห้ามแสดงใน Public Profile/Viewer mode |
| Medium | Empty state ของ Portfolio/Sold History ยังไม่ชัด | Empty State ใช้ `ไม่พบข้อมูล` / `No data found` | เพิ่ม empty state ตามข้อความกลาง |
| Medium | Deleted / ซ่อนถาวร treatment ยังไม่ชัด | Owner Deleted และซ่อนถาวรหายจาก public surfaces และไม่ควรคำนวณ Portfolio | ระบุ Owner Deleted และซ่อนถาวรไม่ถูกนับใน Portfolio |
| High | Market Value source / formula ยังไม่ชัด | Current Value ใช้ Watch Price API -> Owner Estimated Value -> Purchase Price fallback -> No Valuation | Annotate สูตรและ fallback ใน Portfolio dashboard/list |
| High | Gain/Loss calculation ยังไม่ชัด | Unrealized Gain/Loss = Current Value - Purchase Price เฉพาะรายการที่มีข้อมูลพอ | เพิ่ม Gain/Loss display state และ no-calculation state |
| High | Realized Gain/Loss ของ Sold History ยังไม่ชัด | Realized Gain/Loss = Sale Price - Purchase Price และแยกจาก Portfolio Value | เพิ่มสูตรและ unavailable state ใน Sold History |
| High | Expected Profit / Market Comparison ยังไม่ชัด | Expected Profit ใช้ Asking Price - Purchase Price, Market Comparison ใช้ Asking Price เทียบ Watch Price API Market Price | เพิ่ม Owner-only expected profit และ public-safe market comparison state |
| Medium | Holding Period / Top Brand / YTD ยังไม่ชัด | V1 รองรับ Holding Period, Top 3 Brand Holdings และ YTD วิธี A | เพิ่มสูตร, fallback และ note เมื่อข้อมูล snapshot ไม่พอ |

---

# 6. Scope

## In Scope

- Portfolio entry จาก Total Asset Value บน Owner Profile
- Owner-only Portfolio view
- Total Asset Value
- Current Market Value / Current Value per Asset
- Unrealized Gain/Loss
- Realized Gain/Loss สำหรับ Sold History
- Expected Profit / Expected Profit %
- Market Comparison: Above Market, At Market, Below Market
- Holding Period
- Top Brand Holdings
- YTD Performance วิธี A
- Valuation source label
- No market price / no valuation fallback
- Asset ที่ใช้คำนวณ: Sale, Show, Hide ที่ยังใช้งานได้
- Exclude Sold, Owner Deleted และซ่อนถาวรจาก Portfolio value
- Sold History แยกจาก Portfolio value
- Sold History fields:
  - Sale Date
  - Buyer
  - Contact
  - Sale Price
  - Payment Method
  - Attachment
- Empty state
- Permission denied state

## Out of Scope For V1 Unless Master Adds Decision

- Portfolio benchmark
- Portfolio allocation chart
- Brand performance trend
- Asset appreciation forecast
- Benchmark performance beyond YTD method A
- Portfolio export PDF / Excel
- Realized + Unrealized blended performance model
- Cash-flow adjusted return / IRR
- Benchmark comparison

---

# 7. Screen Mapping

| Screen / Component | Description |
| --- | --- |
| Owner Profile Total Asset Value | Entry point เข้า Portfolio |
| Portfolio Dashboard | แสดง Total Asset Value และ asset summary เฉพาะ Owner |
| Portfolio Asset List | รายการ Asset สถานะ Sale, Show, Hide ที่ถูกนำมาคำนวณ |
| Sold History | รายการ Sold Asset และข้อมูลการขาย |
| Permission Denied | state เมื่อ user อื่นพยายามเข้าถึง |
| Empty State | state เมื่อไม่มี Portfolio asset หรือ Sold History |

---

# 8. User States

## Guest

- ไม่สามารถเข้า Portfolio ได้
- ไม่เห็น Portfolio Value Detail
- หากพยายามเข้าถึงทาง deep link ต้องถูก block หรือแสดง login/permission state ตาม navigation pattern

## Member / Owner

- เห็น Portfolio ของตัวเองได้
- เห็น Total Asset Value ของตัวเองได้
- เห็น Asset สถานะ Sale, Show, Hide ที่ถูกนำมาคำนวณ
- Asset ที่ถูก Back Office ซ่อนถาวรอาจยังเห็นได้จาก owner read-only detail แต่ต้องไม่อยู่ใน Portfolio Asset List และไม่รวม Total Asset Value
- เห็น Sold History ของตัวเองได้

## Public Viewer / Other User

- ไม่เห็น Portfolio ของ user อื่น
- ไม่เห็น Portfolio Value Detail
- ไม่เห็น Sold History
- Public Profile เห็นเฉพาะ Sale และ Show ตาม master เท่านั้น

---

# 9. User Flow

## Open Portfolio Flow

```text
Owner Profile
-> Total Asset Value
-> Portfolio Dashboard
```

## View Portfolio Asset Flow

```text
Portfolio Dashboard
-> Portfolio Asset List
-> Select Asset
-> Owner Asset Detail
```

## View Sold History Flow

```text
Portfolio Dashboard
-> Sold History
-> View Sold History Detail
```

## Permission Denied Flow

```text
Other User opens Portfolio deep link
-> Permission denied / unavailable state
```

---

# 10. Business Rules

## Privacy Rule

- Portfolio เป็น private
- Portfolio เห็นเฉพาะ Owner
- Public Viewer และ user อื่นไม่มีสิทธิ์เข้าถึง
- Portfolio Value Detail ต้องไม่แสดงใน Public Profile

## Entry Point Rule

- Total Asset Value บน Owner Profile เป็น entry point ไป Portfolio
- Public Profile ไม่ควรมี Portfolio entry

## Calculation Source Rule

Portfolio คำนวณจาก Asset สถานะ:

- Sale
- Show
- Hide

Portfolio ไม่รวม:

- Sold
- Owner Deleted
- ซ่อนถาวรจาก Back Office
- Asset ของ user อื่น
- Asset ที่ user ไม่มีสิทธิ์เห็น

## Portfolio Calculation Baseline

### Eligible Asset

Eligible Asset คือ Asset ที่ใช้คำนวณ Portfolio ได้ ต้องตรงเงื่อนไขทั้งหมด:

- Owner เป็นเจ้าของ Asset
- Status เป็น `Sale`, `Show` หรือ `Hide`
- Asset ยังไม่ถูกลบ
- Asset ไม่ใช่ Owner Deleted
- Asset ไม่ถูก Back Office ซ่อนถาวร
- Asset ไม่ใช่ `Sold`

### Current Value Per Asset

Current Value คือมูลค่าปัจจุบันที่ใช้คำนวณ Total Asset Value โดยเลือกแหล่งข้อมูลตามลำดับนี้:

| Priority | Source | Rule | Display Label |
| --- | --- | --- | --- |
| 1 | Watch Price API Market Price | ใช้เมื่อ API match brand/model/reference/condition ได้ | `ราคาตลาดล่าสุด` / `Latest market price` |
| 2 | Owner Estimated Value | ใช้เมื่อ Owner ระบุราคาประเมินเอง และไม่มี market price | `ราคาประเมินโดยเจ้าของ` / `Owner estimate` |
| 3 | Purchase Price Fallback | ใช้เมื่อไม่มี market price และไม่มี owner estimate แต่มี Purchase Price | `ใช้ราคาซื้อเป็นค่าประมาณ` / `Using purchase price estimate` |
| 4 | No Valuation | ใช้เมื่อไม่มี market price, owner estimate หรือ purchase price | `ไม่มีราคาตลาด` / `No market price` |

ถ้า Source เป็น `No Valuation`:

- Asset ยังแสดงใน Portfolio Asset List
- Current Value แสดงเป็น `—`
- Asset ไม่ถูกรวมใน Total Asset Value
- Asset ไม่ถูกใช้คำนวณ Gain/Loss

### Total Asset Value

```text
Total Asset Value = SUM(Current Value ของ Eligible Asset ที่มี Current Value)
```

Rules:

- รวมเฉพาะ Asset สถานะ `Sale`, `Show`, `Hide`
- ไม่รวม `Sold`
- ไม่รวม Owner Deleted Asset
- ไม่รวม Asset ที่ถูก Back Office ซ่อนถาวร
- ไม่รวม Asset ที่เป็น `No Valuation`
- แสดงจำนวน coverage เป็น `คำนวณจาก X/Y รายการ` โดย:
  - `X` = จำนวน Eligible Asset ที่มี Current Value
  - `Y` = จำนวน Eligible Asset ทั้งหมด

### Acquisition Cost

```text
Acquisition Cost = Purchase Price
```

Rules:

- ถ้าไม่มี Purchase Price ให้ถือว่า Acquisition Cost เป็น `null`
- ห้ามใช้ `0` แทน Purchase Price ที่ไม่มีข้อมูล
- Asset ที่ไม่มี Purchase Price จะไม่ถูกใช้คำนวณ Gain/Loss

### Unrealized Gain/Loss Per Asset

คำนวณเฉพาะ Asset ที่มี:

- Current Value จาก Watch Price API หรือ Owner Estimated Value
- Purchase Price

```text
Unrealized Gain/Loss = Current Value - Purchase Price
```

```text
Unrealized Gain/Loss % = (Unrealized Gain/Loss / Purchase Price) * 100
```

Rules:

- ถ้า Current Value ใช้ Purchase Price Fallback ให้แสดง Gain/Loss เป็น `—` เพราะไม่ได้มีราคาตลาดหรือราคาประเมินใหม่จริง
- ถ้าไม่มี Purchase Price ให้แสดง Gain/Loss เป็น `—`
- ถ้า Purchase Price <= 0 ให้แสดง Gain/Loss เป็น `—`

### Total Unrealized Gain/Loss

```text
Total Unrealized Gain/Loss = SUM(Unrealized Gain/Loss ของ Asset ที่คำนวณได้)
```

```text
Total Unrealized Gain/Loss % = Total Unrealized Gain/Loss / SUM(Purchase Price ของ Asset ที่คำนวณ Gain/Loss ได้) * 100
```

Rules:

- ถ้าไม่มี Asset ที่คำนวณ Gain/Loss ได้ ให้แสดง `ยังคำนวณกำไรไม่ได้` / `Gain/Loss unavailable`
- แสดง coverage เป็น `คำนวณกำไรจาก X/Y รายการ`

### Expected Profit

Expected Profit ใช้สำหรับ Owner ประเมินกำไรคาดการณ์จากราคาที่ตั้งขายหรือราคาที่ต้องการเสนอขาย

คำนวณเฉพาะ Asset ที่มี:

- Asking Price
- Purchase Price

```text
Expected Profit = Asking Price - Purchase Price
```

```text
Expected Profit % = (Expected Profit / Purchase Price) * 100
```

Rules:

- แสดงเฉพาะ Owner view เพราะใช้ Purchase Price ซึ่งเป็น private data
- ใช้ได้กับ Asset สถานะ `Sale`, `Show` และ `Hide` หากมี Asking Price
- หากไม่มี Asking Price หรือ Purchase Price ให้แสดง `—`
- หาก Purchase Price <= 0 ให้แสดง `—`
- Expected Profit ไม่ใช่กำไรจริง และต้องไม่รวมใน Realized Gain/Loss

### Market Comparison

Market Comparison ใช้เปรียบเทียบ Asking Price กับ Market Price เพื่อช่วยให้ Owner และ Viewer เข้าใจว่าราคาที่ตั้งอยู่สูงหรือต่ำกว่าตลาด

คำนวณเฉพาะ Asset ที่มี:

- Asking Price
- Watch Price API Market Price

```text
Market Comparison = Asking Price - Market Price
```

```text
Market Comparison % = (Market Comparison / Market Price) * 100
```

Display state:

| Condition | Label |
| --- | --- |
| Market Comparison % > 1% | `Above Market` |
| Market Comparison % >= -1% และ <= 1% | `At Market` |
| Market Comparison % < -1% | `Below Market` |

Rules:

- ใช้ Watch Price API Market Price เท่านั้น ไม่ใช้ Owner Estimated Value หรือ Purchase Price fallback สำหรับ Above/At/Below
- ใช้ช่วง `-1%` ถึง `+1%` เป็น `At Market` เพื่อกันเคสส่วนต่างเล็กน้อยจากการปัดเศษราคา
- หากไม่มี Market Price ให้แสดง `ไม่มีราคาตลาด` / `No market price`
- หากไม่มี Asking Price ให้แสดง `—`
- Market Comparison สามารถแสดงใน Asset Detail ได้โดยไม่เปิดเผย Purchase Price

### Realized Gain/Loss For Sold Asset

Realized Gain/Loss ใช้กับ Sold Asset เท่านั้น และต้องแยกออกจาก Total Asset Value และ Unrealized Gain/Loss

คำนวณเฉพาะ Sold Asset ที่มี:

- Sale Price
- Purchase Price

```text
Realized Gain/Loss = Sale Price - Purchase Price
```

```text
Realized Gain % = (Realized Gain/Loss / Purchase Price) * 100
```

Rules:

- แสดงใน Sold History / Sold Detail เฉพาะ Owner
- Sold Asset ไม่ถูกนับใน Total Asset Value
- Sold Asset ไม่ถูกนับใน Total Unrealized Gain/Loss
- หากไม่มี Sale Price หรือ Purchase Price ให้แสดง `—`
- หาก Purchase Price <= 0 ให้แสดง `—`

### Holding Period

Holding Period คือระยะเวลาที่ Owner ถือครอง Asset

สำหรับ Asset ที่ยังไม่ขาย:

```text
Holding Period = Today - Purchase Date
```

สำหรับ Sold Asset:

```text
Holding Period = Sale Date - Purchase Date
```

Rules:

- ใช้ timezone `Asia/Bangkok`
- ถ้า Asset ยังไม่ขาย ให้ใช้วันที่ปัจจุบันของระบบ
- ถ้า Asset ขายแล้ว ให้ใช้ Sale Date
- หากไม่มี Purchase Date ให้แสดง `—`
- หาก Sale Date น้อยกว่า Purchase Date ให้แสดง `—` และ flag validation error ฝั่ง data
- แสดงผลเป็นจำนวนวัน เช่น `547 days` และ UI สามารถแสดง human readable เพิ่มได้ เช่น `1y 5m`

### Top Brand Holdings

Top Brand Holdings เป็น analytics ของจำนวน Asset ที่ Owner ถืออยู่ ไม่ใช่สูตรกำไร

```text
Top Brand Holdings = Top 3 Brands by count(Eligible Asset)
```

Rules:

- นับเฉพาะ Eligible Asset สถานะ `Sale`, `Show`, `Hide`
- ไม่รวม `Sold`
- ไม่รวม Owner Deleted Asset
- ไม่รวม Asset ที่ถูก Back Office ซ่อนถาวร
- เรียงลำดับด้วย:
  1. จำนวน Asset มากไปน้อย
  2. Total Current Value ของ brand มากไปน้อย
  3. Brand name A-Z
- หากไม่มี brand ให้จัดกลุ่มเป็น `Unknown`
- หากไม่มี Eligible Asset ให้แสดง `ไม่พบข้อมูล` / `No data found`

### YTD Performance

YTD Performance V1 ใช้วิธี A เพื่อให้เข้าใจง่ายและ QA ตรวจได้ตรงกับแนวคิดพอร์ตลงทุน

```text
YTD Performance = (Portfolio Value Today - Portfolio Value Start Of Year) / Portfolio Value Start Of Year * 100
```

Definitions:

- Portfolio Value Today = Total Asset Value ล่าสุดของวันนี้
- Portfolio Value Start Of Year = Portfolio value snapshot ณ วันที่ 1 มกราคม เวลา 00:00:00 ตาม timezone `Asia/Bangkok`

Rules:

- YTD V1 ไม่รวม Realized Gain/Loss จาก Sold Asset ในสูตรหลัก
- Realized Gain/Loss ต้องแสดงแยกใน Sold History
- หากไม่มี snapshot วันที่ 1 มกราคม ให้ใช้ snapshot แรกสุดของปีนั้น และแสดง label `YTD จากข้อมูลแรกของปี` / `YTD from first available data`
- หากไม่มี snapshot ในปีนั้น หรือ Portfolio Value Start Of Year <= 0 ให้แสดง `—`
- หาก Watch Price API unavailable ให้ใช้ fallback Current Value ตาม Current Value priority และแสดง source coverage ตามปกติ

### Display Formatting

- Currency แสดงเป็น THB
- จำนวนเงินใช้ format `฿#,###`
- ค่าบวกใช้สี/สัญลักษณ์บวกได้ เช่น `+฿25,000`
- ค่าลบใช้สี/สัญลักษณ์ลบได้ เช่น `-฿25,000`
- ต้องไม่ใช้สีเพียงอย่างเดียวในการสื่อสาร gain/loss

## Sold Exclusion Rule

- Sold Asset ไม่ถูกนับใน Total Asset Value
- Sold Asset เก็บใน Sold History
- Sold Asset ยังเห็นใน Owner Profile และ Sold History ตาม master

## Sold History Rule

Sold History ต้องเก็บ:

- Sale Date
- Buyer
- Contact
- Sale Price
- Payment Method
- Attachment

## Private Data Rule

ข้อมูลต่อไปนี้เป็น private และเห็นเฉพาะ Owner หรือ Admin ตามสิทธิ์:

- Purchase Price
- Purchase Date
- Purchase From
- Proof of Payment
- Sold History
- Portfolio Value Detail

## Public Profile Rule

- Public Profile เห็นเฉพาะ Asset สถานะ Sale และ Show
- Public Profile ต้องไม่แสดง Portfolio, Sold History, Purchase data หรือ Portfolio Value Detail

## Owner Deleted และซ่อนถาวร Rule

- Owner Deleted Asset ไม่ถูกนำมาคำนวณ Portfolio
- Asset ที่ถูก Back Office ซ่อนถาวรไม่ถูกนำมาคำนวณ Portfolio
- Owner Deleted และซ่อนถาวรต้องหายจาก public surfaces
- Asset ที่ถูก Back Office ซ่อนถาวรยังอาจแสดงให้ Owner เห็นแบบ read-only ใน owner detail แต่ต้องไม่แสดงใน Portfolio Asset List

## Analytics Rule

- Total Asset Value, Unrealized Gain/Loss, Realized Gain/Loss, Expected Profit, Market Comparison, Holding Period, Top Brand Holdings และ YTD Performance วิธี A เป็น V1 baseline ตามสูตรในเอกสารนี้
- Benchmark, allocation chart, brand performance trend, asset appreciation forecast, cash-flow adjusted return และ IRR เป็น future
- หาก Figma แสดง analytics future เหล่านี้ ต้อง annotate เป็น future

---

# 11. Permission Rules

| Actor | Permission |
| --- | --- |
| Guest | เข้า Portfolio ไม่ได้ |
| Owner | เห็น Portfolio และ Sold History ของตัวเองได้ |
| Other User | เข้า Portfolio ของคนอื่นไม่ได้ |
| Admin | เห็นตาม Back Office permission ไม่ใช่ Front Office Portfolio |

---

# 12. Validation Rules

Portfolio Module ไม่มี user input form หลักใน V1

| Condition | Rule |
| --- | --- |
| Portfolio calculation | ใช้เฉพาะ Sale, Show, Hide |
| Current Value | ต้องเลือก source ตามลำดับ Watch Price API -> Owner Estimated Value -> Purchase Price fallback -> No Valuation |
| Total Asset Value | ต้องไม่รวม Sold, Owner Deleted, ซ่อนถาวร หรือ No Valuation |
| Gain/Loss | คำนวณเฉพาะ Asset ที่มี Current Value จาก market/owner estimate และมี Purchase Price |
| Sold History fields | ต้องแสดงตาม field ที่ master กำหนด |
| Permission | ต้องตรวจสิทธิ์ Owner ทุกครั้ง |
| Private data | ต้องไม่ส่ง/แสดงให้ Public Viewer |

---

# 13. Exception Handling

## Permission Denied

- TH: `คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้`
- EN: `Permission denied.`

## Portfolio Empty

- TH: `ไม่พบข้อมูล`
- EN: `No data found`

## Sold History Empty

- TH: `ไม่พบข้อมูล`
- EN: `No data found`

## Load Failed

- TH: `ไม่สามารถโหลดข้อมูลได้`
- EN: `Unable to load data.`
- Action: แสดงปุ่ม `ลองใหม่`

## Watch Price API Unavailable

- Portfolio ยังต้องโหลดได้
- Asset ที่มี Owner Estimated Value ให้ใช้ Owner Estimated Value
- Asset ที่ไม่มี Owner Estimated Value แต่มี Purchase Price ให้ใช้ Purchase Price fallback
- Asset ที่ไม่มีข้อมูลราคาใด ๆ ให้แสดง Current Value เป็น `—` และ label `ไม่มีราคาตลาด`
- แสดง banner หรือ note: `ราคาตลาดบางรายการไม่พร้อมใช้งาน` / `Some market prices are unavailable`

## No Market Price For Asset

- แสดง Current Value เป็น `—` หากไม่มี owner estimate หรือ purchase price
- แสดง label `ไม่มีราคาตลาด`
- Asset ยังอยู่ใน Portfolio Asset List
- Asset ไม่ถูกรวมใน Total Asset Value และ Gain/Loss

---

# 14. Empty State

ใช้ข้อความกลางตาม master:

| State | TH | EN |
| --- | --- | --- |
| No Portfolio Asset | `ไม่พบข้อมูล` | `No data found` |
| No Sold History | `ไม่พบข้อมูล` | `No data found` |
| No Market Price | `ไม่มีราคาตลาด` | `No market price` |
| Gain/Loss Unavailable | `ยังคำนวณกำไรไม่ได้` | `Gain/Loss unavailable` |

---

# 15. Notification Rules

Portfolio Module ไม่สร้าง notification ใน master baseline

Market movement, benchmark, valuation alert หรือ portfolio summary notification เป็น future / Needs Decision

---

# 16. Analytics Events

- `portfolio_opened`
- `portfolio_asset_list_opened`
- `portfolio_asset_opened`
- `portfolio_value_source_viewed`
- `portfolio_market_price_unavailable`
- `sold_history_opened`
- `sold_history_detail_opened`
- `portfolio_permission_denied`

---

# 17. Acceptance Criteria

## AC-PORT-001: Portfolio Is Private

Given Portfolio เป็นข้อมูลของ Owner  
When user อื่นหรือ Guest พยายามเปิด Portfolio  
Then ระบบต้องไม่อนุญาตให้เข้าถึง

## AC-PORT-002: Owner Opens Portfolio From Total Asset Value

Given Owner อยู่ที่ Owner Profile  
When Owner กด Total Asset Value  
Then ระบบต้องเปิด Portfolio Dashboard

## AC-PORT-003: Public Profile Has No Portfolio Entry

Given Viewer เปิด Public Profile ของ user อื่น  
When Public Profile แสดงข้อมูล  
Then ต้องไม่แสดง Portfolio entry หรือ Portfolio Value Detail

## AC-PORT-004: Portfolio Includes Sale Show Hide

Given Owner มี Asset สถานะ Sale, Show และ Hide  
When ระบบคำนวณ Portfolio  
Then Asset ทั้งสามสถานะต้องถูกนำมาคำนวณ

## AC-PORT-005: Portfolio Excludes Sold

Given Owner มี Asset สถานะ Sold  
When ระบบคำนวณ Portfolio  
Then Sold Asset ต้องไม่ถูกนับใน Total Asset Value

## AC-PORT-006: Sold History Is Separate

Given Owner มี Sold Asset  
When Owner เปิด Sold History  
Then Sold Asset ต้องแสดงใน Sold History  
And ต้องไม่ถูกรวมใน Portfolio Value

## AC-PORT-007: Sold History Fields

Given Owner เปิด Sold History detail  
When ข้อมูลขายแสดง  
Then ต้องมี Sale Date, Buyer, Contact, Sale Price, Payment Method และ Attachment

## AC-PORT-008: Private Data Hidden From Viewer

Given Viewer เปิด Public Profile หรือ Public Asset Detail  
When ข้อมูลแสดง  
Then ต้องไม่แสดง Purchase Price, Purchase Date, Purchase From, Proof of Payment, Sold History หรือ Portfolio Value Detail

## AC-PORT-009: Owner Deleted And Permanently Hidden Excluded

Given Asset เป็น Owner Deleted หรือถูก Back Office ซ่อนถาวร  
When ระบบคำนวณ Portfolio  
Then Asset นั้นต้องไม่ถูกนำมาคำนวณ

## AC-PORT-010: Total Asset Value Formula

Given Owner มี Eligible Asset สถานะ Sale, Show และ Hide  
When ระบบคำนวณ Total Asset Value  
Then Total Asset Value ต้องเท่ากับผลรวม Current Value ของ Eligible Asset ที่มี Current Value  
And ต้องไม่รวม Sold, Owner Deleted, ซ่อนถาวร หรือ No Valuation

## AC-PORT-011: Current Value Source Priority

Given Asset มีข้อมูลราคาหลายแหล่ง  
When ระบบเลือก Current Value  
Then ต้องใช้ลำดับ Watch Price API Market Price, Owner Estimated Value, Purchase Price fallback, No Valuation

## AC-PORT-012: No Market Price Fallback

Given Asset ไม่มี Watch Price API market price  
When Asset มี Owner Estimated Value  
Then ระบบต้องใช้ Owner Estimated Value  
When Asset ไม่มี Owner Estimated Value แต่มี Purchase Price  
Then ระบบต้องใช้ Purchase Price fallback และแสดง label ว่าใช้ราคาซื้อเป็นค่าประมาณ  
When Asset ไม่มีข้อมูลราคาใด ๆ  
Then Current Value ต้องแสดง `—` และไม่รวมใน Total Asset Value

## AC-PORT-013: Unrealized Gain Loss Formula

Given Asset มี Current Value จาก Watch Price API หรือ Owner Estimated Value และมี Purchase Price  
When ระบบคำนวณ Gain/Loss  
Then Unrealized Gain/Loss ต้องเท่ากับ Current Value - Purchase Price  
And Unrealized Gain/Loss % ต้องเท่ากับ Unrealized Gain/Loss / Purchase Price * 100

## AC-PORT-014: Gain Loss Unavailable

Given Asset ใช้ Purchase Price fallback หรือไม่มี Purchase Price  
When ระบบแสดง Gain/Loss  
Then Gain/Loss ต้องแสดง `—`  
And Asset นั้นต้องไม่ถูกรวมใน Total Unrealized Gain/Loss

## AC-PORT-015: Watch Price API Unavailable

Given Watch Price API unavailable  
When Owner เปิด Portfolio  
Then Portfolio ยังต้องโหลดได้  
And ใช้ Owner Estimated Value หรือ Purchase Price fallback ตามลำดับ  
And แสดง note ว่าราคาตลาดบางรายการไม่พร้อมใช้งาน

## AC-PORT-016: Empty Portfolio

Given Owner ไม่มี Asset ที่ถูกนำมาคำนวณ Portfolio  
When Owner เปิด Portfolio  
Then ระบบต้องแสดง `ไม่พบข้อมูล` / `No data found`

## AC-PORT-017: Expected Profit Formula

Given Owner เปิด Portfolio หรือ Owner Asset Detail ของ Asset ที่มี Asking Price และ Purchase Price  
When ระบบคำนวณ Expected Profit  
Then Expected Profit ต้องเท่ากับ Asking Price - Purchase Price  
And Expected Profit % ต้องเท่ากับ Expected Profit / Purchase Price * 100  
And ต้องแสดงเฉพาะ Owner view

## AC-PORT-018: Expected Profit Unavailable

Given Asset ไม่มี Asking Price หรือไม่มี Purchase Price  
When ระบบแสดง Expected Profit  
Then Expected Profit ต้องแสดง `—`

## AC-PORT-019: Market Comparison Formula

Given Asset มี Asking Price และ Watch Price API Market Price  
When ระบบคำนวณ Market Comparison  
Then Market Comparison % ต้องเท่ากับ (Asking Price - Market Price) / Market Price * 100  
And หากมากกว่า 1% ต้องแสดง `Above Market`  
And หากอยู่ระหว่าง -1% ถึง +1% ต้องแสดง `At Market`  
And หากน้อยกว่า -1% ต้องแสดง `Below Market`

## AC-PORT-020: Market Comparison Unavailable

Given Asset ไม่มี Watch Price API Market Price  
When ระบบแสดง Market Comparison  
Then ต้องแสดง `ไม่มีราคาตลาด` / `No market price`  
And ต้องไม่ใช้ Owner Estimated Value หรือ Purchase Price fallback เพื่อแสดง Above/At/Below

## AC-PORT-021: Realized Gain Loss Formula

Given Sold Asset มี Sale Price และ Purchase Price  
When Owner เปิด Sold History  
Then Realized Gain/Loss ต้องเท่ากับ Sale Price - Purchase Price  
And Realized Gain % ต้องเท่ากับ Realized Gain/Loss / Purchase Price * 100  
And Sold Asset ต้องไม่ถูกรวมใน Total Asset Value หรือ Total Unrealized Gain/Loss

## AC-PORT-022: Holding Period Formula

Given Asset มี Purchase Date  
When Asset ยังไม่ขาย  
Then Holding Period ต้องเท่ากับ Today - Purchase Date  
When Asset เป็น Sold และมี Sale Date  
Then Holding Period ต้องเท่ากับ Sale Date - Purchase Date

## AC-PORT-023: Top Brand Holdings

Given Owner มี Eligible Asset หลาย brand  
When ระบบแสดง Top Brand Holdings  
Then ต้องแสดง Top 3 brand จากจำนวน Asset สถานะ Sale, Show, Hide  
And ต้องไม่รวม Sold, Owner Deleted หรือ Asset ที่ถูก Back Office ซ่อนถาวร

## AC-PORT-024: YTD Performance Formula

Given มี Portfolio Value Today และ Portfolio Value Start Of Year  
When ระบบคำนวณ YTD Performance  
Then YTD Performance ต้องเท่ากับ (Portfolio Value Today - Portfolio Value Start Of Year) / Portfolio Value Start Of Year * 100  
And ไม่รวม Realized Gain/Loss จาก Sold Asset ในสูตรหลัก

## AC-PORT-025: YTD Performance Unavailable

Given ไม่มี snapshot ในปีนั้น หรือ Portfolio Value Start Of Year <= 0  
When ระบบแสดง YTD Performance  
Then ต้องแสดง `—`  
When ไม่มี snapshot วันที่ 1 มกราคมแต่มี snapshot แรกของปี  
Then ต้องใช้ snapshot แรกของปีและแสดง label `YTD จากข้อมูลแรกของปี` / `YTD from first available data`

---

# 18. Related Modules

- Profile Module
- Asset Management Module
- Asset Detail Module
- Trust & Safety Module
- Back Office / Admin Permission

---

# 19. Future Enhancement

- Portfolio Benchmark
- Portfolio Allocation Chart
- Brand Performance Trend
- Asset Appreciation Forecast
- Realized + Unrealized Blended Performance
- Cash-flow Adjusted Return / IRR
- Benchmark Comparison
- Portfolio Export PDF
- Portfolio Export Excel
