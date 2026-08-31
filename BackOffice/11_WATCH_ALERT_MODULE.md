# 11 BO Market Demand & Watch Alert Module

**Version:** `BO-11-v0.2`
**Date:** 2026-07-06  
**Status:** Draft baseline  
**Platform:** Responsive Web Back Office

## UI Standards And Prototype Reference

เอกสารนี้ต้องใช้ร่วมกับ `00_GLOBAL_RULES_MODULE.md` และยึดรูปแบบหน้าจอ/พฤติกรรมที่ยืนยันแล้วใน `../Prototypes/bo-prototype.html` เป็นมาตรฐานหลัก

เอกสารอ้างอิง: `../FrontOffice/10_WATCH_ALERT_MODULE.md`, `../FrontOffice/03_SEARCH_FILTER_MODULE.md`, `../FrontOffice/09_NOTIFICATION_MODULE.md`, `../FrontOffice/04_ASSET_MANAGEMENT_MODULE.md`, `../FrontOffice/15_TRUST_SAFETY_MODULE.md`

## 1. Document Information

| Field | Detail |
| --- | --- |
| Module Name | BO Market Demand & Watch Alert |
| Platform | Responsive Web Back Office |
| Version | `BO-11-v0.2` |
| Status | Draft baseline |
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
- Watch Alert list พร้อม search, filter, sort, pagination และ export ตาม permission
- Watch Alert detail พร้อม owner, alert name, criteria, active/disabled state, notification toggle และ trigger history
- Trigger history สำหรับ asset ที่ match criteria
- Notification delivery trace สำหรับ Watch Alert
- Admin disable/enable alert ตาม permission
- Criteria validation ว่าใช้ schema เดียวกับ Search Filter
- Match rule เฉพาะ asset status `Sale`
- Block/user visibility context ที่ส่งผลต่อ result
- Market data dependency เช่น brand/model/reference active/inactive
- Audit log สำหรับ disable/enable/export/sensitive reveal
- Responsive layout สำหรับ desktop, tablet และ mobile-width browser

### Out Of Scope

- Recent Search ส่วนตัวของ user
- Saved Search ในฐานะ feature แยกจาก Watch Alert
- Search History Sync
- AI Search Suggestion
- Admin สร้าง Watch Alert ใหม่แทน user ใน Phase 2 baseline
- Alert frequency setting, daily digest, weekly digest
- Market Price Alert, Watch Price Alert, Saved Search
- Notification template/retry management ซึ่งอยู่ใน Notification module
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
| Module access | Admin ที่มีสิทธิ์เข้าเมนูสามารถดู list, detail, search, filter, sort และ pagination ได้ |
| Write action | Action ที่เปลี่ยน state หรือกระทบ user/FO ต้องตรวจ permission, แสดง confirmation สำหรับ high-risk action, บังคับกรอก reason เมื่อมีผลต่อ FO/user และบันทึก audit |
| Sensitive data | แสดงแบบ mask เป็นค่าเริ่มต้น เปิดเฉพาะกรณีมี business reason, อนุมัติตาม policy และบันทึก audit |
| Export | ต้องตรวจ permission, ควบคุม scope, ใช้ expiry/background job เมื่อจำเป็น และบันทึก audit export event |
| Direct URL/API | ต้องตรวจสิทธิ์ที่ route, API และ service layer เสมอ ห้ามพึ่งพาการซ่อน UI เพียงอย่างเดียว |
## 6. Responsive Layout

| Width | Layout Requirement |
| --- | --- |
| Mobile-width browser | Alert table เปลี่ยนเป็น stacked cards, filter อยู่ใน drawer/bottom sheet, disable/enable action ต้องไม่ล้นจอ |
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

คำจำกัดความ:

| ข้อมูล | แหล่งข้อมูล | ความหมาย |
| --- | --- | --- |
| Popular Search/Filter | Search keyword และ filter events | สิ่งที่ user สนใจหรือเลือกบ่อย แม้ยังไม่ได้สร้าง alert |
| Watch Alert Demand | Watch Alert criteria | ความต้องการที่ user บันทึกไว้เพื่อติดตาม |
| Unmet Search Demand | Search/filter ที่ไม่มีผลลัพธ์ | ความต้องการจากการค้นหาที่ supply ปัจจุบันยังไม่ตอบสนอง |
| Unmet Watch Alert | Active Watch Alert ที่ไม่มี current match | Alert ที่กำลังรอ asset ตรง criteria |
| Asset Supply | Asset Management / Asset List | จำนวน asset ที่มีและมองเห็นได้ตาม rule |

## 7. Watch Alert List

ข้อมูลขั้นต่ำ:

- Alert ID
- Alert owner
- Alert name
- Criteria summary
- Status
- Notification enabled
- Trigger count
- Last triggered date
- Created date
- Updated date
- Disabled by admin flag ถ้ามี

### Search

ค้นหาได้จาก:

- Alert ID
- User ID / username / display name
- Alert name
- Brand
- Model
- Reference number

### Filters

- Status: `Active`, `User Disabled`, `Admin Disabled`, `Deleted`
- Notification enabled: on/off
- Has trigger history
- Brand/model/reference
- Created date range
- Last triggered date range
- Market data inactive dependency
- Abuse/risk flagged

## 8. Watch Alert Status Contract

| Status | Meaning | FO Required Behavior |
| --- | --- | --- |
| `Active` | Alert ยังใช้งานได้ | Trigger notification ได้ถ้า notification enabled และมี match |
| `User Disabled` | User ปิด notification หรือ disable เอง | เก็บ alert ไว้ แต่ไม่ส่ง notification ตาม toggle |
| `Admin Disabled` | Admin ปิด alert ตาม policy | ไม่ trigger notification ใหม่; FO ควรเห็น unavailable/disabled state หรือซ่อนตาม UX policy |
| `Deleted` | User ลบ alert | หายจาก Watch Alert List และหยุด notification ทันที |

BO ต้องเก็บ actor/source ของ status change แยกให้ชัด เช่น user action, admin action, system action

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

## 10. Match And Trigger Rules

Match ต้องใช้ rule เดียวกับ FO Search:

- Match เฉพาะ asset status `Sale`
- ต้องผ่าน moderation/visibility rule
- ต้องไม่รวม asset ของ blocked user หรือคู่ที่ block กัน
- ต้องไม่รวม `Show`, `Hide`, `Sold`, `ลบโดยเจ้าของ`, `ซ่อนถาวร`
- Market data inactive ต้องหยุด new trigger ตาม policy แต่ยังเก็บ alert/history เดิม

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

BO Watch Alert ดู delivery status ได้ แต่การจัดการ template, retry, broadcast หรือ trigger configuration อยู่ใน Notification module

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

| Action | Allowed Roles | Requirement |
| --- | --- | --- |
| View alert | Admin | Module permission required |
| View trigger history | Admin | policy-based visibility |
| Disable alert | Admin ตาม policy | Confirmation, reason, audit, stop new triggers |
| Enable alert | Admin | Reason, audit, criteria revalidation |
| Export alerts/history | Admin | Audit export event และ controlled access |
| View delivery status | Admin | Read-only; retry อยู่ใน Notification module |

Bulk disable ต้องเปิดเฉพาะกรณี abuse/risk policy ชัดเจน และต้องมี confirmation + reason

## 14. FO Sync Rules

| BO/System Action | FO Result |
| --- | --- |
| Admin disables alert | Alert ไม่ trigger notification ใหม่; FO แสดง disabled/unavailable หรือซ่อนตาม UX policy |
| Admin enables alert | Alert กลับมา trigger ตาม criteria หาก notification enabled |
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

### Watch Alert Demand

- Total active alerts
- Notification enabled vs disabled
- Trigger count by date range
- Top alert brands/models/reference
- Alert open rate
- Trigger-to-open rate
- Disabled by admin count
- Inactive market data dependency count

Analytics ต้องไม่ expose sensitive user data ให้ admin access ที่ไม่มี permission

## 16. Audit Requirements

Audit action ขั้นต่ำ:

- `WATCH_ALERT_DISABLE`
- `WATCH_ALERT_ENABLE`
- `WATCH_ALERT_EXPORT`
- `WATCH_ALERT_SENSITIVE_REVEAL`
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
- Permission denied สำหรับ user detail/export/sensitive reveal
- Stale trigger warning เมื่อ background job ยังประมวลผลไม่เสร็จ

## 18. Integration With Other BO Modules

| Module | Integration |
| --- | --- |
| Dashboard | Active alert count, trigger volume, failed delivery count |
| User Management | Alert owner profile, account status, support context |
| Asset Management | Asset status/visibility changes affect match/result |
| Market Data | Brand/model/reference active status affects criteria and trigger |
| Asset Management (Reported Comments) | Block relation affects result visibility |
| Notification | Delivery logs, templates, retry policy |
| Audit Log | Disable/enable/export/job events searchable |
| Reports & Analytics | Watch Alert report and search trend report |

## Module-Specific Exceptions

ไม่มี

Watch Alert ต้องใช้ app shell, navigation, breakpoint, list toolbar, desktop table/grid, mobile card, pagination, reset และ detail ตาม `00_GLOBAL_RULES_MODULE.md` และ `../Prototypes/bo-prototype.html` โดยไม่มี UI/layout override เฉพาะโมดูล

## 19. Acceptance Criteria

| ID | Criteria |
| --- | --- |
| AC-BO-WA-001 | Admin เห็น Market Demand parent menu พร้อม Demand Overview, Search Insights และ Watch Alert List |
| AC-BO-WA-002 | Alert List แสดง alert รายรายการ และ Alert Detail แสดง owner, criteria, status, notification toggle และ trigger history |
| AC-BO-WA-003 | Criteria schema ต้องตรง Search Filter และทุก field optional |
| AC-BO-WA-004 | Trigger/match ต้องใช้เฉพาะ asset status `Sale` และไม่รวม Show/Hide/Sold/Deleted/Removed |
| AC-BO-WA-005 | Watch Alert notification destination ต้องเป็น `Watch Alert Result List` ไม่ใช่ Asset Detail |
| AC-BO-WA-006 | Admin disable alert ได้ตาม permission พร้อม confirmation, reason และ audit |
| AC-BO-WA-007 | Disabled alert ต้องหยุด trigger notification ใหม่ |
| AC-BO-WA-008 | Market data inactive dependency ต้องแสดง warning และไม่ลบ history เดิม |
| AC-BO-WA-008A | Alert ที่ criteria อ้าง entity/option ที่มี no current listing (จำนวน Asset Sale = 0 ตอนสร้าง) ต้องไม่ถูก flag เป็น inactive market data และต้องนับเป็น unmet demand ปกติ |
| AC-BO-WA-009 | Block relation ต้องถูกใช้เป็น exclusion context ใน trigger/result review |
| AC-BO-WA-010 | Responsive layout ใช้งานได้ที่ mobile-width, tablet และ desktop
| AC-BO-WA-011 | Search Insights แสดง popular keyword/filter, no-result search, search trend over time, search funnel (Search → Result Click → Asset Detail → Watch Alert/Offer) และ average results per search แบบ aggregate โดยไม่เปิดเผยข้อมูลระบุตัว user
| AC-BO-WA-012 | Demand Overview แยก Search demand, Watch Alert demand, Unmet Search Demand และ Unmet Watch Alert ได้ชัดเจน |

## 20. Open Decisions

| ID | Decision Needed | Current Recommendation |
| --- | --- | --- |
| BO-WA-DEC-001 | FO แสดง Admin Disabled alert เป็น disabled state หรือซ่อนจาก list | ให้ FO UX ตัดสิน แต่ BO ต้องส่ง state ชัดเจน |
| BO-WA-DEC-002 (resolved) | Inactive market data ทำให้ alert เดิม disabled หรือแค่หยุด trigger ใหม่ | **ตัดสินใจ:** หยุด trigger match ใหม่ตาม policy แต่ยังเก็บ alert/history เดิม — สอดคล้องกับ section 10 และ 10.1 |
| BO-WA-DEC-003 | เปิด bulk disable alert หรือไม่ | ยังไม่เปิด default; เปิดเฉพาะ abuse/risk policy พร้อม audit |

