# Watch Alert BO Prototype Blueprint

> Blueprint สำหรับสร้าง prototype Market Demand & Watch Alert BO Module (4 หน้าจอ)
> อ้างอิง: `BackOffice/11_WATCH_ALERT_MODULE.md`, `FrontOffice/10_WATCH_ALERT_MODULE.md`, `FrontOffice/03_SEARCH_FILTER_MODULE.md`, `.agents/skills/bo-screen-design/SKILL.md`
> ทิศทางที่ confirm กับ user: **read-only overview ไม่มี admin action** (ไม่มี disable/enable/bulk action)
> สร้างใน task: WA-PLAN-001

---

## 1. Screen List สุดท้าย (4 หน้า)

| # | Screen | ประเภท | Source Pattern | บทบาท |
|---|--------|--------|----------------|-------|
| 1 | Demand Overview | Dashboard-like | Dashboard (KPI cards + sections) | ภาพรวมความต้องการตลาดจาก Search/Filter และ Watch Alert |
| 2 | Search Insights | Analytics read-only | Reports / Analytics | ภาพรวม keyword และ filter ที่ผู้ใช้เลือกบ่อย รวมถึง no-result search |
| 3 | Watch Alert List | List-only (read-only) | User List / Offer List (read-only) | รายการ alert ทั้งหมด รวมที่ user ลบแล้ว |
| 4 | Alert Detail | Read-only detail + history | Offer Detail (read-only) | รายละเอียด alert + ประวัติ user action |

**เมนูนำทาง:** Market Demand (parent) > subs: Demand Overview, Search Insights, Watch Alert List
- Alert Detail เข้าจาก Watch Alert List (drill-in) ไม่มี sub menu ตรง
- Search Insights และ Demand Overview เป็น read-only analytics view
- ไม่มี "Disabled Alerts" sub menu เดิม (รวมเข้า Alert List ผ่าน filter Status)

**กฎ read-only (ทิศใหม่):**
- ไม่มี admin action ใด ๆ (ไม่มี disable/enable/bulk/export)
- ไม่มี confirmation modal สำหรับ admin action
- ไม่มี reason input สำหรับ admin action
- ไม่มี audit log สำหรับ admin action (เพราะไม่มี admin action)
- มีเฉพาะ read-only drill-in links ไป User Management / Asset Management

---

## 2. Screen 1: Demand Overview

### Header
- **Breadcrumb:** งานตรวจสอบและบริการ / Market Demand / Demand Overview
- **Page title:** Demand Overview
- **Page meta:** Last updated (freshness timestamp)
- **Page action:** ไม่มี (read-only)

### KPI Cards (4 cards, desktop responsive grid)

| Card | Value | Detail |
|------|-------|--------|
| Active Alerts | 298 | ใช้งานได้และเปิดแจ้งเตือน |
| Alerts with Matches | 262 | มี Assets ตรงตามเงื่อนไข |
| Unmet Demand | 36 | ยังไม่มี Assets ตรงตามเงื่อนไข |
| Notification Success Rate | 94.2% | % การส่งสำเร็จ (7 วันล่าสุด) |

Search Volume และ No-result Searches แสดงใน Search Insights ไม่ใช่ Demand Overview

### Main Content Sections

#### 2.1 Top Brands (with drill-down)
แสดง top 5 brands ที่ user ตั้ง alert บ่อย เป็น bar list พร้อมจำนวน alert และสัดส่วน:
- กดแถบ brand เพื่อ drill-down ไปดู models ของแบรนด์นั้น (modal)
- กด model ใน drill-down เพื่อดู references ของรุ่นนั้น (modal สลับ content ใน modal เดิม พร้อม breadcrumb)
- มี "View All" link เปิดไป Watch Alert List
- ไม่มี Top Models / Top References / Top Dial Colors เป็น standalone panels (ข้อมูลเหล่านี้อยู่ใน drill-down ของ Top Brands)

#### 2.2 Price Range
แสดงการกระจายช่วงราคาที่ user สนใจ:
- ช่วง: <50k, 50k-100k, 100k-300k, 300k-500k, 500k-1M, >1M
- ชื่อการ์ด: "Price Range (จำนวนรายการทั้งหมด)" — แสดง total รวมทุกช่วงในวงเล็บ (ไม่มีคำว่า "รายการ")
- Format: vertical bar chart (histogram) พร้อมแกน Y (nice-number scale, ชื่อแกน "จำนวนรายการ" อยู่ด้านบนเส้นแกน Y) + แกน X (ชื่อแกน "ช่วงราคา (บาท)"), กราฟเต็มพื้นที่การ์ด, แท่งตามลำดับช่วงราคา, ตัวเลขจำนวนแสดงบนหัวแท่ง, label ช่วงราคาอยู่ใต้แกน X

#### 2.3 Trigger Trend (12 เดือนล่าสุด)
- grouped bar chart รายเดือน แสดงจำนวน trigger ย้อนหลัง 12 เดือน (2 ซีรีส์ต่อเดือน: สำเร็จ/ข้าม)
- แยกสี: successful trigger (เขียว) vs skipped (เทา — ปิด alert/ปิดแจ้งเตือน/ลบแล้ว หรือ asset ไม่แสดง)
- แกน X: เดือน (ชื่อเดือนย่อ + ปี 2 หลัก), แกน Y: จำนวนการแจ้งเตือน (ครั้ง) พร้อม nice-number scale + gridlines แบบเส้นประ
- legend 2 รายการ พร้อมคำอธิบาย; tooltip ต่อคอลัมน์ (เดือน • สำเร็จ X • ข้าม Y)

#### 2.4 Frequently Triggered Alerts (top 10)
- Alert ที่ trigger บ่อยสุด
- แสดงเป็น mini table 6 คอลัมน์: # (ลำดับ 1-10), Alert ID, Name, Owner, Triggers, Last Triggered
- ใช้สไตล์เดียวกับตารางมาตรฐาน (Option Group): header bg #f1f5fb, data 12px/400/#516683, Name เป็น primary (700/#061426)
- ทุกคอลัมน์ชิดซ้าย
- Mobile (≤760px): ซ่อนคอลัมน์ # แสดงเป็น stacked card พร้อม label
- Row click → Alert List (read-only drill-in; Alert Detail จะต่อใน WA-PTO-003)

---

## 3. Screen 2: Search Insights (Read-only)

### Header
- **Breadcrumb:** งานตรวจสอบและบริการ / Market Demand / Search Insights
- **Page title:** Search Insights
- **Subtitle:** คำค้นหาและตัวกรองที่ผู้ใช้เลือกบ่อยแบบ aggregate — read-only
- **Page action:** ไม่มี (read-only)

### Main Sections
- Popular Keywords: keyword ที่ถูก submit บ่อยตามช่วงเวลาที่เลือก
- Popular Filters by Dimension: Brand, Model, Reference และ filter option ที่ถูกเลือกบ่อย
- Popular Filter Combinations: เงื่อนไขที่ถูกใช้ร่วมกันบ่อย หากมีข้อมูลเพียงพอ
- No-result Searches: คำค้นหาหรือเงื่อนไขที่ไม่พบผลลัพธ์ แยกจาก Unmet Watch Alert
- Search/Filter Trend: แนวโน้มตามช่วงเวลา
- Search Funnel: Search Submit → Result Click → Asset Detail Open → Watch Alert/Offer พร้อมจำนวนและเปอร์เซ็นต์เทียบกับ Search Submit

### Search Funnel Visual Standard
- แสดงเป็นรายการแนวตั้งใน card เดียว โดยใช้ composition เดียวกับ Asset Status
- แต่ละแถวแสดง Step, ชื่อขั้น, จำนวนเหตุการณ์ชิดขวา และเปอร์เซ็นต์เทียบกับ Search Submit
- ใช้กรอบอ่อนและแถบสีด้านซ้ายเป็น visual accent ของแต่ละขั้น ไม่ใช่ status ของข้อมูล
- ไม่ใช้ progress bar ซ้อนในแต่ละแถว
- ต้องแสดงข้อมูลครบและไม่เกิด overflow ที่ 390px, 768px, 1280px และ 1440px

### Rules
- แสดงเฉพาะข้อมูล aggregate ไม่แสดง search history ของ user รายบุคคล
- Popular Filter ใช้ช่วยวิเคราะห์และเป็นแหล่งข้อมูลของ quick-selection tags ใน FO
- ต้องแสดงช่วงเวลาและฐานการนับให้ชัดเจน
- Search Insights ไม่ใช่ยอดขาย จำนวน Asset หรือจำนวน Watch Alert โดยตรง

---

## 4. Screen 3: Alert List (Read-only)

### Header
- **Breadcrumb:** งานตรวจสอบและบริการ / Market Demand / Watch Alert List
- **Page title:** Watch Alert List
- **Subtitle:** (ไม่มี subtitle ใน prototype)
- **Page action:** ไม่มี (read-only)

### Filters (ไม่มี search — filter bar อย่างเดียว)
| Filter | Options |
|--------|---------|
| Status | ทุกสถานะ, Active, User Disabled, Deleted |
| Notification | ทุกการแจ้งเตือน, เปิดแจ้งเตือน, ปิดแจ้งเตือน |
| Trigger history | ทุกประวัติ trigger, เคย trigger, ไม่เคย trigger |
| Match status | ทุกสถานะ match, ไม่มี match (unmet), มี match |
| Last Triggered | date range (from — to) |

### Sort
- อัปเดตล่าสุดก่อน (default), อัปเดตเก่าสุดก่อน, trigger มากสุดก่อน, trigger ล่าสุดก่อน, ชื่อ A-Z

### Table Columns (Desktop)

| # | Column | ประเภท | หมายเหตุ |
|---|--------|--------|----------|
| 1 | Alert ID | primary identity | WAL-XXXX |
| 2 | Alert Name | text | |
| 3 | Owner | text + link | User ID + display name, link → User Management detail |
| 4 | Criteria Summary | structured chips | brand, model, price range, condition (top 3-4 chips) |
| 5 | Status | badge | Active=เขียว, User Disabled=เทา, Deleted=charcoal |
| 6 | Notification | badge | On=เขียว, Off=เทา |
| 7 | Matches | count | current matched Sale assets |
| 8 | Triggers | count | total trigger count |
| 9 | Last Triggered | date | ถ้าไม่เคย trigger แสดง "—" |
| 10 | Updated | date | last updated timestamp |

Inactive market data warning แสดงเป็น info icon ใน Criteria column (ไม่ใช่ column แยก)

### Mobile Card (≤760px)
- Title: Alert ID + Alert Name
- Status badge + Notification badge
- Criteria chips (top 3-4)
- Owner (display name)
- Matches / Triggers / Last Triggered / Updated (labeled metadata)

### Row Behavior
- Row click → Alert Detail (drill-in)
- ไม่มี action menu (read-only)

### Empty State
- ไม่มี alert: "ไม่พบข้อมูล"
- filter ไม่พบ: "ไม่พบข้อมูล" + คง reset

---

## 5. Screen 4: Alert Detail (Read-only)

### Header
- **Breadcrumb:** งานตรวจสอบและบริการ / Market Demand / Watch Alert List / WAL-XXXX
- **Page title:** <Alert Name>
- **Page meta:** Alert ID, status badge, owner, created/updated
- **Back button:** Back to Alert List

### Header Section
- Alert ID (WAL-XXXX)
- Alert Name
- Status badge (Active / User Disabled / Deleted)
- Owner: User ID + display name (link → User Management detail, read-only drill-in)
- Created date, Updated date
- Notification enabled badge (On/Off)
- Market data dependency warning (ถ้า criteria อ้าง inactive data)

### Section 1: Criteria Snapshot
- แสดง criteria ปัจจุบันเป็น structured tiles/chips (ไม่ใช่ JSON)
- Fields ที่แสดง (ถ้ามีค่า):
  - Brand, Model, Reference, Price Range (min-max THB), Condition, Case Size, Dial Color
- แต่ละ field ที่มีค่าแสดงเป็น tile พร้อม label + value (chips สำหรับ multi-value fields เช่น Condition/Case Size/Dial Color)
- ถ้า field ไม่มีค่า ไม่แสดง tile นั้น
- ถ้า field อ้าง inactive market data → warning badge ข้าง field นั้น
- Empty state: "ไม่มี criteria" (กรณี alert ที่ criteria ว่าง)

### Section 2: Current Matches
- จำนวน matched Sale assets (current)
- Table columns: Asset ID, Asset Name, Price, Condition, Case Size, Dial Color, Listed At, Asset Status
- Asset ID เป็น link → Asset Management detail (read-only drill-in)
- Pagination ถ้าเกินจำนวนที่กำหนด
- Empty state: "ไม่มี match ในขณะนี้" (unmet demand)

### Section 3: Trigger & Notification History
- Table columns: Trigger ID, Triggered At, Matches (new · total), Delivery Status
- Delivery Status แสดงเป็น badge (สำเร็จ/ล้มเหลว/ข้าม)
- เรียงจากใหม่ไปเก่า
- Pagination ถ้าเกินจำนวนที่กำหนด
- Empty state: "ยังไม่มีประวัติการ trigger"
- Soft delete notice: รายการ trigger ของ alert ที่ถูกลบ (Deleted) ยังคงเก็บไว้ตาม retention rule

### Section 4: Notification Delivery Trace
- Table: Notification ID, Recipient, Trigger ID, Destination (Watch Alert Result List), Delivery Status, Sent Timestamp, Opened Timestamp, Failure Reason
- เรียงจากใหม่ไปเก่า
- Empty state: "ยังไม่มีประวัติการส่งแจ้งเตือน"

### Section 5: User Action History
- Table columns: Timestamp, Actor, Action, Changes, Note
- Action ครอบคลุม: Created / Edited / Renamed / Notification Toggled / Deleted
- เรียงจากใหม่ไปเก่า
- แสดงเฉพาะ user-driven actions (ไม่มี admin action ในทิศใหม่)
- Empty state: "ยังไม่มีประวัติการกระทำของ user"

### Section 6: Exclusion Context (ถ้ามี)
- แสดง block/visibility exclusions ที่ส่งผลต่อ result
- เช่น matched asset ที่ถูก exclude เพราะ block relation, inactive market data, visibility rule
- Empty/hidden ถ้าไม่มี exclusion

---

## 6. Mock Data Structure

### 6.1 Alert Record (หน่วยข้อมูลหลัก)

```javascript
{
  id: "WAL-1440",
  name: "Rolex Submariner <= 320k",
  owner: { id: "U-1042", displayName: "Nattapol P." },
  status: "Active",           // Active | User Disabled | Deleted
  notificationEnabled: true,
  criteria: {
    keyword: "",
    brand: "Rolex",
    model: "Submariner",
    reference: "",
    priceMin: 0,
    priceMax: 320000,
    yearMin: null,
    yearMax: null,
    deliveryContents: [],
    condition: [],
    caseSize: [],
    movement: "",
    dialColor: [],
    strapBracelet: ""
  },
  marketDataInactive: false,  // มี criteria อ้าง inactive brand/model/ref ไหม
  inactiveFields: [],         // ["model"] ถ้า model inactive
  matchCount: 8,
  triggerCount: 12,
  lastTriggered: "2026-08-25T14:30:00+07:00",
  created: "2026-06-15T09:00:00+07:00",
  updated: "2026-08-20T10:00:00+07:00"
}
```

### 6.2 Trigger Record

```javascript
{
  id: "TRG-20260825-001",
  alertId: "WAL-1440",
  matchedAssetId: "AST-8831",
  assetStatusAtTrigger: "Sale",
  criteriaSnapshotVersion: 3,   // อ้าง snapshot ของ criteria ตอน trigger
  matchTimestamp: "2026-08-25T14:30:00+07:00",
  notificationEventId: "NTF-9920",
  deliveryStatus: "Delivered",  // Delivered | Failed | Pending | Skipped
  exclusionReason: null         // null | "Block relation" | "Inactive market data" | "Visibility" | "Notification disabled"
}
```

### 6.3 Notification Delivery Record

```javascript
{
  id: "NTF-9920",
  type: "Watch Alert",
  recipient: { id: "U-1042", displayName: "Nattapol P." },
  alertId: "WAL-1440",
  triggerId: "TRG-20260825-001",
  destination: "Watch Alert Result List",
  deliveryStatus: "Delivered",  // Delivered | Failed | Pending
  sentTimestamp: "2026-08-25T14:30:05+07:00",
  openedTimestamp: "2026-08-25T14:32:10+07:00",
  failureReason: null
}
```

### 6.4 User Action Record

```javascript
{
  id: "ACT-001",
  alertId: "WAL-1440",
  actionType: "Created",        // Created | Edited | Renamed | Notification Toggled | Deleted
  timestamp: "2026-06-15T09:00:00+07:00",
  actor: { id: "U-1042", displayName: "Nattapol P." },
  details: "สร้าง alert จาก Search Filter (Rolex Submariner, price <= 320k)",
  snapshot: null                // before/after snapshot สำหรับ Edited/Renamed
}
```

### 6.5 Mock Data Coverage (ตัวอย่าง alerts ที่ต้องมี)

| Alert ID | Name | Status | Notification | Matches | Triggers | Market Data | วัตถุประสงค์ mock |
|----------|------|--------|--------------|---------|----------|-------------|-------------------|
| WAL-1440 | Rolex Submariner <= 320k | Active | On | 8 | 12 | Active | alert ปกติ มี match + trigger |
| WAL-1228 | Omega Speedmaster Bangkok | Active | On | 3 | 45 | Active | trigger บ่อย (frequent trigger) |
| WAL-1199 | Inactive model alert | User Disabled | Off | 0 | 0 | Inactive (model) | inactive market data + no match |
| WAL-1180 | Seiko 6139 vintage | Active | On | 0 | 0 | Active | unmet demand (ไม่มี match) |
| WAL-1150 | Patek Calatrava 5227 | Active | On | 1 | 2 | Active | match น้อย ราคาสูง |
| WAL-1100 | Tudor Black Bay 58 | Active | On | 5 | 8 | Active | ปกติ |
| WAL-1080 | Grand Seiko Snowflake | User Disabled | Off | 0 | 0 | Active | user disabled (read-only, ไม่มี action) |
| WAL-1050 | Old Rolex GMT alert | Active | On | 2 | 1 | Active | stale alert (เก่า + ไม่ trigger ล่าสุด) |
| WAL-1020 | Cartier Tank Must | Deleted | Off | 0 | 3 | Active | user ลบแล้ว (soft delete) |
| WAL-0990 | Vintage Seiko 6105 | Active | On | 4 | 6 | Active | ปกติ |
| WAL-0950 | IWC Pilot Mark XVIII | Active | Off | 2 | 4 | Active | notification off แต่ยัง active |
| WAL-0900 | AP Royal Oak 15500 | Active | On | 0 | 0 | Inactive (reference) | unmet + inactive ref |

### 6.6 Demand Overview Aggregation (คำนวณจาก mock alerts)

| Dimension | ค่าที่ใช้ mock |
|-----------|---------------|
| Active Alerts | 3,218 (mock total) |
| Alerts with Matches | 2,847 |
| Unmet Demand | 371 |
| Notification Success Rate | 94.2% |
| Top Brands | Rolex (1,420), Omega (680), Seiko (420), Tudor (280), Patek (180), Cartier (160), Grand Seiko (140), IWC (120) |
| Top Models | Submariner (380), Speedmaster (240), Datejust (220), GMT-Master II (180), Black Bay (160), Seamaster (140), Tank (120), Snowflake (100) |
| Top References | 16610 (85), 116610LN (72), 126610LV (68), 116500LN (55), 15500ST (48), 3824 (42), SPB143 (38), 6139 (35) |
| Top Dial Colors | Black (1,820), Blue (680), Green (320), White (280), Silver (220), Champagne (180) |
| Price Ranges | <50k: 420, 50k-100k: 680, 100k-300k: 1,240, 300k-500k: 580, 500k-1M: 220, >1M: 78 |
| Frequently Triggered | WAL-1228 (45), WAL-1440 (12), WAL-1100 (8), WAL-0990 (6), WAL-0950 (4) |

---

## 7. การเปลี่ยนแปลงจาก Prototype เดิม

| จุด | เดิม | ใหม่ |
|-----|-----|-----|
| Parent menu | Watch Alert | Market Demand |
| เมนู subs | Alert Criteria, Trigger History, Disabled Alerts | Demand Overview, Search Insights, Watch Alert List |
| Screen count | 3 หน้า | 4 หน้า |
| Demand source | Watch Alert เป็นหลัก | Search/Filter behavior + Watch Alert criteria โดยแยก metric ชัดเจน |
| Panel title | Alert Criteria & Trigger History | เปลี่ยนตามหน้า |
| Page action | "Disable selected" | ไม่มี (read-only) |
| KPI cards | Active Alerts, Triggered Today, Disabled, Failed Delivery | Active Alerts, Alerts with Matches, Unmet Demand, Notification Success Rate |
| Admin action | มี disable | ไม่มี (read-only) |

---

## 8. ข้อกำหนดที่ต้องตรงตาม FO Rules

- Popular Filter tags ต้องมาจากข้อมูล aggregate และ user ยังเลือกจากรายการเต็มได้
- Search Insights ต้องแยกจาก Watch Alert Demand และไม่แสดงข้อมูลระบุตัว user
- Match เฉพาะ Asset สถานะ Sale (ไม่ match Show/Hide/Sold/Deleted)
- Notification destination = Watch Alert Result List (ไม่ใช่ Asset Detail)
- Criteria schema ใช้ร่วมกับ Search Filter (ทุก field optional)
- Block user impact: asset ของ blocked user ไม่อยู่ใน result (แสดงเป็น exclusion context)
- Lifecycle: Sale→Sold/Hide/Show หายจาก result; Hide/Show→Sale match ได้ใหม่
- Alert ที่ user ลบ (Deleted) ต้องหยุด notification ทันที (แสดงใน Alert List แต่ไม่ trigger ใหม่)

---

## 9. ขอบเขตที่ห้ามแก้ใน task ถัดไป

- ห้ามแก้ protected screens (Login, Dashboard, User/Asset/Content/Market/Offer/Option Master)
- ห้ามแก้ shared CSS/helper/route ที่กระทบ protected screens
- ห้ามเพิ่ม admin action ใด ๆ (disable/enable/bulk/export)
- ห้ามเปลี่ยน FO rules ที่ยืนยันแล้ว (match rule, destination, criteria schema)
- การปรับ FO spec ต้องจำกัดเฉพาะ Popular Filter/Popular Selection requirement ที่ได้รับการยืนยัน
