# 10 Watch Alert Module

อ้างอิงหลักจาก [TukDaeng_Master_Product_Definition.md](TukDaeng_Master_Product_Definition.md)

---

# 1. Document Information

| Field | Detail |
| --- | --- |
| Module Name | Watch Alert |
| Version | 1.0 |
| Status | Functional PRD - Master Aligned |
| Owner | Tuk Daeng Project |
| Document Type | Front Office Functional PRD |
| Source of Truth | TukDaeng Master Product Definition |

---

# 2. Objective

Watch Alert Module ใช้สำหรับให้ Member ตั้งเงื่อนไขติดตามนาฬิกาที่ตนต้องการจาก Search Filter และรับ Notification เมื่อมี Asset สถานะ Sale ที่ตรง criteria — ไม่ว่าตอนตั้ง alert จะมีรุ่นที่ต้องการลงขายอยู่หรือไม่ หรือเคยมีลงขายแต่ไม่ตรงเงื่อนไขที่ต้องการ (เช่น ราคา/สภาพ/สี)

Watch Alert ต้องใช้ logic เดียวกับ Search และต้องเปิดผลลัพธ์ผ่าน Watch Alert Result List ไม่เปิด Asset Detail โดยตรงจาก notification

---

# 3. Prototype Reference

| Prototype | Usage |
| --- | --- |
| Watch Alert.png | Watch Alert list, create/edit/delete, result list |
| Search & Filter.png | Entry point และ filter criteria |
| Notification.png | Watch Alert notification destination |

---

# 4. Master Alignment Summary

| Topic | Master Baseline | Watch Alert Module Rule |
| --- | --- | --- |
| Entry Point | Watch Alert สร้างจาก Search Filter | Create Watch Alert ต้องเริ่มจาก Search Filter เท่านั้น |
| Required Field | Watch Alert criteria ไม่มี Required Field แต่ Alert Name ต้องไม่ว่างตอนบันทึก | ระบบเติมชื่อเริ่มต้นให้ก่อน User แก้ไขได้ แต่หากลบชื่อจนว่างต้องแจ้ง validation |
| Match Rule | Match เฉพาะ Asset สถานะ Sale | Show, Hide, Sold และ Deleted ต้องไม่ match |
| Notification Destination | เปิด Watch Alert Result List ไม่เปิด Asset ตรง | Notification tap ต้องไป Result List |
| Search Alignment | Search แสดงเฉพาะ Sale และรองรับ filter หลายมิติ | Watch Alert criteria ต้องใช้ filter logic เดียวกับ Search |
| Lifecycle | Sale -> Sold / Hide หายจาก Watch Alert, Hide/Show -> Sale match ได้ | Result List ต้องเคารพ status lifecycle |
| Block User | Asset ของผู้ถูก Block ต้องหายจาก Watch Alert Result ทันที | Result List ต้องกรอง blocked users |
| Empty State | `ไม่พบข้อมูล` / `No data found` | ใช้ข้อความกลางตาม master |

---

# 5. Figma Gap Checklist For Watch Alert Module

| Priority | Figma Gap | Master Baseline | Action |
| --- | --- | --- | --- |
| High | ยังไม่เห็น Watch Alert Result List ชัดเจน | Watch Alert notification ต้องเปิด Result List ไม่เปิด Asset Detail ตรง | เพิ่ม Watch Alert Result List screen |
| High | Create Watch Alert อาจไม่ได้เริ่มจาก Search Filter | Watch Alert สร้างจาก Search Filter | จำกัด entry point และ annotate flow จาก Search Filter |
| High | ต้องยืนยันว่า Watch Alert match เฉพาะ Sale | Watch Alert Match เฉพาะ Asset สถานะ Sale | ตรวจ result/filter state ไม่ให้มี Show, Hide, Sold |
| High | Guest Create Watch Alert restriction ยังไม่ชัด | Guest ใช้ Watch Alert ไม่ได้และต้องเห็น Global Login Required Dialog | เพิ่ม guest dialog/state |
| Medium | ต้องยืนยันว่าไม่มี Required Field ของ criteria | Watch Alert criteria ไม่มี Required Field | Create flow ต้อง save ได้แม้ criteria ว่างหรือมีบางส่วน |
| Medium | Alert name auto-generate และ validation ยังไม่ชัด | ระบบต้องเติมชื่อเริ่มต้นจาก filter/default และ Alert Name ต้องไม่ว่างตอน save | เพิ่ม default/generated name state และ empty-name validation |
| Medium | Filter dependency ต้องตรง Search | Watch Alert ใช้ filter logic เดียวกับ Search | เพิ่มตัวอย่าง Brand -> Model dependency |
| Medium | Lifecycle impact ยังไม่ชัด | Sale -> Sold/Hide หายจาก result, Hide/Show -> Sale กลับมา match ได้ | เพิ่ม state notes หรือ flow annotation |
| Medium | Block user impact ยังไม่ชัด | Asset ของผู้ถูก Block ต้องหายจาก Watch Alert Result ทันที | เพิ่ม blocked-user result filtering state |
| Medium | Delete Alert confirmation และผลลัพธ์หลังลบยังต้องตรวจ | Delete Alert ต้องหยุด notification ทันที | เพิ่ม confirmation และ stopped notification state |

---

# 6. Scope

## In Scope

- Create Watch Alert จาก Search Filter
- Watch Alert List
- Watch Alert Result List
- Edit Watch Alert
- Rename Watch Alert
- Delete Watch Alert พร้อม confirmation
- Enable / Disable notification ต่อ alert
- Match เฉพาะ Asset Sale
- Notification ไป Watch Alert Result List
- Empty state
- Block user impact ต่อ result

## Out of Scope For V1

- Alert frequency setting
- Daily Digest
- Weekly Digest
- Market Price Alert
- Saved Search เป็น feature แยก
- Watch Price notification
- Opening Asset Detail directly from Watch Alert notification

---

# 7. Screen Mapping

| Screen / Component | Description |
| --- | --- |
| Search Filter | จุดเริ่มต้นสร้าง Watch Alert |
| Create Watch Alert | บันทึก criteria เป็น alert |
| Watch Alert List | รายการ Alert ทั้งหมดของ Member |
| Edit Watch Alert | แก้ชื่อ criteria หรือ notification toggle |
| Watch Alert Result List | รายการ Asset Sale ที่ match criteria |
| Delete Confirmation | ยืนยันก่อนลบ Alert |
| Notification | แจ้งเมื่อมี result ใหม่ที่ match |

---

# 8. User States

## Guest

- ดู Search Result ได้ตาม public visibility
- Create Watch Alert ไม่ได้
- เมื่อกด Create Watch Alert ต้องแสดง Global Login Required Dialog

## Member

- Create Watch Alert ได้จาก Search Filter
- ดู Watch Alert List ของตัวเองได้
- Edit / Rename / Delete Alert ของตัวเองได้
- เปิด/ปิด Notification ต่อ Alert ได้
- เปิด Watch Alert Result List จาก notification ได้

## Blocked Context

- Asset ของ user ที่ถูก block หรือ block กันอยู่ต้องไม่อยู่ใน Watch Alert Result
- ถ้ามี result เดิมแล้วเกิด block ภายหลัง ต้องถูกกรองออกทันทีเมื่อโหลด Result List

---

# 9. User Flow

## Create Watch Alert Flow

```text
Search Filter
-> Select zero or more criteria
-> Create Watch Alert
-> Save
-> Watch Alert created
```

## Receive Alert Flow

```text
System finds matching Sale Asset
-> Send Watch Alert Notification
-> User taps Notification
-> Open Watch Alert Result List
```

## Open Result Flow

```text
Watch Alert Result List
-> Tap Asset Card
-> Open Asset Detail
```

## Edit Alert Flow

```text
Watch Alert List
-> Edit Alert
-> Update name / criteria / notification toggle
-> Save
-> New criteria applies immediately
```

## Delete Alert Flow

```text
Watch Alert List
-> Delete
-> Confirm
-> Alert removed
-> Notification for that Alert stops immediately
```

---

# 10. Business Rules

## Entry Point Rule

- Watch Alert สร้างได้จาก Search Filter เท่านั้น
- Watch Alert List ใช้ manage alert ที่มีอยู่แล้ว ไม่ใช่จุดเริ่ม criteria ใหม่แบบไม่ผ่าน Search Filter

## Required Field Rule

- Watch Alert criteria ไม่มี Required Field
- User สามารถสร้าง Alert จาก filter ว่างหรือ criteria บางส่วนได้
- Alert Name เป็น required ตอนกดบันทึก
- ระบบต้องเติมชื่อเริ่มต้นให้ในช่อง Alert Name ก่อน user กดบันทึก เพื่อไม่เพิ่มภาระการกรอกข้อมูล

## Alert Name Rule

- เมื่อเปิด Create / Save to Watch Alert modal ระบบต้องสร้างชื่อเริ่มต้นจาก criteria ปัจจุบันและแสดงในช่อง Alert Name ทันที
- ตัวอย่างชื่อที่ระบบสร้างได้ เช่น `Rolex`, `Rolex GMT-Master II`, `Rolex to ฿500,000` หรือชื่ออื่นที่อ่านแล้วสื่อถึง filter ที่ใช้
- ถ้าไม่มี criteria ที่ใช้ตั้งชื่อได้ ให้ใช้ default name ตาม implementation เช่น `Watch Alert`
- User สามารถแก้ไขชื่อที่ระบบสร้างให้ได้ก่อนบันทึก
- ตอนกด Save ระบบต้อง trim ค่า Alert Name ก่อน validate
- หาก Alert Name หลัง trim แล้วว่าง ต้องไม่สร้าง Watch Alert
- กรณีชื่อว่าง ให้แสดง inline validation ใต้ช่องชื่อ เช่น `กรุณากรอกชื่อ Watch Alert` หรือ EN: `Please enter a watch alert name.`
- หลังแสดง validation ควร focus กลับไปที่ช่อง Alert Name เพื่อให้ user แก้ไขได้ทันที

## Filter Logic Rule

- Watch Alert ใช้ filter logic เดียวกับ Search Module
- Dependent filter ต้องทำงานเหมือน Search เช่น Brand = Rolex แล้ว Model แสดงเฉพาะ model ของ Rolex
- Clear / update criteria ต้องส่งผลต่อ match result ถัดไป
- Watch Alert criteria สามารถอ้าง Brand/Model/Reference หรือ option master ที่มี no current listing (จำนวน Asset Sale = 0 ตอนสร้าง) ได้ เพราะ Watch Alert ใช้หานาฬิกาที่ผู้ซื้อต้องการ ไม่ว่าจะยังไม่มีรุ่นที่ต้องการลงขาย หรือเคยมีลงขายแต่ไม่ตรงเงื่อนไขที่ต้องการ (เช่น ราคา/สภาพ/สี) — ดู `03_SEARCH_FILTER_MODULE.md` Filter Visibility Rule สำหรับรายละเอียด
- Alert ที่ criteria อ้าง entity/option ที่มี no current listing ถือเป็น unmet demand ปกติ ไม่ใช่ inactive market data

## Spec Option And Free-Text Criteria Rule

- Option-based criteria (Condition, Case Material, Movement, Dial Color, Strap / Bracelet Type, Delivery Contents) match ด้วย relation id เท่านั้น — Asset ที่เก็บ spec เป็น free-text (relation = `null`) ต้องไม่ match option criteria
- Keyword criteria เป็นช่องทางครอบคลุม free-text spec: keyword ต้อง match กับ snapshot text ที่ Owner save กับ Asset รวมถึงค่าที่กรอกผ่าน `ระบุเอง` (ตาม Search Keyword Rule ของ `03_SEARCH_FILTER_MODULE.md`)
- Member ที่ต้องการติดตามค่า spec ที่ยังไม่มีใน option master ต้องใช้ keyword criteria จนกว่า Back Office promote ค่านั้นเป็น option จริง
- ค่า suggestion pool ที่ยังไม่ promote ต้องไม่มีให้เลือกเป็น criteria — criteria อ้างได้เฉพาะ entity/option `is_active=true` เท่านั้น
- เมื่อ Back Office promote suggestion เป็น option จริงหรือ map alias แล้ว backfill relation id ให้ Asset เดิม ระบบต้อง re-run match evaluation ของ alert ที่เกี่ยวข้อง และแจ้งเตือน match ใหม่ที่เกิดจาก backfill โดย dedup ด้วย (`alert_id`, `asset_id`) เพื่อไม่ให้ Asset ที่เคยแจ้งแล้วถูกแจ้งซ้ำ

## No Current Listing vs Inactive Market Data Rule

ระบบต้องแยกความแตกต่างระหว่าง 2 สถานะนี้ให้ชัด เพราะกระทบ behavior ต่างกัน:

| สถานะ | ความหมาย | ผลต่อ Watch Alert |
| --- | --- | --- |
| no current listing | entity/option `is_active=true` ใน Market Data/Option Master แต่ไม่มี Asset Sale ตอนนั้น | Alert ทำงานปกติ รอ match ในอนาคต ไม่มี warning |
| inactive market data | Brand/Model/Reference ถูก deactivate ใน Market Data (`is_active=false`) | Alert เดิมยังเก็บ history ได้ แต่หยุด trigger match ใหม่ตาม policy และแสดง dependency warning |
| deactivated option | Option master ถูก deactivate (`is_active=false`) | Alert เดิมยังเก็บ history ได้ แต่หยุด trigger match ใหม่ตาม policy และแสดง dependency warning |
| free-text spec value | ค่าที่ Owner กรอกผ่าน `ระบุเอง` เก็บกับ Asset เป็น snapshot (relation = `null`) ไม่ใช่ option ใน master | Option criteria ไม่ match เลย; match ได้ผ่าน keyword criteria เท่านั้น จนกว่า Back Office promote/map alias แล้ว backfill relation id |

ตัวอย่าง:

- User ตั้ง alert `Rolex Daytona to ฿500,000` ตอนที่ไม่มี Daytona ลง Sale เลย → เป็น no current listing Alert ทำงานปกติ รอ match ในอนาคต
- User เคยเห็น Daytona ลง Sale แต่ราคาสูงกว่า ฿500,000 หมด เลยตั้ง alert `Rolex Daytona to ฿500,000` เพื่อรอของที่ตรงเงื่อนไขราคา → Alert ทำงานปกติ รอ match เมื่อมี Daytona ลง Sale ในราคาที่ต้องการ
- User ตั้ง alert `Rolex Daytona` แล้วภายหลัง `Daytona` ถูก deactivate ใน Market Data → เป็น inactive market data Alert เดิมยังเก็บ history แต่หยุด trigger ใหม่

## Match Rule

- Watch Alert match เฉพาะ Asset สถานะ Sale
- Asset สถานะ Show, Hide, Sold และ Deleted ต้องไม่ match
- Asset ต้องผ่าน visibility และ permission filtering เหมือน Search/Feed

## Notification Rule

- เมื่อพบ Asset Sale ที่ตรง criteria ระบบส่ง Watch Alert Notification
- Notification ต้องเปิด Watch Alert Result List
- Notification ห้ามเปิด Asset Detail โดยตรง

## Result List Rule

- Result List แสดง Asset Sale ที่ match criteria ของ Alert
- รองรับหลาย Asset ใน Alert เดียว
- User สามารถกด Asset Card จาก Result List เพื่อเปิด Asset Detail ได้
- ถ้าไม่มี result ให้ใช้ empty state กลาง

## Lifecycle Impact

| Asset Transition | Watch Alert Impact |
| --- | --- |
| Sale -> Sold | หายจาก Result ทันที |
| Sale -> Hide | หายจาก Result ทันที |
| Sale -> Show | หายจาก Result ทันที |
| Hide -> Sale | Match ได้ทันทีถ้าตรง criteria |
| Show -> Sale | Match ได้ทันทีถ้าตรง criteria |
| Deleted | หายจาก Result และ public surfaces |

## Block User Impact

- Asset ของ user ที่ถูก block หรือ block กันอยู่ต้องไม่ถูกนำมาคำนวณ Alert
- Asset ของผู้ถูก block ต้องหายจาก Watch Alert Result ทันที

## Update Rule

- เมื่อแก้ไข Alert ระบบต้องใช้ criteria ใหม่ทันที
- Result List หลังแก้ไขต้องอ้าง criteria ล่าสุด

## Delete Rule

- Delete Alert ต้องมี confirmation
- เมื่อลบแล้ว Alert ต้องหายจาก Watch Alert List
- Notification สำหรับ Alert นั้นต้องหยุดทันที

---

# 11. Permission Rules

| Actor | Permission |
| --- | --- |
| Guest | Create / Edit / Delete Watch Alert ไม่ได้ |
| Member | Create / Edit / Rename / Delete / Enable / Disable Alert ของตัวเองได้ |
| Other User | ไม่มีสิทธิ์เห็นหรือจัดการ Alert ของ user อื่น |
| Admin | ไม่จัดการผ่าน Front Office Watch Alert Module |

---

# 12. Validation Rules

| Field / Condition | Rule |
| --- | --- |
| Alert Name | Required at save time; trim แล้วต้องไม่ว่าง |
| Filter Condition | Optional |
| Notification Toggle | Optional |
| Criteria | ต้องใช้ schema เดียวกับ Search Filter |
| Keyword criteria | Optional; match บน snapshot text รวม free-text spec (relation = `null`) |
| Delete | ต้อง Confirm ก่อนลบ |
| Empty Alert Name | ต้องแสดง validation และไม่สร้าง Watch Alert |

---

# 13. Exception Handling

## Alert Not Found

- TH: `ไม่พบ Watch Alert`
- EN: `Watch Alert not found.`

## Save Failed

- TH: `ไม่สามารถบันทึกได้`
- EN: `Unable to save.`

## Delete Failed

- TH: `ไม่สามารถลบได้`
- EN: `Unable to delete.`

## Result Load Failed

- TH: `ไม่สามารถโหลดข้อมูลได้`
- EN: `Unable to load data.`
- Action: แสดงปุ่ม `ลองใหม่`

## Guest Required

- ใช้ Global Login Required Dialog

---

# 14. Empty State

ใช้ข้อความกลางตาม master:

| State | TH | EN |
| --- | --- | --- |
| No Alert | `ไม่พบข้อมูล` | `No data found` |
| No Result | `ไม่พบข้อมูล` | `No data found` |

---

# 15. Notification Rules

| Trigger | Recipient | Destination | Rule |
| --- | --- | --- | --- |
| New Asset Sale matches Alert criteria | Alert Owner | Watch Alert Result List | ห้ามเปิด Asset Detail โดยตรง |

Multiple matched assets ต้องแสดงรวมใน Watch Alert Result List ของ Alert นั้น

---

# 16. Analytics Events

- `watch_alert_create_started`
- `watch_alert_created`
- `watch_alert_edited`
- `watch_alert_renamed`
- `watch_alert_deleted`
- `watch_alert_notification_toggled`
- `watch_alert_opened`
- `watch_alert_result_opened`
- `watch_alert_result_asset_opened`
- `watch_alert_notification_opened`

---

# 17. Acceptance Criteria

## AC-WA-001: Create From Search Filter

Given Member อยู่ที่ Search Filter  
When Member กด Create Watch Alert  
Then ระบบต้องสร้าง Watch Alert จาก criteria ของ Search Filter

## AC-WA-002: Guest Restriction

Given user เป็น Guest  
When user กด Create Watch Alert  
Then ระบบต้องแสดง Global Login Required Dialog

## AC-WA-003: No Required Criteria

Given Member อยู่ใน Create Watch Alert flow  
When Member ไม่มี criteria หรือมี criteria เพียงบางส่วน  
Then ระบบยังต้องบันทึก Watch Alert ได้

## AC-WA-004: Generated Alert Name

Given Member เปิด Create / Save to Watch Alert modal  
When ระบบมี criteria จาก Search Filter ปัจจุบัน  
Then ระบบต้องเติมชื่อ Alert เริ่มต้นจาก criteria หรือ default name ลงในช่อง Alert Name ให้ก่อนบันทึก

## AC-WA-004A: Empty Alert Name Validation

Given Member ลบค่าในช่อง Alert Name จนว่าง  
When Member กด Save  
Then ระบบต้องไม่สร้าง Watch Alert และต้องแสดง validation ให้กรอกชื่อ Watch Alert

## AC-WA-005: Match Only Sale

Given มี Asset หลายสถานะที่ตรง criteria  
When ระบบคำนวณ Watch Alert  
Then ต้อง match เฉพาะ Asset สถานะ Sale  
And ต้องไม่ match Show, Hide, Sold หรือ Deleted

## AC-WA-006: Notification Opens Result List

Given Watch Alert มี match ใหม่  
When Member กด Watch Alert Notification  
Then ระบบต้องเปิด Watch Alert Result List  
And ต้องไม่เปิด Asset Detail โดยตรง

## AC-WA-007: Multiple Results

Given Alert เดียวมี Asset หลายรายการที่ match  
When Member เปิด Watch Alert Result List  
Then ระบบต้องแสดง Asset ที่ match ทั้งหมดที่ user มีสิทธิ์เห็น

## AC-WA-008: Asset Card Opens Detail From Result

Given Member อยู่ที่ Watch Alert Result List  
When Member กด Asset Card  
Then ระบบต้องเปิด Asset Detail ของ Asset นั้น

## AC-WA-009: Lifecycle Removal

Given Asset อยู่ใน Watch Alert Result เพราะเป็น Sale  
When Asset เปลี่ยนเป็น Sold, Hide หรือ Show  
Then Asset ต้องหายจาก Result List

## AC-WA-010: Lifecycle Add

Given Asset สถานะ Hide หรือ Show ตรง criteria  
When Asset เปลี่ยนเป็น Sale  
Then Asset สามารถ match Watch Alert ได้ทันที

## AC-WA-011: Delete Alert Stops Notification

Given Member ลบ Watch Alert และ confirm แล้ว  
When ระบบลบสำเร็จ  
Then Alert ต้องหายจาก Watch Alert List  
And ระบบต้องหยุด Notification ของ Alert นั้นทันที

## AC-WA-012: Block User Filtering

Given Member block user รายหนึ่ง  
When Watch Alert Result List โหลดผลลัพธ์  
Then Asset ของ user ที่ถูก block ต้องไม่แสดง

## AC-WA-013: Filter Logic Matches Search

Given Brand filter ถูกเลือกเป็น Rolex  
When Member เลือก Model filter ใน Watch Alert criteria  
Then Model list ต้องแสดงเฉพาะ model ของ Rolex เหมือน Search Module

## AC-WA-014: No Current Listing Criteria Allowed

Given Member เลือก Brand/Model/Reference หรือ option master ที่มีจำนวน Asset Sale = 0 ตอนนี้ (no current listing)  
When Member สร้าง Watch Alert จาก criteria นั้น  
Then ระบบต้องบันทึก Watch Alert ได้ และถือเป็น unmet demand ปกติ ไม่ใช่ inactive market data

## AC-WA-015: Inactive Market Data Stops New Trigger

Given Watch Alert ที่ criteria อ้าง Brand/Model/Reference ที่ถูก deactivate ใน Market Data (`is_active=false`)  
When ระบบตรวจสอบ criteria สำหรับ trigger ใหม่  
Then ระบบต้องหยุด trigger match ใหม่ตาม policy และแสดง dependency warning แต่ยังเก็บ alert/history เดิมได้

## AC-WA-016: Option Criteria Match Relation Id Only

Given Asset เก็บ spec เป็น free-text (relation = `null`) และ Alert ใช้ option criteria ที่ค่าสอดคล้องกันเชิงข้อความ
When ระบบคำนวณ Watch Alert
Then Asset นั้นต้องไม่ match option criteria จนกว่า Back Office promote/map alias แล้ว backfill relation id

## AC-WA-017: Keyword Criteria Covers Free-Text Spec

Given Member ตั้ง Watch Alert ด้วย keyword criteria และ Asset เก็บ spec เป็น free-text ที่ตรง keyword
When ระบบคำนวณ Watch Alert
Then Asset นั้นต้อง match ได้ตาม snapshot text เหมือน keyword search

## AC-WA-018: Backfill Re-Match With Dedup

Given Back Office promote suggestion เป็น option จริงหรือ map alias แล้ว backfill relation id ให้ Asset เดิม
When ระบบ re-run match evaluation
Then match ใหม่จาก backfill ต้องแจ้งเตือนตาม Notification Rule และต้อง dedup ด้วย (`alert_id`, `asset_id`) เพื่อไม่ให้ Asset ที่เคยแจ้งแล้วถูกแจ้งซ้ำ

---

# 18. Related Modules

- Search & Filter Module
- Notification Module
- Feed Module
- Asset Detail Module
- Asset Management Module
- Profile Module
- Trust & Safety Module

---

# 19. Future Enhancement

- Alert Frequency Setting
- Instant / Daily / Weekly digest controls
- Saved Search
- Market Price Alert
- Watch Price Alert
- Advanced alert ranking
