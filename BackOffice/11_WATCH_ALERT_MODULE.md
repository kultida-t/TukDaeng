# 11 BO Market Demand & Watch Alert Module

**Version:** `BO-11-v0.6`
**Date:** 2026-10-05
**Status:** สเปกปัจจุบัน
**Platform:** Responsive Web Back Office

## UI Standards And Prototype Reference

เอกสารนี้ต้องใช้ร่วมกับ `00_GLOBAL_RULES_MODULE.md` และยึดรูปแบบหน้าจอ/พฤติกรรมที่ยืนยันแล้วใน `../Prototypes/bo-prototype.html` เป็นมาตรฐานหลัก

เอกสารอ้างอิง: `../FrontOffice/10_WATCH_ALERT_MODULE.md`, `../FrontOffice/03_SEARCH_FILTER_MODULE.md`, `../FrontOffice/09_NOTIFICATION_MODULE.md`, `../FrontOffice/04_ASSET_MANAGEMENT_MODULE.md`, `../FrontOffice/15_TRUST_SAFETY_MODULE.md`

## 1. Document Information

| Field | Detail |
| --- | --- |
| Module Name | BO Market Demand & Watch Alert |
| Platform | Responsive Web Back Office |
| Version | `BO-11-v0.6` |
| Status | สเปกปัจจุบัน |
| Owner | Product / UX / Engineering / Operations |
| Document Type | Functional PRD |

## 2. Objective

BO Market Demand & Watch Alert Module คือพื้นที่สำหรับ Admin ใช้ดูภาพรวมความต้องการของตลาดจาก 2 แหล่งข้อมูลที่แยกกันชัดเจน:

- Search Insights: พฤติกรรมการค้นหาและการเลือก filter แบบ aggregate เช่น popular keyword, popular brand/model/option, popular filter combination และ no-result search
- Watch Alert Demand: criteria ที่ user บันทึกเป็น Watch Alert, สถานะ match/unmet demand, trigger และ notification history

โมดูลนี้ใช้เพื่อช่วยให้ทีม Product, Operations, Analytics และ Support เข้าใจความต้องการของผู้ใช้และความสัมพันธ์ระหว่าง demand กับ asset supply โดยไม่ซ้ำกับ Asset List ซึ่งเป็นมุมมองรายการ asset ฝั่ง supply

โมดูลนี้ไม่ใช่หน้าจอสร้าง alert แทน user และ Search Insights ต้องไม่เปิดเผยข้อมูลที่ระบุตัว user รายบุคคล

## 3. Scope

### In Scope

- Market Demand parent menu พร้อม Demand Overview, Search Insights และ Watch Alert List
- Demand Overview ที่รวม market demand จาก Search/Filter behavior และ Watch Alert criteria แบบ aggregate
- Search Insights สำหรับ popular keyword, popular filter selection, popular filter combination และ no-result search แบบ aggregate
- Popular Filter data definition และการเชื่อมโยงกับ quick-selection tags ใน FO
- Watch Alert list พร้อม filter, sort และ pagination (read-only)
- Watch Alert detail พร้อม owner, alert name, criteria, active/disabled state, notification toggle และ trigger history (read-only)
- Trigger history สำหรับ asset ที่ match criteria
- Notification delivery trace สำหรับ Watch Alert
- Criteria validation ว่าใช้ schema เดียวกันกับ Search Filter
- Match rule เฉพาะ asset status `Sale`
- Block/user visibility context ที่ส่งผลต่อ result
- Market data dependency เช่น brand/model/reference active/inactive
- Audit log สำหรับ sensitive reveal
- Responsive layout สำหรับ desktop, tablet และ mobile-width browser

### Out Of Scope

- Recent Search ส่วนตัวของ user
- Saved Search ในฐานะ feature แยกจาก Watch Alert
- Search History Sync
- AI Search Suggestion
- Admin สร้าง Watch Alert ใหม่แทน user ใน Phase 2 baseline
- Alert frequency setting, daily digest, weekly digest
- Market Price Alert, Watch Price Alert, Saved Search
- Notification template/retry management — Phase 2/future (เคยอยู่ใน Notification module; delivery status read-only ดูที่ Settings > Delivery Logs ใน Phase 1)
- เปิด Asset Detail โดยตรงจาก Watch Alert notification

## 4. FO Rules BO Must Follow

| Area | FO Rule | BO Requirement |
| --- | --- | --- |
| Entry point | Watch Alert สร้างจาก Search Filter เท่านั้น | BO ต้องเก็บ source criteria จาก Search Filter schema |
| Required field | ไม่มี required field | BO ต้องรองรับ alert ที่ criteria ว่างหรือชื่อว่างและมี generated name |
| Match rule | Match เฉพาะ asset `Sale` | BO trigger/history ต้องไม่ถือ Show/Hide/Sold/Deleted เป็น match |
| Destination | Notification เปิด Watch Alert Result List | BO delivery trace ต้องระบุ Result List ไม่ใช่ Asset Detail |
| Search alignment | ใช้ filter logic เดียวกับ Search | Criteria parser/validator ต้องใช้ schema เดียวกับ Search |
| Block impact | Asset ของ blocked user ไม่อยู่ใน result | BO ต้องแสดง block/visibility exclusion context |
| Delete alert | User delete แล้วหยุด notification ทันที | BO ต้องเห็น deleted/inactive state และหยุด trigger ใหม่ |

หาก legacy BO source ระบุว่า Watch Alert notification เปิด Asset Detail ให้ถือว่า outdated และให้ยึด FO rule คือ `Watch Alert Result List`

## 5. Admin Access And Permissions

ระบบใช้ Admin access เดียว โดยตรวจสิทธิ์ตามเมนูและ action ที่ทำ ไม่แยกประเภทบัญชี Admin ในสเปกนี้


| Access Area | Rule |
| --- | --- |
| Module access | Admin ที่มีสิทธิ์เข้าเมนูสามารถดู list, detail, filter, sort และ pagination ได้ |
| Write action | ไม่มี — Watch Alert BO เป็น read-only ทั้ง List และ Detail, Admin ไม่จัดการ alert ของ user ใด ๆ (ไม่ disable/enable/export/bulk) |
| Sensitive data | แสดงแบบ mask เป็นค่าเริ่มต้น เปิดเฉพาะกรณีมี business reason, อนุมัติตาม policy และบันทึก audit |
| Direct URL/API | ต้องตรวจสิทธิ์ที่ route, API และ service layer เสมอ ห้ามพึ่งพาการซ่อน UI เพียงอย่างเดียว |
## 6. Responsive Layout

| Width | Layout Requirement |
| --- | --- |
| Mobile-width browser | Alert table เปลี่ยนเป็น stacked cards, filter อยู่ใน drawer/bottom sheet |
| Tablet | List + detail drawer พร้อม criteria summary |
| Desktop | Full table, side filters, split detail panel, trigger history table |

Criteria ที่ยาวต้องแสดงแบบ structured chips/rows ไม่ใช่ JSON ดิบอย่างเดียว

## 6.1 Search Insights And Popular Filter

Search Insights เป็นข้อมูล aggregate จาก Search & Filter events ไม่ใช่รายการค้นหาส่วนตัวของ user โดยต้องรองรับข้อมูลอย่างน้อย:

- Keyword ที่ถูก submit บ่อย
- Brand, Model และ Reference ที่ถูกเลือกบ่อย
- Filter option ที่ถูกเลือกบ่อยแยกตามหมวด
- Filter combination ที่ถูกใช้บ่อย หากระบบรองรับการจัดอันดับแบบหลายเงื่อนไข
- Search/filter ที่ไม่พบผลลัพธ์
- Trend ของ search และ filter selection ตามช่วงเวลา

กฎสำคัญ:

- ต้องแยก Search volume, Filter selection volume และ Watch Alert count ออกจากกัน
- Popular Filter ที่ส่งกลับไปแสดงใน FO ต้องเป็น aggregate และไม่เปิดเผยตัวตนหรือประวัติส่วนตัวของ user
- Popular Filter เป็น quick-selection layer ไม่ตัด option อื่นออกจากรายการเต็ม และไม่เปลี่ยน Search/Filter logic
- Search Insights ต้องแสดงช่วงเวลาและเกณฑ์การจัดอันดับให้ชัดเจน เพื่อป้องกันการตีความว่าเป็นยอดขายหรือจำนวน Asset
- No-result search นับเป็นสัญญาณ demand ได้ แต่ต้องแยกจาก unmet demand ของ Watch Alert

### 6.1.1 Search Funnel Visual Standard

Search Funnel ในหน้า Search Insights แสดงเป็นการ์ดรายการแนวตั้ง โดยใช้ composition เดียวกับ Asset Status เพื่อให้ Admin สแกนลำดับและค่าของแต่ละขั้นได้เร็ว:

- แสดง 4 ขั้นตามลำดับ `Search Submit` → `Result Click` → `Asset Detail Open` → `Watch Alert / Offer`
- แต่ละแถวแสดง Step, ชื่อขั้น, จำนวนเหตุการณ์ และเปอร์เซ็นต์เมื่อเทียบกับ Search Submit
- ใช้กรอบอ่อนและแถบสีด้านซ้ายเพื่อแยกแต่ละขั้น โดยสีเป็น visual accent เท่านั้น ไม่ใช่สถานะของข้อมูล
- จำนวนเหตุการณ์ใช้ตัวเลขขนาดใหญ่ชิดขวา ส่วนชื่อและรายละเอียดอยู่ทางซ้าย
- ไม่ใช้ progress bar ซ้อนในแต่ละแถว เพื่อให้โครงสร้างสอดคล้องกับ Asset Status และลด visual noise
- สี KPI `No-result Searches` ใช้สีแดงเดียวกับเส้น No-result ใน Search Trend และรายการ No-result Searches เพื่อให้ metric เดียวกันมี visual semantic เดียวกัน
- สีของ Search Funnel ใช้เป็น visual accent แยกขั้น: น้ำเงิน, เขียว, อำพัน และม่วง ตามลำดับ ไม่ตีความเป็นสถานะของข้อมูล
- ต้องคงค่า conversion เดิมและแสดงข้อมูลครบใน desktop, tablet และ mobile-width

### 6.2 Demand Overview Top Criteria Visual Standard

Demand Overview ส่วน Top Criteria ใช้แสดงสัดส่วนของ Brand, Model และ Reference ที่ถูกตั้ง Watch Alert บ่อย โดยต้องใช้ visual rule เดียวกันทั้งการ์ดหลัก, View All modal และ drill-down ทุกระดับ:

- จุด indicator, progress bar และ percentage ใช้สีเดียวกัน `#2b6cb0` (informational blue)
- ใช้ความยาว progress bar และค่าตัวเลขเป็นตัวสื่ออันดับและสัดส่วนหลัก ไม่ใช้สีหลายสีเพื่อแบ่งลำดับรายการ
- ชื่อรายการและจำนวนใช้สีข้อความตามมาตรฐาน BO เพื่อคง contrast และ readability
- การคลิกจาก Top Brands ไป Top Models และ Top References ต้องคงสีหลักเดียวกันตลอด hierarchy
- สีหลายชุดไม่ควรถูกใช้กับ Top Criteria เว้นแต่มีความหมายเชิงสถานะหรือมี brand identity ที่กำหนดไว้อย่างเป็นทางการ
- View All และ drill-down ต้องแสดงข้อมูลและ visual hierarchy สอดคล้องกับการ์ด Top Criteria บนหน้า Demand Overview

คำจำกัดความ:

| ข้อมูล | แหล่งข้อมูล | ความหมาย |
| --- | --- | --- |
| Popular Search/Filter | Search keyword และ filter events | สิ่งที่ user สนใจหรือเลือกบ่อย แม้ยังไม่ได้สร้าง alert |
| Watch Alert Demand | Watch Alert criteria | ความต้องการที่ user บันทึกไว้เพื่อติดตาม |
| Unmet Search Demand | Search/filter ที่ไม่มีผลลัพธ์ | ความต้องการจากการค้นหาที่ supply ปัจจุบันยังไม่ตอบสนอง |
| Unmet Watch Alert | Active Watch Alert ที่ไม่มี current match | Alert ที่กำลังรอ asset ตรง criteria |
| Asset Supply | Asset Management / Asset List | จำนวน asset ที่มีและมองเห็นได้ตาม rule |

## 7. Watch Alert List

Watch Alert List เป็นหน้าจอ read-only สำหรับดูรายการ Watch Alert ทั้งหมด รวมที่ user ลบแล้ว (soft delete) ไม่มี admin action ใด ๆ ในหน้า List (ไม่มี disable/enable/bulk/export) การเข้าถึงรายละเอียดทำผ่าน row click เข้า Alert Detail เท่านั้น

### Header

- Breadcrumb: งานตรวจสอบและบริการ / Market Demand / Watch Alert List
- Page title: Watch Alert List
- Page action: ไม่มี (read-only)

### ข้อมูลขั้นต่ำที่แสดงต่อรายการ

- Alert ID
- Alert Name
- Owner (display name)
- Criteria Summary (structured summary + tooltip แสดง criteria ครบ)
- Status (Active / User Disabled / Deleted)
- Notification (On / Off)
- Matches (current matched Sale assets)
- Triggers (total trigger count)
- Last Triggered (ถ้าไม่เคย trigger แสดง "—")
- Updated

### Filters

Alert List ใช้ filter bar สำหรับคัดกรอง ไม่มี search box แยกต่างหากใน confirmed prototype

| Filter | Options |
| --- | --- |
| Status | ทุกสถานะ, Active, User Disabled, Deleted |
| Notification | ทุกการแจ้งเตือน, เปิดแจ้งเตือน, ปิดแจ้งเตือน |
| Trigger history | ทุกประวัติ trigger, เคย trigger, ไม่เคย trigger |
| Match status | ทุกสถานะ match, ไม่มี match (unmet), มี match |
| Last Triggered | date range (from - to) |

หมายเหตุ: Status filter ใน List แสดงเฉพาะสถานะที่ปรากฏใน read-only list คือ Active, User Disabled และ Deleted (soft delete) — Watch Alert BO เป็น read-only ไม่มี Admin Disabled state หรือ admin action ใด ๆ (ดู section 13)

### Sort

- อัปเดตล่าสุดก่อน (default)
- อัปเดตเก่าสุดก่อน
- trigger มากสุดก่อน
- trigger ล่าสุดก่อน
- ชื่อ A-Z

### Table Columns (Desktop)

| # | Column | ประเภท | หมายเหตุ |
| --- | --- | --- | --- |
| 1 | Alert ID | primary identity | WAL-XXXX |
| 2 | Alert Name | text | |
| 3 | Owner | text | display name |
| 4 | Criteria | structured summary | brand · model · reference · price · N conditions · N case sizes · N dial colors + tooltip แสดง criteria ครบ |
| 5 | Status | badge | Active=เขียว, User Disabled=เทา, Deleted=charcoal |
| 6 | Notification | badge | On=เขียว, Off=เทา |
| 7 | Matches | count | current matched Sale assets |
| 8 | Triggers | count | total trigger count |
| 9 | Last Triggered | date | ถ้าไม่เคย trigger แสดง "—" |
| 10 | Updated | date | |

### Mobile Card (≤760px)

- Title: Alert ID
- Status badge + Notification badge
- Metadata ที่ label: Alert Name, Owner, Matches, Triggers, Last Triggered, Updated

### Row Behavior

- Row click → Alert Detail (drill-in)
- ไม่มี action menu (read-only)
- ไม่มี admin action (disable/enable/bulk/export)

### Toolbar

- ปุ่มเปิด/ปิดตัวกรอง (toggle filter panel)
- ปุ่มรีเซ็ตค่าทั้งหมด (reset all filters)
- Filter state คงอยู่เมื่อ drill-in ไป Alert Detail แล้วกลับมา List

### Pagination

- 10 รายการต่อหน้า
- แสดงช่วงรายการ (แสดง X-Y จาก Z)

### Empty State

- ไม่มีข้อมูลตรงเงื่อนไข: "ไม่พบข้อมูลที่ตรงกับเงื่อนไข ลองรีเซ็ตตัวกรองแล้วลองใหม่"

## 7.1 Watch Alert Detail

Watch Alert Detail เป็นหน้าจอ read-only สำหรับดูรายละเอียดของ alert แต่ละรายการ เข้าผ่าน row click จาก Watch Alert List ไม่มี admin action ใด ๆ ในหน้า Detail (ไม่มี disable/enable/export) หน้าจอแสดงข้อมูล 6 sections ตามลำดับ โดย reuse โครงสร้าง detail page เดียวกับ Offer Detail และ report pages อื่น ๆ

### Header

- Breadcrumb: งานตรวจสอบและบริการ / Market Demand / Watch Alert List / {Alert ID}
- Page title: Alert Detail
- Page action: ปุ่มกลับไป Watch Alert List (back button)
- Panel title: Alert Name
- Panel subtitle: {Alert ID} — Alert Detail (read-only)

### Detail Head

แสดง head เหมือนหน้า detail อื่น ปรากฏเหนือ Section 1:

- `Alert ID : Alert Name` พร้อม Status badge (Active=เขียว, User Disabled=เทา, Deleted=charcoal) และ Notification badge (On=เขียว, Off=เทา)

### Section 1: Alert Summary

แสดง summary tiles 4 ช่อง:

- Created, Updated, Matches (current matched Sale assets), Triggers (total trigger count)

### Section 2: Owner Summary

แสดงข้อมูลเจ้าของ alert แบบ read-only:

- User ID
- Display Name
- Account Status (Active=เขียว, Suspended=แดง, Banned=charcoal, อื่น ๆ=เทา)

### Section 3: Criteria

แสดง criteria แบบ structured chips/rows ไม่ใช่ JSON ดิบ ใช้ grid 3 คอลัมน์:

- แต่ละ field ที่มีค่าแสดงเป็น tile พร้อม chip: Brand, Model, Reference, Price Range, Condition, Case Size, Dial Color
- Field ที่ไม่มีค่าไม่แสดง tile นั้น
- ถ้าไม่มี criteria ที่กำหนดเลย แสดง empty state "ไม่มี criteria ที่กำหนด"
- ถ้า criteria อ้างถึง market data ที่ inactive แสดง warning box ใต้ criteria: "Criteria อ้างถึง market data ที่ inactive: {fields} — alert จะไม่ match asset ใหม่จนกว่า market data จะกลับมา active"

### Section 4: Matched Assets

แสดงรายการ asset สถานะ Sale ที่ match criteria ปัจจุบัน:

- ตาราง 8 คอลัมน์: Asset ID, Asset Name, Price, Condition, Case Size, Dial Color, Listed At, Asset Status
- Asset ID เป็น link ไป Asset Management (drill-in ไป Asset Detail)
- Asset Status badge: Active=เขียว, Closed (Sold)=น้ำเงิน, Admin Hidden/Auto Hidden=amber, อื่น ๆ=เทา
- ถ้าไม่มี asset ที่ match แสดง empty row ในตาราง: "ยังไม่มี asset ที่ตรงตามเงื่อนไข" (หรือ "criteria อ้างถึง market data ที่ inactive" ถ้าเกี่ยวข้อง)
- Pagination 10 รายการต่อหน้า (แสดงช่วงรายการ + pager)

### Section 5: Trigger & Notification History

แสดงประวัติการตรวจจับและการแจ้งเตือน:

- ตาราง 4 คอลัมน์: Trigger ID, Triggered At, Matches (new · total), Delivery Status
- Delivery Status badge: Delivered=เขียว, Skipped=เทา, Failed=แดง, Pending=amber
- แสดงเฉพาะ trigger ที่มี new matches > 0 (trigger ที่เกิดการตรวจจับจริง)
- ถ้าไม่มีประวัติ แสดง empty row: "ยังไม่มีประวัติการตรวจจับ" (หรือ "criteria อ้างถึง market data ที่ inactive" ถ้าเกี่ยวข้อง)
- Pagination 10 รายการต่อหน้า

### Soft Delete Handling (Section 5)

- ถ้า alert ถูกลบโดย user (status = Deleted) แสดง notice box สีเหลืองเหนือตาราง Trigger & Notification History: "alert ถูกลบโดย user — ยกเลิกการตรวจจับและการแจ้งเตือน ไม่มี trigger ใหม่หลังจากวันที่ลบ"
- ประวัติ trigger/notification เดิมยังแสดงให้ดูได้
- ไม่มี trigger ใหม่หลังจากวันที่ลบ

### Section 6: User Action History

แสดงประวัติการกระทำของ user ที่เกี่ยวข้องกับ alert:

- ตาราง 5 คอลัมน์: Timestamp, Actor, Action, Changes, Note
- Action type แสดงเป็นภาษาไทย: สร้าง alert, แก้ไขเงื่อนไข, เปลี่ยนชื่อ alert, เปิด/ปิดการแจ้งเตือน, ลบ alert
- Changes แสดง before → after เมื่อมีการเปลี่ยนแปลง หรือ after value เมื่อไม่มี before
- ยังเห็น history แม้ alert ถูกลบ
- ถ้าไม่มีประวัติ แสดง empty row: "ไม่มีประวัติการกระทำของ user"
- Pagination 10 รายการต่อหน้า

### Responsive Layout

- Mobile-width browser (≤760px): ตารางใน Section 4-6 เปลี่ยนเป็น stacked cards (table-to-card) เหมือนหน้า detail อื่น
- Tablet และ Desktop: แสดงตารางเต็มพร้อม horizontal scroll เมื่อคอลัมน์เกินความกว้าง

## 8. Watch Alert Status Contract

| Status | Meaning | FO Required Behavior |
| --- | --- | --- |
| `Active` | Alert ยังใช้งานได้ | Trigger notification ได้ถ้า notification enabled และมี match |
| `User Disabled` | User ปิด notification หรือ disable เอง | เก็บ alert ไว้ แต่ไม่ส่ง notification ตาม toggle |
| `Deleted` | User ลบ alert | หายจาก Watch Alert List ของ user และหยุด notification ทันที |

BO ต้องเก็บ actor/source ของ status change แยกให้ชัด เช่น user action, system action

## 9. Criteria Schema

Watch Alert criteria ต้องใช้ schema เดียวกับ Search Filter:

- Keyword
- Brand
- Model
- Price range
- Year of production
- Reference number
- Delivery contents
- Condition
- Case size
- Movement
- Dial color
- Strap / bracelet

Rules:

- Criteria ทุก field เป็น optional
- Alert name เป็น optional
- ถ้าไม่มี alert name ให้ใช้ generated name จาก criteria หรือ default เช่น `Watch Alert`
- Brand -> Model dependency ต้องเหมือน Search
- Criteria ที่อ้าง inactive brand/model/reference ต้องไม่หายจาก history แต่ต้องมี dependency warning
- Criteria สามารถอ้าง brand/model/reference หรือ option master ที่มี no current listing (จำนวน Asset Sale = 0 ตอนสร้าง) ได้ — ถือเป็น unmet demand ปกติ ไม่ใช่ inactive market data (ดู `../FrontOffice/10_WATCH_ALERT_MODULE.md` No Current Listing vs Inactive Market Data Rule)
- Option-based criteria (condition, delivery, case material, movement, dial color, strap/bracelet) match ด้วย relation id เท่านั้น — Asset ที่เก็บ spec เป็น free-text (relation `null` จาก flow `ระบุเอง` ใน `17_OPTION_MASTER_MODULE.md` section 22.2/23) ต้องไม่ match option criteria จนกว่า Back Office promote/map alias แล้ว backfill relation id
- Keyword criteria เป็นช่องทางครอบคลุม free-text spec — keyword ต้อง match บน spec snapshot text รวมค่าที่ Owner กรอกผ่าน `ระบุเอง` ตาม `../FrontOffice/10_WATCH_ALERT_MODULE.md` Spec Option And Free-Text Criteria Rule
- ค่า suggestion pool (`spec_option_suggestions` ใน `17_OPTION_MASTER_MODULE.md` section 23) ที่ยังไม่ promote ต้องไม่มีให้เลือกเป็น criteria — criteria อ้างได้เฉพาะ entity/option `is_active=true` เท่านั้น

## 10. Match And Trigger Rules

Match ต้องใช้ rule เดียวกับ FO Search:

- Match เฉพาะ asset status `Sale`
- ต้องผ่าน moderation/visibility rule
- ต้องไม่รวม asset ของ blocked user หรือคู่ที่ block กัน
- ต้องไม่รวม `Show`, `Hide`, `Sold`, `ลบโดยเจ้าของ`, `ซ่อนถาวร`
- Market data inactive ต้องหยุด new trigger ตาม policy แต่ยังเก็บ alert/history เดิม

Backfill re-evaluation (Option Master curation):

- เมื่อ Back Office promote suggestion เป็น option จริงหรือ map alias แล้ว backfill relation id ให้ Asset เดิม (ตาม `17_OPTION_MASTER_MODULE.md` section 23.4) ระบบต้อง re-run match evaluation ของ alert ที่เกี่ยวข้อง
- Match ใหม่ที่เกิดจาก backfill ต้องผ่าน trigger + notification pipeline ปกติ และ dedup ด้วย (`alert_id`, `asset_id`) — ห้าม notify asset เดิมซ้ำใน alert เดียวกัน
- Backfill อัปเดตเฉพาะ relation id — snapshot text ของ asset คงเดิม และ match rule ด้านบน (Sale only, visibility, block) ยังบังคับเหมือนเดิม

Lifecycle impact:

| Asset Transition | Watch Alert Impact |
| --- | --- |
| `Sale` -> `Sold` | หายจาก result และไม่ trigger ใหม่ |
| `Sale` -> `Hide` | หายจาก result และไม่ trigger ใหม่ |
| `Sale` -> `Show` | หายจาก result และไม่ trigger ใหม่ |
| `Hide` -> `Sale` | Match ได้ถ้าตรง criteria |
| `Show` -> `Sale` | Match ได้ถ้าตรง criteria |
| Any -> `ลบโดยเจ้าของ` หรือ `ซ่อนถาวร` | ไม่ match และ direct/result surface ต้อง unavailable |

## 10.1 No Current Listing vs Inactive Market Data

BO ต้องแยกความแตกต่างระหว่าง 2 สถานะนี้ให้ชัด เพราะกระทบ admin review และ analytics ต่างกัน:

| สถานะ | ความหมาย | ผลต่อ Watch Alert | สิ่งที่ BO ต้องแสดง |
| --- | --- | --- | --- |
| no current listing | entity/option `is_active=true` ใน Market Data/Option Master แต่ไม่มี Asset Sale ตอนนั้น | Alert ทำงานปกติ รอ match ในอนาคต ไม่มี warning | ไม่ต้อง flag เป็น inactive; นับเป็น unmet demand ปกติ |
| inactive market data | Brand/Model/Reference ถูก deactivate ใน Market Data (`is_active=false`) | Alert เดิมยังเก็บ history ได้ แต่หยุด trigger match ใหม่ตาม policy | แสดง dependency warning ใน Alert List (Warning icon + filter Market data: Inactive dependency) และ Alert Detail (warning badge ข้าง field) |
| deactivated option | Option master ถูก deactivate (`is_active=false`) | Alert เดิมยังเก็บ history ได้ แต่หยุด trigger match ใหม่ตาม policy | แสดง dependency warning เหมือน inactive market data |
| free-text spec (`ระบุเอง`) | Owner กรอกค่า spec เอง ไม่มี relation id — ค่าอยู่ใน `spec_option_suggestions` รอ BO curate | ไม่ match option criteria เลย; match ได้เฉพาะผ่าน keyword criteria บน snapshot text จนกว่า promote/map alias + backfill | ไม่ใช่ option — ไม่แสดงใน criteria selector; demand วัดผ่าน Search Insights + suggestion usage count (section 15) |

Alert ที่ criteria อ้าง entity/option ที่มี no current listing ตอนสร้าง ถือเป็น unmet demand ปกติ ไม่ใช่ inactive market data — ดู `../FrontOffice/10_WATCH_ALERT_MODULE.md` No Current Listing vs Inactive Market Data Rule สำหรับรายละเอียด

## 11. Trigger History

Trigger history ต้องแสดง:

- Trigger ID
- Alert ID
- Matched asset ID
- Asset status ตอน trigger
- Criteria snapshot
- Match timestamp
- Notification event ID ถ้ามี
- Delivery status
- Exclusion reason ถ้า match ถูก skip เช่น block, inactive market data, visibility, disabled notification

Criteria snapshot สำคัญ เพราะ criteria อาจถูก user แก้หลัง trigger แล้ว

## 12. Notification Delivery

Watch Alert delivery trace ต้องยึด destination:

```text
Watch Alert Notification -> Watch Alert Result List
```

ห้ามใช้ Asset Detail เป็น direct destination ของ Watch Alert notification

BO Watch Alert ดู delivery status แบบ read-only ได้ที่ **Settings > Delivery Logs** (Phase 1, ดู `16_ADMIN_SETTINGS_MODULE.md`); การจัดการ template, retry, broadcast หรือ trigger configuration เป็น Phase 2/future (เคยอยู่ใน Notification module — ดู `14_NOTIFICATIONS_MODULE.md`)

Delivery fields ขั้นต่ำ:

- Notification ID
- Type = `Watch Alert`
- Recipient
- Alert ID
- Trigger ID
- Destination = `Watch Alert Result List`
- Delivery status
- Sent timestamp
- Opened timestamp ถ้ามี
- Failure reason ถ้ามี

## 13. Admin Actions

Watch Alert BO เป็น read-only ทั้ง List และ Detail — Admin ไม่จัดการ alert ของ user ใด ๆ (ไม่ disable/enable/export/bulk)

| Action | Allowed Roles | Requirement |
| --- | --- | --- |
| View alert | Admin | Module permission required |
| View trigger history | Admin | policy-based visibility |
| View delivery status | Admin | Read-only; retry อยู่ใน Settings > Delivery Logs (Phase 1); template/broadcast config เป็น Phase 2/future |

## 14. FO Sync Rules

| BO/System Action | FO Result |
| --- | --- |
| Market data inactive | หยุด new trigger สำหรับ criteria ที่พึ่งพา inactive option ตาม policy |
| Asset status no longer Sale | Asset หายจาก Watch Alert Result List |
| User block relation changes | Result list ต้อง filter blocked asset ทันทีเมื่อโหลดใหม่ |

## 15. Analytics

Analytics ขั้นต่ำ:

### Search Insights

- Search volume by keyword และ date range
- Popular filter selection by dimension
- Popular filter combination
- No-result search count และ rate
- Search-to-result conversion
- Search trend over time (รายวัน/รายสัปดาห์) สำหรับดู trend ของ search volume และ no-result rate
- Search funnel: Search Submit → Result Click → Asset Detail Open → Watch Alert/Offer เพื่อวัด conversion จาก search สู่ action
- Average results per search เพื่อวัด quality ของ search result
- Popular Filter tag impression/select สำหรับวัดการใช้งาน quick selection
- Free-text spec demand signal — popular keyword และ no-result search ที่ตรง spec text เป็นแหล่งวัด demand ของค่าที่ยังไม่มีใน option master ใช้ร่วมกับ `spec_option_suggestions.usage_count` ใน `17_OPTION_MASTER_MODULE.md` section 23 เพื่อช่วย Admin จัดลำดับ curation

### Watch Alert Demand

- Total active alerts
- Notification enabled vs disabled
- Trigger count by date range
- Top alert brands/models/reference
- Alert open rate
- Trigger-to-open rate
- Inactive market data dependency count
- Suggestion pool demand — `usage_count` ของค่า free-text ที่ยังไม่ promote (reference `17_OPTION_MASTER_MODULE.md` section 23) แยกจาก option criteria demand; ค่า free-text ไม่นับเป็น option demand จนกว่า promote

Analytics ต้องไม่ expose sensitive user data ให้ admin access ที่ไม่มี permission

## 16. Audit Requirements

Audit action ขั้นต่ำ:

- `WATCH_ALERT_SENSITIVE_REVEAL` ถ้ามีการเปิดดูข้อมูลที่ mask ไว้
- `WATCH_ALERT_TRIGGER_JOB_RUN` ถ้า background job ต้อง trace

ทุก event ต้องมี:

- Admin ID หรือ system actor
- Admin Access
- Action type
- Target alert ID
- Before value
- After value
- Reason/note เมื่อจำเป็น
- Related user/asset/trigger/notification ID
- IP address หรือ session context ถ้ามี
- Timestamp เป็น `Asia/Bangkok`

## 17. Error, Empty, Loading States

ต้องรองรับ:

- Empty alert list ตาม filter
- Empty trigger history
- Alert ถูก user ลบระหว่าง admin เปิดหน้า
- Criteria อ้าง market data ที่ inactive แล้ว
- Notification delivery section load fail โดยไม่ทำให้ alert detail ทั้งหน้าล่ม
- Permission denied สำหรับ user detail/sensitive reveal
- Stale trigger warning เมื่อ background job ยังประมวลผลไม่เสร็จ

## 18. Integration With Other BO Modules

| Module | Integration |
| --- | --- |
| Demand Overview (same module) | Demand Overview ใช้ alert data ตัวเดียวกัน aggregate เป็น KPI (Active Alerts, Alerts with Matches, Unmet Demand, Notification Success Rate) พร้อม trigger trend chart และ frequently triggered list; เป็น sibling screen ใน Market Demand menu ไม่ใช่ module อื่น |
| Dashboard | Dashboard card "Watch Alert" แสดง active alert count และ trigger count วันนี้; drill-in ไป Demand Overview |
| User Management | Alert Detail Section 2 Owner Summary แสดง owner info (User ID, Display Name, Account Status) แบบ read-only ไม่มี drill-in link ไป User Detail ใน prototype; account status อ้างอิง User Management state |
| Asset Management | Alert Detail Section 4 Matched Assets: Asset ID เป็น link (drill-in) ไป Asset Detail; asset status/visibility changes affect match/result |
| Market Data | Alert Detail Section 3 Criteria: แสดง inactive market data warning เมื่อ criteria อ้างถึง brand/model/reference ที่ inactive; brand/model/reference active status affects criteria and trigger |
| Asset Management (Reported Comments) | Block relation affects result visibility |
| Settings > Delivery Logs (Phase 1) | Alert Detail Section 5 Trigger & Notification History: แสดง delivery status (Delivered/Skipped/Failed/Pending) แบบ read-only; delivery logs และ retry อยู่ใน Settings > Delivery Logs |
| Notifications (Phase 2/future) | Templates, retry policy, broadcast config — เคยอยู่ใน Notification module (ดู `14_NOTIFICATIONS_MODULE.md`) |
| Audit Log | Watch Alert event types: `WATCH_ALERT_SENSITIVE_REVEAL`, `WATCH_ALERT_TRIGGER_JOB_RUN` (ดู section 16) |
| Reports & Analytics (Phase 2/future) | Watch Alert report and search trend report |

## Module-Specific Exceptions

ไม่มี

Watch Alert ต้องใช้ app shell, navigation, breakpoint, list toolbar, desktop table/grid, mobile card, pagination, reset และ detail ตาม `00_GLOBAL_RULES_MODULE.md` และ `../Prototypes/bo-prototype.html` โดยไม่มี UI/layout override เฉพาะโมดูล

## 19. Acceptance Criteria

| ID | Criteria |
| --- | --- |
| AC-BO-WA-001 | Admin เห็น Market Demand parent menu พร้อม Demand Overview, Search Insights และ Watch Alert List |
| AC-BO-WA-002 | Watch Alert List แสดง alert รายการแบบ read-only รวมที่ user ลบแล้ว (soft delete) ครบคอลัมน์ขั้นต่ำ (Alert ID, Alert Name, Owner, Criteria, Status, Notification, Matches, Triggers, Last Triggered, Updated) พร้อม filter, sort และ pagination; Alert Detail แสดง 6 sections ครบ: Alert Summary, Owner Summary, Criteria, Matched Assets, Trigger & Notification History และ User Action History |
| AC-BO-WA-002A | Watch Alert List เป็น read-only ไม่มี admin action ในหน้า List (disable/enable/bulk/export) และไม่มี action menu; การเข้าถึงรายละเอียดทำผ่าน row click เข้า Alert Detail |
| AC-BO-WA-002B | Watch Alert List มี filter Match status สำหรับคัดกรอง unmet demand (ไม่มี match) แยกจาก alert ที่มี match และ filter Trigger history สำหรับคัดกรอง alert ที่เคย/ไม่เคย trigger |
| AC-BO-WA-002C | Alert Detail เป็น read-only ไม่มี admin action ในหน้า Detail (disable/enable/export) เข้าผ่าน row click จาก Watch Alert List พร้อมปุ่มกลับไป List |
| AC-BO-WA-002D | Alert Detail แสดง Detail Head (Alert ID : Alert Name + Status badge + Notification badge) เหนือ Section 1 และ Section 1 Alert Summary แสดง summary tiles 4 ช่อง (Created, Updated, Matches, Triggers) |
| AC-BO-WA-002E | Alert Detail Section 2 Owner Summary แสดง User ID, Display Name และ Account Status แบบ read-only |
| AC-BO-WA-002F | Alert Detail Section 3 Criteria แสดง criteria แบบ structured chips/rows ไม่ใช่ JSON ดิบ แสดงเฉพาะ field ที่มีค่า และแสดง inactive market data warning เมื่อ criteria อ้างถึง market data ที่ inactive |
| AC-BO-WA-002G | Alert Detail Section 4 Matched Assets แสดงตาราง asset สถานะ Sale ที่ match criteria พร้อม link ไป Asset Management และ pagination 10 รายการต่อหน้า |
| AC-BO-WA-002H | Alert Detail Section 5 Trigger & Notification History แสดงตาราง trigger ที่มี new matches > 0 พร้อม delivery status และ pagination 10 รายการต่อหน้า; ถ้า alert ถูกลบ ยังแสดงประวัติเดิมพร้อม notice box แจ้งว่าไม่มี trigger ใหม่หลังวันที่ลบ |
| AC-BO-WA-002I | Alert Detail Section 6 User Action History แสดงตารางประวัติ user สร้าง/แก้ criteria/แก้ชื่อ/เปิด-ปิด notification/ลบ alert พร้อม pagination 10 รายการต่อหน้า และยังเห็น history แม้ alert ถูกลบ |
| AC-BO-WA-003 | Criteria schema ต้องตรง Search Filter และทุก field optional |
| AC-BO-WA-004 | Trigger/match ต้องใช้เฉพาะ asset status `Sale` และไม่รวม Show/Hide/Sold/Deleted/Removed |
| AC-BO-WA-005 | Watch Alert notification destination ต้องเป็น `Watch Alert Result List` ไม่ใช่ Asset Detail |
| AC-BO-WA-008 | Market data inactive dependency ต้องแสดง warning และไม่ลบ history เดิม |
| AC-BO-WA-008A | Alert ที่ criteria อ้าง entity/option ที่มี no current listing (จำนวน Asset Sale = 0 ตอนสร้าง) ต้องไม่ถูก flag เป็น inactive market data และต้องนับเป็น unmet demand ปกติ |
| AC-BO-WA-009 | Block relation ต้องถูกใช้เป็น exclusion context ใน trigger/result review |
| AC-BO-WA-010 | Responsive layout ใช้งานได้ที่ mobile-width, tablet และ desktop
| AC-BO-WA-011 | Search Insights แสดง popular keyword/filter, no-result search, search trend over time, search funnel (Search → Result Click → Asset Detail → Watch Alert/Offer) และ average results per search แบบ aggregate โดยไม่เปิดเผยข้อมูลระบุตัว user
| AC-BO-WA-011A | Search Funnel แสดงเป็นรายการแนวตั้งรูปแบบเดียวกับ Asset Status โดยแต่ละแถวมี Step, ชื่อขั้น, จำนวนเหตุการณ์ และเปอร์เซ็นต์เทียบกับ Search Submit ครบทั้ง 4 ขั้น และไม่มี progress bar ซ้อนในแถว |
| AC-BO-WA-012 | Demand Overview แยก Search demand, Watch Alert demand, Unmet Search Demand และ Unmet Watch Alert ได้ชัดเจน |
| AC-BO-WA-013 | Demand Overview Top Criteria ใช้สี `#2b6cb0` เดียวกันสำหรับ indicator dot, progress bar และ percentage ในการ์ดหลัก, View All modal และ drill-down ระดับ Top Brands, Top Models และ Top References โดยใช้ความยาวแถบและค่าตัวเลขเป็นตัวสื่อสัดส่วน |
| AC-BO-WA-014 | Option-based criteria match ด้วย relation id เท่านั้น — asset ที่เก็บ spec เป็น free-text (relation `null` จาก flow `ระบุเอง`) ต้องไม่ match option criteria จนกว่า BO promote/map alias แล้ว backfill และค่า suggestion ที่ยังไม่ promote ต้องไม่มีให้เลือกเป็น criteria |
| AC-BO-WA-015 | Keyword criteria ต้อง match บน spec snapshot text รวม free-text spec ที่ Owner กรอกผ่าน `ระบุเอง` |
| AC-BO-WA-016 | หลัง backfill relation id จาก promote/map alias ระบบต้อง re-run match evaluation ของ alert ที่เกี่ยวข้องและแจ้งเตือน match ใหม่โดย dedup ด้วย (`alert_id`, `asset_id`) |
| AC-BO-WA-017 | Free-text spec (`ระบุเอง`) ต้องแยกจาก no current listing ในตาราง section 10.1 — demand ของ free-text วัดผ่าน Search Insights keyword/no-result signal และ `spec_option_suggestions.usage_count` ไม่ใช่ option demand |

## 20. Open Decisions

| ID | Decision Needed | Current Recommendation |
| --- | --- | --- |
| BO-WA-DEC-001 (resolved) | FO แสดง Admin Disabled alert เป็น disabled state หรือซ่อนจาก list | **ตัดสินใจ:** ไม่มี Admin Disabled state — Watch Alert BO เป็น read-only ทั้ง List และ Detail, Admin ไม่ disable/enable alert ของ user ใด ๆ (ดู section 13) |
| BO-WA-DEC-002 (resolved) | Inactive market data ทำให้ alert เดิม disabled หรือแค่หยุด trigger ใหม่ | **ตัดสินใจ:** หยุด trigger match ใหม่ตาม policy แต่ยังเก็บ alert/history เดิม — สอดคล้องกับ section 10 และ 10.1 |
| BO-WA-DEC-003 (resolved) | เปิด bulk disable alert หรือไม่ | **ตัดสินใจ:** ไม่เปิด — Watch Alert BO เป็น read-only ไม่มี admin action ใด ๆ ต่อ alert ของ user (ดู section 13) |

