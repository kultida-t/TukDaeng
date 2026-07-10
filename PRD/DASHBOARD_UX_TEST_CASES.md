# Dashboard UX Test Cases

## Scope

ตรวจเมนู Dashboard ของ BO prototype ให้ตรงกับ requirement ใน `BO_PRD.md` หัวข้อ 4.2 Dashboard และ requirement ที่เชื่อมกับ Reports / Board / Moderation

## Requirement Coverage

| Requirement | Expected UX | Current Status |
|---|---|---|
| แสดงผู้ใช้ใหม่ today / week / month | มี metric ผู้ใช้ใหม่วันนี้และผู้ใช้ใหม่สัปดาห์นี้ พร้อมตัวเลขเปรียบเทียบ | Pass |
| แสดง Active Users Today | มี metric `Active Users Today` บน Dashboard พร้อม Today / This Week / This Month chips | Pass |
| แสดงสินทรัพย์ใหม่แยก status | มีกราฟสรุป `Sale`, `Show`, `Hide`, `Sold` | Pass |
| แสดง Offer made / accepted / rejected | มี metric ข้อเสนอทั้งหมดวันนี้, รับข้อเสนอแล้ว, ปฏิเสธข้อเสนอ | Pass |
| แสดง reported content | มี section งานที่ต้องติดตาม แสดง Asset Reports, Reported Comments, Reported Chats, Support Tickets | Pass |
| แสดง Watch Alert active | มี metric `Watch Alert Active` | Pass |
| แสดงบทความล่าสุด | มี section `บทความล่าสุดบน Board` พร้อม status published / draft / scheduled | Pass |
| แสดงความสดใหม่ของข้อมูล | มี `Last updated` บน Dashboard header และไม่มี Date Range / Refresh / Export controls ตาม prototype ปัจจุบัน | Pass |
| เชื่อมกับ report module | มีปุ่ม `เปิด Reports` และ link ไป Reports จาก Search / Related Reports | Pass |
| ใช้งาน responsive | mobile/tablet/desktop รักษาลำดับ prototype แบบ Header -> KPI Summary -> Work Queue -> Recent Activity -> Dashboard Panels | Pass for visual prototype |

## Functional Test Cases

| ID | Scenario | Steps | Expected Result |
|---|---|---|---|
| DB-001 | เปิด Dashboard | เปิด `bo-preview.html` แล้วอยู่หน้า Dashboard | เห็นหัวข้อแดชบอร์ด, metric หลัก, งานที่ต้องติดตาม, บทความล่าสุด และลิงก์รายงาน |
| DB-002 | ตรวจ header Dashboard | เปิดหน้า Dashboard หลัง login | เห็น breadcrumb, ชื่อหน้า `Dashboard`, และ `Last updated`; ไม่เห็น Date Range, Refresh, Export, global search หรือ notification popup ใน header |
| DB-003 | ตรวจ export placement | เปิดหน้า Dashboard และดู header / action area | Dashboard ไม่มีปุ่ม export โดยตรง; งาน export/analytics อยู่ใน Reports module |
| DB-004 | ไปหน้าสินทรัพย์ | คลิก `ดูสินทรัพย์` | เปลี่ยนไปหน้า Asset Management |
| DB-005 | ไปคิวตรวจสอบ | คลิก `เปิดคิวตรวจ` | เปลี่ยนไปหน้า Asset Management เพื่อดูรายการที่ต้องตรวจ |
| DB-006 | ดูกิจกรรมทั้งหมด | คลิก `ดูทั้งหมด` | เปลี่ยนไปหน้า Audit Log |
| DB-007 | ดูรายงาน Search | คลิก `รายงาน Search` | เปลี่ยนไปหน้า Reports & Analytics |
| DB-008 | จัดการ Board | คลิก `จัดการ Board` | เปลี่ยนไปหน้าเมนูจัดการกระดานข่าว |
| DB-009 | เปิด Recent Activity | คลิกแถวใน `Recent Activity` | เปลี่ยนไป module/submodule ที่เกี่ยวข้องโดยตรง เช่น Reported Assets, Offer Queue, Articles หรือ Delivery Logs โดยไม่เปิด modal คั่นกลาง |
| DB-010 | เปิด Reports | คลิก `เปิด Reports` | เปลี่ยนไปหน้า Reports & Analytics |
| DB-011 | ตรวจบนจอมือถือ | เปิดหน้าจอที่ความกว้างประมาณ 390px | ลำดับหน้าเป็น Header -> KPI Summary -> Work Queue -> Recent Activity -> Dashboard Panels, ทุก section ไม่ล้นจอ และปุ่มยังคลิกได้ |

## Test Data Alignment

ข้อมูล mock บน Dashboard ถูกจัดให้สอดคล้องกับข้อมูลที่ BO ต้องควบคุมฝั่ง FO:

| Data Area | Dashboard Data |
|---|---|
| Users | ผู้ใช้ใหม่วันนี้, ผู้ใช้ใหม่สัปดาห์นี้, Active Users Today |
| Assets | สินทรัพย์ใหม่ตาม status และ Asset Reports |
| Offers | ข้อเสนอทั้งหมดวันนี้, รับข้อเสนอแล้ว, ปฏิเสธข้อเสนอ |
| Board | บทความ Published, Draft, Scheduled |
| Watch Alert | Watch Alert Active |
| Reports | User, Asset, Offer, Board, Search report links |
| Moderation | Reported Comments, Reported Chats, Support Tickets |

## Result

หลังปรับ prototype แล้ว Dashboard UX รองรับ requirement หลักของ BO_PRD หัวข้อ Dashboard ครบในระดับ clickable prototype. ส่วนที่ยังเป็น prototype คือข้อมูลยังเป็น mock data และ Dashboard ใช้ snapshot พร้อม `Last updated` โดยไม่มี Date Range / Refresh / Export controls ตามหน้าจอปัจจุบัน.
