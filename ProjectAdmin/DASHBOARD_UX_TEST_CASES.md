# Dashboard UX Test Cases

## Scope

ตรวจเมนู Dashboard ของ BO prototype ให้ตรงกับ requirement ใน `BO_PRD.md` หัวข้อ 4.2 Dashboard และ requirement ที่เชื่อมกับ Reports / Board / Moderation

## Requirement Coverage

| Requirement | Expected UX | Current Status |
|---|---|---|
| แสดงผู้ใช้ใหม่ today / week / month | มี metric ผู้ใช้ใหม่วันนี้และผู้ใช้ใหม่สัปดาห์นี้ พร้อมตัวเลขเปรียบเทียบ | Pass |
| แสดง DAU / MAU | มี metric `DAU / MAU` บน Dashboard | Pass |
| แสดงสินทรัพย์ใหม่แยก status | มีกราฟสรุป `Sale`, `Collection Show`, `Collection Hide`, `Sold` | Pass |
| แสดง Offer made / accepted / declined | มี metric ข้อเสนอทั้งหมดวันนี้, รับข้อเสนอแล้ว, ปฏิเสธข้อเสนอ | Pass |
| แสดง reported content | มี section งานที่ต้องติดตาม แสดง Asset Reports, Reported Comments, Reported Chats, Support Tickets | Pass |
| แสดง Watch Alert active | มี metric `Watch Alert Active` | Pass |
| แสดงบทความล่าสุด | มี section `บทความล่าสุดบน Board` พร้อม status published / draft / scheduled | Pass |
| กรองข้อมูลตาม date range | มีปุ่ม วันนี้, 7 วัน, 30 วัน, กำหนดเอง และมี feedback เมื่อคลิก | Pass for prototype |
| เชื่อมกับ report module | มีปุ่ม `เปิด Reports` และ link ไป Reports จาก Search / Related Reports | Pass |
| ใช้งาน responsive | layout ใช้ grid/table responsive ตาม breakpoint ที่มีใน prototype | Pass for visual prototype |

## Functional Test Cases

| ID | Scenario | Steps | Expected Result |
|---|---|---|---|
| DB-001 | เปิด Dashboard | เปิด `bo-preview.html` แล้วอยู่หน้า Dashboard | เห็นหัวข้อแดชบอร์ด, metric หลัก, งานที่ต้องติดตาม, บทความล่าสุด และลิงก์รายงาน |
| DB-002 | เปลี่ยนช่วงข้อมูล | คลิก `วันนี้`, `7 วัน`, `30 วัน`, `กำหนดเอง` | ระบบแสดง toast แจ้งช่วงข้อมูลที่เลือก |
| DB-003 | ส่งออกรายงาน | คลิก `ส่งออกรายงาน` | เปิด modal ส่งออกรายงาน Dashboard และมีปุ่มส่งออก Excel |
| DB-004 | ไปหน้าสินทรัพย์ | คลิก `ดูสินทรัพย์` | เปลี่ยนไปหน้า Asset Management |
| DB-005 | ไปคิวตรวจสอบ | คลิก `เปิดคิวตรวจ` | เปลี่ยนไปหน้า Asset Management เพื่อดูรายการที่ต้องตรวจ |
| DB-006 | ดูกิจกรรมทั้งหมด | คลิก `ดูทั้งหมด` | เปลี่ยนไปหน้า Audit Log |
| DB-007 | ดูรายงาน Search | คลิก `รายงาน Search` | เปลี่ยนไปหน้า Reports & Analytics |
| DB-008 | จัดการ Board | คลิก `จัดการ Board` | เปลี่ยนไปหน้าเมนูจัดการกระดานข่าว |
| DB-009 | เปิด Reports | คลิก `เปิด Reports` | เปลี่ยนไปหน้า Reports & Analytics |
| DB-010 | ตรวจบนจอมือถือ | เปิดหน้าจอที่ความกว้างประมาณ 390px | sidebar / metrics / table ไม่ล้นจอ และปุ่มยังคลิกได้ |

## Test Data Alignment

ข้อมูล mock บน Dashboard ถูกจัดให้สอดคล้องกับข้อมูลที่ BO ต้องควบคุมฝั่ง FO:

| Data Area | Dashboard Data |
|---|---|
| Users | ผู้ใช้ใหม่วันนี้, ผู้ใช้ใหม่สัปดาห์นี้, DAU / MAU |
| Assets | สินทรัพย์ใหม่ตาม status และ Asset Reports |
| Offers | ข้อเสนอทั้งหมดวันนี้, รับข้อเสนอแล้ว, ปฏิเสธข้อเสนอ |
| Board | บทความ Published, Draft, Scheduled |
| Watch Alert | Watch Alert Active |
| Reports | User, Asset, Offer, Board, Search report links |
| Moderation | Reported Comments, Reported Chats, Support Tickets |

## Result

หลังปรับ prototype แล้ว Dashboard UX รองรับ requirement หลักของ BO_PRD หัวข้อ Dashboard ครบในระดับ clickable prototype. ส่วนที่ยังเป็น prototype คือข้อมูลยังเป็น mock data และ date range ยังแสดง feedback ไม่ได้ query backend จริง.
